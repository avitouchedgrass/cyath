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
      description: 'Quickly switch between your Cockpit, Food Log, Playbook, and Profile.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#tour-sanctuary-island',
    popover: {
      title: 'Living Sanctuary',
      description: 'Your floating island grows and evolves as you stay consistent. Watch chimney smoke drift and circadian lighting shift.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#tour-ledger-toggle',
    popover: {
      title: 'Station Switcher',
      description: 'Toggle between your immersive Sanctuary Observatory and the rigorous Habit Ledger.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#tour-circadian-horizon',
    popover: {
      title: 'Circadian Horizon',
      description: 'Real-time solar cadence and twilight progression calibrated to your natural circadian rhythm.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#tour-core-habits',
    popover: {
      title: 'Focus Habits',
      description: 'Check off your daily keystone habits in seconds, plus quick morning and evening check-ins.',
      side: 'top',
      align: 'start',
    },
  },
  {
    element: '#tour-fuel-anchor',
    popover: {
      title: 'Daily Fuel & Photo Scan',
      description: 'Track protein and hydration targets, or tap Photo Scan to deconstruct whole-food meals with AI.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '#tour-specimen-vault',
    popover: {
      title: 'Specimen Reliquary',
      description: 'Inspect uniform pixel chalices, level up 5x Silver and 20x Gold masteries, and share your milestones.',
      side: 'top',
      align: 'center',
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
      title: 'Cyath AI Coach',
      description: 'Ask for personalized whole-food recipes, portion advice, or energy tips anytime.',
      side: 'top',
      align: 'end',
    },
  },
  {
    element: '#tour-nav-profile',
    popover: {
      title: 'Profile & Privacy',
      description: 'Manage streak shields, view privacy and terms, and export your personal health ledger.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    popover: {
      title: 'Install Cyath on Your Home Screen',
      description:
        '<strong>iOS (Safari):</strong> Tap the Share button ↗ at the bottom of your browser, then select <em>Add to Home Screen</em>.<br><br><strong>Android (Chrome):</strong> Tap the three-dot menu ⋮ at the top right, then tap <em>Add to Home Screen</em>.<br><br>You\'ll get the full app experience — no browser chrome, instant launch.',
      align: 'center',
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
