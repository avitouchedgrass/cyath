'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { Utensils, ArrowRight, Plus } from 'lucide-react';

interface DailyFuelCardProps {
  currentProtein: number;
  targetProtein: number;
  currentDate: string;
}

export function DailyFuelCard({
  currentProtein,
  targetProtein,
  currentDate,
}: DailyFuelCardProps) {
  const { setProtein } = useHabitStore();
  const [customGrams, setCustomGrams] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleQuickAdd = (grams: number) => {
    retroAudio.playInspectConfirm();
    setProtein(currentProtein + grams, currentDate);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customGrams, 10);
    if (isNaN(parsed) || parsed <= 0) return;
    retroAudio.playInspectConfirm();
    setProtein(currentProtein + parsed, currentDate);
    setCustomGrams('');
    setShowInput(false);
  };

  const percent = Math.min(100, Math.round((currentProtein / targetProtein) * 100));
  const remaining = Math.max(0, targetProtein - currentProtein);

  return (
    <div
      id="tour-fuel-anchor"
      className="w-full rounded-3xl border border-[#1A3629]/10 bg-[#FFFDF9] p-5 shadow-[0_2px_12px_rgba(26,54,41,0.03)] hover:border-[#1A3629]/20 transition-all duration-200 flex flex-col gap-4"
    >
      {/* Complication Header: Title + Ratio Readout */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-[#1A3629]/8">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-[#FAF8F5] border border-[#1A3629]/10 flex items-center justify-center text-[#1A3629] shrink-0">
            <Utensils className="w-3.5 h-3.5" />
          </div>
          <h3 className="font-cabinet font-bold text-sm text-[#1A3629] tracking-tight truncate">
            Daily Fuel Anchor
          </h3>
        </div>

        <span className="font-mono text-xs font-semibold text-[#1A3629] bg-[#FAF8F5] px-2.5 py-0.5 rounded-full border border-[#1A3629]/10 tabular-nums shrink-0">
          {currentProtein}g / {targetProtein}g
        </span>
      </div>

      {/* Progress Bar & Status */}
      <div className="flex flex-col gap-2">
        <div className="w-full h-2 bg-[#1A3629]/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1A3629] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs pt-0.5">
          <span className="font-sans text-[#4A5D4E] text-xs font-medium">
            {remaining === 0 ? 'Daily protein target met ✓' : `${remaining}g protein remaining`}
          </span>
          <span className="font-mono text-xs font-semibold text-[#1A3629]">
            {percent}%
          </span>
        </div>
      </div>

      {/* Quick-Log Actions Strip */}
      <div className="pt-2 border-t border-[#1A3629]/8 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="font-cabinet text-[11px] font-bold text-[#4A5D4E] uppercase tracking-wider">
            Quick Log Protein
          </span>
          <button
            type="button"
            onClick={() => setShowInput(!showInput)}
            className="font-cabinet font-bold text-[11px] text-[#1A3629] hover:underline cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>{showInput ? 'Presets' : 'Custom'}</span>
          </button>
        </div>

        {showInput ? (
          <form onSubmit={handleCustomSubmit} className="flex items-center gap-2 animate-in fade-in duration-150">
            <input
              type="number"
              min="1"
              max="200"
              value={customGrams}
              onChange={(e) => setCustomGrams(e.target.value)}
              placeholder="Grams (e.g. 35)"
              className="flex-1 text-xs font-cabinet bg-[#FAF8F5] border border-[#1A3629]/20 rounded-lg p-2 outline-none text-[#1A3629]"
              autoFocus
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-[#1A3629] text-[#FFFDF9] text-xs font-cabinet font-bold rounded-lg cursor-pointer hover:bg-[#2C4A3B] transition-colors"
            >
              Add
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickAdd(25)}
              className="py-1.5 px-2 rounded-xl border border-[#1A3629]/12 bg-[#FAF8F5] hover:bg-[#1A3629] hover:text-[#FFFDF9] transition-all text-center cursor-pointer group shadow-2xs"
            >
              <div className="font-mono text-xs font-bold leading-none">+25g</div>
              <div className="font-sans text-[10px] text-[#4A5D4E] group-hover:text-[#FFFDF9]/80 mt-0.5 truncate">
                Snack / Eggs
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickAdd(40)}
              className="py-1.5 px-2 rounded-xl border border-[#1A3629]/12 bg-[#FAF8F5] hover:bg-[#1A3629] hover:text-[#FFFDF9] transition-all text-center cursor-pointer group shadow-2xs"
            >
              <div className="font-mono text-xs font-bold leading-none">+40g</div>
              <div className="font-sans text-[10px] text-[#4A5D4E] group-hover:text-[#FFFDF9]/80 mt-0.5 truncate">
                Meat / Fish
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickAdd(50)}
              className="py-1.5 px-2 rounded-xl border border-[#1A3629]/12 bg-[#FAF8F5] hover:bg-[#1A3629] hover:text-[#FFFDF9] transition-all text-center cursor-pointer group shadow-2xs"
            >
              <div className="font-mono text-xs font-bold leading-none">+50g</div>
              <div className="font-sans text-[10px] text-[#4A5D4E] group-hover:text-[#FFFDF9]/80 mt-0.5 truncate">
                Power Fuel
              </div>
            </button>
          </div>
        )}

        {/* Prominent AI Log Meal Trigger */}
        <Link
          href="/dashboard?tab=log"
          className="w-full py-2.5 px-3.5 rounded-full bg-[#1A3629] hover:bg-[#2C4A3B] text-[#FFFDF9] font-cabinet font-bold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] transition-all cursor-pointer"
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>Log Meal with AI →</span>
        </Link>

        {/* Full Meal & Recipe Link */}
        <Link
          href="/dashboard?tab=log"
          className="inline-flex items-center justify-between pt-1 text-xs font-cabinet font-bold text-[#1A3629] hover:underline cursor-pointer group"
        >
          <span>Daily Meal Ledger & Catalog</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
