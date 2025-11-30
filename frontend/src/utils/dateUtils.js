import { format, parseISO, isValid, addDays, differenceInDays } from 'date-fns';

export function normalizeDate(value) {
  // Accept empty string or valid YYYY-MM-DD format
  if (!value) return '';
  const trimmed = String(value).trim();
  // Browser date inputs produce YYYY-MM-DD
  const match = /^\d{4}-\d{2}-\d{2}$/.test(trimmed);
  return match ? trimmed : '';
}

/**
 * Format a date string (YYYY-MM-DD) to a readable format
 */
export function formatDate(dateString, formatString = 'MMM dd, yyyy') {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    return isValid(date) ? format(date, formatString) : '';
  } catch {
    return '';
  }
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayString() {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Add days to a date string
 */
export function addDaysToDate(dateString, days) {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    return format(addDays(date, days), 'yyyy-MM-dd');
  } catch {
    return '';
  }
}

/**
 * Calculate duration between two dates
 */
export function getDuration(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    return differenceInDays(end, start);
  } catch {
    return 0;
  }
}
