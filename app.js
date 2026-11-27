'use strict';

/* =========================================================
   Gym Mission – Zunehm-Coach
   Alle Daten bleiben lokal im Browser (localStorage).
   ========================================================= */

const STORE_KEY = 'gym-mission.v1';
const PUBLIC_URL = 'https://joellanini26-arch.github.io/Gym-Mission/';

// ---------- Inhalte ----------

// 3er-Split: A = Brust/Trizeps, B = Rücken/Bizeps, C = Beine/Schultern (je 1× pro Woche).
// Ideal z. B. Mo / Mi / Fr (mindestens 1 Ruhetag dazwischen).
const WORKOUTS = {
  GA: {
    name: 'Plan A (Brust/Trizeps)',
    exercises: [
      { n: 'Brustpresse vertikal (Maschine)', s: 3, r: '12', kg: 40 },
      { n: 'Rear Delt (Maschine)', s: 3, r: '12', kg: 30 },
      { n: 'Butterfly', s: 3, r: '12', kg: 30 },
      { n: 'Trizepsdrücken am Kabel (Pushdown)', s: 3, r: '12', kg: 40 },
      { n: 'Trizepsdrücken Überkopf (Kurzhantel, beidarmig)', s: 3, r: '12', kg: 15 },
    ],
  },
  GB: {
    name: 'Plan B (Rücken/Bizeps)',
    exercises: [
      { n: 'Klimmzüge (Körpergewicht)', s: 3, r: '10' },
      { n: 'Pullover (Maschine/Kabel)', s: 3, r: '12', kg: 38 },
      { n: 'Mid Row (Rudern mittig)', s: 3, r: '12', kg: 43 },
      { n: 'Curls Kurzhantel', s: 3, r: '10', kg: 10 },
      { n: 'Bizeps-Curl Maschine', s: 3, r: '10', kg: 25 },
    ],
  },
  GC: {
    name: 'Plan C (Beine/Schultern)',
    exercises: [
      { n: 'Beinpresse', s: 3, r: '12' },
      { n: 'Beinbeuger sitzend', s: 3, r: '12' },
      { n: 'Schulterdrücken Maschine', s: 3, r: '10' },
      { n: 'Seitheben Kurzhantel', s: 3, r: '12–15' },
      { n: 'Wadenheben (Maschine)', s: 3, r: '15' },
      { n: 'Rumpfbeugen (Bauch)', s: 2, r: '20' },
    ],
  },
};
const ROTATION = ['GA', 'GB', 'GC'];
const workoutName = (id) => (WORKOUTS[id] ? WORKOUTS[id].name : 'Training');

// Tägliche Missionen. "auto" = wird aus den eingetragenen Werten berechnet.
const MISSIONS = [
  { id: 'kcal', label: 'Kalorienziel erreicht', xp: 30, auto: true },
  { id: 'protein', label: 'Proteinziel erreicht', xp: 15, auto: true },
  { id: 'breakfast', label: 'Frühstück innerhalb 1 h nach dem Aufstehen', xp: 10 },
  { id: 'meals', label: '3 Hauptmahlzeiten gegessen', xp: 15 },
  { id: 'snacks', label: '2 Snacks (Nüsse, Brot, Joghurt …)', xp: 10 },
  { id: 'shake', label: 'Massephase-Shake getrunken (~800 kcal)', xp: 15 },
  { id: 'sleep', label: 'Mindestens 8 h geschlafen', xp: 10 },
  { id: 'water', label: '3 Liter Wasser', xp: 5 },
];

const QUOTES = [
  'Du kannst nicht im Gym wachsen, was du in der Küche nicht isst.',
  'Hardgainer werden nicht geboren – sie essen einfach zu wenig.',
  'Jeder Bissen ist eine Wiederholung. Mach deine Sätze voll.',
  'Konstanz schlägt Perfektion. Heute zählt.',
  '10 kg sind 40 Wochen à 250 g. Du schaffst 250 g.',
  'Hunger ist kein Signal. Dein Plan ist das Signal.',
  'Die Waage lügt nicht – aber sie braucht Zeit. Bleib dran.',
  'Trink deine Kalorien, wenn du sie nicht essen kannst.',
  'Der Muskel wird im Training gereizt und am Esstisch gebaut.',
  'Du hast 2 Jahre trainiert. Jetzt bekommst du endlich die Belohnung.',
];

const TIPS = [
  'Shake-Rezept (~850 kcal): 500 ml Vollmilch, 80 g Haferflocken, 1 Banane, 2 EL Erdnussbutter, 1 Scoop Whey. Trinken statt kauen!',
  'Olivenöl über Nudeln, Reis und Salat: 1 EL = 120 kcal ohne mehr Volumen.',
  'Nimm größere Teller und iss die kalorienreichste Komponente zuerst.',
  'Snacks griffbereit: Nüsse, Studentenfutter, Datteln, Müsliriegel – überall hinlegen.',
  'Iss nach einem festen Zeitplan (Wecker!), nicht nach Hunger.',
  'Trink zum Essen nicht zu viel Wasser – das füllt den Magen.',
  'Kardio minimal halten. Spaziergänge ok, aber keine langen Läufe.',
  'Wiege dich jeden Morgen nach dem Klo, vor dem Frühstück. Nur der Wochenschnitt zählt.',
  'Vor dem Schlafen: Quark mit Honig & Nüssen – 400 kcal und langsames Protein.',
  'Flüssige Kalorien: Saft, Milch, Kakao zwischendurch sind leichter als feste Mahlzeiten.',
];

// ---------- Hilfsfunktionen ----------

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dayKey = (d = new Date()) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};
const parseKey = (k) => new Date(k + 'T12:00:00');
const addDays = (k, n) => { const d = parseKey(k); d.setDate(d.getDate() + n); return dayKey(d); };
const fmtDate = (k) => parseKey(k).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
const fmtKg = (n) => (Math.round(n * 10) / 10).toLocaleString('de-DE', { minimumFractionDigits: 1 });
const num = (v) => { const n = parseFloat(String(v).replace(',', '.')); return Number.isFinite(n) ? n : null; };
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const hashDay = (k) => [...k].reduce((a, c) => a + c.charCodeAt(0), 0);

// Zwei-Tipp-Bestätigung (statt confirm(), das nicht überall funktioniert)
function armed(btn, label) {
  if (btn.dataset.armed) return true;
  btn.dataset.armed = '1';
  const old = btn.textContent;
  btn.textContent = label;
  setTimeout(() => { if (btn.isConnected) { delete btn.dataset.armed; btn.textContent = old; } }, 3000);
  return false;
}

// ---------- Speicher ----------

function defaultState() {
  return {
    profile: null, // wird beim Setup gesetzt
    weights: [], // {date, kg}
    days: {}, // date -> {kcal, protein, checks:{}, workout}
    lifts: {}, // Übung -> zuletzt benutztes Gewicht
    nextWorkout: 0,
    xp: 0,
    lastCoachWeek: null,
  };
}

let state = load();

// Einmalige Umstellung: Kniebeugen aus Plan C entfernt → gespeicherte Sätze nachrücken
if (!state.migPlanC1) {
  for (const d of Object.values(state.days)) {
    if (!d.workout || d.workout.id !== 'GC' || !d.workout.sets) continue;
    const old = d.workout.sets, moved = {};
    for (const [i, s] of Object.entries(old)) if (+i > 0) moved[+i - 1] = s;
    d.workout.sets = moved;
  }
  state.migPlanC1 = true;
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* egal */ }
}

// Startgewichte aus dem Plan übernehmen, falls noch nichts eingetragen ist
for (const w of Object.values(WORKOUTS)) {
  for (const e of w.exercises) if (e.kg != null && state.lifts[e.n] == null) state.lifts[e.n] = e.kg;
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return Object.assign(defaultState(), JSON.parse(raw));
  } catch (e) { /* leer starten */ }
  return defaultState();
}

function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { toast('Speichern fehlgeschlagen'); }
}

function day(k = dayKey()) {
  if (!state.days[k]) state.days[k] = { kcal: null, protein: null, checks: {}, workout: null };
  return state.days[k];
}

// ---------- Berechnungen ----------

function calcTargets(p, kg) {
  // Mifflin-St Jeor + Aktivitätsfaktor + Überschuss für Masseaufbau
  const bmr = 10 * kg + 6.25 * p.height - 5 * p.age + (p.sex === 'f' ? -161 : 5);
  const tdee = bmr * p.activity;
  return {
    kcal: Math.round((tdee + p.surplus) / 50) * 50,
    protein: Math.round(kg * 2),
  };
}

function currentWeight() {
  if (!state.weights.length) return state.profile ? state.profile.startWeight : 60;
  return avgWeight(dayKey(), 7) ?? state.weights[state.weights.length - 1].kg;
}

// Durchschnitt der Gewichtseinträge in den `span` Tagen bis einschließlich `end`
function avgWeight(end, span) {
  const start = addDays(end, -(span - 1));
  const w = state.weights.filter((e) => e.date >= start && e.date <= end);
  if (!w.length) return null;
  return w.reduce((a, e) => a + e.kg, 0) / w.length;
}

// Wöchentliche Zunahme per linearer Regression über die letzten 21 Tage
function weeklyRate() {
  const since = addDays(dayKey(), -20);
  const pts = state.weights.filter((e) => e.date >= since);
  if (pts.length < 4) return null;
  const t0 = parseKey(pts[0].date).getTime();
  const xs = pts.map((e) => (parseKey(e.date).getTime() - t0) / 864e5);
  const ys = pts.map((e) => e.kg);
  const mx = xs.reduce((a, b) => a + b) / xs.length;
  const my = ys.reduce((a, b) => a + b) / ys.length;
  let num_ = 0, den = 0;
  xs.forEach((x, i) => { num_ += (x - mx) * (ys[i] - my); den += (x - mx) ** 2; });
  if (den === 0 || xs[xs.length - 1] < 7) return null;
  return (num_ / den) * 7;
}

function missionDone(d, id) {
  const p = state.profile;
  if (id === 'kcal') return d.kcal != null && d.kcal >= p.kcalTarget;
  if (id === 'protein') return d.protein != null && d.protein >= p.proteinTarget;
  return !!d.checks[id];
}

function dayScore(k) {
  const d = state.days[k];
  if (!d) return 0;
  return MISSIONS.filter((m) => missionDone(d, m.id)).length / MISSIONS.length;
}

function streak() {
  let k = dayKey();
  let n = 0;
  // Heute zählt mit, falls schon erreicht – sonst ab gestern zählen
  if (!state.days[k] || !missionDone(state.days[k], 'kcal')) k = addDays(k, -1);
  while (state.days[k] && missionDone(state.days[k], 'kcal')) { n++; k = addDays(k, -1); }
  return n;
}

function level() {
  // Level-Kurve: jedes Level braucht 100 XP mehr als das vorherige
  let lvl = 1, need = 200, xp = state.xp;
  while (xp >= need) { xp -= need; lvl++; need += 100; }
  return { lvl, xp, need };
}

const TITLES = ['Strichmännchen', 'Starter', 'Esser', 'Vielfraß', 'Masse-Lehrling', 'Masse-Monster', 'Hardgainer-Bezwinger', 'Legende'];

function addXp(n, msg) {
  const before = level().lvl;
  state.xp = Math.max(0, state.xp + n);
  const after = level().lvl;
  if (after > before) { toast(`🎉 Level ${after}: ${TITLES[Math.min(after - 1, TITLES.length - 1)]}!`); bigCelebration(); }
  else if (msg && n > 0) toast(`${msg === '✓' ? praise() : msg} +${n} XP`);
}

// ---------- UI-Grundgerüst ----------

let tab = 'today';
let trainingView = null;

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2200);
}

function renderHeader() {
  const l = level();
  const title = TITLES[Math.min(l.lvl - 1, TITLES.length - 1)];
  $('#levelLine').textContent = state.profile ? `Level ${l.lvl} · ${title} · ${l.xp}/${l.need} XP` : 'Dein Zunehm-Coach';
  $('#xpFill').style.width = state.profile ? `${(l.xp / l.need) * 100}%` : '0';
  const s = streak();
  $('#streakBadge').innerHTML = `<span class="flame">🔥</span> ${s}`;
  $('#streakBadge').style.display = state.profile ? '' : 'none';
}

let lastTab = null;

function render() {
  if (state.profile) seedLiftLog();
  renderHeader();
  const v0 = $('#view');
  const entering = (state.profile ? tab : 'setup') !== lastTab;
  lastTab = state.profile ? tab : 'setup';
  v0.classList.remove('enter');
  if (entering) { void v0.offsetWidth; v0.classList.add('enter'); }
  renderView();
  if (entering) animateCounts(v0);
  if (popSel) { v0.querySelector(popSel)?.classList.add('pop'); popSel = null; }
}

let popSel = null; // Element, das nach dem Rendern kurz „aufploppt“

function renderView() {
  $('#tabs').style.display = state.profile ? '' : 'none';
  document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  const v = $('#view');
  if (!state.profile) { v.innerHTML = viewSetup(true); bindSetup(true); return; }
  if (tab === 'today') { v.innerHTML = viewToday(); bindToday(); }
  if (tab === 'training') { v.innerHTML = viewTraining(); bindTraining(); }
  if (tab === 'food') { v.innerHTML = viewFood(); bindFood(); }
  if (tab === 'progress') { v.innerHTML = viewProgress(); bindProgress(); }
  if (tab === 'settings') { v.innerHTML = viewSetup(false) + viewYazio() + viewData(); bindSetup(false); bindData(); }
}

document.getElementById('tabs').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  tab = b.dataset.tab;
  window.scrollTo(0, 0);
  render();
});

// ---------- Ansicht: Heute ----------

function progressRing(pct, label) {
  const r = 50, c = 2 * Math.PI * r;
  return `<svg class="ring" viewBox="0 0 120 120" role="img" aria-label="${Math.round(pct * 100)} % zum Ziel">
    <circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--card2)" stroke-width="12"/>
    <circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--accent)" stroke-width="12" stroke-linecap="round"
      stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}" transform="rotate(-90 60 60)"/>
    <text x="60" y="58" text-anchor="middle" font-size="22">${Math.round(pct * 100)}%</text>
    <text x="60" y="78" text-anchor="middle" font-size="11" style="fill:var(--muted);font-weight:500">${label}</text>
  </svg>`;
}

function viewToday() {
  const p = state.profile;
  const k = dayKey();
  const d = day(k);
  const cw = currentWeight();
  const pct = clamp((cw - p.startWeight) / (p.goalWeight - p.startWeight), 0, 1);
  const left = p.goalWeight - cw;

  const kcalPct = d.kcal ? clamp(d.kcal / p.kcalTarget, 0, 1) : 0;
  const protPct = d.protein ? clamp(d.protein / p.proteinTarget, 0, 1) : 0;
  const todayWeight = state.weights.find((e) => e.date === k);
  const wk = ROTATION[state.nextWorkout % ROTATION.length];
  const tip = TIPS[(hashDay(k) * 7) % TIPS.length];
  const done = MISSIONS.filter((m) => missionDone(d, m.id)).length;

  return `
  ${recapTeaser()}
  ${coachBanner()}
  <section class="card hero-card">
    <div class="hero-top">
      <div>
        <div class="eyebrow">Dein Weg zu ${fmtKg(p.goalWeight)} kg</div>
        <div class="big"><span data-count="${cw.toFixed(1)}" data-from="${p.startWeight}" data-dec="1">${fmtKg(cw)}</span><small> kg</small></div>
        <div class="muted small">${left > 0 ? `Noch <b style="color:var(--text)">${fmtKg(left)} kg</b> · Start ${fmtKg(p.startWeight)} kg` : 'Ziel erreicht!'}</div>
      </div>
      <div class="pct-chip"><span data-count="${Math.round(pct * 100)}">${Math.round(pct * 100)}</span>%</div>
    </div>
    ${(sceneArgs = [pct, p], mountainScene(pct, p))}
    <div class="quote" role="button" tabindex="0" title="Tippen für einen neuen Spruch"><span class="qtext">„${esc(currentQuote())}"</span><span class="qhint" aria-hidden="true">↻</span></div>
  </section>

  ${forecastCard(cw, left)}

  <section class="card">
    <h2>⚖️ Morgengewicht</h2>
    ${todayWeight
      ? `<div class="spread"><span>Heute eingetragen: <b>${fmtKg(todayWeight.kg)} kg</b></span><button class="btn ghost small" id="editWeight">Ändern</button></div>`
      : `<div class="row"><input id="wIn" inputmode="decimal" placeholder="z. B. 60,4"><button class="btn small" id="wSave" style="flex:none">Speichern</button></div>
         <p class="muted small" style="margin:6px 0 0">Nüchtern, nach dem Klo, vor dem Frühstück.</p>`}
  </section>

  <section class="card">
    <div class="spread"><h2>🍽️ Ernährung heute</h2><span class="muted small">aus YAZIO übertragen</span></div>
    <div class="spread small"><span>Kalorien</span><span><b>${d.kcal ?? 0}</b> / ${p.kcalTarget} kcal</span></div>
    <div class="bar ${kcalPct < 1 ? 'warn' : ''}"><i style="width:${kcalPct * 100}%"></i></div>
    <div class="spread small" style="margin-top:8px"><span>Protein</span><span><b>${d.protein ?? 0}</b> / ${p.proteinTarget} g</span></div>
    <div class="bar ${protPct < 1 ? 'warn' : ''}"><i style="width:${protPct * 100}%"></i></div>
    ${d.kcal != null && d.kcal < p.kcalTarget ? `<p class="small" style="color:var(--warn);margin:8px 0 0">Noch ${p.kcalTarget - d.kcal} kcal offen – ein Shake erledigt das fast komplett 🥤</p>` : ''}
    <button class="btn ghost small" id="goFood" style="margin-top:12px;width:100%">🤔 Was soll ich jetzt essen?</button>
    <div class="row" style="margin-top:12px">
      <input id="kIn" inputmode="numeric" placeholder="kcal" value="${d.kcal ?? ''}">
      <input id="pIn" inputmode="numeric" placeholder="Protein g" value="${d.protein ?? ''}">
      <button class="btn small" id="nSave" style="flex:none">OK</button>
    </div>
    <button class="btn small sync-btn" id="pasteSync">📋 YAZIO-Werte einfügen</button>
    <div id="pasteBox" hidden>
      <p class="muted small" style="margin:8px 0 4px">Halte das Feld gedrückt und tippe auf „Einfügen“:</p>
      <input id="pasteIn" placeholder="hier einfügen" autocomplete="off">
    </div>
  </section>

  ${stepsCard(d, cw)}

  <section class="card">
    <div class="spread"><h2>✅ Tagesmissionen</h2><span class="muted small">${done}/${MISSIONS.length}</span></div>
    <div class="bar thin"><i style="width:${(done / MISSIONS.length) * 100}%"></i></div>
    ${MISSIONS.map((m) => `
      <div class="check ${missionDone(d, m.id) ? 'done' : ''} ${m.auto ? 'auto' : ''}" data-m="${m.id}">
        <div class="box">${missionDone(d, m.id) ? '✓' : ''}</div>
        <div class="label">${esc(m.label)}${m.auto ? ' <span class="muted small">(automatisch)</span>' : ''}</div>
        <div class="xp">+${m.xp}</div>
      </div>`).join('')}
  </section>

  <section class="card">
    <div class="spread">
      <div><h2 style="margin:0">🏋️ Nächstes Training</h2><div class="muted">${WORKOUTS[wk].name}</div></div>
      <button class="btn small" id="goTrain">${d.workout && !d.workout.finished ? 'Weiter' : 'Los'}</button>
    </div>
    ${d.workout && d.workout.finished ? '<p class="small" style="color:var(--accent);margin:8px 0 0">✓ Heute schon trainiert – jetzt essen & erholen!</p>' : ''}
  </section>

  ${coachCard()}

  <section class="card">
    <h2>💡 Tipp des Tages</h2>
    <p class="small" style="margin:0">${esc(tip)}</p>
  </section>`;
}

function bindToday() {
  bindStats($('#view'));
  bindQuote();
  const k = dayKey();
  const d = day(k);

  const saveW = () => {
    const v = num($('#wIn').value);
    if (v == null || v < 30 || v > 200) return toast('Bitte gültiges Gewicht eingeben');
    logWeight(k, v);
    render();
  };
  $('#wSave')?.addEventListener('click', saveW);
  $('#wIn')?.addEventListener('keydown', (e) => e.key === 'Enter' && saveW());
  $('#editWeight')?.addEventListener('click', () => {
    state.weights = state.weights.filter((e) => e.date !== k);
    save(); render();
  });

  $('#pasteSync').addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!applySyncText(text)) toast('Keine YAZIO-Werte gefunden – erst den Kurzbefehl ausführen');
    } catch {
      // Zwischenablage nicht lesbar: manuelles Einfügen anbieten
      $('#pasteBox').hidden = false;
      $('#pasteIn').focus();
    }
  });
  $('#sSaveSteps').addEventListener('click', () => {
    const v = num($('#stepsIn').value);
    if (v == null || v < 0 || v > 150000) return toast('Bitte gültige Schrittzahl eingeben');
    d.steps = Math.round(v);
    save(); render();
  });
  $('#pasteIn').addEventListener('input', (e) => {
    if (applySyncText(e.target.value)) e.target.value = '';
  });

  $('#nSave').addEventListener('click', () => {
    setNutrition(k, num($('#kIn').value), num($('#pIn').value));
    render();
  });

  document.querySelectorAll('.check[data-m]').forEach((el) => {
    el.addEventListener('click', () => {
      const m = MISSIONS.find((x) => x.id === el.dataset.m);
      if (m.auto) return toast('Wird automatisch aus deinen kcal/Protein abgehakt');
      const on = !d.checks[m.id];
      popSel = `.check[data-m="${m.id}"]`;
      d.checks[m.id] = on;
      addXp(on ? m.xp : -m.xp, '✓');
      if (on) confetti(26);
      checkPerfectDay(k);
      save(); render();
    });
  });

  $('#goTrain').addEventListener('click', () => { tab = 'training'; render(); });
  $('#goFood').addEventListener('click', () => { tab = 'food'; window.scrollTo(0, 0); render(); });
  $('#coachApply')?.addEventListener('click', applyCoach);
  $('#coachDismiss')?.addEventListener('click', () => { state.lastCoachWeek = weekId(); save(); render(); });
}

function logWeight(k, kg) {
  const isNew = !state.weights.some((e) => e.date === k);
  const prevMax = Math.max(state.profile.startWeight, ...state.weights.map((e) => e.kg));
  state.weights = state.weights.filter((e) => e.date !== k);
  state.weights.push({ date: k, kg });
  state.weights.sort((a, b) => a.date.localeCompare(b.date));
  if (isNew) addXp(10, 'Gewicht eingetragen');
  // Meilensteine: jedes volle Kilo über dem Start
  const ms = Math.floor(kg);
  if (kg > prevMax && ms > Math.floor(prevMax) && ms > state.profile.startWeight) {
    setTimeout(() => { toast(`🏅 Neuer Meilenstein: ${ms} kg erreicht!`); bigCelebration(); }, 600);
    addXp(100);
  }
  save();
}

function setNutrition(k, kcal, protein) {
  const d = day(k);
  const p = state.profile;
  const before = { kcal: missionDone(d, 'kcal'), protein: missionDone(d, 'protein') };
  if (kcal != null) d.kcal = Math.round(kcal);
  if (protein != null) d.protein = Math.round(protein);
  const after = { kcal: missionDone(d, 'kcal'), protein: missionDone(d, 'protein') };
  if (!before.kcal && after.kcal) addXp(30, `🔥 ${p.kcalTarget} kcal geschafft!`);
  if (before.kcal && !after.kcal) addXp(-30);
  if (!before.protein && after.protein) addXp(15, '💪 Protein voll');
  if (before.protein && !after.protein) addXp(-15);
  checkPerfectDay(k);
  save();
}

function checkPerfectDay(k) {
  const d = day(k);
  const perfect = dayScore(k) === 1;
  if (perfect && !d.perfect) { d.perfect = true; addXp(50); toast('⭐ Perfekter Tag! +50 XP Bonus'); bigCelebration(); }
  if (!perfect && d.perfect) { d.perfect = false; addXp(-50); }
}

// ---------- Schritte ----------

const fmtSteps = (n) => Math.round(n).toLocaleString('de-DE');
// Grobe Schätzung: ~0,5 kcal pro kg Körpergewicht und 1000 Schritte
const stepsKcal = (steps, kg) => Math.round(steps * kg * 0.0005);

function stepsCard(d, cw) {
  const st = d.steps;
  const burn = st != null ? stepsKcal(st, cw) : 0;
  let note = '<p class="muted small" style="margin:8px 0 0">Kommen per Kurzbefehl aus Apple Health – oder hier eintragen.</p>';
  if (st != null) {
    if (st < 5000) note = '<p class="small" style="margin:8px 0 0">🙂 Wenig Bewegung – ein kurzer Spaziergang nach dem Essen hilft der Verdauung und macht Appetit.</p>';
    else if (st <= 12000) note = '<p class="small" style="margin:8px 0 0;color:var(--accent)">✅ Perfekter Bereich für Masseaufbau. Weiter so!</p>';
    else note = `<p class="small" style="margin:8px 0 0;color:var(--warn)">🔥 Viel gelaufen! Iss heute ca. <b>${stepsKcal(st - 10000, cw)} kcal extra</b>, sonst fehlen sie beim Aufbau.</p>`;
  }
  return `<section class="card">
    <div class="spread"><h2>👟 Schritte heute</h2><span class="muted small">${st != null ? `≈ ${burn} kcal verbrannt` : ''}</span></div>
    <div class="spread small"><span><b style="font-size:22px;font-family:var(--font-display)">${st != null ? fmtSteps(st) : '–'}</b></span><span class="muted">Ideal 6.000–10.000</span></div>
    <div class="bar ${st != null && st > 12000 ? 'warn' : ''}"><i style="width:${st != null ? clamp(st / 12000, 0, 1) * 100 : 0}%"></i></div>
    ${note}
    <div class="row" style="margin-top:10px">
      <input id="stepsIn" inputmode="numeric" placeholder="Schritte" value="${st ?? ''}">
      <button class="btn small" id="sSaveSteps" style="flex:none">OK</button>
    </div>
  </section>`;
}

// ---------- Prognose: Wann erreiche ich mein Ziel? ----------

const KCAL_PER_KG = 7000; // grober Richtwert für 1 kg Zunahme (Muskeln + etwas Fett)

function maintenanceKcal(kg) {
  const p = state.profile;
  const bmr = 10 * kg + 6.25 * p.height - 5 * p.age + (p.sex === 'f' ? -161 : 5);
  return bmr * p.activity;
}

function forecast(cw, left) {
  const p = state.profile;
  const today = dayKey();
  const maint = maintenanceKcal(cw);

  // Essen: Durchschnitt der letzten 14 abgeschlossenen Tage mit Eintrag (heute ist noch nicht fertig)
  const kcalDays = [];
  for (let i = 1; i <= 14; i++) {
    const d = state.days[addDays(today, -i)];
    if (d && d.kcal > 0) kcalDays.push(d.kcal);
  }
  const avgKcal = kcalDays.length ? kcalDays.reduce((a, b) => a + b, 0) / kcalDays.length : null;
  const foodRate = avgKcal != null && kcalDays.length >= 3 ? ((avgKcal - maint) * 7) / KCAL_PER_KG : null;

  // Waage: echter Trend der letzten 3 Wochen
  const trend = weeklyRate();

  // Training: Einheiten pro Woche in den letzten 4 Wochen (bzw. seit Start)
  const since = Math.max(7, Math.min(28, Math.round((parseKey(today) - parseKey(p.startDate || today)) / 864e5) + 1));
  let sessions = 0;
  for (let i = 0; i < since; i++) {
    const d = state.days[addDays(today, -i)];
    if (d && d.workout && d.workout.finished) sessions++;
  }
  const perWeek = (sessions / since) * 7;

  // Plan-Szenario: jeden Tag Kalorienziel erreicht
  const planRate = ((p.kcalTarget - maint) * 7) / KCAL_PER_KG;

  let rate = null, source;
  if (trend != null && foodRate != null) { rate = 0.6 * trend + 0.4 * foodRate; source = 'Waage + Essen'; }
  else if (trend != null) { rate = trend; source = 'Waage'; }
  else if (foodRate != null) { rate = foodRate; source = 'Essen'; }

  const dateIn = (r) => (r != null && r > 0.02 && left > 0 ? new Date(Date.now() + (left / r) * 7 * 864e5) : null);
  return { rate, source, date: dateIn(rate), planRate, planDate: dateIn(planRate), avgKcal, kcalDays: kcalDays.length, maint, perWeek, trend, since };
}

const fmtLong = (d) => d.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });

function forecastCard(cw, left) {
  const p = state.profile;
  if (left <= 0) {
    return `<section class="card forecast done"><div class="eyebrow">Zieldatum</div><div class="fc-date">🏆 Ziel erreicht!</div><p class="small muted" style="margin:0">Du hast ${fmtKg(p.goalWeight)} kg geschafft. Zeit für ein neues Ziel im Setup.</p></section>`;
  }
  const f = forecast(cw, left);
  const days = f.date ? Math.round((f.date - Date.now()) / 864e5) : null;

  // Training bestimmt, wie viel der Zunahme Muskeln sind
  const quality = f.perWeek === 0 && f.since <= 7 ? ['new', 'Startklar', 'Trainiere 3× pro Woche, dann wird möglichst viel davon Muskulatur']
    : f.perWeek >= 2.5 ? ['top', 'Top', 'Viel davon wird Muskulatur 💪'] : f.perWeek >= 1.5 ? ['mid', 'Okay', 'Mehr Training = mehr Muskeln statt Fett'] : ['low', 'Schwach', 'Ohne Training wird die Zunahme vor allem Fett'];

  let main;
  if (f.date) {
    main = `<div class="fc-date">${fmtLong(f.date)}</div>
      <div class="muted small">in <b style="color:var(--text)"><span data-count="${days}">${days}</span> Tagen</b> · Tempo +${fmtKg(f.rate)} kg/Woche · berechnet aus ${f.source}</div>`;
  } else if (f.rate != null) {
    main = `<div class="fc-date warn">Kein Fortschritt</div>
      <div class="muted small">Mit deinem aktuellen Essen nimmst du nicht zu (${f.rate >= 0 ? '+' : ''}${fmtKg(f.rate)} kg/Woche). Iss mehr – siehe Szenario unten.</div>`;
  } else {
    main = `<div class="fc-date">${f.planDate ? fmtLong(f.planDate) : '–'}</div>
      <div class="muted small">Vorläufig: so lange dauert es, wenn du jeden Tag ${p.kcalTarget} kcal isst. Nach 3 Tagen mit kcal-Einträgen oder 1 Woche Wiegen berechne ich deine echte Prognose.</div>`;
  }

  // Vergleich: aktuelles Tempo vs. jeden Tag Ziel getroffen
  let compare = '';
  if (f.date && f.planDate) {
    const diffWeeks = Math.round((f.date - f.planDate) / (7 * 864e5));
    const maxT = Math.max(f.date - Date.now(), f.planDate - Date.now());
    const w = (d) => Math.max(8, ((d - Date.now()) / maxT) * 100);
    compare = `<div class="fc-compare">
      <div class="fc-row"><span>Dein aktuelles Tempo</span><b>${fmtLong(f.date)}</b></div>
      <div class="bar ${diffWeeks > 0 ? 'warn' : ''}"><i style="width:${w(f.date)}%"></i></div>
      <div class="fc-row"><span>Jeden Tag ${p.kcalTarget} kcal</span><b>${fmtLong(f.planDate)}</b></div>
      <div class="bar"><i style="width:${w(f.planDate)}%"></i></div>
      <p class="small" style="margin:8px 0 0">${diffWeeks > 1 ? `🚀 Wenn du dein Kalorienziel jeden Tag triffst, bist du <b>${diffWeeks} Wochen früher</b> am Ziel!` : diffWeeks < -1 ? `🔥 Du bist sogar <b>${-diffWeeks} Wochen schneller</b> als geplant!` : '✅ Du liegst genau im Plan.'}</p>
    </div>`;
  } else if (!f.date && f.rate != null && f.planDate) {
    compare = `<p class="small" style="margin:10px 0 0">🚀 Mit ${p.kcalTarget} kcal pro Tag wärst du am <b>${fmtLong(f.planDate)}</b> am Ziel.</p>`;
  }

  return `<section class="card forecast">
    <div class="spread"><div class="eyebrow">📅 Geschätztes Zieldatum · ${fmtKg(p.goalWeight)} kg</div></div>
    ${main}
    <div class="fc-chips">
      <div class="fc-chip"><span>Ø Essen (14 T.)</span><b>${f.avgKcal != null ? Math.round(f.avgKcal) + ' kcal' : '–'}</b></div>
      <div class="fc-chip"><span>Überschuss</span><b>${f.avgKcal != null ? (f.avgKcal - f.maint >= 0 ? '+' : '') + Math.round(f.avgKcal - f.maint) + ' kcal' : '–'}</b></div>
      <div class="fc-chip q-${quality[0]}"><span>Training</span><b>${quality[0] === 'new' ? 'Ziel 3×' : f.perWeek.toLocaleString('de-DE', { maximumFractionDigits: 1 }) + '×/Woche'}</b></div>
    </div>
    ${compare}
    <p class="small muted" style="margin:10px 0 0"><span class="qdot q-${quality[0]}"></span> Qualität der Zunahme: <b>${quality[1]}</b> – ${quality[2]}.</p>
  </section>`;
}

// ---------- Coach: passt das Kalorienziel automatisch an ----------

function weekId() {
  const d = new Date();
  const onejan = new Date(d.getFullYear(), 0, 1);
  return `${d.getFullYear()}-${Math.ceil(((d - onejan) / 864e5 + onejan.getDay() + 1) / 7)}`;
}

function coachAdvice() {
  const p = state.profile;
  const rate = weeklyRate();
  if (rate == null) return null;
  // Gesunder Bereich für Masseaufbau: ca. 0,25–0,5 kg pro Woche
  if (rate < 0.15) return { delta: rate < 0 ? 300 : 200, text: `Dein Gewicht steigt nur ${fmtKg(rate)} kg/Woche. Du brauchst mehr Energie. Ich empfehle +${rate < 0 ? 300 : 200} kcal → <b>${p.kcalTarget + (rate < 0 ? 300 : 200)} kcal</b> pro Tag.`, warn: true };
  if (rate > 0.6) return { delta: -150, text: `Du nimmst ${fmtKg(rate)} kg/Woche zu – etwas zu schnell, da kommt viel Fett mit. Vorschlag: −150 kcal → <b>${p.kcalTarget - 150} kcal</b>.`, warn: true };
  return { delta: 0, text: `Perfektes Tempo: +${fmtKg(rate)} kg/Woche. Genau so weitermachen! 💚` };
}

function coachCard() {
  const a = coachAdvice();
  if (!a) {
    return `<section class="card coach"><h2>🤖 Coach</h2><p class="small muted" style="margin:0">Sobald du ~10 Tage Gewicht eingetragen hast, prüfe ich jede Woche, ob dein Kalorienziel passt, und passe es an.</p></section>`;
  }
  const show = a.delta !== 0 && state.lastCoachWeek !== weekId();
  return `<section class="card coach ${a.warn ? 'warn' : ''}"><h2>🤖 Coach</h2><p class="small" style="margin:0">${a.text}</p>
    ${show ? `<div class="row" style="margin-top:12px"><button class="btn small" id="coachApply">Übernehmen</button><button class="btn ghost small" id="coachDismiss">Diese Woche nicht</button></div>` : ''}
  </section>`;
}

function applyCoach() {
  const a = coachAdvice();
  if (!a) return;
  state.profile.kcalTarget += a.delta;
  state.profile.kcalManual = true;
  state.lastCoachWeek = weekId();
  save();
  toast(`Neues Ziel: ${state.profile.kcalTarget} kcal`);
  render();
}

// ---------- Ansicht: Training ----------

function viewTraining() {
  const k = dayKey();
  const d = day(k);
  const active = d.workout && !d.workout.finished && WORKOUTS[d.workout.id] ? d.workout.id : null;
  const sel = trainingView || active || ROTATION[state.nextWorkout % ROTATION.length];
  trainingView = sel;
  const w = WORKOUTS[sel];
  const wo = d.workout && d.workout.id === sel ? d.workout : null;
  const finished = wo && wo.finished;
  const total = w.exercises.reduce((a, e) => a + e.s, 0);
  const doneSets = wo ? Object.values(wo.sets).reduce((a, s) => a + s.filter(Boolean).length, 0) : 0;

  const history = Object.entries(state.days)
    .filter(([, x]) => x.workout && x.workout.finished)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 8);

  return `
  ${viewHologram()}
  <div class="days">
    ${ROTATION.map((id) => `<button data-w="${id}" class="${id === sel ? 'active' : ''}">${WORKOUTS[id].name}${id === ROTATION[state.nextWorkout % ROTATION.length] ? ' ★' : ''}</button>`).join('')}
  </div>
  <section class="card">
    <div class="spread"><h2 style="margin:0">${w.name}</h2><span class="muted small">${doneSets}/${total} Sätze</span></div>
    <div class="bar"><i style="width:${(doneSets / total) * 100}%"></i></div>
    <p class="muted small">Tippe jeden Satz an, wenn du ihn gemacht hast. Trag dein Gewicht ein – nächstes Mal versuchst du +1 Wiederholung oder +2,5 kg.</p>
    ${w.exercises.map((e, i) => {
      const sets = wo ? (wo.sets[i] || []) : [];
      const last = state.lifts[e.n];
      return `<div class="ex">
        <div class="spread"><span class="name">${esc(e.n)}</span><span class="muted small">${e.s} × ${e.r}</span></div>
        <div class="sets">${Array.from({ length: e.s }, (_, j) => `<button class="set ${sets[j] ? 'done' : ''}" data-ex="${i}" data-set="${j}" ${finished ? 'disabled' : ''}>${j + 1}</button>`).join('')}</div>
        <div class="kg"><input data-kg="${esc(e.n)}" inputmode="decimal" placeholder="kg" value="${last ?? ''}"><span class="muted small">${last != null ? 'zuletzt ' + fmtKg(last) + ' kg' : (/Körpergewicht/.test(e.n) ? 'Zusatzgewicht (optional)' : 'Arbeitsgewicht')}</span></div>
      </div>`;
    }).join('')}
    <div style="margin-top:14px">
      ${finished
        ? '<p style="color:var(--accent);margin:0">✓ Training erledigt! Jetzt innerhalb von 2 h eine große Mahlzeit oder einen Shake.</p>'
        : `<button class="btn" id="finish" ${doneSets === 0 ? 'disabled' : ''}>Training abschließen (+50 XP)</button>`}
    </div>
  </section>

  <section class="card">
    <h2>📋 Letzte Trainings</h2>
    ${history.length ? history.map(([dk, x]) => `<div class="spread small" style="padding:6px 0;border-bottom:1px solid var(--line)"><span>${fmtDate(dk)}</span><span>${workoutName(x.workout.id)}</span></div>`).join('') : '<p class="muted small" style="margin:0">Noch keine Trainings abgeschlossen.</p>'}
  </section>

  <section class="card">
    <h2>📌 Regeln für Hardgainer</h2>
    <ul class="list small">
      <li>3× pro Woche: A (Brust/Trizeps), B (Rücken/Bizeps), C (Beine/Schultern), z. B. Mo / Mi / Fr – immer mind. 1 Ruhetag dazwischen. Max. 60–75 Minuten.</li>
      <li>3 Tage reichen völlig. Mehr Training würde nur deine Überschuss-Kalorien verbrennen.</li>
      <li>Gewicht wählen: so schwer, dass die letzten 2 Wiederholungen richtig hart sind, aber sauber bleiben. Schaffst du alle Sätze mit voller Wiederholungszahl → nächstes Mal +2,5 kg.</li>
      <li>Grundübungen zuerst und schwer. Progressive Überlastung ist der Schlüssel.</li>
      <li>2–3 Wiederholungen vor dem Muskelversagen aufhören, 2–3 Min. Pause bei Grundübungen.</li>
      <li>Kein langes Kardio. Ruhetage sind Wachstumstage.</li>
    </ul>
  </section>`;
}

function bindTraining() {
  const k = dayKey();
  bindHologram();
  document.querySelectorAll('.days button').forEach((b) => b.addEventListener('click', () => { trainingView = b.dataset.w; render(); }));

  document.querySelectorAll('.set').forEach((b) => b.addEventListener('click', () => {
    const d = day(k);
    if (!d.workout || d.workout.id !== trainingView) {
      if (d.workout && d.workout.finished) return toast('Heute schon ein Training abgeschlossen');
      d.workout = { id: trainingView, sets: {}, finished: false };
    }
    const i = +b.dataset.ex, j = +b.dataset.set;
    popSel = `.set[data-ex="${i}"][data-set="${j}"]`;
    const arr = d.workout.sets[i] || (d.workout.sets[i] = []);
    arr[j] = !arr[j];
    if (arr[j] && arr.filter(Boolean).length === WORKOUTS[trainingView].exercises[i].s) confetti(22);
    save(); render();
  }));

  document.querySelectorAll('[data-kg]').forEach((inp) => inp.addEventListener('change', () => {
    const v = num(inp.value);
    if (v == null) delete state.lifts[inp.dataset.kg];
    else state.lifts[inp.dataset.kg] = v;
    save();
  }));

  $('#finish')?.addEventListener('click', () => {
    const d = day(k);
    if (!d.workout) return;
    d.workout.finished = true;
    logLifts(d.workout, k);
    if (trainingView === ROTATION[state.nextWorkout % ROTATION.length]) state.nextWorkout++;
    else state.nextWorkout = ROTATION.indexOf(trainingView) + 1;
    addXp(50, '🏋️ Training abgeschlossen!');
    bigCelebration();
    save(); render();
  });
}

// ---------- Ansicht: Fortschritt ----------

function weightChart() {
  const w = state.weights.slice(-90);
  const p = state.profile;
  if (w.length < 2) return '<p class="muted small">Trag ein paar Tage dein Gewicht ein, dann erscheint hier dein Verlauf.</p>';
  const W = 360, H = 200, L = 28, R = 6, T = 10, B = 22;
  const t0 = parseKey(w[0].date).getTime();
  const t1 = parseKey(w[w.length - 1].date).getTime();
  const span = Math.max(t1 - t0, 864e5);
  const lo = Math.floor(Math.min(...w.map((e) => e.kg), p.startWeight) - 0.5);
  const hi = Math.ceil(Math.max(...w.map((e) => e.kg), Math.min(p.goalWeight, Math.max(...w.map((e) => e.kg)) + 2)) + 0.5);
  const x = (k) => L + ((parseKey(k).getTime() - t0) / span) * (W - L - R);
  const y = (kg) => T + (1 - (kg - lo) / (hi - lo)) * (H - T - B);
  const avg = w.map((e) => [x(e.date), y(avgWeight(e.date, 7))]);
  const step = hi - lo > 8 ? 2 : 1;
  let grid = '';
  for (let v = lo; v <= hi; v += step) grid += `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`;
  const goal = p.goalWeight <= hi ? `<line class="goal" x1="${L}" x2="${W - R}" y1="${y(p.goalWeight)}" y2="${y(p.goalWeight)}"/><text x="${W - R}" y="${y(p.goalWeight) - 5}" text-anchor="end" style="fill:var(--gold)">Ziel ${p.goalWeight}</text>` : '';
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gewichtsverlauf">
    <defs><linearGradient id="chartGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3ddc84"/><stop offset="1" stop-color="#48e5ff"/></linearGradient></defs>
    ${grid}${goal}
    ${w.map((e) => `<circle class="raw" cx="${x(e.date)}" cy="${y(e.kg)}" r="2.5"/>`).join('')}
    <polyline class="avg" points="${avg.map((a) => a.join(',')).join(' ')}"/>
    <text x="${L}" y="${H - 6}">${fmtDate(w[0].date)}</text>
    <text x="${W - R}" y="${H - 6}" text-anchor="end">${fmtDate(w[w.length - 1].date)}</text>
  </svg>
  <p class="muted small" style="margin:6px 0 0">Punkte = Tageswerte · grüne Linie = 7-Tage-Schnitt (der zählt!)</p>`;
}

function viewProgress() {
  const p = state.profile;
  const maxW = Math.max(p.startWeight, ...state.weights.map((e) => e.kg));
  const milestones = [];
  for (let m = Math.floor(p.startWeight) + 1; m <= Math.ceil(p.goalWeight); m++) milestones.push(m);

  // Heatmap der letzten 35 Tage, beginnend an einem Montag
  const today = dayKey();
  const dow = (parseKey(today).getDay() + 6) % 7;
  const start = addDays(today, -(28 + dow));
  const cells = [];
  for (let k = start; k <= today; k = addDays(k, 1)) {
    const s = dayScore(k);
    const lvl = s === 0 ? '' : s < 0.5 ? 'l1' : s < 1 ? 'l2' : 'l3';
    cells.push(`<div class="${lvl}" title="${fmtDate(k)}">${parseKey(k).getDate()}</div>`);
  }

  const last7 = Array.from({ length: 7 }, (_, i) => state.days[addDays(today, -i)]).filter((d) => d && d.kcal);
  const avgKcal = last7.length ? Math.round(last7.reduce((a, d) => a + d.kcal, 0) / last7.length) : null;
  const trainings7 = Array.from({ length: 7 }, (_, i) => state.days[addDays(today, -i)]).filter((d) => d && d.workout && d.workout.finished).length;
  const rate = weeklyRate();

  return `
  <section class="card">
    <h2>📈 Gewichtsverlauf</h2>
    ${weightChart()}
  </section>

  <section class="card">
    <h2>📊 Letzte 7 Tage</h2>
    <div class="row" style="text-align:center">
      <div><div class="big" style="font-size:22px;font-weight:800">${avgKcal ?? '–'}</div><div class="muted small">Ø kcal</div></div>
      <div><div style="font-size:22px;font-weight:800">${trainings7}</div><div class="muted small">Trainings</div></div>
      <div><div style="font-size:22px;font-weight:800">${rate != null ? (rate >= 0 ? '+' : '') + fmtKg(rate) : '–'}</div><div class="muted small">kg/Woche</div></div>
    </div>
  </section>

  ${statsSections()}

  <section class="card">
    <h2>🗓️ Missions-Kalender</h2>
    <div class="weekgrid" style="margin-bottom:6px">${['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((t) => `<div style="background:none">${t}</div>`).join('')}</div>
    <div class="weekgrid">${cells.join('')}</div>
    <p class="muted small" style="margin:8px 0 0">Je grüner, desto mehr Missionen erfüllt.</p>
  </section>

  <section class="card">
    <h2>🏅 Meilensteine</h2>
    <div class="badges">${milestones.map((m) => `<div class="badge ${maxW >= m ? 'got' : ''}"><b>${m}</b>kg</div>`).join('')}</div>
  </section>

  <section class="card">
    <h2>📝 Gewichtseinträge</h2>
    <div class="row" style="margin-bottom:10px">
      <input type="date" id="hDate" value="${today}" max="${today}">
      <input id="hKg" inputmode="decimal" placeholder="kg">
      <button class="btn small" id="hSave" style="flex:none">+</button>
    </div>
    <div class="loglist">
      ${state.weights.slice().reverse().map((e) => `<div class="spread"><span>${fmtDate(e.date)}</span><span>${fmtKg(e.kg)} kg <button class="x" data-del="${e.date}" aria-label="Löschen">×</button></span></div>`).join('') || '<p class="muted small">Noch keine Einträge.</p>'}
    </div>
  </section>`;
}

function bindProgress() {
  bindStats($('#view'));
  $('#hSave').addEventListener('click', () => {
    const k = $('#hDate').value;
    const v = num($('#hKg').value);
    if (!k || v == null || v < 30 || v > 200) return toast('Datum und Gewicht prüfen');
    logWeight(k, v);
    render();
  });
  document.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => {
    if (!armed(b, '?')) return;
    state.weights = state.weights.filter((e) => e.date !== b.dataset.del);
    save(); render();
  }));
}

// ---------- Ansicht: Setup / Profil ----------

function viewSetup(first) {
  const p = state.profile || { startWeight: 60, goalWeight: 70, height: 178, age: 22, sex: 'm', activity: 1.55, surplus: 400 };
  const t = state.profile ? { kcal: p.kcalTarget, protein: p.proteinTarget } : calcTargets(p, p.startWeight);
  return `
  ${first ? `<section class="card"><h2>👋 Willkommen bei Gym Mission</h2>
    <p class="small" style="margin:0">Dein Problem ist nicht das Training – es ist das Essen. Diese App macht aus jedem Tag eine Mission: genug Kalorien, genug Protein, Training abhaken. Ein paar Angaben, dann berechne ich dein Kalorienziel.</p></section>` : ''}
  <section class="card">
    <h2>${first ? 'Deine Daten' : '👤 Profil & Ziele'}</h2>
    <div class="row">
      <div><label class="f">${first ? 'Aktuelles Gewicht (kg)' : 'Startgewicht (kg)'}</label><input id="sW" inputmode="decimal" value="${p.startWeight}"></div>
      <div><label class="f">Zielgewicht (kg)</label><input id="sG" inputmode="decimal" value="${p.goalWeight}"></div>
    </div>
    <div class="row">
      <div><label class="f">Größe (cm)</label><input id="sH" inputmode="numeric" value="${p.height}"></div>
      <div><label class="f">Alter</label><input id="sA" inputmode="numeric" value="${p.age}"></div>
    </div>
    <div class="row">
      <div><label class="f">Geschlecht</label><select id="sS"><option value="m" ${p.sex === 'm' ? 'selected' : ''}>männlich</option><option value="f" ${p.sex === 'f' ? 'selected' : ''}>weiblich</option></select></div>
      <div><label class="f">Alltag</label><select id="sAct">
        <option value="1.45" ${p.activity == 1.45 ? 'selected' : ''}>Bürojob + 3× Gym</option>
        <option value="1.55" ${p.activity == 1.55 ? 'selected' : ''}>Normal aktiv + 3× Gym</option>
        <option value="1.7" ${p.activity == 1.7 ? 'selected' : ''}>Körperliche Arbeit + Gym</option>
      </select></div>
    </div>
    <label class="f">Überschuss pro Tag</label>
    <select id="sSur">
      <option value="300" ${p.surplus == 300 ? 'selected' : ''}>+300 kcal (langsam, sauber)</option>
      <option value="400" ${p.surplus == 400 ? 'selected' : ''}>+400 kcal (empfohlen)</option>
      <option value="500" ${p.surplus == 500 ? 'selected' : ''}>+500 kcal (Hardgainer, schneller)</option>
    </select>
    <div class="row" style="margin-top:4px">
      <div><label class="f">Kalorienziel</label><input id="sK" inputmode="numeric" value="${t.kcal}"></div>
      <div><label class="f">Proteinziel (g)</label><input id="sP" inputmode="numeric" value="${t.protein}"></div>
    </div>
    <p class="muted small">Wird aus deinen Daten berechnet. Du kannst es überschreiben – der Coach passt es später an deinen echten Verlauf an.</p>
    <button class="btn" id="sSave">${first ? 'Mission starten 🚀' : 'Speichern'}</button>
  </section>`;
}

function readSetup() {
  return {
    startWeight: num($('#sW').value),
    goalWeight: num($('#sG').value),
    height: num($('#sH').value),
    age: num($('#sA').value),
    sex: $('#sS').value,
    activity: num($('#sAct').value),
    surplus: num($('#sSur').value),
  };
}

function bindSetup(first) {
  let kcalTouched = false;
  const recalc = () => {
    if (kcalTouched) return;
    const f = readSetup();
    if ([f.startWeight, f.height, f.age].some((v) => v == null)) return;
    const t = calcTargets(f, first ? f.startWeight : currentWeight());
    $('#sK').value = t.kcal;
    $('#sP').value = t.protein;
  };
  ['#sW', '#sH', '#sA', '#sS', '#sAct', '#sSur'].forEach((s) => $(s).addEventListener('input', recalc));
  $('#sK').addEventListener('input', () => { kcalTouched = true; });

  $('#sSave').addEventListener('click', () => {
    const f = readSetup();
    const kcal = num($('#sK').value);
    const protein = num($('#sP').value);
    if ([f.startWeight, f.goalWeight, f.height, f.age, kcal, protein].some((v) => v == null)) return toast('Bitte alle Felder ausfüllen');
    if (f.goalWeight <= f.startWeight) return toast('Das Ziel sollte über dem Startgewicht liegen');
    state.profile = Object.assign({}, state.profile, f, {
      kcalTarget: Math.round(kcal),
      proteinTarget: Math.round(protein),
      startDate: state.profile?.startDate || dayKey(),
    });
    if (first && !state.weights.length) state.weights.push({ date: dayKey(), kg: f.startWeight });
    save();
    toast(first ? 'Mission gestartet! 💪' : 'Gespeichert');
    tab = 'today';
    render();
  });
}

function viewYazio() {
  const base = PUBLIC_URL;
  return `
  <section class="card">
    <h2>🔗 YAZIO-Verbindung</h2>
    <p class="small" style="margin-top:0">YAZIO bietet leider <b>keine offizielle Schnittstelle</b> für eigene Apps. Es gibt aber einen sauberen Weg:
    YAZIO schreibt deine Kalorien in <b>Apple Health</b>, und ein iPhone-Kurzbefehl schickt sie von dort mit einem Tipp hierher.</p>

    <h3>iPhone – einmalig einrichten (3 Min.)</h3>
    <ol class="steps small">
      <li>YAZIO → Profil → Einstellungen → <i>Apple Health</i> → Ernährungsdaten schreiben aktivieren.</li>
      <li>App <b>Kurzbefehle</b> → neuer Kurzbefehl „Gym Mission Sync“.</li>
      <li><b>Health-Messungen suchen</b>: Typ <i>Nahrungsenergie</i>, Startdatum <i>ist heute</i>, Einheit <i>kcal</i>.</li>
      <li><b>Statistik berechnen</b> → <i>Summe</i>.</li>
      <li>Für <b>Schritte</b>: nochmal <b>Health-Messungen suchen</b> (Typ <i>Schritte</i>, <i>ist heute</i>) + <b>Statistik berechnen → Summe</b>.</li>
      <li><b>Text</b>: <span class="code">kcal=[Summe 1]&steps=[Summe 2]</span> (Variablen per Tipp einfügen).</li>
      <li><b>In Zwischenablage kopieren</b>.</li>
    </ol>
    <p class="small">Danach: Kurzbefehl ausführen → diese App öffnen → unter <i>Heute → Ernährung</i> auf <b>„📋 YAZIO-Werte einfügen“</b> tippen. Fertig!</p>
    <p class="small muted">Warum nicht automatisch? Das iPhone trennt die Home-Bildschirm-App von Safari, und Kurzbefehle können sie nicht direkt öffnen. Die Zwischenablage ist die Brücke.<br>
    Profi-Tipp: Mit einer <i>Automation</i> (z. B. 21:00) liegen die Werte abends schon bereit – du musst nur noch einfügen.</p>

    <h3>Android</h3>
    <p class="small" style="margin-top:0">Eine Web-App kann Health Connect nicht direkt lesen. Am schnellsten: abends in YAZIO die Tagessumme ansehen und unter <i>Heute → Ernährung</i> kcal und Protein eintippen (10 Sekunden).
    Mit Apps wie <i>Tasker</i> + Health Connect lässt sich derselbe Link <span class="code">?kcal=…&protein=…</span> auch automatisch öffnen.</p>

    <h3>Test</h3>
    <a class="small" href="?kcal=2500&protein=110" style="color:var(--accent)">Beispiel-Link öffnen (setzt heute 2500 kcal / 110 g)</a>
  </section>`;
}

function viewData() {
  return `
  <section class="card">
    <h2>💾 Daten</h2>
    <p class="muted small" style="margin-top:0">Alles wird nur auf diesem Gerät gespeichert. Mach ab und zu ein Backup.</p>
    <div class="row">
      <button class="btn ghost small" id="exp">Backup exportieren</button>
      <button class="btn ghost small" id="imp">Backup laden</button>
    </div>
    <input type="file" id="impFile" accept="application/json" hidden>
    <h3>📲 Daten auf anderes Gerät / in andere App übertragen</h3>
    <p class="muted small" style="margin-top:0">Safari und die Home-Bildschirm-App haben getrennte Speicher. So überträgst du alles: hier „Kopieren“, dort „Einfügen“.</p>
    <div class="row">
      <button class="btn ghost small" id="copyData">Daten kopieren</button>
      <button class="btn ghost small" id="pasteData">Daten einfügen</button>
    </div>
    <div id="dataBox" hidden><p class="muted small" style="margin:8px 0 4px">Halte das Feld gedrückt → „Einfügen“:</p><input id="dataIn" autocomplete="off"></div>
    <button class="btn ghost small" id="reset" style="margin-top:10px;width:100%;color:var(--bad)">Alles zurücksetzen</button>
  </section>`;
}

function importDataText(text) {
  try {
    const data = JSON.parse(text);
    if (!data || typeof data !== 'object' || !('days' in data)) throw new Error();
    state = Object.assign(defaultState(), data);
    save(); toast('✅ Daten übertragen'); tab = 'today'; render();
    return true;
  } catch { toast('Das sind keine Gym-Mission-Daten'); return false; }
}

function bindData() {
  $('#copyData').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(JSON.stringify(state)); toast('📋 Kopiert – jetzt in der anderen App einfügen'); }
    catch { toast('Kopieren nicht möglich – nutze „Backup exportieren“'); }
  });
  $('#pasteData').addEventListener('click', async (e) => {
    if (!armed(e.currentTarget, 'Ersetzt alle Daten hier – nochmal tippen')) return;
    try { importDataText(await navigator.clipboard.readText()); }
    catch { $('#dataBox').hidden = false; $('#dataIn').focus(); }
  });
  $('#dataIn').addEventListener('input', (e) => importDataText(e.target.value));
  $('#exp').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `gym-mission-backup-${dayKey()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  $('#imp').addEventListener('click', () => $('#impFile').click());
  $('#impFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!data || typeof data !== 'object' || !('days' in data)) throw new Error();
      state = Object.assign(defaultState(), data);
      save(); toast('Backup geladen'); render();
    } catch { toast('Ungültige Backup-Datei'); }
  });
  $('#reset').addEventListener('click', (e) => {
    if (!armed(e.currentTarget, 'Nochmal tippen = wirklich ALLES löschen')) return;
    state = defaultState();
    save(); tab = 'today'; render();
  });
}

// ---------- Import per Link (YAZIO → Apple Health → Kurzbefehl) ----------

// Zahlen aus dem Kurzbefehl: „2345.6“, „2.345,6“, „2345,6 kcal“, „2 345“ …
function importNum(v) {
  if (v == null) return null;
  let s = String(v).replace(/[^0-9.,-]/g, '');
  if (!s) return null;
  if (s.includes(',') && s.includes('.')) {
    // Das hintere Zeichen ist das Dezimaltrennzeichen
    s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  } else if (s.includes(',')) {
    s = /,\d{3}$/.test(s) && s.split(',').length > 1 && !/^\d{1,3},\d{3}$/.test(s) ? s.replace(/,/g, '') : s.replace(',', '.');
  } else if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
    s = s.replace(/\./g, ''); // „2.345“ = Tausenderpunkt
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

function applySync(kcal, protein, weight, steps) {
  const k = dayKey();
  if (steps != null && steps >= 0 && steps < 150000) { day(k).steps = Math.round(steps); save(); }
  if (kcal != null || protein != null) setNutrition(k, kcal, protein);
  if (weight != null && weight > 30 && weight < 200) logWeight(k, weight);
  if (kcal != null || protein != null) confetti(30);
  const parts = [kcal != null && Math.round(kcal) + ' kcal', protein != null && Math.round(protein) + ' g Protein', steps != null && fmtSteps(steps) + ' Schritte'].filter(Boolean);
  setTimeout(() => toast(`📥 Synchronisiert: ${parts.join(' · ')}`), 300);
}

// Erkennt „…?kcal=2345&protein=120“, „kcal=2345“ oder nur „2345“
function applySyncText(text) {
  if (!text) return false;
  const t = String(text).trim();
  const get = (key) => { const m = t.match(new RegExp(key + '=([^&\\s]+)', 'i')); return m ? importNum(decodeURIComponent(m[1])) : null; };
  let kcal = get('kcal'), protein = get('protein'), weight = get('weight'), steps = get('steps') ?? get('schritte');
  if (kcal == null && protein == null && weight == null && steps == null && /^[\d.,\s]+(kcal)?$/i.test(t)) kcal = importNum(t);
  if (kcal != null && (kcal < 0 || kcal > 15000)) kcal = null;
  if (kcal == null && protein == null && weight == null && steps == null) return false;
  applySync(kcal, protein, weight, steps);
  render();
  return true;
}

function handleImportParams() {
  const q = new URLSearchParams(location.search);
  if (!q.has('kcal') && !q.has('protein') && !q.has('weight') && !q.has('steps')) return;
  const kcal = importNum(q.get('kcal'));
  const protein = importNum(q.get('protein'));
  const weight = importNum(q.get('weight'));
  const steps = importNum(q.get('steps'));
  history.replaceState(null, '', location.pathname);
  if (!state.profile) return toast('Leer? Nutze „📋 Einfügen“ in deiner Home-Bildschirm-App');
  applySync(kcal, protein, weight, steps);
}

// ---------- Start ----------

handleImportParams();
render();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
