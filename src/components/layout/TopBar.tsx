import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sprout, Bell, LogOut, User, CheckCheck, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import type { User as UserType } from '@/types';

const TABS = [
  { path: '/dashboard', label: 'Dashboard', perm: 'dashboard' as keyof UserType['permissions'] },
  { path: '/proyectos', label: 'Proyectos', perm: 'projects' as keyof UserType['permissions'] },
  { path: '/almacen', label: 'Almacen', perm: 'warehouse' as keyof UserType['permissions'] },
  { path: '/compras', label: 'Compras', perm: 'purchases' as keyof UserType['permissions'] },
  { path: '/facturas', label: 'Facturas', perm: 'invoices' as keyof UserType['permissions'] },
  { path: '/trabajadores', label: 'Trabajadores', perm: 'workers' as keyof UserType['permissions'] },
  { path: '/gastos', label: 'Gastos', perm: 'operational_expenses' as keyof UserType['permissions'] },
  { path: '/nominas', label: 'Nominas', perm: 'payroll' as keyof UserType['permissions'] },
  { path: '/prestamos', label: 'Prestamos', perm: 'loans' as keyof UserType['permissions'] },
  { path: '/inversionistas', label: 'Inversiones', perm: 'investors' as keyof UserType['permissions'] },
  { path: '/reporte', label: 'Reporte', perm: 'expense_report' as keyof UserType['permissions'] },
  { path: '/usuarios', label: 'Usuarios', perm: 'users' as keyof UserType['permissions'] },
  { path: '/configuracion', label: 'Config.', perm: 'settings' as keyof UserType['permissions'] },
];

export function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasPermission } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false);
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) setShowMobileMenu(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

  const filteredTabs = TABS.filter(tab => {
    if (tab.perm === 'dashboard') return true;
    return hasPermission(tab.perm as keyof UserType['permissions']);
  });

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diff < 1) return 'Ahora';
    if (diff < 60) return `Hace ${diff} min`;
    if (diff < 1440) return `Hace ${Math.floor(diff / 60)} h`;
    return `Hace ${Math.floor(diff / 1440)} d`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 sm:h-16 bg-white border-b border-[#E8E0D4] z-50">
      <div className="h-full px-3 sm:px-6 flex items-center justify-between gap-2">
        {/* Left: Logo + Mobile Menu */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile hamburger */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 rounded-lg hover:bg-[#F5F0E8] transition-colors"
          >
            {showMobileMenu ? <X className="w-5 h-5 text-[#2C2C2C]" /> : <Menu className="w-5 h-5 text-[#2C2C2C]" />}
          </button>

          {/* Logo */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity shrink-0"
          >
            <Sprout className="w-5 h-5 sm:w-6 sm:h-6 text-[#1B4332]" />
            <span className="text-sm sm:text-lg font-bold text-[#1B4332] tracking-wide hidden sm:inline">
              CAMPOFINANZAS
            </span>
          </button>
        </div>

        {/* Center: Tab Navigation (desktop only) */}
        <nav className="hidden lg:flex items-center gap-0.5 overflow-x-auto no-scrollbar mx-2 flex-1 justify-center">
          {filteredTabs.map(tab => {
            const isActive = location.pathname === tab.path || location.pathname.startsWith(tab.path + '/');
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`relative px-2.5 xl:px-3 py-2 text-xs xl:text-sm font-medium whitespace-nowrap rounded-lg transition-all duration-200 ${
                  isActive ? 'text-[#1B4332] bg-[#1B4332]/5' : 'text-[#6B6B6B] hover:text-[#2C2C2C] hover:bg-[#F5F0E8]'
                }`}
              >
                {tab.label}
                {isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#1B4332] rounded-full" />}
              </button>
            );
          })}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button onClick={() => setShowNotifs(!showNotifs)} className="relative p-2 rounded-lg hover:bg-[#F5F0E8] transition-colors">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-[#6B6B6B]" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#C97B7B] text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-[#E8E0D4] overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E0D4]">
                  <h3 className="text-sm font-semibold text-[#2C2C2C]">Notificaciones</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="flex items-center gap-1 text-xs text-[#2D6A4F] hover:text-[#1B4332]">
                      <CheckCheck className="w-3.5 h-3.5" />Marcar todo
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-[#9B9B9B]">Sin notificaciones</div>
                  ) : (
                    notifications.slice(0, 10).map(notif => (
                      <button key={notif.id} onClick={() => markAsRead(notif.id)} className={`w-full text-left px-4 py-3 border-b border-[#E8E0D4] last:border-0 hover:bg-[#F5F0E8] transition-colors ${!notif.is_read ? 'bg-[#1B4332]/3' : ''}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!notif.is_read ? 'bg-[#C97B7B]' : 'bg-transparent'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#2C2C2C] truncate">{notif.title}</p>
                            <p className="text-xs text-[#6B6B6B] mt-0.5 line-clamp-2">{notif.message}</p>
                            <p className="text-[10px] text-[#9B9B9B] mt-1">{getRelativeTime(notif.created_at)}</p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Avatar */}
          <div className="relative" ref={userRef}>
            <button onClick={() => setShowUserMenu(!showUserMenu)} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1B4332] text-white text-xs sm:text-sm font-semibold flex items-center justify-center hover:bg-[#2D6A4F] transition-colors">
              {user ? getInitials(user.full_name) : '?'}
            </button>
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-[#E8E0D4] overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-[#E8E0D4]">
                  <p className="text-sm font-semibold text-[#2C2C2C]">{user?.full_name}</p>
                  <p className="text-xs text-[#6B6B6B] capitalize">{user?.role === 'admin' ? 'Administrador' : 'Operario'}</p>
                </div>
                <button onClick={() => { navigate('/configuracion'); setShowUserMenu(false); }} className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-[#2C2C2C] hover:bg-[#F5F0E8]"><User className="w-4 h-4 text-[#6B6B6B]" />Perfil</button>
                <button onClick={logout} className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-[#C97B7B] hover:bg-[#F5F0E8]"><LogOut className="w-4 h-4" />Cerrar sesion</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <div ref={mobileRef} className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-[#E8E0D4] shadow-[0_8px_24px_rgba(0,0,0,0.08)] max-h-[70vh] overflow-y-auto z-40">
          <div className="p-3 grid grid-cols-2 gap-1">
            {filteredTabs.map(tab => {
              const isActive = location.pathname === tab.path || location.pathname.startsWith(tab.path + '/');
              return (
                <button
                  key={tab.path}
                  onClick={() => { navigate(tab.path); setShowMobileMenu(false); }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive ? 'bg-[#1B4332] text-white' : 'text-[#6B6B6B] hover:bg-[#F5F0E8]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
