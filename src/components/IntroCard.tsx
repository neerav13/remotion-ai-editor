import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

// ============================================================
// IntroCard — Animated title card for video openers
// Customizable: title, creator, accentColor, logo
// ============================================================

type IntroCardProps = {
  title: string;
  creator: string;
  accentColor: string;
  logoSrc?: string;
};

export const IntroCard: React.FC<IntroCardProps> = ({ title, creator, accentColor, logoSrc }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Entrance spring animation
  const titleProgress = spring({
    fps,
    frame,
    config: { damping: 14, stiffness: 80 },
    delay: 5,
  });

  const creatorProgress = spring({
    fps,
    frame,
    config: { damping: 14, stiffness: 80 },
    delay: 15,
  });

  const accentProgress = spring({
    fps,
    frame,
    config: { damping: 20, stiffness: 100 },
    delay: 0,
  });

  // Exit fade
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, ${accentColor}22 100%)`,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: exitOpacity,
      }}
    >
      {/* Accent bar */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: interpolate(accentProgress, [0, 1], [0, 8]),
          background: accentColor,
        }}
      />

      {/* Background accent glow */}
      <div
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: accentColor,
          opacity: 0.05,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(80px)',
        }}
      />

      <div style={{ textAlign: 'center', zIndex: 1 }}>
        {/* Logo */}
        {logoSrc && (
          <Img
            src={logoSrc}
            style={{
              height: 100,
              marginBottom: 40,
              opacity: titleProgress,
              transform: `translateY(${interpolate(titleProgress, [0, 1], [30, 0])}px)`,
            }}
          />
        )}

        {/* Title */}
        <div
          style={{
            color: '#ffffff',
            fontFamily: 'Inter, -apple-system, sans-serif',
            fontWeight: 800,
            fontSize: 72,
            lineHeight: 1.1,
            maxWidth: 1400,
            padding: '0 80px',
            opacity: titleProgress,
            transform: `translateY(${interpolate(titleProgress, [0, 1], [50, 0])}px)`,
            textShadow: '0 4px 40px rgba(0,0,0,0.5)',
          }}
        >
          {title}
        </div>

        {/* Accent divider */}
        <div
          style={{
            width: interpolate(accentProgress, [0, 1], [0, 120]),
            height: 4,
            background: accentColor,
            margin: '24px auto',
            borderRadius: 2,
          }}
        />

        {/* Creator */}
        <div
          style={{
            color: '#aaaaaa',
            fontFamily: 'Inter, -apple-system, sans-serif',
            fontWeight: 500,
            fontSize: 36,
            opacity: creatorProgress,
            transform: `translateY(${interpolate(creatorProgress, [0, 1], [30, 0])}px)`,
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          {creator}
        </div>
      </div>
    </AbsoluteFill>
  );
};
