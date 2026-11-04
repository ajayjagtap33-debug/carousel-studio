# Creator studio

Hand-drawn Excalidraw visuals, plus the video pieces that go with them:
brief → storyboard (you approve) → Excalidraw → check → PNGs.

- **Carousel**: 4:5 LinkedIn carousel, PNGs + PDF (`carousels/`)
- **Video slides**: 16:9 PPT-style slides for videos, 1920×1080 PNGs + PDF (`video-slides/`)
- **Stickers**: transparent overlay stickers, each sized to its content, for any video + a shot list (`stickers/`)
- **Talk canvas**: a live talk as stations on one zoomable canvas (`talks/`)
- **Studio video**: his talking-head cut with drawn b-roll, finished MP4 (`videos/`, `broll/src/studio/`)
- **Reel**: the same look in 9:16 (`reel-creator/`, `broll/src/reel/`)
- **B-roll clips**: silent 1920×1080 clips timed to your words, to lay over a cut (`videos/`)

Claude reads `CLAUDE.md` for the full flow and rules, and `HANDOFF.md` for what this folder is made of and what is
still open. This folder is the merge (2026-11-04) of the personal Mac copy and the company laptop's checkout.

## Setup (Mac)

1. You need **Python 3** (`python3 --version`; if it's missing, run `xcode-select --install`) and **Google Chrome** in
   `/Applications`. No pip packages for carousels, slides, stickers or talks. The renderer loads Excalidraw from
   unpkg, so you need to be online.
2. Open the folder in Claude Code (`cd ~/Claude/creator-studio && claude`, or pick the folder in the desktop app).

The video side uses `tools/` (Node, ffmpeg, yt-dlp, already here and git-ignored) and the Remotion app's packages
(`cd broll && npm install`, already done on this Mac). `studio_sound.py`, `matte.py` and `promo_music.py` also need
`pip3 install numpy onnxruntime`.

## Use

Tell Claude: *"New carousel / video slides / stickers / talk canvas / video / reel from this script: …"*.
If you don't say which, Claude asks. Or copy `templates/brief.md` into `<folder>/<date>-<slug>/brief.md`,
fill it in, and say *"make the carousel"*.

To run the scripts by hand (on Mac use `python3`, on Windows `python`):

```bash
python3 scripts/render.py carousels/2026-09-29-aeo-geo-checklist
python3 scripts/build.py carousels/2026-09-29-aeo-geo-checklist --export
```

Output lands in the folder: `<format>.excalidraw` (open it at excalidraw.com to hand-edit), `slides/NN.png`,
plus `<format>.pdf` (carousel, slides) or `shotlist.md` (stickers).

A talk canvas, a video and a reel have their own scripts and their own inputs — no storyboard:

```bash
python3 scripts/canvas.py talks/<folder> --png     # canvas.json  -> canvas.excalidraw + preview.png
python3 scripts/broll.py check videos/<folder>     # broll.json   -> clips, after a check
node broll/shoot.mjs <job.json>                    # studio video / reel render (see the broll-video skill)
```

## Folders

- `theme/theme.json`: colours, sizes, spacing, density limits, handle. `theme/tmv.json` and
  `theme/tmv-study.json`: the Track My Visibility looks (`"theme"` in a storyboard)
- `scripts/render.py`: storyboard.json → .excalidraw. `scripts/build.py`: check + export.
  `animate.py`: carousel → mp4. `canvas.py`: talks. `broll.py`: b-roll video. `band.py`: the tmv-study layout.
  `studio_carousel.py`, `collage.py`: carousels from the video scenes / real cutouts. `scenes.py`: the scene ledger and
  check. `studio_sound.py`: SFX + music + loudness for videos. `matte.py`: cut him out of his footage
- `swipe/`: reference carousels, `hooks.md` (the hook pattern library), `visual-metaphors.md`, TMV style notes
- `visuals/`: the scene catalog, ledger, previews and reference sheets for videos and reels
- `assets/logos/`: official logo files, e.g. `chatgpt.svg`. `assets/library/`: the art library. `assets/fonts/`: the
  Helvetica Neue stand-in (TeX Gyre Heros). `assets/brand/`, `assets/sfx/`, `assets/refluke-broll/`
- `carousels/`, `video-slides/`, `stickers/`, `talks/`, `videos/`, `reel-creator/reels/`: one folder per piece
- `broll/`: the Remotion app. `reel-creator/`: reel design and reference teardowns. `raw/`: raw camera files
- `docs/archive/`: the two `CLAUDE.md` files and the old `HANDOFF.md` this one replaced

If Chrome isn't found, point to it: `CHROME="/path/to/browser" python3 scripts/build.py …`

## Keeping machines in sync

The project lives at `https://github.com/ajayjagtap33-debug/carousel-studio` (private). This folder is a git checkout
of it, kept level by `./sync.sh` (Mac) or `.\sync.ps1` (Windows) — one command that pulls, commits and pushes. It is safe
when nothing changed, and if the same file changed on both machines it stops before committing anything and prints the
exact commands to sort it out. Pass your own message if you want one: `./sync.sh "aeo checklist v2"`.

The branch `broll-treatment-rules` is pushed (2026-11-04) but not merged to `main`. `gh` lives in `~/.local/bin` (not on the
terminal PATH) and is logged in. `./sync.sh` is safe to use now.

Left out of the repo on purpose (large or machine-specific): `broll/node_modules/` (`cd broll && npm install`),
`tools/ffmpeg/`, `tools/node/`, `tools/bin/` (install ffmpeg and Node yourself on a new machine: `brew install ffmpeg
node` on Mac, `winget install ffmpeg` on Windows), `tools/rvm/`, `videos/`, and the reference frames and prompt archive
under `visuals/`. `raw/` is not git-ignored yet.
