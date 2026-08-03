import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Megaphone, Plus, Paperclip, X, Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
} from '@/hooks/useMutations';
import { useAuth } from '@/context/AuthContext';
import * as api from '@/lib/api';
import type { Announcement } from '@/types';

export default function Announcements() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [deleting, setDeleting] = useState<Announcement | null>(null);
  const createMutation = useCreateAnnouncementMutation();
  const updateMutation = useUpdateAnnouncementMutation();
  const deleteMutation = useDeleteAnnouncementMutation();

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: api.getAnnouncements,
  });

  const handleSubmit = () => {
    if (!text.trim()) return;
    createMutation.mutate(
      { message: text.trim() },
      {
        onSuccess: () => {
          setText('');
          setOpen(false);
        },
      },
    );
  };

  const handleUpdate = () => {
    if (!editing || !text.trim()) return;
    updateMutation.mutate(
      { id: editing.id, message: text.trim() },
      {
        onSuccess: () => {
          setText('');
          setEditing(null);
          setOpen(false);
        },
      },
    );
  };

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => setDeleting(null),
    });
  };

  const startEdit = (ann: Announcement) => {
    setEditing(ann);
    setText(ann.message);
    setOpen(true);
  };

  return (
    <div className="space-y-5 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-primary dark:text-white">Announcements</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Team updates from the captain</p>
        </div>
        {user?.isCaptain && (
          <Button variant="success" size="sm" onClick={() => { setEditing(null); setText(''); setOpen(true); }}>
            <Plus className="w-4 h-4" /> New
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : announcements && announcements.length > 0 ? (
        <div className="space-y-3">
          {announcements.map((ann, i) => (
            <motion.div
              key={ann.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className="p-4 flex items-start gap-3">
                <Avatar name={ann.author} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-primary dark:text-white">{ann.author}</span>
                    {user?.isCaptain && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                        Captain
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      {new Date(ann.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{ann.message}</p>
                </div>
                {user?.isCaptain && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => startEdit(ann)}
                      className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                      aria-label="Edit announcement"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleting(ann)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      aria-label="Delete announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Megaphone}
          title="No announcements yet"
          description="The captain hasn't posted anything yet."
        />
      )}

      {/* Create / Edit dialog */}
      <Dialog open={open} onClose={() => { setOpen(false); setEditing(null); }} title={editing ? 'Edit Announcement' : 'New Announcement'}>
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Please be on time for the match!"
            className="input-base w-full resize-none"
            autoFocus
          />
          <button
            className="absolute bottom-3 right-3 p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            aria-label="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-3 mt-4">
          <Button variant="outline" fullWidth onClick={() => { setOpen(false); setEditing(null); }}>
            <X className="w-4 h-4" /> Cancel
          </Button>
          <Button
            variant="success"
            fullWidth
            onClick={editing ? handleUpdate : handleSubmit}
            loading={editing ? updateMutation.isPending : createMutation.isPending}
            disabled={!text.trim()}
          >
            {editing ? 'Update Announcement' : 'Post Announcement'}
          </Button>
        </div>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleting} onClose={() => setDeleting(null)} title="Delete Announcement">
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          Are you sure you want to delete this announcement? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={() => setDeleting(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={handleDelete}
            loading={deleteMutation.isPending}
          >
            <Trash2 className="w-4 h-4" /> Delete
          </Button>
        </div>
      </Dialog>
    </div>
  );
}