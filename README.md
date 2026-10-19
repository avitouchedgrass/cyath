# Cyath

> **AI Chronobiology & Preventative Metabolic Health Engine**

Cyath is a multimodal AI health platform that applies clinical chronobiology and real-time biostatistics to help people **detect subclinical metabolic dysfunction earlier, understand their circadian biology, and live with chronic fatigue more easily** — aligned with the 2017 Nobel Prize in Physiology or Medicine on circadian clocks.

---

## Clinical Problem Statement

**1 in 3 adults** has subclinical metabolic dysfunction (insulin resistance, circadian desynchrony, or chronic fatigue) with **zero clinical diagnosis** — because symptoms only become measurable on bloodwork after years of silent accumulation.

The earliest warning signals manifest behaviorally:
- Postprandial glucose crashes (the 2 PM energy collapse)
- Circadian phase drift (inconsistent sleep-wake windows)
- Declining protein floor adherence (accelerating muscle catabolism)

Cyath intercepts these signals in real-time and surfaces them as actionable clinical insights before irreversible metabolic damage occurs.

---

## Core AI & Clinical Features

### 1. Multimodal Chrononutrition AI (Gemini-Powered)
Natural language and photo-based meal input is analyzed by a clinical Gemini LLM pipeline that goes beyond calorie counting to surface:
- **`glycemicRisk`** — *Low / Moderate / Spike Risk* based on meal glycemic index profile and fiber/protein buffering
- **`circadianImpact`** — Contextual sentence mapping meal macronutrients to circadian metabolic physiology (mTOR activation window, postprandial insulin sensitivity, adenosine clearance)
- **`allostaticScore`** — 1–5 systemic metabolic load index

### 2. Chrono-Metabolic Biostatistics Engine (Pearson r² Interactive Matrix)
A client-side Pearson correlation engine plots individual biomarker inputs against fatigue and vitality outcomes:
- **Postprandial Amino-Acid Floor** vs. **Vitality Index**
- **Circadian Phase Consistency** (sleep-wake window adherence) vs. **Peak Cognitive Output**
- **Adenosine Clearance Window** (caffeine cutoff timing) vs. **Deep Sleep Quality**
- **Morning Photonic Lux Latency** (sunlight timing) vs. **Cortisol Awakening Response Proxy**

Users drag biomarker nodes in real-time to simulate how changing one circadian input propagates through their metabolic outcome.

### 3. Adaptive Allostatic Pacing Protocol (Clinical Fatigue Management)
For users presenting chronic fatigue, burnout, or post-exertional malaise signals, Cyath implements an **evidence-based pacing protocol** that automatically downscales daily habit workload:
- Monitors biometric signals: sleep duration < 5.5h, rested rating ≤ 2/10, energy score collapse
- Activates a stripped "Recovery Sprint" protocol (15-minute essential habit floor)
- Eliminates punitive streak resets — instead applying Kintsugi-philosophy progressive re-entry
- Directly applicable to **CFS/ME, Long COVID, and burnout recovery** populations

### 4. Circadian Biomarker Daily Log
Structured daily check-in capturing the five core chronobiological anchors:
- **Morning Photonic Lux Latency** — outdoor light within wake window
- **Adenosine Half-Life Management** — caffeine cutoff 10–12 hours pre-sleep
- **Protein Metabolic Floor** — per-meal amino acid targets calibrated to body mass
- **Sleep Architecture Window** — consistent circadian phase via sleep/wake timestamps
- **Subjective Vitality Index** — 1–10 energy and mood scoring for pattern detection

---

## How It Addresses the Hackathon Brief

| UnivaBio Criterion | Cyath's Clinical Response |
| :--- | :--- |
| **Detect illness earlier** | Glycemic risk scoring and allostatic load index surface early metabolic dysfunction markers before clinical bloodwork thresholds are breached |
| **Understand it better** | Pearson r² biostatistics engine visually correlates circadian inputs to fatigue outcomes — making complex chronobiology tangible and interactive |
| **Live with it more easily** | Adaptive allostatic pacing protocol automatically governs daily workload for chronic fatigue, ME/CFS, and Long COVID populations |

---

## Technical Architecture

```
[ Multimodal Input Layer ]
  Natural language meal text  ──┐
  Camera / photo meal scan    ──┤──► Gemini 3.1 Clinical Chrononutrition AI
  Circadian biometric log     ──┘         │
                                          ▼
                               [ Clinical Biomarker Engine ]
                               glycemicRisk · circadianImpact · allostaticScore
                                          │
                                          ▼
                               [ Pearson r² Correlation Matrix ]
                               Postprandial Amino-Acid Floor vs. Vitality Index
                               Circadian Phase Consistency vs. Cognitive Output
                                          │
                                          ▼
                               [ Adaptive Allostatic Pacing ]
                               Fatigue detection → Recovery Protocol activation
                                          │
                                          ▼
                               [ Supabase BaaS + Zustand Local-First State ]
                               Optimistic UI updates · Cloud sync · Row-level security
```

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS, Cabinet Grotesk / Inter / JetBrains Mono |
| **State** | Zustand (local-first optimistic updates) |
| **Backend** | Next.js API Routes (Node.js runtime) |
| **Database** | Supabase (PostgreSQL + Row Level Security) |
| **AI Layer** | Google Gemini 3.1 Flash (multimodal NLP + vision) |
| **PWA** | Web App Manifest, Service Worker, mobile-first |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase project (free tier sufficient)
- Gemini API key (Google AI Studio — free)

### Installation

```bash
git clone https://github.com/your-username/cyath.git
cd cyath
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## Scientific References

1. Hall, J.C. et al. (2017). Nobel Prize in Physiology or Medicine — Molecular mechanisms controlling circadian rhythm.
2. Chaix, A. et al. (2019). Time-Restricted Eating to Prevent and Manage Chronic Metabolic Diseases. *Annual Review of Nutrition*.
3. Leproult, R. & Van Cauter, E. (2010). Role of Sleep and Sleep Loss in Hormonal Release and Metabolism. *Endocrine Development*.
4. Panda, S. (2020). *The Circadian Code*. Rodale Books.

---

## License

MIT License — open for educational and research use.
