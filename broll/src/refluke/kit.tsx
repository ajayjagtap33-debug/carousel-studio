// Refluke kit: the motion vocabulary from assets/refluke-broll/library.md §7.
// Timing hooks are shared with the editorial style (all `at` values are absolute seconds in the cut).
import React, { createContext, useContext } from "react";
import { interpolate } from "remotion";
import { LintCtx, useIn, useNow, useRamp } from "../editorial/kit";
import { R, type RTheme } from "./theme";

export { useIn, useNow, useRamp, LintCtx };

export const ThemeCtx = createContext<RTheme>(R);
export const useT = () => useContext(ThemeCtx);

/** House entrance: blur → sharp, small rise, fade. Everything lands on the word that introduces it. */
export const Enter: React.FC<{
  at: number; dy?: number; style?: React.CSSProperties; children: React.ReactNode;
}> = ({ at, dy = 16, style, children }) => {
  const p = useIn(at);
  return (
    <div style={{
      opacity: Math.min(1, p * 1.3),
      filter: `blur(${(1 - p) * 10}px)`,
      transform: `translateY(${(1 - p) * dy}px)`,
      ...style,
    }}>{children}</div>
  );
};

// ---------------------------------------------------------------- text
export const Ser: React.FC<{
  size?: number; lh?: number; color?: string; italic?: boolean; style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ size = 72, lh = 1.1, color, italic, style, children }) => {
  const T = useT();
  return <div data-text style={{
    fontFamily: italic ? T.headItalic : T.head, fontStyle: italic ? "italic" : "normal",
    fontWeight: 400, fontSize: size, lineHeight: lh, letterSpacing: "-0.005em",
    color: color ?? T.ink, ...style,
  }}>{children}</div>;
};

/**
 * `chrome` exempts a line from the type floor. Use it ONLY for text that is not ours to set:
 * a byline or body line inside a screenshot mock, where we are depicting someone else's page.
 * Never use it to get our own copy past the lint — shorten the copy or raise the size instead.
 */
export const Ui: React.FC<{
  size?: number; weight?: number; color?: string; chrome?: boolean;
  style?: React.CSSProperties; children: React.ReactNode;
}> = ({ size = 30, weight = 400, color, chrome, style, children }) => {
  const T = useT();
  return <div data-text data-lint={chrome ? "chrome" : undefined} style={{
    fontFamily: T.ui, fontSize: size, fontWeight: weight, lineHeight: 1.3,
    color: color ?? T.body, ...style,
  }}>{children}</div>;
};

export const Mono: React.FC<{
  size?: number; color?: string; chrome?: boolean; children: React.ReactNode;
}> = ({ size = 21, color, chrome, children }) => {
  const T = useT();
  return <div data-text data-lint={chrome ? "chrome" : undefined}
    style={{ fontFamily: T.mono, fontSize: size, color: color ?? T.muted }}>{children}</div>;
};

/** All-caps letterspaced eyebrow. Load-bearing in this style; see library.md §1. */
export const Eyebrow: React.FC<{ at?: number; children: React.ReactNode }> = ({ at = 0, children }) => {
  const T = useT();
  return (
    <Enter at={at} dy={8}>
      <div data-text style={{
        fontFamily: T.ui, fontSize: 21, fontWeight: 500, letterSpacing: "0.18em",
        textTransform: "uppercase", color: T.muted,
      }}>{children}</div>
    </Enter>
  );
};

/** Headline whose *words* in asterisks become italic olive. Words enter one at a time. */
export const Head: React.FC<{
  text: string; at: number; gap?: number; size?: number; align?: "left" | "center";
}> = ({ text, at, gap = 0.14, size = 84, align = "left" }) => {
  const T = useT();
  const words = text.split(" ");
  let acc = false;
  return (
    <div data-text style={{
      display: "flex", flexWrap: "wrap", columnGap: size * 0.26, rowGap: size * 0.12,
      justifyContent: align === "center" ? "center" : "flex-start",
      fontFamily: T.head, fontWeight: 400, fontSize: size, lineHeight: 1.08,
      letterSpacing: "-0.005em", color: T.ink, textAlign: align,
    }}>
      {words.map((w, i) => {
        if (w.startsWith("*")) acc = true;
        const isAcc = acc;
        if (w.endsWith("*")) acc = false;
        const clean = w.replace(/\*/g, "");
        return (
          <Enter key={i} at={at + i * gap} dy={10}>
            <span style={isAcc ? { color: T.accent, fontStyle: "italic", fontFamily: T.headItalic } : undefined}>
              {clean}
            </span>
          </Enter>
        );
      })}
    </div>
  );
};

/** A number that counts up rather than cutting in. */
export const CountUp: React.FC<{
  at: number; to: number; dur?: number; size?: number; prefix?: string; suffix?: string; group?: boolean;
}> = ({ at, to, dur = 0.9, size = 150, prefix = "", suffix = "", group = true }) => {
  const p = useRamp(at, dur);
  const v = Math.round(to * p);
  const s = group ? v.toLocaleString("en-US") : String(v);
  return <Ser size={size} lh={1.04}>{prefix}{s}{suffix}</Ser>;
};

/** Typewriter for anything typed into an interface. */
export const Typewriter: React.FC<{
  at: number; text: string; cps?: number; size?: number; color?: string; inline?: boolean;
}> = ({ at, text, cps = 26, size = 34, color, inline }) => {
  const T = useT();
  const t = useNow();
  const lint = useContext(LintCtx);
  const n = lint ? text.length : Math.max(0, Math.min(text.length, Math.floor((t - at) * cps)));
  const done = n >= text.length;
  const style: React.CSSProperties = {
    fontFamily: T.ui, fontSize: size, lineHeight: 1.45, color: color ?? T.ink,
  };
  const body = (
    <>
      {text.slice(0, n)}
      {!done && <span style={{ color: T.accent }}>▌</span>}
    </>
  );
  // inline: sits on the same line as a prompt character, e.g. `> /skills`
  return inline
    ? <span data-text style={style}>{body}</span>
    : <div data-text style={style}>{body}</div>;
};

/** Underline that sweeps in under a clause. */
export const Underline: React.FC<{
  at: number; dur?: number; children: React.ReactNode;
}> = ({ at, dur = 0.45, children }) => {
  const T = useT();
  const p = useRamp(at, dur);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      {children}
      <span style={{
        position: "absolute", left: 0, bottom: -4, height: 3, width: `${p * 100}%`,
        background: T.accent,
      }} />
    </span>
  );
};

// ---------------------------------------------------------------- chrome
export const Pill: React.FC<{
  at: number; tone?: "ink" | "accent" | "soft"; style?: React.CSSProperties; children: React.ReactNode;
}> = ({ at, tone = "ink", style, children }) => {
  const T = useT();
  const p = useIn(at, 14);
  const bg = tone === "accent" ? T.accent : tone === "soft" ? T.card : T.ink;
  const fg = tone === "soft" ? T.ink : "#FFFFFF";
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 10, background: bg, color: fg,
      fontFamily: T.ui, fontWeight: 500, fontSize: 25, padding: "11px 22px", borderRadius: 999,
      boxShadow: tone === "soft" ? T.shadow : "none",
      opacity: Math.min(1, p * 1.4), transform: `scale(${0.88 + 0.12 * p})`, ...style,
    }}>{children}</div>
  );
};

export const Card: React.FC<{
  w?: number | string; h?: number | string; dark?: boolean; pad?: number;
  style?: React.CSSProperties; children: React.ReactNode;
}> = ({ w, h, dark, pad = 40, style, children }) => {
  const T = useT();
  return (
    <div data-box style={{
      width: w, height: h, boxSizing: "border-box", padding: pad,
      background: dark ? T.ink : T.card, color: dark ? "#FFFFFF" : T.ink,
      borderRadius: T.radius, boxShadow: T.shadow, ...style,
    }}>{children}</div>
  );
};

/**
 * `● SOURCE · Publication · "quote" · date` — above every screenshot.
 * Marked chrome: it is attribution furniture, deliberately set at 20px mono (library.md §1),
 * which is below the 24px floor the lint holds our own copy to.
 */
export const SourceBar: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const T = useT();
  return (
    <Enter at={at} dy={6}>
      <div data-lint="chrome" style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: T.mono, fontSize: 20, color: T.muted }}>
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: T.accent }} />
        SOURCE &nbsp;·&nbsp; {children}
      </div>
    </Enter>
  );
};

export const Tick: React.FC<{ at: number; size?: number }> = ({ at, size = 38 }) => {
  const T = useT();
  const p = useIn(at, 12);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: T.success, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      transform: `scale(${p})`, opacity: Math.min(1, p * 1.6),
    }}>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none"
        stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4,12.5 9.5,18 20,6.5" />
      </svg>
    </div>
  );
};

/**
 * A spine / checklist row. Ghost rows render at full height and are REPLACED in place, so
 * nothing ever reflows (library.md §7.3).
 */
export const Row: React.FC<{
  text: string; doneAt?: number; activeAt?: number; revealAt?: number;
}> = ({ text, doneAt, activeAt, revealAt }) => {
  const T = useT();
  const t = useNow();
  const lint = useContext(LintCtx);
  const shown = lint || (revealAt !== undefined && t >= revealAt);
  const active = !lint && activeAt !== undefined && t >= activeAt && (doneAt === undefined || t < doneAt);
  const done = lint || (doneAt !== undefined && t >= doneAt);

  if (!shown) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "19px 24px" }}>
        <div style={{ width: 30, height: 30, borderRadius: 7, background: T.ghost, opacity: 0.75, flexShrink: 0 }} />
        <div style={{
          height: 19, width: Math.min(560, 15 + text.length * 11), borderRadius: 5,
          background: T.ghost, filter: "blur(2.5px)",
        }} />
      </div>
    );
  }
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 20, padding: "19px 24px", margin: "3px 0",
      background: active ? T.accent : "transparent", borderRadius: 12,
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 7, flexShrink: 0,
        background: active ? "rgba(255,255,255,.22)" : T.ghost,
      }} />
      <div style={{
        flex: 1, fontFamily: T.ui, fontSize: 33, fontWeight: active ? 500 : 400,
        color: active ? "#FFFFFF" : T.muted,
      }}>{text}</div>
      {done && !active && <Tick at={doneAt ?? 0} />}
    </div>
  );
};

/** A bar that fills from zero. */
export const BarFill: React.FC<{
  at: number; label: string; value: string; frac: number; tone?: "accent" | "ghost"; dur?: number;
}> = ({ at, label, value, frac, tone = "accent", dur = 0.7 }) => {
  const T = useT();
  const p = useRamp(at, dur);
  return (
    <div style={{ marginBottom: 40 }}>
      <Enter at={at} dy={8}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 16 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: T.ghost, flexShrink: 0 }} />
          <div style={{ flex: 1, fontFamily: T.ui, fontSize: 32, color: T.ink }}>{label}</div>
          <Ser size={38}>{value}</Ser>
        </div>
      </Enter>
      <div style={{ height: 26, background: T.ghost, borderRadius: 999, overflow: "hidden" }}>
        <div style={{
          height: 26, width: `${frac * p}%`, borderRadius: 999,
          background: tone === "accent" ? T.accent : "#C9CCC2",
        }} />
      </div>
    </div>
  );
};

/** An SVG path that draws itself on. */
export const DrawPath: React.FC<{
  at: number; d: string; len?: number; dur?: number; color?: string; width?: number;
}> = ({ at, d, len = 1600, dur = 1.1, color, width = 4.5 }) => {
  const T = useT();
  const p = useRamp(at, dur);
  return (
    <path d={d} fill="none" stroke={color ?? T.deep} strokeWidth={width} strokeLinecap="round"
      strokeDasharray={len} strokeDashoffset={len * (1 - p)} />
  );
};

/** Arrow that draws itself left → right. */
export const Arrow: React.FC<{ at: number; w?: number; color?: string }> = ({ at, w = 84, color }) => {
  const T = useT();
  const p = useRamp(at, 0.4);
  const c = color ?? T.accent;
  return (
    <svg width={w} height={18} style={{ flexShrink: 0, overflow: "visible" }}>
      <line x1={0} y1={9} x2={(w - 11) * p} y2={9} stroke={c} strokeWidth={2.2} />
      <polyline points={`${w - 19},3 ${w - 9},9 ${w - 19},15`} fill="none" stroke={c} strokeWidth={2.2}
        style={{ opacity: p > 0.92 ? 1 : 0 }} />
    </svg>
  );
};

export const Node: React.FC<{
  at: number; kind?: "light" | "dark" | "green"; w?: number; children: React.ReactNode;
}> = ({ at, kind = "light", w = 300, children }) => {
  const T = useT();
  const bg = kind === "dark" ? T.ink : kind === "green" ? T.accent : T.card;
  const fg = kind === "light" ? T.ink : "#FFFFFF";
  return (
    <Enter at={at}>
      <div data-box style={{
        width: w, padding: 32, background: bg, color: fg, borderRadius: T.radius,
        boxShadow: T.shadow, fontFamily: T.ui, fontSize: 30, lineHeight: 1.25,
      }}>{children}</div>
    </Enter>
  );
};

/** Browser-ish window for screenshots and docs. */
export const Win: React.FC<{
  at: number; w?: number; h?: number; dark?: boolean; children: React.ReactNode;
}> = ({ at, w = 1060, h = 560, dark, children }) => {
  const T = useT();
  return (
    <Enter at={at} dy={22}>
      <div data-box style={{
        width: w, height: h, background: dark ? "#111413" : T.card, borderRadius: T.radius,
        boxShadow: T.shadowLg, overflow: "hidden", position: "relative",
      }}>
        <div style={{
          height: 46, background: dark ? "#1A1E1C" : T.panel,
          borderBottom: `1px solid ${dark ? "#242927" : T.line}`,
          display: "flex", alignItems: "center", paddingLeft: 20, gap: 9,
        }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: 11, height: 11, borderRadius: "50%", background: dark ? "#333" : "#E2E2DE" }} />
          ))}
        </div>
        {children}
      </div>
    </Enter>
  );
};

/** Blurred placeholder line — the ghost-row device, for screenshot bodies. */
export const Ghost: React.FC<{ w: string; h?: number; mb?: number }> = ({ w, h = 19, mb = 16 }) => {
  const T = useT();
  return <div style={{ height: h, width: w, background: T.ghost, borderRadius: 5, marginBottom: mb }} />;
};

/** Stagger helper: children appear one at a time from `at`, every `gap` seconds. */
export const Stagger: React.FC<{
  at: number; gap?: number; dy?: number; style?: React.CSSProperties; children: React.ReactNode;
}> = ({ at, gap = 0.3, dy = 14, style, children }) => (
  <div style={style}>
    {React.Children.map(children, (c, i) => (
      <Enter at={at + i * gap} dy={dy}>{c}</Enter>
    ))}
  </div>
);

export const fade = (t: number, from: number, to: number) =>
  interpolate(t, [from, to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
