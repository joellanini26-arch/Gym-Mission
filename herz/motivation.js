'use strict';

/* =========================================================
   Motivation: persönlicher Coach-Spruch je nach Situation,
   viele Zitate zum Durchtippen und abwechselndes Lob.
   ========================================================= */

const MORE_QUOTES = [
  'Du musst nicht perfekt sein. Du musst nur weitermachen.',
  'Jede gesunde Entscheidung ist ein kleines „Ich hab mich lieb“.',
  'Dein Herzballon steigt mit jedem Tag ein Stückchen höher. 🎈',
  'Langsam ist auch ein Tempo. Und es kommt an.',
  'Du bist nicht allein auf diesem Weg. Jemand ist sehr stolz auf dich. 💜',
  'Schokolade ist kein Rückschritt. Aufgeben wäre einer.',
  'Die Waage misst Gewicht – nicht deinen Wert.',
  'Du wirst nicht nur leichter, du wirst stärker.',
  'Kleine Gewohnheiten, große Veränderung.',
  'Heute investierst du in dein zukünftiges Ich. Sie wird dir danken.',
  'Glow-Up in Arbeit. Bitte nicht stören. ✨',
  'Plateau heißt nicht Stillstand – dein Körper sortiert sich nur.',
  'Wasser, Schritte, Schlaf – die drei besten Freundinnen beim Abnehmen.',
  'Ein Spaziergang ist besser als kein Workout. Immer.',
  'Fühl dich gut. Nicht nur sieh gut aus.',
  'Du bist die Hauptfigur in deiner Geschichte. 💜',
  'Liebe deinen Körper für alles, was er heute für dich getan hat.',
  'Disziplin ist Selbstliebe mit Plan.',
  'Du hast schon so viel geschafft. Schau mal, wie weit dein Ballon schon ist!',
  'Gönn dir Pausen. Aber gib nicht auf.',
  'Mit jedem Workout sagst du: Ich bin es mir wert.',
  'Du strahlst – mit oder ohne Zahl auf der Waage.',
  'Morgen bist du froh, dass du heute angefangen hast.',
  'Es geht nicht ums Verzichten. Es geht ums Wohlfühlen.',
]

const allQuotes = () => [...QUOTES, ...MORE_QUOTES];

const PRAISE = ['Stark! 💜', 'So stolz auf dich!', 'Queen!', 'Du rockst das!', 'Wunderbar!', 'Glow-Up! ✨', 'Herzchen verdient! 💕', 'Läuft bei dir!', 'Genau so!', 'Powerfrau!', 'Super gemacht!', 'Weiter so, Amo! 💜', 'Stolz auf dich, Amo! 🐧', 'Amo, du bist die Beste! 💕'];

const praise = () => PRAISE[Math.floor(Math.random() * PRAISE.length)];

const GREETING = {
  morning: ['Guten Morgen, Sonnenschein ☀️', 'Guten Morgen, Amo! 💜', 'Neuer Tag, neues Strahlen ✨', 'Buongiorno, Amo ☀️'],
  day: ['Hey du! 💜', 'Hey Amo! 💜', 'Na, wie läuft dein Tag?', 'Halbzeit – du machst das toll!'],
  evening: ['Guten Abend, Schöne 🌸', 'Guten Abend, Amo 🌸', 'Fast geschafft für heute!', 'Zeit, den Tag ausklingen zu lassen 💜'],
  night: ['Schlaf gut und träum was Schönes 🌙', 'Gute Nacht, Amo 💜', 'Ausruhen ist auch Fortschritt 🌙'],
}

// Sucht die wichtigste Nachricht für genau jetzt
function coachMessage() {
  const p = state.profile;
  const k = dayKey();
  const d = day(k);
  const h = new Date().getHours();
  const phase = phaseOf(h);
  const cw = currentWeight();
  const kcalLeft = p.kcalTarget - (d.kcal || 0);
  const s = streak();
  let greeting = GREETING[phase][hashDay(k) % GREETING[phase].length];
  if (p.name && !greeting.includes('Amo')) greeting = greeting.replace(/^Hey du/, 'Hey ' + p.name).replace(/(Sonnenschein|Schöne)(?= |$)/, p.name);
  const msgs = [];
  const add = (prio, icon, text) => msgs.push({ prio, icon, text });

  if (cw <= p.goalWeight) add(100, '🏆', `Du hast es geschafft: <b>${fmtKg(cw)} kg</b>! Dein Herzballon ist angekommen. So unglaublich stolz auf dich! 💜`);
  const rd = typeof recapDue === 'function' ? recapDue() : null;
  if (rd && !(state.recapSeen && state.recapSeen[rd])) add(85, '📊', 'Die Woche ist geschafft! Dein <b>Wochenrückblick</b> ist fertig – tipp oben auf „Ansehen“.');
  if (d.perfect) add(90, '⭐', 'Perfekter Tag! Alle Missionen erfüllt – du bist einfach toll.');

  const nextKg = Math.ceil(cw) - 1;
  const toNext = cw - nextKg;
  if (nextKg >= p.goalWeight && toNext <= 0.3 && toNext > 0) add(80, '🎈', `Nur noch <b>${Math.round(toNext * 1000)} g</b> bis unter ${nextKg + 1} kg! Dein Ballon ist kurz vor dem nächsten Herzchen.`);

  const thisWeek = avgWeight(k, 7), lastWeek = avgWeight(addDays(k, -7), 7);
  if (thisWeek != null && lastWeek != null && lastWeek - thisWeek >= 0.15) add(70, '📉', `<b>−${fmtKg(lastWeek - thisWeek)} kg</b> im Wochenschnitt! Es funktioniert – und du machst das ganz ohne Hungern. 💜`);

  if (d.workout && d.workout.finished) add(65, '💪', 'Workout erledigt! Du hast heute etwas richtig Gutes für dich getan.');
  if (s >= 3) add(60, '💕', `<b>${s} Tage in Folge</b> im Kalorienziel! Die Serie steht dir richtig gut.`);

  if (h >= 18 && d.kcal > p.kcalTarget) add(74, '🌸', 'Heute etwas mehr gegessen? Völlig okay! Ein Abendspaziergang tut gut – und morgen geht\'s einfach weiter.');
  else if (h >= 17 && d.kcal > 0 && kcalLeft >= 0) add(72, '🍽️', `Du hast noch <b>${kcalLeft} kcal</b> für heute – genug für ein leckeres, eiweißreiches Abendessen.`);
  if (h >= 16 && (d.steps ?? 0) < 6000) add(58, '👟', `Erst ${fmtSteps(d.steps ?? 0)} Schritte – wie wär's mit einem kleinen Spaziergang mit Musik? 🎧`);
  if (h >= 5 && h < 11 && !state.weights.some((e) => e.date === k)) add(50, '⚖️', 'Guten Morgen! Kurz auf die Waage, bevor du frühstückst – nur für den Überblick. Die Zahl sagt nichts über deinen Wert. 💜');

  const lastWorkout = Object.keys(state.days).filter((x) => state.days[x].workout && state.days[x].workout.finished).sort().pop();
  const daysSince = lastWorkout ? Math.round((parseKey(k) - parseKey(lastWorkout)) / 864e5) : null;
  if (!(d.workout && d.workout.finished) && daysSince != null && daysSince >= 2 && h < 20) add(45, '🏠', `Heute wäre ein schöner Tag für „${WORKOUTS[ROTATION[state.nextWorkout % ROTATION.length]].name}“ – nur 30 Minuten im Wohnzimmer.`);

  if (!msgs.length) add(0, '💜', [
    'Du machst das wunderbar. Ein Tag nach dem anderen.',
    'Denk dran: Du machst das für dich, weil du dich liebst – nicht weil du musst.',
    'Heute zählt jeder kleine Schritt. Wörtlich und im übertragenen Sinn. 👟',
  ][hashDay(k) % 3]);

  msgs.sort((a, b) => b.prio - a.prio);
  return { greeting, ...msgs[0] };
}

let quoteOffset = 0;

function currentQuote() {
  const all = allQuotes();
  return all[(hashDay(dayKey()) + quoteOffset) % all.length];
}

function coachBanner() {
  const m = coachMessage();
  return `<section class="card coach-banner">
    <div class="cb-avatar pg-avatar" aria-hidden="true">${penguinIcon({ bow: false, mood: phaseOf(new Date().getHours()) === 'night' ? 'sleepy' : m.prio >= 85 ? 'love' : m.prio >= 60 ? 'proud' : 'happy', wave: m.prio < 60 && phaseOf(new Date().getHours()) !== 'night' })}<span class="cb-badge">${m.icon}</span></div>
    <div class="cb-body">
      <div class="cb-from">🐧 ${PG_HIM} sagt:</div>
      <div class="cb-greet">${esc(m.greeting)}</div>
      <div class="cb-text">${m.text}</div>
    </div>
  </section>`;
}

function bindQuote() {
  const q = document.querySelector('.quote');
  if (!q) return;
  q.addEventListener('click', () => {
    quoteOffset++;
    q.classList.remove('swap');
    void q.offsetWidth;
    q.classList.add('swap');
    q.querySelector('.qtext').textContent = `„${currentQuote()}"`;
  });
}


// ---------- 💌 Tägliche Liebesbotschaft ----------
const LOVE_NOTES = [
  'Ich bin so stolz auf dich – nicht wegen einer Zahl, sondern weil du dranbleibst.',
  'Egal was die Waage sagt: Für mich bist du perfekt, genau so wie du bist.',
  'Ich liebe dein Lachen. Ich hoffe, du hast heute schon gelacht! 😊',
  'Kleine Erinnerung: Du bist stärker, als du denkst.',
  'Wenn du heute einen schweren Tag hast, Amo – ich bin da. Immer.',
  'Danke, dass es dich gibt. Du machst mein Leben schöner.',
  'Lust auf einen Spaziergang zusammen? Zählt auch für deine Schritte 😉',
  'Du inspirierst mich jeden Tag mit deiner Willenskraft.',
  'Ich glaub an dich – heute, morgen und an jedem Tag danach.',
  'Du bist das Schönste, was mir je passiert ist.',
  'Gönn dir heute etwas Schönes. Du hast es verdient.',
  'Jeder Schritt, den du gehst, gehe ich in Gedanken mit dir.',
  'Du strahlst. Nicht wegen eines Ziels, sondern weil du du bist.',
  'Mein Herz schlägt ein bisschen schneller, wenn ich an dich denke.',
];

// Briefe aus briefe.txt (vom Freund selbst geschrieben); eingebaute Liste als Rückfall
const NOTES_CACHE = 'herzensziel.briefe';
let loveNotes = { list: LOVE_NOTES, sign: 'Joël 💜', goal: null };

function parseNotes(text) {
  const out = { list: [], sign: 'Joël 💜', goal: null };
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    if (/^UNTERSCHRIFT:/i.test(line)) out.sign = line.replace(/^UNTERSCHRIFT:\s*/i, '');
    else if (/^ZIEL:/i.test(line)) out.goal = line.replace(/^ZIEL:\s*/i, '');
    else out.list.push(line);
  }
  return out.list.length ? out : null;
}

try { const c = parseNotes(localStorage.getItem(NOTES_CACHE) || ''); if (c) loveNotes = c; } catch (e) { /* egal */ }

function loadNotes() {
  fetch('briefe.txt', { cache: 'no-cache' })
    .then((r) => (r.ok ? r.text() : Promise.reject()))
    .then((t) => {
      const parsed = parseNotes(t);
      if (!parsed) return;
      const changed = JSON.stringify(parsed) !== JSON.stringify(loveNotes);
      loveNotes = parsed;
      try { localStorage.setItem(NOTES_CACHE, t); } catch (e) { /* egal */ }
      if (changed && state.profile && tab === 'today') render();
    })
    .catch(() => {});
}

// Fester Zufallsplan pro Startdatum: Abstände zwischen den Briefen 1–4 Tage
function letterSlot(dayNo, seedKey) {
  let seed = [...seedKey].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  let day = 0, idx = 0; // Tag 0: erster Brief zur Begrüßung
  while (day < dayNo) {
    const r = rnd();
    day += r < 0.2 ? 1 : r < 0.55 ? 2 : r < 0.85 ? 3 : 4; // 20 % / 35 % / 30 % / 15 %
    idx++;
  }
  return day === dayNo ? idx : -1;
}

function loveNoteCard() {
  const k = dayKey();
  const p = state.profile;
  const reached = currentWeight() <= p.goalWeight;
  const opened = state.notesOpened && state.notesOpened[k];
  // Briefe kommen unregelmäßig (mal nach 1, 2, 3 oder 4 Tagen) – der Reihe nach
  const dayNo = Math.max(0, Math.round((parseKey(k) - parseKey(p.startDate || k)) / 864e5));
  const slot = letterSlot(dayNo, p.startDate || k);
  if (!reached && slot < 0) return '';
  const text = reached
    ? (loveNotes.goal || 'Du hast es wirklich geschafft! Ich bin unendlich stolz auf dich. Heute wirst du gefeiert! 🎉')
    : loveNotes.list[slot % loveNotes.list.length];
  return `<section class="card love ${opened ? 'open' : ''}" id="loveNote" role="button" tabindex="0" aria-label="Liebesbrief öffnen">
    <div class="love-pg">${penguinIcon({ mood: opened ? 'love' : 'happy', wave: !opened })}</div>
    <div class="envelope-wrap">
      <div class="env">
        <div class="env-flap"></div>
        <div class="env-letter">
          <div class="letter-text">${esc(text)}</div>
          <div class="letter-sign">– ${esc(loveNotes.sign)}</div>
        </div>
        <div class="env-front"><span class="seal">♥</span></div>
      </div>
    </div>
    <div class="love-hint">${opened ? (reached ? '🎁 Eine ganz besondere Nachricht' : '💌 Deine Nachricht für heute') : (reached ? '🎁 Ein besonderer Brief wartet auf dich – tippen!' : '💌 Du hast Post! Tippen zum Öffnen')}</div>
  </section>`;
}

function bindLoveNote() {
  const el = document.getElementById('loveNote');
  if (!el) return;
  const open = () => {
    if (el.classList.contains('open')) return;
    el.classList.add('open');
    state.notesOpened = state.notesOpened || {};
    state.notesOpened[dayKey()] = true;
    save();
    const r = el.getBoundingClientRect();
    confetti(40, { x: r.left + r.width / 2, y: r.top + 60 });
    el.querySelector('.love-hint').textContent = '💌 Deine Nachricht für heute';
  };
  el.addEventListener('click', open);
  el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
}
