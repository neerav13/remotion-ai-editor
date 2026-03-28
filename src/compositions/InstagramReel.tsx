import React from 'react';
import { AbsoluteFill, Audio, Sequence, Video, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { WordByWordCaption } from '../components/WordByWordCaption';
import { AnimatedTitle } from '../components/AnimatedTitle';

// ============================================================
// InstagramReel Composition
// 4:5 | 1080x1350 | 30fps — for Instagram Feed + Reels
// ============================================================

export type ReelScene = {
  src: string;
  durationInFrames: number;
  startFrom?: number;
  volume?: number;
};

export type InstagramReelProps = {
  title: string;
  handle: string;
  scenes: ReelScene[];
  wordCaptions: Array<{ word: string; from: number; to: number }>;
  musicSrc?: string;
  musicVolume: number;
  accentColor: string;
  overlayOpacity: number;
};

export const defaultInstagramProps: InstagramReelProps = {
  title: 'Instagram Reel',
  handle: '@yourhandle',
  scenes: [
    { src: './public/clips/reel1.mp4', durationInFrames: 90 },
    { src: './public/clips/reel2.mp4', durationInFrames: 120 },
  ],
  wordCaptions: [],
  musicSrc: undefined,
  musicVolume: 0.1,
  accentColor: '#E1306C',
  overlayOpacity: 0.3,
};

export const InstagramReel: React.FC<InstagramReelProps> = ({
  title,
  handle,
  scenes,
  wordCaptions,
  musicSrc,
  musicVolume,
  accentColor,
  overlayOpacity,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  let currentStart = 0;
  const sceneWithOffsets = scenes.map((scene) => {
    const start = currentStart;
    currentStart += scene.durationInFrames;
    return { ...scene, start };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {musicSrc && <Audio src={musicSrc} volume={musicVolume} loop />}

      {sceneWithOffsets.map((scene, i) => (
        <Sequence key={i} from={scene.start} durationInFrames={scene.durationInFrames}>
          <Video
            src={scene.src}
            startFrom={scene.startFrom ? Math.round(scene.startFrom * fps) : 0}
            volume={scene.volume ?? 1}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {/* Subtle gradient overlay */}
          <AbsoluteFill
            style={{
              background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.8) 100%)',
              opacity: overlayOpacity,
            }}
          />
        </Sequence>
      ))}

      {/* Handle watermark */}
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'flex-start', padding: '40px' }}>
        <div style={{
          color: '#fff',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 700,
          fontSize: 36,
          textShadow: '0 2px 8px rgba(0,0,0,0.6)',
        }}>
          {handle}
        </div>
      </AbsoluteFill>

      {/* Word-by-word captions */}
      <WordByWordCaption
        words={wordCaptions}
        accentColor={accentColor}
        style={{ bottom: 160 }}
      />
    </AbsoluteFill>
  );
};
