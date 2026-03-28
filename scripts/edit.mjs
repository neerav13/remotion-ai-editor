#!/usr/bin/env node
/**
 * ============================================================
 * REMOTION AI EDITOR — Master Edit Script (edit.mjs)
 * ============================================================
 * This is the single entry point for the entire editing workflow.
 * Claude Code calls this script after building the project file.
 *
 * What it does in order:
 *   1. Validates that all referenced clips exist
 *   2. Runs FFmpeg preprocessing (normalize, silence-remove if requested)
 *   3. Verifies the project JSON props
 *   4. Renders the composition via Remotion
 *   5. Reports output path and file size
 *
 * Usage (Claude Code calls this directly):
 *   node scripts/edit.mjs --project projects/my-video.json --template youtube
 *   node scripts/edit.mjs --project projects/my-video.json --template youtube --preprocess
 *   node scripts/edit.mjs --project projects/my-video.json --template talking-head --style styles/STYLE_GUIDE.json
 *   node scripts/edit.mjs --project projects/my-video.json --template broll --quality high
 *
 * Claude Code Prompt Examples:
 *   "Edit my talking head video. Raw footage: raw/interview.mp4. Cut at 0:10, 2:30, 5:15.
 *    Remove silences. Use my style guide. Render 1080p."
 *
 *   "Create a short video for Instagram from raw/footage.mp4.
 *    Add word-by-word captions. Brand color #FF6B35. Render."
 * ============================================================
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, statSync, writeFileSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { parseArgs } from 'util';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const { values: args } = parseArgs({
  args: process.argv.slice(2),
  options: {
    project: { type: 'string', short: 'p' },
    template: { type: 'string', short: 't', default: 'youtube' },
    style: { type: 'string', short: 's' },
    quality: { type: 'string', short: 'q', default: 'high' },
    output: { type: 'string', short: 'o' },
    preprocess: { type: 'boolean', default: false },
    'no-render': { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
  strict: false,
});

if (args.help) {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║          REMOTION AI EDITOR — Master Edit Script              ║
╠═══════════════════════════════════════════════════════════════╣
║  --project, -p    Project JSON file (required)                ║
║  --template, -t   youtube|shorts|instagram|client|            ║
║                   talking-head|podcast|broll|motion-graphics  ║
║  --style, -s      Style guide JSON to apply                   ║
║  --quality, -q    low|medium|high|lossless                    ║
║  --output, -o     Output path                                 ║
║  --preprocess     Run FFmpeg preprocessing before render      ║
║  --no-render      Build project only, skip render             ║
╚═══════════════════════════════════════════════════════════════╝
  `);
  process.exit(0);
}

// ---- Template map ----
const TEMPLATE_MAP = {
  youtube: 'YouTubeVideo',
  shorts: 'ShortsVideo',
  instagram: 'InstagramReel',
  client: 'ClientVideo',
  'talking-head': 'TalkingHead',
  podcast: 'PodcastClip',
  broll: 'BRollEdit',
  'motion-graphics': 'MotionGraphics',
};

// ---- Helpers ----
function formatSize(bytes) {
  if (bytes > 1e9) return (bytes / 1e9).toFixed(1) + ' GB';
  if (bytes > 1e6) return (bytes / 1e6).toFixed(1) + ' MB';
  return (bytes / 1e3).toFixed(0) + ' KB';
}

function applyStyleGuide(projectProps, styleGuidePath) {
  if (!styleGuidePath || !existsSync(styleGuidePath)) return projectProps;
  
  const style = JSON.parse(readFileSync(styleGuidePath, 'utf-8'));
  console.log(`\n🎨 Applying style guide: ${basename(styleGuidePath)}`);
  
  const merged = { ...projectProps };
  
  // Apply style guide rules
  if (style.colorGrade?.preset && !merged.gradePreset) {
    merged.gradePreset = style.colorGrade.preset;
    console.log(`  Color grade: ${style.colorGrade.preset}`);
  }
  
  if (style.captions?.style && !merged.captionStyle) {
    merged.captionStyle = style.captions.style;
    console.log(`  Caption style: ${style.captions.style}`);
  }
  
  if (style.typography?.accentColor && !merged.accentColor) {
    merged.accentColor = style.typography.accentColor;
    console.log(`  Accent color: ${style.typography.accentColor}`);
  }
  
  if (style.audio?.musicVolume !== undefined && merged.musicVolume === undefined) {
    merged.musicVolume = style.audio.musicVolume;
    console.log(`  Music volume: ${style.audio.musicVolume}`);
  }
  
  if (style.structure?.hasIntro !== undefined && merged.showIntro === undefined) {
    merged.showIntro = style.structure.hasIntro;
  }
  
  if (style.structure?.hasOutro !== undefined && merged.showOutro === undefined) {
    merged.showOutro = style.structure.hasOutro;
  }
  
  if (style.structure?.introDurationSeconds && !merged.introDuration) {
    merged.introDuration = Math.round(style.structure.introDurationSeconds * 30);
    console.log(`  Intro duration: ${style.structure.introDurationSeconds}s`);
  }

  if (style.layout?.showProgressBar !== undefined && merged.showProgressBar === undefined) {
    merged.showProgressBar = style.showProgressBar;
  }
  
  return merged;
}

function validateClips(projectProps) {
  const clips = projectProps.scenes ?? projectProps.clips ?? [];
  const missing = [];
  
  for (const clip of clips) {
    const src = clip.src ?? clip.audioSrc;
    if (!src) continue;
    const absPath = resolve(ROOT, src.replace('./', ''));
    if (!existsSync(absPath)) {
      missing.push(src);
    }
  }
  
  if (missing.length > 0) {
    console.warn(`\n⚠️  Missing clips (will show as black frames):`);
    missing.forEach(m => console.warn(`  - ${m}`));
  } else {
    console.log(`\n✅ All clips found (${clips.length} total)`);
  }
  
  return missing;
}

async function runPreprocessing(projectProps) {
  const clips = projectProps.scenes ?? projectProps.clips ?? [];
  const normalizeAudio = projectProps.normalizeAudio ?? true;
  const removeSilences = projectProps.removeSilences ?? false;
  
  if (!normalizeAudio && !removeSilences) return projectProps;
  
  console.log(`\n🔧 Running preprocessing...`);
  
  const processedClips = [];
  for (const clip of clips) {
    let src = clip.src;
    if (!src) { processedClips.push(clip); continue; }
    
    let currentSrc = src;
    
    if (removeSilences && clip.removeSilences !== false) {
      console.log(`  Removing silences from ${basename(src)}...`);
      try {
        execSync(
          `node scripts/preprocess.mjs --input "${resolve(ROOT, src.replace('./', ''))}" --task silence-remove --threshold ${projectProps.silenceThresholdDB ?? -35}`,
          { cwd: ROOT, stdio: 'inherit' }
        );
        const newSrc = src.replace(/\.\w+$/, '_nosilence.mp4');
        if (existsSync(resolve(ROOT, newSrc.replace('./', '')))) {
          currentSrc = newSrc;
        }
      } catch(e) {
        console.warn(`  ⚠️  Silence removal failed for ${basename(src)}, using original`);
      }
    }
    
    if (normalizeAudio) {
      console.log(`  Normalizing audio: ${basename(currentSrc)}...`);
      try {
        execSync(
          `node scripts/preprocess.mjs --input "${resolve(ROOT, currentSrc.replace('./', ''))}" --task normalize --lufs ${projectProps.targetLUFS ?? -16}`,
          { cwd: ROOT, stdio: 'inherit' }
        );
        const normSrc = currentSrc.replace(/\.\w+$/, '_norm.mp4');
        if (existsSync(resolve(ROOT, normSrc.replace('./', '')))) {
          currentSrc = normSrc;
        }
      } catch(e) {
        console.warn(`  ⚠️  Normalization failed for ${basename(currentSrc)}, using original`);
      }
    }
    
    processedClips.push({ ...clip, src: currentSrc });
  }
  
  return { ...projectProps, scenes: processedClips };
}

// ---- Main ----
async function main() {
  const startTime = Date.now();
  
  console.log(`
╔════════════════════════════════════════╗
║     REMOTION AI EDITOR — Edit          ║
╚════════════════════════════════════════╝`);

  if (!args.project) {
    console.error('❌ --project is required. Example: node scripts/edit.mjs --project projects/my-video.json');
    process.exit(1);
  }

  const projectPath = resolve(ROOT, args.project);
  if (!existsSync(projectPath)) {
    console.error(`❌ Project file not found: ${projectPath}`);
    process.exit(1);
  }

  // Load project
  let projectProps = JSON.parse(readFileSync(projectPath, 'utf-8'));
  // Strip comment keys
  for (const key of Object.keys(projectProps)) {
    if (key.startsWith('_')) delete projectProps[key];
  }
  
  console.log(`\n📋 Project: ${projectProps.title ?? basename(projectPath)}`);
  console.log(`🎬 Template: ${args.template}`);

  // Apply style guide
  if (args.style) {
    projectProps = applyStyleGuide(projectProps, resolve(ROOT, args.style));
  }

  // Validate clips
  validateClips(projectProps);

  // Preprocessing
  if (args.preprocess) {
    projectProps = await runPreprocessing(projectProps);
    // Save preprocessed props
    const preprocessedPath = projectPath.replace('.json', '_preprocessed.json');
    writeFileSync(preprocessedPath, JSON.stringify(projectProps, null, 2));
    console.log(`\n💾 Preprocessed project saved: ${preprocessedPath}`);
  }

  if (args['no-render']) {
    console.log(`\n✅ Project ready (--no-render flag set, skipping render)`);
    return;
  }

  // Render
  const compositionId = TEMPLATE_MAP[args.template];
  if (!compositionId) {
    console.error(`❌ Unknown template: ${args.template}`);
    console.log(`Available: ${Object.keys(TEMPLATE_MAP).join(', ')}`);
    process.exit(1);
  }

  const outputPath = args.output ?? `out/${args.template}_${Date.now()}.mp4`;
  const propsJson = JSON.stringify(projectProps);
  
  const qualityMap = {
    low: '--crf 32',
    medium: '--crf 22',
    high: '--crf 18',
    lossless: '--crf 0',
  };
  const qualityFlag = qualityMap[args.quality ?? 'high'] ?? qualityMap.high;

  console.log(`\n🚀 Rendering ${compositionId}...`);
  console.log(`   Quality: ${args.quality ?? 'high'}`);
  console.log(`   Output:  ${outputPath}\n`);

  const renderCmd = [
    'npx', 'remotion', 'render',
    compositionId,
    outputPath,
    qualityFlag,
    '--concurrency', '4',
    `--props '${propsJson.replace(/'/g, "\\'")}'`,
  ].join(' ');

  try {
    execSync(renderCmd, { cwd: ROOT, stdio: 'inherit' });
  } catch(err) {
    console.error(`\n❌ Render failed:`, err.message);
    process.exit(1);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const absOutput = resolve(ROOT, outputPath);
  
  if (existsSync(absOutput)) {
    const size = formatSize(statSync(absOutput).size);
    console.log(`\n✅ Done in ${elapsed}s  →  ${absOutput}  [${size}]`);
  } else {
    console.log(`\n✅ Done in ${elapsed}s`);
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
