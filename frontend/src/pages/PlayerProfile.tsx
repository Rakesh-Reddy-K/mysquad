import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronLeft, Phone, Mail, Trophy, Target, Activity, CalendarDays } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import * as api from '@/lib/api';

export default function PlayerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: player, isLoading } = useQuery({
    queryKey: ['player', id],
    queryFn: () => api.getPlayerById(id!),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!player) return null;

  const stats = [
    { label: 'Matches', value: player.matches, icon: CalendarDays },
    { label: 'Runs', value: player.runs, icon: Activity },
    { label: 'Wickets', value: player.wickets, icon: Target },
  ];

  return (
    <div className="space-y-5">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      {/* Profile hero */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <Avatar name={player.name} size="xl" ring />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-primary dark:text-white mb-1">
            {player.name}
          </h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="info">{player.role}</Badge>
            {player.isCaptain && <Badge variant="warning">Captain</Badge>}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 mb-1">
            <Phone className="w-3.5 h-3.5" /> {player.phone}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
            <Mail className="w-3.5 h-3.5" /> {player.email}
          </p>
        </Card>
      </motion.div>

      {/* Batting/Bowling */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Batting</p>
          <p className="text-sm font-semibold text-primary dark:text-white">{player.battingStyle}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Bowling</p>
          <p className="text-sm font-semibold text-primary dark:text-white">{player.bowlingStyle}</p>
        </Card>
      </div>

      {/* Stats */}
      <Card className="p-5">
        <h2 className="font-display font-bold text-primary dark:text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-emerald-500" /> Career Stats
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="w-9 h-9 mx-auto rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-1.5">
                <Icon className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="font-display text-xl font-extrabold text-primary dark:text-white">{value}</p>
              <p className="text-xs text-slate-400">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Availability</span>
            <span className="text-sm font-bold text-emerald-500">{player.availability}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${player.availability}%` }}
              transition={{ duration: 0.8 }}
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}