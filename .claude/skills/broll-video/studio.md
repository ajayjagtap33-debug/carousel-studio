# Studio mode: the finished video (default since 2026-10-28)

Ajay hands over his MP4; we composite him into the render and return the **final video with his audio**. No clips,
no cut sheet, no placing himself in Vids. Agreed 2026-10-28 after the teardown of Nick Saraev's
"How to Use AI Like A Top 0.1% CEO" (`videos/reference/2026-10-28-nick-saraev-ceo-ai/teardown.md`).
First test: `videos/2026-10-27-chatgpt-ads-study/studio/` (minute 1).

Code: `broll/src/studio/` — `Studio.tsx` (layout engine), `scenes.tsx` (`SCENES`), `kit.tsx` (look + entrances).
Layout, motion, type **and** colour all come from Nick's video (Ajay, 2026-10-29) — with two carve-outs that
stay ours: **no small grey all-caps labels** (kickers, eyebrows, "02 / 10" counters: they read as AI) and
**no dark wash behind full-frame text**.
**Built 2026-10-29:** `kit.tsx` loads the per-theme families and exposes `Display` / `Accent` / `Label` (no
all-caps `Kicker`); `words` places itself off `face` with no wash; the `type` card is in `scenes.tsx`.
Two themes, same layout (`"theme"` in studio.json, palettes in `kit.tsx` → `THEMES`): **`tmv`** (TMV red, `tmv.`
wordmark, Mulish + Dancing Script) and **`ajay`** (Nick's olive #4E6636 on #FAFCFA, #A7BD82 on dark, dark cards
#111311, Instrument Serif + Inter, no corner handle). The olive, page, border and dark were **sampled off
`videos/reference/2026-10-28-nick-saraev-ceo-ai/frames`**, not guessed; his site's forest green is kept in a
comment in `kit.tsx` to switch back. Render both
from one bundle with a second clip carrying `props: {...plan, theme: "ajay"}`.

## Workflow for a video

1. Job folder `videos/<date>-<slug>/`, his MP4 copied in as `cut.mp4`; `python scripts/broll.py transcribe`.
   Rough cuts repeat themselves: propose the splice list first, approve, cut, re-transcribe (SKILL.md, memory).
   **If his cut is 4K, transcode it to 1080p first** (`-vf scale=1920:1080 -crf 17`) and point `video` at that:
   the composition is 1920x1080, so nothing is lost, and decoding 4K makes every frame several times slower
   (2026-10-29: 1.25 GB -> 216 MB). Keep the bundle's `publicDir` to that 1080p cut plus the shots — `shoot.mjs`
   copies the whole public dir on every bundle, so the original must not sit in it.
2. Find his face: pull a few frames (`broll.py still`) and set `face: {x, y}` (centre, 0..1) — tiles, cards and
   the full-frame text positions all key off it.
3. Write `studio/studio.json` (layouts + scenes, every `at` from `broll.py find`) and `studio/plan.md` (one row
   per beat: time, his position, scene, elements on their words, source; list what you added). Pick each beat's
   picture from `visuals/catalog.md` by what the line means, then run `python scripts/scenes.py check videos/<folder>`
   and clear its blocking lines (too many of one type, the same type twice in a row) before showing the plan; put its
   `warn:` lines (types worn out by the last videos) in the plan for Ajay. **Stop for approval.**
4. Stills at the key moments and mid-transition (job with `stills`), tiled into one sheet
   (`python scripts/_sheet.py <stills dir> <out.png> [cols]`); fix collisions (text over his face, the card over
   the wordmark, garbled characters — read the json as UTF-8). The sheet's downscale hides as much as it shows:
   open the single full-size still before believing a line is clipped or an element missing. Screenshots are the
   other thing to judge here — a shot whose text matters (a list, a doc) has to be cropped to that text and given
   a tile-width box, not a split-width one; a shot that is only evidence (a roadmap at 40% zoom) can stay whole
   with a ring and chips doing the work.
   Screenshot discipline, learned the hard way on the Excalidraw video:
   - **Crop every screenshot to its content.** A whole app window at 40% zoom reads as "some app" and nothing else.
     Where only the tool's identity matters, the **toolbar alone** is more recognisable than the whole window.
   - **Don't spend a later beat early.** A screenshot that is the subject of a beat 90s away must not appear now.
   - **Never label a shot as something it isn't.** The first pass captioned Ajay's own canvas "His whiteboard"
     under the Nick Saraev beat. Where the evidence doesn't exist, draw the idea (`marks`) rather than borrow.
   - **Gallery cells want similar, squarish aspects.** Wide crops make a thin band of unreadable strips in a tall
     frame; crop each to roughly 1.3–1.8 so the row fills the board.
   - **Aim a `ring` at the file, don't guess it.** Open the cropped image, measure the target as a fraction of it,
     then write `ring: {x, y, w, h}`.
5. Render both themes from one bundle (`clips` with `muted: false`, the second with `props.theme = "ajay"`) into
   `studio/render/`, then `scripts/studio_sound.py` each into `studio/<name>-tmv.mp4` / `-ajay.mp4`.
6. Pull frames out of the finished MP4s and check loudness (−14 LUFS). Hand over both files, the cue sheet, what you
   added, and say plainly that the mix needs his ears.
7. `python scripts/scenes.py ledger` (updates `visuals/ledger.md`), and copy any stock-card beat that wanted a real
   picture into `visuals/catalog.md` → Backlog.

## Layouts (`layouts: [{start, mode}]`, each holds until the next)

| mode | him | the board gets | use for |
|---|---|---|---|
| `full` | full frame, slow 100→105% punch-in | short `words` beside his head, or nothing | cold open, section starts, breathers |
| `tile-right` / `tile-left` | 250×360 card on that edge | ~1500px | most b-roll |
| `split-right` / `split-left` | 780×960 card on that side | ~990px | a figure or mock he's talking you through |

- **Always open on `full`.** Change layout on the first word of a sentence; it starts 0.15s early and takes 0.55s.
- Rotate: never the same mode twice in a row; a `full` stretch every 30–60s; first 30s changes every 3–8s.
- Same-side changes glide; crossing sides dips out and back in. Splices in his cut go at a layout change.

## Scenes (`scenes: [{type, start, end, slug, source, ...}]`, all times = seconds in the cut)

**The rule for his videos (Ajay, 2026-10-29): draw the beat, don't caption it.** Every beat is a real screenshot,
a drawn visual, one-word cards, a type card or a number. **Do not use `points` or `list`** — a headline over rows
of sentences is a caption in a box, which is the thing he keeps asking us to stop doing. They stay in `SCENES` for
the TMV study look; the Excalidraw video (3:20, 30 beats) uses neither.

In rough order of preference:

| type | what's on screen |
|---|---|
| `shot` | one of **his real screenshots** + a plain source line, an optional `ring`, and pills. First choice whenever the artefact exists |
| `gallery` | several screenshots landing one by one; `cols`, optional `title` / `cap` |
| `marks` | a blank board filling with Excalidraw-style strokes that **draw themselves on**, one per word (`marks: [{kind, x, y, s, at, c}]`; kinds in `STROKES`) |
| `compare` | two panels: a rigid greyed one against an open accent one (`left` / `right`, each `{at, tone, mock, label}`; mocks in `Mock`) |
| `loop` | 2–4 panels joined by drawn arrows, each a small mock and one word (`panels`, `arrowAt`) |
| `trio` | 2–4 cards side by side, **icon + one word each**, `tone` `accent` or `muted`. Takes `w` — without it a three-card row crowds the face tile |
| `type` | full-screen type card, rules below |
| `count` | one number counting up |
| `words` | 2–3 words on the wall beside him, rules below |
| `spine` / `places` / `chat` | the outline card, place cards, a ChatGPT exchange |
| `points` / `list` | **not for his videos** — see above |

A scene draws in the box of the layout it starts in. Content rules from SKILL.md apply.

### A picture per idea (Ajay, 2026-10-30)

The first plan for Nested Sequence 02 filled 35 beats from the table above (`trio` ×13) and Ajay said it "looks exactly
like the previous video". **Start from what the line means, then pick or build the type** — Nick's recent videos give
almost every sentence its own picture (teardown: `videos/reference/2026-10-30-nick-saraev-recent/teardown.md`). Use
any one type at most 3 times a video (`scenes.py check` enforces it; `words` scales with length). Meanings → scenes,
including the ones not built yet: `visuals/catalog.md`. Built for that video, in `broll/src/studio/scenes-idea.tsx`:

| type | the picture | key fields |
|---|---|---|
| `flap` | split-flap departures board; one per video for the section titles and recap (caps OK, Ajay 2026-10-30) | `steps[{at, lines}]`, `cols`, `rows` |
| `callouts` | white labels with drawn leader lines to things in his own shot (face, mic, the room). Over the footage | `items[{text, at, label{x,y}, target{x,y} or [[t,x,y]…], wave?}]`, `zoom` (the punch-in in force) |
| `calendar` | a month page: post slots fill (`posts`), crossed out (`strikeAt`), a day circled + note (`mark`), then it shrinks into a decade grid (`zoomAt`) | `year`, `month`, … |
| `ad` | YouTube ad chrome on his footage (Ad 0:0x, Visit site, Skip, yellow line) | `at` |
| `journal` | a notebook writing itself in wordless scrawl; `recAt` viewfinder + REC, `old` yellowed, `marks` highlight lines, `warmAt` nostalgia grain | |
| `odometer` | a number rolling `from` → `to` like drums | `at`, `dur` |
| `phone` | iPhone: `mode: rec` (camera → Published), `call` (incoming, `name`), `feed` (reels flicking, `srcs`) | |
| `radar` | skills on axes; the shape grows per word | `axes[{label, at}]` |
| `receipt` | a till slip printing a line per item | `items`, `total` |
| `morph` | a lumpy grey form turning into a clean shape (v1 → v14), optional YouTube scrub bar | `morphAt`, `barAt` |
| `resume` | a paper CV, one real line highlighted, a drawn note toward his card | `line`, `note`, `toward` |
| `lengths` | bars to scale; `run` grows off the board | `rows[{label, at, w, run?}]` |
| `shelf` | video spines onto a shelf (real titles), `years` ticking, `bubblesAt` = a conversation fading beside it | |
| `search` | one query in several places (YouTube / Google / ChatGPT), each turning up his video | `panels`, `query`, `thumb` |

Metaphor scenes (2026-10-31, the meanings that had nothing built; previews in `visuals/preview/`). Each draws in a
fixed viewBox scaled to the box, so it fits tile, split and reel; in a reel, raise `stage.scale` if the chips read small.

| type | the picture | key fields |
|---|---|---|
| `fork` | a dot splitting into 2–3 paths, a verb on each, a ✗ or a dot at the end | `from{text,at}`, `paths[{label, end, at, tone: accent\|muted}]` |
| `funnel` | chips drop in, `filter` written on it, one goes through as `out`, the rest slide off grey. `jam: true` = a bottleneck: dots queue at the neck, one through every `rate` s | `items[{text?, at}]`, `pass`, `filter`, `out` · jam: `dropAt`, `every`, `rate`, `n`, `waiting: "{n} waiting"` |
| `iceberg` | the tip above the waterline, the mass below; the water clears as the first label lands | `tip{text,at}`, `below[{text,at}]` (last one in the accent italic) |
| `stairs` | 3–5 blocks rising on their words, a dot hopping up to the newest (filled accent), a drawn note over the top | `steps[{label,at}]`, `note{text,at}` |
| `bridge` | two cliffs named, the deck building across with the connector's name under it | `from`, `to`, `span` (each `{text, at}`) |
| `scale` | chips landing on two pans; the beam tips toward the heavier side | `left`/`right[{text, at, w?}]`, `leftLabel`, `rightLabel`, `leftTone`/`rightTone` |

Explainer scenes (2026-10-31, `broll/src/studio/scenes-explain.tsx`, batch 1 of `visuals/plan.md`). Placeholder text is
grey bars; every real word comes from the fields. `pipeline` and `acronym` stack vertically in a box under 1100
wide (split, reel); `vertical` forces either way.

| type | the picture | key fields |
|---|---|---|
| `article` | a web page with one line highlighted; on `pullAt` it slides left, dims, and the line becomes a quote card. With `src` (a real screenshot) the highlighter is a box on the image | `site`, `title`, `line`, `at`, `pullAt` · or `src` + `hl{x,y,w,h}` |
| `sources` | logo / icon tiles landing in a row, then wiring into one hub card that turns dark | `items[{name, logo?, icon?, at}]`, `hub{text, icon?, at}` |
| `pipeline` | 2–5 icon tiles joined by arrows, a mono label riding each arrow, the newest tile dark; `runAt` sends a dot along | `nodes[{label, icon?, logo?, at, edge?}]`, `runAt`, `note{text, at}` |
| `acronym` | one card per letter, the initial big in the accent; each opens out to its word on cue | `words[{word, at}]` |
| `recency` | dated page cards; bars grow over them, tallest for the freshest, which gets lit | `cards[{date, at, w?}]`, `barsAt`, `note{text, at}` |

Callouts that point at him need his position **every ~0.2–0.4s** when he moves (read off gridded frames); 0.8s
keyframes missed by a head-width on Nested Sequence 02. Reference job: `videos/2026-10-30-nested-sequence-02/studio/`
(`build2.py` writes studio.json from phrases).

## Type (Ajay, 2026-10-29)

| theme | main (pops, type cards, board headlines) | plain words | accent (one word per line) |
|---|---|---|---|
| `tmv` | **Mulish** 700–800 | Mulish 500 | **Dancing Script** 700 (cursive) |
| `ajay` | **Instrument Serif** 400 (Nick's display face) | **Inter** 500: chip labels, source lines, small connective words | **Instrument Serif italic** |

- `ajay` only: **JetBrains Mono** for typed prompts, URLs and code, nothing else.
- Instrument Serif ships in **one weight**, so `ajay` headlines carry by size, not boldness. A line that looks
  thin is almost always too small: a type card wants 200–240px, not 150.
- Sentence case, headlines tracked slightly tight (−1 to −2%). **No all-caps eyebrows/kickers, no "02 / 10"
  counters, no tracked "SOURCE ·" labels** anywhere in studio mode: a count is a big numeral inside the card, a
  source is a plain small line. (UI mocks may keep what the real UI shows, e.g. ChatGPT's "Sponsored".)
- The cursive / serif-italic accent is for **one word**, at ≥ 64px; never a whole line, never small text.
- Sizes at 1920×1080: full-frame words 64–90px, type-card line 140–220px, chip labels ≥ 40px, nothing under 32px.
- All fonts via `@remotion/google-fonts` (free). Hierarchy by size and weight, max 3 weights per theme.

## Full-frame text (when he's `full`) — Ajay, 2026-10-29

Reference: aayusucks, "Typography Without Bullsh*t" (`videos/reference/2026-10-29-aayusucks-typography/teardown.md`).
Its face shots are almost all clean; the typography lives on cut-away type cards.

- **Default is clean.** Most full-frame stretches get no text. Use `words` for the hook and the punchlines only.
- **`place: "wall"` is the default** (2026-10-29): **dark ink on the clear wall beside him**, with a highlighter
  swipe (`accentTint`) drawn under the one accent word. **No wash, no panel, no drop shadow, and nothing over his
  face, hands or body.** Dark ink on a light wall needs no shadow at all — which is what finally settled the
  shadow he kept seeing. White-on-footage always needs one, so it can only ever be tuned down, never removed.
- **2–3 words a line, stacked**, one or two words per line in a narrow column. Four words on a line runs into his
  shoulder. 60–72px. Seven captions in a 3:20 video is the right order of magnitude.
- **`wall: {x, y, w}` is per scene**, in frame fractions, because the clear area moves with the shot. Measure it:
  pull three frames from across the cut (`broll.py still`) and find the column that is empty in all of them.
- The older white-on-footage placements (`split` / `chest` / `left`) still exist for a shot with no clear wall.
- One accent word per line. No kicker lines.
- **Show, don't type**: when he names a tool, a logo chip (`assets/logos/`); a number, a stat chip (big numeral +
  ≤ 2-word label in the plain font); a yes/no, a ✓/✗ chip. Small elements from the b-roll kit beat words. Max 2
  overlays on screen at once; they leave together at the sentence end.

### `type` card

The line that matters most gets a hard cut from his face to a full-screen card for 2–4s: off-white page, one huge
line in the main font (black, tight tracking, may crop at the frame edge), **one** accent — a highlighter block behind
the line, a thick accent underline, or one word in the accent font. Enters with horizontal motion blur or blur → sharp.
Use instead of putting a long line over his face; counts as a layout change for the rotation rules.

## Ajay's notes on the first test (2026-10-28)

- The big card (`split-*`) must never cover the `tmv.` wordmark: it starts at y 116, below the wordmark row.
- (Superseded 2026-10-29: the dark keyword wash. See "Full-frame text".)
- Sound design: `sound.md` here (built; music is a synthesized placeholder until he picks a source).
- Two versions every time: Track My Visibility (`tmv`) and Ajay (`ajay`, Nick's olive — see above).

## Render

`node broll/shoot.mjs job.json` with `{comp: "Studio", props: <studio.json>, publicDir: <job folder>,
stills: [...], clips: [{from, to, out, muted: false}]}`. Not wired into `broll.py` yet. About 4 min to bundle
(the job folder is copied), then the frames. Read studio.json as UTF-8.

- **`concurrency` (per job, or per clip).** The default is `cores − 2`; at that rate every worker seeks the same
  multi-hundred-MB cut and the compositor intermittently dies with `No frame found at position N`. That error is
  **not** a corrupt file — check the asset copy's size before chasing it. Drop to **3** and it renders clean, at
  roughly half the speed (2026-10-29: 8 cores, a 216 MB 1080p cut, 3:20 in about 20 min).
- Remotion leaves a full copy of the cut in `%TEMP%/remotion-*assets*/` **per render** and never cleans up. They
  reached 122 folders / 30 GB in two days. Tell Ajay; don't delete them without asking.
