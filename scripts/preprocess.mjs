#!/usr/bin/env node
/**
 * ============================================================
 * REMOTION AI EDITOR — FFmpeg Preprocessing Pipeline
 * ============================================================
 * Handles everything that Remotion can't do natively:
 *   - Clip trimming (cut start/end timestamps)
 *   - Silence removal / jump cut generation
 *   - Audio normalization (LUFS targeting)
 *   - Speed ramping (2x, 0.5x, etc.)
 *   - Vertical-to-horizontal reframe (9:16 → 16:9)
 *   - Audio extraction from video
 *   - Clip list generation for Remotion props
 *
 * Claude Code can call this script directly.
 *
 * Usage:
 *   node scripts/preprocess.mjs --input raw/footage.mp4 --task trim --start 0:01:30 --end 0:05:45
 *   node scripts/preprocess.mjs --input raw/footage.mp4 --task silence-remove --threshold -35
 *   node scripts/preprocess.mjs --input raw/footage.mp4 --task normalize
 *   node scripts/preprocess.mjs --input raw/footage.mp4 --task speed --rate 1.5
 *   node scripts/preprocess.mjs --input raw/footage.mp4 --task reframe --target 16:9
 *   node scripts/preprocess.mjs --input raw/folder/ --task batch-trim --cuts cuts.json
 *   node scripts/preprocess.mjs --input raw/footage.mp4 --task extract-audio
 *   node scripts/preprocess.mjs --help
 * ============================================================
 */

import { execSync, spawnSync } from 'child_process';
import { existsSync, mkdirSync, readdirSync, writeFileSync, readFileSync } from 'fs';
import { resolve, dirname, basename, extname, join } from 'path';
import { fileURLToPath } from 'url';
import { parseArgs } from 'util';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ---- Verify FFmpeg is installed ----
function checkFFmpeg() {
  const result = spawnSync('ffmpeg', ['-version'], { encoding: 'utf-8' });
  if (result.error) {
    console.error('❌ FFmpeg not found. Install it: brew install ffmpeg (Mac) or apt install ffmpeg (Linux)');
    process.exit(1);
  }
  console.log('✅ FFmpeg found');
}

// ---- Parse CLI args ----
const { values: args } = parseArgs({
  args: process.argv.slice(2),
  options: {
    input: { type: 'string', short: 'i' },
    output: { type: 'string', short: 'o' },
    task: { type: 'string', short: 't' },
    start: { type: 'string', short: 's' },
    end: { type: 'string', short: 'e' },
    rate: { type: 'string', short: 'r' },
    threshold: { type: 'string' },
    target: { type: 'string' },
    cuts: { type: 'string' },
    lufs: { type: 'string', default: '-16' },
    help: { type: 'boolean', short: 'h', default: false },
  },
  strict: false,
});

if (args.help) {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║       REMOTION AI EDITOR — Preprocessing Script             ║
╠══════════════════════════════════════════════════════════════╣
║  --task trim          Cut clip: --start 0:01:30 --end 0:04  ║
║  --task silence-remove Remove silences (--threshold -35dB)  ║
║  --task normalize     Normalize audio to --lufs -16 LUFS    ║
║  --task speed         Speed up/slow down (--rate 1.5)       ║
║  --task reframe       Crop to aspect (--target 16:9)        ║
║  --task batch-trim    Use cuts JSON (--cuts cuts.json)       ║
║  --task extract-audio Extract audio track to MP3            ║
║  --input, -i          Input file or folder                  ║
║  --output, -o         Output path (auto-generated if omit)  ║
╚══════════════════════════════════════════════════════════════╝
  `);
  process.exit(0);
}

// ---- Helpers ----
function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function makeOutputPath(inputPath, suffix, ext) {
  const base = basename(inputPath, extname(inputPath));
  const dir = resolve(ROOT, 'public', 'clips');
  ensureDir(dir);
  return join(dir, `${base}_${suffix}.${ext ?? extname(inputPath).slice(1)}`);
}

function runFFmpeg(cmdArgs, description) {
  console.log(`\n🎬 ${description}`);
  const cmd = ['ffmpeg', '-y', ...cmdArgs].join(' ');
  console.log(`  $ ${cmd}\n`);
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`✅ Done`);
  } catch (err) {
    console.error(`❌ FFmpeg failed:`, err.message);
    process.exit(1);
  }
}

function timeToSeconds(time) {
  if (!time) return 0;
  const parts = time.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0];
}

// ---- Tasks ----

async function taskTrim(input, output, start, end) {
  const out = output ?? makeOutputPath(input, 'trim');
  const startSec = timeToSeconds(start);
  const endSec = timeToSeconds(end);
  const duration = endSec > 0 ? endSec - startSec : undefined;
  
  const cmdArgs = [
    '-ss', startSec,
    ...(duration ? ['-t', duration] : []),
    '-i', `"${input}"`,
    '-c:v', 'libx264',
    '-c:a', 'aac',
    '-avoid_negative_ts', 'make_zero',
    `"${out}"`,
  ];
  runFFmpeg(cmdArgs, `Trimming ${basename(input)} [${start ?? '0'} → ${end ?? 'end'}]`);
  console.log(`  Output: ${out}`);
  return out;
}

async function taskNormalize(input, output, lufs = '-16') {
  const out = output ?? makeOutputPath(input, 'norm');
  // Two-pass loudnorm
  console.log(`\n🎬 Analyzing loudness...`);
  const analyzeCmd = `ffmpeg -i "${input}" -af loudnorm=I=${lufs}:TP=-1.5:LRA=11:print_format=json -f null - 2>&1`;
  let analyzeResult;
  try {
    analyzeResult = execSync(analyzeCmd, { encoding: 'utf-8' });
  } catch (err) {
    analyzeResult = err.stderr ?? err.stdout ?? '';
  }
  
  // Extract loudnorm stats
  const jsonMatch = analyzeResult.match(/\{[^}]*"input_i"[^}]*\}/s);
  if (jsonMatch) {
    const stats = JSON.parse(jsonMatch[0]);
    runFFmpeg([
      '-i', `"${input}"`,
      '-af', `loudnorm=I=${lufs}:TP=-1.5:LRA=11:measured_I=${stats.input_i}:measured_LRA=${stats.input_lra}:measured_TP=${stats.input_tp}:measured_thresh=${stats.input_thresh}:offset=${stats.target_offset}:linear=true:print_format=summary`,
      '-c:v', 'copy',
      `"${out}"`,
    ], `Normalizing audio to ${lufs} LUFS`);
  } else {
    // Simple normalization fallback
    runFFmpeg([
      '-i', `"${input}"`,
      '-af', `loudnorm=I=${lufs}:TP=-1.5:LRA=11`,
      '-c:v', 'copy',
      `"${out}"`,
    ], `Normalizing audio to ${lufs} LUFS (simple pass)`);
  }
  console.log(`  Output: ${out}`);
  return out;
}

async function taskSpeed(input, output, rate = '1.5') {
  const out = output ?? makeOutputPath(input, `speed${rate}x`);
  const r = parseFloat(rate);
  
  // FFmpeg atempo only handles 0.5-2.0, chain for higher values
  let aFilter = '';
  if (r > 2) {
    aFilter = `atempo=2.0,atempo=${(r / 2).toFixed(3)}`;
  } else if (r < 0.5) {
    aFilter = `atempo=0.5,atempo=${(r / 0.5).toFixed(3)}`;
  } else {
    aFilter = `atempo=${r}`;
  }
  
  runFFmpeg([
    '-i', `"${input}"`,
    '-vf', `setpts=${(1/r).toFixed(4)}*PTS`,
    '-af', aFilter,
    '-c:v', 'libx264',
    '-c:a', 'aac',
    `"${out}"`,
  ], `Speed ramping to ${r}x (${r > 1 ? 'faster' : 'slower'})`);
  console.log(`  Output: ${out}`);
  return out;
}

async function taskSilenceRemove(input, output, threshold = '-35') {
  const out = output ?? makeOutputPath(input, 'nosilence');
  console.log(`\n🔍 Detecting silences in ${basename(input)} (threshold: ${threshold}dB)...`);
  
  // Detect silence timestamps
  const detectCmd = `ffmpeg -i "${input}" -af "silencedetect=noise=${threshold}dB:d=0.3" -f null - 2>&1`;
  let detectOutput;
  try {
    detectOutput = execSync(detectCmd, { encoding: 'utf-8' });
  } catch(e) {
    detectOutput = e.stderr ?? e.stdout ?? '';
  }
  
  // Parse silence regions
  const silenceStarts = [...detectOutput.matchAll(/silence_start: ([\d.]+)/g)].map(m => parseFloat(m[1]));
  const silenceEnds = [...detectOutput.matchAll(/silence_end: ([\d.]+)/g)].map(m => parseFloat(m[1]));
  
  if (silenceStarts.length === 0) {
    console.log(`  ℹ️  No silences detected (or audio is below threshold throughout)`);
    return input;
  }

  console.log(`  Found ${silenceStarts.length} silence regions`);
  
  // Build keeplist — segments between silences
  const keepSegments = [];
  let pos = 0;
  for (let i = 0; i < silenceStarts.length; i++) {
    if (silenceStarts[i] > pos + 0.1) {
      keepSegments.push({ start: pos, end: silenceStarts[i] });
    }
    pos = silenceEnds[i] ?? silenceStarts[i] + 0.3;
  }
  // Add final segment
  keepSegments.push({ start: pos, end: 999999 });
  
  console.log(`  Keeping ${keepSegments.length} segments`);
  
  // Write segments file
  const filterParts = keepSegments.map((seg, i) =>
    `[0:v]trim=start=${seg.start}:end=${seg.end},setpts=PTS-STARTPTS[v${i}];[0:a]atrim=start=${seg.start}:end=${seg.end},asetpts=PTS-STARTPTS[a${i}]`
  ).join(';');
  const concatInputs = keepSegments.map((_, i) => `[v${i}][a${i}]`).join('');
  const filterComplex = `${filterParts};${concatInputs}concat=n=${keepSegments.length}:v=1:a=1[outv][outa]`;
  
  runFFmpeg([
    '-i', `"${input}"`,
    '-filter_complex', `"${filterComplex}"`,
    '-map', '[outv]',
    '-map', '[outa]',
    '-c:v', 'libx264',
    '-c:a', 'aac',
    `"${out}"`,
  ], `Removing ${silenceStarts.length} silence regions → jump cuts`);
  
  // Output cut list for Remotion
  const cutListPath = out.replace(/\.\w+$/, '_cuts.json');
  writeFileSync(cutListPath, JSON.stringify({ segments: keepSegments, output: out }, null, 2));
  console.log(`  Cut list saved: ${cutListPath}`);
  console.log(`  Output: ${out}`);
  return out;
}

async function taskReframe(input, output, targetAspect = '16:9') {
  const out = output ?? makeOutputPath(input, `reframe_${targetAspect.replace(':', 'x')}`);
  
  // Parse aspect ratio
  const [tw, th] = targetAspect.split(':').map(Number);
  const scale = `iw:${Math.round}(iw*${th}/${tw})`;
  
  // Smart crop to target aspect (center crop)
  runFFmpeg([
    '-i', `"${input}"`,
    '-vf', `crop=in_w:in_w*${th}/${tw},scale=1920:${Math.round(1920 * th / tw)}`,
    '-c:v', 'libx264',
    '-c:a', 'copy',
    `"${out}"`,
  ], `Reframing to ${targetAspect} (center crop)`);
  console.log(`  Output: ${out}`);
  return out;
}

async function taskExtractAudio(input, output) {
  const out = output ?? makeOutputPath(input, 'audio', 'mp3');
  runFFmpeg([
    '-i', `"${input}"`,
    '-vn',
    '-acodec', 'libmp3lame',
    '-q:a', '2',
    `"${out}"`,
  ], `Extracting audio from ${basename(input)}`);
  console.log(`  Output: ${out}`);
  return out;
}

async function taskBatchTrim(input, cutsFile) {
  if (!cutsFile || !existsSync(cutsFile)) {
    console.error('❌ Cuts JSON file not found:', cutsFile);
    console.log(`
  Create a cuts.json file:
  [
    { "label": "hook",    "start": "0:00",  "end": "0:03" },
    { "label": "intro",   "start": "0:05",  "end": "0:30" },
    { "label": "section1","start": "1:00",  "end": "3:30" }
  ]`);
    process.exit(1);
  }
  
  const cuts = JSON.parse(readFileSync(cutsFile, 'utf-8'));
  const results = [];
  
  for (const cut of cuts) {
    const out = makeOutputPath(input, cut.label ?? `cut_${cuts.indexOf(cut)}`);
    await taskTrim(input, out, cut.start, cut.end);
    const durationFrames = Math.round((timeToSeconds(cut.end) - timeToSeconds(cut.start)) * 30);
    results.push({
      src: `./public/clips/${basename(out)}`,
      durationInFrames: durationFrames,
      label: cut.label ?? '',
    });
  }
  
  // Generate Remotion props snippet
  const propsPath = resolve(ROOT, 'projects', `cuts_${Date.now()}.json`);
  writeFileSync(propsPath, JSON.stringify({ scenes: results }, null, 2));
  console.log(`\n📋 Remotion scenes JSON saved to: ${propsPath}`);
  console.log(`  Copy the "scenes" array into your project file.`);
  
  return results;
}

// ---- Main ----
async function main() {
  console.log('\n🎬 Remotion AI Editor — Preprocessing Pipeline\n');
  checkFFmpeg();
  
  const { input, output, task, start, end, rate, threshold, target, cuts, lufs } = args;
  
  if (!input) {
    console.error('❌ --input is required');
    process.exit(1);
  }
  
  if (!existsSync(input)) {
    console.error(`❌ Input not found: ${input}`);
    process.exit(1);
  }
  
  switch (task) {
    case 'trim':
      await taskTrim(input, output, start, end);
      break;
    case 'normalize':
      await taskNormalize(input, output, lufs);
      break;
    case 'speed':
      await taskSpeed(input, output, rate);
      break;
    case 'silence-remove':
      await taskSilenceRemove(input, output, threshold);
      break;
    case 'reframe':
      await taskReframe(input, output, target);
      break;
    case 'extract-audio':
      await taskExtractAudio(input, output);
      break;
    case 'batch-trim':
      await taskBatchTrim(input, cuts);
      break;
    default:
      console.log(`
Available tasks:
  trim           Cut a specific time range from a clip
  normalize      Normalize audio loudness
  speed          Speed up or slow down a clip
  silence-remove Remove silences / generate jump cuts
  reframe        Crop to a different aspect ratio
  extract-audio  Pull audio out as MP3
  batch-trim     Cut multiple clips using a JSON cuts file

Run with --help for full usage.`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
