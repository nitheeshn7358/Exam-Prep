"""
Migration: Add subjects table, add subject_id to notes and sessions.

Run from the backend directory:
  python migrate_subjects.py
"""

import os
from sqlalchemy import create_engine, text

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://localhost/examprep")

engine = create_engine(DATABASE_URL)

migrations = [
    # Create subjects table
    """
    CREATE TABLE IF NOT EXISTS subjects (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR NOT NULL,
        description VARCHAR,
        created_at TIMESTAMP DEFAULT now()
    );
    """,
    # Add subject_id to notes
    """
    ALTER TABLE notes
        ADD COLUMN IF NOT EXISTS subject_id INTEGER REFERENCES subjects(id) ON DELETE SET NULL;
    """,
    # Add subject_id to sessions
    """
    ALTER TABLE sessions
        ADD COLUMN IF NOT EXISTS subject_id INTEGER REFERENCES subjects(id) ON DELETE SET NULL;
    """,
]

with engine.connect() as conn:
    for sql in migrations:
        conn.execute(text(sql))
    conn.commit()

print("Migration complete.")
