import { ReactNode, ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-pathway-teal text-white hover:bg-pathway-softTeal focus:ring-pathway-teal/50 active:bg-pathway-teal/80',
  secondary: 'bg-pathway-slate text-pathway-textPrimary hover:bg-pathway-steel focus:ring-pathway-slate/50',
  ghost: 'bg-transparent text-pathway-textPrimary hover:bg-white/[0.06] focus:ring-pathway-textSecondary/30',
  danger: 'bg-pathway-error text-white hover:bg-red-600 focus:ring-pathway-error/50',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      leadingIcon,
      trailingIcon,
      loading,
      disabled,
      fullWidth,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={clsx(
          'inline-flex items-center justify-center rounded-pill font-medium transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-offset-transparent',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
          'active:scale-[0.97]',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading && (
          <span className="mr-2 inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        )}
        {leadingIcon && <span className="mr-2 inline-flex shrink-0">{leadingIcon}</span>}
        <span>{children}</span>
        {trailingIcon && <span className="ml-2 inline-flex shrink-0">{trailingIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
