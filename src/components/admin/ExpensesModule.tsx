import React, { useState } from 'react';
import { Receipt, Plus, DollarSign, Calendar, Tag, CreditCard, X, Check } from 'lucide-react';
import { Expense } from '../../types';
import { useToast } from '../Toast';

interface ExpensesModuleProps {
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
}

export const ExpensesModule: React.FC<ExpensesModuleProps> = ({
  expenses,
  onAddExpense,
}) => {
  const { showToast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);

  const [category, setCategory] = useState('Spare Parts & Consumables');
  const [amount, setAmount] = useState<number>(3000);
  const [paidTo, setPaidTo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      showToast('Please enter a valid expense amount.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          amount,
          paidTo: paidTo.trim(),
          paymentMethod,
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        onAddExpense(data.expense);
        showToast('Expense recorded successfully.', 'success');
        setShowAddModal(false);
        setPaidTo('');
        setNotes('');
      }
    } catch (err) {
      showToast('Failed to record expense', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & KPI Summary */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Accounts & Workshop Expenses
          </h2>
          <p className="text-xs text-slate-500">
            Monthly workshop rent, component imports, utilities, technician allowances
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-mono block">TOTAL OUTFLOW</span>
            <span className="text-xl font-extrabold font-mono text-rose-600">
              ৳{totalExpense.toLocaleString()}
            </span>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Record Expense</span>
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Expense Voucher #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Paid To</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                    {exp.expenseNo}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    {exp.date}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {exp.paidTo || 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono">
                    {exp.paymentMethod}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                    {exp.notes || '-'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600">
                    ৳{exp.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">Record Expense Voucher</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Expense Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="Shop Rent">Shop Rent (Shop 61, 2nd floor)</option>
                  <option value="Utility & Electricity">Utility & Electricity (DESCO)</option>
                  <option value="Spare Parts & Consumables">Spare Parts & Consumables</option>
                  <option value="Testing Tools & Equipment">Testing Tools & Oscilloscope Probes</option>
                  <option value="Transport & Conveyance">Transport & Factory Conveyance</option>
                  <option value="Technician Allowance">Technician Salary / Allowance</option>
                  <option value="Tea & Refreshments">Tea & Client Hospitality</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Amount (৳) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Paid To / Payee</label>
                <input
                  type="text"
                  value={paidTo}
                  onChange={(e) => setPaidTo(e.target.value)}
                  placeholder="e.g. Karn Shopping Complex / DESCO"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="Cash">Cash in Hand</option>
                  <option value="bKash Merchant">bKash Merchant</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Bank Transfer">Bank Asia / DBBL</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Notes / Description</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. October 2026 rent payment"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
