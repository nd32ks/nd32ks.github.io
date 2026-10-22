/* Site behaviour. Needs gsap, ScrollTrigger and Lenis (loaded before this file from ./vendor). */
(() => {
  "use strict";
  const { gsap, ScrollTrigger, Lenis } = window;
  gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileQuery = window.matchMedia("(max-width: 767px)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const store = {
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch {}
    },
  };
  const themeBtn = document.querySelector("[data-theme-toggle]");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const syncThemeUi = () => {
    const dark = root.dataset.theme !== "light";
    if (themeBtn)
      themeBtn.setAttribute(
        "aria-label",
        (dark ? themeBtn.dataset.toLight : themeBtn.dataset.toDark) ?? "",
      );
    themeMeta?.setAttribute("content", dark ? "#04050A" : "#E9EEF3");
  };
  syncThemeUi();
  themeBtn?.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
    store.set("theme", root.dataset.theme);
    syncThemeUi();
    drawSky();
  });
  document.querySelectorAll(".lang a").forEach((a) => {
    a.addEventListener("click", () =>
      store.set("lang", a.getAttribute("hreflang") === "zh-CN" ? "zh" : "en"),
    );
  });
  let lenis = null;
  const tickLenis = (time) => lenis?.raf(time * 1e3);
  function startLenis() {
    if (reduceMotion.matches || lenis) return;
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(tickLenis);
    gsap.ticker.lagSmoothing(0);
  }
  startLenis();
  reduceMotion.addEventListener("change", () => {
    if (reduceMotion.matches && lenis) {
      gsap.ticker.remove(tickLenis);
      lenis.destroy();
      lenis = null;
    } else startLenis();
  });
  const scrollToY = (y) => {
    if (lenis) lenis.scrollTo(y, { duration: 1.3 });
    else
      window.scrollTo({
        top: y,
        behavior: reduceMotion.matches ? "auto" : "smooth",
      });
  };
  document.querySelectorAll("[data-split]").forEach((el) => {
    const text = el.textContent?.trim() ?? "";
    const parts = /\s/.test(text) ? text.split(/(\s+)/) : [...text];
    el.setAttribute("aria-label", text);
    el.innerHTML = "";
    let wi = 0;
    parts.forEach((part) => {
      if (/^\s+$/.test(part)) {
        el.appendChild(document.createTextNode(" "));
        return;
      }
      const w = document.createElement("span");
      w.className = "w";
      w.setAttribute("aria-hidden", "true");
      const inner = document.createElement("span");
      inner.textContent = part;
      inner.style.setProperty("--wi", String(wi++));
      w.appendChild(inner);
      el.appendChild(w);
    });
  });
  const revealIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          revealIo.unobserve(en.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
  );
  document
    .querySelectorAll("[data-reveal], [data-split], .project")
    .forEach((el) => revealIo.observe(el));
  const hero = document.querySelector("[data-hero]");
  const ready = () => hero?.classList.add("ready");
  document.fonts?.ready.then(ready);
  window.setTimeout(ready, 700);
  const navLinks = [...document.querySelectorAll("[data-navlink]")];
  const sectionIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        navLinks.forEach((a) =>
          a.getAttribute("href") === `#${en.target.id}`
            ? a.setAttribute("aria-current", "true")
            : a.removeAttribute("aria-current"),
        );
      });
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  navLinks.forEach((a) => {
    const s = document.querySelector(a.getAttribute("href") ?? "");
    if (s) sectionIo.observe(s);
  });
  const sky = document.querySelector("[data-sky]");
  let stars = [];
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let scrollY = window.scrollY;
  let twinkle = 0;
  function makeStars() {
    let s = 7;
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const scale = mobileQuery.matches ? 0.45 : 1;
    stars = [];
    [
      [160, 0.06, 1, 0.5],
      [70, 0.16, 1.5, 0.7],
      [24, 0.34, 2.3, 0.95],
    ].forEach(([n, f, size, o]) => {
      for (let i = 0; i < Math.round(n * scale); i++)
        stars.push({
          x: r(),
          y: r(),
          f,
          r: size * (0.6 + r() * 0.6),
          o: o * (0.4 + r() * 0.6),
          warm: r() > 0.9,
          ph: r() * 6.28,
        });
    });
  }
  function drawSky() {
    if (!sky) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = sky.clientWidth,
      h = sky.clientHeight;
    if (
      sky.width !== Math.round(w * dpr) ||
      sky.height !== Math.round(h * dpr)
    ) {
      sky.width = Math.round(w * dpr);
      sky.height = Math.round(h * dpr);
    }
    const ctx = sky.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const dark = root.dataset.theme !== "light";
    const move = !reduceMotion.matches;
    for (const st of stars) {
      const py = move ? st.y * h - scrollY * st.f : st.y * h;
      const y = ((py % h) + h) % h;
      const x = st.x * w + (move ? pointer.x * st.f * 60 : 0);
      const tw =
        move && st.f < 0.3 ? 0.75 + 0.25 * Math.sin(twinkle * 1.4 + st.ph) : 1;
      ctx.globalAlpha = (dark ? st.o : st.o * 0.35) * tw;
      ctx.fillStyle = dark ? (st.warm ? "#FFD9A8" : "#D8E0FF") : "#5B6575";
      if (dark && st.f > 0.3) {
        ctx.shadowColor = "rgba(216,224,255,0.6)";
        ctx.shadowBlur = 6;
      } else ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(x, y, st.r / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }
  makeStars();
  drawSky();
  new ResizeObserver(drawSky).observe(sky ?? document.body);
  mobileQuery.addEventListener("change", () => {
    makeStars();
    drawSky();
  });
  if (finePointer.matches) {
    window.addEventListener(
      "pointermove",
      (e) => {
        pointer.tx = e.clientX / window.innerWidth - 0.5;
        pointer.ty = e.clientY / window.innerHeight - 0.5;
      },
      { passive: true },
    );
  }
  let lastTw = 0;
  gsap.ticker.add((time) => {
    if (document.hidden || reduceMotion.matches) return;
    const px = pointer.x;
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    const moved = Math.abs(px - pointer.x) > 5e-4;
    const sy = window.scrollY;
    const scrolled = sy !== scrollY;
    scrollY = sy;
    if (scrolled || moved || time - lastTw > 0.08) {
      lastTw = time;
      twinkle = time;
      drawSky();
    }
  });
  const stageWrap = document.querySelector("[data-stage-wrap]");
  const rails = [...document.querySelectorAll("[data-rail]")];
  const panels = [...document.querySelectorAll("[data-panel]")];
  const consts = [...document.querySelectorAll("[data-const]")];
  const countEl = document.querySelector("[data-count]");
  let current = -1;
  function setStage(q) {
    const N = panels.length || 4;
    const k = Math.min(N - 1, Math.floor(q * N));
    const l = q * N - k;
    const draw = clamp(l / 0.6);
    if (k !== current) {
      current = k;
      panels.forEach((p, i) => p.classList.toggle("on", i === k));
      consts.forEach((c2, i) => c2.classList.toggle("on", i === k));
      rails.forEach((r, i) => r.classList.toggle("on", i === k));
      if (countEl) countEl.textContent = String(k + 1).padStart(2, "0");
    }
    rails.forEach((r, i) =>
      r.style.setProperty("--fill", String(i < k ? 1 : i === k ? draw : 0)),
    );
    const c = consts[k];
    if (!c) return;
    const segs = c.querySelectorAll("[data-seg]");
    const n = segs.length + 1;
    const reach = draw * (n - 1);
    segs.forEach((s, j) =>
      s.style.setProperty("--d", String(1 - clamp(reach - j))),
    );
    c.querySelectorAll("[data-star]").forEach((s) =>
      s.classList.toggle("reached", reach >= Number(s.dataset.star) - 0.01),
    );
    c.querySelectorAll("[data-label]").forEach((s) =>
      s.classList.toggle("reached", reach >= Number(s.dataset.label) - 0.01),
    );
    panels[k]
      .querySelectorAll("[data-skill-star]")
      .forEach((s) =>
        s.classList.toggle("lit", reach >= Number(s.dataset.skillStar) - 0.01),
      );
    if (!reduceMotion.matches)
      c.style.transform = `translate3d(0, ${((0.5 - l) * 50).toFixed(1)}px, 0)`;
  }
  const stageTop = () =>
    stageWrap ? stageWrap.getBoundingClientRect().top + window.scrollY : 0;
  const stageSpan = () =>
    stageWrap ? stageWrap.offsetHeight - window.innerHeight : 1;
  function jumpTo(i) {
    scrollToY(stageTop() + ((i + 0.62) / (panels.length || 4)) * stageSpan());
  }
  if (stageWrap) {
    setStage(0);
    ScrollTrigger.create({
      trigger: stageWrap,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => setStage(Math.min(0.9999, self.progress)),
    });
    document.querySelectorAll("[data-jump]").forEach((a) =>
      a.addEventListener("click", (e) => {
        e.preventDefault();
        jumpTo(Number(a.dataset.jump));
      }),
    );
  }
  document.addEventListener("click", (e) => {
    const ph = e.target.closest('a[aria-disabled="true"]');
    if (ph) {
      e.preventDefault();
      return;
    }
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.dataset.jump) return;
    const hash = a.getAttribute("href") ?? "";
    if (hash.length < 2) return;
    e.preventDefault();
    const panel = document.querySelector(`${hash}[data-panel]`);
    if (panel) {
      jumpTo(Number(panel.dataset.panel));
      return;
    }
    if (hash === "#top") {
      scrollToY(0);
      return;
    }
    const target = document.querySelector(hash);
    if (!target) return;
    scrollToY(
      target.getBoundingClientRect().top +
        window.scrollY -
        (hash === "#work" ? 0 : 24),
    );
    history.replaceState(null, "", hash);
  });
  const skillBtns = [...document.querySelectorAll("[data-skill]")];
  const weeks = [...document.querySelectorAll("[data-pass]")];
  const shipped = [...document.querySelectorAll(".shipped a")];
  let activeSkill = "";
  function showSkill(id) {
    weeks.forEach((w) => {
      w.classList.toggle(
        "dim",
        !!id && !(w.dataset.skills ?? "").split(" ").includes(id),
      );
      w.querySelectorAll("[data-chip]").forEach((ch) =>
        ch.classList.toggle("hit", !!id && ch.dataset.chip === id),
      );
    });
    shipped.forEach((a) => {
      const has = (a.dataset.skills ?? "").split(" ").includes(id);
      a.classList.toggle("hit", !!id && has);
      a.classList.toggle("dim", !!id && !has);
    });
  }
  skillBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      activeSkill = btn.dataset.skill ?? "";
      skillBtns.forEach((b) =>
        b.setAttribute("aria-pressed", String(b === btn)),
      );
      showSkill(activeSkill);
    });
    if (finePointer.matches) {
      btn.addEventListener("pointerenter", () =>
        showSkill(btn.dataset.skill ?? ""),
      );
      btn.addEventListener("pointerleave", () => showSkill(activeSkill));
    }
  });
  const now = /* @__PURE__ */ new Date();
  const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  weeks.forEach((w) => {
    const el = w.querySelector("[data-status]");
    if (!el) return;
    const st =
      iso < (w.dataset.start ?? "")
        ? "next"
        : iso <= (w.dataset.due ?? "")
          ? "live"
          : w.dataset.hasRepo
            ? "done"
            : "review";
    el.className = `pass-status s-${st}`;
    el.textContent =
      el.dataset[`l${st[0].toUpperCase()}${st.slice(1)}`] ?? el.textContent;
    const lit = st === "done" ? 5 : st === "next" ? 0 : 3;
    w.querySelectorAll(".mini-star").forEach((s, i) =>
      s.classList.toggle("on", i < lit),
    );
    w.querySelectorAll(".mini line").forEach((s, i) =>
      s.classList.toggle("on", i + 1 < lit),
    );
  });
  const fill = document.querySelector("[data-action-fill]");
  if (fill)
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        fill.style.transform = `scaleX(${self.progress.toFixed(4)})`;
      },
    });
  if (finePointer.matches && !reduceMotion.matches) {
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.22);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.32);
      });
      el.addEventListener("pointerleave", () => {
        xTo(0);
        yTo(0);
      });
    });
  }
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const copy = document.querySelectorAll("[data-hero-copy]");
    if (copy.length)
      gsap.fromTo(
        copy,
        { y: 0, opacity: 1 },
        {
          y: -160,
          opacity: 0,
          ease: "none",
          immediateRender: false,
          scrollTrigger: {
            trigger: "[data-hero]",
            start: "top top",
            end: "bottom 20%",
            scrub: true,
          },
        },
      );
    document.querySelectorAll("[data-depth]").forEach((el) => {
      const v = Number(el.dataset.depth) || 0;
      gsap.fromTo(
        el,
        { y: -v },
        {
          y: v,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    });
    const ch = document.querySelector("[data-contact-h]");
    if (ch)
      gsap.fromTo(
        ch,
        { scale: 0.86, y: 50 },
        {
          scale: 1,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: ch,
            start: "top bottom",
            end: "top 40%",
            scrub: true,
          },
        },
      );
  });
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
