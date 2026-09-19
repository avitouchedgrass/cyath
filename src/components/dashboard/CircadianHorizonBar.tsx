'use client';

import React, { useMemo } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { calculateCircadianStatus } from '@/lib/circadianEngine';

export function CircadianHorizonBar() {
  const { currentDate, deskRitualsByDate } = useHabitStore();

  const todayRitual = deskRitualsByDate[currentDate];
  const wakeTimeStr = todayRitual?.morningBootCompleted ? '07:00' : '07:00';

  const status = useMemo(() => {
    return calculateCircadianStatus({ wakeTimeStr });
  }, [wakeTimeStr]);

  const { currentPhase, alertnessScore, curvePoints, hoursSinceWake, currentProgressFraction } = status;

  // SVG coordinate dimensions
  const width = 540;
  const height = 90;
  const paddingLeft = 30;
  const paddingRight = 25;
  const paddingTop = 15;
  const paddingBottom = 22;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const minScore = 20;
  const maxScore = 100;

  const getX = (index: number) => {
    const fraction = index / (curvePoints.length - 1);
    return paddingLeft + fraction * chartWidth;
  };

  const getY = (score: number) => {
    const normalized = (score - minScore) / (maxScore - minScore);
    return paddingTop + (1 - normalized) * chartHeight;
  };

  // Build SVG path for the alertness curve
  const curvePath = curvePoints
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.alertnessScore)}`)
    .join(' ');

  const areaPath = `
    ${curvePath}
    L ${getX(curvePoints.length - 1)} ${paddingTop + chartHeight}
    L ${getX(0)} ${paddingTop + chartHeight}
    Z
  `;

  // Compute exact coordinates for the live current-time indicator pip
  const currentX = paddingLeft + currentProgressFraction * chartWidth;
  const currentY = getY(alertnessScore);

  const getBadgeClass = (color: 'emerald' | 'amber' | 'slate') => {
    if (color === 'emerald') {
      return 'bg-[#ECFDF5] text-[#065F46] border-[#065F46]/30';
    }
    if (color === 'amber') {
      return 'bg-[#FEF3C7] text-[#92400E] border-[#92400E]/30';
    }
    return 'bg-[#F1F5F9] text-[#475569] border-[#475569]/30';
  };

  return (
    <div
      id="tour-circadian-horizon"
      className="w-full rounded-2xl border-2 border-[#1A3629] bg-[#FFFDF9] p-4 sm:p-5 shadow-[4px_4px_0px_#1A3629] flex flex-col gap-3"
    >
      {/* Header Row: Phase Badge, Hours Since Wake, Alertness */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1A3629]/15">
        <div className="flex items-center gap-2.5">
          <span
            className={`font-mono text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${getBadgeClass(
              currentPhase.statusColor
            )}`}
          >
            {currentPhase.badgeLabel}
          </span>
          <span className="font-mono text-xs font-bold text-[#1A3629]">
            {currentPhase.name}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-[#4A5D4E] text-[11px] tabular-nums">
            Hour {hoursSinceWake} post-wake
          </span>
          <span className="font-bold text-[#1A3629] px-2 py-0.5 rounded bg-[#F4EFE6] border border-[#1A3629]/20 tabular-nums">
            {alertnessScore}% Alertness
          </span>
        </div>
      </div>

      {/* SVG Circadian Horizon Curve */}
      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none overflow-visible"
          role="img"
          aria-label="Circadian alertness timeline across 16 waking hours"
        >
          <defs>
            <linearGradient id="horizonGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1A3629" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#1A3629" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Guidelines for 50% and 80% */}
          {[50, 80].map((score) => {
            const y = getY(score);
            return (
              <g key={score}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#1A3629"
                  strokeOpacity="0.1"
                  strokeDasharray="2 4"
                />
                <text
                  x={paddingLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="font-mono text-[8px] fill-[#1A3629]/40 font-bold"
                >
                  {score}%
                </text>
              </g>
            );
          })}

          {/* Shaded Area under curve */}
          <path d={areaPath} fill="url(#horizonGradient)" />

          {/* Smooth Alertness Wave */}
          <path
            d={curvePath}
            fill="none"
            stroke="#1A3629"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Time Labels on X-Axis (Sampled every 4th hour) */}
          {curvePoints
            .filter((_, idx) => idx % 4 === 0 || idx === curvePoints.length - 1)
            .map((pt) => {
              const ptIndex = curvePoints.indexOf(pt);
              return (
                <text
                  key={pt.hourOfDay}
                  x={getX(ptIndex)}
                  y={paddingTop + chartHeight + 14}
                  textAnchor="middle"
                  className="font-mono text-[9px] font-bold fill-[#1A3629]/55"
                >
                  {pt.timeLabel}
                </text>
              );
            })}

          {/* Live Pulsing Position Pip */}
          <circle
            cx={currentX}
            cy={currentY}
            r={6}
            className="fill-[#1A3629] stroke-[#C9A84C] stroke-[2.5]"
          />
          <circle
            cx={currentX}
            cy={currentY}
            r={10}
            className="fill-transparent stroke-[#1A3629]/30 stroke-[1.5] animate-ping"
          />
        </svg>
      </div>

      {/* Hourly Actionable Biological Directive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
        <p className="font-cabinet font-medium text-[#2C4A3B] leading-relaxed max-w-xl">
          {currentPhase.hourlyDirective}
        </p>
        {currentPhase.counterMeasure && (
          <span className="font-mono text-[10px] font-bold text-[#1A3629] bg-[#FAF8F5] px-2.5 py-1 rounded-md border border-[#1A3629]/20 shrink-0">
            {currentPhase.counterMeasure}
          </span>
        )}
      </div>
    </div>
  );
}
