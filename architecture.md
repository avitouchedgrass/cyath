# Design System Specification (`design.md`): Cyath

## 1. Aesthetic Philosophy & Visual Identity

* **Concept:** Retro-minimalism merging classical editorial elegance with 8-bit digital nostalgia.
* **Visual Anchor Rule:** Strict monochrome interface hierarchy where full-color food pixel art acts as the sole chromatic focus of the UI.
* **Atmosphere:** Dark, quiet, and structured. Surfaces use layered luminance and optical blurs instead of colored accents to indicate hierarchy.

---

## 2. Design Tokens

### 2.1 Color Palette

* **Canvas Background:** `#0B0F17` (Deep Obsidian Charcoal)
* **Surface Background:** `#111827` (Muted Slate Card Surface)
* **Border Default:** `rgba(255, 255, 255, 0.08)` (Subtle 1px boundary)
* **Border Hover/Active:** `rgba(255, 255, 255, 0.20)`
* **Primary Typography:** `#F8FAFC` (Off-white, 100% contrast)
* **Secondary Typography:** `#94A3B8` (Muted Slate, supporting text)
* **Tertiary Typography:** `#64748B` (Subtle captions, timestamps)
* **Interactive Primary Fill (CTA):** `#FFFFFF` (Pure White)
* **Interactive Primary Text:** `#000000` (Pure Black)

### 2.2 Typography

* **Headings (`h1`, `h2`, `h3`, `h4`):** `Playfair Display`, serif, high-contrast, weights 600 & 700.
* **Body, Controls & Data:** `Inter` or `Space Grotesk`, sans-serif, weights 400 & 500.
* **Metrics & Nutritional Values:** `JetBrains Mono` or tabular numbers (`font-variant-numeric: tabular-nums`).

### 2.3 Elevation & Glassmorphism

* **Glass Panel Default:**
* Background: `rgba(255, 255, 255, 0.03)`
* Backdrop Filter: `blur(14px)`
* Border: `1px solid rgba(255, 255, 255, 0.08)`
* Box Shadow: `0 8px 32px 0 rgba(0, 0, 0, 0.37)`


* **Glass Panel Hover:**
* Background: `rgba(255, 255, 255, 0.06)`
* Border: `1px solid rgba(255, 255, 255, 0.16)`



---

## 3. Core Component Library

### 3.1 Inverted Monochrome Buttons

* **Primary Button:** Solid white background (`#FFFFFF`), solid black text (`#000000`), font weight 600, rounded corners (`rounded-lg`), subtle press translation (`active:scale-[0.98]`).
* **Secondary Button:** Transparent fill, `1px solid rgba(255, 255, 255, 0.15)`, white text (`#F8FAFC`), hover state shifts surface to `rgba(255, 255, 255, 0.05)`.

### 3.2 Recipe & Food Cards

* **Structure:** Frosted glass backing with a top-centered pixel-art showcase container.
* **Macro Bar:** Compact 4-column tabular breakdown (Protein, Carbs, Fats, Calories) rendered in monospace subtext.
* **Pixel Asset Container:** Scaled using nearest-neighbor interpolation to prevent edge anti-aliasing blurring.

### 3.3 Habit Streak Heatmap (Monochrome Matrix)

* Level 0 (Inactive): `rgba(255, 255, 255, 0.05)`
* Level 1 (25% Adherence): `rgba(255, 255, 255, 0.25)`
* Level 2 (50% Adherence): `rgba(255, 255, 255, 0.50)`
* Level 3 (75% Adherence): `rgba(255, 255, 255, 0.75)`
* Level 4 (100% Target Met): `#FFFFFF`

---

## 4. Pixel Art Asset & Animation Pipeline

### 4.1 Asset Standards

* **Base Grid Dimensions:** 32x32px or 64x64px scaled to 128x128px or 256x256px display sizes.
* **Rendering Style:** Coarse, distinct retro pixel outlines with rich, warm color palettes (golden grains, rich greens, vibrant proteins).
* **CSS Property:**

```css
.pixel-asset {
  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-crisp-edges;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

```

### 4.2 Floating Wave Animation

```css
@keyframes pixelFloatWave {
  0% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-8px) rotate(1.5deg);
  }
  100% {
    transform: translateY(0px) rotate(0deg);
  }
}

.floating-pixel {
  animation: pixelFloatWave 4s ease-in-out infinite;
}

```

---

## 5. Responsive Behavior & Performance Guardrails

* **Backdrop Filter Fallback:** On devices with low GPU power or older browsers, fallback to solid dark background (`#111827` at 95% opacity) without blur to preserve 60fps frame rates.
* **Layout Grid:** 12-column dynamic grid on desktop (`lg`), collapsing to 2-column on tablet (`md`), and single-column stacked layout on mobile (`sm`).