import { GenerateContentResponse } from "@google/genai";

/**
 * Delays execution for a specified number of milliseconds.
 * @param ms The number of milliseconds to sleep.
 */
export const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Converts a base64 string to a Blob object.
 * @param base64 The base64 string (e.g., "data:image/png;base64,...").
 * @param type The MIME type of the Blob (default: 'image/png').
 * @returns A Blob object or null if conversion fails.
 */
export const base64ToBlob = (base64: string, type: string = 'image/png'): Blob | null => {
  try {
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type });
  } catch (e) {
    console.error("Failed to convert base64 to blob:", e);
    return null;
  }
};

/**
 * Decodes a base64 string into a Uint8Array.
 * @param base64 The base64 string to decode.
 * @returns A Uint8Array containing the decoded bytes.
 */
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw PCM audio data into an AudioBuffer.
 * @param data The Uint8Array containing the raw PCM data.
 * @param ctx The AudioContext to create the AudioBuffer with.
 * @param sampleRate The sample rate of the audio.
 * @param numChannels The number of audio channels.
 * @returns A Promise that resolves with the decoded AudioBuffer.
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * Converts base64 encoded PCM audio data into a WAV Blob.
 * @param pcmBase64 The base64 encoded PCM audio data.
 * @param sampleRate The sample rate of the PCM data (default: 24000).
 * @returns A Blob object representing the WAV file.
 */
export const pcmToWav = (pcmBase64: string, sampleRate: number = 24000): Blob => {
  const byteCharacters = atob(pcmBase64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const pcmData = new Int16Array(byteArray.buffer);

  const buffer = new ArrayBuffer(44 + pcmData.length * 2); // 44 bytes for WAV header, 2 bytes per sample
  const view = new DataView(buffer);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  /* WAV header */
  writeString(0, 'RIFF'); // ChunkID
  view.setUint32(4, 32 + pcmData.length * 2, true); // ChunkSize
  writeString(8, 'WAVE'); // Format
  writeString(12, 'fmt '); // Subchunk1ID
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, 1, true); // NumChannels (Mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  view.setUint16(32, 2, true); // BlockAlign (NumChannels * BitsPerSample/8)
  view.setUint16(34, 16, true); // BitsPerSample
  writeString(36, 'data'); // Subchunk2ID
  view.setUint32(40, pcmData.length * 2, true); // Subchunk2Size (NumSamples * NumChannels * BitsPerSample/8)

  /* Write PCM data */
  let offset = 44;
  for (let i = 0; i < pcmData.length; i++, offset += 2) {
    view.setInt16(offset, pcmData[i], true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
};

/**
 * Counts the number of words in a given string.
 * @param str The input string.
 * @returns The word count.
 */
export const getWordCount = (str: string): number => (str || "").trim().split(/\s+/).filter(word => word.length > 0).length;

/**
 * Formats the raw text output from AI into readable paragraphs with specific styling for headers.
 * @param text The raw text output.
 * @returns An array of objects with text and isHeader properties.
 */
export function outputFormatter(text: string): Array<{ text: string; isHeader: boolean }> | null {
  if (!text) return null;
  return text.split('\n').map((line) => {
    const isHeader = !!line.match(/^Hook|^Isi|^Cta|^Script Video|^Viral hooks|^Product content body|^Product scripting|^Viral Hooks|^Product Body|^Call-to-Action|^Product Scripting|^Body|^Headline|^Subheadline|^Body\/Isi Konten/i);
    return { text: line, isHeader };
  });
}

/**
 * Extracts base64 image data from a GenerateContentResponse.
 * @param response The GenerateContentResponse object.
 * @returns The base64 encoded image string, or undefined if not found.
 */
export const extractImageData = (response: GenerateContentResponse): string | undefined => {
  for (const candidate of response.candidates || []) {
    if (candidate.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.mimeType?.startsWith('image/') && part.inlineData.data) {
          return part.inlineData.data;
        }
      }
    }
  }
  return undefined;
};