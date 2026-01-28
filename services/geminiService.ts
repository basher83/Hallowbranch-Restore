import { GoogleGenAI, Chat, Part } from '@google/genai';

import { SYSTEM_INSTRUCTION, MODEL_NAME } from '../constants';
import { RestorationOptions, DamageType, FacePreservation, PhotoType } from '../types';

// Helper to encode file to Base64
export const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // remove data:image/jpeg;base64, prefix
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

export const dataUrlToGenerativePart = async (
  dataUrl: string,
  mimeType: string = 'image/png',
): Promise<Part> => {
  const base64 = dataUrl.split(',')[1];
  if (!base64) {
    throw new Error('Invalid data URL');
  }
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
};

export const urlToGenerativePart = async (url: string): Promise<Part> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return fileToGenerativePart(new File([blob], 'image.png', { type: blob.type }));
};

export const buildPrompt = (options: RestorationOptions): string => {
  let prompt = `Perform ${options.intensity.toLowerCase()} restoration of this ${options.photoType.toLowerCase()}. \n\n`;

  // Damage Repair
  if (options.damageTypes.length > 0) {
    prompt += `Damage repair: `;
    const repairs = [];
    if (options.damageTypes.includes(DamageType.SCRATCHES))
      repairs.push('Remove all visible scratches and fine lines');
    if (options.damageTypes.includes(DamageType.TEARS))
      repairs.push('Mend visible tears and rips seamlessly');
    if (options.damageTypes.includes(DamageType.FADING))
      repairs.push('Restore faded areas to their original tonal range');
    if (options.damageTypes.includes(DamageType.STAINS))
      repairs.push('Clean localized stains and discoloration');
    if (options.damageTypes.includes(DamageType.CRACKS))
      repairs.push('Fill in cracks and emulsion fractures');
    prompt += repairs.join('. ') + '.\n\n';
  }

  // Face Handling
  prompt += `Face handling: `;
  switch (options.facePreservation) {
    case FacePreservation.STRICT:
      prompt +=
        'Preserve facial features, expressions, and proportions with absolute fidelity. Maintain exact eye color, nose shape, mouth structure, and facial contours.\n\n';
      break;
    case FacePreservation.MODERATE:
      prompt +=
        'Enhance facial clarity while maintaining strong resemblance to the original subject.\n\n';
      break;
    case FacePreservation.FLEXIBLE:
      prompt +=
        'Enhance facial details for clarity, prioritizing a natural look over pixel-perfect adherence if the original is extremely blurry.\n\n';
      break;
  }

  // Colorization
  if (options.photoType === PhotoType.B_AND_W && options.colorize) {
    prompt +=
      'Colorize this black-and-white image with natural, period-appropriate colors. Ensure skin tones are realistic and clothing colors match the historical era.\n\n';
  }

  // Grain
  if (options.preserveGrain) {
    prompt +=
      'Preserve the original film grain and texture characteristics to maintain authenticity.\n\n';
  } else {
    prompt +=
      "Reduce noise and grain for a cleaner, modern digital look, but avoid a 'waxy' appearance.\n\n";
  }

  // Local Repairs
  if (options.localRepairRegions.length > 0) {
    prompt +=
      'Local repairs needed in the following regions (coordinates are approximate percentages):\n';
    options.localRepairRegions.forEach((region, idx) => {
      prompt += `- Region ${idx + 1} (x:${Math.round(region.x)}%, y:${Math.round(region.y)}%, w:${Math.round(region.width)}%, h:${Math.round(region.height)}%): ${region.type}. ${region.instruction || ''}\n`;
    });
    prompt += '\n';
  }

  prompt += 'Restoration approach: Balance restoration quality with historical authenticity.';

  return prompt;
};

export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private chatSession: Chat | null = null;

  constructor() {
    // We defer initialization until we check for the key
  }

  public async initialize() {
    // Check for API Key via AI Studio standard
    // @ts-ignore
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      // @ts-ignore
      if (!(await window.aistudio.hasSelectedApiKey())) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
      }
      // We assume key is set now in process.env.API_KEY by the environment injection
      // Note: In a real browser env with the extension/iframe, the key isn't literally in process.env
      // But for the generated code, we follow the pattern provided in the prompt instructions
      // which says "Use this process.env.API_KEY string directly".
      // However, the prompt specifically for Veo/Gemini 3 Pro Image says:
      // "The selected API key is available via process.env.API_KEY."

      this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    } else {
      // Fallback for dev environment or if specific window object missing, assuming env var exists
      if (process.env.API_KEY) {
        this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      } else {
        console.warn('No API Key found and window.aistudio not available.');
      }
    }
  }

  public async startRestoration(
    file: File,
    options: RestorationOptions,
  ): Promise<{ imageUrl: string; prompt: string }> {
    if (!this.ai) await this.initialize();
    if (!this.ai) throw new Error('AI Client not initialized');

    const prompt = buildPrompt(options);
    const imagePart = await fileToGenerativePart(file);

    // We start a chat to maintain context for future refinements
    this.chatSession = this.ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        imageConfig: {
          imageSize: '2K',
        },
      },
    });

    const response = await this.chatSession.sendMessage({
      message: [imagePart, { text: prompt }],
    });

    // Extract image
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) throw new Error('No response from AI');

    // Find image part
    const parts = candidates[0].content.parts;
    let base64Image = null;

    for (const part of parts) {
      if (part.inlineData) {
        base64Image = part.inlineData.data;
        break;
      }
    }

    if (!base64Image) {
      // Fallback: check if text response says it failed
      const text = parts.find((p) => p.text)?.text;
      throw new Error(text || 'AI generated text but no image. Prompt might need adjustment.');
    }

    return {
      imageUrl: `data:image/png;base64,${base64Image}`,
      prompt,
    };
  }

  public async refineRestoration(
    instruction: string,
    lastGeneratedImageUrl: string,
    _originalFile: File,
  ): Promise<{ imageUrl: string; prompt: string }> {
    if (!this.ai || !this.chatSession) throw new Error('Session not initialized');

    // For refinement, we remind the model of the original + give the latest result context if needed.
    // However, since we are in a chat session, the previous turn (with the output image) is technically in history?
    // Actually, `gemini-3-pro-image-preview` might not automatically use the *output* of the previous turn as *visual context* for the next.
    // It's safer to provide the last generated image as input to "edit" it.
    // We also provide the original file reference to prevent drift.

    const lastImagePart = await urlToGenerativePart(lastGeneratedImageUrl);
    // const originalImagePart = await fileToGenerativePart(originalFile); // Optional: Provide original as reference if model supports multiple input images well.
    // For now, let's rely on the chat history + inputting the image we want to CHANGE (the last one).

    const refinementPrompt = `Refine the last image with these instructions: ${instruction}.
    Reference the original uploaded photograph structure to prevent identity drift.
    Ensure high fidelity.`;

    const response = await this.chatSession.sendMessage({
      message: [lastImagePart, { text: refinementPrompt }],
    });

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) throw new Error('No response from AI');

    const parts = candidates[0].content.parts;
    let base64Image = null;

    for (const part of parts) {
      if (part.inlineData) {
        base64Image = part.inlineData.data;
        break;
      }
    }

    if (!base64Image) {
      const text = parts.find((p) => p.text)?.text;
      throw new Error(text || 'AI generated text but no image during refinement.');
    }

    return {
      imageUrl: `data:image/png;base64,${base64Image}`,
      prompt: refinementPrompt,
    };
  }
}

export const geminiService = new GeminiService();
