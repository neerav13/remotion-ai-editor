import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  Video,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from 'remotion';
import { IntroCard } from '../components/IntroCard';
import { LowerThird } from '../components/LowerThird';
import { CaptionTrack } from '../components/CaptionTrack';
import { OutroCard } from '../components/OutroCard';
import { TransitionOverlay } from '../components/TransitionOverlay';

// ============================================================
// YouTubeVideo Composition
// 16:9 | 1920x1080 | 30fps
// Prompt Claude Code to modify scenes[], captions[], music, etc.
// ============================================================

export type Scene = {
  /** Path or URL to the video clip */
  src: string;
  /** Duration in frames */
  durationInFrames: number;
  /** Optional text label for lower-third */
  label?: string;
  /** Start time offset within the source clip in seconds */
  startFrom?: number;
  /** Optional volume 0-1 */
  volume?: number;
};

export type Caption = {
  text: string;
  /** Start frame */
  from: number;
  /** End frame */
  to: number;
};

export type YouTubeVideoProps = {
  /** Video title shown in intro card */
  title: string;
  /** Creator / channel name */
  creator: string;
  /** Ordered list of video scenes */
  scenes: Scene[];
  /** Optional synced captions */
  captions: Caption[];
  /** Optional background music path */
  musicSrc?: string;
  /** Music volume 0-1 */
  musicVolume: number;
  /** Brand accent color (hex) */
  accentColor: string;
  /** Show intro card */
  showIntro: boolean;
  /** Show outro card */
  showOutro: boolean;
  /** Intro duration in frames */
  introDuration: number;
  /** Outro duration in frames */
  outroDuration: number;
  /** Subscribe CTA text */
  ctaText: string;
  /** Logo image path */
  logoSrc?: string;
};

export const defaultYouTubeProps: YouTubeVideoProps = {
  title: 'My Awesome YouTube Video',
  creator: 'Creator Name',
  scenes: [
    { src: './public/clips/clip1.mp4', durationInFrames: 150 },
    { src: './public/clips/clip2.mp4', durationInFrames: 180 },
    { src: './public/clips/clip3.mp4', durationInFrames: 120 },
  ],
  captions: [
    { text: 'Welcome to the video!', from: 0, to: 60 },
    { text: 'In this video we will cover...', from: 60, to: 120 },
  ],
  musicSrc: undefined,
  musicVolume: 0.15,
  accentColor: '#FF6B35',
  showIntro: true,
  showOutro: true,
  introDuration: 90,
  outroDuration: 150,
  ctaText: 'Subscribe for more!',
  logoSrc: undefined,
};

export const YouTubeVideo: React.FC<YouTubeVideoProps> = ({
  title,
  creator,
  scenes,
  captions,
  musicSrc,
  musicVolume,
  accentColor,
  showIntro,
  showOutro,
  introDuration,
  outroDuration,
  ctaText,
  logoSrc,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate total scenes duration
  const scenesDuration = scenes.reduce((sum, s) => sum + s.durationInFrames, 0);
  const introDur = showIntro ? introDuration : 0;
  const outroDur = showOutro ? outroDuration : 0;

  // Accumulate scene start times
  let currentStart = introDur;
  const sceneWithOffsets = scenes.map((scene) => {
    const start = currentStart;
    currentStart += scene.durationInFrames;
    return { ...scene, start };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Background music */}
      {musicSrc && (
        <Audio src={musicSrc} volume={musicVolume} loop />
      )}

      {/* INTRO CARD */}
      {showIntro && (
        <Sequence from={0} durationInFrames={introDur}>
          <IntroCard
            title={title}
            creator={creator}
            accentColor={accentColor}
            logoSrc={logoSrc}
          />
        </Sequence>
      )}

      {/* SCENES */}
      {sceneWithOffsets.map((scene, i) => (
        <Sequence
          key={i}
          from={scene.start}
          durationInFrames={scene.durationInFrames}
        >
          <Video
            src={scene.src}
            startFrom={scene.startFrom ? Math.round(scene.startFrom * fps) : 0}
            volume={scene.volume ?? 1}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {/* Lower third label */}
          {scene.label && (
            <LowerThird text={scene.label} accentColor={accentColor} />
          )}
          {/* Transition overlay at scene end */}
          {i < sceneWithOffsets.length - 1 && (
            <TransitionOverlay
              startAt={scene.durationInFrames - 15}
              durationInFrames={30}
            />
          )}
        </Sequence>
      ))}

      {/* CAPTIONS */}
      {captions.map((cap, i) => (
        <Sequence key={`cap-${i}`} from={introDur + cap.from} durationInFrames={cap.to - cap.from}>
          <CaptionTrack text={cap.text} accentColor={accentColor} />
        </Sequence>
      ))}

      {/* OUTRO CARD */}
      {showOutro && (
        <Sequence
          from={introDur + scenesDuration}
          durationInFrames={outroDur}
        >
          <OutroCard
            title={title}
            creator={creator}
            ctaText={ctaText}
            accentColor={accentColor}
            logoSrc={logoSrc}
          />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
