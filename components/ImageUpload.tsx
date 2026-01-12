import React, { useCallback, useState } from 'react';
import { useApp } from '../context/AppContext';
import { MAX_FILE_SIZE_MB } from '../constants';

const ImageUpload: React.FC = () => {
  const { startSession, setError } = useApp();
  const [isDragging, setIsDragging] = useState(false);

  const validateAndProcess = (file: File) => {
    if (!file.type.match(/image\/(jpeg|png)/)) {
      setError("Only JPEG and PNG files are allowed.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
      return;
    }
    startSession(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndProcess(file);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcess(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`w-full max-w-2xl mx-auto mt-10 p-10 border-2 border-dashed rounded-xl text-center transition-all duration-200 
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
          : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
        }`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <div className="flex flex-col items-center gap-4">
        <svg className="w-16 h-16 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
          Upload your family photo
        </h3>
        
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Drag and drop here, or click to select
        </p>

        <label className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg cursor-pointer transition-colors shadow-lg shadow-indigo-500/30">
          <span>Select File</span>
          <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={onFileSelect} />
        </label>

        <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg max-w-md">
          <p className="text-xs text-indigo-800 dark:text-indigo-200 leading-relaxed">
            <strong>Tip:</strong> For best results, scan at 600+ DPI. Avoid heavy preprocessing—the AI works best with original scans. Supported: PNG, JPEG (Max {MAX_FILE_SIZE_MB}MB).
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
