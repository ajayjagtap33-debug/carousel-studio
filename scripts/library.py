"""Reusable hand-drawn art: a recurring cast + doodle icons, drawn as Excalidraw elements.

Every item is drawn in a 100x100 design box, scaled to `size` px, top-left at (x, y).
In storyboard.json, any slide can take:
    "art": [{"id": "person.think", "x": 700, "y": 900, "size": 300, "flip": true, "c": "blue"}]
x/y are slide coordinates (0..1080, 0..1350). `flip` mirrors it, `c` recolours the shirt/accent.
`note` visuals also take "art": {"id": ...} and put it beside the note.

Preview sheet: python scripts/library.py  -> assets/library/preview/slides/*.png (after build)
"""
import math

G = None  # render module, set by use()


def use(g):
    global G; G = g


class P:
    """Pen that maps 0..100 design units into the target box (optionally mirrored)."""
    def __init__(s, x, y, size, flip=False, c="orange"):
        s.x, s.y, s.k, s.flip, s.c = x, y, size / 100, flip, c
        s.sw = max(2, round(1.1 * s.k))

    def pt(s, x, y):
        return (s.x + ((100 - x) if s.flip else x) * s.k, s.y + y * s.k)

    def line(s, pts, stroke="ink", curve=False, sw=None, **kw):
        return G.line([s.pt(*p) for p in pts], stroke, curve=curve, sw=sw or s.sw, **kw)

    def poly(s, pts, stroke="ink", bg="paper", curve=False, sw=None, fill="solid"):
        return G.line([s.pt(*p) for p in pts + [pts[0]]], stroke, curve=curve, sw=sw or s.sw,
                      backgroundColor=G.col(bg), fill=fill)

    def arrow(s, pts, stroke="ink", sw=None, **kw):
        return G.arrow([s.pt(*p) for p in pts], stroke, curve=True, sw=sw or s.sw, **kw)

    def ell(s, x, y, w, h, stroke="ink", bg=None, sw=None, **kw):
        X = (100 - x - w) if s.flip else x
        if s.flip and "angle" in kw: kw["angle"] = -kw["angle"]
        return G.ellipse(s.x + X * s.k, s.y + y * s.k, w * s.k, h * s.k, stroke, bg, sw=sw or s.sw, **kw)

    def dot(s, x, y, r=2, c="ink"):
        return s.ell(x - r, y - r, 2 * r, 2 * r, c, c, sw=1)

    def rect(s, x, y, w, h, stroke="ink", bg=None, sw=None, **kw):
        X = (100 - x - w) if s.flip else x
        return G.rect(s.x + X * s.k, s.y + y * s.k, w * s.k, h * s.k, stroke, bg, sw=sw or s.sw, **kw)

    def text(s, x, y, t, size, color="ink"):
        cx, cy = s.pt(x, y)
        return G.ctext(cx, cy, t, max(28, size * s.k), color)


# ---------------- the cast: a person ----------------
FACES = ("smile", "happy", "calm", "oops", "flat", "down")


def _face(p, face):
    if face in ("calm", "happy"):  # closed, content eyes
        p.line([(41, 14), (44, 11), (47, 14)], curve=True, sw=max(2, p.sw - 1))
        p.line([(53, 14), (56, 11), (59, 14)], curve=True, sw=max(2, p.sw - 1))
    elif face == "down":           # looking down at something
        p.dot(44, 15, 1.8); p.dot(56, 15, 1.8)
    else:
        p.dot(44, 13, 2); p.dot(56, 13, 2)
    p.ell(37, 17, 6, 4, "l_red", "l_red", sw=1); p.ell(57, 17, 6, 4, "l_red", "l_red", sw=1)
    if face == "happy":
        p.poly([(45, 20), (55, 20), (50, 25)], "ink", "ink", curve=True, sw=1)
    elif face == "oops":
        p.ell(48, 20, 4, 5, "ink", None, sw=max(2, p.sw - 1))
    elif face == "flat":
        p.line([(46, 22), (54, 22)])
    else:
        p.line([(45, 21), (50, 24), (55, 21)], curve=True)


def _arm(p, sh, el, hand):
    p.line([sh, el, hand], curve=True)
    p.ell(hand[0] - 2.5, hand[1] - 2.5, 5, 5, "ink", "paper", sw=max(2, p.sw - 1))


L_SH, R_SH = (38, 36), (62, 36)
DOWN_L, DOWN_R = ((31, 50), (32, 64)), ((69, 50), (68, 64))

POSES = {  # name: (left arm (elbow, hand), right arm (elbow, hand), default face)
    "stand": (DOWN_L, DOWN_R, "smile"),
    "wave": (DOWN_L, ((77, 28), (80, 10)), "happy"),
    "think": (((36, 54), (56, 50)), ((72, 46), (56, 27)), "flat"),
    "point": (DOWN_L, ((80, 36), (96, 32)), "smile"),
    "cheer": (((26, 24), (22, 6)), ((74, 24), (78, 6)), "happy"),
    "write": (((30, 52), (42, 58)), ((70, 50), (60, 50)), "down"),
    "read": (((30, 54), (38, 56)), ((70, 54), (62, 56)), "down"),
    "talk": (DOWN_L, ((74, 48), (80, 38)), "happy"),
    "walk": (((31, 47), (27, 59)), ((68, 49), (73, 61)), "smile"),
    "shrug": (((28, 44), (22, 33)), ((72, 44), (78, 33)), "flat"),
    "coffee": (DOWN_L, ((76, 54), (70, 48)), "calm"),
    "listen": (((33, 52), (47, 56)), ((67, 52), (53, 56)), "smile"),
}


def person(p, pose="stand", face=None):
    la, ra, f0 = POSES[pose]
    walk = pose == "walk"
    # legs + feet
    if walk:
        p.line([(45, 67), (37, 94)]); p.line([(55, 67), (64, 92)])
        p.line([(37, 94), (31, 94)]); p.line([(64, 92), (70, 93)])
    else:
        p.line([(44, 67), (42, 94)]); p.line([(56, 67), (58, 94)])
        p.line([(42, 94), (35, 95)]); p.line([(58, 94), (65, 95)])
    p.rect(37, 31, 26, 37, "ink", p.c, fill="hachure")           # shirt
    p.ell(35, 0, 30, 30, "ink", "paper")                          # head
    p.line([(37, 10), (41, 3), (48, 5), (53, 1), (60, 4), (63, 10)], curve=True)  # hair
    _face(p, face or f0)
    # props that sit under the hands
    if pose == "write":
        p.rect(38, 44, 22, 20, "ink", "paper"); p.line([(42, 50), (55, 50)], "grey"); p.line([(42, 56), (52, 56)], "grey")
        p.line([(60, 50), (68, 40)], "orange", sw=p.sw + 2)
    if pose == "read":
        p.poly([(35, 42), (50, 46), (50, 64), (35, 60)]); p.poly([(50, 46), (65, 42), (65, 60), (50, 64)])
        p.line([(39, 49), (47, 51)], "grey"); p.line([(53, 51), (61, 49)], "grey")
    if pose == "coffee":
        p.rect(66, 36, 16, 16, "ink", "paper")
        p.line([(70, 32), (72, 27), (70, 22)], "grey", curve=True); p.line([(77, 32), (79, 27), (77, 22)], "grey", curve=True)
    _arm(p, L_SH, *la); _arm(p, R_SH, *ra)
    if pose == "wave":
        p.line([(87, 8), (92, 4)]); p.line([(88, 15), (94, 14)])
    if pose == "cheer":
        p.line([(12, 4), (16, 8)]); p.line([(88, 4), (84, 8)])
    if pose == "shrug":
        p.text(80, 8, "?", 22, "grey")
    if pose == "talk":
        p.line([(86, 30), (91, 26)]); p.line([(87, 37), (93, 37)])


# ---------------- the cast: an AI bot ----------------
BOT_POSES = {  # left (elbow, hand), right (elbow, hand)
    "stand": (((30, 48), (30, 60)), ((70, 48), (70, 60))),
    "wave": (((30, 48), (30, 60)), ((76, 36), (80, 20))),
    "busy": (((30, 48), (30, 60)), ((74, 50), (80, 62))),
    "laptop": (((30, 50), (38, 60)), ((70, 50), (62, 60))),
    "shrug": (((26, 42), (22, 32)), ((74, 42), (78, 32))),
}


def bot(p, pose="stand"):
    p.rect(39, 66, 8, 24, "ink", "l_grey"); p.rect(53, 66, 8, 24, "ink", "l_grey")
    p.rect(35, 34, 30, 33, "ink", "blue", fill="hachure")
    p.ell(46, 43, 8, 8, "ink", p.c)
    p.line([(50, 6), (50, -2)]); p.ell(46, -7, 8, 8, "ink", p.c)
    p.rect(31, 6, 38, 27, "ink", "l_grey")
    p.rect(36, 11, 28, 17, "ink", "ink")
    if pose == "shrug":
        p.line([(41, 20), (45, 17), (49, 20)], "l_blue"); p.line([(51, 20), (55, 17), (59, 20)], "l_blue")
    else:
        p.ell(41, 15, 5, 7, "l_blue", "l_blue", sw=1); p.ell(54, 15, 5, 7, "l_blue", "l_blue", sw=1)
    la, ra = BOT_POSES[pose]
    for sh, (el, hand) in (((35, 40), la), ((65, 40), ra)):
        p.line([sh, el, hand])
        p.rect(hand[0] - 3, hand[1] - 2, 6, 5, "ink", "l_grey", sw=max(2, p.sw - 1))
    if pose == "busy":  # carrying a tall stack of papers
        for k in range(5):
            p.rect(70 + (k % 2) * 3, 58 - (k + 1) * 7, 26, 7, "ink", "paper", sw=max(2, p.sw - 1))
    if pose == "laptop":
        p.rect(26, 56, 48, 26, "ink", "l_grey"); p.ell(47, 66, 6, 6, "ink", "paper", sw=1)
    if pose == "shrug":
        p.text(84, 14, "?", 22, "grey")


# ---------------- doodles ----------------
def pencil(p):
    p.poly([(20, 70), (62, 28), (74, 40), (32, 82)], "ink", "l_yellow")
    p.poly([(20, 70), (32, 82), (10, 92)], "ink", "paper")
    p.poly([(14, 86), (16, 90), (10, 92)], "ink", "ink", sw=1)
    p.poly([(62, 28), (70, 20), (82, 32), (74, 40)], "ink", "l_red")


def notebook(p):
    p.rect(24, 8, 56, 84, "ink", "paper")
    for k in range(6): p.ell(18, 16 + k * 13, 11, 7, "grey", None, sw=max(2, p.sw - 1))
    for k in range(5): p.line([(34, 26 + k * 13), (72 - (k % 2) * 12, 26 + k * 13)], "grey")


def book(p):
    p.poly([(6, 24), (50, 32), (50, 90), (6, 82)]); p.poly([(50, 32), (94, 24), (94, 82), (50, 90)])
    for k in range(4):
        p.line([(14, 40 + k * 10), (42, 45 + k * 10)], "grey"); p.line([(58, 45 + k * 10), (86, 40 + k * 10)], "grey")


def bulb(p):
    p.ell(26, 12, 48, 48, "ink", "l_yellow"); p.rect(38, 58, 24, 16, "ink", "l_grey")
    p.line([(40, 80), (60, 80)])
    for a in (-150, -110, -70, -30):
        r = math.radians(a); p.line([(50 + 34 * math.cos(r), 36 + 34 * math.sin(r)), (50 + 46 * math.cos(r), 36 + 46 * math.sin(r))], "orange")


def bubble(p):
    p.rect(8, 12, 84, 56, "ink", "paper")
    p.poly([(24, 67), (18, 90), (42, 67)], "ink", "paper")
    p.line([(26, 67), (40, 67)], "paper", sw=p.sw + 2)
    for k in range(3): p.dot(34 + k * 16, 40, 3.5)


def thought(p):
    p.ell(10, 8, 82, 56, "ink", "paper")
    p.ell(22, 70, 12, 10, "ink", "paper"); p.ell(12, 86, 7, 6, "ink", "paper")


def laptop(p):
    p.rect(18, 16, 64, 46, "ink", "l_grey"); p.rect(24, 22, 52, 34, "ink", "paper")
    p.poly([(12, 64), (88, 64), (96, 78), (4, 78)], "ink", "l_grey")


def phone(p):
    p.rect(30, 4, 40, 92, "ink", "ink"); p.rect(34, 12, 32, 70, "ink", "l_blue")
    p.ell(46, 85, 8, 6, "paper", "paper", sw=1)


def coffee(p):
    p.ell(58, 44, 22, 26, "ink", None); p.rect(22, 34, 44, 50, "ink", "paper")
    p.line([(14, 88), (74, 88)])
    for x in (32, 44, 56): p.line([(x, 28), (x + 4, 18), (x, 8)], "grey", curve=True)


def heart(p):
    p.poly([(50, 88), (14, 52), (12, 28), (30, 14), (50, 28), (70, 14), (88, 28), (86, 52)], "red", "l_red", curve=True)


def star(p):
    pts = []
    for k in range(10):
        r = 44 if k % 2 == 0 else 19; a = math.radians(-90 + k * 36)
        pts.append((50 + r * math.cos(a), 54 + r * math.sin(a)))
    p.poly(pts, "orange", "l_yellow")


def sparkles(p):
    def sp(cx, cy, r):
        q = r * 0.22
        p.poly([(cx, cy - r), (cx + q, cy - q), (cx + r, cy), (cx + q, cy + q), (cx, cy + r), (cx - q, cy + q), (cx - r, cy), (cx - q, cy - q)], "orange", "l_yellow")
    sp(40, 56, 36); sp(80, 20, 16); sp(84, 78, 10)


def clock(p):
    p.ell(8, 8, 84, 84, "ink", "paper")
    for k in range(12):
        a = math.radians(k * 30); p.line([(50 + 34 * math.cos(a), 50 + 34 * math.sin(a)), (50 + 38 * math.cos(a), 50 + 38 * math.sin(a))], "grey")
    p.line([(50, 50), (50, 24)], sw=p.sw + 1); p.line([(50, 50), (68, 58)], sw=p.sw + 1)


def check(p):
    p.line([(14, 54), (40, 80), (88, 18)], "green", sw=p.sw * 3)


def cross(p):
    p.line([(18, 18), (82, 82)], "red", sw=p.sw * 3); p.line([(82, 18), (18, 82)], "red", sw=p.sw * 3)


def magnifier(p):
    p.line([(58, 58), (90, 90)], sw=p.sw * 3); p.ell(8, 8, 58, 58, "ink", "l_blue")


def sun(p):
    p.ell(28, 28, 44, 44, "orange", "l_yellow")
    for k in range(8):
        a = math.radians(k * 45); p.line([(50 + 30 * math.cos(a), 50 + 30 * math.sin(a)), (50 + 44 * math.cos(a), 50 + 44 * math.sin(a))], "orange")


def plant(p):
    p.line([(50, 66), (50, 30)], "green")
    p.ell(22, 34, 28, 13, "green", "l_green", angle=0.5); p.ell(50, 24, 28, 13, "green", "l_green", angle=-0.5)
    p.ell(40, 6, 20, 24, "green", "l_green")
    p.poly([(28, 64), (72, 64), (65, 95), (35, 95)], "ink", "l_orange")


def arrow(p):
    p.arrow([(6, 72), (34, 38), (60, 66), (92, 28)], "ink")


def scribble(p):
    """A tangled knot: mess, chaos, confusion. Takes the art colour."""
    p.line([(10, 62), (30, 22), (62, 30), (40, 70), (18, 40), (70, 18), (88, 52), (50, 84), (28, 58),
            (72, 46), (60, 76), (90, 80)], p.c, curve=True, sw=p.sw + 1)


def headphones(p):
    p.line([(18, 60), (18, 40), (50, 12), (82, 40), (82, 60)], curve=True, sw=p.sw + 2)
    p.rect(10, 54, 16, 30, "ink", p.c); p.rect(74, 54, 16, 30, "ink", p.c)


def envelope(p):
    p.rect(8, 22, 84, 58, "ink", "paper"); p.line([(12, 26), (50, 56), (88, 26)])


def people(p):
    """Two people talking: a quick conversation scene."""
    a = P(p.x - 12 * p.k, p.y + 8 * p.k, 70 * p.k, False, p.c); person(a, "talk")
    b = P(p.x + 42 * p.k, p.y + 8 * p.k, 70 * p.k, True, "blue"); person(b, "listen")
    bb = P(p.x + 26 * p.k, p.y - 22 * p.k, 26 * p.k); bubble(bb)


DOODLES = {f.__name__: f for f in (pencil, notebook, book, bulb, bubble, thought, laptop, phone,
                                  coffee, heart, star, sparkles, clock, check, cross, magnifier,
                                  sun, plant, arrow, scribble, headphones, envelope, people)}


def ids():
    return ([f"person.{k}" for k in POSES] + [f"bot.{k}" for k in BOT_POSES] + list(DOODLES))


def draw(spec, acc="orange"):
    """spec = {"id", "x", "y", "size", "flip"?, "c"?, "face"?} in slide-local coords (caller adds frame offset)."""
    p = P(spec["x"], spec["y"], spec.get("size", 240), spec.get("flip", False), spec.get("c", acc))
    kind, _, pose = spec["id"].partition(".")
    if kind == "person": person(p, pose or "stand", spec.get("face"))
    elif kind == "bot": bot(p, pose or "stand")
    elif spec["id"] in DOODLES: DOODLES[spec["id"]](p)
    else: raise KeyError(f"unknown art id {spec['id']!r}; see scripts/library.py ids()")


# ---------------- preview sheet + excalidraw library ----------------
if __name__ == "__main__":
    import json, sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).parent))
    import render as R
    use(R)
    out = R.ROOT / "assets" / "library"; (out / "preview").mkdir(parents=True, exist_ok=True)
    all_ids = ids(); per = 9  # 3x3 per sheet
    pages = [all_ids[i:i + per] for i in range(0, len(all_ids), per)]
    lib_items = []
    for pi, chunk in enumerate(pages):
        OX = pi * (R.W + R.S["gap"])
        R.cur_frame = None
        fr = R.base("frame", OX, 0, R.W, R.H, "#bbbbbb", None, name=f"{pi+1:02d} library", roughness=0)
        R.cur_frame = fr["id"]
        for k, i in enumerate(chunk):
            r, c = divmod(k, 3)
            cx = OX + R.M + c * 300 + 150; cy = R.M + r * 400
            start = len(R.E)
            draw({"id": i, "x": cx - 110, "y": cy + 40, "size": 220})
            lib_items.append({"status": "published", "id": i, "created": 1, "name": i,
                              "elements": [dict(e, frameId=None) for e in R.E[start:]]})
            R.text(cx, cy + 300, i, 28, "grey", "center")
    doc = {"type": "excalidraw", "version": 2, "source": "https://excalidraw.com", "elements": R.E,
           "appState": {"viewBackgroundColor": "#ffffff", "gridSize": None}, "files": {}}
    (out / "preview" / "carousel.excalidraw").write_text(json.dumps(doc), encoding="utf-8")
    (out / "creative-studio.excalidrawlib").write_text(json.dumps(
        {"type": "excalidrawlib", "version": 2, "source": "creative-studio", "libraryItems": lib_items}), encoding="utf-8")
    print(f"{len(all_ids)} items on {len(pages)} sheets -> {out}")
    print("render PNGs: python scripts/build.py assets/library/preview --export")
