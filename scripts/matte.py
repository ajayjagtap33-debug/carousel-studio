"""Cut Ajay out of his own footage: a person matte for the reel's split layout, where his head and shoulders
pop out above the rounded panel (Nick Saraev's reels, reel-creator/reference/12_design/design_system.md).

    python scripts/matte.py still <frame.png> <out.png>      RGBA cut-out of one frame

Model: Robust Video Matting, MobileNetV3, fp32 ONNX (tools/rvm/, from github.com/PeterL1n/RobustVideoMatting
releases v1.0.0). It is recurrent: a still is run a few times on itself so the hidden state settles.
"""
import sys
from pathlib import Path

import numpy as np
import onnxruntime as ort
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
MODEL = ROOT / "tools" / "rvm" / "rvm_mobilenetv3_fp32.onnx"


def session() -> ort.InferenceSession:
    if not MODEL.exists():
        sys.exit(f"missing {MODEL}: download rvm_mobilenetv3_fp32.onnx from the RVM v1.0.0 release")
    return ort.InferenceSession(str(MODEL), providers=["CPUExecutionProvider"])


def matte(sess: ort.InferenceSession, rgb: np.ndarray, passes: int = 4) -> np.ndarray:
    """Alpha (H, W) in 0..1 for an RGB uint8 frame."""
    h, w = rgb.shape[:2]
    src = (rgb.astype(np.float32) / 255).transpose(2, 0, 1)[None]
    rec = [np.zeros((1, 1, 1, 1), np.float32)] * 4
    # 0.25 is RVM's advice for 1080p-ish input; the refiner restores full-res edges
    ratio = np.array([0.25 if max(h, w) >= 1000 else 0.5], np.float32)
    for _ in range(passes):
        fgr, pha, *rec = sess.run(None, {"src": src, "r1i": rec[0], "r2i": rec[1], "r3i": rec[2], "r4i": rec[3],
                                         "downsample_ratio": ratio})
    return pha[0, 0]


def still(src: str, out: str) -> None:
    rgb = np.array(Image.open(src).convert("RGB"))
    a = matte(session(), rgb)
    Image.fromarray(np.dstack([rgb, (a * 255).clip(0, 255).astype(np.uint8)]), "RGBA").save(out)
    print(f"MATTE {out}  (person {a.mean() * 100:.0f}% of frame)")


if __name__ == "__main__":
    if len(sys.argv) == 4 and sys.argv[1] == "still":
        still(sys.argv[2], sys.argv[3])
    else:
        sys.exit(__doc__)
