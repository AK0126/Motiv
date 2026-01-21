import { useState, useMemo } from 'react';
import CalendarDay from './CalendarDay';
import { useActivities } from '../hooks/api/useActivities';
import { useDailyRatings } from '../hooks/api/useDailyRatings';
import { useCategories } from '../hooks/api/useCategories';
import {
  getMonthCalendarDays,
  formatDate,
  getPreviousMonth,
  getNextMonth,
  getWeekdayNames,
  getISODateString,
} from '../utils/dateHelpers';

const MonthCalendar = ({ onDayClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const calendarDays = getMonthCalendarDays(currentDate);
  const weekdayNames = getWeekdayNames();

  // Calculate date range for the entire calendar grid (including padding days)
  const startDate = calendarDays[0];
  const endDate = calendarDays[calendarDays.length - 1];
  const startDateStr = getISODateString(startDate);
  const endDateStr = getISODateString(endDate);

  // Fetch data for the entire month at once
  const { useActivitiesByDateRange } = useActivities();
  const { useRatingsByDateRange } = useDailyRatings();
  const { categories, isLoading: categoriesLoading } = useCategories();

  const { data: activitiesArray = [], isLoading: activitiesLoading } = useActivitiesByDateRange(startDateStr, endDateStr);
  const { data: ratingsArray = [], isLoading: ratingsLoading } = useRatingsByDateRange(startDateStr, endDateStr);

  // Group activities and ratings by date for efficient lookup
  const activitiesByDate = useMemo(() => {
    return activitiesArray.reduce((acc, activity) => {
      const date = activity.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(activity);
      return acc;
    }, {});
  }, [activitiesArray]);

  const ratingsByDate = useMemo(() => {
    return ratingsArray.reduce((acc, rating) => {
      acc[rating.date] = rating.rating;
      return acc;
    }, {});
  }, [ratingsArray]);

  const isLoading = activitiesLoading || ratingsLoading || categoriesLoading;

  const handlePreviousMonth = () => {
    setCurrentDate(getPreviousMonth(currentDate));
  };

  const handleNextMonth = () => {
    setCurrentDate(getNextMonth(currentDate));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (date) => {
    if (onDayClick) {
      onDayClick(date);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          {/* Calendar Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {formatDate(currentDate)}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleToday}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={handlePreviousMonth}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  ← Previous
                </button>
                <button
                  onClick={handleNextMonth}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
                <span>Great</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
                <span>OK</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                <span>Tough</span>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">Loading calendar...</span>
              </div>
            )}

            {/* Calendar Content */}
            {!isLoading && (
              <>
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {weekdayNames.map((day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-semibold text-gray-700 py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((date) => {
                    const dateStr = getISODateString(date);
                    const activities = activitiesByDate[dateStr] || [];
                    const rating = ratingsByDate[dateStr] || null;

                    return (
                      <CalendarDay
                        key={dateStr}
                        date={date}
                        currentMonth={currentDate}
                        activities={activities}
                        rating={rating}
                        categories={categories}
                        onClick={handleDayClick}
                      />
                    );
                  })}
                </div>
              </>
            )}

            {/* Help text */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Quick Tips</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• <strong>Click any date</strong> to add activities and rate your day</li>
                <li>• <strong>Colored borders</strong> show day ratings (Green = Great, Amber = OK, Red = Tough)</li>
                <li>• <strong>Dots</strong> indicate logged activities (colors match categories)</li>
                <li>• <strong>Press Escape</strong> to close modals quickly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthCalendar;
