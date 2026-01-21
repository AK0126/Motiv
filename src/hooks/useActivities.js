import { useLocalStorage } from './useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { timeToMinutes } from '../utils/timeHelpers';

/**
 * Custom hook for managing activities in localStorage
 * Activities are stored grouped by date for efficient querying
 * @returns {object} - Activities state and CRUD operations
 */
export function useActivities() {
  const [activities, setActivities] = useLocalStorage('activities', {});

  const getActivitiesByDate = (date) => {
    const dateStr = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
    return activities[dateStr] || [];
  };

  const addActivity = (date, activityData) => {
    const dateStr = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
    const newActivity = {
      id: uuidv4(),
      date: dateStr,
      ...activityData,
    };

    setActivities({
      ...activities,
      [dateStr]: [...(activities[dateStr] || []), newActivity],
    });

    return newActivity;
  };

  const updateActivity = (date, activityId, updates) => {
    const dateStr = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
    const dateActivities = activities[dateStr] || [];

    setActivities({
      ...activities,
      [dateStr]: dateActivities.map(act =>
        act.id === activityId ? { ...act, ...updates } : act
      ),
    });
  };

  const deleteActivity = (date, activityId) => {
    const dateStr = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
    const dateActivities = activities[dateStr] || [];

    setActivities({
      ...activities,
      [dateStr]: dateActivities.filter(act => act.id !== activityId),
    });
  };

  const checkOverlap = (date, startTime, endTime, excludeActivityId = null) => {
    const dateActivities = getActivitiesByDate(date);

    return dateActivities.some(activity => {
      if (excludeActivityId && activity.id === excludeActivityId) {
        return false;
      }

      // Convert all times to minutes for proper comparison
      const newStart = timeToMinutes(startTime);
      const newEnd = timeToMinutes(endTime);
      const actStart = timeToMinutes(activity.startTime);
      const actEnd = timeToMinutes(activity.endTime);

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
        return (actStart >= newStart || actEnd <= newEnd);
      }

      // Case 3: Existing activity spans midnight
      if (!newSpansMidnight && actSpansMidnight) {
        // Existing activity covers: [actStart, 1440) and [0, actEnd)
        // Check if new activity overlaps either segment
        return (newStart >= actStart || newEnd <= actEnd);
      }

      // Case 4: Both span midnight - they definitely overlap
      return true;
    });
  };

  return {
    activities,
    getActivitiesByDate,
    addActivity,
    updateActivity,
    deleteActivity,
    checkOverlap,
  };
}
