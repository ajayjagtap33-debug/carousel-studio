---
name: broll-video
description: Make the b-roll for Ajay's talking-head videos (Remotion, editorial style "Warm paper × TMV"), timed to his words. Use whenever Ajay shares a video or audio file or path and wants b-roll, motion graphics, visuals over his talking head, inserts at timestamps, a "Nick Saraev style" edit, or says "add b-roll", "make the visuals for this video", "here's my cut". Covers transcribing, the beat sheet (stops for his approval), the layout check, the contact sheet and rendering silent clips he lays over his cut in Google Vids.
---

# B-roll video (editorial)

Ajay records and edits in Google Vids (50 clips per project, no timeline import). You make **only the b-roll**:
silent 1920×1080 clips he drops on his timeline. Dense editorial look modelled on Nick Saraev's b-roll
(teardown: `videos/reference/2026-10-15-nick-saraev-survive-ai/teardown.md`): something new on screen every 1–3s,
each element landing on the word that introduces it.
Style C, "Warm paper × TMV": Mulish only, TMV light paper background, TMV red in small doses, purple only for AI
things (theme in `broll/src/editorial/themes.ts`, scenes in `broll/src/editorial/scenes.tsx`).
**What goes on screen for each line is settled in `treatment-rules.md` here** (scene library, quotas, script markup,
the approval gate); the look is the canvas it links to. Read it before writing a beat sheet. One command:
`python scripts/broll.py`. Example jobs: `videos/2026-10-19-tmv-knowledge-base-test/` (full),
`videos/2026-10-19-tmv-knowledge-base-spot-test/` (spot).
Old hand-drawn look (his face boxed inside our render, `broll.json` without `"style"`): see `excalidraw.md` here.

## 1. Job folder + transcript

`videos/<date>-<slug>/` (date = today). Copy (never move) his file in as `cut.mp4`, or any one video/audio file
(an audio export like `audio.wav` / `.m4a` is enough: the b-roll is timed to the voice, frame defaults to 1080p30).
```
python scripts/broll.py transcribe videos/<folder>        # transcript.json (word times) + transcript.md (lines)
```
CPU, about 1/3 of the runtime with `small`; `--model medium` if names come out wrong. Read `transcript.md` once.
Whisper mishears jargon ("Cloud" = Claude, "MCB" = MCP): fix it on screen, list the fixes in the plan, ask when unsure.

## 2. Coverage: full or spot

| | **full** (default) | **spot** |
|---|---|---|
| Ajay says | "b-roll throughout", "full b-roll", nothing | "inserts at 0:42, 1:15…", "5 b-roll moments", "just a few spots" |
| b-roll | back-to-back scenes, most of the runtime | a few inserts (e.g. 5 × ~10s), his face full-frame the rest |
| face | `right` by default, rotating `left` / `right` by beat; `none` where the visual needs the frame | `none` by default: the insert fills the frame |
| output | `broll.mp4` (1 clip in Vids) or `--clips` (one per run) | `--clips`: one clip per insert |

Spot insert times: take Ajay's ("0:42, 1:15") or propose the strongest moments yourself (a list, a number, a named
source or tool, a process, a before/after), each with a one-line reason. Snap each one to sentence boundaries:
```
python scripts/broll.py snap videos/<folder> 0:42 1:15 2:30 --len 10
```
prints start–end + the words for each (falls back to clause boundaries inside long run-on sentences).

## 3. Beat sheet: `broll-plan.md` + `broll.json`, then STOP

**Ajay approves or edits the plan before anything is rendered.**

Rules:
- An element every 1–3s: each tile, row, pill, arrow or headline word lands on its word (`at` = that word's start).
- Find times with `python scripts/broll.py find videos/<folder> "chain of prompting"` (a few words). Never guess,
  never dump `transcript.json`'s word list into the conversation.
- Only what Ajay says, shortened. No number, claim, name or source he didn't say. Anything you wrote (a card title,
  a stand-in file name) is listed as `added`.
- A scene starts on the word that introduces it; the first element within ~0.3s (check warns otherwise). One idea per scene.
- Screenshots and logos are slots: `src` / `logo` paths in the job folder. Logos only from `assets/logos/`
  (official press kits; check copies them in). Never fetch images from the web, never put text in generated images.
- No face box overlap, text ≥ 24px: the check enforces it, don't shrink anything to get past it.

`broll-plan.md`: header (source file, style, coverage, transcript fixes, density = elements ÷ seconds), then one row
per scene: `# | time | scene | on screen (each element on its **word** (time)) | source` (the transcript line, or
`added`). Spot mode adds a `why here` column (the one-line reason). Then the slots, and for full mode the stretches
left face-only.

### broll.json

```json
{ "style": "editorial", "theme": "C", "coverage": "spot", "duration": 33.6,
  "scenes": [
    { "type": "flow", "start": 7.6, "end": 16.4, "face": "hidden", "slug": "mcp-connector",
      "source": "We fully automated this using Claude and TrackMyVisibility MCP connector",
      "headline": "Fully *automated*", "headlineAt": 7.65, "liftAt": 9.9, "joiner": "plus", "joinAt": [13.3],
      "tiles": [{ "label": "Claude", "icon": "sparkles", "tone": "ai", "at": 10.52 },
                { "label": "Track My Visibility", "logo": "logos/trackmyvisibility.jpg", "sub": "MCP connector", "subAt": 14.74, "at": 13.76 }],
      "pills": [{ "text": "MCP connector", "at": 15.28, "tone": "accent", "icon": "plug", "pos": "bottom" }] }
  ] }
```
Top level: `style: "editorial"` (required), `theme` (`C`), `coverage` (`full` | `spot`), `duration` (optional: render
only the first N seconds). Every scene: `type`, `start`, `end` (seconds, ≥ 2s, no overlaps), `source`,
`face` (`left` | `right` | `none` — which side stays clear for his face; default `right` in full, `none` in spot.
`box` and `hidden` are the old names for `right` and `none`), `slug` (optional clip-name override), `pills`.
All times are absolute seconds in the cut and must fall inside their scene.

Scene types (a new type goes into `ESCENES` in `scenes.tsx` first, never improvised):

| type | fields | use for |
|---|---|---|
| `browser` | `at`, `title?`, `titleAt?`, `url?`, `src?` (screenshot slot), `pushAt?` (slow push-in) | "this page", a site or tool he's showing. Without `src`: a neutral stand-in page |
| `flow` | `tiles[{label, at, icon?, logo?, sub?, subAt?, tone?: "ai"}]`, `joiner` (`plus` \| `arrow` \| `none`), `joinAt?[t]`, `headline?`, `headlineAt?`, `headlineGap?`, `liftAt?` | "X + Y", "A → B → C", or with `none` a set of named things side by side. Headline words enter one by one, then it lifts as tiles arrive. ≤ 4 tiles with the face box |
| `file` | `at`, `name` (mono), `rows[{text, at, icon?, sub?[t]}]` | a doc / file and what's in it; `sub` = faint placeholder rows (no invented text) |
| `pipeline` | `doc{name, at}`, `arrows[t, t]`, `prompts[{label, at}]`, `result{title, at, rows[{at, tick?}]}` | input → chain of AI steps → output; `tick` = when a row's check lands |
| `line` | `eyebrow?`, `eyebrowAt?`, `headline`, `headlineAt?`, `headlineSize?`, `sub?`, `subAt?` | the default text beat: red eyebrow pill, flush-left headline (`*word*` = red on a pale wash), one quiet line under it |
| `chips` | `eyebrow?`, `groups[{label, labelAt?, tone?: "accent", items[{text, at}]}]` | a named set, or can / can't: a white box of black pills, a red box for the one that bites |
| `rows` | `eyebrow?`, `items[{text, at, tone?: "accent", icon?}]`, `arrows?` | 2-4 numbered steps with arrows between; the last one in red when it's the warning |
| `stats` | `eyebrow?`, `cards[{label, value, valueAt?, sub?, at, size?}]` | 1-3 number cards; `value` takes `*accent*` |

- `*word*` in a headline = the accent word (light italic, TMV red).
- `pills[{text, at, tone?, icon?, pos?}]`: 1–3 of his exact words that land a point; `tone` `ink` (black, default) |
  `accent` (red tint) | `soft`; `pos` `top` (default) | `bottom`; max 26 characters, ~2 per scene.
- `tone: "ai"` (purple) only for AI models / assistants. Icons: lucide names in kebab case (lucide.dev/icons).

## 4. After approval: check → sheet → render

```
python scripts/broll.py check  videos/<folder>     # BLOCK: / slot: / warn: lines + layout lint (~20s)
python scripts/broll.py sheet  videos/<folder>     # stills/sheet.png: every scene at 75%, labelled with its time
python scripts/broll.py render videos/<folder> --preview   # preview.mp4: his audio + face-box outline, for Ajay to review
python scripts/broll.py render videos/<folder> --clips     # clips/02m14s-<slug>.mp4: silent, 0.25s fade in/out
python scripts/broll.py render videos/<folder>             # broll.mp4: silent, full length (full coverage)
```
- `check` renders each scene's 75% frame with every element at its end state and measures it: text out of its card
  or row, off the page, over the face box (on whichever side that scene keeps clear), text under 24px (20px for ≤3-word labels).
  `BLOCK:` stops the render: split the scene, shorten the words, or use `face: none`. `slot:` = a file Ajay must
  drop in. In spot mode it warns when an insert doesn't start/end on a sentence or clause. List `warn:` lines for Ajay.
- Look at `sheet.png` (one image) once per round. Check: each scene reads in a second, nothing collides.
- Clips: spot = one per insert; full = one per continuous run (scenes < 1.2s apart merge). Name = start time + slug
  (`slug`, else headline / title / file name / first tile). Ajay lays each at its start time over his cut in Vids;
  `face: none` clips cover his face; `left` / `right` ones need his face on that side. A stretch with no clip is
  him alone on camera — that only works with `--clips`, since one long file would cover him with a blank sheet.
- Rendering speed on this laptop: about 4 min per minute of b-roll (a 34s test took 2.2 min); run long renders in the background.

## 5. Hand over

Paths (clips/ or broll.mp4, preview.mp4), the plan table with each clip's start time, slots, warnings, transcript
fixes. Edits: change `broll.json`, re-run check → sheet → render. If he re-cuts the video, re-transcribe: every time shifts.

## Token budget

- One fresh session per video; this skill + the job folder is all the context needed. Don't read the code unless
  adding a scene type.
- Read `transcript.md` once; use `find` / `snap` for times, never the whole word list.
- One contact sheet per review round. Open single frames (`still videos/<folder> 23.9`) only where the check or the
  sheet flags something.
- Don't watch renders frame by frame: `check` + `sheet` cover layout; `preview.mp4` is for Ajay.
