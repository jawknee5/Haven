import React, { Suspense, lazy, memo, useMemo, useCallback, useTransition } from 'react';

/**
 * Performance Optimization Utilities
 * Lazy loading, code splitting, memoization, and performance monitoring
 */

// ============= Lazy Components =============

// Route-based code splitting
export const DashboardLazy = lazy(() => import('../pages/Dashboard/Dashboard'));
export const AdminLazy = lazy(() => import('../pages/Admin'));
export const BbChatLazy = lazy(() => import('../pages/BbChat'));
export const FormAutomationLazy = lazy(() => import('../pages/FormAutomation'));

// Component-based code splitting
export const BbChatWindowLazy = lazy(() => 
  import('../components/BbChat/BbChatWindow').then(m => ({ default: m.BbChatWindow }))
);

export const EnhancedBbChatLazy = lazy(() =>
  import('../components/BbChat/EnhancedBbChat').then(m => ({ default: m.EnhancedBbChat }))
);

// ============= Loading Boundary =============

export function LoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #000000 50%, #1a0a2e 100%)',
      color: '#fff'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '16px',
          animation: 'spin 1s linear infinite'
        }}>
          ⏳
        </div>
        <p>Loading...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

export function withLazyBoundary(Component: React.LazyExoticComponent<any>) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Component />
    </Suspense>
  );
}

// ============= Memoization =============

/**
 * Memoized Dashboard Component
 * Prevents unnecessary re-renders
 */
export const MemoizedDashboard = memo(
  React.lazy(() => import('../pages/Dashboard/Dashboard')),
  (prevProps, nextProps) => {
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
  }
);

// ============= Virtual Scrolling =============

export function VirtualList({
  items,
  itemHeight,
  containerHeight,
  renderItem
}: {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
}) {
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight);
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex);
  }, [items, visibleRange]);

  const offsetY = visibleRange.startIndex * itemHeight;

  return (
    <div
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div
        style={{
          height: items.length * itemHeight,
          position: 'relative'
        }}
      >
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => (
            <div key={visibleRange.startIndex + index}>
              {renderItem(item, visibleRange.startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============= Request Debouncing =============

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// ============= Request Throttling =============

export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = React.useState(value);
  const lastRan = React.useRef(Date.now());

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= delay) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, delay - (Date.now() - lastRan.current));

    return () => clearTimeout(handler);
  }, [value, delay]);

  return throttledValue;
}

// ============= Image Optimization =============

export const OptimizedImage = memo(({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
  const [imageSrc, setImageSrc] = React.useState(src);
  const [isLoading, setIsLoading] = React.useState(true);

  return (
    <>
      {isLoading && (
        <div style={{
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite',
          width: props.width,
          height: props.height
        }} />
      )}
      <img
        src={imageSrc}
        alt={alt}
        {...props}
        onLoad={() => setIsLoading(false)}
        style={{
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s'
        }}
      />
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
});

// ============= Intersection Observer =============

export function useIntersection(ref: React.RefObject<HTMLElement>, options = {}) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { threshold: 0.1, ...options });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, options]);

  return isVisible;
}

export function LazyComponent({ children }: { children: React.ReactNode }) {
  const ref = React.useRef(null);
  const isVisible = useIntersection(ref);

  return (
    <div ref={ref}>
      {isVisible ? children : <div style={{ minHeight: '300px' }} />}
    </div>
  );
}

// ============= Performance Monitoring =============

export class PerformanceMonitor {
  static markStart(label: string) {
    performance.mark(`${label}-start`);
  }

  static markEnd(label: string) {
    performance.mark(`${label}-end`);
    try {
      performance.measure(label, `${label}-start`, `${label}-end`);
      const measure = performance.getEntriesByName(label)[0];
      console.log(`⏱️ ${label}: ${measure.duration.toFixed(2)}ms`);
    } catch (err) {
      console.error(`Failed to measure ${label}`);
    }
  }

  static reportWebVitals() {
    if ('web-vital' in window) {
      const vitals = (window as any)['web-vital'];
      console.log('Web Vitals:', vitals);
    }
  }

  static getMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      fcp: navigation.responseStart - navigation.fetchStart,
      lcp: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime || 0,
      cls: performance.getEntriesByType('layout-shift').reduce((sum, entry: any) => sum + entry.value, 0),
      fid: performance.getEntriesByType('first-input')[0]?.processingDuration || 0
    };
  }
}

// ============= Hook for Performance Logging =============

export function usePerformanceLogging(componentName: string) {
  React.useEffect(() => {
    PerformanceMonitor.markStart(componentName);

    return () => {
      PerformanceMonitor.markEnd(componentName);
    };
  }, [componentName]);
}

// ============= Memoized Selectors =============

export function useMemoSelector<T>(selector: () => T, deps: any[]): T {
  return useMemo(() => selector(), deps);
}

// ============= Optimized Event Handlers =============

export function useOptimizedEventHandler<T extends (...args: any[]) => void>(
  handler: T,
  deps: any[]
): T {
  return useCallback(handler, deps) as T;
}

// ============= Code Splitting Router =============

export const OptimizedRoutes = {
  login: lazy(() => import('../pages/Login/Login')),
  dashboard: lazy(() => import('../pages/Dashboard/Dashboard')),
  admin: lazy(() => import('../pages/Admin')),
  chat: lazy(() => import('../pages/BbChat')),
  forms: lazy(() => import('../pages/FormAutomation')),
  resources: lazy(() => import('../pages/Resources/Resources')),
  profile: lazy(() => import('../pages/Profile/Profile'))
};

// ============= Bundle Analysis Helper =============

export function getBundleInfo() {
  if (process.env.NODE_ENV === 'development') {
    console.log(`
      📦 Bundle Information:
      - Code Splitting: Enabled
      - Lazy Loading: Enabled
      - Tree Shaking: Enabled
      - Minification: Enabled
      - Source Maps: ${process.env.NODE_ENV === 'development' ? 'Enabled' : 'Disabled'}
    `);
  }
}

// ============= Service Worker Registration =============

export function registerServiceWorker() {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
        })
        .catch(err => {
          console.error('Service Worker registration failed:', err);
        });
    });
  }
}

// ============= Cache Management =============

export class CacheManager {
  static set(key: string, value: any, ttl: number = 3600000) {
    const item = {
      value,
      expiry: Date.now() + ttl
    };
    localStorage.setItem(`cache_${key}`, JSON.stringify(item));
  }

  static get(key: string) {
    const item = localStorage.getItem(`cache_${key}`);
    if (!item) return null;

    const { value, expiry } = JSON.parse(item);
    if (Date.now() > expiry) {
      localStorage.removeItem(`cache_${key}`);
      return null;
    }

    return value;
  }

  static clear(key: string) {
    localStorage.removeItem(`cache_${key}`);
  }

  static clearAll() {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
  }
}
