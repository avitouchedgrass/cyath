import { describe, it, expect } from 'vitest';
import { calculateCircadianStatus } from '../circadianEngine';

describe('circadianEngine', () => {
  it('identifies photonic reset phase shortly after wake', () => {
    // Wake at 07:00, current time 07:30 (0.5h post-wake)
    const testDate = new Date(2026, 8, 8, 7, 30);
    const status = calculateCircadianStatus({ now: testDate, wakeTimeStr: '07:00' });

    expect(status.currentPhase.id).toBe('photonic_reset');
    expect(status.hoursSinceWake).toBeCloseTo(0.5, 1);
    expect(status.currentPhase.statusColor).toBe('amber');
    expect(status.currentPhase.hourlyDirective).toContain('sunlight');
  });

  it('identifies peak clarity phase 3 hours post-wake', () => {
    // Wake at 07:00, current time 10:00 (3h post-wake)
    const testDate = new Date(2026, 8, 8, 10, 0);
    const status = calculateCircadianStatus({ now: testDate, wakeTimeStr: '07:00' });

    expect(status.currentPhase.id).toBe('peak_clarity');
    expect(status.alertnessScore).toBeGreaterThanOrEqual(85);
    expect(status.currentPhase.statusColor).toBe('emerald');
  });

  it('identifies postprandial & adenosine dip window 7 hours post-wake', () => {
    // Wake at 07:00, current time 14:00 (7h post-wake, 2:00 PM)
    const testDate = new Date(2026, 8, 8, 14, 0);
    const status = calculateCircadianStatus({ now: testDate, wakeTimeStr: '07:00' });

    expect(status.currentPhase.id).toBe('postprandial_dip');
    expect(status.alertnessScore).toBeLessThanOrEqual(65);
    expect(status.currentPhase.counterMeasure).toContain('walk');
  });

  it('identifies secondary focus in late afternoon', () => {
    // Wake at 07:00, current time 16:30 (9.5h post-wake, 4:30 PM)
    const testDate = new Date(2026, 8, 8, 16, 30);
    const status = calculateCircadianStatus({ now: testDate, wakeTimeStr: '07:00' });

    expect(status.currentPhase.id).toBe('secondary_focus');
    expect(status.alertnessScore).toBeGreaterThanOrEqual(70);
  });

  it('identifies cortisol wind-down in evening', () => {
    // Wake at 07:00, current time 19:30 (12.5h post-wake, 7:30 PM)
    const testDate = new Date(2026, 8, 8, 19, 30);
    const status = calculateCircadianStatus({ now: testDate, wakeTimeStr: '07:00' });

    expect(status.currentPhase.id).toBe('cortisol_winddown');
    expect(status.currentPhase.hourlyDirective).toContain('wrap');
  });

  it('identifies melatonin gate late at night', () => {
    // Wake at 07:00, current time 23:00 (16h post-wake, 11:00 PM)
    const testDate = new Date(2026, 8, 8, 23, 0);
    const status = calculateCircadianStatus({ now: testDate, wakeTimeStr: '07:00' });

    expect(status.currentPhase.id).toBe('melatonin_gate');
    expect(status.alertnessScore).toBeLessThanOrEqual(40);
  });

  it('generates a full 17-point waking curve spanning the 16-hour workday', () => {
    const status = calculateCircadianStatus();
    expect(status.curvePoints.length).toBe(17);
    status.curvePoints.forEach((pt) => {
      expect(pt.alertnessScore).toBeGreaterThanOrEqual(10);
      expect(pt.alertnessScore).toBeLessThanOrEqual(100);
      expect(pt.timeLabel).toBeDefined();
    });
  });
});
