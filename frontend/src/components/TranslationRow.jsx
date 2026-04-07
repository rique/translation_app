import React from 'react';
import { Check, Edit3, Circle } from 'lucide-react';

const TranslationRow = ({ row, onUpdate }) => {
  const setStatus = (lang, newStatus) => {
    // We pass the current text and the NEW status back to App.js
    onUpdate(row.key, lang, row[lang], newStatus);
  };
  console.log('TranslationRow', {row});
  const statusConfig = {
    not_treated: { label: "MT", color: "text-slate-500 border-slate-700 bg-slate-800", icon: <Circle size={12}/> },
    accurate: { label: "Accurate", color: "text-emerald-400 border-emerald-500/50 bg-emerald-500/10", icon: <Check size={12}/> },
    corrected: { label: "Corrected", color: "text-blue-400 border-blue-500/50 bg-blue-500/10", icon: <Edit3 size={12}/> }
  };

  return (
    <div className={`p-6 rounded-2xl border transition-all ${
      row.es_status !== 'not_treated' && row.fr_status !== 'not_treated' 
      ? 'border-emerald-500/30 bg-emerald-500/5' 
      : 'border-slate-800 bg-slate-800/40'
    }`}>
      <div className="mb-4 text-white bg-slate-900/50 p-4 rounded-lg border border-slate-700/30 font-mono text-sm">
        {row.original}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {['es', 'fr'].map((lang) => {
          const currentStatus = row[`${lang}_status`] || 'not_treated';
          console.log('TranslationRow currentStatus', {currentStatus})
          return (
            <div key={lang} className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                  {lang === 'es' ? 'Spanish' : 'French'} 
                  <span className="ml-2 opacity-30 lowercase italic">via {row[`${lang}_engine`]}</span>
                </span>

                <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700/50">
                  {Object.keys(statusConfig).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(lang, s)}
                      className={`px-2 py-1 rounded-md text-[9px] font-bold transition-all flex items-center gap-1 ${
                        currentStatus === s ? statusConfig[s].color : 'text-slate-600 hover:text-slate-400'
                      }`}
                    >
                      {currentStatus === s && statusConfig[s].icon}
                      {s.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <textarea 
                className={`w-full bg-slate-900 border-2 p-4 rounded-xl text-sm outline-none transition-all text-white ${
                  currentStatus === 'not_treated' ? 'border-slate-800' : 
                  currentStatus === 'accurate' ? 'border-emerald-500/30' : 'border-blue-500/30'
                }`}
                value={row[lang] || ""}
                rows={3}
                onChange={(e) => onUpdate(row.key, lang, e.target.value, currentStatus)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TranslationRow; // Don't forget the export!