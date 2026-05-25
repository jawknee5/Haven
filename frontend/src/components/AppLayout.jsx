import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Briefcase,
  ListChecks,
  FileSpreadsheet,
  Map as MapIcon,
  Globe,
  CalendarClock,
  LifeBuoy,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import BBFloatingBubble from "@/components/BBFloatingBubble";

const NAV_BY_ROLE = {
  caseworker: [
    { to: "/caseworker", label: "Dashboard", icon: LayoutDashboard },
    { to: "/caseworker/bb-browser", label: "BB Browser Control", icon: Globe, accent: true },
    { to: "/caseworker/forms", label: "Form Builder", icon: FileSpreadsheet },
    { to: "/resources", label: "Resources", icon: MapIcon },
    { to: "/book", label: "Book a Session", icon: CalendarClock },
    { to: "/crisis", label: "Crisis Support", icon: LifeBuoy, danger: true },
  ],
  resident: [
    { to: "/resident", label: "My Roadmap", icon: LayoutDashboard },
    { to: "/resources", label: "Find Resources", icon: MapIcon },
    { to: "/book", label: "Book a Session", icon: CalendarClock },
    { to: "/crisis", label: "Crisis Support", icon: LifeBuoy, danger: true },
  ],
  admin: [
    { to: "/admin", label: "Admin Console", icon: LayoutDashboard },
    { to: "/caseworker", label: "Caseworker View", icon: Briefcase },
    { to: "/caseworker/forms", label: "Form Library", icon: FileSpreadsheet },
    { to: "/resources", label: "Resource Directory", icon: MapIcon },
    { to: "/book", label: "Book a Session", icon: CalendarClock },
  ],
};

export default function AppLayout({ children, title, subtitle, actions }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const items = NAV_BY_ROLE[user?.role] || NAV_BY_ROLE.resident;

  return (
    <div className="flex min-h-screen bg-[var(--haven-bg)] text-[var(--haven-text)]">
      {/* Sidebar */}
      <aside
        data-testid="haven-sidebar"
        className={`${collapsed ? "w-[68px]" : "w-[240px]"} hidden md:flex flex-col border-r border-[var(--haven-border)] bg-[#0c0c0e]/85 backdrop-blur-xl transition-all duration-200 sticky top-0 h-screen`}
      >
        <div className="px-4 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group" data-testid="haven-logo">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center font-display font-bold text-white shadow-lg shadow-blue-500/20">H</div>
            {!collapsed && <span className="font-display font-semibold tracking-tight text-lg">HAVEN</span>}
          </Link>
          <button
            data-testid="sidebar-toggle"
            onClick={() => setCollapsed((v) => !v)}
            className="text-zinc-500 hover:text-zinc-200 transition haven-btn"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-2">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/caseworker" || item.to === "/resident" || item.to === "/admin"}
              data-testid={`nav-${item.label.replace(/\s+/g, "-").toLowerCase()}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition haven-btn ${
                  isActive
                    ? "bg-blue-500/15 text-blue-300 border border-blue-500/20"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 border border-transparent"
                } ${item.accent && !isActive ? "ring-1 ring-blue-500/20" : ""} ${item.danger && !isActive ? "text-rose-400/90" : ""}`
              }
            >
              <item.icon size={16} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.accent && (
                <span className="ml-auto text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                  BB
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-[var(--haven-border)]">
          {!collapsed && user && (
            <div className="mb-2 px-2">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-[11px] text-zinc-500 capitalize">{user.role}</p>
            </div>
          )}
          <button
            data-testid="logout-btn"
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:text-rose-400 hover:bg-rose-500/5 transition haven-btn"
          >
            <LogOut size={14} />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main column */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-[var(--haven-border)] bg-[#0c0c0e]/85 backdrop-blur-xl">
          <div className="px-5 sm:px-8 py-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-blue-400/80">
                {user?.role === "caseworker" ? "Caseworker Console" : user?.role === "admin" ? "Admin Console" : user?.role === "resident" ? "My HAVEN" : "HAVEN"}
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold leading-tight mt-0.5">
                {title || "Help has a home."}
              </h1>
              {subtitle && <p className="text-sm text-zinc-400 mt-1">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2">{actions}</div>
          </div>
        </header>

        <div className="flex-1 px-5 sm:px-8 py-6 max-w-[1800px] w-full mx-auto">
          {children}
        </div>
      </main>

      {/* BB floating bubble — always present */}
      {user && <BBFloatingBubble />}
    </div>
  );
}
