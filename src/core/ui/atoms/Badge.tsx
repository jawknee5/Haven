import clsx from 'clsx';
import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'streak' | 'achievement' | 'xp';
}

const variantStyles = {
  default: 'bg-pathway-slate/50 text-pathway-textSecondary',
  streak: 'bg-orange-500/15 text-orange-400',
  achievement: 'bg-pathway-warning/15 text-pathway-warning',
  xp: 'bg-pathway-teal/15 text-pathway-teal',
};

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold',
        variantStyles[variant]
      )}
    >
      {children}
    </span>
  );
}
