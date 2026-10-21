// Style sample: the same 5 scenes rendered in direction A or B, so Ajay can compare.
// Content is placeholder (no real claims). Times are seconds in this 22s clip.
import React from "react";
import { AbsoluteFill, interpolate, useVideoConfig } from "remotion";
import { THEMES } from "./themes";
import { ECard, EIcon, Enter, Headline, Kicker, Pill, ThemeCtx, Txt, useIn, useNow, useRamp, useT } from "./kit";

// ---- frame: sheet on a border, reserved face box on the right edge -----------------------------------------
const FACE = { w: 210, h: 270, right: 56 };
const CONTENT_W = 1920 - FACE.w - FACE.right - 120;

const Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const T = useT();
  return (
    <AbsoluteFill style={{ background: T.border }}>
      <div style={{ position: "absolute", inset: 22, borderRadius: 26, background: T.pageBg ?? T.page, overflow: "hidden" }}>{children}</div>
      <div style={{ position: "absolute", right: FACE.right, top: (1080 - FACE.h) / 2, width: FACE.w, height: FACE.h, borderRadius: 18,
        background: "linear-gradient(160deg,#8d8f93,#5f6266)", boxShadow: "0 12px 30px rgba(0,0,0,.25)", display: "flex",
        alignItems: "flex-end", justifyContent: "center", paddingBottom: 14, boxSizing: "border-box" }}>
        <div style={{ fontFamily: T.ui, fontSize: 18, color: "rgba(255,255,255,.85)", letterSpacing: "0.1em", textTransform: "uppercase" }}>your face</div>
      </div>
    </AbsoluteFill>
  );
};

/** Scene window with the reference's motion-blur slide in/out. */
const Scene: React.FC<{ from: number; to: number; children: React.ReactNode; first?: boolean; last?: boolean }> = ({ from, to, children, first, last }) => {
  const t = useNow();
  if (t < from - 0.01 || t > to + 0.01) return null;
  const inP = first ? 1 : interpolate(t, [from, from + 0.35], [0, 1], { extrapolateRight: "clamp" });
  const outP = last ? 0 : interpolate(t, [to - 0.3, to], [0, 1], { extrapolateLeft: "clamp" });
  const x = (1 - inP) * 260 - outP * 260;
  const blur = (1 - inP) * 22 + outP * 22;
  return (
    <AbsoluteFill style={{ width: CONTENT_W + 60, opacity: Math.min(inP * 1.5, 1 - outP * 0.8), transform: `translateX(${x}px)`, filter: `blur(${blur}px)` }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
    </AbsoluteFill>
  );
};

// ---- 1. kinetic headline ---------------------------------------------------------------------------------
const S1: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 46, width: 1380 }}>
    <Enter at={0.2}><Kicker>Sample · editorial style</Kicker></Enter>
    <Headline text="How to survive the next *two years* of AI" at={0.4} size={118} />
    <div style={{ display: "flex", gap: 18 }}>
      <Pill at={2.2} tone="soft" icon="shield">security</Pill>
      <Pill at={2.5} tone="soft" icon="briefcase">jobs &amp; income</Pill>
      <Pill at={2.8} tone="soft" icon="sparkles">identity</Pill>
    </div>
  </div>
);

// ---- 2. section map with camera push on the active card ---------------------------------------------------
const MAP = [
  { k: "Short term", icon: "shield", label: "Security" },
  { k: "Mid term", icon: "briefcase", label: "Jobs & income" },
  { k: "Long term", icon: "brain", label: "Beliefs & identity" },
];
const S2: React.FC = () => {
  const T = useT();
  const act = useRamp(6.3, 0.4);
  const push = useRamp(6.3, 1.4);
  return (
    <div style={{ position: "relative", transform: `scale(${1 + 0.08 * push}) translateX(${push * 60}px)`, transformOrigin: "center" }}>
      <div style={{ display: "flex", gap: 40 }}>
        {MAP.map((m, i) => (
          <Enter key={i} at={4.2 + i * 0.35}>
            <ECard w={380} h={330} active={i === 0 ? act : 0} dim={i === 0 ? 0 : act}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26 }}>
              <Kicker color={i === 0 ? undefined : T.muted}>{m.k}</Kicker>
              <EIcon name={m.icon} size={78} color={i === 0 ? T.accent : T.ink} />
              <Txt font="head" size={44}>{m.label}</Txt>
            </ECard>
          </Enter>
        ))}
      </div>
      <div style={{ position: "absolute", left: 190, transform: "translateX(-50%)", marginTop: 34 }}>
        <Pill at={6.9} tone="accent" icon="lock">physical security</Pill>
      </div>
    </div>
  );
};

// ---- 3. equation build, board pans as it grows -------------------------------------------------------------
const TILES = [
  { icon: "flame", v: "2,000", l: "calories a day", at: 8.65 },
  { icon: "calendar", v: "14", l: "days", at: 9.7 },
  { icon: "users", v: "2", l: "people", at: 10.4 },
];
const Tile: React.FC<{ icon: string; v: string; l: string; accent?: boolean }> = ({ icon, v, l, accent }) => {
  const T = useT();
  return (
    <ECard w={250} h={250} active={accent ? 1 : 0} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14,
      background: accent ? T.accentSoft : T.card }}>
      <EIcon name={icon} size={44} color={accent ? T.accent : T.ink} />
      <Txt font="head" size={74} style={{ lineHeight: 1 }}>{v}</Txt>
      <Kicker>{l}</Kicker>
    </ECard>
  );
};
const Op: React.FC<{ at: number; c: string }> = ({ at, c }) => {
  const T = useT();
  return <Enter at={at}><div style={{ fontFamily: T.ui, fontSize: 54, color: T.muted, width: 70, textAlign: "center" }}>{c}</div></Enter>;
};
const S3: React.FC = () => {
  const pan = useRamp(10.4, 0.9) * 0.5 + useRamp(11.2, 0.8) * 0.5;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 46, transform: `translateX(${260 - pan * 260}px)` }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        {TILES.map((t, i) => (
          <React.Fragment key={i}>
            {i > 0 && <Op at={t.at - 0.15} c="×" />}
            <Enter at={t.at}><Tile icon={t.icon} v={t.v} l={t.l} /></Enter>
          </React.Fragment>
        ))}
        <Op at={11.05} c="=" />
        <Enter at={11.2}><Tile icon="utensils" v="56K" l="calories" accent /></Enter>
      </div>
      <Pill at={12.0}>about $100–150 of non-perishables</Pill>
    </div>
  );
};

// ---- 4. source card: article in a browser frame + pulled sentence with highlight ---------------------------
const S4: React.FC = () => {
  const T = useT();
  const hl = useRamp(15.5, 0.7);
  const lift = useIn(14.8, 16);
  return (
    <div style={{ position: "relative", width: 1240, height: 760 }}>
      <Enter at={13.3}>
        <div style={{ width: 1100, height: 640, borderRadius: T.radius, overflow: "hidden", boxShadow: T.shadow, border: `1px solid ${T.line}`, background: "#fff" }}>
          <div style={{ height: 52, background: "#EEEFF1", display: "flex", alignItems: "center", gap: 10, padding: "0 20px" }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />)}
            <div style={{ marginLeft: 20, flex: 1, height: 30, borderRadius: 8, background: "#fff", fontFamily: T.ui, fontSize: 17, color: "#80848B", display: "flex", alignItems: "center", paddingLeft: 14 }}>samplenews.com/2026/10/your-source</div>
          </div>
          <div style={{ padding: "44px 64px" }}>
            <Txt size={20} weight={600} color="#80848B" style={{ letterSpacing: "0.12em", textTransform: "uppercase" }}>The Sample Times · Technology</Txt>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 54, fontWeight: 700, color: "#111", lineHeight: 1.1, marginTop: 18, width: 900 }}>
              Your cited article shows up here, framed like the real page
            </div>
            {[860, 940, 900, 720, 880].map((w, i) => <div key={i} style={{ width: w, height: 16, borderRadius: 8, background: "#E9EAEC", marginTop: i ? 16 : 36 }} />)}
          </div>
        </div>
      </Enter>
      <div style={{ position: "absolute", left: 120, top: 430, width: 980, opacity: Math.min(1, lift * 1.4), transform: `translateY(${(1 - lift) * 40}px)`, filter: `blur(${(1 - lift) * 10}px)` }}>
        <ECard style={{ padding: "34px 40px" }}>
          <Txt size={36} weight={400} style={{ lineHeight: 1.45 }}>
            “The sentence you quote gets pulled out, and{" "}
            <span style={{ backgroundImage: `linear-gradient(${T.accentSoft}, ${T.accentSoft})`, backgroundRepeat: "no-repeat",
              backgroundSize: `${hl * 100}% 100%`, boxShadow: hl > 0.98 ? `inset 0 -3px 0 ${T.accent}` : "none", padding: "0 4px" }}>
              the key phrase is highlighted</span>{" "}as you say it.”
          </Txt>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 20 }}>
            <div style={{ width: 9, height: 9, borderRadius: 5, background: T.accent }} />
            <Txt size={20} weight={600} color={T.muted} style={{ letterSpacing: "0.12em", textTransform: "uppercase" }}>Source · The Sample Times · Oct 2026</Txt>
          </div>
        </ECard>
      </div>
    </div>
  );
};

// ---- 5. running checklist: earlier items ticked, current one activates, then ticks -------------------------
const LIST = [
  { icon: "utensils", t: "Food and water" }, { icon: "banknote", t: "Cash" }, { icon: "briefcase-medical", t: "First aid kit" },
  { icon: "hard-drive", t: "Local LLM + Wikipedia" }, { icon: "shield-check", t: "Digital security" },
];
const Row: React.FC<{ i: number }> = ({ i }) => {
  const T = useT();
  const act = useRamp(18.3, 0.35);
  const tick = useRamp(19.7, 0.3);
  const done = i < 3 ? 1 : i === 3 ? tick : 0;
  const on = i === 3 ? act * (1 - done) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, height: 74, padding: "0 26px", borderRadius: 12,
      background: on > 0.5 ? T.accent : i === 3 && done > 0.5 ? T.accentSoft : "transparent", color: on > 0.5 ? T.accentInk : T.ink }}>
      <EIcon name={LIST[i].icon} size={34} color={on > 0.5 ? T.accentInk : T.body} />
      <Txt size={32} color={on > 0.5 ? T.accentInk : i < 3 ? T.body : T.ink} style={{ flex: 1 }}>{LIST[i].t}</Txt>
      <div style={{ width: 36, height: 36, borderRadius: 18, background: T.good, opacity: done, transform: `scale(${0.6 + 0.4 * done})`,
        display: "flex", alignItems: "center", justifyContent: "center" }}><EIcon name="check" size={22} color="#fff" /></div>
    </div>
  );
};
const S5: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
    <Enter at={17.5}>
      <ECard w={820} style={{ padding: "36px 36px 26px" }}>
        <Txt font="head" size={56} style={{ marginBottom: 18, marginLeft: 26 }}>Quick hit list</Txt>
        {LIST.map((_, i) => <Row key={i} i={i} />)}
      </ECard>
    </Enter>
    <Pill at={20.2}>very straightforward</Pill>
  </div>
);

export type SampleProps = { theme: "A" | "B" | "C" };
export const SAMPLE_SECONDS = 22;

export const Sample: React.FC<SampleProps> = ({ theme }) => {
  const T = THEMES[theme];
  const { width } = useVideoConfig();
  return (
    <ThemeCtx.Provider value={T}>
      <Frame>
        <div style={{ position: "absolute", left: 0, top: 0, width, height: "100%" }}>
          <Scene from={0} to={4.2} first><S1 /></Scene>
          <Scene from={4.2} to={8.6}><S2 /></Scene>
          <Scene from={8.6} to={13}><S3 /></Scene>
          <Scene from={13} to={17.3}><S4 /></Scene>
          <Scene from={17.3} to={SAMPLE_SECONDS} last><S5 /></Scene>
        </div>
      </Frame>
      <div style={{ position: "absolute", left: 50, bottom: 40, fontFamily: T.ui, fontSize: 18, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>{T.name}</div>
    </ThemeCtx.Provider>
  );
};
