import { supabase } from '../../lib/supabase';

/**
 * Categories API Service
 * Handles all CRUD operations for categories in Supabase
 */

export const categoriesApi = {
  /**
   * Get all categories for the current user
   * @returns {Promise<Array>} Array of category objects
   */
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  /**
   * Create a new category
   * @param {string} name - Category name
   * @param {string} color - Category color (hex code)
   * @param {boolean} isDefault - Whether this is a default category
   * @returns {Promise<Object>} Created category object
   */
  async create(name, color, isDefault = false) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name,
          color,
          is_default: isDefault,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  /**
   * Update an existing category
   * @param {string} id - Category ID
   * @param {Object} updates - Fields to update (name, color, is_default)
   * @returns {Promise<Object>} Updated category object
   */
  async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  /**
   * Delete a category
   * @param {string} id - Category ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  /**
   * Get a single category by ID
   * @param {string} id - Category ID
   * @returns {Promise<Object>} Category object
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  },
};
