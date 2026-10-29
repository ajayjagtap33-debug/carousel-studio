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
   per beat: time, his position, scene, elements on their words, source; list what you added). **Stop for approval.**
4. Stills at the key moments and mid-transition (job with `stills`), tiled into one sheet
   (`python scripts/_sheet.py <stills dir> <out.png> [cols]`); fix collisions (text over his face, the card over
   the wordmark, garbled characters — read the json as UTF-8). The sheet's downscale hides as much as it shows:
   open the single full-size still before believing a line is clipped or an element missing. Screenshots are the
   other thing to judge here — a shot whose text matters (a list, a doc) has to be cropped to that text and given
   a tile-width box, not a split-width one; a shot that is only evidence (a roadmap at 40% zoom) can stay whole
   with a ring and chips doing the work.
5. Render both themes from one bundle (`clips` with `muted: false`, the second with `props.theme = "ajay"`) into
   `studio/render/`, then `scripts/studio_sound.py` each into `studio/<name>-tmv.mp4` / `-ajay.mp4`.
6. Pull frames out of the finished MP4s and check loudness (−14 LUFS). Hand over both files, the cue sheet, what you
   added, and say plainly that the mix needs his ears.

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

`words` (≤ 6 of his words over his full-frame shot, rules below) · `type` (full-screen type card, rules below) ·
`trio` (2–4 cards side by side, each on its word; `tone` `accent` | `muted`) · `gallery` (several screenshots
landing one by one, `cols` + optional `cap`) · `count` (number counts up) · `list` (card that builds row by row, newest row dark) · `spine` (the video's outline: known items in words,
the rest blurred, current one dark) · `shot` (published figure + source line + `ring` + pills) · `points` (serif
headline + takeaway rows) · `places` (share + 2×2 place cards + tag) · `chat` (ChatGPT question types out,
sponsored card, mismatch flag). A scene draws in the box of the layout it starts in. Content rules from SKILL.md apply.

## Type (Ajay, 2026-10-29)

| theme | main (pops, type cards, board headlines) | plain words | accent (one word per line) |
|---|---|---|---|
| `tmv` | **Mulish** 700–800 | Mulish 500 | **Dancing Script** 700 (cursive) |
| `ajay` | **DM Sans** 600–700 (his site's sans) | **Open Sans** 500–600: chip labels, source lines, small connective words | **DM Serif Display** italic (his site's accent face) |

- `ajay` only: **JetBrains Mono** (also on his site) for typed prompts, URLs and code, nothing else.
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
- **No wash, no panel, nothing that darkens the frame.** White words straight on the footage, with at most a faint
  shadow on the letters themselves (≤ 0.25 opacity, ≤ 12px blur). The old dark wash put a shadow over his face.
- **≤ 6 words**, his own, appearing word by word on the spoken word. Not a caption of the full sentence.
- **Placement from `face`**: split the phrase either side of his head at eye level ("Think like" | "an artist"), or one
  line at chest height. Never over eyes or mouth (keep a box around the head clear); 2–3 words may cross his hands/body.
- One accent word per line (theme accent font and/or accent colour). No kicker lines.
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
