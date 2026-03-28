import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

type AnimatedTitleProps = {
  text: string;
  subtitle?: string;
  accentColor: string;
  vertical?: boolean;
};

export const AnimatedTitle: React.FC<AnimatedTitleProps> = ({
  text,
  subtitle,
  accentColor,
  vertical = false,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const progress = spring({
    fps,
    frame,
    config: { damping: 14, stiffness: 100 },
    delay: 0,
  });

  const exitOpacity = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const fontSize = vertical ? 80 : 96;
  const subFontSize = vertical ? 44 : 52;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        background: `radial-gradient(ellipse at center, ${accentColor}15 0%, transparent 70%)`,
        opacity: exitOpacity,
      }}
    >
      <div style={{ textAlign: 'center', padding: vertical ? '0 60px' : '0 120px' }}>
        {/* Accent pill */}
        <div style={{
          display: 'inline-block',
          background: accentColor,
          height: 6,
          width: interpolate(progress, [0, 1], [0, 160]),
          borderRadius: 3,
          marginBottom: 24,
        }} />

        <div style={{
          color: '#ffffff',
          fontFamily: 'Inter, -apple-system, sans-serif',
          fontWeight: 900,
          fontSize,
          lineHeight: 1.1,
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: -2,
          opacity: progress,
          transform: `translateY(${interpolate(progress, [0, 1], [60, 0])}px)`,
          textShadow: '0 4px 30px rgba(0,0,0,0.8)',
        }}>
          {text}
        </div>

        {subtitle && (
          <div style={{
            color: accentColor,
            fontFamily: 'Inter, -apple-system, sans-serif',
            fontWeight: 700,
            fontSize: subFontSize,
            marginTop: 16,
            opacity: progress,
            transform: `translateY(${interpolate(progress, [0, 1], [40, 0])}px)`,
          }}>
            {subtitle}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
