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
    
    // Pick next scan animation pattern in rotation
    const nextScan = SCAN_TYPES[(currentIndex + 1) % SCAN_TYPES.length];
    setScanType(nextScan);
    setIsScanning(true);

    // Duration of scanner animation before settling
    setTimeout(() => {
      setIsScanning(false);
      setPrevIndex(null);
    }, 1100);
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
      {/* Ambient background glow behind the giant plate */}
      <div className="absolute inset-0 bg-radial from-white/[0.04] via-transparent to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Main Plate Display Arena - Covers the right side */}
      <div className="relative w-full max-w-[500px] lg:max-w-[580px] aspect-square flex items-center justify-center">
        
        {/* Previous Dish (Fading out / Underneath scanner) */}
        {prevDish && isScanning && (
          <div className="absolute inset-0 flex items-center justify-center animate-pixel-float pointer-events-none">
            <div className="relative w-[90%] h-[90%]">
              <Image
                src={prevDish.image}
                alt={prevDish.name}
                fill
                className="pixel-art object-contain"
                sizes="(max-width: 768px) 100vw, 550px"
                priority
              />
            </div>
          </div>
        )}

        {/* Current Active Dish (With Scanning Clip Reveal) */}
        <div 
          className="absolute inset-0 flex items-center justify-center animate-pixel-float pointer-events-none"
          style={{
            zIndex: 5,
            clipPath: isScanning
              ? scanType === 'vertical'
                ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
                : undefined
              : undefined
          }}
        >
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
            transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-[90%] h-[90%]"
          >
            <Image
              src={activeDish.image}
              alt={activeDish.name}
              fill
              className="pixel-art object-contain"
              sizes="(max-width: 768px) 100vw, 550px"
              priority
            />
          </motion.div>
        </div>

        {/* Laser Scanner Beam Overlay Line */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
            {scanType === 'vertical' && (
              <motion.div
                initial={{ top: '5%' }}
                animate={{ top: '95%' }}
                transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-[5%] right-[5%] h-[2px] bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_20px_#ffffff,0_0_8px_#ffffff]"
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-3 bg-white/20 blur-sm rounded-full" />
              </motion.div>
            )}

            {scanType === 'diagonal' && (
              <motion.div
                initial={{ top: '-10%', left: '-10%', transform: 'rotate(-45deg)' }}
                animate={{ top: '110%', left: '110%', transform: 'rotate(-45deg)' }}
                transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
                className="absolute w-[140%] h-[2px] bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_20px_#ffffff,0_0_8px_#ffffff]"
              />
            )}

            {scanType === 'radial' && (
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
                className="absolute w-[80%] h-[80%] rounded-full border border-white/10 flex items-center justify-center"
              >
                {/* Rotating radar sweep ray */}
                <div className="absolute top-1/2 left-1/2 w-[50%] h-[2px] bg-gradient-to-r from-white to-transparent origin-left shadow-[0_0_15px_#ffffff]" />
              </motion.div>
            )}
          </div>
        )}

        {/* HUD Scanner Badge (Top-Right Floating Tag) */}
        <div className="absolute top-4 right-4 z-20">
          <div className="backdrop-blur-xl bg-black/60 border border-white/15 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] text-slate-300 tracking-wider uppercase">
              {isScanning ? `TRANSFORMING [${scanType}]` : activeDish.highlight}
            </span>
          </div>
        </div>

        {/* Floating Macro HUD Card (Bottom of Plate) */}
        <div className="absolute -bottom-6 sm:-bottom-4 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-md">
          <div className="backdrop-blur-2xl bg-black/70 border border-white/15 rounded-2xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between mb-3">
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeDish.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm sm:text-base font-serif font-semibold text-white truncate max-w-[240px]"
                >
                  {activeDish.name}
                </motion.span>
              </AnimatePresence>

              {/* Interactive Clickable Slide Indicator Dots */}
              <div className="flex items-center gap-1.5">
                {DISHES.map((dish, idx) => (
                  <button
                    key={dish.id}
                    onClick={() => triggerNextDish(idx)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === currentIndex 
                        ? 'w-5 bg-white' 
                        : 'w-2 bg-white/25 hover:bg-white/50'
                    }`}
                    aria-label={`Show ${dish.name}`}
                  />
                ))}
              </div>
            </div>

            {/* Macro Stats Grid */}
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-white/[0.04] rounded-lg py-1.5 px-2 text-center border border-white/5">
                <div className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">PRO</div>
                <div className="text-white font-mono text-xs sm:text-sm font-semibold">{activeDish.macros.protein}</div>
              </div>
              <div className="bg-white/[0.04] rounded-lg py-1.5 px-2 text-center border border-white/5">
                <div className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">CARB</div>
                <div className="text-white font-mono text-xs sm:text-sm font-semibold">{activeDish.macros.carbs}</div>
              </div>
              <div className="bg-white/[0.04] rounded-lg py-1.5 px-2 text-center border border-white/5">
                <div className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">FAT</div>
                <div className="text-white font-mono text-xs sm:text-sm font-semibold">{activeDish.macros.fats}</div>
              </div>
              <div className="bg-white/[0.04] rounded-lg py-1.5 px-2 text-center border border-white/5">
                <div className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">KCAL</div>
                <div className="text-white font-mono text-xs sm:text-sm font-semibold">{activeDish.macros.cals}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
