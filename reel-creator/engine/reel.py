"""Reel engine commands (run from anywhere):
  python engine/reel.py stills <reel folder> 0.5 3.2 ...   # stills/<t>.png + stills/sheet.png (contact sheet)
  python engine/reel.py render <reel folder>               # render/draft.mp4 (picture + his voice)
  python engine/reel.py sound  <reel folder>               # out/<slug>-<theme>.mp4: music bed + SFX, -14 LUFS / -1 dBTP
  python engine/reel.py frames <file.mp4> <out.png>        # contact sheet of one frame a second, for QA
"""
import json, re, subprocess, sys, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENGINE = ROOT / "engine"
FFMPEG = str(ROOT / "tools" / "bin" / "ffmpeg.exe")
FPS = 30


def load(folder: Path) -> dict:
    return json.loads((folder / "reel.json").read_text(encoding="utf-8"))


def shoot(folder: Path, props: dict, stills=(), clips=(), concurrency=3):
    job = {"comp": "Reel", "props": props, "publicDir": str(folder), "concurrency": concurrency,
           "stills": list(stills), "clips": list(clips)}
    jf = Path(tempfile.gettempdir()) / f"reeljob-{folder.name}.json"
    jf.write_text(json.dumps(job), encoding="utf-8")
    # run from the repo root so Remotion finds the browser in ./.remotion
    subprocess.run(["node", str(ENGINE / "shoot.mjs"), str(jf)], cwd=ROOT, check=True)


def sheet(images: list[Path], out: Path, cols=6, w=270):
    from PIL import Image, ImageDraw
    ims = [Image.open(p).convert("RGB") for p in images]
    h = int(w * 1920 / 1080)
    rows = (len(ims) + cols - 1) // cols
    S = Image.new("RGB", (cols * w, rows * (h + 22)), "white")
    d = ImageDraw.Draw(S)
    for i, (p, im) in enumerate(zip(images, ims)):
        x, y = (i % cols) * w, (i // cols) * (h + 22)
        S.paste(im.resize((w, h)), (x, y + 22))
        d.text((x + 4, y + 4), p.stem, fill="black")
    S.save(out)


def cmd_stills(folder: Path, times: list[float]):
    props = load(folder)
    out = folder / "stills"
    out.mkdir(exist_ok=True)
    stills = [{"frame": round(t * FPS), "out": str(out / f"{t:05.2f}.png"), "scale": 1} for t in times]
    shoot(folder, props, stills=stills)
    sheet([Path(s["out"]) for s in stills], out / "sheet.png")
    print(out / "sheet.png")


def cmd_render(folder: Path):
    props = load(folder)
    (folder / "render").mkdir(exist_ok=True)
    n = round(props["duration"] * FPS)
    shoot(folder, props, clips=[{"from": 0, "to": n - 1, "out": str(folder / "render" / "draft.mp4"), "muted": False}])


def loudness(path: str) -> float:
    r = subprocess.run([FFMPEG, "-hide_banner", "-nostats", "-i", path, "-af", "ebur128", "-f", "null", "-"],
                       capture_output=True, text=True)
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)[-1])


def cmd_sound(folder: Path):
    props = load(folder)
    snd = props.get("sound", {})
    draft = folder / "render" / "draft.mp4"
    dur = props["duration"]
    tmp = folder / "render"
    # 1) voice: from his cut, NOT the render (the render's audio drops out wherever his footage isn't on screen),
    #    high-pass + gentle compression
    voice = tmp / "voice.wav"
    subprocess.run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-i", str(folder / props["video"]), "-vn", "-ac", "2", "-ar", "48000",
                    "-af", "highpass=f=80,acompressor=threshold=-20dB:ratio=3:attack=10:release=150:makeup=2", str(voice)], check=True)
    v_lufs = loudness(str(voice))
    inputs = ["-i", str(voice)]
    filters, mix = ["[0:a]asplit=2[v][vkey]"], ["[v]"]
    k = 1
    # 2) music bed: low-passed, `musicGap` LU under the voice (default 15: at Nick's ~26 it was inaudible on a
    #    phone — Ajay, 2026-10-30), ducked a further few dB while he talks, fade out over the last 0.6s
    if snd.get("music"):
        music = (folder / snd["music"]).resolve()
        m_lufs = loudness(str(music))
        gain = (v_lufs - snd.get("musicGap", 15)) - m_lufs
        inputs += ["-stream_loop", "-1", "-i", str(music)]
        filters.append(f"[{k}:a]atrim=0:{dur},asetpts=N/SR/TB,aresample=48000,aformat=channel_layouts=stereo,lowpass=f=8000,"
                       f"volume={gain:.2f}dB,afade=t=out:st={dur - 0.6}:d=0.6[mraw]")
        filters.append("[mraw][vkey]sidechaincompress=threshold=0.05:ratio=3:attack=80:release=600:makeup=1[m]")
        mix.append("[m]")
        k += 1
    else:
        filters[0] = "[0:a]anull[v]"
    # 3) SFX at their times, levels relative to the voice
    for j, c in enumerate(snd.get("sfx", [])):
        f = ROOT / "assets" / "sfx" / c["file"]
        s_lufs = loudness(str(f)) if f.stat().st_size > 20000 else -20.0
        gain = (v_lufs + c["db"]) - s_lufs
        ms = int(c["at"] * 1000)
        inputs += ["-i", str(f)]
        filters.append(f"[{k}:a]aresample=48000,aformat=channel_layouts=stereo,volume={gain:.2f}dB,adelay={ms}|{ms}[s{j}]")
        mix.append(f"[s{j}]")
        k += 1
    filters.append(f"{''.join(mix)}amix=inputs={len(mix)}:normalize=0:duration=first[mx]")
    pre = tmp / "mix.wav"
    subprocess.run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y", *inputs, "-filter_complex", ";".join(filters),
                    "-map", "[mx]", "-t", str(dur), str(pre)], check=True)
    # 4) two-pass loudnorm to -14 LUFS / -1 dBTP
    r = subprocess.run([FFMPEG, "-hide_banner", "-i", str(pre), "-af", "loudnorm=I=-14:TP=-1:LRA=11:print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True)
    m = json.loads(r.stderr[r.stderr.rindex("{"):r.stderr.rindex("}") + 1])
    ln = (f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
          f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    (folder / "out").mkdir(exist_ok=True)
    slug = re.sub(r"^\d{4}-\d{2}-\d{2}-", "", folder.name)
    out = folder / "out" / f"{slug}-{props.get('theme', 'tmv')}.mp4"
    subprocess.run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-i", str(draft), "-i", str(pre), "-map", "0:v", "-map", "1:a",
                    "-c:v", "copy", "-af", ln + ",aresample=48000", "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", str(out)], check=True)
    print(out, f"measured: {loudness(str(out)):.1f} LUFS")


def cmd_frames(video: Path, out: Path):
    tmpd = Path(tempfile.mkdtemp())
    subprocess.run([FFMPEG, "-hide_banner", "-loglevel", "error", "-i", str(video), "-vf", "fps=1", str(tmpd / "%03d.png")], check=True)
    sheet(sorted(tmpd.glob("*.png")), out, cols=8, w=200)
    print(out)


if __name__ == "__main__":
    cmd, arg = sys.argv[1], Path(sys.argv[2]).resolve()
    if cmd == "stills": cmd_stills(arg, [float(x) for x in sys.argv[3:]])
    elif cmd == "render": cmd_render(arg)
    elif cmd == "sound": cmd_sound(arg)
    elif cmd == "frames": cmd_frames(arg, Path(sys.argv[3]).resolve())
    else: print(__doc__)
