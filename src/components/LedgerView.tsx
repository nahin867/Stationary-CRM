/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  Building2,
  Phone,
  DollarSign,
  Plus,
  AlertTriangle,
  FileSpreadsheet,
  ChevronRight,
  ClipboardCheck,
  Building,
  UserCheck
} from 'lucide-react';
import { translations, Language } from '../translations';
import { Customer, Supplier, User } from '../types';

interface LedgerViewProps {
  customers: Customer[];
  suppliers: Supplier[];
  lang: Language;
  user: User | null;
  onPayDue: (customerId: string, amount: number, method: string) => Promise<void>;
  onAddSupplier: (supplier: Omit<Supplier, 'id' | 'paymentHistory' | 'createdAt'>) => Promise<void>;
  onPaySupplier: (supplierId: string, amount: number, description: string) => Promise<void>;
}

export default function LedgerView({
  customers,
  suppliers,
  lang,
  user,
  onPayDue,
  onAddSupplier,
  onPaySupplier
}: LedgerViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'customers' | 'suppliers'>('customers');
  const t = translations[lang];
  const isAdmin = user?.role === 'ADMIN';

  // State for Dues Payments modal
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [duePayAmt, setDuePayAmt] = useState('');
  const [duePayMethod, setDuePayMethod] = useState<'Cash' | 'bKash' | 'Nagad' | 'Rocket'>('Cash');
  const [duePayError, setDuePayError] = useState('');

  // State for Add Supplier Modal
  const [isSuppModalOpen, setIsSuppModalOpen] = useState(false);
  const [compName, setCompName] = useState('');
  const [contName, setContName] = useState('');
  const [suppPhone, setSuppPhone] = useState('');
  const [suppEmail, setSuppEmail] = useState('');
  const [suppError, setSuppError] = useState('');

  // State for Supplier Pay modal
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [suppPayAmt, setSuppPayAmt] = useState('');
  const [suppPayDesc, setSuppPayDesc] = useState('');
  const [suppPayError, setSuppPayError] = useState('');

  // Search local states
  const [custQuery, setCustQuery] = useState('');
  const [suppQuery, setSuppQuery] = useState('');

  // Filters listings
  const filteredCustomers = customers.filter(
    c => c.name.toLowerCase().includes(custQuery.toLowerCase()) || c.phone.includes(custQuery)
  );

  const filteredSuppliers = suppliers.filter(
    s => s.companyName.toLowerCase().includes(suppQuery.toLowerCase()) || s.phone.includes(suppQuery)
  );

  const handleDuePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const amt = Number(duePayAmt);
    if (isNaN(amt) || amt <= 0) {
      setDuePayError(lang === 'en' ? 'Provide a valid positive payment amount' : 'সঠিক পেমেন্ট পরিমাণ লিখুন');
      return;
    }

    if (amt > selectedCustomer.dues) {
      setDuePayError(lang === 'en' ? `Amount exceeds outstanding credit (Max ৳${selectedCustomer.dues})` : `পেমেন্ট বকেয়া চেয়ে বেশি হতে পারবে না (সর্বোচ্চ ৳${selectedCustomer.dues})`);
      return;
    }

    try {
      await onPayDue(selectedCustomer.id, amt, duePayMethod);
      setSelectedCustomer(null);
      setDuePayAmt('');
      setDuePayError('');
    } catch (err: any) {
      setDuePayError(err?.message || 'Transaction failed');
    }
  };

  const handleCreateSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName || !suppPhone) {
      setSuppError('Company name and phone required');
      return;
    }
    try {
      await onAddSupplier({
        companyName: compName,
        contactName: contName || 'N/A',
        phone: suppPhone,
        email: suppEmail
      });
      setIsSuppModalOpen(false);
      setCompName('');
      setContName('');
      setSuppPhone('');
      setSuppEmail('');
      setSuppError('');
    } catch (err: any) {
      setSuppError(err?.message || 'Error occurred');
    }
  };

  const handleSupplierPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;

    const amt = Number(suppPayAmt);
    if (isNaN(amt) || amt <= 0) {
      setSuppPayError('Provide positive transaction amount');
      return;
    }

    try {
      await onPaySupplier(selectedSupplier.id, amt, suppPayDesc);
      setSelectedSupplier(null);
      setSuppPayAmt('');
      setSuppPayDesc('');
      setSuppPayError('');
    } catch (err: any) {
      setSuppPayError(err?.message || 'Transaction failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Selectors Bar */}
      <div className="border-b border-slate-800 flex select-none no-print">
        <button
          onClick={() => setActiveSubTab('customers')}
          id="btn-subtab-customers"
          className={`px-5 py-3 text-sm font-bold border-b-2 transition duration-200 cursor-pointer flex items-center gap-2
            ${activeSubTab === 'customers'
              ? 'border-teal-400 text-teal-400 font-extrabold'
              : 'border-transparent text-slate-450 hover:text-teal-400 hover:border-slate-700'
            }
          `}
        >
          <Users className="w-4 h-4" />
          <span>{lang === 'en' ? 'Customer Accounts (ক্রেতা খাতা)' : 'ক্রেতাদের খাতা (Customers)'}</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveSubTab('suppliers')}
            id="btn-subtab-suppliers"
            className={`px-5 py-3 text-sm font-bold border-b-2 transition duration-200 cursor-pointer flex items-center gap-2
              ${activeSubTab === 'suppliers'
                ? 'border-teal-400 text-teal-400 font-extrabold'
                : 'border-transparent text-slate-450 hover:text-teal-400 hover:border-slate-700'
              }
            `}
          >
            <Building2 className="w-4 h-4" />
            <span>{lang === 'en' ? 'Supplier Ledgers (সাপ্লায়ার খাতা)' : 'পাইকারি সাপ্লায়ার (Suppliers)'}</span>
          </button>
        )}
      </div>

      {/* CUSTOMER DIRECTORY VIEW */}
      {activeSubTab === 'customers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold font-display text-teal-400 tracking-tight">{t.customerList}</h2>
              <p className="text-xs text-slate-400 font-medium">{t.dueTransactions}</p>
            </div>
            
            {/* Inline Fast Search */}
            <div className="relative w-full sm:w-64 no-print">
              <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder={lang === 'en' ? 'Search by phone / name...' : 'নাম বা মোবাইল দিয়ে খুঁজুন...'}
                value={custQuery}
                onChange={(e) => setCustQuery(e.target.value)}
                id="input-ledger-customer-search"
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-900 border border-slate-800 text-white placeholder-slate-650 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800/80 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/45 text-slate-400 uppercase text-[10px] font-bold tracking-wider select-none border-b border-slate-850">
                  <tr>
                    <th scope="col" className="px-6 py-4">Customer Name</th>
                    <th scope="col" className="px-4 py-4">{t.phone}</th>
                    <th scope="col" className="px-4 py-4 text-right">{t.totalPurchases}</th>
                    <th scope="col" className="px-4 py-4 text-right">{t.customerDues}</th>
                    <th scope="col" className="px-6 py-4 text-right no-print">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-500 font-medium font-sans">
                        No customer accounts mapped.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map(cust => (
                      <tr key={cust.id} className="hover:bg-slate-850/20 transition">
                        <td className="px-6 py-4 font-bold text-white">{cust.name}</td>
                        <td className="px-4 py-3 font-mono text-slate-400">
                          {cust.phone}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-355 font-mono">
                          ৳{cust.totalPurchases.toLocaleString()}
                        </td>
                        <td className={`px-4 py-3 text-right font-extrabold font-mono
                          ${cust.dues > 0 ? 'text-rose-400 font-bold' : 'text-slate-500 font-medium'}`}
                        >
                          ৳{cust.dues.toLocaleString()}
                        </td>
                        <td className="px-6 py-3 text-right no-print">
                          {cust.dues > 0 ? (
                            <button
                              onClick={() => setSelectedCustomer(cust)}
                              id={`btn-collect-due-opener-${cust.id}`}
                              className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold rounded-lg text-[11px] transition cursor-pointer"
                            >
                              {lang === 'en' ? 'Collect Dues' : 'বকেয়া আদায়'}
                            </button>
                          ) : (
                            <span className="text-[10px] text-teal-400 bg-teal-500/10 border border-teal-500/15 px-2.5 py-1 rounded-full font-bold select-none">
                              ✓ Paid Up
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUPPLIER LEDGER DIRECTORY VIEW - Admin Restricted only */}
      {activeSubTab === 'suppliers' && isAdmin && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold font-display text-teal-400 tracking-tight">{t.supplierList}</h2>
              <p className="text-xs text-slate-400 font-medium">B2B wholesale purchase accounts logs</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto no-print">
              <div className="relative flex-1 sm:flex-initial">
                <input
                  type="text"
                  placeholder="Search suppliers..."
                  value={suppQuery}
                  onChange={(e) => setSuppQuery(e.target.value)}
                  id="input-ledger-supplier-search"
                  className="px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <button
                onClick={() => setIsSuppModalOpen(true)}
                id="btn-ledger-add-supplier-opener"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addSupplier}</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800/80 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/45 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-850">
                  <tr>
                    <th scope="col" className="px-6 py-4">{t.companyName}</th>
                    <th scope="col" className="px-4 py-4">{t.contactName}</th>
                    <th scope="col" className="px-4 py-4">{t.phone}</th>
                    <th scope="col" className="px-4 py-4">Logs Count</th>
                    <th scope="col" className="px-6 py-4 text-right">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredSuppliers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-500 font-semibold font-sans">
                        No trade supplier registered.
                      </td>
                    </tr>
                  ) : (
                    filteredSuppliers.map(supp => (
                      <tr key={supp.id} className="hover:bg-slate-850/20 transition">
                        <td className="px-6 py-4 font-bold text-white">{supp.companyName}</td>
                        <td className="px-4 py-4 text-slate-305 font-medium">{supp.contactName}</td>
                        <td className="px-4 py-4 font-mono text-slate-400">{supp.phone}</td>
                        <td className="px-4 py-4 text-xs font-mono font-medium text-slate-450">
                          {supp.paymentHistory?.length || 0} bills logged
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button
                             onClick={() => setSelectedSupplier(supp)}
                             id={`btn-pay-supplier-opener-${supp.id}`}
                             className="px-3 py-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-teal-400 rounded-lg text-[11px] font-bold cursor-pointer transition"
                          >
                            {lang === 'en' ? 'Pay Supp' : 'পেমেন্ট দিন'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* OUTSTANDING DUE COLLECTION MODAL FORM (বাকি আদায়) */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-800 font-sans">
            <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <h3 className="font-bold text-white text-xs flex items-center gap-1.5 select-none">
                <UserCheck className="w-4 h-4 text-teal-400" />
                <span>{t.duePayment}</span>
              </h3>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-teal-400 transition cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleDuePaymentSubmit} className="p-5 space-y-4">
              {duePayError && (
                <div className="bg-rose-500/10 text-rose-400 p-2 text-xs rounded border border-rose-500/20 font-semibold mb-2">
                  {duePayError}
                </div>
              )}

              <div className="bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 select-none text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-450 font-medium">Customer:</span>
                  <span className="font-bold text-white">{selectedCustomer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-455 font-medium">Phone:</span>
                  <span className="font-mono text-slate-350">{selectedCustomer.phone}</span>
                </div>
                <div className="flex justify-between font-bold text-rose-400">
                  <span>Current Dues:</span>
                  <span>৳{selectedCustomer.dues}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Collection Amount (BDT) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedCustomer.dues}
                  value={duePayAmt}
                  onChange={(e) => setDuePayAmt(e.target.value)}
                  id="input-ledger-pay-amount"
                  placeholder="e.g. 500"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 text-white placeholder-slate-650 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Payment Method
                </label>
                <select
                  value={duePayMethod}
                  onChange={(e) => setDuePayMethod(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 font-semibold"
                >
                  <option value="Cash" className="bg-slate-900 text-white">Cash</option>
                  <option value="bKash" className="bg-slate-900 text-white">bKash</option>
                  <option value="Nagad" className="bg-slate-900 text-white">Nagad</option>
                  <option value="Rocket" className="bg-slate-900 text-white">Rocket</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="px-3.5 py-1.5 border border-slate-805 text-slate-350 hover:bg-slate-800 rounded-lg text-xs font-semibold cursor-pointer transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  id="btn-ledger-collect-submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer transition"
                >
                  {t.payoutDone}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER SUPPLIER POPUP MODAL (ADMIN ONLY) */}
      {isSuppModalOpen && isAdmin && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-800 font-sans text-slate-350">
            <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                <Building className="w-4 h-4 text-teal-400" />
                <span>{t.addSupplier}</span>
              </h3>
              <button onClick={() => setIsSuppModalOpen(false)} className="text-slate-405 hover:text-teal-400 transition cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateSupplierSubmit} className="p-5 space-y-4">
              {suppError && (
                <div className="bg-rose-500/10 text-rose-400 p-2 text-xs rounded border border-rose-500/20 font-semibold mb-2">
                  {suppError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Company Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  placeholder="e.g. Atlas Stationery BD"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Contact Person Name
                </label>
                <input
                  type="text"
                  value={contName}
                  onChange={(e) => setContName(e.target.value)}
                  placeholder="e.g. Mofidul Haq"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Phone <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={suppPhone}
                  onChange={(e) => setSuppPhone(e.target.value)}
                  placeholder="e.g. 018xxxxxxx"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={suppEmail}
                  onChange={(e) => setSuppEmail(e.target.value)}
                  placeholder="e.g. atlas@stationery.com"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsSuppModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-800 text-slate-400 hover:bg-slate-800 rounded-lg text-xs font-semibold cursor-pointer transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  id="btn-ledger-add-supplier-submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer transition"
                >
                  {t.add}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOG SUPPLIER PAYMENT OUTFLOW MODAL (ADMIN ONLY) */}
      {selectedSupplier && isAdmin && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-slate-350">
          <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-800 font-sans">
            <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-teal-400" />
                <span>{t.paySupplier}</span>
              </h3>
              <button onClick={() => setSelectedSupplier(null)} className="text-slate-400 hover:text-teal-400 transition cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSupplierPaymentSubmit} className="p-5 space-y-4">
              {suppPayError && (
                <div className="bg-rose-500/15 text-rose-400 p-2 text-xs rounded border border-rose-500/20 font-semibold mb-2">
                  {suppPayError}
                </div>
              )}

              <div className="bg-indigo-500/10 p-3 rounded-lg border border-indigo-500/20 text-xs mb-2">
                <p className="font-bold text-white">{selectedSupplier.companyName}</p>
                <p className="text-slate-400 mt-1">Rep: {selectedSupplier.contactName} ({selectedSupplier.phone})</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Payment Amount (BDT) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={suppPayAmt}
                  onChange={(e) => setSuppPayAmt(e.target.value)}
                  id="input-ledger-supp-amount"
                  placeholder="e.g. 15000"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-650 focus:outline-none tracking-wide font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Payment Detail description
                </label>
                <input
                  type="text"
                  value={suppPayDesc}
                  onChange={(e) => setSuppPayDesc(e.target.value)}
                  placeholder="e.g. Paid cash for wholesale files orders"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-650 focus:outline-none"
                />
              </div>

              {/* Show previous historical settlements */}
              <div className="space-y-1.5 max-h-36 overflow-y-auto pt-2 border-t border-slate-800">
                <span className="block text-[10px] font-extrabold text-slate-450 uppercase tracking-wider mb-1 select-none">
                  {t.paymentHistory}
                </span>
                {(!selectedSupplier.paymentHistory || selectedSupplier.paymentHistory.length === 0) ? (
                  <p className="text-[10px] text-slate-500 italic">No historical payouts registered.</p>
                ) : (
                  selectedSupplier.paymentHistory.map(hist => (
                    <div key={hist.id} className="p-2 bg-slate-950 rounded border border-slate-850/80 text-[10px] flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-slate-300">{hist.description}</p>
                        <p className="text-[8px] text-slate-500 font-mono mt-0.5">{hist.date}</p>
                      </div>
                      <span className="font-bold text-teal-400 font-mono">৳{hist.amount}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedSupplier(null)}
                  className="px-3.5 py-1.5 border border-slate-800 text-slate-400 hover:bg-slate-800 rounded-lg text-xs font-semibold cursor-pointer transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  id="btn-ledger-supplier-pay-submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer transition"
                >
                  {t.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
