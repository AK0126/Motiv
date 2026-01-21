import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { RATING_COLORS, RATING_LABELS } from '../constants/ratingColors';

const DayQualityChart = ({ counts }) => {
  const data = [
    { name: RATING_LABELS.great, value: counts.great, color: RATING_COLORS.great },
    { name: RATING_LABELS.ok, value: counts.ok, color: RATING_COLORS.ok },
    { name: RATING_LABELS.tough, value: counts.tough, color: RATING_COLORS.tough },
  ].filter(item => item.value > 0); // Only show ratings with data

  const total = counts.great + counts.ok + counts.tough;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No day ratings in this period
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
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: RATING_COLORS.great }}>
            {counts.great}
          </div>
          <div className="text-sm text-gray-600">Great Days</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: RATING_COLORS.ok }}>
            {counts.ok}
          </div>
          <div className="text-sm text-gray-600">OK Days</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: RATING_COLORS.tough }}>
            {counts.tough}
          </div>
          <div className="text-sm text-gray-600">Tough Days</div>
        </div>
      </div>
    </div>
  );
};

export default DayQualityChart;
