import React, { useMemo, useRef, useState } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface CropModalProps {
  isOpen: boolean;
  imageUrl: string;
  onCancel: () => void;
  onSkip: () => void;
  onApply: (croppedFile: File, croppedUrl: string) => void;
}

const CropModal: React.FC<CropModalProps> = ({ isOpen, imageUrl, onCancel, onSkip, onApply }) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const canApply = useMemo(() => {
    return !!completedCrop && completedCrop.width > 1 && completedCrop.height > 1;
  }, [completedCrop]);

  const handleApply = async () => {
    if (!imgRef.current || !completedCrop) return;
    setIsProcessing(true);

    try {
      const canvas = document.createElement('canvas');
      const image = imgRef.current;

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const pixelWidth = Math.round(completedCrop.width * scaleX);
      const pixelHeight = Math.round(completedCrop.height * scaleY);

      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        pixelWidth,
        pixelHeight,
        0,
        0,
        pixelWidth,
        pixelHeight,
      );

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/png', 0.95),
      );

      if (!blob) throw new Error('Could not create cropped image');

      const file = new File([blob], 'cropped.png', { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      onApply(file, url);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
        aria-label="Dismiss crop"
      />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl mx-4 border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2
            id="crop-title"
            className="text-lg font-semibold text-gray-900 dark:text-white text-balance"
          >
            Crop Photo
          </h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close crop"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 rounded"
          >
            &times;
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-pretty mb-4">
            Drag to select the area you want to restore. You can skip this step to use the full
            image.
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <ReactCrop
              crop={crop}
              onChange={(next) => setCrop(next)}
              onComplete={(c) => setCompletedCrop(c)}
              keepSelection
              className="max-h-[70vh]"
            >
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Crop preview"
                className="max-h-[60vh] w-auto block mx-auto"
              />
            </ReactCrop>
          </div>
        </div>

        <div className="p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex flex-col sm:flex-row gap-3 sm:justify-between">
          <button
            type="button"
            onClick={onSkip}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-gray-900 rounded"
          >
            Skip Crop
          </button>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-gray-900 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!canApply || isProcessing}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-gray-900"
            >
              {isProcessing ? 'Applying…' : 'Apply Crop'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropModal;
