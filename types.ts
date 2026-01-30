export enum PhotoType {
  B_AND_W = 'Old B&W',
  FADED_COLOR = 'Faded color',
  MODERN = 'Modern photo',
}

export enum DamageType {
  SCRATCHES = 'Scratches',
  TEARS = 'Tears',
  FADING = 'Fading',
  STAINS = 'Stains',
  CRACKS = 'Cracks',
}

export enum Intensity {
  LIGHT = 'Light',
  MODERATE = 'Moderate',
  AGGRESSIVE = 'Aggressive',
}

export enum FacePreservation {
  STRICT = 'Strict',
  MODERATE = 'Moderate',
  FLEXIBLE = 'Flexible',
}

export enum RepairType {
  FIX_DAMAGE = 'Fix damage',
  REDUCE_NOISE = 'Reduce noise',
  COLORIZE_AREA = 'Colorize area',
}

export interface LocalRepairRegion {
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  width: number; // Percentage 0-100
  height: number; // Percentage 0-100
  type: RepairType;
  instruction?: string;
}

export interface RestorationOptions {
  photoType: PhotoType;
  damageTypes: DamageType[];
  intensity: Intensity;
  colorize: boolean;
  preserveGrain: boolean;
  facePreservation: FacePreservation;
  localRepairRegions: LocalRepairRegion[];
  preEnhance: boolean;
}

export interface RestorationSession {
  id: string;
  originalImageUrl: string;
  originalImageFile: File;
  baseImageUrl?: string;
  baseImageFile?: File;
  history: RestorationHistoryItem[];
  currentStepIndex: number;
}

export interface RestorationHistoryItem {
  id: string;
  imageUrl: string;
  thumbnailUrl: string; // generated locally for performance
  promptUsed: string;
  timestamp: number;
  type: 'initial' | 'refinement';
}

export interface AppState {
  apiKey: string | null;
  currentSession: RestorationSession | null;
  options: RestorationOptions;
  isProcessing: boolean;
  error: string | null;
  activeTab: 'global' | 'local';
  isModalOpen: boolean;
}
