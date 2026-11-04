import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { Sample, SAMPLE_SECONDS } from "./editorial/Sample";
import { EditorialMain } from "./editorial/Main";
import { Studio } from "./studio/Studio";
import { Reel, ReelBook, starts, type ReelBookProps, type ReelProps } from "./reel/Reel";
import { Carousel, SceneCard, CW, CH, type CarouselProps, type SceneCardProps } from "./carousel/Carousel";
import { Thumbnail } from "./thumb/Thumbnail";
import { Promo, PROMO_FRAMES } from "./promo/Promo";
import { Outreach, OUTREACH_FRAMES } from "./outreach/Outreach";
import { ReflukeMain } from "./refluke/Main";
import { ReflukeSample, SAMPLE_SECONDS as REFLUKE_SECONDS } from "./refluke/Sample";
import type { Props } from "./types";

// Real props come from scripts/broll.py (props.json = broll.json + media from transcript.json).
const demo: Props = {
  video: "cut.mp4",
  media: { fps: 30, width: 1920, height: 1080, duration: 10 },
  scenes: [],
};

export const Root: React.FC = () => (
  <>
    {/* YouTube thumbnail, 1280x720 (props: bg, crop, lines, text, arrow; see thumb/Thumbnail.tsx) */}
    <Composition
      id="Thumbnail"
      component={Thumbnail as unknown as React.FC<Record<string, unknown>>}
      defaultProps={{ bg: "frame.png", lines: ["Steal like", "an artist"] } as unknown as Record<string, unknown>}
      fps={30}
      width={1280}
      height={720}
      durationInFrames={1}
    />
    {/* One scene, transparent, for a hand-drawn carousel slide (props from scripts/collage.py) */}
    <Composition
      id="SceneCard"
      component={SceneCard as unknown as React.FC<Record<string, unknown>>}
      defaultProps={{ scene: { type: "count", start: 0, end: 1 }, w: 900, h: 600 } as unknown as Record<string, unknown>}
      fps={30}
      width={900}
      height={600}
      durationInFrames={30}
      calculateMetadata={({ props }) => {
        const p = props as unknown as SceneCardProps;
        return { width: Math.round(p.w), height: Math.round(p.h), durationInFrames: Math.max(1, Math.round((p.scene.end + 0.5) * 30)) };
      }}
    />
    {/* Carousel in the studio look: 4:5 slides built from the video scenes (props from scripts/studio_carousel.py) */}
    <Composition
      id="Carousel"
      component={Carousel as unknown as React.FC<Record<string, unknown>>}
      defaultProps={{ slides: [] } as unknown as Record<string, unknown>}
      fps={30}
      width={CW}
      height={CH}
      durationInFrames={30}
      calculateMetadata={({ props }) => {
        const s = (props as unknown as CarouselProps).slides;
        const end = s.length ? s[s.length - 1].start + s[s.length - 1].dur : 1;
        return { durationInFrames: Math.max(1, Math.round(end * 30)) };
      }}
    />
    {/* Excalidraw style: talking head + face box + hand-drawn scenes */}
    <Composition
      id="Main"
      component={Main as unknown as React.FC<Record<string, unknown>>}
      defaultProps={demo as unknown as Record<string, unknown>}
      fps={30}
      width={1920}
      height={1080}
      durationInFrames={300}
      calculateMetadata={({ props }) => {
        const m = (props as unknown as Props).media;
        return { fps: m.fps, width: m.width, height: m.height, durationInFrames: Math.max(1, Math.round(m.duration * m.fps)) };
      }}
    />
    {/* Editorial style: b-roll only, timed to a real cut (props from scripts/broll.py) */}
    <Composition
      id="EditorialMain"
      component={EditorialMain as unknown as React.FC<Record<string, unknown>>}
      defaultProps={demo as unknown as Record<string, unknown>}
      fps={30}
      width={1920}
      height={1080}
      durationInFrames={300}
      calculateMetadata={({ props }) => {
        const m = (props as unknown as Props).media;
        return { fps: m.fps, width: m.width, height: m.height, durationInFrames: Math.max(1, Math.round(m.duration * m.fps)) };
      }}
    />
    {/* Refluke style: Ajay's own videos (theme adopted from the reference — assets/refluke-broll/library.md) */}
    <Composition
      id="ReflukeMain"
      component={ReflukeMain as unknown as React.FC<Record<string, unknown>>}
      defaultProps={demo as unknown as Record<string, unknown>}
      fps={30}
      width={1920}
      height={1080}
      durationInFrames={300}
      calculateMetadata={({ props }) => {
        const m = (props as unknown as Props).media;
        return { fps: m.fps, width: m.width, height: m.height, durationInFrames: Math.max(1, Math.round(m.duration * m.fps)) };
      }}
    />
    {/* Refluke style: every built scene type, six seconds each, for reviewing the motion */}
    <Composition id="ReflukeSample" component={ReflukeSample} defaultProps={{ faceGuide: true }}
      fps={30} width={1920} height={1080} durationInFrames={REFLUKE_SECONDS * 30} />

    {/* Studio: the finished video, his cut composited with the board (props from a job's studio.json) */}
    <Composition
      id="Studio"
      component={Studio as unknown as React.FC<Record<string, unknown>>}
      defaultProps={{ ...demo, layouts: [{ start: 0, mode: "full" }] } as unknown as Record<string, unknown>}
      fps={30}
      width={1920}
      height={1080}
      durationInFrames={300}
      calculateMetadata={({ props }) => {
        const m = (props as unknown as Props).media;
        return { fps: m.fps, width: 1920, height: 1080, durationInFrames: Math.max(1, Math.round(m.duration * m.fps)) };
      }}
    />
    {/* Reel: the 9:16 look, a list of reference frames played back to back (props: reel-creator/design/book.json) */}
    <Composition
      id="ReelBook"
      component={ReelBook as unknown as React.FC<Record<string, unknown>>}
      defaultProps={{ frames: [] } as unknown as Record<string, unknown>}
      fps={30}
      width={1080}
      height={1920}
      durationInFrames={30}
      calculateMetadata={({ props }) => {
        const f = (props as unknown as ReelBookProps).frames;
        const end = f.length ? starts(f)[f.length - 1] + f[f.length - 1].dur : 1;
        return { durationInFrames: Math.max(1, Math.round(end * 30)) };
      }}
    />
    {/* Reel: a finished 9:16 reel on his cut (props: a job's reel.json, built by its mkreel.py) */}
    <Composition
      id="Reel"
      component={Reel as unknown as React.FC<Record<string, unknown>>}
      defaultProps={{ video: "cut.mp4", duration: 1, beats: [], captions: [] } as unknown as Record<string, unknown>}
      fps={30}
      width={1080}
      height={1920}
      durationInFrames={30}
      calculateMetadata={({ props }) => ({ durationInFrames: Math.max(1, Math.round((props as unknown as ReelProps).duration * 30)) })}
    />
    {/* Promo: a 10-20s motion-graphic promo in the product's own look (props: music = file in the job's publicDir) */}
    <Composition
      id="Promo"
      component={Promo as unknown as React.FC<Record<string, unknown>>}
      defaultProps={{} as unknown as Record<string, unknown>}
      fps={30}
      width={1920}
      height={1080}
      durationInFrames={PROMO_FRAMES}
    />
    {/* SEORankLift outreach video (2026-11-04): him full frame, punch-ins, drawings behind and in front of his cut-out */}
    <Composition
      id="Outreach"
      component={Outreach as unknown as React.FC<Record<string, unknown>>}
      defaultProps={{} as unknown as Record<string, unknown>}
      fps={30}
      width={1920}
      height={1080}
      durationInFrames={OUTREACH_FRAMES}
    />
    {/* Editorial style: design samples for direction A and B */}
    <Composition id="EditorialSampleA" component={Sample} defaultProps={{ theme: "A" as const }}
      fps={30} width={1920} height={1080} durationInFrames={SAMPLE_SECONDS * 30} />
    <Composition id="EditorialSampleB" component={Sample} defaultProps={{ theme: "B" as const }}
      fps={30} width={1920} height={1080} durationInFrames={SAMPLE_SECONDS * 30} />
    <Composition id="EditorialSampleC" component={Sample} defaultProps={{ theme: "C" as const }}
      fps={30} width={1920} height={1080} durationInFrames={SAMPLE_SECONDS * 30} />
  </>
);
