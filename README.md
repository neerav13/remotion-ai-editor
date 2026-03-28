{
  "_comment": "Example YouTube video project. Copy this file to create a new project.",
  "_template": "YouTubeVideo",
  "_renderCommand": "node scripts/render.mjs --template youtube --props projects/example.json",

  "title": "How to Build an AI Video Editing Workflow",
  "creator": "Your Channel Name",

  "accentColor": "#FF6B35",
  "showIntro": true,
  "showOutro": true,
  "introDuration": 90,
  "outroDuration": 150,
  "ctaText": "Subscribe for more AI tutorials!",
  "musicVolume": 0.12,

  "scenes": [
    {
      "src": "./public/clips/hook.mp4",
      "durationInFrames": 90,
      "label": "Hook"
    },
    {
      "src": "./public/clips/intro.mp4",
      "durationInFrames": 180,
      "label": "Introduction"
    },
    {
      "src": "./public/clips/section1.mp4",
      "durationInFrames": 300,
      "label": "Setting Up Remotion",
      "volume": 0.9
    },
    {
      "src": "./public/clips/section2.mp4",
      "durationInFrames": 420,
      "label": "Building Compositions"
    },
    {
      "src": "./public/clips/section3.mp4",
      "durationInFrames": 360,
      "label": "Automating with Claude Code"
    },
    {
      "src": "./public/clips/outro.mp4",
      "durationInFrames": 120
    }
  ],

  "captions": [
    { "text": "What if AI could edit your videos?", "from": 0, "to": 60 },
    { "text": "Today we're building the full automated workflow.", "from": 60, "to": 120 },
    { "text": "Let me show you exactly how to set this up.", "from": 180, "to": 240 },
    { "text": "First, install Remotion with npx create-video@latest", "from": 270, "to": 360 },
    { "text": "Then run 'npm run dev' to start the preview.", "from": 360, "to": 420 },
    { "text": "Now open Claude Code in the project folder.", "from": 810, "to": 900 },
    { "text": "Prompt Claude to create any composition you need.", "from": 900, "to": 990 }
  ]
}
