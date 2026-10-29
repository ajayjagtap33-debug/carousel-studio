# Sound design for studio mode (built 2026-10-28, first pass)

`python scripts/studio_sound.py <studio.json> <render.mp4> <out.mp4> [--music track.wav] [--bed 18]` adds the
layer to a render (needs the voice in it: render with `muted: false`). Writes `<out>-cues.md` for review and the
stems in `sound/`. SFX are synthesized into `assets/sfx/` on first run (delete a file to regenerate). The music bed
is synthesized (96 BPM in F, pads + soft bass + sparse pluck + soft kick) until Ajay picks a source: pass the track
with `--music`. Thinning rules in `cues_for()`: whooshes only on full ↔ tile/card, none when a count lands within
0.6s; ticks + hit on counts; pop on a group's first row, a `trio`'s first card and a `gallery`'s first thumbnail; whoosh + thump on a `type` card (a hard cut to a full-screen card) or a section caption (`NN / NN` kicker) or a
≥150px line; swish on a ring; keys + two-note tone in `chat`. `"sfx": false` on a scene silences it.

Researched 2026-10-28. Almost nothing here is measured: the levels and the "how often" numbers are editor practice,
the loudness target is the one hard number. Sources are in the session's research notes; the key ones are inline.

## Principle

Sound marks **structure**, not every animation. If a viewer notices the sound design as its own layer, it's too
much. Test every cut twice: SFX muted (a cue nobody misses gets cut) and voice muted (if it sounds like a game,
levels are too high).

## Moment → sound

| Moment | Sound | Length | Level vs his voice |
|---|---|---|---|
| Him full ↔ tile / card (layout change) | soft, airy whoosh, peak on the frame the move lands | 0.3–0.6s | −12 to −15 dB |
| Tile ↔ tile, same side or crossing | **silent** (too frequent to voice) | | |
| Section start (`02 / 10` caption, outline returns) | whoosh + low soft thump, or a 1–2s music sting | 1–2s | −8 to −10 dB |
| Big number counts up | sparse ticks fading out, then one soft low hit on the final value; music dips under it | count length | ticks −20, hit −10 dB |
| First card / row of a group | soft pop (pitch-drop blip) | 40–120ms | −15 to −20 dB |
| Later rows of the same group | silent, or a quiet tick a semitone higher each | 20–60ms | −18 dB |
| Ring / underline drawn | quiet marker swish timed to the stroke | stroke length | −18 to −20 dB |
| Chat question typing | soft key clicks on ~half the characters | typing length | −20 dB |
| Mismatch / warning (red tag) | muted two-note descending tone; never a buzzer | 0.15–0.3s | −12 dB |
| Cold open | **no music, no SFX** on the first line; bed fades in after it | | |
| Outro / sign-off on him | music swells up and resolves to an ending, no hard cut | 3–8s | music up once he stops |

**Never voiced:** keyword captions on the wall, body text, the wordmark, exits, anything landing on a hard consonant
(move it 2–4 frames into a gap instead), anything in the second after a hit.

**Budget:** body sections 4–8 audible cues a minute, at most 1–2 hits a minute and one per section. The hook minute
can run ~10. Above ~12 a minute it reads as a template.

## Music

- Minimal lo-fi / downtempo ambient-electronic / light tech pulse; no vocals, no busy lead melody. 85–110 BPM.
- Bed under his voice, 18–22 dB below it, ducked a further 6–10 dB while he talks (80ms attack, ~800ms release).
- Silent for the cold-open line; lifts ~3 dB on full-frame breathers; drops out under the one key stat of a
  section (silence is the emphasis); a change of track or a sting at section starts; swells at the end.

## Levels

Master the final mix to **−14 LUFS integrated, −1 dBTP** (YouTube turns louder mixes down and never turns quieter
ones up; LinkedIn publishes no target). His raw cut sits at about −21 dB mean, −0.5 dB peak, so it needs the
normalising pass anyway.

## Sources

- **SFX: synthesized in code** (pop, tick, whoosh, soft riser, key click, two-note tone): no licence, no Content ID
  risk, and they're simple signals anyway. Big hits/thumps sound thin synthesized, so take those from the free
  **Sonniss GDC bundle** (royalty-free, commercial video use, no credit) or **Freesound with the CC0 filter**.
  Keep them in `assets/sfx/` like the logos: our own, never from a random site.
- **Music: Ajay's call.** YouTube Audio Library is free and Content ID-safe on YouTube but says nothing about
  LinkedIn; Pixabay music carries real Content ID risk; Epidemic Sound **Commercial** (not Personal — brand content)
  or Uppbeat paid cover both platforms.

## Pipeline (to build)

1. Cues come out of `studio.json` automatically: each layout change, scene type and `count`/`ring`/`chat`/`flag`
   moment maps to the table above, thinned to the budget; per-scene `"sfx": false` or `"sfx": [...]` overrides.
2. Remotion renders the picture with his voice as now (frame-exact).
3. Python builds the SFX stem from the cue list (WAVs placed at their times, at their levels).
4. ffmpeg: music bed ducked against his voice (`sidechaincompress`), `amix` voice + SFX + music (`normalize=0`),
   two-pass `loudnorm=I=-14:TP=-1`, mux onto the video.
