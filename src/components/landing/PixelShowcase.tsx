'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PixelWaveDish } from './PixelWaveDish';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export interface DishData {
  id: string;
  recipeId: string;
  name: string;
  image: string;
  protein: string;
  calories: string;
  focus: string;
}

export const DISH_ITEMS: DishData[] = [
  {
    id: 'pasta',
    recipeId: 'truffle-tagliatelle-pasta',
    name: 'Truffle & Parmesan Tagliatelle',
    image: '/assets/food/pasta.png',
    protein: '18g',
    calories: '610',
    focus: '8.4/10',
  },
  {
    id: 'chicken',
    recipeId: 'herb-grilled-chicken',
    name: 'Herb Grilled Chicken & Crispy Greens',
    image: '/assets/food/grilled-chicken.png',
    protein: '48g',
    calories: '520',
    focus: '9.4/10',
  },
  {
    id: 'eggs',
    recipeId: 'cast-iron-skillet-eggs',
    name: 'Cast-Iron Skillet Eggs & Greens',
    image: '/assets/food/skillet-eggs.png',
    protein: '34g',
    calories: '440',
    focus: '9.1/10',
  },
  {
    id: 'taco',
    recipeId: 'smoked-citrus-taco-bowl',
    name: 'Smoked Citrus Fiesta Taco Bowl',
    image: '/assets/food/taco-bowl.png',
    protein: '42g',
    calories: '560',
    focus: '8.9/10',
  },
  {
    id: 'grain',
    recipeId: 'warm-ancient-grain-bowl',
    name: 'Warm Ancient Grain & Avocado Bowl',
    image: '/assets/food/grain-bowl.png',
    protein: '22g',
    calories: '490',
    focus: '8.7/10',
  },
];

const DISH_IMAGES = DISH_ITEMS.map((d) => d.image);

interface PixelShowcaseProps {
  onDishChange?: (dish: DishData, index: number) => void;
  className?: string;
}

export function PixelShowcase({ onDishChange, className = '' }: PixelShowcaseProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [scanDirection, setScanDirection] = useState<'horizontal' | 'vertical'>('horizontal');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const currentIndexRef = useRef(0);
  const isScanningRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);

  const triggerNextDish = (targetNext?: number) => {
    if (isScanningRef.current) return;
    isScanningRef.current = true;
    setIsScanning(true);

    const prev = currentIndexRef.current;
    const next = typeof targetNext === 'number'
      ? (targetNext + DISH_ITEMS.length) % DISH_ITEMS.length
      : (prev + 1) % DISH_ITEMS.length;

    setPrevIndex(prev);
    setCurrentIndex(next);
    currentIndexRef.current = next;
    setScanDirection((dir) => (dir === 'horizontal' ? 'vertical' : 'horizontal'));
    setScanProgress(0);

    onDishChange?.(DISH_ITEMS[next], next);

    const startTime = performance.now();
    const duration = 1000;

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
    onDishChange?.(DISH_ITEMS[0], 0);

    const interval = setInterval(() => {
      triggerNextDish();
    }, 4500);

    return () => {
      clearInterval(interval);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const currentDish = DISH_ITEMS[currentIndex];

  const handleInspectRecipe = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/recipes?inspect=${encodeURIComponent(currentDish.recipeId)}`);
  };

  return (
    <div className={`relative w-full flex items-center justify-center select-none ${className}`}>
      {/* Food Arena with Interactive Hover and Tactile Click */}
      <div 
        onClick={handleInspectRecipe}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleInspectRecipe(e as any);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Interactive pixel food plate: ${currentDish.name}. Click to inspect recipe in detail.`}
        className="group relative w-full max-w-[620px] sm:max-w-[700px] lg:max-w-[780px] min-h-[360px] sm:min-h-[460px] lg:min-h-[560px] aspect-square flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none"
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

        {/* Cycle Buttons */}
        <div 
          className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex items-center justify-between z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              triggerNextDish(currentIndex - 1);
            }}
            className="pointer-events-auto p-2.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer shadow-lg active:scale-90"
            aria-label="Previous recipe"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              triggerNextDish(currentIndex + 1);
            }}
            className="pointer-events-auto p-2.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer shadow-lg active:scale-90"
            aria-label="Next recipe"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Retro Pixelated Inspect Recipe Tooltip Badge */}
        <div className="absolute bottom-4 sm:bottom-8 z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 flex items-center gap-2 px-4 py-2 rounded-full bg-black/90 backdrop-blur-md border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
          <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
          <span className="font-mono text-xs font-semibold tracking-tight text-white">
            Inspect Recipe <span className="text-slate-400 font-normal">· {currentDish.name} →</span>
          </span>
        </div>

      </div>
    </div>
  );
}
