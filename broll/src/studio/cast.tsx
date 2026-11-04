// Our recurring cast in the videos: person.* (14 poses), bot.* (5) and the doodles, from the carousel art library
// (scripts/library.py → scripts/cast_export.py → cast.json). Never a borrowed character (CLAUDE.md).
// Drawn in clean line on the theme's colours, each shape drawing itself on in order from `at`.
import React from "react";
import { clamp01, ramp, useC, useNow } from "./kit";
import CAST from "./cast.json";

type Shape =
  | { k: "line" | "arrow"; pts: number[][]; stroke: string; curve?: boolean; bg?: string | null }
  | { k: "ell"; x: number; y: number; w: number; h: number; stroke: string; bg?: string | null; thin?: boolean }
  | { k: "rect"; x: number; y: number; w: number; h: number; stroke: string; bg?: string | null }
  | { k: "text"; x: number; y: number; t: string; size: number; color: string };

/** Catmull-Rom through the points, as cubic Béziers (the library's `curve: true`). */
const smooth = (p: number[][]) => {
  if (p.length < 3) return `M ${p.map((q) => q.join(" ")).join(" L ")}`;
  let d = `M ${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i - 1] ?? p[i], b = p[i], c = p[i + 1], e = p[i + 2] ?? c;
    d += ` C ${b[0] + (c[0] - a[0]) / 6} ${b[1] + (c[1] - a[1]) / 6} ${c[0] - (e[0] - b[0]) / 6} ${c[1] - (e[1] - b[1]) / 6} ${c[0]} ${c[1]}`;
  }
  return d;
};

/**
 * One library item at (x, y), `size` px square (the library's 100×100 box), optionally mirrored.
 * `at` starts the draw-on (default: shown at once); `dur` is how long the whole drawing takes.
 */
export const Cast: React.FC<{ id: string; x: number; y: number; size: number; flip?: boolean; at?: number; dur?: number; opacity?: number }> =
({ id, x, y, size, flip, at, dur = 0.8, opacity = 1 }) => {
  const C = useC();
  const t = useNow();
  const shapes = (CAST as Record<string, Shape[]>)[id];
  if (!shapes) return <text x={x} y={y + size / 2} fill="#D14343" fontSize={size / 4}>?{id}</text>;
  const col: Record<string, string> = {
    ink: C.ink, paper: C.card, grey: C.muted, l_grey: "#E6E4DE", ACC: C.accentTint, orange: C.accent, red: "#C0392B",
    l_red: "#F2CFC9", blue: "#B9CDE2", l_blue: "#D6E4F0", l_yellow: "#F4E6B4", green: C.accent, l_green: C.accentSoft, l_orange: "#F6DCC4",
  };
  const c = (n?: string | null) => (n ? col[n] ?? n : "none");
  const p = at == null ? 1 : ramp(t, at, dur);
  const n = shapes.length;
  const sw = 2.4;
  return (
    <g transform={`translate(${x} ${y}) scale(${size / 100}) ${flip ? "translate(100 0) scale(-1 1)" : ""}`} opacity={opacity}>
      {shapes.map((s, i) => {
        const q = clamp01((p - (i / n) * 0.75) / 0.25); // each shape draws over the last quarter of its slot
        if (q <= 0) return null;
        const dash = { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - q } as const;
        if (s.k === "text") return <text key={i} x={s.x} y={s.y + s.size * 0.35} textAnchor="middle" opacity={q}
          style={{ fontFamily: C.fonts.display, fontSize: s.size, fill: c(s.color) }}>{s.t}</text>;
        if (s.k === "ell") return <ellipse key={i} cx={s.x + s.w / 2} cy={s.y + s.h / 2} rx={s.w / 2} ry={s.h / 2} fill={c(s.bg)} fillOpacity={q}
          stroke={c(s.stroke)} strokeWidth={s.thin ? 0 : sw} {...dash} />;
        if (s.k === "rect") return <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} rx={2} fill={c(s.bg)} fillOpacity={q}
          stroke={c(s.stroke)} strokeWidth={sw} strokeLinejoin="round" {...dash} />;
        const d = s.curve ? smooth(s.pts) : `M ${s.pts.map((pt) => pt.join(" ")).join(" L ")}`;
        return <path key={i} d={d + (s.k === "line" && s.bg ? " Z" : "")} fill={s.k === "line" ? c(s.bg) : "none"} fillOpacity={q}
          stroke={c(s.stroke)} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...dash} />;
      })}
    </g>
  );
};
