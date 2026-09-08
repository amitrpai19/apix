import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, BigInteger, Numeric, Boolean, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class BasketRoute(Base):
    __tablename__ = "basket_routes"

    route_id = Column(String(7), primary_key=True) # e.g. DEL-BOM
    origin_iata = Column(String(3), nullable=False)
    origin_city = Column(String(64), nullable=False)
    destination_iata = Column(String(3), nullable=False)
    destination_city = Column(String(64), nullable=False)
    distance_km = Column(Integer, nullable=False)
    monthly_pax_volume = Column(BigInteger, nullable=False)
    flight_departures = Column(Integer, default=450)
    rpkm_value = Column(Numeric(15, 2), nullable=False)
    route_weight = Column(Numeric(6, 5), nullable=False)
    base_price_p0 = Column(Numeric(10, 2), default=4800.00)
    is_active = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.utcnow)

    quotes = relationship("RawFareQuote", back_populates="route")

class RawFareQuote(Base):
    __tablename__ = "raw_fare_quotes"

    quote_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    source_platform = Column(String(32), nullable=False) # IndiGo, Air India, MakeMyTrip
    scrape_timestamp = Column(DateTime, default=datetime.utcnow)
    route_id = Column(String(7), ForeignKey("basket_routes.route_id"))
    flight_number = Column(String(10), nullable=False)
    carrier = Column(String(32), nullable=False)
    departure_time = Column(DateTime, nullable=False)
    lead_window_days = Column(Integer, nullable=False) # 1, 7, 15, 30, 45
    fare_class = Column(String(16), default="Economy")
    base_fare = Column(Numeric(10, 2), nullable=False)
    fuel_surcharge = Column(Numeric(10, 2), default=0.0)
    taxes_and_fees = Column(Numeric(10, 2), default=0.0)
    total_fare = Column(Numeric(10, 2), nullable=False)
    seats_remaining = Column(Integer, default=9)
    is_outlier = Column(Boolean, default=False)
    scraping_method = Column(String(20), default="SELENIUM") # SELENIUM, SCRAPY, CDP_INTERCEPT

    route = relationship("BasketRoute", back_populates="quotes")

class PricingContextFeature(Base):
    __tablename__ = "pricing_context_features"

    feature_date = Column(Date, primary_key=True)
    atf_price_delhi = Column(Numeric(8, 2), nullable=False)
    atf_price_mumbai = Column(Numeric(8, 2), nullable=False)
    is_national_holiday = Column(Boolean, default=False)
    holiday_name = Column(String(64), nullable=True)
    active_festival_season = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class ApixDailyIndex(Base):
    __tablename__ = "apix_daily_indices"

    index_date = Column(Date, primary_key=True)
    route_id = Column(String(7), primary_key=True, default="NATIONAL") # 'NATIONAL' or route
    lead_window_days = Column(Integer, primary_key=True, default=0) # 0 = all windows blended
    index_value = Column(Numeric(8, 4), nullable=False)
    base_period_code = Column(String(16), default="2025_Q1")
    created_at = Column(DateTime, default=datetime.utcnow)
