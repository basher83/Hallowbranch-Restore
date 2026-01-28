import React, { useState } from 'react';

import { useApp } from '../context/AppContext';

const ResultActions: React.FC = () => {
  const { currentSession } = useApp();
  const [showComparison, setShowComparison] = useState(false);

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

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => downloadImage(currentImage, `restora-result-${Date.now()}.png`)}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-xl transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-gray-800"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download Restored
        </button>

        <button
          type="button"
          onClick={() => setShowComparison((prev) => !prev)}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-xl transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-gray-800"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          {showComparison ? 'Hide Comparison' : 'Show Comparison'}
        </button>
      </div>

      {showComparison && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-pretty">
              Original
            </div>
            <img
              src={originalImage}
              alt="Original"
              width={320}
              height={224}
              loading="lazy"
              className="w-full h-40 md:h-48 lg:h-56 object-cover"
            />
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-pretty">
              Restored
            </div>
            <img
              src={currentImage}
              alt="Restored"
              width={320}
              height={224}
              loading="lazy"
              className="w-full h-40 md:h-48 lg:h-56 object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultActions;
