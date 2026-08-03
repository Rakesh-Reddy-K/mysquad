import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MapPin, Car, Ticket, ExternalLink, Heart, Plus, Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AddVenueDialog } from '@/components/manage/ManageDialogs';
import { useAuth } from '@/context/AuthContext';
import { useToggleVenueFavoriteMutation, useUpdateVenueMutation, useDeleteVenueMutation } from '@/hooks/useMutations';
import * as api from '@/lib/api';
import type { Venue } from '@/types';
import { cn } from '@/lib/utils';

export default function Venues() {
  const { user } = useAuth();
  const [addOpen, setAddOpen] = useState(false);
  const [editVenue, setEditVenue] = useState<Venue | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Venue | null>(null);

  const { data: venues, isLoading } = useQuery({
    queryKey: ['venues'],
    queryFn: api.getVenues,
  });

  const favoriteMutation = useToggleVenueFavoriteMutation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-primary dark:text-white">Venues</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Your most-used cricket grounds</p>
        </div>
        {user?.isCaptain && (
          <Button variant="success" size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4" /> Add
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {venues?.map((venue, i) => (
            <motion.div
              key={venue.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card hover className="overflow-hidden">
                <div className="relative h-44">
                  <img
                    src={venue.imageUrl}
                    alt={venue.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                  {/* Captain edit/delete controls */}
                  {user?.isCaptain && (
                    <div className="absolute top-3 left-3 flex items-center gap-1">
                      <button
                        onClick={() => setEditVenue(venue)}
                        className="p-2 rounded-lg bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors"
                        title="Edit venue"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(venue)}
                        className="p-2 rounded-lg bg-white/20 backdrop-blur-md text-red-300 hover:bg-red-500/30 transition-colors"
                        title="Delete venue"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => favoriteMutation.mutate(venue.id)}
                    className={cn(
                      'absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all',
                      venue.favorite
                        ? 'bg-red-500 text-white'
                        : 'bg-white/20 text-white hover:bg-white/30',
                    )}
                    aria-label={venue.favorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart className={cn('w-4 h-4', venue.favorite && 'fill-current')} />
                  </button>
                  <div className="absolute bottom-3 left-4 right-4">
                    <h2 className="font-display text-lg font-bold text-white">{venue.name}</h2>
                    <p className="text-xs text-white/70 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {venue.location}
                    </p>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="info">{venue.pitchType}</Badge>
                    <Badge variant={venue.parking ? 'success' : 'neutral'}>
                      <Car className="w-3 h-3" />
                      {venue.parking ? 'Parking Available' : 'No Parking'}
                    </Badge>
                    <Badge variant="neutral">
                      <Ticket className="w-3 h-3" />
                      {venue.averageCost}
                    </Badge>
                  </div>

                  <a
                    href={venue.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in Google Maps
                  </a>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <AddVenueDialog open={addOpen} onClose={() => setAddOpen(false)} />

      {editVenue && (
        <EditVenueDialog venue={editVenue} onClose={() => setEditVenue(null)} />
      )}

      {deleteConfirm && (
        <DeleteVenueDialog venue={deleteConfirm} onClose={() => setDeleteConfirm(null)} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Edit Venue Dialog                                                   */
/* ------------------------------------------------------------------ */

function EditVenueDialog({ venue, onClose }: { venue: Venue; onClose: () => void }) {
  const updateMutation = useUpdateVenueMutation();
  const [name, setName] = useState(venue.name);
  const [location, setLocation] = useState(venue.location);
  const [mapsUrl, setMapsUrl] = useState(venue.mapsUrl || '');
  const [imageUrl, setImageUrl] = useState(venue.imageUrl || '');
  const [pitchType, setPitchType] = useState(venue.pitchType || '');
  const [parking, setParking] = useState(venue.parking);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(
      {
        id: String(venue.id),
        input: {
          name,
          location,
          mapsUrl: mapsUrl || undefined,
          imageUrl: imageUrl || undefined,
          pitchType: pitchType || undefined,
          parking,
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
        <h2 className="font-display text-lg font-bold text-primary dark:text-white mb-4">Edit Venue</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="input-base" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Location</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required className="input-base" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Pitch Type</label>
            <input type="text" value={pitchType} onChange={(e) => setPitchType(e.target.value)} placeholder="e.g. Turf" className="input-base" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Google Maps URL</label>
            <input type="text" value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} className="input-base" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Image URL</label>
            <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="input-base" />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={parking}
              onChange={(e) => setParking(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-600"
            />
            <label className="text-sm text-slate-600 dark:text-slate-300">Parking Available</label>
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
/* Delete Venue Dialog                                                 */
/* ------------------------------------------------------------------ */

function DeleteVenueDialog({ venue, onClose }: { venue: Venue; onClose: () => void }) {
  const deleteMutation = useDeleteVenueMutation();

  const handleConfirm = () => {
    deleteMutation.mutate(String(venue.id), { onSuccess: () => onClose() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6"
      >
        <h2 className="font-display text-lg font-bold text-primary dark:text-white mb-2">Delete Venue</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Are you sure you want to delete <span className="font-semibold text-primary dark:text-white">{venue.name}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant="danger"
            loading={deleteMutation.isPending}
            onClick={handleConfirm}
          >
            Delete
          </Button>
        </div>
      </motion.div>
    </div>
  );
}