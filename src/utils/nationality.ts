// Universal Nationality, Flag & Age Helpers for GEEKAY Esports

export interface NationalityInfo {
  flag: string;
  name: string;
  code: string;
}

const COUNTRY_DATABASE: { keys: string[]; flag: string; name: string; code: string }[] = [
  { keys: ['malaysia', 'malaysian', 'my'], flag: '🇲🇾', name: 'Malaysia', code: 'MY' },
  { keys: ['saudi arabia', 'saudi', 'ksa', 'sa'], flag: '🇸🇦', name: 'Saudi Arabia', code: 'SA' },
  { keys: ['jordan', 'jordanian', 'jo'], flag: '🇯🇴', name: 'Jordan', code: 'JO' },
  { keys: ['egypt', 'egyptian', 'eg'], flag: '🇪🇬', name: 'Egypt', code: 'EG' },
  { keys: ['uae', 'united arab emirates', 'emirates', 'emirati', 'ae'], flag: '🇦🇪', name: 'United Arab Emirates', code: 'AE' },
  { keys: ['kuwait', 'kuwaiti', 'kw'], flag: '🇰🇼', name: 'Kuwait', code: 'KW' },
  { keys: ['bahrain', 'bahraini', 'bh'], flag: '🇧🇭', name: 'Bahrain', code: 'BH' },
  { keys: ['qatar', 'qatari', 'qa'], flag: '🇶🇦', name: 'Qatar', code: 'QA' },
  { keys: ['oman', 'omani', 'om'], flag: '🇴🇲', name: 'Oman', code: 'OM' },
  { keys: ['morocco', 'moroccan', 'ma'], flag: '🇲🇦', name: 'Morocco', code: 'MA' },
  { keys: ['algeria', 'algerian', 'dz'], flag: '🇩🇿', name: 'Algeria', code: 'DZ' },
  { keys: ['tunisia', 'tunisian', 'tn'], flag: '🇹🇳', name: 'Tunisia', code: 'TN' },
  { keys: ['iraq', 'iraqi', 'iq'], flag: '🇮🇶', name: 'Iraq', code: 'IQ' },
  { keys: ['lebanon', 'lebanese', 'lb'], flag: '🇱🇧', name: 'Lebanon', code: 'LB' },
  { keys: ['syria', 'syrian', 'sy'], flag: '🇸🇾', name: 'Syria', code: 'SY' },
  { keys: ['palestine', 'palestinian', 'ps'], flag: '🇵🇸', name: 'Palestine', code: 'PS' },
  { keys: ['united states', 'usa', 'us', 'america', 'american'], flag: '🇺🇸', name: 'United States', code: 'US' },
  { keys: ['united kingdom', 'uk', 'great britain', 'england', 'english', 'british', 'gb'], flag: '🇬🇧', name: 'United Kingdom', code: 'GB' },
  { keys: ['canada', 'canadian', 'ca'], flag: '🇨🇦', name: 'Canada', code: 'CA' },
  { keys: ['germany', 'german', 'de', 'deutschland'], flag: '🇩🇪', name: 'Germany', code: 'DE' },
  { keys: ['france', 'french', 'fr'], flag: '🇫🇷', name: 'France', code: 'FR' },
  { keys: ['brazil', 'brasil', 'brazilian', 'br'], flag: '🇧🇷', name: 'Brazil', code: 'BR' },
  { keys: ['south korea', 'korea', 'korean', 'kr'], flag: '🇰🇷', name: 'South Korea', code: 'KR' },
  { keys: ['japan', 'japanese', 'jp'], flag: '🇯🇵', name: 'Japan', code: 'JP' },
  { keys: ['china', 'chinese', 'cn'], flag: '🇨🇳', name: 'China', code: 'CN' },
  { keys: ['turkey', 'türkiye', 'turkish', 'tr'], flag: '🇹🇷', name: 'Turkey', code: 'TR' },
  { keys: ['poland', 'polish', 'pl'], flag: '🇵🇱', name: 'Poland', code: 'PL' },
  { keys: ['denmark', 'danish', 'dk'], flag: '🇩🇰', name: 'Denmark', code: 'DK' },
  { keys: ['sweden', 'swedish', 'se'], flag: '🇸🇪', name: 'Sweden', code: 'SE' },
  { keys: ['norway', 'norwegian', 'no'], flag: '🇳🇴', name: 'Norway', code: 'NO' },
  { keys: ['finland', 'finnish', 'fi'], flag: '🇫🇮', name: 'Finland', code: 'FI' },
  { keys: ['russia', 'russian', 'ru'], flag: '🇷🇺', name: 'Russia', code: 'RU' },
  { keys: ['ukraine', 'ukrainian', 'ua'], flag: '🇺🇦', name: 'Ukraine', code: 'UA' },
  { keys: ['italy', 'italian', 'it'], flag: '🇮🇹', name: 'Italy', code: 'IT' },
  { keys: ['spain', 'spanish', 'es'], flag: '🇪🇸', name: 'Spain', code: 'ES' },
  { keys: ['portugal', 'portuguese', 'pt'], flag: '🇵🇹', name: 'Portugal', code: 'PT' },
  { keys: ['netherlands', 'dutch', 'holland', 'nl'], flag: '🇳🇱', name: 'Netherlands', code: 'NL' },
  { keys: ['belgium', 'belgian', 'be'], flag: '🇧🇪', name: 'Belgium', code: 'BE' },
  { keys: ['ireland', 'irish', 'ie'], flag: '🇮🇪', name: 'Ireland', code: 'IE' },
  { keys: ['switzerland', 'swiss', 'ch'], flag: '🇨🇭', name: 'Switzerland', code: 'CH' },
  { keys: ['austria', 'austrian', 'at'], flag: '🇦🇹', name: 'Austria', code: 'AT' },
  { keys: ['australia', 'australian', 'au'], flag: '🇦🇺', name: 'Australia', code: 'AU' },
  { keys: ['new zealand', 'nz'], flag: '🇳🇿', name: 'New Zealand', code: 'NZ' },
  { keys: ['argentina', 'argentine', 'ar'], flag: '🇦🇷', name: 'Argentina', code: 'AR' },
  { keys: ['chile', 'chilean', 'cl'], flag: '🇨🇱', name: 'Chile', code: 'CL' },
  { keys: ['mexico', 'mexican', 'mx'], flag: '🇲🇽', name: 'Mexico', code: 'MX' },
  { keys: ['colombia', 'colombian', 'co'], flag: '🇨🇴', name: 'Colombia', code: 'CO' },
  { keys: ['thailand', 'thai', 'th'], flag: '🇹🇭', name: 'Thailand', code: 'TH' },
  { keys: ['indonesia', 'indonesian', 'id'], flag: '🇮🇩', name: 'Indonesia', code: 'ID' },
  { keys: ['philippines', 'filipino', 'ph'], flag: '🇵🇭', name: 'Philippines', code: 'PH' },
  { keys: ['vietnam', 'vietnamese', 'vn'], flag: '🇻🇳', name: 'Vietnam', code: 'VN' },
  { keys: ['singapore', 'singaporean', 'sg'], flag: '🇸🇬', name: 'Singapore', code: 'SG' },
  { keys: ['india', 'indian', 'in'], flag: '🇮🇳', name: 'India', code: 'IN' },
  { keys: ['pakistan', 'pakistani', 'pk'], flag: '🇵🇰', name: 'Pakistan', code: 'PK' },
  { keys: ['south africa', 'za'], flag: '🇿🇦', name: 'South Africa', code: 'ZA' },
  { keys: ['mena', 'mena region'], flag: '🌐', name: 'MENA Region', code: 'MENA' }
];

// Helper to convert 2-letter country code into flag emoji
const isoCodeToFlag = (code: string): string => {
  if (code.length === 2 && /^[a-zA-Z]{2}$/.test(code)) {
    const upper = code.toUpperCase();
    return String.fromCodePoint(
      127397 + upper.charCodeAt(0),
      127397 + upper.charCodeAt(1)
    );
  }
  return '🌐';
};

/**
 * Resolves nationality details (flag emoji, standard name, and ISO code)
 * GUARANTEE: Never overrides custom entered nationality with a default!
 */
export const getNationalityDetails = (rawNationality?: string | null): NationalityInfo => {
  if (!rawNationality || !rawNationality.trim()) {
    return { flag: '🇸🇦', name: 'Saudi Arabia', code: 'SA' };
  }

  const trimmed = rawNationality.trim();
  const normalized = trimmed.toLowerCase();

  // 1. Direct search in database
  for (const item of COUNTRY_DATABASE) {
    if (item.keys.includes(normalized)) {
      return { flag: item.flag, name: item.name, code: item.code };
    }
  }

  // 2. Partial word match in database
  for (const item of COUNTRY_DATABASE) {
    for (const key of item.keys) {
      if (key.length > 2 && (normalized.includes(key) || key.includes(normalized))) {
        return { flag: item.flag, name: item.name, code: item.code };
      }
    }
  }

  // 3. Check if it's a 2-letter ISO code
  if (trimmed.length === 2 && /^[a-zA-Z]{2}$/.test(trimmed)) {
    return {
      flag: isoCodeToFlag(trimmed),
      name: trimmed.toUpperCase(),
      code: trimmed.toUpperCase()
    };
  }

  // 4. Custom user nationality: KEEP user's typed name, do not replace with Saudi Arabia!
  const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  return {
    flag: '🌐',
    name: capitalized,
    code: capitalized.slice(0, 3).toUpperCase()
  };
};

/**
 * Returns flag emoji for a given nationality
 */
export const getFlagEmoji = (rawNationality?: string | null): string => {
  return getNationalityDetails(rawNationality).flag;
};

/**
 * Calculates exact age in years from a birth date string (YYYY-MM-DD or parseable date).
 * Automatically updates as time passes!
 */
export const calculateAgeFromBirthDate = (birthDateString?: string | null): number | null => {
  if (!birthDateString || !birthDateString.trim()) return null;
  const birth = new Date(birthDateString);
  if (isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age >= 0 && age <= 120 ? age : null;
};

/**
 * Formats a birth date string into a clean tactical format (e.g. "15 MAR 2004")
 */
export const formatBirthDate = (birthDateString?: string | null): string => {
  if (!birthDateString || !birthDateString.trim()) return '';
  const date = new Date(birthDateString);
  if (isNaN(date.getTime())) return birthDateString;

  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};
