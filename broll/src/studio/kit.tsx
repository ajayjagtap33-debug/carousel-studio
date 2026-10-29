// Studio kit: the look modelled on videos/reference/2026-10-28-nick-saraev-ceo-ai (off-white page, one accent,
// every element blurs in on its word). Type is Ajay's, not the reference's (2026-10-29): per-theme display /
// plain / accent families, sentence case, no all-caps kickers. Palette + fonts come from ThemeCtx: read with useC().
import React, { createContext, useContext } from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as mulish } from "@remotion/google-fonts/Mulish";
import { loadFont as dancing } from "@remotion/google-fonts/DancingScript";
import { loadFont as dmSans } from "@remotion/google-fonts/DMSans";
import { loadFont as openSans } from "@remotion/google-fonts/OpenSans";
import { loadFont as dmSerif } from "@remotion/google-fonts/DMSerifDisplay";
import { loadFont as jetbrains } from "@remotion/google-fonts/JetBrainsMono";
import { iconFor } from "../kit";

dmSerif("italic", { weights: ["400"], subsets: ["latin"] });
const FAM = {
  mulish: mulish("normal", { weights: ["500", "700", "800"], subsets: ["latin"] }).fontFamily,
  dancing: dancing("normal", { weights: ["700"], subsets: ["latin"] }).fontFamily,
  dmSans: dmSans("normal", { weights: ["500", "600", "700"], subsets: ["latin"] }).fontFamily,
  openSans: openSans("normal", { weights: ["500", "600"], subsets: ["latin"] }).fontFamily,
  dmSerif: dmSerif("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily,
  mono: jetbrains("normal", { weights: ["400", "500"], subsets: ["latin"] }).fontFamily,
};

export type Fonts = {
  display: string; displayWeight: number; // headlines, type cards, big numbers
  plain: string; plainWeight: number;     // chip labels, source lines, body rows
  accent: string;                         // one word a line, >= 64px
  accentStyle: "cursive" | "serif-italic";
  accentScale: number;                    // cursive runs small: nudge its size up to match the display line
  mono: string;
};
export type Palette = {
  border: string; page: string; ink: string; body: string; muted: string; line: string; card: string; dark: string;
  accent: string; accentSoft: string; onDark: string; // onDark = the accent against footage / a dark card
  logo?: string; handle?: string; // chrome top-left: a wordmark image, or a text handle
  fonts: Fonts;
};
/** Two looks on one layout: "tmv" (TMV red, tmv. wordmark) and "ajay" (his site's forest green, no chrome). */
export const THEMES: Record<"tmv" | "ajay", Palette> = {
  tmv: {
    border: "#ECE9E3", page: "#FAFAF8", ink: "#141414", body: "#4A4A47", muted: "#8E8C86", line: "#E6E4DE", card: "#FFFFFF",
    dark: "#161616", accent: "#B80000", accentSoft: "#FBEDEB", onDark: "#F86659", logo: "logos/tmv-red.png",
    fonts: { display: FAM.mulish, displayWeight: 800, plain: FAM.mulish, plainWeight: 500,
      accent: FAM.dancing, accentStyle: "cursive", accentScale: 1.18, mono: FAM.mono },
  },
  ajay: { // ajayjagtap.site tokens (2026-10-29); dark stays neutral so the wash beside his face doesn't tint his skin
    border: "#E4DED4", page: "#FAF9F5", ink: "#1A1A18", body: "#3D3D3A", muted: "#6C6A64", line: "#E4DED4", card: "#FFFFFF",
    dark: "#1B1D19", accent: "#2C6650", accentSoft: "#E6EFEA", onDark: "#7FBDA8", // no chrome: Ajay dropped the corner handle (2026-10-29)
    fonts: { display: FAM.dmSans, displayWeight: 700, plain: FAM.openSans, plainWeight: 600,
      accent: FAM.dmSerif, accentStyle: "serif-italic", accentScale: 1.04, mono: FAM.mono },
  },
};
export const ThemeCtx = createContext<Palette>(THEMES.tmv);
export const useC = () => useContext(ThemeCtx);
export const SHADOW = "0 1px 2px rgba(20,20,20,0.04), 0 12px 32px rgba(20,20,20,0.07)";

/** Seconds since the start of the composition (all `at` values are cut times). */
export const useNow = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const out = Easing.out(Easing.cubic);

/** 0 to 1 over `dur`, starting a hair before `at` so the element is sharp on its word. */
export const useIn = (at: number, dur = 0.38) => {
  const t = useNow();
  return out(clamp01((t - (at - 0.1)) / dur));
};

export const ramp = (t: number, at: number, dur = 0.4) =>
  interpolate(t, [at, at + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });

/** The reference's entrance: blur to sharp, small rise, fade. */
export const Enter: React.FC<{ at: number; dy?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ at, dy = 14, style, children }) => {
  const p = useIn(at);
  return (
    <div style={{ opacity: p, filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined, transform: `translateY(${(1 - p) * dy}px)`, ...style }}>
      {children}
    </div>
  );
};

export const Icon: React.FC<{ name: string; size?: number; color?: string }> = ({ name, size = 36, color }) => {
  const C = useC();
  color = color ?? C.ink;
  const I = iconFor(name);
  return I ? <I size={size} color={color} strokeWidth={1.5} /> : null;
};

/** A quiet line above or under something (a card's label, a source credit). Sentence case, never tracked caps. */
export const Label: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({ children, color, size = 32, style }) => {
  const C = useC();
  return <div style={{ fontFamily: C.fonts.plain, fontSize: size, fontWeight: C.fonts.plainWeight, color: color ?? C.muted, ...style }}>{children}</div>;
};

/** Small rounded label: ink (default), accent, or soft (white with hairline). */
export const Chip: React.FC<{ tone?: "ink" | "accent" | "soft"; size?: number; children: React.ReactNode }> = ({ tone = "ink", size = 40, children }) => {
  const C = useC();
  const bg = tone === "accent" ? C.accent : tone === "soft" ? C.card : C.dark;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", background: bg, color: tone === "soft" ? C.ink : "#FFF", fontFamily: C.fonts.plain,
      fontWeight: C.fonts.plainWeight, fontSize: size, padding: `${size * 0.3}px ${size * 0.72}px`, borderRadius: 999,
      border: tone === "soft" ? `1px solid ${C.line}` : "none", boxShadow: tone === "soft" ? SHADOW : "none", whiteSpace: "nowrap" }}>
      {children}
    </div>
  );
};

/** One accent word: the theme's cursive / serif-italic face, sized up so it sits on the display line's baseline. */
export const Accent: React.FC<{ children: React.ReactNode; size: number; color?: string }> = ({ children, size, color }) => {
  const C = useC();
  const f = C.fonts;
  return (
    <span style={{ fontFamily: f.accent, fontWeight: f.accentStyle === "cursive" ? 700 : 400,
      fontStyle: f.accentStyle === "serif-italic" ? "italic" : "normal", fontSize: size * f.accentScale,
      letterSpacing: 0, color: color ?? C.accent, lineHeight: 1 }}>{children}</span>
  );
};

/** A display line where *words* in asterisks take the accent face. Words blur in one after another. */
export const Display: React.FC<{ text: string; at: number; size?: number; gap?: number; align?: "left" | "center"; color?: string; accent?: string; weight?: number; style?: React.CSSProperties }> =
({ text, at, size = 96, gap = 0.06, align = "left", color, accent, weight, style }) => {
  const C = useC();
  color = color ?? C.ink;
  let acc = false;
  return (
    <div style={{ fontFamily: C.fonts.display, fontWeight: weight ?? C.fonts.displayWeight, fontSize: size, lineHeight: 1.08,
      letterSpacing: "-0.015em", color, display: "flex", flexWrap: "wrap", alignItems: "baseline", ...style,
      justifyContent: align === "center" ? "center" : "flex-start", columnGap: size * 0.24 }}>
      {text.split(" ").map((w, i) => {
        if (w.startsWith("*")) acc = true;
        const isAcc = acc;
        if (w.endsWith("*")) acc = false;
        const word = w.replace(/\*/g, "");
        return (
          <Enter key={i} at={at + i * gap} dy={size * 0.12}>
            {isAcc ? <Accent size={size} color={accent}>{word}</Accent> : <span>{word}</span>}
          </Enter>
        );
      })}
    </div>
  );
};

export const Card: React.FC<{ w?: number | string; style?: React.CSSProperties; children: React.ReactNode }> = ({ w, style, children }) => {
  const C = useC();
  return (
    <div style={{ width: w, boxSizing: "border-box", background: C.card, border: `1px solid ${C.line}`, borderRadius: 20, boxShadow: SHADOW, ...style }}>
      {children}
    </div>
  );
};
