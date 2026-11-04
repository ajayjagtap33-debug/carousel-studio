"""Three look-tests for a new TMV carousel style, one copy deck (T002, Reddit vs AI Mode).

    python carousels/2026-11-04-reddit-ai-mode-styles/make.py            all three styles
    python carousels/2026-11-04-reddit-ai-mode-styles/make.py proof      one style (front | proof | collage)

Writes <style>/NN.png + <style>/carousel.pdf, plus contact.png (all three side by side) and fonts.png.
HTML/CSS slides shot with headless Chrome at 1080x1350; fonts from Google Fonts (needs a network connection).
Assets in assets/: a licensed photo (CC BY 2.0, credited on the slide) cut out with scripts/matte.py,
the real page 4 of Reddit's Q3 2026 letter (sec.gov), logos from assets/logos/.
"""
import re, subprocess, sys, urllib.request
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageOps

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
A = HERE / "assets"
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
N = 7

FONTS = ("https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&"
         "family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&family=DM+Serif+Display:ital@0;1&"
         "family=Caveat:wght@600;700&family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&"
         "family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,500&family=Space+Grotesk:wght@500&"
         "family=Permanent+Marker&family=Newsreader:ital,opsz,wght@1,6..72,500&family=Playfair+Display:ital,wght@1,500&display=block")

SRC = {
    "letter": "Reddit Q3 2026 letter to shareholders (SEC Exhibit 99.2), p. 4",
    "sej": "Search Engine Journal, Oct 30, 2026 (Q3 earnings call)",
    "gm": "The Globe and Mail, Oct 30, 2026",
    "photo": "Photo: Steve Jurvetson, CC BY 2.0, cut out, black and white",
}


# ---------- assets ----------

def prep():
    """Person treatments (B&W photo, halftone cut-out, TMV duotone cut-out) and the highlighted letter page."""
    cut = Image.open(A / "huffman-cut.png").convert("RGBA")
    a = cut.split()[3].point(lambda v: 0 if v < 40 else v).filter(ImageFilter.GaussianBlur(0.8))
    g = ImageOps.grayscale(cut.convert("RGB"))
    g = ImageOps.autocontrast(ImageEnhance.Contrast(g).enhance(1.25), cutoff=1)

    # halftone: lift the mids first so the face survives the dot screen
    lift = g.point(lambda v: int(255 * (v / 255) ** 0.55))
    cell, ang = 7, 45
    big = lift.rotate(ang, expand=True, fillcolor=255)
    arr = np.asarray(big, dtype=np.float32) / 255
    dots = Image.new("L", big.size, 255); d = ImageDraw.Draw(dots)
    for y in range(0, big.size[1], cell):
        for x in range(0, big.size[0], cell):
            v = arr[y:y + cell, x:x + cell].mean()
            r = (1 - v) ** 0.8 * cell * 0.72
            if r > 0.35: d.ellipse((x + cell / 2 - r, y + cell / 2 - r, x + cell / 2 + r, y + cell / 2 + r), fill=0)
    dots = dots.rotate(-ang, expand=True, fillcolor=255)
    ox, oy = (dots.size[0] - cut.size[0]) // 2, (dots.size[1] - cut.size[1]) // 2
    dots = dots.crop((ox, oy, ox + cut.size[0], oy + cut.size[1]))
    ink = Image.new("RGBA", cut.size, (27, 26, 23, 255))
    ink.putalpha(Image.fromarray(np.minimum(255 - np.asarray(dots), np.asarray(a)).astype("uint8")))
    ink.save(A / "huffman-halftone.png")  # unused for now: too dark to read the face at slide size

    # duotone in TMV red: near-black maroon -> TMV red -> warm cream
    t = np.asarray(g, dtype=np.float32) / 255
    stops = [(0.0, (34, 4, 8)), (0.45, (184, 0, 0)), (1.0, (255, 236, 222))]
    rgb = np.zeros(t.shape + (3,), np.float32)
    for (p0, c0), (p1, c1) in zip(stops, stops[1:]):
        m = (t >= p0) & (t <= p1); k = ((t - p0) / (p1 - p0))[..., None]
        rgb[m] = (np.array(c0) + (np.array(c1) - np.array(c0)) * k)[m]
    duo = Image.fromarray(rgb.astype("uint8")).convert("RGBA"); duo.putalpha(a); duo.save(A / "huffman-duo.png")

    # plain B&W photo with its stage behind it (a real photo, not a cut-out)
    ph = ImageOps.grayscale(Image.open(A / "huffman.jpg").crop((1480, 1400, 2260, 2420)))
    ImageOps.autocontrast(ImageEnhance.Contrast(ph).enhance(1.15), cutoff=1).save(A / "huffman-photo-bw.jpg", quality=92)

    page = Image.open(A / "reddit-letter-p4.jpg").convert("RGB")
    hl = Image.new("RGB", page.size, "white"); d = ImageDraw.Draw(hl)
    for x0, x1, y in [(907, 1306, 643), (880, 1175, 663)]:
        d.rounded_rectangle((x0 - 3, y - 10, x1 + 3, y + 10), 4, fill=(255, 226, 77))
    ImageChops.multiply(page, hl).save(A / "reddit-letter-p4-hl.png")
    ImageChops.multiply(page, hl).crop((862, 470, 1345, 742)).save(A / "reddit-letter-crop.png")


def logo(name): return (ROOT / "assets" / "logos" / name).as_uri()
def asset(name): return (A / name).as_uri()


# ---------- shared pieces (pictures built in HTML/CSS) ----------

def ticker(cls=""):
    """Stock card from the two reported numbers only: close $91.73, down 29.22% on Oct 30."""
    return f"""<div class="ticker {cls}">
      <div class="tk-top"><img src="{logo('reddit.png')}"><div><b>RDDT</b><span>Reddit, Inc. · NYSE</span></div></div>
      <div class="tk-price">$91.73</div>
      <div class="tk-chg">▼ 29.22% <span>Oct 30, 2026 close</span></div>
      <div class="tk-bars"><div class="b1"><i></i><em>Oct 29</em></div><div class="b2"><i></i><em>Oct 30</em></div></div>
      <div class="tk-note">Bar heights: 100 vs 70.8 (a 29.22% fall)</div>
    </div>"""


def aimode(cls=""):
    """An AI answer built on a Reddit thread. Answer text is drawn as grey lines on purpose: we don't put words in Google's mouth."""
    return f"""<div class="aim {cls}">
      <div class="aim-bar"><img src="{logo('google.png')}"><span class="q">is it worth fixing a 10-year-old dishwasher</span></div>
      <div class="aim-tabs"><b>AI Mode</b><span>All</span><span>Images</span><span>Videos</span></div>
      <div class="aim-ans"><i style="width:96%"></i><i style="width:88%"></i><i style="width:92%"></i><i style="width:60%"></i></div>
      <div class="aim-src"><div class="chip"><img src="{logo('reddit.png')}"><div><b>reddit.com</b><span>a thread with 200+ replies</span></div></div>
        <div class="chip ghost"><div><b>2 more sites</b></div></div></div>
    </div>"""


def checklist(cls=""):
    return f"""<div class="check {cls}">
      <div class="ck-h">What an AI answer can give you</div>
      <div class="ck-r"><span class="y">✓</span>Your brand named in the answer</div>
      <div class="ck-r"><span class="y">✓</span>Your page cited as a source</div>
      <div class="ck-r"><span class="n">✗</span>A visit to your site <em>(not always)</em></div>
    </div>"""


def comment(cls=""):
    return f"""<div class="cmt {cls}"><div class="av"></div><div><b>you</b><p>CHECK</p></div><span class="heart">♡</span></div>"""


# ---------- style 1: Front page (Rishi essay) ----------

CSS_FRONT = """
:root{--hero:linear-gradient(100deg,#A6231A 0%,#952561 40%,#7D1E8D 65%,#24096A 100%);--heroL:linear-gradient(160deg,#D73E2E 0%,#8C275E 40%,#942A9A 65%,#310C87 100%)}
body{margin:0} .s{width:1080px;height:1350px;position:relative;overflow:hidden;font-family:Inter;box-sizing:border-box;padding:90px}
.paper{background:#F4EFED;color:#161616} .ink{background:#161616;color:#FBF8F7} .red{background:var(--heroL);color:#FBF8F7}
.top{position:absolute;top:60px;left:90px;right:90px;display:flex;justify-content:space-between;align-items:center;font-size:24px;letter-spacing:.06em;opacity:.75}
.top img{height:30px}
.swipe{position:absolute;bottom:62px;right:90px;font-size:44px;line-height:1;opacity:.85}
.bar i{position:absolute;left:0;top:-1px;height:4px;background:#B80000}
h1{font-family:Anton;font-weight:400;line-height:1.02;margin:0;letter-spacing:.005em}
.k{font-family:'Instrument Serif';font-style:italic;color:#B80000;font-size:56px;margin:0 0 6px}
.ink .k,.ink .acc{color:#F86659} .acc{color:#B80000}
.body{font-size:36px;line-height:1.4;margin-top:34px;max-width:860px} .body b{color:#B80000;font-weight:600} .ink .body b{color:#F86659}
.src{position:absolute;bottom:64px;left:90px;right:170px;font-size:20px;line-height:1.4;opacity:.55}
.sub{font-family:var(--sub);font-style:var(--subst,italic);font-weight:var(--subw,400);font-size:var(--subs,58px);line-height:1.12;color:#B80000;margin:0}
.tag{position:absolute;left:-30px;bottom:34px;display:flex;align-items:center;gap:12px;background:#161616;color:#FBF8F7;font-size:28px;font-weight:600;padding:12px 20px 12px 12px;border-radius:40px}
.tag img{width:44px}
.aipill{position:absolute;left:90px;top:960px;display:flex;align-items:center;gap:16px;background:#fff;border:1px solid #e2ddd9;border-radius:50px;padding:20px 30px 20px 22px;font-size:36px;box-shadow:0 12px 30px rgba(0,0,0,.12);transform:rotate(-2deg)}
.aipill img{width:46px} .aipill b{font-weight:600;color:#1f1f1f}
.box{background:var(--hero);color:#F4EFED;padding:0 14px;display:inline-block;line-height:1.08}
.ticker{background:#FBF8F7;color:#161616;border-radius:4px;padding:36px 46px;width:620px} .ticker .tk-bars{height:150px} .ticker .b2 i{background:linear-gradient(180deg,#A6231A,#7D1E8D)} .ticker .tk-price{font-size:88px}
"""

MID = '<div class="mid">{}</div>'

# cover line font (Instrument Serif was the first try); --sub family, --subst style, --subw weight, --subs size
SUBS = {
    "fraunces": "--sub:Fraunces;--subw:500;--subs:56px",
    "newsreader": "--sub:Newsreader;--subw:500;--subs:58px",
    "playfair": "--sub:'Playfair Display';--subw:500;--subs:52px",
    "caveat": "--sub:Caveat;--subst:normal;--subw:700;--subs:72px",
    "inter": "--sub:Inter;--subst:normal;--subw:600;--subs:54px",
}
SUB = "fraunces"


def front(i, s):
    bg = ["paper", "ink", "paper", "ink", "paper", "ink", "red"][i]
    tmv = "tmv-white.png" if bg != "paper" else "tmv-red.png"
    top = f'<div class="top"><img src="{logo(tmv)}"></div>'
    bot = '<div class="swipe">→</div>' if i < N - 1 else ''
    src = f'<div class="src">{s["src"]}</div>' if s.get("src") else ""
    v = ""
    if i == 0:
        main = f"""<div style="margin-top:80px;position:relative;z-index:2"><h1 style="font-size:128px;text-transform:uppercase">Reddit lost<br><span class="box">1M+ search</span><br>visits a week.</h1>
          <p class="sub" style="margin-top:34px;max-width:520px">And its CEO is pointing at Google's AI Mode.</p></div>
          <div style="position:absolute;right:20px;bottom:196px;width:520px"><img src="{asset('huffman-bw.png')}" style="width:520px;display:block">
            <div class="tag"><img src="{logo('reddit.png')}">Steve Huffman, CEO</div></div>
          <div class="aipill"><img src="{logo('google.png')}"><b>AI Mode</b></div>
          <svg style="position:absolute;left:380px;top:905px" width="260" height="120" viewBox="0 0 260 120" fill="none" stroke="#B80000" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
            <path d="M250 70 C 190 110, 110 100, 30 52"/><path d="M58 30 L 28 52 L 62 70"/></svg>"""
    elif i == 1:
        main = f"""<div style="margin-top:110px"><h1 style="font-size:96px">It's in Reddit's own <span class="acc">shareholder letter.</span></h1></div>
          <div style="margin-top:60px;background:#fff;padding:14px;transform:rotate(-1.2deg);box-shadow:0 20px 50px rgba(0,0,0,.45)"><img src="{asset('reddit-letter-crop.png')}" style="width:100%;display:block"></div>
          <p class="body" style="font-size:34px">Q3 2026, page 4. Hardest hit: <b>logged-out web traffic.</b></p>"""
    elif i == 2:
        main = f"""<div style="margin-top:120px;max-width:620px;position:relative;z-index:2"><p class="k">On the earnings call:</p>
          <h1 style="font-size:112px">AI Mode <span class="acc">“does not drive traffic.”</span></h1></div>
          <div style="position:absolute;right:-10px;bottom:196px;width:580px">
          <img src="{asset('huffman-bw.png')}" style="position:relative;width:580px;display:block">
            <div class="tag" style="left:-150px"><img src="{logo('reddit.png')}">Steve Huffman, CEO of Reddit</div></div>"""
    elif i == 3:
        main = f"""<div style="margin-top:120px"><p class="k">The next day:</p><h1 style="font-size:112px">Reddit's shares <span class="acc">fell 29%.</span></h1>
          <p class="body">Its <b>biggest one-day drop</b> ever.</p></div><div style="margin-top:56px">{ticker()}</div>"""
    elif i == 4:
        main = f"""<div style="margin-top:110px"><h1 style="font-size:88px">But Google still crawls Reddit <span class="acc">“as hard as ever.”</span></h1>
          <p class="body">The answers use the threads. <b>The clicks don't come.</b></p></div><div style="margin-top:50px">{aimode()}</div>"""
    elif i == 5:
        main = f"""<div style="margin-top:130px"><h1 style="font-size:112px">Stop counting clicks. <span class="acc">Track the answer.</span></h1></div>
          <div style="margin-top:70px">{checklist()}</div>"""
    else:
        main = f"""<div style="margin-top:200px"><h1 style="font-size:140px;text-transform:uppercase">Do AI answers<br>name your<br><span class="box" style="background:#FFD34D;color:#161616">brand?</span></h1>
          <p class="body" style="font-size:40px;margin-top:50px">Comment <b style="color:#FFD34D">CHECK</b> and we'll send you our free AI visibility checker.</p></div>
          <div style="margin-top:60px">{comment()}</div>"""
    if i not in (0, 2): main = MID.format(main)
    return f'<div class="s {bg}" style="{SUBS[SUB]}">{top}{main}{src}{bot}</div>'


# ---------- style 2: Proof desk (Jayant) ----------

CSS_PROOF = """
body{margin:0} .s{width:1080px;height:1350px;position:relative;overflow:hidden;font-family:Inter;color:#161616;box-sizing:border-box;padding:96px 90px;
 background:#F4F2EE;background-image:linear-gradient(rgba(0,0,0,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.045) 1px,transparent 1px);background-size:54px 54px;text-align:center}
.top{position:absolute;top:56px;left:0;right:0;text-align:center} .top img{height:34px}
.foot{position:absolute;bottom:50px;left:90px;right:90px;display:flex;justify-content:space-between;align-items:center;font-family:'JetBrains Mono';font-size:24px;color:#777}
.foot .lg{display:flex;align-items:center;gap:10px;font-family:Inter;font-weight:600;color:#222;font-size:24px} .foot .lg img{height:30px}
h1{font-family:'Instrument Serif';font-weight:400;font-size:100px;line-height:1.02;margin:40px 0 0;letter-spacing:-.01em} .acc{color:#B80000}
.cap{font-size:36px;line-height:1.35;margin-top:44px;color:#555} .cap b{color:#161616;font-weight:600}
.src{position:absolute;bottom:104px;left:90px;right:90px;font-family:'JetBrains Mono';font-size:20px;color:#999}
.card{background:#fff;border-radius:26px;box-shadow:0 1px 0 rgba(0,0,0,.06),0 24px 60px rgba(0,0,0,.10);text-align:left;margin:56px auto 0}
.arrow{font-size:60px;color:#161616;position:absolute}
"""

def proof(i, s):
    top = f'<div class="top"><img src="{logo("tmv-red.png")}"></div>'
    foot = f'<div class="foot"><span>{i + 1}/{N} →</span><span class="lg"><img src="{logo("reddit.png")}">Reddit × <img src="{logo("google.png")}">Google</span></div>'
    src = f'<div class="src">{s["src"]}</div>' if s.get("src") else ""
    if i == 0:
        main = f"""<h1 style="font-size:112px;margin-top:70px">Reddit lost <span class="acc">1M+ search visits</span> a week.</h1>
          <div class="card" style="width:820px;padding:0;overflow:hidden;display:flex;margin-top:60px">
            <img src="{asset('huffman-photo-bw.jpg')}" style="width:400px;height:480px;object-fit:cover">
            <div style="padding:44px 40px;display:flex;flex-direction:column;justify-content:space-between">
              <img src="{logo('reddit.png')}" style="width:84px"><div><div style="font-family:'Instrument Serif';font-size:58px;line-height:1.05">And its CEO blames <span class="acc">AI Mode.</span></div>
              <div style="font-size:24px;color:#777;margin-top:16px">Steve Huffman, Reddit CEO</div></div></div></div>"""
    elif i == 1:
        main = f"""<h1>It's in Reddit's own <span class="acc">shareholder letter.</span></h1>
          <div class="card" style="width:900px;overflow:hidden">
            <div style="display:flex;align-items:center;gap:10px;padding:16px 22px;border-bottom:1px solid #eee;font-family:'JetBrains Mono';font-size:20px;color:#888">
              <i style="width:13px;height:13px;border-radius:50%;background:#ED6A5E"></i><i style="width:13px;height:13px;border-radius:50%;background:#F5BF4F"></i><i style="width:13px;height:13px;border-radius:50%;background:#61C554"></i>
              <span style="margin-left:14px;background:#F2F2F2;border-radius:8px;padding:6px 14px">sec.gov · Reddit Q3 2026 letter to shareholders</span></div>
            <img src="{asset('reddit-letter-crop.png')}" style="width:100%;display:block"></div>
          <p class="cap"><b>Page 4.</b> The biggest hit: logged-out web traffic.</p>"""
    elif i == 2:
        main = f"""<h1 style="margin-top:60px">AI Mode <span class="acc">“does not drive traffic.”</span></h1>
          <div class="card" style="width:640px;padding:22px">
            <img src="{asset('huffman-photo-bw.jpg')}" style="width:100%;height:560px;object-fit:cover;border-radius:14px;display:block">
            <div style="display:flex;justify-content:space-between;align-items:center;padding:20px 8px 4px">
              <div><b style="font-size:30px">Steve Huffman</b><div style="color:#777;font-size:24px;margin-top:4px">CEO, Reddit · Q3 earnings call</div></div>
              <img src="{logo('reddit.png')}" style="width:62px"></div></div>"""
    elif i == 3:
        main = f"""<h1 style="margin-top:70px">The next day, Reddit's shares <span class="acc">fell 29%.</span></h1>
          <div class="card" style="width:640px;padding:44px 50px">{ticker('flat')}</div>
          <p class="cap"><b>Its biggest one-day drop ever.</b></p>"""
    elif i == 4:
        main = f"""<h1 style="font-size:92px">Google still crawls Reddit <span class="acc">“as hard as ever.”</span></h1>
          <div class="card" style="width:880px;padding:34px 38px">{aimode('flat')}</div>
          <p class="cap"><b>The answer uses the thread.</b> The click never comes.</p>"""
    elif i == 5:
        main = f"""<h1 style="margin-top:70px">Stop counting only clicks. <span class="acc">Track the answer.</span></h1>
          <div class="card" style="width:820px;padding:40px 46px">{checklist('flat')}</div>"""
    else:
        main = f"""<h1 style="margin-top:110px;font-size:112px">Do AI answers <span class="acc">name your brand?</span></h1>
          <div class="card" style="width:780px;padding:30px 36px">{comment('flat')}</div>
          <p class="cap" style="color:#161616">Comment <span style="background:#B80000;color:#fff;border-radius:10px;padding:2px 14px;font-weight:700">CHECK</span> and we'll send you<br><b>our free AI visibility checker.</b></p>"""
    main = MID.format(main)
    return f'<div class="s">{top}{main}{src}{foot}</div>'


# ---------- style 3: Cut & paste (Your Social Team + sticker faces) ----------

NOISE = ("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' "
         "baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .08 0'/></filter>"
         "<rect width='300' height='300' filter='url(%23n)'/></svg>")

CSS_COLLAGE = """
body{margin:0} .s{width:1080px;height:1350px;position:relative;overflow:hidden;font-family:Inter;color:#3A0A10;box-sizing:border-box;padding:90px;background-image:url("NOISE")}
.cream{background-color:#FAF3E8} .blush{background-color:#F6D9D2} .lilac{background-color:#E6DDF7}
h1{font-family:'DM Serif Display';font-weight:400;font-size:116px;line-height:1.13;margin:0;letter-spacing:-.015em}
.pill{padding:0 18px;border-radius:60px;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.p1{background:#F7B3A9} .p2{background:#D9CCF7} .p3{background:#FBE39B}
.hand{font-family:Caveat;font-weight:700;color:#B80000;font-size:52px;line-height:1.05}
.body{font-size:36px;line-height:1.4;margin-top:36px;color:#5A2A30}
.sticker{filter:drop-shadow(5px 0 0 #fff) drop-shadow(-5px 0 0 #fff) drop-shadow(0 5px 0 #fff) drop-shadow(0 -5px 0 #fff) drop-shadow(0 14px 18px rgba(60,10,16,.28))}
.tape{position:absolute;width:150px;height:44px;background:rgba(255,246,200,.75);box-shadow:0 2px 4px rgba(0,0,0,.08)}
.foot{position:absolute;bottom:54px;left:0;right:0;text-align:center;font-weight:600;font-size:24px;color:#7A3A40}
.badge{position:absolute;top:60px;right:70px;width:150px;height:150px;border-radius:50%;background:#FAF3E8;border:3px solid #3A0A10;display:flex;align-items:center;justify-content:center;transform:rotate(12deg)}
.badge img{width:96px} .badge svg{position:absolute;inset:0}
.src{position:absolute;bottom:100px;left:90px;right:90px;text-align:center;font-size:20px;line-height:1.35;color:#9A6A70}
.paper{background:#fff;padding:16px;box-shadow:0 18px 40px rgba(60,10,16,.22)}
"""

def badge():
    return f"""<div class="badge"><svg viewBox="0 0 150 150"><defs><path id="c" d="M75,75 m-56,0 a56,56 0 1,1 112,0 a56,56 0 1,1 -112,0"/></defs>
      <text font-family="Inter" font-weight="700" font-size="14" letter-spacing="2.2" fill="#3A0A10"><textPath href="#c">track my visibility  ·  track my visibility  ·</textPath></text></svg>
      <img src="{logo('tmv-red.png')}"></div>"""


def collage(i, s):
    bg = ["blush", "cream", "lilac", "cream", "blush", "cream", "blush"][i]
    foot = f'<div class="foot">{i + 1}/{N} →</div>'
    src = f'<div class="src">{s["src"]}</div>' if s.get("src") else ""
    if i == 0:
        main = f"""{badge()}<h1 style="font-size:132px;margin-top:70px;max-width:860px">Reddit lost <span class="pill p3">1M+</span> search visits <span class="pill p1">a week</span></h1>
          <img class="sticker" src="{asset('huffman-duo.png')}" style="position:absolute;left:40px;bottom:200px;width:500px;transform:rotate(-4deg)">
          <img class="sticker" src="{logo('reddit.png')}" style="position:absolute;left:470px;bottom:500px;width:120px;transform:rotate(10deg)">
          <img class="sticker" src="{logo('google.png')}" style="position:absolute;right:120px;bottom:400px;width:120px;transform:rotate(-8deg)">
          <div class="hand" style="position:absolute;right:70px;bottom:230px;width:400px;transform:rotate(-5deg)">…and its CEO is blaming Google's AI Mode</div>
          <svg style="position:absolute;right:330px;bottom:370px" width="140" height="80" viewBox="0 0 140 80"><path d="M130 10 C 90 0, 40 20, 20 60" stroke="#B80000" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M8 44 L20 64 L38 50" stroke="#B80000" stroke-width="5" fill="none" stroke-linecap="round"/></svg>"""
    elif i == 1:
        main = f"""<h1 style="margin-top:40px">It's in Reddit's own <span class="pill p3">shareholder letter</span></h1>
          <div style="position:relative;margin-top:70px;transform:rotate(-2deg)"><div class="paper"><img src="{asset('reddit-letter-crop.png')}" style="width:100%;display:block"></div>
            <div class="tape" style="left:-30px;top:-18px;transform:rotate(-30deg)"></div><div class="tape" style="right:-30px;top:-18px;transform:rotate(28deg)"></div></div>
          <div class="hand" style="margin-top:40px;transform:rotate(-2deg)">page 4 · hardest hit: logged-out web traffic</div>"""
    elif i == 2:
        main = f"""<h1 style="margin-top:40px;max-width:900px">AI Mode <span class="pill p1">“does not drive traffic”</span></h1>
          <div class="hand" style="margin-top:22px">– Steve Huffman, Reddit's CEO</div>
          <img class="sticker" src="{asset('huffman-duo.png')}" style="position:absolute;right:30px;bottom:190px;width:560px;transform:rotate(3deg)">
          <img class="sticker" src="{logo('reddit.png')}" style="position:absolute;left:120px;bottom:300px;width:150px;transform:rotate(-10deg)">"""
    elif i == 3:
        main = f"""<h1 style="margin-top:40px">The next day, shares <span class="pill p1">fell 29%</span></h1>
          <div style="position:relative;margin:70px auto 0;width:660px;transform:rotate(2deg)"><div class="paper" style="padding:40px 46px;border-radius:6px">{ticker('flat')}</div>
            <div class="tape" style="left:250px;top:-22px;transform:rotate(-4deg)"></div></div>
          <div class="hand" style="text-align:right;margin-top:30px">its biggest one-day drop ever</div>"""
    elif i == 4:
        main = f"""<h1 style="font-size:104px">Google still crawls Reddit <span class="pill p2">“as hard as ever”</span></h1>
          <div style="position:relative;margin-top:60px;transform:rotate(-1.5deg)"><div class="paper" style="padding:30px 34px;border-radius:18px">{aimode('flat')}</div>
            <div class="tape" style="right:60px;top:-20px;transform:rotate(8deg)"></div></div>
          <div class="hand" style="margin-top:34px">the answer uses the thread… the click never comes</div>"""
    elif i == 5:
        main = f"""<h1 style="margin-top:40px">Stop counting clicks. <span class="pill p3">Track the answer.</span></h1>
          <div style="position:relative;margin-top:70px;transform:rotate(1.5deg)"><div class="paper" style="padding:40px 46px;border-radius:6px">{checklist('flat')}</div>
            <div class="tape" style="left:-20px;top:-16px;transform:rotate(-25deg)"></div></div>"""
    else:
        main = f"""{badge()}<h1 style="margin-top:120px;font-size:124px">Do AI answers <span class="pill p3">name your brand?</span></h1>
          <div style="margin-top:70px;transform:rotate(-2deg)">{comment()}</div>
          <div class="hand" style="margin-top:40px;font-size:58px">comment CHECK and we'll send you our free AI visibility checker ↓</div>"""
    if i not in (0, 2): main = MID.format(main)
    return f'<div class="s {bg}">{main}{src}{foot}</div>'


# ---------- shared component CSS (each style restyles via its own sheet) ----------

CSS_PARTS = """
.mid{position:absolute;top:130px;bottom:170px;left:90px;right:90px;display:flex;flex-direction:column;justify-content:center} .mid>:first-child{margin-top:0!important}
.mid>*{flex:none}
.ticker .tk-top{display:flex;gap:16px;align-items:center} .ticker .tk-top img{width:58px}
.ticker .tk-top b{font-size:30px;display:block} .ticker .tk-top span{font-size:22px;color:#888}
.ticker .tk-price{font-size:104px;font-weight:700;letter-spacing:-.03em;margin-top:22px;line-height:1}
.ticker .tk-chg{font-size:34px;font-weight:700;color:#B80000;margin-top:10px} .ticker .tk-chg span{font-size:22px;color:#888;font-weight:500;margin-left:10px}
.ticker .tk-bars{display:flex;gap:40px;align-items:flex-end;height:220px;margin-top:30px;border-bottom:2px solid #ddd}
.ticker .tk-bars div{position:relative;width:120px;height:100%;display:flex;align-items:flex-end}
.ticker .tk-bars i{display:block;width:100%;background:#CFCAC0} .ticker .b1 i{height:100%} .ticker .b2 i{height:70.8%;background:#B80000}
.ticker .tk-bars em{position:absolute;bottom:-38px;left:0;right:0;text-align:center;font-style:normal;font-size:20px;color:#888}
.ticker .tk-note{font-size:16px;color:#aaa;margin-top:52px}
.ticker.flat{background:none;padding:0;width:auto;text-align:left;color:#161616}
.aim{background:#fff;color:#1f1f1f;border-radius:22px;padding:30px 34px;text-align:left;font-family:Inter}
.aim.flat{padding:0;background:none}
.aim-bar{display:flex;gap:16px;align-items:center;border:1px solid #ddd;border-radius:40px;padding:14px 22px} .aim-bar img{width:34px} .aim-bar .q{font-size:26px;color:#333}
.aim-tabs{display:flex;gap:26px;font-size:22px;color:#777;margin:22px 4px 0;border-bottom:1px solid #eee;padding-bottom:12px} .aim-tabs b{color:#1f1f1f;border-bottom:3px solid #1f1f1f;padding-bottom:10px}
.aim-ans{margin-top:26px} .aim-ans i{display:block;height:18px;border-radius:9px;background:#E7E5E1;margin-bottom:16px}
.aim-src{display:flex;gap:14px;margin-top:18px} .chip{display:flex;gap:14px;align-items:center;border:1px solid #e3e3e3;border-radius:16px;padding:14px 18px;background:#FAFAF8}
.chip img{width:44px} .chip b{font-size:22px;display:block} .chip span{font-size:18px;color:#888} .chip.ghost{color:#999}
.check{background:#FBF8F7;color:#161616;border-radius:6px;padding:36px 44px;text-align:left}
.check.flat{background:none;padding:0}
.ck-h{font-size:26px;color:#888;margin-bottom:18px} .ck-r{font-size:36px;padding:20px 0;border-top:1px solid rgba(0,0,0,.1);display:flex;gap:22px;align-items:center}
.ck-r span{width:46px;height:46px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:28px;color:#fff;flex:none}
.ck-r .y{background:#4E8C5A} .ck-r .n{background:#B80000} .ck-r em{color:#999;font-style:normal;font-size:28px}
.cmt{display:flex;gap:22px;align-items:center;background:#fff;color:#111;border-radius:22px;padding:26px 30px;text-align:left;width:620px;box-shadow:0 16px 40px rgba(0,0,0,.25)}
.cmt.flat{box-shadow:none;width:auto;padding:0}
.cmt .av{width:70px;height:70px;border-radius:50%;background:linear-gradient(135deg,#F86659,#7B3AEC);flex:none}
.cmt b{font-size:24px;color:#555} .cmt p{margin:4px 0 0;font-size:44px;font-weight:700} .cmt .heart{margin-left:auto;font-size:36px;color:#999}
"""


# ---------- Front page in the website's colours and type (trackmyvisibility.com, read 2026-11-04) ----------
# Site: red #B80000, yellow #F1C557, purple #763EB8 (+ #9D60E9 stripes), black #000000, text #222222,
# page #FBFAFB, lavender #F4EFFF, green #00810C; hero mesh image (assets/tmv-site-bg.png);
# button gradient 254deg #7C3AED 20% -> #FF6A3D. Font Helvetica Neue -> TeX Gyre Heros (free clone).

FD = ROOT / "assets" / "fonts"
HEROS = "".join(f"@font-face{{font-family:'{fam}';src:url('{(FD / f).as_uri()}');font-weight:{w};font-style:{st}}}"
                for fam, f, w, st in [("Heros", "TeXGyreHeros-Regular.otf", 400, "normal"), ("Heros", "TeXGyreHeros-Italic.otf", 400, "italic"),
                                      ("Heros", "TeXGyreHeros-Bold.otf", 700, "normal"), ("Heros", "TeXGyreHeros-BoldItalic.otf", 700, "italic"),
                                      ("HerosCn", "TeXGyreHerosCondensed-Bold.otf", 700, "normal")])

# Helvetica Neue from the site (assets/fonts/HelveticaNeue*.woff2, git-ignored: licensed). It has no italic,
# so emphasis is weight and colour: Bold headlines tracked tight, Medium for the lines under them, Roman body.
HN_CSS = "".join(f"@font-face{{font-family:HN;src:url('{(FD / f).as_uri()}');font-weight:{w}}}"
                 for f, w in [("HelveticaNeueRoman.woff2", 400), ("HelveticaNeue-Medium.woff2", 500), ("HelveticaNeue-Bold.woff2", 700)]) + """
.s,.s *,.aim,.ticker,.cmt,.check,.tag,.aipill{font-family:HN,Helvetica,Arial,sans-serif!important}
h1{font-weight:700;letter-spacing:-.045em;line-height:.98;text-transform:none!important}
.n1 h1{font-size:126px!important} .n2 h1{font-size:92px!important} .n3 h1{font-size:104px!important}
.n4 h1{font-size:108px!important} .n5 h1{font-size:84px!important} .n6 h1{font-size:104px!important} .n7 h1{font-size:134px!important}
.box{padding:0 .1em .04em!important;margin:.03em 0;line-height:1.02!important}
.k{font-style:normal;font-weight:500;font-size:36px!important;letter-spacing:-.01em;margin-bottom:18px!important}
.sub{font-style:normal;font-weight:500;font-size:46px!important;line-height:1.14;letter-spacing:-.025em}
.body{font-weight:400;font-size:36px;line-height:1.35;letter-spacing:-.01em} .body b{font-weight:500}
.src{letter-spacing:0} .tag,.aipill b{font-weight:500;letter-spacing:-.01em}
.ticker .tk-price{letter-spacing:-.05em} .ticker .tk-chg,.cmt p{font-weight:700;letter-spacing:-.02em}
/* TMV DESIGN.md (designmd.me/s/trackmyvisibility-drk69): ink #000 headings, charcoal #1E1E1E body, #666 captions,
   white cards 18px radius + #ECECF2 border + rgba(80,60,200,.08) shadow, hairline #E5E5E5, shadows <= .2, media stays sharp */
.paper .body{color:#1E1E1E} .paper .src{color:#666;opacity:1} .ink .src,.red .src{opacity:.6}
.ticker,.check,.aim,.cmt{border-radius:18px!important;border:1px solid #ECECF2;box-shadow:0 12px 32px rgba(80,60,200,.08)!important}
.ink .ticker,.ink .check,.ink .aim{border-color:transparent;box-shadow:none!important}
.red .cmt{border-color:transparent;box-shadow:0 12px 32px rgba(0,0,0,.18)!important}
.aipill{border-color:#E5E5E5!important;box-shadow:0 12px 32px rgba(80,60,200,.10)!important}
.ck-r,.aim-tabs{border-color:#E5E5E5!important} .aim-bar{border-color:#E5E5E5!important}
.red .body b{background:#F1C557;color:#222!important;font-weight:700;padding:.02em .4em .06em;border-radius:9999px;text-shadow:none}
.n2 .mid>div[style*="rotate"]{box-shadow:0 20px 40px rgba(0,0,0,.2)!important}
"""

SITE = {
    # red: site red on white, black slides, yellow accents on black, the site's hero mesh on the CTA
    "site-red": dict(paper="#FBFAFB", dark="#000000", acc_dark="#F1C557", box="#B80000", box_ink="#FFFFFF",
                     bar="#B80000", cta="url('{bg}') center/cover", line="#B80000"),
    # violet: the site's button gradient as the accent
    "site-violet": dict(paper="#FBFAFB", dark="#000000", acc_dark="#FF6A3D", box="linear-gradient(254deg,#7C3AED 20%,#FF6A3D 100%)",
                        box_ink="#FFFFFF", bar="linear-gradient(180deg,#FF6A3D,#7C3AED)",
                        cta="linear-gradient(200deg,#7C3AED 20%,#FF6A3D 100%)", line="#B80000"),
    # violet colours with the first front-page fonts (Anton, Fraunces / Instrument Serif italics, Inter)
    "site-violet-fonts": dict(paper="#FBFAFB", dark="#000000", acc_dark="#FF6A3D", box="linear-gradient(254deg,#7C3AED 20%,#FF6A3D 100%)",
                              box_ink="#FFFFFF", bar="linear-gradient(180deg,#FF6A3D,#7C3AED)",
                              cta="linear-gradient(200deg,#7C3AED 20%,#FF6A3D 100%)", line="#B80000", fonts="orig"),
    # violet colours in the site's own Helvetica Neue (Roman / Medium / Bold web fonts)
    "site-violet-hn": dict(paper="#FBFAFB", dark="#000000", acc_dark="#FF6A3D", box="linear-gradient(100deg,#FF6A3D 0%,#7C3AED 80%)",
                           box_ink="#FFFFFF", bar="linear-gradient(180deg,#FF6A3D,#7C3AED)",
                           cta="linear-gradient(200deg,#7C3AED 20%,#FF6A3D 100%)", line="#7C3AED", fonts="hn"),
    # more gradients, same type and rules as site-violet-hn. Colours: TMV DESIGN.md accents (#763EB8 purple, #D97757 coral,
    # #BE88FF lavender, #03003E navy, #002942 teal) and the "ChatGPT Shopping" promo (sampled: #3A7AF6, #8176F7, #58AEF9, #7AD5FE, #CCF0F7)
    "grad-blue": dict(paper="#FBFAFB", dark="#000000", acc_dark="#58AEF9", line="#B80000", fonts="hn",
                      box="linear-gradient(100deg,#58AEF9 0%,#3A7AF6 50%,#8176F7 100%)", box_ink="#FFFFFF",
                      bar="linear-gradient(180deg,#8176F7,#58AEF9)",
                      cta="radial-gradient(70% 45% at 90% 0%,#8176F7 0%,transparent 70%),radial-gradient(60% 50% at 0% 25%,#7AD5FE 0%,transparent 70%),"
                          "linear-gradient(180deg,#3A7AF6 0%,#41A6F8 45%,#96D7F8 80%,#CCF0F7 100%)",
                      cta_css=".red .body{text-shadow:0 1px 12px rgba(10,50,140,.35)}"),
    "grad-sunset": dict(paper="#FBFAFB", dark="#000000", acc_dark="#D97757", line="#B80000", fonts="hn",
                        box="linear-gradient(100deg,#B80000 0%,#D97757 45%,#763EB8 100%)", box_ink="#FFFFFF",
                        bar="linear-gradient(180deg,#D97757,#763EB8)",
                        cta="radial-gradient(60% 40% at 100% 100%,#BE88FF 0%,transparent 70%),linear-gradient(165deg,#B80000 0%,#D97757 35%,#763EB8 75%,#5A2A9A 100%)"),
    # two backgrounds only (Ajay, 2026-11-04): white, and the sunset gradient where the dark slides were.
    # Coral and yellow both blend into the gradient, so there the accent is a white box with brand-colour text (grad_acc).
    "grad-sunset-2bg": dict(paper="#FBFAFB", acc_dark="#FFFFFF", grad_acc="#000000", grad_bg="#F1C557", line="#B80000", fonts="hn",
                            dark="radial-gradient(60% 40% at 100% 100%,#BE88FF 0%,transparent 70%),linear-gradient(165deg,#B80000 0%,#D97757 35%,#763EB8 75%,#5A2A9A 100%)",
                            box="linear-gradient(100deg,#B80000 0%,#D97757 45%,#763EB8 100%)", box_ink="#FFFFFF",
                            bar="linear-gradient(180deg,#D97757,#763EB8)",
                            cta="radial-gradient(60% 40% at 100% 100%,#BE88FF 0%,transparent 70%),linear-gradient(165deg,#B80000 0%,#D97757 35%,#763EB8 75%,#5A2A9A 100%)"),
    "grad-blue-2bg": dict(paper="#FBFAFB", acc_dark="#FFFFFF", grad_acc="#3A7AF6", line="#B80000", fonts="hn",
                          # grad-blue's CTA fades to #CCF0F7 at the bottom, too light under white text: kept to the deeper blues
                          dark="radial-gradient(70% 45% at 90% 0%,#8176F7 0%,transparent 70%),radial-gradient(60% 50% at 0% 25%,#58AEF9 0%,transparent 70%),"
                               "linear-gradient(170deg,#3A7AF6 0%,#4C8DF7 50%,#6E6CF2 100%)",
                          box="linear-gradient(100deg,#58AEF9 0%,#3A7AF6 50%,#8176F7 100%)", box_ink="#FFFFFF",
                          bar="linear-gradient(180deg,#8176F7,#58AEF9)",
                          cta="radial-gradient(70% 45% at 90% 0%,#8176F7 0%,transparent 70%),radial-gradient(60% 50% at 0% 25%,#58AEF9 0%,transparent 70%),"
                              "linear-gradient(170deg,#3A7AF6 0%,#4C8DF7 50%,#6E6CF2 100%)"),
    # Social picks from gradients/ (2026-11-04), same two-background rule as grad-sunset-2bg: the gradient is a real image
    "grad-night-2bg": dict(paper="#FBFAFB", acc_dark="#FFFFFF", grad_acc="#4A12E8", line="#B80000", fonts="hn", bg_img="bg-night.jpg",
                           box="linear-gradient(100deg,#3A0FE6 0%,#9B3BEA 100%)", box_ink="#FFFFFF", bar="linear-gradient(180deg,#9B3BEA,#3A0FE6)"),
    "grad-sky-2bg": dict(paper="#FBFAFB", acc_dark="#FFFFFF", grad_acc="#2F6BF0", line="#B80000", fonts="hn", bg_img="bg-sky.jpg",
                         box="linear-gradient(100deg,#58AEF9 0%,#3A7AF6 60%,#8176F7 100%)", box_ink="#FFFFFF", bar="linear-gradient(180deg,#8176F7,#58AEF9)",
                         cta_css=".ink h1,.red h1,.ink .body,.red .body{text-shadow:0 1px 14px rgba(10,40,120,.28)}"),
    # replaces grad-sky-2bg in the set (Ajay: one blue is enough). gradients/Screenshot_5.png, pink -> coral -> peach.
    # A light gradient, so text goes dark (DESIGN.md: dark on light) and the highlight is a black box with white text.
    "grad-peach-2bg": dict(paper="#FBFAFB", acc_dark="#000000", grad_acc="#FFFFFF", grad_bg="#000000", line="#B80000", fonts="hn",
                           bg_img="bg-peach.jpg", light=True,
                           box="linear-gradient(100deg,#F79283 0%,#FAADCF 100%)", box_ink="#000000", bar="linear-gradient(180deg,#F79283,#FCC3FD)",
                           cta_css=".ink,.red,.ink .src,.red .src{color:#111!important} .ink .k,.red .k{color:#111!important;opacity:1!important}"
                                   " .ink .body b{color:#111!important;text-decoration-color:#111}"
                                   " .ink .ticker,.ink .check,.ink .aim{box-shadow:0 12px 32px rgba(120,40,60,.10)!important}"),
    # second thought on peach: gradients/gradients.png turned 180 deg, deep indigo #16047C behind the headlines, lavender #D9CBF8
    # below (DESIGN.md accents navy #03003E / lavender #BE88FF). Gold highlight as in sunset; source line + arrow go indigo on the lavender.
    "grad-indigo-2bg": dict(paper="#FBFAFB", acc_dark="#FFFFFF", grad_acc="#000000", grad_bg="#F1C557", line="#B80000", fonts="hn",
                            bg_img="bg-indigo.jpg",
                            box="linear-gradient(100deg,#16047C 0%,#3527B5 100%)", box_ink="#FFFFFF", bar="linear-gradient(180deg,#3527B5,#16047C)",
                            cta_css=".ink .src,.red .src,.ink .swipe,.red .swipe{color:#16047C!important;opacity:.8!important}"
                                    " .ink .ticker,.ink .check,.ink .aim{box-shadow:0 12px 32px rgba(22,4,124,.18)!important}"),
    # Ajay's pick for the third option (replaces peach): gradients/Screenshot_1.png, left 4:5 crop. Light yellow / cyan on top
    # (black text, black highlight box, red logo), blue + purple at the bottom (source line and arrow white, with the shadow rule).
    "grad-prism-2bg": dict(paper="#FBFAFB", acc_dark="#000000", grad_acc="#FFFFFF", grad_bg="#000000", line="#B80000", fonts="hn",
                           bg_img="bg-prism.jpg", light=True,
                           box="linear-gradient(100deg,#3570EE 0%,#8B6CF2 100%)", box_ink="#FFFFFF", bar="linear-gradient(180deg,#8B6CF2,#3570EE)",
                           cta_css=".ink,.red{color:#111!important} .ink .k,.red .k{color:#111!important;opacity:1!important}"
                                   " .ink .body b{color:#111!important;text-decoration-color:#111}"
                                   " .ink .src,.red .src,.ink .swipe,.red .swipe{color:#fff!important;opacity:1!important;text-shadow:0 1px 6px rgba(20,20,90,.45)}"
                                   " .ink .ticker,.ink .check,.ink .aim{box-shadow:0 12px 32px rgba(30,40,120,.14)!important}"),
    "grad-midnight": dict(paper="#FBFAFB", dark="#03003E", acc_dark="#BE88FF", line="#763EB8", fonts="hn",
                          box="linear-gradient(100deg,#763EB8 0%,#BE88FF 100%)", box_ink="#FFFFFF",
                          bar="linear-gradient(180deg,#BE88FF,#763EB8)",
                          cta="radial-gradient(70% 50% at 100% 0%,#BE88FF 0%,transparent 70%),radial-gradient(60% 45% at 0% 100%,#D97757 0%,transparent 70%),"
                              "linear-gradient(180deg,#763EB8 0%,#03003E 100%)"),
    # purple: lavender pages, purple slides with yellow, the site's pixel-stripe CTA band
    "site-purple": dict(paper="#F4EFFF", dark="#763EB8", acc_dark="#F1C557", box="#763EB8", box_ink="#FFFFFF",
                        bar="#763EB8", cta="#763EB8", line="#763EB8", stripes=True),
}

SWAP = {"#161616": "#000000", "#FBF8F7": "#FFFFFF", "#FFD34D": "#F1C557", "#4E8C5A": "#00810C", "#F86659": "{acc_dark}"}


def site_css(v):
    c = SITE[v]
    if c.get("bg_img"):  # a real gradient image for both the dark slides and the CTA
        c = {**c, "dark": f"url('{asset(c['bg_img'])}') center/cover", "cta": f"url('{asset(c['bg_img'])}') center/cover"}
    css = CSS_FRONT
    for a, b in SWAP.items(): css = css.replace(a, b.format(**c))
    stripes = ""
    if c.get("stripes"):
        stripes = (f".red::after{{content:'';position:absolute;right:0;bottom:0;width:640px;height:490px;"
                   f"background:url('{asset('tmv-site-stripes.png')}') right bottom/auto 100% no-repeat}}"
                   ".red .mid{z-index:1}")
    heros = c.get("fonts") not in ("orig", "hn")
    fonts = (""".s,.aim,.ticker,.cmt,.check,.tag,.aipill,.body{font-family:Heros,Arial,sans-serif}
h1{font-family:HerosCn,Heros,sans-serif;font-weight:700;letter-spacing:-.01em;line-height:1.0}
.k,.sub{font-family:Heros;font-style:italic;font-weight:700;letter-spacing:-.01em} .k{font-size:46px} .sub{font-size:50px;line-height:1.15}
""" if heros else "")
    red_h1 = ".red h1{font-size:118px!important}" if heros else ""
    if c.get("fonts") == "hn": fonts, red_h1 = HN_CSS, c.get("cta_css", "")
    grad = ""
    if c.get("grad_acc"):  # gradient slides: accent = white box + brand-colour text; kicker and body accents in white
        gbg = c.get("grad_bg", "#fff")
        grad = (f".ink .acc,.red .acc{{background:{gbg};color:{c['grad_acc']};padding:0 12px;-webkit-box-decoration-break:clone;box-decoration-break:clone}}"
                ".ink .k,.red .k{color:#fff;opacity:.9} .ink .body b{color:#fff;text-decoration:underline;text-decoration-thickness:3px;text-underline-offset:7px}"
                ".ink h1{line-height:1.13!important}"  # the box's background is taller than a 1.0 line: room so it doesn't clip the line above
                f".red h1 .box{{background:{gbg}!important;color:{c['grad_acc']}!important}} .red .body b{{background:{gbg}!important;color:{c['grad_acc']}!important}}")
    return HEROS + css + f"""
{fonts}.paper{{background:{c['paper']};color:#000}} .ink{{background:{c['dark']};color:#fff}} .red{{background:{c['cta'].format(bg=asset('tmv-site-bg.png'))};color:#fff}}
.k,.acc,.body b{{color:#B80000}} .ink .k,.ink .acc,.ink .body b{{color:{c['acc_dark']}}}
.paper .k,.paper .acc,.paper .body b,.paper .sub{{color:{c['line']}}}
.box{{background:{c['box']};color:{c['box_ink']};padding:0 16px}}
.ticker .b2 i{{background:{c['bar']}}} .ticker .tk-chg{{color:#B80000}}
.check{{background:#fff}} .ck-r .n{{background:#B80000}}
.cmt .av{{background:url('{asset('tmv-site-bg.png')}') center/cover}}
.tag{{background:#000}}
{red_h1}
{stripes}
{grad}"""


def site_slide(v):
    c = SITE[v]
    def fn(i, s):
        h = front(i, s).replace('<div class="s ', f'<div class="s n{i + 1} ', 1)
        if c.get("light"): h = h.replace("tmv-white.png", "tmv-red.png")
        for a, b in SWAP.items(): h = h.replace(a, b.format(**c))
        h = h.replace('stroke="#B80000"', f'stroke="{c["line"]}"')
        if v == "site-purple": h = h.replace("tmv-white.png", "tmv-white.png")
        return h
    return fn


STYLES = {"front": (CSS_FRONT, front), "proof": (CSS_PROOF, proof), "collage": (CSS_COLLAGE.replace("NOISE", NOISE), collage)}
SITE_STYLES = {v: (site_css(v), site_slide(v)) for v in SITE}

SLIDES = [
    {"src": f"Sources: {SRC['letter']} · {SRC['sej']}<br>{SRC['photo']}"},
    {"src": f"Source: {SRC['letter']}"},
    {"src": f"Source: {SRC['sej']}<br>{SRC['photo']}"},
    {"src": f"Source: {SRC['gm']}"},
    {"src": f"Quote: {SRC['sej']} · Search page drawn by TMV to show the idea"},
    {},
    {},
]


def font_css():
    """Google Fonts cached on disk: headless Chrome screenshots before a network font arrives (falls back to Times)."""
    cache = HERE / "_work" / "fonts"; css_path = cache / "fonts.css"
    if css_path.exists(): return css_path.read_text(encoding="utf-8")
    cache.mkdir(parents=True, exist_ok=True)
    ua = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"}
    css = urllib.request.urlopen(urllib.request.Request(FONTS, headers=ua)).read().decode()
    for i, url in enumerate(sorted(set(re.findall(r"url\((https://[^)]+)\)", css)))):
        f = cache / f"f{i}.woff2"; f.write_bytes(urllib.request.urlopen(url).read()); css = css.replace(url, f.as_uri())
    css_path.write_text(css, encoding="utf-8"); return css


def page(css, body):
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{font_css()}</style>
<style>{CSS_PARTS}{css}</style></head><body>{body}</body></html>"""


def shoot(html: str, out: Path, w=1080, h=1350):
    tmp = HERE / "_work" / (out.stem + "-" + out.parent.name + ".html")
    tmp.write_text(html, encoding="utf-8")
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files",
                    f"--window-size={w},{h}", f"--screenshot={out}", "--virtual-time-budget=6000", tmp.as_uri()],
                   check=True, capture_output=True)


def build(name):
    css, fn = {**STYLES, **SITE_STYLES}[name]
    d = HERE / name; d.mkdir(exist_ok=True)
    pngs = []
    for i, s in enumerate(SLIDES):
        out = d / f"{i + 1:02d}.png"; shoot(page(css, fn(i, s)), out); pngs.append(out)
    ims = [Image.open(p).convert("RGB") for p in pngs]
    ims[0].save(d / "carousel.pdf", save_all=True, append_images=ims[1:], resolution=72)
    print(name, len(pngs), "slides")


def contact():
    W = 270; H = int(W * 1350 / 1080); names = list(STYLES)
    sheet = Image.new("RGB", (W * N + 8 * (N + 1), (H + 8) * len(names) + 8), (40, 40, 40))
    for r, n in enumerate(names):
        for c in range(N):
            im = Image.open(HERE / n / f"{c + 1:02d}.png").convert("RGB").resize((W, H))
            sheet.paste(im, (8 + c * (W + 8), 8 + r * (H + 8)))
    sheet.save(HERE / "contact.png")


FONT_SETS = [
    ("1 · Front page", "Anton", "Instrument Serif", "Inter", "Reddit lost 1M+ search visits a week.", "And its CEO blames AI Mode."),
    ("2 · Proof desk", "Instrument Serif", "Instrument Serif", "Inter", "Reddit lost 1M+ search visits a week.", "And its CEO blames AI Mode."),
    ("3 · Cut & paste", "DM Serif Display", "Caveat", "Inter", "Reddit lost 1M+ search visits a week.", "and its CEO blames AI Mode"),
    ("4 · Grotesk + serif italic", "Bricolage Grotesque", "Instrument Serif", "Inter", "Reddit lost 1M+ search visits a week.", "And its CEO blames AI Mode."),
    ("5 · Soft serif + grotesk", "Fraunces", "Fraunces", "Space Grotesk", "Reddit lost 1M+ search visits a week.", "And its CEO blames AI Mode."),
    ("6 · Serif + marker", "Instrument Serif", "Permanent Marker", "Inter", "Reddit lost 1M+ search visits a week.", "AND ITS CEO BLAMES AI MODE."),
]


def fonts():
    cells = ""
    for label, head, acc, body, h, a in FONT_SETS:
        hw = "800" if head == "Bricolage Grotesque" else ("600" if head == "Fraunces" else "400")
        ai = "italic" if acc in ("Instrument Serif", "Fraunces") else "normal"
        hs = "68px" if head != "Anton" else "64px"
        cells += f"""<div class="c"><div class="l">{label}</div>
          <div style="font-family:'{head}';font-weight:{hw};font-size:{hs};line-height:1.02;letter-spacing:{'-.02em' if head == 'Bricolage Grotesque' else '0'}">{h}</div>
          <div style="font-family:'{acc}';font-style:{ai};font-size:44px;color:#B80000;margin-top:14px;font-weight:{'700' if acc == 'Caveat' else '400'}">{a}</div>
          <div style="font-family:'{body}';font-size:24px;color:#555;margin-top:18px">Body: {body}. Headline: {head}. Accent: {acc}{' italic' if ai == 'italic' else ''}.</div></div>"""
    html = f"""<!doctype html><html><head><meta charset="utf-8"><style>{font_css()}</style><style>
      body{{margin:0;background:#F4F2EE;font-family:Inter}} .g{{display:grid;grid-template-columns:1fr 1fr;gap:28px;padding:50px}}
      .c{{background:#fff;border-radius:20px;padding:40px 44px;min-height:330px}} .l{{font-size:20px;color:#999;margin-bottom:18px}}</style></head>
      <body><div class="g">{cells}</div></body></html>"""
    shoot(html, HERE / "fonts.png", 1600, 1480)


if __name__ == "__main__":
    (HERE / "_work").mkdir(exist_ok=True)
    prep()
    names = sys.argv[1:] or list(STYLES)
    for n in names: build(n)
    if len(names) == len(STYLES): contact(); fonts()
