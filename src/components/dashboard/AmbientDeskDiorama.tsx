'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import Image from 'next/image';
import { calculateLevel } from '@/lib/progression/engine';
import { getIslandTier } from '@/lib/progression/config';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { Volume2, VolumeX, X, Maximize2, Minimize2 } from 'lucide-react';

interface AmbientDeskDioramaProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AmbientDeskDiorama({ isOpen, onClose }: AmbientDeskDioramaProps) {
  const { totalXp, streakCount, isForgedStreak } = useHabitStore();

  const progress = useMemo(() => calculateLevel(totalXp), [totalXp]);
  const currentIsland = useMemo(() => getIslandTier(progress.level), [progress.level]);

  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [isSoundscapeOn, setIsSoundscapeOn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedOverride = localStorage.getItem('cyath_low_power_island');
    if (savedOverride !== null) {
      setIsLowEndDevice(savedOverride === 'true');
      return;
    }
    const cores = navigator.hardwareConcurrency || 8;
    const memory = (navigator as any).deviceMemory || 8;
    if (cores <= 4 || memory < 4 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsLowEndDevice(true);
    }
  }, []);

  // Live clock updating each second
  useEffect(() => {
    if (!isOpen) return;

    const updateClock = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Keyboard shortcut listener: Escape or A to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleToggleSoundscape = () => {
    haptics.tap();
    const next = retroAudio.toggleSanctuarySoundscape();
    setIsSoundscapeOn(next);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-100 flex flex-col items-center justify-between bg-[#070D0A] text-[#FAF8F5] select-none overflow-hidden animate-in fade-in duration-500"
    >
      {/* Background Ambience: Deep Radial Sky Depth */}
      <div 
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(26,54,41,0.5)_0%,_rgba(7,13,10,0.98)_100%)]"
        aria-hidden="true"
      />

      {/* Floating Pixel Ambient Wind Particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-1.5 h-1 bg-emerald-400/25 rounded-full animate-[pulse_4s_infinite]" />
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1 bg-amber-300/20 rounded-full animate-[pulse_5s_infinite]" />
        <div className="absolute bottom-1/3 left-1/3 w-2 h-1 bg-emerald-300/15 rounded-full animate-[pulse_6s_infinite]" />
      </div>

      {/* TOP CONTROLS ONLY: Fullscreen and Close Icons in top-right */}
      <header className="relative z-20 w-full px-6 py-6 flex items-center justify-end">
        <div className="flex items-center gap-3">
          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="w-10 h-10 rounded-full border border-white/10 bg-black/40 text-white/70 hover:text-white hover:border-white/30 hover:bg-black/60 flex items-center justify-center cursor-pointer transition-all shadow-md active:scale-95"
            title="Toggle Fullscreen"
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close / Return */}
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-white/10 bg-black/40 text-white/70 hover:text-white hover:border-white/30 hover:bg-black/60 flex items-center justify-center cursor-pointer transition-all shadow-md active:scale-95"
            title="Exit Ambient Mode (Esc or A)"
            aria-label="Exit Ambient Mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* CENTER: Floating Island glides smoothly into the exact center */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center -mt-8">
        <div className="relative flex flex-col items-center justify-center animate-[fadeScale_0.7s_cubic-bezier(0.16,1,0.3,1)]">
          <div className="w-[320px] sm:w-[420px] md:w-[480px] lg:w-[540px] aspect-square relative flex items-center justify-center animate-[islandFloat_8s_ease-in-out_infinite] filter drop-shadow-[0_30px_60px_rgba(0,0,0,0.7)]">
            {isLowEndDevice ? (
              <Image
                src={currentIsland.pngImage || currentIsland.image}
                alt={currentIsland.name}
                fill
                priority
                sizes="540px"
                className="object-contain select-none"
                style={{ imageRendering: 'pixelated' }}
              />
            ) : (
              <svg
                viewBox="0 0 800 800"
                className="w-full h-full select-none"
                shapeRendering="crispEdges"
              >
                <defs>
                  <filter id="ambient-gold-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#F59E0B" floodOpacity="0.9" />
                  </filter>
                </defs>

                <image
                  href={currentIsland.svgImage || currentIsland.image}
                  width="800"
                  height="800"
                  style={{ imageRendering: 'pixelated' }}
                />

                {isForgedStreak && (
                  <g id="ambient-kintsugi-seams" filter="url(#ambient-gold-glow)">
                    <path
                      d="M370 520 L410 575 L395 640 L425 700 M410 575 L470 595 L520 635 M395 640 L345 675 L315 725"
                      stroke="#F59E0B"
                      strokeWidth="5"
                      strokeLinecap="square"
                      strokeLinejoin="miter"
                      fill="none"
                    />
                    <path
                      d="M370 520 L410 575 L395 640 L425 700 M410 575 L470 595 L520 635 M395 640 L345 675 L315 725"
                      stroke="#FFFBEB"
                      strokeWidth="2"
                      strokeLinecap="square"
                      strokeLinejoin="miter"
                      fill="none"
                    />
                  </g>
                )}
              </svg>
            )}
          </div>

          {/* Natural Floating Ground Shadow */}
          <div className="w-[240px] sm:w-[320px] md:w-[380px] h-4 rounded-full bg-black/60 blur-[8px] animate-[shadowFloat_8s_ease-in-out_infinite] pointer-events-none mt-3" />
        </div>
      </main>

      {/* BOTTOM: Minimalist Clock pops up from the bottom with Soundscape button directly below */}
      <footer className="relative z-20 pb-10 flex flex-col items-center justify-center animate-[clockRiseSpring_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards]">
        {/* Minimalist Glowing Desk Clock */}
        <div className="font-mono text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#FAF8F5] tracking-tight tabular-nums drop-shadow-[0_0_30px_rgba(255,255,255,0.25)]">
          {currentTimeStr || '12:00:00'}
        </div>

        {/* Tactile Soundscape Button Directly Below */}
        <button
          type="button"
          onClick={handleToggleSoundscape}
          className={`mt-4 px-6 py-2.5 rounded-full border text-xs font-mono font-bold transition-all flex items-center gap-2.5 cursor-pointer shadow-lg active:scale-95 ${
            isSoundscapeOn
              ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse'
              : 'bg-black/50 border-white/15 text-white/75 hover:text-white hover:border-white/40 hover:bg-black/70'
          }`}
          title="Toggle cozy ambient campfire soundscape"
        >
          {isSoundscapeOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-white/50" />}
          <span>{isSoundscapeOn ? 'Campfire Soundscape · Active' : 'Start Campfire Soundscape'}</span>
        </button>
      </footer>
    </div>
  );
}
