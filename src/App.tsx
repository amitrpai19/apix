/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ScraperStudio } from './components/ScraperStudio';
import { IndexLabView } from './components/IndexLabView';
import { ValidationView } from './components/ValidationView';
import { ApiAndRenderView } from './components/ApiAndRenderView';
import { 
  INITIAL_ROUTES, 
  INITIAL_TIME_SERIES, 
  INITIAL_ELASTICITY, 
  INITIAL_DECOMPOSITION 
} from './data/mockData';
import { RouteBasket, ApixTimeSeriesPoint, LeadWindowElasticity, FactorDecomposition } from './types/apix';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [routes, setRoutes] = useState<RouteBasket[]>(INITIAL_ROUTES);
  const [timeSeries, setTimeSeries] = useState<ApixTimeSeriesPoint[]>(INITIAL_TIME_SERIES);
  const [elasticity, setElasticity] = useState<LeadWindowElasticity[]>(INITIAL_ELASTICITY);
  const [decomposition, setDecomposition] = useState<FactorDecomposition>(INITIAL_DECOMPOSITION);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('DEL-BOM');

  // Compute headline APIx from routes and weights
  const headlineApix = routes.reduce((sum, r) => sum + (r.route_weight * (r.current_price / r.base_price_p0)), 0) * 100;

  // Handle route inspection from table
  const handleSelectRouteForScraper = (routeId: string) => {
    setSelectedRouteId(routeId);
    setActiveTab('scraper');
  };

  // Handle beta weights update from Econometric Lab
  const handleUpdateBetaWeights = (newBeta: Record<number, number>) => {
    // Recalculate each route composite price and elasticity
    const weightSum = Object.values(newBeta).reduce((a, b) => a + b, 0);
    const updatedRoutes = routes.map((r) => {
      const p1 = r.current_price * 1.48;
      const p7 = r.current_price * 1.22;
      const p15 = r.current_price * 1.00;
      const p30 = r.current_price * 0.88;
      const p45 = r.current_price * 0.82;

      const logComp = (
        (newBeta[1] ?? 0.15) * Math.log(p1) +
        (newBeta[7] ?? 0.30) * Math.log(p7) +
        (newBeta[15] ?? 0.30) * Math.log(p15) +
        (newBeta[30] ?? 0.15) * Math.log(p30) +
        (newBeta[45] ?? 0.10) * Math.log(p45)
      ) / (weightSum > 0 ? weightSum : 1.0);

      const newPrice = Math.round(Math.exp(logComp));
      const newApix = Number(((newPrice / r.base_price_p0) * 100).toFixed(2));
      return {
        ...r,
        current_price: newPrice,
        route_apix: newApix
      };
    });

    setRoutes(updatedRoutes);

    // Update elasticity display weights
    const updatedElasticity = elasticity.map((el) => ({
      ...el,
      empirical_weight_beta: newBeta[el.lead_days] ?? el.empirical_weight_beta
    }));
    setElasticity(updatedElasticity);
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Navigation Header */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        headlineApix={headlineApix} 
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            routes={routes}
            timeSeries={timeSeries}
            elasticity={elasticity}
            decomposition={decomposition}
            onSelectRouteForScraper={handleSelectRouteForScraper}
          />
        )}

        {activeTab === 'scraper' && (
          <ScraperStudio
            routes={routes}
            selectedRouteId={selectedRouteId}
            onSelectRoute={setSelectedRouteId}
          />
        )}

        {activeTab === 'indexlab' && (
          <IndexLabView
            routes={routes}
            elasticity={elasticity}
            onUpdateWeights={handleUpdateBetaWeights}
          />
        )}

        {activeTab === 'validation' && (
          <ValidationView
            timeSeries={timeSeries}
          />
        )}

        {activeTab === 'render-api' && (
          <ApiAndRenderView
            routes={routes}
            headlineApix={headlineApix}
          />
        )}
      </main>

      {/* Clean, Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">APIx-India Prototype</span>
            <span>•</span>
            <span>MoSPI Problem Statement ID #26056</span>
            <span>•</span>
            <span className="text-emerald-700 font-medium">Ready for Render + PostgreSQL</span>
          </div>
          <div className="text-slate-400">
            Jevons Geometric Mean & Laspeyres Formulation • IMF/ILO CPI Compliant
          </div>
        </div>
      </footer>
    </div>
  );
}
