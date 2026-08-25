import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import TopProductsChart from "../../components/charts/TopProductsChart";
import OrdersStatusChart from "../../components/charts/OrdersStatusChart";
import { useAuth } from "../../store/auth";

// ─── Icon Components ────────────────────────────────────────────────
function IconPackage() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}
function IconGrid() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}
function IconShoppingCart() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  );
}
function IconBox() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    </svg>
  );
}
function IconTag() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}
function IconDollar() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  );
}
function IconTrendingUp() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}
function IconTrendingDown() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconX() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconRotate() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

// ─── Main Component ─────────────────────────────────────────────────
export default function DashboardHome() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [statusDist, setStatusDist] = useState([]);
  const [usdRate] = useState(() => {
    try {
      const v = localStorage.getItem("usd_rate");
      return v ? Number(v) : 1300;
    } catch {
      return 1300;
    }
  });
  const [revRange, setRevRange] = useState("1d");
  const [expRange, setExpRange] = useState("1d");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.get("/api/dashboard/summary");
        if (mounted) setSummary(data.summary || data);

        const tp = await api.get("/api/dashboard/top-products");
        if (mounted) setTopProducts(tp.data || tp);

        const ord = await api.get("/api/orders");
        if (mounted) {
          const list = ord.data || ord;
          const counter = {};
          (list || []).forEach((o) => {
            counter[o.status] = (counter[o.status] || 0) + 1;
          });
          const dist = Object.entries(counter).map(([status, count]) => ({
            status,
            count,
          }));
          setStatusDist(dist);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user]);

  // ─── Helpers ────────────────────────────────────────────────────
  function formatNumber(n) {
    return Number(n || 0).toLocaleString();
  }
  function formatCurrency(n, currency = "IQD") {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
      }).format(Number(n || 0));
    } catch {
      return formatNumber(n);
    }
  }
  function formatUSD(n) {
    const rate = Number(usdRate || 1);
    const usd = Number(n || 0) / rate;
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
      }).format(usd);
    } catch {
      return usd.toLocaleString();
    }
  }

  // ─── Loading & Error ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="grid place-items-center h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
            <div
              className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-b-indigo-400 animate-spin"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            />
          </div>
          <p className="text-sm text-[#1F2A5A]/50 font-medium animate-pulse">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid place-items-center h-64">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
            <IconX />
          </div>
          <p className="text-red-700 font-semibold">Something went wrong</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // ─── Card Configs ─────────────────────────────────────────────
  const cardConfigs = [
    {
      label: "Products",
      key: "products",
      icon: <IconPackage />,
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
      text: "text-blue-700",
      iconBg: "bg-blue-100",
    },
    {
      label: "Categories",
      key: "categories",
      icon: <IconGrid />,
      gradient: "from-violet-500 to-violet-600",
      bg: "bg-violet-50",
      text: "text-violet-700",
      iconBg: "bg-violet-100",
    },
    {
      label: "Orders",
      key: "orders",
      icon: <IconShoppingCart />,
      gradient: "from-indigo-500 to-indigo-600",
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      iconBg: "bg-indigo-100",
    },
    {
      label: "Stock Products",
      key: "stock_products",
      icon: <IconBox />,
      gradient: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      iconBg: "bg-emerald-100",
    },
    {
      label: "Stock Units",
      key: "stock_units",
      icon: <IconBox />,
      gradient: "from-teal-500 to-teal-600",
      bg: "bg-teal-50",
      text: "text-teal-700",
      iconBg: "bg-teal-100",
    },
    {
      label: "Stock Value (Cost)",
      key: "stock_value_cost",
      icon: <IconDollar />,
      gradient: "from-emerald-500 to-green-600",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      iconBg: "bg-emerald-100",
      isMoney: true,
    },
    {
      label: "Stock Value (Sale)",
      key: "stock_value_sale",
      icon: <IconDollar />,
      gradient: "from-green-500 to-green-600",
      bg: "bg-green-50",
      text: "text-green-700",
      iconBg: "bg-green-100",
      isMoney: true,
    },
    {
      label: "Pending",
      key: "orders_pending",
      icon: <IconClock />,
      gradient: "from-amber-500 to-amber-600",
      bg: "bg-amber-50",
      text: "text-amber-700",
      iconBg: "bg-amber-100",
    },
    {
      label: "Completed",
      key: "orders_completed",
      icon: <IconCheck />,
      gradient: "from-green-500 to-green-600",
      bg: "bg-green-50",
      text: "text-green-700",
      iconBg: "bg-green-100",
    },
    // { label: 'Shipped', key: 'orders_shipped', icon: <IconTruck />, gradient: 'from-sky-500 to-sky-600', bg: 'bg-sky-50', text: 'text-sky-700', iconBg: 'bg-sky-100' },
    {
      label: "Cancelled",
      key: "orders_cancelled",
      icon: <IconX />,
      gradient: "from-red-500 to-red-600",
      bg: "bg-red-50",
      text: "text-red-700",
      iconBg: "bg-red-100",
    },
    {
      label: "Returned",
      key: "orders_returned",
      icon: <IconRotate />,
      gradient: "from-orange-500 to-orange-600",
      bg: "bg-orange-50",
      text: "text-orange-700",
      iconBg: "bg-orange-100",
    },
    // { label: 'Users', key: 'users', icon: <IconUsers />, gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', text: 'text-purple-700', iconBg: 'bg-purple-100' },
    {
      label: "Active Promos",
      key: "promotions_active",
      icon: <IconTag />,
      gradient: "from-pink-500 to-pink-600",
      bg: "bg-pink-50",
      text: "text-pink-700",
      iconBg: "bg-pink-100",
    },
  ];

  return (
    <div className="min-h-screen bg-transparent text-[#1F2A5A]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* ─── Header ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1F2A5A]">Dashboard</h1>
            <p className="text-[#1F2A5A]/60 mt-1 text-sm">
              Welcome back{user?.name ? `, ${user.name}` : ""}! Here&apos;s your
              overview.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#1F2A5A]/60">
            <IconCalendar />
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* ─── Revenue & Expenses Hero Cards ─────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {/* Revenue Card */}
          <div className="relative overflow-hidden rounded-[24px] border border-[#1F2A5A]/15 bg-[#f9fafb] p-6 text-[#1F2A5A]">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#4BB7D8]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#4BB7D8]/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#4BB7D8]/10 text-[#4BB7D8]">
                    <IconTrendingUp />
                  </div>
                  <span className="font-semibold text-sm text-[#1F2A5A]/80">
                    Revenue
                  </span>
                </div>
                <div className="flex gap-1 bg-[#ffffff] rounded-lg p-1">
                  {["1d", "7d", "30d"].map((r) => (
                    <button
                      key={r}
                      className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all duration-200 ${
                        revRange === r
                          ? "bg-[#4BB7D8]/10 text-[#4BB7D8] font-bold"
                          : "text-[#1F2A5A]/60 hover:text-[#1F2A5A] hover:bg-[#ffffff]"
                      }`}
                      onClick={() => setRevRange(r)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight">
                {(() => {
                  const v =
                    revRange === "1d"
                      ? summary?.revenue_today
                      : revRange === "7d"
                        ? summary?.revenue_7d
                        : summary?.revenue_30d;
                  return v != null ? formatCurrency(v) : "—";
                })()}
              </div>
              <div className="text-[#1F2A5A]/60 text-sm mt-1">
                {(() => {
                  const v =
                    revRange === "1d"
                      ? summary?.revenue_today
                      : revRange === "7d"
                        ? summary?.revenue_7d
                        : summary?.revenue_30d;
                  return v != null ? formatUSD(v) : "";
                })()}
              </div>
            </div>
          </div>

          {/* Expenses Card */}
          <div className="relative overflow-hidden rounded-[24px] border border-[#1F2A5A]/15 bg-[#f9fafb] p-6 text-[#1F2A5A]">
            <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                    <IconTrendingDown />
                  </div>
                  <span className="font-semibold text-sm text-[#1F2A5A]/80">
                    Expenses
                  </span>
                </div>
                <div className="flex gap-1 bg-[#ffffff] rounded-lg p-1">
                  {["1d", "7d", "30d"].map((r) => (
                    <button
                      key={r}
                      className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all duration-200 ${
                        expRange === r
                          ? "bg-red-500/10 text-red-500 font-bold"
                          : "text-[#1F2A5A]/60 hover:text-[#1F2A5A] hover:bg-[#ffffff]"
                      }`}
                      onClick={() => setExpRange(r)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight">
                {(() => {
                  const v =
                    expRange === "1d"
                      ? summary?.expenses_today
                      : expRange === "7d"
                        ? summary?.expenses_7d
                        : summary?.expenses_30d;
                  return v != null ? formatCurrency(v) : "—";
                })()}
              </div>
              <div className="text-[#1F2A5A]/60 text-sm mt-1">
                {(() => {
                  const v =
                    expRange === "1d"
                      ? summary?.expenses_today
                      : expRange === "7d"
                        ? summary?.expenses_7d
                        : summary?.expenses_30d;
                  return v != null ? formatUSD(v) : "";
                })()}
              </div>
            </div>
          </div>

          {/* Net Profit Card (admin only) */}
          {user?.role === "admin" && (
            <div className="relative overflow-hidden rounded-[24px] border border-[#1F2A5A]/15 bg-[#f9fafb] p-6 text-[#1F2A5A]">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-[#4BB7D8]/10 text-[#4BB7D8]">
                      <IconDollar />
                    </div>
                    <span className="font-semibold text-sm text-[#1F2A5A]/80">
                      Net Profit
                    </span>
                  </div>
                  <div className="flex gap-1 text-[#1F2A5A]/60">
                    {["1d", "7d", "30d"].map((r) => (
                      <span
                        key={r}
                        className="text-[10px] px-2 py-1 rounded bg-[#ffffff]"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-3xl font-bold tracking-tight">
                  {revRange === "1d"
                    ? formatCurrency(summary?.net_profit_today)
                    : revRange === "7d"
                      ? formatCurrency(summary?.net_profit_7d)
                      : formatCurrency(summary?.net_profit_30d)}
                </div>
                <div className="text-[#1F2A5A]/60 text-sm mt-1">
                  {(() => {
                    const v =
                      revRange === "1d"
                        ? summary?.net_profit_today
                        : revRange === "7d"
                          ? summary?.net_profit_7d
                          : summary?.net_profit_30d;
                    return v != null ? formatUSD(v) : "";
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── Stats Grid ────────────────────────────────────── */}
        <div>
          <h3 className="text-lg font-semibold text-[#1F2A5A]/80 mb-4">
            Overview
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {cardConfigs.map((c, idx) => {
              const value = summary?.[c.key];
              return (
                <div
                  key={c.key}
                  className="group relative rounded-[20px] bg-white border border-[#1F2A5A]/15 p-4 hover:border-[#4BB7D8]/30 hover:bg-[#f3f4f6] transition-all duration-300 cursor-default"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`p-2 rounded-xl bg-[#ffffff] text-[#1F2A5A]/80 group-hover:text-[#4BB7D8] transition-colors duration-300`}
                    >
                      {c.icon}
                    </div>
                  </div>
                  <div
                    className={`text-2xl font-bold ${c.text} tracking-tight`}
                  >
                    {value != null
                      ? c.isMoney
                        ? formatCurrency(value)
                        : formatNumber(value)
                      : "—"}
                  </div>
                  {c.isMoney && value != null && (
                    <div className="text-xs text-[#1F2A5A]/60 mt-0.5">
                      {formatUSD(value)}
                    </div>
                  )}
                  <div className="text-xs text-[#1F2A5A]/50 mt-1 font-medium">
                    {c.label}
                  </div>
                  {/* Hover accent bar */}
                  <div
                    className={`absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r ${c.gradient} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Charts ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="rounded-[24px] bg-[#f9fafb] border border-[#1F2A5A]/15 p-6">
            <OrdersStatusChart data={statusDist} />
          </div>
          <div className="rounded-[24px] bg-[#f9fafb] border border-[#1F2A5A]/15 p-6">
            <TopProductsChart data={topProducts} />
          </div>
        </div>
      </div>
    </div>
  );
}
