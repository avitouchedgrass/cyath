'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { useHabitStore } from '@/store/useHabitStore';
import { getIslandTier } from '@/lib/progression/config';
import { calculateLevel } from '@/lib/progression/engine';
import { calculateCircadianStatus } from '@/lib/circadianEngine';

export function LivingIslandHero() {
  const { totalXp } = useHabitStore();

  const progress = useMemo(() => calculateLevel(totalXp), [totalXp]);
  const currentIsland = useMemo(() => getIslandTier(progress.level), [progress.level]);

  // Serene, natural atmospheric condition based on local time
  const atmosphere = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 9) {
      return { name: 'Dawn Mist', isDark: false };
    } else if (hour >= 9 && hour < 14) {
      return { name: 'Peak Daylight', isDark: false };
    } else if (hour >= 14 && hour < 18) {
      return { name: 'Golden Hour', isDark: false };
    } else if (hour >= 18 && hour < 21) {
      return { name: 'Dusk', isDark: true };
    } else {
      return { name: 'Twilight', isDark: true };
    }
  }, []);

  return (
    <div
      id="tour-living-sky"
      className="w-full relative flex flex-col items-center justify-center select-none py-2"
    >
      {/* Editorial Island Status & Name */}
      <div className="relative z-20 flex flex-col items-center text-center gap-1.5 mb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFDF9] border border-[#1A3629]/12 text-[#1A3629] font-cabinet font-bold text-xs shadow-2xs">
          <span>Tier {currentIsland.tier}</span>
          <span className="opacity-30">·</span>
          <span>{atmosphere.name}</span>
          <span className="opacity-30">·</span>
          <span className="font-mono text-[#1A3629]">Level {progress.level}</span>
        </div>

        <h2 className="font-cabinet font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#1A3629] tracking-tight">
          {currentIsland.name}
        </h2>
      </div>

      {/* Center Stage: Monumental Cardless Floating Island */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div
          className="relative z-10 w-[320px] h-[320px] sm:w-[460px] sm:h-[460px] md:w-[560px] md:h-[560px] lg:w-[620px] lg:h-[620px] xl:w-[720px] xl:h-[720px] 2xl:w-[800px] 2xl:h-[800px] flex items-center justify-center animate-[islandFloat_8s_ease-in-out_infinite] transition-transform duration-300"
        >
          <Image
            src={currentIsland.image}
            alt={currentIsland.name}
            fill
            priority
            sizes="(max-width: 640px) 320px, (max-width: 1024px) 560px, (max-width: 1536px) 720px, 800px"
            className="object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.18)] select-none"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        {/* Natural Floating Ground Shadow */}
        <div className="w-[240px] sm:w-[340px] md:w-[440px] lg:w-[480px] xl:w-[560px] 2xl:w-[640px] h-3.5 sm:h-4.5 rounded-full bg-[#1A3629]/15 blur-[4px] animate-[shadowFloat_8s_ease-in-out_infinite] mt-2 pointer-events-none" />
      </div>

      {/* Flavor Narrative & Tactile Progression Rail */}
      <div className="relative z-20 flex flex-col items-center text-center gap-2 mt-4 max-w-md px-4">
        <p className="font-cabinet font-medium text-xs sm:text-sm text-[#4A5D4E] leading-relaxed">
          {currentIsland.description}
        </p>

        <div className="w-64 sm:w-80 flex flex-col gap-1.5 mt-1">
          <div className="w-full h-1.5 bg-[#1A3629]/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1A3629] rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress.progressPercent))}%` }}
            />
          </div>

          <div className="flex items-center justify-between font-mono text-[11px] text-[#1A3629]/75">
            <span>{Math.round(progress.progressPercent)}% to Lvl {progress.level + 1}</span>
            <span>{progress.currentLevelXp} / {progress.xpForNextLevel} XP</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CircadianHorizonCurve() {
  const { currentDate, deskRitualsByDate } = useHabitStore();

  const todayRitual = deskRitualsByDate[currentDate];
  const wakeTimeStr = todayRitual?.morningBootCompleted ? '07:00' : '07:00';

  const circadian = useMemo(() => {
    return calculateCircadianStatus({ wakeTimeStr });
  }, [wakeTimeStr]);

  const { currentPhase, alertnessScore, curvePoints, hoursSinceWake, currentProgressFraction } = circadian;

  const formattedWakeTime = useMemo(() => {
    const totalMinutes = Math.round(hoursSinceWake * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h === 0) return `+${m}m post-wake`;
    if (m === 0) return `+${h}h post-wake`;
    return `+${h}h ${m}m post-wake`;
  }, [hoursSinceWake]);

  // SVG dimensions
  const width = 540;
  const height = 76;
  const paddingLeft = 28;
  const paddingRight = 24;
  const paddingTop = 12;
  const paddingBottom = 20;

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

  const curvePath = curvePoints
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.alertnessScore)}`)
    .join(' ');

  const areaPath = `
    ${curvePath}
    L ${getX(curvePoints.length - 1)} ${paddingTop + chartHeight}
    L ${getX(0)} ${paddingTop + chartHeight}
    Z
  `;

  const currentX = paddingLeft + currentProgressFraction * chartWidth;
  const currentY = getY(alertnessScore);

  return (
    <div className="w-full bg-[#FFFDF9] border border-[#1A3629]/10 rounded-3xl p-5 shadow-[0_2px_12px_rgba(26,54,41,0.03)] hover:border-[#1A3629]/20 transition-all duration-200 flex flex-col gap-3.5">
      {/* Complication Header: Phase + Alertness Readout */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-[#1A3629]/8">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-[#1A3629] shrink-0" />
          <h3 className="font-cabinet font-bold text-sm text-[#1A3629] tracking-tight truncate">
            {currentPhase.name}
          </h3>
        </div>

        <div className="flex items-baseline gap-1 shrink-0 font-cabinet">
          <span className="font-extrabold text-base text-[#1A3629] tabular-nums">
            {alertnessScore}%
          </span>
          <span className="text-xs font-medium text-[#4A5D4E]">alertness</span>
        </div>
      </div>

      {/* SVG Circadian Alertness Curve — Clean, Solid, Swiss */}
      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none overflow-visible"
          role="img"
          aria-label="Circadian alertness curve across waking day"
        >
          {/* Reference Guideline for 50% Baseline */}
          <line
            x1={paddingLeft}
            y1={getY(50)}
            x2={width - paddingRight}
            y2={getY(50)}
            stroke="#1A3629"
            strokeOpacity="0.08"
            strokeDasharray="3 3"
          />

          {/* Area under curve */}
          <path d={areaPath} fill="#1A3629" fillOpacity="0.04" />

          {/* Clean Solid Alertness Wave */}
          <path
            d={curvePath}
            fill="none"
            stroke="#1A3629"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Time Labels on X-Axis */}
          {curvePoints
            .filter((_, idx) => idx % 4 === 0 || idx === curvePoints.length - 1)
            .map((pt) => {
              const ptIndex = curvePoints.indexOf(pt);
              return (
                <text
                  key={pt.hourOfDay}
                  x={getX(ptIndex)}
                  y={paddingTop + chartHeight + 12}
                  textAnchor="middle"
                  className="font-mono text-[9px] font-medium fill-[#1A3629]/45"
                >
                  {pt.timeLabel}
                </text>
              );
            })}

          {/* Live Chronometer Cursor Pip */}
          <circle
            cx={currentX}
            cy={currentY}
            r={4.5}
            className="fill-[#FFFDF9] stroke-[#1A3629] stroke-[2]"
          />
        </svg>
      </div>

      {/* Actionable Directive */}
      <div className="flex items-center justify-between gap-2 pt-0.5 text-xs text-[#1A3629]/75 font-cabinet">
        <span className="font-medium truncate">{currentPhase.hourlyDirective}</span>
        <span className="font-mono text-[11px] text-[#4A5D4E] shrink-0">{formattedWakeTime}</span>
      </div>
    </div>
  );
}

export function LivingSkyCanopy() {
  return (
    <div className="w-full flex flex-col gap-6">
      <LivingIslandHero />
      <CircadianHorizonCurve />
    </div>
  );
}
