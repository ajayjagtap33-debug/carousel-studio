// Scene types that draw the idea itself rather than captioning it (Ajay, 2026-10-30, after Nick Saraev's recent
// videos: videos/reference/2026-10-30-nick-saraev-recent/teardown.md). Each one is a picture made for a kind of
// sentence: a section title on a departures board, labels pointing at things in his own shot, a month that
// shrinks into a decade. Same contract as scenes.tsx: absolute cut times, every element lands on its word.
import React from "react";
import { Easing, Img, interpolate, staticFile } from "remotion";
import { Icon, SHADOW, clamp01, ramp, useC, useNow } from "./kit";
import type { Box, Face, SScene } from "./scenes";

type View = React.FC<{ s: SScene; box: Box; face: Face }>;
const W = 1920, H = 1080;
const ease = Easing.inOut(Easing.cubic);

/** Deterministic noise, so a still and the render agree frame for frame. */
const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/** A path that draws itself on from `at` over `dur`. */
const Draw: React.FC<{ d: string; at: number; dur?: number; color: string; width?: number; len?: number }> =
({ d, at, dur = 0.5, color, width = 4, len = 1400 }) => {
  const p = ramp(useNow(), at, dur);
  return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round"
    strokeDasharray={len} strokeDashoffset={len * (1 - p)} />;
};

/* ------------------------------------------------------------------ *
 * flap: a split-flap departures board. `steps: [{at, lines: [..]}]`;  *
 * each step flips every tile to its new letter, left to right.        *
 * Nick titles his sections this way; we use one board per video.     *
 * ------------------------------------------------------------------ */
const GLYPHS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const Flap: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const steps = s.steps as { at: number; lines: string[] }[];
  const rows = s.rows ?? Math.max(...steps.map((st) => st.lines.length));
  const cols = s.cols ?? Math.max(...steps.flatMap((st) => st.lines.map((l) => l.length)));
  const gap = 8;
  const tw = Math.min(s.tile ?? 112, Math.floor((Math.min(box.w - 120, 1500) - gap * (cols - 1)) / cols));
  const th = Math.round(tw * 1.42);
  const lineOf = (st: { lines: string[] } | undefined, r: number) => (st?.lines[r] ?? "").toUpperCase().padEnd(cols, " ");
  const enter = ramp(t, steps[0].at - 0.35, 0.4);

  const tile = (r: number, c: number) => {
    // the step in force, and the one before it, for this tile
    let k = -1;
    for (let i = 0; i < steps.length; i++) if (t >= steps[i].at + c * 0.03 + r * 0.07) k = i;
    const target = k < 0 ? " " : lineOf(steps[k], r)[c];
    const from = k <= 0 ? " " : lineOf(steps[k - 1], r)[c];
    const start = k < 0 ? 0 : steps[k].at + c * 0.03 + r * 0.07;
    const spin = from === target ? 0 : 0.28 + hash(r * 31 + c * 7 + k) * 0.22; // seconds of shuffling
    const shuffling = k >= 0 && t < start + spin;
    const ch = shuffling ? GLYPHS[1 + Math.floor(hash(Math.floor(t * 22) + r * 13 + c * 5) * 36)] : target;
    const flick = shuffling ? (t * 22) % 1 : 1; // the top flap falling, once per letter
    return (
      <div key={c} style={{ width: tw, height: th, position: "relative", borderRadius: 7, overflow: "hidden",
        background: "#232523", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 3px rgba(0,0,0,0.35)" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: C.fonts.plain, fontWeight: 600, fontSize: tw * 0.78, color: "#F1F0EA", lineHeight: 1,
          transform: `scaleY(${0.82 + 0.18 * flick})` }}>{ch}</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: "50%", background: "rgba(0,0,0,0.16)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 2, background: "#0B0C0B" }} />
      </div>
    );
  };
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ opacity: enter, transform: `perspective(1600px) rotateX(${(1 - enter) * 14}deg) translateY(${(1 - enter) * 30}px)`,
        background: C.dark, borderRadius: 22, padding: 26, boxShadow: "0 30px 60px rgba(0,0,0,0.22)",
        display: "flex", flexDirection: "column", gap }}>
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} style={{ display: "flex", gap }}>{Array.from({ length: cols }, (_, c) => tile(r, c))}</div>
        ))}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * callouts: labels pointing at things in his own shot (his face, the  *
 * mic, the sofa behind him). Draws over the footage in frame coords:  *
 * `items: [{text, at, label: {x, y}, target: {x, y}}]` in fractions.  *
 * The line stops short of the target, so nothing lands on his face.   *
 * ------------------------------------------------------------------ */
const Callouts: View = ({ s, face }) => {
  const C = useC();
  const t = useNow();
  const items = s.items as { text: string; at: number; label: { x: number; y: number }; target: { x: number; y: number } | number[][]; wave?: boolean; side?: "left" | "right" }[];
  // targets are in source-frame fractions; a list of [t, x, y] follows him as he moves. `zoom` is the full-frame
  // punch-in in force (Studio scales him about his face), so the point lands where he is on screen.
  const zoom = s.zoom ?? 1;
  const where = (tg: { x: number; y: number } | number[][]) => {
    let x: number, y: number;
    if (!Array.isArray(tg)) ({ x, y } = tg);
    else {
      const ts = tg.map((k) => k[0]);
      x = interpolate(t, ts, tg.map((k) => k[1]), { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      y = interpolate(t, ts, tg.map((k) => k[2]), { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    }
    return { x: face.x + (x - face.x) * zoom, y: face.y + (y - face.y) * zoom };
  };
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {items.map((it, i) => {
          const tg = where(it.target);
          const lx = it.label.x * W, ly = it.label.y * H, tx = tg.x * W, ty = tg.y * H;
          const dx = tx - lx, dy = ty - ly, len = Math.hypot(dx, dy);
          const ex = tx - (dx / len) * 26, ey = ty - (dy / len) * 26; // stop short of the thing itself
          const bend = (i % 2 ? -1 : 1) * Math.min(90, len * 0.18);
          const mx = (lx + ex) / 2 - (dy / len) * bend, my = (ly + ey) / 2 + (dx / len) * bend;
          const ring = ramp(t, it.at + 0.3, 0.35);
          return (
            <g key={i}>
              {/* a dark edge under the white line, so it holds on the white wall and on his sweater alike */}
              <Draw d={`M ${lx} ${ly} Q ${mx} ${my} ${ex} ${ey}`} at={it.at} dur={0.4} color="rgba(0,0,0,0.45)" width={9} len={len * 1.4} />
              <Draw d={`M ${lx} ${ly} Q ${mx} ${my} ${ex} ${ey}`} at={it.at} dur={0.4} color="#FFFFFF" width={4.5} len={len * 1.4} />
              <circle cx={tx} cy={ty} r={14 * ring} fill="none" stroke={C.onDark} strokeWidth={4} opacity={ring} />
              <circle cx={tx} cy={ty} r={5} fill="#FFFFFF" opacity={ring} />
            </g>
          );
        })}
      </svg>
      {items.map((it, i) => {
        const p = ramp(t, it.at - 0.08, 0.32);
        const right = (it.side ?? (it.label.x > 0.5 ? "right" : "left")) === "right";
        return (
          <div key={i} style={{ position: "absolute", top: it.label.y * H, [right ? "right" : "left"]: right ? W - it.label.x * W : it.label.x * W,
            transform: `translateY(-50%) scale(${0.9 + 0.1 * p})`, transformOrigin: right ? "right center" : "left center", opacity: p,
            filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined, display: "flex", alignItems: "center", gap: 14,
            background: C.card, borderRadius: 999, padding: "14px 30px", boxShadow: "0 10px 30px rgba(0,0,0,0.25)" }}>
            {it.wave && (
              <svg width={70} height={40}>{Array.from({ length: 9 }, (_, b) => {
                const h = 8 + 28 * Math.abs(Math.sin(t * 9 + b * 1.3)) * (0.5 + 0.5 * hash(b));
                return <rect key={b} x={b * 8} y={20 - h / 2} width={4.5} height={h} rx={2.2} fill={C.accent} />;
              })}</svg>
            )}
            <span style={{ fontFamily: C.fonts.display, fontSize: 54, lineHeight: 1, color: C.ink, letterSpacing: "-0.01em" }}>{it.text}</span>
          </div>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * calendar: one month page; a day gets circled and scribbled on its   *
 * word (`mark: {day, at, note?, noteAt?}`), then on `zoomAt` the page *
 * shrinks into its cell in `years` rows of 12 months, so the month    *
 * that felt huge becomes one dot in a decade.                         *
 * ------------------------------------------------------------------ */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const Calendar: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const year: number = s.year, month: number = s.month; // month 1-12
  const mark = s.mark as { day: number; at: number; note?: string; noteAt?: number } | undefined;
  const years: number = s.years ?? 10;
  const z = s.zoomAt != null ? ease(clamp01((t - s.zoomAt) / 1.1)) : 0;

  // the month page, centred in the box
  const pw = Math.min(980, box.w - 120), cell = pw / 7;
  const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay(); // 0 = Sunday
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const ph = 150 + Math.ceil((first + days) / 7) * cell * 0.92 + 24;
  const enter = ramp(t, s.start, 0.45);

  // the decade grid it shrinks into
  const gw = Math.min(1180, box.w - 160), gcol = gw / 12, grow = Math.min(64, (H - 330) / years), gh = grow * years;
  const gx = (box.w - gw) / 2 + 40, gy = (H - gh) / 2 + 30;
  const tx = gx + (month - 1) * gcol, ty = gy; // the page's own cell: first row
  const from = { x: (box.w - pw) / 2, y: (H - ph) / 2, w: pw, h: ph };
  const to = { x: tx + 4, y: ty + 4, w: gcol - 8, h: grow - 8 };
  const r = { x: interpolate(z, [0, 1], [from.x, to.x]), y: interpolate(z, [0, 1], [from.y, to.y]),
    w: interpolate(z, [0, 1], [from.w, to.w]), h: interpolate(z, [0, 1], [from.h, to.h]) };
  const sc = r.w / from.w;
  const grid = ramp(t, (s.zoomAt ?? 1e9) + 0.5, 0.8);

  const dayPos = (d: number) => { const i = first + d - 1; return { x: (i % 7) * cell, y: 150 + Math.floor(i / 7) * cell * 0.92 }; };
  const md = mark ? dayPos(mark.day) : { x: 0, y: 0 };
  const scrib = mark ? ramp(t, mark.at, 0.55) : 0;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* decade: 12 months x N years; every cell lights in order, then the marked one */}
      <div style={{ position: "absolute", left: gx, top: gy, width: gw, height: gh, opacity: grid }}>
        {Array.from({ length: years }, (_, y) => (
          <React.Fragment key={y}>
            <div style={{ position: "absolute", left: -110, top: y * grow, height: grow, display: "flex", alignItems: "center",
              fontFamily: C.fonts.plain, fontSize: 28, color: C.muted }}>{year + y}</div>
            {Array.from({ length: 12 }, (_, m) => {
              const lit = ramp(t, (s.zoomAt ?? 0) + 0.6 + (y * 12 + m) * 0.012, 0.2);
              const here = y === 0 && m === month - 1;
              return <div key={m} style={{ position: "absolute", left: m * gcol + 4, top: y * grow + 4, width: gcol - 8, height: grow - 8,
                borderRadius: 8, background: here ? "transparent" : C.card, border: `1px solid ${C.line}`, opacity: here ? 1 : 0.35 + 0.65 * lit }} />;
            })}
          </React.Fragment>
        ))}
        {Array.from({ length: 12 }, (_, m) => (
          <div key={m} style={{ position: "absolute", top: -46, left: m * gcol, width: gcol, textAlign: "center",
            fontFamily: C.fonts.plain, fontSize: 24, color: C.muted }}>{MONTHS[m]}</div>
        ))}
      </div>
      {s.decadeLabel && (
        <div style={{ position: "absolute", left: gx, width: gw, top: gy + gh + 40, textAlign: "center", opacity: ramp(t, s.decadeLabelAt ?? s.zoomAt + 1.2, 0.4),
          fontFamily: C.fonts.display, fontSize: 72, color: C.ink, letterSpacing: "-0.015em" }}>{s.decadeLabel}</div>
      )}

      {/* the month page */}
      <div style={{ position: "absolute", left: r.x, top: r.y, width: from.w, height: from.h, transform: `scale(${sc})`, transformOrigin: "0 0",
        opacity: enter, background: C.card, border: `1px solid ${C.line}`, borderRadius: 24 / Math.max(sc, 0.2), boxShadow: SHADOW, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 44, top: 30, fontFamily: C.fonts.display, fontSize: 70, color: C.ink, letterSpacing: "-0.015em" }}>
          {LONG[month - 1]} <span style={{ color: C.muted }}>{year}</span>
        </div>
        {Array.from({ length: days }, (_, d) => {
          const p = dayPos(d + 1);
          return <div key={d} style={{ position: "absolute", left: p.x, top: p.y, width: cell, height: cell * 0.92, borderTop: `1px solid ${C.line}`,
            padding: "12px 16px", boxSizing: "border-box", fontFamily: C.fonts.plain, fontSize: 30, color: C.body }}>{d + 1}</div>;
        })}
        {/* a posting schedule: a slot lands in each planned day */}
        {s.posts && (s.posts.days as number[]).map((d, i) => {
          const q = dayPos(d), pp = ramp(t, s.posts.at + i * 0.09, 0.25);
          return <div key={d} style={{ position: "absolute", left: q.x + 14, top: q.y + cell * 0.42, width: cell - 28, height: cell * 0.34, borderRadius: 10,
            background: C.accent, opacity: pp, transform: `scale(${0.6 + 0.4 * pp})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="play" size={cell * 0.2} color="#FFF" />
          </div>;
        })}
        {s.strikeAt != null && (() => {
          const x = ramp(t, s.strikeAt, 0.45);
          return <svg width={from.w} height={from.h} style={{ position: "absolute", inset: 0 }}>
            <rect width={from.w} height={from.h} fill={C.page} opacity={0.45 * x} />
            <Draw d={`M 60 90 L ${from.w - 60} ${from.h - 60}`} at={s.strikeAt} dur={0.3} color={C.ink} width={12} len={2000} />
            <Draw d={`M ${from.w - 60} 90 L 60 ${from.h - 60}`} at={s.strikeAt + 0.25} dur={0.3} color={C.ink} width={12} len={2000} />
          </svg>;
        })()}
        {mark && (
          <svg width={from.w} height={from.h} style={{ position: "absolute", inset: 0 }}>
            <path d={`M ${md.x + cell * 0.5} ${md.y + 6} c ${cell * 0.55} -8 ${cell * 0.62} ${cell * 0.7} ${cell * 0.05} ${cell * 0.82}
                     c -${cell * 0.62} 10 -${cell * 0.7} -${cell * 0.62} -${cell * 0.1} -${cell * 0.8} c ${cell * 0.3} -10 ${cell * 0.62} 4 ${cell * 0.66} 30`}
              fill="none" stroke={C.accent} strokeWidth={6} strokeLinecap="round" strokeDasharray={900} strokeDashoffset={900 * (1 - scrib)} />
            <path d={`M ${md.x + cell * 0.22} ${md.y + cell * 0.62} l 22 -14 l 6 18 l 22 -16 l 6 18 l 22 -16 l 6 16`}
              fill="none" stroke={C.accent} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray={300} strokeDashoffset={300 * (1 - ramp(t, mark.at + 0.45, 0.4))} />
          </svg>
        )}
      </div>
      {/* the note sits outside the page so it can leave before the page shrinks */}
      {mark?.note && (() => {
        const p = ramp(t, mark.noteAt ?? mark.at + 0.8, 0.35) * (1 - z * 3);
        return <div style={{ position: "absolute", left: from.x + md.x + cell * 0.9, top: from.y + md.y - cell * 0.95, opacity: clamp01(p),
          filter: p < 1 ? `blur(${(1 - clamp01(p)) * 8}px)` : undefined, fontFamily: C.fonts.accent, fontStyle: "italic", fontSize: 76,
          color: C.accent, transform: "rotate(-4deg)", whiteSpace: "nowrap" }}>{mark.note}</div>;
      })()}
      {/* once it's a cell, the marked month keeps one accent dot */}
      <div style={{ position: "absolute", left: tx + gcol / 2 - 9, top: ty + grow / 2 - 9, width: 18, height: 18, borderRadius: 18,
        background: C.accent, opacity: ramp(t, (s.zoomAt ?? 1e9) + 0.9, 0.3) }} />
    </div>
  );
};

/** Fade + blur in on `at` (a plain inline version of kit's Enter, for absolutely placed pieces). */
const inStyle = (p: number, dy = 14): React.CSSProperties =>
  ({ opacity: p, filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined, transform: `translateY(${(1 - p) * dy}px)` });

/** Handwriting with no words in it: a row of loops that writes itself left to right. Never invented text. */
const Scrawl: React.FC<{ w: number; at: number; dur?: number; color: string; seed: number; width?: number }> = ({ w, at, dur = 0.7, color, seed, width = 3 }) => {
  let d = "M 0 14";
  for (let x = 0; x < w; x += 15) {
    const h = 6 + hash(seed * 13 + x) * 12, gapAfter = hash(seed + x * 3) > 0.86;
    d += gapAfter ? ` m 18 0` : ` q 4 ${-h} 8 0 t 7 ${2 - hash(seed + x) * 4}`;
  }
  return <svg width={w + 20} height={30}><Draw d={d} at={at} dur={dur} color={color} width={width} len={w * 3} /></svg>;
};

/* ------------------------------------------------------------------ *
 * ad: YouTube's ad chrome slides onto his own footage — the "Ad"      *
 * badge with its countdown, the yellow progress line, "Visit site"   *
 * and "Skip". Over the footage, all along the bottom edge.           *
 * ------------------------------------------------------------------ */
const Ad: View = ({ s }) => {
  const C = useC();
  const t = useNow();
  const at: number = s.at;
  const p = ramp(t, at - 0.1, 0.35), q = ramp(t, at + 0.35, 0.35);
  const left = Math.max(0, Math.ceil((s.count ?? 6) - (t - at)));
  const prog = clamp01((t - at) / ((s.end - at) + 1.5));
  const box: React.CSSProperties = { background: "rgba(0,0,0,0.62)", color: "#FFF", fontFamily: C.fonts.plain, fontWeight: 500,
    borderRadius: 6, display: "flex", alignItems: "center", gap: 14 };
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 8, background: "rgba(255,255,255,0.35)", opacity: p }}>
        <div style={{ width: `${prog * 100}%`, height: "100%", background: "#FFCC00" }} />
      </div>
      <div style={{ position: "absolute", left: 50, bottom: 50, ...inStyle(p), display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start" }}>
        <div style={{ ...box, padding: "14px 24px", fontSize: 34 }}>
          <span style={{ background: "#FFCC00", color: "#111", borderRadius: 4, padding: "2px 10px", fontWeight: 600 }}>Ad</span>
          <span>0:0{left}</span>
        </div>
        <div style={{ ...box, background: "#FFF", color: "#111", padding: "14px 26px", fontSize: 34, boxShadow: "0 6px 20px rgba(0,0,0,0.25)" }}>
          Visit site <Icon name="external-link" size={30} color="#111" />
        </div>
      </div>
      <div style={{ position: "absolute", right: 0, bottom: 64, ...inStyle(q), ...box, borderRadius: "6px 0 0 6px", padding: "20px 34px", fontSize: 38,
        border: "1px solid rgba(255,255,255,0.35)", borderRight: "none" }}>
        Skip <Icon name="skip-forward" size={34} color="#FFF" />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * journal: a notebook page writing itself (wordless scrawl). `rec`    *
 * closes viewfinder corners round it with a ticking REC; `old` makes  *
 * it a yellowed page, `marks` underlines lines, `warm` rolls in a     *
 * film-grain glow (nostalgia).                                        *
 * ------------------------------------------------------------------ */
const Journal: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const old = !!s.old;
  const pw = Math.min(980, box.w - 200), ph = 620, lines = s.lines ?? 9;
  const ink = old ? "#6B5A43" : "#2D3A5C";
  const enter = ramp(t, s.start, 0.5);
  const rec = s.recAt != null ? ramp(t, s.recAt, 0.45) : 0;
  const warm = s.warmAt != null ? ramp(t, s.warmAt, 1.0) : 0;
  const lineAt = (i: number) => (s.writeAt ?? s.start + 0.2) + i * (s.pace ?? 0.32);
  const secs = s.recAt != null ? Math.max(0, Math.floor(t - s.recAt)) : 0;
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "relative", width: pw, height: ph, opacity: enter,
        transform: `perspective(1800px) rotateX(${10 - 4 * enter}deg) rotateZ(${old ? -2.5 : -1.2}deg) translateY(${(1 - enter) * 40}px)`,
        background: old ? "linear-gradient(160deg,#F4E9CF,#E8D6AE)" : "#FFFFFF", borderRadius: 10,
        boxShadow: "0 2px 4px rgba(0,0,0,0.06), 0 30px 60px rgba(40,30,10,0.16)", overflow: "hidden" }}>
        {/* the margin and the rules */}
        <div style={{ position: "absolute", left: 96, top: 0, bottom: 0, width: 2, background: old ? "rgba(160,70,50,0.35)" : "rgba(214,90,90,0.45)" }} />
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, top: 80 + i * 58, height: 1.5, background: old ? "rgba(110,90,60,0.22)" : "rgba(80,120,190,0.22)" }} />
        ))}
        {Array.from({ length: lines - 1 }, (_, i) => {
          const w = (pw - 190) * (i === lines - 2 ? 0.45 : 0.72 + hash(i * 7 + (old ? 3 : 0)) * 0.26);
          const hl = (s.marks as { lines: number[]; at: number } | undefined);
          const mark = hl && hl.lines.includes(i) ? ramp(t, hl.at + hl.lines.indexOf(i) * 0.25, 0.35) : 0;
          return (
            <div key={i} style={{ position: "absolute", left: 124, top: 80 + i * 58 - 30 }}>
              {mark > 0 && <div style={{ position: "absolute", left: -8, top: 8, height: 30, width: (w + 16) * mark, background: C.accentTint, opacity: 0.85, borderRadius: 4 }} />}
              <div style={{ position: "relative" }}><Scrawl w={w} at={lineAt(i)} dur={0.5} color={ink} seed={i + (old ? 40 : 0)} /></div>
            </div>
          );
        })}
        {/* nostalgia: a warm glow and grain over the page */}
        {warm > 0 && <div style={{ position: "absolute", inset: 0, opacity: warm * 0.55,
          background: "radial-gradient(ellipse at 40% 35%, rgba(255,214,150,0.55), rgba(150,90,30,0.45))", mixBlendMode: "multiply" }} />}
        {warm > 0 && <svg width={pw} height={ph} style={{ position: "absolute", inset: 0, opacity: warm * 0.35 }}>
          {Array.from({ length: 260 }, (_, i) => <circle key={i} cx={hash(i + Math.floor(t * 12) * 0.37) * pw} cy={hash(i * 3.1 + Math.floor(t * 12)) * ph} r={1.2} fill="#5a4020" />)}
        </svg>}
      </div>
      {/* on camera: viewfinder corners close in, REC starts */}
      {rec > 0 && (() => {
        const pad = 70 - 30 * rec, L = 70;
        const fw = pw + pad * 2, fh = ph + pad * 2;
        const corner = (x: number, y: number, sx: number, sy: number) =>
          <path d={`M ${x} ${y + sy * L} L ${x} ${y} L ${x + sx * L} ${y}`} fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />;
        return (
          <div style={{ position: "absolute", left: "50%", top: "50%", width: fw, height: fh, marginLeft: -fw / 2, marginTop: -fh / 2, opacity: rec }}>
            <svg width={fw} height={fh} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              {corner(0, 0, 1, 1)}{corner(fw, 0, -1, 1)}{corner(0, fh, 1, -1)}{corner(fw, fh, -1, -1)}
            </svg>
            <div style={{ position: "absolute", left: 30, top: -64, display: "flex", alignItems: "center", gap: 14, fontFamily: C.fonts.plain, fontWeight: 600, fontSize: 36, color: C.ink }}>
              <div style={{ width: 22, height: 22, borderRadius: 22, background: "#E0322E", opacity: 0.4 + 0.6 * (Math.floor(t * 2) % 2) }} />
              REC <span style={{ fontWeight: 500, color: C.body, fontVariantNumeric: "tabular-nums" }}>00:00:{String(secs).padStart(2, "0")}</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * odometer: a year (or any number) rolling `from` → `to` on `at`,     *
 * every digit a drum, carries turning the next drum like a real one.  *
 * ------------------------------------------------------------------ */
const Odometer: View = ({ s }) => {
  const C = useC();
  const t = useNow();
  const from: number = s.from, to: number = s.to;
  const v = from + (to - from) * ease(clamp01((t - s.at) / (s.dur ?? 1.8)));
  const digits = String(to).length, size = s.size ?? 280, cw = size * 0.62, ch = size * 1.12;
  const enter = ramp(t, s.start, 0.45);
  const pos = (place: number) => {
    const unit = 10 ** place;
    const base = Math.floor(v / unit) % 10;
    if (place === 0) return v % 10;
    const below = v % unit, frac = Math.max(0, below - (unit - 1)); // turn only while the drum below passes 9 → 0
    return base + frac;
  };
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40 }}>
      <div style={{ display: "flex", gap: 14, opacity: enter, transform: `translateY(${(1 - enter) * 30}px)` }}>
        {Array.from({ length: digits }, (_, i) => {
          const place = digits - 1 - i, p = pos(place);
          return (
            <div key={i} style={{ width: cw, height: ch, overflow: "hidden", position: "relative", borderRadius: 18, background: C.card,
              border: `1px solid ${C.line}`, boxShadow: `${SHADOW}, inset 0 18px 24px -18px rgba(0,0,0,0.18), inset 0 -18px 24px -18px rgba(0,0,0,0.18)` }}>
              <div style={{ position: "absolute", left: 0, right: 0, top: -p * ch }}>
                {Array.from({ length: 11 }, (_, d) => (
                  <div key={d} style={{ height: ch, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: C.fonts.display,
                    fontSize: size, lineHeight: 1, color: C.ink }}>{d % 10}</div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {s.sub && <div style={{ ...inStyle(ramp(t, s.subAt ?? s.at + 1.6, 0.4)), fontFamily: C.fonts.display, fontSize: 64, color: C.body }}>{s.sub}</div>}
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * phone: an iPhone in one of three states. `rec` = camera, the button  *
 * presses on `recAt`, the timer runs, an upload bar fills to Published *
 * on `publishAt`. `call` = incoming call (`name`). `feed` = reels      *
 * flicking up, one every `every` seconds (`srcs`).                      *
 * ------------------------------------------------------------------ */
const Phone: View = ({ s }) => {
  const C = useC();
  const t = useNow();
  const mode = s.mode as "rec" | "call" | "feed";
  const pw = 440, ph = 900, enter = ramp(t, s.start, 0.5);
  const screen = (() => {
    if (mode === "rec") {
      const rec = s.recAt != null ? ramp(t, s.recAt, 0.25) : 0;
      const secs = s.recAt != null ? Math.max(0, Math.floor(t - s.recAt)) : 0;
      const up = s.publishAt != null ? clamp01((t - s.publishAt) / 1.3) : 0, done = s.publishAt != null && t > s.publishAt + 1.35;
      return (
        <>
          {s.src && <Img src={staticFile(s.src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 60%, rgba(0,0,0,0.55))" }} />
          {[1, 2].map((k) => <div key={k} style={{ position: "absolute", left: (pw * k) / 3, top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.28)" }} />)}
          {[1, 2].map((k) => <div key={k} style={{ position: "absolute", top: (ph * k) / 3, left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.28)" }} />)}
          <div style={{ position: "absolute", top: 70, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
            <div style={{ background: rec > 0 ? "#E0322E" : "rgba(0,0,0,0.45)", color: "#FFF", fontFamily: C.fonts.plain, fontWeight: 600, fontSize: 30,
              padding: "6px 18px", borderRadius: 10, fontVariantNumeric: "tabular-nums" }}>00:00:{String(secs).padStart(2, "0")}</div>
          </div>
          <div style={{ position: "absolute", bottom: 70, left: "50%", marginLeft: -54, width: 108, height: 108, borderRadius: 108, border: "6px solid #FFF",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 84 - 40 * rec, height: 84 - 40 * rec, borderRadius: 84 - 70 * rec, background: "#E0322E" }} />
          </div>
          {up > 0 && (
            <div style={{ position: "absolute", left: 30, right: 30, bottom: 220, background: "rgba(255,255,255,0.96)", borderRadius: 22, padding: "24px 26px",
              ...inStyle(ramp(t, s.publishAt - 0.15, 0.3)), fontFamily: C.fonts.plain, fontSize: 30, color: C.ink, fontWeight: 500 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Icon name={done ? "circle-check" : "upload"} size={34} color={done ? C.accent : C.ink} /> {done ? "Published" : "Uploading"}
              </div>
              <div style={{ marginTop: 16, height: 10, borderRadius: 10, background: C.line }}>
                <div style={{ width: `${up * 100}%`, height: "100%", borderRadius: 10, background: done ? C.accent : "#E0322E" }} />
              </div>
            </div>
          )}
        </>
      );
    }
    if (mode === "call") {
      const pulse = (t * 1.3) % 1;
      return (
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#3A3F3A,#151715)", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ marginTop: 150, fontFamily: C.fonts.plain, fontSize: 28, color: "rgba(255,255,255,0.65)" }}>{s.sub ?? "mobile"}</div>
          <div style={{ marginTop: 8, fontFamily: C.fonts.display, fontSize: 76, color: "#FFF", letterSpacing: "-0.01em" }}>{s.name}</div>
          <div style={{ marginTop: 50, width: 150, height: 150, borderRadius: 150, background: "rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="user" size={80} color="rgba(255,255,255,0.85)" />
          </div>
          <div style={{ position: "absolute", bottom: 110, left: 60, right: 60, display: "flex", justifyContent: "space-between" }}>
            {[["#E0322E", "phone-off"], ["#33C25A", "phone"]].map(([bg, ic], k) => (
              <div key={k} style={{ position: "relative", width: 110, height: 110 }}>
                {k === 1 && <div style={{ position: "absolute", inset: -24 * pulse, borderRadius: 200, border: "3px solid #33C25A", opacity: 1 - pulse }} />}
                <div style={{ width: 110, height: 110, borderRadius: 110, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name={ic} size={50} color="#FFF" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    // feed: reels flicking up
    const srcs = s.srcs as string[], every = s.every ?? 0.7;
    const k = Math.max(0, (t - (s.feedAt ?? s.start + 0.3)) / every);
    const n = Math.floor(k), f = ease(clamp01((k - n) / 0.35));
    return (
      <div style={{ position: "absolute", inset: 0, background: "#000" }}>
        {[n, n + 1].map((i, j) => (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, height: ph, top: (j - f) * ph }}>
            <Img src={staticFile(srcs[i % srcs.length])} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", right: 22, bottom: 160, display: "flex", flexDirection: "column", gap: 34, alignItems: "center" }}>
              {["heart", "message-circle", "send"].map((ic) => <Icon key={ic} name={ic} size={46} color="#FFF" />)}
            </div>
          </div>
        ))}
      </div>
    );
  })();
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 80 }}>
      <div style={{ position: "relative", width: pw + 28, height: ph + 28, borderRadius: 78, background: "#121312", padding: 14, boxSizing: "border-box",
        boxShadow: "0 40px 80px rgba(0,0,0,0.25)", opacity: enter, transform: `perspective(2000px) rotateY(${(1 - enter) * -18}deg) translateY(${(1 - enter) * 50}px)` }}>
        <div style={{ position: "relative", width: pw, height: ph, borderRadius: 64, overflow: "hidden", background: "#222" }}>
          {screen}
          <div style={{ position: "absolute", top: 18, left: "50%", marginLeft: -70, width: 140, height: 40, borderRadius: 40, background: "#000" }} />
        </div>
      </div>
      {s.logo && <Img src={staticFile(s.logo)} style={{ height: 90, opacity: ramp(t, s.logoAt ?? s.start + 0.4, 0.4) }} />}
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * radar: skills on axes; a grey "before" shape, and an accent shape   *
 * that grows out along each axis as he names it.                      *
 * ------------------------------------------------------------------ */
const Radar: View = ({ s }) => {
  const C = useC();
  const t = useNow();
  const axes = s.axes as { label: string; at: number }[];
  const n = axes.length, R = s.r ?? 300, cx = 0, cy = 0;
  const pt = (i: number, r: number) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / n; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; };
  const base = s.base ?? 0.3, top = s.top ?? 0.9;
  const enter = ramp(t, s.start, 0.45);
  const vals = axes.map((a) => base + (top - base) * ramp(t, a.at, 0.5));
  const poly = (v: number[]) => v.map((r, i) => pt(i, r * R).join(",")).join(" ");
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={R * 2 + 520} height={R * 2 + 200} viewBox={`${-R - 260} ${-R - 100} ${R * 2 + 520} ${R * 2 + 200}`} style={{ opacity: enter, overflow: "visible" }}>
        {[0.25, 0.5, 0.75, 1].map((k) => <polygon key={k} points={poly(Array(n).fill(k))} fill="none" stroke={C.line} strokeWidth={2} />)}
        {axes.map((a, i) => { const [x, y] = pt(i, R); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={C.line} strokeWidth={2} />; })}
        <polygon points={poly(Array(n).fill(base))} fill="rgba(108,106,100,0.12)" stroke={C.muted} strokeWidth={3} strokeDasharray="8 8" />
        <polygon points={poly(vals)} fill={C.accentTint} fillOpacity={0.55} stroke={C.accent} strokeWidth={5} strokeLinejoin="round" />
        {vals.map((r, i) => { const [x, y] = pt(i, r * R); return <circle key={i} cx={x} cy={y} r={9} fill={C.accent} opacity={ramp(t, axes[i].at, 0.3)} />; })}
        {axes.map((a, i) => {
          const [x, y] = pt(i, R + 54), p = ramp(t, a.at - 0.1, 0.35);
          const anchor = Math.abs(x) < 10 ? "middle" : x > 0 ? "start" : "end";
          return <text key={i} x={x} y={y + 14} textAnchor={anchor} opacity={p} style={{ fontFamily: C.fonts.display, fontSize: 52, fill: C.ink }}>{a.label}</text>;
        })}
      </svg>
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * receipt: a till slip printing out of a slot, one line per item.     *
 * ------------------------------------------------------------------ */
const Receipt: View = ({ s }) => {
  const C = useC();
  const t = useNow();
  const items = s.items as { text: string; right?: string; at: number }[];
  const rw = 560, lh = 60, head = 140, foot = s.total ? 150 : 40;
  const shown = items.filter((it) => t >= it.at - 0.05).length;
  const full = head + items.length * lh + foot;
  const target = head + shown * lh + (s.total && t >= s.total.at ? foot : 30);
  // paper feeds out as lines print; ease toward the target length
  const feed = Math.min(full, target - 30 + 30 * ramp(t, (items[Math.max(0, shown - 1)]?.at ?? s.start), 0.25));
  const enter = ramp(t, s.start, 0.4);
  const zig = Array.from({ length: 29 }, (_, i) => `${i * 20},${i % 2 ? 0 : 14}`).join(" ");
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", opacity: enter }}>
      <div style={{ position: "absolute", top: 120, width: rw + 120, height: 46, borderRadius: 14, background: C.dark, boxShadow: "0 12px 24px rgba(0,0,0,0.2)", zIndex: 2 }} />
      <div style={{ position: "absolute", top: 146, width: rw, height: feed, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: full, background: "#FFFFFF", boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
          fontFamily: C.fonts.mono, color: C.ink, padding: "0 40px", boxSizing: "border-box" }}>
          <div style={{ height: head, display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: 26, borderBottom: `3px dashed ${C.line}` }}>
            <div style={{ fontSize: 40, fontWeight: 500 }}>{s.title ?? "Receipt"}</div>
          </div>
          {items.map((it, i) => (
            <div key={i} style={{ height: lh, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 34 }}>
              <span>{it.text}</span><span style={{ color: C.accent }}>{it.right ?? "✓"}</span>
            </div>
          ))}
          {s.total && (
            <div style={{ height: foot, borderTop: `3px dashed ${C.line}`, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 38, fontWeight: 500 }}>
              <span>{s.total.text}</span><span>{s.total.right}</span>
            </div>
          )}
          <svg width={rw} height={14} style={{ position: "absolute", left: 0, bottom: -1 }}><polyline points={zig} fill={C.page} stroke="none" /></svg>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * morph: a lumpy grey form becomes a clean, sharp one (Nick's prompt  *
 * v1 → v9), shaded like an object, turning slowly. Labels swap from   *
 * `fromLabel` to `toLabel`; a YouTube scrub bar fills on `barAt`.     *
 * ------------------------------------------------------------------ */
const Morph: View = ({ s }) => {
  const C = useC();
  const t = useNow();
  const m = ease(clamp01((t - s.morphAt) / (s.dur ?? 1.6)));
  const R = 230, spin = t * 0.25, N = 180;
  const path = Array.from({ length: N + 1 }, (_, i) => {
    const a = (i / N) * Math.PI * 2;
    const lumpy = 0.16 * Math.sin(3 * a + 1.3) + 0.11 * Math.sin(5 * a + 0.4) + 0.08 * Math.sin(8 * a + 2.1) + 0.05 * Math.sin(13 * a);
    const star = 0.22 * Math.cos(6 * (a + spin));
    const r = R * (1 + lumpy * (1 - m) + star * m);
    return `${i ? "L" : "M"} ${Math.cos(a) * r} ${Math.sin(a) * r}`;
  }).join(" ") + " Z";
  const enter = ramp(t, s.start, 0.45);
  const bar = s.barAt != null ? ease(clamp01((t - s.barAt) / 2.2)) : 0;
  const l1 = 1 - ramp(t, s.morphAt, 0.4), l2 = ramp(t, s.morphAt + (s.dur ?? 1.6) * 0.7, 0.4);
  const fill = interpolate(m, [0, 1], [0, 1]);
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <svg width={760} height={620} viewBox="-380 -300 760 620" style={{ opacity: enter, transform: `scale(${0.9 + 0.1 * enter})` }}>
        <defs>
          <radialGradient id="mshade" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor={fill > 0.5 ? "#FFFFFF" : "#E4E3DE"} />
            <stop offset="55%" stopColor={fill > 0.5 ? C.accentTint : "#A9A7A0"} />
            <stop offset="100%" stopColor={fill > 0.5 ? C.accent : "#6E6C66"} />
          </radialGradient>
        </defs>
        <ellipse cx={0} cy={285} rx={230} ry={22} fill="rgba(0,0,0,0.12)" />
        <path d={path} fill="url(#mshade)" style={{ filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.18))" }} />
      </svg>
      <div style={{ position: "relative", height: 90, width: 700, marginTop: 10 }}>
        {[[s.fromLabel, l1], [s.toLabel, l2]].map(([txt, o], k) => (
          <div key={k} style={{ position: "absolute", inset: 0, textAlign: "center", opacity: o as number, fontFamily: C.fonts.display, fontSize: 80, color: C.ink }}>{txt}</div>
        ))}
      </div>
      {s.barAt != null && (
        <div style={{ width: 900, marginTop: 40, opacity: ramp(t, s.barAt - 0.2, 0.3), position: "relative", height: 10, borderRadius: 10, background: "rgba(0,0,0,0.12)" }}>
          <div style={{ width: `${bar * 100}%`, height: "100%", borderRadius: 10, background: "#FF0033" }} />
          <div style={{ position: "absolute", left: `calc(${bar * 100}% - 13px)`, top: -8, width: 26, height: 26, borderRadius: 26, background: "#FF0033" }} />
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * resume: a paper CV of grey placeholder lines with one real line      *
 * (`line`) that gets the highlighter on `at`; `noteAt` adds a drawn   *
 * arrow toward his card and a short `note`.                            *
 * ------------------------------------------------------------------ */
const Resume: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const enter = ramp(t, s.start, 0.45);
  const hl = ramp(t, s.at, 0.45);
  const bar = (w: number, k: number, dark = false) => <div key={k} style={{ height: 14, width: w, borderRadius: 7, background: dark ? "#CFCDC6" : "#E6E4DE", marginTop: 16 }} />;
  const right = (s.toward ?? "right") === "right";
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 620, height: 820, background: C.card, borderRadius: 8, boxShadow: "0 2px 4px rgba(0,0,0,0.05), 0 30px 60px rgba(0,0,0,0.12)", padding: "60px 56px",
        boxSizing: "border-box", opacity: enter, marginTop: 60, transform: `rotate(${right ? -1.5 : 1.5}deg) translateY(${(1 - enter) * 40}px)` }}>
        <div style={{ fontFamily: C.fonts.display, fontSize: 64, color: C.ink }}>{s.title ?? "Resume"}</div>
        {bar(300, 0, true)}
        <div style={{ height: 2, background: C.line, margin: "34px 0 6px" }} />
        {[440, 380, 470, 300].map((w, k) => bar(w, k + 1))}
        <div style={{ height: 2, background: C.line, margin: "34px 0 6px" }} />
        <div style={{ position: "relative", display: "inline-block", marginTop: 22, padding: "2px 8px" }}>
          <div style={{ position: "absolute", inset: 0, background: C.accentTint, transform: `scaleX(${hl})`, transformOrigin: "left", borderRadius: 4 }} />
          <span style={{ position: "relative", fontFamily: C.fonts.plain, fontSize: 38, fontWeight: 500, color: C.ink }}>{s.line}</span>
        </div>
        {[410, 350, 430, 260].map((w, k) => bar(w, k + 10))}
      </div>
      {s.noteAt != null && (
        <div style={{ position: "absolute", [right ? "right" : "left"]: 30, top: 70, ...inStyle(ramp(t, s.noteAt, 0.4)), display: "flex", flexDirection: "column", alignItems: right ? "flex-end" : "flex-start", gap: 6 }}>
          <div style={{ fontFamily: C.fonts.display, fontStyle: "italic", fontSize: 64, color: C.accent }}>{s.note}</div>
          <svg width={160} height={60} style={{ transform: right ? undefined : "scaleX(-1)" }}><Draw d="M 6 14 Q 80 60 148 30 M 128 18 L 150 30 L 130 46" at={s.noteAt + 0.2} dur={0.45} color={C.accent} width={5} len={360} /></svg>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * lengths: things drawn to scale as bars. A bar with `run` keeps      *
 * growing off the edge of the board.                                  *
 * ------------------------------------------------------------------ */
const Lengths: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const rows = s.rows as { label: string; at: number; w: number; run?: boolean; tone?: "accent" | "muted" }[];
  const x0 = 80;
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 70, overflow: "hidden" }}>
      {rows.map((r, i) => {
        const p = ramp(t, r.at - 0.1, 0.35);
        const grow = r.run ? Math.max(0, t - r.at) * 900 : ease(clamp01((t - r.at) / 0.6)) * r.w;
        const acc = r.tone === "accent";
        return (
          <div key={i} style={{ paddingLeft: x0 }}>
            <div style={{ ...inStyle(p), fontFamily: C.fonts.display, fontSize: 70, color: C.ink, marginBottom: 18 }}>{r.label}</div>
            <div style={{ height: 70, width: grow, borderRadius: 14, background: acc ? C.accent : "#CFCDC6",
              boxShadow: acc ? "0 10px 24px rgba(78,102,54,0.25)" : undefined }} />
          </div>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * shelf: video spines slide onto a shelf one by one and stay (a        *
 * library). `bubblesAt` puts a conversation beside it first: bubbles  *
 * that rise and fade. `years` ticks under the shelf.                  *
 * ------------------------------------------------------------------ */
const SPINE = ["#E8E4DA", "#4E6636", "#2B2D2A", "#C9D6AC", "#D9D4C7", "#7A7768", "#EDF1E3", "#3D3D3A"];
const Shelf: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const books = s.books as { title?: string; at: number; h?: number }[];
  const conv = s.bubblesAt != null;
  const sw = conv ? box.w * 0.55 : Math.min(1300, box.w - 120);
  const shelfY = 760, bw = 92;
  const yr = s.years as { from: number; to: number; at: number } | undefined;
  const year = yr ? Math.round(yr.from + (yr.to - yr.from) * clamp01((t - yr.at) / 2.4)) : null;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {conv && (
        <div style={{ position: "absolute", left: 40, width: box.w * 0.36, top: 0, bottom: 0 }}>
          {Array.from({ length: 6 }, (_, i) => {
            const born = s.bubblesAt + i * 0.45, age = t - born;
            if (age < 0) return null;
            const y = 820 - age * 130, o = clamp01(age / 0.25) * clamp01(1 - (age - 1.6) / 1.2);
            const mine = i % 2 === 1;
            return <div key={i} style={{ position: "absolute", top: y, [mine ? "right" : "left"]: 0, opacity: o, width: 200 + hash(i) * 180, height: 64,
              borderRadius: 32, background: mine ? C.accent : C.card, border: mine ? "none" : `1px solid ${C.line}`, boxShadow: SHADOW,
              display: "flex", alignItems: "center", padding: "0 26px", gap: 10 }}>
              {[0.5, 0.3].map((f, k) => <div key={k} style={{ height: 10, flex: f, borderRadius: 5, background: mine ? "rgba(255,255,255,0.6)" : "#E0DED8" }} />)}
            </div>;
          })}
          {s.leftLabel && <div style={{ position: "absolute", bottom: 90, width: "100%", textAlign: "center", ...inStyle(ramp(t, s.leftLabelAt ?? s.bubblesAt, 0.4)),
            fontFamily: C.fonts.display, fontSize: 64, color: C.muted }}>{s.leftLabel}</div>}
        </div>
      )}
      <div style={{ position: "absolute", left: conv ? box.w - sw - 30 : (box.w - sw) / 2, width: sw, top: 0, bottom: 0 }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: shelfY, height: 26, borderRadius: 6, background: "linear-gradient(#C9B89A,#A8977A)",
          boxShadow: "0 14px 24px rgba(0,0,0,0.18)", opacity: ramp(t, s.start, 0.4) }} />
        <div style={{ position: "absolute", left: 30, bottom: H - shelfY, display: "flex", alignItems: "flex-end", gap: 10 }}>
          {books.map((b, i) => {
            const p = ease(clamp01((t - b.at) / 0.45)), h = b.h ?? 360 + hash(i * 5) * 160;
            const bg = SPINE[i % SPINE.length], dark = ["#4E6636", "#2B2D2A", "#7A7768", "#3D3D3A"].includes(bg);
            return (
              <div key={i} style={{ position: "relative", width: b.title ? bw + 26 : bw, height: h, borderRadius: 6, background: bg, opacity: p,
                transform: `translateX(${(1 - p) * 300}px) rotate(${(1 - p) * 8}deg)`, transformOrigin: "bottom center",
                boxShadow: "inset -6px 0 0 rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {/* the title runs up the spine: lay it out at the spine's height, then turn it */}
                {b.title && <div style={{ position: "absolute", left: "50%", top: "50%", width: h - 40, marginLeft: -(h - 40) / 2, marginTop: -20, height: 40,
                  transform: "rotate(-90deg)", whiteSpace: "nowrap", fontFamily: C.fonts.plain, fontWeight: 500, fontSize: 30, lineHeight: "40px", textAlign: "center",
                  color: dark ? "#F4F4EE" : C.ink, overflow: "hidden", textOverflow: "ellipsis" }}>{b.title}</div>}
              </div>
            );
          })}
        </div>
        {year != null && <div style={{ position: "absolute", top: shelfY + 60, left: 0, right: 0, textAlign: "center", ...inStyle(ramp(t, yr!.at - 0.2, 0.35)),
          fontFamily: C.fonts.display, fontSize: 80, color: C.ink, fontVariantNumeric: "tabular-nums" }}>{year}</div>}
        {s.rightLabel && <div style={{ position: "absolute", top: shelfY + 60, left: 0, right: 0, textAlign: "center", ...inStyle(ramp(t, s.rightLabelAt, 0.4)),
          fontFamily: C.fonts.display, fontSize: 64, color: C.ink }}>{s.rightLabel}</div>}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * search: the same video turning up in several places — a panel per   *
 * surface (`logo`, `name`, `at`), each with the typed query and a      *
 * result card (`thumb`, `title`, `by`).                                *
 * ------------------------------------------------------------------ */
const Search: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const panels = s.panels as { logo: string; name: string; at: number; kind?: "answer" }[];
  const gap = 30, pw = Math.floor((Math.min(box.w - 80, 1640) - gap * (panels.length - 1)) / panels.length);
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap }}>
      {panels.map((p, i) => {
        const e = ramp(t, p.at - 0.1, 0.4);
        const typed = s.query.slice(0, Math.floor(clamp01((t - p.at) / 0.7) * s.query.length));
        const res = ramp(t, p.at + 0.8, 0.35);
        return (
          <div key={i} style={{ width: pw, background: C.card, border: `1px solid ${C.line}`, borderRadius: 24, boxShadow: SHADOW, padding: 28, boxSizing: "border-box",
            ...inStyle(e, 30) }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
              <Img src={staticFile(p.logo)} style={{ height: 44 }} />
              <span style={{ fontFamily: C.fonts.plain, fontWeight: 500, fontSize: 34, color: C.ink }}>{p.name}</span>
            </div>
            <div style={{ border: `2px solid ${C.line}`, borderRadius: 999, padding: "14px 22px", display: "flex", alignItems: "center", gap: 12,
              fontFamily: C.fonts.plain, fontSize: 28, color: C.body, minHeight: 36 }}>
              <Icon name="search" size={28} color={C.muted} />{typed}<span style={{ opacity: Math.floor(t * 3) % 2 ? 1 : 0 }}>|</span>
            </div>
            <div style={{ marginTop: 24, ...inStyle(res) }}>
              {p.kind === "answer" && <div style={{ marginBottom: 14 }}>{[0.95, 0.8, 0.6].map((f, k) => <div key={k} style={{ height: 12, width: `${f * 100}%`, borderRadius: 6, background: "#E6E4DE", marginTop: 12 }} />)}</div>}
              <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${C.line}` }}>
                <Img src={staticFile(s.thumb)} style={{ width: "100%", display: "block" }} />
                <div style={{ padding: "14px 16px", fontFamily: C.fonts.plain, fontSize: 26, fontWeight: 500, color: C.ink, lineHeight: 1.25 }}>
                  {s.title}<div style={{ fontWeight: 400, fontSize: 24, color: C.muted, marginTop: 4 }}>{s.by}</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const IDEA_SCENES: Record<string, View> = {
  flap: Flap, callouts: Callouts, calendar: Calendar, ad: Ad, journal: Journal, odometer: Odometer, phone: Phone,
  radar: Radar, receipt: Receipt, morph: Morph, resume: Resume, lengths: Lengths, shelf: Shelf, search: Search,
};
export const IDEA_OVER = ["callouts", "ad"];
