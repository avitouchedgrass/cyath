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
import { SpecimenVaultDrawer } from '@/components/dashboard/SpecimenVaultDrawer';
import { MinimalistReceiptModal } from '@/components/dashboard/MinimalistReceiptModal';
import { WeeklyDossierModal } from '@/components/dashboard/WeeklyDossierModal';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Clock,
  Receipt,
  FileText,
  Shield,
  X,
  Check,
} from 'lucide-react';

function DashboardContent() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Modal / Drawer States
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [vaultInitialTrophyId, setVaultInitialTrophyId] = useState<string | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

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
  } = useHabitStore();

  const isAuthenticated = !!userSession && !userSession.id.startsWith('guest_');

  useEffect(() => {
    setMounted(true);
    setIsMuted(retroAudio.getMuted());

    const handleMuteChange = (e: CustomEvent<{ isMuted: boolean }>) => {
      setIsMuted(e.detail.isMuted);
    };
    window.addEventListener('cyath-audio-mute-changed' as any, handleMuteChange);

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

  const handleOpenVault = (trophyId?: string) => {
    setVaultInitialTrophyId(trophyId || null);
    setIsVaultOpen(true);
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
      {/* Subtle Archival Drafting Grid Pattern */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 opacity-40 mix-blend-multiply"
        style={{
          backgroundImage: 'radial-gradient(#1A3629 0.75px, transparent 0.75px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse at 50% 30%, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 30%, black 40%, transparent 80%)'
        }}
        aria-hidden="true"
      />

      <HeaderNav />

      {/* Celebratory Dropdown on Trophy Earned */}
      <ItemGetBanner onOpenVault={handleOpenVault} />

      {/* Main Sanctuary Cockpit Container */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 flex flex-col gap-6">
        
        {/* Cockpit Header Row: Status & Consolidated Utility Dock */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1A3629]/10 pb-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-cabinet font-extrabold text-2xl sm:text-3xl tracking-tight text-[#1A3629]">
                Sanctuary Cockpit
              </h1>

              {/* Streak Badge with Custom Flame */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFDF9]/90 border border-[#1A3629]/12 shadow-2xs">
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
              </div>
            </div>

            <p className="text-xs text-[#4A5D4E] font-sans">
              {isViewingToday
                ? 'Daily reactive habit canvas, whole-food fuel tracker, and circadian cadence.'
                : `Archived log view for ${currentDate}.`}
            </p>
          </div>

          {/* Unified Utility Command Dock */}
          <div className="flex items-center gap-1 p-1 rounded-full border border-[#1A3629]/12 bg-[#FFFDF9]/90 backdrop-blur-md shadow-2xs flex-wrap self-start lg:self-auto">
            
            {/* Ambient Schedule Chip */}
            <button
              type="button"
              onClick={() => {
                retroAudio.playBlip();
                haptics.tap();
                setTempWake(userProfile?.wakeTime || '07:30');
                setTempBed(userProfile?.bedTime || '23:30');
                setIsScheduleModalOpen(true);
              }}
              className="h-8 inline-flex items-center gap-1.5 px-3 rounded-full hover:bg-[#FAF6EE] text-[#1A3629] font-mono text-xs font-bold transition-colors cursor-pointer"
              title="Click to adjust your sleep and wake schedule"
            >
              <Clock className="w-3.5 h-3.5 text-[#4A5D4E]" />
              <span>Wake {userProfile?.wakeTime || '07:30'} · Sleep {userProfile?.bedTime || '23:30'}</span>
            </button>

            <div className="h-4 w-px bg-[#1A3629]/12" />

            {/* Audio Mute Toggle */}
            <button
              type="button"
              onClick={handleToggleMute}
              className="w-8 h-8 rounded-full hover:bg-[#FAF6EE] text-[#1A3629] transition-colors cursor-pointer flex items-center justify-center"
              title={isMuted ? 'Sound is Muted (Click to Unmute)' : 'Sound is Active (Click to Mute)'}
              aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-[#DC2626]" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#10B981]" />
              )}
            </button>

            <div className="h-4 w-px bg-[#1A3629]/12" />

            {/* Specimen Vault Trigger */}
            <button
              type="button"
              onClick={() => handleOpenVault()}
              className="h-8 inline-flex items-center gap-1.5 px-3 rounded-full text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9] font-cabinet font-bold text-xs transition-colors cursor-pointer group"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D97706] group-hover:text-[#FCD34D]" />
              <span>Vault ({unlockedTrophies.length}/{TROPHIES_ROSTER.length})</span>
            </button>

            {/* Minimalist Receipt Trigger */}
            <button
              type="button"
              onClick={() => {
                retroAudio.playBlip();
                haptics.tap();
                setIsReceiptOpen(true);
              }}
              className="h-8 inline-flex items-center gap-1.5 px-3 rounded-full text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9] font-cabinet font-bold text-xs transition-colors cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Receipt</span>
            </button>

            {/* 7-Day Dossier Trigger */}
            <button
              type="button"
              onClick={() => {
                retroAudio.playBlip();
                haptics.tap();
                setIsDossierOpen(true);
              }}
              className="h-8 inline-flex items-center gap-1.5 px-3 rounded-full text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9] font-cabinet font-bold text-xs transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>7-Day Dossier</span>
            </button>
          </div>
        </div>

        {/* Consolidated Panoramic Grid: Balanced 3-Column Triptych */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-in fade-in duration-150">
          
          {/* MOBILE: Center Stage Island Renders First */}
          {/* DESKTOP: Center Column (lg:col-span-4 lg:order-2) */}
          <div className="w-full lg:col-span-4 order-1 lg:order-2 flex flex-col">
            <LivingIslandHero />
          </div>

          {/* MOBILE: Core Habits Card Renders Directly Below Island (Zero Scroll!) */}
          {/* DESKTOP: Left Column (lg:col-span-4 lg:order-1) */}
          <div className="w-full lg:col-span-4 order-2 lg:order-1 flex flex-col">
            <CoreHabitsCard />
          </div>

          {/* MOBILE: Daily Fuel Card Renders Next */}
          {/* DESKTOP: Right Column (lg:col-span-4 lg:order-3) */}
          <div className="w-full lg:col-span-4 order-3 lg:order-3 flex flex-col">
            <DailyFuelCard
              currentProtein={currentProtein}
              targetProtein={targetProtein}
              currentDate={currentDate}
            />
          </div>

          {/* Evening Seal Ceremony Banner: Gracefully Spans Bottom on Desktop / Follows on Mobile */}
          <div className="w-full lg:col-span-12 order-4">
            <EveningSealButton onOpenReceipt={() => setIsReceiptOpen(true)} />
          </div>

        </div>

      </main>

      {/* Specimen Vault Slide-Over Drawer */}
      <SpecimenVaultDrawer
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        initialSelectedId={vaultInitialTrophyId}
      />

      {/* Minimalist Thermal Receipt Modal */}
      <MinimalistReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
      />

      {/* 7-Day Intelligence Dossier Modal */}
      <WeeklyDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
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
