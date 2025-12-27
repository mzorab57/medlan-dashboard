import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../store/auth';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden">
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white p-4 transform transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:block`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="text-xl font-semibold">Medlan Admin</div>
          <button
            className="lg:hidden px-3 py-2 rounded hover:bg-gray-800"
            onClick={() => setMobileOpen(false)}
          >
            ✕
          </button>
        </div>
        <nav className="space-y-2">
          <Link to="/" className="block px-3 py-2 rounded hover:bg-gray-800" onClick={() => setMobileOpen(false)}>Dashboard</Link>
          <div className="text-xs uppercase text-gray-400 px-3 mt-4">Catalog</div>
          <Link to="/products" className="block px-3 py-2 rounded hover:bg-gray-800" onClick={() => setMobileOpen(false)}>Products</Link>
          <Link to="/categories" className="block px-3 py-2 rounded hover:bg-gray-800" onClick={() => setMobileOpen(false)}>Categories</Link>
          <Link to="/subcategories" className="block px-3 py-2 rounded hover:bg-gray-800" onClick={() => setMobileOpen(false)}>Subcategories</Link>
          <Link to="/brands" className="block px-3 py-2 rounded hover:bg-gray-800" onClick={() => setMobileOpen(false)}>Brands</Link>
          <Link to="/meta/colors-sizes" className="block px-3 py-2 rounded hover:bg-gray-800" onClick={() => setMobileOpen(false)}>Colors & Sizes</Link>
          <Link to="/orders" className="block px-3 py-2 rounded hover:bg-gray-800" onClick={() => setMobileOpen(false)}>Orders</Link>
          {user?.role === 'admin' && (
            <>
              <Link to="/promotions" className="block px-3 py-2 rounded hover:bg-gray-800" onClick={() => setMobileOpen(false)}>Promotions</Link>
              <Link to="/users" className="block px-3 py-2 rounded hover:bg-gray-800" onClick={() => setMobileOpen(false)}>Users</Link>
              <div className="text-xs uppercase text-gray-400 px-3 mt-4">Reports</div>
              <Link to="/reports/sales" className="block px-3 py-2 rounded hover:bg-gray-800" onClick={() => setMobileOpen(false)}>Sales Report</Link>
            </>
          )}
          <Link to="/feedback" className="block px-3 py-2 rounded hover:bg-gray-800" onClick={() => setMobileOpen(false)}>Feedback</Link>
          {user?.role === 'admin' && (
            <Link to="/stock" className="block px-3 py-2 rounded hover:bg-gray-800" onClick={() => setMobileOpen(false)}>Stock</Link>
          )}
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50 relative overflow-y-auto">
        <header className="sticky top-0 z-[1] flex items-center justify-between p-3 sm:p-4 border-b bg-white">
          <div className="flex items-center gap-2">
            <button
              className="lg:hidden px-3 py-2 rounded border bg-white hover:bg-gray-100"
              onClick={() => setMobileOpen(true)}
            >
              ☰
            </button>
            <span className="text-sm text-gray-500">
              Signed in as {user?.username || user?.full_name || 'Admin'}
            </span>
          </div>
          <button
            onClick={logout}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            Logout
          </button>
        </header>
        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
