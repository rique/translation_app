import React from 'react';
import { FileText } from 'lucide-react';

const Sidebar = ({ files, selectedFile, loadFile, provider, setProvider }) => {
  return (
    <aside className="w-80 border-r border-slate-800 bg-slate-800/50 flex flex-col shrink-0">
      <div className="p-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-white">
          <FileText className="text-blue-400" /> Templates
        </h2>

        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700 mb-6">
          <label className="text-[10px] text-slate-500 uppercase font-black mb-2 block tracking-widest">Engine</label>
          <div className="flex bg-slate-800 p-1 rounded-lg">
            {['deepl', 'google'].map(p => (
              <button 
                key={p}
                onClick={() => setProvider(p)}
                className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${provider === p ? 'bg-blue-600 shadow-lg text-white' : 'text-slate-500'}`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2">
        {files.map((f, index) => {

          // We try to find the name in 'name' or 'file_name' or 'f' itself
          const displayName = f.name || f.file_name || (typeof f === 'string' ? f : "Unknown File");
          const displayProgress = f.progress ?? 0;

          return (
            <button 
              key={displayName + index} 
              onClick={() => loadFile(displayName)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedFile === displayName 
                  ? 'bg-blue-600 border-blue-400 shadow-xl' 
                  : 'bg-slate-800/40 border-slate-700 hover:border-slate-500'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm font-semibold truncate max-w-[150px] ${selectedFile === displayName ? 'text-white' : 'text-slate-200'}`}>
                  {displayName}
                </span>
                <span className="text-[10px] font-mono opacity-60 bg-slate-900 px-1.5 py-0.5 rounded text-white">
                  {displayProgress}%
                </span>
              </div>
              <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${displayProgress === 100 ? 'bg-emerald-400' : 'bg-blue-400'}`} 
                  style={{ width: `${displayProgress}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;