---
name: portfolio-site
description: Build and extend Andrew's Astro portfolio (nd32ks.github.io) to match its approved "Earth at night" design. Use for any page, component, style, animation or content change on this site.
---

# nd32ks.github.io portfolio

Sources of truth, in order:
1. `PRODUCT.md` (facts, audience, privacy rules) and `.impeccable/surfaces/src-pages-index-astro.md` (direction contract).
2. Design canvas "Andrew Portfolio Design": https://claude.ai/artifact/FPNS1FaNqScM4TVNGDFbti
3. Use the `impeccable` skill for design work; its finish review and DESIGN.md step are part of done.

## Stack (current: plain HTML, CSS, JS on `main`; Astro version on the `astro` branch)
- Files live in `site/`. Edit `site/index.html` and `site/zh/index.html` together. No build step.
- Styles `site/assets/css/styles.css`, behaviour `site/assets/js/script.js`, libraries in `site/assets/js/vendor/`.
- Older notes below describe the Astro version; the visual design, tokens and rules still apply.
- Astro static output, content collections `src/content/{projects,blog}`, i18n routes `/` (en) and `/zh/` (简体中文).
- Plain CSS custom properties in `src/styles/tokens.css`; no Tailwind or UI kit.
- Fonts self-hosted: Schibsted Grotesk (display and body), JetBrains Mono (coordinates, labels, tech tags), Noto Sans SC (Chinese).
- Icons: Phosphor Light, one family.
- Motion: Lenis smooth scroll; IntersectionObserver or CSS scroll-driven animations; hero light field in a single `<canvas>` (not hundreds of DOM nodes). Never `window.addEventListener('scroll')`.

## Tokens
| token | dark (default) | light |
|---|---|---|
| --bg | #05070C | #E9EEF3 |
| --map-bg | #04060A | #E3E9F0 |
| --core (plate inner) | #0A0F18 | #F5F7FA |
| --ink | #E8EDF5 | #0B1220 |
| --muted | #8C97A8 | #4A5568 |
| --hair | rgba(200,215,240,.10) | rgba(11,18,32,.10) |
| --light (points) | #FFB25B | #1E2A40 |
| --light-core / accent text | #FFE6B8 / #FFB25B | #9A4508 |
| --btn-bg / --btn-ink | #FFB25B / #1A1205 | #0B1220 / #F5F7FA |

Amber is reserved for what is lit or active. Theme follows `prefers-color-scheme` with a toggle; language toggle EN / 中文 in the nav. Persist both in localStorage (try/catch) and set them before first paint.

## Components
- Nav: floating glass pill, detached from the top, centered; mobile = pill with language, theme and a hamburger that morphs to an X and opens a full-screen overlay with staggered links.
- Plates: double bezel (outer shell 8px padding, radius 32-36px; inner core radius 24-28px, inset 1px highlight).
- Buttons: pills with a nested circular trailing icon that nudges up-right on hover; `:active` scale .98.
- Easing: `cubic-bezier(.32,.72,0,1)` for UI, `cubic-bezier(.16,1,.3,1)` for reveals. No linear or ease-in-out.
- No eyebrow/kicker labels above headings (impeccable ban).

## Signature behaviour
- Hero is a night map: five light clusters (ProfessorBook, FreshNext, JIVANA AI, PPIT chatbot, Bodiac Robotics) over a faint graticule. Pointer is a satellite pass: lights within ~190px brighten; hovering or focusing a label lights its whole cluster. Touch: tap a label.
- Load: lights switch on cluster by cluster (dusk). Scroll: light field drifts slowly; Journey route line draws stop by stop; section content rises with blur-to-sharp once.
- Each project plate repeats its hero cluster shape (the map is the index).
- `prefers-reduced-motion: reduce`: lights static, no drift, no Lenis.

## Content and privacy
Facts only from `PRODUCT.md`. Never publish date of birth, phone numbers or nationality. Photo stays an empty placeholder until supplied. No em-dashes in copy.

## Done means
`npm run build` passes; 360, 390, 1280 and 1440 px checked in both themes and both languages; reduced motion checked; `impeccable detect` run; finish review and DESIGN.md written.
