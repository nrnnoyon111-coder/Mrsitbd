import React from 'react';
import { MrsLogo } from '../MrsLogo';
import { Phone, Mail, MapPin, Clock, ExternalLink } from 'lucide-react';
import { HomepageCMS } from '../../types';

interface PublicFooterProps {
  cms: HomepageCMS;
  onOpenTracker: () => void;
  onOpenHistory: () => void;
  onOpenAdminLogin: () => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({
  cms,
  onOpenTracker,
  onOpenHistory,
  onOpenAdminLogin,
}) => {
  return (
    <footer id="contact" className="bg-slate-950 text-slate-400 text-xs border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <MrsLogo variant="full" size="md" />
            <p className="text-slate-400 text-xs leading-relaxed">
              Leading industrial electronics engineering & circuit board repair facility in Bangladesh. Importer & supplier of genuine industrial electronics parts since 2015.
            </p>
            <div className="text-[11px] font-mono text-slate-500">
              Proprietor: <strong className="text-slate-300">{cms.proprietorName}</strong>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] font-mono">
              Client Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onOpenTracker}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Live Job Status Tracker
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenHistory}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Customer Job History by Phone
                </button>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  Circuit Diagnostic Services
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  About MRS Fast Solutions
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenAdminLogin}
                  className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer text-left font-semibold"
                >
                  Staff & Admin Portal Login →
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Workshop Address */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] font-mono">
              Workshop & Sales Center
            </h4>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed text-slate-300">
                  {cms.officeAddress}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="text-slate-300">{cms.workingHours}</span>
              </div>
              {cms.googleMapUrl && (
                <a
                  href={cms.googleMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-400 hover:underline pt-1"
                >
                  <span>View on Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Col 4: Hotlines & WhatsApp */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] font-mono">
              Immediate Assistance
            </h4>
            <div className="space-y-2.5">
              <div>
                <div className="text-[10px] text-slate-500">Service Hotline:</div>
                <div className="font-mono font-bold text-white text-sm">
                  {cms.phonePrimary}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-500">Secondary Phone:</div>
                <div className="font-mono text-slate-300">
                  {cms.phoneSecondary}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-500">Email:</div>
                <div className="font-mono text-slate-300">
                  {cms.email}
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`https://wa.me/${cms.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 font-semibold transition-colors"
                >
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} MRS FAST SOLUTIONS. All rights reserved. Mirpur, Dhaka, Bangladesh.
          </div>
          <div className="flex items-center gap-4">
            <span>Powered by MRS Cloud Sync & Fast Database Engine</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
