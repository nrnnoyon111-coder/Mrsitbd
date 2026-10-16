import React from 'react';
import { MapPin, Phone, Mail, Award, CheckCircle2, Clock } from 'lucide-react';
import { HomepageCMS } from '../../types';

interface PublicAboutProps {
  cms: HomepageCMS;
}

export const PublicAbout: React.FC<PublicAboutProps> = ({ cms }) => {
  return (
    <section id="about" className="py-20 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Proprietor Profile Card */}
          <div className="lg:col-span-5">
            <div className="relative bg-slate-50 p-6 rounded-3xl border border-slate-200/80 shadow-md">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-200 mb-6 shadow-inner">
                <img
                  src="/src/assets/images/regenerated_image_1791974773522.jpg"
                  alt="Md. Rakibul Islam - Proprietor MRS Fast Solutions"
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl text-xs font-mono">
                  Since 2015 · 11+ Years
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-slate-900">
                  {cms.proprietorName || 'Md. Rakibul Islam'}
                </h3>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                  {cms.proprietorTitle || 'Proprietor & Chief Electronics Engineer'}
                </p>
                <p className="text-xs text-slate-500 pt-2 leading-relaxed">
                  Specialized in industrial electronics circuit diagnostics, direct drive servo motor control systems, and precision electronic component sourcing for Bangladesh's leading apparel factories.
                </p>
              </div>

              {/* Direct Contacts */}
              <div className="mt-5 pt-4 border-t border-slate-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-mono">{cms.phonePrimary} / {cms.phoneSecondary}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-mono">{cms.email}</span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{cms.officeAddress}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Company Story & Statistics */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 font-mono">
              About MRS Fast Solution
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              Your Trusted Partner in the Industrial Electronics World
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {cms.aboutStory || 'Founded in 2015, MRS Fast Solutions has grown into Bangladesh’s foremost technical facility for industrial electronic circuit diagnostics. We maintain component-level micro-soldering bays, genuine original IC/IGBT inventory, and rigorous bench testing protocols.'}
            </p>

            {/* Metric counters */}
            <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-100">
              <div className="space-y-0.5">
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
                  11+
                </div>
                <div className="text-xs text-slate-500 font-medium">Years in Business</div>
              </div>

              <div className="space-y-0.5">
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-blue-600">
                  3,850+
                </div>
                <div className="text-xs text-slate-500 font-medium">Boards Repaired</div>
              </div>

              <div className="space-y-0.5">
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600">
                  420+
                </div>
                <div className="text-xs text-slate-500 font-medium">Corporate Clients</div>
              </div>
            </div>

            {/* Bullet points */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-slate-700">
                  <strong>Direct importer of original Japanese & German semiconductors:</strong> Zero clone chips, guaranteed performance and thermal stability.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-slate-700">
                  <strong>Digital computerized job tracking:</strong> Monitor repair progress, technician diagnostic notes, and warranty validity online 24/7.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-slate-700">
                  <strong>Convenient location in Mirpur-13 Dhaka:</strong> Close proximity to Gazipur, Ashulia, Savar, and Narayanganj garment industrial belts.
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
