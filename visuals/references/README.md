# Visual references: everything in one place

Every reference the studio draws from, with one sheet each. What we **built** from them is in
[`../preview/README.md`](../preview/README.md) (every scene, by meaning); what we **plan** to build is in
[`../catalog.md`](../catalog.md) (meaning → built / not built yet, with the source key) and [`../plan.md`](../plan.md).

- Sheets are rebuilt by `python scripts/references.py`.
- `local/` is git-ignored: other creators' frames stay private reference on this machine (same rule as
  `videos/reference/*/frames`). The swipe sheet is tracked because its images already are.
- Borrow the pattern, never the drawing or the character. Our figure is the art library's cast
  (`scripts/library.py`, in videos through `broll/src/studio/cast.tsx`).

| key | source | what it's for | sheet | notes |
|---|---|---|---|---|
| **VM** | Darius Foroux illustrations, 36 images (`swipe/video slides (extra)/`) | one drawing carrying one idea: metaphors | [swipe-darius.png](swipe-darius.png) | patterns V1–V28 in `swipe/visual-metaphors.md`; all 28 built (2026-10-31) |
| **NS** | Nick Saraev, "How to survive AI" | the warm-paper studio look, 22 scene kinds | `local/nick-survive-ai.jpg` | [teardown](../../videos/reference/2026-10-15-nick-saraev-survive-ai/teardown.md) |
| **FC** | FieldCamp, AI receptionist | chips, flow rows, the 3-layout grid | `local/fieldcamp.jpg` | [teardown](../../videos/reference/2026-10-22-fieldcamp-ai-receptionist/teardown.md) |
| **NC** | Nick Saraev, "How to use AI like a top 0.1% CEO" | studio mode: face tile, layouts, motion, colour | `local/nick-ceo-ai.jpg` | [teardown](../../videos/reference/2026-10-28-nick-saraev-ceo-ai/teardown.md) |
| **AY** | aayusucks, "Typography without bullsh*t" | text over him when full frame, type cards | `local/aayusucks.jpg` | [teardown](../../videos/reference/2026-10-29-aayusucks-typography/teardown.md) |
| **NR** | Nick Saraev, three recent videos | a picture per idea: 3D metaphors, simulations, real UI | — (read off YouTube storyboards, nothing saved) | [teardown](../../videos/reference/2026-10-30-nick-saraev-recent/teardown.md) |
| **SB** | Nick Saraev, "Second brain w/ Claude" | systems diagrams: pipeline, sources, context window | `local/nick-second-brain.jpg` (+ `local/nick-second-brain/M00–M16.png`, the storyboard sheets) | [teardown](../../videos/reference/2026-10-31-nick-saraev-second-brain/teardown.md) |
| **RL** | Nick Saraev, 49 reels | reels: split panel, captions, hooks, CTA | `local/reels-49.jpg` | `reel-creator/reference/` (07_visual_breakdowns, 06_analysis) |
| **PM** | prompt-motion.com, 236 AI-made motion videos with their prompts | motion-graphics templates: promos, reels, titles, explainer beats, charts, UI, type | `../motion/local/sheets/` | [index](../motion/README.md) · [by use](../motion/by-use.md) · `python scripts/promptmotion.py` |
| — | our reel design | the 9:16 look we settled on | `local/reel-design.jpg` | `reel-creator/design/README.md` |
| — | okaashish carousels (`swipe/others/okaashish/`) | carousel layouts | — | carousels only |
| — | 30 carousel styles for the new TMV look (2026-11-02) | news, data, quote, logo and tool slides | — | [list](../../swipe/tmv-carousel-styles.md); screenshots go in `swipe/others/tmv/` |

## Adding a reference

1. Tear it down into `videos/reference/<date>-<slug>/teardown.md` (frames in its `frames/`, local).
2. Add its sheet to `scripts/references.py` and a row here, with a key.
3. Every visual worth keeping goes into `../catalog.md` under its meaning, with the key, and gets a batch in
   `../plan.md`. Nothing is built straight from a reference.
