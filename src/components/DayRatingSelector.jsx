import { RATING_COLORS, RATING_LABELS, RATINGS } from '../constants/ratingColors';

const DayRatingSelector = ({ selectedRating, onChange }) => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">How was your day?</h3>
      <div className="flex gap-3">
        {RATINGS.map((rating) => {
          const isSelected = selectedRating === rating;
          return (
            <button
              key={rating}
              onClick={() => onChange(rating)}
              className={`
                flex-1 py-3 px-4 rounded-lg font-medium transition-all
                ${isSelected ? 'ring-2 ring-offset-2 dark:ring-offset-gray-800 text-white' : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}
              `}
              style={isSelected ? {
                backgroundColor: RATING_COLORS[rating],
                ringColor: RATING_COLORS[rating],
              } : {}}
            >
              {RATING_LABELS[rating]}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DayRatingSelector;
