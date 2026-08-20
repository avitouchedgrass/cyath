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
    badge: 'Step 01 · Blueprints',
    title: 'Choose Proven Daily Blueprints',
    description:
      'Start with science-backed daily routines you can actually stick to—like Morning Sunlight, Clean Protein Fueling, and Restful Sleep Wind-Downs.',
    icon: Sliders,
    highlights: ['Simple daily habits', 'Personalized protein targets', 'Zero overwhelming clutter'],
  },
  {
    step: '02',
    badge: 'Step 02 · 30-Sec Check-in',
    title: 'Fast, Frictionless Daily Check-In',
    description:
      'No barcode scanning or weighing every gram. Tap quick steppers (+15g, +30g protein), track your water, and rate how energized you feel in under a minute.',
    icon: Zap,
    highlights: ['Quick one-tap logging', 'Easy 1–10 mood & energy check', 'No tracking burnout'],
  },
  {
    step: '03',
    badge: 'Step 03 · See Patterns',
    title: 'Discover What Fuels Your Good Days',
    description:
      'Cyath connects the dots between what you eat, how you sleep, and your peak focus days—so you know exactly which habits make you feel great.',
    icon: TrendingUp,
    highlights: ['Clear food-to-energy insights', 'Interactive visual charts', 'Real momentum without guesswork'],
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
  const [heroTheme, setHeroTheme] = useState<'light' | 'dark'>('dark');
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
  const isLight = heroTheme === 'light';

  return (
    <div className={`relative min-h-screen overflow-hidden flex flex-col transition-colors duration-300 ${
      isLight ? 'bg-[#F4F0EA] text-[#1A3629]' : 'bg-[#111914] text-[#F4F0EA]'
    }`}>
      {/* Global Navigation Header with Light/Dark Mode Switcher */}
      <HeaderNav 
        themeMode={heroTheme} 
        onToggleTheme={() => setHeroTheme((prev) => (prev === 'light' ? 'dark' : 'light'))} 
      />

      {/* Main Page Content */}
      <main className="relative z-10 flex-1 flex flex-col">
        
        {/* ========================================================================= */}
        {/* 1. HERO SECTION: Unboxed Retro Neobrutalism (Light / Dark Adaptable) */}
        {/* ========================================================================= */}
        <section 
          className={`px-6 lg:px-12 pt-32 sm:pt-36 lg:pt-40 pb-20 sm:pb-28 border-b-4 transition-colors duration-300 ${
            isLight
              ? 'bg-[#F4F0EA] border-[#1A3629] text-[#1A3629]'
              : 'bg-[#111914] border-[#F4F0EA] text-[#F4F0EA]'
          }`}
        >
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Hero Left Column: Clean Unboxed Typography & Chunky Neobrutalist CTAs */}
            <div className="lg:col-span-6 w-full flex flex-col items-start justify-center">
              
              {/* Headline with High-Contrast Vintage Serif & Typewriter */}
              <h1 
                className={`font-fraunces font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1] min-h-[90px] sm:min-h-[110px] ${
                  isLight ? 'text-[#1A3629]' : 'text-[#F4F0EA]'
                }`}
              >
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
                  cursorClassName={isLight ? "bg-[#1A3629]" : "bg-[#F4F0EA]"}
                />
              </h1>
              
              {/* Editorial Body Text in Cabinet Grotesk */}
              <p 
                className={`font-cabinet font-medium text-base sm:text-lg leading-relaxed mt-6 max-w-xl ${
                  isLight ? 'text-[#2C4A3B]' : 'text-[#C2CDBF]'
                }`}
              >
                Log whole-food fuel, track daily routines in 30 seconds, and let our simple pattern engine uncover what drives your best energy days.
              </p>

              {/* Primary & Secondary Chunky Neobrutalist CTAs */}
              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                <Link href={isLoggedIn ? "/dashboard" : "/auth"} className="w-full sm:w-auto">
                  <button
                    type="button"
                    className={`w-full sm:w-auto font-cabinet font-bold text-base sm:text-lg px-8 py-4 rounded-xl border-4 transition-all cursor-pointer inline-flex items-center justify-center ${
                      isLight
                        ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-[5px_5px_0px_#3A6B52] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#3A6B52] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none'
                        : 'bg-[#F4F0EA] text-[#111914] border-[#F4F0EA] shadow-[5px_5px_0px_#D9A036] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#D9A036] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none'
                    }`}
                  >
                    {isLoggedIn ? "Visit Your Dashboard" : "Start Calibration — Free"}
                  </button>
                </Link>

                <Link href="/protocols" className="w-full sm:w-auto">
                  <button
                    type="button"
                    className={`w-full sm:w-auto font-cabinet font-bold text-base sm:text-lg px-8 py-4 rounded-xl border-4 transition-all cursor-pointer inline-flex items-center justify-center ${
                      isLight
                        ? 'bg-[#FFFDF9] text-[#1A3629] border-[#1A3629] shadow-[5px_5px_0px_#1A3629] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#1A3629] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none'
                        : 'bg-[#1A261E] text-[#F4F0EA] border-[#F4F0EA] shadow-[5px_5px_0px_#F4F0EA] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#F4F0EA] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none'
                    }`}
                  >
                    Browse Blueprints
                  </button>
                </Link>
              </div>

              {/* Bottom Metric Inset Micro-Cards */}
              <div 
                className={`mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3.5 pt-6 border-t-2 w-full ${
                  isLight ? 'border-[#1A3629]/15' : 'border-[#F4F0EA]/20'
                }`}
              >
                
                {/* Micro-Card 1: Streak Heatmap Preview */}
                <div 
                  className={`border-2 rounded-xl p-4 sm:p-5 flex flex-col justify-between h-full min-h-[105px] transition-all ${
                    isLight 
                      ? 'bg-[#FFFDF9] border-[#1A3629] shadow-[3px_3px_0px_#1A3629]'
                      : 'bg-[#1A261E] border-[#F4F0EA] shadow-[3px_3px_0px_#F4F0EA]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    {[1, 0.65, 0.85, 1, 0.5, 1, 1].map((opacity, i) => (
                      <span 
                        key={i} 
                        className={`h-3 w-3 rounded-xs ${isLight ? 'bg-[#1A3629]' : 'bg-[#F4F0EA]'}`} 
                        style={{ opacity }} 
                      />
                    ))}
                  </div>
                  <div>
                    <div 
                      className={`font-cabinet font-bold text-xs uppercase tracking-wide ${
                        isLight ? 'text-[#1A3629]' : 'text-[#8F9E8B]'
                      }`}
                    >
                      Streak Heatmaps
                    </div>
                    <div 
                      className={`font-mono text-[11px] mt-0.5 ${
                        isLight ? 'text-[#2C4A3B]' : 'text-[#F4F0EA]'
                      }`}
                    >
                      Gentle consistency
                    </div>
                  </div>
                </div>

                {/* Micro-Card 2: Macro Fueling Preview */}
                <div 
                  className={`border-2 rounded-xl p-4 sm:p-5 flex flex-col justify-between h-full min-h-[105px] overflow-hidden transition-all ${
                    isLight 
                      ? 'bg-[#FFFDF9] border-[#1A3629] shadow-[3px_3px_0px_#1A3629]'
                      : 'bg-[#1A261E] border-[#F4F0EA] shadow-[3px_3px_0px_#F4F0EA]'
                  }`}
                >
                  <div 
                    key={currentDish.id}
                    className={`font-mono font-bold text-sm tabular-nums tracking-tight mb-1 whitespace-nowrap animate-stat-flip ${
                      isLight ? 'text-[#1A3629]' : 'text-[#F4F0EA]'
                    }`}
                  >
                    {currentDish.protein} PRO · {currentDish.calories} KCAL
                  </div>
                  <div>
                    <div 
                      className={`font-cabinet font-bold text-xs uppercase tracking-wide ${
                        isLight ? 'text-[#1A3629]' : 'text-[#8F9E8B]'
                      }`}
                    >
                      Whole-Food Fuel
                    </div>
                    <div 
                      className={`font-mono text-[11px] mt-0.5 ${
                        isLight ? 'text-[#2C4A3B]' : 'text-[#C2CDBF]'
                      }`}
                    >
                      16-bit hearty dishes
                    </div>
                  </div>
                </div>

                {/* Micro-Card 3: Energy Rating Preview */}
                <div 
                  className={`border-2 rounded-xl p-4 sm:p-5 flex flex-col justify-between h-full min-h-[105px] overflow-hidden transition-all ${
                    isLight 
                      ? 'bg-[#FFFDF9] border-[#1A3629] shadow-[3px_3px_0px_#1A3629]'
                      : 'bg-[#1A261E] border-[#F4F0EA] shadow-[3px_3px_0px_#F4F0EA]'
                  }`}
                >
                  <div 
                    key={`focus-${currentDish.id}`}
                    className={`font-mono font-bold text-sm tabular-nums tracking-tight mb-1 flex items-center gap-1 whitespace-nowrap animate-stat-flip ${
                      isLight ? 'text-[#1A3629]' : 'text-[#F4F0EA]'
                    }`}
                  >
                    <span>{currentDish.focus}</span>
                    <span 
                      className={`text-[10px] font-mono font-normal uppercase ${
                        isLight ? 'text-[#2C4A3B]' : 'text-[#8F9E8B]'
                      }`}
                    >
                      Focus Rating
                    </span>
                  </div>
                  <div>
                    <div 
                      className={`font-cabinet font-bold text-xs uppercase tracking-wide ${
                        isLight ? 'text-[#1A3629]' : 'text-[#8F9E8B]'
                      }`}
                    >
                      Energy Links
                    </div>
                    <div 
                      className={`font-mono text-[11px] mt-0.5 ${
                        isLight ? 'text-[#2C4A3B]' : 'text-[#C2CDBF]'
                      }`}
                    >
                      Routine × mood insights
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Hero Right Column: Massive Unboxed Pixel Art Showcase with 8-Bit Audio & Wipes */}
            <div className="lg:col-span-6 w-full flex items-center justify-center lg:justify-end">
              <PixelShowcase 
                themeMode={heroTheme}
                onDishChange={(dish) => setCurrentDish(dish)} 
              />
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. THE 3-STEP ROUTINE: "How Cyath Works" */}
        {/* ========================================================================= */}
        <section 
          id="methodology"
          className={`px-6 lg:px-12 py-20 sm:py-28 border-b-4 transition-colors duration-300 ${
            isLight ? 'border-[#1A3629] bg-[#EFE9DF]' : 'border-[#F4F0EA] bg-[#0E1510]'
          }`}
        >
          <div className="w-full max-w-7xl mx-auto">
            
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
              <span className={`px-4 py-1.5 rounded-full border-2 text-xs font-mono font-bold uppercase tracking-widest mb-4 inline-block ${
                isLight 
                  ? 'bg-[#FFFDF9] border-[#1A3629] text-[#1A3629] shadow-[2px_2px_0px_#1A3629]' 
                  : 'bg-[#1A261E] border-[#F4F0EA] text-[#F4F0EA] shadow-[2px_2px_0px_#D9A036]'
              }`}>
                Simple 3-Step Routine
              </span>
              <h2 className={`font-fraunces font-black text-3xl sm:text-4xl md:text-5xl tracking-tight ${
                isLight ? 'text-[#1A3629]' : 'text-[#F4F0EA]'
              }`}>
                Built for Everyday Momentum
              </h2>
              <p className={`text-base sm:text-lg mt-4 font-cabinet font-medium leading-relaxed max-w-xl mx-auto ${
                isLight ? 'text-[#2C4A3B]' : 'text-[#C2CDBF]'
              }`}>
                Skip the complex spreadsheets. Cyath turns 30-second daily habits into clear insights on how to feel your best.
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
                    className={`border-3 p-8 rounded-2xl flex flex-col justify-between gap-4 transition-all duration-300 cursor-pointer focus-visible:outline-none hover:-translate-y-1 ${
                      isLight
                        ? isActive
                          ? 'bg-[#FFFDF9] border-[#1A3629] shadow-[6px_6px_0px_#1A3629]'
                          : 'bg-[#FFFDF9]/80 border-[#1A3629] shadow-[4px_4px_0px_#1A3629]'
                        : isActive
                          ? 'bg-[#1A261E] border-[#F4F0EA] shadow-[6px_6px_0px_#D9A036]'
                          : 'bg-[#1A261E]/80 border-[#F4F0EA] shadow-[4px_4px_0px_#F4F0EA]'
                    }`}
                  >
                    <div>
                      {/* Step Number & Badge */}
                      <div className="flex items-center justify-between mb-6">
                        <span className={`font-mono text-3xl font-black tracking-tight tabular-nums ${
                          isLight ? 'text-[#1A3629]' : 'text-[#F4F0EA]'
                        }`}>
                          {item.step}
                        </span>
                        <span className={`px-3 py-1 rounded-full border-2 text-[11px] font-mono font-bold uppercase tracking-wider ${
                          isLight
                            ? 'bg-[#F4F0EA] border-[#1A3629] text-[#1A3629]'
                            : 'bg-[#111914] border-[#F4F0EA] text-[#F4F0EA]'
                        }`}>
                          {item.badge}
                        </span>
                      </div>

                      {/* Title & Icon */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                          isLight 
                            ? 'bg-[#F4F0EA] border-[#1A3629] text-[#1A3629]' 
                            : 'bg-[#111914] border-[#F4F0EA] text-[#F4F0EA]'
                        }`}>
                          <Icon className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <h3 className={`font-cabinet font-bold text-xl tracking-tight leading-snug ${
                          isLight ? 'text-[#1A3629]' : 'text-[#F4F0EA]'
                        }`}>
                          {item.title}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className={`text-sm font-cabinet font-medium leading-relaxed mb-6 ${
                        isLight ? 'text-[#2C4A3B]' : 'text-[#C2CDBF]'
                      }`}>
                        {item.description}
                      </p>
                    </div>

                    {/* Highlights */}
                    <div className={`space-y-2.5 pt-4 border-t-2 ${
                      isLight ? 'border-[#1A3629]/15' : 'border-[#F4F0EA]/15'
                    }`}>
                      {item.highlights.map((point) => (
                        <div key={point} className={`flex items-center gap-2.5 text-xs sm:text-sm font-cabinet font-bold ${
                          isLight ? 'text-[#1A3629]' : 'text-[#F4F0EA]'
                        }`}>
                          <span className={`font-mono text-xs shrink-0 select-none ${
                            isLight ? 'text-[#3A6B52]' : 'text-[#D9A036]'
                          }`}>+</span>
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
        {/* 3. INTERACTIVE BENTO SHOWCASE: Fuel, Patterns & Energy */}
        {/* ========================================================================= */}
        <section className={`px-6 lg:px-12 py-20 sm:py-28 border-b-4 transition-colors duration-300 ${
          isLight ? 'border-[#1A3629] bg-[#F4F0EA]' : 'border-[#F4F0EA] bg-[#111914]'
        }`}>
          <div className="w-full max-w-7xl mx-auto">
            
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className={`px-4 py-1.5 rounded-full border-2 text-xs font-mono font-bold uppercase tracking-widest mb-4 inline-block ${
                isLight 
                  ? 'bg-[#FFFDF9] border-[#1A3629] text-[#1A3629] shadow-[2px_2px_0px_#1A3629]' 
                  : 'bg-[#1A261E] border-[#F4F0EA] text-[#F4F0EA] shadow-[2px_2px_0px_#D9A036]'
              }`}>
                What You Get
              </span>
              <h2 className={`font-fraunces font-black text-3xl sm:text-4xl md:text-5xl tracking-tight ${
                isLight ? 'text-[#1A3629]' : 'text-[#F4F0EA]'
              }`}>
                Designed for Daily Energy
              </h2>
              <p className={`text-base sm:text-lg mt-4 font-cabinet font-medium leading-relaxed max-w-xl mx-auto ${
                isLight ? 'text-[#2C4A3B]' : 'text-[#C2CDBF]'
              }`}>
                Everything you need to sustain steady focus and physical momentum, gathered in one straightforward space.
              </p>
            </div>

            {/* Bento Grid (Tactile Retro Neobrutalist Cards) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* BENTO 1: Food & Focus Patterns (8 Cols) */}
              <div className={`lg:col-span-8 border-3 rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
                isLight
                  ? 'bg-[#FFFDF9] border-[#1A3629] shadow-[5px_5px_0px_#1A3629]'
                  : 'bg-[#1A261E] border-[#F4F0EA] shadow-[5px_5px_0px_#D9A036]'
              }`}>
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <div className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center shrink-0 ${
                          isLight ? 'bg-[#F4F0EA] border-[#1A3629] text-[#1A3629]' : 'bg-[#111914] border-[#F4F0EA] text-[#F4F0EA]'
                        }`}>
                          <TrendingUp className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <h3 className={`font-cabinet font-bold text-xl tracking-tight ${
                          isLight ? 'text-[#1A3629]' : 'text-[#F4F0EA]'
                        }`}>
                          Food &amp; Focus Patterns
                        </h3>
                      </div>
                      <p className={`text-xs sm:text-sm font-cabinet font-medium ${
                        isLight ? 'text-[#2C4A3B]' : 'text-[#C2CDBF]'
                      }`}>
                        See the direct connection between your protein fuel and your peak focus days.
                      </p>
                    </div>

                    <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 text-xs font-mono font-bold shrink-0 ${
                      isLight 
                        ? 'bg-[#F4F0EA] border-[#1A3629] text-[#1A3629]' 
                        : 'bg-[#111914] border-[#F4F0EA] text-[#D9A036]'
                    }`}>
                      <span>Strong Link:</span>
                      <span className="tabular-nums">84% Match</span>
                    </div>
                  </div>

                  {/* Interactive Scatter Simulation Area */}
                  <div className={`h-56 sm:h-64 w-full border-2 rounded-xl p-4 relative overflow-hidden mb-4 ${
                    isLight ? 'bg-[#F4F0EA] border-[#1A3629]/20' : 'bg-[#111914] border-[#F4F0EA]/20'
                  }`}>
                    {/* SVG Trendline */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                      <line
                        x1="10%"
                        y1="82%"
                        x2="90%"
                        y2="18%"
                        stroke={isLight ? '#1A3629' : '#D9A036'}
                        strokeWidth="3"
                        strokeDasharray="6 6"
                      />
                    </svg>

                    {/* Scatter Points */}
                    <div className="relative w-full h-full">
                      {SAMPLE_SCATTER_POINTS.map((pt, i) => {
                        const isSelected = selectedScatterPoint === i;
                        const leftPct = 10 + (i / 6) * 80;
                        const bottomPct = 15 + (i / 6) * 70;

                        return (
                          <button
                            key={pt.label}
                            type="button"
                            aria-label={`Data point for ${pt.x}g protein with ${pt.y} focus rating`}
                            onClick={() => setSelectedScatterPoint(i)}
                            className="absolute -translate-x-1/2 translate-y-1/2 p-2.5 cursor-pointer transition-transform hover:scale-125 focus-visible:outline-none rounded-full"
                            style={{ left: `${leftPct}%`, bottom: `${bottomPct}%` }}
                          >
                            <span
                              className={`block rounded-full transition-all border-2 ${
                                isLight
                                  ? isSelected
                                    ? 'w-5 h-5 bg-[#1A3629] border-[#FFFDF9] shadow-[2px_2px_0px_#1A3629]'
                                    : 'w-3.5 h-3.5 bg-[#FFFDF9] border-[#1A3629]'
                                  : isSelected
                                    ? 'w-5 h-5 bg-[#D9A036] border-[#F4F0EA] shadow-[2px_2px_0px_#D9A036]'
                                    : 'w-3.5 h-3.5 bg-[#1A261E] border-[#F4F0EA]'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>

                    {/* Active point hover pill */}
                    {selectedScatterPoint !== null && (
                      <div className={`absolute top-4 left-4 p-3 rounded-xl border-2 text-xs font-mono shadow-md ${
                        isLight 
                          ? 'bg-[#FFFDF9] border-[#1A3629] text-[#1A3629]' 
                          : 'bg-[#111914] border-[#F4F0EA] text-[#F4F0EA]'
                      }`}>
                        <span className="block text-[10px] uppercase font-bold tracking-wider opacity-70">
                          {SAMPLE_SCATTER_POINTS[selectedScatterPoint].label} Discovery
                        </span>
                        <span className="font-bold tabular-nums">
                          {SAMPLE_SCATTER_POINTS[selectedScatterPoint].x}g Protein → {SAMPLE_SCATTER_POINTS[selectedScatterPoint].y} / 10 Focus
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className={`flex items-center justify-between pt-4 border-t-2 text-xs font-mono font-bold ${
                  isLight ? 'border-[#1A3629]/15 text-[#2C4A3B]' : 'border-[#F4F0EA]/15 text-[#C2CDBF]'
                }`}>
                  <span>Daily habit &amp; meal insights</span>
                  <Link href="/correlations" className="hover:underline flex items-center gap-1">
                    <span>View All Discoveries</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* BENTO 2: 16-Bit Food Fuel (4 Cols) */}
              <div className={`lg:col-span-4 border-3 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                isLight
                  ? 'bg-[#FFFDF9] border-[#1A3629] shadow-[5px_5px_0px_#1A3629]'
                  : 'bg-[#1A261E] border-[#F4F0EA] shadow-[5px_5px_0px_#D9A036]'
              }`}>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center shrink-0 ${
                      isLight ? 'bg-[#F4F0EA] border-[#1A3629] text-[#1A3629]' : 'bg-[#111914] border-[#F4F0EA] text-[#F4F0EA]'
                    }`}>
                      <Sparkles className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <h3 className={`font-cabinet font-bold text-xl tracking-tight ${
                      isLight ? 'text-[#1A3629]' : 'text-[#F4F0EA]'
                    }`}>
                      16-Bit Food Fuel
                    </h3>
                  </div>
                  <p className={`text-xs sm:text-sm font-cabinet font-medium mb-6 ${
                    isLight ? 'text-[#2C4A3B]' : 'text-[#C2CDBF]'
                  }`}>
                    Curated whole-food recipes with step-by-step prep and retro pixel art.
                  </p>

                  <div className={`p-4 rounded-xl border-2 space-y-3 ${
                    isLight ? 'bg-[#F4F0EA] border-[#1A3629]/20' : 'bg-[#111914] border-[#F4F0EA]/20'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-cabinet font-bold">Spiced Paneer Protein Bowl</span>
                      <span className="text-[11px] font-mono font-bold tabular-nums">48g PRO</span>
                    </div>
                    <div className={`h-2.5 w-full rounded-full border overflow-hidden ${
                      isLight ? 'bg-[#FFFDF9] border-[#1A3629]' : 'bg-[#1A261E] border-[#F4F0EA]'
                    }`}>
                      <div className={`h-full w-3/4 ${isLight ? 'bg-[#1A3629]' : 'bg-[#D9A036]'}`} />
                    </div>
                    <span className="text-[11px] font-cabinet font-medium block leading-relaxed opacity-85">
                      Clean plant protein and nourishing fats for sustained energy.
                    </span>
                  </div>
                </div>

                <Link
                  href="/recipes"
                  className={`mt-6 inline-flex items-center justify-between w-full text-xs font-mono font-bold pt-4 border-t-2 transition-colors ${
                    isLight ? 'border-[#1A3629]/15 hover:text-[#3A6B52]' : 'border-[#F4F0EA]/15 hover:text-[#D9A036]'
                  }`}
                >
                  <span>Browse Recipes Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* BENTO 3: Zero-Stress Streaks (4 Cols) */}
              <div className={`lg:col-span-4 border-3 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                isLight
                  ? 'bg-[#FFFDF9] border-[#1A3629] shadow-[5px_5px_0px_#1A3629]'
                  : 'bg-[#1A261E] border-[#F4F0EA] shadow-[5px_5px_0px_#D9A036]'
              }`}>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center shrink-0 ${
                      isLight ? 'bg-[#F4F0EA] border-[#1A3629] text-[#1A3629]' : 'bg-[#111914] border-[#F4F0EA] text-[#F4F0EA]'
                    }`}>
                      <Flame className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <h3 className={`font-cabinet font-bold text-xl tracking-tight ${
                      isLight ? 'text-[#1A3629]' : 'text-[#F4F0EA]'
                    }`}>
                      Stress-Free Streaks
                    </h3>
                  </div>
                  <p className={`text-xs sm:text-sm font-cabinet font-medium mb-6 ${
                    isLight ? 'text-[#2C4A3B]' : 'text-[#C2CDBF]'
                  }`}>
                    Gentle pixel shading shows your consistency without guilt trips if you take a day off.
                  </p>

                  <div className={`grid grid-cols-7 gap-1.5 p-3 rounded-xl border-2 ${
                    isLight ? 'bg-[#F4F0EA] border-[#1A3629]/20' : 'bg-[#111914] border-[#F4F0EA]/20'
                  }`}>
                    {Array.from({ length: 28 }).map((_, i) => {
                      const opacity = [0.2, 0.45, 0.75, 0.9, 1.0, 0.6, 0.85][i % 7];
                      return (
                        <div
                          key={i}
                          className={`h-5 rounded-md transition-opacity hover:opacity-100 ${
                            isLight ? 'bg-[#1A3629]' : 'bg-[#F4F0EA]'
                          }`}
                          style={{ opacity }}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className={`pt-4 border-t-2 text-[11px] font-mono font-bold ${
                  isLight ? 'border-[#1A3629]/15 text-[#2C4A3B]' : 'border-[#F4F0EA]/15 text-[#C2CDBF]'
                }`}>
                  28-Day Habit Activity Matrix
                </div>
              </div>

              {/* BENTO 4: Daily Energy Journal (8 Cols) */}
              <div className={`lg:col-span-8 border-3 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                isLight
                  ? 'bg-[#FFFDF9] border-[#1A3629] shadow-[5px_5px_0px_#1A3629]'
                  : 'bg-[#1A261E] border-[#F4F0EA] shadow-[5px_5px_0px_#D9A036]'
              }`}>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center shrink-0 ${
                      isLight ? 'bg-[#F4F0EA] border-[#1A3629] text-[#1A3629]' : 'bg-[#111914] border-[#F4F0EA] text-[#F4F0EA]'
                    }`}>
                      <Activity className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <h3 className={`font-cabinet font-bold text-xl tracking-tight ${
                      isLight ? 'text-[#1A3629]' : 'text-[#F4F0EA]'
                    }`}>
                      Daily Energy Journal
                    </h3>
                  </div>
                  <p className={`text-xs sm:text-sm font-cabinet font-medium mb-6 ${
                    isLight ? 'text-[#2C4A3B]' : 'text-[#C2CDBF]'
                  }`}>
                    Rate your daily energy, focus depth, and rest with simple retro dials.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-xl border-2 space-y-2 ${
                      isLight ? 'bg-[#F4F0EA] border-[#1A3629]/20' : 'bg-[#111914] border-[#F4F0EA]/20'
                    }`}>
                      <div className="flex items-center justify-between text-xs font-mono font-bold">
                        <span>Daily Energy</span>
                        <span className="tabular-nums">{previewEnergy} / 10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        aria-label="Adjust preview energy rating on 1 to 10 scale"
                        value={previewEnergy}
                        onChange={(e) => setPreviewEnergy(Number(e.target.value))}
                        className={`w-full cursor-pointer focus-visible:outline-none ${
                          isLight ? 'accent-[#1A3629]' : 'accent-[#D9A036]'
                        }`}
                      />
                    </div>

                    <div className={`p-4 rounded-xl border-2 space-y-2 ${
                      isLight ? 'bg-[#F4F0EA] border-[#1A3629]/20' : 'bg-[#111914] border-[#F4F0EA]/20'
                    }`}>
                      <div className="flex items-center justify-between text-xs font-mono font-bold">
                        <span>Focus Rating</span>
                        <span className="tabular-nums">{previewFocus} / 10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        aria-label="Adjust preview focus rating on 1 to 10 scale"
                        value={previewFocus}
                        onChange={(e) => setPreviewFocus(Number(e.target.value))}
                        className={`w-full cursor-pointer focus-visible:outline-none ${
                          isLight ? 'accent-[#1A3629]' : 'accent-[#D9A036]'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className={`flex items-center justify-between pt-4 mt-6 border-t-2 text-xs font-mono font-bold ${
                  isLight ? 'border-[#1A3629]/15' : 'border-[#F4F0EA]/15'
                }`}>
                  <span>Synced directly to your Daily Planner</span>
                  <Link href="/dashboard" className="hover:underline flex items-center gap-1">
                    <span>Open Dashboard</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. THE DIFFERENCE: Why Old-School Trackers Fail */}
        {/* ========================================================================= */}
        <section className={`px-6 lg:px-12 py-20 sm:py-28 border-b-4 transition-colors duration-300 ${
          isLight ? 'border-[#1A3629] bg-[#EFE9DF]' : 'border-[#F4F0EA] bg-[#0E1510]'
        }`}>
          <div className="w-full max-w-5xl mx-auto">
            
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className={`px-4 py-1.5 rounded-full border-2 text-xs font-mono font-bold uppercase tracking-widest mb-4 inline-block ${
                isLight 
                  ? 'bg-[#FFFDF9] border-[#1A3629] text-[#1A3629] shadow-[2px_2px_0px_#1A3629]' 
                  : 'bg-[#1A261E] border-[#F4F0EA] text-[#F4F0EA] shadow-[2px_2px_0px_#D9A036]'
              }`}>
                The Difference
              </span>
              <h2 className={`font-fraunces font-black text-3xl sm:text-4xl md:text-5xl tracking-tight ${
                isLight ? 'text-[#1A3629]' : 'text-[#F4F0EA]'
              }`}>
                Why Old-School Apps Burn You Out
              </h2>
              <p className={`text-base sm:text-lg mt-4 font-cabinet font-medium leading-relaxed max-w-xl mx-auto ${
                isLight ? 'text-[#2C4A3B]' : 'text-[#C2CDBF]'
              }`}>
                Most health platforms are built like rigid spreadsheets. Cyath is made for ease, speed, and real momentum.
              </p>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              
              {/* Old-School Apps (Dull & Dashed) */}
              <div className={`border-3 border-dashed rounded-2xl p-8 flex flex-col justify-between h-full space-y-6 opacity-75 ${
                isLight ? 'bg-[#FFFDF9]/40 border-[#1A3629]/40' : 'bg-transparent border-[#F4F0EA]/30'
              }`}>
                <div>
                  <div className="flex items-center gap-2.5 mb-5">
                    <span className="font-mono text-xs font-bold select-none">[x]</span>
                    <h3 className="font-cabinet font-bold text-lg tracking-tight">
                      Traditional Calorie &amp; Habit Apps
                    </h3>
                  </div>
                  
                  <ul className="space-y-4 text-xs sm:text-sm font-cabinet font-medium leading-relaxed">
                    <li className="flex items-start gap-2.5">
                      <span className="font-mono text-xs mt-0.5 shrink-0 select-none">[-]</span>
                      <span>10+ minutes spent scanning barcodes, weighing individual grams, and guessing recipes.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="font-mono text-xs mt-0.5 shrink-0 select-none">[-]</span>
                      <span>Aggressive red alerts and guilt-tripping notifications that punish you for missing a day.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="font-mono text-xs mt-0.5 shrink-0 select-none">[-]</span>
                      <span>No useful takeaways: you log data for months and learn nothing about what actually fuels you.</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t-2 border-dashed border-current/15 font-mono text-[11px]">
                  Old Routine · High Friction
                </div>
              </div>

              {/* The Cyath Way (Tactile & Solid) */}
              <div className={`border-3 rounded-2xl p-8 flex flex-col justify-between h-full space-y-6 ${
                isLight
                  ? 'bg-[#FFFDF9] border-[#1A3629] shadow-[6px_6px_0px_#1A3629]'
                  : 'bg-[#1A261E] border-[#F4F0EA] shadow-[6px_6px_0px_#D9A036]'
              }`}>
                <div>
                  <div className="flex items-center gap-2.5 mb-5">
                    <span className="font-mono text-xs font-bold select-none">[+]</span>
                    <h3 className="font-cabinet font-bold text-lg tracking-tight">
                      The Cyath Approach
                    </h3>
                  </div>
                  
                  <ul className="space-y-4 text-xs sm:text-sm font-cabinet font-medium leading-relaxed">
                    <li className="flex items-start gap-2.5">
                      <span className="font-mono text-xs mt-0.5 shrink-0 select-none">[+]</span>
                      <span>30-second rapid check-ins with one-tap whole-food macro increments (+15g / 30g / 45g).</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="font-mono text-xs mt-0.5 shrink-0 select-none">[+]</span>
                      <span>Gentle activity heatmaps that celebrate long-term consistency without anxiety.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="font-mono text-xs mt-0.5 shrink-0 select-none">[+]</span>
                      <span>Clear patterns that reveal which foods and routines give you steady all-day focus.</span>
                    </li>
                  </ul>
                </div>

                <div className={`pt-4 border-t-2 font-mono text-[11px] flex items-center justify-between font-bold ${
                  isLight ? 'border-[#1A3629]/15' : 'border-[#F4F0EA]/15'
                }`}>
                  <span>Everyday Standard</span>
                  <span className="font-bold">Stress-Free Momentum →</span>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. FINALE CTA BANNER */}
        {/* ========================================================================= */}
        <section className={`px-6 lg:px-12 py-20 sm:py-28 ${
          isLight ? 'bg-[#F4F0EA]' : 'bg-[#111914]'
        }`}>
          <div className={`w-full max-w-5xl mx-auto border-4 rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden ${
            isLight
              ? 'bg-[#FFFDF9] border-[#1A3629] shadow-[8px_8px_0px_#1A3629]'
              : 'bg-[#1A261E] border-[#F4F0EA] shadow-[8px_8px_0px_#D9A036]'
          }`}>
            <h2 className={`font-fraunces font-black text-3xl sm:text-4xl md:text-5xl tracking-tight max-w-2xl mx-auto leading-tight ${
              isLight ? 'text-[#1A3629]' : 'text-[#F4F0EA]'
            }`}>
              Build Daily Habits You Actually Enjoy
            </h2>

            <p className={`text-base sm:text-lg mt-4 max-w-xl mx-auto font-cabinet font-medium leading-relaxed ${
              isLight ? 'text-[#2C4A3B]' : 'text-[#C2CDBF]'
            }`}>
              Join hundreds creating sustainable daily energy with whole-food fuel and simple 30-second check-ins.
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={isLoggedIn ? "/dashboard" : "/auth"} className="w-full sm:w-auto">
                <button
                  type="button"
                  className={`w-full sm:w-auto font-cabinet font-bold text-base sm:text-lg px-8 py-4 rounded-xl border-4 transition-all cursor-pointer inline-flex items-center justify-center ${
                    isLight
                      ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-[5px_5px_0px_#3A6B52] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#3A6B52] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none'
                      : 'bg-[#F4F0EA] text-[#111914] border-[#F4F0EA] shadow-[5px_5px_0px_#D9A036] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#D9A036] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none'
                  }`}
                >
                  {isLoggedIn ? "Visit Your Dashboard" : "Start Calibration — Free"}
                </button>
              </Link>

              <Link href="/dashboard" className="w-full sm:w-auto">
                <button
                  type="button"
                  className={`w-full sm:w-auto font-cabinet font-bold text-base sm:text-lg px-8 py-4 rounded-xl border-4 transition-all cursor-pointer inline-flex items-center justify-center ${
                    isLight
                      ? 'bg-[#FFFDF9] text-[#1A3629] border-[#1A3629] shadow-[5px_5px_0px_#1A3629] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#1A3629] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none'
                      : 'bg-[#1A261E] text-[#F4F0EA] border-[#F4F0EA] shadow-[5px_5px_0px_#F4F0EA] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#F4F0EA] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none'
                  }`}
                >
                  Explore Live Demo
                </button>
              </Link>
            </div>

          </div>
        </section>

      </main>

      {/* ========================================================================= */}
      {/* 6. RETRO FIELD-GUIDE FOOTER */}
      {/* ========================================================================= */}
      <footer className={`relative z-10 border-t-4 pt-16 pb-12 px-6 lg:px-12 transition-colors duration-300 ${
        isLight ? 'border-[#1A3629] bg-[#EFE9DF]' : 'border-[#F4F0EA] bg-[#0E1510]'
      }`}>
        <div className={`max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b-2 ${
          isLight ? 'border-[#1A3629]/20' : 'border-[#F4F0EA]/20'
        }`}>
          
          {/* Col 1 & 2: Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className={`font-fraunces font-black text-2xl tracking-tight ${
                isLight ? 'text-[#1A3629]' : 'text-[#F4F0EA]'
              }`}>
                Cyath
              </span>
              <span className={`px-2.5 py-0.5 rounded-full border-2 text-[10px] font-mono font-bold ${
                isLight ? 'bg-[#FFFDF9] border-[#1A3629] text-[#1A3629]' : 'bg-[#1A261E] border-[#F4F0EA] text-[#F4F0EA]'
              }`}>
                v1.0 Retro
              </span>
            </div>
            <p className={`text-xs font-cabinet font-medium max-w-sm leading-relaxed ${
              isLight ? 'text-[#2C4A3B]' : 'text-[#C2CDBF]'
            }`}>
              A simple daily habit and nutrition journal built on 30-second check-ins, whole-food recipes, and clear personal discoveries.
            </p>
          </div>

          {/* Col 3: Platform */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider">Platform</div>
            <ul className={`space-y-2 text-xs font-cabinet font-bold ${
              isLight ? 'text-[#2C4A3B]' : 'text-[#C2CDBF]'
            }`}>
              <li>
                <Link href="/dashboard" className="hover:underline">Daily Planner</Link>
              </li>
              <li>
                <Link href="/correlations" className="hover:underline">Personal Discoveries</Link>
              </li>
              <li>
                <Link href="/protocols" className="hover:underline">Daily Blueprints</Link>
              </li>
              <li>
                <Link href="/recipes" className="hover:underline">Whole-Food Recipes</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Protocols */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider">Blueprints</div>
            <ul className={`space-y-2 text-xs font-cabinet font-bold ${
              isLight ? 'text-[#2C4A3B]' : 'text-[#C2CDBF]'
            }`}>
              <li>
                <Link href="/protocols" className="hover:underline">Morning Sunlight &amp; Energy</Link>
              </li>
              <li>
                <Link href="/protocols" className="hover:underline">Restful Sleep Wind-Down</Link>
              </li>
              <li>
                <Link href="/protocols" className="hover:underline">Deep Focus Sprint</Link>
              </li>
              <li>
                <Link href="/protocols" className="hover:underline">Daily Movement &amp; Posture</Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Account & Settings */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider">Account</div>
            <ul className={`space-y-2 text-xs font-cabinet font-bold ${
              isLight ? 'text-[#2C4A3B]' : 'text-[#C2CDBF]'
            }`}>
              <li>
                <Link href="/auth" className="hover:underline">Sign Up</Link>
              </li>
              <li>
                <Link href="/login" className="hover:underline">Log In</Link>
              </li>
              <li>
                <Link href="/profile" className="hover:underline">Profile &amp; Settings</Link>
              </li>
              <li>
                <Link href="/onboarding" className="hover:underline">Personalize Goals</Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className={`max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono font-bold ${
          isLight ? 'text-[#2C4A3B]' : 'text-[#8F9E8B]'
        }`}>
          <div>© {new Date().getFullYear()} Cyath. Handcrafted with retro precision.</div>
          <div>Zero tracking cookies · Secure local &amp; cloud storage</div>
        </div>
      </footer>
    </div>
  );
}
