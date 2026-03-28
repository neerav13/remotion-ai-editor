import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

type OutroCardProps = {
  title: string;
  creator: string;
  ctaText: string;
  accentColor: string;
  logoSrc?: string;
  socialHandles?: string[];
};

export const OutroCard: React.FC<OutroCardProps> = ({
  title,
  creator,
  ctaText,
  accentColor,
  logoSrc,
  socialHandles = [],
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const headerProgress = spring({ fps, frame, config: { damping: 14, stiffness: 80 }, delay: 5 });
  const ctaProgress = spring({ fps, frame, config: { damping: 12, stiffness: 60 }, delay: 20 });
  const socialsProgress = spring({ fps, frame, config: { damping: 14, stiffness: 80 }, delay: 30 });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)`,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Accent background shape */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40%',
        background: `linear-gradient(to top, ${accentColor}33, transparent)`,
      }} />

      <div style={{ textAlign: 'center', zIndex: 1, padding: '0 80px' }}>
        {logoSrc && (
          <Img
            src={logoSrc}
            style={{
              height: 90,
              marginBottom: 32,
              opacity: headerProgress,
            }}
          />
        )}

        <div style={{
          color: '#ffffff',
          fontFamily: 'Inter, -apple-system, sans-serif',
          fontWeight: 800,
          fontSize: 64,
          lineHeight: 1.1,
          opacity: headerProgress,
          transform: `translateY(${interpolate(headerProgress, [0, 1], [40, 0])}px)`,
          marginBottom: 16,
        }}>
          {title}
        </div>

        <div style={{
          color: '#888888',
          fontFamily: 'Inter, -apple-system, sans-serif',
          fontWeight: 500,
          fontSize: 32,
          marginBottom: 48,
          opacity: headerProgress,
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}>
          {creator}
        </div>

        {/* CTA Button */}
        <div style={{
          display: 'inline-block',
          background: accentColor,
          color: '#ffffff',
          fontFamily: 'Inter, -apple-system, sans-serif',
          fontWeight: 800,
          fontSize: 42,
          padding: '20px 60px',
          borderRadius: 50,
          opacity: ctaProgress,
          transform: `scale(${interpolate(ctaProgress, [0, 1], [0.8, 1])})`,
          marginBottom: 48,
          boxShadow: `0 20px 60px ${accentColor}66`,
        }}>
          {ctaText}
        </div>

        {/* Social handles */}
        {socialHandles.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 32,
            opacity: socialsProgress,
          }}>
            {socialHandles.map((handle, i) => (
              <div key={i} style={{
                color: '#aaaaaa',
                fontFamily: 'Inter, -apple-system, sans-serif',
                fontSize: 28,
                fontWeight: 600,
              }}>
                {handle}
              </div>
            ))}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
