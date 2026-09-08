export interface RouteBasket {
  route_id: string; // e.g. "DEL-BOM"
  origin_iata: string;
  origin_city: string;
  destination_iata: string;
  destination_city: string;
  distance_km: number;
  monthly_pax_volume: number;
  flight_departures: number;
  rpkm_value: number;
  route_weight: number; // Wr
  base_price_p0: number; // Baseline INR
  current_price: number; // Current blended price INR
  route_apix: number; // (current / base) * 100
  category: 'Metro-Metro' | 'Metro-Tier2' | 'Regional';
}

export interface FareQuote {
  quote_id: string;
  source_platform: string; // IndiGo_Direct, AirIndia_Direct, MakeMyTrip, etc.
  carrier: string;
  flight_number: string;
  route_id: string;
  departure_time: string;
  lead_window_days: 1 | 7 | 15 | 30 | 45;
  fare_class: string;
  base_fare: number;
  fuel_surcharge: number;
  taxes_and_fees: number; // UDF/ADF + GST
  total_fare: number;
  seats_remaining: number;
  is_outlier: boolean;
  scraping_method: 'SELENIUM' | 'SCRAPY' | 'CDP_INTERCEPT';
  cdp_stream_id?: string;
}

export interface ApixTimeSeriesPoint {
  date: string;
  apix: number;
  cpi_transport_baseline: number;
  dgca_monthly_yield: number;
  atf_fuel_index: number;
  event?: string;
}

export interface LeadWindowElasticity {
  lead_window: string;
  lead_days: number;
  empirical_weight_beta: number;
  avg_fare: number;
  surge_multiplier: number;
  rationale: string;
}

export interface FactorDecomposition {
  total_delta_pts: number;
  atf_fuel_impact: number;
  festival_demand_impact: number;
  lead_time_shift_impact: number;
  residual_noise: number;
  policy_summary: string;
}

export interface ScrapeConsoleLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'CDP_ALERT';
  message: string;
}
