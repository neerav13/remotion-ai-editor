import React from 'react';
import {
  AbsoluteFill, Audio, Sequence,
  useCurrentFrame, useVideoConfig, interpolate, spring,
} from 'remotion';
import { KineticText } from '../components/KineticText';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { AnimatedTitle } from '../components/AnimatedTitle';
import { ColorGrade } from '../components/ColorGrade';
import { ShapeReveal } from '../components/ShapeReveal';

// ============================================================
// MotionGraphics Composition
// 16:9 | 1920x1080 | 30fps (also works 9:16 as "scene" units)
// Build animated explainers, title cards, stat reveals,
// logo bumpers, countdown timers, social media graphics.
// ============================================================

export type MGScene =
  | { type: 'title'; text: string; subtitle?: string; durationInFrames: number }
  | { type: 'counter'; label: string; value: number; prefix?: string; suffix?: string; durationInFrames: number }
  | { type: 'kinetic'; text: string; style: 'slam' | 'typewriter' | 'fly-in' | 'scale-pop'; durationInFrames: number }
  | { type: 'shape-reveal'; text: string; shape: 'circle' | 'rectangle' | 'diagonal'; durationInFrames: number }
  | { type: 'custom-gap'; durationInFrames: number };  // blank scene for timing gaps

export type MotionGraphicsProps = {
  scenes: MGScene[];
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  musicSrc?: string;
  musicVolume: number;
  gradePreset?: 'none' | 'cinematic' | 'warm' | 'cool';
  fontFamily?: string;
};

export const defaultMotionGraphicsProps: MotionGraphicsProps = {
  scenes: [
    { type: 'title', text: '10 RULES', subtitle: 'FOR BUILDING A BRAND', durationInFrames: 90 },
    { type: 'kinetic', text: 'RULE #1: SHOW UP EVERY DAY', style: 'slam', durationInFrames: 60 },
    { type: 'counter', label: 'SUBSCRIBERS GAINED', value: 1000000, suffix: '+', durationInFrames: 90 },
    { type: 'shape-reveal', text: 'THE SECRET IS CONSISTENCY', shape: 'diagonal', durationInFrames: 90 },
    { type: 'kinetic', text: 'START TODAY', style: 'scale-pop', durationInFrames: 60 },
  ],
  accentColor: '#FF6B35',
  backgroundColor: '#0a0a0a',
  textColor: '#ffffff',
  musicSrc: undefined,
  musicVolume: 0.3,
  gradePreset: 'none',
  fontFamily: 'Inter',
};

export const MotionGraphics: React.FC<MotionGraphicsProps> = ({
  scenes, accentColor, backgroundColor, textColor, musicSrc, musicVolume, gradePreset, fontFamily,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Build scene timeline
  let cursor = 0;
  const timeline = scenes.map((scene) => {
    const start = cursor;
    cursor += scene.durationInFrames;
    return { ...scene, start };
  });

  return (
    <AbsoluteFill style={{ backgroundColor, fontFamily: fontFamily ?? 'Inter, sans-serif' }}>
      {musicSrc && <Audio src={musicSrc} volume={musicVolume} />}

      {timeline.map((scene, i) => (
        <Sequence key={i} from={scene.start} durationInFrames={scene.durationInFrames}>
          {scene.type === 'title' && (
            <AnimatedTitle
              text={scene.text}
              subtitle={scene.subtitle}
              accentColor={accentColor}
            />
          )}

          {scene.type === 'kinetic' && (
            <KineticText
              text={scene.text}
              style={scene.style}
              accentColor={accentColor}
            />
          )}

          {scene.type === 'counter' && (
            <AnimatedCounter
              label={scene.label}
              value={scene.value}
              prefix={scene.prefix}
              suffix={scene.suffix}
              accentColor={accentColor}
              textColor={textColor}
            />
          )}

          {scene.type === 'shape-reveal' && (
            <ShapeReveal
              text={scene.text}
              shape={scene.shape}
              accentColor={accentColor}
              textColor={textColor}
            />
          )}

          {scene.type === 'custom-gap' && <AbsoluteFill />}
        </Sequence>
      ))}

      {/* COLOR GRADE */}
      {gradePreset && gradePreset !== 'none' && <ColorGrade preset={gradePreset} />}
    </AbsoluteFill>
  );
};
