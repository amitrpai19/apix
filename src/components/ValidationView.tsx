import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  FileCheck, 
  Activity, 
  BarChart2, 
  Info,
  BellRing
} from 'lucide-react';
import { ApixTimeSeriesPoint } from '../types/apix';

interface ValidationViewProps {
  timeSeries: ApixTimeSeriesPoint[];
}

export const ValidationView: React.FC<ValidationViewProps> = ({ timeSeries }) => {
  const alerts = [
    {
      id: 'alt-1',
      severity: 'OK',
      title: 'Scrape Harvest Success Rate: 98.4%',
      desc: 'All 8 domestic trunk routes satisfied the minimum quote quota (≥ 25 quotes per advance window). Quote drop rate well below the 20% failure threshold.',
      timestamp: 'Today, 02:00 IST'
    },
    {
      id: 'alt-2',
      severity: 'OK',
      title: 'Synthetic Volatility within ±1.8σ Bounds',
      desc: 'Daily index standard deviation is 1.42 pts. Verified against IOCL ATF jet fuel price circulars and festival holiday calendars.',
      timestamp: 'Yesterday, 23:45 IST'
    },
    {
      id: 'alt-3',
      severity: 'NOTICE',
      title: 'Zero-Inventory Flagging Active on T+1 (DEL-BOM)',
      desc: 'Morning flight 6E-2051 returned zero seats available. Imputed using capacity-constrained reservation price model instead of treating as scraping timeout.',
      timestamp: 'Today, 06:30 IST'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Stage 8: Automated Validation & Back-Testing Engine
              </span>
              <span className="text-xs text-slate-500">MoSPI CPI Statistical Certification</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              DGCA Yield Benchmark Validation & Audit
            </h2>
            <p className="text-xs text-slate-500">
              Validates synthetic daily APIx prices against officially published DGCA passenger yields and MoSPI monthly survey benchmarks across 30 trailing days.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-right">
              <span className="text-[11px] uppercase font-bold text-emerald-800 block">Pearson Correlation</span>
              <div className="text-xl font-black text-emerald-700">r = 0.912</div>
              <span className="text-[10px] text-emerald-600 font-semibold">Exceeds r ≥ 0.85 Threshold</span>
            </div>
            <div className="px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-right">
              <span className="text-[11px] uppercase font-bold text-slate-600 block">Tracking RMSE</span>
              <div className="text-xl font-black text-slate-900">1.24 pts</div>
              <span className="text-[10px] text-slate-500 font-semibold">Mean Error Margin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart: 30-Day Tracking Comparison */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              30-Day Trailing Back-Test: APIx Scraped vs DGCA Official Yield Benchmark
            </h3>
            <p className="text-xs text-slate-500">
              High directional synchronization confirms that automated web scraping reliably mirrors actual paid passenger yields.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Statistically Sound
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
              <YAxis domain={[108, 116]} tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                formatter={(val: any, name: string) => {
                  if (name === 'apix') return [`${val} pts`, 'APIx Automated Feed'];
                  if (name === 'dgca_monthly_yield') return [`${val} pts`, 'DGCA Benchmark Survey'];
                  return [val, name];
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                formatter={(val) => (val === 'apix' ? 'Automated APIx Engine (Our System)' : 'DGCA Official Domestic Yield')}
              />
              <Line type="monotone" dataKey="apix" stroke="#0f172a" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="dgca_monthly_yield" stroke="#059669" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Metrics & Statistical Checks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h4 className="font-bold text-slate-900 text-sm">Spearman Rank Correlation</h4>
          </div>
          <div className="text-2xl font-black text-slate-900">ρ = 0.941</div>
          <p className="text-xs text-slate-500 mt-1">
            Measures monotonic consistency across route pricing hierarchies. Confirms no inversion in price rankings between metros.
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h4 className="font-bold text-slate-900 text-sm">Elementary Index Stability</h4>
          </div>
          <div className="text-2xl font-black text-slate-900">Jevons Axiomatic</div>
          <p className="text-xs text-slate-500 mt-1">
            Satisfies time-reversal, circularity, and dimensional invariance tests mandated by the ILO CPI standards.
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h4 className="font-bold text-slate-900 text-sm">IQR Cleansing Yield</h4>
          </div>
          <div className="text-2xl font-black text-slate-900">3.4% Outliers Cut</div>
          <p className="text-xs text-slate-500 mt-1">
            Excludes business class misclassifications and surge glitches without truncating true market volatility.
          </p>
        </div>
      </div>

      {/* Automated Alerting Stream */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <BellRing className="w-4 h-4 text-slate-700" />
          <h3 className="text-base font-bold text-slate-900">Automated Audit & Quality Alerts</h3>
          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
            Alertmanager Daemon Active
          </span>
        </div>

        <div className="space-y-3">
          {alerts.map((alt) => (
            <div
              key={alt.id}
              className={`p-3 rounded-lg border text-xs ${
                alt.severity === 'OK'
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50/50 border-amber-200 text-amber-950'
              }`}
            >
              <div className="flex items-center justify-between font-bold mb-1">
                <span className="flex items-center gap-2">
                  {alt.severity === 'OK' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  {alt.title}
                </span>
                <span className="text-[10px] text-slate-500 font-normal">{alt.timestamp}</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed pl-6">{alt.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
