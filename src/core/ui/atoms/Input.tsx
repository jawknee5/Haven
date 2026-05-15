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
          <label className="text-sm text-pathway-textSecondary mb-1.5 font-medium">{label}</label>
        )}
        <input
          ref={ref}
          className={clsx(
            'h-12 px-4 rounded-card bg-pathway-navy/60 border transition-colors duration-200',
            'text-pathway-textPrimary placeholder:text-pathway-textMuted',
            'focus:outline-none focus:ring-2 focus:ring-pathway-teal/40 focus:border-pathway-teal',
            error ? 'border-pathway-error focus:border-pathway-error focus:ring-pathway-error/30' : 'border-white/[0.06] hover:border-white/[0.1]',
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-pathway-error mt-1">{error}</span>}
        {helperText && !error && <span className="text-xs text-pathway-textMuted mt-1">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
