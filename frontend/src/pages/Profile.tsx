import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  Activity,
  Target,
  ChevronRight,
  TrendingUp,
  Trophy,
  Crown,
  Settings,
  Medal,
  Lock,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { useAuth } from '@/context/AuthContext';
import { useChangePasswordMutation } from '@/hooks/useMutations';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const changePassword = useChangePasswordMutation();

  const [pwOpen, setPwOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword) return;
    if (newPassword.length < 4) return;
    if (newPassword !== confirmPassword) return;
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setPwOpen(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
      },
    );
  };

  if (!user) return null;

  const stats = [
    { label: 'Matches', value: user.matches, icon: CalendarDays, color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-500' },
    { label: 'Runs', value: user.runs, icon: Activity, color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' },
    { label: 'Wickets', value: user.wickets, icon: Target, color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-500' },
  ];

  const highlights = [
    { label: 'Total Runs', value: String(user.runs), icon: Trophy },
    { label: 'Avg Runs / Match', value: user.matches ? Math.round((user.runs / user.matches) * 10) / 10 : '—', icon: TrendingUp },
    { label: 'Season Performance', value: `${user.wickets} wkts`, icon: Medal },
  ];

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-primary dark:text-white">My Statistics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Personal performance & season record</p>
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Player Hero */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
          <div className="relative">
            <div className="flex justify-center mb-4">
              <Avatar name={user.name} size="xl" ring />
            </div>
            <h1 className="font-display text-2xl font-extrabold text-primary dark:text-white mb-1">
              {user.name}
            </h1>
            <div className="flex items-center justify-center gap-2">
              <Badge variant="info">{user.role}</Badge>
              {user.isCaptain && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <Crown className="w-3 h-3" /> Captain
                </span>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Season Stats */}
      <Card className="p-5">
        <h2 className="font-display font-bold text-primary dark:text-white mb-4">Season Stats</h2>
        <div className="grid grid-cols-3 gap-3">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="text-center">
              <div className={`w-10 h-10 mx-auto rounded-xl ${color} flex items-center justify-center mb-1.5`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="font-display text-xl font-extrabold text-primary dark:text-white">{value}</p>
              <p className="text-xs text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Highlights */}
      <Card className="p-5">
        <h2 className="font-display font-bold text-primary dark:text-white mb-4">Highlights</h2>
        <div className="space-y-2.5">
          {highlights.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="flex-1 text-sm text-slate-600 dark:text-slate-300">{label}</span>
              <span className="text-sm font-bold text-primary dark:text-white">{value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Season Availability */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Season Availability
          </span>
          <span className="text-sm font-bold text-emerald-500">{user.availability}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${user.availability}%` }}
            transition={{ duration: 0.8 }}
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600"
          />
        </div>
        <p className="text-xs text-slate-400 mt-3">
          Your attendance across all matches this season.
        </p>
      </Card>

      {/* Change Password */}
      <div className="space-y-2.5">
        <button onClick={() => setPwOpen(true)} className="w-full">
          <Card hover className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <Lock className="w-4 h-4 text-slate-500 dark:text-slate-300" />
            </div>
            <span className="flex-1 text-left text-sm font-semibold text-primary dark:text-white">
              Change Password
            </span>
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
          </Card>
        </button>
      </div>

      {/* Quick Links */}
      <div className="space-y-2.5">
        <button onClick={() => navigate('/players')} className="w-full">
          <Card hover className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <Crown className="w-4 h-4 text-slate-500 dark:text-slate-300" />
            </div>
            <span className="flex-1 text-left text-sm font-semibold text-primary dark:text-white">
              Team Members
            </span>
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
          </Card>
        </button>
        <button onClick={() => navigate('/matches')} className="w-full">
          <Card hover className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-slate-500 dark:text-slate-300" />
            </div>
            <span className="flex-1 text-left text-sm font-semibold text-primary dark:text-white">
              Match History
            </span>
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
          </Card>
        </button>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={pwOpen} onClose={() => setPwOpen(false)} title="Change Password">
        <div className="space-y-4">
          <div>
            <label className="label-base">Current Password *</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              className="input-base w-full"
              autoFocus
            />
          </div>
          <div>
            <label className="label-base">New Password *</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 4 characters"
              className="input-base w-full"
            />
          </div>
          <div>
            <label className="label-base">Confirm New Password *</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="input-base w-full"
            />
          </div>
          {newPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-red-500">Passwords do not match</p>
          )}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" fullWidth onClick={() => setPwOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="success"
              fullWidth
              onClick={handleChangePassword}
              loading={changePassword.isPending}
              disabled={!currentPassword || newPassword.length < 4 || newPassword !== confirmPassword}
            >
              <Lock className="w-4 h-4" /> Update Password
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}