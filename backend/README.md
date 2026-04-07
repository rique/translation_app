# Translation Backend

This service handles the extraction of strings from HTML files and the reconstruction of translated versions.

## Key Components
- `parser.py`: Uses BeautifulSoup to create "Skeleton" HTML files with unique placeholders.
- `database.py`: Manages the SQLite state to ensure no work is lost.
- `main.py`: REST API for the React frontend.

## Folders
- `source_html/`: Input folder for raw HTML.
- `output/skeletons/`: Intermediate files containing `{{key}}` placeholders.
- `output/translated_xx/`: Final translated results.

## Requirements
Install via: 
```bash
pip install -r requirements.txt
```

## Run the backend
Activate the environment:
```bash
source venv/bin/activate
```
Run the app
```bash
uvicorn main:app --reload
```