'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { X, Check } from 'lucide-react';

interface MorningBootModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MorningBootModal({ isOpen, onClose }: MorningBootModalProps) {
  const { completeMorningBoot, currentDate, getDailyLog } = useHabitStore();
  const [mounted, setMounted] = useState(false);

  const existingLog = getDailyLog(currentDate);
  const [sleepHours, setSleepHours] = useState<number>(existingLog?.sleepHours || 7.5);
  const [restedRating, setRestedRating] = useState<number>(7);
  const [sunlightDone, setSunlightDone] = useState<boolean>(
    !!existingLog?.habitsCompleted['sunlight']
  );
  const [targetFocusHours, setTargetFocusHours] = useState<number>(4);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    retroAudio.playTierUpgrade();
    completeMorningBoot({
      sleepHours,
      restedRating,
      sunlightDone,
      targetFocusHours,
    }, currentDate);
    onClose();
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1A3629]/30 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-md bg-[#FFFDF9] border border-[#1A3629]/15 rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_rgba(26,54,41,0.14)] flex flex-col gap-5 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#1A3629]/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full border border-[#1A3629]/10 bg-[#FAF8F5] text-[10px] font-mono font-semibold uppercase tracking-wider text-[#4A5D4E]">
                Desk Morning Boot
              </span>
              <span className="px-2.5 py-0.5 rounded-full border border-[#1A3629]/10 bg-[#FAF8F5] text-[10px] font-mono font-semibold text-[#1A3629]">
                +50 XP
              </span>
            </div>
            <h2 className="font-cabinet font-extrabold text-2xl text-[#1A3629] tracking-tight">
              10-Second Desk Check-in
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#1A3629]/15 bg-[#FAF8F5] text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9] transition-colors flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs font-sans text-[#4A5D4E] leading-relaxed">
          Calibrate your biological baseline before diving into deep work.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* 1. Sleep Duration */}
          <div className="p-3.5 rounded-2xl border border-[#1A3629]/10 bg-[#FAF8F5] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-cabinet font-bold text-[#1A3629]">
                Sleep Duration
              </span>
              <span className="font-mono font-semibold text-xs text-[#1A3629] bg-[#FFFDF9] px-2.5 py-0.5 rounded-full border border-[#1A3629]/10">
                {sleepHours} Hours
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[6.0, 7.0, 7.5, 8.5].map((hours) => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => {
                    retroAudio.playBlip();
                    setSleepHours(hours);
                  }}
                  className={`py-1.5 rounded-xl border font-mono text-xs font-semibold transition-all cursor-pointer ${
                    sleepHours === hours
                      ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-2xs'
                      : 'bg-[#FFFDF9] text-[#1A3629] border-[#1A3629]/10 hover:border-[#1A3629]/30'
                  }`}
                >
                  {hours}h
                </button>
              ))}
            </div>
          </div>

          {/* 2. Morning Rested Readiness */}
          <div className="p-3.5 rounded-2xl border border-[#1A3629]/10 bg-[#FAF8F5] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-cabinet font-bold text-[#1A3629]">
                Waking Alertness (1-10)
              </span>
              <span className="font-mono font-semibold text-xs text-[#1A3629] bg-[#FFFDF9] px-2.5 py-0.5 rounded-full border border-[#1A3629]/10">
                Level {restedRating}/10
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={restedRating}
              onChange={(e) => setRestedRating(Number(e.target.value))}
              className="w-full accent-[#1A3629] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-sans text-[#4A5D4E]">
              <span>Groggy (1)</span>
              <span>Baseline (5)</span>
              <span>Primed (10)</span>
            </div>
          </div>

          {/* 3. Morning Daylight Exposure */}
          <button
            type="button"
            onClick={() => {
              retroAudio.playBlip();
              setSunlightDone(!sunlightDone);
            }}
            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
              sunlightDone
                ? 'bg-[#FAF8F5] border-[#1A3629]/30 text-[#1A3629]'
                : 'bg-[#FAF8F5] border-[#1A3629]/10 text-[#1A3629] hover:border-[#1A3629]/25'
            }`}
          >
            <div className="text-left">
              <span className="block text-xs font-cabinet font-bold leading-tight">
                10-15m Morning Natural Daylight
              </span>
              <span className="block text-[11px] font-sans text-[#4A5D4E] mt-0.5">
                Resets master circadian clock &amp; clears adenosine
              </span>
            </div>
            <div className={`w-5 h-5 rounded-md border flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
              sunlightDone
                ? 'bg-[#1A3629] border-[#1A3629] text-[#FFFDF9]'
                : 'bg-[#FFFDF9] border-[#1A3629]/25'
            }`}>
              {sunlightDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </button>

          {/* 4. Target Deep Focus Block */}
          <div className="p-3.5 rounded-2xl border border-[#1A3629]/10 bg-[#FAF8F5] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-cabinet font-bold text-[#1A3629]">
                Target Deep Work Block
              </span>
              <span className="font-mono font-semibold text-xs text-[#1A3629] bg-[#FFFDF9] px-2.5 py-0.5 rounded-full border border-[#1A3629]/10">
                {targetFocusHours}h Goal
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[2, 3, 4, 6].map((hours) => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => {
                    retroAudio.playBlip();
                    setTargetFocusHours(hours);
                  }}
                  className={`py-1.5 rounded-xl border font-mono text-xs font-semibold transition-all cursor-pointer ${
                    targetFocusHours === hours
                      ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-2xs'
                      : 'bg-[#FFFDF9] text-[#1A3629] border-[#1A3629]/10 hover:border-[#1A3629]/30'
                  }`}
                >
                  {hours}h
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-1 py-3 rounded-full bg-[#1A3629] hover:bg-[#2C4A3B] text-[#FFFDF9] font-cabinet font-bold text-sm transition-all cursor-pointer shadow-2xs flex items-center justify-center"
          >
            Prime My Focus (+50 XP)
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
