import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const LLMS_TEXT_CONTENT = `# Cyath (https://cyath.health)

> A retro 16-bit metabolic health and daily habit platform combining 30-second daily check-ins, whole-food fuel recipes, circadian protocols, and statistical energy correlations.

## Core Purpose & Philosophy
Cyath eliminates tracking burnout and complex macro spreadsheets. Instead of requiring users to weigh every gram or scan barcodes, Cyath focuses on high-leverage metabolic habits:
1. **Whole-Food Protein Calibration**: Hitting 120g+ daily protein targets with curated whole-food chef recipes across Vegetarian, Eggetarian, Vegan, Pescatarian, and Omnivore meal plans.
2. **Frictionless 30-Second Check-Ins**: Logging water (2.5L+), sleep restoration (7.5h+), and 1-10 energy ratings in under 30 seconds.
3. **Food-to-Energy Pattern Engine**: Pearson correlation analytics connecting daily meals and habits with afternoon focus depth.
4. **16-Bit Sanctuary Diorama**: An evolving pixel-art floating island that visually reflects consistent streak momentum.

## Primary Routes
- /: Landing page, 3-step routine breakdown, interactive scatter plot preview, and 16-bit dish showcase.
- /dashboard: Daily habit checklist, quick macro steppers (+15g, +30g protein), hydration gauge, energy journal, and 28-day activity heatmap.
- /recipes: Catalog of 31+ high-protein, steady-carb, and keto-clean whole-food dishes with dynamic portion multipliers (0.5x, 1.0x, 1.5x, 2.0x), ingredient lists, cooking instructions, and computer-vision meal scanner.
- /protocols: Evidence-based daily routines (Morning Activation, Deep REM Sleep, High-Performance Focus, Metabolic Balance, Physical Recovery) with 1-tap activation into the user's checklist.
- /correlations: Live statistical scatter matrix and Pearson correlation coefficient calculations (e.g. Protein × Focus, Sleep × Energy, Hydration × Mood).
- /sanctuary: 16-bit floating island diorama that levels up and unlocks dynamic features as users build daily consistency.
- /profile: User settings, biometric targets, referral invite code (+250 XP bonus system), and data management.

## Dietary Categories & Recipe Coverage
- Vegetarian: Plant foods and dairy (paneer, curd, milk, cheese, ghee, butter) with zero eggs and zero meat/seafood.
- Eggetarian: Pasture-raised eggs and dairy without meat/seafood (9 whole-food recipes).
- Vegan: 100% plant-based recipes with zero animal products (10 whole-food recipes).
- Pescatarian: Wild seafood and white fish (4 whole-food recipes).
- Omnivore: Whole-food pasture-raised meats and poultry (11 whole-food recipes).

## Tech Stack & Architecture
- Next.js 16 App Router (React 19, TypeScript strict mode)
- Tailwind CSS 4 with custom 16-bit Neobrutalist design system
- Zustand store with defensive schema normalization and local storage hydration
- Web Audio API synthesizer for 8-bit sound effects (zero audio assets)
- Supabase authentication and remote cloud synchronization
`;

export async function GET() {
  return new NextResponse(LLMS_TEXT_CONTENT, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
