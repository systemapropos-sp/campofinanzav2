import type {
  User, Project, Entry, Product, Purchase, InventoryMovement,
  Invoice, Payment, Notification, AppSettings, DashboardStats,
  MonthlyData, ProjectDistribution, Worker, OperationalExpense,
  Payroll, Loan, LoanDeduction
} from '@/types';

// Seed data
const seedUsers = (): User[] => [
  {
    id: 'u1', pin: '1234', full_name: 'Carlos Mendez', email: 'admin@campo.com', phone: '555-0100',
    role: 'admin',
    permissions: {
      dashboard: true, projects: true, warehouse: true, purchases: true, invoices: true,
      users: true, settings: true, workers: true, operational_expenses: true,
      payroll: true, loans: true, expense_report: true, full_access: true,
    },
    is_active: true, created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'u2', pin: '5678', full_name: 'Maria Garcia', email: 'maria@campo.com', phone: '555-0101',
    role: 'operator',
    permissions: {
      dashboard: true, projects: true, warehouse: true, purchases: true, invoices: false,
      users: false, settings: false, workers: true, operational_expenses: true,
      payroll: false, loans: false, expense_report: true, full_access: false,
    },
    is_active: true, created_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'u3', pin: '9012', full_name: 'Juan Rodriguez', email: 'juan@campo.com', phone: '555-0102',
    role: 'operator',
    permissions: {
      dashboard: true, projects: false, warehouse: true, purchases: false, invoices: false,
      users: false, settings: false, workers: false, operational_expenses: false,
      payroll: false, loans: false, expense_report: false, full_access: false,
    },
    is_active: true, created_at: '2024-03-10T00:00:00Z',
  },
];

const seedWorkers = (): Worker[] => [
  { id: 'w1', full_name: 'Pedro Hernandez', phone: '555-1001', daily_rate: 350, pay_frequency: 'daily', is_active: true, created_at: '2024-01-10T00:00:00Z' },
  { id: 'w2', full_name: 'Luis Martinez', phone: '555-1002', daily_rate: 350, pay_frequency: 'daily', is_active: true, created_at: '2024-01-15T00:00:00Z' },
  { id: 'w3', full_name: 'Ana Lopez', phone: '555-1003', daily_rate: 400, pay_frequency: 'weekly', is_active: true, created_at: '2024-02-01T00:00:00Z' },
  { id: 'w4', full_name: 'Roberto Sanchez', phone: '555-1004', daily_rate: 350, pay_frequency: 'daily', is_active: true, created_at: '2024-02-10T00:00:00Z' },
  { id: 'w5', full_name: 'Marta Diaz', phone: '555-1005', daily_rate: 400, pay_frequency: 'weekly', is_active: false, created_at: '2024-03-01T00:00:00Z' },
  { id: 'w6', full_name: 'Jose Torres', phone: '555-1006', daily_rate: 350, pay_frequency: 'daily', is_active: true, created_at: '2024-03-15T00:00:00Z' },
  { id: 'w7', full_name: 'Carmen Ruiz', phone: '555-1007', daily_rate: 380, pay_frequency: 'weekly', is_active: true, created_at: '2024-04-01T00:00:00Z' },
  { id: 'w8', full_name: 'Fernando Castro', phone: '555-1008', daily_rate: 350, pay_frequency: 'daily', is_active: true, created_at: '2024-04-20T00:00:00Z' },
];

const seedProjects = (): Project[] => [
  {
    id: 'p1', name: 'Cosecha de Maiz 2024', description: 'Cosecha principal de maiz en el lote norte',
    budget: 150000, spent: 87500, status: 'active', manager_id: 'u1', pipeline_stage: 'in_progress',
    worker_ids: ['w1', 'w2', 'w3', 'w4'], created_by: 'u1', created_at: '2024-01-20T00:00:00Z',
  },
  {
    id: 'p2', name: 'Riego Sistema Sur', description: 'Instalacion de sistema de riego en lotes sur',
    budget: 80000, spent: 42000, status: 'active', manager_id: 'u2', pipeline_stage: 'in_progress',
    worker_ids: ['w2', 'w5', 'w6'], created_by: 'u1', created_at: '2024-02-15T00:00:00Z',
  },
  {
    id: 'p3', name: 'Cosecha de Trigo', description: 'Temporada de trigo primavera',
    budget: 95000, spent: 95000, status: 'completed', manager_id: 'u1', pipeline_stage: 'completed',
    worker_ids: ['w1', 'w3'], created_by: 'u2', created_at: '2024-03-01T00:00:00Z',
  },
  {
    id: 'p4', name: 'Construccion Bodega', description: 'Ampliacion de bodega de almacenamiento',
    budget: 120000, spent: 35000, status: 'active', manager_id: 'u1', pipeline_stage: 'planning',
    worker_ids: ['w4', 'w6', 'w7', 'w8'], created_by: 'u1', created_at: '2024-04-10T00:00:00Z',
  },
  {
    id: 'p5', name: 'Cultivo de Tomate', description: 'Invernadero de tomates organicos',
    budget: 60000, spent: 15000, status: 'paused', manager_id: 'u2', pipeline_stage: 'review',
    worker_ids: ['w3', 'w7'], created_by: 'u2', created_at: '2024-05-01T00:00:00Z',
  },
  {
    id: 'p6', name: 'Siembra de Cana', description: 'Siembra de cana de azucar',
    budget: 200000, spent: 120000, status: 'active', manager_id: 'u1', pipeline_stage: 'in_progress',
    worker_ids: ['w1', 'w2', 'w4', 'w6', 'w8'], created_by: 'u1', created_at: '2024-06-15T00:00:00Z',
  },
];

const seedProducts = (): Product[] => [
  { id: 'pr1', name: 'Fertilizante NPK 20-20-20', description: 'Fertilizante completo para uso general', sku: 'NPK-2020', category: 'Fertilizantes', price: 450, quantity: 120, min_stock: 20, image_url: '', created_at: '2024-01-01T00:00:00Z' },
  { id: 'pr2', name: 'Herbicida Glyphosate', description: 'Herbicida no selectivo', sku: 'GLY-41', category: 'Herbicidas', price: 280, quantity: 45, min_stock: 15, image_url: '', created_at: '2024-01-05T00:00:00Z' },
  { id: 'pr3', name: 'Semilla de Maiz Hibrido', description: 'Semilla certificada hibrida', sku: 'SEM-MAIZ', category: 'Semillas', price: 1200, quantity: 8, min_stock: 10, image_url: '', created_at: '2024-02-01T00:00:00Z' },
  { id: 'pr4', name: 'Manguera de Riego 2"', description: 'Manguera PVC para riego', sku: 'MAN-2IN', category: 'Equipo', price: 85, quantity: 200, min_stock: 30, image_url: '', created_at: '2024-02-15T00:00:00Z' },
  { id: 'pr5', name: 'Pala de Acero', description: 'Pala para trabajo pesado', sku: 'PAL-001', category: 'Herramientas', price: 350, quantity: 15, min_stock: 5, image_url: '', created_at: '2024-03-01T00:00:00Z' },
  { id: 'pr6', name: 'Insecticida Organico', description: 'Control biologico de plagas', sku: 'INS-ORG', category: 'Insecticidas', price: 520, quantity: 32, min_stock: 10, image_url: '', created_at: '2024-03-15T00:00:00Z' },
  { id: 'pr7', name: 'Semilla de Trigo', description: 'Trigo hard red spring', sku: 'SEM-TRIG', category: 'Semillas', price: 890, quantity: 50, min_stock: 15, image_url: '', created_at: '2024-04-01T00:00:00Z' },
  { id: 'pr8', name: 'Tuberia PVC 4"', description: 'Tuberia para sistema de riego', sku: 'TUB-4IN', category: 'Equipo', price: 120, quantity: 3, min_stock: 10, image_url: '', created_at: '2024-04-15T00:00:00Z' },
  { id: 'pr9', name: 'Guantes de Trabajo', description: 'Guantes de cuero reforzados', sku: 'GUA-001', category: 'Seguridad', price: 150, quantity: 60, min_stock: 20, image_url: '', created_at: '2024-05-01T00:00:00Z' },
  { id: 'pr10', name: 'Casco de Seguridad', description: 'Caspo con visera', sku: 'CAS-001', category: 'Seguridad', price: 280, quantity: 25, min_stock: 10, image_url: '', created_at: '2024-05-15T00:00:00Z' },
];

const seedEntries = (): Entry[] => {
  const entries: Entry[] = [];
  const projects = seedProjects();
  const users = seedUsers();
  for (let i = 0; i < 40; i++) {
    const project = projects[Math.floor(Math.random() * projects.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const date = new Date(2024, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1);
    entries.push({
      id: `e${i + 1}`, project_id: project.id, quantity: Math.floor(Math.random() * 100) + 1,
      amount: Math.floor(Math.random() * 5000) + 500, date: date.toISOString().split('T')[0],
      time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      user_id: user.id, notes: `Entrega de materiales lote ${i + 1}`, created_at: date.toISOString(),
    });
  }
  return entries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

const seedPurchases = (): Purchase[] => {
  const purchases: Purchase[] = [];
  const products = seedProducts();
  const users = seedUsers();
  for (let i = 0; i < 25; i++) {
    const product = products[Math.floor(Math.random() * products.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const qty = Math.floor(Math.random() * 50) + 5;
    const price = Math.floor(Math.random() * 500) + 100;
    const date = new Date(2024, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1);
    purchases.push({
      id: `pc${i + 1}`, product_id: product.id, supplier: `Proveedor ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`,
      quantity: qty, unit_price: price, total: qty * price, date: date.toISOString().split('T')[0],
      created_by: user.id, created_at: date.toISOString(),
    });
  }
  return purchases.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

const seedMovements = (): InventoryMovement[] => {
  const movements: InventoryMovement[] = [];
  const products = seedProducts();
  const users = seedUsers();
  const types: ('in' | 'out' | 'assignment')[] = ['in', 'out', 'assignment'];
  for (let i = 0; i < 30; i++) {
    const product = products[Math.floor(Math.random() * products.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const assigned = users[Math.floor(Math.random() * users.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const date = new Date(2024, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1);
    movements.push({
      id: `m${i + 1}`, product_id: product.id, type, quantity: Math.floor(Math.random() * 20) + 1,
      user_id: user.id, assigned_to: type === 'assignment' ? assigned.id : undefined,
      notes: `Movimiento ${type} registrado`, created_at: date.toISOString(),
    });
  }
  return movements.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

const seedInvoices = (): Invoice[] => {
  const invoices: Invoice[] = [];
  const projects = seedProjects();
  const statuses: ('pending' | 'partial' | 'paid')[] = ['pending', 'partial', 'paid'];
  for (let i = 0; i < 20; i++) {
    const project = projects[Math.floor(Math.random() * projects.length)];
    const amount = Math.floor(Math.random() * 15000) + 1000;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const paid = status === 'paid' ? amount : status === 'partial' ? Math.floor(amount * 0.4) : 0;
    const isCash = Math.random() > 0.5;
    const creditDays = isCash ? undefined : [15, 30, 45, 60][Math.floor(Math.random() * 4)];
    const date = new Date(2024, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1);
    invoices.push({
      id: `inv${i + 1}`, project_id: project.id, invoice_number: `FAC-2024-${String(i + 1).padStart(4, '0')}`,
      supplier: `Proveedor ${String.fromCharCode(65 + Math.floor(Math.random() * 8))}`, amount,
      payment_type: isCash ? 'cash' : 'credit', credit_days: creditDays, status,
      due_date: new Date(date.getTime() + (creditDays || 30) * 86400000).toISOString().split('T')[0],
      paid_amount: paid, notes: '', created_at: date.toISOString(),
    });
  }
  return invoices.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

const seedPayments = (): Payment[] => {
  const payments: Payment[] = [];
  const invoices = seedInvoices();
  const methods: ('cash' | 'transfer' | 'check')[] = ['cash', 'transfer', 'check'];
  let idx = 1;
  for (const inv of invoices) {
    if (inv.status !== 'pending') {
      const numPayments = inv.status === 'paid' ? Math.floor(Math.random() * 2) + 1 : 1;
      for (let j = 0; j < numPayments; j++) {
        payments.push({
          id: `pay${idx++}`, invoice_id: inv.id,
          amount: j === 0 ? inv.paid_amount : Math.floor(Math.random() * 2000) + 500,
          payment_date: new Date(2024, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
          payment_method: methods[Math.floor(Math.random() * methods.length)], notes: '',
          created_at: new Date().toISOString(),
        });
      }
    }
  }
  return payments;
};

const seedOperationalExpenses = (): OperationalExpense[] => {
  const categories: OperationalExpense['category'][] = ['fuel', 'maintenance', 'utilities', 'transport', 'food', 'other'];
  const projects = seedProjects();
  const users = seedUsers();
  const expenses: OperationalExpense[] = [];
  for (let i = 0; i < 30; i++) {
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const proj = projects[Math.floor(Math.random() * projects.length)];
    const date = new Date(2024, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1);
    expenses.push({
      id: `oe${i + 1}`, category: cat,
      description: `Gasto en ${cat} para operacion ${i + 1}`,
      amount: Math.floor(Math.random() * 5000) + 200,
      date: date.toISOString().split('T')[0], project_id: proj.id,
      created_by: users[Math.floor(Math.random() * users.length)].id,
      created_at: date.toISOString(),
    });
  }
  return expenses.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

const seedPayrolls = (): Payroll[] => {
  const workers = seedWorkers();
  const projects = seedProjects();
  const payrolls: Payroll[] = [];
  for (let i = 0; i < 20; i++) {
    const worker = workers[Math.floor(Math.random() * workers.length)];
    const project = projects[Math.floor(Math.random() * projects.length)];
    const days = Math.floor(Math.random() * 6) + 1;
    const startDate = new Date(2024, Math.floor(Math.random() * 6), Math.floor(Math.random() * 20) + 1);
    const endDate = new Date(startDate.getTime() + 6 * 86400000);
    payrolls.push({
      id: `py${i + 1}`, worker_id: worker.id, project_id: project.id,
      days_worked: days, daily_rate: worker.daily_rate, total: days * worker.daily_rate,
      week_start: startDate.toISOString().split('T')[0], week_end: endDate.toISOString().split('T')[0],
      is_paid: Math.random() > 0.3, paid_date: Math.random() > 0.3 ? endDate.toISOString().split('T')[0] : undefined,
      notes: '', created_at: startDate.toISOString(),
    });
  }
  return payrolls.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

const seedLoans = (): Loan[] => {
  const workers = seedWorkers();
  const loans: Loan[] = [];
  for (let i = 0; i < 8; i++) {
    const worker = workers[Math.floor(Math.random() * workers.length)];
    const amount = Math.floor(Math.random() * 5000) + 1000;
    const deductions: LoanDeduction[] = [];
    const numDeductions = Math.floor(Math.random() * 3);
    let remaining = amount;
    for (let j = 0; j < numDeductions; j++) {
      const dedAmount = Math.min(Math.floor(amount * 0.3) + 100, remaining);
      remaining -= dedAmount;
      deductions.push({
        id: `ld${i}-${j}`, loan_id: `ln${i + 1}`, amount: dedAmount,
        date: new Date(2024, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        notes: '', created_at: new Date().toISOString(),
      });
    }
    const date = new Date(2024, Math.floor(Math.random() * 5), Math.floor(Math.random() * 28) + 1);
    loans.push({
      id: `ln${i + 1}`, worker_id: worker.id, amount, remaining: Math.max(0, remaining),
      status: remaining <= 0 ? 'paid' : 'active', date: date.toISOString().split('T')[0],
      notes: `Prestamo para ${worker.full_name}`, deductions,
      created_at: date.toISOString(),
    });
  }
  return loans.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

const seedNotifications = (): Notification[] => [
  { id: 'n1', user_id: 'u1', title: 'Stock bajo', message: 'Semilla de Maiz Hibrido tiene solo 8 unidades restantes', type: 'low_stock', is_read: false, created_at: '2024-06-20T10:00:00Z' },
  { id: 'n2', user_id: 'u1', title: 'Pago aplicado', message: 'Se aplico un pago de $3,500 a la factura FAC-2024-0001', type: 'payment', is_read: false, created_at: '2024-06-20T09:30:00Z' },
  { id: 'n3', user_id: 'u1', title: 'Compra registrada', message: 'Se registro la compra de Fertilizante NPK por $12,000', type: 'purchase', is_read: true, created_at: '2024-06-19T16:00:00Z' },
  { id: 'n4', user_id: 'u1', title: 'Nueva entrada', message: 'Maria Garcia registro una nueva entrada en Cosecha de Maiz', type: 'entry', is_read: true, created_at: '2024-06-19T14:20:00Z' },
  { id: 'n5', user_id: 'u1', title: 'Movimiento de inventario', message: 'Se asignaron 5 Fertilizante NPK a Juan Rodriguez', type: 'movement', is_read: false, created_at: '2024-06-18T11:00:00Z' },
  { id: 'n6', user_id: 'u1', title: 'Factura vencida', message: 'La factura FAC-2024-0005 vencio el 15/06/2024', type: 'payment', is_read: false, created_at: '2024-06-17T00:00:00Z' },
  { id: 'n7', user_id: 'u1', title: 'Stock bajo', message: 'Tuberia PVC 4" tiene solo 3 unidades restantes', type: 'low_stock', is_read: false, created_at: '2024-06-16T09:00:00Z' },
  { id: 'n8', user_id: 'u1', title: 'Compra registrada', message: 'Se registro la compra de Herbicida Glyphosate por $8,400', type: 'purchase', is_read: true, created_at: '2024-06-15T15:30:00Z' },
];

const defaultSettings: AppSettings = {
  company_name: 'Campo El Progreso', company_address: 'Carretera Norte Km 45, Zona Rural',
  company_phone: '555-0000', currency_symbol: '$', date_format: 'dd/MM/yyyy',
  theme: 'light', session_timeout: 8,
};

// LocalStorage helpers
const STORAGE_KEYS = {
  users: 'cf_users', projects: 'cf_projects', entries: 'cf_entries', products: 'cf_products',
  purchases: 'cf_purchases', movements: 'cf_movements', invoices: 'cf_invoices', payments: 'cf_payments',
  notifications: 'cf_notifications', settings: 'cf_settings', session: 'cf_session',
  workers: 'cf_workers', operational_expenses: 'cf_op_expenses', payrolls: 'cf_payrolls', loans: 'cf_loans',
};

function getStorageItem<T>(key: string, fallback: T): T {
  try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : fallback; }
  catch { return fallback; }
}

function setStorageItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function initializeMockData(): void {
  if (!localStorage.getItem(STORAGE_KEYS.users)) setStorageItem(STORAGE_KEYS.users, seedUsers());
  if (!localStorage.getItem(STORAGE_KEYS.projects)) setStorageItem(STORAGE_KEYS.projects, seedProjects());
  if (!localStorage.getItem(STORAGE_KEYS.entries)) setStorageItem(STORAGE_KEYS.entries, seedEntries());
  if (!localStorage.getItem(STORAGE_KEYS.products)) setStorageItem(STORAGE_KEYS.products, seedProducts());
  if (!localStorage.getItem(STORAGE_KEYS.purchases)) setStorageItem(STORAGE_KEYS.purchases, seedPurchases());
  if (!localStorage.getItem(STORAGE_KEYS.movements)) setStorageItem(STORAGE_KEYS.movements, seedMovements());
  if (!localStorage.getItem(STORAGE_KEYS.invoices)) setStorageItem(STORAGE_KEYS.invoices, seedInvoices());
  if (!localStorage.getItem(STORAGE_KEYS.payments)) setStorageItem(STORAGE_KEYS.payments, seedPayments());
  if (!localStorage.getItem(STORAGE_KEYS.notifications)) setStorageItem(STORAGE_KEYS.notifications, seedNotifications());
  if (!localStorage.getItem(STORAGE_KEYS.settings)) setStorageItem(STORAGE_KEYS.settings, defaultSettings);
  if (!localStorage.getItem(STORAGE_KEYS.workers)) setStorageItem(STORAGE_KEYS.workers, seedWorkers());
  if (!localStorage.getItem(STORAGE_KEYS.operational_expenses)) setStorageItem(STORAGE_KEYS.operational_expenses, seedOperationalExpenses());
  if (!localStorage.getItem(STORAGE_KEYS.payrolls)) setStorageItem(STORAGE_KEYS.payrolls, seedPayrolls());
  if (!localStorage.getItem(STORAGE_KEYS.loans)) setStorageItem(STORAGE_KEYS.loans, seedLoans());
}

// Generic CRUD
function getAll<T>(key: string): T[] { return getStorageItem<T[]>(key, []); }
function getById<T extends { id: string }>(key: string, id: string): T | undefined { return getAll<T>(key).find(i => i.id === id); }
function create<T extends { id: string }>(key: string, item: T): T { const items = getAll<T>(key); items.unshift(item); setStorageItem(key, items); return item; }
function update<T extends { id: string }>(key: string, id: string, updates: Partial<T>): T | undefined {
  const items = getAll<T>(key); const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return undefined; items[idx] = { ...items[idx], ...updates }; setStorageItem(key, items); return items[idx];
}
function remove<T extends { id: string }>(key: string, id: string): boolean {
  const items = getAll<T>(key); const filtered = items.filter(i => i.id !== id);
  if (filtered.length === items.length) return false; setStorageItem(key, filtered); return true;
}

// Auth Service
export const MockAuthService = {
  login: (pin: string): User | null => {
    const users = getAll<User>(STORAGE_KEYS.users);
    const user = users.find(u => u.pin === pin && u.is_active);
    if (user) setStorageItem(STORAGE_KEYS.session, { user, loginAt: new Date().toISOString() });
    return user || null;
  },
  logout: () => { localStorage.removeItem(STORAGE_KEYS.session); },
  getSession: (): { user: User } | null => getStorageItem(STORAGE_KEYS.session, null),
};

// User Service
export const MockUserService = {
  getAll: () => getAll<User>(STORAGE_KEYS.users),
  getById: (id: string) => getById<User>(STORAGE_KEYS.users, id),
  create: (user: User) => create<User>(STORAGE_KEYS.users, user),
  update: (id: string, updates: Partial<User>) => update<User>(STORAGE_KEYS.users, id, updates),
  delete: (id: string) => remove<User>(STORAGE_KEYS.users, id),
};

// Worker Service
export const MockWorkerService = {
  getAll: () => getAll<Worker>(STORAGE_KEYS.workers),
  getById: (id: string) => getById<Worker>(STORAGE_KEYS.workers, id),
  getActive: () => getAll<Worker>(STORAGE_KEYS.workers).filter(w => w.is_active),
  create: (worker: Worker) => create<Worker>(STORAGE_KEYS.workers, worker),
  update: (id: string, updates: Partial<Worker>) => update<Worker>(STORAGE_KEYS.workers, id, updates),
  delete: (id: string) => remove<Worker>(STORAGE_KEYS.workers, id),
};

// Project Service
export const MockProjectService = {
  getAll: () => getAll<Project>(STORAGE_KEYS.projects),
  getById: (id: string) => getById<Project>(STORAGE_KEYS.projects, id),
  create: (project: Project) => create<Project>(STORAGE_KEYS.projects, project),
  update: (id: string, updates: Partial<Project>) => update<Project>(STORAGE_KEYS.projects, id, updates),
  delete: (id: string) => remove<Project>(STORAGE_KEYS.projects, id),
};

// Entry Service
export const MockEntryService = {
  getAll: () => getAll<Entry>(STORAGE_KEYS.entries),
  getByProject: (projectId: string) => getAll<Entry>(STORAGE_KEYS.entries).filter(e => e.project_id === projectId),
  create: (entry: Entry) => create<Entry>(STORAGE_KEYS.entries, entry),
  update: (id: string, updates: Partial<Entry>) => update<Entry>(STORAGE_KEYS.entries, id, updates),
  delete: (id: string) => remove<Entry>(STORAGE_KEYS.entries, id),
};

// Product Service
export const MockProductService = {
  getAll: () => getAll<Product>(STORAGE_KEYS.products),
  getById: (id: string) => getById<Product>(STORAGE_KEYS.products, id),
  create: (product: Product) => create<Product>(STORAGE_KEYS.products, product),
  update: (id: string, updates: Partial<Product>) => update<Product>(STORAGE_KEYS.products, id, updates),
  delete: (id: string) => remove<Product>(STORAGE_KEYS.products, id),
};

// Purchase Service
export const MockPurchaseService = {
  getAll: () => getAll<Purchase>(STORAGE_KEYS.purchases),
  create: (purchase: Purchase) => create<Purchase>(STORAGE_KEYS.purchases, purchase),
  update: (id: string, updates: Partial<Purchase>) => update<Purchase>(STORAGE_KEYS.purchases, id, updates),
  delete: (id: string) => remove<Purchase>(STORAGE_KEYS.purchases, id),
};

// Movement Service
export const MockMovementService = {
  getAll: () => getAll<InventoryMovement>(STORAGE_KEYS.movements),
  getByProduct: (productId: string) => getAll<InventoryMovement>(STORAGE_KEYS.movements).filter(m => m.product_id === productId),
  create: (movement: InventoryMovement) => create<InventoryMovement>(STORAGE_KEYS.movements, movement),
};

// Invoice Service
export const MockInvoiceService = {
  getAll: () => getAll<Invoice>(STORAGE_KEYS.invoices),
  getById: (id: string) => getById<Invoice>(STORAGE_KEYS.invoices, id),
  create: (invoice: Invoice) => create<Invoice>(STORAGE_KEYS.invoices, invoice),
  update: (id: string, updates: Partial<Invoice>) => update<Invoice>(STORAGE_KEYS.invoices, id, updates),
  delete: (id: string) => remove<Invoice>(STORAGE_KEYS.invoices, id),
};

// Payment Service
export const MockPaymentService = {
  getAll: () => getAll<Payment>(STORAGE_KEYS.payments),
  getByInvoice: (invoiceId: string) => getAll<Payment>(STORAGE_KEYS.payments).filter(p => p.invoice_id === invoiceId),
  create: (payment: Payment) => create<Payment>(STORAGE_KEYS.payments, payment),
};

// Operational Expense Service
export const MockOperationalExpenseService = {
  getAll: () => getAll<OperationalExpense>(STORAGE_KEYS.operational_expenses),
  create: (expense: OperationalExpense) => create<OperationalExpense>(STORAGE_KEYS.operational_expenses, expense),
  update: (id: string, updates: Partial<OperationalExpense>) => update<OperationalExpense>(STORAGE_KEYS.operational_expenses, id, updates),
  delete: (id: string) => remove<OperationalExpense>(STORAGE_KEYS.operational_expenses, id),
};

// Payroll Service
export const MockPayrollService = {
  getAll: () => getAll<Payroll>(STORAGE_KEYS.payrolls),
  getByWorker: (workerId: string) => getAll<Payroll>(STORAGE_KEYS.payrolls).filter(p => p.worker_id === workerId),
  getByProject: (projectId: string) => getAll<Payroll>(STORAGE_KEYS.payrolls).filter(p => p.project_id === projectId),
  create: (payroll: Payroll) => create<Payroll>(STORAGE_KEYS.payrolls, payroll),
  update: (id: string, updates: Partial<Payroll>) => update<Payroll>(STORAGE_KEYS.payrolls, id, updates),
};

// Loan Service
export const MockLoanService = {
  getAll: () => getAll<Loan>(STORAGE_KEYS.loans),
  getByWorker: (workerId: string) => getAll<Loan>(STORAGE_KEYS.loans).filter(l => l.worker_id === workerId),
  create: (loan: Loan) => create<Loan>(STORAGE_KEYS.loans, loan),
  update: (id: string, updates: Partial<Loan>) => update<Loan>(STORAGE_KEYS.loans, id, updates),
};

// Notification Service
export const MockNotificationService = {
  getAll: () => getAll<Notification>(STORAGE_KEYS.notifications),
  getUnread: () => getAll<Notification>(STORAGE_KEYS.notifications).filter(n => !n.is_read),
  create: (notification: Notification) => create<Notification>(STORAGE_KEYS.notifications, notification),
  markAsRead: (id: string) => update<Notification>(STORAGE_KEYS.notifications, id, { is_read: true }),
  markAllAsRead: () => { setStorageItem(STORAGE_KEYS.notifications, getAll<Notification>(STORAGE_KEYS.notifications).map(n => ({ ...n, is_read: true }))); },
};

// Settings Service
export const MockSettingsService = {
  get: (): AppSettings => getStorageItem<AppSettings>(STORAGE_KEYS.settings, defaultSettings),
  update: (updates: Partial<AppSettings>) => { const current = getStorageItem<AppSettings>(STORAGE_KEYS.settings, defaultSettings); const updated = { ...current, ...updates }; setStorageItem(STORAGE_KEYS.settings, updated); return updated; },
};

// Dashboard stats
export function getDashboardStats(): DashboardStats {
  const entries = getAll<Entry>(STORAGE_KEYS.entries);
  const invoices = getAll<Invoice>(STORAGE_KEYS.invoices);
  const products = getAll<Product>(STORAGE_KEYS.products);
  const projects = getAll<Project>(STORAGE_KEYS.projects);
  const today = new Date().toISOString().split('T')[0];
  const todayEntries = entries.filter(e => e.date === today);
  const totalIncome = entries.reduce((sum, e) => sum + e.amount, 0);
  const pendingInvoices = invoices.filter(inv => inv.status !== 'paid');
  const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + (inv.amount - inv.paid_amount), 0);
  const warehouseValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  return {
    total_balance: totalIncome - pendingAmount, pending_payments: pendingAmount,
    today_entries: todayEntries.reduce((sum, e) => sum + e.amount, 0), warehouse_value: warehouseValue,
    monthly_income: totalIncome * 0.3, monthly_expense: pendingAmount * 0.6,
    active_projects: projects.filter(p => p.status === 'active').length,
    low_stock_products: products.filter(p => p.quantity <= p.min_stock).length,
  };
}

export function getMonthlyData(): MonthlyData[] {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
  return months.map(m => ({ month: m, income: Math.floor(Math.random() * 50000) + 20000, expense: Math.floor(Math.random() * 35000) + 10000 }));
}

export function getProjectDistribution(): ProjectDistribution[] {
  const projects = getAll<Project>(STORAGE_KEYS.projects);
  const colors = ['#1B4332', '#2D6A4F', '#A8C5A8', '#D4A574', '#8B6914', '#C9A84C'];
  return projects.slice(0, 6).map((p, i) => ({ name: p.name, value: p.spent, color: colors[i % colors.length] }));
}
