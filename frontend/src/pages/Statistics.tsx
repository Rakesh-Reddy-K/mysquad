import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, XCircle, MinusCircle, Percent, CalendarDays, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import * as api from '@/lib/api';

export default function Statistics() {
  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: api.getMatches,
  });

  const { data: players, isLoading: playersLoading } = useQuery({
    queryKey: ['players'],
    queryFn: api.getPlayers,
  });

  const stats = useMemo(() => {
    const completed = (matches ?? []).filter((m) => m.status === 'COMPLETED');
    const won = completed.filter((m) => m.result === 'WON').length;
    const lost = completed.filter((m) => m.result === 'LOST').length;
    const tied = completed.filter((m) => m.result === 'TIE').length;
    const abandoned = completed.filter((m) => m.result === 'ABANDONED').length;
    const decided = won + lost + tied;
    const winRate = decided > 0 ? Math.round((won / decided) * 100) : 0;
    const upcoming = (matches ?? []).filter((m) => m.status === 'UPCOMING').length;
    return { completed: completed.length, won, lost, tied, abandoned, decided, winRate, upcoming };
  }, [matches]);

  const topBatters = useMemo(
    () => [...(players ?? [])].sort((a, b) => b.runs - a.runs).slice(0, 3),
    [players],
  );

  const topBowlers = useMemo(
    () => [...(players ?? [])].sort((a, b) => b.wickets - a.wickets).slice(0, 3),
    [players],
  );

  const statCards = [
    {
      label: 'Matches Played',
      value: stats.completed,
      icon: CalendarDays,
      color: 'bg-blue-500',
      glow: 'shadow-lg shadow-blue-500/25',
    },
    {
      label: 'Wins',
      value: stats.won,
      icon: Trophy,
      color: 'bg-emerald-500',
      glow: 'shadow-lg shadow-emerald-500/25',
    },
    {
      label: 'Losses',
      value: stats.lost,
      icon: XCircle,
      color: 'bg-red-500',
      glow: 'shadow-lg shadow-red-500/25',
    },
    {
      label: 'Win Rate',
      value: `${stats.winRate}%`,
      icon: Percent,
      color: 'bg-violet-500',
      glow: 'shadow-lg shadow-violet-500/25',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-primary dark:text-white">Statistics</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Team performance and player records</p>
      </div>

      {matchesLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : stats.completed > 0 ? (
        <>
          {/* Record summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {statCards.map(({ label, value, icon: Icon, color, glow }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <Card hover className="p-4">
                  <div className={`w-10 h-10 rounded-xl ${color} ${glow} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-display text-2xl font-extrabold text-primary dark:text-white leading-none">
                    {value}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Win/Loss bar */}
          <Card className="p-5">
            <h2 className="font-display font-bold text-primary dark:text-white flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Win / Loss Record
            </h2>
            {stats.decided > 0 ? (
              <>
                <div className="flex h-4 rounded-full overflow-hidden mb-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(stats.won / stats.decided) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="bg-emerald-500"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(stats.tied / stats.decided) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="bg-amber-400"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(stats.lost / stats.decided) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="bg-red-400"
                  />
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs font-medium">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Won {stats.won}
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Tied {stats.tied}
                  </span>
                  <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Lost {stats.lost}
                  </span>
                  {stats.abandoned > 0 && (
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <MinusCircle className="w-3 h-3" /> Abandoned {stats.abandoned}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No decided results yet. Mark results from the Matches page to see the record.
              </p>
            )}
          </Card>
        </>
      ) : (
        <EmptyState
          icon={Trophy}
          title="No completed matches yet"
          description="Once you mark a match as Won or Lost, your team's stats will appear here."
        />
      )}

      {/* Player performance */}
      {!playersLoading && players && players.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top batters */}
          <Card className="p-5">
            <h2 className="font-display font-bold text-primary dark:text-white flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-amber-500" />
              Top Performers — Batting
            </h2>
            <div className="space-y-3">
              {topBatters.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="w-6 text-sm font-bold text-slate-400">{i + 1}</span>
                  <Avatar name={p.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-primary dark:text-white truncate">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.matches} matches</p>
                  </div>
                  <Badge variant="success">{p.runs} runs</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Top bowlers */}
          <Card className="p-5">
            <h2 className="font-display font-bold text-primary dark:text-white flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-emerald-500" />
              Top Performers — Bowling
            </h2>
            <div className="space-y-3">
              {topBowlers.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="w-6 text-sm font-bold text-slate-400">{i + 1}</span>
                  <Avatar name={p.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-primary dark:text-white truncate">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.matches} matches</p>
                  </div>
                  <Badge variant="info">{p.wickets} wkts</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
