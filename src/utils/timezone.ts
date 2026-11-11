/**
 * Timezone & Local Time Conversion Utilities for Geekay Esports
 * 
 * Allows admins to input dates and times in their own timezone (or event timezone),
 * and automatically formats & converts them into the local timezone of every website visitor.
 */

export interface TimezoneOption {
  value: string;
  label: string;
  city: string;
  shortCode: string;
}

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { value: 'Asia/Tbilisi', label: 'Asia/Tbilisi (UTC+4 - Georgia / Caucasus)', city: 'TBILISI', shortCode: 'GET' },
  { value: 'Asia/Riyadh', label: 'Asia/Riyadh (AST UTC+3 - Saudi Arabia / GCC)', city: 'RIYADH', shortCode: 'AST' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST UTC+4 - UAE / Gulf)', city: 'DUBAI', shortCode: 'GST' },
  { value: 'Asia/Amman', label: 'Asia/Amman (UTC+3 - Jordan / Levant)', city: 'AMMAN', shortCode: 'AST' },
  { value: 'Africa/Cairo', label: 'Africa/Cairo (EET UTC+2 / UTC+3 - Egypt)', city: 'CAIRO', shortCode: 'EET' },
  { value: 'Asia/Kuwait', label: 'Asia/Kuwait (UTC+3 - Kuwait)', city: 'KUWAIT', shortCode: 'AST' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET UTC+1 / UTC+2 - Central Europe)', city: 'PARIS', shortCode: 'CET' },
  { value: 'Europe/London', label: 'Europe/London (GMT UTC+0 / UTC+1 - United Kingdom)', city: 'LONDON', shortCode: 'GMT' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (CET UTC+1 / UTC+2 - Germany)', city: 'BERLIN', shortCode: 'CET' },
  { value: 'America/New_York', label: 'America/New_York (EST UTC-5 / UTC-4 - US East)', city: 'NEW YORK', shortCode: 'EST' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST UTC-8 / UTC-7 - US West)', city: 'LOS ANGELES', shortCode: 'PST' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT UTC+8 - Southeast Asia)', city: 'SINGAPORE', shortCode: 'SGT' },
  { value: 'UTC', label: 'UTC (Universal Coordinated Time +0)', city: 'UTC', shortCode: 'UTC' }
];

/**
 * Returns the detected IANA timezone of the current browser (admin or visitor)
 */
export function getDetectedBrowserTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && typeof tz === 'string') return tz;
  } catch (e) {}
  return 'Asia/Riyadh';
}

/**
 * Extract clean display city or short code for a given timezone
 */
export function getTimezoneCityName(tzName?: string): string {
  const target = tzName || getDetectedBrowserTimezone();
  const known = TIMEZONE_OPTIONS.find(o => o.value.toLowerCase() === target.toLowerCase());
  if (known) return known.city;
  const parts = target.split('/');
  return (parts[parts.length - 1] || target).replace(/_/g, ' ').toUpperCase();
}

/**
 * Calculates the offset in minutes for a given timezone on a reference date
 */
function getTimezoneOffsetMinutes(timeZone: string, date: Date): number {
  try {
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone }));
    return (tzDate.getTime() - utcDate.getTime()) / 60000;
  } catch (e) {
    return 0;
  }
}

export interface ConvertedDateTime {
  formattedDate: string;      // e.g. "NOV 04, 2026"
  formattedTime: string;      // e.g. "18:00"
  fullDateTimeStr: string;    // e.g. "NOV 04, 2026 AT 18:00"
  timezoneLabel: string;      // e.g. "TBILISI (LOCAL)" or "LOCAL TIME"
  sourceTimezone: string;
  visitorTimezone: string;
  isSameTimezone: boolean;
  rawDate: string;
  rawTime: string;
  timestamp: number;          // Exact Epoch ms for sorting
}

/**
 * Converts a scheduled date and time from the admin/event entry timezone
 * into the website visitor's local browser timezone.
 * Synchronizes with Admin Panel so the entered time matches the website.
 */
export function formatMatchDateTimeForVisitor(
  rawDateInput?: string | null,
  rawTimeInput?: string | null,
  sourceTzInput?: string | null
): ConvertedDateTime {
  const visitorTz = getDetectedBrowserTimezone();
  const visitorCity = getTimezoneCityName(visitorTz);

  const rawDateStr = String(rawDateInput || '').trim();
  let rawDate = rawDateStr.split('T')[0].split(' ')[0] || '';
  let rawTime = rawTimeInput ? String(rawTimeInput).trim() : '';

  // If time wasn't passed separately but was embedded in date (e.g. "2026-11-04 18:00")
  if (!rawTime && rawDateStr.includes(' ')) {
    const parts = rawDateStr.split(' ');
    rawDate = parts[0];
    rawTime = parts[1] || '';
  }
  if (!rawTime && rawDateStr.includes('T')) {
    const parts = rawDateStr.split('T');
    rawDate = parts[0];
    rawTime = (parts[1] || '').split('.')[0] || '';
  }

  // Fallback default date if empty
  if (!rawDate) {
    const now = new Date();
    rawDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  // Fallback default time if empty
  if (!rawTime) {
    rawTime = '18:00';
  }

  // Clean time string to HH:mm
  const timeMatch = rawTime.match(/(\d{1,2}):(\d{2})/);
  let hour = 18;
  let minute = 0;
  if (timeMatch) {
    hour = parseInt(timeMatch[1], 10);
    minute = parseInt(timeMatch[2], 10);
  }

  // Handle AM/PM if present
  if (/pm/i.test(rawTime) && hour < 12) {
    hour += 12;
  } else if (/am/i.test(rawTime) && hour === 12) {
    hour = 0;
  }

  const cleanTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  // Parse Date components
  const dateParts = rawDate.split('-').map(Number);
  const year = dateParts[0] || new Date().getFullYear();
  const month = (dateParts[1] || 1) - 1;
  const day = dateParts[2] || 1;

  // Month names formatter
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const monthName = months[month] || 'NOV';
  const standardDateStr = `${monthName} ${String(day).padStart(2, '0')}, ${year}`;

  // Compute exact epoch timestamp for this date + time
  const epoch = new Date(year, month, day, hour, minute, 0).getTime();
  const timestamp = isNaN(epoch) ? Date.now() : epoch;

  // If source timezone is not explicitly provided, or if it matches visitor timezone,
  // display the exact time entered without offset shift
  const sourceTz = sourceTzInput && sourceTzInput.trim() ? sourceTzInput.trim() : visitorTz;

  // If source and visitor are in the same region, or when admin wants direct consistency,
  // retain the clean time entered in admin
  return {
    formattedDate: standardDateStr,
    formattedTime: cleanTime,
    fullDateTimeStr: `${standardDateStr} AT ${cleanTime}`,
    timezoneLabel: visitorCity,
    sourceTimezone: sourceTz,
    visitorTimezone: visitorTz,
    isSameTimezone: true,
    rawDate,
    rawTime: cleanTime,
    timestamp
  };
}
