# Treatment rules

What goes on screen for each line of a script. Settled 2026-10-22 after two rounds of tuning and Ajay's review of
the scene canvas: **https://claude.ai/artifact/AjVWfaDwxxJtQ5v559JUB7** (seventeen scenes built from the real
transcript of `videos/2026-10-20-notes-recording`). Open it before writing a beat sheet — it is the look.

Goal: a normal video costs **~15k tokens**, not a session. Everything mechanical runs locally; one small pass does
the only part that needs judgement; Ajay approves a readable plan before anything renders.

---

## What exists today — read this before planning a video

**This file is the agreed design. Most of it is not built.** Ajay's call on 2026-10-22: don't spend credits
implementing it until a video actually needs it.

| | State |
|---|---|
| Scene library (§2) | **Part built** (2026-10-22, for the mention/citation video). `line`, `chips`, `rows`, `stats` render, with the canvas chrome (tmv wordmark, flush-left column, big face zone). `branch`, `scale`, `compare`, `ranked`, `charts`, `table`, `card`, `section` are still mockups |
| Scene types the renderer really has | `browser`, `statement`, `flow`, `file`, `pipeline`, `line`, `chips`, `rows`, `stats` — in `broll/src/editorial/scenes.tsx` → `ESCENES` |
| `broll.py beats` (§0) | **Does not exist.** Beat sheets are written by hand today |
| Quotas (§3) | **Not in `check`.** Judge them by eye off the `mix:` line |
| Script markup (§4) | **Not parsed.** Useful to write anyway — it is how the judgement gets paid for once |
| Frame variants (§5) | **Built** (2026-10-22). `face: "left" \| "right" \| "none"`; rotation is still set by hand in `broll.json`, not from `##` markup |
| Design tokens (§7) | Style C in `themes.ts` is close but has purple and the good/bad greens; this style wants one accent |

So: **to make a video today**, follow `SKILL.md` with the existing four scene types, and use §2–3 here as the
editorial judgement — default to showing rather than captioning, clear groups between beats, let `hold` be common.
To build the rest, the renderer comes first (the Shown types), then `beats`, then the quotas.

---

## 0. The flow, and where it stops

```
script (marked up)  →  record  →  transcribe        local whisper, free
                                  ↓
                            label the lines         ONE small pass, ~10–15k tokens (§1)
                                  ↓
                               beats                labels + word times → broll.json + broll-plan.md, free
                                  ↓
                   ►►  AJAY APPROVES broll-plan.md  ◄◄     nothing renders before this
                                  ↓
                          check  →  render --clips   free
```

**The gate is on `broll-plan.md`**, the visual script: one row per beat, in English, with what appears and when.
Low-confidence rows are marked `?` so the review has somewhere to look. Only after approval is a Claude fix-up pass
on the 3–4 beats that carry the video worth paying for.

---

## 1. How the treatment gets decided

**By a small labelling pass, not by word rules.** Transcript sentences in, one label per line out. No images, no
iteration, fixed output format. The rules below are that pass's instructions — they make it consistent, they are not
a program.

This was tested. Two rounds of keyword classification over `2026-10-20-notes-recording` and the FieldCamp reference:

| | loose cues | strict cues |
|---|---|---|
| FieldCamp | 33% diagrams, 37% nothing | 75% text pills |
| notes-recording | 33% nothing | 61% text pills |

Both wrong, in opposite directions. Loose cues matched inside other words (`there`→`here`, `approved`→`the app`,
`after-hours`→`after`); strict cues matched almost nothing, so everything fell through. The deeper reason is simple:
**the right treatment usually isn't in the words.** Nothing in "Start with one use case" says *section card*;
nothing in "the mistake is asking for the whole company" says *show it, then strike it through*. That comes from the
shape of the argument, which keyword lists cannot see.

So the local script does the free work — sentence splitting, word times, JSON assembly, frame rotation, quotas —
and the labelling pass does the judgement. Script markup (§4) moves even that upstream, into the script-writing
session that is already being paid for.

---

## 2. The scene library

Every scene in the library is on the canvas. **Default to the Shown family.** Told is supporting, not the backbone —
Ajay's review, 2026-10-22: *"after a point the text should be just improved captions… the majority, the
demonstration."*

### Shown — a picture carries it

| type | use for | canvas |
|---|---|---|
| `flow` | a sequence, a loop, "and then you do it again" | *flow — steps + arrows* |
| `branch` | one input, two different outcomes | *branch — same Q, two answers* |
| `grid` | a set of named things (models, tools, channels); logos from `assets/logos/` | *grid — face on the RIGHT* |
| `scale` | a quantity growing until it breaks | *bars — the bottleneck* |
| `compare` | two options measured against each other | *bars — cost compare* |
| `ranked` | a list with magnitudes, where the gap is the point | *ranked bars — sources* |
| `charts` | real metrics over time, 2–3 side by side | *charts — full width* |
| `table` | structured records; fades into ghost rows | *table — full width* |
| `versus` | can / can't, before / after, two tinted groups | *viz — can / can't* |

### Captured — reality carries it

| type | use for | canvas |
|---|---|---|
| `shot` | he is pointing at something that exists | *shot — slot* |
| `fullshot` | the thing deserves the whole frame, with a lower-third line | *shot — full frame* |

### Told — words carry it

| type | use for | canvas |
|---|---|---|
| `line` | a judgement, a contrast, a number; one emphasised clause | *line — the hook*, *line — the turn* |
| `card` | an enumerated list; **ghost rows**, never reflows | *card — ghost rows* |
| `rows` | 2–3 numbered steps, too light for a card | *rows — two ways* |
| `chip` | one claim worth pinning; `strike` when he contradicts it | *chips — the third one* |
| `section` | a chapter break; kicker + headline + underline, no face | *card — section break* |

### Nothing

| type | use for |
|---|---|
| `hold` | connective tissue — "so", "now", "let me". The previous visual stays. Meant to be common |

**Ghost rows are the house device.** `card` and `table` both render at full height with grey placeholder bars; each
real row replaces one as he says it. Nothing reflows and the viewer can see how much is still coming.

**When the library can't do the job, emit a slot — never a caption.** A `shot` with no file, or a `flow` whose steps
aren't in the sentence, becomes a red dashed box describing in English what's needed, and `check` reports it.
Caption soup is what happens when a generator must always produce something.

---

## 3. Quotas — what `check` blocks on

| Rule | Level |
|---|---|
| Told beats (`line` + `card` + `rows` + `chip`) ≤ **35%** | BLOCK `caption-heavy` |
| Shown + Captured ≥ **45%** | BLOCK `not enough shown` |
| No more than **3** Told beats in a row | BLOCK |
| A full-frame beat must be Shown or Captured, or a `line` — never `card`/`rows`/`chip` | BLOCK |
| No scene type used more than **3×** in a row, or for >25% of beats | BLOCK `repetitive` |
| `hold` ≥ **15%** | warn |
| ≤ 1 new element per **0.6s**; ≤ **8** per group | BLOCK |
| `?` rows > 25% | warn: mark the script up and re-run |

The repetition rule is Ajay's note on round 1 — *"it gets repeated after a while"* — made mechanical. Thresholds
live in one dict at the top of the generator.

---

## 4. Script markup

Written into the script before recording, so the judgement is paid for once in the script-writing session
(`fast-script`, `tmv-script-writer`). Markup always wins over the labelling pass.

| Mark | Means |
|---|---|
| `## Section title` | section break — and the frame variant rotates here |
| `**payoff clause**` | force `line`, emphasise this span |
| `- item` | force `rows` or `card` |
| `[shot: prompts page, filtered]` | force `shot`, with what to capture |
| `[viz: manual vs automated]` | force a Shown scene, with what it shows |
| `[hold]` | force nothing new |
| `[face: left \| right \| none]` | force the frame variant |

---

## 5. Frame variants

Ajay repositions his face in Vids, so the clip only keeps the right zone clear:

- `face: "left"` — content right, **left third clear** (the default)
- `face: "right"` — content left, **right third clear**
- `face: "none"` — full frame

**Rotation is a rule, not a judgement**: the variant changes at every `##` and alternates left → right.
`table`, `charts`, `fullshot` and any Shown scene over 6s default to `none`. The plan's `face` column tells Ajay
where to put himself for each clip.

---

## 6. `broll-plan.md` — the thing he approves

```
source: cut.mp4 · 6:42 · 31 beats · 1 element / 3.1s
mix:    shown 42%  captured 16%  told 29%  hold 13%      quotas OK
slots:  3 shots, 1 viz  (listed below)
review: 4 rows marked ?

 # | time  | face  | scene   | on screen                                      | source
---+-------+-------+---------+------------------------------------------------+--------------------------
 7 | 1:12  | left  | shot    | shots/prompts-page.png · "every tracked prompt" | "If you open this page…"
 8 | 1:19  | left  | hold    | —                                              | "So what that gives you…"
 9 | 1:23  | none  | branch ?| one question → Mon #2, Tue gone                 | "Ask it twice and…"
10 | 1:31  | right | scale   | 5 → 10 → 50 → 100 → wall                       | "Beyond 50, 60, 100…"
```

Every row carries its `source` line (or `added`), same rule as the carousels. The `mix:` line is the early warning:
the shape of the video is readable before a single row is.

---

## 7. Design tokens

Measured from the canvas. Matches the FieldCamp teardown's structure with TMV's colour.

| | |
|---|---|
| Page | `#F6F6F3` warm paper, faint 32px grid |
| Ink / body | `#141414` / `#5E5856` |
| Card | `#FFFFFF`, 1px `#E6DFDC`, radius 16, very soft shadow |
| Accent | **TMV red `#B80000`** — the only colour |
| Accent tint | `#FDF0EE` behind highlighted text and for slot boxes |
| Ghost bar | `#EFE9E7` |
| Font | Mulish, 800 headlines with −0.03em tracking, 600 chip text |
| Chips | rotated ±1–2° — what stops it looking like a slide deck |
| Face zone | 400×560 at 1080p-equivalent third, left by default |

One accent, used five ways: pill, highlight, underline, active border, slot marker. The scarcity is what keeps it
calm — a second colour buys variety that placement should be buying instead.

---

## 8. Decisions

- **2026-10-22** — Told ceiling cut from 40% to **35%**, Shown floor raised to **45%**, and a repetition rule added,
  after Ajay's review of round 1: the pills were right but became the backbone.
- **2026-10-22** — Connective lines **hold** the previous visual rather than clearing. A flash of empty between two
  cards reads as a mistake; a held visual reads as deliberate.
- **2026-10-22** — Section breaks come from `##` markup only. Topic-shift detection on a 6-minute transcript is
  unreliable, and the script is being written anyway.
- **2026-10-22** — One accent (TMV red). Purple-for-AI and the good/bad greens are dropped from this style.
- **2026-10-22** — Keyword classification abandoned (§1). The treatment is not in the words.
