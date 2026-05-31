from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from urllib.parse import urlparse, urlunparse, urlencode, parse_qs

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./homecalendar.db")

# Supabase / Render PostgreSQL returns postgres:// — SQLAlchemy needs postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

_is_sqlite = DATABASE_URL.startswith("sqlite")

if _is_sqlite:
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
    )
else:
    # Strip Prisma-specific params (pgbouncer=true) not understood by psycopg2,
    # keep only sslmode if present.
    parsed = urlparse(DATABASE_URL)
    qs = parse_qs(parsed.query)
    qs.pop("pgbouncer", None)
    clean_url = urlunparse(parsed._replace(query=urlencode({k: v[0] for k, v in qs.items()})))

    engine = create_engine(
        clean_url,
        connect_args={"sslmode": "require"},
        pool_pre_ping=True,
    )
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
