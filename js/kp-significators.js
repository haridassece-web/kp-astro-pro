/**
 * KP 4-Fold Significators (காரகத்துவங்கள்) & Cuspal Interlinks Engine
 */

import { SIGNS, PLANETS } from './kp-constants.js';

/**
 * Calculates 4-fold significators for all 12 houses and all 9 planets
 *
 * House-wise Significators:
 * - Grade A (Level 1): Planets in the star of the occupant(s) of the house
 * - Grade B (Level 2): Occupant(s) of the house
 * - Grade C (Level 3): Planets in the star of the lord of the house
 * - Grade D (Level 4): Lord of the house
 *
 * Planet-wise Significations:
 * - Level 1: House occupied by planet's Star Lord
 * - Level 2: House occupied by planet itself
 * - Level 3: Houses owned by planet's Star Lord
 * - Level 4: Houses owned by planet itself
 */
export function calculateSignificators(chart) {
  const { cusps, planets } = chart;

  // 1. Identify ownership of each house
  // In KP, house lord is the sign lord where the cusp point falls
  const houseLords = {};
  cusps.forEach(c => {
    houseLords[c.house] = c.signLord;
  });

  // 2. Identify occupants of each house (Grade B)
  const houseOccupants = {};
  for (let h = 1; h <= 12; h++) {
    houseOccupants[h] = [];
  }
  planets.forEach(p => {
    if (p.house >= 1 && p.house <= 12) {
      houseOccupants[p.house].push(p.key);
    }
  });

  // 3. For each planet, who is in its star?
  const planetsInStarOf = {};
  planets.forEach(p => {
    planetsInStarOf[p.key] = [];
  });
  planets.forEach(p => {
    if (planetsInStarOf[p.starLord]) {
      planetsInStarOf[p.starLord].push(p.key);
    }
  });

  // 4. Calculate 4-Fold Significators for each House (1 - 12)
  const houseSignificators = [];
  for (let h = 1; h <= 12; h++) {
    const lord = houseLords[h];
    const occupants = houseOccupants[h];

    // Grade A: Planets in the star of occupants
    const gradeA = [];
    occupants.forEach(occ => {
      (planetsInStarOf[occ] || []).forEach(pl => {
        if (!gradeA.includes(pl)) gradeA.push(pl);
      });
    });

    // Grade B: Occupants
    const gradeB = [...occupants];

    // Grade C: Planets in the star of the house lord
    const gradeC = [...(planetsInStarOf[lord] || [])];

    // Grade D: House lord
    const gradeD = [lord];

    // Combined unique significators
    const allSignificators = Array.from(new Set([...gradeA, ...gradeB, ...gradeC, ...gradeD]));

    houseSignificators.push({
      house: h,
      name: `${h}-ம் பாவம்`,
      cuspSign: cusps[h - 1].signTamil,
      cuspStar: cusps[h - 1].starTamil,
      cuspSub: cusps[h - 1].subLordTamil,
      gradeA,
      gradeB,
      gradeC,
      gradeD,
      allSignificators
    });
  }

  // 5. Calculate Planet-wise significations
  // Map which houses a planet owns
  const housesOwnedByPlanet = {};
  Object.keys(PLANETS).forEach(pk => { housesOwnedByPlanet[pk] = []; });
  for (let h = 1; h <= 12; h++) {
    const l = houseLords[h];
    if (housesOwnedByPlanet[l]) {
      housesOwnedByPlanet[l].push(h);
    }
  }

  const planetSignifications = planets.map(p => {
    const starLordKey = p.starLord;
    const starLordPlanet = planets.find(pl => pl.key === starLordKey);
    const starLordHouse = starLordPlanet ? starLordPlanet.house : null;

    const subLordKey = p.subLord;
    const subLordPlanet = planets.find(pl => pl.key === subLordKey);

    const l1 = starLordHouse ? [starLordHouse] : [];
    const l2 = [p.house];
    const l3 = housesOwnedByPlanet[starLordKey] || [];
    let l4 = housesOwnedByPlanet[p.key] || [];
    // KP Rule: Nodes (Rahu & Ketu) represent the lord of the sign they occupy
    if (p.key === 'Rahu' || p.key === 'Ketu') {
      const nodeLord = p.signLord;
      const nodeLordHouses = housesOwnedByPlanet[nodeLord] || [];
      l4 = Array.from(new Set([...l4, ...nodeLordHouses]));
    }

    const allHouses = Array.from(new Set([...l1, ...l2, ...l3, ...l4])).sort((a, b) => a - b);

    return {
      planet: p.key,
      tamil: p.tamil,
      short: p.short,
      color: p.color,
      houseOccupied: p.house,
      starLord: starLordKey,
      starLordTamil: p.starLordTamil,
      subLord: subLordKey,
      subLordTamil: p.subLordTamil,
      level1: l1,
      level2: l2,
      level3: l3,
      level4: l4,
      signifiedHouses: allHouses,
      signifiedHousesStr: allHouses.join(', ') || '-'
    };
  });

  return {
    houseSignificators,
    planetSignifications
  };
}

/**
 * Cuspal Interlinks for all 12 cusps
 */
export function getCuspalInterlinks(chart, planetSignifications) {
  const { cusps } = chart;
  const pMap = {};
  planetSignifications.forEach(ps => { pMap[ps.planet] = ps; });

  return cusps.map(c => {
    const subLordSig = pMap[c.subLord];
    const starLordSig = pMap[c.starLord];

    return {
      house: c.house,
      name: c.name,
      signLordTamil: c.signLordTamil,
      starLordTamil: c.starLordTamil,
      subLordTamil: c.subLordTamil,
      subLordSignifies: subLordSig ? subLordSig.signifiedHouses : [],
      starLordSignifies: starLordSig ? starLordSig.signifiedHouses : []
    };
  });
}
