import React, { useEffect, useState } from 'react';

/**
 * UI/UX Polish Utilities
 * Micro-interactions, animations, and visual refinements
 */

// ============= Global Animations =============

export const GlobalAnimations = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes glow {
    0%, 100% { box-shadow: 0 0 5px rgba(212, 175, 55, 0.3); }
    50% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.6); }
  }
`;

// ============= Toast Notifications =============

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 3000) => {
    const id = `toast_${Date.now()}`;
    const toast: Toast = { id, message, type, duration };

    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }

    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return { toasts, addToast, removeToast };
}

export function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={() => onRemove(toast.id)} />
      ))}
    </div>
  );
}

function Toast({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const colors = {
    success: { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.5)', text: '#86EFAC' },
    error: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.5)', text: '#FCA5A5' },
    warning: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.5)', text: '#FCD34D' },
    info: { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.5)', text: '#93C5FD' }
  };

  const color = colors[toast.type];
  const icon = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  return (
    <div
      style={{
        background: color.bg,
        border: `1px solid ${color.border}`,
        borderRadius: '8px',
        padding: '12px 16px',
        color: color.text,
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        animation: 'slideInRight 0.3s ease-out',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        minWidth: '300px'
      }}
    >
      <span style={{ fontSize: '16px' }}>{icon[toast.type]}</span>
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: color.text,
          cursor: 'pointer',
          fontSize: '16px',
          padding: '0 4px'
        }}
      >
        ✕
      </button>
    </div>
  );
}

// ============= Loading Animations =============

export function LoadingSpinner({ size = '40px' }: { size?: string }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: '4px solid rgba(212, 175, 55, 0.2)',
        borderTop: '4px solid #FFD700',
        borderRadius: '50%',
        animation: 'rotate 1s linear infinite'
      }}
    />
  );
}

export function SkeletonLoader({ width = '100%', height = '20px' }: { width?: string; height?: string }) {
  return (
    <div
      style={{
        width,
        height,
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s infinite',
        borderRadius: '4px'
      }}
    />
  );
}

// ============= Progress Indicators =============

export function ProgressBar({ progress, height = '4px' }: { progress: number; height?: string }) {
  return (
    <div
      style={{
        height,
        background: 'rgba(212, 175, 55, 0.2)',
        borderRadius: '2px',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #FFD700, #FFF44F)',
          transition: 'width 0.3s ease-out'
        }}
      />
    </div>
  );
}

export function CircularProgress({ progress, size = '80px' }: { progress: number; size?: string }) {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx="50%"
        cy="50%"
        r="36"
        fill="none"
        stroke="rgba(212, 175, 55, 0.2)"
        strokeWidth="4"
      />
      <circle
        cx="50%"
        cy="50%"
        r="36"
        fill="none"
        stroke="#FFD700"
        strokeWidth="4"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.3s ease-out' }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="16"
        fontWeight="bold"
        fill="#FFD700"
      >
        {progress}%
      </text>
    </svg>
  );
}

// ============= Transition Effects =============

export const transitionStyles = {
  fadeIn: 'opacity 0.3s ease-out',
  slideUp: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  slideDown: 'all 0.3s ease-out',
  scaleIn: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out'
};

// ============= Tooltip Component =============

export function Tooltip({
  content,
  position = 'top',
  children
}: {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
}) {
  const [isVisible, setIsVisible] = useState(false);

  const positionStyles: Record<string, React.CSSProperties> = {
    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%) translateY(-8px)' },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%) translateY(8px)' },
    left: { right: '100%', top: '50%', transform: 'translateY(-50%) translateX(-8px)' },
    right: { left: '100%', top: '50%', transform: 'translateY(-50%) translateX(8px)' }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>

      {isVisible && (
        <div
          style={{
            position: 'absolute',
            background: 'rgba(0, 0, 0, 0.9)',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            animation: 'scaleIn 0.2s ease-out',
            ...positionStyles[position]
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}

// ============= Drawer/Slide Panel =============

export function SlidePanel({
  isOpen,
  onClose,
  side = 'right',
  children
}: {
  isOpen: boolean;
  onClose: () => void;
  side?: 'left' | 'right';
  children: React.ReactNode;
}) {
  return (
    <>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            animation: 'fadeIn 0.3s ease-out'
          }}
          onClick={onClose}
        />
      )}

      <div
        style={{
          position: 'fixed',
          top: 0,
          [side]: 0,
          width: '400px',
          height: '100vh',
          background: 'linear-gradient(135deg, rgba(20, 23, 28, 0.98), rgba(13, 15, 18, 0.95))',
          border: `1px solid rgba(212, 175, 55, 0.5)`,
          zIndex: 1000,
          transform: isOpen ? 'translateX(0)' : `translateX(${side === 'right' ? '100%' : '-100%'})`,
          transition: 'transform 0.3s ease-out',
          overflowY: 'auto'
        }}
      >
        {children}
      </div>
    </>
  );
}

// ============= Badge Component =============

export function Badge({
  label,
  variant = 'primary',
  animated = false
}: {
  label: string;
  variant?: 'primary' | 'success' | 'error' | 'warning';
  animated?: boolean;
}) {
  const colors = {
    primary: '#FFD700',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B'
  };

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 12px',
        background: colors[variant],
        color: variant === 'warning' ? '#000' : '#fff',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '700',
        animation: animated ? 'pulse 2s ease-in-out infinite' : 'none'
      }}
    >
      {label}
    </span>
  );
}

// ============= Ripple Effect =============

export function useRipple() {
  const [ripples, setRipples] = React.useState<any[]>([]);

  const onMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = {
      id: Date.now(),
      x,
      y,
      size: 0
    };

    setRipples([...ripples, ripple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== ripple.id));
    }, 600);
  };

  return { ripples, onMouseDown };
}

// ============= Hover Scale Effect =============

export function HoverScale({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        transition: 'transform 0.2s ease-out',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
      }}
    >
      {children}
    </div>
  );
}

// ============= Fade-in on Scroll =============

export function FadeInOnScroll({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.6s ease-out',
        animation: isVisible ? 'fadeIn 0.6s ease-out' : 'none'
      }}
    >
      {children}
    </div>
  );
}
