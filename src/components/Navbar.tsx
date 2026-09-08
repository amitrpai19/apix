import React from 'react';
import { Plane, Database, Cpu, Activity, Server, FileText, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  headlineApix: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, headlineApix }) => {
  const tabs = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: Activity },
    { id: 'scraper', label: 'Scraper & CDP Interceptor', icon: Cpu },
    { id: 'indexlab', label: 'Econometric Engine', icon: Plane },
    { id: 'validation', label: 'DGCA Audit & Back-test', icon: CheckCircle2 },
    { id: 'render-api', label: 'Render Deploy & MoSPI API', icon: Server },
  ];

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Context */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-sm">
              <Plane className="w-5 h-5 text-amber-400 -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-lg tracking-tight">APIx-India</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-800 border border-amber-200">
                  MoSPI PS #26056
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  FastAPI + Postgres Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Real-Time Airfare Price Index for Consumer Price Index (CPI) Augmentation
              </p>
            </div>
          </div>

          {/* Quick Index Ticker */}
          <div className="hidden lg:flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
                APIx Composite
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold text-slate-900">{headlineApix.toFixed(2)}</span>
                <span className="text-xs font-semibold text-emerald-600">+2.15% (WoW)</span>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
                Base Period
              </span>
              <span className="text-xs font-medium text-slate-700">2025_Q1 = 100</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
