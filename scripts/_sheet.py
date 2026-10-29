"""Tile PNG stills into one labelled contact sheet.  python scripts/_sheet.py <dir> <out> [cols]"""
import sys, glob, os
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 4
ps = sorted(glob.glob(os.path.join(d, "*.png")), key=lambda p: float(os.path.basename(p)[:-4]))
ims = [Image.open(p).convert("RGB") for p in ps]
w, h = ims[0].size
pad, bar = 10, 26
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * (w + pad) + pad, rows * (h + bar + pad) + pad), "#2B2B2B")
dr = ImageDraw.Draw(sheet)
for i, (im, p) in enumerate(zip(ims, ps)):
    x = pad + (i % cols) * (w + pad); y = pad + (i // cols) * (h + bar + pad)
    sheet.paste(im, (x, y + bar))
    dr.text((x + 4, y + 6), f"{float(os.path.basename(p)[:-4]):.2f}s", fill="#FFFFFF")
sheet.save(out)
print(out, sheet.size)
