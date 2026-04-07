import sqlite3
import os

DB_PATH = "app_data/translations.db"

def get_db():
    os.makedirs("app_data", exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    # 1. Create the base table if it's a fresh start
    conn.execute('''CREATE TABLE IF NOT EXISTS translations 
                    (id INTEGER PRIMARY KEY, file_name TEXT, key TEXT, original TEXT, 
                     es TEXT, fr TEXT)''')

    # 2. Add new columns to existing table if they don't exist
    columns_to_add = {
        "es_status": "TEXT DEFAULT 'not_treated' CHECK(es_status IN ('not_treated', 'accurate', 'corrected'))",
        "fr_status": "TEXT DEFAULT 'not_treated' CHECK(fr_status IN ('not_treated', 'accurate', 'corrected'))",
        "es_engine": "TEXT",
        "fr_engine": "TEXT"
    }

    cursor = conn.execute("PRAGMA table_info(translations)")
    existing_columns = [col[1] for col in cursor.fetchall()]

    for col_name, col_def in columns_to_add.items():
        if col_name not in existing_columns:
            conn.execute(f"ALTER TABLE translations ADD COLUMN {col_name} {col_def}")
            print(f"Added column: {col_name}")

    conn.commit()
    conn.close()