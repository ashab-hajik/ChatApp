import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { toAbsoluteFileUrl } from '../../utils/constants';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  online?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-24 w-24 text-3xl',
};

function initialsFrom(name?: string | null) {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function Avatar({ src, name, size = 'md', online, className }: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const imageUrl = src ? toAbsoluteFileUrl(src) : null;
  const showImage = imageUrl && !hasError;

  return (
    <div className={clsx('relative shrink-0', SIZE_CLASSES[size], className)}>
      {showImage ? (
        <img
          src={imageUrl}
          alt={name ?? 'User avatar'}
          className="h-full w-full rounded-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-brand-500 font-semibold text-white">
          {initialsFrom(name)}
        </div>
      )}
      {online !== undefined && (
        <span
          className={clsx(
            'absolute bottom-0 right-0 block rounded-full ring-2 ring-white',
            online ? 'bg-green-500' : 'bg-gray-400',
            size === 'sm' ? 'h-2 w-2' : 'h-3 w-3',
          )}
        />
      )}
    </div>
  );
}
