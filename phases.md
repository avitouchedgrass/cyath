# Implementation Roadmap (`phases.md`): Cyath

## 1. 10-Day Sprint Overview

| Phase | Timeline | Core Focus | Primary Exit Criteria |
| --- | --- | --- | --- |
| **Phase 1** | Days 1–3 | Core Infrastructure & Database Models | Next.js scaffolding complete, Tailwind tokens configured, database seeded with 12 recipes. |
| **Phase 2** | Days 4–5 | UI Shell & Design System Integration | Glassmorphic layout, Playfair typography, navbar, and hero page with floating pixel wave rendering. |
| **Phase 3** | Days 6–7 | Interactive Logging & Recipe Modules | Working habit check-ins, macro logging, and pixel recipe catalog with nearest-neighbor scaling. |
| **Phase 4** | Days 8–9 | Behavioral Engine & Correlation Analytics | Algorithmic correlation calculation working, monochrome heatmap matrix rendering live data. |
| **Phase 5** | Day 10 | Edge Polish, Performance & Pitch Demo | Zero hydration bugs, smooth CSS backdrop-blur performance, demo seed script ready for presentation. |

---

## 2. Detailed Phase Breakdown

### Phase 1: Core Setup & Data Infrastructure (Days 1–3)

* Initialize Next.js 14+ project with TypeScript and Tailwind CSS.
* Configure `tailwind.config.ts` with custom monochrome color scales, blur utilities, and font definitions (`Playfair Display`, `Inter`/`Space Grotesk`).
* Define database schemas (PostgreSQL/Prisma or MongoDB) for `User`, `Recipe`, and `DailyLog`.
* Create a seed script populating **10–15 curated recipes** with macro breakdowns and pixel asset metadata.
* Set up Zustand store (`useHabitStore.ts`) with optimistic local updates for instant UI interactions.

### Phase 2: UI Foundation & Glassmorphic Shell (Days 4–5)

* Build the root layout (`app/layout.tsx`) importing Google fonts via `next/font/google`.
* Implement core UI primitives:
* `GlassCard.tsx` (Backdrop blur, low-opacity white border, subtle elevation).
* `InvertedButton.tsx` (Pure white background, pure black text for primary actions).


* Construct the frosted-glass sticky navigation bar featuring the pixel-wave monogram logo.
* Build the landing hero section highlighting "Pixel-Perfect Health" and the CSS floating wave keyframe animation.

### Phase 3: Interactive Logging & Recipe Engine (Days 6–7)

* Construct the Recipe Catalog grid (`app/dashboard/recipes/page.tsx`) with recipe cards displaying macro totals (protein, carbs, fats, calories).
* Implement `PixelContainer.tsx` ensuring `image-rendering: pixelated` across all browser engines.
* Build the daily habit and routine logging interface:
* Daily checklist (target routines, protein intake tracking, hydration, sleep).
* Mood and energy rating inputs (1–10 interactive range sliders).


* Connect local state mutations with automatic background sync to the database.

### Phase 4: Correlation Logic & Streak Visualization (Days 8–9)

* Implement the monochrome habit heatmap (`HeatmapMatrix.tsx`) using white opacity steps (`20%`, `50%`, `75%`, `100%`) to display consistency without color clutter.
* Implement the client-side Behavioral Correlation Engine (`lib/utils/correlation.ts`) calculating Pearson correlation scores between habit completion, sleep, protein intake, and energy levels.
* Display human-readable behavioral insights on the dashboard (e.g., adherence impact on energy).

### Phase 5: Optimization, Review & Demo Readiness (Day 10)

* Audit glassmorphism rendering on mobile viewports; verify CSS fallback for low-power GPUs.
* Add responsive layout adjustments across standard mobile, tablet, and desktop breakpoints.
* Pre-populate a realistic 14-day sample user dataset to ensure instant, populated analytics during live hackathon demos.
* Run end-to-end linting, type-checking, and build validation (`next build`).

---

## 3. Scope Guardrails (MVP vs. Post-Hackathon)

### In-Scope (Must Have for 10-Day Prototype)

* Strict monochrome dark-mode UI with high-contrast inverted CTAs.
* 10–15 fully populated pixel-art recipe cards with detailed macro metrics.
* Daily habit, protein, sleep, and mood/energy logging.
* Monochrome streak matrix and deterministic correlation insight card.
* Fully functional demo bypass / guest login state.

### Out-of-Scope (Deferred to Post-Hackathon)

* Full 70+ recipe asset library expansion.
* Social sharing feeds and community habit leaderboards.
* Complex OAuth integrations (Google, Apple) requiring third-party app verification.
* Advanced multi-variable machine learning regression models.