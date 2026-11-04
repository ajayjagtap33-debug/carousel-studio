# Script structure — reverse-engineered from 49 Nick Saraev reels

Every one of the 49 reels follows the same skeleton. There are two variants: **single-tool** (39 reels) and **listicle** ("N free plugins", 10 reels).

## Hard numbers (target these)

| Metric | Median | Range |
|---|---|---|
| Runtime | **35 s** | 21–58 s |
| Spoken words | **146** | 95–235 |
| Speaking rate | **~246 wpm** (fast, no pauses) | 205–290 |
| First word | **0.0 s**, with no intro or silence | — |
| Sentences | ~8–10, each one line of caption | — |

Single-tool reels run 22–40 s (about 100–160 words). Listicles run 35–58 s (about 150–235 words), roughly 35–45 words per item.

Longer reels did slightly better (log-likes vs duration r = +0.30), mostly because the long ones are listicles. Speaking rate and cut rate don't predict likes.

## The 5-beat skeleton (single tool)

| # | Beat | Length | What it does | Template |
|---|---|---|---|---|
| 1 | **HOOK** | 1 sentence, 0–4 s | Huge outcome + "free" / "no longer pay" | "You can now **[dramatic outcome]** with Claude Code, **completely free**." |
| 2 | **NAME + PROOF** | 1 sentence | Names the tool, then social proof | "It's called **[Name]**, and it's a free, open-source **[category]** that's already crossed **[N] stars on GitHub**." |
| 3 | **MECHANISM** | 2–4 sentences | Input → what it does → output, in "you just / then it'll" steps | "You just **[give it X]**, and it'll **[action 1]**. Then it'll **[action 2]**…" |
| 4 | **PLUS / BONUS** | 1 sentence | One extra feature or a takeaway on ease or price | "**Plus**, it also **[extra]**, so **[benefit]**." |
| 5 | **CTA** | 1 sentence, last 3–4 s | Comment a keyword for the link (lead magnet → DM automation) | "So if you want to try this for yourselves, just comment **[WORD]** down below and I'll send you the link directly." |

## Listicle variant

1. **HOOK**, usually an imperative ultimatum: "Don't use Claude Code until you've installed these **five** plugins." / "If you're new to Claude Code, you need these **five** free plugins."
2. **ITEM × N**: "The first is **[Name]**, which **[one-line benefit]**. [One proof or detail sentence.]" → "The second is…" → "The third…" → "**And finally**, there's **[Name]**…"
3. **CTA**: "…comment **[WORD]** and I'll send you **the links** directly."

There is no intro, recap, or outro. Each item gets 1–2 sentences, about 8–10 s.

## Verbal tics and stock phrases (with frequency across 49 transcripts)

| Phrase | Reels |
|---|---|
| "free" | 36/49 |
| "want to try / wanna try (this for yourselves)" | 34/49 |
| "comment ___ (down below)" | ~49/49 (all captions) |
| "I'll send / DM you the link directly" | 45/49 |
| "Plus, …" (bonus beat) | 23/49 |
| "you just [give / tell / point / install / drop / paste]…" | 23/49 |
| "It's called ___" | 22/49 |
| big numbers (160,000 stars, 7 billion tokens, 600 models…) | 22/49 |
| "open source" | 19/49 |
| "crossed N stars on GitHub" | 13/49 |
| "And finally, …" | 11/49 |
| "completely free" / "for exactly zero dollars" / "without paying for anything" | very common |
| "literally", "even", "entire", "every single", "all on its own" | intensifiers in nearly every reel |

**Voice:** second person ("your Claude Code", "you just…"), present tense, all benefits. He never explains how the tool works under the hood beyond one line. Every claim comes with a number.

## Hook types (with engagement)

See [hook_bank.md](hook_bank.md) for every hook verbatim.

| Hook type | Example | n | Median likes | Median comments |
|---|---|---|---|---|
| Listicle ultimatum | "Don't use Claude Code until you've installed these five plugins." | 10 | **3,864** | **5,076** |
| Problem / fear | "If you use Claude Code with multiple skills… your PC might have gotten hacked." | 4 | **4,420** | **5,607** |
| "Someone just…" | "Someone just built the world's biggest prompt library and made it completely free." | 3 | 3,802 | 7,119 |
| "This free AI tool lets you…" | "This free AI tool lets you clone any website with just a single screenshot." | 7 | 3,387 | 4,650 |
| "[Big brand] just dropped…" | "Cloudflare just open-sourced an AI skill that finds security holes in your vibe-coded app." | 7 | 2,311 | 2,839 |
| "You can now…" | "You can now clone any app with Claude Code, so you never have to pay for a subscription again." | 13 | 2,261 | 3,475 |
| "You don't need to pay for X anymore" | "You don't need to pay for expensive SEO tools anymore." | 4 | 1,845 | 3,062 |
| Viral news story | "People are now hacking their TVs with Claude Code to remove all the bloatware…" | 1 | **116,571** (3.67M views) | 35,772 |

All reels median: 2,865 likes. (Some reels count in two groups.)

**Takeaways**
1. The breakout (reel 06, ~40× median) was **mass-market**: everyone hates TV ads. It was framed as a *trend that's blowing up* ("someone on Twitter…"), not as a dev tool. The #2 (reel 29, 24k likes) was **"run Claude Code completely free with almost unlimited usage"**, a money-saving angle for a huge audience.
2. **Listicles and problem/fear hooks** beat the "You can now…" default by about 1.7–2×.
3. Every hook combines three things: **who/what (Claude Code, a brand) + a dramatic outcome + free / no cost**.

## Topic selection pattern

- 100% are **AI tools / repos / plugins** the viewer can use today (GitHub repos, Claude Code plugins, MCP servers, free APIs).
- Recurring angles: **replace a paid tool** (Ahrefs, ElevenLabs, booking SaaS, Veo/Kling), **unlimited / free tokens**, **security of vibe-coded apps**, **run your business / agency with agents**, **scraping**, **design quality ("Apple-level", "anti-slop")**.
- Big-brand authority is reused heavily: Google, Anthropic, Nvidia, Cloudflare, DeepSeek, "former Google director".
- The same tool shows up in several reels (Agent Skills, Strix, Claude Code Setup, Omniroute/FreeLLMAPI). He **re-packages winners into new listicles**.

## CTA mechanics

- 49/49 end with **comment-to-get** (a ManyChat-style DM automation). The caption's first line repeats it: `Comment "WORD" to get [benefit restated].`
- Keyword = the tool's name or category, one word, in caps in the caption: CLAUDE (7), GOOGLE, CODING (3 each), AGENCY, VOICE, DESIGN, PLUGIN, VIDEO (2 each)…
- The CTA always starts with "So…" and runs 3–4 s at the very end. On screen it's the green glowing keyword (see ../12_design/).

## Caption (post description) format

```
Comment "WORD" to get [this free tool that does X] with Claude Code.

[Hook sentence]

[Sentence 2]

…one sentence per paragraph, the full spoken script…
```

Median caption length: 183 words.

## Fill-in script template

See [script_template.md](script_template.md).
