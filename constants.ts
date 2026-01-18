import { Icon as LucideIcon } from 'lucide-react';
import { 
  Sparkles, Search, Video, Layers, Mic, Type, MessageSquarePlus, 
  Presentation, Languages, Clapperboard as MovieIcon,
} from 'lucide-react';
import { TabItem } from './types';

// --- API Configuration ---
export const TEXT_MODEL_NAME = "gemini-3-flash-preview"; // Recommended for basic text tasks
export const IMAGE_MODEL_NAME = "gemini-3-pro-image-preview"; // Recommended for high-quality image generation
export const IMAGEN_MODEL_NAME = "imagen-4.0-generate-001"; // User provided this, for text-to-image
export const IMAGE_EDIT_MODEL_NAME = "gemini-2.5-flash-image"; // Recommended for image editing
export const TTS_MODEL_NAME = "gemini-2.5-flash-preview-tts";

// --- Global Configuration Data ---
export const HOOK_TYPES = [
  "Curiosity Hook", "Problem Hook", "Shock / Controversial Hook", "Question Hook",
  "Relatable Hook", "Before–After Hook", "Pain Point Hook", "Solution Hook",
  "Fear Hook", "Desire / Dream Hook", "Mistake Hook", "Secret / Hidden Truth Hook",
  "Social Proof Hook", "Authority Hook", "Scarcity / Urgency Hook", "Comparison Hook",
  "Challenge Hook", "Storytelling Hook", "Trending Hook", "Direct Callout Hook",
  "Pattern Interrupt Hook", "Fact / Data Hook", "Myth Busting Hook",
  "Transformation Hook", "Guarantee Hook"
];

export const GENDER_VOICES = ["Laki-laki", "Wanita"];

export const MOOD_TYPES = [
  "Energik", "Ramah", "Tenang", "Meyakinkan", "Profesional", "Ceria", 
  "Humoris", "Percaya Diri", "Tegas", "Emosional", "Bercerita", 
  "Inspiratif", "Motivatif", "Santai", "Hangat", "Lembut", "Mewah", 
  "Premium", "Serius", "Urgent / Mendesak", "Persuasif", "Kasual", 
  "Dramatis", "Minimalis", "Berwibawa"
];

export const VIDEO_GENRES = [
  "Cinematic Movie", "UGC / Social Media", "Professional Commercial", "3D Animation", 
  "Documentary", "Vlog Style", "Cyberpunk / Sci-Fi", "Vintage / Retro", "Anime Style",
  "Product Showcase"
];

export const TEXT_TO_IMAGE_GENRES = [
  "Cinematic Movie", "UGC/Media Social", "Professional Commercial", 
  "Documentary", "Vlog Style", "Cyberpunk/ Sci-Fi", 
  "Vintage/Retro", "Anime Style", "Product Showcase", "Animation"
];

export const ANALYSIS_CHARACTERS = ["Female", "Male", "Children", "Hijab Woman", "Animation", "Cartoon", "3D", "Grandmother", "Grandfather", "Baby", "other/kosong"];
export const ANALYSIS_CAMERA_ANGLES = [
  "Eye Level (sejajar mata)", "High Angle (dari atas)", "Low Angle (dari bawah)", 
  "Close-Up (jarak dekat)", "Macro (detail sangat dekat)", "Side Profile (samping)", 
  "Top View / Flat Lay (tampak atas)", "POV Shot (sudut pandang pengguna)", 
  "Over-the-Shoulder (dari belakang bahu)", "45 Degree Angle (sudut 45 derajat)", "Lainnya/Kosong"
];
export const ANALYSIS_AESTHETICS = [
  "Gaya UGC (natural & realistis)", "Fotorealistik", "Latar Putih Bersih", "Cahaya Alami Hangat", 
  "Pencahayaan Lembut Beauty", "Sinematik", "Minimalis Mewah", "Cerah & Segar", 
  "Gelap Dramatis", "Gaya Lifestyle Realistis", "Lainnya/Kosong"
];
export const ANALYSIS_POSES = [
  "Memegang Produk", "Menatap Kamera", "Menggunakan Produk", "Berdiri Natural", 
  "Fokus Tangan Saja", "Menunjuk ke Produk", "Sebelum–Sesudah", "Pose Contoh (natural)", 
  "Aksi Dinamis", "Duduk", "Berbaring", "Lainnya/Kosong"
];
export const ANALYSIS_BACKGROUNDS = [
  "Putih Polos", "Beige / Cream Lembut", "Abu-Abu Terang", "Latar Gradasi", 
  "Kamar Tidur Estetik", "Kamar Mandi / Meja Rias", "Ruang Tamu", "Meja Dapur", 
  "Meja Marmer", "Meja Kayu", "Cahaya Alami dari Jendela", "Studio Gelap", "Lainnya/Upload Sendiri"
];
export const ANALYSIS_UMKM_ANGLES = [
  "Tampak Depan (katalog utama)", "Sudut 45 Derajat (paling aman & laku)", 
  "Tampak Atas / Flat Lay", "Tampak Samping (ketebalan / bentuk)", 
  "Tampak Belakang (informasi kemasan)", "Detail Close-Up (tekstur, bahan)", 
  "Detail Macro (skincare, makanan)", "Produk di Pegang Tangan", 
  "Produk Sedang Digunakan", "Foto Produk Varian (warna / rasa)", 
  "Kemasan + Produk", "Sebelum–Sesudah"
];

export const ADS_CATEGORIES = [
  "Skincare & Cosmetics", "Fashion", "Food", "Digital Product", "Health & Wellness", 
  "Home & Indonesian Living", "Beauty Tools", "Affiliate Product", "Others/Lainnya"
];

export const ADS_BACKGROUNDS = [
  "Putih Bersih (Fokus Maksimal)", "Warna Solid (Modern & Tegas)", "Gradient Halus (Premium)", 
  "Abu-Abu Terang (Elegan Tech/Beauty)", "Lean Aesthetic (Kulit Sehat)", "Marble/Kaca (Mewah)", 
  "Botanical (Alami & Organik)", "Pastel Lembut (Feminim/Tenang)", "Bathroom/Vanity Minimalis", 
  "Studio Minimalis", "Lifestyle Indoor (Kamar Modern)", "Lifestyle Indoor (Ruang Tamu)", 
  "Urban (Trendy & Edgy)", "Outdoor Alami (Fresh & Aktif)", "Runway/Editorial Fashion", 
  "Meja Wood/Dapur (Home-made)", "Warna Cerah (Tingkatkan Selera Makan)", "Cafe/Restoran Modern", 
  "Natural Linen (Organik Sehat)", "Splash/Percikan Cairan", "Minimal Modern (UI/Digital)", 
  "Gradient Gelap (Tech Profesional)", "Futuristik (Neon Soft)", "Workspace Modern", 
  "Flat Design (Bersih & Informatif)", "Natural Cahaya Matahari", "Clean & Airy (Terpercaya)", 
  "Yoga/Wellness Studio", "Hijau/Biru Muda (Tenang)", "Tekstur Kain (Nyaman)", 
  "Tekstur Kayu (Natural)", "Interior Rumah Modern", "Ruangan Minimalis Alami", 
  "Meja/Rak Dekoratif", "Ruang Keluarga/Tidur", "Tone Hangat (Homey)", 
  "Warna Kontras (Attention)", "Efek Glow (Special Offer)", "Minimal Space for Text", 
  "Festive (Lebaran/Akhir Tahun)", "Countdown Visual (Promo Terbatas)", "Others/Lainnya"
];

export const ADS_ANGLES = [
  "Tampak Depan", "Sudut 45 Derajat", "Tampak Atas/Flat Lay", "Tampak Samping", 
  "Tampak Belakang (informasi kemasan)", "Detail Close-Up (Tekstur bahan)", 
  "Detail Macro", "Produk di Pegang", "Produk Sedang di gunakan", 
  "Foto Produk Varian", "Kemasan + Produk", "Sebelum-Sesudah"
];

export const COPY_FLOWS = ["AIDA (Attention, Interest, Desire, Action)", "PAS (Problem, Agitate, Solution)", "BAB (Before, After, Bridge)", "Storytelling (Masalah, Cerita, Solusi)"];
export const COPY_PLATFORMS = ["TikTok", "Instagram Reels", "Shopee Video", "Facebook Ads", "WhatsApp Marketing", "YouTube Shorts"];
export const COPY_OBJECTIVES = ["Penjualan", "Branding", "Edukasi", "Viral"];

export const TABS: TabItem[] = [
  { id: 'image-generator', label: 'Generator', icon: Sparkles },
  { id: 'image-analysis', label: 'Analysis', icon: Search },
  { id: 'video-prompt', label: 'Video Prompt', icon: Video },
  { id: 'remove-bg', label: 'Remove background', icon: Layers }, 
  { id: 'tts', label: 'Text to Voice', icon: Mic }, 
  { id: 'text-to-image', label: 'Text to Image', icon: Type },
  { id: 'prompt-creation', label: 'Prompt Creation', icon: MessageSquarePlus },
  { id: 'ads-creative', label: 'Ads Creative', icon: Presentation },
  { id: 'copywriter', label: 'Copywriting', icon: Languages },
];

export const STANDARD_RATIO_MAP: { [key: string]: string } = { 
  '1:1': '1:1', '4:5': '3:4', '9:16': '9:16', '16:9': '16:9', '4:3': '4:3', '3:4': '3:4' 
};
