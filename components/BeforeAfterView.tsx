import React, { useState, useRef, useEffect } from 'react';

import { useApp } from '../context/AppContext';
import { RepairType } from '../types';

const BeforeAfterView: React.FC = () => {
  const { currentSession, isProcessing, activeTab, options, setOptions, isModalOpen } = useApp();

  // State for comparison slider
  const [sliderPosition, setSliderPosition] = useState(50);

  // State for Viewport transform
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const panRef = useRef(pan);

  // State for Region Selection
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentRect, setCurrentRect] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const currentRectRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const sliderPositionRef = useRef(sliderPosition);
  const pendingPanRef = useRef<{ x: number; y: number } | null>(null);
  const pendingRectRef = useRef<{ x: number; y: number; w: number; h: number } | null | undefined>(
    undefined,
  );
  const pendingSliderRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const originalUrl = currentSession?.originalImageUrl;
  const restoredUrl = currentSession?.history.length
    ? currentSession.history[currentSession.history.length - 1].imageUrl
    : null;

  // Determine which image to show/edit
  // In Local mode, we prefer the restored image if available to further refine it,
  // otherwise the original.
  const displayUrl =
    activeTab === 'local' ? restoredUrl || originalUrl : restoredUrl || originalUrl;

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (restoredUrl) setSliderPosition(50);
  }, [restoredUrl]);

  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  useEffect(() => {
    currentRectRef.current = currentRect;
  }, [currentRect]);

  useEffect(() => {
    sliderPositionRef.current = sliderPosition;
  }, [sliderPosition]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const scheduleRender = () => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (pendingPanRef.current) {
        setPan(pendingPanRef.current);
        pendingPanRef.current = null;
      }
      if (pendingRectRef.current !== undefined) {
        setCurrentRect(pendingRectRef.current);
        pendingRectRef.current = undefined;
      }
      if (pendingSliderRef.current !== null) {
        setSliderPosition(pendingSliderRef.current);
        pendingSliderRef.current = null;
      }
    });
  };

  const setSliderPercent = (value: number) => {
    const clamped = Math.max(0, Math.min(100, value));
    sliderPositionRef.current = clamped;
    pendingSliderRef.current = clamped;
    scheduleRender();
  };

  // --- Interaction Handlers ---

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTab === 'global' && restoredUrl) {
      // Slider interaction is handled by the slider element itself
      return;
    }

    // In Local mode: check modifiers for Pan vs Select
    if (activeTab === 'local') {
      const isShift = e.shiftKey;
      if (isShift) {
        // Pan
        e.preventDefault();
        setIsPanning(true);
        panStartRef.current = { x: e.clientX - panRef.current.x, y: e.clientY - panRef.current.y };
      } else {
        // Start Drawing
        if (!imageRef.current) return;
        e.preventDefault();
        const rect = imageRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / zoom;
        const y = (e.clientY - rect.top) / zoom;

        setIsDrawing(true);
        setStartPos({ x, y });
        const nextRect = { x, y, w: 0, h: 0 };
        currentRectRef.current = nextRect;
        pendingRectRef.current = nextRect;
        scheduleRender();
      }
    } else {
      // Global mode pan (if zoomed)
      if (zoom > 1) {
        e.preventDefault();
        setIsPanning(true);
        panStartRef.current = { x: e.clientX - panRef.current.x, y: e.clientY - panRef.current.y };
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const nextPan = {
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      };
      panRef.current = nextPan;
      pendingPanRef.current = nextPan;
      scheduleRender();
      return;
    }

    if (isDrawing && imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      const currentX = (e.clientX - rect.left) / zoom;
      const currentY = (e.clientY - rect.top) / zoom;

      const w = currentX - startPos.x;
      const h = currentY - startPos.y;

      const nextRect = {
        x: w > 0 ? startPos.x : currentX,
        y: h > 0 ? startPos.y : currentY,
        w: Math.abs(w),
        h: Math.abs(h),
      };
      currentRectRef.current = nextRect;
      pendingRectRef.current = nextRect;
      scheduleRender();
    }

    // Slider Drag logic
    if (
      activeTab === 'global' &&
      e.buttons === 1 &&
      containerRef.current &&
      !isPanning &&
      !isDrawing
    ) {
      // We only check if target is slider-handle-area logic handled in slider div?
      // Actually slider logic was separate. If we are just moving mouse over container without special state,
      // we might update slider if dragging the slider handle.
      // Since slider handle has its own onMouseDown, we need to know if we are dragging IT.
      // To keep it simple: slider updates happen in handleSliderMove which is called if we track slider state.
    }
  };

  const handleMouseUp = () => {
    if (isPanning) setIsPanning(false);

    if (isDrawing && currentRectRef.current && imageRef.current) {
      setIsDrawing(false);
      // Commit the region
      // Calculate percentages
      const imgW = imageRef.current.offsetWidth;
      const imgH = imageRef.current.offsetHeight;

      // Avoid tiny accidental clicks
      if (currentRectRef.current.w > 5 && currentRectRef.current.h > 5) {
        const newRegion = {
          x: (currentRectRef.current.x / imgW) * 100,
          y: (currentRectRef.current.y / imgH) * 100,
          width: (currentRectRef.current.w / imgW) * 100,
          height: (currentRectRef.current.h / imgH) * 100,
          type: RepairType.FIX_DAMAGE,
          instruction: '',
        };
        setOptions({
          ...options,
          localRepairRegions: [...options.localRepairRegions, newRegion],
        });
      }
      currentRectRef.current = null;
      pendingRectRef.current = null;
      scheduleRender();
    }
  };

  // Slider specific handler
  const handleSliderDrag = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      setSliderPercent((x / rect.width) * 100);
    }
  };

  if (!currentSession) return null;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden relative">
      {/* Toolbar */}
      <div className="h-12 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 bg-gray-50 dark:bg-gray-800 z-10">
        <div className="flex space-x-2 items-center">
          <button
            type="button"
            onClick={resetView}
            className="text-xs px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-gray-800"
          >
            Fit
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => z + 0.5)}
            className="text-xs px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-gray-800"
          >
            Zoom +
          </button>
          <span className="text-xs text-gray-400 ml-2">{(zoom * 100).toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-4">
          {activeTab === 'local' && (
            <span className="text-xs font-medium text-indigo-500 animate-pulse bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded motion-reduce:animate-none">
              Draw box to select area (Shift+Drag to Pan)
            </span>
          )}
          <span className="text-xs font-medium text-gray-500 hidden sm:block">
            {activeTab === 'global' && restoredUrl
              ? 'Drag slider to compare'
              : activeTab === 'local'
                ? 'Local Repair Mode'
                : 'Original Preview'}
          </span>
        </div>
      </div>

      {/* Main Viewport */}
      <div
        ref={containerRef}
        className={`relative flex-1 overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] dark:bg-gray-900 ${activeTab === 'local' ? 'cursor-crosshair' : 'cursor-default'}`}
        role="region"
        aria-label="Image workspace"
        tabIndex={0}
        onMouseMove={(e) => {
          handleMouseMove(e);
          if (activeTab === 'global' && e.buttons === 1 && !isPanning) handleSliderDrag(e);
        }}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseDown={handleMouseDown}
        onKeyDown={(e) => {
          if (e.key === '+' || e.key === '=') {
            e.preventDefault();
            setZoom((z) => z + 0.5);
            return;
          }
          if (e.key === '-') {
            e.preventDefault();
            setZoom((z) => Math.max(1, z - 0.5));
            return;
          }
          if (e.key === '0') {
            e.preventDefault();
            resetView();
            return;
          }
          if (e.key.startsWith('Arrow')) {
            e.preventDefault();
            const step = 20;
            const nextPan = {
              x:
                panRef.current.x +
                (e.key === 'ArrowLeft' ? step : e.key === 'ArrowRight' ? -step : 0),
              y:
                panRef.current.y + (e.key === 'ArrowUp' ? step : e.key === 'ArrowDown' ? -step : 0),
            };
            panRef.current = nextPan;
            pendingPanRef.current = nextPan;
            scheduleRender();
          }
        }}
      >
        {/* Loading Overlay */}
        {isProcessing && !isModalOpen && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
            <div
              className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin motion-reduce:animate-none mb-4"
              aria-hidden="true"
            ></div>
            <p className="text-white font-medium animate-pulse motion-reduce:animate-none text-pretty">
              Restoring memories…
            </p>
          </div>
        )}

        {/* Content Container with Transform */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-transform duration-75 origin-center"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
          }}
        >
          {/* Wrapper for Image + Overlays to ensure same coordinate space */}
          <div className="relative inline-block max-w-full max-h-full">
            <img
              ref={imageRef}
              src={displayUrl}
              alt="Workarea"
              width={1200}
              height={800}
              loading="lazy"
              className="max-w-full max-h-[calc(100vh-14rem)] object-contain pointer-events-none select-none shadow-2xl block"
              draggable={false}
            />

            {/* Global Compare Overlay (Only visible in Global mode with result) */}
            {activeTab === 'global' && restoredUrl && (
              <div
                className="absolute inset-0 pointer-events-none select-none"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <img
                  src={originalUrl}
                  alt="Original"
                  width={1200}
                  height={800}
                  loading="lazy"
                  className="w-full h-full object-contain"
                  draggable={false}
                />
                <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-md text-pretty">
                  Original
                </div>
              </div>
            )}

            {activeTab === 'global' && restoredUrl && (
              <div className="absolute top-4 right-4 bg-indigo-600/80 text-white text-xs px-2 py-1 rounded backdrop-blur-md text-pretty">
                Restored
              </div>
            )}

            {/* Local Repair Overlays */}
            {activeTab === 'local' && (
              <>
                {/* Existing Regions */}
                {options.localRepairRegions.map((r, i) => (
                  <div
                    key={i}
                    className="absolute border-2 border-indigo-500 bg-indigo-500/20 hover:bg-indigo-500/30 flex items-center justify-center text-white text-xs font-bold rounded-sm pointer-events-none"
                    style={{
                      left: `${r.x}%`,
                      top: `${r.y}%`,
                      width: `${r.width}%`,
                      height: `${r.height}%`,
                    }}
                  >
                    <span className="bg-indigo-600 px-1 rounded shadow-sm">{i + 1}</span>
                  </div>
                ))}

                {/* Drawing Rect */}
                {currentRect && (
                  <div
                    className="absolute border-2 border-white bg-white/20 shadow-sm"
                    style={{
                      left: currentRect.x,
                      top: currentRect.y,
                      width: currentRect.w,
                      height: currentRect.h,
                    }}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Global Slider Handle */}
        {activeTab === 'global' && restoredUrl && !isProcessing && (
          <div
            className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize z-20 image-compare-handle hover:bg-indigo-400 transition-colors"
            style={{ left: `${sliderPosition}%` }}
            role="slider"
            aria-label="Comparison slider"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(sliderPosition)}
            tabIndex={0}
            onMouseDown={(e) => {
              e.stopPropagation(); /* Let parent handle logic via button check */
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') {
                e.preventDefault();
                setSliderPercent(sliderPositionRef.current - 5);
              }
              if (e.key === 'ArrowRight') {
                e.preventDefault();
                setSliderPercent(sliderPositionRef.current + 5);
              }
              if (e.key === 'Home') {
                e.preventDefault();
                setSliderPercent(0);
              }
              if (e.key === 'End') {
                e.preventDefault();
                setSliderPercent(100);
              }
            }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeforeAfterView;
