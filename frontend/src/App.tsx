import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/context/AuthContext';

const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Statistics = lazy(() => import('@/pages/Statistics'));
const Matches = lazy(() => import('@/pages/Matches'));
const MatchDetails = lazy(() => import('@/pages/MatchDetails'));
const Availability = lazy(() => import('@/pages/Availability'));
const Venues = lazy(() => import('@/pages/Venues'));
const Announcements = lazy(() => import('@/pages/Announcements'));
const Players = lazy(() => import('@/pages/Players'));
const PlayerProfile = lazy(() => import('@/pages/PlayerProfile'));
const Profile = lazy(() => import('@/pages/Profile'));
const Settings = lazy(() => import('@/pages/Settings'));

function PageLoader() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-72 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

export default function App() {
  const { user, loading: initializing } = useAuth();

  if (initializing) return <PageLoader />;

  if (!user) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/matches/:id" element={<MatchDetails />} />
          <Route path="/availability" element={<Availability />} />
          <Route path="/venues" element={<Venues />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/players" element={<Players />} />
          <Route path="/players/:id" element={<PlayerProfile />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}