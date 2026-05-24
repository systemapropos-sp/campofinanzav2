import { useState } from 'react';
import {
  Globe, Bell, Shield, Database, Save,
  ToggleLeft, ToggleRight, Download, Upload, Moon, Sun
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MockSettingsService } from '@/services/mockData';
import type { AppSettings } from '@/types';

const SETTINGS_TABS = [
  { key: 'general', label: 'General', icon: Globe },
  { key: 'notifications', label: 'Notificaciones', icon: Bell },
  { key: 'security', label: 'Seguridad', icon: Shield },
  { key: 'backup', label: 'Respaldo', icon: Database },
] as const;

export default function Configuracion() {
  const [activeTab, setActiveTab] = useState<(typeof SETTINGS_TABS)[number]['key']>('general');
  const [settings, setSettings] = useState<AppSettings>(MockSettingsService.get());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    MockSettingsService.update(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const notifSettings = [
    { key: 'inventory_movements', label: 'Movimientos de inventario' },
    { key: 'payments_received', label: 'Pagos recibidos' },
    { key: 'invoices_due', label: 'Facturas vencidas' },
    { key: 'low_stock', label: 'Stock bajo' },
    { key: 'new_entries', label: 'Nuevas entradas' },
  ];

  const [notifState, setNotifState] = useState<Record<string, boolean>>({
    inventory_movements: true, payments_received: true, invoices_due: true,
    low_stock: true, new_entries: false,
  });

  const accessLog = [
    { user: 'Carlos Mendez', action: 'Inicio de sesion', time: '2024-06-20 08:30' },
    { user: 'Maria Garcia', action: 'Registro de entrada', time: '2024-06-20 09:15' },
    { user: 'Juan Rodriguez', action: 'Movimiento de inventario', time: '2024-06-20 10:00' },
    { user: 'Carlos Mendez', action: 'Pago aplicado', time: '2024-06-20 11:30' },
    { user: 'Maria Garcia', action: 'Compra registrada', time: '2024-06-20 14:20' },
  ];

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#2C2C2C]">Configuracion</h1>
        <p className="text-sm text-[#6B6B6B] mt-1">Administrar preferencias del sistema</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar Tabs */}
        <div className="lg:w-60 shrink-0">
          <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
            {SETTINGS_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all text-left ${
                  activeTab === tab.key
                    ? 'bg-[#1B4332] text-white'
                    : 'text-[#6B6B6B] hover:bg-[#F5F0E8]'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-6">
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-5">
                <h3 className="text-base font-semibold text-[#2C2C2C] mb-4">Configuracion General</h3>

                <div>
                  <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Nombre del Campo</label>
                  <input
                    value={settings.company_name}
                    onChange={e => setSettings({ ...settings, company_name: e.target.value })}
                    className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.15)] outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Direccion</label>
                  <input
                    value={settings.company_address || ''}
                    onChange={e => setSettings({ ...settings, company_address: e.target.value })}
                    className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.15)] outline-none transition-all text-sm"
                    placeholder="Direccion del campo"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Telefono de Contacto</label>
                  <input
                    value={settings.company_phone || ''}
                    onChange={e => setSettings({ ...settings, company_phone: e.target.value })}
                    className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.15)] outline-none transition-all text-sm"
                    placeholder="555-0000"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Simbolo de Moneda</label>
                    <select
                      value={settings.currency_symbol}
                      onChange={e => setSettings({ ...settings, currency_symbol: e.target.value })}
                      className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.15)] outline-none transition-all text-sm bg-white"
                    >
                      <option value="$">$ (Dolar)</option>
                      <option value="L">L (Lempira)</option>
                      <option value="Q">Q (Quetzal)</option>
                      <option value="C$">C$ (Cordoba)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Formato de Fecha</label>
                    <select
                      value={settings.date_format}
                      onChange={e => setSettings({ ...settings, date_format: e.target.value })}
                      className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.15)] outline-none transition-all text-sm bg-white"
                    >
                      <option value="dd/MM/yyyy">DD/MM/YYYY</option>
                      <option value="MM/dd/yyyy">MM/DD/YYYY</option>
                      <option value="yyyy-MM-dd">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Tema</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSettings({ ...settings, theme: 'light' })}
                      className={`h-10 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        settings.theme === 'light' ? 'bg-[#1B4332] text-white' : 'bg-[#F5F0E8] text-[#6B6B6B] hover:bg-[#E8E0D4]'
                      }`}
                    >
                      <Sun className="w-4 h-4" />
                      Claro
                    </button>
                    <button
                      onClick={() => setSettings({ ...settings, theme: 'dark' })}
                      className={`h-10 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        settings.theme === 'dark' ? 'bg-[#1B4332] text-white' : 'bg-[#F5F0E8] text-[#6B6B6B] hover:bg-[#E8E0D4]'
                      }`}
                    >
                      <Moon className="w-4 h-4" />
                      Oscuro
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <h3 className="text-base font-semibold text-[#2C2C2C] mb-4">Configuracion de Notificaciones</h3>
                <div className="space-y-3">
                  {notifSettings.map(ns => (
                    <div key={ns.key} className="flex items-center justify-between py-3 border-b border-[#E8E0D4]/50 last:border-0">
                      <div className="flex items-center gap-3">
                        <Bell className="w-4 h-4 text-[#6B6B6B]" />
                        <span className="text-sm text-[#2C2C2C]">{ns.label}</span>
                      </div>
                      <button onClick={() => setNotifState({ ...notifState, [ns.key]: !notifState[ns.key] })}>
                        {notifState[ns.key] ? (
                          <ToggleRight className="w-6 h-6 text-[#2D6A4F]" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-[#9B9B9B]" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Periodo de Retencion</label>
                  <select className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.15)] outline-none transition-all text-sm bg-white">
                    <option>30 dias</option>
                    <option>60 dias</option>
                    <option>90 dias</option>
                    <option>1 ano</option>
                  </select>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-5">
                <h3 className="text-base font-semibold text-[#2C2C2C] mb-4">Seguridad</h3>

                <div>
                  <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Timeout de Sesion (horas)</label>
                  <input
                    type="number"
                    value={settings.session_timeout}
                    onChange={e => setSettings({ ...settings, session_timeout: Number(e.target.value) })}
                    className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.15)] outline-none transition-all text-sm font-mono"
                    min={1}
                    max={24}
                  />
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-[#2C2C2C] mb-3">Registro de Acceso</h4>
                  <div className="bg-[#F5F0E8]/50 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#E8E0D4]">
                          <th className="text-left text-[10px] font-medium text-[#9B9B9B] uppercase px-3 py-2">Usuario</th>
                          <th className="text-left text-[10px] font-medium text-[#9B9B9B] uppercase px-3 py-2">Accion</th>
                          <th className="text-left text-[10px] font-medium text-[#9B9B9B] uppercase px-3 py-2">Hora</th>
                        </tr>
                      </thead>
                      <tbody>
                        {accessLog.map((log, i) => (
                          <tr key={i} className="border-b border-[#E8E0D4]/50 last:border-0">
                            <td className="px-3 py-2 text-xs text-[#2C2C2C]">{log.user}</td>
                            <td className="px-3 py-2 text-xs text-[#6B6B6B]">{log.action}</td>
                            <td className="px-3 py-2 text-xs font-mono text-[#9B9B9B]">{log.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Backup Tab */}
            {activeTab === 'backup' && (
              <div className="space-y-5">
                <h3 className="text-base font-semibold text-[#2C2C2C] mb-4">Respaldo de Datos</h3>

                <div className="flex items-center justify-between p-4 bg-[#F5F0E8]/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-[#2C2C2C]">Ultimo respaldo</p>
                    <p className="text-xs text-[#9B9B9B] mt-0.5">2024-06-20 03:00 AM</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#A8C5A8]/30 text-[#1B4332]">
                    Automatico
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button className="flex items-center justify-center gap-2 h-12 rounded-lg border border-[#E8E0D4] text-sm font-medium text-[#6B6B6B] hover:bg-[#F5F0E8] transition-colors">
                    <Download className="w-4 h-4" />
                    Exportar JSON
                  </button>
                  <button className="flex items-center justify-center gap-2 h-12 rounded-lg border border-[#E8E0D4] text-sm font-medium text-[#6B6B6B] hover:bg-[#F5F0E8] transition-colors">
                    <Download className="w-4 h-4" />
                    Exportar CSV
                  </button>
                  <button className="flex items-center justify-center gap-2 h-12 rounded-lg bg-[#1B4332] text-white text-sm font-medium hover:bg-[#2D6A4F] transition-colors">
                    <Upload className="w-4 h-4" />
                    Respaldo Manual
                  </button>
                </div>

                <div className="p-4 bg-[#C97B7B]/5 rounded-lg border border-[#C97B7B]/20">
                  <p className="text-sm font-medium text-[#C97B7B] mb-1">Advertencia</p>
                  <p className="text-xs text-[#6B6B6B]">
                    El respaldo manual genera un archivo con todos los datos del sistema. 
                    Guarde el archivo en un lugar seguro.
                  </p>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#E8E0D4]">
              {saved && (
                <span className="text-sm text-[#2D6A4F] font-medium animate-in fade-in duration-200">
                  Configuracion guardada exitosamente
                </span>
              )}
              <div className="ml-auto">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 h-11 rounded-lg bg-[#1B4332] text-white text-sm font-medium hover:bg-[#2D6A4F] transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
