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

// ---------- Tageszeiten: Himmel, Sonne/Mond und kleine Animationen ----------

const PHASES = {
  morning: { label: '🌅 Morgen', sky: ['#33437a', '#e98a6a', '#ffd29a'], back: ['#6b5878', '#2c2a42'], front: ['#7b6386', '#24273b'], sun: '#ffb36b', snow: '#ffe9dc' },
  day: { label: '☀️ Tag', sky: ['#1f6fb5', '#5fa8de', '#a9d8f5'], back: ['#4a7b9c', '#24435a'], front: ['#5a8fb0', '#1e3549'], sun: '#fff1a8', snow: '#ffffff' },
  evening: { label: '🌇 Abend', sky: ['#2a1f52', '#a8465f', '#ff9a5a'], back: ['#57345c', '#24182e'], front: ['#663a5f', '#1e1a2e'], sun: '#ff7a45', snow: '#ffd2c2' },
  night: { label: '🌙 Nacht', sky: ['#060b18', '#0f1a30', '#1a2a44'], back: ['#2b4660', '#14202c'], front: ['#36597a', '#162433'], sun: '#e8eef4', snow: '#e8f4ff' },
};

function phaseOf(h) {
  if (h >= 5 && h < 11) return 'morning';
  if (h >= 11 && h < 17) return 'day';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

// Position auf einem Bogen über den Himmel: t = 0 (links, Horizont) … 1 (rechts, Horizont)
function skyArc(t) {
  t = clamp(t, 0, 1);
  return { x: 24 + t * 292, y: 104 - Math.sin(Math.PI * t) * 90 };
}

function celestial(now = new Date()) {
  const h = now.getHours() + now.getMinutes() / 60;
  const phase = phaseOf(now.getHours());
  // Sonne von 6 bis 20 Uhr, Mond von 20 bis 6 Uhr
  const isSun = h >= 6 && h < 20;
  const t = isSun ? (h - 6) / 14 : (((h - 20) + 24) % 24) / 10;
  return { phase, isSun, pos: skyArc(t), time: now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) };
}

function phaseExtras(phase) {
  if (phase === 'morning') {
    // Vogelschwarm zieht vorbei
    const bird = (x, y, d) => `<g transform="translate(${x},${y})"><path class="bird" style="animation-delay:${d}s" d="M0,0 q4,-5 8,0 q4,-5 8,0"/></g>`;
    return `<g class="birds">${bird(0, 40, 0)}${bird(14, 33, 0.15)}${bird(26, 44, 0.3)}${bird(-12, 48, 0.45)}</g>`;
  }
  if (phase === 'day') {
    const cloud = (x, y, s, cls) => `<g class="cloud ${cls}" transform="translate(${x},${y}) scale(${s})"><ellipse cx="0" cy="0" rx="18" ry="7"/><ellipse cx="-9" cy="-4" rx="9" ry="7"/><ellipse cx="7" cy="-6" rx="11" ry="9"/></g>`;
    return `<g class="clouds">${cloud(40, 30, 1, 'c1')}${cloud(150, 48, 0.75, 'c2')}${cloud(250, 22, 0.9, 'c3')}</g>`;
  }
  if (phase === 'evening') {
    // Glühwürmchen über den Bergen
    return `<g class="fireflies">${Array.from({ length: 7 }, (_, i) => `<circle class="firefly" cx="${30 + i * 44}" cy="${110 + (i % 3) * 12}" r="1.4" style="animation-delay:${i * 0.6}s"/>`).join('')}</g>`;
  }
  // Nacht: Sternschnuppe
  return `<g class="shooting"><line x1="0" y1="0" x2="26" y2="0"/></g>`;
}

function mountainScene(pct, p) {
  const me = trailPoint(pct);
  const pts = TRAIL.map((q) => q.join(',')).join(' ');
  const c = celestial();
  const ph = PHASES[c.phase];
  const span = p.goalWeight - p.startWeight;
  let flags = '';
  for (let kg = Math.floor(p.startWeight) + 1; kg < p.goalWeight; kg++) {
    const f = (kg - p.startWeight) / span;
    const q = trailPoint(f);
    const got = pct >= f;
    flags += `<g class="ms ${got ? 'got' : ''}" transform="translate(${q.x.toFixed(1)},${q.y.toFixed(1)})"><circle r="3.2"/><text y="-6" text-anchor="middle">${kg}</text></g>`;
  }
  const starOpacity = c.phase === 'night' ? 1 : c.phase === 'evening' ? 0.35 : 0;
  const stars = starOpacity ? `<g opacity="${starOpacity}">${Array.from({ length: 18 }, (_, i) => {
    const x = (i * 73 + 11) % 340, y = 8 + ((i * 37) % 70);
    return `<circle class="star" cx="${x}" cy="${y}" r="${i % 3 ? 0.9 : 1.4}" style="animation-delay:${(i * 0.37) % 3}s"/>`;
  }).join('')}</g>` : '';
  const { x: sx, y: sy } = c.pos;
  const body = c.isSun
    ? `<g class="sunwrap" transform="translate(${sx.toFixed(1)},${sy.toFixed(1)})">
        <circle class="sun-glow" r="30" fill="url(#sunGlow)"/>
        ${c.phase === 'evening' || c.phase === 'day' ? `<g class="rays">${Array.from({ length: 12 }, (_, i) => `<line x1="0" y1="-13" x2="0" y2="-19" transform="rotate(${i * 30})"/>`).join('')}</g>` : ''}
        <circle r="9" fill="${ph.sun}"/>
      </g>`
    : `<g class="moonwrap" transform="translate(${sx.toFixed(1)},${sy.toFixed(1)})">
        <circle class="sun-glow" r="26" fill="url(#sunGlow)"/>
        <circle r="8.5" fill="#eef3fa"/>
        <circle cx="-2.5" cy="-2" r="1.6" fill="#cfd8e4"/><circle cx="2.8" cy="2.5" r="1.2" fill="#cfd8e4"/><circle cx="1.5" cy="-3.5" r=".8" fill="#cfd8e4"/>
      </g>`;

  return `<svg class="scene phase-${c.phase}" viewBox="0 0 340 160" role="img" aria-label="${ph.label.slice(2)}: Bergpfad, ${Math.round(pct * 100)} % des Weges zu ${p.goalWeight} kg">
    <defs>
      <clipPath id="skyClip"><rect width="340" height="160" rx="12"/></clipPath>
      <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${ph.sky[0]}"/><stop offset=".6" stop-color="${ph.sky[1]}"/><stop offset="1" stop-color="${ph.sky[2]}"/></linearGradient>
      <linearGradient id="mtnBack" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${ph.back[0]}"/><stop offset="1" stop-color="${ph.back[1]}"/></linearGradient>
      <linearGradient id="mtnFront" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${ph.front[0]}"/><stop offset="1" stop-color="${ph.front[1]}"/></linearGradient>
      <linearGradient id="trailGrad" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#3ddc84"/><stop offset="1" stop-color="#48e5ff"/></linearGradient>
      <radialGradient id="sunGlow"><stop offset="0" stop-color="${ph.sun}" stop-opacity=".85"/><stop offset="1" stop-color="${ph.sun}" stop-opacity="0"/></radialGradient>
    </defs>
    <g clip-path="url(#skyClip)">
      <rect class="sky" width="340" height="160" fill="url(#skyGrad)"/>
      ${stars}
      ${phaseExtras(c.phase)}
      <path d="M0,160 L0,110 L50,86 L104,98 L150,64 L196,78 L254,40 L304,72 L340,58 L340,160 Z" fill="url(#mtnBack)" opacity=".85"/>
      ${body}
      <path d="M0,160 L0,150 L60,124 L120,98 L170,58 L206,18 L238,48 L276,70 L340,104 L340,160 Z" fill="url(#mtnFront)"/>
      <path d="M206,18 L194,32 L201,30 L206,36 L212,29 L219,32 Z" fill="${ph.snow}" opacity=".9"/>
    </g>
    <g class="flag" transform="translate(206,18)"><line x1="0" y1="0" x2="0" y2="-16" stroke="#e8eef4" stroke-width="1.4"/><path class="flag-cloth" d="M0,-16 L16,-12 L0,-8 Z" fill="#ffd166"/></g>
    <text x="226" y="12" class="goal-label">${p.goalWeight} kg</text>
    <g class="phase-chip" transform="translate(10,10)"><rect width="86" height="16" rx="8"/><text x="43" y="11.2" text-anchor="middle">${ph.label} · ${c.time}</text></g>
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

// Jede Minute Himmel aktualisieren, ohne die ganze Seite neu aufzubauen
let sceneArgs = null;
setInterval(() => {
  const el = document.querySelector('.scene');
  if (!el || !sceneArgs) return;
  const tmp = document.createElement('div');
  tmp.innerHTML = mountainScene(...sceneArgs);
  el.replaceWith(tmp.firstElementChild);
}, 60000);

// Kategorie-Bilder für Rezepte
const RECIPE_ART = {
  'shake-classic': '🥤', 'shake-choc': '🍫', 'shake-berry': '🫐', oats: '🥣', eggs: '🍳', pancakes: '🥞', muesli: '🥛',
  bolo: '🍝', bowl: '🍚', salmon: '🐟', wraps: '🌯', chili: '🌶️', curry: '🍛', carbonara: '🥓',
  trail: '🥜', pbbread: '🍌', quark: '🍯', cheesebread: '🧀', granola: '🍓',
};
