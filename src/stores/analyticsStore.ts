import { create } from 'zustand';

/**
 * Analytics Store
 * Tracks user actions, events, and performance metrics
 */

export interface AnalyticsEvent {
  id: string;
  type: string;
  userId: string;
  timestamp: string;
  data?: Record<string, any>;
}

export interface AnalyticsMetrics {
  pageViews: number;
  userSessions: number;
  avgSessionDuration: number;
  events: AnalyticsEvent[];
  byEventType: Record<string, number>;
  byPage: Record<string, number>;
}

interface AnalyticsStore {
  metrics: AnalyticsMetrics;
  trackEvent: (type: string, userId: string, data?: any) => void;
  trackPageView: (page: string, userId: string) => void;
  trackSessionStart: (userId: string) => void;
  trackSessionEnd: (userId: string, duration: number) => void;
  getMetrics: () => AnalyticsMetrics;
  getEventsSince: (minutes: number) => AnalyticsEvent[];
  clearMetrics: () => void;
}

export const useAnalyticsStore = create<AnalyticsStore>((set, get) => ({
  metrics: {
    pageViews: 0,
    userSessions: 0,
    avgSessionDuration: 0,
    events: [],
    byEventType: {},
    byPage: {}
  },

  trackEvent: (type, userId, data) => {
    const event: AnalyticsEvent = {
      id: `event_${Date.now()}`,
      type,
      userId,
      timestamp: new Date().toISOString(),
      data
    };

    set(state => ({
      metrics: {
        ...state.metrics,
        events: [...state.metrics.events, event],
        byEventType: {
          ...state.metrics.byEventType,
          [type]: (state.metrics.byEventType[type] || 0) + 1
        }
      }
    }));

    // Send to backend
    sendAnalyticsToBackend(event);
  },

  trackPageView: (page, userId) => {
    set(state => ({
      metrics: {
        ...state.metrics,
        pageViews: state.metrics.pageViews + 1,
        byPage: {
          ...state.metrics.byPage,
          [page]: (state.metrics.byPage[page] || 0) + 1
        }
      }
    }));

    get().trackEvent('page_view', userId, { page });
  },

  trackSessionStart: (userId) => {
    set(state => ({
      metrics: {
        ...state.metrics,
        userSessions: state.metrics.userSessions + 1
      }
    }));

    get().trackEvent('session_start', userId);
  },

  trackSessionEnd: (userId, duration) => {
    set(state => {
      const avgDuration = (state.metrics.avgSessionDuration * (state.metrics.userSessions - 1) + duration) / state.metrics.userSessions;
      return {
        metrics: {
          ...state.metrics,
          avgSessionDuration: avgDuration
        }
      };
    });

    get().trackEvent('session_end', userId, { duration });
  },

  getMetrics: () => get().metrics,

  getEventsSince: (minutes) => {
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000).toISOString();
    return get().metrics.events.filter(e => e.timestamp >= cutoffTime);
  },

  clearMetrics: () => {
    set({
      metrics: {
        pageViews: 0,
        userSessions: 0,
        avgSessionDuration: 0,
        events: [],
        byEventType: {},
        byPage: {}
      }
    });
  }
}));

/**
 * Send analytics to backend
 */
async function sendAnalyticsToBackend(event: AnalyticsEvent) {
  try {
    // Batch events for efficiency
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    }).catch(() => {
      // Fail silently - analytics shouldn't break the app
    });
  } catch (err) {
    console.log('Analytics send failed (non-critical)');
  }
}

/**
 * Hook to track page views
 */
export function usePageTracking(page: string) {
  const { trackPageView } = useAnalyticsStore();
  const userId = localStorage.getItem('user_id') || 'anonymous';

  React.useEffect(() => {
    trackPageView(page, userId);
  }, [page]);
}

/**
 * Hook to track session
 */
export function useSessionTracking() {
  const { trackSessionStart, trackSessionEnd } = useAnalyticsStore();
  const userId = localStorage.getItem('user_id') || 'anonymous';

  React.useEffect(() => {
    trackSessionStart(userId);
    const startTime = Date.now();

    return () => {
      const duration = (Date.now() - startTime) / 1000; // In seconds
      trackSessionEnd(userId, duration);
    };
  }, []);
}

import React from 'react';
