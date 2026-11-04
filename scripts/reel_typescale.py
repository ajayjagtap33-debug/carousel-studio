"""Type-scale spike for the vertical (reel) layer — 1080x1920 frames to judge legibility by eye.

  python3 scripts/reel_typescale.py            # all -> assets/refluke-broll/reel/

Not the build. This exists to answer one question from reel-plan.md §8.5: what size does body
text need to be on a 1080-wide frame, and how much copy still fits once it is that big.
Theme tokens are the same as scripts/refluke_frames.py.
"""
import subprocess, sys, os, shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets/refluke-broll/reel"
W, H = 1080, 1920

# the working safe box from reel-plan.md §1
SAFE = dict(top=260, bottom=480, side=140)
BOX = dict(x=SAFE["side"], y=SAFE["top"],
           w=W - 2 * SAFE["side"], h=H - SAFE["top"] - SAFE["bottom"])

T = dict(page="#FAFCFA", card="#FFFFFF", panel="#F9F9F6", ghost="#EDE9E2", line="#ECECE8",
         accent="#536837", deep="#3B482E", success="#2ADD5E",
         ink="#0C0F0F", body="#65676B", mute="#7B7B7E", guide="#C9A2A2")

CSS = """
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..600;1,400&family=DM+Sans:opsz,wght@9..40,400..600&family=DM+Mono&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:%(W)spx;height:%(H)spx;overflow:hidden}
body{font-family:'DM Sans',sans-serif;background:%(page)s;color:%(body)s;-webkit-font-smoothing:antialiased}
.pg{position:relative;width:%(W)spx;height:%(H)spx}
.ser{font-family:'Playfair Display',serif;font-weight:400;color:%(ink)s;letter-spacing:-.005em}
.card{background:%(card)s;border-radius:18px;box-shadow:0 1px 2px rgba(20,24,20,.05),0 10px 30px rgba(20,24,20,.045)}
.tick{width:34px;height:34px;border-radius:50%%;background:%(success)s;display:flex;align-items:center;
  justify-content:center;flex-shrink:0}
/* guides — not part of the design */
.zone{position:absolute;left:0;right:0;background:rgba(201,162,162,.13);
  border-top:2px dashed %(guide)s;border-bottom:2px dashed %(guide)s}
.sidez{position:absolute;top:0;bottom:0;background:rgba(201,162,162,.13)}
.glabel{position:absolute;font-family:'DM Mono',monospace;font-size:19px;color:#B08A8A}
.safe{position:absolute;border:2px dashed %(guide)s;border-radius:4px}
"""


def guides(show=True):
    if not show:
        return ""
    s, b = SAFE["side"], SAFE["bottom"]
    return f"""
    <div class="zone" style="top:0;height:{SAFE['top']}px"></div>
    <div class="zone" style="bottom:0;height:{b}px"></div>
    <div class="sidez" style="left:0;width:{s}px"></div>
    <div class="sidez" style="right:0;width:{s}px"></div>
    <div class="glabel" style="left:24px;top:{SAFE['top'] - 32}px">top {SAFE['top']} — username / audio</div>
    <div class="glabel" style="left:24px;bottom:{b + 14}px">bottom {b} — caption + buttons</div>
    <div class="glabel" style="right:24px;bottom:{b // 2}px;transform:rotate(-90deg);transform-origin:right bottom">
      action rail</div>
    <div class="safe" style="left:{BOX['x']}px;top:{BOX['y']}px;width:{BOX['w']}px;height:{BOX['h']}px"></div>
    """


def page(body, show_guides=True):
    return (f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS % dict(W=W, H=H, **T)}'
            f'</style></head><body><div class="pg">{guides(show_guides)}{body}</div></body></html>')


def stage(inner, pad_top=0):
    return (f'<div style="position:absolute;left:{BOX["x"]}px;top:{BOX["y"] + pad_top}px;'
            f'width:{BOX["w"]}px">{inner}</div>')


# ---------------------------------------------------------------- the specimens
def ruler():
    """Sample copy at descending sizes, so the floor can be picked by eye."""
    rows = []
    for px in (48, 44, 40, 36, 32, 28, 24):
        rows.append(f"""
          <div style="display:flex;align-items:baseline;gap:22px;padding:20px 0;
               border-bottom:1px solid {T['line']}">
            <div style="font-family:'DM Mono',monospace;font-size:20px;color:{T['mute']};
                 width:62px;flex-shrink:0">{px}</div>
            <div style="font-size:{px}px;color:{T['ink']};line-height:1.25">
              Track the citation, not the ranking</div>
          </div>""")
    return stage(f"""
      <div style="font-family:'DM Mono',monospace;font-size:22px;color:{T['mute']};margin-bottom:26px">
        body text · DM Sans · 1080 wide</div>
      {''.join(rows)}
      <div style="margin-top:40px;font-family:'DM Mono',monospace;font-size:20px;color:{T['mute']};
           line-height:1.6">
        open this at 100%, or send it to your phone.<br>
        judging type on a laptop at 30% is how reels end up unreadable.</div>
    """)


def spine(row_px, title_px, n_rows):
    items = [("Answer in the first 40 words", "done"),
             ("One claim per heading", "done"),
             ("Put the number in the sentence", "active"),
             ("Name the source inline", "ghost"),
             ("Keep the page one scroll", "ghost")][:n_rows]
    out = []
    for txt, st in items:
        if st == "ghost":
            out.append(f"""<div style="display:flex;align-items:center;gap:18px;padding:{row_px*0.46}px 22px">
              <div style="width:26px;height:26px;border-radius:6px;background:{T['ghost']};flex-shrink:0"></div>
              <div style="height:{row_px*0.5}px;width:70%;background:{T['ghost']};border-radius:5px;
                   filter:blur(2.5px)"></div></div>""")
        elif st == "active":
            out.append(f"""<div style="display:flex;align-items:center;gap:18px;padding:{row_px*0.46}px 22px;
              background:{T['accent']};border-radius:14px;margin:4px 0">
              <div style="width:26px;height:26px;border-radius:6px;background:rgba(255,255,255,.22);
                   flex-shrink:0"></div>
              <div style="font-size:{row_px}px;color:#fff;font-weight:500;line-height:1.25">{txt}</div></div>""")
        else:
            out.append(f"""<div style="display:flex;align-items:center;gap:18px;padding:{row_px*0.46}px 22px">
              <div style="width:26px;height:26px;border-radius:6px;background:{T['ghost']};flex-shrink:0"></div>
              <div style="flex:1;font-size:{row_px}px;color:{T['mute']};line-height:1.25">{txt}</div>
              <div class="tick"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="#fff"
                stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="4,12.5 9.5,18 20,6.5"/></svg></div></div>""")
    return stage(f"""
      <div class="card" style="padding:30px 22px">
        <div class="ser" style="font-size:{title_px}px;margin:0 20px 20px">Five things to fix</div>
        {''.join(out)}
      </div>
      <div style="font-family:'DM Mono',monospace;font-size:21px;color:{T['mute']};margin-top:26px">
        rows {row_px}px · {n_rows} of 5 fit</div>
    """)


def statement(px):
    return stage(f"""
      <div class="ser" style="font-size:{px}px;line-height:1.1">
        AI does not replace marketers.<br>
        It <span style="font-style:italic;color:{T['accent']}">exposes weak ones</span><br>
        and amplifies strong ones.</div>
      <div style="font-family:'DM Mono',monospace;font-size:21px;color:{T['mute']};margin-top:34px">
        headline {px}px</div>
    """, pad_top=120)


def bars(label_px):
    def bar(name, val, frac, fill):
        return f"""<div style="margin-bottom:34px">
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px">
            <div style="width:26px;height:26px;border-radius:6px;background:{T['ghost']};flex-shrink:0"></div>
            <div style="flex:1;font-size:{label_px}px;color:{T['ink']}">{name}</div>
            <div class="ser" style="font-size:{label_px + 6}px">{val}</div></div>
          <div style="height:24px;background:{T['ghost']};border-radius:999px;overflow:hidden">
            <div style="height:24px;width:{frac}%;background:{fill};border-radius:999px"></div></div>
        </div>"""
    return stage(f"""
      <div class="card" style="padding:40px 36px">
        <div class="ser" style="font-size:{label_px + 10}px;margin-bottom:34px">Where the answers come from</div>
        {bar('Your own site', '12%', 12, '#C9CCC2')}
        {bar('Third-party listicles', '61%', 61, T['accent'])}
      </div>
      <div style="font-family:'DM Mono',monospace;font-size:21px;color:{T['mute']};margin-top:26px">
        labels {label_px}px</div>
    """)


SPECS = [
    ("ruler", ruler()),
    ("spine-33", spine(33, 40, 5)),
    ("spine-40", spine(40, 48, 5)),
    ("spine-46", spine(46, 54, 4)),
    ("statement-56", statement(56)),
    ("statement-72", statement(72)),
    ("statement-88", statement(88)),
    ("bars-40", bars(40)),
]


def chrome():
    c = [os.environ.get("CHROME", ""),
         "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
         "/Applications/Chromium.app/Contents/MacOS/Chromium"]
    c += [shutil.which(n) or "" for n in ("google-chrome", "chromium", "chromium-browser")]
    for p in c:
        if p and Path(p).exists():
            return p
    sys.exit("Chrome not found; set CHROME=/path/to/chrome")


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    want = sys.argv[1:]
    for name, body in SPECS:
        if want and name not in want:
            continue
        tmp = OUT / f"_{name}.html"
        tmp.write_text(page(body), encoding="utf-8")
        out = OUT / f"{name}.png"
        subprocess.run([chrome(), "--headless", "--disable-gpu", "--hide-scrollbars",
                        f"--screenshot={out}", f"--window-size={W},{H}",
                        "--virtual-time-budget=8000", tmp.as_uri()], capture_output=True)
        tmp.unlink(missing_ok=True)
        print(f"  {'ok ' if out.exists() else 'FAIL'} {name}")
    print(f"{len(SPECS)} frames -> {OUT.relative_to(ROOT)}")
