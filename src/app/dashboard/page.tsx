'use client';

import React, { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { useHabitStore, TROPHIES_ROSTER } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { formatLocalDate } from '@/lib/dateUtils';
import { LivingIslandHero } from '@/components/dashboard/LivingSkyCanopy';
import { CoreHabitsCard } from '@/components/dashboard/CoreHabitsCard';
import { DailyFuelCard } from '@/components/dashboard/DailyFuelCard';
import { EveningSealButton } from '@/components/dashboard/EveningSealButton';
import { ItemGetBanner } from '@/components/dashboard/ItemGetBanner';
import { SpecimenVaultSubfloor } from '@/components/dashboard/SpecimenVaultSubfloor';
import { MinimalistReceiptModal } from '@/components/dashboard/MinimalistReceiptModal';
import { WaxSealCorkboard } from '@/components/dashboard/WaxSealCorkboard';
import { AmbientDeskDiorama } from '@/components/dashboard/AmbientDeskDiorama';
import { PixelWaxSeal } from '@/components/dashboard/PixelWaxSeal';
import {
  Volume2,
  VolumeX,
  X,
  Maximize2,
} from 'lucide-react';

function DashboardContent() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hotkeyFlash, setHotkeyFlash] = useState<'habits' | 'fuel' | 'island' | null>(null);

  // Modal States
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isCorkboardOpen, setIsCorkboardOpen] = useState(false);
  const [justSealedDate, setJustSealedDate] = useState<string | null>(null);
  const [isAmbientOpen, setIsAmbientOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [mobileStation, setMobileStation] = useState<'island' | 'habits' | 'fuel'>('island');
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
        setMobileStation('fuel');
        retroAudio.playBlip();
        flashHotkey('fuel');
        const fuelInput = document.getElementById('quick-protein-input');
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
            {/* Desktop Keyboard Accelerators Strip — visible from lg up */}
            <div className="hidden lg:flex items-center gap-2 font-mono text-[11px] text-[#4A5D4E] bg-[#FFFDF9]/80 px-3 py-1.5 rounded-full border border-[#1A3629]/12 shadow-2xs">
              <span className="text-[#1A3629]/60 font-semibold">Hotkeys:</span>
              <span className="flex items-center gap-1 font-bold text-[#1A3629]">
                <kbd className="px-1.5 py-0.2 bg-[#EAE4D9] border border-[#1A3629]/20 rounded-xs text-[10px]">1</kbd> Sun
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 font-bold text-[#1A3629]">
                <kbd className="px-1.5 py-0.2 bg-[#EAE4D9] border border-[#1A3629]/20 rounded-xs text-[10px]">2</kbd> Water
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 font-bold text-[#1A3629]">
                <kbd className="px-1.5 py-0.2 bg-[#EAE4D9] border border-[#1A3629]/20 rounded-xs text-[10px]">3</kbd> Fuel
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 font-bold text-[#1A3629]">
                <kbd className="px-1.5 py-0.2 bg-[#EAE4D9] border border-[#1A3629]/20 rounded-xs text-[10px]">L</kbd> Ledger
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 font-bold text-[#1A3629]">
                <kbd className="px-1.5 py-0.2 bg-[#EAE4D9] border border-[#1A3629]/20 rounded-xs text-[10px]">A</kbd> Zen
              </span>
            </div>

            {/* Specimen Reliquary Sub-Floor Jump Button */}
            <button
              type="button"
              onClick={handleOpenVault}
              className="h-9 px-4 rounded-full border border-[#1A3629]/15 bg-[#FFFDF9] text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9] font-cabinet font-bold text-xs transition-colors cursor-pointer shadow-2xs flex items-center gap-2"
            >
              <span>Reliquary ({unlockedTrophies.length}/{TROPHIES_ROSTER.length})</span>
            </button>
          </div>
        </div>

        {/* Mobile Cockpit Station Dock (Ergonomic Segmented Switcher for <1024px) */}
        <div role="tablist" aria-label="Dashboard sections" className="lg:hidden w-full sticky top-18 z-20 p-1.5 bg-[#EAE4D9]/95 backdrop-blur-md rounded-2xl border border-[#1A3629]/15 shadow-sm flex items-center justify-between gap-1.5 my-1">
          <button
            role="tab"
            aria-selected={mobileStation === 'habits'}
            aria-label="Daily Anchors habits"
            type="button"
            onClick={() => {
              setMobileStation('habits');
              retroAudio.playBlip();
              haptics.tap();
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl font-cabinet font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
              mobileStation === 'habits'
                ? 'bg-[#1A3629] text-[#FFFDF9] shadow-xs'
                : 'text-[#1A3629]/70 hover:text-[#1A3629] hover:bg-black/5'
            }`}
          >
            <span aria-hidden="true">⚡</span> Anchors
          </button>

          <button
            role="tab"
            aria-selected={mobileStation === 'island'}
            aria-label="Floating island sanctuary"
            type="button"
            onClick={() => {
              setMobileStation('island');
              retroAudio.playBlip();
              haptics.tap();
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl font-cabinet font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
              mobileStation === 'island'
                ? 'bg-[#1A3629] text-[#FFFDF9] shadow-xs'
                : 'text-[#1A3629]/70 hover:text-[#1A3629] hover:bg-black/5'
            }`}
          >
            <span aria-hidden="true">🏝️</span> Island
          </button>

          <button
            role="tab"
            aria-selected={mobileStation === 'fuel'}
            aria-label="Daily fuel and protein"
            type="button"
            onClick={() => {
              setMobileStation('fuel');
              retroAudio.playBlip();
              haptics.tap();
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl font-cabinet font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
              mobileStation === 'fuel'
                ? 'bg-[#1A3629] text-[#FFFDF9] shadow-xs'
                : 'text-[#1A3629]/70 hover:text-[#1A3629] hover:bg-black/5'
            }`}
          >
            <span aria-hidden="true">🥩</span> Fuel
          </button>
        </div>

        {/* Asymmetric Stage: Slim flanks frame a dominant center island column */}
        <div
          className="w-full flex flex-col lg:flex-row items-start justify-between gap-5 xl:gap-8 animate-in fade-in duration-150"
          onTouchStart={(e) => { swipeTouchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (swipeTouchStartX.current === null) return;
            const dx = e.changedTouches[0].clientX - swipeTouchStartX.current;
            swipeTouchStartX.current = null;
            if (Math.abs(dx) < 60) return;
            const order: Array<'habits' | 'island' | 'fuel'> = ['habits', 'island', 'fuel'];
            const idx = order.indexOf(mobileStation);
            if (dx < 0 && idx < order.length - 1) setMobileStation(order[idx + 1]);
            if (dx > 0 && idx > 0) setMobileStation(order[idx - 1]);
          }}
        >

          {/* LEFT FLANK: Compact Habit Punch-Pad sidebar */}
          <div className={`w-full lg:w-[260px] xl:w-[280px] 2xl:w-[300px] shrink-0 ${mobileStation === 'habits' ? 'flex' : 'hidden lg:flex'} flex-col gap-3 order-2 lg:order-1 transition-[outline] duration-150 ${hotkeyFlash === 'habits' ? 'outline outline-2 outline-offset-2 outline-[#1A3629]/30 rounded-2xl' : ''}`}>
            <CoreHabitsCard onOpenSchedule={() => setIsScheduleModalOpen(true)} />
          </div>

          {/* CENTER STAGE: Dominant focal column — island + day-end CTAs live here */}
          <div className={`flex-1 min-w-[46%] w-full ${mobileStation === 'island' ? 'flex' : 'hidden lg:flex'} flex-col items-center justify-start gap-4 py-2 order-1 lg:order-2`}>
            <LivingIslandHero onOpenReceipt={() => setIsReceiptOpen(true)} />

            {/* Day-close CTA cluster — naturally where the eye lands after the island */}
            <div className="w-full max-w-sm flex flex-col gap-2.5">
              {!isLedgerSealedByDate[currentDate] && (
                <button
                  type="button"
                  onClick={() => {
                    retroAudio.playPaperRustle();
                    haptics.tap();
                    setJustSealedDate(null);
                    setIsCorkboardOpen(true);
                  }}
                  className="w-full p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#1A3629]/15 shadow-[0_4px_20px_rgba(26,54,41,0.04)] hover:border-[#1A3629]/30 hover:shadow-md transition-all flex items-center justify-between cursor-pointer group text-left active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#F4F0EA] border border-[#1A3629]/12 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                      <PixelWaxSeal size={22} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-cabinet font-extrabold text-sm text-[#1A3629]">
                        30-Day Guild Ledger
                      </span>
                      <span className="font-mono text-[11px] text-[#4A5D4E]">
                        {Object.values(isLedgerSealedByDate).filter(Boolean).length} / 30 Pinned
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#1A3629] group-hover:translate-x-0.5 transition-transform shrink-0">
                    Board →
                  </span>
                </button>
              )}

              <EveningSealButton
                onOpenReceipt={() => setIsReceiptOpen(true)}
                onOpenCorkboard={(sealedDate) => {
                  setJustSealedDate(sealedDate || currentDate);
                  setIsCorkboardOpen(true);
                }}
              />

              <button
                type="button"
                onClick={() => {
                  retroAudio.playBlip();
                  haptics.tap();
                  setIsAmbientOpen(true);
                }}
                className="w-full px-4 py-2 rounded-full border border-[#1A3629]/12 bg-[#FFFDF9]/80 hover:bg-[#1A3629] hover:text-[#FFFDF9] hover:border-[#1A3629] text-[#1A3629] font-mono text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-2 group"
                title="Zen Ambient Desk Display (Press A)"
              >
                <Maximize2 className="w-3 h-3 text-emerald-600 group-hover:text-white" />
                <span>Zen Desk Ambience</span>
                <kbd className="ml-1 px-1.5 py-px bg-[#EAE4D9] group-hover:bg-white/20 border border-[#1A3629]/15 group-hover:border-white/30 rounded text-[10px] transition-colors">A</kbd>
              </button>
            </div>
          </div>

          {/* RIGHT FLANK: Daily Fuel — slim sidebar matching left */}
          <div className={`w-full lg:w-[260px] xl:w-[280px] 2xl:w-[300px] shrink-0 ${mobileStation === 'fuel' ? 'flex' : 'hidden lg:flex'} flex-col gap-3 order-3 lg:order-3 transition-[outline] duration-150 ${hotkeyFlash === 'fuel' ? 'outline outline-2 outline-offset-2 outline-[#1A3629]/30 rounded-2xl' : ''}`}>
            <DailyFuelCard
              currentProtein={currentProtein}
              targetProtein={targetProtein}
              currentDate={currentDate}
            />
          </div>

        </div>

        {/* Archival Museum Specimen Reliquary Sub-Floor (Treatment 2 & Location 2) */}
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

      {/* 30-Day Guild Wax-Seal Corkboard */}
      <WaxSealCorkboard
        isOpen={isCorkboardOpen}
        onClose={() => {
          setIsCorkboardOpen(false);
          setJustSealedDate(null);
        }}
        justSealedDate={justSealedDate}
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
