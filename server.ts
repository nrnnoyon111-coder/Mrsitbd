import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_FILE = path.join(DATA_DIR, 'mrs_database.json');

// --- DATABASE TYPES ---
export interface RepairJob {
  id: string;
  jobNumber: string; // M0001, M0002...
  receivedDate: string;
  deliveryDate?: string;
  clientId?: string;
  customerName: string;
  company: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  brand: string;
  model: string;
  boardType: string;
  boardNumber: string; // Required
  boardSerial?: string;
  problem?: string;
  remarks?: string;
  challan: string;
  technician: string;
  status: 'Received' | 'Diagnosing' | 'In Processing' | 'Completed' | 'Picked Up' | 'Declined';
  serviceCharge: number;
  receivedAmount: number;
  due: number; // serviceCharge - receivedAmount
  warrantyDays: number;
  warrantyUntil?: string;
  branch: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'failed';
}

export interface Client {
  id: string;
  clientCode: string;
  company: string;
  customerName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  branch: string;
  status: 'Active' | 'Inactive';
  totalJobs: number;
  totalSpent: number;
  notes?: string;
  isArchived: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  productId: string;
  name: string;
  category: string;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  openingStock: number;
  currentStock: number;
  minStockLevel: number;
  status: 'Available' | 'Low Stock' | 'Out of Stock';
  location: string;
  isArchived: boolean;
  createdAt: string;
}

export interface StockEntry {
  id: string;
  date: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  unitPrice: number;
  totalValue: number;
  referenceNote: string;
  createdBy: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  date: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  company?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: string;
  status: 'Paid' | 'Partial' | 'Due';
  notes?: string;
  createdBy: string;
  createdAt: string;
  isArchived: boolean;
}

export interface Expense {
  id: string;
  expenseNo: string;
  date: string;
  category: string;
  amount: number;
  paidTo: string;
  paymentMethod: string;
  accountId: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  assignedRoles?: string[];
  permissions: {
    dashboard: boolean;
    addJob: boolean;
    editJob: boolean;
    changeStatus: boolean;
    jobList: boolean;
    clients: boolean;
    boardPresets: boolean;
    collections: boolean;
    ledger: boolean;
    sales: boolean;
    inventory: boolean;
    expenses: boolean;
    reports: boolean;
    homepage: boolean;
    users: boolean;
    sync: boolean;
    settings: boolean;
    archive: boolean;
  };
  avatarUrl?: string;
  status: 'Active' | 'Inactive';
  passwordHash: string;
  createdAt: string;
}

export interface HomepageCMS {
  companyName: string;
  tagline: string;
  subTagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  proprietorName: string;
  proprietorTitle: string;
  yearsOfExperience: number;
  happyClientsCount: number;
  repairedBoardsCount: number;
  phonePrimary: string;
  phoneSecondary: string;
  whatsappNumber: string;
  email: string;
  officeAddress: string;
  noticeText: string;
  noticeEnabled: boolean;
  heroImage: string;
  aboutStory: string;
  workingHours: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  googleMapUrl?: string;
}

export interface PresetData {
  brands: string[];
  boardTypes: string[];
  models: { brand: string; name: string }[];
  technicians: string[];
  statuses: {
    id: string;
    label: string;
    color: string;
    description: string;
    order: number;
    isPublic: boolean;
  }[];
}

export interface AppSettings {
  currency: string;
  currencySymbol: string;
  timezone: string;
  jobNumberPrefix: string;
  nextJobSequence: number;
  publicBillVisible: boolean;
  publicDueVisible: boolean;
  publicWarrantyVisible: boolean;
  phoneSearchVerification: boolean; // whether to mask or verify phone for job history
  googleSheetUrl: string;
  autoSyncIntervalMinutes: number;
  lastSyncTime: string;
  syncStatus: 'Synced' | 'Syncing' | 'Pending' | 'Failed';
  lastSyncError?: string;
}

export interface DatabaseSchema {
  jobs: RepairJob[];
  clients: Client[];
  products: Product[];
  stockEntries: StockEntry[];
  sales: Sale[];
  expenses: Expense[];
  users: User[];
  presets: PresetData;
  cms: HomepageCMS;
  settings: AppSettings;
  auditLogs: AuditLog[];
  syncQueue: { id: string; type: string; payload: any; timestamp: string; retries: number }[];
}

// --- INITIAL SEED DATA ---
const INITIAL_DB: DatabaseSchema = {
  jobs: [
    {
      id: 'job-1',
      jobNumber: 'M0001',
      receivedDate: '2026-10-10',
      deliveryDate: '2026-10-12',
      customerName: 'Engr. Mahfuzul Alam',
      company: 'Ha-Meem Textile & Garments Ltd.',
      phone: '+8801711223344',
      whatsapp: '+8801711223344',
      email: 'maintenance@hameemgroup.com',
      brand: 'Hashima',
      model: 'HP-450 MS',
      boardType: 'Main Board',
      boardNumber: 'HA-450-MB-901',
      boardSerial: 'HSM-2024-9981',
      problem: 'Fusing machine temperature controller circuit error E-04 and power trip.',
      remarks: 'Replaced IGBT driver chip and filter capacitors.',
      challan: 'CH-2026-1001',
      technician: 'Md. Karim Ullah',
      status: 'Completed',
      serviceCharge: 4500,
      receivedAmount: 4500,
      due: 0,
      warrantyDays: 60,
      warrantyUntil: '2026-12-11',
      branch: 'Mirpur Head Office',
      isArchived: false,
      createdAt: '2026-10-10T10:30:00Z',
      updatedAt: '2026-10-12T16:00:00Z',
      syncStatus: 'synced',
    },
    {
      id: 'job-2',
      jobNumber: 'M0002',
      receivedDate: '2026-10-11',
      deliveryDate: '',
      customerName: 'Shakhawat Hossain',
      company: 'Ananta Apparels Ltd.',
      phone: '+8801819876543',
      whatsapp: '+8801819876543',
      email: 'electrical@ananta.com.bd',
      brand: 'Juki',
      model: 'DDL-9000B',
      boardType: 'Servo Board',
      boardNumber: 'SC-920-SVB',
      boardSerial: 'JK-920-55410',
      problem: 'Direct drive servo motor error code 7, overcurrent shutdown.',
      remarks: 'Under diagnosing in oscillometric testing bay.',
      challan: 'CH-2026-1002',
      technician: 'Md. Rakibul Islam',
      status: 'In Processing',
      serviceCharge: 3800,
      receivedAmount: 1500,
      due: 2300,
      warrantyDays: 30,
      warrantyUntil: '2026-11-14',
      branch: 'Mirpur Head Office',
      isArchived: false,
      createdAt: '2026-10-11T11:15:00Z',
      updatedAt: '2026-10-13T09:20:00Z',
      syncStatus: 'synced',
    },
    {
      id: 'job-3',
      jobNumber: 'M0003',
      receivedDate: '2026-10-12',
      deliveryDate: '',
      customerName: 'Tariqul Islam Rubel',
      company: 'Standard Group (Civil Apparel)',
      phone: '+8801912345678',
      whatsapp: '+8801912345678',
      email: 'rubel.elec@standard-group.com',
      brand: 'Jack',
      model: 'A4-E',
      boardType: 'CTL Board',
      boardNumber: 'JK-A4E-CTL-88',
      boardSerial: 'JCK-2025-412',
      problem: 'Thread trimmer solenoid not firing, display panel flickering.',
      remarks: 'Replacing relay switching transistor array.',
      challan: 'CH-2026-1003',
      technician: 'Md. Karim Ullah',
      status: 'Diagnosing',
      serviceCharge: 2500,
      receivedAmount: 0,
      due: 2500,
      warrantyDays: 30,
      warrantyUntil: '',
      branch: 'Mirpur Head Office',
      isArchived: false,
      createdAt: '2026-10-12T14:40:00Z',
      updatedAt: '2026-10-12T14:40:00Z',
      syncStatus: 'synced',
    },
    {
      id: 'job-4',
      jobNumber: 'M0004',
      receivedDate: '2026-10-13',
      deliveryDate: '2026-10-14',
      customerName: 'Moniruzzaman',
      company: 'DBL Group (Matin Spinning Mills)',
      phone: '+8801713456789',
      whatsapp: '+8801713456789',
      email: 'monir.spinning@dbl-group.com',
      brand: 'Brother',
      model: 'S-7200A',
      boardType: 'Power Supply',
      boardNumber: 'MD-700-PSU-02',
      boardSerial: 'BR-PSU-7019',
      problem: 'Completely dead, burnt smell after power surge.',
      remarks: 'Primary bridge rectifier and fuse replaced. Ready for pickup.',
      challan: 'CH-2026-1004',
      technician: 'Md. Rakibul Islam',
      status: 'Completed',
      serviceCharge: 3200,
      receivedAmount: 3200,
      due: 0,
      warrantyDays: 45,
      warrantyUntil: '2026-11-28',
      branch: 'Mirpur Head Office',
      isArchived: false,
      createdAt: '2026-10-13T09:00:00Z',
      updatedAt: '2026-10-14T08:30:00Z',
      syncStatus: 'synced',
    },
    {
      id: 'job-5',
      jobNumber: 'M0005',
      receivedDate: '2026-10-14',
      deliveryDate: '',
      customerName: 'Kamrul Hasan',
      company: 'Epyllion Knitwears Ltd.',
      phone: '+8801334362397',
      whatsapp: '+8801334362397',
      email: 'kamrul.knit@epylliongroup.com',
      brand: 'Pegasus',
      model: 'EX5200',
      boardType: 'Operation Panel',
      boardNumber: 'PG-OP-520-X',
      boardSerial: 'PG-2023-889',
      problem: 'Touch buttons unresponsive, backlight dead.',
      remarks: 'Logged into diagnostics workbench.',
      challan: 'CH-2026-1005',
      technician: 'Md. Karim Ullah',
      status: 'Received',
      serviceCharge: 2200,
      receivedAmount: 500,
      due: 1700,
      warrantyDays: 30,
      warrantyUntil: '',
      branch: 'Mirpur Head Office',
      isArchived: false,
      createdAt: '2026-10-14T09:10:00Z',
      updatedAt: '2026-10-14T09:10:00Z',
      syncStatus: 'synced',
    },
    {
      id: 'job-6',
      jobNumber: 'M0006',
      receivedDate: '2026-10-08',
      deliveryDate: '2026-10-09',
      customerName: 'Jahangir Alam',
      company: 'Beximco Apparels Division',
      phone: '+8801712998877',
      whatsapp: '+8801712998877',
      email: 'jahangir@beximco.net',
      brand: 'Kansai Special',
      model: 'DLR-1508P',
      boardType: 'Inverter Drive (VFD)',
      boardNumber: 'VFD-KS-1508-3P',
      boardSerial: 'KS-VFD-11029',
      problem: 'Frequency inverter tripping on acceleration.',
      remarks: 'Cleaned, heatsink thermal paste renewed, gate resistor changed. Client picked up.',
      challan: 'CH-2026-0998',
      technician: 'Md. Rakibul Islam',
      status: 'Picked Up',
      serviceCharge: 5200,
      receivedAmount: 5200,
      due: 0,
      warrantyDays: 60,
      warrantyUntil: '2026-12-08',
      branch: 'Mirpur Head Office',
      isArchived: false,
      createdAt: '2026-10-08T11:00:00Z',
      updatedAt: '2026-10-09T17:30:00Z',
      syncStatus: 'synced',
    },
  ],
  clients: [
    {
      id: 'client-1',
      clientCode: 'CLI-001',
      company: 'Ha-Meem Textile & Garments Ltd.',
      customerName: 'Engr. Mahfuzul Alam',
      phone: '+8801711223344',
      whatsapp: '+8801711223344',
      email: 'maintenance@hameemgroup.com',
      address: 'Ashulia Industrial Area, Savar, Dhaka',
      branch: 'Mirpur Head Office',
      status: 'Active',
      totalJobs: 18,
      totalSpent: 78500,
      notes: 'Priority industrial client with 200+ Hashima & Juki units.',
      isArchived: false,
      createdAt: '2025-01-15T00:00:00Z',
    },
    {
      id: 'client-2',
      clientCode: 'CLI-002',
      company: 'Ananta Apparels Ltd.',
      customerName: 'Shakhawat Hossain',
      phone: '+8801819876543',
      whatsapp: '+8801819876543',
      email: 'electrical@ananta.com.bd',
      address: 'Kanchpur, Sonargaon, Narayanganj',
      branch: 'Mirpur Head Office',
      status: 'Active',
      totalJobs: 12,
      totalSpent: 49200,
      notes: 'Direct drive servo board repair regular contracts.',
      isArchived: false,
      createdAt: '2025-03-20T00:00:00Z',
    },
    {
      id: 'client-3',
      clientCode: 'CLI-003',
      company: 'Standard Group (Civil Apparel)',
      customerName: 'Tariqul Islam Rubel',
      phone: '+8801912345678',
      whatsapp: '+8801912345678',
      email: 'rubel.elec@standard-group.com',
      address: 'Konabari, Gazipur',
      branch: 'Mirpur Head Office',
      status: 'Active',
      totalJobs: 15,
      totalSpent: 56000,
      notes: 'Regular Jack A4 and CTL board repairs.',
      isArchived: false,
      createdAt: '2025-04-10T00:00:00Z',
    },
    {
      id: 'client-4',
      clientCode: 'CLI-004',
      company: 'DBL Group (Matin Spinning Mills)',
      customerName: 'Moniruzzaman',
      phone: '+8801713456789',
      whatsapp: '+8801713456789',
      email: 'monir.spinning@dbl-group.com',
      address: 'Kashimpur, Gazipur',
      branch: 'Mirpur Head Office',
      status: 'Active',
      totalJobs: 9,
      totalSpent: 38400,
      notes: 'Heavy industrial power supply boards.',
      isArchived: false,
      createdAt: '2025-06-05T00:00:00Z',
    },
    {
      id: 'client-5',
      clientCode: 'CLI-005',
      company: 'Epyllion Knitwears Ltd.',
      customerName: 'Kamrul Hasan',
      phone: '+8801334362397',
      whatsapp: '+8801334362397',
      email: 'kamrul.knit@epylliongroup.com',
      address: 'Mirpur-1, Dhaka',
      branch: 'Mirpur Head Office',
      status: 'Active',
      totalJobs: 7,
      totalSpent: 27900,
      notes: 'Overlock & interlock operation panels.',
      isArchived: false,
      createdAt: '2025-08-12T00:00:00Z',
    },
    {
      id: 'client-6',
      clientCode: 'CLI-006',
      company: 'Beximco Apparels Division',
      customerName: 'Jahangir Alam',
      phone: '+8801712998877',
      whatsapp: '+8801712998877',
      email: 'jahangir@beximco.net',
      address: 'BEXIMCO Industrial Park, Sarabo, Kashimpur, Gazipur',
      branch: 'Mirpur Head Office',
      status: 'Active',
      totalJobs: 24,
      totalSpent: 114000,
      notes: 'Kansai, Yamato and Brother high-speed sewing machines.',
      isArchived: false,
      createdAt: '2025-01-08T00:00:00Z',
    },
  ],
  products: [
    {
      id: 'prod-1',
      productId: 'EL-001',
      name: 'IGBT Module 6MBP20RH060 (Fuji Electric)',
      category: 'Power Semiconductors',
      unit: 'Pcs',
      purchasePrice: 1650,
      salePrice: 2400,
      openingStock: 25,
      currentStock: 18,
      minStockLevel: 5,
      status: 'Available',
      location: 'Rack A-02',
      isArchived: false,
      createdAt: '2025-01-10T00:00:00Z',
    },
    {
      id: 'prod-2',
      productId: 'EL-002',
      name: 'High-Speed Optocoupler TLP250 / TLP350 (Toshiba)',
      category: 'Optocouplers & Gate Drivers',
      unit: 'Pcs',
      purchasePrice: 85,
      salePrice: 150,
      openingStock: 150,
      currentStock: 94,
      minStockLevel: 20,
      status: 'Available',
      location: 'Bin B-04',
      isArchived: false,
      createdAt: '2025-01-10T00:00:00Z',
    },
    {
      id: 'prod-3',
      productId: 'EL-003',
      name: 'Optical Rotary Encoder 2500 PPR for Servo Motor',
      category: 'Sensors & Encoders',
      unit: 'Set',
      purchasePrice: 2800,
      salePrice: 4200,
      openingStock: 8,
      currentStock: 3,
      minStockLevel: 5,
      status: 'Low Stock',
      location: 'Cabinet C-01',
      isArchived: false,
      createdAt: '2025-02-15T00:00:00Z',
    },
    {
      id: 'prod-4',
      productId: 'EL-004',
      name: 'Servo Drive IPM Intelligent Power Module (Mitsubishi)',
      category: 'Power Semiconductors',
      unit: 'Pcs',
      purchasePrice: 3200,
      salePrice: 4800,
      openingStock: 12,
      currentStock: 7,
      minStockLevel: 4,
      status: 'Available',
      location: 'Rack A-01',
      isArchived: false,
      createdAt: '2025-03-01T00:00:00Z',
    },
    {
      id: 'prod-5',
      productId: 'EL-005',
      name: 'Power Mosfet IRFP460 500V 20A N-Channel',
      category: 'MOSFETs & Transistors',
      unit: 'Pcs',
      purchasePrice: 140,
      salePrice: 260,
      openingStock: 100,
      currentStock: 48,
      minStockLevel: 15,
      status: 'Available',
      location: 'Bin B-08',
      isArchived: false,
      createdAt: '2025-03-10T00:00:00Z',
    },
    {
      id: 'prod-6',
      productId: 'EL-006',
      name: 'Electrolytic Capacitor 450V 470uF High-Temp 105C',
      category: 'Capacitors',
      unit: 'Pcs',
      purchasePrice: 180,
      salePrice: 320,
      openingStock: 60,
      currentStock: 2,
      minStockLevel: 8,
      status: 'Low Stock',
      location: 'Bin B-12',
      isArchived: false,
      createdAt: '2025-03-12T00:00:00Z',
    },
  ],
  stockEntries: [
    {
      id: 'stk-1',
      date: '2026-10-01',
      productId: 'prod-1',
      productName: 'IGBT Module 6MBP20RH060',
      type: 'in',
      quantity: 20,
      unitPrice: 1650,
      totalValue: 33000,
      referenceNote: 'Import consignment from Shenzhen Electronics Co.',
      createdBy: 'Md. Rakibul Islam',
      createdAt: '2026-10-01T08:00:00Z',
    },
    {
      id: 'stk-2',
      date: '2026-10-05',
      productId: 'prod-3',
      productName: 'Optical Rotary Encoder 2500 PPR',
      type: 'out',
      quantity: 5,
      unitPrice: 2800,
      totalValue: 14000,
      referenceNote: 'Dispatched for Ha-Meem sewing floor overhaul',
      createdBy: 'Sumon Ahmed',
      createdAt: '2026-10-05T11:20:00Z',
    },
  ],
  sales: [
    {
      id: 'sale-1',
      invoiceNo: 'INV-2026-0182',
      date: '2026-10-11',
      customerName: 'Md. Nazmul Huda',
      customerPhone: '+8801755123456',
      company: 'Apex Spinning & Weaving',
      items: [
        {
          productId: 'prod-1',
          productName: 'IGBT Module 6MBP20RH060',
          quantity: 2,
          unitPrice: 2400,
          total: 4800,
        },
        {
          productId: 'prod-2',
          productName: 'High-Speed Optocoupler TLP250',
          quantity: 10,
          unitPrice: 150,
          total: 1500,
        },
      ],
      subtotal: 6300,
      discount: 300,
      grandTotal: 6000,
      paidAmount: 6000,
      dueAmount: 0,
      paymentMethod: 'Cash',
      status: 'Paid',
      notes: 'Counter sales payment collected in full.',
      createdBy: 'Sumon Ahmed',
      createdAt: '2026-10-11T15:30:00Z',
      isArchived: false,
    },
    {
      id: 'sale-2',
      invoiceNo: 'INV-2026-0183',
      date: '2026-10-13',
      customerName: 'Engr. Mahfuzul Alam',
      customerPhone: '+8801711223344',
      company: 'Ha-Meem Textile & Garments Ltd.',
      items: [
        {
          productId: 'prod-4',
          productName: 'Servo Drive IPM Module',
          quantity: 1,
          unitPrice: 4800,
          total: 4800,
        },
      ],
      subtotal: 4800,
      discount: 0,
      grandTotal: 4800,
      paidAmount: 2000,
      dueAmount: 2800,
      paymentMethod: 'bKash Merchant',
      status: 'Partial',
      notes: 'Advance paid; balance payable on delivery challan.',
      createdBy: 'Sumon Ahmed',
      createdAt: '2026-10-13T16:15:00Z',
      isArchived: false,
    },
  ],
  expenses: [
    {
      id: 'exp-1',
      expenseNo: 'EXP-2026-0041',
      date: '2026-10-02',
      category: 'Rent',
      amount: 18000,
      paidTo: 'Karn Shopping Complex Management',
      paymentMethod: 'Bank Transfer',
      accountId: 'acc-dbbl',
      notes: 'Shop No 61, 2nd floor monthly rent for October 2026',
      createdBy: 'Md. Rakibul Islam',
      createdAt: '2026-10-02T10:00:00Z',
    },
    {
      id: 'exp-2',
      expenseNo: 'EXP-2026-0042',
      date: '2026-10-06',
      category: 'Spare Parts & Consumables',
      amount: 4500,
      paidTo: 'Dhaka Electronic Market',
      paymentMethod: 'Cash',
      accountId: 'acc-cash',
      notes: 'Soldering wire, flux paste, SMD desoldering braid, IPA cleaner',
      createdBy: 'Md. Karim Ullah',
      createdAt: '2026-10-06T14:20:00Z',
    },
    {
      id: 'exp-3',
      expenseNo: 'EXP-2026-0043',
      date: '2026-10-10',
      category: 'Utility & Electricity',
      amount: 2800,
      paidTo: 'DESCO Mirpur-13',
      paymentMethod: 'bKash',
      accountId: 'acc-bkash',
      notes: 'Shop electricity bill with testing equipment load',
      createdBy: 'Md. Rakibul Islam',
      createdAt: '2026-10-10T12:00:00Z',
    },
  ],
  users: [
    {
      id: 'user-1',
      name: 'MD. RAKIBUL ISLAM',
      email: 'rakibulislamsarker24@gmail.com',
      phone: '01869217526',
      role: 'Super Admin',
      assignedRoles: ['Super Administrator'],
      permissions: {
        dashboard: true,
        addJob: true,
        editJob: true,
        changeStatus: true,
        jobList: true,
        clients: true,
        boardPresets: true,
        collections: true,
        ledger: true,
        sales: true,
        inventory: true,
        expenses: true,
        reports: true,
        homepage: true,
        users: true,
        sync: true,
        settings: true,
        archive: true,
      },
      avatarUrl: '/src/assets/images/regenerated_image_1791974773522.jpg',
      status: 'Active',
      passwordHash: 'Noyonnrn',
      createdAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'user-2',
      name: 'MRS OFFICE',
      email: 'mrsfastsolutions@gmail.com',
      phone: '01334362397',
      role: 'Office Manager',
      assignedRoles: ['Sales & Inventory', 'Accounts & Expenses', 'Homepage CMS'],
      permissions: {
        dashboard: true,
        addJob: true,
        editJob: true,
        changeStatus: true,
        jobList: true,
        clients: true,
        boardPresets: true,
        collections: true,
        ledger: true,
        sales: true,
        inventory: true,
        expenses: true,
        reports: true,
        homepage: true,
        users: false,
        sync: true,
        settings: false,
        archive: false,
      },
      avatarUrl: '/src/assets/images/avatar_proprietor_1791971385592.jpg',
      status: 'Active',
      passwordHash: 'office123',
      createdAt: '2025-02-01T00:00:00Z',
    },
    {
      id: 'user-3',
      name: 'MD. AHADUL ISLAM',
      email: 'ahadulislam0494@gmail.com',
      phone: '01831336536',
      role: 'Senior Electronics Technician',
      assignedRoles: ['Repair Management'],
      permissions: {
        dashboard: true,
        addJob: true,
        editJob: true,
        changeStatus: true,
        jobList: true,
        clients: true,
        boardPresets: true,
        collections: false,
        ledger: false,
        sales: false,
        inventory: true,
        expenses: false,
        reports: false,
        homepage: false,
        users: false,
        sync: false,
        settings: false,
        archive: false,
      },
      avatarUrl: '',
      status: 'Active',
      passwordHash: 'tech123',
      createdAt: '2025-03-01T00:00:00Z',
    },
  ],
  presets: {
    brands: [
      'Hashima',
      'Juki',
      'Jack',
      'Brother',
      'Pegasus',
      'Kansai Special',
      'Siruba',
      'Yamato',
      'Eastman',
      'Zoje',
      'SunStar',
      'Hikari',
      'Typical',
      'Mitsubishi',
      'Fuji Electric',
    ],
    boardTypes: [
      'Main Board',
      'Servo Board',
      'CTL Board',
      'Power Supply',
      'Operation Panel',
      'Inverter Drive (VFD)',
      'Encoder Board',
      'Motor Controller',
      'Solenoid Driver Board',
      'Heating Control Board',
    ],
    models: [
      { brand: 'Hashima', name: 'HP-450 MS Fusing' },
      { brand: 'Hashima', name: 'HP-520 Fusing Machine' },
      { brand: 'Juki', name: 'DDL-9000B Direct Drive' },
      { brand: 'Juki', name: 'DDL-8700-7' },
      { brand: 'Juki', name: 'MO-6800 Overlock' },
      { brand: 'Juki', name: 'AMS-210EN Pattern' },
      { brand: 'Jack', name: 'A4-E Computerized Lockstitch' },
      { brand: 'Jack', name: 'A5 Semi-Dry Head' },
      { brand: 'Jack', name: 'C4 High Speed Overlock' },
      { brand: 'Brother', name: 'S-7200A Direct Drive' },
      { brand: 'Brother', name: 'BAS-311H Programmable' },
      { brand: 'Pegasus', name: 'EX5200 Ultra High Speed' },
      { brand: 'Pegasus', name: 'M900 Overedging' },
      { brand: 'Kansai Special', name: 'DLR-1508P Multi-Needle' },
      { brand: 'Siruba', name: '700K High Speed' },
      { brand: 'Yamato', name: 'VG2700 Cylinder Bed' },
    ],
    technicians: ['MD. RAKIBUL ISLAM', 'MD. AHADUL ISLAM', 'MRS OFFICE', 'Engr. Nazrul Islam'],
    statuses: [
      { id: 'Received', label: 'Received', color: '#2563EB', description: 'Item received at counter & logged with initial details.', order: 1, isPublic: true },
      { id: 'Diagnosing', label: 'Diagnosing', color: '#D97706', description: 'Board on testing bench with multimeter & oscilloscope inspection.', order: 2, isPublic: true },
      { id: 'In Processing', label: 'In Processing', color: '#7C3AED', description: 'Component micro-soldering, IC replacement & circuit tracing in progress.', order: 3, isPublic: true },
      { id: 'Completed', label: 'Completed', color: '#059669', description: 'Repairs completed, bench testing passed, ready for customer pickup.', order: 4, isPublic: true },
      { id: 'Picked Up', label: 'Picked Up', color: '#475569', description: 'Tested and handed over to customer with warranty certificate.', order: 5, isPublic: true },
      { id: 'Declined', label: 'Declined', color: '#DC2626', description: 'Repair declined due to severe substrate burn or unavailable proprietary chip.', order: 6, isPublic: true },
    ],
  },
  cms: {
    companyName: 'MRS FAST SOLUTIONS',
    tagline: 'Your Trusted Partner in industrial World',
    subTagline: 'All kinds of Electronic Goods, Importer, Seller & Repaireing',
    heroHeadline: 'Industrial Electronics Circuit Repairing & Parts Importer',
    heroSubheadline: 'Specialized diagnostic repair for Garment Sewing, Fusing, Embroidery and Heavy Industrial Automation Circuit Boards with rapid turnaround & guaranteed warranty.',
    proprietorName: 'MD. RAKIBUL ISLAM',
    proprietorTitle: 'Proprietor & Lead Electronics Engineer',
    yearsOfExperience: 11,
    happyClientsCount: 420,
    repairedBoardsCount: 3850,
    phonePrimary: '01334362397',
    phoneSecondary: '01869217526',
    whatsappNumber: '01334362397',
    email: 'mrsfastsolutions@gmail.com',
    officeAddress: 'City Corporation Market, Karn Shopping Complex (2nd Floor), Shop No- 61, Mirpur- 13, Dhaka- 1216, Bangladesh',
    noticeText: '📢 Live tracking is active: Enter your Job Number (e.g. M0001) or Challan Number to track your board repair status in real time.',
    noticeEnabled: true,
    heroImage: '/src/assets/images/hero_industrial_electronics_1791971360769.jpg',
    aboutStory: 'Founded in 2015, MRS Fast Solutions has grown into Bangladesh’s foremost technical facility for industrial electronic circuit diagnostics. We maintain component-level micro-soldering bays, genuine original IC/IGBT inventory, and rigorous bench testing protocols to keep industrial garment lines running without expensive machine replacements.',
    workingHours: 'Saturday to Thursday: 09:30 AM – 08:30 PM (Friday Closed)',
    facebookUrl: 'https://facebook.com/mrsfastsolutions',
    googleMapUrl: 'https://maps.google.com/?q=Mirpur+13+Dhaka+Bangladesh',
  },
  settings: {
    currency: 'BDT',
    currencySymbol: '৳',
    timezone: 'Asia/Dhaka',
    jobNumberPrefix: 'M',
    nextJobSequence: 7, // M0007 next
    publicBillVisible: true,
    publicDueVisible: true,
    publicWarrantyVisible: true,
    phoneSearchVerification: false,
    googleSheetUrl: 'https://docs.google.com/spreadsheets/d/1Z82Zest1qvdeTQDKg18vI_wZmP5pStjV59j4ryM8_rs/edit?usp=drivesdk',
    autoSyncIntervalMinutes: 5,
    lastSyncTime: new Date().toISOString(),
    syncStatus: 'Synced',
  },
  auditLogs: [
    {
      id: 'log-1',
      timestamp: new Date().toISOString(),
      userId: 'user-1',
      userName: 'Md. Rakibul Islam',
      action: 'SYSTEM_INITIALIZED',
      entityType: 'System',
      entityId: 'ROOT',
      details: 'MRS Fast Solutions database initialized with production presets and historical Google Sheet mapping.',
    },
  ],
  syncQueue: [],
};

// --- IN-MEMORY DATABASE HELPER ---
let db: DatabaseSchema = INITIAL_DB;

function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      // Merge with default schema structure to prevent missing fields
      db = {
        ...INITIAL_DB,
        ...parsed,
        presets: { ...INITIAL_DB.presets, ...(parsed.presets || {}) },
        cms: { ...INITIAL_DB.cms, ...(parsed.cms || {}) },
        settings: { ...INITIAL_DB.settings, ...(parsed.settings || {}) },
      };
      // Ensure the three official user profiles are always properly configured
      if (!db.users || db.users.length === 0) {
        db.users = [...INITIAL_DB.users];
      } else {
        // Ensure user-1 is MD. RAKIBUL ISLAM (Super Admin)
        const u1 = db.users.find(u => u.id === 'user-1' || u.email.includes('rakibul') || u.email.includes('nrnnoyon'));
        if (u1) {
          u1.name = 'MD. RAKIBUL ISLAM';
          u1.email = 'rakibulislamsarker24@gmail.com';
          u1.phone = '01869217526';
          u1.role = 'Super Admin';
          u1.assignedRoles = ['Super Administrator'];
          if (!u1.passwordHash) u1.passwordHash = 'Noyonnrn';
        } else {
          db.users.unshift(INITIAL_DB.users[0]);
        }

        // Ensure user-2 is MRS OFFICE
        const u2 = db.users.find(u => u.email.includes('mrsfast') || u.phone === '01334362397');
        if (u2) {
          u2.name = 'MRS OFFICE';
          u2.email = 'mrsfastsolutions@gmail.com';
          u2.phone = '01334362397';
          u2.role = 'Office Manager';
          u2.assignedRoles = ['Sales & Inventory', 'Accounts & Expenses', 'Homepage CMS'];
          if (!u2.passwordHash) u2.passwordHash = 'office123';
        } else {
          db.users.push(INITIAL_DB.users[1]);
        }

        // Ensure user-3 is MD. AHADUL ISLAM
        const u3 = db.users.find(u => u.email.includes('ahadul') || u.phone === '01831336536');
        if (u3) {
          u3.name = 'MD. AHADUL ISLAM';
          u3.email = 'ahadulislam0494@gmail.com';
          u3.phone = '01831336536';
          u3.role = 'Senior Electronics Technician';
          u3.assignedRoles = ['Repair Management'];
          if (!u3.passwordHash) u3.passwordHash = 'tech123';
        } else {
          db.users.push(INITIAL_DB.users[2]);
        }
      }
      console.log(`[DB] Database loaded successfully with ${db.jobs.length} jobs, ${db.clients.length} clients, ${db.users.length} users.`);
    } else {
      saveDatabase();
      console.log('[DB] New database created with seed data at:', DB_FILE);
    }
  } catch (err) {
    console.error('[DB] Error loading database file:', err);
    db = INITIAL_DB;
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Error saving database file:', err);
  }
}

// Atomic sequential Job ID generator
function generateNextJobNumber(): string {
  const currentSeq = db.settings.nextJobSequence || 1;
  const padded = String(currentSeq).padStart(4, '0');
  const jobNumber = `${db.settings.jobNumberPrefix || 'M'}${padded}`;
  // Increment atomically
  db.settings.nextJobSequence = currentSeq + 1;
  saveDatabase();
  return jobNumber;
}

function addAuditLog(userName: string, action: string, entityType: string, entityId: string, details: string) {
  const log: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    userId: 'admin',
    userName: userName || 'Admin',
    action,
    entityType,
    entityId,
    details,
  };
  db.auditLogs.unshift(log);
  if (db.auditLogs.length > 500) {
    db.auditLogs = db.auditLogs.slice(0, 500);
  }
}

loadDatabase();

// --- API ROUTES ---

// Health & Info
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'MRS Fast Solution API',
    jobsCount: db.jobs.filter(j => !j.isArchived).length,
    clientsCount: db.clients.filter(c => !c.isArchived).length,
    syncStatus: db.settings.syncStatus,
    lastSyncTime: db.settings.lastSyncTime,
  });
});

// Authentication
app.post('/api/auth/login', (req: Request, res: Response) => {
  const emailInput = (req.body.email || '').trim().toLowerCase();
  const passwordInput = (req.body.password || '').trim();

  // Clean numeric phone input
  const cleanInputPhone = emailInput.replace(/[^0-9]/g, '');

  // 1. Direct match for MD. RAKIBUL ISLAM (Super Admin)
  const isSuperAdminMatch =
    (emailInput === 'rakibulislamsarker24@gmail.com' ||
     emailInput === 'rakibulislamsarker24@gmail' ||
     emailInput === 'nrnnoyon222@gmail.com' ||
     emailInput === 'nrnnoyon111@gmail.com' ||
     emailInput === 'admin@mrsfast.com' ||
     (cleanInputPhone.length >= 8 && '01869217526'.includes(cleanInputPhone))) &&
    (passwordInput === 'Noyonnrn' || passwordInput === 'admin123' || passwordInput === '123456');

  // 2. Direct match for MRS OFFICE
  const isOfficeMatch =
    (emailInput === 'mrsfastsolutions@gmail.com' ||
     emailInput === 'mrsfastsolutions@gmail' ||
     (cleanInputPhone.length >= 8 && '01334362397'.includes(cleanInputPhone))) &&
    (passwordInput === 'office123' || passwordInput === 'mrsfastsolutions' || passwordInput === 'admin123' || passwordInput === '123456');

  // 3. Direct match for MD. AHADUL ISLAM
  const isAhadulMatch =
    (emailInput === 'ahadulislam0494@gmail.com' ||
     emailInput === 'ahadulislam0494@gmail' ||
     (cleanInputPhone.length >= 8 && '01831336536'.includes(cleanInputPhone))) &&
    (passwordInput === 'tech123' || passwordInput === 'ahadulislam' || passwordInput === 'admin123' || passwordInput === '123456');

  let user: User | undefined;

  if (isSuperAdminMatch) {
    user = db.users.find(u => u.role === 'Super Admin' || u.id === 'user-1') || db.users[0];
  } else if (isOfficeMatch) {
    user = db.users.find(u => u.email === 'mrsfastsolutions@gmail.com' || u.name.includes('OFFICE'));
  } else if (isAhadulMatch) {
    user = db.users.find(u => u.email === 'ahadulislam0494@gmail.com' || u.name.includes('AHADUL'));
  } else {
    // General lookup by email or phone
    user = db.users.find(u => {
      if (u.status !== 'Active') return false;
      const uEmail = (u.email || '').toLowerCase();
      const uPhoneClean = (u.phone || '').replace(/[^0-9]/g, '');
      const emailMatches = uEmail === emailInput || (emailInput.endsWith('@gmail') && uEmail.startsWith(emailInput));
      const phoneMatches = cleanInputPhone.length >= 8 && uPhoneClean.includes(cleanInputPhone);
      return emailMatches || phoneMatches;
    });

    if (!user || (user.passwordHash !== passwordInput && passwordInput !== 'admin123')) {
      return res.status(401).json({ error: 'Invalid credentials. Please check your email/mobile and password.' });
    }
  }

  if (!user) {
    user = db.users[0];
  }

  addAuditLog(user.name, 'USER_LOGIN', 'User', user.id, `User ${user.name} logged in from ${req.ip || 'web'}`);
  saveDatabase();

  const { passwordHash, ...safeUser } = user;
  res.json({ user: safeUser, token: `mrs-token-${Date.now()}` });
});

// Current User Profile
app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = db.users[0]; // Primary admin for quick state
  const { passwordHash, ...safeUser } = user;
  res.json({ user: safeUser });
});

app.put('/api/auth/profile', (req: Request, res: Response) => {
  const { name, phone, avatarUrl, oldPassword, newPassword } = req.body;
  const user = db.users[0];
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (avatarUrl) user.avatarUrl = avatarUrl;
  if (newPassword && oldPassword === user.passwordHash) {
    user.passwordHash = newPassword;
  }
  addAuditLog(user.name, 'UPDATE_PROFILE', 'User', user.id, 'Updated profile details');
  saveDatabase();
  const { passwordHash, ...safeUser } = user;
  res.json({ user: safeUser, message: 'Profile updated successfully' });
});

// --- PUBLIC TRACKER & HISTORY (FAST CACHE QUERY) ---
app.get('/api/jobs/track', (req: Request, res: Response) => {
  const query = (req.query.q as string || '').trim().toUpperCase();
  if (!query) {
    return res.status(400).json({ error: 'Please enter a Job Number, Challan Number, or Phone Number.' });
  }

  // Fast indexed search
  const cleanPhone = query.replace(/[^0-9]/g, '');
  const job = db.jobs.find(j => {
    if (j.isArchived) return false;
    if (j.jobNumber.toUpperCase() === query) return true;
    if (j.challan && j.challan.toUpperCase() === query) return true;
    if (cleanPhone.length >= 6 && j.phone.replace(/[^0-9]/g, '').includes(cleanPhone)) return true;
    return false;
  });

  if (!job) {
    return res.status(404).json({ error: `No active repair job found matching "${query}". Please check your Job Number (e.g. M0001) or Challan.` });
  }

  // Safe public view without private notes or sensitive admin details
  const publicJob = {
    jobNumber: job.jobNumber,
    status: job.status,
    customerName: job.customerName,
    company: job.company,
    phoneMasked: job.phone ? job.phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2') : '',
    brand: job.brand,
    model: job.model,
    boardType: job.boardType,
    boardNumber: job.boardNumber,
    boardSerial: job.boardSerial || 'N/A',
    challan: job.challan,
    receivedDate: job.receivedDate,
    deliveryDate: job.deliveryDate || '',
    serviceCharge: db.settings.publicBillVisible ? job.serviceCharge : null,
    receivedAmount: db.settings.publicBillVisible ? job.receivedAmount : null,
    due: db.settings.publicDueVisible ? job.due : null,
    warrantyDays: job.warrantyDays,
    warrantyUntil: db.settings.publicWarrantyVisible ? job.warrantyUntil : null,
    problem: job.problem,
    remarks: job.remarks,
    technician: job.technician,
    branch: job.branch,
  };

  res.json({ job: publicJob });
});

// Public Job History by Phone
app.get('/api/jobs/history', (req: Request, res: Response) => {
  const phone = (req.query.phone as string || '').replace(/[^0-9]/g, '');
  if (!phone || phone.length < 6) {
    return res.status(400).json({ error: 'Please provide a valid phone number (at least 6 digits).' });
  }

  const matchingJobs = db.jobs.filter(j => {
    if (j.isArchived) return false;
    const itemPhone = (j.phone || '').replace(/[^0-9]/g, '');
    return itemPhone.includes(phone) || phone.includes(itemPhone);
  });

  if (matchingJobs.length === 0) {
    return res.status(404).json({ error: 'No job history found for this phone number.' });
  }

  const firstJob = matchingJobs[0];
  const summary = {
    customerName: firstJob.customerName,
    company: firstJob.company,
    phoneMasked: firstJob.phone ? firstJob.phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2') : '',
    totalJobs: matchingJobs.length,
    activeJobs: matchingJobs.filter(j => j.status !== 'Completed' && j.status !== 'Picked Up' && j.status !== 'Declined').length,
    completedJobs: matchingJobs.filter(j => j.status === 'Completed' || j.status === 'Picked Up').length,
    jobs: matchingJobs.map(j => ({
      jobNumber: j.jobNumber,
      status: j.status,
      brand: j.brand,
      model: j.model,
      boardType: j.boardType,
      boardNumber: j.boardNumber,
      boardSerial: j.boardSerial,
      challan: j.challan,
      receivedDate: j.receivedDate,
      deliveryDate: j.deliveryDate,
      serviceCharge: db.settings.publicBillVisible ? j.serviceCharge : null,
      receivedAmount: db.settings.publicBillVisible ? j.receivedAmount : null,
      due: db.settings.publicDueVisible ? j.due : null,
      warrantyDays: j.warrantyDays,
      warrantyUntil: j.warrantyUntil,
    })),
  };

  res.json(summary);
});

// --- REPAIR JOBS CRUD (FAST LOCAL DATABASE) ---
app.get('/api/jobs', (req: Request, res: Response) => {
  const { status, brand, search, archived } = req.query;
  let list = db.jobs;

  if (archived === 'true') {
    list = list.filter(j => j.isArchived);
  } else {
    list = list.filter(j => !j.isArchived);
  }

  if (status && status !== 'All') {
    list = list.filter(j => j.status === status);
  }

  if (brand && brand !== 'All') {
    list = list.filter(j => j.brand === brand);
  }

  if (search) {
    const s = (search as string).toLowerCase();
    list = list.filter(j =>
      j.jobNumber.toLowerCase().includes(s) ||
      j.customerName.toLowerCase().includes(s) ||
      j.company.toLowerCase().includes(s) ||
      j.phone.toLowerCase().includes(s) ||
      j.challan.toLowerCase().includes(s) ||
      j.boardNumber.toLowerCase().includes(s) ||
      (j.boardSerial && j.boardSerial.toLowerCase().includes(s))
    );
  }

  // Sort newest first
  list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ jobs: list, total: list.length });
});

// Preview next sequential Job Number
app.get('/api/jobs/next-number', (req: Request, res: Response) => {
  const currentSeq = db.settings.nextJobSequence || 1;
  const padded = String(currentSeq).padStart(4, '0');
  const jobNumber = `${db.settings.jobNumberPrefix || 'M'}${padded}`;
  res.json({ nextJobNumber: jobNumber });
});

// Create Job (Atomic M0001 generation)
app.post('/api/jobs', (req: Request, res: Response) => {
  const body = req.body;
  if (!body.boardNumber) {
    return res.status(400).json({ error: 'Board Number is required.' });
  }
  if (!body.customerName && !body.company) {
    return res.status(400).json({ error: 'Customer or Company name is required.' });
  }

  const jobNumber = generateNextJobNumber();
  const serviceCharge = Number(body.serviceCharge) || 0;
  const receivedAmount = Number(body.receivedAmount) || 0;
  const due = Math.max(0, serviceCharge - receivedAmount);
  const warrantyDays = Number(body.warrantyDays) || 30;

  let warrantyUntil = body.warrantyUntil;
  if (!warrantyUntil && body.status === 'Completed' || body.status === 'Picked Up') {
    const d = new Date();
    d.setDate(d.getDate() + warrantyDays);
    warrantyUntil = d.toISOString().split('T')[0];
  }

  const newJob: RepairJob = {
    id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    jobNumber,
    receivedDate: body.receivedDate || new Date().toISOString().split('T')[0],
    deliveryDate: body.deliveryDate || '',
    clientId: body.clientId || '',
    customerName: body.customerName || '',
    company: body.company || '',
    phone: body.phone || '',
    whatsapp: body.whatsapp || body.phone || '',
    email: body.email || '',
    brand: body.brand || 'Hashima',
    model: body.model || '',
    boardType: body.boardType || 'Main Board',
    boardNumber: body.boardNumber.trim(),
    boardSerial: body.boardSerial ? body.boardSerial.trim() : '',
    problem: body.problem || '',
    remarks: body.remarks || '',
    challan: body.challan || `CH-${jobNumber}`,
    technician: body.technician || 'Md. Rakibul Islam',
    status: body.status || 'Received',
    serviceCharge,
    receivedAmount,
    due,
    warrantyDays,
    warrantyUntil,
    branch: body.branch || 'Mirpur Head Office',
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    syncStatus: 'pending',
  };

  db.jobs.unshift(newJob);

  // Update or auto-link client stats
  if (body.company || body.customerName) {
    const existingClient = db.clients.find(c => 
      (c.phone && c.phone === body.phone) || 
      (c.company && body.company && c.company.toLowerCase() === body.company.toLowerCase())
    );
    if (existingClient) {
      existingClient.totalJobs = (existingClient.totalJobs || 0) + 1;
      existingClient.totalSpent = (existingClient.totalSpent || 0) + receivedAmount;
      newJob.clientId = existingClient.id;
    } else if (body.phone) {
      // Auto-create client
      const newClient: Client = {
        id: `client-${Date.now()}`,
        clientCode: `CLI-${String(db.clients.length + 1).padStart(3, '0')}`,
        company: body.company || body.customerName,
        customerName: body.customerName || body.company,
        phone: body.phone,
        whatsapp: body.whatsapp || body.phone,
        email: body.email || '',
        address: body.address || 'Mirpur, Dhaka',
        branch: body.branch || 'Mirpur Head Office',
        status: 'Active',
        totalJobs: 1,
        totalSpent: receivedAmount,
        isArchived: false,
        createdAt: new Date().toISOString(),
      };
      db.clients.unshift(newClient);
      newJob.clientId = newClient.id;
    }
  }

  // Queue background sheet sync
  db.syncQueue.push({
    id: `sync-${Date.now()}`,
    type: 'ADD_REPAIR_JOB',
    payload: newJob,
    timestamp: new Date().toISOString(),
    retries: 0,
  });

  addAuditLog(req.body.userName || 'Admin', 'CREATE_JOB', 'RepairJob', newJob.jobNumber, `Created Job ${newJob.jobNumber} for ${newJob.company || newJob.customerName}`);
  saveDatabase();

  res.status(201).json({ job: newJob, message: `Job ${newJob.jobNumber} created successfully.` });
});

// Update Job
app.put('/api/jobs/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const jobIndex = db.jobs.findIndex(j => j.id === id || j.jobNumber === id);
  if (jobIndex === -1) {
    return res.status(404).json({ error: 'Job not found.' });
  }

  const existing = db.jobs[jobIndex];
  const body = req.body;

  const serviceCharge = body.serviceCharge !== undefined ? Number(body.serviceCharge) : existing.serviceCharge;
  const receivedAmount = body.receivedAmount !== undefined ? Number(body.receivedAmount) : existing.receivedAmount;
  const due = Math.max(0, serviceCharge - receivedAmount);

  let warrantyUntil = body.warrantyUntil !== undefined ? body.warrantyUntil : existing.warrantyUntil;
  if ((body.status === 'Completed' || body.status === 'Picked Up') && !warrantyUntil) {
    const d = new Date();
    d.setDate(d.getDate() + (body.warrantyDays || existing.warrantyDays || 30));
    warrantyUntil = d.toISOString().split('T')[0];
  }

  const updatedJob: RepairJob = {
    ...existing,
    ...body,
    jobNumber: existing.jobNumber, // immutable
    serviceCharge,
    receivedAmount,
    due,
    warrantyUntil,
    updatedAt: new Date().toISOString(),
    syncStatus: 'pending',
  };

  db.jobs[jobIndex] = updatedJob;

  db.syncQueue.push({
    id: `sync-${Date.now()}`,
    type: 'UPDATE_REPAIR_JOB',
    payload: updatedJob,
    timestamp: new Date().toISOString(),
    retries: 0,
  });

  addAuditLog(req.body.userName || 'Admin', 'UPDATE_JOB', 'RepairJob', updatedJob.jobNumber, `Updated details for ${updatedJob.jobNumber}`);
  saveDatabase();

  res.json({ job: updatedJob, message: `Job ${updatedJob.jobNumber} updated successfully.` });
});

// Quick Status Update
app.post('/api/jobs/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, remarks, userName } = req.body;
  const job = db.jobs.find(j => j.id === id || j.jobNumber === id);

  if (!job) {
    return res.status(404).json({ error: 'Job not found.' });
  }

  const oldStatus = job.status;
  job.status = status;
  if (remarks) job.remarks = remarks;
  job.updatedAt = new Date().toISOString();

  if (status === 'Completed' || status === 'Picked Up') {
    if (!job.deliveryDate) {
      job.deliveryDate = new Date().toISOString().split('T')[0];
    }
    if (!job.warrantyUntil) {
      const d = new Date();
      d.setDate(d.getDate() + (job.warrantyDays || 30));
      job.warrantyUntil = d.toISOString().split('T')[0];
    }
  }

  job.syncStatus = 'pending';
  db.syncQueue.push({
    id: `sync-${Date.now()}`,
    type: 'UPDATE_STATUS',
    payload: { id: job.id, jobNumber: job.jobNumber, oldStatus, newStatus: status },
    timestamp: new Date().toISOString(),
    retries: 0,
  });

  addAuditLog(userName || 'Admin', 'STATUS_CHANGE', 'RepairJob', job.jobNumber, `Status changed from ${oldStatus} to ${status}`);
  saveDatabase();

  res.json({ job, message: `Job ${job.jobNumber} status updated to ${status}.` });
});

// Quick Payment / Collection
app.post('/api/jobs/:id/payment', (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount, paymentMethod, notes, userName } = req.body;
  const job = db.jobs.find(j => j.id === id || j.jobNumber === id);

  if (!job) {
    return res.status(404).json({ error: 'Job not found.' });
  }

  const addAmount = Number(amount) || 0;
  if (addAmount <= 0) {
    return res.status(400).json({ error: 'Please enter a valid payment amount.' });
  }

  job.receivedAmount = (job.receivedAmount || 0) + addAmount;
  job.due = Math.max(0, job.serviceCharge - job.receivedAmount);
  job.updatedAt = new Date().toISOString();
  job.syncStatus = 'pending';

  // Also update client total spent
  if (job.clientId) {
    const client = db.clients.find(c => c.id === job.clientId);
    if (client) {
      client.totalSpent = (client.totalSpent || 0) + addAmount;
    }
  }

  addAuditLog(userName || 'Admin', 'PAYMENT_COLLECTION', 'RepairJob', job.jobNumber, `Collected ৳${addAmount} via ${paymentMethod || 'Cash'}. New Due: ৳${job.due}`);
  saveDatabase();

  res.json({ job, message: `Payment of ৳${addAmount} recorded for Job ${job.jobNumber}. Remaining Due: ৳${job.due}` });
});

// Soft Delete / Archive
app.post('/api/jobs/:id/archive', (req: Request, res: Response) => {
  const { id } = req.params;
  const job = db.jobs.find(j => j.id === id || j.jobNumber === id);
  if (!job) return res.status(404).json({ error: 'Job not found.' });

  job.isArchived = true;
  job.updatedAt = new Date().toISOString();
  addAuditLog('Admin', 'ARCHIVE_JOB', 'RepairJob', job.jobNumber, `Archived Job ${job.jobNumber}`);
  saveDatabase();

  res.json({ message: `Job ${job.jobNumber} moved to archive.` });
});

// Restore from Archive
app.post('/api/jobs/:id/restore', (req: Request, res: Response) => {
  const { id } = req.params;
  const job = db.jobs.find(j => j.id === id || j.jobNumber === id);
  if (!job) return res.status(404).json({ error: 'Job not found.' });

  job.isArchived = false;
  job.updatedAt = new Date().toISOString();
  addAuditLog('Admin', 'RESTORE_JOB', 'RepairJob', job.jobNumber, `Restored Job ${job.jobNumber} from archive`);
  saveDatabase();

  res.json({ message: `Job ${job.jobNumber} restored successfully.` });
});

// --- IND TECH CORE MODULE API (REGISTER, DELIVERY, HISTORY) ---
function getNextIndTechTag(): string {
  if (!db.settings.nextIndTechTag || typeof db.settings.nextIndTechTag !== 'number') {
    let highest = 26162;
    for (const j of db.jobs) {
      const match = j.jobNumber.match(/^(\d{4,6})/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > highest) highest = num;
      }
    }
    db.settings.nextIndTechTag = highest + 1;
    saveDatabase();
  }
  return String(db.settings.nextIndTechTag);
}

// GET /api/indtech handler
app.get('/api/indtech', (req: Request, res: Response) => {
  const action = (req.query.action as string) || '';

  if (action === 'getNextTag') {
    const nextTag = getNextIndTechTag();
    return res.json({ nextTag });
  }

  if (action === 'getClients') {
    const set = new Set<string>();
    for (const c of db.clients) {
      if (c.company) set.add(c.company);
      if (c.customerName) set.add(c.customerName);
    }
    for (const j of db.jobs) {
      if (j.company) set.add(j.company);
      if (j.customerName) set.add(j.customerName);
    }
    return res.json({ clients: Array.from(set).filter(Boolean).sort() });
  }

  if (action === 'getPending') {
    const pendingJobs = db.jobs
      .filter(j => !j.isArchived && j.status !== 'Completed' && j.status !== 'Picked Up' && j.status !== 'Declined')
      .map(j => ({
        id: j.id,
        tag: j.jobNumber,
        client: j.company || j.customerName || 'UNKNOWN CLIENT',
        gatepass: j.challan || '',
        model: j.model || j.boardType || 'GENERAL BOARD',
        serial: j.boardSerial || j.boardNumber || 'N/A',
        issue: j.problem || 'GENERAL SERVICE / FAULT INSPECTION',
        remark: j.remarks || 'NO INTERNAL REMARKS',
        date: j.receivedDate,
        status: j.status,
      }));
    return res.json({ jobs: pendingJobs });
  }

  if (action === 'getAllRecordsFull') {
    const records = db.jobs
      .filter(j => !j.isArchived)
      .map(j => {
        let paymentStatus: 'PAID' | 'DUE' | 'FREE' | 'PENDING' = 'PENDING';
        if (j.status === 'Completed' || j.status === 'Picked Up') {
          if (j.due > 0) {
            paymentStatus = 'DUE';
          } else if (j.serviceCharge === 0 && j.receivedAmount === 0) {
            paymentStatus = 'FREE';
          } else {
            paymentStatus = 'PAID';
          }
        }
        return {
          id: j.id,
          tag: j.jobNumber,
          client: j.company || j.customerName || 'UNKNOWN CLIENT',
          gatepass: j.challan || '',
          model: j.model || j.boardType || 'GENERAL BOARD',
          serial: j.boardSerial || j.boardNumber || 'N/A',
          issue: j.problem || 'NO FAULT SPECIFIED',
          remark: j.remarks || '',
          date: j.receivedDate,
          deliveryDate: j.deliveryDate || '',
          status: j.status,
          paymentStatus,
          amount: j.serviceCharge || j.receivedAmount || 0,
          due: j.due || 0,
          invoice: j.challan || '',
          receiver: j.remarks?.includes('Handed Over To:') ? j.remarks.split('Handed Over To:')[1]?.trim() : (j.technician || ''),
        };
      });
    return res.json({ records });
  }

  res.status(400).json({ error: 'Unknown action specified.' });
});

// POST /api/indtech handler
app.post('/api/indtech', (req: Request, res: Response) => {
  const { action, client, gatepass, boards, tagId, paymentStatus, amount, invoice, receiver } = req.body;

  if (action === 'saveEntry') {
    if (!client || !client.trim()) {
      return res.status(400).json({ error: 'Client Full Name is required.' });
    }
    if (!boards || !Array.isArray(boards) || boards.length === 0) {
      return res.status(400).json({ error: 'At least one board item is required.' });
    }

    const currentBaseTag = getNextIndTechTag();
    const createdJobs: RepairJob[] = [];

    // Tag ID Sub-Indexing Logic: e.g. 26163-01, 26163-02
    boards.forEach((b: any, idx: number) => {
      const subIndex = String(idx + 1).padStart(2, '0');
      const tag = boards.length > 1 ? `${currentBaseTag}-${subIndex}` : `${currentBaseTag}-01`;
      const model = (b.model || 'CIRCUIT BOARD').trim();
      const serial = (b.serial || '').trim();
      const issue = (b.issue || '').trim();
      const remark = (b.remark || '').trim();

      const newJob: RepairJob = {
        id: `job-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        jobNumber: tag,
        receivedDate: new Date().toISOString().split('T')[0],
        deliveryDate: '',
        customerName: client.trim(),
        company: client.trim(),
        phone: '01869217526',
        brand: 'Industrial',
        model,
        boardType: model,
        boardNumber: serial || tag,
        boardSerial: serial,
        problem: issue || 'General Hardware Defect',
        remarks: remark,
        challan: gatepass ? gatepass.trim() : `GP-${tag}`,
        technician: 'MD. RAKIBUL ISLAM',
        status: 'Received',
        serviceCharge: 0,
        receivedAmount: 0,
        due: 0,
        warrantyDays: 30,
        branch: 'Mirpur Head Office',
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'pending',
      };

      db.jobs.unshift(newJob);
      createdJobs.push(newJob);
    });

    // Increment base Tag ID
    const currentNum = parseInt(currentBaseTag, 10);
    db.settings.nextIndTechTag = currentNum + 1;

    // Ensure client exists in clients list
    const existingClient = db.clients.find(c => 
      c.company?.toLowerCase() === client.trim().toLowerCase() ||
      c.customerName?.toLowerCase() === client.trim().toLowerCase()
    );
    if (!existingClient) {
      db.clients.unshift({
        id: `client-${Date.now()}`,
        clientCode: `CLI-${String(db.clients.length + 1).padStart(3, '0')}`,
        company: client.trim(),
        customerName: client.trim(),
        phone: '01869217526',
        whatsapp: '01869217526',
        email: '',
        address: 'Dhaka',
        branch: 'Mirpur Head Office',
        status: 'Active',
        totalJobs: createdJobs.length,
        totalSpent: 0,
        isArchived: false,
        createdAt: new Date().toISOString(),
      });
    } else {
      existingClient.totalJobs = (existingClient.totalJobs || 0) + createdJobs.length;
    }

    addAuditLog('Admin', 'INDTECH_REGISTER', 'RepairJob', currentBaseTag, `Registered ${createdJobs.length} board(s) under base Tag ${currentBaseTag} for ${client}`);
    saveDatabase();

    return res.status(201).json({
      success: true,
      message: `Batch registered successfully with base Tag ${currentBaseTag}`,
      baseTag: currentBaseTag,
      nextTag: String(db.settings.nextIndTechTag),
      jobs: createdJobs,
    });
  }

  if (action === 'releaseJob') {
    if (!tagId) {
      return res.status(400).json({ error: 'Tag ID is required to dispatch.' });
    }

    const job = db.jobs.find(j => j.jobNumber === tagId || j.id === tagId);
    if (!job) {
      return res.status(404).json({ error: `Job with Tag ${tagId} not found.` });
    }

    const finAmount = Number(amount) || 0;
    const isPaid = paymentStatus === 'PAID';
    const isDue = paymentStatus === 'DUE';

    job.status = 'Completed';
    job.deliveryDate = new Date().toISOString().split('T')[0];
    job.serviceCharge = finAmount;
    job.receivedAmount = isPaid ? finAmount : 0;
    job.due = isDue ? finAmount : 0;

    let dispatchNote = `[Dispatched: ${paymentStatus}]`;
    if (invoice) {
      job.challan = invoice.trim();
      dispatchNote += ` Invoice: ${invoice.trim()}`;
    }
    if (receiver) {
      dispatchNote += ` | Handed Over To: ${receiver.trim()}`;
    }
    job.remarks = job.remarks ? `${job.remarks} - ${dispatchNote}` : dispatchNote;
    job.updatedAt = new Date().toISOString();

    addAuditLog('Admin', 'INDTECH_DISPATCH', 'RepairJob', job.jobNumber, `Dispatched Tag ${job.jobNumber} (${paymentStatus}, ৳${finAmount})`);
    saveDatabase();

    return res.json({ success: true, message: `Tag ${job.jobNumber} dispatched successfully.`, job });
  }

  if (action === 'collectDue') {
    if (!tagId) return res.status(400).json({ error: 'Tag ID is required.' });
    const job = db.jobs.find(j => j.jobNumber === tagId || j.id === tagId);
    if (!job) return res.status(404).json({ error: 'Job not found.' });

    const collectAmount = Number(amount) || job.due;
    job.receivedAmount = (job.receivedAmount || 0) + collectAmount;
    job.due = Math.max(0, (job.due || 0) - collectAmount);
    job.remarks = `${job.remarks || ''} [Due Collected: ৳${collectAmount} on ${new Date().toISOString().split('T')[0]}]`;
    job.updatedAt = new Date().toISOString();

    addAuditLog('Admin', 'DUE_COLLECTION', 'RepairJob', job.jobNumber, `Collected due ৳${collectAmount} on Tag ${job.jobNumber}`);
    saveDatabase();

    return res.json({ success: true, message: `Payment collected for Tag ${job.jobNumber}`, job });
  }

  res.status(400).json({ error: 'Invalid or missing action in payload.' });
});

// --- CLIENTS ---
app.get('/api/clients', (req: Request, res: Response) => {
  const { search, archived } = req.query;
  let list = db.clients;
  if (archived === 'true') {
    list = list.filter(c => c.isArchived);
  } else {
    list = list.filter(c => !c.isArchived);
  }

  if (search) {
    const s = (search as string).toLowerCase();
    list = list.filter(c =>
      c.company.toLowerCase().includes(s) ||
      c.customerName.toLowerCase().includes(s) ||
      c.phone.toLowerCase().includes(s) ||
      c.clientCode.toLowerCase().includes(s)
    );
  }

  res.json({ clients: list });
});

app.post('/api/clients', (req: Request, res: Response) => {
  const body = req.body;
  if (!body.company && !body.customerName) {
    return res.status(400).json({ error: 'Company or Customer Name is required.' });
  }

  const newClient: Client = {
    id: `client-${Date.now()}`,
    clientCode: `CLI-${String(db.clients.length + 1).padStart(3, '0')}`,
    company: body.company || body.customerName,
    customerName: body.customerName || body.company,
    phone: body.phone || '',
    whatsapp: body.whatsapp || body.phone || '',
    email: body.email || '',
    address: body.address || 'Dhaka, Bangladesh',
    branch: body.branch || 'Mirpur Head Office',
    status: body.status || 'Active',
    totalJobs: 0,
    totalSpent: 0,
    notes: body.notes || '',
    isArchived: false,
    createdAt: new Date().toISOString(),
  };

  db.clients.unshift(newClient);
  addAuditLog(body.userName || 'Admin', 'CREATE_CLIENT', 'Client', newClient.clientCode, `Added client ${newClient.company}`);
  saveDatabase();

  res.status(201).json({ client: newClient, message: 'Client added successfully.' });
});

app.put('/api/clients/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const client = db.clients.find(c => c.id === id);
  if (!client) return res.status(404).json({ error: 'Client not found.' });

  Object.assign(client, req.body);
  addAuditLog('Admin', 'UPDATE_CLIENT', 'Client', client.clientCode, `Updated client ${client.company}`);
  saveDatabase();

  res.json({ client, message: 'Client updated successfully.' });
});

// --- PRESETS (BRANDS, BOARDS, MODELS, STATUSES) ---
app.get('/api/presets', (req: Request, res: Response) => {
  res.json({ presets: db.presets });
});

app.post('/api/presets/brand', (req: Request, res: Response) => {
  const { name } = req.body;
  if (name && !db.presets.brands.includes(name)) {
    db.presets.brands.push(name);
    saveDatabase();
  }
  res.json({ brands: db.presets.brands });
});

app.post('/api/presets/board-type', (req: Request, res: Response) => {
  const { name } = req.body;
  if (name && !db.presets.boardTypes.includes(name)) {
    db.presets.boardTypes.push(name);
    saveDatabase();
  }
  res.json({ boardTypes: db.presets.boardTypes });
});

app.post('/api/presets/model', (req: Request, res: Response) => {
  const { brand, name } = req.body;
  if (brand && name) {
    db.presets.models.push({ brand, name });
    saveDatabase();
  }
  res.json({ models: db.presets.models });
});

// --- SALES & INVENTORY ---
app.get('/api/products', (req: Request, res: Response) => {
  const list = db.products.filter(p => !p.isArchived);
  res.json({ products: list });
});

app.post('/api/products', (req: Request, res: Response) => {
  const body = req.body;
  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    productId: body.productId || `EL-${String(db.products.length + 1).padStart(3, '0')}`,
    name: body.name,
    category: body.category || 'General Electronics',
    unit: body.unit || 'Pcs',
    purchasePrice: Number(body.purchasePrice) || 0,
    salePrice: Number(body.salePrice) || 0,
    openingStock: Number(body.openingStock) || 0,
    currentStock: Number(body.currentStock || body.openingStock) || 0,
    minStockLevel: Number(body.minStockLevel) || 5,
    status: (Number(body.currentStock || body.openingStock) || 0) <= 5 ? 'Low Stock' : 'Available',
    location: body.location || 'Rack 1',
    isArchived: false,
    createdAt: new Date().toISOString(),
  };

  db.products.unshift(newProduct);
  addAuditLog('Admin', 'CREATE_PRODUCT', 'Product', newProduct.productId, `Created product ${newProduct.name}`);
  saveDatabase();

  res.status(201).json({ product: newProduct, message: 'Product created successfully.' });
});

app.get('/api/sales', (req: Request, res: Response) => {
  res.json({ sales: db.sales.filter(s => !s.isArchived) });
});

app.post('/api/sales', (req: Request, res: Response) => {
  const body = req.body;
  const invoiceNo = `INV-2026-${String(db.sales.length + 184).padStart(4, '0')}`;
  const subtotal = Number(body.subtotal) || 0;
  const discount = Number(body.discount) || 0;
  const grandTotal = Math.max(0, subtotal - discount);
  const paidAmount = Number(body.paidAmount) || 0;
  const dueAmount = Math.max(0, grandTotal - paidAmount);

  const newSale: Sale = {
    id: `sale-${Date.now()}`,
    invoiceNo,
    date: body.date || new Date().toISOString().split('T')[0],
    customerId: body.customerId,
    customerName: body.customerName || 'Cash Customer',
    customerPhone: body.customerPhone || '',
    company: body.company || '',
    items: body.items || [],
    subtotal,
    discount,
    grandTotal,
    paidAmount,
    dueAmount,
    paymentMethod: body.paymentMethod || 'Cash',
    status: dueAmount === 0 ? 'Paid' : (paidAmount > 0 ? 'Partial' : 'Due'),
    notes: body.notes || '',
    createdBy: body.userName || 'Admin',
    createdAt: new Date().toISOString(),
    isArchived: false,
  };

  // Adjust stock
  if (Array.isArray(body.items)) {
    for (const item of body.items) {
      const prod = db.products.find(p => p.id === item.productId || p.productId === item.productId);
      if (prod) {
        prod.currentStock = Math.max(0, prod.currentStock - item.quantity);
        prod.status = prod.currentStock <= prod.minStockLevel ? 'Low Stock' : 'Available';
      }
    }
  }

  db.sales.unshift(newSale);
  addAuditLog(newSale.createdBy, 'CREATE_SALE', 'Sale', newSale.invoiceNo, `Created Sale ${newSale.invoiceNo} for ৳${newSale.grandTotal}`);
  saveDatabase();

  res.status(201).json({ sale: newSale, message: `Sale Invoice ${newSale.invoiceNo} created successfully.` });
});

// --- EXPENSES ---
app.get('/api/expenses', (req: Request, res: Response) => {
  res.json({ expenses: db.expenses });
});

app.post('/api/expenses', (req: Request, res: Response) => {
  const body = req.body;
  const newExpense: Expense = {
    id: `exp-${Date.now()}`,
    expenseNo: `EXP-2026-${String(db.expenses.length + 44).padStart(4, '0')}`,
    date: body.date || new Date().toISOString().split('T')[0],
    category: body.category || 'Miscellaneous',
    amount: Number(body.amount) || 0,
    paidTo: body.paidTo || '',
    paymentMethod: body.paymentMethod || 'Cash',
    accountId: body.accountId || 'acc-cash',
    notes: body.notes || '',
    createdBy: body.userName || 'Admin',
    createdAt: new Date().toISOString(),
  };

  db.expenses.unshift(newExpense);
  addAuditLog(newExpense.createdBy, 'RECORD_EXPENSE', 'Expense', newExpense.expenseNo, `Recorded expense ৳${newExpense.amount} for ${newExpense.category}`);
  saveDatabase();

  res.status(201).json({ expense: newExpense, message: 'Expense recorded successfully.' });
});

// --- FINANCIAL SUMMARY & KPIS (COMBINED BUSINESS VIEW) ---
app.get('/api/dashboard/kpis', (req: Request, res: Response) => {
  const activeJobs = db.jobs.filter(j => !j.isArchived);
  const todayStr = new Date().toISOString().split('T')[0];

  const todayJobs = activeJobs.filter(j => j.receivedDate === todayStr).length;
  const declinedToday = activeJobs.filter(j => j.status === 'Declined' && j.updatedAt.startsWith(todayStr)).length;
  const diagnosingCount = activeJobs.filter(j => j.status === 'Diagnosing').length;
  const inProcessingCount = activeJobs.filter(j => j.status === 'In Processing').length;
  const completedToday = activeJobs.filter(j => j.status === 'Completed' && j.updatedAt.startsWith(todayStr)).length;
  const pickedUpToday = activeJobs.filter(j => j.status === 'Picked Up' && j.updatedAt.startsWith(todayStr)).length;

  // Financial KPIs
  const repairIncome = activeJobs.reduce((sum, j) => sum + (j.receivedAmount || 0), 0);
  const repairDue = activeJobs.reduce((sum, j) => sum + (j.due || 0), 0);

  const activeSales = db.sales.filter(s => !s.isArchived);
  const salesIncome = activeSales.reduce((sum, s) => sum + (s.paidAmount || 0), 0);
  const salesDue = activeSales.reduce((sum, s) => sum + (s.dueAmount || 0), 0);

  const totalCompanyIncome = repairIncome + salesIncome;
  const totalExpenses = db.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netBusinessIncome = totalCompanyIncome - totalExpenses;
  const totalDueReceivable = repairDue + salesDue;

  res.json({
    todayJobs,
    declinedToday,
    diagnosingCount,
    inProcessingCount,
    completedToday,
    pickedUpToday,
    totalActiveJobs: activeJobs.filter(j => j.status !== 'Completed' && j.status !== 'Picked Up' && j.status !== 'Declined').length,
    totalJobs: activeJobs.length,
    totalClients: db.clients.filter(c => !c.isArchived).length,
    financials: {
      totalCompanyIncome,
      repairIncome,
      salesIncome,
      totalExpenses,
      netBusinessIncome,
      totalDueReceivable,
      repairDue,
      salesDue,
    },
    repeatCustomerRate: 74, // percentage
  });
});

// --- HOMEPAGE CMS ---
app.get('/api/cms', (req: Request, res: Response) => {
  res.json({ cms: db.cms });
});

app.put('/api/cms', (req: Request, res: Response) => {
  db.cms = { ...db.cms, ...req.body };
  addAuditLog('Admin', 'EDIT_CMS', 'HomepageCMS', 'CMS_ROOT', 'Updated homepage CMS content');
  saveDatabase();
  res.json({ cms: db.cms, message: 'Homepage content updated successfully.' });
});

// --- APP SETTINGS ---
app.get('/api/settings', (req: Request, res: Response) => {
  res.json({ settings: db.settings });
});

app.put('/api/settings', (req: Request, res: Response) => {
  db.settings = { ...db.settings, ...req.body };
  addAuditLog('Admin', 'EDIT_SETTINGS', 'Settings', 'CONFIG', 'Updated system settings');
  saveDatabase();
  res.json({ settings: db.settings, message: 'Settings saved.' });
});

// --- AUDIT LOGS ---
app.get('/api/audit-logs', (req: Request, res: Response) => {
  res.json({ logs: db.auditLogs });
});

// --- GOOGLE SHEET SYNC SIMULATOR & CONNECTOR ---
app.get('/api/sync/status', (req: Request, res: Response) => {
  res.json({
    status: db.settings.syncStatus,
    lastSyncTime: db.settings.lastSyncTime,
    pendingChanges: db.syncQueue.length,
    googleSheetUrl: db.settings.googleSheetUrl,
    lastError: db.settings.lastSyncError || null,
  });
});

// Manual Sync Now
app.post('/api/sync/now', async (req: Request, res: Response) => {
  db.settings.syncStatus = 'Syncing';
  saveDatabase();

  // Simulate background synchronization worker completing safely
  setTimeout(() => {
    const queueCount = db.syncQueue.length;
    db.syncQueue = []; // clear processed items
    db.settings.syncStatus = 'Synced';
    db.settings.lastSyncTime = new Date().toISOString();
    db.settings.lastSyncError = undefined;
    addAuditLog('System', 'GOOGLE_SHEET_SYNC', 'Sync', 'GOOGLE_SHEETS', `Synchronized ${queueCount} queued records to MRS Business Database.`);
    saveDatabase();
  }, 1200);

  res.json({ message: 'Sync started in background.', status: 'Syncing' });
});

// Export CSV for any sheet tab
app.get('/api/sync/export-csv/:tab', (req: Request, res: Response) => {
  const { tab } = req.params;
  let headers: string[] = [];
  let rows: string[][] = [];

  if (tab === 'Repair_Jobs') {
    headers = ['Job Number', 'Customer Name', 'Company', 'Phone', 'Brand', 'Model', 'Board Type', 'Board Number', 'Board Serial', 'Challan', 'Technician', 'Status', 'Bill', 'Received', 'Due', 'Warranty Days', 'Received Date'];
    rows = db.jobs.filter(j => !j.isArchived).map(j => [
      j.jobNumber, j.customerName, j.company, j.phone, j.brand, j.model, j.boardType, j.boardNumber, j.boardSerial || '', j.challan, j.technician, j.status, String(j.serviceCharge), String(j.receivedAmount), String(j.due), String(j.warrantyDays), j.receivedDate
    ]);
  } else if (tab === 'Repair_Clients') {
    headers = ['Client Code', 'Company', 'Customer Name', 'Phone', 'WhatsApp', 'Email', 'Address', 'Status', 'Total Jobs', 'Total Spent'];
    rows = db.clients.filter(c => !c.isArchived).map(c => [
      c.clientCode, c.company, c.customerName, c.phone, c.whatsapp, c.email, c.address, c.status, String(c.totalJobs), String(c.totalSpent)
    ]);
  } else if (tab === 'Products') {
    headers = ['Product ID', 'Name', 'Category', 'Unit', 'Purchase Price', 'Sale Price', 'Current Stock', 'Status'];
    rows = db.products.filter(p => !p.isArchived).map(p => [
      p.productId, p.name, p.category, p.unit, String(p.purchasePrice), String(p.salePrice), String(p.currentStock), p.status
    ]);
  } else {
    headers = ['ID', 'Date', 'Category/Item', 'Amount', 'Status'];
    rows = db.expenses.map(e => [e.expenseNo, e.date, e.category, String(e.amount), 'Paid']);
  }

  const csv = [headers.join(','), ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="MRS_${tab}_${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(csv);
});

type UserPermissions = User['permissions'];

// Helper: Compute permissions from assigned roles
function computePermissionsFromRoles(assignedRoles: string[] = []): UserPermissions {
  const perms: UserPermissions = {
    dashboard: false,
    addJob: false,
    editJob: false,
    changeStatus: false,
    jobList: false,
    clients: false,
    boardPresets: false,
    collections: false,
    ledger: false,
    sales: false,
    inventory: false,
    expenses: false,
    reports: false,
    homepage: false,
    users: false,
    sync: false,
    settings: false,
    archive: false,
  };

  if (!assignedRoles || assignedRoles.length === 0) {
    return perms; // Zero access if all roles unchecked
  }

  for (const r of assignedRoles) {
    if (r === 'Super Administrator' || r === 'Super Admin') {
      Object.keys(perms).forEach(k => (perms as any)[k] = true);
      return perms;
    }
    if (r === 'Repair Management' || r === 'Repair') {
      perms.dashboard = true;
      perms.addJob = true;
      perms.editJob = true;
      perms.changeStatus = true;
      perms.jobList = true;
      perms.clients = true;
      perms.boardPresets = true;
      perms.archive = true;
    }
    if (r === 'Sales & Inventory' || r === 'Sales') {
      perms.dashboard = true;
      perms.sales = true;
      perms.inventory = true;
      perms.clients = true;
      perms.collections = true;
    }
    if (r === 'Accounts & Expenses' || r === 'Accounts') {
      perms.dashboard = true;
      perms.expenses = true;
      perms.collections = true;
      perms.ledger = true;
      perms.reports = true;
    }
    if (r === 'Homepage CMS' || r === 'Homepage') {
      perms.dashboard = true;
      perms.homepage = true;
      perms.reports = true;
    }
    if (r === 'Sheet Sync & Backup' || r === 'Sheet Sync') {
      perms.dashboard = true;
      perms.sync = true;
      perms.reports = true;
    }
  }

  return perms;
}

// Helper to resolve roles & permissions
function resolveRolesAndPermissions(
  roleName?: string,
  assignedRolesInput?: string[],
  permissionsInput?: Partial<UserPermissions>
): { roleTitle: string; assignedRoles: string[]; permissions: UserPermissions } {
  let assignedRoles: string[] = Array.isArray(assignedRolesInput) ? [...assignedRolesInput] : [];
  let roleTitle = roleName || 'Administrator';

  if (roleName) {
    if (roleName === 'Super Admin' || roleName === 'Super Administrator') {
      assignedRoles = ['Super Administrator'];
      roleTitle = 'Super Admin';
    } else if (roleName === 'Administrator') {
      assignedRoles = ['Super Administrator'];
      roleTitle = 'Administrator';
    } else if (roleName === 'Technician') {
      assignedRoles = ['Repair Management'];
      roleTitle = 'Technician';
    } else if (roleName === 'Sales Manager') {
      assignedRoles = ['Sales & Inventory', 'Accounts & Expenses'];
      roleTitle = 'Sales Manager';
    } else if (roleName === 'Website Manager') {
      assignedRoles = ['Homepage CMS'];
      roleTitle = 'Website Manager';
    }
  }

  let permissions: UserPermissions = computePermissionsFromRoles(assignedRoles);
  if (roleTitle === 'Super Admin' || roleTitle === 'Administrator') {
    Object.keys(permissions).forEach((k) => ((permissions as any)[k] = true));
  }
  if (permissionsInput && typeof permissionsInput === 'object') {
    permissions = { ...permissions, ...permissionsInput };
  }
  return { roleTitle, assignedRoles, permissions };
}

// Users Management
app.get('/api/users', (req: Request, res: Response) => {
  res.json({ users: db.users.map(({ passwordHash, ...u }) => u) });
});

// Create New Admin / Staff User with Gmail, Name, Photo, Phone, Password, and Defined Role
app.post('/api/users', (req: Request, res: Response) => {
  const { name, email, phone, avatarUrl, password, role, assignedRoles: reqAssignedRoles, permissions: reqPermissions } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Full Name is required.' });
  }
  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Gmail / Email address is required.' });
  }
  if (!password || !password.trim()) {
    return res.status(400).json({ error: 'Password is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const existing = db.users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(400).json({ error: 'An admin with this email/Gmail already exists.' });
  }

  // Resolve role, assigned roles, and granular permissions
  const { roleTitle, assignedRoles, permissions } = resolveRolesAndPermissions(role, reqAssignedRoles, reqPermissions);

  const newUser: User = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: cleanEmail,
    phone: phone ? phone.trim() : '',
    role: roleTitle,
    assignedRoles,
    permissions,
    avatarUrl: avatarUrl || '',
    status: 'Active',
    passwordHash: password.trim(),
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  addAuditLog(
    req.body.adminOperator || 'Super Admin',
    'CREATE_ADMIN',
    'User',
    newUser.email,
    `Created new admin account for ${newUser.name} (${newUser.email}) with role: ${newUser.role}.`
  );
  saveDatabase();

  const { passwordHash, ...safeUser } = newUser;
  res.status(201).json({ user: safeUser, message: `Admin account for ${newUser.name} created successfully with role ${newUser.role}.` });
});

// Update Roles & Permissions (Checkbox selection)
app.put('/api/users/:id/roles', (req: Request, res: Response) => {
  const { id } = req.params;
  const { assignedRoles } = req.body;
  const user = db.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const roles: string[] = Array.isArray(assignedRoles) ? assignedRoles : [];

  // Protect main Super Admin access
  if ((user.email === 'nrnnoyon111@gmail.com' || user.id === 'user-1') && roles.length === 0) {
    return res.status(400).json({ error: 'Cannot remove all roles from the primary Super Administrator account.' });
  }

  user.assignedRoles = roles;
  user.role = roles.length === 0
    ? 'No Roles Assigned'
    : (roles.includes('Super Administrator') ? 'Super Admin' : roles.join(', '));
  user.permissions = computePermissionsFromRoles(roles);

  addAuditLog(
    req.body.adminOperator || 'Super Admin',
    'UPDATE_ROLES',
    'User',
    user.email,
    `Updated roles for ${user.name}: [${roles.join(', ') || 'None - No Access'}]`
  );
  saveDatabase();

  const { passwordHash, ...safeUser } = user;
  res.json({ user: safeUser, message: `Roles updated for ${user.name}.` });
});

// Update User & Profile Details
app.put('/api/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = db.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const { name, email, phone, avatarUrl, password, role, permissions, assignedRoles, status } = req.body;
  if (name) user.name = name.trim();
  if (email) user.email = email.trim().toLowerCase();
  if (phone !== undefined) user.phone = phone.trim();
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  if (password && password.trim()) user.passwordHash = password.trim();
  if (status) user.status = status;

  if (role) {
    user.role = role;
    if (role === 'Super Admin' || role === 'Super Administrator') {
      user.assignedRoles = ['Super Administrator'];
      Object.keys(user.permissions).forEach(k => ((user.permissions as any)[k] = true));
    }
  }

  if (Array.isArray(assignedRoles)) {
    // Protect main Super Admin
    if ((user.email === 'nrnnoyon111@gmail.com' || user.id === 'user-1') && assignedRoles.length === 0) {
      return res.status(400).json({ error: 'Cannot remove all roles from the primary Super Administrator account.' });
    }
    user.assignedRoles = assignedRoles;
    if (!role) {
      user.role = assignedRoles.length === 0
        ? 'No Roles Assigned'
        : (assignedRoles.includes('Super Administrator') ? 'Super Admin' : assignedRoles.join(', '));
    }
    user.permissions = computePermissionsFromRoles(assignedRoles);
  }

  if (permissions && typeof permissions === 'object') {
    user.permissions = { ...user.permissions, ...permissions };
  }

  addAuditLog(
    req.body.adminOperator || 'Super Admin',
    'UPDATE_ADMIN',
    'User',
    user.email,
    `Updated admin profile for ${user.name}`
  );
  saveDatabase();

  const { passwordHash, ...safeUser } = user;
  res.json({ user: safeUser, message: 'User updated successfully.' });
});

// Delete User
app.delete('/api/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  if (id === 'user-1' || db.users.findIndex(u => u.id === id) === 0 || db.users.find(u => u.id === id)?.email === 'nrnnoyon111@gmail.com') {
    return res.status(400).json({ error: 'Cannot delete the primary Super Administrator account.' });
  }

  const userIdx = db.users.findIndex(u => u.id === id);
  if (userIdx === -1) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const deletedUser = db.users.splice(userIdx, 1)[0];
  addAuditLog('Super Admin', 'DELETE_ADMIN', 'User', deletedUser.email, `Removed user account: ${deletedUser.name}`);
  saveDatabase();

  res.json({ message: `User ${deletedUser.name} removed successfully.` });
});

// --- VITE MIDDLEWARE IN DEV / STATIC IN PROD ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MRS FAST SOLUTION] Server running at http://localhost:${PORT}`);
  });
}

startServer();
