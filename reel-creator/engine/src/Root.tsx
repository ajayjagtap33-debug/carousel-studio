import React from "react";
import { Composition } from "remotion";
import { Reel, type ReelProps } from "./Reel";

const demo: ReelProps = { video: "cut.mp4", duration: 5, segments: [{ start: 0, end: 5, layout: "fth" }], captions: [] };

export const Root: React.FC = () => (
  <Composition
    id="Reel"
    component={Reel as unknown as React.FC<Record<string, unknown>>}
    defaultProps={demo as unknown as Record<string, unknown>}
    fps={30}
    width={1080}
    height={1920}
    durationInFrames={150}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.max(1, Math.round((props as unknown as ReelProps).duration * 30)) })}
  />
);
