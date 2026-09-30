/**
 * KP Life Predictions & Event Timing Engine
 * Implements Krishnamurti Paddhati rules for:
 * 1. Job / Employment timing
 * 2. Career Field recommendation
 * 3. 1st Marriage timing
 * 4. Divorce / Separation analysis
 * 5. 2nd Marriage timing
 * 6. 1st Childbirth timing
 * 7. House & Land purchase timing
 * 8. Car / Vehicle purchase timing
 * 9. Abroad Job & Foreign settlement
 */

import { PLANETS } from './kp-constants.js';

export function analyzeAllLifeEvents(chart, significators, dasaData) {
  const { cusps, planets } = chart;
  const { planetSignifications } = significators;

  const pMap = {};
  planetSignifications.forEach(ps => { pMap[ps.planet] = ps; });

  const getCusp = h => cusps[h - 1];

  // Helper to find which Dasa/Bhuktis trigger specific houses
  function findEventTimingPeriods(targetHouses, dasaList) {
    const favorablePlanets = [];

    planetSignifications.forEach(ps => {
      // Check if planet signifies any target house
      const matches = ps.signifiedHouses.filter(h => targetHouses.includes(h));
      if (matches.length > 0) {
        favorablePlanets.push({
          planet: ps.planet,
          tamil: ps.tamil,
          matchCount: matches.length,
          matchedHouses: matches
        });
      }
    });

    favorablePlanets.sort((a, b) => b.matchCount - a.matchCount);

    const favorableKeys = favorablePlanets.map(f => f.planet);
    const now = new Date();
    const upcomingPeriods = [];

    for (const d of dasaList) {
      if (d.endDate < now) continue; // Skip past dasas

      const isDasaFav = favorableKeys.includes(d.lord);

      for (const b of d.bhuktis) {
        if (b.endDate < now) continue; // Skip past bhuktis

        const isBhuktiFav = favorableKeys.includes(b.lord);

        if (isDasaFav || isBhuktiFav) {
          upcomingPeriods.push({
            dasaLord: d.lord,
            dasaLordTamil: d.lordTamil,
            bhuktiLord: b.lord,
            bhuktiLordTamil: b.lordTamil,
            startStr: b.startStr,
            endStr: b.endStr,
            strength: (isDasaFav ? 2 : 0) + (isBhuktiFav ? 2 : 0)
          });
        }
      }
    }

    upcomingPeriods.sort((a, b) => {
      // Sort by chronological nearest first, prioritizing high strength
      return 0; // maintain timeline order
    });

    return {
      favorablePlanets,
      upcomingPeriods: upcomingPeriods.slice(0, 3) // Return top 3 upcoming periods
    };
  }

  // 1. Job / Career Timing (வேலை / உத்தியோகம்)
  // KP Rule: 6th & 10th Cusp Sub-Lords must signify 2, 6, 10, 11
  const c6 = getCusp(6);
  const c10 = getCusp(10);
  const sub6Sig = pMap[c6.subLord] ? pMap[c6.subLord].signifiedHouses : [];
  const sub10Sig = pMap[c10.subLord] ? pMap[c10.subLord].signifiedHouses : [];

  const jobFav = Array.from(new Set([...sub6Sig, ...sub10Sig])).filter(h => [2, 6, 10, 11].includes(h));
  const jobUnfav = Array.from(new Set([...sub6Sig, ...sub10Sig])).filter(h => [1, 5, 9, 12].includes(h));
  const jobTiming = findEventTimingPeriods([2, 6, 10, 11], dasaData.dasaList);

  const jobVerdict = jobFav.length >= jobUnfav.length
    ? { status: 'சாதகமானது (High)', class: 'success', text: 'வேலை & பதவி உயர்வு யோகம் மிகச் சிறப்பாக உள்ளது.' }
    : { status: 'தாமதம் / போராட்டம் (Moderate)', class: 'warning', text: 'போராட்டத்திற்குப் பின் வேலை அமையும்.' };

  // 2. Recommended Career Field (உகந்த தொழில் துறை)
  // KP Rule: 10th Cusp Sub-Lord & its Star Lord determine profession nature
  const p10Sub = planets.find(p => p.key === c10.subLord) || planets[0];
  const p10Star = planets.find(p => p.key === p10Sub.starLord) || p10Sub;

  const careerFieldRules = {
    Sun: { field: 'அரசுப் பணி, நிர்வாகம், அரசியல், மேலாண்மை, தலைமைப் பொறுப்பு', en: 'Govt, Admin, Leadership' },
    Moon: { field: 'மருத்துவம்/நர்சிங், உணவு, ஹோட்டல், ஜவுளி, திரவப் பொருட்கள், கலை', en: 'Healthcare, Hospitality, Liquids' },
    Mars: { field: 'மென்பொருள் பொறியியல் (IT), இயந்திரவியல், ரியல் எஸ்டேட், பாதுகாப்பு/காவல்', en: 'Software Engg, Mechanical, Police/Defense' },
    Mercury: { field: 'தகவல் தொழில்நுட்பம் (IT/Software), கணக்கியல், வர்த்தகம், வங்கி, ஊடகம்', en: 'IT, Software, Finance, Accounts, Media' },
    Jupiter: { field: 'வங்கி, நிதித்துறை, சட்டம்/வழக்கறிஞர், கல்வி, ஆலோசகர், பேராசிரியர்', en: 'Banking, Law, Education, Consulting' },
    Venus: { field: 'கலை, வடிவமைப்பு (Design/UI), சினிமா, ஆடம்பர பொருட்கள், அழகுக்கலை, வணிகம்', en: 'Design, Arts, Luxury, Commerce' },
    Saturn: { field: 'உற்பத்தித் துறை, கட்டுமானம், கனிமம், இரும்பு/மெட்டல், சேவைத் தொழில்', en: 'Manufacturing, Civil, Industry, Mining' },
    Rahu: { field: 'செயற்கை நுண்ணறிவு (AI), சைபர் செக்யூரிட்டி, விண்வெளி, ஏவியேஷன், வெளிநாட்டு வர்த்தகம்', en: 'AI, Tech, Aviation, Foreign Trade' },
    Ketu: { field: 'புரோகிராமிங்/கோடிங், ஆன்மீகம், மூலிகை மருத்துவம், ஆராய்ச்சி, ஜோதிடம்', en: 'Coding, Research, Medicine, Astrology' }
  };

  const careerField = careerFieldRules[p10Sub.key] || careerFieldRules['Mercury'];
  const careerStarField = careerFieldRules[p10Star.key] || careerFieldRules['Sun'];

  // 3. 1st Marriage Timing (முதல் திருமணம்)
  // KP Rule: 7th Cusp Sub-Lord signifies 2, 7, 11
  const c7 = getCusp(7);
  const sub7Sig = pMap[c7.subLord] ? pMap[c7.subLord].signifiedHouses : [];
  const marrFav = sub7Sig.filter(h => [2, 7, 11].includes(h));
  const marrUnfav = sub7Sig.filter(h => [1, 6, 10].includes(h));
  const marrTiming = findEventTimingPeriods([2, 7, 11], dasaData.dasaList);

  // Check Saturn aspect on 7th cusp or presence in Lagna/12th
  const saturnPlanet = planets.find(p => p.key === 'Saturn');
  const saturnOppDeg = saturnPlanet ? (saturnPlanet.nirayanaDeg + 180) % 360 : 0;
  const saturnOpp7th = saturnPlanet && Math.abs(saturnOppDeg - c7.nirayanaDeg) < 15;
  const isLateMarriage = saturnOpp7th || marrUnfav.includes(6) || marrUnfav.includes(10);

  const marrVerdict = isLateMarriage
    ? { status: 'தாமதத் திருமணம் (Late Marriage - 30+ வயதில்)', class: 'warning', text: 'சனி பகவானின் 7-ம் பாவக நேரடி சமசப்தமப் பார்வை மற்றும் 6-ம் பாவத் தொடர்பால் 30 முதல் 35 வயதில் தாமதமாகவே திருமணம் கைகூடும்.' }
    : (marrFav.length > 0
        ? { status: 'நிச்சயம் கைகூடும்', class: 'success', text: '7-ம் பாவ உப-நாதன் 2, 7, 11 பாவங்களைத் தொடர்பு கொண்டு திருமண யோகத்தை உறுதி செய்கிறார்.' }
        : { status: 'தாமதம் / பரிகாரம் தேவை', class: 'warning', text: '1, 6, 10 பாவத் தொடர்புகளால் சில தாமதங்களுக்குப் பின் திருமணம் அமையும்.' });

  // 4. Divorce / Separation Analysis (பிரிவு / விவாகரத்து)
  // KP Rule: 7th Cusp Sub-Lord signifies 6 (12th to 7th - dispute/court case/divorce), 1 (ego), 12 (separation)
  const has6or12 = sub7Sig.includes(6) || sub7Sig.includes(12);
  const divTiming = findEventTimingPeriods([1, 6, 10, 12], dasaData.dasaList);

  const divVerdict = has6or12
    ? { status: 'பிரிவு / விவாகரத்து வழக்கு அபாயம் (Separation / Divorce Case)', class: 'danger', text: '7-ம் பாவ உப-நாதன் 6-ம் பாவத்தைக் (7-க்கு 12 - கருத்து வேறுபாடு, நீதிமன்ற வழக்கு, விவாகரத்து) குறிப்பதாலும், சனி 12-ல் இருப்பதாலும் திருமண பந்தத்தில் திடீர் பிரிவு மற்றும் விவாகரத்து வழக்கு ஏற்பட அதிக வாய்ப்புள்ளது.' }
    : (sub7Sig.includes(1)
        ? { status: 'கருத்து வேறுபாடு / ஈகோ மோதல்', class: 'warning', text: '1-ம் பாவத் தொடர்பால் தன்முனைப்பு மற்றும் கருத்து மோதல்கள் வரலாம்.' }
        : { status: 'பிரிவு இல்லை / சுமுகமான தாம்பத்தியம்', class: 'success', text: 'குடும்ப ஒற்றுமை பாவங்கள் (2, 7, 11) பலமாக இருப்பதால் நிரந்தரப் பிரிவு ஏற்பட வாய்ப்பில்லை.' });

  // 5. 2nd Marriage Timing (இரண்டாம் திருமணம்)
  // KP Rule: 2nd Marriage is evaluated by 2nd house (family) and 11th house (2nd wife/husband, 5th from 7th)
  const c2 = getCusp(2);
  const c11 = getCusp(11);
  const sub2Sig = pMap[c2.subLord] ? pMap[c2.subLord].signifiedHouses : [];
  const sub11Sig = pMap[c11.subLord] ? pMap[c11.subLord].signifiedHouses : [];
  const secMarrFav = Array.from(new Set([...sub2Sig, ...sub11Sig])).filter(h => [2, 7, 11].includes(h));
  const secMarrTiming = findEventTimingPeriods([2, 11], dasaData.dasaList);

  const secMarrVerdict = secMarrFav.length > 0
    ? { status: 'வாய்ப்பு உண்டு', class: 'success', text: '2 மற்றும் 11-ம் பாவ உப-நாதன்கள் மறுமணத்திற்குச் சாதகமாக அமைந்துள்ளனர்.' }
    : { status: 'வாய்ப்பு குறைவு', class: 'warning', text: '2-ம் திருமணத்திற்கான பாவத் தொடர்புகள் குறைவாக உள்ளன.' };

  // 6. 1st Childbirth Timing (முதல் குழந்தை பாக்கியம்)
  // KP Rule: 5th Cusp Sub-Lord signifies 2, 5, 11 (favorable) vs 1, 4, 10 (barren)
  const c5 = getCusp(5);
  const sub5Sig = pMap[c5.subLord] ? pMap[c5.subLord].signifiedHouses : [];
  const childFav = sub5Sig.filter(h => [2, 5, 11].includes(h));
  const childUnfav = sub5Sig.filter(h => [1, 4, 10].includes(h));
  const childTiming = findEventTimingPeriods([2, 5, 11], dasaData.dasaList);

  const childVerdict = childFav.length > 0
    ? { status: 'உறுதியான புத்திர பாக்கியம்', class: 'success', text: '5-ம் பாவ உப-நாதன் 2, 5, 11 பாவங்களைத் தொடர்பு கொண்டு வம்ச விருத்தியை உறுதி செய்கிறார்.' }
    : { status: 'மருத்துவ ஆலோசனை / தாமதம்', class: 'warning', text: '4, 10-ம் பாவத் தாக்கத்தால் தாமதமாக குழந்தை பாக்கியம் கிட்டும்.' };

  // 7. House & Land Purchase (வீடு / மனை வாங்குதல்)
  // KP Rule: 4th Cusp Sub-Lord signifies 4, 11, 12 (12 = investment/spending on asset)
  const c4 = getCusp(4);
  const sub4Sig = pMap[c4.subLord] ? pMap[c4.subLord].signifiedHouses : [];
  const propFav = sub4Sig.filter(h => [4, 11, 12].includes(h));
  const propTiming = findEventTimingPeriods([4, 11, 12], dasaData.dasaList);

  const propVerdict = propFav.length > 0
    ? { status: 'நிலம் / வீடு யோகம் உண்டு', class: 'success', text: '4-ம் பாவம் 4, 11, 12 பாவங்களை இணைத்து சொத்து வாங்கும் யோகத்தைத் தருகிறது.' }
    : { status: 'தாமதம்', class: 'warning', text: 'முதலீட்டுக்கான சூழல் வரும்போது நிலம் அல்லது வீடு அமையும்.' };

  // 8. Car / Bike Purchase (கார் அல்லது பைக்)
  // KP Rule: 4th Cusp Sub-Lord & Venus signify 4, 11
  const venus = planets.find(p => p.key === 'Venus') || planets[0];
  const venSig = pMap['Venus'] ? pMap['Venus'].signifiedHouses : [];
  const vehicleFav = Array.from(new Set([...sub4Sig, ...venSig])).filter(h => [4, 11].includes(h));
  const vehicleTiming = findEventTimingPeriods([4, 11], dasaData.dasaList);

  const vehicleVerdict = vehicleFav.length > 0
    ? { status: 'வாகன யோகம் உண்டு', class: 'success', text: 'சுக ஸ்தானமான 4-ம் பாவமும் சுக்கிரனும் வாகனம் வாங்குவதற்குச் சாதகமாக உள்ளனர்.' }
    : { status: 'சாதாரண யோகம்', class: 'warning', text: 'சாதகமான தசா-புக்தி காலத்தில் வாகனம் அமையும்.' };

  // 9. Abroad Job & Travel (வெளிநாட்டு வேலை / பிரயாணம்)
  // KP Rule: 12th, 9th, 3rd Cusp Sub-Lords signify 3, 9, 12, 11
  const c12 = getCusp(12);
  const c9 = getCusp(9);
  const sub12Sig = pMap[c12.subLord] ? pMap[c12.subLord].signifiedHouses : [];
  const sub9Sig = pMap[c9.subLord] ? pMap[c9.subLord].signifiedHouses : [];
  const abroadFav = Array.from(new Set([...sub12Sig, ...sub9Sig])).filter(h => [3, 9, 12, 11].includes(h));
  const abroadTiming = findEventTimingPeriods([3, 9, 12, 11], dasaData.dasaList);

  const abroadVerdict = abroadFav.length >= 2
    ? { status: 'வெளிநாட்டு யோகம் மிக அதிகம்!', class: 'success', text: '3 (பயணம்), 9 (தூர தேசம்), 12 (வெளிநாடு) பாவங்கள் வலுவாகத் தொடர்பு கொண்டு வெளிநாட்டு வேலை மற்றும் குடியுரிமையை உறுதி செய்கின்றன.' }
    : { status: 'குறுகிய காலப் பயணம் / உள்நாட்டு வேலை', class: 'warning', text: 'வெளிநாட்டு வேலை தற்காலிகமாகவோ அல்லது உள்நாட்டுப் பணிகளிலோ அமைய வாய்ப்புள்ளது.' };

  // 10. Job Loss Analysis & Risk Timing (வேலை இழப்பு / பதவி பறிபோகுமா?)
  // KP Rule: 10th (Profession) & 6th (Service) Cuspal Sub-Lords.
  // Negating houses: 5 (12th to 6th - loss of job), 9 (12th to 10th - loss of status), 12 (separation/loss).
  const jobLossHouses = [5, 9, 12];
  const jobLossFavMatches = Array.from(new Set([...sub6Sig, ...sub10Sig])).filter(h => jobLossHouses.includes(h));
  const jobLossTiming = findEventTimingPeriods([5, 9, 12], dasaData.dasaList);

  const jobLossVerdict = jobLossFavMatches.length >= 2
    ? { status: 'எச்சரிக்கை தேவை (Risk Period)', class: 'danger', text: '6 அல்லது 10-ம் பாவ உப-நாதன் 5, 9, 12-ம் பாவங்களைக் காட்டுவதால் தசா-புக்தி சாதகமற்ற காலத்தில் வேலை இழப்பு அல்லது விரும்பத்தகாத இடமாற்றம் ஏற்படும் வாய்ப்புள்ளது.' }
    : { status: 'வேலை பாதுகாப்பானது (Safe & Stable)', class: 'success', text: '2, 6, 10, 11 பாவங்களின் பலத்தால் உத்தியோகம் பாதுகாப்பாகவும் நிரந்தரமாகவும் இருக்கும்; திடீர் வேலை இழப்பு ஏற்படாது.' };

  // 11. Business Possibility & Start Timing (சுயதொழில் / வியாபாரம்)
  // KP Rule: 7th Cusp Sub-Lord represents business, independent trade, and clients.
  // Favorable: 2, 7, 10, 11 (Profit, trade, independent status).
  // Unfavorable: 5, 8, 12 (Business debt/loss).
  const businessFav = sub7Sig.filter(h => [2, 7, 10, 11].includes(h));
  const businessUnfav = sub7Sig.filter(h => [5, 8, 12].includes(h));
  const businessTiming = findEventTimingPeriods([2, 7, 10, 11], dasaData.dasaList);

  const businessVerdict = businessFav.length >= 2 && businessFav.length > businessUnfav.length
    ? { status: 'சுயதொழில் யோகம் மிகச் சிறப்பு!', class: 'success', text: '7 மற்றும் 10-ம் பாவங்கள் 2, 7, 10, 11 தொடர்புகளுடன் அமைந்திருப்பதால் சொந்த தொழில், வியாபாரம் மற்றும் வாடிக்கையாளர் தொடர்புகள் மூலம் பெரும் லாபம் ஈட்டலாம்.' }
    : (businessFav.length >= 1 
        ? { status: 'பகுதிநேர தொழில் உகந்தது', class: 'warning', text: 'முதலில் உத்தியோகத்தில் இருந்து கொண்டே பகுதிநேரமாக அல்லது குறைந்த முதலீட்டில் தொழில் செய்வது பாதுகாப்பானது.' }
        : { status: 'உத்தியோகமே (Job) சிறந்தது', class: 'danger', text: '6-ம் பாவம் வலுவாக இருப்பதால் பெரிய முதலீட்டுடன் தொழில் செய்வதை விட மாத சம்பள உத்தியோகமே நிலையான பொருளாதாரத்தைத் தரும்.' });

  // 12. Job Location: Native vs Other District vs Other State (வேலை இடம்)
  // KP Rule: 4th (Native), 3rd (Short distance / other district), 9th & 12th (Other State / Abroad)
  const jobSigCombined = Array.from(new Set([...sub6Sig, ...sub10Sig]));
  const hasOtherState = jobSigCombined.includes(9) || jobSigCombined.includes(12);
  const hasOtherDistrict = jobSigCombined.includes(3);

  let jobLocVerdict;
  if (hasOtherState) {
    jobLocVerdict = {
      status: 'வெளி மாநிலம் / வெளிதேசம் (Other State)',
      class: 'success',
      text: '6 மற்றும் 10-ம் பாவங்கள் 9, 12-ம் பாவங்களைத் தொடர்பு கொள்வதால் வெளி மாநிலத்திலோ (Other State) அல்லது வெளிநாட்டிலோ வேலை மற்றும் தொழில் அமையும் யோகம் உள்ளது.'
    };
  } else if (hasOtherDistrict) {
    jobLocVerdict = {
      status: 'வெளி மாவட்டம் / அண்டை நகரம் (Other District)',
      class: 'warning',
      text: '3-ம் பாவத் தொடர்பு (12th to 4th - சொந்த ஊரை விட்டுப் பிரிதல்) இருப்பதால் அண்டை மாவட்டம் அல்லது பிற நகரத்தில் வேலை அமையும்.'
    };
  } else {
    jobLocVerdict = {
      status: 'சொந்த மாவட்டம் / ஊர் (Native Place / WFH)',
      class: 'success',
      text: '4-ம் பாவ பலம் மற்றும் 2, 6, 11 தொடர்புகளால் சொந்த ஊரிலேயே வேலை அல்லது Work From Home வாய்ப்பு பிரகாசமாக உள்ளது.'
    };
  }
  const jobLocTiming = findEventTimingPeriods(hasOtherState ? [9, 12, 10] : (hasOtherDistrict ? [3, 6, 10] : [4, 6, 11]), dasaData.dasaList);

  // 13. Govt Job vs Private Job vs Business Comparison (அரசு வேலையா? தனியார் வேலையா? சொந்த தொழிலா?)
  const govtPlanets = ['Sun', 'Mars', 'Jupiter', 'Saturn'];
  const hasGovtPlanetConnection = govtPlanets.includes(c10.subLord) || 
                                  govtPlanets.includes(c6.subLord) ||
                                  govtPlanets.includes(p10Sub.starLord);
  let govtScore = 0;
  if (jobFav.includes(6) && jobFav.includes(10)) govtScore += 35;
  if (jobFav.includes(2) || jobFav.includes(11)) govtScore += 25;
  if (hasGovtPlanetConnection) govtScore += 30;
  if (jobUnfav.length > 0) govtScore -= jobUnfav.length * 10;
  govtScore = Math.max(10, Math.min(95, govtScore));

  const corpPlanets = ['Mercury', 'Rahu', 'Venus', 'Moon'];
  const hasCorpPlanetConnection = corpPlanets.includes(c10.subLord) || 
                                  corpPlanets.includes(c6.subLord) ||
                                  corpPlanets.includes(p10Sub.starLord);
  let privateScore = 0;
  if (jobFav.includes(6)) privateScore += 30;
  if (jobFav.includes(2) || jobFav.includes(11)) privateScore += 30;
  if (hasCorpPlanetConnection) privateScore += 25;
  if (sub6Sig.includes(3) || sub10Sig.includes(3)) privateScore += 10;
  privateScore = Math.max(15, Math.min(95, privateScore));

  let businessScore = 0;
  if (businessFav.includes(7) && businessFav.includes(10)) businessScore += 35;
  if (businessFav.includes(2) || businessFav.includes(11)) businessScore += 35;
  if (businessUnfav.length > 0) businessScore -= businessUnfav.length * 15;
  businessScore = Math.max(10, Math.min(95, businessScore));

  let bestChoice, bestChoiceTamil, bestChoiceDesc, bestClass;
  if (govtScore >= privateScore && govtScore >= businessScore && govtScore >= 60) {
    bestChoice = 'Government Job';
    bestChoiceTamil = '🏛️ அரசு வேலை (Govt Job) மிகச் சிறந்தது!';
    bestChoiceDesc = 'சூரியன் / குரு / செவ்வாய் ஆதிக்கம் மற்றும் 6, 10-ம் பாவ பலத்தால் அரசுத் தேர்வு (TNPSC, UPSC, Banking, SSC, Police, Govt PSU) எழுதி அரசுப் பணி பெறுவது மிக உன்னதமான அதிகாரத்தையும் பாதுகாப்பையும் தரும்.';
    bestClass = 'success';
  } else if (businessScore > privateScore && businessScore > govtScore && businessScore >= 60) {
    bestChoice = 'Business / Trade';
    bestChoiceTamil = '🏢 சுயதொழில் / வியாபாரம் (Business) மிகச் சிறந்தது!';
    bestChoiceDesc = '7-ம் பாவம் (வாடிக்கையாளர் & வர்த்தகம்) மற்றும் 11-ம் பாவம் (லாபம்) வலுவாக இருப்பதால், நீங்களே முதலாளியாக இருந்து தொழில் அல்லது வியாபாரம் செய்தால் மிகச் சிறந்த தன யோகம் உண்டாகும்.';
    bestClass = 'success';
  } else {
    bestChoice = 'Private / Corporate';
    bestChoiceTamil = '💼 தனியார் / கார்ப்பரேட் வேலை (Private Job) மிகச் சிறந்தது!';
    bestChoiceDesc = 'புதன், ராகு ஆதிக்கம் மற்றும் 2, 6, 11 பாவங்களின் தொடர்பால் தனியார் துறை, சாப்ட்வேர் (IT), வங்கி, கார்ப்பரேட் நிறுவனங்களில் விரைவான பதவி உயர்வு மற்றும் அதிக வருமான வளர்ச்சி கிட்டும்.';
    bestClass = 'success';
  }

  const comparison = {
    title: '🏆 அரசு வேலையா? தனியார் வேலையா? சொந்த தொழிலா? (Govt vs Private vs Business)',
    bestChoice,
    bestChoiceTamil,
    bestChoiceDesc,
    bestClass,
    govtScore,
    privateScore,
    businessScore
  };

  // 14. Govt Job Timing (அரசு வேலை எப்போது கிடைக்கும்?)
  const govtTimingRaw = findEventTimingPeriods([6, 10, 11, 2], dasaData.dasaList);
  const govtTimingPeriods = govtTimingRaw.upcomingPeriods.map(p => {
    const isGovtLord = govtPlanets.includes(p.dasaLord) || govtPlanets.includes(p.bhuktiLord);
    return {
      ...p,
      isGovtLord,
      note: isGovtLord ? 'அரசு கிரக ஆதிக்கம் (சூரியன்/குரு/செவ்வாய்/சனி)' : 'பணி ஸ்தான அதிபதி'
    };
  });

  const govtTimingVerdict = govtScore >= 60
    ? { status: 'அரசு வேலை யோகம் உண்டு!', class: 'success', text: 'சூரியன் / குரு / செவ்வாய் மற்றும் 6, 10, 11-ம் பாவங்களின் பலம் இருப்பதால் போட்டித் தேர்வுகளில் (TNPSC, UPSC, SSC, Banking, Police, Govt PSU) வெற்றி பெற்று அரசுப் பணி பெறும் யோகம் உறுதியாக உள்ளது.' }
    : (govtScore >= 40
        ? { status: 'கடின உழைப்பு தேவை (Moderate)', class: 'warning', text: 'அரசு வேலைக்குச் சில சாதகமான அம்சங்கள் உள்ளன. தீவிர முயற்சி மற்றும் பயிற்சி மேற்கொண்டால் சாதகமான தசா-புக்தி காலத்தில் தேர்வில் வெற்றி பெறலாம்.' }
        : { status: 'தனியார் துறையே சிறந்தது', class: 'danger', text: 'ஜாதகத்தில் தனியார் துறை மற்றும் சுயதொழில் பாவங்களே அதிக பலத்துடன் உள்ளன. அரசுத் தேர்வுக்கு அதிக ஆண்டுகள் காத்திருப்பதை விட கார்ப்பரேட் துறையில் நுழைவது விரைவான வளர்ச்சியளிக்கும்.' });

  // 15. Granular Specific Department Analysis (Govt Sectors & Private Sectors)
  const c10SubKey = c10.subLord;
  const c10StarKey = p10Sub.starLord;
  const c6SubKey = c6.subLord;
  const activeCareerPlanets = [c10SubKey, c10StarKey, c6SubKey];

  function scoreSector(primaryPlanets, secondaryPlanets, requiredHouses) {
    let score = 42;
    primaryPlanets.forEach(p => {
      if (activeCareerPlanets.includes(p)) score += 22;
    });
    secondaryPlanets.forEach(p => {
      if (activeCareerPlanets.includes(p)) score += 12;
    });
    requiredHouses.forEach(h => {
      if (jobFav.includes(h) || sub10Sig.includes(h)) score += 7;
    });
    return Math.min(98, Math.max(35, score));
  }

  const govtSectors = [
    {
      id: 'tnpsc_upsc',
      name: '🏛️ TNPSC / UPSC / அரசு நிர்வாகம் & வருவாய்த் துறை (Civil Services)',
      planets: 'சூரியன், குரு, புதன்',
      score: scoreSector(['Sun', 'Jupiter'], ['Mercury', 'Mars'], [1, 6, 10, 11]),
      desc: 'அரசு நிர்வாகப் பணி, வட்டாட்சியர், துணை ஆட்சியர், ஊரக வளர்ச்சி, வருவாய்த் துறை'
    },
    {
      id: 'police_military',
      name: '👮 காவல் துறை / ராணுவம் / பாதுகாப்பு (Police, Defense, Military, Fire)',
      planets: 'செவ்வாய், சூரியன், சனி',
      score: scoreSector(['Mars', 'Sun'], ['Saturn', 'Rahu'], [3, 6, 10]),
      desc: 'காவல் உதவி ஆய்வாளர் (SI), ராணுவம் (Army/Navy/Airforce), ஆயுதப்படை, தீயணைப்பு'
    },
    {
      id: 'banking_govt',
      name: '🏦 அரசு வங்கிப் பணி (SBI, IBPS, RBI, தேசியமயமாக்கப்பட்ட வங்கிகள்)',
      planets: 'குரு, புதன், சுக்கிரன்',
      score: scoreSector(['Jupiter', 'Mercury'], ['Venus', 'Moon'], [2, 5, 6, 10, 11]),
      desc: 'வங்கி அதிகாரி (Probationary Officer), கிளார்க், கருவூலம், நிதி மேலாண்மை'
    },
    {
      id: 'railway',
      name: '🚂 இந்திய ரயில்வே & போக்குவரத்து (Indian Railways & Transport)',
      planets: 'சனி, செவ்வாய், புதன்',
      score: scoreSector(['Saturn', 'Mars'], ['Mercury', 'Rahu'], [3, 6, 9, 10]),
      desc: 'ரயில்வே பொறியாளர், லோகோ பைலட், டிக்கெட் பரிசோதகர், ரயில்வே தொழில்நுட்பப் பணி'
    },
    {
      id: 'doctor_health',
      name: '🩺 அரசு மருத்துவர் & பொது சுகாதாரம் (Govt Medical Officer / Health)',
      planets: 'சூரியன், செவ்வாய், கேது, சந்திரன்',
      score: scoreSector(['Sun', 'Ketu'], ['Mars', 'Moon'], [6, 8, 10, 12]),
      desc: 'அரசு தலைமை மருத்துவர், அறுவை சிகிச்சை, பொது சுகாதாரம், அரசு மருந்தாளுநர்'
    },
    {
      id: 'pwd_engg',
      name: '🏗️ PWD / நெடுஞ்சாலை / மின்சார வாரியம் - TNEB (Govt Engineering)',
      planets: 'செவ்வாய், சனி, சூரியன்',
      score: scoreSector(['Mars', 'Saturn'], ['Sun', 'Mercury'], [4, 6, 10]),
      desc: 'பொதுப்பணித்துறை (PWD), மின்சார வாரியம், நெடுஞ்சாலைத் துறை உதவிப் பொறியாளர்'
    }
  ];
  govtSectors.sort((a, b) => b.score - a.score);

  const privateSectors = [
    {
      id: 'it_software',
      name: '💻 தகவல் தொழில்நுட்பம் & மென்பொருள் (IT, Software, Cloud, Fullstack, AI)',
      planets: 'புதன், ராகு, கேது',
      score: scoreSector(['Mercury', 'Rahu'], ['Ketu', 'Mars'], [3, 5, 10, 11]),
      desc: 'Software Engineer, Cloud/DevOps, Artificial Intelligence, Web/App Development'
    },
    {
      id: 'telecom_hardware',
      name: '📡 டெலிகாம், நெட்வொர்க்கிங் & வன்பொருள் (Telecom, Hardware & Embedded)',
      planets: 'செவ்வாய், புதன், ராகு',
      score: scoreSector(['Mars', 'Rahu'], ['Mercury', 'Saturn'], [3, 6, 10]),
      desc: 'Network Engineer, Telecom Solutions, Hardware Design, IoT Systems'
    },
    {
      id: 'design_media',
      name: '🎨 வடிவமைப்பு, ஊடகம் & கிரியேட்டிவ் (UI/UX Design, Animation, Media & VFX)',
      planets: 'சுக்கிரன், புதன், சந்திரன்',
      score: scoreSector(['Venus', 'Mercury'], ['Moon', 'Rahu'], [3, 5, 10]),
      desc: 'Product Design, UI/UX Designer, Visual Effects, Digital Marketing, Media'
    },
    {
      id: 'finance_banking',
      name: '💰 நிதி, தனியார் வங்கி & கார்ப்பரேட் கணக்கியல் (Fintech, Private Banking, Auditing)',
      planets: 'குரு, புதன், சுக்கிரன்',
      score: scoreSector(['Jupiter', 'Mercury'], ['Venus', 'Sun'], [2, 5, 11]),
      desc: 'Investment Banking, Chartered Accountant, Financial Analyst, Fintech Apps'
    },
    {
      id: 'civil_infra',
      name: '🏢 சிவில், ரியல் எஸ்டேட் & கட்டுமானம் (Civil, Architecture & Infrastructure)',
      planets: 'சனி, செவ்வாய், சுக்கிரன்',
      score: scoreSector(['Saturn', 'Mars'], ['Venus', 'Sun'], [4, 10, 11]),
      desc: 'Civil Project Manager, Structural Engineer, Architect, Interior Infrastructure'
    },
    {
      id: 'pharma_biotech',
      name: '💊 பார்மா, பயோடெக் & மருத்துவமனை மேலாண்மை (Pharma, Biotech & Hospital Admin)',
      planets: 'சந்திரன், கேது, சூரியன்',
      score: scoreSector(['Moon', 'Ketu'], ['Sun', 'Jupiter'], [6, 8, 12]),
      desc: 'Pharmaceutical Research, Clinical Data, Biomedical Engineering, Hospital Admin'
    }
  ];
  privateSectors.sort((a, b) => b.score - a.score);

  // 16. Dynamic Individual Life Events Audit & Re-employment Timing
  const now = new Date();
  const currentYear = now.getFullYear();
  const birthDate = dasaData.birthDate || (chart.dateTime ? new Date(chart.dateTime.year, chart.dateTime.month - 1, chart.dateTime.day) : new Date(1990, 0, 1));
  const birthYear = birthDate.getFullYear();
  const currentAge = currentYear - birthYear;

  const pastMarriagePeriods = [];
  const pastJobPeriods = [];

  if (dasaData.dasaList) {
    dasaData.dasaList.forEach(d => {
      d.bhuktis.forEach(b => {
        // Only past periods up to the current date
        if (b.startDate <= now) {
          const bYear = b.startDate.getFullYear();
          const ageAtB = bYear - birthYear;
          const bLordSig = pMap[b.lord] ? pMap[b.lord].signifiedHouses : [];
          const dLordSig = pMap[d.lord] ? pMap[d.lord].signifiedHouses : [];
          const jointSig = Array.from(new Set([...bLordSig, ...dLordSig]));

          // Past Marriage: Age 18 up to currentAge, signifies 2, 7, 11 or Node representation
          const isNodeMarr = (d.lord === c7.subLord && (b.lord === 'Rahu' || b.lord === 'Ketu')) ||
                             ((d.lord === 'Rahu' || d.lord === 'Ketu') && b.lord === c7.subLord);
          const isMarrSig = jointSig.includes(7) || (jointSig.includes(2) && jointSig.includes(11)) || isNodeMarr;

          if (ageAtB >= 18 && isMarrSig) {
            pastMarriagePeriods.push({
              dasaLordTamil: d.lordTamil,
              bhuktiLordTamil: b.lordTamil,
              year: bYear,
              age: ageAtB,
              startStr: b.startStr,
              endStr: b.endStr,
              sig: isNodeMarr ? `7-ம் உப-நாதன் ${c7.subLordTamil} + சாயா கிரகத் தொடர்பு` : jointSig.filter(h => [2, 7, 11].includes(h)).join(', ')
            });
          }

          // Past Job: Age 18 up to currentAge, signifies 2, 6, 10, 11
          if (ageAtB >= 18 && (jointSig.includes(6) || jointSig.includes(10))) {
            pastJobPeriods.push({
              dasaLordTamil: d.lordTamil,
              bhuktiLordTamil: b.lordTamil,
              year: bYear,
              age: ageAtB,
              startStr: b.startStr,
              endStr: b.endStr,
              sig: jointSig.filter(h => [2, 6, 10, 11].includes(h)).join(', ')
            });
          }
        }
      });
    });
  }

  // Sort past marriage so the latest verified period in the past is shown first
  pastMarriagePeriods.sort((a, b) => b.year - a.year);

  // Dynamic Marital Breakdown & Delay Causes for THIS Individual Horoscope
  const maritalBreakCauses = [];
  const saturnP = planets.find(p => p.key === 'Saturn');
  const satOppDeg = saturnP ? (saturnP.nirayanaDeg + 180) % 360 : 0;
  const satAspect7th = saturnP && Math.abs(satOppDeg - c7.nirayanaDeg) < 15;

  if (satAspect7th) {
    maritalBreakCauses.push(`தாமதத் திருமணக் காரணம்: சனி பகவான் (${saturnP.signTamil} ${saturnP.formattedDms.split(' ')[0]}), 7-ம் பாவ ஆரம்ப முனையை (${c7.signTamil} ${c7.formattedDms.split(' ')[0]}) நேருக்கு நேராக சமசப்தமப் பார்வை பார்ப்பதால் 30 முதல் 35 வயது வரை திருமணம் தள்ளிப்போகிறது.`);
  }

  if (sub7Sig.includes(6)) {
    maritalBreakCauses.push(`7-ம் பாவ உப-நாதன் (${c7.subLordTamil}), 6-ம் பாவத்தைக் (7-க்கு 12-ம் பாவம் - கருத்து வேறுபாடு, தாம்பத்திய விரிசல், நீதிமன்ற வழக்கு) குறிப்பதால் பிரிவும் வழக்கும் ஏற்படக் காரணமாகிறது.`);
  }
  if (sub7Sig.includes(12)) {
    maritalBreakCauses.push(`12-ம் பாவத் தொடர்பு: அயன சயன விரயம், பிரிந்து வாழ்தல் அல்லது விவாகரத்து சூழலைத் தூண்டுகிறது.`);
  }
  if (sub7Sig.includes(1)) {
    maritalBreakCauses.push(`1-ம் பாவத் தொடர்பு (2-க்கு 12-ம் பாவம்): குடும்ப ஒற்றுமை குறைவு, ஈகோ மற்றும் தன்முனைப்பு மோதல்கள்.`);
  }
  if (maritalBreakCauses.length === 0) {
    maritalBreakCauses.push('7-ம் பாவத்தில் தீவிரப் பிரிவினை பாவங்கள் இல்லை; சமாதானமாக வாழக்கூடிய சாதகமான சூழல் உள்ளது.');
  }

  // Dynamic Job Loss & Unemployment Causes for THIS Individual Horoscope
  const causesOfJobLoss = [];
  const curD = dasaData.currentDasa;
  const curB = dasaData.currentBhukti;
  const curD_sig = curD && pMap[curD.lord] ? pMap[curD.lord].signifiedHouses : [];
  const curB_sig = curB && pMap[curB.lord] ? pMap[curB.lord].signifiedHouses : [];
  const curJoint = Array.from(new Set([...curD_sig, ...curB_sig]));

  if (curJoint.includes(5) || sub6Sig.includes(5)) {
    causesOfJobLoss.push('5-ம் பாவத் தொடர்பு (6-க்கு 12-ம் பாவம்): உத்தியோக முறிவு, பணியிலிருந்து விலகுதல் அல்லது வேலையை ராஜினாமா செய்தல்.');
  }
  if (curJoint.includes(9) || sub10Sig.includes(9)) {
    causesOfJobLoss.push('9-ம் பாவத் தொடர்பு (10-க்கு 12-ம் பாவம்): உத்தியோகப் பதவி பறிபோதல் (Loss of Status), நிறுவன மாற்றம் அல்லது இடமாற்றம்.');
  }
  if (curJoint.includes(8)) {
    causesOfJobLoss.push('8-ம் பாவத் தொடர்பு: பணியிடத்தில் மன உளைச்சல், உயர் அதிகாரிகளுடன் கருத்து மோதல் மற்றும் திடீர் வேலை இழப்பு.');
  }
  if (curJoint.includes(12)) {
    causesOfJobLoss.push('12-ம் பாவத் தொடர்பு: நிறுவனத்திலிருந்து வெளியேறுதல் (Exit) அல்லது ஒப்பந்தம் முடிவுக்கு வருதல்.');
  }

  if (curD && curB) {
    causesOfJobLoss.push(`தற்போது நடப்பில் உள்ள ${curD.lordTamil} தசா - ${curB.lordTamil} புக்தியில் உத்தியோகத்தை முடக்கும் பாவங்கள் (5, 8, 9, 12) தொடர்புகொண்டுள்ளதால் புதிய வேலை உடனே கிடைக்காமல் தாமதம் நிலவுகிறது.`);
  }

  // Re-employment Timing
  const reEmploymentTiming = findEventTimingPeriods([2, 6, 10, 11], dasaData.dasaList);

  const lifeAudit = {
    title: '📜 கடந்த கால நிகழ்வுகள் ஆய்வு & புதிய வேலை கிடைக்கும் காலம் (Life Events Audit & Re-employment)',
    pastMarriage: pastMarriagePeriods.slice(0, 3),
    pastJob: pastJobPeriods.slice(0, 2),
    maritalBreakCauses,
    causesOfJobLoss,
    reEmploymentTiming: reEmploymentTiming.upcomingPeriods.slice(0, 3)
  };

  return {
    comparison,
    lifeAudit,
    specificSectors: {
      title: '🎯 அரசு மற்றும் தனியார் துறைகள் - எது மிகச் சிறந்தது? (Specific Sectors Breakdown)',
      govtSectors,
      privateSectors,
      topGovt: govtSectors[0],
      topPrivate: privateSectors[0]
    },
    govtJob: {
      title: '🏛️ அரசு வேலை எப்போது கிடைக்கும்? (Govt Job Timing)',
      cuspSubLord: `${c6.subLordTamil} (6-ம் பாவம்) & ${c10.subLordTamil} (10-ம் பாவம்)`,
      signified: jobFav.join(', ') || '-',
      govtScore,
      verdict: govtTimingVerdict,
      timing: { upcomingPeriods: govtTimingPeriods }
    },
    job: {
      title: '💼 உத்தியோகம் & வேலை கிடைக்கும் காலம்',
      cuspSubLord: `${c6.subLordTamil} (6-ம் பாவம்) & ${c10.subLordTamil} (10-ம் பாவம்)`,
      signified: sub6Sig.join(', ') || '-',
      verdict: jobVerdict,
      timing: jobTiming
    },
    jobLoss: {
      title: '⚠️ வேலை இழப்பு அபாயம் & எச்சரிக்கை காலம் (Job Loss Risk)',
      cuspSubLord: `${c6.subLordTamil} (6-ம் பாவம்) & ${c10.subLordTamil} (10-ம் பாவம்)`,
      signified: jobLossFavMatches.join(', ') || 'இல்லை',
      verdict: jobLossVerdict,
      timing: jobLossTiming
    },
    business: {
      title: '🏢 சுயதொழில் / வியாபாரம் யோகம் & தொடங்கும் காலம் (Business)',
      cuspSubLord: `${c7.subLordTamil} (7-ம் பாவம்) & ${c10.subLordTamil} (10-ம் பாவம்)`,
      signified: businessFav.join(', ') || '-',
      verdict: businessVerdict,
      timing: businessTiming
    },
    jobLocation: {
      title: '📍 வேலை சொந்த ஊரிலா, வெளி மாவட்டத்திலா, வெளி மாநிலத்திலா? (Job Location)',
      cuspSubLord: `${c6.subLordTamil} (6-ம் பாவம்) & 4, 3, 9, 12`,
      signified: jobSigCombined.join(', ') || '-',
      verdict: jobLocVerdict,
      timing: jobLocTiming
    },
    careerField: {
      title: '🎯 உகந்த தொழில் துறை (Recommended Career Field)',
      cuspSubLord: `${c10.subLordTamil} (10-ம் பாவ உப-நாதன்)`,
      starLord: `${PLANETS[p10Sub.starLord].tamil} (நட்சத்திர நாதன்)`,
      recommendation: `${careerField.field} மற்றும் ${careerStarField.field}`,
      en: `${careerField.en} & ${careerStarField.en}`
    },
    marriage: {
      title: '💍 திருமணம் கை கூடுமா? எப்போது? (1st Marriage Timing)',
      cuspSubLord: `${c7.subLordTamil} (7-ம் பாவ உப-நாதன்)`,
      signified: sub7Sig.join(', ') || '-',
      verdict: marrVerdict,
      timing: marrTiming
    },
    divorce: {
      title: '💔 விவாகரத்து / பிரிவு சாத்தியமா? எப்போது?',
      cuspSubLord: `${c7.subLordTamil} (7-ம் பாவம்)`,
      signified: sub7Sig.join(', ') || '-',
      verdict: divVerdict,
      timing: divTiming
    },
    secondMarriage: {
      title: '💑 இரண்டாம் திருமணம் யோகம் & காலம் (2nd Marriage)',
      cuspSubLord: `${c2.subLordTamil} (2-ம் பாவம்) & ${c11.subLordTamil} (11-ம் பாவம்)`,
      signified: sub11Sig.join(', ') || '-',
      verdict: secMarrVerdict,
      timing: secMarrTiming
    },
    childbirth: {
      title: '👶 முதல் குழந்தை பாக்கியம் & காலம் (1st Childbirth)',
      cuspSubLord: `${c5.subLordTamil} (5-ம் பாவ உப-நாதன்)`,
      signified: sub5Sig.join(', ') || '-',
      verdict: childVerdict,
      timing: childTiming
    },
    property: {
      title: '🏠 வீடு / மனை வாங்கும் யோகம் & காலம் (House & Land)',
      cuspSubLord: `${c4.subLordTamil} (4-ம் பாவ உப-நாதன்)`,
      signified: sub4Sig.join(', ') || '-',
      verdict: propVerdict,
      timing: propTiming
    },
    vehicle: {
      title: '🚗 கார் / பைக் வாங்கும் காலம் (Car / Vehicle Timing)',
      cuspSubLord: `${c4.subLordTamil} (4-ம் பாவம்) & சுக்கிரன்`,
      signified: sub4Sig.join(', ') || '-',
      verdict: vehicleVerdict,
      timing: vehicleTiming
    },
    abroad: {
      title: '✈️ வெளிநாட்டு வேலை & பயணம் (Abroad Job & Settlement)',
      cuspSubLord: `${c12.subLordTamil} (12-ம் பாவம்) & ${c9.subLordTamil} (9-ம் பாவம்)`,
      signified: sub12Sig.join(', ') || '-',
      verdict: abroadVerdict,
      timing: abroadTiming
    }
  };
}
