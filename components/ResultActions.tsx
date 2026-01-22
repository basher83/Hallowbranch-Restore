import React from 'react';
import { useApp } from '../context/AppContext';

const ResultActions: React.FC = () => {
  const { currentSession } = useApp();

  if (!currentSession || currentSession.history.length === 0) return null;

  const currentImage = currentSession.history[currentSession.history.length - 1].imageUrl;
  const originalImage = currentSession.originalImageUrl;

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const createComparisonCanvas = async () => {
      // Create a canvas to stitch images side by side
      const img1 = await loadImage(originalImage);
      const img2 = await loadImage(currentImage);

      const canvas = document.createElement('canvas');
      canvas.width = img1.width + img2.width;
      canvas.height = Math.max(img1.height, img2.height);
      const ctx = canvas.getContext('2d');
      if (ctx) {
          ctx.drawImage(img1, 0, 0);
          ctx.drawImage(img2, img1.width, 0);
          // Add labels
          ctx.font = '40px sans-serif';
          ctx.fillStyle = 'white';
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 4;

          ctx.strokeText("Original", 40, img1.height - 40);
          ctx.fillText("Original", 40, img1.height - 40);

          ctx.strokeText("Restored", img1.width + 40, img1.height - 40);
          ctx.fillText("Restored", img1.width + 40, img1.height - 40);

          downloadImage(canvas.toDataURL('image/png'), `restora-comparison-${Date.now()}.png`);
      }
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
      });
  };

  return (
    <div className="grid grid-cols-2 gap-4">
        <button
            onClick={() => downloadImage(currentImage, `restora-result-${Date.now()}.png`)}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-xl transition-colors font-medium"
        >
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
             </svg>
             Download Restored
        </button>

        <button
            onClick={createComparisonCanvas}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-xl transition-colors font-medium"
        >
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
             </svg>
             Download Comparison
        </button>
    </div>
  );
};

export default ResultActions;
