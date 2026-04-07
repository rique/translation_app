import React from 'react';

const PreviewPane = ({ title, lang, file, lastSaved }) => {
  // We use the lastSaved timestamp to force the iframe to reload 
  // when the user hits the "Save" button in the parent App.jsx
  const previewUrl = `http://localhost:8000/preview/${file}/${lang}?t=${lastSaved}`;

  return (
    <div className="flex flex-col h-full border border-slate-800 rounded-xl overflow-hidden bg-white shadow-2xl">
      {/* Header Label */}
      <div className={`text-[10px] text-white p-2 font-black uppercase tracking-widest ${
        lang === 'original' ? 'bg-slate-800' : 
        lang === 'es' ? 'bg-amber-600' : 'bg-cyan-600'
      }`}>
        {title}
      </div>

      {/* The Visual Frame */}
      <div className="flex-1 bg-slate-100 relative">
        <iframe 
          src={previewUrl} 
          className="w-full h-full border-none"
          title={`Preview ${lang}`}
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default PreviewPane;