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
    element: '#tour-sanctuary-stage',
    popover: {
      title: 'Your Living Sanctuary',
      description:
        'This floating island is your biological anchor. As you log habits, maintain circadian sleep cadence, and fuel with whole foods, your sanctuary evolves across 10 handcrafted pixel-art biome tiers. You can also switch between The Pillow Fighter, The Whey Station, and Ctrl+Alt+Defeat suites in your Profile.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#btn-seal-today',
    popover: {
      title: 'The Daily Seal Ceremony',
      description:
        'Every evening, tap "Seal Today" to open your Turn-by-Turn Debrief drawer. Log morning sunlight, sleep, and meals with our built-in <em>"Not sure how much protein your meal had?"</em> natural AI estimator. Earn graduated XP tailored to biological efficacy and mint your daily wax seal.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '#btn-view-ledger',
    popover: {
      title: 'Archival Corkboard Ledger',
      description:
        'Tap "View Ledger" to slide out your archival corkboard. Review past days pinned with golden wax seals, inspect historical biometrics, or export 16-bit thermal receipt cards as shareable PNGs.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '#specimen-reliquary',
    popover: {
      title: 'Subterranean Specimen Reliquary',
      description:
        'Scroll down to explore your subterranean trophy vault. Unlock handcrafted pixel relics and chalices for streak milestones, circadian sleep perfection, and nutritional mastery.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '#tour-ai-coach',
    popover: {
      title: 'StoveSage AI Coach & Scanner',
      description:
        'Need whole-food recipe inspiration, metabolic protein rebalancing, or instant photo meal analysis? Open StoveSage (Cmd+J) to consult your evidence-based circadian nutrition coach.',
      side: 'top',
      align: 'end',
    },
  },
  {
    element: '#tour-navigation',
    popover: {
      title: 'Navigation Hub & Fuel Engine',
      description:
        'Navigate between the Fuel Log with 1-tap meal target logging, the Habit & Circadian Playbook for peer-reviewed protocols, the Correlation Dossier, and your Profile.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    popover: {
      title: 'Command Palette: Fast Keyboard Logging',
      description:
        'Press <strong>Cmd+K</strong> (or <strong>Ctrl+K</strong>) anytime to launch the Command Palette. Type instant shorthand like <code>p35 w0.5 s8</code> to log 35g protein, 0.5L water, and 8 hours sleep in under 2 seconds without touching the mouse.',
      align: 'center',
    },
  },
  {
    popover: {
      title: 'Install Cyath as a Native App',
      description:
        '<strong>iOS (Safari):</strong> Tap Share then <em>Add to Home Screen</em>.<br><br><strong>Android (Chrome):</strong> Tap Menu ⋮ then <em>Add to Home Screen</em>.<br><br>Enjoy fullscreen real estate, zero browser chrome, and instant offline-ready access.',
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
    // Dynamically resolve element selectors and filter to visible elements in the DOM
    const validSteps = WALKTHROUGH_STEPS.map((step) => {
      if (typeof step.element === 'string') {
        let targetSelector = step.element;
        if (targetSelector === '#tour-sanctuary-stage' && !document.querySelector(targetSelector)) {
          if (document.querySelector('#tour-sanctuary-island')) {
            targetSelector = '#tour-sanctuary-island';
          }
        }
        if (targetSelector === '#btn-view-ledger' && !document.querySelector(targetSelector)) {
          if (document.querySelector('#tour-ledger-toggle')) {
            targetSelector = '#tour-ledger-toggle';
          }
        }
        const el = document.querySelector(targetSelector);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return null;
        return { ...step, element: targetSelector };
      }
      return step;
    }).filter(Boolean) as DriveStep[];

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
            xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 28);
          } catch {}
        }
      },
    });

    driverInstanceRef.current = driverObj;
    driverObj.drive();
  }, [completeWalkthrough, userSession]);

  const isSanctuaryRoute = pathname === '/dashboard' || pathname === '/';

  const handleLaunchRequest = useCallback(() => {
    if (!isSanctuaryRoute) {
      try {
        sessionStorage.setItem('pending_cyath_walkthrough', 'true');
      } catch {}
      router.push('/dashboard');
    } else {
      startTour();
    }
  }, [isSanctuaryRoute, router, startTour]);

  // Check for pending cross-page launch once on sanctuary / dashboard
  useEffect(() => {
    if (!isSanctuaryRoute) return;
    try {
      if (sessionStorage.getItem('pending_cyath_walkthrough') === 'true') {
        sessionStorage.removeItem('pending_cyath_walkthrough');
        const timer = setTimeout(() => {
          startTour();
        }, 600);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, [isSanctuaryRoute, startTour]);

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

  // Auto-launch for new members landing on sanctuary for the very first time
  useEffect(() => {
    if (!isSanctuaryRoute) return;

    const hasFinishedProfile = !!userProfile?.onboardingCompleted;
    const hasFinishedTour = !!userProfile?.walkthroughCompleted;

    const userId = userSession?.id || 'guest';
    const localKey = `cyath_walkthrough_completed_${userId}`;
    const localDone = typeof window !== 'undefined' && localStorage.getItem(localKey) === 'true';

    if (hasFinishedProfile && !hasFinishedTour && !localDone) {
      const timer = setTimeout(() => {
        startTour();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isSanctuaryRoute, userSession, userProfile, startTour]);

  return null;
}
