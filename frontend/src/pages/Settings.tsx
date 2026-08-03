import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Moon,
  Sun,
  Bell,
  Shield,
  ChevronRight,
  Megaphone,
  Users,
  CalendarDays,
  MapPin,
  LogOut,
  Lock,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useChangePasswordMutation } from '@/hooks/useMutations';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const changePwMutation = useChangePasswordMutation();
  const [showPwForm, setShowPwForm] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');

  if (!user) return null;

  const captainLinks = [
    {
      label: 'Manage Players',
      icon: Users,
      to: '/players',
      description: 'Add or view squad members',
    },
    {
      label: 'Schedule Match',
      icon: CalendarDays,
      to: '/matches',
      description: 'Create / edit / update fixtures',
    },
    {
      label: 'Announcements',
      icon: Megaphone,
      to: '/announcements',
      description: 'Post or manage team updates',
    },
    {
      label: 'Venues',
      icon: MapPin,
      to: '/venues',
      description: 'Manage grounds & facilities',
    },
  ];

  return (
    <div className="space-y-5 pb-20">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-primary dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your preferences and team controls</p>
      </div>

      {/* Account */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-5 flex items-center gap-3">
          <Avatar name={user.name} size="md" ring />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-primary dark:text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user.phone}</p>
          </div>
          {user.isCaptain && <Badge variant="warning">Captain</Badge>}
          <Badge variant="info">{user.role}</Badge>
        </Card>
      </motion.div>

      {/* Preferences */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Preferences
        </h2>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-slate-500 dark:text-slate-300" />
            ) : (
              <Sun className="w-4 h-4 text-slate-500 dark:text-slate-300" />
            )}
          </div>
          <span className="flex-1 text-left text-sm font-semibold text-primary dark:text-white">
            Dark Mode
          </span>
          <button
            onClick={toggleTheme}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              theme === 'dark' ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-600'
            }`}
            aria-label="Toggle dark mode"
          >
            <span
              className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${
                theme === 'dark' ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </Card>

        <Card className="p-4 flex items-center gap-3 opacity-60">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <Bell className="w-4 h-4 text-slate-500 dark:text-slate-300" />
          </div>
          <span className="flex-1 text-left text-sm font-semibold text-primary dark:text-white">
            Match Reminders
          </span>
          <Badge variant="neutral">On</Badge>
        </Card>
      </div>

      {/* Captain controls */}
      {user.isCaptain && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Captain Controls
          </h2>
          <div className="space-y-2.5">
            {captainLinks.map(({ label, icon: Icon, to, description }) => (
              <button key={label} onClick={() => navigate(to)} className="w-full">
                <Card hover className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-primary dark:text-white">{label}</p>
                    <p className="text-xs text-slate-400 truncate">{description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                </Card>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Security */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Security
        </h2>
        {!showPwForm ? (
          <button onClick={() => setShowPwForm(true)} className="w-full">
            <Card hover className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <Lock className="w-4 h-4 text-slate-500 dark:text-slate-300" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold text-primary dark:text-white">Change Password</p>
                <p className="text-xs text-slate-400">Update your account password</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
            </Card>
          </button>
        ) : (
          <Card className="p-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                className="input-base"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">New Password</label>
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className="input-base"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className="input-base"
                placeholder="Re-enter new password"
              />
            </div>
            {pwError && <p className="text-xs text-red-500">{pwError}</p>}
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setShowPwForm(false); setCurrentPw(''); setNewPw(''); setConfirmPw(''); setPwError(''); }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="success"
                loading={changePwMutation.isPending}
                onClick={() => {
                  if (!currentPw || !newPw) {
                    setPwError('Please fill in all fields');
                    return;
                  }
                  if (newPw !== confirmPw) {
                    setPwError('New passwords do not match');
                    return;
                  }
                  if (newPw.length < 6) {
                    setPwError('New password must be at least 6 characters');
                    return;
                  }
                  setPwError('');
                  changePwMutation.mutate(
                    { currentPassword: currentPw, newPassword: newPw },
                    {
                      onSuccess: () => {
                        setShowPwForm(false);
                        setCurrentPw('');
                        setNewPw('');
                        setConfirmPw('');
                      },
                    },
                  );
                }}
              >
                Update Password
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* About */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          About
        </h2>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <Shield className="w-4 h-4 text-slate-500 dark:text-slate-300" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-primary dark:text-white">MySquad</p>
            <p className="text-xs text-slate-400">v1.0.0 — Made for local cricket teams 🏏</p>
          </div>
        </Card>
      </div>

      <button
        onClick={logout}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors"
      >
        <LogOut className="w-4 h-4" /> Logout
      </button>
    </div>
  );
}