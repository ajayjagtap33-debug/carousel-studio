# Carousel studio

Turns a brief into a 4:5 hand-drawn carousel: Excalidraw file + PNGs + LinkedIn PDF.

## Flow

1. **Brief**: Ajay drops `carousels/<date>-<slug>/brief.md` (template: `templates/brief.md`).
2. **Storyboard**: write `storyboard.md` (review sheet) + `storyboard.json` (render input).
   - 3–5 cover hooks from `swipe/hooks.md`, each labelled with its pattern and paired with its slide-2 payoff.
   - Pick each slide's visual from `swipe/visual-metaphors.md` (one drawing carries one idea) before choosing a `VIS` type.
   - Every slide row has a **source** column: brief/script paragraph, or `added`.
   - **Stop here. Ajay approves or edits before anything is rendered.**
3. **Render**: `python scripts/render.py carousels/<folder>`
4. **Check + export**: `python scripts/build.py carousels/<folder> --export`
   - Blocking issues stop the export. Fix the storyboard (split or shorten) rather than shrinking type.
   - Slots (`missing-screenshot`, `missing-logo`) and `warn:` lines don't block, but list them for Ajay.
5. **Look at every PNG** before calling it done. The check can't judge whether a slide reads well.
6. **Animate (optional)**: `python scripts/animate.py carousels/<folder> [--per-slide]` → `anim/carousel.mp4`
   (LinkedIn video post / Reels) and with `--per-slide` `anim/NN.mp4` (Instagram carousel video slides).
   PPT-style builds: chrome first, then headline → qualifier → body → visual (cards one by one) → each `art` piece → footer,
   each fading in, then a slide-left transition. The step order follows the field order on the slide; render.py tags it.
   Needs ffmpeg. The LinkedIn PDF stays static. Look at the video before calling it done.
7. **Caption**: use the `linkedin-post-writer` skill on the approved storyboard.

## Videos (b-roll for talking-head videos)

Ajay records and edits in Google Vids; Claude makes only the b-roll: silent 1920×1080 clips timed to his words,
which he lays over his cut. Follow the `broll-video` skill (`.claude/skills/broll-video/SKILL.md`), one fresh session per video.
- Style C "Warm paper × TMV" (`"style": "editorial"` in broll.json): Mulish, TMV paper background, TMV red in small
  doses, purple only for AI. Theme in `broll/src/editorial/themes.ts`, scene types in `broll/src/editorial/scenes.tsx`.
- `"coverage": "full"` (b-roll throughout, face box kept clear) or `"spot"` (a few inserts, face full-frame between).
- Commands (`python scripts/broll.py <cmd> videos/<folder>`): `transcribe`, `find "phrase"`, `snap 0:42 1:15`,
  `check` (+ rendered layout lint), `sheet` (one contact sheet per round), `render --preview | --clips` (or plain = broll.mp4).
- The beat sheet (`broll-plan.md` + `broll.json`) stops for Ajay's approval before rendering.
- Examples: `videos/2026-10-19-tmv-knowledge-base-test/` (full), `videos/2026-10-19-tmv-knowledge-base-spot-test/` (spot).
  The older hand-drawn look (face boxed inside our render, broll.json without `"style"`): skill's `excalidraw.md`,
  example `videos/2026-10-19-pipeline-test/`.

## Rules

- If a PNG comes out in a plain system font, the hand-drawn font didn't load: just re-run the export.

- 1080×1350, 90px safe margin. Chrome is only `@theajayjagtap` + `n/N →`. No name, no headshot.
- One idea per slide, and **one thing leads**: a big headline, or a headline + a short line, and then the visual. 4:5 is smaller than a slide deck, so plan for less on each slide.
  - Headline max 2 lines if there's body text (3 without). Body max 2 lines, and aim for 1. Max 5 text lines in total. The visual keeps ≥ 520px.
  - If the diagram already says it, drop the body line. If it's still too much, split the slide.
  - These limits are in `theme.json` → `density` and block export. Ajay's call on 2026-09-29: slides with headline + 3-line body + visual felt crowded.
  - Spacing: headline line-height 1.15, 44px gap before body, body line-height 1.4 in softer grey (`theme.json` → `spacing`).
- Text ≥ 36px (labels of ≤3 words ≥ 28px).
- No number or claim that isn't in the brief. Anything written by Claude is marked `added`.
- Images are the exception: use a screenshot/illustration slot only when the slide can't work without it. Ajay supplies screenshots (named in the slot, saved in the carousel folder). Never put text in generated images.
- **Art library** (`scripts/library.py`, preview sheets in `assets/library/preview/slides/`): our own recurring cast
  (`person.*` in 12 poses, `bot.*` = the AI, 5 poses) + 23 doodles. Give most slides a character; it's what stops
  them feeling blank. Add new poses/doodles to the library, not one-off in a slide. Never copy other creators' characters.
  After changing it: `python scripts/library.py` then `python scripts/build.py assets/library/preview --export`.
  `assets/library/creative-studio.excalidrawlib` loads into excalidraw.com for hand edits.
- Logos only from `assets/logos/<name>.svg|png` (official press kits). A missing logo shows as a flagged `?` chip; never fetch one from a random site.
- Visuals come only from the types in `scripts/render.py` (`VIS`). A new type gets added there first, not improvised.
- Hooks borrow patterns, never phrasing. Don't copy reference creators' characters.
- Keep the `.excalidraw` next to the PDF so any slide can be hand-edited.

## Themes

Three looks, picked per carousel with `"theme"` at the top of `storyboard.json`:

- **default** (no `theme` key): hand-drawn, Virgil, white. Everything above applies as written.
  Add `"format": "landscape"` for a 1920×1080 single image (text left, visual right, headline 84px),
  or `"format": "square"` for a 1080×1080 social creative (quote on top, visual below, headline 70px).
  Example: `carousels/2026-10-05-automate-manual-first/`.
  Landscape slide with `"align": "center"`: headline centred on top, visual centred below (title cards).
  Storyboard-level `"handle": false` drops `@theajayjagtap` (e.g. a video title screen). Example: `carousels/2026-10-16-pick-prompts-to-track/`.
- **`"theme": "tmv"`** (Track My Visibility, `theme/tmv.json`, merged over `theme.json`; source: TMV brand doc).
  These override the rules above for TMV carousels:
  - **Landscape 1920×1080** by default: text column on the left (780px, vertically centred), visual on the right (900px).
    Add `"format": "portrait"` next to `"theme"` for the vertical 1080×1350 version (same layout as the default theme, headline 80px).
  - **Chrome**: `tmv.` wordmark + `n/N →` only. No `@theajayjagtap` handle (it's the brand's carousel).
  - **No mascot**: `person.*` / `bot.*` are skipped (with a `warn:`). Doodles are allowed but rarely needed.
  - **Font**: Helvetica Neue (Helvetica in the `.excalidraw`, swapped at export). It's a licensed font: the export uses
    an installed copy or `.otf/.ttf` files in `assets/fonts/` (file names containing "HelveticaNeue"); otherwise it
    falls back to TeX Gyre Heros (free Helvetica clone, in `assets/fonts/`) and prints `font: TeX Gyre Heros (stand-in ...)`.
    Tell Ajay when the stand-in was used.
  - Clean lines (roughness 0), accent `red` (#B80000 on light, auto-swaps to coral #F86659 on dark).
  - Per-slide `"bg"`: `light` (default), `dark`, `purple` (AI / platform / framework slides), `hero` / `heroLight`
    (red→purple gradient). The cover defaults to `hero` and the last slide to `heroLight`. A `hero` bg on a content slide gets a `warn:` in the check.
    Text, cards and tints flip automatically on dark backgrounds. Don't invent a fifth background.
  - Use `"eyebrow"` (all-caps kicker, e.g. `"Finding 2 of 6"`) instead of `number`. It counts toward the 5-line limit.
  - Colour names in visuals map to the brand: `red`, `coral`, `violet` (#7B3AEC), `orange`/`green`/`blue` = muted status colours.
  - Density limits, type minimums and all content rules are shared with the default theme (headline default 72px).
  - Example: `carousels/2026-09-30-chatgpt-ads-study-tmv/`.
- **`"theme": "tmv-study"`** (`theme/tmv-study.json` extends `tmv`; layout code `scripts/band.py`): the TMV study/report
  look, recreated from Ajay's `tmv-chatgpt-ads-carousel-v3.html`. 1080×1350: gradient header band (logo + progress bar,
  pill `kicker`, 2-line headline with a yellow accent line), stacked white cards on a light page, black footer
  (wordmark + storyboard `series` + `n/N` + yellow "Swipe →"). Cover/CTA slides (`"layout": "cover" | "cta"`) are full gradient.
  - Slides take `blocks` (the cover takes `panel`) instead of `visual`/`art`. Block types live in `band.py` → `BLOCKS`:
    `ask`, `statpair`, `take` (SO WHAT bar), `dotstat`, `statband`, `barcard`, `rows`, `browsers`, `pills`, `step`,
    `banner`, `tiles`, `button`, `promo`. Rich text = string or spans `{t, b?, c?, s?}`. A new block goes in `BLOCKS` first.
  - Text is measured from the font file, so wrapping is exact. Weight/tracking ride in the fontSize fraction (see band.py).
  - **Type floor is 24px (20px for ≤3-word labels)**, set in the theme to keep the v3 design. This is below the
    studio-wide 36/28 rule; Ajay's call to keep or raise (raising means cutting cards).
  - The cover may use a 3-line headline with a sub line (`density.maxHeadlineLinesWithBody: 3` in this theme).
  - If cards don't fit, the check says `cards need Xpx, room for Ypx`: cut a card or shorten, don't shrink type.
  - Example: `carousels/2026-10-01-chatgpt-ads-study-tmv-v3/`.

## storyboard.json slide fields

`role`, `eyebrow`, `bg` (tmv themes), `kicker` / `blocks` / `panel` / `sub` / `layout` (tmv-study), `headline` (string or list of lines; `{"t": "...", "c": "accent"}` colours a line), `headlineSize`,
`qualifier` (small line with hand-drawn underline), `number` (circle badge), `body`, `footer`, `source`,
`art`: list of `{id, x, y, size, flip?, c?}` in slide coords (library art),
`visual`: `{type: note (+ `art: {id}` beside it) | checklist | scatter | calendar | layers | cards | logos | stat | comment_dm | chat | waffle | split | bars | link | pages | versus | prompt | screenshot | illustration, ...}`.
`prompt`: hand-drawn AI prompt bar (`app` logo, typed `q` + cursor, send button), optional `logos` row below.
`versus`: two-states scene (bad row, good row), each row = coloured label + steps of library `art` or a text `box`, joined by arrows. `"frame": false` drops the dashed boxes; `"columns": true` puts the two states side by side (art steps only).
Chart-style visuals (`chat`, `waffle`, `split`, `bars`, `link`, `pages`): see `carousels/2026-09-30-chatgpt-ads-study/storyboard.json`.
See `carousels/2026-09-29-aeo-geo-checklist/storyboard.json` for every field in use.
