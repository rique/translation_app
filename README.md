



# **🌍 Simple Translation Management App**

A web application designed to automate and manage the translation of HTML templates into Spanish and French.

## **🚀 Core Features**

### **1\. HTML Parsing & "Skeleton" Generation**

* **Non-Destructive Extraction:** Uses Python and BeautifulSoup to extract translatable strings while preserving HTML structures.  
* **Placeholder System:** Automatically replaces text nodes with unique keys (e.g., {{t\_hash\_1}}), generating a "skeleton" file that serves as a permanent template for all languages.
* **Duplicate Detection:** Identifies identical strings across a file to ensure translation consistency and reduce API costs.

### **2\. Multi-Engine Translation Workflow**

* **Provider Switching:** Toggle between **DeepL** and **Google Translate** on the fly.  
* **State Persistence:** Translation statuses (Not Treated, Accurate, Corrected) are stored in a SQLite backend. Your progress and manual "Accurate" flags persist even after switching files or reloading.

### **3\. Real-Time Visual Comparison (Visual Mode)**

* **Side-by-Side Frames:** A dedicated "Visual Comparison" mode that renders the Original (EN), Spanish (ES), and French (FR) versions simultaneously in a 3-column grid.  
* **Hot-Reloading Previews:** When you save changes in the editor, the preview panes automatically refresh to show exactly how the new text fits within the live HTML layout.

### **4\. Translation Management**

* **Progress Tracking:** Sidebar indicators show the completion percentage of each file based on verified statuses.  
* **Engine Attribution:** Tracks which engine was used for each specific string (es\_engine, fr\_engine) for better quality auditing.  
* **Bulk Saving:** Optimized batch updates to the database to ensure high performance even with large translation sets.

### **5\. Automated File Export**

* **Suffix-Based Output:** Automatically generates and saves physical files with the correct language suffixes (e.g., index-es.html, index-fr.html) upon saving.  
* **Directory Management:** Organized output structure in output/translated_es/ and output/translated_fr/.

## **🛠 Tech Stack**

* **Frontend:** React, Tailwind CSS, Lucide Icons, Axios.  
* **Backend:** FastAPI (Python), SQLite, BeautifulSoup4.  
* **Environment:** Works on Linux.  

## **🏁 Getting Started**

1. **Backend:** 
Run the FastAPI from the /backend folder server via:
```bash
uvicorn main:app \--reload 
```
2. **Frontend:** 
Run from the root: 
```bash
npm start
```  
3. **Setup:** Place your source HTML files in the source\_html directory to begin the automated extraction process.
