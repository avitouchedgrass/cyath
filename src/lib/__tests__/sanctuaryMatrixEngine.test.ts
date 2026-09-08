import { describe, it, expect } from 'vitest';
import { calculateSanctuaryMatrix, SanctuaryMatrixInput } from '../sanctuaryMatrixEngine';

describe('sanctuaryMatrixEngine', () => {
  it('calculates optimal ecosystem vitality when all biometric targets are dialed', () => {
    const input: SanctuaryMatrixInput = {
      sleepHours: 8.0,
      restedRating: 9,
      totalProteinLogged: 160,
      targetProtein: 150,
      hydrationLiters: 3.0,
      targetHydration: 2.5,
      protocolAccepted: true,
      sunlightDone: true,
      caffeineCutoffRespected: true,
      slumpScore: 2,
    };

    const matrix = calculateSanctuaryMatrix(input);
    expect(matrix.hearth.score).toBeGreaterThanOrEqual(90);
    expect(matrix.hearth.statusColor).toBe('emerald');
    expect(matrix.canopy.score).toBeGreaterThanOrEqual(90);
    expect(matrix.canopy.statusColor).toBe('emerald');
    expect(matrix.atmosphere.score).toBeGreaterThanOrEqual(90);
    expect(matrix.atmosphere.statusColor).toBe('emerald');
    expect(matrix.ecosystemVitalityLevel).toBeGreaterThanOrEqual(9);
  });

  it('detects acute sleep debt in Hearth while keeping Canopy healthy', () => {
    const input: SanctuaryMatrixInput = {
      sleepHours: 5.0,
      restedRating: 4,
      totalProteinLogged: 155,
      targetProtein: 150,
      hydrationLiters: 2.8,
      targetHydration: 2.5,
      protocolAccepted: true,
      sunlightDone: true,
    };

    const matrix = calculateSanctuaryMatrix(input);
    expect(matrix.hearth.score).toBeLessThan(60);
    expect(matrix.hearth.statusColor).toBe('rust');
    expect(matrix.canopy.score).toBeGreaterThanOrEqual(85);
    expect(matrix.canopy.statusColor).toBe('emerald');
    expect(matrix.ecosystemVitalityLevel).toBeLessThan(8);
  });

  it('handles empty/zero log gracefully with baseline fallbacks', () => {
    const input: SanctuaryMatrixInput = {
      sleepHours: 7.0,
      totalProteinLogged: 0,
      targetProtein: 140,
      hydrationLiters: 0,
      targetHydration: 2.5,
      protocolAccepted: false,
      sunlightDone: false,
    };

    const matrix = calculateSanctuaryMatrix(input);
    expect(matrix.canopy.score).toBeLessThanOrEqual(20);
    expect(matrix.canopy.statusColor).toBe('rust');
    expect(matrix.atmosphere.score).toBe(30);
    expect(matrix.atmosphere.statusColor).toBe('rust');
    expect(matrix.ecosystemVitalityLevel).toBeLessThanOrEqual(4);
  });
});
