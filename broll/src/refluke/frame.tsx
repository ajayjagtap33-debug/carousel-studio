// Refluke frame: a flat page (no border sheet), content positioned by placement, and the zone
// kept clear for Ajay's face. Beats are PLAIN CUTS — no wipes, no slides (library.md §7.7).
import React from "react";
import { AbsoluteFill } from "remotion";
import { BOX, FACE_ZONE, type Placement } from "./theme";
import { useNow, useT } from "./kit";

export const Frame: React.FC<{
  placement: Placement; faceGuide?: boolean; children: React.ReactNode;
}> = ({ placement, faceGuide, children }) => {
  const T = useT();
  const zone = FACE_ZONE[placement];
  return (
    <AbsoluteFill style={{ background: T.page }}>
      {children}
      {faceGuide && zone && (
        <div data-lint="chrome" style={{
          position: "absolute", left: zone.x, top: zone.y, width: zone.w, height: zone.h,
          border: `2px dashed #C9CCC6`, borderRadius: 12, boxSizing: "border-box",
          display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 10,
        }}>
          <div style={{ fontFamily: T.ui, fontSize: 19, color: "#AFB3AC", letterSpacing: "0.1em" }}>face</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/**
 * One beat's window. Hard cut in and out — the house rule is plain cuts, so there is deliberately
 * no slide or blur transition here. Element-level motion lives inside the scene.
 */
export const Beat: React.FC<{
  from: number; to: number; placement: Placement; children: React.ReactNode;
}> = ({ from, to, placement, children }) => {
  const t = useNow();
  if (t < from - 0.01 || t > to + 0.01) return null;
  const b = BOX[placement];
  const centred = placement !== "pip";
  return (
    <div style={{
      position: "absolute", left: b.x, top: b.y, width: b.w, height: b.h,
      display: centred ? "flex" : undefined,
      alignItems: centred ? "center" : undefined,
      justifyContent: centred ? "flex-start" : undefined,
    }}>
      <div style={{ width: "100%" }}>{children}</div>
    </div>
  );
};

/** The relocating face PiP — the only mode where the face moves and the content doesn't. */
export const FacePip: React.FC<{ corner?: "bl" | "br" | "tl" | "tr"; size?: number }> = ({
  corner = "br", size = 260,
}) => {
  const T = useT();
  const pos: React.CSSProperties =
    corner === "bl" ? { left: 90, bottom: 90 } :
    corner === "tl" ? { left: 90, top: 90 } :
    corner === "tr" ? { right: 90, top: 90 } :
    { right: 90, bottom: 90 };
  return (
    <div data-lint="chrome" style={{
      position: "absolute", ...pos, width: size, height: size, borderRadius: "50%",
      border: `4px solid ${T.page}`, background: "#2B2E2B",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: T.ui, fontSize: 21, color: "#9DA39C", letterSpacing: "0.1em",
    }}>face</div>
  );
};
