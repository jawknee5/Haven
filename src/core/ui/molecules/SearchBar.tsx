import { InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';
import { Icon } from '../atoms/Icon';

interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  fullWidth?: boolean;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ fullWidth, className, ...props }, ref) => {
    return (
      <div className={clsx('relative', fullWidth && 'w-full')}>
        <Icon
          name="search"
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-haven-textMuted pointer-events-none"
        />
        <input
          ref={ref}
          type="text"
          className={clsx(
            'h-12 w-full pl-10 pr-4 rounded-card',
            'bg-haven-navy/60 border border-white/[0.06]',
            'text-haven-textPrimary placeholder:text-haven-textMuted',
            'focus:outline-none focus:ring-2 focus:ring-haven-teal/30 focus:border-haven-teal',
            'transition-colors duration-200',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';
