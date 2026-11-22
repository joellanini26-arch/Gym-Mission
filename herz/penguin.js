'use strict';

/* =========================================================
   🐧 Pinguin-Pärchen: flauschige Babypinguine (eigene Zeichnung)
   Sie: mit rosa Schleife · Er: ohne
   Koordinatensystem: 60 × 64, Mitte bei x = 30
   ========================================================= */

const PG_DEFS = `<defs>
  <radialGradient id="pgBody" cx=".45" cy=".35" r=".75"><stop offset="0" stop-color="#d6d8de"/><stop offset=".7" stop-color="#a9adb7"/><stop offset="1" stop-color="#8d919c"/></radialGradient>
  <radialGradient id="pgHead" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#4a4d56"/><stop offset="1" stop-color="#22242a"/></radialGradient>
  <linearGradient id="pgFace" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e9e6ee"/></linearGradient>
</defs>`;

const PG_HER = 'Salome';
const PG_HIM = 'Joël';

// mood: happy (Augen offen) · proud (^^) · sleepy (Augen zu + Zzz) · love (Herzaugen)
function penguinG({ bow = false, mood = 'happy', wave = false, heart = false } = {}) {
  const eyes = {
    happy: `<g class="pg-eyes"><ellipse cx="22.5" cy="27" rx="2.6" ry="3.3" fill="#18181c"/><ellipse cx="37.5" cy="27" rx="2.6" ry="3.3" fill="#18181c"/>
      <circle cx="23.4" cy="25.8" r=".9" fill="#fff"/><circle cx="38.4" cy="25.8" r=".9" fill="#fff"/></g>`,
    proud: `<path d="M19.5,28 Q22.5,24 25.5,28 M34.5,28 Q37.5,24 40.5,28" fill="none" stroke="#18181c" stroke-width="1.6" stroke-linecap="round"/>`,
    sleepy: `<path d="M19.5,27 Q22.5,29.5 25.5,27 M34.5,27 Q37.5,29.5 40.5,27" fill="none" stroke="#18181c" stroke-width="1.5" stroke-linecap="round"/>
      <text x="46" y="10" class="pg-z" font-size="8" fill="#f5eefc" font-weight="700">z</text><text x="51" y="4" class="pg-z z2" font-size="6" fill="#f5eefc" font-weight="700">z</text>`,
    love: `<path d="M22.5,30 C19,27 19.5,23.5 22.5,25.5 C25.5,23.5 26,27 22.5,30 Z M37.5,30 C34,27 34.5,23.5 37.5,25.5 C40.5,23.5 41,27 37.5,30 Z" fill="#f472b6"/>`,
  }[mood];
  const flipL = wave
    ? `<path class="pg-wave" d="M10,40 Q1,30 4,22 Q9,28 14,36 Z" fill="#7e828d"/>`
    : `<path d="M10,38 Q2,46 7,55 Q12,49 14,42 Z" fill="#7e828d"/>`;
  const flipR = heart
    ? `<path d="M50,38 Q46,44 40,47 Q44,50 49,47 Z" fill="#7e828d"/>`
    : `<path d="M50,38 Q58,46 53,55 Q48,49 46,42 Z" fill="#7e828d"/>`;
  return `<g class="pg">
    <ellipse cx="30" cy="61" rx="15" ry="2.6" fill="rgba(0,0,0,.18)"/>
    <ellipse cx="23" cy="59" rx="5" ry="2.4" fill="#3c3f47"/><ellipse cx="37" cy="59" rx="5" ry="2.4" fill="#3c3f47"/>
    ${flipL}${flipR}
    <ellipse cx="30" cy="42" rx="21" ry="18.5" fill="url(#pgBody)"/>
    <ellipse cx="30" cy="47" rx="13" ry="10.5" fill="#e4e6eb" opacity=".55"/>
    <circle cx="30" cy="24" r="18.5" fill="url(#pgHead)"/>
    <path d="M30,21.5 C23,11.5 12,15 12.5,26.5 C13,36 21.5,40 30,38.5 C38.5,40 47,36 47.5,26.5 C48,15 37,11.5 30,21.5 Z" fill="url(#pgFace)"/>
    ${eyes}
    <ellipse cx="17.8" cy="32" rx="3.4" ry="2.2" fill="#f9a8c9" opacity=".75"/><ellipse cx="42.2" cy="32" rx="3.4" ry="2.2" fill="#f9a8c9" opacity=".75"/>
    <path d="M26.5,30.5 Q30,28.5 33.5,30.5 Q31.5,35.5 30,35.5 Q28.5,35.5 26.5,30.5 Z" fill="#2b2d33"/>
    ${heart ? `<path class="pg-heart" d="${heartPath(30, 46, 7)}" fill="#f472b6" stroke="#fff" stroke-width="1"/>` : ''}
    ${bow ? `<g class="pg-bow" transform="translate(41,8) rotate(18)"><path d="M0,0 L-8,-5 Q-10,0 -8,5 Z M0,0 L8,-5 Q10,0 8,5 Z" fill="#f9b4cb" stroke="#e78fae" stroke-width=".8"/><circle r="2.3" fill="#f39abb"/></g>` : ''}
  </g>`;
}

// Eigenständiges SVG (z. B. Coach-Avatar, Brief, Workout)
function penguinIcon(opts = {}, cls = '') {
  return `<svg class="pg-svg ${cls}" viewBox="-2 -4 64 70" aria-hidden="true">${PG_DEFS}${penguinG(opts)}</svg>`;
}

// Der Pinguin hüpft bei großen Erfolgen einmal quer über den Bildschirm
// Salome hüpft vorneweg, Joël hüpft hinterher
function penguinHop() {
  if (typeof REDUCED_MOTION !== 'undefined' && REDUCED_MOTION) return;
  [[{ bow: true, mood: 'proud', wave: true }, 0], [{ mood: 'love', wave: true }, 350]].forEach(([opts, delay]) => {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'pg-hop';
      el.innerHTML = penguinIcon(opts);
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2600);
    }, delay);
  });
}
