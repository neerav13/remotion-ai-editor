import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

type LowerThirdProps = {
  text: string;
  subtext?: string;
  accentColor: string;
};

export const LowerThird: React.FC<LowerThirdProps> = ({ text, subtext, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enterProgress = spring({
    fps,
    frame,
    config: { damping: 18, stiffness: 100 },
    delay: 5,
  });

  const exitProgress = interpolate(
    frame,
    [durationInFrames - 25, durationInFrames - 5],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const slideX = interpolate(enterProgress, [0, 1], [-400, 0]) * (1 - exitProgress);

  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'flex-start', pointerEvents: 'none' }}>
      <div
        style={{
          margin: '0 0 120px 80px',
          transform: `translateX(${slideX}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        {/* Accent bar */}
        <div style={{ width: 6, height: subtext ? 70 : 50, background: accentColor, borderRadius: 3, flexShrink: 0 }} />

        <div>
          <div style={{
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            fontFamily: 'Inter, -apple-system, sans-serif',
            fontWeight: 700,
            fontSize: 36,
            padding: '8px 20px 8px 16px',
            borderRadius: '0 8px 0 0',
            lineHeight: 1,
          }}>
            {text}
          </div>
          {subtext && (
            <div style={{
              background: accentColor,
              color: '#fff',
              fontFamily: 'Inter, -apple-system, sans-serif',
              fontWeight: 500,
              fontSize: 24,
              padding: '4px 20px 4px 16px',
              borderRadius: '0 0 8px 0',
              lineHeight: 1.2,
            }}>
              {subtext}
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
