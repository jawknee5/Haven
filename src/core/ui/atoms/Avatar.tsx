import clsx from 'clsx';

interface AvatarProps {
  initials: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' };

export function Avatar({ initials, imageUrl, size = 'md', className }: AvatarProps) {
  return (
    <div
      className={clsx(
        'rounded-full overflow-hidden flex items-center justify-center font-bold bg-haven-teal text-white',
        sizeMap[size],
        className
      )}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={initials} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
