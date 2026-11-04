// Reel scenes made of real UI (Ajay, 2026-11-04: "just boxes are not going to work in terms of B-rolls anymore").
// Nick's tool reels show the real product: the page itself in a browser card with a blue selection and a cursor,
// the app's own window doing the thing, a phone playing the reel. Built for the Orkas reel
// (videos/2026-11-04-orkas-reel), reusable for any tool reel. Same contract as the studio scenes: drawn in the
// 960×1080 stage, every time is a cut time.
//
//   webcard     a real screenshot in a macOS browser card with a travelling glow; `zooms` push in, `marks` select
//               (blue) or ring words, `cursor` moves and clicks. All positions in screenshot px.
//   iconreveal  "It's called" over an app-icon tile that blurs to sharp.
//   appwindow   a desktop chat app rebuilt in HTML/CSS (agent rail, chat, composer): files dragged in, a sent
//               message, an agent reply card whose rows light up, a pasted link that fails with a toast.
//   dm          a phone chat (iMessage look): a video bubble, then text bubbles.
//   promptcard  a prompt typing itself into a composer, a link chip above it.
//   phone3d     one or two phones in CSS 3D, turning slightly; screens play a video or a rebuilt reel layout,
//               `wipeAt` swaps the screen, `transfer` flies the layout from the left phone onto the right one.
import React from "react";
import { Easing, Img, OffthreadVideo, staticFile } from "remotion";
import { clamp01, ramp, useC, useNow } from "../studio/kit";
import type { Box, Face, SScene } from "../studio/scenes";

type View = React.FC<{ s: SScene; box: Box; face: Face }>;
type R = { x: number; y: number; w: number; h: number };
const ease = Easing.inOut(Easing.cubic);
const outBack = Easing.out(Easing.back(1.6));
const inStyle = (p: number, dy = 18): React.CSSProperties =>
  ({ opacity: p, filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined, transform: `translateY(${(1 - p) * dy}px)` });
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const lerpR = (a: R, b: R, p: number): R => ({ x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), w: lerp(a.w, b.w, p), h: lerp(a.h, b.h, p) });
const UI = "Inter, Arial, sans-serif";
const SELECT = "rgba(56,132,255,0.32)";

/* ---------- small shared bits ---------- */

const Dots: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <div style={{ display: "flex", gap: size * 0.6 }}>
    {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: size, height: size, borderRadius: size, background: c }} />)}
  </div>
);

const Cursor: React.FC<{ x: number; y: number; size?: number; press?: number }> = ({ x, y, size = 44, press = 0 }) => (
  <svg width={size} height={size * 1.35} viewBox="0 0 20 27" style={{ position: "absolute", left: x - size * 0.12, top: y - size * 0.06,
    transform: `scale(${1 - 0.12 * press})`, transformOrigin: "10% 5%", filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.35))", zIndex: 20 }}>
    <path d="M1.5 1.5 L1.5 21 L6.6 16.4 L10 24.6 L13.6 23 L10.2 15 L17.2 15 Z" fill="#111" stroke="#FFF" strokeWidth={1.6} strokeLinejoin="round" />
  </svg>
);

type CPt = { at: number; x: number; y: number; click?: boolean };
/** Cursor position on a path of timed points: it glides into each point over the 0.55s before it. */
const cursorAt = (pts: CPt[], t: number) => {
  if (!pts.length || t < pts[0].at - 0.35) return null;
  let x = pts[0].x, y = pts[0].y, press = 0, show = ramp(t, pts[0].at - 0.35, 0.25);
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const p = ease(clamp01((t - Math.max(a.at, b.at - 0.55)) / Math.min(0.55, b.at - a.at)));
    x = lerp(x, b.x, p); y = lerp(y, b.y, p);
  }
  for (const c of pts) if (c.click) { const d = t - c.at; if (d > -0.08 && d < 0.18) press = 1; }
  return { x, y, press, show };
};
const Clicks: React.FC<{ pts: CPt[]; t: number; color?: string }> = ({ pts, t, color = "#3884FF" }) => (
  <>{pts.filter((c) => c.click && t >= c.at && t < c.at + 0.6).map((c, i) => {
    const p = clamp01((t - c.at) / 0.6);
    return <div key={i} style={{ position: "absolute", left: c.x - 40 * p - 6, top: c.y - 40 * p - 6, width: 80 * p + 12, height: 80 * p + 12,
      borderRadius: 999, border: `4px solid ${color}`, opacity: 1 - p, zIndex: 19 }} />;
  })}</>
);

/** A border that glows with a light travelling round it (Nick's card edge). */
const Glow: React.FC<{ t: number; color: string; r: number; inset?: number }> = ({ t, color, r, inset = -4 }) => (
  <div style={{ position: "absolute", inset, borderRadius: r, boxShadow: `0 0 0 1px ${color}55, 0 0 46px ${color}55`,
    background: `conic-gradient(from ${(t * 140) % 360}deg, ${color} 0deg, ${color} 250deg, #FFFFFF 300deg, ${color} 345deg)` }} />
);

/* ---------- webcard ---------- */

const WebCard: View = ({ s }) => {
  const C = useC();
  const t = useNow();
  const W: number = s.w ?? 900, bar = 58;
  const crop: R = s.crop ?? { x: 0, y: 0, w: s.iw, h: s.ih };
  let view = crop;
  for (const z of (s.zooms ?? []) as { at: number; dur?: number; to: R }[]) view = lerpR(view, z.to, ease(clamp01((t - z.at) / (z.dur ?? 1.4))));
  const vh = Math.round((W * crop.h) / crop.w), k = W / view.w;
  const enter = ramp(t, s.start, 0.35);
  const H = vh + bar;
  const pts = (s.cursor ?? []) as CPt[];
  const cur = cursorAt(pts, t);
  const glow = s.glow ?? C.accent;
  return (
    <div style={{ position: "absolute", left: (960 - W) / 2, top: (1080 - H) / 2 + (s.dy ?? 0), width: W, height: H,
      opacity: enter, filter: enter < 1 ? `blur(${(1 - enter) * 14}px)` : undefined, transform: `scale(${0.92 + 0.08 * enter})` }}>
      <Glow t={t} color={glow} r={26} />
      <div style={{ position: "absolute", inset: 0, borderRadius: 22, overflow: "hidden", background: "#FFF" }}>
        <div style={{ height: bar, background: "#F3F3F5", borderBottom: "1px solid #E2E2E6", display: "flex", alignItems: "center", gap: 22, padding: "0 22px" }}>
          <Dots />
          <div style={{ flex: 1, height: 34, borderRadius: 10, background: "#FFF", border: "1px solid #E2E2E6", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 8, fontFamily: UI, fontSize: 21, color: "#55565C" }}>
            <svg width={14} height={16} viewBox="0 0 14 16"><rect x={1.5} y={7} width={11} height={8} rx={2} fill="#8A8B91" /><path d="M4 7 V4.6 a3 3 0 0 1 6 0 V7" stroke="#8A8B91" strokeWidth={1.8} fill="none" /></svg>
            {s.url}
          </div>
        </div>
        <div style={{ position: "absolute", top: bar, left: 0, width: W, height: vh, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: -view.x * k, top: -view.y * k, width: s.iw * k, height: s.ih * k }}>
            <Img src={staticFile(s.src)} style={{ width: "100%", height: "100%" }} />
            {((s.marks ?? []) as (R & { at: number; kind?: "select" | "ring" })[]).map((m, i) => {
              const p = ramp(t, m.at - 0.05, m.kind === "ring" ? 0.3 : 0.32);
              if (m.kind === "ring") return <div key={i} style={{ position: "absolute", left: (m.x - 8) * k, top: (m.y - 6) * k, width: (m.w + 16) * k,
                height: (m.h + 12) * k, borderRadius: 12 * k, border: `${Math.max(3, 3 * k)}px solid ${s.ring ?? "#3884FF"}`,
                opacity: p, transform: `scale(${1.15 - 0.15 * p})` }} />;
              return <div key={i} style={{ position: "absolute", left: m.x * k, top: m.y * k, width: m.w * k * p, height: m.h * k,
                background: SELECT, borderRadius: 3 * k }} />;
            })}
          </div>
          {cur && (() => {
            const px = (cur.x - view.x) * k, py = (cur.y - view.y) * k;
            const cpts = pts.map((c) => ({ ...c, x: (c.x - view.x) * k, y: (c.y - view.y) * k }));
            return <div style={{ opacity: cur.show }}><Clicks pts={cpts} t={t} /><Cursor x={px} y={py} press={cur.press} /></div>;
          })()}
        </div>
      </div>
    </div>
  );
};

/* ---------- iconreveal ---------- */

const IconReveal: View = ({ s }) => {
  const C = useC();
  const t = useNow();
  const pl = ramp(t, s.labelAt ?? s.start, 0.4), pi = clamp01((t - s.at) / 0.55);
  const size = s.size ?? 360;
  const col = s.color ?? "#FFFFFF";
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40 }}>
      <div style={{ fontFamily: C.fonts.accent, fontStyle: "italic", fontSize: s.labelSize ?? 120, color: col, lineHeight: 1, ...inStyle(pl, 24),
        textShadow: "0 4px 30px rgba(0,0,0,0.35)" }}>{s.label ?? "It's called"}</div>
      <div style={{ width: size, height: size, borderRadius: size * 0.23, background: "#FFF", display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 30px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.4), 0 0 90px ${s.glow ?? C.onDark}55`,
        opacity: clamp01(pi * 2.2), filter: pi < 1 ? `blur(${(1 - pi) * 26}px)` : undefined,
        transform: `scale(${0.6 + 0.4 * outBack(pi)}) rotate(${(1 - outBack(pi)) * -8}deg)` }}>
        <Img src={staticFile(s.src)} style={{ width: size * 0.78, height: size * 0.78, objectFit: "contain" }} />
      </div>
      {s.name && <div style={{ fontFamily: UI, fontWeight: 600, fontSize: s.nameSize ?? 96, letterSpacing: "-0.03em", color: col,
        ...inStyle(ramp(t, s.nameAt ?? s.at + 0.25, 0.4)) }}>{s.name}</div>}
    </div>
  );
};

/* ---------- appwindow ---------- */

type Attach = { name: string; kind: "video" | "rec"; at: number; thumb: string; thumbKind?: "video" | "image"; from?: [number, number]; ok?: number };
type Row = { k: string; v: string; tone: "keep" | "replace"; at?: number };
type Msg = { from: "me" | "agent"; at: number; text?: string; attach?: string[]; card?: { title: string; sub?: string; rows: Row[]; keepAt?: number; changeAt?: number } };

const Thumb: React.FC<{ a: Attach; w: number; h: number }> = ({ a, w, h }) => (
  <div style={{ width: w, height: h, borderRadius: 10, overflow: "hidden", background: "#111", position: "relative", flexShrink: 0 }}>
    {a.thumbKind === "image"
      ? <Img src={staticFile(a.thumb)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
      : <OffthreadVideo src={staticFile(a.thumb)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
    <div style={{ position: "absolute", left: 6, bottom: 6, width: 22, height: 22, borderRadius: 22, background: "rgba(0,0,0,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={10} height={10} viewBox="0 0 10 10"><path d="M2 1 L9 5 L2 9 Z" fill="#FFF" /></svg>
    </div>
  </div>
);

const AppWindow: View = ({ s }) => {
  const t = useNow();
  const P = s.brand ?? "#5B54E0";            // the product's own primary (Orkas indigo, off its download page)
  const W = 900, H = s.h ?? 1000, rail = 96, head = 92, comp = s.noComposer ? 0 : 210;
  const enter = ramp(t, s.start, 0.35);
  const atts = (s.attach ?? []) as Attach[];
  const msgs = (s.messages ?? []) as Msg[];
  const link = s.link as { text: string; at: number; errorAt: number; error: string } | undefined;
  const typed = s.typed as { text: string; at: number; dur: number; sendAt?: number } | undefined;
  const slotX = (i: number) => rail + 30 + i * 262, slotY = H - comp + 22;
  const sent = typed?.sendAt != null && t >= typed.sendAt;
  // a link that fails: shakes on errorAt, red edge, toast
  const err = link ? ramp(t, link.errorAt, 0.2) : 0;
  const shake = link && t > link.errorAt && t < link.errorAt + 0.45 ? Math.sin((t - link.errorAt) * 70) * 12 * (1 - (t - link.errorAt) / 0.45) : 0;
  return (
    <div style={{ position: "absolute", left: (960 - W) / 2, top: (1080 - H) / 2, width: W, height: H, opacity: enter,
      filter: enter < 1 ? `blur(${(1 - enter) * 14}px)` : undefined, transform: `scale(${0.93 + 0.07 * enter})` }}>
      <Glow t={t} color={s.glow ?? P} r={30} />
      <div style={{ position: "absolute", inset: 0, borderRadius: 26, overflow: "hidden", background: "#F7F9FC", fontFamily: UI }}>
        {/* title bar */}
        <div style={{ height: 52, display: "flex", alignItems: "center", padding: "0 22px", gap: 20, background: "#FFF", borderBottom: "1px solid #E6E9F0" }}>
          <Dots size={13} /><div style={{ flex: 1, textAlign: "center", fontSize: 20, fontWeight: 600, color: "#6B7080", marginRight: 70 }}>{s.title ?? "Orkas"}</div>
        </div>
        {/* agent rail */}
        <div style={{ position: "absolute", left: 0, top: 52, bottom: 0, width: rail, background: "#FFF", borderRight: "1px solid #E6E9F0",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 18, paddingTop: 20 }}>
          {s.logo && <Img src={staticFile(s.logo)} style={{ width: 56, height: 56, objectFit: "contain" }} />}
          {((s.rail ?? []) as { icon: string; on?: boolean }[]).map((r, i) => (
            <div key={i} style={{ width: 58, height: 58, borderRadius: 16, background: r.on ? P : "#EEF0F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <RailIcon kind={r.icon} color={r.on ? "#FFF" : "#7B8194"} />
            </div>
          ))}
        </div>
        {/* agent header */}
        <div style={{ position: "absolute", left: rail, right: 0, top: 52, height: head, display: "flex", alignItems: "center", gap: 18, padding: "0 30px",
          borderBottom: "1px solid #E6E9F0", background: "#FFF" }}>
          <div style={{ width: 54, height: 54, borderRadius: 15, background: P, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <RailIcon kind="video" color="#FFF" />
          </div>
          <div>
            <div style={{ fontSize: 30, fontWeight: 600, color: "#171A23", letterSpacing: "-0.01em" }}>{s.agent ?? "VideoStudio"}</div>
            <div style={{ fontSize: 19, color: "#7B8194" }}>{s.agentSub ?? "Built-in agent"}</div>
          </div>
        </div>
        {/* messages */}
        <div style={{ position: "absolute", left: rail, right: 0, top: 52 + head, bottom: comp, padding: "26px 30px", display: "flex",
          flexDirection: "column", gap: 20, justifyContent: "flex-end", overflow: "hidden" }}>
          {msgs.map((m, i) => {
            const p = ramp(t, m.at, 0.35);
            if (p <= 0) return null;
            if (m.from === "me") return (
              <div key={i} style={{ alignSelf: "flex-end", maxWidth: 600, ...inStyle(p, 20) }}>
                {m.attach && <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginBottom: 8 }}>
                  {m.attach.map((n) => { const a = atts.find((x) => x.name === n)!; return <Thumb key={n} a={a} w={92} h={a.kind === "video" ? 130 : 70} />; })}
                </div>}
                {m.text && <div style={{ background: P, color: "#FFF", fontSize: 27, lineHeight: 1.4, padding: "14px 20px", borderRadius: "20px 20px 6px 20px" }}>{m.text}</div>}
              </div>
            );
            const c = m.card!;
            return (
              <div key={i} style={{ alignSelf: "flex-start", width: 700, background: "#FFF", border: "1px solid #E1E5EE", borderRadius: 20,
                boxShadow: "0 10px 30px rgba(30,40,80,0.08)", padding: "22px 24px", ...inStyle(p, 20) }}>
                <div style={{ fontSize: 32, fontWeight: 600, color: "#171A23" }}>{c.title}</div>
                {c.sub && <div style={{ fontSize: 19, color: "#7B8194", marginTop: 4 }}>{c.sub}</div>}
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                  {c.rows.map((r, j) => {
                    const lit = r.tone === "keep" ? (c.keepAt != null ? ramp(t, c.keepAt + j * 0.08, 0.3) : 0) : (c.changeAt != null ? ramp(t, c.changeAt, 0.3) : 0);
                    const keep = r.tone === "keep";
                    const fg = keep ? "#1F7A3A" : P, bg = keep ? "#E3F5E8" : "#ECEBFD";
                    return (
                      <div key={j} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", borderRadius: 12,
                        background: lit > 0 ? `rgba(${keep ? "227,245,232" : "236,235,253"},${lit})` : "#F7F8FB", ...inStyle(ramp(t, (r.at ?? m.at + 0.2 + j * 0.1), 0.3), 10),
                        outline: lit > 0.5 ? `3px solid ${fg}` : "none" }}>
                        <div style={{ width: 190, fontSize: 28, fontWeight: 600, color: "#171A23" }}>{r.k}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 25, fontWeight: 600, color: fg, background: bg,
                          padding: "6px 14px", borderRadius: 999 }}>
                          {keep ? <svg width={18} height={18} viewBox="0 0 18 18"><path d="M3 9.5 L7.2 13.5 L15 5" stroke={fg} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            : <svg width={18} height={18} viewBox="0 0 18 18"><path d="M3 6 H14 L11 3 M15 12 H4 L7 15" stroke={fg} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                          {r.v}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        {/* composer */}
        {!s.noComposer && <div style={{ position: "absolute", left: rail + 22, right: 22, bottom: 22, height: comp - 40, background: "#FFF", borderRadius: 22,
          border: `2px solid ${err > 0.5 ? "#E5484D" : "#DCE0EA"}`, boxShadow: err > 0.5 ? "0 0 0 5px rgba(229,72,77,0.18)" : "0 4px 14px rgba(30,40,80,0.05)",
          transform: `translateX(${shake}px)` }}>
          <div style={{ position: "absolute", left: 22, right: 90, bottom: 22, fontSize: 24, color: "#A0A5B4", whiteSpace: "nowrap", overflow: "hidden" }}>
            {(() => {
              if (link && t >= link.at) return <span style={{ color: err > 0.5 ? "#C2303A" : "#3150D4", textDecoration: "underline" }}>{link.text}</span>;
              if (typed && !sent && t >= typed.at) {
                const n = Math.round(typed.text.length * clamp01((t - typed.at) / typed.dur));
                return <span style={{ color: "#171A23" }}>{typed.text.slice(0, n)}<span style={{ opacity: Math.floor(t * 3) % 2 ? 1 : 0 }}>|</span></span>;
              }
              return s.placeholder ?? "Ask VideoStudio…";
            })()}
          </div>
          <div style={{ position: "absolute", right: 18, bottom: 14, width: 56, height: 56, borderRadius: 16, background: P, display: "flex",
            alignItems: "center", justifyContent: "center", transform: `scale(${typed?.sendAt != null && Math.abs(t - typed.sendAt) < 0.12 ? 0.86 : 1})` }}>
            <svg width={24} height={24} viewBox="0 0 24 24"><path d="M12 19 V5 M5 12 L12 5 L19 12" stroke="#FFF" strokeWidth={2.8} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>}
        {/* attachments: dragged in by the cursor, then sitting in the composer (until sent) */}
        {atts.map((a, i) => {
          if (sent && msgs.some((m) => m.attach?.includes(a.name))) return null;
          const p = ease(clamp01((t - (a.at - 0.6)) / 0.6));
          if (t < a.at - 0.75) return null;
          const [fx, fy] = a.from ?? [W + 80, 200];
          const x = lerp(fx, slotX(i), p), y = lerp(fy, slotY, p);
          const big = 1 - p;
          const okp = a.ok != null ? ramp(t, a.ok, 0.3) : 0;
          return (
            <div key={i} style={{ position: "absolute", left: x, top: y, zIndex: 10, opacity: clamp01((t - (a.at - 0.75)) / 0.15) }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#FFF", border: `2px solid ${okp > 0.5 ? "#2BA84A" : "#E1E5EE"}`,
                borderRadius: 14, padding: 8, paddingRight: 16, boxShadow: okp > 0.5 ? "0 0 0 5px rgba(43,168,74,0.18)" : `0 ${8 + 20 * big}px ${20 + 30 * big}px rgba(20,30,60,${0.1 + 0.15 * big})`,
                transform: `scale(${1 + 0.35 * big}) rotate(${big * -4}deg)`, transformOrigin: "0 0" }}>
                <Thumb a={a} w={a.kind === "video" ? 66 : 96} h={a.kind === "video" ? 96 : 66} />
                <div>
                  <div style={{ fontSize: 22, fontWeight: 600, color: "#171A23", maxWidth: 128, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</div>
                  <div style={{ fontSize: 18, color: okp > 0.5 ? "#2BA84A" : "#7B8194", fontWeight: okp > 0.5 ? 600 : 400 }}>{okp > 0.5 ? "✓ Ready" : a.kind === "video" ? "Video" : "Screen recording"}</div>
                </div>
              </div>
              {big > 0.02 && <Cursor x={70} y={60} />}
            </div>
          );
        })}
        {/* error toast */}
        {link && err > 0 && (
          <div style={{ position: "absolute", left: rail + 40, right: 40, bottom: comp + 6, background: "#FFF1F1", border: "2px solid #F3B4B7", borderRadius: 16,
            padding: "16px 20px", display: "flex", gap: 14, alignItems: "flex-start", ...inStyle(err, 16), zIndex: 12 }}>
            <div style={{ width: 30, height: 30, borderRadius: 30, background: "#E5484D", color: "#FFF", fontSize: 22, fontWeight: 700, display: "flex",
              alignItems: "center", justifyContent: "center", flexShrink: 0 }}>!</div>
            <div style={{ fontSize: 22, lineHeight: 1.4, color: "#8A1F25", fontWeight: 500 }}>{link.error}</div>
          </div>
        )}
      </div>
    </div>
  );
};

const RailIcon: React.FC<{ kind: string; color: string }> = ({ kind, color }) => {
  const st = { stroke: color, strokeWidth: 2.2, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const d: Record<string, React.ReactNode> = {
    chat: <path d="M5 6 H21 V17 H11 L6 21 V17 H5 Z" {...st} />,
    video: <><rect x={3} y={6} width={14} height={13} rx={3} {...st} /><path d="M17 11 L23 7.5 V17.5 L17 14" {...st} /></>,
    team: <><circle cx={9} cy={9} r={3.2} {...st} /><circle cx={17} cy={10} r={2.6} {...st} /><path d="M3.5 20 c0-3.5 2.5-5.5 5.5-5.5 s5.5 2 5.5 5.5 M14.5 15.2 c3 -0.6 6 1 6 4.8" {...st} /></>,
    folder: <path d="M3 7 H10 L12 9 H23 V20 H3 Z" {...st} />,
    clock: <><circle cx={13} cy={13} r={9} {...st} /><path d="M13 8 V13 L16.5 15" {...st} /></>,
  };
  return <svg width={28} height={28} viewBox="0 0 26 26">{d[kind] ?? d.chat}</svg>;
};

/* ---------- dm ---------- */

const Dm: View = ({ s }) => {
  const t = useNow();
  const W = 760, enter = ramp(t, s.start, 0.35);
  const msgs = s.messages as { at: number; text?: string; video?: string; videoKind?: "video" | "image" }[];
  const BLUE = "#1D8CF8";
  return (
    <div style={{ position: "absolute", left: (960 - W) / 2, top: s.top ?? 60, width: W, borderRadius: 54, background: "#FFF", overflow: "hidden",
      boxShadow: "0 30px 70px rgba(20,20,20,0.16), 0 0 0 2px #E8E8EC", fontFamily: UI, ...inStyle(enter, 30) }}>
      <div style={{ height: 150, background: "#F6F6F8", borderBottom: "1px solid #E4E4E8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <div style={{ width: 70, height: 70, borderRadius: 70, background: "linear-gradient(#A7ABB6,#8A8F9C)", color: "#FFF", fontSize: 34, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center" }}>{(s.title ?? "E")[0]}</div>
        <div style={{ fontSize: 24, color: "#1C1C1E", fontWeight: 500 }}>{s.title ?? "Editor"} ›</div>
      </div>
      <div style={{ padding: "26px 26px 34px", display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-end", minHeight: s.minH ?? 560 }}>
        {msgs.map((m, i) => {
          const p = clamp01((t - m.at) / 0.4);
          if (p <= 0) return null;
          const pop = outBack(p);
          const st: React.CSSProperties = { opacity: clamp01(p * 3), transform: `scale(${0.6 + 0.4 * pop})`, transformOrigin: "100% 100%" };
          if (m.video) return (
            <div key={i} style={{ width: 280, height: 420, borderRadius: 28, overflow: "hidden", background: "#000", position: "relative", ...st }}>
              {m.videoKind === "image" ? <Img src={staticFile(m.video)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <OffthreadVideo src={staticFile(m.video)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
            </div>
          );
          return <div key={i} style={{ maxWidth: 560, background: BLUE, color: "#FFF", fontSize: 38, lineHeight: 1.28, padding: "16px 26px",
            borderRadius: 34, ...st }}>{m.text}</div>;
        })}
        {s.deliveredAt != null && t >= s.deliveredAt && <div style={{ fontSize: 22, color: "#8E8E93", marginTop: 2, ...inStyle(ramp(t, s.deliveredAt, 0.3), 6) }}>Delivered</div>}
      </div>
    </div>
  );
};

/* ---------- promptcard ---------- */

const PromptCard: View = ({ s }) => {
  const C = useC();
  const t = useNow();
  const W = 900, enter = ramp(t, s.start, 0.35);
  const P = s.brand ?? "#5B54E0";
  const n = Math.round(s.text.length * clamp01((t - s.at) / (s.dur ?? 1.6)));
  return (
    <div style={{ position: "absolute", left: 30, top: s.top ?? 160, width: W, fontFamily: UI, ...inStyle(enter, 24) }}>
      {s.link && <div style={{ display: "inline-flex", alignItems: "center", gap: 12, background: "#FFF", border: "2px solid #E1E5EE", borderRadius: 999,
        padding: "12px 24px", marginBottom: 26, fontSize: 30, color: "#171A23", fontWeight: 600, boxShadow: "0 8px 24px rgba(20,30,60,0.08)",
        ...inStyle(ramp(t, s.linkAt ?? s.start, 0.35), 14) }}>
        {s.logo && <Img src={staticFile(s.logo)} style={{ width: 40, height: 40 }} />}{s.link}
        <svg width={22} height={22} viewBox="0 0 22 22"><path d="M8 4 H18 V14 M18 4 L5 17" stroke="#7B8194" strokeWidth={2.4} fill="none" strokeLinecap="round" /></svg>
      </div>}
      <div style={{ position: "relative" }}>
        <Glow t={t} color={s.glow ?? C.accent} r={30} />
        <div style={{ position: "relative", background: "#FFF", borderRadius: 26, padding: "26px 30px 96px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#ECEBFD", color: P, fontWeight: 600, fontSize: 24,
            padding: "8px 16px", borderRadius: 999, marginBottom: 18 }}>
            <RailIcon kind="video" color={P} />{s.agent ?? "VideoStudio"}
          </div>
          <div style={{ fontSize: 38, lineHeight: 1.42, color: "#171A23", minHeight: 270 }}>
            {s.text.slice(0, n)}<span style={{ opacity: Math.floor(t * 3) % 2 ? 1 : 0, color: P }}>|</span>
          </div>
          <div style={{ position: "absolute", right: 24, bottom: 22, width: 62, height: 62, borderRadius: 18, background: P, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={26} height={26} viewBox="0 0 24 24"><path d="M12 19 V5 M5 12 L12 5 L19 12" stroke="#FFF" strokeWidth={2.8} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- phone3d ---------- */

type Him = { video: string; matte: string; sw: number; sh: number; cx: number; top: number; k: number };
type Screen =
  | { kind: "video"; src: string; fit?: "cover" | "contain"; pos?: string }
  | { kind: "reel"; title: [string, string]; product?: string; him: Him; parts?: { titleAt: number; productAt: number; himAt: number } };

/** A reel screen rebuilt at 1080×1920 (our split layout): title, a product card, him in the panel. */
const ReelScreen: React.FC<{ sc: Extract<Screen, { kind: "reel" }>; t: number }> = ({ sc, t }) => {
  const C = useC();
  const pa = sc.parts;
  const pt = pa ? ramp(t, pa.titleAt, 0.35) : 1, pp = pa ? ramp(t, pa.productAt, 0.4) : 1, ph = pa ? ramp(t, pa.himAt, 0.4) : 1;
  const h = sc.him, w = h.sw * h.k, hh = h.sh * h.k, left = 540 - h.cx * h.k, top = 1075 - h.top * h.k;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, background: C.border }}>
      <div style={{ position: "absolute", inset: 14, borderRadius: 20, background: C.page }} />
      {pa && [{ x: 150, y: 220, w: 780, h: 270, p: pt }, { x: 120, y: 540, w: 840, h: 470, p: pp }, { x: 78, y: 1180, w: 924, h: 740, p: ph }].map((b, i) => (
        <div key={i} style={{ position: "absolute", left: b.x, top: b.y, width: b.w, height: b.h, borderRadius: 30, border: `8px dashed ${C.accent}`,
          opacity: 0.55 * (1 - b.p) * ramp(t, (sc.parts!.titleAt) - 1.3, 0.4) }} />
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: 236, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, ...inStyle(pt, 30) }}>
        <div style={{ fontFamily: C.fonts.display, fontSize: 104, color: C.ink, lineHeight: 1.05 }}>{sc.title[0]}</div>
        <div style={{ background: C.accent, borderRadius: 10, padding: "0 26px 8px", fontFamily: C.fonts.accent, fontStyle: "italic", fontSize: 116, color: "#FFF", lineHeight: 1.12 }}>{sc.title[1]}</div>
      </div>
      {sc.product && <div style={{ position: "absolute", left: 120, top: 540, width: 840, height: 470, ...inStyle(pp, 40) }}><ProductMock /></div>}
      <div style={{ opacity: ph }}>
        <div style={{ position: "absolute", left: 78, top: 1330, width: 924, height: 640, borderRadius: "60px 60px 0 0", overflow: "hidden" }}>
          <OffthreadVideo src={staticFile(h.video)} muted style={{ position: "absolute", left: left - 78, top: top - 1330, width: w, height: hh }} />
        </div>
        <OffthreadVideo src={staticFile(h.matte)} muted transparent style={{ position: "absolute", left, top, width: w, height: hh }} />
      </div>
    </div>
  );
};

/** "Your product": a generic, unbranded app screen (Ajay, 2026-11-04: no TMV). */
const ProductMock: React.FC = () => {
  const C = useC();
  return (
    <div style={{ width: "100%", height: "100%", borderRadius: 26, background: "#FFF", overflow: "hidden", boxShadow: `0 0 0 4px ${C.accent}, 0 20px 50px rgba(0,0,0,0.12)`, fontFamily: UI }}>
      <div style={{ height: 60, background: "#F3F3F5", display: "flex", alignItems: "center", gap: 20, padding: "0 24px" }}><Dots size={16} />
        <div style={{ flex: 1, height: 30, borderRadius: 10, background: "#FFF" }} /></div>
      <div style={{ display: "flex", height: 410 }}>
        <div style={{ width: 170, background: "#F8F8FA", padding: 22, display: "flex", flexDirection: "column", gap: 18 }}>
          {[0.9, 0.6, 0.75, 0.5].map((v, i) => <div key={i} style={{ height: 18, width: `${v * 100}%`, borderRadius: 9, background: i === 0 ? C.accent : "#E3E3E8" }} />)}
        </div>
        <div style={{ flex: 1, padding: 28 }}>
          <div style={{ display: "flex", gap: 18 }}>
            {[C.accent, "#E3E3E8", "#E3E3E8"].map((c, i) => <div key={i} style={{ flex: 1, height: 90, borderRadius: 16, background: i ? "#F4F4F7" : C.accentSoft, border: `2px solid ${c}` }} />)}
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 220, marginTop: 26 }}>
            {[0.35, 0.55, 0.45, 0.7, 0.6, 0.9, 0.8].map((v, i) => <div key={i} style={{ flex: 1, height: `${v * 100}%`, borderRadius: 8, background: i === 5 ? C.accent : "#D9DFCC" }} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

const ScreenView: React.FC<{ sc: Screen; t: number; w: number; h: number }> = ({ sc, t, w, h }) => {
  if (sc.kind === "video") return <OffthreadVideo src={staticFile(sc.src)} muted style={{ width: w, height: h, objectFit: sc.fit ?? "cover", objectPosition: sc.pos ?? "center" }} />;
  const k = Math.max(w / 1080, h / 1920); // cover: the phone screen is taller than 9:16
  return <div style={{ position: "absolute", left: (w - 1080 * k) / 2, top: (h - 1920 * k) / 2, width: 1080, height: 1920, transform: `scale(${k})`, transformOrigin: "0 0" }}><ReelScreen sc={sc} t={t} /></div>;
};

type PhoneP = { x: number; y?: number; ry?: number; at: number; screen: Screen; wipeAt?: number; wipeTo?: Screen; label?: string; labelAt?: number };
const PW = 390, PH = 820, DEPTH = 30;

const Phone: React.FC<{ p: PhoneP; t: number; sway: number; scale: number }> = ({ p, t, sway, scale }) => {
  const enter = clamp01((t - p.at) / 0.7);
  const e = outBack(enter);
  const ry = (p.ry ?? 0) + sway + (1 - e) * 40, rx = 6 + (1 - e) * 10;
  const sw = PW - 24, sh = PH - 24;
  const wipe = p.wipeAt != null ? ease(clamp01((t - p.wipeAt) / 0.5)) : 0;
  return (
    <div style={{ position: "absolute", left: 480 + p.x - PW / 2, top: (p.y ?? 540) - PH / 2, width: PW, height: PH, transformStyle: "preserve-3d",
      opacity: clamp01(enter * 2), transform: `scale(${scale * (0.85 + 0.15 * e)}) rotateY(${ry}deg) rotateX(${rx}deg) translateY(${(1 - e) * 120}px)` }}>
      {/* body: back + sides give it thickness when it turns */}
      <div style={{ position: "absolute", inset: 0, borderRadius: 64, background: "#1B1C1F", transform: `translateZ(${-DEPTH}px)` }} />
      {Array.from({ length: 8 }, (_, i) => <div key={i} style={{ position: "absolute", inset: 0, borderRadius: 64, border: "3px solid #3A3C41", transform: `translateZ(${-(i + 1) * (DEPTH / 9)}px)` }} />)}
      {/* front */}
      <div style={{ position: "absolute", inset: 0, borderRadius: 64, background: "#0E0F11", boxShadow: "inset 0 0 0 3px #4A4D53, 0 50px 90px rgba(0,0,0,0.35)" }}>
        <div style={{ position: "absolute", left: 12, top: 12, width: sw, height: sh, borderRadius: 52, overflow: "hidden", background: "#000" }}>
          <ScreenView sc={p.screen} t={t} w={sw} h={sh} />
          {p.wipeTo && wipe > 0 && <div style={{ position: "absolute", inset: 0, clipPath: `inset(${(1 - wipe) * 100}% 0 0 0)` }}><ScreenView sc={p.wipeTo} t={t} w={sw} h={sh} /></div>}
          <div style={{ position: "absolute", left: sw / 2 - 58, top: 16, width: 116, height: 34, borderRadius: 20, background: "#000" }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${115 + sway * 2}deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 38%)`, pointerEvents: "none" }} />
        </div>
      </div>
    </div>
  );
};

const Phone3d: View = ({ s }) => {
  const C = useC();
  const t = useNow();
  const phones = s.phones as PhoneP[];
  const sway = Math.sin(t * 0.9) * (s.sway ?? 7);
  const tr = s.transfer as { at: number; dur?: number } | undefined;
  const bar = s.bar as { at: number; dur: number; label: string; x: number } | undefined;
  // the layout's three parts (title, card, panel) as outlines lifting off the left phone and landing on the right
  const parts = [{ y: 0.12, h: 0.13 }, { y: 0.28, h: 0.25 }, { y: 0.69, h: 0.31 }];
  return (
    <div style={{ position: "absolute", inset: 0, perspective: 1700, perspectiveOrigin: "50% 45%" }}>
      {phones.map((p, i) => <Phone key={i} p={p} t={t} sway={sway * (i % 2 ? -1 : 1)} scale={s.scale ?? 1} />)}
      {tr && phones.length > 1 && parts.map((pt, j) => {
        const a = phones[0], b = phones[1], k = s.scale ?? 1;
        const p = ease(clamp01((t - tr.at - j * 0.18) / (tr.dur ?? 0.9)));
        if (p <= 0 || p >= 1) return null;
        const sx = (q: PhoneP) => 480 + q.x - (PW / 2 - 12) * k, sy = (q: PhoneP) => (q.y ?? 540) - (PH / 2 - 12) * k;
        const x = lerp(sx(a), sx(b), p), y = lerp(sy(a), sy(b), p) - Math.sin(p * Math.PI) * 120;
        return <div key={j} style={{ position: "absolute", left: x + 14 * k, top: y + pt.y * (PH - 24) * k, width: (PW - 52) * k, height: pt.h * (PH - 24) * k,
          border: `4px solid ${C.onDark}`, borderRadius: 18, boxShadow: `0 0 30px ${C.onDark}`, background: `${C.onDark}22`,
          transform: `scale(${1 + 0.12 * Math.sin(p * Math.PI)})`, opacity: Math.sin(p * Math.PI) * 0.9 + 0.1 }} />;
      })}
      {bar && (() => {
        const p = clamp01((t - bar.at) / bar.dur), sh = ramp(t, bar.at - 0.2, 0.3);
        return <div style={{ position: "absolute", left: 480 + bar.x - 170, top: 540 + PH / 2 * (s.scale ?? 1) + 34, width: 340, opacity: sh, fontFamily: UI }}>
          <div style={{ height: 10, borderRadius: 10, background: "rgba(255,255,255,0.22)" }}>
            <div style={{ width: `${p * 100}%`, height: "100%", borderRadius: 10, background: C.onDark, boxShadow: `0 0 16px ${C.onDark}` }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 26, fontWeight: 600, color: "#FFF" }}>
            <span>0:{String(Math.round(p * 30)).padStart(2, "0")}</span><span style={{ color: C.onDark }}>{bar.label}</span>
          </div>
        </div>;
      })()}
      {phones.map((p, i) => p.label && (
        <div key={`l${i}`} style={{ position: "absolute", left: 480 + p.x - 200, width: 400, top: (p.y ?? 540) - PH / 2 * (s.scale ?? 1) - 70, textAlign: "center",
          fontFamily: C.fonts.accent, fontStyle: "italic", fontSize: 54, color: s.labelColor ?? "#FFF", ...inStyle(ramp(t, p.labelAt ?? p.at, 0.35), 12) }}>{p.label}</div>
      ))}
    </div>
  );
};

export const REEL_UI_SCENES: Record<string, View> = {
  webcard: WebCard, iconreveal: IconReveal, appwindow: AppWindow, dm: Dm, promptcard: PromptCard, phone3d: Phone3d,
};
