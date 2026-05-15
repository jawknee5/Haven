import React from 'react';
import './Home.css';

export default function Home() {
  const stats = [
    { label: 'Tasks Completed', value: '12', icon: '✅' },
    { label: 'Resources Used', value: '8', icon: '📚' },
    { label: 'Hours Logged', value: '24', icon: '⏱️' },
    { label: 'Next Appointment', value: 'Tomorrow', icon: '📅' },
  ];

  const recentActivities = [
    { title: 'Visited Food Bank', time: '2 hours ago', type: 'resource', icon: '🥫' },
    { title: 'Updated Profile', time: '5 hours ago', type: 'profile', icon: '👤' },
    { title: 'Attended Workshop', time: '1 day ago', type: 'event', icon: '📖' },
    { title: 'Applied for Job', time: '2 days ago', type: 'job', icon: '💼' },
  ];

  const essentials = [
    {
      id: 1,
      title: 'Water',
      icon: '💧',
      status: 'Critical',
      color: '#3B82F6',
      description: 'Find clean water sources',
      resources: [
        { name: 'San Jose Water Works', dist: '0.3 mi', status: 'Open', hours: '8am-6pm' },
        { name: 'Clean Water Station', dist: '1.2 mi', status: 'Open', hours: '24/7' },
        { name: 'Purification Center', dist: '2.1 mi', status: 'Open', hours: '9am-5pm' },
        { name: 'Water Distribution', dist: '0.8 mi', status: 'Open', hours: '7am-7pm' },
      ]
    },
    {
      id: 2,
      title: 'Food',
      icon: '🥫',
      status: 'Available',
      color: '#10B981',
      description: 'Food banks and meal programs',
      resources: [
        { name: 'San Jose Food Bank', dist: '0.5 mi', status: 'Open', hours: '8am-5pm' },
        { name: 'Community Kitchen', dist: '1.2 mi', status: 'Open', hours: 'Daily 11am-2pm' },
        { name: 'Soup Kitchen', dist: '2.1 mi', status: 'Open', hours: '12pm-6pm' },
        { name: 'Nutrition Center', dist: '0.8 mi', status: 'Open', hours: 'Mon-Fri 9am-5pm' },
      ]
    },
    {
      id: 3,
      title: 'Shelter',
      icon: '🏠',
      status: 'Urgent',
      color: '#EF4444',
      description: 'Emergency housing',
      resources: [
        { name: 'Emergency Shelter', dist: '1.2 mi', status: 'Open', hours: '24/7' },
        { name: 'Safe Haven', dist: '2.1 mi', status: 'Open', hours: '5pm-8am' },
        { name: 'Transitional Housing', dist: '3.5 mi', status: 'Available', hours: 'Apply Now' },
        { name: 'Housing Assistance', dist: '1.8 mi', status: 'Open', hours: 'Mon-Fri 9am-5pm' },
      ]
    },
    {
      id: 4,
      title: 'Health',
      icon: '⚕️',
      status: 'Available',
      color: '#8B5CF6',
      description: 'Medical services',
      resources: [
        { name: 'Valley Medical Center', dist: '2.1 mi', status: '24/7', hours: 'Emergency' },
        { name: 'Clinic San Jose', dist: '1.2 mi', status: 'Open', hours: 'Mon-Fri 8am-6pm' },
        { name: 'Mental Health Services', dist: '1.8 mi', status: 'Open', hours: 'By Appointment' },
        { name: 'Free Health Screening', dist: '0.8 mi', status: 'Saturdays', hours: '10am-2pm' },
      ]
    },
    {
      id: 5,
      title: 'Safety',
      icon: '🛡️',
      status: 'Available',
      color: '#F59E0B',
      description: 'Safe spaces',
      resources: [
        { name: 'Safe House Network', dist: '1.5 mi', status: 'Available', hours: 'Call 211' },
        { name: 'Crisis Center', dist: '2.1 mi', status: '24/7', hours: 'Walk-in' },
        { name: 'Community Safety', dist: '1.2 mi', status: 'Available', hours: '24/7' },
        { name: 'Support Hotline', dist: 'Call', status: 'Always', hours: '988' },
      ]
    },
    {
      id: 6,
      title: 'Income',
      icon: '💼',
      status: 'Available',
      color: '#EC4899',
      description: 'Job training',
      resources: [
        { name: 'Tech Career Academy', dist: '0.5 mi', status: 'Enrolling', hours: 'Classes Daily' },
        { name: 'Job Training Center', dist: '1.2 mi', status: 'Open', hours: 'Mon-Fri 9am-5pm' },
        { name: 'Resume Workshop', dist: '1.8 mi', status: 'Weekly', hours: 'Thursdays 2pm' },
        { name: 'Job Board Kiosk', dist: '0.8 mi', status: 'Open', hours: '8am-8pm' },
      ]
    },
  ];

  const tools = [
    { name: 'Budget Tracker', icon: '💰', category: 'Finance', desc: 'Track income & expenses', color: '#10B981', features: ['Income tracker', 'Expense categories', 'Monthly reports', 'Savings goals'] },
    { name: 'Task Manager', icon: '✅', category: 'Productivity', desc: 'Organize your goals', color: '#3B82F6', features: ['Create tasks', 'Set priorities', 'Due dates', 'Progress tracking'] },
    { name: 'Job Finder', icon: '🔍', category: 'Jobs', desc: 'Search & apply jobs', color: '#F59E0B', features: ['Job search', 'Apply tracking', 'Saved jobs', 'Interview prep'] },
    { name: 'Health Log', icon: '📔', category: 'Health', desc: 'Track wellness', color: '#EF4444', features: ['Appointment tracking', 'Health notes', 'Medications', 'Test results'] },
    { name: 'Skills Hub', icon: '📚', category: 'Learning', desc: 'Learn new skills', color: '#8B5CF6', features: ['Courses', 'Certifications', 'Progress tracking', 'Badges'] },
    { name: 'File Storage', icon: '📁', category: 'Docs', desc: 'Store documents', color: '#EC4899', features: ['Cloud storage', 'File organization', 'Sharing', 'Backup'] },
  ];

  const mapResources = [
    { name: 'San Jose Food Bank', dist: '0.5 mi', status: 'Open', icon: '🥫' },
    { name: 'Valley Medical', dist: '2.1 mi', status: '24/7', icon: '⚕️' },
    { name: 'First Step', dist: '1.2 mi', status: 'Open', icon: '🏠' },
    { name: 'Tech Academy', dist: '0.5 mi', status: 'Enrolling', icon: '💼' },
    { name: 'Health Center', dist: '5.8 mi', status: 'Open', icon: '⚕️' },
    { name: 'Rescue Mission', dist: '1.5 mi', status: '24/7', icon: '🏠' },
  ];

  const profileStats = [
    { label: 'Resources', value: '12', icon: '📚' },
    { label: 'Goals', value: '3', icon: '🎯' },
    { label: 'Days Active', value: '45', icon: '📅' },
  ];

  const achievements = [
    { icon: '🎯', title: 'First Steps', desc: 'Completed first assessment' },
    { icon: '🗺️', title: 'Explorer', desc: 'Found 5 resources' },
    { icon: '✅', title: 'Goal Setter', desc: 'Set and achieved goal' },
    { icon: '🏆', title: 'Helper', desc: 'Helped another member' },
    { icon: '⭐', title: 'Learner', desc: 'Completed skill training' },
    { icon: '💪', title: 'Strong Start', desc: '30 days active' },
  ];

  return (
    <div className="home-page">
      {/* Navigation */}
      <nav className="home-nav">
        <div className="nav-left">
          <span className="logo">🕊️ Pathway Genesis</span>
        </div>
        <div className="nav-links">
          <a href="/">Home</a>
          <a href="/resources/map">Map</a>
          <a href="/tools">Tools</a>
          <a href="/profile">Profile</a>
        </div>
        <div className="nav-right">
          <span className="icon">🔔</span>
          <span className="icon">🔍</span>
          <div className="avatar"></div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="home-content">
        {/* Hero Section */}
        <section className="hero-section">
          <h1 className="hero-title">I WILL SHOW YOU THE WAY</h1>
          <div className="hero-divider"></div>
        </section>

        {/* Dashboard Stats */}
        <section className="dashboard-section">
          <h2 className="section-title">Dashboard Overview</h2>
          <div className="stats-grid">
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="activity-section">
          <h2 className="section-title">Recent Activity</h2>
          <div className="activity-list">
            {recentActivities.map((activity, idx) => (
              <div key={idx} className="activity-item">
                <span className="activity-icon">{activity.icon}</span>
                <div className="activity-content">
                  <div className="activity-title">{activity.title}</div>
                  <div className="activity-time">{activity.time}</div>
                </div>
                <span className="activity-arrow">→</span>
              </div>
            ))}
          </div>
        </section>

        {/* Essentials */}
        <section className="essentials-section">
          <h2 className="section-title">Survival Essentials</h2>
          <div className="essentials-grid">
            {essentials.map((essential) => (
              <div key={essential.id} className="essential-card" style={{
                borderTop: `4px solid ${essential.color}`
              }}>
                <div className="card-header">
                  <div className="card-icon">{essential.icon}</div>
                  <div className="card-status" style={{ background: `${essential.color}22`, color: essential.color }}>
                    {essential.status}
                  </div>
                </div>
                
                <h3 className="card-title">{essential.title}</h3>
                <p className="card-description">{essential.description}</p>
                
                <div className="card-resources">
                  {essential.resources.map((res, idx) => (
                    <div key={idx} className="resource-item-small">
                      <div className="resource-name">{res.name}</div>
                      <div className="resource-meta">{res.dist} • {res.hours}</div>
                    </div>
                  ))}
                </div>
                
                <button className="card-btn" style={{ color: essential.color }}>
                  View All →
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Tools */}
        <section className="tools-section">
          <h2 className="section-title">Available Tools</h2>
          <div className="tools-grid">
            {tools.map((tool, idx) => (
              <div key={idx} className="tool-card" style={{
                borderTop: `4px solid ${tool.color}`
              }}>
                <div className="tool-icon">{tool.icon}</div>
                <h3 className="tool-title">{tool.name}</h3>
                <p className="tool-desc">{tool.desc}</p>
                <div className="tool-features">
                  {tool.features.slice(0, 2).map((feat, i) => (
                    <span key={i} className="feature-tag" style={{ background: `${tool.color}22`, color: tool.color }}>
                      {feat}
                    </span>
                  ))}
                </div>
                <button className="tool-btn" style={{ color: tool.color, borderColor: tool.color }}>
                  Open Tool
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Map Resources */}
        <section className="map-resources-section">
          <h2 className="section-title">Nearby Resources</h2>
          <div className="map-resources-list">
            {mapResources.map((res, idx) => (
              <div key={idx} className="map-resource-item">
                <div className="map-res-left">
                  <span className="map-res-icon">{res.icon}</span>
                  <div className="map-res-info">
                    <div className="map-res-name">{res.name}</div>
                    <div className="map-res-meta">{res.dist}</div>
                  </div>
                </div>
                <span className="map-res-status">{res.status}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Achievements */}
        <section className="achievements-section">
          <h2 className="section-title">Your Achievements</h2>
          <div className="achievements-grid">
            {achievements.map((ach, idx) => (
              <div key={idx} className="achievement-card">
                <div className="achievement-icon">{ach.icon}</div>
                <h4 className="achievement-title">{ach.title}</h4>
                <p className="achievement-desc">{ach.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="home-footer">
          <p>Pathway Genesis • All resources verified for your area</p>
          <div className="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">About</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
