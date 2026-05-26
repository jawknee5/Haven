import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import BirdMark from "@/components/BirdMark";
import { Menu, X, LogOut } from "lucide-react";

export default function MobileNav({ items }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        data-testid="mobile-nav-toggle"
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg border border-[var(--haven-border)] text-[#aab5cf] hover:text-[#f1d36b] haven-btn"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-[#070f1d] border-r border-[var(--haven-border)] p-4 flex flex-col animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <Link to="/home" onClick={() => setOpen(false)} className="flex items-center gap-2">
                <BirdMark size={26} />
                <span className="font-serif-haven font-semibold tracking-[0.18em] text-lg text-gold">HAVEN</span>
              </Link>
              <button data-testid="mobile-nav-close" onClick={() => setOpen(false)} className="text-[#aab5cf] hover:text-[#f1d36b]">
                <X size={20} />
              </button>
            </div>
            {user && (
              <div className="mb-4 px-2">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-[11px] text-zinc-500 capitalize">{user.role}</p>
              </div>
            )}
            <nav className="flex-1 space-y-1 overflow-y-auto">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  end={item.end}
                  data-testid={`mnav-${item.label.replace(/\s+/g, '-').toLowerCase()}`}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition haven-btn ${
                      isActive
                        ? 'bg-[#d4af37]/12 text-[#f1d36b] border border-[#d4af37]/30'
                        : 'text-[#aab5cf] hover:bg-[#142244]/60 border border-transparent'
                    } ${item.danger && 'text-rose-400/90'}`
                  }
                >
                  <item.icon size={16} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <button
              data-testid="mobile-logout"
              onClick={() => {
                logout();
                setOpen(false);
                navigate('/');
              }}
              className="mt-4 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:text-rose-400 hover:bg-rose-500/5 transition haven-btn"
            >
              <LogOut size={14} /> Sign out
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
