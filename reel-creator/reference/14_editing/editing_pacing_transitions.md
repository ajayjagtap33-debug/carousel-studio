# Editing: pacing, shot sequence, transitions

Numbers come from automated shot detection (`../06_analysis/`, `../00_index/metrics.csv`) plus the visual breakdowns. The detector misses card swaps inside the split layout, so the real rate of visual change is **faster** than the cut counts.

## Pacing numbers (49 reels)

| Metric | Median | Range |
|---|---|---|
| Runtime | 35 s | 21–58 s |
| Detected shots | 13 | 6–28 |
| Avg shot length | 2.5 s | 1.7–4.7 s |
| Cuts per 10 s | 3.9 | 2.1–6.0 |
| **Real visual change** (incl. in-card swaps) | **every ~1.5–2 s** | — |
| Hook (first shot) length | ~1.7 s | 0.9–4.6 s |
| CTA shot | ~3.7 s | 2.7–6.3 s |
| Longest static moment on screen | ~3 s | (rare 8–10 s B-roll montages) |
| Speech | ~246 wpm, first word at 0.0 s | — |

## Shot-sequence template (single tool, ~35 s)

```
0.0-1.7s   SPLIT HOOK      title text (2 lines) + result/logo card; captions from frame 1
1.7-3.5s   PAYOFF          DARK B-roll of the result, or an FTH punch-in with a glow word
3.5-6s     NAME            "It's called X": icon tile / white name card -> GitHub page -> star counter
6-25s      MECHANISM       DARK <-> SPLIT alternate on every clause; one FTH breather (~1 s)
                           every 3-4 B-roll beats; counter tiles on every number
25-31s     PLUS            new card (slide / light-leak flash optional) + stat/diagram payoff
last 3-4s  CTA             FTH, "comment 'WORD'" glow, pointing down
```

Listicle: HOOK → [section card "Plugin Number N" → 1–3 B-roll beats → (FTH)] × N → CTA.

## Transitions

| Transition | Frequency | Where |
|---|---|---|
| **Hard cut** | ~90–95% of cuts | Everywhere |
| **Punch-in** (SPLIT → FTH, ~1.6× tighter crop) | Every FTH entry | Reads as a zoom cut on emphasis |
| **Card pop / blur-in** (blurred placeholder resolves in 0.1–0.25 s with a slight scale-up) | Essentially every new card | All B-roll entries |
| **Horizontal slide/push with motion blur** | 6/17 newest-era reels | Card → card in lists |
| **Cross-dissolve** (white card → B-roll, carrying the card over) | 3/17 | Section card exits |
| **Orange light-leak flash** (0.2 s) | 4/16 oldest-era reels | On "Plus" / "So if you", back half |
| **Colour-grade ramp** within one clip (dark → red) | 3 reels | Showing "limit runs out" |
| Glitch / pixel scramble | 2–3 reels | Pixel-logo hooks |
| Whip pans, spins, zoom-blur on the presenter | **none** | — |

## Talking-head edit

- **Jump cuts** remove every breath and pause, which is how 246 wpm is achieved.
- Alternate the crop between **split-panel size** and **tight FTH** to make the cuts feel intentional.
- FTH shots are short (0.8–3 s) and carry one glow-emphasis word.

## SFX placement (see `../13_audio/music_and_sfx_guide.md`)

- Sub-boom on structural beats (name reveal, each list item, stats).
- Whoosh on full-screen B-roll entries.
- Soft click/pop on cards, counters and captions.
- Roughly every 2nd–3rd cut gets a sound. Talking-head cuts are silent.

## Editor's checklist per reel

- [ ] First word and first caption at frame 0; split-layout hook with a 2-line title
- [ ] Visual change at least every 2 s; no static shot over 3 s
- [ ] Every number has a counter or big-number graphic
- [ ] Every feature claim has a highlight box or cursor on the exact UI
- [ ] One accent colour across title box, accent words, borders and CTA glow
- [ ] Light ↔ dark alternation between consecutive B-roll shots
- [ ] 1–3 FTH breathers mid-video, each with one glow word
- [ ] CTA: FTH, "comment" + "KEYWORD" glow, 3–4 s, last frame
- [ ] Music bed throughout, about −28 dB under the voice; SFX on reveals
