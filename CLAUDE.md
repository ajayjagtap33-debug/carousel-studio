# Creator studio

Turns a brief or script into hand-drawn Excalidraw visuals, plus the video pieces that go with them: carousels,
video slides, stickers, talk canvases, finished talking-head edits, reels, b-roll. (Was "carousel studio"; the GitHub
repo is still `ajayjagtap33-debug/carousel-studio`.)

| format | what | frame | output | folder |
|---|---|---|---|---|
| `carousel` | LinkedIn carousel | 1080×1350 (4:5) | `slides/NN.png` + `carousel.pdf` | `carousels/` |
| `carousel`, `"theme": "studio"` | same, built from the video scenes (Remotion) | 1080×1350 | `slides/NN.png` + `carousel.pdf` (+ `anim/`) | `carousels/` |
| `slides` | PPT-style slides shown in a video | 1600×900, exported 1920×1080 | `slides/NN.png` + `slides.pdf` | `video-slides/` |
| `broll` (stickers) | overlay stickers for any video | sized to content (transparent) | `slides/NN.png` + `shotlist.md` | `stickers/` |
| talk canvas | a live talk as stations on one zoomable canvas | no frame (one big canvas) | `canvas.excalidraw` + `preview.png` | `talks/` |
| studio video | his talking-head cut with drawn b-roll, finished MP4 (**the default for his videos**) | 1920×1080 | `studio/` renders → final MP4 | `videos/` |
| reel | 9:16 version of the same look | 1080×1920 | reel MP4 | `reel-creator/reels/`, `videos/*/reel/` |
| b-roll clips | silent 1920×1080 clips laid over his cut in Google Vids (older mode) | 1920×1080 | `broll.mp4` / clips | `videos/` |

The first three are `storyboard.json` `"format"` values rendered by `render.py` (the studio-theme carousel goes
through `studio_carousel.py`). A talk canvas, a video and a reel have their own scripts and input files — not storyboards.

The `broll` **format key** keeps its name even though its folder is `stickers/` — renaming the key means touching
`render.py`, `build.py` and `theme.json`. `broll/` is the Remotion app (`package.json`, `src/`, `shoot.mjs`); its
projects live in `videos/`. `specs/` holds written-up module specs; read the status line at the top of one before
building from it (`composite-video-module.md` is superseded).

> **Read `HANDOFF.md` first.** This folder was merged on 2026-11-04 from two diverged copies (the personal Mac copy and
> the company laptop's repo checkout). It is a git checkout of `ajayjagtap33-debug/carousel-studio` on branch
> `broll-treatment-rules`, **ahead of origin (the merge is `6415f9c`), pushed to origin/broll-treatment-rules, not yet merged to `main`**. `HANDOFF.md` says what came
> from where, what is verified, and what is still open.

## This machine

- **Mac**: commands use `python3` (Python 3.9.6). The company laptop was Windows and used `python`. Scripts must stay 3.9-safe
  (`from __future__ import annotations` for `X | None` hints).
- `tools/` is the Mac toolchain: `tools/node/` (Node 24), `tools/ffmpeg/bin/ffmpeg`, `tools/bin/yt-dlp`, `tools/rvm/` (the
  person-matting model). `broll.py` finds them on its own. All of it is git-ignored.
- `broll/node_modules/` is a Mac install (the company's was Windows-built and was not carried over). Restore with
  `cd broll && npm install`. `reel-creator/engine/` has **no** `node_modules` (it is the old reel engine; the live reel
  renderer is `broll/src/reel/`).
- Not installed system-wide, needed only for some scripts: `numpy` + `onnxruntime` (`matte.py`, `studio_sound.py`,
  `promo_music.py`); Pillow is present. `pip3 install numpy onnxruntime` when a video needs them.
- Chrome in `/Applications` is what exports the Excalidraw slides; the renderer loads Excalidraw from unpkg, so be online.

## Flow (carousel, video slides, stickers)

0. **Format**: if the brief or request doesn't say which, **ask first**: carousel, video slides, stickers, a talk
   canvas, a video, a reel? Don't guess from the topic. For the first three, put it in `storyboard.json` as
   `"format"` and the scripts read everything else from that. A talk canvas goes through `scripts/canvas.py`
   (see Talks below), a video through the `broll-video` skill.
1. **Brief**: Ajay drops `<folder>/<date>-<slug>/brief.md` (template: `templates/brief.md`).
2. **Storyboard**: write `storyboard.md` (review sheet) + `storyboard.json` (render input).
   - Carousel: 3–5 cover hooks from `swipe/hooks.md`, each labelled with its pattern and paired with its slide-2 payoff.
   - Pick each slide's visual from `swipe/visual-metaphors.md` (one drawing carries one idea) before choosing a `VIS` type.
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
  Projects rendered before the merge (company copy) used Excalidraw's `#2f9e44` and a few set `"accent"`; re-rendering
  them now gives brand green.
- Text ≥ 36px (labels of ≤3 words ≥ 28px). Video slides: ≥ 26px / 22px in the 1600-wide frame
  (≈31/26px once exported).
- No number or claim that isn't in the brief. Anything written by Claude is marked `added`.
- Images are the exception: use a screenshot/illustration slot only when the slide can't work without it.
  Ajay supplies screenshots (named in the slot, saved in the project folder). Never put text in generated images.
- **Art library** (`scripts/library.py`, preview sheets in `assets/library/preview/slides/`): our own recurring
  cast (`person.*` in 14 poses, `bot.*` = the AI, 5 poses) + 32 doodles (51 items). Give most slides a character;
  it's what stops them feeling blank. Add new poses/doodles to the library, not one-off in a slide. Never copy other
  creators' characters. After changing it: `python3 scripts/library.py`, then
  `python3 scripts/build.py assets/library/preview --export`, then `python3 scripts/cast_export.py` (the video
  scenes draw the same cast through `broll/src/studio/cast.json`).
  `assets/library/creative-studio.excalidrawlib` loads into excalidraw.com for hand edits
  (`carousel-studio.excalidrawlib` is the older name of the same library).
- Brand art (another company's official mascots, e.g. OpenAI's dots in `assets/brand/`) only when Ajay
  supplies it, only on slides about that product, never restyled. Use as art id `img.<pose>` (size =
  height, reads `assets/brand/<pose>.png`).
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
- **Webinar deck, two versions** (`video-slides/2026-10-08-social-seo-webinar/` is v3, 14 slides, with `script.md` and
  `speaker-script.md`; `…-v2-18slides/` is v2). v3's storyboard uses visual types (`search`, `checks`, `paths`,
  `timeline`, `thennow`, `ring`) that **no engine in this folder implements** — its PNGs/PDF/`.excalidraw` are the only
  form it exists in. v2 re-renders (`render.py` + `build.py --export`).

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
- Example: `talks/2026-10-23-grow-as-a-marketer/` — 17 stations, ~8900×7400, 25 minutes, one hub and three branches.

## Videos (folder `videos/`) — talking-head edits

Ajay records and rough-cuts; he hands over the **MP4** and Claude returns the **finished MP4** (his footage, the
b-roll, transitions, music and sound, his audio). Follow the `broll-video` skill (`.claude/skills/broll-video/SKILL.md`),
one fresh session per video. **What goes on screen for each line** is also governed by the skill's
`treatment-rules.md` (scene library, quotas, script markup, where the flow stops); most of it is agreed but not
built — its own table says which parts the renderer really has.

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
- **Don't repeat the pictures** (videos and reels alike, Ajay 2026-10-31). `visuals/catalog.md` maps what a line
  means → scenes we have built and pictures seen in references that aren't built yet. Plan from it, then
  `python3 scripts/scenes.py check <folder>` before the plan goes to Ajay: max 3 of a type per video (more for long
  ones), never the same type twice in a row, `warn:` for types the last 3 videos wore out. After each video,
  `python3 scripts/scenes.py ledger` → `visuals/ledger.md`. A new reference adds its visuals to the catalog under a
  meaning; build new scenes 3–5 at a time, meanings with nothing built first.
- **`visuals/` is the one place for pictures**: `preview/README.md` shows every built scene by meaning
  (`python3 scripts/scenes.py previews <type>` / `gallery`, samples in `samples.json`), `references/README.md`
  indexes every reference with a sheet each (`python3 scripts/references.py`; other creators' frames stay in the
  git-ignored `references/local/`), `catalog.md` + `plan.md` hold what's next, `motion/` is the prompt-motion.com archive
  (index tracked, videos local). Video scenes use the carousel art library's cast through `broll/src/studio/cast.tsx`.
- **First screen of a horizontal video** (Ajay, 2026-11-01): `words` with `place: "open"`: white **Open Sauce Sans
  Medium 120px**, +1px tracking (not tight: letters must not touch), the one accent word in **Instrument Serif
  italic, no background**, in its own colour (coral `#F86659` on `tmv`, light olive `#A7BD82` on `ajay`), a soft
  left fade and a slight shadow. Look-test stills: `videos/2026-10-29-studio-edit/studio/first-screen-options/`.
  **Shadow rule: when the background blends with the text, add a slight shadow in a colour of the right tone**
  (dark for light text, light for dark text). **Overlays** (logos, UI) are only things the script names, with their
  real logo from `assets/logos/`; never our own `tmv.` wordmark. Details in the skill's `studio.md`.
- Full-frame shots are mostly **clean**. When text is needed, `words` defaults to `place: "wall"`: **2–3 of his
  words in dark ink on the clear wall beside him**, highlighter swipe under the one accent word, **no wash, no
  shadow, nothing over his face, hands or body**. `wall: {x, y, w}` is set per scene off real frames — the clear
  column moves with the shot. Logo / stat / ✓✗ chips still beat words. The key line gets a `type` card (2–4s, one
  huge line, one accent); the big card never covers the top-left wordmark.
- **Type**: both themes = **Instrument Serif 400 + Instrument Serif italic accent + Inter** (`tmv` too since
  2026-10-31; it was Mulish + Dancing Script) (+ JetBrains Mono for prompts/URLs). Sentence case. **No all-caps
  eyebrows/kickers or "02 / 10" counters** (Ajay, 2026-10-29: they read as AI). Instrument Serif has one weight, so
  display lines carry at size, not weight: a type card wants 200–240px, not 150.
- The whole `ajay` look is Nick Saraev's CEO-AI video (`videos/reference/2026-10-28-nick-saraev-ceo-ai/`) — layout,
  motion, type **and** colour, minus the all-caps labels. Every element blurs in on its word. Palette sampled off his
  frames, not guessed. (`videos/reference/2026-10-14-nick-saraev-ceo-ai/` is an earlier pass over the same video.)
- **Two versions** from one `studio.json`: `"theme": "tmv"` (TMV red, `tmv.` wordmark) and `"ajay"` (Nick's olive
  #4E6636 on #FAFCFA, #A7BD82 on dark, dark cards #111311, no corner handle). Render both unless he says
  otherwise. His site's forest green (#2C6650 on #FAF9F5) is kept in a comment in `kit.tsx` to switch back.
- **Sound**: `python3 scripts/studio_sound.py <studio.json> <render.mp4> <out.mp4> [--music track.wav]` adds SFX cues
  (from the plan, thinned to 4–8 a minute) and a music bed ducked under his voice, mastered to −14 LUFS / −1 dBTP.
  Rules in the skill's `sound.md`. SFX are synthesized into `assets/sfx/`; the music bed is a synthesized placeholder
  until Ajay picks a source (YouTube Audio Library / Epidemic Commercial / Uppbeat — never Pixabay music). Layout
  whooshes come from the **layout list**, not the scenes, so `"sfx": false` on a scene can't thin them. Measure the
  finished file's loudness; don't report the script's own number. Needs `numpy`.
- Render: `node broll/shoot.mjs job.json` (clips with `muted: false`; a second clip with `props` = the other theme).
  ~4 min to bundle, then ~6 min per minute of video per version at `concurrency: 3`. **Set `concurrency` to 3 in
  the job**: the default `cores − 2` makes the compositor throw `No frame found at position N` on a big cut, which
  looks like file corruption and isn't. Claude can't hear: say so and have Ajay check the mix.
- **The reference edit for his videos: `videos/2026-10-29-studio-edit/`** (Excalidraw, 3:20, `ajay`, end to end).
  `studio/plan-v2.md` is the worked example of all of the above. Read it before planning a new one.
  Also `videos/2026-10-27-chatgpt-ads-study/studio/` (minute 1, both themes).
- **One-off compositions** in `broll/src/` for single projects: `promo/` (SEORankLift homepage promo, 29s, the product's
  own look — `scripts/promo_music.py` writes its music), `outreach/` (SEORankLift outreach video: him full frame,
  punch-ins, drawings behind and in front of the matte), `thumb/` (YouTube thumbnail 1280×720). They are examples, not
  modes: `videos/2026-11-02-seoranklift-homepage-promo/`, `videos/2026-11-03-seoranklift-outreach/`.
- `scripts/matte.py` cuts him out of his own footage (RVM model in `tools/rvm/`; needs `numpy`, `onnxruntime`).

**Reels (9:16)**: the look is set, the workflow isn't yet (being planned, 2026-10-30). Design reference:
`reel-creator/design/README.md` + 29 frames (`frames/`, `sheet.png`): Nick's split panel with Ajay cut out, our
horizontal backdrop/colours/serif, Open Sauce Sans Medium captions on a see-through pill. Renderer:
`broll/src/reel/Reel.tsx`. Nick's 49-reel teardown: `reel-creator/reference/`. The old reel-creator instructions are
archived in `reel-creator/_archive/` and are **not** to be followed; `reel-creator/engine/` is the old engine (its
`reel.py` still points at a Windows `ffmpeg.exe`). Reels pick their pictures from the same `visuals/catalog.md` and pass
the same `scripts/scenes.py check` (on `reel.json`; the ledger reads `reel-creator/reels/*/` and `reels/*/`). Examples:
`videos/2026-11-04-orkas-reel/`, `videos/2026-11-04-anthropic-reel/`, `reel-creator/reels/2026-10-30-aeo-geo-checklist/`.

## Videos — older b-roll modes (still work when he asks for b-roll only)

Silent clips he lays over his cut in Google Vids. Two styles, picked with `"style"` at the top of `broll.json`; the
style selects the Remotion composition, the validator and the scene library. Per beat the sheet stops for Ajay's
approval before rendering (`broll-plan.md` + `broll.json`; every row carries its `source` line).

- **`"style": "editorial"`** — Style C "Warm paper × TMV": Mulish, flat warm paper with a faint grid, **TMV red, one
  accent**, the `tmv.` wordmark on every scene. **The look is the scene canvas that `treatment-rules.md` links to — open
  it before writing a beat sheet.** Theme in `broll/src/editorial/themes.ts`, scenes in `scenes.tsx`: `line`, `chips`,
  `rows`, `stats`, `browser`, `flow`, `file`, `pipeline`, `statement`. Per scene `"face"`: `left` | `right` | `none` —
  which side stays clear for his face (a 604×842 zone 58px from the edge), rotating at each `##` section.
- **`"style": "refluke"`** — Ajay's own look, added 2026-10-25 on the personal copy (theme adopted wholesale from the
  Saraev reference): warm-white `#FAFCFA` page, olive `#536837` as the one accent, `#2ADD5E` for tick circles only,
  Playfair Display + DM Sans. 44 scene types in `broll/src/refluke/` (`RSCENES`), a static reference frame for each in
  `assets/refluke-broll/preview/`, full spec in `assets/refluke-broll/library.md`. Each beat takes a `placement`
  (`tab-right` `half-left` `half-right` `corner` `side-points` `band` `full` `pip`) and **the placement must change beat
  to beat** — `check` blocks on a repeat. `pip` is the only mode where the face moves and the content doesn't (screen
  recordings). A captured type (`cited`, `pullquote`, `docs-page`, `gallery-chips`) must carry a `source`.
  **Overlap with studio mode**: studio's `ajay` theme took the same Saraev reference three days later and became the
  default, so treat `refluke` as the alternate until Ajay decides whether to retire it (open question in `HANDOFF.md`).
- `"coverage": "full"` (b-roll throughout) or `"spot"` (a few inserts, face full-frame between). Even full coverage ships
  as `--clips`: one long file would cover him with a blank sheet where a stretch has no clip.
- Commands (`python3 scripts/broll.py <cmd> videos/<folder>`): `transcribe`, `find "phrase"`, `snap 0:42 1:15`,
  `still <t>`, `check` (+ rendered layout lint), `sheet` (one contact sheet per round), `render --preview | --clips`
  (or plain = `broll.mp4`). Hand over a `cut-sheet.md` too: one clip per face position, each with its drop time and
  which side he sits on. `check` and the contact sheet can't see everything — pull a frame out of the finished mp4.
- Default to **showing**, not captioning: Told beats (`line` / `card` / `rows` / `chip`) cap at 35%, Shown + Captured
  floor at 45%, no scene type more than 3× in a row, `hold` (the previous visual stays) is meant to be common. The quotas
  aren't in `check` yet — judge them by eye off the `mix:` line.
- Product videos (TMV / tool features): Ajay's screen recordings, retimed to the spoken words. Design in the skill's
  `screen-recordings.md`, **not built yet**.
- Older hand-drawn look (face boxed inside our render, `broll.json` without `"style"`): the skill's `excalidraw.md`,
  example `videos/2026-10-19-pipeline-test/`. Other examples: `videos/2026-10-22-mention-vs-citation/` (editorial,
  4 min, 12 clips), `videos/2026-10-19-tmv-knowledge-base-test/` (full), `…-spot-test/` (spot).
  Regression folders for the engine: `videos/_editorial-regression-test/`, `videos/_refluke-check-test/`.
- A **composite** module that renders the finished video was specced and dropped on 2026-10-22; read
  `specs/composite-video-module.md` only for layout and motion detail.
- `videos/` and `raw/` hold recordings and renders (gitignored — they exist only on the machine that made them).

## Themes

Picked per project with `"theme"` at the top of `storyboard.json`.

- **default** (no `theme` key): hand-drawn, Virgil, white, **brand green accent**. Everything above applies as written.
  Add `"format": "landscape"` for a 1920×1080 single image (text left, visual right, headline 84px), or
  `"format": "square"` for a 1080×1080 social creative (quote on top, visual below, headline 70px).
  Landscape slide with `"align": "center"`: headline centred on top, visual centred below (title cards).
  Storyboard-level `"handle": false` drops `@theajayjagtap` (e.g. a video title screen).
  Examples: `carousels/2026-10-05-automate-manual-first/`, `carousels/2026-10-16-pick-prompts-to-track/`.
  **Mixed look** (`scripts/collage.py`, example `carousels/2026-10-31-stay-human-mix/`): a slide's `art` list also takes
  `{"cutout": "cutouts/x.png", ...}` (a real photo with a sticker edge), `{"scene": {...}}` (a clean studio-video scene)
  and `{"mark": ...}` (hand-drawn marks over them). Field detail is the docstring at the top of `collage.py`.
- **`"theme": "studio"`**: carousel built from the video scenes, `python3 scripts/studio_carousel.py carousels/<folder>
  [--anim | --gif]` (Remotion composition `Carousel`; palette `ajay` olive or `tmv` red). Each slide takes a `scene`
  with studio scene fields. Example: `carousels/2026-10-31-chatgpt-ads-study-studio/`.
- **`"theme": "tmv"`** (Track My Visibility, `theme/tmv.json`, merged over `theme.json`; source: TMV brand doc). These
  override the rules above, **including brand green**, for TMV work:
  - **Landscape 1920×1080** by default: text column left (780px, vertically centred), visual right (900px). Add
    `"format": "portrait"` next to `"theme"` for the vertical 1080×1350 version (headline 80px).
  - **Chrome**: `tmv.` wordmark + `n/N →` only. No `@theajayjagtap` handle.
  - **No mascot**: `person.*` / `bot.*` are skipped (with a `warn:`). Doodles are allowed but rarely needed.
  - **Font**: Helvetica Neue (Helvetica in the `.excalidraw`, swapped at export). Licensed: the export uses an installed
    copy or `.otf/.ttf` files in `assets/fonts/` (names containing "HelveticaNeue"; the company copy shipped
    `HelveticaNeue*.woff2` there); otherwise it falls back to TeX Gyre Heros (free clone, in `assets/fonts/`) and prints
    `font: TeX Gyre Heros (stand-in ...)`. Tell Ajay when the stand-in was used.
  - Clean lines (roughness 0), accent `red` (#B80000 on light, auto-swaps to coral #F86659 on dark).
  - Per-slide `"bg"`: `light` (default), `dark`, `purple` (AI / platform / framework slides), `hero` / `heroLight`
    (red→purple gradient). Cover defaults to `hero`, last slide to `heroLight`. A `hero` bg on a content slide gets a
    `warn:`. Text, cards and tints flip automatically on dark backgrounds. Don't invent a fifth background.
  - Use `"eyebrow"` (all-caps kicker, e.g. `"Finding 2 of 6"`) instead of `number`. It counts toward the 5-line limit.
  - Colour names map to the brand: `red`, `coral`, `violet` (#7B3AEC), `orange`/`green`/`blue` = muted status colours.
  - Density limits and type minimums are shared with the default theme (headline default 72px).
  - **Show the proof on every slide** (Ajay, 2026-11-04; full table in `swipe/tmv-proof-visuals.md`): a person → their
    licensed photo, cut out, B&W or gelled into TMV red, credited; a product → its real logo; a study or article → a
    screenshot of the real page with the line highlighted; a launch or any UI → rebuilt in HTML/CSS, answer text never
    invented. Content comes from the TMV content machine sheet (Scripts tab: hook, script, sources). Brand notes:
    `swipe/tmv-site-brand.md`, `swipe/tmv-carousel-styles.md`. New-look tests (three styles, one deck):
    `carousels/2026-11-04-reddit-ai-mode-styles/`.
  - Example: `carousels/2026-09-30-chatgpt-ads-study-tmv/`.
- **`"theme": "tmv-study"`** (`theme/tmv-study.json` extends `tmv`; layout code `scripts/band.py`): the TMV study/report
  look. 1080×1350: gradient header band (logo + progress bar, pill `kicker`, 2-line headline with a yellow accent line),
  stacked white cards on a light page, black footer (wordmark + storyboard `series` + `n/N` + yellow "Swipe →").
  Cover/CTA slides (`"layout": "cover" | "cta"`) are full gradient.
  - Slides take `blocks` (the cover takes `panel`) instead of `visual`/`art`. Block types live in `band.py` → `BLOCKS`:
    `ask`, `statpair`, `take` (SO WHAT bar), `dotstat`, `statband`, `barcard`, `rows`, `browsers`, `pills`, `step`,
    `banner`, `tiles`, `button`, `promo`. Rich text = string or spans `{t, b?, c?, s?}`. A new block goes in `BLOCKS` first.
  - Text is measured from the font file (`scripts/fontmetrics.py`), so wrapping is exact. Weight/tracking ride in the
    fontSize fraction (see `band.py`).
  - **Type floor is 24px (20px for ≤3-word labels)**, set in the theme to keep the v3 design. This is below the
    studio-wide 36/28 rule; Ajay's call to keep or raise (raising means cutting cards).
  - The cover may use a 3-line headline with a sub line (`density.maxHeadlineLinesWithBody: 3`).
  - If cards don't fit, the check says `cards need Xpx, room for Ypx`: cut a card or shorten, don't shrink type.
  - Example: `carousels/2026-10-01-chatgpt-ads-study-tmv-v3/`.

## storyboard.json slide fields

`role`, `eyebrow`, `bg` (tmv themes), `kicker` / `blocks` / `panel` / `sub` / `layout` (tmv-study),
`headline` (string or list of lines; `{"t": "...", "c": "accent"}` colours a line), `headlineSize`,
`qualifier` (small line with hand-drawn underline), `number` (circle badge), `body`, `footer`, `source`,
`art`: list of `{id, x, y, size, flip?, c?}` in slide coords (library art — a field, not a visual type; also
`cutout` / `scene` / `mark` entries, see Themes),
`visual`: `{type: ..., ...}`, optional `w` (width).

**Visual types** (`VIS` in `scripts/render.py`, 23 in all):

| | types |
|---|---|
| shared | `checklist` `scatter` `calendar` `layers` `cards` `logos` `stat` `comment_dm` `note` `bars` |
| hand-drawn side | `fan` `art` `swap` `cut` `scene` `icons` |
| tmv / study side | `chat` `waffle` `split` `link` `pages` `versus` `prompt` |
| slots | `screenshot` `illustration` |

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
  `carousels/2026-09-30-chatgpt-ads-study/storyboard.json`.

**Top level**: `format`, `theme`, `title`, `accent`, `series` (tmv-study), `badge` (slides),
`handle` (carousel chrome; default `theme.json` → `handle`).
**Per slide**: `layout`/`split` (slides), `line`/`at`/`backdrop`/`textW` (stickers),
`logo`/`logoSize` (any: logo(s) above the headline). Card items take `logo`; cards take `size`.

Examples with every field in use: `carousels/2026-09-29-aeo-geo-checklist`,
`video-slides/2026-09-29-aeo-geo-checklist`, `stickers/2026-09-29-aeo-geo-checklist`
(the last two are test renders of the same script). Others: `carousels/2026-10-23-camera-presence-talk` (17 landscape
cards, `"align": "center"` title slides), `carousels/2026-09-30-chatgpt-dots` (`fan` / `art` / `scene`),
`video-slides/2026-10-01-0-interviews-4-offers`.

## Where everything lives

`carousels/` `video-slides/` `stickers/` `talks/` `videos/` — one folder per piece · `scripts/` — the engines ·
`theme/` — theme json · `assets/` — `library/` art, `logos/`, `fonts/`, `brand/` (official mascots), `sfx/`,
`refluke-broll/` · `swipe/` — reference carousels, `hooks.md`, `visual-metaphors.md`, TMV style notes, `logos/` ·
`visuals/` — scene catalog, ledger, previews, reference sheets · `reel-creator/` — reel design, reference teardowns,
reels · `broll/` — the Remotion app · `gradients/` — gradient reference screenshots · `raw/` — raw camera files ·
`specs/` `templates/` `tools/` · `docs/archive/` — the two original `CLAUDE.md` files and the old `HANDOFF.md`, as the audit
trail for this merge.
