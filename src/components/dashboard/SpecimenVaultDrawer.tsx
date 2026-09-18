'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useHabitStore, TROPHIES_ROSTER, TrophyDefinition } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { X, Lock, CheckCircle2, AlertTriangle } from 'lucide-react';

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
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#1A3629]/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Slide-Up Bottom Drawer with 20 Trophy Grid */}
      <div className="w-full max-w-6xl max-h-[85vh] bg-[#FAF8F5] border-t border-x border-[#1A3629]/15 rounded-t-3xl flex flex-col shadow-[0_-20px_50px_rgba(26,54,41,0.15)] animate-in slide-in-from-bottom duration-300 overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#1A3629]/10 bg-[#FFFDF9] shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <h2 id="vault-drawer-title" className="font-cabinet font-extrabold text-xl sm:text-2xl text-[#1A3629] tracking-tight">
                Specimen Vault
              </h2>
              <p className="font-sans text-xs text-[#4A5D4E] mt-0.5">
                {unlockedCount} of {totalCount} specimens unlocked
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-[#1A3629]/15 bg-[#FAF8F5] text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9] transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Close vault"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 20-Trophy Clean Transparent Grid Showcase */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
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
                  className="flex flex-col items-center p-4 rounded-2xl border border-[#1A3629]/12 bg-[#FFFDF9] hover:bg-[#FAF6EE] hover:border-[#1A3629]/30 transition-all cursor-pointer group shadow-2xs text-center"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 relative flex items-center justify-center mb-2.5">
                    {isUnlocked ? (
                      <Image
                        src={trophy.spriteUrl}
                        alt={trophy.title}
                        fill
                        className="object-contain drop-shadow-[0_8px_16px_rgba(26,54,41,0.18)] group-hover:scale-110 transition-transform select-none"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    ) : (
                      <div className="w-full h-full relative opacity-40 group-hover:opacity-60 transition-opacity flex items-center justify-center">
                        <Image
                          src={trophy.spriteUrl}
                          alt={trophy.title}
                          fill
                          className="object-contain grayscale select-none"
                          style={{ imageRendering: 'pixelated' }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Lock className="w-6 h-6 text-[#1A3629]/70" />
                        </div>
                      </div>
                    )}
                  </div>

                  <span className="font-cabinet font-extrabold text-xs text-[#1A3629] line-clamp-1 w-full group-hover:text-[#2C4A3B] transition-colors">
                    {isUnlocked ? trophy.title : 'Locked Relic'}
                  </span>

                  <span className="text-[10px] font-mono text-[#4A5D4E] mt-1">
                    {trophy.tier || (trophy.isShame ? 'Shame' : 'Standard')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Info Bar */}
        <div className="px-6 sm:px-8 py-3.5 border-t border-[#1A3629]/10 bg-[#FFFDF9] flex items-center justify-between text-xs text-[#4A5D4E] font-sans">
          <span>Click any relic to inspect in full resolution.</span>
          <span className="font-mono text-[#1A3629] font-bold">+50 XP per unlock</span>
        </div>
      </div>

      {/* Cinematic Cardless Trophy Inspection Modal */}
      {selectedTrophy && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-70 flex items-center justify-center p-6 sm:p-12 bg-[#1A3629]/60 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedTrophy(null);
          }}
        >
          <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16 relative">
            
            {/* Close Button Top Right */}
            <button
              type="button"
              onClick={() => setSelectedTrophy(null)}
              className="absolute -top-4 right-0 sm:right-4 w-10 h-10 rounded-full border border-white/20 bg-black/40 text-white hover:bg-white hover:text-[#1A3629] transition-colors flex items-center justify-center cursor-pointer z-20"
              aria-label="Close detail"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Side: Monumental Cardless Transparent Floating Trophy */}
            <div className="relative w-[260px] h-[260px] sm:w-[360px] sm:h-[360px] md:w-[440px] md:h-[440px] lg:w-[480px] lg:h-[480px] flex items-center justify-center select-none shrink-0 animate-[islandFloat_6s_ease-in-out_infinite]">
              {/* Soft Ambient Halo */}
              <div 
                className="pointer-events-none absolute inset-0 rounded-full bg-radial from-amber-400/20 via-white/5 to-transparent blur-3xl"
                aria-hidden="true"
              />

              {unlockedTrophies.includes(selectedTrophy.id) ? (
                <Image
                  src={selectedTrophy.spriteUrl}
                  alt={selectedTrophy.title}
                  fill
                  className="object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.6)] select-none"
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : (
                <div className="w-full h-full relative flex items-center justify-center opacity-50">
                  <Image
                    src={selectedTrophy.spriteUrl}
                    alt={selectedTrophy.title}
                    fill
                    className="object-contain grayscale select-none"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-16 h-16 text-white/80 drop-shadow-lg" />
                  </div>
                </div>
              )}
            </div>

            {/* Right Side: Editorial Info & Lore */}
            <div className="flex-1 flex flex-col gap-4 text-left text-white max-w-lg">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/90">
                  {selectedTrophy.tier || (selectedTrophy.isShame ? 'Shame' : 'Standard')} Relic
                </span>
                {selectedTrophy.isShame && (
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-red-500/20 border border-red-400/40 text-red-200 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Satirical Shame</span>
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-cabinet font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-tight">
                  {selectedTrophy.title}
                </h3>
                <p className="font-mono text-sm text-[#FCD34D] mt-1 font-semibold">
                  {selectedTrophy.subtitle}
                </p>
              </div>

              <p className="font-sans text-sm sm:text-base text-white/80 leading-relaxed">
                {selectedTrophy.description}
              </p>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-md flex flex-col gap-1 mt-2">
                <span className="font-mono text-[11px] text-white/60 uppercase tracking-wider">
                  Unlock Requirement
                </span>
                <span className="font-cabinet font-bold text-sm text-white">
                  {selectedTrophy.unlockCondition}
                </span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                {unlockedTrophies.includes(selectedTrophy.id) ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 font-cabinet font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Unlocked &amp; Claimed</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white/70 font-cabinet font-bold text-xs">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Locked Relic</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedTrophy(null)}
                  className="px-5 py-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white hover:text-[#1A3629] text-white font-cabinet font-bold text-xs transition-colors cursor-pointer"
                >
                  Return to Vault
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
