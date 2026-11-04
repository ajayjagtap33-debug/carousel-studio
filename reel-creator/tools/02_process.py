"""Per-reel processing: audio extract, transcription, scene cuts, keyframes, palette, audio analysis.

Writes into reference/03_transcripts, 04_frames, 05_audio, 06_analysis. Safe to re-run; skips finished steps.
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np
import cv2
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
REF = ROOT / "reference"
FFMPEG = str(ROOT / "tools" / "bin" / "ffmpeg.exe")
VID, TR, FR, AU, AN = (REF / d for d in ["01_videos", "03_transcripts", "04_frames", "05_audio", "06_analysis"])
for d in (TR, FR, AU, AN):
    d.mkdir(parents=True, exist_ok=True)

_model = None
def model():
    global _model
    if _model is None:
        from faster_whisper import WhisperModel
        _model = WhisperModel("small.en", device="cpu", compute_type="int8")
    return _model

def srt_time(t):
    h, r = divmod(t, 3600); m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int((s % 1) * 1000):03d}"

def transcribe(slug, wav):
    out = TR / f"{slug}.json"
    if out.exists():
        return json.loads(out.read_text(encoding="utf-8"))
    import librosa
    audio, _ = librosa.load(str(wav), sr=16000)
    segs, _ = model().transcribe(audio, word_timestamps=True, vad_filter=True, beam_size=5)
    segs = [{"start": s.start, "end": s.end, "text": s.text.strip(),
             "words": [{"w": w.word, "s": w.start, "e": w.end} for w in s.words]} for s in segs]
    out.write_text(json.dumps(segs, indent=1), encoding="utf-8")
    (TR / f"{slug}.txt").write_text("\n".join(s["text"] for s in segs), encoding="utf-8")
    (TR / f"{slug}.srt").write_text("\n".join(
        f"{i+1}\n{srt_time(s['start'])} --> {srt_time(s['end'])}\n{s['text']}\n" for i, s in enumerate(segs)), encoding="utf-8")
    return segs

def detect_cuts(mp4):
    from scenedetect import detect, ContentDetector
    scenes = detect(str(mp4), ContentDetector(threshold=27.0, min_scene_len=6))
    return [(a.get_seconds(), b.get_seconds()) for a, b in scenes]

def grab(cap, t, fps):
    cap.set(cv2.CAP_PROP_POS_FRAMES, int(t * fps))
    ok, f = cap.read()
    return cv2.cvtColor(f, cv2.COLOR_BGR2RGB) if ok else None

def palette(pixels, k=6):
    from sklearn.cluster import KMeans
    km = KMeans(n_clusters=k, n_init=4, random_state=0).fit(pixels)
    counts = np.bincount(km.labels_, minlength=k)
    order = np.argsort(-counts)
    return [{"hex": "#%02x%02x%02x" % tuple(int(c) for c in km.cluster_centers_[i]),
             "share": round(float(counts[i] / counts.sum()), 3)} for i in order]

def frames_and_palette(slug, mp4, scenes, duration):
    d = FR / slug; d.mkdir(exist_ok=True)
    cap = cv2.VideoCapture(str(mp4)); fps = cap.get(cv2.CAP_PROP_FPS) or 30
    if not scenes:
        scenes = [(0.0, duration)]
    thumbs, pix = [], []
    for i, (a, b) in enumerate(scenes):
        f = grab(cap, (a + b) / 2, fps)
        if f is None:
            continue
        im = Image.fromarray(f); im.thumbnail((360, 640))
        im.save(d / f"scene_{i:03d}_{a:06.2f}s.jpg", quality=80)
        thumbs.append(im)
        pix.append(np.asarray(im.resize((40, 72))).reshape(-1, 3))
    cap.release()
    # contact sheet: 8 columns
    if thumbs:
        w, h = 180, 320; cols = 8; rows = (len(thumbs) + cols - 1) // cols
        sheet = Image.new("RGB", (cols * w, rows * h), "black")
        for i, t in enumerate(thumbs):
            sheet.paste(t.resize((w, h)), ((i % cols) * w, (i // cols) * h))
        sheet.save(FR / f"{slug}_contact_sheet.jpg", quality=80)
    return palette(np.concatenate(pix)) if pix else []

def audio_analysis(wav, segs, scenes, duration):
    import librosa
    y, sr = librosa.load(str(wav), sr=16000)
    hop = 512
    rms = librosa.feature.rms(y=y, hop_length=hop)[0]
    t = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop)
    speech = np.zeros_like(rms, dtype=bool)
    for s in segs:
        for w in s["words"]:
            speech |= (t >= w["s"] - 0.05) & (t <= w["e"] + 0.05)
    db = 20 * np.log10(rms + 1e-9)
    gap_db = float(np.median(db[~speech])) if (~speech).sum() > 10 else None
    speech_db = float(np.median(db[speech])) if speech.sum() > 10 else None
    tempo = librosa.beat.beat_track(y=y, sr=sr)[0]
    onset_env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
    onsets = librosa.onset.onset_detect(onset_envelope=onset_env, sr=sr, hop_length=hop, units="time")
    strong = onsets[onset_env[librosa.time_to_frames(onsets, sr=sr, hop_length=hop)] > np.percentile(onset_env, 97)]
    cut_times = [a for a, _ in scenes[1:]]
    sfx_on_cuts = sum(any(abs(o - c) < 0.12 for o in strong) for c in cut_times)
    words = sum(len(s["words"]) for s in segs)
    speech_dur = (segs[-1]["end"] - segs[0]["start"]) if segs else 0
    return {"music_bed_db_between_words": gap_db, "speech_db": speech_db,
            "music_vs_speech_gap_db": (speech_db - gap_db) if gap_db and speech_db else None,
            "est_tempo_bpm": float(np.atleast_1d(tempo)[0]),
            "strong_transients": len(strong), "cuts_with_transient_hit": sfx_on_cuts,
            "words": words, "wpm": round(words / speech_dur * 60, 1) if speech_dur else None,
            "first_word_at_s": segs[0]["words"][0]["s"] if segs and segs[0]["words"] else None}

def process(mp4):
    slug = mp4.stem
    out = AN / f"{slug}.json"
    if out.exists():
        return
    wav = AU / f"{slug}.wav"
    if not wav.exists():
        subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-i", str(mp4), "-ac", "1", "-ar", "16000", str(wav)], check=True)
    cap = cv2.VideoCapture(str(mp4))
    duration = cap.get(cv2.CAP_PROP_FRAME_COUNT) / (cap.get(cv2.CAP_PROP_FPS) or 30)
    cap.release()
    segs = transcribe(slug, wav)
    scenes = detect_cuts(mp4)
    pal = frames_and_palette(slug, mp4, scenes, duration)
    aud = audio_analysis(wav, segs, scenes, duration)
    shots = [b - a for a, b in scenes] or [duration]
    out.write_text(json.dumps({
        "reel": slug, "duration_s": round(duration, 2), "num_shots": len(shots),
        "avg_shot_s": round(float(np.mean(shots)), 2), "median_shot_s": round(float(np.median(shots)), 2),
        "cuts_per_10s": round(len(shots) / duration * 10, 2),
        "scenes": [[round(a, 2), round(b, 2)] for a, b in scenes],
        "palette": pal, "audio": aud}, indent=1), encoding="utf-8")
    print(slug, "ok", flush=True)

if __name__ == "__main__":
    for mp4 in sorted(VID.glob("*.mp4")):
        try:
            process(mp4)
        except Exception as e:
            print(mp4.stem, "FAILED", repr(e), flush=True)
