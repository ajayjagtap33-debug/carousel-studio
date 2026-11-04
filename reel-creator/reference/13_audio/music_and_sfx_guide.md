# Music & sound-effects reference

**How this was measured:** each reel's audio was split into a **voice** stem and a **music + SFX** stem with Demucs (`../05_audio/stems/`). Tempo, key, loudness and brightness come from librosa on the music stem (`music_features.csv`). Spectrograms for reels 06, 21, 29 and 41 are in `spectrograms/`.

Instagram doesn't expose a sound attribution for these reels: the music is baked into the video, not added as an IG sound. **To identify the actual tracks**, play `../05_audio/stems/NN_music.mp3` into Shazam, or upload it to an AI music finder (e.g. Cyanite / AIVA similarity search, Epidemic Sound "find similar"). The stems have the voice removed, so recognition works much better than on the original reel.

## Music bed: the spec

| Property | Finding (49 reels) | What to use |
|---|---|---|
| Presence | Music is audible for **~84% of runtime** (median), starting at 0.0 s and running to the last frame | A bed under the whole reel, with no intro sting and no silence |
| Level | Bed is very quiet: **~ −48 dBFS RMS**, roughly **25–30 dB under the voice** in the stems (≈ 8 dB in the full mix between words). It's felt more than heard. | Duck music to about −28 to −30 dB under the voice; the voice must be 100% intelligible at 250 wpm |
| Tempo | Tight cluster: **112–117 BPM in 30/49**, overall 103–172 | Pick ~110–120 BPM |
| Key | **E minor (21) or its relative G major (15) = 36/49**, C major 12 | Strong sign the same 1–3 library tracks are reused. Pick one signature track and reuse it so it becomes part of the brand. |
| Consistency | A chroma + MFCC fingerprint clustered **all 49 beds into one group**: tonally they are near-identical across 49 reels. This method can't prove it's literally one track; Shazam the stems to confirm. | Treat the music as a brand constant, not a per-reel choice |
| Timbre | Dark and warm: spectral centroid ~1.4 kHz. Energy sits in the **sub/bass (30–300 Hz)** with sustained pads. Almost no melody or vocals in the highs. | Minimal, ambient / lo-fi-tech / "corporate tech minimal" bed, bass-pad driven, no lyrics, no busy hi-hats |
| Movement | Low "boom / sub drop" impacts every ~3–6 s that line up with section changes (clear in the reel 06 spectrogram at 3.5, 10, 15, 19, 25, 30, 33 s) | Put a soft sub-boom on each new beat of the script (tool reveal, each list item, CTA) |

**Search terms for sound-alike tracks:** "minimal tech ambient", "dark lo-fi beat no vocals", "tech documentary underscore", "subtle corporate tech 115 bpm E minor", "deep house minimal pad bed".

## Sound effects

| SFX | Evidence | Where used |
|---|---|---|
| **Sub boom / low impact** | Vertical low-frequency blooms in music stems every ~5 s | Tool-name reveal, list item cards ("THE SECOND…"), stats |
| **Whoosh / swish** | Broadband vertical streaks (to 8 kHz) at cuts | Transitions into full-screen B-roll |
| **Click / pop / tick** | Short high transients | Captions popping in, UI cards appearing, rolling number counters |
| **Glitch / digital** | Reels 26 and 41, pixel "glitch" hooks | Hook logos that scramble in |

- **How often:** a strong SFX transient lands on about **16% of cuts** (strict threshold, music stem) and on about **45% of cuts** with a looser threshold on the full mix. In practice that's **roughly every 2nd–3rd cut, and not every cut**. Talking-head cuts are mostly silent; reveals get the hits.
- Median **12 cuts per reel, about 2–6 audible SFX**.
- **Listen:** `sfx_samples/NN_cutK_TT.TTs.wav` holds 88 one-second clips (0.3 s before to 0.7 s after a cut) from the music+SFX stem, up to 4 per reel.

## Voice

- About **246 wpm**, close-mic'd (foam-covered broadcast mic visible in many reels), dry room with no audible reverb, and compressed to stay level.
- No pauses between sentences: breaths and gaps are cut out (jump cuts on the talking head hide them).
- First word at **0.0 s** in 49/49.

## Mixing recipe to replicate

1. Voice: high-pass ~80 Hz, compress (3:1 to 4:1), normalize to about −14 LUFS integrated for the final reel.
2. Music: one signature minimal bed (~115 BPM, minor key), low-passed around 6–8 kHz, sitting about −28 dB under the voice, running the whole reel.
3. SFX: sub-boom on structural beats, whoosh on B-roll entries, soft clicks on text/card pops. Keep them about −12 to −18 dB under the voice. Never cover a word.
4. Ending: music carries through the CTA with no fade-out stinger (the outro level equals the body level).
