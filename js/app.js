/**
 * KP ASTRO PRO - MASTER APPLICATION CONTROLLER
 * Integrates all modules, UI event listeners, charts, and calculations
 */

import { SIGNS, PLANETS, NAKSHATRAS, HOUSES, HORARY_QUESTIONS, KP_249_TABLE, formatDms } from './kp-constants.js';
import { CITIES, findCity } from './cities-db.js';
import { calculateKpChart } from './kp-astronomy.js';
import { calculateSignificators, getCuspalInterlinks } from './kp-significators.js';
import { calculateHoraryChart, analyzeHoraryQuestion } from './kp-horary.js';
import { calculateRulingPlanets } from './kp-ruling-planets.js';
import { calculateVimshottariDasa } from './kp-dasa.js';
import { renderSouthIndianChart, renderNorthIndianChart } from './kp-chart-renderer.js';
import { analyzeAllLifeEvents } from './kp-predictions.js';

// Application State
let currentLang = 'ta'; // 'ta' for Tamil, 'en' for English
let activeChartStyle = 'south'; // 'south' or 'north'
let activeNatalChart = null;
let activeSignificators = null;
let activeDasaData = null;

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
  initLiveClock();
  initCitiesDropdown();
  initHoraryQuestions();
  initHorary249Grid();
  initNavigationTabs();
  initLanguageToggle();
  initEventListeners();
  init249MasterTable();

  // Set default current date/time
  setCurrentDateTimeFields();

  // Generate initial live Ruling Planets and default Natal chart
  refreshRulingPlanets();
  triggerDefaultCalculations();
});

/* ================= 1. Clock & Language ================= */
function initLiveClock() {
  const display = document.getElementById('live-time-display');
  function update() {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    if (display) display.textContent = timeStr;
  }
  update();
  setInterval(update, 1000);
}

function initLanguageToggle() {
  const btn = document.getElementById('btn-lang-toggle');
  const langText = document.getElementById('current-lang-text');

  btn.addEventListener('click', () => {
    currentLang = currentLang === 'ta' ? 'en' : 'ta';
    langText.textContent = currentLang === 'ta' ? 'English' : 'தமிழ்';

    document.querySelectorAll('.lang-text').forEach(el => {
      const txt = el.getAttribute(`data-${currentLang}`);
      if (txt) el.textContent = txt;
    });

    // Re-render components with active language
    if (activeNatalChart) {
      updateNatalTables(activeNatalChart);
      renderChartSvg(activeNatalChart);
    }
  });
}

/* ================= 2. Cities & Questions Setup ================= */
function initCitiesDropdown() {
  const hSelect = document.getElementById('horary-city-select');
  const nSelect = document.getElementById('natal-city-select');

  let optionsHtml = '';
  CITIES.forEach((c, idx) => {
    const label = `${c.tamil} (${c.name}) - ${c.state}`;
    optionsHtml += `<option value="${idx}" ${c.name === 'Chennai' ? 'selected' : ''}>${label}</option>`;
  });

  if (hSelect) hSelect.innerHTML = optionsHtml;
  if (nSelect) nSelect.innerHTML = optionsHtml;
}

function initHoraryQuestions() {
  const qSelect = document.getElementById('horary-question-select');
  if (!qSelect) return;

  let html = '';
  HORARY_QUESTIONS.forEach(q => {
    html += `<option value="${q.id}">${q.titleTamil} - ${q.titleEn}</option>`;
  });
  qSelect.innerHTML = html;
}

function setCurrentDateTimeFields() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const hDate = document.getElementById('horary-date');
  const hTime = document.getElementById('horary-time');
  const nDate = document.getElementById('natal-date');
  const nTime = document.getElementById('natal-time');

  if (hDate) hDate.value = dateStr;
  if (hTime) hTime.value = timeStr;
  if (nDate) nDate.value = dateStr;
  if (nTime) nTime.value = timeStr;
}

/* ================= 3. Navigation Tabs ================= */
function initNavigationTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  const panes = document.querySelectorAll('.tab-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');

      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPane = document.getElementById(target);
      if (targetPane) targetPane.classList.add('active');
    });
  });
}

/* ================= 4. 249 Number Grid & Explorer ================= */
function initHorary249Grid() {
  const grid = document.getElementById('horary-249-grid');
  const filterInput = document.getElementById('filter-horary-grid');
  const numInput = document.getElementById('horary-number-input');
  const pillPreview = document.getElementById('horary-sub-pill-preview');

  if (!grid) return;

  let html = '';
  KP_249_TABLE.forEach(sub => {
    html += `<div class="sub-num-pill ${sub.no === 1 ? 'active' : ''}" data-no="${sub.no}" title="${sub.signTamil} | ${sub.starTamil} | உப: ${sub.subLordTamil}">${sub.no}</div>`;
  });
  grid.innerHTML = html;

  function updateSubPreview(no) {
    const sub = KP_249_TABLE.find(s => s.no === no);
    if (!sub) return;

    if (pillPreview) {
      pillPreview.innerHTML = `<strong>${sub.no}. ${sub.signTamil}</strong> | ${sub.starTamil} (${sub.starLordTamil}) | உப-நாதன்: <strong style="color:${PLANETS[sub.subLord].color}">${sub.subLordTamil}</strong> (${sub.rangeDisplay})`;
    }

    grid.querySelectorAll('.sub-num-pill').forEach(el => {
      el.classList.toggle('active', parseInt(el.getAttribute('data-no'), 10) === no);
    });

    const activeEl = grid.querySelector(`.sub-num-pill[data-no="${no}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  // Grid click
  grid.addEventListener('click', e => {
    const pill = e.target.closest('.sub-num-pill');
    if (pill) {
      const no = parseInt(pill.getAttribute('data-no'), 10);
      if (numInput) numInput.value = no;
      updateSubPreview(no);
    }
  });

  // Input change
  if (numInput) {
    numInput.addEventListener('input', () => {
      let val = parseInt(numInput.value, 10);
      if (isNaN(val) || val < 1) val = 1;
      if (val > 249) val = 249;
      updateSubPreview(val);
    });
  }

  // Grid search filter
  if (filterInput) {
    filterInput.addEventListener('input', () => {
      const q = filterInput.value.toLowerCase().trim();
      grid.querySelectorAll('.sub-num-pill').forEach(el => {
        const no = parseInt(el.getAttribute('data-no'), 10);
        const sub = KP_249_TABLE[no - 1];
        const match = !q ||
          no.toString().includes(q) ||
          sub.signTamil.toLowerCase().includes(q) ||
          sub.starTamil.toLowerCase().includes(q) ||
          sub.subLordTamil.toLowerCase().includes(q) ||
          sub.subLord.toLowerCase().includes(q);
        el.style.display = match ? 'flex' : 'none';
      });
    });
  }

  // Random pick button
  const randomBtn = document.getElementById('btn-random-horary');
  if (randomBtn) {
    randomBtn.addEventListener('click', () => {
      const randNo = Math.floor(Math.random() * 249) + 1;
      if (numInput) numInput.value = randNo;
      updateSubPreview(randNo);
    });
  }

  updateSubPreview(1);
}

/* ================= 5. Horary Prashna Calculation ================= */
function calculateAndDisplayHorary() {
  const numInput = document.getElementById('horary-number-input');
  const horaryNo = parseInt(numInput.value, 10) || 1;
  const qSelect = document.getElementById('horary-question-select');
  const questionId = qSelect.value;

  const dateVal = document.getElementById('horary-date').value;
  const timeVal = document.getElementById('horary-time').value;
  const cityIdx = parseInt(document.getElementById('horary-city-select').value, 10) || 0;
  const city = CITIES[cityIdx];

  if (!dateVal || !timeVal) {
    alert('தயவுசெய்து தேதி மற்றும் நேரத்தை உள்ளிடவும்.');
    return;
  }

  const [year, month, day] = dateVal.split('-').map(Number);
  const [hour, minute, second = 0] = timeVal.split(':').map(Number);

  const horaryResult = calculateHoraryChart({
    horaryNo,
    year,
    month,
    day,
    hour,
    minute,
    second,
    lat: city.lat,
    lng: city.lng,
    tz: city.tz
  });

  const analysis = analyzeHoraryQuestion(horaryResult, questionId);
  displayHoraryVerdict(analysis, horaryResult);
}

function displayHoraryVerdict(analysis, horaryResult) {
  const container = document.getElementById('horary-verdict-container');
  const badge = document.getElementById('horary-sub-badge');
  if (!container) return;

  const { subEntry } = horaryResult.chart;
  if (badge) {
    badge.textContent = `எண்: ${subEntry.no} | ${subEntry.signTamil} | ${subEntry.starTamil} | உப: ${subEntry.subLordTamil}`;
  }

  const v = analysis;
  container.innerHTML = `
    <div class="verdict-box ${v.verdictClass}">
      <div class="verdict-header">
        <div class="verdict-title">${v.verdict}</div>
        <div style="font-size: 1.15rem; font-weight: 800;">${v.score}%</div>
      </div>

      <div class="score-bar-bg">
        <div class="score-bar-fill ${v.verdictClass}" style="width: ${v.score}%;"></div>
      </div>

      <div style="font-size: 0.9rem; line-height: 1.7; background: rgba(0,0,0,0.25); padding: 1rem; border-radius: 8px;">
        ${v.reasoningTamil}
      </div>
    </div>

    <!-- Cusp Sub-Lord Breakdown Cards -->
    <div style="margin-top: 1.25rem;">
      <h4 style="font-size: 0.95rem; color: var(--accent-cyan); margin-bottom: 0.6rem;">
        🔍 கஸ்பல் உப-நாதன் ஆய்வு விபரம் (Detailed Cuspal Breakdown):
      </h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.75rem;">
        <div style="background: rgba(15, 23, 42, 0.7); padding: 0.75rem; border-radius: 6px; border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.75rem; color: var(--text-muted);">${v.question.primaryHouse}-ம் பாவ உப-நாதன்</div>
          <div style="font-size: 1rem; font-weight: 700; color: ${PLANETS[v.cuspSubLord].color};">${v.cuspSubLordTamil}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.7); padding: 0.75rem; border-radius: 6px; border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.75rem; color: var(--text-muted);">நட்சத்திர நாதன் (Source)</div>
          <div style="font-size: 1rem; font-weight: 700; color: ${PLANETS[v.subLordStarLord].color};">${v.subLordStarLordTamil}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.7); padding: 0.75rem; border-radius: 6px; border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.75rem; color: var(--text-muted);">உப-நாதன் (Decider)</div>
          <div style="font-size: 1rem; font-weight: 700; color: ${PLANETS[v.subLordSubLord].color};">${v.subLordSubLordTamil}</div>
        </div>
      </div>
    </div>

    <!-- Ruling Planets for Judgment Moment -->
    <div style="margin-top: 1.25rem;">
      <h4 style="font-size: 0.95rem; color: var(--accent-gold); margin-bottom: 0.6rem;">
        👑 கேள்வி நேர ஆளும் கிரகங்கள் (Ruling Planets for Timing):
      </h4>
      <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">
        கேள்விக்கான தசா-புக்தி அல்லது கோச்சாரத்தில் இந்த ஆளும் கிரகங்கள் இணையும் காலத்தில் காரியம் நிறைவேறும்.
      </div>
    </div>
  `;
}

/* ================= 6. Natal Chart Generation ================= */
function calculateAndDisplayNatal() {
  const dateVal = document.getElementById('natal-date').value;
  const timeVal = document.getElementById('natal-time').value;
  const cityIdx = parseInt(document.getElementById('natal-city-select').value, 10) || 0;
  const city = CITIES[cityIdx];

  if (!dateVal || !timeVal) {
    alert('தயவுசெய்து பிறந்த தேதி மற்றும் நேரத்தை உள்ளிடவும்.');
    return;
  }

  const [year, month, day] = dateVal.split('-').map(Number);
  const [hour, minute, second = 0] = timeVal.split(':').map(Number);

  const chart = calculateKpChart({
    year,
    month,
    day,
    hour,
    minute,
    second,
    lat: city.lat,
    lng: city.lng,
    tz: city.tz
  });

  activeNatalChart = chart;
  activeSignificators = calculateSignificators(chart);

  // Update tables & chart
  updateNatalTables(chart);
  renderChartSvg(chart);
  updateSignificatorsTables(chart, activeSignificators);
  activeDasaData = updateDasaTable(chart, new Date(year, month - 1, day, hour, minute));
  renderLifePredictions(chart, activeSignificators, activeDasaData);
}

function updateNatalTables(chart) {
  const ayanamsaBadge = document.getElementById('ayanamsa-badge');
  if (ayanamsaBadge) {
    ayanamsaBadge.textContent = `அயனாம்சம்: ${chart.ayanamsaStr}`;
  }

  // 1. Cusps Table
  const cuspsTbody = document.getElementById('cusps-table-body');
  if (cuspsTbody) {
    let html = '';
    chart.cusps.forEach(c => {
      const isLagna = c.house === 1;
      html += `
        <tr style="${isLagna ? 'background: rgba(245, 158, 11, 0.08); font-weight: 600;' : ''}">
          <td>${isLagna ? '★ லக்னம் (1)' : `${c.house}-ம் பாவம்`}</td>
          <td>${c.signTamil} ${c.formattedDms}</td>
          <td>${c.signLordTamil}</td>
          <td>${c.starTamil} (${c.starLordTamil})</td>
          <td style="color: ${PLANETS[c.subLord].color}; font-weight: 700;">${c.subLordTamil}</td>
        </tr>
      `;
    });
    cuspsTbody.innerHTML = html;
  }

  // 2. Planets Table
  const planetsTbody = document.getElementById('planets-table-body');
  if (planetsTbody) {
    let html = '';
    chart.planets.forEach(p => {
      html += `
        <tr>
          <td style="color: ${p.color}; font-weight: 700;">
            ${p.tamil} ${p.isRetro ? '<span style="color:#ef4444;">(வ)</span>' : ''}
          </td>
          <td>${p.signTamil} ${p.formattedDms}</td>
          <td><span class="badge-tag">${p.house}-ம் பாவம்</span></td>
          <td>${p.starTamil} (${p.starLordTamil})</td>
          <td style="color: ${PLANETS[p.subLord].color}; font-weight: 700;">${p.subLordTamil}</td>
        </tr>
      `;
    });
    planetsTbody.innerHTML = html;
  }
}

function renderChartSvg(chart) {
  if (activeChartStyle === 'south') {
    renderSouthIndianChart(chart, 'chart-svg-container', { width: 440, height: 440 });
  } else {
    renderNorthIndianChart(chart, 'chart-svg-container', { width: 440, height: 440 });
  }
}

/* ================= 7. 4-Fold Significators Tables ================= */
function updateSignificatorsTables(chart, sigData) {
  const { houseSignificators, planetSignifications } = sigData;

  // 1. House-wise Significators
  const hTbody = document.getElementById('house-significators-tbody');
  if (hTbody) {
    let html = '';
    houseSignificators.forEach(hs => {
      const gA = hs.gradeA.map(p => `<span style="color:${PLANETS[p].color}">${PLANETS[p].tamil}</span>`).join(', ') || '-';
      const gB = hs.gradeB.map(p => `<span style="color:${PLANETS[p].color}">${PLANETS[p].tamil}</span>`).join(', ') || '-';
      const gC = hs.gradeC.map(p => `<span style="color:${PLANETS[p].color}">${PLANETS[p].tamil}</span>`).join(', ') || '-';
      const gD = `<span style="color:${PLANETS[hs.gradeD[0]].color}">${PLANETS[hs.gradeD[0]].tamil}</span>`;
      const all = hs.allSignificators.map(p => PLANETS[p].tamil).join(', ') || '-';

      html += `
        <tr>
          <td><strong>${hs.name}</strong></td>
          <td>${hs.cuspSign} - ${hs.cuspStar} - <strong>${hs.cuspSub}</strong></td>
          <td>${gA}</td>
          <td>${gB}</td>
          <td>${gC}</td>
          <td>${gD}</td>
          <td><strong style="color:var(--accent-gold);">${all}</strong></td>
        </tr>
      `;
    });
    hTbody.innerHTML = html;
  }

  // 2. Planet-wise Significations
  const pTbody = document.getElementById('planet-significators-tbody');
  if (pTbody) {
    let html = '';
    planetSignifications.forEach(ps => {
      html += `
        <tr>
          <td style="color: ${ps.color}; font-weight: 700;">${ps.tamil}</td>
          <td>${ps.starLordTamil}</td>
          <td>${ps.subLordTamil}</td>
          <td>${ps.houseOccupied}-ம் பாவம்</td>
          <td><strong style="color:var(--accent-cyan);">${ps.signifiedHousesStr}</strong></td>
        </tr>
      `;
    });
    pTbody.innerHTML = html;
  }

  // 3. Cuspal Interlinks
  const cuspalInterlinks = getCuspalInterlinks(chart, planetSignifications);
  const cTbody = document.getElementById('cuspal-interlinks-tbody');
  if (cTbody) {
    let html = '';
    cuspalInterlinks.forEach(ci => {
      const subSig = ci.subLordSignifies.join(', ') || 'இல்லை';
      const starSig = ci.starLordSignifies.join(', ') || 'இல்லை';
      html += `
        <tr>
          <td><strong>${ci.name}</strong></td>
          <td style="color:var(--accent-gold); font-weight:700;">${ci.subLordTamil}</td>
          <td><strong style="color:var(--accent-emerald);">${subSig}</strong></td>
          <td>${starSig}</td>
        </tr>
      `;
    });
    cTbody.innerHTML = html;
  }
}

/* ================= 8. Ruling Planets ================= */
function refreshRulingPlanets() {
  const now = new Date();
  const cityIdx = parseInt(document.getElementById('natal-city-select')?.value || 0, 10);
  const city = CITIES[cityIdx];

  const rpData = calculateRulingPlanets({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
    second: now.getSeconds(),
    lat: city.lat,
    lng: city.lng,
    tz: city.tz
  });

  const badgeContainer = document.getElementById('rp-badge-container');
  if (badgeContainer) {
    let html = '';
    rpData.rulingPlanets.forEach(rp => {
      html += `
        <div class="rp-badge-item" style="border-left-color: ${rp.color};">
          <div class="rp-role">${rp.role}</div>
          <div class="rp-planet" style="color: ${rp.color};">${rp.tamil} (${rp.planet})</div>
        </div>
      `;
    });
    badgeContainer.innerHTML = html;
  }

  const nodesContainer = document.getElementById('nodes-rep-container');
  if (nodesContainer) {
    if (rpData.nodeReps.length > 0) {
      let nodeHtml = '';
      rpData.nodeReps.forEach(nr => {
        nodeHtml += `
          <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: 8px; padding: 0.75rem; margin-bottom: 0.5rem;">
            <strong style="color: var(--accent-purple);">${nr.nodeTamil} (${nr.node})</strong> பிரதிநிதித்துவம்: <strong>${nr.representsTamil}</strong>.
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.2rem;">${nr.reason}</div>
          </div>
        `;
      });
      nodesContainer.innerHTML = nodeHtml;
    } else {
      nodesContainer.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem;">தற்போது ராகு / கேது ஆளும் கிரகங்களை நேரடியாகப் பிரதிபலிக்கவில்லை.</div>';
    }
  }
}

/* ================= 9. Vimshottari Dasa Table ================= */
function updateDasaTable(chart, birthDate) {
  const moon = chart.planets.find(p => p.key === 'Moon');
  const dasaData = calculateVimshottariDasa(moon.nirayanaDeg, birthDate);

  const balanceBadge = document.getElementById('dasa-balance-badge');
  if (balanceBadge) {
    balanceBadge.textContent = `பிறப்பு இருப்பு: ${dasaData.balanceLordTamil} தசா (${dasaData.balanceYears} ஆண்டுகள்)`;
  }

  const runningInfo = document.getElementById('running-dasa-info');
  if (runningInfo && dasaData.currentDasa) {
    const cd = dasaData.currentDasa;
    const cb = dasaData.currentBhukti;
    runningInfo.innerHTML = `
      <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 8px; padding: 1rem;">
        <div>
          <span style="font-size: 0.8rem; color: var(--text-muted);">தற்போதைய நடப்பு தசா:</span>
          <div style="font-size: 1.25rem; font-weight: 800; color: ${cd.color};">${cd.lordTamil} தசா</div>
          <div style="font-size: 0.8rem; color: var(--text-secondary);">${cd.startStr} முதல் ${cd.endStr} வரை</div>
        </div>
        ${cb ? `
          <div style="border-left: 1px solid var(--border-subtle); padding-left: 1rem;">
            <span style="font-size: 0.8rem; color: var(--text-muted);">நடப்பு புக்தி:</span>
            <div style="font-size: 1.25rem; font-weight: 800; color: var(--accent-gold);">${cb.lordTamil} புக்தி</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">${cb.startStr} முதல் ${cb.endStr} வரை</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  const dasaTbody = document.getElementById('dasa-table-tbody');
  if (dasaTbody) {
    let html = '';
    dasaData.dasaList.forEach(d => {
      const bhuktiSummary = d.bhuktis.map(b => `${b.lordTamil} (${b.startStr})`).join(' | ');
      html += `
        <tr>
          <td style="color: ${d.color}; font-weight: 800;">${d.lordTamil} தசா</td>
          <td>${d.startStr}</td>
          <td>${d.endStr}</td>
          <td>${d.years} ஆண்டுகள்</td>
          <td style="font-size: 0.75rem; color: var(--text-muted);">${bhuktiSummary}</td>
        </tr>
      `;
    });
    dasaTbody.innerHTML = html;
  }

  return dasaData;
}

/* ================= 9b. KP Life Predictions Renderer ================= */
function renderLifePredictions(chart, significators, dasaData) {
  const container = document.getElementById('predictions-cards-container');
  if (!container || !dasaData) return;

  const events = analyzeAllLifeEvents(chart, significators, dasaData);

  function renderTimingList(timing) {
    if (!timing || !timing.upcomingPeriods || timing.upcomingPeriods.length === 0) {
      return '<div style="font-size:0.75rem; color:var(--text-muted);">நடப்பு சாதகமான காலங்கள் தசா முடிவில் அல்லது கோச்சாரத்தில் தீர்மானிக்கப்படும்.</div>';
    }
    let tHtml = '<ul style="margin:0; padding-left:1.1rem; font-size:0.8rem; line-height:1.6;">';
    timing.upcomingPeriods.forEach(p => {
      tHtml += `
        <li>
          <strong style="color:var(--accent-gold);">${p.dasaLordTamil} தசா - ${p.bhuktiLordTamil} புக்தி</strong><br>
          <span style="color:var(--text-muted); font-size:0.75rem;">${p.startStr} முதல் ${p.endStr} வரை</span>
        </li>
      `;
    });
    tHtml += '</ul>';
    return tHtml;
  }

  const items = [
    { key: 'govtJob', ...events.govtJob },
    { key: 'job', ...events.job },
    { key: 'jobLoss', ...events.jobLoss },
    { key: 'business', ...events.business },
    { key: 'jobLocation', ...events.jobLocation },
    { key: 'marriage', ...events.marriage },
    { key: 'childbirth', ...events.childbirth },
    { key: 'property', ...events.property },
    { key: 'vehicle', ...events.vehicle },
    { key: 'abroad', ...events.abroad },
    { key: 'secondMarriage', ...events.secondMarriage },
    { key: 'divorce', ...events.divorce }
  ];

  let html = '';

  // Feature Card: Govt vs Private vs Business Comparison
  if (events.comparison) {
    html += `
      <div class="card prediction-card-item" data-qa-id="comparison" style="border-top: 3px solid var(--accent-gold); grid-column: 1 / -1; background: linear-gradient(135deg, rgba(30, 41, 69, 0.85), rgba(15, 23, 42, 0.95));">
        <div class="card-header">
          <h3 style="font-size: 1.05rem; color: var(--accent-gold);">${events.comparison.title}</h3>
          <span class="badge-tag" style="background: rgba(245, 158, 11, 0.2); color: var(--accent-gold); border-color: var(--accent-gold); font-size: 0.85rem; font-weight: 700;">
            ${events.comparison.bestChoiceTamil}
          </span>
        </div>
        
        <div style="font-size: 0.9rem; line-height: 1.7; background: rgba(0,0,0,0.3); padding: 0.85rem 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid var(--accent-gold);">
          ${events.comparison.bestChoiceDesc}
        </div>

        <!-- Comparative Scores Breakdown -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
          <div style="background: rgba(15, 23, 42, 0.8); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--border-subtle);">
            <div style="display:flex; justify-content:space-between; margin-bottom: 0.35rem; font-size:0.85rem;">
              <span>🏛️ அரசு வேலை (Govt Job)</span>
              <strong style="color:var(--accent-gold);">${events.comparison.govtScore}%</strong>
            </div>
            <div style="background: rgba(0,0,0,0.4); height: 8px; border-radius: 4px; overflow:hidden;">
              <div style="width:${events.comparison.govtScore}%; height:100%; background:linear-gradient(90deg, #f59e0b, #fbbf24);"></div>
            </div>
          </div>

          <div style="background: rgba(15, 23, 42, 0.8); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--border-subtle);">
            <div style="display:flex; justify-content:space-between; margin-bottom: 0.35rem; font-size:0.85rem;">
              <span>💼 தனியார் / IT வேலை (Private Job)</span>
              <strong style="color:var(--accent-cyan);">${events.comparison.privateScore}%</strong>
            </div>
            <div style="background: rgba(0,0,0,0.4); height: 8px; border-radius: 4px; overflow:hidden;">
              <div style="width:${events.comparison.privateScore}%; height:100%; background:linear-gradient(90deg, #0ea5e9, #38bdf8);"></div>
            </div>
          </div>

          <div style="background: rgba(15, 23, 42, 0.8); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--border-subtle);">
            <div style="display:flex; justify-content:space-between; margin-bottom: 0.35rem; font-size:0.85rem;">
              <span>🏢 சொந்தத் தொழில் (Business)</span>
              <strong style="color:var(--accent-emerald);">${events.comparison.businessScore}%</strong>
            </div>
            <div style="background: rgba(0,0,0,0.4); height: 8px; border-radius: 4px; overflow:hidden;">
              <div style="width:${events.comparison.businessScore}%; height:100%; background:linear-gradient(90deg, #10b981, #34d399);"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Card: Specific Govt & Private Sectors Breakdown
  if (events.specificSectors) {
    const sec = events.specificSectors;
    let govtListHtml = '';
    sec.govtSectors.forEach(g => {
      govtListHtml += `
        <div style="background: rgba(15, 23, 42, 0.7); padding: 0.6rem 0.75rem; border-radius: 6px; border: 1px solid var(--border-subtle); margin-bottom: 0.5rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
            <strong style="font-size: 0.8rem; color: #fff;">${g.name}</strong>
            <span style="font-size:0.8rem; font-weight:700; color:var(--accent-gold);">${g.score}%</span>
          </div>
          <div style="background: rgba(0,0,0,0.4); height: 6px; border-radius: 3px; overflow:hidden; margin-bottom:0.3rem;">
            <div style="width:${g.score}%; height:100%; background:linear-gradient(90deg, #f59e0b, #fbbf24);"></div>
          </div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${g.desc}</div>
        </div>
      `;
    });

    let privListHtml = '';
    sec.privateSectors.forEach(p => {
      privListHtml += `
        <div style="background: rgba(15, 23, 42, 0.7); padding: 0.6rem 0.75rem; border-radius: 6px; border: 1px solid var(--border-subtle); margin-bottom: 0.5rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
            <strong style="font-size: 0.8rem; color: #fff;">${p.name}</strong>
            <span style="font-size:0.8rem; font-weight:700; color:var(--accent-cyan);">${p.score}%</span>
          </div>
          <div style="background: rgba(0,0,0,0.4); height: 6px; border-radius: 3px; overflow:hidden; margin-bottom:0.3rem;">
            <div style="width:${p.score}%; height:100%; background:linear-gradient(90deg, #0ea5e9, #38bdf8);"></div>
          </div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${p.desc}</div>
        </div>
      `;
    });

    html += `
      <div class="card prediction-card-item" data-qa-id="specificSectors" style="border-top: 3px solid var(--accent-cyan); grid-column: 1 / -1; background: linear-gradient(135deg, rgba(20, 28, 52, 0.85), rgba(15, 23, 42, 0.95));">
        <div class="card-header">
          <h3 style="font-size: 1.05rem; color: var(--accent-cyan);">${sec.title}</h3>
          <span class="badge-tag" style="background: rgba(56, 189, 248, 0.15); color: var(--accent-cyan); border-color: var(--accent-cyan); font-weight: 700;">
            துறைவாரியான பொருத்தம் (%)
          </span>
        </div>

        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem; line-height: 1.6;">
          10-ம் பாவ உப-நாதன், நட்சத்திர நாதன் மற்றும் 6-ம் பாவ ஆதிக்கக் கிரகங்களின் அடிப்படையில் அரசு மற்றும் தனியார் துறைகளில் உங்கள் ஜாதகத்திற்கு அதிக வெற்றி தரும் துறைகளின் முழு விபரம்:
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem;">
          <!-- Govt Sectors Column -->
          <div style="background: rgba(10, 14, 28, 0.6); padding: 1rem; border-radius: 8px; border: 1px solid rgba(245, 158, 11, 0.25);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; border-bottom: 1px solid rgba(245, 158, 11, 0.2); padding-bottom: 0.4rem;">
              <h4 style="font-size: 0.95rem; color: var(--accent-gold);">🏛️ அரசுப் பணி துறைகள் (Govt Sectors)</h4>
              <span class="badge-tag" style="background:rgba(245, 158, 11, 0.15); color:var(--accent-gold); font-size:0.75rem;">முதன்மை: ${sec.topGovt.name.split('(')[0]}</span>
            </div>
            ${govtListHtml}
          </div>

          <!-- Private Sectors Column -->
          <div style="background: rgba(10, 14, 28, 0.6); padding: 1rem; border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.25);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; border-bottom: 1px solid rgba(56, 189, 248, 0.2); padding-bottom: 0.4rem;">
              <h4 style="font-size: 0.95rem; color: var(--accent-cyan);">💼 தனியார் துறைகள் (Private Sectors)</h4>
              <span class="badge-tag" style="background:rgba(56, 189, 248, 0.15); color:var(--accent-cyan); font-size:0.75rem;">முதன்மை: ${sec.topPrivate.name.split('(')[0]}</span>
            </div>
            ${privListHtml}
          </div>
        </div>
      </div>
    `;
  }

  // Card: Life Events Audit & Re-employment
  if (events.lifeAudit) {
    const audit = events.lifeAudit;

    let pastMarrHtml = '';
    if (audit.pastMarriage.length > 0) {
      audit.pastMarriage.forEach(m => {
        pastMarrHtml += `<div style="font-size:0.85rem; margin-bottom:0.4rem; background:rgba(0,0,0,0.25); padding:0.4rem 0.6rem; border-radius:4px;"><strong style="color:var(--accent-gold);">${m.year} (${m.age} வயது):</strong> ${m.dasaLordTamil} தசா - ${m.bhuktiLordTamil} புக்தி (${m.startStr} முதல் ${m.endStr} வரை)<br><span style="font-size:0.75rem; color:var(--text-muted);">காரகப் பாவங்கள்: ${m.sig}</span></div>`;
      });
    } else {
      pastMarrHtml = '<div style="font-size:0.8rem; color:var(--text-muted);">2, 7, 11 பாவ காரக தசா காலத்தில் திருமணம் நிகழ்ந்திருக்கும்.</div>';
    }

    let pastJobHtml = '';
    if (audit.pastJob.length > 0) {
      audit.pastJob.forEach(j => {
        pastJobHtml += `<div style="font-size:0.85rem; margin-bottom:0.4rem; background:rgba(0,0,0,0.25); padding:0.4rem 0.6rem; border-radius:4px;"><strong style="color:var(--accent-cyan);">${j.year} (${j.age} வயது):</strong> ${j.dasaLordTamil} தசா - ${j.bhuktiLordTamil} புக்தி (${j.startStr} முதல் ${j.endStr} வரை)<br><span style="font-size:0.75rem; color:var(--text-muted);">காரகப் பாவங்கள்: ${j.sig}</span></div>`;
      });
    } else {
      pastJobHtml = '<div style="font-size:0.8rem; color:var(--text-muted);">2, 6, 10, 11 பாவ காரக தசா காலத்தில் முதல் வேலை கிடைத்திருக்கும்.</div>';
    }

    let jobLossCausesHtml = audit.causesOfJobLoss.map(c => `<li style="margin-bottom:0.35rem;">${c}</li>`).join('');
    let marrBreakCausesHtml = audit.maritalBreakCauses.map(c => `<li style="margin-bottom:0.35rem;">${c}</li>`).join('');

    let reEmpHtml = '';
    audit.reEmploymentTiming.forEach(p => {
      reEmpHtml += `
        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 6px; padding: 0.5rem 0.75rem; margin-bottom: 0.4rem;">
          <strong style="color: var(--accent-emerald); font-size:0.9rem;">${p.dasaLordTamil} தசா - ${p.bhuktiLordTamil} புக்தி</strong><br>
          <span style="font-size:0.8rem; color: #f8fafc;">📅 காலம்: <strong>${p.startStr} முதல் ${p.endStr} வரை</strong></span>
        </div>
      `;
    });

    html += `
      <div class="card prediction-card-item" data-qa-id="lifeAudit" style="border-top: 3px solid #8b5cf6; grid-column: 1 / -1; background: linear-gradient(135deg, rgba(26, 16, 48, 0.9), rgba(15, 23, 42, 0.98));">
        <div class="card-header">
          <h3 style="font-size: 1.05rem; color: #c084fc;">${audit.title}</h3>
          <span class="badge-tag" style="background: rgba(139, 92, 246, 0.2); color: #c084fc; border-color: #8b5cf6; font-weight:700;">
            கடந்த காலம் & மறுவேலை ஆய்வு
          </span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.25rem; margin-top: 0.5rem;">
          <!-- Past Events Reconstruction -->
          <div style="background: rgba(10, 14, 28, 0.7); padding: 1rem; border-radius: 8px; border: 1px solid rgba(139, 92, 246, 0.25);">
            <h4 style="font-size: 0.95rem; color: var(--accent-gold); margin-bottom: 0.6rem; border-bottom: 1px solid rgba(245, 158, 11, 0.2); padding-bottom: 0.3rem;">
              📜 கடந்த கால நிகழ்வுகள் சரிபார்ப்பு (Past Life Audit)
            </h4>
            
            <div style="margin-bottom: 0.9rem;">
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.3rem;">💍 திருமணம் நடந்திருக்கக்கூடிய ஆண்டு & தசா-புக்தி:</div>
              ${pastMarrHtml}
            </div>

            <div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.3rem;">💼 வேலை கிடைத்திருக்கக்கூடிய ஆண்டு & தசா-புக்தி:</div>
              ${pastJobHtml}
            </div>
          </div>

          <!-- Root Causes of Separation & Job Loss -->
          <div style="background: rgba(10, 14, 28, 0.7); padding: 1rem; border-radius: 8px; border: 1px solid rgba(244, 63, 94, 0.25);">
            <h4 style="font-size: 0.95rem; color: var(--accent-rose); margin-bottom: 0.6rem; border-bottom: 1px solid rgba(244, 63, 94, 0.2); padding-bottom: 0.3rem;">
              ⚠️ பிரிவு & வேலை இழப்புக்கான பாவக் காரணங்கள்
            </h4>

            <div style="margin-bottom: 0.75rem;">
              <div style="font-size: 0.8rem; font-weight:700; color: #fb7185; margin-bottom: 0.2rem;">💔 திருமணப் பிரிவு / விவாகரத்து காரணம்:</div>
              <ul style="margin:0; padding-left:1.1rem; font-size:0.8rem; line-height:1.6; color:var(--text-secondary);">
                ${marrBreakCausesHtml}
              </ul>
            </div>

            <div>
              <div style="font-size: 0.8rem; font-weight:700; color: #fb7185; margin-bottom: 0.2rem;">🚪 வேலை இழந்ததற்கான / தாமதத்திற்கான காரணம்:</div>
              <ul style="margin:0; padding-left:1.1rem; font-size:0.8rem; line-height:1.6; color:var(--text-secondary);">
                ${jobLossCausesHtml}
              </ul>
            </div>
          </div>

          <!-- Re-employment Timing -->
          <div style="background: rgba(10, 14, 28, 0.7); padding: 1rem; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.3);">
            <h4 style="font-size: 0.95rem; color: var(--accent-emerald); margin-bottom: 0.6rem; border-bottom: 1px solid rgba(16, 185, 129, 0.2); padding-bottom: 0.3rem;">
              ✨ அடுத்த புதிய வேலை எப்போது கிடைக்கும்? (Re-employment)
            </h4>
            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.6rem; line-height:1.6;">
              தற்போதுள்ள 5, 9, 12-ம் பாவங்களின் தாக்கம் விலகி, <strong>2, 6, 10, 11-ம் பாவங்களின் காரக தசா-புக்தி</strong> செயல்படும் போது மீண்டும் புதிய உத்தியோகம் கை கூடும்:
            </div>
            ${reEmpHtml}
          </div>
        </div>
      </div>
    `;
  }

  // First card: Recommended Career Field
  html += `
    <div class="card prediction-card-item" data-qa-id="careerField" style="border-top: 3px solid var(--accent-cyan);">
      <div class="card-header">
        <h3 style="font-size: 0.95rem; color: var(--accent-cyan);">${events.careerField.title}</h3>
        <span class="badge-tag" style="background:rgba(56,189,248,0.15); color:var(--accent-cyan); border-color:rgba(56,189,248,0.3);">தொழில் தேர்வு</span>
      </div>
      <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
        <strong>10-ம் பாவ உப-நாதன்:</strong> ${events.careerField.cuspSubLord} | <strong>நட்சத்திரம்:</strong> ${events.careerField.starLord}
      </div>
      <div style="font-size: 0.85rem; line-height: 1.6; background: rgba(0,0,0,0.25); padding: 0.75rem; border-radius: 6px; margin-bottom: 0.6rem;">
        ${events.careerField.recommendation}
      </div>
      <div style="font-size: 0.75rem; color: var(--text-muted);">
        (English: ${events.careerField.en})
      </div>
    </div>
  `;

  // Remaining cards
  items.forEach(ev => {
    const isDanger = ev.verdict.class === 'danger';
    const isSuccess = ev.verdict.class === 'success';
    const borderTopColor = isSuccess ? 'var(--accent-emerald)' : (isDanger ? 'var(--accent-rose)' : 'var(--accent-gold)');
    const badgeBg = isSuccess ? 'rgba(16,185,129,0.15)' : (isDanger ? 'rgba(244,63,94,0.15)' : 'rgba(245,158,11,0.15)');
    const badgeColor = isSuccess ? 'var(--accent-emerald)' : (isDanger ? 'var(--accent-rose)' : 'var(--accent-gold)');

    html += `
      <div class="card prediction-card-item" data-qa-id="${ev.key}" style="border-top: 3px solid ${borderTopColor}; display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div class="card-header">
            <h3 style="font-size: 0.95rem; color: var(--text-primary);">${ev.title}</h3>
            <span class="badge-tag" style="background:${badgeBg}; color:${badgeColor}; border-color:${badgeColor};">
              ${ev.verdict.status}
            </span>
          </div>

          <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
            <strong>ஆய்வு செய்த உப-நாதன்:</strong> ${ev.cuspSubLord}
          </div>

          <div style="font-size: 0.85rem; line-height: 1.6; background: rgba(0,0,0,0.25); padding: 0.75rem; border-radius: 6px; margin-bottom: 0.75rem;">
            ${ev.verdict.text}
          </div>
        </div>

        <div style="background: rgba(56, 189, 248, 0.06); border: 1px solid rgba(56, 189, 248, 0.18); border-radius: 6px; padding: 0.75rem; margin-top: 0.5rem;">
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--accent-cyan); margin-bottom: 0.35rem;">
            ⏳ எப்போது நடக்கும்? (Timing of Event):
          </div>
          ${renderTimingList(ev.timing)}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Re-apply any currently selected QA dropdown filter
  const dropdown = document.getElementById('prediction-qa-dropdown');
  if (dropdown && dropdown.value !== 'all') {
    filterPredictionCards(dropdown.value);
  }
}

function filterPredictionCards(selectedQaId) {
  const cards = document.querySelectorAll('#predictions-cards-container .prediction-card-item');
  cards.forEach(card => {
    const cardId = card.getAttribute('data-qa-id');
    if (selectedQaId === 'all' || cardId === selectedQaId) {
      card.style.display = 'flex';
      if (selectedQaId !== 'all') {
        card.style.gridColumn = '1 / -1'; // Full width for focused card
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        card.style.gridColumn = cardId === 'comparison' ? '1 / -1' : 'span 1';
      }
    } else {
      card.style.display = 'none';
    }
  });
}

/* ================= 10. 249 Master Table Explorer ================= */
function init249MasterTable() {
  const tbody = document.getElementById('master-249-tbody');
  const searchInput = document.getElementById('sub-table-search');
  if (!tbody) return;

  function renderTable(filterQuery = '') {
    let html = '';
    const q = filterQuery.toLowerCase().trim();

    KP_249_TABLE.forEach(sub => {
      const match = !q ||
        sub.no.toString().includes(q) ||
        sub.signTamil.toLowerCase().includes(q) ||
        sub.signName.toLowerCase().includes(q) ||
        sub.starTamil.toLowerCase().includes(q) ||
        sub.starName.toLowerCase().includes(q) ||
        sub.subLordTamil.toLowerCase().includes(q) ||
        sub.subLord.toLowerCase().includes(q);

      if (match) {
        html += `
          <tr>
            <td><strong>${sub.no}</strong></td>
            <td>${sub.signTamil} (${sub.signName})</td>
            <td>${sub.signLordTamil}</td>
            <td>${sub.rangeDisplay}</td>
            <td>${sub.starTamil} (${sub.starName})</td>
            <td>${sub.starLordTamil}</td>
            <td style="color: ${PLANETS[sub.subLord].color}; font-weight: 700;">${sub.subLordTamil}</td>
          </tr>
        `;
      }
    });

    tbody.innerHTML = html;
  }

  renderTable();

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderTable(searchInput.value);
    });
  }
}

/* ================= 11. Event Listeners ================= */
function initEventListeners() {
  // Horary Form submit
  const horaryForm = document.getElementById('horary-form');
  if (horaryForm) {
    horaryForm.addEventListener('submit', e => {
      e.preventDefault();
      calculateAndDisplayHorary();
    });
  }

  // Horary Now Button
  const btnHoraryNow = document.getElementById('btn-horary-now');
  if (btnHoraryNow) {
    btnHoraryNow.addEventListener('click', () => {
      setCurrentDateTimeFields();
      calculateAndDisplayHorary();
    });
  }

  // Natal Form submit
  const natalForm = document.getElementById('natal-form');
  if (natalForm) {
    natalForm.addEventListener('submit', e => {
      e.preventDefault();
      calculateAndDisplayNatal();
    });
  }

  // Natal Now Button
  const btnNatalNow = document.getElementById('btn-natal-now');
  if (btnNatalNow) {
    btnNatalNow.addEventListener('click', () => {
      setCurrentDateTimeFields();
      calculateAndDisplayNatal();
    });
  }

  // Chart Style Toggles
  const btnSouth = document.getElementById('btn-chart-south');
  const btnNorth = document.getElementById('btn-chart-north');

  if (btnSouth && btnNorth) {
    btnSouth.addEventListener('click', () => {
      activeChartStyle = 'south';
      btnSouth.classList.add('active');
      btnNorth.classList.remove('active');
      if (activeNatalChart) renderChartSvg(activeNatalChart);
    });

    btnNorth.addEventListener('click', () => {
      activeChartStyle = 'north';
      btnNorth.classList.add('active');
      btnSouth.classList.remove('active');
      if (activeNatalChart) renderChartSvg(activeNatalChart);
    });
  }

  // Refresh RP button
  const btnRefreshRp = document.getElementById('btn-refresh-rp');
  if (btnRefreshRp) {
    btnRefreshRp.addEventListener('click', () => {
      refreshRulingPlanets();
    });
  }

  // Print button
  const btnPrint = document.getElementById('btn-print-chart');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  // QA Dropdown filter listener
  const qaDropdown = document.getElementById('prediction-qa-dropdown');
  if (qaDropdown) {
    qaDropdown.addEventListener('change', () => {
      filterPredictionCards(qaDropdown.value);
    });
  }
}

function triggerDefaultCalculations() {
  calculateAndDisplayHorary();
  calculateAndDisplayNatal();
}
