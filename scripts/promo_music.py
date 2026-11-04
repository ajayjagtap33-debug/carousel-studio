"""Original promo track + sound cues for broll/src/promo/Promo.tsx (29s, 120 BPM, A minor, all synthesized: no licence to clear).

    python scripts/promo_music.py videos/<folder>/public            # writes music.wav (+ music-notes.md beside it)

Cuts of the video are on whole seconds (4, 11, 16, 20, 25), which are beats 1 or 3 of a 2s bar, so the accents below
line up with the wipes. The cue times mirror the animation frames in Promo.tsx: change both together.
Structure: 0-4 tension (pad, sub pulse, ticking hats, riser) / 4 drop (four on the floor, clap on 2+4, bass, pluck arp)
/ 24-25 snare roll + riser, drums out / 25 impact on the end card / 25-29 soft resolve, fade at the end.
"""
import re
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from broll import ffmpeg  # noqa: E402
from studio_sound import SR, fft_filter, norm, pink, read_wav, reverb, t_  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SFX = ROOT / "assets" / "sfx"
DUR, BPM = 29.0, 120
BEAT = 60 / BPM
TARGET_LUFS = -16.0  # a homepage video, usually muted: if someone unmutes it should not shout

# one chord per 2s bar, bars 0..14: Am F C G x3, then F C C for the end card
CHORDS = [("A", 45, (0, 3, 7)), ("F", 41, (0, 4, 7)), ("C", 48, (0, 4, 7)), ("G", 43, (0, 4, 7))] * 3 + [("F", 41, (0, 4, 7)), ("C", 48, (0, 4, 7)), ("C", 48, (0, 4, 7))]


def hz(m: float) -> float:
    return 440 * 2 ** ((m - 69) / 12)


def place(buf: np.ndarray, x: np.ndarray, at: float, g: float = 1.0) -> None:
    i = int(at * SR)
    if i < 0: x, i = x[-i:], 0
    if i >= len(buf): return
    x = x[: len(buf) - i]
    buf[i : i + len(x)] += x * g


def env(n: int, a: float, d: float) -> np.ndarray:
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)


def kick() -> np.ndarray:
    t = t_(0.5)
    f = 48 + 120 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t / 0.16) + 0.25 * np.sin(2 * np.pi * 1800 * t) * np.exp(-t / 0.004)


def clap(seed: int) -> np.ndarray:
    n = int(0.28 * SR)
    x = fft_filter(np.random.default_rng(seed).standard_normal(n), lo=900, hi=7000)
    e = np.zeros(n)
    for k, off in enumerate((0, 0.011, 0.022)):
        i = int(off * SR); e[i:] += np.exp(-np.arange(n - i) / SR / 0.012) * (0.6 if k < 2 else 1)
    e += 0.5 * np.exp(-np.arange(n) / SR / 0.09)
    return norm(x * e)


def hat(seed: int, d: float = 0.04) -> np.ndarray:
    n = int(0.12 * SR)
    return fft_filter(np.random.default_rng(seed).standard_normal(n), lo=6500) * np.exp(-np.arange(n) / SR / d)


def bass(m: float, dur: float) -> np.ndarray:
    t = t_(dur)
    saw = 2 * ((t * hz(m)) % 1) - 1
    x = 0.7 * np.sin(2 * np.pi * hz(m) * t) + 0.3 * fft_filter(saw, hi=420)
    return x * np.minimum(1, t / 0.01) * np.exp(-t / (dur * 0.9))


def pluck(m: float) -> np.ndarray:
    t = t_(0.32)
    x = sum(a * (2 * ((t * hz(m) * k) % 1) - 1) for a, k in ((0.6, 1), (0.4, 1.005))) + 0.3 * np.sin(2 * np.pi * hz(m + 12) * t)
    return fft_filter(x, hi=3800) * env(len(t), 0.003, 0.09)


def pad(m_root: int, ints: tuple, dur: float) -> np.ndarray:
    t = t_(dur)
    x = np.zeros_like(t)
    for iv in ints:
        for det in (-0.07, 0.0, 0.07):
            f = hz(m_root + 24 + iv + det)
            x += (2 * ((t * f) % 1) - 1) * 0.12 + np.sin(2 * np.pi * f * t) * 0.1
    x = fft_filter(x, hi=1500)
    return x * np.minimum(1, t / 0.5) * np.minimum(1, (dur - t) / 0.4)


def riser(dur: float, seed: int) -> np.ndarray:
    n = int(dur * SR)
    x = np.random.default_rng(seed).standard_normal(n)
    out = np.zeros(n)
    # cheap rising band: crossfade through four fixed bands
    for k, (lo, hi) in enumerate(((300, 900), (800, 2200), (2000, 5000), (4500, 12000))):
        w = np.clip(np.linspace(0, 4, n) - k, 0, 1) * np.clip(5 - np.linspace(0, 4, n) + k, 0, 1)
        out += fft_filter(x, lo=lo, hi=hi) * w
    return norm(out) * np.linspace(0.05, 1, n) ** 2


def impact() -> np.ndarray:
    t = t_(1.6)
    boom = np.sin(2 * np.pi * np.cumsum(38 + 90 * np.exp(-t / 0.12)) / SR) * np.exp(-t / 0.55)
    crash = fft_filter(np.random.default_rng(9).standard_normal(len(t)), lo=3000) * np.exp(-t / 0.45) * 0.5
    return reverb(boom * 0.9 + crash, 0.9, 0.2)[: len(t)]


def sfx(name: str) -> np.ndarray:
    return read_wav(SFX / f"{name}.wav")


def build() -> np.ndarray:
    L = np.zeros(int(DUR * SR)); R = np.zeros_like(L)

    def both(x, at, g=1.0, width=0.0):
        place(L, x, at, g * (1 - width)); place(R, x, at, g * (1 + width))

    DROP, OUT, HIT = 4.0, 24.0, 25.0  # the groove starts at the first cut, drums drop out a second before the end card
    # pad: the whole piece, one chord a bar
    for b, (_, root, ints) in enumerate(CHORDS):
        both(pad(root, ints, 2.1), b * 2 - 0.05, 0.55 if b < 12 else 0.7)
    # tension 0-4: sub pulse on the beat, ticking hats, a riser into the drop
    for k in range(int(DROP / BEAT)):
        both(bass(33, 0.4), k * BEAT, 0.5)
    for k in range(int(DROP / BEAT) * 2):
        both(hat(k, 0.02), k * BEAT / 2, 0.12 + 0.012 * k)
    both(riser(1.4, 3), DROP - 1.4, 0.35)
    # the groove
    for k in range(int(DROP / BEAT), int(OUT / BEAT)):
        t = k * BEAT
        both(kick(), t, 0.95)
        if k % 4 in (1, 3): both(clap(k), t, 0.45)
        both(hat(k, 0.03), t + BEAT / 2, 0.22)
        if k % 2: both(hat(k + 99, 0.018), t, 0.1)
    # bass: root on each off-8th, octave pop on the bar's last beat
    for k in range(int(DROP / BEAT) * 2, int(OUT / BEAT) * 2):
        t = k * BEAT / 2; bar = min(int(t // 2), len(CHORDS) - 1)
        root = CHORDS[bar][1]
        if k % 2 == 1: both(bass(root + (12 if (k // 2) % 4 == 3 else 0), 0.22), t, 0.55)
    # pluck arp on 8ths, chord tones, brighter as it goes
    for k in range(int(DROP / BEAT) * 2, int((OUT + 0.5) / BEAT) * 2):
        t = k * BEAT / 2; bar = min(int(t // 2), len(CHORDS) - 1)
        _, root, ints = CHORDS[bar]
        seq = (0, 1, 2, 1, 2, 1, 0, 1)
        m = root + 24 + (ints[seq[k % 8] % 3] + (12 if seq[k % 8] == 2 and k % 16 > 7 else 0))
        both(pluck(m), t, 0.22 + 0.1 * min(1, (t - DROP) / 10), width=0.25 if k % 2 else -0.25)
    # OUT - HIT: drums out, snare roll that speeds up, riser, then the impact on the end card
    for i in range(8):
        both(clap(200 + i), OUT + i * 0.125, 0.25 + 0.04 * i)
    for i in range(8):
        both(clap(300 + i), OUT + 0.5 + i * 0.0625, 0.35 + 0.05 * i)
    both(riser(1.4, 5), HIT - 1.4, 0.5)
    both(impact(), HIT, 1.0)
    # resolve: kick on beat 1 of each bar, soft pluck, bass root, fade
    for bar_t in (25.0, 26.0, 27.0):
        both(kick(), bar_t, 0.6)
    for k in range(int(HIT / BEAT) * 2, int(27.0 / BEAT) * 2):
        t = k * BEAT / 2; bar = min(int(t // 2), len(CHORDS) - 1)
        _, root, ints = CHORDS[bar]
        if k % 2 == 0: both(pluck(root + 24 + ints[(k // 2) % 3]), t, 0.17, width=0.2 if k % 4 else -0.2)
    both(bass(CHORDS[12][1], 2.6), HIT, 0.7)

    # sound design on the things that happen on screen (global seconds; mirrors the frames in Promo.tsx)
    cues: list[tuple[float, str, float]] = []
    for c in (3.7, 10.7, 15.7, 19.7): cues.append((c, "whoosh-up", 0.5))
    cues.append((24.55, "whoosh-up", 0.4))
    for c in (4.0, 11.0, 16.0, 20.0): cues.append((c, "thump", 0.55))
    for c in (0.2, 1.13, 2.07): cues.append((c, "pop", 0.35))                                   # windows arrive one by one
    for c in (0.8, 1.73, 2.6, 3.33): cues.append((c, "key", 0.3))                               # copy / paste clicks
    for c in (5.2, 6.2, 7.37): cues.append((c, "key", 0.35))                                    # "#" opens the Library
    for c in (5.73, 6.73, 7.9): cues.append((c, "pop", 0.55))                                   # tags land in the sentence
    for c in (8.9, 9.43, 9.97): cues.append((c, "tick", 0.45))                                  # "I understood" chips
    cues.append((10.6, "key", 0.6)); cues.append((10.63, "pop", 0.45))                          # Start research
    for c in (12.0, 12.93, 13.87, 14.8): cues.append((c, "tick", 0.55))                         # sources done
    cues.append((19.2, "key", 0.6)); cues.append((19.23, "pop", 0.5))                           # Approve & write
    cues.append((22.6, "key", 0.5))                                                             # Shorten
    for c in (23.33, 23.73, 24.13, 24.53): cues.append((c, "tick", 0.5))                        # checks
    cues.append((26.87, "pop", 0.6))                                                            # Claim your spot
    for t, name, g in cues:
        both(sfx(name), t, g * 0.55)

    out = np.stack([L, R], 1)
    fade = np.clip((DUR - np.arange(len(L)) / SR) / 0.8, 0, 1)
    return out * fade[:, None]


def write_wav(path: Path, x: np.ndarray) -> None:
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype("<i2").tobytes())


def measure(path: Path) -> tuple[float, float]:
    r = subprocess.run([ffmpeg(), "-hide_banner", "-i", str(path), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True)
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)[-1]), float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", r.stderr)[-1])


def main() -> None:
    out_dir = Path(sys.argv[1]); out_dir.mkdir(parents=True, exist_ok=True)
    x = build()
    x = np.tanh(x * 1.2) / np.tanh(1.2)  # gentle glue, catches the stacked transients
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.5
    tmp = out_dir / "_m.wav"; write_wav(tmp, x)
    i, _ = measure(tmp)
    x = x * 10 ** ((TARGET_LUFS - i) / 20)
    pk = np.max(np.abs(x))
    if pk > 0.89:  # -1 dBFS: squash the peaks, then re-measure
        x = np.tanh(x * (0.89 / pk) * 1.6) / np.tanh(1.6) * 0.95
    dst = out_dir / "music.wav"; write_wav(dst, x); tmp.unlink()
    i, pk_db = measure(dst)
    (out_dir / "music-notes.md").write_text(
        f"# Promo music\n\nOriginal, synthesized by `scripts/promo_music.py` (120 BPM, A minor, 29s). Nothing to license.\n\n"
        f"Measured: {i:.1f} LUFS integrated, {pk_db:.1f} dBFS peak (target {TARGET_LUFS:.0f} LUFS for a homepage video).\n\n"
        "| Time | What the track does |\n|---|---|\n| 0-4s | pad, sub pulse, ticking hats, riser |\n| 4s | drop: kick, clap, bass, pluck arp |\n"
        "| 11s, 16s, 20s | accents on the cuts (whoosh + thump) |\n| 24-25s | drums out, snare roll, riser |\n| 25s | impact on the end card |\n| 25-29s | soft resolve, fade |\n\n"
        "Claude can't hear it: listen once and say what to change (tempo, busier, softer, drop later).\n", encoding="utf-8")
    print(f"OK {dst}  {i:.1f} LUFS, peak {pk_db:.1f} dBFS")


if __name__ == "__main__":
    main()
