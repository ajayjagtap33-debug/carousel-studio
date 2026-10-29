// Studio: the finished video. Ajay's cut is the base layer; per beat it sits full frame, as a small tile on one
// edge, or as a big card on one side, and moves between those on the word that starts the beat. Board scenes sit
// on the page behind him; `words` and `type` scenes sit over him (white words straight on the footage; a type card covers the frame).
// Props come from a job's studio.json (see .claude/skills/broll-video/studio.md).
import React from "react";
import { AbsoluteFill, Easing, Img, OffthreadVideo, staticFile } from "remotion";
import { THEMES, ThemeCtx, clamp01, useNow } from "./kit";
import { OVER, SCENES, type Box, type SScene } from "./scenes";

export type Mode = "full" | "tile-right" | "tile-left" | "split-right" | "split-left";
export type StudioProps = {
  video: string; // the cut, in the job folder (public dir)
  media: { fps: number; width: number; height: number; duration: number };
  face?: { x: number; y: number }; // face centre in the source frame (0..1): tiles and cards crop around it
  theme?: keyof typeof THEMES; // "tmv" (default) or "ajay"
  logo?: string; // overrides the theme's wordmark top-left
  layouts: { start: number; mode: Mode }[]; // each holds until the next one starts
  scenes: SScene[];
};

type Rect = { x: number; y: number; w: number; h: number; r: number };
const W = 1920, H = 1080;
const TILE = { w: 250, h: 360, edge: 44 };
const SPLIT = { w: 780, h: 900, edge: 60, top: 116 }; // top clears the wordmark row (logo at y 42–76)
export const RECT: Record<Mode, Rect> = {
  full: { x: 0, y: 0, w: W, h: H, r: 0 },
  "tile-right": { x: W - TILE.edge - TILE.w, y: (H - TILE.h) / 2, w: TILE.w, h: TILE.h, r: 22 },
  "tile-left": { x: TILE.edge, y: (H - TILE.h) / 2, w: TILE.w, h: TILE.h, r: 22 },
  "split-right": { x: W - SPLIT.edge - SPLIT.w, y: SPLIT.top, w: SPLIT.w, h: SPLIT.h, r: 28 },
  "split-left": { x: SPLIT.edge, y: SPLIT.top, w: SPLIT.w, h: SPLIT.h, r: 28 },
};
/** Where a scene may draw, given the layout it starts in. */
export const BOX: Record<Mode, Box> = {
  full: { x: 120, w: 620 }, // the wall left of his face; the punch-in moves him left, so keep clear of x≈800
  "tile-right": { x: 90, w: W - 90 - (TILE.edge + TILE.w + 40) },
  "tile-left": { x: TILE.edge + TILE.w + 40, w: W - 90 - (TILE.edge + TILE.w + 40) },
  "split-right": { x: 60, w: W - SPLIT.edge - SPLIT.w - 60 - 30 },
  "split-left": { x: SPLIT.edge + SPLIT.w + 30, w: W - SPLIT.edge - SPLIT.w - 60 - 30 },
};

const MOVE = 0.55; // seconds a layout change takes
const LEAD = 0.15; // it starts this much before the word, so it has mostly landed when the word is heard
const ease = Easing.inOut(Easing.cubic);
const side = (m: Mode) => (m.endsWith("left") ? "left" : m.endsWith("right") ? "right" : "full");
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** The layout in force at `t` (the one whose start, less LEAD, has passed). */
export const layoutAt = (layouts: StudioProps["layouts"], t: number) => {
  let i = 0;
  for (let k = 0; k < layouts.length; k++) if (layouts[k].start - LEAD <= t) i = k;
  return i;
};

export const Studio: React.FC<StudioProps> = (p) => {
  const t = useNow();
  const C = THEMES[p.theme ?? "tmv"];
  const logo = p.logo ?? C.logo;
  const face = p.face ?? { x: 0.5, y: 0.35 };
  const layouts = [...p.layouts].sort((a, b) => a.start - b.start);
  const i = layoutAt(layouts, t);
  const cur = layouts[i], prev = layouts[i - 1];
  const k = prev ? ease(clamp01((t - (cur.start - LEAD)) / MOVE)) : 1;

  // Punch-in while full frame: 100% → 105% over 5s, eased back out as he shrinks into a tile.
  const zoomOf = (l: { start: number; mode: Mode }) => (l.mode === "full" ? 1 + 0.05 * ease(clamp01((t - l.start) / 5)) : 1);
  const zoom = prev ? lerp(zoomOf(prev), zoomOf(cur), k) : zoomOf(cur);

  // Crossing sides (tile left ↔ split right…) would drag him across the board: dip out and back in instead.
  const cross = prev && prev.mode !== "full" && cur.mode !== "full" && side(prev.mode) !== side(cur.mode);
  const a = RECT[prev ? prev.mode : cur.mode], b = RECT[cur.mode];
  let r: Rect, opacity = 1, scale = 1;
  if (cross) { r = k < 0.5 ? a : b; opacity = Math.abs(1 - 2 * k); scale = 0.92 + 0.08 * Math.abs(1 - 2 * k); }
  else r = { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), w: lerp(a.w, b.w, k), h: lerp(a.h, b.h, k), r: lerp(a.r, b.r, k) };
  const fullness = (prev?.mode === "full" ? 1 - k : 0) + (cur.mode === "full" ? k : 0);
  // a `type` card is the whole frame: hide the chrome under it
  const card = p.scenes.some((s) => s.type === "type" && t >= s.start - 0.1 && t <= s.end + 0.2);

  const scenes = [...p.scenes].sort((x, y) => x.start - y.start);
  const shown = (s: SScene) => t >= s.start - 0.4 && t <= s.end + 0.35;
  const sceneLayer = (s: SScene, j: number) => {
    const View = SCENES[s.type];
    const over = OVER.has(s.type); // draws over his footage, in frame coordinates
    const box = over ? { x: 0, w: W } : BOX[layouts[layoutAt(layouts, s.start + 0.01)].mode];
    const o = clamp01((t - s.end) / 0.3); // exit: smear left, blur, fade
    return (
      <div key={j} style={{ position: "absolute", left: box.x, width: box.w, top: 0, height: H, opacity: 1 - o,
        filter: o > 0 ? `blur(${o * 12}px)` : undefined, transform: over ? undefined : `translateX(${-60 * ease(o)}px)` }}>
        {View ? <View s={s} box={box} face={face} /> : <div style={{ color: "red", fontSize: 40 }}>unknown scene type: {s.type}</div>}
      </div>
    );
  };
  return (
    <ThemeCtx.Provider value={C}>
    <AbsoluteFill style={{ background: C.border }}>
      <div style={{ position: "absolute", inset: 14, borderRadius: 20, background: C.page }} />
      {logo && <Img src={staticFile(logo)} style={{ position: "absolute", left: 50, top: 42, height: 34, opacity: card ? 0 : 1 - fullness }} />}
      {!logo && C.handle && (
        <div style={{ position: "absolute", left: 52, top: 44, fontFamily: C.fonts.plain, fontSize: 26, fontWeight: C.fonts.plainWeight, color: C.ink, opacity: card ? 0 : 1 - fullness }}>{C.handle}</div>
      )}
      {scenes.filter((s) => !OVER.has(s.type) && shown(s)).map(sceneLayer)}

      <div style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: r.r, overflow: "hidden", opacity,
        transform: `scale(${scale})`, boxShadow: fullness > 0.99 ? "none" : "0 2px 4px rgba(0,0,0,0.06), 0 18px 44px rgba(0,0,0,0.16)" }}>
        <OffthreadVideo src={staticFile(p.video)} style={{ width: "100%", height: "100%", objectFit: "cover",
          objectPosition: `${face.x * 100}% ${face.y * 100}%`, transform: `scale(${zoom})`, transformOrigin: `${face.x * 100}% ${face.y * 100}%` }} />
      </div>

      {scenes.filter((s) => OVER.has(s.type) && shown(s)).map(sceneLayer)}
    </AbsoluteFill>
    </ThemeCtx.Provider>
  );
};
