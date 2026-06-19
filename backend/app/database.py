import os
import logging

from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

logger = logging.getLogger("luxeaura.database")

# ---------------------------------------------------------------------------
# Database URL resolution
# ---------------------------------------------------------------------------
# Railway injects DATABASE_URL automatically when a Postgres plugin is attached.
# On local machines without a DATABASE_URL env var we fall back to SQLite so
# the app still boots for development without a running Postgres instance.
# ---------------------------------------------------------------------------
DATABASE_URL: str = os.getenv("DATABASE_URL", "")

if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./luxeaura.db"
    logger.warning(
        "DATABASE_URL environment variable not set. "
        "Falling back to SQLite (development mode). "
        "Set DATABASE_URL in Railway to use PostgreSQL in production."
    )
else:
    # Railway sometimes provides a postgres:// URI; SQLAlchemy 2.x requires
    # postgresql:// (or postgresql+psycopg2://).
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    logger.info("Using PostgreSQL database.")

# ---------------------------------------------------------------------------
# Engine configuration
# ---------------------------------------------------------------------------
connect_args: dict = {}

if DATABASE_URL.startswith("sqlite"):
    # SQLite requires check_same_thread=False when used with FastAPI's async
    # request handling (multiple threads share the same connection).
    connect_args = {"check_same_thread": False}
    engine = create_engine(
        DATABASE_URL,
        connect_args=connect_args,
        # Echo SQL statements in development (disable in production if noisy)
        echo=False,
    )
else:
    # PostgreSQL – use a connection pool tuned for Railway's free tier limits.
    # pool_pre_ping tests connections before handing them back from the pool,
    # which prevents "server closed the connection unexpectedly" errors after
    # idle periods.
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
        echo=False,
    )

# ---------------------------------------------------------------------------
# Session factory and declarative base
# ---------------------------------------------------------------------------
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# ---------------------------------------------------------------------------
# FastAPI dependency – yields a DB session and always closes it afterwards
# ---------------------------------------------------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Optional: quick connectivity test (used during startup logging)
# ---------------------------------------------------------------------------
def check_db_connection() -> bool:
    """Returns True if the database is reachable, False otherwise."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as exc:
        logger.error("Database connectivity check failed: %s", exc)
        return False
