'use client';

import React, { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { useHabitStore, TROPHIES_ROSTER } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { formatLocalDate } from '@/lib/dateUtils';
import { SanctuaryObservatory } from '@/components/dashboard/SanctuaryObservatory';
import { CoreHabitsCard } from '@/components/dashboard/CoreHabitsCard';
import { DailyFuelCard } from '@/components/dashboard/DailyFuelCard';
import { EveningSleepCard } from '@/components/dashboard/EveningSleepCard';
import { ItemGetBanner } from '@/components/dashboard/ItemGetBanner';
import { SpecimenVaultSubfloor } from '@/components/dashboard/SpecimenVaultSubfloor';
import { MinimalistReceiptModal } from '@/components/dashboard/MinimalistReceiptModal';
import { AmbientDeskDiorama } from '@/components/dashboard/AmbientDeskDiorama';
import {
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';

function DashboardContent() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hotkeyFlash, setHotkeyFlash] = useState<'habits' | 'fuel' | 'island' | null>(null);

  // Modal & Station States
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isCorkboardOpen, setIsCorkboardOpen] = useState(false);
  const [justSealedDate, setJustSealedDate] = useState<string | null>(null);
  const [isAmbientOpen, setIsAmbientOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [mobileStation, setMobileStation] = useState<'island' | 'console'>('island');
  const swipeTouchStartX = useRef<number | null>(null);

  const flashHotkey = (zone: 'habits' | 'fuel' | 'island') => {
    setHotkeyFlash(zone);
    setTimeout(() => setHotkeyFlash(null), 600);
  };

  const hasCalibratedTodayRef = useRef(false);

  const {
    currentDate,
    getDailyLog,
    setDate,
    userSession,
    userProfile,
    streakCount,
    isForgedStreak,
    unlockedTrophies,
    setCircadianSchedule,
    isLedgerSealedByDate,
    habits,
    toggleHabit,
    setHydration,
  } = useHabitStore();

  const isAuthenticated = !!userSession && !userSession.id.startsWith('guest_');

  useEffect(() => {
    setMounted(true);
    setIsMuted(retroAudio.getMuted());

    const handleMuteChange = (e: CustomEvent<{ isMuted: boolean }>) => {
      setIsMuted(e.detail.isMuted);
    };
    window.addEventListener('cyath-audio-mute-changed' as any, handleMuteChange);

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.key === '1') {
        e.preventDefault();
        const sunHabit =
          habits.find((h) => h.id === 'sunlight' || h.title?.toLowerCase().includes('sunlight')) ||
          habits[0];
        if (sunHabit) {
          toggleHabit(sunHabit.id, currentDate);
          retroAudio.playBlip();
          haptics.tap();
          flashHotkey('habits');
        }
      }
      if (e.key === '2') {
        e.preventDefault();
        const currentLog = getDailyLog(currentDate);
        const nextWater = Number(((currentLog.hydrationLiters || 0) + 0.5).toFixed(1));
        setHydration(nextWater, currentDate);
        retroAudio.playInspectConfirm();
        haptics.tap();
        flashHotkey('habits');
      }
      if (e.key === '3') {
        e.preventDefault();
        setMobileStation('console');
        retroAudio.playBlip();
        flashHotkey('fuel');
        const fuelInput = document.getElementById('natural-meal-input');
        if (fuelInput) fuelInput.focus();
        else document.getElementById('daily-fuel-card')?.scrollIntoView({ behavior: 'smooth' });
      }
      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        retroAudio.playPaperRustle();
        haptics.tap();
        setIsCorkboardOpen((prev) => !prev);
      }
      if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        handleOpenVault();
      }
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        retroAudio.playBlip();
        setIsAmbientOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);

    if (!hasCalibratedTodayRef.current) {
      hasCalibratedTodayRef.current = true;
      const today = formatLocalDate();
      if (currentDate !== today) {
        setDate(today);
      }
    }

    if (isAuthenticated && (!userProfile || !userProfile.onboardingCompleted)) {
      router.push('/onboarding');
    }

    return () => {
      window.removeEventListener('cyath-audio-mute-changed' as any, handleMuteChange);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isAuthenticated, userProfile, router, currentDate, setDate]);

  const todayDateStr = useMemo(() => formatLocalDate(), []);
  const isViewingToday = currentDate === todayDateStr;
  const todayLog = getDailyLog(currentDate);

  const targetProtein = userProfile?.weightKg ? Math.round(userProfile.weightKg * 2.0) : 140;
  const currentProtein = todayLog.totalProteinLogged || 0;

  // Schedule modal state
  const [tempWake, setTempWake] = useState(userProfile?.wakeTime || '07:30');
  const [tempBed, setTempBed] = useState(userProfile?.bedTime || '23:30');

  const handleToggleMute = () => {
    const next = retroAudio.toggleMute();
    setIsMuted(next);
    haptics.tap();
  };

  const handleOpenVault = () => {
    retroAudio.playInspectConfirm();
    haptics.tap();
    const el = document.getElementById('specimen-reliquary');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    retroAudio.playInspectConfirm();
    haptics.tap();
    setCircadianSchedule(tempWake, tempBed);
    setIsScheduleModalOpen(false);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F4F0EA] flex items-center justify-center text-[#1A3629] font-mono text-xs">
        Loading Sanctuary Cockpit...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F4F0EA] text-[#1A3629] transition-colors duration-300 flex flex-col selection:bg-[#1A3629] selection:text-[#FFFDF9]">
      {/* Subtle Ambient Sanctuary Lighting */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,253,249,0.7)_0%,_transparent_75%)]"
        aria-hidden="true"
      />

      <HeaderNav />

      {/* Celebratory Dropdown on Trophy Earned */}
      <ItemGetBanner onOpenVault={handleOpenVault} />

      {/* Main Sanctuary Cockpit Container (Edge-to-Edge Spatial Architecture) */}
      <main className="relative z-10 flex-1 w-full max-w-[1720px] mx-auto px-4 sm:px-8 xl:px-12 pt-24 pb-28 flex flex-col gap-8">
        
        {/* Cockpit Header Row: Status & Minimal Ambient Tools */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1A3629]/10 pb-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-cabinet font-extrabold text-2xl sm:text-3xl tracking-tight text-[#1A3629]">
                Sanctuary Cockpit
              </h1>

              {/* Streak Badge with Custom Flame */}
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFDF9] border border-[#1A3629]/15 shadow-2xs"
                title={
                  isForgedStreak
                    ? 'Grace Re-entry: Streak was broken but restored through golden Kintsugi repair.'
                    : `${streakCount} Day Habit Momentum Streak`
                }
              >
                {isForgedStreak ? (
                  <div className="w-4 h-4 relative">
                    <Image
                      src="/assets/trophies/flame_iron.png"
                      alt="Forged Flame"
                      fill
                      className="object-contain select-none"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                ) : (
                  <div className="w-4 h-4 relative">
                    <Image
                      src="/assets/trophies/flame_normal.png"
                      alt="Streak Flame"
                      fill
                      className="object-contain select-none"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                )}
                <span className="font-cabinet font-extrabold text-xs text-[#1A3629]">
                  {streakCount} {streakCount === 1 ? 'Day' : 'Days'} {isForgedStreak ? 'Forged' : ''}
                </span>
                {isForgedStreak && (
                  <span
                    className="font-mono text-[9.5px] font-bold text-[#1E3A8A] bg-blue-100/90 px-1.5 py-0.2 rounded-xs cursor-help border border-blue-200"
                    title="Grace Re-entry: Streak restored with golden Kintsugi repair"
                  >
                    Kintsugi
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-[#4A5D4E] font-sans">
              {isViewingToday
                ? 'Daily reactive habit canvas, whole-food fuel tracker, and circadian cadence.'
                : `Archived log view for ${currentDate}.`}
            </p>
          </div>

          {/* Minimal Essential Header Tools & Desktop Shortcuts */}
          <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-auto">
            {/* Desktop Keyboard Accelerators Strip (visible from lg up) */}
            <div className="hidden lg:flex items-center gap-3 font-mono text-[11px] text-[#4A5D4E] bg-[#FFFDF9]/80 px-3.5 py-1.5 rounded-full border border-[#1A3629]/12 shadow-2xs">
              <span className="text-[#1A3629]/60 font-semibold">Hotkeys</span>
              <span className="flex items-center gap-1 font-bold text-[#1A3629]">
                <kbd className="px-1.5 py-0.2 bg-[#EAE4D9] border border-[#1A3629]/20 rounded-xs text-[10px]">1</kbd> Sun
              </span>
              <span className="flex items-center gap-1 font-bold text-[#1A3629]">
                <kbd className="px-1.5 py-0.2 bg-[#EAE4D9] border border-[#1A3629]/20 rounded-xs text-[10px]">2</kbd> Water
              </span>
              <span className="flex items-center gap-1 font-bold text-[#1A3629]">
                <kbd className="px-1.5 py-0.2 bg-[#EAE4D9] border border-[#1A3629]/20 rounded-xs text-[10px]">3</kbd> Fuel
              </span>
              <span className="flex items-center gap-1 font-bold text-[#1A3629]">
                <kbd className="px-1.5 py-0.2 bg-[#EAE4D9] border border-[#1A3629]/20 rounded-xs text-[10px]">L</kbd> Ledger
              </span>
              <span className="flex items-center gap-1 font-bold text-[#1A3629]">
                <kbd className="px-1.5 py-0.2 bg-[#EAE4D9] border border-[#1A3629]/20 rounded-xs text-[10px]">A</kbd> Zen
              </span>
            </div>

            {/* Specimen Reliquary Sub-Floor Jump Button */}
            <button
              type="button"
              onClick={handleOpenVault}
              className="h-9 px-4 rounded-full border border-[#1A3629]/20 bg-[#FFFDF9] text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9] font-cabinet font-bold text-xs transition-colors cursor-pointer shadow-2xs flex items-center gap-2"
            >
              <span>Reliquary ({unlockedTrophies.length}/{TROPHIES_ROSTER.length})</span>
            </button>

            {/* Zen Ambient Desk Display Button */}
            <button
              type="button"
              onClick={() => {
                retroAudio.playBlip();
                haptics.tap();
                setIsAmbientOpen(true);
              }}
              className="h-9 px-4 rounded-full border border-[#1A3629]/20 bg-[#FFFDF9] text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9] font-cabinet font-bold text-xs transition-colors cursor-pointer shadow-2xs flex items-center justify-center"
              title="Zen Ambient Desk Display (Hotkey A)"
            >
              <span>Zen Ambience</span>
            </button>
          </div>
        </div>

        {/* Mobile Cockpit Station Switcher (Option B: 2 Stations) */}
        <div role="tablist" aria-label="Dashboard views" className="lg:hidden w-full sticky top-18 z-20 p-1.5 bg-[#EAE4D9]/95 backdrop-blur-md rounded-2xl border border-[#1A3629]/15 shadow-sm flex items-center justify-between gap-2 my-1">
          <button
            role="tab"
            aria-selected={mobileStation === 'island'}
            aria-label="Sanctuary Island"
            type="button"
            onClick={() => {
              setMobileStation('island');
              retroAudio.playBlip();
              haptics.tap();
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-cabinet font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
              mobileStation === 'island'
                ? 'bg-[#1A3629] text-[#FFFDF9] shadow-xs'
                : 'text-[#1A3629]/70 hover:text-[#1A3629] hover:bg-black/5'
            }`}
          >
            <span>🏝️</span> Sanctuary Island
          </button>

          <button
            role="tab"
            aria-selected={mobileStation === 'console'}
            aria-label="Daily Operator Console"
            type="button"
            onClick={() => {
              setMobileStation('console');
              retroAudio.playBlip();
              haptics.tap();
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-cabinet font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
              mobileStation === 'console'
                ? 'bg-[#1A3629] text-[#FFFDF9] shadow-xs'
                : 'text-[#1A3629]/70 hover:text-[#1A3629] hover:bg-black/5'
            }`}
          >
            <span>⚡</span> Daily Console
          </button>
        </div>

        {/* Main Split Horizon Layout: Left 50% Island/Ledger, Right 50% 3 Stacked Cards */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start animate-in fade-in duration-150">
          
          {/* LEFT 50%: Monumental Living Island & In-Place 30-Day Ledger */}
          <div className={`w-full lg:col-span-6 xl:col-span-6 lg:sticky lg:top-24 h-fit ${
            mobileStation === 'island' ? 'block' : 'hidden lg:block'
          } transition-[outline] duration-150 ${
            hotkeyFlash === 'island' ? 'outline outline-2 outline-offset-2 outline-[#1A3629]/30 rounded-3xl' : ''
          }`}>
            <SanctuaryObservatory
              isLedgerOpen={isCorkboardOpen}
              onToggleLedger={() => {
                retroAudio.playPaperRustle();
                haptics.tap();
                setIsCorkboardOpen((prev) => !prev);
              }}
              onOpenReceipt={() => setIsReceiptOpen(true)}
              justSealedDate={justSealedDate}
            />
          </div>

          {/* RIGHT 50%: 3 Stacked Operator Cards */}
          <div className={`w-full lg:col-span-6 xl:col-span-6 ${
            mobileStation === 'console' ? 'flex' : 'hidden lg:flex'
          } flex-col gap-6`}>
            
            {/* CARD 1: Log Food */}
            <div className={`w-full transition-[outline] duration-150 ${
              hotkeyFlash === 'fuel' ? 'outline outline-2 outline-offset-2 outline-[#1A3629]/30 rounded-3xl' : ''
            }`}>
              <DailyFuelCard
                currentProtein={currentProtein}
                targetProtein={targetProtein}
                currentDate={currentDate}
              />
            </div>

            {/* CARD 2: Evening Ledger & Sleep / Zen */}
            <div className="w-full">
              <EveningSleepCard
                onOpenSchedule={() => setIsScheduleModalOpen(true)}
                onOpenReceipt={() => setIsReceiptOpen(true)}
                onToggleCorkboard={() => {
                  retroAudio.playPaperRustle();
                  haptics.tap();
                  setIsCorkboardOpen((prev) => !prev);
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                    setMobileStation('island');
                  }
                }}
                onOpenAmbient={() => setIsAmbientOpen(true)}
                isCorkboardOpen={isCorkboardOpen}
              />
            </div>

            {/* CARD 3: Daily Ritual Anchors */}
            <div className={`w-full transition-[outline] duration-150 ${
              hotkeyFlash === 'habits' ? 'outline outline-2 outline-offset-2 outline-[#1A3629]/30 rounded-3xl' : ''
            }`}>
              <CoreHabitsCard onOpenSchedule={() => setIsScheduleModalOpen(true)} />
            </div>

          </div>

        </div>

        {/* TIER 3: Archival Museum Specimen Reliquary Sub-Floor */}
        <SpecimenVaultSubfloor />

      </main>

      {/* Bottom Left: Discreet Audio Toggle */}
      <button
        type="button"
        onClick={handleToggleMute}
        className="fixed bottom-6 left-6 z-30 w-11 h-11 rounded-full border border-[#1A3629]/15 bg-[#FFFDF9]/95 backdrop-blur-md shadow-md text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9] transition-all flex items-center justify-center cursor-pointer group"
        title={isMuted ? 'Sound is Muted (Click to Unmute)' : 'Sound is Active (Click to Mute)'}
        aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 text-[#DC2626] group-hover:text-white" />
        ) : (
          <Volume2 className="w-4 h-4 text-[#10B981] group-hover:text-white" />
        )}
      </button>

      {/* Minimalist Thermal Receipt Modal */}
      <MinimalistReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
      />

      {/* Monitor-2 Ambient Living Desk Diorama */}
      <AmbientDeskDiorama
        isOpen={isAmbientOpen}
        onClose={() => setIsAmbientOpen(false)}
      />

      {/* Schedule Adjustment Modal */}
      {isScheduleModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#1A3629]/40 backdrop-blur-xs animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsScheduleModalOpen(false);
          }}
        >
          <div className="w-full max-w-sm bg-[#FFFDF9] border border-[#1A3629]/15 rounded-2xl p-6 shadow-[0_20px_50px_rgba(26,54,41,0.15)] flex flex-col gap-4 relative">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full border border-[#1A3629]/15 bg-[#FAF8F5] text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9] transition-colors flex items-center justify-center cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div>
              <h3 className="font-cabinet font-extrabold text-lg text-[#1A3629] tracking-tight">
                Circadian Schedule
              </h3>
              <p className="font-sans text-xs text-[#4A5D4E] mt-0.5">
                Sets your morning sunlight window, caffeine cutoff, and evening seal.
              </p>
            </div>

            <form onSubmit={handleSaveSchedule} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-cabinet font-bold text-xs text-[#1A3629]">
                  Wake Time
                </label>
                <input
                  type="time"
                  value={tempWake}
                  onChange={(e) => setTempWake(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#1A3629]/15 rounded-xl px-3 py-2 font-mono text-sm font-bold text-[#1A3629] focus:outline-none focus:border-[#1A3629]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-cabinet font-bold text-xs text-[#1A3629]">
                  Target Bedtime
                </label>
                <input
                  type="time"
                  value={tempBed}
                  onChange={(e) => setTempBed(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#1A3629]/15 rounded-xl px-3 py-2 font-mono text-sm font-bold text-[#1A3629] focus:outline-none focus:border-[#1A3629]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs hover:bg-[#2C4A3B] transition-colors cursor-pointer mt-1"
              >
                Save Schedule
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4F0EA] flex items-center justify-center text-[#1A3629] font-mono text-xs">Loading Member Cockpit...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
