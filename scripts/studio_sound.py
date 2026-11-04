"""Sound layer for studio mode: SFX cues + a music bed under Ajay's voice, mixed and mastered onto a render.

    python scripts/studio_sound.py videos/<job>/studio/studio.json <render.mp4> <out.mp4> [--music file.wav]

Plan and levels: .claude/skills/broll-video/sound.md. Cues come from studio.json (layout changes, counts, rows,
rings, typing, flags), thinned to the budget there. The SFX are synthesized here (no licence, no Content ID risk)
and cached in assets/sfx/. The music bed is synthesized too unless --music gives a track (YouTube Audio Library,
Epidemic Commercial...). Mix: bed ducked under the voice (sidechaincompress), + SFX, two-pass loudnorm to
-14 LUFS / -1 dBTP, video stream copied. Writes cues.md beside out.mp4 for review.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from broll import ffmpeg  # noqa: E402  (same ffmpeg lookup as the rest of the pipeline)

ROOT = Path(__file__).resolve().parent.parent
SFX_DIR = ROOT / "assets" / "sfx"
SR = 48000
LEAD, MOVE = 0.15, 0.55  # Studio.tsx: a layout change starts LEAD before its word and takes MOVE


# ---------- synthesis ----------

def t_(dur: float) -> np.ndarray:
    return np.arange(int(dur * SR)) / SR


def norm(x: np.ndarray) -> np.ndarray:
    return x / (np.max(np.abs(x)) + 1e-9)


def fft_filter(x: np.ndarray, lo: float = 0, hi: float = SR / 2, tilt: float = 0) -> np.ndarray:
    """Static band-pass (brick-wall with soft 1-octave edges) and an optional spectral tilt (dB/octave)."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR) + 1e-3
    g = np.ones_like(f)
    if lo > 0: g *= np.clip(np.log2(f / lo) + 1, 0, 1)
    if hi < SR / 2: g *= np.clip(1 - np.log2(f / hi), 0, 1)
    if tilt: g *= (f / 1000) ** (tilt / 6.02)
    return np.fft.irfft(X * g, len(x))


def sweep_bp(x: np.ndarray, f0: float, f1: float, q: float = 0.7) -> np.ndarray:
    """State-variable band-pass whose centre glides f0 → f1 (exponentially) over the sound."""
    n = len(x)
    fc = f0 * (f1 / f0) ** (np.arange(n) / n)
    F = 2 * np.sin(np.pi * np.minimum(fc, SR / 6) / SR)
    lp = bp = 0.0
    out = np.empty(n)
    for i in range(n):
        hp = x[i] - lp - q * bp
        bp += F[i] * hp
        lp += F[i] * bp
        out[i] = bp
    return out


def reverb(x: np.ndarray, dur: float = 0.8, mix: float = 0.18, seed: int = 3) -> np.ndarray:
    rng = np.random.default_rng(seed)
    ir = rng.standard_normal(int(dur * SR)) * np.exp(-t_(dur) / (dur / 6))
    ir = fft_filter(ir, hi=6000)
    wet = np.fft.irfft(np.fft.rfft(x, len(x) + len(ir)) * np.fft.rfft(ir, len(x) + len(ir)))[: len(x) + len(ir)]
    out = np.zeros(len(wet)); out[: len(x)] = x
    return out + mix * norm(wet) * np.max(np.abs(x))


def pink(n: int, seed: int) -> np.ndarray:
    return norm(fft_filter(np.random.default_rng(seed).standard_normal(n), tilt=-3))


def make_sfx() -> dict[str, np.ndarray]:
    s: dict[str, np.ndarray] = {}
    # pop: 620 → 300 Hz sine drop, 3ms attack, ~30ms decay, a touch of 2nd harmonic
    t = t_(0.14); f = 300 + 320 * np.exp(-t / 0.02); ph = 2 * np.pi * np.cumsum(f) / SR
    s["pop"] = norm((np.sin(ph) + 0.2 * np.sin(2 * ph)) * np.minimum(t / 0.003, 1) * np.exp(-t / 0.03))
    # tick: 4ms high-passed noise burst + a short 3 kHz ping
    t = t_(0.05); rng = np.random.default_rng(1)
    s["tick"] = norm(fft_filter(rng.standard_normal(len(t)), lo=2000) * np.exp(-t / 0.004) + 0.4 * np.sin(2 * np.pi * 3000 * t) * np.exp(-t / 0.006))
    # whooshes: pink noise through a gliding band-pass, Hann-ish envelope peaking at 60%
    n = int(0.5 * SR); u = np.arange(n) / n
    envw = np.where(u < 0.6, np.sin(np.pi / 2 * u / 0.6) ** 2, np.cos(np.pi / 2 * (u - 0.6) / 0.4) ** 2)
    s["whoosh-up"] = norm(reverb(sweep_bp(pink(n, 2), 300, 2600) * envw, 0.5, 0.12))
    s["whoosh-down"] = norm(reverb(sweep_bp(pink(n, 4), 2600, 300) * envw, 0.5, 0.12))
    # thump: 70 → 45 Hz body with a soft low-passed click on top
    t = t_(0.7); f = 45 + 25 * np.exp(-t / 0.05); ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.minimum(t / 0.004, 1) * np.exp(-t / 0.22)
    click = fft_filter(np.random.default_rng(5).standard_normal(len(t)), hi=1800) * np.exp(-t / 0.008) * 0.25
    s["thump"] = norm(body + click)
    # hit: thump plus a warm noise tail, for the end of a count
    tail = fft_filter(pink(len(t), 6), lo=150, hi=3500) * np.exp(-t / 0.18) * 0.35
    s["hit"] = norm(reverb(body + click + tail, 0.9, 0.2))
    # swish: a marker stroke, band-limited noise with a little wobble
    t = t_(0.45); u = t / 0.45
    s["swish"] = norm(fft_filter(np.random.default_rng(7).standard_normal(len(t)), lo=1800, hi=6000)
                      * np.sin(np.pi * u) ** 1.5 * (0.75 + 0.25 * np.sin(2 * np.pi * 14 * t)))
    # key: a soft key click
    t = t_(0.035)
    s["key"] = norm(fft_filter(np.random.default_rng(8).standard_normal(len(t)), lo=1200, hi=7000) * np.exp(-t / 0.003)
                    + 0.3 * np.sin(2 * np.pi * 1800 * t) * np.exp(-t / 0.005))
    # tone2: muted two-note descending (A4 → F4), soft triangle-ish, low-passed
    def note(fr: float, d: float) -> np.ndarray:
        tt = t_(d); ph = 2 * np.pi * fr * tt
        return (np.sin(ph) + 0.12 * np.sin(3 * ph)) * np.minimum(tt / 0.006, 1) * np.exp(-tt / 0.09)
    a, b = note(440, 0.16), note(349.2, 0.32)
    s["tone2"] = norm(reverb(fft_filter(np.concatenate([a, b]), hi=2500), 0.6, 0.15))
    return s


def music_bed(dur: float, seed: int = 11) -> np.ndarray:
    """Minimal ambient pulse, 96 BPM in F: warm pads, soft sine bass, a sparse pluck, soft kick, quiet shaker."""
    beat = 60 / 96; bar = 4 * beat
    n = int(dur * SR) + SR
    out = np.zeros(n)
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    chords = [  # (bass, pad notes) — Fmaj7, Am7, Dm9, Bbmaj7; two bars each
        (41, [53, 57, 60, 64]), (45, [57, 60, 64, 67]), (38, [50, 53, 57, 60, 64]), (46, [58, 62, 65, 69])]
    rng = np.random.default_rng(seed)

    def place(x: np.ndarray, at: float, g: float = 1.0) -> None:
        i = int(at * SR)
        if i >= n: return
        m = min(len(x), n - i); out[i:i + m] += g * x[:m]

    seg = 2 * bar
    k = 0
    while k * seg < dur + seg:
        bass, pad = chords[k % 4]
        t = t_(seg + 1.5)
        env = np.minimum(t / 0.9, 1) * np.clip((seg + 1.5 - t) / 1.5, 0, 1)
        p = np.zeros(len(t))
        for m in pad:
            for det in (-0.06, 0.06):  # two slightly detuned voices per note
                ph = 2 * np.pi * hz(m) * 2 ** (det / 12) * t + rng.uniform(0, 6.28)
                p += sum(np.sin(h * ph) / h ** 1.8 for h in range(1, 6))
        place(fft_filter(p * env, hi=1600) / len(pad), k * seg, 0.16)
        tb = t_(seg)
        place(np.sin(2 * np.pi * hz(bass) * tb) * np.minimum(tb / 0.05, 1) * np.clip((seg - tb) / 0.3, 0, 1), k * seg, 0.22)
        for j, (off, m) in enumerate([(0, pad[-1] + 12), (1.5, pad[-2] + 12), (3, pad[1] + 12), (5, pad[-1] + 12), (6.5, pad[0] + 12)]):
            tp = t_(1.2); ph = 2 * np.pi * hz(m) * tp
            place((np.sin(ph) + 0.15 * np.sin(2 * ph)) * np.minimum(tp / 0.004, 1) * np.exp(-tp / 0.35), k * seg + off * beat, 0.07)
        k += 1
    kick_t = t_(0.4); kf = 48 + 60 * np.exp(-kick_t / 0.03)
    kick = np.sin(2 * np.pi * np.cumsum(kf) / SR) * np.exp(-kick_t / 0.12)
    shk = fft_filter(np.random.default_rng(9).standard_normal(int(0.06 * SR)), lo=5000) * np.exp(-t_(0.06) / 0.015)
    b = 0
    while b * beat < dur:
        if b >= 8 and b % 2 == 0: place(kick, b * beat, 0.30)  # kick from bar 3, on 1 and 3
        if b >= 8: place(shk, b * beat + beat / 2, 0.035)
        b += 1
    out = reverb(out, 1.6, 0.22)[: int(dur * SR)]
    return out / (np.sqrt(np.mean(out ** 2)) + 1e-9)  # unit RMS; level set in the mix


# ---------- cues ----------

def cues_for(plan: dict) -> list[tuple[float, str, float, str]]:
    """(time, sound, dB below the voice peak, why). Budget: structure only — see sound.md."""
    c: list[tuple[float, str, float, str]] = []
    lay = sorted(plan["layouts"], key=lambda l: l["start"])
    # a reel hard-cuts its layouts and places its whooshes itself (`cue` scenes): "layoutWhoosh": false
    for a, b in (zip(lay, lay[1:]) if plan.get("layoutWhoosh", True) else []):
        if (a["mode"] == "full") != (b["mode"] == "full"):  # full ↔ tile/card only; tile ↔ tile stays silent
            land = b["start"] - LEAD + MOVE
            c.append((land - 0.3, "whoosh-up" if b["mode"] == "full" else "whoosh-down", 17, f"{a['mode']} → {b['mode']}"))
    for s in plan["scenes"]:
        if s.get("sfx") is False: continue
        ty = s["type"]
        if ty == "cue":  # an explicit sound: {at, sound, db?, why?}
            c.append((s["at"], s["sound"], s.get("db", 17), s.get("why", "cue")))
        elif ty == "words":
            lines = s["lines"]
            if any(l.get("kicker") and re.match(r"^\d+\s*/\s*\d+$", l["text"]) for l in lines):
                first = next(l for l in lines if not l.get("kicker"))
                c.append((first["at"], "thump", 11, f"section: {first['text']}"))
            for l in lines:
                if not l.get("kicker") and l.get("size", 96) >= 150:
                    c.append((l["at"], "thump", 11, f"big line: {l['text']}"))
        elif ty in ("count", "places"):
            at = s["at"]; tt, gap = at, 0.075
            while tt < at + 0.95:  # ticks that slow down with the count (75ms apart, widening), fading out
                c.append((tt, "tick", 21 + 6 * (tt - at), "count"))
                tt += gap; gap *= 1.22
            c.append((at + 1.1, "hit", 10, f"count lands: {s.get('slug')}"))
        elif ty in ("list", "points") and s.get("rows"):
            c.append((s["rows"][0]["at"], "pop", 17, f"first row: {s['rows'][0]['text']}"))
        elif ty == "type":  # a hard cut to a full-screen card: the section-start pair
            at = s.get("at", s["start"])
            c.append((at - 0.3, "whoosh-up", 15, f"type card: {s.get('slug')}"))
            c.append((at, "thump", 11, f"type card: {s['line']}"))
        elif ty == "trio" and s.get("cards"):
            c.append((s["cards"][0]["at"], "pop", 17, f"first card: {s['cards'][0]['word']}"))
        elif ty == "gallery" and s.get("items"):
            c.append((s["items"][0]["at"], "pop", 18, f"first thumbnail: {s.get('slug')}"))
        elif ty == "spine":
            c.append((s["at"], "tick", 16, "outline row"))
        elif ty == "shot" and s.get("ring"):
            c.append((s["ring"]["at"] - 0.05, "swish", 19, "ring drawn"))
        elif ty == "chat":
            q, q0, qd = s["q"], s["qAt"], s.get("qDur", 1.4)
            for i in range(0, len(q), 2):
                if q[i] != " ": c.append((q0 + qd * i / len(q), "key", 22, "typing"))
            c.append((s["flagAt"], "tone2", 13, f"flag: {s.get('flagText')}"))
        # the picture-per-idea scenes (scenes-idea.tsx, 2026-10-30): one sound for the thing the scene does
        elif ty == "flap":
            for st in s["steps"]:  # the board clattering through its letters
                for k in range(12): c.append((st["at"] + 0.03 * k, "tick", 23 + k * 0.4, "flap board"))
        elif ty == "odometer":
            at, d = s["at"], s.get("dur", 1.8); tt, gap = at, 0.06
            while tt < at + d * 0.85:
                c.append((tt, "tick", 22, "odometer")); tt += gap; gap *= 1.12
            c.append((at + d, "hit", 11, f"odometer lands: {s['to']}"))
        elif ty == "callouts":
            for it in s["items"]: c.append((it["at"], "swish", 20, f"callout: {it['text']}"))
        elif ty == "calendar":
            if s.get("posts"): c.append((s["posts"]["at"], "pop", 18, "posts fill the month"))
            if s.get("strikeAt") is not None: c.append((s["strikeAt"], "swish", 16, "crossed out"))
            if s.get("mark"): c.append((s["mark"]["at"], "swish", 18, "day circled"))
            if s.get("zoomAt") is not None: c.append((s["zoomAt"], "whoosh-down", 18, "month → decade"))
        elif ty == "ad":
            c.append((s["at"], "tone2", 14, "ad chrome"))
        elif ty == "journal":
            if s.get("recAt") is not None: c.append((s["recAt"], "tone2", 15, "REC"))
        elif ty == "phone":
            if s.get("mode") == "rec":
                c.append((s["recAt"], "key", 14, "record button"))
                c.append((s["publishAt"] + 1.35, "tone2", 14, "published"))
            elif s.get("mode") == "call":
                c.append((s["start"] + 0.4, "tone2", 13, "incoming call"))
        elif ty == "radar":
            c.append((s["axes"][0]["at"], "pop", 18, "radar"))
        elif ty == "receipt":
            for it in s["items"]: c.append((it["at"], "key", 20, "receipt line"))
            if s.get("total"): c.append((s["total"]["at"], "hit", 13, "receipt total"))
        elif ty == "morph":
            c.append((s["morphAt"], "swish", 15, "morph"))
        elif ty == "shelf":
            c.append((s["books"][0]["at"], "pop", 18, "first spine"))
        elif ty == "search":
            p0 = s["panels"][0]
            for i in range(0, len(s["query"]), 2): c.append((p0["at"] + 0.7 * i / len(s["query"]), "key", 22, "typing"))
    # a whoosh that lands on top of a count gets dropped: the count's ticks and hit already carry that moment
    counts = [s["at"] for s in plan["scenes"] if s["type"] in ("count", "places")]
    c = [x for x in c if not (x[1].startswith("whoosh") and any(abs(x[0] + 0.3 - a) < 0.6 for a in counts))]
    # a layout change hidden behind a full-screen type card is never seen, so it is never heard
    cards = [(s["start"], s["end"]) for s in plan["scenes"] if s["type"] == "type"]
    c = [x for x in c if not (x[1].startswith("whoosh") and x[3] and "→" in x[3]
                              and any(a - 0.4 <= x[0] + 0.3 <= b for a, b in cards))]
    # a board's first-row pop right after its layout whoosh is one moment, not two: the whoosh already marked it
    loud = sorted(x[0] for x in c if x[1] not in ("pop", "tick"))
    c = [x for x in c if not (x[1] == "pop" and any(abs(x[0] - t) < 1.0 for t in loud))]
    # two whooshes inside 1.2s read as one move: keep the first
    kept: list[tuple[float, str, float, str]] = []
    for x in sorted(c):
        if x[1].startswith("whoosh") and any(y[1].startswith("whoosh") and x[0] - y[0] < 1.2 for y in kept):
            continue
        kept.append(x)
    return kept


def music_env(plan: dict, dur: float) -> np.ndarray:
    """Bed automation (gain, linear): silent on the cold-open line, +3 dB on full-frame breathers,
    dipped under each count's landing, fading out at the end."""
    t = np.arange(int(dur * SR)) / SR
    lay = sorted(plan["layouts"], key=lambda l: l["start"])
    first = lay[1]["start"] if len(lay) > 1 else 3.0
    g = np.clip((t - (first - 0.4)) / 1.2, 0, 1)
    if plan.get("coldOpen") is False:  # reels: the bed runs from 0.0 (Nick's reels, 49/49)
        g = np.clip(t / 0.3, 0, 1)
    db = np.zeros_like(t)
    for a, b in zip(lay, lay[1:] + [{"start": dur}]):
        if a["mode"] == "full" and a["start"] > 0:
            db += 3 * np.clip((t - a["start"]) / 0.5, 0, 1) * np.clip((b["start"] - t) / 0.5, 0, 1)
    for s in plan["scenes"]:
        if s["type"] in ("count", "places"):
            db -= 8 * np.clip((t - (s["at"] - 0.2)) / 0.3, 0, 1) * np.clip((s["at"] + 1.9 - t) / 0.6, 0, 1)
    g *= np.clip((dur - t) / 2.0, 0, 1)
    return g * 10 ** (db / 20)


# ---------- io ----------

def write_wav(path: Path, x: np.ndarray) -> None:
    x = np.clip(x, -1, 1)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype("<i2").tobytes())


def read_wav(path: Path) -> np.ndarray:
    with wave.open(str(path)) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), "<i2").astype(float) / 32767
        if w.getnchannels() == 2: x = x.reshape(-1, 2).mean(1)
        return x


def voice_stats(video: Path) -> tuple[float, float]:
    """(integrated LUFS, sample peak dBFS) of the render's audio."""
    r = subprocess.run([ffmpeg(), "-hide_banner", "-i", str(video), "-vn", "-af", "ebur128=peak=sample", "-f", "null", "-"],
                       capture_output=True, text=True)
    i = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)[-1])
    pk = float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", r.stderr)[-1])
    return i, pk


def lufs(x: np.ndarray, tmp: Path) -> float:
    write_wav(tmp, x * 0.5)
    r = subprocess.run([ffmpeg(), "-hide_banner", "-i", str(tmp), "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True)
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)[-1]) + 6.02  # undo the 0.5


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("plan"); ap.add_argument("video"); ap.add_argument("out")
    ap.add_argument("--music", help="a music track to use instead of the synthesized bed (wav)")
    ap.add_argument("--bed", type=float, default=18, help="music bed, LU below the voice before ducking")
    a = ap.parse_args()
    plan = json.load(open(a.plan, encoding="utf-8"))
    video, out = Path(a.video), Path(a.out)
    work = out.parent / "sound"; work.mkdir(parents=True, exist_ok=True)

    SFX_DIR.mkdir(parents=True, exist_ok=True)
    if not all((SFX_DIR / f"{k}.wav").exists() for k in ["pop", "tick", "whoosh-up", "whoosh-down", "thump", "hit", "swish", "key", "tone2"]):
        for k, x in make_sfx().items(): write_wav(SFX_DIR / f"{k}.wav", x * 0.89)
    sfx = {p.stem: norm(read_wav(p)) for p in SFX_DIR.glob("*.wav")}

    v_lufs, v_peak = voice_stats(video)
    dur = float(plan["media"]["duration"])
    n = int(dur * SR)

    stem = np.zeros(n + SR)
    cues = cues_for(plan)
    for at, name, below, _ in cues:
        i = max(0, int(at * SR)); x = sfx[name] * 10 ** ((v_peak - below) / 20)
        stem[i:i + len(x)] += x[: len(stem) - i]
    write_wav(work / "sfx.wav", stem[:n])

    bed = read_wav(Path(a.music))[:n] if a.music else music_bed(dur)
    bed = np.pad(bed, (0, max(0, n - len(bed))))[:n]
    bed *= 10 ** (((v_lufs - a.bed) - lufs(bed, work / "_m.wav")) / 20)
    write_wav(work / "music.wav", bed * music_env(plan, dur))
    (work / "_m.wav").unlink(missing_ok=True)

    fmt = "aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo"
    graph = (f"[0:a]{fmt},asplit=2[v][sc];[1:a]{fmt}[mu];[2:a]{fmt}[fx];"
             "[mu][sc]sidechaincompress=threshold=0.04:ratio=4:attack=80:release=800[duck];"
             "[v][duck][fx]amix=inputs=3:normalize=0:duration=first[mix]")
    ins = ["-i", str(video), "-i", str(work / "music.wav"), "-i", str(work / "sfx.wav")]
    r = subprocess.run([ffmpeg(), "-hide_banner", *ins, "-filter_complex", graph + ";[mix]loudnorm=I=-14:TP=-1:LRA=11:print_format=json",
                        "-f", "null", "-"], capture_output=True, text=True)
    m = json.loads(r.stderr[r.stderr.rindex("{"):r.stderr.rindex("}") + 1])
    ln = (f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
          f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    r = subprocess.run([ffmpeg(), "-v", "error", "-y", *ins, "-filter_complex", graph + f";[mix]{ln},aresample=48000[a]",
                        "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", str(out)], capture_output=True, text=True)
    if r.returncode: sys.exit(f"mix failed:\n{r.stderr[-800:]}")

    lines = [f"# Sound cues — {out.name}", "", f"Voice {v_lufs:.1f} LUFS in, master -14 LUFS / -1 dBTP. "
             f"Music: {'`' + a.music + '`' if a.music else 'synthesized bed (96 BPM, F)'}, {a.bed:.0f} LU under the voice, ducked while he talks.",
             f"{len([c for c in cues if c[1] not in ('key', 'tick')])} cues (+ ticks/keys) in {dur:.1f}s.", "",
             "| time | sound | dB under voice peak | why |", "|---|---|---|---|"]
    lines += [f"| {at:.2f} | {nm} | {b:.0f} | {why} |" for at, nm, b, why in cues if nm not in ("key",)]
    (out.parent / f"{out.stem}-cues.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"OK {out}  ({len(cues)} cues, voice {v_lufs:.1f} LUFS -> -14)")


if __name__ == "__main__":
    main()
