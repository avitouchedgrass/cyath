/**
 * Central XP Economy Matrix for Cyath
 * Re-aligned to elevate core biological behaviors and dampen non-biological gamification.
 */

export const XP_MATRIX = {
  // Biological Core Biometrics
  MORNING_BOOT_BASE: 15,
  SUNLIGHT_ANCHOR: 30,
  MORNING_BOOT_SUNLIGHT_COMBINED: 45, // Elevated biological morning anchor (+45 XP)
  EVENING_WRAP: 15,
  FLAWLESS_HABIT_DAY: 50, // Elevated flawless day (+50 XP)
  MINIMUM_VIABLE_REENTRY_DAY: 35, // Low-friction restorative recovery (+35 XP)
  WEIGHT_LOG: 15,
  MEAL_LOG: 20,
  DAILY_PROTOCOL_ACCEPT: 25,
  DAILY_PROTOCOL_COMPLETE: 25,
  WEEKLY_DOSSIER_REVIEW: 50,

  // Non-Biological / Social Actions (Dampened)
  SOCIAL_QUEST_FOLLOW: 15, // Reduced from 50 XP to 15 XP + Vanguard Badge
  GUILD_REFERRAL_REWARD: 50, // Reduced from 250 XP to 50 XP + Vanguard Lantern Island Sprite
} as const;

export interface IslandDecoration {
  id: string;
  name: string;
  category: 'beacon' | 'flora' | 'water' | 'relic';
  description: string;
  spriteUrl: string;
}

export const EXCLUSIVE_DECORATIONS: Record<string, IslandDecoration> = {
  vanguard_lantern: {
    id: 'vanguard_lantern',
    name: 'Vanguard Lantern',
    category: 'beacon',
    description: 'A warm brass 16-bit lantern granted to pioneers expanding the Cyath guild network.',
    spriteUrl: '/assets/decorations/vanguard-lantern.png',
  },
  sprouting_moss: {
    id: 'sprouting_moss',
    name: 'Sprouting Velvet Moss',
    category: 'flora',
    description: 'Vibrant moss coating the stone edges of your island, unlocked upon your first calibrated habit.',
    spriteUrl: '/assets/decorations/sprouting-moss.png',
  },
  clear_pool: {
    id: 'clear_pool',
    name: 'Clear Spring Basin',
    category: 'water',
    description: 'A crystalline pool reflecting the sky, unlocked through foundational hydration consistency.',
    spriteUrl: '/assets/decorations/clear-pool.png',
  },
  dossier_consecutive_badge: {
    id: 'dossier_consecutive_badge',
    name: 'Archival Astrolabe',
    category: 'relic',
    description: 'Permanent 16-bit ecosystem badge awarded for consecutive weekly biological dossier reviews.',
    spriteUrl: '/assets/decorations/astrolabe-badge.png',
  },
};
