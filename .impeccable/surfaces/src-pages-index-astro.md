---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: []
---

## Scope

Home page of nd32ks.github.io. Visitor mode: Experience (portfolio; the work leads from the first viewport). Dark-first with a light theme, English / 简体中文 switch in the nav. Audience: internship recruiters, professors, grad school and scholarship panels. Action: open a project, download the CV, email Andrew.

## Direction contract

THESIS: The page is the Earth at night seen from orbit (satellite night-lights composite). Andrew's work is the lit regions: each project is a cluster of lights, the way a data scientist sees structure in a scatter of points. Refuses the split hero with a card row below.

OWN-WORLD: Night ground #05070C to #0A0F18, faint graticule and coastline lines in cold blue #1C2A40, lights in sodium amber #FFB25B with pale cores #FFE6B8. Amber is reserved for what is lit or active (film-bloom raise). Day theme = the daytime map: pale #E9EEF3 ground, navy ink #0B1220, lights become ink points, amber #9A4508 for the active item. Schibsted Grotesk for type, JetBrains Mono for coordinates and labels, Noto Sans SC for Chinese. Radius: 4px plates, pill buttons.

STORY: Visitor sees a night map whose brightest regions are labelled ProfessorBook, FreshNext, JIVANA AI, Bodiac Robotics; understands Andrew finds and builds structure in data; believes it because each region opens a real project; emails him or downloads the CV.

FIRST VIEWPORT: Full-bleed night map (100dvh). Bottom-left: mono coordinates of Suzhou, name at display scale, one-line pitch, primary "Explore the work" and secondary "Download CV". Right two-thirds: four labelled light clusters, each a link. Top-right of map: one-line hint that the cursor scans the lights. Nav strip on top: name, section links, EN/中文 switch, theme switch.

FORM: Earth-at-night satellite composite, position 5 of the grounded list. seed:0fadf3a9fa72e6d2
- Signature interaction: the pointer is the satellite pass; lights within its radius brighten, and the hovered cluster lights fully with its label. One pointer value drives every light (variable-font-specimen raise).
- Motion grammar: dusk on load (lights switch on cluster by cluster), slow parallax drift of the light field on scroll, route line of the Journey section draws in sequence as it scrolls in (wildstyle raise), section copy rises once. Reduced motion: lights static at full state, no drift.
- Addressing: each project's cluster keeps its shape and position from the hero map to its project row, so the map is the index (teletext raise). Project rows reflow as whole plates (chaekgeori raise). Journey stops are numbered in time order (orizuru raise).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
