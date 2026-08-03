import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, HelpCircle, Smile, MapPin, CalendarDays, Trophy, Sparkles, Hourglass, Users, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { AvailabilityBadge } from '@/components/ui/Badge';
import { useAvailabilityMutation } from '@/hooks/useMutations';
import { useAuth } from '@/context/AuthContext';
import { formatDate, formatTime } from '@/lib/utils';
import * as api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { AvailabilityEntry, AvailabilityStatus, Match } from '@/types';

const STATUS_COLORS: Record<AvailabilityStatus, string> = {
  AVAILABLE: 'bg-emerald-500',
  UNAVAILABLE: 'bg-red-400',
  PENDING: 'bg-slate-300 dark:bg-slate-600',
  MAYBE: 'bg-amber-400',
};

const myStatusLabel = (s?: AvailabilityStatus) =>
  s === 'AVAILABLE' ? 'Playing' : s === 'UNAVAILABLE' ? 'Not Playing' : s === 'MAYBE' ? 'Maybe' : 'No response';

export default function Availability() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const availabilityMutation = useAvailabilityMutation();
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: () => api.getMatches(),
  });

  const upcoming = (matches ?? []).filter((m) => m.status === 'UPCOMING');
  const completed = (matches ?? []).filter((m) => m.status === 'COMPLETED');

  // Default selection: first upcoming match (or last completed)
  const activeMatchId = selectedMatchId ?? upcoming[0]?.id ?? completed[0]?.id ?? null;
  const activeMatch = upcoming.find((m) => m.id === activeMatchId) ?? completed.find((m) => m.id === activeMatchId) ?? null;

  // Per-match availability query with a key the mutation invalidates → instant refresh
  const { data: entries, isLoading: entriesLoading } = useQuery({
    queryKey: ['availability', activeMatchId],
    queryFn: () => api.getAvailability(activeMatchId!),
    enabled: !!activeMatchId,
  });

  const myStatus = (entries ?? []).find((e) => e.playerId === user?.id)?.status;
  const counts: Record<AvailabilityStatus, number> = { AVAILABLE: 0, UNAVAILABLE: 0, PENDING: 0, MAYBE: 0 };
  (entries ?? []).forEach((e) => { counts[e.status]++; });
  const total = counts.AVAILABLE + counts.UNAVAILABLE + counts.PENDING + counts.MAYBE;

  // Optimistic update for instant highlight + immediate squad refresh
  const handleSelect = (matchId: string, status: AvailabilityStatus) => {
    queryClient.setQueryData<AvailabilityEntry[]>(['availability', matchId], (old) => {
      const l = old ?? [];
      const exists = l.some((e) => e.playerId === user?.id);
      if (exists) {
        return l.map((e) => (e.playerId === user?.id ? { ...e, status } : e));
      }
      return [...l, { matchId, playerId: user?.id ?? '', playerName: user?.name ?? 'You', status, respondedAt: new Date().toISOString() }];
    });
    availabilityMutation.mutate({ matchId, status });
  };

  const handleSelectMatch = (id: string) => setSelectedMatchId(id);

  // Loading state
  if (matchesLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  // No matches scheduled — motivational empty state
  if (upcoming.length === 0 && completed.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-primary dark:text-white">Availability</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Confirm your availability for upcoming fixtures</p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/85 to-emerald-900/70" />
          <div className="relative p-8 sm:p-10 text-center text-white">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-glow items-center justify-center mb-5">
              <Hourglass className="w-8 h-8 text-white" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold mb-3">No Matches Scheduled Yet!</h2>
            <p className="text-emerald-200/90 max-w-md mx-auto text-sm leading-relaxed">
              The captain is cooking up something exciting 🏏 Keep your pads ready and stay tuned — the next big game is on its way!
            </p>
            <div className="flex items-center justify-center gap-2 mt-6 text-xs font-semibold text-emerald-300/80">
              <Sparkles className="w-4 h-4" /> Your team is gearing up for the next battle <Sparkles className="w-4 h-4" />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const bigButtons: { status: AvailabilityStatus; label: string; icon: typeof CheckCircle2; activeClass: string; staticClass: string; dot: string }[] = [
    {
      status: 'AVAILABLE',
      label: 'Playing',
      icon: CheckCircle2,
      activeClass: 'bg-emerald-500 text-white shadow-glow border-emerald-500',
      staticClass: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
      dot: 'bg-emerald-500',
    },
    {
      status: 'UNAVAILABLE',
      label: 'Not Playing',
      icon: XCircle,
      activeClass: 'bg-red-500 text-white shadow-lg shadow-red-500/30 border-red-500',
      staticClass: 'bg-red-50 dark:bg-red-500/10 text-red-500 border-red-200 dark:border-red-500/30',
      dot: 'bg-red-400',
    },
    {
      status: 'MAYBE',
      label: 'Maybe',
      icon: HelpCircle,
      activeClass: 'bg-amber-400 text-white shadow-lg shadow-amber-500/30 border-amber-400',
      staticClass: 'bg-amber-50 dark:bg-amber-500/10 text-amber-500 border-amber-200 dark:border-amber-500/30',
      dot: 'bg-amber-400',
    },
  ];

  const selectedMatchUpcoming = upcoming.some((m) => m.id === activeMatchId);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-primary dark:text-white">Availability</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {upcoming.length} match{upcoming.length !== 1 ? 'es' : ''} scheduled — tap a match below to see the squad
        </p>
      </div>

      {/* ── Match selector at the top ── */}
      {upcoming.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" /> Upcoming Matches
          </p>
          <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
            {upcoming.map((m) => {
              const isActive = m.id === activeMatchId;
              const mCounts: Record<AvailabilityStatus, number> = { AVAILABLE: 0, UNAVAILABLE: 0, PENDING: 0, MAYBE: 0 };
              // Counts come from the selected match query only for the active card; for chips use a lightweight indicator
              const mTotal = isActive ? total : 0;
              return (
                <motion.button
                  key={m.id}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleSelectMatch(m.id)}
                  className={cn(
                    'snap-start shrink-0 min-w-[170px] max-w-[220px] rounded-2xl border-2 p-3 text-left transition-all duration-200',
                    isActive
                      ? 'border-emerald-500 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 shadow-lg shadow-emerald-500/10'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-300 dark:hover:border-emerald-600',
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={cn('text-[10px] font-bold uppercase tracking-wider', isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400')}>
                      {formatDate(m.date)}
                    </span>
                    {isActive && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                  </div>
                  <p className={cn('font-display font-bold text-sm truncate', isActive ? 'text-primary dark:text-white' : 'text-slate-600 dark:text-slate-300')}>
                    VS {m.opponent}
                  </p>
                  <p className={cn('text-[11px] mt-0.5 flex items-center gap-1', isActive ? 'text-emerald-600/80 dark:text-emerald-400/80' : 'text-slate-400')}>
                    <Clock className="w-3 h-3" /> {formatTime(m.time)}
                  </p>
                  {mTotal > 0 && (
                    <div className="flex h-1.5 rounded-full overflow-hidden mt-2 bg-slate-100 dark:bg-slate-700">
                      {(['AVAILABLE', 'MAYBE', 'PENDING', 'UNAVAILABLE'] as AvailabilityStatus[]).map((s) => (
                        <motion.div
                          key={s}
                          initial={{ width: 0 }}
                          animate={{ width: `${(mCounts[s] / mTotal) * 100}%` }}
                          className={STATUS_COLORS[s]}
                        />
                      ))}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Selected match card ── */}
      <AnimatePresence mode="wait">
        {activeMatch && (
          <motion.div
            key={activeMatch.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <Card className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0 shadow-glow">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="font-display font-bold text-primary dark:text-white truncate">VS {activeMatch.opponent}</h2>
                    <span className="shrink-0 text-xs font-semibold text-slate-400">{formatDate(activeMatch.date)}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatTime(activeMatch.time)}
                    {activeMatch.venue?.name && (
                      <>
                        <span className="mx-1">•</span>
                        <MapPin className="w-3 h-3" /> {activeMatch.venue.name}
                      </>
                    )}
                  </p>
                  {selectedMatchUpcoming && total > 0 && (
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex h-2 rounded-full overflow-hidden flex-1 bg-slate-100 dark:bg-slate-700">
                        {(['AVAILABLE', 'MAYBE', 'PENDING', 'UNAVAILABLE'] as AvailabilityStatus[]).map((s) => (
                          <motion.div
                            key={s}
                            initial={{ width: 0 }}
                            animate={{ width: `${(counts[s] / total) * 100}%` }}
                            transition={{ duration: 0.4 }}
                            className={STATUS_COLORS[s]}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-primary dark:text-white">
                        {counts.AVAILABLE}<span className="text-slate-400 font-medium">/{total}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {selectedMatchUpcoming && (
                <>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-5 mb-3">
                    Your availability
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {bigButtons.map(({ status, label, icon: Icon, activeClass, staticClass, dot }) => {
                      const isActive = myStatus === status;
                      const isMutating = availabilityMutation.isPending && availabilityMutation.variables?.matchId === activeMatch.id && availabilityMutation.variables?.status === status;
                      return (
                        <motion.button
                          key={status}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSelect(activeMatch.id, status)}
                          disabled={isMutating}
                          className={cn(
                            'flex flex-col items-center gap-2 py-3.5 rounded-2xl border-2 transition-all duration-200',
                            isActive ? activeClass : staticClass,
                          )}
                        >
                          {isMutating ? (
                            <div className="w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                          <span className="text-xs font-bold">{label}</span>
                          {isActive && (
                            <span className="text-[10px] font-semibold opacity-90 flex items-center gap-1">
                              <span className={cn('w-1.5 h-1.5 rounded-full', dot)} /> Selected
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                  {myStatus && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 text-center font-medium">
                      ✓ You marked yourself as {myStatusLabel(myStatus)}
                    </p>
                  )}
                </>
              )}

              {!selectedMatchUpcoming && (
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <CalendarDays className="w-4 h-4" /> This match is completed — result: {activeMatch.result ?? 'Pending'}
                </div>
              )}
            </Card>

            {/* Squad responses for the selected match */}
            {entriesLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : (entries ?? []).length > 0 ? (
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-primary dark:text-white mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-500" />
                  Squad Responses ({entries!.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(['AVAILABLE', 'MAYBE', 'PENDING', 'UNAVAILABLE'] as AvailabilityStatus[]).map((s) => {
                    const group = (entries ?? []).filter((e) => e.status === s);
                    if (group.length === 0) return null;
                    return (
                      <div key={s} className="flex-1 min-w-[160px] rounded-xl p-3 bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <span className={cn('w-2 h-2 rounded-full', STATUS_COLORS[s])} />
                          {s === 'AVAILABLE' ? 'Playing' : s === 'UNAVAILABLE' ? 'Not Playing' : s === 'MAYBE' ? 'Maybe' : 'Pending'}
                          <span className="text-slate-400 font-semibold">({group.length})</span>
                        </p>
                        <div className="space-y-2">
                          {group.map((e) => (
                            <div key={e.playerId} className="flex items-center gap-2">
                              <Avatar name={e.playerName} size="xs" />
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-primary dark:text-white truncate">{e.playerName}</p>
                                <p className="text-[10px] text-slate-400">
                                  {e.respondedAt && e.status !== 'PENDING'
                                    ? new Date(e.respondedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
                                    : 'Awaiting response'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ) : selectedMatchUpcoming ? (
              <Card className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                <Smile className="w-6 h-6 mx-auto mb-2 text-slate-300 dark:text-slate-500" />
                No responses yet — be the first to confirm!
              </Card>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Past matches quick list */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Past Matches
          </h2>
          <div className="space-y-2">
            {completed.map((m) => (
              <button
                key={m.id}
                onClick={() => handleSelectMatch(m.id)}
                className={cn(
                  'w-full text-left rounded-2xl border-2 transition-all duration-200 p-4 flex items-center gap-3',
                  m.id === activeMatchId
                    ? 'border-emerald-500 bg-emerald-500/5'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-300 dark:hover:border-emerald-600',
                )}
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary dark:text-white truncate">VS {m.opponent}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(m.date)} • {m.result ?? 'Completed'}
                  </p>
                </div>
                <AvailabilityBadge status={m.result === 'WON' ? 'AVAILABLE' : 'UNAVAILABLE'} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}