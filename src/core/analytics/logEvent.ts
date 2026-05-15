export type EventDomain = 'task' | 'pathway' | 'resources' | 'tools' | 'pack' | 'onboarding' | 'session' | 'pwa';

export interface AnalyticsEvent {
  eventType: string;
  payload: Record<string, unknown>;
  timestamp: string;
  userId?: string;
}

const ANALYTICS_ENDPOINT = '/api/analytics/events';
const EVENT_QUEUE: AnalyticsEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

export function logEvent(eventType: string, payload: Record<string, unknown> = {}, immediate = false) {
  const event: AnalyticsEvent = {
    eventType,
    payload,
    timestamp: new Date().toISOString(),
  };

  if (immediate) {
    sendEvent(event);
  } else {
    EVENT_QUEUE.push(event);
    scheduleFlush();
  }
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(flushEvents, 5000);
}

async function flushEvents() {
  flushTimer = null;
  if (EVENT_QUEUE.length === 0) return;

  const events = [...EVENT_QUEUE];
  EVENT_QUEUE.length = 0;

  try {
    await fetch(ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ events }),
    });
  } catch {
    EVENT_QUEUE.unshift(...events);
  }
}

async function sendEvent(event: AnalyticsEvent) {
  try {
    await fetch(ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ events: [event] }),
    });
  } catch {
    EVENT_QUEUE.push(event);
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) flushEvents();
  });
}
