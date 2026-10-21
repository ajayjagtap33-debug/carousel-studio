// B-roll scene types. One scene = one idea on screen while it's being said.
// Every `at` is a time in the cut (seconds), taken from transcript.json: the item appears on that word.
// A new type goes here (and in SCENES at the bottom) first, never improvised in broll.json.
import React from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { C, S, tintFill, tintInk, type Tint } from "./theme";
import { Card, Icon, Rough, Title, Txt, pop, useAppear, useDraw, usePassed, useScene } from "./kit";
import type { Scene } from "./types";

type Item = { text?: string; label?: string; sub?: string; icon?: string; at?: number; tint?: Tint; cross?: number };
const col = (gap: number): React.CSSProperties => ({ display: "flex", flexDirection: "column", alignItems: "center", gap });
const row = (gap: number): React.CSSProperties => ({ display: "flex", flexDirection: "row", alignItems: "center", gap });

/** title: big line, optional kicker above and sub line below. {title, kicker?, sub?, subAt?} */
const TitleScene: React.FC<{ s: Scene }> = ({ s }) => {
  const p = useAppear(s.subAt as number | undefined);
  return (
    <div style={col(40)}>
      <Title text={s.title as string} kicker={s.kicker as string} size={S.title + 16} />
      {s.sub ? <Txt size={S.item} color={C.body} style={pop(p)}>{s.sub as string}</Txt> : null}
    </div>
  );
};

/** checklist: rows that tick in one by one; the newest row is highlighted. {title?, items:[{text, icon?, at}]} */
const ChecklistRow: React.FC<{ it: Item; i: number; active: boolean; w: number }> = ({ it, i, active, w }) => {
  const p = useAppear(it.at);
  const d = useDraw(it.at, 0.45);
  return (
    <div style={pop(p, 18)}>
      <Card w={w} h={92} draw={d} seed={11 + i} fill={active ? C.l_green : undefined}>
        <div style={{ ...row(26), width: w - 64 }}>
          <Icon name={it.icon ?? "check"} size={44} color={active ? C.green : C.ink} />
          <Txt size={S.item}>{it.text}</Txt>
        </div>
      </Card>
    </div>
  );
};
const Checklist: React.FC<{ s: Scene }> = ({ s }) => {
  const items = (s.items as Item[]) ?? [];
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { start } = useScene();
  const t = start + frame / fps;
  const last = items.reduce((k, it, i) => ((it.at ?? start) <= t ? i : k), -1);
  const w = Math.min(820, useScene().area.w);
  return (
    <div style={col(22)}>
      <Title text={s.title as string} size={S.title - 8} />
      <div style={{ height: 8 }} />
      {items.map((it, i) => <ChecklistRow key={i} it={it} i={i} w={w} active={s.highlight !== false && i === last} />)}
    </div>
  );
};

/** cards: 2–4 cards in a row (icon + label + sub); `cross` = time a red X strikes the card. {title?, items:[...]} */
const OneCard: React.FC<{ it: Item; i: number; w: number }> = ({ it, i, w }) => {
  const p = useAppear(it.at);
  const d = useDraw(it.at, 0.5);
  const x = useDraw(it.cross, 0.35);
  const crossed = usePassed(it.cross);
  return (
    <div style={{ position: "relative", ...pop(p) }}>
      <Card w={w} h={w * 1.05} draw={d} seed={21 + i} fill={tintFill(it.tint)} style={{ opacity: crossed ? 0.55 : 1 }}>
        <div style={{ ...col(20), padding: 24, textAlign: "center" }}>
          <Icon name={it.icon} size={84} color={tintInk(it.tint)} />
          <Txt size={S.item}>{it.label ?? it.text}</Txt>
          {it.sub && <Txt size={S.small} color={C.body}>{it.sub}</Txt>}
        </div>
      </Card>
      {it.cross !== undefined && <Rough shape="cross" w={w} h={w * 1.05} draw={x} stroke={C.red} strokeWidth={6} seed={5} />}
    </div>
  );
};
const Cards: React.FC<{ s: Scene }> = ({ s }) => {
  const items = (s.items as Item[]) ?? [];
  const { area } = useScene();
  const w = Math.min(380, (area.w - (items.length - 1) * 48) / Math.max(1, items.length));
  return (
    <div style={col(64)}>
      <Title text={s.title as string} size={S.title - 8} />
      <div style={row(48)}>{items.map((it, i) => <OneCard key={i} it={it} i={i} w={w} />)}</div>
    </div>
  );
};

/** stat: one big number with a hand-drawn circle. Only numbers Ajay says in the video. {value, label, at?, sub?, tint?} */
const Stat: React.FC<{ s: Scene }> = ({ s }) => {
  const at = s.at as number | undefined;
  const p = useAppear(at, 12);
  const d = useDraw((at ?? s.start) + 0.3, 0.6);
  const ink = tintInk((s.tint as Tint) ?? "green");
  const w = (s.value as string).length * S.stat * 0.62 + 180, h = S.stat + 70;
  return (
    <div style={col(30)}>
      <div style={{ position: "relative", width: w, height: h, display: "flex", alignItems: "center",
        justifyContent: "center", ...pop(p, 40) }}>
        <Txt size={S.stat} color={ink} style={{ lineHeight: 1 }}>{s.value as string}</Txt>
        <Rough shape="ellipse" w={w} h={h} draw={d} stroke={ink} seed={9} strokeWidth={4} />
      </div>
      <Txt size={S.item + 4} style={pop(p)}>{s.label as string}</Txt>
      {s.sub ? <Txt size={S.small + 4} color={C.body} style={pop(p)}>{s.sub as string}</Txt> : null}
    </div>
  );
};

/** grid: icon tiles (e.g. people turning into bots). swap = {icon, at, tint} changes a tile on a word. {title?, cols, items} */
type Tile = Item & { swap?: Item };
const GridTile: React.FC<{ it: Tile; i: number; size: number }> = ({ it, i, size }) => {
  const p = useAppear(it.at);
  const swapped = usePassed(it.swap?.at);
  const q = useAppear(it.swap?.at, 10);
  const cur = swapped ? { ...it, ...it.swap } : it;
  return (
    <div style={{ ...pop(p), transform: `${pop(p).transform} scale(${swapped ? 0.85 + 0.15 * q : 1})` }}>
      <Card w={size} h={size} seed={31 + i} fill={tintFill(cur.tint)}>
        <Icon name={cur.icon} size={size * 0.46} color={tintInk(cur.tint)} />
      </Card>
    </div>
  );
};
const Grid: React.FC<{ s: Scene }> = ({ s }) => {
  const items = (s.items as Tile[]) ?? [];
  const cols = (s.cols as number) ?? Math.min(4, items.length);
  const { area } = useScene();
  const size = Math.min(170, (area.w - (cols - 1) * 28) / cols);
  return (
    <div style={col(56)}>
      <Title text={s.title as string} size={S.title - 8} />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${size}px)`, gap: 28 }}>
        {items.map((it, i) => <GridTile key={i} it={it} i={i} size={size} />)}
      </div>
    </div>
  );
};

/** quote: a source as a document card, a phrase highlighted on a word. Use for reports/articles Ajay cites.
 *  {source, title?, text, highlight?, highlightAt?} */
const Quote: React.FC<{ s: Scene }> = ({ s }) => {
  const p = useAppear();
  const text = s.text as string;
  const hl = s.highlight as string | undefined;
  const h = useDraw(s.highlightAt as number | undefined, 0.6);
  const [a, b] = hl && text.includes(hl) ? [text.slice(0, text.indexOf(hl)), text.slice(text.indexOf(hl) + hl.length)] : [text, ""];
  const { area } = useScene();
  const w = Math.min(1100, area.w);
  return (
    <div style={{ ...pop(p, 40), position: "relative", width: w, padding: "56px 64px", boxSizing: "border-box" }}>
      <Rough shape="rect" w={w} h={420} seed={41} fill={C.paper} />
      <div style={{ position: "relative" }}>
        <Txt size={S.small} color={C.grey} style={{ textTransform: "uppercase", letterSpacing: 2 }}>{s.source as string}</Txt>
        {s.title ? <Txt size={S.item + 6} style={{ marginTop: 14 }}>{s.title as string}</Txt> : null}
        <Txt size={S.label + 2} color={C.body} style={{ marginTop: 28, lineHeight: 1.45 }}>
          {a}
          {hl && (
            <span style={{ color: C.ink, backgroundImage: `linear-gradient(${C.l_yellow}, ${C.l_yellow})`,
              backgroundRepeat: "no-repeat", backgroundSize: `${h * 100}% 100%`, padding: "0 4px" }}>{hl}</span>
          )}
          {b}
        </Txt>
      </div>
    </div>
  );
};

/** image: a screenshot Ajay supplies (file in the job folder), framed, slow push-in. {src, caption?, zoom?: [from, to]} */
const ImageScene: React.FC<{ s: Scene }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = useAppear();
  const [z0, z1] = (s.zoom as [number, number]) ?? [1, 1.06];
  const z = interpolate(frame, [0, (s.end - s.start) * fps], [z0, z1], { extrapolateRight: "clamp" });
  const { area } = useScene();
  const w = Math.min(1300, area.w), h = Math.min(area.h - (s.caption ? 120 : 0), w * 0.62);
  return (
    <div style={{ ...col(30), ...pop(p, 30) }}>
      <div style={{ position: "relative", width: w, height: h, borderRadius: 18, overflow: "hidden",
        boxShadow: "0 18px 50px rgba(0,0,0,.14)", border: `2px solid ${C.l_grey}` }}>
        <Img src={staticFile(s.src as string)} style={{ width: "100%", height: "100%", objectFit: "cover",
          objectPosition: (s.focus as string) ?? "top center", transform: `scale(${z})`, transformOrigin: "top center" }} />
      </div>
      {s.caption ? <Txt size={S.label}>{s.caption as string}</Txt> : null}
    </div>
  );
};

/** versus: two columns, bad (left) vs good (right). {title?, left:{label, tint?, items:[{text, at}]}, right:{...}} */
type Side = { label: string; tint?: Tint; at?: number; items?: Item[] };
const VersusCol: React.FC<{ side: Side; w: number; seed: number }> = ({ side, w, seed }) => {
  const p = useAppear(side.at);
  return (
    <div style={{ ...col(20), width: w, ...pop(p) }}>
      <Card w={w} h={96} seed={seed} fill={tintFill(side.tint)}>
        <Txt size={S.item} color={tintInk(side.tint)}>{side.label}</Txt>
      </Card>
      {(side.items ?? []).map((it, i) => <VersusItem key={i} it={it} />)}
    </div>
  );
};
const VersusItem: React.FC<{ it: Item }> = ({ it }) => {
  const p = useAppear(it.at);
  return <Txt size={S.label + 2} color={C.body} style={{ ...pop(p, 14), textAlign: "center" }}>{it.text}</Txt>;
};
const Versus: React.FC<{ s: Scene }> = ({ s }) => {
  const { area } = useScene();
  const w = Math.min(520, (area.w - 140) / 2);
  return (
    <div style={col(56)}>
      <Title text={s.title as string} size={S.title - 8} />
      <div style={{ ...row(60), alignItems: "flex-start" }}>
        <VersusCol side={{ tint: "red", ...(s.left as Side) }} w={w} seed={51} />
        <Txt size={S.item} color={C.grey} style={{ marginTop: 26 }}>vs</Txt>
        <VersusCol side={{ tint: "green", ...(s.right as Side) }} w={w} seed={52} />
      </div>
    </div>
  );
};

/** flow: steps joined by hand-drawn arrows, each step on its word. {title?, steps:[{icon, label, at, tint?}]} */
const FlowStep: React.FC<{ it: Item; i: number; w: number; arrow: boolean }> = ({ it, i, w, arrow }) => {
  const p = useAppear(it.at);
  const d = useDraw(it.at, 0.4);
  return (
    <>
      {arrow && <div style={{ position: "relative", width: 90, height: 40, opacity: d > 0 ? 1 : 0 }}>
        <Rough shape="arrow" w={90} h={40} draw={d} seed={61 + i} /></div>}
      <div style={pop(p)}>
        <Card w={w} h={w} draw={d} seed={71 + i} fill={tintFill(it.tint)}>
          <div style={{ ...col(16), textAlign: "center", padding: 18 }}>
            <Icon name={it.icon} size={70} color={tintInk(it.tint)} />
            <Txt size={S.label}>{it.label ?? it.text}</Txt>
          </div>
        </Card>
      </div>
    </>
  );
};
const Flow: React.FC<{ s: Scene }> = ({ s }) => {
  const steps = (s.steps as Item[]) ?? [];
  const { area } = useScene();
  const w = Math.min(300, (area.w - (steps.length - 1) * 90) / Math.max(1, steps.length));
  return (
    <div style={col(64)}>
      <Title text={s.title as string} size={S.title - 8} />
      <div style={row(0)}>{steps.map((it, i) => <FlowStep key={i} it={it} i={i} w={w} arrow={i > 0} />)}</div>
    </div>
  );
};

export const SCENES: Record<string, React.FC<{ s: Scene }>> = {
  title: TitleScene,
  checklist: Checklist,
  cards: Cards,
  stat: Stat,
  grid: Grid,
  quote: Quote,
  image: ImageScene,
  versus: Versus,
  flow: Flow,
};
