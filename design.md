# Product Requirements Document (PRD): Cyath

## 1. Executive Summary & Product Vision

* **Product Name:** Cyath
* **Tagline:** Pixel-Perfect Health
* **Core Objective:** A full-stack web platform combining behavioral psychology feedback loops with physical health and routine tracking to build long-term momentum and optimize daily performance.
* **Target Audience:** Civic and public health tech hackathon judges, as well as design-forward digital consumers seeking a low-friction, high-aesthetic wellness tracker.

## 2. Design System & UI Specifications

### 2.1 Aesthetic Philosophy

* **Theme:** Retro-minimalism anchored on a deep dark monochrome palette, high contrast, subtle glassmorphism, and vibrant pixel-art assets serving as the sole chromatic visual anchors.
* **Color Tokens:**
* Canvas Background: Deep charcoal / slate (`#0B0F17`)
* Surface / Card Background: Muted dark slate (`#111827`)
* Primary Text / Headings: Crisp off-white (`#F8FAFC`)
* Secondary Text: Muted slate (`#94A3B8`)
* Borders & Dividers: Low-opacity white (`rgba(255, 255, 255, 0.08)`)
* Primary CTAs: Inverted monochrome style (Pure white `#FFFFFF` fill with pure black `#000000` text on hover/active states).



### 2.2 Typography

* **Headings (`h1`, `h2`, `h3`):** `Playfair Display` (High-contrast serif for a refined editorial feel).
* **Body Text & Metrics:** `Inter` or `Space Grotesk` (Clean sans-serif optimized for 14–16px legibility).

### 2.3 Glassmorphism Standards

* **Backdrop Filter:** `blur(12px)` to `blur(16px)`
* **Surface Fill:** `rgba(255, 255, 255, 0.03)` to `rgba(255, 255, 255, 0.05)`
* **Borders:** `1px solid rgba(255, 255, 255, 0.1)`

## 3. Core Feature Matrix

### 3.1 Hero & Landing Shell

* Sticky frosted-glass navigation bar featuring the pixel-wave monogram logo and inverted monochrome authentication actions.
* Editorial serif headline paired with animated floating pixel-art food assets driven by CSS keyframes.

### 3.2 Recipe & Food Logging Engine

* Curated catalog of 10–15 high-impact recipe cards for the MVP phase, scaling up to 70+ post-launch.
* Isolated pixel-art asset container with `image-rendering: pixelated` to maintain sharp, clean retro visuals.
* Itemized nutritional breakdowns covering protein, carbohydrates, fats, and total calories.

### 3.3 Behavioral & Routine Tracker

* Daily logging for habits, protein targets, hydration, sleep quality, and subjective mood/energy scores (1–10 scale).
* Monochrome heatmap visualization utilizing opacity scales (20%, 50%, 80%, 100% white) to display habit streaks without chromatic clutter.

### 3.4 Behavioral Correlation Insights

* Client-side analytical logic mapping daily habit adherence and nutritional intake against reported energy levels to surface personalized behavioral momentum patterns.

## 4. Technical Stack & Architecture

* **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS.
* **State Management:** Zustand or React Context for fast, local-first interactive state handling.
* **Backend & Database:** Node.js / Express or FastAPI with PostgreSQL or MongoDB for sequential daily user logs.
* **Asset Pipeline:** WebP / SVG sprite optimization for rapid asset delivery and smooth layout rendering.