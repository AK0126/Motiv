import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';

/**
 * Get all days to display in a month calendar grid (including padding days from previous/next months)
 * @param {Date} date - Any date in the month to display
 * @returns {Array<Date>} - Array of dates to display in calendar grid
 */
export function getMonthCalendarDays(date) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  return eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });
}

/**
 * Check if a date is today
 * @param {Date} date - Date to check
 * @returns {boolean}
 */
export function isToday(date) {
  return isSameDay(date, new Date());
}

/**
 * Check if a date is in the same month as the reference date
 * @param {Date} date - Date to check
 * @param {Date} referenceDate - Reference date
 * @returns {boolean}
 */
export function isCurrentMonth(date, referenceDate) {
  return isSameMonth(date, referenceDate);
}

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @param {string} formatStr - Format string (default: 'MMMM yyyy')
 * @returns {string}
 */
export function formatDate(date, formatStr = 'MMMM yyyy') {
  return format(date, formatStr);
}

/**
 * Get ISO date string (yyyy-MM-dd)
 * @param {Date} date - Date to format
 * @returns {string}
 */
export function getISODateString(date) {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Navigate to previous month
 * @param {Date} date - Current date
 * @returns {Date}
 */
export function getPreviousMonth(date) {
  return subMonths(date, 1);
}

/**
 * Navigate to next month
 * @param {Date} date - Current date
 * @returns {Date}
 */
export function getNextMonth(date) {
  return addMonths(date, 1);
}

/**
 * Get day of week names
 * @returns {Array<string>}
 */
export function getWeekdayNames() {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
}
