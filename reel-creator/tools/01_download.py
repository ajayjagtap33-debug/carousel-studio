"""Download every reel listed in the spreadsheet, plus its Instagram metadata."""
import csv, json, subprocess, sys
from pathlib import Path
import openpyxl

ROOT = Path(__file__).resolve().parent.parent
REF = ROOT / "reference"
FFMPEG_DIR = ROOT / "tools" / "bin"
XLSX = Path(sys.argv[1])

wb = openpyxl.load_workbook(XLSX)
ws = wb.active
rows = [r for r in ws.iter_rows(min_row=2, values_only=True) if r[3]]

(REF / "00_index").mkdir(parents=True, exist_ok=True)
vid_dir = REF / "01_videos"; vid_dir.mkdir(parents=True, exist_ok=True)
meta_dir = REF / "02_metadata"; meta_dir.mkdir(parents=True, exist_ok=True)

index = []
for num, date, topic, link in rows:
    slug = f"{int(num):02d}"
    out = vid_dir / f"{slug}.mp4"
    if not out.exists():
        subprocess.run([sys.executable, "-m", "yt_dlp", "--ffmpeg-location", str(FFMPEG_DIR),
                        "-f", "bv*+ba/b", "--merge-output-format", "mp4",
                        "--write-info-json", "-o", str(vid_dir / f"{slug}.%(ext)s"), link])
    info_file = vid_dir / f"{slug}.info.json"
    info = {}
    if info_file.exists():
        info = json.loads(info_file.read_text(encoding="utf-8"))
        info_file.replace(meta_dir / f"{slug}.info.json")
    elif (meta_dir / f"{slug}.info.json").exists():
        info = json.loads((meta_dir / f"{slug}.info.json").read_text(encoding="utf-8"))
    (meta_dir / f"{slug}.caption.txt").write_text(info.get("description", ""), encoding="utf-8")
    index.append({"num": slug, "date": date, "topic": topic, "link": link,
                  "duration_s": info.get("duration"), "likes": info.get("like_count"),
                  "comments": info.get("comment_count"), "views": info.get("view_count"),
                  "width": info.get("width"), "height": info.get("height"),
                  "downloaded": out.exists()})

with open(REF / "00_index" / "reels.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(index[0].keys())); w.writeheader(); w.writerows(index)
print("done", sum(i["downloaded"] for i in index), "/", len(index))
