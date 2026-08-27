'use client';

import React, { useState, useEffect } from 'react';
import { progressionEvents } from '@/lib/progression/events';
import { retroAudio } from '@/lib/retroAudio';

interface LevelUpData {
  oldLevel: number;
  newLevel: number;
  title: string;
  unlockedTitle?: string;
}

export function LevelUpModal() {
  const [data, setData] = useState<LevelUpData | null>(null);

  useEffect(() => {
    const unsub = progressionEvents.on('level:up', (eventData) => {
      setData(eventData);
    });

    return () => {
      unsub();
    };
  }, []);

  if (!data) return null;

  const handleClose = () => {
    retroAudio.playInspectConfirm();
    setData(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A3629]/70 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-[#FFFDF9] border-3 border-[#1A3629] rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_#1A3629] text-center flex flex-col items-center">
        {/* Floating Ember Glow */}
        <div className="w-20 h-20 rounded-2xl bg-[#F4EDE0] border-2 border-[#1A3629] shadow-[4px_4px_0px_#1A3629] flex items-center justify-center mb-5 -mt-12 bg-gradient-to-br from-[#F5E6C8] to-[#EBD5B3]">
          <span className="font-pixel text-4xl font-bold text-[#D97706] animate-pulse">
            ★
          </span>
        </div>

        <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#D97706] mb-1">
          Milestone Ascended
        </span>

        <h2 className="font-fraunces font-black text-3xl sm:text-4xl text-[#1A3629] mb-2 tracking-tight">
          Level {data.newLevel} Reached!
        </h2>

        <p className="font-sans text-sm text-[#4A5D4E] mb-6 max-w-xs">
          Your sustained consistency has fortified your daily foundation.
        </p>

        {data.unlockedTitle ? (
          <div className="w-full bg-[#FAF6EE] border-2 border-[#D97706] rounded-2xl p-4 mb-6 shadow-[3px_3px_0px_#D97706]">
            <span className="block font-mono text-[11px] font-bold text-[#D97706] uppercase tracking-wider mb-1">
              New Title Unlocked
            </span>
            <span className="font-fraunces font-black text-xl text-[#1A3629]">
              {data.unlockedTitle}
            </span>
          </div>
        ) : (
          <div className="w-full bg-[#FAF6EE] border-2 border-[#1A3629] rounded-2xl p-4 mb-6 shadow-[3px_3px_0px_#1A3629]">
            <span className="block font-mono text-[11px] font-bold text-[#4A5D4E] uppercase tracking-wider mb-0.5">
              Current Rank
            </span>
            <span className="font-fraunces font-bold text-lg text-[#1A3629]">
              {data.title}
            </span>
          </div>
        )}

        <button
          onClick={handleClose}
          type="button"
          className="w-full py-3 px-6 bg-[#1A3629] text-[#FFFDF9] font-pixel text-sm font-bold tracking-wider rounded-xl border-2 border-[#1A3629] shadow-[4px_4px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
        >
          Continue Journey →
        </button>
      </div>
    </div>
  );
}
