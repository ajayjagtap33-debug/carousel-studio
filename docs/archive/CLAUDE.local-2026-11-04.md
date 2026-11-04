# Carousel studio

Turns a brief or script into hand-drawn Excalidraw visuals, plus the video pieces that go with them.

| format | what | frame | output | folder |
|---|---|---|---|---|
| `carousel` | LinkedIn carousel | 1080×1350 (4:5) | `slides/NN.png` + `carousel.pdf` | `carousels/` |
| `slides` | PPT-style slides shown in a video | 1600×900, exported 1920×1080 | `slides/NN.png` + `slides.pdf` | `video-slides/` |
| `broll` | overlay stickers for any video | sized to content (transparent) | `slides/NN.png` + `shotlist.md` | `stickers/` |
| talk canvas | a live talk as stations on one zoomable canvas | no frame (one big canvas) | `canvas.excalidraw` + `preview.png` | `talks/` |
| b-roll video | silent 1920×1080 clips for a talking-head cut | 1920×1080 | `broll.mp4` / clips | `videos/` |

The first three are `storyboard.json` `"format"` values rendered by `render.py`. A talk canvas and a b-roll
video have their own scripts (`canvas.py`, `broll.py`) and their own input files — not storyboards.

The `broll` **format key** keeps its name for now even though its folder is `stickers/` — renaming the
key means touching `render.py`, `build.py` and `theme.json`, which waits for the engine merge.
`broll/` is the Remotion app (`package.json`, `src/`, `shoot.mjs`); its projects live in `videos/`.
`specs/` holds written-up module specs. Read the status line at the top of one before building from it —
`composite-video-module.md` is marked superseded.

> Not every script below exists in every checkout. See `HANDOFF.md` for this copy's state.
> **This folder is not a git repo**, so `git pull` / `sync.sh` don't work here. The GitHub repo
> (`ajayjagtap33-debug/carousel-studio`, `main` = `5057d24`, 2026-10-23) has diverged both ways: don't overwrite
> this folder from it. To compare, clone it into a scratch dir (checked 2026-11-04, see `HANDOFF.md`).

## Flow

0. **Format**: if the brief or request doesn't say which, **ask first**: carousel, video slides,
   stickers, a talk canvas or b-roll video? Don't guess from the topic. For the first three, put it in
   `storyboard.json` as `"format"` and the scripts read everything else from that. A talk canvas goes
   through `scripts/canvas.py` (see Talks below), a video through the `broll-video` skill.
1. **Brief**: Ajay drops `<folder>/<date>-<slug>/brief.md` (template: `templates/brief.md`).
2. **Storyboard**: write `storyboard.md` (review sheet) + `storyboard.json` (render input).
   - Carousel: 3–5 cover hooks from `swipe/hooks.md`, each labelled with its pattern and paired with its slide-2 payoff.
   - Pick each slide's visual from `swipe/visual-metaphors.md` (one drawing carries one idea) before
     choosing a `VIS` type. That file is repo-only — this copy's `swipe/` has `hooks.md` and the logos.
   - Video slides / stickers: follow the script's order; one row per slide or dialogue line.
   - Every slide row has a **source** column: brief/script paragraph, or `added`.
   - **Stop here. Ajay approves or edits before anything is rendered.**
3. **Render**: `python3 scripts/render.py <folder>/<date>-<slug>` → `<format>.excalidraw` +
   `render_flags.json` (the slots and warnings the check reads back).
4. **Check + export**: `python3 scripts/build.py <folder>/<date>-<slug> --export`
   - Blocking issues stop the export. Fix the storyboard (split or shorten) rather than shrinking type.
   - Slots (`missing-screenshot`, `missing-logo`) and `warn:` lines don't block, but list them for Ajay.
5. **Look at every PNG** before calling it done. The check can't judge whether a slide reads well.
6. **Animate (carousel, optional)**: `python3 scripts/animate.py carousels/<folder> [--per-slide]`
   → `anim/carousel.mp4` (LinkedIn video post / Reels), and with `--per-slide` `anim/NN.mp4`
   (Instagram carousel video slides). PPT-style builds: chrome first, then headline → qualifier → body
   → visual (cards one by one) → each `art` piece → footer, each fading in, then a slide-left transition.
   The step order follows the field order on the slide; `render.py` tags it. Needs ffmpeg.
   The LinkedIn PDF stays static. Look at the video before calling it done.
7. **Caption** (carousel only): use the `linkedin-post-writer` skill on the approved storyboard.

## Rules (all formats)

- If a PNG comes out in a plain system font, the hand-drawn font didn't load: just re-run the export.
- Carousel: 1080×1350, 90px safe margin. Chrome is only `@theajayjagtap` + `n/N →`. No name, no headshot.
- One idea per slide, and **one thing leads**: a big headline, or a headline + a short line, and then
  the visual. 4:5 is smaller than a slide deck, so plan for less on each slide.
  - Headline max 2 lines if there's body text (3 without). Body max 2 lines, and aim for 1. Max 5 text
    lines in total. The visual keeps ≥ 520px.
  - If the diagram already says it, drop the body line. If it's still too much, split the slide.
  - These limits are in `theme.json` → `density` and block export. Ajay's call on 2026-09-29: slides
    with headline + 3-line body + visual felt crowded.
  - Spacing: headline line-height 1.15, 44px gap before body, body line-height 1.4 in softer grey
    (`theme.json` → `spacing`).
- **Colour: brand green leads.** The accent is always the muted green from ajayjagtap.site
  (`green` #2C6650, shades `d_green` #224F3D, `sage` #7FBDA8, tint `l_green` #CCE5DC). Whenever a slide,
  visual or text line uses a single colour, it is this green (never violet/orange/red on their own).
  Other colours are fine *alongside* green in multi-colour visuals (cards, fan, layers, scatter, art) to
  keep things vibrant and natural. Don't set `"accent"` in a storyboard unless Ajay asks for a different one.
  **The `tmv` and `tmv-study` themes override this** — they are the Track My Visibility brand, not Ajay's.
  The GitHub repo's `theme/theme.json` still ships `accentDefault: violet` and no `sage` / `d_green`; this
  copy's says `green`. If a sync overwrites it, put green back before rendering.
- Text ≥ 36px (labels of ≤3 words ≥ 28px). Video slides: ≥ 26px / 22px in the 1600-wide frame
  (≈31/26px once exported).
- No number or claim that isn't in the brief. Anything written by Claude is marked `added`.
- Images are the exception: use a screenshot/illustration slot only when the slide can't work without it.
  Ajay supplies screenshots (named in the slot, saved in the project folder). Never put text in generated images.
- **Art library** (`scripts/library.py`, preview sheets in `assets/library/preview/slides/`): our own
  recurring cast (`person.*` in 12 poses, `bot.*` = the AI, 5 poses) + 32 doodles here (the repo's copy has
  23 — it lacks `scissors` `toolbox` `tag` `bell` `calendar` `briefcase` `cap` `radar` `net`). Give most
  slides a character; it's what stops them feeling blank. Add new poses/doodles to the library, not one-off
  in a slide. Never copy other creators' characters.
  After changing it: `python3 scripts/library.py` then `python3 scripts/build.py assets/library/preview --export`.
  The `.excalidrawlib` in `assets/library/` loads into excalidraw.com for hand edits (`creative-studio.excalidrawlib`;
  this copy also keeps the older `carousel-studio.excalidrawlib`).
- Brand art (another company's official mascots, e.g. OpenAI's dots in `assets/brand/`) only when Ajay
  supplies it, only on slides about that product, never restyled. Use as art id `img.<pose>` (size =
  height, reads `assets/brand/<pose>.png`). This one is local only: the repo's `library.py` has no `img.`
  branch and no `assets/brand/`.
- Logos only from `assets/logos/<name>.svg|png` (official press kits). A missing logo shows as a flagged
  `?` chip; never fetch one from a random site.
- Visuals come only from the types in `scripts/render.py` (`VIS`). A new type gets added there first,
  not improvised.
- Hooks borrow patterns, never phrasing. Don't copy reference creators' characters.
- Keep the `.excalidraw` next to the PDF so any slide can be hand-edited.

## Video slides (`"format": "slides"`)

Reference: the 16:9 AEO/GEO deck Ajay drew (`video-slides/2026-09-29-aeo-geo-checklist` rebuilds it).
- 1600×900 frame, 80px margin, exported at 1920×1080. Chrome is only a small grey `01` badge top-left
  (`"badge": false` at the top level turns it off). No handle, no counter.
- Two layouts: stacked (default: headline on top, visual below) or `"layout": "split"` (text left,
  visual right, both centred; `"split": 0.45` sets the left column's share).
- Viewers hear the voiceover, so the slide can carry a bit more than a carousel (max 6 text lines), but
  one idea per slide still holds. The voiceover explains; the slide shows.
- Wide visuals work here: `cards` with `"cols": 4`, `fan`, `layers`, `calendar`. Use `"w"` to narrow a visual.
- Big hero numbers go in the headline as their own line: `{"t": "250+", "c": "accent", "size": 200}`.

## Stickers (`"format": "broll"`, folder `stickers/`)

**Overlay stickers** (still images, not video) that the editor lays on top of any video: YouTube 16:9,
reels, anything. There is no fixed frame: each PNG is cropped to its own content, so it comes out wide,
tall or square, with a transparent edge. Exported at 1.5× so they stay sharp when scaled up.
- **1–2 ideas per sticker, max.** A short headline and/or one visual/character. Max 3 text lines, body
  max 1 line. If a line needs more, it's two stickers or it's for a video slide.
- Every sticker has `"line"` (the dialogue it goes with) and `"at"` (timestamp, or `[RECORD]`).
  `render.py` writes `shotlist.md` (file · at · size · line) for the editor.
- Content sits on a white sticker card so it reads over any footage. `"backdrop": false` drops the card
  (use for things that already have their own fill, like a `note`).
- Good sticker types: a big number (`stat`), a short punchy line, a character beat
  (`visual.type: "art"`), a comparison (`cards` with `logo`s, `"cols": 1`), one thing → outcomes (`fan`),
  screenshot proof (`screenshot` + `marks`).
- Only the talking parts get stickers; screen-recording sections don't. Not every line needs one: pick
  the lines where a picture adds something the voice can't.
- `"textW"` narrows the headline wrap width (default 1000) to make a sticker taller and narrower.

## Talks (folder `talks/`)

A live talk laid out as **stations on one canvas** instead of slides: zoom to fit once so the room sees the
shape, then work down one station at a time. Content is `talks/<date>-<slug>/canvas.json`; layout is
`scripts/canvas.py`, which imports `render.py`, so the colours, text and art library are the same ones.

```
python3 scripts/canvas.py talks/<folder>                    # canvas.excalidraw
python3 scripts/canvas.py talks/<folder> --png              # + preview.png of the whole canvas (--scale=)
python3 scripts/canvas.py talks/<folder> --png --only=b2d   # station-b2d.png, as you'd zoom to it
```

- Stations stack down columns (`columns: {a|b|c: {x, y, gap?}}`, top-level `gap`) and sit far enough apart
  that zooming to one puts its neighbours off screen. `links: [[from, to, "dashed"?]]` draws the path;
  arrows re-route themselves, so moving a station is just changing its `at: [x, y]`.
- Station fields: `id`, `col` or `at`, `w` (default 1600), `kicker`, `title` / `titleSize` (hand-underlined),
  `big` / `bigSize` / `c`, `sub`, `blocks`, `blank` / `blankH`, `foot`, `aside: {id, size}` (one doodle
  beside it), `gap`.
- `blocks` types (in `canvas.py`; a new one goes there first, same rule as `VIS`): `ask` (red dashed box
  with a `?` — stop and ask the room), `blank` (grey dashed box, empty on purpose, written in live), `text`,
  `label`, `bars` (a length comparison; `frac`, plus `blank` / `in` for the empty one), `flow` (numbered
  pipeline with arrows), `grid` (2 across), `doors`, `art` (a row of library doodles), `lines`, `gap`.
- **Colour is ink and grey**, with red kept for the live cues — the `ask` boxes and at most one big
  argument. Say it with a shape wherever a shape is shorter than the sentence.
- `run-sheet.md` next to `canvas.json` is the review sheet: how to drive it, what happens at each station,
  what to cut if it runs long. Ajay approves that, not the canvas file.
- Example: `talks/2026-10-23-grow-as-a-marketer/` — 17 stations, ~8900×7400, 25 minutes, one hub and three
  branches. Needs `scripts/canvas.py`, which is repo-only (see `HANDOFF.md`).

## B-roll video (folder `videos/`)

Ajay records and edits in Google Vids; Claude makes only the b-roll: silent 1920×1080 clips timed to his
words, which he lays over his cut. Follow the `broll-video` skill
(`.claude/skills/broll-video/SKILL.md`), one fresh session per video.
- **What goes on screen for each line is settled in the skill's `treatment-rules.md`** (2026-10-22): the
  scene library (Shown / Captured / Told / `hold`), the quotas, the script markup and where the flow stops.
  Read it before writing a beat sheet. Most of it is agreed but **not built** — its own table says which
  parts the renderer really has. Today that's `browser`, `statement`, `flow`, `file`, `pipeline`, `line`,
  `chips`, `rows`, `stats` (`ESCENES` in `broll/src/editorial/scenes.tsx`; a new type goes there first).
- Default to **showing**, not captioning: Told beats (`line` / `card` / `rows` / `chip`) cap at 35%,
  Shown + Captured floor at 45%, no scene type more than 3× in a row, and `hold` (the previous visual
  stays) is meant to be common. The quotas aren't in `check` yet — judge them by eye off the `mix:` line.
- **Two styles, picked with `"style"` at the top of `broll.json`.** `"refluke"` is Ajay's own look
  (see below); `"editorial"` is the Track My Visibility look. The style selects the Remotion
  composition, the validator and the scene library, so everything else below is per style.
- **`"style": "refluke"`** — **local only, not in the GitHub repo** (its `broll/` and `broll.py` have only
  `editorial`; see `HANDOFF.md`). Ajay's own videos. Theme adopted wholesale from the Saraev reference
  (Ajay's call 2026-10-25): warm-white `#FAFCFA` page, olive `#536837` as the one accent, a vivid
  `#2ADD5E` for tick circles only, Playfair Display + DM Sans. 44 scene types in
  `broll/src/refluke/` (`RSCENES`), a static reference frame for each in
  `assets/refluke-broll/preview/`, and the full spec in `assets/refluke-broll/library.md`.
  Each beat takes a `placement` (`tab-right` `half-left` `half-right` `corner` `side-points`
  `band` `full` `pip`) and **the placement must change beat to beat** — `check` blocks on a repeat.
  `pip` is the only mode where the face moves and the content doesn't; it is for screen recordings.
  A captured type (`cited`, `pullquote`, `docs-page`, `gallery-chips`) must carry a `source`.
- Style C "Warm paper × TMV" (`"style": "editorial"` in `broll.json`): Mulish, TMV paper background, and
  **one accent, TMV red** — purple-for-AI and the good/bad greens are dropped from this style, though
  `themes.ts` still carries them. Theme in `broll/src/editorial/themes.ts`, scenes in `scenes.tsx`,
  frame and face geometry in `frame.tsx`.
- `"coverage": "full"` (b-roll throughout) or `"spot"` (a few inserts, face full-frame between).
- **Face side, per scene**: `"face": "left" | "right" | "none"` — which side stays clear for his face
  (a 604×842 portrait zone 58px from the edge; the content column gets the other ~1125px). Default
  `right` in full coverage, `none` in spot. `box` / `hidden` are the old names for `right` / `none`.
  The side rotates at every `##` section, and the plan's `face` column tells Ajay where to sit.
- Commands (`python3 scripts/broll.py <cmd> videos/<folder>`): `transcribe`, `find "phrase"`,
  `snap 0:42 1:15`, `still <t>`, `check` (+ rendered layout lint), `sheet` (one contact sheet per round),
  `render --preview | --clips` (or plain = `broll.mp4`).
- The beat sheet (`broll-plan.md` + `broll.json`) stops for Ajay's approval before rendering. Every row
  carries its `source` line, same rule as the carousels.
- Prefer `--clips`: a stretch with no clip is him alone on camera, which one long file can't give him.
  A fade that dies leaves its `.raw-` file and the command exits naming the clips that didn't come out.
- The older hand-drawn look (face boxed inside our render, `broll.json` without `"style"`) is in the
  skill's `excalidraw.md`.
- A **composite** module that renders the finished video (his cut inside the render, face as an animated
  crop) was specced and dropped on 2026-10-22 — he'd rather keep repositioning his face in Vids. Read
  `specs/composite-video-module.md` only for the layout and motion detail.
- `videos/` is gitignored, so examples live only on the machine that made them.

## Themes

Picked per project with `"theme"` at the top of `storyboard.json`.

- **default** (no `theme` key): hand-drawn, Virgil, white, **brand green accent**. Everything above
  applies as written.
  Add `"format": "landscape"` for a 1920×1080 single image (text left, visual right, headline 84px), or
  `"format": "square"` for a 1080×1080 social creative (quote on top, visual below, headline 70px).
  Landscape slide with `"align": "center"`: headline centred on top, visual centred below (title cards).
  Storyboard-level `"handle": false` drops `@theajayjagtap` (e.g. a video title screen).
- **`"theme": "tmv"`** (Track My Visibility, `theme/tmv.json`, merged over `theme.json`). These override
  the rules above, **including brand green**, for TMV work:
  - **Landscape 1920×1080** by default: text column left (780px, vertically centred), visual right (900px).
    Add `"format": "portrait"` next to `"theme"` for the vertical 1080×1350 version (headline 80px).
  - **Chrome**: `tmv.` wordmark + `n/N →` only. No `@theajayjagtap` handle.
  - **No mascot**: `person.*` / `bot.*` are skipped (with a `warn:`). Doodles are allowed but rarely needed.
  - **Font**: Helvetica Neue (Helvetica in the `.excalidraw`, swapped at export). Licensed: the export uses
    an installed copy or `.otf/.ttf` files in `assets/fonts/` (names containing "HelveticaNeue"); otherwise
    it falls back to TeX Gyre Heros (free clone, in `assets/fonts/`) and prints
    `font: TeX Gyre Heros (stand-in ...)`. Tell Ajay when the stand-in was used.
  - Clean lines (roughness 0), accent `red` (#B80000 on light, auto-swaps to coral #F86659 on dark).
  - Per-slide `"bg"`: `light` (default), `dark`, `purple` (AI / platform / framework slides),
    `hero` / `heroLight` (red→purple gradient). Cover defaults to `hero`, last slide to `heroLight`.
    A `hero` bg on a content slide gets a `warn:`. Text, cards and tints flip automatically on dark
    backgrounds. Don't invent a fifth background.
  - Use `"eyebrow"` (all-caps kicker, e.g. `"Finding 2 of 6"`) instead of `number`. It counts toward the
    5-line limit.
  - Colour names map to the brand: `red`, `coral`, `violet` (#7B3AEC), `orange`/`green`/`blue` = muted
    status colours.
  - Density limits and type minimums are shared with the default theme (headline default 72px).
- **`"theme": "tmv-study"`** (`theme/tmv-study.json` extends `tmv`; layout code `scripts/band.py`): the
  TMV study/report look. 1080×1350: gradient header band (logo + progress bar, pill `kicker`, 2-line
  headline with a yellow accent line), stacked white cards on a light page, black footer (wordmark +
  storyboard `series` + `n/N` + yellow "Swipe →"). Cover/CTA slides (`"layout": "cover" | "cta"`) are
  full gradient.
  - Slides take `blocks` (the cover takes `panel`) instead of `visual`/`art`. Block types live in
    `band.py` → `BLOCKS`: `ask`, `statpair`, `take` (SO WHAT bar), `dotstat`, `statband`, `barcard`,
    `rows`, `browsers`, `pills`, `step`, `banner`, `tiles`, `button`, `promo`. Rich text = string or
    spans `{t, b?, c?, s?}`. A new block goes in `BLOCKS` first.
  - Text is measured from the font file (`scripts/fontmetrics.py`), so wrapping is exact.
    Weight/tracking ride in the fontSize fraction (see `band.py`).
  - **Type floor is 24px (20px for ≤3-word labels)**, set in the theme to keep the v3 design. This is
    below the studio-wide 36/28 rule; Ajay's call to keep or raise (raising means cutting cards).
  - The cover may use a 3-line headline with a sub line (`density.maxHeadlineLinesWithBody: 3`).
  - If cards don't fit, the check says `cards need Xpx, room for Ypx`: cut a card or shorten, don't shrink type.

## storyboard.json slide fields

`role`, `eyebrow`, `bg` (tmv themes), `kicker` / `blocks` / `panel` / `sub` / `layout` (tmv-study),
`headline` (string or list of lines; `{"t": "...", "c": "accent"}` colours a line), `headlineSize`,
`qualifier` (small line with hand-drawn underline), `number` (circle badge), `body`, `footer`, `source`,
`art`: list of `{id, x, y, size, flip?, c?}` in slide coords (library art — a field, not a visual type),
`visual`: `{type: ..., ...}`, optional `w` (width).

**Visual types** (`VIS` in `scripts/render.py`):

| | types |
|---|---|
| shared | `checklist` `scatter` `calendar` `layers` `cards` `logos` `stat` `comment_dm` `note` `bars` |
| hand-drawn side | `fan` `art` `swap` `cut` `scene` `icons` |
| tmv / study side | `chat` `waffle` `split` `link` `pages` `versus` `prompt` |
| slots | `screenshot` `illustration` |

The hand-drawn row is **this copy only**; the repo's `render.py` has the other two rows and no
`slides` / `broll` formats at all. `HANDOFF.md` has the detail — check it before moving a project between
machines.

- `bars`: `{items: [{label, logo?, v: [a, b]}], series: [name, name], unit?}`, paired horizontal bars
  (accent vs grey) with a legend.
- `fan`: `{items: [str | {t, c}], above?, below?, from?: {id} | {logo}}`, one thing with arrows out to
  stacked coloured boxes.
- `scene`: `{items: [{id | logo, x, y, size}], labels?: [{t, x, y, chip?, c?, size?}],
  arrows?: [{from, to, dashed?}], h?}`, characters acting out the idea with props; x/y are 0–1 of the visual box.
- `icons`: `{items: [doodle ids], cols?, tile?, art?: [ids], artSize?}`, cover grid teasing a list,
  characters underneath.
- `art`: `{id, size}`, a library character/doodle as the whole visual.
- `note`: takes `art: {id}` beside it.
- `versus`: two-states scene (bad row, good row), each row = coloured label + steps of library `art` or a
  text `box`, joined by arrows. `"frame": false` drops the dashed boxes; `"columns": true` puts the two
  states side by side (art steps only).
- `prompt`: hand-drawn AI prompt bar (`app` logo, typed `q` + cursor, send button), optional `logos` row below.
- `screenshot` `marks` (0–1 coords of the image): `{type: circle, x, y, w, h}`,
  `{type: underline, x, y, w}`, `{type: arrow, from: [x, y], to: [x, y], label?}`. `h` caps the slot height.
- Chart-style visuals (`chat`, `waffle`, `split`, `bars`, `link`, `pages`): see
  `carousels/2026-09-30-chatgpt-ads-study/storyboard.json` (repo only).

**Top level**: `format`, `theme`, `title`, `accent`, `series` (tmv-study), `badge` (slides),
`handle` (carousel chrome; default `theme.json` → `handle`).
**Per slide**: `layout`/`split` (slides), `line`/`at`/`backdrop`/`textW` (stickers),
`logo`/`logoSize` (any: logo(s) above the headline). Card items take `logo`; cards take `size`.

Examples with every field in use: `carousels/2026-09-29-aeo-geo-checklist`,
`video-slides/2026-09-29-aeo-geo-checklist`, `stickers/2026-09-29-aeo-geo-checklist`
(the last two are test renders of the same script).

In the repo: `carousels/2026-10-05-automate-manual-first` (landscape), `2026-10-16-pick-prompts-to-track`
(a single landscape `prompt` card, `"handle": false`), `2026-10-23-camera-presence-talk` (17 landscape
cards, `"align": "center"` title slides), `2026-10-01-chatgpt-ads-study-tmv-v3` (tmv-study).
