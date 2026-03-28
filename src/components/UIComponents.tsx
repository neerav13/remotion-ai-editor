import React from 'react';
import {
  AbsoluteFill, Video, interpolate, spring,
  useCurrentFrame, useVideoConfig,
} from 'remotion';
import { Waveform } from './Waveform';

// ============================================================
// UIComponents.tsx — Barrel file for all UI overlay components
// BeatText | ProgressBar | ChapterMarker | PictureInPicture
// QuoteCard | SplitScreen | ShapeReveal
// ============================================================

// ---- BeatText ----
export const BeatText: React.FC<{ text: string; accentColor: string }> = ({ text, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const scale = spring({ fps, frame, config: { damping: 6, stiffness: 400 } });
  const exitOpacity = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: exitOpacity, pointerEvents: 'none' }}>
      <div style={{
        color: '#ffffff',
        background: accentColor,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 900,
        fontSize: 96,
        textTransform: 'uppercase',
        padding: '12px 48px',
        borderRadius: 8,
        letterSpacing: -2,
        transform: `scale(${interpolate(scale, [0, 1], [1.8, 1])})`,
        opacity: scale,
      }}>
        {text}
      </div>
    </AbsoluteFill>
  );
};

// ---- ProgressBar ----
export const ProgressBar: React.FC<{
  accentColor: string;
  chapters: Array<{ title: string; from: number }>;
  introDuration: number;
}> = ({ accentColor, chapters, introDuration }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = frame / durationInFrames;

  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'stretch', pointerEvents: 'none' }}>
      <div style={{ width: '100%', height: 5, background: 'rgba(255,255,255,0.15)', position: 'relative' }}>
        {/* Progress fill */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${progress * 100}%`,
          background: accentColor,
          borderRadius: '0 3px 3px 0',
          transition: 'width 0.05s linear',
        }} />
        {/* Chapter dots */}
        {chapters.map((ch, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${(ch.from / durationInFrames) * 100}%`,
            top: -2, width: 9, height: 9,
            background: frame >= ch.from ? accentColor : '#fff',
            borderRadius: '50%',
            transform: 'translateX(-50%)',
          }} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---- ChapterMarker ----
export const ChapterMarker: React.FC<{ title: string; accentColor: string }> = ({ title, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const progress = spring({ fps, frame, config: { damping: 16, stiffness: 80 } });
  const exitOpacity = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'flex-start', padding: '48px 60px', opacity: exitOpacity, pointerEvents: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [-30, 0])}px)`,
      }}>
        <div style={{ width: 4, height: 36, background: accentColor, borderRadius: 2 }} />
        <div style={{
          color: '#fff',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 700,
          fontSize: 32,
          background: 'rgba(0,0,0,0.6)',
          padding: '6px 20px',
          borderRadius: 8,
          backdropFilter: 'blur(4px)',
        }}>
          {title}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---- PictureInPicture ----
export const PictureInPicture: React.FC<{
  src: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  size?: number;
  accentColor: string;
}> = ({ src, position = 'top-right', size = 0.28, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const progress = spring({ fps, frame, config: { damping: 14, stiffness: 80 } });

  const pipW = width * size;
  const pipH = pipW * (9 / 16);
  const margin = 40;

  const posStyle: React.CSSProperties = {
    'top-right': { top: margin, right: margin },
    'top-left': { top: margin, left: margin },
    'bottom-right': { bottom: margin + 30, right: margin },
    'bottom-left': { bottom: margin + 30, left: margin },
  }[position];

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute',
        ...posStyle,
        width: pipW,
        height: pipH,
        border: `3px solid ${accentColor}`,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        opacity: progress,
        transform: `scale(${interpolate(progress, [0, 1], [0.5, 1])})`,
      }}>
        <Video src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </AbsoluteFill>
  );
};

// ---- QuoteCard ----
export const QuoteCard: React.FC<{
  text: string;
  speaker?: string;
  accentColor: string;
}> = ({ text, speaker, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const progress = spring({ fps, frame, config: { damping: 14, stiffness: 80 } });
  const exitOpacity = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: exitOpacity }}>
      <div style={{
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(12px)',
        border: `2px solid ${accentColor}`,
        borderRadius: 20,
        padding: '48px 64px',
        maxWidth: '80%',
        textAlign: 'center',
        opacity: progress,
        transform: `scale(${interpolate(progress, [0, 1], [0.9, 1])})`,
      }}>
        <div style={{
          color: accentColor,
          fontSize: 80,
          lineHeight: 0.5,
          fontFamily: 'Georgia, serif',
          marginBottom: 16,
        }}>"</div>
        <div style={{
          color: '#fff',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: 42,
          lineHeight: 1.4,
          fontStyle: 'italic',
        }}>
          {text}
        </div>
        {speaker && (
          <div style={{
            color: accentColor,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            fontSize: 28,
            marginTop: 24,
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}>
            — {speaker}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// ---- SplitScreen ----
export const SplitScreen: React.FC<{
  leftVideo?: string;
  rightVideo?: string;
  leftLabel: string;
  rightLabel: string;
  accentColor: string;
  showWaveform?: boolean;
  audioSrc?: string;
  waveformStyle?: 'bars' | 'line' | 'mirror';
}> = ({ leftVideo, rightVideo, leftLabel, rightLabel, accentColor, showWaveform, audioSrc, waveformStyle }) => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* Left */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', overflow: 'hidden' }}>
        {leftVideo && <Video src={leftVideo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        {/* Left label */}
        <div style={{
          position: 'absolute', bottom: 60, left: 24,
          background: 'rgba(0,0,0,0.7)', color: '#fff',
          fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 28,
          padding: '6px 16px', borderRadius: 8,
          borderLeft: `4px solid ${accentColor}`,
        }}>
          {leftLabel}
        </div>
      </div>

      {/* Divider */}
      <div style={{
        position: 'absolute', left: '50%', top: 0, width: 3, height: '100%',
        background: accentColor,
        transform: 'translateX(-50%)',
        zIndex: 10,
      }} />

      {/* Right */}
      <div style={{ position: 'absolute', right: 0, top: 0, width: '50%', height: '100%', overflow: 'hidden' }}>
        {rightVideo && <Video src={rightVideo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        {/* Right label */}
        <div style={{
          position: 'absolute', bottom: 60, left: 24,
          background: 'rgba(0,0,0,0.7)', color: '#fff',
          fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 28,
          padding: '6px 16px', borderRadius: 8,
          borderLeft: `4px solid ${accentColor}`,
        }}>
          {rightLabel}
        </div>
      </div>

      {/* Waveform overlay at bottom */}
      {showWaveform && audioSrc && (
        <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 24, pointerEvents: 'none' }}>
          <Waveform audioSrc={audioSrc} style={waveformStyle ?? 'bars'} accentColor={accentColor} height={80} width={600} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ---- ShapeReveal ----
export const ShapeReveal: React.FC<{
  text: string;
  shape: 'circle' | 'rectangle' | 'diagonal';
  accentColor: string;
  textColor?: string;
}> = ({ text, shape, accentColor, textColor = '#ffffff' }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const progress = spring({ fps, frame, config: { damping: 14, stiffness: 80 } });
  const exitOpacity = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const clipPath =
    shape === 'circle'
      ? `circle(${interpolate(progress, [0, 1], [0, 120])}% at 50% 50%)`
      : shape === 'rectangle'
      ? `inset(${interpolate(progress, [0, 1], [50, 0])}% 5% round 20px)`
      : `polygon(0 ${interpolate(progress, [0, 1], [100, 0])}%, 100% 0, 100% 100%, 0 100%)`;

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: exitOpacity }}>
      <div style={{
        background: accentColor,
        clipPath,
        width: '90%',
        height: '70%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: shape === 'circle' ? '50%' : 16,
      }}>
        <div style={{
          color: textColor,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 900,
          fontSize: 80,
          textTransform: 'uppercase',
          textAlign: 'center',
          padding: '0 60px',
          letterSpacing: -2,
        }}>
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
