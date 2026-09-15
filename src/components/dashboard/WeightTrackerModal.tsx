'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';

interface WeightTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WeightTrackerModal({ isOpen, onClose }: WeightTrackerModalProps) {
  const { userProfile, weightHistory, logWeight, currentDate } = useHabitStore();
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [inputVal, setInputVal] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [feedback, setFeedback] = useState<{ message: string; xp: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const latestEntry = weightHistory && weightHistory.length > 0 ? weightHistory[0] : null;
  const currentKg = userProfile?.weightKg || (latestEntry ? latestEntry.weightKg : 70);

  useEffect(() => {
    if (isOpen) {
      if (unit === 'kg') {
        setInputVal(currentKg.toString());
      } else {
        setInputVal(Math.round(currentKg * 2.20462).toString());
      }
      setFeedback(null);
    }
  }, [isOpen, currentKg, unit]);

  if (!isOpen || !mounted) return null;

  const numVal = parseFloat(inputVal) || 0;
  const targetKg = unit === 'kg' ? numVal : Math.round((numVal / 2.20462) * 10) / 10;
  const deltaKg = Math.round((targetKg - currentKg) * 10) / 10;

  const trend = deltaKg < -0.1 ? 'down' : deltaKg > 0.1 ? 'up' : 'stable';

  const newProteinTarget = Math.round(targetKg * 2.0);
  const newWaterTarget = (targetKg * 0.04).toFixed(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetKg < 20 || targetKg > 350) {
      return;
    }

    const res = logWeight(targetKg, note.trim() || undefined, currentDate);
    if (res.success) {
      setFeedback({
        message: `Weight logged: ${targetKg} kg (${trend.toUpperCase()} · ${deltaKg > 0 ? '+' : ''}${deltaKg} kg)`,
        xp: res.xpAwarded,
      });
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  const handleUnitSwitch = (newUnit: 'kg' | 'lbs') => {
    if (newUnit === unit) return;
    retroAudio.playBlip();
    if (newUnit === 'lbs') {
      setInputVal(Math.round(targetKg * 2.20462).toString());
    } else {
      setInputVal(targetKg.toString());
    }
    setUnit(newUnit);
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A3629]/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-[#1A3629]/20 bg-[#FFFDF9] shadow-[0_16px_36px_rgba(26,54,41,0.16)] p-6 sm:p-7 flex flex-col gap-5 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#1A3629]/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border border-[#1A3629]/15 bg-[#FAF8F5] text-[#1A3629]">
                Biometric Ledger
              </span>
              <span className="font-mono text-[10px] font-bold text-[#1A3629] bg-[#E8F5E9] border border-[#10B981]/30 px-2 py-0.5 rounded-md">
                +15 XP Daily
              </span>
            </div>
            <h2 className="font-cabinet font-extrabold text-xl text-[#1A3629] mt-1">
              Weight Check-in &amp; Trend
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xs font-mono font-bold w-7 h-7 rounded-full border border-[#1A3629]/20 bg-[#FAF8F5] text-[#1A3629]/70 hover:text-[#1A3629] hover:bg-[#FAF8F5]/80 flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Current Weight & Unit Toggle */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <label htmlFor="weight-input" className="font-mono text-xs font-bold uppercase text-[#1A3629]">
              Enter New Weight:
            </label>

            <div className="inline-flex items-center p-0.5 rounded-lg border border-[#1A3629]/20 bg-[#FAF8F5]">
              <button
                type="button"
                onClick={() => handleUnitSwitch('kg')}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                  unit === 'kg'
                    ? 'bg-[#1A3629] text-[#FFFDF9]'
                    : 'text-[#1A3629]/70 hover:text-[#1A3629]'
                }`}
              >
                KG
              </button>
              <button
                type="button"
                onClick={() => handleUnitSwitch('lbs')}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                  unit === 'lbs'
                    ? 'bg-[#1A3629] text-[#FFFDF9]'
                    : 'text-[#1A3629]/70 hover:text-[#1A3629]'
                }`}
              >
                LBS
              </button>
            </div>
          </div>

          {/* Large Tactile Number Input */}
          <div className="flex items-center justify-center gap-3 p-4 rounded-2xl border border-[#1A3629]/15 bg-[#FAF8F5]">
            <input
              id="weight-input"
              type="number"
              step={unit === 'kg' ? '0.1' : '1'}
              min={unit === 'kg' ? '30' : '66'}
              max={unit === 'kg' ? '250' : '550'}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="w-32 text-center font-cabinet font-extrabold text-3xl sm:text-4xl text-[#1A3629] bg-transparent border-b-2 border-[#1A3629]/30 focus:border-[#1A3629] outline-none transition-colors"
              required
            />
            <span className="font-mono text-base font-bold text-[#1A3629]/60">
              {unit}
            </span>
          </div>

          {/* Trend Indicator & Delta Breakdown */}
          <div className="p-3.5 rounded-xl border border-[#1A3629]/10 bg-[#FFFDF9] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] uppercase text-[#4A5D4E]">
                Trajectory vs Baseline ({currentKg} kg)
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-cabinet font-bold text-sm text-[#1A3629]">
                  {trend === 'down' && 'Trending Downward'}
                  {trend === 'up' && 'Trending Upward'}
                  {trend === 'stable' && 'Weight Stable'}
                </span>
              </div>
            </div>

            <span
              className={`font-mono text-xs font-bold px-2.5 py-1 rounded-full border ${
                trend === 'down'
                  ? 'bg-[#ECFDF5] text-[#065F46] border-[#10B981]/30'
                  : trend === 'up'
                  ? 'bg-[#EFF6FF] text-[#1E40AF] border-[#3B82F6]/30'
                  : 'bg-[#FAF8F5] text-[#1A3629]/70 border-[#1A3629]/15'
              }`}
            >
              {deltaKg > 0 ? `+${deltaKg}` : deltaKg} kg
            </span>
          </div>

          {/* Dynamic Target Recalibration Preview */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#1A3629]/10">
              <span className="block font-mono text-[10px] text-[#4A5D4E] uppercase">
                New Protein Target
              </span>
              <span className="font-cabinet font-extrabold text-base text-[#065F46]">
                {newProteinTarget}g / day
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#1A3629]/10">
              <span className="block font-mono text-[10px] text-[#4A5D4E] uppercase">
                New Water Target
              </span>
              <span className="font-cabinet font-extrabold text-base text-[#2563EB]">
                {newWaterTarget}L / day
              </span>
            </div>
          </div>

          {/* Optional Note */}
          <div className="flex flex-col gap-1">
            <label htmlFor="weight-note" className="font-mono text-[11px] text-[#4A5D4E]">
              Context Note (Optional):
            </label>
            <input
              id="weight-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. morning fasted weigh-in, post leg day"
              className="px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#1A3629]/15 text-xs font-cabinet text-[#1A3629] placeholder:text-[#1A3629]/40 outline-none focus:border-[#1A3629]/40"
            />
          </div>

          {/* Feedback Message */}
          {feedback && (
            <div className="p-3 rounded-xl bg-[#E8F5E9] border border-[#10B981]/40 text-[#065F46] font-mono text-xs font-bold text-center animate-in fade-in duration-150">
              ✓ {feedback.message} {feedback.xp > 0 ? `(+${feedback.xp} XP)` : ''}
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#1A3629] hover:bg-[#2C4A3B] text-[#FFFDF9] font-cabinet font-bold text-sm tracking-wide transition-all shadow-2xs cursor-pointer active:scale-[0.99] flex items-center justify-center gap-1.5"
          >
            <span>Log Biometric Weight</span>
            <span className="font-mono text-xs opacity-80">(+15 XP)</span>
          </button>
        </form>

        {/* Recent History Strip */}
        {weightHistory && weightHistory.length > 0 && (
          <div className="flex flex-col gap-2 pt-2 border-t border-[#1A3629]/10">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#4A5D4E]">
              Recent Weigh-ins ({weightHistory.length})
            </span>
            <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1 text-xs font-mono">
              {weightHistory.slice(0, 4).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8F5] border border-[#1A3629]/8"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1A3629]">{entry.weightKg} kg</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded ${
                        entry.trend === 'down'
                          ? 'bg-[#ECFDF5] text-[#065F46]'
                          : entry.trend === 'up'
                          ? 'bg-[#EFF6FF] text-[#1E40AF]'
                          : 'bg-[#EAE3D2] text-[#1A3629]/70'
                      }`}
                    >
                      {entry.deltaKg > 0 ? `+${entry.deltaKg}` : entry.deltaKg} kg
                    </span>
                  </div>
                  <span className="text-[10px] text-[#4A5D4E]">{entry.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
