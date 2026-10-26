# Screen recordings as b-roll (product videos)

For videos about Track My Visibility features or other tools: Ajay's own screen recordings become the b-roll,
retimed so each click lands on the word that names it. Agreed 2026-10-26.

## What exists today — read this first

**This file is the agreed design. None of it is built.** Ajay's call on 2026-10-26: write it down now, build it when
a product video needs it. Build order is at the end (§6).

| | State |
|---|---|
| Screenshots | **Works today**: `browser` scene with `src` (slot in the job folder) + `pushAt` slow push-in |
| `screen` scene (plays a recording) | **Not built.** Nothing in `ESCENES` plays video yet |
| `broll.py retime` (ffmpeg, §4) | **Not built** |
| `broll.py align` (recording ↔ cut, §3) | **Not built** |
| `broll.py marks` (silent recordings) | **Not built** |
| Clip library (§5) | **Not started.** Grows one recording at a time |

Until it is built: use `browser` with screenshots for product moments, and mark anything that needs motion as a
slot in the plan (`[shot: …]`), never a caption.

---

## 1. Where the footage comes from

| source | use? |
|---|---|
| **Ajay's own screen recordings** | **Yes — the default.** Full recordings are fine; we cut and pace them |
| Screenshots (Ajay's) | Yes, for a page that doesn't move. Already supported |
| Real TMV data via the TMV MCP → `table` / `charts` / `stats` scenes | Yes, for "here's what the data says". Not a substitute for showing the product |
| Recordings or demo videos from the internet | **No.** Other people's footage, other companies' rights, not our look. Record other tools (ChatGPT, Perplexity…) yourself too |
| Claude driving the tool in the browser pane | Screenshots only, after Ajay signs in. Scripted re-recordable captures (Playwright) are a later option, not v1 |

## 2. How Ajay records (the checklist)

The pacing trick depends on one habit: **talk through what you're doing while you record**, even roughly
("now I open Competitors… filter by ChatGPT…"). That narration is how a recording gets matched to the final cut.

- 1920×1080 at least; 4K / Retina if possible, so zoom-ins stay sharp.
- Same browser, same zoom level (100%) every time. Bookmarks bar hidden, extensions hidden, one tab.
- Demo workspace / test brand: no client data, no notifications, no email in the corner.
- Slow mouse. Pause ~1s after each click and after each page loads. Pauses are free to cut; rushed clicks can't
  be slowed down without looking wrong.
- Do each action once, cleanly. If you fumble, pause, say "again", redo it. Takes get picked by the narration.
- One file per feature or per flow is easiest. One long file is fine too.
- Drop it in the video's job folder as `screen/<name>.mp4` (or in the library, §5). Never edit it first.

## 3. Pacing a recording to the cut

Two transcripts, matched:

1. `cut.mp4` (Ajay's talking-head cut) → `transcript.json`, as today.
2. `screen/<name>.mp4` (the recording, with Ajay's rough narration) → `screen/<name>.transcript.json`.
3. `broll.py align videos/<folder> screen/<name>.mp4` matches the two word streams (normalised words, longest common
   runs, à la `difflib.SequenceMatcher`) and prints **anchors**: recording time ↔ cut time, with the words.
   "Competitors" at 0:41 in the recording ↔ "competitors" at 1:12 in the cut.
4. Between anchors, the footage is retimed to fit (§4). The beat sheet gets a draft `segments` list per `screen` scene;
   Claude edits it, Ajay approves the plan as usual.

**Silent recording** (no narration): `broll.py marks videos/<folder> screen/<name>.mp4` finds clicks and page changes
from the frames (ffmpeg scene-change score) and writes a contact sheet of those frames with their times. Claude picks
the moments by eye. Slower and less reliable: say so in the plan.

**Recording already narrated as the final voice** (a Loom-style demo where the voice-over *is* the cut): no
alignment needed; the recording is the video. Only zooms and pills get added.

### Pacing rules

- **Fast-forward dead time** (loading, typing, scrolling): up to 3×. Beyond 3× it looks fake: cut instead
  (hard cut between segments, or a 0.2s crossfade).
- **Never slow footage below 1×.** If the talking runs longer than the action takes, play it at 1× and **hold** the last frame.
- The click / result lands **on the word** (the anchor), same rule as every other element.
- One scene = one action or one view. A long flow is several `screen` scenes, each with its own zoom.
- Zoom in on what's being talked about (a row, a button, a number), at most one zoom move every ~2s, ease in/out,
  max ~2.5× on 1080p footage (more needs 4K). Zoom out before the next page change.
- `pills` work as on every scene: 1–3 of Ajay's words on the word.
- Never invent UI: no fake numbers painted over the recording, no mock-ups presented as the product.

## 4. The `screen` scene (spec)

```json
{ "type": "screen", "start": 72.0, "end": 81.5, "face": "none", "slug": "competitors-filter",
  "source": "If you open Competitors and filter by ChatGPT…",
  "src": "screen/competitors.mp4",
  "frame": "full",
  "segments": [
    { "from": 38.2, "to": 44.9, "at": 72.0 },
    { "from": 51.0, "to": 53.4, "at": 77.6, "until": 81.5 }
  ],
  "zooms": [ { "at": 74.1, "rect": [1180, 320, 640, 360] }, { "at": 77.4, "rect": null } ],
  "pills": [ { "text": "filter by ChatGPT", "at": 76.9 } ] }
```

- `src`: recording path in the job folder (copied in from the library by `check`, like logos).
- `frame`: `full` (the recording fills 1920×1080, `face: none`) | `browser` (inside the existing browser frame,
  so the face side stays clear and the tmv chrome shows). Default `browser` when `face` is `left`/`right`.
- `segments`: recording `from`–`to` (seconds in the recording) plays starting at cut time `at`, ending at `until`
  (default: the next segment's `at`, or the scene `end`). Speed = (to − from) ÷ (until − at): > 3 blocks,
  < 1 means play at 1× then hold the last frame.
- `zooms`: `rect` = `[x, y, w, h]` in the recording's pixels, `null` = back to the full frame. Eased ~0.5s.
- Optional `clicks[{at, x, y}]`: a small red ring on a click the viewer might miss. Use sparingly.

**Where the work happens:** ffmpeg does the time, Remotion does the frame.
`broll.py retime` (run by `check` / `render`) cuts each scene's segments with ffmpeg (`trim`, `setpts` for speed,
`tpad=stop_mode=clone` for holds, no audio) into `.screen/<slug>.mp4`, exactly the scene's length at the cut's fps.
The `screen` scene in `scenes.tsx` then plays that file at 1× with `OffthreadVideo` and only adds the frame,
the zoom transform and pills. Variable playback rates inside Remotion seek badly; pre-timed files don't.

`check` adds: segment speed > 3× (BLOCK), hold > 3s (warn: say more or cut), `src` missing (slot), recording
under 1080p with a zoom > 1.5× (warn: will look soft), segments overlapping or outside the scene (BLOCK).

## 5. The clip library

Once two or three product videos reuse the same screens, record each feature once and keep it.

```
videos/library/                     (local only: videos/ is gitignored)
  index.md                          one row per moment
  tmv/citations-domain-view.mp4
  tmv/prompts-add.mp4
  chatgpt/answer-with-citations.mp4
```

`index.md`: `| id | file | from–to | what's on screen | narration words | recorded | UI notes |`, e.g.
`tmv.citations.domain-view | tmv/citations-domain-view.mp4 | 0:04–0:19 | domain table sorted by citations | "domains that get cited" | 2026-11-02 | new nav`.

- A `screen` scene can name a library moment instead of a file: `"clip": "tmv.citations.domain-view"`;
  `check` resolves it to `src` + segment bounds and copies the file into the job folder.
- The `recorded` date matters: when the TMV UI changes, re-record the stale rows rather than shipping an old UI.
- Library clips keep their narration, so `align` works on them like on a fresh recording.
- Google Vids caps a project at 50 clips: screen inserts count. Merge neighbouring scenes into one clip run as usual.

## 6. Build order (when a video needs it)

1. `retime` + the `screen` scene with `segments` and `frame: full` only. Test on one real recording + cut.
2. `zooms`, then `frame: browser` (face side clear).
3. `align` (needs the recording transcribed with the same whisper setup as `transcribe`).
4. `check` rules from §4, the plan's `screen` rows (`recording from–to → cut at`, speed, zooms).
5. `marks` for silent recordings, `clip` ids + `videos/library/index.md`. Only when actually needed.

Update the state table at the top, the scene table in `SKILL.md`, and `CLAUDE.md`'s scene-type list as each lands.
