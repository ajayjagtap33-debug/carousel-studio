"""Band layout (theme "tmv-study"): gradient header band (logo + progress, pill kicker, headline),
stacked white cards on a light page, black footer bar. Cover and CTA slides are full gradient.

Slide fields: role, layout ("cover" | "cta" | omit), kicker, headline (lines; {"t","c":"accent"} = yellow),
headlineSize, sub, bg ("dark" for the dark slide), gap, blocks (content slides / CTA), panel (cover).
Blocks are this layout's visuals (BLOCKS below); each draws at (x, y, width) and returns its height.
Rich text anywhere = string or list of spans {"t", "b"?: bold, "c"?: colour, "s"?: strikethrough}.

Weight and tracking are encoded in the fontSize fraction (+0.5 bold, +0.25 tight, +0.125 wide caps);
build.py reads them back when it exports.
"""
import hashlib, math

R = None
SB = {}
GRAD = [(0, "#E8452F"), (0.5, "#C42A6B"), (1, "#6F2EE8")]


def use(r, sb):
    global R, SB
    R, SB = r, sb


def C(c): return R.col(c)


# ---------- primitives ----------
def fs(n, s=""):
    """Size floor from the theme: short labels (<= 3 words) may go down to labelMin, the rest to min."""
    words = len(s.split()) if s else 1
    return max(n, R.TY["labelMin"] if words <= 3 else R.TY["min"])


def plain(spans):
    return spans if isinstance(spans, str) else "".join(sp["t"] for sp in spans)


def tw(s, size, bold=False, tight=False, wide=False): return R.tw(s, size, bold, tight, wide)


def txt(x, y, s, size, color="ink", bold=False, tight=False, lh=1.25, align="left", wide=False):
    w = tw(s, size, bold, tight, wide)
    if align == "center": x -= w / 2
    elif align == "right": x -= w
    f = size + (0.5 if bold else 0) + (0.25 if tight else 0) + (0.125 if wide else 0)
    # Excalidraw draws text from the font's ascent edge (text-before-edge); shift so the glyphs sit centred in
    # the line box like CSS line-height, which is what the layout below assumes.
    m = R.METRICS.get("bold" if bold else "regular")
    oy = (lh - (m.asc + m.desc)) * size / 2 if m else 0
    R.base("text", x, y + oy, w, size * lh, color, None, text=s, originalText=s, fontSize=f,
           fontFamily=R.F["family"], textAlign="left", verticalAlign="top", containerId=None,
           lineHeight=lh, autoResize=True)
    return y + size * lh


def lines_of(spans, size, width, bold=False, color="ink", tight=False):
    if isinstance(spans, str): spans = [{"t": spans}]
    toks = []; space = True   # (word, bold, colour, strike, space-before): spans glue unless a space separates them
    for sp in spans:
        st = (sp.get("b", bold), sp.get("c", color), sp.get("s", False))
        for pi, part in enumerate(sp["t"].split("\n")):
            if pi: toks.append(None); space = True
            for k, w in enumerate(part.split(" ")):
                if w: toks.append((w, *st, space or k > 0)); space = False
            if part.endswith(" "): space = True
    out, cur, cw = [], [], 0
    for t in toks:
        if t is None: out.append(cur); cur, cw = [], 0; continue
        ww = tw(t[0], size, t[1], tight); add = ww + (tw(" ", size, t[1]) if cur and t[4] else 0)
        if cur and width and cw + add > width: out.append(cur); cur, cw = [(*t[:4], False)], ww
        else: cur.append(t); cw += add
    out.append(cur)
    return out


def rich(x, y, spans, size, width=None, color="ink", bold=False, lh=1.35, align="left", tight=False, draw=True):
    """Wrapped text with bold/colour/strike spans. Returns bottom y."""
    for ln in lines_of(spans, size, width, bold, color, tight):
        runs = []
        for t in ln:
            if runs and tuple(runs[-1][1:4]) == t[1:4]: runs[-1][0] += (" " if t[4] else "") + t[0]
            else: runs.append([*t])
        sp_k = 1.6 if tight else 1  # tight runs render a little wider than measured; keep the space visible
        gaps = [tw(" ", size, runs[k][1]) * sp_k if runs[k + 1][4] else 0 for k in range(len(runs) - 1)]
        lw = sum(tw(r[0], size, r[1], tight) for r in runs) + sum(gaps)
        xx = x + {"center": (width or lw) / 2 - lw / 2, "right": (width or lw) - lw}.get(align, 0)
        for k, r in enumerate(runs):
            w = tw(r[0], size, r[1], tight)
            if draw:
                txt(xx, y, r[0], size, r[2], r[1], tight, lh)
                if r[3]: R.line([(xx - 4, y + size * lh * 0.55), (xx + w + 4, y + size * lh * 0.55)], r[2], sw=3)
            xx += w + (gaps[k] if k < len(gaps) else 0)
        y += size * lh
    return y


def rich_h(spans, size, width, bold=False, lh=1.35, tight=False):
    return len(lines_of(spans, size, width, bold, tight=tight)) * size * lh


def svg_image(svg, x, y, w, h):
    fid = "s" + hashlib.md5(svg.encode()).hexdigest()[:16]
    R.place(svg.encode(), "image/svg+xml", fid, x, y, w, h)


def n2(v): return round(v, 2)


def grad_defs(stops, vec=(0.07, 0.25, 0.93, 0.75), gid="g"):
    st = "".join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops)
    return f'<linearGradient id="{gid}" x1="{vec[0]}" y1="{vec[1]}" x2="{vec[2]}" y2="{vec[3]}">{st}</linearGradient>'


def shape(x, y, w, h, fill=None, stroke=None, r=0, sw=1, grad=None, top_only=False):
    """Rounded box. Small radii -> Excalidraw rectangle; pills, circles, gradients, top-only radii -> SVG image."""
    if grad or top_only or (r and r > min(w, h) / 4 + 0.01):
        rr = min(r, w / 2, h / 2); o = sw / 2 if stroke else 0
        defs, f = (f"<defs>{grad_defs(grad)}</defs>", "url(#g)") if grad else ("", C(fill) if fill else "none")
        st = f' stroke="{C(stroke)}" stroke-width="{sw}"' if stroke else ""
        if top_only:
            body = (f'<path d="M0 {h} V{rr} Q0 0 {rr} 0 H{n2(w - rr)} Q{n2(w)} 0 {n2(w)} {rr} V{n2(h)} Z" fill="{f}"{st}/>')
        else:
            body = f'<rect x="{o}" y="{o}" width="{n2(w - 2 * o)}" height="{n2(h - 2 * o)}" rx="{n2(rr)}" fill="{f}"{st}/>'
        svg_image(f'<svg xmlns="http://www.w3.org/2000/svg" width="{n2(w)}" height="{n2(h)}" '
                  f'viewBox="0 0 {n2(w)} {n2(h)}">{defs}{body}</svg>', x, y, w, h)
    else:
        R.base("rectangle", x, y, w, h, stroke or "transparent", fill, sw=sw,
               roundness={"type": 3, "value": r} if r else None)


def behind(start, fn):
    """Draw fn() but put its elements under everything drawn since `start` (card backgrounds)."""
    n0 = len(R.E); fn(); new = R.E[n0:]; del R.E[n0:]; R.E[start:start] = new


def card(start, x, y, w, h, fill="white", stroke="line", r=24, sw=1):
    behind(start, lambda: shape(x, y, w, h, fill, stroke, r, sw))


def pill(x, y, t, size, fill, color, padx=20, pady=10, bold=True, stroke=None):
    w = tw(t, size, bold) + 2 * padx; h = size * 1.25 + 2 * pady
    shape(x, y, w, h, fill, stroke, h / 2)
    txt(x + padx, y + pady, t, size, color, bold)
    return w, h


TONES = {"violet": ("cv", "purple"), "grey": ("soft", "grey"), "yellow": ("cy", "#7a5a00"),
         "red": ("red", "white"), "pink": ("chip", "red")}
VALUE = {"grad": "red", "mute": "mute", "ink": "ink", "purple": "purple", "white": "white"}


# ---------- blocks ----------
def b_ask(x, y, w, s):
    """Chat question bubble + ad rows (optionally answer lines), in a card or bare (cover panel)."""
    start = len(R.E); p = 28 if s.get("card", True) else 0; yy = y + p
    if s.get("dots"):
        for k, c in enumerate(("#F26A2A", "#F7C948", "#7B2FF7")):
            R.ellipse(x + p + k * 21, yy, 13, 13, c, c, sw=1)
        yy += 13 + 18
    q = s["q"]; qs = fs(26, q); qw = tw(q, qs) + 52; qh = qs * 1.25 + 36
    shape(x + w - p - qw, yy, qw, qh, "ink", None, 22)
    txt(x + w - p - qw + 26, yy + 18, q, qs, "white")
    yy += qh + 12
    if s.get("lines"):
        lw = (w - 2 * p) * s.get("linesWidth", 0.84); yy += 11
        for f in s["lines"]:
            shape(x + p, yy, lw * f, 13, "soft", None, 6.5); yy += 24
        yy += 12
    for ad in s["ads"]:
        tag = ad.get("tag", "AD"); ts = fs(14, tag); tbg, tfg = TONES[ad.get("tone", "violet")]
        tgw = tw(tag, ts, True, wide=True) + 24; tgh = ts * 1.25 + 12
        sz = fs(24, plain(ad["text"])); tx = x + p + 20 + tgw + 16; twid = x + w - p - 20 - tx
        th = rich_h(ad["text"], sz, twid, lh=1.25)
        rh = max(tgh, th) + 34
        shape(x + p, yy, w - 2 * p, rh, ad.get("bg", "white"), ad.get("border", "line"), 14, 1.5)
        shape(x + p + 20, yy + (rh - tgh) / 2, tgw, tgh, tbg, None, 6)
        txt(x + p + 32, yy + (rh - tgh) / 2 + 6, tag, ts, tfg, True, wide=True)
        rich(tx, yy + (rh - th) / 2, ad["text"], sz, twid, ad.get("color", "ink"), lh=1.25)
        yy += rh + 12
    yy += p - 12
    if s.get("card", True): card(start, x, y, w, yy - y)
    return yy - y


def b_statpair(x, y, w, s):
    """Big numbers side by side with labels, divided by a hairline."""
    start = len(R.E); items = s["items"]; n = len(items); cw = w / n; vs = s.get("size", 112); top = y + 34; hmax = 0
    for k, it in enumerate(items):
        cx = x + k * cw + 40
        yy = txt(cx, top, it["value"], vs, VALUE[it.get("tone", "ink")], True, True, lh=0.95)
        ls = fs(25, plain(it["label"]))
        yy = rich(cx, yy + 6, it["label"], ls, cw - 60, "grey")
        hmax = max(hmax, yy - top)
    for k in range(1, n):
        shape(x + k * cw, top, 1.5, hmax, "line")
    card(start, x, y, w, hmax + 68)
    return hmax + 68


def b_take(x, y, w, s, dark=False):
    """Takeaway bar: coloured left edge, small tag, one bold line."""
    dark = dark or s.get("dark")
    bg, border, acc, fg, tagbg, tagfg = (("#18191F", "#2C2D38", "yellow", "white", "yellow", "ink") if dark else
                                         ("white", "line", "red", "ink", "chip", "red"))
    tag = s.get("tag", "SO WHAT"); ts = fs(14, tag); tgw = tw(tag, ts, True, wide=True) + 24; tgh = ts * 1.25 + 14
    sz = fs(26, plain(s["text"])); tx = x + 6 + 26 + tgw + 18; twid = x + w - 26 - tx
    th = rich_h(s["text"], sz, twid, True, 1.3); h = max(th, tgh) + 44
    shape(x, y, w, h, acc, None, 16)
    shape(x + 6, y, w - 6, h, bg, border, 16)
    shape(x + 32, y + (h - tgh) / 2, tgw, tgh, tagbg, None, 7)
    txt(x + 44, y + (h - tgh) / 2 + 7, tag, ts, tagfg, True, wide=True)
    rich(tx, y + (h - th) / 2, s["text"], sz, twid, fg, True, 1.3)
    return h


def b_dotstat(x, y, w, s):
    """10x10 dot grid next to a big percentage and its label."""
    start = len(R.E); p = 40; gw = s.get("gridWidth", 390); gap = 11; cols = 10
    d = (gw - (cols - 1) * gap) / cols; dots = [g["c"] for g in s["groups"] for _ in range(g["n"])]
    rows = math.ceil(len(dots) / cols); gh = rows * d + (rows - 1) * gap
    rx = x + p + gw + 40; rw = x + w - p - rx
    vs = s.get("size", 132); ls = fs(27, plain(s["label"])); lh_ = rich_h(s["label"], ls, rw)
    rh = vs * 0.95 + 10 + lh_; row = max(gh, rh)
    gy = y + p + (row - gh) / 2
    for k, c in enumerate(dots):
        r_, c_ = divmod(k, cols)
        R.ellipse(x + p + c_ * (d + gap), gy + r_ * (d + gap), d, d, c, c, sw=1)
    ty = y + p + (row - rh) / 2
    ty = txt(rx, ty, s["value"], vs, VALUE[s.get("tone", "grad")], True, True, lh=0.95)
    rich(rx, ty + 10, s["label"], ls, rw, "grey")
    card(start, x, y, w, row + 2 * p)
    return row + 2 * p


def b_statband(x, y, w, s):
    """Tinted card: big number + label (+ a row of pills)."""
    start = len(R.E); py, px = s.get("pad", (30, 36)); vs = s.get("size", 84)
    vw = tw(s["value"], vs, True, True); lx = x + px + vw + s.get("gap", 30); lw = x + w - px - lx
    ls = fs(s.get("labelSize", 25), plain(s["label"])); lh_ = rich_h(s["label"], ls, lw)
    vh = vs * 1.1; row = max(vh, lh_); yy = y + py
    txt(x + px, yy + (row - vs * 0.95) / 2, s["value"], vs, s.get("valueColor", "ink"), True, True, lh=0.95)
    rich(lx, yy + (row - lh_) / 2, s["label"], ls, lw, s.get("labelColor", "grey"))
    yy += row
    if s.get("pills"):
        yy += 26; px_ = x + px; ph = 0
        for t in s["pills"]:
            psz = fs(21, t); pw = tw(t, psz, True) + 40
            if px_ + pw > x + w - px: px_ = x + px; yy += ph + 12
            pw, ph = pill(px_, yy, t, psz, "white", "ink"); px_ += pw + 12
        yy += ph
    yy += py
    card(start, x, y, w, yy - y, s.get("bg", "cv"), None)
    return yy - y


def b_barcard(x, y, w, s):
    """Card with a title, a delta pill and two (or more) columns from a baseline."""
    start = len(R.E); pt, px, pb = 34, 56, 30; yy = y + pt
    ts = fs(24, s["title"]); th = ts * 1.25; row = th
    if s.get("pill"):
        ps = fs(19, s["pill"]); pw = tw(s["pill"], ps, True) + 36; ph = ps * 1.25 + 20; row = max(th, ph)
        pill(x + w - px - pw, yy + (row - ph) / 2, s["pill"], ps, "chip", "red", 18, 10)
    txt(x + px, yy + (row - th) / 2, s["title"], ts, "ink", True)
    yy += row + 24
    bars = s["bars"]; n = len(bars); bw = s.get("barWidth", 270); gap = 60; ch = s.get("height", 430)
    bx0 = x + (w - (n * bw + (n - 1) * gap)) / 2; base = yy + ch; vmax = max(b["value"] for b in bars)
    for k, b in enumerate(bars):
        bx = bx0 + k * (bw + gap); bh = s.get("barMax", 310) * b["value"] / vmax; top = base - bh
        hi = b.get("tone", "grad") == "grad"
        txt(bx + bw / 2, top - 16 - 86 * 0.95, b["display"], 86, "red" if hi else "mute", True, True, 0.95, "center")
        shape(bx, top, bw, bh, "track", None, 18, grad=GRAD if hi else None, top_only=True)
        if b.get("tag"):
            gs = fs(19, b["tag"]); txt(bx + bw / 2, top + 22, b["tag"], gs, "white" if hi else "#6b6f7b", True, align="center", wide=True)
    shape(x + px, base, w - 2 * px, 3, "ink")
    yy = base + 3 + 18; lh_ = 0
    for k, b in enumerate(bars):
        bx = bx0 + k * (bw + gap); ls = fs(25, b["label"])
        lh_ = max(lh_, rich(bx, yy, [{"t": b["label"], "b": b.get("bold", False)}], ls, bw,
                            "ink" if b.get("bold") else "grey", align="center") - yy)
    yy += lh_ + pb
    card(start, x, y, w, yy - y)
    return yy - y


def b_rows(x, y, w, s):
    """Dark slide: a link bar, then one tinted row per parameter (left key, right verdict)."""
    gap = s.get("gap", 16); yy = y
    us = fs(29, plain(s["url"])); uh = us * 1.25 + 48
    shape(x, yy, w, uh, "#18191F", "#2C2D38", 18)
    rich(x + 28, yy + 24, s["url"], us, w - 56, "#d5d6de", lh=1.25)
    yy += uh + gap
    for it in s["items"]:
        sz = fs(29, plain(it["k"]) + " " + it["v"]); rh = sz * 1.25 + 52
        shape(x, yy, w, rh, it.get("bg", "cg"), None, 18)
        rich(x + 30, yy + 26, [{"t": plain(it["k"]), "b": True, "s": it.get("strike", False)}], sz, w / 2, "ink", lh=1.25)
        txt(x + w - 30, yy + 26, it["v"], sz, it.get("vc", "ink"), True, align="right")
        yy += rh + gap
    return yy - gap - y


def b_browsers(x, y, w, s):
    """Browser-window cards side by side: url strip, big number, label."""
    items = s["items"]; gap = 22; cw = (w - gap * (len(items) - 1)) / len(items); hmax = 0
    for it in items:  # measure
        ls = fs(25, plain(it["label"]))
        hmax = max(hmax, 34 + 124 * 0.95 + 10 + rich_h(it["label"], ls, cw - 60) + 34)
    us = fs(19, it["url"]); hh = us * 1.25 + 28
    for k, it in enumerate(items):
        cx = x + k * (cw + gap); hi = it.get("hi"); h = hh + hmax
        strip, fg, bord, bsw = ("cv", "purple", "purple", 2) if hi else ("#F1F2F5", "grey", "line", 1)
        shape(cx, y, cw, h, "white", None, 24)
        shape(cx, y, cw, hh + 26, strip, None, 24)
        svg_image(f'<svg xmlns="http://www.w3.org/2000/svg" width="{n2(cw - 2)}" height="28" viewBox="0 0 {n2(cw - 2)} 28">'
                  f'<rect width="100%" height="100%" fill="#FFFFFF"/></svg>', cx + 1, y + hh, cw - 2, 28)  # squares the strip
        shape(cx, y, cw, h, None, bord, 24, bsw)
        for d in range(3): R.ellipse(cx + 20 + d * 18, y + hh / 2 - 5, 10, 10, fg, fg, sw=1)
        txt(cx + 20 + 3 * 18 + 10, y + 14, it["url"], us, fg)
        yy = txt(cx + cw / 2, y + hh + 34, it["value"], 124, VALUE[it.get("tone", "mute")], True, True, 0.95, "center")
        rich(cx + 30, yy + 10, it["label"], fs(25, plain(it["label"])), cw - 60, "grey", align="center")
    return hh + hmax


def b_pills(x, y, w, s):
    """Card with a small caps label and a wrapping row of pills."""
    start = len(R.E); py, px = 24, 28; ls = fs(21, s["label"]); xx = x + px; yy = y + py
    ph = fs(21, s["items"][0]) * 1.25 + 18
    txt(xx, yy + (ph - ls * 1.25) / 2, s["label"], ls, "grey", True, wide=True); xx += tw(s["label"], ls, True, wide=True) + 20
    for t in s["items"]:
        psz = fs(21, t); pw = tw(t, psz, True) + 36
        if xx + pw > x + w - px: xx = x + px; yy += ph + 14
        pill(xx, yy, t, psz, "cv", "purple", 18, 9); xx += pw + 14
    yy += ph + py
    card(start, x, y, w, yy - y)
    return yy - y


def b_step(x, y, w, s):
    """Numbered tinted card: gradient number, bold title, one-line sub."""
    start = len(R.E); py, px = 30, 32; tx = x + px + 58 + 24; twid = x + w - px - tx
    ts = fs(31, s["title"]); ss = fs(25, plain(s["sub"]))
    th = ts * 1.25 + 6 + rich_h(s["sub"], ss, twid); row = max(58, th)
    shape(x + px, y + py + (row - 58) / 2, 58, 58, None, None, 29, grad=GRAD)
    txt(x + px + 29, y + py + (row - 58) / 2 + 29 - 26 * 0.625, str(s["n"]), 26, "white", True, align="center")
    yy = txt(tx, y + py + (row - th) / 2, s["title"], ts, "ink", True)
    rich(tx, yy + 6, s["sub"], ss, twid, s.get("subColor", "grey"))
    card(start, x, y, w, row + 2 * py, s.get("bg", "cy"), None)
    return row + 2 * py


def b_banner(x, y, w, s):
    """Black rounded box with one bold line (spans can colour part of it)."""
    start = len(R.E); sz = fs(32, plain(s["text"])); h = rich_h(s["text"], sz, w - 68, True, 1.25, True) + 60
    rich(x + 34, y + 30, s["text"], sz, w - 68, "white", True, 1.25, tight=True)
    card(start, x, y, w, h, "black", None, 20)
    return h


def b_tiles(x, y, w, s):
    """Row of tinted stat tiles (cover)."""
    items = s["items"]; gap = 16; cw = (w - gap * (len(items) - 1)) / len(items)
    h = 22 * 2 + 56 * 0.95 + max(fs(25, it["label"]) * 1.35 for it in items)
    for k, it in enumerate(items):
        cx = x + k * (cw + gap)
        shape(cx, y, cw, h, it.get("bg", "cy"), None, 16)
        yy = txt(cx + 22, y + 22, it["value"], 56, "ink", True, True, 0.95)
        txt(cx + 22, yy, it["label"], fs(25, it["label"]), "grey", lh=1.35)
    return h


def b_button(x, y, w, s):
    sz = fs(46, s["text"]); h = sz * 1.25 + 72
    shape(x, y, w, h, "white", None, 24)
    txt(x + w / 2, y + 36, s["text"], sz, "ink", True, True, align="center")
    return h


def b_promo(x, y, w, s):
    """Purple gradient card with diagonal stripes on the right, title, sub and a yellow pill."""
    start = len(R.E); px, py = 42, 40; tw_ = w - 2 * px
    ts = fs(44, s["title"]); yy = rich(x + px, y + py, s["title"], ts, tw_, "white", True, 1.08, tight=True)
    ss = fs(23, s["sub"]); yy = rich(x + px, yy + 12, s["sub"], ss, tw_, "#FFFFFFD9", lh=1.35)
    yy += 24; ps = fs(22, s["cta"]); _, ph = pill(x + px, yy, s["cta"], ps, "yellow", "ink", 26, 15)
    h = yy + ph + py - y
    def bg():
        stripes = "".join(f'<path d="M{n2(w - 230 + k)} {n2(h)} L{n2(w - 230 + k + h)} 0 L{n2(w - 230 + k + h + 16)} 0 '
                          f'L{n2(w - 230 + k + 16)} {n2(h)} Z" fill="#FFFFFF" fill-opacity=".12"/>'
                          for k in range(-int(h), 260, 34))
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{n2(w)}" height="{n2(h)}" viewBox="0 0 {n2(w)} {n2(h)}">'
               f'<defs>{grad_defs([(0, "#4F1BB5"), (0.6, "#6C2BD9"), (1, "#8133EC")], (0, 0.3, 1, 0.7))}'
               f'<clipPath id="c"><rect width="{n2(w)}" height="{n2(h)}" rx="24"/></clipPath>'
               f'<clipPath id="r"><rect x="{n2(w - 230)}" width="230" height="{n2(h)}"/></clipPath></defs>'
               f'<g clip-path="url(#c)"><rect width="{n2(w)}" height="{n2(h)}" fill="url(#g)"/>'
               f'<g clip-path="url(#r)">{stripes}</g></g></svg>')
        svg_image(svg, x, y, w, h)
    behind(start, bg)
    return h


BLOCKS = {"ask": b_ask, "statpair": b_statpair, "take": b_take, "dotstat": b_dotstat, "statband": b_statband,
          "barcard": b_barcard, "rows": b_rows, "browsers": b_browsers, "pills": b_pills, "step": b_step,
          "banner": b_banner, "tiles": b_tiles, "button": b_button, "promo": b_promo}


# ---------- backgrounds ----------
def hero_svg(w, h, circles=()):
    a = math.radians(120); L = abs(w * math.sin(a)) + abs(h * math.cos(a)); dx, dy = math.sin(a) * L / 2, -math.cos(a) * L / 2
    lin = "".join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in GRAD)
    def rad(gid, cx, cy, rx, ry, stops):
        st = "".join(f'<stop offset="{o}" stop-color="{c}" stop-opacity="{op}"/>' for o, c, op in stops)
        return (f'<radialGradient id="{gid}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" '
                f'gradientTransform="translate({n2(cx)} {n2(cy)}) scale({n2(rx)} {n2(ry)})">{st}</radialGradient>')
    defs = (f'<linearGradient id="l" gradientUnits="userSpaceOnUse" x1="{n2(w / 2 - dx)}" y1="{n2(h / 2 - dy)}" '
            f'x2="{n2(w / 2 + dx)}" y2="{n2(h / 2 + dy)}">{lin}</linearGradient>'
            + rad("a", 0, 0, 1.2 * w, 0.9 * h, [(0, "#F05A28", 1), (0.3, "#E0333F", 1), (0.6, "#E0333F", 0)])
            + rad("b", w, 0.1 * h, 1.2 * w, 1.0 * h, [(0, "#7B2FF7", 1), (0.35, "#9B2FD0", 1), (0.7, "#9B2FD0", 0)]))
    circ = "".join(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#FFFFFF" stroke-opacity="{op}" stroke-width="2"/>'
                   for cx, cy, r, op in circles)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{n2(w)}" height="{n2(h)}" viewBox="0 0 {n2(w)} {n2(h)}">'
            f'<defs>{defs}</defs><rect width="100%" height="100%" fill="url(#l)"/>'
            f'<rect width="100%" height="100%" fill="url(#b)"/><rect width="100%" height="100%" fill="url(#a)"/>{circ}</svg>')


def dark_svg(w, h):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><defs>'
            f'<radialGradient id="g" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" '
            f'gradientTransform="translate({w / 2} {h - 10}) scale({0.65 * w} 310)">'
            f'<stop offset="0" stop-color="#7B2FF7" stop-opacity=".8"/><stop offset=".45" stop-color="#C8286A" stop-opacity=".25"/>'
            f'<stop offset=".72" stop-color="#000000" stop-opacity="0"/></radialGradient></defs>'
            f'<rect width="100%" height="100%" fill="#0B0B0E"/><rect width="100%" height="100%" fill="url(#g)"/></svg>')


# ---------- slide ----------
def kicker(x, y, t):
    ks = fs(19, t); tw_ = tw(t, ks, True, wide=True); ph = ks * 1.25 + 18; pw = 18 + 9 + 10 + tw_ + 18
    shape(x, y, pw, ph, "#FFFFFF29", "#FFFFFF59", ph / 2, 1)
    R.ellipse(x + 18, y + ph / 2 - 4.5, 9, 9, "yellow", "yellow", sw=1)
    txt(x + 37, y + 9, t, ks, "white", True, wide=True)
    return pw, ph


def headline(x, y, sd, size, width):
    n = 0
    for ln in sd["headline"] if isinstance(sd["headline"], list) else [sd["headline"]]:
        t, c = (ln, "white") if isinstance(ln, str) else (ln["t"], "yellow" if ln.get("c") == "accent" else ln["c"])
        y2 = rich(x, y, [{"t": t, "c": c, "b": True}], size, width, lh=1.02, tight=True)
        n += round((y2 - y) / (size * 1.02)); y = y2
    return y, n


def logo(x, y, size, color="white"):
    return txt(x, y, R.T.get("wordmark", "tmv."), size, color, True, True)


def slide(i, n, sd, slide_dir, acc):
    W, H = R.W, R.H; P = 80; CW = W - 2 * P
    R.OX = OX = i * (W + R.S["gap"]); R.cur_frame = None
    fr = R.base("frame", OX, 0, W, H, "#bbbbbb", None, name=f"{i+1:02d} {sd.get('role', '')}".strip(), roughness=0)
    R.cur_frame = fr["id"]
    lay = sd.get("layout"); content = [k for k, s in enumerate(SB["slides"]) if not s.get("layout")]
    if lay:  # cover / cta: full gradient, kicker sits in the logo bar
        circles = [(900, 180, 380, .13), (900, 180, 270, .11)] if lay == "cover" else [(180, 1230, 380, .12)]
        svg_image(hero_svg(W, H, circles), OX, 0, W, H); R.E[-1]["locked"] = True
        logo(OX + P, 52, 38)
        ks = fs(19, sd["kicker"]); kw = 18 + 9 + 10 + tw(sd["kicker"], ks, True, wide=True) + 18; kh = ks * 1.25 + 18
        kicker(OX + W - P - kw, 52 + (38 * 1.25 - kh) / 2, sd["kicker"])
        y, hl = headline(OX + P, 52 + 38 * 1.25 + 46, sd, sd.get("headlineSize", 104), CW)
        sub_lines = 0
        if sd.get("sub"):
            ss = fs(28, sd["sub"]); sub_lines = len(lines_of(sd["sub"], ss, 850))
            y = rich(OX + P, y + 22, sd["sub"], ss, 850, "#FFFFFFEB", lh=1.4)
        R.density(i, sd, hl, 0, sub_lines, H - 94 - y)
        if lay == "cover":
            py = y + 46; start = len(R.E); yy = py + 30
            for b in sd.get("panel", []):
                yy += b.get("mt", 0); yy += BLOCKS[b["type"]](OX + P + 32, yy, CW - 64, b) + 12
            if yy - 12 > H - 94 - 20:
                R.FLAGS.append({"flag": "crowded", "slide": i + 1, "why": f"cover panel runs {int(yy - 12 - (H - 114))}px into the footer"})
            behind(start, lambda: shape(OX + P, py, CW, H - py, "white", None, 26))
        else:
            stack(i, sd.get("blocks", []), OX + P, y + 50, H - 150, CW, sd.get("gap", 22))
    else:
        dark = sd.get("bg") == "dark"
        if dark: svg_image(dark_svg(W, H), OX, 0, W, H)
        else: R.base("rectangle", OX, 0, W, H, "transparent", "bg", sw=1)
        R.E[-1]["locked"] = True
        band_i = len(R.E); pb = 30 if dark else 66
        logo(OX + P, 52, 38)
        p = content.index(i) + 1 if i in content else 0
        bx = OX + W - P - (len(content) * 34 + (len(content) - 1) * 7)
        for k in range(len(content)):
            shape(bx + k * 41, 52 + 38 * 1.25 / 2 - 3, 34, 6, "white" if k < p else "#FFFFFF4D", None, 3)
        y = 52 + 38 * 1.25 + 46
        _, kh = kicker(OX + P, y, sd["kicker"]); y += kh + 22
        y, hl = headline(OX + P, y, sd, sd.get("headlineSize", 74), CW)
        band_h = y + pb
        if not dark: behind(band_i, lambda: (svg_image(hero_svg(W, band_h, [(940, 100, 260, .14), (940, 100, 180, .12)]), OX, 0, W, band_h)))
        top = band_h + (30 if dark else 40); bottom = H - (150 if dark else 124)
        R.density(i, sd, hl, 0, 0, bottom - top, 1)
        stack(i, sd.get("blocks", []), OX + P, top, bottom, CW, sd.get("gap", 16 if dark else 22), dark)
    footer(OX, i, n)


def stack(i, blocks, x, top, bottom, w, gap, dark=False):
    start = len(R.E); y = top
    for b in blocks:
        f = BLOCKS[b["type"]]
        y += (f(x, y, w, b, dark) if f is b_take else f(x, y, w, b)) + gap
    total = y - gap - top
    if total > bottom - top:
        R.FLAGS.append({"flag": "crowded", "slide": i + 1, "why": f"cards need {int(total)}px, room for {int(bottom - top)}px: cut a card or shorten"})
    for e in R.E[start:]: e["y"] += max(0, (bottom - top - total) / 2)


def footer(OX, i, n):
    W, H = R.W, R.H; P = 80; fy = H - 94
    R.base("rectangle", OX, fy, W, 94, "transparent", "black", sw=1)
    logo(OX + P, fy + 47 - 30 * 0.625, 30)
    if SB.get("series"):
        txt(OX + P + tw(R.T.get("wordmark", "tmv."), 30, True, True) + 16, fy + 47 - 20 * 0.625, SB["series"], 20, "#8E90A0")
    xr = OX + W - P
    if i < n - 1:
        sw_ = tw("Swipe →", 18, True) + 40; sh = 18 * 1.25 + 20
        shape(xr - sw_, fy + 47 - sh / 2, sw_, sh, "yellow", None, sh / 2)
        txt(xr - sw_ + 20, fy + 47 - sh / 2 + 10, "Swipe →", 18, "ink", True)
        xr -= sw_ + 16
    elif SB.get("site"):
        txt(xr, fy + 47 - 21 * 0.625, SB["site"], 21, "white", align="right"); xr -= tw(SB["site"], 21) + 16
    txt(xr, fy + 47 - 21 * 0.625, f"{i+1}/{n}", 21, "#8E90A0", align="right")
