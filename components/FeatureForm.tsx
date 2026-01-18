import React, { useState } from 'react';
import { 
  Loader2, Sparkles, Languages, PenTool, Users, Smartphone as MobileIcon, Goal, GitBranch, Anchor,
  ImageIcon, Target, PackageOpen, Camera, Palette, ImagePlus, Ratio, Type as TypeIcon,
  Box, MapPin, Lightbulb, UserCircle, UserPlus, Clapperboard, Crop, Film as MovieIcon,
  Layers, FileText, Repeat // Added missing imports
} from 'lucide-react';
import InputLabel from './InputLabel';
import MultiChipField from './MultiChipField';
import MultiFileUpload from './MultiFileUpload';
import { FormData, CropTarget } from '../types';
import {
  HOOK_TYPES, GENDER_VOICES, MOOD_TYPES, VIDEO_GENRES, TEXT_TO_IMAGE_GENRES, 
  ANALYSIS_CHARACTERS, ANALYSIS_CAMERA_ANGLES, ANALYSIS_AESTHETICS, 
  ANALYSIS_POSES, ANALYSIS_BACKGROUNDS, ANALYSIS_UMKM_ANGLES, 
  ADS_CATEGORIES, ADS_BACKGROUNDS, ADS_ANGLES, COPY_FLOWS, 
  COPY_PLATFORMS, COPY_OBJECTIVES 
} from '../constants';
import { getWordCount } from '../utils';

interface FeatureFormProps {
  type: string;
  onSubmit: (data: FormData) => Promise<void>;
  loading: boolean;
  onCropRequest: (image: string, callback: CropTarget['callback']) => void;
  toggleMultiSelect: (key: keyof FormData, value: string, currentFormData: FormData, setFormData: React.Dispatch<React.SetStateAction<FormData>>) => void;
}

const FeatureForm: React.FC<FeatureFormProps> = ({ 
  type, onSubmit, loading, onCropRequest, toggleMultiSelect 
}) => {
  const [formData, setFormData] = useState<FormData>({
    cameraAngle: [], visualStyle: [], pose: [], environment: "", quantity: "4", 
    aspectRatio: "1:1", brandName: "", character: [], images: [], modelPhotos: [], 
    backgroundImages: [], detailedPrompt: "", detailedPromptBg: "", bgColor: "", 
    script: "", voiceType: "Wanita", voiceMood: "Profesional", genre: "Cinematic Movie", 
    productAngleUmkm: [], hookType: "Curiosity Hook", mode: "Banner", language: "Indonesia", 
    category: "Skincare & Cosmetics", customCategory: "", bgCategory: "Putih Bersih (Fokus Maksimal)", 
    logoPhotos: [], productName: "", headline: "", subheadline: "", ctaText: "", 
    additionalInfo: "", noText: false, includeVO: false, targetAudience: "", 
    platform: "TikTok", objective: "Penjualan", copyFlow: "AIDA (Attention, Interest, Desire, Action)", 
    manualHeadline: "", manualSubheadline: "", manualCTA: "", selectedAngles: []
  });
  const [previews, setPreviews] = useState<{ [key: string]: string[] }>({ 
    images: [], modelPhotos: [], backgroundImages: [], logoPhotos: [] 
  });

  // Fix: Explicitly type 'file' as 'File' to ensure 'name' property is recognized and resolve the 'unknown' type issue.
  const handleFilesChange = async (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const readPromises = files.map((file: File) => new Promise<string>((res) => {
      const r = new FileReader();
      // Ensure r.result is a string before resolving the promise
      r.onloadend = () => {
        if (typeof r.result === 'string') {
          res(r.result);
        } else {
          console.error("FileReader result was not a string for", file.name, r.result);
          res(''); // This 'res('')' is a string and does not relate to Blob.
        }
      };
      r.readAsDataURL(file);
    }));
    const newResults = await Promise.all(readPromises);

    // Assert key as keyof FormData for type safety when accessing formData properties
    const typedKey = key as keyof FormData; 
    setFormData(prev => ({ ...prev, [typedKey]: [...((prev[typedKey] as string[]) || []), ...newResults] }));
    setPreviews(prev => ({ ...prev, [typedKey]: [...(prev[typedKey] || []), ...newResults] }));
  };

  const removeFile = (key: keyof FormData, index: number) => {
    setFormData(prev => ({ ...prev, [key]: (prev[key] as string[]).filter((_, i) => i !== index) }));
    setPreviews(prev => ({ ...prev, [key]: (prev[key] || []).filter((_, i) => i !== index) }));
  };

  const handleInputChange = (key: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void onSubmit(formData); // Call onSubmit, let it handle loading states
  };

  if (type === 'copywriter') {
    return (
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <InputLabel icon={PenTool}>Produk / Jasa</InputLabel>
          <textarea 
            value={formData.script} 
            onChange={(e) => handleInputChange('script', e.target.value)} 
            className="w-full bg-white border border-purple-100 rounded-[1.5rem] px-6 py-4 text-[11px] font-black shadow-inner h-32 outline-none resize-none transition-all" 
            placeholder="Ide produk..." 
            required 
          />
          <InputLabel icon={Users}>Target Audiens</InputLabel>
          <input 
            type="text" 
            value={formData.targetAudience} 
            onChange={(e) => handleInputChange('targetAudience', e.target.value)} 
            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-semibold outline-none" 
            placeholder="Target audiens..." 
            required 
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <InputLabel icon={MobileIcon}>Platform</InputLabel>
              <select 
                value={formData.platform} 
                onChange={(e) => handleInputChange('platform', e.target.value)} 
                className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-semibold outline-none"
              >
                {COPY_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <InputLabel icon={Goal}>Tujuan</InputLabel>
              <select 
                value={formData.objective} 
                onChange={(e) => handleInputChange('objective', e.target.value)} 
                className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-semibold outline-none"
              >
                {COPY_OBJECTIVES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <InputLabel icon={GitBranch}>Alur Copywriting</InputLabel>
          <select 
            value={formData.copyFlow} 
            onChange={(e) => handleInputChange('copyFlow', e.target.value)} 
            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-semibold outline-none"
          >
            {COPY_FLOWS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <InputLabel icon={Anchor}>Jenis Hook Utama</InputLabel>
          <select 
            value={formData.hookType} 
            onChange={(e) => handleInputChange('hookType', e.target.value)} 
            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-semibold outline-none"
          >
            {HOOK_TYPES.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-gradient-to-br from-purple-700 to-indigo-800 text-white font-bold py-6 rounded-[2.5rem] transition-all shadow-xl flex items-center justify-center gap-4 mt-10 uppercase tracking-[0.2em] text-[11px]"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <><Languages size={20} /> Ignite Copywriter</>}
        </button>
      </form>
    );
  }

  if (type === 'ads-creative') {
    const headlineWords = getWordCount(formData.headline);
    const subheadlineWords = getWordCount(formData.subheadline);
    const ctaWords = getWordCount(formData.ctaText);

    return (
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <InputLabel icon={MobileIcon}>Mode & Bahasa</InputLabel>
          <div className="grid grid-cols-2 gap-4">
            <select value={formData.mode} onChange={(e) => handleInputChange('mode', e.target.value)} className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-semibold outline-none">
              <option value="Banner">Mode Banner</option>
              <option value="Aset Polos">Mode Aset Polos</option>
            </select>
            <select value={formData.language} onChange={(e) => handleInputChange('language', e.target.value)} className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-semibold outline-none">
              <option value="Indonesia">Bahasa Indonesia</option>
              <option value="English">English</option>
            </select>
          </div>
        </div>
        <div className="space-y-4">
          <InputLabel icon={ImageIcon}>Aset Visual</InputLabel>
          <MultiFileUpload 
            id="images" 
            label="Upload Foto Produk (Wajib)" 
            required 
            icon={ImageIcon} 
            filesCount={formData.images.length} 
            onFilesChange={handleFilesChange} 
            previews={previews.images} 
            onRemove={removeFile} 
          />
          <MultiFileUpload 
            id="logoPhotos" 
            label="Upload Logo (Optional)" 
            icon={Target} 
            filesCount={formData.logoPhotos.length} 
            onFilesChange={handleFilesChange} 
            previews={previews.logoPhotos} 
            onRemove={removeFile} 
          />
        </div>
        <div className="space-y-4">
          <div>
            <InputLabel icon={PackageOpen}>Kategori Produk</InputLabel>
            <select 
              value={formData.category} 
              onChange={(e) => handleInputChange('category', e.target.value)} 
              className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-semibold outline-none"
            >
              {ADS_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            {formData.category === 'Others/Lainnya' && (
              <input 
                type="text" 
                value={formData.customCategory} 
                onChange={(e) => handleInputChange('customCategory', e.target.value)} 
                className="mt-3 w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-medium outline-none" 
                placeholder="Tulis kategori produk..." 
              />
            )}
          </div>
          
          <MultiChipField 
            id="selectedAngles" 
            label="Sudut Pandang (Angles)" 
            icon={Camera} 
            options={ADS_ANGLES} 
            selectedValues={formData.selectedAngles} 
            onToggle={(k, v) => toggleMultiSelect(k as keyof FormData, v, formData, setFormData)} 
            max={12} 
          />
          
          <div>
            <InputLabel icon={Palette}>Kategori Background</InputLabel>
            <select 
              value={formData.bgCategory} 
              onChange={(e) => handleInputChange('bgCategory', e.target.value)} 
              className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-semibold outline-none"
            >
              {ADS_BACKGROUNDS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>
          <div className="bg-purple-50/50 p-6 rounded-[2.5rem] border border-purple-100 space-y-6">
            <InputLabel icon={ImagePlus}>Upload Background Khusus</InputLabel>
            <MultiFileUpload 
              id="backgroundImages" 
              label="Manual BG" 
              icon={ImageIcon} 
              filesCount={formData.backgroundImages.length} 
              onFilesChange={handleFilesChange} 
              previews={previews.backgroundImages} 
              onRemove={removeFile} 
            />
            <InputLabel icon={PenTool}>Text Detail Background (Optional)</InputLabel>
            <textarea 
              value={formData.detailedPromptBg} 
              onChange={(e) => handleInputChange('detailedPromptBg', e.target.value)} 
              className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-medium outline-none h-20 resize-none" 
              placeholder="Masukkan detail background..." 
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <InputLabel icon={Layers}>Output Images</InputLabel>
            <select 
              value={formData.quantity} 
              onChange={(e) => handleInputChange('quantity', e.target.value)} 
              className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-semibold outline-none"
            >
              {['2','4','6','8','12','16'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <InputLabel icon={Ratio}>Ratio Media Sosial</InputLabel>
            <select 
              value={formData.aspectRatio} 
              onChange={(e) => handleInputChange('aspectRatio', e.target.value)} 
              className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-semibold outline-none"
            >
              {['1:1','4:5','9:16','16:9'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
        
        <div className="space-y-4">
          <InputLabel icon={Sparkles}>IDE / KONSEP MENTAH (Sangat Detail)</InputLabel>
          <textarea 
            value={formData.detailedPrompt} 
            onChange={(e) => handleInputChange('detailedPrompt', e.target.value)} 
            className="w-full bg-white border border-purple-100 rounded-[1.25rem] px-6 py-4 text-[11px] font-black shadow-inner h-32 outline-none transition-all border-dashed" 
            placeholder="Masukkan perintah detail agar visual sangat realistis..." 
          />
        </div>
        
        <div className="space-y-6">
          <h4 className="text-[10px] font-black text-purple-900 uppercase tracking-widest border-b border-purple-100 pb-2">Produk & Fitur Utama</h4>
          
          <div className="space-y-4">
            <InputLabel icon={PackageOpen}>Nama Produk</InputLabel>
            <input 
              type="text" 
              value={formData.productName} 
              onChange={(e) => handleInputChange('productName', e.target.value)} 
              className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-medium outline-none shadow-inner" 
              placeholder="Nama Produk..." 
            />
          </div>

          <div className="space-y-4">
            <InputLabel icon={TypeIcon}>Headline (Hook)</InputLabel>
            <input 
              type="text" 
              value={formData.headline} 
              onChange={(e) => handleInputChange('headline', e.target.value)} 
              className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-medium outline-none shadow-inner" 
              placeholder="Headline (Hook)..." 
            />
            <p className={`text-[9px] font-bold px-1 transition-colors ${headlineWords > 4 ? 'text-rose-500' : 'text-gray-400'}`}>
              {headlineWords > 4 ? "⚠️ Teks terlalu panjang. Gunakan maksimal 4 kata untuk hasil visual terbaik." : "Disarankan 2–4 kata agar teks terlihat jelas dan tidak typo pada visual."}
            </p>
          </div>

          <div className="space-y-4">
            <InputLabel icon={FileText}>Subheadline (Isi Konten)</InputLabel>
            <input 
              type="text" 
              value={formData.subheadline} 
              onChange={(e) => handleInputChange('subheadline', e.target.value)} 
              className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-medium outline-none shadow-inner" 
              placeholder="Subheadline (Isi Konten)..." 
            />
            <p className={`text-[9px] font-bold px-1 transition-colors ${subheadlineWords > 7 ? 'text-rose-500' : 'text-gray-400'}`}>
              {subheadlineWords > 7 ? "⚠️ Teks terlalu panjang dan berisiko typo pada visual." : "Gunakan 3–5 kata untuk hasil paling aman dan mudah dibaca. Maksimal 7 kata."}
            </p>
          </div>

          <div className="space-y-4">
            <InputLabel icon={Target}>CTA (Tombol Aksi)</InputLabel>
            <input 
              type="text" 
              value={formData.ctaText} 
              onChange={(e) => handleInputChange('ctaText', e.target.value)} 
              className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-medium outline-none shadow-inner" 
              placeholder="Tombol CTA..." 
            />
            <p className={`text-[9px] font-bold px-1 transition-colors ${ctaWords > 2 ? 'text-rose-500' : 'text-gray-400'}`}>
              {ctaWords > 2 ? "⚠️ CTA terlalu panjang. Gunakan 1–2 kata saja." : "Maksimal 1–2 kata agar terlihat seperti tombol dan mudah dibaca."}
            </p>
          </div>

          <textarea 
            value={formData.additionalInfo} 
            onChange={(e) => handleInputChange('additionalInfo', e.target.value)} 
            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-medium outline-none h-20 resize-none shadow-inner" 
            placeholder="Fitur Utama / Info Tambahan..." 
          />
          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-purple-50 transition-all border border-gray-100 shadow-sm">
            <input 
              type="checkbox" 
              checked={formData.noText} 
              onChange={(e) => handleInputChange('noText', e.target.checked)} 
              className="w-5 h-5 accent-purple-600" 
            />
            <span className="text-[11px] font-bold text-gray-700">Buat banner tanpa teks (Hanya Gambar)</span>
          </label>
        </div>
        <button 
          type="submit" 
          disabled={loading || formData.images.length === 0} 
          className="w-full bg-gradient-to-br from-purple-700 to-indigo-800 text-white font-bold py-6 rounded-[2.5rem] transition-all shadow-xl flex items-center justify-center gap-4 mt-10 uppercase tracking-[0.2em] text-[11px]"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <><Sparkles size={20} /> Ignite Production</>}
        </button>
      </form>
    );
  }

  if (type === 'prompt-creation') {
    return (
      <form onSubmit={handleSubmit} className="space-y-8">
        <MultiFileUpload 
          id="images" 
          label="Sampel Produk (Optional)" 
          icon={ImageIcon} 
          filesCount={formData.images.length} 
          onFilesChange={handleFilesChange} 
          previews={previews.images} 
          onRemove={removeFile} 
        />
        <div className="space-y-4">
          <InputLabel icon={UserCircle}>Foto Model / Avatar (Optional)</InputLabel>
          <MultiFileUpload 
            id="modelPhotos" 
            label="Avatar Reference" 
            icon={UserPlus} 
            filesCount={formData.modelPhotos.length} 
            onFilesChange={handleFilesChange} 
            previews={previews.modelPhotos} 
            onRemove={removeFile} 
          />
          <InputLabel icon={UserCircle}>Target Karakter</InputLabel>
          <select 
            value={formData.character[0] || "other/kosong"} 
            onChange={(e) => handleInputChange('character', [e.target.value])} 
            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-semibold outline-none shadow-sm"
          >
            {ANALYSIS_CHARACTERS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="bg-purple-50/50 p-6 rounded-[2.5rem] border border-purple-100 space-y-6">
          <InputLabel icon={ImagePlus}>Upload Background Khusus</InputLabel>
          <MultiFileUpload 
            id="backgroundImages" 
            label="Upload Background" 
            icon={ImageIcon} 
            filesCount={formData.backgroundImages.length} 
            onFilesChange={handleFilesChange} 
            previews={previews.backgroundImages} 
            onRemove={removeFile} 
          />
          <InputLabel icon={MapPin}>Pilih Latar Dropdown</InputLabel>
          <select 
            value={formData.environment} 
            onChange={(e) => handleInputChange('environment', e.target.value)} 
            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-semibold outline-none shadow-sm"
          >
            {ANALYSIS_BACKGROUNDS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <InputLabel icon={PenTool}>Detail Latar Spesifik</InputLabel>
          <textarea 
            value={formData.detailedPromptBg} 
            onChange={(e) => handleInputChange('detailedPromptBg', e.target.value)} 
            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-medium outline-none h-20 resize-none" 
            placeholder="Deskripsi latar belakang..." 
          />
        </div>
        <div className="space-y-4">
          <InputLabel icon={Lightbulb}>Ide / Konsep Mentah</InputLabel>
          <textarea 
            value={formData.detailedPrompt} 
            onChange={(e) => handleInputChange('detailedPrompt', e.target.value)} 
            className="w-full bg-white border border-purple-100 rounded-[1.25rem] px-6 py-4 text-[11px] font-black shadow-inner h-32 outline-none transition-all border-dashed" 
            placeholder="Tulis ide jualan agar dirapikan AI..." 
          />
        </div>
        <button 
          type="submit" 
          disabled={loading || !formData.detailedPrompt} 
          className="w-full bg-gradient-to-br from-purple-700 to-indigo-800 text-white font-bold py-6 rounded-[2.5rem] transition-all shadow-xl flex items-center justify-center gap-4 mt-10 uppercase tracking-[0.2em] text-[11px]"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <><PenTool size={20} /> Build Perfect Prompt</>}
        </button>
      </form>
    );
  }

  if (type === 'image-generator' || type === 'image-analysis') {
    const isGenerator = type === 'image-generator';
    return (
      <form onSubmit={handleSubmit} className="space-y-8">
        <MultiFileUpload 
          id="images" 
          label="Sampel Produk (Wajib Min. 1)" 
          required 
          icon={ImageIcon} 
          filesCount={formData.images.length} 
          onFilesChange={handleFilesChange} 
          previews={previews.images} 
          onRemove={removeFile} 
        />
        <div className="space-y-3">
          <InputLabel icon={Target}>Identitas Brand</InputLabel>
          <input 
            type="text" 
            value={formData.brandName} 
            onChange={(e) => handleInputChange('brandName', e.target.value)} 
            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-medium outline-none" 
            placeholder="Nama Brand..." 
          />
        </div>
        <MultiFileUpload 
          id="modelPhotos" 
          label="Foto Model / Avatar (Wajib Untuk Konsistensi)" 
          icon={UserCircle} 
          filesCount={formData.modelPhotos.length} 
          onFilesChange={handleFilesChange} 
          previews={previews.modelPhotos} 
          onRemove={removeFile} 
        />
        <div className="grid grid-cols-1 gap-8">
          {isGenerator ? (
            <>
              <MultiChipField 
                id="character" 
                label="Karakter" 
                icon={UserCircle} 
                options={ANALYSIS_CHARACTERS} 
                selectedValues={formData.character} 
                onToggle={(k, v) => toggleMultiSelect(k as keyof FormData, v, formData, setFormData)} 
                max={5} 
              />
              <MultiChipField 
                id="cameraAngle" 
                label="Camera Angle" 
                icon={Camera} 
                options={ANALYSIS_CAMERA_ANGLES} 
                selectedValues={formData.cameraAngle} 
                onToggle={(k, v) => toggleMultiSelect(k as keyof FormData, v, formData, setFormData)} 
                max={5} 
              />
              <MultiChipField 
                id="visualStyle" 
                label="Estetika Visual" 
                icon={Palette} 
                options={ANALYSIS_AESTHETICS} 
                selectedValues={formData.visualStyle} 
                onToggle={(k, v) => toggleMultiSelect(k as keyof FormData, v, formData, setFormData)} 
                max={5} 
              />
              <MultiChipField 
                id="pose" 
                label="Pose" 
                icon={Repeat} 
                options={ANALYSIS_POSES} 
                selectedValues={formData.pose} 
                onToggle={(k, v) => toggleMultiSelect(k as keyof FormData, v, formData, setFormData)} 
                max={5} 
              />
              <MultiChipField 
                id="productAngleUmkm" 
                label="Angle Produk UMKM" 
                icon={Box} 
                options={ANALYSIS_UMKM_ANGLES} 
                selectedValues={formData.productAngleUmkm} 
                onToggle={(k, v) => toggleMultiSelect(k as keyof FormData, v, formData, setFormData)} 
                max={5} 
              />
              <div>
                <InputLabel icon={MapPin}>Latar Belakang</InputLabel>
                <select 
                  value={formData.environment} 
                  onChange={(e) => handleInputChange('environment', e.target.value)} 
                  className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-semibold outline-none shadow-sm"
                >
                  {ANALYSIS_BACKGROUNDS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <InputLabel icon={UserCircle}>Karakter</InputLabel>
                <select 
                  value={Array.isArray(formData.character) ? (formData.character[0] || "other/kosong") : formData.character} 
                  onChange={(e) => handleInputChange('character', e.target.value)} 
                  className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-semibold outline-none shadow-sm"
                >
                  {ANALYSIS_CHARACTERS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <InputLabel icon={Camera}>Camera Angle</InputLabel>
                <select 
                  value={Array.isArray(formData.cameraAngle) ? (formData.cameraAngle[0] || "Lainnya/Kosong") : formData.cameraAngle} 
                  onChange={(e) => handleInputChange('cameraAngle', e.target.value)} 
                  className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-semibold outline-none shadow-sm"
                >
                  {ANALYSIS_CAMERA_ANGLES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <InputLabel icon={Palette}>Estetika Visual</InputLabel>
                <select 
                  value={Array.isArray(formData.visualStyle) ? (formData.visualStyle[0] || "Lainnya/Kosong") : formData.visualStyle} 
                  onChange={(e) => handleInputChange('visualStyle', e.target.value)} 
                  className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-semibold outline-none shadow-sm"
                >
                  {ANALYSIS_AESTHETICS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <InputLabel icon={Repeat}>Pose</InputLabel>
                <select 
                  value={Array.isArray(formData.pose) ? (formData.pose[0] || "Lainnya/Kosong") : formData.pose} 
                  onChange={(e) => handleInputChange('pose', e.target.value)} 
                  className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-semibold outline-none shadow-sm"
                >
                  {ANALYSIS_POSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <InputLabel icon={MapPin}>Latar Belakang</InputLabel>
                <select 
                  value={formData.environment} 
                  onChange={(e) => handleInputChange('environment', e.target.value)} 
                  className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-semibold outline-none shadow-sm"
                >
                  {ANALYSIS_BACKGROUNDS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </>
          )}
        </div>
        <div className="bg-purple-50/50 p-6 rounded-[2.5rem] border border-purple-100 space-y-6">
          <MultiFileUpload 
            id="backgroundImages" 
            label="Upload Latar Sendiri" 
            icon={ImagePlus} 
            filesCount={formData.backgroundImages.length} 
            onFilesChange={handleFilesChange} 
            previews={previews.backgroundImages} 
            onRemove={removeFile} 
          />
          <div className="space-y-3">
            <InputLabel icon={PenTool}>Detail Latar Spesifik</InputLabel>
            <textarea 
              value={formData.detailedPromptBg} 
              onChange={(e) => handleInputChange('detailedPromptBg', e.target.value)} 
              className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-medium outline-none h-20 resize-none" 
              placeholder="Rincian latar belakang..." 
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex-1">
            <InputLabel icon={Ratio}>Ratio</InputLabel>
            <select 
              value={formData.aspectRatio} 
              onChange={(e) => handleInputChange('aspectRatio', e.target.value)} 
              className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-semibold outline-none shadow-sm"
            >
              {['1:1', '4:5', '9:16', '16:9'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <InputLabel icon={Layers}>Output Images</InputLabel>
            <select 
              value={formData.quantity} 
              onChange={(e) => handleInputChange('quantity', e.target.value)} 
              className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-semibold outline-none shadow-sm"
            >
              {['2', '4', '6', '8', '12', '16'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-3">
          <InputLabel icon={PenTool}>IDE / KONSEP MENTAH (Sangat Detail)</InputLabel>
          <textarea 
            value={formData.detailedPrompt} 
            onChange={(e) => handleInputChange('detailedPrompt', e.target.value)} 
            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-medium outline-none h-24 resize-none" 
            placeholder="Tuliskan ide atau konsep cerita Anda..." 
          />
        </div>
        <button 
          type="submit" 
          disabled={loading || formData.images.length === 0} 
          className="w-full bg-gradient-to-br from-purple-700 to-indigo-800 text-white font-bold py-6 rounded-[2.5rem] transition-all shadow-xl uppercase tracking-[0.2em] text-[11px]"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <><Sparkles size={20} /> Analyze & Reproduce Identity</>}
        </button>
      </form>
    );
  }

  if (type === 'text-to-image') {
    return (
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* NEW: Upload Gambar / Karakter */}
        <MultiFileUpload 
          id="images" 
          label="Upload Gambar / Karakter (Optional)" 
          icon={UserCircle} 
          filesCount={formData.images.length} 
          onFilesChange={handleFilesChange} 
          previews={previews.images} 
          onRemove={removeFile} 
        />
        <div className="space-y-4">
          <InputLabel icon={Clapperboard}>Genre Visual</InputLabel>
          <select 
            value={formData.genre} 
            onChange={(e) => handleInputChange('genre', e.target.value)} 
            className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3 text-[11px] font-black focus:ring-4 focus:ring-purple-100 outline-none appearance-none shadow-sm"
          >
            {TEXT_TO_IMAGE_GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <InputLabel icon={PenTool}>Konsep Visual Naskah</InputLabel>
          <textarea 
            value={formData.detailedPrompt} 
            onChange={(e) => handleInputChange('detailedPrompt', e.target.value)} 
            className="w-full bg-white border border-purple-100 rounded-[1.25rem] px-6 py-4 text-[11px] font-black shadow-inner h-32 outline-none transition-all border-dashed" 
            placeholder="Tulis konsep visual..." 
          />
          <InputLabel icon={Anchor}>Pilih Jenis Hook</InputLabel>
          <select 
            value={formData.hookType} 
            onChange={(e) => handleInputChange('hookType', e.target.value)} 
            className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3 text-[11px] font-black focus:ring-4 focus:ring-purple-100 outline-none appearance-none shadow-sm"
          >
            {HOOK_TYPES.map(hook => <option key={hook} value={hook}>{hook}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex-1">
              <InputLabel icon={Layers}>Output Images</InputLabel>
              <select 
                value={formData.quantity} 
                onChange={(e) => handleInputChange('quantity', e.target.value)} 
                className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-black outline-none shadow-sm"
              >
                {['2', '4', '6', '8', '12', '16'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <InputLabel icon={Ratio}>Ratio</InputLabel>
            <select 
                value={formData.aspectRatio} 
                onChange={(e) => handleInputChange('aspectRatio', e.target.value)} 
                className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-black outline-none shadow-sm"
              >
                {['1:1', '4:5', '9:16', '16:9'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <MultiChipField 
            id="visualStyle" 
            label="Estetika Visual" 
            icon={Palette} 
            options={ANALYSIS_AESTHETICS} 
            selectedValues={formData.visualStyle} 
            onToggle={(k, v) => toggleMultiSelect(k as keyof FormData, v, formData, setFormData)} 
          />
        </div>
        <button 
          type="submit" 
          disabled={loading || !formData.detailedPrompt} 
          className="w-full bg-gradient-to-br from-purple-700 to-indigo-800 text-white font-bold py-6 rounded-[2.5rem] transition-all shadow-xl flex items-center justify-center gap-4 mt-10 uppercase tracking-[0.2em] text-[11px]"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <><Sparkles size={20} /> Ignite Storyteller</>}
        </button>
      </form>
    );
  }

  if (type === 'remove-bg') {
    return (
      <form onSubmit={handleSubmit} className="space-y-8">
        <MultiFileUpload 
          id="images" 
          label="Gambar Utama" 
          required 
          icon={ImageIcon} 
          filesCount={formData.images.length} 
          onFilesChange={handleFilesChange} 
          previews={previews.images} 
          onRemove={removeFile} 
        />
        {formData.images.length > 0 && (
          <button 
            type="button" 
            onClick={() => onCropRequest(formData.images[0], (cropped) => { setFormData(p => ({...p, images: [cropped]})); setPreviews(p => ({...p, images: [cropped]})); })} 
            className="w-full py-4 rounded-2xl bg-indigo-50 text-indigo-700 font-black uppercase text-[10px] tracking-widest border border-indigo-100 flex items-center justify-center gap-3 hover:bg-indigo-100 transition-all"
          >
            <Crop size={18}/> Potong Gambar (Adjust Area)
          </button>
        )}
        <div className="space-y-3">
          <InputLabel icon={Palette}>Warna Latar</InputLabel>
          <input 
            type="text" 
            value={formData.bgColor} 
            onChange={(e) => handleInputChange('bgColor', e.target.value)} 
            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-medium outline-none focus:ring-4 focus:ring-purple-100" 
            placeholder="Warna latar..." 
          />
        </div>
        <button 
          type="submit" 
          disabled={loading || formData.images.length === 0} 
          className="w-full bg-gradient-to-br from-purple-700 to-indigo-800 text-white font-bold py-6 rounded-[2.5rem] transition-all shadow-xl uppercase tracking-[0.2em] text-[11px]"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Remove Background Only'}
        </button>
      </form>
    );
  }

  if (type === 'video-prompt') {
    return (
      <form onSubmit={handleSubmit} className="space-y-8">
        <MultiFileUpload 
          id="images" 
          label="Gambar Model" 
          required 
          icon={UserCircle} 
          filesCount={formData.images.length} 
          onFilesChange={handleFilesChange} 
          previews={previews.images} 
          onRemove={removeFile} 
        />
        <div className="space-y-3">
          <InputLabel icon={MovieIcon}>Genre Video</InputLabel>
          <select 
            value={formData.genre} 
            onChange={(e) => handleInputChange('genre', e.target.value)} 
            className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3 text-[11px] font-semibold outline-none shadow-sm appearance-none"
          >
            {VIDEO_GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="space-y-3">
          <InputLabel icon={Layers}>Jumlah Adegan</InputLabel>
          <select 
            value={formData.quantity} 
            onChange={(e) => handleInputChange('quantity', e.target.value)} 
            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-semibold outline-none shadow-sm appearance-none"
          >
            {['2', '4', '6', '8', '12', '16'].map(opt => <option key={opt} value={opt}>{opt} Adegan</option>)}
          </select>
        </div>
        <div className="space-y-3">
          <InputLabel icon={PenTool}>Tema Cerita (Opsional)</InputLabel>
          <textarea 
            value={formData.detailedPrompt} 
            onChange={(e) => handleInputChange('detailedPrompt', e.target.value)} 
            className="w-full bg-white border border-purple-100 rounded-[1.25rem] px-6 py-4 text-[11px] font-medium shadow-inner h-24 outline-none transition-all border-dashed" 
            placeholder="Tema cerita..." 
          />
        </div>
        <div className="space-y-4">
          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-purple-50 transition-all border border-gray-100 shadow-sm">
            <input 
              type="checkbox" 
              checked={formData.includeVO} 
              onChange={(e) => handleInputChange('includeVO', e.target.checked)} 
              className="w-5 h-5 accent-purple-600 rounded-lg" 
            />
            <span className="text-[11px] font-black text-gray-700 uppercase tracking-tight">Hasilkan Teks VoiceOver (VO) untuk setiap adegan</span>
          </label>
        </div>
        <button 
          type="submit" 
          disabled={loading || formData.images.length === 0} 
          className="w-full bg-gradient-to-br from-purple-700 to-indigo-800 text-white font-bold py-6 rounded-[2.5rem] transition-all shadow-xl flex items-center justify-center gap-4 mt-6 uppercase tracking-[0.2em] text-[11px]"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <><MovieIcon size={20} /> Generate Video Prompts</>}
        </button>
      </form>
    );
  }

  if (type === 'tts') {
    return (
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <InputLabel icon={FileText}>Naskah Suara</InputLabel>
          <textarea 
            value={formData.script} 
            onChange={(e) => handleInputChange('script', e.target.value)} 
            className="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] px-6 py-5 text-sm font-black shadow-inner h-48 focus:ring-4 focus:ring-purple-100 outline-none resize-none transition-all" 
            placeholder="Naskah..." 
          />
          <InputLabel icon={UserCircle}>Gender</InputLabel>
          <select 
            value={formData.voiceType} 
            onChange={(e) => handleInputChange('voiceType', e.target.value as "Laki-laki" | "Wanita")} 
            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-black outline-none appearance-none shadow-sm"
          >
            {GENDER_VOICES.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <InputLabel icon={Sparkles}>Suasana</InputLabel>
          <select 
            value={formData.voiceMood} 
            onChange={(e) => handleInputChange('voiceMood', e.target.value)} 
            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-black outline-none appearance-none shadow-sm"
          >
            {MOOD_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-gradient-to-br from-purple-700 to-indigo-800 text-white font-bold py-6 rounded-[2.5rem] transition-all shadow-xl flex items-center justify-center gap-4 mt-10 uppercase tracking-[0.2em] text-[11px]"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Ignite Production'}
        </button>
      </form>
    );
  }

  return null;
};

export default FeatureForm;