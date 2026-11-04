# Storyboard: Tools I stopped paying for

Source: `brief.md` (your note from 2026-09-29) + reference cover (swipe/others/okaashish/19.png, the one post with numbers: 4,261 likes).
Handle: **@refluke.guy**. Accent: brand green. **Rendered 2026-09-29, 9 slides.** Ajay: dropped the OpenClaw slide (no paid tool to swap it with), cover now says "6 tools" + 2026 with bigger text, and the cover art is the paid logos on strings getting cut (`cut` visual). The tables below are the original 10-slide draft.

## Open questions (answer these before render)

1. **OpenClaw replaces what?** Your note has a blank. Slide 7 shows `____` until you fill it in.
2. **7, not 8.** You listed 7 swaps and the number on the cover has to match the list. Add an 8th, or keep it at 7?
3. **"AI tools" or just "tools"?** Excalidraw, Immich and Miro aren't really AI tools, so the cover says "7 tools". Say if you want "AI" back in.
4. **Hyprnote is now called Char.** hyprnote.com redirects to char.com. I used the Char icon and the name "Hyprnote". Keep that name, or switch to "Char"?
5. **CTA** wasn't given. I drafted a comment question (slide 10). Or do you want a keyword → DM?

## Cover hooks

| | Pattern | Cover | Qualifier | Slide-2 payoff |
|---|---|---|---|---|
| **A** ✅ | H1 number + H2 subtraction | **7 tools** I stopped paying for | (here's what I use instead) | ① Screen Studio ($29) → Recordly |
| B | H2 subtraction | I cancelled 7 subscriptions | (and swapped each one for open source) | ① Screen Studio ($29) → Recordly |
| C | H3 self-sorting | How many of these are you still paying for? | (7 tools with an open-source swap) | ① Screen Studio → Recordly: "still paying?" |
| D | H7 named idea | My open-source stack | (7 paid tools it replaced) | ① Screen Studio → Recordly |

Cover art (acts out the hook, our own cast): `person.point` with **scissors** on the left, `bot.stand` with an open **toolbox** on the right. Scissors + toolbox are new doodles for the library.

## Slides

Swap slides: number badge, short headline (the job), optional one-line body, then the **swap** visual: paid tool's logo (crossed out, with its tag) → arrow → open-source logo in a green card tagged "open source", plus a character.

| # | Job | Headline | Body | Swap (paid → open source) | Character | Source |
|---|---|---|---|---|---|---|
| 1 | hook | **7 tools** I stopped paying for | (here's what I use instead) | scissors + toolbox art | person.point, bot.stand | hook A · qualifier `added` |
| 2 | ① | Screen recordings | — | Screen Studio **$29** → Recordly | person.point | brief |
| 3 | ② | Voice to text | Talk, and it types for you. | Wispr Flow → Handy | person.talk | brief · headline/body `added` |
| 4 | ③ | Whiteboards | This carousel is drawn in it. | Miro → Excalidraw | person.write | brief · headline/body `added` |
| 5 | ④ | Photo backup | Your photos, on your own server. | Google Photos → Immich | person.cheer | brief · headline/body `added` |
| 6 | ⑤ | Meeting notes | — | Granola → Hyprnote | person.listen | brief · headline `added` |
| 7 | ⑥ | An AI assistant | One that runs on your own computer. | **____** → OpenClaw | bot.busy | brief · **paid tool missing** · headline/body `added` |
| 8 | ⑦ | SEO research | Keywords, rankings and backlinks. | Semrush → OpenSEO | person.think | brief · headline/body `added` |
| 9 | recap | My open-source stack | — | 7 logo chips | bot.wave | headline `added` |
| 10 | cta | Which one are you still paying for? | (tell me in the comments) | — | person.shrug + bubble | `added` |

Only one price is on the slides ($29 for Screen Studio, from your note). The other paid tools have no tag, and nothing says "free" (OpenSEO's hosted plan, for one, is paid).

## To build at render (after approval)

- New visual `swap` in `scripts/render.py` (`VIS`).
- New doodles `scissors` + `toolbox` in `scripts/library.py`.
- Storyboard field `handle` (added): puts `@refluke.guy` in the chrome instead of `@theajayjagtap`.

## Logos (all in `assets/logos/`, copies in `swipe/logos/`)

Downloaded from each tool's own site or official GitHub repo: handy, wispr-flow, excalidraw, miro, immich, google-photos, hyprnote (Char icon), granola, openclaw, openseo, semrush. recordly + screen-studio were already there.
