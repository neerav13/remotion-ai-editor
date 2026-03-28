import React from 'react';
import {
  AbsoluteFill, Audio, Sequence, Video,
  useCurrentFrame, useVideoConfig, interpolate, spring,
} from 'remotion';
import { TransitionOverlay } from '../components/TransitionOverlay';
import { GlitchTransition } from '../components/GlitchTransition';
import { ZoomCut } from '../components/ZoomCut';
import { ColorGrade } from '../components/ColorGrade';
import { BeatText } from '../components/BeatText';
import { WordByWordCaption } from '../components/WordByWordCaption';
import { CaptionTrack } from '../components/CaptionTrack';
import { KineticText } from '../components/KineticText';

// ============================================================
// BRollEdit Composition
// 16:9 | 1920x1080 | 30fps
// Fast-paced b-roll editing with beat-sync, glitch transitions,
// zoom cuts, color grading, kinetic text overlays.
// ============================================================

export type BRollClip = {
  src: string;
  durationInFrames: number;
  startFrom?: number;
  volume?: number;
  transition?: 'cut' | 'dip-black' | 'dip-white' | 'flash' | 'glitch' | 'zoom-blur';
  transitionDuration?: number;  // frames, default 15
  zoomIn?: boolean;
  zoomScale?: number;
  speedLabel?: string;         // e.g. "2x" for pre-processed fast clips
};

export type BeatMoment = {
  frame: number;
  text?: string;              // optional text flash on beat
  flashColor?: string;
};

export type KineticMoment = {
  text: string;
  from: number;
  durationInFrames: number;
  style?: 'slam' | 'typewriter' | 'fly-in' | 'scale-pop';
};

export type BRollEditProps = {
  title?: string;
  clips: BRollClip[];
  musicSrc: string;
  musicVolume: number;
  beatMoments: BeatMoment[];
  kineticMoments: KineticMoment[];
  captions?: Array<{ text: string; from: number; to: number }>;
  accentColor: string;
  gradePreset?: 'none' | 'cinematic' | 'warm' | 'cool' | 'desaturate' | 'vintage' | 'high-contrast';
  defaultTransition?: 'cut' | 'dip-black' | 'flash' | 'glitch';
  flashOnBeat: boolean;
  flashColor?: string;
};

export const defaultBRollEditProps: BRollEditProps = {
  title: 'B-Roll Edit',
  clips: [
    { src: './public/clips/broll1.mp4', durationInFrames: 45, transition: 'cut', zoomIn: true },
    { src: './public/clips/broll2.mp4', durationInFrames: 30, transition: 'flash' },
    { src: './public/clips/broll3.mp4', durationInFrames: 60, transition: 'glitch' },
    { src: './public/clips/broll4.mp4', durationInFrames: 45, transition: 'cut', zoomIn: true },
    { src: './public/clips/broll5.mp4', durationInFrames: 30, transition: 'dip-black' },
    { src: './public/clips/broll6.mp4', durationInFrames: 60, transition: 'cut' },
  ],
  musicSrc: './public/audio/music.mp3',
  musicVolume: 0.9,
  beatMoments: [
    { frame: 30, text: 'UNSTOPPABLE' },
    { frame: 90, text: 'NO LIMITS' },
    { frame: 150 },
    { frame: 210, text: 'GRIND' },
  ],
  kineticMoments: [
    { text: 'THIS CHANGES EVERYTHING', from: 0, durationInFrames: 60, style: 'slam' },
    { text: '100K IN 30 DAYS', from: 120, durationInFrames: 60, style: 'scale-pop' },
  ],
  captions: [],
  accentColor: '#FF006E',
  gradePreset: 'high-contrast',
  defaultTransition: 'cut',
  flashOnBeat: true,
  flashColor: '#ffffff',
};

export const BRollEdit: React.FC<BRollEditProps> = ({
  clips, musicSrc, musicVolume, beatMoments, kineticMoments,
  captions, accentColor, gradePreset, flashOnBeat, flashColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Build clip timeline
  let cursor = 0;
  const timeline = clips.map((clip) => {
    const start = cursor;
    cursor += clip.durationInFrames;
    return { ...clip, start };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Music */}
      <Audio src={musicSrc} volume={musicVolume} />

      {/* CLIPS */}
      {timeline.map((clip, i) => {
        const transDur = clip.transitionDuration ?? 15;
        const nextClip = timeline[i + 1];
        return (
          <Sequence key={i} from={clip.start} durationInFrames={clip.durationInFrames}>
            <ZoomCut enabled={clip.zoomIn ?? false} scale={clip.zoomScale ?? 1.1}>
              <Video
                src={clip.src}
                startFrom={clip.startFrom ? Math.round(clip.startFrom * fps) : 0}
                volume={clip.volume ?? 0}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </ZoomCut>

            {/* Outgoing transition */}
            {nextClip && clip.transition !== 'cut' && (
              <>
                {clip.transition === 'glitch' ? (
                  <GlitchTransition
                    startAt={clip.durationInFrames - transDur}
                    durationInFrames={transDur}
                  />
                ) : (
                  <TransitionOverlay
                    startAt={clip.durationInFrames - transDur}
                    durationInFrames={transDur}
                    type={clip.transition === 'flash' ? 'flash' : clip.transition === 'dip-black' ? 'dip-black' : 'dip-white'}
                  />
                )}
              </>
            )}
          </Sequence>
        );
      })}

      {/* COLOR GRADE */}
      {gradePreset && gradePreset !== 'none' && <ColorGrade preset={gradePreset} />}

      {/* BEAT FLASHES */}
      {flashOnBeat && beatMoments.map((beat, i) => (
        <Sequence key={`beat-${i}`} from={beat.from} durationInFrames={6}>
          <AbsoluteFill style={{
            backgroundColor: flashColor ?? '#ffffff',
            opacity: interpolate(frame - beat.from, [0, 3, 6], [0.6, 0.3, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            pointerEvents: 'none',
          }} />
        </Sequence>
      ))}

      {/* BEAT TEXT */}
      {beatMoments.filter(b => b.text).map((beat, i) => (
        <Sequence key={`beattext-${i}`} from={beat.from} durationInFrames={30}>
          <BeatText text={beat.text!} accentColor={accentColor} />
        </Sequence>
      ))}

      {/* KINETIC TEXT */}
      {kineticMoments.map((k, i) => (
        <Sequence key={`kin-${i}`} from={k.from} durationInFrames={k.durationInFrames}>
          <KineticText text={k.text} style={k.style ?? 'slam'} accentColor={accentColor} />
        </Sequence>
      ))}

      {/* CAPTIONS */}
      {(captions ?? []).map((cap, i) => (
        <Sequence key={`cap-${i}`} from={cap.from} durationInFrames={cap.to - cap.from}>
          <CaptionTrack text={cap.text} accentColor={accentColor} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
