import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# On Render, DATABASE_URL is provided by the managed PostgreSQL service.
# If DATABASE_URL starts with postgres://, SQLAlchemy requires postgresql://
raw_db_url = os.getenv("DATABASE_URL", "sqlite:///./apix_local.db")
if raw_db_url.startswith("postgres://"):
    raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if "sqlite" in raw_db_url else {}

engine = create_engine(raw_db_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
