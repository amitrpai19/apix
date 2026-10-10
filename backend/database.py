import os
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

logger = logging.getLogger("apix.database")

raw_db_url = os.getenv("DATABASE_URL", "sqlite:///./apix_local.db")
if raw_db_url.startswith("postgres://"):
    raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)

active_db_type = "sqlite"
engine = None

if "postgresql" in raw_db_url:
    candidate_urls = [raw_db_url]
    if raw_db_url.startswith("postgresql://") and not raw_db_url.startswith("postgresql+"):
        candidate_urls = [
            raw_db_url.replace("postgresql://", "postgresql+psycopg://", 1),
            raw_db_url.replace("postgresql://", "postgresql+psycopg2://", 1),
            raw_db_url
        ]

    connected = False
    for candidate_url in candidate_urls:
        try:
            test_engine = create_engine(
                candidate_url, 
                pool_pre_ping=True
            )
            with test_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            engine = test_engine
            active_db_type = "postgresql"
            connected = True
            driver_name = candidate_url.split("://")[0]
            print(f"Connected successfully to PostgreSQL database using {driver_name}.")
            break
        except (Exception, ModuleNotFoundError, ImportError) as exc:
            driver_name = candidate_url.split("://")[0]
            print(f"PostgreSQL driver attempt ({driver_name}) failed: {exc}")
            continue

    if not connected:
        print("PostgreSQL connection or driver unavailable. Falling back to SQLite.")
        engine = create_engine("sqlite:///./apix_local.db", connect_args={"check_same_thread": False})
        active_db_type = "sqlite_fallback"
else:
    connect_args = {"check_same_thread": False} if "sqlite" in raw_db_url else {}
    engine = create_engine(raw_db_url, connect_args=connect_args)
    active_db_type = "sqlite"

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
