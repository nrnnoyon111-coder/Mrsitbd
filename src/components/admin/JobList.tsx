import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Printer,
  Eye,
  CheckCircle,
  Clock,
  DollarSign,
  Archive,
  RefreshCw,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Sparkles } from 'lucide-react';
import { RepairJob, PresetData } from '../../types';
import { CopyButton } from '../CopyButton';
import { useToast } from '../Toast';
import { ReceiptModal } from '../ReceiptModal';

interface JobListProps {
  jobs: RepairJob[];
  presets: PresetData;
  onRefresh: () => void;
  onOpenAddJob: () => void;
  onUpdateJob: (job: RepairJob) => void;
  onArchiveJob: (jobId: string) => void;
  onSwitchToIndTech?: () => void;
}

export const JobList: React.FC<JobListProps> = ({
  jobs,
  presets,
  onRefresh,
  onOpenAddJob,
  onUpdateJob,
  onArchiveJob,
  onSwitchToIndTech,
}) => {
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [brandFilter, setBrandFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileViewMode, setMobileViewMode] = useState<'cards' | 'table'>('cards');
  const itemsPerPage = 8;

  // Selected job for quick actions
  const [selectedJobForPrint, setSelectedJobForPrint] = useState<RepairJob | null>(null);
  const [printType, setPrintType] = useState<'intake' | 'delivery' | 'payment'>('intake');
  const [paymentModalJob, setPaymentModalJob] = useState<RepairJob | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [statusModalJob, setStatusModalJob] = useState<RepairJob | null>(null);
  const [newStatus, setNewStatus] = useState<any>('In Processing');

  // Filtered List
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Search
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        const matches =
          job.jobNumber.toLowerCase().includes(s) ||
          job.company.toLowerCase().includes(s) ||
          job.customerName.toLowerCase().includes(s) ||
          job.phone.toLowerCase().includes(s) ||
          job.challan.toLowerCase().includes(s) ||
          job.boardNumber.toLowerCase().includes(s) ||
          (job.boardSerial && job.boardSerial.toLowerCase().includes(s));
        if (!matches) return false;
      }

      // Status
      if (statusFilter !== 'All' && job.status !== statusFilter) return false;

      // Brand
      if (brandFilter !== 'All' && job.brand !== brandFilter) return false;

      // Payment
      if (paymentFilter === 'due' && job.due <= 0) return false;
      if (paymentFilter === 'paid' && job.due > 0) return false;

      return true;
    });
  }, [jobs, searchTerm, statusFilter, brandFilter, paymentFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage) || 1;
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredJobs.slice(start, start + itemsPerPage);
  }, [filteredJobs, currentPage]);

  // Quick Status change submit
  const handleStatusChangeSubmit = async () => {
    if (!statusModalJob) return;
    try {
      const res = await fetch(`/api/jobs/${statusModalJob.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        onUpdateJob(data.job);
        showToast(`Job ${statusModalJob.jobNumber} status updated to ${newStatus}.`, 'success');
        setStatusModalJob(null);
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  // Quick Payment submit
  const handlePaymentSubmit = async () => {
    if (!paymentModalJob || paymentAmount <= 0) return;
    try {
      const res = await fetch(`/api/jobs/${paymentModalJob.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: paymentAmount, paymentMethod: 'Cash' }),
      });
      const data = await res.json();
      if (res.ok) {
        onUpdateJob(data.job);
        showToast(`Payment of ৳${paymentAmount} saved for ${paymentModalJob.jobNumber}.`, 'success');
        setPaymentModalJob(null);
        setPaymentAmount(0);
      }
    } catch (err) {
      showToast('Failed to record payment', 'error');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    window.open('/api/sync/export-csv/Repair_Jobs', '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action & Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Industrial Repair Job Orders
            </h2>
            <p className="text-xs text-slate-500">
              Total {filteredJobs.length} active jobs loaded in indexed cache
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Mobile View Mode Switcher */}
            <div className="inline-flex md:hidden items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold mr-auto sm:mr-0">
              <button
                type="button"
                onClick={() => setMobileViewMode('cards')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  mobileViewMode === 'cards'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cards
              </button>
              <button
                type="button"
                onClick={() => setMobileViewMode('table')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  mobileViewMode === 'table'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Table
              </button>
            </div>

            {onSwitchToIndTech && (
              <button
                type="button"
                onClick={onSwitchToIndTech}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer hover:scale-105"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>IND TECH CORE</span>
              </button>
            )}

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Refresh</span>
            </button>

            <button
              onClick={onOpenAddJob}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Job</span>
            </button>
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search Job #, Client, Phone, Board..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="Received">Received</option>
              <option value="Diagnosing">Diagnosing</option>
              <option value="In Processing">In Processing</option>
              <option value="Completed">Completed</option>
              <option value="Picked Up">Picked Up</option>
              <option value="Declined">Declined</option>
            </select>
          </div>

          {/* Brand Filter */}
          <div>
            <select
              value={brandFilter}
              onChange={(e) => {
                setBrandFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            >
              <option value="All">All Brands</option>
              {presets.brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            >
              <option value="All">All Payment States</option>
              <option value="due">Has Due Balance</option>
              <option value="paid">Fully Settled / Paid</option>
            </select>
          </div>

        </div>

      </div>

      {/* Main Jobs Container: Responsive Card List on Mobile & High-Density Table on Desktop */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* View Mode 1: Mobile Stacked Card View (Clean, touch-friendly, fluid) */}
        <div className={`${mobileViewMode === 'cards' ? 'block md:hidden' : 'hidden'} p-3.5 space-y-3.5 bg-slate-50/60`}>
          {paginatedJobs.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
              No repair jobs found matching the selected filter criteria.
            </div>
          ) : (
            paginatedJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3 transition-shadow hover:shadow-sm"
              >
                {/* Card Top: Job Number & Status */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-1.5 font-mono font-bold text-blue-600 text-sm">
                    <span>{job.jobNumber}</span>
                    <CopyButton text={job.jobNumber} />
                    <span className="text-[10px] text-slate-400 font-normal ml-1">
                      {job.receivedDate}
                    </span>
                  </div>

                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      job.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : job.status === 'In Processing'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : job.status === 'Diagnosing'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : job.status === 'Picked Up'
                        ? 'bg-slate-100 text-slate-700'
                        : job.status === 'Declined'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                {/* Client / Garment Factory & Phone */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-xs truncate">
                      {job.company || job.customerName}
                    </div>
                    {job.company && job.customerName && (
                      <div className="text-[11px] text-slate-500 truncate">
                        Attn: {job.customerName}
                      </div>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-slate-600 flex items-center gap-1 shrink-0 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/60">
                    <a href={`tel:${job.phone}`} className="hover:text-blue-600 font-medium">
                      {job.phone}
                    </a>
                    <CopyButton text={job.phone} />
                  </div>
                </div>

                {/* Board Specification & Challan */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px]">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Board Spec</span>
                    <span className="font-semibold text-slate-800 block truncate">
                      {job.brand} {job.model ? `· ${job.model}` : ''}
                    </span>
                    <span className="text-[10px] font-mono text-blue-700 font-bold flex items-center gap-1 truncate">
                      {job.boardNumber}
                      <CopyButton text={job.boardNumber} />
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Challan & Tech</span>
                    <span className="font-mono text-slate-700 font-medium block truncate flex items-center gap-1">
                      Challan: {job.challan}
                      <CopyButton text={job.challan} />
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      Tech: {job.technician}
                    </span>
                  </div>
                </div>

                {/* Financial Summary: Service Bill & Due */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">Bill:</span>
                    <span className="font-mono font-bold text-slate-900">
                      ৳{job.serviceCharge.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[11px]">Due:</span>
                    {job.due > 0 ? (
                      <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                        ৳{job.due.toLocaleString()}
                      </span>
                    ) : (
                      <span className="font-mono font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                        Paid
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedJobForPrint(job);
                        setPrintType('intake');
                      }}
                      title="Print Intake Slip"
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3 h-3 text-slate-500" />
                      <span>Slip</span>
                    </button>
                    <button
                      onClick={() => {
                        setStatusModalJob(job);
                        setNewStatus(job.status);
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Status
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {job.due > 0 && (
                      <button
                        onClick={() => {
                          setPaymentModalJob(job);
                          setPaymentAmount(job.due);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                      >
                        Collect Pay
                      </button>
                    )}
                    <button
                      onClick={() => onArchiveJob(job.id)}
                      title="Archive Job"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

        {/* View Mode 2: High-Density Tabular Grid (Desktop / or Mobile in Table mode) */}
        <div className={`${mobileViewMode === 'cards' ? 'hidden md:block' : 'block'} overflow-x-auto`}>
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Job Number</th>
                <th className="py-3 px-4">Client / Factory</th>
                <th className="py-3 px-4">Board Specification</th>
                <th className="py-3 px-4">Challan</th>
                <th className="py-3 px-4">Technician</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Service Bill</th>
                <th className="py-3 px-4 text-right">Due Amount</th>
                <th className="py-3 px-4 text-center">Receipt</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedJobs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No repair jobs found matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* Job Number with Copy Button */}
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      <div className="flex items-center gap-1.5">
                        <span>{job.jobNumber}</span>
                        <CopyButton text={job.jobNumber} />
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono font-normal">
                        {job.receivedDate}
                      </div>
                    </td>

                    {/* Client / Garments & Phone with Copy Button */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 truncate max-w-[170px]">
                        {job.company || job.customerName}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <span>{job.phone}</span>
                        <CopyButton text={job.phone} />
                      </div>
                    </td>

                    {/* Board Spec */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {job.brand} {job.model ? `· ${job.model}` : ''}
                      </div>
                      <div className="text-[10px] text-slate-500">{job.boardType}</div>
                      <div className="text-[10px] font-mono font-bold text-slate-900 flex items-center gap-1">
                        <span>{job.boardNumber}</span>
                        <CopyButton text={job.boardNumber} />
                      </div>
                    </td>

                    {/* Challan with Copy Button */}
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      <div className="flex items-center gap-1">
                        <span>{job.challan}</span>
                        <CopyButton text={job.challan} />
                      </div>
                    </td>

                    {/* Technician */}
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {job.technician}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          job.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : job.status === 'In Processing'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : job.status === 'Diagnosing'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : job.status === 'Picked Up'
                            ? 'bg-slate-100 text-slate-700'
                            : job.status === 'Declined'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>

                    {/* Service Bill */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      ৳{job.serviceCharge.toLocaleString()}
                    </td>

                    {/* Due Amount */}
                    <td className="py-3.5 px-4 text-right font-mono">
                      {job.due > 0 ? (
                        <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                          ৳{job.due.toLocaleString()}
                        </span>
                      ) : (
                        <span className="font-semibold text-emerald-600">Paid ৳0</span>
                      )}
                    </td>

                    {/* Print Receipt / Slip */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedJobForPrint(job);
                            setPrintType('intake');
                          }}
                          title="Print Job Intake Receipt"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Actions Menu */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setStatusModalJob(job);
                            setNewStatus(job.status);
                          }}
                          title="Change Status"
                          className="px-2 py-1 text-[10px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md cursor-pointer transition-colors"
                        >
                          Status
                        </button>

                        {job.due > 0 && (
                          <button
                            onClick={() => {
                              setPaymentModalJob(job);
                              setPaymentAmount(job.due);
                            }}
                            title="Collect Payment"
                            className="px-2 py-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md cursor-pointer transition-colors"
                          >
                            Pay
                          </button>
                        )}

                        <button
                          onClick={() => onArchiveJob(job.id)}
                          title="Archive Job"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Responsive Pagination Bar */}
        <div className="px-4 sm:px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="text-center sm:text-left">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredJobs.length)} of {filteredJobs.length} records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono font-semibold text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Quick Status Change Modal */}
      {statusModalJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">
                Update Status for {statusModalJob.jobNumber}
              </h4>
              <button onClick={() => setStatusModalJob(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-600">Select Next Status:</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
              >
                <option value="Received">Received</option>
                <option value="Diagnosing">Diagnosing</option>
                <option value="In Processing">In Processing</option>
                <option value="Completed">Completed (Ready for Pickup)</option>
                <option value="Picked Up">Picked Up (Delivered with Warranty)</option>
                <option value="Declined">Declined</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setStatusModalJob(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusChangeSubmit}
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
              >
                Save Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Payment Modal */}
      {paymentModalJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">
                Record Payment: {paymentModalJob.jobNumber}
              </h4>
              <button onClick={() => setPaymentModalJob(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 font-mono">
              <div className="flex justify-between text-slate-500">
                <span>Total Bill:</span>
                <span>৳{paymentModalJob.serviceCharge}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Already Received:</span>
                <span>৳{paymentModalJob.receivedAmount}</span>
              </div>
              <div className="flex justify-between font-bold text-rose-600">
                <span>Outstanding Due:</span>
                <span>৳{paymentModalJob.due}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-600">Payment Amount (৳):</label>
              <input
                type="number"
                min="1"
                max={paymentModalJob.due}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPaymentModalJob(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentSubmit}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Receipt Modal */}
      {selectedJobForPrint && (
        <ReceiptModal
          job={selectedJobForPrint}
          type={printType}
          onClose={() => setSelectedJobForPrint(null)}
        />
      )}

    </div>
  );
};
