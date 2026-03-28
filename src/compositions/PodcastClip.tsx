import React from 'react';
import {
  AbsoluteFill, Audio, Sequence, Video,
  useCurrentFrame, useVideoConfig, interpolate, spring,
} from 'remotion';
import { Waveform } from '../components/Waveform';
import { WordByWordCaption } from '../components/WordByWordCaption';
import { QuoteCard } from '../components/QuoteCard';
import { SplitScreen } from '../components/SplitScreen';
import { ColorGrade } from '../components/ColorGrade';
import { ProgressBar } from '../components/ProgressBar';

// ============================================================
// PodcastClip Composition
// Supports: audiogram, split-screen, quote cards, waveform,
// word-by-word captions, multi-speaker layout.
// Formats: 9:16 (1080x1920) or 16:9 (1920x1080) — set in Root.tsx
// ============================================================

export type PodcastSpeaker = {
  name: string;
  videoSrc?: string;         // webcam/face video
  avatarSrc?: string;        // fallback static image
  side?: 'left' | 'right';
};

export type QuoteMoment = {
  text: string;
  speaker?: string;
  from: number;
  durationInFrames: number;
};

export type WordCaption = {
  word: string;
  from: number;
  to: number;
};

export type PodcastClipProps = {
  title: string;
  speakers: PodcastSpeaker[];
  audioSrc: string;          // main podcast audio
  durationInFrames: number;
  wordCaptions: WordCaption[];
  quoteMoments: QuoteMoment[];
  accentColor: string;
  backgroundColor: string;
  showWaveform: boolean;
  waveformStyle?: 'bars' | 'line' | 'mirror';
  layout: 'audiogram' | 'split-screen' | 'single-speaker';
  showProgressBar: boolean;
  podcastName: string;
  episodeNumber?: string;
  logoSrc?: string;
  gradePreset?: 'none' | 'cinematic' | 'warm' | 'cool';
};

export const defaultPodcastClipProps: PodcastClipProps = {
  title: 'Podcast Episode Title',
  speakers: [
    { name: 'Host Name', videoSrc: './public/clips/host.mp4', side: 'left' },
    { name: 'Guest Name', videoSrc: './public/clips/guest.mp4', side: 'right' },
  ],
  audioSrc: './public/audio/podcast.mp3',
  durationInFrames: 30 * 60,
  wordCaptions: [],
  quoteMoments: [
    {
      text: '"The most powerful thing you can do is start before you're ready."',
      speaker: 'Guest Name',
      from: 0,
      durationInFrames: 120,
    },
  ],
  accentColor: '#FF6B35',
  backgroundColor: '#0f0f0f',
  showWaveform: true,
  waveformStyle: 'bars',
  layout: 'split-screen',
  showProgressBar: true,
  podcastName: 'The Podcast Name',
  episodeNumber: 'EP. 42',
  logoSrc: undefined,
  gradePreset: 'none',
};

export const PodcastClip: React.FC<PodcastClipProps> = ({
  title, speakers, audioSrc, wordCaptions, quoteMoments,
  accentColor, backgroundColor, showWaveform, waveformStyle,
  layout, showProgressBar, podcastName, episodeNumber, logoSrc, gradePreset,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  const isVertical = height > width;

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {/* Main audio track */}
      <Audio src={audioSrc} />

      {/* LAYOUT VARIANTS */}
      {layout === 'audiogram' && (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
          {/* Logo / artwork */}
          {logoSrc && (
            <img
              src={logoSrc}
              style={{ width: 280, height: 280, borderRadius: 24, objectFit: 'cover', marginBottom: 40 }}
            />
          )}
          {/* Podcast info */}
          <div style={{
            color: '#fff',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 800,
            fontSize: isVertical ? 52 : 40,
            textAlign: 'center',
            marginBottom: 8,
            padding: '0 60px',
          }}>
            {title}
          </div>
          <div style={{
            color: accentColor,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: isVertical ? 34 : 28,
            textAlign: 'center',
            marginBottom: 60,
          }}>
            {podcastName}{episodeNumber ? ` · ${episodeNumber}` : ''}
          </div>
          {/* Waveform */}
          {showWaveform && (
            <Waveform
              audioSrc={audioSrc}
              style={waveformStyle ?? 'bars'}
              accentColor={accentColor}
              height={isVertical ? 160 : 120}
              width={isVertical ? 800 : 1200}
            />
          )}
        </AbsoluteFill>
      )}

      {layout === 'split-screen' && speakers.length >= 2 && (
        <SplitScreen
          leftVideo={speakers.find(s => s.side === 'left')?.videoSrc}
          rightVideo={speakers.find(s => s.side === 'right')?.videoSrc}
          leftLabel={speakers.find(s => s.side === 'left')?.name ?? ''}
          rightLabel={speakers.find(s => s.side === 'right')?.name ?? ''}
          accentColor={accentColor}
          showWaveform={showWaveform}
          audioSrc={audioSrc}
          waveformStyle={waveformStyle ?? 'bars'}
        />
      )}

      {layout === 'single-speaker' && speakers.length > 0 && (
        <AbsoluteFill>
          <Video
            src={speakers[0].videoSrc ?? ''}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {showWaveform && (
            <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 80 }}>
              <Waveform
                audioSrc={audioSrc}
                style={waveformStyle ?? 'bars'}
                accentColor={accentColor}
                height={100}
                width={800}
              />
            </AbsoluteFill>
          )}
        </AbsoluteFill>
      )}

      {/* COLOR GRADE */}
      {gradePreset && gradePreset !== 'none' && <ColorGrade preset={gradePreset} />}

      {/* QUOTE MOMENTS */}
      {quoteMoments.map((q, i) => (
        <Sequence key={`q-${i}`} from={q.from} durationInFrames={q.durationInFrames}>
          <QuoteCard text={q.text} speaker={q.speaker} accentColor={accentColor} />
        </Sequence>
      ))}

      {/* WORD-BY-WORD CAPTIONS */}
      {wordCaptions.length > 0 && (
        <WordByWordCaption words={wordCaptions} accentColor={accentColor} style={{ bottom: 220 }} />
      )}

      {/* PROGRESS BAR */}
      {showProgressBar && (
        <ProgressBar accentColor={accentColor} chapters={[]} introDuration={0} />
      )}

      {/* BOTTOM BRANDING */}
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'flex-start', pointerEvents: 'none' }}>
        <div style={{
          margin: '0 0 20px 40px',
          color: '#666',
          fontFamily: 'Inter, sans-serif',
          fontSize: 24,
          fontWeight: 500,
        }}>
          {podcastName}{episodeNumber ? ` · ${episodeNumber}` : ''}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
