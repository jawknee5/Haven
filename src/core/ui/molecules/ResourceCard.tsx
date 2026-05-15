import clsx from 'clsx';
import { Icon } from '../atoms/Icon';

export interface ResourceData {
  id: string;
  category: string;
  title: string;
  description: string;
  address?: string;
  phone?: string;
  distance?: string;
}

interface ResourceCardProps {
  resource: ResourceData;
  onOpen?: (resource: ResourceData) => void;
}

export function ResourceCard({ resource, onOpen }: ResourceCardProps) {
  return (
    <button
      onClick={() => onOpen?.(resource)}
      className={clsx('glass-card p-4 text-left w-full touch-active', 'hover:bg-white/[0.04] transition-colors duration-150')}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-pathway-blue/40 flex items-center justify-center shrink-0">
          <Icon name="mapPin" size={20} className="text-pathway-teal" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-pathway-teal font-semibold uppercase tracking-wider">{resource.category}</p>
          <h3 className="text-sm font-semibold text-pathway-textPrimary mt-0.5">{resource.title}</h3>
          <p className="text-xs text-pathway-textMuted mt-1 line-clamp-2">{resource.description}</p>
          {(resource.address || resource.distance) && (
            <div className="flex items-center gap-2 mt-2 text-[11px] text-pathway-textMuted">
              {resource.distance && <span>{resource.distance}</span>}
              {resource.address && <span className="truncate">{resource.address}</span>}
            </div>
          )}
        </div>
        <Icon name="arrowRight" size={16} className="text-pathway-textMuted shrink-0 mt-1" />
      </div>
    </button>
  );
}
