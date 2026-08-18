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
    
    // Toggle strictly between horizontal and vertical scan transitions
    setScanDirection((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'));
    setIsScanning(true);
    setScanProgress(0);

    const startTime = performance.now();
    const duration = 1200; // 1.2s smooth laser scan transition

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
      {/* Huge Food Arena (Dominates the right side) */}
      <div className="relative w-full max-w-[600px] sm:max-w-[680px] lg:max-w-[760px] aspect-square flex items-center justify-center">
        
        {/* Subtle ambient backglow */}
        <div className="absolute inset-0 bg-radial from-white/[0.03] to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        {/* WebGL Pixel-Wave Dish (Stationary plate, gentle food wave, horizontal/vertical scan) */}
        <PixelWaveDish
          currentImage={DISH_IMAGES[currentIndex]}
          prevImage={prevIndex !== null ? DISH_IMAGES[prevIndex] : null}
          isScanning={isScanning}
          scanDirection={scanDirection}
          scanProgress={scanProgress}
          className="w-full h-full"
        />

      </div>
    </div>
  );
}
