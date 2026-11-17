'use strict';

/* =========================================================
   Gym Mission – Zunehm-Coach
   Alle Daten bleiben lokal im Browser (localStorage).
   ========================================================= */

const STORE_KEY = 'gym-mission.v1';

// ---------- Inhalte ----------

// 3× pro Woche Ganzkörper: jeder Muskel wird 3× wöchentlich trainiert.
// Ideal z. B. Mo / Mi / Fr (mindestens 1 Ruhetag dazwischen).
const WORKOUTS = {
  GA: {
    name: 'Ganzkörper A',
    exercises: [
      { n: 'Kniebeugen', s: 4, r: '6–8' },
      { n: 'Bankdrücken', s: 4, r: '6–8' },
      { n: 'Langhantelrudern', s: 3, r: '8–10' },
      { n: 'Schulterdrücken (KH)', s: 3, r: '8–10' },
      { n: 'SZ-Curls', s: 2, r: '10–12' },
      { n: 'Wadenheben stehend', s: 3, r: '12–15' },
    ],
  },
  GB: {
    name: 'Ganzkörper B',
    exercises: [
      { n: 'Kreuzheben', s: 3, r: '5' },
      { n: 'Schrägbankdrücken (KH)', s: 4, r: '8–10' },
      { n: 'Klimmzüge / Latzug', s: 4, r: '6–10' },
      { n: 'Ausfallschritte', s: 3, r: '10 je Bein' },
      { n: 'Seitheben', s: 3, r: '12–15' },
      { n: 'Dips / Trizepsdrücken', s: 2, r: '10–12' },
    ],
  },
  GC: {
    name: 'Ganzkörper C',
    exercises: [
      { n: 'Beinpresse', s: 4, r: '8–12' },
      { n: 'Schulterdrücken (Langhantel)', s: 4, r: '6–8' },
      { n: 'Kabelrudern eng', s: 3, r: '8–10' },
      { n: 'Rumänisches Kreuzheben', s: 3, r: '8–10' },
      { n: 'Bankdrücken eng', s: 3, r: '8–10' },
      { n: 'Hammer Curls', s: 2, r: '10–12' },
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
  if (after > before) toast(`🎉 Level ${after}: ${TITLES[Math.min(after - 1, TITLES.length - 1)]}!`);
  else if (msg && n > 0) toast(`${msg} +${n} XP`);
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
  const s = streak();
  $('#streakBadge').textContent = `🔥 ${s}`;
  $('#streakBadge').style.display = state.profile ? '' : 'none';
}

function render() {
  renderHeader();
  $('#tabs').style.display = state.profile ? '' : 'none';
  document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  const v = $('#view');
  if (!state.profile) { v.innerHTML = viewSetup(true); bindSetup(true); return; }
  if (tab === 'today') { v.innerHTML = viewToday(); bindToday(); }
  if (tab === 'training') { v.innerHTML = viewTraining(); bindTraining(); }
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
  const rate = weeklyRate();
  const left = p.goalWeight - cw;
  let eta = 'Trage 1–2 Wochen täglich dein Gewicht ein, dann berechne ich dein Zieldatum.';
  if (rate != null && rate > 0.02 && left > 0) {
    const weeks = left / rate;
    const date = new Date(Date.now() + weeks * 7 * 864e5);
    eta = `Bei deinem Tempo (+${fmtKg(rate)} kg/Woche) erreichst du ${fmtKg(p.goalWeight)} kg ca. am <b>${date.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}</b>.`;
  } else if (rate != null && left > 0) {
    eta = 'Dein Gewicht steigt gerade nicht. Schau beim Coach unten rein 👇';
  } else if (left <= 0) {
    eta = '🏆 ZIEL ERREICHT! Du hast es geschafft!';
  }

  const kcalPct = d.kcal ? clamp(d.kcal / p.kcalTarget, 0, 1) : 0;
  const protPct = d.protein ? clamp(d.protein / p.proteinTarget, 0, 1) : 0;
  const todayWeight = state.weights.find((e) => e.date === k);
  const wk = ROTATION[state.nextWorkout % ROTATION.length];
  const quote = QUOTES[hashDay(k) % QUOTES.length];
  const tip = TIPS[(hashDay(k) * 7) % TIPS.length];
  const done = MISSIONS.filter((m) => missionDone(d, m.id)).length;

  return `
  <section class="card">
    <div class="hero">
      ${progressRing(pct, 'zum Ziel')}
      <div>
        <div class="big">${fmtKg(cw)} kg</div>
        <div class="muted">Start ${fmtKg(p.startWeight)} · Ziel ${fmtKg(p.goalWeight)} kg</div>
        <div class="muted">${left > 0 ? `Noch <b style="color:var(--text)">${fmtKg(left)} kg</b>` : ''}</div>
      </div>
    </div>
    <p class="small muted" style="margin:12px 0 0">${eta}</p>
    <div class="quote">„${esc(quote)}"</div>
  </section>

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
    <div class="row" style="margin-top:12px">
      <input id="kIn" inputmode="numeric" placeholder="kcal" value="${d.kcal ?? ''}">
      <input id="pIn" inputmode="numeric" placeholder="Protein g" value="${d.protein ?? ''}">
      <button class="btn small" id="nSave" style="flex:none">OK</button>
    </div>
  </section>

  <section class="card">
    <div class="spread"><h2>✅ Tagesmissionen</h2><span class="muted small">${done}/${MISSIONS.length}</span></div>
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

  $('#nSave').addEventListener('click', () => {
    setNutrition(k, num($('#kIn').value), num($('#pIn').value));
    render();
  });

  document.querySelectorAll('.check[data-m]').forEach((el) => {
    el.addEventListener('click', () => {
      const m = MISSIONS.find((x) => x.id === el.dataset.m);
      if (m.auto) return toast('Wird automatisch aus deinen kcal/Protein abgehakt');
      const on = !d.checks[m.id];
      d.checks[m.id] = on;
      addXp(on ? m.xp : -m.xp, '✓');
      checkPerfectDay(k);
      save(); render();
    });
  });

  $('#goTrain').addEventListener('click', () => { tab = 'training'; render(); });
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
    setTimeout(() => toast(`🏅 Neuer Meilenstein: ${ms} kg erreicht!`), 2300);
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
  if (perfect && !d.perfect) { d.perfect = true; addXp(50); toast('⭐ Perfekter Tag! +50 XP Bonus'); }
  if (!perfect && d.perfect) { d.perfect = false; addXp(-50); }
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
        <div class="kg"><input data-kg="${esc(e.n)}" inputmode="decimal" placeholder="kg" value="${last ?? ''}"><span class="muted small">${last != null ? 'zuletzt ' + fmtKg(last) + ' kg' : 'Arbeitsgewicht'}</span></div>
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
      <li>3× pro Woche Ganzkörper, z. B. Mo / Mi / Fr – immer mind. 1 Ruhetag dazwischen. Max. 60–75 Minuten.</li>
      <li>3 Tage reichen völlig: Jeder Muskel wird 3× pro Woche gereizt. Mehr Training würde nur deine Überschuss-Kalorien verbrennen.</li>
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
    const arr = d.workout.sets[i] || (d.workout.sets[i] = []);
    arr[j] = !arr[j];
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
    if (trainingView === ROTATION[state.nextWorkout % ROTATION.length]) state.nextWorkout++;
    else state.nextWorkout = ROTATION.indexOf(trainingView) + 1;
    addXp(50, '🏋️ Training abgeschlossen!');
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
  $('#hSave').addEventListener('click', () => {
    const k = $('#hDate').value;
    const v = num($('#hKg').value);
    if (!k || v == null || v < 30 || v > 200) return toast('Datum und Gewicht prüfen');
    logWeight(k, v);
    render();
  });
  document.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => {
    if (!confirm('Eintrag löschen?')) return;
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
  const base = location.origin + location.pathname;
  return `
  <section class="card">
    <h2>🔗 YAZIO-Verbindung</h2>
    <p class="small" style="margin-top:0">YAZIO bietet leider <b>keine offizielle Schnittstelle</b> für eigene Apps. Es gibt aber einen sauberen Weg:
    YAZIO schreibt deine Kalorien in <b>Apple Health</b>, und ein iPhone-Kurzbefehl schickt sie von dort mit einem Tipp hierher.</p>

    <h3>iPhone – einmalig einrichten (5 Min.)</h3>
    <ol class="steps small">
      <li>YAZIO → Profil → Einstellungen → <i>Apple Health</i> → Ernährungsdaten schreiben aktivieren.</li>
      <li>App <b>Kurzbefehle</b> → neuer Kurzbefehl „Gym Mission Sync“.</li>
      <li>Aktion <b>Health-Messungen suchen</b>: Typ <i>Nahrungsenergie</i>, Startdatum <i>ist heute</i>.</li>
      <li>Aktion <b>Statistik berechnen</b> → <i>Summe</i> (Ergebnis = kcal).</li>
      <li>Dasselbe nochmal für <i>Protein</i> (Health-Messungen suchen → Summe).</li>
      <li>Aktion <b>URL</b>: <span class="code">${esc(base)}?kcal=[Summe 1]&protein=[Summe 2]</span> (die Variablen per Tipp einfügen).</li>
      <li>Aktion <b>URLs öffnen</b>. Fertig!</li>
    </ol>
    <p class="small muted">Profi-Tipp: Unter <i>Automation</i> → „Tageszeit 21:00“ läuft der Kurzbefehl jeden Abend automatisch. Du kannst ihn auch als Widget auf den Homescreen legen.</p>

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
    <button class="btn ghost small" id="reset" style="margin-top:10px;width:100%;color:var(--bad)">Alles zurücksetzen</button>
  </section>`;
}

function bindData() {
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
  $('#reset').addEventListener('click', () => {
    if (!confirm('Wirklich ALLE Daten löschen?')) return;
    state = defaultState();
    save(); tab = 'today'; render();
  });
}

// ---------- Import per Link (YAZIO → Apple Health → Kurzbefehl) ----------

function handleImportParams() {
  const q = new URLSearchParams(location.search);
  if (!q.has('kcal') && !q.has('protein') && !q.has('weight')) return;
  const kcal = num(q.get('kcal'));
  const protein = num(q.get('protein'));
  const weight = num(q.get('weight'));
  history.replaceState(null, '', location.pathname);
  if (!state.profile) return toast('Bitte zuerst das Setup abschließen');
  const k = dayKey();
  if (kcal != null || protein != null) setNutrition(k, kcal, protein);
  if (weight != null && weight > 30 && weight < 200) logWeight(k, weight);
  setTimeout(() => toast(`📥 Synchronisiert: ${kcal != null ? Math.round(kcal) + ' kcal' : ''}${protein != null ? ' · ' + Math.round(protein) + ' g Protein' : ''}`), 300);
}

// ---------- Start ----------

handleImportParams();
render();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
