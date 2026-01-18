import React, { useState, useRef } from 'react';
import { X, Crop } from 'lucide-react';
import { CropTarget } from '../types';

interface CropModalProps {
  image: string;
  onCancel: () => void;
  onSave: CropTarget['callback'];
}

const CropModal: React.FC<CropModalProps> = ({ image, onCancel, onSave }) => {
  const [crop, setCrop] = useState({ x: 10, y: 10, width: 80, height: 80 });
  const [activeRatio, setActiveRatio] = useState('Free');
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const ratios = [
    { label: 'Free', val: null },
    { label: '1:1', val: 1 },
    { label: '4:5', val: 0.8 },
    { label: '9:16', val: 0.5625 },
    { label: '16:9', val: 1.777 }
  ];

  const handleRatioClick = (r: typeof ratios[0]) => {
    setActiveRatio(r.label);
    if (!r.val || !imgRef.current || !containerRef.current) return;

    const img = imgRef.current;
    const imgNaturalWidth = img.naturalWidth;
    const imgNaturalHeight = img.naturalHeight;
    const imgAspect = imgNaturalWidth / imgNaturalHeight;

    // Calculate crop dimensions based on the new ratio
    // We want the crop box to fit within the image preview
    let newWidth = crop.width; // Start with current width
    let newHeight = newWidth / r.val; // Calculate height based on ratio

    // Adjust if height or width go beyond bounds
    if (newHeight > 90) { // If calculated height is too large
        newHeight = 90; // Clamp height
        newWidth = newHeight * r.val; // Recalculate width
    }
    if (newWidth > 90) { // If calculated width is too large after height adjustment
        newWidth = 90; // Clamp width
        newHeight = newWidth / r.val; // Recalculate height
    }
    
    // Ensure minimum size
    newWidth = Math.max(10, newWidth);
    newHeight = Math.max(10, newHeight);

    // Center the crop box
    const newX = (100 - newWidth) / 2;
    const newY = (100 - newHeight) / 2;

    setCrop({ x: newX, y: newY, width: newWidth, height: newHeight });
  };

  const handleMouseDown = (e: React.MouseEvent, isResize: boolean = false) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startCrop = { ...crop };
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const imageElement = imgRef.current;
    const imgAspect = imageElement ? imageElement.naturalWidth / imageElement.naturalHeight : 1;
    const selectedRatio = ratios.find(r => r.label === activeRatio)?.val;

    const handleMouseMove = (mv: MouseEvent) => {
      const dx = ((mv.clientX - startX) / containerRect.width) * 100;
      const dy = ((mv.clientY - startY) / containerRect.height) * 100;

      if (isResize) {
        let newWidth = startCrop.width + dx;
        let newHeight = startCrop.height + dy;

        if (selectedRatio) {
          // Maintain aspect ratio during resize
          if (Math.abs(dx) > Math.abs(dy)) {
            newHeight = (newWidth / imgAspect) / selectedRatio;
          } else {
            newWidth = (newHeight * selectedRatio) * imgAspect;
          }
        }
        
        // Clamp to boundaries and minimum size
        newWidth = Math.max(10, Math.min(100 - startCrop.x, newWidth));
        newHeight = Math.max(10, Math.min(100 - startCrop.y, newHeight));
        
        setCrop(prev => ({ ...prev, width: newWidth, height: newHeight }));
      } else {
        // Move crop box
        setCrop(prev => ({
          ...prev,
          x: Math.max(0, Math.min(100 - prev.width, startCrop.x + dx)),
          y: Math.max(0, Math.min(100 - prev.height, startCrop.y + dy))
        }));
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const applyCrop = () => {
    const canvas = document.createElement('canvas');
    const img = imgRef.current;
    if (!img) return;

    // Calculate actual pixel values from percentage crop
    const scaleX = img.naturalWidth / 100;
    const scaleY = img.naturalHeight / 100;

    const cropXPx = crop.x * scaleX;
    const cropYPx = crop.y * scaleY;
    const cropWidthPx = crop.width * scaleX;
    const cropHeightPx = crop.height * scaleY;

    canvas.width = cropWidthPx;
    canvas.height = cropHeightPx;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(
        img,
        cropXPx,
        cropYPx,
        cropWidthPx,
        cropHeightPx,
        0,
        0,
        canvas.width,
        canvas.height
      );
      onSave(canvas.toDataURL('image/png'));
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
            <Crop size={18}/> Sesuaikan Potongan
          </h3>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-all">
            <X size={20}/>
          </button>
        </div>
        <div className="px-8 pt-6 flex flex-wrap gap-2 justify-center">
          {ratios.map(r => (
            <button 
              key={r.label} 
              onClick={() => handleRatioClick(r)} 
              className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border ${activeRatio === r.label ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-purple-200'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="relative p-8 bg-gray-50 flex items-center justify-center" ref={containerRef}>
          <div className="relative inline-block overflow-hidden shadow-xl rounded-xl">
            <img ref={imgRef} src={image} alt="Crop" className="max-h-[50vh] block select-none pointer-events-none" />
            <div 
              onMouseDown={(e) => handleMouseDown(e, false)} 
              className="absolute border-2 border-purple-600 bg-purple-600/10 cursor-move shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" 
              style={{ top: `${crop.y}%`, left: `${crop.x}%`, width: `${crop.width}%`, height: `${crop.height}%` }}
            >
              <div 
                onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, true); }} 
                className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-600 rounded-full cursor-se-resize border-2 border-white shadow-md z-10"
              ></div>
            </div>
          </div>
        </div>
        <div className="p-8 flex gap-4">
          <button onClick={onCancel} className="flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-gray-500 border border-gray-100 hover:bg-gray-50 transition-all">Batal</button>
          <button onClick={applyCrop} className="flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-purple-600 text-white shadow-xl hover:scale-105 active:scale-95 transition-all">Simpan Potongan</button>
        </div>
      </div>
    </div>
  );
};

export default CropModal;
