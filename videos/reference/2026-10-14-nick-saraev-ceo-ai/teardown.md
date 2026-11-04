# Teardown: Nick Saraev — "How to Use AI Like A Top 0.1% CEO"

`youtube.com/watch?v=He-NyJjzWM0` · 7:00 · 2026-10-14 · talking head, b-roll over ~90% of runtime.
Sampled every 4s (105 frames) because his elements **animate in progressively** — scene-change
detection found only 27 cuts in 7 minutes and missed most of the builds.
Frames: `frames/NNNN.jpg`, contact sheets `sheets/sheet-NN.jpg` (frame n is at n×4 seconds).

This is the same creator the existing `broll-video` skill tears down, one video later. The thing
worth copying here is not the look — it is **how little he captions and how much he draws**.

---

## 1. The frame

- **Page**: white, very slightly warm. No grid, no texture. A thin soft shadow under every card.
- **His face**: a small rounded card (~11% of frame width, portrait, radius ~10px, soft drop shadow)
  pinned to the **right edge, vertically centred**. It stays in exactly the same place all video.
  Content uses the whole remaining width — it is not a strict two-column split.
- **Full-frame face** happens ~10% of the time (frames 9, 34, 36, 60, 73, 75, 85, 92, 96, 97, 105):
  grey backdrop, shallow depth of field, b-roll gone entirely. He uses it for the emotional beats —
  the "believe me", the "I'm not saying this because…", the sign-off. **The visual drops away when
  the point is about him, not about a thing.**
- **No chrome at all.** No wordmark, no handle, no progress bar, no lower third, no logo. The only
  persistent element is his face card.

## 2. Palette and type

| | |
|---|---|
| Page | white |
| Ink | near-black, body text warm grey |
| **Accent** | **olive / forest green** — one accent, used everywhere (fills, ticks, chips, curves, italic spans) |
| Pills | solid black with white text, fully rounded |
| Eyebrows | grey, ALL CAPS, heavily letterspaced, small |
| Display | a transitional **serif** for headlines, hero numbers and italic emphasis spans |
| UI text | sans, small, for anything imitating an interface |

Discipline worth noting: **one accent, used five ways** (bar fill, tick, chip, arrow, italic word).
Other colours appear exactly three times in 7 minutes and always because the real thing is that
colour — blue for a water metaphor (f57), purple for an AI avatar (f94), red/orange only inside
YouTube and Amazon UI mocks. That restraint is what makes it read as calm rather than busy.

## 3. The spine: one recurring checklist

The video is a 7-item listicle, and a single card — **"Seven simple upgrades"** — is its spine.
It returns seven times (f4, 14, 35, 51, 61, 74, 93), and each time:

- rows already covered carry a **green tick** on the right,
- the row being introduced is a **solid green bar with white text**,
- rows not yet reached stay as **blurred ghost rows** — present, unreadable, so you can see how
  much is left without being able to read ahead.

This single device does the work of chapter cards, a progress bar and a recap, and it costs one
drawing. **This is the strongest idea in the video.**

## 4. Treatment catalogue

Grouped by what carries the beat. Frame numbers are the sampled frames above.

### Shown — a drawing carries it

| treatment | what it looks like | he uses it for | frames |
|---|---|---|---|
| **Paired bars** | Labelled rows in a card, grey short bar vs green long bar, value at the end. Ghost bars first, then they fill. | Two quantities where the gap is the argument (typing 30–50 vs speaking 150–200 wpm) | 6→7 |
| **Step / benchmark chart** | Axis 0–100%, stepped green line climbing, huge serif % callout beside it, annotation chips. Labelled `ILLUSTRATION` when the numbers are made up. | A number moving over time | 82→84 |
| **Exponential curve** | Plain axes, one green curve, faint area fill, dot at the head | "Pace of change", acceleration | 80 |
| **Mini chart row** | Three small cards side by side, each with a different chart (bars, line, play icon) | "You could visualise X, or Y, or Z" | 48→49 |
| **Branch** | One card → two arrows → two outcome cards (↗ Succeed / ↺ Fail), green dot on the good one | A binary outcome | 98 |
| **Loop** | Two labelled cards joined by two curved arrows making a cycle, thumbs up/down icons | Explaining a mechanism (RLHF) | 62 |
| **Flow with real nodes** | 3–4 cards left to right joined by arrows, each a different *kind* of thing (avatars card → quote bubble → dark agent terminal → result card with a button) | A pipeline end to end | 20→21, 18→19, 29→30 |
| **Progressive isometric** | An isometric room drawn in stages: floor → walls + window → furniture → product card with Buy Now | Something spatial; "imagine your new office" | 43→47 |
| **Literal metaphor** | A bottle with a person inside captioned BOTTLENECKED; a funnel of water captioned THE OCEAN; a tilting seesaw with white card up / black card down | The abstract claim with no data behind it | 55→56, 57, 99→100 |
| **Icon-row of people** | 3 cards, each crown + person + laptop, ticks landing one by one, caption under | "Big CEOs all do this" | 89→91 |
| **Token chips** | Small grey word-chips filling a card one at a time, then → "A PICTURE / 1,000 words" | Showing volume, then puncturing it | 37→38 |

### Captured — reality carries it

| treatment | what it looks like | he uses it for | frames |
|---|---|---|---|
| **Cited web page** | Real page screenshot, rounded + shadowed, floated on the page, with a **SOURCE strip above it**: `● SOURCE · Publication · "the quoted claim" · date` | Any outside claim | 8, 16, 39, 86 |
| **Paper + pulled quote** | arXiv/blog screenshot up top, then a white callout card under it with the sentence that matters, **key phrase underlined** | Research backing | 63, 64 |
| **Product UI mock** | A clean redraw of a known interface (Google search bar, Claude input, chat window) — not a screenshot, a **rebuild**, so it is minimal and on-brand | Showing how to ask | 11, 27→28, 53→59 |
| **App window** | Dark laptop/terminal frame containing app tiles or a CLI line, tiles appearing one at a time | "Whatever models he's running" | 52, 87→88 |
| **Own-video player bar** | A scrubber reading `This video · 5:01 / 7:00` | Self-reference: "in the time it takes to finish this video" | 76→77 |
| **Own sales page** | The real landing page screenshot with a green `✓ 90 days` chip and a highlighted phrase | The CTA at the end | 103→104 |

### Told — words carry it (he keeps this *small*)

| treatment | what it looks like | he uses it for | frames |
|---|---|---|---|
| **Hero number** | Eyebrow in caps, small green pill qualifier ("over"), then a very large serif figure | One money/volume number | 3 |
| **Serif statement** | An icon above, then a short line with one word italic + green: *Show*, not tell. | The chapter thesis | 50, 101 |
| **Black pill** | A small solid black rounded label floated *outside* the card it comments on | Editorialising on what's on screen — "not enough", "you can't just ask", "just telling it" | 20, 53→59, 65→67 |
| **Annotation chip** | A tiny white chip with an icon, floated beside a diagram — "↗ significantly more", "realistic lighting", "considered impossible" | Side remarks that would bloat the headline | 5, 44→45, 84 |
| **Quote lines** | Two short quoted lines in boxes, staggered left and right | Scripts he wants you to say verbatim | 70 |
| **Strike-through pair** | The wrong option greyed with a diagonal line through it, the right option as a live card | "It isn't X, it's Y" | 2 |
| **Authority quote row** | 4 portrait thumbnails, each with an italic pull-quote and a NAME in caps, a black pill verdict under, a source line beneath that | Opening credibility | 1 |
| **Before / after** | Two stacked cards labelled BEFORE and AFTER | A small transformation | 13 |
| **Cost compare** | White card "Your system / $1–2 / a day" → green `replaces` pill on an arrow → black card "A competent EA" | Price anchoring | 31→33 |

**Black card = the thing being displaced or the cost.** White card = the thing you get. That
white-vs-black contrast carries the comparison without a word of explanation (f33, f99).

## 5. How things enter

- **One element per 1–3 seconds**, landing on the word that introduces it. Nothing appears early.
- Cards arrive **whole**; their *contents* arrive one row at a time.
- **Ghost rows**: lists and cards render at full height with blurred placeholder rows, each replaced
  as he says it. Nothing reflows, nothing jumps. Used on the spine checklist, to-do lists, docs,
  transcripts and card rows.
- **Typewriter** for anything typed into an interface (f27→28, f58→59).
- Numbers and charts **count/draw up** rather than cut in.
- Blur-to-sharp on a title word (f25→26).
- Groups **clear between beats** — he never stacks two arguments on one page.
- Transitions between beats are plain cuts. No wipes, no slides, no motion blur.

## 6. Cadence over 7 minutes

| | |
|---|---|
| Full-frame face | ~10% of runtime, at emotional beats only |
| Shown (drawn) | the clear majority — roughly half of all b-roll beats |
| Captured (screenshots / UI) | ~15 beats, every one of them sourced |
| Told (pills, statements, numbers) | present on most beats but almost always **as annotation on a drawing**, rarely alone |
| Spine checklist returns | 7 times |
| Second colour used | 3 times, always because the real object is that colour |

The ratio to copy: **he draws the idea and captions it, rather than captioning the idea and
calling it a visual.**

## 7. What to take, and what not to

**Take**
1. The **recurring spine checklist** with ticks + one green active row + blurred ghost rows.
2. The **SOURCE strip** above every screenshot — publication · quoted claim · date. Cheap, and it
   makes the whole video feel checked.
3. **Pulled-quote callout card** under a paper/blog screenshot with the key phrase underlined.
4. **Ghost rows everywhere** — nothing reflows.
5. **One accent, five uses.** Second colours only when the real object is that colour.
6. **White card vs black card** for "what you get" vs "what it replaces".
7. **Dropping to full-frame face** when the point is about him rather than a thing.
8. Annotation **chips outside the card** instead of a longer headline.
9. **`ILLUSTRATION` label** on a chart whose numbers are invented. Honest and reusable.

**Don't**
- His exact portrait-card-on-the-right frame is his signature; ours should differ (see the skill).
- The authority-quote wall (f1) only works if the quotes are real and sourced — it is a claim, not
  a decoration.
- Hero numbers about personal earnings; that is his positioning, not Ajay's.
- Don't copy the serif. His display serif is the most recognisable thing about the look.
