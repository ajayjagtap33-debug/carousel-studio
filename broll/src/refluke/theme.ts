// Refluke b-roll theme. Colours sampled from the reference video with PIL (not eyeballed) — see
// videos/reference/2026-10-14-nick-saraev-ceo-ai/teardown.md and assets/refluke-broll/library.md.
// Type is the closest Google Fonts match to his: Playfair Display + DM Sans, mono for sources.
import { loadFont as playfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as dmSans } from "@remotion/google-fonts/DMSans";
import { loadFont as dmMono } from "@remotion/google-fonts/DMMono";

const F = {
  serif: playfair("normal", { weights: ["400", "500"], subsets: ["latin"] }).fontFamily,
  serifI: playfair("italic", { weights: ["400"], subsets: ["latin"] }).fontFamily,
  sans: dmSans("normal", { weights: ["400", "500", "600"], subsets: ["latin"] }).fontFamily,
  mono: dmMono("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily,
};

export type RTheme = {
  page: string; card: string; panel: string; ghost: string; line: string;
  ink: string; body: string; muted: string;
  accent: string; deep: string; success: string;
  ai: string; alert: string;
  head: string; headItalic: string; ui: string; mono: string;
  radius: number; shadow: string; shadowLg: string;
};

export const R: RTheme = {
  page: "#FAFCFA",
  card: "#FFFFFF",
  panel: "#F9F9F6",
  ghost: "#EDE9E2",
  line: "#ECECE8",
  ink: "#0C0F0F",
  body: "#65676B",
  muted: "#7B7B7E",
  accent: "#536837",   // the olive — bars, rules, arrows, active rows
  deep: "#3B482E",     // chart lines
  success: "#2ADD5E",  // tick circles ONLY
  ai: "#6E5BD6",       // purple, only for an AI agent
  alert: "#E33333",    // borrowed YouTube red, nowhere else
  head: F.serif,
  headItalic: F.serifI,
  ui: F.sans,
  mono: F.mono,
  radius: 16,
  shadow: "0 1px 2px rgba(20,24,20,.05), 0 10px 30px rgba(20,24,20,.045)",
  shadowLg: "0 1px 2px rgba(20,24,20,.06), 0 18px 50px rgba(20,24,20,.09)",
};

/** Where Ajay's face sits. `pip` is the only one where the FACE moves and the content doesn't. */
export type Placement =
  | "tab-right" | "half-left" | "half-right" | "corner" | "side-points" | "band" | "full" | "pip";

/** Content box per placement, in a 1920x1080 frame. */
export const BOX: Record<Placement, { x: number; y: number; w: number; h: number }> = {
  "tab-right":   { x: 104, y: 70, w: 1340, h: 940 },
  "half-left":   { x: 980, y: 70, w: 840, h: 940 },
  "half-right":  { x: 100, y: 70, w: 840, h: 940 },
  "corner":      { x: 820, y: 70, w: 1000, h: 940 },
  "side-points": { x: 1200, y: 70, w: 620, h: 940 },
  "band":        { x: 104, y: 70, w: 1712, h: 600 },
  "full":        { x: 104, y: 70, w: 1712, h: 940 },
  "pip":         { x: 0, y: 0, w: 1920, h: 1080 },
};

/** The zone kept clear for his face (null = he is full-frame behind, or not on screen). */
export const FACE_ZONE: Record<Placement, { x: number; y: number; w: number; h: number } | null> = {
  "tab-right":   { x: 1528, y: 330, w: 300, h: 420 },
  "half-left":   { x: 0, y: 0, w: 940, h: 1080 },
  "half-right":  { x: 980, y: 0, w: 940, h: 1080 },
  "corner":      null,
  "side-points": null,
  "band":        null,
  "full":        null,
  "pip":         null,
};
