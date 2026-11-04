# TMV brand, as used on trackmyvisibility.com (read 2026-11-04)

Read from the site's Elementor kit (`post-13.css`), page CSS and background images. Use these, not guesses.

| Role | Colour | Where on the site |
|---|---|---|
| Red (primary) | `#B80000` | buttons, links, "Watch demo" |
| Yellow (secondary) | `#F1C557` | "Start 7-Day Trial" button, the "ChatGPT" accent word on the hero |
| Purple | `#763EB8` (stripes `#9D60E9`) | CTA band with pixel stripes, small purple links |
| Black | `#000000` | dark sections |
| Text | `#222222` (greys `#666666`, `#888888`, borders `#DDDDDD`) | body copy |
| Page | `#FBFAFB` (cards `#F9F9F9`, white `#FFFFFF`) | page background |
| Lavender tints | `#F4EFFF`, `#E1D5FB` | soft panels |
| Green | `#00810C` | positive numbers in the product |

Gradients:
- **Hero mesh**: an image, red/coral → pink → violet (`#BE4435`, `#C74152`, `#8B2E87`, `#360C96`). Copy:
  `carousels/2026-11-04-reddit-ai-mode-styles/assets/tmv-site-bg.png`.
- **Button gradient**: `linear-gradient(254deg, #7C3AED 20%, #FF6A3D 100%)` (violet → orange).
- **Purple band pixel stripes**: `assets/tmv-site-stripes.png` in the same folder (cropped from the site's banner).
- `theme/tmv.json`'s `hero` / `heroLight` gradients are our approximation, not the site's.

Type: **Helvetica Neue** everywhere (bold 700 headings, 500 buttons, 400 body; bold italic for emphasis).
The site's own web fonts (Roman 400, Medium 500, Bold 700; no italic) are in `assets/fonts/HelveticaNeue*.woff2`,
git-ignored because they're licensed. Free stand-in: TeX Gyre Heros (`assets/fonts/TeXGyreHeros*.otf`).
Buttons are full pills (radius 100px); cards radius 16px.

Carousel versions built on this: `carousels/2026-11-04-reddit-ai-mode-styles/site-red|site-violet|site-purple/`.

## TMV's DESIGN.md (final reference)

https://designmd.me/s/trackmyvisibility-drk69 (generated from the site, Nov 4, 2026). On top of the table above:
- Ink `#000000` for headings, charcoal `#1E1E1E` for body, `#666666` / `#888888` for secondary text, hairline `#E5E5E5`.
- **Gold `#F1C557` is the primary CTA / highlight colour; red `#B80000` is for links and gradients**, not primary CTAs.
  Purple `#763EB8` and coral `#D97757` are decorative (gradient layers), never semantic.
- Cards: white, 18px radius, `#ECECF2` border, shadow `rgba(80,60,200,.08)`. Shadows never above .2 opacity.
  Buttons and chips are pills. Images and media keep sharp corners.
- Display type: tight line-height (0.73–1.13) at big sizes; body line-height ≥ 1.29.
- It suggests uppercase for heading roles; we still skip all-caps kickers (Ajay, 2026-10-29).

Chosen carousel look: `site-violet-hn` (site colours + violet→orange button gradient, Helvetica Neue from the site).

More gradients from DESIGN.md's decorative accents and the "ChatGPT Shopping" promo (same carousel folder):
`grad-blue` (#3A7AF6 / #8176F7 / #58AEF9 / #7AD5FE → #CCF0F7), `grad-sunset` (#B80000 → #D97757 → #763EB8, #BE88FF glow),
`grad-midnight` (#763EB8 → #03003E, navy dark slides), `grad-teal` (#002942 → #3A7AF6, teal dark slides).

## Social gradients (Ajay, 2026-11-04)

Three backgrounds for TMV socials; every carousel uses **two backgrounds only**: white (#FBFAFB) and one gradient.
On the gradient: white text, accent words in a **white box with brand-colour text** (yellow and coral blend in, so
neither is used there), kickers and small accents in white.

| style (`carousels/2026-11-04-reddit-ai-mode-styles/make.py`) | gradient | box text |
|---|---|---|
| `grad-sunset-2bg` — **final** (the maroon one) | CSS: #B80000 → #D97757 → #763EB8 → #5A2A9A, #BE88FF glow bottom-right | #B80000 |
| `grad-night-2bg` | image `assets/bg-night.jpg` (from `gradients/df.png`): electric violet → pink → near-black, grain | #4A12E8 |
| `grad-sky-2bg` | image `assets/bg-sky.jpg` (from `gradients/Screenshot_3.png`): mid blue with a cyan streak; soft blue text shadow | #2F6BF0 |

The rest of `gradients/` was passed over: the pastels (1, 4, 5, 6, 8) need dark text and read generic, 2 (yellow/blue)
is off-brand, 7 is busy behind text, `gradients.png` is mostly pale lilac. Screenshot_37 is the site's existing
carousel background (logo and footer baked in).
