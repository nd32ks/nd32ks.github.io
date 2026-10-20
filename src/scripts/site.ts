import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type ClusterDef = { id: string; d: number[]; m: number[]; n: number };
type Pt = { x: number; y: number; c: string | null; core: boolean; s: number; b: number; ph: number };

const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileQuery = window.matchMedia('(max-width: 767px)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

const store = {
  get(key: string) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key: string, value: string) { try { localStorage.setItem(key, value); } catch { /* storage unavailable */ } },
};

/* ---------- Theme and language ---------- */
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
document.querySelectorAll<HTMLAnchorElement>('.lang a').forEach((a) => {
  a.addEventListener('click', () => store.set('lang', a.getAttribute('hreflang') === 'zh-CN' ? 'zh' : 'en'));
});

/* ---------- Smooth scroll, driven by the GSAP ticker ---------- */
let lenis: Lenis | null = null;
const tickLenis = (time: number) => lenis?.raf(time * 1000);
function startLenis() {
  if (reduceMotion.matches || lenis) return;
  lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(tickLenis);
  gsap.ticker.lagSmoothing(0);
}
startLenis();
reduceMotion.addEventListener('change', () => {
  if (reduceMotion.matches && lenis) { gsap.ticker.remove(tickLenis); lenis.destroy(); lenis = null; } else startLenis();
});

const scrollToHash = (hash: string) => {
  const target = document.querySelector<HTMLElement>(hash);
  if (!target) return;
  // Pinned sections are wrapped in spacers; scroll to the spacer's start so the pin begins cleanly.
  const anchor = (target.closest('.pin-spacer') as HTMLElement | null) ?? target;
  if (lenis) lenis.scrollTo(hash === '#top' ? 0 : anchor, { offset: 0, duration: 1.4 });
  else (hash === '#top' ? window.scrollTo({ top: 0 }) : anchor.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth' }));
  if (hash !== '#top') { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
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

/* ---------- Mobile menu ---------- */
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

/* ---------- Headings: split into words (or characters for Chinese) ---------- */
document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
  const text = el.textContent?.trim() ?? '';
  const parts = /\s/.test(text) ? text.split(/(\s+)/) : [...text];
  el.setAttribute('aria-label', text);
  el.innerHTML = '';
  let wi = 0;
  parts.forEach((part) => {
    if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(' ')); return; }
    const w = document.createElement('span');
    w.className = 'w';
    w.setAttribute('aria-hidden', 'true');
    const inner = document.createElement('span');
    inner.textContent = part;
    inner.style.setProperty('--wi', String(wi++));
    w.appendChild(inner);
    el.appendChild(w);
  });
});

/* ---------- One-shot reveals ---------- */
const revealIo = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('in'); revealIo.unobserve(en.target); }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('[data-reveal], [data-split], [data-pass]').forEach((el) => revealIo.observe(el));
document.querySelectorAll<SVGElement>('.pass svg').forEach((svg) => {
  svg.querySelectorAll<SVGElement>('rect, circle').forEach((n, k) => n.style.setProperty('--k', String(k)));
});

/* ---------- Active nav link and reading progress ---------- */
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
const progressBar = document.querySelector<HTMLElement>('[data-progress]');
if (progressBar) {
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => { progressBar.style.transform = `scaleX(${self.progress.toFixed(4)})`; },
  });
}

/* ---------- Night map ---------- */
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
        x: cx + gauss() * sd * r, y: cy + gauss() * sd * (mobile ? 0.75 : 1.7) * r,
        c: d.id, core, s: core ? 4 + rand() * 3 : 1.5 + rand() * 2.6, b: core ? 0.95 : 0.35 + rand() * 0.45, ph: rand() * 6.28,
      });
    }
  });
  const nBg = mobile ? 140 : 320;
  for (let i = 0; i < nBg; i++) {
    pts.push({ x: mobile ? rand() * 100 : 14 + rand() * 86, y: 16 + rand() * 82, c: null, core: false, s: 1 + rand() * 1.6, b: 0.1 + rand() * 0.3, ph: rand() * 6.28 });
  }
  return pts;
}

const colors = () => {
  const cs = getComputedStyle(root);
  return { light: cs.getPropertyValue('--light').trim(), core: cs.getPropertyValue('--light-core').trim(), star: cs.getPropertyValue('--star').trim(), glow: root.dataset.theme !== 'light' };
};

function fitCanvas(cv: HTMLCanvasElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = cv.clientWidth, h = cv.clientHeight;
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
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
const starsCanvas = document.querySelector<HTMLCanvasElement>('[data-stars]');
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
let zoom = 1;
let twinkleT = 0;
const focus = () => { const pb = defs.find((d) => d.id === 'pb'); return pb ? (mobileQuery.matches ? pb.m : pb.d) : [60, 40]; };

defs.forEach((d) => { clusterBoost[d.id] = 0; clusterTarget[d.id] = 0; dusk[d.id] = 0; });

function drawMap() {
  if (!mapCanvas) return;
  const { ctx, w, h } = fitCanvas(mapCanvas);
  ctx.clearRect(0, 0, w, h);
  const col = colors();
  const R = mobileQuery.matches ? 110 : 190;
  const [fxp, fyp] = focus();
  const fx = (fxp / 100) * w, fy = (fyp / 100) * h;
  const rz = Math.sqrt(zoom);
  const tw = !reduceMotion.matches;
  for (const p of points) {
    const px = fx + ((p.x / 100) * w - fx) * zoom;
    const py = fy + ((p.y / 100) * h - fy) * zoom;
    if (px < -20 || px > w + 20 || py < -20 || py > h + 20) continue;
    let boost = 0;
    if (lens.active) { const dx = px - lens.x, dy = py - lens.y; boost = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / R); }
    if (p.c) boost = Math.max(boost, clusterBoost[p.c]);
    const on = p.c ? dusk[p.c] : bgDusk;
    if (on <= 0.001) continue;
    const flicker = tw && !p.core ? 0.82 + 0.18 * Math.sin(twinkleT * 1.6 + p.ph) : 1;
    const lit = p.core || boost > 0.4;
    const r = ((p.s * (1 + boost * 0.7)) / 2) * rz;
    const glow = col.glow && (p.core || boost > 0.55) ? (p.core ? 0.6 + boost * 0.4 : boost) : 0;
    dot(ctx, px, py, r, lit ? col.core : col.light, Math.min(1, (p.b + boost * 0.75) * flicker) * on, glow);
  }
  ctx.globalAlpha = 1; ctx.shadowBlur = 0;
}

function drawStars() {
  if (!starsCanvas) return;
  const { ctx, w, h } = fitCanvas(starsCanvas);
  ctx.clearRect(0, 0, w, h);
  const col = colors();
  if (!col.glow) return;
  let s = 5;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < Math.round(w / 6); i++) dot(ctx, r() * w, r() * h * 0.32, 0.3 + r() * 0.9, col.star, 0.15 + r() * 0.6, 0);
  ctx.globalAlpha = 1;
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

// Lights twinkle gently, only while the hero is on screen and the tab is visible.
let lastTw = 0;
gsap.ticker.add((time) => {
  if (reduceMotion.matches || !heroVisible || document.hidden || animating) return;
  if (time - lastTw < 0.066) return;
  lastTw = time; twinkleT = time; drawMap();
});

function runDusk() {
  pins.forEach((p) => p.classList.remove('on'));
  if (reduceMotion.matches) { defs.forEach((d) => { dusk[d.id] = 1; }); bgDusk = 1; pins.forEach((p) => p.classList.add('on')); drawMap(); return; }
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
  new ResizeObserver(() => { drawMap(); drawStars(); }).observe(mapCanvas);
  mobileQuery.addEventListener('change', () => { points = makePoints(mobileQuery.matches); drawMap(); });
  const ready = () => document.querySelector('[data-hero]')?.classList.add('ready');
  document.fonts?.ready.then(ready);
  window.setTimeout(ready, 900);
  runDusk();
}

/* ---------- Project plates repeat their hero cluster shape ---------- */
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
    const own = desk.filter((p) => p.c === id);
    const px = own.map((p) => ((p.x - def.d[0]) / 100) * 1440);
    const py = own.map((p) => ((p.y - def.d[1]) / 100) * 860);
    const sd = Math.sqrt(px.concat(py).reduce((a, v) => a + v * v, 0) / (px.length * 2)) || 1;
    const k = (Math.min(w, h) * 0.17) / sd;
    const cxT = 0.5 * w, cyT = 0.52 * h;
    own.forEach((p, i) => {
      const x = Math.max(w * 0.03, Math.min(w * 0.97, cxT + px[i] * k));
      const y = Math.max(h * 0.05, Math.min(h * 0.95, cyT + py[i] * k));
      dot(ctx, x, y, (p.s * 1.25) / 2, p.core ? col.core : col.light, Math.min(1, p.b + 0.15), col.glow && p.core ? 0.8 : 0);
    });
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  });
}
plates.forEach((cv) => new ResizeObserver(() => drawPlates()).observe(cv));

/* ---------- Contact horizon ---------- */
const duskCanvas = document.querySelector<HTMLCanvasElement>('[data-dusk]');
function drawDusk() {
  if (!duskCanvas) return;
  const { ctx, w, h } = fitCanvas(duskCanvas);
  ctx.clearRect(0, 0, w, h);
  const col = colors();
  let s = 77;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < Math.round(w / 7); i++) {
    dot(ctx, r() * w, h * (0.35 + Math.pow(r(), 0.6) * 0.65), 0.5 + r() * 1.2, r() > 0.85 ? col.core : col.light, 0.1 + r() * 0.35, 0);
  }
  ctx.globalAlpha = 1;
}
if (duskCanvas) new ResizeObserver(() => drawDusk()).observe(duskCanvas);

function redrawAll() { drawMap(); drawStars(); drawPlates(); drawDusk(); }

/* ---------- Skills, with proof ---------- */
const skillBtns = [...document.querySelectorAll<HTMLButtonElement>('[data-skill]')];
const passes = [...document.querySelectorAll<HTMLElement>('[data-pass]')];
const shippedItems = [...document.querySelectorAll<HTMLElement>('.shipped li')];
let activeSkill = '';
function showSkill(id: string) {
  passes.forEach((p) => {
    const has = !id || (p.dataset.skills ?? '').split(' ').includes(id);
    p.classList.toggle('dim', !has);
    p.querySelectorAll<HTMLElement>('[data-chip]').forEach((chip) => chip.classList.toggle('hit', !!id && chip.dataset.chip === id));
  });
  shippedItems.forEach((li) => {
    const has = (li.dataset.skills ?? '').split(' ').includes(id);
    li.classList.toggle('hit', !!id && has);
    li.classList.toggle('dim', !!id && !has);
  });
}
skillBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    activeSkill = btn.dataset.skill ?? '';
    skillBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    showSkill(activeSkill);
  });
  if (finePointer.matches) {
    btn.addEventListener('pointerenter', () => showSkill(btn.dataset.skill ?? ''));
    btn.addEventListener('pointerleave', () => showSkill(activeSkill));
  }
});
// Status follows today's date, so it stays right between deploys.
const today = new Date();
const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
passes.forEach((p) => {
  const el = p.querySelector<HTMLElement>('[data-status]');
  if (!el) return;
  const st = iso < (p.dataset.start ?? '') ? 'next' : iso <= (p.dataset.due ?? '') ? 'live' : p.dataset.hasRepo ? 'done' : 'review';
  el.className = `pass-status s-${st}`;
  el.textContent = el.dataset[`l${st[0].toUpperCase()}${st.slice(1)}`] ?? el.textContent;
});

/* ---------- Magnetic buttons ---------- */
if (finePointer.matches && !reduceMotion.matches) {
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.22);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.32);
    });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

/* ---------- Scroll choreography ---------- */
const mm = gsap.matchMedia();
const heroPin = document.querySelector<HTMLElement>('[data-hero-pin]');
const heroCopy = document.querySelector<HTMLElement>('[data-hero-copy]');
const earth = document.querySelector<HTMLElement>('[data-earth]');
const limb = document.querySelector<HTMLElement>('[data-limb]');
const grat = document.querySelector<HTMLElement>('[data-grat]');
const hint = document.querySelector<HTMLElement>('[data-hint]');
const altEl = document.querySelector<HTMLElement>('[data-alt]');
const route = document.querySelector<HTMLElement>('[data-route]');
const stops = [...document.querySelectorAll<HTMLElement>('[data-stop]')];

function setDescent(p: number) {
  const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
  zoom = 1 + e * 2.2;
  const [fx, fy] = focus();
  const limbTop = `${14 - e * 46}%`;
  earth?.style.setProperty('--limb-top', limbTop);
  limb?.style.setProperty('--limb-top', limbTop);
  if (starsCanvas) { starsCanvas.style.transform = `translate3d(0, ${(-e * 30).toFixed(2)}%, 0)`; starsCanvas.style.opacity = String(1 - e); }
  if (grat) { grat.style.transformOrigin = `${fx}% ${fy}%`; grat.style.transform = `scale(${(1 + e * 0.9).toFixed(3)})`; grat.style.opacity = String(1 - e * 0.6); }
  pins.forEach((pin) => {
    const d = defs.find((k) => k.id === pin.dataset.pin)!;
    const [x, y] = mobileQuery.matches ? d.m : d.d;
    pin.style.left = `${fx + (x - fx) * zoom}%`;
    pin.style.top = `${fy + (y - fy) * zoom}%`;
    pin.style.opacity = pin.classList.contains('on') ? String(Math.max(0, 1 - Math.max(0, p - 0.22) / 0.22)) : '';
    pin.style.pointerEvents = p > 0.4 ? 'none' : '';
  });
  if (heroCopy) { heroCopy.style.transform = `translate3d(0, ${(-p * 180).toFixed(1)}px, 0)`; heroCopy.style.opacity = String(Math.max(0, 1 - p * 2.4)); }
  if (hint) hint.style.opacity = String(Math.max(0, 1 - p * 4));
  if (altEl) altEl.textContent = String(Math.round(12 + 693 * Math.pow(1 - e, 2)));
  drawMap();
}

function setRoute(p: number) {
  if (!route) return;
  const target = Number(route.dataset.progressTarget) || 1;
  const val = target * p;
  route.style.setProperty('--progress', val.toFixed(4));
  stops.forEach((s, i) => {
    const reached = (i + 0.5) / stops.length <= val + 0.001;
    s.classList.toggle('done', reached);
    s.classList.toggle('now', reached && (i + 1.5) / stops.length > val + 0.001);
  });
}

mm.add({ desk: '(min-width: 1024px)', reduce: '(prefers-reduced-motion: reduce)' }, (ctx) => {
  const { desk, reduce } = ctx.conditions as { desk: boolean; reduce: boolean };
  if (reduce) { zoom = 1; setRoute(1); return; }

  // 1. Hero: descend from orbit toward Suzhou (desktop), gentle depth parallax (smaller screens).
  if (desk && heroPin) {
    ScrollTrigger.create({ trigger: heroPin, start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: (self) => setDescent(self.progress) });
  } else if (mapCanvas) {
    gsap.to(mapCanvas, { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true } });
    if (starsCanvas) gsap.to(starsCanvas, { yPercent: 40, ease: 'none', scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true } });
  }

  // 2. Work: a horizontal pass across each lit region.
  const work = document.querySelector<HTMLElement>('[data-work]');
  const track = document.querySelector<HTMLElement>('[data-track]');
  if (desk && work && track) {
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const pan = gsap.to(track, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: { trigger: work, start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: 1, invalidateOnRefresh: true },
    });
    track.querySelectorAll<HTMLElement>('.plate').forEach((plate) => {
      const cv = plate.querySelector('canvas');
      if (cv) gsap.fromTo(cv, { xPercent: 5 }, { xPercent: -5, ease: 'none', scrollTrigger: { trigger: plate, containerAnimation: pan, start: 'left right', end: 'right left', scrub: true } });
      const stat = plate.querySelector('[data-parallax-stat]');
      if (stat) gsap.fromTo(stat, { x: 60 }, { x: -20, ease: 'none', scrollTrigger: { trigger: plate, containerAnimation: pan, start: 'left right', end: 'right left', scrub: true } });
    });
  } else {
    document.querySelectorAll<HTMLElement>('.work-track .plate').forEach((plate) => {
      const cv = plate.querySelector('canvas');
      if (cv) gsap.fromTo(cv, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: plate, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  // 3. Count up the one real figure when it comes into view.
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const raw = el.dataset.count ?? '';
    const n = Number(raw.replace(/[^\d]/g, ''));
    const suffix = raw.replace(/[\d,]/g, '');
    const obj = { v: 0 };
    gsap.to(obj, {
      v: n, duration: 1.6, ease: 'power3.out',
      scrollTrigger: { trigger: desk && track ? '[data-work]' : el, start: desk && track ? 'top 60%' : 'top 85%', once: true },
      onUpdate: () => { el.textContent = Math.round(obj.v).toLocaleString('en-US') + suffix; },
    });
  });

  // 4. About: photo and text drift at different depths.
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const v = Number(el.dataset.parallax) || 0;
    gsap.fromTo(el, { y: -v }, { y: v, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // 5. Toolkit bands slide against each other.
  document.querySelectorAll<HTMLElement>('[data-band]').forEach((band) => {
    const tr = band.querySelector('.band-track');
    const dir = band.dataset.band === '1' ? 1 : -1;
    if (tr) gsap.fromTo(tr, { xPercent: dir > 0 ? -33.333 : 0 }, { xPercent: dir > 0 ? 0 : -33.333, ease: 'none', scrollTrigger: { trigger: band, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
  });

  // 6. Journey: the route draws as you read it.
  if (route) {
    route.classList.add('in');
    setRoute(0);
    ScrollTrigger.create({ trigger: route, start: 'top 78%', end: 'bottom 55%', scrub: true, onUpdate: (self) => setRoute(self.progress) });
  }

  // 7. Contact: the sign-off rises out of the horizon.
  const contact = document.querySelector('[data-contact]');
  const contactH = document.querySelector('[data-contact-h]');
  if (contact && contactH) gsap.fromTo(contactH, { scale: 0.86, y: 60 }, { scale: 1, y: 0, ease: 'none', scrollTrigger: { trigger: contact, start: 'top bottom', end: 'center center', scrub: true } });
  if (duskCanvas) gsap.fromTo(duskCanvas, { yPercent: 12 }, { yPercent: -6, ease: 'none', scrollTrigger: { trigger: contact, start: 'top bottom', end: 'bottom top', scrub: true } });

  return () => { zoom = 1; setDescent(0); };
});

document.fonts?.ready.then(() => ScrollTrigger.refresh());
window.addEventListener('load', () => ScrollTrigger.refresh());
