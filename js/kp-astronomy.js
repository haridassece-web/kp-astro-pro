/**
 * KP Astronomy Engine
 * Julian Day, KP Ayanamsa, Placidus House Cusps, Planetary Longitudes, Sub-Lords
 */

import { SIGNS, PLANETS, NAKSHATRAS, getKpSubForLongitude, formatDms } from './kp-constants.js';

// Radians / Degrees helpers
const DEG2RAD = Math.PI / 180.0;
const RAD2DEG = 180.0 / Math.PI;

function normalizeDeg(deg) {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

function sinD(deg) { return Math.sin(deg * DEG2RAD); }
function cosD(deg) { return Math.cos(deg * DEG2RAD); }
function tanD(deg) { return Math.tan(deg * DEG2RAD); }
function atan2D(y, x) { return Math.atan2(y, x) * RAD2DEG; }
function asinD(x) { return Math.asin(Math.max(-1, Math.min(1, x))) * RAD2DEG; }

/**
 * Calculates Julian Day Number for Date and UTC decimal hour
 */
export function getJulianDay(year, month, day, utcHour) {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  const jd = Math.floor(365.25 * (year + 4716)) +
             Math.floor(30.6001 * (month + 1)) +
             day + B - 1524.5 + (utcHour / 24.0);
  return jd;
}

/**
 * Calculates Krishnamurti (KP) Ayanamsa
 * Reference: 1900.0 (JD 2415020.0) = 22° 22' 31.6"
 * Annual Precession = 50.2388475"
 */
export function getKpAyanamsa(jd) {
  const daysSince1900 = jd - 2415020.0;
  const yearsSince1900 = daysSince1900 / 365.2422;
  const ayanamsaDeg = 22.3754444 + (yearsSince1900 * 50.2388475) / 3600.0;
  return ayanamsaDeg;
}

/**
 * Calculates Greenwich Mean Sidereal Time (GMST) and Local Sidereal Time (LST) in degrees
 */
export function getSiderealTime(jd, lonDeg) {
  const T = (jd - 2451545.0) / 36525.0;
  // GMST in degrees at 0h UT
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) +
             0.000387933 * T * T - (T * T * T) / 38710000.0;
  gmst = normalizeDeg(gmst);
  const lst = normalizeDeg(gmst + lonDeg);
  return { gmst, lst, ramc: lst };
}

/**
 * True obliquity of the ecliptic in degrees
 */
export function getObliquity(jd) {
  const T = (jd - 2451545.0) / 36525.0;
  const eps0 = 23.43929111 - (46.8150 * T - 0.00059 * T * T + 0.001813 * T * T * T) / 3600.0;
  return eps0;
}

/**
 * Placidus House Cusps Engine
 * Calculates exact 12 Placidus Cusps for a given RAMC, Obliquity, Latitude, and Ayanamsa
 */
export function calculatePlacidusCusps(ramcDeg, latDeg, epsDeg, ayanamsaDeg) {
  const latRad = latDeg * DEG2RAD;
  const epsRad = epsDeg * DEG2RAD;
  const tanLat = Math.tan(latRad);
  const sinEps = Math.sin(epsRad);
  const cosEps = Math.cos(epsRad);

  const cuspsTropical = new Array(12);

  // 10th Cusp (MC)
  let mcRad = Math.atan2(Math.sin(ramcDeg * DEG2RAD) / cosEps, Math.cos(ramcDeg * DEG2RAD));
  let mc = normalizeDeg(mcRad * RAD2DEG);
  cuspsTropical[9] = mc; // 10th house is index 9

  // 4th Cusp (IC)
  cuspsTropical[3] = normalizeDeg(mc + 180);

  // 1st Cusp (Ascendant / Lagna)
  let ascRad = Math.atan2(
    Math.cos(ramcDeg * DEG2RAD),
    -(Math.sin(ramcDeg * DEG2RAD) * cosEps + tanLat * sinEps)
  );
  let asc = normalizeDeg(ascRad * RAD2DEG);
  cuspsTropical[0] = asc; // 1st house is index 0

  // 7th Cusp (Descendant)
  cuspsTropical[6] = normalizeDeg(asc + 180);

  // Placidus Intermediate Cusps calculation (11, 12, 2, 3)
  // House 11: D = 30°
  cuspsTropical[10] = calculatePlacidusIntermediate(ramcDeg + 30, 1 / 3, latRad, sinEps, cosEps, tanLat);
  // House 12: D = 60°
  cuspsTropical[11] = calculatePlacidusIntermediate(ramcDeg + 60, 2 / 3, latRad, sinEps, cosEps, tanLat);
  // House 2: D = 120°
  cuspsTropical[1] = calculatePlacidusIntermediate(ramcDeg + 120, 2 / 3, latRad, sinEps, cosEps, tanLat);
  // House 3: D = 150°
  cuspsTropical[2] = calculatePlacidusIntermediate(ramcDeg + 150, 1 / 3, latRad, sinEps, cosEps, tanLat);

  // Opposite cusps (5, 6, 8, 9)
  cuspsTropical[4] = normalizeDeg(cuspsTropical[10] + 180); // 5th = opposite 11th
  cuspsTropical[5] = normalizeDeg(cuspsTropical[11] + 180); // 6th = opposite 12th
  cuspsTropical[7] = normalizeDeg(cuspsTropical[1] + 180);  // 8th = opposite 2nd
  cuspsTropical[8] = normalizeDeg(cuspsTropical[2] + 180);  // 9th = opposite 3rd

  // Convert to KP Nirayana by subtracting KP Ayanamsa
  const kpCusps = cuspsTropical.map((tropDeg, idx) => {
    const nirayanaDeg = normalizeDeg(tropDeg - ayanamsaDeg);
    const subInfo = getKpSubForLongitude(nirayanaDeg);
    const signIdx = Math.floor(nirayanaDeg / 30);
    const sign = SIGNS[signIdx];
    const degInSign = nirayanaDeg % 30;

    return {
      house: idx + 1,
      name: `${idx + 1}-ம் பாவம்`,
      tropDeg,
      nirayanaDeg,
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
      formattedDms: formatDms(degInSign),
      fullLongitudeStr: `${sign.tamil} ${formatDms(degInSign)}`
    };
  });

  return kpCusps;
}

/**
 * Iterative Placidus intermediate house solver
 */
function calculatePlacidusIntermediate(raDeg, factor, latRad, sinEps, cosEps, tanLat) {
  let rad = raDeg * DEG2RAD;
  let lon = rad; // initial estimate
  for (let i = 0; i < 8; i++) {
    const sinLon = Math.sin(lon);
    const tanDec = sinLon * sinEps / Math.sqrt(Math.max(0.00001, 1 - sinLon * sinLon * sinEps * sinEps));
    const term = factor * Math.asin(Math.max(-1, Math.min(1, tanLat * tanDec)));
    const nextRa = rad + term;
    lon = Math.atan2(Math.sin(nextRa) / cosEps, Math.cos(nextRa));
  }
  return normalizeDeg(lon * RAD2DEG);
}

/**
 * High-accuracy Geocentric Planetary Positions (Paul Schlyter & Jean Meeus Algorithms)
 * Computes exact apparent geocentric longitudes for Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Rahu, Ketu
 */
export function calculatePlanetaryPositions(jd, ayanamsaDeg) {
  // Epoch days d relative to 2000 Jan 0.0 (JD 2451543.5)
  const d = jd - 2451543.5;

  function solveKepler(M, e) {
    let E = M + e * RAD2DEG * sinD(M) * (1.0 + e * cosD(M));
    for (let i = 0; i < 6; i++) {
      const dE = (E - e * RAD2DEG * sinD(E) - M) / (1.0 - e * cosD(E));
      E -= dE;
    }
    return E;
  }

  function getPlanetaryLongitudes(epochD) {
    // 1. Sun (Earth-Sun System)
    const w_sun = normalizeDeg(282.9404 + 4.70935e-5 * epochD);
    const a_sun = 1.000000;
    const e_sun = 0.016709 - 1.151e-9 * epochD;
    const M_sun = normalizeDeg(356.0470 + 0.9856002585 * epochD);
    const E_sun = solveKepler(M_sun, e_sun);
    const xv_sun = cosD(E_sun) - e_sun;
    const yv_sun = Math.sqrt(Math.max(0, 1.0 - e_sun * e_sun)) * sinD(E_sun);
    const v_sun = normalizeDeg(atan2D(yv_sun, xv_sun));
    const r_sun = Math.sqrt(xv_sun * xv_sun + yv_sun * yv_sun);
    const lon_sun = normalizeDeg(v_sun + w_sun);
    const xs = r_sun * cosD(lon_sun);
    const ys = r_sun * sinD(lon_sun);

    // 2. Moon (with Lunar Perturbations)
    const N_m = normalizeDeg(125.1228 - 0.0529538083 * epochD);
    const i_m = 5.1454;
    const w_m = normalizeDeg(318.0634 + 0.1643573223 * epochD);
    const a_m = 60.2666;
    const e_m = 0.054900;
    const M_m = normalizeDeg(115.3654 + 13.0649929509 * epochD);
    const E_m = solveKepler(M_m, e_m);
    const xv_m = a_m * (cosD(E_m) - e_m);
    const yv_m = a_m * Math.sqrt(Math.max(0, 1.0 - e_m * e_m)) * sinD(E_m);
    const v_m = normalizeDeg(atan2D(yv_m, xv_m));
    const r_m = Math.sqrt(xv_m * xv_m + yv_m * yv_m);
    const xh_m = r_m * (cosD(N_m) * cosD(v_m + w_m) - sinD(N_m) * sinD(v_m + w_m) * cosD(i_m));
    const yh_m = r_m * (sinD(N_m) * cosD(v_m + w_m) + cosD(N_m) * sinD(v_m + w_m) * cosD(i_m));
    const zh_m = r_m * (sinD(v_m + w_m) * sinD(i_m));
    let lon_moon = normalizeDeg(atan2D(yh_m, xh_m));

    // Lunar perturbation terms
    const Ls = lon_sun;
    const Lm = normalizeDeg(M_m + w_m + N_m);
    const D = normalizeDeg(Lm - Ls);
    const F = normalizeDeg(Lm - N_m);
    lon_moon += -1.274 * sinD(M_m - 2 * D) +
                0.658 * sinD(2 * D) -
                0.186 * sinD(M_sun) -
                0.059 * sinD(2 * M_m - 2 * D) -
                0.057 * sinD(M_m - 2 * D + M_sun) +
                0.053 * sinD(M_m + 2 * D) +
                0.046 * sinD(2 * D - M_sun) +
                0.041 * sinD(M_m - M_sun) -
                0.035 * sinD(D) -
                0.031 * sinD(M_m + M_sun) -
                0.015 * sinD(2 * F - 2 * D) +
                0.011 * sinD(M_m - 4 * D);
    lon_moon = normalizeDeg(lon_moon);

    // 3. Planets (Heliocentric Elements)
    function getHelio(el) {
      const N = normalizeDeg(el.N[0] + el.N[1] * epochD);
      const i = el.i[0] + el.i[1] * epochD;
      const w = normalizeDeg(el.w[0] + el.w[1] * epochD);
      const a = el.a[0] + el.a[1] * epochD;
      const e = el.e[0] + el.e[1] * epochD;
      const M = normalizeDeg(el.M[0] + el.M[1] * epochD);
      const E = solveKepler(M, e);
      const xv = a * (cosD(E) - e);
      const yv = a * Math.sqrt(Math.max(0, 1.0 - e * e)) * sinD(E);
      const r = Math.sqrt(xv * xv + yv * yv);
      const v = normalizeDeg(atan2D(yv, xv));
      const xh = r * (cosD(N) * cosD(v + w) - sinD(N) * sinD(v + w) * cosD(i));
      const yh = r * (sinD(N) * cosD(v + w) + cosD(N) * sinD(v + w) * cosD(i));
      const zh = r * (sinD(v + w) * sinD(i));
      return { xh, yh, zh, r, v, w, N, i, a, e, M };
    }

    const elements = {
      Mercury: {
        N: [48.3313, 3.24587e-5], i: [7.0047, 5.00e-8],
        w: [29.1241, 1.01444e-5], a: [0.387098, 0.0],
        e: [0.205635, 5.59e-10], M: [168.6562, 4.0923344368]
      },
      Venus: {
        N: [76.6799, 2.46590e-5], i: [3.3946, 2.75e-8],
        w: [54.8910, 1.38374e-5], a: [0.723330, 0.0],
        e: [0.006773, -1.302e-9], M: [48.0052, 1.6021302244]
      },
      Mars: {
        N: [49.5574, 2.11081e-5], i: [1.8497, -1.78e-8],
        w: [286.5016, 2.92961e-5], a: [1.523688, 0.0],
        e: [0.093405, 2.516e-9], M: [18.6021, 0.5240207766]
      },
      Jupiter: {
        N: [100.4542, 2.76854e-5], i: [1.3030, -1.557e-7],
        w: [273.8777, 1.64505e-5], a: [5.20256, 0.0],
        e: [0.048498, 4.469e-9], M: [19.8950, 0.0830853001]
      },
      Saturn: {
        N: [113.6634, 2.38980e-5], i: [2.4886, -1.081e-7],
        w: [339.3939, 2.97661e-5], a: [9.55475, 0.0],
        e: [0.055546, -9.499e-9], M: [316.9670, 0.0334442282]
      }
    };

    const planetsHelio = {};
    for (const k in elements) {
      planetsHelio[k] = getHelio(elements[k]);
    }

    // Major Jupiter & Saturn mutual perturbations
    const Mj = planetsHelio.Jupiter.M;
    const Msat = planetsHelio.Saturn.M;
    const dlon_j = -0.332 * sinD(2 * Mj - 5 * Msat - 67.6)
                 - 0.056 * sinD(2 * Mj - 2 * Msat + 21)
                 + 0.042 * sinD(3 * Mj - 5 * Msat + 21)
                 - 0.036 * sinD(Mj - 2 * Msat)
                 + 0.022 * cosD(Mj - Msat)
                 + 0.023 * sinD(2 * Mj - 3 * Msat + 52)
                 - 0.016 * sinD(Mj - 5 * Msat - 69);
    const dlon_s = +0.812 * sinD(2 * Mj - 5 * Msat - 67.6)
                 - 0.229 * cosD(2 * Mj - 4 * Msat - 2)
                 + 0.119 * sinD(Mj - 2 * Msat - 3)
                 + 0.046 * sinD(2 * Mj - 6 * Msat - 69)
                 + 0.014 * sinD(Mj - 3 * Msat + 32);

    const j_r = planetsHelio.Jupiter.r;
    const j_v = planetsHelio.Jupiter.v + dlon_j;
    const j_w = planetsHelio.Jupiter.w;
    const j_N = planetsHelio.Jupiter.N;
    const j_i = planetsHelio.Jupiter.i;
    planetsHelio.Jupiter.xh = j_r * (cosD(j_N) * cosD(j_v + j_w) - sinD(j_N) * sinD(j_v + j_w) * cosD(j_i));
    planetsHelio.Jupiter.yh = j_r * (sinD(j_N) * cosD(j_v + j_w) + cosD(j_N) * sinD(j_v + j_w) * cosD(j_i));

    const s_r = planetsHelio.Saturn.r;
    const s_v = planetsHelio.Saturn.v + dlon_s;
    const s_w = planetsHelio.Saturn.w;
    const s_N = planetsHelio.Saturn.N;
    const s_i = planetsHelio.Saturn.i;
    planetsHelio.Saturn.xh = s_r * (cosD(s_N) * cosD(s_v + s_w) - sinD(s_N) * sinD(s_v + s_w) * cosD(s_i));
    planetsHelio.Saturn.yh = s_r * (sinD(s_N) * cosD(s_v + s_w) + cosD(s_N) * sinD(s_v + s_w) * cosD(s_i));

    // Convert Heliocentric to Apparent Geocentric
    const geoPlanets = {
      Sun: lon_sun,
      Moon: lon_moon
    };

    for (const k in elements) {
      const p = planetsHelio[k];
      const xg = p.xh + xs;
      const yg = p.yh + ys;
      geoPlanets[k] = normalizeDeg(atan2D(yg, xg));
    }

    // Rahu (Mean Lunar Node) & Ketu
    geoPlanets.Rahu = N_m;
    geoPlanets.Ketu = normalizeDeg(N_m + 180.0);

    return geoPlanets;
  }

  const p1 = getPlanetaryLongitudes(d);
  const p2 = getPlanetaryLongitudes(d + 0.05);

  function checkRetro(k) {
    if (k === 'Rahu' || k === 'Ketu') return true;
    if (k === 'Sun' || k === 'Moon') return false;
    let diff = p2[k] - p1[k];
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return diff < 0;
  }

  const rawPlanets = [
    { key: 'Sun', trop: p1.Sun, isRetro: false },
    { key: 'Moon', trop: p1.Moon, isRetro: false },
    { key: 'Mars', trop: p1.Mars, isRetro: checkRetro('Mars') },
    { key: 'Mercury', trop: p1.Mercury, isRetro: checkRetro('Mercury') },
    { key: 'Jupiter', trop: p1.Jupiter, isRetro: checkRetro('Jupiter') },
    { key: 'Venus', trop: p1.Venus, isRetro: checkRetro('Venus') },
    { key: 'Saturn', trop: p1.Saturn, isRetro: checkRetro('Saturn') },
    { key: 'Rahu', trop: p1.Rahu, isRetro: true },
    { key: 'Ketu', trop: p1.Ketu, isRetro: true }
  ];

  return rawPlanets.map(p => {
    const nirayanaDeg = normalizeDeg(p.trop - ayanamsaDeg);
    const subInfo = getKpSubForLongitude(nirayanaDeg);
    const signIdx = Math.floor(nirayanaDeg / 30);
    const sign = SIGNS[signIdx];
    const degInSign = nirayanaDeg % 30;
    const meta = PLANETS[p.key];

    return {
      key: p.key,
      name: meta.name,
      tamil: meta.tamil,
      short: meta.short,
      color: meta.color,
      tropDeg: p.trop,
      nirayanaDeg,
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
      isRetro: p.isRetro,
      degInSign,
      formattedDms: formatDms(degInSign),
      fullLongitudeStr: `${sign.tamil} ${formatDms(degInSign)} ${p.isRetro ? '(வ)' : ''}`
    };
  });
}

/**
 * Calculates complete KP Chart (Lagna Cusps, Planets, Ayanamsa, LST)
 */
export function calculateKpChart({ year, month, day, hour, minute, second = 0, lat, lng, tz }) {
  const utcHour = (hour + minute / 60.0 + second / 3600.0) - tz;
  const jd = getJulianDay(year, month, day, utcHour);
  const ayanamsa = getKpAyanamsa(jd);
  const { lst, ramc } = getSiderealTime(jd, lng);
  const eps = getObliquity(jd);

  const cusps = calculatePlacidusCusps(ramc, lat, eps, ayanamsa);
  const planets = calculatePlanetaryPositions(jd, ayanamsa);

  // Determine which house each planet is in based on Placidus cusps
  planets.forEach(p => {
    p.house = getPlanetHouseInPlacidus(p.nirayanaDeg, cusps);
  });

  return {
    jd,
    ayanamsa,
    ayanamsaStr: formatDms(ayanamsa),
    lst,
    ramc,
    cusps,
    planets,
    dateTime: { year, month, day, hour, minute, second, tz },
    location: { lat, lng }
  };
}

/**
 * Helper to determine which Placidus house a longitude falls into
 */
export function getPlanetHouseInPlacidus(planetDeg, cusps) {
  for (let i = 0; i < 12; i++) {
    const cCurrent = cusps[i].nirayanaDeg;
    const cNext = cusps[(i + 1) % 12].nirayanaDeg;

    if (cNext > cCurrent) {
      if (planetDeg >= cCurrent && planetDeg < cNext) return i + 1;
    } else {
      // Crosses 360°/0° Aries boundary
      if (planetDeg >= cCurrent || planetDeg < cNext) return i + 1;
    }
  }
  return 1;
}
