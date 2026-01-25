import { useState } from 'react';
import { useActivities } from '../hooks/api/useActivities';
import { useDailyRatings } from '../hooks/api/useDailyRatings';
import { useCategories } from '../hooks/api/useCategories';
import CategoryBreakdownChart from './CategoryBreakdownChart';
import DayQualityChart from './DayQualityChart';
import {
  calculateCategoryTotals,
  getRatingCounts,
  calculateAverageMinutesPerDay,
  getDateRangePresets,
} from '../utils/analyticsHelpers';
import { formatDuration } from '../utils/timeHelpers';
import { format } from 'date-fns';
import { getISODateString } from '../utils/dateHelpers';

const AnalyticsView = () => {
  const dateRangePresets = getDateRangePresets();
  const [selectedRange, setSelectedRange] = useState(dateRangePresets[0]); // Default to last 7 days

  // Fetch data for the selected date range
  const { useActivitiesByDateRange } = useActivities();
  const { useRatingsByDateRange } = useDailyRatings();
  const { categories, isLoading: categoriesLoading } = useCategories();

  const startDateStr = getISODateString(selectedRange.startDate);
  const endDateStr = getISODateString(selectedRange.endDate);

  const { data: activitiesArray = [], isLoading: activitiesLoading, error: activitiesError } = useActivitiesByDateRange(startDateStr, endDateStr);
  const { data: ratingsArray = [], isLoading: ratingsLoading } = useRatingsByDateRange(startDateStr, endDateStr);

  // Convert arrays to objects for analytics helpers (maintains backwards compatibility)
  // Normalize field names from snake_case to camelCase
  const activities = activitiesArray.reduce((acc, activity) => {
    const date = activity.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push({
      ...activity,
      startTime: activity.start_time || activity.startTime,
      endTime: activity.end_time || activity.endTime,
      categoryId: activity.category_id || activity.categoryId,
    });
    return acc;
  }, {});

  const ratings = ratingsArray.reduce((acc, rating) => {
    acc[rating.date] = rating.rating;
    return acc;
  }, {});

  const categoryTotals = calculateCategoryTotals(
    activities,
    selectedRange.startDate,
    selectedRange.endDate
  );

  const ratingCounts = getRatingCounts(
    ratings,
    selectedRange.startDate,
    selectedRange.endDate
  );

  const avgMinutesPerDay = calculateAverageMinutesPerDay(
    activities,
    selectedRange.startDate,
    selectedRange.endDate
  );

  const totalMinutes = Object.values(categoryTotals).reduce((sum, mins) => sum + mins, 0);
  const totalDays = ratingCounts.great + ratingCounts.ok + ratingCounts.tough;
  const mostLoggedCategory = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])[0];
  const mostLoggedCategoryName = mostLoggedCategory
    ? categories.find(cat => cat.id === mostLoggedCategory[0])?.name
    : 'None';

  const isLoading = activitiesLoading || ratingsLoading || categoriesLoading;

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Date Range Selector */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-800/50 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics</h2>
            <div className="flex flex-wrap gap-2">
              {dateRangePresets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setSelectedRange(preset)}
                  disabled={isLoading}
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedRange.label === preset.label
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {format(selectedRange.startDate, 'MMM d, yyyy')} - {format(selectedRange.endDate, 'MMM d, yyyy')}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading analytics...</span>
          </div>
        )}

        {/* Error State */}
        {activitiesError && !isLoading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
            Failed to load analytics data. Please try again.
          </div>
        )}

        {/* Content */}
        {!isLoading && (
          <>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-800/50 p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Time Logged</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{formatDuration(totalMinutes)}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-800/50 p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg. Per Day</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{formatDuration(avgMinutesPerDay)}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-800/50 p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Days Rated</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalDays}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-800/50 p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Top Category</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">{mostLoggedCategoryName}</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-800/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Time by Category</h3>
            <CategoryBreakdownChart
              categoryTotals={categoryTotals}
              categories={categories}
            />
          </div>

          {/* Day Quality Distribution */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-800/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Day Quality</h3>
            <DayQualityChart counts={ratingCounts} />
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsView;
