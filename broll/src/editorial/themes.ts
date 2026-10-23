// "Editorial" video style: dense, source-backed b-roll (see videos/reference/.../teardown.md).
// Separate from the Excalidraw look in ../theme.ts. Two directions under review: A (ink & signal), B (warm paper).
import { loadFont as fraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as inter } from "@remotion/google-fonts/Inter";
import { loadFont as interTight } from "@remotion/google-fonts/InterTight";
import { loadFont as mono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as mulish } from "@remotion/google-fonts/Mulish";

const F = {
  fraunces: fraunces("normal", { weights: ["400", "600"], subsets: ["latin"] }).fontFamily,
  frauncesI: fraunces("italic", { weights: ["400"], subsets: ["latin"] }).fontFamily,
  inter: inter("normal", { weights: ["400", "500", "600"], subsets: ["latin"] }).fontFamily,
  tight: interTight("normal", { weights: ["500", "700", "800"], subsets: ["latin"] }).fontFamily,
  mono: mono("normal", { weights: ["400", "500"], subsets: ["latin"] }).fontFamily,
  mulish: mulish("normal", { weights: ["300", "400", "500", "600", "700", "800"], subsets: ["latin"] }).fontFamily,
  mulishI: mulish("italic", { weights: ["300", "400"], subsets: ["latin"] }).fontFamily,
};

export type ETheme = {
  name: string;
  border: string; page: string; pageBg?: string; ink: string; body: string; muted: string; line: string;
  card: string; dark: string; darkInk: string;
  accent: string; accentSoft: string; accentInk: string; good: string; bad: string;
  head: string; headWeight: number; headTracking: string; accentStyle: "italic" | "normal";
  accentFont?: string; accentWeight?: number; // the *accent* word in headlines (default: serif italic)
  highlight?: string; // pale wash behind an accent word, when the theme marks it that way instead of italics
  kicker?: string; // eyebrow colour (default: muted)
  pillAccentBg?: string; pillAccentFg?: string; // accent pill (default: solid accent)
  ai?: string; aiSoft?: string; // purple, only for AI / model / platform things
  ui: string; mono: string;
  radius: number; shadow: string;
};

export const THEMES: Record<"A" | "B" | "C", ETheme> = {
  // A. Ink & signal: cool white, bold grotesk, electric blue. Crisp, SaaS-like.
  A: {
    name: "A · Ink & signal",
    border: "#E6E7EA", page: "#F7F7F5", ink: "#111214", body: "#55585F", muted: "#9A9DA4", line: "#E3E4E8",
    card: "#FFFFFF", dark: "#111214", darkInk: "#FFFFFF",
    accent: "#2F5BFF", accentSoft: "#E6ECFF", accentInk: "#FFFFFF", good: "#1F9D55", bad: "#E5484D",
    head: F.tight, headWeight: 800, headTracking: "-0.035em", accentStyle: "normal",
    ui: F.inter, mono: F.mono,
    radius: 16, shadow: "0 1px 2px rgba(17,18,20,.06), 0 12px 32px rgba(17,18,20,.07)",
  },
  // B. Warm paper: cream page, editorial serif with an italic accent word, burnt orange.
  B: {
    name: "B · Warm paper",
    border: "#E9E1D2", page: "#F6F1E7", ink: "#1D1A16", body: "#5E574D", muted: "#A39A8C", line: "#E6DDCD",
    card: "#FFFDF8", dark: "#1D1A16", darkInk: "#F6F1E7",
    accent: "#D9622B", accentSoft: "#F8E3D6", accentInk: "#FFFFFF", good: "#3F7D4E", bad: "#C2412D",
    head: F.fraunces, headWeight: 400, headTracking: "-0.02em", accentStyle: "italic",
    ui: F.inter, mono: F.mono,
    radius: 14, shadow: "0 1px 2px rgba(29,26,22,.06), 0 14px 34px rgba(29,26,22,.08)",
  },
  // C. Warm paper × TMV: B's calm editorial feel on TMV's light treatment (paper + faint blush/lilac blooms).
  // TMV red only in small doses (eyebrows, the accent word, active outline); purple kept for AI things.
  // One family, Mulish: bold upright headline, the accent word bold red on a pale wash.
  C: {
    name: "C · Warm paper × TMV",
    border: "#EDE6E3", page: "#F6F6F3",
    pageBg: "#F6F6F3", // flat warm paper + the 32px grid the Frame draws, as on the scene canvas
    ink: "#141414", body: "#5E5856", muted: "#9A9492", line: "#E6DFDC",
    card: "#FFFFFF", dark: "#141414", darkInk: "#FBF8F7",
    accent: "#B80000", accentSoft: "#FDF0EE", accentInk: "#FFFFFF", good: "#4E8C5A", bad: "#B80000",
    head: F.mulish, headWeight: 800, headTracking: "-0.03em", accentStyle: "normal",
    // Ajay 2026-10-22, from the scene canvas: the accent word is bold red on a pale wash, not light italic
    accentWeight: 800, highlight: "#FBE3E0",
    kicker: "#B80000", pillAccentBg: "#FDF0EE", pillAccentFg: "#B80000",
    ai: "#7B3AEC", aiSoft: "#E7E0FB",
    ui: F.mulish, mono: F.mono,
    radius: 16, shadow: "0 1px 2px rgba(26,22,20,.05), 0 14px 36px rgba(110,104,102,.10)",
  },
};

export const ITALIC = F.frauncesI;
