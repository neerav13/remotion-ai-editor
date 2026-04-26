import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont('normal', {
  weights: ['400', '600', '700', '800'],
  subsets: ['latin'],
});

// ── Palette ─────────────────────────────────────────────────────
const BG = '#000000';
const WHITE = '#FFFFFF';
const GRAY = '#888888';
const AXIS = '#333333';
const TICK = '#444444';

// ── Scene durations (frames, includes 6-frame overlap per transition)
// 6 scenes × 5 transitions × 6 frames each = 750 total (25 s at 30 fps)
const TRANS = 6;
const S1 = 156; // 5 s
const S2 = 156; // 5 s
const S3 = 126; // 4 s
const S4 = 126; // 4 s
const S5 = 126; // 4 s
const S6 = 90;  // 3 s

// ── SVG chart paths ──────────────────────────────────────────────
// Coordinate space: chart area 700 wide × 280 tall.
// Y=0 → 100 % viewers  |  Y=280 → 0 % viewers
const BAD_PATH =
  'M 0,0 C 50,0 100,200 175,238 C 240,262 300,264 350,263 C 480,261 580,265 700,266';
const GOOD_PATH =
  'M 0,0 C 40,8 120,20 175,28 C 255,40 310,72 350,84 C 430,100 480,118 525,126 C 600,140 655,150 700,154';
const DASHARRAY = 1200;

// ── Retention chart ──────────────────────────────────────────────
const RetentionChart: React.FC<{
  type: 'bad' | 'good';
  drawProgress: number;
}> = ({ type, drawProgress }) => {
  const dashOffset = DASHARRAY * (1 - drawProgress);
  const path = type === 'bad' ? BAD_PATH : GOOD_PATH;
  const ticks: Array<{ y: number; label: string }> = [
    { y: 0, label: '100%' },
    { y: 140, label: '50%' },
    { y: 280, label: '0%' },
  ];

  return (
    <svg
      width={860}
      height={340}
      viewBox="0 0 860 340"
      style={{ overflow: 'visible' }}
    >
      {/* Y-axis label */}
      <text
        x={16}
        y={160}
        textAnchor="middle"
        fill={GRAY}
        fontSize={20}
        fontFamily={fontFamily}
        transform="rotate(-90, 16, 160)"
      >
        Viewers Remaining
      </text>

      {/* Chart area — translated so (0,0) = top-left of plot */}
      <g transform="translate(80, 20)">
        {/* Axes */}
        <line x1={0} y1={0} x2={0} y2={280} stroke={AXIS} strokeWidth={1} />
        <line x1={0} y1={280} x2={700} y2={280} stroke={AXIS} strokeWidth={1} />

        {/* Y-axis ticks + labels */}
        {ticks.map(({ y, label }) => (
          <React.Fragment key={y}>
            <line x1={-5} y1={y} x2={0} y2={y} stroke={TICK} strokeWidth={1} />
            <text
              x={-12}
              y={y + 6}
              textAnchor="end"
              fill={GRAY}
              fontSize={20}
              fontFamily={fontFamily}
            >
              {label}
            </text>
          </React.Fragment>
        ))}

        {/* Animated retention line */}
        <path
          d={path}
          stroke={WHITE}
          strokeWidth={2.5}
          fill="none"
          strokeDasharray={DASHARRAY}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* X-axis label */}
      <text
        x={430}
        y={330}
        textAnchor="middle"
        fill={GRAY}
        fontSize={20}
        fontFamily={fontFamily}
      >
        Video Duration
      </text>
    </svg>
  );
};

// ── Scene 1: Bad Retention (156 frames) ─────────────────────────
const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Whole scene springs from 0.95 → 1.0
  const entryS = spring({ frame, fps, config: { damping: 200 } });
  const sceneScale = interpolate(entryS, [0, 1], [0.95, 1.0]);

  // Label slides in from the left
  const labelS = spring({ frame, fps, config: { damping: 200 } });
  const labelX = interpolate(labelS, [0, 1], [-60, 0]);

  // Chart draws itself over 60 frames starting at frame 18
  const drawProgress = interpolate(frame, [18, 78], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Statement fades in
  const statOpacity = interpolate(frame, [80, 100], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Chart exits with spring shrink before scene fade-out
  const exitT = interpolate(frame, [130, 148], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const chartExitScale = interpolate(exitT, [0, 1], [1, 0.88]);
  const chartExitOpacity = interpolate(exitT, [0, 1], [1, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '150px 80px 170px',
      }}
    >
      <div
        style={{
          transform: `scale(${sceneScale})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 40,
          width: '100%',
        }}
      >
        {/* Label */}
        <div
          style={{
            transform: `translateX(${labelX}px)`,
            opacity: labelS,
            fontFamily,
            fontSize: 32,
            fontWeight: 400,
            color: GRAY,
            letterSpacing: '0.05em',
            textAlign: 'center',
          }}
        >
          YOUR RETENTION GRAPH RIGHT NOW
        </div>

        {/* Chart */}
        <div
          style={{
            transform: `scale(${chartExitScale})`,
            opacity: chartExitOpacity,
          }}
        >
          <RetentionChart type="bad" drawProgress={drawProgress} />
        </div>

        {/* Statement */}
        <div
          style={{
            opacity: statOpacity,
            fontFamily,
            fontSize: 40,
            fontWeight: 600,
            color: WHITE,
            textAlign: 'center',
            maxWidth: 860,
            lineHeight: 1.3,
          }}
        >
          Most people leave in the first 5 seconds.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 2: Good Retention (156 frames) ────────────────────────
const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Chart scales in with spring (matches Scene 1 exit)
  const chartS = spring({ frame, fps, config: { damping: 200 } });
  const chartEntryScale = interpolate(chartS, [0, 1], [0.88, 1.0]);

  // Label slides in
  const labelS = spring({ frame, fps, config: { damping: 200 } });
  const labelX = interpolate(labelS, [0, 1], [-60, 0]);

  // Chart draw
  const drawProgress = interpolate(frame, [18, 78], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Statement fade
  const statOpacity = interpolate(frame, [80, 100], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '150px 80px 170px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 40,
          width: '100%',
        }}
      >
        {/* Label */}
        <div
          style={{
            transform: `translateX(${labelX}px)`,
            opacity: labelS,
            fontFamily,
            fontSize: 32,
            fontWeight: 400,
            color: GRAY,
            letterSpacing: '0.05em',
            textAlign: 'center',
          }}
        >
          YOUR RETENTION GRAPH AFTER THIS
        </div>

        {/* Chart scales in to mirror Scene 1 chart exit */}
        <div
          style={{
            transform: `scale(${chartEntryScale})`,
            opacity: chartS,
          }}
        >
          <RetentionChart type="good" drawProgress={drawProgress} />
        </div>

        {/* Statement */}
        <div
          style={{
            opacity: statOpacity,
            fontFamily,
            fontSize: 40,
            fontWeight: 600,
            color: WHITE,
            textAlign: 'center',
            maxWidth: 860,
            lineHeight: 1.3,
          }}
        >
          Viewers stay. The algorithm pushes it.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: The Mechanism (126 frames) ─────────────────────────
const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s1 = spring({ frame, fps, config: { damping: 200 } });
  const s2 = spring({ frame: Math.max(0, frame - 12), fps, config: { damping: 200 } });
  const sSub = spring({ frame: Math.max(0, frame - 32), fps, config: { damping: 200 } });

  const slideY = (s: number) => interpolate(s, [0, 1], [30, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '150px 80px 170px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
        }}
      >
        {/* "One skill." */}
        <div
          style={{
            opacity: s1,
            transform: `translateY(${slideY(s1)}px)`,
            fontFamily,
            fontSize: 80,
            fontWeight: 800,
            color: WHITE,
            textAlign: 'center',
          }}
        >
          One skill.
        </div>

        {/* "One prompt." — staggered 12 frames */}
        <div
          style={{
            opacity: s2,
            transform: `translateY(${slideY(s2)}px)`,
            fontFamily,
            fontSize: 80,
            fontWeight: 800,
            color: WHITE,
            textAlign: 'center',
          }}
        >
          One prompt.
        </div>

        {/* Supporting text — staggered 20 frames after line 2 */}
        <div
          style={{
            opacity: sSub,
            marginTop: 24,
            fontFamily,
            fontSize: 40,
            fontWeight: 400,
            color: GRAY,
            textAlign: 'center',
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          That is all it takes to animate your videos.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 4: Meta Moment (126 frames) ───────────────────────────
const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = spring({ frame: Math.max(0, frame - 5), fps, config: { damping: 200 } });
  const scale = interpolate(s, [0, 1], [0.9, 1.0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '150px 80px 170px',
      }}
    >
      <div
        style={{
          opacity: s,
          transform: `scale(${scale})`,
          fontFamily,
          fontSize: 56,
          fontWeight: 700,
          color: WHITE,
          textAlign: 'center',
          maxWidth: 880,
          lineHeight: 1.35,
        }}
      >
        This video was animated entirely by Claude Code.
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 5: How To (126 frames) ────────────────────────────────
const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s1 = spring({ frame, fps, config: { damping: 200 } });
  const s2 = spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 200 } });
  const taglineOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const slideY = (s: number) => interpolate(s, [0, 1], [20, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '150px 80px 170px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 40,
          width: '100%',
          maxWidth: 860,
        }}
      >
        {/* Step 01 */}
        <div
          style={{
            opacity: s1,
            transform: `translateY(${slideY(s1)}px)`,
            display: 'flex',
            gap: 24,
            alignItems: 'baseline',
          }}
        >
          <span style={{ fontFamily, fontSize: 44, fontWeight: 600, color: GRAY }}>
            01
          </span>
          <span style={{ fontFamily, fontSize: 44, fontWeight: 600, color: WHITE }}>
            Upload the Remotion skill
          </span>
        </div>

        {/* Step 02 — staggered 15 frames */}
        <div
          style={{
            opacity: s2,
            transform: `translateY(${slideY(s2)}px)`,
            display: 'flex',
            gap: 24,
            alignItems: 'baseline',
          }}
        >
          <span style={{ fontFamily, fontSize: 44, fontWeight: 600, color: GRAY }}>
            02
          </span>
          <span style={{ fontFamily, fontSize: 44, fontWeight: 600, color: WHITE }}>
            Paste your prompt
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            opacity: taglineOpacity,
            marginTop: 8,
            fontFamily,
            fontSize: 36,
            fontWeight: 400,
            color: GRAY,
          }}
        >
          That is it.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 6: CTA (90 frames) ────────────────────────────────────
const Scene6: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const ctaS = spring({ frame: Math.max(0, frame - 5), fps, config: { damping: 200 } });
  const ctaScale = interpolate(ctaS, [0, 1], [0.9, 1.0]);

  const subOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Smooth looping pulse on "ANIMATE" (period: 60 frames)
  const pulseScale = 1.0 + 0.02 * Math.sin((frame / 60) * Math.PI * 2);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '150px 80px 170px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 36,
        }}
      >
        {/* CTA line */}
        <div
          style={{
            opacity: ctaS,
            transform: `scale(${ctaScale})`,
            fontFamily,
            fontSize: 64,
            fontWeight: 800,
            color: WHITE,
            textAlign: 'center',
          }}
        >
          Comment{' '}
          <span
            style={{
              display: 'inline-block',
              transform: `scale(${pulseScale})`,
            }}
          >
            ANIMATE
          </span>{' '}
          below.
        </div>

        {/* Sub text */}
        <div
          style={{
            opacity: subOpacity,
            fontFamily,
            fontSize: 36,
            fontWeight: 400,
            color: GRAY,
            textAlign: 'center',
            maxWidth: 780,
            lineHeight: 1.4,
          }}
        >
          I will send you the exact skill and prompt.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Main composition ─────────────────────────────────────────────
export const RetentionMotionGraphic: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={S1}>
        <Scene1 />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: TRANS })}
      />
      <TransitionSeries.Sequence durationInFrames={S2}>
        <Scene2 />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: TRANS })}
      />
      <TransitionSeries.Sequence durationInFrames={S3}>
        <Scene3 />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: TRANS })}
      />
      <TransitionSeries.Sequence durationInFrames={S4}>
        <Scene4 />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: TRANS })}
      />
      <TransitionSeries.Sequence durationInFrames={S5}>
        <Scene5 />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: TRANS })}
      />
      <TransitionSeries.Sequence durationInFrames={S6}>
        <Scene6 />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);
