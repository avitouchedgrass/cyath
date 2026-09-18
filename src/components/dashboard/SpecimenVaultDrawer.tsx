'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useHabitStore, TROPHIES_ROSTER, TrophyDefinition } from '@/store/useHabitStore';
import { TrophyRelicSprite } from '@/components/dashboard/TrophyRelicSprite';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { X, Lock, CheckCircle2, AlertTriangle, Shield } from 'lucide-react';

interface SpecimenVaultDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelectedId?: string | null;
}

type FilterCategory = 'all' | 'keystones' | 'streaks' | 'mastery' | 'shame';

export function SpecimenVaultDrawer({ isOpen, onClose, initialSelectedId }: SpecimenVaultDrawerProps) {
  const { unlockedTrophies } = useHabitStore();
  const [selectedTrophy, setSelectedTrophy] = useState<TrophyDefinition | null>(null);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');

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

  const unlockedCount = unlockedTrophies.length;
  const totalCount = TROPHIES_ROSTER.length;

  const filteredTrophies = useMemo(() => {
    if (activeCategory === 'all') return TROPHIES_ROSTER;
    if (activeCategory === 'shame') return TROPHIES_ROSTER.filter((t) => t.isShame);
    if (activeCategory === 'keystones') {
      return TROPHIES_ROSTER.filter((t) =>
        ['solar_vanguard', 'iron_anchor', 'hydration_alchemist', 'first_light'].includes(t.id)
      );
    }
    if (activeCategory === 'streaks') {
      return TROPHIES_ROSTER.filter((t) =>
        ['streak_7d', 'streak_30d', 'forged_reentry', 'protein_streak'].includes(t.id)
      );
    }
    // mastery
    return TROPHIES_ROSTER.filter(
      (t) =>
        !t.isShame &&
        !['solar_vanguard', 'iron_anchor', 'hydration_alchemist', 'first_light', 'streak_7d', 'streak_30d', 'forged_reentry', 'protein_streak'].includes(t.id)
    );
  }, [activeCategory]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vault-drawer-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#050A07]/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Slide-Up Obsidian & Burnished Brass Reliquary Chamber */}
      <div className="w-full max-w-6xl max-h-[88vh] bg-[#0A120D] border-t border-x border-[#2A3E31] rounded-t-3xl flex flex-col shadow-[0_-30px_90px_rgba(0,0,0,0.85)] animate-in slide-in-from-bottom duration-300 overflow-hidden">
        
        {/* Machined Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 sm:px-8 py-5 border-b border-[#1E2E24] bg-[#0E1A12] shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#060D09] border border-[#2A3E31] flex items-center justify-center text-[#FBBF24] shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 id="vault-drawer-title" className="font-cabinet font-extrabold text-xl sm:text-2xl text-[#E2E8F0] tracking-tight">
                  Specimen Reliquary
                </h2>
                <span className="font-mono text-xs font-bold text-[#FBBF24] bg-[#FBBF24]/10 border border-[#FBBF24]/20 px-2.5 py-0.5 rounded-full">
                  {unlockedCount} // {totalCount} CLAIMED
                </span>
              </div>
              <p className="font-sans text-xs text-[#738A7D] mt-0.5">
                Uniform pixel-art chalice trophies minted through biological consistency.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#060D09] border border-[#1E2E24]">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'keystones', label: 'Keystones' },
                  { id: 'streaks', label: 'Streaks' },
                  { id: 'mastery', label: 'Mastery' },
                  { id: 'shame', label: 'Shame' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    retroAudio.playBlip();
                    haptics.tap();
                    setActiveCategory(cat.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-cabinet font-bold transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-[#1E2E24] text-[#E2E8F0] shadow-xs'
                      : 'text-[#738A7D] hover:text-[#E2E8F0]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full border border-[#2A3E31] bg-[#060D09] text-[#738A7D] hover:text-[#E2E8F0] hover:border-[#E2E8F0]/30 transition-colors flex items-center justify-center cursor-pointer"
              aria-label="Close reliquary"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 20-Trophy Uniform Recessed Alcoves Grid */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#08100B]">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {filteredTrophies.map((trophy) => {
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
                  className="flex flex-col items-center p-4 rounded-2xl border border-[#1A2820] bg-[#060D09] hover:bg-[#0C1711] hover:border-[#344E3E] transition-all cursor-pointer group shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)] text-center relative overflow-hidden"
                >
                  {/* Subtle Alcove Lighting Behind Pedestal */}
                  <div
                    className={`pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                      isUnlocked
                        ? trophy.isShame
                          ? 'bg-radial from-red-500/10 to-transparent'
                          : trophy.tier === 'Celestial'
                          ? 'bg-radial from-purple-500/15 to-transparent'
                          : 'bg-radial from-amber-500/15 to-transparent'
                        : 'bg-radial from-slate-500/5 to-transparent'
                    }`}
                    aria-hidden="true"
                  />

                  {/* Uniform Pixel Art Trophy Chalice */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 relative flex items-center justify-center mb-2.5 z-10 group-hover:scale-105 transition-transform duration-200">
                    <TrophyRelicSprite
                      trophyId={trophy.id}
                      tier={trophy.tier}
                      isUnlocked={isUnlocked}
                      size={80}
                    />
                  </div>

                  {/* Engraved Plinth Nameplate */}
                  <span className="font-cabinet font-extrabold text-xs text-[#E2E8F0] line-clamp-1 w-full group-hover:text-white transition-colors z-10">
                    {isUnlocked ? trophy.title : 'Locked Specimen'}
                  </span>

                  <div className="flex items-center gap-1.5 mt-1 z-10">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#738A7D]">
                      {isUnlocked ? trophy.tier || (trophy.isShame ? 'Shame' : 'Standard') : 'Encrypted'}
                    </span>
                    {trophy.isShame && isUnlocked && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Engraving Bar */}
        <div className="px-6 sm:px-8 py-3.5 border-t border-[#1E2E24] bg-[#0E1A12] flex items-center justify-between text-xs text-[#738A7D] font-sans">
          <span>Click any specimen to inspect high-resolution chalice lore.</span>
          <span className="font-mono text-[#FBBF24] font-bold">+50 XP per unlocked relic</span>
        </div>
      </div>

      {/* Cinematic Cardless Trophy Inspection Modal */}
      {selectedTrophy && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-70 flex items-center justify-center p-6 sm:p-12 bg-[#050A07]/85 backdrop-blur-2xl animate-in fade-in duration-200"
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

            {/* Left Side: Monumental Cardless Floating Trophy */}
            <div className="relative w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] md:w-[420px] md:h-[420px] flex items-center justify-center select-none shrink-0 animate-[islandFloat_6s_ease-in-out_infinite]">
              {/* Soft Ambient Halo */}
              <div 
                className={`pointer-events-none absolute inset-0 rounded-full blur-3xl ${
                  unlockedTrophies.includes(selectedTrophy.id)
                    ? selectedTrophy.isShame
                      ? 'bg-radial from-red-500/25 via-red-900/10 to-transparent'
                      : selectedTrophy.tier === 'Celestial'
                      ? 'bg-radial from-purple-500/25 via-cyan-500/10 to-transparent'
                      : 'bg-radial from-amber-400/25 via-amber-600/10 to-transparent'
                    : 'bg-radial from-slate-600/15 via-slate-800/10 to-transparent'
                }`}
                aria-hidden="true"
              />

              <TrophyRelicSprite
                trophyId={selectedTrophy.id}
                tier={selectedTrophy.tier}
                isUnlocked={unlockedTrophies.includes(selectedTrophy.id)}
                size={340}
              />
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
                    <span>Locked Specimen</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedTrophy(null)}
                  className="px-5 py-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white hover:text-[#1A3629] text-white font-cabinet font-bold text-xs transition-colors cursor-pointer"
                >
                  Back to Reliquary
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
