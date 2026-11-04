"""Library art -> transparent PNG, one file per id. For use outside the Excalidraw pipeline
(the Refluke b-roll frames, and later the Remotion scenes).

  python3 scripts/art_png.py person.think                       # -> assets/refluke-broll/preview/art/
  python3 scripts/art_png.py person.think --ink=#2C6650 --out=x.png
  python3 scripts/art_png.py person.think bot.stand --size=560
"""
import json, subprocess, sys, os, shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).parent))
import render as r  # noqa: E402
import library  # noqa: E402

library.use(r)
OUT = ROOT / "assets/refluke-broll/preview/art"

PAGE = """<!doctype html><html><head><meta charset="utf-8">
<script src="https://unpkg.com/react@18.2.0/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js"></script>
<script>window.EXCALIDRAW_ASSET_PATH="https://unpkg.com/@excalidraw/excalidraw@0.17.6/dist/";</script>
<script src="https://unpkg.com/@excalidraw/excalidraw@0.17.6/dist/excalidraw.production.min.js"></script>
<style>html,body{margin:0;background:transparent}svg{display:block}</style></head><body>
<script id="doc" type="application/json">__DOC__</script>
<script>(async () => {
  const d = JSON.parse(document.getElementById("doc").textContent);
  await document.fonts.ready;
  const svg = await ExcalidrawLib.exportToSvg({ elements: d.elements, files: d.files,
    exportPadding: 12, appState: { ...d.appState, exportBackground: false } });
  document.body.appendChild(svg);
})();</script></body></html>"""


def chrome():
    c = [os.environ.get("CHROME", ""),
         "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
         "/Applications/Chromium.app/Contents/MacOS/Chromium"]
    c += [shutil.which(n) or "" for n in ("google-chrome", "chromium", "chromium-browser")]
    for p in c:
        if p and Path(p).exists():
            return p
    sys.exit("Chrome not found; set CHROME=/path/to/chrome")


def draw(art_id, size=520, ink=None, accent="green", plain=False):
    """Draw one art id on its own and return the excalidraw doc.
    plain=True drops the blush (l_red), which is a third colour the Refluke palette doesn't have."""
    r.E.clear()
    if ink:
        r.C = {**r.C, "ink": ink}
    if plain:
        r.C = {**r.C, "l_red": "transparent"}
    r.ART = True
    try:
        library.draw({"id": art_id, "x": 0, "y": 0, "size": size}, accent)
    finally:
        r.ART = False
        r.set_theme()  # put the palette back
    return {"type": "excalidraw", "version": 2, "source": "https://excalidraw.com",
            "elements": list(r.E), "appState": {"viewBackgroundColor": "transparent"}, "files": {}}


def png(art_id, out: Path, size=520, ink=None, accent="green", plain=False):
    doc = draw(art_id, size, ink, accent, plain)
    out.parent.mkdir(parents=True, exist_ok=True)
    tmp = out.with_suffix(".html")
    tmp.write_text(PAGE.replace("__DOC__", json.dumps(doc).replace("</", "<\\/")), encoding="utf-8")
    box = int(size * 1.8)
    subprocess.run([chrome(), "--headless", "--disable-gpu", "--hide-scrollbars",
                    "--default-background-color=00000000",
                    f"--screenshot={out}", f"--window-size={box},{box}",
                    "--virtual-time-budget=8000", tmp.as_uri()], capture_output=True)
    tmp.unlink(missing_ok=True)
    return out.exists()


if __name__ == "__main__":
    ids = [a for a in sys.argv[1:] if not a.startswith("--")]
    opt = {a.split("=")[0][2:]: a.split("=", 1)[1] for a in sys.argv[1:] if a.startswith("--") and "=" in a}
    size = int(opt.get("size", 520))
    plain = "--plain" in sys.argv
    for i in ids:
        dst = Path(opt["out"]) if "out" in opt else OUT / (i.replace(".", "-") + ".png")
        dst = dst if dst.is_absolute() else (ROOT / dst)
        ok = png(i, dst, size, opt.get("ink"), opt.get("accent", "green"), plain)
        print(("  ok   " if ok else "  FAIL ") + str(dst.relative_to(ROOT)))
