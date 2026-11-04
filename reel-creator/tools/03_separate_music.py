"""Split each reel's audio into voice and music-bed stems with Demucs (two-stem mode).

Output: reference/05_audio/stems/<reel>_music.mp3 and <reel>_voice.mp3 for listening / Shazam / sound-alike search.
"""
import subprocess, sys, shutil
from pathlib import Path
import numpy as np
import soundfile as sf
import torch
from demucs.pretrained import get_model
from demucs.apply import apply_model

ROOT = Path(__file__).resolve().parent.parent
FFMPEG = str(ROOT / "tools" / "bin" / "ffmpeg.exe")
VID = ROOT / "reference" / "01_videos"
OUT = ROOT / "reference" / "05_audio" / "stems"; OUT.mkdir(parents=True, exist_ok=True)
TMP = ROOT / "tools" / "_tmp"; TMP.mkdir(exist_ok=True)

model = get_model("htdemucs"); model.eval()
vocals_idx = model.sources.index("vocals")

for mp4 in sorted(VID.glob("*.mp4")):
    music_mp3 = OUT / f"{mp4.stem}_music.mp3"
    if music_mp3.exists():
        continue
    wav = TMP / f"{mp4.stem}.wav"
    subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-i", str(mp4), "-ac", "2", "-ar", str(model.samplerate), str(wav)], check=True)
    audio, sr = sf.read(str(wav), dtype="float32")
    x = torch.from_numpy(audio.T).unsqueeze(0)
    ref = x.mean(1)
    mean, std = ref.mean(), ref.std() + 1e-8
    with torch.no_grad():
        stems = apply_model(model, (x - mean) / std, device="cpu", progress=False)[0] * std + mean
    voice = stems[vocals_idx]
    music = stems.sum(0) - voice
    for name, s in (("voice", voice), ("music", music)):
        tmp = TMP / f"{mp4.stem}_{name}.wav"
        sf.write(str(tmp), s.numpy().T, sr)
        subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-i", str(tmp), "-b:a", "192k", str(OUT / f"{mp4.stem}_{name}.mp3")], check=True)
        tmp.unlink()
    wav.unlink()
    print(mp4.stem, "separated", flush=True)

shutil.rmtree(TMP, ignore_errors=True)
