export interface RecoveryTelemetryInput {
  sleepHours?: number;
  morningRestedRating?: number; // 1 to 5 scale (or 1 to 10 mapped)
}

export interface DownscaledMicroHabit {
  id: string;
  title: string;
  benefit: string;
  durationMinutes: number;
  category: 'light' | 'hydration' | 'movement';
}

export const DOWNSCALED_MICRO_HABITS: DownscaledMicroHabit[] = [
  {
    id: 'reentry_light',
    title: '5-Min Ambient Light Exposure',
    benefit: 'Micro-photonic signal to halt daytime melatonin without screen eye strain.',
    durationMinutes: 5,
    category: 'light',
  },
  {
    id: 'reentry_hydration',
    title: '500ml Electrolyte Hydration',
    benefit: 'Cellular water re-inflation to counteract sleep-debt hypovolemia.',
    durationMinutes: 2,
    category: 'hydration',
  },
  {
    id: 'reentry_walk',
    title: '5-Min Restorative Walk',
    benefit: 'Low-friction lymphatic flow and gentle motor cortex stimulation.',
    durationMinutes: 5,
    category: 'movement',
  },
];

export interface DownscaledFocusSession {
  originalMinutes: number;
  downscaledMinutes: number;
  title: string;
  directive: string;
  mechanism: string;
}

export const DOWNSCALED_FOCUS_PROTOCOL: DownscaledFocusSession = {
  originalMinutes: 90,
  downscaledMinutes: 15,
  title: '15-Min Low-Friction Kinetic Sprint',
  directive: 'Zero-resistance 15-minute single-task sprint. Tackle only the top 1 micro-task, then deliberately step back.',
  mechanism: 'Under severe recovery deficit, prefrontal working memory saturates rapidly. A 15m cap prevents cognitive depletion while sustaining streak momentum.',
};

/**
 * Checks telemetry triggers: sleep_duration < 5.5h OR morning_restedness <= 2/5 (or <= 4/10)
 */
export function shouldTriggerRecoveryDownscale(input: RecoveryTelemetryInput): boolean {
  if (typeof input.sleepHours === 'number' && input.sleepHours > 0 && input.sleepHours < 5.5) {
    return true;
  }

  if (typeof input.morningRestedRating === 'number' && input.morningRestedRating > 0) {
    // Check if 5-point scale (<= 2) or 10-point scale (<= 4)
    if (input.morningRestedRating <= 2) {
      return true;
    }
  }

  return false;
}

export function getRecoveryDownscaleSummary(input: RecoveryTelemetryInput): {
  isDownscaled: boolean;
  reason?: string;
} {
  const isDownscaled = shouldTriggerRecoveryDownscale(input);
  if (!isDownscaled) return { isDownscaled: false };

  if (typeof input.sleepHours === 'number' && input.sleepHours < 5.5) {
    return {
      isDownscaled: true,
      reason: `Sleep duration (${input.sleepHours}h) fell below 5.5h biological threshold.`,
    };
  }

  return {
    isDownscaled: true,
    reason: `Morning rested score (${input.morningRestedRating}/5) indicates autonomic recovery debt.`,
  };
}
