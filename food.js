'use strict';

/* =========================================================
   Essen: Rezepte, Tagesplan passend zum Kalorienziel und
   „Was soll ich jetzt essen?“
   Nährwerte sind Richtwerte pro Portion (×1).
   ========================================================= */

// i: [Menge, Einheit, Zutat] – Menge null = nach Geschmack
const RECIPES = [
  // ---------- Shakes ----------
  { id: 'shake-classic', name: 'Masse-Shake Klassiker', cat: 'shake', kcal: 1030, p: 61, min: 3,
    i: [[500, 'ml', 'Vollmilch'], [80, 'g', 'Haferflocken (zart)'], [1, 'Stk', 'Banane'], [30, 'g', 'Erdnussbutter'], [30, 'g', 'Whey (Vanille/Schoko)']],
    s: ['Alles in den Mixer, 30 Sekunden mixen.', 'Langsam über 10–15 Minuten trinken, wenn er zu viel ist.'] },
  { id: 'shake-choc', name: 'Schoko-Erdnuss-Shake (ohne Whey)', cat: 'shake', kcal: 815, p: 42, min: 3,
    i: [[400, 'ml', 'Vollmilch'], [30, 'g', 'Kakaopulver (z. B. Kaba)'], [40, 'g', 'Erdnussbutter'], [1, 'Stk', 'Banane'], [150, 'g', 'Skyr']],
    s: ['Alles mixen. Schmeckt wie ein Milchshake – gefährlich gut.'] },
  { id: 'shake-berry', name: 'Beeren-Hafer-Shake', cat: 'shake', kcal: 955, p: 54, min: 3,
    i: [[400, 'ml', 'Vollmilch'], [60, 'g', 'Haferflocken'], [150, 'g', 'TK-Beeren'], [200, 'g', 'Griechischer Joghurt 10 %'], [30, 'g', 'Whey'], [1, 'EL', 'Honig']],
    s: ['Alles mixen. TK-Beeren machen ihn schön kalt und cremig.'] },

  // ---------- Frühstück ----------
  { id: 'oats', name: 'Overnight Oats Deluxe', cat: 'breakfast', kcal: 1015, p: 45, min: 5,
    i: [[100, 'g', 'Haferflocken'], [300, 'ml', 'Vollmilch'], [150, 'g', 'Skyr'], [30, 'g', 'Nüsse (gehackt)'], [1, 'Stk', 'Banane'], [1, 'EL', 'Honig']],
    s: ['Abends Hafer, Milch und Skyr in ein Glas, umrühren, in den Kühlschrank.', 'Morgens Banane, Nüsse und Honig drauf. Fertig – kein Kochen am Morgen.'] },
  { id: 'eggs', name: 'Rührei-Toast mit Käse & Avocado', cat: 'breakfast', kcal: 900, p: 47, min: 10,
    i: [[4, 'Stk', 'Eier'], [10, 'g', 'Butter'], [3, 'Scheiben', 'Vollkorntoast'], [50, 'g', 'Käse (gerieben)'], [0.5, 'Stk', 'Avocado'], [null, '', 'Salz, Pfeffer']],
    s: ['Eier verquirlen, in Butter bei mittlerer Hitze stocken lassen, Käse unterrühren.', 'Toast rösten, mit Avocado belegen, Rührei drauf.'] },
  { id: 'pancakes', name: 'Bananen-Hafer-Pancakes', cat: 'breakfast', kcal: 910, p: 41, min: 15,
    i: [[80, 'g', 'Haferflocken'], [2, 'Stk', 'Eier'], [1, 'Stk', 'Banane'], [150, 'ml', 'Milch'], [100, 'g', 'Quark'], [10, 'g', 'Öl'], [2, 'EL', 'Ahornsirup']],
    s: ['Hafer, Eier, Banane, Milch und Quark mixen.', 'In Öl kleine Pancakes ausbacken (ca. 2 Min. pro Seite).', 'Mit Ahornsirup servieren.'] },
  { id: 'muesli', name: 'Knuspermüsli-Bowl', cat: 'breakfast', kcal: 845, p: 26, min: 2,
    i: [[100, 'g', 'Knuspermüsli'], [250, 'g', 'Joghurt 3,5 %'], [200, 'ml', 'Vollmilch'], [1, 'Stk', 'Banane']],
    s: ['Alles in eine große Schüssel. Perfekt, wenn du morgens keinen Hunger hast.'] },

  // ---------- Hauptgerichte ----------
  { id: 'bolo', name: 'Spaghetti Bolognese XXL', cat: 'main', kcal: 1320, p: 71, min: 25,
    i: [[150, 'g', 'Spaghetti (roh)'], [200, 'g', 'Rinderhack'], [200, 'g', 'Passierte Tomaten'], [1, 'EL', 'Olivenöl'], [0.5, 'Stk', 'Zwiebel'], [30, 'g', 'Parmesan'], [null, '', 'Salz, Pfeffer, Oregano']],
    s: ['Nudeln kochen.', 'Zwiebel in Öl anbraten, Hack dazu und krümelig braten.', 'Tomaten dazu, 10 Min. köcheln, würzen.', 'Mit Parmesan servieren. Tipp: doppelte Menge kochen = Essen für morgen.'] },
  { id: 'bowl', name: 'Teriyaki-Chicken-Reis-Bowl', cat: 'main', kcal: 975, p: 57, min: 20,
    i: [[120, 'g', 'Reis (roh)'], [200, 'g', 'Hähnchenbrust'], [1, 'EL', 'Öl'], [0.5, 'Stk', 'Avocado'], [50, 'g', 'Mais'], [2, 'EL', 'Teriyaki-Sauce']],
    s: ['Reis kochen.', 'Hähnchen würfeln, in Öl braten, mit Teriyaki ablöschen.', 'Alles in eine Schüssel, Avocado und Mais drauf.'] },
  { id: 'salmon', name: 'Lachs mit Butterkartoffeln', cat: 'main', kcal: 900, p: 52, min: 25,
    i: [[200, 'g', 'Lachsfilet'], [400, 'g', 'Kartoffeln'], [20, 'g', 'Butter'], [150, 'g', 'Brokkoli'], [null, '', 'Salz, Zitrone']],
    s: ['Kartoffeln kochen (20 Min.), Brokkoli die letzten 5 Min. mit in den Topf.', 'Lachs 3–4 Min. pro Seite braten.', 'Kartoffeln in Butter schwenken.'] },
  { id: 'wraps', name: 'Chicken-Käse-Wraps', cat: 'main', kcal: 1080, p: 78, min: 15,
    i: [[3, 'Stk', 'Weizen-Wraps'], [200, 'g', 'Hähnchenbrust'], [60, 'g', 'Käse (gerieben)'], [3, 'EL', 'Sour Cream'], [null, '', 'Salat, Tomate, Paprika']],
    s: ['Hähnchen in Streifen braten und würzen.', 'Wraps mit Sour Cream bestreichen, alles einrollen.', 'Kurz in der Pfanne anrösten, damit der Käse schmilzt.'] },
  { id: 'chili', name: 'Chili con Carne mit Reis', cat: 'main', kcal: 1195, p: 54, min: 30,
    i: [[150, 'g', 'Rinderhack'], [250, 'g', 'Kidneybohnen (abgetropft)'], [200, 'g', 'Gehackte Tomaten'], [70, 'g', 'Mais'], [100, 'g', 'Reis (roh)'], [1, 'EL', 'Öl'], [null, '', 'Chili, Paprikapulver, Kreuzkümmel']],
    s: ['Hack in Öl anbraten, würzen.', 'Tomaten, Bohnen, Mais dazu, 15 Min. köcheln.', 'Mit Reis servieren. Hält 3 Tage im Kühlschrank – ideal zum Vorkochen.'] },
  { id: 'curry', name: 'Hähnchen-Kokos-Curry', cat: 'main', kcal: 1060, p: 60, min: 25,
    i: [[200, 'g', 'Hähnchenbrust'], [200, 'ml', 'Kokosmilch'], [120, 'g', 'Reis (roh)'], [1, 'Stk', 'Paprika'], [1, 'EL', 'Currypaste']],
    s: ['Reis kochen.', 'Hähnchen anbraten, Paprika und Currypaste dazu.', 'Mit Kokosmilch ablöschen, 10 Min. köcheln.'] },
  { id: 'carbonara', name: 'Spaghetti Carbonara', cat: 'main', kcal: 1150, p: 60, min: 15,
    i: [[150, 'g', 'Spaghetti (roh)'], [80, 'g', 'Speckwürfel'], [2, 'Stk', 'Eier + 1 Eigelb'], [40, 'g', 'Parmesan'], [null, '', 'Pfeffer']],
    s: ['Nudeln kochen, etwas Nudelwasser aufheben.', 'Speck knusprig braten.', 'Eier mit Parmesan verrühren.', 'Pfanne vom Herd, Nudeln + Eiermasse + Schuss Nudelwasser schnell verrühren.'] },

  // ---------- Snacks ----------
  { id: 'trail', name: 'Studentenfutter', cat: 'snack', kcal: 380, p: 10, min: 0,
    i: [[80, 'g', 'Studentenfutter']],
    s: ['Immer eine Tüte in der Tasche haben. Zwischendurch eine Handvoll.'] },
  { id: 'pbbread', name: 'Erdnussbutter-Bananen-Brot', cat: 'snack', kcal: 585, p: 19, min: 3,
    i: [[2, 'Scheiben', 'Vollkornbrot'], [40, 'g', 'Erdnussbutter'], [1, 'Stk', 'Banane'], [1, 'TL', 'Honig']],
    s: ['Brot mit Erdnussbutter bestreichen, Bananenscheiben drauf, Honig drüber.'] },
  { id: 'quark', name: 'Quark-Bowl vor dem Schlafen', cat: 'snack', kcal: 460, p: 36, min: 2,
    i: [[250, 'g', 'Magerquark'], [30, 'g', 'Nüsse'], [1, 'EL', 'Honig'], [100, 'g', 'Beeren']],
    s: ['Alles verrühren. Casein im Quark versorgt die Muskeln über Nacht.'] },
  { id: 'cheesebread', name: 'Käsebrot XXL', cat: 'snack', kcal: 765, p: 32, min: 3,
    i: [[3, 'Scheiben', 'Brot'], [20, 'g', 'Butter'], [80, 'g', 'Gouda']],
    s: ['Klassiker. Schnell, überall machbar, viele Kalorien.'] },
  { id: 'granola', name: 'Griechischer Joghurt mit Granola', cat: 'snack', kcal: 560, p: 13, min: 2,
    i: [[200, 'g', 'Griechischer Joghurt 10 %'], [60, 'g', 'Granola'], [1, 'EL', 'Honig']],
    s: ['Joghurt in eine Schüssel, Granola und Honig drüber.'] },
];

const CATS = { breakfast: 'Frühstück', main: 'Hauptgericht', snack: 'Snack', shake: 'Shake' };

// Tagesplan: Mahlzeiten mit Anteil am Kalorienziel
const SLOTS = [
  { id: 'breakfast', label: 'Frühstück', time: '07:30', cat: 'breakfast', share: 0.22 },
  { id: 'snack1', label: 'Snack Vormittag', time: '10:30', cat: 'snack', share: 0.12 },
  { id: 'lunch', label: 'Mittagessen', time: '13:00', cat: 'main', share: 0.25 },
  { id: 'shake', label: 'Shake (nach Training / Nachmittag)', time: '16:30', cat: 'shake', share: 0.17 },
  { id: 'dinner', label: 'Abendessen', time: '19:30', cat: 'main', share: 0.24 },
];

let foodFilter = 'all';

// ---------- Hilfen ----------

function seededPick(arr, seed) {
  // einfacher deterministischer Zufall, damit der Plan pro Tag stabil bleibt
  const x = Math.sin(seed) * 10000;
  return arr[Math.floor((x - Math.floor(x)) * arr.length)];
}

function portionFor(recipe, kcal) {
  return clamp(Math.round((kcal / recipe.kcal) * 4) / 4, 0.5, 1.5);
}

function fmtPortion(f) {
  const m = { 0.5: '½', 0.75: '¾', 1: '1', 1.25: '1¼', 1.5: '1½' };
  return (m[f] || f) + ' Portion';
}

function fmtQty(q, unit, f) {
  if (q == null) return '';
  let v = q * f;
  if (unit === 'g' || unit === 'ml') v = Math.round(v / 5) * 5;
  else v = Math.round(v * 2) / 2;
  const s = String(v).replace('.5', ',5').replace(/^0,5$/, '½').replace(/^(\d+),5$/, '$1½');
  return `${s} ${unit}`.trim();
}

function recipeById(id) { return RECIPES.find((r) => r.id === id); }

function mealPlan(k) {
  const d = day(k);
  if (!d.plan) {
    const seed = hashDay(k) + (state.planShuffle || 0) * 97;
    const used = new Set();
    d.plan = SLOTS.map((slot, i) => {
      const pool = RECIPES.filter((r) => r.cat === slot.cat && !used.has(r.id));
      const r = seededPick(pool, seed + i * 13);
      used.add(r.id);
      return { slot: slot.id, id: r.id, f: portionFor(r, state.profile.kcalTarget * slot.share), eaten: false };
    });
  }
  return d.plan;
}

function markEaten(k, kcal, protein, on) {
  const d = day(k);
  const sign = on ? 1 : -1;
  setNutrition(k, Math.max(0, (d.kcal || 0) + sign * kcal), Math.max(0, (d.protein || 0) + sign * protein));
}

// ---------- Ansichten ----------

function recipeCard(r, f = 1, extra = '') {
  return `<details class="recipe">
    <summary>
      <div class="spread"><b>${esc(r.name)}</b><span class="tag">${CATS[r.cat]}</span></div>
      <div class="muted small">${f !== 1 ? fmtPortion(f) + ' · ' : ''}${Math.round(r.kcal * f)} kcal · ${Math.round(r.p * f)} g Protein${r.min ? ' · ' + r.min + ' Min.' : ''}</div>
    </summary>
    <h4>Zutaten${f !== 1 ? ` (für ${fmtPortion(f)})` : ''}</h4>
    <ul class="list small">${r.i.map(([q, u, n]) => `<li>${q != null ? `<b>${fmtQty(q, u, f)}</b> ` : ''}${esc(n)}</li>`).join('')}</ul>
    <h4>Zubereitung</h4>
    <ol class="list small">${r.s.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
    ${extra}
  </details>`;
}

function suggestNow() {
  const p = state.profile;
  const d = day();
  const kcalLeft = p.kcalTarget - (d.kcal || 0);
  const protLeft = p.proteinTarget - (d.protein || 0);
  const h = new Date().getHours();
  if (kcalLeft <= 0) return { text: `Kalorienziel erreicht! 🎉 ${protLeft > 0 ? `Nur noch ${protLeft} g Protein – eine Quark-Bowl wäre perfekt.` : 'Alles erledigt für heute.'}`, list: protLeft > 0 ? [recipeById('quark')] : [] };

  const cats = h < 10 ? ['breakfast', 'shake'] : h < 12 ? ['snack', 'shake'] : h < 15 ? ['main'] : h < 18 ? ['shake', 'snack'] : h < 21 ? ['main'] : ['snack', 'shake'];
  const proteinHeavy = protLeft > 0 && protLeft / Math.max(kcalLeft, 1) > 0.05;
  const list = RECIPES.filter((r) => cats.includes(r.cat))
    .map((r) => ({ r, score: Math.abs(r.kcal - Math.min(kcalLeft, 1100)) - (proteinHeavy ? r.p * 6 : 0) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((x) => x.r);
  const tod = h < 10 ? 'Morgens' : h < 12 ? 'Vormittags' : h < 15 ? 'Mittags' : h < 18 ? 'Nachmittags' : h < 21 ? 'Abends' : 'Spät abends';
  return {
    text: `Dir fehlen heute noch <b>${kcalLeft} kcal</b>${protLeft > 0 ? ` und <b>${protLeft} g Protein</b>` : ''}. ${tod} passt gut:`,
    list,
  };
}

function viewFood() {
  const k = dayKey();
  const p = state.profile;
  const plan = mealPlan(k);
  const totalK = plan.reduce((a, m) => a + recipeById(m.id).kcal * m.f, 0);
  const totalP = plan.reduce((a, m) => a + recipeById(m.id).p * m.f, 0);
  const now = suggestNow();
  const filtered = RECIPES.filter((r) => foodFilter === 'all' || r.cat === foodFilter);

  return `
  <section class="card coach">
    <h2>🤔 Was soll ich jetzt essen?</h2>
    <p class="small" style="margin-top:0">${now.text}</p>
    ${now.list.map((r) => recipeCard(r, 1, `<button class="btn small" data-eat-now="${r.id}">✓ Gegessen (+${r.kcal} kcal)</button>`)).join('')}
  </section>

  <section class="card">
    <div class="spread">
      <h2 style="margin:0">📅 Dein Essensplan heute</h2>
      <button class="btn ghost small" id="shuffle">🔀 Neu</button>
    </div>
    <p class="muted small">≈ ${Math.round(totalK)} kcal · ${Math.round(totalP)} g Protein – passend zu deinem Ziel (${p.kcalTarget} kcal). Abhaken, wenn gegessen.</p>
    ${plan.map((m) => {
      const slot = SLOTS.find((s) => s.id === m.slot);
      const r = recipeById(m.id);
      return `<div class="meal ${m.eaten ? 'done' : ''}">
        <div class="check" data-meal="${m.slot}"><div class="box">${m.eaten ? '✓' : ''}</div>
          <div class="label"><span class="muted small">${slot.time} · ${slot.label}</span></div></div>
        ${recipeCard(r, m.f)}
      </div>`;
    }).join('')}
    <p class="muted small" style="margin:10px 0 0">Wenn du in YAZIO trackst und per Kurzbefehl synchronisierst, überschreibt der Sync die Werte – dann einfach nur abhaken, nicht doppelt zählen.</p>
  </section>

  <section class="card">
    <h2>🛒 Einkaufsliste für den Plan</h2>
    ${shoppingList(plan)}
  </section>

  <section class="card">
    <h2>📖 Alle Rezepte</h2>
    <div class="seg" style="margin-bottom:10px;width:max-content;max-width:100%;overflow-x:auto">
      ${[['all', 'Alle'], ...Object.entries(CATS)].map(([id, l]) => `<button data-fcat="${id}" class="${foodFilter === id ? 'on' : ''}">${l}</button>`).join('')}
    </div>
    ${filtered.map((r) => recipeCard(r, 1, `<button class="btn ghost small" data-eat-now="${r.id}">✓ Gegessen (+${r.kcal} kcal)</button>`)).join('')}
  </section>

  <section class="card">
    <h2>🧠 Die 7 Regeln fürs Zunehmen</h2>
    <ol class="list small">
      <li><b>Essen nach Uhr, nicht nach Hunger.</b> 5 Mahlzeiten, alle 3 Stunden. Stell dir Wecker.</li>
      <li><b>Flüssige Kalorien.</b> Ein Shake mit 800–1000 kcal ist leichter als ein drittes Abendessen.</li>
      <li><b>Kaloriendichte Zutaten:</b> Öl, Butter, Nüsse, Erdnussbutter, Käse, Vollmilch, Haferflocken, Reis, Nudeln.</li>
      <li><b>Fett ist dein Freund.</b> 1 EL Olivenöl extra über jedes Essen = +120 kcal ohne mehr Volumen.</li>
      <li><b>Vorkochen.</b> Sonntags Chili oder Bolognese für 3 Tage – dann gibt es keine Ausrede.</li>
      <li><b>Nicht viel trinken während des Essens.</b> Wasser füllt den Magen. Lieber zwischen den Mahlzeiten.</li>
      <li><b>Protein ~2 g pro kg</b>, der Rest kommt aus Kohlenhydraten und Fett. Kalorien sind wichtiger als „sauber“.</li>
    </ol>
  </section>`;
}

function shoppingList(plan) {
  const items = {};
  for (const m of plan) {
    for (const [q, u, n] of recipeById(m.id).i) {
      const key = n + '|' + u;
      if (!items[key]) items[key] = { n, u, q: 0, free: q == null };
      if (q != null) items[key].q += q * m.f;
    }
  }
  return `<ul class="list small shop">${Object.values(items).sort((a, b) => a.n.localeCompare(b.n, 'de'))
    .map((x) => `<li>${x.free ? '' : `<b>${fmtQty(x.q, x.u, 1)}</b> `}${esc(x.n)}</li>`).join('')}</ul>`;
}

function bindFood() {
  const k = dayKey();
  $('#shuffle').addEventListener('click', () => {
    const d = day(k);
    if (d.plan && d.plan.some((m) => m.eaten)) {
      // bereits gegessene Mahlzeiten behalten
      const keep = d.plan.filter((m) => m.eaten);
      state.planShuffle = (state.planShuffle || 0) + 1;
      d.plan = null;
      const fresh = mealPlan(k);
      d.plan = fresh.map((m) => keep.find((x) => x.slot === m.slot) || m);
    } else {
      state.planShuffle = (state.planShuffle || 0) + 1;
      d.plan = null;
      mealPlan(k);
    }
    save(); render();
  });

  document.querySelectorAll('[data-meal]').forEach((el) => el.addEventListener('click', () => {
    const m = day(k).plan.find((x) => x.slot === el.dataset.meal);
    const r = recipeById(m.id);
    m.eaten = !m.eaten;
    markEaten(k, Math.round(r.kcal * m.f), Math.round(r.p * m.f), m.eaten);
    if (m.eaten) addXp(5, '🍽️ Mahlzeit');
    else addXp(-5);
    save(); render();
  }));

  document.querySelectorAll('[data-eat-now]').forEach((b) => b.addEventListener('click', () => {
    const r = recipeById(b.dataset.eatNow);
    markEaten(k, r.kcal, r.p, true);
    toast(`+${r.kcal} kcal eingetragen`);
    save(); render();
  }));

  document.querySelectorAll('[data-fcat]').forEach((b) => b.addEventListener('click', () => { foodFilter = b.dataset.fcat; render(); }));
}
