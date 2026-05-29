/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  ClipboardList,
  TrendingDown,
  RefreshCw,
  LogOut,
  Globe,
  Menu,
  X,
  ShieldCheck,
  Building2,
  ListRestart,
  Download
} from 'lucide-react';
import { translations, Language } from '../translations';
import { User } from '../types';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: any) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  user: User | null;
  onLogout: () => void;
  onResetDb: () => void;
}

export default function Sidebar({
  currentView,
  setCurrentView,
  lang,
  setLang,
  user,
  onLogout,
  onResetDb
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const t = translations[lang];

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard, roles: ['ADMIN', 'SALESMAN'] },
    { id: 'pos', label: t.pos, icon: ShoppingCart, roles: ['ADMIN', 'SALESMAN'] },
    { id: 'inventory', label: t.inventory, icon: Package, roles: ['ADMIN', 'SALESMAN'] },
    { id: 'customers', label: t.customers, icon: Users, roles: ['ADMIN', 'SALESMAN'] },
    { id: 'suppliers', label: t.suppliers, icon: Building2, roles: ['ADMIN'] },
    { id: 'dueLedger', label: t.dueLedger, icon: ClipboardList, roles: ['ADMIN', 'SALESMAN'] },
    { id: 'expenses', label: t.expenses, icon: TrendingDown, roles: ['ADMIN'] },
    { id: 'returnsDamages', label: t.returnsDamages, icon: RefreshCw, roles: ['ADMIN', 'SALESMAN'] }
  ];

  // Filter menu items by role access
  const visibleItems = menuItems.filter(item => {
    const role = user?.role || 'SALESMAN';
    if (role === 'SUPERADMIN') return true;
    return item.roles.includes(role);
  });

  return (
    <>
      {/* Mobile Top Navigation Head */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 h-16 px-4 flex items-center justify-between sticky top-0 z-20 no-print">
        <div className="flex items-center gap-2">
          <div className="bg-teal-600 p-1.5 rounded-lg text-white">
            <Package className="w-5 h-5" />
          </div>
          <span className="font-bold text-white tracking-tight font-display text-base">Stationery CRM</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            id="mobile-btn-lang"
            className="p-1 px-2.5 bg-slate-800 border border-slate-700 rounded text-xs font-semibold text-slate-200 font-display hover:bg-slate-705"
          >
            {t.language}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            id="mobile-nav-toggle"
            className="p-2 text-slate-400 hover:bg-slate-800 hover:text-teal-400 rounded-lg transition focus:outline-none"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Backdrop for mobile drawer */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-30 no-print"
        />
      )}

      {/* Main Sidebar Drawer / Container */}
      <div
        className={`fixed top-0 bottom-0 left-0 bg-slate-900 border-r border-slate-800/80 w-64 flex flex-col z-40 transition-transform duration-300 lg:translate-x-0 lg:sticky no-print text-slate-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isOpen ? 'top-0' : ''}
        `}
      >
        {/* Sidebar Brand Header (Desktop) */}
        <div className="h-16 px-6 border-b border-slate-800/80 flex items-center gap-3 justify-between lg:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-tr from-teal-600 to-emerald-500 p-2 rounded-xl text-white shadow-sm shadow-teal-500/10">
              <Package className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white tracking-tight font-display text-base leading-none">
                Stationery CRM
              </span>
              <span className="text-[10px] text-teal-400 font-semibold tracking-wider mt-0.5 uppercase">Bilingual OS 2.1</span>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-teal-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Account Capsule */}
        <div className="px-4 py-4 border-b border-slate-800/40">
          <div className="bg-slate-850/60 p-3 rounded-xl flex items-center gap-3 border border-slate-800">
            <div className="bg-teal-500/10 p-2 rounded-lg text-teal-400 border border-teal-500/20 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate" title={user?.name}>
                {user?.name}
              </p>
              <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mt-0.5">
                {user?.role === 'SUPERADMIN' 
                  ? (lang === 'en' ? 'SUPER ADMIN' : 'সুপার এডমিন')
                  : user?.role === 'ADMIN' 
                    ? t.adminRole 
                    : t.salesmanRole}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Actions Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {visibleItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setIsOpen(false);
                }}
                id={`sidebar-nav-${item.id}`}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer border-l-4
                  ${isActive
                    ? 'bg-teal-500/10 text-teal-300 border-teal-500 font-semibold shadow-xs shadow-teal-950/20'
                    : 'text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-teal-400'
                  }
                `}
              >
                <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110 text-teal-400' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/20 space-y-2">
          {/* Desktop Language Switcher */}
          <button
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            id="sidebar-btn-lang"
            className="w-full hidden lg:flex items-center justify-between text-xs font-semibold text-slate-300 bg-slate-850/80 border border-slate-800 px-4 py-2.5 rounded-xl hover:bg-slate-800 hover:text-teal-400 transition cursor-pointer"
          >
            <span className="flex items-center gap-1.5 text-slate-400">
              <Globe className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              {lang === 'en' ? 'Language' : 'ভাষা'}
            </span>
            <span className="text-teal-400 font-bold">{t.language}</span>
          </button>

          {/* Reset Demo Database (Admin & Super Admin) */}
          {(user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') && (
            <button
               onClick={() => {
                if (window.confirm(lang === 'en' ? 'Reset database to initial seed values?' : 'ডাটাবেজ রি-সেট করে শুরু করতে চান?')) {
                  onResetDb();
                }
              }}
              id="sidebar-btn-reset-db"
              className="w-full flex items-center gap-2 text-[11px] font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-4 py-2.5 rounded-xl transition cursor-pointer"
            >
              <ListRestart className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Reset Database' : 'সিস্টেম ডাটা রি-সেট'}</span>
            </button>
          )}

          {/* Download Source Code ZIP */}
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = '/api/project/download';
              link.setAttribute('download', 'stationery_crm_project.zip');
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            id="sidebar-btn-download-src"
            className="w-full flex items-center gap-2 text-xs font-semibold text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 px-4 py-2.5 rounded-xl transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>{lang === 'en' ? 'Download Project (.zip)' : 'সফটওয়্যার ডাউনলোড (.zip)'}</span>
          </button>

          {/* Logout Action */}
          <button
            onClick={onLogout}
            id="sidebar-btn-logout"
            className="w-full flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-850/80 border border-slate-800 hover:bg-slate-800 hover:text-rose-400 hover:border-rose-900/40 px-4 py-2.5 rounded-xl transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400" />
            <span>{t.logout}</span>
          </button>
        </div>
      </div>
    </>
  );
}
