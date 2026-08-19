'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PixelWaveDish } from './PixelWaveDish';

export interface DishData {
  id: string;
  name: string;
  image: string;
  protein: string;
  calories: string;
  focus: string;
}

export const DISH_ITEMS: DishData[] = [
  {
    id: 'pasta',
    name: 'Truffle Pasta',
    image: '/assets/food/pasta.png',
    protein: '18g',
    calories: '610',
    focus: '8.4/10'
  },
  {
    id: 'chicken',
    name: 'Herb Grilled Chicken',
    image: '/assets/food/grilled-chicken.png',
    protein: '48g',
    calories: '520',
    focus: '9.4/10'
  },
  {
    id: 'eggs',
    name: 'Skillet Eggs & Greens',
    image: '/assets/food/skillet-eggs.png',
    protein: '34g',
    calories: '440',
    focus: '9.1/10'
  },
  {
    id: 'taco',
    name: 'Smoked Taco Bowl',
    image: '/assets/food/taco-bowl.png',
    protein: '42g',
    calories: '560',
    focus: '8.9/10'
  },
  {
    id: 'grain',
    name: 'Warm Ancient Grain Bowl',
    image: '/assets/food/grain-bowl.png',
    protein: '22g',
    calories: '490',
    focus: '8.7/10'
  }
];

const DISH_IMAGES = DISH_ITEMS.map((d) => d.image);

interface PixelShowcaseProps {
  onDishChange?: (dish: DishData, index: number) => void;
  className?: string;
}

export function PixelShowcase({ onDishChange, className = '' }: PixelShowcaseProps) {
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
    const next = (prev + 1) % DISH_ITEMS.length;

    setPrevIndex(prev);
    setCurrentIndex(next);
    currentIndexRef.current = next;
    setScanDirection((dir) => (dir === 'horizontal' ? 'vertical' : 'horizontal'));
    setScanProgress(0);

    onDishChange?.(DISH_ITEMS[next], next);

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
    // Notify parent of initial dish
    onDishChange?.(DISH_ITEMS[0], 0);

    // 4-second cycling timer
    const interval = setInterval(() => {
      triggerNextDish();
    }, 4000);

    return () => {
      clearInterval(interval);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const currentDish = DISH_ITEMS[currentIndex];

  return (
    <div className={`relative w-full flex items-center justify-center select-none ${className}`}>
      {/* Food Arena with Interactive Hover and Tactile Click */}
      <div 
        onClick={triggerNextDish}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            triggerNextDish();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Interactive pixel food plate: ${currentDish.name}. Click to inspect next recipe.`}
        className="group relative w-full max-w-[620px] sm:max-w-[700px] lg:max-w-[780px] min-h-[360px] sm:min-h-[460px] lg:min-h-[560px] aspect-square flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-[1.02] active:scale-[0.97] focus-visible:outline-none"
      >
        
        {/* Deep Atmospheric Diffuse Glow */}
        <div 
          className="absolute -inset-14 rounded-full pointer-events-none transition-opacity duration-300 group-hover:opacity-100 opacity-80"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.035) 45%, transparent 70%)',
            filter: 'blur(55px)',
            zIndex: 0
          }}
        />

        {/* Soft Core Radiance */}
        <div 
          className="absolute inset-2 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 65%)',
            filter: 'blur(30px)',
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

        {/* Retro Pixelated Tooltip Badge */}
        <div className="absolute bottom-4 sm:bottom-8 z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px] font-medium tracking-tight text-white">
            Click to inspect recipe <span className="text-neutral-400">· {currentDish.name}</span>
          </span>
        </div>

      </div>
    </div>
  );
}
