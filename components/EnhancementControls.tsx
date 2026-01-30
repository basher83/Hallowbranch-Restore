import React, { useState } from 'react';

import { PRE_ENHANCE_MAX_DIM } from '../constants';
import { useApp } from '../context/AppContext';
import { geminiService } from '../services/geminiService';
import {
  DamageType,
  FacePreservation,
  Intensity,
  PhotoType,
  RestorationOptions,
  LocalRepairRegion,
  RepairType,
} from '../types';
import { getImageDimensions, preEnhanceImage } from '../utils/preEnhance';

import PreEnhancePreviewModal from './PreEnhancePreviewModal';

const EnhancementControls: React.FC = () => {
  const {
    options,
    setOptions,
    currentSession,
    setProcessing,
    isProcessing,
    setError,
    addToHistory,
    activeTab,
    setActiveTab,
    updateBaseImage,
    setModalOpen,
  } = useApp();
  const [isPreEnhancing, setIsPreEnhancing] = useState(false);
  const [previewOriginal, setPreviewOriginal] = useState<string | null>(null);
  const [previewEnhanced, setPreviewEnhanced] = useState<string | null>(null);
  const [pendingFileForPreview, setPendingFileForPreview] = useState<File | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [preEnhanceInfo, setPreEnhanceInfo] = useState<string | null>(null);
  const [isPreEnhanceEligible, setIsPreEnhanceEligible] = useState(false);

  const isSubmitting = isProcessing || isPreEnhancing;

  const cleanupPreview = () => {
    setPreviewOriginal(null);
    setPreviewEnhanced(null);
    setPendingFileForPreview(null);
    setIsPreviewOpen(false);
    setModalOpen(false);
    setProcessing(false);
  };

  const handleGlobalChange = <K extends keyof RestorationOptions>(
    key: K,
    value: RestorationOptions[K],
  ) => {
    setOptions({ ...options, [key]: value });
  };

  const toggleDamage = (damage: DamageType) => {
    const current = options.damageTypes;
    const updated = current.includes(damage)
      ? current.filter((d) => d !== damage)
      : [...current, damage];
    handleGlobalChange('damageTypes', updated);
  };

  const finalizeRestoration = async (fileToProcess: File) => {
    const result = await geminiService.startRestoration(fileToProcess, options);
    addToHistory(result.imageUrl, result.prompt, 'initial');
  };

  const handleProcess = async () => {
    if (!currentSession) return;
    setProcessing(true);
    setError(null);
    try {
      if (options.preEnhance) {
        setIsPreEnhancing(true);
        const sourceUrl = currentSession.baseImageUrl || currentSession.originalImageUrl;
        try {
          const enhancedUrl = await preEnhanceImage(sourceUrl, currentSession.originalImageFile);
          setPreEnhanceInfo(null);
          const response = await fetch(enhancedUrl);
          const blob = await response.blob();
          const enhancedFile = new File([blob], 'enhanced.png', {
            type: blob.type || 'image/png',
          });
          setIsPreEnhancing(false);

          setPreviewOriginal(sourceUrl);
          setPreviewEnhanced(enhancedUrl);
          setPendingFileForPreview(enhancedFile);
          setIsPreviewOpen(true);
          setModalOpen(true);
          setProcessing(false);
          return;
        } catch (error: unknown) {
          setIsPreEnhancing(false);
          const message =
            (error instanceof Error && error.message) ||
            'Pre-enhance failed. Try disabling pre-enhance or use a smaller crop.';
          setError(message);
          setPreEnhanceInfo(
            `${message} Large images may exceed GPU texture limits after 2× upscaling.`,
          );
          setProcessing(false);
          return;
        }
      } else {
        updateBaseImage(currentSession.originalImageFile, currentSession.originalImageUrl);
        await finalizeRestoration(currentSession.originalImageFile);
      }
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'An unexpected error occurred during processing.';
      setError(message);
    } finally {
      setIsPreEnhancing(false);
      setProcessing(false);
    }
  };

  const updateRegion = <K extends keyof LocalRepairRegion>(
    index: number,
    field: K,
    value: LocalRepairRegion[K],
  ) => {
    const updated = [...options.localRepairRegions];
    updated[index] = { ...updated[index], [field]: value };
    setOptions({ ...options, localRepairRegions: updated });
  };

  const removeRegion = (index: number) => {
    const updated = options.localRepairRegions.filter((_, i) => i !== index);
    setOptions({ ...options, localRepairRegions: updated });
  };

  React.useEffect(() => {
    const computeEligibility = async () => {
      if (!currentSession) {
        setIsPreEnhanceEligible(false);
        return;
      }

      try {
        const sourceUrl = currentSession.baseImageUrl || currentSession.originalImageUrl;
        const sourceFile = currentSession.baseImageFile || currentSession.originalImageFile;
        const { width, height } = await getImageDimensions(sourceUrl, sourceFile);
        const maxDim = Math.max(width, height);
        setIsPreEnhanceEligible(maxDim <= PRE_ENHANCE_MAX_DIM);
      } catch {
        setIsPreEnhanceEligible(false);
      }
    };

    computeEligibility();
  }, [currentSession]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col overflow-hidden">
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setActiveTab('global')}
          className={`flex-1 py-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-800 ${activeTab === 'global' ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
        >
          Global Restore
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('local')}
          className={`flex-1 py-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-800 ${activeTab === 'local' ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
        >
          Local Repair
        </button>
      </div>

      <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
        {activeTab === 'global' ? (
          <div className="space-y-6">
            {/* Photo Type */}
            <div>
              <label
                htmlFor="photo-type"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-balance"
              >
                Photo Type
              </label>
              <select
                id="photo-type"
                value={options.photoType}
                onChange={(e) => handleGlobalChange('photoType', e.target.value)}
                name="photoType"
                autoComplete="off"
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
              >
                {Object.values(PhotoType).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Damage Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-balance">
                Damage Types
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(DamageType).map((damage) => (
                  <label
                    key={damage}
                    className="flex items-center space-x-2 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={options.damageTypes.includes(damage)}
                      onChange={() => toggleDamage(damage)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="text-gray-600 dark:text-gray-400">{damage}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Intensity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-balance">
                Restoration Intensity
              </label>
              <div className="flex gap-2">
                {Object.values(Intensity).map((intensity) => (
                  <button
                    type="button"
                    key={intensity}
                    onClick={() => handleGlobalChange('intensity', intensity)}
                    className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-gray-700 ${
                      options.intensity === intensity
                        ? 'bg-indigo-100 border-indigo-500 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                        : 'bg-white border-gray-300 text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {intensity}
                  </button>
                ))}
              </div>
            </div>

            {/* Colorize & Grain */}
            <div className="space-y-3">
              <label className="flex items-center justify-between text-sm cursor-pointer">
                <span className="text-gray-700 dark:text-gray-300 text-balance">Colorize</span>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={options.colorize}
                    disabled={options.photoType !== PhotoType.B_AND_W}
                    onChange={(e) => handleGlobalChange('colorize', e.target.checked)}
                    aria-label="Colorize"
                    name="colorize"
                    autoComplete="off"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-transform dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </div>
              </label>

              <label className="flex items-center justify-between text-sm cursor-pointer">
                <span className="text-gray-700 dark:text-gray-300 text-balance">
                  Preserve Grain
                </span>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={options.preserveGrain}
                    onChange={(e) => handleGlobalChange('preserveGrain', e.target.checked)}
                    aria-label="Preserve grain"
                    name="preserveGrain"
                    autoComplete="off"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-transform dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </div>
              </label>
            </div>

            {/* Face Preservation */}
            <div>
              <label
                htmlFor="face-preservation"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-balance"
              >
                Face Preservation
              </label>
              <select
                id="face-preservation"
                value={options.facePreservation}
                onChange={(e) => handleGlobalChange('facePreservation', e.target.value)}
                name="facePreservation"
                autoComplete="off"
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
              >
                {Object.values(FacePreservation).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Pre-Enhance */}
            {isPreEnhanceEligible ? (
              <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <label className="flex items-center justify-between text-sm cursor-pointer">
                  <span className="text-gray-700 dark:text-gray-300 text-balance">
                    Pre-Enhance (ESRGAN 2×)
                  </span>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={options.preEnhance}
                      onChange={(e) => handleGlobalChange('preEnhance', e.target.checked)}
                      aria-label="Pre-enhance with ESRGAN"
                      name="preEnhance"
                      autoComplete="off"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-transform dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                  </div>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-pretty">
                  Best for small or soft scans. Large images can exceed GPU limits.
                </p>
                {preEnhanceInfo && (
                  <p className="text-xs text-amber-500 mt-2 text-pretty">{preEnhanceInfo}</p>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 text-pretty">
                Pre-Enhance is hidden for large images. Crop to under {PRE_ENHANCE_MAX_DIM}px on the
                long edge to enable it.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs text-indigo-800 dark:text-indigo-200 text-pretty">
              <p className="font-semibold mb-1">Interactive Selection Active</p>
              Click and drag on the image to select areas for specific repair instructions.
            </div>

            {options.localRepairRegions.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm italic text-pretty">
                No regions selected yet.
              </div>
            )}

            {options.localRepairRegions.map((region, idx) => (
              <div
                key={idx}
                className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2 group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase text-gray-500 group-hover:text-indigo-500">
                    Region {idx + 1}
                    <span className="ml-2 font-normal lowercase text-gray-400">
                      (x:{Math.round(region.x)}%, y:{Math.round(region.y)}%)
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeRegion(idx)}
                    aria-label={`Remove region ${idx + 1}`}
                    className="text-gray-400 hover:text-red-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-gray-700 rounded"
                  >
                    &times;
                  </button>
                </div>
                <select
                  aria-label={`Region ${idx + 1} repair type`}
                  value={region.type}
                  onChange={(e) => updateRegion(idx, 'type', e.target.value)}
                  name={`region-${idx + 1}-type`}
                  autoComplete="off"
                  className="w-full text-xs p-1.5 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
                >
                  {Object.values(RepairType).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  aria-label={`Region ${idx + 1} repair instruction`}
                  placeholder="e.g. Remove stain, Fix tear…"
                  value={region.instruction || ''}
                  onChange={(e) => updateRegion(idx, 'instruction', e.target.value)}
                  name={`region-${idx + 1}-instruction`}
                  autoComplete="off"
                  className="w-full text-xs p-1.5 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <button
          type="button"
          onClick={handleProcess}
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition-transform duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-gray-800"
        >
          {isPreEnhancing ? 'Pre-enhancing…' : 'Generate Restoration'}
        </button>
      </div>

      <PreEnhancePreviewModal
        isOpen={isPreviewOpen && !!previewOriginal && !!previewEnhanced}
        originalUrl={previewOriginal || ''}
        enhancedUrl={previewEnhanced || ''}
        isProcessing={isProcessing}
        onUseEnhanced={async () => {
          if (!pendingFileForPreview) return;
          setProcessing(true);
          try {
            updateBaseImage(pendingFileForPreview, previewEnhanced || '');
            await finalizeRestoration(pendingFileForPreview);
          } catch (e: unknown) {
            const message =
              e instanceof Error ? e.message : 'An unexpected error occurred during processing.';
            setError(message);
          } finally {
            cleanupPreview();
          }
        }}
        onSkip={async () => {
          if (!currentSession) return;
          setProcessing(true);
          try {
            updateBaseImage(currentSession.originalImageFile, currentSession.originalImageUrl);
            await finalizeRestoration(currentSession.originalImageFile);
          } catch (e: unknown) {
            const message =
              e instanceof Error ? e.message : 'An unexpected error occurred during processing.';
            setError(message);
          } finally {
            cleanupPreview();
          }
        }}
        onClose={() => {
          cleanupPreview();
        }}
      />
    </div>
  );
};

export default EnhancementControls;
