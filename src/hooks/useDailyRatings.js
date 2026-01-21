import { useLocalStorage } from './useLocalStorage';
import { format } from 'date-fns';

/**
 * Custom hook for managing daily ratings in localStorage
 * Ratings are stored as { "2026-01-15": "great", "2026-01-16": "ok", ... }
 * @returns {object} - Daily ratings state and CRUD operations
 */
export function useDailyRatings() {
  const [ratings, setRatings] = useLocalStorage('dailyRatings', {});

  const getRatingByDate = (date) => {
    const dateStr = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
    return ratings[dateStr] || null;
  };

  const setRatingForDate = (date, rating) => {
    const dateStr = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');

    setRatings({
      ...ratings,
      [dateStr]: rating,
    });
  };

  const deleteRatingForDate = (date) => {
    const dateStr = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
    const newRatings = { ...ratings };
    delete newRatings[dateStr];
    setRatings(newRatings);
  };

  const getRatingCounts = (startDate, endDate) => {
    const counts = { great: 0, ok: 0, tough: 0 };

    Object.entries(ratings).forEach(([date, rating]) => {
      if ((!startDate || date >= startDate) && (!endDate || date <= endDate)) {
        if (counts.hasOwnProperty(rating)) {
          counts[rating]++;
        }
      }
    });

    return counts;
  };

  return {
    ratings,
    getRatingByDate,
    setRatingForDate,
    deleteRatingForDate,
    getRatingCounts,
  };
}
