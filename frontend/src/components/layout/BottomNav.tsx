import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, CalendarDays, Bell, Settings, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/statistics', label: 'Stats', icon: BarChart3 },
  { to: '/matches', label: 'Matches', icon: CalendarDays },
  { to: '/announcements', label: 'Updates', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function BottomNav() {
  return (
    <motion.nav
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-nav safe-bottom"
      aria-label="Mobile navigation"
    >
      <div className="grid grid-cols-5 max-w-lg mx-auto">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 py-3 px-1 text-[10px] font-medium transition-colors',
                isActive
                  ? 'text-emerald-500 dark:text-emerald-400'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300',
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {isActive && (
                    <motion.div
                      layoutId="bottom-nav-active"
                      className="absolute -inset-1 rounded-full bg-emerald-500/15"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className="w-5 h-5 relative" />
                </div>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </motion.nav>
  );
}