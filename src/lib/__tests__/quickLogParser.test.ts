import { describe, it, expect } from 'vitest';
import { parseQuickLog, HabitLookup } from '../quickLogParser';

describe('parseQuickLog', () => {
  const mockHabits: HabitLookup[] = [
    { id: 'sunlight', title: 'Morning Sunlight & Electrolytes (15m)' },
    { id: 'movement', title: 'Zone 2 Cardio or Heavy Resistance' },
    { id: 'digital_sunset', title: 'Digital Sunset & 8h Dark Sleep' },
    { id: 'custom_reading', title: 'Read 20 Pages Deep Work' },
  ];

  describe('Protein parsing', () => {
    it('parses shorthand relative protein (+30g pro)', () => {
      const result = parseQuickLog('+30g pro', mockHabits);
      expect(result).not.toBeNull();
      expect(result?.type).toBe('LOG_PROTEIN');
      expect(result?.payload.amount).toBe(30);
      expect(result?.payload.isRelative).toBe(true);
    });

    it('parses shorthand 40p and protein 50', () => {
      const r1 = parseQuickLog('40p', mockHabits);
      expect(r1?.type).toBe('LOG_PROTEIN');
      expect(r1?.payload.amount).toBe(40);

      const r2 = parseQuickLog('protein 50', mockHabits);
      expect(r2?.type).toBe('LOG_PROTEIN');
      expect(r2?.payload.amount).toBe(50);
    });
  });

  describe('Hydration parsing', () => {
    it('parses liters (+1.5l water)', () => {
      const result = parseQuickLog('+1.5l water', mockHabits);
      expect(result?.type).toBe('LOG_HYDRATION');
      expect(result?.payload.liters).toBe(1.5);
      expect(result?.payload.isRelative).toBe(true);
    });

    it('parses milliliters (750ml)', () => {
      const result = parseQuickLog('750ml', mockHabits);
      expect(result?.type).toBe('LOG_HYDRATION');
      expect(result?.payload.liters).toBe(0.75);
    });
  });

  describe('Sleep & Biometric parsing', () => {
    it('parses sleep duration (8h sleep)', () => {
      const result = parseQuickLog('8h sleep', mockHabits);
      expect(result?.type).toBe('LOG_SLEEP');
      expect(result?.payload.hours).toBe(8);
    });

    it('parses energy level rating (energy 9)', () => {
      const result = parseQuickLog('energy 9', mockHabits);
      expect(result?.type).toBe('LOG_ENERGY');
      expect(result?.payload.level).toBe(9);
    });

    it('parses mood rating (mood 8/10)', () => {
      const result = parseQuickLog('mood 8/10', mockHabits);
      expect(result?.type).toBe('LOG_MOOD');
      expect(result?.payload.score).toBe(8);
    });
  });

  describe('Habits & Rituals', () => {
    it('matches built-in habit aliases (sunlight)', () => {
      const result = parseQuickLog('sunlight', mockHabits);
      expect(result?.type).toBe('TOGGLE_HABIT');
      expect(result?.payload.habitId).toBe('sunlight');
    });

    it('matches custom habits by title substring (read 20 pages)', () => {
      const result = parseQuickLog('read 20 pages', mockHabits);
      expect(result?.type).toBe('TOGGLE_HABIT');
      expect(result?.payload.habitId).toBe('custom_reading');
    });

    it('triggers morning boot and evening wrap rituals', () => {
      const r1 = parseQuickLog('morning boot', mockHabits);
      expect(r1?.type).toBe('TRIGGER_RITUAL');
      expect(r1?.payload.ritual).toBe('morning-boot');

      const r2 = parseQuickLog('wrap', mockHabits);
      expect(r2?.type).toBe('TRIGGER_RITUAL');
      expect(r2?.payload.ritual).toBe('evening-wrap');
    });
  });

  describe('Navigation & Fallback', () => {
    it('handles direct route navigation (sanctuary, goto recipes)', () => {
      const r1 = parseQuickLog('sanctuary', mockHabits);
      expect(r1?.type).toBe('NAVIGATE');
      expect(r1?.payload.path).toBe('/sanctuary');

      const r2 = parseQuickLog('goto recipes', mockHabits);
      expect(r2?.type).toBe('NAVIGATE');
      expect(r2?.payload.path).toBe('/recipes');
    });

    it('falls back to AI parser for natural language phrases', () => {
      const result = parseQuickLog('ate 3 eggs and avocado toast', mockHabits);
      expect(result?.type).toBe('AI_NATURAL_LANGUAGE');
      expect(result?.payload.text).toBe('ate 3 eggs and avocado toast');
    });
  });
});
