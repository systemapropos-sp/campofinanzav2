import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '@/types';
import { MockAuthService, initializeMockData } from '@/services/mockData';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (pin: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  hasPermission: (module: keyof User['permissions']) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeMockData();
    const session = MockAuthService.getSession();
    if (session?.user) {
      setUser(session.user);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (pin: string): Promise<boolean> => {
    const user = MockAuthService.login(pin);
    if (user) {
      setUser(user);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    MockAuthService.logout();
    setUser(null);
    window.location.reload();
  }, []);

  const isAdmin = user?.role === 'admin' || false;

  const hasPermission = useCallback((module: keyof User['permissions']): boolean => {
    if (!user) return false;
    if (user.permissions.full_access) return true;
    return user.permissions[module] || false;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAdmin, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
