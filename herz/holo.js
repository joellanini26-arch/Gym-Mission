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
  [/hip ?thrust|glute|po-?brücke|donkey/i, { glutes: 1, hamstrings: 0.5 }],
  [/jumping|high knees|mountain|burpee|sprung/i, { quads: 0.7, glutes: 0.5, calves: 0.5, abs: 0.5, shoulders: 0.3 }],
  [/kniebeug|squat|hackenschmidt|split/i, { quads: 1, glutes: 1, hamstrings: 0.3, lowerback: 0.3 }],
  [/ausfall|lunge/i, { quads: 1, glutes: 1, hamstrings: 0.3 }],
  [/beinpresse|leg ?press/i, { quads: 1, glutes: 0.5 }],
  [/beinstreck|leg ?ext/i, { quads: 1 }],
  [/beinbeug|leg ?curl/i, { hamstrings: 1 }],
  [/wade|calf/i, { calves: 1 }],
  [/reverse|face ?pull|rear/i, { shoulders: 1, upperback: 0.5 }],
  [/bankdrücken eng|enges? bank|close ?grip/i, { triceps: 1, chest: 0.7, shoulders: 0.3 }],
  [/dips/i, { triceps: 1, chest: 0.5, shoulders: 0.3 }],
  [/trizeps|triceps|french|skull|pushdown/i, { triceps: 1 }],
  [/bankdrück|bench|brustpresse|fliegende|butterfly|flys?\b|liegestütz|push-?up|cable ?cross|kabelzug.*brust/i, { chest: 1, triceps: 0.5, shoulders: 0.5 }],
  [/seitheben|lateral/i, { shoulders: 1, traps: 0.3 }],
  [/schulter|military|overhead press|ohp|arnold/i, { shoulders: 1, triceps: 0.5, traps: 0.3 }],
  [/shrug|nacken/i, { traps: 1 }],
  [/hammer/i, { biceps: 1, forearms: 0.7 }],
  [/curl|bizeps|biceps/i, { biceps: 1, forearms: 0.5 }],
  [/klimm|pull-?up|chin|latzug|lat ?pull|pulldown|überzüge|pullover/i, { lats: 1, biceps: 0.5, upperback: 0.5, forearms: 0.3 }],
  [/rudern|row|t-bar/i, { upperback: 1, lats: 1, biceps: 0.5, shoulders: 0.3, lowerback: 0.3 }],
  [/superman|hyperext|rückenstreck|back ?ext/i, { lowerback: 1, glutes: 0.5 }],
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

// Weibliche Silhouette: schmalere Schultern, Taille, breitere Hüften
const OUTLINE_LEFT = [
  [100, 8], [89, 11], [83, 21], [83, 35], [87, 47], [93, 55], [93, 63], [82, 68], [70, 73], [60, 80], [56, 94],
  [53, 118], [50, 148], [46, 176], [42, 204], [38, 228], [36, 246], [40, 256], [47, 250], [51, 230], [56, 204],
  [61, 178], [64, 150], [66, 128], [69, 112], [70, 128], [69, 142], [74, 166], [75, 180], [70, 200], [65, 222], [64, 240],
  [65, 272], [68, 305], [71, 330], [70, 355], [72, 380], [71, 394], [82, 398], [90, 394],
  [90, 370], [92, 340], [93, 310], [96, 272], [100, 252],
]

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
  ['traps', 'M93,64 Q86,67 78,70 Q87,74 95,73 Z'],
  ['shoulders', 'M70,74 Q60,78 57,92 Q57,104 62,108 Q68,100 71,88 Z'],
  ['chest', 'M99,86 Q86,82 75,90 Q71,103 78,112 Q90,117 99,110 Z'],
  ['biceps', 'M60,112 Q55,124 55,140 Q57,150 62,150 Q66,136 65,118 Z'],
  ['forearms', 'M54,156 Q48,176 44,200 Q46,210 50,208 Q57,184 61,160 Z'],
  ['abs', 'M89,122 h9.5 v19 h-9.5 Z M89,144 h9.5 v19 h-9.5 Z M89,166 h9.5 v21 h-9.5 Z'],
  ['abs', 'M86,122 Q76,142 78,176 Q82,190 87,192 Z'],
  ['quads', 'M70,232 Q65,268 71,306 Q80,320 90,310 Q96,272 93,244 Q82,236 70,232 Z'],
  ['calves', 'M73,336 Q69,350 73,372 Q79,378 83,370 Q85,350 81,334 Z'],
];

const BACK = [
  ['traps', 'M100,56 L92,62 L74,72 Q88,82 100,108 Z'],
  ['shoulders', 'M70,74 Q60,78 57,92 Q57,104 62,108 Q68,98 72,86 Z'],
  ['upperback', 'M99,110 Q90,96 76,86 Q74,102 82,114 Q91,122 99,124 Z'],
  ['lats', 'M72,104 Q70,136 80,166 Q90,160 94,144 Q94,132 88,124 Q79,116 72,104 Z'],
  ['triceps', 'M60,112 Q55,124 55,140 Q57,150 62,150 Q66,136 65,118 Z'],
  ['forearms', 'M54,156 Q48,176 44,200 Q46,210 50,208 Q57,184 61,160 Z'],
  ['lowerback', 'M99,148 Q90,150 86,166 Q88,186 99,192 Z'],
  ['glutes', 'M99,198 Q78,194 67,214 Q65,242 84,250 Q97,248 99,236 Z'],
  ['hamstrings', 'M71,254 Q66,284 74,312 Q83,320 91,310 Q96,282 93,258 Q82,252 71,254 Z'],
  ['calves', 'M71,332 Q65,350 71,374 Q79,382 85,372 Q87,350 83,332 Z'],
];

// Haare: vorne schulterlang, hinten mit Pferdeschwanz
const HAIR_FRONT = 'M100,4 C83,4 77,15 78,31 C78,45 75,58 71,69 Q79,68 84,59 L85,32 C86,20 92,13 100,13 C108,13 114,20 115,32 L116,59 Q121,68 129,69 C125,58 122,45 122,31 C123,15 117,4 100,4 Z';
const HAIR_BACK = 'M100,4 C82,4 78,17 79,31 C80,44 88,52 100,53 C112,52 120,44 121,31 C122,17 118,4 100,4 Z M96,48 Q90,72 96,96 Q100,101 104,96 Q110,72 104,48 Z';

function figure(shapes, load, cap, tx, label, hair) {
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
    <path class="holo-hair" d="${hair}"/>
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
            <stop offset="0" stop-color="#c084fc" stop-opacity="0"/>
            <stop offset="1" stop-color="#c084fc" stop-opacity=".35"/>
          </linearGradient>
          <radialGradient id="baseGrad"><stop offset="0" stop-color="#c084fc" stop-opacity=".55"/><stop offset="1" stop-color="#c084fc" stop-opacity="0"/></radialGradient>
        </defs>
        ${figure(FRONT, load, cap, 0, 'VORNE', HAIR_FRONT)}
        ${figure(BACK, load, cap, 220, 'HINTEN', HAIR_BACK)}
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
