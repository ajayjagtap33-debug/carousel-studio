// Explainer scenes (2026-10-31, batch 1 of visuals/plan.md): the pictures his AEO and AI-workflow videos need every
// time — the article that proves it, the sources an answer pulls from, the pipeline, the acronym, fresh beating old.
// Mostly after Nick Saraev's second-brain video (videos/reference/2026-10-31-nick-saraev-second-brain/teardown.md).
// Same contract as scenes.tsx: absolute cut times, every element lands on its word. Placeholder text is grey bars,
// never invented words: every real word on screen comes from the scene's fields.
import React from "react";
import { Easing, Img, staticFile } from "remotion";
import { Icon, SHADOW, clamp01, ramp, useC, useNow } from "./kit";
import type { Box, Face, SScene } from "./scenes";
import { Draw, inStyle } from "./scenes-idea";

type View = React.FC<{ s: SScene; box: Box; face: Face }>;
const ease = Easing.inOut(Easing.cubic);

/** A fixed `w`×`h` design canvas, scaled down to the box and centred: HTML and SVG share one coordinate space. */
const Fit: React.FC<{ box: Box; w: number; h: number; children: React.ReactNode }> = ({ box, w, h, children }) => {
  const k = Math.min(1, (box.w - 80) / w, 1000 / h);
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: w * k, height: h * k, position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, transform: `scale(${k})`, transformOrigin: "0 0" }}>{children}</div>
      </div>
    </div>
  );
};

/** Grey placeholder lines: the shape of text without inventing any. */
const Bars: React.FC<{ widths: number[]; h?: number; gap?: number; color?: string }> = ({ widths, h = 14, gap = 16, color = "#E6E4DE" }) => (
  <>{widths.map((w, i) => <div key={i} style={{ height: h, width: w, borderRadius: h / 2, background: color, marginTop: gap }} />)}</>
);

/** A logo from public/ or a lucide icon, sized to fit a tile. */
const Mark: React.FC<{ logo?: string; icon?: string; size: number; color?: string }> = ({ logo, icon, size, color }) =>
  logo ? <Img src={staticFile(logo)} style={{ width: size, height: size, objectFit: "contain" }} /> : <Icon name={icon ?? "file-text"} size={size} color={color} />;

/* ------------------------------------------------------------------ *
 * article: a web page as evidence. `site`, `title`, and the one real  *
 * `line` that gets the highlighter on `at`; on `pullAt` the page      *
 * slides left and dims and the line is pulled out as a quote card.   *
 * With `src` (a real screenshot) the page is the image and `hl:       *
 * {x, y, w, h}` (fractions of it) is the highlighter box instead.    *
 * ------------------------------------------------------------------ */
const Article: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const enter = ramp(t, s.start, 0.45), hl = ramp(t, s.at, 0.5);
  const pull = s.pullAt != null ? ease(clamp01((t - s.pullAt) / 0.6)) : 0;
  const W = 1500, H = 900, pw = 700;
  const pageX = (W - pw) / 2 - (s.pullAt != null ? 330 * pull : 0);
  const hlBox = s.hl as { x: number; y: number; w: number; h: number } | undefined;
  return (
    <Fit box={box} w={W} h={H}>
      <div style={{ position: "absolute", left: pageX, top: 60, width: pw, ...inStyle(enter, 30), opacity: enter * (1 - 0.35 * pull),
        background: C.card, borderRadius: 14, boxShadow: "0 2px 4px rgba(0,0,0,0.05), 0 30px 60px rgba(0,0,0,0.12)", overflow: "hidden" }}>
        <div style={{ height: 54, background: "#F1F0EC", display: "flex", alignItems: "center", gap: 10, padding: "0 22px", borderBottom: `1px solid ${C.line}` }}>
          {[0, 1, 2].map((i) => <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: "#D6D4CE" }} />)}
          {s.site && <div style={{ marginLeft: 18, flex: 1, height: 32, borderRadius: 16, background: C.card, display: "flex", alignItems: "center", padding: "0 18px",
            fontFamily: C.fonts.plain, fontSize: 24, color: C.muted }}>{s.site}</div>}
        </div>
        {s.src ? (
          <div style={{ position: "relative" }}>
            <Img src={staticFile(s.src)} style={{ width: "100%", display: "block" }} />
            {hlBox && <div style={{ position: "absolute", left: `${hlBox.x * 100}%`, top: `${hlBox.y * 100}%`, width: `${hlBox.w * 100}%`, height: `${hlBox.h * 100}%`,
              background: C.accentTint, mixBlendMode: "multiply", transform: `scaleX(${hl})`, transformOrigin: "left", borderRadius: 4 }} />}
          </div>
        ) : (
          <div style={{ padding: "40px 52px 56px" }}>
            {s.title && <div style={{ fontFamily: C.fonts.display, fontSize: 56, lineHeight: 1.08, color: C.ink }}>{s.title}</div>}
            <Bars widths={[220]} color="#CFCDC6" gap={22} />
            <div style={{ height: 1, background: C.line, margin: "30px 0 6px" }} />
            <Bars widths={[560, 590, 520]} />
            <div style={{ position: "relative", marginTop: 22, padding: "4px 8px" }}>
              <div style={{ position: "absolute", inset: 0, background: C.accentTint, transform: `scaleX(${hl})`, transformOrigin: "left", borderRadius: 4 }} />
              <span style={{ position: "relative", fontFamily: C.fonts.plain, fontWeight: 500, fontSize: 36, lineHeight: 1.3, color: C.ink }}>{s.line}</span>
            </div>
            <Bars widths={[580, 540, 600, 380]} />
          </div>
        )}
      </div>
      {s.pullAt != null && (
        <div style={{ position: "absolute", right: 40, top: 0, bottom: 0, width: 620, display: "flex", flexDirection: "column", justifyContent: "center",
          ...inStyle(ramp(t, s.pullAt + 0.15, 0.45), 30) }}>
          <div style={{ background: C.card, borderRadius: 18, boxShadow: SHADOW, border: `1px solid ${C.line}`, padding: "44px 48px", position: "relative" }}>
            <div style={{ position: "absolute", left: 30, top: -34, fontFamily: C.fonts.display, fontSize: 150, lineHeight: 1, color: C.accent }}>“</div>
            <div style={{ fontFamily: C.fonts.display, fontSize: 60, lineHeight: 1.12, color: C.ink }}>{s.line}</div>
            {s.site && <div style={{ marginTop: 26, fontFamily: C.fonts.plain, fontSize: 28, color: C.muted }}>{s.site}</div>}
          </div>
        </div>
      )}
    </Fit>
  );
};

/* ------------------------------------------------------------------ *
 * sources: where an answer comes from. `items [{name, logo?, icon?,   *
 * at}]` land in a row on their words; on `hub.at` each one wires into *
 * the hub card (`hub {text, icon?, at}`) and the hub lights up.      *
 * ------------------------------------------------------------------ */
const Sources: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const items = s.items as { name: string; logo?: string; icon?: string; at: number }[];
  const hub = s.hub as { text: string; icon?: string; at: number };
  const n = items.length, W = Math.max(1000, n * 250 + 100), H = 800, tile = 150, y0 = 100, hubY = 570, hubW = 560, hubH = 150;
  const xs = items.map((_, i) => (n === 1 ? W / 2 : 150 + (i * (W - 300)) / (n - 1)));
  const lit = ramp(t, hub.at + 0.12 * n + 0.2, 0.35);
  return (
    <Fit box={box} w={W} h={H}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {xs.map((x, i) => (
          <Draw key={i} d={`M ${x} ${y0 + tile + 70} C ${x} ${hubY - 90} ${W / 2} ${hubY - 140} ${W / 2} ${hubY}`}
            at={hub.at + i * 0.12} dur={0.5} color={C.accent} width={4} len={900} />
        ))}
      </svg>
      {items.map((it, i) => {
        const p = ramp(t, it.at, 0.35);
        return (
          <div key={i} style={{ position: "absolute", left: xs[i] - 125, top: y0, width: 250, display: "flex", flexDirection: "column", alignItems: "center", ...inStyle(p, 24) }}>
            <div style={{ width: tile, height: tile, borderRadius: 32, background: C.card, border: `1px solid ${C.line}`, boxShadow: SHADOW,
              display: "flex", alignItems: "center", justifyContent: "center" }}><Mark logo={it.logo} icon={it.icon} size={76} /></div>
            <div style={{ marginTop: 18, fontFamily: C.fonts.plain, fontWeight: 500, fontSize: 42, color: C.ink, textAlign: "center", lineHeight: 1.1 }}>{it.name}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: (W - hubW) / 2, top: hubY, width: hubW, height: hubH, borderRadius: 24, background: lit > 0.5 ? C.dark : C.card,
        border: `2px solid ${lit > 0.5 ? C.dark : C.line}`, boxShadow: SHADOW, display: "flex", alignItems: "center", justifyContent: "center", gap: 22,
        ...inStyle(ramp(t, hub.at - 0.1, 0.35), 20) }}>
        <Icon name={hub.icon ?? "database"} size={62} color={lit > 0.5 ? C.onDark : C.ink} />
        <div style={{ fontFamily: C.fonts.display, fontSize: 70, color: lit > 0.5 ? "#FFFFFF" : C.ink }}>{hub.text}</div>
      </div>
    </Fit>
  );
};

/* ------------------------------------------------------------------ *
 * pipeline: 2–5 nodes in a row, each an icon tile with a label,       *
 * appearing on its word; the arrow into a node draws just before it, *
 * with an optional `edge` label riding on it. The newest node is lit. *
 * `runAt` sends a dot along the whole line. `note {text, at}` is a    *
 * mono chip under it (a formula, a command). In a box under 1100 wide *
 * (split, reel) it runs top to bottom; `vertical` forces either way. *
 * ------------------------------------------------------------------ */
const Pipeline: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const nodes = s.nodes as { label: string; icon?: string; logo?: string; at: number; edge?: string }[];
  const n = nodes.length;
  const shown = nodes.filter((nd) => t >= nd.at - 0.05).length - 1;
  const run = s.runAt != null ? clamp01((t - s.runAt) / (s.runDur ?? 1.6)) : -1;
  const note = s.note as { text: string; at: number } | undefined;
  const tile = 150;
  if (s.vertical ?? box.w < 1100) {
    const W = 900, step = 230, top = 90, x = 200, H = top + n * step + (note ? 140 : 0);
    const ys = nodes.map((_, i) => top + tile / 2 + i * step);
    const runY = run >= 0 ? ys[0] + run * (ys[n - 1] - ys[0]) : null;
    return (
      <Fit box={box} w={W} h={H}>
        <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {nodes.slice(1).map((nd, k) => {
            const a = ys[k] + tile / 2 + 12, b = ys[k + 1] - tile / 2 - 12;
            return <Draw key={k} d={`M ${x} ${a} L ${x} ${b} M ${x - 12} ${b - 16} L ${x} ${b} L ${x + 12} ${b - 16}`} at={nd.at - 0.3} dur={0.3} color={C.muted} width={4} len={300} />;
          })}
          {runY != null && run < 1 && <circle cx={x} cy={runY} r={12} fill={C.accent} />}
        </svg>
        {nodes.map((nd, i) => {
          const p = ramp(t, nd.at, 0.35), on = i === shown;
          return (
            <React.Fragment key={i}>
              {i > 0 && nd.edge && <div style={{ position: "absolute", left: x + 30, top: (ys[i - 1] + ys[i]) / 2 - 20, fontFamily: C.fonts.mono, fontSize: 30, color: C.body,
                ...inStyle(ramp(t, nd.at - 0.15, 0.35)) }}>{nd.edge}</div>}
              <div style={{ position: "absolute", left: x - tile / 2, top: ys[i] - tile / 2, display: "flex", alignItems: "center", gap: 40, ...inStyle(p, 20) }}>
                <div style={{ width: tile, height: tile, borderRadius: 30, background: on ? C.dark : C.card, border: `2px solid ${on ? C.dark : C.line}`, boxShadow: SHADOW,
                  display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                  <Mark logo={nd.logo} icon={nd.icon} size={70} color={on ? C.onDark : C.ink} />
                </div>
                <div style={{ fontFamily: C.fonts.display, fontSize: 64, color: on ? C.ink : C.body, whiteSpace: "nowrap" }}>{nd.label}</div>
              </div>
            </React.Fragment>
          );
        })}
        {note && <div style={{ position: "absolute", left: x - tile / 2, top: top + n * step + 20, ...inStyle(ramp(t, note.at, 0.4)), fontFamily: C.fonts.mono, fontSize: 32, color: C.ink,
          background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: "14px 26px", boxShadow: SHADOW }}>{note.text}</div>}
      </Fit>
    );
  }
  const W = Math.max(1200, n * 330), H = 640, cy = 260;
  const xs = nodes.map((_, i) => 170 + (i * (W - 340)) / Math.max(1, n - 1));
  const runX = run >= 0 ? xs[0] + run * (xs[n - 1] - xs[0]) : null;
  return (
    <Fit box={box} w={W} h={H}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {nodes.slice(1).map((nd, k) => {
          const a = xs[k] + tile / 2 + 18, b = xs[k + 1] - tile / 2 - 18;
          return <Draw key={k} d={`M ${a} ${cy} L ${b} ${cy} M ${b - 16} ${cy - 12} L ${b} ${cy} L ${b - 16} ${cy + 12}`} at={nd.at - 0.3} dur={0.3} color={C.muted} width={4} len={400} />;
        })}
        {runX != null && run < 1 && <circle cx={runX} cy={cy} r={12} fill={C.accent} />}
      </svg>
      {nodes.map((nd, i) => {
        const p = ramp(t, nd.at, 0.35), on = i === shown;
        return (
          <React.Fragment key={i}>
            {i > 0 && nd.edge && (
              <div style={{ position: "absolute", left: (xs[i - 1] + xs[i]) / 2 - 150, width: 300, top: cy - 78, textAlign: "center", ...inStyle(ramp(t, nd.at - 0.15, 0.35)) }}>
                <span style={{ fontFamily: C.fonts.mono, fontSize: 30, color: C.body, background: C.page, padding: "4px 10px", borderRadius: 8 }}>{nd.edge}</span>
              </div>
            )}
            <div style={{ position: "absolute", left: xs[i] - 150, top: cy - tile / 2, width: 300, display: "flex", flexDirection: "column", alignItems: "center", ...inStyle(p, 20) }}>
              <div style={{ width: tile, height: tile, borderRadius: 30, background: on ? C.dark : C.card, border: `2px solid ${on ? C.dark : C.line}`, boxShadow: SHADOW,
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Mark logo={nd.logo} icon={nd.icon} size={66} color={on ? C.onDark : C.ink} />
              </div>
              <div style={{ marginTop: 20, fontFamily: C.fonts.plain, fontWeight: 500, fontSize: 40, color: on ? C.ink : C.body, textAlign: "center", lineHeight: 1.15 }}>{nd.label}</div>
            </div>
          </React.Fragment>
        );
      })}
      {note && (
        <div style={{ position: "absolute", left: 0, right: 0, top: cy + 190, display: "flex", justifyContent: "center", ...inStyle(ramp(t, note.at, 0.4)) }}>
          <div style={{ fontFamily: C.fonts.mono, fontSize: 34, color: C.ink, background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: "14px 26px", boxShadow: SHADOW }}>{note.text}</div>
        </div>
      )}
    </Fit>
  );
};

/* ------------------------------------------------------------------ *
 * acronym: the letters first, big, one card each; on its word a card  *
 * opens out to the whole word, the initial staying big in the accent. *
 * `words [{word, at}]`; the newest open card is outlined. Stacks in  *
 * a box under 1100 wide (split, reel); `vertical` forces either way. *
 * ------------------------------------------------------------------ */
const Acronym: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const words = s.words as { word: string; at: number }[];
  const vert = s.vertical ?? box.w < 1100;
  const big = vert ? 130 : 150, small = vert ? 80 : 84, gap = 28, closed = vert ? 190 : 210, ch = vert ? 200 : 250;
  // Instrument Serif is condensed: about 0.5em a lowercase letter, 0.65em a capital, plus the card padding
  const restW = (w: string) => (w.length - 1) * small * 0.5 + 12;
  const openW = (w: string) => Math.max(closed, big * 0.68 + restW(w) + 100);
  const W = vert ? Math.max(900, Math.max(...words.map((w) => openW(w.word))) + 120) : Math.max(1500, words.reduce((a, w) => a + openW(w.word) + gap, 0) + 80);
  const H = vert ? words.length * (ch + gap) + 80 : 420;
  const enter = ramp(t, s.start, 0.4);
  const newest = words.filter((w) => t >= w.at).length - 1;
  return (
    <Fit box={box} w={W} h={H}>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: vert ? "column" : "row", alignItems: "center", justifyContent: "center", gap, opacity: enter }}>
        {words.map((w, i) => {
          const o = ease(clamp01((t - w.at) / 0.5));
          const width = closed + (openW(w.word) - closed) * o;
          const on = i === newest;
          return (
            <div key={i} style={{ width, height: ch, borderRadius: 26, background: C.card, border: `${on ? 3 : 1}px solid ${on ? C.accent : C.line}`, boxShadow: SHADOW,
              display: "flex", alignItems: "baseline", justifyContent: "center", paddingTop: vert ? 26 : 34, boxSizing: "border-box", overflow: "hidden",
              ...inStyle(ramp(t, s.start + i * 0.12, 0.35), 20) }}>
              <span style={{ fontFamily: C.fonts.display, fontSize: big, lineHeight: 1, color: C.accent }}>{w.word[0]}</span>
              <span style={{ fontFamily: C.fonts.display, fontSize: small, lineHeight: 1, color: C.ink, opacity: ramp(t, w.at + 0.2, 0.35), whiteSpace: "nowrap",
                maxWidth: restW(w.word) * o + 1, overflow: "hidden" }}>{w.word.slice(1)}</span>
            </div>
          );
        })}
      </div>
    </Fit>
  );
};

/* ------------------------------------------------------------------ *
 * recency: dated pages in a row (`cards [{date, at, w?}]`); from      *
 * `barsAt` a bar grows over each, taller for the fresher ones (`w`,   *
 * 0–1, default rising left to right). The tallest is lit and its card *
 * outlined. `note {text, at}` sits under the row.                    *
 * ------------------------------------------------------------------ */
const Recency: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const cards = s.cards as { date: string; at: number; w?: number }[];
  const n = cards.length, cw = 220, ch = 260, gapX = 50, W = Math.max(1000, n * (cw + gapX) + 140), H = 860, top = 420, barMax = 300;
  const ws = cards.map((c, i) => c.w ?? (i + 1) / n);
  const best = ws.indexOf(Math.max(...ws));
  const barsAt = s.barsAt ?? cards[n - 1].at + 0.5;
  const xs = cards.map((_, i) => W / 2 + (i - (n - 1) / 2) * (cw + gapX));
  const done = ramp(t, barsAt + n * 0.15 + 0.3, 0.3);
  const note = s.note as { text: string; at: number } | undefined;
  return (
    <Fit box={box} w={W} h={H}>
      {cards.map((c, i) => {
        const p = ramp(t, c.at, 0.35), g = ease(clamp01((t - barsAt - i * 0.15) / 0.55)), on = i === best;
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: xs[i] - 40, top: top - 30 - barMax * ws[i] * g, width: 80, height: barMax * ws[i] * g, borderRadius: "12px 12px 0 0",
              background: on ? C.accent : "#D6D4CE" }} />
            <div style={{ position: "absolute", left: xs[i] - cw / 2, top, width: cw, height: ch, borderRadius: 18, background: C.card, padding: "30px 26px", boxSizing: "border-box",
              border: `${on && done > 0.5 ? 3 : 1}px solid ${on && done > 0.5 ? C.accent : C.line}`, boxShadow: SHADOW, ...inStyle(p, 20) }}>
              <Icon name="file-text" size={44} color={C.muted} />
              <Bars widths={[150, 170, 120, 160]} h={12} gap={14} />
              <div style={{ position: "absolute", right: -18, top: -22, background: on ? C.accent : C.dark, color: "#FFFFFF", borderRadius: 14, padding: "6px 16px",
                fontFamily: C.fonts.plain, fontWeight: 500, fontSize: 36, boxShadow: SHADOW, whiteSpace: "nowrap" }}>{c.date}</div>
            </div>
          </React.Fragment>
        );
      })}
      {note && <div style={{ position: "absolute", left: 0, right: 0, top: top + ch + 50, textAlign: "center", fontFamily: C.fonts.display, fontStyle: "italic", fontSize: 68,
        color: C.accent, ...inStyle(ramp(t, note.at, 0.4)) }}>{note.text}</div>}
    </Fit>
  );
};

export const EXPLAIN_SCENES: Record<string, View> = {
  article: Article, sources: Sources, pipeline: Pipeline, acronym: Acronym, recency: Recency,
};
