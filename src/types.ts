/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'SALESMAN';

export interface Store {
  id: string;
  name: string;
  address: string;
  binCode: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  storeId?: string;
  activeStore?: Store;
}

export interface StationeryItem {
  id: string;
  name: string;
  category: string;
  brand: string;
  costPrice: number;
  sellingPrice: number;
  qty: number;
  lowStockThreshold: number;
  sku: string; // Barcode or SKU
}

export interface CartItem {
  item: StationeryItem;
  quantity: number;
}

export interface Sale {
  id: string;
  salesmanId: string;
  salesmanName: string;
  invoiceNo: string;
  items: Array<{
    itemId: string;
    name: string;
    category: string;
    qty: number;
    costPrice: number;
    sellingPrice: number;
  }>;
  subtotal: number;
  vat: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  profit: number; // calculated as grandTotal - sum(qty * costPrice)
  paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Rocket' | 'Due';
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  createdAt: string; // ISO date string
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  totalPurchases: number;
  dues: number;
  createdAt: string;
}

export interface Supplier {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  paymentHistory: Array<{
    id: string;
    amount: number;
    date: string;
    description: string;
  }>;
  createdAt: string;
}

export interface DueCollection {
  id: string;
  invoiceId?: string; // If associated with prior sale
  customerId: string;
  customerName: string;
  amountPaid: number;
  paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Rocket';
  date: string;
}

export interface Expense {
  id: string;
  category: string; // 'Rent' | 'Electricity' | 'Salary' | 'Transport' | 'Other'
  amount: number;
  date: string;
  description: string;
}

export interface StockAdjustLog {
  id: string;
  type: 'Return' | 'Damage';
  itemId: string;
  itemName: string;
  qty: number;
  reason: string;
  lossValue: number; // for damage: qty * costPrice, for return: typically 0 or custom adjustment
  date: string;
}

export interface DashboardStats {
  salesToday: number;
  salesThisMonth: number;
  profitToday: number;
  profitThisMonth: number;
  expensesToday: number;
  expensesThisMonth: number;
  outstandingDues: number;
  topSellingItems: Array<{
    itemId: string;
    name: string;
    qtySold: number;
    revenue: number;
  }>;
  lowStockAlerts: StationeryItem[];
  monthlyCharts: Array<{
    month: string;
    sales: number;
    expenses: number;
    profit: number;
  }>;
}
