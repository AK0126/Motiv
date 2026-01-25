import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import DayRatingSelector from './DayRatingSelector';
import Timeline24Hour from './Timeline24Hour';
import EmptyState from './EmptyState';
import { useActivities } from '../hooks/api/useActivities';
import { useDailyRatings } from '../hooks/api/useDailyRatings';
import { useCategories } from '../hooks/api/useCategories';
import { getISODateString } from '../utils/dateHelpers';
import { formatDuration, calculateDuration } from '../utils/timeHelpers';

const DayView = ({ date, onClose }) => {
  const dateStr = getISODateString(date);

  // API hooks
  const { useActivitiesByDate, addActivity, deleteActivity, updateActivity, isAdding, isUpdating, isDeleting } = useActivities();
  const { useRatingByDate, setRatingForDate, isSetting } = useDailyRatings();
  const { categories, isLoading: categoriesLoading, getCategoryById } = useCategories();

  // Fetch activities and rating for this date
  const { data: activities = [], isLoading: activitiesLoading, error: activitiesError } = useActivitiesByDate(dateStr);
  const { data: ratingData, isLoading: ratingLoading } = useRatingByDate(dateStr);
  const rating = ratingData?.rating || null;

  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddTime, setQuickAddTime] = useState(null);
  const [activityTitle, setActivityTitle] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Add keyboard shortcut to close modal with Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectedActivity) {
          setSelectedActivity(null);
        } else if (showQuickAdd) {
          setShowQuickAdd(false);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showQuickAdd, selectedActivity]);

  const handleRatingChange = async (newRating) => {
    try {
      await setRatingForDate(dateStr, newRating);
    } catch (error) {
      console.error('Error updating rating:', error);
      alert('Failed to update rating. Please try again.');
    }
  };

  const handleTimelineClick = (timeStr) => {
    setQuickAddTime(timeStr);
    setActivityTitle('');
    setShowQuickAdd(true);
  };

  const handleActivityClick = (activity) => {
    setSelectedActivity(activity);
  };

  const handleDeleteActivity = async () => {
    if (selectedActivity && window.confirm('Delete this activity?')) {
      try {
        await deleteActivity(dateStr, selectedActivity.id);
        setSelectedActivity(null);
      } catch (error) {
        console.error('Error deleting activity:', error);
        alert('Failed to delete activity. Please try again.');
      }
    }
  };

  const handleActivityResize = async (activity, newEndTime) => {
    try {
      await updateActivity(dateStr, activity.id, { endTime: newEndTime });
    } catch (error) {
      console.error('Error resizing activity:', error);
      alert('Failed to resize activity. Please try again.');
    }
  };

  const handleQuickAdd = async (categoryId) => {
    if (!quickAddTime || !categoryId) return;

    // Calculate end time (1 hour after start)
    const [hours, minutes] = quickAddTime.split(':').map(Number);
    let endHours = hours + 1;
    let endMinutes = minutes;

    // If end time would exceed midnight, cap at 23:59
    if (endHours >= 24) {
      endHours = 23;
      endMinutes = 59;
    }

    const endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;

    const category = getCategoryById(categoryId);
    const title = activityTitle.trim() || category?.name || 'Activity';

    try {
      await addActivity(dateStr, {
        startTime: quickAddTime,
        endTime,
        categoryId,
        title,
        description: '',
      });

      setShowQuickAdd(false);
      setQuickAddTime(null);
      setActivityTitle('');
    } catch (error) {
      console.error('Error adding activity:', error);
      alert('Failed to add activity. Please try again.');
    }
  };

  // Calculate total hours logged - normalize field names from API
  const totalMinutes = activities.reduce((sum, activity) => {
    const startTime = activity.start_time || activity.startTime;
    const endTime = activity.end_time || activity.endTime;
    return sum + calculateDuration(startTime, endTime);
  }, 0);

  // Normalize activities data (convert snake_case to camelCase for timeline component)
  const normalizedActivities = activities.map(activity => ({
    ...activity,
    startTime: activity.start_time || activity.startTime,
    endTime: activity.end_time || activity.endTime,
    categoryId: activity.category_id || activity.categoryId,
  }));

  const isLoading = activitiesLoading || ratingLoading || categoriesLoading;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {format(date, 'EEEE, MMMM d, yyyy')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Total logged: {formatDuration(totalMinutes)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading...</span>
            </div>
          )}

          {/* Error State */}
          {activitiesError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
              Failed to load activities. Please try again.
            </div>
          )}

          {/* Content - only show when not loading */}
          {!isLoading && (
            <>
              {/* Day Rating */}
              <DayRatingSelector
                selectedRating={rating}
                onChange={handleRatingChange}
                disabled={isSetting}
              />

              {/* Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Timeline</h3>
                <Timeline24Hour
                  activities={normalizedActivities}
                  categories={categories}
                  onActivityClick={handleActivityClick}
                  onTimelineClick={handleTimelineClick}
                  onActivityResize={handleActivityResize}
                />
              </div>
            </>
          )}
        </div>

        {/* Quick Add Modal - Fixed Position Overlay */}
        {showQuickAdd && (
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Add activity at {quickAddTime}
              </h3>

              {/* Activity Title Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Activity Name
                </label>
                <input
                  type="text"
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setShowQuickAdd(false);
                    }
                  }}
                  placeholder="e.g., Museum, Read Norwegian Wood..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Optional - leave blank to use category name
                </p>
              </div>

              {/* Category Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleQuickAdd(category.id)}
                      disabled={isAdding}
                      className="px-4 py-3 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: category.color }}
                    >
                      {isAdding ? 'Adding...' : category.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowQuickAdd(false)}
                className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Activity Detail Modal */}
        {selectedActivity && (() => {
          // Normalize field names for selected activity
          const startTime = selectedActivity.start_time || selectedActivity.startTime;
          const endTime = selectedActivity.end_time || selectedActivity.endTime;
          const categoryId = selectedActivity.category_id || selectedActivity.categoryId;

          return (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Activity Details
                </h3>

                {/* Activity Title */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <div className="text-gray-900 dark:text-gray-100 font-medium">
                    {selectedActivity.title || getCategoryById(categoryId)?.name || 'Untitled'}
                  </div>
                </div>

                {/* Category */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <div
                    className="inline-flex items-center px-4 py-2 rounded-lg text-white text-sm font-medium"
                    style={{ backgroundColor: getCategoryById(categoryId)?.color || '#6b7280' }}
                  >
                    {getCategoryById(categoryId)?.name || 'Unknown'}
                  </div>
                </div>

                {/* Time */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Time
                  </label>
                  <div className="text-gray-900 dark:text-gray-100">
                    {startTime} - {endTime}
                    <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                      ({formatDuration(calculateDuration(startTime, endTime))})
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteActivity}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Activity'}
                  </button>
                  <button
                    onClick={() => setSelectedActivity(null)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default DayView;
