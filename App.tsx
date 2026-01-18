import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Menu, X, Loader2, Sparkles, CheckCircle, AlertCircle, Wand2,
  DownloadCloud
} from 'lucide-react';
import { Type } from '@google/genai';

import CropModal from './components/CropModal';
import FeatureForm from './components/FeatureForm';
import ResultsView from './components/ResultsView';
import { FormData, ResultsData, CropTarget, TabItem } from './types';
import { 
  TABS, STANDARD_RATIO_MAP, TEXT_MODEL_NAME, IMAGE_EDIT_MODEL_NAME,
  IMAGEN_MODEL_NAME
} from './constants';
import { sleep, base64ToBlob, pcmToWav, extractImageData } from './utils';
import { 
  generateTextContent, generateOrEditImages, generateSpeechContent, 
  generateImagesWithImagen 
} from './services/geminiService';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('image-generator');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<ResultsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<CropTarget | null>(null);
  const resultsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (results && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [results]);

  const handleAction = async (featureData: FormData) => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      let result: Omit<ResultsData, 'featureData'> = {}; // Initialize with empty object
      const allInputs = [
        ...(featureData.images || []), 
        ...(featureData.modelPhotos || []), 
        ...(featureData.backgroundImages || []),
        ...(featureData.logoPhotos || [])
      ];

      switch (activeTab) {
        case 'image-generator':
          result = await generateProductVisuals(featureData, allInputs);
          break;
        case 'image-analysis':
          result = await analyzeAndGetIntegratedOutput(featureData, allInputs);
          break;
        case 'tts':
          result = await generateSpeech(featureData);
          break;
        case 'text-to-image':
          result = await generateIdeaVisuals(featureData);
          break; 
        case 'remove-bg':
          result = await removeBackground(featureData);
          break;
        case 'video-prompt':
          result = await generateVideoPromptSuggestions(featureData, allInputs);
          break;
        case 'copywriter':
          result = await generateCopywriting(featureData);
          break;
        case 'prompt-creation':
          result = await generatePromptCreation(featureData, allInputs);
          break;
        case 'ads-creative':
          result = await generateAdsCreative(featureData, allInputs);
          break;
        default:
          throw new Error('Unknown feature type');
      }
      setResults({ ...result, featureData });
    } catch (err: any) {
      console.error("Error during action:", err);
      setError(err.message || "Gagal memproses permintaan.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSingleVisual = useCallback(async (index: number, newTextData: { hook: string; bodyContent: string; ctaText: string }) => {
    if (!results || !results.images) return;
    const imageToUpdate = results.images[index];
    setLoading(true);
    try {
      const finalRatio = STANDARD_RATIO_MAP[results.featureData.aspectRatio] || '1:1';
      
      const updatePrompt = `
        STRICT VISUAL SYNC: Update text overlays ONLY. 
        MANDATORY OUTPUT RATIO: ${results.featureData.aspectRatio}.
        KEEP THE PRODUCT, SUBJECT, AND BACKGROUND 100% IDENTICAL to the source.
        LITERAL TEXT RENDERING (ZERO TYPOS):
        - HOOK: "${newTextData.hook}"
        - BODY: "${newTextData.bodyContent}"
        - CTA: "${newTextData.ctaText}"
        LANGUAGE: ${results.featureData.language}. Zero typos.
      `;

      const updatedImagesBase64 = await generateOrEditImages(
        updatePrompt, 
        [imageToUpdate], 
        { aspectRatio: finalRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9" }
      );

      if (updatedImagesBase64.length > 0) {
        const updatedImages = [...results.images];
        updatedImages[index] = updatedImagesBase64[0];
        setResults(prev => (prev ? { ...prev, images: updatedImages } : null));
      } else {
        throw new Error("No image data returned for update.");
      }
    } catch (e: any) {
      console.error("Error updating single visual:", e);
      setError(e.message || "Gagal memperbarui teks visual.");
    } finally {
      setLoading(false);
    }
  }, [results]); // Dependency on `results` for `results.images` and `results.featureData`

  // --- AI Production Logic ---

  const generateProductVisuals = async (data: FormData, allInputs: string[]) => {
    const targetCount = parseInt(data.quantity || '4');
    const finalRatio = STANDARD_RATIO_MAP[data.aspectRatio] || '1:1';

    const planningSchema = {
      type: Type.OBJECT,
      properties: {
        identityDNA: { type: Type.STRING },
        storyboard: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: { 
              sceneAction: { type: Type.STRING },
              angleSpecific: { type: Type.STRING },
              visualDetails: { type: Type.STRING }
            },
            required: ["sceneAction", "angleSpecific", "visualDetails"]
          }
        },
        marketing: { 
          type: Type.OBJECT, 
          properties: { 
            script: { type: Type.STRING }, 
            hooks: { type: Type.STRING }, 
            body: { type: Type.STRING }, 
            cta: { type: Type.STRING } 
          },
          required: ["script", "hooks", "body", "cta"]
        }
      },
      required: ["identityDNA", "storyboard", "marketing"]
    };

    const planningPrompt = `
      Anda adalah Visual Director Profesional (Kualitas Nano Banana Pro).
      TUGAS: Rancang ${targetCount} blueprint visual hiper-realistik.
      
      MANDATORY RATIO: ${data.aspectRatio}.
      INSTRUKSI: Hasil visual HARUS sesuai dengan rasio ${data.aspectRatio}. Abaikan dimensi asli aset yang diunggah. Re-komposisi elemen secara keseluruhan agar pas dalam bingkai ${data.aspectRatio}.
      
      FITUR: ${data.character.join(', ')}, ${data.cameraAngle.join(', ')}, ${data.visualStyle.join(', ')}, ${data.pose.join(', ')}, ${data.environment}.
      KONSEP: "${data.detailedPrompt}"
    `;

    const planResText = await generateTextContent(
      planningPrompt, 
      { systemInstruction: "Expert Visual Strategist.", responseSchema: planningSchema }, 
      allInputs
    );
    if (!planResText) throw new Error("Failed to get planning response.");
    const parsedPlan = JSON.parse(planResText);

    const generatedImages: string[] = [];
    const scenes = parsedPlan.storyboard.slice(0, targetCount);

    for (let i = 0; i < scenes.length; i++) {
      const scenePrompt = `
        HYPER-REALISTIC PRODUCT PHOTOGRAPHY. 
        MANDATORY OUTPUT RATIO: ${data.aspectRatio} (RE-COMPOSE SCENE TO FIT).
        STRICT FEATURES: ${data.character[i % data.character.length]}, ${scenes[i].angleSpecific}, ${data.visualStyle.join(', ')}.
        SCENE: ${scenes[i].sceneAction}. Technical: 8k, PBR rendering.
      `;

      try {
        if (i > 0) await sleep(1800); // Add a delay to avoid rate limiting
        const imageResult = await generateOrEditImages(
          scenePrompt, 
          allInputs, 
          { aspectRatio: finalRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9" }
        );
        if (imageResult.length > 0) {
          generatedImages.push(imageResult[0]);
        }
      } catch (e) { 
        console.error(`Error generating scene ${i+1}:`, e); 
      }
    }

    const m = parsedPlan.marketing;
    return { 
      images: generatedImages, 
      marketing: `Viral Hooks\n“${m.hooks}”\n\nProduct Body\n“${m.body}”\n\nCall-to-Action (CTA)\n“${m.cta}”\n\nProduct Scripting\n“${m.script}”`, 
      brandName: data.brandName || "Flash AI Generator" 
    };
  };

  const generateAdsCreative = async (data: FormData, allAestheticInputs: string[]) => {
    const targetCount = parseInt(data.quantity || '4');
    const finalRatio = STANDARD_RATIO_MAP[data.aspectRatio] || '1:1';

    const planningSchema = { 
      type: Type.OBJECT, 
      properties: { 
        adsCopy: { 
          type: Type.OBJECT, 
          properties: { 
            hook: { type: Type.STRING }, 
            bodyContent: { type: Type.STRING }, 
            ctaText: { type: Type.STRING } 
          },
          required: ["hook", "bodyContent", "ctaText"]
        }, 
        visualPlan: { 
          type: Type.ARRAY, 
          items: { 
            type: Type.OBJECT, 
            properties: { 
              sceneAction: { type: Type.STRING }, 
              assignedAngle: { type: Type.STRING }, 
              styleNote: { type: Type.STRING } 
            },
            required: ["sceneAction", "assignedAngle", "styleNote"]
          } 
        } 
      }, 
      required: ["adsCopy", "visualPlan"] 
    };

    const designerPrompt = `Master Ads Designer (Nano Banana Pro quality). INPUT: ${data.language}. Konsep: "${data.detailedPrompt}". Ratio: ${data.aspectRatio}. Headline: "${data.headline}", Sub: "${data.subheadline}", CTA: "${data.ctaText}". ANGLES: ${data.selectedAngles.join(', ')}.`;
    
    const planResText = await generateTextContent(
      designerPrompt, 
      { systemInstruction: "Expert Ads Visual Designer.", responseSchema: planningSchema }, 
      allAestheticInputs
    );
    if (!planResText) throw new Error("Failed to get planning response.");
    const parsedPlan = JSON.parse(planResText);

    const generatedImages: string[] = [];
    const scenes = parsedPlan.visualPlan.slice(0, targetCount);
    const finalScenes = Array.from({ length: targetCount }, (_, i) => scenes[i % scenes.length]);

    for (let i = 0; i < finalScenes.length; i++) {
      const currentAngle = data.selectedAngles.length > 0 ? data.selectedAngles[i % data.selectedAngles.length] : "Tampak Depan";
      const textInstruction = data.noText ? "DO NOT RENDER ANY TEXT. PURE IMAGE ONLY." : `LITERAL TEXT RENDERING (ZERO TYPOS): Hook "${parsedPlan.adsCopy.hook}", Body "${parsedPlan.adsCopy.bodyContent}", CTA "${parsedPlan.adsCopy.ctaText}".`;
      const scenePrompt = `HYPER-REALISTIC COMMERCIAL AD. RATIO: ${data.aspectRatio}. ANGLE: ${currentAngle}. BG: ${data.bgCategory}. CONTENT: ${textInstruction} REALISM: Cinematic. 8k.`;
      
      try { 
        if (i > 0) await sleep(2000); // Add a delay to avoid rate limiting
        const imageResult = await generateOrEditImages(
          scenePrompt, 
          allAestheticInputs, 
          { aspectRatio: finalRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9" }
        );
        if (imageResult.length > 0) {
          generatedImages.push(imageResult[0]);
        }
      } catch (e) { 
        console.error(`Error generating ad creative scene ${i+1}:`, e); 
      }
    }
    const c = parsedPlan.adsCopy;
    const marketingText = `Hook\n“${c.hook}”\n\nBody/Isi Konten\n“${c.bodyContent}”\n\nCTA\n“${c.ctaText}”`;
    return { images: generatedImages, marketing: marketingText, brandName: data.brandName || "Flash Ads Designer" };
  };

  const generateCopywriting = async (data: FormData) => {
    const systemPrompt = `Anda adalah AI Copywriter profesional. Hasilkan copywriting terstruktur dengan pembagian: Hook, Body, dan CTA. 
    PENTING: Gunakan teks polos (plain text). JANGAN gunakan simbol markdown seperti bintang (*), pagar (#), atau strip (-). 
    Pastikan teks bersih, rapi, dan terstruktur hanya dengan spasi antar paragraf.`;
    const result = await generateTextContent(
      `Produk: "${data.script}". Target: "${data.targetAudience}". Platform: "${data.platform}". Alur: "${data.copyFlow}".`, 
      { systemInstruction: systemPrompt }
    );
    return { marketing: result, brandName: "Flash Copywriting Pro" };
  };

  const generatePromptCreation = async (data: FormData, allInputs: string[]) => {
    const responseSchema = { 
      type: Type.OBJECT, 
      properties: { 
        englishPrompt: { type: Type.STRING }, 
        jsonPrompt: { type: Type.STRING }, 
        analysisDetail: { type: Type.STRING } 
      }, 
      required: ["englishPrompt", "jsonPrompt", "analysisDetail"] 
    };

    const resRaw = await generateTextContent(
      `Concept: "${data.detailedPrompt}".`, 
      { systemInstruction: "Senior Prompt Engineer.", responseSchema: responseSchema }, 
      allInputs
    );
    if (!resRaw) throw new Error("Failed to get prompt creation response.");
    const parsed = JSON.parse(resRaw);
    return { perfectPrompt: parsed.englishPrompt, jsonPrompt: parsed.jsonPrompt, explanation: parsed.analysisDetail, brandName: "Flash Prompt Engineer" };
  };

  const analyzeAndGetIntegratedOutput = async (data: FormData, allInputs: string[]) => {
    const targetCount = parseInt(data.quantity || '4');
    const finalRatio = STANDARD_RATIO_MAP[data.aspectRatio] || '1:1';

    const responseSchema = { 
      type: Type.OBJECT, 
      properties: { 
        masterPrompt: { type: Type.STRING }, 
        identityDNA: { type: Type.STRING }, 
        storyboard: { 
          type: Type.ARRAY, 
          items: { 
            type: Type.OBJECT, 
            properties: { sceneAction: { type: Type.STRING } },
            required: ["sceneAction"]
          } 
        }, 
        marketing: { 
          type: Type.OBJECT, 
          properties: { 
            script: { type: Type.STRING }, 
            hooks: { type: Type.STRING }, 
            body: { type: Type.STRING }, 
            cta: { type: Type.STRING } 
          },
          required: ["script", "hooks", "body", "cta"]
        } 
      }, 
      required: ["masterPrompt", "identityDNA", "storyboard", "marketing"] 
    };

    const planResText = await generateTextContent(
      `Analysis.`, 
      { systemInstruction: "Ahli reverse visual.", responseSchema: responseSchema }, 
      allInputs
    );
    if (!planResText) throw new Error("Failed to get analysis response.");
    const parsedPlan = JSON.parse(planResText);

    const generatedImages: string[] = [];
    // Ensure to generate `targetCount` images, looping through storyboard if needed
    const storyboardToUse = parsedPlan.storyboard.length > 0 ? parsedPlan.storyboard : [{ sceneAction: "A high-quality product shot" }];
    
    for (let i = 0; i < targetCount; i++) {
      const currentScene = storyboardToUse[i % storyboardToUse.length];
      const scenePrompt = `STRICT REPRODUCTION. MANDATORY RATIO: ${data.aspectRatio}. IDENTITY SYNC: ${parsedPlan.identityDNA}. SCENE: ${currentScene.sceneAction}.`;
      try { 
        if (i > 0) await sleep(1800); // Delay
        const imageResult = await generateOrEditImages(
          scenePrompt, 
          allInputs, 
          { aspectRatio: finalRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9" }
        );
        if (imageResult.length > 0) {
          generatedImages.push(imageResult[0]);
        }
      } catch (e) { 
        console.error(`Error generating analysis scene ${i+1}:`, e); 
      }
    }
    const m = parsedPlan.marketing; 
    return { 
      images: generatedImages, 
      masterPrompt: parsedPlan.masterPrompt, 
      marketing: `Viral Hooks\n“${m.hooks}”\n\nProduct Body\n“${m.body}”\n\nCTA\n“${m.cta}”\n\nProduct Scripting\n“${m.script}”`, 
      brandName: data.brandName || "Flash AI Analysis" 
    };
  };

  const generateVideoPromptSuggestions = async (data: FormData, imageInputs: string[]) => {
    const targetCount = parseInt(data.quantity || '4');
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        visualDNA: { type: Type.STRING },
        scenes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              sceneNumber: { type: Type.NUMBER },
              videoPromptEN: { type: Type.STRING },
              videoPromptID: { type: Type.STRING },
              narrationID: { type: Type.STRING }
            },
            required: ["sceneNumber", "videoPromptEN", "videoPromptID"]
          }
        }
      },
      required: ["visualDNA", "scenes"]
    };

    const voInstruction = data.includeVO
      ? "WAJIB: Tuliskan naskah VoiceOver (narrationID) yang sesuai dengan mood masing-masing adegan dalam Bahasa Indonesia."
      : "JANGAN tuliskan naskah VoiceOver. Kosongkan bagian narrationID.";

    const planningPrompt = `Deep Analysis Storyboard. EXACTLY ${targetCount} scenes. Provide teknis prompts in English and Indonesia. ${voInstruction} Concept: ${data.detailedPrompt}. Genre: ${data.genre}.`;
    const resRaw = await generateTextContent(
      planningPrompt, 
      { systemInstruction: "Storyboard Expert.", responseSchema: responseSchema }, 
      imageInputs
    );
    if (!resRaw) throw new Error("Failed to get video prompt suggestions.");
    const parsed = JSON.parse(resRaw);
    return { videoScenes: parsed.scenes.slice(0, targetCount), analysis: parsed.visualDNA };
  };

  const generateIdeaVisuals = async (data: FormData) => {
    const targetCount = parseInt(data.quantity || '4');
    const finalRatio = STANDARD_RATIO_MAP[data.aspectRatio] || '1:1';
    
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        visualDNA: { type: Type.STRING },
        storyboard: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: { sceneAction: { type: Type.STRING } },
            required: ["sceneAction"]
          }
        },
        marketing: { 
          type: Type.OBJECT, 
          properties: { 
            script: { type: Type.STRING }, 
            hooks: { type: Type.STRING }, 
            body: { type: Type.STRING }, 
            cta: { type: Type.STRING } 
          },
          required: ["script", "hooks", "body", "cta"]
        }
      },
      required: ["visualDNA", "storyboard", "marketing"]
    };

    const planningPrompt = `
      Anda adalah Visual Narrative Director (Kualitas Nano Banana Pro).
      TUGAS: Terjemahkan KONSEP VISUAL NASKAH user berikut menjadi blueprint visual yang sangat detail.
      
      KONSEP USER: "${data.detailedPrompt}"
      GENRE: ${data.genre}
      HOOK TYPE: ${data.hookType}
      MANDATORY RATIO: ${data.aspectRatio}.
      
      Rancang storyboard ${targetCount} frame yang secara progresif menceritakan konsep tersebut.
    `;

    const planResText = await generateTextContent(
      planningPrompt, 
      { systemInstruction: "Ahli narasi visual.", responseSchema: responseSchema }
    );
    if (!planResText) throw new Error("Failed to get visual narrative plan.");
    const parsedPlan = JSON.parse(planResText); 
    const generatedImages: string[] = [];
    const loopScenes = Array.from({ length: targetCount }, (_, i) => parsedPlan.storyboard[i % parsedPlan.storyboard.length]);

    for (let i = 0; i < loopScenes.length; i++) {
      const isAnimation = data.genre === "Animation";
      const styleInstruction = isAnimation 
        ? "STYLE: High-end 3D Animation, Pixar/Dreamworks style, vibrant colors, expressive lighting."
        : `STYLE: ${data.genre}, photorealistic, high fidelity.`;

      const scenePrompt = `
        MANDATORY OUTPUT RATIO: ${data.aspectRatio}.
        DNA: ${parsedPlan.visualDNA}.
        
        STRICT USER CONCEPT ADHERENCE:
        ${data.detailedPrompt}
        
        FRAME ${i+1} ACTION: ${loopScenes[i].sceneAction}.
        ${styleInstruction}
        TECHNICAL: 8k resolution, cinematic lighting.
      `;

      try {
        if (i > 0) await sleep(1500); // Delay
        // Using generateImagesWithImagen for Imagen model as specified
        const imageResult = await generateImagesWithImagen(
          scenePrompt,
          { aspectRatio: finalRatio as "1:1" | "4:3" | "3:4" | "16:9" | "9:16", numberOfImages: 1 }
        );
        if (imageResult.length > 0) {
          generatedImages.push(imageResult[0]);
        }
      } catch (e) { 
        console.error(`Error generating text-to-image scene ${i+1}:`, e); 
      }
    }
    const m = parsedPlan.marketing;
    return { 
      images: generatedImages, 
      marketing: `Viral hooks\n“${m.hooks}”\n\nProduct body\n“${m.body}”\n\nCTA\n“${m.cta}”\n\nProduct scripting\n“${m.script}”`, 
      brandName: "Flash AI Storyteller" 
    };
  };

  const generateSpeech = async (data: FormData) => {
    const voiceMapping: { [key: string]: string } = { 'Laki-laki': 'Puck', 'Wanita': 'Kore' }; 
    const selectedVoice = voiceMapping[data.voiceType] || 'Kore';
    const moodMap: { [key: string]: string } = { 
      "Energik": "Energetic", "Ramah": "Friendly", "Tenang": "Calm", "Meyakinkan": "Convincing", 
      "Profesional": "Professional", "Ceria": "Cheerful", "Humoris": "Humorous", 
      "Percaya Diri": "Confident", "Tegas": "Firm", "Emosional": "Emotional", 
      "Bercerita": "Storytelling", "Inspiratif": "Inspirational", "Motivatif": "Motivational", 
      "Santai": "Relaxed", "Hangat": "Warm", "Lembut": "Soft", "Mewah": "Luxurious", 
      "Premium": "Premium", "Serius": "Serious", "Urgent / Mendesak": "Urgent", 
      "Persuasif": "Persuasive", "Kasual": "Casual", "Dramatis": "Dramatic", 
      "Minimalis": "Minimalist", "Berwibawa": "Authoritative" 
    };
    const engMood = moodMap[data.voiceMood] || "Professional";
    
    // Embed mood into the text prompt for better control
    const textToSpeak = `Say in a ${engMood} tone: ${data.script}`;

    const audioData = await generateSpeechContent(
      textToSpeak, 
      { voiceName: selectedVoice }
    );
    return { audioUrl: audioData ? URL.createObjectURL(pcmToWav(audioData)) : null };
  };

  const removeBackground = async (data: FormData) => {
    if (!data.images || data.images.length === 0) {
      throw new Error("No image provided for background removal.");
    }
    const prompt = `Remove background strictly. Set new background color to ${data.bgColor || "Transparent"}.`;
    
    const imageResult = await generateOrEditImages(
      prompt, 
      [data.images[0]], 
      { aspectRatio: STANDARD_RATIO_MAP['1:1'] as "1:1" | "3:4" | "4:3" | "9:16" | "16:9" } // Default to 1:1 for editing
    );
    
    return { image: imageResult.length > 0 ? imageResult[0] : null };
  };

  const toggleMultiSelect = useCallback((key: keyof FormData, value: string, currentFormData: FormData, setFormData: React.Dispatch<React.SetStateAction<FormData>>) => {
    const currentValues = Array.isArray(currentFormData[key]) ? (currentFormData[key] as string[]) : (currentFormData[key] && currentFormData[key] !== "other/kosong" ? [currentFormData[key] as string] : []);
    const newValues = currentValues.includes(value) ? currentValues.filter(x => x !== value) : (currentValues.length < 12 ? [...currentValues, value] : currentValues);
    setFormData(prev => ({...prev, [key]: newValues}));
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-800 font-sans selection:bg-purple-100">
      {cropTarget && <CropModal image={cropTarget.image} onCancel={() => setCropTarget(null)} onSave={(cropped) => { cropTarget.callback(cropped); setCropTarget(null); }} />}
      {previewImage && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center p-4 animate-in fade-in duration-300 backdrop-blur-xl">
          <button onClick={() => setPreviewImage(null)} className="absolute top-8 right-8 text-white hover:bg-white/10 p-3 rounded-full transition-all active:scale-90"><X size={32} /></button>
          <img src={previewImage} alt="Preview" className="max-w-full max-h-[80vh] rounded-3xl shadow-2xl object-contain border border-white/5" />
          <div className="mt-8 flex gap-4">
            <button 
              onClick={() => { 
                const blob = base64ToBlob(previewImage); 
                if (blob) { 
                  const url = URL.createObjectURL(blob); 
                  const link = document.createElement('a'); 
                  link.href = url; 
                  link.download = `flash-hq-result.png`; 
                  link.click(); 
                  URL.revokeObjectURL(url);
                } 
              }} 
              className="bg-white text-gray-900 px-12 py-4 rounded-full font-black uppercase text-sm tracking-widest flex items-center gap-3 shadow-2xl hover:scale-105 transition-all"
            >
              <DownloadCloud size={20} /> Simpan Semua
            </button>
          </div>
        </div>
      )}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-2xl border-b border-gray-100 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-700 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-xl">
            <Sparkles size={20} />
          </div>
          <h1 className="text-xl font-bold tracking-tighter text-gray-900 uppercase">Flash AI</h1>
        </div>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl lg:hidden transition-all">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <nav className="hidden lg:flex items-center gap-1.5 bg-gray-100/50 p-1.5 rounded-2xl border border-gray-200/30">
          {TABS.map((tab: TabItem) => (
            <button 
              key={tab.id} 
              onClick={() => { setActiveTab(tab.id); setResults(null); }} 
              className={`text-[10px] font-bold transition-all px-5 py-2.5 rounded-xl ${activeTab === tab.id ? 'text-white bg-purple-600 shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-40 lg:hidden pt-24 px-6 animate-in slide-in-from-top duration-300 overflow-y-auto pb-10">
          <div className="flex flex-col gap-2">
            {TABS.map((tab: TabItem) => (
              <button 
                key={tab.id} 
                onClick={() => { setActiveTab(tab.id); setIsMenuOpen(false); setResults(null); }} 
                className={`flex items-center gap-3 p-3.5 rounded-2xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-purple-600 text-white shadow-2xl' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                <tab.icon size={18} /> {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <main className="pt-24 pb-12 px-6 max-w-[1600px] mx-auto flex flex-col lg:flex-row-reverse gap-10">
        <section className="w-full lg:w-[380px] bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm h-fit lg:sticky lg:top-24">
          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-3xl font-bold mb-1 capitalize text-gray-900 tracking-tighter">{activeTab.replace('-', ' ')}</h2>
            <p className="text-gray-400 text-[10px] font-medium uppercase tracking-[0.3em]">Studio Creator</p>
          </div>
          <FeatureForm 
            type={activeTab} 
            onSubmit={handleAction} 
            loading={loading} 
            onCropRequest={(img, cb) => setCropTarget({ image: img, callback: cb })} 
            toggleMultiSelect={toggleMultiSelect} 
          />
        </section>
        <section className="flex-1" ref={resultsRef}>
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[600px] bg-gray-50/50 rounded-[4rem] border-2 border-dashed border-gray-200 text-center px-8">
              <div className="relative mb-8">
                <div className="w-16 h-16 border-[4px] border-purple-50 border-t-purple-600 rounded-full animate-spin"></div>
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-600" size={24} />
              </div>
              <p className="text-gray-400 text-[10px] font-black tracking-[0.4em] animate-pulse uppercase text-center">Menjalankan Produksi Kreatif...</p>
            </div>
          ) : error ? (
            <div className="p-12 bg-red-50 border border-red-100 rounded-[4rem] flex flex-col items-center text-center gap-6">
              <AlertCircle className="text-red-500" size={48} />
              <div>
                <h3 className="font-bold text-2xl text-red-900 tracking-tighter">System Error</h3>
                <p className="text-red-700 mt-2 text-sm font-medium">{error}</p>
                <button onClick={() => setError(null)} className="mt-8 px-10 py-4 bg-red-600 text-white rounded-full font-bold uppercase text-xs">Ulangi</button>
              </div>
            </div>
          ) : results ? (
            <div className="animate-in fade-in slide-in-from-bottom-12 duration-500">
              <ResultsView 
                type={activeTab} 
                data={results} 
                onImageClick={(img) => setPreviewImage(img)} 
                refining={false} 
                onReGenerateIndividual={handleUpdateSingleVisual} 
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[600px] bg-purple-50/5 rounded-[4rem] border-2 border-dashed border-purple-100/50 text-center px-12 group relative overflow-hidden">
              <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center text-purple-600 mb-8 shadow-sm border border-gray-100 transition-all duration-700 group-hover:rotate-12">
                <Wand2 size={48} />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-4 tracking-tighter">Ready for Flash?</h3>
              <p className="text-gray-400 text-lg max-w-md mx-auto font-medium leading-relaxed">Ekstrak DNA visual bertenaga Gemini AI.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
