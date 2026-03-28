import React from 'react';
import { AbsoluteFill } from 'remotion';

// ============================================================
// ColorGrade — CSS-based color grading overlay
// Presets: cinematic | warm | cool | desaturate | vintage | high-contrast
// Applied as a non-destructive layer on top of video
// ============================================================

type ColorGradePreset =
  | 'cinematic'
  | 'warm'
  | 'cool'
  | 'desaturate'
  | 'vintage'
  | 'high-contrast'
  | 'none';

type ColorGradeProps = {
  preset: ColorGradePreset;
  intensity?: number;  // 0–1, default 1
};

const PRESETS: Record<ColorGradePreset, React.CSSProperties> = {
  none: {},
  cinematic: {
    background: 'linear-gradient(to bottom, rgba(0,0,40,0.18) 0%, transparent 40%, transparent 60%, rgba(40,0,0,0.18) 100%)',
    mixBlendMode: 'multiply',
  },
  warm: {
    background: 'rgba(255, 140, 40, 0.10)',
    mixBlendMode: 'screen',
  },
  cool: {
    background: 'rgba(40, 80, 200, 0.10)',
    mixBlendMode: 'screen',
  },
  desaturate: {
    backdropFilter: 'saturate(0.4)',
  },
  vintage: {
    background: 'radial-gradient(ellipse at center, transparent 40%, rgba(80,40,0,0.4) 100%)',
    mixBlendMode: 'multiply',
  },
  'high-contrast': {
    backdropFilter: 'contrast(1.3) saturate(1.4)',
  },
};

// CSS filter map for filter-based grades
const FILTER_PRESETS: Record<ColorGradePreset, string> = {
  none: '',
  cinematic: 'contrast(1.08) saturate(0.9) brightness(0.95)',
  warm: 'sepia(0.18) contrast(1.05) saturate(1.15)',
  cool: 'hue-rotate(10deg) saturate(0.9) contrast(1.05)',
  desaturate: 'saturate(0.35) contrast(1.1)',
  vintage: 'sepia(0.35) contrast(1.1) brightness(0.9)',
  'high-contrast': 'contrast(1.35) saturate(1.3) brightness(1.02)',
};

export const ColorGrade: React.FC<ColorGradeProps> = ({ preset, intensity = 1 }) => {
  if (preset === 'none') return null;

  // For backdrop-filter based grades, use a full-size overlay
  if (preset === 'desaturate' || preset === 'high-contrast') {
    return (
      <AbsoluteFill
        style={{
          backdropFilter: `${preset === 'desaturate' ? 'saturate(0.4)' : 'contrast(1.3) saturate(1.4)'}`,
          opacity: intensity,
          pointerEvents: 'none',
          zIndex: 50,
        }}
      />
    );
  }

  // For overlay-based grades, layer a colored div
  return (
    <AbsoluteFill
      style={{
        ...PRESETS[preset],
        opacity: intensity,
        pointerEvents: 'none',
        zIndex: 50,
      }}
    />
  );
};

// ============================================================
// VideoGrade — applies CSS filter directly to a video element wrapper
// Use this when you want grade applied at the clip level
// ============================================================

export const VideoGrade: React.FC<{ preset: ColorGradePreset; children: React.ReactNode }> = ({
  preset,
  children,
}) => {
  const filter = FILTER_PRESETS[preset];
  return (
    <div style={{ width: '100%', height: '100%', filter: filter || undefined }}>
      {children}
    </div>
  );
};
