import type { Tint } from "./theme";

export type Pill = { text: string; at: number; until?: number; x?: number; y?: number; tint?: Tint };

export type Scene = {
  type: string;
  start: number; // seconds in the cut
  end: number;
  mode?: "pip" | "full"; // pip = face in the corner box (default); full = b-roll covers the face
  pills?: Pill[];
  source?: string; // what was said here (for the review sheet)
  [k: string]: unknown;
};

export type Props = {
  video: string; // file in the job folder (public dir)
  media: { fps: number; width: number; height: number; duration: number };
  face?: { x?: number; y?: number; zoom?: number }; // face centre in the source frame (0..1), zoom inside the box
  corner?: "br" | "bl" | "tr" | "tl";
  scenes: Scene[];
};
