export enum InvoiceStatus {
  DRAFT = 'Draft',
  PENDING = 'Pending',
  PAID = 'Paid',
  OVERDUE = 'Overdue'
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  address?: string;
  logo?: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  status: InvoiceStatus;
  date: string;
  dueDate: string;
  items: LineItem[];
  notes?: string;
  taxRate: number;
}

export interface DashboardStats {
  totalRevenue: number;
  pendingAmount: number;
  overdueAmount: number;
  paidInvoicesCount: number;
}
