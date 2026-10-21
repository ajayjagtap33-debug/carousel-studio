// Editorial b-roll for a real cut: scenes from broll.json, timed to the transcript. B-roll only (Ajay places
// his face in Google Vids); `withAudio` adds his audio for review renders.
// coverage "full" (default): b-roll throughout, face in the corner box. "spot": a few inserts, face full-frame
// the rest of the time. Per scene `face`: "box" keeps the right edge clear, "hidden" lets the scene fill the frame
// (default: box in full, hidden in spot).
import React from "react";
import { Audio, staticFile } from "remotion";
import { THEMES } from "./themes";
import { LintCtx, Pill, ThemeCtx, useNow } from "./kit";
import { CONTENT_W, FULL_W, Frame, SceneWindow } from "./frame";
import { Lint } from "./lint";
import { ESCENES, type EScene } from "./scenes";
import type { Props } from "../types";

type EPill = { text: string; at: number; tone?: "ink" | "accent" | "soft"; icon?: string; pos?: "top" | "bottom" };
export type EditorialProps = Props & {
  theme?: "A" | "B" | "C"; audio?: string; withAudio?: boolean; faceGuide?: boolean; lint?: boolean;
  coverage?: "full" | "spot"; scenes: EScene[];
};

export const faceBox = (s: EScene, coverage?: string) => (s.face ?? (coverage === "spot" ? "hidden" : "box")) === "box";

export const EditorialMain: React.FC<EditorialProps> = (p) => {
  const T = THEMES[p.theme ?? "C"];
  const t = useNow();
  const scenes = [...p.scenes].sort((a, b) => a.start - b.start);
  const active = scenes.find((s) => t >= s.start - 0.01 && t <= s.end + 0.01);
  const spot = p.coverage === "spot";
  const box = active ? faceBox(active, p.coverage) : !spot;
  const frame = (
    <Frame faceGuide={p.faceGuide && box} faceFull={p.faceGuide && spot && !active}>
      {scenes.map((s, i) => {
        const View = ESCENES[s.type];
        const w = faceBox(s, p.coverage) ? CONTENT_W : FULL_W;
        return (
          <SceneWindow key={i} from={s.start} to={s.end} w={w} first={i === 0} last={i === scenes.length - 1}>
            {View ? <View s={s} /> : <div style={{ color: "red", fontSize: 40 }}>unknown scene type: {s.type}</div>}
            {((s.pills ?? []) as EPill[]).map((pl, j) => (
              <div key={j} style={{ position: "absolute", left: w / 2, top: pl.pos === "bottom" ? 860 : 190, transform: "translateX(-50%)" }}>
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
        {p.lint ? <Lint face={box}>{frame}</Lint> : frame}
      </LintCtx.Provider>
      {p.withAudio && p.audio && <Audio src={staticFile(p.audio)} />}
    </ThemeCtx.Provider>
  );
};
