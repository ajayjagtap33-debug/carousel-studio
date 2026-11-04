// Reel scene types: pictures built for a product reel, drawn in the reel's 960-wide stage. Same contract as the
// studio scenes (absolute cut times, every element lands on its word). First user: the AEO & GEO checklist reel
// (videos/2026-10-30-demo-checklist-reel), where the product is a Google Sheet, so `sheet` rebuilds it clean.
import React from "react";
import { Easing, Img, staticFile } from "remotion";
import { SHADOW, clamp01, ramp, useC, useNow } from "../studio/kit";
import type { Box, Face, SScene } from "../studio/scenes";

type View = React.FC<{ s: SScene; box: Box; face: Face }>;
const ease = Easing.inOut(Easing.cubic);
const inStyle = (p: number, dy = 18): React.CSSProperties =>
  ({ opacity: p, filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined, transform: `translateY(${(1 - p) * dy}px)` });
const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/* The checklist's own colours: it's a real artefact, so it keeps them in either theme. */
const RED = "#B0171C", INK = "#1E1E1E", GRID = "#D9D9D9", FONT = "Inter, Arial, sans-serif";
const CHIP: Record<string, [string, string]> = {
  High: ["#D4EBCB", "#3E7A2E"], Medium: ["#CFE2F5", "#2F65A3"], Low: ["#FBE6A6", "#8A6A00"],
  "Not Started": ["#F8D3D0", "#B0302A"], Completed: ["#D4EBCB", "#3E7A2E"], "In Progress": ["#E6D6F5", "#6B3FA0"], "": ["#ECECEC", "#ECECEC"],
};
const Pill: React.FC<{ v: string; w: number; on?: number }> = ({ v, w, on = 1 }) => {
  const [bg, fg] = CHIP[v] ?? CHIP[""];
  return <div style={{ width: w, height: 44, borderRadius: 22, background: on > 0.5 ? bg : "#EFEFEF", color: on > 0.5 ? fg : "transparent",
    fontFamily: FONT, fontSize: 28, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center",
    transform: `scale(${0.9 + 0.1 * on})`, transition: "none" }}>{v}</div>;
};
const Box: React.FC<{ on: number }> = ({ on }) => (
  <div style={{ width: 30, height: 30, borderRadius: 5, border: `3px solid ${on > 0 ? RED : "#F1B33C"}`, background: on > 0 ? RED : "#FFF",
    display: "flex", alignItems: "center", justifyContent: "center" }}>
    {on > 0 && <svg width={22} height={22} viewBox="0 0 22 22"><path d="M4 11 L9 16 L18 6" fill="none" stroke="#FFF" strokeWidth={3.5}
      strokeLinecap="round" strokeLinejoin="round" strokeDasharray={24} strokeDashoffset={24 * (1 - on)} /></svg>}
  </div>
);

type Row = { item?: string; pri?: string; impact?: string; status?: string; note?: string };
type Tab = { name: string; title: string; rows: Row[] };

/* ------------------------------------------------------------------ *
 * sheet: the AEO & GEO checklist, rebuilt clean. `mode`:              *
 *  table      header + section bar + rows + tab strip. `steps:        *
 *             [{at, tab}]` switch tabs; `chipsAt` lights the chips    *
 *             row by row; `ticks: [{row, at}]` tick boxes → Completed *
 *  dashboard  Score Dashboard: `sections [{name, total, at}]`, the    *
 *             overall total counts up on `totalAt`                    *
 *  row        one row, big: `row`, `priAt`, `noteAt`                  *
 *  log        prompt log: grey prompt rows, an engine column per      *
 *             `engines [{logo, name, at}]` ticking down               *
 *  copies     the sheet card multiplying from `at` (`src` thumbnail)  *
 * ------------------------------------------------------------------ */
const Sheet: View = ({ s, box }) => {
  const t = useNow();
  const w = box.w - 20;
  const enter = ramp(t, s.start, 0.25);
  const mode = (s.mode ?? "table") as string;
  const card = (children: React.ReactNode, extra?: React.CSSProperties) => (
    <div style={{ position: "absolute", left: (box.w - w) / 2, width: w, top: "50%", transform: `translateY(-50%) scale(${0.96 + 0.04 * enter})`,
      opacity: enter, filter: enter < 1 ? `blur(${(1 - enter) * 12}px)` : undefined, background: "#FFF", borderRadius: 22,
      boxShadow: "0 2px 6px rgba(20,20,20,0.06), 0 24px 60px rgba(20,20,20,0.14)", overflow: "hidden", ...extra }}>{children}</div>
  );
  const head = (title: string, k = 0) => (
    <>
      <div style={{ display: "flex", justifyContent: "center", padding: "22px 0 12px" }}><Img src={staticFile("logos/tmv-red.png")} style={{ height: 44 }} /></div>
      <div style={{ background: RED, color: "#FFF", fontFamily: FONT, fontWeight: 700, fontSize: 28, textAlign: "center", padding: "12px 0" }}>
        AEO & GEO Audit Checklist | Track My Visibility</div>
      <div key={k} style={{ color: RED, fontFamily: FONT, fontWeight: 700, fontSize: 46, textAlign: "center", padding: "16px 0 14px",
        borderBottom: `2px solid ${INK}` }}>{title}</div>
    </>
  );

  if (mode === "table") {
    const tabs = s.tabs as Tab[];
    const steps = (s.steps ?? [{ at: s.start, tab: 0 }]) as { at: number; tab: number }[];
    let k = 0;
    steps.forEach((st, i) => { if (t >= st.at - 0.05) k = i; });
    const tab = tabs[steps[k].tab];
    const swap = ramp(t, steps[k].at - 0.05, 0.25);
    const cols = (s.cols ?? ["pri", "status"]) as ("pri" | "impact" | "status")[];
    const n = s.rowsShown ?? 6;
    const ticks = (s.ticks ?? []) as { row: number; at: number }[];
    const strip = (s.strip ?? tabs.map((x) => x.name)) as string[];
    const active = strip.indexOf(tab.name);
    return card(
      <>
        {head(tab.title, k)}
        <div style={{ ...inStyle(swap, 0), padding: "4px 0" }}>
          {tab.rows.slice(0, n).map((r, i) => {
            const chip = s.chipsAt != null ? ramp(t, s.chipsAt + i * 0.22, 0.2) : 1;
            const tk = ticks.find((x) => x.row === i);
            const on = tk ? ramp(t, tk.at, 0.25) : 0;
            const status = tk && on > 0.5 ? "Completed" : r.status ?? "";
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 18px", borderBottom: `1px solid ${GRID}`,
                background: on > 0.5 ? "#FBF3F2" : "#FFF" }}>
                <Box on={on} />
                <div style={{ flex: 1, minWidth: 0, fontFamily: FONT, fontSize: 33, color: INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  textDecoration: on > 0.5 ? "line-through" : undefined, textDecorationColor: "#B0171C88" }}>
                  {r.item ?? <div style={{ height: 14, width: `${55 + hash(i + k * 7) * 40}%`, borderRadius: 7, background: "#E4E4E4" }} />}
                </div>
                {cols.includes("pri") && <Pill v={r.pri ?? ""} w={140} on={chip} />}
                {cols.includes("impact") && <Pill v={r.impact ?? ""} w={140} on={chip} />}
                {cols.includes("status") && <Pill v={status} w={186} />}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 6, padding: "14px 14px", background: "#F4F4F4", borderTop: `1px solid ${GRID}`, overflow: "hidden" }}>
          {strip.map((name, i) => (
            <div key={i} style={{ flexShrink: 0, padding: "8px 16px", borderRadius: 8, fontFamily: FONT, fontSize: 26, fontWeight: i === active ? 700 : 500,
              color: i === active ? RED : "#555", background: i === active ? "#FFF" : "transparent",
              boxShadow: i === active ? `inset 0 -4px 0 ${RED}, 0 1px 3px rgba(0,0,0,0.12)` : undefined }}>{name}</div>
          ))}
        </div>
      </>,
    );
  }

  if (mode === "window") {
    const rp = ramp(t, s.ringAt ?? 1e9, 0.35);
    return card(
      <>
        <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "30px 30px 14px" }}>
          <div style={{ width: 62, height: 80, borderRadius: 8, background: "#1FA463", position: "relative", flexShrink: 0 }}>
            <div style={{ position: "absolute", left: 13, right: 13, top: 26, bottom: 18, border: "4px solid #FFF", borderRadius: 3 }} />
            <div style={{ position: "absolute", left: 13, right: 13, top: 40, height: 4, background: "#FFF" }} />
            <div style={{ position: "absolute", left: 27, top: 26, bottom: 18, width: 4, background: "#FFF" }} />
          </div>
          <div style={{ position: "relative", fontFamily: FONT, fontSize: 40, lineHeight: 1.2, color: INK, padding: "4px 12px" }}>
            {s.title}
            <div style={{ position: "absolute", inset: -6, borderRadius: 14, border: `5px solid ${RED}`, opacity: rp, transform: `scale(${1.06 - 0.06 * rp})` }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 26, padding: "0 30px 24px 114px", fontFamily: FONT, fontSize: 28, color: "#444" }}>
          {["File", "Edit", "View", "Insert", "Format", "Data", "Tools"].map((x) => <span key={x}>{x}</span>)}
        </div>
        {head(s.section ?? "Score Dashboard")}
        {[0, 1, 2].map((r) => <div key={r} style={{ height: 58, borderBottom: `1px solid ${GRID}`, display: "flex", alignItems: "center", padding: "0 24px" }}>
          <div style={{ height: 16, width: `${45 + hash(r) * 35}%`, borderRadius: 8, background: "#E4E4E4" }} /></div>)}
      </>,
    );
  }

  if (mode === "dashboard") {
    const secs = s.sections as { name: string; total: number; at: number }[];
    const tp = ramp(t, s.totalAt, 1.0);
    return card(
      <>
        {head("Score Dashboard")}
        <div style={{ display: "flex", padding: "14px 28px", fontFamily: FONT, fontWeight: 700, fontSize: 26, color: RED, borderBottom: `1px solid ${GRID}` }}>
          <div style={{ flex: 1 }}>Sections</div><div style={{ width: 200, textAlign: "right" }}>Total items</div></div>
        {secs.map((x, i) => {
          const p = ramp(t, x.at, 0.3);
          return (
            <div key={i} style={{ ...inStyle(p, 14), display: "flex", padding: "14px 28px", fontFamily: FONT, fontSize: 30, color: INK, borderBottom: `1px solid ${GRID}` }}>
              <div style={{ flex: 1, fontWeight: 600 }}>{x.name}</div>
              <div style={{ width: 200, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{x.total}</div>
            </div>
          );
        })}
        <div style={{ display: "flex", alignItems: "baseline", padding: "20px 28px 26px", background: tp > 0 ? "#FBF3F2" : "#FFF" }}>
          <div style={{ flex: 1, fontFamily: FONT, fontWeight: 800, fontSize: 34, color: RED }}>OVERALL TOTAL</div>
          <div style={{ width: 260, textAlign: "right", fontFamily: FONT, fontWeight: 800, fontSize: 84, lineHeight: 1, color: RED,
            fontVariantNumeric: "tabular-nums", opacity: ramp(t, s.totalAt - 0.1, 0.2) }}>{Math.round(s.total * Easing.out(Easing.cubic)(tp))}</div>
        </div>
      </>,
    );
  }

  if (mode === "row") {
    const r = s.row as Row & { category?: string };
    const pp = ramp(t, s.priAt, 0.25), np = ramp(t, s.noteAt, 0.4);
    return card(
      <div style={{ padding: "40px 44px 46px" }}>
        {r.category && <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 30, color: "#666", marginBottom: 18 }}>{r.category}</div>}
        <div style={{ display: "flex", gap: 22, alignItems: "flex-start" }}>
          <div style={{ marginTop: 10, transform: "scale(1.4)" }}><Box on={0} /></div>
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 52, lineHeight: 1.18, color: INK, letterSpacing: "-0.01em" }}>{r.item}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 34, marginLeft: 64 }}>
          <div style={{ transform: `scale(${1.3 + 0.12 * Math.sin(Math.PI * clamp01((t - s.priAt) / 0.35))})`, transformOrigin: "left center",
            boxShadow: pp > 0 ? `0 0 0 ${6 * pp}px rgba(62,122,46,0.18)` : undefined, borderRadius: 19 }}><Pill v={r.pri ?? ""} w={150} /></div>
        </div>
        <div style={{ marginTop: 40, marginLeft: 64, ...inStyle(np, 16) }}>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 28, color: RED, marginBottom: 10 }}>Notes</div>
          <div style={{ position: "relative", display: "inline", fontFamily: FONT, fontSize: 44, lineHeight: 1.3, color: INK,
            backgroundImage: "linear-gradient(#FCE38A,#FCE38A)", backgroundRepeat: "no-repeat", backgroundPosition: "0 85%",
            backgroundSize: `${ease(clamp01((t - s.noteAt - 0.25) / 0.5)) * 100}% 45%` }}>{r.note}</div>
        </div>
      </div>,
    );
  }

  if (mode === "log") {
    const engines = s.engines as { logo: string; name: string; at: number }[];
    const rows = s.rows ?? 5;
    return card(
      <>
        <div style={{ background: RED, color: "#FFF", fontFamily: FONT, fontWeight: 700, fontSize: 30, textAlign: "center", padding: "18px 0" }}>{s.title ?? "AI Prompt Testing Log"}</div>
        <div style={{ display: "flex", alignItems: "center", padding: "16px 22px", borderBottom: `2px solid ${INK}`, fontFamily: FONT, fontWeight: 700, fontSize: 26, color: RED }}>
          <div style={{ flex: 1 }}>Prompt</div>
          {engines.map((e, i) => (
            <div key={i} style={{ width: 150, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, ...inStyle(ramp(t, e.at - 0.1, 0.3), 10) }}>
              <Img src={staticFile(e.logo)} style={{ height: 50, width: 50, objectFit: "contain" }} />
              <div style={{ fontSize: 20, color: INK, fontWeight: 600 }}>{e.name}</div>
            </div>
          ))}
        </div>
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} style={{ display: "flex", alignItems: "center", padding: "18px 22px", borderBottom: `1px solid ${GRID}` }}>
            <div style={{ flex: 1 }}><div style={{ height: 16, width: `${50 + hash(r * 3) * 40}%`, borderRadius: 8, background: "#E4E4E4" }} /></div>
            {engines.map((e, i) => {
              const p = ramp(t, e.at + 0.1 + r * 0.09, 0.18);
              const hit = hash(r * 11 + i * 5) > 0.35;
              return <div key={i} style={{ width: 150, display: "flex", justifyContent: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: 20, background: hit ? "#D4EBCB" : "#F8D3D0", color: hit ? "#3E7A2E" : "#B0302A",
                  fontFamily: FONT, fontWeight: 800, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: p, transform: `scale(${0.6 + 0.4 * p})` }}>{hit ? "✓" : "✕"}</div>
              </div>;
            })}
          </div>
        ))}
      </>,
    );
  }

  if (mode === "copies") {
    // one card, then copies fanning out behind it, faster and faster
    const age = Math.max(0, t - s.at);
    const n = Math.min(s.max ?? 14, 1 + Math.floor(age * age * 5));
    const cw = w * 0.78;
    return (
      <div style={{ position: "absolute", inset: 0, opacity: enter }}>
        {Array.from({ length: n }, (_, i) => {
          const j = n - 1 - i; // draw the back ones first
          const born = j === 0 ? 0 : Math.sqrt(j / 5);
          const p = j === 0 ? 1 : ease(clamp01((age - born) / 0.3));
          const dx = (hash(j * 3) - 0.5) * 420 * p, dy = (hash(j * 7) - 0.5) * 560 * p, rot = (hash(j * 13) - 0.5) * 22 * p;
          return (
            <div key={j} style={{ position: "absolute", left: (box.w - cw) / 2, top: 540 - cw * 0.3, width: cw,
              transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(${1 - 0.04 * Math.min(j, 5) * p})`, opacity: j === 0 ? 1 : p * 0.95 }}>
              <div style={{ background: "#FFF", borderRadius: 14, padding: 10, boxShadow: "0 2px 6px rgba(0,0,0,0.08), 0 18px 40px rgba(0,0,0,0.16)" }}>
                <Img src={staticFile(s.src)} style={{ width: "100%", display: "block", borderRadius: 8 }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

/* ------------------------------------------------------------------ *
 * answer: an AI answer that names your site. One card per engine     *
 * (`cards [{logo, name, at}]`), grey answer lines, then a source chip *
 * `site` that gets ringed. Lines only: no invented answer text.      *
 * ------------------------------------------------------------------ */
const Answer: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const cards = s.cards as { logo: string; name: string; at: number }[];
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 30 }}>
      {cards.map((c, i) => {
        const p = ramp(t, c.at - 0.1, 0.35), ring = ramp(t, c.at + 0.45, 0.3);
        return (
          <div key={i} style={{ width: box.w - 60, background: C.card, borderRadius: 26, padding: "28px 32px", boxShadow: SHADOW, border: `1px solid ${C.line}`,
            boxSizing: "border-box", ...inStyle(p, 30) }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
              <Img src={staticFile(c.logo)} style={{ height: 52, width: 52, objectFit: "contain" }} />
              <div style={{ fontFamily: C.fonts.plain, fontWeight: 600, fontSize: 38, color: C.ink }}>{c.name}</div>
            </div>
            {[0.96, 0.88, 0.62].map((f, k) => <div key={k} style={{ height: 16, width: `${f * 100}%`, borderRadius: 8, background: "#E7E5E0", marginTop: 14 }} />)}
            <div style={{ display: "flex", gap: 14, marginTop: 26 }}>
              {["", s.site ?? "your site", ""].map((x, k) => (
                <div key={k} style={{ height: 52, minWidth: x ? 0 : 120, padding: x ? "0 24px" : 0, borderRadius: 26, display: "flex", alignItems: "center",
                  fontFamily: C.fonts.plain, fontWeight: 600, fontSize: 30, color: x ? C.accent : "transparent",
                  background: x ? C.accentSoft : "#F0EFEB", boxShadow: x ? `0 0 0 ${4 * ring}px ${C.accent}` : undefined,
                  transform: x ? `scale(${1 + 0.08 * Math.sin(Math.PI * ring)})` : undefined }}>{x}</div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const REEL_SCENES: Record<string, View> = { sheet: Sheet, answer: Answer };
