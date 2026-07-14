import { useState } from 'react';
import clsx from 'clsx';
import { Icon } from '../atoms/Icon';

interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  color: string;
}

interface ResourceCategoryGridProps {
  categories: Category[];
  onCategorySelect: (categoryId: string) => void;
}

export function ResourceCategoryGrid({ categories, onCategorySelect }: ResourceCategoryGridProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-2 gap-3">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => {
            setActiveCategory(cat.id);
            onCategorySelect(cat.id);
          }}
          className={clsx(
            'glass-card p-4 flex flex-col items-start gap-3 touch-active',
            'hover:bg-white/[0.04] active:scale-[0.97] transition-all duration-150',
            activeCategory === cat.id && 'ring-1 ring-haven-teal/40'
          )}
        >
          <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', cat.color)}>
            <Icon name={cat.icon as any} size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-haven-textPrimary">{cat.name}</h3>
            <p className="text-[11px] text-haven-textMuted">{cat.count} resources</p>
          </div>
        </button>
      ))}
    </div>
  );
}
