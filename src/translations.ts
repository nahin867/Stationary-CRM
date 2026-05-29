/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TranslationSet {
  // Navigation
  dashboard: string;
  inventory: string;
  pos: string;
  customers: string;
  suppliers: string;
  dueLedger: string;
  expenses: string;
  returnsDamages: string;
  logout: string;
  welcome: string;
  adminRole: string;
  salesmanRole: string;
  language: string;

  // General Buttons/Terms
  add: string;
  edit: string;
  delete: string;
  save: string;
  cancel: string;
  actions: string;
  search: string;
  submit: string;
  phone: string;
  email: string;
  date: string;
  amount: string;
  description: string;
  status: string;
  total: string;
  qty: string;
  category: string;
  brand: string;
  notAvailable: string;
  success: string;
  error: string;
  loading: string;

  // Dashboard View
  salesToday: string;
  salesMonth: string;
  profitToday: string;
  profitMonth: string;
  expensesToday: string;
  expensesMonth: string;
  outstandingDues: string;
  salesVsExpenses: string;
  salesTrend: string;
  topSelling: string;
  itemName: string;
  qtySold: string;
  revenue: string;
  lowStockAlerts: string;
  lowStockDesc: string;
  currentStock: string;
  threshold: string;
  quickAddStock: string;

  // Inventory View
  sku: string;
  costPrice: string;
  sellingPrice: string;
  lowStockThreshold: string;
  addNewItem: string;
  editItem: string;
  deleteConfirm: string;

  // POS View
  pointOfSale: string;
  searchBySku: string;
  simulateScan: string;
  cart: string;
  emptyCart: string;
  subtotal: string;
  vat: string;
  discount: string;
  grandTotal: string;
  paymentMethod: string;
  paidAmount: string;
  dueAmount: string;
  selectCustomer: string;
  walkInCustomer: string;
  checkout: string;
  invoiceReceipt: string;
  invoiceNo: string;
  salesman: string;
  vatNumber: string;
  thankYou: string;
  posPrint: string;
  posDone: string;

  // Customers & Suppliers
  customerList: string;
  addCustomer: string;
  totalPurchases: string;
  customerDues: string;
  supplierList: string;
  addSupplier: string;
  companyName: string;
  contactName: string;
  paySupplier: string;
  paymentHistory: string;

  // Due Ledger (বাকি খাতা)
  dueTransactions: string;
  duePayment: string;
  payOutstanding: string;
  partialPayment: string;
  fullPayment: string;
  payoutDone: string;

  // Expense tracker
  shopExpenses: string;
  addExpense: string;
  rent: string;
  electricity: string;
  salary: string;
  transport: string;
  other: string;

  // Returns & Damages
  adjustments: string;
  logReturnDamage: string;
  returnTerm: string;
  damageTerm: string;
  logAdjustment: string;
  reason: string;
  lossValue: string;
  returnExplanation: string;
  damageExplanation: string;
}

export type Language = 'en' | 'bn';

export const translations: Record<Language, TranslationSet> = {
  en: {
    dashboard: 'Dashboard',
    inventory: 'Inventory',
    pos: 'POS Billing',
    customers: 'Customers',
    suppliers: 'Suppliers',
    dueLedger: 'Due Ledger (বাকি খাতা)',
    expenses: 'Expenses',
    returnsDamages: 'Returns & Damages',
    logout: 'Log Out',
    welcome: 'Welcome back',
    adminRole: 'Administrator',
    salesmanRole: 'Sales Executive',
    language: 'বাংলা',

    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    actions: 'Actions',
    search: 'Search...',
    submit: 'Submit',
    phone: 'Phone Number',
    email: 'Email',
    date: 'Date',
    amount: 'Amount (BDT)',
    description: 'Description',
    status: 'Status',
    total: 'Total',
    qty: 'Qty',
    category: 'Category',
    brand: 'Brand',
    notAvailable: 'N/A',
    success: 'Successfully completed!',
    error: 'Something went wrong',
    loading: 'Loading data...',

    salesToday: "Today's Sales",
    salesMonth: 'Monthly Sales',
    profitToday: "Today's Net Profit",
    profitMonth: 'Monthly Net Profit',
    expensesToday: "Today's Expenses",
    expensesMonth: 'Monthly Expenses',
    outstandingDues: 'Total Outstanding Dues',
    salesVsExpenses: 'Monthly Sales vs Expenses & Profit Analytics',
    salesTrend: 'Sales Trend',
    topSelling: 'Top Selling Stationery Items',
    itemName: 'Item Name',
    qtySold: 'Qty Sold',
    revenue: 'Revenue (BDT)',
    lowStockAlerts: 'Low Stock Alert Panel',
    lowStockDesc: 'The following stationery items are running low. Please restock immediately.',
    currentStock: 'Current Stock',
    threshold: 'Threshold (Qty)',
    quickAddStock: 'Quick Stock Update',

    sku: 'Barcode / SKU',
    costPrice: 'Cost Price (BDT)',
    sellingPrice: 'Selling Price (BDT)',
    lowStockThreshold: 'Low Stock Level',
    addNewItem: 'Add New Stationery Item',
    editItem: 'Edit Stationery Item',
    deleteConfirm: 'Are you sure you want to delete this stationery item?',

    pointOfSale: 'Point of Sale Retail Terminal',
    searchBySku: 'Search items by Name or scan Barcode (SKU)...',
    simulateScan: 'Simulate Barcode Scan',
    cart: 'Active Invoice Cart',
    emptyCart: 'Cart is empty. Put items here using search or simulated barcode scanner.',
    subtotal: 'Cart Subtotal',
    vat: 'Regulatory VAT (5%)',
    discount: 'Billing Discount',
    grandTotal: 'Grand Total',
    paymentMethod: 'Payment Mode',
    paidAmount: 'Paid Amount',
    dueAmount: 'Pending Credit (Due)',
    selectCustomer: 'Link Customer Profile',
    walkInCustomer: 'Walk-In Customer (No Profile)',
    checkout: 'Post & Print Invoice',
    invoiceReceipt: 'Retail Cash Memo / Invoice',
    invoiceNo: 'Invoice No',
    salesman: 'Billed By',
    vatNumber: 'BIN: 00983415-0103',
    thankYou: 'Thank you for shopping at our stationery store!',
    posPrint: 'Print Invoice Receipt',
    posDone: 'Done / Clear Terminal',

    customerList: 'Customer Accounts Directory',
    addCustomer: 'Create Customer Profile',
    totalPurchases: 'Total Purchases (BDT)',
    customerDues: 'Outstanding Dues (BDT)',
    supplierList: 'Suppliers Directory',
    addSupplier: 'Register Supplier Profile',
    companyName: 'Company Name',
    contactName: 'Contact Person',
    paySupplier: 'Log Supplier Payment Outflow',
    paymentHistory: 'Supplier Payment History Logs',

    dueTransactions: 'Outstanding Due Ledger Accounts',
    duePayment: 'Receive Outstanding Due Amount',
    payOutstanding: 'Pay Dues',
    partialPayment: 'Partial Paid Amount',
    fullPayment: 'Full Outstanding Amount',
    payoutDone: 'Log Received Due Amount',

    shopExpenses: 'Operational Expense Registry',
    addExpense: 'Log Office/Shop Expense',
    rent: 'Shop Rent',
    electricity: 'Electricity & Utility Bills',
    salary: 'Employee Salary',
    transport: 'Freight & Transportation',
    other: 'Other/General Overheads',

    adjustments: 'Stock Return & Damage Controls',
    logReturnDamage: 'Record Damaged Goods or Retails Returns',
    returnTerm: 'Retail Customer Return',
    damageTerm: 'Damaged / Expired / Loss Log',
    logAdjustment: 'Log Inventory Stock Adjustment',
    reason: 'Condition / Justification',
    lossValue: 'Loss Value incurred (Cost Price)',
    returnExplanation: 'Product returns add quantities back into physical stock without financial penalty.',
    damageExplanation: 'Damage events deduct quantities from physical stock and register their Cost Prices as straight losses.'
  },
  bn: {
    dashboard: 'ড্যাশবোর্ড',
    inventory: 'ইনভেন্টরি স্টকিং',
    pos: 'ক্যাশ মেমো (POS)',
    customers: 'ক্রেতা প্রোফাইল',
    suppliers: 'পাইকারি বিক্রেতা',
    dueLedger: 'বাকি খাতা (লেজার)',
    expenses: 'দোকান খরচ',
    returnsDamages: 'ফেরত ও ক্ষতি',
    logout: 'লগ আউট করুন',
    welcome: 'স্বাগতম',
    adminRole: 'প্রধান অ্যাডমিন',
    salesmanRole: 'বিক্রয় কর্মী',
    language: 'English',

    add: 'যুক্ত করুন',
    edit: 'সম্পাদনা',
    delete: 'মুছে ফেলুন',
    save: 'সংরক্ষণ',
    cancel: 'বাতিল',
    actions: 'অ্যাকশন',
    search: 'খুঁজুন...',
    submit: 'জমা দিন',
    phone: 'মোবাইল নাম্বার',
    email: 'ইমেইল',
    date: 'তারিখ',
    amount: 'টাকা (বিডিটি)',
    description: 'বিস্তারিত বিবরণ',
    status: 'অবস্থা',
    total: 'মোট',
    qty: 'পরিমাণ',
    category: 'ক্যাটাগরি',
    brand: 'ব্র্যান্ড',
    notAvailable: 'প্রযোজ্য নয়',
    success: 'সফলভাবে সম্পন্ন হয়েছে!',
    error: 'কিছু ভুল হয়েছে',
    loading: 'লোড হচ্ছে...',

    salesToday: 'আজকের বিক্রি',
    salesMonth: 'চলতি মাসের মোট বিক্রি',
    profitToday: 'আজকের নীট মুনাফা',
    profitMonth: 'চলতি মাসের নীট মুনাফা',
    expensesToday: 'আজকের মোট খরচ',
    expensesMonth: 'চলতি মাসের মোট খরচ',
    outstandingDues: 'মোট খতিয়ান বাকি (বাকি খাতা)',
    salesVsExpenses: 'মাসিক বিক্রি বনাম খরচ ও লাভ বিশ্লেষণ',
    salesTrend: 'বিক্রি বৃদ্ধির গতি',
    topSelling: 'সর্বোচ্চ বিক্রীত স্টেশনারি পণ্যসমূহ',
    itemName: 'পণ্যের নাম',
    qtySold: 'মোট বিক্রি পরিমাণ',
    revenue: 'মোট রাজস্ব (টাকা)',
    lowStockAlerts: 'স্টক ফুরিয়ে যাওয়া পণ্যের অ্যালার্ট',
    lowStockDesc: 'নিচের স্টেশনারি পন্যগুলো ফুরিয়ে যাচ্ছে। অনুগ্রহ করে এখনই দ্রুত রি-স্টক করুন।',
    currentStock: 'বর্তমান স্টক',
    threshold: 'ন্যূনতম স্টক স্তর',
    quickAddStock: 'স্টক কুইক আপডেট',

    sku: 'বারকোড / SKU স্ক্রীন',
    costPrice: 'ক্রয় মূল্য (টাকা)',
    sellingPrice: 'বিক্রয় মূল্য (টাকা)',
    lowStockThreshold: 'ন্যূনতম অ্যালার্ট লিমিট',
    addNewItem: 'নতুন স্টেশনারি পণ্য যুক্ত করুন',
    editItem: 'স্টেশনারি পণ্য সংশোধন করুন',
    deleteConfirm: 'আপনি কি নিশ্চিতভাবে এই স্টেশনারি আইটেমটি মুছতে চান?',

    pointOfSale: 'ক্যাশ কাউন্টার এবং বিলিং টার্মিনাল',
    searchBySku: 'নাম দিয়ে পণ্য খুঁজুন অথবা বারকোড স্ক্যান করুন...',
    simulateScan: 'বারকোড স্ক্যান সিমুলেশন',
    cart: 'চলতি বিলের ঝুড়ি',
    emptyCart: 'বিলের ঝুড়ি খালি। অনুসন্ধানের মাধ্যমে পণ্য যুক্ত করুন।',
    subtotal: 'সাবটোটাল মূল্য',
    vat: 'ভ্যাট (৫%)',
    discount: 'মূল্য ছাড় / ডিসকাউন্ট',
    grandTotal: 'সর্বমোট প্রদেয় বিল',
    paymentMethod: 'পেমেন্টের মাধ্যম',
    paidAmount: 'পরিশোধিত টাকা',
    dueAmount: 'বাকি টাকা',
    selectCustomer: 'ক্রেতা প্রোফাইল লিংক করুন',
    walkInCustomer: 'খুচরা ক্রেতা (কোনো প্রোফাইল ছাড়া)',
    checkout: 'বিল পোস্ট করুন এবং রশিদ প্রিন্ট করুন',
    invoiceReceipt: 'ক্যাশ মেমো / রশিদ',
    invoiceNo: 'চালান নং',
    salesman: 'ক্যাশিয়ার',
    thankYou: 'আমাদের দোকান থেকে কেনাকাটা করার জন্য ধন্যবাদ!',
    posPrint: 'মানি রিসিট প্রিন্ট করুন',
    posDone: 'ক্লিয়ার এবং নতুন মেমো',
    vatNumber: 'বিন নাম্বার: ০০৯৮৩৪১৫-০১০৩',

    customerList: 'ক্রেতাদের তালিকা ও হিসাবপাতি',
    addCustomer: 'নতুন ক্রেতার খাতা খুলুন',
    totalPurchases: 'মোট কেনাকাটা (টাকা)',
    customerDues: 'মোট বকেয়া বকেয়া (টাকা)',
    supplierList: 'পাইকারি সরবরাহকারী',
    addSupplier: 'নতুন সাপ্লায়ার অ্যাকাউন্ট খুলুন',
    companyName: 'কোম্পানির নাম',
    contactName: 'যোগাযোগকারী ব্যক্তি',
    paySupplier: 'সাপ্লায়ার বিল পরিশোধ করুন',
    paymentHistory: ' সরবরাহকারী পেমেন্ট হিস্ট্রি',

    dueTransactions: ' বকেয়া বাকি খাতা খতিয়ান',
    duePayment: 'বকেয়া বিল গ্রহণ রশিদ',
    payOutstanding: 'বকেয়া পরিশোধ',
    partialPayment: 'আংশিক পেমেন্ট',
    fullPayment: 'সম্পূর্ণ বকেয়া পেমেন্ট',
    payoutDone: 'আদায় উসুল করুন',

    shopExpenses: 'দোকানের ক্যাশ বই (খরচ সমূহ)',
    addExpense: 'নতুন খরচ বুক করুন',
    rent: 'দোকান ভাড়া',
    electricity: 'বিদ্যুৎ ও পানি বিল',
    salary: 'বিক্রয় কর্মীর বেতন',
    transport: 'মাল পরিবহন ভাড়া',
    other: 'অন্যান্য খুচরা খরচ',

    adjustments: 'মাল ফেরত ও ড্যামেজ বুকিং',
    logReturnDamage: 'নষ্ট পণ্য বা ক্রেতার মাল ফেরত এন্ট্রি',
    returnTerm: 'বিক্রিত মাল ফেরত',
    damageTerm: 'নষ্ট বা মেয়াদ উত্তীর্ণ পণ্য',
    logAdjustment: 'ইনভেন্টরি পণ্য স্টক সমন্বয়',
    reason: 'কারণ বর্ণনা',
    lossValue: 'আর্থিক ক্ষতি (ক্রয়মূল্য অনুযায়ী)',
    returnExplanation: 'পণ্য ফেরতের মাধ্যমে তা পুনরায় বিক্রয়যোগ্য সচল স্টকের সাথে যুক্ত হয়।',
    damageExplanation: 'ড্যামেজ বা নষ্ট পণ্য স্থায়ীভাবে সচল স্টক থেকে কমে যায় এবং ক্রয়মূল্য আর্থিক ক্ষতি হিসেবে যুক্ত হয়।'
  }
};
