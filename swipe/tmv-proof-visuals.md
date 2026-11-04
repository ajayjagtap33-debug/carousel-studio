# TMV carousels: show the proof (Ajay, 2026-11-04)

The brief Ajay would give a designer: don't just put the text on a slide. Go the extra mile and add the visual
that proves it and adds context. That's what makes the carousel look edited by a person, not generated.

## Where the content comes from

The **TMV content machine** sheet (Google Sheet `12qqX96HeeSb_KnSXDdZEjKd1LSaax1odcP7snXCrCAs`), Scripts tab:
`Topic`, `Chosen hook` (+ `Hook options`), `Script`, `Shot list`, `Sources`, `Open questions`, `CTA keyword`.
The carousel uses only the numbers and quotes in `Sources`; anything else Claude writes is marked `added`.
`[CONFIRM]` items in `Open questions` go on the review list for Ajay.

## What each kind of claim gets

| The slide talks about… | Visual | How |
|---|---|---|
| **A person** (a CEO, a Google spokesperson, a researcher) | Their real photo, cut out, **black and white** or **gelled into TMV** (B&W multiplied over a TMV-red shape, or a red duotone) | Licensed photos only: Wikimedia Commons (CC BY / CC BY-SA / public domain), an official press kit, or one Ajay supplies. Credit on the slide ("Photo: name, licence, cut out and recoloured"). Cut out with `python scripts/matte.py still`. Never a generated face. |
| **A product or company** | Its real logo | `assets/logos/` only (official press kits). Missing → ask, don't fetch from a random site. |
| **A study, article, filing or announcement** | A screenshot of the real page with the key line highlighted | Screenshot the source itself (an SEC filing page, the blog post, the tweet), highlight only the sentence the slide quotes. Source line under it. |
| **A launch, a feature, AI search results, any UI** | The UI rebuilt in HTML/CSS (search box, AI Mode tab, source chips, settings panel, stock card) | Never invent the answer text: draw it as grey lines or use the real quoted words. Label it "drawn by TMV" in the source line. |
| **A number** | A picture of that number (ticker card, two bars, counter) | Only numbers from the sheet's sources; chart proportions come from those numbers, never estimated. |
| **The takeaway / what to do** (`added`) | A checklist or a comment card | Kept short; this is where the CTA lives. |

## The rest stays as before

Copy rules are the studio's (`CLAUDE.md`): one idea per slide, one thing leads, headline ≤ 2 lines with a body
line, body ≤ 2 lines (aim for 1), sentence case, no all-caps eyebrows or "02 / 10" counters, every slide has a source.
Hooks from the sheet's `Hook options`, labelled with their pattern.

## The three looks being tested (`carousels/2026-11-04-reddit-ai-mode-styles/`)

1. **Front page** (Rishi's essay carousels): paper / ink / red slides, Anton headlines, Instrument Serif italic
   kicker in red, B&W cut-out on a red circle, series line + date + progress bar at the foot.
2. **Proof desk** (Jayant's Claude × Ootto carousels): grid paper, Instrument Serif headline with a red phrase,
   real proof in white UI cards (browser frame, profile card, stock card), "Reddit × Google" logos in the footer.
3. **Cut & paste** (Your Social Team, sticker-face covers): blush / cream / lilac paper, DM Serif Display with
   highlighter pills, red-duotone cut-outs and logos as white-edged stickers, taped screenshots, Caveat notes,
   round `tmv.` badge.

Font options side by side: `carousels/2026-11-04-reddit-ai-mode-styles/fonts.png`.
References: `swipe/others/tmv/` (36 screenshots).
