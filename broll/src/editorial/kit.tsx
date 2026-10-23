// Editorial kit: theme context, word-timed entrances (blur → sharp), pills, cards, kickers, accent headlines.
import React, { createContext, useContext } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { iconFor } from "../kit";
import { ITALIC, type ETheme } from "./themes";

export const ThemeCtx = createContext<ETheme>(null as unknown as ETheme);
export const useT = () => useContext(ThemeCtx);
/** Layout lint render: every timed entrance shows its end state, so the check sees the fully built scene. */
export const LintCtx = createContext(false);

/** Seconds since the start of the composition (all `at` values are absolute cut times). */
export const useNow = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

/** 0 → 1 spring from time `at`. */
export const useIn = (at: number, damping = 18) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lint = useContext(LintCtx);
  const v = spring({ frame: frame - Math.round(at * fps), fps, config: { damping, mass: 0.6 } });
  return lint && at < 1e8 ? 1 : v;
};

/** 0 → 1 eased over `dur` seconds from `at`. */
export const useRamp = (at: number, dur = 0.5) => {
  const t = useNow();
  const lint = useContext(LintCtx);
  if (lint && at < 1e8) return 1;
  return interpolate(t, [at, at + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
};

/** The reference's entrance: blur → sharp, small rise, fade. */
export const Enter: React.FC<{ at: number; dy?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ at, dy = 18, style, children }) => {
  const p = useIn(at);
  return (
    <div style={{ opacity: Math.min(1, p * 1.3), filter: `blur(${(1 - p) * 12}px)`, transform: `translateY(${(1 - p) * dy}px)`, ...style }}>
      {children}
    </div>
  );
};

export const EIcon: React.FC<{ name: string; size?: number; color?: string }> = ({ name, size = 44, color }) => {
  const T = useT();
  const I = iconFor(name);
  return I ? <I size={size} color={color ?? T.ink} strokeWidth={1.6} /> : null;
};

export const Kicker: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color }) => {
  const T = useT();
  return <div style={{ fontFamily: T.ui, fontSize: 20, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: color ?? T.kicker ?? T.muted }}>{children}</div>;
};

/** Pill: black (default), accent, or soft. */
export const Pill: React.FC<{ at: number; tone?: "ink" | "accent" | "soft"; icon?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, tone = "ink", icon, children, style }) => {
  const T = useT();
  const bg = tone === "accent" ? (T.pillAccentBg ?? T.accent) : tone === "soft" ? T.card : T.dark;
  const fg = tone === "accent" ? (T.pillAccentFg ?? T.accentInk) : tone === "soft" ? T.ink : T.darkInk;
  const p = useIn(at, 14);
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: bg, color: fg, fontFamily: T.ui, fontWeight: 500,
      fontSize: 28, padding: "10px 22px", borderRadius: 999, border: tone === "soft" ? `1px solid ${T.line}` : "none",
      boxShadow: tone === "soft" ? T.shadow : "none", opacity: Math.min(1, p * 1.4), transform: `scale(${0.85 + 0.15 * p})`, ...style }}>
      {icon && <EIcon name={icon} size={24} color={fg} />}{children}
    </div>
  );
};

/** White card with hairline border; `active` = accent outline, `dim` = faded. */
export const ECard: React.FC<{ w?: number; h?: number; active?: number; dim?: number; dark?: boolean; style?: React.CSSProperties; children: React.ReactNode }> = ({ w, h, active = 0, dim = 0, dark, style, children }) => {
  const T = useT();
  return (
    <div data-box style={{ width: w, height: h, boxSizing: "border-box", background: dark ? T.dark : T.card, color: dark ? T.darkInk : T.ink,
      borderRadius: T.radius, border: `${1 + 1.2 * active}px solid ${active > 0.01 ? T.accent : T.line}`, boxShadow: T.shadow,
      opacity: 1 - 0.6 * dim, ...style }}>
      {children}
    </div>
  );
};

/** Headline where *words* in asterisks get the accent (italic serif in B, accent colour in A). Words enter one by one. */
export const Headline: React.FC<{ text: string; at: number; gap?: number; size?: number; align?: "left" | "center" }> = ({ text, at, gap = 0.16, size = 112, align = "center" }) => {
  const T = useT();
  const words = text.split(" ");
  let acc = false;
  return (
    <div data-text style={{ fontFamily: T.head, fontWeight: T.headWeight, letterSpacing: T.headTracking, fontSize: size, lineHeight: 1.14,
      color: T.ink, textAlign: align, display: "flex", flexWrap: "wrap", justifyContent: align === "center" ? "center" : "flex-start", columnGap: size * 0.26 }}>
      {words.map((w, i) => {
        const start = w.startsWith("*"); if (start) acc = true;
        const isAcc = acc; if (w.endsWith("*")) acc = false;
        const clean = w.replace(/\*/g, "");
        return (
          <Enter key={i} at={at + i * gap} dy={10}>
            {/* accent word: red on a pale wash. The side padding is half the column gap and the margin pulls it
                back, so the wash behind consecutive accent words joins up instead of printing one box per word. */}
            <span style={isAcc ? { color: T.accent, fontStyle: T.accentStyle, fontWeight: T.accentWeight ?? T.headWeight,
              fontFamily: T.accentFont ?? (T.accentStyle === "italic" ? ITALIC : T.head),
              background: T.highlight, padding: `0.02em ${size * 0.13}px`, margin: `0 ${-size * 0.13}px`,
              borderRadius: 3 } : undefined}>{clean}</span>
          </Enter>
        );
      })}
    </div>
  );
};

export const Txt: React.FC<{ size?: number; weight?: number; color?: string; font?: "ui" | "head" | "mono"; style?: React.CSSProperties; children: React.ReactNode }> = ({ size = 30, weight = 500, color, font = "ui", style, children }) => {
  const T = useT();
  const fam = font === "head" ? T.head : font === "mono" ? T.mono : T.ui;
  return <div style={{ fontFamily: fam, fontSize: size, fontWeight: font === "head" ? T.headWeight : weight, letterSpacing: font === "head" ? T.headTracking : undefined, color: color ?? T.ink, lineHeight: 1.2, ...style }}>{children}</div>;
};
