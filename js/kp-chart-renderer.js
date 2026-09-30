/**
 * KP Chart Renderer
 * High-definition SVG renderer for South Indian and North Indian Chart formats
 */

import { SIGNS, PLANETS } from './kp-constants.js';

// South Indian chart sign grid positions (0-indexed col, row)
// 12 signs in standard South Indian square:
// Top row: Pisces(11), Aries(0), Taurus(1), Gemini(2)
// Right col: Cancer(3), Leo(4)
// Bottom row: Virgo(5), Libra(6), Scorpio(7), Sagittarius(8) - actually bottom row in reverse or standard:
// Row 0: 11 (Pisces), 0 (Aries), 1 (Taurus), 2 (Gemini)
// Row 1: 10 (Aquarius), [center], [center], 3 (Cancer)
// Row 2: 9 (Capricorn), [center], [center], 4 (Leo)
// Row 3: 8 (Sagittarius), 7 (Scorpio), 6 (Libra), 5 (Virgo)
const SOUTH_INDIAN_SIGN_GRID = [
  { signIdx: 0, r: 0, c: 1 },  // Aries (மேஷம்)
  { signIdx: 1, r: 0, c: 2 },  // Taurus (ரிஷபம்)
  { signIdx: 2, r: 0, c: 3 },  // Gemini (மிதுனம்)
  { signIdx: 3, r: 1, c: 3 },  // Cancer (கடகம்)
  { signIdx: 4, r: 2, c: 3 },  // Leo (சிம்மம்)
  { signIdx: 5, r: 3, c: 3 },  // Virgo (கன்னி)
  { signIdx: 6, r: 3, c: 2 },  // Libra (துலாம்)
  { signIdx: 7, r: 3, c: 1 },  // Scorpio (விருச்சிகம்)
  { signIdx: 8, r: 3, c: 0 },  // Sagittarius (தனுசு)
  { signIdx: 9, r: 2, c: 0 },  // Capricorn (மகரம்)
  { signIdx: 10, r: 1, c: 0 }, // Aquarius (கும்பம்)
  { signIdx: 11, r: 0, c: 0 }  // Pisces (மீனம்)
];

export function renderSouthIndianChart(chart, containerId, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const width = options.width || 420;
  const height = options.height || 420;
  const cellSize = width / 4;

  const { cusps, planets } = chart;

  // Group items by sign (0 to 11)
  const signItems = Array.from({ length: 12 }, () => ({ cusps: [], planets: [] }));

  cusps.forEach(c => {
    signItems[c.signIdx].cusps.push(c);
  });

  planets.forEach(p => {
    signItems[p.signIdx].planets.push(p);
  });

  let svgHtml = `
    <svg viewBox="0 0 ${width} ${height}" class="kp-south-chart" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(147, 51, 234, 0.15)" />
          <stop offset="100%" stop-color="rgba(15, 23, 42, 0.95)" />
        </radialGradient>
        <linearGradient id="cellBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="rgba(30, 41, 59, 0.85)" />
          <stop offset="100%" stop-color="rgba(15, 23, 42, 0.95)" />
        </linearGradient>
      </defs>

      <!-- Main Border -->
      <rect x="0" y="0" width="${width}" height="${height}" fill="url(#cellBg)" stroke="#3b82f6" stroke-width="2" rx="8" />

      <!-- Center Box -->
      <rect x="${cellSize}" y="${cellSize}" width="${cellSize * 2}" height="${cellSize * 2}" fill="url(#centerGlow)" stroke="#6366f1" stroke-width="1.5" rx="4" />

      <!-- Center Title Info -->
      <text x="${width / 2}" y="${height / 2 - 18}" text-anchor="middle" fill="#f8fafc" font-size="14" font-weight="700" letter-spacing="1">
        KP ASTRO PRO
      </text>
      <text x="${width / 2}" y="${height / 2 + 4}" text-anchor="middle" fill="#38bdf8" font-size="12" font-weight="500">
        பிளாசிடஸ் பாவ சக்கரம்
      </text>
      <text x="${width / 2}" y="${height / 2 + 24}" text-anchor="middle" fill="#94a3b8" font-size="10">
        அயனாம்சம்: ${chart.ayanamsaStr || ''}
      </text>
  `;

  // Draw Grid Lines
  for (let i = 1; i < 4; i++) {
    // Horizontal lines outside center
    svgHtml += `<line x1="0" y1="${i * cellSize}" x2="${width}" y2="${i * cellSize}" stroke="rgba(148, 163, 184, 0.3)" stroke-width="1" />`;
    // Vertical lines
    svgHtml += `<line x1="${i * cellSize}" y1="0" x2="${i * cellSize}" y2="${height}" stroke="rgba(148, 163, 184, 0.3)" stroke-width="1" />`;
  }

  // Draw Each Sign Cell
  SOUTH_INDIAN_SIGN_GRID.forEach(({ signIdx, r, c }) => {
    const x = c * cellSize;
    const y = r * cellSize;
    const sign = SIGNS[signIdx];
    const data = signItems[signIdx];

    // Sign Name Label
    svgHtml += `
      <g class="sign-cell" data-sign="${sign.name}">
        <text x="${x + 6}" y="${y + 14}" fill="#64748b" font-size="10" font-weight="600">
          ${sign.tamil}
        </text>
    `;

    // Render Cusps in this sign
    let textY = y + 28;
    data.cusps.forEach(csp => {
      const isLagna = csp.house === 1;
      const label = isLagna ? `★ லக்னம் (${csp.formattedDms})` : `ப-${csp.house} (${csp.formattedDms})`;
      const color = isLagna ? '#f59e0b' : '#38bdf8';
      svgHtml += `
        <text x="${x + 6}" y="${textY}" fill="${color}" font-size="9" font-weight="${isLagna ? '700' : '500'}">
          ${label}
        </text>
      `;
      textY += 12;
    });

    // Render Planets in this sign
    data.planets.forEach(pl => {
      const pColor = pl.color || '#e2e8f0';
      const retroStr = pl.isRetro ? '(வ)' : '';
      const pText = `${pl.tamil} ${pl.formattedDms.split(' ')[0]} ${retroStr}`;
      svgHtml += `
        <text x="${x + 6}" y="${textY}" fill="${pColor}" font-size="9.5" font-weight="600">
          ${pText}
        </text>
      `;
      textY += 13;
    });

    svgHtml += `</g>`;
  });

  svgHtml += `</svg>`;
  container.innerHTML = svgHtml;
}

export function renderNorthIndianChart(chart, containerId, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const size = options.width || 420;
  const half = size / 2;
  const { cusps, planets } = chart;

  // Group planets by Placidus house
  const housePlanets = Array.from({ length: 13 }, () => []);
  planets.forEach(p => {
    if (p.house >= 1 && p.house <= 12) {
      housePlanets[p.house].push(p);
    }
  });

  let svgHtml = `
    <svg viewBox="0 0 ${size} ${size}" class="kp-north-chart" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="northBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="rgba(30, 41, 59, 0.9)" />
          <stop offset="100%" stop-color="rgba(15, 23, 42, 0.98)" />
        </linearGradient>
      </defs>

      <!-- Outer Box -->
      <rect x="0" y="0" width="${size}" height="${size}" fill="url(#northBg)" stroke="#3b82f6" stroke-width="2" rx="8" />

      <!-- Diamond Lines -->
      <!-- Diagonals -->
      <line x1="0" y1="0" x2="${size}" y2="${size}" stroke="rgba(148, 163, 184, 0.4)" stroke-width="1.5" />
      <line x1="${size}" y1="0" x2="0" y2="${size}" stroke="rgba(148, 163, 184, 0.4)" stroke-width="1.5" />

      <!-- Inner Diamond -->
      <line x1="${half}" y1="0" x2="${size}" y2="${half}" stroke="#6366f1" stroke-width="1.5" />
      <line x1="${size}" y1="${half}" x2="${half}" y2="${size}" stroke="#6366f1" stroke-width="1.5" />
      <line x1="${half}" y1="${size}" x2="0" y2="${half}" stroke="#6366f1" stroke-width="1.5" />
      <line x1="0" y1="${half}" x2="${half}" y2="0" stroke="#6366f1" stroke-width="1.5" />
  `;

  // Coordinates for house label centers in standard North Indian layout:
  // 1: Top center diamond
  // 2: Top left triangle
  // 3: Left top triangle
  // 4: Left center diamond
  // 5: Left bottom triangle
  // 6: Bottom left triangle
  // 7: Bottom center diamond
  // 8: Bottom right triangle
  // 9: Right bottom triangle
  // 10: Right center diamond
  // 11: Right top triangle
  // 12: Top right triangle
  const houseCoords = [
    null,
    { x: half, y: half * 0.4 },          // 1 (Lagna)
    { x: half * 0.5, y: half * 0.25 },   // 2
    { x: half * 0.25, y: half * 0.5 },   // 3
    { x: half * 0.4, y: half },          // 4
    { x: half * 0.25, y: half * 1.5 },   // 5
    { x: half * 0.5, y: half * 1.75 },   // 6
    { x: half, y: half * 1.6 },          // 7
    { x: half * 1.5, y: half * 1.75 },   // 8
    { x: half * 1.75, y: half * 1.5 },   // 9
    { x: half * 1.6, y: half },          // 10
    { x: half * 1.75, y: half * 0.5 },   // 11
    { x: half * 1.5, y: half * 0.25 }    // 12
  ];

  for (let h = 1; h <= 12; h++) {
    const coord = houseCoords[h];
    const csp = cusps[h - 1];
    const pls = housePlanets[h];

    // House & Sign number
    svgHtml += `
      <text x="${coord.x}" y="${coord.y - 12}" text-anchor="middle" fill="#94a3b8" font-size="9" font-weight="600">
        ${csp.house} (${csp.signIdx + 1})
      </text>
    `;

    // Planet tags
    pls.forEach((pl, idx) => {
      svgHtml += `
        <text x="${coord.x}" y="${coord.y + 4 + idx * 11}" text-anchor="middle" fill="${pl.color}" font-size="9" font-weight="600">
          ${pl.tamil}${pl.isRetro ? '(வ)' : ''}
        </text>
      `;
    });
  }

  svgHtml += `</svg>`;
  container.innerHTML = svgHtml;
}
