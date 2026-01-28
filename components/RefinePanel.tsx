import React, { useState } from 'react';

import { MAX_REFINEMENT_TURNS } from '../constants';
import { useApp } from '../context/AppContext';
import { geminiService } from '../services/geminiService';

import ConfirmModal from './ConfirmModal';

const RefinePanel: React.FC = () => {
  const { currentSession, isProcessing, setProcessing, setError, addToHistory, resetSession } =
    useApp();
  const [instruction, setInstruction] = useState('');
  const [isRestartOpen, setIsRestartOpen] = useState(false);

  if (!currentSession || currentSession.history.length === 0) return null;

  const refinementCount = currentSession.history.filter((h) => h.type === 'refinement').length;
  const turnsLeft = MAX_REFINEMENT_TURNS - refinementCount;

  const handleRefine = async () => {
    if (!instruction.trim() || isProcessing || turnsLeft <= 0) return;

    setProcessing(true);
    setError(null);

    try {
      const lastImage = currentSession.history[currentSession.history.length - 1].imageUrl;
      const result = await geminiService.refineRestoration(
        instruction,
        lastImage,
        currentSession.originalImageFile,
      );
      addToHistory(result.imageUrl, result.prompt, 'refinement');
      setInstruction('');
    } catch (e: any) {
      setError(e.message || 'Refinement failed.');
    } finally {
      setProcessing(false);
    }
  };

  const handleRestart = () => {
    setIsRestartOpen(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2 text-balance">
        <svg
          className="w-5 h-5 text-indigo-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        Refine Result
      </h3>

      <div className="flex-1 overflow-y-auto max-h-40 space-y-3 custom-scrollbar pr-2">
        {currentSession.history.map((item, idx) => (
          <div
            key={item.id}
            className="text-sm border-l-2 border-indigo-200 dark:border-indigo-900 pl-3"
          >
            <span className="text-xs text-gray-400 block mb-1">
              {item.type === 'initial' ? 'Initial Restoration' : `Refinement #${idx}`}
            </span>
            <p className="text-gray-600 dark:text-gray-300 line-clamp-2 text-pretty">
              {item.promptUsed}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-2">
        {turnsLeft > 0 ? (
          <>
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              aria-label="Refinement instructions"
              placeholder="e.g., 'Make the eyes clearer', 'Remove the spot on the collar'…"
              name="refinement-instructions"
              autoComplete="off"
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              rows={2}
              disabled={isProcessing}
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-gray-400 text-pretty">
                {turnsLeft} refinements remaining
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-gray-800 rounded"
                >
                  Start Over
                </button>
                <button
                  type="button"
                  onClick={handleRefine}
                  disabled={!instruction.trim() || isProcessing}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-gray-800"
                >
                  {isProcessing ? 'Refining…' : 'Refine with AI'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 text-sm rounded-lg text-center text-pretty">
            Maximum refinements reached. Please download your result or start over.
          </div>
        )}
        <ConfirmModal
          isOpen={isRestartOpen}
          title="Start over?"
          message="This will clear your current progress and restore the original photo."
          confirmLabel="Start Over"
          cancelLabel="Cancel"
          onConfirm={() => {
            setIsRestartOpen(false);
            resetSession();
          }}
          onCancel={() => setIsRestartOpen(false)}
        />
      </div>
    </div>
  );
};

export default RefinePanel;
