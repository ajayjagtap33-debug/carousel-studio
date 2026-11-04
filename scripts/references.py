"""Gather every visual reference into one place: visuals/references/.

  python scripts/references.py

Writes a labelled sheet of the swipe set (tracked; those images are in git) and, under visuals/references/local/
(git-ignored: other creators' frames stay private reference, like videos/reference/*/frames), one contact sheet per
video reference. The index of all of it is visuals/references/README.md (hand-written). Re-run after adding a
reference; a source whose frames aren't on this machine is skipped with a note.
"""
import glob, os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "visuals" / "references"; LOCAL = OUT / "local"
REF = ROOT / "videos" / "reference"


def sheet(files: list[Path], out: Path, cols: int = 4, w: int = 480, label=lambda f: f.stem) -> None:
    files = [f for f in files if f.exists()]
    if not files: print(f"skip {out.name}: no frames on this machine"); return
    font = ImageFont.load_default(20)
    cells = []
    for f in files:
        im = Image.open(f).convert("RGB"); im = im.resize((w, max(1, int(im.height * w / im.width))))
        c = Image.new("RGB", (w, im.height + 28), "white"); c.paste(im, (0, 28))
        ImageDraw.Draw(c).text((6, 4), label(f), fill=(200, 30, 30), font=font); cells.append(c)
    rows = [cells[i:i + cols] for i in range(0, len(cells), cols)]
    H = sum(max(c.height for c in r) for r in rows)
    sh = Image.new("RGB", (cols * w, H), "white"); y = 0
    for r in rows:
        for k, c in enumerate(r): sh.paste(c, (k * w, y))
        y += max(c.height for c in r)
    out.parent.mkdir(parents=True, exist_ok=True)
    sh.save(out, quality=85) if out.suffix == ".jpg" else sh.save(out)
    print(f"{out.relative_to(ROOT).as_posix()}: {len(files)} frames")


def main():
    swipe = sorted(p for p in (ROOT / "swipe" / "video slides (extra)").glob("*.webp") if "(1)" not in p.name)
    sheet(swipe, OUT / "swipe-darius.png", cols=6, w=320, label=lambda f: f.name[:6])
    for name, folder, pat in [
        ("nick-survive-ai", "2026-10-15-nick-saraev-survive-ai", "*.png"),
        ("fieldcamp", "2026-10-22-fieldcamp-ai-receptionist", "sheet*.png"),
        ("nick-ceo-ai", "2026-10-28-nick-saraev-ceo-ai", "s*.png"),
        ("aayusucks", "2026-10-29-aayusucks-typography", "s0*.png"),
    ]:
        sheet(sorted((REF / folder / "frames").glob(pat)), LOCAL / f"{name}.jpg", cols=3 if "sheet" in pat or pat.startswith("s") else 4)
    sb = sorted((LOCAL / "nick-second-brain").glob("M*.png"))
    sheet(sb, LOCAL / "nick-second-brain.jpg", cols=3, w=640)
    reels = sorted((ROOT / "reel-creator" / "reference" / "04_frames").glob("*_contact_sheet.jpg"))
    sheet(reels, LOCAL / "reels-49.jpg", cols=7, w=360, label=lambda f: f"reel {f.stem[:2]}")
    design = ROOT / "reel-creator" / "design" / "sheet.png"
    sheet([design], LOCAL / "reel-design.jpg", cols=1, w=1600, label=lambda f: "reel design (ours)")


if __name__ == "__main__":
    main()
