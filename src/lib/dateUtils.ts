/**
 * Universal Local Calendar Date Helpers
 * Formats YYYY-MM-DD strings in the user's local timezone (never UTC)
 * to avoid timezone midnight shift bugs.
 */

export function formatLocalDate(date?: Date | null): string {
  const safeDate = date instanceof Date && !isNaN(date.getTime()) ? date : new Date();
  const year = safeDate.getFullYear();
  const month = String(safeDate.getMonth() + 1).padStart(2, '0');
  const day = String(safeDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(dateStr?: string | null): Date {
  if (!dateStr || typeof dateStr !== 'string') {
    return new Date();
  }

  const parts = dateStr.trim().split('-').map(Number);
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return new Date();
  }

  const [year, month, day] = parts;
  const parsed = new Date(year, (month || 1) - 1, day || 1, 12, 0, 0);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function getRelativeLocalDate(daysOffset: number, baseDate?: Date | null): string {
  const safeDate = baseDate instanceof Date && !isNaN(baseDate.getTime()) ? new Date(baseDate) : new Date();
  safeDate.setDate(safeDate.getDate() + (Number(daysOffset) || 0));
  return formatLocalDate(safeDate);
}

