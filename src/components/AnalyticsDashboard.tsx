import React from 'react';
import { useAnalyticsStore } from '../../stores/analyticsStore';
import { useIsMobile } from '../../hooks/useMediaQuery';

/**
 * Analytics Dashboard Component
 * Display tracking metrics and insights
 */

export default function AnalyticsDashboard() {
  const isMobile = useIsMobile();
  const { metrics, getEventsSince } = useAnalyticsStore();
  const recentEvents = getEventsSince(60); // Last 60 minutes

  // Calculate conversion metrics
  const eventTypes = Object.entries(metrics.byEventType).sort((a, b) => b[1] - a[1]);
  const topPages = Object.entries(metrics.byPage).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
      padding: isMobile ? '16px' : '24px'
    }}>
      {/* Key Metrics */}
      <MetricCard
        title="Total Page Views"
        value={metrics.pageViews}
        icon="👁️"
        trend="+12% this week"
      />
      <MetricCard
        title="Active Sessions"
        value={metrics.userSessions}
        icon="🔄"
        trend="Users online now"
      />
      <MetricCard
        title="Avg Session Duration"
        value={`${Math.round(metrics.avgSessionDuration)}s`}
        icon="⏱️"
        trend="Last 60 minutes"
      />
      <MetricCard
        title="Recent Events"
        value={recentEvents.length}
        icon="📊"
        trend="Last hour"
      />

      {/* Event Types */}
      <div style={{
        background: 'rgba(26, 30, 36, 0.8)',
        border: '1px solid rgba(212, 175, 55, 0.4)',
        borderRadius: '12px',
        padding: '16px',
        gridColumn: isMobile ? '1fr' : 'span 1'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#FFD700', marginBottom: '12px', textTransform: 'uppercase' }}>
          Event Types
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {eventTypes.slice(0, 5).map(([type, count]) => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: '#A0A0A0', flex: 1, textTransform: 'capitalize' }}>
                {type}
              </span>
              <div style={{
                width: '100px',
                height: '4px',
                background: 'rgba(212, 175, 55, 0.2)',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${(count / Math.max(...Object.values(metrics.byEventType))) * 100}%`,
                  background: '#FFD700'
                }} />
              </div>
              <span style={{ fontSize: '11px', color: '#FFD700', fontWeight: '700', minWidth: '30px', textAlign: 'right' }}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Pages */}
      <div style={{
        background: 'rgba(26, 30, 36, 0.8)',
        border: '1px solid rgba(212, 175, 55, 0.4)',
        borderRadius: '12px',
        padding: '16px',
        gridColumn: isMobile ? '1fr' : 'span 1'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#FFD700', marginBottom: '12px', textTransform: 'uppercase' }}>
          Top Pages
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {topPages.map(([page, count]) => (
            <div key={page} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#A0A0A0' }}>{page}</span>
              <span style={{ fontSize: '12px', color: '#FFD700', fontWeight: '700' }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div style={{
        background: 'rgba(26, 30, 36, 0.8)',
        border: '1px solid rgba(212, 175, 55, 0.4)',
        borderRadius: '12px',
        padding: '16px',
        gridColumn: isMobile ? '1fr' : 'span auto'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#FFD700', marginBottom: '12px', textTransform: 'uppercase' }}>
          Recent Activity
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
          {recentEvents.slice(-10).reverse().map(event => (
            <div key={event.id} style={{
              fontSize: '11px',
              padding: '8px',
              background: 'rgba(13, 15, 18, 0.8)',
              borderRadius: '4px',
              borderLeft: '2px solid #FFD700'
            }}>
              <div style={{ color: '#FFD700', fontWeight: '700', marginBottom: '2px' }}>
                {event.type}
              </div>
              <div style={{ color: '#A0A0A0' }}>
                {new Date(event.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  trend
}: {
  title: string;
  value: any;
  icon: string;
  trend: string;
}) {
  return (
    <div style={{
      background: 'rgba(26, 30, 36, 0.8)',
      border: '1px solid rgba(212, 175, 55, 0.4)',
      borderRadius: '12px',
      padding: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
        <div style={{ fontSize: '24px' }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
            {title}
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#FFD700' }}>
            {value}
          </div>
        </div>
      </div>
      <div style={{ fontSize: '11px', color: '#A0A0A0', borderTop: '1px solid rgba(212, 175, 55, 0.2)', paddingTop: '8px' }}>
        {trend}
      </div>
    </div>
  );
}
