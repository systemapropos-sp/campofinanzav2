import { useState, useMemo } from 'react';
import {
  FileBarChart, Filter, Fuel, Wrench, Zap, Truck,
  UtensilsCrossed, HelpCircle, Receipt, ShoppingCart,
  UserCheck, HandCoins, TrendingDown, Calendar, X, Download
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import {
  MockOperationalExpenseService, MockPurchaseService, MockInvoiceService,
  MockPayrollService, MockLoanService, MockProjectService
} from '@/services/mockData';

const EXPENSE_CATEGORIES: Record<string, { label: string; icon: typeof Fuel; color: string }> = {
  fuel: { label: 'Combustible', icon: Fuel, color: '#8B6914' },
  maintenance: { label: 'Mantenimiento', icon: Wrench, color: '#6B6B6B' },
  utilities: { label: 'Servicios', icon: Zap, color: '#C9A84C' },
  transport: { label: 'Transporte', icon: Truck, color: '#2D6A4F' },
  food: { label: 'Alimentacion', icon: UtensilsCrossed, color: '#D4A574' },
  other: { label: 'Otros', icon: HelpCircle, color: '#9B9B9B' },
};

const EXPENSE_TYPE_OPTIONS = [
  { key: 'operational', label: 'Gastos Op.', icon: Receipt },
  { key: 'purchases', label: 'Compras', icon: ShoppingCart },
  { key: 'invoices', label: 'Facturas', icon: FileBarChart },
  { key: 'payroll', label: 'Nominas', icon: UserCheck },
  { key: 'loans', label: 'Prestamos', icon: HandCoins },
];

export default function ReporteGastos() {
  const { hasPermission } = useAuth();
  const [typeFilter, setTypeFilter] = useState<string[]>(['operational', 'purchases', 'invoices', 'payroll', 'loans']);
  const [catFilter, setCatFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

  const projects = useMemo(() => MockProjectService.getAll(), []);

  const opExpenses = useMemo(() => MockOperationalExpenseService.getAll(), []);
  const purchases = useMemo(() => MockPurchaseService.getAll(), []);
  const invoices = useMemo(() => MockInvoiceService.getAll().filter(i => i.status !== 'paid'), []);
  const payrolls = useMemo(() => MockPayrollService.getAll(), []);
  const loans = useMemo(() => MockLoanService.getAll().filter(l => l.status === 'active'), []);

  const filteredOpExpenses = useMemo(() => {
    return opExpenses.filter(e => {
      if (catFilter && e.category !== catFilter) return false;
      if (dateFrom && e.date < dateFrom) return false;
      if (dateTo && e.date > dateTo) return false;
      if (projectFilter && e.project_id !== projectFilter) return false;
      return true;
    });
  }, [opExpenses, catFilter, dateFrom, dateTo, projectFilter]);

  const totals = useMemo(() => {
    const opTotal = typeFilter.includes('operational') ? filteredOpExpenses.reduce((s, e) => s + e.amount, 0) : 0;
    const purTotal = typeFilter.includes('purchases') ? purchases.reduce((s, p) => s + p.total, 0) : 0;
    const invTotal = typeFilter.includes('invoices') ? invoices.reduce((s, i) => s + (i.amount - i.paid_amount), 0) : 0;
    const payTotal = typeFilter.includes('payroll') ? payrolls.reduce((s, p) => s + p.total, 0) : 0;
    const loanTotal = typeFilter.includes('loans') ? loans.reduce((s, l) => s + l.remaining, 0) : 0;
    return { operational: opTotal, purchases: purTotal, invoices: invTotal, payroll: payTotal, loans: loanTotal, grandTotal: opTotal + purTotal + invTotal + payTotal + loanTotal };
  }, [filteredOpExpenses, purchases, invoices, payrolls, loans, typeFilter]);

  const toggleType = (key: string) => {
    setTypeFilter(prev => prev.includes(key) ? prev.filter(t => t !== key) : [...prev, key]);
  };

  if (!hasPermission('expense_report')) {
    return (<AppLayout><div className="flex flex-col items-center justify-center h-64"><p className="text-lg font-medium text-[#2C2C2C]">Acceso Denegado</p></div></AppLayout>);
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-3xl font-bold text-[#2C2C2C]">Reporte de Gastos</h1><p className="text-sm text-[#6B6B6B] mt-1">Analisis completo de gastos con filtros</p></div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-[#E8E0D4] text-[#6B6B6B] text-sm font-medium rounded-lg hover:bg-[#F5F0E8] transition-colors shrink-0">
          <Download className="w-4 h-4" /><span className="hidden sm:inline">Exportar</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {typeFilter.includes('operational') && (
          <div className="bg-white rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2 mb-1"><Receipt className="w-4 h-4 text-[#1B4332]" /><span className="text-[11px] text-[#6B6B6B]">Gastos Op.</span></div>
            <p className="text-lg font-semibold font-mono text-[#1B4332]">${totals.operational.toLocaleString()}</p>
          </div>
        )}
        {typeFilter.includes('purchases') && (
          <div className="bg-white rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2 mb-1"><ShoppingCart className="w-4 h-4 text-[#2D6A4F]" /><span className="text-[11px] text-[#6B6B6B]">Compras</span></div>
            <p className="text-lg font-semibold font-mono text-[#2D6A4F]">${totals.purchases.toLocaleString()}</p>
          </div>
        )}
        {typeFilter.includes('invoices') && (
          <div className="bg-white rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2 mb-1"><FileBarChart className="w-4 h-4 text-[#C97B7B]" /><span className="text-[11px] text-[#6B6B6B]">Facturas</span></div>
            <p className="text-lg font-semibold font-mono text-[#C97B7B]">${totals.invoices.toLocaleString()}</p>
          </div>
        )}
        {typeFilter.includes('payroll') && (
          <div className="bg-white rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2 mb-1"><UserCheck className="w-4 h-4 text-[#8B6914]" /><span className="text-[11px] text-[#6B6B6B]">Nominas</span></div>
            <p className="text-lg font-semibold font-mono text-[#8B6914]">${totals.payroll.toLocaleString()}</p>
          </div>
        )}
        {typeFilter.includes('loans') && (
          <div className="bg-white rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2 mb-1"><HandCoins className="w-4 h-4 text-[#D4A574]" /><span className="text-[11px] text-[#6B6B6B]">Prestamos</span></div>
            <p className="text-lg font-semibold font-mono text-[#D4A574]">${totals.loans.toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="bg-white rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2"><TrendingDown className="w-5 h-5 text-[#C97B7B]" /><span className="text-sm text-[#6B6B6B]">Total de Gastos</span></div>
        <p className="text-xl font-semibold font-mono text-[#C97B7B]">${totals.grandTotal.toLocaleString()}</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] mb-6">
        <div className="flex items-center gap-2 mb-4"><Filter className="w-4 h-4 text-[#1B4332]" /><h3 className="text-sm font-semibold text-[#2C2C2C]">Filtros</h3></div>

        {/* Type filter */}
        <div className="mb-4">
          <p className="text-xs text-[#9B9B9B] uppercase tracking-wide mb-2">Tipo de Gasto</p>
          <div className="flex flex-wrap gap-2">
            {EXPENSE_TYPE_OPTIONS.map(opt => {
              const OptIcon = opt.icon;
              return (
                <button key={opt.key} onClick={() => toggleType(opt.key)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${typeFilter.includes(opt.key) ? 'bg-[#1B4332] text-white' : 'bg-[#F5F0E8] text-[#6B6B6B] hover:bg-[#E8E0D4]'}`}>
                  <OptIcon className="w-3.5 h-3.5" />{opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date + Category + Project */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div><label className="block text-xs text-[#6B6B6B] mb-1">Desde</label><div className="relative"><Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9B9B]" /><input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full h-10 pl-9 pr-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none transition-all text-sm" /></div></div>
          <div><label className="block text-xs text-[#6B6B6B] mb-1">Hasta</label><div className="relative"><Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9B9B]" /><input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full h-10 pl-9 pr-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none transition-all text-sm" /></div></div>
          <div><label className="block text-xs text-[#6B6B6B] mb-1">Categoria</label>
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none transition-all text-sm bg-white"><option value="">Todas</option>{Object.entries(EXPENSE_CATEGORIES).map(([k, c]) => (<option key={k} value={k}>{c.label}</option>))}</select>
          </div>
          <div><label className="block text-xs text-[#6B6B6B] mb-1">Proyecto</label>
            <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none transition-all text-sm bg-white"><option value="">Todos</option>{projects.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}</select>
          </div>
        </div>

        {(dateFrom || dateTo || catFilter || projectFilter) && (
          <button onClick={() => { setDateFrom(''); setDateTo(''); setCatFilter(''); setProjectFilter(''); }} className="flex items-center gap-1 mt-3 text-xs text-[#C97B7B] hover:text-[#A85D5D]"><X className="w-3 h-3" />Limpiar filtros</button>
        )}
      </div>

      {/* Operational Expenses Detail Table */}
      {typeFilter.includes('operational') && (
        <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-[#E8E0D4]"><h3 className="text-base font-semibold text-[#2C2C2C]">Detalle de Gastos Operativos</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead><tr className="border-b border-[#E8E0D4]">
                <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Categoria</th>
                <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Descripcion</th>
                <th className="text-right text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Monto</th>
                <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Fecha</th>
              </tr></thead>
              <tbody>
                {filteredOpExpenses.slice(0, 30).map(e => {
                  const cat = EXPENSE_CATEGORIES[e.category];
                  const CatIcon = cat.icon;
                  return (
                    <tr key={e.id} className="border-b border-[#E8E0D4]/50 hover:bg-[#F5F0E8]/50 transition-colors">
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><CatIcon className="w-3.5 h-3.5" style={{ color: cat.color }} /><span className="text-sm text-[#2C2C2C]">{cat.label}</span></div></td>
                      <td className="px-4 py-3 text-sm text-[#2C2C2C]">{e.description}</td>
                      <td className="px-4 py-3 text-sm text-right font-mono text-[#C97B7B]">${e.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-[#6B6B6B]">{e.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredOpExpenses.length === 0 && <div className="px-4 py-8 text-center text-sm text-[#9B9B9B]">Sin gastos con los filtros seleccionados</div>}
        </div>
      )}
    </AppLayout>
  );
}
