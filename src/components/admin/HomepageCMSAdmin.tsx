import React, { useState } from 'react';
import { Globe, Check, Image, Save, Eye, Sparkles } from 'lucide-react';
import { HomepageCMS } from '../../types';
import { useToast } from '../Toast';

interface HomepageCMSAdminProps {
  cms: HomepageCMS;
  onUpdateCMS: (cms: HomepageCMS) => void;
  onViewPublicSite: () => void;
}

export const HomepageCMSAdmin: React.FC<HomepageCMSAdminProps> = ({
  cms,
  onUpdateCMS,
  onViewPublicSite,
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<HomepageCMS>(cms);
  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof HomepageCMS, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/cms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        onUpdateCMS(data.cms);
        showToast('Homepage CMS updated successfully! Public website reflects changes immediately.', 'success');
      }
    } catch (err) {
      showToast('Failed to save CMS changes', 'error');
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
            Homepage Content Management System (CMS)
          </h2>
          <p className="text-xs text-slate-500">
            Edit company headlines, proprietor details, announcement banners, and hotlines without code changes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onViewPublicSite}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Preview Public Site</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        
        {/* Card 1: Branding & Hero Headlines */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
            1. Branding & Hero Headlines
          </h3>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Company / Brand Name</label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Primary Tagline</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => handleChange('tagline', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Hero Main Headline</label>
            <textarea
              rows={2}
              value={formData.heroHeadline}
              onChange={(e) => handleChange('heroHeadline', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Hero Subheadline</label>
            <textarea
              rows={3}
              value={formData.heroSubheadline}
              onChange={(e) => handleChange('heroSubheadline', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          {/* Announcement Notice Bar */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-medium text-slate-700">Public Announcement Notice</label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={formData.noticeEnabled}
                  onChange={(e) => handleChange('noticeEnabled', e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Active</span>
              </label>
            </div>
            <input
              type="text"
              value={formData.noticeText}
              onChange={(e) => handleChange('noticeText', e.target.value)}
              placeholder="e.g. Live tracking is active: Enter your Job Number..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-[11px]"
            />
          </div>
        </div>

        {/* Card 2: Proprietor, Story & Contacts */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
            2. Proprietor Profile & Direct Hotlines
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Proprietor Name</label>
              <input
                type="text"
                value={formData.proprietorName}
                onChange={(e) => handleChange('proprietorName', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                value={formData.proprietorTitle}
                onChange={(e) => handleChange('proprietorTitle', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Primary Hotline</label>
              <input
                type="text"
                value={formData.phonePrimary}
                onChange={(e) => handleChange('phonePrimary', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Secondary Phone</label>
              <input
                type="text"
                value={formData.phoneSecondary}
                onChange={(e) => handleChange('phoneSecondary', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">WhatsApp Number</label>
              <input
                type="text"
                value={formData.whatsappNumber}
                onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Workshop & Center Address</label>
            <textarea
              rows={2}
              value={formData.officeAddress}
              onChange={(e) => handleChange('officeAddress', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">About Company Story</label>
            <textarea
              rows={3}
              value={formData.aboutStory}
              onChange={(e) => handleChange('aboutStory', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>
        </div>

      </form>

    </div>
  );
};
