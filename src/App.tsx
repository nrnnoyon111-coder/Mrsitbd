import React, { useState, useEffect } from 'react';
import { ToastProvider, useToast } from './components/Toast';
import { PublicHeader } from './components/public/PublicHeader';
import { PublicHero } from './components/public/PublicHero';
import { PublicServices } from './components/public/PublicServices';
import { PublicAbout } from './components/public/PublicAbout';
import { PublicFooter } from './components/public/PublicFooter';
import { PublicTracker } from './components/public/PublicTracker';
import { PublicJobHistory } from './components/public/PublicJobHistory';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AddJobModal } from './components/admin/AddJobModal';
import { JobList } from './components/admin/JobList';
import { IndTechCore } from './components/admin/IndTechCore';
import { ClientList } from './components/admin/ClientList';
import { SalesModule } from './components/admin/SalesModule';
import { ExpensesModule } from './components/admin/ExpensesModule';
import { SheetSyncMonitor } from './components/admin/SheetSyncMonitor';
import { HomepageCMSAdmin } from './components/admin/HomepageCMSAdmin';
import { UsersAndRoles } from './components/admin/UsersAndRoles';
import { AuditLogViewer } from './components/admin/AuditLogViewer';
import { ArchiveViewer } from './components/admin/ArchiveViewer';
import { SystemSettings } from './components/admin/SystemSettings';
import { ReceiptModal } from './components/ReceiptModal';
import {
  RepairJob,
  Client,
  Product,
  Sale,
  Expense,
  User,
  HomepageCMS,
  PresetData,
  AppSettings,
  DashboardKPIs,
  AuditLog,
} from './types';

function MainApp() {
  const { showToast } = useToast();

  // Mode: 'public' or 'admin'
  const [appMode, setAppMode] = useState<'public' | 'admin'>('public');
  const [publicTab, setPublicTab] = useState<string>('home');
  const [adminNav, setAdminNav] = useState<string>('dashboard');
  const [jobViewStyle, setJobViewStyle] = useState<'indtech' | 'classic'>('indtech');

  // Modals
  const [showTrackerModal, setShowTrackerModal] = useState(false);
  const [trackerInitialQuery, setTrackerInitialQuery] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [printReceiptJob, setPrintReceiptJob] = useState<RepairJob | null>(null);

  // Authenticated User
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Core Application Data State
  const [jobs, setJobs] = useState<RepairJob[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Config & CMS
  const [presets, setPresets] = useState<PresetData>({
    brands: ['Hashima', 'Juki', 'Jack', 'Brother', 'Pegasus', 'Kansai Special', 'Siruba', 'Yamato', 'Eastman'],
    boardTypes: ['Main Board', 'Servo Board', 'CTL Board', 'Power Supply', 'Operation Panel', 'Inverter Drive (VFD)'],
    models: [],
    technicians: ['Md. Rakibul Islam', 'Md. Karim Ullah'],
    statuses: [],
  });

  const [cms, setCms] = useState<HomepageCMS>({
    companyName: 'MRS FAST SOLUTIONS',
    tagline: 'Your Trusted Partner in industrial World',
    subTagline: 'All kinds of Electronic Goods, Importer, Seller & Repaireing',
    heroHeadline: 'Industrial Electronics Circuit Repairing & Parts Importer',
    heroSubheadline: 'Component-level diagnostic repairs for Hashima, Juki, Jack, Brother, and all major industrial garment & automation control boards.',
    proprietorName: 'Md. Rakibul Islam',
    proprietorTitle: 'Proprietor & Chief Electronics Engineer',
    yearsOfExperience: 11,
    happyClientsCount: 420,
    repairedBoardsCount: 3850,
    phonePrimary: '+88 01334362397',
    phoneSecondary: '+88 01575521781',
    whatsappNumber: '+8801334362397',
    email: 'mrsfastsolutions@gmail.com',
    officeAddress: 'City Corporation Market, Karn Shopping Complex (2nd Floor), Shop No- 61, Mirpur- 13, Dhaka- 1216',
    noticeText: '📢 Live tracking is active: Enter your Job Number (e.g. M0001) or Challan to track repair status in real time.',
    noticeEnabled: true,
    heroImage: '/src/assets/images/hero_industrial_electronics_1791971360769.jpg',
    aboutStory: 'Founded in 2015, MRS Fast Solutions has grown into Bangladesh’s foremost technical facility for industrial electronic circuit diagnostics.',
    workingHours: 'Saturday to Thursday: 09:30 AM – 08:30 PM (Friday Closed)',
  });

  const [settings, setSettings] = useState<AppSettings>({
    currency: 'BDT',
    currencySymbol: '৳',
    timezone: 'Asia/Dhaka',
    jobNumberPrefix: 'M',
    nextJobSequence: 7,
    publicBillVisible: true,
    publicDueVisible: true,
    publicWarrantyVisible: true,
    phoneSearchVerification: false,
    googleSheetUrl: 'https://docs.google.com/spreadsheets/d/1Z82Zest1qvdeTQDKg18vI_wZmP5pStjV59j4ryM8_rs/edit?usp=drivesdk',
    autoSyncIntervalMinutes: 5,
    lastSyncTime: new Date().toISOString(),
    syncStatus: 'Synced',
  });

  const [kpis, setKpis] = useState<DashboardKPIs>({
    todayJobs: 1,
    declinedToday: 0,
    diagnosingCount: 1,
    inProcessingCount: 1,
    completedToday: 2,
    pickedUpToday: 1,
    totalActiveJobs: 4,
    totalJobs: 6,
    totalClients: 6,
    financials: {
      totalCompanyIncome: 24700,
      repairIncome: 14700,
      salesIncome: 10000,
      totalExpenses: 25300,
      netBusinessIncome: 45000,
      totalDueReceivable: 6500,
      repairDue: 4000,
      salesDue: 2500,
    },
    repeatCustomerRate: 74,
  });

  // Fetch all initial data from Fast In-Memory Database
  const fetchAllData = async () => {
    try {
      const [
        jobsRes,
        clientsRes,
        productsRes,
        salesRes,
        expensesRes,
        usersRes,
        presetsRes,
        cmsRes,
        settingsRes,
        kpiRes,
        auditRes,
      ] = await Promise.all([
        fetch('/api/jobs').then((r) => r.json()),
        fetch('/api/clients').then((r) => r.json()),
        fetch('/api/products').then((r) => r.json()),
        fetch('/api/sales').then((r) => r.json()),
        fetch('/api/expenses').then((r) => r.json()),
        fetch('/api/users').then((r) => r.json()),
        fetch('/api/presets').then((r) => r.json()),
        fetch('/api/cms').then((r) => r.json()),
        fetch('/api/settings').then((r) => r.json()),
        fetch('/api/dashboard/kpis').then((r) => r.json()),
        fetch('/api/audit-logs').then((r) => r.json()),
      ]);

      if (jobsRes?.jobs) setJobs(jobsRes.jobs);
      if (clientsRes?.clients) setClients(clientsRes.clients);
      if (productsRes?.products) setProducts(productsRes.products);
      if (salesRes?.sales) setSales(salesRes.sales);
      if (expensesRes?.expenses) setExpenses(expensesRes.expenses);
      if (usersRes?.users) setUsers(usersRes.users);
      if (presetsRes?.presets) setPresets(presetsRes.presets);
      if (cmsRes?.cms) setCms(cmsRes.cms);
      if (settingsRes?.settings) setSettings(settingsRes.settings);
      if (kpiRes) setKpis(kpiRes);
      if (auditRes?.logs) setAuditLogs(auditRes.logs);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Quick Tracking Trigger from Homepage
  const handleHeroTrack = (query: string) => {
    setTrackerInitialQuery(query);
    setShowTrackerModal(true);
  };

  // Job created callback
  const handleJobCreated = (newJob: RepairJob) => {
    setJobs((prev) => [newJob, ...prev]);
    fetchAllData(); // Refresh KPIs and sequences
  };

  // Job updated callback
  const handleJobUpdated = (updatedJob: RepairJob) => {
    setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
    fetchAllData();
  };

  // Job archive callback
  const handleJobArchived = async (jobId: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/archive`, { method: 'POST' });
      if (res.ok) {
        showToast('Job moved to archive.', 'info');
        setJobs((prev) => prev.filter((j) => j.id !== jobId));
        fetchAllData();
      }
    } catch (err) {
      showToast('Archive failed', 'error');
    }
  };

  // Client created callback
  const handleClientCreated = (newClient: Client) => {
    setClients((prev) => [newClient, ...prev]);
  };

  // Client updated callback
  const handleClientUpdated = (updatedClient: Client) => {
    setClients((prev) => prev.map((c) => (c.id === updatedClient.id ? updatedClient : c)));
  };

  // Filter jobs by client name from ClientList
  const handleViewClientJobs = (clientName: string) => {
    setAdminNav('jobs');
  };

  // Product created callback
  const handleProductCreated = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  // Sale created callback
  const handleSaleCreated = (newSale: Sale) => {
    setSales((prev) => [newSale, ...prev]);
    fetchAllData();
  };

  // Expense created callback
  const handleExpenseCreated = (newExpense: Expense) => {
    setExpenses((prev) => [newExpense, ...prev]);
    fetchAllData();
  };

  // Successful Login
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setAppMode('admin');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAppMode('public');
    showToast('Logged out of staff portal.', 'info');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* PUBLIC MODE */}
      {appMode === 'public' ? (
        <div className="flex flex-col min-h-screen">
          <PublicHeader
            activeTab={publicTab}
            setActiveTab={setPublicTab}
            onOpenTracker={() => {
              setTrackerInitialQuery('');
              setShowTrackerModal(true);
            }}
            onOpenHistory={() => setShowHistoryModal(true)}
            onOpenAdminLogin={() => setShowAdminLoginModal(true)}
          />

          <main className="flex-1">
            <PublicHero
              cms={cms}
              onTrack={handleHeroTrack}
              onOpenHistory={() => setShowHistoryModal(true)}
            />

            <PublicServices />

            <PublicAbout cms={cms} />
          </main>

          <PublicFooter
            cms={cms}
            onOpenTracker={() => {
              setTrackerInitialQuery('');
              setShowTrackerModal(true);
            }}
            onOpenHistory={() => setShowHistoryModal(true)}
            onOpenAdminLogin={() => setShowAdminLoginModal(true)}
          />
        </div>
      ) : (
        /* ADMIN MODE */
        <AdminLayout
          currentUser={currentUser || users[0]}
          settings={settings}
          activeNav={adminNav}
          setActiveNav={setAdminNav}
          onOpenAddJob={() => setShowAddJobModal(true)}
          onRefreshData={fetchAllData}
          onLogout={handleLogout}
          onViewPublicSite={() => setAppMode('public')}
        >
          {adminNav === 'dashboard' && (
            <AdminDashboard
              kpis={kpis}
              recentJobs={jobs}
              products={products}
              onOpenAddJob={() => setShowAddJobModal(true)}
              onViewJob={(job) => {
                setTrackerInitialQuery(job.jobNumber);
                setShowTrackerModal(true);
              }}
              onPrintJob={(job) => setPrintReceiptJob(job)}
              onNavigate={(nav) => setAdminNav(nav)}
            />
          )}

          {adminNav === 'jobs' && (
            <JobList
              jobs={jobs}
              presets={presets}
              onRefresh={fetchAllData}
              onOpenAddJob={() => setShowAddJobModal(true)}
              onUpdateJob={handleJobUpdated}
              onArchiveJob={handleJobArchived}
            />
          )}

          {adminNav === 'clients' && (
            <ClientList
              clients={clients}
              onAddClient={handleClientCreated}
              onUpdateClient={handleClientUpdated}
              onViewClientJobs={handleViewClientJobs}
            />
          )}

          {adminNav === 'sales' && (
            <SalesModule
              products={products}
              sales={sales}
              onAddProduct={handleProductCreated}
              onAddSale={handleSaleCreated}
            />
          )}

          {adminNav === 'expenses' && (
            <ExpensesModule
              expenses={expenses}
              onAddExpense={handleExpenseCreated}
            />
          )}

          {adminNav === 'sync' && (
            <SheetSyncMonitor
              settings={settings}
              onRefreshSettings={fetchAllData}
            />
          )}

          {adminNav === 'cms' && (
            <HomepageCMSAdmin
              cms={cms}
              onUpdateCMS={(newCms) => setCms(newCms)}
              onViewPublicSite={() => setAppMode('public')}
            />
          )}

          {adminNav === 'users' && (
            <UsersAndRoles
              users={users}
              onAddUser={(newUser) => {
                setUsers((prev) => [...prev, newUser]);
                fetchAllData();
              }}
              onUpdateUser={(updatedUser) => {
                setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
                fetchAllData();
              }}
              onDeleteUser={(userId) => {
                setUsers((prev) => prev.filter((u) => u.id !== userId));
                fetchAllData();
              }}
            />
          )}

          {adminNav === 'audit' && (
            <AuditLogViewer logs={auditLogs} />
          )}

          {adminNav === 'archive' && (
            <ArchiveViewer onRefresh={fetchAllData} />
          )}

          {adminNav === 'settings' && (
            <SystemSettings
              settings={settings}
              onUpdateSettings={(newSettings) => setSettings(newSettings)}
            />
          )}
        </AdminLayout>
      )}

      {/* MODALS */}

      {/* Public Job Tracker Modal */}
      {showTrackerModal && (
        <PublicTracker
          initialQuery={trackerInitialQuery}
          onClose={() => setShowTrackerModal(false)}
        />
      )}

      {/* Public Job History Modal */}
      {showHistoryModal && (
        <PublicJobHistory
          onClose={() => setShowHistoryModal(false)}
          onSelectJob={(jobNumber) => {
            setTrackerInitialQuery(jobNumber);
            setShowTrackerModal(true);
          }}
        />
      )}

      {/* Admin / Staff Login Modal */}
      {showAdminLoginModal && (
        <AdminLoginModal
          onClose={() => setShowAdminLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Add Job Modal */}
      {showAddJobModal && (
        <AddJobModal
          clients={clients}
          presets={presets}
          onClose={() => setShowAddJobModal(false)}
          onJobCreated={handleJobCreated}
          onClientCreated={handleClientCreated}
        />
      )}

      {/* Printable Receipt Modal */}
      {printReceiptJob && (
        <ReceiptModal
          job={printReceiptJob}
          type="intake"
          onClose={() => setPrintReceiptJob(null)}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
