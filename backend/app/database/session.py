import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# For production set DATABASE_URL=postgresql+psycopg2://user:pass@host/db
# Falls back to in-process SQLite for local dev / tests.
SQLALCHEMY_DATABASE_URL = os.environ.get(
    "DATABASE_URL", "sqlite:///./smart_tickets.db"
)

connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Create all tables. Called at app startup or in tests."""
    from .models import Base
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
