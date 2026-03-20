"""
Run this once to add plan + trial_ends_at columns to the users table.
Usage:  python migrate_plan.py
"""
import os
from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://localhost/examprep")

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    conn.execute(text("""
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS plan VARCHAR NOT NULL DEFAULT 'free';
    """))
    conn.execute(text("""
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP;
    """))
    # Back-fill trial_ends_at for existing users (7 days from now)
    conn.execute(text("""
        UPDATE users
        SET trial_ends_at = NOW() + INTERVAL '7 days'
        WHERE trial_ends_at IS NULL;
    """))
    conn.commit()

print("Migration complete: plan + trial_ends_at columns added.")
