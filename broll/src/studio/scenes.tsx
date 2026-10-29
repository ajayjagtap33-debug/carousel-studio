// Studio scene types. Board scenes get the box they may fill (set by the layout the scene starts in) and lay
// themselves out centred in it. `words` and `type` draw over his footage instead and get `face` (his head centre).
// Every element lands on its word (`at`, seconds in the cut).
import React from "react";
import { Img, interpolateColors, staticFile } from "remotion";
import { Accent, Card, Chip, Display, Enter, Icon, Label, SHADOW, clamp01, ramp, useC, useIn, useNow } from "./kit";

export type Box = { x: number; w: number };
export type Face = { x: number; y: number };
export type SScene = { type: string; start: number; end: number; slug?: string; source?: string; [k: string]: any };
type View = React.FC<{ s: SScene; box: Box; face: Face }>;

const W = 1920, H = 1080;
const HEAD_HALF = 0.135; // half the head's width as a fraction of the frame: keep this column clear of words

const Centre: React.FC<{ children: React.ReactNode; align?: "center" | "flex-start" }> = ({ children, align = "center" }) => (
  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: align }}>{children}</div>
);

/** Full-frame words: white, straight on the footage, no wash. Split either side of his head, or one line at
 *  chest height. Never over eyes or mouth (Ajay, 2026-10-29). */
const Words: View = ({ s, face }) => {
  const C = useC();
  const lines = s.lines as { text: string; at: number; size?: number }[];
  const place = (s.place ?? (lines.length > 1 ? "split" : "chest")) as "split" | "chest" | "left";
  const shadow = "0 1px 10px rgba(0,0,0,0.22)";
  const left = face.x * W - HEAD_HALF * W - 60;   // right edge of the clear column left of his head
  const right = face.x * W + HEAD_HALF * W + 60;  // left edge of the clear column right of his head
  const eye = face.y * H;

  const line = (l: { text: string; at: number; size?: number }, align: "left" | "right" | "center", style: React.CSSProperties) => (
    <div style={{ position: "absolute", ...style }}>
      <Display text={l.text} at={l.at} size={l.size ?? 76} align={align === "right" ? "left" : align} color="#FFFFFF"
        accent={C.onDark} style={{ textShadow: shadow, justifyContent: align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start" }} />
    </div>
  );

  if (place === "chest") {
    return <>{lines.map((l, i) => line(l, "center", { left: 90, width: W - 180, top: 0.70 * H + i * (l.size ?? 76) * 1.2, key: i } as any))}</>;
  }
  if (place === "left") {
    return <>{lines.map((l, i) => line(l, "left", { left: 100, width: left - 100, top: eye - 40 + i * (l.size ?? 76) * 1.2, key: i } as any))}</>;
  }
  // split: first line left of his head, the rest to the right, both at eye level
  return (
    <>
      {line(lines[0], "right", { left: 90, width: left - 90, top: eye - 54 } as any)}
      {lines.slice(1).map((l, i) => line(l, "left", { left: right, width: W - right - 90, top: eye - 54 + (i + (lines.length > 2 ? 1 : 0)) * (l.size ?? 76) * 1.2, key: i } as any))}
    </>
  );
};

/** The line that matters most: a hard cut to a full-screen card for 2-4s. One huge line, one accent. */
const TypeCard: View = ({ s }) => {
  const C = useC();
  const p = useIn(s.at ?? s.start, 0.5);
  const size = s.size ?? 170;
  const mode = (s.accentMode ?? "font") as "font" | "highlight" | "underline";
  const words = (s.line as string).split(" ");
  let acc = false;
  return (
    <div style={{ position: "absolute", inset: 0, background: C.page, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 110px" }}>
      <div style={{ opacity: p, filter: p < 1 ? `blur(${(1 - p) * 26}px)` : undefined, transform: `translateX(${(1 - p) * -70}px)`,
        fontFamily: C.fonts.display, fontWeight: C.fonts.displayWeight, fontSize: size, lineHeight: 1.04, letterSpacing: "-0.02em",
        color: C.ink, textAlign: "center", display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline", columnGap: size * 0.24 }}>
        {words.map((w, i) => {
          if (w.startsWith("*")) acc = true;
          const isAcc = acc;
          if (w.endsWith("*")) acc = false;
          const word = w.replace(/\*/g, "");
          if (!isAcc) return <span key={i}>{word}</span>;
          if (mode === "font") return <Accent key={i} size={size}>{word}</Accent>;
          if (mode === "highlight") return (
            <span key={i} style={{ position: "relative", padding: "0 0.1em" }}>
              <span style={{ position: "absolute", left: 0, right: 0, top: "0.16em", bottom: "0.08em", background: C.accentSoft, borderRadius: 8 }} />
              <span style={{ position: "relative", color: C.accent }}>{word}</span>
            </span>
          );
          return <span key={i} style={{ boxShadow: `inset 0 -0.12em 0 ${C.accent}` }}>{word}</span>;
        })}
      </div>
      {s.sub && <div style={{ position: "absolute", left: 0, right: 0, bottom: 110, display: "flex", justifyContent: "center" }}>
        <Enter at={s.subAt ?? (s.at ?? s.start) + 0.6}><Label size={40}>{s.sub}</Label></Enter>
      </div>}
    </div>
  );
};

/** Two to four cards side by side, each landing on its word: the three uses, or this-vs-that. */
const Trio: View = ({ s, box }) => {
  const C = useC();
  const cards = s.cards as { word: string; sub?: string; icon?: string; at: number; tone?: "plain" | "accent" | "muted" }[];
  const w = Math.min(box.w - 60, cards.length * 400);
  return (
    <Centre>
      <div style={{ width: w }}>
        {s.headline && <Display text={s.headline} at={s.headlineAt ?? s.start} size={s.headlineSize ?? 72} align="center" style={{ marginBottom: 46 }} />}
        <div style={{ display: "flex", gap: 26, justifyContent: "center" }}>
          {cards.map((c, i) => {
            const accent = c.tone === "accent";
            const muted = c.tone === "muted";
            return (
              <Enter key={i} at={c.at}>
                <Card style={{ width: Math.floor((w - 26 * (cards.length - 1)) / cards.length), padding: "40px 34px",
                  background: accent ? C.accentSoft : C.card, borderColor: accent ? C.accent : C.line,
                  display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 20, opacity: muted ? 0.66 : 1 }}>
                  {c.icon && <Icon name={c.icon} size={52} color={accent ? C.accent : C.body} />}
                  <div style={{ fontFamily: C.fonts.display, fontWeight: C.fonts.displayWeight, fontSize: s.wordSize ?? 62,
                    letterSpacing: "-0.015em", color: accent ? C.accent : C.ink, lineHeight: 1.05 }}>{c.word}</div>
                  {c.sub && <Label size={34} color={C.body}>{c.sub}</Label>}
                </Card>
              </Enter>
            );
          })}
        </div>
      </div>
    </Centre>
  );
};

/** Several screenshots landing one by one: a deck, a set of carousels, a run of work. */
const Gallery: View = ({ s, box }) => {
  const C = useC();
  const items = s.items as { src: string; at: number }[];
  const cols = s.cols ?? Math.ceil(items.length / 2);
  const w = Math.min(box.w - 60, s.w ?? 1500);
  const cellW = Math.floor((w - 22 * (cols - 1)) / cols);
  return (
    <Centre>
      <div style={{ width: w }}>
        {s.title && <Display text={s.title} at={s.titleAt ?? s.start} size={s.titleSize ?? 66} align="center" style={{ marginBottom: 34 }} />}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${cellW}px)`, gap: 22, justifyContent: "center" }}>
          {items.map((it, i) => (
            <Enter key={i} at={it.at} dy={18}>
              <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, boxShadow: SHADOW, padding: 8 }}>
                <Img src={staticFile(it.src)} style={{ width: "100%", display: "block", borderRadius: 8 }} />
              </div>
            </Enter>
          ))}
        </div>
        {s.cap && <div style={{ display: "flex", justifyContent: "center", marginTop: 30 }}>
          <Enter at={s.capAt ?? s.start}><Chip tone="soft" size={34}>{s.cap}</Chip></Enter>
        </div>}
      </div>
    </Centre>
  );
};

/** One big number that counts up on its word. */
const Count: View = ({ s }) => {
  const C = useC();
  const t = useNow();
  const v = s.value * Math.pow(clamp01((t - s.at) / 1.1), 0.45);
  const txt = (s.prefix ?? "") + v.toLocaleString("en-US", { minimumFractionDigits: s.decimals ?? 0, maximumFractionDigits: s.decimals ?? 0 }) + (s.suffix ?? "");
  return (
    <Centre>
      {s.kicker && <Enter at={s.kickerAt ?? s.start}><Label size={38}>{s.kicker}</Label></Enter>}
      <Enter at={s.at} style={{ fontFamily: C.fonts.display, fontWeight: C.fonts.displayWeight, fontSize: s.size ?? 240, lineHeight: 1.05,
        color: C.ink, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", margin: "18px 0 26px" }}>{txt}</Enter>
      {s.sub && <Enter at={s.subAt}><Chip tone="soft" size={34}>{s.sub}</Chip></Enter>}
    </Centre>
  );
};

/** A card that builds row by row; the newest row is filled dark, like the reference's checklist. */
const List: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const rows = s.rows as { text: string; icon: string; at: number }[];
  return (
    <Centre>
      <Enter at={s.titleAt ?? s.start}>
        <Card w={Math.min(1000, box.w - 60)} style={{ padding: "40px 40px 30px" }}>
          <div style={{ fontFamily: C.fonts.display, fontWeight: C.fonts.displayWeight, fontSize: 60, letterSpacing: "-0.015em", color: C.ink, marginBottom: 22 }}>{s.title}</div>
          {rows.map((r, i) => {
            const on = ramp(t, r.at - 0.15, 0.3) * (1 - (rows[i + 1] ? ramp(t, rows[i + 1].at - 0.15, 0.3) : 0));
            const fg = interpolateColors(on, [0, 1], [C.ink, "#FFFFFF"]);
            return (
              <Enter key={i} at={r.at} dy={10}>
                <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "16px 22px", marginTop: 8, borderRadius: 12,
                  background: interpolateColors(on, [0, 1], ["#F4F3EF", C.dark]) }}>
                  <Icon name={r.icon} size={32} color={fg} />
                  <div style={{ fontFamily: C.fonts.plain, fontSize: 36, fontWeight: C.fonts.plainWeight, color: fg }}>{r.text}</div>
                </div>
              </Enter>
            );
          })}
        </Card>
      </Enter>
    </Centre>
  );
};

/** The video's outline: known items in words, the rest as blurred bars, current one dark. */
const Spine: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const items = s.items as Record<string, string>;
  const on = ramp(t, s.at - 0.15, 0.35);
  return (
    <Centre>
      <Enter at={s.start}>
        <Card w={Math.min(880, box.w - 60)} style={{ padding: "36px 40px 28px" }}>
          {s.kicker && <Label size={34}>{s.kicker}</Label>}
          <div style={{ fontFamily: C.fonts.display, fontWeight: C.fonts.displayWeight, fontSize: 64, letterSpacing: "-0.015em", color: C.ink, margin: "8px 0 18px" }}>{s.title}</div>
          {Array.from({ length: s.total }, (_, k) => {
            const n = k + 1, cur = n === s.current, done = n < s.current, text = items[String(n)];
            const fill = cur ? on : 0;
            const fg = interpolateColors(fill, [0, 1], [done ? C.muted : C.ink, "#FFFFFF"]);
            return (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 20, height: 56, padding: "0 20px", borderRadius: 10, marginTop: 4,
                background: interpolateColors(fill, [0, 1], ["rgba(0,0,0,0)", C.dark]) }}>
                <div style={{ fontFamily: C.fonts.display, fontSize: 32, fontWeight: C.fonts.displayWeight, color: fg, width: 40, fontVariantNumeric: "tabular-nums" }}>{n}</div>
                {text && (cur || done)
                  ? <div style={{ fontFamily: C.fonts.plain, fontSize: 32, fontWeight: C.fonts.plainWeight, color: fg }}>{text}</div>
                  : <div style={{ height: 14, width: 200 + ((n * 97) % 260), borderRadius: 7, background: "#ECEAE4", filter: "blur(1.5px)" }} />}
              </div>
            );
          })}
        </Card>
      </Enter>
    </Centre>
  );
};

/** A screenshot, with a plain source line, an optional ring drawn on one part, and pills below. */
const Shot: View = ({ s, box }) => {
  const C = useC();
  const w = Math.min(s.w ?? 1300, box.w - 60);
  const ring = s.ring as { x: number; y: number; w: number; h: number; at: number } | undefined;
  const rp = useIn(ring?.at ?? 1e9, 0.45);
  return (
    <Centre>
      <Enter at={s.start} style={{ width: w }}>
        {s.sourceLine && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 9, height: 9, borderRadius: 9, background: C.accent }} />
            <Label size={32}>{s.sourceLine}</Label>
          </div>
        )}
        <Card style={{ padding: 14, position: "relative" }}>
          <Img src={staticFile(s.src)} style={{ width: "100%", display: "block", borderRadius: 10 }} />
          {ring && (
            <div style={{ position: "absolute", left: `calc(14px + ${ring.x * 100}% - 8px)`, top: `calc(14px + ${ring.y * 100}% - 8px)`,
              width: `calc(${ring.w * 100}% - 12px)`, height: `calc(${ring.h * 100}% - 12px)`, border: `4px solid ${C.accent}`, borderRadius: 12,
              opacity: rp, transform: `scale(${1.08 - 0.08 * rp})` }} />
          )}
        </Card>
      </Enter>
      <div style={{ display: "flex", gap: 16, marginTop: 30 }}>
        {(s.pills ?? []).map((p: { text: string; at: number; tone?: "ink" | "accent" | "soft" }, i: number) => (
          <Enter key={i} at={p.at}><Chip tone={p.tone} size={34}>{p.text}</Chip></Enter>
        ))}
      </div>
    </Centre>
  );
};

/** A display headline, then takeaway rows that stack under it. */
const Points: View = ({ s, box }) => {
  const C = useC();
  return (
  <Centre>
    <div style={{ width: Math.min(1240, box.w - 60) }}>
      <Display text={s.headline} at={s.headlineAt ?? s.start} size={s.size ?? 82} />
      <div style={{ marginTop: 40 }}>
        {(s.rows as { text: string; icon: string; at: number }[]).map((r, i) => (
          <Enter key={i} at={r.at} style={{ marginTop: 14 }}>
            <Card style={{ display: "flex", alignItems: "center", gap: 22, padding: "22px 28px" }}>
              <Icon name={r.icon} size={34} />
              <div style={{ fontFamily: C.fonts.plain, fontSize: 36, fontWeight: C.fonts.plainWeight, color: C.ink }}>{r.text}</div>
            </Card>
          </Enter>
        ))}
      </div>
    </div>
  </Centre>
  );
};

/** A share that counts up beside the places it is about; each place then gets the same tag. */
const Places: View = ({ s }) => {
  const C = useC();
  const t = useNow();
  const v = s.value * Math.pow(clamp01((t - s.at) / 1.1), 0.45);
  const places = s.places as { text: string; at: number }[];
  return (
    <Centre>
      <div style={{ display: "flex", alignItems: "center", gap: 90 }}>
        <div style={{ width: 560 }}>
          <Enter at={s.at} style={{ fontFamily: C.fonts.display, fontWeight: C.fonts.displayWeight, fontSize: 210, lineHeight: 1,
            letterSpacing: "-0.03em", color: C.ink, fontVariantNumeric: "tabular-nums" }}>
            {v.toFixed(s.decimals ?? 0)}{s.suffix ?? ""}
          </Enter>
          <Enter at={s.subAt} style={{ marginTop: 18 }}><Label size={36} color={C.body}>{s.sub}</Label></Enter>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "340px 340px", gap: 20 }}>
          {places.map((p, i) => (
            <Enter key={i} at={p.at}>
              <Card style={{ height: 170, padding: "26px 26px 22px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Icon name="map-pin" size={28} color={C.muted} />
                  <div style={{ fontFamily: C.fonts.display, fontWeight: C.fonts.displayWeight, fontSize: 48, color: C.ink, lineHeight: 1 }}>{p.text}</div>
                </div>
                <Enter at={s.tagAt + i * 0.1} dy={6}><Chip tone="accent" size={28}>{s.tag}</Chip></Enter>
              </Card>
            </Enter>
          ))}
        </div>
      </div>
    </Centre>
  );
};

/** A ChatGPT exchange: the question types out, then a sponsored card; `flagAt` marks the mismatch in red. */
const Chat: View = ({ s, box }) => {
  const C = useC();
  const t = useNow();
  const q = s.q as string;
  const typed = q.slice(0, Math.round(q.length * clamp01((t - s.qAt) / (s.qDur ?? 1.4))));
  const flag = ramp(t, s.flagAt - 0.1, 0.3);
  const mark = (txt: string) => {
    const i = txt.indexOf(s.mark);
    if (i < 0) return txt;
    return <>{txt.slice(0, i)}<span style={{ color: interpolateColors(flag, [0, 1], [C.ink, C.accent]),
      boxShadow: `inset 0 -${4 * flag}px 0 ${C.accent}` }}>{txt.slice(i, i + s.mark.length)}</span>{txt.slice(i + s.mark.length)}</>;
  };
  return (
    <Centre>
      {s.kicker && <Enter at={s.start} style={{ marginBottom: 22 }}><Label size={34}>{s.kicker}</Label></Enter>}
      <Enter at={s.start + 0.1}>
        <Card w={Math.min(900, box.w - 60)} style={{ padding: "26px 34px 34px", minHeight: 560 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 20, borderBottom: `1px solid ${C.line}` }}>
            <Img src={staticFile(s.logo)} style={{ width: 34, height: 34 }} />
            <div style={{ fontFamily: C.fonts.display, fontSize: 30, fontWeight: C.fonts.displayWeight, color: C.ink }}>ChatGPT</div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 30, minHeight: 74 }}>
            {t >= s.qAt - 0.1 && (
              <div style={{ background: "#F1F0EC", borderRadius: 26, padding: "16px 28px", fontFamily: C.fonts.plain, fontSize: 34, color: C.ink }}>
                {mark(typed)}<span style={{ opacity: typed.length < q.length ? 1 : 0 }}>|</span>
              </div>
            )}
          </div>
          <div style={{ marginTop: 28 }}>
            {[520, 600, 380].map((w, i) => (
              <Enter key={i} at={s.qAt + (s.qDur ?? 1.4) + 0.1 + i * 0.12}>
                <div style={{ height: 14, width: w, borderRadius: 7, background: "#ECEAE4", marginTop: 14 }} />
              </Enter>
            ))}
          </div>
          <Enter at={s.adAt} style={{ marginTop: 34 }}>
            <div style={{ border: `1px solid ${C.line}`, borderRadius: 16, padding: "22px 26px", display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{ width: 84, height: 84, borderRadius: 12, background: "#F1F0EC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="air-vent" size={44} color={C.body} />
              </div>
              <div style={{ flex: 1 }}>
                {/* the real UI's own label, so it keeps its caps */}
                <div style={{ fontFamily: C.fonts.plain, fontSize: 22, fontWeight: 600, letterSpacing: "0.14em", color: C.muted }}>SPONSORED</div>
                <div style={{ fontFamily: C.fonts.display, fontWeight: C.fonts.displayWeight, fontSize: 44, color: C.ink, marginTop: 4 }}>{s.ad}</div>
              </div>
              <div style={{ opacity: flag, transform: `scale(${0.8 + 0.2 * flag})` }}><Chip tone="accent" size={30}>{s.flagText}</Chip></div>
            </div>
          </Enter>
        </Card>
      </Enter>
    </Centre>
  );
};

export const SCENES: Record<string, View> = {
  words: Words, type: TypeCard, trio: Trio, gallery: Gallery,
  count: Count, list: List, spine: Spine, shot: Shot, points: Points, places: Places, chat: Chat,
};
/** Scenes that draw over his footage rather than on the board behind him. */
export const OVER = new Set(["words", "type"]);
