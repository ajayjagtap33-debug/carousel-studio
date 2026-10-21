# Carousel studio

4:5 hand-drawn carousels: brief → storyboard (you approve) → Excalidraw → check → PNGs + LinkedIn PDF.
Claude reads `CLAUDE.md` for the full flow and rules.

## Setup (Mac)

1. Unzip anywhere, e.g. `~/creative-studio`.
2. You need **Python 3** (`python3 --version`; if it's missing, run `xcode-select --install`) and **Google Chrome** in `/Applications`.
   No pip packages are needed. The renderer loads Excalidraw from unpkg, so you need to be online.
3. Open the folder in Claude Code (`cd ~/creative-studio && claude`, or pick the folder in the desktop app).

## Use

Tell Claude: *"New carousel from this script: …"*. Or copy `templates/brief.md` into `carousels/<date>-<slug>/brief.md`, fill it in, and say *"make the carousel"*.

To run the scripts by hand (on Mac use `python3`):

```bash
python3 scripts/render.py carousels/2026-09-29-aeo-geo-checklist
python3 scripts/build.py carousels/2026-09-29-aeo-geo-checklist --export
```

Output lands in the carousel folder: `carousel.excalidraw` (open it at excalidraw.com to hand-edit), `slides/NN.png`, `carousel.pdf`.

## Folders

- `theme/theme.json`: colours, sizes, spacing, density limits, handle. `theme/tmv.json`: Track My Visibility look, landscape (`"theme": "tmv"` in a storyboard). `theme/tmv-study.json`: TMV study/report look (`scripts/band.py`). `assets/fonts/`: TeX Gyre Heros stand-in + where Helvetica Neue files go
- `scripts/render.py`: storyboard.json → .excalidraw. `scripts/build.py`: check + export
- `swipe/`: reference carousels + `hooks.md` (the hook pattern library)
- `assets/logos/`: official logo files, e.g. `chatgpt.svg` (empty for now)
- `carousels/`: one folder per carousel

If Chrome isn't found, point to it: `CHROME="/path/to/browser" python3 scripts/build.py …`

## On a new machine

```bash
git clone https://github.com/ajayjagtap33-debug/carousel-studio.git
cd carousel-studio
```

You need Python 3 and Google Chrome. No pip packages.

Three things are deliberately **not** in the repo, because they are large or machine-specific:

- `broll/node_modules/` — run `cd broll && npm install` to restore
- `tools/ffmpeg/` — install ffmpeg from your package manager (`brew install ffmpeg` on Mac, `winget install ffmpeg` on Windows) and make sure it's on `PATH`
- `videos/` — raw screen recordings and renders stay on the machine that made them

On Windows use `python` instead of `python3` in the commands above.

## Keeping machines in sync

One command, from inside the project folder. It pulls whatever the other machine
pushed, commits what you did here, and pushes it:

```bash
./sync.sh
```

```powershell
.\sync.ps1
```

Pass your own commit message if you want one: `./sync.sh "aeo checklist v2"`.
Without it, the message is `sync from <machine> <date>`.

Run it when you sit down and again when you stop. It is safe to run when nothing
has changed; it just says so. If the same file changed on both machines it stops
before committing anything and prints the exact commands to sort it out, so it
never pushes a half-merged file.
