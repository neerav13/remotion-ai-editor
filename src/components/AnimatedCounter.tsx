import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

// ============================================================
// AnimatedCounter — Counting number animation
// e.g. "0 → 1,000,000 subscribers"
// ============================================================

type AnimatedCounterProps = {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  accentColor: string;
  textColor?: string;
  fontSize?: number;
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + 'K';
  return n.toLocaleString();
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  label,
  prefix = '',
  suffix = '',
  accentColor,
  textColor = '#ffffff',
  fontSize = 120,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Entrance animation
  const enterProgress = spring({ fps, frame, config: { damping: 16, stiffness: 80 } });

  // Counter animation runs over 70% of duration
  const countDuration = Math.round(durationInFrames * 0.7);
  const countProgress = interpolate(frame, [0, countDuration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  });

  const currentValue = Math.round(countProgress * value);

  const exitOpacity = interpolate(
    frame, [durationInFrames - 12, durationInFrames], [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      opacity: exitOpacity,
    }}>
      {/* Label */}
      <div style={{
        color: accentColor,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 700,
        fontSize: 36,
        textTransform: 'uppercase',
        letterSpacing: 4,
        marginBottom: 16,
        opacity: enterProgress,
        transform: `translateY(${interpolate(enterProgress, [0, 1], [20, 0])}px)`,
      }}>
        {label}
      </div>

      {/* Counter */}
      <div style={{
        color: textColor,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 900,
        fontSize,
        lineHeight: 1,
        opacity: enterProgress,
        transform: `scale(${interpolate(enterProgress, [0, 1], [0.6, 1])})`,
      }}>
        {prefix}{formatNumber(currentValue)}{suffix}
      </div>

      {/* Accent bar */}
      <div style={{
        marginTop: 24,
        height: 5,
        width: interpolate(enterProgress, [0, 1], [0, 200]),
        background: accentColor,
        borderRadius: 3,
      }} />
    </AbsoluteFill>
  );
};
