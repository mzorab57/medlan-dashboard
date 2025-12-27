import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function RevenueChart({ data }) {
  const chartData = (data || []).map((d) => ({
    day: d.day,
    amount: Number(d.amount || 0),
  }));
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="mb-2 text-sm text-gray-600">Revenue</div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
