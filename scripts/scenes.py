"""Which visuals the videos and reels have used, so the next one picks something fresh.

  python scripts/scenes.py ledger                 every plan's scenes -> visuals/ledger.md (+ catalog health)
  python scripts/scenes.py check <folder>         lint one plan: repeats, stock-card share, worn-out types
                                                  (a studio video folder or a reel folder; exit 1 on blocking issues)

Plans are read where they live: the newest videos/*/studio/studio*.json (horizontal, studio mode) and
reel-creator/reels/*/reel.json, reels/*/reel.json (vertical). Scene names are checked against the renderer
(SCENES, IDEA_SCENES, REEL_SCENES) and against visuals/catalog.md, which maps each meaning to its scenes.
"""
import argparse, json, re, sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CATALOG = ROOT / "visuals" / "catalog.md"
LEDGER = ROOT / "visuals" / "ledger.md"
REGISTRIES = [  # (file, exported Record) that make up the menu
    (ROOT / "broll/src/studio/scenes.tsx", "SCENES"),
    (ROOT / "broll/src/studio/scenes-idea.tsx", "IDEA_SCENES"),
    (ROOT / "broll/src/studio/scenes-explain.tsx", "EXPLAIN_SCENES"),
    (ROOT / "broll/src/reel/scenes-reel.tsx", "REEL_SCENES"),
    (ROOT / "broll/src/reel/scenes-reel-ui.tsx", "REEL_UI_SCENES"),
    (ROOT / "broll/src/reel/scenes-reel-3d.tsx", "REEL_3D_SCENES"),
]
LEGACY = (ROOT / "reel-creator/engine/src/scenes.tsx", "SCENES")  # the archived reel engine: known, not on the menu
STUDIO_GLOB = "videos/*/studio"
REEL_GLOBS = ["reel-creator/reels/*/reel.json", "reels/*/reel.json"]

STOCK = {"trio", "words", "type", "count", "list", "points"}  # cards that caption rather than draw
STAPLES = {"words", "type", "shot", "gallery"}                 # the house layout: never "worn out"
BANNED = {"points", "list"}                                    # studio rule since 2026-10-29
CAPS = {"type": 4, "shot": None, "gallery": None}              # per plan; None = no cap
cap_of = lambda t, n: max(4, n // 4) if t == "words" else CAPS.get(t, max(3, n // 10))  # n = beats in the plan
RECENT = 3       # how many earlier plans count as "recent"
STOCK_SHARE = 0.5


def menu(registries=REGISTRIES) -> set[str]:
    names = set()
    for path, name in registries:
        if not path.exists(): continue
        m = re.search(rf"export const {name}\b[^=]*=\s*\{{(.*?)\}};", path.read_text(encoding="utf-8"), re.S)
        if m: names |= set(re.findall(r"\b([a-z]\w*):\s*[A-Z]", m.group(1)))
    return names


def catalog() -> tuple[dict[str, list[str]], list[str]]:
    """meaning -> built scene names, and the meanings with nothing built."""
    built, gaps, on = {}, [], False
    for line in CATALOG.read_text(encoding="utf-8").splitlines():
        if line.startswith("## "): on = line.strip() == "## Meanings"
        if not on or not line.startswith("| ") or line.startswith("| meaning") or line.startswith("|---"): continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        names = re.findall(r"`([a-zA-Z]\w*)`", cells[2])
        built[cells[0]] = names
        if not names: gaps.append(cells[0])
    return built, gaps


def scenes_of(plan: dict) -> list[dict]:
    """[{type, source}] in order, from a studio plan or any of the reel shapes."""
    plan = plan.get("props", plan)
    if "scenes" in plan:
        return [{"type": s["type"], "source": s.get("source", "")} for s in sorted(plan["scenes"], key=lambda s: s.get("start", 0))]
    out = []
    for b in plan.get("beats") or plan.get("frames") or plan.get("segments") or []:
        where = b.get("name") or f"at {b.get('start', 0):g}s"
        if b.get("scene"): out.append({"type": b["scene"]["type"], "source": b["scene"].get("source") or where})
        elif b.get("layout") in ("type", "card"): out.append({"type": b["layout"], "source": where})
        for k in ("counter", "callouts", "ad"):
            if b.get(k): out.append({"type": k, "source": where})
    return out


def plan_in(folder: Path) -> tuple[str, Path] | None:
    studio = folder / "studio" if (folder / "studio").is_dir() else folder
    files = [f for f in studio.glob("studio*.json")]
    if files: return "video", max(files, key=lambda f: f.stat().st_mtime)
    if (folder / "reel.json").exists(): return "reel", folder / "reel.json"
    return None


def plans() -> list[dict]:
    """Every plan on disk, oldest first (folders are date-prefixed)."""
    folders = [d.parent for d in ROOT.glob(STUDIO_GLOB)] + [f.parent for g in REEL_GLOBS for f in ROOT.glob(g)]
    out = []
    for folder in folders:
        hit = plan_in(folder)
        if not hit: continue
        kind, path = hit
        out.append({"name": folder.name, "folder": folder.resolve(), "kind": kind, "path": path,
                    "scenes": scenes_of(json.loads(path.read_text(encoding="utf-8")))})
    return sorted(out, key=lambda p: p["name"])


def rel(p: Path) -> str:
    return p.resolve().relative_to(ROOT).as_posix()


def stock_share(sc: list[dict]) -> float:
    return sum(s["type"] in STOCK for s in sc) / len(sc) if sc else 0


# ---------------------------------------------------------------------------------------------------------- check
def cmd_check(folder: Path) -> bool:
    hit = plan_in(folder)
    if not hit: sys.exit(f"no studio*.json or reel.json in {folder}")
    kind, path = hit
    sc = scenes_of(json.loads(path.read_text(encoding="utf-8")))
    types = [s["type"] for s in sc]
    counts = Counter(types)
    issues, warns = [], []
    known, legacy, (built, gaps) = menu(), menu([LEGACY]), catalog()

    for t, n in counts.items():
        cap = cap_of(t, len(sc))
        if cap is not None and n > cap:
            issues.append(f"`{t}` used {n} times (max {cap}): swap {n - cap} for another picture of the same meaning")
        if t in BANNED:
            issues.append(f"`{t}` used: a headline over rows is a caption in a box; draw the beat")
        if t not in known:
            warns.append(f"`{t}` " + ("is an old reel-engine scene: rebuild it in broll/src/reel before reusing it"
                                      if t in legacy else "isn't in the renderer's menu (a typo?)"))
    for i in range(1, len(types)):
        if types[i] == types[i - 1] and types[i] not in ("shot", "gallery", "words"):
            issues.append(f"`{types[i]}` twice in a row (scenes {i} and {i + 1}): '{sc[i]['source'][:60]}'")

    share = stock_share(sc)
    if share > STOCK_SHARE:
        warns.append(f"{share:.0%} of scenes are stock cards ({', '.join(sorted(STOCK & set(types)))}): "
                     f"more of them should be a picture of the sentence")
    if sc and len(counts) / len(sc) < 0.4:
        warns.append(f"{len(counts)} kinds of scene across {len(sc)} beats: the pictures will feel the same")

    me = folder.resolve()
    earlier = [p for p in plans() if p["folder"] != me and p["name"] < me.name][-RECENT:]
    for t in sorted(counts):
        if t in STAPLES: continue
        used = [p["name"] for p in earlier if any(s["type"] == t for s in p["scenes"])]
        if len(used) >= 2:
            warns.append(f"`{t}` was also in {', '.join(used)}: worn out, pick another for its meaning if one fits")

    recent_types = {s["type"] for p in earlier for s in p["scenes"]} | set(types)
    fresh = {m: [n for n in names if n not in recent_types] for m, names in built.items()}
    fresh = {m: n for m, n in fresh.items() if n}

    print(f"{rel(path)}: {len(sc)} scenes, {len(counts)} kinds, {share:.0%} stock")
    print("  " + "  ".join(f"{t}×{n}" for t, n in counts.most_common()))
    for x in issues: print(x)
    for x in warns: print("warn:", x)
    if fresh:
        print(f"fresh (not used here or in the last {RECENT}):")
        for m, n in fresh.items(): print(f"  {m}: {' '.join(n)}")
    if gaps: print("unbuilt meanings (catalog):", ", ".join(gaps))
    print("OK" if not issues else f"{len(issues)} blocking")
    return not issues


# ---------------------------------------------------------------------------------------------------------- ledger
def cmd_ledger() -> None:
    known, legacy, (built, gaps) = menu(), menu([LEGACY]), catalog()
    ps = plans()
    meaning_of: dict[str, list[str]] = {}
    for m, names in built.items():
        for n in names: meaning_of.setdefault(n, []).append(m)

    L = ["# Scene ledger", "",
         "Generated by `python scripts/scenes.py ledger`: don't edit, re-run. What each video and reel used, newest last.",
         "The meanings and the build backlog are in `catalog.md`.", "",
         "## Plans", "", "| plan | kind | scenes | kinds | stock | most used |", "|---|---|---|---|---|---|"]
    for p in ps:
        c = Counter(s["type"] for s in p["scenes"])
        top = " ".join(f"`{t}`×{n}" for t, n in c.most_common(3))
        L.append(f"| {p['name']} | {p['kind']} | {len(p['scenes'])} | {len(c)} | {stock_share(p['scenes']):.0%} | {top} |")

    L += ["", "## Scenes", "", "Every scene on the menu and anything a plan used that isn't on it. "
          "`last` = newest plan that used it.", "",
          "| scene | meaning | uses | plans | last |", "|---|---|---|---|---|"]
    uses: Counter = Counter()
    in_plans: dict[str, list[str]] = {}
    for p in ps:
        for t, n in Counter(s["type"] for s in p["scenes"]).items():
            uses[t] += n
            in_plans.setdefault(t, []).append(p["name"])
    for t in sorted(known | set(uses), key=lambda t: (-uses[t], t)):
        tag = "" if t in known else " (old reel engine)" if t in legacy else " (not on menu)"
        L.append(f"| `{t}`{tag} | {', '.join(meaning_of.get(t, [])) or '—'} | {uses[t]} | "
                 f"{len(in_plans.get(t, []))} | {(in_plans.get(t) or ['never'])[-1]} |")

    never = sorted(t for t in known - BANNED if not uses[t])
    L += ["", "## Never used", "", " ".join(f"`{t}`" for t in never) or "—"]
    L += ["", "## Meanings with nothing built", "", ", ".join(gaps) or "—"]

    L += ["", "## Stock-card beats in the last plans", "",
          "Beats that got a stock card. Any that wanted a real picture go into `catalog.md` → Backlog.", ""]
    for p in ps[-RECENT:]:
        stock = [s for s in p["scenes"] if s["type"] in STOCK and s["type"] != "words"]
        if not stock: continue
        L.append(f"**{p['name']}**")
        L += [f"- `{s['type']}`: {s['source'][:110] or '(no source line)'}" for s in stock]
        L.append("")

    problems = [f"catalog names `{n}`, which isn't on the menu" for n in sorted(meaning_of) if n not in known]
    problems += [f"`{n}` is on the menu but in no meaning in the catalog" for n in sorted(known - set(meaning_of) - BANNED)]
    problems += [f"catalog offers `{n}`, which is banned" for n in sorted(BANNED & set(meaning_of))]
    L += ["## Catalog health", ""] + ([f"- {x}" for x in problems] or ["- OK"])

    LEDGER.write_text("\n".join(L).rstrip() + "\n", encoding="utf-8")
    print(f"{rel(LEDGER)}: {len(ps)} plans, {len(known)} scenes on the menu, {len(never)} never used, "
          f"{len(gaps)} meanings unbuilt")
    for x in problems: print("warn:", x)


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("ledger")
    c = sub.add_parser("check"); c.add_argument("folder", type=Path)
    a = ap.parse_args()
    if a.cmd == "ledger": cmd_ledger()
    else: sys.exit(0 if cmd_check(a.folder) else 1)


if __name__ == "__main__":
    main()
