"""Archive prompt-motion.com as a motion-graphics reference library: visuals/motion/.

  python scripts/promptmotion.py scrape [--no-video]   # index + every entry page + posters + videos (resumable)
  python scripts/promptmotion.py analyze               # ffprobe + cut rate per video -> pace, aspect, length
  python scripts/promptmotion.py build                 # tag by use, write README / by-use / by-category / sheets

Tracked (visuals/motion/): index.json (metadata, tags, links), README.md, by-use.md, by-category.md.
Git-ignored (visuals/motion/local/): videos/, posters/, prompts.json, sheets/. The videos and prompts belong to
their creators (the site says so on every entry): they stay private reference on this machine, like
videos/reference/*/frames. Borrow the pattern, never the piece. Fetching is sequential and throttled.
"""
from __future__ import annotations
import argparse, html, json, re, subprocess, sys, time, urllib.request
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "visuals" / "motion"; LOCAL = OUT / "local"
VID, POS = LOCAL / "videos", LOCAL / "posters"
BASE = "https://prompt-motion.com"
TAGS = ["product-ui", "phone", "charts", "diagrams", "kinetic-type", "shapes", "particles", "characters", "photos", "music", "code"]
UA = "Mozilla/5.0 (personal reference archive; carousel-studio)"
FFMPEG = next(iter(sorted((ROOT / "tools" / "ffmpeg").glob("*/bin/ffmpeg.exe"))), None)
ID = re.compile(r'href="/([a-z0-9_.-]+-[0-9a-f]{6,8})"')


def get(url: str, binary=False, tries=3):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=60) as r:
                b = r.read()
                return b if binary else b.decode("utf-8")
        except Exception as e:
            if i == tries - 1: raise
            time.sleep(2 * (i + 1))


def text(s: str) -> str: return html.unescape(re.sub(r"<[^>]+>", "", s)).strip()


def parse_entry(eid: str, page: str) -> dict:
    from bs4 import BeautifulSoup
    s = BeautifulSoup(page, "html.parser")
    h1 = s.find("h1")
    mp4 = re.search(r"https://media\.prompt-motion\.com/[^\"\\ ]+?\.mp4", page)
    poster = re.search(r"https://media\.prompt-motion\.com/[^\"\\ )]+?/poster\.[0-9a-f]+\.webp", page)
    wh = re.search(r'"width":(\d+),"height":(\d+)', page)
    post = next((a["href"] for a in s.find_all("a", href=re.compile(r"https://x\.com/[^/]+/status/"))), None)
    author = re.search(r"^\s*(@[A-Za-z0-9_]+)\s*$", s.get_text("\n"), re.M)
    dl = {text(str(dt)): text(str(dt.find_next_sibling("dd"))) for dt in s.find_all("dt")}
    prompt = s.find(id="entry-prompt")
    tpl = s.find("a", href=re.compile(r"/templates/"))
    return {
        "id": eid, "url": f"{BASE}/{eid}", "title": text(str(h1)) if h1 else eid,
        "author": author.group(1) if author else None, "post": post,
        "site_tags": [a["href"].rsplit("/", 1)[1] for a in s.find_all("a", href=re.compile(r"^/tags/|/tags/[a-z-]+$"))],
        "model": dl.get("Model"), "effort": dl.get("Effort"), "posted": dl.get("Posted"),
        "video": mp4.group(0) if mp4 else None, "poster": poster.group(0) if poster else None,
        "w": int(wh.group(1)) if wh else None, "h": int(wh.group(2)) if wh else None,
        "template": tpl["href"].rsplit("/", 1)[1] if tpl else None,
        "_prompt": prompt.get_text() if prompt else None,
    }


def scrape(video: bool):
    for d in (VID, POS): d.mkdir(parents=True, exist_ok=True)
    home = get(BASE + "/")
    tags = TAGS  # the homepage filter is buttons, not links; these are its 11 chips
    ids = list(dict.fromkeys(ID.findall(home)))
    by_tag = {}
    for t in tags:
        by_tag[t] = list(dict.fromkeys(ID.findall(get(f"{BASE}/tags/{t}")))); time.sleep(.3)
        extra = set(by_tag[t]) - set(ids)
        if extra: ids += sorted(extra)
    print(f"{len(ids)} entries, {len(tags)} tags: " + ", ".join(f"{t} {len(v)}" for t, v in by_tag.items()))
    old = {e["id"]: e for e in json.loads((OUT / "index.json").read_text("utf8"))["entries"]} if (OUT / "index.json").exists() else {}
    prompts = json.loads((LOCAL / "prompts.json").read_text("utf8")) if (LOCAL / "prompts.json").exists() else {}
    skills = set(re.findall(r'href="/([a-z0-9_.-]+-[0-9a-f]{6,8})"[^>]*>(?:(?!</a>).)*?Skill</', home, re.S))
    entries = []
    for n, eid in enumerate(ids, 1):
        e = old.get(eid) or parse_entry(eid, get(f"{BASE}/{eid}"))
        if not old.get(eid): time.sleep(.4)
        prompts[eid] = e.pop("_prompt", None) or prompts.get(eid)
        e["site_tags"] = [t for t in by_tag if eid in by_tag[t]]
        if e.get("post"): e["author"] = "@" + e["post"].split("/")[3]
        e["kind"] = "skill" if eid in skills else "prompt"
        for key, url, d in (("poster", e["poster"], POS), ("video", e["video"], VID)):
            if not url or (key == "video" and not video): continue
            f = d / (eid + Path(url).suffix)
            if not f.exists(): f.write_bytes(get(url, binary=True)); time.sleep(.3)
        entries.append(e)
        if n % 20 == 0: print(f"  {n}/{len(ids)}")
    # the stronger-version templates the entries link to
    tpls = {}
    for t in sorted({e["template"] for e in entries if e["template"]}):
        tpls[t] = f"{BASE}/templates/{t}"
    (LOCAL / "prompts.json").write_text(json.dumps(prompts, ensure_ascii=False, indent=1), "utf8")
    (OUT / "index.json").write_text(json.dumps({"source": BASE, "tags": tags, "templates": tpls, "entries": entries},
                                               ensure_ascii=False, indent=1), "utf8")
    print("scraped ->", OUT / "index.json")


def ff(*args) -> str:
    r = subprocess.run([str(FFMPEG), *args], capture_output=True, text=True, encoding="utf8", errors="replace")
    return r.stderr


def analyze():
    idx = json.loads((OUT / "index.json").read_text("utf8"))
    for e in idx["entries"]:
        f = VID / (e["id"] + ".mp4")
        if not f.exists(): continue
        info = ff("-i", str(f))
        m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", info)
        e["secs"] = round(int(m[1]) * 3600 + int(m[2]) * 60 + float(m[3]), 1) if m else None
        sz = re.search(r"Video:.*?, (\d{3,5})x(\d{3,5})", info)
        if sz: e["w"], e["h"] = int(sz[1]), int(sz[2])
        out = ff("-i", str(f), "-vf", "select='gt(scene,0.25)',showinfo", "-an", "-f", "null", "-")
        e["cuts"] = len(re.findall(r"pts_time:", out))
        e["cuts_per_10s"] = round(e["cuts"] * 10 / e["secs"], 1) if e.get("secs") else None
        print(e["id"], e["secs"], e["w"], e["h"], e["cuts"])
    (OUT / "index.json").write_text(json.dumps(idx, ensure_ascii=False, indent=1), "utf8")


# ---- tagging ---------------------------------------------------------------------------------------------------------
# What a reference is good for in OUR videos. Site category -> uses; pace/aspect/length refine it.
USES = {
    "reel": "Reels / Shorts / TikTok: vertical or ≤20s, hits fast",
    "promo": "Promo / ad / launch teaser: fast cuts, product or type led",
    "title": "Title card, intro, outro, logo sting: short, type or shape led",
    "explainer": "Explainer beat: a diagram, chart or UI that carries one idea on screen",
    "data": "Data story: charts and numbers drawn on",
    "demo": "Product / app demo: UI or phone walkthrough",
    "broll": "B-roll insert over his talking head: self-contained, 5–15s",
    "code": "Code / dev / terminal beat",
    "music": "Music, audio-reactive, lyric or beat-synced piece",
    "ambient": "Ambient background / texture: particles, shapes, slow loops",
    "character": "Character or mascot animation (borrow the motion, not the drawing)",
    "type": "Kinetic type: words as the picture (any pace; pick by length)",
    "shapes": "Shape / geometry motion: abstract transitions and builds",
    "photos": "Photo-led: image montage, Ken Burns, collage",
    "showcase": "Showreel / long-form: 30s+, many scenes",
}
TAG_USES = {  # site tag -> uses it suggests
    "product-ui": ["demo", "explainer"], "phone": ["demo", "reel"], "charts": ["data", "explainer"],
    "diagrams": ["explainer"], "kinetic-type": ["type"], "shapes": ["shapes"],
    "particles": ["ambient"], "characters": ["character"], "photos": ["photos"],
    "music": ["music"], "code": ["code", "explainer"],
}


def pace(e) -> str | None:
    c = e.get("cuts_per_10s")
    return None if c is None else "fast" if c >= 6 else "medium" if c >= 2.5 else "slow"


def uses(e) -> list[str]:
    u = []
    for t in e["site_tags"]: u += TAG_USES.get(t, [])
    s, p, vertical = e.get("secs"), pace(e), (e.get("h") or 0) > (e.get("w") or 1)
    if vertical or (s and s <= 20 and p == "fast"): u.append("reel")
    if p == "fast" and set(e["site_tags"]) & {"product-ui", "kinetic-type", "shapes", "photos", "phone"}: u.append("promo")
    if s and s <= 10 and set(e["site_tags"]) & {"kinetic-type", "shapes", "particles"}: u.append("title")
    if s and 4 <= s <= 15 and not (set(e["site_tags"]) & {"music"}): u.append("broll")
    if s and s >= 30: u.append("showcase")
    if p == "slow" and set(e["site_tags"]) & {"particles", "shapes"}: u.append("ambient")
    if not (set(u) - {"broll"}): u.append("explainer")
    return list(dict.fromkeys(u))


def build():
    idx = json.loads((OUT / "index.json").read_text("utf8")); E = idx["entries"]
    for e in E: e["pace"], e["orientation"], e["use"] = pace(e), ("vertical" if (e.get("h") or 0) > (e.get("w") or 1) else
                                                                  "square" if e.get("h") == e.get("w") else "landscape"), uses(e)
    (OUT / "index.json").write_text(json.dumps(idx, ensure_ascii=False, indent=1), "utf8")
    link = lambda e: f"[{e['title']}]({e['url']})"
    row = lambda e: (f"| {link(e)} | {e['author'] or ''} | {', '.join(e['site_tags'])} | {e.get('secs') or '?'}s · {e['orientation']}"
                     f" | {e['pace'] or '?'} | {', '.join(e['use'])} | `{e['id']}` |")
    head = "| piece | by | category | length | pace | use for | id |\n|---|---|---|---|---|---|---|"
    # by use
    L = ["# Motion references by use", "", f"{len(E)} pieces from [prompt-motion.com]({BASE}). Generated by `python scripts/promptmotion.py build`; "
         "pace is the scene-cut rate (cuts per 10s: slow < 2.5 ≤ medium < 6 ≤ fast), a heuristic. Files: `local/videos/<id>.mp4`, "
         "`local/posters/<id>.webp`, prompt in `local/prompts.json`.", ""]
    for k, d in USES.items():
        m = [e for e in E if k in e["use"]]
        L += [f"## {k}: {d} ({len(m)})", "", head] + [row(e) for e in sorted(m, key=lambda e: (e["pace"] or "", e["title"]))] + [""]
    (OUT / "by-use.md").write_text("\n".join(L), "utf8")
    # by category
    L = ["# Motion references by site category", ""]
    for t in idx["tags"]:
        m = [e for e in E if t in e["site_tags"]]
        L += [f"## {t} ({len(m)})", "", head] + [row(e) for e in sorted(m, key=lambda e: e["title"])] + [""]
    (OUT / "by-category.md").write_text("\n".join(L), "utf8")
    # readme
    pc = Counter(e["pace"] for e in E); uc = Counter(u for e in E for u in e["use"])
    R = ["# Motion graphics references", "",
         f"{len(E)} AI-made motion videos from [prompt-motion.com]({BASE}) (Claude Opus 5.5 pieces with the prompt behind each), "
         "archived so we can pick a piece as a template for a title card, promo, reel or explainer beat.", "",
         "- [picks.md](picks.md): hand-picked for our YouTube videos and reels (kept by hand; `build` doesn't touch it).",
         "- [by-use.md](by-use.md): everything, by use. Reel, promo, title, explainer, data, demo, b-roll, code, music, ambient, character, showcase.",
         "- [by-category.md](by-category.md): the site's own 11 categories (Product UI, Phone, Charts, Diagrams, Kinetic type, Shapes, Particles, Characters, Photos, Music, Code).",
         "- `index.json`: every entry with tags, length, size, pace, uses, author and X post link.",
         "- `local/` (git-ignored): `videos/`, `posters/`, `prompts.json`, `sheets/` (contact sheets by category). Videos and prompts belong to "
         "their creators; they stay on this machine. Borrow the pattern, never the piece.",
         "", "## How to use one", "",
         "1. Find the meaning of the beat in `visuals/catalog.md`; if nothing built fits, look here by use.",
         "2. Watch `local/videos/<id>.mp4`, read `local/prompts.json[<id>]` for how it was described to the model.",
         "3. Add what's worth building to `visuals/catalog.md` under its meaning with source key **PM** and the entry id; build new scenes in `broll/src/studio/`.",
         "", "## Counts", "", "pace: " + ", ".join(f"{k} {v}" for k, v in pc.items()),
         "", "use: " + ", ".join(f"{k} {v}" for k, v in uc.most_common()), ""]
    (OUT / "README.md").write_text("\n".join(R), "utf8")
    sheets()
    print("built", OUT)


def sheets():
    from PIL import Image, ImageDraw, ImageFont
    idx = json.loads((OUT / "index.json").read_text("utf8")); E = idx["entries"]
    (LOCAL / "sheets").mkdir(parents=True, exist_ok=True)
    font = ImageFont.load_default(16)
    groups = {f"cat-{t}": [e for e in E if t in e["site_tags"]] for t in idx["tags"]}
    groups.update({f"use-{k}": [e for e in E if k in e["use"]] for k in USES})
    for name, items in groups.items():
        for part in range(0, len(items), 36):
            chunk = items[part:part + 36]; cols, w = 6, 320; cells = []
            for e in chunk:
                f = POS / (e["id"] + ".webp")
                if not f.exists(): continue
                im = Image.open(f).convert("RGB"); im = im.resize((w, int(im.height * w / im.width)))
                c = Image.new("RGB", (w, im.height + 22), "white"); c.paste(im, (0, 22))
                ImageDraw.Draw(c).text((4, 2), e["id"][:38], fill=(200, 30, 30), font=font); cells.append(c)
            if not cells: continue
            rows = [cells[i:i + cols] for i in range(0, len(cells), cols)]
            sh = Image.new("RGB", (cols * w, sum(max(c.height for c in r) for r in rows)), "white"); y = 0
            for r in rows:
                for i, c in enumerate(r): sh.paste(c, (i * w, y))
                y += max(c.height for c in r)
            sh.save(LOCAL / "sheets" / f"{name}{'' if part == 0 else '-' + str(part // 36 + 1)}.jpg", quality=80)


if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("cmd", choices=["scrape", "analyze", "build"])
    ap.add_argument("--no-video", action="store_true"); a = ap.parse_args()
    {"scrape": lambda: scrape(not a.no_video), "analyze": analyze, "build": build}[a.cmd]()
