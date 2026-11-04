import json, sys
from faster_whisper import WhisperModel
src, out = sys.argv[1], sys.argv[2]
m = WhisperModel("small.en", device="cpu", compute_type="int8")
import soundfile as sf
audio, _sr = sf.read(src, dtype="float32")
segs, _ = m.transcribe(audio, word_timestamps=True, vad_filter=True, beam_size=5)
words = []
lines = []
for s in segs:
    lines.append(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text.strip()}")
    for w in s.words:
        words.append({"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3)})
json.dump({"words": words}, open(out + ".json", "w", encoding="utf-8"), indent=0, ensure_ascii=False)
open(out + ".md", "w", encoding="utf-8").write("\n".join(lines) + "\n")
print("\n".join(lines))
