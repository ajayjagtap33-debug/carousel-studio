# Handoff: creator studio (merged 2026-11-04)

This folder is the merge of two diverged copies of the same project. It replaces the old `HANDOFF.md`
(kept in `docs/archive/HANDOFF.local-2026-11-04.md`, along with both original `CLAUDE.md` files).

| copy | where it was | what it was |
|---|---|---|
| **company** | `~/Downloads/creator-studio` | the company laptop's git checkout (Windows, CRLF): branch `broll-treatment-rules`, 14 commits ahead of origin, plus uncommitted work. Studio-mode videos, reels, `visuals/`, TMV-proof carousels, `talks/`, `canvas.py` |
| **local** | `~/Claude/carousel-studio` | the personal Mac copy, not a git repo: video slides, stickers, the Refluke b-roll style, the union `render.py`, brand-green rule, the Mac toolchain |

**Neither original was touched.** Both are still where they were; delete them only after you've used this folder for a while.
This one was built with APFS clones, so it cost almost no disk space (the volume had 3.6 GB free; the company copy is 19 GB).

## State of this folder

- It is the company's `.git` (branch `broll-treatment-rules`, 18 ahead of `origin/broll-treatment-rules`; `origin/main` is
  `5057d24`, the merge of PR #1, which does **not** contain the company's 14 commits).
- Everything is **committed locally, nothing pushed**: `6415f9c` is the merge (592 files; it also carries the company's own
  uncommitted work, which couldn't be separated), then a docs fix, then `d42ad60` adds the remaining folders (`reel-creator/reference`
  incl. other creators' reels, `reel-creator/reels`, two 2026-10/11 carousels; ~840 MB). `git status` is clean.
- **Push is pending**: this Mac has no GitHub login. Run `gh auth login`, then `git push -u origin broll-treatment-rules`.
- Line endings are LF (the company copy was CRLF; its committed blobs are LF, so `git diff` is clean of that noise).
  `sync.ps1` keeps CRLF on purpose (`.gitattributes`).
- The repo's own config had Windows settings (`filemode=false`, `ignorecase=true`); they are now `true` / `false`.

## What came from where

**Company (the base — newer in almost everything)**: studio-mode video engine (`broll/src/studio/`, `scripts/scenes.py`,
`studio_sound.py`, skill files `studio.md` `sound.md` `screen-recordings.md`), reels (`broll/src/reel/`, `reel-creator/`),
`visuals/`, `scripts/canvas.py` + `talks/`, `collage.py` / `studio_carousel.py` + their carousels, `promo/` `outreach/` `thumb/`
compositions, the TMV carousels (`chatgpt-ads-study` family, `appsumo-zero-ads`, `automate-manual-first`,
`pick-prompts-to-track`, `camera-presence-talk`, `2026-10-31-*`, `2026-11-04-reddit-ai-mode-styles`), 15 video projects in
`videos/` (11 GB), `raw/`, `gradients/`, `swipe/` TMV notes + `visual-metaphors.md` + `video slides (extra)/`,
`assets/sfx/` `assets/logos/tmv-*.png`, the newer editorial b-roll engine (face `left|right|none`, `line` `chips` `rows` `stats`,
face-zone lint), the webinar v3 deck, `specs/`.

**Local (added on top)**: `video-slides/` AEO/GEO checklist, `0-interviews-4-offers`, and the webinar v2 deck (as
`…-social-seo-webinar-v2-18slides/`); `stickers/` (2 projects); `carousels/2026-09-29-tools-i-stopped-paying-for` and
`2026-09-30-chatgpt-dots`; the Refluke b-roll style (`broll/src/refluke/`, `broll/src/lintcore.tsx`,
`assets/refluke-broll/`, `scripts/refluke_frames.py` `reel_typescale.py` `art_png.py`); `assets/brand/openai-dots/`,
`swipe/logos/`, the 9 extra doodles and the `slides`/`broll` formats in `render.py`/`build.py`/`library.py`; the brand-green
`theme.json` (`sage`, `d_green`, `slides`/`broll` blocks); the Mac `tools/` (Node, ffmpeg 6, yt-dlp) and Mac `broll/node_modules`;
`videos/reference/2026-10-14-…` and `2026-10-22-cutting-edge-ai-editing`, `videos/_editorial-regression-test`, `_refluke-check-test`.

**Merged by hand** (three-way, base = `d2e453c`, the first commit both copies descend from): `scripts/render.py` (local's union
engine + company's `collage` art entries), `scripts/build.py` (per-format chrome test + company's wider glyph tolerance),
`scripts/broll.py` (both helper functions: `node()` and `playable()`), `scripts/library.py`, `broll/src/Root.tsx` (all 15
compositions: the company's 13 + `ReflukeMain` + `ReflukeSample`), `theme/theme.json`, `.gitignore`, `CLAUDE.md`, `README.md`.
Everything else that differed was either identical after stripping CRLF or changed on one side only.
**Why base `d2e453c` and not the newer commit:** the local copy's editorial files are byte-identical to that first commit, so
against the newer base a naive merge would have silently deleted the company's later features from the local side.

## Judgment calls — reverse any you disagree with

1. **Webinar deck**: the company's v3 (14 slides, `script.md`, `speaker-script.md`) is the current one and keeps the original
   folder name. The local v2 (18 slides) is preserved whole in `…-v2-18slides/`. v3's storyboard uses visual types (`search`,
   `checks`, `paths`, `timeline`, `thennow`, `ring`) that **no engine here implements** (they came from a zip copy of the studio
   that isn't in either folder), so v3 can't be re-rendered, only its PNG/PDF/`.excalidraw` used. v2 re-renders fine.
2. **Studio vs Refluke**: both b-roll styles are kept and both still run. They overlap (both adopt the Nick Saraev reference; studio
   mode is later and is documented as the default). Whether to retire `refluke` is yours.
3. **`carousels/2026-09-29-aeo-geo-checklist` and `…-stay-human`**: took the local copy's outputs (re-rendered with the brand-green
   rule; the company's had `"accent": "orange"` / `"violet"`). The company's `stay-human/anim/` videos were rendered with the old
   accent, so they no longer match; re-run `python3 scripts/animate.py carousels/2026-09-29-stay-human` if you use them.
4. **Default-theme projects the company rendered earlier** (`automate-manual-first`, `pick-prompts-to-track`, …) still have
   their old PNGs (Excalidraw green `#2f9e44`). Re-rendering them with the merged engine gives brand green `#2C6650`. I did not
   re-render them.
5. **Windows leftovers not carried**: the company's `broll/node_modules` (Windows binaries) and `tools/ffmpeg` (Windows build) —
   replaced by this Mac's. `reel-creator/engine/node_modules` (1.2 GB, Windows) was also left out.
6. **Python 3.9 fix**: added `from __future__ import annotations` to `scenes.py`, `promptmotion.py`, `studio_carousel.py` (they used
   `X | None` hints that need Python 3.10; this Mac has 3.9.6). No behaviour change.
7. **`.gitignore`**: added `raw/` (a single 1.6 GB camera file), `reel-creator/tools/bin/` (a Windows `ffmpeg.exe`), `tools/node/`,
   `tools/bin/`, `*.zip`. `sync.sh` runs `git add -A`, so these would otherwise have been committed.
8. Not carried over: the local `carousel-studio.zip` (28 MB, an old snapshot), `.DS_Store` files, `_build_check.html`, the company's
   `.remotion/` cache (283 MB), a stray empty `Jagtap/` folder, `scheduled_tasks.lock`.

## Verified (2026-11-04)

- All 5 formats render in this one engine: hand-drawn carousel with `fan`/`art`/`scene` (chatgpt-dots), TMV study (v3: output
  element-for-element identical to the company's committed render), landscape (automate-manual-first), video slides (webinar v2:
  identical to the local render), stickers (recordly review: identical), talk canvas (17 stations). Run on scratch copies, so no
  deliverable was overwritten.
- Chrome export works end to end (webinar v2 → 18 PNGs + PDF; TMV v3 → 9 PNGs + PDF); looked at one slide from each.
- `tsc --noEmit` passes over the whole Remotion app (editorial, studio, reel, refluke, promo, outreach, carousel, thumb) after
  `npm install` added the company's three.js packages. `broll.py check` passes on both regression folders (editorial + Refluke).
- Every script compiles and imports under Python 3.9 except the three that need `numpy`/`onnxruntime` (see below).
- The art library was regenerated from the merged `library.py` (51 items: 14 `person`, 5 `bot`, 32 doodles) and the preview sheets
  (now 6) and `broll/src/studio/cast.json` re-exported.

## Not verified / known gaps

- **No full Remotion video render** was run (studio, reel, promo, Refluke): that takes minutes per clip and needs footage. The
  typecheck and the `check` stills render fine; a real render hasn't been tried on this Mac with the merged code.
- `matte.py`, `studio_sound.py`, `promo_music.py` need `pip3 install numpy onnxruntime` (not installed). Not tried.
- Windows-only paths remain in `reel-creator/engine/reel.py` (`tools/bin/ffmpeg.exe`) and `scripts/promptmotion.py` (`ffmpeg.exe`
  glob). The reel workflow doesn't use the old engine, but `promptmotion.py scrape/analyze` won't find ffmpeg here.
- `scripts/scenes.py check videos/2026-10-29-studio-edit` reports "4 blocking": that is the plan's own lint result, not a merge
  problem, but I didn't look into it.
- TMV renders use the Mac's own Helvetica Neue (the export printed `font: Helvetica Neue`, no stand-in). The company copy's
  `assets/fonts/HelveticaNeue*.woff2` files are not what the export used here, and are git-ignored (licensed).

## Open questions for Ajay

1. **Push** the branch (see State) and open a PR to `main`. The ~840 MB of reference/reel files is in the push (your call); to keep other
   creators' reels out of GitHub, remove `reel-creator/reference/01_videos` from the commit before pushing.
2. ~~Untracked folders~~: committed.
3. **Name and index**: the folder is `~/Claude/creator-studio`. `~/Claude/CLAUDE.md` still lists `carousel-studio/` as the project;
   I didn't edit it. Point it here once you're happy, or rename this folder back to `carousel-studio` after archiving the old one.
4. **Retire `refluke`?** (judgment call 2).
5. **Re-render the older default-theme carousels** to brand green? (judgment call 4.)
6. **Webinar v3**: it can't be re-rendered. If it needs edits, say whether to add those six visual types to `render.py` or rebuild the
   affected slides with the types that exist.

## Re-render / quick checks

```bash
python3 scripts/render.py video-slides/2026-10-08-social-seo-webinar-v2-18slides
python3 scripts/build.py video-slides/2026-10-08-social-seo-webinar-v2-18slides --export
python3 scripts/broll.py check videos/_refluke-check-test
cd broll && ../tools/node/bin/node node_modules/typescript/bin/tsc --noEmit
```

Setup and usage are in `README.md`; the rules are in `CLAUDE.md`.
