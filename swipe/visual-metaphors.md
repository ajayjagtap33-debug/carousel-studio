# Visual metaphor library

Patterns, not drawings. Source: `swipe/video slides (extra)/` (36 unique images; four are
exact duplicates with a ` (1)` suffix). All are by one creator (Darius Foroux): 4:3 stick-figure
illustrations made for articles and videos. They aren't our Excalidraw theme. Borrow the
**mechanism** (how one drawing carries one idea). Never trace a drawing or copy the stick figure.
Our cast is `person.*` / `bot.*`.

Ref key: first 6 characters of the filename (`0_xh8Z` = `0_xh8Z6ujMEeaXJfXu.webp`).

---

## Why they work

- **The drawing is the slide.** About 5–12 words in total, mostly labels of 1–3 words. The idea
  lands without reading any body text. This is the strongest argument for our "drop the body if the
  diagram already says it" rule.
- **The title is a two-beat aphorism** above the drawing: "Do less. Finish more." / "Old method.
  New rules." / "Same hours. Different output." It works as a headline or as the payoff line.
- **Colour has a meaning, and it's always the same:** red/orange = before/bad, green = after/good,
  and one yellow marker swatch behind the key word. A coloured underline on a label shows which
  side that label belongs to.
- **One stick figure is the stand-in for the reader** and does the verb: walks out the door, runs
  at the dangled dollar, balances on the tightrope.
- **The figure sits in plenty of white space,** centred and taking up about 60% of the frame. A few
  motion ticks and sparkles add emphasis.

## Patterns

| # | Pattern | Mechanism | Refs | Our renderer today |
|---|---|---|---|---|
| V1 | **Two states, side by side** | The same object drawn twice (healthy/pruned tree, leaking bucket/pipe, cluttered/clear path), each with a coloured label and one shared tagline underneath | 0_xh8Z, 0_Zw4e, 1_Lft-, 1_lyO0, 1_HidB, 1_xudy, 0_0_JO | `split` is data rows, not scenes → **gap** |
| V2 | **Fork** | One starting dot splits into two curved paths. Each path is labelled with a verb (WAIT/ACT) and ends in a result (✗ regret / flag) | 1_B5WO | **gap** |
| V3 | **Funnel / filter** | Many inputs go in, a question or criterion sits on the funnel, one output comes out, and the rejects fall into a scribble or a bin | 1_bM_M, 1_Bdg8 | **gap**. Fits AEO well: pages → "AI picks" → cited |
| V4 | **Iceberg** | A visible tip (what people see) above a big hidden mass with 5–6 labels under the waterline | 0_MrwiS | **gap** |
| V5 | **Staircase / levels** | 3–5 rising blocks, numbered and named. The top one gets a hand-written callout | 0_cpOU | `layers` stacks; a rising staircase is a **gap**. Pairs with the hooks.md H3 "levels" pattern |
| V6 | **Foundation stack** | 3 stacked blocks, widest at the bottom, with an arrow on top naming the outcome | 1_UC0D | `layers` ✓ |
| V7 | **Sketched curve + one callout** | A hand-drawn axis with one shape (bell curve, hockey stick, peak-then-drop) and 1–2 arrows naming the key point ("your limit", "the long part") | 1_JVgo, 1_rTbM, 1_WFdg, 1_xudy | `bars` only → **gap** (`curve`) |
| V8 | **Steps on a line** | 3 filled circles on an arrow (BUY → HOLD → REPEAT), with the chaos they solve drawn above as a scribble | 1_7UUl | **gap** (`flow`) |
| V9 | **Equation / ≠** | A ≠ B (or A = B) with a small icon under each side. The shortest slide possible | 1_Ujio, 1_Nlim | **gap**, and cheap to build |
| V10 | **Bridge / gap** | A start point, a destination, and the thing that connects them labelled on the bridge (work → *personal brand* → opportunities). Variants: a dashed line now → could be; a tightrope between ✗ and ✓ lists | 1_owVc, 1_N6rt, 1_PPmZ | **gap** |
| V11 | **Crossed out → replacement** | The old way is struck through in red, with an arrow to the new way ("PLANNING" ✗ → SHIP this week) | 1_siiF, 1_sgvp, 1_SAPl | `cross` doodle exists; no layout for it → **gap** (`swap`) |
| V12 | **Characters + bubbles** | Two figures, a speech bubble and a thought bubble that disagrees with what's said. Also: me → AI clone at a laptop | 0_mf0b, 1_oA7F | ✓ via `person.*` + `bot.*` + `bubble`/`thought` art. 1_oA7F is basically our cast |
| V13 | **Pick one of three** | 3 empty boxes with labels, one big ✓ on the right answer, and a name for the result ("the quiet score") | 1_ZRjN | `checklist` is a list → small **gap** |
| V14 | **Drawn object as the stat** | The number lives inside an object (47 in a stopwatch), then branches into two outcomes | 0_zFAH | `stat` is a plain number. Matches the memory note: chart-like over plain stats |
| V15 | **Few vs many** | A dim crowd plus a spotlight on 4 named people | 1_quPu | **gap** (could reuse `people` doodle) |
| V16 | **Trap** | The figure chases a lure (a dollar on a stick) towards a hole it can't see | 0_qwWa | Library art only; no new VIS type needed |
| V17 | **Key and lock** | The old key is shown next to a new key that fits the new lock ("tomorrow") | 1_Gvvf | Library art only (key/lock doodles) |
| V18 | **Event vs reaction** | The fact on one side of a dashed divider and the escalating reaction on the other, with "you control this" pointing at the gap | 1_Y9hW | ≈ V1 |

## For carousels (4:5) vs video/presentation (4:3, 16:9)

- **4:5:** stack V1/V2/V10 vertically (before above, after below), or keep them side by side at
  ≤ 2 words per label. The headline takes the top slot, so the two-beat aphorism becomes the
  headline and the drawing has no title of its own.
- **Video/presentation:** these refs are already the right shape. Our renderer only outputs
  1080×1350, so 16:9 slides would need a canvas-size option in `theme.json` + `render.py`.
  Not built yet.

## Candidate additions (Ajay to pick; per CLAUDE.md, new types go into `VIS` first)

Ordered by how often they'd get used on SEO/AEO/AI topics:

1. `versus` (V1/V11): two drawn scenes or crossed-out → new, coloured labels, one shared tagline
2. `funnel` (V3): inputs → criterion → output + rejects
3. `curve` (V7): one hand-drawn line shape + 1–2 callouts
4. `equation` (V9): A ≠ B with icons
5. `flow` (V8): 3–4 steps on an arrow
6. `iceberg` (V4), `fork` (V2), `bridge` (V10), `stairs` (V5)

Theme: a **marker highlight** swatch behind one headline word (yellow, like 1_lyO0 "options") as an
alternative to `{"c": "accent"}`. Doodles worth adding to the library: bucket, funnel, key,
padlock, door, flag, megaphone, stopwatch, bin.
