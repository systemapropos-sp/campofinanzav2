import { useState, useMemo } from 'react';
import {
  Search, Plus, Pencil, Trash2, X, Save, Upload,
  Package, AlertTriangle, TrendingUp, ArrowLeftRight,
  ChevronRight
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import {
  MockProductService, MockMovementService, MockUserService,
} from '@/services/mockData';
import type { Product, InventoryMovement } from '@/types';

export default function Almacen() {
  const { isAdmin, hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>(MockProductService.getAll());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [productForm, setProductForm] = useState({
    name: '', description: '', sku: '', category: '', price: '', quantity: '', min_stock: '5', image_url: ''
  });

  const [movementForm, setMovementForm] = useState({
    product_id: '', type: 'in' as 'in' | 'out' | 'assignment', quantity: '', assigned_to: '', notes: ''
  });

  const users = useMemo(() => MockUserService.getAll(), []);

  const filteredProducts = useMemo(() => {
    if (!search) return products;
    const q = search.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  }, [products, search]);

  const getStockStatus = (p: Product) => {
    if (p.quantity <= 0) return { label: 'Agotado', bg: 'bg-[#C97B7B]/15', text: 'text-[#C97B7B]' };
    if (p.quantity <= p.min_stock) return { label: 'Bajo stock', bg: 'bg-[#8B6914]/15', text: 'text-[#8B6914]' };
    return { label: 'Disponible', bg: 'bg-[#A8C5A8]/30', text: 'text-[#1B4332]' };
  };

  const getUserName = (id: string) => users.find(u => u.id === id)?.full_name || 'Usuario';

  const handleSaveProduct = () => {
    if (!productForm.name) return;
    const data = {
      name: productForm.name,
      description: productForm.description,
      sku: productForm.sku,
      category: productForm.category,
      price: Number(productForm.price) || 0,
      quantity: Number(productForm.quantity) || 0,
      min_stock: Number(productForm.min_stock) || 5,
      image_url: productForm.image_url,
    };

    if (editingProduct) {
      MockProductService.update(editingProduct.id, data);
    } else {
      MockProductService.create({
        id: `pr${Date.now()}`,
        ...data,
        created_at: new Date().toISOString(),
      });
    }
    setProducts(MockProductService.getAll());
    setShowProductModal(false);
    setEditingProduct(null);
    setProductForm({ name: '', description: '', sku: '', category: '', price: '', quantity: '', min_stock: '5', image_url: '' });
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Eliminar este producto?')) {
      MockProductService.delete(id);
      setProducts(MockProductService.getAll());
      if (selectedProduct?.id === id) setSelectedProduct(null);
    }
  };

  const handleMovement = () => {
    if (!movementForm.product_id || !movementForm.quantity) return;
    const product = products.find(p => p.id === movementForm.product_id);
    if (!product) return;

    const qty = Number(movementForm.quantity);
    const newQty = movementForm.type === 'in' ? product.quantity + qty : product.quantity - qty;

    MockProductService.update(product.id, { quantity: Math.max(0, newQty) });
    MockMovementService.create({
      id: `m${Date.now()}`,
      product_id: product.id,
      type: movementForm.type,
      quantity: qty,
      user_id: 'u1',
      assigned_to: movementForm.assigned_to || undefined,
      notes: movementForm.notes,
      created_at: new Date().toISOString(),
    });

    setProducts(MockProductService.getAll());
    setShowMovementModal(false);
    setMovementForm({ product_id: '', type: 'in', quantity: '', assigned_to: '', notes: '' });
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      sku: product.sku || '',
      category: product.category || '',
      price: String(product.price),
      quantity: String(product.quantity),
      min_stock: String(product.min_stock),
      image_url: product.image_url || '',
    });
    setShowProductModal(true);
  };

  const totalValue = products.reduce((s, p) => s + p.price * p.quantity, 0);
  const lowStockCount = products.filter(p => p.quantity <= p.min_stock).length;

  if (!hasPermission('warehouse')) {
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#2C2C2C]">Almacen</h1>
        <p className="text-sm text-[#6B6B6B] mt-1">Inventario compartido entre todos los proyectos</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-[#1B4332]" />
            <span className="text-xs text-[#6B6B6B]">Total Productos</span>
          </div>
          <p className="text-xl font-semibold font-mono text-[#1B4332]">{products.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-[#2D6A4F]" />
            <span className="text-xs text-[#6B6B6B]">Valor Inventario</span>
          </div>
          <p className="text-xl font-semibold font-mono text-[#2D6A4F]">${totalValue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-[#8B6914]" />
            <span className="text-xs text-[#6B6B6B]">Productos Bajo Stock</span>
          </div>
          <p className="text-xl font-semibold font-mono text-[#8B6914]">{lowStockCount}</p>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E0D4] flex-wrap gap-3">
          <h3 className="text-base font-semibold text-[#2C2C2C]">Productos</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9B9B]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar producto..."
                className="h-10 pl-9 pr-4 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.15)] outline-none transition-all text-sm w-56"
              />
            </div>
            <button
              onClick={() => { setEditingProduct(null); setProductForm({ name: '', description: '', sku: '', category: '', price: '', quantity: '', min_stock: '5', image_url: '' }); setShowProductModal(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1B4332] text-white text-sm font-medium rounded-lg hover:bg-[#2D6A4F] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Agregar</span>
            </button>
            <button
              onClick={() => setShowMovementModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#2D6A4F] text-white text-sm font-medium rounded-lg hover:bg-[#1B4332] transition-colors"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span className="hidden sm:inline">Movimiento</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8E0D4]">
                <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Producto</th>
                <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3 hidden md:table-cell">SKU</th>
                <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3 hidden lg:table-cell">Categoria</th>
                <th className="text-right text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Precio</th>
                <th className="text-right text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Cantidad</th>
                <th className="text-left text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Estado</th>
                <th className="text-right text-xs font-medium text-[#9B9B9B] uppercase px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const status = getStockStatus(product);
                return (
                  <tr
                    key={product.id}
                    className="border-b border-[#E8E0D4]/50 hover:bg-[#F5F0E8]/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#F5F0E8] flex items-center justify-center shrink-0 overflow-hidden">
                          {product.image_url ? (
                            <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-[#9B9B9B]" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-[#2C2C2C]">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#6B6B6B] hidden md:table-cell font-mono">{product.sku || '-'}</td>
                    <td className="px-4 py-3 text-sm text-[#6B6B6B] hidden lg:table-cell">{product.category || '-'}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-[#2C2C2C]">${product.price.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-[#2C2C2C]">{product.quantity}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${status.bg} ${status.text}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={e => { e.stopPropagation(); openEditModal(product); }}
                          className="p-1.5 rounded hover:bg-[#2D6A4F]/10 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5 text-[#6B6B6B]" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={e => { e.stopPropagation(); handleDeleteProduct(product.id); }}
                            className="p-1.5 rounded hover:bg-[#C97B7B]/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-[#C97B7B]" />
                          </button>
                        )}
                        <ChevronRight className="w-4 h-4 text-[#9B9B9B]" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredProducts.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-[#9B9B9B]">Sin productos encontrados</div>
        )}
      </div>

      {/* Product Detail Drawer */}
      {selectedProduct && (
        <>
          <div className="fixed inset-0 bg-[#0D2818]/30 z-40" onClick={() => setSelectedProduct(null)} />
          <div className="fixed right-0 top-16 bottom-0 w-full max-w-md bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-[#F5F0E8] flex items-center justify-center overflow-hidden">
                    {selectedProduct.image_url ? (
                      <img src={selectedProduct.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-7 h-7 text-[#9B9B9B]" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#2C2C2C]">{selectedProduct.name}</h3>
                    <p className="text-xs text-[#9B9B9B] font-mono">{selectedProduct.sku || 'Sin SKU'}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="p-2 rounded-lg hover:bg-[#E8E0D4] transition-colors">
                  <X className="w-5 h-5 text-[#6B6B6B]" />
                </button>
              </div>

              {/* Product Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between py-2 border-b border-[#E8E0D4]/50">
                  <span className="text-sm text-[#6B6B6B]">Categoria</span>
                  <span className="text-sm text-[#2C2C2C]">{selectedProduct.category || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E8E0D4]/50">
                  <span className="text-sm text-[#6B6B6B]">Precio unitario</span>
                  <span className="text-sm font-mono text-[#2C2C2C]">${selectedProduct.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E8E0D4]/50">
                  <span className="text-sm text-[#6B6B6B]">Cantidad actual</span>
                  <span className={`text-sm font-mono ${selectedProduct.quantity <= selectedProduct.min_stock ? 'text-[#8B6914]' : 'text-[#2D6A4F]'}`}>
                    {selectedProduct.quantity}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E8E0D4]/50">
                  <span className="text-sm text-[#6B6B6B]">Stock minimo</span>
                  <span className="text-sm font-mono text-[#6B6B6B]">{selectedProduct.min_stock}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E8E0D4]/50">
                  <span className="text-sm text-[#6B6B6B]">Valor total</span>
                  <span className="text-sm font-mono font-semibold text-[#1B4332]">${(selectedProduct.price * selectedProduct.quantity).toLocaleString()}</span>
                </div>
              </div>

              {selectedProduct.description && (
                <div className="mb-6">
                  <p className="text-xs text-[#9B9B9B] uppercase tracking-wide mb-1">Descripcion</p>
                  <p className="text-sm text-[#6B6B6B]">{selectedProduct.description}</p>
                </div>
              )}

              {/* Movement History */}
              <div>
                <p className="text-xs text-[#9B9B9B] uppercase tracking-wide mb-3">Historial de Movimientos</p>
                <div className="space-y-2">
                  {MockMovementService.getByProduct(selectedProduct.id).slice(0, 10).map((mov: InventoryMovement) => (
                    <div key={mov.id} className="flex items-center justify-between py-2 border-b border-[#E8E0D4]/50 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${mov.type === 'in' ? 'bg-[#2D6A4F]' : mov.type === 'out' ? 'bg-[#C97B7B]' : 'bg-[#8B6914]'}`} />
                        <div>
                          <p className="text-sm text-[#2C2C2C]">
                            {mov.type === 'in' ? 'Entrada' : mov.type === 'out' ? 'Salida' : 'Asignacion'} de {mov.quantity} unidades
                          </p>
                          {mov.assigned_to && (
                            <p className="text-xs text-[#9B9B9B]">Asignado a: {getUserName(mov.assigned_to)}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-[#9B9B9B]">{new Date(mov.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                  {MockMovementService.getByProduct(selectedProduct.id).length === 0 && (
                    <p className="text-sm text-[#9B9B9B]">Sin movimientos registrados</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-[#0D2818]/45 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-[#2C2C2C]">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button onClick={() => setShowProductModal(false)} className="p-1 rounded hover:bg-[#E8E0D4] transition-colors">
                <X className="w-5 h-5 text-[#6B6B6B]" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Nombre *</label>
                <input
                  value={productForm.name}
                  onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.15)] outline-none transition-all text-sm"
                  placeholder="Nombre del producto"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6B6B6B] mb-1">SKU</label>
                  <input
                    value={productForm.sku}
                    onChange={e => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.15)] outline-none transition-all text-sm font-mono"
                    placeholder="SKU-001"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Categoria</label>
                  <input
                    value={productForm.category}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.15)] outline-none transition-all text-sm"
                    placeholder="Categoria"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Descripcion</label>
                <textarea
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.15)] outline-none transition-all text-sm resize-none"
                  placeholder="Descripcion del producto"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Precio ($)</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.15)] outline-none transition-all text-sm font-mono"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Cantidad</label>
                  <input
                    type="number"
                    value={productForm.quantity}
                    onChange={e => setProductForm({ ...productForm, quantity: e.target.value })}
                    className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.15)] outline-none transition-all text-sm font-mono"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Stock Min.</label>
                  <input
                    type="number"
                    value={productForm.min_stock}
                    onChange={e => setProductForm({ ...productForm, min_stock: e.target.value })}
                    className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.15)] outline-none transition-all text-sm font-mono"
                    placeholder="5"
                  />
                </div>
              </div>

              {/* Image Upload Placeholder */}
              <div>
                <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Imagen</label>
                <div className="border-2 border-dashed border-[#D4A574] rounded-lg p-6 text-center cursor-pointer hover:bg-[#E8D5C4]/30 transition-colors">
                  <Upload className="w-6 h-6 text-[#D4A574] mx-auto mb-2" />
                  <p className="text-xs text-[#6B6B6B]">Arrastra o haz clic para subir imagen</p>
                  <p className="text-[10px] text-[#9B9B9B] mt-1">Se guardara en el bucket de Supabase</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 h-11 rounded-lg border border-[#E8E0D4] text-sm font-medium text-[#6B6B6B] hover:bg-[#F5F0E8] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveProduct}
                  disabled={!productForm.name}
                  className="flex-1 h-11 rounded-lg bg-[#1B4332] text-white text-sm font-medium hover:bg-[#2D6A4F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Movement Modal */}
      {showMovementModal && (
        <div className="fixed inset-0 bg-[#0D2818]/45 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-[#2C2C2C]">Registrar Movimiento</h3>
              <button onClick={() => setShowMovementModal(false)} className="p-1 rounded hover:bg-[#E8E0D4] transition-colors">
                <X className="w-5 h-5 text-[#6B6B6B]" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Producto *</label>
                <select
                  value={movementForm.product_id}
                  onChange={e => setMovementForm({ ...movementForm, product_id: e.target.value })}
                  className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.15)] outline-none transition-all text-sm bg-white"
                >
                  <option value="">Seleccionar producto</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.quantity} disp.)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Tipo de Movimiento *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['in', 'out', 'assignment'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setMovementForm({ ...movementForm, type })}
                      className={`h-10 rounded-lg text-sm font-medium transition-all ${
                        movementForm.type === type
                          ? 'bg-[#1B4332] text-white'
                          : 'bg-[#F5F0E8] text-[#6B6B6B] hover:bg-[#E8E0D4]'
                      }`}
                    >
                      {type === 'in' ? 'Entrada' : type === 'out' ? 'Salida' : 'Asignacion'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Cantidad *</label>
                <input
                  type="number"
                  value={movementForm.quantity}
                  onChange={e => setMovementForm({ ...movementForm, quantity: e.target.value })}
                  className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.15)] outline-none transition-all text-sm font-mono"
                  placeholder="0"
                />
              </div>
              {movementForm.type === 'assignment' && (
                <div>
                  <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Asignar a</label>
                  <select
                    value={movementForm.assigned_to}
                    onChange={e => setMovementForm({ ...movementForm, assigned_to: e.target.value })}
                    className="w-full h-11 px-3 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.15)] outline-none transition-all text-sm bg-white"
                  >
                    <option value="">Seleccionar usuario</option>
                    {users.filter(u => u.is_active).map(u => (
                      <option key={u.id} value={u.id}>{u.full_name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-[#6B6B6B] mb-1">Notas</label>
                <textarea
                  value={movementForm.notes}
                  onChange={e => setMovementForm({ ...movementForm, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E0D4] focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.15)] outline-none transition-all text-sm resize-none"
                  placeholder="Notas adicionales"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowMovementModal(false)}
                  className="flex-1 h-11 rounded-lg border border-[#E8E0D4] text-sm font-medium text-[#6B6B6B] hover:bg-[#F5F0E8] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleMovement}
                  disabled={!movementForm.product_id || !movementForm.quantity}
                  className="flex-1 h-11 rounded-lg bg-[#1B4332] text-white text-sm font-medium hover:bg-[#2D6A4F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Registrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
