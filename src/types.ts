export type JobStatus = 'Received' | 'Diagnosing' | 'In Processing' | 'Completed' | 'Picked Up' | 'Declined';

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
  boardNumber: string;
  boardSerial?: string;
  problem?: string;
  remarks?: string;
  challan: string;
  technician: string;
  status: JobStatus;
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
  phoneSearchVerification: boolean;
  googleSheetUrl: string;
  autoSyncIntervalMinutes: number;
  lastSyncTime: string;
  syncStatus: 'Synced' | 'Syncing' | 'Pending' | 'Failed';
  lastSyncError?: string;
}

export interface DashboardKPIs {
  todayJobs: number;
  declinedToday: number;
  diagnosingCount: number;
  inProcessingCount: number;
  completedToday: number;
  pickedUpToday: number;
  totalActiveJobs: number;
  totalJobs: number;
  totalClients: number;
  financials: {
    totalCompanyIncome: number;
    repairIncome: number;
    salesIncome: number;
    totalExpenses: number;
    netBusinessIncome: number;
    totalDueReceivable: number;
    repairDue: number;
    salesDue: number;
  };
  repeatCustomerRate: number;
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
}
