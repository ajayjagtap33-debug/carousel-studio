// Google Sheets recreation of the TMV "All-in-One AEO & GEO Audit Checklist", built from Ajay's screenshots
// (reels/2026-10-30-aeo-geo-checklist/input). Row text is copied from them; nothing here is invented except
// where marked "added".
import React from "react";
import { Img, staticFile } from "remotion";
import { Cursor, clamp01, prog, useC, useNow } from "./kit";

export const TABS = ["Overview & Instructions", "SEO Foundation", "AEO Readiness", "GEO Readiness", "Local SEO Readiness",
  "Monitoring & Optimization", "Quick Wins", "# Score Dashboard", "Resources & Links"];
const TAB_LINE: Record<string, string> = {
  "Overview & Instructions": "#4A86E8", "Quick Wins": "#F1C232", "# Score Dashboard": "#CC0000", "Resources & Links": "#4A86E8",
};

type P = "High" | "Medium" | "Low";
type S = "" | "Not Started" | "In Progress" | "Completed";
export type Row = { item: string; p: P; s?: S; note?: string; impact?: P };
export type TabData = { title: string; category: string; rows: Row[]; quick?: boolean; skeleton?: boolean };

export const DATA: Record<string, TabData> = {
  "SEO Foundation": { title: "SEO FOUNDATION", category: "Setup & Configuration", rows: [
    { item: "Google Search Console connected and verified", p: "High", s: "Not Started" },
    { item: "Google Analytics 4 installed and tracking correctly", p: "High" },
    { item: "Bing Webmaster Tools connected", p: "Medium", s: "Completed" },
    { item: "About page exists with company/author info", p: "High" },
    { item: "Contact page with multiple contact methods", p: "High", s: "In Progress" },
    { item: "Terms of Service page published", p: "Medium" },
    { item: "Privacy Policy page published", p: "High", s: "Not Started" },
    { item: "Favicon installed and displaying", p: "Low" },
    { item: "Site is crawlable (no critical pages blocked in robots.txt)", p: "High" },
  ] },
  "AEO Readiness": { title: "AEO READINESS", category: "Answer-First Format", rows: [
    { item: "Key facts appear in first 2-3 sentences of sections", p: "High", note: "Lead with the answer, details follow" },
    { item: "Descriptive headers used (match actual search queries)", p: "High" },
    { item: "Concise definitions (important terms defined in under 50 words)", p: "High" },
    { item: "Short paragraphs (most are 2-4 sentences maximum)", p: "Medium" },
    { item: "Direct question answering (\"What is,\" \"How to,\" \"Why\")", p: "High" },
    { item: "Summary boxes or callouts (key takeaways highlighted)", p: "Medium" },
    { item: "Statistics presented clearly (numbers easy to find)", p: "Medium" },
    { item: "No fluff in intros (get to the point immediately)", p: "High" },
    { item: "Active voice used (clear, direct language throughout)", p: "Medium" },
  ] },
  "GEO Readiness": { title: "GEO READINESS", category: "Technical Accessibility", rows: [
    { item: "Key content is in raw HTML (not JavaScript-rendered)", p: "High", s: "Not Started" },
    { item: "No critical info locked in PDFs (key data accessible in HTML)", p: "High" },
    { item: "No text embedded in images only (important info in readable text)", p: "High", s: "Completed" },
    { item: "Fast page load (pages load in under 3 seconds)", p: "High" },
    { item: "Mobile optimization complete (content displays properly)", p: "High", s: "In Progress" },
    { item: "Proper semantic HTML (correct use of header tags, lists, tables)", p: "Medium" },
    { item: "No pop-ups blocking content (interstitials don't hide content)", p: "Medium", s: "Not Started" },
    { item: "Clean code structure (minimal unnecessary scripts)", p: "Low" },
    { item: "llms.txt file created (optional: guides AI crawlers)", p: "Low" },
  ] },
  "Local SEO Readiness": { title: "LOCAL SEO READINESS", category: "Google Business Profile", rows: [
    { item: "Business claimed and verified on Google", p: "High", s: "Not Started" },
    { item: "Physical address accurate and complete", p: "High" },
    { item: "Service area defined (if service-area business)", p: "High", s: "Completed" },
    { item: "Business hours accurate and current", p: "High" },
    { item: "Primary category selected correctly", p: "High", s: "In Progress" },
    { item: "3-5 secondary categories added", p: "Medium" },
    { item: "Business description optimized with keywords", p: "High", s: "Not Started" },
    { item: "Business attributes selected (women-owned, etc.)", p: "Low" },
    { item: "Photos added: 3+ exterior shots", p: "High" },
  ] },
  // No screenshot of this tab yet: only its name is real, the rows are blank placeholders.
  "Monitoring & Optimization": { title: "MONITORING & OPTIMIZATION", category: "", skeleton: true, rows: Array.from({ length: 9 }, () => ({ item: "", p: "High" as P })) },
  "Quick Wins": { title: "Quick Wins", category: "", quick: true, rows: [
    { item: "Add FAQ schema to your top 3 highest-traffic pages", p: "High", impact: "High", s: "Not Started" },
    { item: "Rewrite 5 intro paragraphs to lead with direct answers", p: "High", impact: "Medium" },
    { item: "Create one comparison table for a key decision query", p: "Medium", impact: "Medium", s: "Completed" },
    { item: "Update \"last modified\" dates on your 10 most important pages", p: "Medium", impact: "Low" },
    { item: "Add author bios with credentials to your main articles", p: "High", impact: "Medium", s: "In Progress" },
    { item: "Test 5 AI prompts to see if ChatGPT or Perplexity mention you", p: "High", impact: "High" },
    { item: "Claim and update your Google Business Profile completely", p: "High", impact: "High", s: "Not Started" },
    { item: "Publish one original data point or statistic from your experience", p: "High", impact: "High" },
    { item: "Reach out for one PR opportunity (guest post or interview pitch)", p: "Medium", impact: "High" },
  ] },
};

const CHIP: Record<string, [string, string]> = {
  High: ["#D9EAD3", "#38761D"], Medium: ["#CFE2F3", "#1C5FAE"], Low: ["#FFF2CC", "#B7860B"],
  "Not Started": ["#F4CCCC", "#CC0000"], "In Progress": ["#E4D7F5", "#6A48B0"], Completed: ["#D9EAD3", "#38761D"], "": ["#ECECEC", "#ECECEC"],
};
const ARIAL = "Arial, Helvetica, sans-serif";

export const Chip: React.FC<{ v: string; w: number; fs: number; glow?: number }> = ({ v, w, fs, glow = 0 }) => {
  const C = useC();
  const [bg, fg] = CHIP[v] ?? CHIP[""];
  return (
    <div style={{ width: w, height: fs * 1.45, borderRadius: fs, background: bg, color: fg, fontFamily: ARIAL, fontSize: fs,
      display: "flex", alignItems: "center", justifyContent: "center", whiteSpace: "nowrap",
      boxShadow: glow > 0 ? `0 0 0 ${2.5 * glow}px ${C.accent}` : undefined }}>{v}</div>
  );
};

export const Checkbox: React.FC<{ on: number; size: number }> = ({ on, size }) => (
  <div style={{ width: size, height: size, borderRadius: 3, border: `2px solid ${on > 0 ? "#1A73E8" : "#F0A030"}`,
    background: on > 0 ? "#1A73E8" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box",
    transform: `scale(${1 + 0.25 * Math.sin(Math.PI * clamp01(on))})` }}>
    {on > 0 && <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 20 20"><path d="M4 10.5 L8.5 15 L16 5.5" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>}
  </div>
);

/** The tab strip at the bottom of the sheet, scrolled so the active tab is in view. */
export const TabBar: React.FC<{ active: string; fs: number; w: number }> = ({ active, fs, w }) => {
  const C = useC();
  const idx = Math.max(0, TABS.indexOf(active));
  const widths = TABS.map((n) => n.length * fs * 0.56 + fs * 2.6);
  let off = 0;
  for (let i = 0; i < idx; i++) off += widths[i];
  const shift = Math.max(0, off + widths[idx] - w + fs * 3) > 0 ? Math.max(0, off - fs * 4) : 0;
  return (
    <div style={{ height: fs * 2.6, background: "#F8F9FA", borderTop: "1px solid #DADCE0", overflow: "hidden", position: "relative" }}>
      <div style={{ display: "flex", position: "absolute", left: -shift, top: 0, height: "100%" }}>
        {TABS.map((n, i) => (
          <div key={n} style={{ width: widths[i], display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ARIAL,
            fontSize: fs, fontWeight: i === idx ? 700 : 400, color: i === idx ? "#1A57C6" : "#3C4043", whiteSpace: "nowrap",
            background: i === idx ? "#E8F0FE" : "transparent", borderBottom: `4px solid ${TAB_LINE[n] ?? "#38761D"}`, boxSizing: "border-box" }}>
            {n}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", inset: 0, boxShadow: `inset 0 0 0 0 ${C.accent}` }} />
    </div>
  );
};

/** One tab of the sheet: tmv logo, red banner, section title, header row, rows, tab bar. */
export const SheetTab: React.FC<{
  tab: string; w: number; h: number; fs?: number;
  ticks?: { at: number; row: number }[];          // checkbox ticks (row index)
  chipGlow?: { at: number; step?: number };        // Priority/Impact chips light up row by row
  cursor?: { at: number; row: number }[];          // cursor moves to these checkboxes
}> = ({ tab, w, h, fs = 19, ticks = [], chipGlow, cursor = [] }) => {
  const C = useC();
  const t = useNow();
  const d = DATA[tab];
  const rowH = fs * 2.15;
  const chipW = fs * 5.6;
  const cb = fs * 2.4;
  const top = fs * 1.6 + fs * 3.6 + fs * 2.3 + fs * 2.6 + fs * 2.2; // letters + logo + banner + title + header
  const statusFor = (r: Row, i: number): S => {
    const tk = ticks.find((k) => k.row === i);
    return tk && t >= tk.at + 0.1 ? "Completed" : (r.s ?? "");
  };
  // cursor path: glide between targets
  let cur: { x: number; y: number; down: boolean } | null = null;
  if (cursor.length) {
    const pos = (row: number) => ({ x: cb * 0.55, y: top + row * rowH + rowH * 0.55 });
    let p = { x: w * 0.6, y: h * 0.75 };
    let down = false;
    for (const c of cursor) {
      const target = pos(c.row);
      const k = prog(t, c.at - 0.3, 0.28);
      p = { x: p.x + (target.x - p.x) * k, y: p.y + (target.y - p.y) * k };
      if (t >= c.at - 0.04 && t < c.at + 0.08) down = true;
    }
    cur = { ...p, down };
  }
  return (
    <div style={{ width: w, height: h, background: "#fff", position: "relative", fontFamily: ARIAL, overflow: "hidden" }}>
      {/* column letters */}
      <div style={{ height: fs * 1.6, background: "#F8F9FA", borderBottom: "1px solid #DADCE0", display: "flex", fontSize: fs * 0.72, color: "#5F6368" }}>
        {["A", "B", "C", "D", "E", "F"].map((l, i) => (
          <div key={l} style={{ flex: i === 1 ? 4 : 1, display: "flex", alignItems: "center", justifyContent: "center", borderRight: "1px solid #E2E3E3" }}>{l}</div>
        ))}
      </div>
      <div style={{ height: fs * 3.6, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Img src={staticFile("logos/tmv-red.png")} style={{ height: fs * 2.6 }} />
      </div>
      <div style={{ height: fs * 2.3, background: "#A8473F", color: "#fff", fontWeight: 700, fontSize: fs * 0.95, display: "flex", alignItems: "center", justifyContent: "center" }}>
        AEO &amp; GEO Audit Checklist | Track My Visibility
      </div>
      <div style={{ height: fs * 2.6, display: "flex", alignItems: "center", justifyContent: "center", color: C.accent, fontWeight: 700, fontSize: fs * 1.25 }}>{d.title}</div>
      <div style={{ height: fs * 2.2, display: "flex", alignItems: "center", borderTop: "1.5px solid #222", borderBottom: "3px solid #BDBDBD",
        color: C.accent, fontWeight: 700, fontSize: fs * 0.85 }}>
        <div style={{ width: cb, textAlign: "center" }}>☑</div>
        <div style={{ flex: 1, textAlign: "center" }}>{d.quick ? "Quick Win Items" : "Checklist Item"}</div>
        <div style={{ width: chipW + fs, textAlign: "center" }}>Priority</div>
        {d.quick && <div style={{ width: chipW + fs, textAlign: "center" }}>Impact</div>}
        <div style={{ width: chipW * 1.15 + fs, textAlign: "center" }}>Status</div>
      </div>
      {d.rows.map((r, i) => {
        const g = chipGlow ? clamp01((t - (chipGlow.at + i * (chipGlow.step ?? 0.18))) / 0.2) * (1 - clamp01((t - (chipGlow.at + i * (chipGlow.step ?? 0.18) + 0.5)) / 0.4)) : 0;
        const tk = ticks.find((k) => k.row === i);
        const on = tk ? clamp01((t - tk.at) / 0.18) : 0;
        return (
          <div key={i} style={{ height: rowH, display: "flex", alignItems: "center", borderBottom: "1px solid #E6E6E6", fontSize: fs, color: "#202124" }}>
            <div style={{ width: cb, display: "flex", justifyContent: "center" }}><Checkbox on={on} size={fs * 1.05} /></div>
            <div style={{ flex: 1, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", paddingRight: fs * 0.5 }}>
              {d.skeleton ? <div style={{ height: fs * 0.8, width: `${55 + ((i * 37) % 35)}%`, background: "#ECEDEF", borderRadius: 4 }} /> : r.item}
            </div>
            <div style={{ width: chipW + fs, display: "flex", justifyContent: "center" }}>
              {d.skeleton ? <div style={{ width: chipW, height: fs * 1.45, borderRadius: fs, background: "#F1F2F4" }} /> : <Chip v={r.p} w={chipW} fs={fs * 0.85} glow={g} />}
            </div>
            {d.quick && <div style={{ width: chipW + fs, display: "flex", justifyContent: "center" }}><Chip v={r.impact ?? ""} w={chipW} fs={fs * 0.85} glow={g} /></div>}
            <div style={{ width: chipW * 1.15 + fs, display: "flex", justifyContent: "center" }}>
              <Chip v={d.skeleton ? "" : statusFor(r, i)} w={chipW * 1.15} fs={fs * 0.85} />
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}><TabBar active={tab} fs={fs * 0.9} w={w} /></div>
      {cur && <Cursor x={cur.x} y={cur.y} down={cur.down} />}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", outline: `0px solid ${C.accent}` }} />
    </div>
  );
};

/** Score Dashboard tab: six sections with their real item counts; "Your Score" counts up when `countAt` is set. */
export const SECTIONS: [string, number][] = [["SEO Foundation", 62], ["AEO Readiness", 45], ["GEO Readiness", 65],
  ["Local SEO Readiness", 30], ["Monitoring & Optimization", 30], ["Quick Wins", 18]];
// added: demo scores for the count-up (the real sheet starts at 0)
const DEMO = [41, 23, 30, 21, 12, 14];

export const ScoreDash: React.FC<{ w: number; h: number; fs?: number; countAt?: number; countDur?: number; rowsAt?: number; rowStep?: number; ringTotalAt?: number }> =
({ w, h, fs = 24, countAt, countDur = 1.6, rowsAt, rowStep = 0.12, ringTotalAt }) => {
  const C = useC();
  const t = useNow();
  const k = countAt === undefined ? 0 : clamp01((t - countAt) / countDur);
  const rowH = fs * 2.2;
  const scores = DEMO.map((v) => Math.round(v * k));
  const total = scores.reduce((a, b) => a + b, 0);
  const cell = (txt: React.ReactNode, flex: number, bold = false, color = "#202124") => (
    <div style={{ flex, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: bold ? 700 : 400, color, borderRight: "1px solid #CFCFCF", height: "100%" }}>{txt}</div>
  );
  const ringP = ringTotalAt === undefined ? 0 : prog(t, ringTotalAt, 0.35);
  return (
    <div style={{ width: w, height: h, background: "#fff", fontFamily: ARIAL, fontSize: fs, position: "relative" }}>
      <div style={{ height: fs * 3.4, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Img src={staticFile("logos/tmv-red.png")} style={{ height: fs * 2.3 }} />
      </div>
      <div style={{ height: fs * 2.1, background: "#A8473F", color: "#fff", fontWeight: 700, fontSize: fs * 0.8, display: "flex", alignItems: "center", justifyContent: "center" }}>
        AEO &amp; GEO Audit Checklist | Track My Visibility
      </div>
      <div style={{ height: fs * 2.4, display: "flex", alignItems: "center", justifyContent: "center", color: C.accent, fontWeight: 700, fontSize: fs * 1.15 }}>Score Dashboard</div>
      <div style={{ height: rowH, display: "flex", color: C.accent, fontWeight: 700, borderTop: "1.5px solid #222", borderBottom: "3px solid #BDBDBD", fontSize: fs * 0.9 }}>
        {cell("Sections", 2.2, true, C.accent)}{cell("Total Items", 1, true, C.accent)}{cell("Your Score", 1, true, C.accent)}{cell("Percentage", 1, true, C.accent)}
      </div>
      {SECTIONS.map(([n, tot], i) => {
        const hl = rowsAt === undefined ? 0 : clamp01((t - (rowsAt + i * rowStep)) / 0.15);
        return (
          <div key={n} style={{ height: rowH, display: "flex", borderBottom: "1px solid #CFCFCF", background: hl > 0 ? `rgba(184,0,0,${0.07 * hl})` : undefined }}>
            {cell(n, 2.2, true)}{cell(tot, 1)}{cell(scores[i], 1, k > 0, k > 0 ? C.accent : "#202124")}{cell(`${Math.round((scores[i] / tot) * 100)}%`, 1, k > 0, k > 0 ? C.accent : "#202124")}
          </div>
        );
      })}
      <div style={{ height: fs * 0.9 }} />
      <div style={{ height: rowH, display: "flex", borderTop: "1px solid #CFCFCF", borderBottom: "1px solid #CFCFCF", position: "relative" }}>
        {cell("OVERALL TOTAL", 2.2, true, C.accent)}{cell(<b>250</b>, 1)}{cell(total, 1, k > 0, k > 0 ? C.accent : "#202124")}{cell(`${Math.round((total / 250) * 100)}%`, 1, k > 0, k > 0 ? C.accent : "#202124")}
        {ringTotalAt !== undefined && (
          <div style={{ position: "absolute", left: `${(2.2 / 5.2) * 100}%`, width: `${(1 / 5.2) * 100}%`, top: -6, bottom: -6,
            border: `3.5px solid ${C.accent}`, borderRadius: 14, opacity: ringP, transform: `scale(${1.3 - 0.3 * ringP})` }} />
        )}
      </div>
    </div>
  );
};
