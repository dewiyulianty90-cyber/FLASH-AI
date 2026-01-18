import { GoogleGenAI, GenerateContentResponse, Modality, Type, Part, FunctionDeclaration } from "@google/genai";
import { sleep } from '../utils';
import { 
  TEXT_MODEL_NAME, IMAGE_MODEL_NAME, IMAGE_EDIT_MODEL_NAME, TTS_MODEL_NAME, 
  IMAGEN_MODEL_NAME
} from '../constants';

let ai: GoogleGenAI | null = null;

/**
 * Initializes the GoogleGenAI client.
 * Assumes process.env.API_KEY is available.
 */
export const initGeminiAI = (): GoogleGenAI => {
  if (!ai) {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY is not defined in environment variables.");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

/**
 * Fetches data with retry logic for transient errors.
 * @param apiCall The asynchronous function representing the API call.
 * @param retries The number of retries (default: 5).
 * @param backoff The initial backoff delay in milliseconds (default: 1500).
 * @returns The result of the API call.
 * @throws Error if all retries fail or a non-retryable error occurs.
 */
export const fetchWithRetry = async <T,>(
  apiCall: () => Promise<T>,
  retries: number = 5,
  backoff: number = 1500
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isRetryable = errorMessage.includes('429') || errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('500'); // Basic check for HTTP status codes in message or specific SDK errors

    if (retries > 0 && isRetryable) {
      console.warn(`Retrying after error: ${errorMessage}. Retries left: ${retries - 1}`);
      await sleep(backoff);
      return fetchWithRetry(apiCall, retries - 1, backoff * 2);
    }
    console.error("Failed after multiple retries:", error);
    throw new Error(`API request failed: ${errorMessage}`);
  }
};

interface GeminiTextGenerationConfig {
  systemInstruction?: string;
  responseSchema?: object;
  maxOutputTokens?: number;
  thinkingBudget?: number;
  topK?: number;
  topP?: number;
  temperature?: number;
  seed?: number;
  responseMimeType?: string;
  tools?: FunctionDeclaration[];
}

/**
 * Calls the Gemini LLM for text-based content generation.
 * @param prompt The main text prompt.
 * @param config Optional generation configuration.
 * @param imageParts Optional array of base64 image strings.
 * @returns The generated text content.
 */
export const generateTextContent = async (
  prompt: string,
  config?: GeminiTextGenerationConfig,
  imageParts: string[] = []
): Promise<string | undefined> => {
  const aiInstance = initGeminiAI();
  const parts: Part[] = [{ text: prompt }];

  imageParts.forEach(img => {
    if (img && typeof img === 'string' && img.includes('base64,')) {
      parts.push({ inlineData: { mimeType: "image/png", data: img.split(',')[1] } });
    }
  });

  const generationConfig: { [key: string]: any } = {};
  if (config?.responseSchema) {
    generationConfig.responseMimeType = "application/json";
    generationConfig.responseSchema = config.responseSchema;
  }
  if (config?.maxOutputTokens) generationConfig.maxOutputTokens = config.maxOutputTokens;
  if (config?.thinkingBudget !== undefined) generationConfig.thinkingConfig = { thinkingBudget: config.thinkingBudget };
  if (config?.topK) generationConfig.topK = config.topK;
  if (config?.topP) generationConfig.topP = config.topP;
  if (config?.temperature) generationConfig.temperature = config.temperature;
  if (config?.seed) generationConfig.seed = config.seed;
  if (config?.responseMimeType) generationConfig.responseMimeType = config.responseMimeType;

  const requestBody = {
    model: TEXT_MODEL_NAME,
    contents: [{ parts }],
    config: {
      ...generationConfig,
      systemInstruction: config?.systemInstruction ? { parts: [{ text: config.systemInstruction }] } : undefined,
      tools: config?.tools ? [{ functionDeclarations: config.tools }] : undefined,
    },
  };

  const apiCall = async () => {
    const response: GenerateContentResponse = await aiInstance.models.generateContent(requestBody);
    return response.text;
  };

  return fetchWithRetry(apiCall);
};

interface GeminiImageGenerationConfig {
  aspectRatio?: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
  imageSize?: "1K" | "2K" | "4K"; // Only for gemini-3-pro-image-preview
  tools?: FunctionDeclaration[];
}

/**
 * Generates or edits images using a multi-modal Gemini model.
 * @param prompt The text prompt for generation or editing.
 * @param imageInputs Optional array of base64 image strings for editing/context.
 * @param config Optional generation configuration.
 * @returns A promise that resolves to an array of base64 image strings.
 */
export const generateOrEditImages = async (
  prompt: string,
  imageInputs: string[] = [],
  config?: GeminiImageGenerationConfig
): Promise<string[]> => {
  const aiInstance = initGeminiAI();
  const parts: Part[] = [{ text: prompt }];

  imageInputs.forEach(img => {
    if (img && typeof img === 'string' && img.includes('base64,')) {
      parts.push({ inlineData: { mimeType: "image/png", data: img.split(',')[1] } });
    }
  });

  const generationConfig: { [key: string]: any } = {
    responseModalities: [Modality.IMAGE],
  };
  if (config?.aspectRatio) {
    generationConfig.imageConfig = { aspectRatio: config.aspectRatio };
  }
  if (config?.imageSize) { // Assuming IMAGE_MODEL_NAME supports this
    generationConfig.imageConfig = { ...generationConfig.imageConfig, imageSize: config.imageSize };
  }
  if (config?.tools) {
    generationConfig.tools = [{ functionDeclarations: config.tools }];
  }


  const requestBody = {
    model: IMAGE_EDIT_MODEL_NAME, // Using the image editing model for broad image tasks
    contents: [{ parts }],
    config: generationConfig,
  };

  const apiCall = async () => {
    const response: GenerateContentResponse = await aiInstance.models.generateContent(requestBody);
    const generatedImages: string[] = [];
    for (const candidate of response.candidates || []) {
      if (candidate.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData?.mimeType?.startsWith('image/') && part.inlineData.data) {
            generatedImages.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
          }
        }
      }
    }
    return generatedImages;
  };

  return fetchWithRetry(apiCall);
};

interface ImagenImageGenerationConfig {
  numberOfImages?: number;
  outputMimeType?: 'image/jpeg' | 'image/png';
  aspectRatio?: '1:1' | '4:3' | '3:4' | '16:9' | '9:16';
  seed?: number;
}

/**
 * Generates images using the Imagen model.
 * @param prompt The text prompt for image generation.
 * @param config Optional generation configuration.
 * @returns A promise that resolves to an array of base64 image strings.
 */
export const generateImagesWithImagen = async (
  prompt: string,
  config?: ImagenImageGenerationConfig
): Promise<string[]> => {
  const aiInstance = initGeminiAI();

  const parameters: { [key: string]: any } = {
    sampleCount: config?.numberOfImages || 1,
    aspectRatio: config?.aspectRatio || '1:1',
  };
  if (config?.outputMimeType) parameters.outputMimeType = config.outputMimeType;
  if (config?.seed) parameters.seed = config.seed;

  const requestBody = {
    model: IMAGEN_MODEL_NAME, // Explicitly using Imagen model
    prompt: prompt,
    config: parameters,
  };

  const apiCall = async () => {
    const response = await aiInstance.models.generateImages(requestBody);
    const generatedImages: string[] = [];
    for (const img of response.generatedImages || []) {
      if (img.image?.imageBytes) {
        generatedImages.push(`data:image/png;base64,${img.image.imageBytes}`);
      }
    }
    return generatedImages;
  };

  return fetchWithRetry(apiCall);
};


interface GeminiSpeechGenerationConfig {
  voiceName: string; // e.g., 'Kore', 'Puck'
  mood?: string; // e.g., 'Energetic', 'Friendly'
}

/**
 * Generates speech from text using the TTS model.
 * @param text The text to convert to speech.
 * @param config Speech configuration including voice name and optional mood.
 * @returns A promise that resolves to the base64 encoded audio data.
 */
export const generateSpeechContent = async (
  text: string,
  config: GeminiSpeechGenerationConfig
): Promise<string | undefined> => {
  const aiInstance = initGeminiAI();

  const requestBody = {
    model: TTS_MODEL_NAME,
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: config.voiceName },
        },
        // There is no direct "mood" parameter in speechConfig, it's usually embedded in the prompt.
        // We handle mood by adding it to the text prompt directly.
      },
    },
  };

  const apiCall = async () => {
    const response: GenerateContentResponse = await aiInstance.models.generateContent(requestBody);
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  };

  return fetchWithRetry(apiCall);
};
