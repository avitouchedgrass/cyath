'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { useHabitStore } from '@/store/useHabitStore';
import { deriveCorrelations, CorrelationResult } from '@/lib/correlation';
import { retroAudio } from '@/lib/retroAudio';
import {
  TrendingUp,
  Sparkles,
  Zap,
  ArrowLeft,
  Calendar,
  Activity,
  ArrowRight,
  ChevronRight,
  Award,
} from 'lucide-react';

export default function CorrelationsPage() {
  const [timeHorizon, setTimeHorizon] = useState<7 | 14 | 30>(14);
  const [selectedCorrelationId, setSelectedCorrelationId] = useState<string>('protein-focus');
  const [mounted, setMounted] = useState(false);

  const { themeMode, toggleThemeMode, logsByDate } = useHabitStore();

  const isLight = themeMode === 'light';

  useEffect(() => {
    setMounted(true);
  }, []);

  const correlations = useMemo(() => {
    return deriveCorrelations(logsByDate, timeHorizon);
  }, [logsByDate, timeHorizon]);

  const activeCorrelation = correlations.find((c) => c.id === selectedCorrelationId) || correlations[0];

  // Derive coordinate domains and trendline
  const { minX, maxX, minY, maxY, trendline } = useMemo(() => {
    const pts = activeCorrelation.points;
    if (!pts || pts.length === 0) {
      return { minX: 0, maxX: 150, minY: 1, maxY: 10, trendline: { y1: 82, y2: 18 } };
    }

    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);

    const rawMinX = Math.min(...xs);
    const rawMaxX = Math.max(...xs);
    const rawMinY = Math.min(...ys);
    const rawMaxY = Math.max(...ys);

    const padX = (rawMaxX - rawMinX) * 0.12 || 5;
    const padY = (rawMaxY - rawMinY) * 0.12 || 1;

    const domainMinX = Math.max(0, rawMinX - padX);
    const domainMaxX = rawMaxX + padX;
    const domainMinY = Math.max(0, rawMinY - padY);
    const domainMaxY = Math.min(10, rawMaxY + padY);

    const n = pts.length;
    const meanX = xs.reduce((a, b) => a + b, 0) / n;
    const meanY = ys.reduce((a, b) => a + b, 0) / n;

    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      num += (xs[i] - meanX) * (ys[i] - meanY);
      den += (xs[i] - meanX) * (xs[i] - meanX);
    }
    const m = den !== 0 ? num / den : 0;
    const b = meanY - m * meanX;

    const yStart = m * domainMinX + b;
    const yEnd = m * domainMaxX + b;

    const normalizePercentY = (val: number) => {
      const clamped = Math.min(domainMaxY, Math.max(domainMinY, val));
      return ((clamped - domainMinY) / (domainMaxY - domainMinY || 1)) * 76 + 12;
    };

    const y1 = 100 - normalizePercentY(yStart);
    const y2 = 100 - normalizePercentY(yEnd);

    return {
      minX: domainMinX,
      maxX: domainMaxX,
      minY: domainMinY,
      maxY: domainMaxY,
      trendline: { y1: Math.min(92, Math.max(8, y1)), y2: Math.min(92, Math.max(8, y2)) },
    };
  }, [activeCorrelation]);

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col ${
      isLight ? 'bg-[#F4F0EA] text-[#1B2A24]' : 'bg-[#131916] text-[#F4F0EA]'
    }`}>
      <HeaderNav 
        themeMode={themeMode} 
        onToggleTheme={toggleThemeMode} 
      />

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 lg:px-12 pt-28 pb-24">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-full border-2 transition-all ${
              isLight 
                ? 'bg-[#FFFDF9] border-[#1A3629] text-[#1A3629] shadow-[2px_2px_0px_#1A3629] hover:-translate-y-0.5' 
                : 'bg-[#1A261E] border-[#F4F0EA] text-[#F4F0EA] shadow-[2px_2px_0px_#D9A036] hover:-translate-y-0.5'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>

          <Link
            href="/dashboard"
            className={`inline-flex items-center gap-1.5 text-xs font-cabinet font-bold px-4 py-1.5 rounded-full border-2 transition-all cursor-pointer ${
              isLight
                ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-[3px_3px_0px_#3A6B52]'
                : 'bg-[#F4F0EA] text-[#111914] border-[#F4F0EA] shadow-[3px_3px_0px_#D9A036]'
            }`}
          >
            <span>Open Daily Planner</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Hero Section Header */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className={`px-3 py-1 rounded-full border-2 text-[10px] font-mono font-bold uppercase tracking-widest ${
              isLight ? 'bg-[#FFFDF9] border-[#1A3629] text-[#1A3629]' : 'bg-[#1A261E] border-[#F4F0EA] text-[#D9A036]'
            }`}>
              Personal Patterns
            </span>
          </div>

          <h1 className={`font-fraunces font-black text-3xl sm:text-5xl tracking-tight leading-tight ${
            isLight ? 'text-[#1A3629]' : 'text-[#F4F0EA]'
          }`}>
            Your Energy &amp; Focus Discoveries
          </h1>
          <p className={`text-base sm:text-lg mt-3 leading-relaxed font-cabinet font-medium max-w-2xl ${
            isLight ? 'text-[#2C4A3B]' : 'text-[#C2CDBF]'
          }`}>
            We connect the dots between your daily food, sleep, and mood logs so you know what triggers your highest energy days.
          </p>
        </div>

        {/* Time Horizon Selector */}
        <div className="flex items-center gap-2 mb-8">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider opacity-80 shrink-0">
            Window:
          </span>
          <div className={`inline-flex items-center gap-1.5 p-1 rounded-xl border-2 ${
            isLight ? 'bg-[#FFFDF9] border-[#1A3629]/30' : 'bg-[#1A261E] border-[#F4F0EA]/30'
          }`}>
            {([7, 14, 30] as const).map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => {
                  retroAudio.playBlip();
                  setTimeHorizon(days);
                }}
                className={`px-3.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  timeHorizon === days
                    ? isLight
                      ? 'bg-[#1A3629] text-[#FFFDF9] shadow-[2px_2px_0px_#3A6B52]'
                      : 'bg-[#F4F0EA] text-[#111914] shadow-[2px_2px_0px_#D9A036]'
                    : isLight
                      ? 'text-[#2C4A3B] hover:text-[#1A3629]'
                      : 'text-[#C2CDBF] hover:text-[#F4F0EA]'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>

        {/* 4 Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className={`border-3 rounded-2xl p-5 transition-all ${
            isLight ? 'bg-[#FFFDF9] border-[#1A3629] shadow-[4px_4px_0px_#1A3629]' : 'bg-[#1A261E] border-[#F4F0EA] shadow-[4px_4px_0px_#D9A036]'
          }`}>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider block mb-1 opacity-70">
              Top Energy Driver
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-black tracking-tight">+34%</span>
              <span className="text-xs font-cabinet font-bold">High Protein</span>
            </div>
            <p className="text-xs font-cabinet font-medium mt-2 leading-relaxed opacity-85">
              Days with 120g+ whole-food protein average an 8.8+ focus score.
            </p>
          </div>

          <div className={`border-3 rounded-2xl p-5 transition-all ${
            isLight ? 'bg-[#FFFDF9] border-[#1A3629] shadow-[4px_4px_0px_#1A3629]' : 'bg-[#1A261E] border-[#F4F0EA] shadow-[4px_4px_0px_#D9A036]'
          }`}>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider block mb-1 opacity-70">
              Sleep Sweet Spot
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-black tracking-tight">7.5h–8.5h</span>
            </div>
            <p className="text-xs font-cabinet font-medium mt-2 leading-relaxed opacity-85">
              Gives you a +2.8 point boost in morning energy and mood.
            </p>
          </div>

          <div className={`border-3 rounded-2xl p-5 transition-all ${
            isLight ? 'bg-[#FFFDF9] border-[#1A3629] shadow-[4px_4px_0px_#1A3629]' : 'bg-[#1A261E] border-[#F4F0EA] shadow-[4px_4px_0px_#D9A036]'
          }`}>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider block mb-1 opacity-70">
              Morning Routine Effect
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-black tracking-tight">88%</span>
              <span className="text-xs font-cabinet font-bold">Consistency</span>
            </div>
            <p className="text-xs font-cabinet font-medium mt-2 leading-relaxed opacity-85">
              Starting with water &amp; sunlight keeps your momentum high all day.
            </p>
          </div>

          <div className={`border-3 rounded-2xl p-5 transition-all ${
            isLight ? 'bg-[#FFFDF9] border-[#1A3629] shadow-[4px_4px_0px_#1A3629]' : 'bg-[#1A261E] border-[#F4F0EA] shadow-[4px_4px_0px_#D9A036]'
          }`}>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider block mb-1 opacity-70">
              Hydration Impact
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-black tracking-tight">+22%</span>
              <span className="text-xs font-cabinet font-bold">Focus</span>
            </div>
            <p className="text-xs font-cabinet font-medium mt-2 leading-relaxed opacity-85">
              Drinking 2.5L+ water prevents the 3:00 PM afternoon dip.
            </p>
          </div>
        </div>

        {/* Interactive Pattern Chart Area */}
        <div className={`border-4 rounded-3xl p-6 sm:p-8 mb-10 transition-all ${
          isLight ? 'bg-[#FFFDF9] border-[#1A3629] shadow-[8px_8px_0px_#1A3629]' : 'bg-[#1A261E] border-[#F4F0EA] shadow-[8px_8px_0px_#D9A036]'
        }`}>
          {/* Chart Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className={`font-fraunces font-black text-2xl tracking-tight ${
                isLight ? 'text-[#1A3629]' : 'text-[#F4F0EA]'
              }`}>
                {activeCorrelation.title}
              </h3>
              <p className={`text-xs sm:text-sm font-cabinet font-medium mt-1 ${
                isLight ? 'text-[#2C4A3B]' : 'text-[#C2CDBF]'
              }`}>
                {activeCorrelation.description}
              </p>
            </div>

            <div className={`px-4 py-2 rounded-xl border-2 text-xs font-mono font-bold self-start sm:self-auto ${
              isLight ? 'bg-[#F4F0EA] border-[#1A3629] text-[#1A3629]' : 'bg-[#111914] border-[#F4F0EA] text-[#D9A036]'
            }`}>
              <span>Pattern Strength:</span>{' '}
              <span>{Math.round(Math.abs(activeCorrelation.coefficient) * 100)}% Match</span>
            </div>
          </div>

          {/* Retro Grid Paper Chart Canvas */}
          <div className={`h-64 sm:h-80 w-full border-3 rounded-2xl p-4 relative overflow-hidden mb-6 ${
            isLight ? 'bg-[#F4F0EA] border-[#1A3629]/30' : 'bg-[#111914] border-[#F4F0EA]/30'
          }`}>
            {/* Retro Grid Lines */}
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 pointer-events-none opacity-20">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className={`border ${isLight ? 'border-[#1A3629]' : 'border-[#F4F0EA]'}`} />
              ))}
            </div>

            {/* SVG Trendline */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
              <line
                x1="12%"
                y1={`${trendline.y1}%`}
                x2="88%"
                y2={`${trendline.y2}%`}
                stroke={isLight ? '#1A3629' : '#D9A036'}
                strokeWidth="3.5"
                strokeDasharray="6 6"
              />
            </svg>

            {/* Data Points */}
            <div className="relative w-full h-full">
              {activeCorrelation.points.map((pt, i) => {
                const leftPct = ((pt.x - minX) / (maxX - minX || 1)) * 76 + 12;
                const topPct = 100 - (((pt.y - minY) / (maxY - minY || 1)) * 76 + 12);

                return (
                  <div
                    key={i}
                    className="absolute -translate-x-1/2 -translate-y-1/2 p-2 group/dot cursor-pointer"
                    style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                  >
                    <span className={`block rounded-full border-2 transition-all ${
                      isLight
                        ? 'w-4 h-4 bg-[#1A3629] border-[#FFFDF9] shadow-[2px_2px_0px_#1A3629] group-hover/dot:scale-125'
                        : 'w-4 h-4 bg-[#D9A036] border-[#F4F0EA] shadow-[2px_2px_0px_#D9A036] group-hover/dot:scale-125'
                    }`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Simple Takeaway Box */}
          <div className={`p-4 rounded-xl border-2 flex items-center gap-3 ${
            isLight ? 'bg-[#F4F0EA] border-[#1A3629]/20' : 'bg-[#111914] border-[#F4F0EA]/20'
          }`}>
            <Sparkles className={`w-5 h-5 shrink-0 ${isLight ? 'text-[#1A3629]' : 'text-[#D9A036]'}`} />
            <p className="text-xs sm:text-sm font-cabinet font-bold leading-relaxed">
              Takeaway: {activeCorrelation.recommendation}
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
