// The swipe-folder metaphors (swipe/visual-metaphors.md V1–V28), rebuilt in our look: one drawing carries one idea.
// Patterns, not drawings: nothing is traced, and the figure is always our own cast (cast.tsx), never the swipe
// creator's stick figure. Fixed viewBoxes scaled to the box (Stage), so each fits tile, split and reel.
// Same contract as scenes.tsx: absolute cut times, every element lands on its word, every real word from the fields.
import React from "react";
import { Easing, staticFile } from "remotion";
import { clamp01, ramp, useC, useNow } from "./kit";
import type { Box, Face, SScene } from "./scenes";
import { Chip, Draw, Label, Stage, hash } from "./scenes-idea";
import { Cast } from "./cast";

type View = React.FC<{ s: SScene; box: Box; face: Face }>;
type T = { text: string; at: number };
const ease = Easing.inOut(Easing.cubic);
const RED = "#C0392B";
const TINTS = ["#F4E6B4", "#C9D6AC", "#D6E4F0", "#F2CFC9", "#E6E4DE"];

/** A drawn ✗ centred on (x, y). */
const Cross: React.FC<{ x: number; y: number; r: number; at: number; color?: string; width?: number }> = ({ x, y, r, at, color = RED, width = 8 }) =>
  <Draw d={`M ${x - r} ${y - r} L ${x + r} ${y + r} M ${x + r} ${y - r} L ${x - r} ${y + r}`} at={at} dur={0.35} color={color} width={width} len={4 * r * 1.5} />;

/** A drawn ✓ centred on (x, y). */
const Tick: React.FC<{ x: number; y: number; r: number; at: number; color: string; width?: number }> = ({ x, y, r, at, color, width = 10 }) =>
  <Draw d={`M ${x - r} ${y} L ${x - r * 0.3} ${y + r * 0.7} L ${x + r} ${y - r * 0.8}`} at={at} dur={0.4} color={color} width={width} len={r * 4} />;

/* ------------------------------------------------------------------ *
 * swap (V11): the old way struck through, an arrow, the new way.      *
 * `old {text, at}`, `strikeAt`, `new {text, at}`. `logos [{src, at}]` *
 * puts logo tiles on the old side instead, each slashed on strikeAt. *
 * ------------------------------------------------------------------ */
const Swap: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const old = s.old as T | undefined, nw = s.new as T, strikeAt = s.strikeAt ?? (nw.at - 0.6);
  const logos = s.logos as { src: string; at: number }[] | undefined;
  const ow = old ? Math.max(360, old.text.length * 44 + 120) : 420;
  return (
    <Stage box={box} vw={1500} vh={600} enter={ramp(t, s.start, 0.4)}>
      {old && <>
        <rect x={380 - ow / 2} y={200} width={ow} height={190} rx={30} fill={C.card} stroke={C.line} strokeWidth={3} opacity={ramp(t, old.at, 0.35)} />
        <Label x={380} y={325} text={old.text} p={ramp(t, old.at, 0.35)} size={84} color={C.muted} />
        <Draw d={`M ${380 - ow / 2 + 30} 300 L ${380 + ow / 2 - 30} 290`} at={strikeAt} dur={0.35} color={RED} width={9} len={ow} />
      </>}
      {logos && logos.map((l, i) => {
        const x = 380 + (i - (logos.length - 1) / 2) * 170, p = ramp(t, l.at, 0.35);
        return <g key={i} opacity={p}>
          <rect x={x - 70} y={225} width={140} height={140} rx={28} fill={C.card} stroke={C.line} strokeWidth={3} />
          <image href={staticFile(l.src)} x={x - 45} y={250} width={90} height={90} />
          <Draw d={`M ${x - 80} 375 L ${x + 80} 215`} at={strikeAt + i * 0.15} dur={0.3} color={RED} width={9} len={240} />
        </g>;
      })}
      <path d="M 650 250 L 820 250 L 820 200 L 930 295 L 820 390 L 820 340 L 650 340 Z" fill="none" stroke={C.ink} strokeWidth={5} strokeLinejoin="round"
        opacity={ramp(t, nw.at - 0.25, 0.3)} />
      <Label x={1200} y={320} text={nw.text} p={ramp(t, nw.at, 0.4)} size={110} italic />
      <Draw d={`M ${1200 - nw.text.length * 26} 355 Q 1200 372 ${1200 + nw.text.length * 26} 350`} at={nw.at + 0.35} dur={0.4} color={C.accent} width={6} len={nw.text.length * 60} />
    </Stage>
  );
};

/* ------------------------------------------------------------------ *
 * equation (V9, NS 11): tiles joined by operators. `terms [{text,     *
 * sub?, art?, at}]`, `ops ["×", "="]` (one between each pair; "≠"     *
 * for not-the-same). The term after "=" is the answer, lit.          *
 * ------------------------------------------------------------------ */
const Equation: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const terms = s.terms as { text: string; sub?: string; art?: string; at: number }[];
  const ops = (s.ops ?? []) as string[];
  const tw = terms.map((tm) => Math.max(260, tm.text.length * 52 + 90, (tm.sub?.length ?? 0) * 19 + 60));
  const opw = 150, W = tw.reduce((a, w) => a + w, 0) + opw * (terms.length - 1) + 100, H = 560;
  let x = 50;
  const xs = tw.map((w) => { const cx = x + w / 2; x += w + opw; return cx; });
  return (
    <Stage box={box} vw={W} vh={H} enter={ramp(t, s.start, 0.4)}>
      {terms.map((tm, i) => {
        const p = ramp(t, tm.at, 0.4), ans = i > 0 && ops[i - 1] === "=";
        const hasArt = !!tm.art, cy = hasArt ? 330 : 280;
        return (
          <g key={i} opacity={p} transform={`translate(0 ${(1 - p) * 16})`}>
            <rect x={xs[i] - tw[i] / 2} y={hasArt ? 60 : 130} width={tw[i]} height={hasArt ? 420 : 300} rx={30} fill={ans ? C.accent : C.card}
              stroke={ans ? "none" : C.line} strokeWidth={3} style={{ filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.08))" }} />
            {hasArt && <Cast id={tm.art!} x={xs[i] - 80} y={80} size={160} at={tm.at} dur={0.6} />}
            <text x={xs[i]} y={cy} textAnchor="middle" style={{ fontFamily: C.fonts.display, fontSize: 104, fill: ans ? "#FFFFFF" : C.ink }}>{tm.text}</text>
            {tm.sub && <text x={xs[i]} y={cy + 70} textAnchor="middle" style={{ fontFamily: C.fonts.plain, fontWeight: 500, fontSize: 34, fill: ans ? "rgba(255,255,255,0.85)" : C.muted }}>{tm.sub}</text>}
          </g>
        );
      })}
      {ops.map((op, i) => <Label key={i} x={xs[i] + tw[i] / 2 + opw / 2} y={320} text={op} p={ramp(t, terms[i + 1].at - 0.2, 0.3)} size={130}
        color={op === "≠" ? RED : C.muted} />)}
    </Stage>
  );
};

/* ------------------------------------------------------------------ *
 * curve (V7, V22, V28, NS 10): one drawn line and 1–2 callouts.       *
 * `mode`: hockey | bell | dip | mountain | spike | slope, drawing on  *
 * `at`. `pair: [modeA, modeB]` + `labels` puts two small charts side  *
 * by side (spike vs slope). `callouts [{text, u (0–1 along), at}]`,   *
 * `xLabel` / `yLabel`.                                                 *
 * ------------------------------------------------------------------ */
const SHAPES: Record<string, (u: number) => number> = {
  hockey: (u) => (u < 0.62 ? 0.06 + 0.04 * u : 0.085 + Math.pow((u - 0.62) / 0.38, 2.2) * 0.85),
  bell: (u) => 0.04 + 0.86 * Math.exp(-Math.pow((u - 0.5) / 0.19, 2)),
  dip: (u) => 0.45 + 0.35 * u - 0.38 * Math.exp(-Math.pow((u - 0.45) / 0.1, 2)),
  mountain: (u) => 0.08 + 0.78 * Math.exp(-Math.pow((u - 0.55) / 0.2, 2)) + 0.025 * Math.sin(u * 47) * (1 - Math.abs(u - 0.55)),
  spike: (u) => 0.04 + 0.88 * Math.exp(-Math.pow((u - 0.3) / 0.035, 2)),
  slope: (u) => 0.05 + 0.78 * u + 0.025 * Math.sin(u * 34),
};
const Plot: React.FC<{ mode: string; x: number; y: number; w: number; h: number; at: number; label?: string; xLabel?: string; yLabel?: string;
  callouts?: { text: string; u: number; at: number }[] }> = ({ mode, x, y, w, h, at, label, xLabel, yLabel, callouts }) => {
  const C = useC();
  const t = useNow();
  const f = SHAPES[mode] ?? SHAPES.hockey;
  const pt = (u: number) => [x + u * w, y + h - f(u) * h];
  const d = Array.from({ length: 121 }, (_, i) => { const [px, py] = pt(i / 120); return `${i ? "L" : "M"} ${px.toFixed(1)} ${py.toFixed(1)}`; }).join(" ");
  const axes = ramp(t, at - 0.4, 0.35);
  return (
    <g>
      <path d={`M ${x} ${y - 20} L ${x} ${y + h} L ${x + w + 20} ${y + h}`} fill="none" stroke={C.ink} strokeWidth={4} opacity={axes} strokeLinecap="round" />
      <Draw d={d} at={at} dur={1.2} color={C.accent} width={7} len={w * 2.2} />
      {yLabel && <Label x={x + 14} y={y - 34} text={yLabel} p={axes} size={36} anchor="start" color={C.muted} />}
      {xLabel && <Label x={x + w + 10} y={y + h + 56} text={xLabel} p={axes} size={36} anchor="end" color={C.muted} />}
      {label && <Label x={x + w / 2} y={y + h + 100} text={label} p={ramp(t, at + 0.6, 0.4)} size={64} italic />}
      {callouts?.map((c, i) => {
        const [px, py] = pt(c.u), lx = px + (c.u > 0.6 ? -150 : 150), ly = py - 110;
        return <g key={i}>
          <Draw d={`M ${lx} ${ly + 16} Q ${(lx + px) / 2} ${ly + 20} ${px} ${py - 14}`} at={c.at + 0.15} dur={0.35} color={C.muted} width={3} len={300} />
          <circle cx={px} cy={py} r={11 * ramp(t, c.at, 0.25)} fill={C.accent} />
          <Label x={lx} y={ly} text={c.text} p={ramp(t, c.at, 0.35)} size={50} anchor={c.u > 0.6 ? "end" : "start"} />
        </g>;
      })}
    </g>
  );
};
const Curve: View = ({ s, box }) => {
  const t = useNow();
  const pair = s.pair as string[] | undefined;
  if (pair) {
    const labels = (s.labels ?? []) as string[], ats = (s.ats ?? [s.start + 0.3, s.start + 1.5]) as number[];
    return (
      <Stage box={box} vw={1500} vh={760} enter={ramp(t, s.start, 0.4)}>
        <Plot mode={pair[0]} x={110} y={120} w={540} h={420} at={ats[0]} label={labels[0]} />
        <Plot mode={pair[1]} x={850} y={120} w={540} h={420} at={ats[1]} label={labels[1]} />
      </Stage>
    );
  }
  return (
    <Stage box={box} vw={1400} vh={820} enter={ramp(t, s.start, 0.4)}>
      <Plot mode={s.mode ?? "hockey"} x={140} y={130} w={1120} h={520} at={s.at ?? s.start + 0.3} xLabel={s.xLabel} yLabel={s.yLabel} callouts={s.callouts} />
    </Stage>
  );
};

/* ------------------------------------------------------------------ *
 * stack (V6): foundations. `blocks [{text, at}]` from the bottom up, *
 * widest first, each dropping into place; `top {text, at}` is the    *
 * outcome, an arrow over the stack.                                   *
 * ------------------------------------------------------------------ */
const Stack: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const blocks = s.blocks as T[];
  const n = blocks.length, bh = 120, base = 800, top = s.top as T | undefined;
  return (
    <Stage box={box} vw={1400} vh={900} enter={ramp(t, s.start, 0.4)}>
      {blocks.map((b, i) => {
        const w = 820 - i * (420 / Math.max(1, n - 1)), y = base - (i + 1) * bh, k = ease(clamp01((t - b.at) / 0.45));
        return <g key={i} opacity={clamp01(k * 3)} transform={`translate(0 ${-(1 - k) * 160})`}>
          <rect x={700 - w / 2} y={y} width={w} height={bh - 8} rx={14} fill={TINTS[i % 3]} stroke={C.ink} strokeWidth={4} />
          <text x={700} y={y + bh / 2 + 18} textAnchor="middle" style={{ fontFamily: C.fonts.display, fontSize: 62, fill: C.ink }}>{b.text}</text>
        </g>;
      })}
      {top && <>
        <Draw d={`M ${700 - 260} ${base - n * bh - 60} L ${700 + 260} ${base - n * bh - 60} M ${700 + 236} ${base - n * bh - 76} L ${700 + 262} ${base - n * bh - 60} L ${700 + 236} ${base - n * bh - 44}`}
          at={top.at} dur={0.45} color={C.ink} width={5} len={700} />
        <Label x={700} y={base - n * bh - 100} text={top.text} p={ramp(t, top.at + 0.2, 0.4)} size={70} italic />
      </>}
    </Stage>
  );
};

/* ------------------------------------------------------------------ *
 * stopwatch (V14): the number lives in an object. `value` + `unit`   *
 * inside a stopwatch whose ring sweeps on `at`; `branches [{text,    *
 * at, tone}]` fan out to the right (what happens next).              *
 * ------------------------------------------------------------------ */
const Stopwatch: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const br = (s.branches ?? []) as { text: string; at: number; tone?: "accent" | "muted" }[];
  const cx = br.length ? 400 : 700, cy = 450, R = 230, sweep = ease(clamp01((t - s.at) / (s.sweep ?? 1.6)));
  const a = -Math.PI / 2 + sweep * Math.PI * 2 * (s.ring ?? 0.8);
  const arc = sweep > 0.001 ? `M ${cx} ${cy - R + 26} A ${R - 26} ${R - 26} 0 ${sweep * (s.ring ?? 0.8) > 0.5 ? 1 : 0} 1 ${cx + Math.cos(a) * (R - 26)} ${cy + Math.sin(a) * (R - 26)}` : "";
  return (
    <Stage box={box} vw={1400} vh={900} enter={ramp(t, s.start, 0.4)}>
      <rect x={cx - 34} y={cy - R - 70} width={68} height={50} rx={10} fill={C.card} stroke={C.ink} strokeWidth={5} />
      <circle cx={cx} cy={cy} r={R} fill={C.card} stroke={C.ink} strokeWidth={6} />
      {arc && <path d={arc} fill="none" stroke={C.accent} strokeWidth={14} strokeLinecap="round" />}
      <text x={cx} y={cy + 40} textAnchor="middle" style={{ fontFamily: C.fonts.display, fontSize: 170, fill: C.ink }}>{s.value}</text>
      {s.unit && <text x={cx} y={cy + 105} textAnchor="middle" style={{ fontFamily: C.fonts.plain, fontWeight: 500, fontSize: 38, fill: C.muted }}>{s.unit}</text>}
      {s.label && <Label x={cx} y={cy + R + 90} text={s.label} p={ramp(t, s.at, 0.4)} size={56} />}
      {br.map((b, i) => {
        const y = cy + (i - (br.length - 1) / 2) * 260, acc = (b.tone ?? (i === br.length - 1 ? "accent" : "muted")) === "accent";
        return <g key={i}>
          <Draw d={`M ${cx + R + 30} ${cy} C ${cx + R + 140} ${cy} ${cx + R + 110} ${y} ${cx + R + 220} ${y}`} at={b.at - 0.2} dur={0.4} color={C.muted} width={4} len={500} />
          <Chip x={cx + R + 220 + Math.max(160, b.text.length * 13 + 50)} y={y} text={b.text} p={ramp(t, b.at, 0.35)} tone={acc ? "accent" : "muted"} size={44} />
        </g>;
      })}
    </Stage>
  );
};

/* ------------------------------------------------------------------ *
 * spotlight (V15): a dim crowd, and the light on a few. `at` turns   *
 * the light on; `few [{text?, at}]` are lit people in front, named.  *
 * `note {text, at}` sits above.                                       *
 * ------------------------------------------------------------------ */
const Spotlight: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const few = (s.few ?? []) as { text?: string; at: number }[];
  const on = ramp(t, s.at, 0.6), note = s.note as T | undefined;
  const crowd = Array.from({ length: 70 }, (_, i) => ({ x: 120 + (i % 14) * 83 + (Math.floor(i / 14) % 2) * 40 + (hash(i) - 0.5) * 20, y: 420 + Math.floor(i / 14) * 70 }));
  return (
    <Stage box={box} vw={1400} vh={900} enter={ramp(t, s.start, 0.4)}>
      {crowd.map((c, i) => <g key={i} opacity={0.55 - 0.3 * on}><circle cx={c.x} cy={c.y} r={18} fill="#D6D4CE" /><path d={`M ${c.x - 26} ${c.y + 50} Q ${c.x} ${c.y + 10} ${c.x + 26} ${c.y + 50}`} fill="#D6D4CE" /></g>)}
      <path d="M 660 110 L 740 110 L 1000 820 L 400 820 Z" fill={C.accentTint} opacity={0.45 * on} />
      <path d="M 640 80 L 760 80 L 740 115 L 660 115 Z" fill={C.ink} />
      {few.map((f, i) => {
        const x = 700 + (i - (few.length - 1) / 2) * 190, p = ramp(t, f.at, 0.4);
        return <g key={i}>
          <Cast id="person.stand" x={x - 90} y={570} size={180} at={f.at} dur={0.5} />
          {f.text && <Label x={x} y={800} text={f.text} p={p} size={48} />}
        </g>;
      })}
      {note && <Label x={700} y={60} text={note.text} p={ramp(t, note.at, 0.4)} size={62} italic />}
    </Stage>
  );
};

/* ------------------------------------------------------------------ *
 * keylock (V17): the old key, the new key, the lock. `old`, `new`,    *
 * `lock` ({text, at}); the old key greys out as the new one lands.   *
 * ------------------------------------------------------------------ */
const KeyShape: React.FC<{ x: number; y: number; fill: string; stroke: string }> = ({ x, y, fill, stroke }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle cx={0} cy={0} r={62} fill={fill} stroke={stroke} strokeWidth={6} />
    <circle cx={0} cy={0} r={22} fill="#FAFCFA" stroke={stroke} strokeWidth={5} />
    <path d="M 60 -16 L 260 -16 L 260 16 L 230 16 L 230 50 L 200 50 L 200 16 L 170 16 L 170 40 L 140 40 L 140 16 L 60 16 Z" fill={fill} stroke={stroke} strokeWidth={6} strokeLinejoin="round" />
  </g>
);
const Keylock: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const old = s.old as T, nw = s.new as T, lock = s.lock as T | undefined;
  const fade = ramp(t, nw.at, 0.4);
  return (
    <Stage box={box} vw={1500} vh={700} enter={ramp(t, s.start, 0.4)}>
      <g opacity={ramp(t, old.at, 0.35) * (1 - 0.5 * fade)}><KeyShape x={120} y={330} fill="#E8B9A8" stroke={C.ink} /></g>
      <Label x={250} y={470} text={old.text} p={ramp(t, old.at, 0.35)} size={60} color={C.muted} />
      <Draw d="M 470 330 L 580 330 M 556 312 L 582 330 L 556 348" at={nw.at - 0.3} dur={0.3} color={C.ink} width={5} len={200} />
      <g opacity={ramp(t, nw.at, 0.35)}><KeyShape x={680} y={330} fill={C.accentTint} stroke={C.ink} /></g>
      <Label x={810} y={470} text={nw.text} p={ramp(t, nw.at, 0.35)} size={60} italic />
      {lock && <g opacity={ramp(t, lock.at, 0.4)}>
        <path d="M 1150 300 L 1150 220 Q 1150 140 1240 140 Q 1330 140 1330 220 L 1330 300" fill="none" stroke={C.ink} strokeWidth={14} />
        <rect x={1110} y={290} width={260} height={230} rx={30} fill={C.card} stroke={C.ink} strokeWidth={6} />
        <circle cx={1240} cy={390} r={22} fill={C.ink} /><path d="M 1228 400 L 1222 460 L 1258 460 L 1252 400 Z" fill={C.ink} />
        <Label x={1240} y={590} text={lock.text} p={ramp(t, lock.at + 0.1, 0.35)} size={56} />
      </g>}
    </Stage>
  );
};

/* ------------------------------------------------------------------ *
 * path (V24): start to flag, twice. The top run is blocked by        *
 * `things` (library doodles) on their words; the bottom is clear and *
 * our person runs it. `blocked {text, at}`, `clear {text, at}`.      *
 * ------------------------------------------------------------------ */
const Path: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const blocked = s.blocked as T, clear = s.clear as T;
  const things = (s.things ?? ["phone", "scribble", "notebook"]) as string[];
  const row = (y: number, at: number) => <g opacity={ramp(t, at, 0.35)}>
    <circle cx={160} cy={y} r={16} fill="none" stroke={C.ink} strokeWidth={5} />
    <line x1={178} y1={y} x2={1240} y2={y} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
    <path d={`M 1250 ${y} L 1250 ${y - 90} L 1320 ${y - 70} L 1250 ${y - 50}`} fill={C.accentTint} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
  </g>;
  const run = ease(clamp01((t - clear.at - 0.3) / 2.5));
  return (
    <Stage box={box} vw={1400} vh={860} enter={ramp(t, s.start, 0.4)}>
      <Label x={160} y={110} text={blocked.text} p={ramp(t, blocked.at, 0.35)} size={60} anchor="start" color={RED} />
      {row(320, blocked.at)}
      {things.map((id, i) => <Cast key={i} id={id} x={380 + i * 260} y={210} size={120} at={blocked.at + 0.3 + i * 0.25} dur={0.4} />)}
      <Label x={160} y={530} text={clear.text} p={ramp(t, clear.at, 0.35)} size={60} anchor="start" color={C.accent} />
      {row(760, clear.at)}
      <Cast id="person.run" x={200 + run * 880} y={600} size={160} at={clear.at} dur={0.4} />
    </Stage>
  );
};

/* ------------------------------------------------------------------ *
 * bucket (V25): the same water twice. A bucket leaking from holes    *
 * (`leak {text, at}`) and a pipe aiming it one way (`pipe {text,     *
 * at}`); `note {text, at}` under both.                                *
 * ------------------------------------------------------------------ */
const Bucket: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const leak = s.leak as T, pipe = s.pipe as T, note = s.note as T | undefined;
  const lp = ramp(t, leak.at, 0.4), pp = ramp(t, pipe.at, 0.4);
  const WATER = "#9DBBD9";
  const holes = [[330, 420], [430, 470], [520, 430], [380, 520]];
  return (
    <Stage box={box} vw={1500} vh={860} enter={ramp(t, s.start, 0.4)}>
      <g opacity={lp}>
        <path d="M 270 280 L 590 280 L 550 600 L 310 600 Z" fill={C.card} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 278 330 L 582 330 L 550 600 L 310 600 Z" fill={WATER} opacity={0.5} />
        <ellipse cx={430} cy={280} rx={160} ry={24} fill={C.card} stroke={C.ink} strokeWidth={6} />
        <path d="M 290 280 Q 430 140 570 280" fill="none" stroke={C.ink} strokeWidth={5} />
        {holes.map(([hx, hy], i) => Array.from({ length: 4 }, (_, k) => {
          const age = ((t - leak.at) * 1.4 + k / 4 + i * 0.13) % 1;
          if (t < leak.at) return null;
          const side = hx < 430 ? -1 : 1;
          return <circle key={`${i}-${k}`} cx={hx + side * age * 70} cy={hy + age * age * 220} r={9} fill={WATER} opacity={1 - age} />;
        }))}
      </g>
      <Label x={430} y={710} text={leak.text} p={lp} size={62} color={RED} />
      <g opacity={pp}>
        <rect x={860} y={380} width={330} height={90} rx={14} fill={C.card} stroke={C.ink} strokeWidth={6} />
        <ellipse cx={860} cy={425} rx={22} ry={45} fill={C.card} stroke={C.ink} strokeWidth={6} />
        <path d="M 1010 380 L 1010 340 M 980 340 L 1040 340" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
        {[0, 1, 2].map((k) => {
          const off = ((t - pipe.at) * 300 + k * 60) % 180;
          return <line key={k} x1={1200 + off} y1={410 + k * 15} x2={1250 + off} y2={410 + k * 15} stroke={WATER} strokeWidth={8} strokeLinecap="round" />;
        })}
        <path d="M 1200 425 L 1420 425 M 1396 408 L 1422 425 L 1396 442" stroke={WATER} strokeWidth={8} fill="none" strokeLinecap="round" />
      </g>
      <Label x={1080} y={710} text={pipe.text} p={pp} size={62} color={C.accent} />
      {note && <Label x={750} y={820} text={note.text} p={ramp(t, note.at, 0.4)} size={52} italic />}
    </Stage>
  );
};

/* ------------------------------------------------------------------ *
 * tree (V26): the same tree overgrown and pruned. `left {text, at}`  *
 * grows dense grey foliage; `right {text, at}` keeps a few branches   *
 * with accent leaves. A cut mark lands on each pruned branch.        *
 * ------------------------------------------------------------------ */
type Branch = { x1: number; y1: number; x2: number; y2: number; depth: number; keep: boolean };
const branches = (() => {
  const out: Branch[] = [];
  const grow = (x: number, y: number, a: number, len: number, d: number, keep: boolean) => {
    const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
    out.push({ x1: x, y1: y, x2, y2, depth: d, keep });
    if (d >= 4) return;
    [-0.42, 0.38].forEach((da, k) => grow(x2, y2, a + da + (hash(out.length * 7 + k) - 0.5) * 0.3, len * 0.72, d + 1, keep && (d < 1 || k === (d % 2))));
  };
  grow(0, 0, -Math.PI / 2, 150, 0, true);
  return out;
})();
const Tree: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const left = s.left as T, right = s.right as T;
  const one = (cx: number, base: number, at: number, pruned: boolean) => {
    const g = ease(clamp01((t - at) / 0.9));
    return <g transform={`translate(${cx} ${base})`}>
      {branches.map((b, i) => {
        if (pruned && !b.keep) return null;
        const show = clamp01(g * 5 - b.depth);
        return <line key={i} x1={b.x1} y1={b.y1} x2={b.x1 + (b.x2 - b.x1) * show} y2={b.y1 + (b.y2 - b.y1) * show} stroke={C.ink}
          strokeWidth={Math.max(2, 16 - b.depth * 3.4)} strokeLinecap="round" />;
      })}
      {branches.filter((b) => b.depth === 4 && (!pruned || b.keep)).flatMap((b, i) => (pruned ? [0, 1] : [0, 1, 2, 3, 4]).map((k) => {
        const p = clamp01((g - 0.7) / 0.3);
        return <circle key={`${i}-${k}`} cx={b.x2 + (hash(i * 13 + k) - 0.5) * 60} cy={b.y2 + (hash(i * 31 + k) - 0.5) * 50} r={pruned ? 14 : 16} opacity={p}
          fill={pruned ? C.accent : "#B8B5AC"} />;
      }))}
    </g>;
  };
  return (
    <Stage box={box} vw={1500} vh={860} enter={ramp(t, s.start, 0.4)}>
      {one(400, 700, left.at, false)}
      <Label x={400} y={800} text={left.text} p={ramp(t, left.at, 0.35)} size={60} color={C.muted} />
      <Draw d="M 680 420 L 800 420 M 776 402 L 802 420 L 776 438" at={right.at - 0.3} dur={0.3} color={C.ink} width={5} len={200} />
      {one(1100, 700, right.at, true)}
      <Label x={1100} y={800} text={right.text} p={ramp(t, right.at, 0.35)} size={60} italic />
    </Stage>
  );
};

/* ------------------------------------------------------------------ *
 * sprout (V27): the loud launch crossed out → working quietly → a   *
 * sprout. `loud {text, at}`, `quiet {text, at}`, `grow {text, at}`.   *
 * ------------------------------------------------------------------ */
const Sprout: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const loud = s.loud as T, quiet = s.quiet as T, grow = s.grow as T;
  const g = ease(clamp01((t - grow.at) / 1.0));
  return (
    <Stage box={box} vw={1500} vh={760} enter={ramp(t, s.start, 0.4)}>
      <g opacity={ramp(t, loud.at, 0.35)}>
        <path d="M 160 320 L 250 300 L 380 220 L 380 480 L 250 400 L 160 380 Z" fill={C.card} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 200 390 L 220 460 L 260 460 L 250 405" fill={C.card} stroke={C.ink} strokeWidth={5} />
        {[0, 1, 2].map((k) => <path key={k} d={`M ${410 + k * 26} ${290 + k * 10} Q ${430 + k * 26} 350 ${410 + k * 26} ${410 - k * 10}`} fill="none" stroke={C.muted} strokeWidth={4} />)}
      </g>
      <Cross x={290} y={350} r={130} at={loud.at + 0.5} width={10} />
      <Label x={290} y={620} text={loud.text} p={ramp(t, loud.at, 0.35)} size={58} color={C.muted} />
      <Draw d="M 520 350 L 600 350 M 578 334 L 602 350 L 578 366" at={quiet.at - 0.3} dur={0.3} color={C.ink} width={5} len={160} />
      <Cast id="person.write" x={640} y={170} size={300} at={quiet.at} dur={0.7} />
      <line x1={620} y1={470} x2={960} y2={470} stroke={C.ink} strokeWidth={6} opacity={ramp(t, quiet.at, 0.35)} />
      <Label x={790} y={620} text={quiet.text} p={ramp(t, quiet.at, 0.35)} size={58} />
      <Draw d="M 1000 350 L 1080 350 M 1058 334 L 1082 350 L 1058 366" at={grow.at - 0.3} dur={0.3} color={C.ink} width={5} len={160} />
      <path d="M 1180 470 Q 1260 440 1340 470" fill="none" stroke={C.ink} strokeWidth={6} opacity={ramp(t, grow.at - 0.2, 0.3)} />
      <path d={`M 1260 465 Q 1252 ${465 - 90 * g} 1262 ${465 - 190 * g}`} fill="none" stroke={C.accent} strokeWidth={9} strokeLinecap="round" />
      {g > 0.45 && <g transform={`translate(1258 ${465 - 120 * g}) scale(${clamp01((g - 0.45) / 0.4)})`}>
        <path d="M 0 0 Q -70 -20 -90 -80 Q -30 -70 0 0" fill={C.accentTint} stroke={C.accent} strokeWidth={4} />
        <path d="M 4 -30 Q 70 -60 100 -120 Q 30 -110 4 -30" fill={C.accentTint} stroke={C.accent} strokeWidth={4} />
      </g>}
      <Label x={1260} y={620} text={grow.text} p={ramp(t, grow.at + 0.6, 0.35)} size={58} italic />
    </Stage>
  );
};

/* ------------------------------------------------------------------ *
 * table (V23): a weak position and a strong one. Our person wobbles  *
 * on a one-legged stool (`weak {text, at}`), then stands on a four-  *
 * legged table with options fanning out (`strong {text, at}`).        *
 * ------------------------------------------------------------------ */
const Table: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const weak = s.weak as T, strong = s.strong as T;
  const wob = Math.sin(t * 4) * 6 * ramp(t, weak.at, 0.4);
  return (
    <Stage box={box} vw={1500} vh={860} enter={ramp(t, s.start, 0.4)}>
      <g opacity={ramp(t, weak.at, 0.35)} transform={`rotate(${wob} 380 700)`}>
        <rect x={300} y={430} width={160} height={22} rx={6} fill={C.card} stroke={C.ink} strokeWidth={5} />
        <line x1={380} y1={452} x2={380} y2={700} stroke={C.ink} strokeWidth={8} />
        <Cast id="person.shrug" x={265} y={215} size={230} at={weak.at} dur={0.5} />
      </g>
      <Label x={380} y={800} text={weak.text} p={ramp(t, weak.at, 0.35)} size={60} color={C.muted} />
      <g opacity={ramp(t, strong.at, 0.35)}>
        <rect x={820} y={480} width={520} height={30} rx={8} fill={C.card} stroke={C.ink} strokeWidth={5} />
        {[860, 980, 1180, 1300].map((x) => <line key={x} x1={x} y1={510} x2={x} y2={700} stroke={C.ink} strokeWidth={8} />)}
        <Cast id="person.cheer" x={965} y={262} size={230} at={strong.at} dur={0.5} />
      </g>
      {[-0.5, 0, 0.5].map((a, i) => <Draw key={i} d={`M 1180 ${350 + a * 60} L ${1180 + Math.cos(a) * 220} ${350 + Math.sin(a) * 220 - 40}`} at={strong.at + 0.6 + i * 0.15} dur={0.3}
        color={C.accent} width={6} len={260} />)}
      <Label x={1080} y={800} text={strong.text} p={ramp(t, strong.at, 0.35)} size={60} italic />
    </Stage>
  );
};

/* ------------------------------------------------------------------ *
 * mirror (V19): what you put in is what comes back. Our person stands *
 * at a mirror; `top {text, at}` above it, `bottom {text, at}` below  *
 * (the reflection), a faint mirrored figure inside.                  *
 * ------------------------------------------------------------------ */
const Mirror: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const top = s.top as T, bottom = s.bottom as T;
  const glass = ramp(t, s.start + 0.2, 0.4);
  return (
    <Stage box={box} vw={1200} vh={900} enter={ramp(t, s.start, 0.4)}>
      <Label x={720} y={110} text={top.text} p={ramp(t, top.at, 0.35)} size={64} />
      <Draw d="M 560 135 L 880 135" at={top.at + 0.2} dur={0.3} color={C.ink} width={4} len={320} />
      <rect x={560} y={180} width={320} height={460} rx={10} fill="#E9EEF2" stroke={C.ink} strokeWidth={8} opacity={glass} />
      <path d="M 620 240 L 680 200 M 620 300 L 740 220" stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" opacity={glass} />
      <Cast id="person.stand" x={640} y={400} size={170} flip opacity={0.3 * ramp(t, bottom.at - 0.3, 0.5)} />
      <Cast id="person.point" x={240} y={360} size={300} at={s.start + 0.2} dur={0.6} />
      <line x1={180} y1={680} x2={940} y2={680} stroke={C.ink} strokeWidth={5} opacity={glass} />
      <Label x={720} y={770} text={bottom.text} p={ramp(t, bottom.at, 0.35)} size={64} italic />
      <Draw d="M 560 795 L 880 795" at={bottom.at + 0.2} dur={0.3} color={C.accent} width={5} len={320} />
    </Stage>
  );
};

/* ------------------------------------------------------------------ *
 * pick (V13, V20): one of a few, ticked. `options [{text, at}]` are  *
 * tinted boxes (or `art` people); `pick` is the index, ticked on      *
 * `pickAt`; `name {text, at}` names the answer. `question {text, at}` *
 * sits on top ("who would you pick?").                               *
 * ------------------------------------------------------------------ */
const Pick: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const opts = s.options as { text: string; at: number; art?: string }[];
  const n = opts.length, pick = s.pick ?? n - 1, q = s.question as T | undefined, name = s.name as T | undefined;
  const people = opts.some((o) => o.art);
  const xs = opts.map((_, i) => 700 + (i - (n - 1) / 2) * (people ? 420 : 330));
  return (
    <Stage box={box} vw={1400} vh={860} enter={ramp(t, s.start, 0.4)}>
      {q && <Label x={700} y={110} text={q.text} p={ramp(t, q.at, 0.35)} size={66} />}
      {opts.map((o, i) => {
        const p = ramp(t, o.at, 0.35), dim = s.pickAt != null && i !== pick ? 1 - 0.45 * ramp(t, s.pickAt, 0.4) : 1;
        return <g key={i} opacity={p * dim}>
          {o.art
            ? <Cast id={o.art} x={xs[i] - 150} y={200} size={300} at={o.at} dur={0.6} />
            : <rect x={xs[i] - 120} y={300} width={240} height={240} rx={10} fill={TINTS[i % TINTS.length]} stroke={C.ink} strokeWidth={5} />}
          <Label x={xs[i]} y={people ? 600 : 250} text={o.text} p={p} size={56} />
        </g>;
      })}
      {s.pickAt != null && <Tick x={xs[pick] + (people ? 110 : 30)} y={people ? 300 : 410} r={people ? 70 : 110} at={s.pickAt} color={C.accent} width={people ? 12 : 16} />}
      {name && <Label x={700} y={people ? 720 : 650} text={name.text} p={ramp(t, name.at, 0.35)} size={64} italic />}
    </Stage>
  );
};

/* ------------------------------------------------------------------ *
 * trap (V16): our person runs at a lure on a stick, toward a hole    *
 * they can't see. `lure {text, at}`, `hole {text, at}`.              *
 * ------------------------------------------------------------------ */
const Trap: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const lure = s.lure as T, hole = s.hole as T | undefined;
  const run = ease(clamp01((t - s.start - 0.3) / 3.5));
  const px = 150 + run * 330, bob = Math.sin(t * 9) * 6;
  return (
    <Stage box={box} vw={1400} vh={800} enter={ramp(t, s.start, 0.4)}>
      <path d="M 40 560 L 780 560 L 800 680 Q 880 740 960 680 L 980 560 L 1360 560" fill="none" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <Cast id="person.run" x={px} y={360 + bob} size={200} at={s.start} dur={0.4} />
      <path d={`M ${px + 120} ${380 + bob} Q ${px + 400} 160 ${px + 560} 220`} fill="none" stroke={C.ink} strokeWidth={5} opacity={ramp(t, lure.at - 0.2, 0.3)} />
      <line x1={px + 560} y1={220} x2={px + 560} y2={300} stroke={C.ink} strokeWidth={3} opacity={ramp(t, lure.at, 0.3)} />
      <Chip x={px + 560} y={340 + Math.sin(t * 3) * 8} text={lure.text} p={ramp(t, lure.at, 0.35)} tone="accent" size={44} />
      {hole && <Label x={880} y={780} text={hole.text} p={ramp(t, hole.at, 0.35)} size={56} color={RED} />}
    </Stage>
  );
};

/* ------------------------------------------------------------------ *
 * ramp (V21): what you know carries over. A flat line turns up into  *
 * an arrow (`to {text, at}` at its tip); our person carries a box     *
 * (`carry`) up it; `left` words trail behind as speed lines.          *
 * ------------------------------------------------------------------ */
const Ramp: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const to = s.to as T, left = (s.left ?? []) as T[];
  const up = ease(clamp01((t - s.start - 0.6) / 3));
  const px = 520 + up * 260, py = 470 - up * 150;
  return (
    <Stage box={box} vw={1400} vh={800} enter={ramp(t, s.start, 0.4)}>
      <Draw d="M 60 640 L 560 600 Q 700 590 1240 200 M 1196 206 L 1244 196 L 1228 244" at={s.start + 0.1} dur={0.8} color={C.ink} width={6} len={1500} />
      <g transform={`translate(${px} ${py})`}>
        <Cast id="person.carry" x={0} y={0} size={200} at={s.start + 0.3} dur={0.6} />
        {s.carry && <text x={100} y={130} textAnchor="middle" opacity={ramp(t, s.start + 0.8, 0.3)} style={{ fontFamily: C.fonts.plain, fontWeight: 500, fontSize: 26, fill: C.ink }}>{s.carry}</text>}
      </g>
      {left.map((l, i) => <g key={i} opacity={ramp(t, l.at, 0.35)}>
        <text x={px - 40} y={py + 90 + i * 60} textAnchor="end" style={{ fontFamily: C.fonts.plain, fontWeight: 500, fontSize: 38, fill: C.muted }}>{l.text}</text>
        {[0, 1, 2].map((k) => <line key={k} x1={px - 20 + k * 6} y1={py + 80 + i * 60 + k * 8 - 8} x2={px + 20 + k * 6} y2={py + 80 + i * 60 + k * 8 - 8} stroke={C.muted} strokeWidth={3} />)}
      </g>)}
      <Chip x={1150} y={140} text={to.text} p={ramp(t, to.at, 0.35)} tone="accent" size={46} />
    </Stage>
  );
};

/* ------------------------------------------------------------------ *
 * bubbles (V12): two of our people; one says something (`say`), the  *
 * other answers (`reply`) while a thought bubble disagrees (`think`). *
 * ------------------------------------------------------------------ */
const Bubbles: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const say = s.say as T, reply = s.reply as T | undefined, think = s.think as T | undefined;
  const bubble = (x: number, y: number, text: string, p: number, tail: number, thought = false) => {
    const w = Math.max(280, text.length * 22 + 80);
    return <g opacity={p} transform={`translate(0 ${(1 - p) * 14})`}>
      <rect x={x - w / 2} y={y - 50} width={w} height={100} rx={50} fill={thought ? C.accentSoft : C.card} stroke={C.ink} strokeWidth={4} strokeDasharray={thought ? "10 8" : undefined} />
      {thought
        ? <><circle cx={tail} cy={y + 80} r={14} fill={C.accentSoft} stroke={C.ink} strokeWidth={3} /><circle cx={tail + 14} cy={y + 115} r={8} fill={C.accentSoft} stroke={C.ink} strokeWidth={3} /></>
        : <path d={`M ${tail - 16} ${y + 48} L ${tail} ${y + 90} L ${tail + 18} ${y + 48}`} fill={C.card} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />}
      <text x={x} y={y + 14} textAnchor="middle" style={{ fontFamily: C.fonts.plain, fontWeight: 500, fontSize: 40, fill: C.ink }}>{text}</text>
    </g>;
  };
  return (
    <Stage box={box} vw={1400} vh={860} enter={ramp(t, s.start, 0.4)}>
      <Cast id="person.talk" x={300} y={420} size={320} at={s.start + 0.1} dur={0.6} />
      <Cast id="person.listen" x={780} y={420} size={320} flip at={s.start + 0.3} dur={0.6} />
      {bubble(400, 320, say.text, ramp(t, say.at, 0.35), 450)}
      {reply && bubble(960, 320, reply.text, ramp(t, reply.at, 0.35), 930)}
      {think && bubble(1000, 120, think.text, ramp(t, think.at, 0.35), 1060, true)}
    </Stage>
  );
};

/* ------------------------------------------------------------------ *
 * event (V18): what happened vs the story we tell about it. `event   *
 * {text, at}` left of a dashed line, `reaction [{text, at}]` chips   *
 * escalating on the right, `control {text, at}` under the gap.       *
 * ------------------------------------------------------------------ */
const Event: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const ev = s.event as T, re = (s.reaction ?? []) as T[], ctl = s.control as T | undefined;
  return (
    <Stage box={box} vw={1500} vh={760} enter={ramp(t, s.start, 0.4)}>
      <Chip x={300} y={320} text={ev.text} p={ramp(t, ev.at, 0.35)} size={56} />
      <Label x={300} y={430} text={s.eventLabel ?? ""} p={ramp(t, ev.at, 0.35)} size={50} color={C.muted} />
      <line x1={600} y1={140} x2={600} y2={520} stroke={C.muted} strokeWidth={4} strokeDasharray="14 12" opacity={ramp(t, s.start + 0.2, 0.3)} />
      {re.map((r, i) => {
        const x = 800 + i * 270;
        return <g key={i}>
          {i > 0 && <Draw d={`M ${x - 175} 320 L ${x - 120} 320 M ${x - 136} 308 L ${x - 118} 320 L ${x - 136} 332`} at={r.at - 0.2} dur={0.25} color={C.muted} width={4} len={120} />}
          <Chip x={x} y={320} text={r.text} p={ramp(t, r.at, 0.35)} tone={i === re.length - 1 ? "accent" : "card"} size={50 + i * 4} />
        </g>;
      })}
      {ctl && <>
        <Draw d="M 420 560 Q 600 680 780 560 M 600 620 L 600 600" at={ctl.at} dur={0.45} color={C.ink} width={5} len={500} />
        <Label x={600} y={710} text={ctl.text} p={ramp(t, ctl.at + 0.2, 0.35)} size={60} italic />
      </>}
    </Stage>
  );
};

/* ------------------------------------------------------------------ *
 * steps (V8): the chaos, then the few steps that replace it. A       *
 * scribble labelled `chaos {text, at}` above an arrow with `steps    *
 * [{text, at}]` as filled circles on it.                              *
 * ------------------------------------------------------------------ */
const Steps: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const steps = s.steps as T[], chaos = s.chaos as T | undefined;
  const n = steps.length, xs = steps.map((_, i) => 300 + (i * 800) / Math.max(1, n - 1));
  let d = "M 620 230";
  for (let i = 0; i < 40; i++) d += ` L ${620 + (hash(i) - 0.5) * 260} ${230 + (hash(i + 99) - 0.5) * 180}`;
  return (
    <Stage box={box} vw={1400} vh={800} enter={ramp(t, s.start, 0.4)}>
      {chaos && <>
        <Draw d={d} at={chaos.at} dur={0.9} color={C.ink} width={4} len={9000} />
        <Label x={700} y={80} text={chaos.text} p={ramp(t, chaos.at, 0.35)} size={58} />
        {[[480, 200], [900, 180], [560, 340]].map(([qx, qy], i) => <Label key={i} x={qx} y={qy} text="?" p={ramp(t, chaos.at + 0.5 + i * 0.1, 0.3)} size={70} color={C.muted} />)}
      </>}
      <Draw d="M 140 560 L 1290 560 M 1262 540 L 1292 560 L 1262 580" at={steps[0].at - 0.4} dur={0.5} color={C.ink} width={6} len={1300} />
      {steps.map((st, i) => {
        const p = ramp(t, st.at, 0.35), r = 95;
        return <g key={i} opacity={p} transform={`translate(${xs[i]} 560) scale(${0.7 + 0.3 * p})`}>
          <circle r={r} fill={C.accentTint} stroke={C.ink} strokeWidth={5} />
          <text y={16} textAnchor="middle" style={{ fontFamily: C.fonts.plain, fontWeight: 500, fontSize: Math.min(44, (2 * r - 30) / Math.max(4, st.text.length) * 1.8), fill: C.ink }}>{st.text}</text>
        </g>;
      })}
    </Stage>
  );
};

/* ------------------------------------------------------------------ *
 * tightrope (V10): our person balancing on a rope between two cliffs; *
 * `bad [text]` ✗ under the left sign (`from`), `good [text]` ✓ under *
 * the right (`to`), each list on its `at`.                            *
 * ------------------------------------------------------------------ */
const Tightrope: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const from = s.from as T & { items?: string[] }, to = s.to as T & { items?: string[] };
  const sway = Math.sin(t * 2.2) * 5;
  const list = (x: number, items: string[] = [], at: number, good: boolean) => items.map((it, i) => (
    <g key={i} opacity={ramp(t, at + 0.2 + i * 0.15, 0.3)}>
      <text x={x} y={560 + i * 56} style={{ fontFamily: C.fonts.plain, fontWeight: 500, fontSize: 38, fill: good ? C.ink : C.muted }}>{good ? "✓" : "✗"} {it}</text>
    </g>));
  return (
    <Stage box={box} vw={1500} vh={840} enter={ramp(t, s.start, 0.4)}>
      <path d="M 0 420 L 420 420 L 390 840 L 0 840 Z" fill={C.card} stroke={C.ink} strokeWidth={5} />
      <path d="M 1500 420 L 1080 420 L 1110 840 L 1500 840 Z" fill={C.card} stroke={C.ink} strokeWidth={5} />
      <path d="M 420 420 Q 750 500 1080 420" fill="none" stroke={C.ink} strokeWidth={4} />
      <g transform={`rotate(${sway} 750 470)`}><Cast id="person.cheer" x={650} y={275} size={200} at={s.start + 0.2} dur={0.6} /></g>
      <Label x={210} y={380} text={from.text} p={ramp(t, from.at, 0.35)} size={60} color={C.muted} />
      <Label x={1290} y={380} text={to.text} p={ramp(t, to.at, 0.35)} size={60} italic />
      {list(50, from.items, from.at, false)}
      {list(1140, to.items, to.at, true)}
    </Stage>
  );
};

export const SWIPE_SCENES: Record<string, View> = {
  swap: Swap, equation: Equation, curve: Curve, stack: Stack, stopwatch: Stopwatch, spotlight: Spotlight, keylock: Keylock,
  path: Path, bucket: Bucket, tree: Tree, sprout: Sprout, table: Table, mirror: Mirror, pick: Pick, trap: Trap, ramp: Ramp,
  bubbles: Bubbles, event: Event, steps: Steps, tightrope: Tightrope,
};
