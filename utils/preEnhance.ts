import x2 from '@upscalerjs/esrgan-slim/2x';
import Upscaler from 'upscaler';

const DEFAULT_MAX_INPUT_SIZE = 4096;
const UPSCALE_FACTOR = 2;
const getMaxTextureSize = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl') ||
      canvas.getContext('webgl2');
    if (!gl) return DEFAULT_MAX_INPUT_SIZE;
    const maxSize = gl.getParameter((gl as WebGLRenderingContext).MAX_TEXTURE_SIZE);
    return typeof maxSize === 'number' ? maxSize : DEFAULT_MAX_INPUT_SIZE;
  } catch {
    return DEFAULT_MAX_INPUT_SIZE;
  }
};
let upscalerInstance: Upscaler | null = null;

const getUpscaler = () => {
  if (!upscalerInstance) {
    upscalerInstance = new Upscaler({ model: x2 });
  }
  return upscalerInstance;
};

const loadBitmap = async (imageUrl: string, file?: File): Promise<ImageBitmap | null> => {
  if (file) {
    try {
      return await createImageBitmap(file);
    } catch {
      // fall through to fetch
    }
  }
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return await createImageBitmap(blob);
  } catch {
    return null;
  }
};

const downscaleIfNeeded = async (imageUrl: string, file?: File): Promise<string> => {
  const maxTextureSize = getMaxTextureSize();
  const safeMaxOutput = Math.min(DEFAULT_MAX_INPUT_SIZE, Math.floor(maxTextureSize * 0.9));
  const safeMaxInput = Math.max(256, Math.floor(safeMaxOutput / UPSCALE_FACTOR));
  const bitmap = await loadBitmap(imageUrl, file);
  if (bitmap) {
    const maxDim = Math.max(bitmap.width, bitmap.height);
    if (maxDim <= safeMaxInput) {
      return imageUrl;
    }

    const scale = safeMaxInput / maxDim;
    const targetWidth = Math.round(bitmap.width * scale);
    const targetHeight = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
    return canvas.toDataURL('image/png', 0.95);
  }

  const img = new Image();
  img.crossOrigin = 'anonymous';
  const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image for pre-enhance'));
  });
  img.src = imageUrl;
  await loadPromise;

  const maxDim = Math.max(img.naturalWidth, img.naturalHeight);
  if (maxDim <= safeMaxInput) {
    return imageUrl;
  }

  const scale = safeMaxInput / maxDim;
  const targetWidth = Math.round(img.naturalWidth * scale);
  const targetHeight = Math.round(img.naturalHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  return canvas.toDataURL('image/png', 0.95);
};

export const getImageDimensions = async (
  imageUrl: string,
  file?: File,
): Promise<{ width: number; height: number }> => {
  const bitmap = await loadBitmap(imageUrl, file);
  if (bitmap) {
    return { width: bitmap.width, height: bitmap.height };
  }

  const img = new Image();
  img.crossOrigin = 'anonymous';
  const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image for dimensions'));
  });
  img.src = imageUrl;
  await loadPromise;
  return { width: img.naturalWidth, height: img.naturalHeight };
};

export const preEnhanceImage = async (imageUrl: string, file?: File): Promise<string> => {
  const upscaler = getUpscaler();
  const safeUrl = await downscaleIfNeeded(imageUrl, file);
  const result = await upscaler.upscale(safeUrl);
  if (typeof result !== 'string') {
    throw new Error('Unexpected upscaler result');
  }
  return result;
};
