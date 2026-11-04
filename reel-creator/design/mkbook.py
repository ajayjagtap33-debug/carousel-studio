"""Build the reel reference book: book.json (the ReelBook props) + job.json (stills + the playback mp4).

    python reel-creator/design/mkbook.py [--video]
    node broll/shoot.mjs reel-creator/design/job.json
    python scripts/_sheet.py reel-creator/design/frames reel-creator/design/sheet.png 6

Content is Nested Sequence 02 (videos/2026-10-30-nested-sequence-02), the horizontal edit Ajay liked, rebuilt for
9:16. Board scenes are lifted from its studio.json by slug, so they keep their real word times.
"""
import copy
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
NS02 = json.loads((ROOT / "videos/2026-10-30-nested-sequence-02/studio/studio.json").read_text(encoding="utf-8"))
SCENE = {s["slug"]: s for s in NS02["scenes"]}

# his frames from the NS02 cut, cut out with scripts/matte.py; head centre x / top in source px (measured off the matte)
HEAD = {3: (1028, 0), 16: (1028, 0), 47: (997, 16), 125: (962, 7), 150: (877, 14), 205: (995, 45), 240: (1004, 32), 255: (934, 0)}


def him(t):
    cx, top = HEAD[t]
    return {"f": f"him/f{t}.png", "m": f"him/m{t}.png", "cx": cx, "top": top}


def scene(slug, **over):
    s = copy.deepcopy(SCENE[slug])
    s.update(over)
    return s


F = [
    # 1 hook: Nick's two-line title over a card, him popping out of the panel
    dict(name="01-hook", layout="split", dur=3, still=2.4, him=him(205),
         title={"line1": "Everyone needs a", "line2": "YouTube channel", "at": 0.1},
         scene=scene("channel-page", w=1400, ring=None, sourceLine=None, start=0.25), from_=0,
         stage={"y": 722, "scale": 0.85}, caption={"text": "I think *everyone*", "at": 0.3}),
    dict(name="02-calendar", layout="split", dur=4.5, still=4.3, him=him(47), scene=scene("posting-schedule"), stage={"y": 555, "scale": 0.95},
         caption={"text": "a *posting* schedule", "at": 3.2}),
    dict(name="03-journal", layout="split", dur=4, still=3.4, him=him(125), scene=scene("journal-on-camera"), stage={"y": 555, "scale": 1.08},
         caption={"text": "but on *camera*", "at": 2.4}),
    dict(name="04-full", layout="full", dur=2.5, still=1.9, him=him(16), caption={"text": "doesn't need *polish*", "at": 0.3}),
    dict(name="05-ad", layout="full", dur=3, still=2.4, him=him(255), ad={"at": 0.5},
         caption={"text": "becomes an *ad*", "at": 0.3, "y": 1060}),
    dict(name="06-section", layout="card", dur=4, still=3.4, section={"kicker": "Reason number", "word": "one", "at": 0.1},
         scene=scene("three-reasons", cols=10, rows=1, steps=[{"at": 33.44, "lines": ["FUTURE YOU"]}]), from_=32.6,
         stage={"y": 1150, "scale": 1.08}),
    dict(name="07-old-journal", layout="board", dur=4, still=3.4, scene=scene("old-journal"), from_=40.6, stage={"y": 790, "scale": 1.22},
         caption={"text": "that *nostalgia*", "at": 2.3}),
    dict(name="08-callouts", layout="full", dur=3.5, still=3.0, him=him(125),
         callouts=[{"text": "Your face", "at": 0.4, "label": [240, 330], "target": [430, 560]},
                   {"text": "Your voice", "at": 1.3, "label": [780, 1100], "target": [630, 1250]}]),
    dict(name="09-big-deal", layout="split", dur=3, still=2.4, him=him(150), scene=scene("month-to-decade"), from_=59.6, stage={"y": 555, "scale": 0.95},
         caption={"text": "a *big deal*", "at": 0.6}),
    dict(name="10-decade", layout="board", dur=3, still=2.6, scene=scene("month-to-decade"), from_=62.9, stage={"y": 780, "scale": 1.15},
         caption={"text": "after *10 years*", "at": 0.5}),
    dict(name="11-odometer", layout="split", dur=3.2, still=2.8, him=him(240), scene=scene("2036"), from_=70.8, stage={"y": 560, "scale": 1.25},
         caption={"text": "in *2036*", "at": 0.8}),
    dict(name="12-type", layout="type", dur=2.5, still=1.8, type={"line": "The only time is *right now*", "at": 0.2}),
    dict(name="13-record", layout="board", dur=3, still=2.7, scene=scene("record-publish"), from_=82.1, stage={"y": 810, "scale": 1.15},
         caption={"text": "press *record*", "at": 0.8}),
    dict(name="14-section-two", layout="card", dur=3.5, still=3.0, section={"kicker": "Reason number", "word": "two", "at": 0.1},
         scene=scene("better-you", cols=10, rows=1, steps=[{"at": 85.42, "lines": ["BETTER YOU"]}]), from_=84.6,
         stage={"y": 1150, "scale": 1.08}),
    dict(name="15-radar", layout="split", dur=3.5, still=3.2, him=him(47), scene=scene("what-it-trains"), from_=100.4, stage={"y": 540, "scale": 1.0},
         caption={"text": "how you *explain*", "at": 0.3}),
    dict(name="16-receipt", layout="board", dur=4, still=3.7, scene=scene("receipts"), from_=105.9, stage={"y": 790, "scale": 1.32},
         caption={"text": "it leaves *receipts*", "at": 2.5}),
    dict(name="17-morph", layout="split", dur=2.8, still=2.4, him=him(205), scene=scene("first-vs-14th"), from_=117.6, stage={"y": 510, "scale": 1.1},
         caption={"text": "a *progress* bar", "at": 0.6}),
    dict(name="18-type", layout="type", dur=3, still=2.2, type={"line": "A little less *bad* every video", "at": 0.2}),
    dict(name="19-resume", layout="split", dur=2.8, still=2.4, him=him(150), scene=scene("resume-vs-video", noteAt=None), from_=139.4, stage={"y": 545, "scale": 1.15},
         caption={"text": "the video *shows it*", "at": 1.0}),
    dict(name="20-counter", layout="split", dur=3.5, still=3.1, him=him(240),
         scene=scene("reel-21k", ring=None, pills=[], sourceLine=None, start=152.4), from_=152.3, stage={"y": 545, "scale": 1.2},
         counter={"value": 21000, "label": "views", "at": 0.9, "x": 770, "y": 720},
         caption={"text": "*21,000* views", "at": 0.9}),
    dict(name="21-call", layout="board", dur=3, still=2.4, scene=scene("new-client"), from_=161.6, stage={"y": 810, "scale": 1.15},
         caption={"text": "it became a *client*", "at": 1.2}),
    dict(name="22-lengths", layout="split", dur=3.2, still=2.8, him=him(125), scene=scene("ten-minutes", vertical=True, rows=[{"label": "A 10-minute video", "at": 176.02, "run": True, "tone": "accent"}, {"label": "A reel", "at": 183.88, "w": 70, "tone": "muted"}]), from_=183.4, stage={"y": 430, "scale": 0.8},
         caption={"text": "a reel *can't*", "at": 1.0}),
    dict(name="23-feed", layout="board", dur=3, still=2.6, scene=scene("reels-feed"), from_=187.2, stage={"y": 810, "scale": 1.15},
         caption={"text": "great for *reach*", "at": 0.6}),
    dict(name="24-shelf", layout="split", dur=3.2, still=2.9, him=him(47), scene=scene("shelf-life"), from_=198.6, stage={"y": 520, "scale": 1.0},
         caption={"text": "years *later*", "at": 0.8}),
    dict(name="25-search", layout="board", dur=4.5, still=4.3, scene=scene("found-everywhere", stack=True), from_=205.6, stage={"y": 800, "scale": 1.06},
         caption={"text": "even *AI answers*", "at": 1.4}),
    dict(name="26-channel", layout="split", dur=3, still=2.6, him=him(205),
         scene=scene("channel-page", sourceLine=None), from_=217.2, stage={"y": 560, "scale": 1.0}, caption={"text": "they *connect*", "at": 0.8}),
    dict(name="27-type", layout="type", dur=2.5, still=1.9, type={"line": "Better late than *never*", "at": 0.2}),
    dict(name="28-cta", layout="full", dur=3.5, still=2.6, him=him(3), cta={"word": "CHANNEL", "at": 0.4}),
    dict(name="29-safe-zones", layout="split", dur=2, still=1.9, him=him(205), guides=True,
         title={"line1": "Everyone needs a", "line2": "YouTube channel", "at": 0},
         scene=scene("channel-page", w=1400, ring=None, sourceLine=None, start=0.25), from_=0,
         stage={"y": 722, "scale": 0.85}, caption={"text": "I think *everyone*", "at": 0}),
]

frames = []
for f in F:
    f = dict(f)
    if "from_" in f:
        f["from"] = f.pop("from_")
    frames.append(f)

pub = HERE / "public"
(HERE / "book.json").write_text(json.dumps({"theme": "ajay", "frames": frames}, indent=1, ensure_ascii=False), encoding="utf-8")
fps, t, stills = 30, 0.0, []
for f in frames:
    stills.append({"frame": round((t + f["still"]) * fps), "out": str(HERE / "frames" / f"{f['name']}.png"), "scale": 1})
    t += f["dur"]
job = {"comp": "ReelBook", "props": {"theme": "ajay", "frames": frames}, "publicDir": str(pub), "concurrency": 3, "stills": stills}
if "--video" in sys.argv:
    job["clips"] = [{"from": 0, "to": round(t * fps) - 1, "out": str(HERE / "reel-book.mp4")}]
(HERE / "job.json").write_text(json.dumps(job, indent=1, ensure_ascii=False), encoding="utf-8")
print(f"{len(frames)} frames, {t:.1f}s")
