import Lenis from 'lenis';

type ClusterDef = { id: string; d: number[]; m: number[]; n: number };
type Pt = { x: number; y: number; c: string | null; core: boolean; s: number; b: number };

const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileQuery = window.matchMedia('(max-width: 767px)');

const store = {
  get(key: string) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key: string, value: string) { try { localStorage.setItem(key, value); } catch { /* storage unavailable */ } },
};

/* Theme */
const themeBtn = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
const themeMeta = document.querySelector('meta[name="theme-color"]');
const syncThemeUi = () => {
  const dark = root.dataset.theme !== 'light';
  if (themeBtn) themeBtn.setAttribute('aria-label', (dark ? themeBtn.dataset.toLight : themeBtn.dataset.toDark) ?? '');
  themeMeta?.setAttribute('content', dark ? '#05070C' : '#E9EEF3');
};
syncThemeUi();
themeBtn?.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
  store.set('theme', root.dataset.theme);
  syncThemeUi();
  redrawAll();
});

/* Language choice is remembered for next visit */
document.querySelectorAll<HTMLAnchorElement>('.lang a').forEach((a) => {
  a.addEventListener('click', () => store.set('lang', a.getAttribute('hreflang') === 'zh-CN' ? 'zh' : 'en'));
});

/* Smooth scroll */
let lenis: Lenis | null = null;
const startLenis = () => {
  if (reduceMotion.matches || lenis) return;
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  const raf = (time: number) => { lenis?.raf(time); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
  lenis.on('scroll', onScroll);
};
startLenis();
reduceMotion.addEventListener('change', () => {
  if (reduceMotion.matches && lenis) { lenis.destroy(); lenis = null; } else startLenis();
});

const scrollToHash = (hash: string) => {
  const target = document.querySelector<HTMLElement>(hash);
  if (!target) return;
  if (lenis) lenis.scrollTo(target, { offset: hash === '#top' ? 0 : -24, duration: 1.4 });
  else target.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  if (hash !== '#top') {
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }
};
document.addEventListener('click', (e) => {
  const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
  if (!a) return;
  const hash = a.getAttribute('href') ?? '';
  if (hash.length < 2) return;
  e.preventDefault();
  closeMenu();
  scrollToHash(hash);
  history.replaceState(null, '', hash);
});

/* Mobile menu */
const menu = document.querySelector<HTMLElement>('[data-menu]');
const menuBtn = document.querySelector<HTMLButtonElement>('[data-menu-btn]');
function openMenu() {
  if (!menu || !menuBtn) return;
  menu.hidden = false;
  requestAnimationFrame(() => menu.classList.add('open'));
  menuBtn.setAttribute('aria-expanded', 'true');
  menuBtn.setAttribute('aria-label', menuBtn.dataset.close ?? '');
  lenis?.stop();
  menu.querySelector<HTMLElement>('a')?.focus();
}
function closeMenu() {
  if (!menu || !menuBtn || menu.hidden) return;
  menu.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
  menuBtn.setAttribute('aria-label', menuBtn.dataset.open ?? '');
  lenis?.start();
  window.setTimeout(() => { if (!menu.classList.contains('open')) menu.hidden = true; }, 500);
}
menuBtn?.addEventListener('click', () => (menuBtn.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu()));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

/* Reveals and active nav link */
const revealIo = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('in'); revealIo.unobserve(en.target); }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('[data-reveal], [data-route]').forEach((el) => revealIo.observe(el));

const navLinks = [...document.querySelectorAll<HTMLAnchorElement>('[data-navlink]')];
const sectionIo = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    navLinks.forEach((a) => {
      if (a.getAttribute('href') === `#${en.target.id}`) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-45% 0px -50% 0px' });
navLinks.forEach((a) => { const s = document.querySelector(a.getAttribute('href') ?? ''); if (s) sectionIo.observe(s); });

/* Night map */
const mapEl = document.querySelector<HTMLElement>('[data-map]');
const defs: ClusterDef[] = mapEl ? JSON.parse(mapEl.dataset.map ?? '[]') : [];

function makePoints(mobile: boolean): Pt[] {
  let seed = 20260;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const gauss = () => Math.sqrt(-2 * Math.log(rand() || 1e-9)) * Math.cos(2 * Math.PI * rand());
  const pts: Pt[] = [];
  defs.forEach((d) => {
    const [cx, cy, sd] = mobile ? d.m : d.d;
    for (let i = 0; i < d.n; i++) {
      const core = i < 7;
      const r = core ? 0.45 : 1;
      pts.push({
        x: cx + gauss() * sd * r,
        y: cy + gauss() * sd * (mobile ? 0.75 : 1.7) * r,
        c: d.id, core, s: core ? 4 + rand() * 3 : 1.5 + rand() * 2.6, b: core ? 0.95 : 0.35 + rand() * 0.45,
      });
    }
  });
  const nBg = mobile ? 120 : 260;
  for (let i = 0; i < nBg; i++) {
    pts.push({ x: mobile ? rand() * 100 : 18 + rand() * 81, y: 3 + rand() * 94, c: null, core: false, s: 1 + rand() * 1.6, b: 0.1 + rand() * 0.3 });
  }
  return pts;
}

const colors = () => {
  const cs = getComputedStyle(root);
  return { light: cs.getPropertyValue('--light').trim(), core: cs.getPropertyValue('--light-core').trim(), glow: root.dataset.theme !== 'light' };
};

function fitCanvas(cv: HTMLCanvasElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = cv.clientWidth, h = cv.clientHeight;
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  }
  const ctx = cv.getContext('2d')!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha: number, glow: number) {
  ctx.globalAlpha = alpha;
  if (glow > 0) { ctx.shadowColor = 'rgba(255,178,91,0.7)'; ctx.shadowBlur = 6 + glow * 16; } else { ctx.shadowBlur = 0; }
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}

const mapCanvas = document.querySelector<HTMLCanvasElement>('[data-map-canvas]');
const pins = [...document.querySelectorAll<HTMLAnchorElement>('[data-pin]')];
let points: Pt[] = makePoints(mobileQuery.matches);
const lens = { x: -999, y: -999, tx: -999, ty: -999, active: false };
const clusterBoost: Record<string, number> = {};
const clusterTarget: Record<string, number> = {};
const dusk: Record<string, number> = {};
let bgDusk = 0;
let hovered: string | null = null;
let animating = false;
let heroVisible = true;
let drift = 0;

defs.forEach((d) => { clusterBoost[d.id] = 0; clusterTarget[d.id] = 0; dusk[d.id] = 0; });

function drawMap() {
  if (!mapCanvas) return;
  const { ctx, w, h } = fitCanvas(mapCanvas);
  ctx.clearRect(0, 0, w, h);
  const col = colors();
  const R = mobileQuery.matches ? 110 : 190;
  // The canvas is 112% tall and offset by 6%, so map coordinates live in the middle band.
  const oy = h * (6 / 112), mh = h * (100 / 112);
  for (const p of points) {
    const px = (p.x / 100) * w, py = oy + (p.y / 100) * mh;
    let boost = 0;
    if (lens.active) {
      const dx = px - lens.x, dy = py - lens.y;
      boost = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / R);
    }
    if (p.c) boost = Math.max(boost, clusterBoost[p.c]);
    const on = p.c ? dusk[p.c] : bgDusk;
    if (on <= 0.001) continue;
    const lit = p.core || boost > 0.4;
    const r = (p.s * (1 + boost * 0.7)) / 2;
    const glow = col.glow && (p.core || boost > 0.55) ? (p.core ? 0.6 + boost * 0.4 : boost) : 0;
    dot(ctx, px, py, r, lit ? col.core : col.light, Math.min(1, p.b + boost * 0.75) * on, glow);
  }
  ctx.globalAlpha = 1; ctx.shadowBlur = 0;
}

function tick() {
  let moving = false;
  const k = reduceMotion.matches ? 1 : 0.18;
  if (lens.active) {
    lens.x += (lens.tx - lens.x) * k; lens.y += (lens.ty - lens.y) * k;
    if (Math.abs(lens.tx - lens.x) + Math.abs(lens.ty - lens.y) > 0.5) moving = true;
  }
  for (const id in clusterBoost) {
    const t = clusterTarget[id];
    clusterBoost[id] += (t - clusterBoost[id]) * (reduceMotion.matches ? 1 : 0.14);
    if (Math.abs(t - clusterBoost[id]) > 0.005) moving = true;
  }
  drawMap();
  if (moving && heroVisible) requestAnimationFrame(tick); else animating = false;
}
const kick = () => { if (!animating) { animating = true; requestAnimationFrame(tick); } };

function runDusk() {
  pins.forEach((p) => p.classList.remove('on'));
  if (reduceMotion.matches) {
    defs.forEach((d) => { dusk[d.id] = 1; }); bgDusk = 1; pins.forEach((p) => p.classList.add('on')); drawMap(); return;
  }
  const start = performance.now();
  const order = ['pb', 'fn', 'jv', 'pp', 'bd'];
  const ease = (t: number) => 1 - Math.pow(1 - t, 4);
  const step = (now: number) => {
    const t = now - start;
    bgDusk = ease(Math.min(1, t / 1400));
    let done = bgDusk >= 1;
    order.forEach((id, i) => {
      const local = Math.min(1, Math.max(0, (t - 300 - i * 260) / 900));
      dusk[id] = ease(local);
      if (local > 0.35) pins.find((p) => p.dataset.pin === id)?.classList.add('on');
      if (local < 1) done = false;
    });
    drawMap();
    if (!done) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

if (mapEl && mapCanvas) {
  mapEl.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    const r = mapCanvas.getBoundingClientRect();
    lens.tx = e.clientX - r.left; lens.ty = e.clientY - r.top;
    if (!lens.active) { lens.x = lens.tx; lens.y = lens.ty; lens.active = true; }
    kick();
  });
  mapEl.addEventListener('pointerleave', () => { lens.active = false; kick(); });
  pins.forEach((pin) => {
    const id = pin.dataset.pin!;
    const on = () => { hovered = id; defs.forEach((d) => { clusterTarget[d.id] = d.id === id ? 0.85 : 0; }); pins.forEach((p) => p.classList.toggle('is-lit', p === pin)); kick(); };
    const off = () => { if (hovered !== id) return; hovered = null; clusterTarget[id] = 0; pin.classList.remove('is-lit'); kick(); };
    pin.addEventListener('pointerenter', on); pin.addEventListener('focus', on);
    pin.addEventListener('pointerleave', off); pin.addEventListener('blur', off);
  });
  new IntersectionObserver(([en]) => { heroVisible = en.isIntersecting; }, { threshold: 0 }).observe(mapEl);
  new ResizeObserver(() => drawMap()).observe(mapCanvas);
  mobileQuery.addEventListener('change', () => { points = makePoints(mobileQuery.matches); drawMap(); });
  document.fonts?.ready.then(() => document.querySelector('[data-hero]')?.classList.add('ready'));
  window.setTimeout(() => document.querySelector('[data-hero]')?.classList.add('ready'), 900);
  runDusk();
}

function onScroll({ scroll }: { scroll: number }) {
  if (!mapCanvas || !heroVisible || reduceMotion.matches) return;
  drift = Math.min(scroll, window.innerHeight) * 0.12;
  mapCanvas.style.transform = `translate3d(0, ${drift.toFixed(1)}px, 0)`;
}

/* Project plates repeat their hero cluster shape */
const plates = [...document.querySelectorAll<HTMLCanvasElement>('[data-plate]')];
function drawPlates() {
  const desk = makePoints(false);
  const col = colors();
  plates.forEach((cv) => {
    const id = cv.dataset.plate!;
    const def = defs.find((d) => d.id === id);
    if (!def) return;
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    // Keep the cluster's true shape: measure its spread in desktop map pixels, then fit it to the plate.
    const own = desk.filter((p) => p.c === id);
    const px = own.map((p) => ((p.x - def.d[0]) / 100) * 1440);
    const py = own.map((p) => ((p.y - def.d[1]) / 100) * 860);
    const sd = Math.sqrt(px.concat(py).reduce((a, v) => a + v * v, 0) / (px.length * 2)) || 1;
    const k = (Math.min(w, h) * 0.17) / sd;
    const cxT = (id === 'fn' && w > 300 ? 0.4 : 0.5) * w, cyT = 0.52 * h;
    own.forEach((p, i) => {
      const x = Math.max(w * 0.03, Math.min(w * 0.97, cxT + px[i] * k));
      const y = Math.max(h * 0.05, Math.min(h * 0.95, cyT + py[i] * k));
      dot(ctx, x, y, (p.s * 1.25) / 2, p.core ? col.core : col.light, Math.min(1, p.b + 0.15), col.glow && p.core ? 0.8 : 0);
    });
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  });
}
plates.forEach((cv) => new ResizeObserver(() => drawPlates()).observe(cv));

/* Contact: a quiet horizon of lights */
const duskCanvas = document.querySelector<HTMLCanvasElement>('[data-dusk]');
function drawDusk() {
  if (!duskCanvas) return;
  const { ctx, w, h } = fitCanvas(duskCanvas);
  ctx.clearRect(0, 0, w, h);
  const col = colors();
  let s = 77;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const n = Math.round(w / 8);
  for (let i = 0; i < n; i++) {
    const x = r() * w, y = h * (0.35 + Math.pow(r(), 0.6) * 0.65);
    dot(ctx, x, y, 0.5 + r() * 1.2, r() > 0.85 ? col.core : col.light, 0.1 + r() * 0.35, 0);
  }
  ctx.globalAlpha = 1;
}
if (duskCanvas) new ResizeObserver(() => drawDusk()).observe(duskCanvas);

function redrawAll() { drawMap(); drawPlates(); drawDusk(); }
