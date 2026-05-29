/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import AdmZip from 'adm-zip';

const DB_PATH = path.join(process.cwd(), 'database.json');

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initial database seed
const INITIAL_DATABASE = {
  users: [
    { id: 'u1', name: 'Al-Amin Rahman (Admin)', username: 'admin', password: '123', role: 'ADMIN' },
    { id: 'u2', name: 'Nohan Ahmed (Salesman)', username: 'sales', password: '123', role: 'SALESMAN' }
  ],
  items: [
    { id: 'item_1', name: 'Matador Pinpoint Pen (ম্যাটাডোর কলম)', category: 'Pens & Pencils (কলম ও পেন্সিল)', brand: 'Matador', costPrice: 4, sellingPrice: 6, qty: 120, lowStockThreshold: 25, sku: '893456701' },
    { id: 'item_2', name: 'Fresh A4 Paper Pack (এফোর সাইজ কাগজ)', category: 'Office Supplies (অফিস সাপ্লাই)', brand: 'Fresh', costPrice: 240, sellingPrice: 320, qty: 15, lowStockThreshold: 10, sku: '893456702' },
    { id: 'item_3', name: 'Century Ledger Register 120p (খাতা ১২০ পৃষ্ঠা)', category: 'Notebooks & Diaries (খাতা ও ডায়েরি)', brand: 'Century', costPrice: 45, sellingPrice: 70, qty: 8, lowStockThreshold: 15, sku: '893456703' },
    { id: 'item_4', name: 'Casio Scientific Calculator FX-991EX (ক্যালকুলেটর)', category: 'Calculators & Electronics (ক্যালকুলেটর)', brand: 'Casio', costPrice: 1250, sellingPrice: 1650, qty: 3, lowStockThreshold: 5, sku: '893456704' },
    { id: 'item_5', name: 'Apex Leather Cover Executive Diary (ডায়েরি)', category: 'Notebooks & Diaries (খাতা ও ডায়েরি)', brand: 'Apex', costPrice: 160, sellingPrice: 250, qty: 30, lowStockThreshold: 10, sku: '893456705' },
    { id: 'item_6', name: 'Faber-Castell Water Color Pen (ওয়াটার কালার আর্ট)', category: 'Art & Craft (আর্ট ও ক্রাফট)', brand: 'Faber-Castell', costPrice: 110, sellingPrice: 150, qty: 22, lowStockThreshold: 8, sku: '893456706' }
  ],
  customers: [
    { id: 'cust_1', name: 'Mr. Rafiqul Babul', phone: '01712345678', totalPurchases: 4200, dues: 650, createdAt: '2026-05-15T12:00:00Z' },
    { id: 'cust_2', name: 'Jamil Chowdhury', phone: '01888123456', totalPurchases: 1850, dues: 0, createdAt: '2026-05-18T14:30:00Z' },
    { id: 'cust_3', name: 'Nisat Tasnim', phone: '01999123456', totalPurchases: 750, dues: 150, createdAt: '2026-05-22T09:15:00Z' }
  ],
  suppliers: [
    {
      id: 'supp_1',
      companyName: 'Paper Palace Bangladesh (পেপার প্যালেস)',
      contactName: 'Mofizul Islam',
      phone: '01811223344',
      email: 'mofizul@paperpalace.com',
      paymentHistory: [
        { id: 'p_1', amount: 5000, date: '2026-05-15', description: 'Bought 15 cartons of fresh paper' }
      ],
      createdAt: '2026-05-01T10:00:00Z'
    },
    {
      id: 'supp_2',
      companyName: 'Matador Stationery Wholesale (ম্যাটাডোর)',
      contactName: 'Selim Khan',
      phone: '01711223344',
      email: 'selim@matador.com',
      paymentHistory: [
        { id: 'p_2', amount: 12000, date: '2026-05-10', description: 'Purchased 1500 pens of assorted varieties' }
      ],
      createdAt: '2026-05-02T11:00:00Z'
    }
  ],
  sales: [
    {
      id: 'sale_1',
      salesmanId: 'u2',
      salesmanName: 'Nohan Ahmed (Salesman)',
      invoiceNo: 'ST-20260520-01',
      items: [
        { itemId: 'item_1', name: 'Matador Pinpoint Pen (ম্যাটাডোর কলম)', category: 'Pens & Pencils (কলম ও পেন্সিল)', qty: 10, costPrice: 4, sellingPrice: 6 },
        { itemId: 'item_3', name: 'Century Ledger Register 120p (খাতা ১২০ পৃষ্ঠা)', category: 'Notebooks & Diaries (খাতা ও ডায়েরি)', qty: 2, costPrice: 45, sellingPrice: 70 }
      ],
      subtotal: 200,
      vat: 10,
      discountType: 'fixed',
      discountValue: 20,
      discountAmount: 20,
      grandTotal: 190,
      paidAmount: 190,
      dueAmount: 0,
      profit: 60, // 190 - (10*4 + 2*45 = 130) = 60
      paymentMethod: 'Cash',
      createdAt: '2026-05-20T10:15:00Z'
    },
    {
      id: 'sale_2',
      salesmanId: 'u1',
      salesmanName: 'Al-Amin Rahman (Admin)',
      invoiceNo: 'ST-20260525-02',
      items: [
        { itemId: 'item_2', name: 'Fresh A4 Paper Pack (এফোর সাইজ কাগজ)', category: 'Office Supplies (অফিস সাপ্লাই)', qty: 5, costPrice: 240, sellingPrice: 320 },
        { itemId: 'item_4', name: 'Casio Scientific Calculator FX-991EX (ক্যালকুলেটর)', category: 'Calculators & Electronics (ক্যালকুলেটর)', qty: 1, costPrice: 1250, sellingPrice: 1650 }
      ],
      subtotal: 3250,
      vat: 162.5,
      discountType: 'percentage',
      discountValue: 5,
      discountAmount: 162.5,
      grandTotal: 3250,
      paidAmount: 2600,
      dueAmount: 650,
      profit: 800, // 3250 - (5*240 + 1*1250=2450) = 800
      paymentMethod: 'Due',
      customerId: 'cust_1',
      customerName: 'Mr. Rafiqul Babul',
      customerPhone: '01712345678',
      createdAt: '2026-05-25T15:45:00Z'
    }
  ],
  expenses: [
    { id: 'exp_1', category: 'Shop Rent (দোকান ভাড়া)', amount: 6500, date: '2026-05-01', description: 'Monthly rent of primary commercial space' },
    { id: 'exp_2', category: 'Electricity Bill (বিদ্যুৎ বিল)', amount: 1350, date: '2026-05-22', description: 'DESCO electricity commercial tariff bill' },
    { id: 'exp_3', category: 'Employee Salary (বেতন)', amount: 5000, date: '2026-05-25', description: 'Nohan Sales Assistant monthly payout' },
    { id: 'exp_4', category: 'Transportation (পরিবহন খরচ)', amount: 450, date: '2026-05-28', description: 'Wholesale materials rickshaw carrying charges' }
  ],
  stockAdjustments: [
    { id: 'adj_1', type: 'Damage', itemId: 'item_4', itemName: 'Casio Scientific Calculator FX-991EX (ক্যালকুলেটর)', qty: 1, reason: 'Keyboard failure out of package', lossValue: 1250, date: '2026-05-24T11:20:00Z' },
    { id: 'adj_2', type: 'Return', itemId: 'item_1', itemName: 'Matador Pinpoint Pen (ম্যাটাডোর কলম)', qty: 5, reason: 'Incorrect customer coloring chosen', lossValue: 0, date: '2026-05-26T09:30:00Z' }
  ],
  dueCollections: [
    { id: 'coll_1', customerId: 'cust_1', customerName: 'Mr. Rafiqul Babul', amountPaid: 350, paymentMethod: 'Cash', date: '2026-05-27T10:00:00Z' }
  ]
};

// Database read/write helpers
function readDb() {
  try {
    let rawData: any;
    if (!fs.existsSync(DB_PATH)) {
      rawData = JSON.parse(JSON.stringify(INITIAL_DATABASE));
    } else {
      const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
      rawData = JSON.parse(fileContent);
    }

    // Run Migration for multi-tenancy store separation
    let updated = false;
    if (!rawData.stores) {
      rawData.stores = [
        { id: 'store_1', name: 'STATIONERY CRM SHOP', address: 'Azampur Plaza, Uttara, Dhaka-1230', binCode: '00983415-0103', createdAt: '2026-05-15T12:00:00Z' }
      ];
      updated = true;
    }
    
    // Check and seed Super Admin if missing
    const existingSuper = rawData.users.find((u: any) => u.role === 'SUPERADMIN');
    if (!existingSuper) {
      rawData.users.unshift({
        id: 'u0',
        name: 'Nahin Hasan Shuvo',
        username: 'superadmin',
        password: 'wid@123',
        role: 'SUPERADMIN'
      });
      updated = true;
    } else {
      let superAdminChanged = false;
      if (existingSuper.name !== 'Nahin Hasan Shuvo') {
        existingSuper.name = 'Nahin Hasan Shuvo';
        superAdminChanged = true;
      }
      if (existingSuper.password !== 'wid@123') {
        existingSuper.password = 'wid@123';
        superAdminChanged = true;
      }
      if (existingSuper.username !== 'superadmin') {
        existingSuper.username = 'superadmin';
        superAdminChanged = true;
      }
      if (superAdminChanged) {
        updated = true;
      }
    }

    // Set default storeId on all existing records if missing
    const keysToMigrate = ['users', 'items', 'customers', 'suppliers', 'sales', 'expenses', 'stockAdjustments', 'dueCollections'];
    keysToMigrate.forEach((key) => {
      if (rawData[key] && Array.isArray(rawData[key])) {
        rawData[key].forEach((item: any) => {
          if (!item.storeId && item.role !== 'SUPERADMIN') {
            item.storeId = 'store_1';
            updated = true;
          }
        });
      }
    });

    if (updated || !fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(rawData, null, 2), 'utf-8');
    }

    return rawData;
  } catch (err) {
    console.error("Error reading database:", err);
    return INITIAL_DATABASE;
  }
}

function writeDb(data: typeof INITIAL_DATABASE) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error writing database:", err);
  }
}

// Token-based Role Enforcements Middleware
function getAuthUser(req: express.Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  const dbData = readDb();
  // Find matching user by id matching the token
  const user = dbData.users.find(u => u.id === token);
  return user || null;
}

function getStoreId(req: express.Request, user: any): string {
  if (user && user.role === 'SUPERADMIN') {
    const requestedStoreId = req.headers['x-store-id'] as string;
    if (requestedStoreId) {
      return requestedStoreId;
    }
    const dbData = readDb();
    return dbData.stores?.[0]?.id || 'store_1';
  }
  return (user && user.storeId) || 'store_1';
}

function requireAuth(roles?: Array<'SUPERADMIN' | 'ADMIN' | 'SALESMAN'>) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    // SUPERADMIN has master bypass for security controls
    if (user.role === 'SUPERADMIN') {
      (req as any).user = user;
      return next();
    }
    if (roles && !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden. Authorization required.' });
    }
    (req as any).user = user;
    next();
  };
}

// Authentication API
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const dbData = readDb();
  const user = dbData.users.find(
    u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(400).json({ error: 'Invalid username or password' });
  }

  const storeId = getStoreId(req, user);
  const activeStore = dbData.stores?.find((s: any) => s.id === storeId) || dbData.stores?.[0];

  // Generate a mock token using user.id
  res.json({
    token: user.id,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      storeId: user.storeId,
      activeStore
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const dbData = readDb();
  const storeId = getStoreId(req, user);
  const activeStore = dbData.stores?.find((s: any) => s.id === storeId) || dbData.stores?.[0];

  res.json({
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      storeId: user.storeId,
      activeStore
    }
  });
});

// STATIONERY ITEMS (INVENTORY)
app.get('/api/inventory', requireAuth(), (req, res) => {
  const dbData = readDb();
  const storeId = getStoreId(req, (req as any).user);
  res.json((dbData.items || []).filter((i: any) => i.storeId === storeId));
});

app.post('/api/inventory', requireAuth(['ADMIN']), (req, res) => {
  const { name, category, brand, costPrice, sellingPrice, qty, lowStockThreshold, sku } = req.body;
  if (!name || isNaN(costPrice) || isNaN(sellingPrice) || isNaN(qty)) {
    return res.status(400).json({ error: 'Invalid inputs provided' });
  }

  const dbData = readDb();
  const storeId = getStoreId(req, (req as any).user);
  
  // Verify bar code uniqueness within the same store if supplied
  if (sku && (dbData.items || []).some((i: any) => i.sku === sku && i.storeId === storeId)) {
    return res.status(400).json({ error: 'This Barcode/SKU already exists in your store' });
  }

  const newItem = {
    id: 'item_' + Date.now(),
    name,
    category: category || 'Other (অন্যান্য)',
    brand: brand || 'N/A',
    costPrice: Number(costPrice),
    sellingPrice: Number(sellingPrice),
    qty: Number(qty),
    lowStockThreshold: Number(lowStockThreshold || 5),
    sku: sku || ('SKU' + Math.floor(Math.random() * 100000000)),
    storeId
  };

  dbData.items = dbData.items || [];
  dbData.items.push(newItem);
  writeDb(dbData);
  res.status(201).json(newItem);
});

app.put('/api/inventory/:id', requireAuth(['ADMIN']), (req, res) => {
  const { id } = req.params;
  const { name, category, brand, costPrice, sellingPrice, qty, lowStockThreshold, sku } = req.body;

  const dbData = readDb();
  const storeId = getStoreId(req, (req as any).user);
  const itemIndex = dbData.items.findIndex((i: any) => i.id === id && i.storeId === storeId);

  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not found in your store' });
  }

  // SKU conflict check within the store
  if (sku && dbData.items.some((i: any) => i.sku === sku && i.id !== id && i.storeId === storeId)) {
    return res.status(400).json({ error: 'This Barcode/SKU already exists on another item in your store' });
  }

  dbData.items[itemIndex] = {
    ...dbData.items[itemIndex],
    name: name || dbData.items[itemIndex].name,
    category: category || dbData.items[itemIndex].category,
    brand: brand || dbData.items[itemIndex].brand,
    costPrice: costPrice !== undefined ? Number(costPrice) : dbData.items[itemIndex].costPrice,
    sellingPrice: sellingPrice !== undefined ? Number(sellingPrice) : dbData.items[itemIndex].sellingPrice,
    qty: qty !== undefined ? Number(qty) : dbData.items[itemIndex].qty,
    lowStockThreshold: lowStockThreshold !== undefined ? Number(lowStockThreshold) : dbData.items[itemIndex].lowStockThreshold,
    sku: sku || dbData.items[itemIndex].sku
  };

  writeDb(dbData);
  res.json(dbData.items[itemIndex]);
});

// QUICK STOCK UPDATER
app.post('/api/inventory/:id/quick-stock', requireAuth(), (req, res) => {
  const { id } = req.params;
  const { addedQty } = req.body;

  if (isNaN(addedQty)) {
    return res.status(400).json({ error: 'Quantity must be a valid number' });
  }

  const dbData = readDb();
  const storeId = getStoreId(req, (req as any).user);
  const item = dbData.items.find((i: any) => i.id === id && i.storeId === storeId);

  if (!item) {
    return res.status(404).json({ error: 'Item not found in your store' });
  }

  item.qty += Number(addedQty);
  if (item.qty < 0) item.qty = 0;

  writeDb(dbData);
  res.json(item);
});

app.delete('/api/inventory/:id', requireAuth(['ADMIN']), (req, res) => {
  const { id } = req.params;
  const dbData = readDb();
  const storeId = getStoreId(req, (req as any).user);

  const itemExists = dbData.items.some((i: any) => i.id === id && i.storeId === storeId);
  if (!itemExists) {
    return res.status(404).json({ error: 'Item not found in your store' });
  }

  dbData.items = dbData.items.filter((i: any) => !(i.id === id && i.storeId === storeId));
  writeDb(dbData);
  res.json({ success: true });
});


// CUSTOMERS MANAGEMENT
app.get('/api/customers', requireAuth(), (req, res) => {
  const dbData = readDb();
  const storeId = getStoreId(req, (req as any).user);
  res.json((dbData.customers || []).filter((c: any) => c.storeId === storeId));
});

app.post('/api/customers', requireAuth(), (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and Phone number are required' });
  }

  const dbData = readDb();
  const storeId = getStoreId(req, (req as any).user);
  
  // Clean duplicate customer checking within the store
  const existing = (dbData.customers || []).find((c: any) => c.phone === phone && c.storeId === storeId);
  if (existing) {
    return res.json(existing);
  }

  const newCust = {
    id: 'cust_' + Date.now(),
    name,
    phone,
    totalPurchases: 0,
    dues: 0,
    createdAt: new Date().toISOString(),
    storeId
  };

  dbData.customers = dbData.customers || [];
  dbData.customers.push(newCust);
  writeDb(dbData);
  res.status(201).json(newCust);
});

// DUE PAYMENT PROCESSOR
app.post('/api/customers/:id/pay-due', requireAuth(), (req, res) => {
  const { id } = req.params;
  const { paymentAmount, paymentMethod } = req.body;

  if (isNaN(paymentAmount) || paymentAmount <= 0) {
    return res.status(400).json({ error: 'Amount paid must be greater than zero' });
  }

  const dbData = readDb();
  const storeId = getStoreId(req, (req as any).user);
  const customer = dbData.customers.find((c: any) => c.id === id && c.storeId === storeId);

  if (!customer) {
    return res.status(404).json({ error: 'Customer not found in your store' });
  }

  if (customer.dues < paymentAmount) {
    return res.status(400).json({ error: `Amount exceeds outstanding dues of BDT ${customer.dues}` });
  }

  // Update customer ledger
  customer.dues -= Number(paymentAmount);

  // Track due payment history/transactions
  const dueCol = {
    id: 'coll_' + Date.now(),
    customerId: customer.id,
    customerName: customer.name,
    amountPaid: Number(paymentAmount),
    paymentMethod: paymentMethod || 'Cash',
    date: new Date().toISOString(),
    storeId
  };

  dbData.dueCollections = dbData.dueCollections || [];
  dbData.dueCollections.push(dueCol);
  writeDb(dbData);
  res.json({ customer, collection: dueCol });
});


// SUPPLIERS MANAGEMENT
app.get('/api/suppliers', requireAuth(), (req, res) => {
  const dbData = readDb();
  const storeId = getStoreId(req, (req as any).user);
  res.json((dbData.suppliers || []).filter((s: any) => s.storeId === storeId));
});

app.post('/api/suppliers', requireAuth(['ADMIN']), (req, res) => {
  const { companyName, contactName, phone, email } = req.body;
  if (!companyName || !phone) {
    return res.status(400).json({ error: 'Company Name and Phone are required' });
  }

  const dbData = readDb();
  const storeId = getStoreId(req, (req as any).user);
  const newSupp = {
    id: 'supp_' + Date.now(),
    companyName,
    contactName: contactName || 'N/A',
    phone,
    email: email || '',
    paymentHistory: [],
    createdAt: new Date().toISOString(),
    storeId
  };

  dbData.suppliers = dbData.suppliers || [];
  dbData.suppliers.push(newSupp);
  writeDb(dbData);
  res.status(201).json(newSupp);
});

app.post('/api/suppliers/:id/pay', requireAuth(['ADMIN']), (req, res) => {
  const { id } = req.params;
  const { amount, description } = req.body;

  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Transaction amount must be positive' });
  }

  const dbData = readDb();
  const storeId = getStoreId(req, (req as any).user);
  const supplier = dbData.suppliers.find((s: any) => s.id === id && s.storeId === storeId);

  if (!supplier) {
    return res.status(404).json({ error: 'Supplier not found in your store' });
  }

  const payment = {
    id: 'p_' + Date.now(),
    amount: Number(amount),
    date: new Date().toISOString().split('T')[0],
    description: description || 'Material restock transaction'
  };

  supplier.paymentHistory.push(payment);
  writeDb(dbData);
  res.json(supplier);
});


// EXPENSE TRACKING API
app.get('/api/expenses', requireAuth(), (req, res) => {
  const dbData = readDb();
  const storeId = getStoreId(req, (req as any).user);
  res.json((dbData.expenses || []).filter((e: any) => e.storeId === storeId));
});

app.post('/api/expenses', requireAuth(['ADMIN']), (req, res) => {
  const { category, amount, description, date } = req.body;
  if (!category || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Category and positive Amount are required' });
  }

  const dbData = readDb();
  const storeId = getStoreId(req, (req as any).user);
  const newExpense = {
    id: 'exp_' + date + '_' + Math.floor(Math.random() * 100000),
    category,
    amount: Number(amount),
    date: date || new Date().toISOString().split('T')[0],
    description: description || '',
    storeId
  };

  dbData.expenses = dbData.expenses || [];
  dbData.expenses.push(newExpense);
  writeDb(dbData);
  res.status(201).json(newExpense);
});


// RETURNS & DAMAGE MANAGEMENT
app.get('/api/returns-damages', requireAuth(), (req, res) => {
  const dbData = readDb();
  const storeId = getStoreId(req, (req as any).user);
  res.json((dbData.stockAdjustments || []).filter((a: any) => a.storeId === storeId));
});

app.post('/api/returns-damages', requireAuth(), (req, res) => {
  const { type, itemId, qty, reason } = req.body;
  if (!type || !itemId || isNaN(qty) || qty <= 0) {
    return res.status(400).json({ error: 'Invalid parameters provided' });
  }

  const dbData = readDb();
  const storeId = getStoreId(req, (req as any).user);
  const item = dbData.items.find((i: any) => i.id === itemId && i.storeId === storeId);

  if (!item) {
    return res.status(404).json({ error: 'Stationery item not found in your store' });
  }

  // If Damage, check whether we have enough stock to destroy/subtract
  if (type === 'Damage' && item.qty < qty) {
    return res.status(400).json({ error: `Not enough stock to log damage. Available only: ${item.qty}` });
  }

  // Adjust stock
  if (type === 'Damage') {
    item.qty -= Number(qty);
  } else if (type === 'Return') {
    item.qty += Number(qty);
  }

  const lossValue = type === 'Damage' ? (qty * item.costPrice) : 0;

  const newLog = {
    id: 'adj_' + Date.now(),
    type,
    itemId,
    itemName: item.name,
    qty: Number(qty),
    reason: reason || 'N/A',
    lossValue,
    date: new Date().toISOString(),
    storeId
  };

  dbData.stockAdjustments = dbData.stockAdjustments || [];
  dbData.stockAdjustments.push(newLog);
  writeDb(dbData);
  res.status(201).json(newLog);
});


// POS - CART CHECKOUT (SALES ENGINE)
app.post('/api/sales', requireAuth(), (req, res) => {
  const {
    items, // Array of { itemId, quantity }
    discountType,
    discountValue,
    paymentMethod,
    paidAmount,
    customerId
  } = req.body;

  const user = (req as any).user;
  const storeId = getStoreId(req, user);

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  const dbData = readDb();
  const invoiceNo = 'ST-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

  let subtotal = 0;
  let totalCost = 0;
  const transactionItems: any[] = [];

  // Verify availability & formulate billing structure
  for (const cItem of items) {
    const sItem = dbData.items.find((i: any) => i.id === cItem.itemId && i.storeId === storeId);
    if (!sItem) {
      return res.status(404).json({ error: `Item id ${cItem.itemId} not found in this store` });
    }
    if (sItem.qty < cItem.quantity) {
      return res.status(400).json({ error: `Insufficient stock for ${sItem.name}. Stock: ${sItem.qty}` });
    }

    // Deduct stock
    sItem.qty -= cItem.quantity;

    const lineCost = sItem.costPrice * cItem.quantity;
    const lineSale = sItem.sellingPrice * cItem.quantity;

    subtotal += lineSale;
    totalCost += lineCost;

    transactionItems.push({
      itemId: sItem.id,
      name: sItem.name,
      category: sItem.category,
      qty: cItem.quantity,
      costPrice: sItem.costPrice,
      sellingPrice: sItem.sellingPrice
    });
  }

  // VAT (Fixed 5% standard stationery regulatory tax)
  const vat = Number((subtotal * 0.05).toFixed(2));

  // Discount
  let discountAmount = 0;
  if (discountType === 'percentage' && discountValue > 0) {
    discountAmount = Number(((subtotal + vat) * (discountValue / 100)).toFixed(2));
  } else if (discountType === 'fixed' && discountValue > 0) {
    discountAmount = Number(discountValue);
  }

  const grandTotal = Math.max(0, Number((subtotal + vat - discountAmount).toFixed(2)));
  let dueAmount = 0;

  if (paymentMethod === 'Due') {
    dueAmount = grandTotal - (paidAmount || 0);
  } else {
    dueAmount = 0;
  }

  if (dueAmount < 0) dueAmount = 0;

  // Let's configure Customer record updates if attached
  let attachedCustomer = null;
  if (customerId) {
    attachedCustomer = dbData.customers.find((c: any) => c.id === customerId && c.storeId === storeId);
    if (attachedCustomer) {
      attachedCustomer.totalPurchases += grandTotal;
      attachedCustomer.dues += dueAmount;
    }
  }

  const profit = Number((grandTotal - totalCost).toFixed(2));

  const newSale = {
    id: 'sale_' + Date.now(),
    salesmanId: user.id,
    salesmanName: user.name,
    invoiceNo,
    items: transactionItems,
    subtotal,
    vat,
    discountType: discountType || 'fixed',
    discountValue: discountValue || 0,
    discountAmount,
    grandTotal,
    paidAmount: paymentMethod === 'Due' ? (paidAmount || 0) : grandTotal,
    dueAmount,
    profit,
    paymentMethod,
    customerId: attachedCustomer ? attachedCustomer.id : undefined,
    customerName: attachedCustomer ? attachedCustomer.name : undefined,
    customerPhone: attachedCustomer ? attachedCustomer.phone : undefined,
    createdAt: new Date().toISOString(),
    storeId
  };

  dbData.sales = dbData.sales || [];
  dbData.sales.push(newSale);
  writeDb(dbData);

  res.status(201).json(newSale);
});


// REAL-TIME DASHBOARD ANALYTICS & STATS
app.get('/api/dashboard/stats', requireAuth(), (req, res) => {
  const dbData = readDb();
  const user = (req as any).user;
  const storeId = getStoreId(req, user);
  const isSalesman = user.role === 'SALESMAN';

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().getMonth(); // 0-11
  const currentYear = new Date().getFullYear();

  // Create temporary filtered lists for statistics calculations
  const storeSales = (dbData.sales || []).filter((s: any) => s.storeId === storeId);
  const storeExpenses = (dbData.expenses || []).filter((e: any) => e.storeId === storeId);
  const storeCustomers = (dbData.customers || []).filter((c: any) => c.storeId === storeId);
  const storeItems = (dbData.items || []).filter((i: any) => i.storeId === storeId);
  const storeAdjustments = (dbData.stockAdjustments || []).filter((a: any) => a.storeId === storeId);

  // 1. Calculate sales (Today / Month)
  let salesToday = 0;
  let salesThisMonth = 0;
  let profitToday = 0;
  let profitThisMonth = 0;

  storeSales.forEach((sale: any) => {
    const saleDateStr = sale.createdAt.split('T')[0];
    const saleDate = new Date(sale.createdAt);

    const isToday = saleDateStr === todayStr;
    const isThisMonth = saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;

    if (isToday) {
      salesToday += sale.grandTotal;
      profitToday += sale.profit;
    }
    if (isThisMonth) {
      salesThisMonth += sale.grandTotal;
      profitThisMonth += sale.profit;
    }
  });

  // 2. Calculate expenses (Today / Month)
  let expensesToday = 0;
  let expensesThisMonth = 0;

  storeExpenses.forEach((exp: any) => {
    const expDateStr = exp.date;
    const expDate = new Date(exp.date);

    const isToday = expDateStr === todayStr;
    const isThisMonth = expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;

    if (isToday) {
      expensesToday += exp.amount;
    }
    if (isThisMonth) {
      expensesThisMonth += exp.amount;
    }
  });

  // Include damages in expenses loss (optional, but counts as financial expense/loss)
  let damageLossThisMonth = 0;
  storeAdjustments.forEach((adj: any) => {
    if (adj.type === 'Damage') {
      const adjDate = new Date(adj.date);
      if (adjDate.getMonth() === currentMonth && adjDate.getFullYear() === currentYear) {
        damageLossThisMonth += adj.lossValue;
      }
    }
  });
  
  expensesThisMonth += damageLossThisMonth;

  // 3. Outstanding Dues
  const outstandingDues = storeCustomers.reduce((acc: number, curr: any) => acc + curr.dues, 0);

  // 4. Low stock alerts
  const lowStockAlerts = storeItems.filter((item: any) => item.qty <= item.lowStockThreshold);

  // 5. Top selling items list
  const itemCounters: { [itemId: string]: { name: string; qty: number; revenue: number } } = {};
  storeSales.forEach((sale: any) => {
    sale.items.forEach((itm: any) => {
      if (!itemCounters[itm.itemId]) {
        itemCounters[itm.itemId] = { name: itm.name, qty: 0, revenue: 0 };
      }
      itemCounters[itm.itemId].qty += itm.qty;
      itemCounters[itm.itemId].revenue += (itm.sellingPrice * itm.qty);
    });
  });

  const topSellingItems = Object.keys(itemCounters)
    .map(id => ({
      itemId: id,
      name: itemCounters[id].name,
      qtySold: itemCounters[id].qty,
      revenue: itemCounters[id].revenue
    }))
    .sort((a: any, b: any) => b.qtySold - a.qtySold)
    .slice(0, 5);

  // 6. Monthly sales vs expenses chart (Last 6 Months)
  const monthNamesEN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartMap: { [key: string]: { sales: number; expenses: number; profit: number } } = {};

  // Initialize last 6 months in chart
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    chartMap[key] = { sales: 0, expenses: 0, profit: 0 };
  }

  // Map Sales to chart
  storeSales.forEach((sale: any) => {
    const date = new Date(sale.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (chartMap[key]) {
      chartMap[key].sales += sale.grandTotal;
      chartMap[key].profit += sale.profit;
    }
  });

  // Map Expenses to chart
  storeExpenses.forEach((exp: any) => {
    const date = new Date(exp.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (chartMap[key]) {
      chartMap[key].expenses += exp.amount;
    }
  });

  // Include damages to monthly expenses chart
  storeAdjustments.forEach((adj: any) => {
    if (adj.type === 'Damage') {
      const date = new Date(adj.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (chartMap[key]) {
        chartMap[key].expenses += adj.lossValue;
      }
    }
  });

  const monthlyCharts = Object.keys(chartMap).map(key => {
    const [year, monthIdx] = key.split('-');
    const mName = monthNamesEN[parseInt(monthIdx) - 1] + ' ' + year.slice(2);
    return {
      month: mName,
      sales: Number(chartMap[key].sales.toFixed(2)),
      expenses: Number(chartMap[key].expenses.toFixed(2)),
      profit: Number((chartMap[key].sales - chartMap[key].expenses).toFixed(2))
    };
  });

  // Role Restriction: Let's mask sensitive reports for salesmen
  if (isSalesman) {
    res.json({
      salesToday,
      salesThisMonth: 0, // Hidden
      profitToday: 0, // Hidden
      profitThisMonth: 0, // Hidden
      expensesToday: 0, // Hidden
      expensesThisMonth: 0, // Hidden
      outstandingDues: 0, // Hidden
      topSellingItems: [], // Hidden
      lowStockAlerts, // Vital for Salesman to reorder or view
      monthlyCharts: [] // Hidden
    });
  } else {
    res.json({
      salesToday,
      salesThisMonth,
      profitToday,
      profitThisMonth,
      expensesToday,
      expensesThisMonth,
      outstandingDues,
      topSellingItems,
      lowStockAlerts,
      monthlyCharts
    });
  }
});


// SUPER ADMIN MANAGEMENT APIs
app.get('/api/super/stores', requireAuth(['SUPERADMIN']), (req, res) => {
  const dbData = readDb();
  res.json(dbData.stores || []);
});

app.post('/api/super/stores', requireAuth(['SUPERADMIN']), (req, res) => {
  const { name, address, binCode } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Store Name is required' });
  }

  const dbData = readDb();
  const newStore = {
    id: 'store_' + Date.now(),
    name,
    address: address || 'Dhaka, Bangladesh',
    binCode: binCode || 'N/A',
    createdAt: new Date().toISOString()
  };

  dbData.stores = dbData.stores || [];
  dbData.stores.push(newStore);
  writeDb(dbData);
  res.status(201).json(newStore);
});

app.delete('/api/super/stores/:id', requireAuth(['SUPERADMIN']), (req, res) => {
  const { id } = req.params;
  const dbData = readDb();

  dbData.stores = (dbData.stores || []).filter((s: any) => s.id !== id);
  writeDb(dbData);
  res.json({ success: true });
});

app.get('/api/super/users', requireAuth(['SUPERADMIN']), (req, res) => {
  const dbData = readDb();
  res.json((dbData.users || []).map((u: any) => ({
    id: u.id,
    name: u.name,
    username: u.username,
    role: u.role,
    storeId: u.storeId
  })));
});

app.post('/api/super/users', requireAuth(['SUPERADMIN']), (req, res) => {
  const { name, username, password, role, storeId } = req.body;
  if (!name || !username || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const dbData = readDb();
  if (dbData.users.some((u: any) => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  const newUser = {
    id: 'u_' + Date.now(),
    name,
    username,
    password,
    role,
    storeId: role === 'SUPERADMIN' ? undefined : (storeId || 'store_1')
  };

  dbData.users.push(newUser);
  writeDb(dbData);
  res.status(201).json({
    id: newUser.id,
    name: newUser.name,
    username: newUser.username,
    role: newUser.role,
    storeId: newUser.storeId
  });
});

app.delete('/api/super/users/:id', requireAuth(['SUPERADMIN']), (req, res) => {
  const { id } = req.params;
  if (id === 'u0' || id === 'u1') {
    return res.status(400).json({ error: 'Cannot delete primary system accounts' });
  }

  const dbData = readDb();
  dbData.users = dbData.users.filter((u: any) => u.id !== id);
  writeDb(dbData);
  res.json({ success: true });
});


// Dev support to reset database to start from scratch if needed
app.post('/api/db/reset', requireAuth(['ADMIN']), (req, res) => {
  writeDb(INITIAL_DATABASE);
  res.json({ success: true, message: 'Database reset to initial seed values' });
});

// Download full project source code as ZIP
app.get('/api/project/download', (req, res) => {
  try {
    const zip = new AdmZip();
    
    // Files to include
    const filesToInclude = [
      'package.json',
      'tsconfig.json',
      'vite.config.ts',
      'index.html',
      '.env.example',
      '.gitignore',
      'server.ts',
      'database.json'
    ];
    
    // Add local root files
    filesToInclude.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        zip.addLocalFile(filePath);
      }
    });
    
    // Add local nested folders
    const foldersToInclude = ['src', 'assets'];
    foldersToInclude.forEach(folder => {
      const folderPath = path.join(process.cwd(), folder);
      if (fs.existsSync(folderPath)) {
        zip.addLocalFolder(folderPath, folder);
      }
    });
    
    const zipBuffer = zip.toBuffer();
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=stationery_crm_project.zip');
    res.send(zipBuffer);
  } catch (err: any) {
    console.error("Error creating project ZIP:", err);
    res.status(500).json({ error: "Failed to build project ZIP archive: " + err.message });
  }
});


// INTEGRATE VITE DEVSERVER MIDDLEWARE
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Serve index.html as a fallback for standard asset routing
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bilingual Stationery CRM Express server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
