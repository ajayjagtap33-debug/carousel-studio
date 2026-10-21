import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { Sample, SAMPLE_SECONDS } from "./editorial/Sample";
import { EditorialMain } from "./editorial/Main";
import type { Props } from "./types";

// Real props come from scripts/broll.py (props.json = broll.json + media from transcript.json).
const demo: Props = {
  video: "cut.mp4",
  media: { fps: 30, width: 1920, height: 1080, duration: 10 },
  scenes: [],
};

export const Root: React.FC = () => (
  <>
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
    {/* Editorial style: design samples for direction A and B */}
    <Composition id="EditorialSampleA" component={Sample} defaultProps={{ theme: "A" as const }}
      fps={30} width={1920} height={1080} durationInFrames={SAMPLE_SECONDS * 30} />
    <Composition id="EditorialSampleB" component={Sample} defaultProps={{ theme: "B" as const }}
      fps={30} width={1920} height={1080} durationInFrames={SAMPLE_SECONDS * 30} />
    <Composition id="EditorialSampleC" component={Sample} defaultProps={{ theme: "C" as const }}
      fps={30} width={1920} height={1080} durationInFrames={SAMPLE_SECONDS * 30} />
  </>
);
