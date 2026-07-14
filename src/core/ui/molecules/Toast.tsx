import { useEffect } from 'react';
import clsx from 'clsx';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  onDismiss: () => void;
  duration?: number;
}

const typeStyles: Record<ToastType, string> = {
  success: 'bg-haven-success/90 text-white',
  error: 'bg-haven-error/90 text-white',
  warning: 'bg-haven-warning/90 text-black',
  info: 'bg-haven-teal/90 text-white',
};

export function Toast({ message, type = 'info', onDismiss, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  return createPortal(
    <div className="fixed top-4 left-4 right-4 z-toast flex justify-center animate-slide-down pointer-events-none">
      <div className={clsx('px-4 py-3 rounded-card text-sm font-medium shadow-elevated pointer-events-auto', typeStyles[type])}>
        {message}
      </div>
    </div>,
    document.body
  );
}
