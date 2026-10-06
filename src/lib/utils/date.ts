/**
 * Utility functions for deterministic date comparison without timezone/locale offsets.
 * All standard dates in the app use YYYY-MM-DD.
 */

/**
 * Validates whether a string is in YYYY-MM-DD format and is a valid calendar date.
 */
export function isValidISODateString(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  // Verify days in month (handling leap years)
  const daysInMonth = new Date(year, month, 0).getDate();
  return day <= daysInMonth;
}

/**
 * Normalizes date string into YYYY-MM-DD.
 */
export function normalizeDate(dateStr: string): string {
  if (!dateStr) return '';
  return dateStr.trim().split('T')[0];
}

/**
 * Returns true if dateA is strictly before dateB (dateA < dateB).
 * Both inputs are expected to be normalized YYYY-MM-DD.
 */
export function isDateBefore(dateA: string, dateB: string): boolean {
  const normA = normalizeDate(dateA);
  const normB = normalizeDate(dateB);
  return normA < normB;
}

/**
 * Returns true if dateA is on or after dateB (dateA >= dateB).
 */
export function isDateOnOrAfter(dateA: string, dateB: string): boolean {
  const normA = normalizeDate(dateA);
  const normB = normalizeDate(dateB);
  return normA >= normB;
}

/**
 * Returns true if dateA equals dateB (dateA === dateB).
 */
export function isDateEqual(dateA: string, dateB: string): boolean {
  const normA = normalizeDate(dateA);
  const normB = normalizeDate(dateB);
  return normA === normB;
}

/**
 * Format YYYY-MM-DD for human-friendly reading.
 * Example: 2026-10-20 -> "20 Oct 2026"
 */
export function formatDisplayDate(dateStr: string, locale: 'en' | 'bn' = 'en'): string {
  if (!dateStr || !isValidISODateString(normalizeDate(dateStr))) return dateStr || '—';
  
  const [yearStr, monthStr, dayStr] = normalizeDate(dateStr).split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);

  const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthsBn = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

  if (locale === 'bn') {
    // Convert digits to Bangla numerals
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    const toBnNum = (num: number | string) => String(num).replace(/\d/g, (d) => bnDigits[parseInt(d, 10)]);
    return `${toBnNum(day)} ${monthsBn[month]} ${toBnNum(year)}`;
  }

  return `${day} ${monthsEn[month]} ${year}`;
}
