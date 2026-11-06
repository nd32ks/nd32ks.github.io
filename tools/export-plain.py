"""Rebuild html-css-js/ (plain HTML, CSS and JS copy for submission) from the Astro build.

Run from the project root after `npx astro build`:
    python3 tools/export-plain.py
Fonts in html-css-js/assets/fonts and the font CSS are kept as they are.
"""
import re, shutil, subprocess, pathlib

ROOT = pathlib.Path('.')
OUT = ROOT / 'html-css-js'
src = (ROOT / 'src/scripts/site.ts').read_text()

# figures.js: the Hairline block as an ES module (the library is ESM only)
a, b = src.index('// HAIRLINE-START'), src.index('// HAIRLINE-END')
imp = re.search(r"import \{([^}]*)\} from '@lucasmarkes/hairline';", src).group(1)
fig_ts = f"import {{{imp}}} from './vendor/hairline.js';\n" + src[a:b]
# script.js: everything else, wrapped so it runs as a classic script after the vendor files
body = src[:a] + src[b:]
body = re.sub(r"^import .*\n", '', body, flags=re.M).replace('gsap.registerPlugin(ScrollTrigger);\n', '', 1)

def ts_to_js(code: str) -> str:
    tmp = pathlib.Path('/tmp/_export.ts'); tmp.write_text(code)
    return subprocess.run(['npx', '--yes', 'esbuild', str(tmp), '--loader:.ts=ts', '--target=es2020', '--format=esm'],
                          capture_output=True, text=True, check=True).stdout

(OUT / 'assets/js/script.js').write_text(
    '/* Site behaviour. Needs gsap, ScrollTrigger and Lenis, loaded before this file from ./vendor. */\n(() => {\n"use strict";\n'
    'const { gsap, ScrollTrigger, Lenis } = window;\ngsap.registerPlugin(ScrollTrigger);\n' + ts_to_js(body) + '})();\n')
(OUT / 'assets/js/figures.js').write_text('// Interactive line figures (Hairline). Each element with data-hairline answers the pointer.\n' + ts_to_js(fig_ts))
shutil.copy(ROOT / 'node_modules/@lucasmarkes/hairline/dist/index.js', OUT / 'assets/js/vendor/hairline.js')
shutil.copy(ROOT / 'src/styles/global.css', OUT / 'assets/css/styles.css')

# images and favicon keep the same paths as the hosted site
if (OUT / 'assets/img').exists(): shutil.rmtree(OUT / 'assets/img')
shutil.copytree(ROOT / 'public/projects', OUT / 'projects', dirs_exist_ok=True)
shutil.copy(ROOT / 'public/favicon.svg', OUT / 'favicon.svg')

def convert(src_html, dst, zh):
    h = (ROOT / src_html).read_text()
    h = re.sub(r'<link rel="stylesheet" href="/_astro/[^"]+">\s*', '', h)
    css = '<link rel="stylesheet" href="/assets/css/fonts.css">\n'
    if zh: css += '<link rel="stylesheet" href="/assets/css/fonts-zh.css">\n'
    css += '<link rel="stylesheet" href="/assets/css/styles.css">\n'
    h = h.replace('</head>', css + '</head>', 1)
    h = re.sub(r'<script type="module" src="/_astro/[^"]+"></script>', '', h)
    h = h.replace('</body>', '<script src="/assets/js/vendor/gsap.min.js"></script>\n<script src="/assets/js/vendor/ScrollTrigger.min.js"></script>\n'
                  '<script src="/assets/js/vendor/lenis.min.js"></script>\n<script src="/assets/js/script.js"></script>\n'
                  '<script type="module" src="/assets/js/figures.js"></script>\n</body>', 1)
    h = re.sub(r'\sdata-astro-[a-z0-9-]+(="[^"]*")?', '', h)
    (OUT / dst).write_text(h)

convert('dist/index.html', 'index.html', False)
convert('dist/zh/index.html', 'zh/index.html', True)
subprocess.run(['npx', '--yes', 'prettier', '--write', str(OUT / 'index.html'), str(OUT / 'zh/index.html'),
                str(OUT / 'assets/css/styles.css'), str(OUT / 'assets/js/script.js'), str(OUT / 'assets/js/figures.js')],
               capture_output=True, check=True)
print('html-css-js updated')
