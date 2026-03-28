import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  Video,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import { CaptionTrack } from '../components/CaptionTrack';
import { WordByWordCaption } from '../components/WordByWordCaption';
import { AnimatedTitle } from '../components/AnimatedTitle';

// ============================================================
// ShortsVideo Composition
// 9:16 | 1080x1920 | 30fps — for YouTube Shorts, TikTok, Reels
// ============================================================

export type ShortsScene = {
  src: string;
  durationInFrames: number;
  startFrom?: number;
  volume?: number;
  fitMode?: 'cover' | 'contain';
};

export type WordCaption = {
  word: string;
  from: number;
  to: number;
};

export type ShortsVideoProps = {
  title: string;
  creator: string;
  scenes: ShortsScene[];
  wordCaptions: WordCaption[];
  musicSrc?: string;
  musicVolume: number;
  accentColor: string;
  backgroundColor: string;
  showTitle: boolean;
  titleDuration: number;
  hookText: string;
  showHook: boolean;
};

export const defaultShortsProps: ShortsVideoProps = {
  title: 'Short Video Title',
  creator: 'Creator Name',
  scenes: [
    { src: './public/clips/short1.mp4', durationInFrames: 90 },
    { src: './public/clips/short2.mp4', durationInFrames: 90 },
    { src: './public/clips/short3.mp4', durationInFrames: 90 },
  ],
  wordCaptions: [
    { word: 'This', from: 0, to: 8 },
    { word: 'is', from: 8, to: 14 },
    { word: 'amazing!', from: 14, to: 25 },
  ],
  musicSrc: undefined,
  musicVolume: 0.1,
  accentColor: '#FF006E',
  backgroundColor: '#000000',
  showTitle: true,
  titleDuration: 60,
  hookText: 'Watch till the end...',
  showHook: true,
};

export const ShortsVideo: React.FC<ShortsVideoProps> = ({
  title,
  creator,
  scenes,
  wordCaptions,
  musicSrc,
  musicVolume,
  accentColor,
  backgroundColor,
  showTitle,
  titleDuration,
  hookText,
  showHook,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  let currentStart = 0;
  const sceneWithOffsets = scenes.map((scene) => {
    const start = currentStart;
    currentStart += scene.durationInFrames;
    return { ...scene, start };
  });

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {musicSrc && <Audio src={musicSrc} volume={musicVolume} loop />}

      {/* Title card at start */}
      {showTitle && (
        <Sequence from={0} durationInFrames={titleDuration}>
          <AnimatedTitle
            text={title}
            subtitle={creator}
            accentColor={accentColor}
            vertical
          />
        </Sequence>
      )}

      {/* Hook text overlay */}
      {showHook && (
        <Sequence from={0} durationInFrames={45}>
          <AbsoluteFill
            style={{
              justifyContent: 'flex-start',
              alignItems: 'center',
              paddingTop: 120,
            }}
          >
            <div
              style={{
                background: accentColor,
                color: '#fff',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 900,
                fontSize: 52,
                padding: '12px 32px',
                borderRadius: 12,
                textTransform: 'uppercase',
                letterSpacing: 2,
              }}
            >
              {hookText}
            </div>
          </AbsoluteFill>
        </Sequence>
      )}

      {/* Video scenes */}
      {sceneWithOffsets.map((scene, i) => (
        <Sequence key={i} from={scene.start} durationInFrames={scene.durationInFrames}>
          <Video
            src={scene.src}
            startFrom={scene.startFrom ? Math.round(scene.startFrom * fps) : 0}
            volume={scene.volume ?? 1}
            style={{
              width: '100%',
              height: '100%',
              objectFit: scene.fitMode ?? 'cover',
            }}
          />
        </Sequence>
      ))}

      {/* Word-by-word captions */}
      <WordByWordCaption
        words={wordCaptions}
        accentColor={accentColor}
        style={{ bottom: 240 }}
      />
    </AbsoluteFill>
  );
};
