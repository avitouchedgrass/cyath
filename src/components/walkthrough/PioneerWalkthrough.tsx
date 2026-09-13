'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { xpParticleEmitter } from '@/lib/particleEmitter';

const WALKTHROUGH_STEPS: DriveStep[] = [
  {
    element: '#tour-navigation',
    popover: {
      title: 'Navigation Hub',
      description: 'Switch between your Cockpit, daily food ledger, science Playbook, and Dossier.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#tour-living-sky',
    popover: {
      title: 'Living Sanctuary',
      description: 'Watch your floating island evolve and level up as you complete daily routines.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#tour-core-habits',
    popover: {
      title: 'Daily Routines',
      description: 'Check off focus habits in seconds to earn XP towards island tier upgrades.',
      side: 'top',
      align: 'start',
    },
  },
  {
    element: '#tour-fuel-anchor',
    popover: {
      title: 'Protein & Fuel',
      description: 'Tap quick presets or enter grams to hit your daily whole-food protein floor.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '#cockpit-log-button',
    popover: {
      title: 'Meal Logging',
      description: 'Log any meal with AI or pick science-calibrated dishes from the recipe catalog.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#tour-dossier-button',
    popover: {
      title: 'Weekly Dossier',
      description: 'Review 7-day focus hours, recovery markers, and slump reduction patterns.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '#tour-ai-coach',
    popover: {
      title: 'StoveSage AI Coach',
      description: 'Get tailored recipe ideas, macro calibrations, and energy troubleshooting anytime.',
      side: 'top',
      align: 'end',
    },
  },
];

export function PioneerWalkthrough() {
  const router = useRouter();
  const pathname = usePathname();
  const { userSession, userProfile, completeWalkthrough } = useHabitStore();

  const driverInstanceRef = useRef<ReturnType<typeof driver> | null>(null);

  const startTour = useCallback(() => {
    // Filter steps to visible elements currently rendered in the DOM
    const validSteps = WALKTHROUGH_STEPS.filter((step) => {
      if (typeof step.element === 'string') {
        const el = document.querySelector(step.element);
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }
      return true;
    });

    if (validSteps.length === 0) return;

    retroAudio.playBlip();

    const driverObj = driver({
      showProgress: true,
      animate: true,
      overlayColor: 'rgba(26, 54, 41, 0.72)',
      popoverClass: 'cyath-driver-popover',
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Complete (+50 XP)',
      progressText: '{{current}} of {{total}}',
      steps: validSteps,
      onHighlightStarted: () => {
        retroAudio.playBlip();
      },
      onDestroyed: () => {
        // Grant XP and trigger celebratory particles
        completeWalkthrough();
        retroAudio.playInspectConfirm();
        if (typeof window !== 'undefined') {
          xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 28);
        }
      },
    });

    driverInstanceRef.current = driverObj;
    driverObj.drive();
  }, [completeWalkthrough]);

  const handleLaunchRequest = useCallback(() => {
    if (pathname !== '/dashboard') {
      try {
        sessionStorage.setItem('pending_cyath_walkthrough', 'true');
      } catch {}
      router.push('/dashboard?tab=today');
    } else {
      startTour();
    }
  }, [pathname, router, startTour]);

  // Check for pending cross-page launch once on dashboard
  useEffect(() => {
    if (pathname !== '/dashboard') return;
    try {
      if (sessionStorage.getItem('pending_cyath_walkthrough') === 'true') {
        sessionStorage.removeItem('pending_cyath_walkthrough');
        const timer = setTimeout(() => {
          startTour();
        }, 350);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, [pathname, startTour]);

  // Listen for launch events dispatched from Profile page or Command Palette
  useEffect(() => {
    const onOpenWalkthrough = () => {
      handleLaunchRequest();
    };

    window.addEventListener('open-cyath-walkthrough', onOpenWalkthrough);
    window.addEventListener('cyath_start_walkthrough', onOpenWalkthrough);

    return () => {
      window.removeEventListener('open-cyath-walkthrough', onOpenWalkthrough);
      window.removeEventListener('cyath_start_walkthrough', onOpenWalkthrough);
      if (driverInstanceRef.current) {
        driverInstanceRef.current.destroy();
      }
    };
  }, [handleLaunchRequest]);

  // Auto-launch for new members landing on the cockpit for the very first time
  useEffect(() => {
    if (pathname !== '/dashboard') return;

    const isMember = !!userSession && !userSession.id.startsWith('guest_');
    const hasFinishedProfile = !!userProfile?.onboardingCompleted;
    const hasFinishedTour = !!userProfile?.walkthroughCompleted;

    const userId = userSession?.id || 'guest';
    const localKey = `cyath_walkthrough_completed_${userId}`;
    const localDone = typeof window !== 'undefined' && localStorage.getItem(localKey) === 'true';

    if (isMember && hasFinishedProfile && !hasFinishedTour && !localDone) {
      const timer = setTimeout(() => {
        startTour();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [pathname, userSession, userProfile, startTour]);

  return null;
}
