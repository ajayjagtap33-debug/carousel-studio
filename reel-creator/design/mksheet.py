"""Tile frames/*.png into sheet.png (6 across, labelled).  python reel-creator/design/mksheet.py"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
HERE = Path(__file__).resolve().parent
ps = sorted((HERE / "frames").glob("*.png"))
w, h, cols, pad, bar = 360, 640, 6, 12, 34
rows = (len(ps) + cols - 1) // cols
sheet = Image.new("RGB", (cols * (w + pad) + pad, rows * (h + bar + pad) + pad), "#2B2B2B")
d = ImageDraw.Draw(sheet)
try: font = ImageFont.truetype("arial.ttf", 20)
except OSError: font = ImageFont.load_default()
for i, p in enumerate(ps):
    x, y = pad + (i % cols) * (w + pad), pad + (i // cols) * (h + bar + pad)
    d.text((x + 4, y + 6), p.stem, fill="#DDD", font=font)
    sheet.paste(Image.open(p).convert("RGB").resize((w, h), Image.LANCZOS), (x, y + bar))
sheet.save(HERE / "sheet.png")
print(HERE / "sheet.png", len(ps))
