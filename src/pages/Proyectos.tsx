import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Trash2, X, Calendar,
  KanbanSquare, ClipboardList, CheckCircle2, Clock
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import {
  MockProjectService, MockEntryService, MockUserService,
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

export default function Proyectos() {
  const navigate = useNavigate();
  const { isAdmin, hasPermission } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<{ name: string; description: string; budget: string; status: 'active' | 'paused' | 'completed'; manager_id: string }>({ name: '', description: '', budget: '', status: 'active', manager_id: '' });
  const [projects, setProjects] = useState<Project[]>(MockProjectService.getAll());

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

  const users = useMemo(() => MockUserService.getAll(), []);
  const getManagerName = (id?: string) => users.find(u => u.id === id)?.full_name || 'Sin encargado';

  const handleCreate = () => {
    if (!form.name) return;
    MockProjectService.create({
      id: `p${Date.now()}`, name: form.name, description: form.description,
      budget: Number(form.budget) || 0, spent: 0, status: form.status,
      created_by: 'u1', manager_id: form.manager_id || undefined,
      pipeline_stage: 'planning', worker_ids: [], created_at: new Date().toISOString(),
    });
    setProjects(MockProjectService.getAll());
    setShowModal(false);
    setForm({ name: '', description: '', budget: '', status: 'active', manager_id: '' });
  };

  const handleDelete = (projectId: string) => {
    if (confirm('Eliminar este proyecto?')) { MockProjectService.delete(projectId); setProjects(MockProjectService.getAll()); }
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#2C2C2C]">Proyectos</h1>
          <p className="text-sm text-[#6B6B6B] mt-1">Gestion de proyectos y sus finanzas</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#1B4332] text-white text-sm font-medium rounded-lg hover:bg-[#2D6A4F] transition-colors shrink-0">
            <Plus className="w-4 h-4" /><span className="hidden sm:inline">Nuevo Proyecto</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map(project => {
          const budgetUsed = project.budget > 0 ? (project.spent / project.budget) * 100 : 0;
          const entries = MockEntryService.getByProject(project.id);
          const currentStage = PIPELINE_STAGES.find(s => s.key === project.pipeline_stage);
          const StageIcon = currentStage?.icon;
          return (
            <div
              key={project.id}
              className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all cursor-pointer group"
              onClick={() => navigate(`/proyectos/${project.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-semibold text-[#1B4332] group-hover:text-[#2D6A4F] transition-colors pr-2 truncate">{project.name}</h3>
                <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-medium ${STATUS_COLORS[project.status].bg} ${STATUS_COLORS[project.status].text}`}>
                  {STATUS_COLORS[project.status].label}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {StageIcon && <><StageIcon className="w-3 h-3 text-[#8B6914]" /><span className="text-[10px] text-[#8B6914] font-medium">{currentStage?.label}</span></>}
                <span className="text-[10px] text-[#9B9B9B]">| {getManagerName(project.manager_id)}</span>
              </div>
              <div className="mb-3">
                <div className="w-full h-1.5 bg-[#E8E0D4] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(budgetUsed, 100)}%`, backgroundColor: budgetUsed > 90 ? '#C97B7B' : budgetUsed > 75 ? '#8B6914' : '#1B4332' }} />
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 mb-3 text-xs flex-wrap">
                <span className="text-[#6B6B6B]">Presup: <span className="font-mono text-[#2C2C2C]">{'$'}{project.budget.toLocaleString()}</span></span>
                <span className="text-[#E8E0D4]">|</span>
                <span className="text-[#6B6B6B]">Gast: <span className="font-mono text-[#C97B7B]">{'$'}{project.spent.toLocaleString()}</span></span>
                <span className="text-[#E8E0D4]">|</span>
                <span className="text-[#6B6B6B]">Equipo: <span className="font-mono text-[#2C2C2C]">{project.worker_ids.length}</span></span>
              </div>
              <div className="space-y-1.5 mb-4">
                {entries.slice(0, 2).map(entry => (
                  <div key={entry.id} className="flex items-center justify-between text-xs">
                    <span className="text-[#9B9B9B] truncate max-w-[180px]">{entry.notes || 'Entrada'}</span>
                    <span className="font-mono text-[#1B4332]">{'$'}{entry.amount.toLocaleString()}</span>
                  </div>
                ))}
                {entries.length === 0 && <p className="text-xs text-[#9B9B9B]">Sin entradas</p>}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#E8E0D4]/50">
                <span className="text-xs font-medium text-[#2D6A4F]">Ver detalles</span>
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button onClick={e => { e.stopPropagation(); handleDelete(project.id); }} className="p-1.5 rounded hover:bg-[#C97B7B]/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-[#C97B7B]" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {projects.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <Calendar className="w-10 h-10 text-[#9B9B9B] mb-2" />
          <p className="text-sm text-[#6B6B6B]">Sin proyectos registrados</p>
        </div>
      )}

      {/* New Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0D2818]/45 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-[#2C2C2C]">Nuevo Proyecto</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-[#E8E0D4]"><X className="w-5 h-5 text-[#6B6B6B]" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Nombre *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none text-sm" placeholder="Nombre del proyecto" /></div>
              <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Descripcion</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none text-sm resize-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Presupuesto ($)</label><input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none text-sm font-mono" placeholder="0" /></div>
                <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Estado</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as 'active' | 'paused' | 'completed' })} className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none text-sm bg-white"><option value="active">Activo</option><option value="paused">Pausado</option><option value="completed">Completado</option></select></div>
              </div>
              <div><label className="block text-xs font-medium text-[#6B6B6B] mb-1">Encargado</label>
                <select value={form.manager_id} onChange={e => setForm({ ...form, manager_id: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] outline-none text-sm bg-white"><option value="">Seleccionar encargado</option>{users.filter(u => u.is_active).map(u => (<option key={u.id} value={u.id}>{u.full_name}</option>))}</select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 h-11 rounded-lg border border-[#E8E0D4] text-sm font-medium text-[#6B6B6B] hover:bg-[#F5F0E8]">Cancelar</button>
                <button onClick={handleCreate} disabled={!form.name} className="flex-1 h-11 rounded-lg bg-[#1B4332] text-white text-sm font-medium hover:bg-[#2D6A4F] disabled:opacity-50">Crear Proyecto</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
