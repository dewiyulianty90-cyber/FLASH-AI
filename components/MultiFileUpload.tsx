import React, { useRef } from 'react';
import { Upload, Trash2, ImageIcon as DefaultImageIcon, Icon as LucideIcon } from 'lucide-react';
import InputLabel from './InputLabel';

interface MultiFileUploadProps {
  id: string;
  label: string;
  required?: boolean;
  icon?: LucideIcon;
  filesCount: number;
  onFilesChange: (id: string, e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  previews: string[];
  onRemove: (id: string, index: number) => void;
}

const MultiFileUpload: React.FC<MultiFileUploadProps> = ({ 
  id, label, required, icon: Icon = Upload, filesCount, onFilesChange, previews, onRemove 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleContainerClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <InputLabel icon={Icon}>{label} {required && '*'}</InputLabel>
        <span className="text-[9px] font-black text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100 shadow-sm">{filesCount || 0}</span>
      </div>
      <div 
        onClick={handleContainerClick} 
        className={`relative border-[2px] border-dashed rounded-[2rem] p-8 transition-all duration-500 bg-gray-50/50 hover:bg-purple-50/30 cursor-pointer group ${filesCount > 0 ? 'border-purple-500' : 'border-gray-200 hover:border-purple-400'}`}
      >
        <input 
          ref={fileInputRef} 
          type="file" 
          multiple 
          accept="image/*" 
          onChange={(e) => void onFilesChange(id, e)} 
          onClick={(e) => (e.currentTarget.value = '')} // Clear value to allow re-uploading same file
          className="hidden" 
        />
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-xl border border-gray-100 group-hover:scale-110 transition-transform">
            <Icon className="text-purple-600" size={28} />
          </div>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Klik untuk buka Galeri</p>
          <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase">Mendukung banyak foto sekaligus</p>
        </div>
      </div>
      {previews?.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mt-5">
          {previews.map((src, idx) => (
            <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-lg transition-all hover:scale-105">
              <img src={src} alt="Preview" className="w-full h-full object-cover" />
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); onRemove(id, idx); }} 
                className="absolute inset-0 bg-red-600/90 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-30"
              >
                <Trash2 size={20} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiFileUpload;
