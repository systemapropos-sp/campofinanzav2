import { useState } from 'react';
import {
  Users, Plus, Pencil, Trash2, X, Save, ToggleLeft, ToggleRight,
  DollarSign, Calendar, Phone, UserCheck
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { MockWorkerService } from '@/services/mockData';
import type { Worker } from '@/types';

export default function Trabajadores() {
  const { hasPermission } = useAuth();
  const [workers, setWorkers] = useState<Worker[]>(MockWorkerService.getAll());
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Worker | null>(null);
  const [form, setForm] = useState({ full_name: '', phone: '', daily_rate: '', pay_frequency: 'daily' as 'daily' | 'weekly', is_active: true });

  const openCreate = () => {
    setEditing(null);
    setForm({ full_name: '', phone: '', daily_rate: '', pay_frequency: 'daily', is_active: true });
    setShowModal(true);
  };

  const openEdit = (w: Worker) => {
    setEditing(w);
    setForm({ full_name: w.full_name, phone: w.phone || '', daily_rate: String(w.daily_rate), pay_frequency: w.pay_frequency, is_active: w.is_active });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.full_name || !form.daily_rate) return;
    const data = { full_name: form.full_name, phone: form.phone || undefined, daily_rate: Number(form.daily_rate), pay_frequency: form.pay_frequency, is_active: form.is_active };
    if (editing) { MockWorkerService.update(editing.id, data); }
    else { MockWorkerService.create({ id: `w${Date.now()}`, ...data, created_at: new Date().toISOString() }); }
    setWorkers(MockWorkerService.getAll());
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Eliminar este trabajador?')) { MockWorkerService.delete(id); setWorkers(MockWorkerService.getAll()); }
  };

  const toggleActive = (id: string, current: boolean) => {
    MockWorkerService.update(id, { is_active: !current });
    setWorkers(MockWorkerService.getAll());
  };

  if (!hasPermission('workers')) {
    return (<AppLayout><div className="flex flex-col items-center justify-center h-64"><p className="text-lg font-medium text-[#2C2C2C]">Acceso Denegado</p></div></AppLayout>);
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-3xl font-bold text-[#2C2C2C]">Trabajadores</h1><p className="text-sm text-[#6B6B6B] mt-1">Gestion de trabajadores y tarifas</p></div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-[#1B4332] text-white text-sm font-medium rounded-lg hover:bg-[#2D6A4F] transition-colors"><Plus className="w-4 h-4" />Nuevo Trabajador</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 mb-2"><Users className="w-4 h-4 text-[#1B4332]" /><span className="text-xs text-[#6B6B6B]">Total</span></div>
          <p className="text-xl font-semibold font-mono text-[#1B4332]">{workers.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 mb-2"><UserCheck className="w-4 h-4 text-[#2D6A4F]" /><span className="text-xs text-[#6B6B6B]">Activos</span></div>
          <p className="text-xl font-semibold font-mono text-[#2D6A4F]">{workers.filter(w => w.is_active).length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 mb-2"><DollarSign className="w-4 h-4 text-[#8B6914]" /><span className="text-xs text-[#6B6B6B]">Promedio/Dia</span></div>
          <p className="text-xl font-semibold font-mono text-[#8B6914]">${Math.round(workers.reduce((s, w) => s + w.daily_rate, 0) / (workers.length || 1))}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 mb-2"><Calendar className="w-4 h-4 text-[#C97B7B]" /><span className="text-xs text-[#6B6B6B]">Por Semana</span></div>
          <p className="text-xl font-semibold font-mono text-[#C97B7B]">{workers.filter(w => w.pay_frequency === 'weekly').length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E8E0D4]"><h3 className="text-base font-semibold text-[#2C2C2C]">Lista de Trabajadores</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-[#E8E0D4]">
              <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Nombre</th>
              <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3 hidden md:table-cell">Telefono</th>
              <th className="text-right text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Tarifa/Dia</th>
              <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Pago</th>
              <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Estado</th>
              <th className="text-right text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Acciones</th>
            </tr></thead>
            <tbody>
              {workers.map(w => (
                <tr key={w.id} className="border-b border-[#E8E0D4]/50 hover:bg-[#F5F0E8]/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#1B4332]/10 text-[#1B4332] text-sm font-semibold flex items-center justify-center">{w.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</div>
                      <span className="text-sm font-medium text-[#2C2C2C]">{w.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#6B6B6B] hidden md:table-cell"><div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{w.phone || '-'}</div></td>
                  <td className="px-4 py-3 text-sm text-right font-mono text-[#2C2C2C]">${w.daily_rate.toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${w.pay_frequency === 'daily' ? 'bg-[#A8C5A8]/30 text-[#1B4332]' : 'bg-[#E8D5C4]/50 text-[#8B6914]'}`}>{w.pay_frequency === 'daily' ? 'Por Dia' : 'Por Semana'}</span></td>
                  <td className="px-4 py-3"><button onClick={() => toggleActive(w.id, w.is_active)}>{w.is_active ? <ToggleRight className="w-6 h-6 text-[#2D6A4F]" /> : <ToggleLeft className="w-6 h-6 text-[#9B9B9B]" />}</button></td>
                  <td className="px-4 py-3"><div className="flex items-center justify-end gap-1"><button onClick={() => openEdit(w)} className="p-1.5 rounded hover:bg-[#2D6A4F]/10 transition-colors"><Pencil className="w-3.5 h-3.5 text-[#6B6B6B]" /></button><button onClick={() => handleDelete(w.id)} className="p-1.5 rounded hover:bg-[#C97B7B]/10 transition-colors"><Trash2 className="w-3.5 h-3.5 text-[#C97B7B]" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {workers.length === 0 && <div className="px-4 py-8 text-center text-sm text-[#9B9B9B]">Sin trabajadores registrados</div>}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0D2818]/45 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-[#2C2C2C]">{editing ? 'Editar Trabajador' : 'Nuevo Trabajador'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-[#E8E0D4] transition-colors"><X className="w-5 h-5 text-[#6B6B6B]" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Nombre Completo *</label><input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.15)] outline-none transition-all text-sm" placeholder="Nombre completo" /></div>
              <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Telefono</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.15)] outline-none transition-all text-sm" placeholder="555-0000" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Tarifa por Dia ($) *</label><input type="number" value={form.daily_rate} onChange={e => setForm({ ...form, daily_rate: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.15)] outline-none transition-all text-sm font-mono" placeholder="0" /></div>
                <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Frecuencia de Pago</label>
                  <select value={form.pay_frequency} onChange={e => setForm({ ...form, pay_frequency: e.target.value as 'daily' | 'weekly' })} className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.15)] outline-none transition-all text-sm bg-white">
                    <option value="daily">Por Dia</option><option value="weekly">Por Semana</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between py-2"><span className="text-sm text-[#6B6B6B]">Trabajador Activo</span><button onClick={() => setForm({ ...form, is_active: !form.is_active })}>{form.is_active ? <ToggleRight className="w-6 h-6 text-[#2D6A4F]" /> : <ToggleLeft className="w-6 h-6 text-[#9B9B9B]" />}</button></div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 h-11 rounded-lg border border-[#E8E0D4] text-sm font-medium text-[#6B6B6B] hover:bg-[#F5F0E8] transition-colors">Cancelar</button>
                <button onClick={handleSave} disabled={!form.full_name || !form.daily_rate} className="flex-1 h-11 rounded-lg bg-[#1B4332] text-white text-sm font-medium hover:bg-[#2D6A4F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"><Save className="w-4 h-4" />Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
