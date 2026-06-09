import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
import { initializeMockData } from '@/services/mockData';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  businessId: string;
  isLoading: boolean;
  login: (pin: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  hasPermission: (module: keyof User['permissions']) => boolean;
}

const SESSION_KEY = 'cf_user_session_v2';
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [businessId, setBusinessId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restore() {
      try {
        const stored = localStorage.getItem(SESSION_KEY);
        if (stored) {
          const { user: u, businessId: bid } = JSON.parse(stored);
          setUser(u);
          setBusinessId(bid || '');
          await initializeMockData(bid);
        }
      } catch { localStorage.removeItem(SESSION_KEY); }
      setIsLoading(false);
    }
    restore();
  }, []);

  const login = useCallback(async (pin: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('cf_usuarios_negocio')
        .select('*')
        .eq('pin', pin)
        .eq('is_active', true)
        .maybeSingle();

      if (error || !data) return false;

      const u: User = {
        id: data.id,
        pin: data.pin,
        full_name: data.full_name,
        email: data.email ?? undefined,
        phone: data.phone ?? undefined,
        role: data.role,
        permissions: data.permissions,
        is_active: data.is_active,
        avatar_url: data.avatar_url ?? undefined,
        created_at: data.created_at,
      };

      const bid = data.business_id as string;
      await initializeMockData(bid);
      setUser(u);
      setBusinessId(bid);
      localStorage.setItem(SESSION_KEY, JSON.stringify({ user: u, businessId: bid }));
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    setBusinessId('');
    window.location.href = '/login';
  }, []);

  const isAdmin = user?.role === 'admin' || false;

  const hasPermission = useCallback((module: keyof User['permissions']): boolean => {
    if (!user) return false;
    if (user.permissions.full_access) return true;
    return !!user.permissions[module];
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, businessId, isLoading, login, logout, isAdmin, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
