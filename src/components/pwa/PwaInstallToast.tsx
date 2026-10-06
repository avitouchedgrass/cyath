'use client';

import React, { useState, useEffect } from 'react';
import { PixelSparkles, PixelX, PixelCheck } from '@/components/common/PixelIcons';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PwaInstallToastProps {
  forceShow?: boolean;
  onDismiss?: () => void;
}

export function PwaInstallToast({ forceShow = false, onDismiss }: PwaInstallToastProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone display mode
    if (typeof window === 'undefined') return;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true;

    if (isStandalone) {
      setInstalled(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Capture install prompt on Chromium/Desktop
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    const handleAppInstalled = () => {
      setInstalled(true);
      setIsVisible(false);
      localStorage.setItem('cyath_pwa_dismissed', 'true');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || installed) return;

    const isDismissed = localStorage.getItem('cyath_pwa_dismissed') === 'true';
    if (forceShow && !isDismissed) {
      setIsVisible(true);
      retroAudio.playPaperRustle();
    }
  }, [forceShow, installed]);

  if (!isVisible || installed) return null;

  const handleDismiss = () => {
    haptics.tap();
    setIsVisible(false);
    localStorage.setItem('cyath_pwa_dismissed', 'true');
    if (onDismiss) onDismiss();
  };

  const handleInstallClick = async () => {
    retroAudio.playInspectConfirm();
    haptics.tap();

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalled(true);
        setIsVisible(false);
        localStorage.setItem('cyath_pwa_dismissed', 'true');
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide((prev) => !prev);
    } else {
      // Browser fallback (e.g. Firefox or desktop Safari)
      setShowIosGuide((prev) => !prev);
    }
  };

  return (
    <div
      role="alert"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md bg-[#FFFDF9] border-2 border-[#1A3629] p-4 rounded-2xl shadow-[4px_6px_24px_rgba(26,54,41,0.22)] animate-in fade-in slide-in-from-bottom-4 duration-300 flex flex-col gap-2.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#1A3629] text-[#FFFDF9] flex items-center justify-center shrink-0">
            <PixelSparkles size={14} color="#FFFDF9" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-cabinet font-extrabold text-xs text-[#1A3629] leading-tight">
              Add Cyath to Home Screen
            </span>
            <span className="font-mono text-[10px] text-[#4A5D4E]">
              1-tap logging · No App Store download required
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="text-[#4A5D4E] hover:text-[#1A3629] p-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer shrink-0"
          aria-label="Dismiss install prompt"
        >
          <PixelX size={13} color="currentColor" />
        </button>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={handleInstallClick}
          className="flex-1 py-2 px-3 rounded-xl bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs hover:bg-[#2C4A3B] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#2C5E43]"
        >
          <PixelCheck size={12} color="#FFFDF9" />
          <span>{isIos ? (showIosGuide ? 'Hide Instructions' : 'How to Add (+)') : 'Add to Home Screen'}</span>
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="py-2 px-3 rounded-xl border border-[#1A3629]/20 text-[#1A3629] font-cabinet font-semibold text-xs hover:bg-[#FAF8F5] transition-colors cursor-pointer"
        >
          Later
        </button>
      </div>

      {showIosGuide && (
        <div className="mt-1 p-2.5 bg-[#FAF8F5] rounded-xl border border-[#1A3629]/15 font-mono text-[11px] text-[#1A3629] flex flex-col gap-1 text-left">
          <div className="font-bold text-[#1A3629]">Install in Safari:</div>
          <div>1. Tap the <strong>Share</strong> button <span className="text-base leading-none">⎋</span> at bottom of screen.</div>
          <div>2. Scroll down &amp; tap <strong>Add to Home Screen</strong> <span className="font-bold">(+)</span>.</div>
        </div>
      )}
    </div>
  );
}
