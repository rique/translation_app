To get this application running, you will need **Python 3.8+** and **Node.js** installed on your machine.

Follow these steps to set up the environment and install all necessary dependencies.

### 1. Backend Setup (Python & FastAPI)

Open your terminal in the `backend/` folder and run the following commands:

```bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn beautifulsoup4
```

* **fastapi**: The web framework for the API.
* **uvicorn**: The lightning-fast ASGI server to run the app.
* **beautifulsoup4**: Used for surgical extraction and skeleton creation of HTML.

### 2. Frontend Setup (React)

Open a new terminal window in the `frontend/` folder. If you haven't created the project yet, run the first command, otherwise just run the install:

```bash
# If starting from scratch, create the React app:
npx create-react-app .

# Install necessary UI and API dependencies:
npm install axios lucide-react
```

* **axios**: To handle HTTP requests to your Python backend.
* **lucide-react**: For professional-looking icons in your UI.

*(Optional: If you want to use the Tailwind CSS styling I included in the previous code, follow the [official Tailwind install guide](https://tailwindcss.com/docs/guides/create-react-app)).*

---

### 3. How to Run the App

Once everything is installed, you can start the system with these two commands:

**Start the Backend:**
Inside the `backend/` folder (with your virtual environment active):
```bash
uvicorn main:app --reload
```
The backend will be live at `http://localhost:8000`.

**Start the Frontend:**
Inside the `frontend/` folder:
```bash
npm start
```
The UI will open in your browser at `http://localhost:3000`.

---

### 4. Summary of Project Files

Make sure you have created the directory structure before running. Here is the final `requirements.txt` you can save in your backend folder for future use:

**`backend/requirements.txt`**
```text
fastapi==0.104.1
uvicorn==0.24.0
beautifulsoup4==4.12.2
python-multipart==0.0.6
```

**One final tip for your workflow:**
Before you start the backend for the first time, make sure you manually create the `storage/source`, `storage/skeletons`, and `storage/output` folders. The app expects those to exist to read your original files!