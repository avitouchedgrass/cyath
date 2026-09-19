---
name: Cyath
description: Artisanal Japanese-Kintsugi Sanctuary & Metabolic Ritual Engine
colors:
  primary: "#1A3629"
  primary-hover: "#2C4A3B"
  neutral-canvas: "#FAF8F5"
  neutral-surface: "#FFFDF9"
  neutral-well: "#FAF8F5"
  neutral-muted: "#4A5D4E"
  neutral-subtle: "#7A8D7E"
  accent-gold: "#F59E0B"
  accent-amber: "#D97706"
  tome-timber: "#241A13"
  tome-spine: "#1E140E"
  tome-leather: "#3D2E24"
  cork-board: "#B8A994"
  cork-shadow: "#5C4838"
  wax-seal: "#B91C1C"
typography:
  display:
    fontFamily: "Cabinet Grotesk, -apple-system, sans-serif"
    fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Cabinet Grotesk, -apple-system, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Cabinet Grotesk, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.04em"
rounded:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  3xl: "32px"
  none: "0px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-surface}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.neutral-surface}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  button-secondary:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  card-sanctuary:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.3xl}"
    padding: "24px"
  tome-ledger:
    backgroundColor: "{colors.tome-leather}"
    textColor: "{colors.neutral-surface}"
    rounded: "{rounded.none}"
    padding: "20px"
---

# Design System: Cyath

## Overview

**Creative North Star: "The Artisanal Guild Sanctuary"**

Cyath balances warm physical tactility with high-performance digital wellness tracking. Instead of cold biometric charts or sterile neon glass, the interface evokes a master craftsperson's workshop: warm Japanese parchment paper, deep pine evergreen inks, golden kintsugi repair seams, and an archival guild ledger tome bound with wax-sealed receipts.

The aesthetic celebrates habit momentum through organic biological evolution. Daily routines nurture a monumental floating island biome that shifts through living lifecycle states (dormant mist, ember coals, active bloom). Broken streaks are never punished with cold resets; they are restored with golden Kintsugi seams that celebrate resilience over perfection.

**Key Characteristics:**
- **Warm Parchment Grounding:** Textured ivory and cream backgrounds (`#FAF8F5`, `#FFFDF9`) replace clinical dark modes.
- **Deep Evergreen & Sage Typography:** Natural evergreen ink (`#1A3629`) provides calm, authoritative contrast without harsh pure black.
- **Dual-Geometry Discipline:** Flowing rounded cards (`rounded-2xl` to `rounded-3xl`) for daily operator tools, paired with sharp 90-degree book edges (`rounded-none`) for archival records.
- **Uncompromised Pixel Art:** High-fidelity 16-bit sprites rendered with crisp edge rules (`image-rendering: pixelated`).
- **Tactile Web Audio Rituals:** Rich synthesized auditory feedback for blips, paper rustles, inspect confirmations, and wax seals.

## Colors

The palette is rooted in botanical and archival materials: deep pine forest canopy, sunlit washi paper, beaten gold leaf, and vegetable-tanned leather.

### Primary
- **Japanese Evergreen Ink** (`#1A3629`): Primary authority color used for display headings, primary interactive actions, high-contrast borders, and level progression bars.
- **Deep Pine Shade** (`#2C4A3B`): Active and hover state for primary interactive elements.

### Secondary
- **Muted Sage Ink** (`#4A5D4E`): Secondary text, descriptive labels, and habit status metadata.
- **Deep Forest Sage** (`#3D4D41`): High-contrast instructional copy on light wells.

### Tertiary
- **Kintsugi Seam Gold** (`#F59E0B`): Glowing gold seams celebrating restored streaks, tier achievements, and milestone badges.
- **Archival Amber** (`#D97706`): Warm gold accents, trophy borders, and flame highlights.
- **Guild Wax Seal Red** (`#B91C1C` / `#991B1B`): Verification stamp wax seals pinned to completed thermal receipts.

### Neutral
- **Japanese Canvas Parchment** (`#FAF8F5`): Root canvas background providing warm, non-glare surface comfort.
- **Pure Cream Surface** (`#FFFDF9`): Primary surface fill for floating operator cards and dialog modals.
- **Hardcover Tome Leather** (`#3D2E24`): Background for the 30-Day Guild Ledger drawer.
- **Deep Book Timber** (`#241A13`): Frame borders for archival ledger binders and inspect buttons.
- **Archival Spine Shadow** (`#1E140E`): Deep book spine accentuation.
- **Natural Cork Inlay** (`#B8A994`): Tactile corkboard backdrop for pinned daily receipts.

### Named Rules
**The Rarity of Gold Rule.** Golden Kintsugi accents are reserved exclusively for earned achievements, streak repairs, and verified wax seals. They never appear as casual background decoration.

**The No-Pitch-Black Rule.** Pure `#000000` is strictly avoided for typography. Deep Evergreen (`#1A3629`) serves as the darkest ink, creating a softer, more organic reading posture.

## Typography

**Display Font:** Cabinet Grotesk (with system sans-serif fallback)  
**Body Font:** Inter (with system sans-serif fallback)  
**Label/Mono Font:** JetBrains Mono (with ui-monospace fallback)

**Character:** The pairing couples the confident, architectural personality of Cabinet Grotesk with the immaculate legibility of Inter and the precision of JetBrains Mono.

### Hierarchy
- **Display** (800 weight, clamp(1.75rem, 3.5vw, 2.5rem), line-height 1.1): Sanctuary Cockpit header, monumental biome island titles.
- **Headline** (700 weight, 1.25rem, line-height 1.25): Card headers, section dividers, and modal titles.
- **Title** (700 weight, 1rem, line-height 1.3): Habit titles, meal preset names, and milestone banners.
- **Body** (400-500 weight, 0.875rem, line-height 1.5): Instructional descriptions, nutritional breakdowns, and helper copy.
- **Label** (600-700 weight, 0.75rem, letter-spacing 0.04em, monospace): Macro gram floors, level progress numbers, hotkey accelerators, and timestamps.
- **Micro / Stamp** (600-700 weight, 0.5625rem to 0.6875rem (9px to 11px), uppercase monospace): Thermal receipt timestamps, wax seal indicators, hotkey key tags, and biological status badges.

### Named Rules
**The Monospace Discipline Rule.** All numerical measurements, XP counters, timestamps, and hotkey accelerators are rendered in JetBrains Mono to preserve tabular vertical alignment across updates.

## Layout

The sanctuary utilizes an Edge-to-Edge Split Horizon architecture:
- **Left 50% (Desktop):** Monumental sticky observatory holding the unboxed living island, biometric status, level progression bar, and edge-anchored ledger bookmark tab.
- **Right 50% (Desktop):** Three stacked operator hearths (`Log Food`, `Evening Ledger & Cadence`, `Daily Ritual Anchors`).
- **Mobile (< 1024px):** Single-thumb Station Switcher toggling instantly between `Sanctuary Island` and `Daily Console`.
- **Spacing Rhythm:** Based on an 8px grid (`4px`, `8px`, `16px`, `24px`, `32px`, `48px`).

## Elevation & Depth

Cyath rejects heavy, blurry multi-layer floating drop shadows in favor of tactile physical deboss wells and fine 1px parchment borders.

### Shadow Vocabulary
- **Tactile Card Rest** (`0 8px 32px rgba(26,54,41,0.04)`): Ambient subtle lift for surface cards on parchment.
- **Micro Button Press** (`0 1px 2px rgba(26,54,41,0.12)`): Grounded tactile press for buttons and chips.
- **Stepped Pixel Ground Shadow**: Three stacked concentric geometric ellipses under the floating island SVG simulating retro pixel depth.
- **Hardcover Book Elevation** (`0 24px 70px rgba(10,7,5,0.55)`): Dramatic ambient depth when the 30-Day Guild Ledger tome slides into view.

### Named Rules
**The Deboss-Over-Shadow Rule.** Secondary containers and inactive states use recessed wells (`bg-[#FAF8F5]` with a 1px border) rather than floating elevation, giving the workspace a carved, physical feel.

## Shapes

The design system employs a deliberate dual-geometry strategy:
- **Organic Operator Cards:** Generously rounded (`rounded-2xl` to `rounded-3xl`) to convey calm, ergonomic friendliness.
- **Archival Ledger & Tome:** Crisp 90-degree corners (`rounded-none`), heavy leather binding edges, and saw-toothed receipt tears (`clipPath: SAWTOOTH_CLIP`) to evoke an authentic physical book.

## Components

### Buttons
- **Primary:** Forest green background (`#1A3629`), crisp cream text (`#FFFDF9`), 10px-12px radius, micro hover scale.
- **Secondary / Ghost:** Parchment background (`#FFFDF9`), forest border (`rgba(26,54,41,0.2)`), hover background shift.
- **Screen-Edge Bookmark Tab:** Fixed to left viewport edge (`fixed left-0`), vertical uppercase label, tactile hover flip.

### Chips & Badges
- **Biometric Target Chips:** Dual wake and sleep boxes with icon, title, and bold JetBrains Mono time readout.
- **Preset Meal Plates:** Compact square cards with pixel-art meal plate sprite, title, and highlighted protein badge (`+35g`).

### Cards & Hearths
- **Floating Operator Hearth:** Cream surface (`#FFFDF9`), 1px subtle forest border (`rgba(26,54,41,0.15)`), 24px padding.
- **Archival Tome Drawer:** Leather background (`#3D2E24`), sharp book borders (`rounded-none border-4 border-[#241A13]`), custom corkboard backdrop SVG.

### Signature Components
- **Living Biome Island:** Pixel-art floating island with rot/embers/mist SVG filters, golden kintsugi seams, and motion-safe floating keyframes.
- **Sawtooth Guild Receipts:** Pinned daily register slips with sawtooth torn paper clip-paths and authentic red/gold wax seals.

## Do's and Don'ts

### Do:
- **Do** preserve crisp pixel edges (`image-rendering: pixelated`) on all trophy relics, food plates, and island assets.
- **Do** wrap continuous animations in `motion-safe:` utility prefixes to protect users with vestibular sensitivity.
- **Do** provide screen-reader accessible labels on all natural language inputs and interactive receipt buttons.
- **Do** maintain tabular monospace fonts for all numerical macros, dates, and level statistics.

### Don't:
- **Don't** use pure black (`#000000`) for text or backgrounds; use Japanese Evergreen (`#1A3629`) and Parchment (`#FAF8F5`).
- **Don't** use generic AI side-tab borders on card containers; use dedicated structural elements for book spines.
- **Don't** use em-dashes or en-dashes in UI copy or documentation; use clear punctuation.
- **Don't** let offscreen drawer box-shadows bleed onto the canvas; always apply `opacity-0 invisible` when closed.