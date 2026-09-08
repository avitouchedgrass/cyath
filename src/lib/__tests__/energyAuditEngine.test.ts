import { describe, it, expect } from 'vitest';
import { calculateEnergyAudit, EnergyAuditAnswers } from '../energyAuditEngine';

describe('energyAuditEngine', () => {
  it('calculates significant leak for high-friction desktop habits', () => {
    const answers: EnergyAuditAnswers = {
      caffeineTiming: 'immediate',
      middayFuel: 'high_carb',
      afternoonSlump: 'severe',
      screenCutoff: 'within_30m',
    };

    const result = calculateEnergyAudit(answers);
    expect(result.hoursLostPerDay).toBeGreaterThanOrEqual(2.5);
    expect(result.daysLostPerYear).toBeGreaterThan(60);
    expect(result.enduranceDeficitPercent).toBeGreaterThan(30);
    expect(result.primaryLever.protocolId).toBe('caffeine-delay-90m');
    expect(result.trajectoryPoints).toHaveLength(5);
  });

  it('calculates low leak for dialed baseline habits', () => {
    const answers: EnergyAuditAnswers = {
      caffeineTiming: 'delayed',
      middayFuel: 'high_protein',
      afternoonSlump: 'none',
      screenCutoff: 'dark_60m',
    };

    const result = calculateEnergyAudit(answers);
    expect(result.hoursLostPerDay).toBeLessThanOrEqual(1.0);
    expect(result.daysLostPerYear).toBeLessThan(30);
    expect(result.primaryLever.protocolId).toBe('morning-sunlight-15m');
  });

  it('produces monotonically improving calibrated trajectory vs declining baseline', () => {
    const answers: EnergyAuditAnswers = {
      caffeineTiming: 'immediate',
      middayFuel: 'high_carb',
      afternoonSlump: 'moderate',
      screenCutoff: 'filtered',
    };

    const result = calculateEnergyAudit(answers);
    const pts = result.trajectoryPoints;

    for (let i = 1; i < pts.length; i++) {
      expect(pts[i].calibrated).toBeGreaterThanOrEqual(pts[i - 1].calibrated);
      expect(pts[i].baseline).toBeLessThanOrEqual(pts[i - 1].baseline);
    }
  });
});
