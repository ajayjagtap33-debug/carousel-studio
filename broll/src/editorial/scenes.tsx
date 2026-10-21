// Editorial scene types (style C and friends). Every `at` is an absolute time in the cut (seconds),
// taken from transcript.json so each element lands on its word. A new type goes in ESCENES first.
import React from "react";
import { Img, staticFile, interpolate } from "remotion";
import { ECard, EIcon, Enter, Headline, Kicker, Txt, useIn, useNow, useRamp, useT } from "./kit";

export type EScene = { type: string; start: number; end: number; [k: string]: any };

// ---- shared bits --------------------------------------------------------------------------------------------

/** Arrow that draws itself left → right from `at`. */
export const Arrow: React.FC<{ at: number; w?: number; color?: string }> = ({ at, w = 110, color }) => {
  const T = useT();
  const d = useRamp(at, 0.45);
  const c = color ?? T.muted;
  return (
    <svg width={w} height={30} style={{ overflow: "visible", flexShrink: 0 }}>
      <path d={`M4 15 L${w - 6} 15`} stroke={c} strokeWidth={2.4} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} />
      <path d={`M${w - 18} 6 L${w - 6} 15 L${w - 18} 24`} stroke={c} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={d > 0.9 ? 1 : 0} />
    </svg>
  );
};

type TileSpec = { label: string; sub?: string; subAt?: number; icon?: string; logo?: string; tone?: "ai" | "brand"; at: number };

/** Square tile: logo or icon, label, optional kicker that arrives later. tone ai = purple, brand = TMV red outline. */
export const Tile: React.FC<{ s: TileSpec; size?: number }> = ({ s, size = 300 }) => {
  const T = useT();
  const sub = useIn(s.subAt ?? s.at);
  const ai = s.tone === "ai";
  return (
    <Enter at={s.at}>
      <ECard w={size} h={size}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20,
          background: ai ? T.aiSoft ?? T.card : T.card, ...(ai ? { borderColor: "transparent" } : {}) }}>
        {s.logo ? <Img src={staticFile(s.logo)} style={{ width: size * 0.32, height: size * 0.32, objectFit: "contain", borderRadius: 18 }} />
          : <EIcon name={s.icon ?? "box"} size={size * 0.24} color={ai ? T.ai ?? T.accent : T.ink} />}
        <Txt font="head" size={size * 0.13} style={{ textAlign: "center", padding: "0 18px" }}>{s.label}</Txt>
        {s.sub && <div style={{ opacity: sub, transform: `translateY(${(1 - sub) * 8}px)` }}><Kicker color={ai ? T.ai : undefined}>{s.sub}</Kicker></div>}
      </ECard>
    </Enter>
  );
};

/** A row that fades in on its word; `tick` = time a check lands. */
const Row: React.FC<{ at: number; icon?: string; text?: string; bar?: number; num?: number; tick?: number; indent?: number; faint?: boolean }> = ({ at, icon, text, bar, num, tick, indent = 0, faint }) => {
  const T = useT();
  const k = useIn(tick ?? 1e9, 14);
  return (
    <Enter at={at} dy={10}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, height: faint ? 44 : 68, paddingLeft: 24 + indent, paddingRight: 24 }}>
        {num !== undefined && <div style={{ width: 38, height: 38, borderRadius: 19, background: T.accentSoft, color: T.accent, fontFamily: T.ui,
          fontWeight: 700, fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>{num}</div>}
        {icon && <EIcon name={icon} size={faint ? 22 : 32} color={T.body} />}
        {text ? <Txt size={faint ? 24 : 32} color={faint ? T.muted : T.ink} style={{ flex: 1 }}>{text}</Txt>
          : <div style={{ flex: 1 }}><div style={{ width: bar ?? 260, height: faint ? 12 : 16, borderRadius: 8, background: T.line }} /></div>}
        {tick !== undefined && <div style={{ width: 34, height: 34, borderRadius: 17, background: T.good, opacity: k, transform: `scale(${0.6 + 0.4 * k})`,
          display: "flex", alignItems: "center", justifyContent: "center" }}><EIcon name="check" size={20} color="#fff" /></div>}
      </div>
    </Enter>
  );
};

// ---- browser: a page in a browser frame (screenshot `src` if supplied, else a neutral stand-in page) ----------
// {at, title, titleAt, url?, src?, pushAt?}
const Browser: React.FC<{ s: EScene }> = ({ s }) => {
  const T = useT();
  const push = useRamp(s.pushAt ?? 1e9, 1.6);
  const title = useIn(s.titleAt ?? s.at);
  const W = 1240, H = 720;
  return (
    <Enter at={s.at} dy={30} style={{ transform: `scale(${1 + 0.06 * push})` }}>
      <div data-box style={{ width: W, height: H, borderRadius: T.radius, overflow: "hidden", boxShadow: T.shadow, border: `1px solid ${T.line}`, background: "#fff" }}>
        <div style={{ height: 50, background: "#F1EEEC", display: "flex", alignItems: "center", gap: 9, padding: "0 20px" }}>
          {["#E8A39C", "#EBCB8B", "#A9C9A4"].map((c) => <div key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c }} />)}
          <div data-lint="chrome" style={{ marginLeft: 18, flex: 1, height: 30, borderRadius: 8, background: "#fff", fontFamily: T.ui, fontSize: 17, color: T.muted,
            display: "flex", alignItems: "center", paddingLeft: 14 }}>{s.url ?? "…/knowledge-base"}</div>
        </div>
        {s.src ? <Img src={staticFile(s.src)} style={{ width: "100%", height: H - 50, objectFit: "cover", objectPosition: "top" }} /> : (
          <div style={{ display: "flex", height: H - 50 }}>
            <div style={{ width: 260, borderRight: `1px solid ${T.line}`, padding: "34px 26px", background: "#FDFBFA" }}>
              {[150, 120, 170, 110, 140, 130, 160].map((w, i) => (
                <div key={i} style={{ width: w, height: 12, borderRadius: 6, background: i === 2 ? T.accentSoft : T.line, marginBottom: 26 }} />
              ))}
            </div>
            <div style={{ flex: 1, padding: "52px 64px" }}>
              <div style={{ opacity: title, transform: `translateY(${(1 - title) * 12}px)`, filter: `blur(${(1 - title) * 8}px)` }}>
                <Kicker>Help center</Kicker>
                <Txt font="head" size={64} style={{ marginTop: 14 }}>{s.title ?? "Knowledge base"}</Txt>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginTop: 44 }}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} style={{ height: 120, borderRadius: 12, border: `1px solid ${T.line}`, padding: 22, boxSizing: "border-box" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: i === 0 ? T.accentSoft : "#F4EFED" }} />
                    <div style={{ width: [200, 170, 220, 150][i], height: 12, borderRadius: 6, background: T.line, marginTop: 20 }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Enter>
  );
};

// ---- statement: a kinetic headline on its own (no tiles), optional kicker above ----------------------------
// {headline, headlineAt?, headlineGap?, headlineSize?, kicker?, kickerAt?}
const Statement: React.FC<{ s: EScene }> = ({ s }) => {
  const k = useIn(s.kickerAt ?? 1e9);
  return (
    <div style={{ width: "100%", padding: "0 70px", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
      {s.kicker && <div style={{ opacity: k, transform: `translateY(${(1 - k) * 10}px)` }}><Kicker>{s.kicker}</Kicker></div>}
      <Headline text={s.headline} at={s.headlineAt ?? s.start} gap={s.headlineGap ?? 0.3} size={s.headlineSize ?? 128} />
    </div>
  );
};

// ---- flow: optional kinetic headline that lifts away, then tiles joined by + or → ---------------------------
// {headline?, headlineAt?, liftAt?, joiner: "plus" | "arrow", tiles: [TileSpec], joinAt?: [t...]}
const Flow: React.FC<{ s: EScene }> = ({ s }) => {
  const T = useT();
  const lift = useRamp(s.liftAt ?? 1e9, 0.6);
  const tiles: TileSpec[] = s.tiles ?? [];
  // headline sits in the middle, then shrinks and lifts to the top as the tiles arrive below it
  return (
    <div style={{ position: "relative", width: 1300, height: 760 }}>
      {s.headline && (
        <div style={{ position: "absolute", left: 0, right: 0, top: "50%", transform: `translateY(${-50 - lift * 165}%) scale(${1 - 0.45 * lift})` }}>
          <Headline text={s.headline} at={s.headlineAt ?? s.start} size={s.headlineSize ?? 150} gap={s.headlineGap ?? 0.3} />
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: s.headline ? 170 : 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 34 }}>
        {tiles.map((t, i) => (
          <React.Fragment key={i}>
            {i > 0 && (s.joiner === "arrow" ? <Arrow at={s.joinAt?.[i - 1] ?? t.at - 0.2} /> :
              <Enter at={s.joinAt?.[i - 1] ?? t.at - 0.2}><div style={{ fontFamily: T.ui, fontSize: 64, fontWeight: 300, color: T.muted }}>+</div></Enter>)}
            <Tile s={t} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// ---- file: a document card (mono name) with rows that arrive on their words ---------------------------------
// {at, name, rows: [{text, icon?, at, sub?: [t...]}]}
const File: React.FC<{ s: EScene }> = ({ s }) => {
  const T = useT();
  return (
    <Enter at={s.at} dy={26}>
      <ECard w={1000} style={{ padding: "34px 30px 34px", transform: "scale(1.12)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "0 24px 22px", borderBottom: `1px solid ${T.line}`, marginBottom: 14 }}>
          <EIcon name="file-text" size={40} color={T.accent} />
          <Txt font="mono" size={34}>{s.name}</Txt>
        </div>
        {(s.rows ?? []).map((r: any, i: number) => (
          <React.Fragment key={i}>
            <Row at={r.at} icon={r.icon} text={r.text} />
            {(r.sub ?? []).map((t: number, j: number) => <Row key={j} at={t} faint bar={[340, 280, 310][j % 3]} indent={52} />)}
          </React.Fragment>
        ))}
      </ECard>
    </Enter>
  );
};

// ---- pipeline: source doc → chain of prompts → result list ---------------------------------------------------
// {doc: {name, at}, arrows: [t, t], prompts: [{label, at}], result: {title, at, rows: [{at, tick?}]}}
const Pipeline: React.FC<{ s: EScene }> = ({ s }) => {
  const T = useT();
  const prompts: { label: string; at: number }[] = s.prompts ?? [];
  const link = useRamp(prompts[1]?.at ?? 1e9, 0.8);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
      <Enter at={s.doc.at}>
        <ECard w={230} h={260} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
          <EIcon name="file-text" size={64} color={T.accent} />
          <Txt font="mono" size={24}>{s.doc.name}</Txt>
        </ECard>
      </Enter>
      <Arrow at={s.arrows?.[0] ?? s.doc.at + 0.5} w={90} />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 22 }}>
        <svg width={20} height={260} style={{ position: "absolute", left: -2, top: 40, overflow: "visible" }}>
          <path d="M10 0 L10 200" stroke={T.ai ?? T.accent} strokeWidth={2} strokeDasharray="1" pathLength={1} strokeDashoffset={1 - link} fill="none" opacity={0.5} />
        </svg>
        {prompts.map((p, i) => (
          <Enter key={i} at={p.at} dy={12}>
            <ECard w={330} h={84} style={{ display: "flex", alignItems: "center", gap: 16, padding: "0 22px", background: T.aiSoft ?? T.card, borderColor: "transparent" }}>
              <EIcon name="sparkles" size={30} color={T.ai ?? T.accent} />
              <Txt size={30} weight={600}>{p.label}</Txt>
              <div style={{ flex: 1 }} />
              <div style={{ width: 70, height: 10, borderRadius: 5, background: "rgba(123,58,236,.18)" }} />
            </ECard>
          </Enter>
        ))}
      </div>
      <Arrow at={s.arrows?.[1] ?? (prompts[prompts.length - 1]?.at ?? 0) + 0.6} w={90} />
      <Enter at={s.result.at}>
        <ECard w={400} style={{ padding: "26px 8px 18px" }}>
          <Txt font="head" size={44} style={{ padding: "0 24px 12px" }}>{s.result.title}</Txt>
          {(s.result.rows ?? []).map((r: any, i: number) => <Row key={i} at={r.at} num={i + 1} bar={[170, 210, 150][i % 3]} tick={r.tick} />)}
        </ECard>
      </Enter>
    </div>
  );
};

export const ESCENES: Record<string, React.FC<{ s: EScene }>> = { browser: Browser, statement: Statement, flow: Flow, file: File, pipeline: Pipeline };
