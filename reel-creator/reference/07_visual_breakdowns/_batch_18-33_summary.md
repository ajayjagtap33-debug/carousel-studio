# Batch summary: reels 18-33 (16 reels, Sep 14 - Oct 7)

Sources: contact sheets + ~45 individual frames inspected, analysis JSON, transcripts. Counts are from one sampled frame per detected shot. Motion, transitions and exact fonts are inferred from stills, so treat them as best guesses. Per-reel files: `18.md` … `33.md`.

## Core numbers
| metric | value |
|---|---|
| Duration | 21.4-57.5 s, mean 34.8 s (most 28-42 s) |
| Shots per reel | 7-28, mean 14.4; 230 shots in total |
| Avg shot length | 2.42 s overall (per-reel 1.78-4.29; 14/16 reels between 2.0 and 2.8 s) |
| Cuts per 10 s | 2.3-5.6 (median ~4.2) |
| Speaking rate | 209-288 wpm, overall 249 wpm; first word at 0.0 s in 16/16 |
| Music bed | median 8.9 dB under speech (range 5.2-16.4) |
| Cuts that land on an audio transient (SFX hit) | 97/214 = 45% |
| First shot (hook) length | 0.9-4.55 s, median 1.67 s |
| CTA shot length | 2.7-4.3 s, mean ~3.7 s |

## Layout usage (all 230 shots)
- Full-screen B-roll or graphic, no face (BR): 87 shots (38%). Used in 16/16 reels.
- Split layout (graphic on top ~60%, talking head in a rounded card on the bottom ~37%): 72 shots (31%). Used in 16/16 reels.
- Full-screen talking head (FH): 71 shots (31%). Used in 16/16 reels.
- Full-screen B-roll with a blurred background (sharp rounded screenshot card over a blurred, darkened, enlarged copy of itself): 12/16 reels. Missing in 18, 22, 31, 33.
- Pure text card with no image: rare. Only the kinetic "NO SUBSCRIPTION REQUIRED" cards in 26 and 30.

## Shot sequence template
1. **Hook = split layout in 16/16.** The graphic sits on top, Nick talks in the head card below, and a word-synced caption sits just above the card. The first shot is never a full talking head (0/16).
2. Shot 2 (about 1-2.6 s in) is the payoff of the hook promise. It is a BR graphic in 10/16 reels and FH in 6/16.
3. Body alternates graphic, FH, graphic, FH. FH shots are 0.8-3 s "breathers" and never run back-to-back, except the CTA in 32. Up to three BR shots can run consecutively as a montage (23: shots 13-15).
4. Listicles (3/3: reels 19, 27, 31) follow a fixed pattern:
   - a hand-drawn "1-2-3(-4-5)" arrows card on a beige background
   - per item: an ordinal card ("THE SECOND" etc.), then 1-3 explainer graphics, then FH
5. **CTA = last shot, FH, in 16/16.** The spoken line is near-verbatim every time: "just comment X down below and I'll send you the link directly."

## Hook patterns
- Graphic on top is a logo or product icon in 10/16 and a generated UI mock (terminal, LinkedIn composer, timeline, map) in 6/16.
- "Enemy" framing (competitor logos, a red price, or a red strike-through) appears in 5/16: 18, 25, 28, 30, 31.
- Hook caption style:
  - bold sans: 11
  - italic serif caps: 3 (23, 24, 32)
  - pixel/mono with a scramble effect: 1 (26)
  - rolling numeral: 1 (20)

## Typography spec
- **Sans:** Inter Display / SF Pro Display Bold-like with tight tracking. Mostly lowercase, at about 7-8% of frame width in cap height.
- **Serif:** a high-contrast condensed italic serif (Instrument Serif / PP Editorial New-like; the exact family is uncertain). It is used in two forms:
  - ALL CAPS on BR shots
  - lowercase for emphasis on FH shots and for "comment"
- **Placement rule:**
  - FH: white, centred at ~67-70% of frame height (~72-77% in the mic set, where it overlaps the mic head)
  - Split: black on light or white on dark, at ~46-48% height, sitting just on top of the head card
  - BR: ~68-76% height, below the graphic
- **Colour rule:** white with a soft dark shadow over video; black on light graphics; white serif caps on dark graphics.
- **Chunking:** 1-3 words per caption, synced to the spoken word, one chunk on screen at a time. Ghosting in the frames suggests a fade or slide-up per word.
- **Two-tier emphasis:** a small white line (serif or sans) stacked over a bigger accent word in a vertical-gradient colour with glow, e.g. "re-explain / **a single**". Seen in 10/16 reels (9 on FH).
- **Accent colour follows the product's brand:**
  - Claude/Replit orange: most reels
  - Higgsfield/Freebuff lime-green: 24, 26, 30
  - DaVinci yellow: 32
  - pink/blue-grey: 28
- **Label styles:**
  - Ordinal labels ("THE FIRST/SECOND/THIRD"): salmon-to-pink gradient serif caps above an app tile (3/3 listicles).
  - "it's called / IT'S CALLED": mint or salmon gradient serif (19, 23, 29).
- **Rolling digit/odometer counters** (star counts, issue counts, model counts) appear in 9/16: 19, 20, 21, 23, 25, 27, 28, 29, 33.

## Graphics and overlays
- **Head card:** full width with large rounded top corners (~40 px at 1080) and a soft glow or shadow on the top edge. In 30 the B-roll bleeds blurred behind it.
- **Recurring orange pixel "Claude Code" mascot** is used as an illustration character in 12/16 reels (absent in 18, 26, 28, 30).
- **GitHub material** (repo page, README, star history, contributors, Octocat tile) appears in 10/16. A star-count card with a rolling number appears in 3 (21, 23, 25).
- **Coloured glowing rounded borders** on screenshots appear in 7/16:
  - orange: 19, 20, 24, 27, 29
  - yellow: 27
  - lime: 26, 30
- **Highlight boxes** inside screenshots:
  - orange: 21, 22, 28
  - mint: 19, 29
  - lime: 26
  - pink rows: 31
- **Browser frame** (traffic-light dots and URL bar) appears in only 2/16 (18, 21).
- **App icons** are iOS-style rounded tiles with drop shadows.
- **Other devices:** connector-line diagrams, red strike-through slashes, and motion-blurred logo drops (29) and digit rolls (21).
- **Assets are reused across reels:** the Claude ASCII hook (19/27), Awesome Free LLM APIs card (19/29), Higgsfield cards (26/30), and the claude-mem README and star chart (19/27).

## Set and colour
- **Two shoots, 8 reels each:**
  - 18-25: charcoal acid-wash tee, silver pendant, no visible mic, white door at the left of the sage wall.
  - 26-33: heather-grey sweatshirt over a navy tee, black broadcast mic on a shock mount in the lower centre, shorter hair.
- **Common to both:** pale sage wall (#a8b2a1-#c3c8be in the palette), soft frontal daylight, chest-up framing with the eyes at about the upper third.
- **Graphic palette:** about two-thirds light-mode (white #fafafa, pale peach #faf0eb, beige/kraft #ddd4cd, grey radial vignette, palm-leaf-shadow paper texture in 7/16) and one-third dark (#0c0c0c-#21252f), used mainly for real terminals, GitHub dark mode and product sites. These proportions are approximate.

## Transitions (low confidence)
- Cuts look hard (no visible wipes or whips).
- Roughly 45% of cuts land on an audio transient, so whoosh/pop SFX are likely.
- Within-shot motion is evident: text fade or slide-up, blur-to-sharp logo reveal (23), slot-machine digits, motion-blurred element drops, and zoom/scroll on blurred-background cards (26, 30).
- Some sub-0.5 s "shots" in 26 and 30 are animation steps rather than real cuts.

## CTA spec
- Final FH shot in 16/16.
- Text treatment:
  - a small white italic serif "comment"
  - stacked tight over a large bold sans **"KEYWORD"** in curly quotes
  - vertical gradient fill and a soft outer glow
  - centred at ~68-75% height
- Keyword colours (13 frames where the keyword is visible):
  - orange: 5
  - green/lime: 3
  - gold/cream: 2
  - white/silver: 2
  - blue-grey: 1
- In 3 frames the keyword wasn't visible yet: 22 and 25 show only "comment", and 33 is caught mid-fade.
- The colour usually matches the product's brand colour. A green glow like reel 01's appears in only 3/16.
- Nick points down at the comments in at least 4/16 (18, 19, 23, 24).

## Differences from reel 01's notes
- No "1/4" counter badge in any of the 16. Ordinal serif cards replace it in listicles.
- Blue italic serif accent appears only once ("LIVE ON", 18). Accent colour varies by brand, and orange is the default.
- No blue highlight box behind a caption keyword. Highlights live inside the screenshots instead.
- Browser-window cards are rare (2/16). Most top-half graphics are custom-designed motion-graphic cards, not raw screenshots.

## Outliers
- **33:**
  - only 7 detected shots (4.3 s average), probably because the detector missed soft transitions
  - all captions are bold sans with no serif or accent words
  - the quietest music (16.4 dB gap)
  - possibly an older template
- **26:** pixel/mono glitch hook typeface.
- **30:** fastest cutting (1.78 s), B-roll extended behind the head card.
- **27:** longest (57.5 s, 28 shots).
- **24:** shortest hook shot (0.9 s).
- **32:** ends with two FH shots in a row.
- **29:** the top performer (24k likes) is structurally typical (split hook, 6 split / 4 FH / 4 BR).
