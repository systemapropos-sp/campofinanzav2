/**
 * Supabase-backed data store — CampoFinanzas v2
 * Maneja mapeo de columnas v1 (español) → v2 (inglés) con fallbacks
 */
import { supabase } from '@/lib/supabase/client';
import type {
  User, Project, Product, Purchase, InventoryMovement,
  Invoice, Worker, OperationalExpense, Payroll, Loan,
  LoanDeduction, AppSettings, DashboardStats, MonthlyData,
  ProjectDistribution, Investor, ProjectInvestor
} from '@/types';

let BID = '';
let _projects: Project[] = [];
let _products: Product[] = [];
let _purchases: Purchase[] = [];
let _invoices: Invoice[] = [];
let _workers: Worker[] = [];
let _expenses: OperationalExpense[] = [];
let _payrolls: Payroll[] = [];
let _loans: Loan[] = [];
let _users: User[] = [];
let _investors: Investor[] = [];
let _projectInvestors: ProjectInvestor[] = [];
let _settings: AppSettings = {
  company_name: 'CampoFinanzas',
  currency_symbol: 'RD$',
  date_format: 'DD/MM/YYYY',
  theme: 'light',
  session_timeout: 30
};

export async function initializeMockData(businessId?: string) {
  if (businessId) BID = businessId;
  if (!BID) return;
  try {
    const [p, inv, comp, fact, emp, gop, nom, prest, usu, conf, inv2, pi] = await Promise.all([
      supabase.from('cf_proyectos').select('*').eq('business_id', BID),
      supabase.from('cf_inventario').select('*').eq('business_id', BID),
      supabase.from('cf_compras').select('*').eq('business_id', BID).order('date', { ascending: false }),
      supabase.from('cf_facturas').select('*').eq('business_id', BID).order('created_at', { ascending: false }),
      supabase.from('cf_empleados').select('*').eq('business_id', BID),
      supabase.from('cf_gastos_operativos').select('*').eq('business_id', BID).order('date', { ascending: false }),
      supabase.from('cf_nominas').select('*').eq('business_id', BID).order('created_at', { ascending: false }),
      supabase.from('cf_prestamos').select('*').eq('business_id', BID),
      supabase.from('cf_usuarios_negocio').select('*').eq('business_id', BID),
      supabase.from('cf_configuracion').select('*').eq('business_id', BID).maybeSingle(),
      // Inversionistas — graceful if table doesn't exist yet
      Promise.resolve(supabase.from('cf_inversionistas').select('*').eq('business_id', BID)).catch(() => ({ data: [] })),
      Promise.resolve(supabase.from('cf_proyecto_inversionistas').select('*').eq('business_id', BID)).catch(() => ({ data: [] })),
    ]);

    _projects = (p.data || []).map((r: any): Project => ({
      id: r.id,
      name: r.name ?? r.nombre ?? '',
      description: r.description ?? r.descripcion ?? '',
      budget: r.budget ?? r.presupuesto ?? 0,
      spent: r.spent ?? r.gastado ?? 0,
      status: r.status ?? r.estado ?? 'active',
      created_by: r.id,
      created_by_name: r.manager_name ?? r.gerente ?? '',
      manager_id: undefined,
      pipeline_stage: r.pipeline_stage ?? 'in_progress',
      worker_ids: [],
      created_at: r.created_at
    }));

    _products = (inv.data || []).map((r: any): Product => ({
      id: r.id,
      name: r.name ?? r.nombre ?? '',
      description: r.description ?? r.descripcion ?? '',
      sku: r.sku ?? r.codigo ?? '',
      category: r.category ?? r.categoria ?? r.tipo ?? '',
      price: r.price ?? r.precio ?? 0,
      quantity: r.quantity ?? r.cantidad ?? r.stock ?? 0,
      min_stock: r.min_stock ?? r.stock_minimo ?? 5,
      image_url: r.image_url ?? r.imagen_url ?? '',
      created_at: r.created_at
    }));

    _purchases = (comp.data || []).map((r: any): Purchase => ({
      id: r.id,
      product_id: r.product_id ?? r.producto_id ?? '',
      product_name: r.product_name ?? r.nombre_producto ?? r.producto ?? '',
      supplier: r.supplier ?? r.proveedor ?? '',
      quantity: r.quantity ?? r.cantidad ?? 0,
      unit_price: r.unit_price ?? r.precio_unitario ?? 0,
      total: r.total ?? r.monto ?? 0,
      image_url: r.image_url ?? r.imagen_url ?? '',
      date: r.date ?? r.fecha ?? r.created_at,
      created_by: r.id,
      created_by_name: '',
      created_at: r.created_at
    }));

    _invoices = (fact.data || []).map((r: any): Invoice => ({
      id: r.id,
      project_id: r.project_id ?? r.proyecto_id ?? '',
      project_name: r.project_name ?? r.nombre_proyecto ?? '',
      invoice_number: r.invoice_number ?? r.numero_factura ?? '',
      supplier: r.supplier ?? r.proveedor ?? '',
      amount: r.amount ?? r.monto ?? 0,
      payment_type: r.payment_type ?? r.tipo_pago ?? 'cash',
      credit_days: r.credit_days ?? r.dias_credito ?? 0,
      status: r.status ?? r.estado ?? 'pending',
      paid_amount: r.paid_amount ?? r.monto_pagado ?? 0,
      image_url: r.image_url ?? '',
      notes: r.notes ?? r.notas ?? '',
      due_date: r.due_date ?? r.fecha_vencimiento ?? '',
      created_at: r.created_at
    }));

    _workers = (emp.data || []).map((r: any): Worker => ({
      id: r.id,
      full_name: r.full_name ?? r.nombre ?? r.name ?? '',
      phone: r.phone ?? r.telefono ?? '',
      daily_rate: r.daily_rate ?? r.tarifa_diaria ?? r.salario_diario ?? 0,
      pay_frequency: r.pay_frequency ?? r.frecuencia_pago ?? 'daily',
      is_active: r.is_active ?? r.activo ?? true,
      avatar_url: r.avatar_url ?? '',
      created_at: r.created_at
    }));

    _expenses = (gop.data || []).map((r: any): OperationalExpense => ({
      id: r.id,
      category: r.category ?? r.categoria ?? 'other',
      description: r.description ?? r.descripcion ?? '',
      amount: r.amount ?? r.monto ?? 0,
      date: r.date ?? r.fecha ?? r.created_at,
      project_id: r.project_id ?? r.proyecto_id ?? '',
      project_name: r.project_name ?? r.nombre_proyecto ?? '',
      receipt_url: r.receipt_url ?? r.comprobante_url ?? '',
      created_by: '',
      created_at: r.created_at
    }));

    _payrolls = (nom.data || []).map((r: any): Payroll => ({
      id: r.id,
      worker_id: r.worker_id ?? r.empleado_id ?? r.trabajador_id ?? '',
      worker_name: r.worker_name ?? r.nombre_empleado ?? r.nombre_trabajador ?? '',
      project_id: r.project_id ?? r.proyecto_id ?? '',
      project_name: r.project_name ?? r.nombre_proyecto ?? '',
      days_worked: r.days_worked ?? r.dias_trabajados ?? 0,
      daily_rate: r.daily_rate ?? r.tarifa_diaria ?? 0,
      total: r.total ?? r.monto ?? 0,
      week_start: r.week_start ?? r.semana_inicio ?? '',
      week_end: r.week_end ?? r.semana_fin ?? '',
      is_paid: r.is_paid ?? r.pagado ?? false,
      paid_date: r.paid_date ?? r.fecha_pago ?? '',
      notes: r.notes ?? r.notas ?? '',
      created_at: r.created_at
    }));

    const loansRaw = prest.data || [];
    const loanIds = loansRaw.map((l: any) => l.id);
    let deductions: LoanDeduction[] = [];
    if (loanIds.length > 0) {
      const { data: ded } = await supabase.from('cf_deducciones_prestamo').select('*').in('loan_id', loanIds);
      deductions = (ded || []).map((d: any): LoanDeduction => ({
        id: d.id,
        loan_id: d.loan_id,
        amount: d.amount ?? d.monto ?? 0,
        date: d.date ?? d.fecha ?? d.created_at,
        notes: d.notes ?? d.notas ?? '',
        created_at: d.created_at
      }));
    }
    _loans = loansRaw.map((r: any): Loan => ({
      id: r.id,
      worker_id: r.worker_id ?? r.empleado_id ?? '',
      worker_name: r.worker_name ?? r.nombre_empleado ?? '',
      amount: r.amount ?? r.monto ?? 0,
      remaining: r.remaining ?? r.saldo ?? r.amount ?? 0,
      status: r.status ?? r.estado ?? 'active',
      date: r.date ?? r.fecha ?? r.created_at,
      notes: r.notes ?? r.notas ?? '',
      created_at: r.created_at,
      deductions: deductions.filter(d => d.loan_id === r.id)
    }));

    _users = (usu.data || []).map((r: any): User => ({
      id: r.id,
      pin: r.pin,
      full_name: r.full_name ?? r.nombre ?? '',
      email: r.email ?? '',
      phone: r.phone ?? r.telefono ?? '',
      role: r.role ?? r.rol ?? 'operator',
      permissions: r.permissions ?? {
        dashboard: true, projects: false, warehouse: false, purchases: false,
        invoices: false, users: false, settings: false, workers: false,
        operational_expenses: false, payroll: false, loans: false,
        expense_report: false, full_access: false, investors: false
      },
      is_active: r.is_active ?? r.activo ?? true,
      avatar_url: r.avatar_url ?? '',
      created_at: r.created_at
    }));

    const c = (conf as any).data;
    if (c) {
      _settings = {
        company_name: c.empresa ?? c.company_name ?? 'Campo',
        company_address: c.direccion ?? c.company_address ?? '',
        company_phone: c.telefono ?? c.company_phone ?? '',
        currency_symbol: c.moneda ?? c.currency_symbol ?? 'RD$',
        date_format: c.formato_fecha ?? c.date_format ?? 'DD/MM/YYYY',
        theme: c.tema ?? c.theme ?? 'light',
        session_timeout: 30
      };
    }

    // Inversionistas (puede que no exista la tabla aún)
    _investors = ((inv2 as any).data || []).map((r: any): Investor => ({
      id: r.id,
      business_id: r.business_id,
      nombre: r.nombre ?? '',
      email: r.email ?? '',
      telefono: r.telefono ?? '',
      empresa: r.empresa ?? '',
      capital_total: r.capital_total ?? 0,
      notas: r.notas ?? '',
      is_active: r.is_active ?? true,
      created_at: r.created_at
    }));

    // Enriquecer project investors con nombres
    _projectInvestors = ((pi as any).data || []).map((r: any): ProjectInvestor => {
      const proj = _projects.find(p => p.id === r.proyecto_id);
      const inv = _investors.find(i => i.id === r.inversionista_id);
      return {
        id: r.id,
        business_id: r.business_id,
        proyecto_id: r.proyecto_id ?? '',
        project_name: proj?.name ?? '',
        inversionista_id: r.inversionista_id ?? '',
        investor_name: inv?.nombre ?? '',
        capital_invertido: r.capital_invertido ?? 0,
        porcentaje_ganancia: r.porcentaje_ganancia ?? 0,
        ganancia_estimada: r.ganancia_estimada ?? 0,
        ganancia_real: r.ganancia_real ?? 0,
        status: r.status ?? 'activo',
        fecha_inicio: r.fecha_inicio ?? '',
        fecha_pago: r.fecha_pago ?? '',
        notas: r.notas ?? '',
        created_at: r.created_at
      };
    });

  } catch (e) { console.error('Store load error:', e); }
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export function getDashboardStats(): DashboardStats {
  const totalBalance = _projects.reduce((s, p) => s + (p.budget - p.spent), 0);
  const pendingPayments = _invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + (i.amount - i.paid_amount), 0);
  const warehouseValue = _products.reduce((s, p) => s + p.price * p.quantity, 0);
  const nowStr = new Date().toISOString().substring(0, 7);
  const monthly_income = _purchases.filter(x => x.date?.startsWith(nowStr)).reduce((s, x) => s + x.total, 0);
  const monthly_expense = _expenses.filter(x => x.date?.startsWith(nowStr)).reduce((s, x) => s + x.amount, 0);
  return {
    total_balance: totalBalance,
    pending_payments: pendingPayments,
    today_entries: 0,
    warehouse_value: warehouseValue,
    monthly_income,
    monthly_expense,
    active_projects: _projects.filter(p => p.status === 'active').length,
    low_stock_products: _products.filter(p => p.quantity <= p.min_stock).length
  };
}

const ML = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
export function getMonthlyData(): MonthlyData[] {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return {
      month: ML[d.getMonth()],
      income: _purchases.filter(x => x.date?.startsWith(m)).reduce((s, x) => s + x.total, 0),
      expense: _expenses.filter(x => x.date?.startsWith(m)).reduce((s, x) => s + x.amount, 0)
    };
  });
}

const COLORS = ['#1B4332','#2D6A4F','#A7C4B5','#D4A574','#C97B7B','#6B6B6B'];
export function getProjectDistribution(): ProjectDistribution[] {
  return _projects.slice(0, 6).map((p, i) => ({
    name: p.name,
    value: p.spent || p.budget || 0,
    color: COLORS[i % COLORS.length]
  }));
}

// ── Auth shim ─────────────────────────────────────────────────────────────────
const SK = 'cf_user_session_v2';
export const MockAuthService = {
  login: (_pin: string) => null,
  logout: () => { localStorage.removeItem(SK); },
  getSession: () => { try { const s = localStorage.getItem(SK); return s ? JSON.parse(s) : null; } catch { return null; } },
};

// ── Projects ──────────────────────────────────────────────────────────────────
export const MockProjectService = {
  getAll: () => [..._projects],
  getById: (id: string) => _projects.find(p => p.id === id) ?? null,
  create: async (data: Partial<Project>) => {
    const { data: r } = await supabase.from('cf_proyectos').insert({
      business_id: BID, name: data.name!, description: data.description ?? '',
      budget: data.budget ?? 0, spent: 0, status: data.status ?? 'active',
      pipeline_stage: data.pipeline_stage ?? 'planning', manager_name: data.created_by_name ?? ''
    }).select().single();
    if (r) { const np: Project = { ...data as Project, id: r.id, created_at: r.created_at, spent: 0 }; _projects.push(np); return np; }
    return null;
  },
  update: async (id: string, data: Partial<Project>) => {
    await supabase.from('cf_proyectos').update({
      name: data.name, description: data.description, budget: data.budget,
      status: data.status, pipeline_stage: data.pipeline_stage
    }).eq('id', id);
    const idx = _projects.findIndex(p => p.id === id);
    if (idx >= 0) { _projects[idx] = { ..._projects[idx], ...data }; return _projects[idx]; }
    return null;
  },
  delete: async (id: string) => {
    await supabase.from('cf_proyectos').delete().eq('id', id);
    _projects = _projects.filter(p => p.id !== id);
  },
};

// ── Entries ───────────────────────────────────────────────────────────────────
export const MockEntryService = {
  getAll: () => {
    const entries: any[] = [];
    _purchases.slice(0, 30).forEach(p => entries.push({
      id: p.id, project_id: '', project_name: '', type: 'entry',
      quantity: p.quantity, amount: p.total, date: p.date, time: '',
      user_id: '', user_name: p.created_by_name ?? '', notes: p.supplier, created_at: p.created_at
    }));
    _expenses.slice(0, 20).forEach(e => entries.push({
      id: e.id, project_id: e.project_id, project_name: e.project_name, type: 'gasto',
      quantity: 1, amount: -e.amount, date: e.date, time: '',
      user_id: '', user_name: '', notes: e.description, created_at: e.created_at
    }));
    return entries.sort((a, b) => new Date(b.date || b.created_at).getTime() - new Date(a.date || a.created_at).getTime());
  },
  getByProject: (projectId: string) => MockEntryService.getAll().filter((e: any) => e.project_id === projectId),
  create: async (data: any) => {
    const row = {
      business_id: BID, product_name: data.notes ?? '',
      supplier: data.user_name ?? 'Manual', quantity: data.quantity ?? 1,
      unit_price: data.amount ?? 0, total: data.amount ?? 0,
      date: data.date ?? new Date().toISOString().slice(0, 10)
    };
    const { data: r } = await supabase.from('cf_compras').insert(row).select().single();
    if (r) { _purchases.unshift({ ...row, id: r.id, product_id: '', image_url: '', created_by: '', created_by_name: '', created_at: r.created_at }); return { ...data, id: r.id, created_at: r.created_at }; }
    return null;
  },
};

// ── Products (Almacén) ────────────────────────────────────────────────────────
export const MockProductService = {
  getAll: () => [..._products],
  getById: (id: string) => _products.find(p => p.id === id) ?? null,
  create: async (data: Partial<Product>) => {
    const { data: r } = await supabase.from('cf_inventario').insert({ business_id: BID, ...data }).select().single();
    if (r) { const np = { ...data as Product, id: r.id, created_at: r.created_at }; _products.push(np); return np; }
    return null;
  },
  update: async (id: string, data: Partial<Product>) => {
    await supabase.from('cf_inventario').update(data).eq('id', id);
    const idx = _products.findIndex(p => p.id === id);
    if (idx >= 0) { _products[idx] = { ..._products[idx], ...data }; return _products[idx]; }
    return null;
  },
  delete: async (id: string) => {
    await supabase.from('cf_inventario').delete().eq('id', id);
    _products = _products.filter(p => p.id !== id);
  },
};

export const MockMovementService = {
  getAll: (): InventoryMovement[] => [],
  getByProduct: (_productId: string): InventoryMovement[] => [],
  create: async (_data: Partial<InventoryMovement>) => null,
};

// ── Purchases ─────────────────────────────────────────────────────────────────
export const MockPurchaseService = {
  getAll: () => [..._purchases],
  getById: (id: string) => _purchases.find(p => p.id === id) ?? null,
  create: async (data: Partial<Purchase>) => {
    const row = {
      business_id: BID, supplier: data.supplier, product_id: data.product_id ?? null,
      product_name: data.product_name ?? '', quantity: data.quantity ?? 0,
      unit_price: data.unit_price ?? 0, total: data.total ?? 0,
      date: data.date ?? new Date().toISOString().slice(0, 10), image_url: data.image_url ?? ''
    };
    const { data: r } = await supabase.from('cf_compras').insert(row).select().single();
    if (r) { const np = { ...data as Purchase, id: r.id, created_at: r.created_at }; _purchases.unshift(np); return np; }
    return null;
  },
  delete: async (id: string) => {
    await supabase.from('cf_compras').delete().eq('id', id);
    _purchases = _purchases.filter(p => p.id !== id);
  },
};

// ── Invoices ──────────────────────────────────────────────────────────────────
export const MockInvoiceService = {
  getAll: () => [..._invoices],
  getById: (id: string) => _invoices.find(i => i.id === id) ?? null,
  create: async (data: Partial<Invoice>) => {
    const row = {
      business_id: BID, project_id: data.project_id ?? '', project_name: data.project_name ?? '',
      invoice_number: data.invoice_number ?? `FAC-${Date.now()}`, supplier: data.supplier ?? '',
      amount: data.amount ?? 0, paid_amount: 0, payment_type: data.payment_type ?? 'cash',
      credit_days: data.credit_days ?? 0, status: 'pending', image_url: data.image_url ?? '', notes: data.notes ?? ''
    };
    const { data: r } = await supabase.from('cf_facturas').insert(row).select().single();
    if (r) { const ni = { ...data as Invoice, id: r.id, paid_amount: 0, status: 'pending' as const, created_at: r.created_at }; _invoices.unshift(ni); return ni; }
    return null;
  },
  update: async (id: string, data: Partial<Invoice>) => {
    await supabase.from('cf_facturas').update(data).eq('id', id);
    const idx = _invoices.findIndex(i => i.id === id);
    if (idx >= 0) { _invoices[idx] = { ..._invoices[idx], ...data }; return _invoices[idx]; }
    return null;
  },
  delete: async (id: string) => {
    await supabase.from('cf_facturas').delete().eq('id', id);
    _invoices = _invoices.filter(i => i.id !== id);
  },
};
export const MockPaymentService = { getAll: () => [] as any[], create: async (_d: any) => null };

// ── Workers ───────────────────────────────────────────────────────────────────
export const MockWorkerService = {
  getAll: () => [..._workers],
  getActive: () => _workers.filter(w => w.is_active),
  getById: (id: string) => _workers.find(w => w.id === id) ?? null,
  create: async (data: Partial<Worker>) => {
    const { data: r } = await supabase.from('cf_empleados').insert({
      business_id: BID, full_name: data.full_name, phone: data.phone ?? '',
      daily_rate: data.daily_rate ?? 0, pay_frequency: data.pay_frequency ?? 'daily',
      is_active: data.is_active ?? true
    }).select().single();
    if (r) { const nw = { ...data as Worker, id: r.id, created_at: r.created_at }; _workers.push(nw); return nw; }
    return null;
  },
  update: async (id: string, data: Partial<Worker>) => {
    await supabase.from('cf_empleados').update(data).eq('id', id);
    const idx = _workers.findIndex(w => w.id === id);
    if (idx >= 0) { _workers[idx] = { ..._workers[idx], ...data }; return _workers[idx]; }
    return null;
  },
  delete: async (id: string) => {
    await supabase.from('cf_empleados').delete().eq('id', id);
    _workers = _workers.filter(w => w.id !== id);
  },
};

// ── Expenses ──────────────────────────────────────────────────────────────────
export const MockExpenseService = {
  getAll: () => [..._expenses],
  create: async (data: Partial<OperationalExpense>) => {
    const row = {
      business_id: BID, category: data.category ?? 'other', description: data.description ?? '',
      amount: data.amount ?? 0, date: data.date ?? new Date().toISOString().slice(0, 10),
      project_id: data.project_id ?? null, project_name: data.project_name ?? '', receipt_url: data.receipt_url ?? ''
    };
    const { data: r } = await supabase.from('cf_gastos_operativos').insert(row).select().single();
    if (r) { const ne = { ...data as OperationalExpense, id: r.id, created_at: r.created_at }; _expenses.unshift(ne); return ne; }
    return null;
  },
  delete: async (id: string) => {
    await supabase.from('cf_gastos_operativos').delete().eq('id', id);
    _expenses = _expenses.filter(e => e.id !== id);
  },
};
export const MockOperationalExpenseService = MockExpenseService;

// ── Payroll ───────────────────────────────────────────────────────────────────
export const MockPayrollService = {
  getAll: () => [..._payrolls],
  update: async (id: string, data: Partial<Payroll>) => {
    await supabase.from('cf_nominas').update(data).eq('id', id);
    const idx = _payrolls.findIndex(p => p.id === id);
    if (idx >= 0) { _payrolls[idx] = { ..._payrolls[idx], ...data }; return _payrolls[idx]; }
    return null;
  },
  create: async (data: Partial<Payroll>) => {
    const row = {
      business_id: BID, worker_id: data.worker_id, worker_name: data.worker_name ?? '',
      project_id: data.project_id ?? null, project_name: data.project_name ?? '',
      days_worked: data.days_worked ?? 0, daily_rate: data.daily_rate ?? 0, total: data.total ?? 0,
      week_start: data.week_start ?? '', week_end: data.week_end ?? '', is_paid: false, notes: data.notes ?? ''
    };
    const { data: r } = await supabase.from('cf_nominas').insert(row).select().single();
    if (r) { const np = { ...data as Payroll, id: r.id, is_paid: false, created_at: r.created_at }; _payrolls.unshift(np); return np; }
    return null;
  },
  markPaid: async (id: string) => {
    await supabase.from('cf_nominas').update({ is_paid: true, paid_date: new Date().toISOString().slice(0, 10) }).eq('id', id);
    const idx = _payrolls.findIndex(p => p.id === id);
    if (idx >= 0) { _payrolls[idx].is_paid = true; return _payrolls[idx]; }
    return null;
  },
};

// ── Loans ─────────────────────────────────────────────────────────────────────
export const MockLoanService = {
  getAll: () => [..._loans],
  update: async (id: string, data: Partial<Loan>) => {
    await supabase.from('cf_prestamos').update(data).eq('id', id);
    const idx = _loans.findIndex(l => l.id === id);
    if (idx >= 0) { _loans[idx] = { ..._loans[idx], ...data }; return _loans[idx]; }
    return null;
  },
  create: async (data: Partial<Loan>) => {
    const { data: r } = await supabase.from('cf_prestamos').insert({
      business_id: BID, worker_id: data.worker_id, worker_name: data.worker_name ?? '',
      amount: data.amount ?? 0, remaining: data.amount ?? 0, status: 'active',
      date: new Date().toISOString().slice(0, 10), notes: data.notes ?? ''
    }).select().single();
    if (r) { const nl = { ...data as Loan, id: r.id, remaining: data.amount ?? 0, status: 'active' as const, deductions: [], created_at: r.created_at }; _loans.push(nl); return nl; }
    return null;
  },
  addDeduction: async (loanId: string, amount: number, date: string) => {
    const { data: r } = await supabase.from('cf_deducciones_prestamo').insert({ loan_id: loanId, amount, date, notes: '' }).select().single();
    const loan = _loans.find(l => l.id === loanId);
    if (loan && r) {
      loan.remaining = Math.max(0, loan.remaining - amount);
      loan.status = loan.remaining === 0 ? 'paid' : 'active';
      await supabase.from('cf_prestamos').update({ remaining: loan.remaining, status: loan.status }).eq('id', loanId);
      loan.deductions.push({ id: r.id, loan_id: loanId, amount, date, notes: '', created_at: r.created_at });
    }
    return loan ?? null;
  },
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const MockUserService = {
  getAll: () => [..._users],
  create: async (data: Partial<User> & { pin: string }) => {
    const { data: r } = await supabase.from('cf_usuarios_negocio').insert({
      business_id: BID, full_name: data.full_name, pin: data.pin,
      role: data.role ?? 'operator', email: data.email ?? '', phone: data.phone ?? '',
      is_active: true,
      permissions: data.permissions ?? {
        dashboard: true, projects: false, warehouse: false, purchases: false,
        invoices: false, users: false, settings: false, workers: false,
        operational_expenses: false, payroll: false, loans: false,
        expense_report: false, full_access: false, investors: false
      }
    }).select().single();
    if (r) { const nu: User = { ...r, avatar_url: '' }; _users.push(nu); return nu; }
    return null;
  },
  update: async (id: string, data: Partial<User>) => {
    await supabase.from('cf_usuarios_negocio').update(data).eq('id', id);
    const idx = _users.findIndex(u => u.id === id);
    if (idx >= 0) { _users[idx] = { ..._users[idx], ...data }; return _users[idx]; }
    return null;
  },
  delete: async (id: string) => {
    await supabase.from('cf_usuarios_negocio').delete().eq('id', id);
    _users = _users.filter(u => u.id !== id);
  },
};

// ── Settings ──────────────────────────────────────────────────────────────────
export const MockSettingsService = {
  get: () => ({ ..._settings }),
  update: async (data: Partial<AppSettings>) => {
    _settings = { ..._settings, ...data };
    await supabase.from('cf_configuracion').upsert({
      business_id: BID, empresa: data.company_name, direccion: data.company_address,
      telefono: data.company_phone, moneda: data.currency_symbol,
      formato_fecha: data.date_format, tema: data.theme
    });
    return _settings;
  },
};

// ── Notifications (stub) ──────────────────────────────────────────────────────
let _notifications: any[] = [];
export const MockNotificationService = {
  getAll: () => [..._notifications],
  markAsRead: (id: string) => { const n = _notifications.find(x => x.id === id); if (n) n.is_read = true; },
  markAllAsRead: () => { _notifications.forEach(n => { n.is_read = true; }); },
  add: (notif: any) => { _notifications.unshift({ ...notif, id: Date.now().toString(), is_read: false, created_at: new Date().toISOString() }); },
};

// ── Investors ─────────────────────────────────────────────────────────────────
export const MockInvestorService = {
  getAll: () => [..._investors],
  getById: (id: string) => _investors.find(i => i.id === id) ?? null,
  create: async (data: Partial<Investor>) => {
    try {
      const { data: r } = await supabase.from('cf_inversionistas').insert({
        business_id: BID, nombre: data.nombre!, email: data.email ?? '',
        telefono: data.telefono ?? '', empresa: data.empresa ?? '',
        capital_total: data.capital_total ?? 0, notas: data.notas ?? '', is_active: true
      }).select().single();
      if (r) { const ni: Investor = { ...r }; _investors.push(ni); return ni; }
    } catch (e) { console.error('Inversionistas table not ready. Run migration SQL.', e); }
    return null;
  },
  update: async (id: string, data: Partial<Investor>) => {
    try {
      await supabase.from('cf_inversionistas').update(data).eq('id', id);
      const idx = _investors.findIndex(i => i.id === id);
      if (idx >= 0) { _investors[idx] = { ..._investors[idx], ...data }; return _investors[idx]; }
    } catch { }
    return null;
  },
  delete: async (id: string) => {
    try {
      await supabase.from('cf_inversionistas').delete().eq('id', id);
      _investors = _investors.filter(i => i.id !== id);
    } catch { }
  },

  // Project investors
  getProjectInvestors: (proyectoId?: string) => {
    if (proyectoId) return _projectInvestors.filter(pi => pi.proyecto_id === proyectoId);
    return [..._projectInvestors];
  },
  assignToProject: async (data: Partial<ProjectInvestor>) => {
    try {
      const investor = _investors.find(i => i.id === data.inversionista_id);
      const project = _projects.find(p => p.id === data.proyecto_id);
      const ganancia = ((data.capital_invertido ?? 0) * (data.porcentaje_ganancia ?? 0)) / 100;
      const { data: r } = await supabase.from('cf_proyecto_inversionistas').insert({
        business_id: BID, proyecto_id: data.proyecto_id!, inversionista_id: data.inversionista_id!,
        capital_invertido: data.capital_invertido ?? 0, porcentaje_ganancia: data.porcentaje_ganancia ?? 0,
        ganancia_estimada: ganancia, ganancia_real: data.ganancia_real ?? 0,
        status: data.status ?? 'activo', fecha_inicio: data.fecha_inicio ?? null,
        fecha_pago: data.fecha_pago ?? null, notas: data.notas ?? ''
      }).select().single();
      if (r) {
        const npi: ProjectInvestor = {
          ...r, project_name: project?.name ?? '', investor_name: investor?.nombre ?? ''
        };
        _projectInvestors.push(npi);
        return npi;
      }
    } catch (e) { console.error('cf_proyecto_inversionistas error', e); }
    return null;
  },
  updateProjectInvestor: async (id: string, data: Partial<ProjectInvestor>) => {
    try {
      await supabase.from('cf_proyecto_inversionistas').update(data).eq('id', id);
      const idx = _projectInvestors.findIndex(pi => pi.id === id);
      if (idx >= 0) { _projectInvestors[idx] = { ..._projectInvestors[idx], ...data }; return _projectInvestors[idx]; }
    } catch { }
    return null;
  },
  deleteProjectInvestor: async (id: string) => {
    try {
      await supabase.from('cf_proyecto_inversionistas').delete().eq('id', id);
      _projectInvestors = _projectInvestors.filter(pi => pi.id !== id);
    } catch { }
  },
};
