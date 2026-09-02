import { NavLink, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../store/auth";
import AdminButton from "../components/ui/AdminButton";

function IconMenu() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function IconDot() {
  return <span className="h-2 w-2 rounded-full bg-current" />;
}

function navClassName({ isActive }) {
  return [
    "group flex items-center gap-3 rounded-2xl px-4 py-2 text-sm font-medium transition-all duration-200",
    isActive
      ? "border border-[#4BB7D8]/20 bg-[#4BB7D8]/10 text-[#4BB7D8]"
      : "border border-transparent text-[#1F2A5A]/60 hover:bg-[#ffffff] hover:text-[#1F2A5A]",
  ].join(" ");
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  const navSections = [
    {
      label: "Overview",
      items: [
        { to: "/", label: "Dashboard" },
        { to: "/orders", label: "Orders" },
      ],
    },
    {
      label: "Catalog",
      items: [
        { to: "/products", label: "Products" },
        { to: "/categories", label: "Categories" },
        { to: "/subcategories", label: "Subcategories" },
        { to: "/brands", label: "Brands" },
        { to: "/meta/colors-sizes", label: "Colors & Sizes" },
      ],
    },
    {
      label: "Operations",
      items: [
        { to: "/stock", label: "Stock", roles: ["admin"] },
        { to: "/purchases", label: "Purchases", roles: ["admin", "employee"] },
        { to: "/feedback", label: "Feedback", roles: ["admin"] },
      ],
    },
    {
      label: "Management",
      items: [
        { to: "/promotions", label: "Promotions", roles: ["admin"] },
        { to: "/website/hero-banners", label: "Hero Banners", roles: ["admin"] },
        { to: "/users", label: "Users", roles: ["admin"] },
        { to: "/reports/sales", label: "Sales Report", roles: ["admin"] },
        { to: "/expenses", label: "Expenses", roles: ["admin"] },
      ],
    },
  ];

  const canAccess = (item) => !item.roles || item.roles.includes(user?.role);

  return (
    <div className="min-h-screen bg-transparent text-[#1F2A5A] lg:flex lg:gap-6 lg:p-4">
      {mobileOpen ? (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-[#000000]/75 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[320px] transform p-4 transition-transform duration-300 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:w-[320px] lg:translate-x-0 lg:p-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="admin-shell-card flex h-full flex-col overflow-hidden p-4">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#4BB7D8]/30 bg-[#4BB7D8]/10 text-sm font-semibold text-[#4BB7D8]">
                ML
              </div>
              <div>
                <div className="text-base font-semibold tracking-wide text-[#1F2A5A]">
                  MedLan
                </div>
                <div className="text-xs text-[#1F2A5A]/50">Administration</div>
              </div>
            </div>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#4BB7D8]/30 bg-[#4BB7D8]/10 text-[#4BB7D8] transition-colors hover:bg-[#4BB7D8]/20 hover:text-[#4BB7D8] lg:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <span className="text-xl leading-none">×</span>
            </button>
          </div>

          

          <nav className="flex-1 space-y-2 overflow-y-auto pr-1">
            {navSections.map((section) => {
              const visibleItems = section.items.filter(canAccess);
              if (visibleItems.length === 0) return null;
              return (
                <div key={section.label}>
                  <div className="mb-2 px-2 border-b w-28 border-[#4BB7D8]/70 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#1F2A5A]/50">
                    {section.label}
                  </div>
                  <div className="space-y-2">
                    {visibleItems.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === "/"}
                        className={navClassName}
                        onClick={() => setMobileOpen(false)}
                      >
                        <span
                          className={`inline-flex h-2 w-2 items-center justify-center rounded-xl border transition-colors ${
                            window.location.pathname === item.to ||
                            (item.to !== "/" &&
                              window.location.pathname.startsWith(item.to))
                              ? "border-[#4BB7D8]/30 bg-[#4BB7D8]/10 text-[#4BB7D8]"
                              : "border-[#1F2A5A]/15 bg-[#f9fafb] text-[#1F2A5A]/60 group-hover:border-[#1F2A5A]/15 group-hover:bg-[#ffffff]"
                          }`}
                        >
                          <IconDot />
                        </span>
                        <span className="truncate">{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="mt-6 border-t border-slate-800 pt-4">
            <AdminButton variant="ghost" block onClick={logout}>
              Logout
            </AdminButton>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 lg:py-0">
        <div className="flex min-h-screen flex-col gap-4 lg:min-h-[calc(100vh-2rem)]">
          <header className="admin-shell-card sticky top-0 z-30 mx-4 mt-4 flex items-center justify-between px-4 py-3 backdrop-blur-xl lg:mx-0 lg:mt-0">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#4BB7D8]/30 bg-[#4BB7D8]/10 text-[#4BB7D8] transition-colors hover:bg-[#4BB7D8]/20 hover:text-[#4BB7D8] lg:hidden"
                onClick={() => setMobileOpen(true)}
              >
                <IconMenu />
              </button>
              <div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-[#4BB7D8]/70">
                  MedLan
                </div>
                <div className="text-sm font-medium text-[#1F2A5A]/80">
                  MedLan administration.
                </div>
              </div>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="rounded-2xl border border-[#1F2A5A]/15 bg-[#f9fafb] px-4 py-2 text-xs text-[#1F2A5A]/60">
                Role:{" "}
                <span className="font-semibold text-[#1F2A5A]">
                  {user?.role || "staff"}
                </span>
              </div>
              <AdminButton variant="secondary" onClick={logout}>
                Logout
              </AdminButton>
            </div>
          </header>

          <div className="mx-4 mb-4 flex-1 lg:mx-0 lg:mb-0">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
