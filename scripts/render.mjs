#!/usr/bin/env node
/**
 * ============================================================
 * REMOTION AI EDITOR — Render Script
 * ============================================================
 * Automates the full render pipeline for all video templates.
 * Claude Code can call this script directly via CLI.
 *
 * Usage:
 *   node scripts/render.mjs                          # interactive picker
 *   node scripts/render.mjs --template youtube       # YouTube video
 *   node scripts/render.mjs --template shorts        # Shorts/TikTok/Reels
 *   node scripts/render.mjs --template instagram     # Instagram Reel
 *   node scripts/render.mjs --template client        # Client video
 *   node scripts/render.mjs --template all           # Render all templates
 *   node scripts/render.mjs --template youtube --output ./out/my-video.mp4
 *   node scripts/render.mjs --template youtube --quality high
 *   node scripts/render.mjs --template youtube --props ./projects/my-project.json
 * ============================================================
 */

import { execSync, spawn } from 'child_process';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseArgs } from 'util';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ---- Parse CLI args ----
const { values: args } = parseArgs({
  args: process.argv.slice(2),
  options: {
    template: { type: 'string', short: 't', default: undefined },
    output: { type: 'string', short: 'o', default: undefined },
    quality: { type: 'string', short: 'q', default: 'high' },
    props: { type: 'string', short: 'p', default: undefined },
    concurrency: { type: 'string', short: 'c', default: '4' },
    help: { type: 'boolean', short: 'h', default: false },
  },
  strict: false,
});

if (args.help) {
  console.log(`
╔══════════════════════════════════════════════════════╗
║         REMOTION AI EDITOR — Render Script           ║
╠══════════════════════════════════════════════════════╣
║  --template, -t   Template: youtube|shorts|          ║
║                   instagram|client|all               ║
║  --output, -o     Output path (default: ./out/)      ║
║  --quality, -q    Quality: low|medium|high|lossless  ║
║  --props, -p      JSON file with composition props   ║
║  --concurrency,-c Parallel render threads (default 4)║
║  --help, -h       Show this help                     ║
╚══════════════════════════════════════════════════════╝
  `);
  process.exit(0);
}

// ---- Template map ----
const TEMPLATES = {
  youtube: {
    compositionId: 'YouTubeVideo',
    defaultOutput: 'out/youtube.mp4',
    description: 'YouTube Video (16:9 1080p)',
  },
  shorts: {
    compositionId: 'ShortsVideo',
    defaultOutput: 'out/shorts.mp4',
    description: 'Shorts/TikTok/Reels (9:16 1080p)',
  },
  instagram: {
    compositionId: 'InstagramReel',
    defaultOutput: 'out/instagram.mp4',
    description: 'Instagram Reel (4:5 1080p)',
  },
  client: {
    compositionId: 'ClientVideo',
    defaultOutput: 'out/client.mp4',
    description: 'Client Video (16:9 1080p)',
  },
};

// ---- Quality presets ----
const QUALITY = {
  low: '--crf 32 --jpeg-quality 50',
  medium: '--crf 22 --jpeg-quality 75',
  high: '--crf 18 --jpeg-quality 90',
  lossless: '--crf 0 --jpeg-quality 100',
};

// ---- Helper: render single template ----
async function renderTemplate(key) {
  const template = TEMPLATES[key];
  if (!template) {
    console.error(`❌ Unknown template: ${key}. Use: ${Object.keys(TEMPLATES).join(', ')}`);
    process.exit(1);
  }

  const output = args.output ?? template.defaultOutput;
  const quality = QUALITY[args.quality] ?? QUALITY.high;
  const concurrency = args.concurrency ?? '4';

  // Ensure output dir exists
  const outDir = resolve(ROOT, dirname(output));
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
    console.log(`📁 Created output directory: ${outDir}`);
  }

  // Build props flag
  let propsFlag = '';
  if (args.props) {
    const propsPath = resolve(process.cwd(), args.props);
    if (!existsSync(propsPath)) {
      console.error(`❌ Props file not found: ${propsPath}`);
      process.exit(1);
    }
    const propsJson = readFileSync(propsPath, 'utf-8');
    propsFlag = `--props '${propsJson.replace(/'/g, "\\'")}'`;
  }

  const cmd = [
    'npx', 'remotion', 'render',
    template.compositionId,
    resolve(ROOT, output),
    quality,
    `--concurrency ${concurrency}`,
    propsFlag,
  ].filter(Boolean).join(' ');

  console.log(`\n🎬 Rendering: ${template.description}`);
  console.log(`📤 Output: ${resolve(ROOT, output)}`);
  console.log(`⚙️  Quality: ${args.quality ?? 'high'}`);
  console.log(`🚀 Command: ${cmd}\n`);

  const startTime = Date.now();

  try {
    execSync(cmd, {
      cwd: ROOT,
      stdio: 'inherit',
      env: { ...process.env },
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Done! Rendered in ${elapsed}s → ${resolve(ROOT, output)}`);
  } catch (err) {
    console.error(`\n❌ Render failed for ${template.compositionId}`);
    console.error(err.message);
    process.exit(1);
  }
}

// ---- Main ----
async function main() {
  const template = args.template;

  if (!template) {
    console.log('🎬 Remotion AI Editor — Available templates:');
    Object.entries(TEMPLATES).forEach(([key, t]) => {
      console.log(`  ${key.padEnd(12)} → ${t.description}`);
    });
    console.log('\nUsage: node scripts/render.mjs --template <name>\n');
    process.exit(0);
  }

  if (template === 'all') {
    console.log('🎬 Rendering ALL templates...');
    for (const key of Object.keys(TEMPLATES)) {
      await renderTemplate(key);
    }
    console.log('\n🎉 All templates rendered successfully!');
  } else {
    await renderTemplate(template);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
