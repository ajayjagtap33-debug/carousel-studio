// Editorial b-roll for a real cut: scenes from broll.json, timed to the transcript. B-roll only (Ajay places
// his face in Google Vids); `withAudio` adds his audio for review renders.
// coverage "full" (default): b-roll throughout, face in the corner box. "spot": a few inserts, face full-frame
// the rest of the time. Per scene `face`: "right" keeps the right edge clear, "left" the left edge, "none" lets
// the scene fill the frame (default: right in full, none in spot; "box"/"hidden" are the old names for right/none).
import React from "react";
import { Audio, staticFile } from "remotion";
import { THEMES } from "./themes";
import { LintCtx, Pill, ThemeCtx, useNow } from "./kit";
import { CONTENT_W, FULL_W, Frame, SceneWindow, type FaceSide } from "./frame";
import { Lint } from "./lint";
import { ESCENES, type EScene } from "./scenes";
import type { Props } from "../types";

type EPill = { text: string; at: number; tone?: "ink" | "accent" | "soft"; icon?: string; pos?: "top" | "bottom" };
export type EditorialProps = Props & {
  theme?: "A" | "B" | "C"; audio?: string; withAudio?: boolean; faceGuide?: boolean; lint?: boolean;
  coverage?: "full" | "spot"; scenes: EScene[];
};

/** Which side the face sits on for this scene. "box"/"hidden" are the old names for "right"/"none". */
export const faceSide = (s: EScene, coverage?: string): FaceSide => {
  const v = s.face ?? (coverage === "spot" ? "none" : "right");
  return v === "box" ? "right" : v === "hidden" ? "none" : (v as FaceSide);
};

export const EditorialMain: React.FC<EditorialProps> = (p) => {
  const T = THEMES[p.theme ?? "C"];
  const t = useNow();
  const scenes = [...p.scenes].sort((a, b) => a.start - b.start);
  const active = scenes.find((s) => t >= s.start - 0.01 && t <= s.end + 0.01);
  const spot = p.coverage === "spot";
  const side: FaceSide = active ? faceSide(active, p.coverage) : spot ? "none" : "right";
  const frame = (
    <Frame faceGuide={p.faceGuide ? side : false} faceFull={p.faceGuide && spot && !active}>
      {scenes.map((s, i) => {
        const View = ESCENES[s.type];
        const sSide = faceSide(s, p.coverage);
        const w = sSide === "none" ? FULL_W : CONTENT_W;
        return (
          <SceneWindow key={i} from={s.start} to={s.end} w={w} faceSide={sSide} first={i === 0} last={i === scenes.length - 1}>
            {View ? <View s={s} /> : <div style={{ color: "red", fontSize: 40 }}>unknown scene type: {s.type}</div>}
            {((s.pills ?? []) as EPill[]).map((pl, j) => (
              <div key={j} style={{ position: "absolute", left: 0, top: pl.pos === "bottom" ? 880 : 150 }}>
                <Pill at={pl.at} tone={pl.tone} icon={pl.icon}>{pl.text}</Pill>
              </div>
            ))}
          </SceneWindow>
        );
      })}
    </Frame>
  );
  return (
    <ThemeCtx.Provider value={T}>
      <LintCtx.Provider value={!!p.lint}>
        {p.lint ? <Lint face={side}>{frame}</Lint> : frame}
      </LintCtx.Provider>
      {p.withAudio && p.audio && <Audio src={staticFile(p.audio)} />}
    </ThemeCtx.Provider>
  );
};
