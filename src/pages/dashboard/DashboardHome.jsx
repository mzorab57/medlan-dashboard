import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
// import { Link } from 'react-router-dom';
import RevenueChart from '../../components/charts/RevenueChart';
import TopProductsChart from '../../components/charts/TopProductsChart';
import OrdersStatusChart from '../../components/charts/OrdersStatusChart';
import { useAuth } from '../../store/auth';

export default function DashboardHome() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [ordersRecent, setOrdersRecent] = useState([]);
  const [statusDist, setStatusDist] = useState([]);
  // const [profitTotal, setProfitTotal] = useState(null);
  const [usdRate, setUsdRate] = useState(() => {
    try {
      const v = localStorage.getItem('usd_rate');
      return v ? Number(v) : 1300;
    } catch {
      return 1300;
    }
  });
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [revRange, setRevRange] = useState('1d');
  const [expRange, setExpRange] = useState('1d');
  function setDefaultDateRange() {
    const t = new Date();
    const f = new Date();
    f.setDate(f.getDate() - 30);
    setFrom(f.toISOString().slice(0, 10));
    setTo(t.toISOString().slice(0, 10));
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.get('/api/dashboard/summary');
        if (mounted) {
          setSummary(data.summary || data);
        }
        const tp = await api.get('/api/dashboard/top-products');
        if (mounted) {
          setTopProducts(tp.data || tp);
        }
        const rv = await api.get(`/api/dashboard/revenue?from=${from}&to=${to}`);
        if (mounted) {
          setRevenue(rv.data || rv);
        }
        const ord = await api.get('/api/orders');
        if (mounted) {
          const list = ord.data || ord;
          setOrdersRecent(Array.isArray(list) ? list.slice(0, 10) : []);
          const counter = {};
          (list || []).forEach((o) => { counter[o.status] = (counter[o.status] || 0) + 1; });
          const dist = Object.entries(counter).map(([status, count]) => ({ status, count }));
          setStatusDist(dist);
        }
        // total-profit card removed; see net profit below
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [from, to, user]);

  if (loading) {
    return <div className="grid place-items-center h-64"><div className="h-8 w-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" /></div>;
  }
  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  const cards = [
    { label: 'Products', value: summary?.products },
    { label: 'Categories', value: summary?.categories },
    { label: 'Orders', value: summary?.orders },
    { label: 'Pending Orders', value: summary?.orders_pending },
    { label: 'Completed Orders', value: summary?.orders_completed },
    { label: 'Shipped Orders', value: summary?.orders_shipped },
    { label: 'Cancelled Orders', value: summary?.orders_cancelled },
    { label: 'Returned Orders', value: summary?.orders_returned },
    { label: 'Users', value: summary?.users },
    { label: 'Active Promotions', value: summary?.promotions_active },
    // revenue & aov cards removed; consolidated below
  ];

  function formatNumber(n) {
    const x = Number(n || 0);
    return x.toLocaleString();
  }
  function formatCurrency(n, currency = 'IQD') {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(Number(n || 0));
    } catch {
      return formatNumber(n);
    }
  }
  function isMoneyLabel(label) {
    const s = String(label || '').toLowerCase();
    return s.includes('revenue') || s.includes('aov') || s.includes('profit');
  }
  function formatUSD(n) {
    const rate = Number(usdRate || 1);
    const usd = Number(n || 0) / rate;
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(usd);
    } catch {
      return usd.toLocaleString();
    }
  }

  function cardColors(label) {
    const s = String(label || '').toLowerCase();
    if (s.includes('revenue')) return { badge: 'bg-blue-100 text-blue-700', value: 'text-blue-700', border: '        border-blue-00' };
    if (s.includes('aov')) return { badge: 'bg-purple-100 text-purple-700', value: 'text-purple-700', border: '      border-purple-00' };
    if (s.includes('completed')) return { badge: 'bg-green-100 text-green-700', value: 'text-green-700', border: '   border-green-00' };
    if (s.includes('pending')) return { badge: 'bg-yellow-100 text-yellow-700', value: 'text-yellow-700', border: '  border-yellow-00' };
    if (s.includes('shipped')) return { badge: 'bg-indigo-100 text-indigo-700', value: 'text-indigo-700', border: '  border-indigo-00' };
    if (s.includes('cancelled')) return { badge: 'bg-red-100 text-red-700', value: 'text-red-700', border: '  -red-00' };
    if (s.includes('returned')) return { badge: 'bg-orange-100 text-orange-700', value: 'text-orange-700', border: ' border-orange-00' };
    return { badge: 'bg-gray-100 text-gray-700', value: 'text-gray-900', border: ' border-gray-300' };
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Dashboard</h2>
      {/* am div pewist nia jare */}
      {/* <div>
        <Link to="/reports/sales" className="inline-block mt-2 rounded-md border px-3 py-2 hover:bg-gray-50">
          Open Sales Report
        </Link>
      </div> */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((c) => {
          const colors = cardColors(c.label);
          return (
            <div key={c.label} className={`rounded-xl bg-white p-4 hover:shadow-sm transition ${colors.border}`}>
              <div className={`inline-block text-xs px-2 py-1 rounded ${colors.border} ${colors.badge}`}>{c.label}</div>
              <div className={`mt-2 text-2xl font-semibold break-words ${colors.value}`}>{c.value != null ? (isMoneyLabel(c.label) ? formatCurrency(c.value) : formatNumber(c.value)) : '—'}</div>
              {c.value != null && isMoneyLabel(c.label) && (
                <div className="text-xs text-gray-500">{formatUSD(c.value)}</div>
              )}
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-white p-4 hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <div className="inline-block text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">Revenue</div>
            <div className="flex gap-1">
              {['1d','7d','30d'].map((r) => (
                <button
                  key={r}
                  className={`text-xs px-2 py-1 rounded border ${revRange === r ? 'bg-blue-100  text-blue-700' : 'bg-white hover:bg-gray-50'}`}
                  onClick={() => setRevRange(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-2 text-2xl font-semibold break-words text-blue-700">
            {(() => {
              const v = revRange === '1d' ? summary?.revenue_today : revRange === '7d' ? summary?.revenue_7d : summary?.revenue_30d;
              return v != null ? formatCurrency(v) : '—';
            })()}
          </div>
          {(() => {
            const v = revRange === '1d' ? summary?.revenue_today : revRange === '7d' ? summary?.revenue_7d : summary?.revenue_30d;
            return v != null ? <div className="text-xs text-gray-500">{formatUSD(v)}</div> : null;
          })()}
        </div>
        <div className="rounded-xl border bg-white p-4 hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <div className="inline-block text-xs px-2 py-1 rounded bg-red-100 text-red-700">Expenses</div>
            <div className="flex gap-1">
              {['1d','7d','30d'].map((r) => (
                <button
                  key={r}
                  className={`text-xs px-2 py-1 rounded border ${expRange === r ? 'bg-red-100  text-red-700' : 'bg-white hover:bg-gray-50'}`}
                  onClick={() => setExpRange(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-2 text-2xl font-semibold break-words text-red-700">
            {(() => {
              const v = expRange === '1d' ? summary?.expenses_today : expRange === '7d' ? summary?.expenses_7d : summary?.expenses_30d;
              return v != null ? formatCurrency(v) : '—';
            })()}
          </div>
          {(() => {
            const v = expRange === '1d' ? summary?.expenses_today : expRange === '7d' ? summary?.expenses_7d : summary?.expenses_30d;
            return v != null ? <div className="text-xs text-gray-500">{formatUSD(v)}</div> : null;
          })()}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-white p-4">
          <div className="">
            <div className="flex flex-wrap gap-2 ">
              <div>
                <div className="text-xs text-gray-500">From</div>
                <input
                  type="date"
                  className="rounded-md border px-2 py-1"
                  value={from}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (!v) { setDefaultDateRange(); return; }
                    setFrom(v);
                  }}
                />
              </div>
              <div>
                <div className="text-xs text-gray-500">To</div>
                <input
                  type="date"
                  className="rounded-md border px-2 py-1"
                  value={to}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (!v) { setDefaultDateRange(); return; }
                    setTo(v);
                  }}
                />
              </div>
              <div className='place-self-end '>
                <div className="text-xs text-gray-500 ">USD Rate (IQD per USD)</div>
                <input
                  type="number"
                  className="rounded-md border  px-2 py-1 place-self-end"
                  value={usdRate}
                  onChange={(e) => {
                    const v = Number(e.target.value || 0);
                    setUsdRate(v);
                    try { localStorage.setItem('usd_rate', String(v)); } catch { void 0; }
                  }}
                />
              </div>
            </div>
            
            
          </div>
        </div>
        <OrdersStatusChart data={statusDist} />
      </div>
      {user?.role === 'admin' && (
        <div className="rounded-xl border bg-white p-4 hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <div className="inline-block text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700">Net Profit</div>
            <div className="flex gap-1">
              {['1d','7d','30d'].map((r) => (
                <span key={r} className="text-[11px] px-2 py-1 rounded bg-gray-100 text-gray-700">{r}</span>
              ))}
            </div>
          </div>
          <div className="mt-2 text-2xl font-semibold break-words text-emerald-700">
            {(() => {
              return revRange === '1d'
                ? formatCurrency(summary?.net_profit_today)
                : revRange === '7d'
                ? formatCurrency(summary?.net_profit_7d)
                : formatCurrency(summary?.net_profit_30d);
            })()}
          </div>
          <div className="text-xs text-gray-500">
            {(() => {
              const v = revRange === '1d' ? summary?.net_profit_today : revRange === '7d' ? summary?.net_profit_7d : summary?.net_profit_30d;
              return v != null ? formatUSD(v) : '';
            })()}
          </div>
        </div>
      )}
      <RevenueChart data={revenue} />
      <TopProductsChart data={topProducts} />
      <div className="rounded-xl border bg-white p-4">
        <div className="mb-2 text-sm text-gray-600">Recent Orders</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2">#</th>
                <th className="text-left px-3 py-2">Customer</th>
                <th className="text-left px-3 py-2">Phone</th>
                <th className="text-left px-3 py-2">Total</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {ordersRecent.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="px-3 py-2">{o.id}</td>
                  <td className="px-3 py-2">{o.customer_name}</td>
                  <td className="px-3 py-2">{o.phone_number}</td>
                  <td className="px-3 py-2">
                    <div className="font-semibold">{formatCurrency(o.total_price)}</div>
                    <div className="text-xs text-gray-500">{formatUSD(o.total_price)}</div>
                  </td>
                  <td className="px-3 py-2">{o.status}</td>
                  <td className="px-3 py-2">{o.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
