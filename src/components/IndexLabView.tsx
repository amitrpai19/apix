import React, { useState } from 'react';
import { 
  Calculator, 
  Layers, 
  Sliders, 
  ArrowRight, 
  Check, 
  Sparkles, 
  Scale, 
  BookOpen, 
  RefreshCw 
} from 'lucide-react';
import { RouteBasket, LeadWindowElasticity } from '../types/apix';

interface IndexLabViewProps {
  routes: RouteBasket[];
  elasticity: LeadWindowElasticity[];
  onUpdateWeights: (newBeta: Record<number, number>) => void;
}

export const IndexLabView: React.FC<IndexLabViewProps> = ({
  routes,
  elasticity,
  onUpdateWeights
}) => {
  // Booking window empirical weights (must sum to 1.0)
  const [weights, setWeights] = useState<Record<number, number>>({
    1: 0.15,
    7: 0.30,
    15: 0.30,
    30: 0.15,
    45: 0.10
  });

  const [selectedRouteId, setSelectedRouteId] = useState<string>('DEL-BOM');
  const selectedRoute = routes.find((r) => r.route_id === selectedRouteId) || routes[0];

  // Representative prices per lead window for selected route
  const windowPrices: Record<number, number> = {
    1: Math.round(selectedRoute.current_price * 1.48),
    7: Math.round(selectedRoute.current_price * 1.22),
    15: Math.round(selectedRoute.current_price * 1.00),
    30: Math.round(selectedRoute.current_price * 0.88),
    45: Math.round(selectedRoute.current_price * 0.82),
  };

  const handleWeightChange = (bucket: number, val: number) => {
    const updated = { ...weights, [bucket]: val };
    setWeights(updated);
    onUpdateWeights(updated);
  };

  const resetWeights = () => {
    const defaults = { 1: 0.15, 7: 0.30, 15: 0.30, 30: 0.15, 45: 0.10 };
    setWeights(defaults);
    onUpdateWeights(defaults);
  };

  const weightSum: number = (Object.values(weights) as number[]).reduce((a: number, b: number) => a + b, 0);

  // Compute composite route price: prod (P_tau ^ beta_tau)
  const logComposite: number = Object.entries(weights).reduce((acc: number, [tau, w]) => {
    const p = windowPrices[Number(tau)] || selectedRoute.current_price;
    const weightNum = Number(w);
    return acc + weightNum * Math.log(p);
  }, 0);
  const normalizedLog: number = weightSum > 0 ? logComposite / weightSum : 0;
  const computedCompositePrice: number = Math.round(Math.exp(normalizedLog));

  // Laspeyres route sub-index
  const computedRouteApix = ((computedCompositePrice / selectedRoute.base_price_p0) * 100).toFixed(2);

  // National Laspeyres index recomputed with updated composite prices
  const totalNationalApix = routes.reduce((sum, r) => {
    const routePrice = r.route_id === selectedRoute.route_id ? computedCompositePrice : r.current_price;
    const ratio = routePrice / r.base_price_p0;
    return sum + (r.route_weight * ratio);
  }, 0) * 100;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                Stage 1 & 5: Econometric Index Engine
              </span>
              <span className="text-xs text-slate-500">IMF / ILO Consumer Price Index Manual & MoSPI Standards</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Econometric Formulation & Dynamic Weights Lab
            </h2>
            <p className="text-xs text-slate-500">
              Interactive sandbox demonstrating the 3-tier hierarchical index: Elementary Jevons Geometric Mean → Booking Curve Decay Aggregation → Upper-Level Laspeyres Basket.
            </p>
          </div>

          <button
            onClick={resetWeights}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset DGCA Baseline Weights
          </button>
        </div>
      </div>

      {/* Tier 1 & 2 Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1 & 2: Advance Purchase Decay Weighting */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-600" />
                Step 2: Advance-Purchase Window Aggregation
              </h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                Math.abs(weightSum - 1.0) < 0.01
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                Σβ = {weightSum.toFixed(2)} {Math.abs(weightSum - 1.0) < 0.01 ? '(Normalized)' : '(Adjust)'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Consumers buy flights across varied lead times. We apply empirical weights <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">β_τ</code> reflecting DGCA travel clustering.
            </p>

            {/* Route selector for calculation */}
            <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Route Under Calibration
              </label>
              <select
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(e.target.value)}
                className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2 bg-white text-slate-900"
              >
                {routes.map((r) => (
                  <option key={r.route_id} value={r.route_id}>
                    {r.route_id} ({r.origin_city} ↔ {r.destination_city}) — Base P0: ₹{r.base_price_p0}
                  </option>
                ))}
              </select>
            </div>

            {/* Sliders */}
            <div className="space-y-3">
              {[
                { tau: 1, label: 'T+1 (Urgent / Emergency)', desc: 'Corporate last-minute bookings' },
                { tau: 7, label: 'T+7 (Peak Short-Term)', desc: 'High-frequency domestic cluster' },
                { tau: 15, label: 'T+15 (Planned Window)', desc: 'Median domestic booking curve peak' },
                { tau: 30, label: 'T+30 (Early Vacation)', desc: 'Holiday & personal family travel' },
                { tau: 45, label: 'T+45 (Deep Advance)', desc: 'Festival & deep advance leisure' },
              ].map(({ tau, label, desc }) => {
                const currentW = weights[tau] ?? 0.1;
                const price = windowPrices[tau];
                return (
                  <div key={tau} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div>
                        <span className="font-bold text-slate-900">{label}</span>
                        <span className="text-[10px] text-slate-500 ml-2">({desc})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-600 font-mono text-[11px]">₹{price.toLocaleString()}</span>
                        <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          {(currentW * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="0.60"
                      step="0.05"
                      value={currentW}
                      onChange={(e) => handleWeightChange(tau, parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Outcome Card */}
          <div className="mt-4 p-3 rounded-lg bg-purple-50 border border-purple-200 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-purple-900 uppercase tracking-wider block">
                  Computed Weighted Route Price (P̄_r)
                </span>
                <span className="text-xl font-black text-purple-950">₹{computedCompositePrice.toLocaleString()}</span>
                <span className="text-[11px] text-purple-700 block">Baseline P0: ₹{selectedRoute.base_price_p0}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-purple-900 uppercase tracking-wider block">
                  Route APIx Sub-Index
                </span>
                <span className="text-xl font-black text-purple-950">{computedRouteApix}</span>
                <span className="text-[11px] text-emerald-700 font-bold block">+{(Number(computedRouteApix) - 100).toFixed(2)}% vs Base</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Upper-Level Laspeyres Aggregation with DGCA Weights */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-blue-600" />
                Step 3: Modified Laspeyres Aggregation
              </h3>
              <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded border border-blue-200">
                DGCA RPKM Shares
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Weights each route using DGCA city-pair domestic passenger statistics: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">RPKM = Pax × Distance (km)</code>.
            </p>

            {/* National APIx Headline Calculation Box */}
            <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                    Composite National APIx
                  </span>
                  <div className="text-3xl font-black text-amber-400">{totalNationalApix.toFixed(2)}</div>
                  <span className="text-xs text-slate-300">
                    Formulation: <code className="text-amber-300">Σ Wr × (P̄_r / P0_r) × 100</code>
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800">
                    +{(totalNationalApix - 100).toFixed(2)} pts
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-1">Inflation since Base Period</span>
                </div>
              </div>
            </div>

            {/* Route weighting breakdown */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {routes.map((r) => {
                const isSelected = r.route_id === selectedRoute.route_id;
                const price = isSelected ? computedCompositePrice : r.current_price;
                const routeRatio = (price / r.base_price_p0) * 100;
                return (
                  <div
                    key={r.route_id}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs border ${
                      isSelected
                        ? 'bg-amber-50 border-amber-300 text-slate-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span>{r.route_id}</span>
                        {isSelected && <span className="text-[10px] bg-amber-200 text-amber-900 px-1 py-0.2 rounded font-semibold">Active Edit</span>}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Pax: {(r.monthly_pax_volume / 1000).toFixed(0)}k • {r.distance_km} km
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-900">
                        Weight Wr: <span className="font-mono">{(r.route_weight * 100).toFixed(2)}%</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Price: ₹{price.toLocaleString()} • Index: {routeRatio.toFixed(1)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Elementary Formula: Jevons Geometric Mean (No substitution bias)</span>
            <span className="font-bold text-slate-700">MoSPI CPI Code: 07.3.3.1</span>
          </div>
        </div>
      </div>

      {/* Formula Reference Card */}
      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs text-slate-700">
        <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-slate-700" />
          Statistical Architecture Highlights (Problem Statement ID 26056)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">1. Elementary Jevons Index</span>
            <p className="text-[11px] leading-relaxed text-slate-600">
              Unlike arithmetic averages (Dutot or Carli) which skew upward due to expensive single seats, the Jevons geometric mean handles unobserved ticket quantities with unit price elasticity assumption.
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">2. Frequency & Gauge Weighting</span>
            <p className="text-[11px] leading-relaxed text-slate-600">
              Route weights explicitly account for both passenger volume and flight operations frequency (<code className="font-mono bg-slate-100 px-1 py-0.2 rounded">Fr × Sr × PLFr × dr</code>), avoiding over-weighting small regional planes.
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">3. Monthly CPI Chain-Linking</span>
            <p className="text-[11px] leading-relaxed text-slate-600">
              Annual chain-linking (splicing) accommodates DGCA fleet expansions and new airport openings without introducing artificial price jumps into MoSPI's headline series.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
