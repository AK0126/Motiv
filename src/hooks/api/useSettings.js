import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../../services/api/settings';

/**
 * Custom hook for managing user settings with React Query and Supabase
 * Provides same interface as the old localStorage-based hook with added loading/error states
 * @returns {object} - Settings data, loading state, error, and update operation
 */
export function useSettings() {
  const queryClient = useQueryClient();

  // Fetch settings
  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
    staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (updates) => settingsApi.update(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    // Optimistic update for better UX
    onMutate: async (updates) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['settings'] });

      // Snapshot the previous value
      const previousSettings = queryClient.getQueryData(['settings']);

      // Optimistically update to the new value
      queryClient.setQueryData(['settings'], (old) => ({
        ...old,
        ...updates,
      }));

      // Return a context object with the snapshotted value
      return { previousSettings };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, newSettings, context) => {
      queryClient.setQueryData(['settings'], context.previousSettings);
    },
  });

  /**
   * Update user settings
   * @param {Object} updates - Fields to update
   * @param {string} updates.theme - Theme value ('light' or 'dark')
   * @param {string} updates.lastViewedDate - Last viewed date (YYYY-MM-DD)
   * @returns {Promise<object>} Updated settings
   */
  const updateSettings = async (updates) => {
    return updateSettingsMutation.mutateAsync(updates);
  };

  return {
    settings: settings || {
      theme: 'light',
      last_viewed_date: new Date().toISOString().split('T')[0],
    },
    isLoading,
    error,
    updateSettings,
    isUpdating: updateSettingsMutation.isPending,
  };
}
