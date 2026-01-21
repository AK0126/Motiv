/**
 * Convert time string (HH:mm) to minutes since midnight
 * @param {string} timeStr - Time string in format "HH:mm"
 * @returns {number} - Minutes since midnight
 */
export function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string (HH:mm)
 * @param {number} minutes - Minutes since midnight
 * @returns {string} - Time string in format "HH:mm"
 */
export function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Snap minutes to nearest interval
 * @param {number} minutes - Minutes to snap
 * @param {number} interval - Interval in minutes (default: 15)
 * @returns {number} - Snapped minutes
 */
export function snapToInterval(minutes, interval = 15) {
  return Math.round(minutes / interval) * interval;
}

/**
 * Calculate duration in minutes between two time strings
 * Handles activities that span midnight (e.g., 23:45 to 00:15)
 * @param {string} startTime - Start time "HH:mm"
 * @param {string} endTime - End time "HH:mm"
 * @returns {number} - Duration in minutes
 */
export function calculateDuration(startTime, endTime) {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  // If end < start, activity spans midnight
  if (end < start) {
    return (24 * 60 - start) + end;
  }

  return end - start;
}

/**
 * Format minutes as duration string (e.g., "1h 30m" or "45m")
 * @param {number} minutes - Duration in minutes
 * @returns {string} - Formatted duration
 */
export function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
}

/**
 * Generate array of hour labels for timeline
 * @returns {Array<string>} - Array of hour labels ["00:00", "01:00", ..., "23:00"]
 */
export function getHourLabels() {
  return Array.from({ length: 24 }, (_, i) =>
    `${String(i).padStart(2, '0')}:00`
  );
}

/**
 * Calculate grid row position for timeline (96 rows = 15-min intervals)
 * @param {string} timeStr - Time string "HH:mm"
 * @returns {number} - Grid row start position (1-based)
 */
export function timeToGridRow(timeStr) {
  const minutes = timeToMinutes(timeStr);
  return Math.floor(minutes / 15) + 1;
}

/**
 * Calculate grid row span for timeline duration
 * @param {string} startTime - Start time "HH:mm"
 * @param {string} endTime - End time "HH:mm"
 * @returns {number} - Number of grid rows to span
 */
export function durationToGridSpan(startTime, endTime) {
  const durationMinutes = calculateDuration(startTime, endTime);
  return Math.ceil(durationMinutes / 15);
}
