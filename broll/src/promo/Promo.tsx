// SEORankLift homepage promo, 29s, 1920x1080, 30fps. Storyboard: videos/2026-11-02-seoranklift-homepage-promo/storyboard.md
// Look = the website (Figtree, purple #5b21b6 on #fcfcfc, night #100029 end card), not the studio look.
// v2 (Ajay's notes, 2 Nov): slower, one thing at a time; the prompt box types between inline tags like the real app
// (# opens the Library, the pick drops in as a tag); a different framing per beat.
// Cuts land on whole seconds (4, 11, 16, 20, 25) so the music (scripts/promo_music.py, 120 BPM) hits on beats.
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/Figtree";

const { fontFamily } = loadFont("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });

const FPS = 30;
const C = {
  bg: "#fcfcfc", surface: "#ffffff", soft: "#fbf6ff", tint: "#f5eeff", lav: "#f1ecf7", line: "#e6e0ef",
  primary: "#5b21b6", accent: "#8b5cf6", softPurple: "#c9b3f5", text: "#222222", muted: "#6b6577",
  night: "#100029", glow: "#2c0174", ok: "#1f8a4c", okTint: "#e3f5ea", warn: "#c0392b", warnTint: "#fde9e7",
};
// frame where each beat starts (seconds x 30), and the cut points the wipe is centred on
const B = { hook: 0, request: 120, research: 330, outline: 480, draft: 600, end: 750 };
const TOTAL = 870;
const CUTS = [B.request, B.research, B.outline, B.draft, B.end];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const prog = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });
const springAt = (f: number, a: number) =>
  spring({ frame: Math.max(0, f - a), fps: FPS, config: { damping: 14, stiffness: 150, mass: 0.7 } });
const typed = (text: string, f: number, a: number, cps: number) =>
  text.slice(0, Math.max(0, Math.min(text.length, Math.floor(((f - a) * cps) / FPS))));
const words = (text: string, f: number, a: number, wps: number) => {
  const w = text.split(" ");
  return w.slice(0, Math.max(0, Math.min(w.length, Math.floor(((f - a) * wps) / FPS)))).join(" ");
};
const lerpPath = (f: number, pts: [number, number, number][]) => {
  const fs = pts.map((p) => p[0]);
  return [interpolate(f, fs, pts.map((p) => p[1]), { ...clamp, easing: ease }), interpolate(f, fs, pts.map((p) => p[2]), { ...clamp, easing: ease })];
};

// ---------- small pieces ----------

const In: React.FC<{ at: number; y?: number; x?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, y = 22, x = 0, children, style }) => {
  const f = useCurrentFrame();
  const p = prog(f, at, at + 14);
  return <div style={{ opacity: p, transform: `translate(${(1 - p) * x}px, ${(1 - p) * y}px)`, filter: `blur(${(1 - p) * 8}px)`, ...style }}>{children}</div>;
};

const Tick: React.FC<{ size?: number; color?: string }> = ({ size = 30, color = C.ok }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
const Spinner: React.FC<{ size?: number }> = ({ size = 30 }) => {
  const f = useCurrentFrame();
  return <div style={{ width: size, height: size, borderRadius: "50%", border: `4px solid ${C.softPurple}`, borderTopColor: C.primary, transform: `rotate(${f * 14}deg)` }} />;
};
const Ring: React.FC<{ size?: number }> = ({ size = 30 }) => <div style={{ width: size, height: size, borderRadius: "50%", border: `3px solid ${C.line}` }} />;
const Pen: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20l4-1 11-11-3-3L5 16z" />
  </svg>
);

const Cursor: React.FC<{ x: number; y: number; press?: number }> = ({ x, y, press = 0 }) => (
  <svg width="46" height="46" viewBox="0 0 24 24" style={{ position: "absolute", left: x, top: y, transform: `scale(${1 - press * 0.15})`, transformOrigin: "3px 2px", filter: "drop-shadow(0 4px 6px rgba(0,0,0,.25))", zIndex: 50 }}>
    <path d="M3 2l15 8-6.5 2L9 19z" fill="#111" stroke="#fff" strokeWidth={1.6} strokeLinejoin="round" />
  </svg>
);

const Caret: React.FC<{ h?: number }> = ({ h = 36 }) => {
  const f = useCurrentFrame();
  return <span style={{ display: "inline-block", width: 3, height: h, background: C.primary, verticalAlign: "-0.14em", marginLeft: 2, opacity: Math.floor(f / 8) % 2 ? 0 : 1 }} />;
};

const Chip: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: C.tint, color: C.primary, fontWeight: 600, fontSize: 24, padding: "10px 22px", borderRadius: 99, ...style }}>{children}</div>
);

type Pos = "bl" | "tc" | "br";
const POS: Record<Pos, React.CSSProperties> = {
  bl: { left: 120, bottom: 62 },
  tc: { left: 0, right: 0, top: 44, margin: "0 auto", width: "fit-content" },
  br: { right: 120, bottom: 62 },
};
// caption pill: arrives with its first word, words blur in one by one, accent words in purple
const Caption: React.FC<{ at: number; parts: [string, boolean?][]; pos?: Pos }> = ({ at, parts, pos = "bl" }) => {
  const f = useCurrentFrame();
  let i = 0;
  const box = prog(f, at - 2, at + 10);
  return (
    <div style={{ opacity: box, transform: `translateY(${(1 - box) * 14}px)`, position: "absolute", ...POS[pos], display: "flex", gap: 16, background: "rgba(255,255,255,.96)", padding: "20px 46px", borderRadius: 99, boxShadow: "0 18px 50px rgba(60,20,120,.22)", fontSize: 58, fontWeight: 700, letterSpacing: "-0.025em", color: C.text, zIndex: 40 }}>
      {parts.flatMap(([t, hot]) => t.split(" ").map((w) => {
        const p = prog(f, at + i * 3, at + i++ * 3 + 12);
        return <span key={`${w}-${i}`} style={{ opacity: p, transform: `translateY(${(1 - p) * 16}px)`, filter: `blur(${(1 - p) * 8}px)`, color: hot ? C.primary : C.text, display: "inline-block" }}>{w}</span>;
      }))}
    </div>
  );
};

// big stacked headline for the split layouts (beats 3 and 4)
const Headline: React.FC<{ at: number; lines: [string, boolean?][][]; x: number; w: number }> = ({ at, lines, x, w }) => {
  const f = useCurrentFrame();
  let i = 0;
  return (
    <div style={{ position: "absolute", left: x, top: 0, bottom: 0, width: w, display: "flex", flexDirection: "column", justifyContent: "center", fontSize: 100, fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.08, color: C.text }}>
      {lines.map((ln, li) => (
        <div key={li}>
          {ln.flatMap(([t, hot]) => t.split(" ").map((w2) => {
            const p = prog(f, at + i * 4, at + i++ * 4 + 14);
            return <span key={`${li}-${w2}-${i}`} style={{ display: "inline-block", marginRight: 22, opacity: p, transform: `translateY(${(1 - p) * 26}px)`, filter: `blur(${(1 - p) * 10}px)`, color: hot ? C.primary : C.text }}>{w2}</span>;
          }))}
        </div>
      ))}
    </div>
  );
};

type Cam = { s: number; x: number; y: number };
// slow camera move between two framings
const CamMove: React.FC<{ len: number; from?: Cam; to: Cam; origin?: string; children: React.ReactNode }> = ({ len, from = { s: 1, x: 0, y: 0 }, to, origin = "50% 50%", children }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, len], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const s = from.s + (to.s - from.s) * t, x = from.x + (to.x - from.x) * t, y = from.y + (to.y - from.y) * t;
  return <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) scale(${s})`, transformOrigin: origin }}>{children}</AbsoluteFill>;
};

const H: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ fontSize: 46, fontWeight: 700, letterSpacing: "-0.03em", color: C.text, ...style }}>{children}</div>
);

// a floating panel (no sidebar), optionally tilted in 3D
const Panel: React.FC<{ x: number; y: number; w: number; h: number; tilt?: number; at?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, w, h, tilt = 0, at = 0, children, style }) => {
  const f = useCurrentFrame();
  const p = prog(f, at, at + 18);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 30, background: C.surface, boxShadow: "0 40px 100px rgba(60,20,120,.2), 0 0 0 2px #ece6f5", padding: "40px 46px", opacity: p, transform: `perspective(2600px) rotateY(${tilt * p}deg) translateX(${(1 - p) * (tilt > 0 ? -60 : 60)}px)`, transformOrigin: "50% 50%", ...style }}>
      {children}
    </div>
  );
};

// ---------- beat 1: the hook, windows arrive one after another ----------

const Win: React.FC<{ x: number; y: number; w: number; h: number; rot: number; at: number; title: string; icon?: string; children?: React.ReactNode }> = ({ x, y, w, h, rot, at, title, icon, children }) => {
  const f = useCurrentFrame();
  const s = springAt(f, at);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 26, background: C.surface, boxShadow: "0 30px 70px rgba(60,20,120,.2), 0 0 0 2px #ece6f5", overflow: "hidden", opacity: Math.min(1, s * 1.6), transform: `translateY(${(1 - s) * 60}px) rotate(${rot}deg) scale(${0.9 + 0.1 * s})` }}>
      <div style={{ height: 66, background: C.lav, display: "flex", alignItems: "center", gap: 14, padding: "0 24px", fontSize: 26, fontWeight: 600, color: C.text }}>
        {icon ? <Img src={staticFile(icon)} style={{ width: 34, height: 34, borderRadius: 8 }} /> : null}
        {title}
      </div>
      {children}
    </div>
  );
};
const Bar: React.FC<{ w: number; c?: string; h?: number }> = ({ w, c = C.lav, h = 18 }) => <div style={{ width: w, height: h, borderRadius: 99, background: c }} />;

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  // one window at a time: keyword tool (f6), doc (f34), chat (f62); the cursor acts only on what is already there
  const [cx, cy] = lerpPath(f, [[0, 230, 420], [18, 360, 330], [30, 380, 300], [44, 900, 470], [58, 980, 480], [76, 1500, 420], [88, 1540, 460], [100, 1000, 560], [114, 1020, 570]]);
  const pasted1 = prog(f, 50, 58);
  const pasted2 = prog(f, 104, 112);
  const label = f >= 22 && f < 36 ? "copy" : f >= 50 && f < 64 ? "paste" : f >= 86 && f < 98 ? "copy" : f >= 106 ? "paste" : "";
  return (
    <AbsoluteFill>
      <CamMove len={120} from={{ s: 1.22, x: 300, y: 40 }} to={{ s: 1, x: 0, y: 0 }} origin="50% 40%">
        <Win x={130} y={150} w={540} h={470} rot={-4} at={6} title="Keyword tool">
          <div style={{ padding: "30px 32px", display: "flex", flexDirection: "column", gap: 26 }}>
            {[330, 260, 390, 220, 300].map((w, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, background: i === 1 && f > 20 && f < 44 ? C.tint : "transparent", borderRadius: 12, padding: "2px 6px" }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: C.softPurple }} />
                <Bar w={w} />
              </div>
            ))}
          </div>
        </Win>
        <Win x={715} y={250} w={560} h={520} rot={1.6} at={34} title="Untitled doc">
          <div style={{ padding: "34px 40px" }}>
            <div style={{ fontSize: 38, fontWeight: 700, color: "#bdb6c9" }}>Untitled</div>
            <div style={{ marginTop: 34, display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ opacity: pasted1 }}><Bar w={420} c={C.softPurple} /></div>
              <div style={{ opacity: pasted1 }}><Bar w={360} c={C.softPurple} /></div>
              <div style={{ opacity: pasted2 }}><Bar w={400} c={C.tint} /></div>
              <div style={{ fontSize: 26, color: "#a39cb2", marginTop: 6 }}>Paste your research here<Caret h={30} /></div>
            </div>
          </div>
        </Win>
        <Win x={1290} y={140} w={520} h={500} rot={4} at={62} title="ChatGPT" icon="chatgpt.png">
          <div style={{ padding: "30px 34px", display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ alignSelf: "flex-end", background: C.tint, color: C.primary, fontSize: 25, fontWeight: 600, padding: "14px 24px", borderRadius: 24 }}>Write me a blog post</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, background: C.lav, padding: 24, borderRadius: 24, width: 400 }}>
              <Bar w={340} c="#ddd5ec" /><Bar w={300} c="#ddd5ec" /><Bar w={330} c="#ddd5ec" /><Bar w={200} c="#ddd5ec" />
            </div>
          </div>
        </Win>
        {f > 14 ? <Cursor x={cx} y={cy} press={f % 16 < 3 ? 1 : 0} /> : null}
        {label ? <div style={{ position: "absolute", left: cx + 44, top: cy + 34, background: C.text, color: "#fff", fontSize: 24, fontWeight: 600, padding: "5px 16px", borderRadius: 99, zIndex: 51 }}>{label}</div> : null}
      </CamMove>
      <Caption at={70} parts={[["Every tool starts from scratch"]]} />
    </AbsoluteFill>
  );
};

// ---------- beat 2: describe what to write, with inline tags (like the real prompt box) ----------

const SIDE: [string, string[]][] = [
  ["Research", ["Keyword Ideas", "SERP Competitors", "Keyword Gap", "Backlinks"]],
  ["AI Visibility", ["Prompt Ideas", "Prompt Tracking", "AI Action Plan"]],
];
const STEPS = [["Your request", "In progress"], ["Deep research", ""], ["Content type", ""], ["Context & instructions", ""], ["Writing mode", ""]];

type Kind = "keyword" | "competitor" | "prompt";
const TAG: Record<Kind, { bg: string; bd: string; dot: string }> = {
  keyword: { bg: "#fff5dc", bd: "#f1dc9c", dot: "#d49a00" },
  competitor: { bg: "#fdeceb", bd: "#f3c6c0", dot: "#d9594c" },
  prompt: { bg: "#e6f6ec", bd: "#b8e2c6", dot: "#2f9b5c" },
};
const Tag: React.FC<{ kind: Kind; name: string; sub: string; at: number }> = ({ kind, name, sub, at }) => {
  const f = useCurrentFrame();
  const p = springAt(f, at);
  if (f < at) return null;
  const t = TAG[kind];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 9, background: t.bg, border: `1.5px solid ${t.bd}`, borderRadius: 12, padding: "3px 14px 3px 10px", margin: "0 5px", fontSize: 23, verticalAlign: "middle", transform: `scale(${0.6 + 0.4 * p})`, opacity: Math.min(1, p * 1.6) }}>
      <span style={{ width: 16, height: 16, borderRadius: "50%", background: t.dot, flexShrink: 0 }} />
      <b style={{ fontWeight: 700 }}>{name}</b><span style={{ color: C.muted }}>{sub}</span>
    </span>
  );
};

// the "#" menu: what you saved in the Library, one row highlighted then picked
const Library: React.FC<{ t0: number; kind: Kind; rows: [string, string][] }> = ({ t0, kind, rows }) => {
  const f = useCurrentFrame();
  const open = prog(f, t0 + 2, t0 + 8) * (1 - prog(f, t0 + 16, t0 + 19));
  if (open <= 0) return null;
  const t = TAG[kind];
  return (
    <div style={{ position: "absolute", left: 40, top: 150, width: 640, background: "#fff", borderRadius: 18, boxShadow: "0 22px 60px rgba(60,20,120,.28), 0 0 0 2px #ece6f5", padding: 10, opacity: open, transform: `translateY(${(1 - open) * 10}px) scale(${0.97 + 0.03 * open})`, zIndex: 20 }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: C.muted, padding: "6px 14px", letterSpacing: ".06em" }}>FROM YOUR LIBRARY</div>
      {rows.map(([n, s], i) => (
        <div key={n} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 12, fontSize: 22, background: i === 0 && f >= t0 + 8 ? C.tint : "transparent" }}>
          <span style={{ width: 14, height: 14, borderRadius: "50%", background: t.dot }} />
          <b>{n}</b><span style={{ color: C.muted }}>{s}</span>
        </div>
      ))}
    </div>
  );
};

const KW = ["PRD", "+ prd template"] as const;
const CP = ["PRD", "· competitor.com"] as const;
const PR = ["PRD", "· How do I write a PRD engineers read?"] as const;
// local frames: text A 10-34, tag1 "#" 36 picked 52, B 54-64, tag2 "#" 66 picked 82, C 84-99, tag3 "#" 101 picked 117, D 119-136
const T = { a: 10, h1: 36, p1: 52, b: 54, h2: 66, p2: 82, c: 84, h3: 101, p3: 117, d: 119 };

const Request: React.FC = () => {
  const f = useCurrentFrame();
  const A = typed("Write a how-to guide on ", f, T.a, 30);
  const Bt = typed(", beating ", f, T.b, 30);
  const Ct = typed(" and answering ", f, T.c, 30);
  const D = typed(". Include internal links.", f, T.d, 45);
  const hash = (a: number, p: number) => f >= a && f < p ? "#" : "";
  const typing = f < 140;
  const understood = ["Target: PRD + 1 sub keyword", "1 topic", "1 competitor to beat", "Length: site setting", "Internal links on"];
  const [cx, cy] = lerpPath(f, [[176, 1010, 40], [196, 810, 290]]);
  const press = f >= 202 && f < 210 ? 1 : 0;
  return (
    <AbsoluteFill>
      <CamMove len={210} from={{ s: 1.0, x: 0, y: 0 }} to={{ s: 1.25, x: -50, y: 0 }} origin="62% 15%">
        <div style={{ position: "absolute", left: 90, top: 190, width: 1740, height: 800, borderRadius: 32, background: C.surface, boxShadow: "0 40px 100px rgba(60,20,120,.18), 0 0 0 2px #ece6f5", overflow: "hidden", display: "flex" }}>
          <div style={{ width: 290, borderRight: `2px solid ${C.line}`, padding: "30px 22px", flexShrink: 0 }}>
            <Img src={staticFile("logo.svg")} style={{ height: 34 }} />
            <div style={{ marginTop: 26, border: `2px solid ${C.line}`, borderRadius: 14, padding: "12px 16px", fontSize: 20, color: C.muted }}>Search or ask AI…</div>
            <div style={{ marginTop: 16, border: `2px solid ${C.line}`, borderRadius: 14, padding: "12px 16px", display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: C.tint, color: C.primary, fontWeight: 700, fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>A</div>
              <div><div style={{ fontSize: 21, fontWeight: 700 }}>Acme Product</div><div style={{ fontSize: 17, color: C.muted }}>acmeproduct.com</div></div>
            </div>
            {SIDE.map(([g, items]) => (
              <div key={g} style={{ marginTop: 26 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.muted, letterSpacing: ".08em", marginBottom: 8, paddingLeft: 8 }}>{g.toUpperCase()}</div>
                {items.map((n) => <div key={n} style={{ fontSize: 21, fontWeight: 500, color: C.text, padding: "9px 8px" }}>{n}</div>)}
              </div>
            ))}
          </div>
          <div style={{ flex: 1, position: "relative" }}>
            <div style={{ padding: "22px 40px", fontSize: 20, color: C.muted, borderBottom: `2px solid ${C.line}` }}>Article Writer  ›  <b style={{ color: C.text }}>New Content</b></div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "30px 44px 0" }}>
              {STEPS.map(([s, st], i) => (
                <React.Fragment key={s}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: i === 0 ? C.primary : C.lav, color: i === 0 ? "#fff" : C.muted, fontWeight: 700, fontSize: 19, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
                    <div><div style={{ fontSize: 19, fontWeight: 600, color: C.text }}>{s}</div>{st ? <div style={{ fontSize: 15, fontWeight: 600, color: C.primary }}>{st}</div> : null}</div>
                  </div>
                  {i < STEPS.length - 1 ? <div style={{ flex: 1, height: 2, background: C.line, minWidth: 10 }} /> : null}
                </React.Fragment>
              ))}
            </div>
            <div style={{ position: "absolute", left: 90, right: 90, top: 150 }}>
              <H style={{ fontSize: 44 }}>What should we write?</H>
              <div style={{ fontSize: 21, color: C.muted, marginTop: 6 }}>Type a keyword, or describe the article. <b style={{ color: C.primary }}>#</b> brings in what you saved in the Library.</div>
              <div style={{ position: "relative", marginTop: 26, height: 300, borderRadius: 22, border: `2px solid ${C.accent}`, boxShadow: `0 0 0 8px ${C.tint}`, background: "#fff", padding: "26px 32px" }}>
                <div style={{ fontSize: 28, fontWeight: 500, color: C.text, lineHeight: 1.85 }}>
                  {A}
                  <Tag kind="keyword" name={KW[0]} sub={KW[1]} at={T.p1} />
                  {Bt}
                  <Tag kind="competitor" name={CP[0]} sub={CP[1]} at={T.p2} />
                  {Ct}
                  <Tag kind="prompt" name={PR[0]} sub={PR[1]} at={T.p3} />
                  {D}
                  <b style={{ color: C.primary }}>{hash(T.h1, T.p1) || hash(T.h2, T.p2) || hash(T.h3, T.p3)}</b>
                  {typing ? <Caret h={32} /> : null}
                </div>
                <div style={{ position: "absolute", left: 28, right: 28, bottom: 22, display: "flex", alignItems: "center", gap: 12, fontSize: 20, fontWeight: 600 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, border: `2px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: C.muted }}>+</div>
                  <div style={{ border: `2px solid ${C.line}`, borderRadius: 12, padding: "10px 16px" }}>Acme Product</div>
                  <div style={{ border: `2px solid ${C.line}`, borderRadius: 12, padding: "10px 16px" }}>United States</div>
                  <div style={{ display: "flex", border: `2px solid ${C.line}`, borderRadius: 12, overflow: "hidden" }}>
                    <div style={{ padding: "10px 16px", background: C.primary, color: "#fff" }}>Desktop</div><div style={{ padding: "10px 16px", color: C.muted }}>Mobile</div>
                  </div>
                  <div style={{ marginLeft: "auto", background: C.primary, color: "#fff", padding: "13px 26px", borderRadius: 12, fontSize: 21, transform: `scale(${1 - press * 0.05})`, boxShadow: press ? `0 0 0 8px rgba(139,92,246,.25)` : "none" }}>Start research  →</div>
                </div>
                <Library t0={T.h1} kind="keyword" rows={[["PRD", "+ prd template"], ["Product roadmap", "+ 2 sub keywords"], ["Product discovery", ""]]} />
                <Library t0={T.h2} kind="competitor" rows={[["PRD", "· competitor.com"], ["PRD", "· another-rival.com"], ["Product roadmap", "· competitor.com"]]} />
                <Library t0={T.h3} kind="prompt" rows={[["PRD", "· How do I write a PRD engineers read?"], ["PRD", "· What goes in a PRD?"], ["Product roadmap", "· How to build a roadmap"]]} />
                {f >= 176 ? <Cursor x={cx} y={cy} press={press} /> : null}
              </div>
              <div style={{ marginTop: 22, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10, background: C.soft, borderRadius: 16, padding: "14px 20px", fontSize: 19, opacity: prog(f, 140, 150) }}>
                <span style={{ color: C.muted, fontWeight: 600 }}>I understood:</span>
                {understood.map((u, i) => {
                  const p = prog(f, 144 + i * 8, 144 + i * 8 + 8);
                  return <span key={u} style={{ opacity: p, transform: `translateY(${(1 - p) * 8}px)`, background: "#fff", border: `1.5px solid ${C.line}`, borderRadius: 99, padding: "6px 16px", fontWeight: 600 }}>{u}</span>;
                })}
              </div>
            </div>
          </div>
        </div>
      </CamMove>
      <Caption at={6} pos="tc" parts={[["Describe what to write"]]} />
    </AbsoluteFill>
  );
};

// ---------- beat 3: it researches first (headline left, tilted panel right, one source at a time) ----------

const SOURCES: { title: string; sub: string; logos?: string[] }[] = [
  { title: "AI Search", sub: "Questions asked in AI assistants", logos: ["chatgpt.png", "gemini.png", "perplexity.svg"] },
  { title: "Google top pages", sub: "Ranking blogs and guides", logos: ["google.png"] },
  { title: "Expert blog posts", sub: "And the sources they cite" },
  { title: "Your Search Console", sub: "Your own queries", logos: ["google.png"] },
];

const Research: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <CamMove len={150} from={{ s: 1, x: 0, y: 0 }} to={{ s: 1.04, x: -20, y: 0 }} origin="70% 50%">
        <Headline at={4} x={130} w={760} lines={[[["It researches"]], [["before", true], ["it writes"]]]} />
        <Panel x={960} y={110} w={860} h={860} tilt={-7} at={0}>
          <H style={{ fontSize: 42 }}>Deep research</H>
          <div style={{ fontSize: 24, color: C.muted, marginTop: 6 }}>Reading page one of Google and the AI answers</div>
          <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 22 }}>
            {SOURCES.map((s, i) => {
              const enter = 8 + i * 28, done = enter + 22;
              const show = prog(f, enter, enter + 12);
              const state = f >= done ? "done" : f >= enter + 6 ? "run" : "wait";
              const pop = f >= done ? 1 + 0.03 * Math.max(0, 1 - (f - done) / 8) : 1;
              return (
                <div key={s.title} style={{ height: 150, borderRadius: 26, border: `2px solid ${state === "run" ? C.accent : C.line}`, background: state === "done" ? C.soft : "#fff", padding: "0 34px", display: "flex", justifyContent: "space-between", alignItems: "center", opacity: show, transform: `translateY(${(1 - show) * 24}px) scale(${pop})` }}>
                  <div>
                    <div style={{ fontSize: 34, fontWeight: 700, color: C.text }}>{s.title}</div>
                    <div style={{ fontSize: 24, color: C.muted, marginTop: 4 }}>{s.sub}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                    {s.logos ? s.logos.map((l) => <Img key={l} src={staticFile(l)} style={{ width: 34, height: 34, objectFit: "contain" }} />) : null}
                    {state === "done" ? <Tick size={46} /> : state === "run" ? <Spinner size={42} /> : <Ring size={42} />}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </CamMove>
    </AbsoluteFill>
  );
};

// ---------- beat 4: you approve the outline (panel left, headline right, mirrored tilt) ----------

const OUTLINE = ["What a PRD is for", "What to put in it", "How to get engineers to read it", "A template you can copy"];
const EDIT_OLD = OUTLINE[1];
const EDIT_NEW = "What goes in a PRD";

const Outline: React.FC = () => {
  const f = useCurrentFrame();
  const row2 = f < 44 ? EDIT_OLD : f < 54 ? EDIT_OLD.slice(0, Math.floor(EDIT_OLD.length * (1 - (f - 44) / 10))) : typed(EDIT_NEW, f, 54, 22);
  const editing = f >= 36 && f < 84;
  const [cx, cy] = lerpPath(f, [[70, 560, 330], [92, 700, 770]]);
  const press = f >= 98 && f < 106 ? 1 : 0;
  const ripple = prog(f, 98, 116);
  return (
    <AbsoluteFill>
      <CamMove len={120} from={{ s: 1.04, x: 20, y: 0 }} to={{ s: 1, x: 0, y: 0 }} origin="30% 50%">
        <Panel x={110} y={110} w={940} h={860} tilt={7} at={0}>
          <H style={{ fontSize: 42 }}>Outline</H>
          <div style={{ fontSize: 24, color: C.muted, marginTop: 6 }}>Edit it, then approve. Nothing is written before you do.</div>
          <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 16 }}>
            <In at={4} y={10}>
              <div style={{ height: 82, borderRadius: 20, background: C.tint, display: "flex", alignItems: "center", padding: "0 28px", fontSize: 32, fontWeight: 700, color: C.primary }}>How to write a product requirements document</div>
            </In>
            {OUTLINE.map((t, i) => {
              const on = i === 1 && editing;
              return (
                <In key={t} at={10 + i * 7} y={10}>
                  <div style={{ height: 82, borderRadius: 20, border: `${on ? 3 : 2}px solid ${on ? C.accent : C.line}`, boxShadow: on ? `0 0 0 8px ${C.tint}` : "none", background: "#fff", display: "flex", alignItems: "center", gap: 20, padding: "0 28px", fontSize: 31, color: C.text, fontWeight: 500 }}>
                    <span style={{ color: "#c2bace", letterSpacing: 2 }}>⋮⋮</span>
                    <span>{i === 1 ? row2 : t}{on && f >= 44 ? <Caret h={32} /> : null}</span>
                  </div>
                </In>
              );
            })}
          </div>
          <div style={{ position: "absolute", right: 46, bottom: 40, transform: `scale(${f >= 98 ? 0.96 : 1})`, opacity: prog(f, 60, 72) }}>
            <div style={{ position: "absolute", inset: -ripple * 40, borderRadius: 99, border: `4px solid ${C.accent}`, opacity: f >= 98 ? 0.7 * (1 - ripple) : 0 }} />
            <div style={{ background: C.primary, color: "#fff", fontSize: 32, fontWeight: 700, padding: "20px 46px", borderRadius: 99, boxShadow: "0 12px 30px rgba(91,33,182,.35)" }}>{f >= 108 ? "Writing…" : "Approve & write"}</div>
          </div>
          {f > 66 ? <Cursor x={cx} y={cy} press={press} /> : null}
        </Panel>
        <Headline at={4} x={1130} w={700} lines={[[["You"], ["approve", true]], [["the outline"]], [["first"]]]} />
      </CamMove>
    </AbsoluteFill>
  );
};

// ---------- beat 5: draft in your voice, then checked (wide editor, camera pans to the checks) ----------

const S_LONG = "A product requirements document is a shared document that explains in detail what you are building, who it is for and how you will know it worked.";
const S_SHORT = "A PRD says what you are building, who it is for and how you will know it worked.";
const CHECKS = ["Citations", "Uncited figures", "Machine-sounding phrases", "Internal links placed"];

const Draft: React.FC = () => {
  const f = useCurrentFrame();
  const selecting = f >= 62 && f < 84;
  const swapped = f >= 84;
  const toolbar = prog(f, 60, 68) * (1 - prog(f, 84, 90));
  return (
    <AbsoluteFill>
      <CamMove len={150} from={{ s: 1.1, x: 60, y: 10 }} to={{ s: 1.1, x: -70, y: 10 }} origin="50% 40%">
        <Panel x={130} y={100} w={1180} h={800} at={0} style={{ padding: "44px 56px" }}>
          <Chip style={{ marginBottom: 22 }}><Pen /> Your writing style</Chip>
          <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: "-0.03em", color: C.text, lineHeight: 1.1, minHeight: 124 }}>{words("How to write a product requirements document", f, 2, 12)}</div>
          <div style={{ position: "relative", marginTop: 30, fontSize: 33, lineHeight: 1.6, color: "#3a3544" }}>
            {toolbar > 0 ? (
              <div style={{ position: "absolute", top: -78, left: 0, opacity: toolbar, transform: `translateY(${(1 - toolbar) * 10}px)`, display: "flex", gap: 6, background: "#fff", padding: "8px 10px", borderRadius: 18, boxShadow: "0 14px 34px rgba(60,20,120,.25)", fontSize: 24, fontWeight: 600, zIndex: 5 }}>
                {["Shorten", "Simplify", "More detailed"].map((t) => (
                  <div key={t} style={{ padding: "8px 18px", borderRadius: 12, background: t === "Shorten" && f >= 78 ? C.primary : "transparent", color: t === "Shorten" && f >= 78 ? "#fff" : C.text }}>{t}</div>
                ))}
              </div>
            ) : null}
            {f < 62 ? <span>{words(S_LONG, f, 24, 22)}{f < 62 ? <Caret h={34} /> : null}</span> : (
              <span style={{ background: selecting ? "#e4d6fb" : swapped && f < 96 ? C.tint : "transparent", borderRadius: 6 }}>{swapped ? S_SHORT : S_LONG}</span>
            )}
          </div>
        </Panel>
        <Panel x={1350} y={170} w={440} h={620} at={0} style={{ background: C.soft, padding: "38px 38px" }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: C.text }}>Checks</div>
          <div style={{ marginTop: 34, display: "flex", flexDirection: "column", gap: 34 }}>
            {CHECKS.map((c, i) => {
              const at = 100 + i * 12;
              const done = f >= at;
              const pop = done ? springAt(f, at) : 0;
              return (
                <div key={c} style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 28, fontWeight: 600, color: done ? C.text : "#a39cb2" }}>
                  <div style={{ width: 46, height: 46, borderRadius: "50%", background: done ? C.okTint : C.lav, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${done ? 0.7 + 0.3 * pop : 1})`, flexShrink: 0 }}>
                    {done ? <Tick size={30} /> : null}
                  </div>
                  {c}
                </div>
              );
            })}
          </div>
        </Panel>
      </CamMove>
      <Caption at={8} pos="br" parts={[["Writes in your style and"], ["checks", true], ["before export"]]} />
    </AbsoluteFill>
  );
};

// ---------- beat 6: end card ----------

const End: React.FC = () => {
  const f = useCurrentFrame();
  const L1 = ["AI", "does", "the", "work", "and", "you"];
  const L2: [string, boolean][] = [["stay", false], ["in", false], ["the", false], ["driving", true], ["seat", true]];
  const btn = springAt(f, 56);
  const fadeOut = prog(f, 108, 120); // dissolve to the light first frame so the loop seam is soft
  const word = (w: string, i: number, hot = false) => {
    const p = prog(f, 14 + i * 4, 14 + i * 4 + 14);
    return <span key={`${w}${i}`} style={{ display: "inline-block", marginRight: 26, opacity: p, transform: `translateY(${(1 - p) * 24}px)`, filter: `blur(${(1 - p) * 10}px)`, color: hot ? C.softPurple : "#fff" }}>{w}</span>;
  };
  return (
    <AbsoluteFill style={{ background: `radial-gradient(1500px 950px at 50% 125%, ${C.glow} 0%, ${C.night} 68%)` }}>
      <In at={2} y={18} style={{ position: "absolute", top: 150, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Img src={staticFile("logo-white.svg")} style={{ height: 92 }} />
      </In>
      <div style={{ position: "absolute", top: 330, left: 0, right: 0, textAlign: "center", fontSize: 112, fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.12 }}>
        <div>{L1.map((w, i) => word(w, i))}</div>
        <div>{L2.map(([w, hot], i) => word(w, i + L1.length, hot))}</div>
      </div>
      <div style={{ position: "absolute", top: 740, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: Math.min(1, btn * 1.4), transform: `scale(${0.85 + 0.15 * btn})` }}>
        <div style={{ background: "#fff", color: C.primary, fontSize: 46, fontWeight: 700, padding: "26px 74px", borderRadius: 99, boxShadow: "0 24px 60px rgba(139,92,246,.45)" }}>Claim your spot</div>
      </div>
      <AbsoluteFill style={{ background: C.bg, opacity: fadeOut }} />
    </AbsoluteFill>
  );
};

// ---------- the cut wipe, centred on each beat boundary ----------

const Wipe: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {CUTS.map((c) => {
        if (f < c - 10 || f > c + 10) return null;
        const left = interpolate(f, [c - 9, c + 9], [-2900, 1960], { ...clamp, easing: Easing.inOut(Easing.cubic) });
        const toEnd = c === B.end;
        return (
          <div key={c} style={{ position: "absolute", top: -100, bottom: -100, left, width: 2700, transform: "skewX(-10deg)", background: toEnd ? `linear-gradient(90deg, ${C.glow}, ${C.night} 30%)` : `linear-gradient(90deg, ${C.accent}, ${C.primary} 25%, ${C.primary})`, zIndex: 100 }} />
        );
      })}
    </>
  );
};

export const PROMO_FRAMES = TOTAL;

export const Promo: React.FC<{ music?: string }> = ({ music }) => (
  <AbsoluteFill style={{ background: C.bg, fontFamily, overflow: "hidden" }}>
    <AbsoluteFill style={{ background: `radial-gradient(1100px 700px at 88% 0%, #efe3ff 0%, transparent 70%), radial-gradient(900px 600px at 0% 100%, #f7eaff 0%, transparent 70%)` }} />
    <Sequence from={B.hook} durationInFrames={B.request - B.hook}><Hook /></Sequence>
    <Sequence from={B.request} durationInFrames={B.research - B.request}><Request /></Sequence>
    <Sequence from={B.research} durationInFrames={B.outline - B.research}><Research /></Sequence>
    <Sequence from={B.outline} durationInFrames={B.draft - B.outline}><Outline /></Sequence>
    <Sequence from={B.draft} durationInFrames={B.end - B.draft}><Draft /></Sequence>
    <Sequence from={B.end} durationInFrames={TOTAL - B.end}><End /></Sequence>
    <Wipe />
    {music ? <Audio src={staticFile(music)} /> : null}
  </AbsoluteFill>
);
