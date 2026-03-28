import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  Video,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import { IntroCard } from '../components/IntroCard';
import { LowerThird } from '../components/LowerThird';
import { CaptionTrack } from '../components/CaptionTrack';
import { OutroCard } from '../components/OutroCard';
import { Watermark } from '../components/Watermark';
import { CallToAction } from '../components/CallToAction';

// ============================================================
// ClientVideo Composition
// 16:9 | 1920x1080 | 30fps — for client deliverables
// Fully brandable with custom colors, logo, watermark
// ============================================================

export type ClientScene = {
  src: string;
  durationInFrames: number;
  startFrom?: number;
  volume?: number;
  label?: string;
};

export type ClientCaption = {
  text: string;
  from: number;
  to: number;
};

export type CTA = {
  text: string;
  subtext?: string;
  from: number;
  durationInFrames: number;
};

export type ClientVideoProps = {
  // Brand
  brandName: string;
  brandTagline: string;
  brandColor: string;
  secondaryColor: string;
  logoSrc?: string;
  watermarkText?: string;
  // Scenes
  scenes: ClientScene[];
  captions: ClientCaption[];
  ctas: CTA[];
  // Audio
  narrationSrc?: string;
  musicSrc?: string;
  musicVolume: number;
  narrationVolume: number;
  // Structure
  showIntro: boolean;
  showOutro: boolean;
  introDuration: number;
  outroDuration: number;
  outroCtaText: string;
  outroWebsite?: string;
  // Options
  showWatermark: boolean;
  showCaptions: boolean;
};

export const defaultClientProps: ClientVideoProps = {
  brandName: 'Client Brand',
  brandTagline: 'Your tagline here',
  brandColor: '#1A73E8',
  secondaryColor: '#FFFFFF',
  logoSrc: undefined,
  watermarkText: 'DRAFT',
  scenes: [
    { src: './public/clips/client1.mp4', durationInFrames: 150 },
    { src: './public/clips/client2.mp4', durationInFrames: 180 },
  ],
  captions: [],
  ctas: [],
  narrationSrc: undefined,
  musicSrc: undefined,
  musicVolume: 0.1,
  narrationVolume: 1.0,
  showIntro: true,
  showOutro: true,
  introDuration: 90,
  outroDuration: 150,
  outroCtaText: 'Contact us today',
  outroWebsite: 'www.example.com',
  showWatermark: true,
  showCaptions: true,
};

export const ClientVideo: React.FC<ClientVideoProps> = ({
  brandName,
  brandTagline,
  brandColor,
  secondaryColor,
  logoSrc,
  watermarkText,
  scenes,
  captions,
  ctas,
  narrationSrc,
  musicSrc,
  musicVolume,
  narrationVolume,
  showIntro,
  showOutro,
  introDuration,
  outroDuration,
  outroCtaText,
  outroWebsite,
  showWatermark,
  showCaptions,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introDur = showIntro ? introDuration : 0;
  const outroDur = showOutro ? outroDuration : 0;

  let currentStart = introDur;
  const sceneWithOffsets = scenes.map((scene) => {
    const start = currentStart;
    currentStart += scene.durationInFrames;
    return { ...scene, start };
  });

  const scenesDuration = scenes.reduce((sum, s) => sum + s.durationInFrames, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Audio tracks */}
      {musicSrc && <Audio src={musicSrc} volume={musicVolume} loop />}
      {narrationSrc && <Audio src={narrationSrc} volume={narrationVolume} />}

      {/* INTRO */}
      {showIntro && (
        <Sequence from={0} durationInFrames={introDur}>
          <IntroCard
            title={brandName}
            creator={brandTagline}
            accentColor={brandColor}
            logoSrc={logoSrc}
          />
        </Sequence>
      )}

      {/* SCENES */}
      {sceneWithOffsets.map((scene, i) => (
        <Sequence key={i} from={scene.start} durationInFrames={scene.durationInFrames}>
          <Video
            src={scene.src}
            startFrom={scene.startFrom ? Math.round(scene.startFrom * fps) : 0}
            volume={scene.volume ?? 1}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {scene.label && (
            <LowerThird text={scene.label} accentColor={brandColor} />
          )}
        </Sequence>
      ))}

      {/* CAPTIONS */}
      {showCaptions && captions.map((cap, i) => (
        <Sequence key={`cap-${i}`} from={introDur + cap.from} durationInFrames={cap.to - cap.from}>
          <CaptionTrack text={cap.text} accentColor={brandColor} />
        </Sequence>
      ))}

      {/* CTAs */}
      {ctas.map((cta, i) => (
        <Sequence key={`cta-${i}`} from={introDur + cta.from} durationInFrames={cta.durationInFrames}>
          <CallToAction text={cta.text} subtext={cta.subtext} accentColor={brandColor} />
        </Sequence>
      ))}

      {/* OUTRO */}
      {showOutro && (
        <Sequence from={introDur + scenesDuration} durationInFrames={outroDur}>
          <OutroCard
            title={brandName}
            creator={outroWebsite ?? brandTagline}
            ctaText={outroCtaText}
            accentColor={brandColor}
            logoSrc={logoSrc}
          />
        </Sequence>
      )}

      {/* DRAFT WATERMARK */}
      {showWatermark && watermarkText && (
        <Watermark text={watermarkText} />
      )}
    </AbsoluteFill>
  );
};
