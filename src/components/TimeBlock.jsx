import { timeToGridRow, durationToGridSpan, formatDuration, calculateDuration } from '../utils/timeHelpers';

const TimeBlock = ({ activity, category, onClick }) => {
  const gridRowStart = timeToGridRow(activity.startTime);
  const gridRowSpan = durationToGridSpan(activity.startTime, activity.endTime);
  const duration = calculateDuration(activity.startTime, activity.endTime);

  return (
    <div
      onClick={() => onClick && onClick(activity)}
      className="absolute left-16 right-2 rounded-lg px-3 py-2 cursor-pointer hover:opacity-90 transition-opacity shadow-sm border border-white/20"
      style={{
        backgroundColor: category?.color || '#6b7280',
        gridRowStart,
        gridRowEnd: `span ${gridRowSpan}`,
        minHeight: '40px',
      }}
    >
      <div className="text-white text-sm font-medium truncate">
        {activity.title || category?.name || 'Untitled'}
      </div>
      <div className="text-white/90 text-xs">
        {activity.startTime} - {activity.endTime} ({formatDuration(duration)})
      </div>
    </div>
  );
};

export default TimeBlock;
