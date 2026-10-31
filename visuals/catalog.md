# Visual catalog

One list of **what a sentence means → the pictures that can carry it**, for studio videos (16:9) and reels (9:16).
Plan a beat by its meaning first, then pick from **built**; if nothing built fits, that's a gap, not a reason to fall
back to `trio` / `words` / `type`.

- **built** = scene types in the renderer: `SCENES` (`broll/src/studio/scenes.tsx`), `IDEA_SCENES`
  (`scenes-idea.tsx`), `REEL_SCENES` (`broll/src/reel/scenes-reel.tsx`). Reels draw every studio scene too.
- **not built yet** = seen in a reference, with where. Build from this column, gaps first.
- `visuals/preview/<scene>.png` shows the end state of the newer scenes (2026-10-31 batch).
- `python scripts/scenes.py ledger` checks this table against the renderer and against what past videos used
  (`visuals/ledger.md`). `python scripts/scenes.py check <folder>` lints one plan.

Source keys: **NR** `videos/reference/2026-10-30-nick-saraev-recent` · **NC** `…/2026-10-28-nick-saraev-ceo-ai` ·
**NS** `…/2026-10-15-nick-saraev-survive-ai` (scene # from its table) · **FC** `…/2026-10-22-fieldcamp-ai-receptionist` ·
**AY** `…/2026-10-29-aayusucks-typography` · **RL** `reel-creator/reference/07_visual_breakdowns` (reel #) ·
**VM** `swipe/visual-metaphors.md` (pattern V#).

## Meanings

| meaning | the sentence sounds like | built | not built yet (source) |
|---|---|---|---|
| section title | "step two", "the first thing", "so here's the plan" | `flap` `type` `spine` | section map, 3 cards with the active one outlined, returning at each section (NS 5) · white "Number one" card (RL 01) · word smear in with motion blur (NC) |
| the key line | the sentence the video exists for | `type` `words` | one word oversized and cropped by the frame edge (AY) · small line over a big accent word (RL 18–33) |
| proof of real work | "here's what I made", "this is the actual sheet" | `shot` `gallery` `sheet` | article with one sentence highlighted and pulled out (NS 8, NR) · source card that zooms into its page (NS 7) · README with the line highlighted (RL 01) |
| a number | "1,200 people", "in 2027", "three times" | `count` `odometer` `places` | the number inside an object, like 47 in a stopwatch (VM V14) · equation of tiles joined by × and = (NS 11) · rolling star counter on a repo card (RL 19–33) |
| a share / proportion | "17%", "most of them", "one in five" | `places` | waffle of 100 (NR) · two squares sized to the split, 85/15 (NR) · donut or honeycomb split (NR) |
| sizes compared | "ten times longer", "it never stops growing" | `lengths` | two objects drawn to scale (NR) |
| before → after | "it used to… now it…", "v1 vs v9" | `morph` `compare` `radar` `scale` | same object drawn twice, labelled bad / good (VM V1) · progress bars, 3 months ago vs now (NS 19) |
| don't do X, do Y | "stop doing X", "not this, this" | `compare` | crossed out → replacement (VM V11, NS 17) · struck chip then the accent chip (FC) · competitor logos with a red slash (RL 01, 18–33) |
| options / a set of three | "three ways", "you could… or… or…" | `trio` `fork` | three doors (NR) · three boxes, one ticked, with a name for the answer (VM V13) · icon grid that grows or swaps (NS 14) |
| a choice / fork | "you can wait, or you can act" | `fork` | three doors (NR) |
| a process / steps | "first… then… then…" | `loop` `stairs` | steps on a line, with the chaos they replace scribbled above (VM V8) · chip → arrow → chip flow row (FC) |
| a bottleneck / filter | "everything waits on one step", "AI picks one" | `funnel` | — |
| hidden work | "what people see vs what it takes" | `iceberg` | — |
| levels / hierarchy | "level one… level three", "seniors stay, juniors go" | `stairs` | ladder, a rung swapped for a bot (NS 18) · foundation stack (VM V6) |
| from here to there | "the thing that gets you from A to B" | `bridge` | tightrope between ✗ and ✓ (VM V10) |
| a trade-off / balance | "trying vs not trying", "worth it" | `scale` | — |
| a trend over time | "it keeps going up", "then it dropped" | `lengths` | sketched curve with one callout: hockey stick, bell, dip (VM V7, NS 10, NR) · timeline, then vs now (NS 21) |
| time passing / consistency | "every week for a year", "a decade from now" | `calendar` `journal` `shelf` `odometer` | — |
| what it's made of | "it comes down to four things", "skills" | `radar` `marks` | concept map round a person (NS 20) · room that furnishes itself (NC) · layers with cubes passing through (NR) |
| a plan / outline | "here's the list", "we've done two of five" | `spine` `marks` | running checklist that returns with ticks (NS 6, NC) |
| the app it happens in | "you get a call", "you search for…" | `phone` `chat` `search` `ad` `answer` | iMessage thread · email in an inbox · banking balance · notification feed · dashboard (all NR) · terminal typing the prompt (RL 01, NC) · map with pins and a lead counter (RL 01) · 2FA screen (NS 12) |
| AI does the work | "it runs while you sleep", "the agent writes…" | `chat` `answer` | meeting grid turning into a to-do list (NC) · grid of bots (NS 14) · terminal typing (RL 01) |
| money / cost | "it cost me…", "$12k a month" | `receipt` `count` | banking app balance (NR) · dollar figure counting, then logos landing (NC) |
| who you are / credentials | "on your CV", "what people know you for" | `resume` | dictionary entry for a made-up term (NR) |
| reach / being found | "it turns up everywhere", "people find you" | `search` `places` `phone` | map with pins (RL 01) |
| people / voices | "the people building AI say…", "the few who…" | `callouts` | voices strip, 2–3 people with a quote each (NS 4) · dim crowd, spotlight on a few (VM V15) |

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
