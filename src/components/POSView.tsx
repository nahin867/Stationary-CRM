/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import {
  ShoppingCart,
  Search,
  Barcode,
  UserPlus,
  Trash2,
  Percent,
  TrendingUp,
  Printer,
  CheckCircle,
  FileText,
  Smartphone,
  ChevronRight,
  Calculator,
  Plus,
  Download
} from 'lucide-react';
import { translations, Language } from '../translations';
import { StationeryItem, CartItem, Customer, Sale, User } from '../types';

interface POSViewProps {
  items: StationeryItem[];
  customers: Customer[];
  user: User | null;
  lang: Language;
  onCheckout: (payload: {
    items: Array<{ itemId: string; quantity: number }>;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    paymentMethod: any;
    paidAmount: number;
    customerId?: string;
  }) => Promise<Sale>;
  onCreateCustomer: (name: string, phone: string) => Promise<Customer>;
}

export default function POSView({
  items,
  customers,
  user,
  lang,
  onCheckout,
  onCreateCustomer
}: POSViewProps) {
  const t = translations[lang];

  // Search autocomplete state
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<StationeryItem[]>([]);

  // Cart selection
  const [cart, setCart] = useState<CartItem[]>([]);

  // Linking customer profile
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [isNewCustModalOpen, setIsNewCustModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [custError, setCustError] = useState('');

  // Cart Adjustments math
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'bKash' | 'Nagad' | 'Rocket' | 'Due'>('Cash');
  const [paidAmount, setPaidAmount] = useState<number>(0);

  // Completed Invoice Popup
  const [lastInvoice, setLastInvoice] = useState<Sale | null>(null);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);

  // Filter suggestion lists on input change
  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    const clean = query.toLowerCase();
    const matches = items.filter(
      itm =>
        itm.qty > 0 && (
          itm.name.toLowerCase().includes(clean) ||
          itm.sku.toLowerCase().includes(clean) ||
          itm.brand.toLowerCase().includes(clean)
        )
    ).slice(0, 5);
    setSuggestions(matches);
  }, [query, items]);

  // Handle adding product selection to cart
  const addToCart = (item: StationeryItem) => {
    setCart(prev => {
      const match = prev.find(i => i.item.id === item.id);
      if (match) {
        if (match.quantity >= item.qty) return prev; // inventory ceiling
        return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { item, quantity: 1 }];
    });
    setQuery('');
    setSuggestions([]);
  };

  const updateCartQty = (itemId: string, newQty: number) => {
    const sItem = items.find(i => i.id === itemId);
    if (!sItem) return;

    if (newQty <= 0) {
      setCart(prev => prev.filter(i => i.item.id !== itemId));
      return;
    }

    if (newQty > sItem.qty) {
      newQty = sItem.qty; // stock bounds limit
    }

    setCart(prev => prev.map(i => i.item.id === itemId ? { ...i, quantity: newQty } : i));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.item.id !== itemId));
  };

  // Simulate laser scanner
  const simulateBarcodeScan = (skuCode: string) => {
    const item = items.find(i => i.sku === skuCode);
    if (!item) {
      alert(lang === 'en' ? 'SKU Code not match' : 'এই বারকোড দিয়ে কোনো পণ্য খুঁজে পাওয়া যায়নি');
      return;
    }
    if (item.qty <= 0) {
      alert(lang === 'en' ? 'Item is out of stock!' : 'পণ্যটির কোনো সচল স্টক নেই!');
      return;
    }
    addToCart(item);
  };

  // Dynamic cart calculations
  const subtotal = cart.reduce((acc, current) => acc + (current.item.sellingPrice * current.quantity), 0);
  const vat = Number((subtotal * 0.05).toFixed(2));
  
  let discountAmount = 0;
  if (discountType === 'percentage' && discountValue > 0) {
    discountAmount = Number(((subtotal + vat) * (discountValue / 100)).toFixed(2));
  } else if (discountType === 'fixed' && discountValue > 0) {
    discountAmount = discountValue;
  }

  const grandTotal = Math.max(0, Number((subtotal + vat - discountAmount).toFixed(2)));
  const dueAmount = paymentMethod === 'Due' ? Math.max(0, grandTotal - paidAmount) : 0;

  // Sync paid amount with cash if cash/mobil bank
  useEffect(() => {
    if (paymentMethod !== 'Due') {
      setPaidAmount(grandTotal);
    } else {
      setPaidAmount(0); // reset due paid slider initially
    }
  }, [paymentMethod, grandTotal]);

  // Handle billing payment trigger
  const handleCheckoutSubmit = async () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'Due' && !selectedCustomerId) {
      setCheckoutError(lang === 'en' ? 'Please link a Customer Profile for POS Credit orders.' : 'বাকিতে বিক্রয়ের জন্য ক্রেতা প্রোফাইল সিলেক্ট থাকা আবশ্যক।');
      return;
    }

    setCheckingOut(true);
    setCheckoutError('');

    const payload = {
      items: cart.map(i => ({ itemId: i.item.id, quantity: i.quantity })),
      discountType,
      discountValue,
      paymentMethod,
      paidAmount: Number(paidAmount),
      customerId: selectedCustomerId || undefined
    };

    try {
      const saleResult = await onCheckout(payload);
      setLastInvoice(saleResult);
      // Clear cart
      setCart([]);
      setSelectedCustomerId('');
      setDiscountValue(0);
      setPaymentMethod('Cash');
    } catch (err: any) {
      setCheckoutError(err?.message || 'Transaction post failed');
    } finally {
      setCheckingOut(false);
    }
  };

  const handleCreateCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) {
      setCustError('Fields required');
      return;
    }
    try {
      const response = await onCreateCustomer(newCustName, newCustPhone);
      setSelectedCustomerId(response.id);
      setIsNewCustModalOpen(false);
      setNewCustName('');
      setNewCustPhone('');
      setCustError('');
    } catch (err: any) {
      setCustError(err?.message || 'Error creating profile');
    }
  };

  // Trigger browser print window cleanly
  const triggerPrint = () => {
    window.print();
  };

  // Download Invoice as a professional PDF receipt
  const handleDownloadInvoice = (invoice: Sale) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Color definitions (Teal theme matching the app color scheme)
    const brandColor = [13, 148, 136]; // Teal #0d9488
    const darkSlate = [15, 23, 42];    // Slate #0f172a
    const grayText = [100, 116, 139];   // Slate #64748b
    const lightGray = [241, 245, 249];  // Slate 100

    // Main Header - Brand/Store Details
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('STATIONERY CRM SHOP', 20, 25);

    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Azampur Plaza, Uttara, Dhaka-1230', 20, 31);
    doc.text('BIN Code: 00983415-0103', 20, 36);

    // Right-aligned "Cash Memo" Title
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('RETAIL CASH MEMO', 135, 25);

    // Decorative Horizontal Rule
    doc.setDrawColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setLineWidth(0.8);
    doc.line(20, 42, 190, 42);

    // Information Grid block (using key-value pairs)
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.setFontSize(9.5);
    
    // Left column: Sale parameters
    doc.setFont('Helvetica', 'bold');
    doc.text('Invoice Meta Details', 20, 50);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Invoice No:  ${invoice.invoiceNo}`, 20, 56);
    doc.text(`Date & Time: ${new Date(invoice.createdAt).toLocaleString()}`, 20, 62);
    doc.text(`Issued By:   ${invoice.salesmanName}`, 20, 68);

    // Right column: Customer reference 
    doc.setFont('Helvetica', 'bold');
    doc.text('Customer Profile', 120, 50);
    doc.setFont('Helvetica', 'normal');
    if (invoice.customerName) {
      doc.text(`Client Name: ${invoice.customerName}`, 120, 56);
      doc.text(`Mobile No:   ${invoice.customerPhone}`, 120, 62);
    } else {
      doc.text('Registry: Walk-in Retail Customer', 120, 56);
    }

    // Prepare table boundaries
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.3);
    doc.line(20, 75, 190, 75);

    // Table Header
    doc.setFont('Helvetica', 'bold');
    doc.text('Item Description', 22, 81);
    doc.text('Qty', 115, 81);
    doc.text('Unit BDT', 135, 81);
    doc.text('Amount (BDT)', 162, 81);

    doc.line(20, 84, 190, 84);

    // Loop through individual sale items
    doc.setFont('Helvetica', 'normal');
    let offsetCursorY = 91;
    invoice.items.forEach((item, index) => {
      // Check if page overflows
      if (offsetCursorY > 260) {
        doc.addPage();
        offsetCursorY = 25;
      }

      // Safe character filtration to prevent PDF box render errors with Bengali script
      const asciiOnly = item.name.replace(/[^\x20-\x7E]/g, '').replace(/\s+/g, ' ').trim();
      const productLabel = asciiOnly || `Stationery Item #${index + 1}`;

      doc.text(productLabel, 22, offsetCursorY);
      doc.text(String(item.qty), 115, offsetCursorY);
      doc.text(`Tk ${item.sellingPrice.toFixed(2)}`, 135, offsetCursorY);
      doc.text(`Tk ${(item.sellingPrice * item.qty).toFixed(2)}`, 162, offsetCursorY);

      offsetCursorY += 8;
    });

    // Close invoice transaction details
    doc.line(20, offsetCursorY - 4, 190, offsetCursorY - 4);
    offsetCursorY += 4;

    // Financial calculations summaries
    doc.setFont('Helvetica', 'bold');
    doc.text('Cart Subtotal:', 115, offsetCursorY);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Tk ${invoice.subtotal.toFixed(2)}`, 162, offsetCursorY);
    offsetCursorY += 6;

    doc.setFont('Helvetica', 'bold');
    doc.text('Regulatory VAT (5%):', 115, offsetCursorY);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Tk ${invoice.vat.toFixed(2)}`, 162, offsetCursorY);
    offsetCursorY += 6;

    if (invoice.discountAmount > 0) {
      doc.setFont('Helvetica', 'bold');
      doc.text('Billing Discount:', 115, offsetCursorY);
      doc.setFont('Helvetica', 'normal');
      doc.text(`-Tk ${invoice.discountAmount.toFixed(2)}`, 162, offsetCursorY);
      offsetCursorY += 6;
    }

    doc.line(115, offsetCursorY - 3, 190, offsetCursorY - 3);
    offsetCursorY += 4;

    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.text('Grand Total:', 115, offsetCursorY);
    doc.text(`Tk ${invoice.grandTotal.toFixed(2)}`, 162, offsetCursorY);
    
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.setFont('Helvetica', 'normal');
    offsetCursorY += 6;

    doc.text(`Paid using (${invoice.paymentMethod}):`, 115, offsetCursorY);
    doc.text(`Tk ${invoice.paidAmount.toFixed(2)}`, 162, offsetCursorY);
    offsetCursorY += 6;

    if (invoice.dueAmount > 0) {
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(220, 38, 38); // Crimson red for due
      doc.text('Outstanding Due:', 115, offsetCursorY);
      doc.text(`Tk ${invoice.dueAmount.toFixed(2)}`, 162, offsetCursorY);
      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.setFont('Helvetica', 'normal');
      offsetCursorY += 6;
    }

    // Footer section Note
    offsetCursorY += 14;
    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.text('Thank you for shopping at our stationery store!', 105, offsetCursorY, { align: 'center' });
    
    offsetCursorY += 4;
    doc.setFontSize(7.5);
    doc.text('Billed securely by Stationery CRM Ltd.', 105, offsetCursorY, { align: 'center' });

    // Save/Download triggering
    doc.save(`invoice-${invoice.invoiceNo}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="no-print">
        <h1 className="text-2xl font-bold font-display text-teal-400 tracking-tight">
          {t.pointOfSale}
        </h1>
        <p className="text-xs text-slate-400 font-medium">
          {lang === 'en'
            ? 'Generate bill statements, auto tax computations, and receipt print sheets.'
            : 'ক্যাশ রিসিট মেমো প্রস্তুতকরণ, ভ্যাট হিসাব এবং সরাসরি প্রিন্টযোগ্য চালান প্রিন্ট।'}
        </p>
      </div>

      {/* POS WORKSPACE - TWO COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 no-print">
        
        {/* LEFT COLUMN: ITEM LOCATOR & SIMULATIONS (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Autocomplete Input Search */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800/85 shadow-md relative">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {lang === 'en' ? 'Item Search Lookup' : 'পণ্য খুঁজুন'}
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.searchBySku}
                id="input-pos-product-search"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-slate-950 transition"
              />
            </div>

            {/* Suggestions Box */}
            {suggestions.length > 0 && (
              <div className="absolute top-20 left-5 right-5 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-20 overflow-hidden divide-y divide-slate-800">
                {suggestions.map(sItem => (
                  <button
                    key={sItem.id}
                    onClick={() => addToCart(sItem)}
                    id={`pos-suggest-${sItem.id}`}
                    className="w-full flex items-center justify-between p-3.5 text-left text-xs text-slate-300 hover:bg-slate-800/80 transition"
                  >
                    <div>
                      <p className="font-bold text-white">{sItem.name}</p>
                      <p className="text-[10px] font-semibold text-slate-500 mt-0.5">
                        Brand: {sItem.brand} | SKU: {sItem.sku}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <span className="font-extrabold text-teal-400 font-mono">৳{sItem.sellingPrice}</span>
                      <span className="bg-slate-800 border border-slate-705 text-slate-400 px-2 py-0.5 rounded text-[10px] font-bold">
                        Stock: {sItem.qty}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Barcode simulate board (REQUIRED POS FEAT) */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800/85 shadow-md">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-1.5 select-none">
              <Barcode className="w-4 h-4 text-teal-400" />
              <span>{t.simulateScan}</span>
            </h4>
            <p className="text-[11px] text-slate-400 mb-4 leading-tight">
              {lang === 'en'
                ? 'No hand scanner? Tap barcode simulations of our popular seed stationery products to trigger instant cart additions.'
                : 'হাতে বারকোড রিডার নেই? সচল ডেমো পণ্যের বারকোডে ক্লিক করে লেজার স্ক্যানিং ট্রানজাকশন সিমুলেট করুন।'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {items.slice(0, 4).map(itm => (
                <button
                  key={itm.id}
                  onClick={() => simulateBarcodeScan(itm.sku)}
                  id={`pos-barcode-simulate-${itm.sku}`}
                  className="p-3 text-left border border-slate-800 hover:border-teal-500 hover:bg-teal-500/10 rounded-xl transition flex items-center justify-between group cursor-pointer"
                >
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-200 truncate">{itm.name.split(' (')[0]}</p>
                    <p className="text-[9px] font-semibold font-mono text-slate-500 uppercase mt-0.5 group-hover:text-teal-400">
                      📟 {itm.sku}
                    </p>
                  </div>
                  <Plus className="w-4 h-4 text-slate-500 group-hover:text-teal-400 flex-shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>

          {/* Table representing active Cart checkout items */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800/85 shadow-md overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
              <h4 className="text-sm font-bold font-display text-white flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-teal-400 animate-pulse" />
                <span>{t.cart}</span>
              </h4>
              <span className="px-2.5 py-0.5 bg-teal-500/10 text-teal-400 border border-teal-500/20 font-bold font-mono rounded-full text-xs">
                {cart.length} Items
              </span>
            </div>

            <div className="divide-y divide-slate-800/60 overflow-y-auto max-h-72 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs font-semibold leading-relaxed">
                  {t.emptyCart}
                </div>
              ) : (
                cart.map(cItem => (
                  <div key={cItem.item.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-850/30">
                    <div className="overflow-hidden flex-1">
                      <p className="text-xs font-bold text-white truncate">{cItem.item.name}</p>
                      <p className="text-[10px] font-semibold text-slate-400 font-mono uppercase mt-0.5">
                        ৳{cItem.item.sellingPrice} each | Available: {cItem.item.qty}
                      </p>
                    </div>

                    {/* Quantity selectors */}
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => updateCartQty(cItem.item.id, cItem.quantity - 1)}
                        id={`pos-cart-minus-${cItem.item.id}`}
                        className="w-6 h-6 flex items-center justify-center border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-teal-400 rounded text-xs font-extrabold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-7 text-center text-xs font-mono font-bold text-white bg-slate-950 py-1 border border-slate-850 rounded">
                        {cItem.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQty(cItem.item.id, cItem.quantity + 1)}
                        id={`pos-cart-plus-${cItem.item.id}`}
                        className="w-6 h-6 flex items-center justify-center border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-teal-400 rounded text-xs font-extrabold cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    {/* Total on this product */}
                    <div className="text-right w-24">
                      <p className="text-xs font-bold text-white font-mono">
                        ৳{(cItem.item.sellingPrice * cItem.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Delete item from cart */}
                    <button
                      onClick={() => removeFromCart(cItem.item.id)}
                      id={`pos-cart-del-${cItem.item.id}`}
                      className="p-1 px-1.5 text-slate-500 hover:text-rose-450 rounded cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LINK CUSTOMER PROFILE & PAYMENT MATHEMATICS (5 Columns) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Customer linking panel */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800/85 shadow-md">
            <div className="flex items-center justify-between mb-3 select-none">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t.selectCustomer}
              </label>
              <button
                onClick={() => setIsNewCustModalOpen(true)}
                id="btn-pos-add-customer-opener"
                className="text-xs text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'New Profile' : 'নতুন ক্রেতা'}</span>
              </button>
            </div>

            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              id="select-pos-customer"
              className="w-full px-3 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-slate-950 transition text-slate-300 font-semibold"
            >
              <option value="">{t.walkInCustomer}</option>
              {customers.map(c => (
                <option key={c.id} value={c.id} className="bg-slate-900">
                  {c.name} ({c.phone}) - {lang === 'en' ? `Dues: ৳${c.dues}` : `বকেয়া: ৳${c.dues}`}
                </option>
              ))}
            </select>
          </div>

          {/* Payment receipt computations breakdown */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800/85 shadow-md space-y-4 text-slate-300">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/60 pb-2">
              {lang === 'en' ? 'Receipt Calculations' : 'রশিদ হিসাব-নিকাশ'}
            </h4>

            {checkoutError && (
              <div className="bg-rose-500/10 text-rose-450 p-3 rounded-lg text-xs font-bold border border-rose-500/20">
                {checkoutError}
              </div>
            )}

            <div className="space-y-2.5 text-xs text-slate-300 font-sans">
              {/* Subtotal */}
              <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-lg font-medium border border-slate-850">
                <span>{t.subtotal}</span>
                <span className="font-bold text-white font-mono">৳{subtotal.toFixed(2)}</span>
              </div>

              {/* VAT */}
              <div className="flex justify-between items-center px-1">
                <span className="text-slate-400">{t.vat}</span>
                <span className="font-semibold text-white font-mono">৳{vat.toFixed(2)}</span>
              </div>

              {/* Discount selection block */}
              <div className="border-t border-b border-slate-800/50 py-3 my-2 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">{t.discount}</span>
                  <div className="inline-flex bg-slate-950 p-0.5 rounded-lg text-[10px] font-bold border border-slate-800">
                    <button
                      type="button"
                      onClick={() => { setDiscountType('fixed'); setDiscountValue(0); }}
                      className={`px-2 py-1 rounded-md transition cursor-pointer ${discountType === 'fixed' ? 'bg-slate-800 text-white' : 'text-slate-550'}`}
                    >
                      BDT (৳)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDiscountType('percentage'); setDiscountValue(0); }}
                      className={`px-2 py-1 rounded-md transition cursor-pointer ${discountType === 'percentage' ? 'bg-slate-800 text-white' : 'text-slate-550'}`}
                    >
                      Percent (%)
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    placeholder={discountType === 'percentage' ? 'e.g. 10%' : 'e.g. 50'}
                    value={discountValue || ''}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    id="input-pos-discount"
                    className="w-full px-3 py-1.5 text-xs font-semibold bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  {discountAmount > 0 && (
                    <span className="text-[10px] text-teal-400 font-bold bg-teal-500/10 border border-teal-500/20 px-2 py-1 rounded-lg">
                      -৳{discountAmount.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>

              {/* Grand Total */}
              <div className="flex justify-between items-center text-sm font-bold text-white border-b border-slate-800/50 pb-3">
                <span>{t.grandTotal}</span>
                <span className="font-mono text-base font-extrabold text-teal-400">৳{grandTotal.toFixed(2)}</span>
              </div>

              {/* Payment selection modes */}
              <div className="space-y-2">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.paymentMethod}</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['Cash', 'bKash', 'Nagad', 'Due'].map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMethod(mode as any)}
                      id={`btn-pay-mode-${mode.toLowerCase()}`}
                      className={`py-2 text-[11px] font-extrabold rounded-xl text-center border transition cursor-pointer
                        ${paymentMethod === mode
                          ? 'bg-teal-600 border-teal-600 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-teal-400'
                        }
                      `}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due payments sliders */}
              {paymentMethod === 'Due' && (
                <div className="bg-rose-500/5 p-3.5 rounded-xl border border-rose-500/20 space-y-2.5 animate-fade-in text-rose-300">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-rose-400">{lang === 'en' ? 'Partial Cash Paid now' : 'এখন নগদ পরিশোধ'}</span>
                    <span className="font-bold text-rose-400 font-mono">৳{paidAmount}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={grandTotal}
                    value={paidAmount || ''}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    id="input-pos-paid-amount"
                    className="w-full px-3 py-1.5 text-xs font-semibold bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                    placeholder="BDT ৳"
                  />
                  <div className="flex items-center justify-between text-[10px] text-rose-400 font-bold border-t border-rose-500/25 pt-2">
                    <span>{t.dueAmount}</span>
                    <span>৳{dueAmount.toFixed(0)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Complete checkout button */}
            <button
              onClick={handleCheckoutSubmit}
              disabled={cart.length === 0 || checkingOut}
              id="btn-pos-checkout-submit"
              className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-extrabold shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{checkingOut ? t.loading : t.checkout}</span>
            </button>
          </div>
        </div>
      </div>

      {/* RETAIL CASH MEMO PRINT PREVIEW DIALOGUE MODULE (SHOWN AFTER CHECKOUT OR RE-PRINT) */}
      {(lastInvoice || lastInvoice === undefined) && lastInvoice && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-slate-205">
            
            {/* Action Bar (Top Popup, hidden during browser system print) */}
            <div className="px-5 py-4 border-b border-on-print border-slate-150 bg-slate-50 flex items-center justify-between no-print select-none">
              <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-600" />
                <span>{t.invoiceReceipt}</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={triggerPrint}
                  id="btn-invoice-print-trigger"
                  className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-[11px] font-bold shadow-md hover:bg-teal-500 hover:text-white flex items-center gap-1 cursor-pointer transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t.posPrint}</span>
                </button>
                <button
                  onClick={() => setLastInvoice(null)}
                  id="btn-invoice-done-close"
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold hover:bg-slate-300 cursor-pointer transition"
                >
                  {t.posDone}
                </button>
              </div>
            </div>

            {/* RAW PHYSICAL CASH MEMO RECEIPT SHEET (80MM ROLL DESIGN) */}
            <div className="p-6 overflow-y-auto max-h-[66vh] bg-white print-card text-xs text-slate-850 select-all font-mono">
              <div className="text-center space-y-1">
                <h2 className="text-base font-extrabold font-display tracking-tight text-slate-950 uppercase">
                  Stationery CRM Shop
                </h2>
                <p className="text-[10px] text-slate-500 font-medium font-sans">
                  Azampur Plaza, Uttara, Dhaka-1230
                </p>
                <p className="text-[9px] text-slate-400 font-mono tracking-widest">{t.vatNumber}</p>
                <div className="border-b border-dashed border-slate-300 py-1" />
              </div>

              {/* Meta references */}
              <div className="py-2.5 space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span>{t.invoiceNo}:</span>
                  <span className="font-bold text-slate-900">{lastInvoice.invoiceNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.date}:</span>
                  <span>{new Date(lastInvoice.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.salesman}:</span>
                  <span>{lastInvoice.salesmanName}</span>
                </div>
                {lastInvoice.customerName && (
                  <div className="flex justify-between border-t border-dashed border-slate-100 pt-1.5 mt-1">
                    <span>{lang === 'en' ? 'Customer Profile' : 'ক্রেতার নাম'}:</span>
                    <span className="font-bold">{lastInvoice.customerName} ({lastInvoice.customerPhone})</span>
                  </div>
                )}
              </div>

              <div className="border-b border-dashed border-slate-300 py-1" />

              {/* Invoice lines */}
              <table className="w-full text-left font-mono text-[10px] mt-2 select-text">
                <thead>
                  <tr className="border-b border-slate-200 font-extrabold pb-1">
                    <th className="py-1">Items Description</th>
                    <th className="text-center font-bold">Qty</th>
                    <th className="text-right font-bold">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lastInvoice.items.map((li, idx) => (
                    <tr key={idx} className="py-1">
                      <td className="py-1.5 pr-2">
                        <span className="font-semibold text-slate-900">{li.name}</span>
                      </td>
                      <td className="text-center py-1.5 font-bold">{li.qty}</td>
                      <td className="text-right py-1.5 font-bold">
                        ৳{(li.sellingPrice * li.qty).toFixed(0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-b border-dashed border-slate-300 py-1.5" />

              {/* Totals math */}
              <div className="py-2.5 space-y-1 text-[10px] font-mono leading-relaxed select-none text-slate-800">
                <div className="flex justify-between font-medium">
                  <span>{t.subtotal}:</span>
                  <span>৳{lastInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.vat}:</span>
                  <span>৳{lastInvoice.vat.toFixed(2)}</span>
                </div>
                {lastInvoice.discountAmount > 0 && (
                  <div className="flex justify-between text-teal-700 font-bold">
                    <span>{t.discount}:</span>
                    <span>-৳{lastInvoice.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[11px] font-black border-t border-slate-200 pt-1 text-slate-950">
                  <span>{t.grandTotal}:</span>
                  <span>৳{lastInvoice.grandTotal.toFixed(2)}</span>
                </div>
                
                <div className="border-t border-dashed border-slate-100 pt-2 flex justify-between font-medium text-[10px]">
                  <span>{t.paymentMethod} ({lastInvoice.paymentMethod}):</span>
                  <span className="font-bold">৳{lastInvoice.paidAmount.toFixed(2)}</span>
                </div>

                {lastInvoice.dueAmount > 0 && (
                  <div className="flex justify-between text-rose-600 font-bold text-[10px]">
                    <span>{t.dueAmount}:</span>
                    <span>৳{lastInvoice.dueAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="border-b border-dashed border-slate-300 py-1.5" />

              <div className="text-center space-y-1.5 py-2.5 select-none font-sans text-[10px]">
                <p className="font-extrabold text-slate-700">{t.thankYou}</p>
                <p className="text-[8px] text-slate-400 font-mono">Billed by Stationery CRM Ltd.</p>
              </div>
            </div>

            {/* Bottom Download Bar (hidden on browser print) */}
            <div className="px-5 py-3 border-t border-slate-150 bg-slate-50 flex items-center justify-between no-print select-none">
              <span className="text-[10px] text-slate-500 font-medium">
                {lang === 'en' ? 'Need a digital copy of transaction?' : 'ডিজিটাল কপি ডাউনলোড করতে চান?'}
              </span>
              <button
                onClick={() => handleDownloadInvoice(lastInvoice)}
                id="btn-invoice-download-trigger"
                className="px-2.5 py-1.5 bg-teal-600 text-white rounded-lg text-[10px] font-bold shadow-xs hover:bg-teal-500 hover:text-white flex items-center gap-1 cursor-pointer transition active:scale-95"
              >
                <Download className="w-3 h-3" />
                <span>{lang === 'en' ? 'Download PDF' : 'ডাউনলোড পিডিএফ'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW CUSTOMER MODAL */}
      {isNewCustModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-800 font-sans">
            <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-teal-400" />
                <span>{t.addCustomer}</span>
              </h3>
              <button
                onClick={() => setIsNewCustModalOpen(false)}
                className="text-slate-400 hover:text-teal-400 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomerSubmit} className="p-5 space-y-4">
              {custError && (
                <div className="bg-rose-500/10 text-rose-400 p-2.5 text-xs rounded border border-rose-500/20 font-semibold shadow-xs">
                  {custError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Customer Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Robin Mahmud"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  {t.phone} <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="e.g. 01712xxxxxx"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-805 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNewCustModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-800 text-slate-350 hover:bg-slate-800 rounded-lg text-xs font-semibold cursor-pointer transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  id="btn-pos-add-customer-submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold cursor-pointer transition shadow-md"
                >
                  {t.add}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
