import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  MapPin,
  CalendarDays,
  Clock,
  Trophy,
  Users,
  CheckCircle2,
  XCircle,
  Clock3,
  ExternalLink,
  ChevronLeft,
  Megaphone,
  Pencil,
  Trash2,
  Trophy as ResultIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { formatDate, formatTime } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  useUpdateMatchResultMutation,
  useDeleteMatchMutation,
} from '@/hooks/useMutations';
import { EditMatchDialog } from '@/components/manage/ManageDialogs';
import * as api from '@/lib/api';

export default function MatchDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resultOpen, setResultOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [result, setResult] = useState('WON');
  const [score, setScore] = useState('');
  const [mom, setMom] = useState('');
  const updateResultMutation = useUpdateMatchResultMutation();
  const deleteMatchMutation = useDeleteMatchMutation();

  const { data: match, isLoading } = useQuery({
    queryKey: ['match', id],
    queryFn: () => api.getMatchById(id!),
  });

  const { data: availability } = useQuery({
    queryKey: ['availability', id],
    queryFn: () => api.getAvailability(id!),
    enabled: !!id,
  });

  const available = availability?.filter((a) => a.status === 'AVAILABLE') ?? [];
  const unavailable = availability?.filter((a) => a.status === 'UNAVAILABLE') ?? [];
  const pending = availability?.filter((a) => a.status === 'PENDING') ?? [];
  const maybe = availability?.filter((a) => a.status === 'MAYBE') ?? [];

  const handleUpdateResult = () => {
    if (!id) return;
    updateResultMutation.mutate(
      {
        id,
        input: {
          result,
          score: score.trim() || undefined,
          mom: mom.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setResultOpen(false);
          setResult('WON');
          setScore('');
          setMom('');
        },
      },
    );
  };

  const handleDelete = () => {
    if (!id) return;
    deleteMatchMutation.mutate(id, {
      onSuccess: () => navigate('/matches'),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!match) return null;

  const isCaptain = user?.isCaptain;
  const isUpcoming = match.status === 'UPCOMING';

  return (
    <div className="space-y-5">
      {/* Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        {isCaptain && (
          <div className="flex items-center gap-2">
            {isUpcoming && (
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="w-4 h-4" /> Edit
              </Button>
            )}
            {!isUpcoming && (
              <Button variant="outline" size="sm" onClick={() => setResultOpen(true)}>
                <ResultIcon className="w-4 h-4" /> {match.result ? 'Edit Result' : 'Mark Result'}
              </Button>
            )}
            <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="w-4 h-4" /> Delete
            </Button>
          </div>
        )}
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${match.groundImage}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/85 to-blue-900/60" />
        <div className="relative p-6 sm:p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
              {isUpcoming ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ) : null}
              {isUpcoming ? 'Upcoming Match' : `${match.result ?? 'Completed'}`}
            </span>
            {match.result && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  match.result === 'WON'
                    ? 'bg-emerald-500 text-white'
                    : match.result === 'LOST'
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-500 text-white'
                }`}
              >
                {match.result}
              </span>
            )}
          </div>

          <h1 className="font-display text-3xl font-extrabold mb-4">VS {match.opponent}</h1>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 flex items-center gap-2.5">
              <CalendarDays className="w-4 h-4 text-emerald-300" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/60">Date</p>
                <p className="text-sm font-semibold">{formatDate(match.date)}</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-emerald-300" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/60">Time</p>
                <p className="text-sm font-semibold">{formatTime(match.time)}</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-emerald-300" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/60">Venue</p>
                <p className="text-sm font-semibold">{match.venue?.name ?? 'Venue TBD'}</p>
              </div>
            </div>
          </div>

          {match.venue?.mapsUrl && (
            <a
              href={match.venue.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-sm font-semibold transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open in Google Maps
            </a>
          )}
        </div>
      </motion.div>

      {/* Captain note */}
      {match.captainNote && (
        <Card className="p-4 flex items-start gap-3">
          <Megaphone className="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-primary dark:text-white mb-0.5">Captain's Note</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{match.captainNote}</p>
          </div>
        </Card>
      )}

      {/* Result / Score */}
      {match.score && (
        <Card className="p-5">
          <h2 className="font-display font-bold text-primary dark:text-white flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-emerald-500" />
            Match Result
          </h2>
          <p className="text-lg font-bold text-primary dark:text-white">{match.score}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Man of the Match: <span className="font-semibold text-amber-500">{match.mom} 🏆</span>
          </p>
        </Card>
      )}

      {/* Availability summary */}
      {availability && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-primary dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              Availability ({availability.length})
            </h2>
            <Link to="/availability">
              <Badge variant="neutral">Manage</Badge>
            </Link>
          </div>

          {/* Progress bars */}
          <div className="space-y-2 mb-5">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Available — {available.length}
              <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 ml-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(available.length / availability.length) * 100}%` }}
                  className="h-full bg-emerald-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <Clock3 className="w-3.5 h-3.5 text-amber-500" />
              Maybe — {maybe.length}
              <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 ml-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(maybe.length / availability.length) * 100}%` }}
                  className="h-full bg-amber-400"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Pending — {pending.length}
              <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 ml-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(pending.length / availability.length) * 100}%` }}
                  className="h-full bg-slate-300 dark:bg-slate-600"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <XCircle className="w-3.5 h-3.5 text-red-500" />
              Not Available — {unavailable.length}
              <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 ml-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(unavailable.length / availability.length) * 100}%` }}
                  className="h-full bg-red-400"
                />
              </div>
            </div>
          </div>

          {/* Player lists */}
          {available.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
                Available ({available.length})
              </p>
              <div className="space-y-2">
                {available.map((a) => (
                  <div key={a.playerId} className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="flex-1 text-sm text-primary dark:text-white">{a.playerName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {unavailable.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">
                Not Available ({unavailable.length})
              </p>
              <div className="space-y-2">
                {unavailable.map((a) => (
                  <div key={a.playerId} className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="flex-1 text-sm text-primary dark:text-white">{a.playerName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pending.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Pending ({pending.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {pending.map((a) => (
                  <span
                    key={a.playerId}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300"
                  >
                    <Clock className="w-3 h-3" />
                    {a.playerName}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Update Result Dialog */}
      <Dialog open={resultOpen} onClose={() => setResultOpen(false)} title="Update Match Result">
        <div className="space-y-4">
          <div>
            <label className="label-base">Result *</label>
            <select value={result} onChange={(e) => setResult(e.target.value)} className="input-base w-full">
              <option value="WON">Won 🏆</option>
              <option value="LOST">Lost 😞</option>
              <option value="TIE">Tied</option>
              <option value="ABANDONED">Abandoned</option>
            </select>
          </div>
          <div>
            <label className="label-base">Score (e.g. 168/6 vs 162/8)</label>
            <input
              type="text"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="168/6"
              className="input-base w-full"
            />
          </div>
          <div>
            <label className="label-base">Man of the Match</label>
            <input
              type="text"
              value={mom}
              onChange={(e) => setMom(e.target.value)}
              placeholder="e.g. Rakesh"
              className="input-base w-full"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" fullWidth onClick={() => setResultOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="success"
              fullWidth
              onClick={handleUpdateResult}
              loading={updateResultMutation.isPending}
            >
              <ResultIcon className="w-4 h-4" /> Save Result
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Edit Match Dialog */}
      <EditMatchDialog open={editOpen} onClose={() => setEditOpen(false)} match={match} />

      {/* Delete confirm */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Match">
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          Are you sure you want to delete this match vs {match.opponent}? All availability responses will also be removed.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={handleDelete}
            loading={deleteMatchMutation.isPending}
          >
            <Trash2 className="w-4 h-4" /> Delete Match
          </Button>
        </div>
      </Dialog>
    </div>
  );
}