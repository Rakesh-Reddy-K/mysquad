import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let toastId = 0;

const toastStyles: Record<ToastType, { icon: ReactNode; ring: string; bar: string }> = {
  success: {
    icon: <CheckCircle2 className="w-5 h-5 text-accent" />,
    ring: 'border-l-accent',
    bar: 'bg-accent',
  },
  error: {
    icon: <XCircle className="w-5 h-5 text-danger" />,
    ring: 'border-l-danger',
    bar: 'bg-danger',
  },
  info: {
    icon: <Info className="w-5 h-5 text-secondary" />,
    ring: 'border-l-secondary',
    bar: 'bg-secondary',
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    const duration = type === 'error' ? 5000 : 3000;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const dismiss = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const style = toastStyles[toast.type];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={cn(
                  'relative pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl',
                  'bg-white dark:bg-slate-800 shadow-card border-l-4',
                  style.ring,
                )}
              >
                {style.icon}
                <p className="text-sm font-medium text-primary dark:text-slate-100 flex-1">{toast.message}</p>
                <button
                  onClick={() => dismiss(toast.id)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  aria-label="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 3, ease: 'linear' }}
                  className={cn('absolute bottom-0 left-0 right-0 h-0.5 origin-left rounded-full', style.bar)}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}