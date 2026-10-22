# nd32ks.github.io

Personal portfolio of Andrew (Theodosius Andrew Djajakusli). Plain HTML, CSS and JavaScript. No build step.

Live: https://nd32ks.github.io

## Layout

```
site/
  index.html            English page
  zh/index.html         Chinese page (edit both when changing text)
  favicon.svg
  assets/css/styles.css all styles, light and dark themes
  assets/css/fonts.css  Latin fonts (self-hosted)
  assets/css/fonts-zh.css  Chinese font, loaded on the Chinese page only
  assets/js/script.js   scroll, stage, filter, theme, language, action bar
  assets/js/vendor/     gsap, ScrollTrigger, Lenis (local copies)
  assets/fonts/         font files
```

## Run locally

```bash
python3 -m http.server 4321 --directory site
```

Open http://localhost:4321.

## Deploy

Pushing to `main` publishes the `site/` folder to GitHub Pages through `.github/workflows/deploy.yml`.

## Astro version

The earlier Astro version (components, data files, i18n dictionary) is kept on the `astro` branch. To switch back: `git checkout astro`.
