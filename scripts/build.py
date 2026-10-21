"""Check + export a rendered carousel with headless Chrome.

  python scripts/build.py carousels/<folder>          # check only
  python scripts/build.py carousels/<folder> --export # check, then slides/NN.png + carousel.pdf

The check renders every frame with the real Excalidraw renderer and measures real text
boxes (not estimates): overflow past the safe margin, text under the minimum size,
content spilling outside the 4:5 frame, and unfilled image/logo slots.
"""
import json, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).parent))
from render import load_theme  # noqa: E402
T = load_theme()
def find_chrome():
    """Chrome/Edge/Chromium on Windows, macOS or Linux. Override with CHROME=/path/to/browser."""
    import os, shutil
    cands = [os.environ.get("CHROME", ""),
             r"C:\Program Files\Google\Chrome\Application\chrome.exe",
             r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
             "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
             "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
             "/Applications/Chromium.app/Contents/MacOS/Chromium"]
    cands += [shutil.which(n) or "" for n in ("google-chrome", "chromium", "chromium-browser", "microsoft-edge")]
    for p in cands:
        if p and Path(p).exists(): return p
    sys.exit("No Chrome/Edge/Chromium found. Install Chrome or set CHROME=/path/to/browser.")


CHROME = find_chrome()
W, H, M = T["size"]["w"], T["size"]["h"], T["size"]["margin"]

PAGE = """<!doctype html><html><head><meta charset="utf-8">
<script src="https://unpkg.com/react@18.2.0/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js"></script>
<script>window.EXCALIDRAW_ASSET_PATH="https://unpkg.com/@excalidraw/excalidraw@0.17.6/dist/";</script>
<script src="https://unpkg.com/@excalidraw/excalidraw@0.17.6/dist/excalidraw.production.min.js"></script>
__FONTLINK__<style>__FONTCSS__@page{size:__W__px __H__px;margin:0}html,body{margin:0;background:#fff}
.pg{width:__W__px;height:__H__px;overflow:hidden;page-break-after:always;break-after:page}
.pg svg{display:block;width:__W__px;height:__H__px}</style></head><body>
<script id="doc" type="application/json">__DOC__</script><pre id="result">pending</pre>
<script>
(async () => {
  const MODE = "__MODE__", ONLY = __ONLY__, M = __M__, W = __W__, H = __H__, MIN = __MIN__, LABEL_MIN = __LMIN__;
  const d = JSON.parse(document.getElementById("doc").textContent);
  const frames = d.elements.filter(e => e.type === "frame");
  const out = [];
  const FONT = __FONT__;
  await document.fonts.load("40px Virgil").catch(() => {});
  // theme web font: the primary (installed or in assets/fonts) if it loads, else the free fallback
  let USED = "";
  if (FONT) {
    const ok = async f => (await Promise.all([400, 700].map(w =>
      document.fonts.load(`${w} 40px "${f}"`).catch(() => [])))).every(r => r.length);
    USED = (await ok(FONT.primary)) ? FONT.primary : (await ok(FONT.fallback)) ? FONT.fallback : "";
    // no font loaded -> render nothing, so the export sees a near-empty file and retries
    if (!USED && MODE !== "check") throw new Error("font not loaded");
    document.documentElement.style.setProperty("--f", `"${USED || FONT.fallback}"`);
  }
  // weights (Excalidraw text has none). explicit themes encode them in the fontSize fraction
  // (+0.5 bold, +0.25 tight tracking, +0.125 wide caps); otherwise: big = heavy, ink-coloured = ink, the rest = rest.
  // Short ALL-CAPS labels are always letter-spaced.
  const weigh = svg => FONT && svg.querySelectorAll("text").forEach(t => {
    const fs = parseFloat(t.getAttribute("font-size")), txt = t.textContent.trim();
    const fill = (t.getAttribute("fill") || "").toLowerCase();
    const caps = /[A-Z]{2}/.test(txt) && !/[a-z]/.test(txt) && fs <= 36;
    let w = FONT.w.rest;
    if (FONT.explicit) {
      const f = Math.round((fs % 1) * 8);
      w = f & 4 ? 700 : 400;
      if (f & 2) t.style.letterSpacing = "-0.035em";
      if (f & 1) t.style.letterSpacing = "0.12em";
    }
    else if (caps) { w = FONT.w.kicker; t.style.letterSpacing = "0.12em"; }
    else if (fs >= FONT.heavyFrom || txt === FONT.wordmark) w = FONT.w.heavy;
    else if (FONT.inks.includes(fill) && fs >= 36) w = FONT.w.ink;
    t.style.fontWeight = w;
  });
  for (let i = 0; i < frames.length; i++) {
    if (ONLY >= 0 && i !== ONLY) continue;
    const fr = frames[i];
    const els = d.elements.filter(e => e.id === fr.id || e.frameId === fr.id);
    const svg = await ExcalidrawLib.exportToSvg({ elements: els, files: d.files,
      exportPadding: 0, appState: { ...d.appState, exportBackground: true,
        frameRendering: { enabled: true, name: false, outline: false, clip: MODE !== "check" } } });
    weigh(svg);
    const pg = document.createElement("div"); pg.className = "pg"; pg.appendChild(svg);
    document.body.appendChild(pg);
    if (MODE !== "check") continue;
    // measure: svg drawn unclipped at natural size; origin = min element x/y
    svg.style.width = svg.getAttribute("width") + "px"; svg.style.height = svg.getAttribute("height") + "px";
    await document.fonts.ready; await new Promise(r => setTimeout(r, 300));
    const vb = svg.viewBox.baseVal, sr = svg.getBoundingClientRect(), k = sr.width / vb.width;
    const minX = Math.min(...els.map(e => e.x)), minY = Math.min(...els.map(e => e.y));
    const ox = fr.x - minX, oy = fr.y - minY;
    const issues = [];
    if (Math.round(vb.width) > W + 2 || Math.round(vb.height) > H + 2)
      issues.push({ issue: "content outside 4:5 frame", size: [Math.round(vb.width), Math.round(vb.height)] });
    svg.querySelectorAll("text").forEach(t => {
      const b = t.getBoundingClientRect(); if (!b.width) return;
      const x0 = (b.left - sr.left) / k - ox, y0 = (b.top - sr.top) / k - oy, x1 = x0 + b.width / k, y1 = y0 + b.height / k;
      const txt = t.textContent.trim(); if (!txt) return;
      const fs = parseFloat(t.getAttribute("font-size"));
      const chrome = y0 > H - M - 20;
      if (!chrome && (x0 < M - 4 || x1 > W - M + 4))
        issues.push({ issue: "text past side margin", text: txt.slice(0, 40), x: [Math.round(x0), Math.round(x1)] });
      if (y1 > H - 20 || y0 < 0) issues.push({ issue: "text off slide", text: txt.slice(0, 40) });
      const words = txt.split(" ").length;
      if (!chrome && fs < (words <= 3 ? LABEL_MIN : MIN)) issues.push({ issue: "text below min size", text: txt.slice(0, 40), size: fs });
    });
    // text spilling out of the box it sits in (smallest rectangle containing its top-left)
    const boxes = els.filter(e => e.type === "rectangle").map(e => ({ x0: e.x - fr.x, y0: e.y - fr.y, x1: e.x - fr.x + e.width, y1: e.y - fr.y + e.height }));
    svg.querySelectorAll("text").forEach(t => {
      const b = t.getBoundingClientRect(); if (!b.width || !t.textContent.trim()) return;
      const x0 = (b.left - sr.left) / k - ox, y0 = (b.top - sr.top) / k - oy, x1 = x0 + b.width / k;
      // bottom = baseline + 0.3em (descenders), not the font's full descent box, which some fonts pad a lot
      const pt = svg.createSVGPoint(); pt.x = 0; pt.y = parseFloat(t.getAttribute("y")) || 0;
      const base = (pt.matrixTransform(t.getScreenCTM()).y - sr.top) / k - oy;
      const y1 = Math.min(y0 + b.height / k, base + 0.3 * parseFloat(t.getAttribute("font-size")));
      const cx = x0 + 4, cy = y0 + 4;
      const box = boxes.filter(q => cx >= q.x0 && cx <= q.x1 && cy >= q.y0 && cy <= q.y1)
                       .sort((a, c) => (a.x1 - a.x0) * (a.y1 - a.y0) - (c.x1 - c.x0) * (c.y1 - c.y0))[0];
      if (box && (x1 > box.x1 - 6 || y1 > box.y1 - 6))
        issues.push({ issue: "text spills out of its box", text: t.textContent.trim().slice(0, 40) });
    });
    // big empty band above the footer = visual not filling the slide
    const bottoms = els.filter(e => e.type !== "frame" && e.y - fr.y < H - M - 20).map(e => e.y - fr.y + e.height);
    const gap = (H - M - 20) - Math.max(...bottoms);
    if (gap > 260) issues.push({ issue: "warn: empty space at bottom", px: Math.round(gap) });
    els.filter(e => e.customData && e.customData.flag).forEach(e => issues.push({ issue: e.customData.flag, src: e.customData.src }));
    out.push({ slide: i + 1, name: fr.name, issues });
    pg.remove();
  }
  document.getElementById("result").textContent = MODE === "check" ? "RESULT" + JSON.stringify(out) + "END" + "FONT:" + USED + ":FONT" : "done";
  if (MODE !== "check") document.getElementById("result").remove();
})().catch(e => document.getElementById("result").textContent = "RESULT" + JSON.stringify({ error: String(e) }) + "END");
</script></body></html>"""


WEIGHT_WORDS = [("thin", 100), ("ultralight", 200), ("light", 300), ("medium", 500), ("bold", 700),
                ("heavy", 800), ("black", 900), ("roman", 400), ("regular", 400)]


def font_faces(alias, family, key, weights, local=True):
    """@font-face rules under `alias`: files in assets/fonts whose name contains `key` (e.g. "helveticaneue"),
    plus an installed copy via local() when `local`. Only weights with a possible source are declared."""
    files = {}
    for f in sorted((ROOT / "assets" / "fonts").glob("*")):
        n = f.name.lower().replace(" ", "").replace("-", "").replace("_", "")
        if f.suffix.lower() not in (".otf", ".ttf", ".woff", ".woff2") or key not in n or "italic" in n: continue
        files.setdefault(next((w for k, w in WEIGHT_WORDS if k in n.replace(key, "")), 400), f)
    ps = family.replace(" ", ""); css = ""
    for w in sorted(set(weights)):
        name = next((k for k, v in WEIGHT_WORDS if v == w), "").title()
        srcs = ([f"url('{files[w].resolve().as_uri()}')"] if w in files else [])
        if local:
            srcs += [f"local('{family}')", f"local('{ps}')"] if w == 400 else [f"local('{family} {name}')", f"local('{ps}-{name}')"]
        if srcs: css += f"@font-face{{font-family:'{alias}';font-weight:{w};src:{','.join(srcs)}}}"
    return css


def page(d, doc, mode, only=-1):
    wf = T.get("webFont")
    fb = wf and wf["fallback"]
    faces = wf and (font_faces("Theme Primary", wf["family"], wf["family"].lower().replace(" ", ""), wf["weights"].values())
                    + font_faces("Theme Fallback", fb["family"], fb["key"], wf["weights"].values(), local=False))
    font = json.dumps(wf and {"primary": "Theme Primary", "fallback": "Theme Fallback", "w": wf["weights"],
                              "explicit": bool(T.get("explicitWeight")),
                              "heavyFrom": wf["heavyFrom"], "wordmark": T.get("wordmark"),
                              "inks": sorted({c["ink"].lower() for c in [T["colors"]] + [T[k] for k in ("onDark",) if k in T]})})
    html = (PAGE.replace("__FONTLINK__", "")
            .replace("__FONTCSS__", faces + ".pg svg text{font-family:var(--f),'Segoe UI Emoji',sans-serif!important}" if wf else "")
            .replace("__FONT__", font)
            .replace("__DOC__", json.dumps(doc, ensure_ascii=False).replace("</", "<\\/"))
            .replace("__MODE__", mode).replace("__ONLY__", str(only)).replace("__M__", str(M))
            .replace("__W__", str(W)).replace("__H__", str(H)).replace("__MIN__", str(T["type"]["min"])).replace("__LMIN__", str(T["type"]["labelMin"])))
    p = d / f"_build_{mode}{'' if only < 0 else only}.html"
    p.write_text(html, encoding="utf-8")
    return p


def chrome(args):
    return subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                           "--virtual-time-budget=25000", *args], capture_output=True, text=True,
                          encoding="utf-8", errors="ignore", timeout=180)


def retry(run, out, min_bytes, tries=3):
    """CDN scripts occasionally fail to load; a failed render is a near-empty file."""
    for _ in range(tries):
        if out.exists(): out.unlink()
        run()
        if out.exists() and out.stat().st_size >= min_bytes: return True
    return False


def main(folder, export):
    global T, W, H, M
    d = (ROOT / folder).resolve()
    sb = d / "storyboard.json"
    if sb.exists():
        sbj = json.loads(sb.read_text(encoding="utf-8"))
        T = load_theme(sbj.get("theme"), sbj.get("format"))
    W, H, M = T["size"]["w"], T["size"]["h"], T["size"]["margin"]
    doc = json.loads((d / "carousel.excalidraw").read_text(encoding="utf-8"))
    r = chrome(["--dump-dom", page(d, doc, "check").as_uri()])
    s = r.stdout
    if "RESULT" not in s:
        print("check page did not finish:\n", s[-500:], r.stderr[-500:]); sys.exit(2)
    res = json.loads(s[s.index("RESULT") + 6:s.index("END", s.index("RESULT"))].replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", '"'))
    if isinstance(res, dict): print("render error:", res); sys.exit(2)
    if T.get("webFont") and "FONT:" in s:
        f0 = s.index("FONT:", s.index("RESULT")) + 5; used = s[f0:s.index(":FONT", f0)]
        wf = T["webFont"]
        print("font:", wf["family"] if used == "Theme Primary" else
              f"{wf['fallback']['family']} (stand-in: {wf['family']} not installed and not in assets/fonts/)" if used else "NOT LOADED")
    for f in json.loads((d / "render_flags.json").read_text(encoding="utf-8")):
        if f["flag"] == "crowded":
            res[f["slide"] - 1]["issues"].append({"issue": "crowded", "why": f["why"]})
        elif f["flag"] == "warn":
            res[f["slide"] - 1]["issues"].append({"issue": "warn: " + f["why"]})
    (d / "check_report.json").write_text(json.dumps(res, indent=1, ensure_ascii=False), encoding="utf-8")
    blocking = 0
    for sl in res:
        mark = "OK " if not sl["issues"] else "!! "
        print(f"{mark}slide {sl['slide']:>2} {sl['name']}")
        for it in sl["issues"]:
            soft = it["issue"].startswith(("missing-", "warn:"))
            blocking += 0 if soft else 1
            print(f"     {'(non-blocking) ' if soft else ''}{it}")
    print(f"\n{blocking} blocking issue(s); slots are listed but don't block export.")
    if export:
        if blocking: print("not exporting: fix blocking issues first"); sys.exit(1)
        (d / "slides").mkdir(exist_ok=True)
        for i in range(len(res)):
            out = d / "slides" / f"{i+1:02d}.png"
            ok = retry(lambda: chrome([f"--screenshot={out}", f"--window-size={W},{H}", page(d, doc, "slide", i).as_uri()]), out, 20000)
            print("png", out.name, "ok" if ok else "FAILED (renderer did not load)")
        pdf = d / "carousel.pdf"
        ok = retry(lambda: chrome([f"--print-to-pdf={pdf}", "--no-pdf-header-footer", page(d, doc, "pdf").as_uri()]),
                   pdf, 8000 * len(res))
        print("pdf", "ok" if ok else "FAILED (renderer did not load)", pdf)
    for p in d.glob("_build_*.html"): p.unlink()


if __name__ == "__main__":
    main(sys.argv[1], "--export" in sys.argv)
