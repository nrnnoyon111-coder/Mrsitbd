import React from 'react';
import { Cpu, Wrench, ShieldCheck, Zap, Cog, Truck } from 'lucide-react';

export const PublicServices: React.FC = () => {
  const serviceCards = [
    {
      title: 'Industrial Circuit Board Diagnostic & Repair',
      desc: 'Advanced component-level diagnostics for sewing, fusing, embroidery and automation machines. In-house oscilloscope waveform analysis and micro-soldering.',
      brandList: 'Hashima, Juki, Jack, Brother, Pegasus, Kansai, Siruba',
      img: '/src/assets/images/service_circuit_repair_1791971423847.jpg',
      icon: Cpu,
    },
    {
      title: 'Genuine Electronic Parts Import & Distribution',
      desc: 'Direct importer of hard-to-find industrial semiconductors: high-power IGBT modules, intelligent power modules (IPM), optocouplers, servo encoders, and electrolytic capacitors.',
      brandList: 'Fuji Electric, Mitsubishi, Toshiba, Omron, Infineon',
      img: '/src/assets/images/service_parts_warehouse_1791971452326.jpg',
      icon: Wrench,
    },
    {
      title: 'Servo Motor Drivers & VFD Inverters Overhaul',
      desc: 'Complete refurbishing and parameter calibration for variable frequency drives, AC servo motors, encoder alignment, and high-torque direct drive controllers.',
      brandList: 'Delta, Schneider, Yaskawa, Inovance, Panasonic',
      img: '/src/assets/images/hero_industrial_electronics_1791971360769.jpg',
      icon: Zap,
    },
  ];

  return (
    <section id="services" className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 font-mono">
            Technical Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
            Engineering Precision for Bangladesh’s Garment Industry
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
            From emergency board repairs to genuine factory-grade electronics supply, MRS Fast Solution delivers rapid turnaround to eliminate industrial production downtime.
          </p>
        </div>

        {/* 3 Featured Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {serviceCards.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={service.img}
                    alt={service.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 p-2 rounded-xl bg-white/90 backdrop-blur-sm shadow-sm text-blue-600">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-900 text-lg leading-snug">
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {service.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500">
                    <strong className="text-slate-700">Supported Brands:</strong> {service.brandList}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Why Choose Us 4-Pillar Grid */}
        <div className="mt-16 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                01
              </div>
              <h4 className="font-bold text-slate-900 text-sm">24-48h Emergency Turnaround</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Prioritized diagnostic lanes for critical garment sewing line breakdowns.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                02
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Component-Level Repairs</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                We replace isolated damaged ICs/MOSFETs, saving 80% over buying new OEM control boxes.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                03
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Rigorous Bench Load Testing</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every board runs through high-load simulated testing before final handover to client.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                04
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Guaranteed Service Warranty</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Official 30 to 60 days warranty coverage backed by automated computerized records.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
