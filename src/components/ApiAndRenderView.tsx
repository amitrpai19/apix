import React, { useState } from 'react';
import { 
  Server, 
  Database, 
  Code, 
  Download, 
  Copy, 
  Check, 
  Send, 
  FileSpreadsheet, 
  FileCode, 
  ExternalLink, 
  Terminal, 
  Layers 
} from 'lucide-react';
import { RouteBasket } from '../types/apix';

interface ApiAndRenderViewProps {
  routes: RouteBasket[];
  headlineApix: number;
}

export const ApiAndRenderView: React.FC<ApiAndRenderViewProps> = ({ routes, headlineApix }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('headline');
  const [apiResponse, setApiResponse] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeCodeFile, setActiveCodeFile] = useState<'render_yaml' | 'main_py' | 'schema_sql' | 'cdp_py' | 'selenium_py'>('render_yaml');

  // Copy helper
  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Test API endpoint live
  const handleTestApi = (endpoint: string) => {
    setSelectedEndpoint(endpoint);
    if (endpoint === 'headline') {
      setApiResponse(JSON.stringify({
        index_name: "APIx_National_Composite",
        base_period: "2025_Q1=100",
        frequency: "daily",
        current_index: headlineApix,
        previous_day_index: 112.40,
        daily_change_pct: 2.15,
        cpi_transport_weight: 0.0859,
        last_updated: new Date().toISOString().split('T')[0],
        elementary_aggregation: "Jevons Geometric Mean",
        upper_level_aggregation: "Modified Laspeyres / Young Index",
        data_status: "VALIDATED"
      }, null, 2));
    } else if (endpoint === 'routes') {
      setApiResponse(JSON.stringify({
        route_id: "DEL-BOM",
        route_name: "Delhi - Mumbai",
        distance_km: 1148,
        dgca_rpkm_weight: 0.1652,
        current_composite_price_inr: 6280.0,
        base_period_price_p0_inr: 5420.0,
        route_apix: 115.87,
        advance_windows_inr: {
          "T+1": 9294.4,
          "T+7": 7661.6,
          "T+15": 6280.0,
          "T+30": 5526.4,
          "T+45": 5149.6
        }
      }, null, 2));
    } else if (endpoint === 'decomposition') {
      setApiResponse(JSON.stringify({
        period: "monthly",
        model: "Shapley Additive Attribution",
        specification: "dln(APIx) = alpha + beta1*dln(ATF) + gamma*Holiday + delta*LeadShift + eps",
        contributions: {
          total_delta_points: 2.42,
          atf_fuel_impact: 1.18,
          festival_demand_impact: 0.95,
          lead_time_shift_impact: 0.22,
          residual_market_noise: 0.07
        },
        policy_insight: "Headline index surged +2.42 points. Jet fuel (ATF) pass-through accounted for +1.18 pts; festive holiday window contributed +0.95 pts."
      }, null, 2));
    } else if (endpoint === 'export') {
      setApiResponse(JSON.stringify({
        export_standard: "MoSPI_CPI_Format_v2.1",
        item_code: "07.3.3.1_DOMESTIC_AIRFARE",
        base_year: "2025_Q1=100",
        total_records: 30,
        sample_first_record: {
          date: "2026-09-08",
          apix_headline: headlineApix,
          cpi_transport_contribution_pts: Number((headlineApix * 0.0859).toFixed(3)),
          data_collection_mode: "AUTOMATED_WEB_SCRAPING_CDP",
          validation_status: "CERTIFIED"
        }
      }, null, 2));
    }
  };

  // Trigger real CSV download
  const handleDownloadCsv = () => {
    const headers = "date,item_code,item_description,base_year,apix_headline,cpi_transport_contribution_pts,validation_status\n";
    const rows = [
      `2026-09-08,07.3.3.1,Passenger Transport by Air,2025_Q1=100,${headlineApix},${(headlineApix * 0.0859).toFixed(3)},CERTIFIED\n`,
      `2026-09-07,07.3.3.1,Passenger Transport by Air,2025_Q1=100,114.60,9.844,CERTIFIED\n`,
      `2026-09-06,07.3.3.1,Passenger Transport by Air,2025_Q1=100,114.20,9.810,CERTIFIED\n`,
      `2026-09-05,07.3.3.1,Passenger Transport by Air,2025_Q1=100,113.90,9.784,CERTIFIED\n`
    ].join('');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apix_india_mospi_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderYamlContent = `# Render Blueprint: APIx-India (FastAPI + PostgreSQL)
# Deploy with 1-click on https://render.com
services:
  # 1. Python FastAPI Backend Service
  - type: web
    name: apix-fastapi-backend
    env: python
    region: singapore # Close to India
    plan: free
    buildCommand: "pip install -r backend/requirements.txt && playwright install chromium --with-deps 2>/dev/null || true"
    startCommand: "uvicorn backend.main:app --host 0.0.0.0 --port $PORT"
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: apix-postgres
          property: connectionString
      - key: PYTHONUNBUFFERED
        value: "1"
      - key: ENVIRONMENT
        value: production
    healthCheckPath: /api/v1/health

databases:
  # 2. Managed PostgreSQL Database for Time-Series Fare Storage
  - name: apix-postgres
    databaseName: apix_india
    user: apix_admin
    region: singapore
    plan: free
    ipAllowList: []`;

  const mainPyContent = `from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .models import BasketRoute, RawFareQuote

app = FastAPI(title="APIx-India API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/health")
def health_check():
    return {"status": "healthy", "service": "APIx-India FastAPI Backend"}

@app.get("/api/v1/apix/headline")
def get_headline(freq: str = "daily"):
    return {
        "index_name": "APIx_National_Composite",
        "current_index": 114.82,
        "base_period": "2025_Q1=100",
        "elementary_aggregation": "Jevons Geometric Mean"
    }

@app.get("/api/v1/apix/routes/{route_id}")
def get_route(route_id: str):
    return {"route_id": route_id, "composite_price": 6280.0, "route_apix": 115.87}`;

  const schemaSqlContent = `CREATE TABLE basket_routes (
    route_id VARCHAR(7) PRIMARY KEY, -- e.g. DEL-BOM
    origin_iata CHAR(3) NOT NULL,
    destination_iata CHAR(3) NOT NULL,
    distance_km INT NOT NULL,
    monthly_pax_volume BIGINT NOT NULL,
    rpkm_value NUMERIC(15, 2) NOT NULL,
    route_weight NUMERIC(6, 5) NOT NULL,
    base_price_p0 NUMERIC(10, 2) NOT NULL DEFAULT 4800.00
);

CREATE TABLE raw_fare_quotes (
    quote_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_platform VARCHAR(32) NOT NULL,
    scrape_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    route_id VARCHAR(7) REFERENCES basket_routes(route_id),
    carrier VARCHAR(32) NOT NULL,
    lead_window_days SMALLINT NOT NULL,
    base_fare NUMERIC(10, 2) NOT NULL,
    fuel_surcharge NUMERIC(10, 2) DEFAULT 0.0,
    taxes_and_fees NUMERIC(10, 2) DEFAULT 0.0,
    total_fare NUMERIC(10, 2) NOT NULL,
    is_outlier BOOLEAN DEFAULT FALSE,
    scraping_method VARCHAR(20) DEFAULT 'SELENIUM'
);`;

  const cdpContent = `import asyncio
from playwright.async_api import async_playwright

class CDPNetworkInterceptor:
    """Chrome DevTools Protocol Interceptor when web scraping is blocked."""
    async def intercept_fares(self, route_id: str, lead_days: int):
        async with async_playwright() as p:
            # Launch Chromium with anti-detection args
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            # CDP Network Sniffing
            async def handle_response(response):
                if "/api/flights/search" in response.url or "fare" in response.url:
                    data = await response.json()
                    print("Extracted live fares directly from CDP network stream:", data)

            page.on("response", handle_response)
            await page.goto("https://www.airline-booking-portal.com/flights")
            await page.wait_for_timeout(4000)
            await browser.close()`;

  const seleniumContent = `from selenium import webdriver
from selenium.webdriver.chrome.options import Options

class SeleniumFlightScraper:
    """Standard Selenium scraper with user-agent rotation."""
    def __init__(self):
        options = Options()
        options.add_argument("--headless=new")
        options.add_argument("--disable-blink-features=AutomationControlled")
        self.driver = webdriver.Chrome(options=options)

    def scrape(self, origin: str, dest: str, lead_days: int):
        # Navigates to booking portal and parses ticket fares
        ...`;

  const getCodeSnippet = () => {
    switch (activeCodeFile) {
      case 'render_yaml': return renderYamlContent;
      case 'main_py': return mainPyContent;
      case 'schema_sql': return schemaSqlContent;
      case 'cdp_py': return cdpContent;
      case 'selenium_py': return seleniumContent;
      default: return renderYamlContent;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                Stage 9 & Deployment Architecture
              </span>
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                FastAPI + PostgreSQL on Render Blueprint
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Government Delivery API & Render Deployment
            </h2>
            <p className="text-xs text-slate-500">
              Exposes high-security REST endpoints for MoSPI/RBI and provides complete Render Blueprint configuration with managed PostgreSQL.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Download MoSPI CSV
            </button>
          </div>
        </div>
      </div>

      {/* Two Columns: Section 1 = Interactive API Explorer; Section 2 = Render Blueprint & Codebase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Government REST API Explorer */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-600" />
                Live Institutional REST API Endpoints
              </h3>
              <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded border border-blue-200">
                OpenAPI 3.1
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Select an endpoint to execute simulated queries directly against the APIx-India data schema:
            </p>

            {/* Endpoints List */}
            <div className="space-y-2 mb-4">
              {[
                { id: 'headline', method: 'GET', path: '/api/v1/apix/headline?freq=daily', label: 'Headline Composite APIx' },
                { id: 'routes', method: 'GET', path: '/api/v1/apix/routes/DEL-BOM', label: 'Route Breakdown (DEL-BOM)' },
                { id: 'decomposition', method: 'GET', path: '/api/v1/apix/decomposition', label: 'Shapley Factor Attribution' },
                { id: 'export', method: 'GET', path: '/api/v1/export/cpi-transport-subgroup', label: 'MoSPI National CPI Feed' }
              ].map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => handleTestApi(ep.id)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                    selectedEndpoint === ep.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      selectedEndpoint === ep.id ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-800'
                    }`}>
                      {ep.method}
                    </span>
                    <span className="font-mono text-[11px]">{ep.path}</span>
                  </div>
                  <span className="text-[10px] opacity-75 font-semibold hidden sm:inline">{ep.label}</span>
                </button>
              ))}
            </div>

            {/* Response Viewer */}
            <div className="bg-slate-950 text-slate-200 rounded-lg p-3 font-mono text-xs border border-slate-800">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400">
                <span>Response (HTTP 200 OK • application/json)</span>
                <button
                  onClick={() => handleCopy('api', apiResponse || 'Select an endpoint above')}
                  className="flex items-center gap-1 hover:text-white"
                >
                  {copiedKey === 'api' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedKey === 'api' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="overflow-x-auto max-h-56 text-[11px] text-emerald-300">
                {apiResponse || JSON.stringify({
                  status: "ready",
                  instruction: "Click any of the 4 GET endpoints above to trigger an API test response."
                }, null, 2)}
              </pre>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Authentication: Supports mTLS & API Key via HTTP Bearer token for NSO and RBI.
          </div>
        </div>

        {/* Right: Render Deployment & PostgreSQL Blueprint */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-600" />
                Render Hosting & PostgreSQL Database
              </h3>
              <span className="text-xs bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded border border-purple-200">
                1-Click Blueprint
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              All backend Python files and Render Blueprint (<code className="font-mono bg-slate-100 px-1 py-0.5 rounded">render.yaml</code>) are generated in the codebase:
            </p>

            {/* File Switcher Tabs */}
            <div className="flex space-x-1 border-b border-slate-200 pb-2 mb-3 overflow-x-auto text-xs">
              {[
                { id: 'render_yaml', name: 'render.yaml' },
                { id: 'main_py', name: 'backend/main.py' },
                { id: 'schema_sql', name: 'backend/schema.sql' },
                { id: 'cdp_py', name: 'cdp_interceptor.py' },
                { id: 'selenium_py', name: 'selenium_scraper.py' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveCodeFile(f.id as any)}
                  className={`px-2.5 py-1 rounded-md font-semibold text-[11px] whitespace-nowrap transition-colors ${
                    activeCodeFile === f.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>

            {/* Code Box */}
            <div className="bg-slate-950 text-slate-200 rounded-lg p-3 font-mono text-xs border border-slate-800 relative">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400">
                <span>{activeCodeFile.toUpperCase()}</span>
                <button
                  onClick={() => handleCopy('code', getCodeSnippet())}
                  className="flex items-center gap-1 hover:text-white"
                >
                  {copiedKey === 'code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedKey === 'code' ? 'Copied' : 'Copy File'}
                </button>
              </div>
              <pre className="overflow-x-auto max-h-60 text-[11px] text-amber-200/90 whitespace-pre">
                {getCodeSnippet()}
              </pre>
            </div>
          </div>

          {/* Quick Render Steps */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
            <span className="font-bold text-slate-900 block mb-1">How to Launch on Render:</span>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
              <li>Commit or export this repository to GitHub / GitLab.</li>
              <li>Go to <a href="https://dashboard.render.com" target="_blank" rel="noreferrer" className="text-purple-600 font-bold underline inline-flex items-center gap-0.5">Render Dashboard <ExternalLink className="w-3 h-3" /></a> and click <strong>New +</strong> → <strong>Blueprint</strong>.</li>
              <li>Select your repository. Render automatically reads <code className="font-mono bg-slate-100 px-1 py-0.2 rounded">render.yaml</code>, spins up the <strong>PostgreSQL</strong> database and boots <strong>FastAPI</strong> with Uvicorn!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
