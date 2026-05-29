/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Key, Globe, LogIn } from 'lucide-react';
import { api } from '../api';
import { translations, Language } from '../translations';
import { User } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (token: string, user: User) => void;
  lang: Language;
  setLang: (lang: Language) => void;
}

export default function LoginScreen({ onLoginSuccess, lang, setLang }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const t = translations[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError(lang === 'en' ? 'Inputs cannot be empty' : 'ইউজারনেম এবং পাসওয়ার্ড পূরণ করুন');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.login(username, password);
      localStorage.setItem('token', response.token);
      onLoginSuccess(response.token, response.user);
    } catch (err: any) {
      setError(err?.message || (lang === 'en' ? 'Inconsistent login match' : 'ভুল ইউজারনেম বা পাসওয়ার্ড'));
    } finally {
      setLoading(false);
    }
  };

  const handleShortcutLogin = (userType: 'admin' | 'sales') => {
    setUsername(userType);
    setPassword('123');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Language Switch Bar */}
      <div className="absolute top-4 right-4 z-10 font-sans">
        <button
          onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
          id="btn-lang-toggle-login"
          className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg shadow-md border border-slate-850 text-sm font-semibold hover:bg-slate-800 text-slate-200 transition cursor-pointer"
        >
          <Globe className="w-4 h-4 text-teal-400 animate-pulse" />
          <span>{t.language}</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-gradient-to-tr from-teal-600 to-emerald-500 p-3 rounded-2xl shadow-lg shadow-teal-500/10 border border-teal-500/20">
            <Shield className="w-10 h-10 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold font-display tracking-tight text-white">
          {lang === 'en' ? 'Stationery CRM Portal' : 'স্টেশনারি সিআরএম পোর্টাল'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          {lang === 'en' ? 'System Management' : 'সিস্টেম ম্যানেজমেন্ট'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 py-8 px-4 shadow-2xl rounded-2xl border border-slate-850 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-500/10 text-rose-400 p-3 rounded-lg text-sm border border-rose-500/20 font-medium animate-pulse">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-300">
                {lang === 'en' ? 'Username' : 'ইউজারনেম (username)'}
              </label>
              <div className="mt-1 relative rounded-md shadow-xs">
                <input
                  type="text"
                  required
                  id="login-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-955 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-slate-950 transition font-medium"
                  placeholder={lang === 'en' ? 'admin or sales' : 'admin অথবা sales লিখুন'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300">
                {lang === 'en' ? 'Password' : 'পাসওয়ার্ড (Password)'}
              </label>
              <div className="mt-1 relative rounded-md shadow-xs">
                <input
                  type="password"
                  required
                  id="login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-955 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-slate-950 transition font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                id="btn-login-submit"
                className="w-full flex justify-center py-2.5 px-4 rounded-lg bg-teal-600 text-white text-sm font-bold shadow-md hover:bg-teal-500 focus:ring-2 focus:ring-teal-500 disabled:opacity-50 transition cursor-pointer"
              >
                {loading ? t.loading : (lang === 'en' ? 'Secure Log In' : 'লগইন করুন')}
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials Panel */}
          <div className="mt-8 border-t border-slate-800/80 pt-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center mb-4">
              {lang === 'en' ? 'Quick Access (Testing Accounts)' : 'দ্রুত টেস্ট লগইন অ্যাকাউন্ট'}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleShortcutLogin('admin')}
                id="btn-quick-admin"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition cursor-pointer"
              >
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                <span>{lang === 'en' ? 'Admin Creds' : 'এডমিন'}</span>
              </button>
              <button
                onClick={() => handleShortcutLogin('sales')}
                id="btn-quick-salesman"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/20 hover:bg-teal-500/20 transition cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-teal-400" />
                <span>{lang === 'en' ? 'Salesman Creds' : 'বিক্রেতা'}</span>
              </button>
            </div>
            <div className="text-center mt-3 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              {lang === 'en' ? 'Pre-configured PIN: 123' : 'উভয় অ্যাকাউন্টের পাসওয়ার্ড: 123'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
