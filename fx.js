'use strict';

/* =========================================================
   Effekte: Konfetti, Bergpfad zum Ziel, Zähl-Animationen
   ========================================================= */

const REDUCED_MOTION = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Letzte Tipp-Position, damit Konfetti dort startet, wo getippt wurde
let lastPointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
window.addEventListener('pointerdown', (e) => { lastPointer = { x: e.clientX, y: e.clientY }; }, true);

const CONFETTI_COLORS = ['#3ddc84', '#48e5ff', '#ffd166', '#ff6b9a', '#a78bfa', '#ffffff'];

function confetti(amount = 40, origin = lastPointer, spread = 1) {
  if (REDUCED_MOTION) return;
  const c = document.createElement('canvas');
  c.className = 'confetti';
  const dpr = window.devicePixelRatio || 1;
  c.width = innerWidth * dpr;
  c.height = innerHeight * dpr;
  document.body.appendChild(c);
  const ctx = c.getContext('2d');
  ctx.scale(dpr, dpr);
  const parts = Array.from({ length: amount }, () => {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1 * spread;
    const v = 5 + Math.random() * 7 * spread;
    return {
      x: origin.x, y: origin.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
      w: 5 + Math.random() * 6, h: 3 + Math.random() * 4,
      r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.4,
      col: CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0], life: 0,
    };
  });
  const t0 = performance.now();
  (function frame(t) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of parts) {
      p.vy += 0.28; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.globalAlpha = Math.max(0, 1 - (t - t0) / 1800);
      ctx.fillStyle = p.col;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (t - t0 < 1800) requestAnimationFrame(frame);
    else c.remove();
  })(t0);
}

function bigCelebration() {
  confetti(80, { x: innerWidth * 0.25, y: innerHeight * 0.55 }, 1.2);
  setTimeout(() => confetti(80, { x: innerWidth * 0.75, y: innerHeight * 0.55 }, 1.2), 180);
}

// Zahlen hochzählen lassen: <span data-count="60.4" data-dec="1">
function animateCounts(root) {
  root.querySelectorAll('[data-count]').forEach((el) => {
    const to = parseFloat(el.dataset.count);
    const dec = +(el.dataset.dec || 0);
    const from = parseFloat(el.dataset.from || 0);
    const fmt = (v) => v.toLocaleString('de-DE', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    if (REDUCED_MOTION) { el.textContent = fmt(to); return; }
    const t0 = performance.now(), dur = 900;
    (function step(t) {
      const k = Math.min((t - t0) / dur, 1);
      const e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  });
}

// ---------- Bergpfad: der Weg von Start- zu Zielgewicht ----------

const TRAIL = [[26, 146], [112, 128], [66, 110], [150, 92], [116, 74], [184, 60], [160, 44], [206, 26]];

function trailPoint(frac) {
  const segs = [];
  let total = 0;
  for (let i = 1; i < TRAIL.length; i++) {
    const l = Math.hypot(TRAIL[i][0] - TRAIL[i - 1][0], TRAIL[i][1] - TRAIL[i - 1][1]);
    segs.push(l); total += l;
  }
  let d = clamp(frac, 0, 1) * total;
  for (let i = 0; i < segs.length; i++) {
    if (d <= segs[i]) {
      const t = d / segs[i];
      return { x: TRAIL[i][0] + (TRAIL[i + 1][0] - TRAIL[i][0]) * t, y: TRAIL[i][1] + (TRAIL[i + 1][1] - TRAIL[i][1]) * t, total };
    }
    d -= segs[i];
  }
  const last = TRAIL[TRAIL.length - 1];
  return { x: last[0], y: last[1], total };
}

function mountainScene(pct, p) {
  const me = trailPoint(pct);
  const pts = TRAIL.map((q) => q.join(',')).join(' ');
  // Meilenstein-Fähnchen für jedes volle Kilo
  const span = p.goalWeight - p.startWeight;
  let flags = '';
  for (let kg = Math.floor(p.startWeight) + 1; kg < p.goalWeight; kg++) {
    const f = (kg - p.startWeight) / span;
    const q = trailPoint(f);
    const got = pct >= f;
    flags += `<g class="ms ${got ? 'got' : ''}" transform="translate(${q.x.toFixed(1)},${q.y.toFixed(1)})"><circle r="3.2"/><text y="-6" text-anchor="middle">${kg}</text></g>`;
  }
  const stars = Array.from({ length: 14 }, (_, i) => {
    const x = (i * 73) % 340, y = 8 + ((i * 37) % 60);
    return `<circle class="star" cx="${x}" cy="${y}" r="${i % 3 ? 0.9 : 1.4}" style="animation-delay:${(i * 0.37) % 3}s"/>`;
  }).join('');

  return `<svg class="scene" viewBox="0 0 340 160" role="img" aria-label="Bergpfad: ${Math.round(pct * 100)} % des Weges zu ${p.goalWeight} kg">
    <defs>
      <linearGradient id="mtnBack" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b4660"/><stop offset="1" stop-color="#14202c"/></linearGradient>
      <linearGradient id="mtnFront" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#36597a"/><stop offset="1" stop-color="#162433"/></linearGradient>
      <linearGradient id="trailGrad" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#3ddc84"/><stop offset="1" stop-color="#48e5ff"/></linearGradient>
      <radialGradient id="sunGlow"><stop offset="0" stop-color="#ffd166" stop-opacity=".9"/><stop offset="1" stop-color="#ffd166" stop-opacity="0"/></radialGradient>
    </defs>
    ${stars}
    <circle class="sun" cx="292" cy="34" r="30" fill="url(#sunGlow)"/>
    <circle cx="292" cy="34" r="9" fill="#ffd166"/>
    <path d="M0,160 L0,110 L50,86 L104,98 L150,64 L196,78 L254,40 L304,72 L340,58 L340,160 Z" fill="url(#mtnBack)" opacity=".8"/>
    <path d="M0,160 L0,150 L60,124 L120,98 L170,58 L206,18 L238,48 L276,70 L340,104 L340,160 Z" fill="url(#mtnFront)"/>
    <path d="M206,18 L194,32 L201,30 L206,36 L212,29 L219,32 Z" fill="#e8f4ff" opacity=".9"/>
    <g class="flag" transform="translate(206,18)"><line x1="0" y1="0" x2="0" y2="-16" stroke="#e8eef4" stroke-width="1.4"/><path class="flag-cloth" d="M0,-16 L16,-12 L0,-8 Z" fill="#ffd166"/></g>
    <text x="226" y="12" class="goal-label">${p.goalWeight} kg</text>
    <polyline points="${pts}" class="trail-bg"/>
    <polyline points="${pts}" class="trail" style="--len:${me.total.toFixed(0)};--walked:${(me.total * clamp(pct, 0, 1)).toFixed(1)}"/>
    ${flags}
    <g class="me" style="--mx:${me.x.toFixed(1)}px;--my:${me.y.toFixed(1)}px">
      <circle class="me-pulse" r="7"/>
      <circle r="5.5" class="me-dot"/>
    </g>
    <text x="26" y="157" class="start-label">Start ${p.startWeight} kg</text>
  </svg>`;
}

// Kategorie-Bilder für Rezepte
const RECIPE_ART = {
  'shake-classic': '🥤', 'shake-choc': '🍫', 'shake-berry': '🫐', oats: '🥣', eggs: '🍳', pancakes: '🥞', muesli: '🥛',
  bolo: '🍝', bowl: '🍚', salmon: '🐟', wraps: '🌯', chili: '🌶️', curry: '🍛', carbonara: '🥓',
  trail: '🥜', pbbread: '🍌', quark: '🍯', cheesebread: '🧀', granola: '🍓',
};
