'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { useHabitStore } from '@/store/useHabitStore';
import { deriveCorrelations } from '@/lib/correlation';
import { retroAudio } from '@/lib/retroAudio';

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
    <div className="min-h-screen bg-[#F4F0EA] text-[#1A3629] transition-colors duration-300 flex flex-col">
      <HeaderNav />

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 lg:px-12 pt-28 pb-24">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-cabinet font-bold px-4 py-1.5 rounded-full border-2 bg-[#1A3629] border-[#1A3629] text-[#FFFDF9] shadow-[2px_2px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
          >
            <span>← Back to Home</span>
          </Link>

          {/* Time Horizon Pills */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl border-2 bg-[#FFFDF9] border-[#1A3629]">
            {([7, 14, 30] as const).map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => {
                  retroAudio.playBlip();
                  setTimeHorizon(days);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  timeHorizon === days
                    ? 'bg-[#1A3629] text-[#FFFDF9] shadow-[2px_2px_0px_#3A6B52]'
                    : 'text-[#2C4A3B] hover:text-[#1A3629]'
                }`}
              >
                {days}D Window
              </button>
            ))}
          </div>
        </div>

        {/* Title Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border-2 bg-[#FFFDF9] border-[#1A3629] text-[#1A3629] text-[10px] font-mono font-bold uppercase tracking-widest mb-3">
            <span>Pattern Discovery Engine</span>
          </div>
          <h1 className="font-fraunces font-black text-3xl sm:text-5xl tracking-tight text-[#1A3629]">
            Habit &amp; Energy Correlations
          </h1>
          <p className="text-base sm:text-lg font-cabinet font-medium mt-2 max-w-2xl text-[#2C4A3B]">
            Automated regression engine connecting your daily nutrition, sleep, and routines directly to your self-rated focus.
          </p>
        </div>

        {/* Interactive Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Correlation Selection List (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1A3629] px-1">
              Active Hypotheses ({correlations.length})
            </h2>

            <div className="space-y-3">
              {correlations.map((corr) => {
                const isSelected = corr.id === activeCorrelation.id;
                return (
                  <button
                    key={corr.id}
                    type="button"
                    onClick={() => {
                      retroAudio.playBlip();
                      setSelectedCorrelationId(corr.id);
                    }}
                    className={`w-full text-left p-5 rounded-2xl border-3 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#FFFDF9] border-[#1A3629] shadow-[5px_5px_0px_#1A3629] -translate-y-0.5'
                        : 'bg-[#FFFDF9]/70 border-[#1A3629]/40 hover:border-[#1A3629] hover:bg-[#FFFDF9]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider border border-[#1A3629]/30 px-2 py-0.5 rounded bg-[#F4F0EA]">
                        {corr.xLabel}
                      </span>
                      <span className="font-mono text-xs font-bold tabular-nums">
                        {corr.confidence}% Match
                      </span>
                    </div>

                    <div>
                      <h3 className="font-cabinet font-bold text-base tracking-tight leading-snug">
                        {corr.title}
                      </h3>
                      <p className="text-xs font-cabinet font-medium mt-1 opacity-80 line-clamp-2">
                        {corr.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono font-bold pt-2 border-t border-[#1A3629]/15">
                      <span>r = {corr.coefficient.toFixed(2)}</span>
                      <span>{corr.impactScore} LINK →</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Deep Dive Scatter Stage (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Main Scatter Container */}
            <div className="border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[6px_6px_0px_#1A3629] rounded-3xl p-6 sm:p-8 flex flex-col gap-6">
              
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#1A3629]/15">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase opacity-70">
                    Active Telemetry · {timeHorizon}-Day Sample
                  </span>
                  <h2 className="font-fraunces font-bold text-2xl tracking-tight mt-0.5">
                    {activeCorrelation.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 bg-[#F4F0EA] border-[#1A3629] text-xs font-mono font-bold shrink-0">
                  <span>Match Strength:</span>
                  <span className="tabular-nums font-black">{activeCorrelation.confidence}%</span>
                </div>
              </div>

              {/* Scatter Chart Canvas */}
              <div className="relative w-full h-80 sm:h-96 rounded-2xl border-2 border-[#1A3629]/20 bg-[#F4F0EA] p-6 overflow-hidden select-none">
                
                {/* Axis Labels */}
                <div className="absolute top-4 left-6 text-[10px] font-mono font-bold uppercase tracking-wider text-[#2C4A3B]">
                  ▲ {activeCorrelation.yLabel}
                </div>
                <div className="absolute bottom-3 right-6 text-[10px] font-mono font-bold uppercase tracking-wider text-[#2C4A3B]">
                  {activeCorrelation.xLabel} ▶
                </div>

                {/* SVG Regression Line */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                  <line
                    x1="12%"
                    y1={`${trendline.y1}%`}
                    x2="88%"
                    y2={`${trendline.y2}%`}
                    stroke="#1A3629"
                    strokeWidth="3"
                    strokeDasharray="6 6"
                  />
                </svg>

                {/* Data Points */}
                <div className="relative w-full h-full">
                  {activeCorrelation.points.map((pt, idx) => {
                    const xPct = ((pt.x - minX) / (maxX - minX || 1)) * 76 + 12;
                    const yPct = 100 - (((pt.y - minY) / (maxY - minY || 1)) * 76 + 12);

                    return (
                      <div
                        key={idx}
                        className="group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                        style={{ left: `${xPct}%`, top: `${yPct}%` }}
                      >
                        <span className="block w-4 h-4 rounded-full border-2 border-[#FFFDF9] bg-[#1A3629] shadow-[2px_2px_0px_#1A3629] group-hover:scale-150 transition-transform" />
                        
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-30 whitespace-nowrap">
                          <div className="px-3 py-1.5 rounded-lg border-2 border-[#1A3629] bg-[#FFFDF9] text-[#1A3629] font-mono text-[10px] font-bold shadow-lg">
                            <span>{pt.date}: </span>
                            <span>{pt.x} → {pt.y}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actionable Takeaway Box */}
              <div className="p-5 rounded-2xl border-2 border-[#1A3629] bg-[#F4F0EA] space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold">[!]</span>
                  <h4 className="font-cabinet font-bold text-sm uppercase tracking-wider">
                    Actionable Calibration
                  </h4>
                </div>
                <p className="text-xs sm:text-sm font-cabinet font-medium leading-relaxed text-[#2C4A3B]">
                  {activeCorrelation.recommendation}
                </p>
              </div>

            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
