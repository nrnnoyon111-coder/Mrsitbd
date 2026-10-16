import React, { useRef, useEffect } from 'react';
import { X, Printer, ShieldCheck } from 'lucide-react';
import { RepairJob } from '../types';
import { MrsLogo } from './MrsLogo';
import { CopyButton } from './CopyButton';

interface ReceiptModalProps {
  job: RepairJob;
  type?: 'intake' | 'delivery' | 'payment';
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  job,
  type = 'intake',
  onClose,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Open browser print dialog directly (for printing or Save as PDF)
  const handlePrint = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    window.print();
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onClose();
  };

  // Helper to ensure clean display of serial/board
  const displaySerial = (job.boardSerial || job.boardNumber || 'N/A')
    .replace(/এই পরিবর্তনগুলো.*/g, '')
    .trim() || 'N/A';

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible"
    >
      {/* Inject print-specific styles for pristine PDF/paper print */}
      <style>{`
        @media print {
          @page {
            size: auto;
            margin: 10mm;
          }
          body {
            background: white !important;
            color: #1e293b !important;
          }
          /* Hide app elements outside the modal */
          header, aside, nav, .print\\:hidden {
            display: none !important;
          }
          .print-receipt-container {
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
        }
      `}</style>

      {/* Receipt Dialog Container */}
      <div className="print-receipt-container relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 print:m-0 print:border-none print:shadow-none print:rounded-none">
        
        {/* Top Header Actions Bar (hidden on print) */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-100 bg-slate-50/90 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-xs sm:text-sm">
              {type === 'intake' ? 'Job Intake Slip' : type === 'delivery' ? 'Delivery Gate Pass' : 'Payment Receipt'}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md font-mono bg-blue-100 text-blue-700 font-bold">
              {job.jobNumber}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
              title="Open Browser Print Dialog / Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close receipt"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div ref={receiptRef} className="p-6 sm:p-8 text-slate-800 bg-white space-y-6 print:p-2">
          
          {/* Company Letterhead */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-5 gap-4">
            <div>
              <MrsLogo variant="full" size="md" showTagline />
              <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">
                City Corporation Market, Karn Shopping Complex (2nd Floor), Shop No- 61, Mirpur- 13, Dhaka- 1216
              </p>
              <p className="text-xs font-mono text-slate-600 mt-1">
                Hotlines: 01334362397, 01869217526 · mrsfastsolutions@gmail.com
              </p>
            </div>

            <div className="text-right flex flex-col items-end shrink-0">
              <span className="text-[11px] uppercase tracking-wider font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-mono">
                {type === 'intake' ? 'OFFICE & CLIENT COPY' : type === 'delivery' ? 'DELIVERY CHALLAN' : 'PAYMENT SLIP'}
              </span>
              <div className="mt-2 text-right">
                <div className="text-[11px] text-slate-400">Job Reference</div>
                <div className="text-xl font-extrabold font-mono text-blue-700 tracking-tight flex items-center justify-end gap-1">
                  {job.jobNumber}
                  <span className="print:hidden"><CopyButton text={job.jobNumber} /></span>
                </div>
              </div>
              <div className="text-xs font-mono text-slate-500 mt-1">
                Challan: <strong className="text-slate-700">{job.challan}</strong>
              </div>
            </div>
          </div>

          {/* Job & Client Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/70 text-xs">
            <div className="space-y-1.5">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Client / Organization</span>
              <div className="font-bold text-slate-900 text-sm">{job.company || job.customerName}</div>
              <div className="text-slate-600">Contact: {job.customerName}</div>
              <div className="font-mono text-slate-600 flex items-center gap-1">
                Phone: {job.phone}
                <span className="print:hidden"><CopyButton text={job.phone} /></span>
              </div>
              {job.email && <div className="text-slate-500 font-mono">{job.email}</div>}
            </div>

            <div className="space-y-1.5 text-left sm:text-right">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Job Dates & Handling</span>
              <div className="flex justify-between sm:justify-end gap-4">
                <span className="text-slate-500">Received Date:</span>
                <span className="font-semibold font-mono text-slate-800">{job.receivedDate}</span>
              </div>
              <div className="flex justify-between sm:justify-end gap-4">
                <span className="text-slate-500">Delivery Date:</span>
                <span className="font-semibold font-mono text-slate-800">{job.deliveryDate || 'Under Processing'}</span>
              </div>
              <div className="flex justify-between sm:justify-end gap-4">
                <span className="text-slate-500">Technician:</span>
                <span className="font-semibold text-slate-800">{job.technician}</span>
              </div>
              <div className="flex justify-between sm:justify-end gap-4">
                <span className="text-slate-500">Current Status:</span>
                <span className="font-bold text-blue-700">{job.status}</span>
              </div>
            </div>
          </div>

          {/* Board Specifications Table */}
          <div>
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="p-2.5">Brand & Machine Model</th>
                  <th className="p-2.5">Board Classification</th>
                  <th className="p-2.5">Serial Number</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2.5 font-semibold text-slate-800">
                    {job.brand} {job.model ? `· ${job.model}` : ''}
                  </td>
                  <td className="p-2.5 text-slate-700">{job.boardType}</td>
                  <td className="p-2.5 font-mono font-bold text-slate-900">{displaySerial}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Problem & Diagnostic Notes */}
          <div className="space-y-1 text-xs">
            <div className="font-semibold text-slate-700">Reported Problem / Defect:</div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-slate-600 italic">
              {job.problem || 'Standard diagnostics inspection required'}
            </div>
            {job.remarks && (
              <div className="mt-2 text-slate-600">
                <strong className="text-slate-800">Technician Remarks:</strong> {job.remarks}
              </div>
            )}
          </div>

          {/* Billing & Due Statement */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-t border-slate-200 pt-4 gap-4">
            <div className="space-y-1 text-xs text-slate-500 max-w-xs">
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Warranty Clause:
              </div>
              <p>
                {job.warrantyDays} days service warranty on repaired components.
                {job.warrantyUntil ? ` Valid until ${job.warrantyUntil}.` : ''}
              </p>
              <p className="text-[10px] text-slate-400">
                Void if warranty seal is tampered or damage caused by high voltage power surge.
              </p>
            </div>

            <div className="w-full sm:w-56 space-y-1.5 text-xs text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0">
              <div className="flex justify-between">
                <span className="text-slate-500">Service Bill:</span>
                <span className="font-bold font-mono text-slate-800">৳{job.serviceCharge.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Received Amount:</span>
                <span className="font-bold font-mono text-emerald-600">৳{job.receivedAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1 text-sm font-bold">
                <span className="text-slate-700">Remaining Due:</span>
                <span className={`font-mono ${job.due > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                  ৳{job.due.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Authorized Signature Block */}
          <div className="grid grid-cols-2 gap-8 pt-8 text-xs text-center border-t border-dashed border-slate-300">
            <div>
              <div className="border-t border-slate-400 w-36 mx-auto mb-1"></div>
              <span className="text-slate-500 text-[11px]">Customer Signature & Seal</span>
            </div>
            <div>
              <div className="border-t border-slate-400 w-36 mx-auto mb-1"></div>
              <span className="font-semibold text-slate-700 text-[11px]">For MRS Fast Solutions</span>
              <p className="text-[10px] text-slate-400">Authorized Signature & Seal</p>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center text-[10px] text-slate-400 border-t border-slate-100 pt-3">
            Track this job 24/7 on our live portal with Job Number <strong>{job.jobNumber}</strong>. Thank you for your business.
          </div>
        </div>

        {/* Bottom Footer Actions Bar (hidden on print) */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-100 print:hidden">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Close Receipt
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>

      </div>
    </div>
  );
};
