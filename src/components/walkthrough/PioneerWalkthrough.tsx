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
      description: 'Quickly switch between your Cockpit, Food Log, Playbook, and 7-Day Dossier.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#tour-living-sky',
    popover: {
      title: 'Living Sanctuary',
      description: 'Your floating island grows and evolves as you stay consistent. Tap to view past biomes or share your sanctuary.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#tour-core-habits',
    popover: {
      title: 'Focus Habits',
      description: 'Check off your 3 daily habits in seconds, plus quick morning and evening check-ins.',
      side: 'top',
      align: 'start',
    },
  },
  {
    element: '#tour-fuel-anchor',
    popover: {
      title: 'Daily Fuel Targets',
      description: 'Tap quick presets or enter grams to ensure you hit your daily protein and water goals.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '#cockpit-log-button',
    popover: {
      title: 'Daily Nutrition Log',
      description: 'Log whole-food dishes with natural text or camera photo scans with instant macro breakdowns.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#tour-dossier-button',
    popover: {
      title: 'Weekly Dossier',
      description: 'Track 7-day focus trends, afternoon slump reduction, and overall recovery scores.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '#tour-nav-playbook',
    popover: {
      title: 'Science Playbook',
      description: 'Explore whole-food recipes, interactive portion scalers, and proven daily energy protocols.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#tour-ai-coach',
    popover: {
      title: 'StoveSage AI Coach',
      description: 'Ask for personalized whole-food recipes, portion advice, or energy tips anytime.',
      side: 'top',
      align: 'end',
    },
  },
  {
    element: '#tour-nav-profile',
    popover: {
      title: 'Sanctuary & Shields',
      description: 'Check your streak freeze shields, invite friends to earn bonuses, and adjust account settings.',
      side: 'bottom',
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
      doneBtnText: 'Complete (+25 XP)',
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
          try {
            const uId = userSession?.id || 'guest';
            localStorage.setItem(`cyath_walkthrough_completed_${uId}`, 'true');
            localStorage.setItem('cyath_walkthrough_global_completed', 'true');
            localStorage.setItem('cyath_walkthrough_completed', 'true');
            xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 28);
          } catch {}
        }
      },
    });

    driverInstanceRef.current = driverObj;
    driverObj.drive();
  }, [completeWalkthrough, userSession]);

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
    const localDone = typeof window !== 'undefined' && (
      localStorage.getItem(localKey) === 'true' ||
      localStorage.getItem('cyath_walkthrough_global_completed') === 'true' ||
      localStorage.getItem('cyath_walkthrough_completed') === 'true'
    );

    if (isMember && hasFinishedProfile && !hasFinishedTour && !localDone) {
      const timer = setTimeout(() => {
        startTour();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [pathname, userSession, userProfile, startTour]);

  return null;
}
