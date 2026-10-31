# Visual catalog

One list of **what a sentence means → the pictures that can carry it**, for studio videos (16:9) and reels (9:16).
Plan a beat by its meaning first, then pick from **built**; if nothing built fits, that's a gap, not a reason to fall
back to `trio` / `words` / `type`.

- **built** = scene types in the renderer: `SCENES` (`broll/src/studio/scenes.tsx`), `IDEA_SCENES`
  (`scenes-idea.tsx`), `REEL_SCENES` (`broll/src/reel/scenes-reel.tsx`). Reels draw every studio scene too.
- **not built yet** = seen in a reference, with where, and the name it gets when built (bold). Build from this column.
- `visuals/preview/<scene>.png` shows the end state of the scenes built since 2026-10-31.
- `python scripts/scenes.py ledger` checks this table against the renderer and against what past videos used
  (`visuals/ledger.md`). `python scripts/scenes.py check <folder>` lints one plan.

Source keys: **NR** `videos/reference/2026-10-30-nick-saraev-recent` · **NC** `…/2026-10-28-nick-saraev-ceo-ai` ·
**NS** `…/2026-10-15-nick-saraev-survive-ai` (scene # from its table) · **FC** `…/2026-10-22-fieldcamp-ai-receptionist` ·
**AY** `…/2026-10-29-aayusucks-typography` · **RL** `reel-creator/reference/07_visual_breakdowns` (reel #) ·
**VM** `swipe/visual-metaphors.md` (pattern V#) · **SB** `…/2026-10-31-nick-saraev-second-brain` (time).

Build order, test scenarios and the sketch (Excalidraw) mode: `visuals/plan.md`.

## Meanings

| meaning | the sentence sounds like | built | not built yet: **proposed name** (source) |
|---|---|---|---|
| section title | "step two", "the first thing", "so here's the plan" | `flap` `type` `spine` | **sectionmap** 3 cards, the active one outlined, returning at each section (NS 5) · white "Number one" card (RL 01) · word smear in with motion blur (NC) |
| the key line | the sentence the video exists for | `type` `words` | `type` variant **crop**: one word oversized and cropped by the frame edge (AY) · small line over a big accent word (RL 18–33) |
| proof of real work | "here's what I made", "this is the actual sheet" | `shot` `gallery` `sheet` `article` | source card that zooms into its page (NS 7) · README with the line highlighted (RL 01) |
| a number | "1,200 people", "in 2027", "three times" | `count` `odometer` `places` | **stopwatch** the number inside an object, then branching (VM V14) · **icons** a row of N icons, "35 books' worth" (SB 3:00) · **repo** a repo card with a rolling star count (RL 19–33) |
| arithmetic | "2 hours × 4 videos is a whole day" | — | **equation** tiles joined by × and =, or A ≠ B with an icon under each (NS 11, VM V9) |
| a share / proportion | "17%", "most of them", "one in five" | `places` | **waffle** 100 squares, N fill on the word (NR) · **squares** two squares sized to the split, 85/15 (NR) · **donut** (NR) |
| sizes compared | "ten times longer", "it never stops growing" | `lengths` | — |
| scores / ranking | "you scored 4.5, they scored 6.5" | — | **scores** 2–4 score tiles counting up, the winner lit (SB 7:15) |
| before → after | "it used to… now it…", "v1 vs v9" | `morph` `compare` `radar` `scale` | **bucket** leaking vs directed, "same hours, different output" (VM V25) · **tree** overgrown vs pruned (VM V26) |
| don't do X, do Y | "stop doing X", "not this, this" | `compare` | **swap** the old way struck through in red, an arrow to the new way; `logos` mode slashes competitor logos (VM V11, NS 17, FC, RL 01) |
| ≠ / not the same thing | "mentions aren't citations", "money isn't identity" | — | **equation** in ≠ mode (VM V9) |
| options / a set of three | "three ways", "you could… or… or…" | `trio` `fork` | **doors** three doors, one swings open (NR) · **pick** three boxes, one ticked, with a name for the answer; or two characters, "who would you pick?" (VM V13, V20) · **grid** 2×2 / 3×3 icon cards, one lights up (NS 14, SB 6:45) |
| a choice / fork | "you can wait, or you can act" | `fork` | **doors** (NR) |
| a process / steps | "first… then… then…" | `loop` `stairs` `pipeline` | `pipeline` variant **branch** (one node splitting in two) · `pipeline` variant **line**: dots on an arrow with the chaos they replace scribbled above (VM V8) |
| a bottleneck / filter | "everything waits on one step", "AI picks one" | `funnel` | — |
| a limit / it fills up | "AI can only read so much", "your week is full" | — | **context** a box filling with tiles to the brim, a counter under it, then the overflow spilling (SB 1:25) |
| many sources into one | "it pulls from Reddit, your site and reviews" | `sources` | — |
| a definition | "AEO stands for…", "what we call…" | `acronym` | **dictionary** a dictionary entry for the term (NR) |
| fresh beats old | "the newer page wins", "updated last week" | `recency` | — |
| hidden work | "what people see vs what it takes" | `iceberg` | — |
| levels / hierarchy | "level one… level three", "seniors stay, juniors go" | `stairs` | `stairs` variant **ladder**, a rung swapped for a bot (NS 18) · **stack** foundation blocks, widest at the bottom, the outcome on top (VM V6) |
| from here to there | "the thing that gets you from A to B" | `bridge` | `bridge` variant **rope**, a tightrope between ✗ and ✓ lists (VM V10) · **ramp** a figure carrying a box (what transfers) up a slope into a new direction (VM V21) |
| a trade-off / balance | "trying vs not trying", "worth it" | `scale` | — |
| a strong position | "owning the audience puts you in control" | — | **table** a figure on a one-legged stool vs a four-legged table, options fanning out (VM V23) |
| what's in the way | "there's friction between idea and publish" | — | **path** start → flag twice: blocked by objects, then clear with a figure running (VM V24) |
| wasted effort | "hours on things that don't compound" | — | **bucket** (VM V25) |
| focus / cut the noise | "drop ten tools, keep two" | `funnel` | **tree** (VM V26) |
| start small | "nobody's watching yet, start anyway" | — | **sprout** a loud launch crossed out → working quietly → a sprout (VM V27) |
| it comes back to you | "what you put in is what you get" | — | **mirror** effort on one side, what's reflected on the other (VM V19) |
| a trap | "chasing views is a trap" | — | **trap** a figure running at a lure on a stick, toward a hole (VM V16) |
| old rules stop working | "the old playbook doesn't open this door" | — | **keylock** old key, new key, the lock labelled tomorrow (VM V17) |
| which goes where | "which page answers which prompt" | — | **match** labels on the left, lines drawing across to their match (SB 3:30) |
| many → one | "ten mentions add up to one answer" | — | **converge** people icons, each with a bubble, lines meeting on one card (SB 7:00) |
| a trend over time | "it keeps going up", "then it dropped" | `lengths` | **curve** one drawn line + 1–2 callouts, modes hockey stick / bell / dip / mountain / spike-vs-slope pair (VM V7, V22, V28, NS 10, NR, SB 2:55) · **timeline** then vs now (NS 21) |
| time passing / consistency | "every week for a year", "a decade from now" | `calendar` `journal` `shelf` `odometer` | **months** month folders in a row, an arc sweeping back over them (SB 6:05) |
| it runs on its own | "it runs every morning", "while you sleep" | — | **schedule** a clock, run icons ticking in a row (SB 5:40) |
| what it's made of | "it comes down to four things", "skills" | `radar` `marks` | **conceptmap** a person or brand in the middle, parts branching out (NS 20) · room that furnishes itself (NC, 3D, later) · layers with cubes passing through (NR, 3D, later) |
| a plan / outline | "here's the list", "we've done two of five" | `spine` `marks` | **sectionmap** (NS 5) |
| the app it happens in | "you get a call", "you search for…" | `phone` `chat` `search` `ad` `answer` | `phone` modes **thread** (iMessage), **notify** (a feed of notifications), **bank** (a balance) (NR) · **inbox** an email list, one opens (NR) · **dashboard** KPI tiles and a line updating (NR) · **terminal** a command typing, a table printing (RL 01, NC, SB 0:45) · **map** pins dropping with a counter (RL 01) |
| AI does the work | "it runs while you sleep", "the agent writes…" | `chat` `answer` `pipeline` | **todo** a meeting grid turning into a to-do list (NC) · **terminal** · **schedule** |
| money / cost | "it cost me…", "$12k a month" | `receipt` `count` | `phone` **bank** (NR) · `count` + logos landing (NC) · **equation** |
| who you are / credentials | "on your CV", "what people know you for" | `resume` | **dictionary** (NR) |
| reach / being found | "it turns up everywhere", "people find you" | `search` `places` `phone` | **map** (RL 01) · **spotlight** (VM V15) |
| people / voices | "the people building AI say…", "the few who…" | `callouts` | **voices** 2–3 people with a quote each (NS 4) · **spotlight** a dim crowd, the light on a few (VM V15) · **converge** (SB 7:00) · **pick** (VM V20) |

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

| date | video | sentence | meaning | used instead |
|---|---|---|---|---|
