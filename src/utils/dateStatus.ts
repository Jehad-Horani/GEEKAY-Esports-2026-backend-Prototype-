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
 * Checks whether current time falls before, during, or after a scheduled time window on a given date.
 */
export function isCurrentlyWithinTimeWindow(
  dateStr?: string | null,
  timeStr?: string | null,
  durationHours = 3.5
): { isBefore: boolean; isDuring: boolean; isAfter: boolean } {
  if (!dateStr) return { isBefore: false, isDuring: false, isAfter: false };
  const todayStr = getTodayDateString();
  const cleanDate = parseStandardDate(dateStr) || dateStr.trim();

  if (cleanDate > todayStr) return { isBefore: true, isDuring: false, isAfter: false };
  if (cleanDate < todayStr) return { isBefore: false, isDuring: false, isAfter: true };

  if (!timeStr || !timeStr.trim()) {
    return { isBefore: false, isDuring: true, isAfter: false };
  }

  const rawTime = timeStr.trim();
  const match = rawTime.match(/(\d{1,2})[:.](\d{2})/);
  if (!match) return { isBefore: false, isDuring: true, isAfter: false };

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  if (/pm/i.test(rawTime) && hours < 12) hours += 12;
  if (/am/i.test(rawTime) && hours === 12) hours = 0;

  let endHours = hours + Math.floor(durationHours);
  let endMinutes = minutes + Math.round((durationHours % 1) * 60);
  const endMatch = rawTime.match(/-\s*(\d{1,2})[:.](\d{2})/);
  if (endMatch) {
    let eh = parseInt(endMatch[1], 10);
    const em = parseInt(endMatch[2], 10);
    if (/pm/i.test(rawTime) && eh < 12) eh += 12;
    endHours = eh;
    endMinutes = em;
  }

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = hours * 60 + minutes;
  const totalEndMinutes = endHours * 60 + endMinutes;

  if (nowMinutes < startMinutes) return { isBefore: true, isDuring: false, isAfter: false };
  if (nowMinutes >= startMinutes && nowMinutes <= totalEndMinutes) return { isBefore: false, isDuring: true, isAfter: false };
  return { isBefore: false, isDuring: false, isAfter: true };
}

/**
 * Determines whether a match or event is 'live', 'upcoming', or 'completed'
 * purely based on real current date, time, and fixture progress.
 */
export function getDynamicStatus(
  startDateStr?: string | null,
  endDateStr?: string | null,
  timeStr?: string | null,
  explicitStatus?: string | null,
  matches?: any[] | string | null
): 'live' | 'upcoming' | 'completed' {
  const rawStatus = String(explicitStatus || '').toLowerCase().trim();
  if (rawStatus === 'completed' || rawStatus === 'finished' || rawStatus === 'ended' || rawStatus === 'past') return 'completed';
  if (rawStatus === 'live' || rawStatus === 'ongoing') return 'live';

  const todayStr = getTodayDateString();
  const start = parseStandardDate(startDateStr);

  if (!start) {
    return 'upcoming';
  }

  const effectiveEnd = parseStandardDate(endDateStr) || start;

  // 1. If start date is in future -> strictly upcoming
  if (start > todayStr) {
    return 'upcoming';
  }

  // 2. If end date is in past -> completed
  if (effectiveEnd < todayStr) {
    return 'completed';
  }

  // 3. Event date range encompasses today (start <= todayStr <= end)
  // Check if matches are provided to evaluate real fixture states
  let parsedMatches: any[] = [];
  if (typeof matches === 'string') {
    try { parsedMatches = JSON.parse(matches); } catch {}
  } else if (Array.isArray(matches)) {
    parsedMatches = matches;
  }

  if (parsedMatches.length > 0) {
    // Check if any match is currently marked live
    const hasLiveMatch = parsedMatches.some(m => getMatchDynamicStatus(m, startDateStr) === 'live');
    if (hasLiveMatch) return 'live';

    // Check matches scheduled for TODAY
    const todaysMatches = parsedMatches.filter(m => {
      const mDate = parseStandardDate(m.date) || start;
      return mDate === todayStr;
    });

    if (todaysMatches.length > 0) {
      const anyLiveToday = todaysMatches.some(m => getMatchDynamicStatus(m, startDateStr) === 'live');
      if (anyLiveToday) return 'live';

      const anyUpcomingToday = todaysMatches.some(m => getMatchDynamicStatus(m, startDateStr) === 'upcoming');
      if (anyUpcomingToday) return 'upcoming';

      // All today's matches are completed; check if future matches exist
      const hasFutureMatches = parsedMatches.some(m => {
        const mDate = parseStandardDate(m.date);
        return mDate && mDate > todayStr && getMatchDynamicStatus(m, startDateStr) !== 'completed';
      });
      return hasFutureMatches ? 'upcoming' : 'completed';
    }

    // No matches scheduled for today
    const hasFutureMatches = parsedMatches.some(m => {
      const mDate = parseStandardDate(m.date);
      return (!mDate || mDate > todayStr) && getMatchDynamicStatus(m, startDateStr) !== 'completed';
    });
    if (hasFutureMatches) return 'upcoming';

    const allMatchesCompleted = parsedMatches.every(m => getMatchDynamicStatus(m, startDateStr) === 'completed');
    if (allMatchesCompleted) return 'completed';
  }

  // 4. Single-day event today
  if (start === todayStr && effectiveEnd === todayStr) {
    if (timeStr && timeStr.trim()) {
      const windowCheck = isCurrentlyWithinTimeWindow(todayStr, timeStr);
      if (windowCheck.isBefore) return 'upcoming';
      if (windowCheck.isDuring) return 'live';
      if (windowCheck.isAfter) return 'completed';
    }
    return rawStatus === 'upcoming' ? 'upcoming' : 'live';
  }

  // 5. Multi-day event active today: only live if currently in broadcast time window
  if (timeStr && timeStr.trim()) {
    const windowCheck = isCurrentlyWithinTimeWindow(todayStr, timeStr);
    if (windowCheck.isDuring) return 'live';
  }

  if (rawStatus === 'upcoming') return 'upcoming';

  return 'upcoming';
}

/**
 * Determines whether an individual match inside an event is 'live', 'upcoming', or 'completed'.
 * Unlike full events/tournaments that may span multi-week or multi-month ranges,
 * individual matches occur on their specific match date.
 */
export function getMatchDynamicStatus(
  match: any,
  eventFallbackDate?: string | null
): 'live' | 'upcoming' | 'completed' {
  if (!match) return 'upcoming';

  const rawStatus = String(match.status || '').toLowerCase().trim();
  const rawScore = String(match.score || '').trim();
  const hasScore = Boolean(
    rawScore &&
    rawScore !== '0-0' &&
    rawScore.toLowerCase() !== 'upcoming' &&
    rawScore.toLowerCase() !== 'tbd' &&
    !rawScore.toLowerCase().includes('vs')
  );

  // 1. Explicit finished/completed status OR has valid final score
  if (
    rawStatus === 'completed' ||
    rawStatus === 'finished' ||
    rawStatus === 'ended' ||
    rawStatus === 'past' ||
    (hasScore && rawStatus !== 'live')
  ) {
    return 'completed';
  }

  // 2. Explicit live status
  if (rawStatus === 'live' || rawStatus === 'ongoing') {
    return 'live';
  }

  // 3. Match Date Comparison
  const mDate = parseStandardDate(match.date) || parseStandardDate(eventFallbackDate);
  const todayStr = getTodayDateString();

  if (mDate) {
    // Future date -> strictly upcoming
    if (mDate > todayStr) {
      return 'upcoming';
    }
    // Past date -> completed unless explicitly marked upcoming with no score
    if (mDate < todayStr) {
      return hasScore || rawStatus === 'completed' ? 'completed' : (rawStatus === 'upcoming' ? 'upcoming' : 'completed');
    }
    // Date is TODAY -> check time window!
    if (mDate === todayStr) {
      const matchTime = match.time || '';
      if (matchTime) {
        const windowCheck = isCurrentlyWithinTimeWindow(todayStr, matchTime);
        if (windowCheck.isBefore) return 'upcoming';
        if (windowCheck.isDuring) return 'live';
        if (windowCheck.isAfter) return 'completed';
      }
      return rawStatus === 'upcoming' ? 'upcoming' : 'live';
    }
  }

  // 4. Fallback
  if (rawStatus === 'upcoming') {
    return 'upcoming';
  }

  return 'upcoming';
}

export interface LocalizedMatchDateTime {
  formattedDate: string;       // e.g. "15 OCT 2026"
  formattedTime: string;       // e.g. "18:00 (GST)" or "TIME TBD"
  fullDisplay: string;         // e.g. "15 OCT 2026 • 18:00 (GST)"
  timeZoneAbbr: string;        // e.g. "GST" or "EDT"
  timestamp: number;           // Precise Epoch milliseconds for chronological sorting
  hasTime: boolean;
}

/**
 * Converts stored match date and time into the visitor's local timezone,
 * providing clear, unambiguous day/month/year and hour/minute formatting.
 */
export function formatMatchLocalDateTime(
  dateStr?: string | null,
  timeStr?: string | null
): LocalizedMatchDateTime {
  if (!dateStr || dateStr === 'TBD' || dateStr === '') {
    return {
      formattedDate: 'DATE TBD',
      formattedTime: 'TIME TBD',
      fullDisplay: 'DATE TBD',
      timeZoneAbbr: '',
      timestamp: Number.MAX_SAFE_INTEGER,
      hasTime: false
    };
  }

  const cleanDate = parseStandardDate(dateStr) || dateStr.trim();
  let year = 2026;
  let month = 10;
  let day = 15;

  const ymdMatch = cleanDate.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (ymdMatch) {
    year = parseInt(ymdMatch[1], 10);
    month = parseInt(ymdMatch[2], 10);
    day = parseInt(ymdMatch[3], 10);
  }

  let hours = 18;
  let minutes = 0;
  let hasTime = false;
  // Geekay Esports HQ is based in Dubai (UTC+4: Gulf Standard Time)
  let offsetStr = '+04:00';

  if (timeStr && typeof timeStr === 'string' && timeStr.trim()) {
    const rawTime = timeStr.trim();
    if (/\b(utc|gmt)\b/i.test(rawTime)) offsetStr = '+00:00';
    else if (/\b(gst)\b/i.test(rawTime)) offsetStr = '+04:00';
    else if (/\b(ast|ksa|riyadh)\b/i.test(rawTime)) offsetStr = '+03:00';
    else if (/\b(cet)\b/i.test(rawTime)) offsetStr = '+01:00';
    else if (/\b(cest)\b/i.test(rawTime)) offsetStr = '+02:00';
    else if (/\b(est)\b/i.test(rawTime)) offsetStr = '-05:00';
    else if (/\b(edt)\b/i.test(rawTime)) offsetStr = '-04:00';
    else if (/\b(pst)\b/i.test(rawTime)) offsetStr = '-08:00';
    else if (/\b(pdt)\b/i.test(rawTime)) offsetStr = '-07:00';

    const tMatch = rawTime.match(/(\d{1,2})[:.](\d{2})/);
    if (tMatch) {
      hours = parseInt(tMatch[1], 10);
      minutes = parseInt(tMatch[2], 10);
      hasTime = true;
      if (/pm/i.test(rawTime) && hours < 12) hours += 12;
      if (/am/i.test(rawTime) && hours === 12) hours = 0;
    }
  }

  const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00${offsetStr}`;
  let dateObj = new Date(iso);
  if (isNaN(dateObj.getTime())) {
    dateObj = new Date(cleanDate);
  }

  const validTime = !isNaN(dateObj.getTime());
  const timestamp = validTime ? dateObj.getTime() : Number.MAX_SAFE_INTEGER;

  let formattedDate = cleanDate;
  let formattedTime = hasTime ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}` : 'TIME TBD';
  let timeZoneAbbr = '';

  if (validTime) {
    try {
      // Localized unambiguous date e.g. "15 OCT 2026"
      const d = dateObj.toLocaleDateString(undefined, { day: '2-digit' });
      const m = dateObj.toLocaleDateString(undefined, { month: 'short' }).toUpperCase();
      const y = dateObj.toLocaleDateString(undefined, { year: 'numeric' });
      formattedDate = `${d} ${m} ${y}`;

      if (hasTime) {
        // Visitor's local time (24h format)
        const localTimeStr = dateObj.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });

        // Visitor's local timezone abbreviation / name
        try {
          const parts = new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' }).formatToParts(dateObj);
          timeZoneAbbr = parts.find(p => p.type === 'timeZoneName')?.value || '';
        } catch {
          timeZoneAbbr = '';
        }

        formattedTime = timeZoneAbbr ? `${localTimeStr} (${timeZoneAbbr})` : localTimeStr;
      }
    } catch {
      // fallback
    }
  }

  return {
    formattedDate,
    formattedTime,
    fullDisplay: hasTime ? `${formattedDate} • ${formattedTime}` : formattedDate,
    timeZoneAbbr,
    timestamp,
    hasTime
  };
}

export interface BroadcastPlatformInfo {
  platform: 'twitch' | 'youtube' | 'kick' | 'tv' | 'stream' | 'none';
  label: string;
  url: string | null;
}

/**
 * Identifies broadcast platform and formats direct streaming link.
 */
export function detectBroadcastPlatform(
  broadcastStr?: string | null,
  linkStr?: string | null
): BroadcastPlatformInfo {
  const combined = `${broadcastStr || ''} ${linkStr || ''}`.toLowerCase();
  let url = linkStr && typeof linkStr === 'string' && linkStr.startsWith('http') ? linkStr : null;

  if (combined.includes('twitch') || (url && url.includes('twitch.tv'))) {
    return {
      platform: 'twitch',
      label: 'TWITCH',
      url: url || 'https://www.twitch.tv/geekay'
    };
  }
  if (
    combined.includes('youtube') ||
    combined.includes('youtu.be') ||
    (url && (url.includes('youtube.com') || url.includes('youtu.be')))
  ) {
    return {
      platform: 'youtube',
      label: 'YOUTUBE',
      url: url || 'https://www.youtube.com/@GeekayEsports'
    };
  }
  if (combined.includes('kick') || (url && url.includes('kick.com'))) {
    return {
      platform: 'kick',
      label: 'KICK',
      url: url || 'https://kick.com'
    };
  }
  if (url) {
    return {
      platform: 'stream',
      label: broadcastStr && broadcastStr.trim() ? broadcastStr.toUpperCase() : 'LIVE STREAM',
      url
    };
  }
  if (broadcastStr && broadcastStr.trim()) {
    return {
      platform: 'stream',
      label: broadcastStr.toUpperCase(),
      url: null
    };
  }
  return {
    platform: 'none',
    label: '',
    url: null
  };
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
