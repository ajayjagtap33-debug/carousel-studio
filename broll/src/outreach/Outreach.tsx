// SEORankLift outreach video, 1:53, 1920x1080. Storyboard: videos/2026-11-03-seoranklift-outreach/storyboard.md (v3).
// He stays full frame the whole video; rhythm comes from punch-ins cropped out of the 1440p cut, one per splice so the
// jump cuts read as cuts. Drawings live behind him (under the RVM cut-out, scripts/matte.py) and in front of him.
// Layers, back to front: footage → BEHIND svg → his cut-out → FRONT svg → screen-space overlays.
// Footage-space svgs use 1920x1080 coords of the unzoomed shot, so they ride the punch-ins with him.
// All times are seconds in the cut (videos/2026-11-04-raw-0676/transcript.json); splices measured with ffmpeg scdet.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Easing, Img, OffthreadVideo, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont as figtree } from "@remotion/google-fonts/Figtree";
import { loadFont as instrument } from "@remotion/google-fonts/InstrumentSerif";
import virgil from "../fonts/Virgil.woff2";
import { Cast } from "../studio/cast";
import { THEMES, ThemeCtx, useSauce, SAUCE, type Palette } from "../studio/kit";

export const OUTREACH_FRAMES = 3394; // 113.13s, the cut's length
const W = 1920, H = 1080, FPS = 30;
const FIG = figtree("normal", { weights: ["500", "600", "700", "800"], subsets: ["latin"] }).fontFamily;
const SERIF = instrument("italic", { weights: ["400"], subsets: ["latin"] }).fontFamily;
const HAND = "Virgil";

// SEORankLift: the site's purple on ink doodles (storyboard v3)
const P = { purple: "#5b21b6", violet: "#8b5cf6", lilac: "#c9b3f5", tint: "#ede4ff", ink: "#1f1d24", grey: "#8a8494", paper: "#ffffff",
  page: "#fcfcfc", ok: "#1f8a4c" };
const PAL: Palette = { ...THEMES.ajay, ink: P.ink, accent: P.purple, accentSoft: P.tint, accentTint: P.lilac, card: P.paper, muted: P.grey };

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const eo = Easing.bezier(0.22, 1, 0.36, 1);
const ramp = (t: number, a: number, d = 0.4) => interpolate(t, [a, a + d], [0, 1], { ...clamp, easing: eo });
const lin = (t: number, a: number, d: number) => interpolate(t, [a, a + d], [0, 1], clamp);
/** springy 0 → 1 with a small overshoot */
const pop = (t: number, a: number, d = 0.45) => {
  const x = lin(t, a, d);
  return x === 0 ? 0 : 1 + 2.70158 * (x - 1) ** 3 + 1.70158 * (x - 1) ** 2; // ease-out-back
};
const life = (t: number, a: number, b: number, fi = 0.25, fo = 0.3) => Math.min(lin(t, a - 0.05, fi), 1 - lin(t, b - fo, fo));

/* ------------------------------------------------------------------ camera */

// [start, zoom]: a new framing on every splice (hard cut), plus 10.65 (eased, mid-take). "split" = his card for the screenshot.
const SHOTS: [number, number | "split"][] = [
  [0, 1.0], [1.701, 1.16], [10.65, 1.36], [14.513, 1.16], [17.616, 1.0], [39.337, 1.1], [41.806, 1.22], [44.241, 1.1],
  [51.114, 1.0], [61.25, "split"], [68.5, 1.18], [72.735, 1.0], [81.043, 1.18], [84.246, 1.06], [88.116, 1.0],
  [95.857, 1.32], [98.893, 1.16], [101.095, 1.0], [105.299, 1.2], [107.167, 1.08],
];
const EASED = new Set([10.65, 61.25, 68.5]);
const FACE = { x: 930, y: 420 }; // centre of his face in the unzoomed shot (gridded frames, cut 1..108s)
const CARD = { x: 1110, y: 70, w: 740, h: 940 };

type Rect = { x: number; y: number; w: number; h: number };
const FULL: Rect = { x: 0, y: 0, w: W, h: H };
const lerpR = (a: Rect, b: Rect, k: number): Rect => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, w: a.w + (b.w - a.w) * k, h: a.h + (b.h - a.h) * k });

const camera = (t: number) => {
  let i = 0;
  while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++;
  const view = (s: [number, number | "split"]) => (s[1] === "split" ? { r: CARD, z: 1 } : { r: FULL, z: (s[1] as number) * (1 + 0.025 * lin(t, s[0], 6)) });
  const cur = view(SHOTS[i]);
  if (i > 0 && EASED.has(SHOTS[i][0])) {
    const k = ramp(t, SHOTS[i][0], 0.55);
    const prev = view(SHOTS[i - 1]);
    return { r: lerpR(prev.r, cur.r, k), z: prev.z + (cur.z - prev.z) * k, split: SHOTS[i][1] === "split" || (k < 1 && SHOTS[i - 1][1] === "split") };
  }
  return { ...cur, split: SHOTS[i][1] === "split" };
};
/** cover the rect with the shot at zoom z, face as near the centre as the edges allow */
const place = (r: Rect, z: number) => {
  const s = Math.max(r.w / W, r.h / H) * z;
  const x = Math.min(r.x, Math.max(r.x + r.w - W * s, r.x + r.w / 2 - FACE.x * s));
  const y = Math.min(r.y, Math.max(r.y + r.h - H * s, r.y + r.h / 2 - FACE.y * s));
  return { s, x, y };
};

/* ------------------------------------------------------------------ drawing kit */

/** a path drawing itself on from `at` over `d` */
const D: React.FC<{ d: string; at: number; dur?: number; c?: string; w?: number; fill?: string; t: number; dash?: string; o?: number }> =
({ d, at, dur = 0.5, c = P.ink, w = 4, fill, t, dash, o = 1 }) => {
  const p = lin(t, at, dur);
  if (p <= 0) return null;
  return <path d={d} fill={fill ?? "none"} fillOpacity={fill ? ramp(t, at + dur * 0.6, 0.3) : 0} stroke={c} strokeWidth={w}
    strokeLinecap="round" strokeLinejoin="round" opacity={o}
    {...(dash ? { strokeDasharray: dash } : { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - eo(p) })} />;
};
/** a wobbly hand-drawn box */
const boxPath = (x: number, y: number, w: number, h: number, j = 5) =>
  `M${x + j} ${y + 2} Q${x + w / 2} ${y - j} ${x + w - 3} ${y + 3} Q${x + w + j} ${y + h / 2} ${x + w - 2} ${y + h - 3} Q${x + w / 2} ${y + h + j} ${x + 3} ${y + h - 2} Q${x - j} ${y + h / 2} ${x + j} ${y + 2}`;
const T: React.FC<{ x: number; y: number; s: number; at: number; t: number; c?: string; anchor?: "start" | "middle" | "end"; f?: string; wgt?: number; children: React.ReactNode; o?: number }> =
({ x, y, s, at, t, c = P.ink, anchor = "start", f = HAND, wgt, children, o = 1 }) => {
  const p = ramp(t, at, 0.35);
  if (p <= 0) return null;
  return <text x={x} y={y + (1 - p) * 10} fontSize={s} fill={c} textAnchor={anchor} opacity={p * o}
    style={{ fontFamily: f, fontWeight: wgt }}>{children}</text>;
};
/** a white rounded tile with a logo (or a drawn glyph) and the tool's name */
const Tool: React.FC<{ x: number; y: number; at: number; t: number; name: string; logo?: string; glyph?: React.ReactNode }> = ({ x, y, at, t, name, logo, glyph }) => {
  const k = pop(t, at);
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x + 165} ${y + 60}) scale(${k}) translate(${-165} ${-60})`}>
      <path d={boxPath(0, 0, 330, 120)} fill={P.paper} stroke={P.ink} strokeWidth={4} />
      {logo ? <image href={staticFile(logo)} x={24} y={32} width={56} height={56} /> : glyph}
      <text x={98} y={74} fontSize={40} fill={P.ink} style={{ fontFamily: HAND }}>{name}</text>
    </g>
  );
};
const useVirgil = () => {
  const [h] = useState(() => delayRender("Virgil"));
  useEffect(() => {
    new FontFace(HAND, `url(${virgil}) format("woff2")`).load().then((f) => { document.fonts.add(f); continueRender(h); }).catch(() => continueRender(h));
  }, [h]);
};

/* ------------------------------------------------------------------ props drawn for the bot (not yet in the art library) */

const Broom: React.FC<{ x: number; y: number; a: number }> = ({ x, y, a }) => (
  <g transform={`translate(${x} ${y}) rotate(${a})`}>
    <path d="M0 0 L0 190" stroke="#8a5a2b" strokeWidth={7} strokeLinecap="round" />
    <path d="M-38 250 Q0 175 38 250 Z" fill="#f4e6b4" stroke={P.ink} strokeWidth={4} strokeLinejoin="round" />
    <path d="M-20 248 L-12 205 M0 250 L0 200 M20 248 L12 205" stroke={P.ink} strokeWidth={3} />
  </g>
);
const Scissors: React.FC<{ x: number; y: number; open: number }> = ({ x, y, open }) => (
  <g transform={`translate(${x} ${y})`}>
    <g transform={`rotate(${-open})`}><path d="M0 0 L90 -6" stroke={P.ink} strokeWidth={7} strokeLinecap="round" /><circle cx={-22} cy={-10} r={16} fill="none" stroke={P.purple} strokeWidth={6} /></g>
    <g transform={`rotate(${open})`}><path d="M0 0 L90 6" stroke={P.ink} strokeWidth={7} strokeLinecap="round" /><circle cx={-22} cy={10} r={16} fill="none" stroke={P.purple} strokeWidth={6} /></g>
  </g>
);
const Chair: React.FC<{ x: number; y: number; at: number; t: number }> = ({ x, y, at, t }) => (
  <>
    <D t={t} at={at} d={`M${x} ${y} L${x} ${y + 120} M${x} ${y + 70} L${x + 80} ${y + 70} L${x + 80} ${y + 120}`} w={5} />
    <D t={t} at={at + 0.15} d={`M${x + 4} ${y + 66} L${x + 82} ${y + 66}`} w={9} c={P.purple} />
  </>
);
const Sitter: React.FC<{ x: number; y: number; at: number; t: number }> = ({ x, y, at, t }) => {
  const k = pop(t, at, 0.4);
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x + 45} ${y + 30}) scale(${k}) translate(${-45} ${-30})`}>
      <circle cx={45} cy={-18} r={22} fill={P.paper} stroke={P.ink} strokeWidth={4} />
      <path d="M45 4 L45 60 L85 62 M45 22 L75 40" stroke={P.ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>
  );
};

/* ------------------------------------------------------------------ the beats, footage space */

// beat 6: the five tools around him (behind), then the copy-paste tangle (behind + in front)
const TOOLS = [
  { x: 60, y: 70, at: 25.1, name: "Semrush", logo: "semrush.png" },
  { x: 60, y: 245, at: 26.4, name: "ChatGPT", logo: "chatgpt.png" },
  { x: 60, y: 420, at: 26.9, name: "Claude" },
  { x: 1520, y: 70, at: 28.6, name: "Sheet", g: "sheet" },
  { x: 1520, y: 245, at: 29.7, name: "Doc", g: "doc" },
  { x: 1520, y: 420, at: 36.2, name: "Reports", g: "chart" },
];
const glyph = (g?: string) => g === "sheet" ? <g><rect x={26} y={34} width={52} height={52} rx={4} fill="#e3f5ea" stroke={P.ok} strokeWidth={3} /><path d="M26 52 H78 M26 69 H78 M44 34 V86" stroke={P.ok} strokeWidth={3} /></g>
  : g === "doc" ? <g><rect x={30} y={30} width={44} height={58} rx={4} fill="#e4ecfb" stroke="#2f6fde" strokeWidth={3} /><path d="M38 46 H66 M38 58 H66 M38 70 H58" stroke="#2f6fde" strokeWidth={3} /></g>
  : g === "chart" ? <g><path d="M28 86 H80 M28 86 V34" stroke={P.ink} strokeWidth={3} fill="none" /><rect x={38} y={62} width={10} height={22} fill={P.lilac} /><rect x={54} y={50} width={10} height={34} fill={P.violet} /><rect x={70} y={40} width={10} height={44} fill={P.purple} /></g>
  : null;
const TANGLE_BEHIND = [
  { d: "M390 130 C760 40 1000 600 1520 300", at: 30.6 }, { d: "M390 300 C800 150 1200 120 1520 130", at: 31.4 },
  { d: "M390 480 C700 700 1300 560 1520 480", at: 32.1 }, { d: "M1520 130 C1200 300 700 260 390 470", at: 33.2 },
  { d: "M390 140 C600 400 900 60 1520 470", at: 36.6 },
];
const TANGLE_FRONT = [ // across his chest, below the face
  { d: "M390 320 C600 700 900 1020 1300 820 S1600 520 1680 545", at: 33.9 }, { d: "M1520 300 C1300 950 700 760 420 545", at: 35.0 },
  { d: "M1690 545 C1500 880 1100 1000 760 900 S400 900 300 1080", at: 37.5 },
];
const LOOSE = "M1680 545 C1700 620 1640 680 1620 700"; // the end the bot pulls

const Behind: React.FC<{ t: number }> = ({ t }) => {
  const fall = (i: number) => { const k = lin(t, 39.9 + i * 0.06, 0.7); return { transform: `translate(0px, ${k * k * 900}px) rotate(${k * (i % 2 ? 14 : -12)}deg)`, opacity: 1 - lin(t, 40.3 + i * 0.06, 0.4) }; };
  const sweep = (x: number) => { const k = lin(t, 9.65, 0.85); return { transform: `translate(${-k * k * (x - 700)}px, ${k * 40}px)`, opacity: 1 - lin(t, 10.3, 0.3) }; };
  const ENV = [[1290, 470, -8, 3.8], [1440, 480, 6, 4.1], [1570, 455, -4, 4.5], [1350, 360, 10, 5.5], [1500, 345, -6, 6.2], [1410, 245, 4, 6.9], [1560, 225, -10, 7.3], [1300, 235, 7, 7.5]];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
      {/* 2: the cold-email pile behind his shoulder, and the line every one of them opens with */}
      {t < 10.8 && <>
        {ENV.map(([x, y, a, at], i) => { const k = pop(t, at, 0.4); return k > 0 &&
          <g key={i} style={sweep(x)}><g transform={`translate(${x + 85} ${y + 60}) rotate(${a}) scale(${k}) translate(-85 -60)`}>
            <rect x={0} y={0} width={170} height={118} rx={6} fill={P.paper} stroke={P.ink} strokeWidth={4} />
            <path d="M4 6 L85 66 L166 6" fill="none" stroke={P.ink} strokeWidth={4} strokeLinejoin="round" />
          </g></g>; })}
        <g style={{ transform: `scale(${1 - lin(t, 10.0, 0.35)})`, transformOrigin: "330px 330px" }}>
          <D t={t} at={4.5} d={boxPath(140, 240, 400, 170)} c={P.ink} fill={P.paper} />
          <T t={t} at={4.7} x={340} y={315} s={36} anchor="middle" c={P.grey}>I hope this</T>
          <T t={t} at={4.85} x={340} y={365} s={36} anchor="middle" c={P.grey}>finds you well...</T>
        </g>
      </>}
      {/* 3: the bot sweeps it all away behind him */}
      {t > 9.2 && t < 11.0 && (() => { const k = ramp(t, 9.25, 0.4); const sw = Math.sin((t - 9.6) * 14) * 16 * lin(t, 9.6, 0.1);
        return <g opacity={1 - lin(t, 10.6, 0.3)} transform={`translate(${(1 - k) * 420} 0)`}>
          <Broom x={1520} y={330} a={30 + sw} /><Cast id="bot.busy" x={1500} y={200} size={230} />
        </g>; })()}

      {/* 6: one article, five tools */}
      {t > 21.2 && t < 25.2 && <g opacity={1 - lin(t, 24.6, 0.4)}>
        <T t={t} at={21.3} x={120} y={260} s={96} c={P.purple}>5 tools</T>
        <D t={t} at={21.6} d="M110 285 Q260 268 400 282" c={P.purple} w={6} />
        <D t={t} at={22.9} d={boxPath(1540, 120, 170, 220)} fill={P.paper} />
        <D t={t} at={23.1} d="M1575 180 H1675 M1575 220 H1675 M1575 260 H1640" c={P.grey} w={5} />
        <T t={t} at={23.3} x={1625} y={400} s={40} anchor="middle">1 article</T>
      </g>}
      {t > 25 && t < 41.5 && <>
        {TANGLE_BEHIND.map((l, i) => <g key={i} style={fall(i)}><D t={t} at={l.at} dur={0.9} d={l.d} c={P.violet} w={5} /></g>)}
        {TOOLS.map((o, i) => <g key={o.name} style={fall(i + 3)}><Tool t={t} at={o.at} x={o.x} y={o.y} name={o.name} logo={o.logo} glyph={glyph(o.g)} /></g>)}
        <g style={fall(1)}>
          <T t={t} at={31.0} x={760} y={150} s={32} c={P.grey}>copy</T>
          <T t={t} at={31.8} x={1150} y={110} s={32} c={P.grey}>paste</T>
          <T t={t} at={33.4} x={760} y={560} s={32} c={P.grey}>copy</T>
        </g>
      </>}
      {/* 7: the bot pulls the loose end */}
      {t > 38.9 && t < 41.8 && (() => { const tug = lin(t, 39.6, 0.25) * 40 - lin(t, 40.0, 0.3) * 10; return (
        <g opacity={ramp(t, 38.95, 0.3) * (1 - lin(t, 41.4, 0.3))} transform={`translate(${tug} 0)`}><Cast id="bot.busy" x={1560} y={560} size={200} flip /></g>); })()}

      {t > 40.7 && t < 41.85 && (() => { const k = pop(t, 40.85); return k > 0 && <g transform={`translate(330 330) scale(${k})`}>
        <rect x={-190} y={-52} width={380} height={104} rx={22} fill={P.paper} style={{ filter: "drop-shadow(0 8px 20px rgba(40,20,80,.18))" }} />
        <image href={staticFile("seoranklift.svg")} x={-160} y={-27} width={320} height={55} /></g>; })()}
      {t > 42.2 && t < 44.3 && <g opacity={1 - lin(t, 44.0, 0.24)}>
        {ramp(t, 42.6) > 0 && <rect x={452} y={318} width={210 * ramp(t, 42.6, 0.3)} height={34} fill={P.lilac} opacity={0.75} />}
        <T t={t} at={42.4} x={220} y={340} s={96} f={FIG} wgt={800}>vibe</T>
        <T t={t} at={42.6} x={460} y={340} s={96} f={FIG} wgt={800} c={P.purple}>SEO</T>
        <T t={t} at={42.9} x={225} y={420} s={46} c={P.grey}>like vibe coding</T>
      </g>}
      {/* 8: the road streaming past on the wall behind him */}
      {t > 45.1 && t < 51.2 && <g opacity={life(t, 45.3, 51.11, 0.4, 0.2)}>
        {[[90, 300], [160, 420], [60, 540], [1420, 300], [1500, 420], [1400, 540]].map(([x0, y], i) => {
          const off = ((t - 45) * 520 + i * 90) % 220;
          return <g key={i}>{[0, 1, 2].map((j) => <path key={j} d={`M${x0 + 340 - off - j * 220 + 220} ${y} h-110`} stroke={P.grey} strokeWidth={8} strokeLinecap="round" opacity={0.55} />)}</g>;
        })}
      </g>}

      {/* 9: their process, inside one window */}
      {t > 51.1 && t < 61.4 && <g opacity={1 - lin(t, 61.1, 0.25)}>
        {[["magnifier", 54.7, "keywords", 90, 150], ["notebook", 55.3, "outline", 330, 150], ["pencil", 55.9, "draft", 90, 360], ["check", 56.4, "review", 330, 360]].map(([id, at, label, x, y]) => (
          <g key={id as string}>
            <Cast id={id as string} x={(x as number) + 40} y={y as number} size={120} at={at as number} dur={0.5} />
            <T t={t} at={(at as number) + 0.1} x={(x as number) + 100} y={(y as number) + 165} s={34} anchor="middle">{label}</T>
          </g>))}
        <D t={t} at={57.8} dur={0.7} d={boxPath(60, 70, 520, 500, 6)} c={P.purple} w={6} />
        <D t={t} at={58.2} d="M64 122 H576" c={P.purple} w={4} />
        {ramp(t, 58.3) > 0 && <g opacity={ramp(t, 58.3)}>
          {[0, 1, 2].map((i) => <circle key={i} cx={100 + i * 30} cy={97} r={9} fill={P.lilac} />)}
          <image href={staticFile("seoranklift.svg")} x={355} y={82} width={200} height={34} />
        </g>}
        <T t={t} at={60.5} x={1420} y={260} s={64}>nothing</T>
        <T t={t} at={60.65} x={1420} y={340} s={64} c={P.purple}>new</T>
        <D t={t} at={60.8} d="M1415 360 Q1490 348 1570 358" c={P.purple} w={6} />
      </g>}

      {/* 11: comments in the margins, Google Docs style */}
      {t > 68.9 && t < 72.8 && <g opacity={1 - lin(t, 72.4, 0.3)}>
        {[{ x: 150, y: 120, at: 69.1, lines: ["can we add an", "example here?"], c: P.purple }, { x: 1290, y: 140, at: 69.8, lines: ["love this ♥"], c: "#e0731f" }].map((b, i) => {
          const k = pop(t, b.at); if (k <= 0) return null;
          const h = 70 + b.lines.length * 44;
          return <g key={i} transform={`translate(${b.x} ${b.y}) scale(${k})`}>
            <rect x={0} y={0} width={420} height={h} rx={22} fill={P.paper} stroke="#e6e0ef" strokeWidth={3} />
            <circle cx={46} cy={46} r={24} fill={b.c} />
            {b.lines.map((l, j) => <text key={j} x={88} y={58 + j * 44} fontSize={34} fill={P.ink} style={{ fontFamily: FIG, fontWeight: 500 }}>{l}</text>)}
          </g>; })}
        <T t={t} at={70.1} x={170} y={430} s={50} f={FIG} wgt={600}>a good intro</T>
        <D t={t} at={70.3} d="M210 414 L310 414" c="#c0392b" w={6} />
        <T t={t} at={70.7} x={215} y={378} s={50} c={P.purple} f={FIG} wgt={700}>great</T>
      </g>}
      {/* 12: live */}
      {t > 73 && t < 75.6 && (() => { const k = pop(t, 73.2); return k > 0 && <g opacity={1 - lin(t, 75.2, 0.3)} transform={`translate(330 300) scale(${k})`}>
        <rect x={-110} y={-42} width={220} height={84} rx={42} fill={P.purple} />
        <circle cx={-62} cy={0} r={13} fill="#7dff9c" opacity={0.6 + 0.4 * Math.sin(t * 8)} />
        <text x={18} y={15} textAnchor="middle" fontSize={44} fill="#fff" style={{ fontFamily: FIG, fontWeight: 700 }}>live</text>
      </g>; })()}

      {/* 13: updated pages vs the ones left alone */}
      {t > 81 && t < 84.3 && <g opacity={1 - lin(t, 84.0, 0.25)}>
        <D t={t} at={81.2} d="M1240 120 L1240 500 L1600 500" c={P.ink} w={4} />
        <D t={t} at={81.4} dur={0.9} d="M1250 470 C1360 460 1420 380 1480 300 S1560 160 1590 140" c={P.purple} w={7} />
        <D t={t} at={81.7} dur={0.8} d="M1250 474 C1360 470 1460 478 1590 466" c={P.grey} w={6} />
        <T t={t} at={82.4} x={1300} y={190} s={36} c={P.purple}>updated</T>
        <T t={t} at={82.6} x={1390} y={450} s={32} c={P.grey}>left alone</T>
        {ramp(t, 83.3) > 0 && <g opacity={ramp(t, 83.3)} transform={`translate(${(1 - ramp(t, 83.3, 0.5)) * 200} 0)`}>
          <Cast id="magnifier" x={1480} y={250} size={130} /><Cast id="bot.stand" x={1590} y={320} size={140} />
        </g>}
      </g>}

      {/* 15: 50 founding seats, one kept for you */}
      {t > 88.1 && t < 95.9 && <g opacity={1 - lin(t, 95.6, 0.25)}>
        <T t={t} at={89.6} x={80} y={300} s={56} c={P.purple}>50 seats</T>
        {[80, 200, 320, 440, 1340, 1460, 1580, 1700].map((x, i) => <Chair key={x} x={x} y={400} at={89.8 + i * 0.12} t={t} />)}
        {[80, 200, 320, 440, 1340, 1460, 1580].map((x, i) => <Sitter key={x} x={x} y={400} at={91.6 + i * 0.18} t={t} />)}
        {(() => { const k = pop(t, 94.9); return k > 0 && <g transform={`translate(1740 395) rotate(-6) scale(${k})`}>
          <rect x={-95} y={-40} width={190} height={62} rx={8} fill={P.paper} stroke={P.purple} strokeWidth={4} />
          <text x={0} y={2} textAnchor="middle" fontSize={34} fill={P.purple} style={{ fontFamily: HAND }}>reserved</text>
        </g>; })()}
      </g>}

      {/* 18: next time, your face */}
      {t > 108 && <g opacity={ramp(t, 108.2, 0.4)}>
        <rect x={130} y={150} width={430} height={300} rx={26} fill="rgba(255,255,255,0.55)" stroke={P.purple} strokeWidth={5} strokeDasharray="22 16" />
        <T t={t} at={109.4} x={345} y={350} s={150} anchor="middle" c={P.purple}>?</T>
        <g opacity={ramp(t, 108.5)}><rect x={160} y={395} width={44} height={30} rx={6} fill={P.purple} /><path d="M206 402 L226 392 V428 L206 418 Z" fill={P.purple} /></g>
      </g>}
      {/* 19: the bot waves goodbye from behind his shoulder */}
      {t > 109.4 && (() => { const k = ramp(t, 109.6, 0.6); return <g transform={`translate(${-160 * (1 - k)} ${-6 * Math.sin(t * 6)})`}><Cast id="bot.wave" x={1430} y={330} size={240} /></g>; })()}
    </svg>
  );
};

const Front: React.FC<{ t: number }> = ({ t }) => (
  <svg viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
    {/* 5: the name badge swings in and clips onto his chest */}
    {t > 15.1 && t < 17.62 && (() => {
      const drop = ramp(t, 15.2, 0.45), sw = Math.sin((t - 15.65) * 9) * 14 * Math.exp(-3 * Math.max(0, t - 15.65)) * (t > 15.65 ? 1 : 0);
      return <g transform={`translate(1210 ${700 - (1 - drop) * 760}) rotate(${sw - 4})`}>
        <rect x={-6} y={-30} width={12} height={34} rx={4} fill={P.grey} />
        <rect x={-160} y={0} width={320} height={190} rx={18} fill={P.paper} stroke={P.ink} strokeWidth={4} />
        <rect x={-160} y={0} width={320} height={56} rx={18} fill={P.purple} /><rect x={-160} y={34} width={320} height={22} fill={P.purple} />
        <text x={0} y={40} textAnchor="middle" fontSize={30} fill="#fff" style={{ fontFamily: FIG, fontWeight: 700 }}>hello, I'm</text>
        <text x={0} y={128} textAnchor="middle" fontSize={68} fill={P.ink} style={{ fontFamily: HAND }}>Ajay</text>
        <image href={staticFile("seoranklift.svg")} x={-90} y={146} width={180} height={31} opacity={ramp(t, 16.8)} />
      </g>; })()}
    {/* 6: the tangle runs in front of him too */}
    {t > 33.5 && t < 41.5 && TANGLE_FRONT.map((l, i) => { const k = lin(t, 39.95 + i * 0.07, 0.7); return (
      <g key={i} style={{ transform: `translate(0px, ${k * k * 900}px)`, opacity: 1 - lin(t, 40.3, 0.4) }}><D t={t} at={l.at} dur={1.0} d={l.d} c={P.violet} w={6} /></g>); })}
    {t > 37.8 && t < 41.5 && <g style={{ transform: `translate(0px, ${lin(t, 40.0, 0.7) ** 2 * 900}px)` }}><D t={t} at={37.9} dur={0.5} d={LOOSE} c={P.violet} w={6} /></g>}

    {/* 8: dashboard and wheel in front of his chest; the bot rides along with a laptop */}
    {t > 45.1 && t < 51.2 && <g opacity={1 - lin(t, 50.9, 0.2)}>
      <D t={t} at={45.3} dur={0.6} d="M180 1080 Q300 850 930 850 Q1560 850 1700 1080" c={P.ink} w={7} fill="#f2eef8" />
      <g transform={`rotate(${Math.sin(t * 1.7) * 6} 930 930)`}>
        <D t={t} at={45.45} dur={0.6} d="M930 785 a145 145 0 1 1 -0.1 0" c={P.ink} w={16} />
        <D t={t} at={45.8} d="M785 930 L1075 930 M930 930 L930 1075" c={P.ink} w={12} />
        {ramp(t, 45.9) > 0 && <circle cx={930} cy={930} r={30} fill={P.purple} opacity={ramp(t, 45.9)} />}
      </g>
      <T t={t} at={45.6} x={430} y={790} s={48} c={P.purple}>you drive</T>
      <D t={t} at={45.8} d="M610 800 Q700 830 770 880" c={P.purple} w={5} />
      {(() => { const k = ramp(t, 46.9, 0.5); return k > 0 && <g transform={`translate(${(1 - k) * 300} 0)`}><Cast id="bot.laptop" x={1400} y={600} size={270} /></g>; })()}
      {(() => { const k = pop(t, 49.4); return k > 0 && <g transform={`translate(1535 585) scale(${k})`}>
        <rect x={-46} y={-30} width={92} height={56} rx={28} fill={P.purple} />
        <text x={0} y={12} textAnchor="middle" fontSize={34} fill="#fff" style={{ fontFamily: FIG, fontWeight: 700 }}>AI</text></g>; })()}
    </g>}
  </svg>
);

/* ------------------------------------------------------------------ screen-space overlays */

const Open: React.FC<{ t: number }> = ({ t }) => {
  if (t > 2.9) return null;
  const out = lin(t, 2.45, 0.4);
  const w = (at: number) => ({ opacity: ramp(t, at - 0.1, 0.35) * (1 - out), filter: `blur(${(1 - ramp(t, at - 0.1, 0.35)) * 12 + out * 10}px)` });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(20,20,20,.55) 0%, rgba(20,20,20,0) 41%)", opacity: 1 - out }} />
      <div style={{ position: "absolute", left: 120, top: 300, color: "#fff", fontFamily: SAUCE, fontWeight: 500, fontSize: 120, letterSpacing: 1,
        lineHeight: 1.12, textShadow: "0 2px 24px rgba(0,0,0,.35)" }}>
        <div style={w(0.7)}>Hi</div>
        <div style={{ ...w(1.2), fontFamily: SERIF, fontStyle: "italic", fontSize: 150, color: P.lilac }}>there!</div>
      </div>
    </AbsoluteFill>
  );
};

/** 4: a cursor heads for the close button; the bot pops up and shoos it off */
const Shoo: React.FC<{ t: number }> = ({ t }) => {
  if (t < 10.9 || t > 14.5) return null;
  const go = interpolate(t, [11.5, 13.0], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const flee = lin(t, 13.35, 0.4);
  const cx = 1250 + go * 520 + Math.sin(t * 7) * 8 + flee * flee * 700, cy = 760 - go * 640 - flee * 260;
  const bot = ramp(t, 13.1, 0.3) * (1 - lin(t, 14.1, 0.3));
  const fade = ramp(t, 10.95, 0.3) * (1 - lin(t, 14.1, 0.3));
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <div style={{ position: "absolute", right: 60, top: 50, width: 380, height: 70, borderRadius: 14, background: "#fff", boxShadow: "0 8px 30px rgba(0,0,0,.18)",
        display: "flex", alignItems: "center", padding: "0 26px", gap: 16, fontFamily: FIG, fontWeight: 600, fontSize: 30, color: P.ink }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: P.purple }} />
        <div style={{ flex: 1 }}>Ajay's video</div>
        <div style={{ fontSize: 36, color: go > 0.9 && flee === 0 ? "#c0392b" : P.grey }}>✕</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <path transform={`translate(${cx} ${cy}) scale(1.6)`} d="M0 0 L0 34 L9 26 L16 41 L22 38 L15 24 L27 24 Z" fill="#fff" stroke="#111" strokeWidth={2.5} strokeLinejoin="round" />
        {bot > 0 && <ThemeCtx.Provider value={PAL}><g transform={`translate(0 ${(1 - bot) * 300})`}><Cast id="bot.wave" x={1560} y={780} size={300} /></g></ThemeCtx.Provider>}
      </svg>
    </AbsoluteFill>
  );
};

/** 10: the real request box beside his card; each tag gets a ring as he names it */
const Request: React.FC<{ t: number }> = ({ t }) => {
  if (t < 61.2 || t > 69.2) return null;
  const k = ramp(t, 61.3, 0.6) * (1 - ramp(t, 68.45, 0.45));
  const CR = { x: 82, y: 98, w: 600, h: 365 }; const SW = 960, SH = SW * CR.h / CR.w, X = 80, Y = 230, k2 = SW / CR.w;
  // chip boxes in the screenshot's own pixels (733x556), mapped into the crop
  const rings = [[365, 132, 279, 27, 65.7], [347, 166, 255, 27, 66.2], [287, 199, 272, 28, 66.8], [113, 311, 122, 25, 67.5]]
    .map(([x, y, w, h, at]) => ({ x: (x - CR.x) / CR.w, y: (y - CR.y) / CR.h, w: w / CR.w, h: h / CR.h, at }));
  return (
    <AbsoluteFill style={{ opacity: k, transform: `translateX(${(1 - k) * -120}px)` }}>
      <div style={{ position: "absolute", left: X, top: 70, display: "flex", gap: 18 }}>
        {[{ at: 62.9, logo: "chatgpt.png", name: "ChatGPT" }, { at: 63.5, name: "Claude" }].map((o) => (
          <div key={o.name} style={{ opacity: ramp(t, o.at), transform: `scale(${0.8 + 0.2 * pop(t, o.at)})`, display: "flex", alignItems: "center", gap: 12, background: "#fff",
            borderRadius: 18, padding: "12px 24px", boxShadow: "0 6px 24px rgba(40,20,80,.12)", fontFamily: FIG, fontWeight: 600, fontSize: 34, color: P.ink }}>
            {o.logo && <Img src={staticFile(o.logo)} style={{ width: 40, height: 40 }} />}{o.name}
          </div>))}
        <div style={{ opacity: ramp(t, 62.4), alignSelf: "center", fontFamily: HAND, fontSize: 36, color: P.grey, order: -1 }}>like</div>
      </div>
      <div style={{ position: "absolute", left: X, top: Y, width: SW, height: SH, borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(40,20,80,.16)", background: "#fff" }}>
        <Img src={staticFile("request-box.png")} style={{ position: "absolute", left: -CR.x * k2, top: -CR.y * k2, width: 733 * k2, height: 556 * k2, maxWidth: "none" }} />
        <div style={{ position: "absolute", left: (125 - CR.x) * k2, top: (240 - CR.y) * k2, width: 26 * k2, height: 26 * k2, background: "#faf5ff" }} />
        <svg viewBox={`0 0 ${SW} ${SH}`} style={{ position: "absolute", inset: 0 }}>
          {rings.map((r, i) => { const p = lin(t, r.at, 0.45); return p > 0 &&
            <rect key={i} x={(r.x - 0.01) * SW} y={(r.y - 0.012) * SH} width={(r.w + 0.02) * SW} height={(r.h + 0.024) * SH} rx={30} fill="none" stroke={P.purple} strokeWidth={6}
              pathLength={1} strokeDasharray={1} strokeDashoffset={1 - eo(p)} />; })}
        </svg>
      </div>
    </AbsoluteFill>
  );
};

/** 12: the AI tools that name you, peeking in from the edges */
const Peek: React.FC<{ t: number }> = ({ t }) => {
  if (t < 75.3 || t > 81.1) return null;
  const tile = (logo: string, name: string, at: number, side: "left" | "right") => {
    const k = ramp(t, at, 0.5) * (1 - ramp(t, 80.6, 0.4));
    return (
      <div style={{ position: "absolute", top: 230, [side]: -460 + k * 500, width: 400, background: "#fff", borderRadius: 24, padding: "22px 28px",
        boxShadow: "0 10px 40px rgba(0,0,0,.18)", transform: `rotate(${side === "left" ? -3 : 3}deg)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: FIG, fontWeight: 700, fontSize: 40, color: P.ink }}>
          <Img src={staticFile(logo)} style={{ width: 52, height: 52 }} />{name}</div>
        <div style={{ marginTop: 12, fontFamily: HAND, fontSize: 34, color: P.ok, opacity: ramp(t, 77.1 + (side === "right" ? 0.25 : 0)) }}>named you ✓</div>
      </div>);
  };
  return <AbsoluteFill>{tile("chatgpt.png", "ChatGPT", 75.6, "left")}{tile("perplexity.svg", "Perplexity", 76.2, "right")}</AbsoluteFill>;
};

/** 14: the feature list unrolls; on "quick" the bot cuts it */
const Unroll: React.FC<{ t: number }> = ({ t }) => {
  if (t < 85.4 || t > 88.2) return null;
  const len = interpolate(t, [85.6, 86.8], [0, 1180], { ...clamp, easing: Easing.out(Easing.quad) });
  const cut = 560, drop = lin(t, 87.75, 0.35);
  const rows = Array.from({ length: 17 }, (_, i) => i);
  const strip = (from: number, to: number, dy: number) => (
    <g transform={`translate(0 ${dy})`} clipPath={undefined}>
      <rect x={1430} y={from} width={360} height={Math.max(0, Math.min(len, to) - from)} fill="#fff" stroke="#e6e0ef" strokeWidth={3} />
      {rows.map((i) => { const y = 40 + i * 70; return y > from && y + 30 < Math.min(len, to) && <g key={i}>
        <path d={`M1460 ${y + 14} l10 10 l20 -20`} stroke={P.ok} strokeWidth={5} fill="none" strokeLinecap="round" />
        <rect x={1510} y={y + 6} width={180 + ((i * 53) % 80)} height={18} rx={9} fill="#e9e4f2" /></g>; })}
    </g>);
  return (
    <AbsoluteFill>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {strip(0, cut, 0)}
        {strip(cut, 1300, drop * drop * 700)}
        {t > 86.9 && <ThemeCtx.Provider value={PAL}><g opacity={ramp(t, 86.9, 0.3)}>
          <Cast id="bot.busy" x={1210} y={470} size={200} />
          <Scissors x={1400} y={cut} open={t < 87.7 ? 18 + Math.sin(t * 10) * 6 : 4} />
        </g></ThemeCtx.Provider>}
      </svg>
    </AbsoluteFill>
  );
};

/** 16: two months, free, the whole team: a gift that flies at the camera */
const Gift: React.FC<{ t: number }> = ({ t }) => {
  if (t < 95.9 || t > 99.3) return null;
  const k = pop(t, 96.0, 0.5), fly = interpolate(t, [98.2, 98.9], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const s = k * (1 + fly * 7), wash = lin(t, 98.6, 0.29) * (1 - lin(t, 98.95, 0.3));
  const tag = (txt: string, at: number) => <span style={{ opacity: ramp(t, at), marginRight: 14 }}>{txt}</span>;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 960, top: 870, transform: `translate(-50%, -50%) scale(${s})`, opacity: 1 - lin(t, 98.85, 0.1) }}>
        <svg width={360} height={300} viewBox="0 0 360 300" style={{ overflow: "visible" }}>
          <rect x={30} y={110} width={300} height={180} rx={10} fill="#fff" stroke={P.ink} strokeWidth={5} />
          <rect x={14} y={70} width={332} height={56} rx={8} fill="#fff" stroke={P.ink} strokeWidth={5} />
          <rect x={160} y={70} width={40} height={220} fill={P.purple} />
          <path d="M180 70 C120 0 70 40 120 70 Z M180 70 C240 0 290 40 240 70 Z" fill={P.violet} stroke={P.ink} strokeWidth={4} />
        </svg>
      </div>
      <div style={{ position: "absolute", left: 90, top: 330, transform: `rotate(-3deg) scale(${k})`, transformOrigin: "0 50%", opacity: 1 - lin(t, 98.25, 0.2), whiteSpace: "nowrap",
        background: "#fff", border: `4px solid ${P.purple}`, borderRadius: 16, padding: "10px 26px", fontFamily: HAND, fontSize: 46, color: P.purple, boxShadow: "0 8px 30px rgba(40,20,80,.18)" }}>
        <div>{tag("2 months", 96.0)}</div><div>{tag("free", 96.8)}</div><div>{tag("whole team", 98.0)}</div>
      </div>
      <AbsoluteFill style={{ background: P.purple, opacity: wash }} />
    </AbsoluteFill>
  );
};

/** 17: the form is right below */
const Below: React.FC<{ t: number }> = ({ t }) => {
  if (t < 102.3 || t > 105.3) return null;
  const o = ramp(t, 102.45, 0.3) * (1 - lin(t, 104.9, 0.3)), b = Math.abs(Math.sin((t - 102.5) * 5)) * 26;
  const arrow = (x: number) => <path transform={`translate(${x} ${820 + b})`} d="M0 0 Q6 90 0 170 M-46 120 L0 175 L46 120" stroke={P.purple} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {arrow(300)}{arrow(1620)}
        <text x={360} y={790} fontSize={52} fill={P.purple} style={{ fontFamily: HAND }}>form below</text>
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ the composition */

export const Outreach: React.FC<{ video?: string; matte?: string }> = ({ video = "cut1440.mp4", matte = "matte1440.webm" }) => {
  useSauce();
  useVirgil();
  const t = useCurrentFrame() / FPS;
  const cam = camera(t);
  const { s, x, y } = place(cam.r, cam.z);
  const box: React.CSSProperties = { position: "absolute", left: x - cam.r.x, top: y - cam.r.y, width: W * s, height: H * s };
  const shot: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%" };
  const inner = { transform: `scale(${s})`, transformOrigin: "0 0", width: W, height: H, position: "absolute" as const, inset: 0 };
  return (
    <ThemeCtx.Provider value={PAL}>
      <AbsoluteFill style={{ background: P.page }}>
        <div style={{ position: "absolute", left: cam.r.x, top: cam.r.y, width: cam.r.w, height: cam.r.h, overflow: "hidden",
          borderRadius: cam.split ? 28 : 0, boxShadow: cam.split ? "0 24px 70px rgba(40,20,80,.22)" : "none" }}>
          <div style={box}>
            <OffthreadVideo src={staticFile(video)} style={shot} />
            {!cam.split && <div style={inner}><Behind t={t} /></div>}
            {matte ? <OffthreadVideo src={staticFile(matte)} muted transparent style={shot} /> : null}
            {!cam.split && <div style={inner}><Front t={t} /></div>}
          </div>
        </div>
        <Open t={t} />
        <Shoo t={t} />
        <Request t={t} />
        <Peek t={t} />
        <Unroll t={t} />
        <Gift t={t} />
        <Below t={t} />
      </AbsoluteFill>
    </ThemeCtx.Provider>
  );
};
