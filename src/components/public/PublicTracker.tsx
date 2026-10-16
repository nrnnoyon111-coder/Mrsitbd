import React, { useState, useEffect } from 'react';
import { Search, X, CheckCircle, Clock, AlertTriangle, ArrowRight, Printer, Shield, MessageCircle, HelpCircle } from 'lucide-react';
import { CopyButton } from '../CopyButton';
import { ReceiptModal } from '../ReceiptModal';

interface PublicTrackerProps {
  initialQuery?: string;
  onClose: () => void;
}

export const PublicTracker: React.FC<PublicTrackerProps> = ({
  initialQuery = '',
  onClose,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setError(null);
    setJob(null);

    try {
      const res = await fetch(`/api/jobs/track?q=${encodeURIComponent(searchTerm.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to locate repair job.');
      }
      setJob(data.job);
    } catch (err: any) {
      setError(err.message || 'Network error occurred while fetching job details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  // Timeline steps
  const steps = [
    { id: 'Received', label: '1. Received', desc: 'Logged & queued' },
    { id: 'Diagnosing', label: '2. Diagnosing', desc: 'Circuit test bench' },
    { id: 'In Processing', label: '3. In Processing', desc: 'Micro-soldering & IC replace' },
    { id: 'Completed', label: '4. Completed', desc: 'Bench tested & ready' },
    { id: 'Picked Up', label: '5. Picked Up', desc: 'Delivered with warranty' },
  ];

  const getStepIndex = (status: string) => {
    if (status === 'Received') return 0;
    if (status === 'Diagnosing') return 1;
    if (status === 'In Processing') return 2;
    if (status === 'Completed') return 3;
    if (status === 'Picked Up') return 4;
    return -1; // Declined
  };

  const currentStepIdx = job ? getStepIndex(job.status) : 0;
  const isDeclined = job && job.status === 'Declined';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-150">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight">
                Live Job Tracking System
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Direct query against MRS Fast Solution high-speed database
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar Input */}
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <form onSubmit={handleSearchSubmit} className="flex gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Job Number (e.g. M0001), Challan #, or Mobile..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Search</span>
              )}
            </button>
          </form>

          <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-500">
            <span>Sample queries:</span>
            <button
              type="button"
              onClick={() => {
                setQuery('M0001');
                performSearch('M0001');
              }}
              className="font-mono text-blue-600 hover:underline"
            >
              M0001
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => {
                setQuery('M0002');
                performSearch('M0002');
              }}
              className="font-mono text-blue-600 hover:underline"
            >
              M0002
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => {
                setQuery('CH-2026-1004');
                performSearch('CH-2026-1004');
              }}
              className="font-mono text-blue-600 hover:underline"
            >
              CH-2026-1004
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto space-y-6">
          
          {/* Loading Skeleton */}
          {loading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-20 bg-slate-100 rounded-2xl"></div>
              <div className="h-40 bg-slate-100 rounded-2xl"></div>
            </div>
          )}

          {/* Error Message */}
          {error && !loading && (
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Record Not Located</p>
                <p className="text-xs text-rose-700 mt-1">{error}</p>
                <p className="text-xs text-rose-600 mt-2">
                  Please verify the Job Number on your MRS receipt (e.g. M0001) or call our helpdesk at <strong>+88 01334362397</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Job Details Display */}
          {job && !loading && (
            <div className="space-y-6">
              
              {/* Status Header Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-blue-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">JOB NUMBER</span>
                    <CopyButton text={job.jobNumber} className="text-slate-300 hover:text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-blue-400 tracking-tight">
                    {job.jobNumber}
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    Customer: <strong className="text-white">{job.company || job.customerName}</strong>
                    {job.customerName && job.company && ` (${job.customerName})`}
                  </p>
                </div>

                <div className="sm:text-right">
                  <span className="text-[11px] font-mono text-slate-400">CURRENT STATUS</span>
                  <div className="mt-1">
                    <span
                      className={`inline-block px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-wide uppercase ${
                        job.status === 'Completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                          : job.status === 'In Processing'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                          : job.status === 'Diagnosing'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                          : job.status === 'Picked Up'
                          ? 'bg-slate-500/20 text-slate-300 border border-slate-400/30'
                          : job.status === 'Declined'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* 5-Step Visual Timeline */}
              {!isDeclined ? (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6 font-mono">
                    Repair Progress Timeline
                  </h4>

                  <div className="relative">
                    {/* Connecting line */}
                    <div className="absolute top-4 left-4 right-4 h-1 bg-slate-200 -z-0 hidden md:block">
                      <div
                        className="h-full bg-blue-600 transition-all duration-500"
                        style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
                      ></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
                      {steps.map((step, idx) => {
                        const isDone = idx <= currentStepIdx;
                        const isCurrent = idx === currentStepIdx;

                        return (
                          <div key={step.id} className="flex md:flex-col items-center md:text-center gap-3 md:gap-2">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                isDone
                                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                                  : 'bg-white border-2 border-slate-300 text-slate-400'
                              } ${isCurrent ? 'ring-4 ring-blue-100 scale-110' : ''}`}
                            >
                              {isDone ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                            </div>

                            <div>
                              <div className={`text-xs font-bold ${isCurrent ? 'text-blue-700 font-extrabold' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                                {step.label}
                              </div>
                              <div className="text-[10px] text-slate-500">{step.desc}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  <strong>Job Status: Declined</strong> — Repair was declined due to extensive component burn or unavailable proprietary micro-controller. Please contact technician.
                </div>
              )}

              {/* Board Specifications & Challan Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <div className="font-bold text-slate-900 border-b border-slate-100 pb-2">
                    Industrial Board Specification
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Brand:</span>
                    <span className="font-semibold text-slate-800">{job.brand}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Machine Model:</span>
                    <span className="font-semibold text-slate-800">{job.model || 'Standard'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Board Classification:</span>
                    <span className="font-semibold text-slate-800">{job.boardType}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Board / Part Number:</span>
                    <span className="font-mono font-bold text-slate-900 flex items-center gap-1">
                      {job.boardNumber}
                      <CopyButton text={job.boardNumber} />
                    </span>
                  </div>
                  {job.boardSerial && (
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Board Serial:</span>
                      <span className="font-mono text-slate-700 flex items-center gap-1">
                        {job.boardSerial}
                        <CopyButton text={job.boardSerial} />
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <div className="font-bold text-slate-900 border-b border-slate-100 pb-2">
                    Dates & Financial Summary
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Challan Ref:</span>
                    <span className="font-mono font-semibold text-slate-800 flex items-center gap-1">
                      {job.challan}
                      <CopyButton text={job.challan} />
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Received Date:</span>
                    <span className="font-mono font-semibold text-slate-800">{job.receivedDate}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Delivery Date:</span>
                    <span className="font-mono font-semibold text-slate-800">{job.deliveryDate || 'Processing'}</span>
                  </div>
                  {job.serviceCharge !== null && (
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Service Bill:</span>
                      <span className="font-mono font-bold text-slate-800">৳{job.serviceCharge.toLocaleString()}</span>
                    </div>
                  )}
                  {job.due !== null && (
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Remaining Due:</span>
                      <span className={`font-mono font-bold ${job.due > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        ৳{job.due.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

              </div>

              {/* Warranty Badge & Support */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-900">
                      Warranty Status: {job.warrantyDays} Days Official Coverage
                    </span>
                    <p className="text-[11px] text-emerald-700">
                      {job.warrantyUntil ? `Valid until ${job.warrantyUntil}` : 'Starts upon final pickup and bench handover'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPrintModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Receipt
                  </button>

                  <a
                    href={`https://wa.me/8801334362397?text=Hello%20MRS%20Fast%20Solution,%20I%20am%20inquiring%20about%20Job%20${job.jobNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs cursor-pointer shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp
                  </a>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {showPrintModal && job && (
        <ReceiptModal
          job={job}
          type="intake"
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
};
