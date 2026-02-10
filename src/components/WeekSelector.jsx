/**
 * Week selector dropdown component
 */
export default function WeekSelector({ weeks, selectedWeek, onWeekChange }) {
  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="week-select"
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Select Week:
      </label>
      <select
        id="week-select"
        value={selectedWeek}
        onChange={(e) => onWeekChange(e.target.value)}
        className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
      >
        {weeks.map((week) => (
          <option key={week.label} value={week.label}>
            {week.label}
          </option>
        ))}
      </select>
    </div>
  );
}
