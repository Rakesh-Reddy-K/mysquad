import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  MapPin,
  Megaphone,
  Settings,
  LogOut,
  BarChart3,
  CalendarCheck,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/statistics', label: 'Statistics', icon: BarChart3 },
  { to: '/matches', label: 'Matches', icon: CalendarDays },
  { to: '/players', label: 'Players', icon: Users },
  { to: '/availability', label: 'Availability', icon: CalendarCheck },
  { to: '/venues', label: 'Venues', icon: MapPin },
  { to: '/announcements', label: 'Announcements', icon: Megaphone },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 py-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-glow">
          <span className="text-white font-black text-lg">M</span>
        </div>
        <div>
          <h1 className="font-display font-extrabold text-lg text-primary dark:text-white leading-none">
            MySquad
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Team Companion</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all',
                'hover:bg-slate-100 dark:hover:bg-slate-800',
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300',
              )
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Settings */}
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          cn(
            'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all mb-1',
            'hover:bg-slate-100 dark:hover:bg-slate-800',
            isActive
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-300',
          )
        }
      >
        <Settings className="w-5 h-5" />
        Settings
      </NavLink>

      {/* User */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 px-2 mb-2">
          <Avatar name={user?.name ?? 'U'} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-primary dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user?.isCaptain ? 'Captain' : 'Player'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </motion.aside>
  );
}