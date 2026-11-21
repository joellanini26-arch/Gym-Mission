'use strict';

/* =========================================================
   Effekte: Konfetti, Bergpfad zum Ziel, Zähl-Animationen
   ========================================================= */

const REDUCED_MOTION = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Letzte Tipp-Position, damit Konfetti dort startet, wo getippt wurde
let lastPointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
window.addEventListener('pointerdown', (e) => { lastPointer = { x: e.clientX, y: e.clientY }; }, true);

const CONFETTI_COLORS = ['#c084fc', '#f472b6', '#ffd166', '#fbcfe8', '#a78bfa', '#ffffff'];

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
      col: CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0], life: 0, heart: Math.random() < 0.5,
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
      if (p.heart) {
        const s = p.w * 0.9;
        ctx.beginPath();
        ctx.moveTo(0, s * 0.9);
        ctx.bezierCurveTo(-s * 1.2, s * 0.1, -s, -s * 0.9, 0, -s * 0.35);
        ctx.bezierCurveTo(s, -s * 0.9, s * 1.2, s * 0.1, 0, s * 0.9);
        ctx.fill();
      } else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
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

const TRAIL = [[62, 146], [96, 122], [74, 98], [124, 84], [158, 98], [196, 74], [176, 52], [228, 42], [262, 28]];

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
  morning: { label: '🌅 Morgen', sky: ['#5b3f8c', '#e58fb3', '#ffd6bd'], back: ['#9a6fc9', '#5b3a8a'], front: ['#b48ae0', '#6b44a0'], sun: '#ffb3a7', snow: '#fff' },
  day: { label: '☀️ Tag', sky: ['#7c5cd6', '#a98bf0', '#f1d6f6'], back: ['#8f6fd8', '#563c9c'], front: ['#a888ec', '#6446ad'], sun: '#fff1a8', snow: '#fff' },
  evening: { label: '🌇 Abend', sky: ['#3a1f5c', '#b44f8a', '#ff9f7a'], back: ['#6a3a7e', '#331b4a'], front: ['#7f4690', '#3c2055'], sun: '#ff8a8a', snow: '#ffd2e0' },
  night: { label: '🌙 Nacht', sky: ['#120a24', '#26164a', '#3b2363'], back: ['#3a2563', '#1c1033'], front: ['#4a2f78', '#21133b'], sun: '#f5eefc', snow: '#f5eefc' },
}

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
    return `<g class="fireflies">${Array.from({ length: 7 }, (_, i) => `<path class="firefly" d="${heartPath(30 + i * 44, 120 + (i % 3) * 10, 2.4)}" style="animation-delay:${i * 0.6}s"/>`).join('')}</g>`;
  }
  // Nacht: Sternschnuppe
  return `<g class="shooting"><line x1="0" y1="0" x2="26" y2="0"/></g>`;
}

function heartPath(cx, cy, s) {
  const n = (v) => v.toFixed(1);
  return `M${n(cx)},${n(cy + s * 0.9)} C${n(cx - s * 1.2)},${n(cy + s * 0.1)} ${n(cx - s)},${n(cy - s * 0.9)} ${n(cx)},${n(cy - s * 0.35)} C${n(cx + s)},${n(cy - s * 0.9)} ${n(cx + s * 1.2)},${n(cy + s * 0.1)} ${n(cx)},${n(cy + s * 0.9)} Z`;
}

// Herz-Heißluftballon: je leichter, desto höher fliegt das Herz
function balloonScene(pct, p) {
  const me = trailPoint(pct);
  const pts = TRAIL.map((q) => q.join(',')).join(' ');
  const c = celestial();
  const ph = PHASES[c.phase];
  const span = p.startWeight - p.goalWeight;
  let marks = '';
  for (let kg = Math.ceil(p.startWeight) - 1; kg > p.goalWeight; kg--) {
    const f = (p.startWeight - kg) / span;
    const q = trailPoint(f);
    const got = pct >= f;
    marks += `<g class="ms ${got ? 'got' : ''}" transform="translate(${q.x.toFixed(1)},${q.y.toFixed(1)})"><path d="${heartPath(0, 0, 3.6)}"/><text y="-6" text-anchor="middle">${kg}</text></g>`;
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
        ${c.phase === 'day' ? `<g class="rays">${Array.from({ length: 12 }, (_, i) => `<line x1="0" y1="-13" x2="0" y2="-19" transform="rotate(${i * 30})"/>`).join('')}</g>` : ''}
        <circle r="9" fill="${ph.sun}"/>
      </g>`
    : `<g class="moonwrap" transform="translate(${sx.toFixed(1)},${sy.toFixed(1)})">
        <circle class="sun-glow" r="26" fill="url(#sunGlow)"/>
        <circle r="8.5" fill="#f5eefc"/><circle cx="-2.5" cy="-2" r="1.6" fill="#e2d5f0"/><circle cx="2.8" cy="2.5" r="1.2" fill="#e2d5f0"/><path d="${heartPath(1.5, -3.2, 1.1)}" fill="#f9a8d4"/>
      </g>`;
  // Blumenwiese
  const flowers = Array.from({ length: 16 }, (_, i) => {
    const x = 8 + i * 21 + (i % 3) * 4, y = 152 + (i % 4) * 4;
    return `<path class="flower" d="${heartPath(x, y, i % 2 ? 2 : 2.6)}" style="animation-delay:${(i * 0.3) % 2}s"/>`;
  }).join('');

  return `<svg class="scene phase-${c.phase}" viewBox="0 0 340 170" role="img" aria-label="${ph.label.slice(2)}: Herzballon, ${Math.round(pct * 100)} % des Weges zu ${p.goalWeight} kg">
    <defs>
      <clipPath id="skyClip"><rect width="340" height="170" rx="12"/></clipPath>
      <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${ph.sky[0]}"/><stop offset=".6" stop-color="${ph.sky[1]}"/><stop offset="1" stop-color="${ph.sky[2]}"/></linearGradient>
      <linearGradient id="mtnBack" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${ph.back[0]}"/><stop offset="1" stop-color="${ph.back[1]}"/></linearGradient>
      <linearGradient id="mtnFront" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${ph.front[0]}"/><stop offset="1" stop-color="${ph.front[1]}"/></linearGradient>
      <linearGradient id="trailGrad" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#f472b6"/><stop offset="1" stop-color="#ffd166"/></linearGradient>
      <linearGradient id="balloonGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8fc7"/><stop offset=".55" stop-color="#e64598"/><stop offset="1" stop-color="#a21caf"/></linearGradient>
      <radialGradient id="sunGlow"><stop offset="0" stop-color="${ph.sun}" stop-opacity=".85"/><stop offset="1" stop-color="${ph.sun}" stop-opacity="0"/></radialGradient>
      <radialGradient id="goalGlow"><stop offset="0" stop-color="#ffd166" stop-opacity=".9"/><stop offset="1" stop-color="#ffd166" stop-opacity="0"/></radialGradient>
    </defs>
    <g clip-path="url(#skyClip)">
      <rect class="sky" width="340" height="170" fill="url(#skyGrad)"/>
      ${stars}
      ${body}
      ${phaseExtras(c.phase)}
      <path d="M0,170 L0,146 Q60,128 130,144 T260,140 T340,136 L340,170 Z" fill="url(#mtnBack)" opacity=".9"/>
      <path d="M0,170 L0,156 Q80,140 170,154 T340,150 L340,170 Z" fill="url(#mtnFront)"/>
      ${flowers}
    </g>
    <g class="goal" transform="translate(262,28)">
      <circle class="goal-glow" r="22" fill="url(#goalGlow)"/>
      <ellipse cx="-6" cy="4" rx="12" ry="6" fill="#fff" opacity=".9"/><ellipse cx="6" cy="2" rx="11" ry="7" fill="#fff" opacity=".95"/><ellipse cx="0" cy="-2" rx="8" ry="7" fill="#fff"/>
      <path class="goal-heart" d="${heartPath(0, -1, 5)}" fill="#ffd166"/>
    </g>
    <text x="262" y="56" class="goal-label" text-anchor="middle">${p.goalWeight} kg</text>
    <g class="phase-chip" transform="translate(10,10)"><rect width="86" height="16" rx="8"/><text x="43" y="11.2" text-anchor="middle">${ph.label} · ${c.time}</text></g>
    <polyline points="${pts}" class="trail-bg"/>
    <polyline points="${pts}" class="trail" style="--len:${me.total.toFixed(0)};--walked:${(me.total * clamp(pct, 0, 1)).toFixed(1)}"/>
    ${marks}
    <g class="me" style="--mx:${me.x.toFixed(1)}px;--my:${me.y.toFixed(1)}px">
      <g class="balloon">
        <path class="me-pulse" d="${heartPath(0, -24, 13)}"/>
        <line x1="-9" y1="-16" x2="-4" y2="-4" class="rope"/><line x1="9" y1="-16" x2="4" y2="-4" class="rope"/>
        <path class="envelope" d="${heartPath(0, -24, 13)}"/>
        <path d="M-5,-30 Q-8,-24 -4,-19" class="shine"/>
        <rect x="-5" y="-4" width="10" height="7" rx="1.5" class="basket"/>
        <path class="mini-heart h1" d="${heartPath(0, -42, 2.2)}"/><path class="mini-heart h2" d="${heartPath(0, -42, 1.8)}"/>
      </g>
    </g>
    <text x="62" y="167" class="start-label" text-anchor="middle">Start ${p.startWeight} kg</text>
  </svg>`;
}

// Jede Minute Himmel aktualisieren, ohne die ganze Seite neu aufzubauen
let sceneArgs = null;
setInterval(() => {
  const el = document.querySelector('.scene');
  if (!el || !sceneArgs) return;
  const tmp = document.createElement('div');
  tmp.innerHTML = balloonScene(...sceneArgs);
  el.replaceWith(tmp.firstElementChild);
}, 60000);

// Kategorie-Bilder für Rezepte
const RECIPE_ART = {
  'sm-berry': '🫐', 'sm-choc': '🍫', 'sm-green': '🥝', oats: '🥣', eggs: '🍳', pancakes: '🥞', chia: '🥭',
  pan: '🥘', salmon: '🐟', zoodles: '🍝', tuna: '🥗', wrap: '🌯', dal: '🍛', shakshuka: '🍅',
  apple: '🍎', skyr: '🍓', edamame: '🫛', ricecake: '🥑', hummus: '🥕',
}
