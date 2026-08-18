'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PixelWaveDish } from './PixelWaveDish';

const DISH_IMAGES = [
  '/assets/food/pasta.png',
  '/assets/food/grilled-chicken.png',
  '/assets/food/skillet-eggs.png',
  '/assets/food/taco-bowl.png',
  '/assets/food/grain-bowl.png'
];

export function PixelShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [scanDirection, setScanDirection] = useState<'horizontal' | 'vertical'>('horizontal');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const animFrameRef = useRef<number | null>(null);

  const triggerNextDish = () => {
    if (isScanning) return;
    const next = (currentIndex + 1) % DISH_IMAGES.length;

    setPrevIndex(currentIndex);
    setCurrentIndex(next);
    
    // Alternates strictly between horizontal and vertical laser scans
    setScanDirection((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'));
    setIsScanning(true);
    setScanProgress(0);

    const startTime = performance.now();
    const duration = 1200; // 1.2s smooth scan transition

    const animateScan = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      
      // Smooth cubic-out easing
      const eased = 1 - Math.pow(1 - progress, 3);
      setScanProgress(eased);

      if (progress < 1.0) {
        animFrameRef.current = requestAnimationFrame(animateScan);
      } else {
        setIsScanning(false);
        setPrevIndex(null);
        setScanProgress(1.0);
      }
    };

    animFrameRef.current = requestAnimationFrame(animateScan);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      triggerNextDish();
    }, 4500);

    return () => {
      clearInterval(interval);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [currentIndex, isScanning]);

  return (
    <div className="relative w-full flex items-center justify-center select-none">
      {/* Huge Food Arena (Dominates right side) */}
      <div className="relative w-full max-w-[620px] sm:max-w-[700px] lg:max-w-[780px] min-h-[360px] sm:min-h-[460px] lg:min-h-[560px] aspect-square flex items-center justify-center">
        
        {/* Ambient subtle backglow */}
        <div className="absolute inset-0 bg-radial from-white/[0.04] to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Preloaded WebGL Pixel-Wave Dish */}
        <PixelWaveDish
          currentIndex={currentIndex}
          prevIndex={prevIndex}
          isScanning={isScanning}
          scanDirection={scanDirection}
          scanProgress={scanProgress}
          dishImages={DISH_IMAGES}
          className="w-full h-full"
        />

      </div>
    </div>
  );
}
