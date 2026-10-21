# B-roll video: older Excalidraw style (broll.json without "style")

The first b-roll look: his cut with hand-drawn scenes (Virgil + carousel palette) and his face shrunk into a
corner box, rendered to `final.mp4` (composition `Main`, scenes in `broll/src/scenes.tsx`). Use it only when Ajay
asks for the hand-drawn look or an old job's broll.json has no `"style"`. Same commands as the editorial flow
(`transcribe`, `find`, `check`, `still`, `render [--draft]`); `sheet` and `--clips` are editorial only.


## 1. Job folder

`videos/<date>-<slug>/` (date = today). Copy his file in as `cut.mp4` (copy, never move his original).
If it isn't MP4, copy it with its own extension; the script picks up the only video in the folder.

## 2. Transcribe

```
python scripts/broll.py transcribe videos/<folder>
```
Writes `transcript.json` (every word with start/end seconds) and `transcript.md` (lines with times).
CPU only: about 1/3 of the video's length with `small`. Use `--model medium` if names or terms come out wrong.
Read `transcript.md` in full before planning. Whisper can mishear jargon; never put a misheard word on screen,
check it against what makes sense and ask Ajay when unsure.

## 3. Plan: write `broll-plan.md` (review sheet) and `broll.json` (render input), then STOP

**Ajay approves or edits the plan before anything is rendered** (same rule as the carousel storyboard).

Where b-roll goes:
- Face full-frame for the hook (first ~5–10s), personal stories, jokes, the CTA. People connect to the face.
- B-roll when he lists, compares, gives a number, names a source, or explains a process: anything a picture says faster.
- Aim for 40–70% of the runtime. Scenes 3–20s. One idea per scene. Don't cover every sentence.
- A scene starts on the word that introduces it, and its first item lands within ~1.5s (check warns otherwise).

What goes on screen:
- Only words Ajay actually says, shortened. Never a number, claim or source he didn't say.
- Item `at` = the word's start time from the transcript. Find times with
  `python scripts/broll.py find videos/<folder> "own something"`, never guess.
- Pills (`pills`) = 1–3 of his exact words that land a point ("rented", "follows you"). Max ~2 per scene.
- Screenshots/charts only when the scene can't work without one: use `image` with a `src` Ajay supplies
  (name it in the plan as a slot). Never fetch images from the web, never put text in generated images.

`broll-plan.md` = one table row per scene: time range, type, what's on screen, **source** (the transcript line it
comes from, or `added` for anything you wrote that he didn't say, like a title), plus slots needed. Then a
"face full-frame" list of the stretches with no b-roll so he sees the rhythm.

### broll.json

```json
{
  "face": { "x": 0.5, "y": 0.4, "zoom": 1.5 },
  "corner": "br",
  "scenes": [
    { "type": "checklist", "start": 4.1, "end": 13.3, "source": "First, a quick checklist...",
      "title": "Quick checklist",
      "items": [{ "text": "Keep some cash", "icon": "banknote", "at": 6.92 }],
      "pills": [{ "text": "rented", "at": 17.56, "until": 19.0, "tint": "red" }] }
  ]
}
```
- `face`: where his face is in the frame (0–1) and how far to zoom in the box. Look at a frame of the cut
  (`python scripts/broll.py still <folder> 2`) and set it so the box shows head and shoulders.
- `corner`: `br` (default) / `bl` / `tr` / `tl`, the side away from where he looks or gestures.
- `mode`: `"pip"` (default, face in the box) or `"full"` (b-roll covers the whole frame, his voice continues).
  Use `full` for wide visuals (a 4-step flow, a screenshot) and keep it short.
- Scenes closer than 1.2s keep the face in the box between them.
- `tint`: `red`, `green`, `blue`, `violet`, `orange`, `yellow`, `grey`. Red = bad/old, green = good/new.
- Icons: lucide names in kebab case (`shield-check`, `audio-lines`); lucide.dev/icons. The check catches typos.

Scene types (`broll/src/scenes.tsx`; a new type gets added there first, never improvised):

| type | fields | use for |
|---|---|---|
| `title` | `title`, `kicker?`, `sub?`, `subAt?` | section openers ("Part 2: own something") |
| `checklist` | `title?`, `items[{text, icon?, at}]` (≤5) | lists he reads out; newest row highlights green |
| `cards` | `title?`, `items[{icon, label, sub?, at, tint?, cross?}]` (≤4) | 2–4 options/things; `cross` = time a red X strikes one |
| `stat` | `value`, `label`, `at?`, `sub?`, `tint?` | one number he says, circled |
| `grid` | `title?`, `cols?`, `items[{icon, at, tint?, swap?{icon, at, tint}}]` (≤12) | "jobs → bots" style change over time |
| `quote` | `source`, `title?`, `text`, `highlight?`, `highlightAt?` | a report/article he cites (text he reads or paraphrases) |
| `image` | `src`, `caption?`, `zoom?[from,to]`, `focus?` | a screenshot Ajay supplies (in the folder) |
| `versus` | `title?`, `left{label, at?, items[{text, at}]}`, `right{...}` | before/after, wrong/right |
| `flow` | `title?`, `steps[{icon, label, at, tint?}]` (≤4) | a process, steps with arrows |

## 4. Check + preview (after approval)

```
python scripts/broll.py check videos/<folder>
python scripts/broll.py still videos/<folder>          # one PNG per scene (75% in) → stills/
```
`BLOCK:` lines stop the render: fix the plan (shorten, split, move times) rather than shrinking type.
`slot:` = a screenshot Ajay still has to drop in. List `warn:` lines for him.
**Look at every still.** Check: text fits, nothing hidden behind the face box, the box shows his face, the scene reads in a second.

## 5. Render

```
python scripts/broll.py render videos/<folder> --draft   # half size, to review timing fast
python scripts/broll.py render videos/<folder>           # final.mp4, 1080p, his audio
```
Speed on this laptop: about 5 minutes of rendering per minute of video for the final
(a 13-minute video ≈ an hour), so run it in the background. Do the draft first when the timing is new.
After rendering, grab frames at a few scene starts and mid-transitions with ffmpeg (`tools/ffmpeg`) and look at them.

## 6. Hand over

Tell Ajay: the path to `final.mp4`, what's on screen and when (the plan table), slots or warnings, and that he
uploads it to YouTube directly or to Google Vids (clips up to 35 min / 4 GB) if he wants to add more there.
Edits after review: change `broll.json`, re-run check → still → render. If he re-cuts the video, re-transcribe:
every time shifts.
