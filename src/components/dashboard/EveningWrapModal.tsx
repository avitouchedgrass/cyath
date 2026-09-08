'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { xpParticleEmitter } from '@/lib/particleEmitter';

interface EveningWrapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EveningWrapModal({ isOpen, onClose }: EveningWrapModalProps) {
  const { completeEveningWrap, currentDate, deskRitualsByDate } = useHabitStore();
  const [mounted, setMounted] = useState(false);

  const existingRitual = deskRitualsByDate[currentDate];
  const [caffeineCutoffRespected, setCaffeineCutoffRespected] = useState<boolean>(true);
  const [wholeFoodRating, setWholeFoodRating] = useState<number>(4);
  const [afternoonSlumpScore, setAfternoonSlumpScore] = useState<number>(
    existingRitual?.afternoonSlumpScore ?? 3
  );

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
    xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 8);
    completeEveningWrap({
      caffeineCutoffRespected,
      wholeFoodRating,
      afternoonSlumpScore,
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1A3629]/75 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-[#FFFDF9] border-2 border-[#1A3629] rounded-2xl p-6 sm:p-7 shadow-[6px_6px_0px_#1A3629] flex flex-col gap-5 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#1A3629]/15">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded border border-[#4F46E5]/40 bg-[#EEF2FF] text-[10px] font-mono font-bold uppercase tracking-wider text-[#3730A3]">
                Desk Evening Shutdown
              </span>
              <span className="px-2 py-0.5 rounded border border-[#10B981]/40 bg-[#ECFDF5] text-[10px] font-mono font-bold text-[#065F46]">
                +50 XP
              </span>
            </div>
            <h2 className="font-fraunces font-black text-2xl text-[#1A3629] tracking-tight">
              15-Second Desk Wrap
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg border border-[#1A3629] bg-[#FAF6EE] text-[#1A3629] font-mono text-xs font-bold hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <p className="text-xs font-cabinet font-medium text-[#2C4A3B] leading-relaxed">
          Record your day’s closing levers before shutting down. Synchronizes your biological recovery score.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* 1. Caffeine Cutoff */}
          <div className="p-3.5 rounded-xl border border-[#1A3629]/20 bg-[#FAF6EE] flex flex-col gap-2">
            <span className="text-xs font-mono font-bold text-[#1A3629]">
              Caffeine Cutoff (Honored Prior to 2:00 PM)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  retroAudio.playBlip();
                  setCaffeineCutoffRespected(true);
                }}
                className={`py-2 px-3 rounded-lg border font-cabinet font-bold text-xs transition-all cursor-pointer flex items-center justify-center ${
                  caffeineCutoffRespected
                    ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-xs'
                    : 'bg-[#FFFDF9] text-[#1A3629] border-[#1A3629]/20 hover:border-[#1A3629]'
                }`}
              >
                ✓ Honored Cutoff
              </button>
              <button
                type="button"
                onClick={() => {
                  retroAudio.playBlip();
                  setCaffeineCutoffRespected(false);
                }}
                className={`py-2 px-3 rounded-lg border font-cabinet font-bold text-xs transition-all cursor-pointer flex items-center justify-center ${
                  !caffeineCutoffRespected
                    ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-xs'
                    : 'bg-[#FFFDF9] text-[#1A3629] border-[#1A3629]/20 hover:border-[#1A3629]'
                }`}
              >
                Had Late Caffeine
              </button>
            </div>
          </div>

          {/* 2. Whole-Food Fuel Composition */}
          <div className="p-3.5 rounded-xl border border-[#1A3629]/20 bg-[#FAF6EE] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#1A3629]">
                Whole-Food Diet Quality
              </span>
              <span className="font-mono font-bold text-xs text-[#1A3629] bg-[#FFFDF9] px-2 py-0.5 rounded border border-[#1A3629]/20">
                Score: {wholeFoodRating} / 5
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => {
                    retroAudio.playBlip();
                    setWholeFoodRating(tier);
                  }}
                  className={`py-1.5 rounded-lg border font-mono text-xs font-bold transition-all cursor-pointer ${
                    wholeFoodRating === tier
                      ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-xs'
                      : 'bg-[#FFFDF9] text-[#1A3629] border-[#1A3629]/20 hover:border-[#1A3629]'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Afternoon Slump Severity */}
          <div className="p-3.5 rounded-xl border border-[#1A3629]/20 bg-[#FAF6EE] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#1A3629]">
                Afternoon Slump Severity (1–10)
              </span>
              <span className="font-mono font-bold text-xs text-[#1A3629] bg-[#FFFDF9] px-2 py-0.5 rounded border border-[#1A3629]/20">
                Score: {afternoonSlumpScore} / 10
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={afternoonSlumpScore}
              onChange={(e) => setAfternoonSlumpScore(Number(e.target.value))}
              className="w-full accent-[#1A3629] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#4A5D4E]">
              <span>Zero Slump (1)</span>
              <span>Mild Dip (5)</span>
              <span>Total Crash (10)</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-1 py-3 rounded-xl border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-sm shadow-[3px_3px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer flex items-center justify-center"
          >
            Seal Today&apos;s Data (+50 XP)
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
