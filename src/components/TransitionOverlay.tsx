import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

// ============================================================
// TransitionOverlay — Smooth scene transitions
// Types: fade, flash, swipe-left, swipe-right, zoom-out
// ============================================================

type TransitionType = 'fade' | 'flash' | 'dip-black' | 'dip-white';

type TransitionOverlayProps = {
  startAt: number;
  durationInFrames: number;
  type?: TransitionType;
  color?: string;
};

export const TransitionOverlay: React.FC<TransitionOverlayProps> = ({
  startAt,
  durationInFrames,
  type = 'dip-black',
  color,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames: totalFrames } = useVideoConfig();

  // Only render during the transition window
  if (frame < startAt || frame > startAt + durationInFrames) return null;

  const localFrame = frame - startAt;
  const half = durationInFrames / 2;

  let opacity = 0;

  if (type === 'fade' || type === 'dip-black' || type === 'dip-white') {
    if (localFrame <= half) {
      opacity = interpolate(localFrame, [0, half], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
    } else {
      opacity = interpolate(localFrame, [half, durationInFrames], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
    }
  } else if (type === 'flash') {
    opacity = interpolate(
      localFrame,
      [0, durationInFrames * 0.2, durationInFrames * 0.5, durationInFrames],
      [0, 1, 0.8, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
  }

  const bgColor = color ?? (type === 'dip-white' ? '#ffffff' : '#000000');

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgColor,
        opacity,
        pointerEvents: 'none',
      }}
    />
  );
};
