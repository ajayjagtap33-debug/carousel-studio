"""Carousels in the studio look ("theme": "studio" in storyboard.json): 4:5 slides built from the video scenes.

  python scripts/studio_carousel.py carousels/<folder>            slides/NN.png + carousel.pdf (each slide's last frame)
  python scripts/studio_carousel.py carousels/<folder> --anim     + anim/carousel.mp4 (every slide builds, then slides on)
  python scripts/studio_carousel.py carousels/<folder> --gif      + anim/NN.gif (one looping GIF per slide)

Rendered by Remotion (broll/, composition "Carousel"); the hand-drawn themes stay on render.py / build.py.
Storyboard: the usual slide fields (headline lines with {"t", "c": "accent"}, headlineSize, number, qualifier, body,
source) plus `scene`: any studio scene type with its fields, times in seconds from the slide's start. `dur` sets a
slide's length (default: its last cue + 2.5s). `"palette"`: "ajay" (olive, default) or "tmv" (red).
Assets the scenes reference (logos/…) resolve against assets/ first, then the carousel folder.
"""
from __future__ import annotations
import argparse, json, shutil, subprocess, sys, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).parent))
from scenes import shift  # noqa: E402
from broll import ffmpeg  # noqa: E402  (same ffmpeg lookup as the rest of the pipeline)

FPS = 30
LEAD = 0.6   # the scene starts after the headline has landed
HOLD = 2.5


def last_cue(v) -> float:
    """The latest time anywhere in a scene's fields (relative)."""
    if isinstance(v, dict):
        return max([last_cue(x) if not isinstance(x, (int, float)) else (x if (k == "at" or k.endswith("At")) else 0) for k, x in v.items()] + [0])
    if isinstance(v, list): return max([last_cue(x) for x in v] + [0])
    return 0


def props_for(sb: dict) -> dict:
    slides, t = [], 0.0
    for s in sb["slides"]:
        sc = s.get("scene")
        dur = s.get("dur") or max(4.5, LEAD + (last_cue(sc) + 1.2 if sc else 0) + HOLD)
        slide = {k: s[k] for k in ("number", "headline", "headlineSize", "qualifier", "body") if k in s}
        slide.update(start=t, dur=dur)
        if sc:
            slide["scene"] = {**shift(sc, t + LEAD), "start": t + LEAD - 0.2, "end": t + dur, "slug": sc["type"], "source": s.get("source", "")}
        slides.append(slide); t += dur
    return {"theme": sb.get("palette", "ajay"), "handle": "@theajayjagtap" if sb.get("handle", True) else False, "slides": slides}


def public_dir(folder: Path) -> Path:
    """One public dir for the render: assets/ (logos, fonts) with the carousel's own files laid over it."""
    pub = Path(tempfile.mkdtemp(prefix="carousel-pub-"))
    shutil.copytree(ROOT / "assets" / "logos", pub / "logos")
    for p in folder.iterdir():
        if p.is_dir() and p.name not in ("slides", "anim"): shutil.copytree(p, pub / p.name, dirs_exist_ok=True)
        elif p.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp", ".svg"): shutil.copy(p, pub / p.name)
    return pub


def shoot(job: dict) -> None:
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as f:
        json.dump(job, f); path = f.name
    subprocess.run(["node", str(ROOT / "broll" / "shoot.mjs"), path], cwd=ROOT / "broll", check=True)
    Path(path).unlink()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("folder", type=Path)
    ap.add_argument("--anim", action="store_true")
    ap.add_argument("--gif", action="store_true")
    a = ap.parse_args()
    folder = a.folder.resolve()
    sb = json.loads((folder / "storyboard.json").read_text(encoding="utf-8"))
    if sb.get("theme") != "studio": sys.exit('storyboard.json needs "theme": "studio" (other themes: scripts/render.py + build.py)')
    props = props_for(sb)
    (folder / "slides").mkdir(exist_ok=True)
    pub = public_dir(folder)
    job = {"comp": "Carousel", "props": props, "publicDir": str(pub), "concurrency": 3,
           "stills": [{"frame": int((s["start"] + s["dur"]) * FPS) - 2, "out": str(folder / "slides" / f"{i + 1:02d}.png"), "scale": 1}
                      for i, s in enumerate(props["slides"])]}
    anim = folder / "anim"
    if a.anim or a.gif:
        anim.mkdir(exist_ok=True)
        end = props["slides"][-1]["start"] + props["slides"][-1]["dur"]
        job["clips"] = [{"from": 0, "to": int(round(end * FPS)) - 1, "out": str(anim / "carousel.mp4"), "muted": True}]  # frames
    print(f"rendering {len(props['slides'])} slides" + (" + animation" if "clips" in job else ""))
    shoot(job)
    shutil.rmtree(pub, ignore_errors=True)

    from PIL import Image
    pngs = sorted((folder / "slides").glob("*.png"))
    ims = [Image.open(p).convert("RGB") for p in pngs]
    ims[0].save(folder / "carousel.pdf", save_all=True, append_images=ims[1:], resolution=144)
    print(f"{len(pngs)} slides + carousel.pdf in {folder.relative_to(ROOT).as_posix()}")

    if a.gif:
        for i, s in enumerate(props["slides"]):
            out = anim / f"{i + 1:02d}.gif"
            # the slide on its own: skip the incoming transition, build + hold, loop forever
            ss, d = s["start"] + (0.5 if i else 0), s["dur"] - (0.5 if i else 0)
            vf = "fps=15,scale=720:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4"
            subprocess.run([ffmpeg(), "-y", "-loglevel", "error", "-ss", f"{ss:.2f}", "-t", f"{d:.2f}", "-i", str(anim / "carousel.mp4"),
                            "-vf", vf, "-loop", "0", str(out)], check=True)
            print(f"{out.relative_to(ROOT).as_posix()}: {out.stat().st_size / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
