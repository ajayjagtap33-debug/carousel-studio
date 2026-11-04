// Reel kit: theme tokens, fonts, timing helpers and the small shared pieces (cards, counters, highlights).
// Colours come from themes/reel_themes.json; type per CLAUDE.md (tmv = Mulish + Dancing Script, ajay = Inter + Instrument Serif).
import React, { createContext, useContext } from "react";
import { Easing, Img, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import TOKENS from "../../themes/reel_themes.json";
// Fonts are local (Google Fonts' variable woff2, latin subset, OFL): fetching them at render time failed intermittently.
import mulishUrl from "./fonts/mulish.woff2";
import dancingUrl from "./fonts/dancing.woff2";
import interUrl from "./fonts/inter.woff2";
import instrumentUrl from "./fonts/instrument.woff2";
import instrumentItalicUrl from "./fonts/instrument-italic.woff2";
import monoUrl from "./fonts/jetbrains.woff2";

const FACES: [string, string, FontFaceDescriptors][] = [
  ["Mulish", mulishUrl, { weight: "200 1000" }],
  ["Dancing Script", dancingUrl, { weight: "400 700" }],
  ["Inter", interUrl, { weight: "100 900" }],
  ["Instrument Serif", instrumentUrl, { weight: "400" }],
  ["Instrument Serif", instrumentItalicUrl, { weight: "400", style: "italic" }],
  ["JetBrains Mono", monoUrl, { weight: "100 800" }],
];
const fontsReady = delayRender("local fonts");
Promise.all(FACES.map(([fam, url, d]) => new FontFace(fam, `url(${url}) format("woff2")`, d).load().then((f) => document.fonts.add(f))))
  .then(() => continueRender(fontsReady))
  .catch((e) => { console.error("font load failed", e); continueRender(fontsReady); });
const FAM = {
  mulish: "Mulish", dancing: "'Dancing Script'", inter: "Inter", instrument: "'Instrument Serif'", mono: "'JetBrains Mono'",
};

export type Theme = {
  accent: string; accentOnDark: string; glow: string; accentSoft: string; accentTint: string;
  canvas: string; soft: string; card: string; ink: string; body: string; muted: string; border: string;
  sans: string; sansWeight: number; accentFont: string; accentStyle: "cursive" | "serif-italic"; accentScale: number; mono: string;
};
const T = TOKENS as unknown as Record<"ajay" | "tmv", Record<string, string>>;
const base = (k: "ajay" | "tmv") => ({
  accent: T[k].accent, accentOnDark: T[k].accentOnDark, glow: T[k].glow, accentSoft: T[k].accentSoft,
  accentTint: T[k].accentTint, canvas: T[k].canvasLight, soft: T[k].canvasSoft, card: "#FFFFFF", ink: T[k].ink,
  body: T[k].body, muted: T[k].muted, border: T[k].border, mono: FAM.mono,
});
// Type weight (Ajay, 2026-10-30): 700 / 600 with open tracking. 800-900 read as loud; 600 then read as too light.
export const THEMES: Record<"ajay" | "tmv", Theme> = {
  tmv: { ...base("tmv"), sans: FAM.mulish, sansWeight: 700, accentFont: FAM.dancing, accentStyle: "cursive", accentScale: 1.15 },
  ajay: { ...base("ajay"), sans: FAM.inter, sansWeight: 600, accentFont: FAM.instrument, accentStyle: "serif-italic", accentScale: 1.1 },
};
export const ThemeCtx = createContext<Theme>(THEMES.tmv);
export const useC = () => useContext(ThemeCtx);

export const useNow = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const easeOut = Easing.out(Easing.cubic);
export const easeInOut = Easing.inOut(Easing.cubic);
/** 0→1 over `dur` seconds from `at` (eased). */
export const prog = (t: number, at: number, dur = 0.25) => easeOut(clamp01((t - at) / dur));

/** Nick's card entrance: a blurred placeholder resolves with a slight scale-up. */
export const Pop: React.FC<{ at: number; dur?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ at, dur = 0.22, style, children }) => {
  const t = useNow();
  const p = prog(t, at - 0.05, dur);
  return (
    <div style={{ opacity: p, filter: p < 1 ? `blur(${(1 - p) * 14}px)` : undefined, transform: `scale(${0.93 + 0.07 * p})`, ...style }}>
      {children}
    </div>
  );
};

export const SHADOW = "0 2px 6px rgba(60,40,30,0.04), 0 22px 50px rgba(60,40,30,0.10)";

/** macOS browser card: neutral hairline border + soft shadow. (The glowing accent border was too loud — Ajay, 2026-10-30.) */
export const BrowserCard: React.FC<{ url: string; w: number; h?: number; glow?: boolean; children: React.ReactNode; style?: React.CSSProperties }> =
({ url, w, h, children, style }) => {
  const C = useC();
  return (
    <div style={{ width: w, height: h, padding: 1, borderRadius: 26, background: C.border,
      boxShadow: SHADOW, boxSizing: "border-box", ...style }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 22, background: "#fff", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ height: 54, flex: "0 0 54px", display: "flex", alignItems: "center", gap: 10, padding: "0 20px", background: "#F3F3F4", borderBottom: "1px solid #E4E4E6" }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 15, height: 15, borderRadius: 8, background: c }} />)}
          <div style={{ flex: 1, margin: "0 24px", height: 32, borderRadius: 9, background: "#fff", border: "1px solid #E1E1E4",
            fontFamily: "Arial, sans-serif", fontSize: 17, color: "#6B6B70", display: "flex", alignItems: "center", justifyContent: "center" }}>{url}</div>
        </div>
        <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>{children}</div>
      </div>
    </div>
  );
};

/** White counter tile: big accent numerals rolling up + a small grey label. */
export const Counter: React.FC<{ at: number; to: number; from?: number; dur?: number; label: string; size?: number; style?: React.CSSProperties }> =
({ at, to, from = 0, dur = 0.6, label, size = 120, style }) => {
  const C = useC();
  const t = useNow();
  const p = easeOut(clamp01((t - at) / dur));
  const v = Math.round(from + (to - from) * p);
  return (
    <Pop at={at} style={style}>
      <div style={{ background: "#fff", borderRadius: 28, padding: "22px 44px 26px", boxShadow: SHADOW, textAlign: "center", border: `1px solid ${C.border}` }}>
        <div style={{ fontFamily: C.sans, fontWeight: 600, fontSize: size, lineHeight: 1, color: C.accent, letterSpacing: "0.01em", fontVariantNumeric: "tabular-nums" }}>
          {v.toLocaleString("en-US")}
        </div>
        <div style={{ fontFamily: C.sans, fontWeight: 500, fontSize: Math.max(30, size * 0.21), color: C.muted, marginTop: 14, letterSpacing: "0.03em" }}>{label}</div>
      </div>
    </Pop>
  );
};

/** Highlighter swipe behind text (left → right). */
export const Mark: React.FC<{ at: number; children: React.ReactNode; color?: string }> = ({ at, children, color }) => {
  const C = useC();
  const t = useNow();
  const p = prog(t, at, 0.3);
  return (
    <span style={{ position: "relative", display: "inline" }}>
      <span style={{ position: "absolute", left: -6, top: "8%", height: "88%", width: `calc(${p * 100}% + 12px)`,
        background: color ?? C.accentTint, borderRadius: 6, zIndex: 0 }} />
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </span>
  );
};

/** Accent ring drawn around a box (absolute, in the parent's coordinates). */
export const Ring: React.FC<{ at: number; x: number; y: number; w: number; h: number; r?: number }> = ({ at, x, y, w, h, r = 14 }) => {
  const C = useC();
  const t = useNow();
  const p = prog(t, at, 0.35);
  const per = 2 * (w + h);
  return (
    <svg style={{ position: "absolute", left: x - 8, top: y - 8, overflow: "visible", pointerEvents: "none" }} width={w + 16} height={h + 16}>
      <rect x={4} y={4} width={w + 8} height={h + 8} rx={r} fill="none" stroke={C.accent} strokeWidth={3.5}
        strokeDasharray={per} strokeDashoffset={per * (1 - p)} />
    </svg>
  );
};

/** iOS-style app tile with a logo + name under it. */
export const LogoTile: React.FC<{ src: string; name?: string; at: number; size?: number; dark?: boolean }> = ({ src, name, at, size = 220, dark }) => {
  const C = useC();
  return (
    <Pop at={at} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
      <div style={{ width: size, height: size, borderRadius: size * 0.23, background: "#fff", boxShadow: SHADOW,
        display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${C.border}` }}>
        <Img src={staticFile(src)} style={{ width: size * 0.62, height: size * 0.62, objectFit: "contain" }} />
      </div>
      {name && <div style={{ fontFamily: C.sans, fontWeight: 500, fontSize: 40, letterSpacing: "0.02em", color: dark ? "#fff" : C.body }}>{name}</div>}
    </Pop>
  );
};

/** Mouse pointer. */
export const Cursor: React.FC<{ x: number; y: number; down?: boolean }> = ({ x, y, down }) => (
  <svg style={{ position: "absolute", left: x, top: y, overflow: "visible", transform: `scale(${down ? 0.88 : 1})`, transformOrigin: "0 0",
    filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.35))" }} width={40} height={52}>
    <path d="M2 2 L2 40 L12 31 L19 47 L26 44 L19 28 L33 28 Z" fill="#111" stroke="#fff" strokeWidth={3} strokeLinejoin="round" />
  </svg>
);
