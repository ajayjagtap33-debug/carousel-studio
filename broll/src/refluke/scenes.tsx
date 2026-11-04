// Refluke scene library. A new type goes in RSCENES first, never improvised into a plan —
// same rule as VIS in render.py and ESCENES in editorial/scenes.tsx.
// Each scene is the animated form of a frame in assets/refluke-broll/preview/.
import React from "react";
import {
  Arrow, BarFill, Card, CountUp, DrawPath, Enter, Eyebrow, Ghost, Head, Node, Pill,
  Row, Ser, SourceBar, Stagger, Tick, Typewriter, Ui, Underline, Win, useIn, useT,
} from "./kit";
import { arr, glue, n, str, type P, type RScene } from "./parts";
import { MORE } from "./scenes2";

export type { RScene } from "./parts";

// ---------------------------------------------------------------- statement
const Statement: React.FC<P> = ({ s }) => (
  <div style={{ textAlign: "center" }}>
    {s.eyebrow ? <Eyebrow at={n(s.at)}>{str(s.eyebrow)}</Eyebrow> : null}
    <div style={{ height: 24 }} />
    <Head text={str(s.head)} at={n(s.at) + 0.2} size={n(s.size, 96)} align="center" />
  </div>
);

// ---------------------------------------------------------------- hero number
const NumberScene: React.FC<P> = ({ s }) => (
  <div style={{ textAlign: "center" }}>
    {s.eyebrow ? <Eyebrow at={n(s.at)}>{str(s.eyebrow)}</Eyebrow> : null}
    {s.qualifier ? (
      <div style={{ margin: "26px 0 8px" }}>
        <Pill at={n(s.at) + 0.25} tone="accent">{str(s.qualifier)}</Pill>
      </div>
    ) : null}
    <div style={{ display: "flex", justifyContent: "center" }}>
      <CountUp at={n(s.at) + 0.45} to={n(s.value)} prefix={str(s.prefix)} suffix={str(s.suffix)}
        size={n(s.size, 168)} />
    </div>
  </div>
);

// ---------------------------------------------------------------- spine
type SpineItem = { text: string; revealAt?: number; activeAt?: number; doneAt?: number };
const Spine: React.FC<P> = ({ s }) => (
  <div style={{ margin: "0 auto", width: 1140 }}>
    <Card pad={0} style={{ padding: "34px 26px" }}>
      <Enter at={n(s.at)}>
        <Ser size={46} style={{ margin: "0 20px 22px" }}>{str(s.title)}</Ser>
      </Enter>
      {arr<SpineItem>(s.items).map((it, i) => (
        <Row key={i} text={it.text} revealAt={it.revealAt ?? n(s.at)} activeAt={it.activeAt}
          doneAt={it.doneAt} />
      ))}
    </Card>
  </div>
);

// ---------------------------------------------------------------- bars
type BarItem = { label: string; value: string; frac: number; tone?: "accent" | "ghost"; at?: number };
const Bars: React.FC<P> = ({ s }) => (
  <Card pad={0} style={{ padding: "52px 56px", width: "100%" }}>
    <Enter at={n(s.at)}><Ser size={50}>{str(s.title)}</Ser></Enter>
    {s.eyebrow ? <Eyebrow at={n(s.at) + 0.1}>{str(s.eyebrow)}</Eyebrow> : null}
    <div style={{ height: 48 }} />
    {arr<BarItem>(s.items).map((b, i) => (
      <BarFill key={i} at={b.at ?? n(s.at) + 0.5 + i * 0.6} label={b.label} value={b.value}
        frac={b.frac} tone={b.tone ?? "accent"} />
    ))}
  </Card>
);

// ---------------------------------------------------------------- trend
const Trend: React.FC<P> = ({ s }) => {
  const T = useT();
  const d = str(s.d, "M4,312 C120,306 150,280 240,268 S330,236 400,186 S520,120 686,38");
  return (
    <Card style={{ width: "100%" }} pad={46}>
      <Enter at={n(s.at)}><Ser size={44}>{str(s.title)}</Ser></Enter>
      <svg width="100%" height={360} viewBox="0 0 690 360" style={{ marginTop: 30 }}>
        <line x1={0} y1={330} x2={690} y2={330} stroke={T.line} strokeWidth={1.5} />
        <DrawPath at={n(s.at) + 0.3} d={d} dur={n(s.dur, 1.2)} />
      </svg>
      {arr<string>(s.chips).length ? (
        <Stagger at={n(s.at) + 1.3} gap={0.2}
          style={{ display: "flex", gap: 16, marginTop: 22 }}>
          {arr<string>(s.chips).map((c, i) => (
            <Pill key={i} at={0} tone="soft" style={{ fontSize: 22, padding: "9px 18px" }}>{c}</Pill>
          ))}
        </Stagger>
      ) : null}
    </Card>
  );
};

// ---------------------------------------------------------------- step chart
/** An SVG step. Animated with opacity/transform, not <Enter> — a div cannot live inside <svg>. */
const StepBar: React.FC<{ at: number; x: number; y: number }> = ({ at, x, y }) => {
  const T = useT();
  const p = useIn(at, 14);
  return (
    <rect x={x} y={y} width={61} height={5} fill={T.accent}
      opacity={Math.min(1, p * 1.5)} transform={`translate(0 ${(1 - p) * 6})`} />
  );
};

const StepChart: React.FC<P> = ({ s }) => {
  const T = useT();
  const steps = n(s.steps, 12);
  const at = n(s.at);
  return (
    <Card pad={0} style={{ padding: "50px 56px", width: "100%" }}>
      <Enter at={at}><Ser size={46}>{str(s.title)}</Ser></Enter>
      <Eyebrow at={at + 0.1}>{str(s.eyebrow, "illustration")}</Eyebrow>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 44, marginTop: 30 }}>
        <svg width={780} height={330}>
          <line x1={40} y1={300} x2={770} y2={300} stroke={T.line} strokeWidth={1.5} />
          <line x1={40} y1={10} x2={40} y2={300} stroke={T.line} strokeWidth={1.5} />
          {Array.from({ length: steps }).map((_, i) => (
            <StepBar key={i} at={at + 0.5 + i * 0.07} x={40 + i * 61} y={292 - i * 26} />
          ))}
        </svg>
        <div style={{ paddingBottom: 40 }}>
          <Ui size={26} color={T.muted}>{str(s.label)}</Ui>
          <CountUp at={at + 0.6} to={n(s.value)} suffix="%" size={88} group={false} />
        </div>
      </div>
      {s.note ? (
        <div style={{ marginTop: 12 }}>
          <Pill at={at + 1.6} tone="soft" style={{ fontSize: 22, padding: "9px 18px" }}>{str(s.note)}</Pill>
        </div>
      ) : null}
    </Card>
  );
};

// ---------------------------------------------------------------- flow
type FlowNode = { text: string; kind?: "light" | "dark" | "green"; at?: number; w?: number };
const Flow: React.FC<P> = ({ s }) => {
  const nodes = arr<FlowNode>(s.nodes);
  const at = n(s.at);
  return (
    <div>
      {s.eyebrow ? <Eyebrow at={at}>{str(s.eyebrow)}</Eyebrow> : null}
      <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 46 }}>
        {nodes.map((nd, i) => (
          <React.Fragment key={i}>
            {i > 0 && <Arrow at={nd.at ?? at + 0.4 + i * 0.8} />}
            <Node at={nd.at ?? at + 0.5 + i * 0.8} kind={nd.kind} w={nd.w ?? 300}>{nd.text}</Node>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- cited shot
const Cited: React.FC<P> = ({ s }) => {
  const T = useT();
  const at = n(s.at);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
        <SourceBar at={at}>{str(s.source)}</SourceBar>
      </div>
      <Win at={at + 0.2} w={1340} h={520}>
        <div style={{ padding: "46px 56px" }}>
          <Ui size={19} color={T.muted} chrome style={{ marginBottom: 22 }}>{str(s.meta)}</Ui>
          <Ser size={46} lh={1.22} style={{ maxWidth: 760 }}>
            {str(s.pre)}{" "}
            <Underline at={n(s.underlineAt, at + 1.1)}>{str(s.clause)}</Underline>
            {glue(s.post)}
          </Ser>
          <div style={{ marginTop: 30 }}>
            <Ghost w="86%" /><Ghost w="92%" /><Ghost w="64%" />
          </div>
        </div>
      </Win>
    </div>
  );
};

// ---------------------------------------------------------------- pulled quote
const PullQuote: React.FC<P> = ({ s }) => {
  const T = useT();
  const at = n(s.at);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
        <SourceBar at={at}>{str(s.source)}</SourceBar>
      </div>
      <Win at={at + 0.2} w={1340} h={300}>
        <div style={{ padding: "30px 40px" }}>
          <Ghost w="40%" h={15} mb={14} />
          <Ui size={26} weight={500} color={T.ink} chrome style={{ marginBottom: 16 }}>{str(s.title)}</Ui>
          <Ghost w="92%" h={13} mb={11} /><Ghost w="88%" h={13} mb={11} /><Ghost w="70%" h={13} mb={11} />
        </div>
      </Win>
      <Enter at={at + 0.9} dy={26}>
        <Card pad={0} style={{ marginTop: -54, marginLeft: 90, width: 1160, padding: "40px 46px", position: "relative", zIndex: 2 }}>
          <Ui size={33} color={T.ink} style={{ lineHeight: 1.45 }}>
            {str(s.pre)}{" "}
            <Underline at={n(s.underlineAt, at + 1.8)}>{str(s.clause)}</Underline>
            {glue(s.post)}
          </Ui>
        </Card>
      </Enter>
    </div>
  );
};

// ---------------------------------------------------------------- prompt frame
type Tile = { label: string; at?: number };
const UiFrame: React.FC<P> = ({ s }) => {
  const T = useT();
  const at = n(s.at);
  return (
    <div>
      <Card style={{ width: "100%" }} pad={0}>
        <div style={{ padding: "40px 44px" }}>
          <Enter at={at}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 26 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: T.accent }} />
              <Ui size={25} color={T.muted}>{str(s.app, "Claude")}</Ui>
            </div>
          </Enter>
          <Typewriter at={at + 0.3} text={str(s.text)} cps={n(s.cps, 26)} />
        </div>
      </Card>
      {arr<Tile>(s.tiles).length ? (
        <div style={{ display: "flex", gap: 26, marginTop: 30 }}>
          {arr<Tile>(s.tiles).map((t, i) => (
            <Enter key={i} at={t.at ?? at + 2.2 + i * 0.4} style={{ flex: 1 }}>
              <Card pad={30} style={{ textAlign: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: T.panel, margin: "0 auto 16px" }} />
                <Ui size={25} color={T.muted}>{t.label}</Ui>
              </Card>
            </Enter>
          ))}
        </div>
      ) : null}
    </div>
  );
};

// ---------------------------------------------------------------- chat + pills
type Msg = { text: string; at?: number };
const ChatPills: React.FC<P> = ({ s }) => {
  const T = useT();
  const at = n(s.at);
  return (
    <div style={{ position: "relative", width: 880 }}>
      <Card pad={34} style={{ minHeight: 430, position: "relative" }}>
        <Ui size={24} color={T.muted} style={{ marginBottom: 28 }}>New chat</Ui>
        {arr<Msg>(s.msgs).map((m, i) => (
          <Enter key={i} at={m.at ?? at + i * 0.9} dy={10}>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
              <div style={{
                background: T.panel, borderRadius: 14, padding: "18px 24px", fontFamily: T.ui,
                fontSize: 29, color: T.ink, maxWidth: 640,
              }}>{m.text}</div>
            </div>
          </Enter>
        ))}
      </Card>
      <div style={{ position: "absolute", right: -330, top: 60, display: "flex", flexDirection: "column", gap: 18, alignItems: "flex-start" }}>
        {arr<Msg>(s.pills).map((p, i) => (
          <Pill key={i} at={p.at ?? at + 2.6 + i * 0.7}>{p.text}</Pill>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- to-dos
type Todo = { av: string; color: string; name: string; task: string; at?: number; doneAt?: number };
const Todos: React.FC<P> = ({ s }) => {
  const T = useT();
  const at = n(s.at);
  return (
    <div style={{ display: "flex", gap: 34, alignItems: "flex-start", width: "100%" }}>
      <Card pad={38} style={{ flex: 1 }}>
        <Enter at={at}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: T.ghost }} />
            <Ser size={38}>{str(s.title, "Meeting to-dos")}</Ser>
          </div>
        </Enter>
        {arr<Todo>(s.rows).map((r, i) => (
          <Enter key={i} at={r.at ?? at + 0.5 + i * 0.6} dy={10}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "18px 0" }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%", background: r.color, color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: T.ui, fontSize: 20, fontWeight: 600, flexShrink: 0,
              }}>{r.av}</div>
              <div style={{ flex: 1 }}>
                <Ui size={26} color={T.ink}>{r.name}</Ui>
                <Ui size={23} color={T.muted}>{r.task}</Ui>
              </div>
              {r.doneAt !== undefined && <Tick at={r.doneAt} size={32} />}
            </div>
          </Enter>
        ))}
      </Card>
      {s.timer ? (
        <Enter at={n(s.timerAt, at + 2.4)}>
          <Card pad={34} style={{ width: 300, textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: T.alert }} />
              <Ui size={21} color={T.muted}>Meeting · live</Ui>
            </div>
            <Ser size={58}>{str(s.timer)}</Ser>
          </Card>
        </Enter>
      ) : null}
    </div>
  );
};

// ---------------------------------------------------------------- registry
// Keys match the frame ids in assets/refluke-broll/preview/, so the still and the scene
// are always the same name. A new type goes here first, never improvised into a plan.
export const RSCENES: Record<string, React.FC<P>> = {
  statement: Statement,
  number: NumberScene,
  spine: Spine,
  bars: Bars,
  trend: Trend,
  stepchart: StepChart,
  flow: Flow,
  cited: Cited,
  pullquote: PullQuote,
  uiframe: UiFrame,
  chatpills: ChatPills,
  "todo-avatars": Todos,
  todos: Todos, // alias: the id used before the library was renamed
  ...MORE,
};
