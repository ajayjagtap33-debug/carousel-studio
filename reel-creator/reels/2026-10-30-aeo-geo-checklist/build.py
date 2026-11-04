"""Writes reel.json for this reel: the approved plan (plan.md) as segments + captions + sound cues.
Run from the reel folder: python build.py
"""
import json, re, shutil
from pathlib import Path

HERE = Path(__file__).parent
words = json.loads((HERE / "transcript.json").read_text(encoding="utf-8"))["words"]

# --- captions -------------------------------------------------------------------------------------------
# Display fixes: whisper splits / spells these differently from how they should read on screen.
MERGE = {("chat", "GPT"): "ChatGPT", ("250", "-point"): "250-point", ("AEO", "-GEO"): "AEO-GEO"}
SPELL = {"1200": "1,200", "audit": "AUDIT", "DM": "DM"}
# Accent word (one per phrase), by start time of the (first) spoken token.
ACCENT = {0.54, 3.12, 4.70, 5.52, 6.64, 9.84, 11.60, 12.68, 13.98, 15.44, 17.50, 19.50, 20.88, 23.08, 23.36,
          26.58, 27.42, 29.14, 30.20, 30.40, 33.04, 35.38, 37.72}

toks = []
i = 0
while i < len(words):
    w = words[i]
    txt = w["w"]
    if i + 1 < len(words):
        a, b = re.sub(r"[.,]", "", txt), re.sub(r"[.,]", "", words[i + 1]["w"])
        if (a, b) in MERGE:
            end_punct = words[i + 1]["w"][-1] in ".,"
            toks.append({"w": MERGE[(a, b)], "s": w["s"], "e": words[i + 1]["e"], "brk": end_punct})
            i += 2
            continue
    clean = re.sub(r"[.,]$", "", txt)
    toks.append({"w": SPELL.get(clean, clean), "s": w["s"], "e": w["e"], "brk": txt[-1] in ".,"})
    i += 1

# Layout boundaries: a caption never runs across a cut.
CUTS = [2.92, 4.36, 6.32, 8.26, 10.28, 11.86, 14.42, 16.26, 18.10, 20.20, 22.20, 24.58, 26.32, 29.40, 33.84, 36.92]
caps, cur = [], []
for k, tk in enumerate(toks):
    if cur:
        prev = cur[-1]
        crossed = any(prev["s"] < c <= tk["s"] + 0.02 for c in CUTS)
        if len(cur) >= 3 or prev["brk"] or tk["s"] - prev["e"] > 0.35 or crossed:
            caps.append(cur); cur = []
    cur.append(tk)
caps.append(cur)
captions = []
for j, c in enumerate(caps):
    start = c[0]["s"]
    nxt = caps[j + 1][0]["s"] if j + 1 < len(caps) else c[-1]["e"] + 0.4
    end = min(nxt, c[-1]["e"] + 0.6)
    captions.append({"start": round(start, 3), "end": round(end, 3),
                     "words": [{"w": t["w"], "s": t["s"], **({"accent": True} if round(t["s"], 2) in ACCENT else {})} for t in c]})

# --- segments (plan.md) ---------------------------------------------------------------------------------
URLS = "docs.google.com/spreadsheets"
row = {"category": "Answer-First Format", "priority": "High",
       "item": "Key facts appear in first 2-3 sentences of sections", "note": "Lead with the answer, details follow"}
segments = [
    {"start": 0.00, "end": 2.92, "layout": "split", "scene": {"type": "counter", "at": 0.54, "to": 1200, "label": "SEOs and marketers", "size": 190}},
    {"start": 2.92, "end": 4.36, "layout": "soft", "scene": {"type": "header", "src": "shots/sheets-header.png", "ringAt": 3.12}},
    {"start": 4.36, "end": 6.32, "layout": "split", "scene": {"type": "logos", "items": [
        {"src": "logos/chatgpt.png", "name": "ChatGPT", "at": 4.70}, {"src": "logos/perplexity.svg", "name": "Perplexity", "at": 5.52}]}},
    {"start": 6.32, "end": 8.26, "layout": "soft", "scene": {"type": "score", "ringAt": 6.95,
        "counter": {"at": 6.64, "to": 250, "label": "point checklist"},
        "chips": [{"text": "AEO", "at": 7.28}, {"text": "GEO", "at": 7.68}]}},
    {"start": 8.26, "end": 10.28, "layout": "split", "scene": {"type": "name", "logo": "logos/tmv-red.png", "logoAt": 8.40,
        "nameAt": 8.85, "name": ["Track My", "Visibility"]}},
    # 10.28-18.10: full-screen b-roll, he isn't looking at the lens (Ajay, 2026-10-30)
    {"start": 10.28, "end": 11.86, "layout": "full", "scene": {"type": "tabsMenu", "steps": [
        {"at": 10.28, "i": 0}, {"at": 11.26, "i": 1}, {"at": 11.60, "i": 2}]}},
    {"start": 11.86, "end": 14.42, "layout": "soft", "scene": {"type": "sheet", "tabs": [
        {"at": 11.86, "tab": "SEO Foundation"}, {"at": 13.30, "tab": "AEO Readiness"}, {"at": 13.98, "tab": "GEO Readiness"}]}},
    {"start": 14.42, "end": 16.26, "layout": "full", "enter": "slide", "scene": {"type": "sheet", "tabs": [
        {"at": 14.42, "tab": "Local SEO Readiness"}, {"at": 15.44, "tab": "Monitoring & Optimization"}]}},
    {"start": 16.26, "end": 18.10, "layout": "soft", "scene": {"type": "row", **row, "itemAt": 17.50}},
    {"start": 18.10, "end": 20.20, "layout": "split", "scene": {"type": "row", **row, "itemAt": 0, "noteAt": 18.78}},
    {"start": 20.20, "end": 22.20, "layout": "soft", "scene": {"type": "sheet", "tab": "Quick Wins", "chipGlow": {"at": 20.46, "step": 0.15}}},
    {"start": 22.20, "end": 24.58, "layout": "fth"},
    {"start": 24.58, "end": 26.32, "layout": "split", "scene": {"type": "sheet", "tab": "Quick Wins", "fs": 21,
        "ticks": [{"at": 25.08, "row": 1}, {"at": 25.22, "row": 3}, {"at": 25.46, "row": 5}],
        "cursor": [{"at": 25.08, "row": 1}, {"at": 25.22, "row": 3}, {"at": 25.46, "row": 5}]}},
    {"start": 26.32, "end": 29.40, "layout": "soft", "scene": {"type": "score", "rowsAt": 27.42, "rowStep": 0.1, "countAt": 27.9}},
    {"start": 29.40, "end": 33.84, "layout": "split", "enter": "slide", "scene": {"type": "promptLog", "title": "AI Prompt Testing Log",
        "engines": [{"src": "logos/chatgpt.png", "name": "ChatGPT", "at": 31.76}, {"src": "logos/perplexity.svg", "name": "Perplexity", "at": 32.40},
                    {"src": "logos/gemini.png", "name": "Gemini", "at": 33.04}],
        # added: example prompts and results (no screenshot of the real log yet)
        "rows": [{"prompt": "best AEO checklist for agencies", "hits": [True, False, True]},
                 {"prompt": "how do I get cited by ChatGPT", "hits": [False, True, True]},
                 {"prompt": "AI visibility audit template", "hits": [True, True, False]}]}},
    {"start": 33.84, "end": 36.92, "layout": "soft", "scene": {"type": "stack", "fanAt": 35.38, "label": "Unlimited websites",
        # added: placeholder site names
        "sites": ["client-three.com", "client-two.com", "client-one.com", "yourbrand.com"]}},
    {"start": 36.92, "end": 40.40, "layout": "cta"},
]

# --- sound cues (thinned to 7; see plan.md) -------------------------------------------------------------
sfx = [
    {"at": 1.05, "file": "hit.wav", "db": -16},          # 1,200 lands
    {"at": 6.30, "file": "whoosh-up.wav", "db": -18},    # into the dark score card
    {"at": 8.40, "file": "thump.wav", "db": -14},        # TMV logo
    {"at": 10.24, "file": "whoosh-down.wav", "db": -18}, # into the full-screen run
    {"at": 25.08, "file": "pop.wav", "db": -18},         # first tick
    {"at": 29.36, "file": "whoosh-up.wav", "db": -16},   # Plus: slide
    {"at": 38.30, "file": "hit.wav", "db": -13},         # AUDIT
]

reel = {"video": "cut.mp4", "duration": 40.4, "theme": "tmv", "face": {"x": 0.5, "y": 0.35},
        "hook": {"lines": ["1,200 SEOs use", "this one sheet"], "end": 2.92},
        "segments": segments, "captions": captions, "cta": {"keyword": "AUDIT", "at": 38.30},
        "sound": {"music": "../../reference/05_audio/stems/20_music.mp3", "sfx": sfx}}
(HERE / "reel.json").write_text(json.dumps(reel, indent=1, ensure_ascii=False), encoding="utf-8")

# logos the scenes use, copied into the reel folder (Remotion's public dir)
(HERE / "logos").mkdir(exist_ok=True)
for name in ["chatgpt.png", "perplexity.svg", "gemini.png", "tmv-red.png"]:
    shutil.copy(HERE.parent.parent / "assets" / "logos" / name, HERE / "logos" / name)

for c in captions:
    print(f'{c["start"]:6.2f}  ' + " ".join(("*" + w["w"] + "*") if w.get("accent") else w["w"] for w in c["words"]))
