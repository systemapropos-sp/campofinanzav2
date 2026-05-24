import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Plus, ArrowLeft, X, Save,
  DollarSign, BarChart3, FileText, Wallet,
  Pencil, KanbanSquare, ClipboardList, CheckCircle2, Clock, UserCheck, Users
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import {
  MockProjectService, MockEntryService, MockUserService, MockWorkerService,
} from '@/services/mockData';
import type { Project } from '@/types';

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-[#A8C5A8]', text: 'text-[#1B4332]', label: 'Activo' },
  paused: { bg: 'bg-[#E8D5C4]', text: 'text-[#8B6914]', label: 'Pausado' },
  completed: { bg: 'bg-[#E8E0D4]', text: 'text-[#6B6B6B]', label: 'Completado' },
};

const PIPELINE_STAGES: { key: Project['pipeline_stage']; label: string; icon: typeof Clock }[] = [
  { key: 'planning', label: 'Planificacion', icon: ClipboardList },
  { key: 'in_progress', label: 'En Progreso', icon: KanbanSquare },
  { key: 'review', label: 'Revision', icon: Clock },
  { key: 'completed', label: 'Completado', icon: CheckCircle2 },
];

export default function ProjectDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const projectId = id || '';
  const { hasPermission } = useAuth();

  const [activeTab, setActiveTab] = useState<'resumen' | 'entradas' | 'finanzas' | 'equipo'>('resumen');
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showEditName, setShowEditName] = useState(false);
  const [entryForm, setEntryForm] = useState({ quantity: '', amount: '', date: '', time: '', notes: '' });
  const [editNameForm, setEditNameForm] = useState({ name: '', description: '' });
  const [refreshKey, setRefreshKey] = useState(0);

  const users = useMemo(() => MockUserService.getAll(), []);
  const allWorkers = useMemo(() => MockWorkerService.getAll(), []);

  const project = useMemo(() => {
    const p = MockProjectService.getById(projectId);
    return p || null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, refreshKey]);

  const entries = useMemo(() => MockEntryService.getByProject(projectId), [projectId]);

  const getUserName = (uid: string) => users.find(u => u.id === uid)?.full_name || 'Usuario';

  const refresh = () => setRefreshKey(k => k + 1);

  const handleAddEntry = () => {
    if (!entryForm.quantity || !entryForm.amount || !entryForm.date) return;
    MockEntryService.create({
      id: `e${Date.now()}`, project_id: projectId,
      quantity: Number(entryForm.quantity), amount: Number(entryForm.amount),
      date: entryForm.date, time: entryForm.time || new Date().toTimeString().slice(0, 5),
      user_id: 'u1', notes: entryForm.notes, created_at: new Date().toISOString(),
    });
    setShowEntryModal(false);
    setEntryForm({ quantity: '', amount: '', date: '', time: '', notes: '' });
  };

  const handleEditName = () => {
    if (!editNameForm.name.trim()) return;
    MockProjectService.update(projectId, { name: editNameForm.name, description: editNameForm.description });
    refresh();
    setShowEditName(false);
  };

  const handleSetManager = (managerId: string) => {
    MockProjectService.update(projectId, { manager_id: managerId });
    refresh();
  };

  const handleToggleWorker = (workerId: string) => {
    const currentWorkers = project?.worker_ids || [];
    const newWorkers = currentWorkers.includes(workerId)
      ? currentWorkers.filter(w => w !== workerId)
      : [...currentWorkers, workerId];
    MockProjectService.update(projectId, { worker_ids: newWorkers });
    refresh();
  };

  const handlePipelineChange = (stage: Project['pipeline_stage']) => {
    MockProjectService.update(projectId, { pipeline_stage: stage });
    refresh();
  };

  if (!hasPermission('projects')) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-lg font-medium text-[#2C2C2C]">Acceso Denegado</p>
          <p className="text-sm text-[#6B6B6B]">No tienes permiso para ver esta seccion.</p>
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-lg font-medium text-[#2C2C2C]">Proyecto no encontrado</p>
          <button onClick={() => navigate('/proyectos')} className="mt-4 px-4 py-2 bg-[#1B4332] text-white text-sm rounded-lg">
            Volver a Proyectos
          </button>
        </div>
      </AppLayout>
    );
  }

  const budgetUsed = project.budget > 0 ? (project.spent / project.budget) * 100 : 0;
  const remaining = project.budget - project.spent;

  return (
    <AppLayout>
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <button onClick={() => navigate('/proyectos')} className="p-2 rounded-lg hover:bg-[#E8E0D4] transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5 text-[#2C2C2C]" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#2C2C2C] truncate">{project.name}</h1>
              <button
                onClick={() => { setEditNameForm({ name: project.name, description: project.description || '' }); setShowEditName(true); }}
                className="p-1 rounded hover:bg-[#E8E0D4] transition-colors shrink-0"
              >
                <Pencil className="w-3.5 h-3.5 text-[#9B9B9B]" />
              </button>
            </div>
            <p className="text-sm text-[#6B6B6B] truncate">{project.description}</p>
          </div>
          <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[project.status].bg} ${STATUS_COLORS[project.status].text}`}>
            {STATUS_COLORS[project.status].label}
          </span>
        </div>

        {/* Pipeline */}
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] mb-6">
          <h3 className="text-sm font-semibold text-[#2C2C2C] mb-3 flex items-center gap-2">
            <KanbanSquare className="w-4 h-4 text-[#1B4332]" />Flujo de Trabajo
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PIPELINE_STAGES.map(stage => {
              const StageIcon = stage.icon;
              const isActive = project.pipeline_stage === stage.key;
              const stageIdx = PIPELINE_STAGES.findIndex(s => s.key === project.pipeline_stage);
              const thisIdx = PIPELINE_STAGES.findIndex(s => s.key === stage.key);
              const isPast = stageIdx >= thisIdx;
              return (
                <button
                  key={stage.key}
                  onClick={() => handlePipelineChange(stage.key)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    isActive ? 'bg-[#1B4332] text-white shadow-lg' : isPast ? 'bg-[#2D6A4F]/10 text-[#2D6A4F]' : 'bg-[#F5F0E8] text-[#9B9B9B] hover:bg-[#E8E0D4]'
                  }`}
                >
                  <StageIcon className="w-5 h-5 mx-auto mb-1" />
                  <p className="text-[11px] sm:text-xs font-medium">{stage.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-lg p-1 w-fit shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-x-auto max-w-full">
          {(['resumen', 'entradas', 'finanzas', 'equipo'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium capitalize transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-[#1B4332] text-white' : 'text-[#6B6B6B] hover:bg-[#F5F0E8]'
              }`}
            >
              {tab === 'equipo' ? 'Equipo' : tab}
            </button>
          ))}
        </div>

        {/* Resumen */}
        {activeTab === 'resumen' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-2 mb-2"><Wallet className="w-4 h-4 text-[#1B4332]" /><span className="text-xs text-[#6B6B6B]">Presupuesto</span></div>
                <p className="text-xl font-semibold font-mono text-[#1B4332]">${project.budget.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-2 mb-2"><DollarSign className="w-4 h-4 text-[#C97B7B]" /><span className="text-xs text-[#6B6B6B]">Gastado</span></div>
                <p className="text-xl font-semibold font-mono text-[#C97B7B]">${project.spent.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-2 mb-2"><BarChart3 className="w-4 h-4 text-[#2D6A4F]" /><span className="text-xs text-[#6B6B6B]">Restante</span></div>
                <p className={`text-xl font-semibold font-mono ${remaining >= 0 ? 'text-[#2D6A4F]' : 'text-[#C97B7B]'}`}>${remaining.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-[#2C2C2C]">Progreso del Presupuesto</span>
                <span className="text-sm font-mono text-[#6B6B6B]">{budgetUsed.toFixed(1)}%</span>
              </div>
              <div className="w-full h-3 bg-[#E8E0D4] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(budgetUsed, 100)}%`, backgroundColor: budgetUsed > 90 ? '#C97B7B' : budgetUsed > 75 ? '#8B6914' : '#1B4332' }} />
              </div>
            </div>

            {/* Manager */}
            <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <h3 className="text-sm font-semibold text-[#2C2C2C] mb-3 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#1B4332]" />Encargado
              </h3>
              <div className="flex flex-wrap gap-2">
                {users.filter(u => u.is_active).map(u => (
                  <button
                    key={u.id}
                    onClick={() => handleSetManager(u.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                      project.manager_id === u.id ? 'bg-[#1B4332] text-white' : 'bg-[#F5F0E8] text-[#6B6B6B] hover:bg-[#E8E0D4]'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-semibold">
                      {u.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    {u.full_name}
                  </button>
                ))}
              </div>
            </div>

            {/* Workers */}
            <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <h3 className="text-sm font-semibold text-[#2C2C2C] mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#1B4332]" />Trabajadores Asignados ({project.worker_ids.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {allWorkers.filter(w => w.is_active).map(w => (
                  <button
                    key={w.id}
                    onClick={() => handleToggleWorker(w.id)}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      project.worker_ids.includes(w.id) ? 'bg-[#2D6A4F] text-white' : 'bg-[#F5F0E8] text-[#6B6B6B] hover:bg-[#E8E0D4]'
                    }`}
                  >
                    {w.full_name}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent entries */}
            <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <h3 className="text-base font-semibold text-[#2C2C2C] mb-3">Entradas Recientes</h3>
              {entries.slice(0, 3).map(entry => (
                <div key={entry.id} className="flex items-center justify-between py-2 border-b border-[#E8E0D4]/50 last:border-0">
                  <div>
                    <p className="text-sm text-[#2C2C2C]">{entry.notes || 'Sin descripcion'}</p>
                    <p className="text-xs text-[#9B9B9B]">{entry.date} por {getUserName(entry.user_id)}</p>
                  </div>
                  <span className="font-mono text-sm text-[#1B4332]">${entry.amount.toLocaleString()}</span>
                </div>
              ))}
              {entries.length === 0 && <p className="text-sm text-[#9B9B9B]">Sin entradas registradas</p>}
            </div>
          </div>
        )}

        {/* Entradas */}
        {activeTab === 'entradas' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#2C2C2C]">Registro de Entradas</h3>
              <button onClick={() => setShowEntryModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#1B4332] text-white text-sm font-medium rounded-lg hover:bg-[#2D6A4F]">
                <Plus className="w-4 h-4" />Nueva Entrada
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead><tr className="border-b border-[#E8E0D4]">
                  <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Fecha</th>
                  <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Hora</th>
                  <th className="text-right text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Cantidad</th>
                  <th className="text-right text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Monto</th>
                  <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Usuario</th>
                </tr></thead>
                <tbody>{entries.map(entry => (
                  <tr key={entry.id} className="border-b border-[#E8E0D4]/50 hover:bg-[#F5F0E8]/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-[#2C2C2C]">{entry.date}</td>
                    <td className="px-4 py-3 text-sm text-[#6B6B6B]">{entry.time}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-[#2C2C2C]">{entry.quantity}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-[#1B4332]">${entry.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-[#6B6B6B]">{getUserName(entry.user_id)}</td>
                  </tr>
                ))}</tbody>
              </table>
              {entries.length === 0 && <div className="px-4 py-8 text-center text-sm text-[#9B9B9B]">Sin entradas</div>}
            </div>
          </div>
        )}

        {/* Finanzas */}
        {activeTab === 'finanzas' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <h3 className="text-base font-semibold text-[#2C2C2C] mb-4">Resumen Financiero</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-[#1B4332]/5 rounded-lg">
                  <p className="text-xs text-[#6B6B6B] mb-1">Total Ingresos</p>
                  <p className="text-lg font-mono font-semibold text-[#1B4332]">${entries.reduce((s, e) => s + e.amount, 0).toLocaleString()}</p>
                </div>
                <div className="p-4 bg-[#C97B7B]/5 rounded-lg">
                  <p className="text-xs text-[#6B6B6B] mb-1">Total Gastos</p>
                  <p className="text-lg font-mono font-semibold text-[#C97B7B]">${project.spent.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <h3 className="text-base font-semibold text-[#2C2C2C] mb-3">Transacciones</h3>
              {entries.map(entry => (
                <div key={entry.id} className="flex items-center justify-between py-3 border-b border-[#E8E0D4]/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1B4332]/10 flex items-center justify-center"><FileText className="w-4 h-4 text-[#1B4332]" /></div>
                    <div>
                      <p className="text-sm text-[#2C2C2C]">{entry.notes || 'Entrada'}</p>
                      <p className="text-xs text-[#9B9B9B]">{entry.date}</p>
                    </div>
                  </div>
                  <span className="font-mono text-sm text-[#1B4332]">+${entry.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Equipo */}
        {activeTab === 'equipo' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <h3 className="text-base font-semibold text-[#2C2C2C] mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#1B4332]" />Encargado del Proyecto
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {users.filter(u => u.is_active).map(u => (
                  <button
                    key={u.id}
                    onClick={() => handleSetManager(u.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                      project.manager_id === u.id ? 'bg-[#1B4332] text-white ring-2 ring-[#1B4332]' : 'bg-[#F5F0E8] text-[#6B6B6B] hover:bg-[#E8E0D4]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${project.manager_id === u.id ? 'bg-white/20 text-white' : 'bg-[#1B4332]/10 text-[#1B4332]'}`}>
                      {u.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${project.manager_id === u.id ? 'text-white' : 'text-[#2C2C2C]'}`}>{u.full_name}</p>
                      <p className={`text-xs ${project.manager_id === u.id ? 'text-white/70' : 'text-[#9B9B9B]'}`}>{u.role === 'admin' ? 'Administrador' : 'Operario'}</p>
                    </div>
                    {project.manager_id === u.id && <CheckCircle2 className="w-5 h-5 ml-auto shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <h3 className="text-base font-semibold text-[#2C2C2C] mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#1B4332]" />Trabajadores Asignados
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {allWorkers.filter(w => w.is_active).map(w => {
                  const isAssigned = project.worker_ids.includes(w.id);
                  return (
                    <button
                      key={w.id}
                      onClick={() => handleToggleWorker(w.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                        isAssigned ? 'bg-[#2D6A4F] text-white' : 'bg-[#F5F0E8] text-[#6B6B6B] hover:bg-[#E8E0D4]'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${isAssigned ? 'bg-white/20 text-white' : 'bg-[#1B4332]/10 text-[#1B4332]'}`}>
                        {w.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${isAssigned ? 'text-white' : 'text-[#2C2C2C]'}`}>{w.full_name}</p>
                        <p className={`text-xs ${isAssigned ? 'text-white/70' : 'text-[#9B9B9B]'}`}>${w.daily_rate}/dia - {w.pay_frequency === 'daily' ? 'Diario' : 'Semanal'}</p>
                      </div>
                      {isAssigned && <CheckCircle2 className="w-5 h-5 ml-auto shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Entry Modal */}
        {showEntryModal && (
          <div className="fixed inset-0 bg-[#0D2818]/45 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] w-full max-w-md p-6 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-[#2C2C2C]">Nueva Entrada</h3>
                <button onClick={() => setShowEntryModal(false)} className="p-1 rounded hover:bg-[#E8E0D4]"><X className="w-5 h-5 text-[#6B6B6B]" /></button>
              </div>
              <div className="space-y-4">
                <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Cantidad</label><input type="number" value={entryForm.quantity} onChange={e => setEntryForm({ ...entryForm, quantity: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none text-sm" /></div>
                <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Monto ($)</label><input type="number" value={entryForm.amount} onChange={e => setEntryForm({ ...entryForm, amount: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none text-sm font-mono" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Fecha</label><input type="date" value={entryForm.date} onChange={e => setEntryForm({ ...entryForm, date: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none text-sm" /></div>
                  <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Hora</label><input type="time" value={entryForm.time} onChange={e => setEntryForm({ ...entryForm, time: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none text-sm" /></div>
                </div>
                <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Notas</label><textarea value={entryForm.notes} onChange={e => setEntryForm({ ...entryForm, notes: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none text-sm resize-none" /></div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowEntryModal(false)} className="flex-1 h-11 rounded-lg border border-[#E8E0D4] text-sm font-medium text-[#6B6B6B] hover:bg-[#F5F0E8]">Cancelar</button>
                  <button onClick={handleAddEntry} className="flex-1 h-11 rounded-lg bg-[#1B4332] text-white text-sm font-medium hover:bg-[#2D6A4F] flex items-center justify-center gap-2"><Save className="w-4 h-4" />Guardar</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Name Modal */}
        {showEditName && (
          <div className="fixed inset-0 bg-[#0D2818]/45 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] w-full max-w-md p-6 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-[#2C2C2C]">Editar Proyecto</h3>
                <button onClick={() => setShowEditName(false)} className="p-1 rounded hover:bg-[#E8E0D4]"><X className="w-5 h-5 text-[#6B6B6B]" /></button>
              </div>
              <div className="space-y-4">
                <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Nombre *</label><input value={editNameForm.name} onChange={e => setEditNameForm({ ...editNameForm, name: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none text-sm" /></div>
                <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Descripcion</label><textarea value={editNameForm.description} onChange={e => setEditNameForm({ ...editNameForm, description: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none text-sm resize-none" /></div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowEditName(false)} className="flex-1 h-11 rounded-lg border border-[#E8E0D4] text-sm font-medium text-[#6B6B6B] hover:bg-[#F5F0E8]">Cancelar</button>
                  <button onClick={handleEditName} disabled={!editNameForm.name.trim()} className="flex-1 h-11 rounded-lg bg-[#1B4332] text-white text-sm font-medium hover:bg-[#2D6A4F] disabled:opacity-50 flex items-center justify-center gap-2"><Save className="w-4 h-4" />Guardar</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
