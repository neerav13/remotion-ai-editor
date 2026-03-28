# Remotion AI Editor

Professional AI-powered video editing workflow using Remotion + Claude Code.

Edit, automate, and render professional videos entirely through Claude Code — no manual editing software needed. Supports YouTube (16:9), Shorts/TikTok (9:16), Instagram Reels (4:5), and fully branded client videos.

## Quick Start

### 1. Clone and install
git clone https://github.com/neerav13/remotion-ai-editor.git
cd remotion-ai-editor
npm install

### 2. Install Remotion AI Skills
npx skills add remotion-dev/skills

### 3. Add your media to public/clips/, public/audio/, public/images/

### 4. Preview
npm run dev

### 5. Start Claude Code
claude

## Prompting Claude Code

Claude Code reads CLAUDE.md automatically. Examples:

"Create a YouTube video with clip1.mp4 as hook (3s), clip2.mp4 as main content (2 min). Brand color #FF6B35."

"Add word-by-word TikTok captions to the shorts video"

"Make a client video for TechCorp with brand color #1A73E8 and DRAFT watermark"

"Render the YouTube video in high quality"

## Video Templates

- YouTubeVideo: 16:9, 1920x1080 - Long-form YouTube content
- ShortsVideo: 9:16, 1080x1920 - YouTube Shorts, TikTok, Reels
- InstagramReel: 4:5, 1080x1350 - Instagram Feed and Reels
- ClientVideo: 16:9, 1920x1080 - Client deliverables, branded content

## Render Commands

npm run render:youtube
npm run render:shorts
npm run render:instagram
npm run render:client
node scripts/render.mjs --template youtube --props projects/my-video.json
node scripts/render.mjs --template all --quality lossless

## Project Files

Define videos as JSON in projects/. See projects/example.json for a full working example.

## GitHub Actions

Trigger renders in the cloud: Actions tab > Render Video > Run workflow. Download from artifacts.

## Components

- IntroCard: Animated opening title card
- OutroCard: End screen with CTA button
- LowerThird: News-style sliding name bar
- CaptionTrack: Subtitle overlay
- WordByWordCaption: TikTok-style word captions
- AnimatedTitle: Full-screen title animation
- TransitionOverlay: Scene transitions (dip-black, dip-white, flash)
- Watermark: Draft/client watermark
- CallToAction: Animated CTA overlay

## Resources

- Remotion Docs: https://remotion.dev/docs
- Claude Code AI Prompting: https://remotion.dev/docs/ai/claude-code
- Agent Skills: https://remotion.dev/docs/ai/skills

MIT License
