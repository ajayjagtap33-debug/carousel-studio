# Storyboard: ChatGPT dots, 8 jobs to hand off

Source: Ajay's pasted notes (2026-09-30). 11 slides. v3: dots mascots + OpenAI naming (v2: number on the cover, self-explanatory titles, a scene on every slide).

## Naming (v3)

OpenAI calls the product **dots** (lowercase, see the DevDay keynote wordmark) and each agent **your dot**.
So on the slides:
- "dots" only appears as the big green wordmark on the cover, next to the mascots, with "(ChatGPT's new always-on agents)" underneath so nobody reads it as punctuation.
- In running text it's always "**your dot**", never a bare "Dot".
- Whenever a slide shows the agent doing something, it's one of OpenAI's dots mascots; our hand-drawn person is always "you".

## Cover

**Repurposed from okaashish ref 16** ("12 Types of AI Users": a grid of icons over doors, with two characters looking at it).
v3 (Ajay, 2026-09-30): **8 jobs** / I'd hand to / **dots** (green wordmark) / *(ChatGPT's new always-on agents)*, then the four dots mascots lined up as in OpenAI's keynote. Qualifier: `added`.

Other refs that could fit instead, if you prefer:
- ref 19 (arc of blank cards + "to get these 8 things done")
- ref 13 (big coloured number)

## Slides

Titles say the job on their own. The line under each title adds the context.

| # | Title | Line under it | Scene | Source |
|---|---|---|---|---|
| 1 | **8 jobs** I'd hand to **dots** | (ChatGPT's new always-on agents) | the 4 dots mascots | notes · qualifier `added` |
| 2 | ChatGPT waits for you. **Your dot keeps working when you're gone.** | — | person with coffee ("you: offline") · clock · blue dot at laptop ("your dot: still working") | notes · chips `added` |
| 3 | ① Watch a price for you | It keeps checking, and only pings you when the iPhone drops below ₹60,000. | frog dot with magnifier → big price tag "₹60,000" → bell "ping!" · person relaxing | notes #7 |
| 4 | ② Turn your inbox into a to-do list | A fresh list every evening. | Gmail logo fans out to: Replies I owe / Deadlines in threads / Newsletters: skipped | notes #5 + #8 |
| 5 | ③ Brief you before every meeting | Built from your calendar, emails and docs. | Calendar + Gmail logos → notebook "5-min brief" → person reading | notes #6 |
| 6 | ④ Hunt jobs and vet the companies | Only the ones worth applying to reach you. | blue dot at laptop · 3 briefcases ✗ ✗ ✓ "worth it" | notes #3 |
| 7 | ⑤ Research a big question | It keeps digging and comes back with evidence. | "Is AI search cutting website traffic?" · person thinking · yellow dot reading → book "evidence" | notes #4 (question paraphrased) |
| 8 | ⑥ Coach you, one lesson a day | It picks what's next and remembers what you've done. | cap "Python" · Mon ✓ Tue ✓ Wed ✓ Thu · person writing + yellow dot with bulb | notes #9 |
| 9 | ⑦ Catch repeat customer requests | It watches reviews, tickets and Slack. | 3 speech bubbles "+1" · Slack logo · radar dish · pink dot in headphones "flagged!" | **`added`** (OpenAI launch example) |
| 10 | ⑧ Find opportunities you'd miss | Gigs, talks, grants: pick the area. | excited frog dot with a butterfly net · floating chips: grant, freelance gig, call for contributors, speaking slot · person cheering | notes #10 |
| 11 | You don't have to know what to ask AI anymore. **You can give it a responsibility.** | — | person + the 4 dots · "Which one would you hand off first?" | notes · CTA `added` |

What changed from v1, and why:
- **Cut:** the news scout and the standing-desk example (too generic / overlapping).
- **Merged:** the two email items, and "opportunity finder" with "find what I don't know to look for".

## New assets

- **Doodles added to the library** (they show up in the preview sheets and the `.excalidrawlib`):
  `tag`, `bell`, `calendar`, `briefcase`, `cap`, `radar`, `net`.
- **Logos** (`assets/logos/`):
  - `openai.svg` from openai.com/brand
  - `gmail.png` and `google-calendar.png` from Google's gstatic CDN
  - `slack.svg` from slack.com/media-kit
- **New visual types in `render.py`:**
  - `scene`: characters and props placed in the visual box, with labels, chips and arrows
  - `icons`: the cover grid
  - `fan` can now fan out `from` a logo or doodle

- `assets/brand/openai-dots/*.png`: OpenAI's dots mascots, 19 poses cut from the sheet Ajay supplied (see SOURCE.md). Use as `img.openai-dots/<pose>`.
