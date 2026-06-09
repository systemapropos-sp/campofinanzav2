import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Plus, Pencil, Trash2, X, ChevronDown, ChevronUp, DollarSign, Users, BarChart3, Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { MockInvestorService, MockProjectService } from '@/services/mockData';
import type { Investor, ProjectInvestor } from '@/types';

const fmt = (n: number) => new Intl.NumberFormat('es-DO', { minimumFractionDigits: 0 }).format(n);

export default function Inversionistas() {
  const navigate = useNavigate();
  const { hasPermission, isAdmin } = useAuth();
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [projectInvestors, setProjectInvestors] = useState<ProjectInvestor[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState<string | null>(null);
  const [editing, setEditing] = useState<Investor | null>(null);

  // Investor form state
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', empresa: '', capital_total: '', notas: '' });
  // Assign form state
  const [assignForm, setAssignForm] = useState({ proyecto_id: '', capital_invertido: '', porcentaje_ganancia: '', notas: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!hasPermission('investors') && !isAdmin) {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setInvestors(MockInvestorService.getAll());
    setProjectInvestors(MockInvestorService.getProjectInvestors());
    setProjects(MockProjectService.getAll());
    setLoading(false);
  }

  function openCreate() { setEditing(null); setForm({ nombre: '', email: '', telefono: '', empresa: '', capital_total: '', notas: '' }); setShowForm(true); }
  function openEdit(inv: Investor) { setEditing(inv); setForm({ nombre: inv.nombre, email: inv.email ?? '', telefono: inv.telefono ?? '', empresa: inv.empresa ?? '', capital_total: String(inv.capital_total), notas: inv.notas ?? '' }); setShowForm(true); }

  async function saveInvestor() {
    if (!form.nombre.trim()) return;
    setSaving(true);
    const data = { nombre: form.nombre.trim(), email: form.email || undefined, telefono: form.telefono || undefined, empresa: form.empresa || undefined, capital_total: parseFloat(form.capital_total) || 0, notas: form.notas || undefined };
    if (editing) { await MockInvestorService.update(editing.id, data); } else { await MockInvestorService.create(data); }
    setShowForm(false);
    setInvestors(MockInvestorService.getAll());
    setSaving(false);
  }

  async function deleteInvestor(id: string) {
    if (!confirm('¿Eliminar inversionista?')) return;
    await MockInvestorService.delete(id);
    setInvestors(MockInvestorService.getAll());
  }

  async function saveAssign(investorId: string) {
    if (!assignForm.proyecto_id || !assignForm.capital_invertido) return;
    setSaving(true);
    await MockInvestorService.assignToProject({
      inversionista_id: investorId, proyecto_id: assignForm.proyecto_id,
      capital_invertido: parseFloat(assignForm.capital_invertido) || 0,
      porcentaje_ganancia: parseFloat(assignForm.porcentaje_ganancia) || 0,
      notas: assignForm.notas || ''
    });
    setProjectInvestors(MockInvestorService.getProjectInvestors());
    setShowAssignForm(null);
    setAssignForm({ proyecto_id: '', capital_invertido: '', porcentaje_ganancia: '', notas: '' });
    setSaving(false);
  }

  async function deletePi(id: string) {
    if (!confirm('¿Eliminar asignación?')) return;
    await MockInvestorService.deleteProjectInvestor(id);
    setProjectInvestors(MockInvestorService.getProjectInvestors());
  }

  const totalCapital = investors.reduce((s, i) => s + i.capital_total, 0);
  const totalInvertido = projectInvestors.reduce((s, pi) => s + pi.capital_invertido, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#2C2C2C]">Inversionistas</h1>
            <p className="text-sm text-[#9B9B9B] mt-0.5">Control de capital e inversiones en proyectos</p>
          </div>
          {isAdmin && (
            <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#1B4332] text-white text-sm font-medium rounded-xl hover:bg-[#2D6A4F] transition-colors">
              <Plus className="w-4 h-4" /> Nuevo Inversionista
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Users, label: 'Total Inversionistas', value: investors.length.toString(), color: '#1B4332' },
            { icon: DollarSign, label: 'Capital Total Registrado', value: `RD$ ${fmt(totalCapital)}`, color: '#2D6A4F' },
            { icon: BarChart3, label: 'Capital Invertido', value: `RD$ ${fmt(totalInvertido)}`, color: '#D4A574' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-[#E8E0D4]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${s.color}15` }}>
                  <s.icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-xs text-[#9B9B9B]">{s.label}</p>
                  <p className="text-xl font-bold text-[#2C2C2C]">{s.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Investor List */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-[#1B4332] animate-spin" /></div>
        ) : investors.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8E0D4] p-12 text-center">
            <TrendingUp className="w-12 h-12 text-[#E8E0D4] mx-auto mb-3" />
            <p className="text-[#9B9B9B]">No hay inversionistas registrados</p>
            {isAdmin && <button onClick={openCreate} className="mt-4 px-4 py-2 bg-[#1B4332] text-white text-sm rounded-xl hover:bg-[#2D6A4F] transition-colors">Agregar primero</button>}
          </div>
        ) : (
          <div className="space-y-3">
            {investors.map(inv => {
              const pis = projectInvestors.filter(pi => pi.inversionista_id === inv.id);
              const isOpen = expanded === inv.id;
              return (
                <div key={inv.id} className="bg-white rounded-2xl border border-[#E8E0D4] overflow-hidden">
                  {/* Main row */}
                  <div className="flex items-center justify-between p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1B4332] text-white font-semibold text-sm flex items-center justify-center shrink-0">
                        {inv.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-[#2C2C2C]">{inv.nombre}</p>
                        <p className="text-xs text-[#9B9B9B]">{inv.empresa ?? inv.email ?? '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-[#9B9B9B]">Capital</p>
                        <p className="font-semibold text-[#1B4332]">RD$ {fmt(inv.capital_total)}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium hidden sm:inline ${pis.length > 0 ? 'bg-[#1B4332]/10 text-[#1B4332]' : 'bg-[#F5F0E8] text-[#9B9B9B]'}`}>
                        {pis.length} proyecto{pis.length !== 1 ? 's' : ''}
                      </span>
                      {isAdmin && (
                        <>
                          <button onClick={() => openEdit(inv)} className="p-1.5 rounded-lg hover:bg-[#F5F0E8] text-[#6B6B6B]"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => deleteInvestor(inv.id)} className="p-1.5 rounded-lg hover:bg-[#C97B7B]/10 text-[#C97B7B]"><Trash2 className="w-4 h-4" /></button>
                        </>
                      )}
                      <button onClick={() => setExpanded(isOpen ? null : inv.id)} className="p-1.5 rounded-lg hover:bg-[#F5F0E8] text-[#6B6B6B]">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded: project assignments */}
                  {isOpen && (
                    <div className="border-t border-[#E8E0D4] bg-[#F5F0E8]/40 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-[#2C2C2C]">Proyectos asignados</p>
                        {isAdmin && (
                          <button onClick={() => { setShowAssignForm(inv.id); setAssignForm({ proyecto_id: '', capital_invertido: '', porcentaje_ganancia: '', notas: '' }); }}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 bg-[#1B4332] text-white rounded-lg hover:bg-[#2D6A4F]">
                            <Plus className="w-3 h-3" /> Asignar proyecto
                          </button>
                        )}
                      </div>

                      {showAssignForm === inv.id && (
                        <div className="bg-white rounded-xl p-4 mb-3 border border-[#E8E0D4] space-y-3">
                          <select value={assignForm.proyecto_id} onChange={e => setAssignForm(f => ({ ...f, proyecto_id: e.target.value }))}
                            className="w-full px-3 py-2 text-sm border border-[#E8E0D4] rounded-xl focus:outline-none focus:border-[#2D6A4F]">
                            <option value="">Seleccionar proyecto...</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                          <div className="grid grid-cols-2 gap-2">
                            <input type="number" placeholder="Capital invertido" value={assignForm.capital_invertido}
                              onChange={e => setAssignForm(f => ({ ...f, capital_invertido: e.target.value }))}
                              className="px-3 py-2 text-sm border border-[#E8E0D4] rounded-xl focus:outline-none focus:border-[#2D6A4F]" />
                            <input type="number" placeholder="% ganancia" value={assignForm.porcentaje_ganancia}
                              onChange={e => setAssignForm(f => ({ ...f, porcentaje_ganancia: e.target.value }))}
                              className="px-3 py-2 text-sm border border-[#E8E0D4] rounded-xl focus:outline-none focus:border-[#2D6A4F]" />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => saveAssign(inv.id)} disabled={saving}
                              className="flex-1 py-2 bg-[#1B4332] text-white text-sm rounded-xl hover:bg-[#2D6A4F] disabled:opacity-60">
                              {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button onClick={() => setShowAssignForm(null)} className="px-4 py-2 border border-[#E8E0D4] text-sm rounded-xl hover:bg-[#F5F0E8]">Cancelar</button>
                          </div>
                        </div>
                      )}

                      {pis.length === 0 ? (
                        <p className="text-sm text-[#9B9B9B] py-2">Sin proyectos asignados aún</p>
                      ) : (
                        <div className="space-y-2">
                          {pis.map(pi => (
                            <div key={pi.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-[#E8E0D4]">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[#2C2C2C] truncate">{pi.project_name || 'Proyecto'}</p>
                                <p className="text-xs text-[#9B9B9B]">Capital: RD$ {fmt(pi.capital_invertido)} · {pi.porcentaje_ganancia}% · Est: RD$ {fmt(pi.ganancia_estimada)}</p>
                              </div>
                              <div className="flex items-center gap-2 ml-3 shrink-0">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  pi.status === 'pagado' ? 'bg-green-100 text-green-700' :
                                  pi.status === 'cancelado' ? 'bg-red-100 text-red-700' :
                                  'bg-[#1B4332]/10 text-[#1B4332]'
                                }`}>{pi.status}</span>
                                {isAdmin && <button onClick={() => deletePi(pi.id)} className="p-1 rounded hover:bg-[#C97B7B]/10 text-[#C97B7B]"><Trash2 className="w-3.5 h-3.5" /></button>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E0D4]">
              <h3 className="font-semibold text-[#2C2C2C]">{editing ? 'Editar Inversionista' : 'Nuevo Inversionista'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-[#F5F0E8]"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Nombre *</label>
                <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-[#E8E0D4] rounded-xl text-sm focus:outline-none focus:border-[#2D6A4F]" placeholder="Juan Pérez" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-[#E8E0D4] rounded-xl text-sm focus:outline-none focus:border-[#2D6A4F]" placeholder="email@ejemplo.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Teléfono</label>
                  <input value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-[#E8E0D4] rounded-xl text-sm focus:outline-none focus:border-[#2D6A4F]" placeholder="809-000-0000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Empresa</label>
                  <input value={form.empresa} onChange={e => setForm(f => ({ ...f, empresa: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-[#E8E0D4] rounded-xl text-sm focus:outline-none focus:border-[#2D6A4F]" placeholder="Empresa S.A." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Capital Total (RD$)</label>
                  <input type="number" value={form.capital_total} onChange={e => setForm(f => ({ ...f, capital_total: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-[#E8E0D4] rounded-xl text-sm focus:outline-none focus:border-[#2D6A4F]" placeholder="500000" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Notas</label>
                <textarea value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} rows={2}
                  className="w-full px-3 py-2.5 border border-[#E8E0D4] rounded-xl text-sm focus:outline-none focus:border-[#2D6A4F] resize-none" placeholder="Observaciones..." />
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-[#E8E0D4]">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-[#E8E0D4] text-sm rounded-xl hover:bg-[#F5F0E8]">Cancelar</button>
              <button onClick={saveInvestor} disabled={saving || !form.nombre.trim()}
                className="flex-1 py-2.5 bg-[#1B4332] text-white text-sm rounded-xl hover:bg-[#2D6A4F] disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
