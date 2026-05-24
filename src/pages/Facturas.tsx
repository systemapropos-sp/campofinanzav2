import { useState, useMemo } from 'react';
import {
  FileText, Plus, Search, X, DollarSign, Eye, Wallet,
  AlertCircle, CheckCircle, Clock, Upload, CreditCard, Banknote
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import {
  MockInvoiceService, MockPaymentService, MockProjectService
} from '@/services/mockData';
import type { Invoice, Payment } from '@/types';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: typeof AlertCircle }> = {
  pending: { label: 'Pendiente', bg: 'bg-[#C97B7B]/15', text: 'text-[#C97B7B]', icon: AlertCircle },
  partial: { label: 'Parcial', bg: 'bg-[#8B6914]/15', text: 'text-[#8B6914]', icon: Clock },
  paid: { label: 'Pagada', bg: 'bg-[#A8C5A8]/30', text: 'text-[#1B4332]', icon: CheckCircle },
};

export default function Facturas() {
  const { hasPermission } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>(MockInvoiceService.getAll());
  const [payments, setPayments] = useState<Payment[]>(MockPaymentService.getAll());
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [invoiceForm, setInvoiceForm] = useState({
    invoice_number: '', project_id: '', supplier: '', amount: '',
    payment_type: 'cash' as 'cash' | 'credit', credit_days: '30',
    due_date: '', notes: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '', payment_method: 'cash' as 'cash' | 'transfer' | 'check', notes: '', payment_date: new Date().toISOString().split('T')[0]
  });

  const projects = useMemo(() => MockProjectService.getAll(), []);

  const filteredInvoices = useMemo(() => {
    if (!search) return invoices;
    const q = search.toLowerCase();
    return invoices.filter(inv =>
      inv.invoice_number.toLowerCase().includes(q) ||
      inv.supplier.toLowerCase().includes(q)
    );
  }, [invoices, search]);

  const getProjectName = (id: string) => projects.find(p => p.id === id)?.name || 'Proyecto';
  const getInvoicePayments = (invoiceId: string) => payments.filter(p => p.invoice_id === invoiceId);

  const handleCreateInvoice = () => {
    if (!invoiceForm.invoice_number || !invoiceForm.project_id || !invoiceForm.supplier || !invoiceForm.amount) return;
    const isCash = invoiceForm.payment_type === 'cash';
    const creditDays = isCash ? undefined : Number(invoiceForm.credit_days) || 30;
    const issueDate = new Date();
    const dueDate = creditDays ? new Date(issueDate.getTime() + creditDays * 86400000).toISOString().split('T')[0] : invoiceForm.due_date || undefined;

    MockInvoiceService.create({
      id: `inv${Date.now()}`,
      project_id: invoiceForm.project_id,
      invoice_number: invoiceForm.invoice_number,
      supplier: invoiceForm.supplier,
      amount: Number(invoiceForm.amount),
      payment_type: invoiceForm.payment_type,
      credit_days: creditDays,
      status: isCash ? 'paid' : 'pending',
      due_date: dueDate,
      paid_amount: isCash ? Number(invoiceForm.amount) : 0,
      notes: invoiceForm.notes,
      created_at: new Date().toISOString(),
    });
    setInvoices(MockInvoiceService.getAll());
    setShowInvoiceModal(false);
    setInvoiceForm({ invoice_number: '', project_id: '', supplier: '', amount: '', payment_type: 'cash', credit_days: '30', due_date: '', notes: '' });
  };

  const handleApplyPayment = () => {
    if (!selectedInvoice || !paymentForm.amount) return;
    const paymentAmount = Number(paymentForm.amount);
    const newPaidAmount = selectedInvoice.paid_amount + paymentAmount;
    let newStatus: 'pending' | 'partial' | 'paid' = 'pending';
    if (newPaidAmount >= selectedInvoice.amount) newStatus = 'paid';
    else if (newPaidAmount > 0) newStatus = 'partial';

    MockPaymentService.create({
      id: `pay${Date.now()}`,
      invoice_id: selectedInvoice.id,
      amount: paymentAmount,
      payment_date: paymentForm.payment_date,
      payment_method: paymentForm.payment_method,
      notes: paymentForm.notes,
      created_at: new Date().toISOString(),
    });

    MockInvoiceService.update(selectedInvoice.id, {
      paid_amount: newPaidAmount,
      status: newStatus,
    });

    setInvoices(MockInvoiceService.getAll());
    setPayments(MockPaymentService.getAll());
    setShowPaymentModal(false);
    setSelectedInvoice(null);
    setPaymentForm({ amount: '', payment_method: 'cash', notes: '', payment_date: new Date().toISOString().split('T')[0] });
  };

  const totalPending = invoices.filter(inv => inv.status !== 'paid').reduce((s, inv) => s + (inv.amount - inv.paid_amount), 0);
  const totalPaid = invoices.filter(inv => inv.status === 'paid').reduce((s, inv) => s + inv.amount, 0);

  if (!hasPermission('invoices')) {
    return (<AppLayout><div className="flex flex-col items-center justify-center h-64"><p className="text-lg font-medium text-[#2C2C2C]">Acceso Denegado</p><p className="text-sm text-[#6B6B6B]">No tienes permiso para ver esta seccion.</p></div></AppLayout>);
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-3xl font-bold text-[#2C2C2C]">Facturas</h1><p className="text-sm text-[#6B6B6B] mt-1">Gestion de facturas y pagos</p></div>
        <button onClick={() => setShowInvoiceModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#1B4332] text-white text-sm font-medium rounded-lg hover:bg-[#2D6A4F] transition-colors"><Plus className="w-4 h-4" />Nueva Factura</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"><div className="flex items-center gap-2 mb-2"><FileText className="w-4 h-4 text-[#1B4332]" /><span className="text-xs text-[#6B6B6B]">Total Facturas</span></div><p className="text-xl font-semibold font-mono text-[#1B4332]">{invoices.length}</p></div>
        <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"><div className="flex items-center gap-2 mb-2"><AlertCircle className="w-4 h-4 text-[#C97B7B]" /><span className="text-xs text-[#6B6B6B]">Pendientes</span></div><p className="text-xl font-semibold font-mono text-[#C97B7B]">${totalPending.toLocaleString()}</p></div>
        <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"><div className="flex items-center gap-2 mb-2"><CheckCircle className="w-4 h-4 text-[#2D6A4F]" /><span className="text-xs text-[#6B6B6B]">Pagadas</span></div><p className="text-xl font-semibold font-mono text-[#2D6A4F]">${totalPaid.toLocaleString()}</p></div>
      </div>

      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E0D4] flex-wrap gap-3">
          <h3 className="text-base font-semibold text-[#2C2C2C]">Facturas</h3>
          <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9B9B]" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar factura..." className="h-9 pl-9 pr-4 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none transition-all text-sm w-52" /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-[#E8E0D4]">
              <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">No.</th>
              <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3 hidden md:table-cell">Proyecto</th>
              <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Proveedor</th>
              <th className="text-right text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Monto</th>
              <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Tipo</th>
              <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Estado</th>
              <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3 hidden lg:table-cell">Vencimiento</th>
              <th className="text-right text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Acciones</th>
            </tr></thead>
            <tbody>
              {filteredInvoices.map(invoice => {
                const status = STATUS_CONFIG[invoice.status];
                const StatusIcon = status.icon;
                return (
                  <tr key={invoice.id} className="border-b border-[#E8E0D4]/50 hover:bg-[#F5F0E8]/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono font-medium text-[#2C2C2C]">{invoice.invoice_number}</td>
                    <td className="px-4 py-3 text-sm text-[#6B6B6B] hidden md:table-cell">{getProjectName(invoice.project_id)}</td>
                    <td className="px-4 py-3 text-sm text-[#2C2C2C]">{invoice.supplier}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-[#2C2C2C]">${invoice.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${invoice.payment_type === 'cash' ? 'bg-[#A8C5A8]/30 text-[#1B4332]' : 'bg-[#E8D5C4]/50 text-[#8B6914]'}`}>
                        {invoice.payment_type === 'cash' ? <Banknote className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                        {invoice.payment_type === 'cash' ? 'Contado' : `Credito ${invoice.credit_days}d`}
                      </span>
                    </td>
                    <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${status.bg} ${status.text}`}><StatusIcon className="w-3 h-3" />{status.label}</span></td>
                    <td className="px-4 py-3 text-sm text-[#6B6B6B] hidden lg:table-cell">{invoice.due_date || '-'}</td>
                    <td className="px-4 py-3"><div className="flex items-center justify-end gap-1"><button onClick={() => setSelectedInvoice(invoice)} className="p-1.5 rounded hover:bg-[#1B4332]/10 transition-colors" title="Ver"><Eye className="w-4 h-4 text-[#6B6B6B]" /></button>{invoice.status !== 'paid' && (<button onClick={() => { setSelectedInvoice(invoice); setShowPaymentModal(true); }} className="p-1.5 rounded hover:bg-[#2D6A4F]/10 transition-colors" title="Pagar"><DollarSign className="w-4 h-4 text-[#2D6A4F]" /></button>)}</div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredInvoices.length === 0 && <div className="px-4 py-8 text-center text-sm text-[#9B9B9B]">Sin facturas registradas</div>}
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && !showPaymentModal && (
        <div className="fixed inset-0 bg-[#0D2818]/45 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5"><h3 className="text-lg font-semibold text-[#2C2C2C]">Factura {selectedInvoice.invoice_number}</h3><button onClick={() => setSelectedInvoice(null)} className="p-1 rounded hover:bg-[#E8E0D4]"><X className="w-5 h-5 text-[#6B6B6B]" /></button></div>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-2 border-b border-[#E8E0D4]/50"><span className="text-sm text-[#6B6B6B]">Proyecto</span><span className="text-sm text-[#2C2C2C]">{getProjectName(selectedInvoice.project_id)}</span></div>
              <div className="flex justify-between py-2 border-b border-[#E8E0D4]/50"><span className="text-sm text-[#6B6B6B]">Proveedor</span><span className="text-sm text-[#2C2C2C]">{selectedInvoice.supplier}</span></div>
              <div className="flex justify-between py-2 border-b border-[#E8E0D4]/50"><span className="text-sm text-[#6B6B6B]">Tipo de Pago</span><span className="text-sm">{selectedInvoice.payment_type === 'cash' ? 'Contado' : `Credito (${selectedInvoice.credit_days} dias)`}</span></div>
              <div className="flex justify-between py-2 border-b border-[#E8E0D4]/50"><span className="text-sm text-[#6B6B6B]">Monto Total</span><span className="text-sm font-mono font-semibold text-[#2C2C2C]">${selectedInvoice.amount.toLocaleString()}</span></div>
              <div className="flex justify-between py-2 border-b border-[#E8E0D4]/50"><span className="text-sm text-[#6B6B6B]">Pagado</span><span className="text-sm font-mono text-[#2D6A4F]">${selectedInvoice.paid_amount.toLocaleString()}</span></div>
              <div className="flex justify-between py-2 border-b border-[#E8E0D4]/50"><span className="text-sm text-[#6B6B6B]">Pendiente</span><span className={`text-sm font-mono font-semibold ${(selectedInvoice.amount - selectedInvoice.paid_amount) > 0 ? 'text-[#C97B7B]' : 'text-[#2D6A4F]'}`}>${(selectedInvoice.amount - selectedInvoice.paid_amount).toLocaleString()}</span></div>
              <div className="flex justify-between py-2 border-b border-[#E8E0D4]/50"><span className="text-sm text-[#6B6B6B]">Estado</span><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_CONFIG[selectedInvoice.status].bg} ${STATUS_CONFIG[selectedInvoice.status].text}`}>{STATUS_CONFIG[selectedInvoice.status].label}</span></div>
              {selectedInvoice.due_date && <div className="flex justify-between py-2 border-b border-[#E8E0D4]/50"><span className="text-sm text-[#6B6B6B]">Vencimiento</span><span className="text-sm text-[#2C2C2C]">{selectedInvoice.due_date}</span></div>}
              {selectedInvoice.image_url && <div className="flex justify-between py-2"><span className="text-sm text-[#6B6B6B]">Imagen</span><span className="text-xs text-[#2D6A4F] break-all max-w-[200px]">{selectedInvoice.image_url}</span></div>}
            </div>
            <div>
              <p className="text-xs text-[#9B9B9B] uppercase tracking-wide mb-3">Historial de Pagos</p>
              <div className="space-y-2">{getInvoicePayments(selectedInvoice.id).map(payment => (
                <div key={payment.id} className="flex items-center justify-between py-2 border-b border-[#E8E0D4]/50 last:border-0"><div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-[#2D6A4F]" /><div><p className="text-sm text-[#2C2C2C] font-mono">${payment.amount.toLocaleString()}</p><p className="text-xs text-[#9B9B9B]">{payment.payment_date} - {payment.payment_method}</p></div></div></div>
              ))}{getInvoicePayments(selectedInvoice.id).length === 0 && <p className="text-sm text-[#9B9B9B]">Sin pagos registrados</p>}</div>
            </div>
            {selectedInvoice.status !== 'paid' && (<button onClick={() => setShowPaymentModal(true)} className="w-full mt-5 h-11 rounded-lg bg-[#1B4332] text-white text-sm font-medium hover:bg-[#2D6A4F] flex items-center justify-center gap-2"><Wallet className="w-4 h-4" />Aplicar Pago</button>)}
          </div>
        </div>
      )}

      {/* New Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-[#0D2818]/45 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5"><h3 className="text-lg font-semibold text-[#2C2C2C]">Nueva Factura</h3><button onClick={() => setShowInvoiceModal(false)} className="p-1 rounded hover:bg-[#E8E0D4]"><X className="w-5 h-5 text-[#6B6B6B]" /></button></div>
            <div className="space-y-4">
              <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Numero *</label><input value={invoiceForm.invoice_number} onChange={e => setInvoiceForm({ ...invoiceForm, invoice_number: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none transition-all text-sm font-mono" placeholder="FAC-2024-XXXX" /></div>
              <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Proyecto *</label><select value={invoiceForm.project_id} onChange={e => setInvoiceForm({ ...invoiceForm, project_id: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none transition-all text-sm bg-white"><option value="">Seleccionar</option>{projects.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}</select></div>
              <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Proveedor *</label><input value={invoiceForm.supplier} onChange={e => setInvoiceForm({ ...invoiceForm, supplier: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none transition-all text-sm" placeholder="Nombre del proveedor" /></div>

              {/* Payment Type */}
              <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Tipo de Pago</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setInvoiceForm({ ...invoiceForm, payment_type: 'cash' })} className={`h-10 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${invoiceForm.payment_type === 'cash' ? 'bg-[#1B4332] text-white' : 'bg-[#F5F0E8] text-[#6B6B6B]'}`}><Banknote className="w-4 h-4" />Contado</button>
                  <button onClick={() => setInvoiceForm({ ...invoiceForm, payment_type: 'credit' })} className={`h-10 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${invoiceForm.payment_type === 'credit' ? 'bg-[#1B4332] text-white' : 'bg-[#F5F0E8] text-[#6B6B6B]'}`}><CreditCard className="w-4 h-4" />Credito</button>
                </div>
              </div>

              {/* Credit Days - only for credit */}
              {invoiceForm.payment_type === 'credit' && (
                <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Dias de Credito</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['15', '30', '45', '60'].map(d => (
                      <button key={d} onClick={() => setInvoiceForm({ ...invoiceForm, credit_days: d })} className={`h-10 rounded-lg text-sm font-medium transition-all ${invoiceForm.credit_days === d ? 'bg-[#8B6914] text-white' : 'bg-[#F5F0E8] text-[#6B6B6B]'}`}>{d} dias</button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Monto ($) *</label><input type="number" value={invoiceForm.amount} onChange={e => setInvoiceForm({ ...invoiceForm, amount: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none transition-all text-sm font-mono" placeholder="0" /></div>
                <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Vencimiento</label><input type="date" value={invoiceForm.due_date} onChange={e => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none transition-all text-sm" /></div>
              </div>
              <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Notas</label><textarea value={invoiceForm.notes} onChange={e => setInvoiceForm({ ...invoiceForm, notes: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none transition-all text-sm resize-none" /></div>

              {/* Image Upload */}
              <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Imagen de Factura</label><div className="border-2 border-dashed border-[#D4A574] rounded-lg p-4 text-center cursor-pointer hover:bg-[#E8D5C4]/30 transition-colors"><Upload className="w-5 h-5 text-[#D4A574] mx-auto mb-1" /><p className="text-xs text-[#9B9B9B]">Subir imagen de la factura (bucket)</p></div></div>

              <div className="flex gap-3 pt-2"><button onClick={() => setShowInvoiceModal(false)} className="flex-1 h-11 rounded-lg border border-[#E8E0D4] text-sm font-medium text-[#6B6B6B] hover:bg-[#F5F0E8]">Cancelar</button>
                <button onClick={handleCreateInvoice} disabled={!invoiceForm.invoice_number || !invoiceForm.project_id || !invoiceForm.supplier || !invoiceForm.amount} className="flex-1 h-11 rounded-lg bg-[#1B4332] text-white text-sm font-medium hover:bg-[#2D6A4F] disabled:opacity-50">Crear Factura</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-[#0D2818]/45 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5"><h3 className="text-lg font-semibold text-[#2C2C2C]">Aplicar Pago</h3><button onClick={() => setShowPaymentModal(false)} className="p-1 rounded hover:bg-[#E8E0D4]"><X className="w-5 h-5 text-[#6B6B6B]" /></button></div>
            <div className="bg-[#F5F0E8] rounded-lg p-4 mb-5">
              <div className="flex justify-between mb-1"><span className="text-sm text-[#6B6B6B]">Total</span><span className="text-sm font-mono">${selectedInvoice.amount.toLocaleString()}</span></div>
              <div className="flex justify-between mb-1"><span className="text-sm text-[#6B6B6B]">Pagado</span><span className="text-sm font-mono text-[#2D6A4F]">${selectedInvoice.paid_amount.toLocaleString()}</span></div>
              <div className="h-px bg-[#E8E0D4] my-2" />
              <div className="flex justify-between"><span className="text-sm font-medium text-[#2C2C2C]">Pendiente</span><span className="text-base font-mono font-semibold text-[#C97B7B]">${(selectedInvoice.amount - selectedInvoice.paid_amount).toLocaleString()}</span></div>
            </div>
            <div className="space-y-4">
              <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Monto a Pagar *</label><input type="number" value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none text-sm font-mono" /></div>
              <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Metodo</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['cash', 'transfer', 'check'] as const).map(m => (
                    <button key={m} onClick={() => setPaymentForm({ ...paymentForm, payment_method: m })} className={`h-10 rounded-lg text-sm font-medium transition-all ${paymentForm.payment_method === m ? 'bg-[#1B4332] text-white' : 'bg-[#F5F0E8] text-[#6B6B6B]'}`}>{m === 'cash' ? 'Efectivo' : m === 'transfer' ? 'Transferencia' : 'Cheque'}</button>
                  ))}
                </div>
              </div>
              <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Fecha</label><input type="date" value={paymentForm.payment_date} onChange={e => setPaymentForm({ ...paymentForm, payment_date: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none text-sm" /></div>
              <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Notas</label><textarea value={paymentForm.notes} onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none text-sm resize-none" /></div>
              <div className="flex gap-3 pt-2"><button onClick={() => setShowPaymentModal(false)} className="flex-1 h-11 rounded-lg border border-[#E8E0D4] text-sm font-medium text-[#6B6B6B] hover:bg-[#F5F0E8]">Cancelar</button>
                <button onClick={handleApplyPayment} disabled={!paymentForm.amount} className="flex-1 h-11 rounded-lg bg-[#1B4332] text-white text-sm font-medium hover:bg-[#2D6A4F] disabled:opacity-50 flex items-center justify-center gap-2"><Wallet className="w-4 h-4" />Aplicar Pago</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
