-- PostgreSQL Schema for APIx-India: Real-Time Airfare Price Index
-- Conforms to MoSPI CPI Architecture & DGCA Route Weighting Standards

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Basket Definition & Route Registry
CREATE TABLE IF NOT EXISTS basket_routes (
    route_id VARCHAR(7) PRIMARY KEY, -- e.g. DEL-BOM
    origin_iata CHAR(3) NOT NULL,
    origin_city VARCHAR(64) NOT NULL,
    destination_iata CHAR(3) NOT NULL,
    destination_city VARCHAR(64) NOT NULL,
    distance_km INT NOT NULL,
    monthly_pax_volume BIGINT NOT NULL,
    flight_departures INT NOT NULL DEFAULT 450,
    rpkm_value NUMERIC(15, 2) NOT NULL,
    route_weight NUMERIC(6, 5) NOT NULL,
    base_price_p0 NUMERIC(10, 2) NOT NULL DEFAULT 4800.00,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Raw Scraped Fare Quotes (Partitionable by scrape_timestamp / lead_window)
CREATE TABLE IF NOT EXISTS raw_fare_quotes (
    quote_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_platform VARCHAR(32) NOT NULL, -- e.g., 'IndiGo_Direct', 'MakeMyTrip', 'AirIndia_Direct'
    scrape_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    route_id VARCHAR(7) REFERENCES basket_routes(route_id) ON DELETE CASCADE,
    flight_number VARCHAR(10) NOT NULL,
    carrier VARCHAR(32) NOT NULL,
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    lead_window_days SMALLINT NOT NULL, -- 1, 7, 15, 30, 45
    fare_class VARCHAR(16) DEFAULT 'Economy',
    base_fare NUMERIC(10, 2) NOT NULL,
    fuel_surcharge NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    taxes_and_fees NUMERIC(10, 2) NOT NULL DEFAULT 0.0, -- UDF/ADF + GST
    total_fare NUMERIC(10, 2) NOT NULL,
    seats_remaining INT DEFAULT 9,
    is_outlier BOOLEAN DEFAULT FALSE,
    scraping_method VARCHAR(20) DEFAULT 'SELENIUM' -- 'SELENIUM', 'SCRAPY', 'CDP_INTERCEPT'
);

CREATE INDEX IF NOT EXISTS idx_fare_lookup 
ON raw_fare_quotes (route_id, lead_window_days, scrape_timestamp);

-- 3. Factor Extraction & Covariate Store (Feature Store)
CREATE TABLE IF NOT EXISTS pricing_context_features (
    feature_date DATE PRIMARY KEY,
    atf_price_delhi NUMERIC(8, 2) NOT NULL, -- INR / kilolitre
    atf_price_mumbai NUMERIC(8, 2) NOT NULL,
    is_national_holiday BOOLEAN DEFAULT FALSE,
    holiday_name VARCHAR(64),
    active_festival_season BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Econometric Index Outputs (APIx Daily / Weekly / Monthly Series)
CREATE TABLE IF NOT EXISTS apix_daily_indices (
    index_date DATE NOT NULL,
    route_id VARCHAR(7), -- NULL denotes national composite index
    lead_window_days SMALLINT, -- NULL denotes blended all-window composite
    index_value NUMERIC(8, 4) NOT NULL,
    base_period_code VARCHAR(16) DEFAULT '2025_Q1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (index_date, route_id, lead_window_days)
);

-- Seed top DGCA domestic trunk routes
INSERT INTO basket_routes (route_id, origin_iata, origin_city, destination_iata, destination_city, distance_km, monthly_pax_volume, flight_departures, rpkm_value, route_weight, base_price_p0)
VALUES
    ('DEL-BOM', 'DEL', 'Delhi', 'BOM', 'Mumbai', 1148, 620000, 3100, 711760000, 0.16520, 5420.00),
    ('BOM-DEL', 'BOM', 'Mumbai', 'DEL', 'Delhi', 1148, 615000, 3080, 706020000, 0.16380, 5390.00),
    ('BLR-DEL', 'BLR', 'Bengaluru', 'DEL', 'Delhi', 1740, 395000, 1950, 687300000, 0.15950, 6650.00),
    ('DEL-BLR', 'DEL', 'Delhi', 'BLR', 'Bengaluru', 1740, 390000, 1920, 678600000, 0.15750, 6580.00),
    ('BOM-BLR', 'BOM', 'Mumbai', 'BLR', 'Bengaluru', 842, 340000, 2100, 286280000, 0.06640, 4120.00),
    ('BLR-BOM', 'BLR', 'Bengaluru', 'BOM', 'Mumbai', 842, 335000, 2080, 282070000, 0.06550, 4080.00),
    ('DEL-CCU', 'DEL', 'Delhi', 'CCU', 'Kolkata', 1305, 290000, 1550, 378450000, 0.08780, 5820.00),
    ('BLR-HYD', 'BLR', 'Bengaluru', 'HYD', 'Hyderabad', 500, 220000, 1600, 110000000, 0.02550, 3250.00),
    ('MAA-DEL', 'MAA', 'Chennai', 'DEL', 'Delhi', 1760, 280000, 1400, 492800000, 0.11440, 6490.00)
ON CONFLICT (route_id) DO NOTHING;
