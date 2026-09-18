'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useHabitStore, TROPHIES_ROSTER, TrophyDefinition } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { X, Lock, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

interface SpecimenVaultDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelectedId?: string | null;
}

export function SpecimenVaultDrawer({ isOpen, onClose, initialSelectedId }: SpecimenVaultDrawerProps) {
  const { unlockedTrophies } = useHabitStore();
  const [selectedTrophy, setSelectedTrophy] = useState<TrophyDefinition | null>(null);

  useEffect(() => {
    if (initialSelectedId) {
      const match = TROPHIES_ROSTER.find((t) => t.id === initialSelectedId);
      if (match) setSelectedTrophy(match);
    }
  }, [initialSelectedId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (selectedTrophy) {
          setSelectedTrophy(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedTrophy, onClose]);

  if (!isOpen) return null;

  const unlockedCount = unlockedTrophies.length;
  const totalCount = TROPHIES_ROSTER.length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vault-drawer-title"
      className="fixed inset-0 z-50 flex items-center justify-end bg-[#1A3629]/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl h-full bg-[#1A1A1A] border-l-2 border-[#1A3629] flex flex-col shadow-[-10px_0px_30px_rgba(0,0,0,0.4)] animate-in slide-in-from-right duration-300">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#FFFDF9]/10 bg-[#141414] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2A1810] border border-[#D97706]/40 flex items-center justify-center text-[#F59E0B]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="vault-drawer-title" className="font-cabinet font-extrabold text-lg text-[#FFFDF9] tracking-tight">
                Specimen Vault
              </h2>
              <p className="font-sans text-xs text-[#FFFDF9]/60">
                {unlockedCount} of {totalCount} specimens unlocked
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#FFFDF9]/15 bg-[#242424] text-[#FFFDF9] hover:bg-[#FFFDF9] hover:text-[#1A1A1A] transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Close vault"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Velvet Cushion Shelf Body */}
        <div 
          className="flex-1 overflow-y-auto p-6 flex flex-col gap-6"
          style={{
            backgroundColor: '#4A0D17',
            backgroundImage: `
              radial-gradient(ellipse at 50% 30%, #6E1524 0%, #3B0912 80%),
              repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.03) 40px),
              repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.03) 40px)
            `,
            boxShadow: 'inset 0 10px 40px rgba(0,0,0,0.6)'
          }}
        >
          <div className="flex items-center justify-between border-b border-[#FFFDF9]/15 pb-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#FCD34D]">
              Royal Velvet Showcase
            </span>
            <span className="font-mono text-xs text-[#FFFDF9]/70">
              Tap any pedestal to inspect
            </span>
          </div>

          {/* Grid of Trophy Pedestals */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {TROPHIES_ROSTER.map((trophy) => {
              const isUnlocked = unlockedTrophies.includes(trophy.id);

              return (
                <button
                  key={trophy.id}
                  type="button"
                  onClick={() => {
                    retroAudio.playInspectConfirm();
                    haptics.tap();
                    setSelectedTrophy(trophy);
                  }}
                  className="flex flex-col items-center p-3 rounded-2xl border border-[#FFFDF9]/15 bg-[#1B0509]/60 hover:bg-[#1B0509]/90 hover:border-[#FCD34D]/60 transition-all cursor-pointer group shadow-[0_6px_16px_rgba(0,0,0,0.4)]"
                >
                  <div className="w-24 h-24 relative flex items-center justify-center mb-2">
                    {isUnlocked ? (
                      <Image
                        src={trophy.spriteUrl}
                        alt={trophy.title}
                        fill
                        className="object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform select-none"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    ) : (
                      <Image
                        src="/assets/trophies/trophy_lock.png"
                        alt="Locked Pedestal"
                        fill
                        className="object-contain opacity-70 group-hover:opacity-100 transition-opacity select-none"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    )}
                  </div>

                  <span className="font-cabinet font-extrabold text-xs text-[#FFFDF9] text-center line-clamp-1 group-hover:text-[#FCD34D] transition-colors">
                    {isUnlocked ? trophy.title : 'Locked Specimen'}
                  </span>

                  <span className={`text-[10px] font-mono mt-0.5 px-2 py-0.5 rounded-full border ${
                    isUnlocked
                      ? (trophy.isShame
                          ? 'border-[#EF4444]/30 text-[#FCA5A5] bg-[#7F1D1D]/40'
                          : 'border-[#10B981]/30 text-[#6EE7B7] bg-[#064E3B]/40')
                      : 'border-[#FFFDF9]/20 text-[#FFFDF9]/50 bg-black/40'
                  }`}>
                    {isUnlocked ? (trophy.isShame ? 'Shame' : 'Pride') : 'Locked'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info strip */}
        <div className="px-6 py-4 border-t border-[#FFFDF9]/10 bg-[#141414] flex items-center justify-between text-xs text-[#FFFDF9]/60 font-sans">
          <span>Earn trophies by sustaining streaks and logging daily.</span>
          <span className="font-mono text-[#FCD34D] font-bold">+50 XP per trophy</span>
        </div>
      </div>

      {/* Enlarged Trophy Inspect Modal */}
      {selectedTrophy && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedTrophy(null);
          }}
        >
          <div className="w-full max-w-md bg-[#FFFDF9] border-2 border-[#1A3629] rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_#1A3629] flex flex-col items-center text-center gap-4 relative">
            <button
              type="button"
              onClick={() => setSelectedTrophy(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full border border-[#1A3629]/20 bg-[#FAF8F5] text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9] transition-colors flex items-center justify-center cursor-pointer"
              aria-label="Close detail"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Big Pixel Trophy Sprite */}
            <div className="w-40 h-40 relative my-2 bg-[#FAF8F5] rounded-2xl border border-[#1A3629]/15 p-2 flex items-center justify-center shadow-inner">
              {unlockedTrophies.includes(selectedTrophy.id) ? (
                <Image
                  src={selectedTrophy.spriteUrl}
                  alt={selectedTrophy.title}
                  fill
                  className="object-contain select-none"
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : (
                <Image
                  src="/assets/trophies/trophy_lock.png"
                  alt="Locked Trophy"
                  fill
                  className="object-contain select-none"
                  style={{ imageRendering: 'pixelated' }}
                />
              )}
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono font-bold mb-1.5">
                {selectedTrophy.isShame ? (
                  <span className="text-[#991B1B] bg-[#FEE2E2] px-2 py-0.5 rounded-md border border-[#EF4444]/30 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-[#DC2626]" />
                    <span>Trophy of Shame</span>
                  </span>
                ) : (
                  <span className="text-[#065F46] bg-[#ECFDF5] px-2 py-0.5 rounded-md border border-[#10B981]/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#10B981]" />
                    <span>Honor Specimen</span>
                  </span>
                )}
              </div>

              <h3 className="font-cabinet font-extrabold text-2xl text-[#1A3629] tracking-tight">
                {selectedTrophy.title}
              </h3>
              <p className="font-cabinet font-bold text-sm text-[#4A5D4E] mt-0.5">
                {selectedTrophy.subtitle}
              </p>
            </div>

            <p className="font-sans text-xs sm:text-sm text-[#1A3629]/80 leading-relaxed bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#1A3629]/10">
              {selectedTrophy.description}
            </p>

            <div className="w-full flex items-center justify-between border-t border-[#1A3629]/10 pt-3 font-mono text-xs text-[#4A5D4E]">
              <span>Condition:</span>
              <span className="font-bold text-[#1A3629]">{selectedTrophy.unlockCondition}</span>
            </div>

            <button
              type="button"
              onClick={() => setSelectedTrophy(null)}
              className="w-full py-2.5 rounded-xl bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs hover:bg-[#2C4A3B] transition-colors cursor-pointer mt-1"
            >
              Return to Showcase
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
