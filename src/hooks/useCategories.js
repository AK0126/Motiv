import { useLocalStorage } from './useLocalStorage';
import { DEFAULT_CATEGORIES } from '../constants/defaultCategories';
import { v4 as uuidv4 } from 'uuid';

/**
 * Custom hook for managing categories in localStorage
 * @returns {object} - Categories state and CRUD operations
 */
export function useCategories() {
  const [categories, setCategories] = useLocalStorage('categories', DEFAULT_CATEGORIES);

  const addCategory = (name, color) => {
    const newCategory = {
      id: uuidv4(),
      name,
      color,
    };
    setCategories([...categories, newCategory]);
    return newCategory;
  };

  const updateCategory = (id, updates) => {
    setCategories(categories.map(cat =>
      cat.id === id ? { ...cat, ...updates } : cat
    ));
  };

  const deleteCategory = (id) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  const getCategoryById = (id) => {
    return categories.find(cat => cat.id === id);
  };

  return {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
  };
}
