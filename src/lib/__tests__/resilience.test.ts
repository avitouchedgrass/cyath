import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit } from '../rateLimit';
import { formatLocalDate, parseLocalDate, getRelativeLocalDate } from '../dateUtils';
import { calculatePearson, deriveCorrelations } from '../correlation';
import { useHabitStore } from '../../store/useHabitStore';

describe('Anti-Crash & Resilience Architecture Tests', () => {
  describe('Sliding-Window Rate Limiter (rateLimit.ts)', () => {
    it('should allow requests within limit and throttle subsequent requests', () => {
      const config = { windowMs: 1000, maxRequests: 3 };
      const ip = '192.168.1.100';

      const r1 = checkRateLimit('test_endpoint', ip, config);
      expect(r1.allowed).toBe(true);
      expect(r1.remaining).toBe(2);

      const r2 = checkRateLimit('test_endpoint', ip, config);
      expect(r2.allowed).toBe(true);
      expect(r2.remaining).toBe(1);

      const r3 = checkRateLimit('test_endpoint', ip, config);
      expect(r3.allowed).toBe(true);
      expect(r3.remaining).toBe(0);

      // 4th request exceeds maxRequests = 3
      const r4 = checkRateLimit('test_endpoint', ip, config);
      expect(r4.allowed).toBe(false);
      expect(r4.remaining).toBe(0);
      expect(r4.retryAfterSeconds).toBeGreaterThan(0);
    });

    it('should track rate limits per unique IP and namespace independently', () => {
      const config = { windowMs: 1000, maxRequests: 2 };
      const ipA = '10.0.0.1';
      const ipB = '10.0.0.2';

      expect(checkRateLimit('nsA', ipA, config).allowed).toBe(true);
      expect(checkRateLimit('nsA', ipA, config).allowed).toBe(true);
      expect(checkRateLimit('nsA', ipA, config).allowed).toBe(false);

      // ipB is independent
      expect(checkRateLimit('nsA', ipB, config).allowed).toBe(true);
      // different namespace for ipA is independent
      expect(checkRateLimit('nsB', ipA, config).allowed).toBe(true);
    });
  });

  describe('Defensive Date Parsing & Formatting (dateUtils.ts)', () => {
    it('should safely parse valid and malformed dates without throwing', () => {
      const valid = parseLocalDate('2026-09-02');
      expect(valid.getFullYear()).toBe(2026);
      expect(valid.getMonth()).toBe(8); // 0-indexed Sept
      expect(valid.getDate()).toBe(2);

      // Null, undefined, empty, or gibberish input should return a valid Date object
      expect(() => parseLocalDate(null as any)).not.toThrow();
      expect(() => parseLocalDate(undefined as any)).not.toThrow();
      expect(() => parseLocalDate('')).not.toThrow();
      expect(() => parseLocalDate('gibberish-not-a-date')).not.toThrow();

      const fallback = parseLocalDate('invalid');
      expect(fallback instanceof Date).toBe(true);
      expect(isNaN(fallback.getTime())).toBe(false);
    });

    it('should format dates safely even with null or invalid inputs', () => {
      expect(formatLocalDate(new Date(2026, 8, 2))).toBe('2026-09-02');
      expect(() => formatLocalDate(null)).not.toThrow();
      expect(() => formatLocalDate(new Date('invalid'))).not.toThrow();
    });

    it('should calculate relative dates safely', () => {
      const base = new Date(2026, 8, 2);
      expect(getRelativeLocalDate(-1, base)).toBe('2026-09-01');
      expect(getRelativeLocalDate(1, base)).toBe('2026-09-03');
      expect(() => getRelativeLocalDate(NaN as any)).not.toThrow();
    });
  });

  describe('Mathematical Zero-Division & NaN Defense (correlation.ts)', () => {
    it('should return 0 instead of NaN or throwing for empty or mismatched arrays', () => {
      expect(calculatePearson([], [])).toBe(0);
      expect(calculatePearson([1], [1])).toBe(0);
      expect(calculatePearson([1, 2], [1])).toBe(0);
      expect(calculatePearson(null as any, [1, 2])).toBe(0);
    });

    it('should handle zero-variance arrays without dividing by zero', () => {
      // Flat line array has zero standard deviation
      expect(calculatePearson([5, 5, 5, 5], [10, 20, 30, 40])).toBe(0);
    });

    it('should derive correlations safely from empty logs without throwing', () => {
      const correlations = deriveCorrelations({});
      expect(correlations.length).toBe(4);
      correlations.forEach((c) => {
        expect(Number.isFinite(c.coefficient)).toBe(true);
        expect(Array.isArray(c.points)).toBe(true);
      });
    });
  });

  describe('Defensive Store Normalization (useHabitStore.ts)', () => {
    beforeEach(() => {
      useHabitStore.setState({
        logsByDate: {},
        totalXp: 0,
        streakCount: 0,
      });
    });

    it('should return a complete, guaranteed object structure from getDailyLog even for unrecorded dates', () => {
      const log = useHabitStore.getState().getDailyLog('2099-01-01');
      expect(log).toBeDefined();
      expect(log.habitsCompleted).toEqual({});
      expect(log.totalProteinLogged).toBe(0);
      expect(log.totalCaloriesLogged).toBe(0);
      expect(Array.isArray(log.loggedRecipeIds)).toBe(true);
    });

    it('should clamp negative XP updates and keep totalXp non-negative', () => {
      useHabitStore.getState().gainXp(-500, 'Test penalty');
      expect(useHabitStore.getState().totalXp).toBe(0);
    });
  });
});
