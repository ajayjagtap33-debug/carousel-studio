# Nick Saraev, recent videos: b-roll teardown (2026-10-30)

Read off the YouTube storyboard sprites (a frame every 5–10s, 3×3 per sheet), not by watching:
- `25KVZUg56_s`: How I'd Make $12,373/Mo as an AI Consultant in 2027 (28 min), sheets M0, M1, M2, M5
- `cSdTCIKrUiE`: What I'd Learn Instead of Prompt Engineering in 2027 (11 min), sheets M0, M2, M6
- `wNyge-SHo1o`: A Guide to Becoming a Solopreneur w/ Claude in 2027 (18.5 min), sheets M0, M3

To re-read: open the watch page, take `getPlayerResponse().storyboards.playerStoryboardSpecRenderer.spec`, and use the
last level (`storyboard3_L3/M{n}.jpg` + `&sigh=`). Navigating the browser to that URL shows one sheet.

## The one thing we do differently

**He starts from the idea; we started from our menu.** Our Nested Sequence 02 plan v1 had 35 beats in 6 shapes
(`trio` ×13, `words` ×10, `type` ×7, `compare`, `count`, `marks`). The cards changed their words, but the picture stayed the
same. In his videos almost every beat is a picture made for that sentence, and few of them repeat.

## What he puts on screen

| kind | his examples | what it does |
|---|---|---|
| **literal metaphor, often 3D** | iceberg (what people see vs the actual work), three doors (three jobs), a suspension bridge (the shift from prompting AI to managing AI), a ball rolling into a valley (the first question), a blob morphing lump → star (prompt v1 → v9), an isometric city (small businesses and enterprise), a star-shaped 3D form (developments) | the sentence, drawn as an object |
| **simulation** | dots jamming at the slowest step, with live per-minute counters and a clock; 3D layers with cubes passing through them (a system that does this) | the idea *happens*: you watch the bottleneck form |
| **real UI, rebuilt clean** | iPhone incoming call "New client", iMessage thread, email in an inbox, a search bar typing, a dashboard, a spreadsheet, a banking app balance, a notification feed, a dictionary entry ("role engineering") | the world the sentence lives in |
| **data as shape** | waffle of 100 (17% to 20%), honeycomb split, two squares sized 85/15, donut, bell curve, heatmap, radar chart (what it can do), line with a dip (the constraint) | the number becomes a picture you can see |
| **type** | split-flap board (AI CONSULTING / IN 2027, AUTOMATING JOBS), big serif title cards, Joe vs James comparison table, quote cards, an editorial collage of headlines, "Build. Sell. Stay." | section titles and the key line |
| **screenshots** | articles with one sentence highlighted, product pages, docs | the evidence, cropped to the line |

## The look

- Charcoal (#1a1a1a-ish), monochrome greys with soft 3D shading, one light serif display face, small sans for sub lines.
- His face lives in a small fixed tile at the right edge for most b-roll, and full frame between beats.
- Everything moves: slow camera drift on the 3D objects, things building on their words.
- Small grey sub-labels under every headline. **We don't take those** (Ajay's rule, 2026-10-29).

## How we get there in Remotion

- Most of it doesn't need a 3D engine: CSS 3D transforms (perspective, rotateX/Y) + gradient shading do the flip board,
  phone, receipt, bookshelf, doors, calendars and layers. SVG does the radar, waffle, bars and dot simulations.
- Real 3D (the morphing blob, the iceberg) needs `@remotion/three` + `three` + `@react-three/fiber`, which aren't
  installed yet. A shaded 2D SVG blob morph gets 80% of the effect without new dependencies.
