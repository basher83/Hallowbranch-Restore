import React from 'react';
import { useApp } from '../context/AppContext';
import { DamageType, FacePreservation, Intensity, PhotoType, RestorationOptions, LocalRepairRegion, RepairType } from '../types';
import { geminiService } from '../services/geminiService';

const EnhancementControls: React.FC = () => {
  const { options, setOptions, currentSession, setProcessing, setError, addToHistory, activeTab, setActiveTab } = useApp();

  const handleGlobalChange = (key: keyof RestorationOptions, value: any) => {
    setOptions({ ...options, [key]: value });
  };

  const toggleDamage = (damage: DamageType) => {
    const current = options.damageTypes;
    const updated = current.includes(damage) 
      ? current.filter(d => d !== damage)
      : [...current, damage];
    handleGlobalChange('damageTypes', updated);
  };

  const handleProcess = async () => {
    if (!currentSession) return;
    setProcessing(true);
    setError(null);
    try {
      const result = await geminiService.startRestoration(currentSession.originalImageFile, options);
      addToHistory(result.imageUrl, result.prompt, 'initial');
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred during processing.");
    } finally {
      setProcessing(false);
    }
  };

  const updateRegion = (index: number, field: keyof LocalRepairRegion, value: any) => {
      const updated = [...options.localRepairRegions];
      updated[index] = { ...updated[index], [field]: value };
      setOptions({ ...options, localRepairRegions: updated });
  };

  const removeRegion = (index: number) => {
      const updated = options.localRepairRegions.filter((_, i) => i !== index);
      setOptions({ ...options, localRepairRegions: updated });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col overflow-hidden">
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button 
          onClick={() => setActiveTab('global')}
          className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'global' ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
        >
          Global Restore
        </button>
        <button 
          onClick={() => setActiveTab('local')}
          className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'local' ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
        >
          Local Repair
        </button>
      </div>

      <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
        {activeTab === 'global' ? (
          <div className="space-y-6">
            {/* Photo Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Photo Type</label>
              <select 
                value={options.photoType}
                onChange={(e) => handleGlobalChange('photoType', e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
              >
                {Object.values(PhotoType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Damage Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Damage Types</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(DamageType).map(damage => (
                  <label key={damage} className="flex items-center space-x-2 text-sm cursor-pointer">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Restoration Intensity</label>
              <div className="flex gap-2">
                {Object.values(Intensity).map(intensity => (
                  <button
                    key={intensity}
                    onClick={() => handleGlobalChange('intensity', intensity)}
                    className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium border transition-colors ${
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
                <span className="text-gray-700 dark:text-gray-300">Colorize</span>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={options.colorize}
                    disabled={options.photoType !== PhotoType.B_AND_W}
                    onChange={(e) => handleGlobalChange('colorize', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </div>
              </label>

              <label className="flex items-center justify-between text-sm cursor-pointer">
                <span className="text-gray-700 dark:text-gray-300">Preserve Grain</span>
                 <div className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={options.preserveGrain}
                    onChange={(e) => handleGlobalChange('preserveGrain', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </div>
              </label>
            </div>

            {/* Face Preservation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Face Preservation</label>
              <select 
                value={options.facePreservation}
                onChange={(e) => handleGlobalChange('facePreservation', e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
              >
                {Object.values(FacePreservation).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
             <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs text-indigo-800 dark:text-indigo-200">
               <p className="font-semibold mb-1">Interactive Selection Active</p>
               Click and drag on the image to select areas for specific repair instructions.
             </div>

             {options.localRepairRegions.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm italic">
                    No regions selected yet.
                </div>
             )}

             {options.localRepairRegions.map((region, idx) => (
                 <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2 group">
                     <div className="flex justify-between items-center">
                         <span className="text-xs font-semibold uppercase text-gray-500 group-hover:text-indigo-500">
                            Region {idx + 1} 
                            <span className="ml-2 font-normal lowercase text-gray-400">
                                (x:{Math.round(region.x)}%, y:{Math.round(region.y)}%)
                            </span>
                         </span>
                         <button onClick={() => removeRegion(idx)} className="text-gray-400 hover:text-red-500 transition-colors">&times;</button>
                     </div>
                     <select 
                        value={region.type} 
                        onChange={(e) => updateRegion(idx, 'type', e.target.value)}
                        className="w-full text-xs p-1.5 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
                     >
                         {Object.values(RepairType).map(t => <option key={t} value={t}>{t}</option>)}
                     </select>
                     <input 
                        type="text" 
                        placeholder="e.g. Remove stain, Fix tear..."
                        value={region.instruction || ''}
                        onChange={(e) => updateRegion(idx, 'instruction', e.target.value)}
                        className="w-full text-xs p-1.5 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
                     />
                 </div>
             ))}
          </div>
        )}
      </div>

      <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <button
          onClick={handleProcess}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Generate Restoration
        </button>
      </div>
    </div>
  );
};

export default EnhancementControls;
