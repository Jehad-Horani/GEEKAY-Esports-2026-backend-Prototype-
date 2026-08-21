/**
 * Utility to calculate dynamic match and event statuses based on current real-world date & time.
 * Automatically classifies items as 'live', 'upcoming', or 'completed'.
 */

const MONTH_MAP: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
  january: '01', february: '02', march: '03', april: '04', june: '06',
  july: '07', august: '08', september: '09', october: '10', november: '11', december: '12'
};

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseStandardDate(dateStr?: string | null): string | null {
  if (!dateStr || dateStr === 'TBD' || dateStr === '' || typeof dateStr !== 'string') return null;
  const raw = dateStr.trim();
  const clean = raw.split('T')[0].trim();

  // Pattern YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = clean.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymdMatch) {
    const y = ymdMatch[1];
    const m = String(parseInt(ymdMatch[2], 10)).padStart(2, '0');
    const d = String(parseInt(ymdMatch[3], 10)).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Pattern DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const part1 = parseInt(dmyMatch[1], 10);
    const part2 = parseInt(dmyMatch[2], 10);
    const y = dmyMatch[3];
    // If part1 > 12, it must be DD-MM-YYYY
    // Otherwise standard DD-MM-YYYY assumption for international esports
    let day = part1;
    let month = part2;
    if (part2 > 12 && part1 <= 12) {
      day = part2;
      month = part1;
    }
    return `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  // Check for textual dates like "21 Aug 2026" or "August 21, 2026"
  const textMonthMatch = clean.match(/([a-zA-Z]+)/);
  if (textMonthMatch) {
    const mName = textMonthMatch[1].toLowerCase();
    if (MONTH_MAP[mName]) {
      const mNum = MONTH_MAP[mName];
      const numbers = clean.match(/\d+/g);
      if (numbers && numbers.length >= 2) {
        let year = numbers.find(n => n.length === 4);
        let day = numbers.find(n => n.length <= 2);
        if (year && day) {
          return `${year}-${mNum}-${String(parseInt(day, 10)).padStart(2, '0')}`;
        }
      }
    }
  }

  // Fallback to standard Date object
  const parsed = new Date(raw);
  if (!isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return null;
}

/**
 * Determines whether a match or event is 'live', 'upcoming', or 'completed'
 * purely based on real current date & time.
 */
export function getDynamicStatus(
  startDateStr?: string | null,
  endDateStr?: string | null,
  timeStr?: string | null,
  explicitStatus?: string | null
): 'live' | 'upcoming' | 'completed' {
  const todayStr = getTodayDateString();
  const start = parseStandardDate(startDateStr);
  const end = parseStandardDate(endDateStr) || start;

  // If no valid date is present, fallback to explicitStatus or 'upcoming'
  if (!start) {
    const st = String(explicitStatus || '').toLowerCase();
    if (st === 'completed' || st === 'finished' || st === 'ended' || st === 'past') return 'completed';
    if (st === 'live' || st === 'ongoing') return 'live';
    return 'upcoming';
  }

  // Multi-day range check (e.g. tournament spanning 2026-08-20 to 2026-08-25)
  const effectiveEnd = end || start;
  if (todayStr >= start && todayStr <= effectiveEnd) {
    // If today is within event range or matches today's date -> LIVE
    return 'live';
  }

  if (effectiveEnd < todayStr) {
    return 'completed';
  }

  if (start > todayStr) {
    return 'upcoming';
  }

  return 'upcoming';
}

/**
 * Clean up opponent name or title so it cleanly formats as "VS OPPONENT_NAME"
 * and never duplicates "VS" or leaves "Geekay vs".
 */
export function cleanOpponentName(rawOppOrTeams?: string | null, fallback = 'GLOBAL CONTENDERS'): string {
  if (!rawOppOrTeams || !rawOppOrTeams.trim()) return `VS ${fallback}`;
  let clean = rawOppOrTeams.trim();

  // Strip leading "VS", "vs.", "vs :", "vs-"
  clean = clean.replace(/^(vs\.?|vs\s*:|vs\s*-)\s+/i, '').trim();

  // Remove "Geekay Esports vs" or "Geekay vs"
  if (/^geekay(\s+esports)?\s+vs\.?\s+/i.test(clean)) {
    clean = clean.replace(/^geekay(\s+esports)?\s+vs\.?\s+/i, '').trim();
  }
  // Remove "vs Geekay Esports" or "vs Geekay" at the end
  else if (/\s+vs\.?\s+geekay(\s+esports)?$/i.test(clean)) {
    clean = clean.replace(/\s+vs\.?\s+geekay(\s+esports)?$/i, '').trim();
  }
  // Remove "Opponent " prefix
  else if (/^opponent\s+/i.test(clean)) {
    clean = clean.replace(/^opponent\s+/i, '').trim();
  }

  // Remove any leftover leading "vs"
  clean = clean.replace(/^vs\.?\s+/i, '').trim();

  if (!clean) return `VS ${fallback}`;
  return `VS ${clean.toUpperCase()}`;
}

/**
 * Computes match winner, score, and WIN/LOSS status for past/completed matches.
 */
export function getMatchResult(item: any): { isWin: boolean; score: string; resText: 'WIN' | 'LOSS' } {
  let isWin = true;
  let score = '2 - 1';

  if (!item) {
    return { isWin: true, score: '2 - 1', resText: 'WIN' };
  }

  if (item.winner) {
    isWin = String(item.winner).toLowerCase().includes('geekay');
  } else if (item.res || item.result) {
    isWin = String(item.res || item.result).toUpperCase() === 'WIN';
  } else if (item.score && item.score !== '0-0' && item.score !== 'Upcoming') {
    const rawScore = String(item.score);
    score = rawScore;
    const parts = rawScore.split('-').map(s => parseInt(s.trim(), 10));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      isWin = parts[0] >= parts[1];
    } else if (rawScore.includes('1 - 3') || rawScore.startsWith('0')) {
      isWin = false;
    }
  }

  return {
    isWin,
    score: item.score && item.score !== 'Upcoming' && item.score !== '0-0' ? item.score : (isWin ? '2 - 1' : '1 - 2'),
    resText: isWin ? 'WIN' : 'LOSS'
  };
}
