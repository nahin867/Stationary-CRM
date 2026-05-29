/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  User,
  StationeryItem,
  Sale,
  Customer,
  Supplier,
  Expense,
  StockAdjustLog,
  DashboardStats
} from './types';

const BASE_URL = '';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('token') || '';
  const activeStoreId = localStorage.getItem('activeStoreId') || '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-Store-Id': activeStoreId
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status} Errors`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Authentication
  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return handleResponse<{ token: string; user: User }>(res);
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: getHeaders()
    });
    return handleResponse<{ user: User }>(res);
  },

  // Inventory
  async getInventory(): Promise<StationeryItem[]> {
    const res = await fetch(`${BASE_URL}/api/inventory`, {
      headers: getHeaders()
    });
    return handleResponse<StationeryItem[]>(res);
  },

  async addInventoryItem(item: Omit<StationeryItem, 'id'>): Promise<StationeryItem> {
    const res = await fetch(`${BASE_URL}/api/inventory`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(item)
    });
    return handleResponse<StationeryItem>(res);
  },

  async updateInventoryItem(id: string, item: Partial<StationeryItem>): Promise<StationeryItem> {
    const res = await fetch(`${BASE_URL}/api/inventory/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(item)
    });
    return handleResponse<StationeryItem>(res);
  },

  async quickAddStock(id: string, addedQty: number): Promise<StationeryItem> {
    const res = await fetch(`${BASE_URL}/api/inventory/${id}/quick-stock`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ addedQty })
    });
    return handleResponse<StationeryItem>(res);
  },

  async deleteInventoryItem(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/api/inventory/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Customers
  async getCustomers(): Promise<Customer[]> {
    const res = await fetch(`${BASE_URL}/api/customers`, {
      headers: getHeaders()
    });
    return handleResponse<Customer[]>(res);
  },

  async createCustomer(name: string, phone: string): Promise<Customer> {
    const res = await fetch(`${BASE_URL}/api/customers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, phone })
    });
    return handleResponse<Customer>(res);
  },

  async payDue(customerId: string, amount: number, method: string): Promise<{ customer: Customer }> {
    const res = await fetch(`${BASE_URL}/api/customers/${customerId}/pay-due`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ paymentAmount: amount, paymentMethod: method })
    });
    return handleResponse<{ customer: Customer }>(res);
  },

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    const res = await fetch(`${BASE_URL}/api/suppliers`, {
      headers: getHeaders()
    });
    return handleResponse<Supplier[]>(res);
  },

  async createSupplier(supplier: Omit<Supplier, 'id' | 'paymentHistory' | 'createdAt'>): Promise<Supplier> {
    const res = await fetch(`${BASE_URL}/api/suppliers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(supplier)
    });
    return handleResponse<Supplier>(res);
  },

  async paySupplier(supplierId: string, amount: number, description: string): Promise<Supplier> {
    const res = await fetch(`${BASE_URL}/api/suppliers/${supplierId}/pay`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount, description })
    });
    return handleResponse<Supplier>(res);
  },

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    const res = await fetch(`${BASE_URL}/api/expenses`, {
      headers: getHeaders()
    });
    return handleResponse<Expense[]>(res);
  },

  async addExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
    const res = await fetch(`${BASE_URL}/api/expenses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(expense)
    });
    return handleResponse<Expense>(res);
  },

  // Returns & Damages
  async getAdjustments(): Promise<StockAdjustLog[]> {
    const res = await fetch(`${BASE_URL}/api/returns-damages`, {
      headers: getHeaders()
    });
    return handleResponse<StockAdjustLog[]>(res);
  },

  async logAdjustment(type: 'Return' | 'Damage', itemId: string, qty: number, reason: string): Promise<StockAdjustLog> {
    const res = await fetch(`${BASE_URL}/api/returns-damages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ type, itemId, qty, reason })
    });
    return handleResponse<StockAdjustLog>(res);
  },

  // POS
  async checkout(payload: {
    items: Array<{ itemId: string; quantity: number }>;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Rocket' | 'Due';
    paidAmount: number;
    customerId?: string;
  }): Promise<Sale> {
    const res = await fetch(`${BASE_URL}/api/sales`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse<Sale>(res);
  },

  // Dashboard Diagnostics
  async getStats(): Promise<DashboardStats> {
    const res = await fetch(`${BASE_URL}/api/dashboard/stats`, {
      headers: getHeaders()
    });
    return handleResponse<DashboardStats>(res);
  },

  // Reset Db
  async resetDb(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/api/db/reset`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Super Admin Methods
  async getSuperStores(): Promise<any[]> {
    const res = await fetch(`${BASE_URL}/api/super/stores`, {
      headers: getHeaders()
    });
    return handleResponse<any[]>(res);
  },

  async createSuperStore(name: string, address: string, binCode: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/api/super/stores`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, address, binCode })
    });
    return handleResponse<any>(res);
  },

  async deleteSuperStore(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/api/super/stores/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse<{ success: boolean }>(res);
  },

  async getSuperUsers(): Promise<any[]> {
    const res = await fetch(`${BASE_URL}/api/super/users`, {
      headers: getHeaders()
    });
    return handleResponse<any[]>(res);
  },

  async createSuperUser(payload: any): Promise<any> {
    const res = await fetch(`${BASE_URL}/api/super/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse<any>(res);
  },

  async deleteSuperUser(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/api/super/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse<{ success: boolean }>(res);
  }
};
