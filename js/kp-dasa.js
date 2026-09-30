/**
 * KP Vimshottari Dasa - Bhukti - Antara Engine
 */

import { VIMSHOTTARI_ORDER, PLANETS } from './kp-constants.js';

export function calculateVimshottariDasa(moonDeg, birthDate) {
  const totalStarSec = 800 * 60; // 13°20' in arc seconds
  const moonSec = (moonDeg % 360) * 3600;
  const starIdx = Math.floor(moonSec / totalStarSec);
  const elapsedInStarSec = moonSec % totalStarSec;
  const elapsedRatio = elapsedInStarSec / totalStarSec;
  const balanceRatio = 1.0 - elapsedRatio;

  // Star lord order
  const firstLord = VIMSHOTTARI_ORDER[starIdx % 9];
  const firstLordIndex = VIMSHOTTARI_ORDER.indexOf(firstLord);

  const dasaList = [];
  let curStart = new Date(birthDate.getTime());

  // Balance of first Dasa
  const firstDasaFullYears = PLANETS[firstLord].dasaYears;
  const balanceYears = firstDasaFullYears * balanceRatio;
  const firstDasaEnd = addYearsToDate(curStart, balanceYears);

  // Generate 9 major Dasas (120 years cycle)
  for (let i = 0; i < 9; i++) {
    const lord = VIMSHOTTARI_ORDER[(firstLordIndex + i) % 9];
    const totalYears = PLANETS[lord].dasaYears;

    let startDate, endDate;
    if (i === 0) {
      startDate = new Date(curStart.getTime());
      endDate = new Date(firstDasaEnd.getTime());
    } else {
      startDate = new Date(dasaList[i - 1].endDate.getTime());
      endDate = addYearsToDate(startDate, totalYears);
    }

    // Bhuktis within this Dasa
    const bhuktis = calculateBhuktis(lord, startDate, (endDate.getTime() - startDate.getTime()) / (365.25 * 86400000));

    dasaList.push({
      lord,
      lordTamil: PLANETS[lord].tamil,
      color: PLANETS[lord].color,
      startDate,
      endDate,
      startStr: formatDate(startDate),
      endStr: formatDate(endDate),
      years: i === 0 ? balanceYears : totalYears,
      bhuktis
    });
  }

  // Find currently running Dasa and Bhukti
  const now = new Date();
  let currentDasa = null;
  let currentBhukti = null;

  for (const d of dasaList) {
    if (now >= d.startDate && now < d.endDate) {
      currentDasa = d;
      for (const b of d.bhuktis) {
        if (now >= b.startDate && now < b.endDate) {
          currentBhukti = b;
          break;
        }
      }
      break;
    }
  }

  return {
    birthDate,
    balanceLord: firstLord,
    balanceLordTamil: PLANETS[firstLord].tamil,
    balanceYears: balanceYears.toFixed(2),
    dasaList,
    currentDasa,
    currentBhukti
  };
}

function calculateBhuktis(dasaLord, dasaStartDate, effectiveDasaYears) {
  const lordIndex = VIMSHOTTARI_ORDER.indexOf(dasaLord);
  const bhuktis = [];
  let curStart = new Date(dasaStartDate.getTime());

  for (let b = 0; b < 9; b++) {
    const bLord = VIMSHOTTARI_ORDER[(lordIndex + b) % 9];
    const bYearsRatio = PLANETS[bLord].dasaYears / 120.0;
    const bYears = effectiveDasaYears * bYearsRatio;
    const bEnd = addYearsToDate(curStart, bYears);

    bhuktis.push({
      lord: bLord,
      lordTamil: PLANETS[bLord].tamil,
      startDate: new Date(curStart.getTime()),
      endDate: new Date(bEnd.getTime()),
      startStr: formatDate(curStart),
      endStr: formatDate(bEnd),
      years: bYears.toFixed(2)
    });

    curStart = new Date(bEnd.getTime());
  }

  return bhuktis;
}

function addYearsToDate(date, yearsFloat) {
  const days = yearsFloat * 365.2422;
  const newDate = new Date(date.getTime() + days * 86400000);
  return newDate;
}

export function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${d}-${m}-${y}`;
}
