// Reel: Ajay's cut + Nick Saraev's reel layouts at 1080×1920, in a calm palette. Props = a reel's reel.json.
//   split  card on the light canvas on top, his footage in a rounded panel below, caption on the seam
//   soft   card on a warm stone canvas over a faint blurred copy of itself (no footage). Replaces Nick's dark
//          layout: black read as loud (Ajay, 2026-10-30). "dark" in older reel.json files maps here.
//   full   card on the light canvas, full screen (no footage) — for stretches where he isn't looking at the lens
//   fth    his footage full frame, punched in on his face
//   cta    fth + "comment" over the keyword
import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, staticFile } from "remotion";
import { THEMES, ThemeCtx, clamp01, easeOut, prog, useC, useNow } from "./kit";
import { SCENES, type Scene } from "./scenes";

export type Layout = "split" | "soft" | "dark" | "full" | "fth" | "cta";
export type Segment = { start: number; end: number; layout: Layout; enter?: "pop" | "slide" | "cut"; scene?: Scene };
export type Word = { w: string; s: number; accent?: boolean };
export type Caption = { start: number; end: number; words: Word[] };
export type ReelProps = {
  video: string; duration: number; theme?: "tmv" | "ajay";
  face?: { x: number; y: number };
  hook?: { lines: [string, string]; end: number };
  segments: Segment[]; captions: Caption[];
  cta?: { keyword: string; at: number };
};

const W = 1080, H = 1920;
// Panel starts higher and his face sits higher in it, so head, neck and shoulders all show (2026-10-30 note).
const PANEL_TOP = 900;
const FACE_IN_PANEL = 0.34;
type Box = { x: number; y: number; w: number; h: number };
const BOX: Record<"split" | "hook" | "soft" | "full", Box> = {
  split: { x: 70, y: 110, w: 940, h: 640 },
  hook: { x: 90, y: 360, w: 900, h: 400 },
  soft: { x: 70, y: 300, w: 940, h: 900 },
  full: { x: 70, y: 260, w: 940, h: 980 },
};
const CAP_Y: Record<Layout, number> = { split: 830, soft: 1380, dark: 1380, full: 1380, fth: 1460, cta: 1300 };
const CAP_SIZE = 72;
// Text over his footage: a tight dark halo (separates white text from his white shirt) + a soft neon glow so it pops.
const POP = (_glow: string) => `0 0 3px rgba(0,0,0,0.55), 0 2px 10px rgba(0,0,0,0.45), 0 0 16px rgba(255,138,122,0.75), 0 0 34px rgba(255,138,122,0.45)`;

const Footage: React.FC<{ video: string; mode: "panel" | "fth"; face: { x: number; y: number }; segStart: number }> = ({ video, mode, face, segStart }) => {
  const t = useNow();
  if (mode === "panel") {
    const panelH = H - PANEL_TOP;
    const top = panelH * FACE_IN_PANEL - face.y * H;
    return (
      <div style={{ position: "absolute", left: 0, top: PANEL_TOP, width: W, height: panelH, borderRadius: "46px 46px 0 0", overflow: "hidden",
        boxShadow: "0 -8px 30px rgba(60,40,30,0.10)" }}>
        <OffthreadVideo muted src={staticFile(video)} style={{ position: "absolute", left: 0, top, width: W, height: H }} />
      </div>
    );
  }
  const z = 1.15 + 0.04 * clamp01((t - segStart) / 4); // 1.28 cropped his hair (2026-10-30 stills)
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <OffthreadVideo muted src={staticFile(video)} style={{ width: W, height: H, transform: `scale(${z})`, transformOrigin: `${face.x * 100}% ${face.y * 100 - 8}%` }} />
    </AbsoluteFill>
  );
};

const Canvas: React.FC<{ tone: string }> = ({ tone }) => (
  <AbsoluteFill style={{ background: tone }}>
    {/* soft window light top-left, standing in for Nick's palm-leaf shadow */}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 45% at 8% 6%, rgba(255,255,255,0.55), transparent 70%)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 120% 80% at 50% 40%, transparent 65%, rgba(80,60,50,0.05))" }} />
  </AbsoluteFill>
);

const SceneIn: React.FC<{ seg: Segment; box: Box }> = ({ seg, box }) => {
  const t = useNow();
  if (!seg.scene) return null;
  const View = SCENES[seg.scene.type];
  const scene = { ...seg.scene, start: seg.start };
  const enter = seg.enter ?? "pop";
  let style: React.CSSProperties = {};
  if (enter === "pop") {
    const p = prog(t, seg.start - 0.03, 0.26);
    style = { opacity: p, filter: p < 1 ? `blur(${(1 - p) * 12}px)` : undefined, transform: `scale(${0.96 + 0.04 * p})` };
  } else if (enter === "slide") {
    const p = easeOut(clamp01((t - (seg.start - 0.05)) / 0.34));
    const v = 1 - p;
    style = { transform: `translateX(${v * W}px)`, filter: v > 0.02 ? `blur(${v * 14}px)` : undefined };
  }
  return (
    <div style={{ position: "absolute", left: box.x, top: box.y, width: box.w, height: box.h, ...style }}>
      {View ? <View s={scene} w={box.w} h={box.h} dark={false} /> : <div style={{ color: "red", fontSize: 40 }}>unknown scene {seg.scene.type}</div>}
    </div>
  );
};

const HookTitle: React.FC<{ lines: [string, string] }> = ({ lines }) => {
  const C = useC();
  const t = useNow();
  const words = lines[0].split(" ");
  const wipe = easeOut(clamp01((t - 0.25) / 0.4));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 130, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <div style={{ fontFamily: C.sans, fontWeight: 700, fontSize: 64, letterSpacing: "0.01em", color: C.ink, display: "flex", gap: 22 }}>
        {words.map((w, i) => {
          const p = prog(t, i * 0.08, 0.15);
          return <span key={i} style={{ opacity: p, filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined }}>{w}</span>;
        })}
      </div>
      <div style={{ position: "relative", padding: "2px 30px 10px", clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0 round 10px)`, background: C.accentTint, borderRadius: 10 }}>
        <span style={{ fontFamily: C.accentFont, fontStyle: C.accentStyle === "serif-italic" ? "italic" : "normal", fontWeight: 700, fontSize: 84, color: C.accent, lineHeight: 1.15 }}>{lines[1]}</span>
      </div>
    </div>
  );
};

const Captions: React.FC<{ caps: Caption[]; layout: Layout; y: number; hide?: boolean }> = ({ caps, layout, y, hide }) => {
  const C = useC();
  const t = useNow();
  if (hide) return null;
  const cap = caps.find((c) => t >= c.start - 0.03 && t < c.end);
  if (!cap) return null;
  const onFootage = layout === "fth" || layout === "cta";
  const size = CAP_SIZE;
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: y - size * 0.7, display: "flex", justifyContent: "center", alignItems: "baseline", columnGap: 26, rowGap: 6, flexWrap: "wrap" }}>
      {cap.words.map((w, i) => {
        const p = prog(t, w.s - 0.04, 0.14);
        const col = w.accent ? (onFootage ? C.accentOnDark : C.accent) : onFootage ? "#FFFFFF" : C.ink;
        const grey = onFootage ? "rgba(255,255,255,0.35)" : "rgba(58,53,50,0.22)";
        return (
          <span key={i} style={{
            fontFamily: w.accent ? C.accentFont : C.sans, fontWeight: w.accent ? 700 : onFootage ? C.sansWeight + 100 : C.sansWeight,
            fontStyle: w.accent && C.accentStyle === "serif-italic" ? "italic" : "normal",
            fontSize: w.accent ? size * C.accentScale : size, letterSpacing: w.accent ? "0.01em" : "0.015em", lineHeight: 1.15,
            color: p >= 1 ? col : grey, opacity: p > 0 ? 1 : 0, filter: p < 1 ? `blur(${(1 - p) * 5}px)` : undefined,
            textShadow: onFootage ? POP(C.glow) : undefined,
          }}>{w.w}</span>
        );
      })}
    </div>
  );
};

const CtaKeyword: React.FC<{ keyword: string; at: number }> = ({ keyword, at }) => {
  const C = useC();
  const t = useNow();
  const p = easeOut(clamp01((t - at) / 0.3));
  const p2 = easeOut(clamp01((t - at - 0.12) / 0.35));
  if (t < at - 0.05) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1260, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontFamily: C.accentFont, fontWeight: 700, fontSize: 84, color: "#fff", opacity: p, transform: `translateY(${(1 - p) * 24}px)`,
        textShadow: POP(C.glow), filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined }}>comment</div>
      <div style={{ fontFamily: C.sans, fontWeight: 700, fontSize: 160, letterSpacing: "0.02em", lineHeight: 1, marginTop: -4,
        opacity: p2, transform: `translateY(${(1 - p2) * 40}px) scale(${0.94 + 0.06 * p2})`, filter: p2 < 1 ? `blur(${(1 - p2) * 12}px)` : undefined,
        color: "#FFFFFF", textShadow: `${POP(C.glow)}, 0 0 60px ${C.accent}99` }}>
        “{keyword}”
      </div>
    </div>
  );
};

export const Reel: React.FC<ReelProps> = (p) => {
  const t = useNow();
  const C = THEMES[p.theme ?? "tmv"];
  const face = p.face ?? { x: 0.5, y: 0.35 };
  const segs = [...p.segments].sort((a, b) => a.start - b.start);
  let seg = segs[0];
  for (const s of segs) if (t >= s.start) seg = s;
  const isHook = !!p.hook && t < p.hook.end;
  const layout: Layout = seg.layout === "dark" ? "soft" : seg.layout;
  const ctaOn = !!p.cta && t >= p.cta.at - 0.05;
  const box = isHook ? BOX.hook : layout === "split" ? BOX.split : layout === "soft" ? BOX.soft : BOX.full;
  return (
    <ThemeCtx.Provider value={C}>
      <AbsoluteFill style={{ background: C.canvas }}>
        {/* his voice runs the whole reel; the footage layers are muted because they unmount during b-roll */}
        <Audio src={staticFile(p.video)} />
        {(layout === "split" || layout === "full") && <Canvas tone={C.canvas} />}
        {layout === "soft" && (
          <AbsoluteFill style={{ overflow: "hidden" }}>
            <Canvas tone={C.soft} />
            {seg.scene && (
              <div style={{ position: "absolute", inset: 0, transform: "scale(2.2)", filter: "blur(44px)", opacity: 0.35 }}>
                <SceneIn seg={{ ...seg, enter: "cut" }} box={BOX.soft} />
              </div>
            )}
          </AbsoluteFill>
        )}
        {(layout === "fth" || layout === "cta") && <Footage video={p.video} mode="fth" face={face} segStart={seg.start} />}
        {(layout === "fth" || layout === "cta") && <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.22))" }} />}
        {layout === "split" && <Footage video={p.video} mode="panel" face={face} segStart={seg.start} />}
        {isHook && <HookTitle lines={p.hook!.lines} />}
        {layout !== "fth" && layout !== "cta" && <SceneIn key={seg.start} seg={seg} box={box} />}
        <Captions caps={p.captions} layout={layout} y={CAP_Y[layout]} hide={ctaOn} />
        {p.cta && layout === "cta" && <CtaKeyword keyword={p.cta.keyword} at={p.cta.at} />}
      </AbsoluteFill>
    </ThemeCtx.Provider>
  );
};
