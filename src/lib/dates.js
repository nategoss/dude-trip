/**
 * Get all dates in a given month as "YYYY-MM-DD" strings.
 */
export function getDatesInMonth(year, month) {
  const dates = []
  const d = new Date(year, month, 1)
  while (d.getMonth() === month) {
    dates.push(toDateStr(d))
    d.setDate(d.getDate() + 1)
  }
  return dates
}

/**
 * Convert a Date to "YYYY-MM-DD".
 */
export function toDateStr(date) {
  return date.toISOString().slice(0, 10)
}

/**
 * Get the day-of-week index (0=Sun) for the first day of a month.
 */
export function firstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

/**
 * Number of days in a month.
 */
export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * Given a YYYY-MM-DD string, return a Date at local noon (avoids UTC offset issues).
 */
export function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d, 12)
}
