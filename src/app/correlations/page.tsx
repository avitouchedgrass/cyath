'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { useHabitStore } from '@/store/useHabitStore';
import { deriveCorrelations } from '@/lib/correlation';
import { retroAudio } from '@/lib/retroAudio';
import { InteractiveCorrelationMatrix, MatrixDataPoint } from '@/components/correlations/InteractiveCorrelationMatrix';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Activity, Sparkles, TrendingUp, BarChart3, Info } from 'lucide-react';

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

  const signalBarsCount = Math.min(10, Math.max(1, Math.round(activeCorrelation.confidence / 10)));

  return (
    <div className="min-h-screen bg-[#F4F0EA] text-[#1A3629] transition-colors duration-300 flex flex-col selection:bg-[#1A3629] selection:text-[#FFFDF9]">
      <HeaderNav />

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-12 pt-28 pb-24">
        
        {/* Navigation & Header */}
        <div className="mb-8 border-b-2 border-[#1A3629]/15 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-fraunces font-black text-3xl sm:text-4xl tracking-tight text-[#1A3629]">
              Habit Insights
            </h1>
            <p className="text-sm sm:text-base font-cabinet font-medium mt-1 leading-relaxed text-[#2C4A3B]">
              See how your meals, sleep, and daily habits directly affect your energy and focus.
            </p>
          </div>

          {/* Time Horizon Pills */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-mono font-bold text-[#4A5D4E]">Time Period:</span>
            <div className="inline-flex items-center gap-1 p-1 rounded-xl border-2 bg-[#FFFDF9] border-[#1A3629]/25 shadow-[2px_2px_0px_#1A3629]">
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
                      ? 'bg-[#1A3629] text-[#FFFDF9] shadow-[1px_1px_0px_#3A6B52]'
                      : 'text-[#2C4A3B] hover:text-[#1A3629]'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* Left: Correlation Hypothesis Selection List (4 Cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#4A5D4E]">
                Trends ({correlations.length})
              </span>
              <span className="text-[10px] font-mono font-bold text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-md border border-[#10B981]/30">
                Live Data
              </span>
            </div>

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
                    className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#FFFDF9] border-[#1A3629] shadow-[4px_4px_0px_#1A3629] -translate-y-0.5'
                        : 'bg-[#FFFDF9]/80 border-[#1A3629]/20 hover:border-[#1A3629] hover:bg-[#FFFDF9]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider border border-[#1A3629]/25 px-2 py-0.5 rounded-md bg-[#FAF6EE] text-[#1A3629]">
                        {corr.xLabel}
                      </span>
                      <span className="font-mono text-xs font-bold tabular-nums text-[#10B981]">
                        {corr.confidence}% Match
                      </span>
                    </div>

                    <div>
                      <h3 className="font-cabinet font-bold text-base tracking-tight leading-snug text-[#1A3629]">
                        {corr.title}
                      </h3>
                      <p className="text-xs font-cabinet font-medium mt-1 text-[#2C4A3B] line-clamp-2">
                        {corr.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono font-bold pt-2 border-t border-[#1A3629]/15 text-[#4A5D4E]">
                      <span>r = {corr.coefficient.toFixed(2)}</span>
                      <span className="text-[#1A3629] font-bold">{corr.impactScore} Trend →</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Deep Dive Scatter Stage & Executive Intelligence (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Main Scatter Container */}
            <div className="border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[5px_5px_0px_#1A3629] rounded-3xl p-6 sm:p-8 flex flex-col gap-6">
              
              {/* Card Header with Telemetry Signal Meter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#1A3629]/15">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#4A5D4E] block">
                    {timeHorizon}-Day Overview
                  </span>
                  <h2 className="font-fraunces font-black text-2xl tracking-tight mt-0.5 text-[#1A3629]">
                    {activeCorrelation.title}
                  </h2>
                </div>

                {/* Segmented Phosphor Signal Meter */}
                <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 bg-[#FAF6EE] border-[#1A3629] text-xs font-mono font-bold">
                    <span className="text-[#4A5D4E]">Strength:</span>
                    <span className="tabular-nums font-black text-[#10B981]">
                      {activeCorrelation.confidence}% ({activeCorrelation.impactScore})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[9px] text-[#4A5D4E]">
                    <span className="text-[#10B981] font-bold">
                      {'■'.repeat(signalBarsCount)}
                      <span className="opacity-20">{'■'.repeat(10 - signalBarsCount)}</span>
                    </span>
                    <span>(r = {activeCorrelation.coefficient.toFixed(2)})</span>
                  </div>
                </div>
              </div>

              {/* Interactive Physics Scatter Matrix */}
              <ErrorBoundary name="Interactive Matrix">
                <InteractiveCorrelationMatrix
                  key={activeCorrelation.id}
                  initialPoints={matrixPoints}
                  xLabel={activeCorrelation.xLabel}
                  yLabel={activeCorrelation.yLabel}
                  xUnit={
                    activeCorrelation.id.includes('protein')
                      ? 'g'
                      : activeCorrelation.id.includes('sleep')
                      ? 'h'
                      : activeCorrelation.id.includes('hydration')
                      ? 'L'
                      : activeCorrelation.id.includes('momentum') || activeCorrelation.id.includes('adherence')
                      ? '%'
                      : 'pts'
                  }
                />
              </ErrorBoundary>

              {/* Executive Actionable Takeaway Box */}
              <div className="p-5 rounded-2xl border-2 border-[#1A3629] bg-[#FAF6EE] space-y-2 shadow-inner">
                <div className="flex items-center gap-2 text-[#1A3629]">
                  <Sparkles className="w-4 h-4 text-[#10B981]" />
                  <h4 className="font-cabinet font-bold text-xs uppercase tracking-wider text-[#1A3629]">
                    Key Takeaway &amp; Recommendation
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
