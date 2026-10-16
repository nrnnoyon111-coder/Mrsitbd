import React, { useState } from 'react';
import { Settings, Save, Shield, Check, DollarSign, Clock, Hash, Eye } from 'lucide-react';
import { AppSettings } from '../../types';
import { useToast } from '../Toast';

interface SystemSettingsProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof AppSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        onUpdateSettings(data.settings);
        showToast('System configuration saved successfully.', 'success');
      }
    } catch (err) {
      showToast('Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            System & Operational Settings
          </h2>
          <p className="text-xs text-slate-500">
            Configure currency format (BDT ৳), timezone (Asia/Dhaka), and public customer privacy rules
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        
        {/* Card 1: Regional & Job ID Sequencing */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
            1. Job Number Sequence & Localization
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Job Number Prefix</label>
              <input
                type="text"
                value={formData.jobNumberPrefix}
                onChange={(e) => handleChange('jobNumberPrefix', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                Generates {formData.jobNumberPrefix}0001, {formData.jobNumberPrefix}0002...
              </span>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Next Sequence ID</label>
              <input
                type="number"
                min="1"
                value={formData.nextJobSequence}
                onChange={(e) => handleChange('nextJobSequence', Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                Current next: {formData.jobNumberPrefix}{String(formData.nextJobSequence).padStart(4, '0')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Standard Currency</label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Currency Symbol</label>
              <input
                type="text"
                value={formData.currencySymbol}
                onChange={(e) => handleChange('currencySymbol', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Default Timezone</label>
            <input
              type="text"
              value={formData.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
            />
          </div>
        </div>

        {/* Card 2: Customer Public Visibility Rules */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
            2. Customer Privacy & Tracker Permissions
          </h3>

          <div className="space-y-3 pt-1">
            <label className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.publicBillVisible}
                onChange={(e) => handleChange('publicBillVisible', e.target.checked)}
                className="rounded text-blue-600 mt-0.5"
              />
              <div>
                <span className="font-bold text-slate-800 block">Show Service Bill on Public Tracker</span>
                <span className="text-[11px] text-slate-500">
                  Allow customers to see the verified service charge when searching their Job Number.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.publicDueVisible}
                onChange={(e) => handleChange('publicDueVisible', e.target.checked)}
                className="rounded text-blue-600 mt-0.5"
              />
              <div>
                <span className="font-bold text-slate-800 block">Show Outstanding Due on Public Tracker</span>
                <span className="text-[11px] text-slate-500">
                  Displays unpaid balance so clients can arrange payment before board pickup.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.publicWarrantyVisible}
                onChange={(e) => handleChange('publicWarrantyVisible', e.target.checked)}
                className="rounded text-blue-600 mt-0.5"
              />
              <div>
                <span className="font-bold text-slate-800 block">Show Warranty Certificate Dates Publicly</span>
                <span className="text-[11px] text-slate-500">
                  Provides transparency by confirming remaining warranty days online.
                </span>
              </div>
            </label>
          </div>

        </div>

      </form>

    </div>
  );
};
