import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  Users,
  MapPin,
  Megaphone,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  CloudSun,
  Trophy,
  Hourglass,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { Countdown } from '@/components/countdown/Countdown';
import { WeatherCard } from '@/components/weather/WeatherCard';
import { useAuth } from '@/context/AuthContext';
import { greeting, formatDate, formatTime } from '@/lib/utils';
import * as api from '@/lib/api';
import type { Match } from '@/types';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: api.getDashboardData,
  });

  const match: Match | undefined = data?.upcomingMatch;
  const avail = data?.availability;
  const target = match ? `${match.date}T${match.time}:00` : '';

  const quickActions = [
    {
      label: 'Confirm Availability',
      icon: CheckCircle2,
      to: '/availability',
      color: 'bg-emerald-500',
      glow: 'shadow-glow',
    },
    { label: 'Matches', icon: CalendarDays, to: '/matches', color: 'bg-blue-500', glow: 'shadow-lg shadow-blue-500/25' },
    { label: 'Announcements', icon: Megaphone, to: '/announcements', color: 'bg-violet-500', glow: 'shadow-lg shadow-violet-500/25' },
    { label: 'Venues', icon: MapPin, to: '/venues', color: 'bg-amber-500', glow: 'shadow-lg shadow-amber-500/25' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-primary dark:text-white">
            {greeting()}, {user?.name.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {user?.isCaptain ? "Here's your team at a glance, captain." : 'Stay updated with your squad.'}
          </p>
        </div>
        <Link
          to="/profile"
          className="lg:hidden"
        >
          <Avatar name={user?.name ?? 'U'} size="md" ring />
        </Link>
      </div>

      {/* Upcoming Match Hero */}
      {isLoading ? (
        <Skeleton className="h-72 w-full" />
      ) : !match ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-3xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/85 to-emerald-900/70" />
          <div className="relative p-8 sm:p-10 text-center text-white">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-glow items-center justify-center mb-5">
              <Hourglass className="w-8 h-8 text-white" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold mb-3">No Matches Scheduled Yet!</h2>
            <p className="text-emerald-200/90 max-w-md mx-auto text-sm leading-relaxed">
              The captain is cooking up something exciting 🏏 Keep your pads ready — the next big game is on its way!
            </p>
            <div className="flex items-center justify-center gap-2 mt-6 text-xs font-semibold text-emerald-300/80">
              <Sparkles className="w-4 h-4" /> Your team is gearing up for the next battle <Sparkles className="w-4 h-4" />
            </div>
          </div>
        </motion.div>
      ) : match ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-3xl"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${match.groundImage}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/85 to-emerald-900/70" />

          <div className="relative p-6 sm:p-8">
            {/* Top row */}
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Next Match
              </span>
              <span className="text-white/80 text-sm font-medium">
                {formatDate(match.date)} • {formatTime(match.time)}
              </span>
            </div>

            {/* Opponent */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Trophy className="w-7 h-7 text-emerald-300" />
              </div>
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                  VS {match.opponent}
                </h2>
                <p className="text-white/70 text-sm flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {match.venue?.name ?? 'Venue TBD'}
                </p>
              </div>
            </div>

            {/* Countdown */}
            <Countdown target={target} />

            {/* Confirmations */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex -space-x-2">
                {['Rakesh', 'Rahul', 'Nani', 'Suresh'].map((name) => (
                  <Avatar key={name} name={name} size="sm" className="border-2 border-white/20" />
                ))}
                {avail && avail.available > 4 && (
                  <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-md border-2 border-white/20 flex items-center justify-center text-[10px] font-bold text-white">
                    +{avail.available - 4}
                  </div>
                )}
              </div>
              <div className="text-right">
                {avail && (
                  <>
                    <p className="text-white font-extrabold text-lg leading-none">
                      {avail.available}
                      <span className="text-white/60 text-sm font-medium">/{avail.available + avail.unavailable + avail.pending + avail.maybe}</span>
                    </p>
                    <p className="text-white/60 text-xs">Players Confirmed</p>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => navigate(`/matches/${match.id}`)}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors"
            >
              View Match Details
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      ) : null}

      {/* Availability + Weather grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Availability Card */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-primary dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              Availability
            </h3>
            <Link
              to="/availability"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              View all
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : avail ? (
            <>
              <div className="flex h-3 rounded-full overflow-hidden mb-4 bg-slate-100 dark:bg-slate-700">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(avail.available / (avail.available + avail.unavailable + avail.pending + avail.maybe)) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="bg-emerald-500"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(avail.maybe / (avail.available + avail.unavailable + avail.pending + avail.maybe)) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="bg-amber-400"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(avail.pending / (avail.available + avail.unavailable + avail.pending + avail.maybe)) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="bg-slate-300 dark:bg-slate-600"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(avail.unavailable / (avail.available + avail.unavailable + avail.pending + avail.maybe)) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="bg-red-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl px-3 py-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-lg leading-none text-primary dark:text-white">{avail.available}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Available</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 bg-red-50 dark:bg-red-500/10 rounded-xl px-3 py-2.5">
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-lg leading-none text-primary dark:text-white">{avail.unavailable}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Not Available</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl px-3 py-2.5">
                  <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-lg leading-none text-primary dark:text-white">{avail.pending}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Pending</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 bg-slate-100 dark:bg-slate-700/50 rounded-xl px-3 py-2.5">
                  <CloudSun className="w-4 h-4 text-slate-500 dark:text-slate-300 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-lg leading-none text-primary dark:text-white">{avail.maybe}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Maybe</p>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </Card>

        {/* Weather */}
        {data?.weather && <WeatherCard weather={data.weather} />}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="font-display font-bold text-primary dark:text-white mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map(({ label, icon: Icon, to, color, glow }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Link to={to}>
                <Card hover className="p-4 text-center">
                  <div className={`w-12 h-12 mx-auto mb-2.5 rounded-2xl ${color} ${glow} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-xs font-semibold text-primary dark:text-white leading-tight">{label}</p>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Announcement */}
      {data?.recentAnnouncement && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-primary dark:text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-violet-500" />
              Recent Announcement
            </h3>
            <Link
              to="/announcements"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              See all
            </Link>
          </div>
          <div className="flex items-start gap-3">
            <Avatar name={data.recentAnnouncement.author} size="sm" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-primary dark:text-white">
                  {data.recentAnnouncement.author}
                </p>
                <span className="text-xs text-slate-400">
                  {new Date(data.recentAnnouncement.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                {data.recentAnnouncement.message}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}