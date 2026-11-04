// Shared scene plumbing. Lives apart from scenes.tsx so scenes2.tsx can use it without a cycle.
import React from "react";
import { useIn, useT } from "./kit";
import type { Placement } from "./theme";

export type RScene = {
  type: string;
  start: number;
  end: number;
  placement?: Placement;
  source?: string;
  [k: string]: unknown;
};

export type P = { s: RScene };

export const n = (v: unknown, d = 0) => (typeof v === "number" ? v : d);
export const str = (v: unknown, d = "") => (typeof v === "string" ? v : d);
export const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/** Join a trailing fragment to an underlined clause without a space before punctuation. */
export const glue = (v: unknown) => {
  const s = str(v);
  return s && /^[,.;:!?]/.test(s) ? s : s ? ` ${s}` : "";
};

/** Entrance for SVG children — a <div> cannot live inside <svg>, so this is a <g>. */
export const SvgIn: React.FC<{ at: number; dy?: number; children: React.ReactNode }> = ({
  at, dy = 8, children,
}) => {
  const p = useIn(at, 16);
  return (
    <g opacity={Math.min(1, p * 1.4)} transform={`translate(0 ${(1 - p) * dy})`}>{children}</g>
  );
};

/** Neutral placeholder square — stands in for an icon or a logo we don't have. */
export const IconBox: React.FC<{ size?: number; r?: number; bg?: string; style?: React.CSSProperties }> = ({
  size = 56, r = 13, bg, style,
}) => {
  const T = useT();
  return <div style={{ width: size, height: size, borderRadius: r, background: bg ?? T.panel, flexShrink: 0, ...style }} />;
};

export const Avatar: React.FC<{ ch: string; bg: string; size?: number }> = ({ ch, bg, size = 44 }) => {
  const T = useT();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: bg, color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: T.ui, fontSize: size * 0.45, fontWeight: 600, flexShrink: 0,
    }}>{ch}</div>
  );
};
