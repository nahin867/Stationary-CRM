/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Store, User } from '../types';
import { 
  Building2, 
  UserPlus, 
  Users, 
  Trash2, 
  ExternalLink, 
  PlusCircle, 
  MapPin, 
  Bookmark, 
  Calendar, 
  Activity, 
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  Languages
} from 'lucide-react';

interface SuperAdminViewProps {
  lang: 'en' | 'bn';
  setLang: (lang: 'en' | 'bn') => void;
  user: User;
  onLogout: () => void;
  onShopChange: () => void;
}

export default function SuperAdminView({ lang, setLang, user, onLogout, onShopChange }: SuperAdminViewProps) {
  // Lists
  const [stores, setStores] = useState<Store[]>([]);
  const [operators, setOperators] = useState<any[]>([]);
  const [currentTab, setCurrentTab] = useState<'stores' | 'operators'>('stores');

  // Input states for new store
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreAddress, setNewStoreAddress] = useState('');
  const [newStoreBin, setNewStoreBin] = useState('');

  // Input states for new operator/user
  const [newOpName, setNewOpName] = useState('');
  const [newOpUsername, setNewOpUsername] = useState('');
  const [newOpPassword, setNewOpPassword] = useState('');
  const [newOpRole, setNewOpRole] = useState<'ADMIN' | 'SALESMAN'>('ADMIN');
  const [newOpStoreId, setNewOpStoreId] = useState('');

  // Message & status feedback states
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Active mimick store on frontend
  const [activeStoreId, setActiveStoreId] = useState(localStorage.getItem('activeStoreId') || '');

  // Sync / fetch lists
  const fetchData = async () => {
    setLoading(true);
    try {
      const [allStores, allUsers] = await Promise.all([
        api.getSuperStores(),
        api.getSuperUsers()
      ]);
      setStores(allStores);
      setOperators(allUsers);
      
      // Auto-select first store if none selected in inputs
      if (allStores.length > 0) {
        setNewOpStoreId(allStores[0].id);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error pulling data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const flashSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const flashError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 4000);
  };

  // Add store handler
  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;

    setLoading(true);
    try {
      const addedStore = await api.createSuperStore(
        newStoreName, 
        newStoreAddress, 
        newStoreBin
      );
      flashSuccess(lang === 'en' ? `Successfully registered ${addedStore.name}` : `${addedStore.name} সফলভাবে যুক্ত করা হয়েছে!`);
      setNewStoreName('');
      setNewStoreAddress('');
      setNewStoreBin('');
      await fetchData();
    } catch (err: any) {
      flashError(err.message || 'Failed to create store');
    } finally {
      setLoading(false);
    }
  };

  // Delete store handler
  const handleDeleteStore = async (storeId: string, storeName: string) => {
    const confirmText = lang === 'en' 
      ? `Are you sure you want to delete store "${storeName}"? This will lock any linked records.`
      : `আপনি কি নিশ্চিতভাবে "${storeName}" দোকানটি মুছে ফেলতে চান?`;

    if (!window.confirm(confirmText)) return;

    setLoading(true);
    try {
      await api.deleteSuperStore(storeId);
      flashSuccess(lang === 'en' ? 'Store record removed' : 'দোকান সফলভাবে মুছে ফেলা হয়েছে');
      if (activeStoreId === storeId) {
        localStorage.removeItem('activeStoreId');
        setActiveStoreId('');
        onShopChange();
      }
      await fetchData();
    } catch (err: any) {
      flashError(err.message || 'Error deleting store');
    } finally {
      setLoading(false);
    }
  };

  // Add operator/user handler
  const handleAddOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOpName.trim() || !newOpUsername.trim() || !newOpPassword.trim() || !newOpStoreId) {
      flashError(lang === 'en' ? 'Please fill in all operator fields' : 'সকল তথ্য সঠিকভাবে পূরণ করুন');
      return;
    }

    setLoading(true);
    try {
      await api.createSuperUser({
        name: newOpName,
        username: newOpUsername,
        password: newOpPassword,
        role: newOpRole,
        storeId: newOpStoreId
      });
      flashSuccess(lang === 'en' ? 'Operator credential created successfully' : 'নতুন অপারেটর প্রোফাইল তৈরি হয়েছে!');
      setNewOpName('');
      setNewOpUsername('');
      setNewOpPassword('');
      await fetchData();
    } catch (err: any) {
      flashError(err.message || 'Failed to create operator');
    } finally {
      setLoading(false);
    }
  };

  // Delete operator user handler
  const handleDeleteOperator = async (id: string, name: string) => {
    const confirmText = lang === 'en' 
      ? `Are you sure you want to remove credentials for "${name}"?`
      : `আপনি কি নিশ্চিতভাবে "${name}" অপারেটরের আইডি মুছে ফেলতে চান?`;

    if (!window.confirm(confirmText)) return;

    setLoading(true);
    try {
      await api.deleteSuperUser(id);
      flashSuccess(lang === 'en' ? 'Operator account deleted' : 'অপারেটর অ্যাকাউন্ট মুছে ফেলা হয়েছে');
      await fetchData();
    } catch (err: any) {
      flashError(err.message || 'Error deleting user');
    } finally {
      setLoading(false);
    }
  };

  // Enter/manage a store workflow
  const handleEnterStore = (store: Store) => {
    localStorage.setItem('activeStoreId', store.id);
    setActiveStoreId(store.id);
    onShopChange();
    flashSuccess(lang === 'en' 
      ? `Switched active panel workspace to ${store.name}` 
      : `${store.name} স্টোরের ড্যাশবোর্ডে প্রবেশ করেছেন!`
    );
  };

  const handleClearImpersonation = () => {
    localStorage.removeItem('activeStoreId');
    setActiveStoreId('');
    onShopChange();
    flashSuccess(lang === 'en' 
      ? 'Cleaned active store filter - workspace back to default store' 
      : 'স্টোর ফিল্টার বাতিল হয়েছে - পূর্ব নির্ধারিত দোকানে ফেরত নেওয়া হয়েছে'
    );
  };

  const getStoreName = (storeId?: string) => {
    if (!storeId) return 'Super Admin Space';
    const s = stores.find(str => str.id === storeId);
    return s ? s.name : storeId;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none">
      {/* Super Admin Topbar Header */}
      <header className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-lg text-slate-950 shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-tight text-white uppercase">
                Stationery CRM Control Portal
              </h1>
              <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full uppercase tracking-wider">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'en' 
                ? 'Multi-Tenant Network & Shop Registry Management' 
                : 'মাল্টি-টেন্যান্ট নেটওয়ার্ক ও স্টেশনারি দোকান ম্যানেজমেন্ট পোর্টাল'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Store Indicator */}
          {activeStoreId && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/35 rounded-lg text-emerald-400 text-[11px] font-bold">
              <span>{lang === 'en' ? 'Active context:' : 'চলতি দোকান ফিল্টার:'}</span>
              <span className="text-white underline">{getStoreName(activeStoreId)}</span>
              <button 
                onClick={handleClearImpersonation}
                className="ml-1 text-[10px] hover:text-red-400 text-slate-400 font-semibold cursor-pointer"
              >
                ({lang === 'en' ? 'Clear' : 'মুছুন'})
              </button>
            </div>
          )}

          {/* Bilingual Switcher */}
          <button
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer border border-slate-700 transition"
          >
            <Languages className="w-3.5 h-3.5 text-amber-500" />
            <span>{lang === 'en' ? 'বাংলা সংস্করণ' : 'English View'}</span>
          </button>

          {/* System Sign out */}
          <button
            onClick={onLogout}
            className="px-3 py-1.5 bg-red-650 hover:bg-red-500 text-white rounded-lg text-xs font-bold shadow-md transition cursor-pointer"
          >
            {lang === 'en' ? 'Logout' : 'লগ আউট'}
          </button>
        </div>
      </header>

      {/* Control Main Center View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Alerts notifications toasts banner */}
        {successMsg && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center gap-3 text-sm animate-fade-in shadow-lg">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-500/15 border border-red-500/30 text-red-400 rounded-xl flex items-center gap-3 text-sm animate-fade-in shadow-lg">
            <HelpCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Super Dashboard Statistics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-xl relative overflow-hidden">
            <div className="absolute right-4 bottom-4 text-slate-800 opacity-20 transform scale-150">
              <Building2 className="w-16 h-16" />
            </div>
            <span className="text-[10px] uppercase text-slate-400 tracking-wider font-bold block">
              {lang === 'en' ? 'Total Shops Onboarded' : 'অনবোর্ডকৃত মোট দোকান সংখ্যা'}
            </span>
            <span className="text-3xl font-black text-white mt-1 block">
              {stores.length}
            </span>
            <p className="text-[11px] text-slate-500 mt-2">
              {lang === 'en' ? 'Operational independent clients' : 'আলাদা আলাদা ড্যাশবোর্ড ব্যবহারকারী'}
            </p>
          </div>

          <div className="p-5 bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-xl relative overflow-hidden">
            <div className="absolute right-4 bottom-4 text-slate-800 opacity-20 transform scale-150">
              <Users className="w-16 h-16" />
            </div>
            <span className="text-[10px] uppercase text-slate-400 tracking-wider font-bold block">
              {lang === 'en' ? 'Active Station Operators' : 'সক্রিয় বিক্রয়কর্মী ও অ্যাডমিন অ্যাকাউন্ট'}
            </span>
            <span className="text-3xl font-black text-white mt-1 block">
              {operators.filter(o => o.role !== 'SUPERADMIN').length}
            </span>
            <p className="text-[11px] text-slate-500 mt-2">
              {lang === 'en' ? 'Excluding global system root user' : 'প্রধান সিস্টেম এডমিন ব্যতীত'}
            </p>
          </div>

          <div className="p-5 bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-xl relative overflow-hidden">
            <div className="absolute right-4 bottom-4 text-slate-800 opacity-10 transform scale-150">
              <Activity className="w-16 h-16" />
            </div>
            <span className="text-[10px] uppercase text-slate-400 tracking-wider font-bold block">
              {lang === 'en' ? 'Active Impersonation Context' : 'চলতি প্যানেল ভিউ'}
            </span>
            <span className="text-xs font-bold text-amber-400 mt-2 block break-all whitespace-normal">
              {activeStoreId ? getStoreName(activeStoreId) : (lang === 'en' ? 'Global Core' : 'প্রধান এডমিন স্পেস')}
            </span>
            <p className="text-[11px] text-slate-500 mt-2">
              {lang === 'en' ? 'Switch context to run operations as that store' : 'চলতি ব্যবসার POS/অ্যাকাউন্টস দেখতে স্টোর পরিবর্তন করুন'}
            </p>
          </div>
        </div>

        {/* Workspace Tab Navigators */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setCurrentTab('stores')}
            className={`px-5 py-3 text-sm font-extrabold flex items-center gap-2 cursor-pointer border-b-2 transition ${
              currentTab === 'stores' 
                ? 'border-amber-500 text-white bg-slate-850/50' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4 text-amber-500" />
            <span>
              {lang === 'en' ? 'Registered Shops' : 'সবগুলো দোকান তালিকা ও অন্তর্ভুক্তি'}
            </span>
          </button>
          <button
            onClick={() => setCurrentTab('operators')}
            className={`px-5 py-3 text-sm font-extrabold flex items-center gap-2 cursor-pointer border-b-2 transition ${
              currentTab === 'operators' 
                ? 'border-amber-500 text-white bg-slate-850/50' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4 text-amber-500" />
            <span>
              {lang === 'en' ? 'Store Users & Logistics' : 'ইউজার অ্যাকাউন্টস ও কর্মী তালিকা'}
            </span>
          </button>
        </div>

        {/* Tab 1: ONBOARD STORES LIST & REGISTRATOR */}
        {currentTab === 'stores' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Onboard Registrator Form Column */}
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <PlusCircle className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-black uppercase text-white tracking-wide">
                  {lang === 'en' ? 'Register New Stationery Shop' : 'নতুন দোকান যুক্ত করুন'}
                </h3>
              </div>

              <form onSubmit={handleAddStore} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    {lang === 'en' ? 'Shops Business Name *' : 'দোকানের নাম লিখুন *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={lang === 'en' ? 'e.g. Mofiz Stationery Point' : 'উদা: মফিজ স্টেশনারি পয়েন্ট'}
                    value={newStoreName}
                    onChange={(e) => setNewStoreName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    {lang === 'en' ? 'Physical Shop Address' : 'দোকানের ঠিকানা (ঠিকানা)'}
                  </label>
                  <input
                    type="text"
                    placeholder={lang === 'en' ? 'e.g. Sector-4, Uttara, Dhaka' : 'উদা: সেক্টর ৪, উত্তরা, ঢাকা'}
                    value={newStoreAddress}
                    onChange={(e) => setNewStoreAddress(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    {lang === 'en' ? 'BIN / Business VAT Number (Optional)' : 'ভ্যাট বিন নাম্বার (যদি থাকে)'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 00983415-0103"
                    value={newStoreBin}
                    onChange={(e) => setNewStoreBin(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 animate-pulse-slow"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-450 disabled:bg-slate-800 text-slate-950 rounded-lg text-xs font-black tracking-wide shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4 shrink-0" />
                  <span>{lang === 'en' ? 'ONBOARD STORE' : 'নতুন দোকান চালু করুন'}</span>
                </button>
              </form>
              
              <div className="p-3.5 bg-slate-900/50 rounded-lg border border-slate-800/60 mt-4">
                <span className="text-[10px] font-bold text-amber-500 uppercase block mb-1">
                  💡 {lang === 'en' ? 'How Multi-Tenancy works?' : 'মাল্টি-টেন্যান্ট যেভাবে কাজ করবে?'}
                </span>
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                  {lang === 'en' 
                    ? 'Entering a shop gives you administrative rights to look at that exact store POS Terminal, modify inventory items, and check sales records separately. Every onboarded shop operates under absolute data isolation.'
                    : 'দোকান যুক্ত করে তার অধীনে অপারেটর অ্যাকাউন্ট (ADMIN/SALESMAN) তৈরি করলেই তারা নিজেদের দোকানের সবকিছু সম্পূর্ণ আলাদা ও স্বাধীনভাবে ব্যবহার করতে পারবে, সিকিউরিটি লক থাকবে।'}
                </p>
              </div>
            </div>

            {/* List of Registered shops column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-black uppercase tracking-wide text-white">
                  {lang === 'en' ? 'Onboarded Client Stores Registry' : 'সবগুলো নিবন্ধিত শাখা/দোকানসমূহ'}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {stores.length} in network
                </span>
              </div>

              {stores.length === 0 ? (
                <div className="p-12 text-center bg-slate-950 border border-slate-800 rounded-xl">
                  <Building2 className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="text-xs font-bold text-slate-400">
                    {lang === 'en' ? 'No shops are registered yet' : 'এখনো কোনো দোকান যুক্ত করা হয়নি'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stores.map((store) => {
                    const isCurrentActive = activeStoreId === store.id;
                    return (
                      <div 
                        key={store.id} 
                        className={`p-5 rounded-xl border transition ${
                          isCurrentActive 
                            ? 'bg-gradient-to-tr from-slate-950 to-slate-900/90 border-amber-500/80 shadow-lg' 
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${isCurrentActive ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-900 text-slate-400'}`}>
                              <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-white uppercase tracking-tight">
                                {store.name}
                              </h4>
                              <span className="text-[10px] text-slate-500 font-mono">
                                ID: {store.id}
                              </span>
                            </div>
                          </div>
                          {isCurrentActive && (
                            <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black tracking-wider uppercase rounded-full select-none">
                              {lang === 'en' ? 'Viewing' : 'চলতি নির্বাচিত ভিউ'}
                            </span>
                          )}
                        </div>

                        <div className="mt-4 space-y-2 border-t border-slate-900/60 pt-3">
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            <span>{store.address || 'Dhaka, Bangladesh'}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                            <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                            <span>BIN: {store.binCode || 'N/A'}</span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-slate-650" />
                            <span>Registered: {new Date(store.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between gap-3">
                          <button
                            onClick={() => handleEnterStore(store)}
                            className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-[11px] font-black rounded-lg transition cursor-pointer flex items-center justify-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>{lang === 'en' ? 'ENTER WORKSPACE' : 'দোকান ড্যাশবোর্ডে যান'}</span>
                          </button>

                          <button
                            onClick={() => handleDeleteStore(store.id, store.name)}
                            className="p-1.5 bg-slate-900 hover:bg-rose-950/40 text-slate-500 hover:text-red-400 border border-slate-800 rounded-lg transition cursor-pointer"
                            title={lang === 'en' ? 'Delete Store' : 'দোকান মুছে ফেলুন'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: TEAM OPERATORS & CREDENTIAL LOGISTICS */}
        {currentTab === 'operators' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Create Operator Form */}
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <UserPlus className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-black uppercase text-white tracking-wide">
                  {lang === 'en' ? 'Create Store Access ID' : 'নতুন অপারেটর অ্যাকাউন্ট খুলুন'}
                </h3>
              </div>

              {stores.length === 0 ? (
                <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 text-amber-400 text-[11px]">
                  {lang === 'en' 
                    ? 'Please register a Stationery Shop first in the previous tab before creating login profiles.' 
                    : 'দোকান তৈরি করার পূর্বে অ্যাক্সেস আইডি তৈরি করা যাবে না। দয়া করে পূর্বের ট্যাব থেকে দোকান যুক্ত করুন।'}
                </div>
              ) : (
                <form onSubmit={handleAddOperator} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      {lang === 'en' ? 'Select Station Store *' : 'দোকান নির্বাচন করুন *'}
                    </label>
                    <select
                      value={newOpStoreId}
                      onChange={(e) => setNewOpStoreId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-905 border border-slate-800 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                    >
                      {stores.map(s => (
                        <option value={s.id} key={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      {lang === 'en' ? "Operator's Full Name *" : 'কর্মীর পুরো নাম লিখুন *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Al-Amin Rahman"
                      value={newOpName}
                      onChange={(e) => setNewOpName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      {lang === 'en' ? 'Login Username *' : 'লগইন ইউজারনেম *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. alamin77"
                      value={newOpUsername}
                      onChange={(e) => setNewOpUsername(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      {lang === 'en' ? 'Access Password *' : 'পাসওয়ার্ড লিখুন *'}
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="e.g. min123"
                      value={newOpPassword}
                      onChange={(e) => setNewOpPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      {lang === 'en' ? 'Role / Clearance Level' : ' Clearance লেভেল (রোল)'}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setNewOpRole('ADMIN')}
                        className={`py-2 text-[11px] font-black rounded-lg border transition ${
                          newOpRole === 'ADMIN'
                            ? 'bg-indigo-650 text-white border-indigo-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-300'
                        }`}
                      >
                        {lang === 'en' ? 'STORE ADMIN' : 'স্টোর এডমিন'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewOpRole('SALESMAN')}
                        className={`py-2 text-[11px] font-black rounded-lg border transition ${
                          newOpRole === 'SALESMAN'
                            ? 'bg-indigo-650 text-white border-indigo-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-300'
                        }`}
                      >
                        {lang === 'en' ? 'SALESMAN' : 'বিক্রয় কর্মী'}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-450 disabled:bg-slate-800 text-slate-950 rounded-lg text-xs font-black tracking-wide shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4 shrink-0" />
                    <span>{lang === 'en' ? 'CREATE ACCESS PROFILE' : 'ক্লিয়ারেন্স আইডি বানান'}</span>
                  </button>
                </form>
              )}
            </div>

            {/* Operator Accounts List Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-black uppercase tracking-wide text-white">
                  {lang === 'en' ? 'Active Operators & clearance records' : 'অফিস কর্মী ও অ্যাক্টিভ ইউজার অ্যাকাউন্টের বিবরণ'}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {operators.length} users active
                </span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-md">
                <table className="w-full text-left font-mono border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400">
                      <th className="py-3 px-4 font-bold">{lang === 'en' ? 'FULL NAME' : 'কর্মীর নাম'}</th>
                      <th className="py-3 px-4 font-bold">{lang === 'en' ? 'LOGIN USERNAME' : 'ইউজারনেম'}</th>
                      <th className="py-3 px-4 font-bold">{lang === 'en' ? ' clearance ROLE' : 'অফিসার রোল'}</th>
                      <th className="py-3 px-4 font-bold">{lang === 'en' ? 'BRANCH ASSIGNED' : 'নিযুক্ত স্টোর'}</th>
                      <th className="py-3 px-4 font-bold text-center">{lang === 'en' ? 'ACTIONS' : 'অ্যাকশন'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operators.map((op) => {
                      const isSuper = op.role === 'SUPERADMIN';
                      return (
                        <tr key={op.id} className="border-b border-slate-900 hover:bg-slate-900/40 text-xs text-slate-300">
                          <td className="py-3 px-4 font-sans font-bold text-white">
                            {op.name}
                          </td>
                          <td className="py-3 px-4">
                            @{op.username}
                          </td>
                          <td className="py-3 px-4">
                            {isSuper ? (
                              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded text-[9px] font-bold">
                                SUPERADMIN
                              </span>
                            ) : op.role === 'ADMIN' ? (
                              <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded text-[9px] font-bold">
                                {lang === 'en' ? 'ADMIN' : 'এডমিন'}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[9px] font-bold">
                                {lang === 'en' ? 'SALESMAN' : 'বিক্রয় কর্মী'}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-sans font-medium text-slate-400">
                            {getStoreName(op.storeId)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isSuper ? (
                              <span className="text-[10px] text-slate-550 italic font-medium">
                                {lang === 'en' ? 'System Owner' : 'সিস্টেম মালিক'}
                              </span>
                            ) : (
                              <button
                                onClick={() => handleDeleteOperator(op.id, op.name)}
                                className="p-1 px-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 rounded transition cursor-pointer"
                              >
                                {lang === 'en' ? 'DELETE' : 'মুছুন'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Control Footer */}
      <footer className="py-6 mt-12 bg-slate-950 border-t border-slate-850 text-center text-[10px] text-slate-500 font-mono">
        <p>© 2026 Stationery CRM Network Ltd. | Built for Nabin Hasan Multi-Store Expansion.</p>
      </footer>
    </div>
  );
}
