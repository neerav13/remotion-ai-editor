import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

// ============================================================
// GlitchTransition — RGB split + scanline glitch effect
// ============================================================

type GlitchTransitionProps = {
  startAt: number;
  durationInFrames: number;
  intensity?: number;
};

export const GlitchTransition: React.FC<GlitchTransitionProps> = ({
  startAt,
  durationInFrames,
  intensity = 1,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startAt;

  if (localFrame < 0 || localFrame > durationInFrames) return null;

  const progress = localFrame / durationInFrames;
  const peak = progress < 0.5
    ? interpolate(progress, [0, 0.5], [0, 1])
    : interpolate(progress, [0.5, 1], [1, 0]);

  const glitchAmt = peak * intensity;

  // Pseudo-random shifts based on frame
  const shiftX = (Math.sin(localFrame * 13.7) * 30 * glitchAmt);
  const shiftY = (Math.cos(localFrame * 7.3) * 8 * glitchAmt);
  const rShift = Math.sin(localFrame * 17.1) * 20 * glitchAmt;
  const bShift = Math.cos(localFrame * 11.3) * 20 * glitchAmt;

  // Scanline bands
  const scanlineY = ((localFrame * 47) % 100);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Red channel shift */}
      <AbsoluteFill style={{
        backgroundImage: 'none',
        mixBlendMode: 'screen',
        backgroundColor: `rgba(255,0,0,${glitchAmt * 0.3})`,
        transform: `translate(${rShift}px, 0)`,
        opacity: glitchAmt,
      }} />
      {/* Blue channel shift */}
      <AbsoluteFill style={{
        mixBlendMode: 'screen',
        backgroundColor: `rgba(0,0,255,${glitchAmt * 0.3})`,
        transform: `translate(${-bShift}px, 0)`,
        opacity: glitchAmt,
      }} />
      {/* Main glitch block */}
      <AbsoluteFill style={{
        backgroundColor: glitchAmt > 0.7 ? '#000' : 'transparent',
        opacity: glitchAmt > 0.7 ? glitchAmt - 0.7 : 0,
        transform: `translate(${shiftX}px, ${shiftY}px)`,
      }} />
      {/* Scanline */}
      <AbsoluteFill style={{
        background: `linear-gradient(transparent ${scanlineY - 2}%, rgba(255,255,255,0.15) ${scanlineY}%, rgba(255,255,255,0.15) ${scanlineY + 2}%, transparent ${scanlineY + 4}%)`,
        opacity: glitchAmt,
        pointerEvents: 'none',
      }} />
    </AbsoluteFill>
  );
};
