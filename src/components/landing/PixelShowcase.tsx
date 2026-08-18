'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface Dish {
  id: number;
  name: string;
  image: string;
  macros: {
    protein: string;
    carbs: string;
    fats: string;
    cals: string;
  };
  highlight: string;
}

const DISHES: Dish[] = [
  {
    id: 1,
    name: 'Grilled Chicken & Greens',
    image: '/assets/food/grilled-chicken.png',
    macros: { protein: '42g', carbs: '12g', fats: '15g', cals: '360' },
    highlight: 'Lean Protein Focus'
  },
  {
    id: 2,
    name: 'Skillet Sunny Eggs',
    image: '/assets/food/skillet-eggs.png',
    macros: { protein: '24g', carbs: '8g', fats: '22g', cals: '320' },
    highlight: 'Morning Metabolism'
  },
  {
    id: 3,
    name: 'Loaded Avocado Taco Bowl',
    image: '/assets/food/taco-bowl.png',
    macros: { protein: '38g', carbs: '45g', fats: '18g', cals: '510' },
    highlight: 'Post-Workout Fuel'
  },
  {
    id: 4,
    name: 'Rustic Tomato Basil Pasta',
    image: '/assets/food/pasta.png',
    macros: { protein: '18g', carbs: '65g', fats: '12g', cals: '480' },
    highlight: 'Clean Carbohydrates'
  },
  {
    id: 5,
    name: 'Roasted Harvest Grain Bowl',
    image: '/assets/food/grain-bowl.png',
    macros: { protein: '22g', carbs: '55g', fats: '16g', cals: '440' },
    highlight: 'Sustained Energy'
  }
];

type ScanType = 'vertical' | 'radial' | 'diagonal';
const SCAN_TYPES: ScanType[] = ['vertical', 'radial', 'diagonal'];

export function PixelShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [scanType, setScanType] = useState<ScanType>('vertical');
  const [isScanning, setIsScanning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const triggerNextDish = (nextIdx?: number) => {
    if (isScanning) return;
    const next = nextIdx !== undefined ? nextIdx : (currentIndex + 1) % DISHES.length;
    if (next === currentIndex) return;

    setPrevIndex(currentIndex);
    setCurrentIndex(next);
    
    const nextScan = SCAN_TYPES[(currentIndex + 1) % SCAN_TYPES.length];
    setScanType(nextScan);
    setIsScanning(true);

    setTimeout(() => {
      setIsScanning(false);
      setPrevIndex(null);
    }, 1000);
  };

  useEffect(() => {
    if (isPaused) return;

    intervalRef.current = setInterval(() => {
      triggerNextDish();
    }, 4000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentIndex, isPaused, isScanning]);

  const activeDish = DISHES[currentIndex];
  const prevDish = prevIndex !== null ? DISHES[prevIndex] : null;

  return (
    <div 
      className="relative w-full flex flex-col items-center justify-center select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top Floating Highlight Tag */}
      <div className="w-full max-w-[460px] flex justify-end mb-2 pr-2">
        <div className="backdrop-blur-xl bg-[#141414]/80 border border-white/15 px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px] text-neutral-300 tracking-wider uppercase">
            {isScanning ? `SCANNING [${scanType.toUpperCase()}]` : activeDish.highlight}
          </span>
        </div>
      </div>

      {/* Main Plate Display Arena */}
      <div className="relative w-full max-w-[460px] aspect-square flex items-center justify-center">
        
        {/* Subtle circular plate background glow */}
        <div className="absolute inset-0 bg-radial from-white/[0.04] to-transparent rounded-full blur-2xl pointer-events-none -z-10" />

        {/* Previous Dish (Beneath scanner) */}
        {prevDish && isScanning && (
          <div className="absolute inset-0 flex items-center justify-center animate-pixel-float pointer-events-none">
            <div className="relative w-[92%] h-[92%]">
              <Image
                src={prevDish.image}
                alt={prevDish.name}
                fill
                className="pixel-art object-contain"
                sizes="(max-width: 768px) 100vw, 460px"
                priority
              />
            </div>
          </div>
        )}

        {/* Current Active Dish */}
        <div className="absolute inset-0 flex items-center justify-center animate-pixel-float pointer-events-none z-10">
          <motion.div 
            key={`${activeDish.id}-${scanType}`}
            initial={
              scanType === 'vertical'
                ? { clipPath: 'polygon(0 0, 100% 0, 100% 0%, 0 0%)' }
                : scanType === 'diagonal'
                ? { clipPath: 'polygon(0 0, 0 0, 0 0, 0 0)' }
                : { clipPath: 'circle(0% at 50% 50%)' }
            }
            animate={{ 
              clipPath: 
                scanType === 'vertical'
                  ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
                  : scanType === 'diagonal'
                  ? 'polygon(0 0, 200% 0, 200% 200%, 0 200%)'
                  : 'circle(150% at 50% 50%)'
            }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-[92%] h-[92%]"
          >
            <Image
              src={activeDish.image}
              alt={activeDish.name}
              fill
              className="pixel-art object-contain"
              sizes="(max-width: 768px) 100vw, 460px"
              priority
            />
          </motion.div>
        </div>

        {/* Scanner Laser Sweep Beam Line */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
            {scanType === 'vertical' && (
              <motion.div
                initial={{ top: '2%' }}
                animate={{ top: '98%' }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-[4%] right-[4%] h-[2px] bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_16px_#ffffff,0_0_6px_#ffffff]"
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-3 bg-white/25 blur-sm rounded-full" />
              </motion.div>
            )}

            {scanType === 'diagonal' && (
              <motion.div
                initial={{ top: '-10%', left: '-10%', transform: 'rotate(-45deg)' }}
                animate={{ top: '110%', left: '110%', transform: 'rotate(-45deg)' }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="absolute w-[140%] h-[2px] bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_16px_#ffffff,0_0_6px_#ffffff]"
              />
            )}

            {scanType === 'radial' && (
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="absolute w-[82%] h-[82%] rounded-full border border-white/15 flex items-center justify-center"
              >
                <div className="absolute top-1/2 left-1/2 w-[50%] h-[2px] bg-gradient-to-r from-white to-transparent origin-left shadow-[0_0_14px_#ffffff]" />
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Floating Macro HUD Box (Cleanly Anchored Under Plate) */}
      <div className="w-full max-w-[460px] mt-4 z-20">
        <div className="backdrop-blur-2xl bg-[#121212]/90 border border-white/15 rounded-2xl p-4 sm:p-5 shadow-[0_20px_40px_rgba(0,0,0,0.7)]">
          <div className="flex items-center justify-between mb-3.5">
            <AnimatePresence mode="wait">
              <motion.span
                key={activeDish.id}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.18 }}
                className="text-sm sm:text-base font-serif font-semibold text-white truncate max-w-[260px]"
              >
                {activeDish.name}
              </motion.span>
            </AnimatePresence>

            {/* Clickable Slide Indicator Dots */}
            <div className="flex items-center gap-1.5">
              {DISHES.map((dish, idx) => (
                <button
                  key={dish.id}
                  onClick={() => triggerNextDish(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentIndex 
                      ? 'w-5 bg-white' 
                      : 'w-2 bg-white/20 hover:bg-white/50'
                  }`}
                  aria-label={`Show ${dish.name}`}
                />
              ))}
            </div>
          </div>

          {/* Macro Stats */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-white/[0.03] rounded-xl py-2 px-2 text-center border border-white/5">
              <div className="text-[9px] text-neutral-400 uppercase tracking-widest font-mono mb-0.5">PRO</div>
              <div className="text-white font-mono text-xs sm:text-sm font-semibold">{activeDish.macros.protein}</div>
            </div>
            <div className="bg-white/[0.03] rounded-xl py-2 px-2 text-center border border-white/5">
              <div className="text-[9px] text-neutral-400 uppercase tracking-widest font-mono mb-0.5">CARB</div>
              <div className="text-white font-mono text-xs sm:text-sm font-semibold">{activeDish.macros.carbs}</div>
            </div>
            <div className="bg-white/[0.03] rounded-xl py-2 px-2 text-center border border-white/5">
              <div className="text-[9px] text-neutral-400 uppercase tracking-widest font-mono mb-0.5">FAT</div>
              <div className="text-white font-mono text-xs sm:text-sm font-semibold">{activeDish.macros.fats}</div>
            </div>
            <div className="bg-white/[0.03] rounded-xl py-2 px-2 text-center border border-white/5">
              <div className="text-[9px] text-neutral-400 uppercase tracking-widest font-mono mb-0.5">KCAL</div>
              <div className="text-white font-mono text-xs sm:text-sm font-semibold">{activeDish.macros.cals}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
