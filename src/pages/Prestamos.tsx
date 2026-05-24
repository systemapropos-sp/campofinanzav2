import { useState, useMemo } from 'react';
import {
  HandCoins, Plus, X, Save, UserCheck, DollarSign, TrendingDown,
  CheckCircle2, Minus
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { MockLoanService, MockWorkerService } from '@/services/mockData';
import type { Loan } from '@/types';

export default function Prestamos() {
  const { hasPermission } = useAuth();
  const [loans, setLoans] = useState<Loan[]>(MockLoanService.getAll());
  const [showModal, setShowModal] = useState(false);
  const [showDeductModal, setShowDeductModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [form, setForm] = useState({ worker_id: '', amount: '', notes: '' });
  const [deductForm, setDeductForm] = useState({ amount: '', notes: '' });

  const workers = useMemo(() => MockWorkerService.getAll(), []);
  const getWorkerName = (id: string) => workers.find(w => w.id === id)?.full_name || 'Trabajador';

  const handleCreate = () => {
    if (!form.worker_id || !form.amount) return;
    const amt = Number(form.amount);
    MockLoanService.create({
      id: `ln${Date.now()}`, worker_id: form.worker_id, amount: amt, remaining: amt,
      status: 'active', date: new Date().toISOString().split('T')[0], notes: form.notes,
      deductions: [], created_at: new Date().toISOString(),
    });
    setLoans(MockLoanService.getAll());
    setShowModal(false);
    setForm({ worker_id: '', amount: '', notes: '' });
  };

  const handleDeduct = () => {
    if (!selectedLoan || !deductForm.amount) return;
    const amt = Number(deductForm.amount);
    const newRemaining = Math.max(0, selectedLoan.remaining - amt);
    const newDeductions = [...selectedLoan.deductions, {
      id: `ld${Date.now()}`, loan_id: selectedLoan.id, amount: amt,
      date: new Date().toISOString().split('T')[0], notes: deductForm.notes,
      created_at: new Date().toISOString(),
    }];
    MockLoanService.update(selectedLoan.id, {
      remaining: newRemaining, status: newRemaining <= 0 ? 'paid' as const : 'active' as const,
      deductions: newDeductions,
    });
    setLoans(MockLoanService.getAll());
    setShowDeductModal(false);
    setSelectedLoan(null);
    setDeductForm({ amount: '', notes: '' });
  };

  const totalLoaned = loans.reduce((s, l) => s + l.amount, 0);
  const totalRemaining = loans.reduce((s, l) => s + l.remaining, 0);
  const totalPaid = totalLoaned - totalRemaining;

  if (!hasPermission('loans')) {
    return (<AppLayout><div className="flex flex-col items-center justify-center h-64"><p className="text-lg font-medium text-[#2C2C2C]">Acceso Denegado</p></div></AppLayout>);
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-3xl font-bold text-[#2C2C2C]">Prestamos</h1><p className="text-sm text-[#6B6B6B] mt-1">Prestamos a trabajadores y deducciones</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#1B4332] text-white text-sm font-medium rounded-lg hover:bg-[#2D6A4F] transition-colors"><Plus className="w-4 h-4" />Nuevo Prestamo</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 mb-2"><HandCoins className="w-4 h-4 text-[#1B4332]" /><span className="text-xs text-[#6B6B6B]">Total Prestado</span></div>
          <p className="text-xl font-semibold font-mono text-[#1B4332]">${totalLoaned.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 mb-2"><DollarSign className="w-4 h-4 text-[#2D6A4F]" /><span className="text-xs text-[#6B6B6B]">Pagado</span></div>
          <p className="text-xl font-semibold font-mono text-[#2D6A4F]">${totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 mb-2"><TrendingDown className="w-4 h-4 text-[#C97B7B]" /><span className="text-xs text-[#6B6B6B]">Pendiente</span></div>
          <p className="text-xl font-semibold font-mono text-[#C97B7B]">${totalRemaining.toLocaleString()}</p>
        </div>
      </div>

      {/* Loans List */}
      <div className="space-y-4">
        {loans.map(loan => (
          <div key={loan.id} className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1B4332]/10 flex items-center justify-center"><UserCheck className="w-5 h-5 text-[#1B4332]" /></div>
                <div><p className="text-sm font-semibold text-[#2C2C2C]">{getWorkerName(loan.worker_id)}</p><p className="text-xs text-[#9B9B9B]">{loan.date}</p></div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${loan.status === 'paid' ? 'bg-[#A8C5A8]/30 text-[#1B4332]' : 'bg-[#C97B7B]/15 text-[#C97B7B]'}`}>{loan.status === 'paid' ? 'Pagado' : 'Activo'}</span>
                {loan.status === 'active' && (
                  <button onClick={() => { setSelectedLoan(loan); setShowDeductModal(true); }} className="flex items-center gap-1 px-3 py-1.5 bg-[#8B6914] text-white text-xs font-medium rounded-lg hover:bg-[#6B5010] transition-colors"><Minus className="w-3 h-3" />Deducir</button>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1"><span className="text-[#6B6B6B]">Progreso</span><span className="font-mono text-[#2C2C2C]">${(loan.amount - loan.remaining).toLocaleString()} / ${loan.amount.toLocaleString()}</span></div>
              <div className="w-full h-2 bg-[#E8E0D4] rounded-full overflow-hidden"><div className="h-full bg-[#1B4332] rounded-full transition-all" style={{ width: `${(loan.amount - loan.remaining) / loan.amount * 100}%` }} /></div>
            </div>

            {/* Deductions */}
            {loan.deductions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[#E8E0D4]/50">
                <p className="text-xs text-[#9B9B9B] uppercase tracking-wide mb-2">Deducciones</p>
                <div className="space-y-1">
                  {loan.deductions.map(d => (
                    <div key={d.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" /><span className="text-[#6B6B6B]">{d.date}</span></div>
                      <span className="font-mono text-[#2D6A4F]">${d.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {loans.length === 0 && <div className="bg-white rounded-xl p-8 text-center text-sm text-[#9B9B9B]">Sin prestamos registrados</div>}
      </div>

      {/* New Loan Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0D2818]/45 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5"><h3 className="text-lg font-semibold text-[#2C2C2C]">Nuevo Prestamo</h3><button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-[#E8E0D4] transition-colors"><X className="w-5 h-5 text-[#6B6B6B]" /></button></div>
            <div className="space-y-4">
              <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Trabajador *</label>
                <select value={form.worker_id} onChange={e => setForm({ ...form, worker_id: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none transition-all text-sm bg-white"><option value="">Seleccionar</option>{workers.filter(w => w.is_active).map(w => (<option key={w.id} value={w.id}>{w.full_name}</option>))}</select>
              </div>
              <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Monto *</label><input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none transition-all text-sm font-mono" placeholder="0" /></div>
              <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Notas</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none transition-all text-sm resize-none" /></div>
              <div className="flex gap-3 pt-2"><button onClick={() => setShowModal(false)} className="flex-1 h-11 rounded-lg border border-[#E8E0D4] text-sm font-medium text-[#6B6B6B] hover:bg-[#F5F0E8] transition-colors">Cancelar</button>
                <button onClick={handleCreate} disabled={!form.worker_id || !form.amount} className="flex-1 h-11 rounded-lg bg-[#1B4332] text-white text-sm font-medium hover:bg-[#2D6A4F] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"><Save className="w-4 h-4" />Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deduct Modal */}
      {showDeductModal && selectedLoan && (
        <div className="fixed inset-0 bg-[#0D2818]/45 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5"><h3 className="text-lg font-semibold text-[#2C2C2C]">Deduccion</h3><button onClick={() => { setShowDeductModal(false); setSelectedLoan(null); }} className="p-1 rounded hover:bg-[#E8E0D4] transition-colors"><X className="w-5 h-5 text-[#6B6B6B]" /></button></div>
            <div className="bg-[#F5F0E8] rounded-lg p-3 mb-4"><p className="text-xs text-[#6B6B6B]">Prestamo pendiente: <span className="font-mono font-semibold text-[#C97B7B]">${selectedLoan.remaining.toLocaleString()}</span></p></div>
            <div className="space-y-4">
              <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Monto a deducir *</label><input type="number" value={deductForm.amount} onChange={e => setDeductForm({ ...deductForm, amount: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none transition-all text-sm font-mono" placeholder="0" /></div>
              <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Notas</label><textarea value={deductForm.notes} onChange={e => setDeductForm({ ...deductForm, notes: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none transition-all text-sm resize-none" /></div>
              <div className="flex gap-3 pt-2"><button onClick={() => { setShowDeductModal(false); setSelectedLoan(null); }} className="flex-1 h-11 rounded-lg border border-[#E8E0D4] text-sm font-medium text-[#6B6B6B] hover:bg-[#F5F0E8] transition-colors">Cancelar</button>
                <button onClick={handleDeduct} disabled={!deductForm.amount} className="flex-1 h-11 rounded-lg bg-[#1B4332] text-white text-sm font-medium hover:bg-[#2D6A4F] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"><Minus className="w-4 h-4" />Deducir</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
