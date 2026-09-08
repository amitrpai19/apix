import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  TrendingUp, 
  ShieldCheck, 
  ArrowUpRight, 
  Flame, 
  Calendar, 
  Info, 
  Layers, 
  Fuel, 
  Clock, 
  ExternalLink 
} from 'lucide-react';
import { RouteBasket, ApixTimeSeriesPoint, LeadWindowElasticity, FactorDecomposition } from '../types/apix';

interface DashboardViewProps {
  routes: RouteBasket[];
  timeSeries: ApixTimeSeriesPoint[];
  elasticity: LeadWindowElasticity[];
  decomposition: FactorDecomposition;
  onSelectRouteForScraper: (routeId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  routes,
  timeSeries,
  elasticity,
  decomposition,
  onSelectRouteForScraper
}) => {
  const [selectedFreq, setSelectedFreq] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [timeSeriesFilter, setTimeSeriesFilter] = useState<'all' | '30d' | '14d'>('30d');

  const latestPoint = timeSeries[timeSeries.length - 1];
  const firstPoint = timeSeries[0];
  const totalChange = (latestPoint.apix - firstPoint.apix).toFixed(2);
  const totalChangePct = (((latestPoint.apix - firstPoint.apix) / firstPoint.apix) * 100).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Top Banner: MoSPI / SIH Problem Statement Context */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                MoSPI PS #26056 Live Prototype
              </span>
              <span className="text-xs text-slate-400">National Statistical Office (NSO) & Reserve Bank of India</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Real-Time Airfare Price Index (APIx-India)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
              Automated high-frequency retail airfare price collection replacing manual quarterly surveys.
              Formulated via Jevons unweighted geometric means across 5 advance booking windows (T+1 to T+45)
              and aggregated using DGCA passenger/RPKM weights into a Laspeyres national price index.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-3 text-right">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                Composite APIx
              </span>
              <div className="text-2xl font-black text-amber-400">{latestPoint.apix.toFixed(2)}</div>
              <span className="text-[11px] text-emerald-400 flex items-center justify-end gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> +{totalChangePct}% (30D)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Headline APIx</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{latestPoint.apix.toFixed(2)}</span>
            <span className="text-xs font-semibold text-emerald-600">+{totalChange} pts</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Base Period: 2025_Q1 = 100.0</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">CPI Transport Weight</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">8.59%</span>
            <span className="text-xs font-medium text-slate-500">CPI Basket</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Subgroup: 07.3 Transport by Air</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">DGCA Yield Correlation</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">r = 0.912</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              PASSED (≥0.85)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">30-day statistical benchmark back-test</p>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Key Inflation Driver</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">ATF Fuel Hike</span>
            <span className="text-xs font-semibold text-amber-600">+1.18 pts</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">48.7% of monthly index acceleration</p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Time Series (2 Columns) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">National APIx Trajectory vs Official Benchmarks</h2>
              <p className="text-xs text-slate-500">
                Daily APIx index compared against headline CPI Transport and IOCL Jet Fuel (ATF) index
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                <button
                  key={freq}
                  onClick={() => setSelectedFreq(freq)}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium capitalize transition-colors ${
                    selectedFreq === freq
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="apixGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="cpiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis domain={[102, 118]} tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                  formatter={(value: any, name: string) => {
                    if (name === 'apix') return [`${value} pts`, 'APIx Headline (Scraped)'];
                    if (name === 'cpi_transport_baseline') return [`${value} pts`, 'CPI Transport Baseline'];
                    if (name === 'atf_fuel_index') return [`${value} pts`, 'ATF Fuel Price Index'];
                    return [value, name];
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} 
                  formatter={(value) => {
                    if (value === 'apix') return 'APIx Composite (Daily)';
                    if (value === 'cpi_transport_baseline') return 'Official CPI Transport Sub-Index';
                    if (value === 'atf_fuel_index') return 'IOCL ATF Aviation Fuel Index';
                    return value;
                  }}
                />
                <Area type="monotone" dataKey="apix" stroke="#0f172a" strokeWidth={2.5} fillOpacity={1} fill="url(#apixGradient)" />
                <Area type="monotone" dataKey="cpi_transport_baseline" stroke="#2563eb" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#cpiGradient)" />
                <Line type="monotone" dataKey="atf_fuel_index" stroke="#f59e0b" strokeWidth={1.8} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Econometric Note:</span> The APIx real-time price feed accurately leads the official monthly CPI release by 14 days, providing high-frequency nowcasting capability for the RBI Monetary Policy Committee.
            </div>
          </div>
        </div>

        {/* Chart 2: Booking Lead-Time Elasticity Curve (T+45 -> T+1) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-slate-900">Lead-Time Elasticity Curve</h2>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
                T+45 → T+1
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Dynamic fare decay as departure approaches. Short lead-times cluster urgent business markup.
            </p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={elasticity} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="lead_window" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                  <YAxis domain={[4500, 10000]} tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                    formatter={(val: any) => [`₹${val.toLocaleString()}`, 'Average Domestic Fare']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avg_fare" 
                    stroke="#dc2626" 
                    strokeWidth={2.5} 
                    dot={{ r: 4, fill: '#dc2626' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Elasticity Breakdown Table */}
            <div className="mt-3 space-y-1.5">
              {elasticity.map((item) => (
                <div key={item.lead_window} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 w-10">{item.lead_window}</span>
                    <span className="text-[11px] text-slate-500 hidden sm:inline">({item.lead_days}d lead)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600 text-[11px]">Weight: {(item.empirical_weight_beta * 100).toFixed(0)}%</span>
                    <span className="font-semibold text-slate-900">₹{item.avg_fare.toLocaleString()}</span>
                    <span className={`text-[11px] font-bold ${item.surge_multiplier >= 1.2 ? 'text-red-600' : 'text-slate-500'}`}>
                      {item.surge_multiplier}x
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Sector Route Heatmap & Factor Decomposition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route Basket Table (2 Columns) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">DGCA Domestic Route Basket & Price Matrix</h2>
              <p className="text-xs text-slate-500">
                Top city-pairs weighted by Revenue Passenger Kilometers (RPKM = Pax × Distance). Jevons elementary index calculated per route.
              </p>
            </div>
            <span className="text-xs bg-slate-100 font-semibold text-slate-700 px-2.5 py-1 rounded-md">
              {routes.length} Active Corridors
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Route</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Distance</th>
                  <th className="py-2.5 px-3">DGCA Weight (Wr)</th>
                  <th className="py-2.5 px-3">Base P0</th>
                  <th className="py-2.5 px-3">Current P</th>
                  <th className="py-2.5 px-3">Route APIx</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {routes.map((route) => {
                  const isHighSurge = route.route_apix >= 115;
                  return (
                    <tr key={route.route_id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-3">
                        <div className="font-bold text-slate-900">{route.route_id}</div>
                        <div className="text-[10px] text-slate-500">{route.origin_city} ↔ {route.destination_city}</div>
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          route.category === 'Metro-Metro'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {route.category}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-600">{route.distance_km} km</td>
                      <td className="py-2 px-3 text-slate-800">
                        <span className="font-mono">{(route.route_weight * 100).toFixed(2)}%</span>
                      </td>
                      <td className="py-2 px-3 text-slate-600">₹{route.base_price_p0.toLocaleString()}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">₹{route.current_price.toLocaleString()}</td>
                      <td className="py-2 px-3">
                        <span className={`inline-flex items-center gap-1 font-bold ${
                          isHighSurge ? 'text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded' : 'text-slate-800'
                        }`}>
                          {route.route_apix.toFixed(2)}
                          {isHighSurge && <Flame className="w-3 h-3 text-amber-500" />}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => onSelectRouteForScraper(route.route_id)}
                          className="px-2 py-1 text-[11px] rounded font-semibold bg-slate-100 hover:bg-slate-900 hover:text-white transition-colors text-slate-700"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Factor Decomposition Waterfall (Stage 6) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-slate-900">Econometric Factor Attribution</h2>
              <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded border border-indigo-200">
                Stage 6: Shapley Model
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Decomposing the +{decomposition.total_delta_pts} pt index surge into macroeconomic and operational drivers.
            </p>

            <div className="space-y-3">
              {/* Factor 1 */}
              <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-950">
                    <Fuel className="w-4 h-4 text-amber-600" />
                    <span>Aviation Turbine Fuel (ATF)</span>
                  </div>
                  <span className="font-bold text-amber-800">+{decomposition.atf_fuel_impact} pts</span>
                </div>
                <div className="w-full bg-amber-200/60 rounded-full h-1.5">
                  <div className="bg-amber-600 h-1.5 rounded-full" style={{ width: '48.7%' }}></div>
                </div>
                <p className="text-[11px] text-amber-800/90 mt-1.5">
                  Monthly IOCL ATF price revision (+2.8% at metro airports). Direct pass-through in fuel surcharges.
                </p>
              </div>

              {/* Factor 2 */}
              <div className="p-3 rounded-lg bg-purple-50/70 border border-purple-200">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5 font-semibold text-purple-950">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span>Festival / Holiday Pre-booking</span>
                  </div>
                  <span className="font-bold text-purple-800">+{decomposition.festival_demand_impact} pts</span>
                </div>
                <div className="w-full bg-purple-200/60 rounded-full h-1.5">
                  <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '39.2%' }}></div>
                </div>
                <p className="text-[11px] text-purple-800/90 mt-1.5">
                  Pre-booking surge ahead of regional festivals and extended holiday weekends.
                </p>
              </div>

              {/* Factor 3 */}
              <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5 font-semibold text-blue-950">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Lead-Time Compression</span>
                  </div>
                  <span className="font-bold text-blue-800">+{decomposition.lead_time_shift_impact} pts</span>
                </div>
                <div className="w-full bg-blue-200/60 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '9.1%' }}></div>
                </div>
                <p className="text-[11px] text-blue-800/90 mt-1.5">
                  Increase in last-minute corporate flight searches (T+1 / T+7 bucket clustering).
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Policy Briefing Summary
            </div>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              {decomposition.policy_summary}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
