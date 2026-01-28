import React from 'react';

interface PreEnhancePreviewModalProps {
  isOpen: boolean;
  originalUrl: string;
  enhancedUrl: string;
  onUseEnhanced: () => void;
  onSkip: () => void;
  onClose: () => void;
  isProcessing: boolean;
}

const PreEnhancePreviewModal: React.FC<PreEnhancePreviewModalProps> = ({
  isOpen,
  originalUrl,
  enhancedUrl,
  onUseEnhanced,
  onSkip,
  onClose,
  isProcessing,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pre-enhance-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Dismiss preview"
      />
      <div className="relative bg-white dark:bg-gray-900 rounded-none md:rounded-2xl shadow-2xl w-full h-full md:h-auto md:max-w-6xl mx-0 md:mx-4 border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2
            id="pre-enhance-title"
            className="text-lg font-semibold text-gray-900 dark:text-white text-balance"
          >
            Pre‑Enhance Preview
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 rounded"
          >
            &times;
          </button>
        </div>

        <div className="p-6 relative">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-pretty mb-4">
            Compare the pre‑enhanced image before sending to Gemini. Choose “Use Pre‑Enhanced” to
            proceed with this version, or “Skip” to use the original.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-pretty">
                Original
              </div>
              <img
                src={originalUrl}
                alt="Original preview"
                className="w-full h-[32rem] md:h-[38rem] lg:h-[44rem] object-contain bg-gray-50 dark:bg-gray-900"
              />
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-pretty">
                Pre‑Enhanced
              </div>
              <img
                src={enhancedUrl}
                alt="Pre-enhanced preview"
                className="w-full h-[32rem] md:h-[38rem] lg:h-[44rem] object-contain bg-gray-50 dark:bg-gray-900"
              />
            </div>
          </div>
          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3 text-white">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin motion-reduce:animate-none" />
                <span className="text-sm text-pretty">Sending to Gemini…</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex flex-col sm:flex-row gap-3 sm:justify-between">
          <button
            type="button"
            onClick={onSkip}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-gray-900 rounded"
          >
            Skip Pre‑Enhance
          </button>
          <button
            type="button"
            onClick={onUseEnhanced}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-gray-900"
          >
            {isProcessing ? 'Sending…' : 'Use Pre‑Enhanced'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreEnhancePreviewModal;
