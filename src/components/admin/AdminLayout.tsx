import React, { useState } from 'react';
import { MrsLogo } from '../MrsLogo';
import {
  LayoutDashboard,
  Wrench,
  PlusCircle,
  Users,
  ShoppingBag,
  Receipt,
  FileSpreadsheet,
  Globe,
  Shield,
  History,
  Archive,
  Settings,
  LogOut,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { User, AppSettings } from '../../types';
import { useToast } from '../Toast';

interface AdminLayoutProps {
  currentUser: User;
  settings: AppSettings;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  onOpenAddJob: () => void;
  onRefreshData: () => void;
  onLogout: () => void;
  onViewPublicSite: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentUser,
  settings,
  activeNav,
  setActiveNav,
  onOpenAddJob,
  onRefreshData,
  onLogout,
  onViewPublicSite,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { showToast } = useToast();

  const navCategories = [
    {
      title: 'Core Operations',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard' },
        { id: 'jobs', label: 'Repair Jobs', icon: Wrench, permission: 'jobList' },
        { id: 'clients', label: 'Client Directory', icon: Users, permission: 'clients' },
      ],
    },
    {
      title: 'Commerce & Accounts',
      items: [
        { id: 'sales', label: 'Sales & Inventory', icon: ShoppingBag, permission: 'sales' },
        { id: 'expenses', label: 'Accounts & Expenses', icon: Receipt, permission: 'expenses' },
      ],
    },
    {
      title: 'System & Synchronization',
      items: [
        { id: 'sync', label: 'Google Sheet Sync', icon: FileSpreadsheet, permission: 'sync' },
        { id: 'cms', label: 'Homepage CMS', icon: Globe, permission: 'homepage' },
        { id: 'users', label: 'Users & Roles', icon: Shield, permission: 'users' },
        { id: 'audit', label: 'Audit Logs', icon: History, permission: 'settings' },
        { id: 'archive', label: 'Archived Records', icon: Archive, permission: 'archive' },
        { id: 'settings', label: 'Settings', icon: Settings, permission: 'settings' },
      ],
    },
  ];

  const hasPermission = (permissionKey: string) => {
    return currentUser.role === 'Super Admin' || !!(currentUser.permissions as any)?.[permissionKey];
  };

  const activeTitle = (() => {
    for (const cat of navCategories) {
      const match = cat.items.find((i) => i.id === activeNav);
      if (match) return match.label;
    }
    return activeNav.replace('-', ' ');
  })();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row antialiased text-slate-800">
      
      {/* 1. Mobile Unified Top Navigation Bar (Single, non-duplicated) */}
      <header className="lg:hidden bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3.5 py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
            className="p-2 -ml-1 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 truncate">
            <MrsLogo variant="mark" size="sm" />
            <div className="truncate leading-tight">
              <span className="text-xs font-extrabold text-slate-900 block truncate">
                {activeTitle}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block">
                MRS Mirpur-13
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Right Controls: Refresh, Quick Add, Avatar */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              onRefreshData();
              showToast('Data refreshed', 'info');
            }}
            title="Refresh"
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenAddJob}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            title="Add Repair Job"
          >
            <PlusCircle className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="w-8 h-8 rounded-full overflow-hidden bg-blue-600 text-white font-bold flex items-center justify-center text-xs ring-2 ring-slate-100"
            >
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                currentUser.name.charAt(0)
              )}
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <p className="font-bold text-slate-900 truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{currentUser.email}</p>
                  <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    {currentUser.role}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    setActiveNav('settings');
                  }}
                  className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Account Settings</span>
                </button>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onViewPublicSite();
                  }}
                  className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>Public Website</span>
                </button>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full px-3.5 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer border-t border-slate-100"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Slide-Over Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 lg:hidden transition-opacity"
        />
      )}

      {/* 3. Left Sidebar (Fixed on Desktop, Slide-over on Mobile) */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 lg:w-64 bg-white border-r border-slate-200/90 z-50 flex flex-col justify-between transition-transform duration-200 ease-out shadow-xl lg:shadow-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* Brand Header */}
          <div className="px-5 py-4.5 border-b border-slate-100 flex items-center justify-between">
            <MrsLogo variant="tech" size="sm" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Snippet in Sidebar */}
          <div className="px-4 py-3 mx-3 my-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 ring-2 ring-white">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                currentUser.name.charAt(0)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate leading-snug">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 font-mono truncate">{currentUser.role}</p>
            </div>
          </div>

          {/* Quick Action Button (+ Add Job) */}
          <div className="px-3 pb-3">
            <button
              onClick={() => {
                setSidebarOpen(false);
                onOpenAddJob();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ NEW REPAIR JOB</span>
            </button>
          </div>

          {/* Grouped Navigation Items */}
          <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
            {navCategories.map((cat, catIdx) => {
              const visibleItems = cat.items.filter((item) => hasPermission(item.permission));
              if (visibleItems.length === 0) return null;

              return (
                <div key={catIdx} className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5 font-mono">
                    {cat.title}
                  </div>

                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeNav === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveNav(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}
                          />
                          <span>{item.label}</span>
                        </div>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-500" />}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </nav>

          {/* Bottom Switcher: Public Website, Sync, Logout */}
          <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/70">
            {/* Sheet Sync Status Pill */}
            <div className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg bg-white border border-slate-200">
              <span className="text-slate-500 font-mono">Sheet Sync</span>
              <span
                className={`font-bold flex items-center gap-1 ${
                  settings.syncStatus === 'Synced'
                    ? 'text-emerald-600'
                    : settings.syncStatus === 'Syncing'
                    ? 'text-blue-600 animate-pulse'
                    : 'text-amber-600'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                {settings.syncStatus}
              </span>
            </div>

            <button
              onClick={() => {
                setSidebarOpen(false);
                onViewPublicSite();
              }}
              className="w-full py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>Public Website</span>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>

            <button
              onClick={() => {
                setSidebarOpen(false);
                onLogout();
              }}
              className="w-full py-1.5 px-3 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span>Log Out</span>
            </button>
          </div>

        </div>
      </aside>

      {/* 4. Main Viewport Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Desktop Top Header Bar (Hidden on Mobile) */}
        <header className="hidden lg:flex sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 py-3.5 items-center justify-between gap-4">
          
          {/* Breadcrumb / Title */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-extrabold text-slate-900 capitalize tracking-tight">
              {activeTitle}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-md font-mono bg-slate-100 text-slate-600 font-medium">
              Mirpur 13 Lab
            </span>
          </div>

          {/* Right Zone: Global Refresh, Add Job, User Avatar */}
          <div className="flex items-center gap-3">
            
            <button
              onClick={() => {
                onRefreshData();
                showToast('Application data refreshed.', 'info');
              }}
              title="Refresh Data"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200/60"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenAddJob}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Job</span>
            </button>

            {/* Profile Avatar & Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/60"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    currentUser.name.charAt(0)
                  )}
                </div>
                <div className="text-left leading-none">
                  <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{currentUser.role}</div>
                </div>
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{currentUser.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setActiveNav('settings');
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Account Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer border-t border-slate-100"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </header>

        {/* Dynamic Main Workspace Content (with mobile bottom padding to prevent overlap) */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 lg:pb-8">
          {children}
        </main>

      </div>

      {/* 5. Mobile App-like Bottom Navigation Bar (Phone Thumb Zone) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1 flex items-center justify-around">
        <button
          onClick={() => setActiveNav('dashboard')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
            activeNav === 'dashboard' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveNav('jobs')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
            activeNav === 'jobs' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4 mb-0.5" />
          <span>Jobs</span>
        </button>

        {/* Highlighted Add Job Button in center */}
        <button
          onClick={onOpenAddJob}
          className="flex flex-col items-center justify-center -mt-4 w-11 h-11 rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all cursor-pointer ring-4 ring-white"
          title="Add Job"
        >
          <PlusCircle className="w-5 h-5" />
        </button>

        <button
          onClick={() => setActiveNav('sales')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
            activeNav === 'sales' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4 mb-0.5" />
          <span>Sales</span>
        </button>

        <button
          onClick={() => setSidebarOpen(true)}
          className="flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <Menu className="w-4 h-4 mb-0.5" />
          <span>Menu</span>
        </button>
      </nav>

    </div>
  );
};
