'use strict';

/* =========================================================
   Muskel-Hologramm: zeigt trainierte Muskelgruppen in Rot.
   Je mehr Sätze eine Muskelgruppe bekommen hat, desto röter.
   ========================================================= */

const MUSCLES = {
  chest: 'Brust', shoulders: 'Schultern', biceps: 'Bizeps', triceps: 'Trizeps', forearms: 'Unterarme',
  abs: 'Bauch', traps: 'Nacken', lats: 'Latissimus', upperback: 'Oberer Rücken', lowerback: 'Unterer Rücken',
  glutes: 'Po', quads: 'Oberschenkel vorne', hamstrings: 'Beinbeuger', calves: 'Waden',
};

// Erkennt Übungen am Namen – funktioniert auch für eigene Übungen.
// Reihenfolge wichtig: spezielle Muster vor allgemeinen.
// Werte: 1 = Hauptmuskel, < 1 = Hilfsmuskel
const MUSCLE_RULES = [
  [/rumän|rdl|gestreckt/i, { hamstrings: 1, glutes: 1, lowerback: 0.5 }],
  [/kreuzheben|deadlift/i, { hamstrings: 1, glutes: 1, lowerback: 1, quads: 0.5, traps: 0.5, upperback: 0.5, forearms: 0.5 }],
  [/hip ?thrust|glute|po-?brücke/i, { glutes: 1, hamstrings: 0.5 }],
  [/kniebeug|squat|hackenschmidt|split/i, { quads: 1, glutes: 1, hamstrings: 0.3, lowerback: 0.3 }],
  [/ausfall|lunge/i, { quads: 1, glutes: 1, hamstrings: 0.3 }],
  [/beinpresse|leg ?press/i, { quads: 1, glutes: 0.5 }],
  [/beinstreck|leg ?ext/i, { quads: 1 }],
  [/beinbeug|leg ?curl/i, { hamstrings: 1 }],
  [/wade|calf/i, { calves: 1 }],
  [/bankdrücken eng|enges? bank|close ?grip/i, { triceps: 1, chest: 0.7, shoulders: 0.3 }],
  [/dips/i, { triceps: 1, chest: 0.5, shoulders: 0.3 }],
  [/trizeps|triceps|french|skull|pushdown/i, { triceps: 1 }],
  [/bankdrück|bench|brustpresse|fliegende|butterfly|flys?\b|liegestütz|push-?up|cable ?cross|kabelzug.*brust/i, { chest: 1, triceps: 0.5, shoulders: 0.5 }],
  [/seitheben|lateral/i, { shoulders: 1, traps: 0.3 }],
  [/reverse|face ?pull|rear/i, { shoulders: 1, upperback: 0.5 }],
  [/schulter|military|overhead press|ohp|arnold/i, { shoulders: 1, triceps: 0.5, traps: 0.3 }],
  [/shrug|nacken/i, { traps: 1 }],
  [/hammer/i, { biceps: 1, forearms: 0.7 }],
  [/curl|bizeps|biceps/i, { biceps: 1, forearms: 0.5 }],
  [/klimm|pull-?up|chin|latzug|lat ?pull|pulldown|überzüge|pullover/i, { lats: 1, biceps: 0.5, upperback: 0.5, forearms: 0.3 }],
  [/rudern|row|t-bar/i, { upperback: 1, lats: 1, biceps: 0.5, shoulders: 0.3, lowerback: 0.3 }],
  [/hyperext|rückenstreck|back ?ext/i, { lowerback: 1, glutes: 0.5 }],
  [/plank|crunch|bauch|sit-?up|beinheben|ab |abs|russian|ab-?roller/i, { abs: 1 }],
  [/unterarm|forearm|farmer|grip/i, { forearms: 1 }],
];

function musclesFor(name) {
  for (const [re, m] of MUSCLE_RULES) if (re.test(name)) return m;
  return {};
}

// Summiert die erledigten Sätze pro Muskel über die gegebenen Tage
function muscleLoad(dayKeys) {
  const load = {};
  for (const k of dayKeys) {
    const d = state.days[k];
    if (!d || !d.workout || !WORKOUTS[d.workout.id]) continue;
    WORKOUTS[d.workout.id].exercises.forEach((ex, i) => {
      const n = (d.workout.sets[i] || []).filter(Boolean).length;
      if (!n) return;
      for (const [m, f] of Object.entries(musclesFor(ex.n))) load[m] = (load[m] || 0) + n * f;
    });
  }
  return load;
}

// ---------- Körperform (linke Hälfte, wird gespiegelt) ----------

const OUTLINE_LEFT = [
  [100, 8], [88, 11], [82, 22], [82, 36], [86, 48], [92, 56], [92, 64], [78, 70], [64, 76], [54, 84], [50, 98],
  [46, 120], [42, 150], [38, 178], [34, 205], [30, 230], [28, 248], [32, 258], [40, 252], [44, 232], [50, 206],
  [56, 178], [60, 150], [62, 128], [66, 114], [68, 140], [70, 168], [72, 190], [70, 212], [68, 236],
  [68, 270], [70, 305], [72, 330], [70, 355], [72, 380], [70, 394], [82, 398], [90, 394],
  [90, 370], [92, 340], [92, 310], [96, 270], [100, 250],
];

function smoothPath(pts) {
  // Catmull-Rom → Bézier für eine weiche Silhouette
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length; i++) {
    const p0 = pts[(i - 1 + pts.length) % pts.length], p1 = pts[i], p2 = pts[(i + 1) % pts.length], p3 = pts[(i + 2) % pts.length];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0]},${p2[1]}`;
  }
  return d + 'Z';
}

const BODY_PATH = smoothPath([...OUTLINE_LEFT, ...OUTLINE_LEFT.slice(1, -1).reverse().map(([x, y]) => [200 - x, y])]);

// Muskelformen der linken Körperhälfte; `c: true` = mittig, nicht spiegeln
const FRONT = [
  ['traps', 'M92,64 Q84,68 76,72 Q86,76 94,74 Z'],
  ['shoulders', 'M66,80 Q54,82 50,96 Q50,108 56,112 Q64,104 68,92 Z'],
  ['chest', 'M99,82 Q84,78 70,88 Q65,102 72,113 Q86,120 99,113 Z'],
  ['biceps', 'M56,114 Q50,124 50,140 Q52,152 58,152 Q63,138 62,120 Z'],
  ['forearms', 'M48,158 Q42,176 38,200 Q40,212 44,210 Q52,186 56,162 Z'],
  ['abs', 'M89,120 h9.5 v20 h-9.5 Z M89,143 h9.5 v20 h-9.5 Z M89,166 h9.5 v22 h-9.5 Z'],
  ['abs', 'M86,122 Q74,140 76,178 Q80,194 87,196 Z'],
  ['quads', 'M74,234 Q68,268 74,308 Q82,322 91,312 Q97,272 93,244 Q84,236 74,234 Z'],
  ['calves', 'M74,336 Q70,350 74,372 Q80,378 84,370 Q86,350 82,334 Z'],
];

const BACK = [
  ['traps', 'M100,56 L90,62 L70,76 Q86,84 100,112 Z'],
  ['shoulders', 'M68,80 Q54,82 50,96 Q50,108 56,112 Q64,102 70,90 Z'],
  ['upperback', 'M99,112 Q90,96 74,88 Q72,104 80,116 Q90,124 99,126 Z'],
  ['lats', 'M70,106 Q66,140 80,174 Q90,166 94,146 Q94,134 88,126 Q78,118 70,106 Z'],
  ['triceps', 'M56,112 Q50,124 50,140 Q52,152 58,152 Q64,138 62,118 Z'],
  ['forearms', 'M48,158 Q42,176 38,200 Q40,212 44,210 Q52,186 56,162 Z'],
  ['lowerback', 'M99,148 Q90,150 86,168 Q88,190 99,196 Z'],
  ['glutes', 'M99,204 Q82,198 72,216 Q70,240 86,248 Q97,246 99,236 Z'],
  ['hamstrings', 'M74,252 Q68,282 76,312 Q84,320 92,310 Q97,280 93,256 Q84,250 74,252 Z'],
  ['calves', 'M72,332 Q66,350 72,374 Q80,382 86,372 Q88,350 84,332 Z'],
];

function figure(shapes, load, cap, tx, label) {
  const parts = shapes.map(([m, d]) => {
    const t = Math.min((load[m] || 0) / cap, 1);
    const cls = t > 0 ? 'mu hot' : 'mu';
    const style = t > 0 ? ` style="--heat:${(0.25 + 0.75 * t).toFixed(2)}"` : '';
    const title = `<title>${MUSCLES[m]}: ${Math.round((load[m] || 0) * 10) / 10} Sätze</title>`;
    return `<path class="${cls}"${style} d="${d}">${title}</path>
      <path class="${cls}"${style} d="${d}" transform="translate(200,0) scale(-1,1)">${title}</path>`;
  }).join('');
  return `<g transform="translate(${tx},0)">
    <ellipse class="holo-base" cx="100" cy="402" rx="62" ry="9"/>
    <path class="holo-body" d="${BODY_PATH}"/>
    <g clip-path="url(#holoClip)">${parts}<rect class="holo-scan" x="0" y="-40" width="200" height="40"/></g>
    <path class="holo-edge" d="${BODY_PATH}"/>
    <text class="holo-label" x="100" y="426" text-anchor="middle">${label}</text>
  </g>`;
}

let holoMode = 'today';

function viewHologram() {
  const today = dayKey();
  const week = holoMode === 'week';
  const keys = week ? Array.from({ length: 7 }, (_, i) => addDays(today, -i)) : [today];
  const load = muscleLoad(keys);
  // Volle Röte: ~4 harte Sätze an einem Tag bzw. ~12 Sätze pro Woche
  const cap = week ? 12 : 4;
  const ranked = Object.entries(load).sort((a, b) => b[1] - a[1]).filter(([, v]) => v >= 0.5);

  return `<section class="card holo-card">
    <div class="spread">
      <h2 style="margin:0">🧬 Muskel-Scan</h2>
      <div class="seg">
        <button data-holo="today" class="${!week ? 'on' : ''}">Heute</button>
        <button data-holo="week" class="${week ? 'on' : ''}">7 Tage</button>
      </div>
    </div>
    <div class="holo-stage">
      <svg class="holo" viewBox="0 0 420 436" role="img" aria-label="Körper mit trainierten Muskelgruppen">
        <defs>
          <clipPath id="holoClip"><path d="${BODY_PATH}"/></clipPath>
          <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#48e5ff" stop-opacity="0"/>
            <stop offset="1" stop-color="#48e5ff" stop-opacity=".35"/>
          </linearGradient>
          <radialGradient id="baseGrad"><stop offset="0" stop-color="#48e5ff" stop-opacity=".55"/><stop offset="1" stop-color="#48e5ff" stop-opacity="0"/></radialGradient>
        </defs>
        ${figure(FRONT, load, cap, 0, 'VORNE')}
        ${figure(BACK, load, cap, 220, 'HINTEN')}
      </svg>
    </div>
    ${ranked.length
      ? `<div class="holo-legend">${ranked.map(([m, v]) => `<span><i style="--heat:${(0.25 + 0.75 * Math.min(v / cap, 1)).toFixed(2)}"></i>${MUSCLES[m]} <b>${Math.round(v * 10) / 10}</b></span>`).join('')}</div>
         <p class="muted small" style="margin:8px 0 0">Zahl = effektive Sätze (Hilfsmuskeln zählen anteilig).</p>`
      : `<p class="muted small" style="margin:8px 0 0;text-align:center">${week ? 'Diese Woche noch keine Sätze abgehakt.' : 'Heute noch nichts trainiert – hake unten deine Sätze ab und sieh zu, wie dein Körper rot wird 🔥'}</p>`}
  </section>`;
}

function bindHologram() {
  document.querySelectorAll('[data-holo]').forEach((b) => b.addEventListener('click', () => { holoMode = b.dataset.holo; render(); }));
}
