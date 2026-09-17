import { describe, it, expect } from 'vitest';
import {
  shouldTriggerRecoveryDownscale,
  getRecoveryDownscaleSummary,
  DOWNSCALED_MICRO_HABITS,
  DOWNSCALED_FOCUS_PROTOCOL,
} from '../engines/reentryEngine';

describe('reentryEngine', () => {
  it('triggers downscale when sleep duration is under 5.5 hours', () => {
    expect(shouldTriggerRecoveryDownscale({ sleepHours: 5.4 })).toBe(true);
    expect(shouldTriggerRecoveryDownscale({ sleepHours: 4.0 })).toBe(true);
    expect(shouldTriggerRecoveryDownscale({ sleepHours: 5.5 })).toBe(false);
    expect(shouldTriggerRecoveryDownscale({ sleepHours: 7.5 })).toBe(false);
  });

  it('triggers downscale when morning restedness is <= 2 on a 5-point scale', () => {
    expect(shouldTriggerRecoveryDownscale({ morningRestedRating: 2 })).toBe(true);
    expect(shouldTriggerRecoveryDownscale({ morningRestedRating: 1 })).toBe(true);
    expect(shouldTriggerRecoveryDownscale({ morningRestedRating: 3 })).toBe(false);
    expect(shouldTriggerRecoveryDownscale({ morningRestedRating: 4 })).toBe(false);
  });

  it('provides exact biological explanation in summary', () => {
    const summarySleep = getRecoveryDownscaleSummary({ sleepHours: 4.8 });
    expect(summarySleep.isDownscaled).toBe(true);
    expect(summarySleep.reason).toContain('Sleep duration (4.8h)');

    const summaryRested = getRecoveryDownscaleSummary({ morningRestedRating: 2 });
    expect(summaryRested.isDownscaled).toBe(true);
    expect(summaryRested.reason).toContain('autonomic recovery debt');
  });

  it('provides exactly 3 downscaled micro-habits and a 15-min focus sprint', () => {
    expect(DOWNSCALED_MICRO_HABITS.length).toBe(3);
    expect(DOWNSCALED_FOCUS_PROTOCOL.downscaledMinutes).toBe(15);
    expect(DOWNSCALED_FOCUS_PROTOCOL.originalMinutes).toBe(90);
  });
});
