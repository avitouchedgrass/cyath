import { calculateCircadianStatus } from '@/lib/engines/circadianEngine';

export interface CircadianNotificationSchedule {
  caffeineCutoffWarningScheduled: boolean;
  digitalSunsetScheduled: boolean;
  nextCaffeineCutoffWarningTime?: string;
  nextDigitalSunsetTime?: string;
}

const NOTIFICATION_STORAGE_KEY = 'cyath_circadian_notifications_opt_in';

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export function getNotificationOptIn(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(NOTIFICATION_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setNotificationOptIn(optIn: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, optIn ? 'true' : 'false');
  } catch {}
}

export async function requestNotificationAccess(): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  try {
    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    setNotificationOptIn(granted);
    if (granted) {
      registerCircadianServiceWorker();
    }
    return granted;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return false;
  }
}

export async function registerCircadianServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/circadian-sw.js');
    return reg;
  } catch (err) {
    console.warn('ServiceWorker registration error:', err);
    return null;
  }
}

export function dispatchLocalNotification(title: string, options?: NotificationOptions): boolean {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, {
          icon: '/assets/brand/cyath-icon.png',
          badge: '/assets/brand/cyath-icon.png',
          ...options,
        });
      });
      return true;
    } else {
      new Notification(title, {
        icon: '/assets/brand/cyath-icon.png',
        ...options,
      });
      return true;
    }
  } catch (err) {
    console.warn('Notification dispatch failed:', err);
    return false;
  }
}

export function scheduleCircadianNotifications(options?: {
  wakeTimeStr?: string;
  bedtimeTargetStr?: string;
}): CircadianNotificationSchedule {
  if (!isNotificationSupported() || Notification.permission !== 'granted' || !getNotificationOptIn()) {
    return {
      caffeineCutoffWarningScheduled: false,
      digitalSunsetScheduled: false,
    };
  }

  const status = calculateCircadianStatus({
    wakeTimeStr: options?.wakeTimeStr,
    bedtimeTargetStr: options?.bedtimeTargetStr,
  });

  const msUntilCutoff = status.milestones.msUntilCaffeineCutoff;
  // T-30m Caffeine Cutoff Warning: 30 minutes before cutoff (1800000 ms)
  const msUntilCutoffWarning = msUntilCutoff - 30 * 60 * 1000;

  if (msUntilCutoffWarning > 0 && msUntilCutoffWarning < 12 * 3600 * 1000) {
    if (typeof window !== 'undefined') {
      const existingTimer = (window as any).__cyathCaffeineCutoffTimer;
      if (existingTimer) clearTimeout(existingTimer);
      (window as any).__cyathCaffeineCutoffTimer = setTimeout(() => {
        dispatchLocalNotification('Circadian Alert: Caffeine Cutoff in 30m', {
          body: `Approaching your biological cutoff at ${status.milestones.caffeineHardCutoff.cutoff}. Switch to water to preserve deep restorative sleep.`,
          tag: 'cyath-caffeine-cutoff-warning',
        });
      }, msUntilCutoffWarning);
    }
  }

  // Digital Sunset Reminder: 120 minutes prior to target bedtime
  const msUntilSunset = status.milestones.msUntilDigitalSunset;
  if (msUntilSunset > 0 && msUntilSunset < 16 * 3600 * 1000) {
    if (typeof window !== 'undefined') {
      const existingTimer = (window as any).__cyathDigitalSunsetTimer;
      if (existingTimer) clearTimeout(existingTimer);
      (window as any).__cyathDigitalSunsetTimer = setTimeout(() => {
        dispatchLocalNotification('Circadian Alert: Digital Sunset Active', {
          body: `2 hours until target bedtime (${status.milestones.bedtimeTargetStr}). Dim overhead lights and disconnect screens for melatonin release.`,
          tag: 'cyath-digital-sunset-reminder',
        });
      }, msUntilSunset);
    }
  }

  return {
    caffeineCutoffWarningScheduled: msUntilCutoffWarning > 0,
    digitalSunsetScheduled: msUntilSunset > 0,
    nextCaffeineCutoffWarningTime: status.milestones.caffeineHardCutoff.cutoff,
    nextDigitalSunsetTime: status.milestones.digitalSunsetWindow.start,
  };
}

export function sendTestCircadianNotification(): boolean {
  return dispatchLocalNotification('Cyath Circadian Dispatcher Active', {
    body: 'Tactical notification engine verified. You will receive dynamic alerts 30m before caffeine cutoff and at digital sunset.',
    tag: 'cyath-test-dispatch',
  });
}
