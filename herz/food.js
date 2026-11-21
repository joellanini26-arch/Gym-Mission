'use strict';

/* =========================================================
   Essen: Rezepte, Tagesplan passend zum Kalorienziel und
   „Was soll ich jetzt essen?“
   Nährwerte sind Richtwerte pro Portion (×1).
   ========================================================= */

// i: [Menge, Einheit, Zutat] – Menge null = nach Geschmack
const RECIPES = [
  // ---------- Smoothies ----------
  { id: 'sm-berry', name: 'Beeren-Protein-Smoothie', cat: 'shake', kcal: 345, p: 25, min: 3,
    i: [[300, 'ml', 'Haferdrink'], [150, 'g', 'TK-Beeren'], [30, 'g', 'veganes Proteinpulver (Vanille)'], [0.5, 'Stk', 'Banane']],
    s: ['Alles in den Mixer, 30 Sekunden mixen. TK-Beeren machen ihn cremig wie ein Milchshake.'] },
  { id: 'sm-choc', name: 'Schoko-Bananen-Shake', cat: 'shake', kcal: 295, p: 25, min: 3,
    i: [[300, 'ml', 'Mandeldrink ungesüßt'], [1, 'Stk', 'Banane (gefroren)'], [10, 'g', 'Backkakao'], [30, 'g', 'veganes Proteinpulver']],
    s: ['Alles mixen. Schmeckt nach Dessert – hat aber nur ~300 kcal.'] },
  { id: 'sm-green', name: 'Green Glow Smoothie', cat: 'shake', kcal: 330, p: 19, min: 4,
    i: [[250, 'ml', 'Haferdrink'], [1, 'Handvoll', 'Spinat'], [100, 'g', 'Mango (TK)'], [0.5, 'Stk', 'Apfel'], [10, 'g', 'Leinsamen'], [20, 'g', 'veganes Proteinpulver']],
    s: ['Alles mixen. Den Spinat schmeckt man nicht – versprochen.'] },

  // ---------- Frühstück ----------
  { id: 'oats', name: 'Overnight Oats (laktosefrei)', cat: 'breakfast', kcal: 360, p: 23, min: 5,
    i: [[50, 'g', 'Haferflocken'], [150, 'g', 'laktosefreier Skyr'], [100, 'ml', 'Haferdrink'], [100, 'g', 'Beeren'], [null, '', 'Zimt']],
    s: ['Abends Hafer, Skyr und Haferdrink in ein Glas, umrühren, ab in den Kühlschrank.', 'Morgens Beeren und Zimt drauf.'] },
  { id: 'eggs', name: 'Gemüse-Rührei mit Vollkornbrot', cat: 'breakfast', kcal: 395, p: 24, min: 10,
    i: [[3, 'Stk', 'Eier'], [1, 'Handvoll', 'Spinat'], [1, 'Stk', 'Tomate'], [1, 'TL', 'Olivenöl'], [1, 'Scheibe', 'Vollkornbrot'], [null, '', 'Salz, Pfeffer, Schnittlauch']],
    s: ['Spinat und Tomate in Öl kurz anbraten.', 'Verquirlte Eier dazu und langsam stocken lassen.', 'Mit dem Brot servieren.'] },
  { id: 'pancakes', name: 'Protein-Pancakes', cat: 'breakfast', kcal: 445, p: 29, min: 15,
    i: [[40, 'g', 'Haferflocken'], [2, 'Stk', 'Eier'], [0.5, 'Stk', 'Banane'], [15, 'g', 'veganes Proteinpulver'], [100, 'g', 'Beeren']],
    s: ['Hafer, Eier, Banane und Proteinpulver mixen.', 'In einer beschichteten Pfanne kleine Pancakes ausbacken.', 'Mit Beeren servieren – Herzform optional 💜'] },
  { id: 'chia', name: 'Mango-Chia-Pudding', cat: 'breakfast', kcal: 280, p: 17, min: 5,
    i: [[25, 'g', 'Chiasamen'], [200, 'ml', 'Kokosdrink'], [15, 'g', 'veganes Proteinpulver'], [100, 'g', 'Mango']],
    s: ['Chia, Kokosdrink und Proteinpulver verrühren, über Nacht quellen lassen.', 'Morgens Mangowürfel drauf.'] },

  // ---------- Hauptgerichte ----------
  { id: 'pan', name: 'Hähnchen-Gemüse-Pfanne', cat: 'main', kcal: 510, p: 45, min: 20,
    i: [[150, 'g', 'Hähnchenbrust'], [300, 'g', 'Pfannengemüse (Paprika, Brokkoli, Zucchini)'], [60, 'g', 'Reis (roh)'], [1, 'TL', 'Öl'], [2, 'EL', 'Sojasauce']],
    s: ['Reis kochen.', 'Hähnchen würfeln und in Öl anbraten.', 'Gemüse dazu, 5 Min. mitbraten, mit Sojasauce ablöschen.'] },
  { id: 'salmon', name: 'Lachs mit Ofengemüse', cat: 'main', kcal: 535, p: 37, min: 30,
    i: [[150, 'g', 'Lachsfilet'], [300, 'g', 'Ofengemüse (Kürbis, Paprika, Zwiebel)'], [150, 'g', 'Kartoffeln'], [null, '', 'Zitrone, Kräuter, Salz']],
    s: ['Gemüse und Kartoffeln würfeln, aufs Blech, 15 Min. bei 200 °C.', 'Lachs dazulegen, weitere 12 Min. backen.', 'Mit Zitrone beträufeln.'] },
  { id: 'zoodles', name: 'Zucchini-Bolognese', cat: 'main', kcal: 440, p: 39, min: 25,
    i: [[125, 'g', 'mageres Rinderhack (5 %)'], [200, 'g', 'Passierte Tomaten'], [1, 'Stk', 'große Zucchini (als Nudeln)'], [50, 'g', 'Vollkornnudeln (roh)'], [null, '', 'Zwiebel, Knoblauch, Oregano']],
    s: ['Hack mit Zwiebel und Knoblauch anbraten, Tomaten dazu, 10 Min. köcheln.', 'Nudeln kochen, Zucchini spiralisieren und die letzte Minute mitkochen.', 'Halb Nudeln, halb Zucchini = doppelte Portion, halbe Kalorien.'] },
  { id: 'tuna', name: 'Thunfisch-Kichererbsen-Bowl', cat: 'main', kcal: 390, p: 38, min: 10,
    i: [[1, 'Dose', 'Thunfisch im eigenen Saft'], [100, 'g', 'Kichererbsen (abgetropft)'], [0.25, 'Stk', 'Avocado'], [1, 'TL', 'Olivenöl'], [null, '', 'Gurke, Tomate, Rucola, Zitrone']],
    s: ['Gemüse schneiden, alles in eine Schüssel.', 'Mit Öl, Zitrone, Salz und Pfeffer anmachen.'] },
  { id: 'wrap', name: 'Puten-Hummus-Wrap', cat: 'main', kcal: 405, p: 35, min: 10,
    i: [[1, 'Stk', 'Vollkorn-Wrap'], [120, 'g', 'Putenbrust'], [30, 'g', 'Hummus'], [null, '', 'Salat, Gurke, Paprika']],
    s: ['Pute in Streifen braten.', 'Wrap mit Hummus bestreichen, alles einrollen.'] },
  { id: 'dal', name: 'Rotes Linsen-Curry', cat: 'main', kcal: 505, p: 22, min: 25,
    i: [[70, 'g', 'rote Linsen'], [100, 'ml', 'Kokosmilch light'], [200, 'g', 'gehackte Tomaten'], [1, 'Handvoll', 'Spinat'], [40, 'g', 'Reis (roh)'], [1, 'TL', 'Currypaste']],
    s: ['Linsen mit Tomaten, Kokosmilch und Currypaste 15 Min. köcheln.', 'Spinat unterrühren, mit Reis servieren.'] },
  { id: 'shakshuka', name: 'Shakshuka', cat: 'main', kcal: 475, p: 28, min: 20,
    i: [[3, 'Stk', 'Eier'], [400, 'g', 'gehackte Tomaten'], [1, 'Stk', 'Paprika'], [1, 'TL', 'Olivenöl'], [1, 'Scheibe', 'Vollkornbrot'], [null, '', 'Kreuzkümmel, Paprikapulver']],
    s: ['Paprika in Öl anbraten, Tomaten und Gewürze dazu, 10 Min. köcheln.', 'Mulden machen, Eier hineingleiten lassen, Deckel drauf, 6 Min. stocken lassen.'] },

  // ---------- Snacks ----------
  { id: 'apple', name: 'Apfel mit Erdnussmus', cat: 'snack', kcal: 170, p: 4, min: 2,
    i: [[1, 'Stk', 'Apfel'], [15, 'g', 'Erdnussmus']],
    s: ['Apfel in Spalten schneiden und dippen.'] },
  { id: 'skyr', name: 'Skyr-Beeren-Becher', cat: 'snack', kcal: 165, p: 22, min: 2,
    i: [[200, 'g', 'laktosefreier Skyr'], [100, 'g', 'Beeren'], [null, '', 'Zimt']],
    s: ['Alles in eine Schale. Perfekt gegen Süßhunger.'] },
  { id: 'edamame', name: 'Edamame mit Meersalz', cat: 'snack', kcal: 180, p: 16, min: 5,
    i: [[150, 'g', 'Edamame (TK)'], [null, '', 'Meersalz']],
    s: ['5 Min. kochen, salzen und aus der Schale knabbern.'] },
  { id: 'ricecake', name: 'Reiswaffeln mit Avocado & Ei', cat: 'snack', kcal: 200, p: 8, min: 10,
    i: [[2, 'Stk', 'Reiswaffeln'], [0.25, 'Stk', 'Avocado'], [1, 'Stk', 'gekochtes Ei'], [null, '', 'Chiliflocken']],
    s: ['Avocado auf die Waffeln, Eischeiben drauf, würzen.'] },
  { id: 'hummus', name: 'Gemüsesticks mit Hummus', cat: 'snack', kcal: 170, p: 5, min: 5,
    i: [[200, 'g', 'Karotten, Gurke, Paprika'], [50, 'g', 'Hummus']],
    s: ['Gemüse in Sticks schneiden und dippen. Knackig und sättigend.'] },
];

const CATS = { breakfast: 'Frühstück', main: 'Hauptgericht', snack: 'Snack', shake: 'Smoothie' };

// Tagesplan: Mahlzeiten mit Anteil am Kalorienziel
const SLOTS = [
  { id: 'breakfast', label: 'Frühstück', time: '08:00', cat: 'breakfast', share: 0.25 },
  { id: 'lunch', label: 'Mittagessen', time: '12:30', cat: 'main', share: 0.32 },
  { id: 'snack1', label: 'Snack', time: '16:00', cat: 'snack', share: 0.11 },
  { id: 'dinner', label: 'Abendessen', time: '19:00', cat: 'main', share: 0.32 },
]

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
    <summary class="rsum">
      <div class="rimg cat-${r.cat}" aria-hidden="true">${RECIPE_ART[r.id] || '🍽️'}</div>
      <div class="rtxt">
      <div class="spread"><b>${esc(r.name)}</b><span class="tag">${CATS[r.cat]}</span></div>
      <div class="muted small">${f !== 1 ? fmtPortion(f) + ' · ' : ''}${Math.round(r.kcal * f)} kcal · ${Math.round(r.p * f)} g Protein${r.min ? ' · ' + r.min + ' Min.' : ''}</div>
      </div>
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
  if (kcalLeft <= 120) return { text: `Für heute bist du im Ziel 💜 ${kcalLeft < 0 ? 'Ein bisschen drüber ist völlig okay.' : ''} Wenn noch Hunger kommt: etwas Leichtes mit viel Volumen.`, list: [recipeById('hummus'), recipeById('skyr')] };
  const cats = h < 10 ? ['breakfast', 'shake'] : h < 12 ? ['snack', 'shake'] : h < 15 ? ['main'] : h < 18 ? ['snack', 'shake'] : h < 21 ? ['main'] : ['snack'];
  const list = RECIPES.filter((r) => cats.includes(r.cat) && r.kcal <= kcalLeft + 50)
    .map((r) => ({ r, score: -r.p / r.kcal * 1000 + (protLeft > 30 ? 0 : 5) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((x) => x.r);
  const tod = h < 10 ? 'Morgens' : h < 12 ? 'Vormittags' : h < 15 ? 'Mittags' : h < 18 ? 'Nachmittags' : h < 21 ? 'Abends' : 'Spät abends';
  return {
    text: `Du hast heute noch <b>${kcalLeft} kcal</b> übrig${protLeft > 0 ? ` und brauchst noch <b>${protLeft} g Protein</b>` : ''}. ${tod} passt gut (viel Protein, macht lange satt):`,
    list: list.length ? list : [recipeById('skyr')],
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
    <p class="muted small" style="margin:10px 0 0">Wenn du Kalorien per Kurzbefehl aus Apple Health holst, überschreibt der Sync die Werte – dann nur abhaken, nicht doppelt zählen.</p>
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
    <h2>🧠 7 Regeln für gesundes Abnehmen</h2>
    <ol class="list small">
      <li><b>Kein Hungern.</b> Ein kleines Defizit (300–500 kcal) reicht völlig und hält auf Dauer.</li>
      <li><b>Protein zu jeder Mahlzeit.</b> Macht satt und sorgt dafür, dass du Fett statt Muskeln verlierst.</li>
      <li><b>Halber Teller Gemüse.</b> Viel Volumen, wenig Kalorien.</li>
      <li><b>Kalorien nicht trinken.</b> Wasser, Tee, Kaffee mit Haferdrink statt Saft und Latte.</li>
      <li><b>Laktosefrei clever:</b> laktosefreier Skyr, Haferdrink, Sojajoghurt, Hummus statt Käse-Dip.</li>
      <li><b>Bewegung im Alltag.</b> 8.000 Schritte bringen oft mehr als ein extra Workout.</li>
      <li><b>80/20-Regel.</b> 80 % bewusst, 20 % Genuss – Schokolade ist erlaubt 🍫</li>
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
    if (m.eaten) { addXp(5, '🍽️ Mahlzeit'); confetti(24); }
    else addXp(-5);
    save(); render();
  }));

  document.querySelectorAll('[data-eat-now]').forEach((b) => b.addEventListener('click', () => {
    const r = recipeById(b.dataset.eatNow);
    markEaten(k, r.kcal, r.p, true);
    confetti(30);
    toast(`+${r.kcal} kcal eingetragen`);
    save(); render();
  }));

  document.querySelectorAll('[data-fcat]').forEach((b) => b.addEventListener('click', () => { foodFilter = b.dataset.fcat; render(); }));
}
