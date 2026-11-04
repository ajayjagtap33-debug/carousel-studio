> ARCHIVED 2026-10-30. Superseded reel-editing instructions, kept for reference only. Do not follow; the new reel plan replaces this.

# Reel creator

Ajay hands over his **final rough cut** as an MP4 (him talking to camera, already cut). Claude returns the **finished 9:16 reel**: his footage and audio, captions, B-roll, transitions, music and SFX, in the style of Nick Saraev's Instagram reels.

- **Don't re-cut his footage.** The rough cut is final: no splices, no removed pauses, no reordering. If something looks wrong (a fluffed line, a long pause, dead air at the start or end), point it out and let him decide.
- **The style spec is `reference/`** (49 Nick Saraev reels, taken apart). Follow it; don't re-analyse the source reels.
- The flow and Ajay's standing rules come from his long-form video setup in `../carousel-studio` (`CLAUDE.md` and `.claude/skills/broll-video/`). This file is the reel version of it.
- One fresh session per reel. This file plus the reel's folder is all the context needed.

## Folder layout

```
reference/   Style spec from 49 Nick Saraev reels (study only, read-only). Start at reference/README.md
themes/      Colour tokens: reel_themes.json (ajay = olive, tmv = red)
assets/
  logos/       Official logos only (copied from carousel-studio; add new ones from press kits)
  sfx/         Our own SFX (synthesized in carousel-studio): hit, thump, pop, tick, key, swish, whoosh-up/down, tone2
  music/       Licensed music bed(s). Empty until Ajay picks a source; use a synthesized placeholder until then
engine/      Render engine (Remotion, 1080x1920). NOT BUILT YET, see "Engine"
reels/<date>-<slug>/
  cut.mp4      His rough cut (copied, never moved)
  input/       Screen recordings / screenshots he supplies for this reel
  shots/       Screenshots and recordings Claude captures, cropped
  transcript.json / transcript.md
  plan.md      Beat table for his approval
  reel.json    Render input (layouts + scenes + captions, every time from the transcript)
  stills/      Check frames + contact sheet
  render/      Raw renders
  out/         <slug>-<theme>.mp4 (final), caption.txt, cues.md
tools/       01-06: the scripts that built reference/ (analysis only)
```

## Which reference to read for what

| Need | Read |
|---|---|
| Pacing, shot order, transitions, final checklist | `reference/14_editing/editing_pacing_transitions.md` |
| Layouts (SPLIT / DARK / FTH / WHITE), captions, graphics, CTA frame | `reference/12_design/design_system.md` + `reference/12_design/style_board.jpg` |
| What visual goes on each spoken line | `reference/11_broll/broll_guide.md` (trigger → B-roll cheat-sheet) |
| Music + SFX placement | `reference/13_audio/music_and_sfx_guide.md` (what Nick does), then the sound rules below (how we do it) |
| Labelling his script's beats | `reference/10_script/script_structure.md` |
| A worked example close to this reel | `reference/07_visual_breakdowns/NN.md` + `reference/04_frames/NN_contact_sheet.jpg` (reels 01–17 = the newest look, the one we copy) |

Nothing from `reference/` (Nick's footage, frames, `sfx_samples/`) goes into one of our reels. **The exception is music:** Ajay is fine with Nick's music for Instagram (2026-10-30). Use his isolated beds from `reference/05_audio/stems/NN_music.mp3`, or the real track if Ajay identifies it.

## Look: Nick's reel layout, our type and colour

**Layout and motion** follow the newest era (reels 01–17):
- Opens on SPLIT (card on top, his footage in a rounded panel below, caption on the seam).
- The body alternates SPLIT and SOFT B-roll (card on a stone canvas; replaces Nick's dark layout), with 1–3 short full-frame punch-ins (FTH, about 1.6× crop).
- WHITE section cards appear in listicles.
- It ends on FTH with the `comment "KEYWORD"` glow for the last 3–4 s.

**Captions** run word by word, 1–3 words at a time, with one accent word per phrase. They're on for the whole reel because reels are watched with the sound off. This is a deliberate difference from his long videos, where the rule is "draw the beat, don't caption it". **B-roll still follows that rule**: every beat is a picture (screenshot, mock, counter, logo, diagram), never a text box.

**Calm, not loud (Ajay, 2026-10-30, after the first reel).**
- **No black backgrounds.** Nick's DARK layout is replaced by `soft`: a warm stone canvas with a faint blurred copy of the card.
- **No saturated brand red on screen.** Use the muted accent, sparingly, mostly as text or a thin line. Pills and title boxes take the soft tint (`accentSoft` / `accentTint`), not a solid accent fill.
- **No near-black heavy type.** Use soft warm-grey `ink` (#544D4A tmv) at weight 700 (tmv) / 600 (ajay); 600 read as too light, captions at 72px with open tracking (+0.015em) and wider word gaps. Never 800–900, never tight negative tracking.
- **No glowing or travelling borders.** Cards get a hairline border and a soft shadow.
- **Fewer things at once.** One main element per beat; the hook is the title plus one picture, never a counter stacked on a card.
- **Text over his footage must pop, not blend** (his shirt and wall are white): white, one weight heavier, with a tight dark halo plus a soft coral neon glow (`POP` in `Reel.tsx`).
- **In SPLIT, his whole head, neck and shoulders show.** The panel starts at y 900, with his face at 34% of the panel.

**Colour** comes from `themes/reel_themes.json` (the calm tokens). Nick's blue maps to:
- `accent` on light layouts
- `accentOnDark` on footage (FTH captions)
- `glow` for the CTA keyword and glowing card borders

Keep about 2% saturated pixels, one accent per reel. **Render only the theme Ajay names for the reel** (`tmv` or `ajay`); ask if he doesn't say. **No wordmark** in reels.

**HTML mocks are a first-class B-roll source** (Ajay, 2026-10-30). Recreate a UI as a component so it can move: a sheet whose tabs switch and boxes tick, a ChatGPT-style chat showing a prompt and the answer you'd expect, a score that counts up. Build them from his screenshots or the real product UI, use real text from them, and mark anything invented (example prompts, placeholder site names) as `added`.

**Type** (fonts loaded through `@remotion/google-fonts`, same families as carousel-studio):

| Role | `ajay` | `tmv` |
|---|---|---|
| Captions, hook line 1, counters, product names | **Inter** 800–900 (Nick's heavy grotesk) | **Mulish** 800 |
| Accent word, hook line 2 (in the accent box), "comment" over the CTA keyword | **Instrument Serif italic** | **Dancing Script** 700 |
| Large display lines on WHITE cards | Instrument Serif 400 (carries by size: 200px+) | Mulish 800 |
| Prompts, URLs, terminal text | JetBrains Mono | JetBrains Mono |

Sizes at 1080 wide: captions 80–95px, hook title 60–75px, nothing under 40px. The accent font is used for **one word**, never a whole line.

**Ajay's standing rules, carried over:**
- **No all-caps eyebrows/kickers and no "2/5" counters** (they read as AI). Nick's "Plugin Number One" card becomes sentence case: "Plugin number *one*".
- **Only what he says.** No number, claim, name, star count or price he didn't say or supply. Anything Claude writes (a card title, a label) is marked `added` in the plan.
- **Logos only from `assets/logos/`** (official press kits). A missing logo is a slot for Ajay, never fetched from a random site.
- Screenshots:
  - Crop every one to its content.
  - Aim highlight rings by measuring the cropped image.
  - Never label a shot as something it isn't.
  - Don't use a later beat's visual early.
- Use a scene type at most about 4 times a reel. Start from what the line means, then pick the visual.

## Workflow for a reel

1. **Job folder.** Create `reels/<date>-<slug>/` and copy his MP4 in as `cut.mp4`. Probe it (`tools/bin/ffmpeg.exe -i cut.mp4`) for resolution, fps, orientation and length. If it's 4K, transcode to 1080 wide first (`-crf 17`) and render from that. Output is always 1080×1920, 30 fps.
2. **Transcript.** Use faster-whisper `small.en` with word timestamps → `transcript.json` + `transcript.md`. Read `transcript.md` once, and find times with the engine's `find`, never by dumping the word list. Fix mishearings ("Cloud" → Claude, "MCB" → MCP) and list them; ask when unsure.
3. **Find his face.** Pull a few frames and set his face centre plus the crops for the SPLIT panel and the FTH punch-in, so nothing cuts his head or the mic. Also look for stretches where **he isn't looking at the camera**: cover those with full-screen B-roll (no face panel, no FTH), starting and ending on word boundaries (Ajay, 2026-10-30).
4. **Plan, then STOP.** Write `plan.md` and `reel.json`.
   - Label the beats: HOOK → NAME+PROOF → MECHANISM → PLUS → CTA, or the listicle items.
   - Pick the CTA keyword from his spoken CTA.
   - Write the hook title (2 lines).
   - Give one row per beat: `time · his line · layout · B-roll (each element on its word) · SFX · source (his line or "added")`.
   - Rules from the reference: something new on screen every ~1.5–2 s and nothing static over 3 s; light ↔ soft alternation; never two FTH in a row except the CTA; every number gets a counter tile; every feature claim gets a highlight ring or cursor on the exact UI.
   - List the **slots**: screenshots/recordings/logos Ajay must supply, and public pages Claude will capture (GitHub, product sites; star counts read live on the day).
   - **Ajay approves or edits the plan before anything is rendered.**
5. **Assets.** Capture or crop the approved shots into `shots/`. Ajay's own product screens come from him (`input/`).
6. **Stills check.** Render stills at the key moments and mid-transition and tile them into one contact sheet. Fix any text over his face, captions in Instagram's bottom ~20% UI zone (except the CTA), clipped text and garbled characters. Open a single full-size still before believing something is clipped.
7. **Render** the reel's theme, with his audio on.
8. **Sound.** Add SFX and the music bed, then master to −14 LUFS integrated, −1 dBTP (rules below).
9. **QA + handover.**
   - Pull frames out of the finished MP4s and run the editor's checklist at the end of `editing_pacing_transitions.md`.
   - Measure the loudness of the final file rather than trusting the script's number.
   - Hand over `out/<slug>-<theme>.mp4`, `out/caption.txt` (line 1 = `Comment "WORD" to get…`), the cue sheet, what was added, and the slots still open.
   - Say plainly that Claude can't hear: the mix needs Ajay's ears.

## Sound (reel version of carousel-studio's `sound.md`)

- **Music bed:** one signature track under the whole reel from 0.0 s (no cold-open silence in reels), running through the CTA with no stinger. **Level: about 15 LU under his voice, ducked a few dB more while he talks** (`"musicGap"` in reel.json `sound`; Nick's ~26 dB was inaudible on a phone — Ajay, 2026-10-30). Use Nick's bed: a ~115 BPM E-minor stem from `reference/05_audio/stems/`, looped from a stretch with few baked-in hits. The stems are Demucs-separated, so check for voice bleed.
- **SFX** from `assets/sfx/`:
  - `thump`/`hit` on structural beats (name reveal, each list item, big stat)
  - `whoosh-up/down` on full-screen B-roll entries
  - `pop`/`tick` on card and counter pops
  - `swish` on a highlight ring

  Roughly every 2nd–3rd cut, about 2–6 per reel. Talking-head cuts and captions stay silent. Levels −12 to −18 dB under his voice. Never put a cue on a hard consonant; move it 2–4 frames into a gap.
- Voice: high-pass about 80 Hz, gentle compression. Master −14 LUFS / −1 dBTP.

## Engine

Built 2026-10-30 (Remotion 4.0.536, ported from carousel-studio's studio mode). First reel: `reels/2026-10-30-aeo-geo-checklist/`. Copy its `transcribe.py` and `build.py` for a new reel.

- `engine/src/Reel.tsx`: layouts `split` / `dark` / `full` (card on the light canvas, no footage) / `fth` / `cta`, the hook title, word-by-word captions and the CTA glow.
- `engine/src/kit.tsx`: theme and fonts (**local** woff2 in `engine/src/fonts/`; fetching Google Fonts at render time failed), plus `Pop`, `BrowserCard` (glowing border), `Counter`, `Mark`, `Ring`, `LogoTile` and `Cursor`.
- `engine/src/scenes.tsx` (`SCENES`): `sheet`, `header`, `logos`, `score`, `name`, `tabsMenu`, `row`, `promptLog`, `stack`. A new scene type goes here first.
- `engine/src/sheet.tsx`: the Google Sheets recreation of the TMV checklist (real rows from Ajay's screenshots).

Per reel:
```
python reels/<folder>/transcribe.py <audio16k.wav> transcript        # from the reel folder; decode audio with ffmpeg first (PyAV is broken)
python reels/<folder>/build.py                                        # writes reel.json (segments, captions, sfx) + copies logos in
python engine/reel.py stills reels/<folder> 0.8 3.6 ...               # stills/<t>.png + stills/sheet.png
python engine/reel.py render reels/<folder>                           # render/draft.mp4 (picture + his voice), ~10 min for 40 s
python engine/reel.py sound  reels/<folder>                           # out/<slug>-<theme>.mp4, music + SFX, -14 LUFS / -1 dBTP
python engine/reel.py frames reels/<folder>/out/<file>.mp4 <out.png>  # 1 frame/s contact sheet for QA
```

Known render gotchas (from carousel-studio):
- Set `concurrency: 3`. The default makes the compositor throw `No frame found at position N`, which looks like a corrupt file but isn't.
- Keep the bundle's `publicDir` to the 1080 cut plus the shots, because it's copied on every bundle.
- Remotion leaves a copy of the cut in `%TEMP%/remotion-*assets*/` per render and never cleans up. Tell Ajay; don't delete without asking.

## Environment

- Windows, no GPU. ffmpeg: `tools/bin/ffmpeg.exe` (libass, drawtext, zoompan).
- Python 3.13 with faster-whisper, opencv, numpy, Pillow, librosa, soundfile, scenedetect.
- Node 24 / npm 11.
- `engine/node_modules` and `.remotion/` (the headless browser) were copied from carousel-studio. Run renders from the repo root so Remotion finds `.remotion/`.
- `transcribe.py` imports faster-whisper from the user site-packages, so run it without `python -I`.
