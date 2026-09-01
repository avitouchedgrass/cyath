/**
 * Universal Local Calendar Date Helpers
 * Formats YYYY-MM-DD strings in the user's local timezone (never UTC)
 * to avoid timezone midnight shift bugs.
 */

export function formatLocalDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1, 12, 0, 0);
}

export function getRelativeLocalDate(daysOffset: number, baseDate: Date = new Date()): string {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + daysOffset);
  return formatLocalDate(d);
}
