import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { geminiService } from '../services/geminiService';
import { MAX_REFINEMENT_TURNS } from '../constants';

const RefinePanel: React.FC = () => {
  const { currentSession, isProcessing, setProcessing, setError, addToHistory, resetSession } = useApp();
  const [instruction, setInstruction] = useState("");

  if (!currentSession || currentSession.history.length === 0) return null;

  const refinementCount = currentSession.history.filter(h => h.type === 'refinement').length;
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
          currentSession.originalImageFile
      );
      addToHistory(result.imageUrl, result.prompt, 'refinement');
      setInstruction("");
    } catch (e: any) {
      setError(e.message || "Refinement failed.");
    } finally {
      setProcessing(false);
    }
  };

  const handleRestart = () => {
      // In a real app we might want to just revert to history[0], but here we can just clear refinement history or reset fully
      // The prompt requirement says "Start over from original" which usually means full reset or reverting to step 1.
      // Let's reload page logic or just clear history. 
      // Simplest: just confirm dialog -> resetSession() or slice history.
      // Let's implement full reset for simplicity as per "ResultActions" usually handles download.
      if (confirm("This will clear your current progress. Start over?")) {
          resetSession();
      }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
         <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
         </svg>
         Refine Result
      </h3>

      <div className="flex-1 overflow-y-auto max-h-40 space-y-3 custom-scrollbar pr-2">
         {currentSession.history.map((item, idx) => (
             <div key={item.id} className="text-sm border-l-2 border-indigo-200 dark:border-indigo-900 pl-3">
                 <span className="text-xs text-gray-400 block mb-1">
                     {item.type === 'initial' ? 'Initial Restoration' : `Refinement #${idx}`}
                 </span>
                 <p className="text-gray-600 dark:text-gray-300 line-clamp-2">{item.promptUsed}</p>
             </div>
         ))}
      </div>

      <div className="mt-2">
         {turnsLeft > 0 ? (
             <>
                <textarea
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder="e.g., 'Make the eyes clearer', 'Remove the spot on the collar'..."
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    rows={2}
                    disabled={isProcessing}
                />
                <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-400">{turnsLeft} refinements remaining</span>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleRestart}
                            className="px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            Start Over
                        </button>
                        <button
                            onClick={handleRefine}
                            disabled={!instruction.trim() || isProcessing}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            {isProcessing ? 'Refining...' : 'Refine with AI'}
                        </button>
                    </div>
                </div>
             </>
         ) : (
             <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 text-sm rounded-lg text-center">
                 Maximum refinements reached. Please download your result or start over.
             </div>
         )}
      </div>
    </div>
  );
};

export default RefinePanel;
