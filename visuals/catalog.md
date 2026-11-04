# Visual catalog

One list of **what a sentence means → the pictures that can carry it**, for studio videos (16:9) and reels (9:16).
Plan a beat by its meaning first, then pick from **built**; if nothing built fits, that's a gap, not a reason to fall
back to `trio` / `words` / `type`.

- **built** = scene types in the renderer: `SCENES` (`broll/src/studio/scenes.tsx`), `IDEA_SCENES`
  (`scenes-idea.tsx`), `REEL_SCENES` (`broll/src/reel/scenes-reel.tsx`), `REEL_UI_SCENES` (`scenes-reel-ui.tsx`: real
  pages and rebuilt app UI) and `REEL_3D_SCENES` (`scenes-reel-3d.tsx`, three.js). Reels draw every studio scene too,
  but reel b-roll is real UI / screenshots / 3D, not the box scenes (Ajay, 2026-11-04).
- **not built yet** = seen in a reference, with where, and the name it gets when built (bold). Build from this column.
- Every built scene has a preview: `visuals/preview/README.md` (all of them, by meaning). References: `visuals/references/README.md`.
- `python scripts/scenes.py ledger` checks this table against the renderer and against what past videos used
  (`visuals/ledger.md`). `python scripts/scenes.py check <folder>` lints one plan.

Source keys: **NR** `videos/reference/2026-10-30-nick-saraev-recent` · **NC** `…/2026-10-28-nick-saraev-ceo-ai` ·
**NS** `…/2026-10-15-nick-saraev-survive-ai` (scene # from its table) · **FC** `…/2026-10-22-fieldcamp-ai-receptionist` ·
**AY** `…/2026-10-29-aayusucks-typography` · **RL** `reel-creator/reference/07_visual_breakdowns` (reel #) ·
**PM** `visuals/motion/` (prompt-motion.com archive, piece id; `local/videos/<id>.mp4`) · **VM** `swipe/visual-metaphors.md` (pattern V#) · **SB** `…/2026-10-31-nick-saraev-second-brain` (time).

Build order, test scenarios and the sketch (Excalidraw) mode: `visuals/plan.md`.

## Meanings

| meaning | the sentence sounds like | built | not built yet: **proposed name** (source) |
|---|---|---|---|
| section title | "step two", "the first thing", "so here's the plan" | `flap` `type` `spine` `iconreveal` | **sectionmap** 3 cards, the active one outlined, returning at each section (NS 5) · white "Number one" card (RL 01) · word smear in with motion blur (NC) |
| the key line | the sentence the video exists for | `type` `words` | `type` variant **crop**: one word oversized and cropped by the frame edge (AY) · small line over a big accent word (RL 18–33) · stacked heavy type filling a vertical frame, last word in accent colour (PM kloss-xyz-15182a) · serif line with italic accent word on warm gradient, vertical (PM francoxavier33-d2dfd2) · line + underline swipe on the accent word (PM utopyaszx-1b2f94, palashbagchi11-0a4b6b, charlesmendez-73b6e4: the SEO/AEO ones, closest to our topics) |
| proof of real work | "here's what I made", "this is the actual sheet" | `shot` `gallery` `sheet` `article` `webcard` | source card that zooms into its page (NS 7) · README with the line highlighted (RL 01) |
| a number | "1,200 people", "in 2027", "three times" | `count` `odometer` `places` `stopwatch` `orbit3d` | **icons** a row of N icons, "35 books' worth" (SB 3:00) · **repo** a repo card with a rolling star count (RL 19–33) · count-up inside a live scoreboard frame, big green digits (PM deifosv-04e4d3) · a number that ends in a ring/bar filling to 12% (PM devius-maximus-beab45) |
| arithmetic | "2 hours × 4 videos is a whole day" | `equation` | — |
| a share / proportion | "17%", "most of them", "one in five" | `places` | **waffle** 100 squares, N fill on the word (NR) · **squares** two squares sized to the split, 85/15 (NR) · **donut** (NR) · **progress** a thin bar filling to the stat, the % in accent colour above it (PM devius-maximus-beab45) |
| sizes compared | "ten times longer", "it never stops growing" | `lengths` | — |
| scores / ranking | "you scored 4.5, they scored 6.5" | — | **scores** 2–4 score tiles counting up, the winner lit (SB 7:15) |
| before → after | "it used to… now it…", "v1 vs v9" | `morph` `compare` `radar` `scale` `bucket` `tree` | — |
| don't do X, do Y | "stop doing X", "not this, this" | `compare` `swap` | — |
| ≠ / not the same thing | "mentions aren't citations", "money isn't identity" | `equation` | — |
| options / a set of three | "three ways", "you could… or… or…" | `trio` `fork` `pick` | **doors** three doors, one swings open (NR) · **grid** 2×2 / 3×3 icon cards, one lights up (NS 14, SB 6:45) · icon grid with one tile lighting (PM gabrielbuzziv-4ff0c6) · "Eight tools." count that swaps its numeral (PM bizibeast-10f264) |
| a choice / fork | "you can wait, or you can act" | `fork` | **doors** (NR) |
| a process / steps | "first… then… then…" | `loop` `stairs` `pipeline` `steps` | `pipeline` variant **branch** (one node splitting in two) |
| a bottleneck / filter | "everything waits on one step", "AI picks one" | `funnel` | **hourglass** a dotted line pinching through an hourglass, the line of type sliding past it (PM prasad-pilla-2c0cba) |
| a limit / it fills up | "AI can only read so much", "your week is full" | — | **context** a box filling with tiles to the brim, a counter under it, then the overflow spilling (SB 1:25) · **bucket-meter** blue cells stacked in a tank, big counter 10 → 9 as each is taken, a step chart under it (PM parkerrex-1a54fe) |
| many sources into one | "it pulls from Reddit, your site and reviews" | `sources` | **chipcloud** dozens of small mono chips drifting behind one big "100+" line (PM misbahsy-80eaec) · logos orbiting a headline (PM rammanq-f5a90f) |
| a definition | "AEO stands for…", "what we call…" | `acronym` | **dictionary** a dictionary entry for the term (NR) |
| fresh beats old | "the newer page wins", "updated last week" | `recency` | — |
| hidden work | "what people see vs what it takes" | `iceberg` | pile of unread document cards stacking up behind a line of type (PM sudo-kiran-6609ed) |
| levels / hierarchy | "level one… level three", "seniors stay, juniors go" | `stairs` `stack` | `stairs` variant **ladder**, a rung swapped for a bot (NS 18) |
| from here to there | "the thing that gets you from A to B" | `bridge` `tightrope` `ramp` | — |
| a trade-off / balance | "trying vs not trying", "worth it" | `scale` | — |
| a strong position | "owning the audience puts you in control" | `table` | — |
| what's in the way | "there's friction between idea and publish" | `path` | — |
| wasted effort | "hours on things that don't compound" | `bucket` | — |
| focus / cut the noise | "drop ten tools, keep two" | `funnel` `tree` | — |
| start small | "nobody's watching yet, start anyway" | `sprout` | — |
| it comes back to you | "what you put in is what you get" | `mirror` | — |
| a trap | "chasing views is a trap" | `trap` | — |
| old rules stop working | "the old playbook doesn't open this door" | `keylock` | — |
| which goes where | "which page answers which prompt" | — | **match** labels on the left, lines drawing across to their match (SB 3:30) |
| many → one | "ten mentions add up to one answer" | — | **converge** people icons, each with a bubble, lines meeting on one card (SB 7:00) |
| a trend over time | "it keeps going up", "then it dropped" | `lengths` `curve` | **timeline** then vs now (NS 21) |
| time passing / consistency | "every week for a year", "a decade from now" | `calendar` `journal` `shelf` `odometer` | **months** month folders in a row, an arc sweeping back over them (SB 6:05) |
| it runs on its own | "it runs every morning", "while you sleep" | — | **schedule** a clock, run icons ticking in a row (SB 5:40) |
| what it's made of | "it comes down to four things", "skills" | `radar` `marks` | **conceptmap** a person or brand in the middle, parts branching out (NS 20) · room that furnishes itself (NC, 3D, later) · layers with cubes passing through (NR, 3D, later) · 3D scene tour, camera gliding over the parts (PM sayan-shanky-f850d8) |
| a plan / outline | "here's the list", "we've done two of five" | `spine` `marks` | **sectionmap** (NS 5) |
| the app it happens in | "you get a call", "you search for…" | `phone` `chat` `search` `ad` `answer` `appwindow` `dm` `phone3d` | `phone` modes **thread** (iMessage), **notify** (a feed of notifications), **bank** (a balance) (NR) · **inbox** an email list, one opens (NR) · **dashboard** KPI tiles and a line updating (NR) · **terminal** a command typing, a table printing (RL 01, NC, SB 0:45) · **map** pins dropping with a counter (RL 01) · phone card dropping in with a cursor tapping it, badge unlock burst (PM bthreeagency-b9b8d9) · incoming-call card with accept/decline (PM fractadev-149adc) |
| AI does the work | "it runs while you sleep", "the agent writes…" | `chat` `answer` `pipeline` `appwindow` `promptcard` `orbit3d` | **todo** a meeting grid turning into a to-do list (NC) · **terminal** · **schedule** · **terminal** typed command, ✓ lines landing one by one, `shipped` in accent (PM robvjourney-ce3e1a, madhav-xo-f97f20) · prompt box typing the ask, send arrow pressed (PM alex-prompter-1ea044) |
| money / cost | "it cost me…", "$12k a month" | `receipt` `count` `equation` | `phone` **bank** (NR) · `count` + logos landing (NC) |
| who you are / credentials | "on your CV", "what people know you for" | `resume` | **dictionary** (NR) |
| reach / being found | "it turns up everywhere", "people find you" | `search` `places` `phone` `spotlight` | **map** (RL 01) · avatars popping into a word as a pill (PM samuel-yostt-891f87) |
| people / voices | "the people building AI say…", "the few who…" | `callouts` `spotlight` `pick` | **voices** 2–3 people with a quote each (NS 4) · **converge** (SB 7:00) |
| what's said vs what's thought | "we say fine, we think otherwise" | `bubbles` | — |
| what happened vs the story we tell | "one bad review, and suddenly…" | `event` | — |

## Harvesting a new reference

1. Tear it down the usual way (`videos/reference/<date>-<slug>/teardown.md`, or the reel breakdowns).
2. For every visual worth keeping, add it to the **not built yet** cell of its meaning, with the source key and a
   frame name. No meaning fits → add a row. Write the mechanism (what moves, what it says), never trace the drawing.
3. Run `python scripts/scenes.py ledger`, then build from the gaps: meanings with nothing built come first, then
   meanings where every built scene is worn out in the ledger.
4. Build 3–5 scenes per batch, with parameters so one scene gives several looks (`phone` is `rec | call | feed`).
   A new scene's name moves from **not built yet** to **built** in the same change.

## After every video

`python scripts/scenes.py ledger` lists the beats that fell back to a stock card (`trio`, `words`, `type`, `count`,
`list`, `points`) with their sentence. Any that wanted a real picture go into the backlog below, under their meaning.
The next harvest looks for those meanings first.

## Backlog (beats that wanted a picture we didn't have)

| date | video | — | meaning | used instead |
|---|---|---|---|---|
| 2026-11-01 | 2026-11-01-axxh3309 (idea journal) | "if you're watching anime, a philosophical movie, a self-help book or a novel, just note it down" | many sources into one (the journal), `sources` already spent at 1:07 | `trio` of four cards |
| 2026-11-01 | 2026-11-01-axxh3309 | "amusement parks are fun, lots of kids, lots of joy" | a remembered place / a memory page | `trio` with a headline |
| 2026-11-01 | 2026-11-01-axxh3309 | "the goal is super different, super irrelevant ideas" | variety / unlike things side by side | `words` |
