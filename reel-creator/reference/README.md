# Nick Saraev reels: reverse-engineering reference

49 Instagram reels (@nick_saraev, Aug 22 – Oct 27 2026) were downloaded, transcribed and analysed frame by frame and audio stem by audio stem. The source list was `nick_saraev_reels.xlsx`; its index had 49 reels with gaps, so this isn't strictly his last 50.

## The blueprint in one screen

| Layer | Spec | Detail |
|---|---|---|
| **Length** | 35 s median (single tool 22–40 s; listicle 45–58 s) | [10_script/script_structure.md](10_script/script_structure.md) |
| **Script** | HOOK → "It's called X" + GitHub-star proof → 3-step mechanism ("you just… it'll… then it'll…") → "Plus…" → "comment WORD and I'll send you the link directly" | [script_template.md](10_script/script_template.md), [hook_bank.md](10_script/hook_bank.md), [all_scripts.md](10_script/all_scripts.md) |
| **Delivery** | ~246 wpm, first word at 0.0 s, every pause jump-cut out | — |
| **Best hooks** | Listicle ultimatums and problem/fear hooks (~1.7× median likes). Breakouts were mass-market ("hack your TV to remove ads", 116k likes) and "free unlimited Claude Code" (24k). | [hook_bank.md](10_script/hook_bank.md) |
| **Layouts** | Light SPLIT (card on top, rounded talking-head panel below, caption on the seam) ↔ DARK B-roll (card over a blurred copy of itself) ↔ short full-talking-head punch-ins. Always opens on SPLIT and ends on the FTH CTA. | [12_design/design_system.md](12_design/design_system.md) |
| **Type** | Heavy grotesk sans (Inter/SF-like) captions, 1–3 words, revealed word by word. Italic serif (Playfair/Instrument-like) accent word in the accent colour. Hook title = black sans line + italic serif in a blue box. | [design_system.md §2](12_design/design_system.md) |
| **Colour** | Monochrome base (#EEF0F2 off-white, #0B0C0F near-black, sage wall) + **one accent per reel** (blue in the newest era, Claude coral before, or the product's brand colour). Accent ≈ 2% of pixels. | [palette_swatches.png](12_design/palette_swatches.png) |
| **B-roll** | No stock footage. GitHub pages, star counters, terminals, highlighted screenshots, logo tiles, mock UIs, diagrams, a Claude pixel mascot. A visual change every ~1.5–2 s, literally illustrating each clause. | [11_broll/broll_guide.md](11_broll/broll_guide.md) |
| **Edit** | Mostly hard cuts plus card pop/blur-ins and punch-ins. Occasional slide, dissolve or light-leak flash. | [14_editing/editing_pacing_transitions.md](14_editing/editing_pacing_transitions.md) |
| **Music** | One consistent dark, minimal, bass/pad bed (~112–117 BPM, E minor / G major in 36/49), very low under the voice, the whole reel. Isolated beds are provided for Shazam. | [13_audio/music_and_sfx_guide.md](13_audio/music_and_sfx_guide.md) |
| **SFX** | Sub-booms on structural beats, whooshes on B-roll entries, clicks on pops. About every 2nd–3rd cut. | same |
| **CTA** | Last 3–4 s: FTH, small italic "comment" over a glowing **"KEYWORD"**; caption line 1 = `Comment "WORD" to get…` | — |

Start with [12_design/style_board.jpg](12_design/style_board.jpg) for the look at a glance.

## Folder map

| Folder | Contents |
|---|---|
| `00_index/` | `reels.csv` (links, dates, likes, comments), `metrics.csv` (per-reel pacing, wpm, music, top colours), `corpus_stats.json`, processing logs |
| `01_videos/` | The 49 source MP4s (`01.mp4` = newest) |
| `02_metadata/` | Instagram metadata (`NN.info.json`) and the caption/clean script (`NN.caption.txt`) |
| `03_transcripts/` | Whisper transcripts: `.txt`, `.srt`, `.json` (word-level timestamps). Note: speech-to-text writes "Cloud/Clod Code" for "Claude Code"; captions are the clean version. |
| `04_frames/` | One frame per detected shot (`NN/scene_XXX_<time>s.jpg`) and `NN_contact_sheet.jpg` |
| `05_audio/` | Mono WAVs and `stems/NN_music.mp3` / `NN_voice.mp3` (Demucs separation) |
| `06_analysis/` | Machine analysis per reel: shot timings, palette, audio metrics |
| `07_visual_breakdowns/` | Per-reel shot lists, hook, B-roll ↔ line mapping, typography, overlays, transitions, CTA, plus three batch summaries |
| `10_script/` | Structure, template, hook bank, all 49 clean scripts |
| `11_broll/` | B-roll taxonomy, trigger → visual cheat-sheet, sourcing recipe |
| `12_design/` | Design system, style board, palette swatches, extracted palette JSON |
| `13_audio/` | Music & SFX guide, `music_features.csv`, `sfx_samples/` (88 one-second SFX clips at cuts), spectrograms |
| `14_editing/` | Pacing numbers, shot-sequence template, transitions, editor checklist |

The scripts that produced all of this are in `../tools/` (`01_download.py` → `06_music_sfx.py`). They're re-runnable for any other creator: swap in a new spreadsheet of links.

## Known limitations

- Fonts and transitions are inferred from still frames. Exact typefaces and animation curves are unconfirmed.
- Shot detection misses card swaps inside the split layout, so the true change rate is faster than the cut counts.
- Music tracks are not identified by name; Instagram exposes no attribution for baked-in audio. Shazam the `stems/*_music.mp3` files.
- On-screen star counts sometimes differ from the spoken numbers (06, 16, 39, 49), probably from updated screenshots.
