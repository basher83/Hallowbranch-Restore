import React, { createContext, useContext, useState, ReactNode } from 'react';

import { DEFAULT_OPTIONS } from '../constants';
import { AppState, RestorationOptions, RestorationSession, RestorationHistoryItem } from '../types';

interface AppContextType extends AppState {
  setApiKey: (key: string) => void;
  setOptions: (options: RestorationOptions) => void;
  startSession: (file: File) => void;
  updateOriginalImage: (file: File, url: string) => void;
  updateBaseImage: (file: File, url: string) => void;
  addToHistory: (imageUrl: string, prompt: string, type: 'initial' | 'refinement') => void;
  setProcessing: (isProcessing: boolean) => void;
  setError: (error: string | null) => void;
  resetSession: () => void;
  setActiveTab: (tab: 'global' | 'local') => void;
  setModalOpen: (isOpen: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<RestorationSession | null>(null);
  const [options, setOptions] = useState<RestorationOptions>(DEFAULT_OPTIONS);
  const [isProcessing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'global' | 'local'>('global');
  const [isModalOpen, setModalOpen] = useState(false);

  const setApiKey = (key: string) => setApiKeyState(key);

  const startSession = (file: File) => {
    const url = URL.createObjectURL(file);
    setCurrentSession({
      id: Date.now().toString(),
      originalImageUrl: url,
      originalImageFile: file,
      baseImageUrl: url,
      baseImageFile: file,
      history: [],
      currentStepIndex: -1,
    });
    setError(null);
  };

  const addToHistory = (imageUrl: string, prompt: string, type: 'initial' | 'refinement') => {
    if (!currentSession) return;

    const newItem: RestorationHistoryItem = {
      id: Date.now().toString(),
      imageUrl,
      thumbnailUrl: imageUrl,
      promptUsed: prompt,
      timestamp: Date.now(),
      type,
    };

    setCurrentSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        history: [...prev.history, newItem],
        currentStepIndex: prev.history.length, // index of the new item
      };
    });
  };

  const resetSession = () => {
    setCurrentSession(null);
    setOptions(DEFAULT_OPTIONS);
    setError(null);
    setActiveTab('global');
    setModalOpen(false);
  };

  const updateOriginalImage = (file: File, url: string) => {
    setCurrentSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        originalImageUrl: url,
        originalImageFile: file,
        baseImageUrl: url,
        baseImageFile: file,
      };
    });
  };

  const updateBaseImage = (file: File, url: string) => {
    setCurrentSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        baseImageUrl: url,
        baseImageFile: file,
      };
    });
  };

  return (
    <AppContext.Provider
      value={{
        apiKey,
        currentSession,
        options,
        isProcessing,
        error,
        activeTab,
        isModalOpen,
        setApiKey,
        setOptions,
        startSession,
        updateOriginalImage,
        updateBaseImage,
        addToHistory,
        setProcessing,
        setError,
        resetSession,
        setActiveTab,
        setModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
