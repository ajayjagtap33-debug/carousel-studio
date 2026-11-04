"""Export the art library (person.*, bot.*, doodles) as plain shapes for the video module.

  python scripts/cast_export.py        -> broll/src/studio/cast.json

scripts/library.py draws every item in a 100x100 box through a pen; here the pen records lines, ellipses, rects and
text instead of making Excalidraw elements, so videos use the same cast as the carousels (CLAUDE.md: our own cast,
added to the library, never one-off). Colours stay as library names; broll/src/studio/cast.tsx maps them to the theme.
Re-run after changing library.py.
"""
import json, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import library as L

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "broll" / "src" / "studio" / "cast.json"
r = lambda v: round(v, 1)


class Rec:
    """Stands in for render.py: records each shape in design units (0..100)."""
    def __init__(s): s.out = []

    def col(s, c): return c

    def line(s, pts, stroke, curve=False, sw=None, backgroundColor=None, fill=None, **kw):
        s.out.append({"k": "line", "pts": [[r(x), r(y)] for x, y in pts], "stroke": stroke, "curve": curve,
                      "bg": backgroundColor if backgroundColor not in (None, "transparent") else None})

    def arrow(s, pts, stroke, curve=False, sw=None, **kw):
        s.out.append({"k": "arrow", "pts": [[r(x), r(y)] for x, y in pts], "stroke": stroke, "curve": curve})

    def ellipse(s, x, y, w, h, stroke, bg=None, sw=None, **kw):
        s.out.append({"k": "ell", "x": r(x), "y": r(y), "w": r(w), "h": r(h), "stroke": stroke, "bg": bg, "thin": (sw or 2) <= 1})

    def rect(s, x, y, w, h, stroke, bg=None, sw=None, **kw):
        s.out.append({"k": "rect", "x": r(x), "y": r(y), "w": r(w), "h": r(h), "stroke": stroke, "bg": bg})

    def ctext(s, cx, cy, t, size, color):
        s.out.append({"k": "text", "x": r(cx), "y": r(cy), "t": t, "size": r(size / 2.8), "color": color})


def main():
    rec = Rec(); L.use(rec)
    cast = {}
    for i in L.ids():
        rec.out = []
        L.draw({"id": i, "x": 0, "y": 0, "size": 100}, acc="ACC")  # ACC = the theme accent (the shirt, the bot's light)
        cast[i] = rec.out
    OUT.write_text(json.dumps(cast, separators=(",", ":")), encoding="utf-8")
    print(f"{OUT.relative_to(ROOT).as_posix()}: {len(cast)} items")


if __name__ == "__main__":
    main()
