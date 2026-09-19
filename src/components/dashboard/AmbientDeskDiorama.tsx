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
  const {
    totalXp,
    streakCount,
    isForgedStreak,
    userProfile,
    currentDate,
    getDailyLog,
    habits,
  } = useHabitStore();

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

  // Live clock
  useEffect(() => {
    if (!isOpen) return;

    const updateClock = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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

  // Cheering status line based on day progress
  const currentLog = getDailyLog(currentDate);
  const completedHabitsCount = Object.values(currentLog.habitsCompleted || {}).filter(Boolean).length;
  const totalHabits = habits.length || 3;

  const cheeringMessage = useMemo(() => {
    const hour = new Date().getHours();
    if (completedHabitsCount >= totalHabits) {
      return 'All daily anchors secured. Rest easy, your island is thriving.';
    }
    if (hour < 12) {
      return 'Morning light is breaking. Sip your water and settle into your flow.';
    }
    if (hour < 17) {
      return 'Steady afternoon momentum. Take a gentle shoulder roll whenever you need.';
    }
    if (hour < 21) {
      return 'Winding down the workday. The campfire embers are warming up.';
    }
    return 'Night sky over the sanctuary. Time to dim the blue light soon.';
  }, [completedHabitsCount, totalHabits]);

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
      className="fixed inset-0 z-100 flex flex-col items-center justify-between bg-[#0E1A14] text-[#FAF8F5] select-none overflow-hidden animate-in fade-in duration-300"
    >
      {/* Background Ambience: Subtle Floating Pixel Mist */}
      <div 
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(26,54,41,0.5)_0%,_rgba(10,18,14,0.95)_100%)]"
        aria-hidden="true"
      />

      {/* Lo-fi Pixel Floating Wind Particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 left-0 w-2 h-1 bg-emerald-400/30 rounded-full animate-[pulse_4s_infinite]" />
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1 bg-amber-300/25 rounded-full animate-[pulse_5s_infinite]" />
        <div className="absolute bottom-1/3 left-1/3 w-2 h-1.5 bg-emerald-300/20 rounded-full animate-[pulse_6s_infinite]" />
      </div>

      {/* TOP STATUS BAR */}
      <header className="relative z-10 w-full max-w-6xl px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-pixel text-xs text-[#E8DCC8] tracking-wider uppercase">
            Cyath Sanctuary
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-mono text-xs text-emerald-400/80">
            Monitor-2 Ambient
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Soundscape Toggle */}
          <button
            type="button"
            onClick={handleToggleSoundscape}
            className={`px-3 py-1.5 rounded-full border text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              isSoundscapeOn
                ? 'bg-emerald-900/60 border-emerald-400 text-emerald-300'
                : 'bg-black/30 border-white/10 text-white/70 hover:text-white hover:border-white/30'
            }`}
            title="Toggle cozy ambient campfire soundscape"
          >
            {isSoundscapeOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{isSoundscapeOn ? 'Campfire Active' : 'Soundscape'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="w-8 h-8 rounded-full border border-white/10 bg-black/30 text-white/70 hover:text-white hover:border-white/30 flex items-center justify-center cursor-pointer transition-colors"
            title="Toggle Fullscreen"
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Close / Return */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-white/10 bg-black/30 text-white/70 hover:text-white hover:border-white/30 flex items-center justify-center cursor-pointer transition-colors"
            title="Exit Ambient Mode (or press A / Esc)"
            aria-label="Exit Ambient Mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* CENTER LIVING DIORAMA */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center gap-6 px-4">
        {/* Floating Island Hero */}
        <div className="relative flex flex-col items-center justify-center animate-[bounce_5s_ease-in-out_infinite]">
          <div className="w-[300px] sm:w-[380px] lg:w-[440px] aspect-square relative flex items-center justify-center filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
            {isLowEndDevice ? (
              <Image
                src={currentIsland.image}
                alt={currentIsland.name}
                fill
                priority
                sizes="440px"
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
                  href={currentIsland.image}
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

          {/* Island Horizon Shadow */}
          <div className="w-48 sm:w-64 h-3 bg-black/40 rounded-full blur-md mt-[-10px]" />
        </div>

        {/* Live Clock & Streak Badge */}
        <div className="flex flex-col items-center gap-2 mt-2">
          <span className="font-mono text-4xl sm:text-5xl font-bold tracking-tight text-[#FAF8F5] drop-shadow-md tabular-nums">
            {currentTimeStr || '--:--'}
          </span>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-xs font-mono">
            <span className="text-amber-400">●</span>
            <span className="text-white/90">
              {streakCount} {streakCount === 1 ? 'Day' : 'Days'} {isForgedStreak ? 'Forged' : 'Streak'}
            </span>
            <span className="text-white/40">·</span>
            <span className="text-emerald-400 font-bold">
              {completedHabitsCount}/{totalHabits} Anchors
            </span>
          </div>
        </div>

        {/* Warm Cheering Desk-Companion Message */}
        <p className="max-w-md text-center font-sans text-xs sm:text-sm text-[#C7D4CA] leading-relaxed px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs shadow-lg">
          {cheeringMessage}
        </p>
      </main>

      {/* FOOTER HELPER */}
      <footer className="relative z-10 py-5 text-center text-xs font-mono text-white/40">
        Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/80 border border-white/15">A</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/80 border border-white/15">Esc</kbd> to return to Sanctuary Cockpit
      </footer>
    </div>
  );
}
