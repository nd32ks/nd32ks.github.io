// Interactive line figures (Hairline). Each element with data-hairline answers the pointer.
import { plot, sieve, riffle, relay, plug } from './vendor/hairline.js';

const figures = { plot, sieve, riffle, relay, plug };
document.querySelectorAll('[data-hairline]').forEach((el) => {
  const make = figures[el.dataset.hairline];
  if (make) make(el, { intensity: 0.6, label: el.dataset.label });
});
