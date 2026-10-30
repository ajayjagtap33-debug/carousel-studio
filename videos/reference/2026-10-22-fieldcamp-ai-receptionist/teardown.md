# Teardown: FieldCamp, "Build an AI Receptionist for Electricians in 15 Minutes"

Reference for a **composited** talking-head style (face rendered *inside* the layout, not laid under it).
Source: youtube.com/watch?v=wxAVQ_kTMyA — 6:20, 1920×1080 @ 30fps, published 2026-09-21.

Method: full download, auto-caption transcript (`transcript.txt`), ffmpeg scene detection (46 hard cuts),
95 frames sampled every 4s (`frames/sheet01–11.png`), plus 0.15–0.25s frame sequences across five transitions
(`frames/transition-*.png`) and the section spine (`frames/spine.png`). Audio measured with loudnorm/astats and
an FFT envelope. Frames are private reference, not for reuse. Anything marked *inferred* is my reading, not confirmed.

---

## 1. The numbers that define the style

| | |
|---|---|
| Runtime | 6:20 (380s) |
| Hard cuts | **46**, in 14 clusters — i.e. ~14 real scene changes in 6 minutes |
| Layout modes | **3 only** (see §3) |
| New element inside a beat | every **~2–3s**, one chip/row at a time |
| Elements per group | 2–6, then the group **clears** and the next one builds |
| Full-bleed face inserts | 8, every 40–60s, each 5–10s long |
| Section cards | 6 (title + STEP 1–5), every 40–85s |
| Dead air | **none** — 3 pauses ≥0.25s in the whole video; VO is wall-to-wall over a music bed |
| Integrated loudness | −16.0 LUFS, true peak −1.8 dBTP, **LRA 4.7** (heavily compressed) |

The thing to take away: this is **not** a dense Nick-Saraev-style board. It is a *slow, rigid* layout with a huge
amount of discipline — one fixed grid, three modes, two transitions, one accent colour. Almost all of its quality
comes from consistency, not from variety.

---

## 2. The grid (measured at 1920×1080)

```
 ┌─ 48 ─┬──────── 818 ────────┬─ 48 ─┬──────── 960 ────────┬─ 48 ─┐
 │      │                     │      │                     │      │   y=48   wordmark row
 │      │   FACE CARD         │ gut  │   ANNOTATION COLUMN │      │   y=100  content top
 │      │   818 × ~913        │ ter  │   chips / card /    │      │
 │      │   static crop       │      │   rows stack down   │      │
 │      │                     │      │                     │      │   y=1013 content bottom
 └──────┴─────────────────────┴──────┴─────────────────────┴──────┘
```

- **Page**: flat warm paper `#F6F6F3`, with a *very* faint square grid (~1 value step lighter). No gradients, no blooms.
- **Face card**: x 48–865, y ≈100–1013. Rounded (~24px), hairline dark border, soft shadow. Aspect ≈ 0.9 (near square,
  slightly portrait). It is a **centre crop of the same 16:9 take** used for the full-bleed shots — one camera, two crops.
- **Annotation column**: starts x 912, runs to 1872. Content is **top-aligned and left-aligned**, never centred.
- **Chrome**: `⌐ FieldCamp` wordmark top-left at y≈48. A `− □ ×` window control appears top-right **only on full-canvas
  section cards** — the layout is framed as an app window, and section cards "maximise" it. On full-bleed shots the
  wordmark gets a small white ▢ badge instead. Nice touch, cheap to copy.
- Face is **always left**, annotations **always right**. The column never swaps sides, never moves to a corner,
  and there is no picture-in-picture. (Worth saying plainly: the layout variety you'd expect from the brief isn't here —
  the restraint *is* the style.)

---

## 3. The three layout modes

| Mode | When | What's on screen |
|---|---|---|
| **A. Stage** (~75% of runtime) | default, all explanation | Face card left + annotation column right, building |
| **B. Full-bleed** (8 inserts, 5–10s each) | the thesis line of a section, the "look at me" beat | Full 16:9 face, slow push-in (~1% per 1.5s), one **lower-third sentence** |
| **C. Full canvas** (6 cards + 1 end card) | section breaks | No face. Paper page, kicker pill + 2-line headline, centred |

Mode B is never used for information — only for **one sentence of judgement**. Every single one:

> 3:07 *"Creating a job **does not mean an appointment is confirmed**."*
> 3:41 *"An impressive demo, or **a receptionist your team can trust**."*
> 4:43 *"Fix the workflow **before it touches a real customer record**."*
> 5:09 *"The first working version **ends here**."*
> 5:41 *"Not speed by itself. **You describe the outcome in plain English**."*
> 6:03 *"One call type, described in plain English, **tested before it rings**."*

Format is fixed: white rounded bar, centred, bottom ~1/5; a small lime eyebrow chip clipped to its top-left corner
(`THAT DIFFERENCE MATTERS`, `THE REAL ADVANTAGE`, `15 MINUTES`, `SIMULATIONS`); the payoff clause gets a **lime
highlighter swipe** that wipes in left→right. That's the whole device, reused 8 times.

---

## 4. Design tokens (observed)

| Token | Value |
|---|---|
| Page | `#F6F6F3` warm paper + faint grid |
| Ink | near-black `#111` headlines, `#555`-ish sub-lines |
| Card | white `#FFF`, radius ~16px, 1px hairline, very soft shadow |
| Dark pill | near-black pill, white text — the **default** chip |
| Accent | **acid lime `#BBFD33`** (measured, ±3) — the only colour in the entire video |
| Lime use | (a) the key chip in a group, (b) highlighter behind the payoff clause, (c) kicker pills, (d) the headline underline, (e) the full-frame flash |
| Headline font | tight modern grotesk, heavy weight, negative tracking (Inter Tight / Geist / Satoshi family look — *inferred*) |
| UI font | same family, 500/600, for chip and row text |
| Chips | rotated **±1–2°** — hand-placed feel on an otherwise rigid grid. This is what stops it looking like a slide deck |
| Numbered rows | small dark circle badge `1–6`, text to the right |
| "Sticky" tags | tiny lime label, rotated ~−4°, pinned overlapping a specific chip (`YOU APPROVE THE PLAN`, `THE HONEST NEXT STEP`, `MISSING? DON'T GUESS`) |

No second colour. No illustration. No icons beyond the checkbox and the circle badge. No character/mascot.

---

## 5. Element vocabulary (the whole set — there are only 8)

| # | Element | Cue | Example |
|---|---|---|---|
| 1 | **Chip** (dark pill) | each claim as he says it | "Not a production-ready phone system" |
| 2 | **Accent chip** (lime) | the one that matters in the group | "A real workflow you can speak to" |
| 3 | **Struck chip** | he negates something he just said | "The whole company" ~~struck~~ → "One use case" in lime |
| 4 | **Checklist card** | an enumerated list | `THE PROMPT` / `PASS CONDITIONS` / `STILL TO DO` / `VERSION 1` |
| 5 | **Numbered rows** | "first… then… then…" | 1 Greeting, 2 Triage, 3 Customer and address capture… |
| 6 | **Flow row** | chip → arrow → chip | "Job created → AI dispatch queue"; "Caller confirms → Only then accept" |
| 7 | **Titled card** | a named thing with a one-line sub | "FieldCamp App / Customer and job context" |
| 8 | **Screenshot card** | the actual product | dark app screenshot floated on the paper + lime caption pill below |

**The one device worth stealing outright: ghost rows.** The checklist card appears *at full height* with greyed
placeholder bars for the rows that haven't arrived yet, and each real row replaces a bar as he says it. The card
never resizes, nothing reflows, and the viewer can see how much is still coming. Four cards in this video use it
(`frames/sheet03`, `sheet04`, `sheet08`, `sheet10`).

---

## 6. Motion and transitions (frame-measured)

**Element entrance** — fade + ~8px rise, ~0.3s. Headlines animate **word by word** with a vertical slide
(caught mid-move at 2:26, `frames/spine.png`). Headline underline is a hand-drawn lime swoosh that sweeps left→right
with the tail leading. Highlighter swipes wipe left→right.

**Group clear** — before a scene change, the whole annotation column **fades to light grey** for ~0.3s, *then* cuts.
It reads as "that's done" (3:06, 0:59). This is the single most underrated move in the video.

**Transition 1 — lime flash** (into section cards; `frames/transition-flash-*.png`):
```
chips grey out → cut to full-bleed face → 1–2 frames of SOLID LIME (#BBFD33) → paper canvas, empty
→ kicker pill → headline word by word → underline sweeps
```
Total ~1.2s. The flash is 2 frames. That's the signature.

**Transition 2 — horizontal push** (into/out of full-bleed and screenshots; `frames/transition-push-*.png`):
the outgoing layer slides left while the incoming slides in behind it, over a neutral grey band. ~0.25s.

**Other motion**: full-bleed shots carry a very slow push-in (~1% per 1.5s, measured on the monitor logo).
The boxed face card is **static** — no Ken Burns. A typewriter chip types the URL out character-by-character with a
blinking cursor at 6:12.

That's it. Two transitions, two entrances, one flash. No whip pans, no zoom punches, no shake, no glitch.

---

## 7. Audio

- **−16.0 LUFS integrated, −1.8 dBTP, LRA 4.7.** That LRA is very narrow: heavy compression + limiting on the VO.
- **Continuous music bed** under the whole thing, ~8–12 dB below the voice (confirmed: 0–120Hz energy stays flat
  across every 20s bucket including 377–380s where speech has stopped). Credited on the end card as
  *"Background music" by Migfus20 on Freesound.org — CC BY 4.0 (edited and mixed)*.
- **No pauses.** 3 gaps ≥0.25s in 380s. The VO is scripted, read continuously, and the music covers every seam.
- **No whoosh/riser SFX layer.** I looked for it: HF transients across the track are sibilants, evenly distributed,
  not clustered at the cuts. One or two cuts sit on a bright transient (0:28, 1:41) which may be a soft swish —
  ambiguous, not a consistent device. The cuts are carried **visually**; the audio just never stops.
- Voice: close lav, bright, even. Delivery is extremely level — scripted and read, possibly re-recorded to a script
  rather than talked. No judgement either way, but the *script* is the reason the layout can be this planned:
  every chip is a sentence he wrote, so the b-roll is a rendering of the script, not a decoration on top of it.

---

## 8. The spine (`frames/spine.png`)

| Time | Mode | Beat |
|---|---|---|
| 0:00 | A | Cold open: promise + three "not this" chips + the payoff chip |
| 0:29 | C | Title card: `FieldCamp · Electrical series · Episode 6` / "Build an AI receptionist" / sub-line |
| 0:30 | A | Context: what MCP is, what the assistant can do (numbered rows) |
| 1:00 | C | **STEP 1 — Start with one use case** |
| 1:37 | B | full-bleed beat |
| ~1:42 | C | **STEP 2** |
| 1:45 | A | `THE PROMPT` ghost-row card builds over ~25s |
| 2:26 | C | **STEP 3 — Plan before it builds** |
| 2:49 | C | **STEP 4 — Connect the business systems** |
| 3:07 | B | "Creating a job does not mean an appointment is confirmed" |
| 3:45 | C | **STEP 5 — Five simulations before a real call** |
| 4:13 | A | `PASS CONDITIONS` ghost-row card |
| 5:09 | B | "The first working version ends here" |
| 5:21 | A | `STILL TO DO` card — the honest caveats section |
| 6:03 | B | thesis restated |
| 6:12 | A | product screenshot + lime caption |
| 6:16 | C | End card: wordmark, "Start the series: **Episode 1**", URL, music credit |

Structural pattern worth copying: **claim → build the list → full-bleed judgement line → next step card.**
Also note what comes *after* the climax: a `STILL TO DO` card listing what the build does *not* yet handle.
That's where the trust comes from, and it's a whole section, not a disclaimer.

---

## 9. What this means for our module

Where our `broll-video` skill already matches: word-timed element entrances, scene types declared in JSON,
a check/sheet/render loop, ghost/faint rows (`file.rows[].sub`), kicker pills, accent-word headlines.

The real gap is **architectural**, not stylistic:

1. **We treat the face as an obstacle; they treat it as a layout element.** Our `face: "box" | "hidden"` keeps a
   region clear for Ajay to drop his face over in Vids. FieldCamp composites the face *into* the render — which is
   what makes the card crop, the lime flash over his face, and the mode switches possible. Doing this means the
   module needs his cut as an input, not just his audio, and outputs a finished video rather than overlay clips.
   That is a different product from what the skill does today, and it collides with the Google Vids workflow
   (50-clip limit, no timeline import) — worth deciding deliberately before building.
2. **Modes, not scenes.** Our JSON has ~4 scene types that each own the whole frame. This video has 3 *modes*
   and 8 *elements*, composed. A mode/element split would let one timeline describe "stage with chips", "full-bleed
   with lower third", "section card" without a new scene type each time.
3. **We have no `clear` beat and no section cards.** The grey-out-then-cut and the STEP card are what give a
   6-minute video shape. Both are cheap to add to the current model.
4. **We have no sustained card.** Ghost rows exist, but the FieldCamp `THE PROMPT` card holds for 40 seconds and
   fills in. Our density rule ("something new every 1–3s") would have split that into four scenes and lost the effect.
5. **Our density target may be wrong for this format.** 1 element per 1–3s suits Saraev's 13-minute essay. This
   6-minute explainer runs at 1 per ~3s in bursts with clears between, and reads calmer. Both work; they're
   different shows. Worth picking per video rather than per module.
6. **Colour discipline.** One accent, used five ways. Our style C has red + purple + good/bad greens. Not wrong,
   but this video is a good argument for cutting the palette and earning variety from *placement* instead.

Cheapest high-value borrows, in order: **ghost rows that don't reflow** → **the clear beat** → **the lower-third
judgement line with a highlighted clause** → **section cards with the lime flash** → **±1.5° chip rotation**.
