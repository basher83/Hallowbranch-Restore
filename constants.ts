import { FacePreservation, Intensity, PhotoType, RestorationOptions } from './types';

export const DEFAULT_OPTIONS: RestorationOptions = {
  photoType: PhotoType.B_AND_W,
  damageTypes: [],
  intensity: Intensity.MODERATE,
  colorize: false,
  preserveGrain: true,
  facePreservation: FacePreservation.STRICT,
  localRepairRegions: [],
  preEnhance: false,
};

export const SYSTEM_INSTRUCTION = `You are a professional photo restoration specialist. Your role is to repair and enhance damaged family photographs while maintaining absolute fidelity to the original subjects' identities, expressions, and historical authenticity.

Core principles:
1. Preserve facial features exactly as shown in the original.
2. Maintain historical era characteristics and visual style.
3. Apply natural, period-appropriate colors when colorizing.
4. Reconstruct damaged areas using only visible context clues.
5. If features are completely missing, leave subtle blur rather than inventing details.

Never alter the identity of the person. Always use positive constraints ("preserve exactly").`;

export const MODEL_NAME = 'gemini-3-pro-image-preview';
export const MAX_FILE_SIZE_MB = 7;
export const MAX_REFINEMENT_TURNS = 5;
export const PRE_ENHANCE_MAX_DIM = 2000;
