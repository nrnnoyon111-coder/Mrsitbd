import React, { useState } from 'react';
import { MrsLogo } from '../MrsLogo';
import { Phone, Lock, Menu, X, Search, ShieldCheck } from 'lucide-react';

interface PublicHeaderProps {
  onOpenTracker: () => void;
  onOpenHistory: () => void;
  onOpenAdminLogin: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({
  onOpenTracker,
  onOpenHistory,
  onOpenAdminLogin,
  activeTab,
  setActiveTab,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'tracker', label: 'Job Tracker' },
    { id: 'history', label: 'Job History' },
    { id: 'services', label: 'Services' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    if (id === 'tracker') onOpenTracker();
    if (id === 'history') onOpenHistory();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      {/* Top micro bar for hotline */}
      <div className="bg-slate-900 text-slate-300 text-[11px] px-4 sm:px-8 py-1.5 flex justify-between items-center font-mono">
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-slate-400">Dhaka Mirpur-13 Lab & Sales Center</span>
          <span className="flex items-center gap-1 text-slate-200">
            <Phone className="w-3 h-3 text-blue-400" />
            01334362397 / 01869217526
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Official Warranty Guarantee
          </span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:inline text-slate-300">Sat - Thu: 9:30 AM - 8:30 PM</span>
        </div>
      </div>

      {/* Main Top Bar Contract: Brand - 4-5 Nav Links - 1 Action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-18 flex items-center justify-between gap-8">
        
        {/* Brand Zone (Single element) */}
        <button
          onClick={() => handleNavClick('home')}
          className="text-left focus:outline-none cursor-pointer"
        >
          <MrsLogo variant="full" size="md" />
        </button>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-600">
          {navLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === item.id ? 'text-blue-600 font-bold' : ''
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleNavClick('tracker')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer border border-blue-200/60"
          >
            <Search className="w-3.5 h-3.5 text-blue-600" />
            Track Job
          </button>

          <button
            onClick={onOpenAdminLogin}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-blue-400" />
            Staff Portal
          </button>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={() => handleNavClick('tracker')}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
            title="Track Job"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <div className="flex flex-col gap-2">
            {navLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === item.id ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdminLogin();
              }}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-slate-900 rounded-lg text-center flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              Staff / Admin Login
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
