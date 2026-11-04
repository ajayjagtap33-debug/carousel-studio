"""Compile every reel's clean script (Instagram caption) into reference/10_script/all_scripts.md."""
import csv
from pathlib import Path

REF = Path(__file__).resolve().parent.parent / "reference"
m = {r["reel"]: r for r in csv.DictReader(open(REF / "00_index" / "metrics.csv", encoding="utf-8"))}
out = ["# All 49 scripts (clean, from Instagram captions)", "",
       "Source: the caption under each reel, which is Nick's own script. Line 1 is the caption CTA; the rest is the "
       "spoken script, one line per sentence. Raw speech-to-text with word timestamps is in ../03_transcripts/.", ""]
for k in sorted(m):
    r = m[k]
    cap = (REF / "02_metadata" / f"{k}.caption.txt").read_text(encoding="utf-8").strip()
    out += [f"## {k} — {r['topic']}",
            f"{r['date']} · {r['duration_s']}s · {r['words']} words · {r['likes']} likes · {r['comments']} comments", "", cap, ""]
(REF / "10_script" / "all_scripts.md").write_text("\n".join(out), encoding="utf-8")
print("ok")
