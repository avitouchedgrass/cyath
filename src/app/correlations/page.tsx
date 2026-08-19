'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { useHabitStore } from '@/store/useHabitStore';
import { deriveCorrelations, CorrelationResult } from '@/lib/correlation';
import {
  TrendingUp,
  Sparkles,
  Zap,
  ArrowLeft,
  Calendar,
  Activity,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  Award,
} from 'lucide-react';

export default function CorrelationsPage() {
  const [timeHorizon, setTimeHorizon] = useState<7 | 14 | 30>(14);
  const [selectedCorrelationId, setSelectedCorrelationId] = useState<string>('protein-focus');
  const [mounted, setMounted] = useState(false);

  const { logsByDate } = useHabitStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const correlations = useMemo(() => {
    return deriveCorrelations(logsByDate, timeHorizon);
  }, [logsByDate, timeHorizon]);

  const activeCorrelation = correlations.find((c) => c.id === selectedCorrelationId) || correlations[0];

  return (
    <div className="min-h-screen bg-[#080808] text-neutral-100 selection:bg-white selection:text-black flex flex-col">
      {/* Background Ambient Radial Highlights */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(circle at 50% 10%, rgba(255, 255, 255, 0.02) 0%, transparent 60%)
          `,
        }}
      />

      <HeaderNav />

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 lg:px-12 pt-28 sm:pt-32 pb-24">
        
        {/* Navigation & Header Strip */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-mono px-4 py-1.5 rounded-full border border-white/10 bg-white text-black font-semibold hover:bg-neutral-200 transition-all shadow-sm"
          >
            <span>Daily Console</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Hero Section Header */}
        <div className="max-w-3xl mb-6">
          <h1 className="font-serif font-normal text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            Behavioral Correlations
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base mt-3 leading-relaxed font-sans max-w-2xl">
            Mathematical Pearson correlation analysis calculated between your physical routines and subjective cognitive outputs. Reveal the high-leverage drivers behind your energy.
          </p>
        </div>

        {/* Dedicated Time Horizon Selector Row */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/10 mb-6 w-fit">
          {([7, 14, 30] as const).map((days) => (
            <button
              key={days}
              onClick={() => setTimeHorizon(days)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                timeHorizon === days
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'bg-transparent text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {days}D Window
            </button>
          ))}
        </div>

        {/* 1. Primary Highlight Stats Banner (4 Key Signals) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-5 shadow-lg">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
              Top Positive Driver
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-white tracking-tight">+34%</span>
              <span className="text-xs text-neutral-400 font-sans">High Protein</span>
            </div>
            <p className="text-[11px] text-neutral-500 font-sans mt-2">
              Days with &gt;120g protein correlate with 8.8+ focus score.
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-5 shadow-lg">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
              Sleep Sweet Spot
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-white tracking-tight">7.5h–8.5h</span>
            </div>
            <p className="text-[11px] text-neutral-500 font-sans mt-2">
              Produces +2.8 pt higher morning subjective alertness.
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-5 shadow-lg">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
              Keystone Habit Effect
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-white tracking-tight">88%</span>
              <span className="text-xs text-neutral-400 font-sans">Lock-in</span>
            </div>
            <p className="text-[11px] text-neutral-500 font-sans mt-2">
              Completing Sunlight &amp; Water unlocks full protocol adherence.
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-5 shadow-lg">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
              Data Confidence
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-white tracking-tight">96%</span>
              <span className="text-xs text-emerald-400 font-mono">r = 0.84</span>
            </div>
            <p className="text-[11px] text-neutral-500 font-sans mt-2">
              Based on {timeHorizon}-day rolling telemetry logs.
            </p>
          </div>
        </div>

        {/* 2. Interactive Correlation Model Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          
          {/* Left Column: Correlation Factor Selector Tabs */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 px-1 mb-1">
              Active Correlation Models
            </span>

            {correlations.map((item) => {
              const isSelected = item.id === activeCorrelation.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedCorrelationId(item.id)}
                  className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer text-left ${
                    isSelected
                      ? 'bg-white/[0.05] border-white/30 shadow-xl'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-xs font-mono text-white font-medium">
                      Pearson r = {item.coefficient}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 bg-white/5 px-2 py-0.5 rounded border border-white/5 shrink-0">
                      {item.impactScore}
                    </span>
                  </div>

                  <h3 className="font-serif font-normal text-base text-white tracking-tight leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-neutral-400 text-xs font-sans mt-1 line-clamp-2">
                    {item.subtitle}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Column: Deep Scatter Telemetry Matrix */}
          <div className="lg:col-span-8 backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-white" />
                    <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                      Statistical Regression Model
                    </span>
                  </div>
                  <h2 className="font-serif font-normal text-2xl text-white tracking-tight">
                    {activeCorrelation.title}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-white">r = {activeCorrelation.coefficient}</div>
                    <div className="text-[10px] font-mono text-emerald-400">Strong Correlation</div>
                  </div>
                </div>
              </div>

              {/* Scatter Matrix Canvas Visualization */}
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 mb-6">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-4">
                  <span>Y-Axis: {activeCorrelation.yLabel}</span>
                  <span>X-Axis: {activeCorrelation.xLabel}</span>
                </div>

                {/* Plot Area with Trendline and Scatter Dots */}
                <div className="h-56 w-full relative border-b border-l border-white/10 flex items-end justify-between px-6 pb-2 pt-6">
                  {/* Diagonal Guide Line */}
                  <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="w-full h-full border-t border-dashed border-white transform rotate-[-18deg] origin-bottom-left" />
                  </div>

                  {/* Scatter Data Points */}
                  {activeCorrelation.points.map((pt, idx) => {
                    const normalizedY = Math.min(90, Math.max(10, ((pt.y - 4) / 6) * 100));
                    const normalizedX = (idx / Math.max(1, activeCorrelation.points.length - 1)) * 90 + 5;

                    return (
                      <div
                        key={idx}
                        className="absolute group/point"
                        style={{
                          left: `${normalizedX}%`,
                          bottom: `${normalizedY}%`,
                        }}
                      >
                        <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-black ring-2 ring-white/30 cursor-pointer transform group-hover/point:scale-150 transition-transform shadow-md" />
                        
                        {/* Tooltip on Hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/point:block z-30 px-2.5 py-1 rounded-lg bg-black border border-white/20 text-[10px] font-mono text-white whitespace-nowrap shadow-2xl">
                          {pt.date}: {pt.label || `${pt.x} → ${pt.y}`}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Base Anchor Axis Border */}
                <div className="border-t border-neutral-800 pt-2.5 mt-2 flex justify-between text-[10px] font-mono text-neutral-500">
                  <span>Lower Input Range</span>
                  <span>Calculated Linear Regression Fit</span>
                  <span>Optimal Target Zone</span>
                </div>
              </div>

              {/* Analytical Breakdown & Directives */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
                    Observed Impact
                  </span>
                  <p className="text-xs text-neutral-200 font-sans leading-relaxed">
                    {activeCorrelation.description}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
                    Tactical Recommendation
                  </span>
                  <p className="text-xs text-neutral-200 font-sans leading-relaxed">
                    {activeCorrelation.recommendation}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400">
                Confidence: {activeCorrelation.confidence}% ({activeCorrelation.sampleSize} data points)
              </span>

              <Link
                href="/protocols"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-white hover:text-neutral-300 transition-colors"
              >
                <span>Adjust Protocols</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 px-6 text-center text-xs text-neutral-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-medium text-white tracking-tight">Cyath</span>
            <span>— Pixel-Perfect Health</span>
          </div>
          <div>Built with Next.js, Supabase & Tailwind CSS</div>
        </div>
      </footer>
    </div>
  );
}
