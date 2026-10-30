// Reel: the 9:16 short-video look (1080×1920), Nick Saraev's reel layout on our horizontal studio look.
// Layouts: `split` (board on top, him in a rounded panel at the bottom with his head and shoulders cut out so they
// pop above it, caption on the seam), `full` (full talking head, punched in), `board` (b-roll fills the screen),
// `type` (one huge line) and `card` (a section card). Board scenes are the studio's own (../studio/scenes*),
// drawn in a 960-wide stage and scaled to fit; captions are Open Sauce Sans Medium on a see-through pill.
// Design notes: reel-creator/design/README.md. `ReelBook` plays a list of frames back to back (the reference
// book); the real reel renderer will reuse these pieces.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Img, Sequence, continueRender, delayRender, staticFile, useVideoConfig } from "remotion";
import { Enter, SHADOW, THEMES, ThemeCtx, clamp01, ramp, useC, useIn, useNow } from "../studio/kit";
import { SCENES, type SScene } from "../studio/scenes";
import sauce from "../fonts/OpenSauceSans-Medium.ttf";

export const W = 1080, H = 1920;
/** Instagram's own UI covers these (no official spec; conservative end of the 2026 guides). */
export const SAFE = { top: 220, bottom: 440, right: 120 };
/** Nick's split, measured off reel 01 at 1080×1920: panel 924 wide, 60px top corners, head pops ~250px above it. */
export const PANEL = { x: 78, w: 924, top: 1330, r: 60 };
const SAUCE = "Open Sauce Sans";

type Him = { f: string; m: string; cx: number; top: number; k?: number }; // source frame, cut-out, head centre x / top (source px)
type Caption = { text: string; at: number; gap?: number; y?: number };
export type ReelFrame = {
  name: string; dur: number; still: number;
  layout: "split" | "full" | "board" | "type" | "card";
  him?: Him;
  scene?: SScene; from?: number;          // a studio scene, played from scene time `from` (default start − 0.3)
  stage?: { y?: number; scale?: number }; // stage centre and scale (defaults per layout)
  caption?: Caption;
  title?: { line1: string; line2: string; at: number };
  section?: { kicker: string; word: string; at: number };
  type?: { line: string; at: number; size?: number };
  counter?: { value: number; label: string; at: number; dur?: number; x: number; y: number };
  callouts?: { text: string; at: number; label: [number, number]; target: [number, number] }[];
  ad?: { at: number };
  cta?: { word: string; at: number };
  guides?: boolean;
};
export type ReelBookProps = { theme?: keyof typeof THEMES; frames: ReelFrame[] };

const useSauce = () => {
  const [h] = useState(() => delayRender("Open Sauce Sans"));
  useEffect(() => {
    const face = new FontFace(SAUCE, `url(${sauce}) format("truetype")`, { weight: "500" });
    face.load().then((f) => { document.fonts.add(f); continueRender(h); }).catch(() => continueRender(h));
  }, [h]);
};

/** His source frame (1920×1080) placed so the head lands where the layout wants it. */
const place = (h: Him, mode: "split" | "full") => {
  if (mode === "split") {
    const k = h.k ?? 0.95;
    return { k, left: W / 2 - h.cx * k, top: 1075 - h.top * k };
  }
  const k = Math.max(H / 1080, h.k ?? 0) * 1.0; // a horizontal cut has no headroom: the head sits high in `full`
  const top = Math.max(H - 1080 * k, Math.min(0, 110 - h.top * k));
  return { k, left: W / 2 - h.cx * k, top };
};

const HimSplit: React.FC<{ h: Him }> = ({ h }) => {
  const { k, left, top } = place(h, "split");
  const size = { width: 1920 * k, height: 1080 * k };
  return (
    <>
      <div style={{ position: "absolute", left: PANEL.x, top: PANEL.top, width: PANEL.w, height: H - PANEL.top + 40,
        borderRadius: `${PANEL.r}px ${PANEL.r}px 0 0`, overflow: "hidden", boxShadow: "0 -10px 40px rgba(20,20,20,0.10)" }}>
        <Img src={staticFile(h.f)} style={{ position: "absolute", left: left - PANEL.x, top: top - PANEL.top, ...size }} />
      </div>
      <Img src={staticFile(h.m)} style={{ position: "absolute", left, top, ...size }} />
    </>
  );
};

const HimFull: React.FC<{ h: Him }> = ({ h }) => {
  const t = useNow();
  const { k, left, top } = place(h, "full");
  const zoom = 1 + 0.04 * clamp01(t / 4); // slow punch-in while he holds the frame
  return (
    <Img src={staticFile(h.f)} style={{ position: "absolute", left, top, width: 1920 * k, height: 1080 * k,
      transform: `scale(${zoom})`, transformOrigin: `${W / 2 - left}px 420px` }} />
  );
};

/** A studio scene, drawn in a 960×1080 box and scaled into the reel. */
const Stage: React.FC<{ s: SScene; cy: number; scale: number }> = ({ s, cy, scale }) => {
  const View = SCENES[s.type];
  return (
    <div style={{ position: "absolute", left: 60, width: 960, top: cy - 540, height: 1080, transform: `scale(${scale})` }}>
      {View ? <View s={s} box={{ x: 60, w: 960 }} face={{ x: 0.5, y: 0.35 }} /> : <div style={{ color: "red", fontSize: 40 }}>unknown scene: {s.type}</div>}
    </div>
  );
};

/** 1–3 words, each blurring in on its word; the pill grows with them. *word* = the accent face. */
const CaptionPill: React.FC<{ c: Caption; y: number }> = ({ c, y }) => {
  const C = useC();
  const t = useNow();
  const words = c.text.split(" ");
  const gap = c.gap ?? 0.2;
  const shown = words.map((w, i) => ({ w, at: c.at + i * gap })).filter((w) => t >= w.at - 0.1);
  if (!shown.length) return null;
  let acc = false;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", transform: "translateY(-50%)" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 18, padding: "12px 34px 16px", borderRadius: 999,
        background: "rgba(17,19,17,0.58)", backdropFilter: "blur(14px)", fontFamily: SAUCE, fontWeight: 500, fontSize: 64,
        letterSpacing: "-0.035em", lineHeight: 1.1, color: "#FFFFFF", whiteSpace: "nowrap" }}>
        {shown.map(({ w, at }, i) => {
          if (w.startsWith("*")) acc = true;
          const isAcc = acc;
          if (w.endsWith("*")) acc = false;
          const word = w.replace(/\*/g, "");
          return (
            <Enter key={i} at={at} dy={10}>
              {isAcc ? <span style={{ fontFamily: C.fonts.accent, fontStyle: "italic", fontSize: 74, letterSpacing: "-0.01em", color: C.onDark }}>{word}</span>
                : <span>{word}</span>}
            </Enter>
          );
        })}
      </div>
    </div>
  );
};

/** Nick's two-line hook: a plain line, then an italic line in an accent box that wipes in left to right. */
const Title: React.FC<{ t: NonNullable<ReelFrame["title"]> }> = ({ t: ti }) => {
  const C = useC();
  const t = useNow();
  const wipe = ramp(t, ti.at + 0.35, 0.35);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 236, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <Enter at={ti.at}><div style={{ fontFamily: C.fonts.display, fontSize: 104, lineHeight: 1.05, letterSpacing: "-0.02em", color: C.ink }}>{ti.line1}</div></Enter>
      <div style={{ position: "relative", padding: "0 26px 8px", clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0 round 10px)` }}>
        <div style={{ position: "absolute", inset: 0, background: C.accent, borderRadius: 10 }} />
        <div style={{ position: "relative", fontFamily: C.fonts.accent, fontStyle: "italic", fontSize: 116, lineHeight: 1.12, color: "#FFF" }}>{ti.line2}</div>
      </div>
    </div>
  );
};

const Section: React.FC<{ s: NonNullable<ReelFrame["section"]> }> = ({ s }) => {
  const C = useC();
  const t = useNow();
  const wipe = ramp(t, s.at + 0.3, 0.3);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 420, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <Enter at={s.at}><div style={{ fontFamily: C.fonts.display, fontSize: 120, letterSpacing: "-0.02em", color: C.ink, lineHeight: 1.05 }}>{s.kicker}</div></Enter>
      <div style={{ position: "relative", padding: "0 30px 10px", clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0 round 12px)` }}>
        <div style={{ position: "absolute", inset: 0, background: C.accent, borderRadius: 12 }} />
        <div style={{ position: "relative", fontFamily: C.fonts.accent, fontStyle: "italic", fontSize: 150, lineHeight: 1.1, color: "#FFF" }}>{s.word}</div>
      </div>
    </div>
  );
};

/** One line, huge, with a highlighter swipe behind the *accent* words (the horizontal type card, narrowed). */
const TypeLine: React.FC<{ ty: NonNullable<ReelFrame["type"]> }> = ({ ty }) => {
  const C = useC();
  const p = useIn(ty.at, 0.5);
  const size = ty.size ?? 150;
  let acc = false;
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ opacity: p, filter: p < 1 ? `blur(${(1 - p) * 24}px)` : undefined, transform: `translateY(${(1 - p) * 40}px)`,
        fontFamily: C.fonts.display, fontSize: size, lineHeight: 1.04, letterSpacing: "-0.02em", color: C.ink, textAlign: "center",
        display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline", columnGap: size * 0.22 }}>
        {ty.line.split(" ").map((w, i) => {
          if (w.startsWith("*")) acc = true;
          const isAcc = acc;
          if (w.endsWith("*")) acc = false;
          const word = w.replace(/\*/g, "");
          return isAcc ? (
            <span key={i} style={{ position: "relative", padding: "0 0.08em" }}>
              <span style={{ position: "absolute", left: 0, right: 0, top: "0.18em", bottom: "0.02em", background: C.accentTint, borderRadius: 8 }} />
              <span style={{ position: "relative" }}>{word}</span>
            </span>
          ) : <span key={i}>{word}</span>;
        })}
      </div>
    </div>
  );
};

/** Nick's counter tile: white rounded tile, big accent numerals counting up, small label. */
const Counter: React.FC<{ c: NonNullable<ReelFrame["counter"]> }> = ({ c }) => {
  const C = useC();
  const t = useNow();
  const p = ramp(t, c.at, c.dur ?? 1.1);
  const pop = useIn(c.at - 0.05, 0.25);
  return (
    <div style={{ position: "absolute", left: c.x, top: c.y, transform: `translate(-50%,-50%) scale(${0.85 + 0.15 * pop})`, opacity: pop,
      background: C.card, borderRadius: 28, boxShadow: "0 2px 6px rgba(20,20,20,0.08), 0 24px 60px rgba(20,20,20,0.18)",
      padding: "18px 46px 26px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontFamily: C.fonts.display, fontSize: 168, lineHeight: 1, color: C.accent, fontVariantNumeric: "tabular-nums" }}>
        {Math.round(c.value * p).toLocaleString("en-US")}
      </div>
      <div style={{ fontFamily: C.fonts.plain, fontWeight: 500, fontSize: 36, color: C.muted, marginTop: 4 }}>{c.label}</div>
    </div>
  );
};

/** Labels on his own shot, each with a thin line to the thing it names (reel coordinates). */
const Callouts: React.FC<{ items: NonNullable<ReelFrame["callouts"]> }> = ({ items }) => {
  const C = useC();
  const t = useNow();
  return (
    <>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {items.map((it, i) => {
          const p = ramp(t, it.at + 0.15, 0.45);
          const [lx, ly] = it.label, [tx, ty] = it.target;
          const d = `M ${lx} ${ly} Q ${(lx + tx) / 2} ${Math.min(ly, ty) - 60} ${tx} ${ty}`;
          return (
            <g key={i}>
              <path d={d} fill="none" stroke="#FFF" strokeWidth={4} strokeDasharray={900} strokeDashoffset={900 * (1 - p)}
                style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.4))" }} />
              <circle cx={tx} cy={ty} r={9 * p} fill="#FFF" stroke={C.accent} strokeWidth={4} />
            </g>
          );
        })}
      </svg>
      {items.map((it, i) => (
        <div key={i} style={{ position: "absolute", left: it.label[0], top: it.label[1], transform: "translate(-50%,-50%)" }}>
          <Enter at={it.at}>
            <div style={{ background: C.card, borderRadius: 999, padding: "10px 30px 14px", boxShadow: SHADOW, fontFamily: C.fonts.display,
              fontSize: 60, color: C.ink, whiteSpace: "nowrap" }}>{it.text}</div>
          </Enter>
        </div>
      ))}
    </>
  );
};

/** YouTube ad chrome over his shot: Ad badge, Visit site, Skip, the yellow ad scrub. */
const AdChrome: React.FC<{ at: number }> = ({ at }) => {
  const C = useC();
  const t = useNow();
  const y = H - SAFE.bottom - 150;
  return (
    <>
      <div style={{ position: "absolute", left: 60, top: y, display: "flex", flexDirection: "column", gap: 14 }}>
        <Enter at={at}><div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: C.fonts.plain, fontWeight: 600, fontSize: 34, color: "#FFF" }}>
          <span style={{ background: "#F2C230", color: "#111", padding: "2px 12px", borderRadius: 6 }}>Ad</span> 0:05
        </div></Enter>
        <Enter at={at + 0.15}><div style={{ background: "#FFF", color: "#111", fontFamily: C.fonts.plain, fontWeight: 600, fontSize: 34,
          padding: "12px 26px", borderRadius: 999 }}>Visit site ↗</div></Enter>
      </div>
      <Enter at={at + 0.3} style={{ position: "absolute", right: SAFE.right + 20, top: y + 60 }}>
        <div style={{ background: "rgba(0,0,0,0.6)", color: "#FFF", fontFamily: C.fonts.plain, fontWeight: 500, fontSize: 36, padding: "14px 30px",
          borderRadius: 10, border: "1px solid rgba(255,255,255,0.35)" }}>Skip ▸</div>
      </Enter>
      <div style={{ position: "absolute", left: 0, right: 0, top: y + 170, height: 8, background: "rgba(255,255,255,0.3)" }}>
        <div style={{ width: `${ramp(t, at, 4) * 100}%`, height: "100%", background: "#F2C230" }} />
      </div>
    </>
  );
};

/** Nick's end card: small italic "comment" over the keyword, glowing in the accent. */
const Cta: React.FC<{ c: NonNullable<ReelFrame["cta"]> }> = ({ c }) => {
  const C = useC();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1110, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Enter at={c.at}><div style={{ fontFamily: C.fonts.accent, fontStyle: "italic", fontSize: 92, color: "#FFF",
        textShadow: "0 2px 18px rgba(0,0,0,0.45)", marginBottom: -24 }}>comment</div></Enter>
      <Enter at={c.at + 0.25} dy={30}><div style={{ fontFamily: SAUCE, fontWeight: 500, fontSize: 168, letterSpacing: "-0.04em", color: C.onDark,
        textShadow: `0 0 24px ${C.onDark}, 0 0 70px ${C.onDark}88, 0 4px 30px rgba(0,0,0,0.5)` }}>“{c.word}”</div></Enter>
    </div>
  );
};

const Guides: React.FC = () => (
  <>
    {[{ top: 0, height: SAFE.top }, { bottom: 0, height: SAFE.bottom }].map((r, i) => (
      <div key={i} style={{ position: "absolute", left: 0, right: 0, ...r, background: "rgba(214,48,49,0.16)", borderTop: i ? "3px dashed #D63031" : undefined,
        borderBottom: i ? undefined : "3px dashed #D63031" }} />
    ))}
    <div style={{ position: "absolute", top: SAFE.top, bottom: SAFE.bottom, right: 0, width: SAFE.right, background: "rgba(214,48,49,0.16)", borderLeft: "3px dashed #D63031" }} />
    <div style={{ position: "absolute", left: 40, top: 80, fontFamily: SAUCE, fontSize: 40, color: "#D63031" }}>Instagram UI (top {SAFE.top}px)</div>
    <div style={{ position: "absolute", left: 40, bottom: 180, fontFamily: SAUCE, fontSize: 40, color: "#D63031" }}>Caption, handle, audio (bottom {SAFE.bottom}px)</div>
  </>
);

const CAPTION_Y = { split: 990, full: 1300, board: 1440, type: 1440, card: 1440 } as const;
const STAGE = { split: { y: 600, scale: 0.9 }, board: { y: 830, scale: 1.05 }, card: { y: 1080, scale: 1 }, full: { y: 800, scale: 1 }, type: { y: 800, scale: 1 } };

const Frame: React.FC<{ f: ReelFrame }> = ({ f }) => {
  const C = useC();
  const { fps } = useVideoConfig();
  const stage = { ...STAGE[f.layout], ...(f.title ? { y: 700, scale: 0.72 } : {}), ...f.stage };
  const from = f.scene ? (f.from ?? f.scene.start - 0.3) : 0;
  return (
    <AbsoluteFill style={{ background: C.border }}>
      <div style={{ position: "absolute", inset: 14, borderRadius: 20, background: C.page }} />
      {f.scene && (
        <Sequence from={-Math.round(from * fps)} layout="none">
          <Stage s={f.scene} cy={stage.y} scale={stage.scale} />
        </Sequence>
      )}
      {f.him && f.layout === "split" && <HimSplit h={f.him} />}
      {f.him && f.layout === "full" && <HimFull h={f.him} />}
      {f.callouts && <Callouts items={f.callouts} />}
      {f.ad && <AdChrome at={f.ad.at} />}
      {f.title && <Title t={f.title} />}
      {f.section && <Section s={f.section} />}
      {f.type && <TypeLine ty={f.type} />}
      {f.counter && <Counter c={f.counter} />}
      {f.cta && <Cta c={f.cta} />}
      {f.caption && <CaptionPill c={f.caption} y={f.caption.y ?? CAPTION_Y[f.layout]} />}
      {f.guides && <Guides />}
    </AbsoluteFill>
  );
};

/** Start of each frame, in seconds. */
export const starts = (frames: ReelFrame[]) => frames.reduce<number[]>((a, f, i) => [...a, i ? a[i - 1] + frames[i - 1].dur : 0], []);

export const ReelBook: React.FC<ReelBookProps> = ({ theme = "ajay", frames }) => {
  useSauce();
  const { fps } = useVideoConfig();
  const at = starts(frames);
  return (
    <ThemeCtx.Provider value={THEMES[theme]}>
      <AbsoluteFill style={{ background: THEMES[theme].page }}>
        {frames.map((f, i) => (
          <Sequence key={i} from={Math.round(at[i] * fps)} durationInFrames={Math.round(f.dur * fps)}>
            <Frame f={f} />
          </Sequence>
        ))}
      </AbsoluteFill>
    </ThemeCtx.Provider>
  );
};
