import React, { ReactNode } from 'react';

/**
 * Error Boundary Component
 * Catches errors in child components and displays fallback UI
 */
export class ErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div style={{
            padding: '32px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            borderRadius: '12px',
            color: '#FCA5A5',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '40px auto'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ marginBottom: '12px' }}>Something went wrong</h2>
            <p style={{ marginBottom: '16px', color: '#A0A0A0' }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                background: '#EF4444',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '700'
              }}
            >
              Reload Page
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
