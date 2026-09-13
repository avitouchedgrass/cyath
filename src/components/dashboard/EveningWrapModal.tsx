'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { X } from 'lucide-react';

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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1A3629]/30 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-md bg-[#FFFDF9] border border-[#1A3629]/15 rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_rgba(26,54,41,0.14)] flex flex-col gap-5 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#1A3629]/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full border border-[#1A3629]/10 bg-[#FAF8F5] text-[10px] font-mono font-semibold uppercase tracking-wider text-[#4A5D4E]">
                Desk Evening Shutdown
              </span>
              <span className="px-2.5 py-0.5 rounded-full border border-[#1A3629]/10 bg-[#FAF8F5] text-[10px] font-mono font-semibold text-[#1A3629]">
                +50 XP
              </span>
            </div>
            <h2 className="font-cabinet font-extrabold text-2xl text-[#1A3629] tracking-tight">
              15-Second Desk Wrap
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
          Record your day’s closing levers before shutting down. Synchronizes your recovery score.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* 1. Caffeine Cutoff */}
          <div className="p-3.5 rounded-2xl border border-[#1A3629]/10 bg-[#FAF8F5] flex flex-col gap-2">
            <span className="text-xs font-cabinet font-bold text-[#1A3629]">
              Caffeine Cutoff (Prior to 2:00 PM)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  retroAudio.playBlip();
                  setCaffeineCutoffRespected(true);
                }}
                className={`py-2 rounded-xl border text-xs font-cabinet font-bold transition-all cursor-pointer ${
                  caffeineCutoffRespected
                    ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-2xs'
                    : 'bg-[#FFFDF9] text-[#1A3629] border-[#1A3629]/10 hover:border-[#1A3629]/30'
                }`}
              >
                Honored ✓
              </button>
              <button
                type="button"
                onClick={() => {
                  retroAudio.playBlip();
                  setCaffeineCutoffRespected(false);
                }}
                className={`py-2 rounded-xl border text-xs font-cabinet font-bold transition-all cursor-pointer ${
                  !caffeineCutoffRespected
                    ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-2xs'
                    : 'bg-[#FFFDF9] text-[#1A3629] border-[#1A3629]/10 hover:border-[#1A3629]/30'
                }`}
              >
                Late Caffeine
              </button>
            </div>
          </div>

          {/* 2. Whole Food Quality Rating */}
          <div className="p-3.5 rounded-2xl border border-[#1A3629]/10 bg-[#FAF8F5] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-cabinet font-bold text-[#1A3629]">
                Whole Food Quality
              </span>
              <span className="font-mono font-semibold text-xs text-[#1A3629] bg-[#FFFDF9] px-2.5 py-0.5 rounded-full border border-[#1A3629]/10">
                {wholeFoodRating}/5 Quality
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => {
                    retroAudio.playBlip();
                    setWholeFoodRating(rating);
                  }}
                  className={`py-2 rounded-xl border font-mono text-xs font-semibold transition-all cursor-pointer ${
                    wholeFoodRating === rating
                      ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-2xs'
                      : 'bg-[#FFFDF9] text-[#1A3629] border-[#1A3629]/10 hover:border-[#1A3629]/30'
                  }`}
                >
                  {rating}★
                </button>
              ))}
            </div>
          </div>

          {/* 3. Afternoon Slump Score */}
          <div className="p-3.5 rounded-2xl border border-[#1A3629]/10 bg-[#FAF8F5] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-cabinet font-bold text-[#1A3629]">
                Postprandial Energy Dip (1–10)
              </span>
              <span className="font-mono font-semibold text-xs text-[#1A3629] bg-[#FFFDF9] px-2.5 py-0.5 rounded-full border border-[#1A3629]/10">
                Severity {afternoonSlumpScore}/10
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
            <div className="flex justify-between text-[11px] font-sans text-[#4A5D4E]">
              <span>Zero Slump (1)</span>
              <span>Noticeable (5)</span>
              <span>Severe Brain Fog (10)</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-1 py-3 rounded-full bg-[#1A3629] hover:bg-[#2C4A3B] text-[#FFFDF9] font-cabinet font-bold text-sm transition-all cursor-pointer shadow-2xs flex items-center justify-center"
          >
            Wrap Daily Ledger (+50 XP)
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
