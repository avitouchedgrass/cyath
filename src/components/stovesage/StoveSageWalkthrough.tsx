'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';

interface WalkthroughStage {
  route: string;
  badge: string;
  stepNumber: number;
  totalSteps: number;
  title: string;
  dialogue: string;
  actionHint: string;
  targetFocusLabel: string;
}

const TOUR_STAGES: WalkthroughStage[] = [
  {
    route: '/dashboard',
    badge: 'Stage 1 of 4',
    stepNumber: 1,
    totalSteps: 4,
    title: 'Daily Rituals',
    dialogue:
      "Welcome to your Dashboard, your metabolic command deck. Every habit you check off rewards you with XP, levels up your character, and builds your streak.",
    actionHint: 'Check habits, track your hydration and sleep, and keep your streak alive.',
    targetFocusLabel: 'Dashboard Habits & Metrics',
  },
  {
    route: '/recipes',
    badge: 'Stage 2 of 4',
    stepNumber: 2,
    totalSteps: 4,
    title: 'Recipe Catalog',
    dialogue:
      "Explore high-protein meals with real-time portion multipliers, or click 'Scan Plate' to let our AI vision analyze a photograph of your meal.",
    actionHint: 'Clicking any recipe auto-calculates macros and lets you log it in one tap.',
    targetFocusLabel: 'Pixel Recipes & AI Food Scanner',
  },
  {
    route: '/protocols',
    badge: 'Stage 3 of 4',
    stepNumber: 3,
    totalSteps: 4,
    title: 'Evidence-Based Protocols',
    dialogue:
      "Protocols are backed by circadian biology and sports science. Activating any protocol seamlessly adds its habit stack directly to your daily dashboard.",
    actionHint: 'Choose from Morning Sunlight, Cognitive Flow, or Deep Sleep stacks.',
    targetFocusLabel: 'Curated Behavioral Blueprints',
  },
  {
    route: '/correlations',
    badge: 'Stage 4 of 4',
    stepNumber: 4,
    totalSteps: 4,
    title: 'Interactive Correlations',
    dialogue:
      "Cyath connects your protein, hydration, and sleep logs directly with your focus and energy scores. Click my floating sprite anytime if you need advice.",
    actionHint: 'You have completed the walkthrough tour. Start tracking your progress.',
    targetFocusLabel: 'Scientific Correlation Matrix',
  },
];

export function StoveSageWalkthrough() {
  const router = useRouter();
  const pathname = usePathname();
  const { userSession } = useHabitStore();

  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const storageKey = `cyath_stovesage_walkthrough_completed_${userSession?.id || 'guest'}`;

  // Initial trigger check for new users when landing on dashboard
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasCompleted = localStorage.getItem(storageKey);
    if (!hasCompleted && pathname === '/dashboard') {
      const timer = setTimeout(() => {
        setIsActive(true);
        setCurrentStepIndex(0);
        window.dispatchEvent(new CustomEvent('stovesage-walkthrough-start'));
        retroAudio.playInspectConfirm();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [storageKey, pathname]);

  // Listen for manual trigger (e.g. from chatbot "Guide" button)
  useEffect(() => {
    const handleTrigger = () => {
      setCurrentStepIndex(0);
      setIsActive(true);
      window.dispatchEvent(new CustomEvent('stovesage-walkthrough-start'));
      router.push(TOUR_STAGES[0].route);
      retroAudio.playInspectConfirm();
    };

    window.addEventListener('open-stovesage-walkthrough', handleTrigger);
    return () => window.removeEventListener('open-stovesage-walkthrough', handleTrigger);
  }, [router]);

  // Sync route on step change
  const navigateToStep = (index: number) => {
    const targetStage = TOUR_STAGES[index];
    if (!targetStage) return;
    setCurrentStepIndex(index);
    retroAudio.playBlip();
    if (pathname !== targetStage.route) {
      router.push(targetStage.route);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < TOUR_STAGES.length - 1) {
      navigateToStep(currentStepIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      navigateToStep(currentStepIndex - 1);
    }
  };

  const handleComplete = () => {
    retroAudio.playInspectConfirm();
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, 'true');
      window.dispatchEvent(new CustomEvent('stovesage-walkthrough-end'));
    }
    setIsActive(false);
    if (pathname !== '/dashboard') {
      router.push('/dashboard');
    }
  };

  // Keyboard shortcut support
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleComplete();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, currentStepIndex]);

  if (!isActive) return null;

  const currentStage = TOUR_STAGES[currentStepIndex];
  const isLast = currentStepIndex === TOUR_STAGES.length - 1;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Clean Bottom Floating Dock */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto w-[92vw] max-w-2xl animate-in slide-in-from-bottom-4 duration-200">
        <div className="relative bg-[#FFFDF9] border-3 border-[#1A3629] rounded-2xl p-5 shadow-[6px_6px_0px_#1A3629] flex items-center gap-5">
          
          {/* StoveSage Sprite */}
          <div className="relative shrink-0 flex flex-col items-center">
            <div className="relative w-16 h-24 sm:w-20 sm:h-28 animate-[bounce_2.5s_ease-in-out_infinite]">
              <Image
                src="/assets/stovesage.png"
                alt="StoveSage"
                fill
                className="object-contain drop-shadow-[2px_2px_0px_rgba(26,54,41,0.25)] [image-rendering:pixelated]"
                priority
              />
            </div>
            <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#FAF6EE] border border-[#1A3629]/20 text-[#1A3629] -mt-1">
              StoveSage
            </span>
          </div>

          {/* Dialogue & Controls */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            
            {/* Header: Stage Badge + Step Progress + Skip */}
            <div className="flex items-center justify-between gap-3 border-b border-[#1A3629]/15 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#3A6B52]">
                  {currentStage.badge}
                </span>
                <span className="text-[#1A3629]/30 font-mono text-xs">/</span>
                <span className="font-cabinet text-xs font-bold text-[#1A3629]">
                  {currentStage.targetFocusLabel}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  {TOUR_STAGES.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => navigateToStep(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        idx === currentStepIndex
                          ? 'w-6 bg-[#1A3629]'
                          : 'w-2 bg-[#1A3629]/20 hover:bg-[#1A3629]/50'
                      }`}
                      aria-label={`Jump to stage ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleComplete}
                  className="font-mono text-[11px] font-bold text-[#1A3629]/60 hover:text-[#1A3629] transition-colors cursor-pointer"
                >
                  Skip [ESC]
                </button>
              </div>
            </div>

            {/* Title & Body */}
            <div>
              <h4 className="font-fraunces font-bold text-lg text-[#1A3629] leading-tight">
                {currentStage.title}
              </h4>
              <p className="font-cabinet text-xs sm:text-sm leading-relaxed text-[#1A3629]/90 mt-1 font-medium">
                {currentStage.dialogue}
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-[#1A3629]/10">
              <span className="text-[11px] font-mono text-[#3A6B52] font-semibold">
                {currentStage.actionHint}
              </span>

              <div className="flex items-center gap-2 shrink-0">
                {currentStepIndex > 0 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-3 py-1.5 rounded-lg border border-[#1A3629] bg-[#FFFDF9] hover:bg-[#FAF6EE] text-[#1A3629] font-cabinet font-bold text-xs transition-all cursor-pointer"
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-1.5 rounded-xl border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs sm:text-sm shadow-[2px_2px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-y-[1px] transition-all cursor-pointer"
                >
                  {isLast ? 'Complete' : 'Next'}
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

