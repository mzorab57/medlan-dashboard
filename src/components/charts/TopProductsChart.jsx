import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function TopProductsChart({ data }) {
  const chartData = (data || []).map((d) => ({
    name: d.product_name || `#${d.product_id}`,
    total: Number(d.total_sold || 0),
  }));
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="mb-2 text-sm text-gray-600">Top Products</div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
