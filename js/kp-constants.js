/**
 * KP Astrology (Krishnamurti Paddhati) Constants & 249 Sub-Table
 * Complete foundational data for KP Stellar Astrology
 */

export const SIGNS = [
  { id: 1, name: 'Aries', tamil: 'மேஷம்', lord: 'Mars', lordTamil: 'செவ்வாய்', element: 'Fire', startDeg: 0 },
  { id: 2, name: 'Taurus', tamil: 'ரிஷபம்', lord: 'Venus', lordTamil: 'சுக்கிரன்', element: 'Earth', startDeg: 30 },
  { id: 3, name: 'Gemini', tamil: 'மிதுனம்', lord: 'Mercury', lordTamil: 'புதன்', element: 'Air', startDeg: 60 },
  { id: 4, name: 'Cancer', tamil: 'கடகம்', lord: 'Moon', lordTamil: 'சந்திரன்', element: 'Water', startDeg: 90 },
  { id: 5, name: 'Leo', tamil: 'சிம்மம்', lord: 'Sun', lordTamil: 'சூரியன்', element: 'Fire', startDeg: 120 },
  { id: 6, name: 'Virgo', tamil: 'கன்னி', lord: 'Mercury', lordTamil: 'புதன்', element: 'Earth', startDeg: 150 },
  { id: 7, name: 'Libra', tamil: 'துலாம்', lord: 'Venus', lordTamil: 'சுக்கிரன்', element: 'Air', startDeg: 180 },
  { id: 8, name: 'Scorpio', tamil: 'விருச்சிகம்', lord: 'Mars', lordTamil: 'செவ்வாய்', element: 'Water', startDeg: 210 },
  { id: 9, name: 'Sagittarius', tamil: 'தனுசு', lord: 'Jupiter', lordTamil: 'குரு', element: 'Fire', startDeg: 240 },
  { id: 10, name: 'Capricorn', tamil: 'மகரம்', lord: 'Saturn', lordTamil: 'சனி', element: 'Earth', startDeg: 270 },
  { id: 11, name: 'Aquarius', tamil: 'கும்பம்', lord: 'Saturn', lordTamil: 'சனி', element: 'Air', startDeg: 300 },
  { id: 12, name: 'Pisces', tamil: 'மீனம்', lord: 'Jupiter', lordTamil: 'குரு', element: 'Water', startDeg: 330 }
];

export const PLANETS = {
  Ketu: { name: 'Ketu', tamil: 'கேது', short: 'Ke', dasaYears: 7, color: '#8b5cf6' },
  Venus: { name: 'Venus', tamil: 'சுக்கிரன்', short: 'Ve', dasaYears: 20, color: '#ec4899' },
  Sun: { name: 'Sun', tamil: 'சூரியன்', short: 'Su', dasaYears: 6, color: '#f59e0b' },
  Moon: { name: 'Moon', tamil: 'சந்திரன்', short: 'Mo', dasaYears: 10, color: '#e0f2fe' },
  Mars: { name: 'Mars', tamil: 'செவ்வாய்', short: 'Ma', dasaYears: 7, color: '#ef4444' },
  Rahu: { name: 'Rahu', tamil: 'ராகு', short: 'Ra', dasaYears: 18, color: '#6366f1' },
  Jupiter: { name: 'Jupiter', tamil: 'குரு', short: 'Ju', dasaYears: 16, color: '#eab308' },
  Saturn: { name: 'Saturn', tamil: 'சனி', short: 'Sa', dasaYears: 19, color: '#3b82f6' },
  Mercury: { name: 'Mercury', tamil: 'புதன்', short: 'Me', dasaYears: 17, color: '#10b981' }
};

export const VIMSHOTTARI_ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

export const NAKSHATRAS = [
  { id: 1, name: 'Ashwini', tamil: 'அசுவினி', lord: 'Ketu', lordTamil: 'கேது' },
  { id: 2, name: 'Bharani', tamil: 'பரணி', lord: 'Venus', lordTamil: 'சுக்கிரன்' },
  { id: 3, name: 'Krittika', tamil: 'கிருத்திகை', lord: 'Sun', lordTamil: 'சூரியன்' },
  { id: 4, name: 'Rohini', tamil: 'ரோகிணி', lord: 'Moon', lordTamil: 'சந்திரன்' },
  { id: 5, name: 'Mrigashira', tamil: 'மிருகசீரிஷம்', lord: 'Mars', lordTamil: 'செவ்வாய்' },
  { id: 6, name: 'Ardra', tamil: 'திருவாதிரை', lord: 'Rahu', lordTamil: 'ராகு' },
  { id: 7, name: 'Punarvasu', tamil: 'புனர்பூசம்', lord: 'Jupiter', lordTamil: 'குரு' },
  { id: 8, name: 'Pushya', tamil: 'பூசம்', lord: 'Saturn', lordTamil: 'சனி' },
  { id: 9, name: 'Ashlesha', tamil: 'ஆயில்யம்', lord: 'Mercury', lordTamil: 'புதன்' },
  { id: 10, name: 'Magha', tamil: 'மகம்', lord: 'Ketu', lordTamil: 'கேது' },
  { id: 11, name: 'Purva Phalguni', tamil: 'பூரம்', lord: 'Venus', lordTamil: 'சுக்கிரன்' },
  { id: 12, name: 'Uttara Phalguni', tamil: 'உத்திரம்', lord: 'Sun', lordTamil: 'சூரியன்' },
  { id: 13, name: 'Hasta', tamil: 'அஸ்தம்', lord: 'Moon', lordTamil: 'சந்திரன்' },
  { id: 14, name: 'Chitra', tamil: 'சித்திரை', lord: 'Mars', lordTamil: 'செவ்வாய்' },
  { id: 15, name: 'Swati', tamil: 'சுவாதி', lord: 'Rahu', lordTamil: 'ராகு' },
  { id: 16, name: 'Vishakha', tamil: 'விசாகம்', lord: 'Jupiter', lordTamil: 'குரு' },
  { id: 17, name: 'Anuradha', tamil: 'அனுஷம்', lord: 'Saturn', lordTamil: 'சனி' },
  { id: 18, name: 'Jyeshtha', tamil: 'கேட்டை', lord: 'Mercury', lordTamil: 'புதன்' },
  { id: 19, name: 'Mula', tamil: 'மூலம்', lord: 'Ketu', lordTamil: 'கேது' },
  { id: 20, name: 'Purva Ashadha', tamil: 'பூராடம்', lord: 'Venus', lordTamil: 'சுக்கிரன்' },
  { id: 21, name: 'Uttara Ashadha', tamil: 'உத்திராடம்', lord: 'Sun', lordTamil: 'சூரியன்' },
  { id: 22, name: 'Shravana', tamil: 'திருவோணம்', lord: 'Moon', lordTamil: 'சந்திரன்' },
  { id: 23, name: 'Dhanishta', tamil: 'அவிட்டம்', lord: 'Mars', lordTamil: 'செவ்வாய்' },
  { id: 24, name: 'Shatabhisha', tamil: 'சதயம்', lord: 'Rahu', lordTamil: 'ராகு' },
  { id: 25, name: 'Purva Bhadrapada', tamil: 'பூரட்டாதி', lord: 'Jupiter', lordTamil: 'குரு' },
  { id: 26, name: 'Uttara Bhadrapada', tamil: 'உத்திரட்டாதி', lord: 'Saturn', lordTamil: 'சனி' },
  { id: 27, name: 'Revati', tamil: 'ரேவதி', lord: 'Mercury', lordTamil: 'புதன்' }
];

export const HOUSES = [
  { id: 1, name: '1st House', tamil: '1-ம் பாவம் (லக்னம்)', significations: 'உடல் நலம், ஆயுள், குணநலன், தோற்றம், புகழ்' },
  { id: 2, name: '2nd House', tamil: '2-ம் பாவம் (தனம் & குடும்பம்)', significations: 'பணவரவு, குடும்பம், வாக்கு, கண் பார்வை, சேமிப்பு' },
  { id: 3, name: '3rd House', tamil: '3-ம் பாவம் (தைரியம் & இளைய சகோதரம்)', significations: 'தைரியம், முயற்சி, குறுகிய பயணம், இளைய சகோதரம், தகவல் தொடர்பு' },
  { id: 4, name: '4th House', tamil: '4-ம் பாவம் (சுகம் & தாய்)', significations: 'தாய், வீடு, மனை, வாகனம், கல்வி, உள்ள அமைதி' },
  { id: 5, name: '5th House', tamil: '5-ம் பாவம் (புத்திரம் & பூர்வ புண்ணியம்)', significations: 'குழந்தை பாக்கியம், அறிவு, கலை, காதல், ஊக வணிகம்' },
  { id: 6, name: '6th House', tamil: '6-ம் பாவம் (ருணம், ரோகம், சத்ரு)', significations: 'நோய், கடன், எதிரி, போட்டித் தேர்வு, உத்தியோகம்/வேலை' },
  { id: 7, name: '7th House', tamil: '7-ம் பாவம் (களத்திரம் & நட்பு)', significations: 'திருமணம், வாழ்க்கைத்துணை, கூட்டாளி, வாடிக்கையாளர்கள்' },
  { id: 8, name: '8th House', tamil: '8-ம் பாவம் (ஆயுள் & கண்டம்)', significations: 'ஆயுள், திடீர் ஆதாயம், விபத்து, மன உளைச்சல், மறைமுக வருமானம்' },
  { id: 9, name: '9th House', tamil: '9-ம் பாவம் (பாக்கியம் & தந்தை)', significations: 'தந்தை, பாக்கியம், உயர் கல்வி, ஆன்மீகம், நீண்ட பயணம்' },
  { id: 10, name: '10th House', tamil: '10-ம் பாவம் (ஜீவனம் & தொழில்)', significations: 'தொழில், பதவி, அதிகாரம், சமூக அந்தஸ்து, கௌரவம்' },
  { id: 11, name: '11th House', tamil: '11-ம் பாவம் (லாபம் & ஆசை நிறைவேறுதல்)', significations: 'லாபம், ஆசை நிறைவேறுதல், மூத்த சகோதரம், நலம் விரும்பிகள்' },
  { id: 12, name: '12th House', tamil: '12-ம் பாவம் (விரயம் & அயன சயனம்)', significations: 'விரயம், முதலீடு, வெளிநாட்டு யோகம், மோட்சம், மருத்துவச் செலவு' }
];

// KP Horary Question Rules (Favorable vs Unfavorable Bhavas)
export const HORARY_QUESTIONS = [
  {
    id: 'marriage',
    titleTamil: 'திருமணம் கை கூடுமா? (Marriage)',
    titleEn: 'Will marriage take place?',
    primaryHouse: 7,
    favorableHouses: [2, 7, 11],
    unfavorableHouses: [1, 6, 10],
    neutralHouses: [3, 5, 9],
    descriptionTamil: '7-ம் பாவ உப-நாதன் 2, 7, 11-ம் பாவங்களைக் காட்டினால் திருமணம் விரைவில் கைகூடும். 1, 6, 10-ம் பாவங்களைக் காட்டினால் மறுப்பு அல்லது தாமதம்.'
  },
  {
    id: 'job',
    titleTamil: 'புதிய வேலை / உத்தியோகம் கிடைக்குமா? (Job / Career)',
    titleEn: 'Will I get a new job / promotion?',
    primaryHouse: 6,
    favorableHouses: [2, 6, 10, 11],
    unfavorableHouses: [1, 5, 9, 12],
    neutralHouses: [3, 4],
    descriptionTamil: '6-ம் அல்லது 10-ம் பாவ உப-நாதன் 2, 6, 10, 11-ம் பாவங்களைத் தொடர்பு கொண்டால் புதிய வேலை மற்றும் பதவி உயர்வு உறுதி.'
  },
  {
    id: 'wealth',
    titleTamil: 'பண வரவு / கடன் அடைபடுமா? (Finance & Debt)',
    titleEn: 'Financial gain & clearing debts?',
    primaryHouse: 2,
    favorableHouses: [2, 6, 11],
    unfavorableHouses: [5, 8, 12],
    neutralHouses: [1, 3, 10],
    descriptionTamil: '2-ம் பாவ உப-நாதன் 2, 6, 11-ம் பாவங்களைக் காட்டினால் அபரிமிதமான பண வரவு மற்றும் எதிர்ப்புகளை வெல்லும் நிலை உருவாகும்.'
  },
  {
    id: 'child',
    titleTamil: 'குழந்தை பாக்கியம் உண்டாகுமா? (Childbirth)',
    titleEn: 'Will we be blessed with children?',
    primaryHouse: 5,
    favorableHouses: [2, 5, 11],
    unfavorableHouses: [1, 4, 10],
    neutralHouses: [3, 7, 9],
    descriptionTamil: '5-ம் பாவ உப-நாதன் 2, 5, 11-ம் பாவங்களுக்கு சாதகமான கிரகத்தின் சாரத்தில் நின்றால் புத்திர பாக்கியம் நிச்சயிக்கப்படும்.'
  },
  {
    id: 'foreign',
    titleTamil: 'வெளிநாடு பயணம் / குடியுரிமை கிடைக்குமா? (Foreign Travel)',
    titleEn: 'Will foreign travel/settlement happen?',
    primaryHouse: 12,
    favorableHouses: [3, 9, 12, 11],
    unfavorableHouses: [2, 4, 11],
    neutralHouses: [1, 7],
    descriptionTamil: '3 (பயணம்), 9 (தொலைதூரப் பயணம்), 12 (வெளிநாடு) ஆகிய பாவங்கள் தொடர்பு கொள்ளும்போது வெளிநாட்டு யோகம் அமையும்.'
  },
  {
    id: 'property',
    titleTamil: 'வீடு / மனை / வாகனம் வாங்க முடியுமா? (Property & Vehicle)',
    titleEn: 'Will I purchase house/land/vehicle?',
    primaryHouse: 4,
    favorableHouses: [4, 11, 12],
    unfavorableHouses: [3, 5, 6],
    neutralHouses: [1, 2, 9],
    descriptionTamil: '4-ம் பாவ உப-நாதன் 4, 11-ம் பாவங்களைக் காட்டினால் நிலம், வீடு, வாகனம் வாங்கும் பாக்கியம் உண்டாகும்.'
  },
  {
    id: 'litigation',
    titleTamil: 'வழக்கு / போட்டியில் வெற்றி பெறுவேனா? (Court & Litigation)',
    titleEn: 'Will I win the court case / competition?',
    primaryHouse: 6,
    favorableHouses: [6, 11],
    unfavorableHouses: [12, 5],
    neutralHouses: [1, 3, 10],
    descriptionTamil: '6 மற்றும் 11-ம் பாவங்கள் வெற்றி தரும்; 12-ம் பாவம் சமாதானம் அல்லது தோல்வியைக் காட்டும்.'
  },
  {
    id: 'health',
    titleTamil: 'நோய் குணமாகி உடல் நலம் தேறுமா? (Health Recovery)',
    titleEn: 'Will the patient recover from illness?',
    primaryHouse: 1,
    favorableHouses: [1, 5, 11],
    unfavorableHouses: [6, 8, 12],
    neutralHouses: [2, 3, 10],
    descriptionTamil: '1, 5, 11-ம் பாவங்கள் முழு ஆரோக்கியத்தையும் நோய் நிவாரணத்தையும் குறிக்கின்றன.'
  },
  {
    id: 'lost_item',
    titleTamil: 'காணாமல் போன பொருள் மீண்டும் கிடைக்குமா? (Lost Article)',
    titleEn: 'Will the lost article be recovered?',
    primaryHouse: 2,
    favorableHouses: [2, 6, 11],
    unfavorableHouses: [8, 12],
    neutralHouses: [1, 4, 10],
    descriptionTamil: '2 மற்றும் 11-ம் பாவங்கள் பொருள் திரும்புவதைக் காட்டும்; 12 பொருள் கிடைக்காது என்பதைச் சுட்டும்.'
  },
  {
    id: 'job_loss',
    titleTamil: 'வேலை இழப்பு / பதவி பறிபோகுமா? (Job Loss Risk)',
    titleEn: 'Will I lose my job / face suspension?',
    primaryHouse: 6,
    favorableHouses: [2, 6, 10, 11], // retaining job
    unfavorableHouses: [5, 9, 12, 1], // job loss / resignation
    neutralHouses: [3, 7],
    descriptionTamil: '6 மற்றும் 10-ம் பாவ உப-நாதன் 5 (வேலை இழப்பு), 9 (பதவி இழப்பு), 12 (பிரிவு/நீக்கம்) பாவங்களைத் தொடர்பு கொண்டால் வேலை இழப்பு அபாயம் உண்டு. 2, 6, 10, 11 வேலை தொடர்வதைக் காட்டும்.'
  },
  {
    id: 'business',
    titleTamil: 'சுயதொழில் / வியாபாரம் தொடங்கலாமா? (Start Business)',
    titleEn: 'Can I do business & when to start?',
    primaryHouse: 7,
    favorableHouses: [2, 7, 10, 11],
    unfavorableHouses: [5, 8, 12],
    neutralHouses: [1, 3, 9],
    descriptionTamil: '7-ம் பாவ உப-நாதன் (வாடிக்கையாளர் & வியாபாரம்) 2, 7, 10, 11-ம் பாவங்களைக் காட்டினால் வியாபாரத்தில் அபரிமித லாபம் ஈட்டலாம்.'
  },
  {
    id: 'job_location',
    titleTamil: 'வேலை சொந்த ஊரிலா அல்லது வெளியூரிலா? (Job Location)',
    titleEn: 'Will job be in native or other district/state?',
    primaryHouse: 4,
    favorableHouses: [4, 2, 11], // native place stay
    unfavorableHouses: [3, 9, 12], // relocation / other district / state
    neutralHouses: [6, 10],
    descriptionTamil: '4-ம் பாவம் சொந்த ஊரையும்; 3-ம் பாவம் அண்டை மாவட்டம் / குறுகிய தூர இடமாற்றத்தையும்; 9 & 12-ம் பாவங்கள் வெளி மாநிலம் அல்லது வெளிநாட்டையும் குறிக்கும்.'
  }
];

export function generate249SubTable() {
  const table = [];
  let subIndex = 1;
  const totalStarSeconds = 800 * 60; // 13°20' = 48,000 arc seconds
  const totalDasaYears = 120;

  for (let nIdx = 0; nIdx < 27; nIdx++) {
    const nak = NAKSHATRAS[nIdx];
    const nakStartSec = nIdx * totalStarSeconds;
    const starLord = nak.lord;
    const startIndexInOrder = VIMSHOTTARI_ORDER.indexOf(starLord);

    let currentSec = nakStartSec;

    for (let s = 0; s < 9; s++) {
      const subLord = VIMSHOTTARI_ORDER[(startIndexInOrder + s) % 9];
      const dasaYears = PLANETS[subLord].dasaYears;
      const subSpanSec = (dasaYears / totalDasaYears) * totalStarSeconds;
      const subEndSec = currentSec + subSpanSec;

      // Check if this sub crosses any 30° boundary (30 * 3600 = 108,000 arc seconds)
      const signBoundSec = Math.floor(currentSec / 108000 + 1) * 108000;

      if (subEndSec > signBoundSec && signBoundSec < (nIdx + 1) * totalStarSeconds) {
        // Part 1
        const sign1Idx = Math.floor(currentSec / 108000);
        const sign1 = SIGNS[sign1Idx];
        table.push(createSubEntry(subIndex++, sign1, nak, subLord, currentSec, signBoundSec));

        // Part 2
        const sign2Idx = Math.floor(signBoundSec / 108000);
        const sign2 = SIGNS[sign2Idx];
        table.push(createSubEntry(subIndex++, sign2, nak, subLord, signBoundSec, subEndSec));
      } else {
        const signIdx = Math.floor(currentSec / 108000) % 12;
        const sign = SIGNS[signIdx];
        table.push(createSubEntry(subIndex++, sign, nak, subLord, currentSec, subEndSec));
      }

      currentSec = subEndSec;
    }
  }

  return table;
}

function createSubEntry(no, sign, nak, subLord, startSec, endSec) {
  const startTotalDeg = startSec / 3600;
  const endTotalDeg = endSec / 3600;
  const startSignDeg = (startSec % 108000) / 3600;
  const endSignDeg = (endSec % 108000) / 3600;

  return {
    no,
    signName: sign.name,
    signTamil: sign.tamil,
    signLord: sign.lord,
    signLordTamil: sign.lordTamil,
    starName: nak.name,
    starTamil: nak.tamil,
    starLord: nak.lord,
    starLordTamil: nak.lordTamil,
    subLord: subLord,
    subLordTamil: PLANETS[subLord].tamil,
    startTotalDeg,
    endTotalDeg,
    startDegStr: formatDms(startSignDeg),
    endDegStr: formatDms(endSignDeg),
    rangeDisplay: `${formatDms(startSignDeg)} - ${formatDms(endSignDeg)}`
  };
}

export function formatDms(degFloat) {
  let d = Math.floor(degFloat);
  let rem = (degFloat - d) * 60;
  let m = Math.floor(rem);
  let s = Math.round((rem - m) * 60);
  if (s >= 60) {
    s = 0;
    m++;
  }
  if (m >= 60) {
    m = 0;
    d++;
  }
  return `${d}° ${m.toString().padStart(2, '0')}' ${s.toString().padStart(2, '0')}"`;
}

export const KP_249_TABLE = generate249SubTable();

export function getKpSubForLongitude(deg) {
  deg = (deg % 360 + 360) % 360;
  const degSec = deg * 3600;
  for (const item of KP_249_TABLE) {
    if (degSec >= item.startTotalDeg * 3600 - 0.001 && degSec < item.endTotalDeg * 3600 - 0.001) {
      return item;
    }
  }
  return KP_249_TABLE[KP_249_TABLE.length - 1];
}
