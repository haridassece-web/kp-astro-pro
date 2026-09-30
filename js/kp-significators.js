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
function getRelativeHouse(targetH, baseH) {
  return ((targetH - baseH + 12) % 12) || 12;
}

function evaluateHouseScore(signifiedHouses, baseHouse) {
  if (!signifiedHouses || signifiedHouses.length === 0) return 50;
  let score = 50;
  signifiedHouses.forEach(h => {
    const rel = getRelativeHouse(h, baseHouse);
    if (rel === 8 || rel === 12) score -= 20;
    else if (rel === 4) score -= 10;
    else if ([1, 3, 5, 9, 11].includes(rel)) score += 15;
    else if ([2, 6, 10].includes(rel)) score += 10;
  });
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Cuspal Interlinks & Bhava Koduppinai Analysis Engine
 * Calculates:
 * 1. 60% CSL, 25% SSL, 15% SL Weightage Koduppinai % Score
 * 2. Agavilaivu (Internal Effect) 4-Rule Classifier (Rule 1, 2, 3, 4)
 * 3. Sub-Lord Termination Mechanics (Immediate 8/12, Gradual 4/10, Moderate 2/6)
 * 4. Puravilaivu (External Effect) Source, Matter, Decider & Dasa Agents
 * 5. Malefic Rajayoga (6,8,12 Negation) & 5,9 Divine Grace
 */
export function getCuspalInterlinks(chart, planetSignifications) {
  const { cusps, planets } = chart;
  const pMap = {};
  planetSignifications.forEach(ps => { pMap[ps.planet] = ps; });

  return cusps.map(c => {
    const h = c.house;
    const cslKey = c.subLord;
    const sslKey = c.subSubLord || c.subLord;
    const slKey = c.starLord;

    const cslSig = pMap[cslKey] ? pMap[cslKey].signifiedHouses : [];
    const sslSig = pMap[sslKey] ? pMap[sslKey].signifiedHouses : [];
    const slSig = pMap[slKey] ? pMap[slKey].signifiedHouses : [];

    const cslScore = evaluateHouseScore(cslSig, h);
    const sslScore = evaluateHouseScore(sslSig, h);
    const slScore = evaluateHouseScore(slSig, h);

    // 60% CSL, 25% SSL, 15% SL
    const netScore = Math.round(cslScore * 0.60 + sslScore * 0.25 + slScore * 0.15);

    // CSL Planet's Star Lord and Sub Lord (Agavilaivu)
    const cslPlanet = planets.find(p => p.key === cslKey);
    const cslStarSig = cslPlanet && pMap[cslPlanet.starLord] ? pMap[cslPlanet.starLord].signifiedHouses : [];
    const cslSubSig = cslPlanet && pMap[cslPlanet.subLord] ? pMap[cslPlanet.subLord].signifiedHouses : [];

    const starScore = evaluateHouseScore(cslStarSig, h);
    const subScore = evaluateHouseScore(cslSubSig, h);

    const starFav = starScore >= 50;
    const subFav = subScore >= 50;

    let ruleId = 3;
    let ruleTitle = "விதி 3: 100% தடையற்ற நீடித்த உன்னத வெற்றி";
    let ruleDesc = "நட்சத்திரமும் உபநட்சத்திரமும் சாதகமாக உள்ளதால் எவ்வித தடைகளுமின்றி இந்த பாவ பலனை 100% நீடித்து அனுபவிப்பார்.";
    let ruleColor = "#10b981";

    if (starFav && !subFav) {
      ruleId = 1;
      ruleTitle = "விதி 1: ஆரம்பத்தில் சாதகம் -> பின்பு முட்டுக்கட்டை";
      ruleDesc = "ஆரம்பத்தில் பாவ பலனை சிறப்பாக அனுபவித்தாலும் பின்பு உபநட்சத்திரம் பாதகமாக இருப்பதால் நீடித்த நிலையில் அனுபவிக்க முடியாது.";
      ruleColor = "#f59e0b";
    } else if (!starFav && subFav) {
      ruleId = 2;
      ruleTitle = "விதி 2: ஆரம்பத் தடை -> பின்பு போராடி நீடித்த வெற்றி";
      ruleDesc = "ஆரம்பத்தில் தடைகள்/சிரமங்கள் இருந்தாலும், உபநட்சத்திரம் சாதகமாக இருப்பதால் போராட்டத்திற்குப் பின் நீடித்து சிறப்பாக அனுபவிப்பார்.";
      ruleColor = "#3b82f6";
    } else if (!starFav && !subFav) {
      ruleId = 4;
      ruleTitle = "விதி 4: தொடர் தடைகளும் தோல்விகளும்";
      ruleDesc = "நட்சத்திரமும் உபநட்சத்திரமும் பாதகமாக உள்ளதால் எவ்வித முன்னேற்றமுமின்றி தொடர்ந்து பிரச்சினைகளுடனே அனுபவிப்பார்.";
      ruleColor = "#ef4444";
    }

    // Sub-Lord Termination Mechanics
    let termCode = "SUSTAINED";
    let termLabel = "தடையற்ற தொடர்ச்சி";
    let termDesc = "உபநட்சத்திரம் நட்சத்திரத்தின் பலனைத் தடையின்றி நீடிக்க வைக்கும்.";
    let termColor = "#10b981";

    let has812Rel = false;
    let has410Rel = false;
    let has26Rel = false;

    cslStarSig.forEach(stH => {
      cslSubSig.forEach(sbH => {
        const rel = getRelativeHouse(sbH, stH);
        if (rel === 8 || rel === 12) has812Rel = true;
        if (rel === 4 || rel === 10) has410Rel = true;
        if (rel === 2 || rel === 6) has26Rel = true;
      });
    });

    if (has812Rel) {
      termCode = "IMMEDIATE";
      termLabel = "உடனடி செயலிழப்பு (8, 12)";
      termDesc = "உபநட்சத்திரம் 8, 12-ம் பாவத்தைக் காட்டுவதால் நட்சத்திரச் சம்பவம் உடனடியாகச் செயலிழந்து விடும்.";
      termColor = "#ef4444";
    } else if (has410Rel) {
      termCode = "GRADUAL";
      termLabel = "படிப்படியான செயலிழப்பு (4, 10)";
      termDesc = "உபநட்சத்திரம் 4, 10-ம் பாவத்தைக் காட்டுவதால் சுமார் 70% நடைபெற்ற பின்பு படிப்படியாகச் செயலிழக்கும்.";
      termColor = "#f59e0b";
    } else if (has26Rel) {
      termCode = "MODERATE";
      termLabel = "சராசரி உழைப்புடன் செயல்பாடு (2, 6)";
      termDesc = "உபநட்சத்திரம் 2, 6-ம் பாவத்தைக் காட்டுவதால் சில சிரமங்களுடன் சராசரி அளவுக்கு உட்பட்டு செயல்படும்.";
      termColor = "#3b82f6";
    }

    // Dasa Agents (பிரதிநிதிகள்)
    const agentPlanets = planets.filter(p => p.starLord === cslKey || p.subLord === cslKey).map(p => p.tamil);

    // Rajayoga for 6, 8, 12
    let isRajayoga = false;
    if ([6, 8, 12].includes(h)) {
      if (termCode === "IMMEDIATE" || termCode === "GRADUAL" || !subFav) {
        isRajayoga = true;
      }
    }

    // Divine Grace for 5, 9
    let divineGrace = null;
    if ([5, 9].includes(h)) {
      const is2610 = cslSubSig.some(sh => [2, 6, 10].includes(sh));
      const is812 = cslSubSig.some(sh => [8, 12].includes(sh));
      if (is2610) {
        divineGrace = "தெய்வ அனுக்கிரகத்தால் முயற்சியின்றி தனம் / கமிஷன் வருமானம் அமையும்.";
      } else if (is812) {
        divineGrace = "பூர்வ புண்ணியம் கெட்டு வினையால் துன்பம் ஏற்படும் எச்சரிக்கை.";
      }
    }

    return {
      house: h,
      name: `${h}-ம் பாவம்`,
      signLordTamil: c.signLordTamil,
      starLordTamil: c.starLordTamil,
      subLordTamil: c.subLordTamil,
      subSubLordTamil: c.subSubLordTamil || c.subLordTamil,
      cslWeight: '60%',
      sslWeight: '25%',
      slWeight: '15%',
      subLordSignifies: cslSig,
      starLordSignifies: slSig,
      sslSignifies: sslSig,
      cslScore,
      sslScore,
      slScore,
      netScore,
      ruleId,
      ruleTitle,
      ruleDesc,
      ruleColor,
      termCode,
      termLabel,
      termDesc,
      termColor,
      cslStarSig,
      cslSubSig,
      sourceHouse: cslPlanet ? cslPlanet.house : h,
      agentPlanets,
      isRajayoga,
      divineGrace
    };
  });
}

