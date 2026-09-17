'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { xpParticleEmitter } from '@/lib/particleEmitter';
import { EXCLUSIVE_DECORATIONS } from '@/lib/constants/xpMatrix';
import { Sparkles, Sun, Coffee, Check } from 'lucide-react';

interface FirstHabitCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  habitTitle?: string;
}

export function FirstHabitCelebration({ isOpen, onClose, habitTitle }: FirstHabitCelebrationProps) {
  const { unlockDecoration, setKeystoneProtocol, userProfile } = useHabitStore();
  const [mounted, setMounted] = useState(false);
  const [selectedKeystone, setSelectedKeystone] = useState<'morning-photon-exposure' | 'delay-caffeine-90m'>(
    (userProfile?.keystoneProtocolId as any) || 'morning-photon-exposure'
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      retroAudio.playTierUpgrade();
      unlockDecoration('sprouting_moss');
      if (typeof window !== 'undefined') {
        xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 30);
      }
    }
  }, [isOpen, unlockDecoration]);

  if (!isOpen || !mounted) return null;

  const mossDecoration = EXCLUSIVE_DECORATIONS.sprouting_moss;

  const handleConfirm = () => {
    retroAudio.playInspectConfirm();
    setKeystoneProtocol(selectedKeystone);
    onClose();
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#1A2E26]/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl border-2 border-[#1A2E26] bg-[#FFFDF9] shadow-[6px_6px_0px_#1A2E26] p-6 sm:p-8 flex flex-col gap-5 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Badge */}
        <div className="flex items-center justify-between border-b border-[#1A2E26]/15 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#1A2E26] text-[#FFFDF9] font-mono text-xs flex items-center justify-center font-bold">
              ✦
            </span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#065F46] bg-[#ECFDF5] px-2.5 py-0.5 rounded border border-[#10B981]/30">
              Day 1 Milestone · Ecosystem Mutation
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xs font-mono font-bold w-6 h-6 rounded-full border border-[#1A2E26]/20 bg-[#FAF8F5] text-[#1A2E26] hover:bg-[#1A2E26] hover:text-[#FFFDF9] transition-colors flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Mutation Illustration & Banner */}
        <div className="flex flex-col items-center text-center gap-3 py-1">
          <div className="w-20 h-20 rounded-2xl border-2 border-[#1A2E26] bg-[#F4F0EA] flex items-center justify-center shadow-[3px_3px_0px_#1A2E26] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-[#10B981]/20 to-transparent pointer-events-none" />
            <div className="w-12 h-12 rounded-lg bg-[#065F46] text-[#FFFDF9] flex items-center justify-center font-mono font-bold text-xl [image-rendering:pixelated] shadow-inner">
              🌱
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="font-fraunces font-black text-2xl text-[#1A2E26] leading-tight">
              Ecosystem Mutation Unlocked!
            </h2>
            <p className="font-cabinet text-xs sm:text-sm text-[#2C4A3B] max-w-md leading-relaxed">
              Completing <strong>"{habitTitle || 'Your First Habit'}"</strong> initiated the biological terraforming of your sanctuary.
              <strong> {mossDecoration.name}</strong> now coats your island's stone perimeter.
            </p>
          </div>
        </div>

        {/* Keystone Protocol Lock Container */}
        <div className="p-4 rounded-2xl border border-[#1A2E26]/15 bg-[#FAF8F5] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1A2E26]">
              Keystone Protocol Lock
            </span>
            <span className="font-mono text-[10px] text-[#4A5D4E]">
              Primary Day 0–3 Habit Anchor
            </span>
          </div>
          <p className="font-sans text-xs text-[#4A5D4E]">
            Before managing the full 6-habit dashboard, lock in <strong>one single keystone habit</strong> to anchor your daily cadence:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Option 1: Morning Sunlight */}
            <button
              type="button"
              onClick={() => {
                retroAudio.playBlip();
                setSelectedKeystone('morning-photon-exposure');
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                selectedKeystone === 'morning-photon-exposure'
                  ? 'border-[#1A2E26] bg-[#1A2E26] text-[#FFFDF9] shadow-[2px_2px_0px_#3A6B52]'
                  : 'border-[#1A2E26]/20 bg-[#FFFDF9] text-[#1A2E26] hover:bg-[#FAF6EE]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sun className={`w-3.5 h-3.5 ${selectedKeystone === 'morning-photon-exposure' ? 'text-[#FEF3C7]' : 'text-[#D97706]'}`} />
                  <span className="font-cabinet font-bold text-xs">Morning Sunlight</span>
                </div>
                {selectedKeystone === 'morning-photon-exposure' && (
                  <Check className="w-3.5 h-3.5 text-[#FEF3C7]" />
                )}
              </div>
              <p className={`text-[11px] leading-tight ${selectedKeystone === 'morning-photon-exposure' ? 'text-[#FFFDF9]/80' : 'text-[#4A5D4E]'}`}>
                15m outdoor lux within 45m of waking to set melatonin timer.
              </p>
            </button>

            {/* Option 2: 90m Caffeine Delay */}
            <button
              type="button"
              onClick={() => {
                retroAudio.playBlip();
                setSelectedKeystone('delay-caffeine-90m');
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                selectedKeystone === 'delay-caffeine-90m'
                  ? 'border-[#1A2E26] bg-[#1A2E26] text-[#FFFDF9] shadow-[2px_2px_0px_#3A6B52]'
                  : 'border-[#1A2E26]/20 bg-[#FFFDF9] text-[#1A2E26] hover:bg-[#FAF6EE]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Coffee className={`w-3.5 h-3.5 ${selectedKeystone === 'delay-caffeine-90m' ? 'text-[#FEF3C7]' : 'text-[#92400E]'}`} />
                  <span className="font-cabinet font-bold text-xs">90m Caffeine Delay</span>
                </div>
                {selectedKeystone === 'delay-caffeine-90m' && (
                  <Check className="w-3.5 h-3.5 text-[#FEF3C7]" />
                )}
              </div>
              <p className={`text-[11px] leading-tight ${selectedKeystone === 'delay-caffeine-90m' ? 'text-[#FFFDF9]/80' : 'text-[#4A5D4E]'}`}>
                Clear overnight adenosine to prevent the 2:30 PM energy drop.
              </p>
            </button>
          </div>
        </div>

        {/* Confirm Button */}
        <button
          type="button"
          onClick={handleConfirm}
          className="w-full py-3 px-4 rounded-xl border-2 border-[#1A2E26] bg-[#1A2E26] hover:bg-[#2C4A3B] text-[#FFFDF9] font-cabinet font-bold text-xs shadow-[3px_3px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Lock Keystone Protocol &amp; Enter Cockpit</span>
          <Sparkles className="w-3.5 h-3.5 text-[#FEF3C7]" />
        </button>
      </div>
    </div>,
    document.body
  );
}
