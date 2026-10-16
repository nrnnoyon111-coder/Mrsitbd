import React, { useState, useEffect } from 'react';
import { Archive, RotateCcw, Search, Trash2, AlertCircle } from 'lucide-react';
import { RepairJob } from '../../types';
import { useToast } from '../Toast';

interface ArchiveViewerProps {
  onRefresh: () => void;
}

export const ArchiveViewer: React.FC<ArchiveViewerProps> = ({ onRefresh }) => {
  const { showToast } = useToast();
  const [archivedJobs, setArchivedJobs] = useState<RepairJob[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchArchived = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/jobs?archived=true');
      const data = await res.json();
      setArchivedJobs(data.jobs || []);
    } catch (err) {
      showToast('Error loading archived records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchived();
  }, []);

  const handleRestore = async (id: string, jobNumber: string) => {
    try {
      const res = await fetch(`/api/jobs/${id}/restore`, { method: 'POST' });
      if (res.ok) {
        showToast(`Job ${jobNumber} restored to active list.`, 'success');
        fetchArchived();
        onRefresh();
      }
    } catch (err) {
      showToast('Restore failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Archived Records Vault
          </h2>
          <p className="text-xs text-slate-500">
            Soft-deleted repair jobs are preserved here to protect audit history and Google Sheet compatibility
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
          {archivedJobs.length} Archived Items
        </span>
      </div>

      {/* Archived Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Job #</th>
                <th className="py-3 px-4">Client / Company</th>
                <th className="py-3 px-4">Board Details</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Service Bill</th>
                <th className="py-3 px-4 text-center">Restore</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {archivedJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Archive vault is empty. No jobs currently archived.
                  </td>
                </tr>
              ) : (
                archivedJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      {job.jobNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {job.company || job.customerName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {job.brand} {job.model ? `· ${job.model}` : ''} ({job.boardNumber})
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                      ৳{job.serviceCharge}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleRestore(job.id, job.jobNumber)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Restore</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
