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

## Videos (talking-head edits)

Ajay records and rough-cuts; he hands over the **MP4** and Claude returns the **finished MP4** (his footage, the
b-roll, transitions, music and sound, his audio). Follow the `broll-video` skill (`.claude/skills/broll-video/SKILL.md`),
one fresh session per video.

**Studio mode is the default (since 2026-10-28)** — `.claude/skills/broll-video/studio.md`, code in `broll/src/studio/`:
- His cut is composited into the render. Per beat he sits `full` frame, as a small `tile-left|right`, or as a big
  `split-left|right` card, moving on the first word of a sentence. **Always open on him speaking**; a full-frame
  breather every 30–60s; never the same layout twice in a row; splices go at a layout change.
- **Draw the beat, don't caption it** (Ajay, 2026-10-29 — the standing rule for his videos). Every beat is one of:
  a **real screenshot** of his own work (`shot` / `gallery`, first choice whenever the artefact exists), a **drawn
  visual** (`marks` strokes that draw themselves on · `compare` rigid-vs-open panels · `loop` panels joined by
  arrows), **icon + one-word cards** (`trio`), a full-screen `type` card, or a `count`. **Never `points` or
  `list`** — a headline over rows of sentences is a caption in a box. Reference edit:
  `videos/2026-10-29-studio-edit/studio/plan-v2.md` (3:20, 30 beats, neither type used once).
- Full-frame shots are mostly **clean**. When text is needed, `words` defaults to `place: "wall"`: **2–3 of his
  words in dark ink on the clear wall beside him**, highlighter swipe under the one accent word, **no wash, no
  shadow, nothing over his face, hands or body**. Dark on a light wall needs no shadow, so the shadow is gone
  rather than reduced. `wall: {x, y, w}` is set per scene off real frames — the clear column moves with the shot.
  Logo / stat / ✓✗ chips still beat words. The key line gets a `type` card (2–4s, one huge line, one accent);
  the big card never covers the top-left wordmark.
- **Type**: `tmv` = Mulish + Dancing Script (cursive) for one accent word; `ajay` = **Instrument Serif 400 +
  Instrument Serif italic accent + Inter** (+ JetBrains Mono for prompts/URLs). Sentence case. **No all-caps
  eyebrows/kickers or "02 / 10" counters** — Nick leans on small grey all-caps labels, we don't (Ajay, 2026-10-29:
  they read as AI). Instrument Serif has one weight, so display lines carry at size, not weight: a type card
  wants 200–240px, not 150. Built 2026-10-29 in `broll/src/studio/kit.tsx` + `scenes.tsx`.
- The whole `ajay` look is Nick Saraev's CEO-AI video (`videos/reference/2026-10-28-nick-saraev-ceo-ai/`) —
  layout, motion, type **and** colour, minus the all-caps labels (Ajay's call, 2026-10-29). Every element blurs
  in on its word. Palette sampled off his frames, not guessed.
- **Two versions** from one `studio.json`: `"theme": "tmv"` (TMV red, `tmv.` wordmark) and `"ajay"` (Nick's olive
  #4E6636 on #FAFCFA, #A7BD82 on dark, dark cards #111311, no corner handle). Render both unless he says
  otherwise. His site's forest green (#2C6650 on #FAF9F5) is kept in a comment in `kit.tsx` to switch back.
- **Sound**: `python scripts/studio_sound.py <studio.json> <render.mp4> <out.mp4> [--music track.wav]` adds SFX cues
  (from the plan, thinned to 4–8 a minute) and a music bed ducked under his voice, mastered to −14 LUFS / −1 dBTP.
  Rules in the skill's `sound.md`. SFX are synthesized into `assets/sfx/`; the music bed is a synthesized
  placeholder until Ajay picks a source (YouTube Audio Library / Epidemic Commercial / Uppbeat — never Pixabay music).
  Layout whooshes come from the **layout list**, not the scenes, so `"sfx": false` on a scene can't thin them —
  to come down a cue, mute a group's pop or change the layout. Measure the finished file's loudness; don't report
  the script's own number.
- Render: `node broll/shoot.mjs job.json` (clips with `muted: false`; a second clip with `props` = the other theme).
  ~4 min to bundle, then ~6 min per minute of video per version at `concurrency: 3`. **Set `concurrency` to 3 in
  the job**: the default `cores − 2` makes the compositor throw `No frame found at position N` on a big cut, which
  looks like file corruption and isn't. Claude can't hear: say so and have Ajay check the mix.
- **The reference edit for his videos: `videos/2026-10-29-studio-edit/`** (Excalidraw, 3:20, `ajay`, end to end).
  `studio/plan-v2.md` is the worked example of all of the above — the beat table, what changed after the stills
  pass and why, and the screenshot decisions. Read it before planning a new one.
  Also `videos/2026-10-27-chatgpt-ads-study/studio/` (minute 1, both themes).

The older modes below (silent clips he lays over his cut in Google Vids) still work when he asks for b-roll only:
- Style C "Warm paper × TMV" (`"style": "editorial"` in broll.json): Mulish, flat warm paper with a faint grid,
  TMV red in small doses, the `tmv.` wordmark on every scene. **The look is the scene canvas that
  `treatment-rules.md` links to — open it before writing a beat sheet.** Theme in `broll/src/editorial/themes.ts`,
  scene types in `scenes.tsx`: `line`, `chips`, `rows`, `stats`, `browser`, `flow`, `file`, `pipeline`, `statement`.
- `"coverage": "full"` (b-roll throughout) or `"spot"` (a few inserts). Per scene `"face"`: `left` | `right` |
  `none` — which side stays clear for his face, rotating by beat. A stretch with **no** clip is him alone on
  camera, so even full coverage ships as `--clips`: one long file would cover him with a blank sheet.
- Commands (`python scripts/broll.py <cmd> videos/<folder>`): `transcribe`, `find "phrase"`, `snap 0:42 1:15`,
  `still 1:23`, `check` (+ rendered layout lint), `sheet` (one contact sheet per round),
  `render --preview | --clips` (or plain = broll.mp4).
- The beat sheet (`broll-plan.md` + `broll.json`) stops for Ajay's approval before rendering. Hand over a
  `cut-sheet.md` too: one clip per face position, each with its drop time and which side he sits on.
- `check` and the contact sheet can't see everything — pull a frame out of the finished mp4 before calling it done.
- Product videos (TMV / tool features): Ajay's screen recordings, retimed to the spoken words, plus a clip library.
  Design in the skill's `screen-recordings.md`, **not built yet** (build when a video needs it).
- Examples: `videos/2026-10-22-mention-vs-citation/` (the current look, 4 min, 12 clips),
  `videos/2026-10-19-tmv-knowledge-base-test/` (full), `videos/2026-10-19-tmv-knowledge-base-spot-test/` (spot).
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
