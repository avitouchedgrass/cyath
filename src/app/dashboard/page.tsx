'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { formatLocalDate } from '@/lib/dateUtils';
import { FullscreenSanctuaryStage } from '@/components/dashboard/FullscreenSanctuaryStage';
import { DailyDebriefRightDrawer } from '@/components/dashboard/DailyDebriefRightDrawer';
import { LedgerLeftDrawer } from '@/components/dashboard/LedgerLeftDrawer';
import { SpecimenVaultSubfloor } from '@/components/dashboard/SpecimenVaultSubfloor';
import { ItemGetBanner } from '@/components/dashboard/ItemGetBanner';
import { AuthModal } from '@/components/auth/AuthModal';
import { IslandBiomeGalleryModal } from '@/components/progression/IslandBiomeGalleryModal';
import { calculateLevel } from '@/lib/progression/engine';
import { supabase } from '@/lib/supabase';
import { PixelVolume, PixelVolumeMute } from '@/components/common/PixelIcons';

function DashboardContent() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // The Drawer & Modal States
  const [isSealDrawerOpen, setIsSealDrawerOpen] = useState(false);
  const [isLedgerDrawerOpen, setIsLedgerDrawerOpen] = useState(false);
  const [isBiomeGalleryOpen, setIsBiomeGalleryOpen] = useState(false);

  const {
    currentDate,
    setDate,
    totalXp,
    userSession,
    userProfile,
  } = useHabitStore();

  const isAuthenticated = !!userSession && !userSession.id.startsWith('guest_');
  const progress = calculateLevel(totalXp);

  useEffect(() => {
    setMounted(true);
    setIsMuted(retroAudio.getMuted());

    const handleMuteChange = (e: CustomEvent<{ isMuted: boolean }>) => {
      setIsMuted(e.detail.isMuted);
    };
    window.addEventListener('cyath-audio-mute-changed' as any, handleMuteChange);

    const handleCloseDrawers = () => {
      setIsSealDrawerOpen(false);
      setIsLedgerDrawerOpen(false);
    };
    window.addEventListener('cyath-close-drawers' as any, handleCloseDrawers);

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

      if (e.key === 'Escape') {
        setIsSealDrawerOpen(false);
        setIsLedgerDrawerOpen(false);
      }
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        if (!isAuthenticated) {
          setIsAuthModalOpen(true);
          return;
        }
        setIsSealDrawerOpen((prev) => !prev);
        setIsLedgerDrawerOpen(false);
      }
      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        if (!isAuthenticated) {
          setIsAuthModalOpen(true);
          return;
        }
        setIsLedgerDrawerOpen((prev) => !prev);
        setIsSealDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const today = formatLocalDate();
    if (currentDate !== today) {
      setDate(today);
    }

    const verifyOnboarding = async () => {
      if (!isAuthenticated || !userSession?.id) return;
      if (userProfile?.onboardingCompleted) return;

      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('onboarding_completed')
          .eq('user_id', userSession.id)
          .maybeSingle();

        if (profile?.onboarding_completed) {
          return;
        }
        router.push('/onboarding');
      } catch {}
    };

    verifyOnboarding();

    return () => {
      window.removeEventListener('cyath-audio-mute-changed' as any, handleMuteChange);
      window.removeEventListener('cyath-close-drawers' as any, handleCloseDrawers);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAuthenticated, userProfile, userSession, router, currentDate, setDate]);

  const handleToggleMute = () => {
    const next = retroAudio.toggleMute();
    setIsMuted(next);
    haptics.tap();
  };

  const handleScrollToTrophies = () => {
    retroAudio.playBlip();
    haptics.tap();
    const el = document.getElementById('specimen-reliquary');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F4F0EA] flex items-center justify-center text-[#1A3629] font-mono text-xs">
        Loading Sanctuary...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F4F0EA] text-[#1A3629] transition-colors duration-300 flex flex-col selection:bg-[#1A3629] selection:text-[#FFFDF9] overflow-x-hidden">
      {/* Subtle Ambient Sanctuary Lighting */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,253,249,0.75)_0%,_transparent_75%)]"
        aria-hidden="true"
      />

      <HeaderNav />

      {/* Celebratory Dropdown on Trophy Earned */}
      <ItemGetBanner onOpenVault={handleScrollToTrophies} />

      {/* Main Sanctuary Viewport */}
      <main className="relative z-10 flex-1 w-full flex flex-col pt-20">
        {/* Fullscreen Living Sanctuary Island with the 2 Primary Action Buttons */}
        <FullscreenSanctuaryStage
          onOpenSeal={() => {
            setIsSealDrawerOpen(true);
            setIsLedgerDrawerOpen(false);
          }}
          onOpenLedger={() => {
            setIsLedgerDrawerOpen(true);
            setIsSealDrawerOpen(false);
          }}
          onOpenBiomeGallery={() => setIsBiomeGalleryOpen(true)}
          onScrollToTrophies={handleScrollToTrophies}
          onRequireAuth={() => setIsAuthModalOpen(true)}
        />

        {/* Specimen Reliquary Sub-Floor (Trophy Showcase) at Bottom */}
        <div id="specimen-reliquary" className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8">
          <SpecimenVaultSubfloor onRequireAuth={() => setIsAuthModalOpen(true)} />
        </div>
      </main>

      {/* RIGHT SLIDE-OUT DRAWER: Turn-by-Turn Daily Debrief & Seal */}
      <DailyDebriefRightDrawer
        isOpen={isSealDrawerOpen}
        onClose={() => setIsSealDrawerOpen(false)}
        onOpenLedger={() => {
          setIsSealDrawerOpen(false);
          setIsLedgerDrawerOpen(true);
        }}
        onRequireAuth={() => setIsAuthModalOpen(true)}
      />

      {/* LEFT SLIDE-OUT DRAWER: Archival Corkboard Artboard with Pinned Receipts */}
      <LedgerLeftDrawer
        isOpen={isLedgerDrawerOpen}
        onClose={() => setIsLedgerDrawerOpen(false)}
        onOpenSeal={() => {
          setIsLedgerDrawerOpen(false);
          setIsSealDrawerOpen(true);
        }}
      />

      {/* Island Biome Gallery Modal (10-Tier Visual Progression & Suite Switcher) */}
      <IslandBiomeGalleryModal
        isOpen={isBiomeGalleryOpen}
        onClose={() => setIsBiomeGalleryOpen(false)}
        currentLevel={progress.level}
        totalXp={totalXp}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="login"
      />

      {/* Discreet Audio Toggle Button (Bottom Left) */}
      <button
        type="button"
        onClick={handleToggleMute}
        className="fixed bottom-6 left-6 z-30 w-11 h-11 rounded-full border border-[#1A3629]/15 bg-[#FFFDF9]/95 backdrop-blur-md shadow-md text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9] transition-all flex items-center justify-center cursor-pointer group"
        title={isMuted ? 'Sound is Muted (Click to Unmute)' : 'Sound is Active (Click to Mute)'}
        aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
      >
        {isMuted ? (
          <PixelVolumeMute size={16} className="text-[#DC2626] group-hover:text-white" />
        ) : (
          <PixelVolume size={16} className="text-[#10B981] group-hover:text-white" />
        )}
      </button>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F0EA] flex items-center justify-center text-[#1A3629] font-mono text-xs">
          Loading Sanctuary...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
