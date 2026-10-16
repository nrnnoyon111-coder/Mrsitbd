import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Sun,
  Moon,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  EyeOff,
  Calendar,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Printer,
  DollarSign,
  ArrowRight,
  X,
  Layers,
  Sparkles,
  Check,
} from 'lucide-react';
import { useToast } from '../Toast';
import { ReceiptModal } from '../ReceiptModal';
import { RepairJob } from '../../types';

interface BoardEntry {
  id: string;
  model: string;
  serial: string;
  issue: string;
  remark: string;
}

interface PendingJob {
  id: string;
  tag: string;
  client: string;
  gatepass: string;
  model: string;
  serial: string;
  issue: string;
  remark: string;
  date: string;
  status: string;
}

interface HistoryRecord {
  id: string;
  tag: string;
  client: string;
  gatepass: string;
  model: string;
  serial: string;
  issue: string;
  remark: string;
  date: string;
  deliveryDate?: string;
  status: string;
  paymentStatus: 'PAID' | 'DUE' | 'FREE' | 'PENDING';
  amount: number;
  due: number;
  invoice?: string;
  receiver?: string;
}

interface IndTechCoreProps {
  onJobUpdated?: () => void;
  onRequestClassicView?: () => void;
}

export const IndTechCore: React.FC<IndTechCoreProps> = ({
  onJobUpdated,
  onRequestClassicView,
}) => {
  const { showToast } = useToast();

  // Dark / Light Mode (localStorage synced)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('indtech_theme') === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('indtech_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Active Tab: REGISTER | DELIVERY | HISTORY
  const [activeTab, setActiveTab] = useState<'REGISTER' | 'DELIVERY' | 'HISTORY'>('REGISTER');

  // ==========================================
  // MODULE 1: REGISTER STATE
  // ==========================================
  const [nextTagId, setNextTagId] = useState<string>('26163');
  const [gatePass, setGatePass] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [clientSearchList, setClientSearchList] = useState<string[]>([]);
  const [showClientDropdown, setShowClientDropdown] = useState<boolean>(false);
  const clientDropdownRef = useRef<HTMLDivElement>(null);

  const [boards, setBoards] = useState<BoardEntry[]>([
    { id: '1', model: '', serial: '', issue: '', remark: '' },
  ]);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  // Fetch next Tag ID & Client List
  const fetchRegisterMeta = async () => {
    try {
      const [tagRes, clientRes] = await Promise.all([
        fetch('/api/indtech?action=getNextTag'),
        fetch('/api/indtech?action=getClients'),
      ]);
      const tagData = await tagRes.json();
      const clientData = await clientRes.json();

      if (tagData.nextTag) setNextTagId(tagData.nextTag);
      if (Array.isArray(clientData.clients)) setClientSearchList(clientData.clients);
    } catch (err) {
      console.error('Error fetching register meta:', err);
    }
  };

  useEffect(() => {
    fetchRegisterMeta();
  }, []);

  // Close client dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(e.target as Node)) {
        setShowClientDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter client suggestions
  const filteredClients = useMemo(() => {
    if (!clientName.trim()) return clientSearchList.slice(0, 8);
    const q = clientName.toLowerCase();
    return clientSearchList.filter((c) => c.toLowerCase().includes(q)).slice(0, 8);
  }, [clientName, clientSearchList]);

  // Board item manipulations
  const handleAddBoard = () => {
    setBoards((prev) => [
      ...prev,
      { id: String(Date.now()), model: '', serial: '', issue: '', remark: '' },
    ]);
  };

  const handleRemoveBoard = (index: number) => {
    if (boards.length <= 1) return;
    setBoards((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleBoardChange = (index: number, field: keyof BoardEntry, value: string) => {
    setBoards((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Submit Register Form
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      showToast('Please enter or select a Client Name.', 'error');
      return;
    }

    // Validate boards have models
    const hasEmptyModel = boards.some((b) => !b.model.trim());
    if (hasEmptyModel) {
      showToast('Please enter the Board Name / Hardware Model for all attached boards.', 'error');
      return;
    }

    setIsRegistering(true);
    try {
      const payload = {
        action: 'saveEntry',
        client: clientName.trim(),
        gatepass: gatePass.trim(),
        boards: boards.map((b) => ({
          model: b.model.trim(),
          serial: b.serial.trim(),
          issue: b.issue.trim(),
          remark: b.remark.trim(),
        })),
      };

      const res = await fetch('/api/indtech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register job log');
      }

      showToast(
        `SUCCESS: Registered ${boards.length} board(s) under Base Tag ${data.baseTag || nextTagId}!`,
        'success'
      );

      // Reset form
      setClientName('');
      setGatePass('');
      setBoards([{ id: String(Date.now()), model: '', serial: '', issue: '', remark: '' }]);
      if (data.nextTag) {
        setNextTagId(data.nextTag);
      } else {
        fetchRegisterMeta();
      }

      if (onJobUpdated) onJobUpdated();
    } catch (err: any) {
      showToast(err.message || 'Error registering jobs', 'error');
    } finally {
      setIsRegistering(false);
    }
  };

  // ==========================================
  // MODULE 2: DELIVERY (PENDING DISPATCH) STATE
  // ==========================================
  const [pendingJobs, setPendingJobs] = useState<PendingJob[]>([]);
  const [pendingSearch, setPendingSearch] = useState<string>('');
  const [activeLeaderCard, setActiveLeaderCard] = useState<string | null>(null);
  const [isLoadingPending, setIsLoadingPending] = useState<boolean>(false);

  // Dispatch Modal State
  const [dispatchModalJob, setDispatchModalJob] = useState<PendingJob | null>(null);
  const [dispatchPaymentStatus, setDispatchPaymentStatus] = useState<'PAID' | 'DUE' | 'FREE SERVICE'>('PAID');
  const [dispatchAmount, setDispatchAmount] = useState<string>('');
  const [dispatchInvoice, setDispatchInvoice] = useState<string>('');
  const [dispatchReceiver, setDispatchReceiver] = useState<string>('');
  const [isSubmittingDispatch, setIsSubmittingDispatch] = useState<boolean>(false);

  const fetchPendingJobs = async () => {
    setIsLoadingPending(true);
    try {
      const res = await fetch('/api/indtech?action=getPending');
      const data = await res.json();
      if (Array.isArray(data.jobs)) {
        setPendingJobs(data.jobs);
      }
    } catch (err) {
      console.error('Error fetching pending jobs:', err);
    } finally {
      setIsLoadingPending(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'DELIVERY') {
      fetchPendingJobs();
    }
  }, [activeTab]);

  const filteredPending = useMemo(() => {
    if (!pendingSearch.trim()) return pendingJobs;
    const q = pendingSearch.toLowerCase();
    return pendingJobs.filter(
      (j) =>
        j.client.toLowerCase().includes(q) ||
        j.tag.toLowerCase().includes(q) ||
        j.model.toLowerCase().includes(q) ||
        j.serial.toLowerCase().includes(q) ||
        j.gatepass.toLowerCase().includes(q) ||
        j.issue.toLowerCase().includes(q)
    );
  }, [pendingJobs, pendingSearch]);

  const handleOpenDispatchModal = (job: PendingJob, e: React.MouseEvent) => {
    e.stopPropagation();
    setDispatchModalJob(job);
    setDispatchPaymentStatus('PAID');
    setDispatchAmount('');
    setDispatchInvoice(`INV-${job.tag}`);
    setDispatchReceiver('');
  };

  const handleCompleteDispatch = async () => {
    if (!dispatchModalJob) return;
    setIsSubmittingDispatch(true);

    try {
      const payload = {
        action: 'releaseJob',
        tagId: dispatchModalJob.tag,
        paymentStatus: dispatchPaymentStatus,
        amount: Number(dispatchAmount) || 0,
        invoice: dispatchInvoice.trim(),
        receiver: dispatchReceiver.trim(),
      };

      const res = await fetch('/api/indtech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch job');

      showToast(`DISPATCH COMPLETE: Tag ${dispatchModalJob.tag} released!`, 'success');
      setDispatchModalJob(null);
      fetchPendingJobs();
      if (onJobUpdated) onJobUpdated();
    } catch (err: any) {
      showToast(err.message || 'Error processing dispatch', 'error');
    } finally {
      setIsSubmittingDispatch(false);
    }
  };

  // ==========================================
  // MODULE 3: HISTORY (AUDIT HISTORY) STATE
  // ==========================================
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [historySearch, setHistorySearch] = useState<string>('');
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'PAID' | 'DUE' | 'FREE' | 'PENDING'>('ALL');
  const [isAmountsMasked, setIsAmountsMasked] = useState<boolean>(true);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  // Date Range Filter State
  const [showDateFilter, setShowDateFilter] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [appliedDateRange, setAppliedDateRange] = useState<{ start: string; end: string } | null>(null);

  // Due Collection Modal
  const [dueCollectJob, setDueCollectJob] = useState<HistoryRecord | null>(null);
  const [dueCollectAmount, setDueCollectAmount] = useState<string>('');
  const [isCollectingDue, setIsCollectingDue] = useState<boolean>(false);

  // Receipt Modal Print
  const [printReceiptJob, setPrintReceiptJob] = useState<RepairJob | null>(null);

  const fetchHistoryRecords = async () => {
    try {
      const res = await fetch('/api/indtech?action=getAllRecordsFull');
      const data = await res.json();
      if (Array.isArray(data.records)) {
        setHistoryRecords(data.records);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'HISTORY') {
      fetchHistoryRecords();
    }
  }, [activeTab]);

  // Filtered History Records
  const filteredHistory = useMemo(() => {
    return historyRecords.filter((rec) => {
      // Status filter
      if (historyFilter === 'PAID' && rec.paymentStatus !== 'PAID') return false;
      if (historyFilter === 'DUE' && rec.paymentStatus !== 'DUE') return false;
      if (historyFilter === 'FREE' && rec.paymentStatus !== 'FREE') return false;
      if (historyFilter === 'PENDING' && rec.paymentStatus !== 'PENDING') return false;

      // Date Range Filter
      if (appliedDateRange && appliedDateRange.start && appliedDateRange.end) {
        const itemDate = rec.date || '';
        if (itemDate < appliedDateRange.start || itemDate > appliedDateRange.end) {
          return false;
        }
      }

      // Search
      if (historySearch.trim()) {
        const q = historySearch.toLowerCase();
        const matches =
          rec.client.toLowerCase().includes(q) ||
          rec.tag.toLowerCase().includes(q) ||
          rec.model.toLowerCase().includes(q) ||
          rec.serial.toLowerCase().includes(q) ||
          rec.gatepass.toLowerCase().includes(q) ||
          rec.issue.toLowerCase().includes(q) ||
          (rec.invoice && rec.invoice.toLowerCase().includes(q)) ||
          (rec.receiver && rec.receiver.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [historyRecords, historyFilter, appliedDateRange, historySearch]);

  // Calculated Stats based on visible/filtered cards
  const stats = useMemo(() => {
    let totalPaid = 0;
    let marketDue = 0;
    let freeJobs = 0;

    filteredHistory.forEach((r) => {
      if (r.paymentStatus === 'PAID') {
        totalPaid += r.amount;
      } else if (r.paymentStatus === 'DUE') {
        marketDue += r.due || r.amount;
      } else if (r.paymentStatus === 'FREE') {
        freeJobs += 1;
      }
    });

    return { totalPaid, marketDue, freeJobs };
  }, [filteredHistory]);

  const handleApplyDateFilter = () => {
    if (!startDate || !endDate) {
      showToast('Please select both Start Date and End Date', 'error');
      return;
    }
    setAppliedDateRange({ start: startDate, end: endDate });
    showToast(`Date filter applied: ${startDate} to ${endDate}`, 'info');
  };

  const handleClearDateFilter = () => {
    setStartDate('');
    setEndDate('');
    setAppliedDateRange(null);
  };

  const handleSettleDue = async () => {
    if (!dueCollectJob) return;
    setIsCollectingDue(true);
    try {
      const collectVal = Number(dueCollectAmount) || dueCollectJob.due;
      const res = await fetch('/api/indtech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'collectDue',
          tagId: dueCollectJob.tag,
          amount: collectVal,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to collect due');

      showToast(`SUCCESS: Due payment of ৳${collectVal.toLocaleString()} collected!`, 'success');
      setDueCollectJob(null);
      fetchHistoryRecords();
      if (onJobUpdated) onJobUpdated();
    } catch (err: any) {
      showToast(err.message || 'Error collecting due', 'error');
    } finally {
      setIsCollectingDue(false);
    }
  };

  // Convert HistoryRecord to RepairJob shape for ReceiptModal
  const handlePrintSlip = (rec: HistoryRecord) => {
    const slipJob: RepairJob = {
      id: rec.id,
      jobNumber: rec.tag,
      receivedDate: rec.date,
      deliveryDate: rec.deliveryDate,
      customerName: rec.client,
      company: rec.client,
      phone: '01869217526',
      brand: 'Industrial',
      model: rec.model,
      boardType: rec.model,
      boardNumber: rec.serial || rec.tag,
      boardSerial: rec.serial,
      problem: rec.issue,
      remarks: rec.remark,
      challan: rec.gatepass || `GP-${rec.tag}`,
      technician: rec.receiver || 'MD. RAKIBUL ISLAM',
      status: (rec.status as any) || 'Completed',
      serviceCharge: rec.amount,
      receivedAmount: rec.paymentStatus === 'PAID' ? rec.amount : 0,
      due: rec.due || (rec.paymentStatus === 'DUE' ? rec.amount : 0),
      warrantyDays: 30,
      branch: 'Mirpur Head Office',
      isArchived: false,
      createdAt: rec.date,
      updatedAt: rec.date,
      syncStatus: 'synced',
    };
    setPrintReceiptJob(slipJob);
  };

  return (
    <div
      className={`min-h-screen relative font-body transition-colors duration-300 ${
        isDarkMode ? 'dark text-[#f2f2f7]' : 'text-[#1d1d1f]'
      }`}
      style={{
        backgroundColor: isDarkMode ? '#000000' : '#f5f5f7',
      }}
    >
      {/* 
        =======================================================
        AMBIENT ANIMATED BLOBS BACKGROUND (Fixed full-screen)
        3 orbiting circular blobs (320px x 320px), linear infinite
        =======================================================
      */}
      <div
        className="fixed inset-0 overflow-hidden pointer-events-none -z-10"
        style={{
          filter: isDarkMode ? 'blur(110px)' : 'blur(70px)',
        }}
      >
        {isDarkMode ? (
          <>
            {/* Dark Mode Blobs */}
            <div
              className="absolute top-1/4 left-1/5 w-80 h-80 rounded-full animate-orbit-blob1 opacity-70"
              style={{ backgroundColor: '#bf5af2', mixBlendMode: 'screen' }}
            />
            <div
              className="absolute top-1/2 right-1/4 w-80 h-80 rounded-full animate-orbit-blob2 opacity-60"
              style={{ backgroundColor: '#0a84ff', mixBlendMode: 'screen' }}
            />
            <div
              className="absolute bottom-1/5 left-1/3 w-80 h-80 rounded-full animate-orbit-blob3 opacity-60"
              style={{ backgroundColor: '#ff9f0a', mixBlendMode: 'screen' }}
            />
          </>
        ) : (
          <>
            {/* Light Mode Blobs */}
            <div
              className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full animate-orbit-blob1 opacity-60"
              style={{ backgroundColor: '#dbdaea', mixBlendMode: 'multiply' }}
            />
            <div
              className="absolute top-1/2 right-1/4 w-80 h-80 rounded-full animate-orbit-blob2 opacity-60"
              style={{ backgroundColor: '#d2e3fc', mixBlendMode: 'multiply' }}
            />
            <div
              className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full animate-orbit-blob3 opacity-60"
              style={{ backgroundColor: '#e2f4f2', mixBlendMode: 'multiply' }}
            />
          </>
        )}
      </div>

      {/* 
        =======================================================
        STICKY GLASS HEADER
        =======================================================
      */}
      <header
        className="sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between border-b backdrop-blur-2xl transition-all"
        style={{
          backgroundColor: isDarkMode ? 'rgba(15, 15, 20, 0.45)' : 'rgba(255, 255, 255, 0.4)',
          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.6)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-syncopate text-xs sm:text-sm font-bold tracking-widest text-[#0071e3] dark:text-[#0a84ff] uppercase">
              IND TECH CORE
            </h1>
            <p className="text-[10px] tracking-wider uppercase text-gray-500 dark:text-gray-400 font-mono hidden sm:block">
              REPAIR & JOB MANAGEMENT OS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {onRequestClassicView && (
            <button
              type="button"
              onClick={onRequestClassicView}
              className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all border cursor-pointer hover:scale-105"
              style={{
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                borderColor: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                color: isDarkMode ? '#aeaeae' : '#555558',
              }}
              title="Switch to Classic Database View"
            >
              <span className="hidden sm:inline">CLASSIC </span>TABLE
            </button>
          )}

          {/* Pill-shaped Light/Dark Mode Toggle Button */}
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm hover:scale-105"
            style={{
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.07)',
              borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)',
              borderWidth: 1,
              color: isDarkMode ? '#f2f2f7' : '#1d1d1f',
            }}
            title="Toggle Light / Dark mode (localStorage synced)"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-mono">LIGHT</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[11px] font-mono">DARK</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* 
        =======================================================
        NAVIGATION TABS: REGISTER | DELIVERY | HISTORY
        Rounded pill-shaped .nav-tabs bar
        =======================================================
      */}
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-2">
        <div
          className="nav-tabs inline-flex p-1.5 rounded-full border mx-auto w-full sm:w-auto justify-center backdrop-blur-xl shadow-xs"
          style={{
            backgroundColor: isDarkMode ? 'rgba(30, 30, 35, 0.4)' : 'rgba(255, 255, 255, 0.45)',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.7)',
          }}
        >
          {(['REGISTER', 'DELIVERY', 'HISTORY'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 sm:flex-none px-6 py-2 rounded-full font-cabinet text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'shadow-md text-white scale-[1.02]'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
                style={{
                  backgroundColor: isActive
                    ? isDarkMode
                      ? '#0a84ff'
                      : '#0071e3'
                    : 'transparent',
                }}
              >
                {tab === 'REGISTER' && '1. REGISTER'}
                {tab === 'DELIVERY' && '2. DELIVERY'}
                {tab === 'HISTORY' && '3. HISTORY'}
              </button>
            );
          })}
        </div>
      </div>

      {/* 
        =======================================================
        MAIN TAB VIEW CONTAINER
        =======================================================
      */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* ===================================================
            MODULE 1: REGISTER (JOB ENTRY TAB)
            =================================================== */}
        {activeTab === 'REGISTER' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              {/* Top Glass Panel */}
              <div
                className="p-5 sm:p-7 rounded-3xl border shadow-lg backdrop-blur-xl transition-all"
                style={{
                  backgroundColor: isDarkMode ? 'rgba(30, 30, 35, 0.35)' : 'rgba(255, 255, 255, 0.35)',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.65)',
                }}
              >
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200/40 dark:border-gray-800/60">
                  <span className="font-cabinet font-black text-sm uppercase tracking-wider flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Layers className="w-4 h-4" />
                    BASE INTAKE REGISTRATION
                  </span>
                  <span className="text-[11px] font-mono uppercase text-gray-400">
                    AUTO-INDEXING ACTIVE
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Tag ID (Readonly input) */}
                  <div>
                    <label className="block text-[11px] font-cabinet font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                      BASE TAG ID (AUTO)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={nextTagId}
                      className="w-full px-4 py-2.5 rounded-2xl font-mono text-base border focus:outline-none"
                      style={{
                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.7)',
                        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.6)',
                        color: isDarkMode ? '#0a84ff' : '#0071e3',
                        fontWeight: 700,
                      }}
                      title="Next sequential base tag fetched automatically"
                    />
                  </div>

                  {/* Gate Pass */}
                  <div>
                    <label className="block text-[11px] font-cabinet font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                      GATE PASS
                    </label>
                    <input
                      type="text"
                      value={gatePass}
                      onChange={(e) => setGatePass(e.target.value.toUpperCase())}
                      placeholder="GP-000"
                      className="w-full px-4 py-2.5 rounded-2xl font-mono text-sm uppercase border focus:outline-none transition-all"
                      style={{
                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.7)',
                        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.6)',
                      }}
                    />
                  </div>

                  {/* Client Full Name (Search & Add Dropdown) */}
                  <div className="relative" ref={clientDropdownRef}>
                    <label className="block text-[11px] font-cabinet font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                      CLIENT FULL NAME *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => {
                          setClientName(e.target.value.toUpperCase());
                          setShowClientDropdown(true);
                        }}
                        onFocus={() => setShowClientDropdown(true)}
                        placeholder="SEARCH OR TYPE NEW CLIENT"
                        className="w-full px-4 py-2.5 rounded-2xl font-cabinet font-bold text-sm uppercase border focus:outline-none transition-all pr-8"
                        style={{
                          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.7)',
                          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.6)',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowClientDropdown(!showClientDropdown)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-white"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Client Dropdown List */}
                    {showClientDropdown && filteredClients.length > 0 && (
                      <div
                        className="absolute left-0 right-0 mt-2 rounded-2xl border shadow-2xl z-40 max-h-52 overflow-y-auto backdrop-blur-2xl divide-y divide-gray-100 dark:divide-gray-800"
                        style={{
                          backgroundColor: isDarkMode ? 'rgba(25, 25, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        {filteredClients.map((cName, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setClientName(cName.toUpperCase());
                              setShowClientDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs font-cabinet font-bold uppercase transition-colors hover:bg-blue-500/10 cursor-pointer flex items-center justify-between"
                          >
                            <span>{cName}</span>
                            <span className="text-[10px] font-mono text-blue-500">SELECT</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Board Details Panel (#boardsContainer) */}
              <div id="boardsContainer" className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <span className="font-cabinet font-black text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    ATTACHED BOARDS ({boards.length})
                  </span>
                  <span className="text-[11px] font-mono uppercase text-blue-500">
                    TAG SYNC: {nextTagId}-{boards.length > 1 ? `01..${String(boards.length).padStart(2, '0')}` : '01'}
                  </span>
                </div>

                {boards.map((b, idx) => (
                  <div
                    key={b.id}
                    className="board-item relative p-5 sm:p-6 rounded-3xl backdrop-blur-xl transition-all"
                    style={{
                      backgroundColor: isDarkMode ? 'rgba(30, 30, 35, 0.25)' : 'rgba(255, 255, 255, 0.25)',
                      border: isDarkMode
                        ? '1px dashed rgba(255, 255, 255, 0.25)'
                        : '1px dashed rgba(0, 0, 0, 0.15)',
                    }}
                  >
                    {/* Header Row of Board Item */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          BOARD #{idx + 1}
                        </span>
                        <span className="text-xs font-mono font-bold text-gray-400">
                          TAG: {nextTagId}-{String(idx + 1).padStart(2, '0')}
                        </span>
                      </div>

                      {boards.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBoard(idx)}
                          className="flex items-center gap-1 text-[11px] font-cabinet font-extrabold uppercase text-rose-500 hover:text-rose-600 transition-colors cursor-pointer px-2.5 py-1 rounded-full hover:bg-rose-500/10"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>REMOVE</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-3.5">
                      {/* Side-by-side Flex Row: Board Name / Hardware Model & Serial Number */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[10px] font-cabinet font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                            BOARD NAME / HARDWARE MODEL *
                          </label>
                          <input
                            type="text"
                            required
                            value={b.model}
                            onChange={(e) => handleBoardChange(idx, 'model', e.target.value.toUpperCase())}
                            placeholder="e.g. 1790 MAIN BOARD"
                            className="bModel w-full px-4 py-2.5 rounded-2xl font-cabinet font-bold text-xs uppercase border focus:outline-none"
                            style={{
                              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.7)',
                              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.6)',
                            }}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-cabinet font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                            SERIAL NUMBER
                          </label>
                          <input
                            type="text"
                            value={b.serial}
                            onChange={(e) => handleBoardChange(idx, 'serial', e.target.value.toUpperCase())}
                            placeholder="ENTER S/N"
                            className="bSerial w-full px-4 py-2.5 rounded-2xl font-mono font-bold text-xs uppercase border focus:outline-none"
                            style={{
                              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.7)',
                              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.6)',
                            }}
                          />
                        </div>
                      </div>

                      {/* Issue / Fault Description */}
                      <div>
                        <label className="block text-[10px] font-cabinet font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                          ISSUE / FAULT DESCRIPTION
                        </label>
                        <input
                          type="text"
                          value={b.issue}
                          onChange={(e) => handleBoardChange(idx, 'issue', e.target.value.toUpperCase())}
                          placeholder="DESCRIBE THE HARDWARE PROBLEM..."
                          className="bIssue w-full px-4 py-2.5 rounded-2xl font-mono text-xs uppercase border focus:outline-none"
                          style={{
                            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.7)',
                            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.6)',
                          }}
                        />
                      </div>

                      {/* Internal Remark */}
                      <div>
                        <label className="block text-[10px] font-cabinet font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                          INTERNAL REMARK
                        </label>
                        <input
                          type="text"
                          value={b.remark}
                          onChange={(e) => handleBoardChange(idx, 'remark', e.target.value.toUpperCase())}
                          placeholder="OPTIONAL INTERNAL NOTES"
                          className="bRemark w-full px-4 py-2 rounded-2xl font-mono text-xs uppercase border focus:outline-none"
                          style={{
                            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.7)',
                            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.6)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* + ATTACH ANOTHER BOARD button (dashed outline) */}
                <button
                  type="button"
                  onClick={handleAddBoard}
                  className="w-full py-3.5 rounded-3xl font-cabinet font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01]"
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.5)',
                    border: isDarkMode
                      ? '1px dashed rgba(255, 255, 255, 0.35)'
                      : '1px dashed rgba(0, 113, 227, 0.4)',
                    color: isDarkMode ? '#0a84ff' : '#0071e3',
                  }}
                >
                  <Plus className="w-4 h-4" />
                  <span>+ ATTACH ANOTHER BOARD</span>
                </button>
              </div>

              {/* Submit Register Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full py-4 rounded-3xl font-cabinet font-black text-sm uppercase tracking-widest text-white shadow-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                  style={{
                    backgroundColor: isDarkMode ? '#0a84ff' : '#0071e3',
                    boxShadow: isDarkMode
                      ? '0 10px 30px rgba(10, 132, 255, 0.35)'
                      : '0 10px 30px rgba(0, 113, 227, 0.25)',
                  }}
                >
                  {isRegistering ? (
                    <span>SYNCHRONIZING TAGS...</span>
                  ) : (
                    <>
                      <span>REGISTER JOB LOG ({boards.length} BOARDS)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ===================================================
            MODULE 2: DELIVERY (PENDING DISPATCH TAB)
            =================================================== */}
        {activeTab === 'DELIVERY' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Real-Time Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={pendingSearch}
                onChange={(e) => setPendingSearch(e.target.value.toUpperCase())}
                placeholder="SEARCH BY NAME, TAG, HARDWARE..."
                className="w-full pl-11 pr-4 py-3.5 rounded-3xl font-mono text-xs uppercase border focus:outline-none backdrop-blur-xl transition-all"
                style={{
                  backgroundColor: isDarkMode ? 'rgba(30, 30, 35, 0.35)' : 'rgba(255, 255, 255, 0.5)',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.7)',
                }}
              />
            </div>

            {/* Liquid Leader Cards List */}
            {isLoadingPending ? (
              <div className="text-center py-16 text-gray-400 font-mono text-xs uppercase">
                LOADING PENDING DISPATCH LOGS...
              </div>
            ) : filteredPending.length === 0 ? (
              <div
                className="text-center py-16 rounded-3xl border backdrop-blur-xl"
                style={{
                  backgroundColor: isDarkMode ? 'rgba(30, 30, 35, 0.2)' : 'rgba(255, 255, 255, 0.3)',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                }}
              >
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2 opacity-80" />
                <p className="font-cabinet font-black text-sm uppercase">NO PENDING BOARDS</p>
                <p className="text-[11px] font-mono text-gray-400 mt-1 uppercase">
                  ALL INTAKE ORDERS ARE DISPATCHED
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredPending.map((job) => {
                  const isExpanded = activeLeaderCard === job.id;
                  return (
                    <div
                      key={job.id}
                      onClick={() => setActiveLeaderCard(isExpanded ? null : job.id)}
                      className={`liquid-leader-card rounded-3xl p-5 sm:p-6 backdrop-blur-xl cursor-pointer transition-all ${
                        isExpanded ? 'active-glow' : ''
                      }`}
                      style={{
                        backgroundColor: isDarkMode
                          ? 'rgba(30, 30, 35, 0.35)'
                          : 'rgba(255, 255, 255, 0.45)',
                        borderColor: isExpanded
                          ? isDarkMode
                            ? '#0a84ff'
                            : '#0071e3'
                          : isDarkMode
                          ? 'rgba(255, 255, 255, 0.15)'
                          : 'rgba(255, 255, 255, 0.7)',
                      }}
                    >
                      {/* Collapsed Header View */}
                      <div className="flex items-start justify-between gap-4">
                        {/* Left Side (70% width) */}
                        <div className="w-[70%] space-y-1">
                          <h3 className="font-cabinet font-black text-base sm:text-lg uppercase text-gray-900 dark:text-white truncate">
                            {job.client}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                              BOARD: <span className="font-bold">{job.model}</span>
                            </span>
                            <span className="text-gray-400">·</span>
                            <span className="text-gray-500 dark:text-gray-400 font-bold">
                              S/N: {job.serial || 'N/A'}
                            </span>
                          </div>
                          {job.gatepass && (
                            <div className="text-[10px] font-mono text-gray-400 uppercase">
                              GATE PASS: {job.gatepass}
                            </div>
                          )}
                        </div>

                        {/* Right Side (30% width) */}
                        <div className="w-[30%] flex flex-col items-end gap-1.5 shrink-0">
                          <span
                            className="px-3 py-1 rounded-full font-mono text-xs font-bold uppercase tracking-wider"
                            style={{
                              backgroundColor: isDarkMode ? 'rgba(10, 132, 255, 0.15)' : 'rgba(0, 113, 227, 0.1)',
                              color: isDarkMode ? '#0a84ff' : '#0071e3',
                              border: isDarkMode ? '1px solid rgba(10, 132, 255, 0.3)' : '1px solid rgba(0, 113, 227, 0.2)',
                            }}
                          >
                            {job.tag}
                          </span>
                          <span
                            className="px-2.5 py-0.5 rounded-full text-[10px] font-cabinet font-black uppercase tracking-wider"
                            style={{
                              backgroundColor: isDarkMode ? 'rgba(50, 215, 75, 0.15)' : 'rgba(52, 199, 89, 0.12)',
                              color: isDarkMode ? '#32d74b' : '#34c759',
                            }}
                          >
                            SERVICE
                          </span>
                        </div>
                      </div>

                      {/* Interactive Collapsible Detail */}
                      {isExpanded && (
                        <div className="collapsible-detail open mt-4 pt-4 border-t border-gray-200/40 dark:border-gray-800/60 space-y-3 animate-in fade-in duration-150">
                          <div className="space-y-1.5 text-xs font-mono">
                            <div>
                              <span className="text-gray-400 uppercase">REPORTED FAULT:</span>{' '}
                              <span className="font-bold text-gray-800 dark:text-gray-200 uppercase">
                                {job.issue || 'STANDARD DIAGNOSTIC INSPECTION'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400 uppercase">INITIAL NOTE:</span>{' '}
                              <span className="text-gray-600 dark:text-gray-300 uppercase">
                                {job.remark || 'NONE'}
                              </span>
                            </div>
                          </div>

                          {/* Full-width blue button: MARK DELIVERED */}
                          <button
                            type="button"
                            onClick={(e) => handleOpenDispatchModal(job, e)}
                            className="w-full py-3 rounded-2xl font-cabinet font-black text-xs uppercase tracking-widest text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01]"
                            style={{
                              backgroundColor: isDarkMode ? '#0a84ff' : '#0071e3',
                            }}
                          >
                            <span>MARK DELIVERED</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 
              =======================================================
              PROCESS DISPATCH MODAL (#deliveryModal)
              Centered glass/blurred modal
              =======================================================
            */}
            {dispatchModalJob && (
              <div
                id="deliveryModal"
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150"
                onClick={() => setDispatchModalJob(null)}
              >
                <div
                  className="w-full max-w-md rounded-3xl p-6 sm:p-8 border shadow-2xl backdrop-blur-2xl space-y-5"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(25, 25, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.8)',
                  }}
                >
                  <div className="flex items-center justify-between border-b pb-3 border-gray-200 dark:border-gray-800">
                    <div>
                      <h3 className="font-cabinet font-black text-base uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        PROCESS DISPATCH
                      </h3>
                      <p className="text-[11px] font-mono text-gray-400 uppercase mt-0.5">
                        TAG {dispatchModalJob.tag} · {dispatchModalJob.client}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDispatchModalJob(null)}
                      className="p-1 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4 text-xs font-mono">
                    {/* 1. Dropdown (#fPay): PAID, DUE, FREE SERVICE */}
                    <div>
                      <label className="block text-[11px] font-cabinet font-extrabold uppercase tracking-wider text-gray-500 mb-1">
                        PAYMENT STATUS (#fPay)
                      </label>
                      <select
                        id="fPay"
                        value={dispatchPaymentStatus}
                        onChange={(e) => setDispatchPaymentStatus(e.target.value as any)}
                        className="w-full px-4 py-2.5 rounded-2xl font-cabinet font-bold uppercase border focus:outline-none"
                        style={{
                          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)',
                        }}
                      >
                        <option value="PAID">PAID</option>
                        <option value="DUE">DUE</option>
                        <option value="FREE SERVICE">FREE SERVICE</option>
                      </select>
                    </div>

                    {/* 2. Number input (#fAmount): Total Financial Amount */}
                    <div>
                      <label className="block text-[11px] font-cabinet font-extrabold uppercase tracking-wider text-gray-500 mb-1">
                        TOTAL FINANCIAL AMOUNT (৳) (#fAmount)
                      </label>
                      <input
                        id="fAmount"
                        type="number"
                        min="0"
                        value={dispatchAmount}
                        onChange={(e) => setDispatchAmount(e.target.value)}
                        placeholder="0"
                        className="w-full px-4 py-2.5 rounded-2xl font-mono font-bold text-sm border focus:outline-none"
                        style={{
                          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)',
                        }}
                      />
                    </div>

                    {/* 3. Text input (#fInvoice): Invoice Code */}
                    <div>
                      <label className="block text-[11px] font-cabinet font-extrabold uppercase tracking-wider text-gray-500 mb-1">
                        INVOICE CODE (#fInvoice)
                      </label>
                      <input
                        id="fInvoice"
                        type="text"
                        value={dispatchInvoice}
                        onChange={(e) => setDispatchInvoice(e.target.value.toUpperCase())}
                        placeholder="INV-CODE"
                        className="w-full px-4 py-2.5 rounded-2xl font-mono uppercase border focus:outline-none"
                        style={{
                          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)',
                        }}
                      />
                    </div>

                    {/* 4. Text input (#fReceiver): Handed Over To Name */}
                    <div>
                      <label className="block text-[11px] font-cabinet font-extrabold uppercase tracking-wider text-gray-500 mb-1">
                        HANDED OVER TO NAME (#fReceiver)
                      </label>
                      <input
                        id="fReceiver"
                        type="text"
                        value={dispatchReceiver}
                        onChange={(e) => setDispatchReceiver(e.target.value.toUpperCase())}
                        placeholder="NAME OF RECEIVER / CLIENT STAFF"
                        className="w-full px-4 py-2.5 rounded-2xl font-cabinet font-bold uppercase border focus:outline-none"
                        style={{
                          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Buttons: COMPLETE & DISPATCH and CANCEL */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setDispatchModalJob(null)}
                      className="flex-1 py-3 rounded-2xl font-cabinet font-extrabold text-xs uppercase tracking-wider border cursor-pointer hover:bg-gray-500/10"
                      style={{
                        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)',
                      }}
                    >
                      CANCEL
                    </button>
                    <button
                      type="button"
                      disabled={isSubmittingDispatch}
                      onClick={handleCompleteDispatch}
                      className="flex-1 py-3 rounded-2xl font-cabinet font-black text-xs uppercase tracking-wider text-white shadow-lg cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                      style={{
                        backgroundColor: isDarkMode ? '#0a84ff' : '#0071e3',
                      }}
                    >
                      {isSubmittingDispatch ? 'DISPATCHING...' : 'COMPLETE & DISPATCH'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================================================
            MODULE 3: HISTORY (AUDIT HISTORY TAB)
            =================================================== */}
        {activeTab === 'HISTORY' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 
              Privacy-Masked 3-Card Summary Grid (.stats-grid)
              Clicking toggles masked (***) vs actual calculated amounts
            */}
            <div
              className="stats-grid grid grid-cols-1 sm:grid-cols-3 gap-3.5 cursor-pointer select-none"
              onClick={() => setIsAmountsMasked(!isAmountsMasked)}
              title="Click anywhere on the boxes to show or hide amounts"
            >
              {/* TOTAL PAID */}
              <div
                className="p-5 rounded-3xl backdrop-blur-xl border transition-all hover:scale-[1.01]"
                style={{
                  backgroundColor: isDarkMode ? 'rgba(30, 30, 35, 0.35)' : 'rgba(255, 255, 255, 0.4)',
                  borderColor: isDarkMode ? '#32d74b' : '#34c759',
                }}
              >
                <span className="block font-cabinet font-black text-[11px] uppercase tracking-wider text-[#34c759] dark:text-[#32d74b]">
                  TOTAL PAID
                </span>
                <div className="mt-2 font-cabinet font-black text-2xl uppercase tracking-tight text-[#34c759] dark:text-[#32d74b]">
                  {isAmountsMasked ? '৳ ***' : `৳ ${stats.totalPaid.toLocaleString()}`}
                </div>
              </div>

              {/* MARKET DUE */}
              <div
                className="p-5 rounded-3xl backdrop-blur-xl border transition-all hover:scale-[1.01]"
                style={{
                  backgroundColor: isDarkMode ? 'rgba(30, 30, 35, 0.35)' : 'rgba(255, 255, 255, 0.4)',
                  borderColor: isDarkMode ? '#ff453a' : '#ff3b30',
                }}
              >
                <span className="block font-cabinet font-black text-[11px] uppercase tracking-wider text-[#ff3b30] dark:text-[#ff453a]">
                  MARKET DUE
                </span>
                <div className="mt-2 font-cabinet font-black text-2xl uppercase tracking-tight text-[#ff3b30] dark:text-[#ff453a]">
                  {isAmountsMasked ? '৳ ***' : `৳ ${stats.marketDue.toLocaleString()}`}
                </div>
              </div>

              {/* FREE JOBS */}
              <div
                className="p-5 rounded-3xl backdrop-blur-xl border transition-all hover:scale-[1.01]"
                style={{
                  backgroundColor: isDarkMode ? 'rgba(30, 30, 35, 0.35)' : 'rgba(255, 255, 255, 0.4)',
                  borderColor: isDarkMode ? '#0a84ff' : '#0071e3',
                }}
              >
                <span className="block font-cabinet font-black text-[11px] uppercase tracking-wider text-[#0071e3] dark:text-[#0a84ff]">
                  FREE JOBS
                </span>
                <div className="mt-2 font-cabinet font-black text-2xl uppercase tracking-tight text-[#0071e3] dark:text-[#0a84ff]">
                  {isAmountsMasked ? '***' : stats.freeJobs}
                </div>
              </div>
            </div>

            {/* Hint below grid */}
            <div className="text-center">
              <span
                onClick={() => setIsAmountsMasked(!isAmountsMasked)}
                className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
              >
                {isAmountsMasked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                👁️ CLICK ON BOXES TO SHOW OR HIDE AMOUNTS
              </span>
            </div>

            {/* 
              Filtering System:
              1. Horizontal scrollable pill buttons: ALL LOGS, PAID, DUE, FREE, PENDING
              2. Collapsible Date Range Filter
              3. Instant Search Input
            */}
            <div className="space-y-3.5">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Horizontal scrollable pill buttons */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {(['ALL', 'PAID', 'DUE', 'FREE', 'PENDING'] as const).map((mode) => {
                    const isSelected = historyFilter === mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setHistoryFilter(mode)}
                        className={`px-4 py-2 rounded-full font-cabinet font-extrabold text-xs uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                          isSelected
                            ? 'text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                        }`}
                        style={{
                          backgroundColor: isSelected
                            ? isDarkMode
                              ? '#0a84ff'
                              : '#0071e3'
                            : isDarkMode
                            ? 'rgba(255,255,255,0.06)'
                            : 'rgba(0,0,0,0.05)',
                          border: isDarkMode
                            ? '1px solid rgba(255,255,255,0.12)'
                            : '1px solid rgba(0,0,0,0.08)',
                        }}
                      >
                        {mode === 'ALL' ? 'ALL LOGS' : mode}
                      </button>
                    );
                  })}
                </div>

                {/* Collapsible Date Range Toggle */}
                <button
                  type="button"
                  onClick={() => setShowDateFilter(!showDateFilter)}
                  className="px-4 py-2 rounded-full font-cabinet font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 border border-dashed"
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.5)',
                    borderColor: isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)',
                    color: isDarkMode ? '#aeaeae' : '#555558',
                  }}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>📅 TOGGLE DATE FILTER</span>
                </button>
              </div>

              {/* Collapsible Date Range Panel */}
              {showDateFilter && (
                <div
                  className="p-4 rounded-3xl border backdrop-blur-xl animate-in fade-in duration-150"
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(30, 30, 35, 0.4)' : 'rgba(255, 255, 255, 0.5)',
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-gray-500 mb-1">
                        START DATE
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl font-mono text-xs border focus:outline-none"
                        style={{
                          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-gray-500 mb-1">
                        END DATE
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl font-mono text-xs border focus:outline-none"
                        style={{
                          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                        }}
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleApplyDateFilter}
                        className="flex-1 py-2 rounded-xl font-cabinet font-extrabold text-xs uppercase text-white shadow-xs cursor-pointer hover:scale-105 transition-all"
                        style={{ backgroundColor: isDarkMode ? '#0a84ff' : '#0071e3' }}
                      >
                        APPLY
                      </button>
                      {appliedDateRange && (
                        <button
                          type="button"
                          onClick={handleClearDateFilter}
                          className="px-3 py-2 rounded-xl font-cabinet font-bold text-xs uppercase border text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
                        >
                          CLEAR
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Instant Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value.toUpperCase())}
                  placeholder="SEARCH BY NAME, TAG, HARDWARE..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-3xl font-mono text-xs uppercase border focus:outline-none backdrop-blur-xl transition-all"
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(30, 30, 35, 0.35)' : 'rgba(255, 255, 255, 0.5)',
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.7)',
                  }}
                />
              </div>
            </div>

            {/* History Liquid Cards */}
            {filteredHistory.length === 0 ? (
              <div
                className="text-center py-16 rounded-3xl border backdrop-blur-xl"
                style={{
                  backgroundColor: isDarkMode ? 'rgba(30, 30, 35, 0.2)' : 'rgba(255, 255, 255, 0.3)',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                }}
              >
                <p className="font-cabinet font-black text-sm uppercase">NO RECORDS FOUND</p>
                <p className="text-[11px] font-mono text-gray-400 mt-1 uppercase">
                  TRY ADJUSTING YOUR FILTER OR SEARCH QUERY
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredHistory.map((rec) => {
                  const isExpanded = expandedHistoryId === rec.id;
                  const isDue = rec.paymentStatus === 'DUE';
                  const isPaid = rec.paymentStatus === 'PAID';
                  const isFree = rec.paymentStatus === 'FREE';

                  return (
                    <div
                      key={rec.id}
                      onClick={() => setExpandedHistoryId(isExpanded ? null : rec.id)}
                      className="liquid-leader-card rounded-3xl p-5 sm:p-6 backdrop-blur-xl cursor-pointer transition-all"
                      style={{
                        backgroundColor: isDarkMode
                          ? 'rgba(30, 30, 35, 0.35)'
                          : 'rgba(255, 255, 255, 0.45)',
                        borderColor: isDue
                          ? isDarkMode
                            ? 'rgba(255, 69, 58, 0.4)'
                            : 'rgba(255, 59, 48, 0.4)'
                          : isDarkMode
                          ? 'rgba(255, 255, 255, 0.15)'
                          : 'rgba(255, 255, 255, 0.7)',
                      }}
                    >
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="w-[68%] space-y-1.5">
                          <h3 className="font-cabinet font-black text-base sm:text-lg uppercase text-gray-900 dark:text-white truncate">
                            {rec.client}
                          </h3>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-cabinet font-bold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                              {rec.model}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-gray-500/10 text-gray-600 dark:text-gray-300">
                              S/N: {rec.serial || 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Right Side Pill Badge */}
                        <div className="w-[32%] flex flex-col items-end gap-1.5 shrink-0">
                          <span className="text-[11px] font-mono font-bold uppercase text-gray-500">
                            TAG: <strong className="text-gray-800 dark:text-gray-200">{rec.tag}</strong>
                          </span>

                          {/* Colored status/amount pill badge */}
                          {isPaid && (
                            <span className="px-3 py-1 rounded-full text-xs font-cabinet font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                              PAID · {isAmountsMasked ? '৳ ***' : `৳ ${rec.amount.toLocaleString()}`}
                            </span>
                          )}

                          {isDue && (
                            <span className="px-3 py-1 rounded-full text-xs font-cabinet font-black uppercase tracking-wider bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                              DUE · {isAmountsMasked ? '৳ ***' : `৳ ${(rec.due || rec.amount).toLocaleString()}`}
                            </span>
                          )}

                          {isFree && (
                            <span className="px-3 py-1 rounded-full text-xs font-cabinet font-black uppercase tracking-wider bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                              FREE SERVICE
                            </span>
                          )}

                          {!isPaid && !isDue && !isFree && (
                            <span className="px-3 py-1 rounded-full text-xs font-cabinet font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              PENDING
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expandable Details */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-200/40 dark:border-gray-800/60 space-y-3 text-xs font-mono animate-in fade-in duration-150">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <span className="text-gray-400 uppercase">RECEIVED DATE:</span>{' '}
                              <span className="font-bold text-gray-800 dark:text-gray-200">{rec.date}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 uppercase">DELIVERY DATE:</span>{' '}
                              <span className="font-bold text-gray-800 dark:text-gray-200">
                                {rec.deliveryDate || 'NOT DISPATCHED'}
                              </span>
                            </div>
                            {rec.gatepass && (
                              <div>
                                <span className="text-gray-400 uppercase">GATE PASS:</span>{' '}
                                <span className="font-bold text-gray-800 dark:text-gray-200">{rec.gatepass}</span>
                              </div>
                            )}
                            {rec.invoice && (
                              <div>
                                <span className="text-gray-400 uppercase">INVOICE CODE:</span>{' '}
                                <span className="font-bold text-gray-800 dark:text-gray-200">{rec.invoice}</span>
                              </div>
                            )}
                            {rec.receiver && (
                              <div className="sm:col-span-2">
                                <span className="text-gray-400 uppercase">HANDED OVER TO:</span>{' '}
                                <span className="font-bold text-gray-800 dark:text-gray-200">{rec.receiver}</span>
                              </div>
                            )}
                          </div>

                          <div className="p-3 rounded-2xl bg-gray-500/5 border border-gray-500/10 space-y-1">
                            <div>
                              <span className="text-gray-400 uppercase">FAULT / DEFECT:</span>{' '}
                              <span className="text-gray-800 dark:text-gray-200 uppercase">{rec.issue}</span>
                            </div>
                            {rec.remark && (
                              <div>
                                <span className="text-gray-400 uppercase">REMARK:</span>{' '}
                                <span className="text-gray-600 dark:text-gray-400 uppercase">{rec.remark}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons: COLLECT DUE (if due) and PRINT SLIP */}
                          <div className="flex flex-wrap gap-2.5 pt-1">
                            {isDue && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDueCollectJob(rec);
                                  setDueCollectAmount(String(rec.due || rec.amount));
                                }}
                                className="px-4 py-2 rounded-2xl font-cabinet font-black text-xs uppercase tracking-wider text-white shadow-md cursor-pointer hover:scale-105 transition-all flex items-center gap-1.5"
                                style={{ backgroundColor: isDarkMode ? '#ff453a' : '#ff3b30' }}
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>COLLECT DUE (৳{(rec.due || rec.amount).toLocaleString()})</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePrintSlip(rec);
                              }}
                              className="px-4 py-2 rounded-2xl font-cabinet font-extrabold text-xs uppercase tracking-wider border cursor-pointer hover:bg-gray-500/10 transition-all flex items-center gap-1.5"
                              style={{
                                borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
                              }}
                            >
                              <Printer className="w-3.5 h-3.5 text-blue-500" />
                              <span>PRINT SLIP / RECEIPT</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Settle Due Modal */}
            {dueCollectJob && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150"
                onClick={() => setDueCollectJob(null)}
              >
                <div
                  className="w-full max-w-sm rounded-3xl p-6 border shadow-2xl backdrop-blur-2xl space-y-4"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(25, 25, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.8)',
                  }}
                >
                  <div className="flex items-center justify-between border-b pb-2.5 border-gray-200 dark:border-gray-800">
                    <h3 className="font-cabinet font-black text-sm uppercase text-rose-500">
                      COLLECT DUE PAYMENT
                    </h3>
                    <button
                      type="button"
                      onClick={() => setDueCollectJob(null)}
                      className="p-1 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs font-mono">
                    <div>
                      <span className="text-gray-400">TAG:</span>{' '}
                      <strong className="text-gray-800 dark:text-gray-200">{dueCollectJob.tag}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400">CLIENT:</span>{' '}
                      <strong className="text-gray-800 dark:text-gray-200">{dueCollectJob.client}</strong>
                    </div>

                    <div>
                      <label className="block text-[10px] font-cabinet font-extrabold uppercase text-gray-500 mb-1">
                        COLLECTION AMOUNT (৳)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={dueCollectAmount}
                        onChange={(e) => setDueCollectAmount(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl font-mono font-bold text-sm border focus:outline-none"
                        style={{
                          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)',
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setDueCollectJob(null)}
                      className="flex-1 py-2.5 rounded-xl font-cabinet font-extrabold text-xs uppercase border cursor-pointer hover:bg-gray-500/10"
                    >
                      CANCEL
                    </button>
                    <button
                      type="button"
                      disabled={isCollectingDue}
                      onClick={handleSettleDue}
                      className="flex-1 py-2.5 rounded-xl font-cabinet font-black text-xs uppercase text-white shadow-md cursor-pointer hover:scale-105"
                      style={{ backgroundColor: '#34c759' }}
                    >
                      {isCollectingDue ? 'RECORDING...' : 'CONFIRM PAID'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Printable Receipt Modal */}
      {printReceiptJob && (
        <ReceiptModal
          job={printReceiptJob}
          type="delivery"
          onClose={() => setPrintReceiptJob(null)}
        />
      )}
    </div>
  );
};
