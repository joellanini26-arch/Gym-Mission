'use strict';

/* =========================================================
   Motivation: persönlicher Coach-Spruch je nach Situation,
   viele Zitate zum Durchtippen und abwechselndes Lob.
   ========================================================= */

const MORE_QUOTES = [
  'Du bist nicht dünn geboren, um dünn zu bleiben.',
  'Jeder Champion war mal ein Anfänger, der nicht aufgegeben hat.',
  'Disziplin ist, sich an das zu erinnern, was man wirklich will.',
  'Dein zukünftiges Ich bedankt sich für jede Mahlzeit heute.',
  '70 kg sind kein Traum. Es ist ein Datum im Kalender.',
  'Klein anfangen, nie aufhören.',
  'Erfolg ist die Summe kleiner Mahlzeiten, Tag für Tag.',
  'Du musst nicht motiviert sein. Du musst nur essen.',
  'Wachstum passiert außerhalb der Komfortzone – und am Esstisch.',
  'Die anderen sehen das Ergebnis. Du kennst den Weg.',
  'Ein Shake mehr. Ein Satz mehr. Ein Schritt näher.',
  'Stark wird man nicht an einem Tag, sondern an jedem Tag.',
  'Wenn es leicht wäre, hätte es jeder geschafft. Du schaffst es trotzdem.',
  'Der Teller ist dein Trainingsgerät Nr. 1.',
  'Fortschritt, nicht Perfektion.',
  'Heute essen, morgen wachsen.',
  'Du hast 2 Jahre Training in den Muskeln. Gib ihnen das Baumaterial.',
  'Eine schlechte Mahlzeit ruiniert nichts. Eine ausgelassene auch nicht. Aber jeden Tag zählt.',
  'Wer täglich ein bisschen besser wird, ist irgendwann richtig gut.',
  'Zweifel tötet mehr Träume als Scheitern. Iss weiter.',
  'Der Spiegel wird es dir zuerst zeigen. Dann alle anderen.',
  'Jeder Kilo ist ein Beweis, dass du es kannst.',
  'Mach es für den Typen, der vor 2 Jahren angefangen hat.',
  'Ausreden verbrennen keine Kalorien – aber sie sparen auch keine.',
];

const allQuotes = () => [...QUOTES, ...MORE_QUOTES];

const PRAISE = ['Stark!', 'Weiter so!', 'Genau so!', 'Läuft bei dir!', 'Maschine!', 'Sauber!', 'Beast Mode!', 'Top!', 'Respekt!', 'Nicht aufhören!', 'Das ist der Weg!', 'Boom!'];

const praise = () => PRAISE[Math.floor(Math.random() * PRAISE.length)];

const GREETING = {
  morning: ['Guten Morgen, Champion!', 'Moin! Neuer Tag, neue Kalorien.', 'Aufstehen, wiegen, frühstücken – los geht\'s!'],
  day: ['Hey! Wie läuft dein Tag?', 'Halbzeit! Bleib am Essen dran.', 'Mittagszeit = Kalorienzeit.'],
  evening: ['Guten Abend!', 'Endspurt für heute!', 'Der Tag ist noch nicht vorbei.'],
  night: ['Noch wach? Ein Quark vor dem Schlafen hilft!', 'Gute Nacht – im Schlaf wachsen die Muskeln.', 'Schlaf gut, morgen geht\'s weiter.'],
};

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
  const greeting = GREETING[phase][hashDay(k) % GREETING[phase].length];
  const msgs = [];
  const add = (prio, icon, text) => msgs.push({ prio, icon, text });

  if (cw >= p.goalWeight) add(100, '🏆', `Du hast es geschafft: <b>${fmtKg(cw)} kg</b>! Jahrelang davon geträumt – jetzt ist es Realität.`);
  if (d.perfect) add(90, '⭐', 'Perfekter Tag! Alle Missionen erfüllt. Genau so sehen Gewinner-Tage aus.');

  const nextKg = Math.floor(cw) + 1;
  const toNext = nextKg - cw;
  if (nextKg <= p.goalWeight && toNext <= 0.3 && toNext > 0) add(80, '🎯', `Nur noch <b>${Math.round(toNext * 1000)} g</b> bis zum ${nextKg}-kg-Fähnchen! Heute gut essen und morgen ist es da.`);

  const thisWeek = avgWeight(k, 7), lastWeek = avgWeight(addDays(k, -7), 7);
  if (thisWeek != null && lastWeek != null && thisWeek - lastWeek >= 0.15) add(70, '📈', `<b>+${fmtKg(thisWeek - lastWeek)} kg</b> im Wochenschnitt! Es funktioniert – dein Körper verändert sich.`);

  if (d.workout && d.workout.finished) add(65, '💪', 'Training erledigt! Jetzt wachsen die Muskeln – aber nur, wenn du ihnen genug Essen gibst.');

  if (s >= 3) add(60, '🔥', `<b>${s} Tage in Folge</b> Kalorienziel geschafft! Lass die Serie nicht abreißen.`);

  if (h >= 17 && kcalLeft > 0 && kcalLeft <= 1100) add(75, '🥤', `Noch <b>${kcalLeft} kcal</b> bis zum Ziel – ein Masse-Shake erledigt das fast komplett!`);
  else if (h >= 17 && kcalLeft > 1100) add(72, '⏰', `Noch <b>${kcalLeft} kcal</b> offen. Jetzt nicht aufgeben: großes Abendessen + Shake, dann passt es.`);
  else if (h >= 12 && h < 17 && (d.kcal || 0) < p.kcalTarget * 0.35) add(55, '🍝', 'Schon Mittag und erst wenig gegessen? Zeit für eine richtige Portion!');

  if (h >= 5 && h < 11 && !state.weights.some((e) => e.date === k)) add(50, '⚖️', 'Erst auf die Waage, dann frühstücken – so siehst du deinen echten Fortschritt.');

  const lastWorkout = Object.keys(state.days).filter((x) => state.days[x].workout && state.days[x].workout.finished).sort().pop();
  const daysSince = lastWorkout ? Math.round((parseKey(k) - parseKey(lastWorkout)) / 864e5) : null;
  if (!(d.workout && d.workout.finished) && daysSince != null && daysSince >= 2 && h < 20) add(45, '🏋️', `${daysSince} Tage seit dem letzten Training. Heute wäre perfekt für ${WORKOUTS[ROTATION[state.nextWorkout % ROTATION.length]].name}!`);

  if (!msgs.length) add(0, '💬', [
    'Jede Mahlzeit heute bringt dich näher an den Gipfel.',
    'Konstanz ist dein Superpower. Einfach dranbleiben.',
    'Heute ist ein guter Tag, um ein bisschen mehr zu essen als gestern.',
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
    <div class="cb-avatar" aria-hidden="true">${m.icon}</div>
    <div class="cb-body">
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
