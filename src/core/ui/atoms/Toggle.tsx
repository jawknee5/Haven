import { forwardRef, InputHTMLAttributes } from 'react';
import clsx from 'clsx';

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, className, checked, ...props }, ref) => {
    return (
      <label className={clsx('inline-flex items-center gap-3 cursor-pointer', className)}>
        <div className="relative">
          <input ref={ref} type="checkbox" className="sr-only peer" checked={checked} {...props} />
          <div
            className={clsx(
              'w-11 h-6 rounded-full transition-colors duration-200',
              'bg-haven-slate peer-checked:bg-haven-teal',
              'peer-focus:ring-2 peer-focus:ring-haven-teal/50'
            )}
          />
          <div
            className={clsx(
              'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white',
              'transition-transform duration-200 peer-checked:translate-x-5',
              'shadow-sm'
            )}
          />
        </div>
        {label && <span className="text-sm text-haven-textPrimary">{label}</span>}
      </label>
    );
  }
);

Toggle.displayName = 'Toggle';
