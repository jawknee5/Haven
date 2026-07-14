import clsx from 'clsx';
import { ReactNode } from 'react';

interface ToolTileProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function ToolTile({ icon, label, onClick, disabled }: ToolTileProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'flex flex-col items-center justify-center gap-2',
        'glass-card p-4 aspect-square touch-active',
        'hover:bg-white/[0.06] active:scale-[0.96] transition-all duration-150',
        disabled && 'opacity-40 cursor-not-allowed pointer-events-none'
      )}
    >
      <div className="w-10 h-10 rounded-xl bg-haven-slate/50 flex items-center justify-center text-haven-teal">
        {icon}
      </div>
      <span className="text-xs text-haven-textSecondary text-center leading-tight">{label}</span>
    </button>
  );
}
