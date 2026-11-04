// Carousels in the studio look (storyboard.json "theme": "studio"): the same scenes as the videos, on a 4:5 slide.
// Chrome is only the handle and n/N → (CLAUDE.md); one thing leads: the headline, an optional short line, then the
// scene in the visual box below. Each slide plays its build (headline, then the scene's own animation) for the
// animated versions; the static slides are each slide's last frame. Props come from scripts/studio_carousel.py.
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import { SCENES, type SScene } from "../studio/scenes";
import { THEMES, ThemeCtx, clamp01, ramp, useNow } from "../studio/kit";

export const CW = 1080, CH = 1350;
const PAD = 90, VIS_X = 50, FOOT = 150;
const ease = Easing.inOut(Easing.cubic);

type Line = string | { t: string; c?: "accent" };
export type CSlide = {
  start: number; dur: number;
  number?: number; headline: Line | Line[]; headlineSize?: number; qualifier?: string; body?: string;
  scene?: SScene;
};
export type CarouselProps = { theme?: keyof typeof THEMES; handle?: string | false; slides: CSlide[] };

/** Rough wrapped line count for a line of display serif at `size` across `w` px (Instrument Serif ≈ 0.42em a char). */
const wraps = (txt: string, size: number, w: number) => Math.max(1, Math.ceil((txt.length * size * 0.42) / w));

/** Height the text block takes, so the scene gets the rest of the slide. */
export const headerH = (s: CSlide) => {
  const size = s.headlineSize ?? 84, lines = Array.isArray(s.headline) ? s.headline : [s.headline];
  const n = lines.reduce((a, l) => a + wraps(typeof l === "string" ? l : l.t, size, CW - 2 * PAD), 0);
  return (s.number != null ? 110 : 0) + n * size * 1.12 + (s.qualifier ? 74 : 0) + (s.body ? 76 : 0);
};

const Slide: React.FC<{ s: CSlide; i: number; n: number; handle: string | false }> = ({ s, i, n, handle }) => {
  const C = React.useContext(ThemeCtx);
  const t = useNow();
  const size = s.headlineSize ?? 84, lines = Array.isArray(s.headline) ? s.headline : [s.headline];
  const top = PAD + headerH(s) + 30, visH = CH - FOOT - top;
  const box = { x: VIS_X, w: CW - 2 * VIS_X, h: visH };
  const View = s.scene ? SCENES[s.scene.type] : null;
  const enter = (k: number, dy = 18): React.CSSProperties => {
    const p = ramp(t, s.start + 0.12 + k * 0.12, 0.4);
    return { opacity: p, filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined, transform: `translateY(${(1 - p) * dy}px)` };
  };
  return (
    <AbsoluteFill style={{ background: C.page }}>
      <div style={{ position: "absolute", left: PAD, right: PAD, top: PAD, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        {s.number != null && (
          <div style={{ width: 74, height: 74, borderRadius: 74, border: `3px solid ${C.accent}`, color: C.accent, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: C.fonts.display, fontSize: 46, marginBottom: 36, ...enter(0) }}>{s.number}</div>
        )}
        {lines.map((l, k) => {
          const acc = typeof l !== "string" && l.c === "accent";
          return <div key={k} style={{ fontFamily: C.fonts.display, fontSize: size, lineHeight: 1.12, letterSpacing: "-0.015em",
            color: acc ? C.accent : C.ink, fontStyle: acc ? "italic" : undefined, ...enter(k + 1) }}>{typeof l === "string" ? l : l.t}</div>;
        })}
        {s.qualifier && <div style={{ marginTop: 26, fontFamily: C.fonts.plain, fontWeight: 500, fontSize: 36, color: C.muted, ...enter(lines.length + 1) }}>{s.qualifier}</div>}
        {s.body && <div style={{ marginTop: 30, fontFamily: C.fonts.plain, fontWeight: 500, fontSize: 38, lineHeight: 1.4, color: C.body, ...enter(lines.length + 1) }}>{s.body}</div>}
      </div>
      {View && s.scene && (
        <div style={{ position: "absolute", left: box.x, top, width: box.w, height: visH }}>
          <View s={s.scene} box={box} face={{ x: 0.5, y: 0.35 }} />
        </div>
      )}
      {handle && <div style={{ position: "absolute", left: PAD, bottom: 64, fontFamily: C.fonts.plain, fontWeight: 500, fontSize: 28, color: C.muted }}>{handle}</div>}
      <div style={{ position: "absolute", right: PAD, bottom: 64, fontFamily: C.fonts.plain, fontWeight: 500, fontSize: 28, color: C.muted }}>
        {i + 1}/{n}{i < n - 1 ? "  →" : ""}
      </div>
    </AbsoluteFill>
  );
};

/** The whole carousel as one timeline: each slide builds, holds, then the next slides in from the right. */
export const Carousel: React.FC<CarouselProps> = ({ theme = "ajay", handle = "@theajayjagtap", slides }) => {
  const t = useNow();
  const C = THEMES[theme];
  const i = Math.max(0, slides.findIndex((s) => t >= s.start && t < s.start + s.dur));
  const cur = slides[i], prev = slides[i - 1];
  const k = prev ? ease(clamp01((t - cur.start) / 0.5)) : 1;
  return (
    <ThemeCtx.Provider value={C}>
      <AbsoluteFill style={{ background: C.page }}>
        {prev && k < 1 && <AbsoluteFill style={{ transform: `translateX(${-CW * k}px)` }}><Slide s={prev} i={i - 1} n={slides.length} handle={handle} /></AbsoluteFill>}
        <AbsoluteFill style={{ transform: `translateX(${CW * (1 - k)}px)` }}><Slide s={cur} i={i} n={slides.length} handle={handle} /></AbsoluteFill>
      </AbsoluteFill>
    </ThemeCtx.Provider>
  );
};

/* One scene on its own, transparent, `w`×`h`: a clean piece placed inside a hand-drawn (Excalidraw) carousel slide by
 * scripts/collage.py. `accent` swaps the palette's accent for the carousel's, so the clean and sketch layers share it. */
export type SceneCardProps = { theme?: keyof typeof THEMES; scene: SScene; w: number; h: number; accent?: { accent: string; soft: string; tint: string } };
export const SceneCard: React.FC<SceneCardProps> = ({ theme = "ajay", scene, w, h, accent }) => {
  const base = THEMES[theme];
  const C = accent ? { ...base, accent: accent.accent, accentSoft: accent.soft, accentTint: accent.tint, onDark: accent.tint } : base;
  const View = SCENES[scene.type];
  return (
    <ThemeCtx.Provider value={C}>
      <AbsoluteFill style={{ background: "transparent" }}>
        {View ? <View s={scene} box={{ x: 0, w, h }} face={{ x: 0.5, y: 0.35 }} /> : <div style={{ color: "red", fontSize: 40 }}>unknown scene: {scene.type}</div>}
      </AbsoluteFill>
    </ThemeCtx.Provider>
  );
};
