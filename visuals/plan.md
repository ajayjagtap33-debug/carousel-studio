# Visual library plan (2026-10-31)

Where the catalog goes next: 50 proposed pictures (44 new scene types + 6 variants of built ones), the order to build
them in, the test lines they're checked against, and an occasional hand-drawn "sketch" board built on Excalidraw.
Names and sources are in `catalog.md`. Built so far (2026-10-31): batch 1 and every swipe-folder pattern (V1–V28), which pulled scenes forward from batches 4, 5, 7 and 8. Each batch stops for Ajay's look at the stills.

## 1. Test scenarios

Lines of the kind Ajay says, **written by Claude to test coverage** (not content, no claims). Each gets a meaning and a
picture. A line is only covered when a built scene fits it **without** falling back to `trio` / `words` / `type`.
Picked across his four subjects: AEO and TMV, YouTube growth, AI workflows, and posting/consistency.

| # | test line | meaning | picture | built? |
|---|---|---|---|---|
| 1 | "ChatGPT reads about five sources before it answers" | many sources into one | `sources` | yes |
| 2 | "AEO stands for answer engine optimisation" | a definition | `acronym` | yes |
| 3 | "Of the ten pages it read, three got cited" | a filter | `funnel` | yes |
| 4 | "The page you updated last week beats the one from 2022" | fresh beats old | `recency` | yes |
| 5 | "Your traffic looks fine until you look at AI referrals" | hidden work | `iceberg` | yes |
| 6 | "Most brands show up in fewer than one in five answers" | a share | **waffle** | no |
| 7 | "A mention isn't a citation" | ≠ | `equation` (≠) | yes |
| 8 | "We run 250 prompts every morning" | it runs on its own | **schedule** | no |
| 9 | "Here's the Reddit thread it quoted" | proof | `article` | yes |
| 10 | "They scored 6.5, you scored 4.5" | scores | **scores** | no |
| 11 | "Prompt, search, read, cite: that's the whole pipeline" | a process | `pipeline` | yes |
| 12 | "AI only reads so much of your page" | a limit | **context** | no |
| 13 | "One viral post vs a hundred steady ones" | a trend | `curve` (spike vs slope) | yes |
| 14 | "I posted every week for a year" | consistency | `calendar` | yes |
| 15 | "There are three ways in" | options | **doors** | no |
| 16 | "Stop writing for keywords, write answers" | don't do X, do Y | `swap` | yes |
| 17 | "Most people quit before video ten" | a trend (dip) | `curve` (dip) | yes |
| 18 | "Your first video will be bad. Post it anyway" | a choice | `fork` | yes |
| 19 | "Editing eats most of the time" | a share | **squares** | no |
| 20 | "You need a system, not motivation" | foundations | `stack` | yes |
| 21 | "Now a client DMs me every week" | the app | `phone` **thread** | no |
| 22 | "Then the notifications started" | the app | `phone` **notify** | no |
| 23 | "The report lands in your inbox on Monday" | the app | **inbox** | no |
| 24 | "One command, and it built the whole thing" | AI does the work | **terminal** | no |
| 25 | "This is the dashboard I check every morning" | the app | `shot` if it exists, else **dashboard** | half |
| 26 | "A two-hour job turned into ten minutes" | sizes | `lengths` | yes |
| 27 | "There's friction between the idea and hitting publish" | what's in the way | `path` | yes |
| 28 | "Hours on things that don't compound" | wasted effort | `bucket` | yes |
| 29 | "Cut ten tools down to two" | focus | `tree` | yes |
| 30 | "Nobody's watching yet. Start anyway" | start small | `sprout` | yes |
| 31 | "Your skills carry over to the new thing" | from here to there | `ramp` | yes |
| 32 | "Owning your audience puts you in a strong position" | a strong position | `table` | yes |
| 33 | "The old SEO playbook doesn't open this door" | old rules stop working | `keylock` | yes |
| 34 | "Chasing views is a trap" | a trap | `trap` | yes |
| 35 | "Ten small mentions add up to one answer" | many → one | **converge** | no |
| 36 | "Which page answers which prompt" | which goes where | **match** | no |
| 37 | "You don't need everyone, just the right few" | people | `spotlight` | yes |
| 38 | "Look back at six months of posts" | time | **months** | no |
| 39 | "Level one you post, level three it compounds" | levels | `stairs` | yes |
| 40 | "Is it worth the effort?" | a trade-off | `scale` | yes |
| 41 | "1,200 SEOs grabbed the checklist" | a number | `odometer` / `count` | yes |
| 42 | "We started calling it 'answer share'" | a definition | **dictionary** | no |
| 43 | "Your page gets a few seconds to answer" | a number in an object | `stopwatch` | yes |
| 44 | "Two hours times four videos is a whole day" | arithmetic | `equation` (× =) | yes |
| 45 | "What you put out comes back" | it comes back to you | `mirror` | yes |
| 46 | "Here's everything that sits around your brand" | what it's made of | **conceptmap** | no |

**Now: 30 of 46 covered** (after batch 1 and the swipe-folder set, 2026-10-31).
Re-run this table after each batch and add lines from real scripts as they come in.

## 2. Build order

Ordered by how often the meaning comes up in his videos (AEO / AI first, those recur every video), then by cost.
Each batch: build → stills in tile, split and reel, both themes → Ajay looks → move the names to **built** in the
catalog → commit. 4–6 scenes a batch, same as the first one.

| batch | scenes | why this order | cost |
|---|---|---|---|
| 1. AEO core ✓ built 2026-10-31 | `article`, `sources`, `pipeline`, `acronym`, `recency` | they come up in every TMV / AEO video; article is the proof beat | medium (article needs a page mock + highlight) |
| 2. Data as shape | **waffle**, **squares**, `curve` ✓ (5 modes), `equation` ✓ (× = and ≠), **scores** | numbers are in every video; today they're all `count` | low, all SVG |
| 3. The app it happens in | `phone` **thread** / **notify** / **bank**, **inbox**, **terminal**, **dashboard** | his AI-workflow videos live in apps | medium (phone modes reuse the phone frame) |
| 4. Drawn metaphors I | **doors**, `swap` ✓, `path` ✓, `keylock` ✓, `bucket` ✓ | the swipe folder's strongest, all object-only | medium |
| 5. Drawn metaphors II | `tree` ✓, `sprout` ✓, `table` ✓, `stack` ✓, `stopwatch` ✓ | | medium (the tree is the hard one) |
| 6. Systems | **context**, **converge**, **match**, **months**, **schedule** | the second-brain video's kit | low–medium |
| 7. People and reach | `spotlight` ✓, **map**, `pick` ✓, **voices**, **conceptmap** | voices needs real photos supplied | medium |
| S. Sketch board | the `sketch` look + **excalidraw** scene (section 3) | before batch 8: the character pieces want the hand-drawn cast | medium–high, one time |
| 8. Character-led | `mirror` ✓, `ramp` ✓, `trap` ✓, **todo**, **timeline**, **grid** | need a figure doing the verb: our `person.*` cast, so after S | medium |
| 9. Variants | `type` **crop**, `tightrope` ✓, `stairs` **ladder**, `count` + logos, **repo**, **sectionmap**, **icons**, **dictionary**, **donut** | cheap extensions of built scenes | low |

Not planned: the 3D pieces (room that furnishes itself, cubes through layers). They need `@remotion/three`, and a
shaded 2D version gets most of it; revisit if a script really needs one.

## 3. The sketch board (Excalidraw), for a change of texture

**Yes, worth doing, as an occasional beat, not a second look for whole videos.** The clean board carries the
video; one or two hand-drawn beats in a 3–4 minute video read as "he grabbed a whiteboard to explain this one", which
is a real change of pace (Nick does this with his 3D pieces). More than that and the video stops having one look.

What it is:
- A per-scene flag, `"board": "sketch"`. Off-white paper, ink lines drawn with rough.js (already in `broll/node_modules`,
  and `broll/src/kit.tsx` already has a self-drawing rough shape from the old hand-drawn b-roll), the Excalidraw hand
  font (Excalifont / Virgil) for labels, the theme accent as the one colour. The face tile and layout don't change.
- **Our metaphor scenes in sketch dress.** The SVG scenes (`fork`, `funnel`, `iceberg`, `stairs`, `bridge`, `scale`,
  and the batch 2/4/5 ones) are paths, rects and labels, so a `sketch` flag swaps them to rough strokes and the hand
  font. One build, two textures.
- **An `excalidraw` scene for anything drawn by hand.** Ajay (or Claude) draws the picture in excalidraw.com, saves
  `<slug>.excalidraw` in the video folder, and the scene plays it: exported to SVG with the same `exportToSvg` that
  `scripts/build.py` uses for carousels, then each element draws on (lines) or fades in (text, fills) on its word.
  Order comes from Excalidraw **frames** or groups named `1`, `2`, `3`…, each mapped to an `at` in studio.json:
  `{type: "excalidraw", src, steps: [{at, group: "1"}, …]}`.
- **The cast comes with it.** `person.*` (12 poses), `bot.*` (5) and the 23 doodles from `scripts/library.py` export
  to SVG once into `broll/public/art/`, so a sketch beat (and batch 8) can have our own character doing the verb,
  the way the swipe folder's stick figure does, without borrowing his.
- Rules: at most 2 sketch beats a video, never two in a row, and never the key line (that stays a `type` card).
  `scenes.py check` counts them and warns past 2; the ledger records them like any scene.

What it costs: the export step for library art (headless Excalidraw is already wired for carousels), the `sketch`
switch inside `Stage` (strokes and fonts), and the `excalidraw` scene (SVG export, per-group reveal). Roughly one
batch's work.

## 4. How the library keeps growing

The same loop as `catalog.md` → Harvesting, with two additions:
- **Every new reference goes through the catalog first**: teardown → rows under a meaning with a proposed name →
  the scenario table gets a line it would cover → it joins a batch. Nothing is built straight from a reference.
- **Each batch re-runs the scenario table**, so coverage is a number we can watch go up rather than a feeling.
