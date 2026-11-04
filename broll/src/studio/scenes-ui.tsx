// Real UI, rebuilt clean (visuals/catalog.md → "the app it happens in"): a message thread, an inbox, an AI input box,
// a meeting recorder. First user: carousels/2026-10-31-stay-human-mix, where they stand for the AI shortcut next to
// real cutouts. Same contract as scenes.tsx: absolute times, every element on its word, every real word from the fields.
import React from "react";
import { Img, staticFile } from "remotion";
import { Icon, SHADOW, clamp01, ramp, useC, useNow } from "./kit";
import type { Box, Face, SScene } from "./scenes";
import { hash, inStyle } from "./scenes-idea";

type View = React.FC<{ s: SScene; box: Box; face: Face }>;

/** Scale a fixed design down (or up, in a carousel box) to fit the box, centred. */
const Fit: React.FC<{ box: Box; w: number; h: number; children: React.ReactNode }> = ({ box, w, h, children }) => {
  const k = Math.min(box.h ? 1.4 : 1, (box.w - 20) / w, ((box.h ?? 1080) - 20) / h);
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: w * k, height: h * k, position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, transform: `scale(${k})`, transformOrigin: "0 0" }}>{children}</div>
      </div>
    </div>
  );
};

/** A voice-note waveform: fixed bars from a seed, so a still and the render agree. */
const Wave: React.FC<{ n?: number; color: string; seed?: number }> = ({ n = 28, color, seed = 3 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 5, height: 46 }}>
    {Array.from({ length: n }, (_, i) => <div key={i} style={{ width: 6, borderRadius: 3, background: color, height: 8 + 36 * Math.abs(Math.sin(i * 0.9 + seed) * hash(i + seed)) }} />)}
  </div>
);

/* ------------------------------------------------------------------ *
 * thread: a phone chat. `messages [{from: "me"|"them", text?, voice?, *
 * at}]`; `voice` ("0:42") draws a voice note with a waveform. `title` *
 * names the chat. Mine are accent, theirs are grey.                   *
 * ------------------------------------------------------------------ */
const Thread: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const msgs = s.messages as { from: "me" | "them"; text?: string; voice?: string; at: number }[];
  const W = 760, H = 140 + msgs.length * 150;
  return (
    <Fit box={box} w={W} h={H}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 44, background: C.card, border: `2px solid ${C.line}`, boxShadow: SHADOW, overflow: "hidden", ...inStyle(ramp(t, s.start, 0.35)) }}>
        <div style={{ height: 96, display: "flex", alignItems: "center", gap: 18, padding: "0 32px", borderBottom: `1px solid ${C.line}`, background: "#F6F6F4" }}>
          <div style={{ width: 52, height: 52, borderRadius: 52, background: "#D6D4CE" }} />
          <div style={{ fontFamily: C.fonts.plain, fontWeight: 500, fontSize: 34, color: C.ink }}>{s.title ?? ""}</div>
        </div>
        <div style={{ padding: "26px 30px", display: "flex", flexDirection: "column", gap: 26 }}>
          {msgs.map((m, i) => {
            const me = m.from === "me", p = ramp(t, m.at, 0.3);
            return (
              <div key={i} style={{ alignSelf: me ? "flex-end" : "flex-start", maxWidth: 560, borderRadius: 34, padding: m.voice ? "20px 26px" : "20px 30px",
                background: me ? C.accent : "#E9E9EB", color: me ? "#FFFFFF" : C.ink, display: "flex", alignItems: "center", gap: 18,
                fontFamily: C.fonts.plain, fontWeight: 500, fontSize: 38, ...inStyle(p, 14) }}>
                {m.voice ? <>
                  <div style={{ width: 52, height: 52, borderRadius: 52, background: me ? "rgba(255,255,255,0.25)" : "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="play" size={28} color={me ? "#FFFFFF" : C.ink} />
                  </div>
                  <Wave color={me ? "rgba(255,255,255,0.9)" : C.muted} seed={i + 2} />
                  <span style={{ fontSize: 32 }}>{m.voice}</span>
                </> : m.text}
              </div>
            );
          })}
        </div>
      </div>
    </Fit>
  );
};

/* ------------------------------------------------------------------ *
 * inbox: an email list. `rows [{from, subject, at, video?, lit?}]`;   *
 * a row with `video` (an image in public/) shows it as a video        *
 * thumbnail with a play button; `lit` rows are full colour, the rest  *
 * fade to grey from `dimAt`.                                           *
 * ------------------------------------------------------------------ */
const Inbox: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const rows = s.rows as { from: string; subject: string; at: number; video?: string; lit?: boolean }[];
  const dim = s.dimAt != null ? ramp(t, s.dimAt, 0.5) : 0;
  const W = 900, rh = 120, H = 90 + rows.reduce((a, r) => a + (r.video ? 330 : rh), 0);
  return (
    <Fit box={box} w={W} h={H}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 26, background: C.card, border: `2px solid ${C.line}`, boxShadow: SHADOW, overflow: "hidden", ...inStyle(ramp(t, s.start, 0.35)) }}>
        <div style={{ height: 90, display: "flex", alignItems: "center", gap: 16, padding: "0 34px", borderBottom: `1px solid ${C.line}`, background: "#F6F6F4" }}>
          <Icon name="inbox" size={36} color={C.ink} />
          <div style={{ fontFamily: C.fonts.plain, fontWeight: 500, fontSize: 34, color: C.ink }}>{s.title ?? "Inbox"}</div>
        </div>
        {rows.map((r, i) => {
          const p = ramp(t, r.at, 0.3), o = r.lit ? 1 : 1 - 0.55 * dim;
          return (
            <div key={i} style={{ minHeight: rh, padding: "20px 34px", borderBottom: `1px solid ${C.line}`, boxSizing: "border-box", opacity: o, ...inStyle(p, 10),
              background: r.lit ? C.accentSoft : "transparent", display: "flex", gap: 26, alignItems: "center" }}>
              {r.video && (
                <div style={{ position: "relative", width: 380, height: 214, borderRadius: 14, overflow: "hidden", flex: "none", boxShadow: SHADOW }}>
                  <Img src={staticFile(r.video)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", left: "50%", top: "50%", width: 70, height: 70, marginLeft: -35, marginTop: -35, borderRadius: 70, background: C.accent,
                    display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="play" size={34} color="#FFFFFF" /></div>
                </div>
              )}
              <div>
                <div style={{ fontFamily: C.fonts.plain, fontWeight: 500, fontSize: 30, color: C.muted }}>{r.from}</div>
                <div style={{ fontFamily: C.fonts.plain, fontWeight: 500, fontSize: 38, color: C.ink, marginTop: 4, lineHeight: 1.2 }}>{r.subject}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Fit>
  );
};

/* ------------------------------------------------------------------ *
 * ask: an AI input box. `logo` (public/), `q` types out from `at`     *
 * over `typeDur`, then the cursor blinks; `placeholder` shows while  *
 * it's empty. Nothing is answered: it's the moment before you ask.    *
 * ------------------------------------------------------------------ */
const Ask: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const q = (s.q ?? "") as string;
  const typed = q.slice(0, Math.round(q.length * clamp01((t - (s.at ?? s.start)) / (s.typeDur ?? 1.2))));
  const W = 900, H = 200;
  return (
    <Fit box={box} w={W} h={H}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 100, background: C.card, border: `2px solid ${C.line}`, boxShadow: SHADOW,
        display: "flex", alignItems: "center", gap: 26, padding: "0 30px 0 44px", ...inStyle(ramp(t, s.start, 0.35)) }}>
        {s.logo ? <Img src={staticFile(s.logo)} style={{ width: 60, height: 60 }} /> : <Icon name="sparkles" size={52} color={C.ink} />}
        <div style={{ flex: 1, fontFamily: C.fonts.plain, fontWeight: 500, fontSize: 42, color: typed ? C.ink : C.muted }}>
          {typed || s.placeholder || ""}<span style={{ color: C.accent, opacity: Math.floor(t * 2) % 2 ? 1 : 0 }}>|</span>
        </div>
        <div style={{ width: 96, height: 96, borderRadius: 96, background: C.dark, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="arrow-up" size={46} color="#FFFFFF" />
        </div>
      </div>
    </Fit>
  );
};

/* ------------------------------------------------------------------ *
 * recorder: a meeting being recorded and transcribed for you. A red   *
 * dot, `label` ("Recording"), a running `time`, and grey transcript  *
 * lines (no invented words) under it.                                  *
 * ------------------------------------------------------------------ */
const Recorder: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const W = 900, H = 520, lines = s.lines ?? 6;
  return (
    <Fit box={box} w={W} h={H}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 28, background: C.card, border: `2px solid ${C.line}`, boxShadow: SHADOW, padding: "34px 40px", boxSizing: "border-box",
        ...inStyle(ramp(t, s.start, 0.35)) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 26, height: 26, borderRadius: 26, background: "#E03131", opacity: 0.5 + 0.5 * (Math.floor(t * 1.5) % 2) }} />
          <div style={{ fontFamily: C.fonts.plain, fontWeight: 500, fontSize: 38, color: C.ink }}>{s.label ?? "Recording"}</div>
          <div style={{ marginLeft: "auto", fontFamily: C.fonts.mono, fontSize: 36, color: C.muted }}>{s.time ?? ""}</div>
        </div>
        <div style={{ height: 1, background: C.line, margin: "28px 0 10px" }} />
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 26 }}>
            <div style={{ width: 40, height: 40, borderRadius: 40, background: i % 2 ? "#E6E4DE" : "#D6D4CE", flex: "none" }} />
            <div style={{ height: 16, borderRadius: 8, background: "#E6E4DE", width: 380 + 300 * hash(i + 7) }} />
          </div>
        ))}
      </div>
    </Fit>
  );
};

export const UI_SCENES: Record<string, View> = { thread: Thread, inbox: Inbox, ask: Ask, recorder: Recorder };
