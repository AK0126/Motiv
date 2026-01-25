import { format } from 'date-fns';
import { isToday, isCurrentMonth, getISODateString } from '../utils/dateHelpers';
import { RATING_COLORS } from '../constants/ratingColors';

const CalendarDay = ({
  date,
  currentMonth,
  activities = [],
  rating = null,
  categories = [],
  onClick
}) => {
  const dateStr = format(date, 'd');
  const isCurrentMonthDay = isCurrentMonth(date, currentMonth);
  const isTodayDay = isToday(date);

  // Get unique category colors from activities
  const uniqueColors = [...new Set(
    activities
      .map(act => {
        const category = categories.find(cat => cat.id === act.categoryId);
        return category?.color;
      })
      .filter(Boolean)
  )].slice(0, 3); // Limit to 3 colors

  // Determine background color based on rating
  const getBgColor = () => {
    if (!rating) return '';
    return RATING_COLORS[rating];
  };

  const bgColor = getBgColor();

  const handleClick = () => {
    if (onClick) {
      onClick(date);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        relative aspect-square p-2 rounded-lg transition-all
        ${isCurrentMonthDay ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700' : 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600'}
        ${isTodayDay ? 'ring-2 ring-blue-500' : 'border border-gray-200 dark:border-gray-700'}
        hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer
      `}
      style={bgColor ? {
        backgroundColor: `${bgColor}15`,
        borderColor: bgColor,
        borderWidth: '2px'
      } : {}}
    >
      <div className="flex flex-col h-full">
        <span className={`text-sm font-medium ${
          isTodayDay
            ? 'text-blue-600 dark:text-blue-400 font-bold'
            : isCurrentMonthDay
              ? 'text-gray-900 dark:text-gray-100'
              : ''
        }`}>
          {dateStr}
        </span>

        {/* Activity dots */}
        {uniqueColors.length > 0 && (
          <div className="flex gap-1 mt-auto justify-center">
            {uniqueColors.map((color, index) => (
              <div
                key={index}
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}
      </div>
    </button>
  );
};

export default CalendarDay;
