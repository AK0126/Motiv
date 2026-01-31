import { useState, useEffect, useRef } from 'react';
import { getHourLabels, calculateDuration } from '../utils/timeHelpers';

const Timeline24Hour = ({ activities = [], categories = [], onActivityClick, onTimelineClick, onActivityResize }) => {
  const hourLabels = getHourLabels();
  const [resizingActivity, setResizingActivity] = useState(null);
  const [resizeStartY, setResizeStartY] = useState(null);
  const [tempEndTime, setTempEndTime] = useState(null);
  const justResizedRef = useRef(false);
  const tempEndTimeRef = useRef(null);
  const resizingActivityRef = useRef(null);

  const handleTimelineClick = (e) => {
    // Don't trigger if we just finished resizing
    if (justResizedRef.current) {
      justResizedRef.current = false;
      return;
    }

    // Don't trigger if clicking on an activity or resize handle
    if (e.target.closest('.activity-block') || e.target.closest('.resize-handle')) {
      return;
    }

    if (!onTimelineClick) return;

    const timelineElement = e.currentTarget;
    const rect = timelineElement.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const totalHeight = rect.height;
    const clickPercentage = y / totalHeight;
    const minutesSinceMidnight = Math.floor(clickPercentage * 24 * 60);

    // Snap to 15-minute intervals
    const snappedMinutes = Math.round(minutesSinceMidnight / 15) * 15;
    const hours = Math.floor(snappedMinutes / 60);
    const minutes = snappedMinutes % 60;
    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    onTimelineClick(timeStr);
  };

  const handleResizeStart = (e, activity) => {
    e.stopPropagation();
    setResizingActivity(activity);
    resizingActivityRef.current = activity;
    setResizeStartY(e.clientY);
    setTempEndTime(activity.endTime);
    tempEndTimeRef.current = activity.endTime;

    // Prevent text selection during drag
    e.preventDefault();
  };

  const handleResizeMove = (e) => {
    if (!resizingActivityRef.current) return;

    const timelineElement = document.querySelector('.timeline-container');
    if (!timelineElement) return;

    const rect = timelineElement.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const totalHeight = rect.height;
    const percentage = Math.max(0, Math.min(1, y / totalHeight));
    const minutesSinceMidnight = Math.floor(percentage * 24 * 60);

    // Snap to 15-minute intervals
    const snappedMinutes = Math.round(minutesSinceMidnight / 15) * 15;

    // Calculate start time in minutes
    const startParts = resizingActivityRef.current.startTime.split(':');
    const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);

    // Ensure end time is after start time (minimum 15 minutes)
    // Allow up to 1440 minutes (00:00 next day / midnight)
    const finalMinutes = Math.max(startMinutes + 15, Math.min(snappedMinutes, 24 * 60));

    let hours = Math.floor(finalMinutes / 60);
    const minutes = finalMinutes % 60;

    // Convert 24:00 to 00:00 (midnight)
    if (hours === 24) {
      hours = 0;
    }

    const newEndTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    // Update both state (for visual) and ref (for reading in handleResizeEnd)
    setTempEndTime(newEndTime);
    tempEndTimeRef.current = newEndTime;
  };

  const handleResizeEnd = () => {
    // Use refs to get the latest values
    const activity = resizingActivityRef.current;
    const newEndTime = tempEndTimeRef.current;

    if (!activity || !newEndTime) {
      setResizingActivity(null);
      resizingActivityRef.current = null;
      setResizeStartY(null);
      setTempEndTime(null);
      tempEndTimeRef.current = null;
      return;
    }

    // Only call resize if the end time actually changed
    if (newEndTime !== activity.endTime && onActivityResize) {
      onActivityResize(activity, newEndTime);
    }

    // Set flag to prevent timeline click from firing
    justResizedRef.current = true;

    // Clear state and refs
    setResizingActivity(null);
    resizingActivityRef.current = null;
    setResizeStartY(null);
    setTempEndTime(null);
    tempEndTimeRef.current = null;

    // Clear the flag after a short delay to allow normal clicks again
    setTimeout(() => {
      justResizedRef.current = false;
    }, 100);
  };

  // Add mouse move and mouse up listeners when resizing
  useEffect(() => {
    if (resizingActivity) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);

      // Cleanup function
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resizingActivity]);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="flex">
        {/* Time labels column */}
        <div className="flex-shrink-0 w-16 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          {hourLabels.map((hour) => (
            <div
              key={hour}
              className="h-16 flex items-start justify-end pr-2 pt-1 text-xs text-gray-500 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-gray-800"
            >
              {hour}
            </div>
          ))}
        </div>

        {/* Timeline slots - clickable area */}
        <div
          className="flex-1 relative cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors timeline-container"
          onClick={handleTimelineClick}
        >
          {/* Hour dividers */}
          {hourLabels.map((hour) => (
            <div
              key={hour}
              className="h-16 border-b border-gray-200 dark:border-gray-700"
            >
              {/* Quarter-hour markers */}
              <div className="h-4 border-b border-gray-100 dark:border-gray-800"></div>
              <div className="h-4 border-b border-gray-100 dark:border-gray-800"></div>
              <div className="h-4 border-b border-gray-100 dark:border-gray-800"></div>
              <div className="h-4"></div>
            </div>
          ))}

          {/* Activity blocks */}
          <div className="absolute inset-0 pointer-events-none">
            {activities.map((activity) => {
              const category = categories.find(cat => cat.id === activity.categoryId);
              const startMinutes = parseInt(activity.startTime.split(':')[0]) * 60 + parseInt(activity.startTime.split(':')[1]);

              // Use temp end time if this activity is being resized
              const isResizing = resizingActivity?.id === activity.id;
              const endTimeToUse = isResizing ? tempEndTime : activity.endTime;
              const topPercent = (startMinutes / (24 * 60)) * 100;
              const heightPercent = (calculateDuration(activity.startTime, endTimeToUse) / (24 * 60)) * 100;

              return (
                <div
                  key={activity.id}
                  className="pointer-events-auto activity-block"
                  style={{
                    position: 'absolute',
                    left: '0',
                    right: '0',
                    top: `${topPercent}%`,
                    height: `${heightPercent}%`,
                  }}
                >
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onActivityClick && onActivityClick(activity);
                    }}
                    className={`h-full mx-2 rounded-lg px-3 py-2 cursor-pointer hover:opacity-90 transition-opacity shadow-sm border overflow-hidden ${
                      isResizing ? 'border-blue-400 border-2' : 'border-white/20'
                    }`}
                    style={{
                      backgroundColor: category?.color || '#6b7280',
                    }}
                  >
                    <div className="text-white text-sm font-medium truncate">
                      {activity.title || category?.name || 'Untitled'}
                    </div>
                    <div className="text-white/90 text-xs">
                      {activity.startTime} - {endTimeToUse}
                    </div>

                    {/* Resize handle at bottom */}
                    <div
                      className="resize-handle absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-white/20 transition-colors"
                      onMouseDown={(e) => handleResizeStart(e, activity)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white/40 rounded-full"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline24Hour;
