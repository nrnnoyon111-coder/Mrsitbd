import React, { useState } from 'react';
import { Search, Phone, MessageSquare, ArrowRight, ShieldCheck, Cpu, Wrench } from 'lucide-react';
import { HomepageCMS } from '../../types';

interface PublicHeroProps {
  cms: HomepageCMS;
  onTrack: (query: string) => void;
  onOpenHistory: () => void;
}

export const PublicHero: React.FC<PublicHeroProps> = ({
  cms,
  onTrack,
  onOpenHistory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onTrack(searchQuery.trim());
    }
  };

  const handleQuickChip = (code: string) => {
    setSearchQuery(code);
    onTrack(code);
  };

  return (
    <section className="relative overflow-hidden bg-slate-900 text-white">
      {/* Background Image with Measured Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={cms.heroImage || '/src/assets/images/hero_industrial_electronics_1791971360769.jpg'}
          alt="MRS Fast Solution Industrial Circuit Diagnostics Bay"
          className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity filter blur-[0.5px]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-900/60" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-24 lg:py-28">
        
        {/* Notice Banner */}
        {cms.noticeEnabled && cms.noticeText && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-medium mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0"></span>
            <span style={{ fontFamily: 'Times New Roman' }}>{cms.noticeText}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-bold tracking-widest uppercase text-blue-400 font-mono">
                {cms.tagline || 'Your Trusted Partner in Industrial World'}
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {cms.heroHeadline || 'Industrial Electronics Circuit Repairing & Parts Importer'}
              </h1>
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                {cms.heroSubheadline || 'Component-level diagnostic repairs for Hashima, Juki, Jack, Brother, and all major industrial garment & automation control boards.'}
              </p>
            </div>

            {/* Direct Contact Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={`tel:${cms.phonePrimary.replace(/[^0-9+]/g, '')}`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                Call: {cms.phonePrimary}
              </a>

              <a
                href={`https://wa.me/${cms.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello%20MRS%20Fast%20Solution,%20I%20need%20repair%20assistance%20for%20my%20industrial%20circuit%20board.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/30 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                WhatsApp Us
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>30-60 Days Official Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span>Original Imported IC & IGBT</span>
              </div>
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>11+ Years Technical Mastery</span>
              </div>
            </div>
          </div>

          {/* Right Column: Prominent Live Job Tracker Card */}
          <div className="lg:col-span-5">
            <div className="bg-white/95 backdrop-blur-md text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 font-mono">
                    24/7 Client Portal
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                    Live Job Tracker
                  </h3>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                  Fast Database
                </div>
              </div>

              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Enter your <strong>Job Number</strong> (e.g. M0001), <strong>Challan Number</strong>, or <strong>Mobile Number</strong> to check your current repair progress, board diagnostic notes, and warranty.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter Job # (e.g. M0001) or Challan"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-inner"
                  />
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>

                <button
                  type="submit"
                  disabled={!searchQuery.trim()}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Track Status Immediately</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Sample job quick chips */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Quick Test:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuickChip('M0001')}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-mono text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    M0001
                  </button>
                  <button
                    onClick={() => handleQuickChip('M0002')}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-mono text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    M0002
                  </button>
                  <button
                    onClick={() => handleQuickChip('M0004')}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-mono text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    M0004
                  </button>
                </div>
              </div>

              {/* Job History Alternative */}
              <div className="mt-4 text-center">
                <button
                  onClick={onOpenHistory}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium underline cursor-pointer"
                >
                  Looking for full job history for your company mobile number? Click here
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
