// Watchable demo of the Refluke scene library — every built type, six seconds each, so the
// motion can be reviewed before a real cut exists. Content is placeholder, not claims.
import React from "react";
import { ReflukeMain } from "./Main";
import type { RScene } from "./scenes";

const SEC = 6;
let k = 0;
const slot = () => {
  const start = k * SEC;
  k += 1;
  return { start, end: start + SEC - 0.2, at: start + 0.3 };
};

export const SAMPLE_SCENES: RScene[] = [
  { type: "statement", placement: "tab-right", ...slot(),
    head: "AI does not replace marketers. It *exposes weak ones* and amplifies strong ones.", size: 82 },

  { type: "number", placement: "tab-right", ...slot(),
    eyebrow: "Branded searches", qualifier: "about", value: 83, suffix: "%", size: 168 },

  { type: "spine", placement: "tab-right", ...slot(),
    title: "Five things to fix",
    items: [
      { text: "Answer the question in the first 40 words", revealAt: 12.4, doneAt: 13.0 },
      { text: "One claim per heading", revealAt: 12.6, doneAt: 13.4 },
      { text: "Put the number in the sentence", revealAt: 12.8, activeAt: 13.8 },
      { text: "Name the source inline" },
      { text: "Keep the page one scroll" },
    ] },

  { type: "bars", placement: "tab-right", ...slot(),
    title: "Where the answers come from", eyebrow: "your category",
    items: [
      { label: "Your own site", value: "12%", frac: 12, tone: "ghost" },
      { label: "Third-party listicles", value: "61%", frac: 61 },
    ] },

  { type: "trend", placement: "half-right", ...slot(),
    title: "Citations, 90 days", chips: ["daily", "weekly"] },

  { type: "stepchart", placement: "tab-right", ...slot(),
    title: "A hard benchmark", label: "Day 30", value: 53, steps: 12, note: "considered impossible" },

  { type: "flow", placement: "tab-right", ...slot(),
    eyebrow: "How a citation happens",
    nodes: [
      { text: "A prompt someone types" },
      { text: "The page it quotes" },
      { text: "Your brand in the answer", kind: "dark" },
    ] },

  { type: "cited", placement: "tab-right", ...slot(),
    source: "Stanford Report · “three times faster than human typing” · Aug 24, 2016",
    meta: "August 24th, 2016 | 3 min read",
    pre: "Smartphone speech recognition can write text messages",
    clause: "three times faster", post: "than human typing" },

  { type: "pullquote", placement: "tab-right", ...slot(),
    source: "arXiv · Sharma et al. · Towards Understanding Sycophancy · 2023",
    title: "Towards Understanding Sycophancy in Language Models",
    pre: "…human feedback may encourage responses that",
    clause: "match user beliefs over truthful ones",
    post: ", a behaviour known as sycophancy." },

  { type: "uiframe", placement: "tab-right", ...slot(),
    app: "Claude", text: "best AI visibility tracking tools for B2B SaaS",
    tiles: [{ label: "Your mic" }, { label: "Your screen" }, { label: "System audio" }] },

  { type: "chatpills", placement: "tab-right", ...slot(),
    msgs: [
      { text: "What do you think about this?" },
      { text: "Is this email all right?" },
      { text: "What do you think about my project?" },
    ],
    pills: [{ text: "you can't just ask" }, { text: "always something good" }] },

  { type: "todos", placement: "tab-right", ...slot(),
    title: "Meeting to-dos", timer: "14:33",
    rows: [
      { av: "A", color: "#6E8FD6", name: "Ashley", task: "Ship the pricing page" },
      { av: "S", color: "#E2A33F", name: "Sam", task: "Send the proposal" },
      { av: "S", color: "#5BB97E", name: "Sarah", task: "Pull last month's numbers" },
    ] },

  // ---- part two: the remaining 32 types ----
  { type: "authority", placement: "tab-right", ...slot(),
    eyebrow: "The smartest people on earth", verdict: "don't use AI like you do",
    source: "placeholder — real quotes must be sourced",
    quotes: [
      { quote: "I use AI every day", name: "Person A" },
      { quote: "I use it as an operating system", name: "Person B" },
      { quote: "a sort of mid-level engineer", name: "Person C" },
      { quote: "better than PhD level", name: "Person D" },
    ] },

  { type: "strike", placement: "tab-right", ...slot(),
    title: "The difference", wrong: "A better model", right: "A different tool" },

  { type: "chartrow", placement: "band", ...slot(),
    a: "Dense reports", b: "Analytics", c: "Animated explainer" },

  { type: "loop", placement: "tab-right", ...slot(),
    title: "RLHF", eyebrow: "Reinforcement learning through human feedback",
    a: "AI model", b: "Human feedback" },

  { type: "branch", placement: "half-left", ...slot(),
    from: "One prompt", good: "You are quoted", bad: "A listicle is", goodDark: true },

  { type: "costcompare", placement: "tab-right", ...slot(),
    eyebrow: "This sounds crazy, but", mineLabel: "Your system", price: "$1–2", per: "a day",
    verb: "replaces", theirs: "A competent EA" },

  { type: "playerbar", placement: "tab-right", ...slot(),
    label: "This video", pct: 72, time: "5:01 / 7:00" },

  { type: "quotelines", placement: "tab-right", ...slot(),
    eyebrow: "Always say",
    lines: ["What is wrong with my idea?", "Poke holes in my thoughts."] },

  { type: "outlinepill", placement: "tab-right", ...slot(),
    text: "Same model", note: "a new way of doing things" },

  { type: "icon-card", placement: "corner", ...slot(), label: "Voice dictation" },

  { type: "search-bar", placement: "tab-right", ...slot(),
    query: "free voice dictation tool", note: "don't believe me? look it up" },

  { type: "terminal", placement: "half-right", ...slot(), cmd: "/skills" },

  { type: "before-after", placement: "tab-right", ...slot(),
    title: "Your vocabulary", before: "clawed code", after: "Claude Code" },

  { type: "company-icons", placement: "band", ...slot(), title: "The world's best companies" },

  { type: "docs-page", placement: "tab-right", ...slot(),
    source: "OpenAI docs · model page", name: "GPT-Realtime-2.1", sub: "Reasoning model with tool use",
    specs: [{ k: "Speed", v: "Fast" }, { k: "Input", v: "$4" }, { k: "Output", v: "$24" },
            { k: "Context", v: "128,000" }, { k: "Modalities", v: "Text · Audio" }] },

  { type: "assistant-listening", placement: "corner", ...slot(),
    title: "AI assistant",
    lines: [{ who: "Ashley", what: "Let's ship the pricing page on Friday." },
            { who: "Sam", what: "I'll send the proposal after this call." }] },

  { type: "ea-concept", placement: "tab-right", ...slot(),
    eyebrow: "Think of this as", a: "An EA", aSub: "always with you", b: "Meeting notes" },

  { type: "logo-tiles", placement: "tab-right", ...slot(),
    eyebrow: "The simplest way to set this up", title: "A frontier LLM",
    names: ["Claude", "OpenAI"], note: "the best one you can get" },

  { type: "transcript-card", placement: "half-left", ...slot(),
    out: "real projects",
    lines: [{ who: "Ashley", what: "Ship the pricing page Friday." },
            { who: "Sam", what: "Proposal goes out today." },
            { who: "Sarah", what: "I'll pull the numbers." }] },

  { type: "token-chips", placement: "tab-right", ...slot(),
    eyebrow: "Word tokens", punch: "1,000 words",
    words: "rather than tell the best people always show So they spend a bunch of time in word tokens" },

  { type: "gallery-chips", placement: "tab-right", ...slot(),
    source: "threejs.org · projects built with three.js", caption: "Agents build them",
    chips: ["Three.js", "HTML", "Unreal Engine", "Blender"] },

  { type: "isometric-room", placement: "tab-right", ...slot(),
    ask: "Create me a 3D visualization of this.",
    chips: ["realistic lighting", "Google Maps view", "real furniture"] },

  { type: "bottleneck", placement: "half-right", ...slot(),
    eyebrow: "Bottlenecked",
    causes: ["lack of knowledge", "lack of explicit verbalization"] },

  { type: "funnel", placement: "band", ...slot(),
    eyebrow: "The ocean", note: "piping an ocean through a straw" },

  { type: "seesaw", placement: "tab-right", ...slot(),
    note: "you explored the opportunity", up: "Trying", upSub: "a few hours",
    down: "Not trying", downSub: "the opportunity cost", caption: "So high these days" },

  { type: "ceo-row", placement: "band", ...slot(),
    eyebrow: "Big CEOs", caption: "Trying things constantly",
    principle: "First principles", ask: "Is this thing possible?" },

  { type: "honest-feedback", placement: "tab-right", ...slot(),
    title: "Honest feedback on your essay", note: "ask for it explicitly",
    items: ["The opening buries your main point.",
            "Paragraph two makes a claim with no evidence.",
            "The close repeats the hook instead of landing it."] },

  { type: "youtube-card", placement: "tab-right", ...slot(),
    title: "How the smartest people use AI", channelTitle: "How the Smartest People Use AI",
    initial: "R", eyebrow: "Changing so quickly",
    chips: ["New model", "New feature", "New harness"] },

  { type: "laptop-tiles", placement: "tab-right", ...slot(),
    note: "whatever models you're running",
    tiles: [{ label: "Claude Code", color: "#C96442" }, { label: "Codex", color: "#F5F5F3" },
            { label: "Nemotron", color: "#2ADD5E" }] },

  { type: "screen-share", placement: "half-left", ...slot(),
    title: "Your screen", agent: "AI coworker" },

  { type: "outro-cta", placement: "tab-right", ...slot(),
    eyebrow: "Want to learn more?", headline: "Use AI like a *business person*",
    offer: "Your first AI client in 90 days", cta: "Join",
    chips: ["✓ 90 days", "your very first customer"] },

  { type: "screen", placement: "pip", pip: "br", ...slot() },
];

export const SAMPLE_SECONDS = k * SEC;

export const ReflukeSample: React.FC<{ faceGuide?: boolean }> = ({ faceGuide = true }) => (
  <ReflukeMain
    video=""
    media={{ fps: 30, width: 1920, height: 1080, duration: SAMPLE_SECONDS }}
    scenes={SAMPLE_SCENES}
    faceGuide={faceGuide}
  />
);
