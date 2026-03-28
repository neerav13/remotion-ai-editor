import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

type CaptionTrackProps = {
  text: string;
  accentColor: string;
  position?: 'bottom' | 'top';
};

export const CaptionTrack: React.FC<CaptionTrackProps> = ({
  text,
  accentColor,
  position = 'bottom',
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enterProgress = spring({
    fps,
    frame,
    config: { damping: 20, stiffness: 120 },
  });

  const exitOpacity = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: position === 'bottom' ? 'flex-end' : 'flex-start',
        alignItems: 'center',
        paddingBottom: position === 'bottom' ? 80 : 0,
        paddingTop: position === 'top' ? 80 : 0,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          background: 'rgba(0,0,0,0.82)',
          backdropFilter: 'blur(4px)',
          color: '#ffffff',
          fontFamily: 'Inter, -apple-system, sans-serif',
          fontWeight: 600,
          fontSize: 42,
          lineHeight: 1.4,
          padding: '14px 40px',
          borderRadius: 10,
          maxWidth: '85%',
          textAlign: 'center',
          borderLeft: `5px solid ${accentColor}`,
          opacity: enterProgress * exitOpacity,
          transform: `translateY(${interpolate(enterProgress, [0, 1], [20, 0])}px)`,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
