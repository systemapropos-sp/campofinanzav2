import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sprout, AlertCircle, TrendingUp, Package,
  ArrowUpRight, ArrowDownRight, Clock, User,
  FolderKanban, Warehouse, ShoppingCart, FileText,
  Users, Receipt, Banknote, HandCoins, BarChart3
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { AppLayout } from '@/components/layout/AppLayout';
import { getDashboardStats, getMonthlyData, getProjectDistribution } from '@/services/mockData';
import { MockEntryService, MockProjectService, MockUserService, MockWorkerService } from '@/services/mockData';
import type { DashboardStats, Entry } from '@/types';

function AnimatedNumber({ value, prefix = '' }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 800;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(value * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);

  return <>{prefix}{display.toLocaleString()}</>;
}

const QUICK_LINKS = [
  { path: '/proyectos', label: 'Proyectos', icon: FolderKanban, color: '#1B4332', desc: `${MockProjectService.getAll().filter(p => p.status === 'active').length} activos` },
  { path: '/almacen', label: 'Almacen', icon: Warehouse, color: '#2D6A4F', desc: `${MockWorkerService.getAll().filter(w => w.is_active).length} productos` },
  { path: '/compras', label: 'Compras', icon: ShoppingCart, color: '#8B6914', desc: 'Historial' },
  { path: '/facturas', label: 'Facturas', icon: FileText, color: '#C97B7B', desc: 'Por pagar' },
  { path: '/trabajadores', label: 'Trabajadores', icon: Users, color: '#1B4332', desc: `${MockWorkerService.getAll().filter(w => w.is_active).length} activos` },
  { path: '/gastos', label: 'Gastos Op.', icon: Receipt, color: '#6B6B6B', desc: 'Registro' },
  { path: '/nominas', label: 'Nominas', icon: Banknote, color: '#8B6914', desc: 'Pagos' },
  { path: '/prestamos', label: 'Prestamos', icon: HandCoins, color: '#D4A574', desc: 'Activos' },
  { path: '/reporte', label: 'Reporte', icon: BarChart3, color: '#2D6A4F', desc: 'Gastos' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentEntries, setRecentEntries] = useState<Entry[]>([]);

  useEffect(() => {
    setStats(getDashboardStats());
    setRecentEntries(MockEntryService.getAll().slice(0, 8));
  }, []);

  const monthlyData = useMemo(() => getMonthlyData(), []);
  const projectDist = useMemo(() => getProjectDistribution(), []);
  const projects = useMemo(() => MockProjectService.getAll(), []);
  const users = useMemo(() => MockUserService.getAll(), []);

  const getProjectName = (id: string) => projects.find(p => p.id === id)?.name || 'Proyecto';
  const getUserName = (id: string) => users.find(u => u.id === id)?.full_name || 'Usuario';

  if (!stats) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-[#1B4332] border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const kpiCards = [
    {
      title: 'Balance General',
      value: stats.total_balance,
      subtitle: 'Total en sistema',
      icon: Sprout,
      color: '#1B4332',
    },
    {
      title: 'Pagos Pendientes',
      value: stats.pending_payments,
      subtitle: 'Por pagar',
      icon: AlertCircle,
      color: '#C97B7B',
    },
    {
      title: 'Entradas Hoy',
      value: stats.today_entries,
      subtitle: 'Registros de hoy',
      icon: TrendingUp,
      color: '#2D6A4F',
    },
    {
      title: 'Almacen Valor',
      value: stats.warehouse_value,
      subtitle: 'Valor total inventario',
      icon: Package,
      color: '#8B6914',
    },
  ];

  return (
    <AppLayout>
      <div className="max-w-[1200px] mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#2C2C2C]">Dashboard</h1>
          <p className="text-sm text-[#6B6B6B] mt-1">Resumen financiero y actividad del sistema</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {kpiCards.map(card => (
            <div
              key={card.title}
              className="bg-white rounded-xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              onClick={() => {
                if (card.title === 'Pagos Pendientes') navigate('/facturas');
                else if (card.title === 'Almacen Valor') navigate('/almacen');
                else if (card.title === 'Entradas Hoy') navigate('/proyectos');
              }}
            >
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: card.color + '10' }}>
                  <card.icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: card.color }} />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#9B9B9B] shrink-0" />
              </div>
              <p className="text-[10px] sm:text-xs font-medium text-[#9B9B9B] uppercase tracking-wide mb-1">{card.title}</p>
              <p className="text-lg sm:text-xl font-semibold font-mono" style={{ color: card.color }}>
                <AnimatedNumber value={card.value} prefix="$" />
              </p>
              <p className="text-[10px] sm:text-xs text-[#6B6B6B] mt-1">{card.subtitle}</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 mb-6">
          {/* Area Chart */}
          <div className="lg:col-span-3 bg-white rounded-xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h3 className="text-sm sm:text-base font-semibold text-[#2C2C2C] mb-4">Movimientos del Mes</h3>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1B4332" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#1B4332" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C97B7B" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#C97B7B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D4" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9B9B9B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#9B9B9B' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #E8E0D4', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                  <Area type="monotone" dataKey="income" name="Ingresos" stroke="#1B4332" strokeWidth={2} fill="url(#incomeGrad)" />
                  <Area type="monotone" dataKey="expense" name="Gastos" stroke="#C97B7B" strokeWidth={2} fill="url(#expenseGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#1B4332]" /><span className="text-xs text-[#6B6B6B]">Ingresos</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#C97B7B]" /><span className="text-xs text-[#6B6B6B]">Gastos</span></div>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h3 className="text-sm sm:text-base font-semibold text-[#2C2C2C] mb-4">Por Proyecto</h3>
            <div className="h-48 sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={projectDist} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {projectDist.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #E8E0D4', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-2">
              {projectDist.slice(0, 4).map((p, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} /><span className="text-[#6B6B6B] truncate max-w-[120px]">{p.name}</span></div>
                  <span className="font-mono text-[#2C2C2C]">${(p.value / 1000).toFixed(1)}k</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden mb-6">
          <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-[#E8E0D4]">
            <h3 className="text-sm sm:text-base font-semibold text-[#2C2C2C]">Actividad Reciente</h3>
            <button onClick={() => navigate('/proyectos')} className="text-xs font-medium text-[#2D6A4F] hover:text-[#1B4332]">Ver todo</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-[#E8E0D4]">
                  <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Tipo</th>
                  <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Descripcion</th>
                  <th className="text-right text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Monto</th>
                  <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3 hidden md:table-cell">Fecha</th>
                  <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3 hidden lg:table-cell">Usuario</th>
                </tr>
              </thead>
              <tbody>
                {recentEntries.map((entry, i) => (
                  <tr key={entry.id} className="border-b border-[#E8E0D4]/50 hover:bg-[#F5F0E8]/50 cursor-pointer transition-colors" onClick={() => navigate(`/proyectos/${entry.project_id}`)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${i % 3 === 0 ? 'bg-[#2D6A4F]' : i % 3 === 1 ? 'bg-[#C97B7B]' : 'bg-[#8B6914]'}`} />
                        <span className="text-sm text-[#2C2C2C]">{i % 3 === 0 ? 'Entrada' : i % 3 === 1 ? 'Gasto' : 'Movimiento'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#2C2C2C]">
                      <div className="flex flex-col"><span className="truncate max-w-[150px] sm:max-w-[200px]">{entry.notes}</span><span className="text-xs text-[#9B9B9B]">{getProjectName(entry.project_id)}</span></div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm" style={{ color: i % 3 === 0 ? '#1B4332' : '#C97B7B' }}>{i % 3 === 0 ? '+' : '-'}${entry.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-[#6B6B6B] hidden md:table-cell"><div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{entry.date}</div></td>
                    <td className="px-4 py-3 text-sm text-[#6B6B6B] hidden lg:table-cell"><div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{getUserName(entry.user_id)}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2 mb-2"><ArrowUpRight className="w-4 h-4 text-[#2D6A4F]" /><span className="text-xs text-[#6B6B6B]">Proyectos Activos</span></div>
            <p className="text-lg font-semibold font-mono text-[#1B4332]">{stats.active_projects}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2 mb-2"><ArrowDownRight className="w-4 h-4 text-[#8B6914]" /><span className="text-xs text-[#6B6B6B]">Stock Bajo</span></div>
            <p className="text-lg font-semibold font-mono text-[#8B6914]">{stats.low_stock_products}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-[#2D6A4F]" /><span className="text-xs text-[#6B6B6B]">Ingreso Mensual</span></div>
            <p className="text-lg font-semibold font-mono text-[#2D6A4F]">${stats.monthly_income.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2 mb-2"><ArrowDownRight className="w-4 h-4 text-[#C97B7B]" /><span className="text-xs text-[#6B6B6B]">Gasto Mensual</span></div>
            <p className="text-lg font-semibold font-mono text-[#C97B7B]">${stats.monthly_expense.toLocaleString()}</p>
          </div>
        </div>

        {/* ====== BOTTOM SECTION: Quick Access ====== */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[#2C2C2C] mb-4">Accesos Rapidos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {QUICK_LINKS.map(link => {
              const LinkIcon = link.icon;
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="bg-white rounded-xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200 text-left group"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: link.color + '10' }}>
                    <LinkIcon className="w-5 h-5" style={{ color: link.color }} />
                  </div>
                  <p className="text-sm font-medium text-[#2C2C2C] group-hover:text-[#1B4332] transition-colors">{link.label}</p>
                  <p className="text-xs text-[#9B9B9B] mt-0.5">{link.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-6 border-t border-[#E8E0D4]">
          <p className="text-xs text-[#9B9B9B]">CampoFinanzas - Sistema de Gestion Financiera para Campo</p>
          <p className="text-[10px] text-[#9B9B9B] mt-1">{new Date().getFullYear()} - Campo El Progreso</p>
        </div>
      </div>
    </AppLayout>
  );
}
