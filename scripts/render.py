"""storyboard.json -> <format>.excalidraw (one frame per slide).

storyboard.json "format" picks the output and the theme's format block:
  carousel (default)  1080x1350 4:5 LinkedIn carousel       -> carousel.excalidraw
  slides              1600x900 16:9 video slides (1920 out)  -> slides.excalidraw
  broll               overlay stickers, each cropped to its own content (any shape),
                      transparent PNGs to lay over any video -> broll.excalidraw
  landscape           1920x1080 single image (carousel output)
  square              1080x1080 social creative (carousel output)
  portrait            the tmv theme's vertical 1080x1350 (carousel output)

"theme" picks the look: default (hand-drawn, brand green), "tmv", "tmv-study" (band layout).

Usage: python3 scripts/render.py <folder>
"""
import base64, json, random, re, struct, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# output formats: what gets written and how a slide is laid out.
# Every other "format" value is a theme format block only and renders like a carousel.
FORMATS = ("carousel", "slides", "broll")


def out_format(fmt=None):
    """The output format for a storyboard "format" value (theme-only formats render as carousels)."""
    return fmt if fmt in FORMATS else "carousel"


def load_theme(name=None, fmt=None):
    """theme.json, with theme/<name>.json merged over it (e.g. "tmv"), then that theme's
    "formats"[fmt] block (e.g. "slides", "portrait") if the storyboard asks for one."""
    t = json.loads((ROOT / "theme" / "theme.json").read_text(encoding="utf-8"))
    def merge(a, b):
        for k, v in b.items():
            if isinstance(v, dict) and isinstance(a.get(k), dict): merge(a[k], v)
            else: a[k] = v
    def layer(n):  # a theme can "extends" another theme
        th = json.loads((ROOT / "theme" / f"{n}.json").read_text(encoding="utf-8"))
        if th.get("extends"): layer(th["extends"])
        merge(t, th)
    if name and name != "default": layer(name)
    if fmt and fmt != "carousel":  # carousel = the top-level values, no block of its own
        if fmt not in t.get("formats", {}): sys.exit(f"theme {name or 'default'} has no format {fmt!r}")
        merge(t, t["formats"][fmt])
    return t


def set_theme(name=None, fmt=None):
    global T, C, S, TY, F, SP, D, W, H, M, CW, BOTTOM, FMT
    T = load_theme(name, fmt)
    FMT = out_format(fmt)
    METRICS.clear()
    wf = T.get("webFont", {})
    for k, p in wf.get("metrics", {}).items():  # exact text widths from a font file
        from fontmetrics import Metrics
        key = wf["family"].lower().replace(" ", "")  # the real primary font wins if its files are in assets/fonts
        real = [f for f in sorted((ROOT / "assets" / "fonts").glob("*.[ot]tf"))
                if key in f.name.lower().replace("-", "").replace(" ", "") and "italic" not in f.name.lower()
                and (("bold" in f.name.lower()) == (k == "bold")) and not re.search(r"light|thin|medium|heavy|black", f.name.lower())]
        METRICS[k] = Metrics(real[0] if real else ROOT / p)
    C = T["colors"]; S = T["size"]; TY = T["type"]; F = T["font"]; SP = T["spacing"]; D = T["density"]
    W, H, M = S["w"], S["h"], S["margin"]
    CW = W - 2 * M            # content width
    # carousel: visuals must end above the chrome row. slides/broll carry their own chrome.
    BOTTOM = H - M - 60 if FMT == "carousel" else H - M


def palette(bg):
    """Colour names for one slide: text and tints flip on dark backgrounds."""
    global C
    over = T.get("backgrounds", {}).get(bg, {}).get("colors", {})
    C = {**T["colors"], **(T[over] if isinstance(over, str) else over)}


METRICS = {}
set_theme()
E, FILES, FLAGS = [], {}, []
SB = {}                   # the storyboard being rendered (chrome switches read it)
_n = 0
cur_frame = None
ART = False               # True while drawing library art (keeps its ink outlines)
random.seed(11)


def nid():
    global _n; _n += 1; return f"e{_n}"


def col(c):
    return C.get(c, c) if c else "transparent"


STEP = None  # build step for animate.py (0 = always visible); None outside portrait/landscape slides


def step(n="next"):
    """Start a new build step (animate.py reveals steps one by one, like PPT clicks). step(None) turns tagging off."""
    global STEP
    STEP = (STEP or 0) + 1 if n == "next" else n


def base(t, x, y, w, h, stroke="ink", bg=None, **kw):
    fill = kw.pop("fill", "solid")
    if fill == "hachure" and T.get("flatFill"): fill = "solid"
    e = dict(id=nid(), type=t, x=x, y=y, width=w, height=h, angle=kw.pop("angle", 0),
             strokeColor=col(stroke), backgroundColor=col(bg), fillStyle=fill,
             strokeWidth=kw.pop("sw", 2), strokeStyle=kw.pop("style", "solid"),
             roughness=kw.pop("rough", T.get("roughness", 1)), opacity=100, groupIds=[], frameId=cur_frame,
             roundness=kw.pop("roundness", None), seed=random.randint(1, 2**31), version=1,
             versionNonce=random.randint(1, 2**31), isDeleted=False, boundElements=[],
             updated=1, link=None, locked=False, customData=kw.pop("data", None))
    if STEP is not None: e["customData"] = dict(e["customData"] or {}, step=STEP)
    e.update(kw); E.append(e); return e


def rect(x, y, w, h, stroke="ink", bg=None, round_=True, **kw):
    if stroke == "ink" and not ART and "border" in C: stroke = "border"  # formal: hairline cards
    return base("rectangle", x, y, w, h, stroke, bg, roundness={"type": 3} if round_ else None, **kw)


def ellipse(x, y, w, h, stroke="ink", bg=None, **kw):
    return base("ellipse", x, y, w, h, stroke, bg, **kw)


def tw(s, size, bold=False, tight=False, wide=None):
    m = METRICS.get("bold" if bold else "regular")
    if not m: return len(s) * size * F["charWidth"]
    w = m.width(s, size)
    if tight: w -= 0.035 * size * len(s)            # matches build.py letter-spacing
    if wide is None:                                # no explicit flag: short ALL-CAPS labels are letter-spaced
        wide = size <= 36 and re.search(r"[A-Z]{2}", s) and not re.search(r"[a-z]", s)
    if wide: w += 0.12 * size * len(s)
    return w


def wrap(s, size, width):
    lines = _greedy(s, size, width)
    if len(lines) < 2: return lines
    lo = max(tw(w, size) for w in s.split())
    target = max(lo, tw(s, size) / len(lines))
    while target < width:
        cand = _greedy(s, size, target)
        if len(cand) == len(lines): return cand
        target += size
    return lines


def _greedy(s, size, width):
    out = []
    for para in s.split("\n"):
        line = ""
        for word in para.split():
            cand = (line + " " + word).strip()
            if tw(cand, size) > width and line:
                out.append(line); line = word
            else:
                line = cand
        out.append(line)
    return out


def text(x, y, s, size, color="ink", align="left", width=None, lh=None, **kw):
    """Draws text; wraps to `width` if given. Returns bottom y."""
    lh = lh or F["lineHeight"]
    lines = wrap(s, size, width) if width else s.split("\n")
    s = "\n".join(lines)
    w = max(tw(l, size) for l in lines); h = len(lines) * size * lh
    if align == "center": x -= w / 2
    base("text", x, y, w, h, color, None, text=s, originalText=s, fontSize=size,
         fontFamily=F["family"], textAlign=align, verticalAlign="top", containerId=None,
         lineHeight=lh, autoResize=True, **kw)
    return y + h


def ctext(cx, cy, s, size, color="ink", **kw):
    n = s.count("\n") + 1
    return text(cx, cy - n * size * F["lineHeight"] / 2, s, size, color, "center", **kw)


def line(pts, stroke="ink", t="line", **kw):
    x0, y0 = pts[0]; rel = [[a - x0, b - y0] for a, b in pts]
    xs = [p[0] for p in rel]; ys = [p[1] for p in rel]
    if kw.pop("curve", False): kw["roundness"] = {"type": 2}
    return base(t, x0, y0, max(xs) - min(xs), max(ys) - min(ys), stroke, None, points=rel,
                lastCommittedPoint=None, startBinding=None, endBinding=None,
                startArrowhead=kw.pop("start", None),
                endArrowhead=kw.pop("end", "arrow" if t == "arrow" else None), **kw)


def arrow(pts, stroke="ink", **kw):
    return line(pts, stroke, "arrow", **kw)


# ---------- images ----------
def img_size(data, mime):
    if mime == "image/png":
        return struct.unpack(">II", data[16:24])
    if mime == "image/svg+xml":
        s = data.decode("utf-8", "ignore")
        m = re.search(r'viewBox="[\d.\-]+[ ,]+[\d.\-]+[ ,]+([\d.]+)[ ,]+([\d.]+)"', s)
        return (float(m.group(1)), float(m.group(2))) if m else (100, 100)
    i = 2  # jpeg: scan for SOF marker
    while i < len(data):
        if data[i] != 0xFF: i += 1; continue
        mk = data[i + 1]
        if mk in (0xC0, 0xC1, 0xC2):
            h, w = struct.unpack(">HH", data[i + 5:i + 9]); return w, h
        i += 2 + struct.unpack(">H", data[i + 2:i + 4])[0]
    return 100, 100


def image(path, x, y, w, h):
    """Fit image inside box preserving aspect ratio. Returns element or None if missing."""
    p = Path(path)
    if not p.exists(): return None
    mime = {".png": "image/png", ".svg": "image/svg+xml", ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg", ".webp": "image/webp"}[p.suffix.lower()]
    return place(p.read_bytes(), mime, "f" + str(abs(hash(str(p)))), x, y, w, h)


def place(data, mime, fid, x, y, w, h, **kw):
    iw, ih = img_size(data, mime)
    k = min(w / iw, h / ih); dw, dh = iw * k, ih * k
    FILES[fid] = {"mimeType": mime, "id": fid, "created": 1,
                  "dataURL": f"data:{mime};base64," + base64.b64encode(data).decode()}
    return base("image", x + (w - dw) / 2, y + (h - dh) / 2, dw, dh, "transparent", None,
                fileId=fid, status="saved", scale=[1, 1], **kw)


def background(name):
    """Full-slide gradient background (theme "backgrounds") as a locked SVG image."""
    b = T["backgrounds"][name]; d = (W * W + H * H) ** 0.5
    if "linear" in b:
        stops = "".join(f'<stop offset="{o}" stop-color="{c}"/>' for c, o in zip(b["linear"], b["stops"]))
        defs = f'<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">{stops}</linearGradient>'
        body = '<rect width="100%" height="100%" fill="url(#g)"/>'
    else:
        defs = "".join(f'<radialGradient id="b{k}" gradientUnits="userSpaceOnUse" cx="{cx * W}" cy="{cy * H}" r="{d}">'
                       f'<stop offset="0" stop-color="{c}"/><stop offset="{r}" stop-color="{c}" stop-opacity="0"/>'
                       f'</radialGradient>' for k, (cx, cy, c, r) in enumerate(b["blooms"]))
        body = f'<rect width="100%" height="100%" fill="{b["base"]}"/>' + "".join(
            f'<rect width="100%" height="100%" fill="url(#b{k})"/>' for k in range(len(b["blooms"])))
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
           f'<defs>{defs}</defs>{body}</svg>').encode()
    place(svg, "image/svg+xml", f"bg-{name}", OX, 0, W, H, locked=True)


def logo(name, x, y, size):
    for ext in (".svg", ".png", ".jpg"):
        el = image(ROOT / "assets" / "logos" / f"{name.lower()}{ext}", x, y, size, size)
        if el: return True
    FLAGS.append({"flag": "missing-logo", "name": name})
    return False


def slot(x, y, w, h, spec, slide_dir, acc="green"):
    """Screenshot / illustration slot: real file if present, else a labelled placeholder.
    `marks` are drawn on top either way, in 0..1 coords of the image box."""
    src = spec.get("src")
    el = image(slide_dir / src, x, y, w, h) if src else None
    if el:
        x, y, w, h = el["x"], el["y"], el["width"], el["height"]
        rect(x - 8, y - 8, w + 16, h + 16, "ink", None, sw=3)  # hand-drawn frame
    else:
        kind = spec.get("type", "image")
        rect(x, y, w, h, "grey", "l_grey", style="dashed",
             data={"flag": f"missing-{kind}", "src": src, "prompt": spec.get("prompt")})
        ctext(x + w / 2, y + h / 2, f"[{kind.upper()} NEEDED]\n{src or ''}", 36, "grey")
        FLAGS.append({"flag": f"missing-{kind}", "src": src})
    for mk in spec.get("marks", []):
        mark(mk, x, y, w, h, spec.get("markColor", acc))


def mark(mk, x, y, w, h, c):
    """Hand-drawn markup on a screenshot: circle | underline | arrow (+ label at its tail)."""
    P = lambda px, py: (x + px * w, y + py * h)
    c = mk.get("c", c)
    if mk["type"] == "circle":
        (x0, y0), (x1, y1) = P(mk["x"], mk["y"]), P(mk["x"] + mk["w"], mk["y"] + mk["h"])
        ellipse(x0 - 20, y0 - 16, x1 - x0 + 40, y1 - y0 + 32, c, None, sw=5, angle=-0.03)
    elif mk["type"] == "underline":
        (x0, y0), (x1, _) = P(mk["x"], mk["y"]), P(mk["x"] + mk["w"], mk["y"])
        line([(x0, y0), ((x0 + x1) / 2, y0 + 6), (x1, y0 - 2)], c, sw=6, curve=True)
    elif mk["type"] == "arrow":
        (fx, fy), (tx, ty) = P(*mk["from"]), P(*mk["to"])
        arrow([(fx, fy), ((fx + tx) / 2 + 30, (fy + ty) / 2 - 30), (tx, ty)], c, sw=5, curve=True)
        if mk.get("label"):
            size = mk.get("size", 40)
            ctext(fx, fy - size * 0.9 if ty > fy else fy + size * 0.9, mk["label"], size, c)


# ---------- visuals (drawn inside a box) ----------
def v_checklist(x, y, w, h, s, acc):
    bw, bh = min(520, w), min(h, 520)
    bx = x + (w - bw) / 2
    rect(bx, y + 30, bw, bh - 30, "ink", "paper", sw=3)
    rect(bx + bw / 2 - 80, y, 160, 60, "ink", f"l_{acc}")
    rows = s.get("rows", 5)
    for r in range(rows):
        ry = y + 110 + r * ((bh - 150) / rows)
        rect(bx + 50, ry, 44, 44, acc, None, round_=False)
        text(bx + 56, ry - 8, "✓", 44, acc)
        line([(bx + 130, ry + 24), (bx + bw - 60 - (r % 2) * 90, ry + 24)], "grey", sw=4)


def v_scatter(x, y, w, h, s, acc):
    items = s["items"]; target = s["target"]
    lx = x
    for k, it in enumerate(items):
        ix = lx + (k % 2) * 240 + random.randint(-10, 10)
        iy = y + (k // 2) * 170 + random.randint(0, 30)
        ang = 0 if T.get("formal") else random.choice([-0.12, -0.07, 0.07, 0.12])
        bw = max(220, tw(it, 40) + 60)
        rect(ix, iy, bw, 100, "red", "l_red", angle=ang)
        ctext(ix + bw / 2, iy + 50, it, 40, angle=ang)
        arrow([(ix + bw, iy + 50), (x + w - 330, y + h / 2)], "grey", style="dashed", curve=True)
    rect(x + w - 320, y + h / 2 - 150, 320, 300, "green", "l_green")
    ctext(x + w - 160, y + h / 2, target, 40, width=None)


def v_calendar(x, y, w, h, s, acc):
    days = s.get("days", 14); per = 7
    sz = min((w - 150) / per - 14, 90)
    for d in range(days):
        r, c = divmod(d, per)
        if c == 0: text(x, y + r * (sz + 60) + sz / 2 - 22, f"Week {r+1}", 36, "grey")
        bx = x + 150 + c * (sz + 14); by = y + r * (sz + 60)
        rect(bx, by, sz, sz, acc, f"l_{acc}")
        ctext(bx + sz / 2, by + sz / 2, "✓", 40, acc)
    if s.get("result"):
        ry = y + ((days + per - 1) // per) * (sz + 60)
        arrow([(x + w / 2, ry), (x + w / 2, ry + 90)], "ink", sw=3)
        rect(x + w / 2 - 230, ry + 110, 460, 150, "ink", "l_yellow")
        ctext(x + w / 2, ry + 185, "\n".join(wrap(s["result"], 44, 400)), 44)


def v_layers(x, y, w, h, s, acc):
    layers = s["layers"]  # bottom -> top
    pal = T.get("series") or ["orange", "blue", "violet", "green", "red"]
    n = len(layers); lh = min(110, (h - 190) / n - 16)
    for k, lab in enumerate(layers):
        lw = w - k * (w * 0.4 / max(1, n - 1))
        ly = y + h - (k + 1) * (lh + 16)
        c = pal[k % len(pal)]
        rect(x + (w - lw) / 2, ly, lw, lh, c, f"l_{c}")
        ctext(x + w / 2, ly + lh / 2, lab, 40)
    if s.get("top"):
        topy = y + h - n * (lh + 16)
        arrow([(x + w / 2, topy - 10), (x + w / 2, y + 130)], "ink", sw=3)
        ellipse(x + 60, y, w - 120, 125, "ink", "l_yellow")
        ctext(x + w / 2, y + 62, s["top"], 38)


def cards_need(s, w):
    """Height of one card (the tallest), so every card in the grid matches."""
    items = s["items"]; cols = s.get("cols", 2)
    cw = (w - 30 * (cols - 1)) / cols
    ts = s.get("size", 40); ss = round(ts * 0.9); u = lambda v: round(v * ts / 40)
    return max(260, max(u(95) + len(wrap(it["title"], ts, cw - 60)) * u(50) + 10 +
                        (len(wrap(it["sub"], ss, cw - 60)) * u(45) if it.get("sub") else 0) + 30 for it in items))


def v_cards(x, y, w, h, s, acc):
    items = s["items"]; cols = s.get("cols", 2); rows = (len(items) + cols - 1) // cols
    pal = T.get("series") or ["blue", "orange", "green", "violet"]
    cw = (w - 30 * (cols - 1)) / cols
    ts = s.get("size", 40); ss = round(ts * 0.9); u = lambda v: round(v * ts / 40)  # "size" scales the whole card
    ch = min(cards_need(s, w), (h - 30 * (rows - 1)) / rows)
    for k, it in enumerate(items):
        r, c = divmod(k, cols); cx = x + c * (cw + 30); cy = y + r * (ch + 30)
        if k: step()
        p = pal[k % len(pal)]
        # formal look: an odd last card spans the rest of the row instead of leaving a hole
        span = cols - c if T.get("formal") and k == len(items) - 1 and len(items) % cols else 1
        rect(cx, cy, cw * span + 30 * (span - 1), ch, p, "paper", sw=3)
        if it.get("logo"):  # logo in place of the number badge
            if not logo(it["logo"], cx + 20, cy + 14, u(68)): ctext(cx + u(54), cy + u(48), "?", ts, "grey")
        else:
            ellipse(cx + 20, cy + 20, u(56), u(56), p, f"l_{p}")
            ctext(cx + 20 + u(28), cy + 20 + u(28), str(k + 1), u(30), p)
        yy = text(cx + 30, cy + u(95), it["title"], ts, width=cw - 60)
        if it.get("sub"): text(cx + 30, yy + 10, it["sub"], ss, "grey", width=cw - 60)


def v_fan(x, y, w, h, s, acc):
    """One thing -> several outcomes: arrows fan out from the left edge to stacked coloured boxes.
    items: list of str or {t, c}; optional `above` (grey) and `below` (accent) lines."""
    items = s["items"]; n = len(items)
    pal = [("blue", "l_blue"), ("orange", "l_yellow"), ("green", "l_green"), ("violet", "l_violet"), ("red", "l_red")]
    top = y + (70 if s.get("above") else 0)
    bot = y + h - (70 if s.get("below") else 0)
    bw = min(w * 0.62, 520); bx = x + w - bw
    bh = min(130, (bot - top - 30 * (n - 1)) / n)
    total = n * bh + (n - 1) * 30; by0 = top + (bot - top - total) / 2
    if s.get("above"): ctext(bx + bw / 2, y + 30, s["above"], 36, "grey")
    ox = x + 10
    if s.get("from"):  # a doodle/logo the arrows fan out of: {"id"} (library) or {"logo"}
        A = min(bx - x - 90, 220); ay = y + h / 2 - A / 2
        if s["from"].get("logo"): logo(s["from"]["logo"], x, ay, A)
        else: draw_art({**s["from"], "x": x, "y": ay, "size": A}, acc)
        ox = x + A + 10
    for k, it in enumerate(items):
        t, c = (it, None) if isinstance(it, str) else (it["t"], it.get("c"))
        st, bg = (c, f"l_{c}") if c else pal[k % len(pal)]
        by = by0 + k * (bh + 30)
        rect(bx, by, bw, bh, st, bg, sw=3)
        ctext(bx + bw / 2, by + bh / 2, t, s.get("size", 44))
        arrow([(ox, y + h / 2), (bx - 20, by + bh / 2)], "grey", sw=2)
    if s.get("below"): ctext(bx + bw / 2, bot + 40, s["below"], 40, acc)


def v_art(x, y, w, h, s, acc):
    """A library character or doodle as the whole visual (sticker character beats)."""
    A = s.get("size", min(w, h, 700))
    draw_art({**s, "x": x + (w - A) / 2, "y": y + (h - A) / 2, "size": A}, acc)


def v_scene(x, y, w, h, s, acc):
    """Characters acting out the idea with props (the okaash inner-slide beat).
    items: [{id | logo, x, y, size, flip?, c?}] with x/y as 0..1 of the box (top-left of the art) and size in px;
    labels: [{t, x, y, size?, c?, chip?}] centred at 0..1 (chip draws a rounded box behind it);
    arrows: [{from: [x, y], to: [x, y], dashed?}] in 0..1. Everything scales down if the box is short."""
    k = min(1, h / s.get("h", 560))
    P = lambda px, py: (x + px * w, y + py * h)
    for a in s.get("arrows", []):
        arrow([P(*a["from"]), P(*a["to"])], "grey", sw=3, curve=True, style="dashed" if a.get("dashed") else "solid")
    for it in s.get("items", []):
        ax, ay = P(it["x"], it["y"]); A = it.get("size", 240) * k
        if it.get("logo"):
            if not logo(it["logo"], ax, ay, A): ctext(ax + A / 2, ay + A / 2, "?", 64, "grey")
        else: draw_art({**it, "x": ax, "y": ay, "size": A}, acc)
    for lb in s.get("labels", []):
        cx, cy = P(lb["x"], lb["y"]); sz = lb.get("size", 36); c = acc if lb.get("c") == "accent" else lb.get("c", "ink")
        if lb.get("chip"):
            bw = tw(lb["t"], sz) + 50
            rect(cx - bw / 2, cy - sz * 0.9, bw, sz * 1.8, c if c != "ink" else "ink", "paper", sw=3)
        ctext(cx, cy, lb["t"], sz, c)


def v_icons(x, y, w, h, s, acc):
    """Cover teaser: a grid of library doodles, one per list item, each on a hand-drawn tile.
    Optional "art": [ids] stand side by side under the grid (e.g. person + bot looking at it)."""
    ids_ = s["items"]; cols = s.get("cols", 4); rows = -(-len(ids_) // cols)
    g = 30; tile = min((w - g * (cols - 1)) / cols, (h - g * (rows - 1)) / rows, s.get("tile", 200))
    x0 = x + (w - (cols * tile + (cols - 1) * g)) / 2
    for k, i in enumerate(ids_):
        r, c = divmod(k, cols); tx = x0 + c * (tile + g); ty = y + r * (tile + g)
        rect(tx, ty, tile, tile, "grey", "paper", sw=2)
        draw_art({"id": i, "x": tx + tile * 0.18, "y": ty + tile * 0.18, "size": tile * 0.64}, acc)
    if s.get("art"):
        A = s.get("artSize", 200); n = len(s["art"]); ay = y + rows * (tile + g) + 10
        for k, i in enumerate(s["art"]):
            draw_art({"id": i, "x": x + w / 2 - n * A * 0.9 / 2 + k * A * 0.9 - A * 0.05, "y": ay, "size": A}, acc)


def v_logos(x, y, w, h, s, acc):
    """logos: list of names, or {logo, name} to show a nicer label than the file name."""
    items = s["logos"]; n = len(items); per = s.get("cols", min(n, 4))
    cw = (w - 20 * (per - 1)) / per; ch = 170
    x0 = lambda r: x + (w - (min(per, n - r * per) * (cw + 20) - 20)) / 2  # centre a short last row
    for k, it in enumerate(items):
        nm, lab = (it, it) if isinstance(it, str) else (it["logo"], it.get("name", it["logo"]))
        r, c = divmod(k, per); cx = x0(r) + c * (cw + 20); cy = y + r * (ch + 20)
        rect(cx, cy, cw, ch, "ink", "paper")
        if not logo(nm, cx + cw / 2 - 40, cy + 18, 80):
            ctext(cx + cw / 2, cy + 58, "?", 48, "grey")
        ctext(cx + cw / 2, cy + 130, lab, 30)


def v_swap(x, y, w, h, s, acc):
    """Paid tool -> open-source swap: left card crossed out, arrow (with scissors), right card in accent.
    from/to: {logo, name, tag?}; optional "art": {id} stands under the arrow."""
    gap = 170; cw = (w - gap) / 2; ch = 360; L = 150
    for k, (side, stroke, bg) in enumerate(((s["from"], "grey", "l_grey"), (s["to"], acc, f"l_{acc}"))):
        cx = x + k * (cw + gap)
        rect(cx, y, cw, ch, stroke, bg, sw=3)
        if not (side.get("logo") and logo(side["logo"], cx + (cw - L) / 2, y + 30, L)):
            if not side.get("logo"): FLAGS.append({"flag": "missing-logo", "name": side.get("name", "?")})
            ctext(cx + cw / 2, y + 30 + L / 2, "?", 90, "grey")
        ctext(cx + cw / 2, y + 30 + L + 55, side.get("name", "?"), 44, "ink")
        if side.get("tag"):
            tw_ = tw(side["tag"], 32) + 44
            rect(cx + (cw - tw_) / 2, y + ch - 80, tw_, 54, stroke, "paper", sw=2)
            ctext(cx + cw / 2, y + ch - 53, side["tag"], 32, "red" if k == 0 else acc)
        if k == 0:  # logo crossed out
            lx, ly = cx + (cw - L) / 2 - 15, y + 15
            line([(lx, ly), (lx + L + 30, ly + L + 30)], "red", sw=6); line([(lx + L + 30, ly), (lx, ly + L + 30)], "red", sw=6)
    mx = x + cw + gap / 2
    arrow([(x + cw + 20, y + ch / 2 + 20), (x + cw + gap - 20, y + ch / 2 + 20)], "ink", sw=4)
    draw_art({"id": "scissors", "x": mx - 55, "y": y + ch / 2 - 110, "size": 110}, acc)
    if s.get("art"):
        A = min(420, h - ch - 40)
        draw_art({**s["art"], "x": x + (w - A) / 2, "y": y + ch + 40, "size": A}, acc)


def v_stat(x, y, w, h, s, acc):
    ctext(x + w / 2, y + 140, s["value"], s.get("size", 220), acc)
    text(x + w / 2, y + 300, s["label"], 48, align="center", width=w)
    if s.get("people"):
        for k in range(9):
            px = x + w / 2 - 9 * 55 / 2 + k * 55
            ellipse(px, y + 470, 34, 34, acc, f"l_{acc}")
            rect(px - 6, y + 510, 46, 50, acc, f"l_{acc}")


def v_note(x, y, w, h, s, acc):
    """One sticky note: small label + a short line of advice. Optional "art" stands beside it."""
    art = s.get("art"); A = art.get("size", 420) if art else 0
    nw = min(w, 780) if not art else w - A * 0.62 - 10
    nx = x + (w - nw) / 2 if not art else x
    lines = wrap(s["text"], 48, nw - 120)
    nh = 140 + len(lines) * 60 + 60
    rect(nx, y, nw, nh, acc, f"l_{acc}", sw=3)
    pin = f"d_{acc}" if f"d_{acc}" in C else acc
    ellipse(nx + nw / 2 - 20, y - 20, 40, 40, pin, pin)  # pin
    text(nx + 60, y + 60, s.get("label", "try this:"), 36, "grey")
    text(nx + 60, y + 130, "\n".join(lines), 48)
    if art:
        step()
        draw_art({"flip": True, **art, "x": x + w - A * 0.86, "y": y + nh - A * 0.95, "size": A}, acc)


def v_cut(x, y, w, h, s, acc):
    """Cover beat for "stopped paying": logos in an arc, each on a string that runs down to one knot,
    snipped by scissors, loose ends dangling below. logos: names; knot: [0..1, px from top] (default centre, 300)."""
    names = s["logos"]; n = len(names); L = s.get("size", 96)
    kx, ky = x + w * s.get("knot", [0.5, 300])[0], y + s.get("knot", [0.5, 300])[1]
    dx_step = (w - L) / max(1, n - 1)
    for k, nm in enumerate(names):
        lx = x + k * dx_step; ly = y + 40 * abs((k - (n - 1) / 2) / ((n - 1) / 2 or 1)) ** 2  # outer logos sit lower
        if not logo(nm, lx, ly, L): ctext(lx + L / 2, ly + L / 2, "?", 48, "grey")
        bx, by = lx + L / 2, ly + L + 8
        line([(bx, by), (bx + (kx - bx) * 0.6, by + (ky - by) * 0.35), (kx + (bx - kx) * 0.08, ky - 34)], acc, sw=3, curve=True)
    draw_art({"id": "scissors", "x": kx - 70, "y": ky - 70, "size": 140}, acc)
    for k, dx in enumerate((-40, -14, 14, 40)):  # cut ends, dangling
        line([(kx + dx * 0.5, ky + 40), (kx + dx, ky + 100), (kx + dx * 1.3, ky + 150 + (k % 2) * 30)], acc, sw=3, curve=True)
    for k in range(6):  # snipped bits
        bx = kx - 110 + k * 44; by = ky + 190 + (k % 3) * 22
        line([(bx, by), (bx + 18, by + 6 - (k % 2) * 12)], acc, sw=3)


def v_comment_dm(x, y, w, h, s, acc):
    rect(x, y, w, 220, "ink", "paper", sw=3)
    line([(x + 80, y + 220), (x + 60, y + 290), (x + 150, y + 220)], "border" if "border" in C else "ink", sw=3)
    text(x + 30, y + 20, "you comment:", 28, "grey")
    ctext(x + w / 2, y + 120, f'"{s["keyword"]}"', 72, acc)
    arrow([(x + w / 2, y + 310), (x + w / 2, y + 400)], "ink", sw=4)
    rect(x, y + 420, w, 200, "green", "l_green", sw=3)
    text(x + 30, y + 440, "I DM you:", 28, "grey")
    ctext(x + w / 2, y + 530, s.get("dm", "here's the link ✓"), 52)


def v_chat(x, y, w, h, s, acc):
    """Hand-drawn chat window: question bubble, answer scribbles, sponsored ad card(s)."""
    ww = s.get("width", w)
    rect(x, y, ww, h, "ink", "paper", sw=3)
    line([(x, y + 80), (x + ww, y + 80)], "ink", sw=2)
    for k in range(3):
        ellipse(x + 30 + k * 36, y + 28, 22, 22, "grey", "l_grey")
    if s.get("app"): text(x + ww / 2, y + 18, s["app"], 36, "grey", "center")
    ql = wrap(s["q"], 40, ww - 190); qh = len(ql) * 50 + 40
    qw = min(ww - 120, max(tw(l, 40) for l in ql) + 70)
    rect(x + ww - 30 - qw, y + 110, qw, qh, "ink", "l_grey")
    ctext(x + ww - 30 - qw / 2, y + 110 + qh / 2, "\n".join(ql), 40)
    ay = y + 160 + qh
    for k, frac in enumerate([0.8, 0.62, 0.72][:s.get("lines", 2)]):
        line([(x + 40, ay + k * 40), (x + 40 + (ww - 80) * frac, ay + k * 40)], "grey", sw=4)
    ay += s.get("lines", 2) * 40
    text(x + 40, ay, s.get("tag", "Sponsored"), 28, "grey"); ay += 50
    for ad in s["ads"]:
        c = ad.get("c", "red")
        rect(x + 40, ay, ww - 80, 110, c, f"l_{c}", sw=3)
        rect(x + 62, ay + 22, 66, 66, c, "paper")
        text(x + 150, ay + 30, ad["name"], 40)
        ay += 130


def v_waffle(x, y, w, h, s, acc):
    """Dot grid: one dot per item, coloured by group, legend underneath."""
    groups = s["groups"]; n = sum(g["n"] for g in groups)
    cols = s.get("cols", 20); rows = -(-n // cols)
    leg = [wrap(g["label"], 40, w - 90) for g in groups]
    leg_h = sum(len(l) * 52 + 24 for l in leg)
    d = min(56, w / (cols * 1.35), (h - leg_h - 40) / (rows * 1.35)); cell = d * 1.35
    gx = x + (w - cols * cell) / 2
    k = 0
    for g in groups:
        c = acc if g.get("c") == "accent" else g.get("c", acc)
        for _ in range(g["n"]):
            r, cc = divmod(k, cols)
            ellipse(gx + cc * cell, y + r * cell, d, d, c, None if g.get("hollow") else c, sw=2)
            k += 1
    ly = y + rows * cell + 40
    for g, lines in zip(groups, leg):
        c = acc if g.get("c") == "accent" else g.get("c", acc)
        ellipse(x + 20, ly + 6, 36, 36, c, None if g.get("hollow") else c)
        text(x + 80, ly, "\n".join(lines), 40)
        ly += len(lines) * 52 + 24


def v_split(x, y, w, h, s, acc):
    """100% bars: a hatched share with its number, the rest left empty."""
    ry = y
    for r in s["rows"]:
        text(x, ry, r["label"], 40, "ink"); ry += 70
        p = r["pct"] / 100
        rect(x, ry, w, 120, "ink", "paper", sw=3)
        rect(x, ry, w * p, 120, acc, acc, fill="hachure", sw=3)
        ctext(x + w * p + 110, ry + 60, f"{r['pct']}%", 60, "ink")
        ry += 140
        text(x, ry, r["hi"], 36, acc)
        if r.get("rest"): text(x + w - tw(r["rest"], 36), ry, r["rest"], 36, "grey")
        ry += 110


def v_bars_v(x, y, w, h, s, acc):
    """Vertical hand-drawn bar chart from a zero baseline.
    bars: [{label, value, display, c?}]."""
    bars = s["bars"]; n = len(bars)
    bw = min(220, w / n - 120)
    base_y = y + h - 120; top = y + 90
    vmax = max(b["value"] for b in bars)
    line([(x, base_y), (x + w, base_y)], "ink", sw=3)
    for k, b in enumerate(bars):
        c = acc if b.get("c", "accent") == "accent" else b["c"]
        cx = x + (k + 0.5) * w / n; bh = (base_y - top) * b["value"] / vmax
        rect(cx - bw / 2, base_y - bh, bw, bh, c, c, fill="hachure", sw=3, round_=False)
        ctext(cx, base_y - bh - 45, b["display"], 64, c)
        text(cx, base_y + 20, b["label"], 36, "ink", "center", width=w / n - 20)


def v_bars_h(x, y, w, h, s, acc):
    """Paired horizontal bars, one row per item: series[0] in the accent, series[1] in grey.
    items: [{label, logo?, v: [a, b]}]; series: two names for the legend; unit: suffix on the values."""
    items = s["items"]; ser = s.get("series", ["", ""]); unit = s.get("unit", "")
    cols = [(acc, f"l_{acc}"), ("grey", "l_grey")]
    lw = 300; L = 64; vx = x + lw; vw = w - lw - 170
    top = y + 70; rh = (h - 70) / len(items); bh = min(44, (rh - 40) / 2)
    vmax = max(max(it["v"]) for it in items) or 1
    lx = x + w / 2 - (tw(ser[0], 30) + tw(ser[1], 30) + 160) / 2
    for k, (nm, (st, bg)) in enumerate(zip(ser, cols)):  # legend
        rect(lx, y + 8, 34, 34, st, bg, sw=3)
        text(lx + 48, y + 6, nm, 30, "ink"); lx += tw(nm, 30) + 110
    for r, it in enumerate(items):
        ry = top + r * rh; cy = ry + rh / 2
        if it.get("logo"):
            if not logo(it["logo"], x, cy - L / 2, L): ctext(x + L / 2, cy, "?", 40, "grey")
        text(x + L + 20, cy - 22, it["label"], 36)
        for j, (val, (st, bg)) in enumerate(zip(it["v"], cols)):
            by = cy - bh - 4 + j * (bh + 8); bw = max(6, vw * val / vmax)
            rect(vx, by, bw, bh, st, bg, sw=3, round_=False)
            text(vx + bw + 16, by + bh / 2 - 18, f"{val:g}{unit}", 30, acc if j == 0 else "grey")


def v_bars(x, y, w, h, s, acc):
    """Two bar charts share this type, told apart by their fields:
    "bars" -> vertical columns (one value each); "items" + "series" -> paired horizontal bars."""
    (v_bars_v if "bars" in s else v_bars_h)(x, y, w, h, s, acc)


def v_link(x, y, w, h, s, acc):
    """An ad link taken apart: address bar, then one row per tracking parameter."""
    rect(x, y, w, 100, "ink", "l_grey", sw=3)
    text(x + 30, y + 26, s["url"], 40)
    ry = y + 160; cw = 390
    for p in s["params"]:
        c = p.get("c", acc)
        arrow([(x + 50, y + 100), (x + 50, ry + 45), (x + 90, ry + 45)], "grey", sw=2)
        rect(x + 100, ry, cw, 90, c, f"l_{c}", sw=3)
        text(x + 125, ry + 20, p["k"], 40)
        if p.get("strike"): line([(x + 120, ry + 48), (x + 120 + tw(p["k"], 40) + 20, ry + 42)], c, sw=4)
        ctext(x + 100 + cw + 45, ry + 45, p["mark"], 52, c)
        text(x + cw + 180, ry + 45 - len(wrap(p["note"], 36, w - cw - 180)) * 23, p["note"], 36, "ink",
             width=w - cw - 180)
        ry += 130


def v_pages(x, y, w, h, s, acc):
    """Browser windows side by side, each with a big number and a label under it."""
    ps = s["pages"]; n = len(ps); gap = 50; pw = (w - gap * (n - 1)) / n; ph = 280
    for k, p in enumerate(ps):
        px = x + k * (pw + gap); c = acc if p.get("c", "accent") == "accent" else p["c"]
        rect(px, y, pw, ph, c, "paper", sw=3)
        line([(px, y + 50), (px + pw, y + 50)], c, sw=2)
        for d in range(3): ellipse(px + 18 + d * 26, y + 16, 16, 16, c, None)
        text(px + 30, y + 70, p["title"], 36)
        rect(px + 30, y + 130, pw - 60, 60, c, f"l_{c}")
        line([(px + 30, y + 225), (px + pw - 70, y + 225)], "grey", sw=4)
        line([(px + 30, y + 255), (px + pw - 140, y + 255)], "grey", sw=4)
        ctext(px + pw / 2, y + ph + 75, p["value"], 96, c)
        text(px + pw / 2, y + ph + 145, p["label"], 36, "ink", "center", width=pw - 10)


def v_versus(x, y, w, h, s, acc):
    """Two states, stacked: each row is a coloured label over a little scene of steps
    (library art or a box of text) joined by arrows. Bad row first, good row second.
    "frame": false drops the dashed row boxes for a cleaner look.
    "columns": true puts the two states side by side, steps flowing down (square / portrait)."""
    rows = s["rows"]; n = len(rows); fr = s.get("frame", True); gap = 50 if fr else 20
    if s.get("columns"):
        gap = 60; cw = (w - gap * (n - 1)) / n
        for k, r in enumerate(rows):
            if k: step()
            c = r.get("c", acc); cx = x + k * (cw + gap)
            if fr: rect(cx, y, cw, h, c, None, sw=2, style="dashed")
            mark = {"red": "✗ ", "green": "✓ "}.get(c, "")
            text(cx + cw / 2, y + 10, mark + r["label"], 40, c, "center")
            steps = r["steps"]; m = len(steps); ah = 70
            A = min(cw - 40, (h - 80 - ah * (m - 1)) / m)
            sy = y + 80 + (h - 80 - A * m - ah * (m - 1)) / 2
            for j, st in enumerate(steps):
                draw_art({"id": st["art"], "x": cx + (cw - A) / 2, "y": sy, "size": A,
                          "c": st.get("c", c), "flip": st.get("flip", False)}, acc)
                sy += A
                if j < m - 1:
                    arrow([(cx + cw / 2, sy + 5), (cx + cw / 2, sy + ah - 20)], "ink", sw=3); sy += ah
        return
    rh = (h - gap * (n - 1)) / n
    for k, r in enumerate(rows):
        if k: step()
        c = r.get("c", acc); ry = y + k * (rh + gap)
        if fr: rect(x, ry, w, rh, c, None, sw=2, style="dashed")
        mark = {"red": "✗ ", "green": "✓ "}.get(c, "")
        text(x + 30, ry + 22, mark + r["label"], 40, c)
        steps = r["steps"]; m = len(steps); aw = 70
        sw_ = (w - 60 - aw * (m - 1)) / m; sy = ry + (95 if fr else 90); sh = rh - (sy - ry) - (30 if fr else 0)
        for j, st in enumerate(steps):
            sx = x + 30 + j * (sw_ + aw)
            ih = sh - (55 if st.get("note") else 0)
            if st.get("art"):
                A = min(sw_, ih)
                draw_art({"id": st["art"], "x": sx + (sw_ - A) / 2, "y": sy + (ih - A) / 2, "size": A,
                          "c": st.get("c", c), "flip": st.get("flip", False)}, acc)
            else:
                bc = st.get("c", "ink")
                rect(sx, sy + 10, sw_, ih - 20, bc, st.get("bg", "paper"), sw=3,
                     style="dashed" if st.get("dashed") else "solid")
                ctext(sx + sw_ / 2, sy + ih / 2, st["box"], st.get("size", 40), bc if bc != "ink" else "ink")
            if st.get("note"):
                text(sx + sw_ / 2, sy + sh - 45, st["note"], 36, st.get("nc", c), "center")
            if j < m - 1:
                arrow([(sx + sw_ + 10, sy + ih / 2), (sx + sw_ + aw - 10, sy + ih / 2)], "ink", sw=3)


def v_prompt(x, y, w, h, s, acc):
    """AI prompt bar: app logo, the typed prompt + cursor, send button; optional row of AI app logos below."""
    bw = min(w, s.get("width", 1150)); bh = 130; bx = x + (w - bw) / 2
    rect(bx, y, bw, bh, "ink", "paper", sw=3)
    tx = bx + 40
    if s.get("app"):
        logo(s["app"], bx + 30, y + 30, 70); tx = bx + 130
    q = s["q"]
    text(tx, y + bh / 2 - 44 * F["lineHeight"] / 2, q, 44)
    cx = tx + tw(q, 44) + 14
    line([(cx, y + 34), (cx, y + bh - 34)], acc, sw=4)
    ellipse(bx + bw - 110, y + 25, 80, 80, acc, acc)
    arrow([(bx + bw - 70, y + 90), (bx + bw - 70, y + 42)], "paper", sw=4)
    if s.get("logos"):
        step()
        names = s["logos"]; ls = 80; g = 50
        lx = x + (w - len(names) * ls - (len(names) - 1) * g) / 2
        for k, nm in enumerate(names):
            if not logo(nm, lx + k * (ls + g), y + bh + 70, ls):
                ctext(lx + k * (ls + g) + ls / 2, y + bh + 70 + ls / 2, "?", 48, "grey")


import library  # noqa: E402  (reusable cast + doodles)
library.use(sys.modules[__name__])
import collage  # noqa: E402  (real cutouts + clean video scenes + hand-drawn marks: the mixed look)
collage.use(sys.modules[__name__])


def draw_art(spec, acc):
    global ART
    if T.get("noCast") and spec["id"].split(".")[0] in ("person", "bot"):
        FLAGS.append({"flag": "warn", "slide": int(spec["x"] // (W + S["gap"])) + 1,
                      "why": f"{spec['id']} skipped: this theme has no mascot"})
        return
    ART = True
    try: library.draw(spec, acc)
    finally: ART = False

VIS = {"checklist": v_checklist, "scatter": v_scatter, "calendar": v_calendar,
       "layers": v_layers, "cards": v_cards, "logos": v_logos, "stat": v_stat,
       "comment_dm": v_comment_dm, "note": v_note, "bars": v_bars,
       "fan": v_fan, "art": v_art, "swap": v_swap, "cut": v_cut, "scene": v_scene, "icons": v_icons,
       "chat": v_chat, "waffle": v_waffle, "split": v_split, "link": v_link, "pages": v_pages,
       "versus": v_versus, "prompt": v_prompt}


# natural height of each visual (so short visuals get centred, not top-stuck)
VIS_H = {"calendar": lambda s, w, h: ((s.get("days", 14) + 6) // 7) * (min((w - 150) / 7 - 14, 90) + 60) + (260 if s.get("result") else 0),
         "stat": lambda s, w, h: 580 if s.get("people") else 420,
         "comment_dm": lambda s, w, h: 640,
         "note": lambda s, w, h: 200 + len(wrap(s["text"], 48, min(w, 780) - 120)) * 60,
         "cards": lambda s, w, h: min(h, (r := -(-len(s["items"]) // s.get("cols", 2))) * cards_need(s, w) + 30 * (r - 1)),
         "fan": lambda s, w, h: min(h, len(s["items"]) * 160 + (70 if s.get("above") else 0) + (70 if s.get("below") else 0)),
         "art": lambda s, w, h: s.get("size", min(w, h, 700)),
         "cut": lambda s, w, h: h,
         "scene": lambda s, w, h: min(h, s.get("h", 560)),
         "icons": lambda s, w, h: -(-len(s["items"]) // s.get("cols", 4)) * (s.get("tile", 200) + 30) - 30 + (s.get("artSize", 200) + 40 if s.get("art") else 0),
         "swap": lambda s, w, h: min(h, 360 + (460 if s.get("art") else 0)),
         "logos": lambda s, w, h: -(-len(s["logos"]) // s.get("cols", 4)) * 190,
         "checklist": lambda s, w, h: min(h, 560),
         "scatter": lambda s, w, h: max(340, ((len(s["items"]) + 1) // 2) * 170 + 60),
         "layers": lambda s, w, h: min(h, len(s["layers"]) * 126 + 330),
         "chat": lambda s, w, h: 250 + len(wrap(s["q"], 40, s.get("width", w) - 190)) * 50
                                 + s.get("lines", 2) * 40 + len(s["ads"]) * 130,
         "waffle": lambda s, w, h: min(h, -(-sum(g["n"] for g in s["groups"]) // s.get("cols", 20))
                                       * min(56, w / (s.get("cols", 20) * 1.35)) * 1.35 + 40
                                       + sum(len(wrap(g["label"], 40, w - 90)) * 52 + 24 for g in s["groups"])),
         "split": lambda s, w, h: len(s["rows"]) * 320,
         "bars": lambda s, w, h: min(h, 620) if "bars" in s else min(h, 70 + len(s["items"]) * 120),
         "link": lambda s, w, h: 160 + len(s["params"]) * 130,
         "pages": lambda s, w, h: 280 + 145 + 100,
         "prompt": lambda s, w, h: 130 + (220 if s.get("logos") else 0)}


# ---------- density: one thing leads per slide ----------
def density(i, sd, hl, q, b, visual_h, e=0):
    why = []
    if b and hl > D["maxHeadlineLinesWithBody"]:
        why.append(f"headline {hl} lines + body: cut headline to {D['maxHeadlineLinesWithBody']} lines")
    if not b and "maxHeadlineLines" in D and hl > D["maxHeadlineLines"]:
        why.append(f"headline {hl} lines (max {D['maxHeadlineLines']})")
    if b > D["maxBodyLines"]:
        why.append(f"body {b} lines (max {D['maxBodyLines']}): shorten or drop it")
    if e + hl + q + b > D["maxTextLines"]:
        why.append(f"{e + hl + q + b} text lines (max {D['maxTextLines']})")
    need = D["minVisualHeight"]
    if sd.get("visual") and sd.get("align") == "center" and sd["visual"]["type"] in VIS_H:
        # centred landscape is only 1080 tall: ask for the room the visual needs, capped at the usual floor
        need = min(need, VIS_H[sd["visual"]["type"]](sd["visual"], CW, visual_h))
    if sd.get("visual") and visual_h < need:
        why.append(f"visual squeezed to {int(visual_h)}px (min {int(need)})")
    for w in why:
        FLAGS.append({"flag": "crowded", "slide": i + 1, "why": w})


# ---------- slide ----------
def headline(lines, y, acc, size, tx, ta, tcw):
    """Returns (bottom y, number of rendered lines). A line may carry its own "size" and colour."""
    n = 0
    for ln in lines:
        t, c = (ln, "ink") if isinstance(ln, str) else (ln["t"], acc if ln.get("c") == "accent" else ln.get("c", "ink"))
        sz = size if isinstance(ln, str) else ln.get("size", size)
        for wl in wrap(t, sz, tcw):
            y = text(tx, y, wl, sz, c, ta, lh=SP["headlineLH"]); n += 1
    return y, n


def text_block(sd, y, acc, tx, ta, tcw):
    """logo(s), eyebrow, number badge, headline, qualifier, body stacked on tx.
    ta "left" = landscape column, "center" = stacked. Returns (y, eyebrow, headline, qualifier, body lines)."""
    land = ta == "left"
    e_lines = hl_lines = q_lines = b_lines = 0
    if sd.get("logo"):  # one logo, or several side by side ("vs")
        names = sd["logo"] if isinstance(sd["logo"], list) else [sd["logo"]]
        L = sd.get("logoSize", 220 if FMT == "broll" else 160); g = 60
        x0 = tx if land else tx - (len(names) * L + (len(names) - 1) * g) / 2
        for k, nm in enumerate(names):
            if not logo(nm, x0 + k * (L + g), y, L):
                ctext(x0 + k * (L + g) + L / 2, y + L / 2, "?", 64, "grey")
        y += L + 40
    step(1)
    if sd.get("eyebrow"):  # small all-caps kicker above the headline
        e_lines = 1
        y = text(tx, y, sd["eyebrow"].upper(), TY.get("eyebrow", 36), acc, ta) + 24
    if sd.get("number") is not None:
        bx = tx if land else tx - 50
        ellipse(bx, y, 100, 100, acc, f"l_{acc}", sw=3)
        ctext(bx + 50, y + 50, str(sd["number"]), 52, acc)
        y += 130
    if sd.get("headline"):
        size = sd.get("headlineSize", TY["headline"])
        hl = sd["headline"] if isinstance(sd["headline"], list) else [sd["headline"]]
        y, hl_lines = headline(hl, y, acc, size, tx, ta, tcw)
        y += 10
    if sd.get("qualifier"):
        step()
        q_lines = len(wrap(sd["qualifier"], TY["qualifier"], tcw))
        y = text(tx, y + 10, sd["qualifier"], TY["qualifier"], "ink", ta, width=tcw)
        qw = 120 if T.get("formal") else min(tcw, tw(sd["qualifier"], TY["qualifier"]))  # formal: short accent bar
        tilt = 0 if T.get("formal") else 4
        qx = tx if land else tx - qw / 2
        line([(qx, y + 8), (qx + qw, y + 8 + tilt)], acc, sw=4, curve=bool(tilt))
        y += 20
    if sd.get("body"):
        step()
        b_lines = len(wrap(sd["body"], TY["body"], tcw))
        y = text(tx, y + SP["bodyGap"], sd["body"], TY["body"], "body", ta, width=tcw, lh=SP["bodyLH"])
    return y, e_lines, hl_lines, q_lines, b_lines


def visual(v, x, y, w, h, slide_dir, acc):
    """Draw a visual in a box, centred on its natural height. Returns the height used."""
    if v["type"] in ("screenshot", "illustration"):
        sh = min(h, v.get("h", h)); slot(x, y + (h - sh) / 2, w, sh, v, slide_dir, acc); return sh
    used = VIS_H.get(v["type"], lambda s, w, h: h)(v, w, h)
    VIS[v["type"]](x, y + max(0, (h - used) / 2), w, min(h, used), v, acc)
    return min(h, used)


def bbox(els):
    ys = [e["y"] for e in els] + [e["y"] + e["height"] for e in els]
    xs = [e["x"] for e in els] + [e["x"] + e["width"] for e in els]
    return min(xs), min(ys), max(xs), max(ys)


def shift(els, dy):
    for e in els: e["y"] += dy


def slide(i, n, sd, slide_dir, acc):
    """carousel / landscape / square / portrait: text on top (or left), visual below (or right).
    slides: same, plus the "split" layout and a slide-number badge.
    broll: a sticker laid out on a big canvas, then cropped to its own content."""
    global cur_frame, OX
    OX = i * (W + S["gap"])
    cur_frame = None
    fr = base("frame", OX, 0, W, H, "#bbbbbb", None, name=f"{i+1:02d} {sd.get('role','')}".strip(),
              roughness=0, data={"overlay": True} if FMT == "broll" else None)
    cur_frame = fr["id"]
    step(0)
    if T.get("backgrounds"):
        bd = T["bgDefault"]
        bg = sd.get("bg") or (bd["first"] if i == 0 else bd["last"] if i == n - 1 else bd["rest"])
        if bg.startswith("hero") and 0 < i < n - 1:
            FLAGS.append({"flag": "warn", "slide": i + 1, "why": f"{bg} gradient is for cover/closing only"})
        palette(bg); background(bg)
    land = T.get("layout") == "landscape" and sd.get("align") != "center"  # center: stacked, like portrait
    TX, TA, TCW = (OX + M, "left", T["textWidth"]) if land else (OX + W / 2, "center", CW)
    v = sd.get("visual")

    if FMT == "broll":
        # an overlay sticker: laid out on a big canvas, then the frame is cropped to the content,
        # so each PNG is exactly as big as what's on it (wide, tall or square) with a transparent edge
        start = len(E)
        y, e_lines, hl_lines, q_lines, b_lines = text_block(sd, M, acc, OX + W / 2, "center", sd.get("textW", CW))
        if v:
            step()
            y += SP["visualGap"] if (hl_lines or q_lines or b_lines) else 0
            density(i, sd, hl_lines, q_lines, b_lines, H - M - y, e_lines)
            vw = min(CW, v.get("w", CW)); vh = H - M - y
            if v["type"] not in ("screenshot", "illustration"):  # sit right under the text
                vh = min(vh, VIS_H.get(v["type"], lambda s, w, h: h)(v, vw, vh))
            visual(v, OX + (W - vw) / 2, y, vw, vh, slide_dir, acc)
        else:
            density(i, sd, hl_lines, q_lines, b_lines, 0, e_lines)
        for a in sd.get("art", []):
            step()
            draw_art(dict(a, x=OX + a["x"]), acc)
        if sd.get("backdrop", True):  # white sticker so it reads over any footage
            x0, y0, x1, y1 = bbox(E[start:]); pad = S.get("stickerPad", 60)  # text renders a bit wider than estimated
            rect(x0 - pad, y0 - pad, x1 - x0 + 2 * pad, y1 - y0 + 2 * pad, "ink", "paper", sw=3)
            E.insert(start, E.pop())  # sticker goes behind the content
        x0, y0, x1, y1 = bbox(E[start:]); e = S.get("edge", 24)  # transparent edge for the rough strokes
        fr.update(x=x0 - e, y=y0 - e, width=round(x1 - x0 + 2 * e), height=round(y1 - y0 + 2 * e))
        step(None)
        return

    if FMT == "slides" and sd.get("layout") == "split":
        # text on the left, visual on the right, both centred vertically
        lw = CW * sd.get("split", 0.45); gap = 60
        start = len(E)
        y, e_lines, hl_lines, q_lines, b_lines = text_block(sd, M, acc, OX + M + lw / 2, "center", lw)
        _, y0, _, y1 = bbox(E[start:]); shift(E[start:], (M + (H - 2 * M) / 2) - (y0 + y1) / 2)
        density(i, sd, hl_lines, q_lines, b_lines, H - 2 * M, e_lines)
        vx, vy, vw, vh = OX + M + lw + gap, M, CW - lw - gap, H - 2 * M
    elif land:
        start = len(E)
        y, e_lines, hl_lines, q_lines, b_lines = text_block(sd, M, acc, TX, TA, TCW)
        avail = BOTTOM - M  # centre the text block vertically in its column
        if y - M > avail:
            FLAGS.append({"flag": "crowded", "slide": i + 1, "why": "text column taller than the slide"})
        shift(E[start:], max(0, (avail - (y - M)) / 2))
        density(i, sd, hl_lines, q_lines, b_lines, avail, e_lines)
        vx, vy, vw, vh = OX + W - M - T["visualWidth"], M, T["visualWidth"], avail
    else:
        # stacked: headline on top, visual fills the rest (carousel, square, video slide)
        y, e_lines, hl_lines, q_lines, b_lines = text_block(sd, M, acc, TX, TA, TCW)
        y += SP["visualGap"]
        density(i, sd, hl_lines, q_lines, b_lines, BOTTOM - y, e_lines)
        vw = min(CW, v.get("w", CW)) if v else CW
        vx, vy, vh = OX + (W - vw) / 2, y, BOTTOM - y

    if v:
        step()
        visual(v, vx, vy, vw, vh, slide_dir, acc)
    for a in sd.get("art", []):  # free-placed art, slide coords: library art, real cutouts, clean scenes, marks
        step()
        if "cutout" in a: collage.cutout(a, slide_dir, OX)
        elif "scene" in a: collage.scene(a, slide_dir, OX, acc)
        elif "mark" in a: collage.mark(a, OX, acc)
        else: draw_art(dict(a, x=OX + a["x"]), acc)

    if FMT == "slides":
        if sd.get("footer"):
            step()
            ctext(OX + W / 2, H - M + 10, sd["footer"], TY["small"], "grey")
        step(0)
        if SB.get("badge", True):  # small grey slide number, top-left corner
            ellipse(OX + 40, 35, 64, 64, "grey", "l_grey", sw=2)
            ctext(OX + 72, 67, f"{i+1:02d}", 28, "grey")
    else:
        if sd.get("footer"):
            step()
            if land: text(TX, BOTTOM - 50, sd["footer"], TY["qualifier"], acc)
            else: ctext(OX + W / 2, BOTTOM - 10, sd["footer"], TY["qualifier"], acc)
        # chrome: (wordmark +) handle + counter (+ swipe cue)
        step(0)
        hx = OX + M
        if T.get("wordmark"):
            text(hx, H - M - 8, T["wordmark"], 40, "wordmark"); hx += tw(T["wordmark"], 40) + 28
        if T.get("handle"):
            text(hx, H - M, T["handle"], 30, "grey")
        if n > 1:  # a single image has no counter
            cue = f"{i+1}/{n}" + ("  →" if i < n - 1 else "")
            text(OX + W - M - tw(cue, 30), H - M, cue, 30, "grey")
    step(None)


def main(folder):
    global SB
    d = ROOT / folder if not Path(folder).is_absolute() else Path(folder)
    SB = sb = json.loads((d / "storyboard.json").read_text(encoding="utf-8"))
    set_theme(sb.get("theme"), sb.get("format"))
    if "handle" in sb: T["handle"] = sb["handle"] or None  # e.g. a video title card with no chrome
    acc = sb.get("accent", T["accentDefault"])
    slides = sb["slides"]
    collage.prepare_scenes(sb, d, acc)
    draw = slide
    if T.get("layout") == "band":
        import band; band.use(sys.modules[__name__], sb); draw = band.slide
    for i, sd in enumerate(slides):
        draw(i, len(slides), sd, d, acc)
    doc = {"type": "excalidraw", "version": 2, "source": "https://excalidraw.com", "elements": E,
           "appState": {"viewBackgroundColor": T.get("canvas", "#ffffff"), "gridSize": None}, "files": FILES}
    out = d / f"{FMT}.excalidraw"
    out.write_text(json.dumps(doc, ensure_ascii=False), encoding="utf-8")
    (d / "render_flags.json").write_text(json.dumps(FLAGS, indent=1), encoding="utf-8")
    if FMT == "broll":  # editor's cue sheet: which still goes with which line
        frs = [e for e in E if e["type"] == "frame"]
        sc = S.get("exportScale", 1)
        rows = [f"| {k+1:02d}.png | {sd.get('at', '')} | {round(f['width'] * sc)}×{round(f['height'] * sc)} | {sd.get('line', '')} |"
                for k, (sd, f) in enumerate(zip(slides, frs))]
        (d / "shotlist.md").write_text(f"# {sb.get('title', '')} B-roll\n\nTransparent overlay PNGs, sized to their content. Scale and place freely.\n\n"
                                       f"| file | at | size (px) | dialogue line |\n|---|---|---|---|\n"
                                       + "\n".join(rows) + "\n", encoding="utf-8")
    print(f"rendered {len(slides)} {FMT} frames, {len(E)} elements, {len(FLAGS)} flags -> {out}")


if __name__ == "__main__":
    main(sys.argv[1])
