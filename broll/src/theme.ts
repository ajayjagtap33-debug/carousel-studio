// Same palette as the carousels (theme/theme.json), so videos and carousels look like one brand.
import virgil from "./fonts/Virgil.woff2";

export const C = {
  ink: "#1e1e1e",
  body: "#495057",
  grey: "#868e96",
  paper: "#ffffff",
  dots: "#e9ecef",
  red: "#e03131",
  blue: "#1971c2",
  green: "#2f9e44",
  violet: "#6741d9",
  orange: "#f08c00",
  l_red: "#ffc9c9",
  l_blue: "#a5d8ff",
  l_green: "#b2f2bb",
  l_violet: "#d0bfff",
  l_yellow: "#ffec99",
  l_orange: "#ffd8a8",
  l_grey: "#e9ecef",
} as const;

export type Tint = "red" | "blue" | "green" | "violet" | "orange" | "yellow" | "grey";
export const tintFill = (t?: Tint) => (t ? (C as Record<string, string>)[`l_${t}`] : undefined);
export const tintInk = (t?: Tint) =>
  t && t !== "yellow" && t !== "grey" ? (C as Record<string, string>)[t] : C.ink;

export const FONT = "Virgil";
export const fontFace = `@font-face{font-family:Virgil;src:url(${virgil}) format("woff2");font-display:block}`;

// Type sizes for a 1080p frame. Text never goes below 34px (it's read on phones too).
export const S = { title: 80, kicker: 34, item: 46, label: 38, pill: 36, stat: 190, small: 34 };

// Face box (talking head while b-roll plays), and the seconds the face takes to move in/out.
export const BOX = { w: 340, h: 430, margin: 48, radius: 28 };
export const MOVE = 0.45;
// Gaps between two scenes shorter than this keep the face in the box (no pop out and back).
export const BRIDGE = 1.2;
