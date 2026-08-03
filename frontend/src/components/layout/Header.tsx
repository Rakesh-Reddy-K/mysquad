import { Bell, Moon, Sun, Search, Settings } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 glass border-b border-slate-200/60 dark:border-slate-800">
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3 max-w-7xl mx-auto">
        {/* Search (desktop) */}
        <div className="hidden md:flex flex-1 max-w-sm relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search players, matches..."
            className="input-base pl-10"
            aria-label="Search"
          />
        </div>
        <div className="flex-1 md:hidden" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 transition-colors"
            aria-label="Toggle dark mode"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <Link
            to="/settings"
            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </Link>
          <Link
            to="/announcements"
            className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </Link>
          <Link to="/profile" className="ml-1">
            <Avatar name={user?.name ?? 'U'} size="sm" ring />
          </Link>
        </div>
      </div>
    </header>
  );
}