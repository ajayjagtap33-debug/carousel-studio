// Editorial frame: paper sheet on a border, the face-box area kept clear on one side, scene windows with the
// motion-blur slide in/out from the reference.
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile } from "remotion";
import { useNow, useT } from "./kit";

/** Which side of the frame Ajay's face sits on; "none" = he's full-frame and the scene fills the sheet. */
export type FaceSide = "left" | "right" | "none";

// Geometry measured off the approved scene canvas: a portrait face zone on one side, content flush-left
// in a column on the other. (It was a 210x270 thumbnail before — too small to put a person in.)
export const FACE = { w: 604, h: 842, edge: 58 };
export const GUTTER = 73;
export const CONTENT_W = 1920 - FACE.edge - FACE.w - GUTTER - 60; // 1125
export const FULL_W = 1800;

/** Where a scene's column starts, given which side the face is on. */
export const contentX = (side: FaceSide) =>
  side === "none" ? 60 : side === "left" ? FACE.edge + FACE.w + GUTTER : 60;

/** The face box in page coordinates, for the guide outline and the layout lint. */
export const faceRect = (side: FaceSide) => ({
  l: side === "right" ? 1920 - FACE.edge - FACE.w : FACE.edge,
  t: (1080 - FACE.h) / 2,
  r: side === "right" ? 1920 - FACE.edge : FACE.edge + FACE.w,
  b: (1080 + FACE.h) / 2,
});

/** faceGuide: dashed outline on that side; faceFull: label for stretches where his face is full-frame. */
export const Frame: React.FC<{ faceGuide?: FaceSide | false; faceFull?: boolean; children: React.ReactNode }> = ({ faceGuide, faceFull, children }) => {
  const T = useT();
  return (
    <AbsoluteFill style={{ background: T.border }}>
      <div style={{ position: "absolute", inset: 22, borderRadius: 26, background: T.pageBg ?? T.page, overflow: "hidden" }}>
        {/* faint 32px paper grid, as on the scene canvas */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.5, backgroundSize: "32px 32px",
          backgroundImage: `linear-gradient(to right, ${T.line} 1px, transparent 1px), linear-gradient(to bottom, ${T.line} 1px, transparent 1px)` }} />
        {children}
      </div>
      {/* the wordmark is chrome: top-left on every scene */}
      <Img data-lint="chrome" src={staticFile("logos/tmv-red.png")}
        style={{ position: "absolute", left: 58, top: 46, width: 84, height: 28, objectFit: "contain", objectPosition: "left center" }} />
      {faceFull && (
        <div data-lint="chrome" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: T.ui, fontSize: 28, color: T.muted, letterSpacing: "0.12em", textTransform: "uppercase" }}>face full-frame</div>
      )}
      {faceGuide && faceGuide !== "none" && (
        <div data-lint="chrome" style={{ position: "absolute", ...(faceGuide === "right" ? { right: FACE.edge } : { left: FACE.edge }),
          top: (1080 - FACE.h) / 2, width: FACE.w, height: FACE.h, borderRadius: 18,
          border: `2px dashed ${T.line}`, boxSizing: "border-box", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 14 }}>
          <div style={{ fontFamily: T.ui, fontSize: 16, color: T.muted, letterSpacing: "0.12em", textTransform: "uppercase" }}>face box</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/** One scene's window (absolute seconds). Slides + blurs in from the right and out to the left. `w` = its width.
 *  `faceSide` "left" pushes the window to the right edge, so the left third stays clear for his face. */
export const SceneWindow: React.FC<{ from: number; to: number; first?: boolean; last?: boolean; w?: number; faceSide?: FaceSide; children: React.ReactNode }> = ({ from, to, first, last, w = CONTENT_W, faceSide, children }) => {
  const t = useNow();
  if (t < from - 0.01 || t > to + 0.01) return null;
  const inP = first ? 1 : interpolate(t, [from, from + 0.35], [0, 1], { extrapolateRight: "clamp" });
  const outP = last ? 0 : interpolate(t, [to - 0.3, to], [0, 1], { extrapolateLeft: "clamp" });
  return (
    <AbsoluteFill style={{ left: contentX(faceSide ?? "right"), width: w, opacity: Math.min(inP * 1.5, 1 - outP * 0.8),
      transform: `translateX(${(1 - inP) * 240 - outP * 240}px)`, filter: `blur(${(1 - inP) * 20 + outP * 20}px)` }}>
      {/* flush-left in its column, vertically centred — the canvas layout */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "flex-start" }}>{children}</div>
    </AbsoluteFill>
  );
};
