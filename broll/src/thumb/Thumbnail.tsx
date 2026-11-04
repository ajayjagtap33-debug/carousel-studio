import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { loadFont as gochi } from "@remotion/google-fonts/GochiHand";

/** A YouTube thumbnail (1280x720): his own frame, zoomed and graded a touch, with a short hand-written line in
 *  the open space and a drawn arrow pointing at him (Ajay, 2026-11-01: no cut-out, "a simple text in the frame
 *  itself", after a creator thumbnail he liked). All positions are in thumbnail px. */
export type ThumbProps = {
  bg: string;                                   // the frame, 1920x1080
  crop?: { x: number; y: number; scale: number }; // frame px of the top-left corner, and the zoom
  lines: string[];
  text?: { x: number; y: number; size?: number; align?: "left" | "center" };
  arrow?: { from: [number, number]; to: [number, number]; bend?: number };
  color?: string;
};

const { fontFamily: HAND } = gochi();

const Arrow: React.FC<{ from: [number, number]; to: [number, number]; bend: number; color: string }> = ({ from, to, bend, color }) => {
  const [x1, y1] = from, [x2, y2] = to;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
  const cx = mx - (dy / len) * bend, cy = my + (dx / len) * bend;          // control point off the chord
  const a = Math.atan2(y2 - cy, x2 - cx), h = 34;                         // head along the curve's last tangent
  const head = `M${x2 - h * Math.cos(a - 0.5)} ${y2 - h * Math.sin(a - 0.5)} L${x2} ${y2} L${x2 - h * Math.cos(a + 0.5)} ${y2 - h * Math.sin(a + 0.5)}`;
  const path = `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`;
  return (
    <svg width={1280} height={720} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {[{ c: "rgba(0,0,0,0.45)", w: 15 }, { c: color, w: 8 }].map((p, i) => (
        <g key={i} fill="none" stroke={p.c} strokeWidth={p.w} strokeLinecap="round" strokeLinejoin="round"
          transform={i === 0 ? "translate(2 4)" : undefined}>
          <path d={path} /><path d={head} />
        </g>
      ))}
    </svg>
  );
};

export const Thumbnail: React.FC<ThumbProps> = ({ bg, crop = { x: 0, y: 0, scale: 1 }, lines, text = { x: 60, y: 60 },
  arrow, color = "#FFD84D" }) => {
  const k = (1280 / 1920) * crop.scale;
  const size = text.size ?? 112;
  return (
    <AbsoluteFill style={{ background: "#111", overflow: "hidden" }}>
      <Img src={staticFile(bg)} style={{ position: "absolute", left: -crop.x * k, top: -crop.y * k, width: 1920 * k, height: 1080 * k,
        filter: "contrast(1.08) saturate(1.12) brightness(1.02)" }} />
      {/* a soft vignette so the corners and the text area sit a little darker than his face */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 62% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.38) 100%)" }} />
      <div style={{ position: "absolute", left: text.x, top: text.y, textAlign: text.align ?? "left" }}>
        {lines.map((l, i) => (
          <div key={i} style={{ fontFamily: HAND, fontSize: size, lineHeight: 0.98, color, textTransform: "uppercase",
            letterSpacing: "0.02em", whiteSpace: "nowrap", WebkitTextStroke: `${size * 0.05}px rgba(20,20,20,0.55)`, paintOrder: "stroke fill",
            textShadow: "0 4px 0 rgba(0,0,0,0.28), 0 6px 26px rgba(0,0,0,0.45)" }}>{l}</div>
        ))}
      </div>
      {arrow && <Arrow from={arrow.from} to={arrow.to} bend={arrow.bend ?? 60} color={color} />}
    </AbsoluteFill>
  );
};
