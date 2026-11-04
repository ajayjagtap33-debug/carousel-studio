# Reel themes (colours only)

Tokens: `reel_themes.json`. Fonts, layouts, motion: `../reference/12_design`.
Base: Ajay = olive `#4E6636` (Nick CEO-AI sample), TMV = brand red `#B80000` (carousel-studio `theme/tmv.json`).

## Reel adjustments vs. the carousel/video values
1. **Two accent values per theme.** Olive and red both drop to ~3:1 on near-black, so DARK B-roll, dark captions and
   accent words use `accentOnDark` (olive #A7BD82 9.5:1, coral #F86659 6.6:1); light layouts use `accent` (5.6:1 / 6.0:1).
2. **Glow is its own colour.** The CTA keyword glow and glowing card borders look muddy in plain olive/red, so `glow`
   is a brighter sibling (#B4D16B / #FF5A4A), used only on the CTA and the newest-era glowing browser-card border.
3. **Hook box.** Solid accent box with white italic serif (white on olive 6.4:1, on red 6.9:1). Replaces the blue #1E8FFF box.
4. **Accent budget.** Keep the reference rule: ~2% saturated pixels, one accent per reel. Everything else is
   monochrome (canvas, ink, near-black). TMV violet/orange/green are for diagrams and status chips only, never captions.
5. **Canvas tint.** Light canvas is slightly tinted to the brand (green-white / warm-white) instead of the cool #EEF0F2.
6. **TMV hero gradient** (red to violet) only on the CTA frame or title card; never behind the talking head.
7. Captions: ink on light, white with soft shadow on dark, accent word in `accent` / `accentOnDark`. No boxes or strokes.

## To confirm
- Whether Ajay's reel should use a warmer green for the glow if olive-lime looks too yellow on screen (check on a rendered frame).
