import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
  circle?: boolean;
}

export function Skeleton({ className, circle }: SkeletonProps) {
  return (
    <div
      className={clsx(
        'animate-pulse bg-haven-slate/30',
        circle ? 'rounded-full' : 'rounded-lg',
        className
      )}
    />
  );
}
