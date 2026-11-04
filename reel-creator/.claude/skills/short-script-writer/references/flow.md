# Flow and concreteness

Measured on Nick Saraev's 49 spoken transcripts (`C:\Users\Ajay Jagtap\reel-creator\reference\03_transcripts\*.txt`):
352 sentences, **~20 words each**, and the most common first words are **So (64), And (41), It's (25), You (24), Just (23), Plus (21), Then (13)**. About 40% of sentences open with a link word. The clean captions in `10_script/all_scripts.md` look choppy because they are split for the screen; never use them as the model for spoken rhythm. Read 3-4 `.txt` files when you need the feel.

## 1. Flow: one argument, not a list of claims

**The chain.** A reel is one line of thought. The viewer silently asks a question after every sentence, and the next sentence answers it:

| Sentence does | Viewer asks next | Next sentence opens with |
|---|---|---|
| Hook: big outcome | "What is it?" | "It's called…" / "Someone on GitHub just…" |
| Names it | "Is it legit?" | "And it's already…" (proof) |
| Proof | "How does it work?" | "You just…" / "So you…" |
| Step 1 | "Then what?" | "And it'll…" / "Then it'll…" |
| Last step | "What do I get?" | "So you end up with…" / "And when it's done…" |
| Result | "What's that like?" | "Think of it like…" |
| Analogy | "Why not use what I have?" | "Most X… This one…" / "Plus…" |
| Bonus | "How do I get it?" | "So if you want…" (CTA) |

**Link words and what they promise.** Use the one that matches the real relation; a wrong link word is worse than none.
- **And** = adds one more thing of the same kind.
- **Then / And then / Next** = the next step in time.
- **So** = result or consequence of the last sentence. Also opens the CTA.
- **Plus** = a bonus, separate from the main mechanism. Once per reel.
- **But / Except** = a turn: a catch, or "the old way vs this".
- **Which / that / whose** = continues describing the thing just named (often a sentence fragment in speech, fine).
- **Because** = the reason.
- **And finally** = last item or last step.
- **Even** = escalation inside a sentence ("and even builds…").

**Swap test.** If two adjacent sentences could trade places without anything breaking, they aren't linked: either one is missing its link, or one doesn't belong.

**One subject.** The tool/trick/model stays the grammatical subject or object all the way through ("it", "your Claude", "you"). A sentence about something else (a side fact, a general AI opinion) breaks the thread. Cut it.

**Pronouns.** "It" = the last thing named. After naming a second thing (a model, a website), rename the main subject before using "it" again.

**Sentence length.** 10-25 spoken words. Under 8 words several times in a row = choppy list; split long ones only at a link word.

## 2. Concrete, not abstract

**Every sentence carries a picture**: a named app or brand, a file, a screen, a number, a person doing a thing, a named output. If the editor can't put something literal on screen for the line, the line is abstract.

| Abstract (rewrite) | Concrete |
|---|---|
| "It helps with your outreach." | "It writes your cold emails, follow-ups and LinkedIn replies." |
| "Get your brand visible in AI." | "Get your brand named when someone asks ChatGPT for the best CRM." |
| "It boosts your productivity." | "That 2-hour edit now takes 10 minutes." |
| "It has powerful features." | name the 2 features |
| "It works with lots of tools." | "It works with Notion, Gmail and Slack." |
| "Great for content creators." | "If you post product videos every week…" |
| "AI is changing everything." | delete |

**Banned words** (they carry no picture): seamless(ly), powerful, game-changer, streamline, leverage, unlock, revolutionize, supercharge, boost productivity, next level, cutting-edge, robust, solution(s), insights, optimize, various, workflow on its own (say which steps), "and more" (say what), "the future of".

**Specific beats general.** Three named things beat "lots of features". A real number beats "huge". A named paid incumbent (Ahrefs, ElevenLabs, Canva, Notion AI) beats "expensive tools".

**The "Think of it like…" line.** One comparison to an everyday thing the viewer already understands, placed right after the mechanism. It turns the mechanism into one picture.
- Good: something physical or a job people know ("a deep clean for your TV", "a security guard that double-checks his own reports", "handing a project to a coworker with the notes already attached").
- Bad: another tech thing ("like an API for…"), or a metaphor that needs explaining.

**The contrast close (optional).** "Most [tools/people] [do the usual thing]. This one [does the specific different thing]." Two sentences, the second shorter. Only when the difference is real and sourced.

## 3. Before → after (Ajay's AEO checklist reel)

v1 opening, as recorded:
> More than 1,200 SEOs and marketers are using this one Google Sheet to get their site mentioned in ChatGPT and Perplexity. It's a 250-point AEO-GEO checklist that we built originally for our team. You just go through it tab by tab from SEO Foundation to AEO, GEO, local visibility and tracking…

Problems: "get their site mentioned" has no picture; the tab names are categories the viewer can't see; the third sentence lists sections instead of showing what happens when you use it.

v2 direction:
> More than 1,200 marketers are using this one free Google Sheet to get their brand named when someone asks ChatGPT for a recommendation. It's a 250-point checklist we built for our own team, and every row is one fix, like putting the answer in the first two lines of a page. So you just open it, tick what your site already does, and it scores you across six areas on its own. Then it marks what's left by priority and impact, so you know which quick wins to do first…

Each sentence links (and → so → then), the subject stays "it/the sheet", and every line has something to show (a ChatGPT answer, one checklist row, ticking boxes, a score, a sorted list).

## 4. The checks (run on every draft, fix, run again)

Write the script one sentence per line, then next to each line, in your notes only:
1. **Link**: the relation to the line before (adds / next step / result / bonus / turn / continues / reason). Blank = rewrite.
2. **Question answered**: the viewer question from §1 this line answers. Two lines answering the same question = cut one.
3. **Picture**: the filmable noun in the line. None = rewrite.
4. **Source**: for any number or claim, the fact-sheet row. None = `[NEED]` or cut.
5. **Words**: 10-25. Fix outliers.

Then read the whole thing top to bottom at speaking pace. If you'd stumble, or the end doesn't follow from the hook (the hook promised X, the body delivered Y), fix it. Last: confirm the hook's promise is paid off by sentence 2 or 3, the CTA keyword appears once, and "free" is only said if it's true.
