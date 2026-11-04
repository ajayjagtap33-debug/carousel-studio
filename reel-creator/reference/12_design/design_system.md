# Design system: layouts, typography, colour, graphics

Visual references: [style_board.jpg](style_board.jpg) (15 annotated frames) and [palette_swatches.png](palette_swatches.png). Per-reel detail is in `../07_visual_breakdowns/NN.md`. Fonts are identified by eye; the exact families are unconfirmed.

> **Three template eras.** The reels span Aug–Oct 2026 and the look evolved.
> **Replicate the newest era (reels 01–17, Oct)** unless you want the older feel.
>
> | Era | Reels | Accent | Signature |
> |---|---|---|---|
> | **Newest** | 01–17 | **Blue** (#1E8FFF box, #3B8CF0 / #8EC5FF italic serif) | Two-line hook title (black sans + blue-boxed italic serif). macOS browser cards with a glowing blue border. "Plugin Number One" cards. |
> | Mid | 18–33 | **Claude orange / coral**, plus the brand colour of the tool | Custom motion-graphic cards, orange pixel Claude mascot, ALL-CAPS italic serif keywords, gradient "it's called" labels, rolling counters |
> | Oldest | 34–49 | **Coral + cyan glow** | Off-white canvas with a palm-leaf shadow, "PLUGIN INSTALLER" graphic, "THE FIRST" ordinal tiles, light-leak flashes |
>
> The account features more than one on-camera look/presenter across shoots. The edit template is identical regardless.

## 1. Canvas & layouts (9:16, 1080×1920)

| Layout | Share of screen time | Spec |
|---|---|---|
| **SPLIT** (base layout) | ~45% newest, ~26–31% older | Top ~45–55%: off-white canvas **#EEF0F2** with film grain and a soft **palm-leaf shadow** top-left, plus a floating card. Bottom ~37–55%: a **talking-head panel**, full width with **~40 px rounded top corners** and a soft shadow on the top edge, bleeding off the bottom. In older reels the hair is segmented so it **pops out** above the panel edge. **Caption on the seam.** |
| **DARK B-roll** | ~30–43% | Full-screen. The content card floats over a **heavily blurred, darkened, scaled-up copy of itself**, so the background tint follows the content. |
| **Full talking head (FTH)** | ~15–30% | Tight medium close-up (~1.6× tighter than in the split, so it reads as a punch-in). Captions at 70–85% height. Used as 0.8–3 s "breathers" plus the CTA. |
| **WHITE card** | ~10% | Pure white full-screen: section titles ("Plugin Number One", "It's Called") with the card and the tool name below. |

**Rules**
- The hook is always SPLIT: 49/49 reels open on a split.
- The CTA is always FTH: 49/49 reels end on a full talking head.
- Body alternates light ↔ dark layouts. Two FTH shots never sit back to back (except the CTA).

## 2. Typography

| Role | Font (approx.) | Style | Size @1080w | Colour | Position |
|---|---|---|---|---|---|
| **Hook title, line 1** | Inter Display / SF Pro Display **Heavy/Bold** | Title Case | 60–65 px | Black | y 12–22% |
| **Hook title, line 2** | **Playfair Display / DM Serif Display Bold Italic** (Instrument Serif Italic also plausible) | Title Case, inside a **solid highlight box** (radius ~4 px, ~16 px horizontal padding) | ~75 px | White text on **blue #1E8FFF** box (lime #D4F53C with black text for Higgsfield) | under line 1 |
| **Captions** | Same heavy sans | lowercase / sentence case | 80–95 px | Black on light, white + soft shadow on dark. No stroke or box. | SPLIT seam (y 46–56%); DARK y 65–73%; FTH y 70–85% |
| **Accent word** (~1 per phrase) | Italic serif | lowercase | same | Blue #3B8CF0 on light / #8EC5FF on dark (newest); coral #D07957 (older) | inline |
| **B-roll keyword** (mid/old eras) | Condensed italic serif | **ALL CAPS** | large | black / white; coral or gradient for emphasis | y 65–72% |
| **Glow emphasis** | Small white italic serif line **stacked over** a big bold-sans word | — | — | Saturated colour + **outer glow** + motion-blur entrance | FTH, over the mic |
| **Section card** | "Plugin Number" black sans + "**One**" white italic serif in a blue box | — | — | — | top of a white card |
| **Product name** | Large black sans; second word often **grey** ("Prompt **Motion**", "Google Maps **Scraper**") | — | — | — | under a card |

**Caption animation**
- Words appear **one at a time**: each word fades/blurs in from ~30% grey to full colour.
- **1–3 words** on screen at once, and the block resets every phrase.
- No karaoke highlight and no bouncing.
- The hook title builds word by word and is complete by ~0.7 s; the box wipes left → right.

**Free font stand-ins:** Inter (Bold/ExtraBold/Black) + Playfair Display Italic, or Instrument Serif Italic for the condensed caps look.

## 3. Colour

Corpus-wide k-means over 678k pixels from every shot (`palette_extracted.json`):

| Base | Hex | Share |
|---|---|---|
| White | #FDFDFD | 18% |
| Near-black | #0B0C0F | 17% |
| Dark grey | #242325 | 12% |
| Light grey | #E5E7E9 | 10% |
| Sage wall | #A7AFA3 | 9% |
| Beige / kraft | #D0CCC5 | 9% |
| Warm brown / skin | #473E39, #C6937D, #8B5C4D | ~15% |

- **Saturated pixels make up only 2.4% of the frame.** The look is monochrome with **one accent hue per reel**.
- **Accents found:**
  - Claude coral **#D07957**
  - Blue **#5A9BED** / box blue **#1E8FFF**
  - Lime **#E2DD3E**
  - Mint/teal **#4EB09B**
  - Green #638E32
- **Accent rule:** default blue (newest) or Claude orange (older). Switch to the **featured product's brand colour** when it has a strong one (Higgsfield lime, DaVinci yellow).
- **CTA glow colour** follows the accent: blue, lime, green, yellow, cyan or orange.

## 4. Graphic elements (counts across 49 reels where measured)

| Element | Spec | Frequency |
|---|---|---|
| **Floating rounded card** | ~16 px radius, soft shadow | 49/49 |
| **macOS browser/terminal card** (traffic lights, URL pill) with a **2 px blue stroke, outer glow and light travelling around the border** | Newest era | 17/17 newest; rare before (3/32) |
| **Card over a blurred copy of itself** | DARK layout background | 38/49 |
| **Counter tile:** white rounded tile, big blue numerals + small grey label ("230 / real examples", "163k stars on GitHub") | Pops in over the card | 11/17 newest |
| **Rolling odometer digits** for stars, tokens, models | — | ~15/49 |
| **Blue text-selection highlight** inside screenshots / outlined box around a button | Points at the exact feature being said | ~33/49 |
| **Glowing coloured border** around a UI region | coral / yellow / cyan / lime | ~12/49 |
| **Orange pixel Claude Code mascot ("Clawd")** as a recurring character | Mid/old eras | 24/49 |
| **App-icon tile** (iOS rounded square + drop shadow) for the tool reveal | — | ~17/49 |
| **Red strike-slash** over a competitor logo/price | "Enemy" framing | ~7/49 |
| **Mouse cursor** clicking in the UI | — | ~11/49 |
| **Charts / gauges / bar comparisons** for stats ("↓ 50% ↓") | — | several |
| **Listicle openers**: "Plugin Number N" cards (newest), hand-drawn "1-2-3" arrows or the "PLUGIN INSTALLER" graphic (older), "N/total" badge | — | all listicles |
| **Kinetic text card** (huge black sans, grey faded line above, small pills) | — | rare |
| **Orange light-leak flash** (0.2 s) on a pivot word ("Plus", "So if you") | — | 4/16 oldest era |

## 5. Set & talent

- Plain painted wall (sage/grey-green or light grey), **soft window key light from camera-left**, and a **black foam-covered broadcast mic** on a shock mount in the lower frame.
- Plain dark/neutral top: hoodie, washed tee or sweatshirt. Changing the outfit marks a new batch-recording session; about 8 reels are filmed per session.
- Eye line at the upper third. Talking straight to the lens. Points down at the "comment" text in the CTA in ~half the reels.

## 6. CTA end frame (49/49)

```
           comment            ← small white italic serif
        "KEYWORD"             ← large bold sans in curly quotes, gradient fill + outer glow (accent colour)
     [over the mic, y 70-88%]   last 3-4 s, full talking head, often pointing down
```
