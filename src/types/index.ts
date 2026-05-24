export interface User {
  id: string;
  pin: string;
  full_name: string;
  email?: string;
  phone?: string;
  role: 'admin' | 'operator';
  permissions: Permissions;
  is_active: boolean;
  avatar_url?: string;
  created_at: string;
}

export interface Permissions {
  dashboard: boolean;
  projects: boolean;
  warehouse: boolean;
  purchases: boolean;
  invoices: boolean;
  users: boolean;
  settings: boolean;
  workers: boolean;
  operational_expenses: boolean;
  payroll: boolean;
  loans: boolean;
  expense_report: boolean;
  full_access: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  budget: number;
  spent: number;
  status: 'active' | 'paused' | 'completed';
  created_by: string;
  created_by_name?: string;
  manager_id?: string;
  pipeline_stage: 'planning' | 'in_progress' | 'review' | 'completed';
  worker_ids: string[];
  created_at: string;
}

export interface Entry {
  id: string;
  project_id: string;
  project_name?: string;
  quantity: number;
  amount: number;
  date: string;
  time: string;
  user_id: string;
  user_name?: string;
  notes?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  category?: string;
  price: number;
  quantity: number;
  min_stock: number;
  image_url?: string;
  created_at: string;
}

export interface Purchase {
  id: string;
  product_id: string;
  product_name?: string;
  supplier: string;
  quantity: number;
  unit_price: number;
  total: number;
  image_url?: string;
  date: string;
  created_by: string;
  created_by_name?: string;
  created_at: string;
}

export interface InventoryMovement {
  id: string;
  product_id: string;
  product_name?: string;
  type: 'in' | 'out' | 'assignment';
  quantity: number;
  user_id: string;
  user_name?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  notes?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  project_id: string;
  project_name?: string;
  invoice_number: string;
  supplier: string;
  amount: number;
  payment_type: 'cash' | 'credit';
  credit_days?: number;
  status: 'pending' | 'partial' | 'paid';
  due_date?: string;
  paid_amount: number;
  image_url?: string;
  notes?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_date: string;
  payment_method: 'cash' | 'transfer' | 'check';
  notes?: string;
  created_at: string;
}

export interface Worker {
  id: string;
  full_name: string;
  phone?: string;
  daily_rate: number;
  pay_frequency: 'daily' | 'weekly';
  is_active: boolean;
  avatar_url?: string;
  created_at: string;
}

export interface OperationalExpense {
  id: string;
  category: 'fuel' | 'maintenance' | 'utilities' | 'transport' | 'food' | 'other';
  description: string;
  amount: number;
  date: string;
  project_id?: string;
  project_name?: string;
  receipt_url?: string;
  created_by: string;
  created_at: string;
}

export interface Payroll {
  id: string;
  worker_id: string;
  worker_name?: string;
  project_id?: string;
  project_name?: string;
  days_worked: number;
  daily_rate: number;
  total: number;
  week_start: string;
  week_end: string;
  is_paid: boolean;
  paid_date?: string;
  notes?: string;
  created_at: string;
}

export interface Loan {
  id: string;
  worker_id: string;
  worker_name?: string;
  amount: number;
  remaining: number;
  status: 'active' | 'paid';
  date: string;
  notes?: string;
  deductions: LoanDeduction[];
  created_at: string;
}

export interface LoanDeduction {
  id: string;
  loan_id: string;
  amount: number;
  date: string;
  notes?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'inventory' | 'purchase' | 'payment' | 'low_stock' | 'entry' | 'movement';
  is_read: boolean;
  created_at: string;
}

export interface AppSettings {
  company_name: string;
  company_address?: string;
  company_phone?: string;
  currency_symbol: string;
  date_format: string;
  theme: 'light' | 'dark';
  session_timeout: number;
}

export interface DashboardStats {
  total_balance: number;
  pending_payments: number;
  today_entries: number;
  warehouse_value: number;
  monthly_income: number;
  monthly_expense: number;
  active_projects: number;
  low_stock_products: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

export interface ProjectDistribution {
  name: string;
  value: number;
  color: string;
}
