import { useState, useMemo } from 'react';
import {
  ShoppingCart, Plus, Search, Upload, Save,
  DollarSign, Image, ChevronDown, ChevronUp
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { MockPurchaseService, MockProductService, MockUserService } from '@/services/mockData';
import type { Purchase } from '@/types';

export default function Compras() {
  const { hasPermission } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>(MockPurchaseService.getAll());
  const [search, setSearch] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    product_id: '',
    supplier: '',
    quantity: '',
    unit_price: '',
    date: new Date().toISOString().split('T')[0],
    image_url: '',
  });

  const products = useMemo(() => MockProductService.getAll(), []);
  const users = useMemo(() => MockUserService.getAll(), []);

  const filteredPurchases = useMemo(() => {
    if (!search) return purchases;
    const q = search.toLowerCase();
    return purchases.filter(p => {
      const productName = products.find(pr => pr.id === p.product_id)?.name || '';
      return productName.toLowerCase().includes(q) || p.supplier.toLowerCase().includes(q);
    });
  }, [purchases, search, products]);

  const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'Producto';
  const getUserName = (id: string) => users.find(u => u.id === id)?.full_name || 'Usuario';

  const handleSubmit = () => {
    if (!form.product_id || !form.supplier || !form.quantity || !form.unit_price) return;
    const qty = Number(form.quantity);
    const price = Number(form.unit_price);

    MockPurchaseService.create({
      id: `pc${Date.now()}`,
      product_id: form.product_id,
      supplier: form.supplier,
      quantity: qty,
      unit_price: price,
      total: qty * price,
      image_url: form.image_url,
      date: form.date,
      created_by: 'u1',
      created_at: new Date().toISOString(),
    });

    // Update product quantity
    const product = products.find(p => p.id === form.product_id);
    if (product) {
      MockProductService.update(product.id, { quantity: product.quantity + qty });
    }

    setPurchases(MockPurchaseService.getAll());
    setForm({
      product_id: '', supplier: '', quantity: '', unit_price: '',
      date: new Date().toISOString().split('T')[0], image_url: ''
    });
    setShowForm(false);
  };

  const total = useMemo(() => {
    if (!form.quantity || !form.unit_price) return 0;
    return Number(form.quantity) * Number(form.unit_price);
  }, [form.quantity, form.unit_price]);

  if (!hasPermission('purchases')) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-lg font-medium text-[#2C2C2C]">Acceso Denegado</p>
          <p className="text-sm text-[#6B6B6B]">No tienes permiso para ver esta seccion.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#2C2C2C]">Compras</h1>
          <p className="text-sm text-[#6B6B6B] mt-1">Registro de compras y proveedores</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1B4332] text-white text-sm font-medium rounded-lg hover:bg-[#2D6A4F] transition-colors"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Ocultar' : 'Nueva Compra'}
        </button>
      </div>

      {/* Purchase Registration Form */}
      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <h3 className="text-base font-semibold text-[#2C2C2C] mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#1B4332]" />
            Registrar Compra
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Producto *</label>
              <select
                value={form.product_id}
                onChange={e => setForm({ ...form, product_id: e.target.value })}
                className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.15)] outline-none transition-all text-sm bg-white"
              >
                <option value="">Seleccionar producto</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.quantity} disp.)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Proveedor *</label>
              <input
                value={form.supplier}
                onChange={e => setForm({ ...form, supplier: e.target.value })}
                className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.15)] outline-none transition-all text-sm"
                placeholder="Nombre del proveedor"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Cantidad *</label>
              <input
                type="number"
                value={form.quantity}
                onChange={e => setForm({ ...form, quantity: e.target.value })}
                className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.15)] outline-none transition-all text-sm font-mono"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Precio Unitario *</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9B9B]" />
                <input
                  type="number"
                  value={form.unit_price}
                  onChange={e => setForm({ ...form, unit_price: e.target.value })}
                  className="w-full h-11 pl-9 pr-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.15)] outline-none transition-all text-sm font-mono"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Total</label>
              <div className="h-11 px-3 rounded-lg bg-[#1B4332]/5 flex items-center">
                <span className="text-sm font-mono font-semibold text-[#1B4332]">${total.toLocaleString()}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Fecha</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.15)] outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="mt-4">
            <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Imagen / Recibo</label>
            <div className="border-2 border-dashed border-[#D4A574] rounded-lg p-6 text-center cursor-pointer hover:bg-[#E8D5C4]/30 transition-colors">
              <Upload className="w-6 h-6 text-[#D4A574] mx-auto mb-2" />
              <p className="text-xs text-[#6B6B6B]">Arrastra o haz clic para subir imagen del recibo</p>
              <p className="text-[10px] text-[#9B9B9B] mt-1">Se guardara en el bucket de Supabase Storage</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setShowForm(false)}
              className="h-11 px-6 rounded-lg border border-[#E8E0D4] text-sm font-medium text-[#6B6B6B] hover:bg-[#F5F0E8] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.product_id || !form.supplier || !form.quantity || !form.unit_price}
              className="h-11 px-6 rounded-lg bg-[#1B4332] text-white text-sm font-medium hover:bg-[#2D6A4F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Registrar Compra
            </button>
          </div>
        </div>
      )}

      {/* Purchase History */}
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E0D4] flex-wrap gap-3">
          <h3 className="text-base font-semibold text-[#2C2C2C]">Historial de Compras</h3>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9B9B]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar compra..."
              className="h-9 pl-9 pr-4 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.15)] outline-none transition-all text-sm w-52"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8E0D4]">
                <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Fecha</th>
                <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Producto</th>
                <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3 hidden md:table-cell">Proveedor</th>
                <th className="text-right text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Cant.</th>
                <th className="text-right text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Precio Unit.</th>
                <th className="text-right text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Total</th>
                <th className="text-center text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3 hidden lg:table-cell">Img</th>
                <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3 hidden lg:table-cell">Usuario</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.map(purchase => (
                <>
                  <tr
                    key={purchase.id}
                    className="border-b border-[#E8E0D4]/50 hover:bg-[#F5F0E8]/50 cursor-pointer transition-colors"
                    onClick={() => setExpandedRow(expandedRow === purchase.id ? null : purchase.id)}
                  >
                    <td className="px-4 py-3 text-sm text-[#2C2C2C]">{purchase.date}</td>
                    <td className="px-4 py-3 text-sm font-medium text-[#2C2C2C]">{getProductName(purchase.product_id)}</td>
                    <td className="px-4 py-3 text-sm text-[#6B6B6B] hidden md:table-cell">{purchase.supplier}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-[#2C2C2C]">{purchase.quantity}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-[#6B6B6B]">${purchase.unit_price.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono font-semibold text-[#1B4332]">${purchase.total.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center hidden lg:table-cell">
                      {purchase.image_url ? (
                        <Image className="w-4 h-4 text-[#2D6A4F] mx-auto" />
                      ) : (
                        <span className="text-xs text-[#9B9B9B]">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#6B6B6B] hidden lg:table-cell">{getUserName(purchase.created_by)}</td>
                    <td className="px-4 py-3">
                      {expandedRow === purchase.id ? (
                        <ChevronUp className="w-4 h-4 text-[#9B9B9B]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#9B9B9B]" />
                      )}
                    </td>
                  </tr>
                  {expandedRow === purchase.id && (
                    <tr className="bg-[#F5F0E8]/30">
                      <td colSpan={9} className="px-4 py-3">
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div>
                            <span className="text-[#9B9B9B]">Producto: </span>
                            <span className="text-[#2C2C2C] font-medium">{getProductName(purchase.product_id)}</span>
                          </div>
                          <div>
                            <span className="text-[#9B9B9B]">Proveedor: </span>
                            <span className="text-[#2C2C2C]">{purchase.supplier}</span>
                          </div>
                          <div>
                            <span className="text-[#9B9B9B]">Registrado por: </span>
                            <span className="text-[#2C2C2C]">{getUserName(purchase.created_by)}</span>
                          </div>
                          {purchase.image_url && (
                            <div className="w-full">
                              <span className="text-[#9B9B9B]">Imagen: </span>
                              <span className="text-[#2D6A4F] text-xs break-all">{purchase.image_url}</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPurchases.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-[#9B9B9B]">Sin compras registradas</div>
        )}
      </div>
    </AppLayout>
  );
}
