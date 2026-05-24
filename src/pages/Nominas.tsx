import { useState, useMemo } from 'react';
import {
  Banknote, Plus, X, Save, CheckCircle2, Circle, UserCheck, TrendingUp
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { MockPayrollService, MockWorkerService, MockProjectService } from '@/services/mockData';
import type { Payroll } from '@/types';

export default function Nominas() {
  const { hasPermission } = useAuth();
  const [payrolls, setPayrolls] = useState<Payroll[]>(MockPayrollService.getAll());
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ worker_id: '', project_id: '', days_worked: '5', week_start: '', week_end: '', notes: '' });

  const workers = useMemo(() => MockWorkerService.getActive(), []);
  const projects = useMemo(() => MockProjectService.getAll(), []);

  const getWorkerName = (id: string) => workers.find(w => w.id === id)?.full_name || MockWorkerService.getAll().find(w => w.id === id)?.full_name || 'Trabajador';
  const getProjectName = (id?: string) => projects.find(p => p.id === id)?.name || '-';

  const handleSave = () => {
    if (!form.worker_id || !form.days_worked || !form.week_start) return;
    const worker = MockWorkerService.getAll().find(w => w.id === form.worker_id);
    if (!worker) return;
    const days = Number(form.days_worked);
    MockPayrollService.create({
      id: `py${Date.now()}`, worker_id: form.worker_id, project_id: form.project_id || undefined,
      days_worked: days, daily_rate: worker.daily_rate, total: days * worker.daily_rate,
      week_start: form.week_start, week_end: form.week_end || form.week_start,
      is_paid: false, notes: form.notes, created_at: new Date().toISOString(),
    });
    setPayrolls(MockPayrollService.getAll());
    setShowModal(false);
    setForm({ worker_id: '', project_id: '', days_worked: '5', week_start: '', week_end: '', notes: '' });
  };

  const togglePaid = (id: string, current: boolean) => {
    MockPayrollService.update(id, { is_paid: !current, paid_date: !current ? new Date().toISOString().split('T')[0] : undefined });
    setPayrolls(MockPayrollService.getAll());
  };

  const totalPaid = payrolls.filter(p => p.is_paid).reduce((s, p) => s + p.total, 0);
  const totalPending = payrolls.filter(p => !p.is_paid).reduce((s, p) => s + p.total, 0);

  if (!hasPermission('payroll')) {
    return (<AppLayout><div className="flex flex-col items-center justify-center h-64"><p className="text-lg font-medium text-[#2C2C2C]">Acceso Denegado</p></div></AppLayout>);
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-3xl font-bold text-[#2C2C2C]">Nominas</h1><p className="text-sm text-[#6B6B6B] mt-1">Gestion de pagos a trabajadores</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#1B4332] text-white text-sm font-medium rounded-lg hover:bg-[#2D6A4F] transition-colors"><Plus className="w-4 h-4" />Nueva Nomina</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 mb-2"><Banknote className="w-4 h-4 text-[#1B4332]" /><span className="text-xs text-[#6B6B6B]">Pagadas</span></div>
          <p className="text-xl font-semibold font-mono text-[#1B4332]">${totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-[#8B6914]" /><span className="text-xs text-[#6B6B6B]">Pendientes</span></div>
          <p className="text-xl font-semibold font-mono text-[#8B6914]">${totalPending.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 mb-2"><UserCheck className="w-4 h-4 text-[#2D6A4F]" /><span className="text-xs text-[#6B6B6B]">Registros</span></div>
          <p className="text-xl font-semibold font-mono text-[#2D6A4F]">{payrolls.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E8E0D4]"><h3 className="text-base font-semibold text-[#2C2C2C]">Historial de Nominas</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-[#E8E0D4]">
              <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Trabajador</th>
              <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3 hidden md:table-cell">Proyecto</th>
              <th className="text-right text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Dias</th>
              <th className="text-right text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Tarifa</th>
              <th className="text-right text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Total</th>
              <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Semana</th>
              <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Estado</th>
            </tr></thead>
            <tbody>
              {payrolls.map(p => (
                <tr key={p.id} className="border-b border-[#E8E0D4]/50 hover:bg-[#F5F0E8]/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-[#2C2C2C]">{getWorkerName(p.worker_id)}</td>
                  <td className="px-4 py-3 text-sm text-[#6B6B6B] hidden md:table-cell">{getProjectName(p.project_id)}</td>
                  <td className="px-4 py-3 text-sm text-right font-mono text-[#2C2C2C]">{p.days_worked}</td>
                  <td className="px-4 py-3 text-sm text-right font-mono text-[#6B6B6B]">${p.daily_rate.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right font-mono font-semibold text-[#1B4332]">${p.total.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-[#6B6B6B]">{p.week_start} - {p.week_end}</td>
                  <td className="px-4 py-3"><button onClick={() => togglePaid(p.id, p.is_paid)} className="flex items-center gap-1.5">{p.is_paid ? <><CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" /><span className="text-xs text-[#2D6A4F] font-medium">Pagado</span></> : <><Circle className="w-4 h-4 text-[#8B6914]" /><span className="text-xs text-[#8B6914] font-medium">Pendiente</span></>}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0D2818]/45 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5"><h3 className="text-lg font-semibold text-[#2C2C2C]">Nueva Nomina</h3><button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-[#E8E0D4] transition-colors"><X className="w-5 h-5 text-[#6B6B6B]" /></button></div>
            <div className="space-y-4">
              <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Trabajador *</label>
                <select value={form.worker_id} onChange={e => setForm({ ...form, worker_id: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none transition-all text-sm bg-white"><option value="">Seleccionar</option>{workers.map(w => (<option key={w.id} value={w.id}>{w.full_name} - ${w.daily_rate}/dia</option>))}</select>
              </div>
              <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Proyecto</label>
                <select value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none transition-all text-sm bg-white"><option value="">Sin proyecto</option>{projects.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}</select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Dias *</label><input type="number" value={form.days_worked} onChange={e => setForm({ ...form, days_worked: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none transition-all text-sm font-mono" placeholder="5" /></div>
                <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Inicio</label><input type="date" value={form.week_start} onChange={e => setForm({ ...form, week_start: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none transition-all text-sm" /></div>
                <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Fin</label><input type="date" value={form.week_end} onChange={e => setForm({ ...form, week_end: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none transition-all text-sm" /></div>
              </div>
              <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Notas</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none transition-all text-sm resize-none" /></div>
              <div className="flex gap-3 pt-2"><button onClick={() => setShowModal(false)} className="flex-1 h-11 rounded-lg border border-[#E8E0D4] text-sm font-medium text-[#6B6B6B] hover:bg-[#F5F0E8] transition-colors">Cancelar</button>
                <button onClick={handleSave} disabled={!form.worker_id || !form.days_worked || !form.week_start} className="flex-1 h-11 rounded-lg bg-[#1B4332] text-white text-sm font-medium hover:bg-[#2D6A4F] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"><Save className="w-4 h-4" />Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
