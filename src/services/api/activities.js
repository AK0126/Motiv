import { supabase } from '../../lib/supabase';
import { getISODateString } from '../../utils/dateHelpers';

/**
 * Activities API Service
 * Handles all CRUD operations for activities in Supabase
 */

export const activitiesApi = {
  /**
   * Get all activities for a specific date
   * @param {Date|string} date - The date to fetch activities for
   * @returns {Promise<Array>} Array of activity objects
   */
  async getByDate(date) {
    try {
      const dateStr = typeof date === 'string' ? date : getISODateString(date);

      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('date', dateStr)
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching activities by date:', error);
      throw error;
    }
  },

  /**
   * Get all activities within a date range
   * @param {Date|string} startDate - Start date of range
   * @param {Date|string} endDate - End date of range
   * @returns {Promise<Array>} Array of activity objects
   */
  async getByDateRange(startDate, endDate) {
    try {
      const startStr = typeof startDate === 'string' ? startDate : getISODateString(startDate);
      const endStr = typeof endDate === 'string' ? endDate : getISODateString(endDate);

      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .gte('date', startStr)
        .lte('date', endStr)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching activities by date range:', error);
      throw error;
    }
  },

  /**
   * Create a new activity
   * @param {Object} activityData - Activity data
   * @param {string} activityData.date - ISO date string (YYYY-MM-DD)
   * @param {string} activityData.startTime - Start time (HH:MM)
   * @param {string} activityData.endTime - End time (HH:MM)
   * @param {string} activityData.categoryId - Category ID
   * @param {string} activityData.title - Activity title
   * @param {string} activityData.description - Activity description (optional)
   * @returns {Promise<Object>} Created activity object
   */
  async create(activityData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('activities')
        .insert({
          user_id: user.id,
          date: activityData.date,
          start_time: activityData.startTime,
          end_time: activityData.endTime,
          category_id: activityData.categoryId,
          title: activityData.title,
          description: activityData.description || '',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  },

  /**
   * Update an existing activity
   * @param {string} id - Activity ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated activity object
   */
  async update(id, updates) {
    try {
      // Convert camelCase to snake_case for database
      const dbUpdates = {};
      if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
      if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime;
      if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.date !== undefined) dbUpdates.date = updates.date;

      const { data, error } = await supabase
        .from('activities')
        .update({
          ...dbUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating activity:', error);
      throw error;
    }
  },

  /**
   * Delete an activity
   * @param {string} id - Activity ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  },

  /**
   * Get all activities for the current user (useful for analytics)
   * @returns {Promise<Array>} Array of all activity objects
   */
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('date', { ascending: false })
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all activities:', error);
      throw error;
    }
  },
};
