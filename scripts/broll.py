"""Talking-head video -> final video with timed b-roll and a face box (Remotion project in broll/).

  python scripts/broll.py transcribe videos/<folder> [--model small]   cut video -> transcript.json + transcript.md
  python scripts/broll.py find       videos/<folder> "phrase"          when is a phrase said (start/end seconds)
  python scripts/broll.py snap       videos/<folder> 0:42 1:15 [--len 10]  spot inserts snapped to sentence starts/ends
  python scripts/broll.py check      videos/<folder> [--no-layout]     validate broll.json (blocking issues + warn:)
                                                                       editorial: also a layout lint of each scene's 75% frame
  python scripts/broll.py still      videos/<folder> [t1 t2 ...]       PNG frames into stills/ (default: each scene's middle)
  python scripts/broll.py sheet      videos/<folder>                   editorial: one 0.25-scale still per scene -> stills/sheet.png
  python scripts/broll.py render     videos/<folder> [--draft]         final.mp4 (draft = half size, faster)
                                     editorial: broll.mp4 (silent, full length) | --preview: preview.mp4 (audio + face box)
                                     | --clips: clips/<02m14s-slug>.mp4, one per insert (spot) or per run (full), 0.25s fades

The job folder holds the cut (cut.mp4, or the only .mp4/.mov/.mkv there), transcript.json, broll.json,
any screenshots a scene uses, and the outputs. All times are seconds in the cut.
"""
import argparse, json, os, re, shutil, subprocess, sys, time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / "broll"
CLI = APP / "node_modules" / "@remotion" / "cli" / "remotion-cli.js"
VIDEO_EXT = (".mp4", ".mov", ".mkv", ".m4v", ".webm")
OUTPUTS = ("final", "final-draft", "broll", "preview")  # files this script writes, never the input cut
AUDIO_EXT = (".wav", ".mp3", ".m4a", ".aac")  # audio-only: b-roll is timed to it, frame defaults to 1920x1080 @ 30

# what each scene type needs (keep in step with broll/src/scenes.tsx -> SCENES)
TYPES = {
    "title": ["title"], "checklist": ["items"], "cards": ["items"], "stat": ["value", "label"],
    "grid": ["items"], "quote": ["source", "text"], "image": ["src"], "versus": ["left", "right"], "flow": ["steps"],
}
MIN_SCENE, MAX_SCENE = 2.0, 25.0
# rough character limits so text stays on one line at its size (Virgil, 1080p, face box on the right)
LIMITS = {"title": 34, "item": 30, "label": 18, "pill": 26, "sub": 60, "quote": 190}


def find_video(folder: Path) -> Path:
    cut = folder / "cut.mp4"
    if cut.exists(): return cut
    vids = [p for p in folder.iterdir() if p.suffix.lower() in VIDEO_EXT and p.stem not in OUTPUTS]
    if not vids: vids = [p for p in folder.iterdir() if p.suffix.lower() in AUDIO_EXT]
    if len(vids) != 1: sys.exit(f"put the exported cut (or its audio) in {folder} as cut.mp4 (found: {[v.name for v in vids] or 'none'})")
    return vids[0]


def probe(path: Path) -> dict:
    import av
    with av.open(str(path)) as c:
        v = next((s for s in c.streams if s.type == "video"), None)
        if v is None:  # audio only
            return {"fps": 30, "width": 1920, "height": 1080, "duration": round(float(c.duration / 1_000_000), 3), "audioOnly": True}
        fps = float(v.average_rate or v.base_rate or 30)
        dur = float(c.duration / 1_000_000) if c.duration else float(v.duration * v.time_base)
        return {"fps": round(fps, 3), "width": v.codec_context.width, "height": v.codec_context.height, "duration": round(dur, 3)}


def fmt(t: float) -> str:
    return f"{int(t // 60)}:{t % 60:05.2f}"


def ffmpeg() -> str:
    local = sorted(ROOT.glob("tools/ffmpeg*/**/ffmpeg.exe")) + sorted(ROOT.glob("tools/ffmpeg*/**/bin/ffmpeg"))
    ff = os.environ.get("FFMPEG") or shutil.which("ffmpeg") or (str(local[0]) if local else None)
    if not ff: sys.exit("ffmpeg not found: unzip a build into tools/ffmpeg/ or set FFMPEG=/path/to/ffmpeg")
    return ff


def audio16k(video: Path):
    # decode with ffmpeg ourselves (faster-whisper's own decoder breaks on newer PyAV versions)
    import numpy as np
    r = subprocess.run([ffmpeg(), "-v", "error", "-i", str(video), "-vn", "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
                       capture_output=True)
    if r.returncode: sys.exit(f"ffmpeg couldn't read the audio:\n{r.stderr.decode()[-800:]}")
    return np.frombuffer(r.stdout, dtype=np.float32)


def cmd_transcribe(folder: Path, model: str, language: str | None):
    os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")
    from faster_whisper import WhisperModel
    video = find_video(folder)
    media = probe(video)
    print(f"{video.name}: {media['width']}x{media['height']} {media['fps']}fps {fmt(media['duration'])}")
    print(f"transcribing with faster-whisper '{model}' on CPU (roughly 1/3 of the video's length)...")
    t0 = time.time()
    wm = WhisperModel(model, device="cpu", compute_type="int8")
    segs, info = wm.transcribe(audio16k(video), word_timestamps=True, vad_filter=True, language=language)
    out, words = [], []
    for s in segs:
        ws = [{"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)} for w in (s.words or [])]
        words += ws
        out.append({"s": round(s.start, 2), "e": round(s.end, 2), "text": s.text.strip()})
        print(f"  [{fmt(s.start)}] {s.text.strip()}")
    data = {"video": video.name, "media": media, "language": info.language, "model": model, "segments": out, "words": words}
    (folder / "transcript.json").write_text(json.dumps(data, indent=1, ensure_ascii=False), encoding="utf-8")
    md = [f"# Transcript: {video.name}", "", f"{fmt(media['duration'])} long, {len(words)} words. Times are seconds in the cut.", ""]
    md += [f"- `{s['s']:.2f}–{s['e']:.2f}` ({fmt(s['s'])}) {s['text']}" for s in out]
    (folder / "transcript.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    print(f"wrote transcript.json + transcript.md in {time.time() - t0:.0f}s")


def norm(w: str) -> str:
    return re.sub(r"[^\w%$']+", "", w.lower())


def cmd_find(folder: Path, phrase: str):
    words = json.loads((folder / "transcript.json").read_text(encoding="utf-8"))["words"]
    target = [norm(w) for w in phrase.split() if norm(w)]
    seq = [norm(w["w"]) for w in words]
    hits = [i for i in range(len(seq) - len(target) + 1) if seq[i:i + len(target)] == target]
    if not hits: print(f'"{phrase}": not found (try fewer words)'); return
    for i in hits:
        ctx = " ".join(w["w"] for w in words[max(0, i - 5): i + len(target) + 5])
        print(f'{words[i]["s"]:.2f}–{words[i + len(target) - 1]["e"]:.2f}  ({fmt(words[i]["s"])})  …{ctx}…')


def load(folder: Path):
    tr = json.loads((folder / "transcript.json").read_text(encoding="utf-8"))
    plan = json.loads((folder / "broll.json").read_text(encoding="utf-8"))
    return tr, plan


def icon_names() -> set[str]:
    r = subprocess.run(["node", "-e", "console.log(Object.keys(require('lucide-react').icons).join(' '))"],
                       cwd=APP, capture_output=True, text=True)
    kebab = lambda s: re.sub(r"(?<!^)(?=[A-Z])|(?<=[a-z])(?=\d)", "-", s).lower()
    return {kebab(n) for n in r.stdout.split()} | {n.lower() for n in r.stdout.split()}


# editorial style (broll/src/editorial/scenes.tsx -> ESCENES): b-roll only, Ajay places his face in Google Vids
ETYPES = {"browser": ["at"], "statement": ["headline"], "flow": ["tiles"], "file": ["name", "rows"], "pipeline": ["doc", "prompts", "result"]}


def editorial(plan: dict) -> bool:
    return plan.get("style") == "editorial"


def coverage(plan: dict) -> str:
    return plan.get("coverage", "full")


def face_box(scene: dict, plan: dict) -> bool:
    """Keep the right edge clear for the face box? (spot default: hidden, the insert fills the frame)"""
    return scene.get("face", "hidden" if coverage(plan) == "spot" else "box") == "box"


def parse_time(v: str) -> float:
    """0:42 / 1:15.5 / 02m14s / 75.2 -> seconds"""
    m = re.fullmatch(r"(\d+)m(\d+(?:\.\d+)?)s?", v)
    if m: return int(m[1]) * 60 + float(m[2])
    return sum(float(x) * 60 ** i for i, x in enumerate(reversed(v.split(":"))))


def sentences(tr: dict, clauses: bool = False) -> list[dict]:
    """Sentences from the word list (a sentence ends on a word ending in . ? !). clauses: also break on , ; :
    and on pauses of 0.4s+ (for run-on speech, where one "sentence" lasts 20s)."""
    out, cur, words = [], [], tr["words"]
    for k, w in enumerate(words):
        cur.append(w)
        nxt = words[k + 1] if k + 1 < len(words) else None
        if re.search(r"[.?!][\"')]*$", w["w"]) or clauses and (re.search(r"[,;:]$", w["w"]) or nxt and nxt["s"] - w["e"] >= 0.4):
            out.append(cur); cur = []
    if cur: out.append(cur)
    return [{"s": c[0]["s"], "e": c[-1]["e"], "text": " ".join(w["w"] for w in c)} for c in out]


def cmd_snap(folder: Path, times: list[str], length: float):
    """For each time Ajay gives: an insert of about `length` seconds that starts on the sentence it falls in and
    ends on a sentence end; clause boundaries when the sentence is a long run-on."""
    tr = json.loads((folder / "transcript.json").read_text(encoding="utf-8"))
    sents, cls = sentences(tr), sentences(tr, clauses=True)
    for v in times:
        t = parse_time(v)
        sent = next((x for x in sents if x["e"] >= t), sents[-1])
        a = sent["s"] if t - sent["s"] <= 3 else max((x["s"] for x in cls if x["s"] <= t + 0.3), default=sent["s"])
        ends = [x["e"] for x in sents if a + 0.6 * length <= x["e"] <= a + 1.5 * length] \
            or [x["e"] for x in cls if x["e"] >= a + 2] or [cls[-1]["e"]]
        b = min(ends, key=lambda e: abs(e - a - length))
        text = " ".join(w["w"] for w in tr["words"] if a <= w["s"] < b)
        print(f'{v:>7} -> {a:.2f}–{b:.2f} ({fmt(a)}, {b - a:.1f}s)  "{text[:110]}{"…" if len(text) > 110 else ""}"')


def all_times(node, key=""):
    """Every timing value inside a scene: keys named at / *At / tick / joinAt / arrows / sub (lists of times)."""
    if isinstance(node, dict):
        for k, v in node.items():
            if k in ("start", "end"): continue
            yield from all_times(v, k)
    elif isinstance(node, list):
        for v in node: yield from all_times(v, key)
    elif isinstance(node, (int, float)) and (key == "at" or key.endswith("At") or key in ("tick", "joinAt", "arrows", "sub")):
        yield key, node


def check_editorial(folder: Path, tr: dict, plan: dict, layout: bool = True) -> bool:
    dur = float(plan.get("duration") or tr["media"]["duration"])
    icons = icon_names()
    issues, warns, slots = [], [], []
    scenes = sorted(plan.get("scenes", []), key=lambda s: s.get("start", 0))
    if not scenes: issues.append("broll.json has no scenes")
    if coverage(plan) not in ("full", "spot"): issues.append(f"coverage '{coverage(plan)}': use full or spot")
    sents = sentences(tr, clauses=True) if coverage(plan) == "spot" else []
    prev, n_el = None, 0
    for n, s in enumerate(scenes, 1):
        w = f"scene {n} ({s.get('type')} @ {fmt(s.get('start', 0))})"
        t = s.get("type")
        if t not in ETYPES: issues.append(f"{w}: unknown type, use one of {', '.join(ETYPES)}"); continue
        for k in ETYPES[t]:
            if not s.get(k): issues.append(f"{w}: needs '{k}'")
        a, b = s.get("start"), s.get("end")
        if a is None or b is None or b <= a: issues.append(f"{w}: needs start < end"); continue
        if b > dur + 0.01: issues.append(f"{w}: ends at {b}, the cut is {dur:.2f}s")
        if b - a < MIN_SCENE: issues.append(f"{w}: {b - a:.1f}s is too short to read (min {MIN_SCENE}s)")
        if prev and a < prev["end"] - 0.01: issues.append(f"{w}: overlaps the previous scene (ends {prev['end']})")
        if not isinstance(s.get("source"), str): warns.append(f"{w}: no 'source' (what's said here) for the review sheet")
        if s.get("face", "box") not in ("box", "hidden"): issues.append(f"{w}: face '{s['face']}': use box or hidden")
        if sents:  # spot inserts start and end on a sentence / clause boundary (small lead-in / tail allowed)
            ns = min(sents, key=lambda x: abs(x["s"] - a)); ne = min(sents, key=lambda x: abs(x["e"] - b))
            if not -0.1 <= ns["s"] - a <= 0.4: warns.append(f"{w}: doesn't start on a sentence or clause (nearest start {ns['s']:.2f})")
            if not -0.4 <= b - ne["e"] <= 0.6: warns.append(f"{w}: doesn't end on a sentence or clause (nearest end {ne['e']:.2f})")
        ts = list(all_times(s))
        n_el += len(ts)
        for k, v in ts:
            if not (a - 0.01 <= v <= b - 0.25): issues.append(f"{w}: {k} {v} is outside the scene ({a}–{b})")
        if ts and min(v for _, v in ts) - a > 0.3:
            warns.append(f"{w}: nothing appears for {min(v for _, v in ts) - a:.1f}s after the scene starts")
        for k, v in all_strings(s, "icon"):
            if v.lower() not in icons: issues.append(f"{w}: icon '{v}' isn't a lucide icon (lucide.dev/icons, kebab name)")
        for _, v in list(all_strings(s, "logo")) + list(all_strings(s, "src")):
            if not (folder / v).exists(): slots.append(f"missing-asset: {w} needs {v} in the folder")
        for p in s.get("pills") or []:
            if len(p.get("text", "")) > LIMITS["pill"]: issues.append(f"{w}: pill '{p['text']}' is too long (max {LIMITS['pill']})")
        prev = s
    covered = sum(s["end"] - s["start"] for s in scenes if "start" in s and "end" in s)
    if layout and not issues: issues += layout_check(folder, plan, scenes)
    for m in issues: print("BLOCK:", m)
    for m in slots: print("slot:", m)
    for m in warns: print("warn:", m)
    print(f"{coverage(plan)} coverage: {len(scenes)} scenes, {n_el} timed elements (one every {covered / max(n_el, 1):.1f}s), "
          f"b-roll {covered:.0f}s of {dur:.0f}s ({100 * covered / max(dur, 1):.0f}%)."
          + (" OK" if not issues and not slots else f" {len(issues)} blocking, {len(slots)} slots."))
    return not issues and not slots


def all_strings(node, want: str):
    if isinstance(node, dict):
        for k, v in node.items():
            if k == want and isinstance(v, str): yield k, v
            else: yield from all_strings(v, want)
    elif isinstance(node, list):
        for v in node: yield from all_strings(v, want)


def copy_logos(folder: Path, plan: dict):
    """Logos come only from assets/logos (official press kits); copy the ones a plan uses into the job folder."""
    for _, v in all_strings(plan, "logo"):
        src, dst = ROOT / "assets" / v, folder / v
        if v.startswith("logos/") and src.exists() and not dst.exists():
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst)


def cmd_check(folder: Path, layout: bool = True) -> bool:
    tr, plan = load(folder)
    if editorial(plan):
        copy_logos(folder, plan)
        return check_editorial(folder, tr, plan, layout)
    dur = tr["media"]["duration"]
    icons = icon_names()
    issues, warns, slots = [], [], []
    scenes = sorted(plan.get("scenes", []), key=lambda s: s.get("start", 0))
    if not scenes: issues.append("broll.json has no scenes")

    def text_len(where, txt, kind):
        if txt and len(str(txt)) > LIMITS[kind]:
            issues.append(f"{where}: '{txt}' is {len(str(txt))} chars, max {LIMITS[kind]} for a {kind}: shorten it")

    def times(where, t, s):
        if t is None: return
        if not (s["start"] - 0.01 <= t <= s["end"] - 0.4):
            issues.append(f"{where}: at {t} is outside the scene ({s['start']}–{s['end']}, last 0.4s excluded)")

    def icon(where, name):
        if name and name.lower() not in icons:
            issues.append(f"{where}: icon '{name}' isn't a lucide icon (see lucide.dev/icons, use the kebab name)")

    prev = None
    for n, s in enumerate(scenes, 1):
        w = f"scene {n} ({s.get('type')} @ {fmt(s.get('start', 0))})"
        t = s.get("type")
        if t not in TYPES: issues.append(f"{w}: unknown type, use one of {', '.join(TYPES)}"); continue
        for k in TYPES[t]:
            if not s.get(k): issues.append(f"{w}: needs '{k}'")
        a, b = s.get("start"), s.get("end")
        if a is None or b is None or b <= a: issues.append(f"{w}: needs start < end"); continue
        if b > dur + 0.01: issues.append(f"{w}: ends at {b}, the cut is {dur:.2f}s")
        if b - a < MIN_SCENE: issues.append(f"{w}: {b - a:.1f}s is too short to read (min {MIN_SCENE}s)")
        if b - a > MAX_SCENE: warns.append(f"{w}: {b - a:.1f}s on one visual; consider splitting")
        if prev and a < prev["end"]: issues.append(f"{w}: overlaps the previous scene (ends {prev['end']})")
        if prev and 0 < a - prev["end"] < 0.5 and (s.get("mode") or "pip") != (prev.get("mode") or "pip"):
            warns.append(f"{w}: {a - prev['end']:.2f}s gap after a scene of the other mode; the face will jump")
        if not s.get("source"): warns.append(f"{w}: no 'source' (what's said here) for the review sheet")
        text_len(w, s.get("title"), "title"); text_len(w, s.get("sub"), "sub"); text_len(w, s.get("label"), "sub")
        if t == "quote": text_len(w, s.get("text"), "quote")
        if t == "stat": times(w, s.get("at"), s)
        if t == "title": times(w, s.get("subAt"), s)
        if t == "quote": times(w, s.get("highlightAt"), s)
        items = s.get("items") or s.get("steps") or []
        for side in ("left", "right"):
            if isinstance(s.get(side), dict):
                text_len(w, s[side].get("label"), "item"); times(w, s[side].get("at"), s)
                items = items + (s[side].get("items") or [])
        firsts = [it.get("at") for it in items if it.get("at") is not None]
        if firsts and min(firsts) - a > 1.5:
            warns.append(f"{w}: only the title shows for {min(firsts) - a:.1f}s before the first item; start the scene later")
        if t in ("checklist", "cards", "flow", "grid") and len(items) >{"checklist": 5, "cards": 4, "flow": 4, "grid": 12}[t]:
            issues.append(f"{w}: {len(items)} items is too many for {t}: split the scene")
        for i, it in enumerate(items, 1):
            iw = f"{w} item {i}"
            text_len(iw, it.get("text"), "item" if t in ("checklist", "versus") else "label")
            text_len(iw, it.get("label"), "label"); text_len(iw, it.get("sub"), "sub")
            times(iw, it.get("at"), s); times(iw, it.get("cross"), s)
            icon(iw, it.get("icon"))
            if isinstance(it.get("swap"), dict): icon(iw, it["swap"].get("icon")); times(iw, it["swap"].get("at"), s)
        if t == "image":
            if not (folder / str(s.get("src", ""))).exists(): slots.append(f"missing-screenshot: {w} needs {s.get('src')} in the folder")
        for i, p in enumerate(s.get("pills") or [], 1):
            text_len(f"{w} pill {i}", p.get("text"), "pill"); times(f"{w} pill {i}", p.get("at"), s)
        prev = s
    covered = sum(s["end"] - s["start"] for s in scenes if "start" in s and "end" in s)
    for m in issues: print("BLOCK:", m)
    for m in slots: print("slot:", m)
    for m in warns: print("warn:", m)
    print(f"{len(scenes)} scenes, b-roll on screen {covered:.0f}s of {dur:.0f}s ({100 * covered / max(dur, 1):.0f}%)."
          + (" OK" if not issues and not slots else f" {len(issues)} blocking, {len(slots)} slots."))
    return not issues and not slots


def make_props(folder: Path, preview: bool = False) -> dict:
    tr, plan = load(folder)
    media = dict(tr["media"])
    if plan.get("duration"): media["duration"] = float(plan["duration"])  # render only part of the cut
    src = find_video(folder).name
    props = {"video": src, "audio": src, "media": media, **{k: v for k, v in plan.items() if k != "video"}}
    if preview: props.update(withAudio=True, faceGuide=True)  # review copy: his audio + the face-box outline
    return props


def write_props(folder: Path, preview: bool = False) -> Path:
    props = make_props(folder, preview)
    path = folder / ".props.json"
    path.write_text(json.dumps(props, ensure_ascii=False), encoding="utf-8")
    return path


def remotion(args: list[str]):
    if not CLI.exists(): sys.exit("Remotion isn't installed: run `npm install` in broll/")
    r = subprocess.run(["node", str(CLI), *args], cwd=APP)
    if r.returncode: sys.exit(f"remotion {args[0]} failed (exit {r.returncode})")


def shoot(folder: Path, props: dict, stills=(), clips=()) -> list[str]:
    """One Remotion bundle for many stills / clip ranges (broll/shoot.mjs). Returns its result lines."""
    if not CLI.exists(): sys.exit("Remotion isn't installed: run `npm install` in broll/")
    job = folder / ".shoot.json"
    job.write_text(json.dumps({"comp": "EditorialMain", "props": props, "publicDir": str(folder),
                               "stills": list(stills), "clips": list(clips)}, ensure_ascii=False), encoding="utf-8")
    r = subprocess.run(["node", "shoot.mjs", str(job)], cwd=APP, capture_output=True, text=True, encoding="utf-8")
    job.unlink(missing_ok=True)
    if r.returncode: sys.exit(f"remotion failed:\n{(r.stderr or r.stdout)[-1500:]}")
    return r.stdout.splitlines()


def scene_frame(s: dict, fps: float, dur: float) -> int:
    """The frame 75% into a scene, when its items have come in."""
    return min(int(round((s["start"] + 0.75 * (s["end"] - s["start"])) * fps)), int(dur * fps) - 1)


def layout_check(folder: Path, plan: dict, scenes: list[dict]) -> list[str]:
    """Render each scene's 75% frame in lint mode (every entrance at its end state) and collect what the page
    measured: text out of its card or off the page, anything under the face box (face: box only), text < 24px."""
    props = make_props(folder)
    props["lint"] = True
    fps, dur = props["media"]["fps"], props["media"]["duration"]
    tmp = folder / ".lint"
    tmp.mkdir(exist_ok=True)
    frames = [scene_frame(s, fps, dur) for s in scenes]
    lines = shoot(folder, props, stills=[{"frame": f, "out": str(tmp / f"{f}.png"), "scale": 0.25} for f in frames])
    shutil.rmtree(tmp, ignore_errors=True)
    found = {int(l.split(" ", 2)[1]): json.loads(l.split(" ", 2)[2]) for l in lines if l.startswith("LINT ")}
    out = []
    for n, (s, f) in enumerate(zip(scenes, frames), 1):
        if f not in found: out.append(f"scene {n}: layout lint didn't report (frame {f})"); continue
        out += [f"scene {n} ({s['type']} @ {fmt(s['start'])}): {m}" for m in found[f]]
    print(f"layout: {len(scenes)} scenes checked at 75%, {len(out)} problems")
    return out


def cmd_sheet(folder: Path):
    """One still per scene (75% in) at 0.25 scale, labelled with its time, in one image: stills/sheet.png."""
    tr, plan = load(folder)
    if not editorial(plan): sys.exit("sheet is for editorial plans; use `still` for the Excalidraw style")
    props = make_props(folder, preview=True)
    fps, dur = props["media"]["fps"], props["media"]["duration"]
    scenes = sorted(plan["scenes"], key=lambda s: s["start"])
    out = folder / "stills"
    tmp = out / ".tiles"
    tmp.mkdir(parents=True, exist_ok=True)
    frames = [scene_frame(s, fps, dur) for s in scenes]
    shoot(folder, props, stills=[{"frame": f, "out": str(tmp / f"{n}.png"), "scale": 0.25} for n, f in enumerate(frames)])
    cols, W, H, LH = min(4, len(scenes)), 480, 270, 36
    inputs, chains, layout = [], [], []
    for n, (s, f) in enumerate(zip(scenes, frames)):
        t = f / fps
        label = f"{n + 1}   {int(t // 60)}m{t % 60:04.1f}s   {s['type']}" + ("" if face_box(s, plan) else "   face hidden")
        inputs += ["-i", str(tmp / f"{n}.png")]
        # drawtext runs with cwd = assets/fonts so the font path needs no Windows drive escaping
        chains.append(f"[{n}:v]pad={W}:{H + LH}:0:0:color=white,drawtext=fontfile=TeXGyreHeros-Regular.otf:"
                      f"text='{label}':x=12:y={H + 8}:fontsize=22:fontcolor=black[v{n}]")
        layout.append(f"{(n % cols) * W}_{(n // cols) * (H + LH)}")
    if len(scenes) > 1:
        tiles = "".join(f"[v{n}]" for n in range(len(scenes)))
        graph = ";".join(chains) + f";{tiles}xstack=inputs={len(scenes)}:layout={'|'.join(layout)}:fill=white[out]"
    else:
        graph = chains[0].replace("[v0]", "[out]")
    sheet = out / "sheet.png"
    r = subprocess.run([ffmpeg(), "-v", "error", "-y", *inputs, "-filter_complex", graph, "-map", "[out]",
                        "-frames:v", "1", "-update", "1", str(sheet)], cwd=ROOT / "assets" / "fonts", capture_output=True, text=True)
    shutil.rmtree(tmp, ignore_errors=True)
    if r.returncode: sys.exit(f"ffmpeg sheet failed:\n{r.stderr[-800:]}")
    print(f"wrote {sheet.relative_to(ROOT)} ({len(scenes)} scenes)")


def slug(s: dict) -> str:
    """File-name slug for a scene: `slug` if set, else its headline / title / file name / first tile / first pill."""
    first = lambda k, f: s[k][0].get(f) if isinstance(s.get(k), list) and s[k] else None
    txt = (s.get("slug") or s.get("headline") or s.get("title") or s.get("name") or (s.get("doc") or {}).get("name")
           or first("tiles", "label") or first("pills", "text") or s["type"])
    words = re.sub(r"[^a-z0-9]+", " ", str(txt).lower().replace(".md", "")).split()
    return "-".join(words[:4]) or s["type"]


def clip_runs(plan: dict) -> list[list[dict]]:
    """spot: one clip per scene; full: scenes less than 1.2s apart share a clip."""
    scenes = sorted(plan["scenes"], key=lambda s: s["start"])
    if coverage(plan) == "spot": return [[s] for s in scenes]
    runs = []
    for s in scenes:
        if runs and s["start"] - runs[-1][-1]["end"] < 1.2: runs[-1].append(s)
        else: runs.append([s])
    return runs


def cmd_clips(folder: Path):
    """clips/<02m14s-slug>.mp4: silent, one per insert (spot) or continuous run (full), 0.25s fade in/out."""
    _, plan = load(folder)
    props = make_props(folder)
    fps = props["media"]["fps"]
    out = folder / "clips"
    out.mkdir(exist_ok=True)
    for old in out.glob("*.mp4"):
        if re.match(r"\d+m\d\ds-", old.name): old.unlink()  # earlier clips of this job (names follow the plan)
    jobs, names = [], set()
    for run in clip_runs(plan):
        a, b = run[0]["start"], run[-1]["end"]
        name = f"{int(a // 60):02d}m{int(a % 60):02d}s-{slug(run[0])}"
        while name in names: name += "-2"
        names.add(name)
        f0, f1 = int(round(a * fps)), int(round(b * fps))
        jobs.append({"from": f0, "to": f1 - 1, "out": str(out / f".raw-{name}.mp4"), "name": name, "dur": (f1 - f0) / fps})
    t0 = time.time()
    shoot(folder, props, clips=jobs)
    for j in jobs:
        raw, dst, d = Path(j["out"]), out / f"{j['name']}.mp4", j["dur"]
        r = subprocess.run([ffmpeg(), "-v", "error", "-y", "-i", str(raw), "-an",
                            "-vf", f"fade=t=in:st=0:d=0.25,fade=t=out:st={d - 0.25:.3f}:d=0.25",
                            "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", "-color_primaries", "bt709",
                            "-color_trc", "bt709", "-colorspace", "bt709", str(dst)], capture_output=True, text=True)
        raw.unlink(missing_ok=True)
        if r.returncode: sys.exit(f"ffmpeg fade failed for {dst.name}:\n{r.stderr[-800:]}")
        print(f"   {dst.relative_to(ROOT)}  {d:.2f}s")
    print(f"wrote {len(jobs)} clips in {(time.time() - t0) / 60:.1f} min")


def cmd_still(folder: Path, ts: list[float]):
    tr, plan = load(folder)
    fps = tr["media"]["fps"]
    if not ts:  # middle of each scene, after its items have come in
        ts = [round(s["start"] + 0.75 * (s["end"] - s["start"]), 2) for s in plan["scenes"]]
    props = write_props(folder, preview=True)
    comp = "EditorialMain" if editorial(plan) else "Main"
    dur = float(plan.get("duration") or tr["media"]["duration"])
    out = folder / "stills"
    out.mkdir(exist_ok=True)
    for t in ts:
        f = min(int(round(t * fps)), int(dur * fps) - 1)
        png = out / f"{fmt(t).replace(':', 'm')}s.png"
        remotion(["still", "src/index.ts", comp, str(png), f"--frame={f}", f"--props={props}",
                  f"--public-dir={folder}", "--scale=0.5", "--log=error"])
        print("  ", png.relative_to(ROOT))


def cmd_render(folder: Path, draft: bool, preview: bool = False, clips: bool = False):
    if not cmd_check(folder): sys.exit("fix the blocking issues / slots above, then render")
    _, plan = load(folder)
    ed = editorial(plan)
    if clips:
        if not ed: sys.exit("--clips is for editorial plans")
        return cmd_clips(folder)
    props = write_props(folder, preview=preview)
    # editorial: broll.mp4 = silent b-roll for Google Vids; preview.mp4 = with his audio + face-box outline, to review
    name = ("preview.mp4" if preview else "broll.mp4") if ed else ("final-draft.mp4" if draft else "final.mp4")
    comp = "EditorialMain" if ed else "Main"
    args = ["render", "src/index.ts", comp, str(folder / name), f"--props={props}", f"--public-dir={folder}",
            "--codec=h264", "--crf=18", "--audio-codec=aac", "--audio-bitrate=192k",
            "--color-space=bt709",  # keeps skin tones the same as the camera file
            f"--concurrency={max(1, (os.cpu_count() or 4) - 2)}"]
    if draft: args += ["--scale=0.5", "--crf=26"]
    t0 = time.time()
    remotion(args)
    print(f"wrote {(folder / name).relative_to(ROOT)} in {(time.time() - t0) / 60:.1f} min")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("cmd", choices=["transcribe", "find", "snap", "check", "still", "sheet", "render"])
    ap.add_argument("folder")
    ap.add_argument("rest", nargs="*")
    ap.add_argument("--model", default="small", help="whisper model: base / small / medium (slower, more accurate)")
    ap.add_argument("--language", default="en")
    ap.add_argument("--draft", action="store_true")
    ap.add_argument("--preview", action="store_true", help="editorial: render preview.mp4 with audio + face-box outline")
    ap.add_argument("--clips", action="store_true", help="editorial: one silent clip per insert / run into clips/")
    ap.add_argument("--len", type=float, default=10, help="snap: target insert length in seconds")
    ap.add_argument("--no-layout", action="store_true", help="check: skip the rendered layout lint (faster)")
    a = ap.parse_args()
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # Windows consoles default to cp1252
    folder = (ROOT / a.folder) if not Path(a.folder).is_absolute() else Path(a.folder)
    if not folder.is_dir(): sys.exit(f"no folder {folder}")
    if a.cmd == "transcribe": cmd_transcribe(folder, a.model, a.language or None)
    elif a.cmd == "find": cmd_find(folder, " ".join(a.rest))
    elif a.cmd == "snap": cmd_snap(folder, a.rest, a.len)
    elif a.cmd == "check": sys.exit(0 if cmd_check(folder, not a.no_layout) else 1)
    elif a.cmd == "still": cmd_still(folder, [float(x) for x in a.rest])
    elif a.cmd == "sheet": cmd_sheet(folder)
    elif a.cmd == "render": cmd_render(folder, a.draft, a.preview, a.clips)


if __name__ == "__main__":
    main()
