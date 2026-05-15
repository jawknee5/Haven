import { ReactNode, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { Icon } from '../atoms/Icon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    full: 'max-w-full mx-4',
  };

  return createPortal(
    <div className="fixed inset-0 z-modal flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={clsx(
          'relative w-full bg-pathway-canvas rounded-t-2xl sm:rounded-2xl shadow-modal',
          'flex flex-col max-h-[85vh]',
          sizeClasses[size],
          'animate-slide-up'
        )}
      >
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
            <h2 className="text-lg font-semibold text-pathway-textPrimary">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-pathway-slate/50 flex items-center justify-center touch-active"
              aria-label="Close"
            >
              <Icon name="close" size={16} className="text-pathway-textSecondary" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4 no-scrollbar">{children}</div>
        {footer && <div className="p-4 border-t border-white/[0.06]">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
