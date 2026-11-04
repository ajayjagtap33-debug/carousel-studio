---
name: short-script-writer
description: Write a 25-60 second spoken script for a short-form reel (Instagram Reel / YouTube Short / TikTok) for one of Ajay's two brands, Refluke (his personal AI account) or TMV (Track My Visibility: SEO, AEO, AI search and AI visibility), and save it as a row in that brand's "content machine" Google Sheet. Use whenever Ajay asks for a reel script, short-form script, shorts script, "script for a reel", a listicle reel ("N free tools"), hands over a reference reel link to remake, picks an idea from a scout's Ideas tab, or gives a tool, trick, news item, search update, study, model update or rough idea to turn into a reel. Not for long YouTube videos (use fast-script / tmv-script-writer).
---

# Short script writer (v2)

Writes the spoken script for one reel, checks it reads as one connected argument about concrete things, and saves it to the brand's sheet. The b-roll and edit steps read its shot list (with the Beat column) later.

**Brands:** `references/brands.md` has each brand's account, sheet id, topics, formats, rules and CTA. Pick the brand first:
- **Refluke**: Ajay's personal Instagram and YouTube. AI news, tools, tricks, productivity and marketing with AI. Sheet "Refluke content machine".
- **TMV**: Track My Visibility. SEO, AEO, search changes, AI Overviews, AI visibility, content marketing. Sheet "TMV content machine". Stricter claim rules (brands.md).

First person ("I tested…") only for things Ajay says he did. Sheet columns and write rules: `references/sheet.md`.

The v1 scripts failed in two ways, and this skill is built around both:
- **No flow.** v1 wrote one short sentence per caption line, so the script read as a list of separate claims. Nick's spoken sentences average ~20 words and ~40% open with So / And / Plus / Then. Captions are chopped; speech is not. → `references/flow.md`.
- **Abstract.** v1 allowed "benefits" with no picture behind them ("get your site mentioned", "boost your workflow"). Every line must name a thing you could put on screen. → `references/flow.md` §2.

## 0. Inputs (ask only what is missing, in ONE message)

One of:
- **An idea in words** ("Claude can do motion graphics now").
- **A reference reel link.** Run `python "C:\Users\Ajay Jagtap\reel-creator\tools\ref_reel.py" <link>` → `reel-creator/reference/inbox/<id>/transcript.txt` + `info.json`. Label each of its sentences with its beat (hook, proof, step, analogy, plus, CTA) and note its link words. Take the **structure and rhythm, never the wording**. Research the subject yourself (step 1); don't trust the reel's numbers. If the download fails (login wall), ask Ajay to paste the reel's caption or say what it shows.
- **An Ideas-tab row** (the scout's pitch). Read the row and its sources with `get_values`.

Also: **CTA keyword** (suggest one if none: the tool name, or what they get: PROMPT, GUIDE, WORKFLOW). If the request is clear, don't ask anything; write.

## 1. Research first: the fact sheet

Before a word of script, fill this table in your notes:

| Field | Example |
|---|---|
| What it is, in 6 words | "a free Claude skill for motion graphics" |
| Who made it / where | GitHub user, Anthropic blog, X post |
| When | date released or announced |
| Proof numbers (each with a URL) | 12k GitHub stars, 3 days old, free tier 50 runs |
| Input → output | "you type a scene description → it renders a 1080p MP4" |
| 3 concrete things it does | named outputs, not categories |
| The pain before it | what people paid, how long it took |
| Who it's for | "anyone posting product videos" |
| An everyday comparison | for the "Think of it like…" line |
| The catch | waitlist, paid after N runs, Mac only |

Use WebSearch / WebFetch / Firecrawl. Read the primary source (repo README, official blog, changelog), not a summary of it. A number that can't be sourced goes in the script as `[NEED: …]` and in the sheet's Open questions. Never invent stars, prices, dates, users or results.

**Spine test:** write one sentence: "This lets [who] [do a concrete thing] [without the old pain]." If you can't, the idea isn't ready: say what's missing instead of writing.

## 2. Pick the format

Choose one playbook from `references/formats.md` (only the formats the brand lists in brands.md; the name must match that sheet's Format dropdown) and follow its beat order and word budget.

Targets: **25-60 s at ~245 wpm** = 100-240 words. Single-subject formats 110-160 words; lists 170-235. First word is content: no greeting, no intro, no recap.

## 3. Write the spoken draft

Follow `references/flow.md` while writing, not after:
- Write **sentences as Ajay will say them**, 10-25 words, not caption fragments. The caption split happens at edit time.
- One subject the whole way through. Each sentence answers the question the last one raised (what is it? → how? → then what? → so what?).
- After the hook, most sentences open with or carry a link word: **So** (result), **And** (adds), **Then** (next step), **Plus** (bonus), **But** (turn), **Which / that** (continues), **Because** (reason).
- Every claim names something filmable: a screen, a file, a number, a named app, a named output.
- One **"Think of it like…"** comparison to an everyday thing, right after the mechanism (most formats).
- Optional close before the CTA: **"Most [tools/people] [do X]. This one [does Y]."**
- CTA, always last: "So if you want [the prompt / the guide / the link], just comment WORD down below and I'll send it to you directly." Vary the wording a little between reels; keep comment + WORD + DM.

## 4. Write 3 hooks

Three options, each a different pattern from the brand sheet's Hooks tab (read `Hooks!A:F` once per session; it holds Nick's 49 hooks with likes, plus the brand's own winners as they come). Highest performers: trend story ("People are now…"), money-saving "You can now… free", listicle ultimatum, problem/fear. Each hook = **who/what people know + a dramatic, specific outcome + free / time saved / no longer pay**, in one sentence. Patterns only, never copied phrasing. The second sentence must pay the hook off (name it or prove it).

## 5. Check (fix, then re-check; don't just report)

Run every check in `references/flow.md` §4 on the draft. The short version:
1. **Link test:** for each pair of sentences, name the link (adds / result / next step / bonus / turn / reason). A pair with no link, or two sentences that could swap places, gets rewritten.
2. **"It" test:** every it / this / they points to the last thing named.
3. **Picture test:** every sentence has at least one filmable noun. Banned words (flow.md §2) are gone.
4. **Proof test:** every number and claim is in the fact sheet with a source. `[NEED]` items listed.
5. **Read-aloud test:** a sentence over ~28 words, or one where you'd breathe mid-thought, gets split at a link word.
6. **Length:** words / 245 × 60 inside the format's range.

## 6. Output in chat (exact)

```
## Hooks
1. [pattern] …
2. [pattern] …
3. [pattern] …   ← recommended (why, in 5 words)

## Script  (format · N words · ~N s · CTA: WORD)
[the spoken script, one sentence per line, using the recommended hook or the one Ajay picked]

## Shot list
| # | Beat | Line (first words) | On screen | Who makes it |
|---|---|---|---|---|
| 1 | HOOK | … | literal visual: page, counter, screen recording, logo tile, before/after | Ajay records / we build |

## Caption
Comment "WORD" to get [what they get, restated].

[the spoken script, one sentence per paragraph]

#tag #tag #tag #tag #tag

## Sources
- claim → URL

## Open questions
- [NEED: …]
```

Beat names: HOOK, PAYOFF, PROOF, STEP, ANALOGY, CONTRAST, PLUS, ITEM n, STAKES, CTA. The shot list is literal to what's said, one row per sentence.

## 7. Save to the sheet

Append one row to `Scripts` in **the brand's sheet** exactly as `references/sheet.md` says (ID, status `Drafted`, every column, the word and seconds formulas). If the idea came from the Ideas tab, set that row's Status to `Scripted` and its Script ID. Re-read the row with `get_values` to confirm it landed, then give Ajay the sheet link.

When Ajay edits a script ("change the hook", "shorter"), update **the same row** (find it by ID); don't append a new one. When he approves, set Status `Approved`.

## Voice

Ajay's voice: conversational, second person, present tense. TMV adds its own voice rules (brands.md). If `write-like-me` is available, load it for a final voice pass, but the structure, link words and facts from this skill win over any voice change. Stock words to use sparingly: literally, even, entire, every single, all on its own, completely free.
