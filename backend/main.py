from fastapi import FastAPI, Body, Query, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from translator import translate_text, DEEPL_API_KEY
from utils import get_file_progress
from translator import translate_text
import os

# Import our new modules
from database import get_db, init_db
from parser import create_skeleton, build_translated_file

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Configuration
SOURCE_DIR = "source_html"
SKELETON_DIR = "output/skeletons"
OUTPUT_ES = "output/translated_es"
OUTPUT_FR = "output/translated_fr"

@app.on_event("startup")
def startup():
    init_db()

@app.get("/files")
def list_files():
    conn = get_db()
    filenames = [f for f in os.listdir(SOURCE_DIR) if f.endswith('.html')]
    
    # We use LENGTH() to ensure the strings actually contain text
    stats_query = """
        SELECT 
            file_name,
            COUNT(*) as total,
            SUM(CASE 
                WHEN es_status IN ('accurate', 'corrected') 
                AND fr_status IN ('accurate', 'corrected') 
                THEN 1 ELSE 0 END) as translated
        FROM translations
        GROUP BY file_name
    """
    
    # Fetch results and map them by filename
    db_results = conn.execute(stats_query).fetchall()
    db_stats = {row['file_name']: row for row in db_results}
    
    result = []
    for name in filenames:
        stats = db_stats.get(name)
        
        if stats:
            total = stats['total']
            translated = stats['translated']
            progress = int((translated / total) * 100) if total > 0 else 0
        else:
            # If the file hasn't been opened yet, it's not in the DB
            progress = 0
            
        result.append({
            "name": name, 
            "progress": progress
        })
        
    return result

@app.get("/translator/status")
def get_status():
    """Check if DeepL is configured properly"""
    return {
        "deepl_available": DEEPL_API_KEY != "YOUR_DEEPL_API_KEY_HERE",
        "google_available": True
    }

@app.get("/preview/{filename}/{lang}")
def preview_file(filename: str, lang: str):
    conn = get_db()
    # Fetch all current translations for the specific language
    rows = conn.execute("SELECT key, es, fr, original FROM translations WHERE file_name=?", (filename,)).fetchall()
    skel_path = os.path.join(SKELETON_DIR, filename)
    
    if not os.path.exists(skel_path):
        return HTMLResponse(content="<html><body>Skeleton not found. Load the file first.</body></html>", status_code=404)

    with open(skel_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for row in rows:
        # If lang is 'original', use the original text column
        if lang == "original":
            val = row["original"]
        else:
            # Use the specific language column
            val = row[lang] if row[lang] else f"[{lang.upper()} MISSING]"
        content = content.replace(f"{{{{{row['key']}}}}}", val)
        
    return HTMLResponse(content=content)

@app.get("/files/{filename}/strings")
def get_strings(filename: str, provider: str = Query("google")):
    conn = get_db()
    rows = conn.execute("SELECT key, original, es, fr, es_status, fr_status, es_engine, fr_engine FROM translations WHERE file_name=?", (filename,)).fetchall()
    
    if not rows:
        mappings = create_skeleton(filename, SOURCE_DIR, SKELETON_DIR)
        for m in mappings:
            try:
                # We pass the provider chosen in the UI down to the translator
                auto_es = translate_text(m['original'], 'es', provider=provider)
                auto_fr = translate_text(m['original'], 'fr', provider=provider)
            except Exception as e:
                # If the chosen provider fails, we return a 503 so the UI can show the error
                raise HTTPException(status_code=503, detail=f"Translator {provider} failed: {str(e)}")
            
            conn.execute(
                "INSERT INTO translations (file_name, key, original, es, fr) VALUES (?, ?, ?, ?, ?)",
                (filename, m['key'], m['original'], auto_es, auto_fr)
            )
        conn.commit()
        rows = conn.execute("SELECT key, original, es, fr FROM translations WHERE file_name=?", (filename,)).fetchall()
    
    return [dict(r) for r in rows]

@app.post("/files/{filename}/save")
def save_translations(filename: str, payload: dict = Body(...)) -> dict:
    conn = get_db()
    for key, data in payload.items():
        conn.execute("""
            UPDATE translations 
            SET es = ?, fr = ?, 
                es_status = ?, fr_status = ? 
            WHERE file_name = ? AND key = ?
        """, (
            data.get('es'), data.get('fr'),
            data.get('es_status', 'not_treated'), data.get('fr_status', 'not_treated'),
            filename, key
        ))
    conn.commit()
    # 2. TRIGGER THE PHYSICAL FILE SAVE
    # Fetch all current translations for this file to pass to the builder
    rows = conn.execute("SELECT * FROM translations WHERE file_name=?", (filename,)).fetchall()
    skel_path = os.path.join(SKELETON_DIR, filename)
    
    # Save Spanish Version
    build_translated_file(
        skel_path, 
        os.path.join(OUTPUT_ES, filename), 
        rows, 
        'es'
    )
    
    # Save French Version
    build_translated_file(
        skel_path, 
        os.path.join(OUTPUT_FR, filename), 
        rows, 
        'fr'
    )
    return {"status": "success"}

@app.post("/files/{filename}/rerun")
def rerun_translation(filename: str, provider: str = Query("deepl")):
    conn = get_db()
    
    # 1. Fetch the original strings from the database before deleting
    # (We assume the 'original' and 'key' are already in the DB)
    existing_rows = conn.execute(
        "SELECT key, original FROM translations WHERE file_name = ?", 
        (filename,)
    ).fetchall()

    if not existing_rows:
        raise HTTPException(status_code=404, detail="File not found in database")

    # 2. Delete the old machine translations
    conn.execute("DELETE FROM translations WHERE file_name = ?", (filename,))
    
    # 3. Re-run the engine for each string
    for row in existing_rows:
        auto_es = translate_text(row['original'], 'es', provider=provider)
        auto_fr = translate_text(row['original'], 'fr', provider=provider)
        
        conn.execute(
            """INSERT INTO translations 
               (file_name, key, original, es, fr, es_engine, fr_engine, es_status, fr_status) 
               VALUES (?, ?, ?, ?, ?, ?, ?, 'not_treated', 'not_treated')""",
            (filename, row['key'], row['original'], auto_es, auto_fr, provider, provider)
        )
    
    conn.commit()
    return {"status": "success", "message": f"Rerunning translation using {provider}"}
