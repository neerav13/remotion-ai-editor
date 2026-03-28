import { Composition } from 'remotion';
import { YouTubeVideo } from './compositions/YouTubeVideo';
import { ShortsVideo } from './compositions/ShortsVideo';
import { InstagramReel } from './compositions/InstagramReel';
import { ClientVideo } from './compositions/ClientVideo';
import { defaultYouTubeProps } from './compositions/YouTubeVideo';
import { defaultShortsProps } from './compositions/ShortsVideo';
import { defaultInstagramProps } from './compositions/InstagramReel';
import { defaultClientProps } from './compositions/ClientVideo';

// ============================================================
// REMOTION AI EDITOR - Root Composition Registry
// All video templates are registered here.
// Claude Code can modify defaultProps to change content.
// ============================================================

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
        durationInFrames={30 * 60}  // 1 minute
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultShortsProps}
      />

      {/* Instagram Reel (4:5 or 9:16) */}
      <Composition
        id="InstagramReel"
        component={InstagramReel}
        durationInFrames={30 * 30}  // 30 seconds
        fps={30}
        width={1080}
        height={1350}
        defaultProps={defaultInstagramProps}
      />

      {/* Client video (16:9, customizable) */}
      <Composition
        id="ClientVideo"
        component={ClientVideo}
        durationInFrames={30 * 60 * 5} // 5 minutes max
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultClientProps}
      />
    </>
  );
};
