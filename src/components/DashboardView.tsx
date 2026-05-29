/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  ShoppingBag,
  ArrowRight,
  TrendingDown,
  Percent,
  Plus
} from 'lucide-react';
import { translations, Language } from '../translations';
import { DashboardStats, User } from '../types';

interface DashboardViewProps {
  stats: DashboardStats | null;
  lang: Language;
  user: User | null;
  onNavigateToView: (view: string) => void;
}

export default function DashboardView({ stats, lang, user, onNavigateToView }: DashboardViewProps) {
  const t = translations[lang];
  const isSalesman = user?.role === 'SALESMAN';

  if (!stats) {
    return (
      <div className="flex items-center justify-center p-12 bg-slate-900 rounded-2xl border border-slate-800 shadow-xs">
        <div className="text-teal-400 font-semibold text-sm animate-pulse flex items-center gap-2">
          <span>{t.loading}</span>
        </div>
      </div>
    );
  }

  // Calculate highest financial value to scale custom SVG chart safely
  const monthlyData = stats.monthlyCharts || [];
  const maxFinancialValue = Math.max(
    ...monthlyData.map(d => Math.max(d.sales, d.expenses)),
    5000 // default minimum scale roof
  );

  return (
    <div className="space-y-6">
      {/* Title & Banner */}
      <div>
        <h1 className="text-2xl font-bold font-display text-teal-400 tracking-tight">
          {t.dashboard}
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">
          {lang === 'en'
            ? 'Real-time sales, product metrics, and financial summaries.'
            : 'রিয়েল-টাইম বিক্রয়, স্টক নোটিফিকেশন এবং আর্থিক পরিসংখ্যান।'}
        </p>
      </div>

      {/* STATS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales - Shared */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800/80 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.salesToday}</p>
            <h3 className="text-2xl font-bold font-mono mt-1 text-white">
              ৳{stats.salesToday.toLocaleString()}
            </h3>
            <p className="text-[10px] text-teal-400 font-semibold mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping"></span>
              <span>★ Live Feed</span>
            </p>
          </div>
          <div className="bg-teal-500/10 text-teal-400 p-3.5 rounded-xl border border-teal-500/20">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* Sales This Month - Admin Only */}
        {!isSalesman ? (
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800/80 shadow-md flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.salesMonth}</p>
              <h3 className="text-2xl font-bold font-mono mt-1 text-white">
                ৳{stats.salesThisMonth.toLocaleString()}
              </h3>
              <p className="text-[10px] text-slate-500 font-medium mt-1">Current Month Summary</p>
            </div>
            <div className="bg-teal-500/10 text-teal-400 p-3.5 rounded-xl border border-teal-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 border-dashed flex flex-col justify-center text-center">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.salesMonth}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">🔒 Admin Only</p>
          </div>
        )}

        {/* Profit This Month - Admin Only */}
        {!isSalesman ? (
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800/80 shadow-md flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.profitMonth}</p>
              <h3 className="text-2xl font-bold font-mono mt-1 text-emerald-400">
                ৳{stats.profitThisMonth.toLocaleString()}
              </h3>
              <p className="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center gap-0.5">
                <Percent className="w-2.5 h-2.5" />
                <span>Margin optimized</span>
              </p>
            </div>
            <div className="bg-emerald-500/10 text-emerald-400 p-3.5 rounded-xl border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 border-dashed flex flex-col justify-center text-center">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.profitMonth}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">🔒 Admin Only</p>
          </div>
        )}

        {/* Outstanding Dues - Admin Only */}
        {!isSalesman ? (
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800/80 shadow-md flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.outstandingDues}</p>
              <h3 className="text-2xl font-bold font-mono mt-1 text-rose-400">
                ৳{stats.outstandingDues.toLocaleString()}
              </h3>
              <button
                onClick={() => onNavigateToView('dueLedger')}
                className="text-[10px] text-teal-400 font-semibold mt-1 flex items-center gap-0.5 hover:underline cursor-pointer"
              >
                <span>{lang === 'en' ? 'Open Dues Ledger' : 'বাকি খাতা খুলুন'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="bg-rose-500/10 text-rose-400 p-3.5 rounded-xl border border-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 border-dashed flex flex-col justify-center text-center">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.outstandingDues}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">🔒 Admin Only</p>
          </div>
        )}
      </div>

      {/* MID PANEL: ANALYTICS COMPARATIVE GRAPH & LOW STOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales vs Expenses Interactive Visualizer Chart - Admin Only */}
        <div className="lg:col-span-2 bg-slate-900 p-5 rounded-2xl border border-slate-800/80 shadow-md">
          <h4 className="text-sm font-bold font-display text-slate-200 uppercase tracking-wide mb-4">
            {t.salesVsExpenses}
          </h4>

          {isSalesman ? (
            <div className="h-64 flex flex-col items-center justify-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800 text-center px-4">
              <div className="bg-slate-800 p-2.5 rounded-full text-slate-400 mb-2">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <p className="text-sm font-semibold text-slate-200">{lang === 'en' ? 'Confidential Financial Reports' : 'গোপনীয় আর্থিক প্রতিবেদন'}</p>
              <p className="text-slate-500 text-xs mt-1">
                {lang === 'en' ? 'Log in with Administrator credentials to query charts.' : 'চার্ট দেখার জন্য অ্যাডমিনিস্ট্রেটর অ্যাকাউন্টে প্রবেশ করুন।'}
              </p>
            </div>
          ) : monthlyData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-xs font-medium">No sales logged in chart period</div>
          ) : (
            <div className="relative">
              {/* Custom SVG Dual Bar Chart */}
              <svg viewBox="0 0 600 240" className="w-full h-64 overflow-visible">
                {/* Horizontal grid guide lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                  const y = 20 + ratio * 160;
                  const value = Math.round(maxFinancialValue * (1 - ratio));
                  return (
                    <g key={idx}>
                      <line x1="50" y1={y} x2="580" y2={y} stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
                      <text x="12" y={y + 4} className="text-[10px] font-mono fill-slate-500" textAnchor="start">
                        ৳{value >= 1000 ? (value / 1000) + 'k' : value}
                      </text>
                    </g>
                  );
                })}

                {/* Plotting bars */}
                {monthlyData.map((d, index) => {
                  const paddingGroup = 45;
                  const itemWidthGroup = 65;
                  const xGroup = 70 + index * (itemWidthGroup + paddingGroup);

                  // Calculate Heights
                  const salesHeight = (d.sales / maxFinancialValue) * 160;
                  const expHeight = (d.expenses / maxFinancialValue) * 160;

                  // y points
                  const ySales = 180 - salesHeight;
                  const yExp = 180 - expHeight;

                  return (
                    <g key={index} className="group cursor-pointer">
                      {/* Sales Bar (Teal) */}
                      <rect
                        x={xGroup}
                        y={ySales}
                        width="24"
                        height={salesHeight}
                        rx="4"
                        fill="#14b8a6"
                        className="transition-all duration-300 hover:opacity-90"
                      />

                      {/* Expenses Bar (Slate) */}
                      <rect
                        x={xGroup + 28}
                        y={yExp}
                        width="24"
                        height={expHeight}
                        rx="4"
                        fill="#475569"
                        className="transition-all duration-300 hover:fill-rose-500"
                      />

                      {/* Tooltip values on hover */}
                      <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none animate-fade-in">
                        <rect x={xGroup - 10} y="0" width="100" height="36" rx="6" fill="#020617" stroke="#1e293b" />
                        <text x={xGroup + 40} y="15" className="text-[9px] fill-teal-400 font-mono text-center" textAnchor="middle">
                          S: ৳{d.sales.toFixed(0)}
                        </text>
                        <text x={xGroup + 40} y="28" className="text-[9px] fill-rose-400 font-mono text-center" textAnchor="middle">
                          E: ৳{d.expenses.toFixed(0)}
                        </text>
                      </g>

                      {/* Month label along x-axis */}
                      <text x={xGroup + 26} y="200" className="text-[10px] font-semibold font-display fill-slate-400" textAnchor="middle">
                        {d.month}
                      </text>
                    </g>
                  );
                })}

                {/* Base divider line */}
                <line x1="50" y1="180" x2="580" y2="180" stroke="#334155" strokeWidth="1" />
              </svg>

              {/* Chart Legend */}
              <div className="flex items-center justify-end gap-4 mt-2 px-2 text-[11px] font-semibold text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-teal-500 rounded"></span>
                  <span>{lang === 'en' ? 'Sales Revenue' : 'বিক্রয় রাজস্ব'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-slate-600 rounded"></span>
                  <span>{lang === 'en' ? 'Expenses + Losses' : 'খরচ ও ক্ষতি'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Low Stock Watch Panel - Vital for both Salesman and Admin */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800/80 shadow-md flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold font-display text-slate-200 uppercase tracking-wide">
              {t.lowStockAlerts}
            </h4>
            <span className="px-2 py-0.5 font-mono text-xs font-semibold bg-rose-500/10 text-rose-400 rounded-full border border-rose-500/20">
              {stats.lowStockAlerts.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mb-4 leading-tight">{t.lowStockDesc}</p>

          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-60 pr-1 custom-scrollbar">
            {stats.lowStockAlerts.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-slate-500 text-xs font-semibold bg-slate-950/40 rounded-xl border border-slate-800/50">
                <span className="text-teal-400">✓ All stocks are fully optimized</span>
              </div>
            ) : (
              stats.lowStockAlerts.map(item => (
                <div
                  key={item.id}
                  className="bg-rose-500/5 border border-rose-500/20 p-3 rounded-xl flex items-center justify-between"
                >
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-200 truncate" title={item.name}>{item.name}</p>
                    <p className="text-[10px] font-semibold font-mono text-slate-500 uppercase mt-0.5">{item.sku}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-rose-400 font-mono">
                      {item.qty} Qty
                    </div>
                    <div className="text-[9px] font-medium text-slate-500 mt-0.5">
                      Limit: {item.lowStockThreshold}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => onNavigateToView('inventory')}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-750 border border-slate-700/85 rounded-xl transition cursor-pointer"
          >
            <span>{lang === 'en' ? 'Manage & Stock Items' : 'ইনভেন্টরি স্টক দেখুন'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* LOWER PANEL: TOP SELLING ITEMS - Admin Only */}
      {!isSalesman && (
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800/80 shadow-md">
          <h4 className="text-sm font-bold font-display text-slate-200 uppercase tracking-wide mb-4">
            {t.topSelling}
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0b1329] text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th scope="col" className="px-4 py-3 rounded-l-xl">{t.itemName}</th>
                  <th scope="col" className="px-4 py-3 text-center">{t.qtySold}</th>
                  <th scope="col" className="px-4 py-3 text-right rounded-r-xl">{t.revenue}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/55">
                {stats.topSellingItems.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-6 text-slate-500 text-xs">
                      No customer invoice checkouts logged yet.
                    </td>
                  </tr>
                ) : (
                  stats.topSellingItems.map((itm, index) => (
                    <tr key={index} className="hover:bg-slate-800/20 transition">
                      <td className="px-4 py-3 font-semibold text-slate-200 flex items-center gap-2.5">
                        <span className="w-5 h-5 flex items-center justify-center bg-teal-500/10 text-teal-400 text-[10px] font-bold rounded-full border border-teal-500/20">
                          {index + 1}
                        </span>
                        {itm.name}
                      </td>
                      <td className="px-4 py-3 text-center font-bold font-mono text-slate-300">
                        {itm.qtySold}
                      </td>
                      <td className="px-4 py-3 text-right font-extrabold font-mono text-teal-400">
                        ৳{itm.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
