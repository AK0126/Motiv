import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatDuration } from '../utils/timeHelpers';

const CustomTooltip = ({ active, payload, categories }) => {
  if (!active || !payload || !payload.length) return null;

  const weekData = payload[0].payload;
  const weekLabel = weekData.week;

  // Calculate total for this week
  let totalMinutes = 0;
  const categoryBreakdown = [];

  payload.forEach((entry) => {
    if (entry.dataKey !== 'week' && entry.dataKey !== 'weekNumber' && entry.value > 0) {
      const category = categories.find((cat) => cat.id === entry.dataKey);
      if (category) {
        totalMinutes += entry.value;
        categoryBreakdown.push({
          name: category.name,
          color: entry.fill,
          value: entry.value,
        });
      }
    }
  });

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
      <div className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{weekLabel}</div>
      {categoryBreakdown.length > 0 ? (
        <>
          {categoryBreakdown.map((item, index) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatDuration(item.value)}
              </span>
            </div>
          ))}
          <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
            <div className="flex justify-between">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Total</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {formatDuration(totalMinutes)}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="text-sm text-gray-500 dark:text-gray-400">No activities logged</div>
      )}
    </div>
  );
};

const WeeklyTrendsChart = ({ chartData, categories, selectedWeek, onWeekSelect }) => {
  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No activities logged in the last 4 weeks
      </div>
    );
  }

  // Check if there's any data across all weeks
  const hasData = chartData.some((week) => {
    return Object.keys(week).some(
      (key) => key !== 'week' && key !== 'weekNumber' && week[key] > 0
    );
  });

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No activities logged in the last 4 weeks
      </div>
    );
  }

  // Format Y-axis ticks
  const formatYAxis = (value) => {
    if (value === 0) return '0';
    const hours = Math.floor(value / 60);
    if (hours > 0) {
      return `${hours}h`;
    }
    return `${value}m`;
  };

  // Handle bar click
  const handleBarClick = (data) => {
    if (data && data.week) {
      onWeekSelect(data.week);
    }
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis
          dataKey="week"
          angle={-45}
          textAnchor="end"
          height={100}
          className="text-xs fill-gray-600 dark:fill-gray-400"
        />
        <YAxis
          tickFormatter={formatYAxis}
          className="text-xs fill-gray-600 dark:fill-gray-400"
        />
        <Tooltip content={<CustomTooltip categories={categories} />} />
        <Legend
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="rect"
          formatter={(value) => {
            const category = categories.find((cat) => cat.id === value);
            return category?.name || value;
          }}
        />
        {categories.map((category) => (
          <Bar
            key={category.id}
            dataKey={category.id}
            stackId="a"
            fill={category.color}
            onClick={handleBarClick}
            opacity={(entry) => (entry.week === selectedWeek ? 1.0 : 0.5)}
            style={{ cursor: 'pointer' }}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default WeeklyTrendsChart;
