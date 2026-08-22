'use client';

import React from 'react';

interface PixelWaveDishProps {
  currentIndex: number;
  prevIndex?: number | null;
  isScanning: boolean;
  scanProgress: number;
  dishImages: string[];
  className?: string;
}

export function PixelWaveDish({
  currentIndex,
  prevIndex,
  isScanning,
  dishImages,
  className = ""
}: PixelWaveDishProps) {
  const currentSrc = dishImages[currentIndex];
  const prevSrc = prevIndex !== null && prevIndex !== undefined ? dishImages[prevIndex] : null;

  return (
    <div className={`relative w-full h-full flex items-center justify-center select-none overflow-hidden ${className}`}>
      {/* Previous Dish during transition */}
      {isScanning && prevSrc && (
        <img
          key={`prev-${prevSrc}`}
          src={prevSrc}
          alt="Previous dish"
          className="absolute inset-0 w-full h-full object-contain [image-rendering:pixelated] opacity-0 transition-opacity duration-300 ease-out pointer-events-none"
        />
      )}

      {/* Current Active Dish */}
      {currentSrc && (
        <img
          key={`current-${currentSrc}`}
          src={currentSrc}
          alt="Current active dish"
          className="w-full h-full object-contain [image-rendering:pixelated] animate-in fade-in zoom-in-95 duration-300 ease-out drop-shadow-[15px_15px_0px_rgba(26,54,41,0.12)]"
        />
      )}
    </div>
  );
}
