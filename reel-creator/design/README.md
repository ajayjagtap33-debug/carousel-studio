# Reel design reference (9:16)

The look for Ajay's reels: **Nick Saraev's reel layout, on our horizontal studio look**. Same backdrop, colours and
display type as the long videos (the `ajay` theme in `broll/src/studio/kit.tsx`), Nick's split panel for the person,
and Open Sauce captions. Built 2026-10-30.

- **The frames:** `frames/*.png` (29 frames, 1080×1920) and `sheet.png`. `reel-book.mp4` plays them back to back.
- **The content** is Nested Sequence 02 (`videos/2026-10-30-nested-sequence-02/`), the horizontal edit Ajay liked,
  rebuilt beat for beat for a phone, plus the pieces only a reel has (hook title, section card, counter tile, CTA).
- **The code:** `broll/src/reel/Reel.tsx` (the `ReelBook` composition). Frames are listed in `mkbook.py`.
- **Nick's reel teardown** (49 reels) is in `../reference/`. It's where the numbers below come from.

Rebuild: `python reel-creator/design/mkbook.py [--video]`, then `node broll/shoot.mjs reel-creator/design/job.json`.

## The 29 frames

| # | frame | layout | what it shows |
|---|---|---|---|
| 01 | hook | split | two-line title (olive box), channel page card, caption, him popping out of the panel |
| 02, 09 | calendar, big deal | split | month calendar: posts land on days / one day circled "big deal" |
| 03 | journal | split | notebook writing itself, REC corners closing round it |
| 04 | full | full | a breather, caption only |
| 05 | ad | full | YouTube ad chrome on his own shot |
| 06, 14 | section | card | "Reason number *one*" + the flap board, one line |
| 07 | old journal | board | the yellowed page, two lines underlined |
| 08 | callouts | full | "Your face", "Your voice" pointing at him |
| 10 | decade | board | ten years of months, the one month a dot |
| 11 | odometer | split | 2026 → 2036 |
| 12, 18, 27 | type | type | the key line, highlighter on the accent |
| 13, 21, 23 | record, call, feed | board | the phone: record → Published / "New client" calling / reels flicking |
| 15 | radar | split | five skills, the shape growing |
| 16 | receipt | board | video receipts printing |
| 17 | morph | split | lumpy Video 1 → sharp Video 14, red scrub bar |
| 19 | resume | split | "Great communicator" highlighted on paper |
| 20 | counter | split | his reel screenshot + Nick's counter tile counting to 21,000 |
| 22 | lengths | split | vertical bars: the 10-minute video runs off the top, a reel is a stub |
| 24 | shelf | split | video spines on a shelf, the year ticking |
| 25 | search | board | YouTube / Google / ChatGPT stacked, each finding the video |
| 26 | channel | split | his channel page |
| 28 | cta | full | *comment* "CHANNEL", glowing |
| 29 | safe zones | split | frame 01 with Instagram's UI zones marked |

## 1. Canvas

1080×1920, 30 fps. The page is the horizontal page: `#FAFCFA` inside a 14px `#E9E6DF` border with 20px corners.
No palm shadow, no film grain (those are Nick's; the backdrop is ours).

**Safe zones** (frame `29-safe-zones`). Instagram's own UI covers the top **220px**, the bottom **440px** (caption,
handle, audio) and the right **120px** (like / comment / share). There is no official Meta spec, and 2026 guides
disagree (bottom 280–670px), so these are the conservative end. Nothing that matters goes in them: captions, the
CTA keyword and every label sit inside.

## 2. Layouts

| layout | what's on screen | use for | Nick's share |
|---|---|---|---|
| `split` | board on top (y 140–940), caption pill on the seam (y 990), **him in a rounded panel at the bottom** | the base layout: most beats | ~45% |
| `board` | b-roll fills the screen, no person | tall pictures (phone, receipt, decade grid), and to rest the eye from his face | ~30–40% (his DARK) |
| `full` | full talking head, slow 100→104% punch-in | 1–3 breathers, a line said straight to camera, the CTA | ~15–30% |
| `type` | one huge line, highlighter on the accent | the key line, 2–3 s | — |
| `card` | section card: "Reason number" + *one* in an olive box | each list item | listicles |

**The split panel (Nick's exact layout).** Panel 924 wide (x 78–1002), top at y 1330, 60px rounded top corners, a
soft shadow on its top edge, bleeding off the bottom. Inside it, his own footage (wall, room). Over it, **the same
frame cut out**, so his head and shoulders rise ~250px above the panel and spill over its sides. The cut-out is
`scripts/matte.py` (Robust Video Matting, `tools/rvm/`, CPU, ~3.6s per frame for a still).

**Rules** (from the 49 reels):
- Open on `split`, with the hook title on screen from frame 0. End on `full` with the CTA.
- Alternate `split` ↔ `board` beat to beat. Never two `full` in a row, except into the CTA.
- Something new on screen every 1.5–2 s; nothing static for more than 3 s.

## 3. Type

| role | face | size | notes |
|---|---|---|---|
| Hook title, line 1 | Instrument Serif 400 | 104px | ink, sentence case |
| Hook title, line 2 | Instrument Serif *italic* | 116px | white, in an olive (`#4E6636`) box that wipes in left to right |
| Section card | Instrument Serif + *italic* in the olive box | 120 / 150px | "Reason number *two*" |
| Type card | Instrument Serif 400 | 150px | highlighter (`#C9D6AC`) behind the accent words |
| **Captions** | **Open Sauce Sans Medium (500)** | 64px | letter-spacing −0.035em, white on a see-through pill |
| Caption accent | Instrument Serif *italic* | 74px | `#A7BD82` (the olive that reads on dark), one word a phrase |
| Counter tile | Instrument Serif numerals | 168px | olive on a white tile, label Inter 500 36px |
| CTA keyword | Open Sauce Sans Medium | 168px | `#A7BD82` with a glow, *comment* above it in Instrument Serif italic |

**Caption pill:** `rgba(17,19,17,0.58)` with a 14px backdrop blur, fully rounded, 12/34px padding. It's the same
pill on footage and on the page; on the light page it reads as a warm mid-grey, on footage as a dark glass. **1–3 words at a time**, each blurring in
on its word; the pill grows with them and resets each phrase. No karaoke colour, no bounce.
Positions: `split` on the seam (y 990), `full` at y 1300, `board` / `type` at y 1440 (just above the bottom safe zone).

No all-caps eyebrows, no "02 / 10" counters, no small grey kickers (Ajay, 2026-10-29). The split-flap board is the one
thing in caps, because real flap boards are.

## 4. Colour

The `ajay` theme as is: page `#FAFCFA`, ink `#1A1A18`, olive `#4E6636` (accent on light), `#A7BD82` (accent on
dark / footage), tint `#C9D6AC`, dark cards `#111311`. Like Nick: monochrome, one accent, accent on ~2% of pixels.
`"theme": "tmv"` swaps in TMV red with no layout or type change (same fonts since 2026-10-31).

## 5. What b-roll works on a phone

A phone shows a 1080-wide picture at ~7cm. What the horizontal videos taught, re-weighed for that:

**Works better vertical**
- **Phones and app screens** (`phone`: record, call, feed). The object *is* 9:16, so it fills the frame naturally.
- **Tall paper**: the receipt printing line by line, a resume, a journal page.
- **One big number**: the odometer, the counter tile. Nick puts a counter on every number.
- **Stacks**: things that pile up top to bottom (receipt lines, a decade of months as rows, notifications, a list of steps).
- **A screenshot with one thing ringed**: crop to the line that matters, so the text is ≥ 30px once scaled.

**Needs changing**
- Side-by-side comparisons: stack them, or split them over two beats. Built so far: `search` with `"stack": true`
  (one row per surface) and `lengths` with `"vertical": true` (bars stand up; the long one runs off the top).
- Wide grids (the 12-month decade grid, the month calendar): keep them, but at 960px wide labels get small.
  Use the `board` layout so they can scale up.
- The split-flap board: one line of ≤ 10 letters, so the tiles stay big.

**Drop**
- Anything that needs reading: rows of sentences, long labels, small grey sub-lines.
- Text placed on the wall beside him (`words`, `place: "wall"`). There's no wall beside him at 9:16: the caption pill does that job.

**Sizes at 1080×1920** (≈ 1.8× the horizontal rules, because the frame is seen smaller): caption 64px, labels ≥ 36px,
nothing under 30px after the stage scale.

## 6. Motion and transitions

From the 49 reels, checked against current short-form advice (keep transitions short, let them serve clarity,
avoid trendy effects):

| transition | when | how |
|---|---|---|
| **Hard cut** | ~90% of changes: every layout change, every beat | on the first word of the sentence |
| **Card blur-in** | every new card or element | 0.1–0.25 s, blur → sharp, 10–14px rise (the studio's `Enter`) |
| **Punch-in** | `split` → `full` | the cut lands ~1.5× tighter; then a slow 4% push while he holds |
| **Word build** | captions, hook title, type cards | word by word on the transcript times |
| **Box wipe** | the hook title's line 2, the section word | the olive box wipes left → right in 0.35 s |
| **Count-up** | every number | ~1 s ease, tabular figures |
| **Slide / push** | card → card inside a list (rare, ≤ 1 a reel) | horizontal, with motion blur |
| **Never** | whip pans, spins, zoom blur on the person, glitch, light leaks | Nick used none on himself; light leaks are an old-era thing he dropped |

**Sound** follows the horizontal rules (`.claude/skills/broll-video/sound.md`): a music bed from 0.0 s, a soft pop
on cards, a whoosh on `board` entries, a low hit on the section card and the hook. About every 2nd–3rd cut, never on
plain talking-head cuts.

## 7. What these frames can't show

- **His footage is horizontal.** The reference frames crop Nested Sequence 02's 16:9 cut. In `full` there's no
  headroom, so his head sits high and the punch-in is a 1.8× upscale. **Record reels vertical (9:16), with a hand's
  width above the head**; the split panel and the full frame then come from the same shot without upscaling.
- **The cut-out is per still.** A reel needs the matte for every frame: `matte.py` needs a video mode (RVM is
  built for video, ~0.1–0.3 s a frame on CPU). Not built yet.
- **The frames are frozen moments.** `reel-book.mp4` shows the motion, but with a still image of him.
