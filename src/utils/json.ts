export function safeJsonParse<T = any>(val: any, fallback: T): T {
  if (val === null || val === undefined) return fallback;
  if (typeof val !== 'string') return val as T;
  const trimmed = val.trim();
  if (!trimmed) return fallback;
  try {
    return JSON.parse(trimmed);
  } catch (e) {
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const content = trimmed.slice(1, -1).trim();
      if (!content) return [] as unknown as T;
      const items = content
        .split(',')
        .map(s => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean);
      return items as unknown as T;
    }
    return fallback;
  }
}
