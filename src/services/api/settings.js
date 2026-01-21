import { supabase } from '../../lib/supabase';

/**
 * User Settings API Service
 * Handles all operations for user settings in Supabase
 */

export const settingsApi = {
  /**
   * Get current user's settings
   * @returns {Promise<Object>} Settings object
   */
  async get() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // Returns null if not found

      if (error) throw error;

      // If no settings exist, return default settings
      if (!data) {
        return {
          theme: 'light',
          last_viewed_date: new Date().toISOString().split('T')[0],
        };
      }

      return data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  },

  /**
   * Update user settings (upsert)
   * @param {Object} updates - Fields to update
   * @param {string} updates.theme - Theme value ('light' or 'dark')
   * @param {string} updates.lastViewedDate - Last viewed date (YYYY-MM-DD)
   * @returns {Promise<Object>} Updated settings object
   */
  async update(updates) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Convert camelCase to snake_case for database
      const dbUpdates = {};
      if (updates.theme !== undefined) dbUpdates.theme = updates.theme;
      if (updates.lastViewedDate !== undefined) {
        dbUpdates.last_viewed_date = updates.lastViewedDate;
      }

      // Use upsert to insert or update
      const { data, error } = await supabase
        .from('user_settings')
        .upsert(
          {
            user_id: user.id,
            ...dbUpdates,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id', // Unique constraint column
          }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  },

  /**
   * Initialize default settings for a new user
   * This is typically called by a database trigger, but can be called manually if needed
   * @returns {Promise<Object>} Created settings object
   */
  async initialize() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('user_settings')
        .insert({
          user_id: user.id,
          theme: 'light',
          last_viewed_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error initializing settings:', error);
      throw error;
    }
  },
};
