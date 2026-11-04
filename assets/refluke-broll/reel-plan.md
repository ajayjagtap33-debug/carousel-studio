# Refluke reels — plan for the vertical b-roll layer

A 9:16 layer for Instagram Reels and YouTube Shorts: 40–60s, fast-paced, **the same muted-green
Refluke theme and the same scene library** as the horizontal system in `library.md`. This is a
plan, not a build. Written 2026-10-25.

The whole design is driven by one fact that doesn't apply to long form: **a third of the screen
belongs to the platform, not to us.**

---

## 1. The frame, and what the platform takes

Canvas is `1080 × 1920` on every platform (Reels, Shorts, TikTok, Facebook Reels) — one master
works for all of them.

Published safe zones disagree, so here is the spread rather than one borrowed number:

| source | top | bottom | sides |
|---|---|---|---|
| Meta's own ad guardrail | 269px (14%) | **672px (35%)** | 65px (6%) |
| Instagram organic (common guidance) | 220–250 | 320–430 | 120–130 |
| YouTube Shorts | ~110 | ~420 (25%) | ~140 (right rail) |

Meta's 35% bottom is for **paid** placements and is far more conservative than organic needs.
Reddit creator threads report the bottom ~320px went dead when captions expanded.

**Proposed working numbers** — the union of IG organic and Shorts, plus a little margin:

```
safe box   x 140 → 940   (800 wide)
           y 260 → 1440  (1180 tall)

top 260 · bottom 480 · sides 140
```

So the usable stage is **800 × 1180**. For comparison the horizontal stage is 1340 × 940 — the
reel is **40% narrower**. That single number drives most of what follows.

## 2. The inversion

In 16:9 we keep **a side** clear and Ajay sits there. That cannot work in 9:16: the right edge is
exactly where the like/comment/share rail lives, so a face parked right would fight the buttons.

In 9:16 it flips:

> **Graphics live in the top. The face lives in the bottom.**

This works precisely *because* the bottom is the unsafe zone — a caption or a username over part
of a face is normal and readable; the same caption over a chart is not. The platform UI and the
face want the same real estate, and that is fine.

## 3. Placements

Seven, covering everything Ajay described. `reel` placements are a separate set from the
horizontal ones — a `tab-right` makes no sense here.

| placement | graphics | face | reach for it when |
|---|---|---|---|
| `top` | upper block, y 260–1040 | full-frame behind, visible below | **the default.** A point that needs a visual while he keeps talking |
| `full` | the whole safe box | hidden | the visual *is* the beat — a number, a chart, a statement |
| `bubble` | upper block | a circle ~340px, bottom-left or bottom-right, above the caption zone | he's explaining detail and you still want his face |
| `card` | one transparent card anywhere in the safe box | full-frame behind | a chip or callout dropped over him mid-sentence |
| `band` | a strip across the middle, y 820–1180 | visible above *and* below | a one-line idea that shouldn't cover him |
| `split` | hard 50/50, top half | fills the bottom half | a before/after or a comparison that wants equal weight |
| `lower` | a card low in the safe box, y 1150–1430 | full-frame behind | a line that belongs under him, not over him |

**Rotation**, as in the horizontal system: no two consecutive beats share a placement. Over a
60s reel expect roughly `top` ×10, `full` ×6, `card` ×5, `bubble` ×4, `band` ×3, `split` ×2,
`lower` ×2.

## 4. Pacing — the real difference

This is not the horizontal system at a different aspect ratio. The clock changes.

| | long form | reel |
|---|---|---|
| Beat length | 4–8s | **1.5–3s** |
| Beats in the piece | ~15 in 7 min | **20–35 in 60s** |
| Element cadence | one per 1–3s | **one per 0.4–1.0s** |
| Minimum beat | 2.0s | **1.2s** |
| Entrance | blur → sharp, ~0.35s | **faster, ~0.18s** — a slow entrance eats a third of the beat |

Sources converge on cutting to a new shot every 1.5–3s for short form, trimming every pause over
0.4s, and punching in 10–15% on each new point. The last one is an editing move in Vids, not ours,
but it means **our beats should align to his cuts**, not float across them.

One structural finding worth taking: for educational and business content, talking head
outperforms b-roll, and the pattern that works is **open and close on his face, carry the middle
with b-roll**. That argues for beat 1 having no graphic at all.

**Open question for Ajay:** that conflicts with the "hook in the first second" instinct, where a
text hook on frame 1 stops the scroll. Which one wins is his call, and it changes the template.

## 5. Which of the 44 scenes port

Measured, not guessed — `grep` over the hardcoded widths in `scenes.tsx` / `scenes2.tsx`.

**11 of 44 have a hardcoded width over the 800px safe width** and need real work:

`spine` (1140) · `cited` (1340) · `pullquote` (1340, 1160) · `docs-page` (1340) ·
`chatpills` (880) · `terminal` (820) · `gallery-chips` (820) · `seesaw` (1000) ·
`honest-feedback` (1140) · `laptop-tiles` (1020, 900) · `screen` (1200)

**A further group fits on paper but lays out as a horizontal row** that will be cramped at 800px,
and wants a stacked variant: `flow` (3 nodes + arrows ≈ 1070), `ceo-row` (3 × 270 + gaps ≈ 900),
`chart-row` (3 cards), `cost-compare`, `ea-concept` (≈ 900), `token-chips`, `before-after`,
`loop`, `branch`, `todo-avatars`, `transcript-card`, `strike`, `logo-tiles`, `company-icons`.

**The rest — around 20 — reflow as-is**, because they use `width: "100%"` and flex.

**Probably not worth porting**, being wide by nature: `gallery-chips`, `docs-page`,
`youtube-card`, `isometric-room`, `funnel`, `authority` (four portraits across will not fit),
and `screen` — a 16:9 screen recording inside 9:16 is a letterboxed strip. For reels a screen
recording wants to be a **cropped region** shown large, which is a different scene, not this one.

## 6. Architecture — how to add this without breaking the horizontal system

**Do not fork `refluke/` into `refluke-vertical/`.** Forking 44 scenes guarantees they drift.
Add orientation as an axis instead:

1. **`broll.json` gains `"format": "reel"`** (default `"wide"`). It is *not* a new `style` —
   same theme, same validator, same scene registry.
2. **`theme.ts` gains a frame table**: `FRAMES = { wide: {...}, reel: {...} }` holding the canvas,
   the safe box, the placement set and the type scale. `BOX` and `FACE_ZONE` become per-format.
3. **Scenes read their content width from context** (`useFrame().contentW`) instead of hardcoding
   1340/1140. That is the bulk of the work, and it improves the horizontal side too — those
   numbers are magic constants today.
4. **A `stack` helper** so a scene can declare "row on wide, column on reel" in one place rather
   than branching in 14 scenes.
5. **`Root.tsx` gains `ReflukeReelSample`** at 1080×1920. The real composition already sizes
   itself from `media`, so a vertical cut makes a vertical render with no extra work.
6. **`check_refluke()` gains**: the reel placement set, the reel pacing floor (`MIN_SCENE` 1.2),
   and a warning when beats average over 3s — too slow for the format.
7. **The lint gains a platform-safe-zone rule.** This is new and genuinely valuable: *"text enters
   the caption zone"* and *"text sits under the action rail"*. You cannot eyeball that reliably on
   a laptop, and it is the single most common way a reel graphic gets ruined.

Rough order: frame table → content width from context → the ~20 clean scenes → the stacked
variants → the 11 rewrites → lint → validator.

## 7. The input flow Ajay described

Screenshot + MP3 of the script, and I plan where the overlays go. That needs no new machinery —
it is the existing pipeline with the orientation flag:

```bash
python3 scripts/broll.py transcribe videos/<folder>   # MP3 → transcript.json
# → beat sheet (broll-plan.md + broll.json), stops for approval
python3 scripts/broll.py check  videos/<folder>       # types, sources, placement variety, safe zone
python3 scripts/broll.py sheet  videos/<folder>       # one still per beat
python3 scripts/broll.py render videos/<folder> --clips
```

**What the screenshots are for:** the frames he sends tell me where his face actually sits in the
shot and what is behind it. That decides `bubble` vs `top` vs `card` per beat — a `card` over a
busy background needs the opaque version, over a plain wall it can be transparent.

**What I'd need from him per reel:** the MP3, 2–3 stills from the actual take (not a different
shoot), and whether the face is centred or offset in frame.

## 8. Open questions — answer these before any code

1. **Hook beat**: graphic on frame 1 to stop the scroll, or his face alone for the first 1.5s as
   the retention research suggests? Changes the template.
2. **Burned-in captions**: does he add them in Vids? If so our graphics must clear the caption
   band *he* adds, which is usually higher than the platform's — that tightens the safe box
   further and I'd want to see one of his finished reels to measure it.
3. **One master or two exports?** The safe zones differ (Shorts tolerates ~60px more at the top).
   One conservative master for both, or a per-platform export?
4. **Does a reel reuse a long-form beat sheet**, or is it always written short-first? If reels are
   cut down from long form there is a case for one plan with two renders.
5. ~~Type scale.~~ **Settled 2026-10-25 — see §9.**

## 9. Type scale — settled

Rendered at 1080×1920 and judged by eye: `assets/refluke-broll/reel/` (`ruler.png`,
`cmp-spine.png`, `cmp-statement.png`), built by `scripts/reel_typescale.py`.

| role | wide | **reel** | note |
|---|---|---|---|
| Headline (Playfair) | 46–96 | **72–80** | 88 starts touching the safe edge; 56 reads timid |
| Row / list text | 33 | **40** | all five spine rows still fit; 46 loses one |
| Body / secondary | 26–30 | **32** | |
| Eyebrow | 21 | **28** | |
| Mono source | 20 | **26** | |
| Lint floor | 24 / 20 | **32 / 26** | |

**The jump is much smaller than I assumed in §8.5, and that claim was wrong.** I compared against
the 24px *lint floor*, but the horizontal system almost never sits at the floor — its rows are
33px and its secondary text 26–30px. So the real change is about **1.2×** on body, and headlines
barely move. Most scenes will survive the scale change; what hurts them is the narrower box, not
the bigger type.

**Copy limits at these sizes** (measured off the renders, so treat as close rather than exact —
the lint will enforce the true limit):

- 40px body in the 800px box → **about 50 characters per line**
- 48px → about 42
- 72px Playfair headline → **about 20 characters per line**

**One thing the renders showed that the plan had wrong.** In every frame the content sits in the
upper part of the safe box and the lower half is empty — which is correct, because that is where
his face goes. So the graphics block is not the full 800 × 1180 safe box; it is roughly
**800 × 640, from y 260 to y 900**. Scenes should be authored to that, and the lint should enforce
it, or beats will quietly fill the whole safe box and collide with his face.
