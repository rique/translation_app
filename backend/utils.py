import re
import os
import sqlite3

def validate_variables(original, translated):
    """Checks if the [@VARIABLES] in original match the translation."""
    if not translated: return True
    vars_orig = set(re.findall(r'(\[@.*?\])', original))
    vars_trans = set(re.findall(r'(\[@.*?\])', translated))
    return vars_orig == vars_trans

def get_file_progress(conn, filename):
    """Calculates completion percentage for a file."""
    total = conn.execute(
        "SELECT COUNT(*) FROM translations WHERE file_name=?", (filename,)
    ).fetchone()[0]
    
    if total == 0: return 0
    
    # Count rows where BOTH ES and FR are filled
    translated = conn.execute(
        "SELECT COUNT(*) FROM translations WHERE file_name=? AND es IS NOT NULL AND fr IS NOT NULL", 
        (filename,)
    ).fetchone()[0]
    
    return int((translated / total) * 100)

def apply_glossary(text, lang, conn):
    """Checks the glossary table and replaces terms before sending to API."""
    # We will implement the table logic in the next step
    rows = conn.execute("SELECT term, replacement FROM glossary WHERE lang=?", (lang,)).fetchall()
    for row in rows:
        text = re.sub(rf'\b{row["term"]}\b', row["replacement"], text, flags=re.IGNORECASE)
    return text
