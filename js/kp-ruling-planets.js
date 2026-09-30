/**
 * KP Ruling Planets (ஆளும் கிரகங்கள் - RP) Engine
 * Calculates Lagna Star & Sign Lord, Moon Star & Sign Lord, and Day Lord
 */

import { PLANETS } from './kp-constants.js';
import { calculateKpChart } from './kp-astronomy.js';

const DAY_LORDS = [
  'Sun',     // Sunday (ஞாயிறு)
  'Moon',    // Monday (திங்கள்)
  'Mars',    // Tuesday (செவ்வாய்)
  'Mercury', // Wednesday (புதன்)
  'Jupiter', // Thursday (வியாழன்)
  'Venus',   // Friday (வெள்ளி)
  'Saturn'   // Saturday (சனி)
];

const DAY_NAMES_TAMIL = ['ஞாயிற்றுக்கிழமை', 'திங்கட்கிழமை', 'செவ்வாய்க்கிழமை', 'புதன்கிழமை', 'வியாழக்கிழமை', 'வெள்ளிக்கிழமை', 'சனிக்கிழமை'];

export function calculateRulingPlanets({ year, month, day, hour, minute, second = 0, lat, lng, tz }) {
  const chart = calculateKpChart({ year, month, day, hour, minute, second, lat, lng, tz });

  const ascCusp = chart.cusps[0];
  const moon = chart.planets.find(p => p.key === 'Moon');

  // Day Lord based on local sunrise day
  // JavaScript getDay(): 0 is Sunday, 1 is Monday ...
  const dateObj = new Date(year, month - 1, day, hour, minute, second);
  const dayIndex = dateObj.getDay();
  const dayLordKey = DAY_LORDS[dayIndex];
  const dayTamil = DAY_NAMES_TAMIL[dayIndex];

  // 5 Fundamental Ruling Planets in KP order of strength:
  // 1. Ascendant Star Lord (Strongest)
  // 2. Ascendant Sign Lord
  // 3. Moon Star Lord
  // 4. Moon Sign Lord
  // 5. Day Lord
  const rpList = [
    {
      role: 'லக்ன நட்சத்திர நாதன் (Asc Star Lord)',
      planet: ascCusp.starLord,
      tamil: ascCusp.starLordTamil,
      color: PLANETS[ascCusp.starLord].color,
      strength: 1
    },
    {
      role: 'லக்ன ராசி நாதன் (Asc Sign Lord)',
      planet: ascCusp.signLord,
      tamil: ascCusp.signLordTamil,
      color: PLANETS[ascCusp.signLord].color,
      strength: 2
    },
    {
      role: 'சந்திர நட்சத்திர நாதன் (Moon Star Lord)',
      planet: moon.starLord,
      tamil: moon.starLordTamil,
      color: PLANETS[moon.starLord].color,
      strength: 3
    },
    {
      role: 'சந்திர ராசி நாதன் (Moon Sign Lord)',
      planet: moon.signLord,
      tamil: moon.signLordTamil,
      color: PLANETS[moon.signLord].color,
      strength: 4
    },
    {
      role: `கிழமை நாதன் (Day Lord: ${dayTamil})`,
      planet: dayLordKey,
      tamil: PLANETS[dayLordKey].tamil,
      color: PLANETS[dayLordKey].color,
      strength: 5
    }
  ];

  // Unique ruling planets list
  const uniquePlanets = Array.from(new Set(rpList.map(r => r.planet)));

  // Nodes representation (Rahu/Ketu)
  const rahu = chart.planets.find(p => p.key === 'Rahu');
  const ketu = chart.planets.find(p => p.key === 'Ketu');

  const nodeReps = [];
  if (rahu && uniquePlanets.includes(rahu.signLord)) {
    nodeReps.push({
      node: 'Rahu',
      nodeTamil: 'ராகு',
      represents: rahu.signLord,
      representsTamil: rahu.signLordTamil,
      reason: `ராகு அமர்ந்த ராசிநாதன் ${rahu.signLordTamil} ஆளும் கிரகமாக இருப்பதால் ராகுவும் ஆளும் கிரகமாகும்.`
    });
  }
  if (ketu && uniquePlanets.includes(ketu.signLord)) {
    nodeReps.push({
      node: 'Ketu',
      nodeTamil: 'கேது',
      represents: ketu.signLord,
      representsTamil: ketu.signLordTamil,
      reason: `கேது அமர்ந்த ராசிநாதன் ${ketu.signLordTamil} ஆளும் கிரகமாக இருப்பதால் கேதுவும் ஆளும் கிரகமாகும்.`
    });
  }

  return {
    chart,
    dayName: dayTamil,
    dayLord: dayLordKey,
    dayLordTamil: PLANETS[dayLordKey].tamil,
    rulingPlanets: rpList,
    uniquePlanets,
    nodeReps
  };
}
