'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { xpParticleEmitter } from '@/lib/particleEmitter';

export function QuickFuelDock() {
  const {
    currentDate,
    getDailyLog,
    userProfile,
    setProtein,
    setHydration,
  } = useHabitStore();

  const currentLog = getDailyLog(currentDate);

  const targetProtein = userProfile?.weightKg ? Math.round(userProfile.weightKg * 2.0) : 140;
  const targetHydration = userProfile?.weightKg ? Number((userProfile.weightKg * 0.04).toFixed(1)) : 2.5;

  const currentProtein = currentLog.totalProteinLogged || 0;
  const currentHydration = currentLog.hydrationLiters || 0;

  const proteinPct = Math.min(100, Math.round((currentProtein / targetProtein) * 100));
  const hydrationPct = Math.min(100, Math.round((currentHydration / targetHydration) * 100));

  const handleAddProtein = (amt: number, e: React.MouseEvent) => {
    retroAudio.playBlip();
    xpParticleEmitter.emit(e.clientX, e.clientY, 8);
    const newTotal = currentProtein + amt;
    setProtein(newTotal, currentDate);
  };

  const handleAddHydration = (liters: number, e: React.MouseEvent) => {
    retroAudio.playBlip();
    xpParticleEmitter.emit(e.clientX, e.clientY, 8);
    const newTotal = Number((currentHydration + liters).toFixed(2));
    setHydration(newTotal, currentDate);
  };

  return (
    <div id="tour-quick-fuel" className="w-full rounded-2xl border-2 border-[#1A3629] bg-[#FFFDF9] p-5 sm:p-6 shadow-[4px_4px_0px_#1A3629] flex flex-col gap-4">
      {/* Dock Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#1A3629]/15">
        <div className="min-w-0">
          <h2 className="font-fraunces font-bold text-base sm:text-lg text-[#1A3629] truncate">
            Quick Fuel Telemetry
          </h2>
          <p className="font-cabinet text-xs text-[#4A5D4E] truncate">
            Amino acid anchor & cell volume calibration.
          </p>
        </div>

        <Link
          href="/playbook?tab=recipes"
          className="px-3.5 py-1.5 rounded-xl border-2 border-[#1A3629] bg-[#FAF8F5] hover:bg-[#1A3629] hover:text-[#FFFDF9] text-[#1A3629] font-mono text-xs font-bold shadow-[2px_2px_0px_#1A3629] transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <span>Recipes & Fuel →</span>
        </Link>
      </div>

      {/* Two Metric Rows — Stacked with generous spacing */}
      <div className="flex flex-col gap-3.5">
        
        {/* Metric 1: Protein Anchor */}
        <div className="p-4 rounded-xl border border-[#1A3629]/20 bg-[#FAF8F5] flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />
              <span className="font-cabinet font-bold text-xs sm:text-sm text-[#1A3629] truncate">
                Protein Anchor
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-[#1A3629] tabular-nums shrink-0">
              {currentProtein}g / {targetProtein}g ({proteinPct}%)
            </span>
          </div>

          {/* Hairline Progress Gauge */}
          <div className="w-full h-2.5 rounded-full bg-[#EAE3D2] overflow-hidden border border-[#1A3629]/20">
            <div
              className="h-full bg-[#1A3629] transition-all duration-500 rounded-full"
              style={{ width: `${proteinPct}%` }}
            />
          </div>

          {/* 1-Tap Quick Action Chips */}
          <div className="flex items-center gap-2.5 pt-0.5">
            <button
              type="button"
              onClick={(e) => handleAddProtein(20, e)}
              className="flex-1 py-2 px-3 rounded-lg border-2 border-[#1A3629]/30 bg-[#FFFDF9] hover:border-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9] font-mono text-xs font-bold text-[#1A3629] transition-all shadow-[1px_1px_0px_#1A3629]/20 active:translate-y-[1px] cursor-pointer"
            >
              +20g
            </button>
            <button
              type="button"
              onClick={(e) => handleAddProtein(30, e)}
              className="flex-1 py-2 px-3 rounded-lg border-2 border-[#1A3629]/30 bg-[#FFFDF9] hover:border-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9] font-mono text-xs font-bold text-[#1A3629] transition-all shadow-[1px_1px_0px_#1A3629]/20 active:translate-y-[1px] cursor-pointer"
            >
              +30g
            </button>
            <button
              type="button"
              onClick={(e) => handleAddProtein(40, e)}
              className="flex-1 py-2 px-3 rounded-lg border-2 border-[#1A3629]/30 bg-[#FFFDF9] hover:border-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9] font-mono text-xs font-bold text-[#1A3629] transition-all shadow-[1px_1px_0px_#1A3629]/20 active:translate-y-[1px] cursor-pointer"
            >
              +40g
            </button>
          </div>
        </div>

        {/* Metric 2: Cellular Hydration */}
        <div className="p-4 rounded-xl border border-[#1A3629]/20 bg-[#FAF8F5] flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] shrink-0" />
              <span className="font-cabinet font-bold text-xs sm:text-sm text-[#1A3629] truncate">
                Cellular Hydration
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-[#1A3629] tabular-nums shrink-0">
              {currentHydration}L / {targetHydration}L ({hydrationPct}%)
            </span>
          </div>

          {/* Hairline Progress Gauge */}
          <div className="w-full h-2.5 rounded-full bg-[#EAE3D2] overflow-hidden border border-[#1A3629]/20">
            <div
              className="h-full bg-[#0284C7] transition-all duration-500 rounded-full"
              style={{ width: `${hydrationPct}%` }}
            />
          </div>

          {/* 1-Tap Quick Action Chips */}
          <div className="flex items-center gap-2.5 pt-0.5">
            <button
              type="button"
              onClick={(e) => handleAddHydration(0.25, e)}
              className="flex-1 py-2 px-3 rounded-lg border-2 border-[#1A3629]/30 bg-[#FFFDF9] hover:border-[#0284C7] hover:bg-[#0284C7] hover:text-[#FFFDF9] font-mono text-xs font-bold text-[#1A3629] transition-all shadow-[1px_1px_0px_#1A3629]/20 active:translate-y-[1px] cursor-pointer"
            >
              +250ml
            </button>
            <button
              type="button"
              onClick={(e) => handleAddHydration(0.5, e)}
              className="flex-1 py-2 px-3 rounded-lg border-2 border-[#1A3629]/30 bg-[#FFFDF9] hover:border-[#0284C7] hover:bg-[#0284C7] hover:text-[#FFFDF9] font-mono text-xs font-bold text-[#1A3629] transition-all shadow-[1px_1px_0px_#1A3629]/20 active:translate-y-[1px] cursor-pointer"
            >
              +500ml
            </button>
            <button
              type="button"
              onClick={(e) => handleAddHydration(0.75, e)}
              className="flex-1 py-2 px-3 rounded-lg border-2 border-[#1A3629]/30 bg-[#FFFDF9] hover:border-[#0284C7] hover:bg-[#0284C7] hover:text-[#FFFDF9] font-mono text-xs font-bold text-[#1A3629] transition-all shadow-[1px_1px_0px_#1A3629]/20 active:translate-y-[1px] cursor-pointer"
            >
              +750ml
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
