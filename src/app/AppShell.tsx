import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import clsx from 'clsx';

const TABS = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/pathway', label: 'Pathway', icon: '🗺️' },
  { path: '/resources', label: 'Resources', icon: '📚' },
  { path: '/housing', label: 'Housing', icon: '🏠' },
  { path: '/survival-bible', label: 'Survival Bible', icon: '📖' },
  { path: '/pack', label: 'Pack', icon: '🎒' },
];

export default function AppShell() {
  const location = useLocation();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#0D0F12',
      color: '#fff',
    }}>
      {/* Main Content */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: '64px',
        backgroundColor: 'rgba(20, 23, 28, 0.95)',
        borderTop: '1px solid rgba(42, 47, 54, 0.6)',
        backdropFilter: 'blur(10px)',
      }}>
        {TABS.map((tab) => {
          const isActive = location.pathname === tab.path || location.pathname.startsWith(tab.path + '/');
          return (
            <Link
              key={tab.path}
              to={tab.path}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '8px 12px',
                textDecoration: 'none',
                color: isActive ? '#1F6F78' : '#A7B0BC',
                fontSize: '10px',
                fontWeight: '600',
                flex: 1,
                textAlign: 'center',
                transition: 'all 0.2s',
                borderTop: isActive ? '3px solid #1F6F78' : 'none',
                paddingTop: isActive ? '5px' : '8px',
              }}
            >
              <span style={{ fontSize: '20px' }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
