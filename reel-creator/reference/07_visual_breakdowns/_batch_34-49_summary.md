# Batch 34-49: recurring visual patterns

Scope: 16 reels (Aug 22 to Sep 11), 261 detected shots. Method: contact sheets plus about 45 individual 360x640 stills, the analysis JSON and the transcripts. Each shot is one still, so motion, transitions and text that appears late in a shot are inferred. Those cases are flagged.

## Headline numbers

| metric | min | max | mean |
|---|---|---|---|
| duration (s) | 28.5 | 54.8 | 37.8 |
| shots per reel | 11 | 24 | 16.3 |
| avg shot length (s) | 1.80 (47) | 3.30 (38) | 2.38 |
| cuts per 10 s | 3.03 | 5.56 | 4.29 |
| speech rate (wpm) | 205 (34) | 265 (42) | 240 |
| music bed under speech (dB) | 6.4 | 13.1 | 8.6 |
| cuts landing on an audio transient | 3 | 11 | 5.9 per reel |
| first shot length (s) | 0.97 | 2.60 | 1.80 |
| final CTA shot length (s) | 3.06 | 6.30 | 4.0 |

Speech starts at 0.00 s in 16/16 reels, so there is no silent intro.

## Layout usage (261 shots)

| layout | shots | share | reels using it |
|---|---|---|---|
| Full-screen B-roll (graphic or UI fills the 9:16 frame, caption mid-lower) | 111 | 43% | 16/16 |
| Full talking head (tight crop) | 76 | 29% | 16/16 |
| Split: B-roll top, pop-out head bottom | 69 | 26% | 16/16 |
| Light-leak flash (0.2 s) | 4 | 1.5% | 4/16 (37, 40, 43, 47) |
| Pure kinetic text card | 1 | 0.4% | 1/16 (41, "Agent Skills") |

How the split layout is built: the top ~45% is a flat canvas with a floating card, logo or graphic on it. The bottom ~55% is a panel with rounded top corners holding the talking head. The head is segmented so the hair breaks out above the panel edge (pop-out). The caption sits on the seam. This is a refinement of the "top/bottom split" seen in reel 01; in this batch it is not a browser card on every shot.

- Split is the first shot in 16/16 reels.
- Full talking head is the last shot in 16/16 reels.
- On a person's screen there is never more than about 3 s without a cut.

## Common shot-sequence template

1. **0-2 s, hook split.** A product logo/app icon, mascot graphic or UI card on top, with a 1-3 word caption. Spoken hook types: "X just launched/dropped" (40, 44, 49), "This free AI tool lets you..." (39, 42, 47), warning/fear (41, 43), "If you're tired of / If you want..." (36, 38), list promise (45, 46).
2. **2-5 s, product reveal.** Either a full B-roll "IT'S CALLED / THE FIRST" tile (app icon on a radial grey vignette, coral gradient serif label above, grey metallic name below; 5/16 reels: 37, 41, 42, 45, 46) or the GitHub README.
3. **Social-proof beat.** A GitHub stats card (stars, forks, watching) in 5/16 (39, 42, 44, 46, 49), with the number spoken as a caption ("30,000", "70,000", "180,000"). In 2 reels (39, 49) the card number does not match the spoken figure.
4. **Mechanism body.** It alternates on almost every phrase: full B-roll, then full talking head (1 accent caption), then split, then B-roll. List reels insert a talking head with "plugin no #N" or an ordinal tile at each item.
5. **Payoff stat or diagram.** Examples: gauge, bar chart, before/after values, flow diagram.
6. **Optional 0.2 s light-leak flash** at 56-86% of runtime, on the pivot word ("And", "Plus", "so if you").
7. **CTA, the last 3-4 s.** A full talking head with "comment" over the keyword in quotes.

## Typography spec

The caption system has three tiers. Captions appear phrase-by-phrase, 1-3 words at a time (rarely 4), synced to speech. There is no word-by-word karaoke colouring.

**Tier A: neutral words.**
- Font: bold grotesque sans (SF Pro Display / Inter Bold-like), sentence-case lowercase.
- Size: cap height about 6-8% of frame width.
- Colour: black on light canvases; white with a soft dark drop shadow on dark B-roll or video.
- Used on split seams and on talking heads. Present in 16/16 reels.

**Tier B: B-roll keywords.**
- Font: condensed high-contrast italic serif in ALL CAPS (Instrument Serif Italic / Playfair Display Italic condensed-like).
- Placement: centred at about y 65-72% of a full-screen B-roll.
- Colour: black on light, white on dark. Coral (#d9775f-ish) for the first word or emphasis ("CONSTANTLY", "FRONT", "4 FREE").
- Numbers use the same italic serif ("300", "2,000", "180,000").
- Present in 14/16 reels. It is absent in 34 and 35, the two oldest; those use sans only.

**Tier C: talking-head emphasis.**
- A small white italic serif lead-in ("plugin no #1", "completely", "so instead of") stacked over the stressed word.
- The stressed word is in bold sans, coloured, with outer glow and a motion-blur entrance.
- Glow colours: cyan in 10 reels, lime #e6ed34 in 35, peach/Claude-orange in 40. None was captured in 34, 38, 41 or 42.
- Present in 12/16 reels.

**Extras.**
- Ordinal labels with a coral-to-pink gradient ("THE FIRST", "THIRD").
- Grey metallic gradient product names.
- Animated number count-up (44, uncertain).
- Blue rounded label chips with white italic serif ("replica / original", 39).
- A lime blurred highlight pill behind a word (35).

**Placement.**
- Split: caption on the seam, about y 45-50%.
- Full talking head: just above or over the mic, about y 72-82%.
- Full B-roll: below the card, about y 60-72%.

## Graphics and overlays (reels using each)

- **Floating rounded cards** (corner radius about 3-4% of width, soft shadow, no device chrome): 16/16.
- **Card over a blurred, enlarged copy of itself** as the background: 11/16.
- **App-icon tiles** (rounded square, drop shadow): 14/16.
- **Off-white canvas with a soft palm-leaf shadow texture:** 10/16 (37, 38, 39, 41, 42, 44, 45, 47, 48, 49). Other canvases are pure white, beige (#ddd5c8) or near-black navy.
- **Orange pixel "Clawd" Claude Code mascot** as a recurring character: confirmed in 10/16 (34, 36, 40, 41, 42, 44, 45, 46, 48, 49), plus 37 possibly. Pixel/ASCII "CLAUDE CODE" logo: 4/16 (41, 43, 45, 47).
- **"Claude Code PLUGIN INSTALLER" graphic** with handwritten coral numerals and arrows: 4/16 (36, 41, 45, 46). It works as a list-count opener.
- **Glowing coloured borders around a UI region** (cyan, coral, yellow): 5/16 (36, 37, 41, 44, 45).
- **Blue text-highlight boxes in docs/tweets:** 5/16 (39, 43, 44, 48, 49).
- **Diagrams with connector lines or arrows:** 6/16.
- **Charts and gauges** (bar charts, 2-bar comparison, risk gauge, budget bars): 4/16 (41, 43, 45, 47).
- **Red diagonal strike-through** over bad examples: 1/16 (36).
- **Browser-window chrome:** only 39 (2 shots). Device mockup: 48.
- **Not seen in this batch:**
  - the "1/4" counter badge from reel 01 (0/16);
  - visible cursor highlights or arrows (only 1 cursor, in 34);
  - zoom-in punch indicators.

**Asset reuse.** 45 reuses the Omniroute sequence from 41 almost frame for frame, plus the welcome card and installer from 36. Graphics are templated per tool.

## Background, set and wardrobe

- **Set (16/16):** the same sage/grey-green painted wall, soft window key from camera-left, and a black foam-windscreen mic on a shock mount at lower centre.
- **Framing:**
  - Full talking head is a tight medium close-up: face about 65-75% of width, hair cropped at the top, mic covering the chin/chest.
  - In split shots the head and shoulders are smaller in the bottom panel.
  - Crop scale varies between talking-head shots, so punch-ins are likely, but this is unconfirmed.
- **Wardrobe by recording session:**
  - grey crewneck sweatshirt over a blue tee: 34-35;
  - charcoal acid-washed tee: 36-42;
  - olive/sage acid-washed tee: 43-49.
- **Houseplant** visible at bottom-left: 43-49 only.

## Colour

The palettes are consistently built from the same groups:

| colour group | example hexes | typical share |
|---|---|---|
| near-black | #0c0d0e to #131314 | 20-36% |
| near-white | #f7f7f7 to #fcfcfc | 15-40% |
| wall sage/grey | #9b9f8f to #a2a39b | 11-26% |
| warm brown/skin | (various) | 7-16% |

- Dark vs light B-roll is roughly balanced. 39, 44 and 48 lean light; 34, 38, 40 and 41 lean dark.
- The signature accent is Anthropic coral/orange, from the mascot, ordinal labels and borders.
- Talking-head emphasis is mainly cyan glow.

## Transitions

- **Hard cuts dominate,** about 95%+ of cuts.
- **0.2 s orange light-leak flash:** 4/16 reels, always once, in the back half of the reel.
- **Colour-grade ramp within one clip** (dark to red/orange) that the scene detector split into separate shots: 34, 41, 45.
- **Motion blur on accent words** suggests fast blur/scale-in text animations.
- No whips or slides could be identified from the stills (uncertain).

## CTA

- The last shot is a full talking head in 16/16 reels, usually 3.1-4.2 s long (6.3 s in 38).
- The text sits just above the mic:
  - a small white italic serif "comment" (seen in 14/16);
  - over a larger bold sans keyword in curly quotes;
  - the keyword has a white core with an outer glow: cyan in 7, lime in 35, peach in 40, and mid fade-in in 34/42/43.
- The keyword was visible in the sampled frame in 12/16.
- The spoken formula never changes: "So if you want to try it for yourselves, just comment X down below and I'll send you the link directly."
- There is no green glowing CTA in this batch, unlike reel 01. The glow colour seems to follow the reel's accent colour.

## Outliers

- **34:** sans-only captions, no serif tier, 9 full-bleed (not carded) screen recordings, slowest speech (205 wpm). It looks like an earlier template.
- **35:** lime accent, no serif caps tier.
- **38:** slowest cutting (3.03 per 10 s), with an 8.4 s B-roll shot.
- **40:** no caption on the hook shot, and a peach accent.
- **41:** the only pure kinetic text card, and the only photo of a person in B-roll.
- **45:** longest reel (54.8 s), with a 10.6 s final B-roll shot that probably contains undetected sub-cuts.
- **47:** fastest cutting (5.56 per 10 s), and a full-bleed terracotta background.
- **49:** the CTA keyword is in ALL CAPS.
