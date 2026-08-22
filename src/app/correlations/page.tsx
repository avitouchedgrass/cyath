'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { useHabitStore } from '@/store/useHabitStore';
import { deriveCorrelations } from '@/lib/correlation';
import { retroAudio } from '@/lib/retroAudio';
import { InteractiveCorrelationMatrix, MatrixDataPoint } from '@/components/correlations/InteractiveCorrelationMatrix';

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

  // Map active correlation points to matrix data points for physics simulation
  const matrixPoints: MatrixDataPoint[] = useMemo(() => {
    if (!activeCorrelation.points || activeCorrelation.points.length === 0) {
      return [
        { id: '1', x: 95, y: 5.4, label: 'Day 1' },
        { id: '2', x: 120, y: 6.5, label: 'Day 2' },
        { id: '3', x: 140, y: 7.2, label: 'Day 3' },
        { id: '4', x: 160, y: 8.3, label: 'Day 4' },
        { id: '5', x: 175, y: 8.9, label: 'Day 5' },
        { id: '6', x: 190, y: 9.3, label: 'Day 6' },
      ];
    }

    return activeCorrelation.points.map((pt, idx) => ({
      id: `${pt.date}-${idx}`,
      x: pt.x,
      y: pt.y,
      label: pt.date.slice(5), // MM-DD
    }));
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
                    ? 'bg-[#1A3629] text-[#FFFDF9]'
                    : 'text-[#2C4A3B] hover:text-[#1A3629]'
                }`}
              >
                {days}D
              </button>
            ))}
          </div>
        </div>

        {/* Hero Section */}
        <div className="mb-12">
          <span className="px-3.5 py-1.5 rounded-full border-2 text-[11px] font-mono font-bold uppercase tracking-widest bg-[#FFFDF9] border-[#1A3629] text-[#1A3629] inline-block mb-3 shadow-[2px_2px_0px_#1A3629]">
            Behavioral Telemetry
          </span>
          <h1 className="font-fraunces font-black text-3xl sm:text-5xl tracking-tight text-[#1A3629]">
            Correlation Engine
          </h1>
          <p className="text-sm sm:text-base font-cabinet font-medium text-[#2C4A3B] mt-2 max-w-2xl">
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

              {/* Interactive Physics Scatter Matrix */}
              <InteractiveCorrelationMatrix
                key={activeCorrelation.id}
                initialPoints={matrixPoints}
                xLabel={activeCorrelation.xLabel}
                yLabel={activeCorrelation.yLabel}
                xUnit={activeCorrelation.id.includes('protein') ? 'g' : activeCorrelation.id.includes('sleep') ? 'h' : 'min'}
              />

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
