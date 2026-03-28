import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

type CallToActionProps = {
  text: string;
  subtext?: string;
  accentColor: string;
  position?: 'top' | 'center' | 'bottom';
};

export const CallToAction: React.FC<CallToActionProps> = ({
  text,
  subtext,
  accentColor,
  position = 'bottom',
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const progress = spring({
    fps,
    frame,
    config: { damping: 14, stiffness: 100 },
    delay: 5,
  });

  const exitProgress = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const posMap = {
    top: 'flex-start',
    center: 'center',
    bottom: 'flex-end',
  };

  return (
    <AbsoluteFill
      style={{
        justifyContent: posMap[position],
        alignItems: 'center',
        padding: position === 'bottom' ? '0 0 80px 0' : position === 'top' ? '80px 0 0 0' : '0',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          background: accentColor,
          color: '#ffffff',
          fontFamily: 'Inter, -apple-system, sans-serif',
          borderRadius: 16,
          padding: '24px 56px',
          textAlign: 'center',
          opacity: progress * (1 - exitProgress),
          transform: `scale(${interpolate(progress, [0, 1], [0.7, 1])})`,
          boxShadow: `0 16px 48px ${accentColor}66`,
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 48, lineHeight: 1.2 }}>{text}</div>
        {subtext && (
          <div style={{ fontWeight: 500, fontSize: 30, marginTop: 8, opacity: 0.85 }}>{subtext}</div>
        )}
      </div>
    </AbsoluteFill>
  );
};
