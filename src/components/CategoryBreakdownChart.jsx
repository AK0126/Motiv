import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatDuration } from '../utils/timeHelpers';

const CategoryBreakdownChart = ({ categoryTotals, categories }) => {
  const data = Object.entries(categoryTotals)
    .map(([categoryId, minutes]) => {
      const category = categories.find(cat => cat.id === categoryId);
      return {
        name: category?.name || 'Unknown',
        value: minutes,
        color: category?.color || '#6b7280',
      };
    })
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const totalMinutes = data.reduce((sum, item) => sum + item.value, 0);

  if (totalMinutes === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No activities logged in this period
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatDuration(value)}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-2">
        {data.map((item, index) => {
          const percentage = ((item.value / totalMinutes) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-gray-900 dark:text-gray-100">{item.name}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {formatDuration(item.value)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{percentage}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBreakdownChart;
