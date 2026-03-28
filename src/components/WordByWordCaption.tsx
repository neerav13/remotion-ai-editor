import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

// ============================================================
// WordByWordCaption — TikTok-style animated word captions
// Each word pops in with a spring animation
// Prompt Claude Code: "add word captions to my short video"
// ============================================================

type Word = {
  word: string;
  from: number; // start frame
  to: number;   // end frame
};

type WordByWordCaptionProps = {
  words: Word[];
  accentColor: string;
  style?: React.CSSProperties;
};

const WordItem: React.FC<{ word: string; accentColor: string; isActive: boolean }> = ({
  word,
  accentColor,
  isActive,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = isActive
    ? spring({ fps, frame, config: { damping: 12, stiffness: 200 } })
    : 1;

  return (
    <span
      style={{
        display: 'inline-block',
        color: isActive ? accentColor : '#ffffff',
        fontFamily: 'Inter, -apple-system, sans-serif',
        fontWeight: 900,
        fontSize: 72,
        textTransform: 'uppercase',
        textShadow: '0 3px 16px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.6)',
        transform: `scale(${isActive ? scale : 1})`,
        letterSpacing: -1,
        lineHeight: 1,
        margin: '0 8px',
        WebkitTextStroke: isActive ? '2px rgba(255,255,255,0.2)' : 'none',
        transition: 'color 0.1s',
      }}
    >
      {word}
    </span>
  );
};

export const WordByWordCaption: React.FC<WordByWordCaptionProps> = ({
  words,
  accentColor,
  style = {},
}) => {
  const frame = useCurrentFrame();

  const activeWordIndex = words.findIndex((w) => frame >= w.from && frame < w.to);
  const pastWords = words.filter((w) => frame >= w.to);
  const futureWords = words.filter((w) => frame < w.from);
  const activeWord = activeWordIndex >= 0 ? words[activeWordIndex] : null;

  // Show a window of context: 3 previous + active + 3 next
  const contextStart = Math.max(0, activeWordIndex - 2);
  const contextEnd = Math.min(words.length - 1, activeWordIndex + 3);
  const visibleWords = words.slice(contextStart, contextEnd + 1);

  if (words.length === 0) return null;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 200,
        ...style,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '90%',
          gap: 4,
        }}
      >
        {visibleWords.map((w, i) => (
          <WordItem
            key={`${contextStart + i}`}
            word={w.word}
            accentColor={accentColor}
            isActive={frame >= w.from && frame < w.to}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
