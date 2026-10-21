// Building blocks shared by every scene: timing (appear on a spoken word), hand-drawn shapes, icons, text.
import React, { createContext, useContext, useMemo } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import rough from "roughjs";
import { icons, type LucideIcon } from "lucide-react";
import { C, FONT, S } from "./theme";

export type Area = { x: number; y: number; w: number; h: number };
// start = scene start in cut seconds (so `at` values can stay in cut time); area = where content may go.
export const SceneCtx = createContext<{ start: number; area: Area }>({ start: 0, area: { x: 0, y: 0, w: 1920, h: 1080 } });
export const useScene = () => useContext(SceneCtx);

/** 0 → 1 spring that starts at cut-time `at` (seconds). No `at` = scene start. */
export const useAppear = (at?: number, damping = 16) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { start } = useScene();
  const from = Math.round(((at ?? start) - start) * fps);
  return spring({ frame: frame - from, fps, config: { damping, mass: 0.7 } });
};

/** Linear 0 → 1 over `dur` seconds from cut-time `at` (for strokes drawing themselves). */
export const useDraw = (at?: number, dur = 0.6) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { start } = useScene();
  const from = ((at ?? start) - start) * fps;
  return interpolate(frame, [from, from + dur * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
};

/** Has cut-time `at` passed? */
export const usePassed = (at?: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { start } = useScene();
  return at !== undefined && frame >= Math.round((at - start) * fps);
};

export const pop = (p: number, dy = 24): React.CSSProperties => ({
  opacity: Math.min(1, p * 1.4),
  transform: `translateY(${(1 - p) * dy}px) scale(${0.94 + 0.06 * p})`,
});

const gen = rough.generator();
type Shape = "rect" | "line" | "ellipse" | "arrow" | "cross" | "underline";

/** Hand-drawn shape (roughjs) that draws itself in as `draw` goes 0 → 1. Fixed seed = no jitter between frames. */
export const Rough: React.FC<{
  shape: Shape; w: number; h: number; draw?: number; stroke?: string; fill?: string;
  seed?: number; strokeWidth?: number; style?: React.CSSProperties;
}> = ({ shape, w, h, draw = 1, stroke = C.ink, fill, seed = 7, strokeWidth = 2.6, style }) => {
  const paths = useMemo(() => {
    const o = { seed, stroke, strokeWidth, roughness: 1.1, bowing: 0.8, fill, fillStyle: "solid" as const };
    const pad = 6;
    const ds = [];
    if (shape === "rect") ds.push(gen.rectangle(pad, pad, w - 2 * pad, h - 2 * pad, o));
    if (shape === "ellipse") ds.push(gen.ellipse(w / 2, h / 2, w - 2 * pad, h - 2 * pad, o));
    if (shape === "line" || shape === "underline") ds.push(gen.line(pad, h / 2, w - pad, h / 2, { ...o, bowing: 2 }));
    if (shape === "arrow") {
      ds.push(gen.line(pad, h / 2, w - pad, h / 2, o));
      ds.push(gen.line(w - pad - 22, h / 2 - 16, w - pad, h / 2, o));
      ds.push(gen.line(w - pad - 22, h / 2 + 16, w - pad, h / 2, o));
    }
    if (shape === "cross") {
      ds.push(gen.line(pad, pad, w - pad, h - pad, o));
      ds.push(gen.line(w - pad, pad, pad, h - pad, o));
    }
    return ds.flatMap((d) => gen.toPaths(d));
  }, [shape, w, h, seed, stroke, fill, strokeWidth]);
  return (
    <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", ...style }}>
      {paths.map((p, i) =>
        p.stroke === "none" ? ( // solid fill: fades in with the stroke
          <path key={i} d={p.d} fill={p.fill} fillOpacity={draw} stroke="none" />
        ) : (
          <path key={i} d={p.d} fill="none" stroke={p.stroke} strokeWidth={p.strokeWidth}
            strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        ),
      )}
    </svg>
  );
};

/** Box with a hand-drawn border; children sit inside. */
export const Card: React.FC<{
  w: number; h: number; draw?: number; fill?: string; stroke?: string; seed?: number;
  style?: React.CSSProperties; children?: React.ReactNode;
}> = ({ w, h, draw = 1, fill, stroke, seed, style, children }) => (
  <div style={{ position: "relative", width: w, height: h, ...style }}>
    <Rough shape="rect" w={w} h={h} draw={draw} fill={fill} stroke={stroke} seed={seed} />
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {children}
    </div>
  </div>
);

const pascal = (s: string) => s.replace(/(^|[-_ ])(\w)/g, (_, __, c: string) => c.toUpperCase());
export const iconFor = (name?: string): LucideIcon | null =>
  name ? ((icons as Record<string, LucideIcon>)[pascal(name)] ?? null) : null;

export const Icon: React.FC<{ name?: string; size?: number; color?: string; style?: React.CSSProperties }> = ({
  name, size = 56, color = C.ink, style,
}) => {
  const I = iconFor(name);
  if (!name) return null;
  if (!I) // unknown icon: visible "?" so the check / a still catches it
    return <div style={{ width: size, height: size, borderRadius: size, border: `3px dashed ${C.red}`, color: C.red,
      fontFamily: FONT, fontSize: size * 0.6, display: "flex", alignItems: "center", justifyContent: "center", ...style }}>?</div>;
  return <I size={size} color={color} strokeWidth={1.8} style={style} />;
};

export const Txt: React.FC<{ size?: number; color?: string; style?: React.CSSProperties; children: React.ReactNode }> = ({
  size = S.item, color = C.ink, style, children,
}) => <div style={{ fontFamily: FONT, fontSize: size, color, lineHeight: 1.18, ...style }}>{children}</div>;

/** Scene headline with a hand-drawn underline that draws in after it. */
export const Title: React.FC<{ text?: string; kicker?: string; at?: number; size?: number; align?: "left" | "center" }> = ({
  text, kicker, at, size = S.title, align = "center",
}) => {
  const { start } = useScene();
  const p = useAppear(at);
  const d = useDraw((at ?? start) + 0.25, 0.5);
  const lineW = Math.min(520, (text?.length ?? 0) * size * 0.32);
  if (!text) return null;
  return (
    <div style={{ textAlign: align, ...pop(p) }}>
      {kicker && <Txt size={S.kicker} color={C.grey} style={{ letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>{kicker}</Txt>}
      <Txt size={size}>{text}</Txt>
      <div style={{ position: "relative", height: 22, width: lineW, margin: align === "center" ? "6px auto 0" : "6px 0 0" }}>
        <Rough shape="underline" w={lineW} h={22} draw={d} stroke={C.ink} seed={3} />
      </div>
    </div>
  );
};
