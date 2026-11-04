"""Roll per-reel analysis into one metrics table + corpus-level stats."""
import csv, json
from pathlib import Path
import numpy as np

REF = Path(__file__).resolve().parent.parent / "reference"
idx = {r["num"]: r for r in csv.DictReader(open(REF / "00_index" / "reels.csv", encoding="utf-8"))}
rows = []
for f in sorted((REF / "06_analysis").glob("*.json")):
    a = json.loads(f.read_text(encoding="utf-8")); au = a["audio"]; m = idx[a["reel"]]
    rows.append({"reel": a["reel"], "date": m["date"], "topic": m["topic"], "views": m["views"], "likes": m["likes"],
                 "comments": m["comments"], "duration_s": a["duration_s"], "shots": a["num_shots"],
                 "avg_shot_s": a["avg_shot_s"], "cuts_per_10s": a["cuts_per_10s"], "words": au["words"], "wpm": au["wpm"],
                 "music_gap_db": round(au["music_vs_speech_gap_db"] or 0, 1), "tempo_bpm": round(au["est_tempo_bpm"]),
                 "cuts_with_sfx_hit": au["cuts_with_transient_hit"],
                 "top_colors": " ".join(p["hex"] for p in a["palette"][:4])})
with open(REF / "00_index" / "metrics.csv", "w", newline="", encoding="utf-8") as fh:
    w = csv.DictWriter(fh, fieldnames=list(rows[0])); w.writeheader(); w.writerows(rows)

def stat(k):
    v = np.array([float(r[k]) for r in rows if r[k] not in (None, "")])
    return {"mean": round(v.mean(), 2), "median": round(float(np.median(v)), 2), "min": round(v.min(), 2), "max": round(v.max(), 2)}
summary = {k: stat(k) for k in ["duration_s", "shots", "avg_shot_s", "cuts_per_10s", "words", "wpm", "music_gap_db", "tempo_bpm", "cuts_with_sfx_hit"]}
for k in ["views", "likes", "comments"]:
    if all(r[k] for r in rows):
        summary[k] = stat(k)
summary["top_by_likes"] = [(r["reel"], r["topic"], r["likes"]) for r in sorted(rows, key=lambda r: -int(r["likes"] or 0))[:10]]
(REF / "00_index" / "corpus_stats.json").write_text(json.dumps(summary, indent=1), encoding="utf-8")
print(json.dumps(summary, indent=1))
