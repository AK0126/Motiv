import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activitiesApi } from '../../services/api/activities';
import { getISODateString } from '../../utils/dateHelpers';
import { timeToMinutes } from '../../utils/timeHelpers';

/**
 * Custom hook for managing activities with React Query and Supabase
 * Provides same interface as the old localStorage-based hook with added loading/error states
 * @returns {object} - Activities data, loading state, error, and CRUD operations
 */
export function useActivities() {
  const queryClient = useQueryClient();

  // Create activity mutation
  const addActivityMutation = useMutation({
    mutationFn: (activityData) => activitiesApi.create(activityData),
    onSuccess: (data) => {
      // Invalidate activities queries for the specific date
      queryClient.invalidateQueries({ queryKey: ['activities', data.date] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  // Update activity mutation
  const updateActivityMutation = useMutation({
    mutationFn: ({ id, updates }) => activitiesApi.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activities', data.date] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  // Delete activity mutation
  const deleteActivityMutation = useMutation({
    mutationFn: (id) => activitiesApi.delete(id),
    onSuccess: (_, id) => {
      // Invalidate all activities queries since we don't know the date
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  /**
   * Get activities for a specific date
   * Returns a query object with data, isLoading, error
   * @param {Date|string} date - The date to fetch activities for
   * @returns {object} Query object with activities data
   */
  const useActivitiesByDate = (date) => {
    const dateStr = typeof date === 'string' ? date : getISODateString(date);

    return useQuery({
      queryKey: ['activities', dateStr],
      queryFn: () => activitiesApi.getByDate(dateStr),
      staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
    });
  };

  /**
   * Get activities for a date range
   * @param {Date|string} startDate - Start date
   * @param {Date|string} endDate - End date
   * @returns {object} Query object with activities data
   */
  const useActivitiesByDateRange = (startDate, endDate) => {
    const startStr = typeof startDate === 'string' ? startDate : getISODateString(startDate);
    const endStr = typeof endDate === 'string' ? endDate : getISODateString(endDate);

    return useQuery({
      queryKey: ['activities', 'range', startStr, endStr],
      queryFn: () => activitiesApi.getByDateRange(startStr, endStr),
      staleTime: 2 * 60 * 1000,
    });
  };

  /**
   * Add a new activity
   * @param {string} date - Date string (YYYY-MM-DD)
   * @param {object} activityData - Activity data (startTime, endTime, categoryId, title, description)
   * @returns {Promise<object>} Created activity
   */
  const addActivity = async (date, activityData) => {
    const dateStr = typeof date === 'string' ? date : getISODateString(date);

    return addActivityMutation.mutateAsync({
      date: dateStr,
      ...activityData,
    });
  };

  /**
   * Update an existing activity
   * @param {string} date - Date string (YYYY-MM-DD) - kept for API compatibility
   * @param {string} activityId - Activity ID
   * @param {object} updates - Fields to update
   * @returns {Promise<object>} Updated activity
   */
  const updateActivity = async (date, activityId, updates) => {
    return updateActivityMutation.mutateAsync({ id: activityId, updates });
  };

  /**
   * Delete an activity
   * @param {string} date - Date string (YYYY-MM-DD) - kept for API compatibility
   * @param {string} activityId - Activity ID
   * @returns {Promise<void>}
   */
  const deleteActivity = async (date, activityId) => {
    return deleteActivityMutation.mutateAsync(activityId);
  };

  /**
   * Check if a time range overlaps with existing activities on a date
   * This is a client-side validation helper
   * @param {string} date - Date string (YYYY-MM-DD)
   * @param {string} startTime - Start time (HH:MM)
   * @param {string} endTime - End time (HH:MM)
   * @param {string|null} excludeActivityId - Activity ID to exclude from check
   * @param {Array} existingActivities - Array of activities to check against
   * @returns {boolean} True if there's an overlap
   */
  const checkOverlap = (date, startTime, endTime, excludeActivityId = null, existingActivities = []) => {
    return existingActivities.some((activity) => {
      if (excludeActivityId && activity.id === excludeActivityId) {
        return false;
      }

      // Convert all times to minutes for proper comparison
      const newStart = timeToMinutes(startTime);
      const newEnd = timeToMinutes(endTime);
      const actStart = timeToMinutes(activity.start_time || activity.startTime);
      const actEnd = timeToMinutes(activity.end_time || activity.endTime);

      // Check if new activity spans midnight
      const newSpansMidnight = newEnd < newStart;
      // Check if existing activity spans midnight
      const actSpansMidnight = actEnd < actStart;

      // Case 1: Neither spans midnight - simple overlap check
      if (!newSpansMidnight && !actSpansMidnight) {
        return newStart < actEnd && newEnd > actStart;
      }

      // Case 2: New activity spans midnight
      if (newSpansMidnight && !actSpansMidnight) {
        // New activity covers: [newStart, 1440) and [0, newEnd)
        // Check if existing activity overlaps either segment
        return actStart >= newStart || actEnd <= newEnd;
      }

      // Case 3: Existing activity spans midnight
      if (!newSpansMidnight && actSpansMidnight) {
        // Existing activity covers: [actStart, 1440) and [0, actEnd)
        // Check if new activity overlaps either segment
        return newStart >= actStart || newEnd <= actEnd;
      }

      // Case 4: Both span midnight - they definitely overlap
      return true;
    });
  };

  /**
   * Helper function to get activities by date synchronously from cache
   * Useful for components that already have the data loaded
   * @param {Date|string} date - The date to get activities for
   * @returns {Array} Array of activities or empty array if not in cache
   */
  const getActivitiesByDate = (date) => {
    const dateStr = typeof date === 'string' ? date : getISODateString(date);
    const cachedData = queryClient.getQueryData(['activities', dateStr]);
    return cachedData || [];
  };

  return {
    // Query hooks for components to use
    useActivitiesByDate,
    useActivitiesByDateRange,

    // CRUD operations (mutations)
    addActivity,
    updateActivity,
    deleteActivity,

    // Helper functions
    checkOverlap,
    getActivitiesByDate,

    // Mutation states
    isAdding: addActivityMutation.isPending,
    isUpdating: updateActivityMutation.isPending,
    isDeleting: deleteActivityMutation.isPending,
  };
}
