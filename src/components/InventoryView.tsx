/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  Sliders,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  PlusCircle,
  AlertCircle
} from 'lucide-react';
import { translations, Language } from '../translations';
import { StationeryItem, User } from '../types';

interface InventoryViewProps {
  items: StationeryItem[];
  lang: Language;
  user: User | null;
  onAddItem: (item: Omit<StationeryItem, 'id'>) => Promise<void>;
  onUpdateItem: (id: string, item: Partial<StationeryItem>) => Promise<void>;
  onQuickAddStock: (id: string, addedQty: number) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
}

export default function InventoryView({
  items,
  lang,
  user,
  onAddItem,
  onUpdateItem,
  onQuickAddStock,
  onDeleteItem
}: InventoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Modals Toggles State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StationeryItem | null>(null);
  
  // Add/Edit Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Pens & Pencils (কলম ও পেন্সিল)');
  const [brand, setBrand] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [qty, setQty] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [sku, setSku] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');

  // Quick Stock state mapped by itemId
  const [quickStockValue, setQuickStockValue] = useState<{ [id: string]: string }>({});

  const t = translations[lang];
  const isAdmin = user?.role === 'ADMIN';

  // Sample Categories list to choose from (English & Bengali translation indicators)
  const categoriesList = [
    'Pens & Pencils (কলম ও পেন্সিল)',
    'Notebooks & Diaries (খাতা ও ডায়েরি)',
    'Files & Folders (ফাইল ও ফোল্ডার)',
    'Art & Craft (আর্ট ও ক্রাফট)',
    'Calculators & Electronics (ক্যালকুলেটর)',
    'Office Supplies (অফিস সাপ্লাই)',
    'Other (অন্যান্য)'
  ];

  // Filters logic
  const filteredItems = items.filter(itm => {
    const matchesSearch =
      itm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itm.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itm.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? itm.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setCategory('Pens & Pencils (কলম ও পেন্সিল)');
    setBrand('');
    setCostPrice('');
    setSellingPrice('');
    setQty('');
    setLowStockThreshold('10');
    setSku('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: StationeryItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setBrand(item.brand);
    setCostPrice(String(item.costPrice));
    setSellingPrice(String(item.sellingPrice));
    setQty(String(item.qty));
    setLowStockThreshold(String(item.lowStockThreshold));
    setSku(item.sku);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !costPrice || !sellingPrice || !qty) {
      setErrorMsg(lang === 'en' ? 'Please fill in all mandatory fields' : 'সবগুলো প্রদেয় ঘর পূরণ করুন');
      return;
    }

    const payload = {
      name,
      category,
      brand: brand || 'N/A',
      costPrice: Number(costPrice),
      sellingPrice: Number(sellingPrice),
      qty: Number(qty),
      lowStockThreshold: Number(lowStockThreshold || 5),
      sku: sku || ('SKU' + Math.floor(Math.random() * 10000000))
    };

    try {
      if (editingItem) {
        await onUpdateItem(editingItem.id, payload);
      } else {
        await onAddItem(payload);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err?.message || (lang === 'en' ? 'Failed saving item' : 'পণ্য সংরক্ষণ করা সম্ভব হয়নি'));
    }
  };

  const handleQuickStockClick = async (itemId: string) => {
    const val = quickStockValue[itemId];
    if (!val || isNaN(Number(val))) return;

    await onQuickAddStock(itemId, Number(val));
    setQuickStockValue(prev => ({ ...prev, [itemId]: '' }));
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-teal-400 tracking-tight">
            {t.inventory}
          </h1>
          <p className="text-xs text-slate-400 font-medium font-sans">
            {lang === 'en'
              ? 'Catalog tracking, barcode matching, and threshold alerts.'
              : 'স্টেশনারি পণ্য তালিকা, ক্রোম কোড ট্র্যাকিং এবং সামগ্রিক স্টক স্তরের বিবরণ।'}
          </p>
        </div>
        
        {isAdmin && (
          <button
            onClick={openAddModal}
            id="btn-inventory-add-opener"
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addNewItem}</span>
          </button>
        )}
      </div>

      {/* FILTER & SEARCH PANEL */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800/85 shadow-md flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder={lang === 'en' ? 'Search by name, brand, or SKU Barcode...' : 'পণ্যের নাম, ব্র্যান্ড বা বারকোড দিয়ে খুঁজুন...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="input-inventory-search"
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-slate-950 transition"
          />
        </div>

        {/* Category chooser */}
        <div className="w-full md:w-64">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            id="select-inventory-category-filter"
            className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-slate-950 transition font-semibold text-slate-300"
          >
            <option value="">{lang === 'en' ? 'All Categories (সব ক্যাটাগরি)' : 'সব ক্যাটাগরি'}</option>
            {categoriesList.map((cat, idx) => (
              <option key={idx} value={cat} className="bg-slate-900">{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* INVENTORY CATALOG TABLE */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800/85 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800/80 uppercase text-[10px] font-bold tracking-wider select-none">
              <tr>
                <th className="px-6 py-4">{t.itemName}</th>
                <th className="px-4 py-4">{t.category}</th>
                <th className="px-4 py-4 text-center">{t.brand}</th>
                {isAdmin && <th className="px-4 py-4 text-right">{t.costPrice}</th>}
                <th className="px-4 py-4 text-right">{t.sellingPrice}</th>
                <th className="px-6 py-4 text-center">{t.currentStock}</th>
                <th className="px-4 py-4 text-center">{t.quickAddStock}</th>
                {isAdmin && <th className="px-6 py-4 text-right">{t.actions}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500 font-semibold">
                    {lang === 'en' ? 'No stationery items found matches your query.' : 'কোন স্টেশনারি পণ্য খুঁজে পাওয়া যায়নি।'}
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const isLow = item.qty <= item.lowStockThreshold;
                  return (
                    <tr key={item.id} className="hover:bg-slate-850/20 transition">
                      {/* Name / SKU */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-[13px]">{item.name}</span>
                          <span className="text-[10px] font-bold text-teal-400 font-mono tracking-wider mt-1 uppercase bg-slate-950 border border-slate-850 px-2 py-0.5 rounded w-fit">
                            {item.sku}
                          </span>
                        </div>
                      </td>

                      {/* Category wrapper */}
                      <td className="px-4 py-4 max-w-[150px] truncate text-slate-450 font-medium">
                        {item.category.split(' (')[0]}
                      </td>

                      {/* Brand */}
                      <td className="px-4 py-4 text-center text-slate-400 font-semibold font-display">
                        {item.brand}
                      </td>

                      {/* Cost price - Admin Only */}
                      {isAdmin && (
                        <td className="px-4 py-4 text-right font-medium font-mono text-slate-400">
                          ৳{item.costPrice.toFixed(2)}
                        </td>
                      )}

                      {/* Selling price */}
                      <td className="px-4 py-4 text-right font-bold font-mono text-teal-400">
                        ৳{item.sellingPrice.toFixed(2)}
                      </td>

                      {/* Current quantity with alert states */}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg font-mono border
                            ${isLow
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-950/20 shadow-xs'
                              : 'bg-teal-500/10 text-teal-300 border-teal-500/20 shadow-teal-950/20 shadow-xs'
                            }`}
                          >
                            {item.qty} Qty
                          </span>
                          {isLow && (
                            <span className="text-[8px] font-extrabold text-rose-400 uppercase mt-1 animate-pulse tracking-wide">
                              Low Warning
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Quick stock update (Open to both admin & salesman roles) */}
                      <td className="px-4 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <input
                            type="number"
                            min="1"
                            placeholder="+ Qty"
                            value={quickStockValue[item.id] || ''}
                            onChange={(e) => setQuickStockValue(prev => ({ ...prev, [item.id]: e.target.value }))}
                            id={`input-quick-add-${item.id}`}
                            className="w-16 px-1.5 py-1 text-center bg-slate-950 border border-slate-800 rounded font-bold font-mono text-white placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-teal-500"
                          />
                          <button
                            onClick={() => handleQuickStockClick(item.id)}
                            id={`btn-quick-add-submit-${item.id}`}
                            className="p-1 px-1.5 bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-600 hover:text-white rounded text-xs transition cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* CRUD Actions - Admin Only */}
                      {isAdmin && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(item)}
                              id={`btn-edit-item-${item.id}`}
                              className="p-1.5 text-slate-400 bg-slate-950 hover:bg-indigo-500/10 hover:text-indigo-400 hover:border-indigo-500/20 rounded-lg border border-slate-800 transition duration-150 cursor-pointer"
                              title={t.edit}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(t.deleteConfirm)) {
                                  onDeleteItem(item.id);
                                }
                              }}
                              id={`btn-delete-item-${item.id}`}
                              className="p-1.5 text-slate-400 bg-slate-950 hover:bg-rose-500/10 hover:text-rose-450 hover:border-rose-500/20 rounded-lg border border-slate-800 transition duration-150 cursor-pointer"
                              title={t.delete}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT ITEM SHEET MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-800 font-sans text-slate-350">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/65">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-teal-400" />
                <span>{editingItem ? t.editItem : t.addNewItem}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-teal-400 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="bg-rose-500/10 text-rose-400 p-3 rounded-lg text-xs border border-rose-500/20 font-semibold shadow-xs">
                  {errorMsg}
                </div>
              )}

              {/* Item Name */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  {t.itemName} <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={lang === 'en' ? 'e.g. Matador Pinpoint Blue (নীল কলম)' : 'যেমন: ম্যাটাডোর নীল কলম'}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              {/* Category & Brand rows */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    {t.category}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-300 font-semibold"
                  >
                    {categoriesList.map((cat, idx) => (
                      <option key={idx} value={cat} className="bg-slate-900 text-slate-250">{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    {t.brand}
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Matador, Fresh"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Price rows */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    {t.costPrice} <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="25.00"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    {t.sellingPrice} <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="35.00"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              {/* Stocks/SKU values */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    {lang === 'en' ? 'Initial Stock' : 'সচল স্টক পরিমাণ'} <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    disabled={!!editingItem} // restrict tampering directly, prefer adjusting for logs
                    placeholder="100"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono disabled:opacity-40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    {t.lowStockThreshold}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    placeholder="10"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  {t.sku} (Barcode Scanner Code)
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. 893456701"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono"
                />
              </div>

              {/* Form Buttons footer */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end gap-3 bg-slate-955 p-4 -mx-6 -mb-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-800 text-slate-350 hover:bg-slate-800 rounded-xl text-xs font-semibold cursor-pointer transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  id="btn-inventory-save-submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
