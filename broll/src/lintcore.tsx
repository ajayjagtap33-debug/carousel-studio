// Shared layout-lint core for the b-roll styles (props.lint). After fonts load it measures the
// rendered frame and console.logs `LINT [...]`, which shoot.mjs forwards to scripts/broll.py check.
//
// Markers, set by the kits and with no visual effect:
//   data-box          a card / frame / window — text must stay inside it
//   data-text         a text block measured as one piece (a headline of word spans, not word by word)
//   data-lint=chrome  decorative furniture that is exempt (URL bars, the face guide)
//
// Only the page bounds, the face rect and the type floor differ between styles; everything else
// here is geometry. editorial/lint.tsx and refluke/lint.tsx are thin wrappers that pass those in.
import React, { useLayoutEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";

export type R = { l: number; t: number; r: number; b: number };

export type LintOpts = {
  page: R;           // what counts as "off the page"
  face?: R | null;   // the zone kept clear for his face, if this beat keeps one
  minText?: number;
  minLabel?: number;
  faceName?: string; // what to call it in the message ("face box", "face zone", "face pip")
};

// rects relative to the frame root, in 1920x1080 units (Remotion may offset and scale the composition)
let O = { x: 0, y: 0, k: 1 };
const rect = (d: DOMRect): R => ({
  l: (d.left - O.x) / O.k, t: (d.top - O.y) / O.k, r: (d.right - O.x) / O.k, b: (d.bottom - O.y) / O.k,
});
const hits = (a: R, b: R) => a.l < b.r - 1 && a.r > b.l + 1 && a.t < b.b - 1 && a.b > b.t + 1;
const outBy = (inner: R, outer: R) =>
  Math.max(outer.l - inner.l, outer.t - inner.t, inner.r - outer.r, inner.b - outer.b);
const short = (s: string) => (s.length > 40 ? s.slice(0, 38) + "..." : s);

export function measure(root: HTMLElement, o: LintOpts) {
  const minText = o.minText ?? 24;
  const minLabel = o.minLabel ?? 20;
  const faceName = o.faceName ?? "face box";
  const out: string[] = [];
  const box0 = root.getBoundingClientRect();
  O = { x: box0.left, y: box0.top, k: box0.width / 1920 || 1 };

  for (const el of Array.from(root.querySelectorAll<HTMLElement>("*"))) {
    const group = el.hasAttribute("data-text");
    if (!group && el.parentElement?.closest("[data-text]")) continue;
    const own = Array.from(el.childNodes).filter((n) => n.nodeType === 3 && n.textContent!.trim());
    if ((!group && !own.length) || el.closest("[data-lint=chrome]")) continue;
    const words = (n: Node): string[] =>
      n.nodeType === 3 ? [n.textContent!.trim()] : Array.from(n.childNodes).flatMap(words);
    const text = (group ? words(el) : own.map((n) => n.textContent!.trim())).filter(Boolean).join(" ");
    const range = document.createRange();
    range.selectNodeContents(el);
    const tr = rect(range.getBoundingClientRect());
    // size as seen on screen (includes scale transforms)
    const scale = el.offsetWidth ? el.getBoundingClientRect().width / el.offsetWidth / O.k : 1;
    const px = parseFloat(getComputedStyle(el).fontSize) * scale;
    const n = text.split(" ").length;
    if (px < minText - 0.5 && !(n <= 3 && px >= minLabel - 0.5))
      out.push(`text "${short(text)}" is ${Math.round(px)}px (min ${minText}, ${minLabel} for labels of 3 words or less)`);

    // its box: the nearest card/frame, or a fixed-height row inside one (wrapped text spills over)
    let box: HTMLElement | null = el.parentElement;
    while (box && box !== root && !box.hasAttribute("data-box") && !/px$/.test(box.style.height)) {
      box = box.parentElement;
    }
    if (box === root) box = null;
    if (box) {
      const by = outBy(tr, rect(box.getBoundingClientRect()));
      if (by > 1.5) out.push(`text "${short(text)}" overflows its box by ${Math.round(by)}px`);
    }
    const off = outBy(tr, o.page);
    if (off > 1.5) out.push(`text "${short(text)}" runs ${Math.round(off)}px off the page`);
    if (o.face && hits(tr, o.face)) out.push(`text "${short(text)}" overlaps the ${faceName}`);
  }

  for (const el of Array.from(root.querySelectorAll<HTMLElement>("[data-box]"))) {
    if (el.closest("[data-lint=chrome]")) continue;
    const r = rect(el.getBoundingClientRect());
    if (o.face && hits(r, o.face)) out.push(`a card/frame overlaps the ${faceName}`);
    const off = outBy(r, o.page);
    if (off > 1.5) out.push(`a card/frame runs ${Math.round(off)}px off the page`);
  }
  return Array.from(new Set(out));
}

/** Wraps the frame; reports once per rendered still. */
export const LintShell: React.FC<{ opts: LintOpts; children: React.ReactNode }> = ({ opts, children }) => {
  const [handle] = useState(() => delayRender("layout lint"));
  const ref = React.useRef<HTMLDivElement>(null);
  const key = JSON.stringify(opts);
  useLayoutEffect(() => {
    // wait for the fonts and until the composition has its real size (it mounts at 0 height first)
    let tries = 0;
    const go = () => {
      const el = ref.current;
      if (el && el.getBoundingClientRect().height < 10 && tries++ < 300) return void requestAnimationFrame(go);
      console.log("LINT " + JSON.stringify(el ? measure(el, opts) : []));
      continueRender(handle);
    };
    document.fonts.ready.then(() => requestAnimationFrame(go));
    // opts is compared by value through `key`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, handle]);
  return <div ref={ref} style={{ position: "absolute", inset: 0 }}>{children}</div>;
};
