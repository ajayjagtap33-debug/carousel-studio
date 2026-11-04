"""Analyse the separated music-bed stems: tempo, key, brightness, continuity, and SFX hits on cuts.

Writes reference/13_audio/music_features.csv and clips SFX hits into reference/13_audio/sfx_samples/.
"""
import csv, json
from pathlib import Path
import numpy as np
import librosa
import soundfile as sf

REF = Path(__file__).resolve().parent.parent / "reference"
STEMS = REF / "05_audio" / "stems"
OUT = REF / "13_audio"; OUT.mkdir(exist_ok=True)
SFX = OUT / "sfx_samples"; SFX.mkdir(exist_ok=True)

MAJOR = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
MINOR = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
NOTES = "C C# D D# E F F# G G# A A# B".split()

def key_of(y, sr):
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr).mean(1)
    best = max(((np.corrcoef(np.roll(prof, i), chroma)[0, 1], f"{NOTES[i]} {name}")
                for prof, name in ((MAJOR, "major"), (MINOR, "minor")) for i in range(12)))
    return best[1]

rows = []
for music in sorted(STEMS.glob("*_music.mp3")):
    reel = music.stem.split("_")[0]
    an = json.loads((REF / "06_analysis" / f"{reel}.json").read_text(encoding="utf-8"))
    y, sr = librosa.load(str(music), sr=22050, mono=True)
    v, _ = librosa.load(str(STEMS / f"{reel}_voice.mp3"), sr=22050, mono=True)
    hop = 512
    rms = librosa.feature.rms(y=y, hop_length=hop)[0]; vrms = librosa.feature.rms(y=v, hop_length=hop)[0]
    db = 20 * np.log10(rms + 1e-9); vdb = 20 * np.log10(np.median(vrms) + 1e-9)
    t = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop)
    bed = np.percentile(db, 30)
    present = float((db > -50).mean())          # share of runtime with audible music
    tempo = float(np.atleast_1d(librosa.beat.beat_track(y=y, sr=sr)[0])[0])
    centroid = float(np.median(librosa.feature.spectral_centroid(y=y, sr=sr)))
    onset = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
    thresh = np.median(onset) + 4 * np.std(onset)
    cuts = [a for a, _ in an["scenes"][1:]]
    hits = []
    for c in cuts:
        i0, i1 = np.searchsorted(t, [c - 0.15, c + 0.15])
        if i1 > i0 and onset[i0:i1].max() > thresh:
            hits.append(c)
    for j, c in enumerate(hits[:4]):
        a, b = int(max(0, c - 0.3) * sr), int((c + 0.7) * sr)
        sf.write(str(SFX / f"{reel}_cut{j+1}_{c:05.2f}s.wav"), y[a:b], sr)
    rows.append({"reel": reel, "music_present_pct": round(present * 100), "tempo_bpm": round(tempo),
                 "key": key_of(y, sr), "brightness_hz": round(centroid),
                 "music_bed_db": round(float(bed), 1), "voice_db": round(float(vdb), 1),
                 "voice_over_music_db": round(float(vdb - bed), 1),
                 "cuts": len(cuts), "cuts_with_sfx_hit": len(hits),
                 "intro_music_db_first2s": round(float(np.median(db[t < 2])), 1),
                 "outro_music_db_last3s": round(float(np.median(db[t > t[-1] - 3])), 1)})
    print(reel, rows[-1]["tempo_bpm"], rows[-1]["key"], flush=True)

with open(OUT / "music_features.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0])); w.writeheader(); w.writerows(rows)
