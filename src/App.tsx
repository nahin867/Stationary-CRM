/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from './api';
import { translations, Language } from './translations';
import {
  StationeryItem,
  Customer,
  Supplier,
  Expense,
  StockAdjustLog,
  DashboardStats,
  User,
  Sale
} from './types';

// Importing Modular Components
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import InventoryView from './components/InventoryView';
import POSView from './components/POSView';
import LedgerView from './components/LedgerView';
import ExpensesView from './components/ExpensesView';
import AdjustmentsView from './components/AdjustmentsView';
import SuperAdminView from './components/SuperAdminView';

export default function App() {
  // Session Access States
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [viewingSuperPortal, setViewingSuperPortal] = useState(false);

  // Automatically switch portal on based on role
  useEffect(() => {
    if (user && user.role === 'SUPERADMIN') {
      setViewingSuperPortal(true);
    } else {
      setViewingSuperPortal(false);
    }
  }, [user]);

  // App Layout States
  const [currentView, setCurrentView] = useState<
    'dashboard' | 'pos' | 'inventory' | 'customers' | 'suppliers' | 'dueLedger' | 'expenses' | 'returnsDamages'
  >('dashboard');
  const [lang, setLang] = useState<Language>('bn'); // default to Bengali as requested for ease of shopowner

  // Synchronized Databases State
  const [items, setItems] = useState<StationeryItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [adjustments, setAdjustments] = useState<StockAdjustLog[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const [loadingDb, setLoadingDb] = useState(false);

  // Check login state on load
  useEffect(() => {
    async function checkAuthSession() {
      if (!token) {
        setAuthChecking(false);
        return;
      }
      try {
        const response = await api.getMe();
        setUser(response.user);
      } catch (err) {
        // stale session
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setAuthChecking(false);
      }
    }
    checkAuthSession();
  }, [token]);

  // Synchronize entire data vault from Server
  const fetchSyncData = async () => {
    if (!token) return;
    setLoadingDb(true);
    try {
      const [
        inventoryItems,
        custListing,
        suppListing,
        expRecords,
        adjustLogs,
        metricStats
      ] = await Promise.all([
        api.getInventory(),
        api.getCustomers(),
        api.getSuppliers(),
        api.getExpenses(),
        api.getAdjustments(),
        api.getStats()
      ]);

      setItems(inventoryItems);
      setCustomers(custListing);
      setSuppliers(suppListing);
      setExpenses(expRecords);
      setAdjustments(adjustLogs);
      setStats(metricStats);
    } catch (err) {
      console.error('Error synchronizing CRM databases:', err);
    } finally {
      setLoadingDb(false);
    }
  };

  // Sync databases whenever active user changes or active token is authorized
  useEffect(() => {
    if (user) {
      fetchSyncData();
    }
  }, [user]);

  // Handle successful login callback
  const handleLoginSuccess = (newToken: string, authenticatedUser: User) => {
    setToken(newToken);
    setUser(authenticatedUser);
    setCurrentView('dashboard');
  };

  // Handle Logout Action
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setItems([]);
    setCustomers([]);
    setSuppliers([]);
    setExpenses([]);
    setAdjustments([]);
    setStats(null);
  };

  // Trigger Master Server Database Restore
  const handleResetDb = async () => {
    try {
      await api.resetDb();
      await fetchSyncData();
    } catch (err) {
      alert('Error resetting database');
    }
  };

  // 1. INVENTORY WRITES
  const handleAddItem = async (itemPayload: Omit<StationeryItem, 'id'>) => {
    await api.addInventoryItem(itemPayload);
    await fetchSyncData(); // Rehydrate lists
  };

  const handleUpdateItem = async (itemId: string, itemPayload: Partial<StationeryItem>) => {
    await api.updateInventoryItem(itemId, itemPayload);
    await fetchSyncData(); // Rehydrate lists
  };

  const handleQuickAddStock = async (itemId: string, addedQty: number) => {
    await api.quickAddStock(itemId, addedQty);
    await fetchSyncData(); // Rehydrate list
  };

  const handleDeleteItem = async (itemId: string) => {
    await api.deleteInventoryItem(itemId);
    await fetchSyncData(); // Rehydrate lists
  };

  // 2. POS TRANSACTIONS
  const handleCheckout = async (payload: {
    items: Array<{ itemId: string; quantity: number }>;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    paymentMethod: any;
    paidAmount: number;
    customerId?: string;
  }) => {
    const saleResult = await api.checkout(payload);
    await fetchSyncData(); // Instant synchronized updates on dashboard counter
    return saleResult;
  };

  // 3. LEDGERS WRITES
  const handleCreateCustomer = async (name: string, phone: string) => {
    const cust = await api.createCustomer(name, phone);
    await fetchSyncData();
    return cust;
  };

  const handlePayDue = async (customerId: string, amount: number, method: string) => {
    await api.payDue(customerId, amount, method);
    await fetchSyncData(); // Update overdue tickers
  };

  const handleAddSupplier = async (suppPayload: Omit<Supplier, 'id' | 'paymentHistory' | 'createdAt'>) => {
    await api.createSupplier(suppPayload);
    await fetchSyncData();
  };

  const handlePaySupplier = async (supplierId: string, amount: number, description: string) => {
    await api.paySupplier(supplierId, amount, description);
    await fetchSyncData();
  };

  // 4. EXPENSE LOGGER
  const handleAddExpense = async (expPayload: Omit<Expense, 'id'>) => {
    await api.addExpense(expPayload);
    await fetchSyncData();
  };

  // 5. RETURNS & LOSS MANAGEMENT
  const handleLogAdjustment = async (type: 'Return' | 'Damage', itemId: string, qty: number, reason: string) => {
    await api.logAdjustment(type, itemId, qty, reason);
    await fetchSyncData();
  };

  // View routing navigator helper
  const handleNavigateToView = (targetView: string) => {
    setCurrentView(targetView as any);
  };

  // Authentication barrier Check
  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center select-none font-sans">
        <div className="text-sm font-semibold text-slate-500 animate-pulse tracking-wider">
          Initializing Stationery OS...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginScreen
        lang={lang}
        setLang={setLang}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  if (user.role === 'SUPERADMIN' && viewingSuperPortal) {
    return (
      <SuperAdminView
        lang={lang}
        setLang={setLang}
        user={user}
        onLogout={handleLogout}
        onShopChange={() => {
          fetchSyncData();
          setViewingSuperPortal(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 font-sans text-slate-800">
      
      {/* Drawer Sidebar menu */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        lang={lang}
        setLang={setLang}
        user={user}
        onLogout={handleLogout}
        onResetDb={handleResetDb}
      />

      {/* Main Panel Content Wrapper */}
      <main className="flex-1 min-w-0 flex flex-col p-4 sm:p-6 lg:p-8 overflow-x-hidden relative">
        
        {/* Super Admin Control return tab */}
        {user.role === 'SUPERADMIN' && !viewingSuperPortal && (
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-200 shadow-lg no-print mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold">
                {lang === 'en' 
                  ? 'Super Admin Mode — Simulating Brand Store ID: ' 
                  : 'সুপার এডমিন মুড — চলতি নির্বাচিত দোকান আইডি: '}
                <strong className="text-amber-500 underline font-mono text-xs ml-1 font-bold">
                  {localStorage.getItem('activeStoreId') || 'store_1'}
                </strong>
              </span>
            </div>
            <button
              onClick={() => setViewingSuperPortal(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-450 text-slate-950 font-black text-[10px] rounded-lg uppercase tracking-wider transition cursor-pointer"
            >
              {lang === 'en' ? 'Return to Control Portal' : 'কন্ট্রোল পোর্টালে ফেরত যান'}
            </button>
          </div>
        )}

        {/* Loading overlay indicator inside workspace */}
        {loadingDb && (
          <div className="absolute top-4 right-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 font-semibold text-[10px] text-emerald-700 animate-pulse select-none flex items-center gap-1.5 z-10 no-print">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
            <span>Syncing Server...</span>
          </div>
        )}

        <div className="max-w-7xl w-full mx-auto space-y-6">
          {/* Main Dashboard Router Views */}
          {currentView === 'dashboard' && (
            <DashboardView
              stats={stats}
              lang={lang}
              user={user}
              onNavigateToView={handleNavigateToView}
            />
          )}

          {currentView === 'inventory' && (
            <InventoryView
              items={items}
              lang={lang}
              user={user}
              onAddItem={handleAddItem}
              onUpdateItem={handleUpdateItem}
              onQuickAddStock={handleQuickAddStock}
              onDeleteItem={handleDeleteItem}
            />
          )}

          {currentView === 'pos' && (
            <POSView
              items={items}
              customers={customers}
              user={user}
              lang={lang}
              onCheckout={handleCheckout}
              onCreateCustomer={handleCreateCustomer}
            />
          )}

          {currentView === 'customers' && (
            <LedgerView
              customers={customers}
              suppliers={suppliers}
              lang={lang}
              user={user}
              onPayDue={handlePayDue}
              onAddSupplier={handleAddSupplier}
              onPaySupplier={handlePaySupplier}
            />
          )}

          {currentView === 'suppliers' && (
            <LedgerView
              customers={customers}
              suppliers={suppliers}
              lang={lang}
              user={user}
              onPayDue={handlePayDue}
              onAddSupplier={handleAddSupplier}
              onPaySupplier={handlePaySupplier}
            />
          )}

          {currentView === 'dueLedger' && (
            <LedgerView
              customers={customers}
              suppliers={suppliers}
              lang={lang}
              user={user}
              onPayDue={handlePayDue}
              onAddSupplier={handleAddSupplier}
              onPaySupplier={handlePaySupplier}
            />
          )}

          {currentView === 'expenses' && (
            <ExpensesView
              expenses={expenses}
              lang={lang}
              user={user}
              onAddExpense={handleAddExpense}
            />
          )}

          {currentView === 'returnsDamages' && (
            <AdjustmentsView
              adjustments={adjustments}
              items={items}
              lang={lang}
              user={user}
              onLogAdjustment={handleLogAdjustment}
            />
          )}
        </div>
      </main>
    </div>
  );
}
