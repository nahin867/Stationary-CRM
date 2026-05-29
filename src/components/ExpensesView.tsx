/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrendingDown,
  Plus,
  Calendar,
  Layers,
  FileText,
  AlertCircle
} from 'lucide-react';
import { translations, Language } from '../translations';
import { Expense, User } from '../types';

interface ExpensesViewProps {
  expenses: Expense[];
  lang: Language;
  user: User | null;
  onAddExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
}

export default function ExpensesView({ expenses, lang, user, onAddExpense }: ExpensesViewProps) {
  const t = translations[lang];
  const isAdmin = user?.role === 'ADMIN';

  // Toggle state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState('Other/General Overheads (অন্যান্য)');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sample Categories lists
  const expenseCatList = [
    'Shop Rent (দোকান ভাড়া)',
    'Electricity Bill (বিদ্যুৎ বিল)',
    'Employee Salary (বেতন)',
    'Transportation (পরিবহন খরচ)',
    'Other/General Overheads (অন্যান্য)'
  ];

  const totalExpense = expenses.reduce((acc, current) => acc + current.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amtDecimal = Number(amount);
    if (!category || isNaN(amtDecimal) || amtDecimal <= 0) {
      setErrorMsg(lang === 'en' ? 'Provide positive numeric expense' : 'সঠিক পেমেন্ট পরিমাণ লিখুন');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await onAddExpense({
        category,
        amount: amtDecimal,
        description: description || 'No detail log info provided',
        date
      });
      setIsModalOpen(false);
      setCategory('Other/General Overheads (অন্যান্য)');
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error occurred while saving expense record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
        <div>
          <h1 className="text-2xl font-bold font-display text-teal-400 tracking-tight">
            {t.expenses}
          </h1>
          <p className="text-xs text-slate-400 font-medium font-sans">{t.shopExpenses}</p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            id="btn-expense-add-opener"
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addExpense}</span>
          </button>
        )}
      </div>

      {/* RETAIL EXPENSE OUTFLOW BOX METRIC */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between max-w-sm">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {lang === 'en' ? 'Cumulative Recorded Outflow' : 'চলতি পর্যন্ত সর্বমোট খরচ'}
          </p>
          <h3 className="text-2xl font-bold font-mono mt-1.5 text-white">
            ৳{totalExpense.toLocaleString()}
          </h3>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Sum of logged operational costs</p>
        </div>
        <div className="bg-rose-500/10 text-rose-400 p-3.5 rounded-xl border border-rose-500/10">
          <TrendingDown className="w-5 h-5" />
        </div>
      </div>

      {/* CHRONOLOGICAL EXPENSE ARCHIVE TABLE */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/45 text-slate-400 uppercase text-[10px] font-bold tracking-wider select-none border-b border-slate-850">
              <tr>
                <th scope="col" className="px-6 py-4">{t.date}</th>
                <th scope="col" className="px-4 py-4">{t.category}</th>
                <th scope="col" className="px-4 py-4">{t.description}</th>
                <th scope="col" className="px-6 py-4 text-right">{t.amount}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-slate-505 font-semibold font-sans">
                    No operational expenses recorded in bookkeeping logs.
                  </td>
                </tr>
              ) : (
                expenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-850/20 transition">
                    <td className="px-6 py-4 font-mono font-medium text-slate-450">
                      {exp.date}
                    </td>
                    <td className="px-4 py-4 font-bold text-white">
                      {exp.category}
                    </td>
                    <td className="px-4 py-4 text-slate-350 truncate max-w-[200px]">
                      {exp.description}
                    </td>
                    <td className="px-6 py-4 text-right font-black font-mono text-rose-455">
                      ৳{exp.amount.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD EXPENSE DIALOG FORM POPUP */}
      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-slate-350">
          <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-800 font-sans">
            <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <h3 className="font-bold text-white text-xs flex items-center gap-1.5 select-none">
                <TrendingDown className="w-4 h-4 text-teal-400" />
                <span>{t.addExpense}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-teal-400 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {errorMsg && (
                <div className="bg-rose-500/10 text-rose-400 p-2.5 text-xs rounded border border-rose-500/20 font-semibold shadow-xs">
                  {errorMsg}
                </div>
              )}

              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-slate-405 uppercase tracking-wider mb-1.5">
                  Expense Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              {/* Categorization Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-405 uppercase tracking-wider mb-1.5">
                  Category <span className="text-rose-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 text-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 font-semibold"
                >
                  {expenseCatList.map((cat, idx) => (
                    <option key={idx} value={cat} className="bg-slate-900 text-white">{cat}</option>
                  ))}
                </select>
              </div>

              {/* Expense amount */}
              <div>
                <label className="block text-xs font-bold text-slate-405 uppercase tracking-wider mb-1.5">
                  Paid Amount (BDT) <span className="text-rose-405">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  id="input-expense-amount"
                  placeholder="e.g. 1500"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 text-white placeholder-slate-650 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono font-extrabold"
                />
              </div>

              {/* Description helper string */}
              <div>
                <label className="block text-xs font-bold text-slate-405 uppercase tracking-wider mb-1.5">
                  Usage details / Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Uttara Commercial DESCO power bill"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 text-white placeholder-slate-650 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2.5 bg-slate-955 p-4 -mx-5 -mb-5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-800 text-slate-350 hover:bg-slate-800 rounded-lg text-xs font-semibold cursor-pointer transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  id="btn-expense-add-submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer transition"
                >
                  {loading ? t.loading : t.add}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
