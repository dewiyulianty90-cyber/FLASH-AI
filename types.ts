import { Icon as LucideIcon } from 'lucide-react';

export interface FormData {
  cameraAngle: string[];
  visualStyle: string[];
  pose: string[];
  environment: string;
  quantity: string;
  aspectRatio: string;
  brandName: string;
  character: string[];
  images: string[];
  modelPhotos: string[];
  backgroundImages: string[];
  detailedPrompt: string;
  detailedPromptBg: string;
  bgColor: string;
  script: string;
  voiceType: "Laki-laki" | "Wanita";
  voiceMood: string;
  genre: string;
  productAngleUmkm: string[];
  hookType: string;
  mode: "Banner" | "Aset Polos";
  language: "Indonesia" | "English";
  category: string;
  customCategory: string;
  bgCategory: string;
  logoPhotos: string[];
  productName: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  additionalInfo: string;
  noText: boolean;
  includeVO: boolean;
  targetAudience: string;
  platform: string;
  objective: string;
  copyFlow: string;
  manualHeadline: string;
  manualSubheadline: string;
  manualCTA: string;
  selectedAngles: string[];
}

export interface ResultsData {
  images?: string[];
  image?: string;
  marketing?: string;
  brandName?: string;
  perfectPrompt?: string;
  jsonPrompt?: string;
  explanation?: string;
  masterPrompt?: string;
  videoScenes?: VideoScene[];
  analysis?: string;
  audioUrl?: string;
  featureData: FormData; // Store the input data for potential refinement
}

export interface VideoScene {
  sceneNumber: number;
  videoPromptEN: string;
  videoPromptID: string;
  narrationID: string;
}

export interface CropTarget {
  image: string;
  callback: (croppedImage: string) => void;
}

export interface TabItem {
  id: string;
  label: string;
  icon: LucideIcon;
}
