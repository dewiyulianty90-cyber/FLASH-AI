import React, { useState } from 'react';
import { Edit3, Type as TypeIcon, FileText, Target as TargetIcon, RefreshCcw } from 'lucide-react';
import InputLabel from './InputLabel';

interface IndividualEditorProps {
  initialHook: string;
  initialBody: string;
  initialCTA: string;
  index: number;
  onReGenerateIndividual: (index: number, newTextData: { hook: string; bodyContent: string; ctaText: string }) => Promise<void>;
}

const IndividualEditor: React.FC<IndividualEditorProps> = ({ initialHook, initialBody, initialCTA, index, onReGenerateIndividual }) => {
  const [hook, setHook] = useState(initialHook);
  const [body, setBody] = useState(initialBody);
  const [cta, setCta] = useState(initialCTA);

  const handleUpdate = () => {
    void onReGenerateIndividual(index, { hook, bodyContent: body, ctaText: cta });
  };

  return (
    <div className="bg-gray-50/80 backdrop-blur-sm border-t border-gray-100 p-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-3 mb-2">
        <Edit3 size={18} className="text-indigo-600"/>
        <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Edit Teks Visual Ini</h4>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <InputLabel icon={TypeIcon}>Hook</InputLabel>
          <input 
            type="text" 
            value={hook} 
            onChange={(e) => setHook(e.target.value)} 
            className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3 text-xs font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-100" 
          />
        </div>
        <div>
          <InputLabel icon={FileText}>Body/Isi</InputLabel>
          <input 
            type="text" 
            value={body} 
            onChange={(e) => setBody(e.target.value)} 
            className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3 text-xs font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-100" 
          />
        </div>
        <div>
          <InputLabel icon={TargetIcon}>CTA</InputLabel>
          <input 
            type="text" 
            value={cta} 
            onChange={(e) => setCta(e.target.value)} 
            className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3 text-xs font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-100" 
          />
        </div>
      </div>
      <button 
        onClick={handleUpdate}
        className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]"
      >
        <RefreshCcw size={16}/> Update Teks Visual Ini (Tanpa Ubah Gambar)
      </button>
    </div>
  );
};

export default IndividualEditor;
