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

  // Helper to find which Dasa/Bhuktis trigger specific houses in KP Stellar System
  function findEventTimingPeriods(targetHouses, dasaList, unfavHouses = []) {
    const favorablePlanets = [];
    const unfavorablePlanets = [];

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

      if (unfavHouses.length > 0) {
        const unfavMatches = ps.signifiedHouses.filter(h => unfavHouses.includes(h));
        if (unfavMatches.length > 0) {
          unfavorablePlanets.push({
            planet: ps.planet,
            tamil: ps.tamil,
            matchCount: unfavMatches.length,
            matchedHouses: unfavMatches
          });
        }
      }
    });

    favorablePlanets.sort((a, b) => b.matchCount - a.matchCount);

    const favorableKeys = favorablePlanets.map(f => f.planet);
    const unfavorableKeys = unfavorablePlanets.map(u => u.planet);

    const now = new Date();
    const upcomingPeriods = [];

    for (const d of dasaList) {
      if (d.endDate < now) continue; // Skip past dasas

      const isDasaFav = favorableKeys.includes(d.lord);
      const isDasaUnfav = unfavorableKeys.includes(d.lord);

      for (const b of d.bhuktis) {
        if (b.endDate < now) continue; // Skip past bhuktis

        const isBhuktiFav = favorableKeys.includes(b.lord);
        const isBhuktiUnfav = unfavorableKeys.includes(b.lord);
        const isCurrent = (b.startDate <= now && b.endDate >= now);

        // KP Joint Significator Rule:
        // High Strength (10) = Dasa Lord & Bhukti Lord are BOTH favorable significators, and Bhukti is not hostile.
        // Medium Strength (5) = Bhukti Lord is a strong favorable significator, Dasa Lord is neutral.
        const isJointFav = isDasaFav && isBhuktiFav && !isBhuktiUnfav;
        const isMediumFav = !isDasaFav && !isDasaUnfav && isBhuktiFav && !isBhuktiUnfav;

        // Skip Bhuktis where Bhukti Lord is explicitly unfavorable (signifies negating houses)
        if (isBhuktiUnfav && !isCurrent) continue;

        if (isJointFav || isMediumFav || (isCurrent && isBhuktiFav)) {
          const psObj = favorablePlanets.find(f => f.planet === b.lord);
          const houseList = psObj ? psObj.matchedHouses : targetHouses;
          const reason = isJointFav
            ? 'தசா நாதன் & புக்தி நாதன் கூட்டு காரகர்கள் (மிகவும் சாதகமான காலம்)'
            : (isCurrent ? 'தற்போது நடக்கும் புக்தி காலம்' : 'புக்தி நாதன் சாதகமான பாவ காரகர்');

          upcomingPeriods.push({
            dasaLord: d.lord,
            dasaLordTamil: d.lordTamil,
            bhuktiLord: b.lord,
            bhuktiLordTamil: b.lordTamil,
            startStr: b.startStr,
            endStr: b.endStr,
            matchedHouses: houseList,
            reason,
            isCurrent,
            score: (isJointFav ? 10 : 5) + (isCurrent ? 3 : 0)
          });
        }
      }
    }

    // Sort: Current running period first (if favorable), then highest KP score and chronological order
    upcomingPeriods.sort((a, b) => {
      if (a.isCurrent && !b.isCurrent) return -1;
      if (!a.isCurrent && b.isCurrent) return 1;
      return b.score - a.score;
    });

    return {
      favorablePlanets,
      upcomingPeriods: upcomingPeriods.slice(0, 3) // Return top 3 true favorable periods
    };
  }

  // 1. Job / Career Timing (வேலை / உத்தியோகம்)
  // KP Rule: 6th & 10th Cusp Sub-Lords signify 2, 6, 10, 11
  const c6 = getCusp(6);
  const c10 = getCusp(10);
  const sub6Sig = pMap[c6.subLord] ? pMap[c6.subLord].signifiedHouses : [];
  const sub10Sig = pMap[c10.subLord] ? pMap[c10.subLord].signifiedHouses : [];
  const jobFav = Array.from(new Set([...sub6Sig, ...sub10Sig])).filter(h => [2, 6, 10, 11].includes(h));
  const jobUnfav = Array.from(new Set([...sub6Sig, ...sub10Sig])).filter(h => [1, 5, 9, 12].includes(h));
  const jobTiming = findEventTimingPeriods([2, 6, 10, 11], dasaData.dasaList, [1, 5, 9, 12]);

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
  const marrTiming = findEventTimingPeriods([2, 7, 11], dasaData.dasaList, [1, 6, 10]);

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
  const divTiming = findEventTimingPeriods([1, 6, 10, 12], dasaData.dasaList, [2, 7, 11]);

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
  const secMarrTiming = findEventTimingPeriods([2, 11], dasaData.dasaList, [1, 6, 10]);

  const secMarrVerdict = secMarrFav.length > 0
    ? { status: 'வாய்ப்பு உண்டு', class: 'success', text: '2 மற்றும் 11-ம் பாவ உப-நாதன்கள் மறுமணத்திற்குச் சாதகமாக அமைந்துள்ளனர்.' }
    : { status: 'வாய்ப்பு குறைவு', class: 'warning', text: '2-ம் திருமணத்திற்கான பாவத் தொடர்புகள் குறைவாக உள்ளன.' };

  // 6. 1st Childbirth Timing (முதல் குழந்தை பாக்கியம்)
  // KP Rule: 5th Cusp Sub-Lord signifies 2, 5, 11 (favorable) vs 1, 4, 10 (barren)
  const c5 = getCusp(5);
  const sub5Sig = pMap[c5.subLord] ? pMap[c5.subLord].signifiedHouses : [];
  const childFav = sub5Sig.filter(h => [2, 5, 11].includes(h));
  const childUnfav = sub5Sig.filter(h => [1, 4, 10].includes(h));
  const childTiming = findEventTimingPeriods([2, 5, 11], dasaData.dasaList, [1, 4, 10]);

  const childVerdict = childFav.length > 0
    ? { status: 'உறுதியான புத்திர பாக்கியம்', class: 'success', text: '5-ம் பாவ உப-நாதன் 2, 5, 11 பாவங்களைத் தொடர்பு கொண்டு வம்ச விருத்தியை உறுதி செய்கிறார்.' }
    : { status: 'மருத்துவ ஆலோசனை / தாமதம்', class: 'warning', text: '4, 10-ம் பாவத் தாக்கத்தால் தாமதமாக குழந்தை பாக்கியம் கிட்டும்.' };

  // 7. House & Land Purchase (வீடு / மனை வாங்குதல்)
  // KP Rule: 4th Cusp Sub-Lord signifies 4, 11, 12 (12 = investment/spending on asset)
  const c4 = getCusp(4);
  const sub4Sig = pMap[c4.subLord] ? pMap[c4.subLord].signifiedHouses : [];
  const propFav = sub4Sig.filter(h => [4, 11, 12].includes(h));
  const propTiming = findEventTimingPeriods([4, 11, 12], dasaData.dasaList, [3, 5, 8, 9]);

  const propVerdict = propFav.length > 0
    ? { status: 'நிலம் / வீடு யோகம் உண்டு', class: 'success', text: '4-ம் பாவம் 4, 11, 12 பாவங்களை இணைத்து சொத்து வாங்கும் யோகத்தைத் தருகிறது.' }
    : { status: 'தாமதம்', class: 'warning', text: 'முதலீட்டுக்கான சூழல் வரும்போது நிலம் அல்லது வீடு அமையும்.' };

  // 8. Car / Bike Purchase (கார் அல்லது பைக்)
  // KP Rule: 4th Cusp Sub-Lord & Venus signify 4, 11
  const venus = planets.find(p => p.key === 'Venus') || planets[0];
  const venSig = pMap['Venus'] ? pMap['Venus'].signifiedHouses : [];
  const vehicleFav = Array.from(new Set([...sub4Sig, ...venSig])).filter(h => [4, 11].includes(h));
  const vehicleTiming = findEventTimingPeriods([4, 11], dasaData.dasaList, [3, 5, 8]);

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
  const abroadTiming = findEventTimingPeriods([3, 9, 12, 11], dasaData.dasaList, [4]);
  const abroadVerdict = abroadFav.length > 0
    ? { status: 'வெளிநாட்டு யோகம் உண்டு', class: 'success', text: '3, 9, 12-ம் பாவங்கள் வெளிநாட்டுப் பயணம் மற்றும் குடியேற்றத்தை ஆதரிக்கின்றன.' }
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

  // 10th Bhava Karma & Profession Engine Variables
  const c10SSLKey = c10.subSubLord || c10.subLord;
  const c10SLKey = c10.starLord;
  const connectsTo1 = sub10Sig.includes(1);
  const connectsTo5 = sub10Sig.includes(5);
  const connectsTo9 = sub10Sig.includes(9);

  let csl1stHouseAnalysis = "10-ம் பாவ உபநட்சத்திரம் 1-ம் பாவத்தைத் தொடர்பு கொள்ளவில்லை.";
  if (connectsTo1) {
    csl1stHouseAnalysis = "10-ம் பாவ உபநட்சத்திரம் 1-ம் பாவத்தைத் தொடர்பு கொள்கிறார்! 1-ம் பாவம் 10-க்கு 4-ம் பாவமாக வருவதால் தொழிலை 30% இயக்கி கௌரவம்/மரியாதையைத் தரும். ஆனால் 2-க்கு 12-ம் பாவமாக வருவதால் பணப்புழக்கம் குறைவாகவும் அகம்/சுய கௌரவம் சார்ந்த தொழிலுக்கு ஏற்றதாகவும் அமையும்.";
  }

  let cslNegationAnalysis = "10-ம் பாவத்திற்கு 4, 8, 12 பாவங்களான (1, 5, 9) முடக்கத் தொடர்புகள் இல்லை.";
  if (connectsTo1 || connectsTo5 || connectsTo9) {
    const negList = [1, 5, 9].filter(h => sub10Sig.includes(h)).join(', ');
    cslNegationAnalysis = `10-ம் பாவ உபநட்சத்திரம் ${negList} பாவங்களைத் தொடர்பு கொள்கிறார். 1, 5, 9 பாவங்கள் 10-க்கு 4, 8, 12-ஆக வந்து தொழில் கடமைகளில் கவனக்குறைவு அல்லது உல்லாச சிந்தனைகளால் தொழிலில் முடக்கத்தை ஏற்படுத்தலாம். எச்சரிக்கை தேவை.`;
  }

  // 7th Bhava Marriage, Intimacy & Spouse Audit Engine Variables
  const c7SSLKey = c7.subSubLord || c7.subLord;
  const c7SLKey = c7.starLord;

  const spouseSources = [];
  const sourceLabels = {
    1: 'அறிமுகமான நபர் / மரபு சார்ந்த கௌரவத் திருமணம்',
    2: 'குடும்ப உறவினர் அல்லது பொன் பொருள் சேர்க்கை',
    3: 'திருமண தகவல் மையம் / பக்கத்து ஊர் நபர்',
    4: 'சொந்த ஊர் / தாய்வழி உறவு / சொத்துடைய நபர்',
    5: 'காதல் திருமணம் (Love Marriage)',
    6: 'உடன் பணிபுரிபவர் / குறைந்த தகுதி நபர்',
    7: 'சமமான தகுதி நபர் / பதிவுத் திருமணம்',
    8: 'திடீர் திருமணம் / நிர்ப்பந்தத் திருமணம்',
    9: 'அன்னிய இனம்/மதம், வெளிநாடு / தந்தைவழி உறவு',
    10: 'வேலை பார்க்குமிடம் / ஒரே தொழில் செய்பவர்',
    11: 'நண்பர் அல்லது விரும்பித் தேர்ந்தெடுத்த நபர்',
    12: 'ரகசியத் திருமணம் / வெளிநாட்டு நபர்'
  };

  cusps.forEach(c => {
    const cslSig = pMap[c.subLord] ? pMap[c.subLord].signifiedHouses : [];
    if (cslSig.includes(7)) {
      spouseSources.push(`${c.house}-ம் பாவம் (${sourceLabels[c.house]})`);
    }
  });

  const has5_7 = sub7Sig.includes(5);
  const has11_7 = sub7Sig.includes(11);
  const has6_7 = sub7Sig.includes(6);
  const has12_7 = sub7Sig.includes(12);
  const has4_7 = sub7Sig.includes(4);
  const has10_7 = sub7Sig.includes(10);
  const has3_7 = sub7Sig.includes(3);
  const has9_7 = sub7Sig.includes(9);
  const has2_7 = sub7Sig.includes(2);
  const has8_7 = sub7Sig.includes(8);

  let axisAnalysis = "7-ம் பாவ உபநட்சத்திரத் தொடர்புகள் ஆய்வு செய்யப்பட்டுள்ளன.";
  if (has5_7 && has11_7) {
    axisAnalysis = "✨ 5 & 11 தொடர்புகள் (சம சப்தம யோகம்): உன்னதமான காதல், பூரண தாம்பத்ய சுகம் & குடும்ப மகிழ்ச்சி நீடிக்கும்.";
  } else if (has6_7 && has12_7) {
    axisAnalysis = "⚠️ 6 & 12 தொடர்புகள்: நீயா-நானா ஆதிக்கப் போட்டி, மனக்கசப்பு மற்றும் வழக்கு/விவாகரத்து எச்சரிக்கை.";
  } else if (has4_7 && has10_7) {
    axisAnalysis = "🏠 4 & 10 தொடர்புகள்: சொத்து சேர்க்கை மற்றும் பொருளாதார முன்னேற்றம் உண்டு; ஆனால் தாம்பத்ய சுகத்தில் அதிருப்தி / தாமதம் ஏற்படலாம்.";
  } else if (has3_7 && has9_7) {
    axisAnalysis = "🕊️ 3 & 9 தொடர்புகள்: சிறந்த மன ஒற்றுமை, பரஸ்பர நம்பிக்கை, தடையற்ற தாம்பத்யம் மற்றும் இணைந்து சுற்றுலாப் பயணம் அமையும்.";
  } else if (has2_7 && has8_7) {
    axisAnalysis = "💰 2 & 8 தொடர்புகள்: பணப் பரிமாற்றச் சண்டைகள் மற்றும் வாழ்க்கைத் துணைக்கு ஆரோக்கியக் குறைவு ஏற்படும் எச்சரிக்கை.";
  } else if (has6_7 && has9_7) {
    axisAnalysis = "⚖️ 6 & 9 தொடர்புகள்: முதல் திருமண விவாகரத்திற்குப் பின் சட்டப்பூர்வ 2-வது திருமணம் அமையும்.";
  } else if (has6_7 && has8_7) {
    axisAnalysis = "🔥 6 & 8 தொடர்புகள்: ஆணவப் போக்கால் கடுமையான வழக்கு, கடன் மற்றும் 2-வது திருமணத் தடை ஏற்படும்.";
  } else if (has5_7 && has8_7) {
    axisAnalysis = "⚡ 5 & 8 தொடர்புகள்: கற்பு / நடத்தையில் சந்தேகம் மற்றும் பழைய காதல் விஷயங்களால் அவமானம் வரலாம்.";
  }

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
    },
    tenthBhavaAudit: {
      title: '💼 10-ம் பாவம் (தொழில் / உத்தியோகம் / கர்ம ஸ்தானம்) சிறப்புப் பகுப்பாய்வு',
      cuspSubLord: `${c10.subLordTamil} (CSL 60%)`,
      cuspSubSubLord: `${PLANETS[c10SSLKey] ? PLANETS[c10SSLKey].tamil : c10SSLKey} (SSL 25%)`,
      cuspStarLord: `${PLANETS[c10SLKey] ? PLANETS[c10SLKey].tamil : c10SLKey} (SL 15%)`,
      signified: sub10Sig.join(', ') || '-',
      karmaBhagyaRule: '10-ம் பாவம் தனஸ்தானமான 2-ம் பாவத்திற்கு 9-ம் பாவமாகும் (பாக்ய ஸ்தானம்). 10-ம் பாவம் வலுத்துள்ளதால் 2-ம் பாவம் பாதிக்கப்பட்டிருந்தாலும் தொழில் மூலம் இறையருளால் தனம் (பொருளாதாரம்) வந்துகொண்டே இருக்கும்.',
      rule70Percent: 'ஒரு பாவத்தின் 10-ம் பாவம் அந்தப் பாவத்தின் காரகங்களை 70% செயல்படுத்தும் என்ற விதிப்படி, உங்களின் வாழ்நாளில் 70% முக்கியப் பங்கினை உத்தியோகம், கடமை மற்றும் சமூக அந்தஸ்து வகிக்கும்.',
      csl1stHouseAnalysis,
      cslNegationAnalysis
    },
    seventhBhavaAudit: {
      title: '💍 7-ம் பாவம் (திருமணம், தாம்பத்யம் & வாழ்க்கைத் துணை) சிறப்புப் பகுப்பாய்வு',
      cuspSubLord: `${c7.subLordTamil} (CSL 60%)`,
      cuspSubSubLord: `${PLANETS[c7SSLKey] ? PLANETS[c7SSLKey].tamil : c7SSLKey} (SSL 25%)`,
      cuspStarLord: `${PLANETS[c7SLKey] ? PLANETS[c7SLKey].tamil : c7SLKey} (SL 15%)`,
      signified: sub7Sig.join(', ') || '-',
      spouseSources: spouseSources.length > 0 ? spouseSources.join(' | ') : 'பொதுவான குடும்ப ஏற்பாட்டுத் திருமணம்',
      axisAnalysis
    },
    currentDasaBhuktiEval: (dasaData && dasaData.currentDasa && dasaData.currentBhukti)
      ? evaluateDasaBhuktiPeriod(dasaData.currentDasa.lord, dasaData.currentBhukti.lord, planetSignifications)
      : null
  };
}

/**
 * Evaluates specific Dasa Lord + Bhukti Lord pair based on KP Significators
 */
export function evaluateDasaBhuktiPeriod(dasaLord, bhuktiLord, planetSignifications) {
  const pMap = {};
  if (planetSignifications) {
    planetSignifications.forEach(ps => { pMap[ps.planet] = ps; });
  }

  const dSig = pMap[dasaLord] ? (pMap[dasaLord].signifiedHouses || []) : [];
  const bSig = pMap[bhuktiLord] ? (pMap[bhuktiLord].signifiedHouses || []) : [];

  const combinedHouses = Array.from(new Set([...dSig, ...bSig])).sort((a, b) => a - b);

  // Helper to count matches
  const countFav = (houses) => houses.filter(h => combinedHouses.includes(h)).length;

  // 1. Health & Self (1, 5, 11 vs 6, 8, 12)
  const healthGood = countFav([1, 5, 11]);
  const healthBad = countFav([6, 8, 12]);
  let healthText = "";
  if (healthGood > healthBad) {
    healthText = "உடல் ஆரோக்கியம் சீராகவும் சுறுசுறுப்பாகவும் இருக்கும். நோயெதிர்ப்பு சக்தி அதிகரிக்கும் (1, 5, 11 பாவ சுப தொடர்புகள்).";
  } else if (healthBad > healthGood) {
    healthText = "உடல் நலனில் கவனமும் தூக்கமும் தேவை. 6, 8, 12-ம் பாவத் தொடர்புகளால் உஷ்ணக் கோளாறுகள், சோர்வு அல்லது மருத்துவச் செலவுகள் வரக்கூடும்.";
  } else {
    healthText = "ஆரோக்கியம் சராசரியான அளவில் இருக்கும். சீரான உணவும் மிதமான உடற்பயிற்சியும் நலம் தரும்.";
  }

  // 2. Wealth & Finance (2, 6, 10, 11 vs 5, 8, 12)
  const finGood = countFav([2, 6, 10, 11]);
  const finBad = countFav([5, 8, 12]);
  let financeText = "";
  if (finGood >= 3) {
    financeText = "பொருளாதார வளர்ச்சி மிகவும் உன்னதமாக இருக்கும். புதிய தன வரவுகள் அதிகரித்து வங்கிக் கணக்கில் சேமிப்பு உயரும் (2, 6, 10, 11 பாவத் தொடர்புகள்).";
  } else if (finGood >= 1 && finBad <= 1) {
    financeText = "பொருளாதார நிலைமை படிப்படியாக முன்னேறும். நியாயமான உழைப்புக்கேற்ற வரவுகளும் சுப விரையங்களும் சாத்தியம்.";
  } else if (finBad > finGood) {
    financeText = "பணப் பரிவர்த்தனைகளில் எச்சரிக்கையுடன் இருக்கவும். எதிர்பாராத விரையங்கள் (5, 8, 12 தொடர்புகள்) அல்லது கடன் சுமை கூடும் வாய்ப்புண்டு.";
  } else {
    financeText = "பொருளாதாரம் மிதமான நிலையில் இருக்கும். வரவுக்கேற்ற செலவுகள் சமமாக இருக்கும்.";
  }

  // 3. Career & Profession (2, 6, 10, 11 vs 1, 5, 9, 12)
  const jobGood = countFav([2, 6, 10, 11]);
  const jobBad = countFav([5, 9, 12]);
  let careerText = "";
  if (jobGood >= 3 && jobBad <= 1) {
    careerText = "தொழில் மற்றும் உத்தியோகத்தில் பிரகாசமான காலம்! பதவி உயர்வு, ஊதிய உயர்வு, புதிய பொறுப்புகள் தேடி வரும் (2, 6, 10, 11 தொடர்புகள்).";
  } else if (jobGood >= 1 && jobBad === 0) {
    careerText = "வேலையில் நிலையான வளர்ச்சி காணப்படும். புதிய வாய்ப்புகள் அமைய சாதகமான சூழல் உண்டு.";
  } else if (jobBad >= 2) {
    careerText = "உத்தியோகத்தில் பணிச்சுமை, இடமாற்றம் அல்லது தொழில் தொடர்பான சோதனைகள் வரக்கூடும் (5, 9, 12 தொடர்புகள்). அவசர ராஜினாமாக்களைத் தவிர்க்கவும்.";
  } else {
    careerText = "தொழில் வாழ்க்கை வழக்கம்போல் இயங்கும். பெரிய மாற்றங்களைத் தவிர்த்து நிலைத்திருத்தல் நல்லது.";
  }

  // 4. Marriage & Family Life (2, 7, 11 vs 1, 6, 10)
  const marrGood = countFav([2, 7, 11]);
  const marrBad = countFav([1, 6, 10]);
  let marriageText = "";
  if (marrGood >= 2 && marrBad <= 1) {
    marriageText = "திருமண யோகம் கூடிவரும் உன்னதமான காலம்! திருமணமானவர்களுக்கு தம்பதியரிடையே அன்பும் தாம்பத்திய மகிழ்ச்சியும் பெருகும் (2, 7, 11 தொடர்புகள்).";
  } else if (marrBad >= 2) {
    marriageText = "குடும்ப வாழ்க்கையிலும் கணவன்-மனைவி உறவிலும் விட்டுக்கொடுத்துச் செல்லவும் (6, 10 தொடர்புகளால் கருத்து வேறுபாடுகள் எழலாம்).";
  } else {
    marriageText = "குடும்ப வாழ்க்கை இயல்பான சுமுகமான நிலையில் தொடரும்.";
  }

  // 5. Children & Education (2, 5, 11 vs 1, 4, 10)
  const childGood = countFav([2, 5, 11]);
  let childText = "";
  if (childGood >= 2) {
    childText = "புத்திர பாக்கியம் அமையும் சுப காலம்! குழந்தைகள் வழியில் நற்செய்திகளும் அவர்களின் கல்வி சாதனைகளும் மனமகிழ்ச்சி தரும் (2, 5, 11 தொடர்புகள்).";
  } else {
    childText = "குழந்தைகள் கல்வி மற்றும் பொது வளர்ச்சியில் சீரான முன்னேற்றம் இருக்கும்.";
  }

  // 6. Property, House & Vehicles (4, 11, 12 vs 3, 5, 8)
  const propGood = countFav([4, 11, 12]);
  let propertyText = "";
  if (propGood >= 2) {
    propertyText = "புதிய சொத்துக்கள், வீடு, நிலம் அல்லது வாகனம் வாங்கும் யோகம் உண்டாகும். அசையாச் சொத்து முதலீடுகள் சிறப்பான பலன் தரும் (4, 11, 12 தொடர்புகள்).";
  } else {
    propertyText = "சொத்து தொடர்பான விஷயங்களில் இயல்பான நிலை காணப்படும்.";
  }

  // 7. Travel & Foreign Settlement (3, 9, 12)
  const travelGood = countFav([3, 9, 12]);
  let travelText = "";
  if (travelGood >= 2) {
    travelText = "தொலைதூரப் பயணங்கள், ஆன்மீகச் சுற்றுலா மற்றும் வெளிநாட்டு யோகம்/பயணம் சாத்தியமாகும் (3, 9, 12 தொடர்புகள்).";
  } else {
    travelText = "உள்ளூர் மற்றும் குறுகிய காலப் பயணங்கள் அமையும்.";
  }

  // Score calculation (0 to 100)
  const posPoints = (healthGood * 5) + (finGood * 10) + (jobGood * 10) + (marrGood * 8) + (childGood * 5) + (propGood * 5) + (travelGood * 4);
  const negPoints = (healthBad * 6) + (finBad * 8) + (jobBad * 8) + (marrBad * 6);

  let rawScore = Math.min(100, Math.max(15, 50 + posPoints - negPoints));
  let badgeClass = "badge-neutral";
  let statusTamil = "சமமான காலம்";
  let statusColor = "#3b82f6";

  if (rawScore >= 75) {
    badgeClass = "badge-favorable";
    statusTamil = "🌟 உன்னதமான காலம் (Golden Period)";
    statusColor = "#10b981";
  } else if (rawScore >= 60) {
    badgeClass = "badge-favorable";
    statusTamil = "📈 நன்மையான வளர்ச்சி காலம்";
    statusColor = "#22c55e";
  } else if (rawScore >= 45) {
    badgeClass = "badge-neutral";
    statusTamil = "⚖️ மிதமான / சமமான காலம்";
    statusColor = "#3b82f6";
  } else {
    badgeClass = "badge-unfavorable";
    statusTamil = "⚠️ கவனமுடன் செயல்பட வேண்டிய காலம்";
    statusColor = "#ef4444";
  }

  return {
    dasaLord,
    dasaLordTamil: PLANETS[dasaLord] ? PLANETS[dasaLord].tamil : dasaLord,
    bhuktiLord,
    bhuktiLordTamil: PLANETS[bhuktiLord] ? PLANETS[bhuktiLord].tamil : bhuktiLord,
    dasaSig: dSig.join(', ') || '-',
    bhuktiSig: bSig.join(', ') || '-',
    combinedHouses: combinedHouses.join(', '),
    score: rawScore,
    statusTamil,
    statusColor,
    badgeClass,
    predictions: {
      health: healthText,
      finance: financeText,
      career: careerText,
      marriage: marriageText,
      children: childText,
      property: propertyText,
      travel: travelText
    }
  };
}

