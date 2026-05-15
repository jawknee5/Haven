import clsx from 'clsx';

export type StatusVariant = 'pending' | 'in_progress' | 'completed' | 'warning' | 'error' | 'info';

interface StatusPillProps {
  status: StatusVariant;
  label?: string;
}

const statusConfig: Record<StatusVariant, { bg: string; text: string; defaultLabel: string }> = {
  pending: { bg: 'bg-pathway-slate/50', text: 'text-pathway-textSecondary', defaultLabel: 'Pending' },
  in_progress: { bg: 'bg-pathway-blue/30', text: 'text-pathway-softTeal', defaultLabel: 'In Progress' },
  completed: { bg: 'bg-pathway-success/15', text: 'text-pathway-success', defaultLabel: 'Completed' },
  warning: { bg: 'bg-pathway-warning/15', text: 'text-pathway-warning', defaultLabel: 'Warning' },
  error: { bg: 'bg-pathway-error/15', text: 'text-pathway-error', defaultLabel: 'Error' },
  info: { bg: 'bg-pathway-teal/15', text: 'text-pathway-teal', defaultLabel: 'Info' },
};

export function StatusPill({ status, label }: StatusPillProps) {
  const config = statusConfig[status];
  return (
    <span className={clsx('inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold', config.bg, config.text)}>
      {label ?? config.defaultLabel}
    </span>
  );
}
