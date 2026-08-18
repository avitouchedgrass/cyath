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

  const currentIndexRef = useRef(0);
  const isScanningRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);

  const triggerNextDish = () => {
    if (isScanningRef.current) return;
    isScanningRef.current = true;
    setIsScanning(true);

    const prev = currentIndexRef.current;
    const next = (prev + 1) % DISH_IMAGES.length;

    setPrevIndex(prev);
    setCurrentIndex(next);
    currentIndexRef.current = next;
    setScanDirection((dir) => (dir === 'horizontal' ? 'vertical' : 'horizontal'));
    setScanProgress(0);

    const startTime = performance.now();
    const duration = 1200; // 1.2s smooth scan transition

    const animateScan = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      const eased = 1 - Math.pow(1 - progress, 3);
      setScanProgress(eased);

      if (progress < 1.0) {
        animFrameRef.current = requestAnimationFrame(animateScan);
      } else {
        setIsScanning(false);
        isScanningRef.current = false;
        setPrevIndex(null);
        setScanProgress(1.0);
      }
    };

    animFrameRef.current = requestAnimationFrame(animateScan);
  };

  useEffect(() => {
    // 4-second cycling timer
    const interval = setInterval(() => {
      triggerNextDish();
    }, 4000);

    return () => {
      clearInterval(interval);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className="relative w-full flex items-center justify-center select-none">
      {/* Food Arena with Seamless, Soft Blended Atmospheric Glow */}
      <div className="relative w-full max-w-[620px] sm:max-w-[700px] lg:max-w-[780px] min-h-[360px] sm:min-h-[460px] lg:min-h-[560px] aspect-square flex items-center justify-center">
        
        {/* Deep Atmospheric Diffuse Glow (Zero Harsh Rings) */}
        <div 
          className="absolute -inset-10 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, rgba(255, 255, 255, 0.045) 0%, rgba(255, 255, 255, 0.015) 45%, transparent 70%)',
            filter: 'blur(50px)',
            zIndex: 0
          }}
        />

        {/* Soft Core Radiance */}
        <div 
          className="absolute inset-4 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 40%, transparent 65%)',
            filter: 'blur(28px)',
            zIndex: 0
          }}
        />

        {/* 60fps Hardware-Accelerated Dish with Invisible Wipe & Organic Pixel Wave */}
        <div className="relative w-full h-full z-10">
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
    </div>
  );
}
