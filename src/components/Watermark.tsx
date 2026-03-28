import React from 'react';
import { AbsoluteFill } from 'remotion';

type WatermarkProps = {
  text: string;
  opacity?: number;
  position?: 'center' | 'top-right' | 'bottom-right';
};

export const Watermark: React.FC<WatermarkProps> = ({
  text,
  opacity = 0.12,
  position = 'center',
}) => {
  const positionStyle: React.CSSProperties =
    position === 'center'
      ? { justifyContent: 'center', alignItems: 'center', transform: 'rotate(-30deg)' }
      : position === 'top-right'
      ? { justifyContent: 'flex-end', alignItems: 'flex-start', padding: '40px' }
      : { justifyContent: 'flex-end', alignItems: 'flex-end', padding: '40px' };

  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        zIndex: 100,
        ...positionStyle,
      }}
    >
      <div
        style={{
          color: '#ffffff',
          fontFamily: 'Inter, -apple-system, sans-serif',
          fontWeight: 900,
          fontSize: position === 'center' ? 180 : 40,
          opacity,
          userSelect: 'none',
          letterSpacing: 10,
          textTransform: 'uppercase',
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
