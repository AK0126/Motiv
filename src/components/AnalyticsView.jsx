import { useState } from 'react';
import { useActivities } from '../hooks/api/useActivities';
import { useDailyRatings } from '../hooks/api/useDailyRatings';
import { useCategories } from '../hooks/api/useCategories';
import CategoryBreakdownChart from './CategoryBreakdownChart';
import DayQualityChart from './DayQualityChart';
import WeeklyTrendsChart from './WeeklyTrendsChart';
import WeekSelector from './WeekSelector';
import {
  calculateCategoryTotals,
  getRatingCounts,
  calculateAverageMinutesPerDay,
  getDateRangePresets,
  getLast4Weeks,
  groupActivitiesByWeek,
  prepareWeeklyChartData,
  calculateWeeklySummary,
} from '../utils/analyticsHelpers';
import { formatDuration } from '../utils/timeHelpers';
import { format } from 'date-fns';
import { getISODateString } from '../utils/dateHelpers';

const AnalyticsView = () => {
  const dateRangePresets = getDateRangePresets();
  const [selectedRange, setSelectedRange] = useState(dateRangePresets[0]); // Default to last 7 days
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'weekly'
  const [selectedWeek, setSelectedWeek] = useState('This Week');

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

  // Fetch data for weekly trends (last 4 weeks)
  const weeks = getLast4Weeks();
  const oldestWeek = weeks[weeks.length - 1];
  const newestWeek = weeks[0];

  const weeklyStartDateStr = getISODateString(oldestWeek.startDate);
  const weeklyEndDateStr = getISODateString(newestWeek.endDate);

  const {
    data: weeklyActivitiesArray = [],
    isLoading: weeklyActivitiesLoading
  } = useActivitiesByDateRange(weeklyStartDateStr, weeklyEndDateStr);

  // Group activities by week
  const weeklyData = groupActivitiesByWeek(weeklyActivitiesArray, weeks);
  const chartData = prepareWeeklyChartData(weeklyData, categories);

  // Get data for selected week
  const selectedWeekData = weeklyData[selectedWeek];
  const selectedWeekActivities = weeklyActivitiesArray.reduce((acc, activity) => {
    if (!selectedWeekData) return acc;
    const activityDate = new Date(activity.date);
    if (activityDate >= selectedWeekData.startDate && activityDate <= selectedWeekData.endDate) {
      if (!acc[activity.date]) acc[activity.date] = [];
      acc[activity.date].push({
        ...activity,
        startTime: activity.start_time || activity.startTime,
        endTime: activity.end_time || activity.endTime,
        categoryId: activity.category_id || activity.categoryId,
      });
    }
    return acc;
  }, {});

  const selectedWeekSummary = selectedWeekData
    ? calculateWeeklySummary(
        selectedWeekActivities,
        selectedWeekData.startDate,
        selectedWeekData.endDate,
        categories
      )
    : null;

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

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-800/50 mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('weekly')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'weekly'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Weekly Trends
              </button>
            </nav>
          </div>
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
        {!isLoading && activeTab === 'overview' && (
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

        {!isLoading && activeTab === 'weekly' && (
          <>
            {/* Week Selector and Summary Stats */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-800/50 p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Week-over-Week Trends
                </h3>
                <WeekSelector
                  weeks={weeks}
                  selectedWeek={selectedWeek}
                  onWeekChange={setSelectedWeek}
                />
              </div>

              {/* Selected Week Summary Stats */}
              {selectedWeekSummary && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Time</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {formatDuration(selectedWeekSummary.totalMinutes)}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg. Per Day</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {formatDuration(selectedWeekSummary.avgMinutesPerDay)}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Days Logged</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {selectedWeekSummary.daysWithActivities}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Top Category</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
                      {selectedWeekSummary.topCategory}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Weekly Trends Chart */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-800/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Category Breakdown by Week
              </h3>
              <WeeklyTrendsChart
                chartData={chartData}
                categories={categories}
                selectedWeek={selectedWeek}
                onWeekSelect={setSelectedWeek}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsView;
