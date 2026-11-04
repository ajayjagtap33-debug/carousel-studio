# Batch summary — reels 01–17 (visual editing style)

Sources: the contact sheets, about 45 individual shot frames, plus extra frames I extracted from 01_videos with OpenCV (a hook strip at 0.03/0.3/0.7/1.2/1.9 s for every reel, frames at −0.2/−0.07/+0.02/+0.1/+0.25 s around every detected cut, and CTA frames). Layout codes are defined in 01.md.

## 0. Headline numbers
| metric | value |
|---|---|
| Duration | 23.6–47.6 s, mean 34.7 s |
| Detected shots | 6–18, mean 10.7 (182 total) |
| Cuts per 10 s | median 2.70 (range 2.14–5.97; the 3 fast reels are 08, 13, 17, all montage-heavy) |
| Avg shot | ≈3.7 s. **Caveat:** in-card B-roll swaps inside a SPLIT are often *not* detected as cuts, so the real "visual change" rate is about 1 per 1.5–2 s |
| Speech | median 264 wpm (231–290). Speech starts at frame 0 in 17/17 |
| Music bed | speech sits 3.8–12.7 dB above the bed between words (median 7.8 dB), so there is a quiet, constant music bed |
| First hard cut | median 3.3 s (1.7–6.1 s) |
| CTA length | median 3.7 s (2.7–5.6 s), always the last shot |

## 1. Two presenters, one template
- **Nick**: 9/17 (01–08, 13). Black hoodie, black podcast mic in frame, light-grey wall + beige chair. Reel 13 uses a grey seamless backdrop with no mic.
- **Presenter B**: 8/17 (09–12, 14–17). Curly dark hair, charcoal washed tee, bright pale-green/white room, no visible mic. **I can't tell from the frames whether Presenter B is Nick on another day or a different creator.** The editing template is identical for both.

## 2. Layout usage (count of reels using each at least once)
| layout | reels | notes |
|---|---|---|
| SPLIT (light, card top + head bottom) | **17/17** | It is the base layout and also the hook layout in 17/17 |
| DARK full-screen B-roll (cards over a blurred, darkened copy of the footage) | **16/17** | Not in 17 (it uses FULL gameplay instead) |
| FTH mid-video (not counting the CTA) | **13/17** | Absent in 06, 11, 12, 17. Usually 1 per reel (03 has 2) |
| WHITE full-screen card (no head) | **10/17** | 01, 02, 05, 08, 09, 10, 11, 12, 13, 14 |
| ↳ "Plugin/Tool Number N" section cards | 3/17 | All 3 listicles (01 ×4, 05 ×3, 14 ×5) |
| ↳ "It's Called" / "A New … Tool" naming card | 3/17 | 10, 11, 13 |
| FULL-bleed footage (no card) | 1/17 | 17 only |
| FTH CTA | **17/17** | |

Typical time split: SPLIT ≈ 45 %, DARK ≈ 30 %, FTH ≈ 15 % (including the CTA), WHITE ≈ 10 %.

## 3. Common shot-sequence template
```
0.0  SPLIT HOOK  – 2-line title (black sans + highlight-box italic serif) + demo card; captions from frame 1
~3s  CUT → FTH punch-in (1-1.5 s, CTA-style glow on the key phrase)   [or straight to DARK]
     DARK  – "It's called X" + GitHub repo / product page + stars counter tile
     SPLIT – how it works #1 (UI, highlighted text, cursor)
     DARK  – how it works #2
     SPLIT – feature / proof (counter, generated mock UI)
     (DARK/SPLIT alternate every 2-6 s, ~1 B-roll beat per spoken clause)
last 3-4 s  FTH CTA – 'comment "KEYWORD"' glow, pointing down
```
Listicle variant (01, 05, 14): hook, then for each item [WHITE "Plugin Number N" → SPLIT/DARK with an "N/total" badge], then the CTA.

The SPLIT ↔ DARK alternation is the core rhythm. Of 168 non-hook, non-CTA shot transitions, roughly 60 % switch between a light and a dark layout (my estimate from the shot tables, not a precise count).

## 4. Typography spec
- **Title (hook only, 16/17)**: two centred lines at y ≈ 12–22 %.
  - Line 1: black heavy grotesk sans (Inter Display / SF Pro Display Bold-like), Title Case, ≈60–65 px at 1080 w.
  - Line 2: white **bold italic high-contrast serif** (Playfair Display / DM Serif Display Italic-like), ≈75 px, in a solid highlight box with small (~4 px) corner radius and ~16 px horizontal padding.
  - Box color: blue (#1E8FFF-ish) in 14/16, lime (#D4F53C-ish) with black text in 2/16 (08 and 13, both Higgsfield, where it matches the brand).
  - Animation: words fade in from light grey one at a time; the box wipes left→right and then its text appears; complete by ≈0.7 s. The title stays for the whole first shot and sometimes animates out (05).
- **Captions**: the same heavy sans, sentence/lowercase, ≈80–95 px (≈4.5–5 % of frame height), centred. **Word-by-word reveal**: each new word blurs/fades in from 30 % grey to full, 1–3 words on screen at once, and the block resets every phrase.
  - Position: SPLIT y ≈ 52–56 % (between card and head), DARK y ≈ 70–73 %, FTH y ≈ 70–85 %, WHITE under the card.
  - Color: black on light, white on dark. No stroke or box, only a soft shadow on dark backgrounds.
- **Accent word**: about 1 per phrase, in *italic serif* in the accent color (blue #3B8CF0 on light, light blue #8EC5FF on dark; lime in 08/13).
  - Variants: blue **bold sans** for numbers and some words ("**12** skills", "**90**", "insanely", "free") in 4/17; **black** italic serif in 3/17 (07, 11, 14).
- **Glow emphasis (CTA style)**: small white italic serif line stacked over a large bold sans line in a saturated color with an outer glow.
  - Used in the CTA 17/17, and mid-video on FTH in 7/17 (02 yellow, 04 yellow, 07 green, 08 lime, 09 pink-red, 13 lime, 16 blue).
- **Section cards**: "Plugin Number" / "Tool Number" in black sans, plus the number word in an italic serif blue box, plus the tool name in large black sans under the card.

## 5. Graphics and overlays (counts)
| element | reels |
|---|---|
| macOS browser/terminal card (traffic lights, URL pill), ≈16 px radius, 2 px blue stroke + outer glow + travelling light segments on the border | 17/17 (17 uses a plain grey stroke; 08/13 use a lime stroke) |
| White counter tile with big blue numerals ("163k stars on GitHub", "230 real examples", "~90ms") or a big gradient number on dark | 11/17 (01, 02, 03, 04, 05, 06, 07, 10, 14, 15, 16) |
| Rolling odometer digits | 3/17 (01, 02, 04) |
| "N/total" pill badge on the card | 2/17 (01, 14 — listicles only; 05 has none) |
| Blue selection-style text highlight inside screenshots | ≈13/17 |
| Outlined element box (rounded rectangle around a button/word) | ≈7/17 |
| Visible mouse cursor | ≈8/17 (mostly Presenter B reels) |
| Red strike-slash on a competitor logo or text | 3/17 (01, 11, 09) |
| Generated/designed mock UI instead of a real screenshot | ≈9/17 (heavy in 02, 03, 04, 08) |
| Real-world photo | 1/17 (06) |
| Portrait video cards / montage | 2/17 (13, 17) |

- DARK background is always a heavily blurred, darkened, scaled-up copy of the current footage, so its tint follows the content (blue in 06, lime/black in 08).
- SPLIT background is off-white #EEF0F2 with film grain and a soft palm-leaf shadow in the top-left. The head panel has ≈40 px top corner radius and bleeds off the bottom.

## 6. Color
- The palette is light-dominant in 12/17. The dark-dominant ones are 06, 08, 11, 13, and 17 (gameplay greens).
- Constant neutrals: #EEF0F2 off-white (25–48 %), #0C0C13 near-black (15–37 %), skin/wall mid-tones.
- The accent is a single hue per reel: blue in 15/17, lime in 2/17. Accent pixels are only 1–3 % of the frame, so they are used sparingly.
- B-roll is a mix of light-mode web pages (GitHub, docs) and dark-mode terminals and apps, so the light/dark alternation comes partly from the content.

## 7. Transitions
- **Hard cuts dominate: ≈90 % of detected cuts.** SPLIT ↔ FTH reads as a punch-in/out because FTH framing is about 1.6× tighter.
- New cards **pop/blur-in** (a blank or blurred placeholder resolves to the screenshot in about 0.1–0.25 s, with a slight scale-up). This happens in essentially every reel.
- **Horizontal slide/push with motion blur** between cards: 6/17 (03, 11, 12, 14, 17, plus a vertical one in 06).
- **Cross-dissolve** (WHITE → DARK/SPLIT with the card carried over): 3/17 (01, 05, 08).
- One-offs: glitch/pixel-block (09), white/inverted flash frames on the beat (13), in-card dip-to-black (16), title animate-out (05).
- No zoom-blur, spin, or whip-pan transitions on the presenter were seen.

## 8. CTA (17/17 identical structure)
- Final FTH close-up, last ≈3.7 s. He points down at the text in ≈12/17.
- Small white italic serif "comment" sits over the keyword in **quotes** in a large bold sans with a strong outer glow, at y ≈ 78–88 %.
- Glow color: light blue 8/17 (all 8 Presenter B reels), lime/yellow-green 4 (05, 06, 08, 13), green 2 (01, 07), yellow 2 (02, 04), cyan 1 (03).
- Spoken formula (17/17): "(So if you want to try it / Want to try this for yourselves?) Just comment X down below, and I'll send/DM you the link directly."

## 9. Outliers and uncertainties
- **17**: no title header, full-bleed gameplay montage, lowercase "i" captions, grey card stroke, "full guide" CTA.
- **08 and 13**: brand re-skin (lime) and the highest cut rates. 13 is on a different set.
- **11, 12**: no mid-video FTH. 12 is the simplest reel (6 shots).
- **16**: the mid-video FTH reads "comment / free" while he says "completely free" (likely a template carry-over).
- **06, 16**: the stars numbers on screen (23,400 and 156k) don't match the voiceover (16,000 and 40,000), probably updated screenshots.
- Fonts are identified by eye; the exact families are unconfirmed.
- Shot counts from scene detection miss in-card swaps and overcount gameplay or B-roll-internal cuts (13, 17).
- Presenter B's identity is unresolved.
