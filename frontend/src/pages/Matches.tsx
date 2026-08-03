import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MapPin, ChevronRight, CalendarDays, Trophy, XCircle, Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ScheduleMatchDialog } from '@/components/manage/ManageDialogs';
import { useAuth } from '@/context/AuthContext';
import { formatDate, formatTime } from '@/lib/utils';
import * as api from '@/lib/api';
import type { Match } from '@/types';

const statusVariant = (status: string) =>
  status === 'UPCOMING' ? 'success' : status === 'COMPLETED' ? 'info' : 'danger';

const resultLabel = (result?: string) =>
  result === 'WON' ? 'Won' : result === 'LOST' ? 'Lost' : result === 'TIE' ? 'Tied' : 'Abandoned';

export default function Matches() {
  const { user } = useAuth();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const { data: matches, isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: api.getMatches,
  });

  const upcoming = matches?.filter((m) => m.status === 'UPCOMING') ?? [];
  const completed = matches?.filter((m) => m.status === 'COMPLETED') ?? [];

  const MatchCard = ({ match, index }: { match: Match; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Link to={`/matches/${match.id}`}>
        <Card hover className="p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center flex-shrink-0">
            {match.result === 'WON' ? (
              <Trophy className="w-6 h-6 text-emerald-500" />
            ) : match.result === 'LOST' ? (
              <XCircle className="w-6 h-6 text-red-500" />
            ) : (
              <CalendarDays className="w-6 h-6 text-slate-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-primary dark:text-white truncate">
                VS {match.opponent}
              </h3>
              <Badge variant={statusVariant(match.status)}>
                {match.status === 'UPCOMING'
                  ? 'Upcoming'
                  : match.status === 'COMPLETED'
                    ? match.result ? resultLabel(match.result) : 'Completed'
                    : 'Cancelled'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formatDate(match.date)} • {formatTime(match.time)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              {match.venue?.name ?? 'Venue TBD'}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
        </Card>
      </Link>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-primary dark:text-white">Matches</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">All your scheduled and past fixtures</p>
        </div>
        {user?.isCaptain && (
          <Button variant="success" size="sm" onClick={() => setScheduleOpen(true)}>
            <Plus className="w-4 h-4" /> Schedule
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Upcoming
              </h2>
              <div className="space-y-3">
                {upcoming.map((m, i) => (
                  <MatchCard key={m.id} match={m} index={i} />
                ))}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Completed
              </h2>
              <div className="space-y-3">
                {completed.map((m, i) => (
                  <MatchCard key={m.id} match={m} index={i} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <ScheduleMatchDialog open={scheduleOpen} onClose={() => setScheduleOpen(false)} />
    </div>
  );
}
