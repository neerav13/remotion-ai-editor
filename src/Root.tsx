import { Composition } from 'remotion';
import { YouTubeVideo, defaultYouTubeProps } from './compositions/YouTubeVideo';
import { ShortsVideo, defaultShortsProps } from './compositions/ShortsVideo';
import { InstagramReel, defaultInstagramProps } from './compositions/InstagramReel';
import { ClientVideo, defaultClientProps } from './compositions/ClientVideo';
import { TalkingHead, defaultTalkingHeadProps } from './compositions/TalkingHead';
import { PodcastClip, defaultPodcastProps } from './compositions/PodcastClip';
import { BRollEdit, defaultBRollProps } from './compositions/BRollEdit';
import { MotionGraphics, defaultMotionGraphicsProps } from './compositions/MotionGraphics';

// ============================================================
// REMOTION AI EDITOR - Root Composition Registry
// All video templates are registered here.
// Claude Code reads this file to know what compositions exist.
// To add a new composition: import it, then add a <Composition /> entry below.
// ============================================================

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ── PLATFORM TEMPLATES ─────────────────────────────── */}

      {/* Full-length YouTube video (16:9, 1080p) */}
      <Composition
        id="YouTubeVideo"
        component={YouTubeVideo}
        durationInFrames={30 * 60 * 10} // 10 minutes max, overridden by props
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultYouTubeProps}
      />

      {/* YouTube Shorts / TikTok / Vertical (9:16) */}
      <Composition
        id="ShortsVideo"
        component={ShortsVideo}
        durationInFrames={30 * 60} // 1 minute
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultShortsProps}
      />

      {/* Instagram Reel (4:5) */}
      <Composition
        id="InstagramReel"
        component={InstagramReel}
        durationInFrames={30 * 30} // 30 seconds
        fps={30}
        width={1080}
        height={1350}
        defaultProps={defaultInstagramProps}
      />

      {/* Client video (16:9, fully branded) */}
      <Composition
        id="ClientVideo"
        component={ClientVideo}
        durationInFrames={30 * 60 * 5} // 5 minutes max
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultClientProps}
      />

      {/* ── CONTENT TYPE TEMPLATES ─────────────────────────── */}

      {/* Talking head / interview (face-to-camera with optional b-roll) */}
      <Composition
        id="TalkingHead"
        component={TalkingHead}
        durationInFrames={30 * 60 * 20} // 20 minutes max
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultTalkingHeadProps}
      />

      {/* Long-form podcast clip (multi-speaker, waveform, chapters) */}
      <Composition
        id="PodcastClip"
        component={PodcastClip}
        durationInFrames={30 * 60 * 60} // 60 minutes max
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultPodcastProps}
      />

      {/* Fast-paced b-roll montage (beat-synced cuts) */}
      <Composition
        id="BRollEdit"
        component={BRollEdit}
        durationInFrames={30 * 60 * 5} // 5 minutes max
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultBRollProps}
      />

      {/* Animated motion graphics / explainer / data visualization */}
      <Composition
        id="MotionGraphics"
        component={MotionGraphics}
        durationInFrames={30 * 60 * 5} // 5 minutes max
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultMotionGraphicsProps}
      />
    </>
  );
};
