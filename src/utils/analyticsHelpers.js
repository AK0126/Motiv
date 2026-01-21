import { format, subDays, startOfDay, endOfDay, eachDayOfInterval, parseISO } from 'date-fns';

/**
 * Calculate total minutes per category within a date range
 * @param {Object} activities - Activities object keyed by date
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Object} - Object with categoryId as key and total minutes as value
 */
export function calculateCategoryTotals(activities, startDate, endDate) {
  const categoryTotals = {};
  const startStr = format(startDate, 'yyyy-MM-dd');
  const endStr = format(endDate, 'yyyy-MM-dd');

  Object.entries(activities).forEach(([dateStr, dayActivities]) => {
    if (dateStr >= startStr && dateStr <= endStr) {
      dayActivities.forEach((activity) => {
        const startMinutes = parseInt(activity.startTime.split(':')[0]) * 60 + parseInt(activity.startTime.split(':')[1]);
        const endMinutes = parseInt(activity.endTime.split(':')[0]) * 60 + parseInt(activity.endTime.split(':')[1]);
        const duration = endMinutes - startMinutes;

        if (!categoryTotals[activity.categoryId]) {
          categoryTotals[activity.categoryId] = 0;
        }
        categoryTotals[activity.categoryId] += duration;
      });
    }
  });

  return categoryTotals;
}

/**
 * Get day rating counts within a date range
 * @param {Object} ratings - Ratings object keyed by date
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Object} - Counts for each rating type
 */
export function getRatingCounts(ratings, startDate, endDate) {
  const counts = { great: 0, ok: 0, tough: 0 };
  const startStr = format(startDate, 'yyyy-MM-dd');
  const endStr = format(endDate, 'yyyy-MM-dd');

  Object.entries(ratings).forEach(([dateStr, rating]) => {
    if (dateStr >= startStr && dateStr <= endStr) {
      if (counts.hasOwnProperty(rating)) {
        counts[rating]++;
      }
    }
  });

  return counts;
}

/**
 * Calculate average minutes per day
 * @param {Object} activities - Activities object keyed by date
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} - Average minutes per day
 */
export function calculateAverageMinutesPerDay(activities, startDate, endDate) {
  const startStr = format(startDate, 'yyyy-MM-dd');
  const endStr = format(endDate, 'yyyy-MM-dd');
  let totalMinutes = 0;
  let daysWithActivities = 0;

  Object.entries(activities).forEach(([dateStr, dayActivities]) => {
    if (dateStr >= startStr && dateStr <= endStr && dayActivities.length > 0) {
      daysWithActivities++;
      dayActivities.forEach((activity) => {
        const startMinutes = parseInt(activity.startTime.split(':')[0]) * 60 + parseInt(activity.startTime.split(':')[1]);
        const endMinutes = parseInt(activity.endTime.split(':')[0]) * 60 + parseInt(activity.endTime.split(':')[1]);
        totalMinutes += (endMinutes - startMinutes);
      });
    }
  });

  return daysWithActivities > 0 ? Math.round(totalMinutes / daysWithActivities) : 0;
}

/**
 * Get date range presets
 * @returns {Array} - Array of date range preset objects
 */
export function getDateRangePresets() {
  const today = new Date();
  return [
    {
      label: 'Last 7 days',
      startDate: subDays(today, 6),
      endDate: today,
    },
    {
      label: 'Last 30 days',
      startDate: subDays(today, 29),
      endDate: today,
    },
    {
      label: 'Last 90 days',
      startDate: subDays(today, 89),
      endDate: today,
    },
  ];
}
