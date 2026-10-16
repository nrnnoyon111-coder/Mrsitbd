import React, { useState } from 'react';
import { Search, X, Clock, CheckCircle2, AlertCircle, Shield, FileText } from 'lucide-react';
import { CopyButton } from '../CopyButton';

interface PublicJobHistoryProps {
  onClose: () => void;
  onSelectJob: (jobNumber: string) => void;
}

export const PublicJobHistory: React.FC<PublicJobHistoryProps> = ({
  onClose,
  onSelectJob,
}) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(`/api/jobs/history?phone=${encodeURIComponent(phone.trim())}`);
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'No jobs found for this phone number.');
      }
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Error loading job history.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base tracking-tight">
              Customer Job History Portal
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              View all past and active circuit repair orders for your registered mobile number
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <form onSubmit={handleSearch} className="flex gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter Registered Mobile Number (e.g. 01711223344)..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>

            <button
              type="submit"
              disabled={loading || !phone.trim()}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Fetch History</span>
              )}
            </button>
          </form>

          <div className="mt-2 text-xs text-slate-500">
            <span>Sample registered numbers:</span>{' '}
            <button
              type="button"
              onClick={() => {
                setPhone('01711223344');
                fetch('/api/jobs/history?phone=01711223344')
                  .then((r) => r.json())
                  .then((d) => setData(d));
              }}
              className="font-mono text-blue-600 hover:underline"
            >
              01711223344 (Ha-Meem)
            </button>
            {' · '}
            <button
              type="button"
              onClick={() => {
                setPhone('01819876543');
                fetch('/api/jobs/history?phone=01819876543')
                  .then((r) => r.json())
                  .then((d) => setData(d));
              }}
              className="font-mono text-blue-600 hover:underline"
            >
              01819876543 (Ananta)
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto space-y-6">
          
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {data && (
            <div className="space-y-6">
              
              {/* Account Summary Banner */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                    Organization Profile
                  </span>
                  <h4 className="text-xl font-extrabold text-white">
                    {data.company || data.customerName}
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Authorized Contact: {data.customerName} · Registered Mobile: {data.phoneMasked}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-center">
                  <div className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700">
                    <div className="text-lg font-bold font-mono text-white">{data.totalJobs}</div>
                    <div className="text-[10px] text-slate-400">Total Jobs</div>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-blue-950/60 border border-blue-800/60">
                    <div className="text-lg font-bold font-mono text-blue-400">{data.activeJobs}</div>
                    <div className="text-[10px] text-blue-300">Active Jobs</div>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-emerald-950/60 border border-emerald-800/60">
                    <div className="text-lg font-bold font-mono text-emerald-400">{data.completedJobs}</div>
                    <div className="text-[10px] text-emerald-300">Completed</div>
                  </div>
                </div>
              </div>

              {/* Jobs Table List */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="p-3">Job #</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Board Brand & Model</th>
                        <th className="p-3">Board / Part Number</th>
                        <th className="p-3">Challan</th>
                        <th className="p-3">Dates</th>
                        <th className="p-3 text-right">Bill / Due</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.jobs.map((j: any) => (
                        <tr key={j.jobNumber} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-mono font-bold text-blue-600 flex items-center gap-1">
                            {j.jobNumber}
                            <CopyButton text={j.jobNumber} />
                          </td>

                          <td className="p-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                j.status === 'Completed'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : j.status === 'Picked Up'
                                  ? 'bg-slate-100 text-slate-700'
                                  : j.status === 'In Processing'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : j.status === 'Diagnosing'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}
                            >
                              {j.status}
                            </span>
                          </td>

                          <td className="p-3 font-medium text-slate-800">
                            {j.brand} {j.model ? `· ${j.model}` : ''}
                            <div className="text-[10px] text-slate-500">{j.boardType}</div>
                          </td>

                          <td className="p-3 font-mono font-bold text-slate-900">
                            {j.boardNumber}
                          </td>

                          <td className="p-3 font-mono text-slate-600">
                            {j.challan}
                          </td>

                          <td className="p-3 font-mono text-slate-600">
                            <div>Rec: {j.receivedDate}</div>
                            {j.deliveryDate && <div className="text-slate-400 text-[10px]">Del: {j.deliveryDate}</div>}
                          </td>

                          <td className="p-3 font-mono text-right">
                            {j.serviceCharge !== null && <div>৳{j.serviceCharge}</div>}
                            {j.due !== null && (
                              <div className={`text-[10px] font-bold ${j.due > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                Due: ৳{j.due}
                              </div>
                            )}
                          </td>

                          <td className="p-3 text-center">
                            <button
                              onClick={() => {
                                onClose();
                                onSelectJob(j.jobNumber);
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer transition-colors"
                            >
                              Track
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
