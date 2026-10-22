# Portfolio: plain HTML, CSS and JavaScript

Source files for the submission. No framework and no build step.

```
index.html               English page
zh/index.html            Chinese page
favicon.svg
assets/css/styles.css    all styles (light and dark themes)
assets/css/fonts.css     Latin fonts (self-hosted)
assets/css/fonts-zh.css  Chinese font, used by zh/index.html only
assets/js/script.js      scroll animation, project stage, skill filter, theme and language, mobile action bar
assets/js/vendor/        gsap, ScrollTrigger, Lenis (local copies)
assets/fonts/            font files
```

Run locally from this folder (paths start with `/`, so serve it from its root):

```bash
python3 -m http.server 4321
```

Then open http://localhost:4321.
