// The whole video: Ajay's cut full-frame, and during each b-roll scene the face moves into a corner box
// (or hides, mode "full") while the scene plays behind it. Audio always comes from the cut.
import React from "react";
import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BOX, BRIDGE, C, FONT, MOVE, S, fontFace, tintFill, tintInk } from "./theme";
import { SceneCtx, Txt, pop, useAppear, type Area } from "./kit";
import { SCENES } from "./scenes";
import type { Pill, Props, Scene } from "./types";

const ease = Easing.inOut(Easing.cubic);

/** How far the face is into the box (0 = full frame, 1 = in the box) at time t, and the mode of the scene it's in. */
const faceState = (scenes: Scene[], t: number) => {
  // scenes closer than BRIDGE seconds are joined, so the face stays in the box between them
  const spans: { a: number; b: number; mode: string }[] = [];
  for (const s of [...scenes].sort((x, y) => x.start - y.start)) {
    const mode = s.mode ?? "pip";
    const last = spans[spans.length - 1];
    if (last && s.start - last.b < BRIDGE && last.mode === mode) last.b = Math.max(last.b, s.end);
    else spans.push({ a: s.start, b: s.end, mode });
  }
  let k = 0, mode = "pip";
  for (const sp of spans) {
    const e = Math.max(0, Math.min(1, (t - sp.a) / MOVE, (sp.b - t) / MOVE));
    if (e > k) { k = e; mode = sp.mode; }
  }
  return { k: ease(k), mode };
};

const Face: React.FC<{ p: Props; k: number; mode: string }> = ({ p, k, mode }) => {
  const { width: W, height: H } = useVideoConfig();
  const fx = p.face?.x ?? 0.5, fy = p.face?.y ?? 0.42, zoom = p.face?.zoom ?? 1.5;
  const corner = p.corner ?? "br";
  const bx = corner.endsWith("r") ? W - BOX.w - BOX.margin : BOX.margin;
  const by = corner.startsWith("b") ? H - BOX.h - BOX.margin : BOX.margin;
  // inside the box: scale the frame so the face fills it, keep the face centred, never show past the frame edge
  const sk = (zoom * BOX.h) / H;
  const clampOff = (v: number, box: number, full: number) => Math.min(0, Math.max(box - full, v));
  const ix = clampOff(BOX.w / 2 - fx * W * sk, BOX.w, W * sk);
  const iy = clampOff(BOX.h / 2 - fy * H * sk, BOX.h, H * sk);
  const L = (a: number, b: number) => a + (b - a) * k;
  const hide = mode === "full" ? k : 0;
  return (
    <div style={{ position: "absolute", left: L(0, bx), top: L(0, by), width: L(W, BOX.w), height: L(H, BOX.h),
      borderRadius: L(0, BOX.radius), overflow: "hidden", opacity: 1 - hide,
      boxShadow: k > 0 ? `0 ${16 * k}px ${44 * k}px rgba(0,0,0,${0.22 * k})` : "none",
      outline: k > 0 ? `${3 * k}px solid ${C.ink}` : "none" }}>
      <OffthreadVideo src={staticFile(p.video)} style={{ position: "absolute", left: L(0, ix), top: L(0, iy),
        width: L(W, W * sk), height: L(H, H * sk), maxWidth: "none" }} />
    </div>
  );
};

const PillView: React.FC<{ pill: Pill; start: number; area: Area }> = ({ pill, start, area }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = start + frame / fps;
  const p = useAppear(pill.at, 11);
  const out = pill.until !== undefined ? interpolate(t, [pill.until, pill.until + 0.25], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const fill = tintFill(pill.tint);
  return (
    <div style={{ position: "absolute", left: area.x + (pill.x ?? area.w / 2), top: pill.y ?? area.y + area.h - 40,
      transform: "translate(-50%, -50%)", opacity: out }}>
      <div style={{ ...pop(p, 16), background: fill ?? C.ink, color: fill ? tintInk(pill.tint) : C.paper,
        fontFamily: FONT, fontSize: S.pill, padding: "10px 28px", borderRadius: 999, whiteSpace: "nowrap" }}>
        {pill.text}
      </div>
    </div>
  );
};

const SceneView: React.FC<{ s: Scene; area: Area }> = ({ s, area }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const len = s.end - s.start;
  const t = frame / fps;
  const fade = Math.min(1, t / 0.25, (len - t) / 0.25);
  const View = SCENES[s.type];
  return (
    <SceneCtx.Provider value={{ start: s.start, area }}>
      <AbsoluteFill style={{ opacity: Math.max(0, fade) }}>
        <div style={{ position: "absolute", left: area.x, top: area.y, width: area.w, height: area.h,
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          {View ? <View s={s} /> : <Txt color={C.red}>unknown scene type: {s.type}</Txt>}
        </div>
        {(s.pills ?? []).map((pl, i) => <PillView key={i} pill={pl} start={s.start} area={area} />)}
      </AbsoluteFill>
    </SceneCtx.Provider>
  );
};

export const Main: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const { k, mode } = faceState(p.scenes, frame / fps);
  const left = (p.corner ?? "br").endsWith("l");
  const area = (s: Scene): Area => {
    const m = 110;
    if ((s.mode ?? "pip") === "full") return { x: m, y: 90, w: W - 2 * m, h: H - 180 };
    const side = BOX.w + BOX.margin + 50; // keep content clear of the face box
    return { x: left ? side : m, y: 90, w: W - m - side, h: H - 180 };
  };
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <style>{fontFace}</style>
      {/* faint dot grid, like the Excalidraw canvas the carousels come from */}
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(${C.dots} 2px, transparent 2px)`, backgroundSize: "36px 36px" }} />
      {p.scenes.map((s, i) => (
        <Sequence key={i} from={Math.round(s.start * fps)} durationInFrames={Math.max(1, Math.round((s.end - s.start) * fps))} layout="none">
          <SceneView s={s} area={area(s)} />
        </Sequence>
      ))}
      <Face p={p} k={k} mode={mode} />
    </AbsoluteFill>
  );
};
