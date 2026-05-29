/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  RefreshCw,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { translations, Language } from '../translations';
import { StockAdjustLog, StationeryItem, User } from '../types';

interface AdjustmentsViewProps {
  adjustments: StockAdjustLog[];
  items: StationeryItem[];
  lang: Language;
  user: User | null;
  onLogAdjustment: (type: 'Return' | 'Damage', itemId: string, qty: number, reason: string) => Promise<void>;
}

export default function AdjustmentsView({
  adjustments,
  items,
  lang,
  user,
  onLogAdjustment
}: AdjustmentsViewProps) {
  const t = translations[lang];

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adjustType, setAdjustType] = useState<'Return' | 'Damage'>('Damage');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const activeItem = items.find(i => i.id === selectedItemId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || !adjustQty || isNaN(Number(adjustQty)) || Number(adjustQty) <= 0) {
      setErrorMsg(lang === 'en' ? 'Provide a valid product and positive adjustment quantity' : 'আইটেম এবং পজিটিভ সংখ্যা প্রদান করুন');
      return;
    }

    const item = items.find(i => i.id === selectedItemId);
    if (!item) return;

    if (adjustType === 'Damage' && item.qty < Number(adjustQty)) {
      setErrorMsg(lang === 'en' ? `Insufficient stock to log damage. Active stock: ${item.qty} Qty` : `স্টকে ক্ষতিগ্রস্থ পণ্য কমানোর পর্যাপ্ত পরিমাণ নেই। সচল স্টক: ${item.qty}`);
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      await onLogAdjustment(adjustType, selectedItemId, Number(adjustQty), adjustReason || 'N/A');
      setIsModalOpen(false);
      setSelectedItemId('');
      setAdjustQty('');
      setAdjustReason('');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Transaction submission error occured');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
        <div>
          <h1 className="text-2xl font-bold font-display text-teal-400 tracking-tight">
            {t.returnsDamages}
          </h1>
          <p className="text-xs text-slate-400 font-medium font-sans">{t.adjustments}</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          id="btn-adjust-add-opener"
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>{t.logReturnDamage}</span>
        </button>
      </div>

      {/* EXPLANATORY TABS HELPERS GUIDELINES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 select-none">
        {/* Return Guide */}
        <div className="bg-teal-500/5 p-4 rounded-2xl border border-teal-500/10 flex gap-3.5">
          <RotateCcw className="w-10 h-10 text-teal-400 bg-teal-500/10 border border-teal-500/15 p-2 rounded-xl flex-shrink-0" />
          <div>
            <h4 className="text-xs font-extrabold text-teal-400 uppercase tracking-wider">{t.returnTerm}</h4>
            <p className="text-[10.5px] text-slate-350 mt-1 leading-relaxed">
              {t.returnExplanation}
            </p>
          </div>
        </div>

        {/* Damage Guide */}
        <div className="bg-rose-500/5 p-4 rounded-2xl border border-rose-500/10 flex gap-3.5">
          <AlertTriangle className="w-10 h-10 text-rose-400 bg-rose-500/10 border border-rose-500/15 p-2 rounded-xl flex-shrink-0" />
          <div>
            <h4 className="text-xs font-extrabold text-rose-400 uppercase tracking-wider">{t.damageTerm}</h4>
            <p className="text-[10.5px] text-slate-350 mt-1 leading-relaxed">
              {t.damageExplanation}
            </p>
          </div>
        </div>
      </div>

      {/* CHRONOLOGICAL LIST OF STOCK ADJUSTMENT LOGS */}
      <div className="bg-slate-900 rounded-2xl border border-slate-805 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/45 text-slate-400 uppercase text-[10px] font-bold tracking-wider select-none border-b border-slate-850">
              <tr>
                <th scope="col" className="px-6 py-4">{t.date}</th>
                <th scope="col" className="px-4 py-4">{t.status}</th>
                <th scope="col" className="px-4 py-4">Item Details</th>
                <th scope="col" className="px-4 py-4 text-center">{t.qty}</th>
                <th scope="col" className="px-4 py-4">{t.reason}</th>
                <th scope="col" className="px-6 py-4 text-right">{t.lossValue}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {adjustments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500 font-semibold font-sans">
                    No product returns or damage loss items registered yet.
                  </td>
                </tr>
              ) : (
                adjustments.map(adj => {
                  const isDamage = adj.type === 'Damage';
                  return (
                    <tr key={adj.id} className="hover:bg-slate-850/20 transition">
                      <td className="px-6 py-4 font-mono text-slate-450">
                        {new Date(adj.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border
                          ${isDamage
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/10'
                            : 'bg-teal-500/10 text-teal-400 border-teal-500/10'
                          }`}
                        >
                          {isDamage ? t.damageTerm.split(' ')[0] : t.returnTerm.split(' ')[2]}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-bold text-white">
                        {adj.itemName}
                      </td>
                      <td className="px-4 py-4 text-center font-bold font-mono text-slate-300">
                        {adj.qty} pcs
                      </td>
                      <td className="px-4 py-4 text-slate-400 font-medium truncate max-w-[150px]" title={adj.reason}>
                        {adj.reason}
                      </td>
                      <td className={`px-6 py-4 text-right font-black font-mono
                        ${isDamage ? 'text-rose-400 font-bold bg-rose-500/5 border border-rose-500/10 px-2 py-0.5 rounded' : 'text-slate-500 font-semibold'}`}
                      >
                        {isDamage ? `৳${adj.lossValue.toLocaleString()}` : '৳0.00'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADJUST INVENTORY MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-805 font-sans text-slate-350">
            <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <h3 className="font-bold text-white text-xs flex items-center gap-1.5 select-none">
                <RefreshCw className="w-4 h-4 text-teal-400 animate-spin-slow" />
                <span>{t.logAdjustment}</span>
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
                <div className="bg-rose-500/10 text-rose-400 p-2.5 text-xs rounded border border-rose-500/20 font-semibold mb-2">
                  {errorMsg}
                </div>
              )}

              {/* Adjust Type toggle modes */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Adjustment Type
                </label>
                <div className="grid grid-cols-2 gap-2 select-none">
                  <button
                    type="button"
                    onClick={() => { setAdjustType('Damage'); setErrorMsg(''); }}
                    className={`py-2 text-xs font-bold rounded-xl border text-center transition cursor-pointer
                      ${adjustType === 'Damage'
                        ? 'bg-rose-600/90 border-rose-600 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-teal-400'
                      }`}
                  >
                    {t.damageTerm.split(' ')[0]} (Damage)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAdjustType('Return'); setErrorMsg(''); }}
                    className={`py-2 text-xs font-bold rounded-xl border text-center transition cursor-pointer
                        ${adjustType === 'Return'
                        ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-805 hover:text-teal-400'
                      }`}
                  >
                    {t.returnTerm.split(' ')[2]} (Return)
                  </button>
                </div>
              </div>

              {/* Select Stationery Item */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Stationery Item <span className="text-rose-400">*</span>
                </label>
                <select
                  required
                  value={selectedItemId}
                  onChange={(e) => { setSelectedItemId(e.target.value); setErrorMsg(''); }}
                  className="w-full px-3 py-2 text-xs bg-slate-955 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 font-semibold"
                >
                  <option value="" className="bg-slate-900 text-slate-400">{lang === 'en' ? '-- Select stationery --' : '-- পণ্য বেছে নিন --'}</option>
                  {items.map(itm => (
                    <option key={itm.id} value={itm.id} className="bg-slate-900 text-white">
                      {itm.name} (Qty: {itm.qty})
                    </option>
                  ))}
                </select>
                {activeItem && (
                  <span className="text-[10px] text-slate-500 font-medium block mt-1.5 font-mono">
                    Cost Price: ৳{activeItem.costPrice} | Retail Price: ৳{activeItem.sellingPrice}
                  </span>
                )}
              </div>

              {/* Adjust Qty */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Adjust Qty <span className="text-rose-450">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={adjustQty}
                  onChange={(e) => { setAdjustQty(e.target.value); setErrorMsg(''); }}
                  placeholder="e.g. 5"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 text-white placeholder-slate-650 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                />
              </div>

              {/* Action justify reason */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Reason / Condition detail
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Customer returned, display keyboard issue"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 text-white placeholder-slate-650 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-800 text-slate-400 hover:bg-slate-800 rounded-lg text-xs font-semibold cursor-pointer transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  id="btn-adjust-submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer transition"
                >
                  {submitting ? t.loading : t.add}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
