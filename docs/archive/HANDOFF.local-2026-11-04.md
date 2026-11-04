# Handoff: carousel studio

Two handoffs live here. Read **Repo sync state** first — this folder is not level with
the GitHub repo, and that affects anything you render.

---

# Repo sync state (2026-10-21, re-checked 2026-10-25, re-checked against a live clone 2026-11-04)

This folder is **not a git repo**. The project now lives at
`https://github.com/ajayjagtap33-debug/carousel-studio` (private), which is kept in sync
between machines by `sync.sh` / `sync.ps1` (see the repo's README). `sync.sh` exits with
"Not a git repository" here, and `git pull` has nothing to pull into.

This copy predates that setup and has **diverged in both directions** from the repo's
`main`. Never overwrite this folder from the repo, and never copy this folder over a clone.

**Latest check, 2026-11-04:** a real `git clone` of `main` works from this machine over HTTPS
(no `gh auth login` was needed). `main` is `5057d24` (2026-10-23, 383 tracked files). That is the merge of
PR #1 `broll-treatment-rules`, so nothing has been pushed since the 2026-10-23 zip that the
sections below describe. Diff against this folder (excluding `.git`, `videos/`, `broll/node_modules/`,
`carousel-studio.zip`, `.DS_Store`, and the 4,797 files of `tools/node`):

- **19 top-level entries** only in the repo (see "Only in the repo" below)
- **23 top-level entries** only here (see "Only here" below)
- **71 shared files** differ in content: `CLAUDE.md`, `README.md`, `.gitignore`, `templates/brief.md`,
  `theme/theme.json`, `scripts/render.py` `build.py` `library.py` `broll.py`, `broll/src/Root.tsx`,
  `broll/src/editorial/*` (`Main` `frame` `kit` `lint` `scenes` `themes`), `broll/package-lock.json`,
  `assets/logos/immich.svg`, and re-rendered output of `carousels/2026-09-29-aeo-geo-checklist`,
  `2026-09-29-stay-human`, `video-slides/2026-10-08-social-seo-webinar` and `assets/library/preview/`.

The earlier 2026-10-21 diff (zip `carousel-studio-main.zip`, commit `4a97503`) was 229 only in the repo,
161 only here, 64 differing; most of the gap since closed by hand-copying.

To compare again without touching this folder: `git clone https://github.com/ajayjagtap33-debug/carousel-studio <scratch dir>`
and `diff -rq` against it. To get level for real, merge in a clone first (the carousel engine already is a union, see below; the editorial b-roll
engine is not), then push, and only then replace this folder with the clone.

## Only here — never pushed, would be lost by overwriting this folder

- `HANDOFF.md` (this file)
- Projects: `carousels/2026-09-29-tools-i-stopped-paying-for`, `carousels/2026-09-30-chatgpt-dots`,
  `video-slides/2026-09-29-aeo-geo-checklist`, `video-slides/2026-10-01-0-interviews-4-offers`,
  `stickers/2026-09-29-aeo-geo-checklist`, `stickers/2026-09-29-recordly-review`
- `video-slides/2026-10-08-social-seo-webinar/slides/15–18.png`
- `assets/brand/openai-dots/` (21 files), `swipe/logos/` (13 files)
- `assets/library/carousel-studio.excalidrawlib` (repo renamed it `creative-studio.excalidrawlib`)
- **The Refluke b-roll style** (added 2026-10-25, not in any zip or the repo): `broll/src/refluke/` (9 files),
  `assets/refluke-broll/` (118 files: `library.md`, preview frames, reel type-scale spike),
  `scripts/refluke_frames.py`, `scripts/reel_typescale.py`, `scripts/art_png.py`, and the refluke branches in
  `scripts/broll.py`, `broll/src/Root.tsx` and the `broll/src/` shared files. The repo's b-roll engine has only
  the `editorial` style.
- `tools/node/`, `tools/ffmpeg/`, `tools/bin/` (local toolchain). This copy's `.gitignore` excludes `tools/node/`
  and `tools/bin/`; the repo's does not, so copy that line in or `tools/node` (~4,800 files) gets committed.
- Also here but not worth pushing: `carousel-studio.zip` (28 MB).

## Only in the repo — this folder's engine is behind

Most of the 2026-10-21 list has since been copied in by hand: `scripts/animate.py`, `broll.py`, `band.py`
and `fontmetrics.py`, `theme/tmv.json` and `theme/tmv-study.json`, `.claude/skills/broll-video/`,
`assets/fonts/`, `broll/` as a Remotion app, and `sync.sh` / `sync.ps1` / `.gitignore` / `.gitattributes`
are all here now and byte-identical to the 2026-10-23 zip, as are `.claude/skills/broll-video/SKILL.md` and
`treatment-rules.md` (copied in on 2026-10-25). The rest of the b-roll engine the zip changed is still
behind — see below. What is still repo-only:

- `scripts/canvas.py` — the talks engine, so `talks/` can't be built here
- `swipe/visual-metaphors.md` (CLAUDE.md cites it) and `swipe/video slides (extra)/` (40 reference images)
- `specs/composite-video-module.md`, `talks/2026-10-23-grow-as-a-marketer/` (canvas.json, canvas.excalidraw,
  preview.png, run-sheet.md), and the repo's `assets/library/creative-studio.excalidrawlib` name
- `assets/logos/tmv-red.png` and `tmv-white.png`
- `video-slides/2026-10-08-social-seo-webinar/` `script.md`, `speaker-script.md`, `storyboard.v2-18slides.json`
  (the folder's own `storyboard.json` also differs, see the HANDOFF section further down)
- Projects: the whole `chatgpt-ads-study` family (`-tmv`, `-tmv-vertical`, `-tmv-v3`), `2026-10-05-appsumo-zero-ads`,
  `2026-10-05-automate-manual-first`, `2026-10-16-pick-prompts-to-track`,
  `2026-10-23-camera-presence-talk`

## The two engines are incompatible — not a superset either way

`scripts/render.py` `VIS` dispatch:

| | types |
|---|---|
| shared | `checklist` `scatter` `calendar` `layers` `cards` `logos` `stat` `comment_dm` `note` `bars` |
| only here | `fan` `art` `swap` `cut` `scene` `icons` |
| only in repo | `chat` `waffle` `split` `link` `pages` `versus` `prompt` |

**Six projects here would fail to render on the repo's engine**, because they use `fan`,
`art` or `scene`: `carousels/2026-09-30-chatgpt-dots`,
`video-slides/2026-09-29-aeo-geo-checklist`, `video-slides/2026-10-01-0-interviews-4-offers`,
`video-slides/2026-10-08-social-seo-webinar` (+ its `storyboard.v1-35slides.json`),
`stickers/2026-09-29-aeo-geo-checklist`, `stickers/2026-09-29-recordly-review`.

Note `art` is two different things: a **visual type** (`"visual": {"type": "art"}`, only
here) and a **slide field** (`"art": [{id, x, y, size}]`, in both). Only the visual type is missing.

## What changed in the repo since (seen 2026-10-25, repo files dated 2026-10-23)

Still a GitHub source zip, so still no way to sync — but the engine gap moved. New in the repo, not here:

- **Talks: `scripts/canvas.py` + `talks/`.** A new output that isn't a storyboard at all: a live talk as
  stations on one zoomable canvas (`canvas.json` + `run-sheet.md` → `canvas.excalidraw`, `preview.png`,
  `station-<id>.png`). It imports `render.py`, so it needs the repo's engine, not this one.
  Example: `talks/2026-10-23-grow-as-a-marketer/` (17 stations, ~8900×7400).
- **`specs/composite-video-module.md`** — a finished-video module (his cut composited inside the render,
  face as an animated crop). Written 2026-10-22, **superseded the same week**; kept for its layout and
  motion detail.
- **`.claude/skills/broll-video/treatment-rules.md`** — now the authority for what goes on screen per line:
  scene library, quotas (Told ≤ 35%, Shown + Captured ≥ 45%), script markup, the approval gate. Its own
  table marks most of it as designed-not-built. **Copied in on 2026-10-25**, with the `SKILL.md` that cites
  it; `excalidraw.md` is unchanged. The code those two describe (below) is still the repo's.
- **B-roll engine** (still repo-only): four new editorial scene types (`line`, `chips`, `rows`, `stats`) in `ESCENES` and
  `ETYPES`; `face` is now `left` / `right` / `none` (`box` / `hidden` are aliases) with a 604×842 face zone
  in `frame.tsx`; the tmv wordmark is copied into every editorial job; clip fades retry and report the ones
  that didn't come out.
- `swipe/visual-metaphors.md` (CLAUDE.md cites it; this folder doesn't have it) and `swipe/video slides (extra)/`.
- Carousels `2026-10-16-pick-prompts-to-track`, `2026-10-23-camera-presence-talk`, and `anim/` for
  `2026-09-29-stay-human`.

Still behind in the repo, so this folder is still the only place these work:

- No `slides` / `broll` formats. The repo's `render.py` has no `FORMATS` and its `build.py` is carousel-only
  ("content outside 4:5 frame"), so **video slides and stickers render only here**. Its
  `video-slides/2026-10-08-social-seo-webinar/` is a different 14-slide storyboard using types
  (`checks`, `paths`, `search`, `thennow`, `timeline`) that neither engine implements — it would not render
  anywhere. The 18-slide version here is the one that rendered.
- `VIS` still lacks `fan` `art` `swap` `cut` `scene` `icons`.
- `theme/theme.json` still has `accentDefault: violet`, no `sage` / `d_green`, and no `slides` / `broll`
  format blocks — decision 2 below still needs pushing back.
- `library.py` has 23 doodles (no `scissors` `toolbox` `tag` `bell` `calendar` `briefcase` `cap` `radar`
  `net`) and no `img.` brand-art branch, so `assets/brand/` art can't be drawn there.
- `templates/brief.md` dropped the "Format (required)" line, and `README.md` describes carousels only.

## Decisions taken (2026-10-21)

1. **Merge both engines.** *(Status 2026-11-04: `render.py` `VIS` here is already the union, 23 types incl. `chat` `waffle`
   `split` `link` `pages` `versus` `prompt` + `fan` `art` `swap` `cut` `scene` `icons`. Still unmerged: the editorial b-roll
   engine, where the repo's `scenes.tsx` / `frame.tsx` / `lint.tsx` / `broll.py` have `line` `chips` `rows` `stats`, `face: left|right|none`
   and the face-zone lint that this copy lacks, while this copy has the `refluke` style the repo lacks.)* `CLAUDE.md` now documents the union of both `VIS` tables. The code merge
   itself is still outstanding: `render.py` needs `fan`, `art`, `swap`, `cut`, `scene`, `icons` grafted
   onto the repo's version (which brings `chat`, `waffle`, `split`, `link`, `pages`, `versus`, `prompt`,
   plus `animate.py`, `broll.py`, `band.py`, `fontmetrics.py`). Until that lands, this copy renders only
   the hand-drawn side and the repo's copy renders only the TMV side.
2. **Brand green stays the default.** `green` #2C6650 leads every single-colour element in the default
   theme; `tmv` and `tmv-study` override it, because those are the Track My Visibility brand. The repo's
   `CLAUDE.md` lost this rule because that machine never had it — it needs pushing back.
3. **`broll/` → `stickers/`.** Done. The two sticker projects moved to `stickers/`, freeing `broll/` for
   the repo's Remotion app and `videos/` for its projects. Safe because `broll` is only a format *value*
   (`FORMATS = ("carousel", "slides", "broll")`, `FMT == "broll"`) read from the storyboard — no script
   hardcodes the folder path. The format key is still `"broll"`; renaming it means touching `render.py`,
   `build.py` and `theme.json`, so it waits for the engine merge.

## Also worth knowing

- `carousel-studio.zip` (28 MB) sits in this folder. The repo's `.gitignore` does not
  exclude it; it should be removed or ignored before any commit.
- The repo `.gitignore` excludes `videos/`, `broll/node_modules/`, `tools/ffmpeg/`, `.DS_Store`.
- The repo's `CLAUDE.md` cites `videos/2026-10-19-*` as b-roll examples. Those are
  gitignored, so they exist only on the machine that made them.

---

# Handoff: Social SEO webinar deck (2026-10-08)

Notes from the Claude Code session that built this deck, so you (or Claude) can pick up on another computer.

## Where things are

- Deck: `video-slides/2026-10-08-social-seo-webinar/`
  - `slides.pdf`: present from this. `slides/01–18.png`: 1920×1080. `slides.excalidraw`: hand edits.
  - `brief.md`: the webinar run of show. `storyboard.md`: review sheet (18 slides, v2). `storyboard.json`: render input.
  - `storyboard.v1-35slides.json`: the first 35-slide version, in case a cut slide is wanted back.

## What was decided

- Format: video slides (16:9). Live moments get a **cue slide only** (no backup screenshots). No Q&A slide.
- v2 (Ajay's call): 15–20 slides max for the 30-minute session. His cited videos show up within the first 5 minutes,
  stats sit on 3 slides only, and the 90-day plan is one slide.
- Data on slide 9 comes from the TMV study "Google AI Overviews vs. Gemini" (383,188 citations, 64 ecommerce brands):
  https://trackmyvisibility.com/blogs/llm-behavior/google-ai-overviews-vs-gemini-citations
- 83% of branded searches stat: Ahrefs (Ryan Law), Oct 2026.

## What changed in the studio

- New visual type `bars` in `scripts/render.py` (documented in CLAUDE.md). The repo has `bars` too.
- New logos in `assets/logos/`: google, gemini, chatgpt, perplexity, youtube, reddit, linkedin, instagram, tiktok,
  facebook, x, wikipedia, trackmyvisibility. Google, Gemini, YouTube, LinkedIn, Perplexity, TikTok and TMV came from
  their own sites; Instagram, Wikipedia, Facebook, X and ChatGPT from Wikimedia Commons (copies of the official marks).
  Swap in press-kit files if you want them strict.
- Note: `assets/logos/openai.svg` is the OpenAI dots art, not the ChatGPT mark. Use `chatgpt` for ChatGPT.

## Re-render on the new computer

```bash
python3 scripts/render.py video-slides/2026-10-08-social-seo-webinar
python3 scripts/build.py video-slides/2026-10-08-social-seo-webinar --export
```

Setup is in `README.md` (Python 3 + Google Chrome, online; no pip installs).
To continue with Claude: open this folder in Claude Code and say "read HANDOFF.md, then …".
