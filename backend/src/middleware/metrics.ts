import { Request, Response, NextFunction } from 'express';

interface RouteMetric {
  count: number;
  totalMs: number;
  maxMs: number;
  minMs: number;
  errors: number;
}

const startedAt = Date.now();
const routeMetrics = new Map<string, RouteMetric>();

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestStart = Date.now();
  const routeKey = `${req.method} ${req.path}`;

  res.on('finish', () => {
    const duration = Date.now() - requestStart;
    const current = routeMetrics.get(routeKey) || {
      count: 0,
      totalMs: 0,
      maxMs: 0,
      minMs: Number.MAX_SAFE_INTEGER,
      errors: 0,
    };

    current.count += 1;
    current.totalMs += duration;
    current.maxMs = Math.max(current.maxMs, duration);
    current.minMs = Math.min(current.minMs, duration);
    if (res.statusCode >= 500) {
      current.errors += 1;
    }

    routeMetrics.set(routeKey, current);
  });

  next();
};

export function getMetrics(): string {
  const uptimeMs = Date.now() - startedAt;
  const lines: string[] = [];

  lines.push('# HELP haven_uptime_seconds Process uptime in seconds');
  lines.push('# TYPE haven_uptime_seconds gauge');
  lines.push(`haven_uptime_seconds ${Math.floor(uptimeMs / 1000)}`);

  for (const [route, metric] of routeMetrics.entries()) {
    const avg = metric.count > 0 ? metric.totalMs / metric.count : 0;
    const safeRoute = route.replace(/"/g, '\\"');

    lines.push(`haven_http_requests_total{route="${safeRoute}"} ${metric.count}`);
    lines.push(`haven_http_errors_total{route="${safeRoute}"} ${metric.errors}`);
    lines.push(`haven_http_latency_avg_ms{route="${safeRoute}"} ${avg.toFixed(2)}`);
    lines.push(`haven_http_latency_max_ms{route="${safeRoute}"} ${metric.maxMs}`);
    lines.push(`haven_http_latency_min_ms{route="${safeRoute}"} ${metric.minMs === Number.MAX_SAFE_INTEGER ? 0 : metric.minMs}`);
  }

  return lines.join('\n') + '\n';
}
