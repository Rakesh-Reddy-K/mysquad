import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onClick={onClick}
      className={cn(
        'bg-white dark:bg-slate-800 rounded-2xl shadow-soft dark:shadow-none dark:border dark:border-slate-700',
        hover && 'cursor-pointer transition-shadow hover:shadow-card',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}