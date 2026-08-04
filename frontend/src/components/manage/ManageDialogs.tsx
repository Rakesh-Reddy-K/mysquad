import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarPlus, UserPlus, MapPinPlus, X } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import {
  useCreateMatchMutation,
  useUpdateMatchMutation,
  useCreatePlayerMutation,
  useCreateVenueMutation,
} from '@/hooks/useMutations';
import type { Match } from '@/types';
import * as api from '@/lib/api';

/* ------------------------------------------------------------------ */
/* Validation helpers                                                  */
/* ------------------------------------------------------------------ */

const isValidUrl = (value: string) => {
  if (!value.trim()) return true; // optional field
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-500 mt-1">{message}</p>;
}

/* ------------------------------------------------------------------ */
/* Schedule Match (captain)                                            */
/* ------------------------------------------------------------------ */

interface EditMatchDialogProps {
  open: boolean;
  onClose: () => void;
  match: Match;
}

export function EditMatchDialog({ open, onClose, match }: EditMatchDialogProps) {
  const [opponent, setOpponent] = useState(match.opponent);
  const [date, setDate] = useState(match.date);
  const [time, setTime] = useState(match.time);
  const [venueId, setVenueId] = useState(match.venue?.id ? String(match.venue.id) : '');
  const [captainNote, setCaptainNote] = useState(match.captainNote ?? '');
  const updateMatch = useUpdateMatchMutation();

  const { data: venues } = useQuery({
    queryKey: ['venues'],
    queryFn: api.getVenues,
    enabled: open,
  });

  const handleSubmit = () => {
    if (!opponent.trim() || !date || !time) return;
    updateMatch.mutate(
      {
        id: match.id,
        input: {
          opponent: opponent.trim(),
          date,
          time,
          venueId: venueId ? Number(venueId) : undefined,
          captainNote: captainNote.trim() || undefined,
        },
      },
      {
        onSuccess: () => onClose(),
      },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} title="Edit Match">
      <div className="space-y-4">
        <div>
          <label className="label-base">Opponent</label>
          <input
            type="text"
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
            placeholder="e.g. Warriors XI"
            className="input-base w-full"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-base">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-base w-full"
            />
          </div>
          <div>
            <label className="label-base">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="input-base w-full"
            />
          </div>
        </div>

        <div>
          <label className="label-base">Venue</label>
          <select
            value={venueId}
            onChange={(e) => setVenueId(e.target.value)}
            className="input-base w-full"
          >
            <option value="">Select a venue…</option>
            {venues?.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} — {v.location}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-base">Captain Note (optional)</label>
          <textarea
            value={captainNote}
            onChange={(e) => setCaptainNote(e.target.value)}
            rows={2}
            placeholder="Bring white jersey. Report by 6:15 AM."
            className="input-base w-full resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" fullWidth onClick={onClose}>
            <X className="w-4 h-4" /> Cancel
          </Button>
          <Button
            variant="success"
            fullWidth
            onClick={handleSubmit}
            loading={updateMatch.isPending}
            disabled={!opponent.trim() || !date || !time}
          >
            <CalendarPlus className="w-4 h-4" /> Save Changes
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

interface ScheduleMatchDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ScheduleMatchDialog({ open, onClose }: ScheduleMatchDialogProps) {
  const [opponent, setOpponent] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venueId, setVenueId] = useState('');
  const [captainNote, setCaptainNote] = useState('');
  const createMatch = useCreateMatchMutation();

  const { data: venues } = useQuery({
    queryKey: ['venues'],
    queryFn: api.getVenues,
    enabled: open,
  });

  const canSubmit = opponent.trim() && date && time;

  const handleSubmit = () => {
    if (!canSubmit) return;
    createMatch.mutate(
      {
        opponent: opponent.trim(),
        date,
        time,
        venueId: venueId ? Number(venueId) : undefined,
        captainNote: captainNote.trim() || undefined,
      },
      {
        onSuccess: () => {
          setOpponent('');
          setDate('');
          setTime('');
          setVenueId('');
          setCaptainNote('');
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} title="Schedule New Match">
      <div className="space-y-4">
        <div>
          <label className="label-base">Opponent</label>
          <input
            type="text"
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
            placeholder="e.g. Warriors XI"
            className="input-base w-full"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-base">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-base w-full"
            />
          </div>
          <div>
            <label className="label-base">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="input-base w-full"
            />
          </div>
        </div>

        <div>
          <label className="label-base">Venue</label>
          <select
            value={venueId}
            onChange={(e) => setVenueId(e.target.value)}
            className="input-base w-full"
          >
            <option value="">Select a venue…</option>
            {venues?.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} — {v.location}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-base">Captain Note (optional)</label>
          <textarea
            value={captainNote}
            onChange={(e) => setCaptainNote(e.target.value)}
            rows={2}
            placeholder="Bring white jersey. Report by 6:15 AM."
            className="input-base w-full resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" fullWidth onClick={onClose}>
            <X className="w-4 h-4" /> Cancel
          </Button>
          <Button
            variant="success"
            fullWidth
            onClick={handleSubmit}
            loading={createMatch.isPending}
            disabled={!canSubmit}
          >
            <CalendarPlus className="w-4 h-4" /> Schedule Match
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Add Player (captain)                                                */
/* ------------------------------------------------------------------ */

interface AddPlayerDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddPlayerDialog({ open, onClose }: AddPlayerDialogProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('ALL_ROUNDER');
  const [battingStyle, setBattingStyle] = useState('RIGHT_HAND');
  const [bowlingStyle, setBowlingStyle] = useState('MEDIUM');
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [defaultPassword, setDefaultPassword] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const createPlayer = useCreatePlayerMutation();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Player name is required';
    const phoneDigits = phone.replace(/\D/g, '');
    if (!phone.trim()) {
      errs.phone = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
      errs.phone = 'Enter a valid 10-digit mobile number';
    }
    if (jerseyNumber) {
      const num = Number(jerseyNumber);
      if (!Number.isInteger(num) || num <= 0) {
        errs.jerseyNumber = 'Jersey number must be a positive whole number';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    createPlayer.mutate(
      {
        name: name.trim(),
        phone: phone.trim() || undefined,
        role,
        battingStyle,
        bowlingStyle,
        jerseyNumber: jerseyNumber ? Number(jerseyNumber) : undefined,
      },
      {
        onSuccess: (data) => {
          if (data?.defaultPassword) {
            setDefaultPassword(data.defaultPassword);
          } else {
            setName('');
            setPhone('');
            setRole('ALL_ROUNDER');
            setBattingStyle('RIGHT_HAND');
            setBowlingStyle('MEDIUM');
            setJerseyNumber('');
            onClose();
          }
        },
      },
    );
  };

  const handleClose = () => {
    setDefaultPassword(null);
    setName('');
    setPhone('');
    setRole('ALL_ROUNDER');
    setBattingStyle('RIGHT_HAND');
    setBowlingStyle('MEDIUM');
    setJerseyNumber('');
    onClose();
  };

  if (defaultPassword) {
    return (
      <Dialog open={open} onClose={handleClose} title="Player Added - Login Credentials">
        <div className="space-y-4">
          <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-4">
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-3">
              A login account was created for this player. Share these credentials with them:
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl px-3 py-2.5">
                <span className="text-sm text-slate-500 dark:text-slate-400">Username (Phone)</span>
                <span className="text-sm font-bold text-primary dark:text-white">{phone}</span>
              </div>
              <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl px-3 py-2.5">
                <span className="text-sm text-slate-500 dark:text-slate-400">Password</span>
                <span className="text-sm font-bold text-primary dark:text-white">{defaultPassword}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
              They can log in with this phone number and password, then change it in their profile.
            </p>
          </div>

          <Button variant="success" fullWidth onClick={handleClose}>
            <UserPlus className="w-4 h-4" /> Done
          </Button>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} title="Add Player to Squad">
      <div className="space-y-4">
        <div>
          <label className="label-base">Full Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Kiran Kumar"
            className="input-base w-full"
            autoFocus
          />
          <ErrorText message={errors.name} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-base">Mobile Number *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="98765 43210"
              className="input-base w-full"
            />
            <ErrorText message={errors.phone} />
          </div>
          <div>
            <label className="label-base">Jersey #</label>
            <input
              type="number"
              value={jerseyNumber}
              onChange={(e) => setJerseyNumber(e.target.value)}
              placeholder="7"
              className="input-base w-full"
            />
            <ErrorText message={errors.jerseyNumber} />
          </div>
        </div>

        <div>
          <label className="label-base">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="input-base w-full">
            <option value="BATTER">Batsman</option>
            <option value="BOWLER">Bowler</option>
            <option value="WK">Wicket Keeper</option>
            <option value="ALL_ROUNDER">All Rounder</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-base">Batting</label>
            <select
              value={battingStyle}
              onChange={(e) => setBattingStyle(e.target.value)}
              className="input-base w-full"
            >
              <option value="RIGHT_HAND">Right Hand</option>
              <option value="LEFT_HAND">Left Hand</option>
            </select>
          </div>
          <div>
            <label className="label-base">Bowling</label>
            <select
              value={bowlingStyle}
              onChange={(e) => setBowlingStyle(e.target.value)}
              className="input-base w-full"
            >
              <option value="FAST">Fast</option>
              <option value="MEDIUM">Medium Pace</option>
              <option value="SPIN">Spin</option>
              <option value="SLOW">Slow</option>
              <option value="NONE">None</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" fullWidth onClick={handleClose}>
            <X className="w-4 h-4" /> Cancel
          </Button>
          <Button
            variant="success"
            fullWidth
            onClick={handleSubmit}
            loading={createPlayer.isPending}
          >
            <UserPlus className="w-4 h-4" /> Add Player
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Add Venue (captain)                                                 */
/* ------------------------------------------------------------------ */

interface AddVenueDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddVenueDialog({ open, onClose }: AddVenueDialogProps) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('Hyderabad');
  const [pitchType, setPitchType] = useState('Grass');
  const [parking, setParking] = useState(true);
  const [mapsUrl, setMapsUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const createVenue = useCreateVenueMutation();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Ground name is required';
    if (!location.trim()) errs.location = 'Location is required';
    if (mapsUrl.trim() && !isValidUrl(mapsUrl)) errs.mapsUrl = 'Enter a valid URL';
    if (imageUrl.trim() && !isValidUrl(imageUrl)) errs.imageUrl = 'Enter a valid URL';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    createVenue.mutate(
      {
        name: name.trim(),
        location: location.trim(),
        pitchType,
        parking,
        mapsUrl: mapsUrl.trim() || undefined,
        imageUrl:
          imageUrl.trim() ||
          'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200&q=80',
      },
      {
        onSuccess: () => {
          setName('');
          setLocation('Hyderabad');
          setPitchType('Grass');
          setParking(true);
          setMapsUrl('');
          setImageUrl('');
          setErrors({});
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} title="Add New Venue">
      <div className="space-y-4">
        <div>
          <label className="label-base">Ground Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. LB Stadium"
            className="input-base w-full"
            autoFocus
          />
          <ErrorText message={errors.name} />
        </div>

        <div>
          <label className="label-base">Location *</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Hyderabad, Telangana"
            className="input-base w-full"
          />
          <ErrorText message={errors.location} />
        </div>

        <div>
          <label className="label-base">Pitch Type</label>
          <select
            value={pitchType}
            onChange={(e) => setPitchType(e.target.value)}
            className="input-base w-full"
          >
            <option value="Grass">Grass</option>
            <option value="Astro Turf">Astro Turf</option>
            <option value="Concrete">Concrete</option>
            <option value="Matting">Matting</option>
          </select>
        </div>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={parking}
            onChange={(e) => setParking(e.target.checked)}
            className="w-4 h-4 rounded accent-emerald-500"
          />
          <span className="text-sm text-slate-700 dark:text-slate-200">Parking available</span>
        </label>

        <div>
          <label className="label-base">Google Maps Link</label>
          <input
            type="url"
            value={mapsUrl}
            onChange={(e) => setMapsUrl(e.target.value)}
            placeholder="https://maps.app.goo.gl/..."
            className="input-base w-full"
          />
          <ErrorText message={errors.mapsUrl} />
        </div>

        <div>
          <label className="label-base">Photo URL (optional)</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Leave blank for default ground photo"
            className="input-base w-full"
          />
          <ErrorText message={errors.imageUrl} />
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" fullWidth onClick={onClose}>
            <X className="w-4 h-4" /> Cancel
          </Button>
          <Button
            variant="success"
            fullWidth
            onClick={handleSubmit}
            loading={createVenue.isPending}
          >
            <MapPinPlus className="w-4 h-4" /> Add Venue
          </Button>
        </div>
      </div>
    </Dialog>
  );
}