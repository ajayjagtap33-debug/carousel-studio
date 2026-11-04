"""Reference frames for the Refluke b-roll library — HTML build.

  python3 scripts/refluke_frames.py              # all -> assets/refluke-broll/preview/
  python3 scripts/refluke_frames.py bars spine   # just these

THEME: adopted wholesale from the reference video (Nick Saraev, "How to Use AI Like A Top
0.1% CEO"). Colours were sampled from the frames, not guessed — see videos/reference/
2026-10-14-nick-saraev-ceo-ai/teardown.md. Type is the closest Google Fonts match to his:
Playfair Display (display) + DM Sans (UI). Ajay's call 2026-10-25: copy it, don't adapt it.

Note this reverses two earlier rules: his look DOES use soft card shadows and DOES use
all-caps letterspaced eyebrows. Both are kept here because they are load-bearing in his
layouts. EYEBROWS = False turns the eyebrows off globally if that call changes.
"""
import subprocess, sys, os, shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets/refluke-broll/preview"
W, H = 1920, 1080
EYEBROWS = True

T = dict(
    page="#FAFCFA", card="#FFFFFF", panel="#F9F9F6", ghost="#EDE9E2",
    accent="#536837", deep="#3B482E", success="#2ADD5E",
    ink="#0C0F0F", body="#65676B", mute="#7B7B7E", line="#ECECE8",
)

PLACEMENTS = {
    "tab-right":   "right:92px; top:50%; transform:translateY(-50%); width:300px; height:420px;",
    "half-right":  "right:0; top:0; width:940px; height:1080px;",
    "half-left":   "left:0; top:0; width:940px; height:1080px;",
    "corner":      "left:92px; bottom:92px; width:330px; height:460px;",
    "side-points": "left:0; top:0; width:1160px; height:1080px;",
    "band":        "left:0; top:0; width:1920px; height:740px;",
    "full":        "",
}

CSS = """
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..700;1,400..600&family=DM+Sans:ital,opsz,wght@0,9..40,400..700;1,9..40,400&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:%(W)spx;height:%(H)spx;overflow:hidden}
body{font-family:'DM Sans',sans-serif;color:%(body)s;background:%(bg)s;
  -webkit-font-smoothing:antialiased}
.pg{position:relative;width:%(W)spx;height:%(H)spx}
.ser{font-family:'Playfair Display',serif;font-weight:400;color:%(ink)s;letter-spacing:-.005em}
.eb{font-size:21px;letter-spacing:.18em;text-transform:uppercase;color:%(mute)s;font-weight:500}
.card{background:%(card)s;border-radius:16px;
  box-shadow:0 1px 2px rgba(20,24,20,.05), 0 10px 30px rgba(20,24,20,.045)}
.pill{display:inline-block;background:%(ink)s;color:#fff;border-radius:999px;
  padding:11px 22px;font-size:25px;font-weight:500}
.gpill{display:inline-block;background:%(accent)s;color:#fff;border-radius:999px;
  padding:8px 20px;font-size:24px;font-weight:500}
.chip{display:inline-flex;align-items:center;gap:10px;background:%(card)s;border-radius:999px;
  padding:12px 22px;font-size:25px;color:%(ink)s;
  box-shadow:0 1px 2px rgba(20,24,20,.05), 0 6px 18px rgba(20,24,20,.05)}
.tick{width:38px;height:38px;border-radius:50%%;background:%(success)s;display:flex;
  align-items:center;justify-content:center;flex-shrink:0}
.tick svg{width:21px;height:21px}
.facezone{position:absolute;border:2px dashed #C9CCC6;border-radius:12px;
  display:flex;align-items:flex-end;justify-content:center;padding-bottom:10px}
.facezone span{font-size:19px;color:#AFB3AC;letter-spacing:.1em}
.pad{position:absolute;left:104px;top:50%%;transform:translateY(-50%%)}
.srcbar{display:flex;align-items:center;gap:12px;font-size:20px;color:%(mute)s}
.dot{width:9px;height:9px;border-radius:50%%;background:%(accent)s;flex-shrink:0}
"""


def page(body, placement, surface):
    bg = T["page"] if surface == "paper" else "#2B2E2B"
    zone = PLACEMENTS.get(placement, "")
    face = ""
    if zone and surface == "paper":
        face = f'<div class="facezone" style="{zone}"><span>face</span></div>'
    return (f'<!doctype html><html><head><meta charset="utf-8"><style>'
            f'{CSS % dict(W=W, H=H, bg=bg, **T)}</style></head>'
            f'<body><div class="pg">{face}{body}</div></body></html>')


# ------------------------------------------------------------------ components
def eyebrow(t):
    return f'<div class="eb">{t}</div>' if EYEBROWS and t else ""


def ser(t, size=78, lh=1.1, w=1180, align="left"):
    return (f'<div class="ser" style="font-size:{size}px;line-height:{lh};max-width:{w}px;'
            f'text-align:{align}">{t}</div>')


def check():
    return ('<div class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" '
            'stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">'
            '<polyline points="4,12.5 9.5,18 20,6.5"/></svg></div>')


def listrow(txt, state, icon=True):
    """state: done | active | ghost"""
    ic = (f'<div style="width:30px;height:30px;border-radius:7px;background:{T["ghost"]};'
          f'flex-shrink:0;opacity:.75"></div>') if icon else ""
    if state == "ghost":
        return (f'<div style="display:flex;align-items:center;gap:20px;padding:19px 24px">'
                f'{ic}<div style="height:19px;width:{min(560, 15 + len(txt) * 11)}px;'
                f'background:{T["ghost"]};border-radius:5px;filter:blur(2.5px)"></div></div>')
    if state == "active":
        return (f'<div style="display:flex;align-items:center;gap:20px;padding:19px 24px;'
                f'background:{T["accent"]};border-radius:12px;margin:3px 0">'
                f'{ic.replace(T["ghost"], "rgba(255,255,255,.22)")}'
                f'<div style="font-size:33px;color:#fff;font-weight:500">{txt}</div></div>')
    return (f'<div style="display:flex;align-items:center;gap:20px;padding:19px 24px">'
            f'{ic}<div style="font-size:33px;color:{T["mute"]};flex:1">{txt}</div>{check()}</div>')


def srcbar(t):
    return f'<div class="srcbar"><div class="dot"></div>SOURCE &nbsp;·&nbsp; {t}</div>'


def ghostline(w, h=19, mb=16, blur=0):
    return (f'<div style="height:{h}px;width:{w};background:{T["ghost"]};border-radius:5px;'
            f'margin-bottom:{mb}px;{f"filter:blur({blur}px)" if blur else ""}"></div>')


def bar(label, value, frac, fill, icon=True):
    ic = (f'<div style="width:30px;height:30px;border-radius:7px;background:{T["ghost"]};'
          f'flex-shrink:0"></div>') if icon else ""
    return f"""<div style="margin-bottom:40px">
      <div style="display:flex;align-items:center;gap:18px;margin-bottom:16px">
        {ic}<div style="font-size:32px;color:{T['ink']};flex:1">{label}</div>
        <div class="ser" style="font-size:38px">{value}</div></div>
      <div style="height:26px;background:{T['ghost']};border-radius:999px;overflow:hidden">
        <div style="height:26px;width:{frac}%;background:{fill};border-radius:999px"></div></div>
    </div>"""


def node(txt, kind="light", w=300, pad=32):
    bg, col = {"light": (T["card"], T["ink"]), "dark": (T["ink"], "#fff"),
               "green": (T["accent"], "#fff")}[kind]
    sh = "box-shadow:0 1px 2px rgba(20,24,20,.05), 0 10px 30px rgba(20,24,20,.045);"
    return (f'<div style="width:{w}px;padding:{pad}px;background:{bg};color:{col};'
            f'border-radius:16px;{sh}font-size:30px;line-height:1.25">{txt}</div>')


def arrow(w=84, color=None):
    c = color or T["accent"]
    return (f'<svg width="{w}" height="18" style="flex-shrink:0"><line x1="0" y1="9" x2="{w-11}" '
            f'y2="9" stroke="{c}" stroke-width="2.2"/><polyline points="{w-19},3 {w-9},9 {w-19},15" '
            f'fill="none" stroke="{c}" stroke-width="2.2"/></svg>')


def window(inner, w=1060, h=560, dark=False):
    bg = "#111413" if dark else T["card"]
    return f"""<div style="width:{w}px;height:{h}px;background:{bg};border-radius:16px;
      box-shadow:0 1px 2px rgba(20,24,20,.06), 0 18px 50px rgba(20,24,20,.09);overflow:hidden;
      position:relative">
      <div style="height:46px;background:{'#1A1E1C' if dark else T['panel']};
        border-bottom:1px solid {'#242927' if dark else T['line']};display:flex;align-items:center;
        padding-left:20px;gap:9px">
        <div style="width:11px;height:11px;border-radius:50%;background:{'#333' if dark else '#E2E2DE'}"></div>
        <div style="width:11px;height:11px;border-radius:50%;background:{'#333' if dark else '#E2E2DE'}"></div>
        <div style="width:11px;height:11px;border-radius:50%;background:{'#333' if dark else '#E2E2DE'}"></div>
      </div>{inner}</div>"""


SPECS = []


def spec(id, title, placement, surface, body, note=""):
    SPECS.append(dict(id=id, title=title, placement=placement, surface=surface,
                      body=body, note=note))


# ================================================================== the library
# --- 1. opening / authority --------------------------------------------------
spec("authority", "Authority quotes", "tab-right", "paper", f"""
  <div style="position:absolute;left:104px;top:50%;transform:translateY(-50%);width:1340px;text-align:center">
    {eyebrow('The smartest people on earth')}
    <div style="display:flex;gap:26px;margin-top:40px">
      {''.join(f'''<div style="flex:1">
        <div style="height:210px;background:{T['ghost']};border-radius:12px"></div>
        <div class="ser" style="font-size:26px;font-style:italic;margin-top:18px;line-height:1.3">
          “{q}”</div>
        <div style="font-size:17px;letter-spacing:.14em;text-transform:uppercase;
          color:{T['mute']};margin-top:12px">{n}</div></div>'''
        for q, n in [("I use AI every day", "Jensen Huang"), ("I use it as an operating system", "Sam Altman"),
                     ("a sort of mid-level engineer", "Mark Zuckerberg"), ("better than PhD level", "Elon Musk")])}
    </div>
    <div style="margin-top:34px"><span class="pill">don't use AI like you do</span></div>
    <div style="margin-top:30px;display:flex;justify-content:center">
      {srcbar('CNBC 2026 · Bg2 Pod 2026 · Joe Rogan 2026 · Lex 2026')}</div>
  </div>""", "Opening credibility: four sourced quotes, then the turn as a black pill.")

spec("strike", "Strike compare", "tab-right", "paper", f"""
  <div style="position:absolute;left:104px;top:50%;transform:translateY(-50%);width:1340px;text-align:center">
    {ser('The difference', 62, 1.1, 1340, 'center')}
    <div style="display:flex;gap:70px;justify-content:center;margin-top:70px;position:relative">
      <div style="width:330px;height:280px;border-radius:16px;background:{T['panel']};
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        gap:22px;opacity:.55;position:relative">
        <div style="width:72px;height:72px;border-radius:14px;background:{T['ghost']}"></div>
        <div style="font-size:30px;color:{T['mute']}">A better model</div>
        <svg style="position:absolute;inset:0" width="330" height="280">
          <line x1="22" y1="258" x2="308" y2="22" stroke="{T['accent']}" stroke-width="4"/></svg>
      </div>
      <div class="card" style="width:330px;height:280px;display:flex;flex-direction:column;
        align-items:center;justify-content:center;gap:22px">
        <div style="width:72px;height:72px;border-radius:14px;background:{T['panel']}"></div>
        <div style="font-size:30px;color:{T['ink']}">A different tool</div></div>
    </div></div>""", "'It isn't X, it's Y.' The strike is drawn in the accent, over a dimmed card.")

spec("number", "Hero number", "tab-right", "paper", f"""
  <div style="position:absolute;left:104px;top:50%;transform:translateY(-50%);width:1340px;text-align:center">
    {eyebrow("What I've made with AI")}
    <div style="margin:26px 0 8px"><span class="gpill">over</span></div>
    <div class="ser" style="font-size:168px;line-height:1.05">$10,000,000</div>
  </div>""", "One number, a qualifier pill above it, nothing else on the page.")

# --- 2. the spine ------------------------------------------------------------
spec("spine", "Spine checklist", "tab-right", "paper", f"""
  <div style="position:absolute;left:150px;top:50%;transform:translateY(-50%);width:1140px">
    <div class="card" style="padding:34px 26px">
      <div class="ser" style="font-size:46px;margin:0 20px 22px">Seven simple upgrades</div>
      {listrow('Talk, don&#39;t type', 'done')}
      {listrow('Always-on voice stream', 'done')}
      {listrow('Show, don&#39;t tell', 'done')}
      {listrow('Have AI interview you', 'active')}
      {listrow('Ask for flaws, not opinions', 'ghost')}
      {listrow('Just ask it to do the thing', 'ghost')}
      {listrow('Have an open mind', 'ghost')}
    </div></div>""",
     "The spine. Returns once per item: ticks behind, one active olive bar, blurred ghost rows ahead.")

# --- 3. data -----------------------------------------------------------------
spec("bars", "Paired bars", "tab-right", "paper", f"""
  <div class="pad" style="width:1180px">
    <div class="card" style="padding:52px 56px">
      <div class="ser" style="font-size:50px">Words per minute</div>
      {eyebrow('the average person')}
      <div style="height:48px"></div>
      {bar('Typing', '30–50', 25, T['ghost'].replace(T['ghost'], '#C9CCC2'))}
      {bar('Speaking', '150–200', 92, T['accent'])}
    </div></div>""", "Two quantities where the gap is the argument. Ghost bars first, then they fill.")

spec("trend", "Trend curve", "half-right", "paper", f"""
  <div class="pad" style="width:800px">
    <div class="card" style="padding:46px">
      <div class="ser" style="font-size:44px">Pace of change</div>
      <svg width="690" height="360" style="margin-top:30px">
        <line x1="0" y1="330" x2="690" y2="330" stroke="{T['line']}" stroke-width="1.5"/>
        <path d="M4,312 C120,306 150,280 240,268 S330,236 400,186 S520,120 686,38"
          fill="none" stroke="{T['deep']}" stroke-width="4.5" stroke-linecap="round"/>
        <circle cx="686" cy="38" r="9" fill="{T['deep']}"/></svg>
      <div style="display:flex;gap:16px;margin-top:22px">
        <span class="chip" style="font-size:22px;padding:9px 18px">daily</span>
        <span class="chip" style="font-size:22px;padding:9px 18px">weekly</span></div>
    </div></div>""", "Acceleration. One curve, one dot at the head, hairline baseline only.")

spec("stepchart", "Benchmark steps", "tab-right", "paper", f"""
  <div class="pad" style="width:1180px">
    <div class="card" style="padding:50px 56px">
      <div class="ser" style="font-size:46px">A hard benchmark</div>
      {eyebrow('illustration')}
      <div style="display:flex;align-items:flex-end;gap:44px;margin-top:30px">
        <svg width="780" height="330">
          <line x1="40" y1="300" x2="770" y2="300" stroke="{T['line']}" stroke-width="1.5"/>
          <line x1="40" y1="10" x2="40" y2="300" stroke="{T['line']}" stroke-width="1.5"/>
          <text x="0" y="22" font-size="20" fill="{T['mute']}" font-family="DM Sans">100%</text>
          <text x="6" y="176" font-size="20" fill="{T['mute']}" font-family="DM Sans">50%</text>
          {''.join(f'<rect x="{40 + i*61}" y="{292 - i*26}" width="61" height="5" fill="{T["accent"]}"/>'
                   for i in range(12))}
        </svg>
        <div style="padding-bottom:40px">
          <div style="font-size:26px;color:{T['mute']}">Day 30</div>
          <div class="ser" style="font-size:88px;line-height:1">53%</div></div>
      </div>
      <div style="margin-top:12px"><span class="chip" style="font-size:22px;padding:9px 18px">
        considered impossible</span></div>
    </div></div>""", "A number climbing over time. Labelled ILLUSTRATION because the figures are invented.")

spec("chartrow", "Three chart cards", "band", "paper", f"""
  <div style="position:absolute;left:104px;top:50%;transform:translateY(-50%);display:flex;gap:34px;width:1720px">
    <div class="card" style="flex:1;padding:36px;height:330px">
      <div style="font-size:26px;color:{T['mute']};margin-bottom:26px">Dense reports</div>
      <div style="display:flex;align-items:flex-end;gap:16px;height:180px">
        {''.join(f'<div style="flex:1;height:{h}px;border-radius:6px;background:{T["accent"] if h == 170 else T["ghost"]}"></div>' for h in [60, 110, 80, 170, 100])}
      </div></div>
    <div class="card" style="flex:1;padding:36px;height:330px">
      <div style="font-size:26px;color:{T['mute']};margin-bottom:26px">Analytics</div>
      <svg width="100%" height="180"><path d="M6,160 C70,150 110,120 170,112 S260,70 330,20"
        fill="none" stroke="{T['deep']}" stroke-width="4" stroke-linecap="round"/></svg></div>
    <div class="card" style="flex:1;padding:36px;height:330px">
      <div style="font-size:26px;color:{T['mute']};margin-bottom:26px">Animated explainer</div>
      <div style="height:120px;border-radius:12px;background:{T['panel']};margin-bottom:16px"></div>
      <div style="height:9px;width:62%;border-radius:9px;background:{T['accent']}"></div></div>
  </div>""", "'You could visualise X, or Y, or Z.' Three cards, three different chart types.")

# --- 4. diagrams -------------------------------------------------------------
spec("flow", "Flow", "tab-right", "paper", f"""
  <div style="position:absolute;left:104px;top:50%;transform:translateY(-50%);width:1340px">
    {eyebrow('The craziest version')}
    <div style="display:flex;align-items:center;gap:22px;margin-top:46px">
      {node('<div style="display:flex;gap:9px;margin-bottom:16px">'
            + ''.join(f'<div style="width:40px;height:40px;border-radius:50%;background:{c}"></div>'
                      for c in ['#6E8FD6', '#E2A33F', '#5BB97E'])
            + '</div>Meeting · live', 'dark', 290)}
      {arrow()}
      {node('“We need a landing page for the launch.”', 'light', 310)}
      {arrow()}
      {node('building landing page…<div style="height:10px;background:#2A2F2C;border-radius:9px;'
            'margin-top:18px;overflow:hidden"><div style="width:62%;height:10px;background:'
            + T['success'] + '"></div></div>', 'dark', 300)}
    </div></div>""", "A pipeline end to end. Each node is a different kind of thing, not three of the same.")

spec("loop", "Loop diagram", "tab-right", "paper", f"""
  <div style="position:absolute;left:104px;top:50%;transform:translateY(-50%);width:1340px;text-align:center">
    <div class="ser" style="font-size:92px">RLHF</div>
    {eyebrow('Reinforcement learning through human feedback')}
    <div style="display:flex;align-items:center;justify-content:center;gap:30px;margin-top:60px">
      {node('<div style="width:56px;height:56px;border-radius:12px;background:' + T['panel']
            + ';margin:0 auto 18px"></div>AI model', 'light', 290)}
      <svg width="190" height="130">
        <path d="M8,42 C60,6 130,6 182,42" fill="none" stroke="{T['accent']}" stroke-width="2.4"/>
        <polyline points="174,34 183,43 172,50" fill="none" stroke="{T['accent']}" stroke-width="2.4"/>
        <path d="M182,88 C130,124 60,124 8,88" fill="none" stroke="{T['accent']}" stroke-width="2.4"/>
        <polyline points="16,80 7,89 18,96" fill="none" stroke="{T['accent']}" stroke-width="2.4"/>
      </svg>
      {node('<div style="width:56px;height:56px;border-radius:12px;background:' + T['panel']
            + ';margin:0 auto 18px"></div>Human feedback', 'light', 290)}
    </div></div>""", "Explaining a mechanism. Two nodes, two arrows, a closed loop.")

spec("branch", "Branch", "half-left", "paper", f"""
  <div style="position:absolute;right:110px;top:50%;transform:translateY(-50%);
       display:flex;align-items:center;gap:26px">
    {node('<div style="width:52px;height:52px;border-radius:12px;background:' + T['panel']
          + ';margin-bottom:16px"></div>Try', 'light', 250)}
    <svg width="96" height="270">
      <path d="M0,135 H44 V44 H92" fill="none" stroke="{T['accent']}" stroke-width="2.4"/>
      <polyline points="83,36 93,45 83,53" fill="none" stroke="{T['accent']}" stroke-width="2.4"/>
      <path d="M0,135 H44 V226 H92" fill="none" stroke="{T['accent']}" stroke-width="2.4"/>
      <polyline points="83,218 93,227 83,235" fill="none" stroke="{T['accent']}" stroke-width="2.4"/>
    </svg>
    <div style="display:flex;flex-direction:column;gap:34px">
      {node('Succeed', 'light', 260, 26)}{node('Fail', 'light', 260, 26)}</div>
  </div>""", "One input, two outcomes.")

spec("costcompare", "Cost compare", "tab-right", "paper", f"""
  <div style="position:absolute;left:104px;top:50%;transform:translateY(-50%);width:1340px">
    {eyebrow('This sounds crazy, but')}
    <div style="display:flex;align-items:center;gap:26px;margin-top:50px">
      <div class="card" style="width:330px;padding:40px;text-align:center">
        <div style="width:58px;height:58px;border-radius:13px;background:{T['panel']};
          margin:0 auto 20px"></div>
        <div style="font-size:28px;color:{T['mute']}">Your system</div>
        <div class="ser" style="font-size:64px;margin-top:8px">$1–2</div>
        <div style="font-size:24px;color:{T['mute']}">a day</div></div>
      <div style="text-align:center">
        <div class="gpill" style="margin-bottom:12px">replaces</div>{arrow(120)}</div>
      <div style="width:360px;padding:52px 40px;background:{T['ink']};border-radius:16px;
        text-align:center;color:#fff">
        <div style="width:58px;height:58px;border-radius:13px;background:#232825;
          margin:0 auto 20px"></div>
        <div class="ser" style="font-size:40px;color:#fff">A competent EA</div></div>
    </div></div>""", "Price anchoring. White card = what you get, black card = what it replaces.")

# --- 5. captured -------------------------------------------------------------
spec("cited", "Cited screenshot", "tab-right", "paper", f"""
  <div style="position:absolute;left:104px;top:50%;transform:translateY(-50%);width:1340px">
    <div style="display:flex;justify-content:center;margin-bottom:24px">
      {srcbar('Stanford Report · “three times faster than human typing” · Aug 24, 2016')}</div>
    {window(f'''<div style="padding:46px 56px">
      <div style="font-size:19px;color:{T['mute']};margin-bottom:22px">August 24th, 2016 | 3 min read</div>
      <div class="ser" style="font-size:46px;line-height:1.22;max-width:760px">
        Smartphone speech recognition can write text messages
        <span style="border-bottom:3px solid {T['accent']}">three times faster</span> than human typing</div>
      <div style="margin-top:30px">{ghostline('86%')}{ghostline('92%')}{ghostline('64%')}</div>
    </div>''', 1340, 520)}
  </div>""", "Every outside claim. The source strip sits ABOVE the shot, publication · quote · date.")

spec("pullquote", "Paper + pulled quote", "tab-right", "paper", f"""
  <div style="position:absolute;left:104px;top:50%;transform:translateY(-50%);width:1340px">
    <div style="display:flex;justify-content:center;margin-bottom:22px">
      {srcbar('arXiv · Sharma et al. · Towards Understanding Sycophancy in Language Models · 2023')}</div>
    {window(f'''<div style="padding:30px 40px">{ghostline('40%', 15, 14)}
      <div style="font-size:26px;color:{T['ink']};margin-bottom:16px;font-weight:500">
        Towards Understanding Sycophancy in Language Models</div>
      {ghostline('92%', 13, 11)}{ghostline('88%', 13, 11)}{ghostline('70%', 13, 11)}</div>''', 1340, 300)}
    <div class="card" style="margin-top:-54px;margin-left:90px;width:1160px;padding:40px 46px;
      position:relative;z-index:2">
      <div style="font-size:33px;line-height:1.45;color:{T['ink']}">…human feedback may encourage
        responses that <span style="border-bottom:3px solid {T['accent']}">match user beliefs over
        truthful ones</span>, a behaviour known as sycophancy.</div></div>
  </div>""", "Research backing: the paper, then the sentence that matters, key clause underlined.")

spec("uiframe", "Prompt frame", "tab-right", "paper", f"""
  <div style="position:absolute;left:104px;top:50%;transform:translateY(-50%);width:1340px">
    <div class="card" style="padding:40px 44px">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:26px">
        <div style="width:30px;height:30px;border-radius:8px;background:{T['accent']}"></div>
        <div style="font-size:25px;color:{T['mute']}">Claude</div></div>
      <div style="font-size:34px;line-height:1.45;color:{T['ink']}">“Hey, I want to build something
        that listens to my mic, screenshots my page and listens to system audio<span
        style="color:{T['accent']}">▌</span>”</div>
    </div>
    <div style="display:flex;gap:26px;margin-top:30px">
      {''.join(f'''<div class="card" style="flex:1;padding:30px;text-align:center">
        <div style="width:44px;height:44px;border-radius:11px;background:{T['panel']};
          margin:0 auto 16px"></div>
        <div style="font-size:25px;color:{T['mute']}">{t}</div></div>'''
        for t in ['Your mic', 'Your screen', 'System audio'])}
    </div></div>""", "A rebuild of an interface, not a screenshot. Typewriter cursor in the accent.")

spec("chatpills", "Chat + pill notes", "tab-right", "paper", f"""
  <div style="position:absolute;left:120px;top:50%;transform:translateY(-50%);width:880px">
    <div class="card" style="padding:34px;min-height:430px;position:relative">
      <div style="font-size:24px;color:{T['mute']};margin-bottom:28px">New chat</div>
      {''.join(f'''<div style="display:flex;justify-content:flex-end;margin-bottom:18px">
        <div style="background:{T['panel']};border-radius:14px;padding:18px 24px;font-size:29px;
          color:{T['ink']};max-width:640px">{q}</div></div>'''
        for q in ['What do you think about this?', 'Is this email all right?',
                  'What do you think about my project?'])}
      <div style="position:absolute;left:34px;right:34px;bottom:30px;border-radius:999px;
        background:{T['panel']};padding:18px 26px;font-size:25px;color:{T['mute']};
        display:flex;justify-content:space-between;align-items:center">Message…
        <div style="width:38px;height:38px;border-radius:50%;background:{T['accent']}"></div></div>
    </div>
    <div style="position:absolute;right:-330px;top:60px;display:flex;flex-direction:column;
      gap:18px;align-items:flex-start">
      <span class="pill">you can't just ask</span>
      <span class="pill">always something good</span></div>
  </div>""", "Black pills park OUTSIDE the card and editorialise on what's inside it.")

spec("playerbar", "Self-reference", "tab-right", "paper", f"""
  <div style="position:absolute;left:104px;top:50%;transform:translateY(-50%);width:1340px">
    <div class="card" style="padding:34px 40px;display:flex;align-items:center;gap:26px">
      <svg width="30" height="34" viewBox="0 0 24 24" fill="{T['ink']}"><polygon points="5,3 21,12 5,21"/></svg>
      <div style="flex:1">
        <div style="font-size:23px;color:{T['mute']};margin-bottom:14px">This video</div>
        <div style="height:7px;border-radius:9px;background:{T['ghost']};overflow:hidden">
          <div style="width:72%;height:7px;background:#E33"></div></div></div>
      <div style="font-size:27px;color:{T['mute']}">5:01&nbsp;/&nbsp;7:00</div>
    </div></div>""", "'In the time it takes to watch this.' Self-reference, borrowed YouTube red.")

# --- 6. statements -----------------------------------------------------------
spec("statement", "Serif statement", "tab-right", "paper", f"""
  <div style="position:absolute;left:104px;top:50%;transform:translateY(-50%);width:1340px;
       text-align:center">
    <div style="width:70px;height:70px;border-radius:16px;background:{T['panel']};
      margin:0 auto 34px"></div>
    {ser('<span style="font-style:italic;color:' + T['accent'] + '">Show</span>, not tell.', 104, 1.1, 1340, 'center')}
  </div>""", "The chapter thesis. One line, one italic accent word, nothing else.")

spec("quotelines", "Staggered quotes", "tab-right", "paper", f"""
  <div style="position:absolute;left:104px;top:50%;transform:translateY(-50%);width:1340px">
    {eyebrow('Always say')}
    <div style="margin-top:46px">
      <div class="chip" style="font-size:34px;padding:22px 30px">“What is wrong with my idea?”</div>
      <div style="height:26px"></div>
      <div style="margin-left:240px"><span class="chip" style="font-size:34px;padding:22px 30px">
        “Poke holes in my thoughts.”</span></div>
    </div></div>""", "Scripts to say verbatim. Two lines, staggered, never a bullet list.")

spec("outlinepill", "Outlined statement", "tab-right", "paper", f"""
  <div style="position:absolute;left:104px;top:50%;transform:translateY(-50%);width:1340px;
       text-align:center">
    <div style="display:inline-block;border:2.5px solid {T['accent']};border-radius:18px;
      padding:26px 48px">
      <span class="ser" style="font-size:58px">Same model</span></div>
    <div style="margin-top:28px"><span class="chip">a new way of doing things</span></div>
  </div>""", "A short claim that needs a frame rather than a card.")


# ================================================================== §5 batch
def iconbox(s=56, r=13, bg=None):
    return (f'<div style="width:{s}px;height:{s}px;border-radius:{r}px;'
            f'background:{bg or T["panel"]};flex-shrink:0"></div>')


def avatar(ch, bg, s=44):
    return (f'<div style="width:{s}px;height:{s}px;border-radius:50%;background:{bg};color:#fff;'
            f'display:flex;align-items:center;justify-content:center;font-size:{int(s*.45)}px;'
            f'font-weight:600;flex-shrink:0">{ch}</div>')


def chipcol(items, gap=16):
    return (f'<div style="display:flex;flex-direction:column;gap:{gap}px;align-items:flex-start">'
            + "".join(f'<span class="chip">{iconbox(24, 6)}{t}</span>' for t in items) + '</div>')


spec("icon-card", "Icon card", "corner", "card", f"""
  <div class="card" style="position:absolute;right:150px;top:50%;transform:translateY(-50%);
       width:360px;padding:54px;text-align:center">
    <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="{T['accent']}"
      stroke-width="1.7" stroke-linecap="round"><rect x="9" y="2" width="6" height="11" rx="3"/>
      <path d="M5 11a7 7 0 0 0 14 0M12 18v4"/></svg>
    <div style="font-size:28px;color:{T['mute']};margin-top:22px">Voice dictation</div></div>""",
     "One idea as a single small card. The quietest frame in the set.")

spec("search-bar", "Search bar", "tab-right", "paper", f"""
  <div style="position:absolute;left:104px;top:50%;transform:translateY(-50%);width:1340px">
    <div class="card" style="padding:40px 46px;border-radius:999px;display:flex;
      align-items:center;gap:24px">
      {iconbox(38, 19, T['ghost'])}
      <div style="flex:1;font-size:30px;color:{T['mute']}">free voice dictation tool</div>
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="{T['accent']}"
        stroke-width="1.8"><rect x="9" y="2" width="6" height="11" rx="3"/>
        <path d="M5 11a7 7 0 0 0 14 0"/></svg></div>
    <div style="margin-top:28px;text-align:center">
      <span class="chip">don't believe me? look it up</span></div></div>""",
     "A rebuilt search field. Use when the instruction is literally 'go and search this'.")

spec("terminal", "Terminal", "half-right", "paper", f"""
  <div class="pad" style="width:820px">
    {window(f'''<div style="padding:34px 38px;font-family:ui-monospace,monospace">
      <div style="font-size:27px;color:#9BD6A6">&gt; /skills</div>
      <div style="font-size:25px;color:#5C6560;margin-top:16px">agents · use</div>
      <div style="margin-top:26px">{ghostline('54%', 13, 12)}{ghostline('38%', 13, 12)}</div>
    </div>''', 820, 420, dark=True)}</div>""",
     "A CLI moment. Dark window, one typed line, the rest implied.")

spec("before-after", "Before / after", "tab-right", "paper", f"""
  <div style="position:absolute;left:104px;top:50%;transform:translateY(-50%);width:1340px;
       display:flex;gap:40px;align-items:center">
    <div class="card" style="flex:1;padding:44px;min-height:300px">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:26px">
        {iconbox(30, 8)}<div style="font-size:27px;color:{T['mute']}">Your vocabulary</div></div>
      {ghostline('70%')}{ghostline('52%')}</div>
    <div class="card" style="flex:1;padding:44px;min-height:300px">
      <div class="eb" style="margin-bottom:14px">Before</div>
      <div class="ser" style="font-size:44px">“clawed code”</div>
      <div class="eb" style="margin:28px 0 14px">After</div>
      <div class="ser" style="font-size:44px;color:{T['accent']}">“Claude Code”</div></div>
  </div>""", "A small transformation, stated as two labelled halves.")

spec("company-icons", "Company row", "band", "paper", f"""
  <div style="position:absolute;left:104px;top:50%;transform:translateY(-50%);width:1720px;
       text-align:center">
    {ser("The world's best companies", 64, 1.1, 1720, 'center')}
    <div style="display:flex;justify-content:center;gap:90px;margin-top:60px">
      {''.join(f'''<svg width="76" height="76" viewBox="0 0 24 24" fill="none"
        stroke="{c}" stroke-width="1.5"><path d="M3 21h18M5 21V7l7-4 7 4v14"/>
        <path d="M9 9h2M13 9h2M9 13h2M13 13h2M9 17h2M13 17h2"/></svg>''' for c in
        [T['accent'], T['mute'], T['mute']])}
    </div></div>""", "A category of actor, drawn rather than named.")

_DOCSPECS = "".join(
    f'<div><div style="font-size:19px;color:{T["mute"]};letter-spacing:.12em;'
    f'text-transform:uppercase;margin-bottom:10px">{k}</div>'
    f'<div style="font-size:26px;color:{T["ink"]}">{v}</div></div>'
    for k, v in [("Speed", "Fast"), ("Input", "$4"), ("Output", "$24"),
                 ("Context", "128,000"), ("Modalities", "Text · Audio")])

spec("docs-page", "Docs page", "tab-right", "paper", f"""
  <div style="position:absolute;left:104px;top:50%;transform:translateY(-50%);width:1340px">
    <div style="display:flex;justify-content:center;margin-bottom:22px">
      {srcbar('OpenAI docs · GPT-Realtime-2.1 model page')}</div>
    {window(f'''<div style="padding:34px 40px">
      <div style="display:flex;align-items:center;gap:18px;margin-bottom:28px">
        {iconbox(52, 12, T['ghost'])}
        <div><div style="font-size:28px;color:{T['ink']};font-weight:500">GPT-Realtime-2.1</div>
        <div style="font-size:21px;color:{T['mute']}">Reasoning model with tool use</div></div></div>
      <div style="display:flex;gap:46px">{_DOCSPECS}</div>
      <div style="margin-top:32px">{ghostline('88%')}{ghostline('74%')}</div>
    </div>''', 1340, 420)}</div>""",
     "A product's own documentation as the evidence. Source strip above, as always.")

spec("assistant-listening", "Assistant card", "corner", "card", f"""
  <div class="card" style="position:absolute;right:140px;top:50%;transform:translateY(-50%);
       width:620px;padding:40px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:30px">
      <div style="display:flex;align-items:center;gap:14px">
        {iconbox(30, 8)}<div style="font-size:26px;color:{T['mute']}">AI assistant</div></div>
      <div style="display:flex;align-items:center;gap:10px;font-size:22px;color:{T['accent']}">
        <div style="width:10px;height:10px;border-radius:50%;background:{T['success']}"></div>
        listening</div></div>
    {''.join(f'''<div style="margin-bottom:24px">
      <div style="font-size:21px;color:{T['mute']};margin-bottom:7px">{who}</div>
      <div style="font-size:28px;color:{T['ink']}">{what}</div></div>'''
      for who, what in [('Ashley', "Let's ship the pricing page on Friday."),
                        ('Sam', "I'll send the proposal after this call.")])}
  </div>""", "Something listening in the background, shown as a live card.")

spec("ea-concept", "Concept → output", "tab-right", "paper", f"""
  <div style="position:absolute;left:104px;top:50%;transform:translateY(-50%);width:1340px">
    {eyebrow('Think of this as')}
    <div style="display:flex;align-items:center;gap:30px;margin-top:44px">
      {node('<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="' + T['accent']
            + '" stroke-width="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'
            + '</svg><div style="margin-top:18px">An EA</div>'
            + f'<div style="font-size:23px;color:{T["mute"]}">always with you</div>', 'light', 300)}
      {arrow()}
      <div class="card" style="width:520px;padding:34px">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
          {iconbox(26, 7)}<div style="font-size:24px;color:{T['mute']}">Meeting notes</div></div>
        {ghostline('92%')}{ghostline('80%')}{ghostline('86%')}{ghostline('58%', 19, 0)}</div>
    </div></div>""", "An abstraction on the left, the concrete thing it produces on the right.")

spec("todo-avatars", "To-dos with avatars", "tab-right", "paper", f"""
  <div style="position:absolute;left:104px;top:50%;transform:translateY(-50%);width:1340px;
       display:flex;gap:34px;align-items:flex-start">
    <div class="card" style="flex:1;padding:38px">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:28px">
        {iconbox(28, 7)}<div class="ser" style="font-size:38px">Meeting to-dos</div></div>
      {''.join(f'''<div style="display:flex;align-items:center;gap:20px;padding:18px 0">
        {avatar(a, c)}
        <div style="flex:1"><div style="font-size:26px;color:{T['ink']}">{n}</div>
          <div style="font-size:23px;color:{T['mute']}">{t}</div></div>
        <span style="display:inline-flex;align-items:center;gap:9px;background:{T['panel']};
          border-radius:999px;padding:8px 18px;font-size:21px;color:{T['accent']}">✓ done</span>
      </div>''' for a, c, n, t in [('A', '#6E8FD6', 'Ashley', 'Ship the pricing page'),
                                   ('S', '#E2A33F', 'Sam', 'Send the proposal'),
                                   ('S', '#5BB97E', 'Sarah', "Pull last month's numbers")])}
    </div>
    <div class="card" style="width:300px;padding:34px;text-align:center">
      <div style="display:flex;align-items:center;justify-content:center;gap:10px;font-size:21px;
        color:{T['mute']};margin-bottom:14px">
        <div style="width:9px;height:9px;border-radius:50%;background:#E33"></div>Meeting · live</div>
      <div class="ser" style="font-size:58px">14:33</div></div>
  </div>""", "Work finishing while the meeting is still running. Avatars + done chips + a live timer.")

spec("logo-tiles", "Logo tiles", "tab-right", "paper", f"""
  <div style="position:absolute;left:104px;top:50%;transform:translateY(-50%);width:1340px;
       text-align:center">
    {eyebrow('The simplest way to set this up')}
    {ser('A frontier LLM', 76, 1.1, 1340, 'center')}
    <div style="display:flex;justify-content:center;gap:40px;margin-top:48px">
      {''.join(f'''<div style="text-align:center">
        <div class="card" style="width:130px;height:130px;display:flex;align-items:center;
          justify-content:center">{iconbox(56, 14, T['ghost'])}</div>
        <div style="font-size:24px;color:{T['mute']};margin-top:16px">{n}</div></div>'''
        for n in ['Claude', 'OpenAI'])}
    </div>
    <div style="margin-top:36px"><span class="pill">the best one you can get</span></div>
  </div>""", "Naming the tools. Logo tiles from assets/logos only — never fetched from a search.")

spec("transcript-card", "Transcript → projects", "half-left", "paper", f"""
  <div style="position:absolute;right:100px;top:50%;transform:translateY(-50%);width:820px">
    <div style="margin-bottom:20px"><span style="display:inline-flex;align-items:center;gap:10px;
      background:{T['panel']};border-radius:999px;padding:9px 20px;font-size:22px;
      color:{T['accent']}">✓ transcribed</span></div>
    <div style="display:flex;align-items:center;gap:26px">
      <div style="width:420px;padding:32px;background:{T['ink']};border-radius:16px;color:#fff">
        <div style="font-size:22px;color:#8A918C;margin-bottom:22px">Transcript</div>
        {''.join(f'''<div style="margin-bottom:18px"><div style="font-size:18px;color:#6E756F">{w}</div>
          <div style="font-size:23px">{t}</div></div>'''
          for w, t in [('Ashley', 'Ship the pricing page Friday.'),
                       ('Sam', 'Proposal goes out today.'),
                       ('Sarah', "I'll pull the numbers.")])}</div>
      {arrow()}
      <div style="text-align:center">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="{T['accent']}"
          stroke-width="1.6"><rect x="3" y="8" width="18" height="12" rx="3"/>
          <path d="M12 8V4M8 14h.01M16 14h.01"/></svg>
        <div style="font-size:23px;color:{T['mute']};margin-top:12px">real projects</div></div>
    </div></div>""", "Raw capture on the left turning into something actionable on the right.")

_TOKENWORDS = ("rather than tell the best people always show So they "
               "don’t spend a bunch of time in word tokens okay").split()
_TOKENCHIPS = "".join(
    f'<span style="background:{T["panel"]};border-radius:7px;padding:9px 14px;'
    f'font-size:23px;color:{T["mute"]}">{w}</span>' for w in _TOKENWORDS)

spec("token-chips", "Tokens → picture", "tab-right", "paper", f"""
  <div style="position:absolute;left:104px;top:50%;transform:translateY(-50%);width:1340px;
       display:flex;align-items:center;gap:40px">
    <div class="card" style="width:600px;padding:36px">
      <div class="eb" style="margin-bottom:22px">Word tokens</div>
      <div style="display:flex;flex-wrap:wrap;gap:10px">
        {_TOKENCHIPS}
      </div></div>
    {arrow(100)}
    <div class="card" style="flex:1;padding:50px;text-align:center">
      <svg width="58" height="58" viewBox="0 0 24 24" fill="none" stroke="{T['accent']}"
        stroke-width="1.6"><rect x="3" y="4" width="18" height="16" rx="3"/>
        <circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-6 6"/></svg>
      <div class="eb" style="margin:22px 0 10px">A picture</div>
      <div class="ser" style="font-size:52px">1,000 words</div></div>
  </div>""", "Volume on one side, the punchline card on the other. The arrow does the arguing.")

spec("gallery-chips", "Gallery + stack", "tab-right", "paper", f"""
  <div style="position:absolute;left:104px;top:50%;transform:translateY(-50%);width:1340px">
    <div style="display:flex;justify-content:center;margin-bottom:20px">
      {srcbar('threejs.org · projects built with three.js')}</div>
    <div style="display:flex;gap:34px;align-items:center">
      {window(f'''<div style="padding:14px;display:grid;grid-template-columns:repeat(5,1fr);gap:8px">
        {"".join(f'<div style="aspect-ratio:16/10;border-radius:6px;background:{T["ghost"]};opacity:{.45 + (i % 4) * .18}"></div>' for i in range(15))}
      </div>''', 820, 380)}
      <div style="width:400px;flex-shrink:0">{chipcol(['Three.js', 'HTML', 'Unreal Engine', 'Blender'])}
        <div style="margin-top:26px;text-align:center">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="{T['accent']}"
            stroke-width="1.6"><rect x="3" y="8" width="18" height="12" rx="3"/>
            <path d="M12 8V4M8 14h.01M16 14h.01"/></svg>
          <div class="eb" style="margin-top:10px">Agents build them</div></div></div>
    </div></div>""", "A screenshot plus a stack of chips that arrive one at a time.")

spec("isometric-room", "Isometric space", "tab-right", "paper", f"""
  <div style="position:absolute;left:104px;top:50%;transform:translateY(-50%);width:1340px">
    <div style="text-align:center;margin-bottom:26px">
      <span class="chip">“Hey, create me a 3D visualization of this.”</span></div>
    <div style="display:flex;align-items:center;gap:40px;justify-content:center">
      <svg width="760" height="470" viewBox="0 0 760 470">
        <!-- walls rise from the BACK edges, floor in front of them -->
        <polygon points="60,290 380,120 380,20 60,190" fill="#FBFBF9" stroke="{T['line']}" stroke-width="2"/>
        <polygon points="380,120 700,290 700,190 380,20" fill="#F1F1ED" stroke="{T['line']}" stroke-width="2"/>
        <polygon points="380,120 700,290 380,460 60,290" fill="#F6F6F2" stroke="{T['line']}" stroke-width="2"/>
        <polygon points="470,140 630,225 630,145 470,60" fill="#E7EFE4" stroke="{T['accent']}" stroke-width="2.5"/>
        <polygon points="400,250 560,335 455,390 295,305" fill="#F7F2E3" stroke="none"/>
        <polygon points="165,282 265,336 265,300 165,246" fill="#E0E0D9" stroke="{T['mute']}" stroke-width="1.5"/>
        <polygon points="320,352 395,392 350,416 275,376" fill="#D2D2CA" stroke="{T['mute']}" stroke-width="1.5"/>
      </svg>
      <div>{chipcol(['realistic lighting', 'Google Maps view', 'real furniture'])}</div>
    </div></div>""", "Anything spatial. Drawn in stages: floor, walls, window, light, furniture.")

spec("bottleneck", "Bottleneck", "half-right", "paper", f"""
  <div class="pad" style="width:800px;text-align:center">
    {eyebrow('Bottlenecked')}
    <svg width="260" height="330" style="margin:30px 0 10px">
      <path d="M100,30 L100,90 C100,110 40,150 40,200 L40,300 C40,314 52,322 66,322
               L194,322 C208,322 220,314 220,300 L220,200 C220,150 160,110 160,90 L160,30 Z"
        fill="none" stroke="{T['ink']}" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M96,26 L164,26" stroke="{T['ink']}" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="130" cy="232" r="22" fill="none" stroke="{T['accent']}" stroke-width="3"/>
      <path d="M100 296a30 30 0 0 1 60 0" fill="none" stroke="{T['accent']}" stroke-width="3"/>
    </svg>
    <div style="display:flex;flex-direction:column;gap:14px;align-items:center;margin-top:18px">
      <span class="chip">lack of knowledge</span>
      <span class="chip">lack of explicit verbalization</span></div></div>""",
     "A literal metaphor for an abstract claim with no data behind it.")

spec("funnel", "Funnel", "band", "paper", f"""
  <div style="position:absolute;left:104px;top:50%;transform:translateY(-50%);width:1720px">
    {eyebrow('The ocean')}
    <svg width="1600" height="330" style="margin-top:26px">
      <path d="M40,30 C330,30 470,130 560,152 L1560,152 L1560,196 L560,196
               C470,218 330,318 40,318 Z" fill="#DCEAF2" stroke="#9BC4DA" stroke-width="2.5"/>
      {''.join(f'<circle cx="{x}" cy="{y}" r="11" fill="none" stroke="#6FA6C4" stroke-width="2.5"/>'
               for x, y in [(150, 120), (230, 200), (120, 230), (300, 110), (360, 220), (250, 160)])}
    </svg>
    <div style="margin-top:18px"><span class="chip">piping an ocean through a straw</span></div>
  </div>""", "The one place a second colour is allowed — because the thing itself is water.")

spec("honest-feedback", "Flaws list", "tab-right", "paper", f"""
  <div style="position:absolute;left:150px;top:50%;transform:translateY(-50%);width:1140px">
    <div class="card" style="padding:40px">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:30px">
        {iconbox(28, 7)}<div style="font-size:27px;color:{T['mute']}">Honest feedback on your essay</div></div>
      {''.join(f'''<div style="display:flex;align-items:center;gap:22px;padding:22px 0;
        border-top:1px solid {T['line']}">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="{T['mute']}"
          stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
        <div style="font-size:30px;color:{T['ink']}">{t}</div></div>'''
        for t in ['The opening buries your main point.',
                  'Paragraph two makes a claim with no evidence.',
                  'The close repeats the hook instead of landing it.'])}
    </div>
    <div style="position:absolute;right:-250px;top:40px"><span class="pill">ask for it explicitly</span></div>
  </div>""", "Asking for flaws, not opinions. Crosses rather than ticks — the inverse of the spine.")

spec("youtube-card", "Video card", "tab-right", "paper", f"""
  <div style="position:absolute;left:104px;top:50%;transform:translateY(-50%);width:1340px;
       display:flex;gap:40px;align-items:center">
    <div class="card" style="width:760px;padding:26px">
      <div style="display:flex;gap:20px">
        <div style="flex:1;padding:22px;background:{T['panel']};border-radius:10px">
          <div class="ser" style="font-size:30px;line-height:1.2">How the smartest<br>people use AI</div></div>
        <div style="width:150px;border-radius:10px;background:{T['ink']}"></div></div>
      <div style="height:5px;background:#E33;border-radius:9px;margin:20px 0 18px;width:64%"></div>
      <div style="display:flex;align-items:center;gap:14px">
        {avatar('N', T['accent'], 40)}
        <div style="flex:1"><div style="font-size:23px;color:{T['ink']}">How the Smartest People Use AI</div>
          <div style="font-size:19px;color:{T['mute']}">YouTube</div></div>
        <span style="background:{T['ink']};color:#fff;border-radius:999px;padding:9px 20px;
          font-size:20px">Subscribe</span></div></div>
    <div>{eyebrow('Changing so quickly')}
      <div style="height:20px"></div>
      {chipcol(['New model', 'New feature', 'New harness'])}</div>
  </div>""", "Referring to a video — yours or anyone's. Borrowed YouTube red, used nowhere else.")

spec("laptop-tiles", "Laptop + apps", "tab-right", "paper", f"""
  <div style="position:absolute;left:104px;top:50%;transform:translateY(-50%);width:1340px;
       text-align:center">
    <div style="margin-bottom:26px"><span class="chip">whatever models he's running</span></div>
    <div style="display:inline-block">
      <div style="width:900px;height:460px;background:{T['ink']};border-radius:20px;
        display:flex;align-items:center;justify-content:center;gap:48px">
        {''.join(f'''<div style="text-align:center">
          <div style="width:104px;height:104px;border-radius:24px;background:{c};
            margin:0 auto 18px"></div>
          <div style="font-size:23px;color:#A8AFA9">{n}</div></div>'''
          for n, c in [('Claude Code', '#C96442'), ('Codex', '#F5F5F3'), ('Nemotron', T['success'])])}
      </div>
      <div style="width:1020px;height:16px;background:{T['ghost']};border-radius:0 0 14px 14px;
        margin-left:-60px"></div></div></div>""",
     "What's installed on someone's machine. Tiles land one at a time.")

spec("ceo-row", "People row", "band", "paper", f"""
  <div style="position:absolute;left:104px;top:50%;transform:translateY(-50%);width:1720px;
       text-align:center">
    {eyebrow('Big CEOs')}
    <div style="display:flex;justify-content:center;gap:44px;margin-top:34px">
      {''.join(f'''<div class="card" style="width:270px;padding:34px;position:relative">
        <div style="position:absolute;right:-12px;top:-12px">{check()}</div>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="{T['accent']}"
          stroke-width="1.6"><path d="M3 18l2-11 5 5 2-7 2 7 5-5 2 11z"/></svg>
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="{T['ink']}"
          stroke-width="1.5" style="margin:14px 0"><circle cx="12" cy="8" r="4"/>
          <path d="M4 21a8 8 0 0 1 16 0"/></svg>
        <svg width="46" height="34" viewBox="0 0 24 18" fill="none" stroke="{T['mute']}"
          stroke-width="1.5"><rect x="3" y="2" width="18" height="12" rx="2"/>
          <path d="M1 16h22"/></svg></div>''' for _ in range(3))}
    </div>
    <div class="eb" style="margin-top:30px">Trying things constantly</div>
    <div class="ser" style="font-size:54px;font-style:italic;color:{T['accent']};margin-top:22px">
      First principles</div>
    <div style="margin-top:20px"><span class="chip">“Is this thing possible?”</span></div>
  </div>""", "'Everyone good at this does X.' Ticks land one by one, then the principle underneath.")

spec("screen-share", "Screen share", "half-left", "paper", f"""
  <div style="position:absolute;right:100px;top:50%;transform:translateY(-50%);width:800px">
    <div class="card" style="padding:32px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
        {iconbox(26, 7)}<div style="font-size:24px;color:{T['mute']}">Your screen</div></div>
      <div style="display:flex;gap:26px">
        <div style="width:360px;height:250px;background:{T['ink']};border-radius:12px;
          display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px">
          <div style="width:84px;height:84px;border-radius:50%;background:#6E5BD6"></div>
          <div style="display:flex;align-items:center;gap:9px;font-size:20px;color:#A8AFA9">
            <div style="width:8px;height:8px;border-radius:50%;background:{T['success']}"></div>
            AI coworker</div></div>
        <div style="flex:1;padding-top:14px">
          {ghostline('100%')}{ghostline('82%')}{ghostline('91%')}{ghostline('60%')}</div>
      </div></div></div>""",
     "An agent watching your screen. Purple is used once, for the AI itself.")

spec("seesaw", "Balance", "tab-right", "paper", f"""
  <div style="position:absolute;left:104px;top:50%;transform:translateY(-50%);width:1340px;
       text-align:center">
    <div style="margin-bottom:34px"><span class="chip">you explored the opportunity</span></div>
    <svg width="1000" height="300" style="overflow:visible">
      <line x1="60" y1="96" x2="940" y2="196" stroke="{T['ink']}" stroke-width="6"
        stroke-linecap="round"/>
      <circle cx="500" cy="146" r="11" fill="{T['accent']}"/>
      <path d="M500,152 L420,286 L580,286 Z" fill="none" stroke="{T['deep']}" stroke-width="5"
        stroke-linejoin="round"/>
      <line x1="400" y1="286" x2="600" y2="286" stroke="{T['deep']}" stroke-width="6"
        stroke-linecap="round"/>
    </svg>
    <div style="position:relative;margin-top:-290px;display:flex;justify-content:space-between;
      padding:0 20px">
      <div class="card" style="width:300px;padding:30px">
        <div class="ser" style="font-size:38px">Trying</div>
        <div style="font-size:23px;color:{T['mute']}">a few hours</div></div>
      <div style="width:330px;padding:30px;background:{T['ink']};border-radius:16px;margin-top:120px">
        <div class="ser" style="font-size:38px;color:#fff">Not trying</div>
        <div style="font-size:23px;color:#8A918C">the opportunity cost</div></div></div>
    <div class="eb" style="margin-top:66px">So high these days</div></div>""",
     "A trade-off as a literal balance. White card up, black card down.")

spec("outro-cta", "Outro", "tab-right", "paper", f"""
  <div style="position:absolute;left:104px;top:50%;transform:translateY(-50%);width:1340px;
       text-align:center">
    {eyebrow('Want to learn more?')}
    <div style="height:20px"></div>
    {ser('Use AI like a <span style="font-style:italic;color:' + T['accent'] + '">business person</span>',
         76, 1.12, 1340, 'center')}
    <div style="display:flex;justify-content:center;gap:30px;margin-top:46px;align-items:center">
      {window(f'''<div style="padding:26px 30px;display:flex;gap:24px">
        <div style="width:230px;height:150px;border-radius:10px;background:{T['ghost']}"></div>
        <div style="flex:1;text-align:left">
          <div class="ser" style="font-size:30px;line-height:1.2">Your first AI client in 90 days</div>
          <div style="margin-top:14px">{ghostline('86%', 13, 10)}{ghostline('66%', 13, 10)}</div>
          <div style="margin-top:16px;display:inline-block;background:{T['accent']};color:#fff;
            border-radius:10px;padding:11px 22px;font-size:22px">Join</div></div>
      </div>''', 740, 290)}
      <div style="display:flex;flex-direction:column;gap:16px;align-items:flex-start">
        <span style="display:inline-flex;align-items:center;gap:10px;background:{T['panel']};
          border-radius:999px;padding:11px 22px;font-size:23px;color:{T['accent']}">✓ 90 days</span>
        <span class="chip">your very first customer</span></div>
    </div></div>""", "The close. Eyebrow, the serif promise with an italic span, then the real page.")

spec("screen", "Screen + moving PiP", "full", "paper", f"""
  <div style="position:absolute;inset:0;background:{T['panel']}"></div>
  <div style="position:absolute;left:0;top:0;right:0;height:62px;background:{T['ghost']};
    display:flex;align-items:center;gap:10px;padding-left:24px">
    {''.join(f'<div style="width:180px;height:34px;border-radius:8px;background:{"#FFF" if i == 0 else "#E3E0D8"}"></div>' for i in range(5))}
  </div>
  <div style="position:absolute;left:70px;top:150px;width:1200px">
    {ghostline('72%', 24, 22)}{ghostline('86%', 24, 22)}{ghostline('54%', 24, 22)}
    <div style="height:300px;border-radius:14px;background:#E6E3DB;margin-top:26px"></div></div>
  <div style="position:absolute;right:90px;bottom:90px;width:260px;height:260px;border-radius:50%;
    border:4px solid {T['page']};background:#2B2E2B;display:flex;align-items:center;
    justify-content:center;font-size:21px;color:#9DA39C;letter-spacing:.1em">face</div>
  <div style="position:absolute;left:90px;bottom:96px;font-size:22px;color:{T['mute']}">
    pip hops to whichever corner is quiet</div>""",
     "Your real screen. The only mode where the face moves and the content doesn't.")


# ------------------------------------------------------------------ render
def chrome():
    c = [os.environ.get("CHROME", ""),
         "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
         "/Applications/Chromium.app/Contents/MacOS/Chromium"]
    c += [shutil.which(n) or "" for n in ("google-chrome", "chromium", "chromium-browser")]
    for p in c:
        if p and Path(p).exists():
            return p
    sys.exit("Chrome not found; set CHROME=/path/to/chrome")


def render(s):
    tmp = OUT / f"_{s['id']}.html"
    tmp.write_text(page(s["body"], s["placement"], s["surface"]), encoding="utf-8")
    out = OUT / f"{s['id']}.png"
    subprocess.run([chrome(), "--headless", "--disable-gpu", "--hide-scrollbars",
                    f"--screenshot={out}", f"--window-size={W},{H}",
                    "--virtual-time-budget=9000", tmp.as_uri()], capture_output=True)
    tmp.unlink(missing_ok=True)
    return out.exists()


if __name__ == "__main__":
    want = sys.argv[1:]
    OUT.mkdir(parents=True, exist_ok=True)
    for s in SPECS:
        if want and s["id"] not in want:
            continue
        print(f"  {'ok ' if render(s) else 'FAIL'} {s['id']:<13} {s['placement']:<12} {s['surface']}")
    print(f"{len(SPECS)} specs -> {OUT.relative_to(ROOT)}")
