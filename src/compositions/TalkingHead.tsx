import React from 'react';
import {
  AbsoluteFill, Audio, Img, Sequence, Video,
  interpolate, spring, useCurrentFrame, useVideoConfig,
} from 'remotion';
import { CaptionTrack } from '../components/CaptionTrack';
import { WordByWordCaption } from '../components/WordByWordCaption';
import { LowerThird } from '../components/LowerThird';
import { ChapterMarker } from '../components/ChapterMarker';
import { ProgressBar } from '../components/ProgressBar';
import { PictureInPicture } from '../components/PictureInPicture';
import { ColorGrade } from '../components/ColorGrade';
import { ZoomCut } from '../components/ZoomCut';
import { IntroCard } from '../components/IntroCard';
import { OutroCard } from '../components/OutroCard';

// ============================================================
// TalkingHead Composition
// 16:9 | 1920x1080 | 30fps
// For interview-style, solo presenter, tutorial, vlog content.
// Supports: captions, chapters, PiP, zoom cuts, progress bar,
// color grade, lower thirds, background blur overlay.
// ============================================================

export type TalkingHeadClip = {
  src: string;
  startFrom?: number;         // seconds into source clip to start
  durationInFrames: number;
  volume?: number;
  label?: string;             // triggers a lower third
  chapterTitle?: string;      // triggers a chapter marker
  zoomIn?: boolean;           // punch-in zoom cut at start of clip
  zoomScale?: number;         // 1.0–1.3, default 1.1
};

export type TalkingHeadCaption = {
  text: string;
  from: number;
  to: number;
};

export type WordCaption = {
  word: string;
  from: number;
  to: number;
};

export type TalkingHeadChapter = {
  title: string;
  from: number;               // frame
};

export type PiPSource = {
  src: string;
  from: number;
  durationInFrames: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  size?: number;              // 0.2–0.4, fraction of screen width
};

export type TalkingHeadProps = {
  title: string;
  speaker: string;
  speakerTitle?: string;
  clips: TalkingHeadClip[];
  captions: TalkingHeadCaption[];
  wordCaptions?: WordCaption[];
  chapters: TalkingHeadChapter[];
  pipSources?: PiPSource[];
  musicSrc?: string;
  musicVolume: number;
  accentColor: string;
  showProgressBar: boolean;
  showIntro: boolean;
  showOutro: boolean;
  introDuration: number;
  outroDuration: number;
  ctaText: string;
  logoSrc?: string;
  gradePreset?: 'none' | 'cinematic' | 'warm' | 'cool' | 'desaturate' | 'vintage';
  captionStyle?: 'block' | 'word-by-word';
  backgroundBlur?: boolean;
};

export const defaultTalkingHeadProps: TalkingHeadProps = {
  title: 'Talking Head Video',
  speaker: 'Speaker Name',
  speakerTitle: 'CEO, Company',
  clips: [
    { src: './public/clips/speaker1.mp4', durationInFrames: 150, label: 'Speaker Name', chapterTitle: 'Introduction' },
    { src: './public/clips/speaker2.mp4', durationInFrames: 300, zoomIn: true },
    { src: './public/clips/speaker3.mp4', durationInFrames: 240, chapterTitle: 'Main Point' },
    { src: './public/clips/speaker4.mp4', durationInFrames: 180 },
  ],
  captions: [
    { text: 'Welcome to this video.', from: 0, to: 60 },
    { text: 'Today I want to share something important.', from: 60, to: 120 },
  ],
  wordCaptions: [],
  chapters: [
    { title: 'Introduction', from: 0 },
    { title: 'Main Content', from: 300 },
  ],
  pipSources: [],
  musicSrc: undefined,
  musicVolume: 0.08,
  accentColor: '#FF6B35',
  showProgressBar: true,
  showIntro: true,
  showOutro: true,
  introDuration: 90,
  outroDuration: 150,
  ctaText: 'Subscribe for more',
  logoSrc: undefined,
  gradePreset: 'cinematic',
  captionStyle: 'block',
  backgroundBlur: false,
};

export const TalkingHead: React.FC<TalkingHeadProps> = (props) => {
  const {
    title, speaker, speakerTitle, clips, captions, wordCaptions,
    chapters, pipSources, musicSrc, musicVolume, accentColor,
    showProgressBar, showIntro, showOutro, introDuration, outroDuration,
    ctaText, logoSrc, gradePreset, captionStyle, backgroundBlur,
  } = props;

  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const introDur = showIntro ? introDuration : 0;
  const outroDur = showOutro ? outroDuration : 0;

  // Build clip timeline
  let cursor = introDur;
  const timeline = clips.map((clip) => {
    const start = cursor;
    cursor += clip.durationInFrames;
    return { ...clip, start };
  });
  const clipsDuration = clips.reduce((s, c) => s + c.durationInFrames, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Background music */}
      {musicSrc && <Audio src={musicSrc} volume={musicVolume} loop />}

      {/* INTRO */}
      {showIntro && (
        <Sequence from={0} durationInFrames={introDur}>
          <IntroCard title={title} creator={speaker} accentColor={accentColor} logoSrc={logoSrc} />
        </Sequence>
      )}

      {/* CLIPS */}
      {timeline.map((clip, i) => (
        <Sequence key={i} from={clip.start} durationInFrames={clip.durationInFrames}>
          {/* Optional background blur layer (for vertical→horizontal reframe) */}
          {backgroundBlur && (
            <AbsoluteFill style={{ filter: 'blur(24px)', transform: 'scale(1.15)', overflow: 'hidden' }}>
              <Video
                src={clip.src}
                startFrom={clip.startFrom ? Math.round(clip.startFrom * fps) : 0}
                volume={0}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </AbsoluteFill>
          )}
          {/* Main video */}
          <ZoomCut enabled={clip.zoomIn ?? false} scale={clip.zoomScale ?? 1.12}>
            <Video
              src={clip.src}
              startFrom={clip.startFrom ? Math.round(clip.startFrom * fps) : 0}
              volume={clip.volume ?? 1}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </ZoomCut>
          {/* Lower third on first clip or when label set */}
          {clip.label && (
            <Sequence from={5} durationInFrames={Math.min(120, clip.durationInFrames - 5)}>
              <LowerThird text={clip.label} subtext={speakerTitle} accentColor={accentColor} />
            </Sequence>
          )}
          {/* Chapter marker */}
          {clip.chapterTitle && (
            <Sequence from={0} durationInFrames={60}>
              <ChapterMarker title={clip.chapterTitle} accentColor={accentColor} />
            </Sequence>
          )}
        </Sequence>
      ))}

      {/* COLOR GRADE */}
      {gradePreset && gradePreset !== 'none' && (
        <ColorGrade preset={gradePreset} />
      )}

      {/* CAPTIONS */}
      {captionStyle === 'block' && captions.map((cap, i) => (
        <Sequence key={`cap-${i}`} from={introDur + cap.from} durationInFrames={cap.to - cap.from}>
          <CaptionTrack text={cap.text} accentColor={accentColor} />
        </Sequence>
      ))}
      {captionStyle === 'word-by-word' && wordCaptions && wordCaptions.length > 0 && (
        <WordByWordCaption words={wordCaptions} accentColor={accentColor} />
      )}

      {/* PICTURE-IN-PICTURE */}
      {(pipSources ?? []).map((pip, i) => (
        <Sequence key={`pip-${i}`} from={introDur + pip.from} durationInFrames={pip.durationInFrames}>
          <PictureInPicture
            src={pip.src}
            position={pip.position ?? 'top-right'}
            size={pip.size ?? 0.28}
            accentColor={accentColor}
          />
        </Sequence>
      ))}

      {/* PROGRESS BAR */}
      {showProgressBar && (
        <ProgressBar accentColor={accentColor} chapters={chapters} introDuration={introDur} />
      )}

      {/* OUTRO */}
      {showOutro && (
        <Sequence from={introDur + clipsDuration} durationInFrames={outroDur}>
          <OutroCard title={title} creator={speaker} ctaText={ctaText} accentColor={accentColor} logoSrc={logoSrc} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
