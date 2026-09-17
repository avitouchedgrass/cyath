import { parseLocalDate, getRelativeLocalDate, formatLocalDate } from '@/lib/dateUtils';
import { DailyLogData } from '@/store/useHabitStore';

export interface InactivityCheckResult {
  isInactivityDetected: boolean;
  hoursInactive: number;
  lastActiveDate: string | null;
  reentryPrompt: string;
  recommendedMicroAction: {
    id: string;
    label: string;
    durationMinutes: number;
  };
}

export function evaluateUserActivity(
  logsByDate: Record<string, DailyLogData>,
  currentDateStr: string,
  now: Date = new Date()
): InactivityCheckResult {
  const dates = Object.keys(logsByDate).sort();
  let lastActiveDate: string | null = null;

  for (let i = dates.length - 1; i >= 0; i--) {
    const d = dates[i];
    const log = logsByDate[d];
    if (!log) continue;
    const habitsDone = Object.values(log.habitsCompleted || {}).some(Boolean);
    const hasFuel = (log.totalProteinLogged || 0) > 0 || (log.hydrationLiters || 0) > 0;
    if (habitsDone || hasFuel) {
      lastActiveDate = d;
      break;
    }
  }

  // Calculate elapsed time from lastActiveDate to currentDateStr
  let hoursInactive = 0;
  if (lastActiveDate) {
    const lastActive = parseLocalDate(lastActiveDate);
    const current = parseLocalDate(currentDateStr);
    const diffMs = current.getTime() - lastActive.getTime();
    hoursInactive = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
  } else {
    // If no previous activity, consider newly onboarded
    hoursInactive = 0;
  }

  // Inactivity detected if 24h to 48h+ of zero check-ins
  const isInactivityDetected = hoursInactive >= 24;

  const reentryPrompt =
    'High-friction period detected. Cockpit automatically scaled to a 5-minute restorative baseline to preserve your momentum.';

  return {
    isInactivityDetected,
    hoursInactive,
    lastActiveDate,
    reentryPrompt,
    recommendedMicroAction: {
      id: 'reentry_hydration',
      label: '500ml Electrolyte Hydration',
      durationMinutes: 2,
    },
  };
}
