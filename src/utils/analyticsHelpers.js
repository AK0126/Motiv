import { format, subDays, startOfDay, endOfDay, eachDayOfInterval, parseISO, startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import { calculateDuration } from '../utils/timeHelpers';

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
        const duration = calculateDuration(activity.startTime, activity.endTime);

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
        totalMinutes += calculateDuration(activity.startTime, activity.endTime);
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

/**
 * Get the start of the week (Sunday) for a given date
 * @param {Date} date - The date to get the week start for
 * @returns {Date} - Start of the week (Sunday)
 */
export function getWeekStart(date) {
  return startOfWeek(date, { weekStartsOn: 0 });
}

/**
 * Get the end of the week (Saturday) for a given date
 * @param {Date} date - The date to get the week end for
 * @returns {Date} - End of the week (Saturday)
 */
export function getWeekEnd(date) {
  return endOfWeek(date, { weekStartsOn: 0 });
}

/**
 * Get the last 4 weeks including the current week
 * @returns {Array} - Array of week objects with label, startDate, endDate, weekNumber
 */
export function getLast4Weeks() {
  const today = new Date();
  const weeks = [];
  const labels = ['This Week', 'Last Week', '2 Weeks Ago', '3 Weeks Ago'];

  for (let i = 0; i < 4; i++) {
    const weekDate = subWeeks(today, i);
    weeks.push({
      label: labels[i],
      startDate: getWeekStart(weekDate),
      endDate: getWeekEnd(weekDate),
      weekNumber: i,
    });
  }

  return weeks;
}

/**
 * Group activities by week
 * @param {Array} activitiesArray - Flat array of activities from useActivitiesByDateRange
 * @param {Array} weeks - Array of week objects from getLast4Weeks
 * @returns {Object} - Object keyed by week label with categoryTotals and metadata
 */
export function groupActivitiesByWeek(activitiesArray, weeks) {
  const weeklyData = {};

  weeks.forEach((week) => {
    // Filter activities for this week
    const weekActivities = activitiesArray.filter((activity) => {
      const activityDate = new Date(activity.date);
      return activityDate >= week.startDate && activityDate <= week.endDate;
    });

    // Convert to object format expected by calculateCategoryTotals
    const activitiesObj = weekActivities.reduce((acc, activity) => {
      if (!acc[activity.date]) {
        acc[activity.date] = [];
      }
      acc[activity.date].push({
        startTime: activity.start_time || activity.startTime,
        endTime: activity.end_time || activity.endTime,
        categoryId: activity.category_id || activity.categoryId,
      });
      return acc;
    }, {});

    const categoryTotals = calculateCategoryTotals(activitiesObj, week.startDate, week.endDate);

    weeklyData[week.label] = {
      categoryTotals,
      startDate: week.startDate,
      endDate: week.endDate,
      weekNumber: week.weekNumber,
    };
  });

  return weeklyData;
}

/**
 * Prepare weekly data for Recharts stacked bar chart
 * @param {Object} weeklyData - Object from groupActivitiesByWeek
 * @param {Array} categories - Array of category objects
 * @returns {Array} - Array of objects formatted for Recharts
 */
export function prepareWeeklyChartData(weeklyData, categories) {
  // Collect all unique category IDs across all weeks
  const allCategoryIds = new Set();
  Object.values(weeklyData).forEach((week) => {
    Object.keys(week.categoryTotals).forEach((categoryId) => {
      allCategoryIds.add(categoryId);
    });
  });

  // Create array of objects, one per week
  const chartData = Object.entries(weeklyData).map(([weekLabel, weekData]) => {
    const weekObj = { week: weekLabel, weekNumber: weekData.weekNumber };

    // Add each category as a property
    allCategoryIds.forEach((categoryId) => {
      weekObj[categoryId] = weekData.categoryTotals[categoryId] || 0;
    });

    return weekObj;
  });

  // Sort by weekNumber descending (oldest to newest for left-to-right display)
  chartData.sort((a, b) => b.weekNumber - a.weekNumber);

  return chartData;
}

/**
 * Calculate summary statistics for a selected week
 * @param {Object} activities - Activities object keyed by date
 * @param {Date} startDate - Week start date
 * @param {Date} endDate - Week end date
 * @param {Array} categories - Array of category objects
 * @returns {Object} - Summary stats for the week
 */
export function calculateWeeklySummary(activities, startDate, endDate, categories) {
  const categoryTotals = calculateCategoryTotals(activities, startDate, endDate);

  // Calculate total minutes
  const totalMinutes = Object.values(categoryTotals).reduce((sum, mins) => sum + mins, 0);

  // Calculate average per day (divided by 7 calendar days)
  const avgMinutesPerDay = Math.round(totalMinutes / 7);

  // Find top category
  let topCategoryId = null;
  let maxMinutes = 0;
  Object.entries(categoryTotals).forEach(([categoryId, minutes]) => {
    if (minutes > maxMinutes) {
      maxMinutes = minutes;
      topCategoryId = categoryId;
    }
  });

  const topCategory = topCategoryId
    ? categories.find((cat) => cat.id === topCategoryId)?.name || 'Unknown'
    : 'None';

  // Count days with activities
  const daysWithActivities = Object.keys(activities).length;

  return {
    totalMinutes,
    avgMinutesPerDay,
    topCategory,
    daysWithActivities,
  };
}
