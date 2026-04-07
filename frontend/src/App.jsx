import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Globe, Loader2, AlertTriangle, RefreshCcw } from 'lucide-react';
import Sidebar from './components/Sidebar';
import TranslationRow from './components/TranslationRow';
import PreviewPane from './components/PreviewPane';

const API_BASE = "http://localhost:8000";

function App() {
	const [files, setFiles] = useState([]);
	const [selectedFile, setSelectedFile] = useState("");
	const [rows, setRows] = useState([]);
	const [loading, setLoading] = useState(false);
	const [saveStatus, setSaveStatus] = useState("");
	const [provider, setProvider] = useState("deepl");
	const [error, setError] = useState(null);
	const [viewMode, setViewMode] = useState("edit");
	const [lastSaved, setLastSaved] = useState(Date.now());

	useEffect(() => { fetchFiles(); }, []);

	const fetchFiles = async () => {
		try {
			const res = await axios.get(`${API_BASE}/files`);
			setFiles(res.data);
		} catch (err) { console.error("Backend unreachable"); }
	};

	const loadFile = async (name) => {
		if (!name) return;
		setLoading(true);
		setSelectedFile(name);
		setError(null);
    
		try {
			const res = await axios.get(`${API_BASE}/files/${name}/strings?provider=${provider}`);
			console.log('loadfiles', {data: res.data});
			// CRITICAL: Ensure the map includes all fields from the DB
			const mappedRows = res.data.map(row => ({
				...row,
				// Fallback to 'not_treated' if for some reason the DB field is null
				es_status: row.es_status || 'not_treated',
				fr_status: row.fr_status || 'not_treated',
				es_engine: row.es_engine || provider,
				fr_engine: row.fr_engine || provider
			}));
      
			setRows(mappedRows);
		} catch (err) {
			setError("Failed to load file strings.");
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async () => {
		setSaveStatus("Saving...");
  
		const payload = {};
		rows.forEach(r => {
			payload[r.key] = {
				es: r.es,
				fr: r.fr,
				es_status: r.es_status,
				fr_status: r.fr_status
			};
		});

		try {
			await axios.post(`${API_BASE}/files/${selectedFile}/save`, payload);
			setSaveStatus("Saved!");
			setLastSaved(Date.now()); // Update timestamp to refresh previews
			// Refresh sidebar to update the progress bar based on new DB values
			fetchFiles();

			// Clear the message after 3 seconds
			setTimeout(() => {
				setSaveStatus("");
			}, 3000);
		} catch (err) {
			setSaveStatus("Error!");
			setTimeout(() => setSaveStatus(""), 3000);
		}
	};

	const handleRerun = async () => {
		if (!window.confirm(`This will wipe all current translations for ${selectedFile} and rerun the ${provider} engine. Continue?`)) {
			return;
		}

		setLoading(true);
		try {
			await axios.post(`${API_BASE}/files/${selectedFile}/rerun?provider=${provider}`);
			// Reload the strings to show the new engine results
			await loadFile(selectedFile); 
			// Refresh sidebar progress (which will now be 0%)
			fetchFiles(); 
		} catch (err) {
			setError("Failed to rerun translation");
		} finally {
			setLoading(false);
		}
	};

	const updateRow = (key, lang, textValue, statusValue) => {
		setRows(prev => prev.map(r => 
			r.key === key 
			? { ...r, [lang]: textValue, [`${lang}_status`]: statusValue } 
			: r
		));
	};

	return (
		<div className="flex h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
			<Sidebar 
				files={files} 
				selectedFile={selectedFile} 
				loadFile={loadFile} 
				provider={provider} 
				setProvider={setProvider} 
			/>

			<main className="flex-1 flex flex-col min-w-0">
				{selectedFile ? (
					<>
						{/* RESTORED HEADER WITH BUTTONS */}
						<header className="h-20 border-b border-slate-800 flex justify-between items-center px-8 bg-slate-900/50 shrink-0">
							<div className="truncate pr-4">
								<h1 className="text-xl font-bold truncate text-white">{selectedFile}</h1>
								<p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
									Current Engine: <span className="text-blue-400 font-bold">{provider}</span>
								</p>
							</div>

							<div className="flex items-center gap-4 shrink-0">
								<span className="text-sm font-medium text-emerald-400 mr-2">{saveStatus}</span>

								<button 
									onClick={handleRerun}
									disabled={loading}
									className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-all border border-slate-700 disabled:opacity-50 text-xs font-bold"
								>
									<RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
									RERUN ENGINE
								</button>

								<button 
									onClick={handleSave}
									disabled={loading}
									className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 px-8 py-2.5 rounded-xl font-bold shadow-lg transition-all active:scale-95 text-xs text-white"
								>
									SAVE CHANGES
								</button>
							</div>
						</header>

						{/* VIEW TOGGLE */}
						<div className="flex bg-slate-900/80 border-b border-slate-800 p-2 gap-2 shrink-0 px-8">
							<button 
								onClick={() => setViewMode("edit")}
								className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
									viewMode === 'edit' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800'
								}`}
							>
								String Editor
							</button>
							<button 
								onClick={() => setViewMode("visual")}
								className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
									viewMode === 'visual' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800'
								}`}
							>
								Visual Comparison
							</button>
						</div>

						{/* CONTENT AREA */}
						<div className="flex-1 overflow-hidden relative">
							{loading ? (
								<div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
									<Loader2 className="animate-spin text-blue-500" size={40} />
									<p>Calling {provider.toUpperCase()}...</p>
								</div>
							) : error ? (
								<div className="flex flex-col items-center justify-center h-full">
									<AlertTriangle className="text-red-500 mb-4" size={48} />
									<p className="font-bold mb-4">{error}</p>
									<button onClick={() => {setProvider("google"); setError(null);}} className="bg-slate-700 px-6 py-2 rounded-lg text-sm">Switch to Google</button>
								</div>
							) : (
								<>
									{viewMode === "edit" && (
										<div className="h-full overflow-y-auto p-8 space-y-8">
											{rows.map((row) => (
												<TranslationRow 
													key={row.key} 
													row={row} 
													onUpdate={updateRow} 
												/>
											))}
										</div>
									)}

									{viewMode === "visual" && (
										<div className="h-full grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-950 overflow-hidden">
											<PreviewPane title="Original (EN)" lang="original" file={selectedFile} lastSaved={lastSaved} />
											<PreviewPane title="Spanish (ES)" lang="es" file={selectedFile} lastSaved={lastSaved} />
											<PreviewPane title="French (FR)" lang="fr" file={selectedFile} lastSaved={lastSaved} />
										</div>
									)}
								</>
							)}
						</div>
					</>
				) : (
					<div className="flex-1 flex flex-col items-center justify-center opacity-10">
						<Globe size={120} />
						<p className="text-2xl font-bold mt-4">Select Template</p>
					</div>
				)}
			</main>
		</div>
	);
}

export default App;