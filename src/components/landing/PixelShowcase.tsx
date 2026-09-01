'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PixelWaveDish } from './PixelWaveDish';
import { PixelSteam } from './PixelSteam';
import { retroAudio } from '@/lib/retroAudio';

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
    id: 'chicken',
    recipeId: 'herb-grilled-chicken',
    name: 'Herb Grilled Chicken & Crispy Greens',
    image: '/assets/food/grilled-chicken-1.0.webp',
    protein: '48g',
    calories: '520',
    focus: '9.4/10',
  },
  {
    id: 'prawn',
    recipeId: 'garlic-prawn-linguine',
    name: 'Garlic Butter Prawn Linguine',
    image: '/assets/food/prawn-linguine-1.0.webp',
    protein: '44g',
    calories: '530',
    focus: '9.2/10',
  },
  {
    id: 'pasta',
    recipeId: 'truffle-tagliatelle-pasta',
    name: 'Truffle & Parmesan Tagliatelle',
    image: '/assets/food/pasta-1.0.webp',
    protein: '18g',
    calories: '610',
    focus: '8.4/10',
  },
  {
    id: 'avocado-toast',
    recipeId: 'avocado-sourdough-toast',
    name: 'Poached Egg & Avocado Sourdough',
    image: '/assets/food/avocado-toast-1.0.webp',
    protein: '24g',
    calories: '410',
    focus: '9.0/10',
  },
  {
    id: 'egg-rice',
    recipeId: 'tamago-sesame-rice-bowl',
    name: 'Tamago Sesame Soft Egg Rice Bowl',
    image: '/assets/food/egg-rice-bowl-1.0.webp',
    protein: '26g',
    calories: '460',
    focus: '8.8/10',
  },
  {
    id: 'taco',
    recipeId: 'smoked-citrus-taco-bowl',
    name: 'Smoked Citrus Fiesta Taco Bowl',
    image: '/assets/food/taco-bowl-1.0.webp',
    protein: '42g',
    calories: '560',
    focus: '8.9/10',
  },
  {
    id: 'grain-bowl',
    recipeId: 'warm-ancient-grain-bowl',
    name: 'Warm Ancient Grain & Avocado Bowl',
    image: '/assets/food/grain-bowl-1.0.webp',
    protein: '22g',
    calories: '490',
    focus: '8.7/10',
  },
  {
    id: 'eggs',
    recipeId: 'cast-iron-skillet-eggs',
    name: 'Cast-Iron Skillet Eggs & Greens',
    image: '/assets/food/skillet-eggs-1.0.webp',
    protein: '34g',
    calories: '440',
    focus: '9.1/10',
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
  const [isMuted, setIsMuted] = useState(false);
  const [isCrtEnabled, setIsCrtEnabled] = useState(false);

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

    retroAudio.playScanWipe();

    const startTime = performance.now();
    const duration = 850;
    let hasTriggeredStatUpdate = false;

    const animateScan = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      const eased = 1 - Math.pow(1 - progress, 3);
      setScanProgress(eased);

      // Synchronize stat update when the incoming dish reaches the screen midpoint
      if (!hasTriggeredStatUpdate && progress >= 0.45) {
        hasTriggeredStatUpdate = true;
        onDishChange?.(DISH_ITEMS[next], next);
      }

      if (progress < 1.0) {
        animFrameRef.current = requestAnimationFrame(animateScan);
      } else {
        if (!hasTriggeredStatUpdate) {
          onDishChange?.(DISH_ITEMS[next], next);
        }
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
    }, 4800);

    return () => {
      clearInterval(interval);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const currentDish = DISH_ITEMS[currentIndex];
  const isHotDish = ['chicken', 'prawn', 'pasta', 'eggs', 'taco'].includes(currentDish.id);

  const handleInspectRecipe = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    retroAudio.playInspectConfirm();
    router.push(`/recipes?inspect=${encodeURIComponent(currentDish.recipeId)}`);
  };

  const handleToggleSound = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const muted = retroAudio.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      retroAudio.playBlip();
    }
  };

  const handleToggleCrt = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCrtEnabled((prev) => !prev);
    retroAudio.playBlip();
  };

  return (
    <div className={`relative w-full flex flex-col items-center justify-center select-none ${className}`}>
      
      {/* Massive Unboxed Food Arena (Pure Floating Art with View Transition Anchor) */}
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
        className={`group relative w-full max-w-[560px] sm:max-w-[620px] lg:max-w-[680px] aspect-square min-h-[380px] sm:min-h-[480px] lg:min-h-[540px] flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-[1.02] focus-visible:outline-none ${
          isCrtEnabled ? 'crt-phosphor-screen rounded-3xl overflow-hidden' : ''
        }`}
        style={{
          viewTransitionName: 'active-dish-plate'
        }}
      >

        {/* Subtle Ambient Diffuse Radial Glow */}
        <div 
          className="absolute -inset-10 rounded-full pointer-events-none opacity-30 transition-opacity duration-300 group-hover:opacity-50"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(26, 54, 41, 0.12) 0%, rgba(232, 222, 207, 0.4) 45%, transparent 70%)',
            filter: 'blur(45px)',
            zIndex: 0
          }}
        />

        {/* 16-Bit Ambient Pixel Steam Layer on Hot Dishes */}
        <PixelSteam active={isHotDish && !isScanning} intensity={1.2} />

        {/* 60fps Hardware-Accelerated Retro Pixel-Wipe Canvas Stage */}
        <div className="relative w-full h-full z-10 [image-rendering:pixelated] drop-shadow-[20px_20px_0px_rgba(26,54,41,0.14)]">
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

        {/* Chunky Neobrutalist Inspect Recipe Pill Badge */}
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-transform duration-300 group-hover:-translate-y-1 flex items-center justify-center gap-2 px-5 py-2 rounded-full border-3 bg-[#FFFDF9] border-[#1A3629] text-[#1A3629] shadow-[3px_3px_0px_#1A3629] whitespace-nowrap">
          <span className="font-cabinet font-bold text-xs sm:text-sm">
            Inspect Recipe <span className="text-[#2C4A3B] font-medium">· {currentDish.name} →</span>
          </span>
        </div>

      </div>

      {/* Retro 8-Bit Audio & CRT Screen Phosphor Controls */}
      <div className="mt-4 flex items-center justify-center gap-2.5 z-20 mx-auto">
        <button
          type="button"
          onClick={handleToggleSound}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 text-[10px] font-mono font-bold bg-[#FFFDF9] border-[#1A3629] text-[#1A3629] shadow-[2px_2px_0px_#1A3629] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
        >
          <span>{isMuted ? '8-BIT FX: OFF' : '8-BIT FX: ON'}</span>
        </button>

        <button
          type="button"
          onClick={handleToggleCrt}
          className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 text-[10px] font-mono font-bold shadow-[2px_2px_0px_#1A3629] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer ${
            isCrtEnabled
              ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629]'
              : 'bg-[#FFFDF9] text-[#1A3629] border-[#1A3629]'
          }`}
        >
          <span>{isCrtEnabled ? 'CRT SHADER: ON' : 'CRT SHADER: OFF'}</span>
        </button>
      </div>

    </div>
  );
}
