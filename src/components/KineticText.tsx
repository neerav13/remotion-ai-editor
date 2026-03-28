import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

// ============================================================
// KineticText — Animated typography for motion graphics
// Styles: slam | typewriter | fly-in | scale-pop
// ============================================================

type KineticTextStyle = 'slam' | 'typewriter' | 'fly-in' | 'scale-pop';

type KineticTextProps = {
  text: string;
  style: KineticTextStyle;
  accentColor: string;
  fontSize?: number;
  color?: string;
  align?: 'left' | 'center' | 'right';
};

export const KineticText: React.FC<KineticTextProps> = ({
  text,
  style,
  accentColor,
  fontSize = 120,
  color = '#ffffff',
  align = 'center',
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const exitOpacity = interpolate(
    frame, [durationInFrames - 12, durationInFrames],
    [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // SLAM style — letter-press impact
  if (style === 'slam') {
    const scale = spring({ fps, frame, config: { damping: 8, stiffness: 300 } });
    const letterScale = interpolate(scale, [0, 1], [2.5, 1]);
    return (
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: exitOpacity }}>
        <div style={{
          color,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 900,
          fontSize,
          textAlign: align,
          textTransform: 'uppercase',
          letterSpacing: -2,
          transform: `scale(${letterScale})`,
          textShadow: `0 0 60px ${accentColor}88, 0 4px 20px rgba(0,0,0,0.8)`,
          padding: '0 80px',
          lineHeight: 1,
        }}>
          {text}
        </div>
        {/* Impact line */}
        <div style={{
          position: 'absolute',
          bottom: '35%',
          width: interpolate(scale, [0, 1], [0, 300]),
          height: 4,
          background: accentColor,
          borderRadius: 2,
        }} />
      </AbsoluteFill>
    );
  }

  // TYPEWRITER style — characters appear one by one
  if (style === 'typewriter') {
    const totalChars = text.length;
    const charsPerFrame = totalChars / (durationInFrames * 0.7);
    const visibleChars = Math.min(totalChars, Math.round(frame * charsPerFrame));
    const visibleText = text.slice(0, visibleChars);
    const showCursor = frame % 8 < 5;

    return (
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: exitOpacity }}>
        <div style={{
          color,
          fontFamily: '"Courier New", monospace',
          fontWeight: 700,
          fontSize: fontSize * 0.75,
          textAlign: align,
          padding: '0 80px',
          borderLeft: `4px solid ${accentColor}`,
          paddingLeft: 32,
        }}>
          {visibleText}
          {showCursor && <span style={{ color: accentColor }}>|</span>}
        </div>
      </AbsoluteFill>
    );
  }

  // FLY-IN style — words fly in from different directions
  if (style === 'fly-in') {
    const words = text.split(' ');
    return (
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: exitOpacity }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16, padding: '0 80px' }}>
          {words.map((word, i) => {
            const delay = i * 6;
            const progress = spring({ fps, frame, config: { damping: 14, stiffness: 100 }, delay });
            const fromX = (i % 2 === 0 ? -1 : 1) * interpolate(progress, [0, 1], [300, 0]);
            const fromY = interpolate(progress, [0, 1], [80, 0]);
            return (
              <span key={i} style={{
                color,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 900,
                fontSize,
                textTransform: 'uppercase',
                transform: `translate(${fromX}px, ${fromY}px)`,
                opacity: progress,
                display: 'inline-block',
              }}>
                {word}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
    );
  }

  // SCALE-POP style — bouncy spring scale in
  if (style === 'scale-pop') {
    const progress = spring({ fps, frame, config: { damping: 10, stiffness: 180 } });
    return (
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: exitOpacity }}>
        <div style={{
          background: accentColor,
          color: '#fff',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 900,
          fontSize,
          textTransform: 'uppercase',
          padding: '20px 60px',
          borderRadius: 16,
          transform: `scale(${interpolate(progress, [0, 1], [0.3, 1])})`,
          opacity: progress,
          textAlign: 'center',
        }}>
          {text}
        </div>
      </AbsoluteFill>
    );
  }

  return null;
};
