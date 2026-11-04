// Reel scenes for the Claude / game-rule reel (videos/2026-11-04-anthropic-reel). Real pages and rebuilt UI, no labelled boxes
// (Ajay, 2026-11-04). All drawn in the 960×1080 stage; every time is a cut time.
//
//   tabcard    a browser card with a tab strip: tabs hold real screenshots, the next one slides in on its `at`;
//              a credit line under the card; optional cursor tap. (the game screenshots)
//   newscard   a news page rebuilt from its own text: site, headline, lead image; a blue selection sweeps the headline.
//   terminal   a Claude Code terminal: a prompt types itself, tick lines land, a spinner freezes on a warning.
//   diff       a code diff card: green "+" lines, one highlighted on its word. (the rule, in its own words)
//   filetree   a project folder as a file tree; a red lock lands on it.
//   xpost      an X post card (name and handle only) with, optionally, an empty reply composer.
//   gate3d     a scanner gate in 3D: two identical figures walk up, the lamp goes red for both.
import React, { useEffect, useMemo, useState } from "react";
import { Easing, Img, continueRender, delayRender, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { clamp01, ramp, useC, useNow } from "../studio/kit";
import type { Box, Face, SScene } from "../studio/scenes";

type View = React.FC<{ s: SScene; box: Box; face: Face }>;
const ease = Easing.inOut(Easing.cubic);
const outBack = Easing.out(Easing.back(1.6));
const UI = "Inter, Arial, sans-serif";
const SELECT = "rgba(56,132,255,0.34)";
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const inStyle = (p: number, dy = 16): React.CSSProperties =>
  ({ opacity: p, filter: p < 1 ? `blur(${(1 - p) * 9}px)` : undefined, transform: `translateY(${(1 - p) * dy}px)` });

const Dots: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <div style={{ display: "flex", gap: size * 0.6 }}>
    {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: size, height: size, borderRadius: size, background: c }} />)}
  </div>
);
const Glow: React.FC<{ t: number; color: string; r: number }> = ({ t, color, r }) => (
  <div style={{ position: "absolute", inset: -4, borderRadius: r, boxShadow: `0 0 0 1px ${color}55, 0 0 46px ${color}55`,
    background: `conic-gradient(from ${(t * 140) % 360}deg, ${color} 0deg, ${color} 250deg, #FFFFFF 300deg, ${color} 345deg)` }} />
);
const Cursor: React.FC<{ x: number; y: number; press?: number }> = ({ x, y, press = 0 }) => (
  <svg width={44} height={59} viewBox="0 0 20 27" style={{ position: "absolute", left: x - 5, top: y - 3, transform: `scale(${1 - 0.12 * press})`,
    transformOrigin: "10% 5%", filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.35))", zIndex: 20 }}>
    <path d="M1.5 1.5 L1.5 21 L6.6 16.4 L10 24.6 L13.6 23 L10.2 15 L17.2 15 Z" fill="#111" stroke="#FFF" strokeWidth={1.6} strokeLinejoin="round" />
  </svg>
);
const Credit: React.FC<{ text: string; p: number; color?: string }> = ({ text, p, color = "rgba(255,255,255,0.78)" }) => (
  <div style={{ position: "absolute", left: 0, right: 0, bottom: -52, textAlign: "center", fontFamily: UI, fontWeight: 500, fontSize: 26, color, opacity: p,
    textShadow: "0 2px 14px rgba(0,0,0,0.45)" }}>{text}</div>
);

/* ---------- tabcard ---------- */

const TabCard: View = ({ s }) => {
  const C = useC();
  const t = useNow();
  const tabs = s.tabs as { label: string; src: string; iw: number; ih: number; url: string; at: number; credit?: string }[];
  const W: number = s.w ?? 940, bar = 58, strip = 52, vh: number = s.vh ?? 600;
  const enter = ramp(t, s.start, 0.35);
  // active tab = the last that has landed; `slide` = 0..1 progress of the swap to it
  let cur = 0;
  tabs.forEach((tb, i) => { if (t >= tb.at) cur = i; });
  const slide = cur > 0 ? ease(clamp01((t - tabs[cur].at) / 0.45)) : 1;
  const push = 1 + 0.07 * clamp01((t - s.start) / 4);
  const tap = s.tap as { at: number; x: number; y: number } | undefined;
  const H = strip + bar + vh;
  const view = (tb: (typeof tabs)[0], dx: number) => {
    const k = Math.max(W / tb.iw, vh / tb.ih) * push;
    return <div style={{ position: "absolute", left: dx, top: 0, width: W, height: vh, overflow: "hidden" }}>
      <Img src={staticFile(tb.src)} style={{ position: "absolute", width: tb.iw * k, height: tb.ih * k, left: (W - tb.iw * k) / 2, top: (vh - tb.ih * k) / 2 }} />
    </div>;
  };
  const cp = tap ? clamp01((t - tap.at) / 0.6) : 0;
  return (
    <div style={{ position: "absolute", left: (960 - W) / 2, top: (1080 - H) / 2 + (s.dy ?? 0), width: W, height: H, opacity: enter,
      filter: enter < 1 ? `blur(${(1 - enter) * 14}px)` : undefined, transform: `scale(${0.92 + 0.08 * enter})` }}>
      <Glow t={t} color={s.glow ?? C.accent} r={26} />
      <div style={{ position: "absolute", inset: 0, borderRadius: 22, overflow: "hidden", background: "#FFF" }}>
        <div style={{ height: strip, background: "#DEE1E6", display: "flex", alignItems: "flex-end", gap: 6, padding: "0 16px" }}>
          <div style={{ alignSelf: "center", marginRight: 10 }}><Dots /></div>
          {tabs.map((tb, i) => {
            const p = i === 0 ? 1 : ramp(t, tb.at - 0.05, 0.3);
            if (p <= 0) return null;
            const active = i === cur;
            return <div key={i} style={{ height: 42, minWidth: 230, maxWidth: 330, padding: "0 20px", borderRadius: "12px 12px 0 0", background: active ? "#FFF" : "#CED2D8",
              fontFamily: UI, fontWeight: 500, fontSize: 22, color: "#2A2B2F", display: "flex", alignItems: "center", gap: 10, opacity: p,
              transform: `translateY(${(1 - p) * 14}px)`, whiteSpace: "nowrap", overflow: "hidden" }}>
              <div style={{ width: 16, height: 16, borderRadius: 5, background: active ? C.accent : "#9A9DA4", flex: "none" }} />{tb.label}
            </div>;
          })}
        </div>
        <div style={{ height: bar, background: "#FFF", borderBottom: "1px solid #E2E2E6", display: "flex", alignItems: "center", padding: "0 22px" }}>
          <div style={{ flex: 1, height: 34, borderRadius: 17, background: "#F1F3F4", display: "flex", alignItems: "center", gap: 10, padding: "0 18px",
            fontFamily: UI, fontSize: 21, color: "#55565C" }}>{tabs[cur].url}</div>
        </div>
        <div style={{ position: "relative", height: vh, overflow: "hidden" }}>
          {cur > 0 && slide < 1 && view(tabs[cur - 1], -slide * W)}
          {view(tabs[cur], cur > 0 ? (1 - slide) * W : 0)}
          {tap && t > tap.at - 0.6 && <div style={{ opacity: ramp(t, tap.at - 0.6, 0.25) * (1 - ramp(t, tap.at + 0.9, 0.3)) }}>
            <Cursor x={lerp(tap.x + 180, tap.x, ease(clamp01((t - (tap.at - 0.6)) / 0.55)))} y={lerp(tap.y + 120, tap.y, ease(clamp01((t - (tap.at - 0.6)) / 0.55)))}
              press={t > tap.at - 0.05 && t < tap.at + 0.15 ? 1 : 0} />
            {t >= tap.at && <div style={{ position: "absolute", left: tap.x - 40 * cp - 6, top: tap.y - 40 * cp - 6, width: 80 * cp + 12, height: 80 * cp + 12,
              borderRadius: 999, border: "4px solid #3884FF", opacity: 1 - cp }} />}
          </div>}
        </div>
      </div>
      <Credit text={tabs[cur].credit ?? ""} p={tabs[cur].credit ? 1 : 0} />
    </div>
  );
};

/* ---------- newscard ---------- */

const NewsCard: View = ({ s }) => {
  const C = useC();
  const t = useNow();
  const W = 900, enter = ramp(t, s.start, 0.35);
  const words = (s.title as string).split(" ");
  const sel = clamp01((t - s.selectAt) / 0.9);
  return (
    <div style={{ position: "absolute", left: (960 - W) / 2, top: 150, width: W, opacity: enter, filter: enter < 1 ? `blur(${(1 - enter) * 14}px)` : undefined,
      transform: `scale(${0.92 + 0.08 * enter})` }}>
      <Glow t={t} color={C.accent} r={26} />
      <div style={{ position: "relative", borderRadius: 22, overflow: "hidden", background: "#FFF" }}>
        <div style={{ height: 56, background: "#FFF", borderBottom: "1px solid #ECECEF", display: "flex", alignItems: "center", padding: "0 28px", gap: 14 }}>
          <div style={{ fontFamily: UI, fontWeight: 900, fontSize: 34, letterSpacing: -1, color: "#111" }}>{s.site}</div>
          <div style={{ flex: 1 }} />
          <div style={{ fontFamily: UI, fontSize: 20, color: "#7B7C82" }}>{s.date}</div>
        </div>
        <div style={{ padding: "34px 36px 30px" }}>
          <div style={{ position: "relative", fontFamily: UI, fontWeight: 800, fontSize: 54, lineHeight: 1.12, letterSpacing: -1.2, color: "#111" }}>
            <div style={{ position: "absolute", left: -8, right: 0, top: 0, bottom: 0, background: `linear-gradient(90deg, ${SELECT} ${sel * 100}%, transparent ${sel * 100}%)`, borderRadius: 6 }} />
            <span style={{ position: "relative" }}>{words.join(" ")}</span>
          </div>
        </div>
        <Img src={staticFile(s.img)} style={{ width: W, height: s.imgH ?? 450, objectFit: "cover", display: "block" }} />
      </div>
      <Credit text={s.credit ?? ""} p={s.credit ? 1 : 0} />
    </div>
  );
};

/* ---------- terminal ---------- */

type TLine = { at: number; text: string; kind: "prompt" | "ok" | "run" | "warn" | "dim"; dur?: number };
const Terminal: View = ({ s }) => {
  const C = useC();
  const t = useNow();
  const lines = s.lines as TLine[];
  const enter = ramp(t, s.start, 0.35);
  const freeze = s.freezeAt as number | undefined;
  const dim = s.dimAt != null ? ramp(t, s.dimAt, 0.45) : 0;
  const rule = s.rule as { at: number; text: string } | undefined;
  const mono = C.fonts.mono;
  const W = 900, H = s.h ?? 640;
  const spin = "◐◓◑◒"[Math.floor(t * 8) % 4];
  const col = (k: string) => ({ prompt: "#FFFFFF", ok: "#A7BD82", run: "#E6E8EA", warn: "#FFC857", dim: "#7C828A" }[k] as string);
  return (
    <div style={{ position: "absolute", left: (960 - W) / 2, top: (1080 - H) / 2 + (s.dy ?? 0), width: W, height: H, opacity: enter,
      filter: enter < 1 ? `blur(${(1 - enter) * 14}px)` : undefined, transform: `scale(${0.92 + 0.08 * enter})` }}>
      <Glow t={t} color={C.accent} r={26} />
      <div style={{ position: "absolute", inset: 0, borderRadius: 22, overflow: "hidden", background: "#15171B" }}>
        <div style={{ height: 56, background: "#1E2026", display: "flex", alignItems: "center", padding: "0 22px", gap: 18, borderBottom: "1px solid #2A2D35" }}>
          <Dots />
          <div style={{ flex: 1, textAlign: "center", fontFamily: UI, fontSize: 21, color: "#8E939B", marginRight: 60 }}>{s.title ?? "claude"}</div>
        </div>
        <div style={{ padding: "30px 34px", fontFamily: mono, fontSize: 31, lineHeight: 1.5, opacity: 1 - 0.7 * dim, filter: dim ? `blur(${dim * 3}px)` : undefined }}>
          {lines.map((l, i) => {
            if (t < l.at - 0.02) return null;
            const typed = l.kind === "prompt" ? Math.min(l.text.length, Math.floor(((t - l.at) / (l.dur ?? 1.0)) * l.text.length)) : l.text.length;
            const shownText = l.text.slice(0, Math.max(0, typed));
            const last = l.kind === "run" && freeze != null && t >= freeze;
            const kind = last ? "warn" : l.kind;
            const icon = l.kind === "prompt" ? ">" : l.kind === "ok" ? "✓" : l.kind === "run" ? (last ? "⚠" : spin) : l.kind === "warn" ? "⚠" : "·";
            return <div key={i} style={{ display: "flex", gap: 16, color: col(kind), opacity: ramp(t, l.at, 0.12) }}>
              <span style={{ width: 30, flex: "none", color: l.kind === "prompt" ? C.onDark : undefined }}>{icon}</span>
              <span>{shownText}{l.kind === "prompt" && typed < l.text.length && <span style={{ background: "#FFF", color: "#FFF" }}>_</span>}</span>
            </div>;
          })}
        </div>
        {rule && t >= rule.at - 0.05 && (() => {
          const p = ramp(t, rule.at, 0.5);
          return <div style={{ position: "absolute", left: 34, right: 34, bottom: 34 + (1 - p) * 60, padding: "26px 30px", borderRadius: 18, background: "#FFF",
            opacity: p, fontFamily: UI, fontWeight: 600, fontSize: 38, lineHeight: 1.25, color: "#111", boxShadow: "0 20px 60px rgba(0,0,0,0.45)" }}>
            <span style={{ background: C.accentTint, borderRadius: 4, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone", padding: "0 6px" }}>{rule.text}</span>
          </div>;
        })()}
      </div>
    </div>
  );
};

/* ---------- diff ---------- */

const Diff: View = ({ s }) => {
  const C = useC();
  const t = useNow();
  const lines = s.lines as { at: number; text: string }[];
  const W = 900, enter = ramp(t, s.start, 0.35);
  const hl = s.hl as { line: number; at: number } | undefined;
  return (
    <div style={{ position: "absolute", left: (960 - W) / 2, top: s.top ?? 230, width: W, opacity: enter, filter: enter < 1 ? `blur(${(1 - enter) * 14}px)` : undefined,
      transform: `scale(${0.92 + 0.08 * enter})` }}>
      <Glow t={t} color={C.accent} r={26} />
      <div style={{ position: "relative", borderRadius: 22, overflow: "hidden", background: "#FFF" }}>
        <div style={{ height: 66, background: "#F6F8FA", borderBottom: "1px solid #D0D7DE", display: "flex", alignItems: "center", padding: "0 26px", gap: 16 }}>
          <div style={{ fontFamily: C.fonts.mono, fontSize: 26, color: "#24292F" }}>{s.file ?? "Claude Code instructions"}</div>
          <div style={{ flex: 1 }} />
          <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 24, color: "#1A7F37", background: "#DAFBE1", padding: "4px 14px", borderRadius: 999 }}>+{lines.length}</div>
        </div>
        {lines.map((l, i) => {
          const p = ramp(t, l.at, 0.35);
          const h = hl && hl.line === i ? ramp(t, hl.at, 0.6) : 0;
          return <div key={i} style={{ display: "flex", background: "#E6FFEC", borderBottom: "1px solid #C7EDCF", opacity: p, transform: `translateX(${(1 - p) * -30}px)` }}>
            <div style={{ width: 70, flex: "none", background: "#CCFFD8", fontFamily: C.fonts.mono, fontSize: 32, color: "#1A7F37", textAlign: "center", padding: "26px 0" }}>+</div>
            <div style={{ padding: "22px 26px", fontFamily: C.fonts.mono, fontSize: 31, lineHeight: 1.4, color: "#1F2328", position: "relative" }}>
              <span style={{ background: `linear-gradient(90deg, rgba(255,214,0,0.55) ${h * 100}%, transparent ${h * 100}%)`, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>{l.text}</span>
            </div>
          </div>;
        })}
      </div>
    </div>
  );
};

/* ---------- filetree ---------- */

const FileTree: View = ({ s }) => {
  const C = useC();
  const t = useNow();
  const W = 900, enter = ramp(t, s.start, 0.35);
  const rows = s.rows as { name: string; depth: number; at: number; dir?: boolean }[];
  const lock = ramp(t, s.lockAt, 0.45);
  return (
    <div style={{ position: "absolute", left: (960 - W) / 2, top: 190, width: W, opacity: enter, filter: enter < 1 ? `blur(${(1 - enter) * 14}px)` : undefined,
      transform: `scale(${0.92 + 0.08 * enter})` }}>
      <Glow t={t} color={C.accent} r={26} />
      <div style={{ position: "relative", borderRadius: 22, overflow: "hidden", background: "#FFF" }}>
        <div style={{ height: 62, background: "#F3F3F5", borderBottom: "1px solid #E2E2E6", display: "flex", alignItems: "center", padding: "0 22px", gap: 20 }}>
          <Dots /><div style={{ fontFamily: UI, fontWeight: 600, fontSize: 24, color: "#55565C" }}>{s.title ?? "Explorer"}</div>
        </div>
        <div style={{ padding: "26px 30px 34px", position: "relative" }}>
          {rows.map((r, i) => {
            const p = ramp(t, r.at, 0.3);
            const own = i === 0;
            return <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, padding: "14px 0", paddingLeft: r.depth * 52, opacity: p, transform: `translateX(${(1 - p) * -24}px)`,
              fontFamily: UI, fontWeight: own ? 700 : 500, fontSize: 38, color: "#1F2328" }}>
              <span style={{ fontSize: 36, width: 44 }}>{r.dir ? "📁" : "📄"}</span>{r.name}
              {own && <div style={{ flex: 1 }} />}
              {own && <div style={{ transform: `scale(${0.4 + 0.6 * outBack(lock)})`, opacity: lock, display: "flex", alignItems: "center", gap: 10, background: "#FDECEC", border: "3px solid #D93025",
                color: "#B3261E", borderRadius: 16, padding: "8px 20px", fontWeight: 700, fontSize: 32 }}>
                <svg width={30} height={34} viewBox="0 0 24 28"><rect x={3} y={12} width={18} height={14} rx={3} fill="#D93025" /><path d="M7 12 V8 a5 5 0 0 1 10 0 V12" stroke="#D93025" strokeWidth={3} fill="none" /></svg>
                {s.lockLabel ?? "Blocked"}
              </div>}
            </div>;
          })}
        </div>
      </div>
    </div>
  );
};

/* ---------- xpost ---------- */

const XGlyph: React.FC<{ size: number; color?: string }> = ({ size, color = "#0F1419" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><path fill={color} d="M18.9 1.2h3.7l-8 9.2L24 22.8h-7.4l-5.8-7.6-6.6 7.6H.5l8.6-9.8L0 1.2h7.6l5.2 6.9zm-1.3 19.4h2L6.5 3.3H4.3z" /></svg>
);
const XPost: View = ({ s }) => {
  const C = useC();
  const t = useNow();
  const W = 900, enter = ramp(t, s.start, 0.35);
  const logo = ramp(t, s.logoAt ?? s.start, 0.45);
  const comp = s.composer as { at: number } | undefined;
  const bar = (w: number, y = 0): React.CSSProperties => ({ height: 22, width: `${w}%`, borderRadius: 11, background: "#E6E9EC", marginTop: y ? y : 16 });
  return (
    <div style={{ position: "absolute", left: (960 - W) / 2, top: s.top ?? 190, width: W, opacity: enter, filter: enter < 1 ? `blur(${(1 - enter) * 14}px)` : undefined,
      transform: `scale(${0.92 + 0.08 * enter})` }}>
      <Glow t={t} color={C.accent} r={26} />
      <div style={{ position: "relative", borderRadius: 22, overflow: "hidden", background: "#FFF", padding: "34px 36px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 92, height: 92, borderRadius: 92, background: "linear-gradient(135deg,#7F8C9A,#3B4856)", color: "#FFF", fontFamily: UI, fontWeight: 700, fontSize: 36,
            display: "flex", alignItems: "center", justifyContent: "center" }}>AO</div>
          <div>
            <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 38, color: "#0F1419" }}>{s.name}</div>
            <div style={{ fontFamily: UI, fontSize: 30, color: "#536471" }}>{s.handle}</div>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ transform: `scale(${0.4 + 0.6 * outBack(logo)})`, opacity: logo }}><XGlyph size={64} /></div>
        </div>
        <div style={{ marginTop: 18 }}><div style={bar(96)} /><div style={bar(88)} /><div style={bar(92)} /><div style={bar(54)} /></div>
        {comp && (() => {
          const p = ramp(t, comp.at, 0.45);
          return <div style={{ marginTop: 34, paddingTop: 26, borderTop: "1px solid #EFF3F4", opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ width: 72, height: 72, borderRadius: 72, background: "#CFD9DE", flex: "none" }} />
              <div style={{ fontFamily: UI, fontSize: 38, color: "#536471", display: "flex", alignItems: "center" }}>
                <span style={{ display: "inline-block", width: 3, height: 44, background: "#1D9BF0", marginRight: 6, opacity: Math.floor(t * 2.2) % 2 ? 0 : 1 }} />
                {s.placeholder ?? "Post your reply"}
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 30, color: "#FFF", background: "#8ECDF7", padding: "12px 30px", borderRadius: 999 }}>Reply</div>
            </div>
          </div>;
        })()}
      </div>
    </div>
  );
};

/* ---------- gate3d ---------- */

const useFontReady = (font: string) => {
  const [ok, setOk] = useState(false);
  const [h] = useState(() => delayRender(`font ${font}`));
  useEffect(() => {
    // the reel adds Open Sauce Sans after mount: poll until it is really there (load() alone resolves early for an unregistered face)
    let n = 0, done = false;
    const finish = () => { if (!done) { done = true; setOk(true); } };
    const fam = font.replace(/^.*?px\s+/, "").replace(/"/g, "");
    const have = () => Array.from(document.fonts).some((f) => f.family.replace(/"/g, "") === fam && f.status === "loaded");
    const tick = () => { if (have() || n++ > 80) { document.fonts.load(font).then(finish).catch(finish); } else setTimeout(tick, 50); };
    tick();
  }, [font]);
  useEffect(() => { if (ok) continueRender(h); }, [ok, h]);
  return ok;
};
const labelTexture = (text: string, fam: string, bg: string, fg: string) => {
  const W = 520, H = 150, c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  g.fillStyle = bg; g.beginPath(); g.roundRect(6, 6, W - 12, H - 12, 52); g.fill();
  g.fillStyle = fg; g.font = `500 70px ${fam}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, W / 2, H / 2 + 3);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return tex;
};
const LookAt: React.FC<{ y: number }> = ({ y }) => { const { camera } = useThree(); camera.lookAt(0, y, 0); return null; };

const Figure: React.FC<{ x: number; z: number; color: string; bob: number }> = ({ x, z, color, bob }) => (
  <group position={[x, bob, z]}>
    <mesh position={[0, 0.78, 0]}><capsuleGeometry args={[0.34, 0.8, 8, 20]} /><meshStandardMaterial color={color} roughness={0.55} /></mesh>
    <mesh position={[0, 1.78, 0]}><sphereGeometry args={[0.3, 32, 32]} /><meshStandardMaterial color={color} roughness={0.55} /></mesh>
  </group>
);

const Gate3d: View = ({ s }) => {
  const C = useC();
  const t = useNow();
  const fam = `"Open Sauce Sans"`;
  const ready = useFontReady(`500 70px ${fam}`);
  const enter = ramp(t, s.start, 0.5);
  const walk = ease(clamp01((t - (s.walkAt ?? s.start)) / 1.3));
  const scan = clamp01((t - s.scanAt) / 0.9);
  const red = t >= s.redAt;
  const lamp = red ? "#FF3B30" : "#9AA3AD";
  const tex = useMemo(() => !ready ? null : {
    thief: labelTexture(s.thief?.text ?? "thief", fam, "rgba(24,26,34,0.92)", "#FFF"),
    owner: labelTexture(s.owner?.text ?? "owner", fam, "#FFFFFF", "#171A23"),
  }, [ready, fam, s.thief?.text, s.owner?.text]);
  const cam = new THREE.Vector3(0, 3.0, 9.6);
  const dummy = new THREE.Object3D();
  const zf = lerp(-4.2, 1.4, walk);               // walking toward the gate (z = 0 is the gate plane)
  const bob = walk < 1 ? Math.abs(Math.sin(t * 9)) * 0.06 : 0;
  const lab = (p: number, x: number, text: "thief" | "owner") => {
    if (!tex || p <= 0) return null;
    dummy.position.set(x, 2.7, zf); dummy.lookAt(cam);
    return <mesh position={[x, 2.75, zf + 0.3]} quaternion={dummy.quaternion.clone()} scale={0.5 * outBack(clamp01(p))}>
      <planeGeometry args={[3.47, 1]} /><meshBasicMaterial map={tex[text]} transparent depthWrite={false} />
    </mesh>;
  };
  return (
    <div style={{ position: "absolute", inset: 0, opacity: enter }}>
      <ThreeCanvas width={960} height={1000} camera={{ position: [cam.x, cam.y, cam.z], fov: 36 }} gl={{ antialias: true, alpha: true }}>
        <LookAt y={1.2} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 6, 6]} intensity={1.7} />
        <pointLight position={[0, 4.2, 0.5]} intensity={red ? 40 : 8} distance={9} color={red ? "#FF3B30" : "#FFFFFF"} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1]}><planeGeometry args={[14, 14]} /><meshStandardMaterial color="#1B1E24" roughness={0.9} /></mesh>
        {/* the gate: two posts, a header with the lamp */}
        <mesh position={[-2.6, 1.7, 0]}><boxGeometry args={[0.32, 3.4, 0.5]} /><meshStandardMaterial color="#D9DDE2" metalness={0.3} roughness={0.35} /></mesh>
        <mesh position={[2.6, 1.7, 0]}><boxGeometry args={[0.32, 3.4, 0.5]} /><meshStandardMaterial color="#D9DDE2" metalness={0.3} roughness={0.35} /></mesh>
        <mesh position={[0, 3.5, 0]}><boxGeometry args={[5.5, 0.42, 0.6]} /><meshStandardMaterial color="#D9DDE2" metalness={0.3} roughness={0.35} /></mesh>
        <mesh position={[0, 3.5, 0.32]}><sphereGeometry args={[0.2, 32, 32]} /><meshStandardMaterial color={lamp} emissive={lamp} emissiveIntensity={red ? 2.2 : 0.2} /></mesh>
        {/* the scanner beam sweeping down the gate plane */}
        {scan > 0 && scan < 1.05 && <mesh position={[0, 3.3 - scan * 3.2, 0.05]}><planeGeometry args={[5, 0.07]} />
          <meshBasicMaterial color={red ? "#FF3B30" : "#7FE0FF"} transparent opacity={0.9 * (1 - Math.max(0, scan - 0.9) * 10)} /></mesh>}
        {/* identical figures: same grey, same stance */}
        <Figure x={-1.15} z={zf} color={red ? "#C9807C" : "#9AA3AD"} bob={bob} />
        <Figure x={1.15} z={zf} color={red ? "#C9807C" : "#9AA3AD"} bob={bob} />
      </ThreeCanvas>
      {([[s.thief, 251, "dark"], [s.owner, 706, "light"]] as [any, number, string][]).map(([c, x, tone], i) => {
        const p = ramp(t, (c?.at ?? 0), 0.4);
        if (!c || p <= 0) return null;
        return <div key={i} style={{ position: "absolute", left: x - 125, top: 232, width: 250, height: 70, borderRadius: 35, display: "flex", alignItems: "center", justifyContent: "center",
          background: tone === "dark" ? "rgba(24,26,34,0.94)" : "#FFFFFF", color: tone === "dark" ? "#FFF" : "#171A23", fontFamily: '"Open Sauce Sans", Inter, sans-serif', fontWeight: 500, fontSize: 40,
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)", opacity: p, transform: `scale(${0.6 + 0.4 * outBack(p)})` }}>{c.text}</div>;
      })}
      {s.verdict && <div style={{ position: "absolute", left: 0, right: 0, bottom: 40, textAlign: "center", fontFamily: C.fonts.accent, fontStyle: "italic", fontSize: 92, color: "#FFF",
        opacity: ramp(t, s.redAt, 0.4), textShadow: "0 4px 30px rgba(0,0,0,0.5)" }}>{s.verdict}</div>}
    </div>
  );
};

export const REEL_ANTHROPIC_SCENES: Record<string, View> = {
  tabcard: TabCard, newscard: NewsCard, terminal: Terminal, diff: Diff, filetree: FileTree, xpost: XPost, gate3d: Gate3d,
};
