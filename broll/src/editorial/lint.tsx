// Layout lint (props.lint): after fonts load, measure the rendered frame and console.log `LINT [...]` issues,
// which shoot.mjs forwards to scripts/broll.py check. Markers (no visual effect): data-box on cards/frames
// (text must stay inside them and inside fixed-height rows), data-lint="chrome" on decorative small text (URL bar, face-box label).
import React, { useLayoutEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";
import { FACE } from "./frame";

export const MIN_TEXT = 24, MIN_LABEL = 20; // px at 1080p; ≤3-word labels may go down to MIN_LABEL
const SHEET = { l: 22, t: 22, r: 1920 - 22, b: 1080 - 22 };
const FACE_RECT = { l: 1920 - FACE.right - FACE.w, t: (1080 - FACE.h) / 2, r: 1920 - FACE.right, b: (1080 + FACE.h) / 2 };

type R = { l: number; t: number; r: number; b: number };
// rects relative to the frame root, in 1920x1080 units (Remotion may offset and scale the composition)
let O = { x: 0, y: 0, k: 1 };
const rect = (d: DOMRect): R => ({ l: (d.left - O.x) / O.k, t: (d.top - O.y) / O.k, r: (d.right - O.x) / O.k, b: (d.bottom - O.y) / O.k });
const hits = (a: R, b: R) => a.l < b.r - 1 && a.r > b.l + 1 && a.t < b.b - 1 && a.b > b.t + 1;
const outBy = (inner: R, outer: R) => Math.max(outer.l - inner.l, outer.t - inner.t, inner.r - outer.r, inner.b - outer.b);
const short = (s: string) => (s.length > 40 ? s.slice(0, 38) + "..." : s);

function measure(root: HTMLElement, face: boolean) {
  const out: string[] = [];
  const o = root.getBoundingClientRect();
  O = { x: o.left, y: o.top, k: o.width / 1920 || 1 };
  for (const el of Array.from(root.querySelectorAll<HTMLElement>("*"))) {
    // a [data-text] block (headline of word spans) is measured as one piece, not word by word
    const group = el.hasAttribute("data-text");
    if (!group && el.parentElement?.closest("[data-text]")) continue;
    const own = Array.from(el.childNodes).filter((n) => n.nodeType === 3 && n.textContent!.trim());
    if ((!group && !own.length) || el.closest("[data-lint=chrome]")) continue;
    const words = (n: Node): string[] => n.nodeType === 3 ? [n.textContent!.trim()] : Array.from(n.childNodes).flatMap(words);
    const text = (group ? words(el) : own.map((n) => n.textContent!.trim())).filter(Boolean).join(" ");
    const range = document.createRange();
    range.selectNodeContents(el);
    const tr = rect(range.getBoundingClientRect());
    // size as seen on screen (includes scale transforms)
    const scale = el.offsetWidth ? el.getBoundingClientRect().width / el.offsetWidth / O.k : 1;
    const px = parseFloat(getComputedStyle(el).fontSize) * scale;
    const n = text.split(" ").length;
    if (px < MIN_TEXT - 0.5 && !(n <= 3 && px >= MIN_LABEL - 0.5))
      out.push(`text "${short(text)}" is ${Math.round(px)}px (min ${MIN_TEXT}, ${MIN_LABEL} for labels of 3 words or less)`);
    // its box: the nearest card/frame, or a fixed-height row inside one (wrapped text spills into the next row)
    let box: HTMLElement | null = el.parentElement;
    while (box && box !== root && !box.hasAttribute("data-box") && !/px$/.test(box.style.height)) box = box.parentElement;
    if (box === root) box = null;
    if (box) {
      const by = outBy(tr, rect(box.getBoundingClientRect()));
      if (by > 1.5) out.push(`text "${short(text)}" overflows its box by ${Math.round(by)}px`);
    }
    const off = outBy(tr, SHEET);
    if (off > 1.5) out.push(`text "${short(text)}" runs ${Math.round(off)}px off the page`);
    if (face && hits(tr, FACE_RECT)) out.push(`text "${short(text)}" overlaps the face box`);
  }
  for (const el of Array.from(root.querySelectorAll<HTMLElement>("[data-box]"))) {
    const r = rect(el.getBoundingClientRect());
    if (face && hits(r, FACE_RECT)) out.push(`a card/frame overlaps the face box`);
    const off = outBy(r, SHEET);
    if (off > 1.5) out.push(`a card/frame runs ${Math.round(off)}px off the page`);
  }
  return Array.from(new Set(out));
}

/** Wraps the frame; reports once per rendered still. `face` = the active scene keeps the face box. */
export const Lint: React.FC<{ face: boolean; children: React.ReactNode }> = ({ face, children }) => {
  const [handle] = useState(() => delayRender("layout lint"));
  const ref = React.useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    // wait for the fonts and until the composition has its real size (it mounts at 0 height first)
    let tries = 0;
    const go = () => {
      const el = ref.current;
      if (el && el.getBoundingClientRect().height < 10 && tries++ < 300) return void requestAnimationFrame(go);
      console.log("LINT " + JSON.stringify(el ? measure(el, face) : []));
      continueRender(handle);
    };
    document.fonts.ready.then(() => requestAnimationFrame(go));
  }, [face, handle]);
  return <div ref={ref} style={{ position: "absolute", inset: 0 }}>{children}</div>;
};
