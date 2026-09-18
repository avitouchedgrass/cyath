'use client';

/**
 * Lightweight Web Vibration API wrapper for tactile feedback on mobile devices.
 * Gracefully degrades to no-op on desktop or unsupported browsers.
 */
class HapticsEngine {
  private isSupported: boolean;

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator;
  }

  /**
   * Crisp 12ms mechanical click snap (habit toggle, button click)
   */
  public tap(): void {
    if (!this.isSupported) return;
    try {
      navigator.vibrate(12);
    } catch {
      // Ignore security/permission blocks
    }
  }

  /**
   * Positive completion double-pulse [15ms, 35ms pause, 20ms]
   */
  public success(): void {
    if (!this.isSupported) return;
    try {
      navigator.vibrate([15, 35, 20]);
    } catch {}
  }

  /**
   * Heavy vault seal / achievement fanfare [30ms, 40ms pause, 45ms]
   */
  public heavy(): void {
    if (!this.isSupported) return;
    try {
      navigator.vibrate([30, 40, 45]);
    } catch {}
  }
}

export const haptics = new HapticsEngine();
