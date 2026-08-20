'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { PixelShowcase, DISH_ITEMS, DishData } from '@/components/landing/PixelShowcase';
import { TextType } from '@/components/reactbits/TextType';
import { SpecularButton } from '@/components/reactbits/SpecularButton';
import { useHabitStore } from '@/store/useHabitStore';
import {
  Flame,
  Activity,
  Sparkles,
  Zap,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Sliders,
  Moon,
  Dumbbell,
  ShieldCheck,
  ChevronRight,
  Layers,
  BarChart3,
  Clock,
  Heart,
  X,
  Check,
} from 'lucide-react';

const STEP_LOOP = [
  {
    step: '01',
    badge: 'Protocol Selection',
    title: 'Calibrate Proven Blueprints',
    description:
      'Choose curated behavioral routines tailored to your biology—from Morning Sunlight & Electrolytes to Deep REM Sleep architecture and High-Protein fueling.',
    icon: Sliders,
    highlights: ['Personalized macro baselines', 'Circadian light synchronization', 'Zero generic boilerplate'],
  },
  {
    step: '02',
    badge: '30-Second Input',
    title: 'Frictionless Daily Logging',
    description:
      'No tedious multi-ingredient barcode scanning. Log whole-food protein with instant steppers (+15g, +30g), track hydration in liters, and rate subjective focus in seconds.',
    icon: Zap,
    highlights: ['One-tap macro increments', 'Subjective 1–10 state sliders', 'Zero cognitive fatigue'],
  },
  {
    step: '03',
    badge: 'Mathematical Discovery',
    title: 'Uncover Peak Performance Drivers',
    description:
      'Our correlation engine computes continuous least-squares regression models mapping your nutritional intake directly against cognitive focus and subjective energy ratings.',
    icon: TrendingUp,
    highlights: ['Least-squares regression fit', 'Continuous value scatter plots', 'Actionable behavioral momentum'],
  },
];

const SAMPLE_SCATTER_POINTS = [
  { x: 90, y: 5.2, label: 'Day 1' },
  { x: 110, y: 5.8, label: 'Day 2' },
  { x: 130, y: 6.9, label: 'Day 3' },
  { x: 145, y: 7.4, label: 'Day 4' },
  { x: 160, y: 8.2, label: 'Day 5' },
  { x: 175, y: 8.9, label: 'Day 6' },
  { x: 190, y: 9.4, label: 'Day 7' },
];

export default function Home() {
  const [currentDish, setCurrentDish] = useState<DishData>(DISH_ITEMS[0]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [selectedScatterPoint, setSelectedScatterPoint] = useState<number | null>(4);
  const [previewEnergy, setPreviewEnergy] = useState(8);
  const [previewFocus, setPreviewFocus] = useState(9);
  const [mounted, setMounted] = useState(false);

  const { userSession } = useHabitStore();

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCurrentDish((prev) => {
        const idx = DISH_ITEMS.findIndex((d) => d.id === prev.id);
        return DISH_ITEMS[(idx + 1) % DISH_ITEMS.length];
      });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const isLoggedIn = mounted && !!userSession;

  return (
    <div className="relative min-h-screen bg-[#080808] overflow-hidden flex flex-col text-neutral-100 selection:bg-white selection:text-black">
      {/* Pure Neutral Monochrome Subtle Ambient Radial Glows */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 50% 15%, rgba(255, 255, 255, 0.03) 0%, transparent 60%),
            radial-gradient(circle at 85% 75%, rgba(255, 255, 255, 0.015) 0%, transparent 55%)
          `
        }}
      />

      {/* Global Navigation Header */}
      <HeaderNav />

      {/* Main Page Content */}
      <main className="relative z-10 flex-1 flex flex-col">
        
        {/* ========================================================================= */}
        {/* 1. HERO SECTION: Premium-Playful Retro Neobrutalism Hero Staging */}
        {/* ========================================================================= */}
        <section className="bg-[#F4F0EA] px-6 lg:px-12 pt-32 sm:pt-36 lg:pt-40 pb-20 sm:pb-28 border-b-4 border-[#1A3629]">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Hero Left Column: Physical Tactile Content Tile */}
            <div className="lg:col-span-6 w-full flex justify-center lg:justify-start">
              <div className="w-full max-w-2xl bg-[#FFFDF9] border-4 border-[#1A3629] rounded-3xl p-8 sm:p-10 lg:p-12 shadow-[8px_8px_0px_#1A3629] flex flex-col items-start relative">
                
                {/* Headline with High-Contrast Vintage Serif & Typewriter */}
                <h1 className="font-fraunces font-black text-4xl sm:text-5xl lg:text-6xl text-[#1A3629] tracking-tight leading-[1.1] min-h-[90px] sm:min-h-[110px]">
                  <TextType
                    text={[
                      "Pixel-Perfect Health.",
                      "Calibrated for High Performance.",
                      "Behavioral Momentum Engineered."
                    ]}
                    typingSpeed={45}
                    deletingSpeed={25}
                    pauseDuration={2400}
                    startOnVisible={true}
                    cursorClassName="bg-[#1A3629]"
                  />
                </h1>
                
                {/* Body Text in Cabinet Grotesk */}
                <p className="font-cabinet font-medium text-base sm:text-lg text-[#2C4A3B] leading-relaxed mt-5 max-w-xl">
                  Log whole-food fuel, track daily routines in 30 seconds, and let our continuous correlation engine uncover what drives your peak energy days.
                </p>

                {/* Primary & Secondary Chunky Neobrutalist CTAs */}
                <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                  <Link href={isLoggedIn ? "/dashboard" : "/auth"} className="w-full sm:w-auto">
                    <button
                      type="button"
                      className="w-full sm:w-auto bg-[#1A3629] text-[#FFFDF9] border-4 border-[#1A3629] font-cabinet font-bold text-base sm:text-lg px-8 py-4 rounded-xl shadow-[5px_5px_0px_#3A6B52] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#3A6B52] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none transition-all cursor-pointer inline-flex items-center justify-center"
                    >
                      {isLoggedIn ? "Visit Your Dashboard" : "Start Calibration — Free"}
                    </button>
                  </Link>

                  <Link href="/protocols" className="w-full sm:w-auto">
                    <button
                      type="button"
                      className="w-full sm:w-auto bg-[#FFFDF9] text-[#1A3629] border-4 border-[#1A3629] font-cabinet font-bold text-base sm:text-lg px-8 py-4 rounded-xl shadow-[5px_5px_0px_#1A3629] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#1A3629] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none transition-all cursor-pointer inline-flex items-center justify-center"
                    >
                      Browse Blueprints
                    </button>
                  </Link>
                </div>

                {/* Bottom Metric Inset Micro-Cards */}
                <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3.5 pt-6 border-t-2 border-[#1A3629]/15 w-full">
                  
                  {/* Micro-Card 1: Streak Heatmap Preview */}
                  <div className="bg-[#F4F0EA] border-2 border-[#1A3629] rounded-xl p-4 shadow-[3px_3px_0px_#1A3629] flex flex-col justify-between min-h-[105px]">
                    <div className="flex items-center gap-1.5 mb-2">
                      {[1, 0.65, 0.85, 1, 0.5, 1, 1].map((opacity, i) => (
                        <span 
                          key={i} 
                          className="h-3 w-3 rounded-xs bg-[#1A3629]" 
                          style={{ opacity }} 
                        />
                      ))}
                    </div>
                    <div>
                      <div className="font-cabinet font-bold text-[#1A3629] text-xs uppercase tracking-wide">
                        Streak Heatmaps
                      </div>
                      <div className="font-mono text-[#2C4A3B] text-[11px] mt-0.5">
                        Monochrome consistency
                      </div>
                    </div>
                  </div>

                  {/* Micro-Card 2: Macro Fueling Preview */}
                  <div className="bg-[#F4F0EA] border-2 border-[#1A3629] rounded-xl p-4 shadow-[3px_3px_0px_#1A3629] flex flex-col justify-between min-h-[105px] overflow-hidden">
                    <div 
                      key={currentDish.id}
                      className="font-mono font-bold text-[#1A3629] text-sm tabular-nums tracking-tight mb-1 whitespace-nowrap animate-stat-flip"
                    >
                      {currentDish.protein} PRO · {currentDish.calories} KCAL
                    </div>
                    <div>
                      <div className="font-cabinet font-bold text-[#1A3629] text-xs uppercase tracking-wide">
                        Macro-Fueling
                      </div>
                      <div className="font-mono text-[#2C4A3B] text-[11px] mt-0.5">
                        16-bit whole food targets
                      </div>
                    </div>
                  </div>

                  {/* Micro-Card 3: Energy Rating Preview */}
                  <div className="bg-[#F4F0EA] border-2 border-[#1A3629] rounded-xl p-4 shadow-[3px_3px_0px_#1A3629] flex flex-col justify-between min-h-[105px] overflow-hidden">
                    <div 
                      key={`focus-${currentDish.id}`}
                      className="font-mono font-bold text-[#1A3629] text-sm tabular-nums tracking-tight mb-1 flex items-center gap-1 whitespace-nowrap animate-stat-flip"
                    >
                      <span>{currentDish.focus}</span>
                      <span className="text-[10px] text-[#2C4A3B] font-mono font-normal uppercase">Focus Index</span>
                    </div>
                    <div>
                      <div className="font-cabinet font-bold text-[#1A3629] text-xs uppercase tracking-wide">
                        Energy Correlation
                      </div>
                      <div className="font-mono text-[#2C4A3B] text-[11px] mt-0.5">
                        Routine × state insights
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Hero Right Column: Massive Unboxed Pixel Art Showcase with 8-Bit Audio & Wipes */}
            <div className="lg:col-span-6 w-full flex items-center justify-center lg:justify-end">
              <PixelShowcase onDishChange={(dish) => setCurrentDish(dish)} />
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. THE 3-STEP BEHAVIORAL LOOP: "How Cyath Works" */}
        {/* ========================================================================= */}
        <section className="px-6 lg:px-12 py-20 sm:py-28 border-t border-white/[0.06] bg-white/[0.01]">
          <div className="w-full max-w-7xl mx-auto">
            
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-4 inline-block">
                The Methodology
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-[-0.02em] text-white">
                The 3-Step Behavioral Loop
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mt-4 font-sans leading-relaxed">
                Traditional habit apps burn you out with tedious entry. Cyath transforms frictionless 30-second daily logs into quantitative performance intelligence.
              </p>
            </div>

            {/* 3 Interactive Step Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {STEP_LOOP.map((item, idx) => {
                const Icon = item.icon;
                const isActive = activeStepIndex === idx;

                return (
                  <div
                    key={item.step}
                    role="button"
                    tabIndex={0}
                    aria-label={`Step ${item.step}: ${item.title}`}
                    onMouseEnter={() => setActiveStepIndex(idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveStepIndex(idx);
                      }
                    }}
                    className={`backdrop-blur-md bg-white/[0.02] border p-8 rounded-2xl flex flex-col justify-between gap-4 transition-all duration-300 cursor-pointer focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none hover:border-white/20 hover:bg-white/[0.03] hover:-translate-y-1 ${
                      isActive
                        ? 'border-white/25 bg-white/[0.035] shadow-2xl ring-1 ring-white/15'
                        : 'border-white/10'
                    }`}
                  >
                    <div>
                      {/* Step Number & Badge */}
                      <div className="flex items-center justify-between mb-6">
                        <span className="font-mono text-3xl font-bold text-white tracking-tight tabular-nums">
                          {item.step}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300 uppercase tracking-wider">
                          {item.badge}
                        </span>
                      </div>

                      {/* Title & Icon (Cabinet Grotesk, No Truncation) */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0 mt-0.5">
                          <Icon className="w-4 h-4" />
                        </div>
                        <h3 className="font-cabinet font-bold text-xl text-slate-100 tracking-tight leading-snug">
                          {item.title}
                        </h3>
                      </div>

                      {/* Description with Breathing Room */}
                      <p className="text-slate-400 text-sm font-sans leading-relaxed mb-6">
                        {item.description}
                      </p>
                    </div>

                    {/* High-Tech Calibration Highlights (Strict Monochrome) */}
                    <div className="space-y-2.5 pt-4 border-t border-white/5">
                      {item.highlights.map((point) => (
                        <div key={point} className="flex items-center gap-2.5 text-sm text-slate-400 font-sans">
                          <span className="font-mono text-xs text-slate-500 shrink-0 select-none">+</span>
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. INTERACTIVE BENTO SHOWCASE: Correlation Engine, Fuel & Telemetry */}
        {/* ========================================================================= */}
        <section className="px-6 lg:px-12 py-20 sm:py-28 border-t border-white/[0.06]">
          <div className="w-full max-w-7xl mx-auto">
            
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-4 inline-block">
                Feature Architecture
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white">
                Engineered for High Agency
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mt-4 font-sans leading-relaxed">
                Everything you need to sustain physical energy and deep cognitive focus, calibrated into one unified system.
              </p>
            </div>

            {/* Bento Grid (Asymmetric Layout with Unified Tokens) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* BENTO 1: Real-Time Correlation Engine (8 Cols) */}
              <div className="lg:col-span-8 backdrop-blur-xl bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between relative overflow-hidden transition-colors duration-300 group">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-300 shrink-0">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <h3 className="font-cabinet font-bold text-lg sm:text-xl text-slate-100 tracking-tight">
                          The Correlation Engine
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-400 font-sans">
                        Least-squares mathematical regression mapping whole-food fueling vs. peak focus ratings.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono shrink-0">
                      <span className="text-slate-400">Model Fit:</span>
                      <span className="text-slate-200 font-bold tabular-nums">R² = 0.84 (+34%)</span>
                    </div>
                  </div>

                  {/* Interactive Scatter Simulation Area with Accessible Touch Targets */}
                  <div className="h-56 sm:h-64 w-full bg-black/40 border border-white/10 rounded-xl p-4 relative overflow-hidden mb-4">
                    {/* SVG Trendline */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                      <line
                        x1="10%"
                        y1="82%"
                        x2="90%"
                        y2="18%"
                        stroke="rgba(255, 255, 255, 0.35)"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />
                    </svg>

                    {/* Scatter Points with Resilient Touch/Keyboard Targets */}
                    <div className="relative w-full h-full">
                      {SAMPLE_SCATTER_POINTS.map((pt, i) => {
                        const isSelected = selectedScatterPoint === i;
                        const leftPct = 10 + (i / 6) * 80;
                        const bottomPct = 15 + (i / 6) * 70;

                        return (
                          <button
                            key={pt.label}
                            type="button"
                            aria-label={`Data point for ${pt.x} grams protein with ${pt.y} focus rating`}
                            onClick={() => setSelectedScatterPoint(i)}
                            className="absolute -translate-x-1/2 translate-y-1/2 p-2.5 cursor-pointer transition-transform hover:scale-125 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none rounded-full"
                            style={{ left: `${leftPct}%`, bottom: `${bottomPct}%` }}
                          >
                            <span
                              className={`block rounded-full transition-all ${
                                isSelected
                                  ? 'w-4 h-4 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] ring-2 ring-white/40'
                                  : 'w-3 h-3 bg-neutral-500 hover:bg-white'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>

                    {/* Active point hover pill */}
                    {selectedScatterPoint !== null && (
                      <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-black/85 border border-white/15 backdrop-blur-md text-xs font-mono shadow-lg">
                        <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Selected Data Point</span>
                        <span className="text-white font-bold tabular-nums">
                          {SAMPLE_SCATTER_POINTS[selectedScatterPoint].x}g Protein → {SAMPLE_SCATTER_POINTS[selectedScatterPoint].y} / 10 Focus
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs font-mono text-slate-400">
                  <span>Continuous X/Y value calibration</span>
                  <Link href="/correlations" className="text-white hover:underline flex items-center gap-1">
                    <span>Explore Full Engine</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* BENTO 2: 16-Bit Whole-Food Nutrition (4 Cols) */}
              <div className="lg:col-span-4 backdrop-blur-xl bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between transition-colors duration-300">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-300 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h3 className="font-cabinet font-bold text-lg sm:text-xl text-slate-100 tracking-tight">
                      16-Bit Food Fuel
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 font-sans mb-6">
                    Curated whole-food recipes illustrated with crisp retro pixel art. No generic ingredient guesswork.
                  </p>

                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-white font-semibold">Spiced Paneer Protein Bowl</span>
                      <span className="text-[10px] font-mono text-slate-300 font-bold tabular-nums">48g PRO</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-white w-3/4" />
                    </div>
                    <span className="text-[11px] text-slate-400 font-sans block leading-relaxed">
                      Bioavailable plant protein and healthy fats for sustained executive focus.
                    </span>
                  </div>
                </div>

                <Link
                  href="/recipes"
                  className="mt-6 inline-flex items-center justify-between w-full text-xs font-mono text-slate-400 hover:text-white pt-4 border-t border-white/5 transition-colors"
                >
                  <span>View Recipe Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* BENTO 3: Monochrome Consistency Heatmaps (4 Cols) */}
              <div className="lg:col-span-4 backdrop-blur-xl bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between transition-colors duration-300">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-300 shrink-0">
                      <Flame className="w-4 h-4" />
                    </div>
                    <h3 className="font-cabinet font-bold text-lg sm:text-xl text-slate-100 tracking-tight">
                      Zero-Guilt Streaks
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 font-sans mb-6">
                    Monochrome opacity shades represent adherence without screaming red sirens or gamified pressure.
                  </p>

                  <div className="grid grid-cols-7 gap-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    {Array.from({ length: 28 }).map((_, i) => {
                      const opacity = [0.15, 0.4, 0.7, 0.9, 1.0, 0.6, 0.85][i % 7];
                      return (
                        <div
                          key={i}
                          className="h-5 rounded-md bg-white transition-opacity hover:opacity-100"
                          style={{ opacity }}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 text-[11px] font-mono text-slate-500">
                  Continuous habit momentum visualizer
                </div>
              </div>

              {/* BENTO 4: Circadian Telemetry & Subjective State (8 Cols) */}
              <div className="lg:col-span-8 backdrop-blur-xl bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between transition-colors duration-300">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-300 shrink-0">
                      <Activity className="w-4 h-4" />
                    </div>
                    <h3 className="font-cabinet font-bold text-lg sm:text-xl text-slate-100 tracking-tight">
                      Subjective State Telemetry
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 font-sans mb-6">
                    Calibrate daily energy, focus depth, and sleep quality on a clean 1–10 logarithmic scale.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-300">Subjective Energy</span>
                        <span className="text-white font-bold tabular-nums">{previewEnergy} / 10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        aria-label="Adjust preview energy rating on 1 to 10 scale"
                        value={previewEnergy}
                        onChange={(e) => setPreviewEnergy(Number(e.target.value))}
                        className="w-full accent-white cursor-pointer focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none"
                      />
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-300">Executive Focus</span>
                        <span className="text-white font-bold tabular-nums">{previewFocus} / 10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        aria-label="Adjust preview executive focus rating on 1 to 10 scale"
                        value={previewFocus}
                        onChange={(e) => setPreviewFocus(Number(e.target.value))}
                        className="w-full accent-white cursor-pointer focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-6 border-t border-white/5 text-xs font-mono text-slate-400">
                  <span>Direct integration with Daily Planner</span>
                  <Link href="/dashboard" className="text-white hover:underline flex items-center gap-1">
                    <span>Open Dashboard</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. THE MANIFESTO: Why Traditional Apps Fail */}
        {/* ========================================================================= */}
        <section className="px-6 lg:px-12 py-20 sm:py-28 border-t border-white/[0.06] bg-white/[0.01]">
          <div className="w-full max-w-5xl mx-auto">
            
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-4 inline-block">
                The Difference
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white">
                Why Legacy Trackers Fail You
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mt-4 font-sans leading-relaxed">
                Most health platforms are built like bloated spreadsheets. Cyath is engineered for speed, cognitive clarity, and quantitative insight.
              </p>
            </div>

            {/* Comparison Table Grid: Asymmetric Obsolete vs. Premium Illuminated */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              
              {/* Legacy Trackers (Obsolete & Dull) */}
              <div className="bg-transparent border border-dashed border-white/10 opacity-70 rounded-2xl p-8 flex flex-col justify-between h-full space-y-6">
                <div>
                  <div className="flex items-center gap-2.5 mb-5">
                    <span className="font-mono text-xs text-slate-600 select-none">[x]</span>
                    <h3 className="font-cabinet font-semibold text-lg text-slate-500 tracking-tight">
                      Traditional Calorie &amp; Habit Apps
                    </h3>
                  </div>
                  
                  <ul className="space-y-4 text-xs sm:text-sm text-slate-500 font-sans leading-relaxed">
                    <li className="flex items-start gap-2.5">
                      <span className="font-mono text-xs text-slate-600 mt-0.5 shrink-0 select-none">[-]</span>
                      <span>10+ minutes spent scanning barcodes, weighing individual grams, and guessing restaurant dishes.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="font-mono text-xs text-slate-600 mt-0.5 shrink-0 select-none">[-]</span>
                      <span>Aggressive red sirens and guilt-inducing notifications that punish you for missing a single day.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="font-mono text-xs text-slate-600 mt-0.5 shrink-0 select-none">[-]</span>
                      <span>No correlation intelligence: you log data for months and learn nothing about what actually drives your energy.</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-white/5 font-mono text-[11px] text-slate-600">
                  Legacy Paradigm · High Friction
                </div>
              </div>

              {/* The Cyath Protocol (Illuminated & Premium) */}
              <div className="backdrop-blur-xl bg-white/[0.04] border border-white/20 border-t-white/40 shadow-[0_0_30px_rgba(255,255,255,0.03)] relative overflow-hidden rounded-2xl p-8 flex flex-col justify-between h-full space-y-6">
                <div>
                  <div className="flex items-center gap-2.5 mb-5">
                    <span className="font-mono text-xs text-white select-none">[+]</span>
                    <h3 className="font-cabinet font-semibold text-lg text-white tracking-tight">
                      The Cyath Protocol
                    </h3>
                  </div>
                  
                  <ul className="space-y-4 text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                    <li className="flex items-start gap-2.5">
                      <span className="font-mono text-xs text-white mt-0.5 shrink-0 select-none">[+]</span>
                      <span>30-second rapid logging with one-tap whole-food macro increments (+15g/30g/45g).</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="font-mono text-xs text-white mt-0.5 shrink-0 select-none">[+]</span>
                      <span>Monochrome streak heatmaps that celebrate long-term momentum without gamified anxiety.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="font-mono text-xs text-white mt-0.5 shrink-0 select-none">[+]</span>
                      <span>Continuous scatter plot regression revealing exactly how protein and hydration unlock peak flow.</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-white/10 font-mono text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Engineered Standard</span>
                  <span className="text-white font-semibold">Zero-Guilt Feedback →</span>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. HIGH-CONVERSION FINALE CTA BANNER */}
        {/* ========================================================================= */}
        <section className="px-6 lg:px-12 py-20 sm:py-28 border-t border-white/[0.06]">
          <div className="w-full max-w-5xl mx-auto backdrop-blur-2xl bg-white/[0.02] border border-white/15 rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
            
            {/* Top specular glow */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-white max-w-2xl mx-auto">
              Calibrate Your Daily Behavioral Momentum
            </h2>

            <p className="text-neutral-400 text-sm sm:text-base mt-4 max-w-xl mx-auto font-sans leading-relaxed">
              Join high performers aligning whole-food nutrition, circadian timing, and cognitive focus with mathematical precision.
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={isLoggedIn ? "/dashboard" : "/auth"} className="w-full sm:w-auto">
                <SpecularButton
                  size="lg"
                  radius={20}
                  intensity={2.0}
                  className="w-full sm:w-auto text-sm sm:text-base font-medium tracking-tight shadow-xl"
                >
                  {isLoggedIn ? "Visit Your Dashboard" : "Start Calibration — Free"}
                </SpecularButton>
              </Link>

              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-3.5 rounded-[20px] bg-white/5 border border-white/10 hover:bg-white/10 text-neutral-200 transition-all text-sm sm:text-base font-medium tracking-tight text-center"
              >
                Explore Live Demo
              </Link>
            </div>

          </div>
        </section>

      </main>

      {/* ========================================================================= */}
      {/* 6. EXPANDED EDITORIAL FOOTER */}
      {/* ========================================================================= */}
      <footer className="relative z-10 border-t border-white/10 pt-16 pb-12 px-6 lg:px-12 bg-black/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-white/5">
          
          {/* Col 1 & 2: Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-serif font-normal text-xl text-white tracking-tight">Cyath</span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-neutral-300">
                v1.0
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-sans max-w-sm leading-relaxed">
              A high-agency behavioral momentum and nutrition intelligence platform. Built on frictionless logging and quantitative correlation discovery.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 pt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Col 3: Platform */}
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-white">Platform</div>
            <ul className="space-y-2 text-xs font-sans text-neutral-400">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">Daily Planner</Link>
              </li>
              <li>
                <Link href="/correlations" className="hover:text-white transition-colors">Correlation Engine</Link>
              </li>
              <li>
                <Link href="/protocols" className="hover:text-white transition-colors">Protocol Blueprints</Link>
              </li>
              <li>
                <Link href="/recipes" className="hover:text-white transition-colors">Whole-Food Recipes</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Protocols */}
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-white">Blueprints</div>
            <ul className="space-y-2 text-xs font-sans text-neutral-400">
              <li>
                <Link href="/protocols" className="hover:text-white transition-colors">Morning Sunlight &amp; Energy</Link>
              </li>
              <li>
                <Link href="/protocols" className="hover:text-white transition-colors">Deep REM Sleep</Link>
              </li>
              <li>
                <Link href="/protocols" className="hover:text-white transition-colors">High-Protein Hypertrophy</Link>
              </li>
              <li>
                <Link href="/protocols" className="hover:text-white transition-colors">Cognitive Flow State</Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Account & Security */}
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-white">Account</div>
            <ul className="space-y-2 text-xs font-sans text-neutral-400">
              <li>
                <Link href="/auth" className="hover:text-white transition-colors">Sign Up</Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">Log In</Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-white transition-colors">Profile &amp; Settings</Link>
              </li>
              <li>
                <Link href="/onboarding" className="hover:text-white transition-colors">Biometric Calibration</Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-500">
          <div>© {new Date().getFullYear()} Cyath. Designed with pixel-perfect precision.</div>
          <div>Zero tracking cookies · Encrypted Supabase storage</div>
        </div>
      </footer>
    </div>
  );
}
