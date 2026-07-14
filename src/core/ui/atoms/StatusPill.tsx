import clsx from 'clsx';

export type StatusVariant = 'pending' | 'in_progress' | 'completed' | 'warning' | 'error' | 'info';

interface StatusPillProps {
  status: StatusVariant;
  label?: string;
}

const statusConfig: Record<StatusVariant, { bg: string; text: string; defaultLabel: string }> = {
  pending: { bg: 'bg-haven-slate/50', text: 'text-haven-textSecondary', defaultLabel: 'Pending' },
  in_progress: { bg: 'bg-haven-blue/30', text: 'text-haven-softTeal', defaultLabel: 'In Progress' },
  completed: { bg: 'bg-haven-success/15', text: 'text-haven-success', defaultLabel: 'Completed' },
  warning: { bg: 'bg-haven-warning/15', text: 'text-haven-warning', defaultLabel: 'Warning' },
  error: { bg: 'bg-haven-error/15', text: 'text-haven-error', defaultLabel: 'Error' },
  info: { bg: 'bg-haven-teal/15', text: 'text-haven-teal', defaultLabel: 'Info' },
};

export function StatusPill({ status, label }: StatusPillProps) {
  const config = statusConfig[status];
  return (
    <span className={clsx('inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold', config.bg, config.text)}>
      {label ?? config.defaultLabel}
    </span>
  );
}
