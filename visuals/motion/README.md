# Motion graphics references

236 AI-made motion videos from [prompt-motion.com](https://prompt-motion.com) (Claude Opus 5.5 pieces with the prompt behind each), archived so we can pick a piece as a template for a title card, promo, reel or explainer beat.

- [picks.md](picks.md): the ones chosen for our YouTube videos and reels.
- [by-use.md](by-use.md): start here. Reel, promo, title, explainer, data, demo, b-roll, code, music, ambient, character, showcase.
- [by-category.md](by-category.md): the site's own 11 categories (Product UI, Phone, Charts, Diagrams, Kinetic type, Shapes, Particles, Characters, Photos, Music, Code).
- `index.json`: every entry with tags, length, size, pace, uses, author and X post link.
- `local/` (git-ignored): `videos/`, `posters/`, `prompts.json`, `sheets/` (contact sheets by category). Videos and prompts belong to their creators; they stay on this machine. Borrow the pattern, never the piece.

## How to use one

1. Find the meaning of the beat in `visuals/catalog.md`; if nothing built fits, look here by use.
2. Watch `local/videos/<id>.mp4`, read `local/prompts.json[<id>]` for how it was described to the model.
3. Add what's worth building to `visuals/catalog.md` under its meaning with source key **PM** and the entry id; build new scenes in `broll/src/studio/`.

## Counts

pace: fast 50, slow 153, medium 33

use: explainer 149, demo 105, showcase 97, type 96, reel 74, music 50, ambient 49, promo 47, shapes 42, data 34, character 27, photos 23, code 21, broll 19, title 2
