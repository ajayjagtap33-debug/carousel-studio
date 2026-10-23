# Spec: composite video module (`style: "composite"`)

Status: **superseded 2026-10-22, kept for reference.** Ajay chose to stay with overlay clips and reposition his
face in Google Vids himself, because compositing costs ~10–20 sessions to build and ~1 session per video to drive.
The live plan is `.claude/skills/broll-video/treatment-rules.md` — the scene library, quotas and approval gate,
with the approved look on a canvas it links to. Read this file only for the layout/motion detail in §3–4, which
still describes the transitions and framing we want.

Written 2026-10-22 from the FieldCamp teardown
(`videos/reference/2026-10-22-fieldcamp-ai-receptionist/teardown.md`).

Ajay hands over a rough cut. The module decides the modes, framing, elements and transitions for the whole
runtime and renders a **finished video**. This is a different deliverable from `broll-video`, which renders
silent overlay clips Ajay lays over his own cut.

---

## 1. What changes, in one paragraph

Today `broll-video` treats Ajay's face as an obstacle: `face: "box"` reserves a 210×270 region on the right that the
b-roll must avoid, and he composites his face over the clips in Google Vids. The composite module puts the cut
*inside* the render as an animated crop, so the face can be a 818×913 card on the left in one beat and fill the
frame in the next. That single change is what unlocks framing, mode switches, and transitions that cross the face.

**The mechanics already exist in this repo.** `broll/src/Main.tsx` (the original Excalidraw look) already composites:
`OffthreadVideo` of the cut, `face: {x, y, zoom}` to pick the crop, `faceState()` interpolating between full-frame and
a corner box, `mode: "pip" | "full"` per scene, `BRIDGE` to join nearby scenes. The composite module is that
machinery driven by the editorial design language and a mode/element model instead of scene types.

---

## 2. Where it collides with Google Vids — decide this first

Google Vids: 50 clips per project, no timeline import, no way to receive a finished edit back as an editable project.

| | `broll-video` (today) | `composite` (proposed) |
|---|---|---|
| Module input | his audio, or a cut it only listens to | his **cut**, which it also renders |
| Module output | `clips/*.mp4`, silent overlays | `final.mp4`, finished, with audio |
| Ajay's edit | in Vids, after | in Vids, **before** |
| Tweaking a visual later | drag the clip in Vids | change `plan.json`, re-render |
| Re-cutting later | re-transcribe, every time shifts | same, **but worse** — see below |

**The trade.** Vids stops being where the video is finished and becomes where the *rough cut* is made: trim, reorder,
drop the fluffs, export one flat mp4. Everything after that is the module. Ajay loses the ability to nudge a visual
by dragging it, and gains a layout he can't build in Vids at all.

Three consequences worth accepting deliberately:

1. **No partial adoption.** A composite video can't be half-finished in Vids — the face card only exists in the render.
   If he wants to keep finishing in Vids, this module can't give him the FieldCamp look. There is no middle option.
2. **Re-cuts are expensive.** Every `at` is an absolute second in the cut. A re-cut shifts all of them.
   → **Mitigation (required, not optional): text anchors.** Every timed thing is authored as a phrase, and
   `plan.json` stores the resolved second alongside it. `broll.py reanchor` re-transcribes the new cut and
   re-resolves each phrase, reporting what moved and what it could no longer find. Without this, a re-cut means
   rebuilding the plan by hand, and the module will not survive its second video.
3. **Render time.** `broll-video` runs ~4 min per minute of b-roll with a static page. Compositing decodes and
   scales full-frame video every frame: budget **8–12 min per minute**, so a 6-minute video is ~an hour. Renders go
   in the background; `--draft` (half scale, crf 26) is the review path, and the contact sheet stays the main
   review surface.

**Recommendation:** adopt it for *scripted, planned* videos (the FieldCamp format: a written script, read straight
through, one topic, 4–8 minutes). Keep `broll-video` for anything talked loosely or finished in Vids. They are two
shows, and the module boundary should follow that, not the tooling.

---

## 3. Vocabulary: three modes, eight elements

Replaces the current "one scene type owns the whole frame" model. A **beat** is a continuous stretch of the cut in
one mode; elements compose inside it.

### Modes

| Mode | Face | Content | Typical length |
|---|---|---|---|
| `stage` | 818×913 card, left, static crop | annotation column, x 912–1872, top-aligned | 10–40s |
| `full` | full frame, slow push-in | one lower-third line | 5–10s |
| `card` | none | kicker + headline, centred on the page | 2.5–4s |

Cadence rules the check enforces (warn, not block): a `card` at least every 90s, a `full` at least every 120s,
`stage` never longer than 45s without a group clear.

### Elements (inside `stage` only)

| type | fields | notes |
|---|---|---|
| `chip` | `text`, `at`, `tone?: ink\|accent`, `strikeAt?` | the default. `ink` = dark pill, `accent` = lime |
| `card` | `title`, `badge?`, `at`, `rows[]`, `ghost` | **ghost rows**: card renders at full height with `ghost` placeholder bars; each row replaces one. Never reflows |
| `rows` | `items[{text, at, num?, tick?}]` | numbered or ticked list without a card frame |
| `flow` | `steps[{text, at, tone?}]`, `arrowAt[]` | chip → arrow → chip |
| `titled` | `title`, `sub`, `subAt?`, `at`, `tone?` | a named thing with a one-line sub |
| `shot` | `src`, `at`, `caption?`, `captionAt?` | screenshot floated on the page + lime caption pill |
| `tag` | `text`, `at`, `on` | small rotated lime label pinned to another element's id |
| `type` | `text`, `at`, `dur` | typewriter chip (URL, a typed prompt) |

That's the complete set observed in 6:20 of reference. A ninth type goes in `ELEMENTS` first, never improvised —
same rule as `VIS` in `render.py` and `ESCENES` in `scenes.tsx`.

### Transitions — derived, not authored

| from → to | transition |
|---|---|
| `stage` → `card` | group greys out (0.3s) → cut to `full` → **2 frames solid accent** → empty page → kicker → headline word by word → underline sweep |
| `stage` ↔ `full` | horizontal push, 0.25s, over a neutral band |
| `card` → `stage` | cut |
| group → next group | grey-out 0.3s, then swap |

Authoring these by hand is how a style goes inconsistent. Per-beat `enter: "flash" \| "push" \| "cut"` exists only
as an override, and the check warns when one is used.

---

## 4. `plan.json`

```jsonc
{
  "style": "composite",
  "theme": "fieldcamp",            // new entry in editorial/themes.ts
  "source": "cut.mp4",
  "face": { "x": 0.52, "y": 0.40, "zoom": 1.45 },   // crop centre in the source frame + card zoom
  "chrome": { "wordmark": "tmv.", "series": "Electrical series · Episode 6" },
  "audio": { "normalise": "-16", "bed": "music/bed.mp3", "bedGain": -11 },  // optional, §6

  "beats": [
    { "mode": "stage", "start": 6.8, "end": 27.4,
      "anchor": "not a production ready phone system",
      "source": "Not a production-ready phone system. Not something I would put in front of every customer…",
      "groups": [
        { "elements": [
            { "id": "a", "type": "chip", "text": "Not a production-ready phone system", "at": 7.1 },
            { "id": "b", "type": "chip", "text": "Not in front of every customer, untested", "at": 9.4 },
            { "id": "c", "type": "chip", "text": "A real workflow you can speak to", "at": 13.2, "tone": "accent" },
            { "type": "flow", "steps": [ { "text": "Test", "at": 14.1 }, { "text": "Break", "at": 14.9 },
                                          { "text": "Improve", "at": 15.6, "tone": "accent" } ] } ] },
        { "clearAt": 18.4, "elements": [
            { "id": "d", "type": "chip", "text": "Dragging boxes around a screen", "at": 18.9, "strikeAt": 24.8 },
            { "type": "flow", "steps": [ { "text": "FieldCamp Voice", "at": 20.6 },
                                          { "text": "MCP", "at": 22.1, "tone": "accent" },
                                          { "text": "An AI assistant", "at": 22.9, "tone": "accent" } ] } ] }
      ] },

    { "mode": "card", "start": 59.4, "end": 62.3,
      "anchor": "the mistake is asking it to build",
      "kicker": "STEP 1", "headline": ["Start with", "one use case"], "underline": 1 },

    { "mode": "full", "start": 186.6, "end": 193.4, "push": true,
      "anchor": "creating a job does not mean",
      "source": "Creating a job does not mean an appointment is confirmed.",
      "eyebrow": "THAT DIFFERENCE MATTERS",
      "line": "Creating a job *does not mean an appointment is confirmed*", "lineAt": 187.3 }
  ]
}
```

Conventions kept from the existing module: all times are absolute seconds in the cut; `source` is what was said
(or `added`); `*…*` marks the accent span — in `composite` it is the **highlighted clause**, not a single word, and
there is exactly one per `full` line. New: every beat carries an `anchor` phrase for `reanchor` (§2.2).

---

## 5. Pipeline and commands

Same CLI, same job folder shape. `style: "composite"` in `plan.json` selects the composite comp, as `"editorial"`
selects `EditorialMain` today.

```
python scripts/broll.py transcribe videos/<folder>            # unchanged
python scripts/broll.py face       videos/<folder>            # NEW: contact sheet of crop candidates → pick face.x/y/zoom
python scripts/broll.py find       videos/<folder> "phrase"   # unchanged
python scripts/broll.py check      videos/<folder>            # extended (§5.1)
python scripts/broll.py sheet      videos/<folder>            # one still per beat, labelled with mode + time
python scripts/broll.py reanchor   videos/<folder>            # NEW: re-resolve anchors against a new transcript
python scripts/broll.py render     videos/<folder> [--draft]  # final.mp4 (composite) — background, ~10 min/min
```

**`plan.md` stops for approval**, same as the beat sheet does now: one row per beat —
`# | time | mode | on screen (each element on its **word**) | source`.

### 5.1 Checks

Keep everything `check_editorial` already does (times inside their beat, min scene length, overlaps, lucide icon
names, asset slots, pill length, sentence snapping) and swap the face rules:

- **Reserved region**: in `stage`, nothing may render left of x=912 — the mirror of today's face-box check.
  `broll/src/editorial/lint.tsx` already measures this; only `FACE_RECT` changes.
- **Ghost rows**: `ghost` ≥ `rows.length`, and the card at full height must fit the column. If it doesn't,
  cut a row — don't shrink type. (Same rule as `band.py` → `cards need Xpx, room for Ypx`.)
- **Type floor**: `MIN_TEXT = 24`, `MIN_LABEL = 20`, unchanged.
- **Pace**: BLOCK if two elements land <0.6s apart; warn if a group holds >8 elements or a beat adds nothing for >6s.
- **Mode cadence**: the warnings in §3.
- **`full` lines**: ≤ 90 characters, exactly one `*…*` span, and it must be the *end* of the sentence.
- **Anchors**: every beat has an `anchor` that resolves to within 0.4s of its `start`; BLOCK if it doesn't resolve.

### 5.2 Review surface

`sheet.png` is the main review artefact, as it is today — one still per beat at 75%, labelled with mode and time.
Add a **mode strip**: a 1920×60 timeline bar at the top of the sheet showing the mode of every second as a colour
band, so the cadence (too much `stage`, no `card` for 2 minutes) is visible at a glance without reading the plan.

---

## 6. Audio (optional, opt-in)

Half of the FieldCamp polish is audio discipline: −16 LUFS, LRA 4.7, a continuous CC music bed 8–12 dB under the
voice, no gap longer than 0.25s. All of that is ffmpeg, and the module already shells out to ffmpeg for clip fades.

`audio.normalise` runs two-pass `loudnorm` to the target; `audio.bed` mixes a looped bed at `bedGain` with
`sidechaincompress` ducking under the voice. **Off by default** — it changes his recording, and he should hear
one before it becomes standard. Bed files are his to supply (CC-licensed, credited on the end card, as the
reference does).

---

## 7. What gets built

Reuse as-is: `transcribe` / `find` / `snap`, `shoot()` + `.shoot.json`, `layout_check()`, `cmd_sheet`,
`editorial/kit.tsx` (`Enter`, `useIn`, `useRamp`, `ECard`, `Headline`, `Kicker`, `Txt`), `editorial/lint.tsx`.

New:

| | |
|---|---|
| `broll/src/composite/Main.tsx` | mode timeline + the animated face crop. Port `faceState()` / `Face` from `src/Main.tsx`; replace the corner box with the left card rect and `full` with full-frame + push |
| `broll/src/composite/modes.tsx` | `Stage`, `Full`, `Card` |
| `broll/src/composite/elements.tsx` | the 8 types → `ELEMENTS` registry |
| `broll/src/composite/transitions.tsx` | flash, push, grey-out |
| `editorial/themes.ts` | a `fieldcamp`-style entry: `#F6F6F3` page, faint grid, one accent, chip rotation ±1.5° |
| `scripts/broll.py` | `check_composite()`, `cmd_face()`, `cmd_reanchor()`, mode strip in `cmd_sheet` |
| `.claude/skills/video-edit/SKILL.md` | the workflow skill, sibling to `broll-video` |

Rough size: the Remotion side is the bulk (modes + 8 elements + 3 transitions). `face` and `reanchor` are small.
Build order that gives something watchable early: **theme → Stage mode + `chip` + `card` → the face crop animation
→ `card` mode + flash → `full` mode + lower third → the remaining elements → `reanchor` → audio.**

---

## 8. Open questions for Ajay

1. **Vids.** Accept that these videos get finished in the module, not in Vids (§2)? If not, stop here — the look
   isn't reachable any other way.
2. **Which videos.** Composite for scripted explainers only, `broll-video` for everything else? Or replace it?
3. **Palette.** The reference earns its calm from **one** accent used five ways. Style C currently has TMV red +
   purple + good/bad greens. Cut to one accent for this style, or keep the TMV palette and accept it reads busier?
4. **Face crop.** Pick `face.x/y/zoom` by hand once per video from a contact sheet (proposed), or auto-detect?
   Auto-detection is a dependency and a failure mode; hand-picking is 30 seconds per video.
5. **Audio.** Try the loudness + bed pass on one video before deciding (§6)?
6. **Density.** Confirm the slower pace for this format: ~1 element per 3s in groups that clear, against
   `broll-video`'s 1 per 1–3s continuous.
