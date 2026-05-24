import { useState } from 'react';
import {
  Plus, Pencil, Trash2, X, Save, Shield, UserCog,
  ToggleLeft, ToggleRight
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { MockUserService } from '@/services/mockData';
import type { User, Permissions } from '@/types';

const PERMISSION_LABELS: Record<keyof Permissions, string> = {
  dashboard: 'Dashboard',
  projects: 'Proyectos',
  warehouse: 'Almacen',
  purchases: 'Compras',
  invoices: 'Facturas',
  users: 'Usuarios',
  settings: 'Configuracion',
  workers: 'Trabajadores',
  operational_expenses: 'Gastos Op.',
  payroll: 'Nominas',
  loans: 'Prestamos',
  expense_report: 'Reporte',
  full_access: 'Acceso Total',
};

export default function Usuarios() {
  const { isAdmin } = useAuth();
  const [usersList, setUsersList] = useState<User[]>(MockUserService.getAll());
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [form, setForm] = useState<{
    full_name: string; pin: string; email: string; phone: string;
    role: 'admin' | 'operator'; permissions: Permissions; is_active: boolean;
  }>({
    full_name: '', pin: '', email: '', phone: '',
    role: 'operator',
    permissions: {
      dashboard: true, projects: false, warehouse: false, purchases: false,
      invoices: false, users: false, settings: false, workers: false,
      operational_expenses: false, payroll: false, loans: false,
      expense_report: false, full_access: false,
    },
    is_active: true,
  });

  const openCreate = () => {
    setEditingUser(null);
    setForm({
      full_name: '', pin: '', email: '', phone: '',
      role: 'operator',
      permissions: {
        dashboard: true, projects: false, warehouse: false, purchases: false,
        invoices: false, users: false, settings: false, workers: false,
        operational_expenses: false, payroll: false, loans: false,
        expense_report: false, full_access: false,
      },
      is_active: true,
    });
    setShowModal(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setForm({
      full_name: user.full_name,
      pin: user.pin,
      email: user.email || '',
      phone: user.phone || '',
      role: user.role,
      permissions: {
        dashboard: user.permissions.dashboard ?? true,
        projects: user.permissions.projects ?? false,
        warehouse: user.permissions.warehouse ?? false,
        purchases: user.permissions.purchases ?? false,
        invoices: user.permissions.invoices ?? false,
        users: user.permissions.users ?? false,
        settings: user.permissions.settings ?? false,
        workers: user.permissions.workers ?? false,
        operational_expenses: user.permissions.operational_expenses ?? false,
        payroll: user.permissions.payroll ?? false,
        loans: user.permissions.loans ?? false,
        expense_report: user.permissions.expense_report ?? false,
        full_access: user.permissions.full_access ?? false,
      },
      is_active: user.is_active,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.full_name || !form.pin || form.pin.length !== 4) return;

    const data = {
      full_name: form.full_name,
      pin: form.pin,
      email: form.email || undefined,
      phone: form.phone || undefined,
      role: form.role,
      permissions: form.permissions,
      is_active: form.is_active,
    };

    if (editingUser) {
      MockUserService.update(editingUser.id, data);
    } else {
      MockUserService.create({
        id: `u${Date.now()}`,
        ...data,
        created_at: new Date().toISOString(),
      });
    }
    setUsersList(MockUserService.getAll());
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Eliminar este usuario?')) {
      MockUserService.delete(id);
      setUsersList(MockUserService.getAll());
    }
  };

  const togglePermission = (key: keyof Permissions) => {
    if (key === 'full_access') {
      const newVal = !form.permissions.full_access;
      setForm({
        ...form,
        permissions: {
          dashboard: newVal, projects: newVal, warehouse: newVal,
          purchases: newVal, invoices: newVal, users: newVal,
          settings: newVal, workers: newVal, operational_expenses: newVal,
          payroll: newVal, loans: newVal, expense_report: newVal,
          full_access: newVal,
        }
      });
    } else {
      setForm({
        ...form,
        permissions: { ...form.permissions, [key]: !form.permissions[key] }
      });
    }
  };

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <Shield className="w-12 h-12 text-[#C97B7B] mb-3" />
          <p className="text-lg font-medium text-[#2C2C2C]">Acceso Denegado</p>
          <p className="text-sm text-[#6B6B6B]">Solo administradores pueden gestionar usuarios.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#2C2C2C]">Usuarios</h1>
          <p className="text-sm text-[#6B6B6B] mt-1">Administracion de usuarios y permisos</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1B4332] text-white text-sm font-medium rounded-lg hover:bg-[#2D6A4F] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E8E0D4]">
          <h3 className="text-base font-semibold text-[#2C2C2C]">Usuarios del Sistema</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8E0D4]">
                <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Nombre</th>
                <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">PIN</th>
                <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Rol</th>
                <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3 hidden lg:table-cell">Permisos</th>
                <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Estado</th>
                <th className="text-right text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map(user => (
                <tr key={user.id} className="border-b border-[#E8E0D4]/50 hover:bg-[#F5F0E8]/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#1B4332] text-white text-sm font-semibold flex items-center justify-center">
                        {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#2C2C2C]">{user.full_name}</p>
                        {user.email && <p className="text-xs text-[#9B9B9B]">{user.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-[#6B6B6B]">{user.pin}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium ${
                      user.role === 'admin'
                        ? 'bg-[#1B4332]/10 text-[#1B4332]'
                        : 'bg-[#E8D5C4]/50 text-[#8B6914]'
                    }`}>
                      {user.role === 'admin' ? (
                        <><Shield className="w-3 h-3" /> Administrador</>
                      ) : (
                        <><UserCog className="w-3 h-3" /> Operario</>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {user.permissions.full_access ? (
                        <span className="px-2 py-0.5 rounded bg-[#1B4332]/10 text-[#1B4332] text-[10px] font-medium">Acceso Total</span>
                      ) : (
                        Object.entries(user.permissions)
                          .filter(([k, v]) => k !== 'full_access' && v)
                          .slice(0, 4)
                          .map(([k]) => (
                            <span key={k} className="px-2 py-0.5 rounded bg-[#F5F0E8] text-[#6B6B6B] text-[10px] font-medium">
                              {PERMISSION_LABELS[k as keyof Permissions]}
                            </span>
                          ))
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        MockUserService.update(user.id, { is_active: !user.is_active });
                        setUsersList(MockUserService.getAll());
                      }}
                    >
                      {user.is_active ? (
                        <ToggleRight className="w-6 h-6 text-[#2D6A4F]" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-[#9B9B9B]" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(user)}
                        className="p-1.5 rounded hover:bg-[#2D6A4F]/10 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5 text-[#6B6B6B]" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-1.5 rounded hover:bg-[#C97B7B]/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-[#C97B7B]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {usersList.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-[#9B9B9B]">Sin usuarios registrados</div>
        )}
      </div>

      {/* User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0D2818]/45 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-[#2C2C2C]">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-[#E8E0D4] transition-colors">
                <X className="w-5 h-5 text-[#6B6B6B]" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Nombre Completo *</label>
                <input
                  value={form.full_name}
                  onChange={e => setForm({ ...form, full_name: e.target.value })}
                  className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.15)] outline-none transition-all text-sm"
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B6B6B] mb-1">PIN (4 digitos) *</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={form.pin}
                  onChange={e => { if (/^\d{0,4}$/.test(e.target.value)) setForm({ ...form, pin: e.target.value }); }}
                  className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.15)] outline-none transition-all text-sm font-mono text-center tracking-[0.5em]"
                  placeholder="****"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Telefono</label>
                  <input
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.15)] outline-none transition-all text-sm"
                    placeholder="555-0000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.15)] outline-none transition-all text-sm"
                    placeholder="email@ejemplo.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Rol</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setForm({ ...form, role: 'admin' })}
                    className={`h-10 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      form.role === 'admin' ? 'bg-[#1B4332] text-white' : 'bg-[#F5F0E8] text-[#6B6B6B] hover:bg-[#E8E0D4]'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    Administrador
                  </button>
                  <button
                    onClick={() => setForm({ ...form, role: 'operator' })}
                    className={`h-10 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      form.role === 'operator' ? 'bg-[#1B4332] text-white' : 'bg-[#F5F0E8] text-[#6B6B6B] hover:bg-[#E8E0D4]'
                    }`}
                  >
                    <UserCog className="w-4 h-4" />
                    Operario
                  </button>
                </div>
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-xs font-medium text-[#6B6B6B] mb-2">Permisos</label>
                <div className="space-y-2 bg-[#F5F0E8]/50 rounded-lg p-4">
                  {/* Master toggle */}
                  <button
                    onClick={() => togglePermission('full_access')}
                    className="w-full flex items-center justify-between py-2 border-b border-[#E8E0D4] mb-2"
                  >
                    <span className="text-sm font-medium text-[#2C2C2C]">Acceso Total (Todos los modulos)</span>
                    {form.permissions.full_access ? (
                      <ToggleRight className="w-6 h-6 text-[#2D6A4F]" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-[#9B9B9B]" />
                    )}
                  </button>

                  {/* Individual toggles */}
                  {(Object.keys(PERMISSION_LABELS) as Array<keyof Permissions>)
                    .filter(k => k !== 'full_access')
                    .map(key => (
                      <button
                        key={key}
                        onClick={() => togglePermission(key)}
                        disabled={form.permissions.full_access}
                        className={`w-full flex items-center justify-between py-1.5 ${
                          form.permissions.full_access ? 'opacity-40 cursor-not-allowed' : ''
                        }`}
                      >
                        <span className="text-sm text-[#6B6B6B]">{PERMISSION_LABELS[key]}</span>
                        {form.permissions[key] ? (
                          <ToggleRight className="w-5 h-5 text-[#2D6A4F]" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-[#9B9B9B]" />
                        )}
                      </button>
                    ))}
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-[#6B6B6B]">Usuario Activo</span>
                <button onClick={() => setForm({ ...form, is_active: !form.is_active })}>
                  {form.is_active ? (
                    <ToggleRight className="w-6 h-6 text-[#2D6A4F]" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-[#9B9B9B]" />
                  )}
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-11 rounded-lg border border-[#E8E0D4] text-sm font-medium text-[#6B6B6B] hover:bg-[#F5F0E8] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.full_name || form.pin.length !== 4}
                  className="flex-1 h-11 rounded-lg bg-[#1B4332] text-white text-sm font-medium hover:bg-[#2D6A4F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Guardar Usuario
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
