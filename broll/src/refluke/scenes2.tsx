// Refluke scene library, part two — the remaining 32 types from assets/refluke-broll/library.md §4.
// Each is the animated form of a frame in assets/refluke-broll/preview/ and keeps the same id.
// Motion rules (§7): one element per 1–3s, cards arrive whole and fill a row at a time,
// nothing reflows, numbers and paths draw up, plain cuts between beats.
import React from "react";
import {
  Arrow, Card, CountUp, DrawPath, Enter, Eyebrow, Ghost, Head, Node, Pill, Ser, SourceBar,
  Tick, Typewriter, Ui, Underline, Win, useIn, useNow, useRamp, useT,
} from "./kit";
import { Avatar, IconBox, SvgIn, arr, n, str, type P } from "./parts";

// ============================================================ opening
const Authority: React.FC<P> = ({ s }) => {
  const T = useT();
  const at = n(s.at);
  type Q = { quote: string; name: string };
  const qs = arr<Q>(s.quotes);
  return (
    <div style={{ textAlign: "center" }}>
      <Eyebrow at={at}>{str(s.eyebrow, "The smartest people on earth")}</Eyebrow>
      <div style={{ display: "flex", gap: 26, marginTop: 40 }}>
        {qs.map((q, i) => (
          <Enter key={i} at={at + 0.4 + i * 0.45} style={{ flex: 1 }}>
            <div>
              <div style={{ height: 210, background: T.ghost, borderRadius: 12 }} />
              <Ser size={26} italic lh={1.3} style={{ marginTop: 18 }}>&ldquo;{q.quote}&rdquo;</Ser>
              <Ui size={17} color={T.muted} style={{ marginTop: 12, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                {q.name}
              </Ui>
            </div>
          </Enter>
        ))}
      </div>
      <div style={{ marginTop: 34 }}>
        <Pill at={at + 0.5 + qs.length * 0.45}>{str(s.verdict, "don't use AI like you do")}</Pill>
      </div>
      {s.source ? (
        <div style={{ marginTop: 30, display: "flex", justifyContent: "center" }}>
          <SourceBar at={at + 1 + qs.length * 0.45}>{str(s.source)}</SourceBar>
        </div>
      ) : null}
    </div>
  );
};

const Strike: React.FC<P> = ({ s }) => {
  const T = useT();
  const at = n(s.at);
  const p = useRamp(at + 1.4, 0.5);
  return (
    <div style={{ textAlign: "center" }}>
      <Enter at={at}><Ser size={62} style={{ textAlign: "center" }}>{str(s.title, "The difference")}</Ser></Enter>
      <div style={{ display: "flex", gap: 70, justifyContent: "center", marginTop: 70 }}>
        <Enter at={at + 0.4}>
          <div style={{
            width: 330, height: 280, borderRadius: T.radius, background: T.panel, opacity: 0.55,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 22, position: "relative",
          }}>
            <IconBox size={72} r={14} bg={T.ghost} />
            <Ui size={30} color={T.muted}>{str(s.wrong, "A better model")}</Ui>
            <svg style={{ position: "absolute", inset: 0 }} width={330} height={280}>
              <line x1={22} y1={258} x2={22 + 286 * p} y2={258 - 236 * p} stroke={T.accent} strokeWidth={4} />
            </svg>
          </div>
        </Enter>
        <Enter at={at + 0.9}>
          <Card w={330} h={280} pad={0} style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22,
          }}>
            <IconBox size={72} r={14} />
            <Ui size={30} color={T.ink}>{str(s.right, "A different tool")}</Ui>
          </Card>
        </Enter>
      </div>
    </div>
  );
};

// ============================================================ data
const ChartRow: React.FC<P> = ({ s }) => {
  const T = useT();
  const at = n(s.at);
  const heights = [60, 110, 80, 170, 100];
  return (
    <div style={{ display: "flex", gap: 34, width: "100%" }}>
      <Enter at={at} style={{ flex: 1 }}>
        <Card pad={36} style={{ height: 330 }}>
          <Ui size={26} color={T.muted} style={{ marginBottom: 26 }}>{str(s.a, "Dense reports")}</Ui>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 180 }}>
            {heights.map((h, i) => (
              <Enter key={i} at={at + 0.4 + i * 0.12} dy={10} style={{ flex: 1 }}>
                <div style={{ height: h, borderRadius: 6, background: h === 170 ? T.accent : T.ghost }} />
              </Enter>
            ))}
          </div>
        </Card>
      </Enter>
      <Enter at={at + 0.8} style={{ flex: 1 }}>
        <Card pad={36} style={{ height: 330 }}>
          <Ui size={26} color={T.muted} style={{ marginBottom: 26 }}>{str(s.b, "Analytics")}</Ui>
          <svg width="100%" height={180} viewBox="0 0 340 180">
            <DrawPath at={at + 1.0} d="M6,160 C70,150 110,120 170,112 S260,70 330,20" len={500} dur={0.9} width={4} />
          </svg>
        </Card>
      </Enter>
      <Enter at={at + 1.6} style={{ flex: 1 }}>
        <Card pad={36} style={{ height: 330 }}>
          <Ui size={26} color={T.muted} style={{ marginBottom: 26 }}>{str(s.c, "Animated explainer")}</Ui>
          <div style={{ height: 120, borderRadius: 12, background: T.panel, marginBottom: 16 }} />
          <div style={{ height: 9, width: "62%", borderRadius: 9, background: T.accent }} />
        </Card>
      </Enter>
    </div>
  );
};

// ============================================================ diagram
const Loop: React.FC<P> = ({ s }) => {
  const T = useT();
  const at = n(s.at);
  const p1 = useRamp(at + 1.4, 0.5);
  const p2 = useRamp(at + 1.9, 0.5);
  return (
    <div style={{ textAlign: "center" }}>
      <Enter at={at}><Ser size={92} style={{ textAlign: "center" }}>{str(s.title, "RLHF")}</Ser></Enter>
      <Eyebrow at={at + 0.3}>{str(s.eyebrow)}</Eyebrow>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 30, marginTop: 60 }}>
        <Node at={at + 0.7} w={290}>
          <IconBox size={56} style={{ margin: "0 auto 18px" }} />{str(s.a, "AI model")}
        </Node>
        <svg width={190} height={130}>
          <path d="M8,42 C60,6 130,6 182,42" fill="none" stroke={T.accent} strokeWidth={2.4}
            strokeDasharray={220} strokeDashoffset={220 * (1 - p1)} />
          <path d="M182,88 C130,124 60,124 8,88" fill="none" stroke={T.accent} strokeWidth={2.4}
            strokeDasharray={220} strokeDashoffset={220 * (1 - p2)} />
        </svg>
        <Node at={at + 1.1} w={290}>
          <IconBox size={56} style={{ margin: "0 auto 18px" }} />{str(s.b, "Human feedback")}
        </Node>
      </div>
    </div>
  );
};

const Branch: React.FC<P> = ({ s }) => {
  const T = useT();
  const at = n(s.at);
  const p = useRamp(at + 0.7, 0.5);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
      <Node at={at} w={250}>
        <IconBox size={52} style={{ marginBottom: 16 }} />{str(s.from, "Try")}
      </Node>
      <svg width={96} height={270}>
        <path d="M0,135 H44 V44 H92" fill="none" stroke={T.accent} strokeWidth={2.4}
          strokeDasharray={240} strokeDashoffset={240 * (1 - p)} />
        <path d="M0,135 H44 V226 H92" fill="none" stroke={T.accent} strokeWidth={2.4}
          strokeDasharray={240} strokeDashoffset={240 * (1 - p)} />
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
        <Node at={at + 1.2} w={260} kind={s.goodDark ? "dark" : "light"}>{str(s.good, "Succeed")}</Node>
        <Node at={at + 1.7} w={260}>{str(s.bad, "Fail")}</Node>
      </div>
    </div>
  );
};

const CostCompare: React.FC<P> = ({ s }) => {
  const T = useT();
  const at = n(s.at);
  return (
    <div>
      <Eyebrow at={at}>{str(s.eyebrow, "This sounds crazy, but")}</Eyebrow>
      <div style={{ display: "flex", alignItems: "center", gap: 26, marginTop: 50 }}>
        <Enter at={at + 0.4}>
          <Card w={330} pad={40} style={{ textAlign: "center" }}>
            <IconBox size={58} style={{ margin: "0 auto 20px" }} />
            <Ui size={28} color={T.muted}>{str(s.mineLabel, "Your system")}</Ui>
            <Ser size={64} style={{ marginTop: 8 }}>{str(s.price, "$1–2")}</Ser>
            <Ui size={24} color={T.muted}>{str(s.per, "a day")}</Ui>
          </Card>
        </Enter>
        <div style={{ textAlign: "center" }}>
          <div style={{ marginBottom: 12 }}><Pill at={at + 1.2} tone="accent">{str(s.verb, "replaces")}</Pill></div>
          <Arrow at={at + 1.4} w={120} />
        </div>
        <Enter at={at + 1.8}>
          <div style={{ width: 360, padding: "52px 40px", background: T.ink, borderRadius: T.radius, textAlign: "center" }}>
            <IconBox size={58} bg="#232825" style={{ margin: "0 auto 20px" }} />
            <Ser size={40} color="#fff">{str(s.theirs, "A competent EA")}</Ser>
          </div>
        </Enter>
      </div>
    </div>
  );
};

// ============================================================ statement
const PlayerBar: React.FC<P> = ({ s }) => {
  const T = useT();
  const at = n(s.at);
  const p = useRamp(at + 0.4, 1.2);
  return (
    <Enter at={at}>
      <Card pad={0} style={{ padding: "34px 40px", display: "flex", alignItems: "center", gap: 26 }}>
        <svg width={30} height={34} viewBox="0 0 24 24" fill={T.ink}><polygon points="5,3 21,12 5,21" /></svg>
        <div style={{ flex: 1 }}>
          <Ui size={23} color={T.muted} style={{ marginBottom: 14 }}>{str(s.label, "This video")}</Ui>
          <div style={{ height: 7, borderRadius: 9, background: T.ghost, overflow: "hidden" }}>
            <div style={{ width: `${n(s.pct, 72) * p}%`, height: 7, background: T.alert }} />
          </div>
        </div>
        <Ui size={27} color={T.muted}>{str(s.time, "5:01 / 7:00")}</Ui>
      </Card>
    </Enter>
  );
};

const QuoteLines: React.FC<P> = ({ s }) => {
  const at = n(s.at);
  const lines = arr<string>(s.lines);
  return (
    <div>
      <Eyebrow at={at}>{str(s.eyebrow, "Always say")}</Eyebrow>
      <div style={{ marginTop: 46 }}>
        {lines.map((l, i) => (
          <div key={i} style={{ marginLeft: i * 240, marginBottom: 26 }}>
            <Pill at={at + 0.5 + i * 1.1} tone="soft" style={{ fontSize: 34, padding: "22px 30px" }}>
              &ldquo;{l}&rdquo;
            </Pill>
          </div>
        ))}
      </div>
    </div>
  );
};

const OutlinePill: React.FC<P> = ({ s }) => {
  const T = useT();
  const at = n(s.at);
  return (
    <div style={{ textAlign: "center" }}>
      <Enter at={at}>
        <div style={{ display: "inline-block", border: `2.5px solid ${T.accent}`, borderRadius: 18, padding: "26px 48px" }}>
          <Ser size={58}>{str(s.text)}</Ser>
        </div>
      </Enter>
      {s.note ? <div style={{ marginTop: 28 }}><Pill at={at + 0.8} tone="soft">{str(s.note)}</Pill></div> : null}
    </div>
  );
};

// ============================================================ objects & interfaces
const IconCard: React.FC<P> = ({ s }) => {
  const T = useT();
  const at = n(s.at);
  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <Enter at={at}>
        <Card w={360} pad={54} style={{ textAlign: "center" }}>
          <IconBox size={54} style={{ margin: "0 auto" }} />
          <Ui size={28} color={T.muted} style={{ marginTop: 22 }}>{str(s.label)}</Ui>
        </Card>
      </Enter>
    </div>
  );
};

const SearchBar: React.FC<P> = ({ s }) => {
  const T = useT();
  const at = n(s.at);
  return (
    <div>
      <Enter at={at}>
        <Card pad={0} style={{ padding: "40px 46px", borderRadius: 999, display: "flex", alignItems: "center", gap: 24 }}>
          <IconBox size={38} r={19} bg={T.ghost} />
          <div style={{ flex: 1 }}><Typewriter at={at + 0.4} text={str(s.query)} size={30} color={T.muted} /></div>
        </Card>
      </Enter>
      {s.note ? (
        <div style={{ marginTop: 28, textAlign: "center" }}><Pill at={at + 2.4} tone="soft">{str(s.note)}</Pill></div>
      ) : null}
    </div>
  );
};

const Terminal: React.FC<P> = ({ s }) => {
  const at = n(s.at);
  return (
    <Win at={at} w={820} h={420} dark>
      <div style={{ padding: "34px 38px", fontFamily: "ui-monospace, monospace" }}>
        <div style={{ fontSize: 27, color: "#9BD6A6" }}>
          &gt; <Typewriter at={at + 0.4} text={str(s.cmd, "/skills")} size={27} color="#9BD6A6" cps={14} inline />
        </div>
        <Enter at={at + 1.8}>
          <div style={{ marginTop: 26 }}><Ghost w="54%" h={13} mb={12} /><Ghost w="38%" h={13} mb={12} /></div>
        </Enter>
      </div>
    </Win>
  );
};

const BeforeAfter: React.FC<P> = ({ s }) => {
  const T = useT();
  const at = n(s.at);
  return (
    <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
      <Enter at={at} style={{ flex: 1 }}>
        <Card pad={44} style={{ minHeight: 300 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 26 }}>
            <IconBox size={30} r={8} bg={T.ghost} /><Ui size={27} color={T.muted}>{str(s.title)}</Ui>
          </div>
          <Ghost w="70%" /><Ghost w="52%" />
        </Card>
      </Enter>
      <Enter at={at + 0.6} style={{ flex: 1 }}>
        <Card pad={44} style={{ minHeight: 300 }}>
          <Eyebrow at={at + 0.7}>Before</Eyebrow>
          <Ser size={44} style={{ marginTop: 14 }}>&ldquo;{str(s.before)}&rdquo;</Ser>
          <div style={{ marginTop: 28 }}><Eyebrow at={at + 1.6}>After</Eyebrow></div>
          <Enter at={at + 1.8}>
            <Ser size={44} color={T.accent} style={{ marginTop: 14 }}>&ldquo;{str(s.after)}&rdquo;</Ser>
          </Enter>
        </Card>
      </Enter>
    </div>
  );
};

const CompanyIcons: React.FC<P> = ({ s }) => {
  const T = useT();
  const at = n(s.at);
  const cols = [T.accent, T.muted, T.muted];
  return (
    <div style={{ textAlign: "center" }}>
      <Head text={str(s.title, "The world's best companies")} at={at} size={64} align="center" />
      <div style={{ display: "flex", justifyContent: "center", gap: 90, marginTop: 60 }}>
        {cols.map((c, i) => (
          <Enter key={i} at={at + 0.9 + i * 0.3}>
            <svg width={76} height={76} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.5}>
              <path d="M3 21h18M5 21V7l7-4 7 4v14" />
              <path d="M9 9h2M13 9h2M9 13h2M13 13h2M9 17h2M13 17h2" />
            </svg>
          </Enter>
        ))}
      </div>
    </div>
  );
};

const DocsPage: React.FC<P> = ({ s }) => {
  const T = useT();
  const at = n(s.at);
  type Spec = { k: string; v: string };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
        <SourceBar at={at}>{str(s.source)}</SourceBar>
      </div>
      <Win at={at + 0.2} w={1340} h={420}>
        <div style={{ padding: "34px 40px" }}>
          <Enter at={at + 0.5}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28 }}>
              <IconBox size={52} r={12} bg={T.ghost} />
              <div>
                <Ui size={28} weight={500} color={T.ink}>{str(s.name)}</Ui>
                <Ui size={21} color={T.muted}>{str(s.sub)}</Ui>
              </div>
            </div>
          </Enter>
          <div style={{ display: "flex", gap: 46 }}>
            {arr<Spec>(s.specs).map((sp, i) => (
              <Enter key={i} at={at + 1.0 + i * 0.25}>
                <div>
                  <Ui size={19} color={T.muted} style={{ letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
                    {sp.k}
                  </Ui>
                  <Ui size={26} color={T.ink}>{sp.v}</Ui>
                </div>
              </Enter>
            ))}
          </div>
          <div style={{ marginTop: 32 }}><Ghost w="88%" /><Ghost w="74%" /></div>
        </div>
      </Win>
    </div>
  );
};

const AssistantListening: React.FC<P> = ({ s }) => {
  const T = useT();
  const at = n(s.at);
  const t = useNow();
  const pulse = 0.55 + 0.45 * Math.abs(Math.sin((t - at) * 2.2));
  type Line = { who: string; what: string };
  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <Enter at={at}>
        <Card w={620} pad={40}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 30 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <IconBox size={30} r={8} bg={T.ghost} /><Ui size={26} color={T.muted}>{str(s.title, "AI assistant")}</Ui>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: T.ui, fontSize: 22, color: T.accent }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.success, opacity: pulse }} />
              listening
            </div>
          </div>
          {arr<Line>(s.lines).map((l, i) => (
            <Enter key={i} at={at + 0.8 + i * 1.1} dy={10}>
              <div style={{ marginBottom: 24 }}>
                <Ui size={21} color={T.muted} style={{ marginBottom: 7 }}>{l.who}</Ui>
                <Ui size={28} color={T.ink}>{l.what}</Ui>
              </div>
            </Enter>
          ))}
        </Card>
      </Enter>
    </div>
  );
};

const EaConcept: React.FC<P> = ({ s }) => {
  const T = useT();
  const at = n(s.at);
  return (
    <div>
      <Eyebrow at={at}>{str(s.eyebrow, "Think of this as")}</Eyebrow>
      <div style={{ display: "flex", alignItems: "center", gap: 30, marginTop: 44 }}>
        <Node at={at + 0.4} w={300}>
          <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth={1.6}>
            <circle cx={12} cy={8} r={4} /><path d="M4 21a8 8 0 0 1 16 0" />
          </svg>
          <div style={{ marginTop: 18 }}>{str(s.a, "An EA")}</div>
          <Ui size={23} color={T.muted}>{str(s.aSub, "always with you")}</Ui>
        </Node>
        <Arrow at={at + 1.1} />
        <Enter at={at + 1.3}>
          <Card w={520} pad={34}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <IconBox size={26} r={7} bg={T.ghost} /><Ui size={24} color={T.muted}>{str(s.b, "Meeting notes")}</Ui>
            </div>
            {["92%", "80%", "86%", "58%"].map((w, i) => (
              <Enter key={i} at={at + 1.7 + i * 0.3} dy={6}><Ghost w={w} /></Enter>
            ))}
          </Card>
        </Enter>
      </div>
    </div>
  );
};

const LogoTiles: React.FC<P> = ({ s }) => {
  const T = useT();
  const at = n(s.at);
  const names = arr<string>(s.names);
  return (
    <div style={{ textAlign: "center" }}>
      <Eyebrow at={at}>{str(s.eyebrow)}</Eyebrow>
      <Head text={str(s.title)} at={at + 0.3} size={76} align="center" />
      <div style={{ display: "flex", justifyContent: "center", gap: 40, marginTop: 48 }}>
        {names.map((nm, i) => (
          <Enter key={i} at={at + 1.2 + i * 0.4}>
            <div style={{ textAlign: "center" }}>
              <Card w={130} h={130} pad={0} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IconBox size={56} r={14} bg={T.ghost} />
              </Card>
              <Ui size={24} color={T.muted} style={{ marginTop: 16 }}>{nm}</Ui>
            </div>
          </Enter>
        ))}
      </div>
      {s.note ? <div style={{ marginTop: 36 }}><Pill at={at + 1.4 + names.length * 0.4}>{str(s.note)}</Pill></div> : null}
    </div>
  );
};

const TranscriptCard: React.FC<P> = ({ s }) => {
  const T = useT();
  const at = n(s.at);
  type Line = { who: string; what: string };
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Pill at={at} tone="soft" style={{ fontSize: 22, padding: "9px 20px", color: T.accent }}>✓ transcribed</Pill>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
        <Enter at={at + 0.3}>
          <div style={{ width: 420, padding: 32, background: T.ink, borderRadius: T.radius, color: "#fff" }}>
            <Ui size={22} color="#8A918C" style={{ marginBottom: 22 }}>Transcript</Ui>
            {arr<Line>(s.lines).map((l, i) => (
              <Enter key={i} at={at + 0.7 + i * 0.5} dy={8}>
                <div style={{ marginBottom: 18 }}>
                  <Ui size={18} color="#6E756F">{l.who}</Ui>
                  <Ui size={23} color="#fff">{l.what}</Ui>
                </div>
              </Enter>
            ))}
          </div>
        </Enter>
        <Arrow at={at + 2.2} />
        <Enter at={at + 2.4}>
          <div style={{ textAlign: "center" }}>
            <svg width={56} height={56} viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth={1.6}>
              <rect x={3} y={8} width={18} height={12} rx={3} /><path d="M12 8V4M8 14h.01M16 14h.01" />
            </svg>
            <Ui size={23} color={T.muted} style={{ marginTop: 12 }}>{str(s.out, "real projects")}</Ui>
          </div>
        </Enter>
      </div>
    </div>
  );
};

const TokenChips: React.FC<P> = ({ s }) => {
  const T = useT();
  const at = n(s.at);
  const words = str(s.words).split(" ").filter(Boolean);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
      <Enter at={at}>
        <Card w={600} pad={36}>
          <Eyebrow at={at}>{str(s.eyebrow, "Word tokens")}</Eyebrow>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 22 }}>
            {words.map((w, i) => (
              <Enter key={i} at={at + 0.4 + i * 0.07} dy={5}>
                <span style={{
                  display: "inline-block", background: T.panel, borderRadius: 7, padding: "9px 14px",
                  fontFamily: T.ui, fontSize: 23, color: T.muted,
                }}>{w}</span>
              </Enter>
            ))}
          </div>
        </Card>
      </Enter>
      <Arrow at={at + 0.5 + words.length * 0.07} w={100} />
      <Enter at={at + 0.8 + words.length * 0.07} style={{ flex: 1 }}>
        <Card pad={50} style={{ textAlign: "center" }}>
          <svg width={58} height={58} viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth={1.6}
            style={{ margin: "0 auto" }}>
            <rect x={3} y={4} width={18} height={16} rx={3} /><circle cx={9} cy={10} r={2} /><path d="M21 16l-5-5-6 6" />
          </svg>
          <div style={{ margin: "22px 0 10px" }}><Eyebrow at={at + 1}>A picture</Eyebrow></div>
          <Ser size={52}>{str(s.punch, "1,000 words")}</Ser>
        </Card>
      </Enter>
    </div>
  );
};

const GalleryChips: React.FC<P> = ({ s }) => {
  const T = useT();
  const at = n(s.at);
  const chips = arr<string>(s.chips);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <SourceBar at={at}>{str(s.source)}</SourceBar>
      </div>
      <div style={{ display: "flex", gap: 34, alignItems: "center" }}>
        <Win at={at + 0.2} w={820} h={380}>
          <div style={{ padding: 14, display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} style={{ aspectRatio: "16/10", borderRadius: 6, background: T.ghost, opacity: 0.45 + (i % 4) * 0.18 }} />
            ))}
          </div>
        </Win>
        <div style={{ width: 400, flexShrink: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
            {chips.map((c, i) => <Pill key={i} at={at + 0.9 + i * 0.4} tone="soft">{c}</Pill>)}
          </div>
          <Enter at={at + 1.1 + chips.length * 0.4}>
            <div style={{ marginTop: 26, textAlign: "center" }}>
              <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth={1.6}>
                <rect x={3} y={8} width={18} height={12} rx={3} /><path d="M12 8V4M8 14h.01M16 14h.01" />
              </svg>
              <div style={{ marginTop: 10 }}><Eyebrow at={0}>{str(s.caption, "Agents build them")}</Eyebrow></div>
            </div>
          </Enter>
        </div>
      </div>
    </div>
  );
};

const IsometricRoom: React.FC<P> = ({ s }) => {
  const T = useT();
  const at = n(s.at);
  const chips = arr<string>(s.chips);
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 26 }}>
        <Pill at={at} tone="soft">&ldquo;{str(s.ask, "Create me a 3D visualization of this.")}&rdquo;</Pill>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 40, justifyContent: "center" }}>
        <svg width={760} height={470} viewBox="0 0 760 470">
          {/* walls rise from the BACK edges, floor in front of them */}
          <SvgIn at={at + 0.6}>
            <polygon points="60,290 380,120 380,20 60,190" fill="#FBFBF9" stroke={T.line} strokeWidth={2} />
            <polygon points="380,120 700,290 700,190 380,20" fill="#F1F1ED" stroke={T.line} strokeWidth={2} />
          </SvgIn>
          <SvgIn at={at + 0.4}>
            <polygon points="380,120 700,290 380,460 60,290" fill="#F6F6F2" stroke={T.line} strokeWidth={2} />
          </SvgIn>
          <SvgIn at={at + 1.2}>
            <polygon points="470,140 630,225 630,145 470,60" fill="#E7EFE4" stroke={T.accent} strokeWidth={2.5} />
          </SvgIn>
          <SvgIn at={at + 1.6}>
            <polygon points="400,250 560,335 455,390 295,305" fill="#F7F2E3" />
          </SvgIn>
          <SvgIn at={at + 2.1}>
            <polygon points="165,282 265,336 265,300 165,246" fill="#E0E0D9" stroke={T.muted} strokeWidth={1.5} />
            <polygon points="320,352 395,392 350,416 275,376" fill="#D2D2CA" stroke={T.muted} strokeWidth={1.5} />
          </SvgIn>
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
          {chips.map((c, i) => <Pill key={i} at={at + 1.4 + i * 0.5} tone="soft">{c}</Pill>)}
        </div>
      </div>
    </div>
  );
};

// ============================================================ metaphors
const Bottleneck: React.FC<P> = ({ s }) => {
  const T = useT();
  const at = n(s.at);
  return (
    <div style={{ textAlign: "center" }}>
      <Eyebrow at={at}>{str(s.eyebrow, "Bottlenecked")}</Eyebrow>
      <svg width={260} height={330} style={{ margin: "30px auto 10px", display: "block" }}>
        <DrawPath at={at + 0.3}
          d="M100,30 L100,90 C100,110 40,150 40,200 L40,300 C40,314 52,322 66,322 L194,322 C208,322 220,314 220,300 L220,200 C220,150 160,110 160,90 L160,30 Z"
          len={1100} dur={1.1} color={T.ink} width={3.5} />
        <SvgIn at={at + 1.4}>
          <circle cx={130} cy={232} r={22} fill="none" stroke={T.accent} strokeWidth={3} />
          <path d="M100 296a30 30 0 0 1 60 0" fill="none" stroke={T.accent} strokeWidth={3} />
        </SvgIn>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center", marginTop: 18 }}>
        {arr<string>(s.causes).map((c, i) => <Pill key={i} at={at + 2.1 + i * 0.6} tone="soft">{c}</Pill>)}
      </div>
    </div>
  );
};

const Funnel: React.FC<P> = ({ s }) => {
  const at = n(s.at);
  return (
    <div>
      <Eyebrow at={at}>{str(s.eyebrow, "The ocean")}</Eyebrow>
      <svg width="100%" height={330} viewBox="0 0 1600 330" style={{ marginTop: 26 }}>
        <SvgIn at={at + 0.3} dy={14}>
          <path d="M40,30 C330,30 470,130 560,152 L1560,152 L1560,196 L560,196 C470,218 330,318 40,318 Z"
            fill="#DCEAF2" stroke="#9BC4DA" strokeWidth={2.5} />
        </SvgIn>
        {[[150, 120], [230, 200], [120, 230], [300, 110], [360, 220], [250, 160]].map(([x, y], i) => (
          <SvgIn key={i} at={at + 0.9 + i * 0.18}>
            <circle cx={x} cy={y} r={11} fill="none" stroke="#6FA6C4" strokeWidth={2.5} />
          </SvgIn>
        ))}
      </svg>
      {s.note ? <div style={{ marginTop: 18 }}><Pill at={at + 2.2} tone="soft">{str(s.note)}</Pill></div> : null}
    </div>
  );
};

const Seesaw: React.FC<P> = ({ s }) => {
  const T = useT();
  const at = n(s.at);
  const tilt = useRamp(at + 1.2, 0.9);
  return (
    <div style={{ textAlign: "center", position: "relative" }}>
      <div style={{ marginBottom: 34 }}><Pill at={at} tone="soft">{str(s.note, "you explored the opportunity")}</Pill></div>
      <svg width={1000} height={300} style={{ overflow: "visible", display: "block", margin: "0 auto" }}>
        <line x1={60} y1={146 - 50 * tilt} x2={940} y2={146 + 50 * tilt} stroke={T.ink} strokeWidth={6} strokeLinecap="round" />
        <circle cx={500} cy={146} r={11} fill={T.accent} />
        <path d="M500,152 L420,286 L580,286 Z" fill="none" stroke={T.deep} strokeWidth={5} strokeLinejoin="round" />
        <line x1={400} y1={286} x2={600} y2={286} stroke={T.deep} strokeWidth={6} strokeLinecap="round" />
      </svg>
      <div style={{ position: "relative", marginTop: -290, display: "flex", justifyContent: "space-between", padding: "0 20px" }}>
        <Enter at={at + 0.4} style={{ transform: `translateY(${-40 * tilt}px)` }}>
          <Card w={300} pad={30}>
            <Ser size={38}>{str(s.up, "Trying")}</Ser>
            <Ui size={23} color={T.muted}>{str(s.upSub, "a few hours")}</Ui>
          </Card>
        </Enter>
        <Enter at={at + 0.8} style={{ marginTop: 120, transform: `translateY(${40 * tilt}px)` }}>
          <div style={{ width: 330, padding: 30, background: T.ink, borderRadius: T.radius }}>
            <Ser size={38} color="#fff">{str(s.down, "Not trying")}</Ser>
            <Ui size={23} color="#8A918C">{str(s.downSub, "the opportunity cost")}</Ui>
          </div>
        </Enter>
      </div>
      <div style={{ marginTop: 66 }}><Eyebrow at={at + 2.2}>{str(s.caption, "So high these days")}</Eyebrow></div>
    </div>
  );
};

const CeoRow: React.FC<P> = ({ s }) => {
  const T = useT();
  const at = n(s.at);
  return (
    <div style={{ textAlign: "center" }}>
      <Eyebrow at={at}>{str(s.eyebrow, "Big CEOs")}</Eyebrow>
      <div style={{ display: "flex", justifyContent: "center", gap: 44, marginTop: 34 }}>
        {[0, 1, 2].map((i) => (
          <Enter key={i} at={at + 0.4 + i * 0.35}>
            <Card w={270} pad={34} style={{ position: "relative" }}>
              <div style={{ position: "absolute", right: -12, top: -12 }}><Tick at={at + 1.6 + i * 0.3} /></div>
              <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth={1.6}
                style={{ margin: "0 auto" }}>
                <path d="M3 18l2-11 5 5 2-7 2 7 5-5 2 11z" />
              </svg>
              <svg width={46} height={46} viewBox="0 0 24 24" fill="none" stroke={T.ink} strokeWidth={1.5}
                style={{ margin: "14px auto" }}>
                <circle cx={12} cy={8} r={4} /><path d="M4 21a8 8 0 0 1 16 0" />
              </svg>
            </Card>
          </Enter>
        ))}
      </div>
      <div style={{ marginTop: 30 }}><Eyebrow at={at + 2.6}>{str(s.caption, "Trying things constantly")}</Eyebrow></div>
      <Enter at={at + 3}>
        <Ser size={54} italic color={T.accent} style={{ marginTop: 22, textAlign: "center" }}>
          {str(s.principle, "First principles")}
        </Ser>
      </Enter>
      {s.ask ? <div style={{ marginTop: 20 }}><Pill at={at + 3.4} tone="soft">&ldquo;{str(s.ask)}&rdquo;</Pill></div> : null}
    </div>
  );
};

// ============================================================ critique & close
const HonestFeedback: React.FC<P> = ({ s }) => {
  const T = useT();
  const at = n(s.at);
  return (
    <div style={{ position: "relative", width: 1140, margin: "0 auto" }}>
      <Enter at={at}>
        <Card pad={40}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 30 }}>
            <IconBox size={28} r={7} bg={T.ghost} />
            <Ui size={27} color={T.muted}>{str(s.title)}</Ui>
          </div>
          {arr<string>(s.items).map((it, i) => (
            <Enter key={i} at={at + 0.6 + i * 0.8} dy={10}>
              <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "22px 0", borderTop: `1px solid ${T.line}` }}>
                <svg width={34} height={34} viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth={1.8}>
                  <circle cx={12} cy={12} r={9} /><path d="M15 9l-6 6M9 9l6 6" />
                </svg>
                <Ui size={30} color={T.ink}>{it}</Ui>
              </div>
            </Enter>
          ))}
        </Card>
      </Enter>
      <div style={{ position: "absolute", right: -250, top: 40 }}>
        <Pill at={at + 0.9 + arr<string>(s.items).length * 0.8}>{str(s.note, "ask for it explicitly")}</Pill>
      </div>
    </div>
  );
};

const YoutubeCard: React.FC<P> = ({ s }) => {
  const T = useT();
  const at = n(s.at);
  const p = useRamp(at + 0.6, 1.0);
  const chips = arr<string>(s.chips);
  return (
    <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
      <Enter at={at}>
        <Card w={760} pad={26}>
          <div style={{ display: "flex", gap: 20 }}>
            <div style={{ flex: 1, padding: 22, background: T.panel, borderRadius: 10 }}>
              <Ser size={30} lh={1.2}>{str(s.title)}</Ser>
            </div>
            <div style={{ width: 150, borderRadius: 10, background: T.ink }} />
          </div>
          <div style={{ height: 5, background: T.ghost, borderRadius: 9, margin: "20px 0 18px", overflow: "hidden" }}>
            <div style={{ height: 5, width: `${64 * p}%`, background: T.alert, borderRadius: 9 }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Avatar ch={str(s.initial, "N")} bg={T.accent} size={40} />
            <div style={{ flex: 1 }}>
              <Ui size={23} color={T.ink}>{str(s.channelTitle)}</Ui>
              <Ui size={19} color={T.muted}>YouTube</Ui>
            </div>
            <Pill at={at + 1.2} style={{ fontSize: 20, padding: "9px 20px" }}>Subscribe</Pill>
          </div>
        </Card>
      </Enter>
      <div>
        <Eyebrow at={at + 1.4}>{str(s.eyebrow, "Changing so quickly")}</Eyebrow>
        <div style={{ height: 20 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
          {chips.map((c, i) => <Pill key={i} at={at + 1.8 + i * 0.45} tone="soft">{c}</Pill>)}
        </div>
      </div>
    </div>
  );
};

const LaptopTiles: React.FC<P> = ({ s }) => {
  const T = useT();
  const at = n(s.at);
  type Tile = { label: string; color: string };
  return (
    <div style={{ textAlign: "center" }}>
      {s.note ? <div style={{ marginBottom: 26 }}><Pill at={at} tone="soft">{str(s.note)}</Pill></div> : null}
      <Enter at={at + 0.3}>
        <div style={{ display: "inline-block" }}>
          <div style={{
            width: 900, height: 460, background: T.ink, borderRadius: 20,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 48,
          }}>
            {arr<Tile>(s.tiles).map((tl, i) => (
              <Enter key={i} at={at + 0.9 + i * 0.5}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: 104, height: 104, borderRadius: 24, background: tl.color, margin: "0 auto 18px" }} />
                  <Ui size={23} color="#A8AFA9">{tl.label}</Ui>
                </div>
              </Enter>
            ))}
          </div>
          <div style={{ width: 1020, height: 16, background: T.ghost, borderRadius: "0 0 14px 14px", marginLeft: -60 }} />
        </div>
      </Enter>
    </div>
  );
};

const ScreenShare: React.FC<P> = ({ s }) => {
  const T = useT();
  const at = n(s.at);
  return (
    <Enter at={at}>
      <Card pad={32}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <IconBox size={26} r={7} bg={T.ghost} /><Ui size={24} color={T.muted}>{str(s.title, "Your screen")}</Ui>
        </div>
        <div style={{ display: "flex", gap: 26 }}>
          <div style={{
            width: 360, height: 250, background: T.ink, borderRadius: 12,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16,
          }}>
            <Enter at={at + 0.6}>
              <div style={{ width: 84, height: 84, borderRadius: "50%", background: T.ai }} />
            </Enter>
            <Enter at={at + 1.0}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: T.ui, fontSize: 20, color: "#A8AFA9" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.success }} />
                {str(s.agent, "AI coworker")}
              </div>
            </Enter>
          </div>
          <div style={{ flex: 1, paddingTop: 14 }}>
            {["100%", "82%", "91%", "60%"].map((w, i) => (
              <Enter key={i} at={at + 1.4 + i * 0.25} dy={6}><Ghost w={w} /></Enter>
            ))}
          </div>
        </div>
      </Card>
    </Enter>
  );
};

const OutroCta: React.FC<P> = ({ s }) => {
  const T = useT();
  const at = n(s.at);
  return (
    <div style={{ textAlign: "center" }}>
      <Eyebrow at={at}>{str(s.eyebrow, "Want to learn more?")}</Eyebrow>
      <div style={{ height: 20 }} />
      <Head text={str(s.headline)} at={at + 0.3} size={76} align="center" />
      <div style={{ display: "flex", justifyContent: "center", gap: 30, marginTop: 46, alignItems: "center" }}>
        <Win at={at + 1.4} w={740} h={290}>
          <div style={{ padding: "26px 30px", display: "flex", gap: 24 }}>
            <div style={{ width: 230, height: 150, borderRadius: 10, background: T.ghost }} />
            <div style={{ flex: 1, textAlign: "left" }}>
              <Ser size={30} lh={1.2}>{str(s.offer)}</Ser>
              <div style={{ marginTop: 14 }}><Ghost w="86%" h={13} mb={10} /><Ghost w="66%" h={13} mb={10} /></div>
              <div style={{
                marginTop: 16, display: "inline-block", background: T.accent, color: "#fff",
                borderRadius: 10, padding: "11px 22px", fontFamily: T.ui, fontSize: 22,
              }}>{str(s.cta, "Join")}</div>
            </div>
          </div>
        </Win>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
          {arr<string>(s.chips).map((c, i) => (
            <Pill key={i} at={at + 2.2 + i * 0.5} tone="soft">{c}</Pill>
          ))}
        </div>
      </div>
    </div>
  );
};

/** Full-frame screen recording. The face PiP is drawn by Main, not here. */
const Screen: React.FC<P> = ({ s }) => {
  const T = useT();
  const at = n(s.at);
  return (
    <div style={{ position: "absolute", inset: 0, background: T.panel }}>
      <div style={{
        position: "absolute", left: 0, top: 0, right: 0, height: 62, background: T.ghost,
        display: "flex", alignItems: "center", gap: 10, paddingLeft: 24,
      }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ width: 180, height: 34, borderRadius: 8, background: i === 0 ? "#FFF" : "#E3E0D8" }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 70, top: 150, width: 1200 }}>
        {["72%", "86%", "54%"].map((w, i) => (
          <Enter key={i} at={at + 0.4 + i * 0.3} dy={6}><Ghost w={w} h={24} mb={22} /></Enter>
        ))}
        <Enter at={at + 1.4}>
          <div style={{ height: 300, borderRadius: 14, background: "#E6E3DB", marginTop: 26 }} />
        </Enter>
      </div>
    </div>
  );
};

// ============================================================ registry
export const MORE: Record<string, React.FC<P>> = {
  authority: Authority,
  strike: Strike,
  chartrow: ChartRow,
  loop: Loop,
  branch: Branch,
  costcompare: CostCompare,
  playerbar: PlayerBar,
  quotelines: QuoteLines,
  outlinepill: OutlinePill,
  "icon-card": IconCard,
  "search-bar": SearchBar,
  terminal: Terminal,
  "before-after": BeforeAfter,
  "company-icons": CompanyIcons,
  "docs-page": DocsPage,
  "assistant-listening": AssistantListening,
  "ea-concept": EaConcept,
  "logo-tiles": LogoTiles,
  "transcript-card": TranscriptCard,
  "token-chips": TokenChips,
  "gallery-chips": GalleryChips,
  "isometric-room": IsometricRoom,
  bottleneck: Bottleneck,
  funnel: Funnel,
  seesaw: Seesaw,
  "ceo-row": CeoRow,
  "honest-feedback": HonestFeedback,
  "youtube-card": YoutubeCard,
  "laptop-tiles": LaptopTiles,
  "screen-share": ScreenShare,
  "outro-cta": OutroCta,
  screen: Screen,
};
