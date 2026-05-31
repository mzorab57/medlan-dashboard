import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
  pending: '#f59e0b',
  processing: '#3b82f6',
  completed: '#10b981',
  canceled: '#ef4444',
  other: '#9ca3af',
};

export default function OrdersStatusChart({ data }) {
  const chartData = (data || []).map((d) => ({
    name: d.status,
    value: Number(d.count || 0),
  })).filter((x) => x.value > 0);

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="mb-2 text-sm text-gray-600">Orders by Status</div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={90}
            >
              {chartData.map((entry, index) => {
                const color = COLORS[entry.name] || COLORS.other;
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
