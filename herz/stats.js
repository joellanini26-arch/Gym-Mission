'use strict';

/* =========================================================
   Statistiken & Wochenrückblick
   ========================================================= */

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const WEEKDAYS_LONG = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

const weekdayIdx = (k) => (parseKey(k).getDay() + 6) % 7; // Mo = 0
const mondayOf = (k) => addDays(k, -weekdayIdx(k));

function isoWeek(k) {
  const d = parseKey(k);
  d.setDate(d.getDate() + 3 - weekdayIdx(k));
  const jan4 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - jan4) / 864e5 - 3 + ((jan4.getDay() + 6) % 7)) / 7);
}

const fmtInt = (n) => Math.round(n).toLocaleString('de-DE');

// ---------- Kraft-Verlauf ----------

function logLifts(workout, k) {
  const w = WORKOUTS[workout.id];
  if (!w) return;
  state.liftLog = state.liftLog || {};
  w.exercises.forEach((ex, i) => {
    const done = (workout.sets[i] || []).filter(Boolean).length;
    const kg = state.lifts[ex.n];
    if (!done || kg == null) return;
    const log = state.liftLog[ex.n] || (state.liftLog[ex.n] = []);
    const prev = log.filter((e) => e.date !== k);
    prev.push({ date: k, kg });
    state.liftLog[ex.n] = prev.sort((a, b) => a.date.localeCompare(b.date));
  });
}

// Startwerte aus dem Plan als ersten Eintrag sichern (damit Fortschritt messbar ist)
function seedLiftLog() {
  state.liftLog = state.liftLog || {};
  const start = state.profile?.startDate || dayKey();
  for (const w of Object.values(WORKOUTS)) {
    for (const e of w.exercises) {
      if (e.kg != null && !state.liftLog[e.n]) state.liftLog[e.n] = [{ date: start, kg: e.kg }];
    }
  }
}

// ---------- Wochenrückblick ----------

function weekRecap(monday) {
  const p = state.profile;
  const keys = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const sunday = keys[6];
  const days = keys.map((k) => state.days[k]);
  const logged = days.filter((d) => d && d.kcal > 0);
  const avgKcal = logged.length ? logged.reduce((a, d) => a + d.kcal, 0) / logged.length : null;
  const protDays = days.filter((d) => d && d.protein > 0);
  const avgProt = protDays.length ? protDays.reduce((a, d) => a + d.protein, 0) / protDays.length : null;
  const stepDays = days.filter((d) => d && d.steps != null);
  const avgSteps = stepDays.length ? stepDays.reduce((a, d) => a + d.steps, 0) / stepDays.length : null;
  const goalDays = days.filter((d) => d && missionDone(d, 'kcal')).length;
  const trainings = days.filter((d) => d && d.workout && d.workout.finished).length;
  const sets = days.reduce((a, d) => a + (d && d.workout ? Object.values(d.workout.sets).reduce((x, s) => x + s.filter(Boolean).length, 0) : 0), 0);
  const perfect = days.filter((d) => d && d.perfect).length;
  const missionPct = keys.reduce((a, k) => a + dayScore(k), 0) / 7;
  const wNow = avgWeight(sunday, 7), wPrev = avgWeight(addDays(sunday, -7), 7);
  const delta = wNow != null && wPrev != null ? wNow - wPrev : null; // negativ = abgenommen
  const weighIns = state.weights.filter((e) => e.date >= monday && e.date <= sunday).length;

  // Neue Bestleistungen in dieser Woche
  const prs = [];
  for (const [name, log] of Object.entries(state.liftLog || {})) {
    const before = log.filter((e) => e.date < monday).map((e) => e.kg);
    const during = log.filter((e) => e.date >= monday && e.date <= sunday).map((e) => e.kg);
    if (before.length && during.length && Math.max(...during) > Math.max(...before)) prs.push({ name, kg: Math.max(...during), plus: Math.max(...during) - Math.max(...before) });
  }

  // Note: Essen zählt am meisten, dann Training, dann Missionen
  const stepScore = avgSteps != null ? Math.min(avgSteps / 8000, 1) : 0;
  const score = 0.4 * (goalDays / 7) + 0.25 * Math.min(trainings / 3, 1) + 0.15 * stepScore + 0.2 * missionPct;
  const grade = score >= 0.85 ? ['A', 'Traumwoche! 💜'] : score >= 0.65 ? ['B', 'Richtig schöne Woche!'] : score >= 0.4 ? ['C', 'Gute Basis – da geht noch was.'] : ['D', 'Neue Woche, neues Glück 🌸'];

  // Wichtigster Fokus für nächste Woche
  let focus;
  if (goalDays < 5) focus = `An mindestens <b>5 von 7 Tagen</b> im Kalorienziel bleiben (diese Woche: ${goalDays}). Tipp: Abendessen vorher planen und Gemüse zuerst essen.`;
  else if (trainings < 3) focus = `<b>3 Home-Workouts</b> schaffen (diese Woche: ${trainings}). Feste Tage im Kalender eintragen – z. B. Mo / Mi / Fr.`;
  else if (avgSteps == null || avgSteps < 8000) focus = `Im Schnitt <b>8.000 Schritte</b> (diese Woche: ${avgSteps != null ? fmtSteps(avgSteps) : '–'}). Ein Spaziergang nach dem Abendessen bringt ca. 2.500.`;
  else if (avgProt != null && avgProt < p.proteinTarget) focus = `Protein auf <b>${p.proteinTarget} g</b> steigern (Ø ${Math.round(avgProt)} g). Laktosefreier Skyr oder Eier helfen.`;
  else focus = 'Alles im grünen Bereich! Weiter so – und gönn dir etwas Schönes, du hast es verdient. 💜';

  const bestDay = keys.reduce((best, k) => ((state.days[k]?.kcal || 0) > (state.days[best]?.kcal || 0) ? k : best), keys[0]);

  return { monday, sunday, keys, avgKcal, avgProt, goalDays, trainings, sets, perfect, missionPct, delta, wNow, weighIns, prs, grade, focus, bestDay, avgSteps, kw: isoWeek(monday) };
}

function recapHtml(r) {
  const p = state.profile;
  const range = `${fmtDate(r.monday)} – ${fmtDate(r.sunday)}`;
  const maxK = Math.max(p.kcalTarget * 1.2, ...r.keys.map((k) => state.days[k]?.kcal || 0));
  const H = 90;
  const bars = r.keys.map((k, i) => {
    const v = state.days[k]?.kcal || 0;
    const h = Math.max(2, (v / maxK) * H);
    const ok = v > 0 && v <= p.kcalTarget;
    return `<g data-tip="${WEEKDAYS_LONG[i]}: ${v ? fmtInt(v) + ' kcal' : 'kein Eintrag'}">
      <rect class="hit" x="${i * 44}" y="0" width="44" height="${H + 18}" fill="transparent"/>
      <rect class="kbar ${ok ? 'ok' : ''}" x="${i * 44 + 10}" y="${H - h}" width="24" height="${h}" rx="4"/>
      <text x="${i * 44 + 22}" y="${H + 14}" text-anchor="middle">${WEEKDAYS[i]}</text></g>`;
  }).join('');
  const ty = H - (p.kcalTarget / maxK) * H;

  return `<div class="recap-head">
      <div class="eyebrow">Wochenrückblick · KW ${r.kw}</div>
      <div class="muted small">${range}</div>
      <div class="grade grade-${r.grade[0]}">${r.grade[0]}</div>
      <div class="recap-title">${r.grade[1]}</div>
    </div>
    <div class="recap-grid">
      <div class="rtile"><span>Gewicht</span><b>${r.delta != null ? (r.delta > 0 ? '+' : r.delta < 0 ? '−' : '') + fmtKg(Math.abs(r.delta)) + ' kg' : '–'}</b><small>${r.wNow != null ? 'Ø ' + fmtKg(r.wNow) + ' kg' : 'zu wenig Wiegen'}</small></div>
      <div class="rtile"><span>Ø Kalorien</span><b>${r.avgKcal != null ? fmtInt(r.avgKcal) : '–'}</b><small>Ziel ${fmtInt(p.kcalTarget)}</small></div>
      <div class="rtile"><span>Im Ziel</span><b>${r.goalDays}/7</b><small>Tage</small></div>
      <div class="rtile"><span>Trainings</span><b>${r.trainings}/3</b><small>${r.sets} Sätze</small></div>
      <div class="rtile"><span>Ø Protein</span><b>${r.avgProt != null ? Math.round(r.avgProt) + ' g' : '–'}</b><small>Ziel ${p.proteinTarget} g</small></div>
      <div class="rtile"><span>Missionen</span><b>${Math.round(r.missionPct * 100)} %</b><small>${r.perfect} perfekte Tage</small></div>
    </div>
    ${r.avgSteps != null ? `<p class="small" style="margin:12px 0 0">👟 Ø <b>${fmtSteps(r.avgSteps)}</b> Schritte pro Tag ≈ ${stepsKcal(r.avgSteps, r.wNow || p.startWeight)} kcal verbrannt${r.avgSteps >= 8000 ? ' – Ziel geschafft! 👟' : ''}</p>` : ''}
    <h3>Kalorien pro Tag</h3>
    <svg class="kchart" viewBox="0 0 308 ${H + 20}" role="img" aria-label="Kalorien pro Tag dieser Woche">
      ${bars}
      <line class="target" x1="0" x2="308" y1="${ty}" y2="${ty}"/>
      <text class="target-label" x="306" y="${ty - 4}" text-anchor="end">Ziel ${fmtInt(p.kcalTarget)}</text>
    </svg>
    ${r.prs.length ? `<h3>🏆 Neue Bestleistungen</h3><ul class="list small">${r.prs.map((x) => `<li><b>${esc(x.name)}</b>: ${fmtKg(x.kg)} kg (+${fmtKg(x.plus)} kg)</li>`).join('')}</ul>` : ''}
    <h3>🎯 Fokus für nächste Woche</h3>
    <p class="small" style="margin:0">${r.focus}</p>`;
}

function openRecap(monday) {
  const r = weekRecap(monday);
  const o = document.createElement('div');
  o.className = 'overlay';
  o.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="Wochenrückblick">
    <button class="sheet-close" aria-label="Schließen">✕</button>
    ${recapHtml(r)}
    <button class="btn" style="margin-top:16px" data-close>Auf in die neue Woche 💪</button>
  </div>`;
  document.body.appendChild(o);
  bindTips(o);
  const close = () => { o.classList.add('out'); setTimeout(() => o.remove(), 250); };
  o.addEventListener('click', (e) => { if (e.target === o || e.target.closest('.sheet-close,[data-close]')) close(); });
  state.recapSeen = state.recapSeen || {};
  if (!state.recapSeen[monday]) {
    state.recapSeen[monday] = true;
    save();
    if (r.grade[0] === 'A' || r.grade[0] === 'B') setTimeout(bigCelebration, 300);
  }
}

// Sonntag ab 17 Uhr: aktuelle Woche; Montag: noch die Vorwoche anbieten
function recapDue() {
  const k = dayKey();
  const wd = weekdayIdx(k), h = new Date().getHours();
  if (wd === 6 && h >= 17) return mondayOf(k);
  if (wd === 0) return addDays(mondayOf(k), -7);
  return null;
}

function recapTeaser() {
  const m = recapDue();
  if (!m || !state.profile || m < mondayOf(state.profile.startDate || dayKey())) return '';
  const seen = state.recapSeen && state.recapSeen[m];
  return `<section class="card recap-teaser ${seen ? 'seen' : ''}">
    <div class="spread">
      <div><div class="eyebrow">KW ${isoWeek(m)} ist vorbei</div><div class="cb-greet">📊 Dein Wochenrückblick ist da!</div></div>
      <button class="btn small" data-recap="${m}">${seen ? 'Nochmal' : 'Ansehen'}</button>
    </div>
  </section>`;
}

// ---------- Tipp-Tooltips für Diagramme ----------

function bindTips(root) {
  let tip = document.querySelector('.tip');
  if (!tip) { tip = document.createElement('div'); tip.className = 'tip'; document.body.appendChild(tip); }
  root.querySelectorAll('[data-tip]').forEach((el) => {
    const show = (e) => {
      tip.textContent = el.dataset.tip;
      tip.style.left = `${clamp(e.clientX, 70, innerWidth - 70)}px`;
      tip.style.top = `${e.clientY - 12}px`;
      tip.classList.add('show');
      el.classList.add('hl');
      clearTimeout(bindTips._t);
      bindTips._t = setTimeout(() => { tip.classList.remove('show'); el.classList.remove('hl'); }, 1800);
    };
    el.addEventListener('pointerenter', show);
    el.addEventListener('click', show);
    el.addEventListener('pointerleave', () => { tip.classList.remove('show'); el.classList.remove('hl'); });
  });
}

// ---------- Statistik-Karten im Tab „Fortschritt“ ----------

function kcalChart14() {
  const p = state.profile;
  const today = dayKey();
  const keys = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13));
  const vals = keys.map((k) => state.days[k]?.kcal || 0);
  if (!vals.some(Boolean)) return '<p class="muted small" style="margin:0">Noch keine Kalorien eingetragen.</p>';
  const W = 336, H = 120, bw = W / 14;
  const max = Math.max(p.kcalTarget * 1.2, ...vals);
  const ty = H - (p.kcalTarget / max) * H;
  const hit = vals.filter((v) => v > 0 && v <= p.kcalTarget).length;
  return `<svg class="kchart" viewBox="0 0 ${W} ${H + 20}" role="img" aria-label="Kalorien der letzten 14 Tage">
      ${keys.map((k, i) => {
        const v = vals[i], h = Math.max(v ? 2 : 0, (v / max) * H);
        return `<g data-tip="${WEEKDAYS[weekdayIdx(k)]} ${fmtDate(k)}: ${v ? fmtInt(v) + ' kcal' : 'kein Eintrag'}">
          <rect class="hit" x="${i * bw}" y="0" width="${bw}" height="${H + 20}" fill="transparent"/>
          <rect class="kbar ${v > 0 && v <= p.kcalTarget ? 'ok' : v > p.kcalTarget ? 'over' : ''}" x="${i * bw + 3}" y="${H - h}" width="${bw - 6}" height="${h}" rx="3"/>
          ${i % 2 === 1 || i === 13 ? `<text x="${i * bw + bw / 2}" y="${H + 14}" text-anchor="middle">${i === 13 ? 'heute' : WEEKDAYS[weekdayIdx(k)]}</text>` : ''}</g>`;
      }).join('')}
      <line class="target" x1="0" x2="${W}" y1="${ty}" y2="${ty}"/>
      <text class="target-label" x="${W - 2}" y="${ty - 4}" text-anchor="end">Ziel ${fmtInt(p.kcalTarget)}</text>
    </svg>
    <p class="muted small" style="margin:6px 0 0">An <b style="color:var(--text)">${hit} von 14</b> Tagen im Ziel · lila = im Ziel, rosa = drüber · antippen für Werte</p>`;
}

function stepsChart14() {
  const today = dayKey();
  const keys = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13));
  const vals = keys.map((k) => state.days[k]?.steps ?? 0);
  if (!vals.some(Boolean)) return '<p class="muted small" style="margin:0">Noch keine Schritte – füge sie per Kurzbefehl hinzu oder trag sie auf der Startseite ein.</p>';
  const W = 336, H = 110, bw = W / 14, ref = 8000;
  const max = Math.max(ref * 1.3, ...vals);
  const ty = H - (ref / max) * H;
  const logged = vals.filter(Boolean);
  const avg = logged.reduce((a, b) => a + b, 0) / logged.length;
  const cw = currentWeight();
  return `<svg class="kchart" viewBox="0 0 ${W} ${H + 20}" role="img" aria-label="Schritte der letzten 14 Tage">
      ${keys.map((k, i) => {
        const v = vals[i], h = Math.max(v ? 2 : 0, (v / max) * H);
        return `<g data-tip="${WEEKDAYS[weekdayIdx(k)]} ${fmtDate(k)}: ${v ? fmtSteps(v) + ' Schritte · ≈ ' + stepsKcal(v, cw) + ' kcal' : 'kein Eintrag'}">
          <rect class="hit" x="${i * bw}" y="0" width="${bw}" height="${H + 20}" fill="transparent"/>
          <rect class="kbar steps ${v >= 8000 ? 'ok' : ''}" x="${i * bw + 3}" y="${H - h}" width="${bw - 6}" height="${h}" rx="3"/>
          ${i % 2 === 1 || i === 13 ? `<text x="${i * bw + bw / 2}" y="${H + 14}" text-anchor="middle">${i === 13 ? 'heute' : WEEKDAYS[weekdayIdx(k)]}</text>` : ''}</g>`;
      }).join('')}
      <line class="target" x1="0" x2="${W}" y1="${ty}" y2="${ty}"/>
      <text class="target-label" x="${W - 2}" y="${ty - 4}" text-anchor="end">Ziel 8.000</text>
    </svg>
    <p class="muted small" style="margin:6px 0 0">Ø <b style="color:var(--text)">${fmtSteps(avg)}</b> Schritte ≈ ${stepsKcal(avg, cw)} kcal pro Tag · lila = Ziel geschafft</p>`;
}

function weekdayStats() {
  const today = dayKey();
  const sums = Array(7).fill(0), counts = Array(7).fill(0);
  for (let i = 1; i <= 56; i++) {
    const k = addDays(today, -i);
    const v = state.days[k]?.kcal;
    if (v > 0) { sums[weekdayIdx(k)] += v; counts[weekdayIdx(k)]++; }
  }
  if (counts.filter(Boolean).length < 5) return '<p class="muted small" style="margin:0">Nach etwa 2 Wochen mit Kalorien-Einträgen siehst du hier, an welchem Wochentag du am meisten isst.</p>';
  const avg = sums.map((s, i) => (counts[i] ? s / counts[i] : null));
  const valid = avg.map((v, i) => [v, i]).filter(([v]) => v != null);
  const worst = valid.reduce((a, b) => (b[0] > a[0] ? b : a));
  const best = valid.reduce((a, b) => (b[0] < a[0] ? b : a));
  const max = Math.max(...valid.map(([v]) => v));
  return `<div class="hbars">${avg.map((v, i) => `<div class="hbar ${i === worst[1] ? 'weak' : ''}" data-tip="${WEEKDAYS_LONG[i]}: Ø ${v != null ? fmtInt(v) + ' kcal' : 'keine Daten'}">
      <span>${WEEKDAYS[i]}</span><div class="track"><i style="width:${v != null ? (v / max) * 100 : 0}%"></i></div><b>${v != null ? fmtInt(v) : '–'}</b></div>`).join('')}</div>
    <p class="small" style="margin:8px 0 0">🍫 Dein Genuss-Tag ist der <b>${WEEKDAYS_LONG[worst[1]]}</b> (Ø ${fmtInt(worst[0])} kcal) – ${fmtInt(worst[0] - best[0])} kcal mehr als am ${WEEKDAYS_LONG[best[1]]}. Plan ihn bewusst ein, dann ist er kein Problem!</p>`;
}

function sparkline(log) {
  if (log.length < 2) return '';
  const W = 70, H = 22;
  const ks = log.map((e) => e.kg), lo = Math.min(...ks), hi = Math.max(...ks);
  const pts = log.map((e, i) => `${((i / (log.length - 1)) * (W - 4) + 2).toFixed(1)},${(hi === lo ? H / 2 : H - 3 - ((e.kg - lo) / (hi - lo)) * (H - 6)).toFixed(1)}`);
  const last = pts[pts.length - 1].split(',');
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" aria-hidden="true"><polyline points="${pts.join(' ')}"/><circle cx="${last[0]}" cy="${last[1]}" r="2.5"/></svg>`;
}

function strengthStats() {
  const rows = Object.entries(state.liftLog || {})
    .filter(([, log]) => log.length)
    .map(([name, log]) => {
      const first = log[0].kg, now = state.lifts[name] ?? log[log.length - 1].kg;
      return { name, first, now, pct: first ? (now - first) / first : 0, log };
    })
    .sort((a, b) => b.pct - a.pct);
  if (!rows.length) return '<p class="muted small" style="margin:0">Wenn du mit Kurzhanteln oder Wasserflaschen trainierst und das Gewicht einträgst, siehst du hier deinen Kraftzuwachs.</p>';
  return `<div class="lifts">${rows.map((r) => `<div class="lift">
      <div class="lift-name">${esc(r.name)}</div>
      ${sparkline(r.log)}
      <div class="lift-val"><b>${fmtKg(r.now)} kg</b><small class="${r.pct > 0 ? 'up' : ''}">${r.pct > 0 ? '▲ +' + Math.round(r.pct * 100) + ' %' : 'Start ' + fmtKg(r.first)}</small></div>
    </div>`).join('')}</div>`;
}

function volumeStats() {
  const thisMon = mondayOf(dayKey());
  const weeks = Array.from({ length: 8 }, (_, i) => addDays(thisMon, (i - 7) * 7));
  const vals = weeks.map((m) => Array.from({ length: 7 }, (_, j) => state.days[addDays(m, j)])
    .reduce((a, d) => a + (d && d.workout ? Object.values(d.workout.sets).reduce((x, s) => x + s.filter(Boolean).length, 0) : 0), 0));
  if (!vals.some(Boolean)) return '<p class="muted small" style="margin:0">Noch keine Sätze abgehakt.</p>';
  const W = 336, H = 90, bw = W / 8, max = Math.max(...vals, 45);
  return `<svg class="kchart" viewBox="0 0 ${W} ${H + 20}" role="img" aria-label="Sätze pro Woche">
    ${weeks.map((m, i) => {
      const h = Math.max(vals[i] ? 2 : 0, (vals[i] / max) * H);
      return `<g data-tip="KW ${isoWeek(m)}: ${vals[i]} Sätze">
        <rect class="hit" x="${i * bw}" y="0" width="${bw}" height="${H + 20}" fill="transparent"/>
        <rect class="kbar ok" x="${i * bw + 8}" y="${H - h}" width="${bw - 16}" height="${h}" rx="4"/>
        <text x="${i * bw + bw / 2}" y="${H + 14}" text-anchor="middle">KW${isoWeek(m)}</text></g>`;
    }).join('')}
  </svg>
  <p class="muted small" style="margin:6px 0 0">Deine 3 Pläne = ${ROTATION.reduce((a, id) => a + WORKOUTS[id].exercises.reduce((x, e) => x + e.s, 0), 0)} Sätze pro Woche.</p>`;
}

function muscleStats() {
  const keys = Array.from({ length: 28 }, (_, i) => addDays(dayKey(), -i));
  const load = muscleLoad(keys);
  const rows = Object.keys(MUSCLES).map((m) => [m, load[m] || 0]).sort((a, b) => b[1] - a[1]);
  if (!rows[0][1]) return '<p class="muted small" style="margin:0">Noch keine Sätze in den letzten 4 Wochen.</p>';
  const max = rows[0][1];
  return `<div class="hbars">${rows.map(([m, v]) => `<div class="hbar ${v < max * 0.15 ? 'weak' : ''}" data-tip="${MUSCLES[m]}: ${Math.round(v * 10) / 10} Sätze in 4 Wochen">
      <span class="wide">${MUSCLES[m]}</span><div class="track"><i style="width:${(v / max) * 100}%"></i></div><b>${Math.round(v)}</b></div>`).join('')}</div>
    <p class="muted small" style="margin:8px 0 0">Sätze der letzten 4 Wochen. Rot markiert = kaum trainiert.</p>`;
}

function records() {
  const keys = Object.keys(state.days).sort();
  let longest = 0, run = 0, prev = null;
  for (const k of keys) {
    if (missionDone(state.days[k], 'kcal')) { run = prev && addDays(prev, 1) === k ? run + 1 : 1; prev = k; longest = Math.max(longest, run); }
  }
  const trainings = keys.filter((k) => state.days[k].workout?.finished).length;
  const sets = keys.reduce((a, k) => a + (state.days[k].workout ? Object.values(state.days[k].workout.sets).reduce((x, s) => x + s.filter(Boolean).length, 0) : 0), 0);
  const kcal = keys.reduce((a, k) => a + (state.days[k].kcal || 0), 0);
  const steps = keys.reduce((a, k) => a + (state.days[k].steps || 0), 0);
  const prot = keys.reduce((a, k) => a + (state.days[k].protein || 0), 0);
  const perfect = keys.filter((k) => state.days[k].perfect).length;
  const minW = state.weights.length ? Math.min(...state.weights.map((e) => e.kg)) : state.profile.startWeight;
  const sinceDays = Math.round((parseKey(dayKey()) - parseKey(state.profile.startDate || dayKey())) / 864e5) + 1;
  const tiles = [
    ['📅', 'Tage dabei', fmtInt(sinceDays)],
    ['🔥', 'Längste Serie', `${longest} Tage`],
    ['🏋️', 'Trainings', fmtInt(trainings)],
    ['✅', 'Sätze gesamt', fmtInt(sets)],
    ['⭐', 'Perfekte Tage', fmtInt(perfect)],
    ['💜', 'Schon verloren', `${fmtKg(Math.max(0, state.profile.startWeight - minW))} kg`],
    ['👟', 'Gelaufen', steps ? `${fmtInt(steps * 0.0007)} km` : '–'],
    ['🥚', 'Protein gesamt', prot ? `${(prot / 1000).toLocaleString('de-DE', { maximumFractionDigits: 1 })} kg` : '–'],
  ];
  return `<div class="records">${tiles.map(([i, l, v]) => `<div class="rec"><span class="rec-i">${i}</span><b>${v}</b><small>${l}</small></div>`).join('')}</div>
    ${steps ? `<p class="muted small" style="margin:8px 0 0">Insgesamt ${fmtSteps(steps)} Schritte – das ist ungefähr von ${steps * 0.0007 > 300 ? 'Zürich nach Mailand 🇮🇹' : steps * 0.0007 > 100 ? 'einmal quer durch die Schweiz' : 'hier bis in die nächste Stadt'}! 💜</p>` : ''}`;
}

function recapList() {
  if (!state.profile) return '';
  const first = mondayOf(state.profile.startDate || dayKey());
  const cur = mondayOf(dayKey());
  const weeks = [];
  for (let m = addDays(cur, -7); m >= first && weeks.length < 8; m = addDays(m, -7)) weeks.push(m);
  const due = recapDue();
  if (due === cur) weeks.unshift(cur);
  if (!weeks.length) return '<p class="muted small" style="margin:0">Dein erster Rückblick erscheint am Sonntag ab 17 Uhr.</p>';
  return `<div class="recap-list">${weeks.map((m) => {
    const r = weekRecap(m);
    return `<button class="recap-item" data-recap="${m}"><span class="grade-mini grade-${r.grade[0]}">${r.grade[0]}</span>
      <span class="ri-main"><b>KW ${r.kw}</b><small>${fmtDate(m)} – ${fmtDate(r.sunday)}</small></span>
      <span class="ri-side">${r.delta != null ? (r.delta >= 0 ? '+' : '') + fmtKg(r.delta) + ' kg' : ''}<small>${r.goalDays}/7 · ${r.trainings} Tr.</small></span></button>`;
  }).join('')}</div>`;
}

function statsSections() {
  return `
  <section class="card"><h2>📊 Wochenrückblicke</h2>${recapList()}</section>
  <section class="card"><h2>🍽️ Kalorien – letzte 14 Tage</h2>${kcalChart14()}</section>
  <section class="card"><h2>👟 Schritte – letzte 14 Tage</h2>${stepsChart14()}</section>
  <section class="card"><h2>📆 Wochentag-Analyse</h2>${weekdayStats()}</section>
  <section class="card"><h2>💪 Kraftentwicklung</h2>${strengthStats()}</section>
  <section class="card"><h2>🏋️ Trainingsvolumen pro Woche</h2>${volumeStats()}</section>
  <section class="card"><h2>🧬 Muskelverteilung</h2>${muscleStats()}</section>
  <section class="card"><h2>🏅 Rekorde & Fun Facts</h2>${records()}</section>`;
}

function bindStats(root) {
  bindTips(root);
  root.querySelectorAll('[data-recap]').forEach((b) => b.addEventListener('click', () => openRecap(b.dataset.recap)));
}
