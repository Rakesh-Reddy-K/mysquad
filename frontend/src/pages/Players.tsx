import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, ChevronRight, Crown, UserPlus, Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AddPlayerDialog } from '@/components/manage/ManageDialogs';
import { useAuth } from '@/context/AuthContext';
import { useUpdatePlayerMutation, useDeletePlayerMutation } from '@/hooks/useMutations';
import * as api from '@/lib/api';
import type { Player } from '@/types';
import { cn } from '@/lib/utils';

type RoleFilter = 'All' | 'Batsman' | 'Bowler' | 'All Rounder' | 'Wicket Keeper';

export default function Players() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<RoleFilter>('All');
  const [addOpen, setAddOpen] = useState(false);
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Player | null>(null);

  const { data: players, isLoading } = useQuery({
    queryKey: ['players'],
    queryFn: api.getPlayers,
  });

  const filtered = useMemo(() => {
    if (!players) return [];
    return players.filter(
      (p) =>
        (role === 'All' || p.role === role) &&
        p.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [players, role, search]);

  const roles: RoleFilter[] = ['All', 'Batsman', 'Bowler', 'All Rounder', 'Wicket Keeper'];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-primary dark:text-white">Players</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{players?.length ?? 0} squad members</p>
        </div>
        {user?.isCaptain && (
          <Button variant="success" size="sm" onClick={() => setAddOpen(true)}>
            <UserPlus className="w-4 h-4" /> Add
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search players..."
          className="input-base pl-10"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {roles.map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={cn(
              'shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors',
              role === r
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
            )}
          >
            {r}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((player, i) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card hover className="p-3.5 flex items-center gap-3">
                <Link to={`/players/${player.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative">
                    <Avatar name={player.name} size="md" />
                    {player.isCaptain && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow">
                        <Crown className="w-3 h-3 text-white" />
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-primary dark:text-white truncate">
                      {player.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {player.role} • {player.battingStyle} bat
                    </p>
                  </div>
                  <Badge
                    variant={
                      player.availability >= 80 ? 'success' : player.availability >= 50 ? 'warning' : 'danger'
                    }
                  >
                    {player.availability}%
                  </Badge>
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                </Link>

                {/* Captain edit/delete controls */}
                {user?.isCaptain && !player.isCaptain && (
                  <div className="flex items-center gap-1 ml-1">
                    <button
                      onClick={() => setEditPlayer(player)}
                      className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-500 transition-colors"
                      title="Edit player"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(player)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-colors"
                      title="Remove player"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <AddPlayerDialog open={addOpen} onClose={() => setAddOpen(false)} />

      {/* Edit Player Dialog */}
      {editPlayer && (
        <EditPlayerDialog player={editPlayer} onClose={() => setEditPlayer(null)} />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <DeletePlayerDialog player={deleteConfirm} onClose={() => setDeleteConfirm(null)} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Edit Player Dialog                                                  */
/* ------------------------------------------------------------------ */

function EditPlayerDialog({ player, onClose }: { player: Player; onClose: () => void }) {
  const updateMutation = useUpdatePlayerMutation();
  const [name, setName] = useState(player.name);
  const [role, setRole] = useState<string>(player.role);
  const [battingStyle, setBattingStyle] = useState<string>(player.battingStyle || '');
  const [bowlingStyle, setBowlingStyle] = useState<string>(player.bowlingStyle || '');
  const [phone, setPhone] = useState(player.phone || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Player name is required';
    const phoneDigits = phone.replace(/\D/g, '');
    if (!phone.trim()) {
      errs.phone = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
      errs.phone = 'Enter a valid 10-digit mobile number';
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    updateMutation.mutate(
      {
        id: String(player.id),
        input: {
          name,
          role,
          battingStyle: battingStyle || undefined,
          bowlingStyle: bowlingStyle || undefined,
          phone: phone || undefined,
        },
      },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6"
      >
        <h2 className="font-display text-lg font-bold text-primary dark:text-white mb-4">Edit Player</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="input-base" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="input-base">
                <option value="Batsman">Batsman</option>
                <option value="Bowler">Bowler</option>
                <option value="All Rounder">All Rounder</option>
                <option value="Wicket Keeper">Wicket Keeper</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Mobile Number *</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-base" />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Batting Style</label>
              <input type="text" value={battingStyle} onChange={(e) => setBattingStyle(e.target.value)} placeholder="Right/Left" className="input-base" />
            </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Bowling Style</label>
            <input type="text" value={bowlingStyle} onChange={(e) => setBowlingStyle(e.target.value)} placeholder="e.g. Fast" className="input-base" />
          </div>
        </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="success" loading={updateMutation.isPending}>Save</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Delete Player Dialog                                                */
/* ------------------------------------------------------------------ */

function DeletePlayerDialog({ player, onClose }: { player: Player; onClose: () => void }) {
  const deleteMutation = useDeletePlayerMutation();

  const handleConfirm = () => {
    deleteMutation.mutate(String(player.id), { onSuccess: () => onClose() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6"
      >
        <h2 className="font-display text-lg font-bold text-primary dark:text-white mb-2">Remove Player</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Are you sure you want to remove <span className="font-semibold text-primary dark:text-white">{player.name}</span> from the squad? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant="danger"
            loading={deleteMutation.isPending}
            onClick={handleConfirm}
          >
            Remove
          </Button>
        </div>
      </motion.div>
    </div>
  );
}