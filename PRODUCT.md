# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are teenagers, young adults, and digital-native health optimizers looking for an aesthetic, distraction-free environment to track nutrition, daily routines, and behavioral momentum without cognitive overload.

## Product Purpose

Cyath ("Pixel-Perfect Health") delivers a high-craft, retro-minimalist wellness and nutrition platform. It simplifies daily routine tracking by replacing bloated multi-tab fitness trackers with focused, rewarding daily logging and meaningful behavioral correlation insights.

## Positioning

Unlike generic calorie counters and noisy fitness apps filled with ads and complex charts, Cyath combines a distinctive dark glassmorphic canvas with vibrant pixel-art visual anchors and behavioral correlation engines that connect physical habit adherence directly to daily mood and energy levels.

## Operating Context

- **Daily Check-ins**: Fast, tactile daily habit checklist and macro logging during morning/evening routine moments.
- **Recipe Engine**: Quick visual lookup of macro-calibrated, high-protein recipes represented by retro pixel-art sprites.
- **Momentum Visualizer**: Monochrome heatmap streaks reflecting continuous habit execution over time.

## Capabilities and Constraints

- **Capabilities**:
  - High-performance landing page with interactive WebGL specular shaders and GSAP typewriter headlines.
  - Pixel-art recipe carousel and catalog with itemized macro breakdowns.
  - Optimistic local-first habit logging backed by Supabase BaaS.
  - Monochrome streak heatmaps and energy/mood correlation analytics.
- **Constraints**:
  - Strict preservation of the retro-minimalist monochrome aesthetic (`#0B0F17` canvas, frosted glass, pixel-art sprites as exclusive chromatic anchors).
  - Production-grade responsive behavior on desktop and mobile web.

## Brand Commitments

- **Name**: Cyath
- **Tagline**: Pixel-Perfect Health
- **Visual Identity**: Obsidian charcoal background, subtle frosted glass surfaces, high-contrast typography (`Playfair Display` serif headers + `Inter` sans-serif metrics/body), and crisp un-blurred pixel art (`image-rendering: pixelated`).

## Evidence on Hand

- Pixel art food sprites (`pasta.png`, `skillet-eggs.png`, `taco-bowl.png`, `grilled-chicken.png`, `grain-bowl.png`) located in `public/assets/food/`.
- Full-stack codebase with Next.js 14+ App Router, Tailwind CSS, Zustand store (`src/store/useHabitStore.ts`), and Supabase integration (`src/lib/supabase.ts`).

## Product Principles

1. **Aesthetic as Motivation**: Visual elegance, tactile micro-interactions, and retro-pixel delight make daily logging an enjoyable ritual rather than a chore.
2. **Clarity Over Clutter**: Ruthlessly omit extraneous metrics; prioritize high-signal correlations (habits & nutrition vs. subjective energy and focus).
3. **Frictionless Momentum**: Instant, optimistic interactions ensure users can log their routines in seconds without friction.
