"""
Migration: add stripe_customer_id and stripe_subscription_id to users table.
Run once: python migrate_stripe.py
"""
from dotenv import load_dotenv
load_dotenv()

import os
import psycopg

DATABASE_URL = os.getenv("DATABASE_URL", "")
# psycopg3 DSN — strip the SQLAlchemy driver prefix if present
dsn = DATABASE_URL.replace("postgresql+psycopg://", "postgresql://")

with psycopg.connect(dsn) as conn:
    with conn.cursor() as cur:
        cur.execute("""
            ALTER TABLE users
              ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
              ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
        """)
    conn.commit()
    print("Migration complete: stripe columns added to users table.")
