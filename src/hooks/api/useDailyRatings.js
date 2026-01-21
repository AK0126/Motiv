import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dailyRatingsApi } from '../../services/api/dailyRatings';
import { getISODateString } from '../../utils/dateHelpers';

/**
 * Custom hook for managing daily ratings with React Query and Supabase
 * Provides same interface as the old localStorage-based hook with added loading/error states
 * @returns {object} - Ratings data, loading state, error, and CRUD operations
 */
export function useDailyRatings() {
  const queryClient = useQueryClient();

  // Set/update rating mutation (upsert)
  const setRatingMutation = useMutation({
    mutationFn: ({ date, rating }) => dailyRatingsApi.setForDate(date, rating),
    onSuccess: (data) => {
      // Invalidate ratings queries
      queryClient.invalidateQueries({ queryKey: ['ratings', data.date] });
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
    },
  });

  // Delete rating mutation
  const deleteRatingMutation = useMutation({
    mutationFn: (date) => dailyRatingsApi.deleteForDate(date),
    onSuccess: (_, date) => {
      const dateStr = typeof date === 'string' ? date : getISODateString(date);
      queryClient.invalidateQueries({ queryKey: ['ratings', dateStr] });
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
    },
  });

  /**
   * Get rating for a specific date
   * Returns a query object with data, isLoading, error
   * @param {Date|string} date - The date to fetch rating for
   * @returns {object} Query object with rating data
   */
  const useRatingByDate = (date) => {
    const dateStr = typeof date === 'string' ? date : getISODateString(date);

    return useQuery({
      queryKey: ['ratings', dateStr],
      queryFn: () => dailyRatingsApi.getByDate(dateStr),
      staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    });
  };

  /**
   * Get ratings for a date range
   * @param {Date|string} startDate - Start date
   * @param {Date|string} endDate - End date
   * @returns {object} Query object with ratings data
   */
  const useRatingsByDateRange = (startDate, endDate) => {
    const startStr = typeof startDate === 'string' ? startDate : getISODateString(startDate);
    const endStr = typeof endDate === 'string' ? endDate : getISODateString(endDate);

    return useQuery({
      queryKey: ['ratings', 'range', startStr, endStr],
      queryFn: () => dailyRatingsApi.getByDateRange(startStr, endStr),
      staleTime: 5 * 60 * 1000,
    });
  };

  /**
   * Get count of each rating type within a date range
   * @param {Date|string} startDate - Start date
   * @param {Date|string} endDate - End date
   * @returns {object} Query object with rating counts
   */
  const useRatingCounts = (startDate, endDate) => {
    const startStr = typeof startDate === 'string' ? startDate : getISODateString(startDate);
    const endStr = typeof endDate === 'string' ? endDate : getISODateString(endDate);

    return useQuery({
      queryKey: ['ratings', 'counts', startStr, endStr],
      queryFn: () => dailyRatingsApi.getRatingCounts(startStr, endStr),
      staleTime: 5 * 60 * 1000,
    });
  };

  /**
   * Set or update rating for a date
   * @param {Date|string} date - The date to set rating for
   * @param {string} rating - Rating value ('great', 'ok', 'tough')
   * @returns {Promise<object>} Created/updated rating
   */
  const setRatingForDate = async (date, rating) => {
    const dateStr = typeof date === 'string' ? date : getISODateString(date);
    return setRatingMutation.mutateAsync({ date: dateStr, rating });
  };

  /**
   * Delete rating for a date
   * @param {Date|string} date - The date to delete rating for
   * @returns {Promise<void>}
   */
  const deleteRatingForDate = async (date) => {
    const dateStr = typeof date === 'string' ? date : getISODateString(date);
    return deleteRatingMutation.mutateAsync(dateStr);
  };

  /**
   * Helper function to get rating by date synchronously from cache
   * Useful for components that already have the data loaded
   * @param {Date|string} date - The date to get rating for
   * @returns {string|null} Rating value or null if not in cache
   */
  const getRatingByDate = (date) => {
    const dateStr = typeof date === 'string' ? date : getISODateString(date);
    const cachedData = queryClient.getQueryData(['ratings', dateStr]);
    return cachedData?.rating || null;
  };

  /**
   * Helper function to get rating counts synchronously from cache
   * @param {Date|string} startDate - Start date
   * @param {Date|string} endDate - End date
   * @returns {object|null} Rating counts or null if not in cache
   */
  const getRatingCounts = (startDate, endDate) => {
    const startStr = typeof startDate === 'string' ? startDate : getISODateString(startDate);
    const endStr = typeof endDate === 'string' ? endDate : getISODateString(endDate);
    return queryClient.getQueryData(['ratings', 'counts', startStr, endStr]) || {
      great: 0,
      ok: 0,
      tough: 0,
    };
  };

  return {
    // Query hooks for components to use
    useRatingByDate,
    useRatingsByDateRange,
    useRatingCounts,

    // CRUD operations (mutations)
    setRatingForDate,
    deleteRatingForDate,

    // Helper functions for cached data
    getRatingByDate,
    getRatingCounts,

    // Mutation states
    isSetting: setRatingMutation.isPending,
    isDeleting: deleteRatingMutation.isPending,
  };
}
