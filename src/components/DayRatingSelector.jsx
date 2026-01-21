import { RATING_COLORS, RATING_LABELS, RATINGS } from '../constants/ratingColors';

const DayRatingSelector = ({ selectedRating, onChange }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">How was your day?</h3>
      <div className="flex gap-3">
        {RATINGS.map((rating) => {
          const isSelected = selectedRating === rating;
          return (
            <button
              key={rating}
              onClick={() => onChange(rating)}
              className={`
                flex-1 py-3 px-4 rounded-lg font-medium transition-all
                ${isSelected ? 'ring-2 ring-offset-2 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}
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
