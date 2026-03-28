import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

// ============================================================
// ZoomCut — Punch-in zoom effect on clip entry
// Wraps any video element with a scale spring animation
// ============================================================

type ZoomCutProps = {
  enabled: boolean;
  scale?: number;           // target zoom level, default 1.12
  duration?: number;        // frames to reach target, default 20
  children: React.ReactNode;
};

export const ZoomCut: React.FC<ZoomCutProps> = ({
  enabled,
  scale = 1.12,
  duration = 20,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!enabled) {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  const zoomProgress = spring({
    fps,
    frame,
    config: { damping: 18, stiffness: 120 },
    durationInFrames: duration,
  });

  const currentScale = interpolate(zoomProgress, [0, 1], [scale, 1]);

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${currentScale})`,
        transformOrigin: 'center center',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
