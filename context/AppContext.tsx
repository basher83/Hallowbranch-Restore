import React, { createContext, useContext, useState, ReactNode } from 'react';

import { DEFAULT_OPTIONS } from '../constants';
import { AppState, RestorationOptions, RestorationSession, RestorationHistoryItem } from '../types';
import { generateThumbnail } from '../utils/imageUtils';

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

  const revokeBlobUrl = (url: string | undefined) => {
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
  };

  const startSession = (file: File) => {
    setCurrentSession((prev) => {
      if (prev) {
        revokeBlobUrl(prev.originalImageUrl);
        revokeBlobUrl(prev.baseImageUrl);
      }
      return null;
    });
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

    const itemId = Date.now().toString();

    const newItem: RestorationHistoryItem = {
      id: itemId,
      imageUrl,
      thumbnailUrl: imageUrl, // fallback until async thumbnail is ready
      promptUsed: prompt,
      timestamp: Date.now(),
      type,
    };

    setCurrentSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        history: [...prev.history, newItem],
        currentStepIndex: prev.history.length,
      };
    });

    generateThumbnail(imageUrl)
      .then((thumbUrl) => {
        setCurrentSession((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            history: prev.history.map((item) =>
              item.id === itemId ? { ...item, thumbnailUrl: thumbUrl } : item,
            ),
          };
        });
      })
      .catch(() => {
        // Thumbnail generation failed; keep the full-size fallback
      });
  };

  const resetSession = () => {
    setCurrentSession((prev) => {
      if (prev) {
        revokeBlobUrl(prev.originalImageUrl);
        revokeBlobUrl(prev.baseImageUrl);
      }
      return null;
    });
    setOptions(DEFAULT_OPTIONS);
    setError(null);
    setActiveTab('global');
    setModalOpen(false);
  };

  const updateOriginalImage = (file: File, url: string) => {
    setCurrentSession((prev) => {
      if (!prev) return null;
      revokeBlobUrl(prev.originalImageUrl);
      revokeBlobUrl(prev.baseImageUrl);
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
      if (prev.baseImageUrl !== prev.originalImageUrl) {
        revokeBlobUrl(prev.baseImageUrl);
      }
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
