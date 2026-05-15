import { SVGProps, forwardRef } from 'react';
import clsx from 'clsx';

interface IconProps extends SVGProps<SVGSVGElement> {
  name: string;
  size?: number | string;
  strokeWidth?: number;
}

const iconMap: Record<string, (props: SVGProps<SVGSVGElement>) => JSX.Element> = {
  compass: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="10" strokeWidth={p.strokeWidth ?? 1.5} />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" strokeWidth={p.strokeWidth ?? 1.5} />
    </svg>
  ),
  route: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="6" cy="19" r="3" strokeWidth={p.strokeWidth ?? 1.5} />
      <path d="M9 19h8a2 2 0 0 0 2-2V7" strokeWidth={p.strokeWidth ?? 1.5} />
      <path d="M18 7V5a2 2 0 0 0-2-2h-2" strokeWidth={p.strokeWidth ?? 1.5} />
      <circle cx="18" cy="5" r="3" strokeWidth={p.strokeWidth ?? 1.5} />
    </svg>
  ),
  book: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeWidth={p.strokeWidth ?? 1.5} />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeWidth={p.strokeWidth ?? 1.5} />
    </svg>
  ),
  wrench: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" strokeWidth={p.strokeWidth ?? 1.5} />
    </svg>
  ),
  backpack: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10z" strokeWidth={p.strokeWidth ?? 1.5} />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeWidth={p.strokeWidth ?? 1.5} />
      <path d="M12 11v6" strokeWidth={p.strokeWidth ?? 1.5} />
      <path d="M9 11h6" strokeWidth={p.strokeWidth ?? 1.5} />
    </svg>
  ),
  user: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth={p.strokeWidth ?? 1.5} />
      <circle cx="12" cy="7" r="4" strokeWidth={p.strokeWidth ?? 1.5} />
    </svg>
  ),
  upload: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth={p.strokeWidth ?? 1.5} />
      <polyline points="17 8 12 3 7 8" strokeWidth={p.strokeWidth ?? 1.5} />
      <line x1="12" y1="3" x2="12" y2="15" strokeWidth={p.strokeWidth ?? 1.5} />
    </svg>
  ),
  phone: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" strokeWidth={p.strokeWidth ?? 1.5} />
    </svg>
  ),
  mapPin: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeWidth={p.strokeWidth ?? 1.5} />
      <circle cx="12" cy="10" r="3" strokeWidth={p.strokeWidth ?? 1.5} />
    </svg>
  ),
  arrowRight: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <line x1="5" y1="12" x2="19" y2="12" strokeWidth={p.strokeWidth ?? 1.5} />
      <polyline points="12 5 19 12 12 19" strokeWidth={p.strokeWidth ?? 1.5} />
    </svg>
  ),
  search: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="11" cy="11" r="8" strokeWidth={p.strokeWidth ?? 1.5} />
      <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth={p.strokeWidth ?? 1.5} />
    </svg>
  ),
  check: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polyline points="20 6 9 17 4 12" strokeWidth={p.strokeWidth ?? 1.5} />
    </svg>
  ),
  close: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <line x1="18" y1="6" x2="6" y2="18" strokeWidth={p.strokeWidth ?? 1.5} />
      <line x1="6" y1="6" x2="18" y2="18" strokeWidth={p.strokeWidth ?? 1.5} />
    </svg>
  ),
  menu: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <line x1="3" y1="12" x2="21" y2="12" strokeWidth={p.strokeWidth ?? 1.5} />
      <line x1="3" y1="6" x2="21" y2="6" strokeWidth={p.strokeWidth ?? 1.5} />
      <line x1="3" y1="18" x2="21" y2="18" strokeWidth={p.strokeWidth ?? 1.5} />
    </svg>
  ),
  lock: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth={p.strokeWidth ?? 1.5} />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth={p.strokeWidth ?? 1.5} />
    </svg>
  ),
};

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ name, size = 24, strokeWidth = 1.5, className, ...props }, ref) => {
    const SvgIcon = iconMap[name];
    if (!SvgIcon) {
      console.warn(`[Icon] Unknown icon name: "${name}"`);
      return null;
    }
    return (
      <SvgIcon
        ref={ref}
        width={size}
        height={size}
        strokeWidth={strokeWidth}
        className={clsx('shrink-0', className)}
        {...props}
      />
    );
  }
);

Icon.displayName = 'Icon';
