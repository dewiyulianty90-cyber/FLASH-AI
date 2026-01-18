import React from 'react';
import { 
  CheckCircle, Megaphone, DownloadCloud, Copy, Sparkles, Code, Terminal, 
  Volume2, Film as MovieIcon 
} from 'lucide-react';
import { ResultsData, VideoScene } from '../types';
import { base64ToBlob, outputFormatter } from '../utils';
import IndividualEditor from './IndividualEditor';

interface ResultsViewProps {
  type: string;
  data: ResultsData;
  onImageClick: (image: string) => void;
  refining: boolean;
  onReGenerateIndividual: (index: number, newTextData: { hook: string; bodyContent: string; ctaText: string }) => Promise<void>;
}

const ResultsView: React.FC<ResultsViewProps> = ({ 
  type, data, onImageClick, onReGenerateIndividual 
}) => {
  const downloadImage = (url: string, name: string) => { 
    const blob = base64ToBlob(url); 
    if (!blob) return; 
    const urlObj = URL.createObjectURL(blob); 
    const link = document.createElement('a'); 
    link.href = urlObj; 
    link.download = `${name}.png`; 
    link.click(); 
    URL.revokeObjectURL(urlObj); // Clean up
  };

  const copyToClipboard = (text: string) => { 
    void navigator.clipboard.writeText(text).then(() => {
      // Optional: Add a subtle visual cue that text was copied
      console.log('Text copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers or if permission is denied
      const el = document.createElement('textarea'); 
      el.value = text; 
      document.body.appendChild(el); 
      el.select(); 
      document.execCommand('copy'); 
      document.body.removeChild(el); 
    });
  };

  if (type === 'prompt-creation' && data.perfectPrompt) {
    return (
      <div className="space-y-12">
        <div className="bg-white border border-purple-100 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
          <div className="flex justify-between items-center mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <Sparkles className="text-purple-600" size={24} />
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Perfect Visual Prompt</h3>
            </div>
            <button onClick={() => copyToClipboard(data.perfectPrompt || '')} className="p-3 bg-purple-600 text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all flex items-center gap-2 px-6 text-[10px] font-black uppercase tracking-widest">
              <Copy size={14}/> Copy Prompt
            </button>
          </div>
          <div className="p-8 bg-gray-50/50 rounded-[2.5rem] border border-gray-100 mb-8">
            <p className="text-sm text-gray-700 font-medium leading-relaxed italic">"{data.perfectPrompt}"</p>
          </div>
          <div className="flex justify-between items-center mb-6 mt-12">
            <div className="flex items-center gap-4">
              <Code className="text-indigo-600" size={24} />
              <h3 className="text-xl font-black text-gray-900 tracking-tight">JSON Prompt Schema</h3>
            </div>
            <button onClick={() => copyToClipboard(data.jsonPrompt || '')} className="p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all flex items-center gap-2 px-6 text-[10px] font-black uppercase tracking-widest">
              <Copy size={14}/> Copy JSON
            </button>
          </div>
          <pre className="bg-slate-900 text-slate-100 p-8 rounded-[2rem] text-xs font-mono overflow-auto leading-relaxed shadow-inner">
            <code>{data.jsonPrompt}</code>
          </pre>
        </div>
      </div>
    );
  }

  if (['image-generator', 'text-to-image', 'remove-bg', 'image-analysis', 'ads-creative'].includes(type) && (data.images || data.image)) {
    const imagesToDisplay = data.images || (data.image ? [data.image] : []);
    
    let adsHook = "", adsBody = "", adsCTA = "";
    if (type === 'ads-creative' && data.marketing) {
      const parts = data.marketing.split('\n\n');
      adsHook = parts[0]?.replace('Hook\n“', '').replace('”', '') || "";
      adsBody = parts[1]?.replace('Body/Isi Konten\n“', '').replace('”', '') || "";
      adsCTA = parts[2]?.replace('CTA\n“', '').replace('”', '') || "";
    }

    return (
      <div className="space-y-12">
        {data.masterPrompt && (
          <div className="bg-white border border-indigo-100 p-8 rounded-[3rem] shadow-xl relative overflow-hidden group">
             <div className="flex justify-between items-center mb-6 relative z-10">
               <div className="flex items-center gap-3">
                 <Terminal size={20} className="text-indigo-600" />
                 <h3 className="text-lg font-black text-gray-900 tracking-tight">Analyzed Identity DNA</h3>
               </div>
               <button onClick={() => copyToClipboard(data.masterPrompt || '')} className="p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all flex items-center gap-2 px-5 text-[10px] font-black uppercase tracking-widest">
                 <Copy size={14}/> Copy Identity
               </button>
             </div>
             <p className="text-xs font-mono text-indigo-900 leading-relaxed bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 relative z-10 italic">"{data.masterPrompt}"</p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-5">
            <CheckCircle size={32} /> Visual Result Ready
          </h3>
          <button 
            onClick={() => imagesToDisplay.forEach((img, i) => setTimeout(() => downloadImage(img, `flash-result-${i+1}`), i * 400))} 
            className="flex items-center gap-4 bg-gray-900 text-white px-10 py-5 rounded-full font-bold text-[10px] uppercase tracking-widest active:scale-95 shadow-2xl"
          >
            <DownloadCloud size={20} /> Simpan Semua
          </button>
        </div>
        <div className="flex flex-col gap-16">
          {imagesToDisplay.map((img, idx) => (
            <div key={idx} className="group relative rounded-[4rem] overflow-hidden border border-gray-100 bg-white shadow-2xl transition-all duration-700 hover:-translate-y-2 flex flex-col">
              <div className="relative aspect-auto min-h-[400px]">
                <img src={img} alt="Result" className="w-full h-full object-contain bg-gray-50" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 backdrop-blur-sm">
                  <button onClick={() => onImageClick(img)} className="flex items-center gap-4 bg-white text-gray-900 px-10 py-4 rounded-full font-bold text-[10px] uppercase hover:scale-110 transition-transform">Pratinjau</button>
                  <button onClick={() => downloadImage(img, `flash-ai-result-${idx+1}`)} className="flex items-center gap-4 bg-purple-600 text-white px-10 py-4 rounded-full font-bold text-[10px] uppercase hover:scale-110 active:scale-90 transition-all">Simpan PNG</button>
                </div>
                <div className="absolute top-8 left-8 bg-black/90 backdrop-blur-md px-5 py-2.5 rounded-2xl text-[10px] text-white font-black uppercase tracking-widest shadow-2xl border border-white/20">Result {idx+1}</div>
              </div>
              
              {/* ✨ Per-Visual Individual Editor for Ads Creative */}
              {type === 'ads-creative' && !data.featureData.noText && (
                <IndividualEditor 
                  initialHook={adsHook} 
                  initialBody={adsBody} 
                  initialCTA={adsCTA} 
                  index={idx}
                  onReGenerateIndividual={onReGenerateIndividual}
                />
              )}
            </div>
          ))}
        </div>
        {data.marketing && (
          <div className="bg-white border border-purple-100 p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group">
            <h3 className="text-2xl font-bold text-gray-900 mb-10 flex items-center gap-5 relative z-10">
              <Megaphone size={28} /> Blueprint Strategi Viral
            </h3>
            {/* Fix: Updated rendering to consume the new outputFormatter return type */}
            <div className="prose prose-purple max-w-none text-gray-700 text-base whitespace-pre-wrap leading-[1.8] relative z-10 border-l-[12px] border-purple-50 pl-10 py-2">
              {outputFormatter(data.marketing)?.map((item, i) => (
                <p 
                  key={i} 
                  className={item.isHeader ? "font-bold text-purple-900 mt-8 mb-2 text-lg tracking-tight border-b border-purple-50 pb-1 uppercase" : "mb-1 text-[15px] text-gray-700 font-normal leading-relaxed"}
                >
                  {item.text}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (type === 'video-prompt' && data.videoScenes) {
    return (
      <div className="space-y-12">
        <div className="bg-white border border-purple-100 p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group">
          <div className="flex items-center gap-5 mb-8 relative z-10">
            <MovieIcon size={28} className="text-purple-600" />
            <h3 className="text-2xl font-bold text-gray-900">Video Storyboard Prompts</h3>
          </div>
          <div className="space-y-10 relative z-10">
            {data.videoScenes.map((scene: VideoScene, idx: number) => (
              <div key={idx} className="p-8 bg-gray-50/50 rounded-[3rem] border border-gray-100 transition-all hover:bg-white hover:shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <span className="bg-purple-600 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Adegan {scene.sceneNumber}</span>
                  <button onClick={() => copyToClipboard(scene.videoPromptEN)} className="p-3 bg-white text-gray-400 hover:text-purple-600 rounded-full border border-gray-100 shadow-sm transition-all">
                    <Copy size={16}/>
                  </button>
                </div>
                <div className="space-y-6">
                  <div>
                    <span className="text-[9px] font-black text-purple-600 uppercase tracking-widest block mb-2">Visual Prompt (English)</span>
                    <p className="text-xs font-mono text-gray-600 leading-relaxed bg-white p-5 rounded-2xl border border-purple-50">{scene.videoPromptEN}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block mb-2">Prompt Visual (Bahasa Indonesia)</span>
                    <p className="text-xs text-gray-700 leading-relaxed bg-white p-5 rounded-2xl border border-indigo-50">{scene.videoPromptID}</p>
                  </div>
                  {scene.narrationID && (
                    <div>
                      <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest block mb-1">Naskah VoiceOver (VO)</span>
                      <p className="text-[14px] text-gray-700 font-black leading-relaxed italic bg-rose-50/30 p-4 rounded-xl border border-rose-100">“{scene.narrationID}”</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'copywriter' && data.marketing) {
    return (
      <div className="bg-white border border-purple-100 p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group">
        <h3 className="text-2xl font-bold text-gray-900 mb-10 flex items-center gap-5 relative z-10">
          <Megaphone size={28} /> Hasil Copywriting Profesional
        </h3>
        {/* Fix: Updated rendering to consume the new outputFormatter return type */}
        <div className="prose prose-purple max-w-none text-gray-700 text-base whitespace-pre-wrap leading-[1.8] relative z-10 border-l-[12px] border-purple-50 pl-10 py-2">
          {outputFormatter(data.marketing)?.map((item, i) => (
            <p 
              key={i} 
              className={item.isHeader ? "font-bold text-purple-900 mt-8 mb-2 text-lg tracking-tight border-b border-purple-50 pb-1 uppercase" : "mb-1 text-[15px] text-gray-700 font-normal leading-relaxed"}
            >
              {item.text}
            </p>
          ))}
        </div>
        <div className="mt-10 flex gap-4 relative z-10">
          <button 
            onClick={() => copyToClipboard(data.marketing || '')} 
            className="bg-purple-600 text-white px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg flex items-center gap-2"
          >
            <Copy size={14} /> Salin Teks
          </button>
        </div>
      </div>
    );
  }

  if (type === 'tts' && data.audioUrl) {
    return (
      <div className="flex flex-col items-center py-12 bg-white rounded-[4rem] shadow-2xl border border-purple-100 animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-purple-100 rounded-3xl flex items-center justify-center text-purple-600 mb-8 shadow-inner">
          <Volume2 size={40} className="animate-pulse" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-tighter">Audio Berhasil Dibuat</h3>
        <audio controls src={data.audioUrl} className="w-full max-w-md mb-8 shadow-sm" />
        <button 
          onClick={() => { 
            const link = document.createElement('a'); 
            link.href = data.audioUrl || ''; 
            link.download = "flash-voice.wav"; 
            link.click(); 
          }} 
          className="flex items-center gap-4 bg-gray-900 text-white px-12 py-5 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
        >
          <DownloadCloud size={20} /> Download Audio
        </button>
      </div>
    );
  }

  return null;
}

export default ResultsView;