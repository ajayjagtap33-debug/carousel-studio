"""PPT-style build animation: each slide reveals its parts one after another, then moves to the next.

  python scripts/animate.py carousels/<folder>              # anim/carousel.mp4 (whole carousel, one video)
  python scripts/animate.py carousels/<folder> --per-slide  # also anim/NN.mp4 (one clip per slide, for Instagram)

Needs a rendered carousel.excalidraw (render.py tags every element with a build step:
0 = always there (chrome), 1 = headline, then qualifier, body, visual (cards one by one), each art piece, footer).
Frames are rendered with the same headless Chrome as build.py; ffmpeg joins them with fades.
"""
import json, shutil, subprocess, sys, threading
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build  # noqa: E402
from render import load_theme  # noqa: E402

FPS = 30
STEP_FADE = 0.35     # fade-in of each new element group
SLIDE_T = 0.5        # slide-to-slide transition
BUILD_HOLD = 0.55    # pause after each build step
FIRST_HOLD = 0.25    # empty slide (chrome only) before the first build
READ_HOLD = 3.0      # full slide stays up this long
LAST_HOLD = 4.0
LOCK = threading.Lock()


def step_of(e):
    return (e.get("customData") or {}).get("step") or 0


def frames(d, doc):
    """[(slide index, [png per step])], rendering each cumulative step as its own PNG."""
    fr = [e for e in doc["elements"] if e["type"] == "frame"]
    out_dir = d / "anim" / "frames"; out_dir.mkdir(parents=True, exist_ok=True)
    jobs, plan = [], []
    for i, f in enumerate(fr):
        mine = [e for e in doc["elements"] if e.get("frameId") == f["id"]]
        steps = sorted({step_of(e) for e in mine}) or [0]
        pngs = []
        for k in steps:
            keep = {e["id"] for e in mine if step_of(e) <= k}
            sub = dict(doc, elements=[e for e in doc["elements"]
                                      if e["type"] == "frame" or e.get("frameId") != f["id"] or e["id"] in keep])
            png = out_dir / f"{i+1:02d}_{k:02d}.png"
            jobs.append((i, k, sub, png)); pngs.append(png)
        plan.append((i, pngs))

    def shoot(job):
        i, k, sub, png = job
        with LOCK:  # build.page writes a fixed filename per slide
            html = build.page(d, sub, "slide", i)
            tagged = html.with_name(f"_build_anim_{i}_{k}.html"); html.replace(tagged)
        ok = build.retry(lambda: build.chrome([f"--screenshot={png}", f"--window-size={build.W},{build.H}", tagged.as_uri()]), png, 3000)
        tagged.unlink(missing_ok=True)
        return png, ok

    with ThreadPoolExecutor(4) as ex:
        bad = [p.name for p, ok in ex.map(shoot, jobs) if not ok]
    if bad: sys.exit(f"frames failed to render (CDN?): {bad}; re-run")
    print(f"rendered {len(jobs)} build frames for {len(fr)} slides -> {out_dir}")
    return plan


def clips(plan, n, whole):
    """Flatten to [(png, hold, transition-to-next)] for one video."""
    seq = []
    for i, pngs in plan:
        for j, png in enumerate(pngs):
            last_step = j == len(pngs) - 1
            hold = (LAST_HOLD if i == n - 1 else READ_HOLD) if last_step else FIRST_HOLD if j == 0 else BUILD_HOLD
            nxt = (SLIDE_T if whole else 0) if last_step else STEP_FADE
            seq.append((png, hold, nxt, last_step))
    seq[-1] = seq[-1][:2] + (0, True)
    return seq


def encode(seq, out, w, h):
    import os
    local = sorted(build.ROOT.glob("tools/ffmpeg*/**/ffmpeg.exe")) + sorted(build.ROOT.glob("tools/ffmpeg*/**/bin/ffmpeg"))
    ff = os.environ.get("FFMPEG") or shutil.which("ffmpeg") or (str(local[0]) if local else None)
    if not ff: sys.exit("ffmpeg not found: install it, unzip a build into tools/ffmpeg/, or set FFMPEG=/path/to/ffmpeg; frames are in anim/frames/")
    args, filt, prev_t, acc, label = [ff, "-y", "-loglevel", "error"], [], 0, 0.0, "0:v"
    durs = []
    for k, (png, hold, t, _) in enumerate(seq):
        dur = hold + prev_t + t
        durs.append(dur); prev_t = t
        args += ["-loop", "1", "-framerate", str(FPS), "-t", f"{dur:.3f}", "-i", str(png)]
    for k in range(len(seq)):
        filt.append(f"[{k}:v]scale={w}:{h},setsar=1,format=yuv420p,fps={FPS}[s{k}]")
    label = "s0"; acc = durs[0]
    for k in range(1, len(seq)):
        t = seq[k - 1][2]
        kind = "slideleft" if seq[k - 1][3] else "fade"
        filt.append(f"[{label}][s{k}]xfade=transition={kind}:duration={t:.3f}:offset={acc - t:.3f}[x{k}]")
        label = f"x{k}"; acc += durs[k] - t
    args += ["-filter_complex", ";".join(filt), "-map", f"[{label}]", "-c:v", "libx264", "-pix_fmt", "yuv420p",
             "-r", str(FPS), "-movflags", "+faststart", str(out)]
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode: sys.exit(f"ffmpeg failed:\n{r.stderr[-1500:]}")
    print(f"video {out.name}: {acc:.1f}s")


def main(folder, per_slide):
    d = (build.ROOT / folder).resolve()
    sb = json.loads((d / "storyboard.json").read_text(encoding="utf-8"))
    build.T = load_theme(sb.get("theme"), sb.get("format"))
    build.W, build.H, build.M = build.T["size"]["w"], build.T["size"]["h"], build.T["size"]["margin"]
    doc = json.loads((d / "carousel.excalidraw").read_text(encoding="utf-8"))
    plan = frames(d, doc)
    n = len(plan)
    if n > 1 or not per_slide:
        encode(clips(plan, n, True), d / "anim" / "carousel.mp4", build.W, build.H)
    if per_slide:
        for i, pngs in plan:
            encode(clips([(i, pngs)], n, False), d / "anim" / f"{i+1:02d}.mp4", build.W, build.H)


if __name__ == "__main__":
    main(sys.argv[1], "--per-slide" in sys.argv)
