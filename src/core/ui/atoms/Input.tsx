import { forwardRef, InputHTMLAttributes } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, fullWidth, className, ...props }, ref) => {
    return (
      <div className={clsx('flex flex-col', fullWidth && 'w-full')}>
        {label && (
          <label className="text-sm text-haven-textSecondary mb-1.5 font-medium">{label}</label>
        )}
        <input
          ref={ref}
          className={clsx(
            'h-12 px-4 rounded-card bg-haven-navy/60 border transition-colors duration-200',
            'text-haven-textPrimary placeholder:text-haven-textMuted',
            'focus:outline-none focus:ring-2 focus:ring-haven-teal/40 focus:border-haven-teal',
            error ? 'border-haven-error focus:border-haven-error focus:ring-haven-error/30' : 'border-white/[0.06] hover:border-white/[0.1]',
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-haven-error mt-1">{error}</span>}
        {helperText && !error && <span className="text-xs text-haven-textMuted mt-1">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
