# Security, Quality & Performance Review (`securityandreview.md`): Cyath

## 1. Health & Behavioral Data Privacy

* **Data Minimization:** Store only operational habit metrics, macro figures, and subjective ratings (mood/energy 1–10). Never store sensitive biometric identifiers or medical diagnoses.
* **Client-Side Data Integrity:** When persisting state locally (e.g., IndexedDB or localStorage for offline-first capability), ensure data structures are scoped per user session and sanitized prior to cloud sync.
* **Export & Purge Capability:** Provide endpoints/controls allowing users to instantly purge sequential daily logs or export their full dataset as structured JSON.

---

## 2. Authentication & Session Security

* **Session Management:** Secure HTTP-only, `SameSite=Lax`, `Secure` cookies for JWT session persistence to eliminate client-side XSS token extraction risks.
* **Route Protection:** Implement Next.js Edge Middleware (`middleware.ts`) to intercept unauthorized requests to `/dashboard/*` routes before layout tree evaluation.
* **Guest & Demo State Isolation:** Ensure hackathon guest/demo sessions operate on sandboxed mock identifiers without read/write access to production user tables.

---

## 3. API Hardening & Input Validation

* **Strict Schema Validation:** Every incoming API request payload must be validated using Zod schemas before touching business logic or database queries.

```typescript
import { z } from "zod";

export const DailyLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  habitsCompleted: z.record(z.boolean()),
  totalProteinLogged: z.number().min(0).max(500),
  sleepHours: z.number().min(0).max(24),
  energyLevel: z.number().int().min(1).max(10),
  moodScore: z.number().int().min(1).max(10),
  loggedRecipeIds: z.array(z.string().cuid()),
});

```

* **Rate Limiting:** Protect logging and authentication endpoints via IP-based sliding window rate limiters (Upstash Redis or in-memory token bucket) to prevent log-stuffing.
* **SQL/NoSQL Injection Mitigation:** Rely exclusively on parameterized queries via ORM (Prisma / Mongoose); never interpolate raw strings into query bodies.

---

## 4. Frontend Performance & Rendering Audits

### 4.1 Glassmorphism GPU Overhead

* **Blur Containment:** Limit nested `backdrop-filter: blur()` containers. Apply blurs only to top-level card shells rather than child elements inside lists.
* **Hardware Acceleration:** Force GPU rasterization for animated elements using `will-change: transform` without causing layer explosion.
* **Performance Fallback:** Apply media queries (`@media (prefers-reduced-motion: reduce)`) to disable floating wave keyframe loops for accessibility and low-power hardware.

### 4.2 Pixel Art Integrity & Asset Loading

* **Crisp-Edge Scaling:** Prevent browser bilinear interpolation from blurring pixel art by enforcing `image-rendering: pixelated` across all asset wrappers.
* **Image Optimization:** Serve pixel assets via modern WebP formats or optimized SVG sprites with explicit layout widths/heights to eliminate Cumulative Layout Shift (CLS).

---

## 5. Code Quality & Review Checklist

* [ ] **TypeScript Strict Mode:** `"strict": true` enforced in `tsconfig.json` with zero use of `any`.
* [ ] **Hydration Safety:** Ensure dynamic client-side dates (e.g., local day timestamps) do not trigger Next.js SSR hydration mismatches.
* [ ] **Contrast Compliance:** Verify that high-contrast inverted CTAs (`#FFFFFF` on `#000000`) and secondary text (`#94A3B8` on `#0B0F17`) meet WCAG AA standards ($>4.5:1$ ratio).
* [ ] **Error Boundaries:** Wrap dashboard widgets and analytics modules in React Error Boundaries to prevent a calculation failure from breaking the main habit logging UI.