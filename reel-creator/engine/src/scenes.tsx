// Scene library: one picture per beat, drawn inside the box its layout gives it (w × h, centred).
// A new scene type goes in SCENES here first. Times are absolute seconds in the cut.
import React from "react";
import { Img, staticFile } from "remotion";
import { BrowserCard, Counter, LogoTile, Mark, Pop, SHADOW, clamp01, easeInOut, prog, useC, useNow } from "./kit";
import { ScoreDash, SheetTab, TABS } from "./sheet";

export type Scene = { type: string; [k: string]: any };
export type SceneProps = { s: Scene; w: number; h: number; dark: boolean };

/** Render children designed at dw × dh, scaled down to fit w × h and centred. */
const Fit: React.FC<{ dw: number; dh: number; w: number; h: number; children: React.ReactNode }> = ({ dw, dh, w, h, children }) => {
  const k = Math.min(w / dw, h / dh);
  return (
    <div style={{ width: w, height: h, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: dw * k, height: dh * k, position: "relative" }}>
        <div style={{ width: dw, height: dh, transform: `scale(${k})`, transformOrigin: "0 0", position: "absolute", left: 0, top: 0 }}>{children}</div>
      </div>
    </div>
  );
};
const URL = "docs.google.com/spreadsheets";

/** Which tab is showing at t, from [{at, tab}] steps. */
const tabAt = (steps: { at: number; tab: string }[], t: number) => {
  let cur = steps[0].tab;
  for (const st of steps) if (t >= st.at - 0.05) cur = st.tab;
  return cur;
};

const SheetScene: React.FC<SceneProps> = ({ s, w, h }) => {
  const t = useNow();
  const tab = s.tabs ? tabAt(s.tabs, t) : s.tab;
  const dw = s.dw ?? 1000, dh = s.dh ?? 860;
  // a tab switch re-pops the sheet body a little, so each step reads as a change
  const last = s.tabs ? [...s.tabs].reverse().find((x: { at: number }) => t >= x.at - 0.05) : null;
  const bump = last && last.at > (s.start ?? 0) + 0.05 ? prog(t, last.at - 0.05, 0.18) : 1;
  return (
    <Fit dw={dw} dh={dh} w={w} h={h}>
      <div style={{ position: "relative", width: dw, height: dh }}>
        <BrowserCard url={URL} w={dw} h={dh} glow={s.glow !== false}>
          <div style={{ opacity: 0.4 + 0.6 * bump, transform: `translateY(${(1 - bump) * 14}px)` }}>
            <SheetTab tab={tab} w={dw - 8} h={dh - 62} fs={s.fs ?? 19} ticks={s.ticks} chipGlow={s.chipGlow} cursor={s.cursor} />
          </div>
        </BrowserCard>
        {s.counter && (
          <div style={{ position: "absolute", right: -20, bottom: s.counter.bottom ?? -40 }}>
            <Counter at={s.counter.at} to={s.counter.to} label={s.counter.label} size={s.counter.size ?? 120} />
          </div>
        )}
      </div>
    </Fit>
  );
};

const HeaderScene: React.FC<SceneProps> = ({ s, w, h }) => {
  const C = useC();
  const t = useNow();
  const p = prog(t, s.ringAt, 0.35);
  const dw = 1000, dh = 860;
  return (
    <Fit dw={dw} dh={dh} w={w} h={h}>
      <BrowserCard url={URL} w={dw} h={dh}>
        <div style={{ position: "relative", padding: "18px 14px 10px", background: "#F9FBFD" }}>
          <Img src={staticFile(s.src)} style={{ width: dw - 36, display: "block" }} />
          <div style={{ position: "absolute", left: 14 + (dw - 36) * 0.08, top: 8, width: (dw - 36) * 0.925, height: 62,
            border: `3.5px solid ${C.accent}`, borderRadius: 14, opacity: p, transform: `scale(${1.15 - 0.15 * p})` }} />
        </div>
        <SheetTab tab="AEO Readiness" w={dw - 8} h={dh - 160} fs={19} />
      </BrowserCard>
    </Fit>
  );
};

const LogosScene: React.FC<SceneProps> = ({ s, w, h, dark }) => (
  <div style={{ width: w, height: h, display: "flex", alignItems: "center", justifyContent: "center", gap: 90 }}>
    {s.items.map((it: { src: string; name: string; at: number }) => <LogoTile key={it.src} src={it.src} name={it.name} at={it.at} size={s.size ?? 260} dark={dark} />)}
  </div>
);

const ScoreScene: React.FC<SceneProps> = ({ s, w, h }) => {
  const C = useC();
  const dw = 1000, dh = 860;
  return (
    <Fit dw={dw} dh={dh} w={w} h={h}>
      <div style={{ position: "relative", width: dw, height: dh }}>
        <BrowserCard url={URL} w={dw} h={dh}>
          <ScoreDash w={dw - 8} h={dh - 62} fs={26} ringTotalAt={s.ringAt} countAt={s.countAt} rowsAt={s.rowsAt} rowStep={s.rowStep} />
        </BrowserCard>
        {s.counter && (
          <div style={{ position: "absolute", right: -10, top: -70 }}>
            <Counter at={s.counter.at} to={s.counter.to} label={s.counter.label} size={130} />
          </div>
        )}
        {(s.chips ?? []).map((c: { text: string; at: number }, i: number) => (
          <Pop key={c.text} at={c.at} style={{ position: "absolute", left: 30 + i * 190, top: -50 }}>
            <div style={{ fontFamily: C.sans, fontWeight: 600, fontSize: 40, letterSpacing: "0.03em", color: C.accent, background: C.accentSoft, border: `2px solid ${C.accentTint}`, padding: "8px 28px", borderRadius: 40 }}>{c.text}</div>
          </Pop>
        ))}
      </div>
    </Fit>
  );
};

/** Product name card: logo tile, then the name with the second half in grey (Nick's naming card). */
const NameScene: React.FC<SceneProps> = ({ s, w, h, dark }) => {
  const C = useC();
  return (
    <div style={{ width: w, height: h, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40 }}>
      <LogoTile src={s.logo} at={s.logoAt} size={260} />
      <Pop at={s.nameAt}>
        <div style={{ fontFamily: C.sans, fontWeight: 600, fontSize: 80, letterSpacing: "0.01em", color: dark ? "#fff" : C.ink, whiteSpace: "nowrap" }}>
          {s.name[0]} <span style={{ color: C.muted }}>{s.name[1]}</span>
        </div>
      </Pop>
    </div>
  );
};

/** Sheets' "All sheets" menu: the tab list with a highlight stepping down it. */
const TabsMenuScene: React.FC<SceneProps> = ({ s, w, h }) => {
  const C = useC();
  const t = useNow();
  let idx = s.steps[0].i;
  let lastAt = s.steps[0].at;
  for (const st of s.steps) if (t >= st.at - 0.05) { idx = st.i; lastAt = st.at; }
  const dw = 820, dh = 980;
  const rowH = 86;
  const yOf = (i: number) => 120 + i * rowH;
  const prevIdx = Math.max(0, idx - 1);
  const k = easeInOut(clamp01((t - (lastAt - 0.05)) / 0.18));
  const hy = yOf(prevIdx) + (yOf(idx) - yOf(prevIdx)) * (idx === s.steps[0].i ? 1 : k);
  return (
    <Fit dw={dw} dh={dh} w={w} h={h}>
      <div style={{ width: dw, height: dh, background: "#fff", borderRadius: 28, boxShadow: SHADOW, position: "relative", overflow: "hidden", fontFamily: "Arial, sans-serif" }}>
        <div style={{ height: 100, display: "flex", alignItems: "center", gap: 20, padding: "0 40px", borderBottom: "1px solid #E3E3E3", fontSize: 34, color: "#3C4043" }}>
          <span style={{ fontSize: 40 }}>☰</span> All sheets
        </div>
        <div style={{ position: "absolute", left: 16, right: 16, top: hy + 6, height: rowH - 12, borderRadius: 16, background: C.accentSoft, border: `2px solid ${C.accentTint}` }} />
        {TABS.map((n, i) => (
          <div key={n} style={{ position: "absolute", left: 0, right: 0, top: yOf(i), height: rowH, display: "flex", alignItems: "center", padding: "0 52px", gap: 24,
            fontSize: 36, color: i === idx ? C.accent : "#3C4043", fontWeight: i === idx ? 700 : 400 }}>
            <span style={{ width: 30, textAlign: "center", color: i < idx ? C.accent : "transparent", fontWeight: 700 }}>✓</span>{n}
          </div>
        ))}
      </div>
    </Fit>
  );
};

/** One checklist row, zoomed: the item and its note, each highlighted on its word. */
const RowScene: React.FC<SceneProps> = ({ s, w, h }) => {
  const C = useC();
  const dw = 960, dh = 820;
  const head = (txt: string) => <div style={{ fontFamily: "Arial, sans-serif", fontWeight: 700, color: C.accent, fontSize: 30, marginBottom: 14 }}>{txt}</div>;
  return (
    <Fit dw={dw} dh={dh} w={w} h={h}>
      <div style={{ width: dw, height: dh, background: "#fff", borderRadius: 28, boxShadow: SHADOW, padding: "54px 60px", boxSizing: "border-box",
        display: "flex", flexDirection: "column", gap: 46, fontFamily: "Arial, sans-serif" }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#202124", display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 30, height: 30, border: "3px solid #F0A030", borderRadius: 4 }} />{s.category}
          <div style={{ marginLeft: "auto", background: "#D9EAD3", color: "#38761D", fontWeight: 400, fontSize: 28, padding: "6px 30px", borderRadius: 30 }}>{s.priority}</div>
        </div>
        <div>{head("Checklist Item")}<div style={{ fontSize: 58, lineHeight: 1.25, color: "#202124" }}>{s.itemAt !== undefined ? <Mark at={s.itemAt}>{s.item}</Mark> : s.item}</div></div>
        <div style={{ height: 2, background: "#E6E6E6" }} />
        <div>{head("Notes")}<div style={{ fontSize: 58, lineHeight: 1.25, color: "#202124" }}>{s.noteAt !== undefined ? <Mark at={s.noteAt} color={C.accentTint}>{s.note}</Mark> : s.note}</div></div>
      </div>
    </Fit>
  );
};

/** added: a mock of the prompt log tab (no screenshot of the real one yet). Engine columns reveal on their words. */
const PromptLogScene: React.FC<SceneProps> = ({ s, w, h }) => {
  const C = useC();
  const t = useNow();
  const dw = 1000, dh = 860;
  const cols: { src: string; name: string; at: number }[] = s.engines;
  return (
    <Fit dw={dw} dh={dh} w={w} h={h}>
      <BrowserCard url={URL} w={dw} h={dh}>
        <div style={{ fontFamily: "Arial, sans-serif", padding: "34px 36px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 40, fontWeight: 700, color: C.accent }}>{s.title}</div>
            <Img src={staticFile("logos/tmv-red.png")} style={{ height: 50 }} />
          </div>
          <div style={{ display: "flex", marginTop: 34, borderBottom: "3px solid #BDBDBD", paddingBottom: 18, alignItems: "flex-end" }}>
            <div style={{ flex: 1, fontSize: 28, fontWeight: 700, color: C.accent }}>Prompt</div>
            {cols.map((c) => {
              const p = prog(t, c.at - 0.05, 0.22);
              return (
                <div key={c.name} style={{ width: 170, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: 0.25 + 0.75 * p, transform: `scale(${0.85 + 0.15 * p})` }}>
                  <div style={{ width: 84, height: 84, borderRadius: 20, background: "#fff", boxShadow: SHADOW, display: "flex", alignItems: "center", justifyContent: "center",
                    border: p > 0.5 ? `3px solid ${C.accent}` : "1px solid #E3E3E3" }}>
                    <Img src={staticFile(c.src)} style={{ width: 54, height: 54, objectFit: "contain" }} />
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#3C4043" }}>{c.name}</div>
                </div>
              );
            })}
          </div>
          {s.rows.map((r: { prompt: string; hits: boolean[] }, i: number) => (
            <div key={i} style={{ display: "flex", alignItems: "center", height: 112, borderBottom: "1px solid #E6E6E6" }}>
              <div style={{ flex: 1, fontSize: 30, color: "#202124", paddingRight: 20 }}>{r.prompt}</div>
              {cols.map((c, j) => {
                const p = prog(t, c.at + 0.08 + i * 0.07, 0.18);
                const hit = r.hits[j];
                return (
                  <div key={j} style={{ width: 170, display: "flex", justifyContent: "center" }}>
                    <div style={{ opacity: p, transform: `scale(${0.6 + 0.4 * p})`, fontSize: 30, fontWeight: 700, padding: "6px 22px", borderRadius: 24,
                      background: hit ? "#D9EAD3" : "#F4CCCC", color: hit ? "#38761D" : "#CC0000" }}>{hit ? "Cited" : "Missing"}</div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </BrowserCard>
    </Fit>
  );
};

/** The same sheet fanning out into copies, one per site (site names are added placeholders). */
const StackScene: React.FC<SceneProps> = ({ s, w, h }) => {
  const C = useC();
  const t = useNow();
  const k = easeInOut(clamp01((t - s.fanAt) / 0.5));
  const sites: string[] = s.sites;
  const dw = 1000, dh = 900;
  const cw = 640, ch = 520;
  return (
    <Fit dw={dw} dh={dh} w={w} h={h}>
      <div style={{ width: dw, height: dh, position: "relative" }}>
        {sites.map((site, i) => {
          const n = sites.length - 1;
          const f = n ? i / n - 0.5 : 0; // -0.5 .. 0.5
          const x = (dw - cw) / 2 + f * 300 * k;
          const y = (dh - ch) / 2 + Math.abs(f) * 90 * k - (i === n ? 0 : 20 * k);
          const rot = f * 16 * k;
          const show = i === n ? 1 : prog(t, s.fanAt + (n - i) * 0.06, 0.2);
          return (
            <div key={site} style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg)`, opacity: show, zIndex: i }}>
              <BrowserCard url={site} w={cw} h={ch} glow={i === n}>
                <div style={{ fontFamily: "Arial, sans-serif" }}>
                  <div style={{ height: 70, display: "flex", alignItems: "center", justifyContent: "center" }}><Img src={staticFile("logos/tmv-red.png")} style={{ height: 44 }} /></div>
                  <div style={{ height: 44, background: "#A8473F", color: "#fff", fontWeight: 700, fontSize: 19, display: "flex", alignItems: "center", justifyContent: "center" }}>AEO &amp; GEO Audit Checklist</div>
                  {Array.from({ length: 6 }).map((_, r) => (
                    <div key={r} style={{ height: 50, display: "flex", alignItems: "center", gap: 16, padding: "0 22px", borderBottom: "1px solid #EEE" }}>
                      <div style={{ width: 20, height: 20, border: "2px solid #F0A030", borderRadius: 3 }} />
                      <div style={{ height: 14, width: `${45 + ((r * 29 + i * 13) % 35)}%`, background: "#ECEDEF", borderRadius: 4 }} />
                      <div style={{ marginLeft: "auto", width: 80, height: 24, borderRadius: 12, background: ["#D9EAD3", "#CFE2F3", "#FFF2CC"][r % 3] }} />
                    </div>
                  ))}
                </div>
              </BrowserCard>
            </div>
          );
        })}
        <Pop at={s.fanAt + 0.25} style={{ position: "absolute", left: 0, right: 0, bottom: -10, display: "flex", justifyContent: "center", zIndex: 20 }}>
          <div style={{ fontFamily: C.sans, fontWeight: 600, fontSize: 42, letterSpacing: "0.02em", color: C.accent, background: C.accentSoft, border: `2px solid ${C.accentTint}`, padding: "10px 34px", borderRadius: 44 }}>{s.label}</div>
        </Pop>
      </div>
    </Fit>
  );
};

/** One big number on its own (the hook): calmer than a number stacked on a card. */
const CounterScene: React.FC<SceneProps> = ({ s, w, h }) => (
  <div style={{ width: w, height: h, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <Counter at={s.at} to={s.to} label={s.label} size={s.size ?? 190} dur={s.dur ?? 0.8} />
  </div>
);

export const SCENES: Record<string, React.FC<SceneProps>> = {
  counter: CounterScene, sheet: SheetScene, header: HeaderScene, logos: LogosScene, score: ScoreScene, name: NameScene,
  tabsMenu: TabsMenuScene, row: RowScene, promptLog: PromptLogScene, stack: StackScene,
};
