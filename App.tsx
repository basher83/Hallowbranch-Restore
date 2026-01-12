import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import ImageUpload from './components/ImageUpload';
import EnhancementControls from './components/EnhancementControls';
import BeforeAfterView from './components/BeforeAfterView';
import RefinePanel from './components/RefinePanel';
import ResultActions from './components/ResultActions';
import Header from './components/Header';
import { geminiService } from './services/geminiService';

const MainLayout: React.FC = () => {
  const { currentSession, error, setError, isProcessing } = useApp();
  
  // Initialize AI service once on mount
  useEffect(() => {
     geminiService.initialize().catch(console.error);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200 font-sans">
      <Header />
      
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 lg:p-8">
        
        {error && (
            <div className="mb-6 mx-auto max-w-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                    <h4 className="text-sm font-semibold text-red-800 dark:text-red-200">Error</h4>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">&times;</button>
            </div>
        )}

        {!currentSession ? (
          <ImageUpload />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
            
            {/* Left Column: Controls */}
            <div className="lg:col-span-3 flex flex-col gap-4 h-full overflow-hidden">
               <EnhancementControls />
            </div>

            {/* Middle Column: Preview */}
            <div className="lg:col-span-6 h-full flex flex-col">
               <BeforeAfterView />
            </div>

            {/* Right Column: Actions & Refine */}
            <div className="lg:col-span-3 flex flex-col gap-4 h-full">
               <RefinePanel />
               <div className="mt-auto">
                   <ResultActions />
               </div>
               
               {/* Gallery Preview / Session History (Mini) */}
               {currentSession.history.length > 1 && (
                   <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                       <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Session History</h4>
                       <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                           {currentSession.history.map((item, idx) => (
                               <img 
                                key={item.id} 
                                src={item.imageUrl} 
                                alt={`Step ${idx}`}
                                className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600 shrink-0 cursor-pointer hover:border-indigo-500" 
                               />
                           ))}
                       </div>
                   </div>
               )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;
