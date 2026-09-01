'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { xpParticleEmitter } from '@/lib/particleEmitter';
import {
  Compass,
  CheckCircle2,
  UtensilsCrossed,
  Sparkles,
  Gift,
  ArrowRight,
  ArrowLeft,
  X,
  Award,
} from 'lucide-react';

interface WalkthroughStep {
  id: string;
  stepNumber: number;
  totalSteps: number;
  route: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  highlightSelector?: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  bgTint: string;
}

const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    id: 'dashboard-habits',
    stepNumber: 1,
    totalSteps: 4,
    route: '/dashboard',
    badge: 'Stage 1 of 4 · Command Deck',
    title: 'Daily Rituals & Streak Engine',
    subtitle: 'Check off micro-habits & earn live XP',
    description:
      'Your dashboard is calibrated to your primary goals. Checking off morning sunlight, protein targets, hydration, and sleep awards instant XP, fuels your streak, and levels up your explorer rank.',
    icon: CheckCircle2,
    accentColor: '#10B981',
    bgTint: '#ECFDF5',
  },
  {
    id: 'recipes-fuel',
    stepNumber: 2,
    totalSteps: 4,
    route: '/recipes',
    badge: 'Stage 2 of 4 · Fuel Depot',
    title: 'Whole-Food Fuel & AI Plate Scanner',
    subtitle: 'Macro-tailored culinary recipes & instant camera analysis',
    description:
      'Explore high-protein, nutrient-dense recipes with smart portion multipliers. Need to log a meal quickly? Tap "Scan Plate" to snap a photo and let our AI vision analyze macros in seconds.',
    icon: UtensilsCrossed,
    accentColor: '#D97706',
    bgTint: '#FEF3C7',
  },
  {
    id: 'sanctuary-diorama',
    stepNumber: 3,
    totalSteps: 4,
    route: '/sanctuary',
    badge: 'Stage 3 of 4 · Living World',
    title: '16-Bit Floating Sanctuary',
    subtitle: 'Your metabolic consistency physically evolves this island',
    description:
      'This floating island diorama is directly synchronized with your daily health habits. As your level ascends, new biome landmarks, glowing beacons, and retro companions awaken in real-time.',
    icon: Sparkles,
    accentColor: '#8B5CF6',
    bgTint: '#F5F3FF',
  },
  {
    id: 'guild-referral',
    stepNumber: 4,
    totalSteps: 4,
    route: '/profile',
    badge: 'Stage 4 of 4 · Guild Network',
    title: 'Adventurer’s Guild & Referral Bonus',
    subtitle: 'Recruit friends and earn mutual +250 XP bonuses',
    description:
      'Leveling up is better together. Use the "Invite (+250 XP)" button in the top navbar or in your profile dossier to share your invite link. When a companion joins, you both unlock +250 Bonus XP!',
    icon: Gift,
    accentColor: '#10B981',
    bgTint: '#ECFDF5',
  },
];

export function PioneerWalkthrough() {
  const router = useRouter();
  const pathname = usePathname();
  const { userSession, userProfile, completeWalkthrough } = useHabitStore();

  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  const userId = userSession?.id || 'guest';
  const storageKey = `cyath_walkthrough_completed_${userId}`;

  // Initial auto-launch trigger when new user lands on dashboard
  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;

    // Check if walkthrough already completed in store or localStorage
    const localCompleted = localStorage.getItem(storageKey) === 'true';
    const storeCompleted = userProfile?.walkthroughCompleted === true;

    // Only auto-trigger when on dashboard, onboarding is completed, and walkthrough hasn't been done
    if (!localCompleted && !storeCompleted && pathname === '/dashboard') {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setCurrentStepIndex(0);
        retroAudio.playInspectConfirm();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [storageKey, pathname, userProfile]);

  // Listen for manual replay requests
  useEffect(() => {
    const handleOpen = () => {
      retroAudio.playInspectConfirm();
      setIsOpen(true);
      setCurrentStepIndex(0);
    };

    window.addEventListener('open-cyath-walkthrough', handleOpen);
    return () => window.removeEventListener('open-cyath-walkthrough', handleOpen);
  }, []);

  const currentStep = WALKTHROUGH_STEPS[currentStepIndex];

  const handleNext = useCallback(() => {
    retroAudio.playInspectConfirm();
    if (currentStepIndex < WALKTHROUGH_STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      const nextRoute = WALKTHROUGH_STEPS[nextIndex].route;
      if (pathname !== nextRoute) {
        router.push(nextRoute);
      }
    } else {
      // Final step complete!
      completeWalkthrough();
      localStorage.setItem(storageKey, 'true');
      retroAudio.playTierUpgrade();
      
      // Emit celebratory particles to bottom corner badge
      const badgeTarget = document.getElementById('xp-hud-badge-target');
      if (badgeTarget) {
        const rect = badgeTarget.getBoundingClientRect();
        xpParticleEmitter.emit(rect.left + rect.width / 2, rect.top + rect.height / 2, 24);
      }
      setIsOpen(false);
    }
  }, [currentStepIndex, pathname, router, completeWalkthrough, storageKey]);

  const handlePrev = useCallback(() => {
    retroAudio.playBlip();
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      const prevRoute = WALKTHROUGH_STEPS[prevIndex].route;
      if (pathname !== prevRoute) {
        router.push(prevRoute);
      }
    }
  }, [currentStepIndex, pathname, router]);

  const handleSkip = useCallback(() => {
    retroAudio.playBlip();
    localStorage.setItem(storageKey, 'true');
    setIsOpen(false);
  }, [storageKey]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, handleSkip]);

  if (!mounted || !isOpen) return null;

  const IconComponent = currentStep.icon;
  const isFinalStep = currentStepIndex === WALKTHROUGH_STEPS.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="walkthrough-step-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-[#1A3629]/40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-[#FFFDF9] border-3 border-[#1A3629] rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_#1A3629] flex flex-col gap-5 animate-in zoom-in-95 duration-200">
        
        {/* Top Header: Badge, Progress Dots, Close Button */}
        <div className="flex items-center justify-between gap-4 border-b-2 border-[#1A3629]/15 pb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl border-2 border-[#1A3629] flex items-center justify-center shadow-[2px_2px_0px_#1A3629]"
              style={{ backgroundColor: currentStep.bgTint }}
            >
              <Compass className="w-4 h-4 text-[#1A3629]" />
            </div>
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#4A5D4E] block">
                Pioneer Calibration Tour
              </span>
              <span className="font-cabinet font-bold text-xs text-[#1A3629]">
                {currentStep.badge}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Step Indicator Dots */}
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {WALKTHROUGH_STEPS.map((step, idx) => (
                <div
                  key={step.id}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentStepIndex
                      ? 'w-6 bg-[#10B981] border border-[#1A3629]'
                      : idx < currentStepIndex
                      ? 'w-2 bg-[#1A3629]'
                      : 'w-2 bg-[#EAE3D2] border border-[#1A3629]/30'
                  }`}
                />
              ))}
            </div>

            {/* Skip / Close Button */}
            <button
              type="button"
              onClick={handleSkip}
              className="p-1.5 rounded-lg border border-[#1A3629]/20 hover:border-[#1A3629] hover:bg-[#FAF6EE] text-[#1A3629] cursor-pointer transition-colors"
              title="Skip Tour"
              aria-label="Skip walkthrough"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card Body: Icon, Title, Subtitle, Description */}
        <div className="space-y-3">
          <div className="flex items-start gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl border-2 border-[#1A3629] flex items-center justify-center shrink-0 shadow-[3px_3px_0px_#1A3629]"
              style={{ backgroundColor: currentStep.bgTint }}
            >
              <IconComponent className="w-6 h-6 text-[#1A3629]" />
            </div>

            <div>
              <h2
                id="walkthrough-step-title"
                className="font-fraunces font-black text-xl sm:text-2xl text-[#1A3629] tracking-tight leading-tight"
              >
                {currentStep.title}
              </h2>
              <p className="font-mono text-[11px] font-bold text-[#4A5D4E] mt-0.5">
                {currentStep.subtitle}
              </p>
            </div>
          </div>

          <p className="font-cabinet font-medium text-xs sm:text-sm text-[#2C4A3B] leading-relaxed bg-[#FAF6EE] p-4 rounded-2xl border-2 border-[#1A3629]/15">
            {currentStep.description}
          </p>
        </div>

        {/* Bottom Actions: Back, Skip text, Next / Complete Button */}
        <div className="flex items-center justify-between pt-2">
          {currentStepIndex > 0 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-2.5 rounded-xl border-2 border-[#1A3629] bg-[#FAF6EE] hover:bg-[#E8DECF] text-[#1A3629] font-cabinet font-bold text-xs shadow-[2px_2px_0px_#1A3629] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-mono font-bold text-[#4A5D4E] hover:text-[#1A3629] underline underline-offset-4 cursor-pointer"
            >
              Skip Tour
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className={`px-5 py-2.5 rounded-xl border-2 font-cabinet font-bold text-xs shadow-[3px_3px_0px_#1A3629] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-2 cursor-pointer ${
              isFinalStep
                ? 'bg-[#10B981] text-white border-[#1A3629] shadow-[3px_3px_0px_#1A3629]'
                : 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629]'
            }`}
          >
            {isFinalStep ? (
              <>
                <Award className="w-4 h-4 text-white" />
                <span>Complete Quest (+50 XP)</span>
              </>
            ) : (
              <>
                <span>Next Objective</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
