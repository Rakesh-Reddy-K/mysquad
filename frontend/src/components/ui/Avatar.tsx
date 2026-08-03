import { cn, initials } from '@/lib/utils';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  ring?: boolean;
}

const sizeClasses = {
  xs: 'w-8 h-8 text-[10px]',
  sm: 'w-10 h-10 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-20 h-20 text-xl',
};

const colors = [
  'bg-emerald-500',
  'bg-blue-500',
  'bg-violet-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-teal-500',
];

export function Avatar({ name, src, size = 'md', className, ring }: AvatarProps) {
  const colorIndex = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % colors.length;

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          'rounded-full object-cover flex-shrink-0',
          sizeClasses[size],
          ring && 'ring-2 ring-accent ring-offset-2 dark:ring-offset-slate-900',
          className,
        )}
      />
    );
  }

  return (
    <div
      aria-label={name}
      className={cn(
        'rounded-full flex items-center justify-center font-bold text-white select-none flex-shrink-0',
        colors[colorIndex],
        sizeClasses[size],
        ring && 'ring-2 ring-accent ring-offset-2 dark:ring-offset-slate-900',
        className,
      )}
    >
      {initials(name)}
    </div>
  );
}