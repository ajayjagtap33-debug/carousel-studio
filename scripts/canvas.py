"""canvas.json -> canvas.excalidraw: a talk laid out as stations on one canvas.

  python scripts/canvas.py talks/<folder>                     # build canvas.excalidraw
  python scripts/canvas.py talks/<folder> --png               # + preview.png of the whole canvas
  python scripts/canvas.py talks/<folder> --png --only=b2d    # one station, as you'd zoom to it

Not slides and not an infographic. Stations stack down three columns and are spaced so that
zooming to one puts its neighbours off screen; arrows show the path. Say it with a shape where
a shape is shorter than the sentence — bars, a step flow, doors, and the hand-drawn doodles in
assets/library. Colour is ink and grey, with red kept for the live cues.
"""
import json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).parent))
import render as r  # noqa: E402

r.STEP = None
LH = r.F["lineHeight"]
BOX = {}          # station id -> (x0, y0, x1, y1)


def blk(x, y, s, size, color="ink", w=None, align="left"):
    if w:
        s = "\n".join(r.wrap(s, size, w))
    return r.text(x, y, s, size, color, align)


def art(spec, x, y, size, c="ink"):
    r.draw_art({"id": spec, "x": x, "y": y, "size": size}, c)


def station(st, cur):
    x, y = st["at"] if "at" in st else (cur["x"], cur["y"])
    w = st.get("w", 1600)
    y0, right = y, x + w

    if st.get("kicker"):
        y = blk(x, y, st["kicker"], 40, "grey") + 20
    if st.get("title"):
        ts = st.get("titleSize", 80)
        y = blk(x, y, st["title"], ts, "ink", w) + 14
        r.line([(x, y + 6), (x + min(w, max(r.tw(l, ts) for l in r.wrap(st["title"], ts, w))), y + 6)], "ink", sw=3)
        y += 44
    if st.get("big"):
        y = blk(x, y, st["big"], st.get("bigSize", 68), st.get("c", "ink"), w) + 26
    if st.get("sub"):
        y = blk(x, y, st["sub"], 42, "grey", w) + 30

    def blank(y):
        h = st.get("blankH", 170)
        r.rect(x, y, w, h, "grey", "paper", sw=2, style="dashed")
        r.ctext(x + w / 2, y + h / 2, st["blank"], 36, "grey")
        return y + h + 30

    for n in st.get("blocks", []):
        t = n["t"]
        if t == "ask":                       # the one box that means "stop and ask the room"
            for q in n["items"]:
                ls = r.wrap(q, 54, w - 80)
                h = 44 + len(ls) * 54 * LH + 44
                r.rect(x, y, w, h, "red", "paper", sw=3, style="dashed")
                r.ellipse(x - 28, y - 28, 60, 60, "red", "l_red")
                r.ctext(x + 2, y + 2, "?", 38, "red")
                blk(x + 40, y + 44, "\n".join(ls), 54)
                y += h + 30
        elif t == "blank":
            y = blank(y)
        elif t == "text":
            y = blk(x, y, n["s"], n.get("size", 56), n.get("c", "ink"), w) + n.get("gap", 26)
        elif t == "label":
            y = blk(x, y, n["s"], n.get("size", 40), "grey") + 18
        elif t == "bars":                    # a length comparison, instead of two sentences
            for b in n["items"]:
                bw = max(90, (w - 380) * b["frac"])
                if b.get("blank"):
                    r.rect(x, y, bw, 96, "grey", "paper", sw=3, style="dashed")
                    r.ctext(x + bw / 2, y + 48, b.get("in", ""), 34, "grey")
                else:
                    r.rect(x, y, bw, 96, "ink", "ink", sw=3, fill="hachure")
                blk(x + bw + 36, y + 18, b["label"], 50, "grey" if b.get("blank") else "ink")
                y += 132
            y += 20
        elif t == "flow":                    # the exercise as a pipeline, not a list
            k = len(n["items"]); cell = w / k
            for i, s in enumerate(n["items"]):
                cx = x + cell * (i + 0.5)
                r.ellipse(cx - 56, y, 112, 112, "ink", "paper", sw=3)
                r.ctext(cx, y + 56, str(i + 1), 48)
                blk(cx, y + 146, "\n".join(r.wrap(s, 34, cell - 60)), 34, "ink", align="center")
                if i:
                    r.arrow([(x + cell * (i - 0.5) + 66, y + 56), (cx - 66, y + 56)], "grey", sw=3)
            y += 146 + 4 * 34 * LH + 40
        elif t == "grid":                    # 2 across: half the height of a list
            cw = (w - 70) / 2
            for i, (a, b) in enumerate(n["items"]):
                rr, cc = divmod(i, 2)
                gx, gy = x + cc * (cw + 70), y + rr * n.get("h", 220)
                blk(gx, blk(gx, gy, a, 50, "ink", cw) + 8, b, 36, "grey", cw)
            y += ((len(n["items"]) + 1) // 2) * n.get("h", 220) + 10
        elif t == "doors":
            dw, dh, gap = 280, 380, 240
            for i, dr in enumerate(n["items"]):
                dx = x + i * (dw + gap)
                r.rect(dx, y, dw, dh, "ink", "paper", sw=3)
                r.ellipse(dx + dw - 62, y + dh / 2 - 13, 26, 26, "ink", "ink")
                blk(dx, blk(dx, y + dh + 26, dr["s"], 48, "ink", dw + gap - 40) + 6,
                    dr.get("sub", ""), 36, "grey", dw + gap - 40)
            y += dh + 180
        elif t == "art":                     # a row of hand-drawn doodles
            sz = n.get("size", 190)
            step = n.get("step", sz + 90)
            for i, a in enumerate(n["items"]):
                art(a, x + i * step, y, sz)
            y += sz + n.get("gap", 40)
        elif t == "lines":
            for s in n["items"]:
                y = blk(x, y, "-  " + s, n.get("size", 48), "ink", w) + 22
            y += 10
        elif t == "gap":
            y += n["px"]

    if st.get("foot"):
        y = blk(x, y, st["foot"], 44, "grey", w) + 16

    if st.get("aside"):                      # one doodle beside the station
        a = st["aside"]
        sz = a.get("size", 300)
        art(a["id"], right + 80, y0 + (y - y0) / 2 - sz / 2, sz)
        right += 80 + sz

    BOX[st["id"]] = (x, y0, right, y)
    if "at" not in st:
        cur["y"] = y + st.get("gap", cur["gap"])
    return BOX[st["id"]]


def link(a, b, dashed=False):
    ax0, ay0, ax1, ay1 = BOX[a]
    bx0, by0, bx1, by1 = BOX[b]
    kw = {"style": "dashed"} if dashed else {}
    if by0 > ay1 + 30:
        p = [((ax0 + ax1) / 2, ay1 + 30), ((bx0 + bx1) / 2, by0 - 40)]
    elif bx0 > ax1 + 30:
        p = [(ax1 + 30, (ay0 + ay1) / 2), (bx0 - 40, (by0 + by1) / 2)]
    else:
        p = [((ax0 + ax1) / 2, ay1 + 30), ((bx0 + bx1) / 2, by0 - 40)]
    r.arrow(p, "grey", sw=3, curve=True, **kw)


def build(d):
    spec = json.loads((d / "canvas.json").read_text(encoding="utf-8"))
    cols = {k: dict(v, gap=v.get("gap", spec.get("gap", 420))) for k, v in spec["columns"].items()}
    for st in spec["stations"]:
        station(st, cols.get(st.get("col"), {"x": 0, "y": 0, "gap": 400}))
    for l in spec.get("links", []):
        link(l[0], l[1], len(l) > 2 and l[2] == "dashed")

    doc = {"type": "excalidraw", "version": 2, "source": "https://excalidraw.com",
           "elements": r.E, "appState": {"viewBackgroundColor": "#ffffff", "gridSize": None}, "files": {}}
    out = d / "canvas.excalidraw"
    out.write_text(json.dumps(doc, ensure_ascii=False), encoding="utf-8")
    xs = [e["x"] for e in r.E] + [e["x"] + e["width"] for e in r.E]
    ys = [e["y"] for e in r.E] + [e["y"] + e["height"] for e in r.E]
    print("canvas: %d elements, %d stations, %dx%d -> %s"
          % (len(r.E), len(spec["stations"]), max(xs) - min(xs), max(ys) - min(ys), out))
    return doc, (min(xs), min(ys), max(xs), max(ys))


PREVIEW = """<!doctype html><html><head><meta charset="utf-8">
<script src="https://unpkg.com/react@18.2.0/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js"></script>
<script>window.EXCALIDRAW_ASSET_PATH="https://unpkg.com/@excalidraw/excalidraw@0.17.6/dist/";</script>
<script src="https://unpkg.com/@excalidraw/excalidraw@0.17.6/dist/excalidraw.production.min.js"></script>
<style>html,body{margin:0;background:#fff}svg{display:block}</style></head><body>
<script id="doc" type="application/json">__DOC__</script>
<script>(async () => {
  const d = JSON.parse(document.getElementById("doc").textContent);
  await document.fonts.ready;
  const k = __KEEP__;
  const els = k ? d.elements.filter(e => e.x >= k[0] && e.y >= k[1] && e.x <= k[2] && e.y <= k[3]) : d.elements;
  const svg = await ExcalidrawLib.exportToSvg({ elements: els, files: d.files,
    exportPadding: 60, appState: { ...d.appState, exportBackground: true } });
  svg.style.width = "__W__px"; svg.style.height = "__H__px";
  document.body.appendChild(svg);
})();</script></body></html>"""


def preview(d, doc, bb, scale, keep=None, name="preview.png"):
    import build
    x0, y0, x1, y1 = keep or bb
    w, h = int((x1 - x0 + 120) * scale), int((y1 - y0 + 120) * scale)
    p = d / "_canvas_preview.html"
    p.write_text(PREVIEW.replace("__DOC__", json.dumps(doc, ensure_ascii=False).replace("</", "<\\/"))
                 .replace("__KEEP__", json.dumps(list(keep)) if keep else "null")
                 .replace("__W__", str(w)).replace("__H__", str(h)), encoding="utf-8")
    out = d / name
    ok = build.retry(lambda: build.chrome(["--screenshot=" + str(out), "--window-size=%d,%d" % (w, h),
                                           p.as_uri()]), out, 15000)
    p.unlink()
    print("%s %dx%d" % (name, w, h), "ok" if ok else "FAILED", out)


if __name__ == "__main__":
    a = sys.argv[1]
    d = Path(a) if Path(a).is_absolute() else ROOT / a
    doc, bb = build(d)
    if "--png" in sys.argv:
        sc = [v for v in sys.argv if v.startswith("--scale=")]
        only = [v for v in sys.argv if v.startswith("--only=")]
        if only:
            sid = only[0].split("=")[1]
            x0, y0, x1, y1 = BOX[sid]
            preview(d, doc, bb, float(sc[0].split("=")[1]) if sc else 0.5,
                    keep=(x0 - 150, y0 - 150, x1 + 150, y1 + 150), name="station-%s.png" % sid)
        else:
            preview(d, doc, bb, float(sc[0].split("=")[1]) if sc else 0.16)
