/**
 * KP Horary (1-249) Engine
 * Generates Horary Chart, Analyzes Cuspal Sub-Lords, Computes Verdict, and Predicts Event Timing
 */

import { KP_249_TABLE, HORARY_QUESTIONS, PLANETS } from './kp-constants.js';
import { calculatePlacidusCusps, calculatePlanetaryPositions, getPlanetHouseInPlacidus, getKpAyanamsa, getJulianDay, getSiderealTime, getObliquity } from './kp-astronomy.js';
import { calculateSignificators } from './kp-significators.js';

export function calculateHoraryChart({ horaryNo, year, month, day, hour, minute, second = 0, lat, lng, tz }) {
  const subEntry = KP_249_TABLE.find(s => s.no === parseInt(horaryNo, 10)) || KP_249_TABLE[0];
  const horaryAscNirayana = subEntry.startTotalDeg;

  const utcHour = (hour + minute / 60.0 + second / 3600.0) - tz;
  const jd = getJulianDay(year, month, day, utcHour);
  const ayanamsa = getKpAyanamsa(jd);
  const { lst, ramc } = getSiderealTime(jd, lng);
  const eps = getObliquity(jd);

  // In KP Horary, the 1st Cusp is fixed by the selected Horary Number's Nirayana longitude.
  // Standard Placidus cusps are computed, then rotated so Cusp 1 starts at the Horary Ascendant.
  const stdCusps = calculatePlacidusCusps(ramc, lat, eps, ayanamsa);
  const lagnaOffset = (horaryAscNirayana - stdCusps[0].nirayanaDeg + 360) % 360;

  // Re-adjust cusps relative to Horary Lagna
  const horaryCusps = stdCusps.map(c => {
    const adjustedNirayana = (c.nirayanaDeg + lagnaOffset) % 360;
    const subInfo = KP_249_TABLE.find(s =>
      adjustedNirayana >= s.startTotalDeg - 0.0001 && adjustedNirayana < s.endTotalDeg - 0.0001
    ) || subEntry;

    const signIdx = Math.floor(adjustedNirayana / 30);
    const sign = {
      name: subInfo.signName,
      tamil: subInfo.signTamil,
      lord: subInfo.signLord,
      lordTamil: subInfo.signLordTamil
    };
    const degInSign = adjustedNirayana % 30;

    return {
      house: c.house,
      name: `${c.house}-ம் பாவம்`,
      nirayanaDeg: adjustedNirayana,
      signIdx,
      signName: sign.name,
      signTamil: sign.tamil,
      signLord: sign.lord,
      signLordTamil: sign.lordTamil,
      starName: subInfo.starName,
      starTamil: subInfo.starTamil,
      starLord: subInfo.starLord,
      starLordTamil: subInfo.starLordTamil,
      subLord: subInfo.subLord,
      subLordTamil: subInfo.subLordTamil,
      subNo: subInfo.no,
      degInSign,
      formattedDms: subInfo.formattedDms,
      fullLongitudeStr: `${sign.tamil} ${subInfo.formattedDms}`
    };
  });

  // Calculate current planetary positions
  const planets = calculatePlanetaryPositions(jd, ayanamsa);
  planets.forEach(p => {
    p.house = getPlanetHouseInPlacidus(p.nirayanaDeg, horaryCusps);
  });

  const chart = {
    horaryNo: subEntry.no,
    subEntry,
    jd,
    ayanamsa,
    cusps: horaryCusps,
    planets,
    dateTime: { year, month, day, hour, minute, second, tz },
    location: { lat, lng }
  };

  const significators = calculateSignificators(chart);

  return {
    chart,
    significators
  };
}

/**
 * Analyzes a Horary Question using KP Cuspal Interlink Rules
 */
export function analyzeHoraryQuestion(horaryResult, questionId) {
  const { chart, significators } = horaryResult;
  const question = HORARY_QUESTIONS.find(q => q.id === questionId) || HORARY_QUESTIONS[0];

  const primaryCusp = chart.cusps[question.primaryHouse - 1];
  const cuspSubLord = primaryCusp.subLord;
  const cuspSubLordTamil = primaryCusp.subLordTamil;

  // Planet signifier data for the cusp sub-lord
  const subLordSignification = significators.planetSignifications.find(p => p.planet === cuspSubLord);
  const subLordPlanet = chart.planets.find(p => p.key === cuspSubLord);

  // Sub-Lord's Star Lord
  const subLordStarLord = subLordPlanet ? subLordPlanet.starLord : cuspSubLord;
  const subLordStarLordSignification = significators.planetSignifications.find(p => p.planet === subLordStarLord);

  // Sub-Lord's Sub-Lord (deciding factor)
  const subLordSubLord = subLordPlanet ? subLordPlanet.subLord : cuspSubLord;
  const subLordSubLordSignification = significators.planetSignifications.find(p => p.planet === subLordSubLord);

  // Houses signified by Star Lord (Action / Source)
  const starLordHouses = subLordStarLordSignification ? subLordStarLordSignification.signifiedHouses : [];

  // Houses signified by Sub-Lord (Result / Decision)
  const subLordHouses = subLordSubLordSignification ? subLordSubLordSignification.signifiedHouses : [];

  // Check favorability
  const favMatches = subLordHouses.filter(h => question.favorableHouses.includes(h));
  const unfavMatches = subLordHouses.filter(h => question.unfavorableHouses.includes(h));

  let score = 50;
  let verdict = 'நடுநிலை / தாமதம்';
  let verdictEn = 'Moderate / Delay';
  let verdictClass = 'warning';

  if (favMatches.length > unfavMatches.length) {
    score = 75 + Math.min(25, favMatches.length * 10 - unfavMatches.length * 5);
    verdict = 'மிகவும் சாதகமானது! (Yes / Highly Favorable)';
    verdictEn = 'Highly Favorable (Yes)';
    verdictClass = 'success';
  } else if (unfavMatches.length > favMatches.length) {
    score = Math.max(10, 40 - unfavMatches.length * 10);
    verdict = 'சாதகமற்றது / வாய்ப்பு குறைவு (Unfavorable / No)';
    verdictEn = 'Unfavorable (No)';
    verdictClass = 'danger';
  } else {
    score = 50;
    verdict = 'போராட்டம் / காலதாமதத்திற்குப் பின் சாத்தியம் (Delayed Fruition)';
    verdictEn = 'Possible after Delay';
    verdictClass = 'warning';
  }

  // Reason description in pure Tamil
  let reasoningTamil = `
    கேள்விக்குரிய பிரதான பாவம்: <strong>${question.primaryHouse}-ம் பாவம்</strong>.<br>
    இப்பாவத்தின் உப-நாதன் (Sub-Lord): <strong style="color:${PLANETS[cuspSubLord].color}">${cuspSubLordTamil} (${cuspSubLord})</strong>.<br>
    இதன் நட்சத்திர நாதன்: <strong>${PLANETS[subLordStarLord].tamil}</strong> (பாவங்கள்: ${starLordHouses.join(', ') || 'இல்லை'}).<br>
    இதன் உப-நாதன் (தீர்மானிப்பவர்): <strong>${PLANETS[subLordSubLord].tamil}</strong> (பாவங்கள்: ${subLordHouses.join(', ') || 'இல்லை'}).<br><br>
    கே.பி. விதிப்படி சாதகமான பாவங்கள்: <strong>${question.favorableHouses.join(', ')}</strong>.<br>
    பாதகமான பாவங்கள்: <strong>${question.unfavorableHouses.join(', ')}</strong>.<br>
    உப-நாதன் தொடர்பு கொண்ட சாதக பாவங்கள்: <strong>${favMatches.length > 0 ? favMatches.join(', ') : 'இல்லை'}</strong> | பாதக பாவங்கள்: <strong>${unfavMatches.length > 0 ? unfavMatches.join(', ') : 'இல்லை'}</strong>.
  `;

  return {
    question,
    primaryCusp,
    cuspSubLord,
    cuspSubLordTamil,
    subLordStarLord,
    subLordStarLordTamil: PLANETS[subLordStarLord].tamil,
    subLordSubLord,
    subLordSubLordTamil: PLANETS[subLordSubLord].tamil,
    starLordHouses,
    subLordHouses,
    favMatches,
    unfavMatches,
    score,
    verdict,
    verdictEn,
    verdictClass,
    reasoningTamil
  };
}
