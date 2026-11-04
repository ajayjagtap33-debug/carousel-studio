# Teardown: Nick Saraev, "How to Survive the Next 2 Years of AI"

Reference for a new video b-roll style. Source: youtube.com/watch?v=X1ObmRAgp5A (13:19, published 2026-10-15).
Method: full transcript + about 75 frames sampled every 5–12s across the whole video, plus half-second
sequences around 0:02–0:06, 0:22–0:24 and 1:39–1:48 to see the motion. Frames are in `frames/`
(private reference only, not for reuse). Anything marked *inferred* is my reading of the frames, not confirmed.

---

## 1. The numbers that define the style

| | |
|---|---|
| B-roll share of runtime | **~85–90%.** Face full-frame only for the first ~2s, a handful of 3–10s beats (2:16, 4:22, 5:18, 5:50, 8:04, 8:52, 13:17) and the end |
| New scene | every **~5–8s** |
| New element inside a scene | every **~1–3s**, on the word |
| Distinct visual states in 13 min | roughly **120–150** (*estimate from sampling*) |
| What gets drawn | nearly every concrete noun, number, example, source and list item he says |

The Excalidraw test I built had **1 new thing every ~8s** and 9 scene types. This video has **one new thing every
1–3s** and about 20 scene types. That's the gap you noticed.

## 2. Frame and layout

- **16:9 canvas inset as a sheet**: a warm off-white page with soft rounded corners, sitting on a slightly darker
  beige border (~1.5% margin). It reads as "a page", not a slide.
- **Face box**: small portrait (≈ 9% of frame width, ~3:4), rounded corners, soft shadow, **always at the right
  edge, vertically centred**. It stays the same size and place the whole time. Content is composed in the left ~85%.
- **One virtual canvas, a moving camera**: many scenes are one big board the camera pans and zooms across
  (0:22–0:25 pushes in on the "Short term" card; 1:39–1:52 slides left as the equation grows). Cards that were
  already shown stay put, so the viewer keeps their place.

## 3. Design tokens (observed)

| Token | What it looks like |
|---|---|
| Page | warm off-white (≈ #FAF9F6), border beige (≈ #EEEAE3) |
| Ink | near-black (≈ #1C1C1A); body grey (≈ #6B6B66) |
| Accent | **muted olive green** (≈ #5B6B3C) for active states, icons, pills, the "good" side |
| Dark card | near-black (≈ #161616) for "the thing that matters" (A human actor, phones, terminal, AI tile) |
| Headline font | condensed, high-contrast **serif** (Instrument Serif / Tiempos family look), with *one italic word* in the accent colour ("How *not* to", "changing *quickly*", "types of *risk*") |
| UI font | clean grotesk sans (Inter / Geist look) for labels, list rows, pills |
| Mono | for files and commands (`my-eval/`, `@checklist.md`) |
| Kicker | tiny letter-spaced caps above a title ("SHORT TERM", "COOLER TEMPERATURE", "OFFLINE, YOU CAN STILL") |
| Icons | thin-stroke line icons (Lucide look), in accent or ink |
| Cards | white, 1px hairline border, radius ~14px, very soft shadow. Active = 2px olive outline. Inactive = 40% opacity |
| Pills | black pill + white text (default), olive pill + white text (positive), grey (aside) |
| Colour only when literal | blue water in the jugs, green ticks, red/green only where it means something |

## 4. Scene vocabulary

What he uses, with the cue that triggers it. This is the list our new style should match.

| # | Scene | Triggered by | Example |
|---|---|---|---|
| 1 | **Kinetic headline**: serif words blur in one by one, italic accent word | the hook line, section openers | 0:04 "How *not* to / stupid status games" + floating UI chips ("+10 status", "Meeting accepted") |
| 2 | **Big number + words** | "three types of risk" | 0:08 "3 types of *risk*" |
| 3 | **Icon + one word** | an abstract idea | 0:08 clock + "The world is changing *quickly*"; "fragile"; key = "ownership" |
| 4 | **Voices strip**: 2–3 real people, clip + short quote + name + source line | "the people building AI say…" | 0:02 Amodei / Altman / Musk |
| 5 | **Section map**: 3 category cards, active one outlined, returns at every section change | "short-term… mid-term… long-term" | 0:22, 0:25 (zooms into Short term), 8:40 (Long term active) |
| 6 | **Running checklist**: list card that comes back with ticks as items get done | "quick hit list", "mid term" | 1:39 → 2:56 (3 ticks, 4th active) → 4:56 |
| 7 | **Source card**: a document/report as a card (type, title, pages, date), then zoom into its page | naming a report | 0:35 "OpenAI – Hugging Face Incident" → "I. Introduction" |
| 8 | **Article screenshot** in a browser frame + the key sentence pulled into a callout with the phrase underlined | "in France just a few days ago…" | 1:10 "At least 350 supermarkets…" |
| 9 | **Real chart, re-annotated**: source chart + crosshair marker + pill on the exact point | a stat from a study | 4:04–4:14 Stanford chart, "most AI-exposed", "19% below" |
| 10 | **Simple chart drawn from his words** (bars, slider, S-curve) | a trend he describes | 4:32 junior roles bars "no sudden drop-off", 9:04 AI capability S-curve |
| 11 | **Equation build**: stat tiles joined by × and = | arithmetic he says out loud | 1:45–1:52 2,000 × 14 × 2 = 50–60K → "$100–150" |
| 12 | **Mock UI** of the thing he describes (control panel, phone, authenticator, terminal) | "you can click a button to make it hotter" | 1:00 grocery fridge control, 3:28 SMS 2FA, 3:46 authenticator, 3:04 Claude Code |
| 13 | **Literal illustration** | concrete objects | 2:08 two $5 water jugs + "in the fridge", 10:52 house / kids / fence / dog |
| 14 | **Icon grid** that grows or swaps | "rogue agents", "10 or 15 tasks" | 0:45 grid of bots, 5:38 3×4 task tiles |
| 15 | **Cards that accumulate** across a line of thought | a run of "imagine if…" examples | 1:15–1:25 globe → water treatment → bank "Day 1" |
| 16 | **Flow / transform**: two things with arrows and small labels | "from one form into another" | 2:40 bank account ⇄ cash, "one form / into another" |
| 17 | **Before → after** with strike-through | "don't do X, do Y" | 3:46 ~~SMS codes~~ → *Use MFA* + "about 5 minutes" |
| 18 | **Ladder / hierarchy** | seniors stay, juniors replaced | 4:42 Senior / Mid / Junior → bot |
| 19 | **Progress comparison bars** | "from under 10% to over 50%" | 5:58 My eval: 3 months ago <10% / Now >50% |
| 20 | **Radial / concept map** | "define yourself by…" | 9:40 person + character / beliefs / principles / who you are |
| 21 | **Timeline** | then vs now | 10:16 1920s "no antibiotics", 11:30 1980s → now |
| 22 | **Pills** (micro-captions) on almost every scene | a phrase worth landing | "physical security", "still your money", "annoying, but worth it", "no path up" |

## 5. Motion grammar

- **Enter**: blur-to-sharp + small rise + fade (~0.3–0.4s), staggered per element. Text enters word by word.
- **Build, don't cut**: inside a section the board keeps growing; previous items fade to ~40% or move aside instead of disappearing.
- **Camera**: slow push-ins on the active card, pans to make room for the next item.
- **Scene change**: fast directional move with heavy motion blur (0:55 frame is pure blur), not a crossfade.
- **State changes**: an outline turns active, ticks appear, a strike-through draws, a counter fills, a marker lands on a chart point.
- **Face**: hard cuts between full-frame face and b-roll + face box. No shrink animation.

## 6. How the speech becomes visuals (the planning logic)

This is the part to copy. The patterns are inferred from mapping the transcript to the frames:

1. **The script is split into beats** of one sentence or clause, ~1–3s each. Every beat gets *something* on screen: a new element, a state change or a pill.
2. **Concrete words become objects.** Nouns → icon cards, numbers → stat tiles, named sources → source cards, examples → literal illustrations or mock UI.
3. **Structure becomes anchors.** "Three risks" and "quick hit list" turn into boards that come back with progress (active card, ticks). The viewer always knows where they are.
4. **Claims get receipts.** Every external fact shows its source: a quote with name and date, an article screenshot, the actual chart. Each source card carries a small "● SOURCE · publisher · date" line. The description lists the same sources.
5. **Pills compress what he's saying.** Usually 2–4 of his words, sometimes a paraphrase ("annoying, but worth it").
6. **Face returns for emphasis.** Full-frame face lands on opinion and persuasion beats ("I would 100% sort that out right now", "don't let anybody fool you").

## 7. How it was likely made (inferred)

- **Recorded first, then b-roll built to the transcript.** The timing lands on words.
- **Code-built motion graphics** from one component library and design system (React/Remotion-like): the same card,
  pill, kicker and icon components recur everywhere with exact spacing. Almost certainly scripted per beat by an AI
  (Claude) from the transcript, then reviewed.
- **Research step feeds the visuals**: the article screenshots, the Stanford chart, the report PDF and the three
  people clips are real assets, gathered and dropped into templated frames.
- **Face box composited on top** at a fixed spot.

---

# Proposal: a new video style for you (separate from the Excalidraw carousels)

Working name **"editorial"**. The carousel / Excalidraw look stays exactly as it is, and the `broll/` Excalidraw
video template stays as its own style. This would be a new, separate template.

## Borrow the system, not the skin

The rules in `CLAUDE.md` say we borrow patterns, never copy a creator's look. So we take the **system** (density,
anchors, sources, motion grammar, scene vocabulary) and give it **your own** palette and type. Three directions to pick from:

| | A. Ink & signal | B. Warm paper | C. Dark studio |
|---|---|---|---|
| Page | cool white #F7F7F5 | cream #F6F1E7 | charcoal #141414 |
| Accent | electric blue #2F5BFF | burnt orange #D9622B | lime #C6F432 |
| Headline | grotesk bold (Inter Tight / Geist) | serif (Fraunces / Newsreader) | grotesk bold |
| Feel | crisp, tech, close to SaaS UI | editorial, warm, closest to the reference | high-contrast, YouTube-tech |

Same structure for all three: one accent colour, one dark card colour, a sans UI font, a mono font, thin-line icons, hairline cards.

## Scene library v1 (build order)

1. Kinetic headline (word-by-word, accent word)
2. Section map (persistent, active state)
3. Running checklist (persistent, ticks)
4. Stat tile + equation build (× / =)
5. Icon cards that accumulate (with pills)
6. Source card: quote (person photo/clip you supply + name + date)
7. Source card: article screenshot + pulled sentence with highlighted phrase
8. Chart: annotate a supplied chart image (marker + pill) / draw bars, line or S-curve from numbers you say
9. Before → after (strike-through)
10. Flow / transform (arrows + labels)
11. Mock UI kit: phone, browser, terminal, app card with rows/toggles
12. Icon grid (grow / swap)
13. Ladder / hierarchy, radial map, timeline
14. Pills on everything + kicker labels

Plus the engine pieces the reference relies on: **one board with a moving camera**, **build-don't-cut**,
**blur entrances** and **motion-blur scene changes**.

## Planning rules for this style

- Beat sheet first: split the transcript into 1–3s beats; every beat gets an element, a state change or a pill.
- Target: b-roll ~70–90% of runtime, a new scene every 5–8s, a new element every 1–3s.
- Face full-frame only for the hook, opinion and persuasion beats, and the CTA.
- Only what you say: no number, claim or source you didn't say. Anything I wrote is marked `added` in the plan.
- Sources: when you cite something, the plan lists the asset needed (screenshot, chart, clip, photo). You supply
  it, or you OK me capturing a screenshot of a page you named. Nothing pulled in without your OK.

## What changes in the pipeline

- **You own the recording and the face.** I make the b-roll only. I still need the cut's **audio** to time it.
- **Output options**, since Google Vids caps a project at 50 clips:
  1. **B-roll runs**: one clip per continuous b-roll stretch (the reference would be ~10 runs), each the exact length
     of its stretch, with the right edge kept clear for your face box. You lay them over your cut in Vids.
  2. **One full-length b-roll track** the length of your cut, plain page during your face-only beats. You cut it in Vids.
  3. **Composite** like before (I place your face box). You said you don't need this one.

## Decisions for you

1. Direction A, B or C (or mix: e.g. B's serif + A's blue)?
2. Output: b-roll runs (1) or full-length track (2)?
3. Where should the face box sit? Right edge, vertically centred like the reference, or a corner?
4. Real people clips (like the Amodei/Altman/Musk strip): use them (you supply clips/photos and the source) or skip?
5. Next step: build the "editorial" template and test it on one of your real scripts or cuts. Which one?
