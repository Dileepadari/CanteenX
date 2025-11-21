// Small utilities to format dates/times in Asia/Kolkata timezone (IST)
export function toISTDateISO(input?: Date | string | number | null): string | null {
  if (!input) return null;
  const d = typeof input === 'string' || typeof input === 'number' ? new Date(input) : input;
  // Intl with 'en-CA' yields YYYY-MM-DD which matches ISO date part
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(d);
}

export function formatIST(input?: Date | string | number | null, options?: Intl.DateTimeFormatOptions, locale = 'en-US') {
  if (!input) return '';
  const d = typeof input === 'string' || typeof input === 'number' ? new Date(input) : input;
  return new Intl.DateTimeFormat(locale, { timeZone: 'Asia/Kolkata', ...(options || {}) }).format(d);
}

export function toISTISOString(input?: Date | string | number | null): string | null {
  if (!input) return null;
  const d = typeof input === 'string' || typeof input === 'number' ? new Date(input) : input;
  // Build an ISO-like string in IST with offset
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }).formatToParts(d);
  // parts contains values we can assemble
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  return `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}:${map.second}+05:30`;
}

export default { toISTDateISO, formatIST, toISTISOString };
