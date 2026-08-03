import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Player } from '@/types';
import * as api from '@/lib/api';

interface AuthContextValue {
  user: Player | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: Player | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('mysquad_token');
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('mysquad_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .getCurrentUser()
      .then(setUser)
      .catch(() => localStorage.removeItem('mysquad_token'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}