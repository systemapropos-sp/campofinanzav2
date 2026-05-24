import { useState, useMemo } from 'react';
import {
  Plus, Search, X, Save, Upload, Fuel, Wrench,
  Zap, Truck, UtensilsCrossed, HelpCircle, TrendingDown
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { MockOperationalExpenseService, MockProjectService } from '@/services/mockData';
import type { OperationalExpense } from '@/types';

const CATEGORY_CONFIG: Record<string, { label: string; icon: typeof Fuel; color: string; bg: string }> = {
  fuel: { label: 'Combustible', icon: Fuel, color: '#8B6914', bg: 'bg-[#8B6914]/10' },
  maintenance: { label: 'Mantenimiento', icon: Wrench, color: '#6B6B6B', bg: 'bg-[#6B6B6B]/10' },
  utilities: { label: 'Servicios', icon: Zap, color: '#C9A84C', bg: 'bg-[#C9A84C]/10' },
  transport: { label: 'Transporte', icon: Truck, color: '#2D6A4F', bg: 'bg-[#2D6A4F]/10' },
  food: { label: 'Alimentacion', icon: UtensilsCrossed, color: '#D4A574', bg: 'bg-[#D4A574]/10' },
  other: { label: 'Otros', icon: HelpCircle, color: '#9B9B9B', bg: 'bg-[#9B9B9B]/10' },
};

export default function GastosOperativos() {
  const { hasPermission } = useAuth();
  const [expenses, setExpenses] = useState<OperationalExpense[]>(MockOperationalExpenseService.getAll());
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category: 'other' as OperationalExpense['category'], description: '', amount: '', date: new Date().toISOString().split('T')[0], project_id: '' });

  const projects = useMemo(() => MockProjectService.getAll(), []);

  const filtered = useMemo(() => {
    let result = expenses;
    if (search) { const q = search.toLowerCase(); result = result.filter(e => e.description.toLowerCase().includes(q)); }
    if (catFilter) result = result.filter(e => e.category === catFilter);
    return result;
  }, [expenses, search, catFilter]);

  const totalByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return map;
  }, [expenses]);

  const handleSave = () => {
    if (!form.description || !form.amount) return;
    MockOperationalExpenseService.create({ id: `oe${Date.now()}`, category: form.category, description: form.description, amount: Number(form.amount), date: form.date, project_id: form.project_id || undefined, created_by: 'u1', created_at: new Date().toISOString() });
    setExpenses(MockOperationalExpenseService.getAll());
    setShowModal(false);
    setForm({ category: 'other', description: '', amount: '', date: new Date().toISOString().split('T')[0], project_id: '' });
  };

  const handleDelete = (id: string) => { if (confirm('Eliminar este gasto?')) { MockOperationalExpenseService.delete(id); setExpenses(MockOperationalExpenseService.getAll()); } };

  if (!hasPermission('operational_expenses')) {
    return (<AppLayout><div className="flex flex-col items-center justify-center h-64"><p className="text-lg font-medium text-[#2C2C2C]">Acceso Denegado</p></div></AppLayout>);
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-3xl font-bold text-[#2C2C2C]">Gastos Operativos</h1><p className="text-sm text-[#6B6B6B] mt-1">Registro de gastos del campo</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#1B4332] text-white text-sm font-medium rounded-lg hover:bg-[#2D6A4F] transition-colors"><Plus className="w-4 h-4" />Nuevo Gasto</button>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {Object.entries(CATEGORY_CONFIG).map(([key, cat]) => {
          const CatIcon = cat.icon;
          return (
            <button key={key} onClick={() => setCatFilter(catFilter === key ? '' : key)} className={`p-4 rounded-xl text-left transition-all ${catFilter === key ? 'ring-2 ring-[#1B4332] bg-white' : 'bg-white hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]'}`}>
              <div className={`w-8 h-8 rounded-lg ${cat.bg} flex items-center justify-center mb-2`}><CatIcon className="w-4 h-4" style={{ color: cat.color }} /></div>
              <p className="text-xs text-[#6B6B6B]">{cat.label}</p>
              <p className="text-sm font-mono font-semibold text-[#2C2C2C]">${(totalByCategory[key] || 0).toLocaleString()}</p>
            </button>
          );
        })}
      </div>

      {/* Total */}
      <div className="bg-white rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2"><TrendingDown className="w-5 h-5 text-[#C97B7B]" /><span className="text-sm text-[#6B6B6B]">Total de Gastos</span></div>
        <p className="text-xl font-semibold font-mono text-[#C97B7B]">${expenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E0D4] flex-wrap gap-3">
          <h3 className="text-base font-semibold text-[#2C2C2C]">Historial de Gastos</h3>
          <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9B9B]" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="h-9 pl-9 pr-4 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none transition-all text-sm w-52" /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-[#E8E0D4]">
              <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Categoria</th>
              <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Descripcion</th>
              <th className="text-right text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Monto</th>
              <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3 hidden md:table-cell">Fecha</th>
              <th className="text-right text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3 w-10"></th>
            </tr></thead>
            <tbody>
              {filtered.map(e => { const cat = CATEGORY_CONFIG[e.category]; const CatIcon = cat.icon; return (
                <tr key={e.id} className="border-b border-[#E8E0D4]/50 hover:bg-[#F5F0E8]/50 transition-colors">
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><div className={`w-7 h-7 rounded-lg ${cat.bg} flex items-center justify-center`}><CatIcon className="w-3.5 h-3.5" style={{ color: cat.color }} /></div><span className="text-sm text-[#2C2C2C]">{cat.label}</span></div></td>
                  <td className="px-4 py-3 text-sm text-[#2C2C2C]">{e.description}</td>
                  <td className="px-4 py-3 text-sm text-right font-mono text-[#C97B7B]">${e.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-[#6B6B6B] hidden md:table-cell">{e.date}</td>
                  <td className="px-4 py-3"><button onClick={() => handleDelete(e.id)} className="p-1.5 rounded hover:bg-[#C97B7B]/10 transition-colors"><X className="w-3.5 h-3.5 text-[#C97B7B]" /></button></td>
                </tr>
              );})}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="px-4 py-8 text-center text-sm text-[#9B9B9B]">Sin gastos registrados</div>}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0D2818]/45 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5"><h3 className="text-lg font-semibold text-[#2C2C2C]">Nuevo Gasto Operativo</h3><button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-[#E8E0D4] transition-colors"><X className="w-5 h-5 text-[#6B6B6B]" /></button></div>
            <div className="space-y-4">
              <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Categoria</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as OperationalExpense['category'] })} className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none transition-all text-sm bg-white">
                  {Object.entries(CATEGORY_CONFIG).map(([k, c]) => (<option key={k} value={k}>{c.label}</option>))}
                </select>
              </div>
              <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Descripcion *</label><input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none transition-all text-sm" placeholder="Descripcion del gasto" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Monto ($) *</label><input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none transition-all text-sm font-mono" placeholder="0" /></div>
                <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Fecha</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none transition-all text-sm" /></div>
              </div>
              <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Proyecto (opcional)</label>
                <select value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none transition-all text-sm bg-white">
                  <option value="">Sin proyecto</option>{projects.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                </select>
              </div>
              <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Recibo</label><div className="border-2 border-dashed border-[#D4A574] rounded-lg p-4 text-center"><Upload className="w-5 h-5 text-[#D4A574] mx-auto mb-1" /><p className="text-xs text-[#9B9B9B]">Subir imagen del recibo (bucket)</p></div></div>
              <div className="flex gap-3 pt-2"><button onClick={() => setShowModal(false)} className="flex-1 h-11 rounded-lg border border-[#E8E0D4] text-sm font-medium text-[#6B6B6B] hover:bg-[#F5F0E8] transition-colors">Cancelar</button>
                <button onClick={handleSave} disabled={!form.description || !form.amount} className="flex-1 h-11 rounded-lg bg-[#1B4332] text-white text-sm font-medium hover:bg-[#2D6A4F] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"><Save className="w-4 h-4" />Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
