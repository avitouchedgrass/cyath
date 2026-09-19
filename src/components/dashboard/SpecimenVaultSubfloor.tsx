'use client';

import React, { useState, useMemo } from 'react';
import { useHabitStore, TROPHIES_ROSTER, TrophyDefinition } from '@/store/useHabitStore';
import { TrophyRelicSprite } from '@/components/dashboard/TrophyRelicSprite';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { X } from 'lucide-react';

type FilterCategory = 'all' | 'keystones' | 'streaks' | 'mastery' | 'shame';

export function SpecimenVaultSubfloor() {
  const { unlockedTrophies } = useHabitStore();
  const [selectedTrophy, setSelectedTrophy] = useState<TrophyDefinition | null>(null);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');

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

  return (
    <section
      id="specimen-reliquary"
      className="w-full mt-12 pt-10 pb-16 border-t border-[#1A3629]/15 flex flex-col gap-6"
    >
      {/* Archival Museum Header */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#EDE8DF] border border-[#1A3629]/15 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(26,54,41,0.03)]">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-cabinet font-extrabold text-2xl sm:text-3xl text-[#1A3629] tracking-tight">
              The Specimen Reliquary
            </h2>
            <span className="font-mono text-xs font-bold text-[#1A3629] bg-[#FFFDF9] border border-[#1A3629]/15 px-3 py-1 rounded-full shadow-2xs">
              {unlockedCount} / {totalCount} Secured
            </span>
          </div>
          <p className="font-sans text-xs text-[#4A5D4E] mt-1">
            Uniform archival chalices minted through habit consistency and circadian discipline.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#E2DBD0] border border-[#1A3629]/12 self-start md:self-auto flex-wrap">
          {(
            [
              { id: 'all', label: 'All (20)' },
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
              className={`px-3 py-1.5 rounded-xl text-xs font-cabinet font-bold transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#FFFDF9] text-[#1A3629] shadow-2xs'
                  : 'text-[#4A5D4E] hover:text-[#1A3629]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 20-Relic Uniform Archival Pedestal Grid */}
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
              className={`flex flex-col items-center p-4 rounded-2xl border transition-all cursor-pointer group text-center relative overflow-hidden ${
                isUnlocked
                  ? 'border-[#1A3629]/15 bg-[#FAF7F0] hover:bg-[#FFFDF9] hover:border-[#1A3629]/30 shadow-[inset_0_2px_8px_rgba(26,54,41,0.04)]'
                  : 'border-dashed border-[#1A3629]/15 bg-[#EAE5DC]/60 opacity-40 grayscale hover:opacity-60 transition-opacity'
              }`}
            >
              {/* Recessed Plinth Alcove Backing */}
              <div
                className={`pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  isUnlocked
                    ? trophy.isShame
                      ? 'bg-radial from-red-500/8 to-transparent'
                      : trophy.tier === 'Celestial'
                      ? 'bg-radial from-purple-500/10 to-transparent'
                      : 'bg-radial from-amber-500/10 to-transparent'
                    : 'bg-radial from-slate-500/5 to-transparent'
                }`}
                aria-hidden="true"
              />

              {/* Uniform Pixel Art Trophy Chalice */}
              <div className={`w-20 h-20 sm:w-24 sm:h-24 relative flex items-center justify-center mb-2.5 z-10 ${
                isUnlocked ? 'group-hover:scale-105 transition-transform duration-200' : 'opacity-60'
              }`}>
                <TrophyRelicSprite
                  trophyId={trophy.id}
                  tier={trophy.tier}
                  isUnlocked={isUnlocked}
                  size={80}
                />
              </div>

              {/* Engraved Plinth Nameplate */}
              <span className={`font-cabinet font-extrabold text-xs line-clamp-1 w-full z-10 ${
                isUnlocked ? 'text-[#1A3629] group-hover:text-[#2C4A3B] transition-colors' : 'text-[#1A3629]/40'
              }`}>
                {isUnlocked ? trophy.title : 'Locked Specimen'}
              </span>

              <div className="flex items-center gap-1.5 mt-1 z-10">
                <span className={`text-[10px] font-mono uppercase tracking-wider ${
                  isUnlocked ? (trophy.isShame ? 'text-red-700 font-bold' : 'text-[#4A5D4E]') : 'text-[#4A5D4E]/40'
                }`}>
                  {isUnlocked ? trophy.tier || (trophy.isShame ? 'Shame' : 'Standard') : 'Locked'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Cinematic Cardless Trophy Inspection Modal */}
      {selectedTrophy && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-70 flex items-center justify-center p-6 sm:p-12 bg-[#1A3629]/65 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedTrophy(null);
          }}
        >
          <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16 relative">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedTrophy(null)}
              className="absolute -top-4 right-0 sm:right-4 w-10 h-10 rounded-full border border-white/20 bg-black/40 text-white hover:bg-white hover:text-[#1A3629] transition-colors flex items-center justify-center cursor-pointer z-20"
              aria-label="Close inspection"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Side: Monumental Cardless Floating Chalice */}
            <div className="relative w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] md:w-[420px] md:h-[420px] flex items-center justify-center select-none shrink-0 animate-[islandFloat_6s_ease-in-out_infinite]">
              {/* Soft Ambient Glow */}
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

            {/* Right Side: Museum Editorial Lore */}
            <div className="flex-1 flex flex-col gap-4 text-left text-white max-w-lg">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/90">
                  {selectedTrophy.tier || (selectedTrophy.isShame ? 'Shame' : 'Standard')} Relic
                </span>
                {selectedTrophy.isShame && (
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-red-500/20 border border-red-400/40 text-red-200">
                    Satirical Shame
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
                  <div className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 font-cabinet font-bold text-xs">
                    <span>Unlocked &amp; Claimed</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white/70 font-cabinet font-bold text-xs">
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
    </section>
  );
}
