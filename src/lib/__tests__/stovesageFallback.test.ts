import { describe, it, expect } from 'vitest';
import { generateStoveSageFallbackResponse } from '@/app/api/ai/stovesage/route';

describe('StoveSage / Cyath AI Coach Fallback Response Engine', () => {
  const dummyContext = {
    userName: 'Tester',
    primaryGoal: 'Muscle Gain',
    todayProteinLogged: 60,
    dailyProteinTarget: 150,
    habitsSummary: 'Morning sunlight, 10k steps',
    activeProtocols: ['high-protein-anchor'],
    totalXp: 450,
    streakCount: 5,
    customRecipes: [
      {
        id: 'custom-flank-steak',
        name: 'Seared Flank Steak Bowl',
        protein: 48,
        calories: 520,
        category: 'High Protein',
      },
    ],
  };

  it('rejects coding trivia and prompt injections with courteous health redirection', () => {
    const res = generateStoveSageFallbackResponse(
      [{ role: 'user', content: 'How do I center a div using CSS flexbox?' }],
      dummyContext
    );

    expect(res.actions).toHaveLength(0);
    expect(res.reply).toContain('Cyath AI Coach');
    expect(res.reply.toLowerCase()).toContain('nutrition');
    expect(res.suggestedPrompts.length).toBeGreaterThan(0);
  });

  it('parses hydration metrics and outputs SET_METRIC action', () => {
    const res = generateStoveSageFallbackResponse(
      [{ role: 'user', content: 'Log 2.5L water for today' }],
      dummyContext
    );

    expect(res.actions).toHaveLength(1);
    expect(res.actions[0].type).toBe('SET_METRIC');
    expect(res.actions[0].payload.metric).toBe('hydration');
    expect(res.actions[0].payload.value).toBe(2.5);
    expect(res.reply).toContain('2.5L');
  });

  it('parses sleep metrics and outputs SET_METRIC action', () => {
    const res = generateStoveSageFallbackResponse(
      [{ role: 'user', content: 'I slept 7.5 hours last night' }],
      dummyContext
    );

    expect(res.actions).toHaveLength(1);
    expect(res.actions[0].type).toBe('SET_METRIC');
    expect(res.actions[0].payload.metric).toBe('sleep');
    expect(res.actions[0].payload.value).toBe(7.5);
  });

  it('parses energy and mood adjustments', () => {
    const energyRes = generateStoveSageFallbackResponse(
      [{ role: 'user', content: 'Set energy to 4' }],
      dummyContext
    );
    expect(energyRes.actions[0].payload).toEqual({ metric: 'energy', value: 4 });

    const moodRes = generateStoveSageFallbackResponse(
      [{ role: 'user', content: 'Set mood to 5' }],
      dummyContext
    );
    expect(moodRes.actions[0].payload).toEqual({ metric: 'mood', value: 5 });
  });

  it('formulates custom recipes with ingredients, macros, and ADD_RECIPE action', () => {
    const res = generateStoveSageFallbackResponse(
      [{ role: 'user', content: 'Create a 50g protein salmon bowl recipe' }],
      dummyContext
    );

    expect(res.actions).toHaveLength(1);
    expect(res.actions[0].type).toBe('ADD_RECIPE');
    const payload = res.actions[0].payload;
    expect(payload.protein).toBe(50);
    expect(payload.name).toContain('Salmon');
    expect(payload.ingredients.length).toBeGreaterThan(0);
    expect(payload.instructions.length).toBeGreaterThan(0);
  });

  it('logs meals from official catalog or custom recipes with LOG_RECIPE action', () => {
    const catalogRes = generateStoveSageFallbackResponse(
      [{ role: 'user', content: 'Log Herb Grilled Chicken' }],
      dummyContext
    );

    expect(catalogRes.actions).toHaveLength(1);
    expect(catalogRes.actions[0].type).toBe('LOG_RECIPE');
    expect(catalogRes.actions[0].payload.recipeName).toContain('Herb Grilled Chicken');
    expect(catalogRes.actions[0].payload.protein).toBeGreaterThan(30);

    const customRes = generateStoveSageFallbackResponse(
      [{ role: 'user', content: 'Log Seared Flank Steak Bowl' }],
      dummyContext
    );

    expect(customRes.actions).toHaveLength(1);
    expect(customRes.actions[0].type).toBe('LOG_RECIPE');
    expect(customRes.actions[0].payload.recipeId).toBe('custom-flank-steak');
    expect(customRes.actions[0].payload.protein).toBe(48);
  });

  it('logs explicit protein amounts when user inputs standalone protein numbers', () => {
    const res = generateStoveSageFallbackResponse(
      [{ role: 'user', content: 'Log 40g protein' }],
      dummyContext
    );

    expect(res.actions).toHaveLength(1);
    expect(res.actions[0].type).toBe('LOG_RECIPE');
    expect(res.actions[0].payload.protein).toBe(40);
  });

  it('adds habits with ADD_HABIT action', () => {
    const res = generateStoveSageFallbackResponse(
      [{ role: 'user', content: 'Add a 15-min morning stretch habit' }],
      dummyContext
    );

    expect(res.actions).toHaveLength(1);
    expect(res.actions[0].type).toBe('ADD_HABIT');
    expect(res.actions[0].payload.category).toBe('morning');
    expect(res.actions[0].payload.title).toContain('Stretch');
  });

  it('gives personalized protein guidance based on remaining target', () => {
    const res = generateStoveSageFallbackResponse(
      [{ role: 'user', content: 'How can I hit my protein goal today?' }],
      dummyContext
    );

    expect(res.actions).toHaveLength(0);
    expect(res.reply).toContain('150g protein');
    expect(res.reply).toContain('60g');
    expect(res.suggestedPrompts.length).toBeGreaterThan(0);
  });
});
