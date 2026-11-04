# Refluke b-roll library

Reference frames for Ajay's own videos. HTML build — `python3 scripts/refluke_frames.py [id …]`
renders 1920×1080 PNGs into `preview/`. **44 treatments.** Contact sheets:
`preview/nick-a.png` … `nick-d.png`.

**The theme is adopted wholesale from the reference video** (Nick Saraev, *How to Use AI Like A
Top 0.1% CEO*), on Ajay's call of 2026-10-25: copy it, don't adapt it. Colours were sampled from
the frames with PIL rather than eyeballed; the type was identified from native-resolution crops in
`videos/reference/2026-10-14-nick-saraev-ceo-ai/type/`.

---

## 1. Theme

| token | value | use |
|---|---|---|
| `page` | `#FAFCFA` | background — a cool near-white, slightly green |
| `card` | `#FFFFFF` | every card, radius 16, soft double shadow |
| `panel` | `#F9F9F6` | window chrome, icon tiles |
| `ghost` | `#EDE9E2` | inactive bars, placeholder rows, blurred ghost rows |
| **`accent`** | **`#536837`** | the olive — bars, rules, arrows, active rows, underlines |
| `deep` | `#3B482E` | chart lines |
| **`success`** | **`#2ADD5E`** | tick circles **only** — a vivid green, deliberately separate |
| `ink` | `#0C0F0F` | text and black pills |
| `body` / `mute` | `#65676B` / `#7B7B7E` | secondary text |
| `line` | `#ECECE8` | hairlines |

**Type** — best match to his, both on Google Fonts:

| | font | evidence |
|---|---|---|
| Display | **Playfair Display** | binocular `g`, vertical stress, hairline serifs, narrow lining numerals |
| UI / body | **DM Sans** | double-storey `a`, straight-tailed `y`, angled `t` terminal, tall x-height |

This is a visual identification, not a verified one. If it's wrong, both names live in one
`@import` line and one CSS block in `scripts/refluke_frames.py`.

**Two rules reversed.** Earlier guidance here said no card shadows and no all-caps letterspaced
eyebrows. His look uses both, and they are load-bearing — the eyebrow is how he labels without a
heading, the shadow is what separates a card from the near-white page. Both are in.
`EYEBROWS = False` at the top of the renderer turns the eyebrows off globally if that changes.

## 2. Surfaces

| surface | what it is |
|---|---|
| `paper` | A full 1920×1080 page with a **zone left empty** for Ajay's face, dropped in in Vids |
| `card` | A transparent PNG that sits on top of his footage |

In the preview frames the face zone is a dashed box labelled `face`; it is not in the delivered render.

## 3. Placements

Where his face sits. It must change — no two consecutive beats share one.

| placement | face | content |
|---|---|---|
| `tab-right` | small portrait tab, right edge, centred | the rest of the page — **the workhorse** |
| `half-right` / `half-left` | one half, full height | the other half |
| `corner` | full-frame; a card lands in a corner | one card |
| `side-points` | full-frame | a narrow column down one side |
| `band` | full-frame below | a strip across the top |
| `full` | none, or a circular PiP that relocates | the whole frame |

Over a 6-minute video: roughly `tab-right` ×6, `half-*` ×4, `corner` ×3, `side-points` ×2,
`band` ×2, `full` ×3. **`full` is the only mode where the face moves and the content doesn't.**

## 4. The types

Forty-four frames, each a rebuild of something he actually does.

### Opening

| id | what it is | use it for |
|---|---|---|
| `authority` | Four portraits, each with an italic pull-quote and a name in caps, a black pill verdict under, a source line beneath that | Opening credibility |
| `strike` | Two cards; the wrong one dimmed with an olive diagonal through it | "It isn't X, it's Y" |
| `number` | Caps eyebrow, small olive qualifier pill, then a very large serif figure | **One** number |

### The spine

| id | what it is | use it for |
|---|---|---|
| `spine` | The recurring checklist: ticked rows behind, one solid olive active row, **blurred** ghost rows ahead | Returns once per section. Replaces chapter cards, a progress bar and the recap |

### Data

| id | what it is | use it for |
|---|---|---|
| `bars` | Paired bars in a card, grey vs olive, value at the end | Two quantities where the gap is the argument |
| `trend` | One curve, hairline baseline, dot at the head, two filter chips | Acceleration |
| `stepchart` | Stepped olive climb, axis labels, big serif % callout, annotation chip | A number moving over time |
| `chartrow` | Three cards, three different chart types | "You could visualise X, or Y, or Z" |

### Diagram

| id | what it is | use it for |
|---|---|---|
| `flow` | 3–4 nodes, each a *different kind* of thing (avatars → quote → agent terminal) | A pipeline end to end |
| `loop` | Two nodes, two curved arrows, closed | Explaining a mechanism |
| `branch` | One node, two outcomes | "It goes one way or the other" |
| `costcompare` | White card → olive `replaces` pill on an arrow → black card | Price anchoring |

### Captured

| id | what it is | use it for |
|---|---|---|
| `cited` | Browser window, headline with the claim underlined, **SOURCE strip above**: `● SOURCE · Publication · "quote" · date` | **Every outside claim** |
| `pullquote` | The paper, then a card overlapping it with the sentence that matters, key clause underlined | Research backing |
| `uiframe` | A *rebuild* of an input with an olive cursor, plus option tiles | Showing what you actually type |
| `playerbar` | A scrubber reading `This video · 5:01 / 7:00` | Self-reference |

### Statement

| id | what it is | use it for |
|---|---|---|
| `statement` | Icon, then one line with an italic olive word | The chapter thesis |
| `chatpills` | A chat mock with **black pills parked outside it**, editorialising | Commenting on what's on screen |
| `quotelines` | Two quoted chips, staggered | Scripts to say verbatim |
| `outlinepill` | A short claim in an olive-outlined frame | A claim that needs a frame, not a card |

### Objects and interfaces

| id | what it is | use it for |
|---|---|---|
| `icon-card` | One icon, one label, small card | The quietest beat — naming a thing |
| `search-bar` | A rebuilt search field with a mic | "Go and search this yourself" |
| `terminal` | Dark window, one typed command | A CLI moment |
| `docs-page` | A product's own docs with a spec row | A product's documentation as evidence |
| `logo-tiles` | Two or three logo tiles with labels, then a black pill | Naming the tools. Logos from `assets/logos/` only |
| `laptop-tiles` | Dark laptop containing app tiles | What's installed on someone's machine |
| `uiframe` | A rebuilt input with an olive cursor | Showing what you actually type |
| `assistant-listening` | A card with a live "listening" dot and two speaker lines | Something running in the background |
| `screen-share` | A screen card with a purple agent avatar | An agent watching your screen. Purple appears once, for AI |
| `screen` | Full-frame recording, circular PiP that relocates | Your real screen |

### Sequences

| id | what it is | use it for |
|---|---|---|
| `before-after` | Two cards, BEFORE / AFTER | A small transformation |
| `ea-concept` | An abstraction, arrow, the concrete thing it makes | "Think of this as…" |
| `transcript-card` | Dark transcript card → arrow → the output | Raw capture becoming something actionable |
| `token-chips` | A card filling with word chips → arrow → the punchline card | Volume, then puncturing it |
| `gallery-chips` | A gallery screenshot + a stack of chips arriving | A screenshot plus what built it |
| `todo-avatars` | To-do rows with avatars and done chips, plus a live timer | Work finishing while the meeting runs |

### Metaphors

| id | what it is | use it for |
|---|---|---|
| `bottleneck` | A bottle with a person inside | The constraint is you |
| `funnel` | A wide body narrowing to a pipe | "Piping an ocean through a straw." The one place blue is allowed |
| `seesaw` | A tilting beam, white card up, black card down | A trade-off with no data behind it |
| `isometric-room` | A room drawn in stages, with annotation chips | Anything spatial |
| `company-icons` | A row of building icons under a serif line | A category of actor |
| `ceo-row` | Person cards with ticks, then the principle underneath | "Everyone good at this does X" |

### Critique and close

| id | what it is | use it for |
|---|---|---|
| `honest-feedback` | A card of crosses, not ticks | Asking for flaws — the inverse of the spine |
| `youtube-card` | A video card with red progress and a Subscribe pill | Referring to a video. Borrowed red, used nowhere else |
| `outro-cta` | Eyebrow, serif promise with an italic span, the real page | The close |

## 5. Coverage

All 44 treatments catalogued in the teardown are built. Each is one `spec(...)` call in
`scripts/refluke_frames.py`; a new one goes there first, never improvised into a plan —
the same rule as `VIS` in `render.py` and `ESCENES` in `scenes.tsx`.

Known weak spots, in case they matter later: `isometric-room` is the most expensive to
author and the least reusable; `funnel` and `seesaw` are deliberately loose drawings and
will look hand-made next to the data types.

## 6. Where they go in a video

| beat | minute | type | placement |
|---|---|---|---|
| Hook — the claim | 0:00 | `statement` | tab-right |
| Credibility | 0:15 | `authority` | tab-right |
| The reframe | 0:30 | `strike` | tab-right |
| What this covers | 0:45 | `spine` ① | tab-right |
| Point 1 — mechanism | 1:00 | `flow` | tab-right |
| …the number in it | 1:30 | `number` | corner |
| Spine returns | 2:00 | `spine` ② | tab-right |
| Point 2 — comparison | 2:10 | `bars` | half-right |
| …what it costs | 2:40 | `costcompare` | band |
| Face only | 3:00 | — | full |
| Point 3 — show it | 3:20 | `screen` | full |
| …what to type | 4:00 | `uiframe` | corner |
| Spine returns | 4:30 | `spine` ③ | tab-right |
| The objection | 4:40 | `chatpills` | tab-right |
| Evidence against | 5:00 | `pullquote` | tab-right |
| The proof | 5:20 | `cited` | tab-right |
| Recap | 6:00 | `quotelines` | side-points |
| Close | 6:40 | `outlinepill` | tab-right |

Two rules inside that: **drop to full-frame face when the point is about him, not a thing**
(~10% of runtime), and **the spine returns once per section**.

## 7. Motion

Not built — these frames are stills. The rules the Remotion build should follow, from the teardown:

1. **One element per 1–3 seconds**, landing on the word that introduces it.
2. **Cards arrive whole; their contents arrive a row at a time.**
3. **Ghost rows never reflow** — the card renders at full height, each blurred row is replaced.
4. **Numbers and charts draw up**, they don't cut in.
5. **Typewriter** for anything typed into an interface.
6. **Groups clear between beats.** Never two arguments on one page.
7. **Plain cuts between beats.** No wipes, no slides.

## 8. One thing worth saying plainly

This is a close copy of another creator's visual system — same palette, same type pairing, same
card idiom, same devices. That is a deliberate choice and it is Ajay's to make. The risk is
recognition: his audience and Ajay's overlap, and the look is distinctive enough that a viewer who
has seen both will notice.

The cheapest insurance, if that ever matters, is to change **one** structural thing rather than
redesigning: the display face, or the page colour, or the face placement. Any one of those breaks
the resemblance while keeping everything that makes the system work. Nothing in the renderer makes
that hard — the theme is one dict at the top of `scripts/refluke_frames.py`.

## 9. Also here

`preview/art/` and `scripts/art_png.py` are from the dropped hand-drawn thread — a working
exporter that turns `library.py` art into transparent PNGs. Not used by this library, kept because
the Remotion build will need character PNGs if the cast ever comes back.

## 10. Remotion build (started 2026-10-25)

The animated form lives in `broll/src/refluke/`, a sibling of `editorial/`:

| file | what |
|---|---|
| `theme.ts` | The sampled tokens, Playfair Display + DM Sans + DM Mono, the 8 placements and their face zones |
| `kit.tsx` | The motion vocabulary — `Enter`, `Head` (word-timed), `CountUp`, `Typewriter`, `Underline`, `Row` (ghost → active → ticked), `BarFill`, `DrawPath`, `Arrow`, `Tick`, `SourceBar`, `Win`, `Stagger` |
| `frame.tsx` | `Frame` (flat page + face guide), `Beat` (**hard cut**, per §7.7), `FacePip` (the relocating circle) |
| `scenes.tsx` | `RSCENES` registry — a new type goes here first, never improvised into a plan |
| `Main.tsx` | `ReflukeMain`, driven by `broll.json` like the editorial style |
| `Sample.tsx` | `ReflukeSample` — every built type, 6s each, to review the motion with no cut |

Registered in `Root.tsx` as `ReflukeMain` and `ReflukeSample`.

**All 44 types are built.** `scenes.tsx` holds the first twelve and the registry; `scenes2.tsx`
holds the other thirty-two; `parts.tsx` has the shared helpers (`n`/`str`/`arr`/`glue`, `SvgIn`,
`IconBox`, `Avatar`) so the two scene files share them without a circular import.

Registry keys match the frame ids in `preview/`, so a still and its scene are always the same
name. `todos` is kept as an alias for `todo-avatars`.

### Driving it from a real cut

`scripts/broll.py` knows this style. Put `"style": "refluke"` at the top of `broll.json` and the
usual commands work:

```bash
python3 scripts/broll.py transcribe videos/<folder>
python3 scripts/broll.py check      videos/<folder>     # check_refluke()
python3 scripts/broll.py sheet      videos/<folder>     # one still per beat -> stills/sheet.png
python3 scripts/broll.py render     videos/<folder> --clips
```

`check_refluke()` blocks on: an unknown type, a missing required field, `start`/`end` out of order
or past the cut, a beat under 2s, overlapping beats, a missing `at`, any timing outside its beat,
**the same placement two beats running** (§3), a `screen` beat not on `pip`, a bad pip corner, and
— the one worth having — **a captured type with no `source` line**. It warns when b-roll covers
more than 92% of the cut (no room for full-frame face) and when one placement takes more than 55%
of the beats. Then it runs the layout lint below. `--no-layout` skips that for a faster check.
Worked example: `videos/_refluke-check-test/`.

Each beat needs a `placement` and an `at`. Required fields per type live in `RTYPES`, which has to
stay in step with `RSCENES`.

### The layout lint

`check` renders each beat's 75% frame with every entrance at its end state and measures the page.
It reports four things:

- text under the type floor — **24px, or 20px for a label of three words or fewer**
- text overflowing its card, frame or fixed-height row
- text or a card running off the page
- text or a card overlapping **the zone kept clear for his face** — which changes with the
  placement, and for `pip` is the 260px circle in whichever corner the beat names

The measuring is shared with the editorial style in `broll/src/lintcore.tsx`; `refluke/lint.tsx`
and `editorial/lint.tsx` are thin wrappers that pass their own page bounds, face rect and floor.
One lint to maintain, not two.

**What is exempt, and why.** Anything marked `data-lint="chrome"` is skipped:

- `SourceBar` — attribution furniture, deliberately 20px mono per §1
- the depicted byline and title inside a screenshot mock — we are picturing someone else's page,
  not setting type

`Ui` and `Mono` take a `chrome` prop for this. **Never use it to get our own copy past the lint**
— shorten the copy or raise the size. The exemption is for text that is not ours to set.

**Not yet done**
- `scripts/broll.py` needed `from __future__ import annotations` to run here at all — it uses
  `str | None` annotations, which are Python 3.10+, and this machine has 3.9. Harmless on newer
  Pythons, but it is a change to a shared file.
- It also now finds Node the way it already found ffmpeg (`node()` — PATH, else `tools/node/`),
  so the commands work without putting `tools/node/bin` on PATH by hand.

### Verified 2026-10-25

Node 24.22.1 LTS is installed at `tools/node/` (gitignored, no admin rights needed — the official
arm64 tarball, same pattern as `tools/ffmpeg/`). Put it on PATH to use it:

```bash
export PATH="$PWD/tools/node/bin:$PATH"
cd broll && npm install
```

- `tsc --noEmit` — **passes, zero errors**.
- All 44 scene types render. Stills: `assets/refluke-broll/motion/` (`NN-*.png` the first twelve, `nNN-*.png` the rest), sheets `motion-sheet.png`, `new-a.png`, `new-b.png`.
- The sample renders to video: `assets/refluke-broll/motion/refluke-sample.mp4`
  (264s, 1920×1080, h264 — 44 scenes, 6s each). Rebuild it with:

```bash
cd broll && ./node_modules/.bin/remotion render src/index.ts ReflukeSample out.mp4
```

Or open it interactively with `npm run studio` and pick `ReflukeSample`.
