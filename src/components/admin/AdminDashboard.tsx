import React, { useState } from 'react';
import {
  Wrench,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Receipt,
  Users,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  Eye,
  Printer,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { DashboardKPIs, RepairJob, Product } from '../../types';
import { CopyButton } from '../CopyButton';

interface AdminDashboardProps {
  kpis: DashboardKPIs;
  recentJobs: RepairJob[];
  products: Product[];
  onOpenAddJob: () => void;
  onViewJob: (job: RepairJob) => void;
  onPrintJob: (job: RepairJob) => void;
  onNavigate: (section: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  kpis,
  recentJobs,
  products,
  onOpenAddJob,
  onViewJob,
  onPrintJob,
  onNavigate,
}) => {
  const [financialFilter, setFinancialFilter] = useState<'all' | 'repair' | 'sales'>('all');

  // Mini sparkline SVG generator
  const renderSparkline = (points: number[], color: string) => {
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 80;
    const height = 28;
    const coords = points.map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    });
    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coords.join(' ')}
        />
      </svg>
    );
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner & KPI Strip (matching reference video top cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Today's Jobs & Active */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Today's Jobs</span>
            {renderSparkline([2, 5, 4, 7, 6, 9, 8], '#2563EB')}
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tabular-nums">
              {kpis.todayJobs}
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
              +12.5%
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono">
            Active in workshop: <strong className="text-slate-800">{kpis.totalActiveJobs}</strong>
          </div>
        </div>

        {/* Card 2: Diagnosing & In Processing */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">In Processing Bay</span>
            {renderSparkline([4, 6, 8, 5, 9, 11, 10], '#7C3AED')}
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-purple-700 tabular-nums">
              {kpis.inProcessingCount + kpis.diagnosingCount}
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Bench Testing
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono">
            Diagnosing: {kpis.diagnosingCount} · Soldering: {kpis.inProcessingCount}
          </div>
        </div>

        {/* Card 3: Completed & Ready */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Ready for Pickup</span>
            {renderSparkline([3, 4, 6, 5, 8, 7, 10], '#059669')}
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 tabular-nums">
              {kpis.completedToday}
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Passed QA
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono">
            Picked up today: {kpis.pickedUpToday}
          </div>
        </div>

        {/* Card 4: Total Registered Clients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Garment Clients</span>
            {renderSparkline([12, 14, 15, 18, 19, 21, 24], '#0284C7')}
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tabular-nums">
              {kpis.totalClients}
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Corporate
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono">
            Total lifetime jobs: <strong className="text-slate-800">{kpis.totalJobs}</strong>
          </div>
        </div>

      </div>

      {/* Main Financial & Performance Split (matching reference video hero chart & radial gauge) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Total Profit & Cashflow Overview */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Financial Cashflow Balance
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 tracking-tight">
                  ৳{(financialFilter === 'repair'
                    ? kpis.financials.repairIncome
                    : financialFilter === 'sales'
                    ? kpis.financials.salesIncome
                    : kpis.financials.totalCompanyIncome
                  ).toLocaleString()}
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                  +24.4% vs last month
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Total Company Income = Repair Collections (৳{kpis.financials.repairIncome.toLocaleString()}) + Parts Sales (৳{kpis.financials.salesIncome.toLocaleString()})
              </p>
            </div>

            {/* Segmented Filter Control */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setFinancialFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  financialFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All Combined
              </button>
              <button
                onClick={() => setFinancialFilter('repair')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  financialFilter === 'repair'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Repair Only
              </button>
              <button
                onClick={() => setFinancialFilter('sales')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  financialFilter === 'sales'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Parts Sales
              </button>
            </div>
          </div>

          {/* Simulated Area Chart Curve with Monthly Timeline */}
          <div className="relative pt-4 pb-2">
            <div className="h-44 w-full flex items-end gap-2 sm:gap-3 px-2 border-b border-slate-100">
              {[
                { day: '1 Oct', val: 24, label: '৳24K' },
                { day: '3 Oct', val: 38, label: '৳38K' },
                { day: '5 Oct', val: 29, label: '৳29K' },
                { day: '7 Oct', val: 55, label: '৳55K' },
                { day: '9 Oct', val: 42, label: '৳42K' },
                { day: '11 Oct', val: 68, label: '৳68K' },
                { day: '13 Oct', val: 82, label: '৳82K' },
                { day: '14 Oct', val: 64, label: '৳64K' },
              ].map((item, idx) => {
                const heightPct = (item.val / 90) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="text-[10px] font-mono font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.label}
                    </div>
                    <div
                      className="w-full bg-blue-100 group-hover:bg-blue-600 rounded-t-lg transition-all duration-300 relative"
                      style={{ height: `${heightPct}%` }}
                    >
                      <div className="absolute top-0 inset-x-0 h-1.5 bg-blue-600 rounded-t-lg"></div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-800">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sub-strip with Net Profit, Expenses, and Receivables */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-xs">
            
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500">Total Expenses:</span>
              <div className="text-lg font-bold font-mono text-slate-800 mt-0.5">
                ৳{kpis.financials.totalExpenses.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Rent, Parts, DESCO power</div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <span className="text-emerald-800 font-semibold">Net Business Income:</span>
              <div className="text-lg font-bold font-mono text-emerald-700 mt-0.5">
                ৳{kpis.financials.netBusinessIncome.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5">Income minus expenses</div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-100">
              <span className="text-rose-800 font-semibold">Total Due / Receivable:</span>
              <div className="text-lg font-bold font-mono text-rose-700 mt-0.5">
                ৳{kpis.financials.totalDueReceivable.toLocaleString()}
              </div>
              <div className="text-[10px] text-rose-600 mt-0.5">Repair: ৳{kpis.financials.repairDue} · Sales: ৳{kpis.financials.salesDue}</div>
            </div>

          </div>

        </div>

        {/* Right 4 Cols: Repeat Customer Rate Gauge & Most Active Day (matching reference video) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Radial Circular Progress Gauge (Repeat Customer Rate) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-between text-center">
            <div className="w-full flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-bold text-slate-700">Repeat Customer Rate</span>
              <button
                onClick={() => onNavigate('clients')}
                className="text-blue-600 hover:underline cursor-pointer"
              >
                View Clients
              </button>
            </div>

            {/* Semicircular SVG Gauge (matching reference video 68% widget) */}
            <div className="relative my-4 flex items-center justify-center">
              <svg width="180" height="110" viewBox="0 0 180 110" className="overflow-visible">
                {/* Background Arc */}
                <path
                  d="M 20 100 A 70 70 0 0 1 160 100"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
                {/* Active Colored Arc (74% filled) */}
                <path
                  d="M 20 100 A 70 70 0 0 1 160 100"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeDasharray="220"
                  strokeDashoffset={220 - (220 * (kpis.repeatCustomerRate || 74)) / 100}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute bottom-2 text-center">
                <div className="text-3xl font-extrabold font-mono text-slate-900">
                  {kpis.repeatCustomerRate || 74}%
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  On track for 80% target
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              74% of repaired boards originate from contracted apparel factories returning for ongoing maintenance.
            </p>
          </div>

          {/* Most Day Active Weekly Bar Distribution */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">Most Active Workshop Day</span>
              <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-bold">
                Tuesday Peak
              </span>
            </div>

            <div className="flex items-end justify-between gap-2 h-20 pt-4 px-2">
              {[
                { day: 'Sat', val: 40 },
                { day: 'Sun', val: 55 },
                { day: 'Mon', val: 65 },
                { day: 'Tue', val: 95, active: true },
                { day: 'Wed', val: 70 },
                { day: 'Thu', val: 50 },
                { day: 'Fri', val: 10 },
              ].map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div
                    className={`w-full rounded-t-md transition-all ${
                      d.active ? 'bg-blue-600 shadow-sm' : 'bg-slate-100'
                    }`}
                    style={{ height: `${d.val}%` }}
                  ></div>
                  <span className={`text-[10px] font-mono ${d.active ? 'font-bold text-blue-700' : 'text-slate-400'}`}>
                    {d.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Tables Row: Recent Repair Jobs & Best Selling Industrial Parts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Recent Repair Jobs Table */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Recent Repair Jobs
              </h3>
              <p className="text-xs text-slate-500">
                Latest circuit boards logged into diagnostic workshop
              </p>
            </div>

            <button
              onClick={() => onNavigate('jobs')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All Jobs</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Job #</th>
                  <th className="py-2.5 px-3">Client / Garments</th>
                  <th className="py-2.5 px-3">Board Details</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Bill / Due</th>
                  <th className="py-2.5 px-3 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentJobs.slice(0, 5).map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-blue-600 flex items-center gap-1">
                      {job.jobNumber}
                      <CopyButton text={job.jobNumber} />
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 truncate max-w-[150px]">
                        {job.company || job.customerName}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">{job.phone}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-800">{job.brand}</span>
                      <span className="text-slate-400"> · </span>
                      <span className="text-slate-600">{job.boardType}</span>
                      <div className="text-[10px] font-mono text-slate-500 font-bold">{job.boardNumber}</div>
                    </td>

                    <td className="py-3 px-3">
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

                    <td className="py-3 px-3 text-right font-mono">
                      <div className="font-bold text-slate-900">৳{job.serviceCharge.toLocaleString()}</div>
                      {job.due > 0 ? (
                        <div className="text-[10px] text-rose-600 font-bold">Due: ৳{job.due}</div>
                      ) : (
                        <div className="text-[10px] text-emerald-600 font-semibold">Paid</div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onViewJob(job)}
                          title="View Details"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onPrintJob(job)}
                          title="Print Receipt"
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* Right 4 Cols: Best Selling Industrial Electronics Parts */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Stocked Parts
              </h3>
              <p className="text-xs text-slate-500">
                Fast-moving components & semiconductors
              </p>
            </div>

            <button
              onClick={() => onNavigate('sales')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              Inventory
            </button>
          </div>

          <div className="space-y-3">
            {products.slice(0, 5).map((prod) => (
              <div
                key={prod.id}
                className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 truncate">
                    {prod.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {prod.productId} · {prod.category}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-slate-800">
                    ৳{prod.salePrice.toLocaleString()}
                  </div>
                  <span
                    className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      prod.currentStock <= prod.minStockLevel
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    Stock: {prod.currentStock} {prod.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
};
