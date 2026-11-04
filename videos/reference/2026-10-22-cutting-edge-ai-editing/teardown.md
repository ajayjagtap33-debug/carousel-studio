# Teardown: The Cutting Edge School — "Full AI Editing Automation on Claude Opus 5.5"

`youtube.com/watch?v=9ned78Lb_j8` · 23:48 · 2026-10-22 · screen-recording walkthrough.
Sampled on scene change (148 cuts). Frames `frames/NNNN.jpg`, sheets `sheets/sheet-NN.jpg`;
the index→timestamp table is in the build log, cuts are irregular.

**A different genre from the Saraev video, and worth keeping for exactly that reason.** There are
almost no designed graphics here. This is the reference for the part of a video where you are
*showing the thing on your screen* — which is the half the designed-b-roll style can't cover.

---

## 1. The frame

Three states, and he moves between them constantly:

| state | what it is | share of runtime |
|---|---|---|
| **Talking head** | Warm lamp-lit living room, laptop on lap, shallow DOF, cinematic grade. Nothing overlaid but captions. | ~30% |
| **Full-frame screen recording** | The real browser, real tabs, real cursor. His face shrinks to a circular PiP. | ~55% |
| **Inserts** | Illustrated scenes, stock footage, other people's pages, clips of his own videos | ~15% |

- **Captions are burned in** the whole way: white, bold, sans, centred low, a few words at a time.
  They are the only persistent graphic in the video.
- **Section breaks are near-black frames** (f15, f18, f29) — a brief fade to a dark card rather
  than a designed chapter card.

## 2. The face PiP — the one technique worth stealing here

During screen recording his face becomes a **circle with a thin light ring**, roughly 10% of frame
width, and it **relocates between corners**: top-right while he works in the left pane (f25–30),
bottom-left once the action moves right (f31–60, f49–58).

It is not a fixed box the content must avoid — the face moves to wherever the screen is quiet.
That is the opposite of our current `face: left | right | none` model, which asks the *content* to
move. For screen recordings, where we don't control the layout, **moving the face is the right way
round**.

## 3. How he handles screen recordings

- **Real, uncleaned browser.** A dozen tabs, his own bookmarks, the actual URL bar. No mock, no
  redraw. It reads as "this is my machine", which is the entire credibility of the format.
- **Zoom to the region** rather than cutting to a new shot: the invideo editor sequence (f51–57)
  pushes into the inspector panel while the timeline stays visible at the edge.
- **Cursor as the pointer.** No arrows, no circles, no highlight rings drawn in post — he just
  moves the mouse to what he's talking about.
- **Loading states are left in** (f49, f36): the spinner stays on screen. He talks over the wait
  instead of cutting it, which keeps the "this is real, unedited" read.
- **Long holds.** Some screens sit for 30–60s with no cut at all (note the gaps in the scene list:
  13:43 → 15:38). The talking carries it; the screen is the evidence, not the pacing device.

## 4. The insert library

| treatment | what it looks like | used for |
|---|---|---|
| **AI-illustrated scene** | Warm painterly anime-style stills — a person on a couch with a phone, an editor at a desk, a studio full of editors with "GOOD VIDEOS BUILD BIGGER BRANDS" on the wall | Aspirational / narrative framing where no real footage exists (f8, f10, f14, f17) |
| **Stock footage** | A man on a phone in an office, a podcast rig, hands typing at a monitor | Generic statements about work (f111, f112, f116) |
| **Split: face + vertical** | His talking head on the left, a 9:16 reel playing on the right with its own title card | Showing a reference piece without leaving himself (f110) |
| **Timeline macro** | Extreme close-up of an NLE timeline — clip names, timecode, coloured tracks, scrubbing | Texture; "the work" as an image (f114) |
| **Competitor pricing page** | Full-frame real screenshots: Adobe CC, Epidemic Sound, Envato — plans and prices, untouched | Cost comparison, shown not stated (f115, f117, f118) |
| **Own back-catalogue clip** | A previous episode playing, with a lower-third bar naming it: `Full Video Editing Course · Ep 1 · … / From The Cutting Edge School` | Internal linking (f145) |
| **Agent chat mock** | Dark UI, a sent message bubble, then `invideo · invideo editor` with `Thinking..` | The ask-then-wait moment (f21) |
| **Own landing page** | The course page, full-frame, cursor moving | The CTA (f147) |

**Note what is missing:** no source strips, no pulled quotes, no charts, no diagrams, no hero
numbers. When he cites a price, he shows the pricing page. That is the whole citation method.

## 5. What to take, and what not to

**Take**
1. **Circular face PiP that relocates** between corners during screen recording. Our model should
   allow a `pip` mode where the *face* moves, distinct from the designed-b-roll mode where the
   content keeps a side clear.
2. **Show the real screen for real-screen claims.** A pricing page screenshot beats a drawn price
   comparison, because it is checkable.
3. **Leave loading states in.** It costs nothing and buys credibility.
4. **Lower-third bar naming a clip** when you cut to your own earlier video.
5. **Long holds are fine** when the screen is the evidence. Not every second needs a new element.

**Don't**
- The AI-illustrated lifestyle stills. They're the weakest thing in the video — generic, off-brand,
  and they'd fight Ajay's hand-drawn library for the same job. Our `person.*` cast already covers
  "a person doing a thing", on-brand and free.
- Burned-in captions across the whole runtime: that's an editing decision for Vids, not something
  our b-roll clips should carry (they'd double up with YouTube's own).
- Uncropped 12-tab browser chrome if the tabs are readable and personal.
