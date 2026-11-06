// Interactive line figures (Hairline). Each element with data-hairline answers the pointer.
import {
  plot,
  sieve,
  riffle,
  relay,
  plug,
  terminal,
} from "./vendor/hairline.js";
const figures = { plot, sieve, riffle, relay, plug, terminal };
document.querySelectorAll("[data-hairline]").forEach((el) => {
  const make = figures[el.dataset.hairline];
  if (!make) return;
  const out = el.dataset.read
    ? document.querySelector(`[data-read-out="${el.dataset.read}"]`)
    : null;
  make(el, {
    intensity: 0.6,
    label: el.dataset.label,
    play: el.hasAttribute("data-play"),
    onRead: out
      ? (text) => {
          out.textContent = text;
        }
      : void 0,
  });
});
