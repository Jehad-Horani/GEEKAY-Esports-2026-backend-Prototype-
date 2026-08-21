/**
 * Utility to calculate dynamic match and event statuses based on current real-world date & time.
 * Automatically classifies items as 'live', 'upcoming', or 'completed'.
 */

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseStandardDate(dateStr?: string | null): string | null {
  if (!dateStr || dateStr === 'TBD' || dateStr === '') return null;
  const clean = dateStr.trim().split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
  
  // Try standard parse
  const parsed = new Date(dateStr);
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
    // If today is match day, check match time if single day event
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
 * Clean up opponent name or title so it never renders "VS GEEKAY VS SENTINELS".
 * Returns a sleek, formatted opponent string.
 */
export function cleanOpponentName(rawOppOrTeams?: string | null, fallback = 'GLOBAL TEAMS'): string {
  if (!rawOppOrTeams || !rawOppOrTeams.trim()) return `VS ${fallback}`;
  let clean = rawOppOrTeams.trim();

  // If already starts with VS or vs
  clean = clean.replace(/^vs\s+/i, '').trim();

  // If contains "Geekay vs ..." or "... vs Geekay"
  if (/geekay\s+vs\s+/i.test(clean)) {
    return clean.toUpperCase();
  }
  if (/\s+vs\s+geekay/i.test(clean)) {
    return clean.toUpperCase();
  }
  if (/\s+vs\s+/i.test(clean)) {
    return clean.toUpperCase();
  }

  return `VS ${clean.toUpperCase()}`;
}

/**
 * Computes match winner, score, and WIN/LOSS status for past/completed matches.
 */
export function getMatchResult(item: any): { isWin: boolean; score: string; resText: 'WIN' | 'LOSS' } {
  let isWin = true;
  let score = '2 - 1';

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
    score: item.score && item.score !== 'Upcoming' ? item.score : (isWin ? '2 - 1' : '1 - 2'),
    resText: isWin ? 'WIN' : 'LOSS'
  };
}
