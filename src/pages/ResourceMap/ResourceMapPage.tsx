import React from 'react';
import ResourceMap from '../../modules/ResourceMap/ResourceMap';
import '../Home/Home.css';

export default function ResourceMapPage() {
  return (
    <div className="resource-map-page" style={{ background: 'var(--bg-primary, #0D0F12)' }}>
      {/* Nav */}
      <nav className="home-nav">
        <div className="nav-left">
          <span className="logo">🕊️ Pathway Genesis</span>
        </div>
        <div className="nav-links">
          <a href="/">Home</a>
          <a href="/resources/map">Resources</a>
          <a href="/">Tools</a>
          <a href="/">Community</a>
        </div>
        <div className="nav-right">
          <span className="icon">🔔</span>
          <span className="icon">🔍</span>
          <div className="avatar"></div>
        </div>
      </nav>

      {/* Full-width Resource Map */}
      <div className="resource-map-full" style={{ marginTop: '64px', padding: '32px' }}>
        <ResourceMap />
      </div>
    </div>
  );
}
