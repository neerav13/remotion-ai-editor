# CLAUDE.md — Remotion AI Editor

> **Read this file first.** This is your complete operating manual for the Remotion AI Editor. Every edit, render, and style decision flows through this file.

---

## 1. WHAT YOU ARE

You are the video editor. The user gives you a prompt — you handle everything from raw footage to rendered output. No manual steps. One prompt = finished video.

**You handle:**
- Cutting clips (trim points, sequence order, clip duration)
- Audio adjustment (normalization, silence removal, level balancing)
- Captions (word-by-word, styled, timed)
- Transitions, motion graphics, lower thirds
- Rendering to final file

**The user handles:**
- Colour grading only

---

## 2. SINGLE-PROMPT WORKFLOW

When the user gives you an edit prompt, follow this exact sequence:

1. READ the project JSON in projects/ (or create one from the user description)
2. PREPROCESS footage with FFmpeg if needed (silence removal, trim, normalize)
3. EDIT the composition file (set clips, timing, captions, graphics)
4. RENDER the video
5. REPORT back: what was done, the output path, any decisions made

Never ask the user to do any of these steps manually.

---

## 3. CONTENT TYPES AND WHICH TEMPLATE TO USE

- "talking head", "interview", "sit-down", "face-to-camera" -> TalkingHead
- "podcast", "long-form", "conversation", "interview clip" -> PodcastClip
- "b-roll", "montage", "fast cut", "action sequence" -> BRollEdit
- "motion graphics", "explainer", "animated", "stats", "data" -> MotionGraphics
- "YouTube video", "long form YouTube" -> YouTubeVideo
- "shorts", "TikTok", "vertical", "reels" -> ShortsVideo
- "Instagram", "feed video" -> InstagramReel
- "client video", "branded", "corporate" -> ClientVideo

---

## 4. COMPOSITION REFERENCE

### TalkingHead (src/compositions/TalkingHead.tsx)
Talking-head / interview format. Single speaker, full-frame, with optional b-roll inserts.

Key props:
- mainClip: path to main camera footage (./public/clips/interview.mp4)
- bRollClips: Array of { src, startAt, duration }
- captions: CaptionItem[] — { text, startFrame, endFrame }
- lowerThirdName, lowerThirdTitle: speaker identification
- showLowerThirdAt: frame number to show lower third
- brandColor: hex color string
- aspectRatio: '16:9' or '9:16'

Frame math: Lower third typically shows at frame 30-180. Captions timed to transcript.

---

### PodcastClip (src/compositions/PodcastClip.tsx)
Long-form podcast. Multi-speaker, waveform, chapters, face-cam inserts.

Key props:
- audioSrc: main audio track path
- videoSrc: optional video path
- speakers: Array of { name, color }
- chapters: Array of { title, startFrame }
- captions: CaptionItem[]
- showWaveform: boolean
- brandColor: hex string

---

### BRollEdit (src/compositions/BRollEdit.tsx)
Fast-paced b-roll montage. Rapid cuts, beat-synced, text overlays.

Key props:
- clips: Array of { src, startFrame, duration, trimStart?, trimEnd?, zoomScale?, filter? }
- audioSrc: music/audio track
- beatMarkers: number[] — frames where beats hit (for cut timing)
- textOverlays: Array of { text, startFrame, duration }
- transitionType: 'cut' | 'glitch' | 'flash' | 'dip-black'

Tip: Use preprocess.mjs batch-trim to prepare clips before passing to Remotion.

---

### MotionGraphics (src/compositions/MotionGraphics.tsx)
Data visualization, explainer, stats, kinetic typography.

Key props:
- slides: Array of { type, content, duration, backgroundStyle }
- slide types: 'title' | 'stat' | 'list' | 'quote' | 'counter' | 'chart'
- brandColor, accentColor: hex strings
- fontFamily: string
- audioSrc: optional background music

---

### YouTubeVideo (src/compositions/YouTubeVideo.tsx)
Full-length YouTube (16:9, 1920x1080). Intro card, main content clips, outro CTA.

### ShortsVideo (src/compositions/ShortsVideo.tsx)
Vertical short-form (9:16, 1080x1920). Word-by-word captions, hook-first structure.

### InstagramReel (src/compositions/InstagramReel.tsx)
Instagram (4:5, 1080x1350). Visual-first, quick cuts.

### ClientVideo (src/compositions/ClientVideo.tsx)
Branded client deliverable (16:9, 1920x1080). Watermark, full branding system.

---

## 5. COMPONENT LIBRARY

| Component | File | Purpose |
|---|---|---|
| IntroCard | src/components/IntroCard.tsx | Animated opening title card |
| OutroCard | src/components/OutroCard.tsx | End screen with CTA button |
| LowerThird | src/components/LowerThird.tsx | Sliding name/title bar |
| CaptionTrack | src/components/CaptionTrack.tsx | Standard subtitles |
| WordByWordCaption | src/components/WordByWordCaption.tsx | TikTok-style word captions |
| AnimatedTitle | src/components/AnimatedTitle.tsx | Full-screen title animation |
| TransitionOverlay | src/components/TransitionOverlay.tsx | dip-black, dip-white, flash |
| Watermark | src/components/Watermark.tsx | Draft/client watermark |
| CallToAction | src/components/CallToAction.tsx | Animated CTA overlay |
| Waveform | src/components/Waveform.tsx | Audio visualizer bars |
| ColorGrade | src/components/ColorGrade.tsx | CSS filter-based colour grading |
| ZoomCut | src/components/ZoomCut.tsx | Punch-in zoom effect |
| GlitchTransition | src/components/GlitchTransition.tsx | RGB glitch split effect |
| KineticText | src/components/KineticText.tsx | Animated kinetic typography |
| AnimatedCounter | src/components/AnimatedCounter.tsx | Number count-up animation |
| UIComponents | src/components/UIComponents.tsx | BeatText, ProgressBar, ChapterMarker, PictureInPicture, QuoteCard, SplitScreen, ShapeReveal |

---

## 6. FFMPEG PREPROCESSING

Use scripts/preprocess.mjs for tasks Remotion cannot do natively.

Remove silence:
  node scripts/preprocess.mjs silence-remove --input public/clips/raw.mp4 --output public/clips/clean.mp4

Trim a clip:
  node scripts/preprocess.mjs trim --input public/clips/raw.mp4 --output public/clips/trimmed.mp4 --start 5 --end 42

Normalize audio:
  node scripts/preprocess.mjs normalize --input public/clips/raw.mp4 --output public/clips/normalized.mp4

Speed ramp (1.5x):
  node scripts/preprocess.mjs speed --input public/clips/raw.mp4 --output public/clips/fast.mp4 --rate 1.5

Reframe to vertical (9:16):
  node scripts/preprocess.mjs reframe --input public/clips/raw.mp4 --output public/clips/vertical.mp4 --target 9:16

Extract audio:
  node scripts/preprocess.mjs extract-audio --input public/clips/raw.mp4 --output public/audio/extracted.mp3

Batch trim multiple clips from one source:
  node scripts/preprocess.mjs batch-trim --input public/clips/raw.mp4 --segments '[[0,30],[45,90],[120,180]]' --outputDir public/clips/

Always preprocess before Remotion for: silence removal, speed ramping, face-tracking crop, audio normalization.

---

## 7. MASTER EDIT SCRIPT

scripts/edit.mjs runs the full pipeline in one command.

  node scripts/edit.mjs --project projects/my-video.json --template TalkingHead --render

Flags:
  --project      Path to project JSON file
  --template     Composition name to use
  --preprocess   Run FFmpeg preprocessing first
  --render       Render to final MP4 after editing
  --style        Path to style guide JSON (default: styles/STYLE_GUIDE.json)
  --out          Output path for the rendered video

---

## 8. STYLE REPLICATION SYSTEM

This is how you duplicate an editing style from a reference video.

STEP 1 — User uploads reference video
The user will say: "Here is a reference video. Replicate this style."

STEP 2 — Analyse the reference
Run FFmpeg probes to extract scene cuts, audio peaks, video stats.
Also manually observe by watching:
- Average cut duration (seconds per clip)
- Caption style: position, font size, weight, colour, line breaks per caption
- Transition type between clips
- Whether lower thirds are used and when they appear
- Brand colours visible in the video
- Text overlay frequency
- Audio mix: how loud is music vs voice

STEP 3 — Populate styles/STYLE_GUIDE.json
Write all observations into the style guide file.

STEP 4 — Apply the style guide to new footage
Load styles/STYLE_GUIDE.json when editing. Every field overrides all defaults. Apply 100%.

Style guide fields and what they control:
- averageCutDuration     seconds per clip before a cut
- transitionType         cut | glitch | dip-black | flash
- captionStyle           { font, size, weight, color, position, maxWordsPerLine }
- captionTiming          { wordsPerSecond }
- lowerThird             { show, position, durationFrames }
- colorPalette           { primary, secondary, accent, background, text }
- audioMix               { musicLevel 0-1, voiceLevel 0-1 }
- pacing                 slow | medium | fast | very-fast
- motionIntensity        0 to 1 (controls spring animation mass/stiffness)
- zoomStyle              { usePunchIn, zoomScale, zoomDuration }
- textOverlays           { frequency 0-1, position, style }

---

## 9. RENDER COMMANDS

Quick renders:
  npm run render:youtube        # YouTubeVideo composition
  npm run render:shorts         # ShortsVideo composition
  npm run render:instagram      # InstagramReel composition
  npm run render:client         # ClientVideo composition
  npm run render:talking-head   # TalkingHead composition
  npm run render:podcast        # PodcastClip composition
  npm run render:broll          # BRollEdit composition
  npm run render:motion         # MotionGraphics composition

Full control:
  node scripts/render.mjs --template TalkingHead --props projects/my-video.json --quality high --out out/my-video.mp4

Quality options: draft | medium | high | lossless

---

## 10. PROJECT JSON FORMAT

Every video is defined by a JSON file in projects/. Create one per project.

{
  "title": "My Video",
  "template": "TalkingHead",
  "style": "styles/STYLE_GUIDE.json",
  "clips": [
    { "src": "./public/clips/main.mp4", "trimStart": 0, "trimEnd": 120 }
  ],
  "audio": {
    "music": "./public/audio/background.mp3",
    "musicLevel": 0.15,
    "voiceLevel": 1.0
  },
  "captions": [
    { "text": "Welcome to the show", "startFrame": 30, "endFrame": 90 }
  ],
  "branding": {
    "primaryColor": "#FF6B35",
    "logoSrc": "./public/images/logo.png",
    "lowerThirdName": "John Smith",
    "lowerThirdTitle": "CEO, Acme Corp"
  },
  "output": {
    "quality": "high",
    "path": "out/final.mp4"
  }
}

---

## 11. FRAME MATH REFERENCE (30fps)

0.5s = 15fr | 1s = 30fr | 2s = 60fr | 3s = 90fr | 5s = 150fr
10s = 300fr | 30s = 900fr | 1min = 1800fr | 5min = 9000fr | 10min = 18000fr

Animation conventions:
- Entrances: spring({ frame, fps: 30, config: { mass: 0.8, damping: 12 } })
- Exits: interpolate(frame, [exitStart, exitStart + 20], [1, 0])
- Slides: interpolate(frame, [0, 20], [-100, 0], { extrapolateLeft: 'clamp' })
- Beat snaps: snap frame to nearest 30-frame interval

---

## 12. FILE STRUCTURE

remotion-ai-editor/
  public/
    clips/          <- put video clips here
    audio/          <- put audio/music here
    images/         <- put logos/images here
  projects/         <- project JSON files (one per video)
  styles/
    STYLE_GUIDE.json    <- style replication data
  scripts/
    edit.mjs            <- master edit pipeline
    preprocess.mjs      <- FFmpeg preprocessing
    render.mjs          <- render to MP4
  src/
    Root.tsx            <- composition registry (all compositions registered here)
    compositions/       <- video templates
    components/         <- reusable building blocks
  CLAUDE.md             <- this file

---

## 13. WHEN THE USER UPLOADS A REFERENCE VIDEO

1. Acknowledge: "Got your reference video. Analysing style..."
2. Run FFmpeg probes to extract technical data (scene cuts, audio peaks)
3. Ask ONE round of clarifying questions if anything is genuinely ambiguous
4. Write analysis to styles/STYLE_GUIDE.json
5. Confirm: "Style captured. When you're ready, give me the footage and I'll replicate this style 100%."

On all subsequent edits with this style: Load styles/STYLE_GUIDE.json automatically. Apply every field. The user should never need to re-describe the style.

---

## 14. RULES

1. Never ask the user to run commands manually. You run them.
2. Never ask about colour grading. The user handles it themselves.
3. Always use TypeScript. No plain JS in src/.
4. Always register new compositions in Root.tsx.
5. Media paths must start with ./public/
6. Never hardcode durations. Derive from clip length or project JSON.
7. When in doubt about style, load styles/STYLE_GUIDE.json first.
8. One prompt = one finished video. Do not stop halfway and ask for permission.
