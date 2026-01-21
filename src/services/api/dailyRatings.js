import { supabase } from '../../lib/supabase';
import { getISODateString } from '../../utils/dateHelpers';

/**
 * Daily Ratings API Service
 * Handles all CRUD operations for daily ratings in Supabase
 */

export const dailyRatingsApi = {
  /**
   * Get rating for a specific date
   * @param {Date|string} date - The date to fetch rating for
   * @returns {Promise<Object|null>} Rating object or null if not found
   */
  async getByDate(date) {
    try {
      const dateStr = typeof date === 'string' ? date : getISODateString(date);

      const { data, error } = await supabase
        .from('daily_ratings')
        .select('*')
        .eq('date', dateStr)
        .maybeSingle(); // Returns null if not found instead of error

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching rating by date:', error);
      throw error;
    }
  },

  /**
   * Get all ratings within a date range
   * @param {Date|string} startDate - Start date of range
   * @param {Date|string} endDate - End date of range
   * @returns {Promise<Array>} Array of rating objects
   */
  async getByDateRange(startDate, endDate) {
    try {
      const startStr = typeof startDate === 'string' ? startDate : getISODateString(startDate);
      const endStr = typeof endDate === 'string' ? endDate : getISODateString(endDate);

      const { data, error } = await supabase
        .from('daily_ratings')
        .select('*')
        .gte('date', startStr)
        .lte('date', endStr)
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching ratings by date range:', error);
      throw error;
    }
  },

  /**
   * Set or update rating for a specific date (upsert)
   * @param {Date|string} date - The date to set rating for
   * @param {string} rating - Rating value ('great', 'ok', 'tough')
   * @returns {Promise<Object>} Created/updated rating object
   */
  async setForDate(date, rating) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const dateStr = typeof date === 'string' ? date : getISODateString(date);

      // Validate rating value
      if (!['great', 'ok', 'tough'].includes(rating)) {
        throw new Error('Invalid rating value. Must be "great", "ok", or "tough"');
      }

      // Use upsert to insert or update
      const { data, error } = await supabase
        .from('daily_ratings')
        .upsert(
          {
            user_id: user.id,
            date: dateStr,
            rating,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,date', // Unique constraint columns
          }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error setting rating for date:', error);
      throw error;
    }
  },

  /**
   * Delete rating for a specific date
   * @param {Date|string} date - The date to delete rating for
   * @returns {Promise<void>}
   */
  async deleteForDate(date) {
    try {
      const dateStr = typeof date === 'string' ? date : getISODateString(date);

      const { error } = await supabase
        .from('daily_ratings')
        .delete()
        .eq('date', dateStr);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting rating for date:', error);
      throw error;
    }
  },

  /**
   * Get count of each rating type within a date range
   * @param {Date|string} startDate - Start date of range
   * @param {Date|string} endDate - End date of range
   * @returns {Promise<Object>} Object with counts { great: number, ok: number, tough: number }
   */
  async getRatingCounts(startDate, endDate) {
    try {
      const startStr = typeof startDate === 'string' ? startDate : getISODateString(startDate);
      const endStr = typeof endDate === 'string' ? endDate : getISODateString(endDate);

      const { data, error } = await supabase
        .from('daily_ratings')
        .select('rating')
        .gte('date', startStr)
        .lte('date', endStr);

      if (error) throw error;

      // Count occurrences of each rating
      const counts = {
        great: 0,
        ok: 0,
        tough: 0,
      };

      (data || []).forEach((item) => {
        if (item.rating in counts) {
          counts[item.rating]++;
        }
      });

      return counts;
    } catch (error) {
      console.error('Error getting rating counts:', error);
      throw error;
    }
  },

  /**
   * Get all ratings for the current user
   * @returns {Promise<Array>} Array of all rating objects
   */
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('daily_ratings')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all ratings:', error);
      throw error;
    }
  },
};
