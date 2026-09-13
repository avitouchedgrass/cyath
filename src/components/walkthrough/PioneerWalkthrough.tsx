'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { xpParticleEmitter } from '@/lib/particleEmitter';
import {
  Sparkles,
  Activity,
  CheckCircle2,
  UtensilsCrossed,
  FileText,
  Bot,
  Compass,
  ArrowRight,
  ArrowLeft,
  X,
  Award,
} from 'lucide-react';

interface SpotlightStep {
  id: string;
  targetId: string;
  stepNumber: number;
  totalSteps: number;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  bgTint: string;
  preferredPlacement?: 'top' | 'bottom';
}

const SPOTLIGHT_STEPS: SpotlightStep[] = [
  {
    id: 'master-observatory',
    targetId: 'tour-living-sky',
    stepNumber: 1,
    totalSteps: 6,
    badge: 'Step 1 of 6 · Living Sanctuary',
    title: 'Living Island Sanctuary',
    subtitle: 'Your 16-bit sanctuary growing in real time',
    description:
      'Your living sanctuary sits at the heart of Cyath. As you log habits and fuel, your cottage blooms and levels up through seasonal tiers.',
    icon: Sparkles,
    accentColor: '#10B981',
    bgTint: '#ECFDF5',
    preferredPlacement: 'bottom',
  },
  {
    id: 'core-habits',
    targetId: 'tour-core-habits',
    stepNumber: 2,
    totalSteps: 6,
    badge: 'Step 2 of 6 · Non-Negotiables & Protocols',
    title: 'Focus Habits & Daily Protocols',
    subtitle: 'Morning Sunlight, Evening Wind-Down & Key Non-Negotiables',
    description:
      'Check off your daily baseline habits (+15 XP each) and initiate your 1-tap Morning Sunlight or Evening Wind-Down protocols (+15 XP) to calibrate your circadian rhythm.',
    icon: CheckCircle2,
    accentColor: '#10B981',
    bgTint: '#ECFDF5',
    preferredPlacement: 'top',
  },
  {
    id: 'quick-fuel',
    targetId: 'tour-fuel-anchor',
    stepNumber: 3,
    totalSteps: 6,
    badge: 'Step 3 of 6 · Fuel Telemetry',
    title: 'Daily Fuel Anchor & Protein Floor',
    subtitle: '1-tap amino calibration & recipe meal ledger',
    description:
      'Hit your daily protein floor with 1-tap quick logging (+25g, +40g, +50g) or log custom whole-food meals to maintain sustained cognitive stamina without afternoon dips.',
    icon: UtensilsCrossed,
    accentColor: '#D97706',
    bgTint: '#FEF3C7',
    preferredPlacement: 'top',
  },
  {
    id: 'dossier-review',
    targetId: 'tour-dossier-button',
    stepNumber: 4,
    totalSteps: 6,
    badge: 'Step 4 of 6 · Weekly Dossier',
    title: '7-Day Energy Reclamation Dossier',
    subtitle: 'Quantified focus hours & slump reduction debrief',
    description:
      'Inspect your weekly focus hours, circadian alignment score, and habit consistency breakdown. Seal your weekly audit to collect bonus XP.',
    icon: FileText,
    accentColor: '#8B5CF6',
    bgTint: '#F5F3FF',
    preferredPlacement: 'bottom',
  },
  {
    id: 'ai-coach',
    targetId: 'tour-ai-coach',
    stepNumber: 5,
    totalSteps: 6,
    badge: 'Step 5 of 6 · AI Companion',
    title: 'StoveSage AI Coach & Chef',
    subtitle: 'Instant meal formulation & biological coaching',
    description:
      'Tap your AI Coach (or press ⌘J / Ctrl+J) to formulate recipes tailored to your remaining macros, troubleshoot energy dips, or calibrate your daily protocols.',
    icon: Bot,
    accentColor: '#10B981',
    bgTint: '#ECFDF5',
    preferredPlacement: 'top',
  },
  {
    id: 'app-navigation',
    targetId: 'tour-navigation',
    stepNumber: 6,
    totalSteps: 6,
    badge: 'Step 6 of 6 · Navigation Hub',
    title: 'Fuel Recipes, Playbook & History',
    subtitle: 'Explore recipes, reference science guides & track progress',
    description:
      'Navigate between your Daily Cockpit, the Fuel & Recipes meal ledger, the clinical Playbook guide, and your Dossier history.',
    icon: Compass,
    accentColor: '#10B981',
    bgTint: '#ECFDF5',
    preferredPlacement: 'bottom',
  },
];

export function PioneerWalkthrough() {
  const router = useRouter();
  const pathname = usePathname();
  const { userSession, userProfile, completeWalkthrough } = useHabitStore();

  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [popoverPos, setPopoverPos] = useState<{
    top: number;
    left: number;
    placement: 'top' | 'bottom';
    arrowLeft: number;
  } | null>(null);

  const userId = userSession?.id || 'guest';
  const storageKey = `cyath_walkthrough_completed_${userId}`;

  // Initial auto-launch trigger when new user lands on dashboard
  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;

    const localCompleted = localStorage.getItem(storageKey) === 'true';
    const storeCompleted = userProfile?.walkthroughCompleted === true;

    if (!localCompleted && !storeCompleted && pathname === '/dashboard') {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setCurrentStepIndex(0);
        retroAudio.playInspectConfirm();
        window.dispatchEvent(new CustomEvent('stovesage-walkthrough-start'));
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [storageKey, pathname, userProfile]);

  // Listen for manual replay requests
  useEffect(() => {
    const handleOpen = () => {
      retroAudio.playInspectConfirm();
      if (pathname !== '/dashboard') {
        router.push('/dashboard');
        setTimeout(() => {
          setIsOpen(true);
          setCurrentStepIndex(0);
          window.dispatchEvent(new CustomEvent('stovesage-walkthrough-start'));
        }, 300);
      } else {
        setIsOpen(true);
        setCurrentStepIndex(0);
        window.dispatchEvent(new CustomEvent('stovesage-walkthrough-start'));
      }
    };

    window.addEventListener('open-cyath-walkthrough', handleOpen);
    return () => window.removeEventListener('open-cyath-walkthrough', handleOpen);
  }, [pathname, router]);

  // Update target rect and popover positioning
  const updatePositions = useCallback(() => {
    const step = SPOTLIGHT_STEPS[currentStepIndex];
    if (!step) return;

    const el = document.getElementById(step.targetId);
    if (!el) {
      setTargetRect(null);
      setPopoverPos(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    setTargetRect(rect);

    const padding = 10;
    const cardWidth = Math.min(420, window.innerWidth - 32);
    const cardHeight = 260;

    let placement: 'top' | 'bottom' = step.preferredPlacement || 'bottom';
    const spaceBelow = window.innerHeight - (rect.bottom + padding);
    const spaceAbove = rect.top - padding;

    if (placement === 'bottom' && spaceBelow < cardHeight + 20 && spaceAbove > spaceBelow) {
      placement = 'top';
    } else if (placement === 'top' && spaceAbove < cardHeight + 20 && spaceBelow > spaceAbove) {
      placement = 'bottom';
    }

    let top = 0;
    if (placement === 'bottom') {
      top = Math.min(window.innerHeight - cardHeight - 16, Math.max(16, rect.bottom + padding + 16));
    } else {
      top = Math.max(16, Math.min(window.innerHeight - cardHeight - 16, rect.top - padding - cardHeight - 16));
    }

    const elementCenter = rect.left + rect.width / 2;
    let left = elementCenter - cardWidth / 2;
    left = Math.max(16, Math.min(window.innerWidth - cardWidth - 16, left));

    const arrowLeft = Math.max(24, Math.min(cardWidth - 24, elementCenter - left));

    setPopoverPos({ top, left, placement, arrowLeft });
  }, [currentStepIndex]);

  // Scroll target element into view on step change
  useEffect(() => {
    if (!isOpen) return;

    const step = SPOTLIGHT_STEPS[currentStepIndex];
    if (!step) return;

    let retries = 0;
    const tryScrollAndLocate = () => {
      const el = document.getElementById(step.targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => updatePositions(), 300);
      } else if (retries < 6) {
        retries++;
        setTimeout(tryScrollAndLocate, 100);
      }
    };

    tryScrollAndLocate();
  }, [isOpen, currentStepIndex, updatePositions]);

  // Track window scroll and resize to keep spotlight locked to target
  useEffect(() => {
    if (!isOpen) return;

    const handleUpdate = () => {
      requestAnimationFrame(updatePositions);
    };

    window.addEventListener('scroll', handleUpdate, { passive: true });
    window.addEventListener('resize', handleUpdate, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [isOpen, updatePositions]);

  const currentStep = SPOTLIGHT_STEPS[currentStepIndex];

  const handleNext = useCallback(() => {
    retroAudio.playInspectConfirm();
    if (currentStepIndex < SPOTLIGHT_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      completeWalkthrough();
      localStorage.setItem(storageKey, 'true');
      retroAudio.playTierUpgrade();

      const badgeTarget = document.getElementById('xp-hud-badge-target') || document.getElementById('tour-ai-coach');
      if (badgeTarget) {
        const rect = badgeTarget.getBoundingClientRect();
        xpParticleEmitter.emit(rect.left + rect.width / 2, rect.top + rect.height / 2, 24);
      } else {
        xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 24);
      }

      setIsOpen(false);
      window.dispatchEvent(new CustomEvent('stovesage-walkthrough-end'));
    }
  }, [currentStepIndex, completeWalkthrough, storageKey]);

  const handlePrev = useCallback(() => {
    retroAudio.playBlip();
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const handleSkip = useCallback(() => {
    retroAudio.playBlip();
    localStorage.setItem(storageKey, 'true');
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('stovesage-walkthrough-end'));
  }, [storageKey]);

  // Keyboard controls
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, handleSkip]);

  if (!mounted || !isOpen) return null;

  const IconComponent = currentStep.icon;
  const isFinalStep = currentStepIndex === SPOTLIGHT_STEPS.length - 1;
  const padding = 10;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="walkthrough-step-title"
      className="fixed inset-0 z-[9990] select-none"
    >
      {/* SVG Spotlight Mask Cutout Overlay */}
      <svg className="fixed inset-0 w-full h-full pointer-events-auto z-[9990]">
        <defs>
          <mask id="cyath-spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={Math.max(0, targetRect.left - padding)}
                y={Math.max(0, targetRect.top - padding)}
                width={targetRect.width + padding * 2}
                height={targetRect.height + padding * 2}
                rx={18}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(10, 26, 19, 0.72)"
          mask="url(#cyath-spotlight-mask)"
          onClick={handleNext}
          className="cursor-pointer"
        />
      </svg>

      {/* Target Element Focus Halo Border */}
      {targetRect && (
        <div
          className="fixed pointer-events-none z-[9992] rounded-2xl border-2 border-[#C9A84C] shadow-[0_0_24px_rgba(201,168,76,0.45)] transition-all duration-300 ease-out"
          style={{
            top: Math.max(0, targetRect.top - padding),
            left: Math.max(0, targetRect.left - padding),
            width: targetRect.width + padding * 2,
            height: targetRect.height + padding * 2,
          }}
        />
      )}

      {/* Anchored Neo-Brutalist Guided Popover Card */}
      {popoverPos && (
        <div
          className="fixed z-[9995] w-[420px] max-w-[calc(100vw-32px)] bg-[#FFFDF9] border border-[#1A3629]/15 rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(26,54,41,0.18)] flex flex-col gap-4 transition-all duration-200 ease-out animate-in zoom-in-95"
          style={{
            top: popoverPos.top,
            left: popoverPos.left,
          }}
        >
          {/* Directional Arrow Pointer */}
          <div
            className={`w-3.5 h-3.5 bg-[#FFFDF9] border-[#1A3629]/20 rotate-45 absolute pointer-events-none ${
              popoverPos.placement === 'bottom'
                ? '-top-2 border-t border-l'
                : '-bottom-2 border-b border-r'
            }`}
            style={{
              left: popoverPos.arrowLeft - 7,
            }}
          />

          {/* Top Header Row: Step Badge + Dot Indicators + Exit Button */}
          <div className="flex items-center justify-between gap-3 border-b border-[#1A3629]/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#4A5D4E]">
                {currentStep.badge}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Step indicator dots */}
              <div className="flex items-center gap-1" aria-hidden="true">
                {SPOTLIGHT_STEPS.map((s, idx) => (
                  <div
                    key={s.id}
                    className={`h-1.5 rounded-full transition-all duration-200 ${
                      idx === currentStepIndex
                        ? 'w-5 bg-[#10B981]'
                        : idx < currentStepIndex
                        ? 'w-1.5 bg-[#1A3629]'
                        : 'w-1.5 bg-[#EAE3D2]'
                    }`}
                  />
                ))}
              </div>

              {/* Close / Skip button */}
              <button
                type="button"
                onClick={handleSkip}
                className="p-1 rounded-lg border border-[#1A3629]/15 hover:bg-[#FAF6EE] text-[#1A3629] cursor-pointer transition-colors"
                title="Skip Walkthrough (Esc)"
                aria-label="Skip Walkthrough"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Step Hero & Description */}
          <div className="flex items-start gap-3.5">
            <div
              className="w-10 h-10 rounded-2xl border border-[#1A3629]/15 flex items-center justify-center shrink-0"
              style={{ backgroundColor: currentStep.bgTint }}
            >
              <IconComponent className="w-5 h-5 text-[#1A3629]" />
            </div>

            <div className="flex flex-col min-w-0">
              <h3
                id="walkthrough-step-title"
                className="font-cabinet font-bold text-base sm:text-lg text-[#1A3629] leading-tight"
              >
                {currentStep.title}
              </h3>
              <span className="font-cabinet font-semibold text-xs text-[#1A3629]/80 mt-0.5">
                {currentStep.subtitle}
              </span>
              <p className="font-cabinet text-xs sm:text-sm text-[#2C4A3B] leading-relaxed mt-2">
                {currentStep.description}
              </p>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-[#1A3629]/10">
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-mono font-medium text-[#4A5D4E] hover:text-[#1A3629] cursor-pointer px-1 py-1"
            >
              Skip Tour
            </button>

            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-3.5 py-1.5 rounded-xl border border-[#1A3629]/20 bg-[#FFFDF9] hover:bg-[#FAF8F5] text-[#1A3629] font-mono text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 rounded-xl border border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] font-mono text-xs font-semibold hover:bg-[#234535] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isFinalStep ? (
                  <>
                    <Award className="w-4 h-4 text-[#C9A84C]" />
                    <span>Complete Tour (+50 XP)</span>
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
