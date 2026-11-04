"""The mixed look for hand-drawn carousels: real cutouts and clean video scenes on an Excalidraw slide, with marks
drawn over them so the three layers read as one page (carousels/2026-10-31-stay-human-mix/storyboard.md).

A slide's "art" list takes, besides library art ({"id": "person.read", ...}), in draw order (later = on top):
  {"cutout": "cutouts/book.png", "x", "y", "size" (width px), "tilt"?: deg, "key"?: "white" | "grab", "crop"?: [x0,y0,x1,y1],
   "edge"?: px, "photo"?: true}
      A real photo. PNG with alpha is used as is; "key": "white" removes a plain light background, "grab" separates the
      object from a busy one (OpenCV GrabCut); "crop" trims the photo first (fractions). The cutout gets a
      white sticker edge and a soft shadow. "photo": true keeps the rectangle and gives it a white print border instead.
  {"scene": {studio scene fields, times from 0}, "x", "y", "w", "h", "palette"?: "ajay" | "tmv"}
      A clean piece: any video scene (broll/src/studio), rendered transparent by Remotion (SceneCard) to
      <folder>/scenes/<hash>.png, in the carousel's accent. Rendered before the slides draw; cached by content.
  {"mark": "arrow" | "line" | "poly" | "circle" | "strike" | "scribble" | "label" | "tape", ...}
      Hand-drawn marks on top: arrow/line/strike {pts, c?, sw?}, poly {pts, c?, bg?, fill?}, circle/scribble {x, y, w, h, c?, bg?},
      label {x, y, text, size?, c?, align?, angle?}, tape {x, y, w, angle?}.
x/y are slide coordinates (0..1080, 0..1350), like library art.
"""
import hashlib, json, math, shutil, subprocess, tempfile
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
R = None  # render module


def use(r):
    global R; R = r


# ---------------------------------------------------------------- cutouts
def _key_white(im: Image.Image, tol: int = 28) -> Image.Image:
    """Remove a plain light background: flood-fill from the border over near-white pixels, feather the edge."""
    rgb = im.convert("RGB"); w, h = rgb.size
    mask = Image.new("L", (w + 2, h + 2), 0)
    seedimg = Image.new("RGB", (w + 2, h + 2), (255, 255, 255)); seedimg.paste(rgb, (1, 1))
    ImageDraw.floodfill(seedimg, (0, 0), (255, 0, 255), thresh=tol)  # magenta = background reachable from the edge
    bg = Image.eval(ImageChops.difference(seedimg, Image.new("RGB", seedimg.size, (255, 0, 255))).convert("L"), lambda v: 255 if v < 8 else 0)
    alpha = Image.eval(bg.crop((1, 1, w + 1, h + 1)), lambda v: 255 - v).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    out = im.convert("RGBA"); out.putalpha(ImageChops.multiply(out.getchannel("A"), alpha)); return out


def _key_grab(im: Image.Image, inset: float = 0.03) -> Image.Image:
    """Separate the object from a busy background with OpenCV GrabCut, seeded by a rectangle just inside the frame."""
    import cv2, numpy as np
    rgb = np.array(im.convert("RGB"))[:, :, ::-1].copy(); h, w = rgb.shape[:2]
    k = 900 / max(w, h); small = cv2.resize(rgb, (int(w * k), int(h * k))) if k < 1 else rgb
    sh, sw = small.shape[:2]; m = np.zeros((sh, sw), np.uint8)
    rect = (int(sw * inset), int(sh * inset), int(sw * (1 - 2 * inset)), int(sh * (1 - 2 * inset)))
    cv2.grabCut(small, m, rect, np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64), 6, cv2.GC_INIT_WITH_RECT)
    fg = np.where((m == cv2.GC_FGD) | (m == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(fg)  # keep the biggest piece: stray background blobs go
    if n > 1: fg = np.where(lab == 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA])), 255, 0).astype(np.uint8)
    fg = cv2.resize(fg, (w, h), interpolation=cv2.INTER_LINEAR)
    a = Image.fromarray(fg).filter(ImageFilter.GaussianBlur(1.5))
    out = im.convert("RGBA"); out.putalpha(a); return out


def _sticker(src: Path, spec: dict) -> Path:
    key = hashlib.sha1((str(src.stat().st_mtime) + json.dumps({k: spec.get(k) for k in ("size", "tilt", "key", "edge", "photo", "shadow", "crop", "inset")})).encode()).hexdigest()[:12]
    out = src.parent / ".cache" / f"{src.stem}-{key}.png"
    if out.exists(): return out
    out.parent.mkdir(exist_ok=True)
    im = Image.open(src).convert("RGBA")
    if spec.get("crop"):  # [x0, y0, x1, y1] as fractions of the photo
        x0, y0, x1, y1 = spec["crop"]; im = im.crop((int(x0 * im.width), int(y0 * im.height), int(x1 * im.width), int(y1 * im.height)))
    if spec.get("key") == "white": im = _key_white(im)
    elif spec.get("key") == "grab": im = _key_grab(im, spec.get("inset", 0.03))
    if not spec.get("photo"):
        bbox = im.getchannel("A").point(lambda v: 255 if v > 20 else 0).getbbox()
        if bbox: im = im.crop(bbox)
    W = int(spec.get("size", 400)); im = im.resize((W, max(1, round(im.height * W / im.width))), Image.LANCZOS)
    edge = int(spec.get("edge", 0 if spec.get("photo") else 9)); pad = edge + 30
    canvas = Image.new("RGBA", (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0))
    if spec.get("photo"):  # a print: white border round the rectangle
        b = int(spec.get("border", 14))
        card = Image.new("RGBA", (im.width + 2 * b, im.height + 2 * b), (255, 255, 255, 255)); card.alpha_composite(im, (b, b))
        im, pad = card, 30
        canvas = Image.new("RGBA", (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0))
        silhouette = Image.new("L", canvas.size, 0); silhouette.paste(255, (pad, pad, pad + im.width, pad + im.height))
    else:  # a sticker: white edge following the shape
        a = Image.new("L", canvas.size, 0); a.paste(im.getchannel("A"), (pad, pad))
        silhouette = a.filter(ImageFilter.MaxFilter(edge * 2 + 1)).filter(ImageFilter.GaussianBlur(1)) if edge else a
    if spec.get("shadow", True):
        sh = Image.new("RGBA", canvas.size, (30, 30, 30, 0)); sh.putalpha(silhouette.point(lambda v: int(v * 0.28)))
        sh = sh.filter(ImageFilter.GaussianBlur(10)); canvas.alpha_composite(sh, (0, 10))
    if not spec.get("photo") and edge:
        white = Image.new("RGBA", canvas.size, (255, 255, 255, 0)); white.putalpha(silhouette); canvas.alpha_composite(white)
    canvas.alpha_composite(im, (pad, pad))
    if spec.get("tilt"): canvas = canvas.rotate(-spec["tilt"], resample=Image.BICUBIC, expand=True)
    canvas.save(out); return out


def cutout(a: dict, folder: Path, ox: float) -> None:
    src = folder / a["cutout"]
    if not src.exists():
        R.rect(ox + a["x"], a["y"], a.get("size", 300), a.get("size", 300) * 0.75, "grey", "l_grey", style="dashed",
               data={"flag": "missing-cutout", "src": a["cutout"]})
        R.ctext(ox + a["x"] + a.get("size", 300) / 2, a["y"] + a.get("size", 300) * 0.375, f"[CUTOUT]\n{a['cutout']}", 30, "grey")
        R.FLAGS.append({"flag": "missing-cutout", "src": a["cutout"]}); return
    p = _sticker(src, a)  # already at slide scale (1 px = 1 px); its padding holds the edge and shadow
    w, h = Image.open(p).size
    W = a.get("size", 400) + 2 * (int(a.get("border", 14)) if a.get("photo") else 0)
    R.image(p, ox + a["x"] - (w - W) / 2, a["y"] - (w - W) / 2, w, h)


# ---------------------------------------------------------------- clean scenes
def _accent(acc: str) -> dict:
    return {"accent": R.col(acc), "soft": R.col(f"l_{acc}"), "tint": R.col(f"l_{acc}")}


def _scene_png(a: dict, folder: Path, acc: str) -> tuple[Path, dict]:
    props = {"theme": a.get("palette", "ajay"), "scene": a["scene"], "w": a["w"], "h": a["h"], "accent": _accent(acc)}
    key = hashlib.sha1(json.dumps(props, sort_keys=True).encode()).hexdigest()[:12]
    return folder / "scenes" / f"{a['scene']['type']}-{key}.png", props


def _last(v) -> float:
    if isinstance(v, dict): return max([x if isinstance(x, (int, float)) and (k == "at" or k.endswith("At")) else _last(x) for k, x in v.items()] + [0])
    if isinstance(v, list): return max([_last(x) for x in v] + [0])
    return 0


def prepare_scenes(sb: dict, folder: Path, acc: str) -> None:
    """Render every scene card the storyboard uses that isn't cached yet, in one Remotion bundle."""
    todo = []
    for sd in sb["slides"]:
        for a in sd.get("art", []):
            if "scene" not in a: continue
            sc = a["scene"]; sc.setdefault("start", 0); sc.setdefault("end", _last(sc) + 1.2)
            png, props = _scene_png(a, folder, acc)
            if not png.exists() and all(png != t[0] for t in todo): todo.append((png, props))
    if not todo: return
    (folder / "scenes").mkdir(exist_ok=True)
    pub = Path(tempfile.mkdtemp(prefix="collage-pub-"))
    shutil.copytree(ROOT / "assets" / "logos", pub / "logos")
    for d in ("cutouts", "shots"):
        if (folder / d).is_dir(): shutil.copytree(folder / d, pub / d)
    job = {"comp": "SceneCard", "props": todo[0][1], "publicDir": str(pub), "concurrency": 3,
           "stills": [{"frame": max(0, int(p["scene"]["end"] * 30) - 1), "out": str(png), "props": p} for png, p in todo]}
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as f:
        json.dump(job, f); jp = f.name
    print(f"rendering {len(todo)} scene card(s)")
    subprocess.run(["node", str(ROOT / "broll" / "shoot.mjs"), jp], cwd=ROOT / "broll", check=True)
    Path(jp).unlink(); shutil.rmtree(pub, ignore_errors=True)


def scene(a: dict, folder: Path, ox: float, acc: str) -> None:
    png, _ = _scene_png(a, folder, acc)
    if png.exists(): R.image(png, ox + a["x"], a["y"], a["w"], a["h"])
    else: R.FLAGS.append({"flag": "missing-scene", "type": a["scene"]["type"]})


# ---------------------------------------------------------------- hand-drawn marks
def mark(a: dict, ox: float, acc: str) -> None:
    c = a.get("c", acc); sw = a.get("sw", 4); m = a["mark"]
    P = lambda pts: [(ox + x, y) for x, y in pts]
    if m == "arrow": R.arrow(P(a["pts"]), c, sw=sw, curve=len(a["pts"]) > 2)
    elif m in ("line", "underline"): R.line(P(a["pts"]), c, sw=sw, curve=len(a["pts"]) > 2)
    elif m == "strike": R.line(P(a["pts"]), a.get("c", "red"), sw=a.get("sw", 6))
    elif m == "circle": R.ellipse(ox + a["x"], a["y"], a["w"], a["h"], c, a.get("bg"), sw=sw)
    elif m == "poly":  # a closed hand-drawn shape: a phone lying flat, a page, a checkbox
        pts = P(a["pts"]); R.line(pts + [pts[0]], c, sw=sw, backgroundColor=R.col(a.get("bg")) if a.get("bg") else "transparent",
                                  fill=a.get("fill", "solid"))
    elif m == "scribble":
        x, y, w, h = ox + a["x"], a["y"], a["w"], a["h"]; n = int(a.get("n", 9))
        pts = [(x + (i % 2) * w + (i * 7 % 13) - 6, y + i * h / n) for i in range(n + 1)]
        R.line(pts, c, sw=sw, curve=True)
    elif m == "label":
        R.text(ox + a["x"], a["y"], a["text"], a.get("size", 36), a.get("c", "ink"), a.get("align", "left"),
               angle=math.radians(a.get("angle", 0)))
    elif m == "tape":  # a strip of washi tape holding a cutout down
        R.rect(ox + a["x"], a["y"], a.get("w", 150), 42, "l_yellow", "l_yellow", round_=False, opacity=75,
               angle=math.radians(a.get("angle", -8)), rough=0)
