import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../../services/api/categories';

/**
 * Custom hook for managing categories with React Query and Supabase
 * Provides same interface as the old localStorage-based hook with added loading/error states
 * @returns {object} - Categories data, loading state, error, and CRUD operations
 */
export function useCategories() {
  const queryClient = useQueryClient();

  // Fetch all categories
  const {
    data: categories = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // Create category mutation
  const addCategoryMutation = useMutation({
    mutationFn: ({ name, color, isDefault }) =>
      categoriesApi.create(name, color, isDefault),
    onSuccess: () => {
      // Invalidate and refetch categories
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, updates }) => categoriesApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: (id) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  // Wrapper functions to maintain same API as old hook
  const addCategory = async (name, color, isDefault = false) => {
    return addCategoryMutation.mutateAsync({ name, color, isDefault });
  };

  const updateCategory = async (id, updates) => {
    return updateCategoryMutation.mutateAsync({ id, updates });
  };

  const deleteCategory = async (id) => {
    return deleteCategoryMutation.mutateAsync(id);
  };

  const getCategoryById = (id) => {
    return categories.find((cat) => cat.id === id);
  };

  return {
    categories,
    isLoading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    // Expose mutation states for advanced use cases
    isAdding: addCategoryMutation.isPending,
    isUpdating: updateCategoryMutation.isPending,
    isDeleting: deleteCategoryMutation.isPending,
  };
}
