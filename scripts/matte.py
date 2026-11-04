"""Cut Ajay out of his own footage: a person matte for the reel's split layout, where his head and shoulders
pop out above the rounded panel (Nick Saraev's reels, reel-creator/reference/12_design/design_system.md).

    python scripts/matte.py still <frame.png> <out.png>      RGBA cut-out of one frame
    python scripts/matte.py video <cut.mp4> <out.webm>       the whole cut, VP9 with alpha (Remotion: transparent)

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


def video(src: str, out: str) -> None:
    import json
    import subprocess
    import time
    sys.path.insert(0, str(ROOT / "scripts"))
    from broll import ffmpeg  # the project's ffmpeg (tools/ffmpeg or PATH)
    ff = ffmpeg()
    probe = Path(ff).with_name("ffprobe" + Path(ff).suffix)
    info = json.loads(subprocess.run([str(probe), "-v", "error", "-select_streams", "v:0", "-show_entries",
                                      "stream=width,height,r_frame_rate,nb_frames", "-of", "json", src],
                                     capture_output=True, text=True, check=True).stdout)["streams"][0]
    w, h, fps = info["width"], info["height"], info["r_frame_rate"]
    total = int(info.get("nb_frames") or 0)
    dec = subprocess.Popen([ff, "-v", "error", "-i", src, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    enc = subprocess.Popen([ff, "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{w}x{h}", "-r", fps, "-i", "-",
                            "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-crf", "22", "-b:v", "0", "-row-mt", "1",
                            "-auto-alt-ref", "0", out], stdin=subprocess.PIPE)
    sess = session()
    rec = [np.zeros((1, 1, 1, 1), np.float32)] * 4
    ratio = np.array([0.25], np.float32)
    n, t0 = 0, time.time()
    while True:
        buf = dec.stdout.read(w * h * 3)
        if len(buf) < w * h * 3:
            break
        rgb = np.frombuffer(buf, np.uint8).reshape(h, w, 3)
        src_t = (rgb.astype(np.float32) / 255).transpose(2, 0, 1)[None]
        _, pha, *rec = sess.run(None, {"src": src_t, "r1i": rec[0], "r2i": rec[1], "r3i": rec[2], "r4i": rec[3], "downsample_ratio": ratio})
        a = (pha[0, 0] * 255).clip(0, 255).astype(np.uint8)
        enc.stdin.write(np.dstack([rgb, a]).tobytes())
        n += 1
        if n % 100 == 0:
            print(f"  {n}/{total or '?'} frames, {(time.time() - t0) / n:.2f}s a frame", flush=True)
    enc.stdin.close()
    enc.wait()
    dec.wait()
    print(f"MATTE {out}  ({n} frames in {time.time() - t0:.0f}s)")


if __name__ == "__main__":
    if len(sys.argv) == 4 and sys.argv[1] == "still":
        still(sys.argv[2], sys.argv[3])
    elif len(sys.argv) == 4 and sys.argv[1] == "video":
        video(sys.argv[2], sys.argv[3])
    else:
        sys.exit(__doc__)
