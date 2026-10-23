# Grow as an individual marketer — run sheet

One canvas, 17 stations, ~8900 x 7400. Open `canvas.excalidraw` at excalidraw.com.
Stations sit far apart on purpose: zoom to one and the others are off screen.
25 min — roughly 2 / 8 / 12 across the three branches, plus the close.

## Driving it
- **Zoom to fit** once at the start so the room sees the shape: a hub and three branches.
- Then work down one column at a time. Arrows show the path.
- Scroll wheel + space-drag to move. Don't try to read the whole canvas on a projector.
- Nothing is hidden, but at presenting zoom only one station is on screen at a time.

## Before you start
- Ask the editor privately what he'll say, so the number isn't a surprise to you.
- Give the HR person a heads-up that a question is coming. Don't rehearse the answer.
- Have the teleprompter open in a window.
- Pick your volunteer for the live exercise — ideally someone in PPC.

## The path

**hub (1 min).** Specificity is over. Two things make you worth more: doing more than the role
used to take, and letting people see you do it. Three branches, the first one quick.

**Branch 1 — Widen what you cover (2 min).** `b1t → b1a → b1b`
The sentence to drop is "that's not my job." A writer picks up some on-page SEO. A designer
picks up some copy. You don't have to be good at it — you have to stop handing it over.

**Branch 2 — Be faster (8 min).** `b2t → b2a → b2b → b2c → b2d → b2e`
- `b2a` is the whole argument. It's the one red statement on the canvas — let it sit.
- `b2b` — ask the editing question, then **type their answer into the dashed box, live.**
  The comparison gets built in front of the room instead of being pre-printed.
- `b2c` — the promotion question. No answer on the canvas. Let them sit with it.
- `b2d` — the exercise, the actual takeaway. Read the five steps, then run your volunteer's
  real workflow through the empty box below them. If the room's flat, skip it and talk.
- `b2e` — six things already done, then "simplifying counts."

**Branch 3 — Be visible (12 min).** `b3t → b3a → b3b → b3c → b3d → b3e`
- `b3a` — two hands-up questions. Wait for the hands.
- `b3b` — six things it does for you. Your job-search story goes on "it's a credential."
- `b3c` — four objections with their fixes. Run them fast.
- `b3d` — 30-second teleprompter demo, then the 45-second format. Give a PPC and a content
  example from this team's own work.
- `b3e` — two doors. Yourself first, us second.

**close (1 min).** One workflow on paper, one 60-second video, this week. Offer to look at
either, privately.

## Conventions on the canvas
- **Red dashed box with a `?`** = stop and ask the room. No names anywhere — you pick who.
- **Grey dashed box** = empty on purpose, you write in it live.
- Red appears once more, on the one big argument in `b2a`. Everything else is ink and grey.

Where a shape says it faster than a sentence, it's a shape:
- `b2b` — two bars. The long dashed one is blank; you draw or type their answer into it, and
  the little hatched one next to it is the hour. The gap does the arguing.
- `b2d` — the exercise as a five-step pipeline, left to right.
- `b3e` — two doors, literally.
- Doodles from the art library sit beside most stations (clock, laptop, people, magnifier).

## Notes
- No platform statistics anywhere. Keep the industry claims qualitative.
- Confirm the editing figures are the ones you want on screen with the editor sitting there.
- Running long: cut `b3b` from six lines to three and shorten `b3d`. Don't cut `b2d`.

## Rebuild
```
python scripts/canvas.py talks/2026-10-23-grow-as-a-marketer --png
python scripts/canvas.py talks/2026-10-23-grow-as-a-marketer --png --only=b2d   # one station
```
Content is `canvas.json` (stations + links); layout is `scripts/canvas.py`.
Move a station by changing its `at: [x, y]` — arrows re-route themselves.
