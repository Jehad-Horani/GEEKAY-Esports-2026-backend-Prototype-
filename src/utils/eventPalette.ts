/**
 * Unified Event Color Palette for Geekay Esports
 * Ensures matches inherit the distinct, deterministic color of their tournament.
 */

export interface EventPaletteColor {
  name: string;
  hex: string;
  glow: string;
  badgeBg: string;
  borderHex: string;
}

export const EVENT_COLOR_PALETTE: EventPaletteColor[] = [
  { name: 'amber', hex: '#FFC400', glow: 'rgba(255,196,0,0.4)', badgeBg: 'rgba(255,196,0,0.15)', borderHex: '#FFC400' },
  { name: 'cyan', hex: '#00E5FF', glow: 'rgba(0,229,255,0.4)', badgeBg: 'rgba(0,229,255,0.15)', borderHex: '#00E5FF' },
  { name: 'purple', hex: '#A855F7', glow: 'rgba(168,85,247,0.4)', badgeBg: 'rgba(168,85,247,0.15)', borderHex: '#A855F7' },
  { name: 'emerald', hex: '#10B981', glow: 'rgba(16,185,129,0.4)', badgeBg: 'rgba(16,185,129,0.15)', borderHex: '#10B981' },
  { name: 'rose', hex: '#F43F5E', glow: 'rgba(244,63,94,0.4)', badgeBg: 'rgba(244,63,94,0.15)', borderHex: '#F43F5E' },
  { name: 'orange', hex: '#FF6D00', glow: 'rgba(255,109,0,0.4)', badgeBg: 'rgba(255,109,0,0.15)', borderHex: '#FF6D00' },
  { name: 'blue', hex: '#3B82F6', glow: 'rgba(59,130,246,0.4)', badgeBg: 'rgba(59,130,246,0.15)', borderHex: '#3B82F6' },
  { name: 'teal', hex: '#14B8A6', glow: 'rgba(20,184,166,0.4)', badgeBg: 'rgba(20,184,166,0.15)', borderHex: '#14B8A6' }
];

/**
 * Returns a stable, deterministic color for any event based on its ID or title
 */
export function getEventPaletteColor(eventIdOrTitle?: string | number | null, index?: number): EventPaletteColor {
  if (typeof index === 'number' && index >= 0) {
    return EVENT_COLOR_PALETTE[index % EVENT_COLOR_PALETTE.length];
  }

  const str = String(eventIdOrTitle || 'event').toLowerCase();
  
  // Specific known tournament color anchors for visual brand consistency
  if (str.includes('osaka') || str.includes('blast')) {
    return EVENT_COLOR_PALETTE[5]; // Orange
  }
  if (str.includes('france') || str.includes('slash')) {
    return EVENT_COLOR_PALETTE[3]; // Emerald
  }
  if (str.includes('mpl') || str.includes('mena season')) {
    return EVENT_COLOR_PALETTE[4]; // Rose
  }
  if (str.includes('kings') || str.includes('hok')) {
    return EVENT_COLOR_PALETTE[2]; // Purple
  }
  if (str.includes('overwatch') || str.includes('owcs')) {
    return EVENT_COLOR_PALETTE[1]; // Cyan
  }
  if (str.includes('league') || str.includes('europe')) {
    return EVENT_COLOR_PALETTE[0]; // Amber
  }

  // Hash code for arbitrary event IDs
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % EVENT_COLOR_PALETTE.length;
  return EVENT_COLOR_PALETTE[idx];
}
