import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { useAudioData, visualizeAudio } from '@remotion/media-utils';

// ============================================================
// Waveform — Real audio-reactive waveform visualizer
// Styles: bars | line | mirror
// Uses @remotion/media-utils for actual audio data
// ============================================================

type WaveformProps = {
  audioSrc: string;
  style?: 'bars' | 'line' | 'mirror';
  accentColor: string;
  height?: number;
  width?: number;
  numberOfSamples?: number;
  barWidth?: number;
  barGap?: number;
  smoothing?: number;
};

export const Waveform: React.FC<WaveformProps> = ({
  audioSrc,
  style = 'bars',
  accentColor,
  height = 120,
  width = 800,
  numberOfSamples = 64,
  barWidth = 6,
  barGap = 3,
  smoothing = 0.8,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Load audio data for visualization
  const audioData = useAudioData(audioSrc);

  // Generate visualization data
  let visualization: number[] = [];
  if (audioData) {
    visualization = visualizeAudio({
      fps,
      frame,
      audioData,
      numberOfSamples,
      smoothing,
    });
  } else {
    // Fallback animation while audio loads
    visualization = Array.from({ length: numberOfSamples }, (_, i) => {
      const t = frame / fps;
      return 0.3 + 0.4 * Math.abs(Math.sin(t * 2 + i * 0.3));
    });
  }

  const totalBarWidth = barWidth + barGap;
  const totalWidth = numberOfSamples * totalBarWidth - barGap;
  const offsetX = (width - totalWidth) / 2;

  if (style === 'bars') {
    return (
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        {visualization.map((v, i) => {
          const barHeight = Math.max(4, v * height * 0.9);
          return (
            <rect
              key={i}
              x={offsetX + i * totalBarWidth}
              y={height / 2 - barHeight / 2}
              width={barWidth}
              height={barHeight}
              rx={barWidth / 2}
              fill={accentColor}
              opacity={0.85 + v * 0.15}
            />
          );
        })}
      </svg>
    );
  }

  if (style === 'mirror') {
    return (
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        {visualization.map((v, i) => {
          const halfH = Math.max(2, v * height * 0.45);
          const x = offsetX + i * totalBarWidth;
          return (
            <g key={i}>
              <rect x={x} y={height / 2 - halfH} width={barWidth} height={halfH} rx={barWidth / 2} fill={accentColor} opacity={0.9} />
              <rect x={x} y={height / 2} width={barWidth} height={halfH} rx={barWidth / 2} fill={accentColor} opacity={0.5} />
            </g>
          );
        })}
      </svg>
    );
  }

  // Line style
  const points = visualization.map((v, i) => {
    const x = offsetX + i * totalBarWidth + barWidth / 2;
    const y = height / 2 - v * height * 0.4;
    return `${x},${y}`;
  }).join(' ');

  const pointsMirror = visualization.map((v, i) => {
    const x = offsetX + i * totalBarWidth + barWidth / 2;
    const y = height / 2 + v * height * 0.4;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <polyline points={points} fill="none" stroke={accentColor} strokeWidth={2} strokeLinejoin="round" opacity={0.9} />
      <polyline points={pointsMirror} fill="none" stroke={accentColor} strokeWidth={2} strokeLinejoin="round" opacity={0.4} />
    </svg>
  );
};
