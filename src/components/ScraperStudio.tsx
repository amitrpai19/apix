import React, { useState } from 'react';
import { 
  Play, 
  Terminal, 
  ShieldAlert, 
  Cpu, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Layers, 
  Eye, 
  Database,
  Radio
} from 'lucide-react';
import { RouteBasket, FareQuote, ScrapeConsoleLog } from '../types/apix';
import { SAMPLE_QUOTES } from '../data/mockData';

interface ScraperStudioProps {
  routes: RouteBasket[];
  selectedRouteId: string;
  onSelectRoute: (id: string) => void;
}

export const ScraperStudio: React.FC<ScraperStudioProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute
}) => {
  const [leadWindow, setLeadWindow] = useState<1 | 7 | 15 | 30 | 45>(7);
  const [simulateBlock, setSimulateBlock] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [quotes, setQuotes] = useState<FareQuote[]>(SAMPLE_QUOTES);
  const [logs, setLogs] = useState<ScrapeConsoleLog[]>([
    { id: '1', timestamp: '09:30:02', level: 'INFO', message: 'Ingestion orchestrator initialized with residential proxy pool (24 IPs).' },
    { id: '2', timestamp: '09:30:05', level: 'INFO', message: 'Target: DEL-BOM across advance booking buckets [T+1, T+7, T+15, T+30, T+45].' },
    { id: '3', timestamp: '09:30:08', level: 'SUCCESS', message: 'Ready. Select parameters and click "Run Ingestion Engine".' }
  ]);

  const runScrapeSimulation = () => {
    setIsRunning(true);
    setLogs((prev) => [
      ...prev,
      { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), level: 'INFO', message: `Starting harvest job for ${selectedRouteId} at T+${leadWindow}...` }
    ]);

    setTimeout(() => {
      if (simulateBlock) {
        setLogs((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), timestamp: new Date().toLocaleTimeString(), level: 'WARN', message: 'Standard HTTP request hit Cloudflare/Akamai challenge (HTTP 403 Forbidden).' },
          { id: (Date.now() + 2).toString(), timestamp: new Date().toLocaleTimeString(), level: 'CDP_ALERT', message: '⚡ Anti-Bot Triggered: Activating CDP (Chrome DevTools Protocol) Network Interception.' },
          { id: (Date.now() + 3).toString(), timestamp: new Date().toLocaleTimeString(), level: 'INFO', message: 'CDP Session attached: Enabled Network.enable & Page.addScriptToEvaluateOnNewDocument.' },
          { id: (Date.now() + 4).toString(), timestamp: new Date().toLocaleTimeString(), level: 'SUCCESS', message: 'Intercepted internal JSON response stream from /api/flights/search! Clean payloads captured.' }
        ]);

        // Generate quotes with CDP tag
        const cdpQuotes: FareQuote[] = [
          {
            quote_id: `cdp-${Date.now()}-1`,
            source_platform: 'CDP_Console_Sniffed_JSON',
            carrier: 'IndiGo',
            flight_number: '6E-5012',
            route_id: selectedRouteId,
            departure_time: '07:15 IST',
            lead_window_days: leadWindow,
            fare_class: 'Economy',
            base_fare: 4850,
            fuel_surcharge: 450,
            taxes_and_fees: 1092,
            total_fare: 6392,
            seats_remaining: 5,
            is_outlier: false,
            scraping_method: 'CDP_INTERCEPT',
            cdp_stream_id: 'CDP_NET_STREAM_01'
          },
          {
            quote_id: `cdp-${Date.now()}-2`,
            source_platform: 'CDP_Console_Sniffed_JSON',
            carrier: 'Air India',
            flight_number: 'AI-806',
            route_id: selectedRouteId,
            departure_time: '10:30 IST',
            lead_window_days: leadWindow,
            fare_class: 'Economy',
            base_fare: 5120,
            fuel_surcharge: 450,
            taxes_and_fees: 1106,
            total_fare: 6676,
            seats_remaining: 7,
            is_outlier: false,
            scraping_method: 'CDP_INTERCEPT',
            cdp_stream_id: 'CDP_NET_STREAM_02'
          },
          {
            quote_id: `cdp-${Date.now()}-3`,
            source_platform: 'CDP_Console_Sniffed_JSON',
            carrier: 'Akasa Air',
            flight_number: 'QP-1324',
            route_id: selectedRouteId,
            departure_time: '14:45 IST',
            lead_window_days: leadWindow,
            fare_class: 'Economy',
            base_fare: 4620,
            fuel_surcharge: 450,
            taxes_and_fees: 1081,
            total_fare: 6151,
            seats_remaining: 4,
            is_outlier: false,
            scraping_method: 'CDP_INTERCEPT',
            cdp_stream_id: 'CDP_NET_STREAM_03'
          },
          {
            quote_id: `cdp-${Date.now()}-4`,
            source_platform: 'CDP_Console_Sniffed_JSON',
            carrier: 'IndiGo (Flexi Anomaly)',
            flight_number: '6E-904',
            route_id: selectedRouteId,
            departure_time: '19:00 IST',
            lead_window_days: leadWindow,
            fare_class: 'Business/Flexi',
            base_fare: 23400,
            fuel_surcharge: 450,
            taxes_and_fees: 2200,
            total_fare: 26050,
            seats_remaining: 1,
            is_outlier: true,
            scraping_method: 'CDP_INTERCEPT',
            cdp_stream_id: 'CDP_NET_STREAM_04'
          }
        ];
        setQuotes(cdpQuotes);
      } else {
        setLogs((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), timestamp: new Date().toLocaleTimeString(), level: 'INFO', message: 'Selenium Stealth session active with randomized canvas fingerprint.' },
          { id: (Date.now() + 2).toString(), timestamp: new Date().toLocaleTimeString(), level: 'INFO', message: 'Dispatched requests to IndiGo, Air India, Akasa, and MakeMyTrip portals.' },
          { id: (Date.now() + 3).toString(), timestamp: new Date().toLocaleTimeString(), level: 'SUCCESS', message: `Parsed 5 flight fares. Disaggregated Base Fare, Fuel Surcharge, and Statutory Taxes.` }
        ]);

        const standardQuotes: FareQuote[] = [
          {
            quote_id: `sel-${Date.now()}-1`,
            source_platform: 'IndiGo_Direct',
            carrier: 'IndiGo',
            flight_number: '6E-2051',
            route_id: selectedRouteId,
            departure_time: '06:15 IST',
            lead_window_days: leadWindow,
            fare_class: 'Economy',
            base_fare: 5320,
            fuel_surcharge: 450,
            taxes_and_fees: 1116,
            total_fare: 6886,
            seats_remaining: 3,
            is_outlier: false,
            scraping_method: 'SELENIUM'
          },
          {
            quote_id: `sel-${Date.now()}-2`,
            source_platform: 'AirIndia_Direct',
            carrier: 'Air India',
            flight_number: 'AI-805',
            route_id: selectedRouteId,
            departure_time: '08:30 IST',
            lead_window_days: leadWindow,
            fare_class: 'Economy',
            base_fare: 5680,
            fuel_surcharge: 450,
            taxes_and_fees: 1134,
            total_fare: 7264,
            seats_remaining: 8,
            is_outlier: false,
            scraping_method: 'SELENIUM'
          },
          {
            quote_id: `sel-${Date.now()}-3`,
            source_platform: 'MakeMyTrip_OTA',
            carrier: 'SpiceJet',
            flight_number: 'SG-8169',
            route_id: selectedRouteId,
            departure_time: '14:20 IST',
            lead_window_days: leadWindow,
            fare_class: 'Economy',
            base_fare: 5080,
            fuel_surcharge: 450,
            taxes_and_fees: 1104,
            total_fare: 6634,
            seats_remaining: 2,
            is_outlier: false,
            scraping_method: 'SCRAPY'
          },
          {
            quote_id: `sel-${Date.now()}-4`,
            source_platform: 'IndiGo_Direct',
            carrier: 'IndiGo (Flexi/Biz)',
            flight_number: '6E-601',
            route_id: selectedRouteId,
            departure_time: '18:30 IST',
            lead_window_days: leadWindow,
            fare_class: 'Business/Flexi',
            base_fare: 22500,
            fuel_surcharge: 450,
            taxes_and_fees: 2125,
            total_fare: 25075,
            seats_remaining: 1,
            is_outlier: true,
            scraping_method: 'SELENIUM'
          }
        ];
        setQuotes(standardQuotes);
      }
      setIsRunning(false);
    }, 1200);
  };

  // Compute Jevons elementary geometric mean on non-outlier quotes
  const validQuotes = quotes.filter((q) => !q.is_outlier);
  const outlierQuotes = quotes.filter((q) => q.is_outlier);
  const jevonsPrice = validQuotes.length > 0
    ? Math.exp(validQuotes.reduce((acc, q) => acc + Math.log(q.total_fare), 0) / validQuotes.length)
    : 0;

  // Compare with simple arithmetic mean
  const arithmeticPrice = validQuotes.length > 0
    ? validQuotes.reduce((acc, q) => acc + q.total_fare, 0) / validQuotes.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header & Controls Panel */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Stage 2 & 3: Multi-Source Scraping + CDP Fallback
              </span>
              <span className="text-xs text-slate-500">FastAPI & Selenium / Scrapy / Playwright</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Web Scraping & Chrome DevTools Protocol (CDP) Console
            </h2>
            <p className="text-xs text-slate-500">
              Collects live airfares across 5 airlines and OTAs. Automatically engages CDP network sniffing when anti-bot firewalls trigger.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Target Route selector */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">Target Route</label>
              <select
                value={selectedRouteId}
                onChange={(e) => onSelectRoute(e.target.value)}
                className="text-xs font-semibold border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              >
                {routes.map((r) => (
                  <option key={r.route_id} value={r.route_id}>
                    {r.route_id} ({r.origin_city} ↔ {r.destination_city})
                  </option>
                ))}
              </select>
            </div>

            {/* Advance window selector */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">Advance Window</label>
              <select
                value={leadWindow}
                onChange={(e) => setLeadWindow(Number(e.target.value) as any)}
                className="text-xs font-semibold border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              >
                <option value={1}>T+1 (Last-minute urgent)</option>
                <option value={7}>T+7 (Peak short-term)</option>
                <option value={15}>T+15 (Optimal planned)</option>
                <option value={30}>T+30 (Vacation/early)</option>
                <option value={45}>T+45 (Deep advance)</option>
              </select>
            </div>

            {/* Anti-bot block toggle */}
            <div className="flex flex-col justify-end">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">Anti-Bot Simulation</span>
              <button
                type="button"
                onClick={() => setSimulateBlock(!simulateBlock)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
                  simulateBlock
                    ? 'bg-amber-500 text-slate-950 border-amber-600'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                {simulateBlock ? 'Simulate Block (Force CDP)' : 'Normal Scrape Mode'}
              </button>
            </div>

            {/* Execute Scrape Button */}
            <div className="flex flex-col justify-end">
              <span className="text-[11px] font-semibold text-transparent block mb-1">Action</span>
              <button
                onClick={runScrapeSimulation}
                disabled={isRunning}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors shadow-xs disabled:opacity-50"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    Harvesting...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    Execute Harvest
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal & Diagnostic Stream */}
      <div className="bg-slate-950 text-slate-200 rounded-xl p-4 border border-slate-800 font-mono text-xs shadow-inner">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-slate-400 text-[11px]">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-300">Live Ingestion & CDP Telemetry Log</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>Proxy Gateway: 103.21.244.x (Mumbai Residential)</span>
            </span>
            <span>CDP Port: 9222</span>
          </div>
        </div>

        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2.5">
              <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
              <span
                className={`font-semibold shrink-0 px-1 py-0.2 rounded text-[10px] ${
                  log.level === 'SUCCESS'
                    ? 'bg-emerald-950 text-emerald-400'
                    : log.level === 'WARN'
                    ? 'bg-amber-950 text-amber-400'
                    : log.level === 'CDP_ALERT'
                    ? 'bg-red-950 text-red-400 border border-red-800'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {log.level}
              </span>
              <span className={log.level === 'CDP_ALERT' ? 'text-amber-300 font-medium' : 'text-slate-300'}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Results: Fare Disaggregation Table & IQR Outlier Filter */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Extracted Quotes & Fare Disaggregation</h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {validQuotes.length} Valid Cleaned Quotes
              </span>
              {outlierQuotes.length > 0 && (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                  {outlierQuotes.length} IQR Outliers Discarded
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Strictly disaggregates Core Base Fare + Airline Fuel Surcharge from Non-airline statutory airport charges (UDF/ADF) & GST.
            </p>
          </div>

          {/* Elementary Aggregation Jevons Result */}
          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg flex items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Jevons Geometric Mean</span>
              <span className="text-base font-black text-slate-900">₹{Math.round(jevonsPrice).toLocaleString()}</span>
            </div>
            <div className="w-px h-7 bg-slate-200"></div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Arithmetic Mean</span>
              <span className="text-sm font-semibold text-slate-500 line-through">₹{Math.round(arithmeticPrice).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Carrier / Flight</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Dep Time</th>
                <th className="py-2.5 px-3">Base Fare (Core)</th>
                <th className="py-2.5 px-3">Fuel Surcharge</th>
                <th className="py-2.5 px-3">Taxes & UDF</th>
                <th className="py-2.5 px-3">Total Ticket</th>
                <th className="py-2.5 px-3">IQR Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {quotes.map((q) => (
                <tr key={q.quote_id} className={q.is_outlier ? 'bg-red-50/40 text-slate-400' : 'hover:bg-slate-50'}>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-900">{q.flight_number}</div>
                    <div className="text-[10px] text-slate-500">{q.carrier} • {q.fare_class}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      q.scraping_method === 'CDP_INTERCEPT'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {q.scraping_method === 'CDP_INTERCEPT' ? 'CDP Stream' : q.scraping_method}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{q.departure_time}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">₹{q.base_fare.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-slate-600">₹{q.fuel_surcharge}</td>
                  <td className="py-2.5 px-3 text-slate-600">₹{q.taxes_and_fees.toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">₹{q.total_fare.toLocaleString()}</td>
                  <td className="py-2.5 px-3">
                    {q.is_outlier ? (
                      <span className="inline-flex items-center gap-1 text-red-600 bg-red-100 px-2 py-0.5 rounded text-[10px] font-bold">
                        <AlertTriangle className="w-3 h-3" /> Flagged Outlier
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold">
                        <CheckCircle className="w-3 h-3" /> Accepted (Jevons)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Explainability Callout */}
        <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-bold text-slate-800 block mb-1">Stage 3 IQR Filter Logic:</span>
            <p className="text-[11px] leading-relaxed">
              Quotes are grouped by route and lead window stratum. Fares outside <code className="font-mono bg-slate-200 px-1 py-0.2 rounded">[Q1 - 1.5×IQR, Q3 + 1.5×IQR]</code> (such as last-seat business class fares mistakenly returned as economy) are systematically discarded.
            </p>
          </div>
          <div>
            <span className="font-bold text-slate-800 block mb-1">Why CDP Fallback Matters for MoSPI:</span>
            <p className="text-[11px] leading-relaxed">
              When airlines deploy Cloudflare Turnstile or Akamai bot protection, standard static scrapers fail. Chrome DevTools Protocol (CDP) taps directly into the browser's internal network stream, reading the native JSON payload that the airline frontend consumes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
