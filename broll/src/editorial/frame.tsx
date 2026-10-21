// Editorial frame: paper sheet on a border, the face-box area kept clear on the right, scene windows with the
// motion-blur slide in/out from the reference.
import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { useNow, useT } from "./kit";

export const FACE = { w: 210, h: 270, right: 56 };
export const CONTENT_W = 1920 - FACE.w - FACE.right - 90; // content is centred in this width
export const FULL_W = 1920 - 44 - 22; // face hidden: the window (FULL_W + 22) fills the paper sheet

/** faceGuide: dashed outline where the face box goes; faceFull: label for stretches where his face is full-frame. */
export const Frame: React.FC<{ faceGuide?: boolean; faceFull?: boolean; children: React.ReactNode }> = ({ faceGuide, faceFull, children }) => {
  const T = useT();
  return (
    <AbsoluteFill style={{ background: T.border }}>
      <div style={{ position: "absolute", inset: 22, borderRadius: 26, background: T.pageBg ?? T.page, overflow: "hidden" }}>{children}</div>
      {faceFull && (
        <div data-lint="chrome" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: T.ui, fontSize: 28, color: T.muted, letterSpacing: "0.12em", textTransform: "uppercase" }}>face full-frame</div>
      )}
      {faceGuide && (
        <div data-lint="chrome" style={{ position: "absolute", right: FACE.right, top: (1080 - FACE.h) / 2, width: FACE.w, height: FACE.h, borderRadius: 18,
          border: `2px dashed ${T.line}`, boxSizing: "border-box", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 14 }}>
          <div style={{ fontFamily: T.ui, fontSize: 16, color: T.muted, letterSpacing: "0.12em", textTransform: "uppercase" }}>face box</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/** One scene's window (absolute seconds). Slides + blurs in from the right and out to the left. `w` = its width. */
export const SceneWindow: React.FC<{ from: number; to: number; first?: boolean; last?: boolean; w?: number; children: React.ReactNode }> = ({ from, to, first, last, w = CONTENT_W, children }) => {
  const t = useNow();
  if (t < from - 0.01 || t > to + 0.01) return null;
  const inP = first ? 1 : interpolate(t, [from, from + 0.35], [0, 1], { extrapolateRight: "clamp" });
  const outP = last ? 0 : interpolate(t, [to - 0.3, to], [0, 1], { extrapolateLeft: "clamp" });
  return (
    <AbsoluteFill style={{ width: w + 22, opacity: Math.min(inP * 1.5, 1 - outP * 0.8),
      transform: `translateX(${(1 - inP) * 240 - outP * 240}px)`, filter: `blur(${(1 - inP) * 20 + outP * 20}px)` }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
    </AbsoluteFill>
  );
};
