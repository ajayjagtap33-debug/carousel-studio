// Refluke layout lint. The page is full-bleed 1920x1080 (no inset sheet), and the zone kept clear
// for his face changes with the placement — including `pip`, where the face is a circle in a corner
// and the content must stay off it. Measuring itself is shared in ../lintcore.tsx.
import React from "react";
import { LintShell, type R } from "../lintcore";
import { FACE_ZONE, type Placement } from "./theme";

export const MIN_TEXT = 24, MIN_LABEL = 20; // library.md §1 — the studio floor for video

// A tolerance rather than 0: a full-bleed scene (`screen`) legitimately touches the edge.
const PAGE: R = { l: -2, t: -2, r: 1922, b: 1082 };

/** The pip circle drawn by frame.tsx — 260px, 90px in from the corner. */
const PIP_SIZE = 260, PIP_INSET = 90;
const pipRect = (corner: string): R => {
  const left = corner === "bl" || corner === "tl";
  const top = corner === "tl" || corner === "tr";
  const l = left ? PIP_INSET : 1920 - PIP_INSET - PIP_SIZE;
  const t = top ? PIP_INSET : 1080 - PIP_INSET - PIP_SIZE;
  return { l, t, r: l + PIP_SIZE, b: t + PIP_SIZE };
};

export const faceRectFor = (placement: Placement, corner?: string): R | null => {
  if (placement === "pip") return pipRect(corner ?? "br");
  const z = FACE_ZONE[placement];
  return z ? { l: z.x, t: z.y, r: z.x + z.w, b: z.y + z.h } : null;
};

export const Lint: React.FC<{
  placement: Placement; corner?: string; children: React.ReactNode;
}> = ({ placement, corner, children }) => (
  <LintShell opts={{
    page: PAGE,
    face: faceRectFor(placement, corner),
    minText: MIN_TEXT,
    minLabel: MIN_LABEL,
    faceName: placement === "pip" ? "face pip" : "face zone",
  }}>
    {children}
  </LintShell>
);
