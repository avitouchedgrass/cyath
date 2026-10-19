'use client';

import React, { useState, useEffect } from 'react';
import { useHabitStore, DEFAULT_SLUMP_ROUTINE_CONFIG, CUSTOM_HABITS_LIBRARY } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { PixelCheck, PixelX, PixelBolt } from '@/components/common/PixelIcons';

export interface PersonalizeSlumpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PersonalizeSlumpModal({ isOpen, onClose }: PersonalizeSlumpModalProps) {
  const { userProfile, updateSlumpRoutineConfig, habits } = useHabitStore();

  const currentConfig = userProfile?.slumpRoutineConfig || DEFAULT_SLUMP_ROUTINE_CONFIG;

  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>(currentConfig.essentialHabitIds);
  const [hydrationLiters, setHydrationLiters] = useState<number>(currentConfig.hydrationTargetLiters);
  const [includeProtein, setIncludeProtein] = useState<boolean>(currentConfig.includeProtein);
  const [proteinGrams, setProteinGrams] = useState<number>(currentConfig.proteinTargetGrams);
  const [requireOnlyEssentials, setRequireOnlyEssentials] = useState<boolean>(
    currentConfig.requireOnlyEssentialsForSeal
  );
  const [stripSleepMarkers, setStripSleepMarkers] = useState<boolean>(
    currentConfig.stripSleepMarkers ?? DEFAULT_SLUMP_ROUTINE_CONFIG.stripSleepMarkers ?? true
  );

  useEffect(() => {
    if (isOpen) {
      const cfg = userProfile?.slumpRoutineConfig || DEFAULT_SLUMP_ROUTINE_CONFIG;
      setSelectedHabitIds(cfg.essentialHabitIds);
      setHydrationLiters(cfg.hydrationTargetLiters);
      setIncludeProtein(cfg.includeProtein);
      setProteinGrams(cfg.proteinTargetGrams);
      setRequireOnlyEssentials(cfg.requireOnlyEssentialsForSeal);
      setStripSleepMarkers(cfg.stripSleepMarkers ?? true);
    }
  }, [isOpen, userProfile?.slumpRoutineConfig]);

  if (!isOpen) return null;

  const handleToggleHabit = (id: string) => {
    retroAudio.playBlip();
    haptics.tap();
    setSelectedHabitIds((prev) => {
      if (prev.includes(id)) {
        // Prevent deselecting everything to ensure at least 1 essential remains
        if (prev.length <= 1) return prev;
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  };

  const handleSave = () => {
    retroAudio.playInspectConfirm();
    haptics.success();
    const hasProtein = selectedHabitIds.includes('protein_target');
    updateSlumpRoutineConfig({
      essentialHabitIds: selectedHabitIds,
      hydrationTargetLiters: hydrationLiters,
      includeProtein: hasProtein || includeProtein,
      proteinTargetGrams: proteinGrams,
      requireOnlyEssentialsForSeal: requireOnlyEssentials,
      stripSleepMarkers,
    });
    onClose();
  };

  const handleResetDefaults = () => {
    retroAudio.playBlip();
    haptics.tap();
    setSelectedHabitIds(DEFAULT_SLUMP_ROUTINE_CONFIG.essentialHabitIds);
    setHydrationLiters(DEFAULT_SLUMP_ROUTINE_CONFIG.hydrationTargetLiters);
    setIncludeProtein(DEFAULT_SLUMP_ROUTINE_CONFIG.includeProtein);
    setProteinGrams(DEFAULT_SLUMP_ROUTINE_CONFIG.proteinTargetGrams);
    setRequireOnlyEssentials(DEFAULT_SLUMP_ROUTINE_CONFIG.requireOnlyEssentialsForSeal);
    setStripSleepMarkers(DEFAULT_SLUMP_ROUTINE_CONFIG.stripSleepMarkers ?? true);
  };

  const customSlotId = userProfile?.customHabitSlot;
  const customHabit = customSlotId ? CUSTOM_HABITS_LIBRARY.find((c) => c.id === customSlotId) : null;

  const selectableHabits = [
    {
      id: 'sunlight',
      title: 'Morning Light',
      subtitle: '10m outside daylight to signal your body clock without eye strain',
      badge: 'Circadian Base',
    },
    {
      id: 'hydration',
      title: 'Hydration Target',
      subtitle: `Drink ${hydrationLiters}L of water (scaled down from 2.5L standard)`,
      badge: 'Cellular Base',
    },
    {
      id: 'protein_target',
      title: 'Whole-Food Protein',
      subtitle: `Hit ${proteinGrams}g gentle protein (scaled down from 140g target)`,
      badge: 'Fuel Base',
    },
    {
      id: 'movement',
      title: 'Restorative Movement',
      subtitle: '5m gentle walk or mobility to keep lymphatic circulation going',
      badge: 'Gentle Motion',
    },
    {
      id: 'digital_sunset',
      title: 'Bedtime Screen Curfew',
      subtitle: 'Screens off 60m pre-bed to ensure restorative sleep tonight',
      badge: 'Recovery',
    },
    ...(customHabit
      ? [
          {
            id: customHabit.id,
            title: customHabit.title,
            subtitle: 'Your active personalized power habit',
            badge: 'Custom',
          },
        ]
      : []),
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="slump-modal-title"
      className="fixed inset-0 z-80 flex items-center justify-center p-3 sm:p-4 bg-[#0E1A14]/80 backdrop-blur-sm animate-in fade-in duration-200 select-none overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-[#FFFDF9] border-3 border-[#1A3629] rounded-3xl p-5 sm:p-7 shadow-[8px_8px_0px_#1A3629] flex flex-col gap-5 my-auto relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b-2 border-[#1A3629]/15">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#FEF3C7] border border-[#D97706]/40 text-[#92400E] text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <PixelBolt size={11} color="#B45309" />
                <span>Streak Protection</span>
              </span>
            </div>
            <h2 id="slump-modal-title" className="font-cabinet font-black text-xl sm:text-2xl text-[#1A3629] tracking-tight">
              Personalize Slump Routine
            </h2>
            <p className="font-sans text-xs text-[#4A5D4E] leading-relaxed">
              When energy crashes or you feel wiped, Cyath strips away heavy requirements to keep your streak alive. Choose your bare essentials.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border-2 border-[#1A3629] bg-[#FAF8F5] text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9] transition-colors flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <PixelX size={14} />
          </button>
        </div>

        {/* Section 1: Slump Essentials Checklist */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-[#1A3629] uppercase tracking-wider">
              1. Slump Essentials Checklist
            </span>
            <span className="font-mono text-[11px] text-[#4A5D4E]">
              {selectedHabitIds.length} Selected
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {selectableHabits.map((h) => {
              const isChecked = selectedHabitIds.includes(h.id);
              return (
                <div
                  key={h.id}
                  onClick={() => handleToggleHabit(h.id)}
                  className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isChecked
                      ? 'border-[#1A3629] bg-[#FAF6EE] shadow-2xs'
                      : 'border-[#1A3629]/15 bg-[#FFFDF9] hover:bg-[#FAF8F5] opacity-75'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-md border-2 border-[#1A3629] mt-0.5 flex items-center justify-center shrink-0 ${
                        isChecked ? 'bg-[#1A3629]' : 'bg-[#FFFDF9]'
                      }`}
                    >
                      {isChecked && <PixelCheck size={12} color="#FFFDF9" />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-cabinet font-bold text-xs sm:text-sm text-[#1A3629]">
                          {h.title}
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border border-[#1A3629]/20 bg-[#FFFDF9] text-[#4A5D4E]">
                          {h.badge}
                        </span>
                      </div>
                      <span className="font-sans text-[11px] text-[#4A5D4E] leading-snug mt-0.5">
                        {h.subtitle}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Hydration Target during Slump */}
        {selectedHabitIds.includes('hydration') && (
          <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#1A3629]/15">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#1A3629]">
                2. Slump Hydration Baseline
              </span>
              <span className="font-mono text-xs font-bold text-[#065F46]">
                {hydrationLiters} Liters
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1.0, 1.5, 2.0].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    retroAudio.playBlip();
                    haptics.tap();
                    setHydrationLiters(val);
                  }}
                  className={`py-2 px-3 rounded-xl border-2 text-xs font-mono font-bold cursor-pointer transition-all text-center ${
                    hydrationLiters === val
                      ? 'border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] shadow-2xs'
                      : 'border-[#1A3629]/20 bg-[#FFFDF9] text-[#1A3629] hover:bg-[#FAF6EE]'
                  }`}
                >
                  {val === 1.0 ? '1.0L (Default)' : `${val}L`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Protein Target during Slump */}
        {selectedHabitIds.includes('protein_target') && (
          <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#1A3629]/15">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#1A3629]">
                3. Slump Protein Target
              </span>
              <span className="font-mono text-xs font-bold text-[#065F46]">
                {proteinGrams}g (Single Meal)
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[30, 40, 50].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    retroAudio.playBlip();
                    haptics.tap();
                    setProteinGrams(val);
                  }}
                  className={`py-2 px-3 rounded-xl border-2 text-xs font-mono font-bold cursor-pointer transition-all text-center ${
                    proteinGrams === val
                      ? 'border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] shadow-2xs'
                      : 'border-[#1A3629]/20 bg-[#FFFDF9] text-[#1A3629] hover:bg-[#FAF6EE]'
                  }`}
                >
                  {val === 40 ? '40g (Default)' : `${val}g`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Section 4: Stripped Down Seal Rule */}
        <div className="p-3.5 rounded-2xl bg-[#ECFDF5] border border-[#10B981]/30 flex items-start gap-3">
          <input
            id="chk-require-essentials"
            type="checkbox"
            checked={requireOnlyEssentials}
            onChange={(e) => {
              retroAudio.playBlip();
              setRequireOnlyEssentials(e.target.checked);
            }}
            className="w-4 h-4 rounded accent-[#065F46] mt-0.5 cursor-pointer shrink-0"
          />
          <label htmlFor="chk-require-essentials" className="flex flex-col cursor-pointer">
            <span className="font-cabinet font-bold text-xs text-[#065F46]">
              Strip Down Daily Ledger Seal (Recommended)
            </span>
            <span className="font-sans text-[11px] text-[#065F46]/80 leading-relaxed">
              When in a slump, unlock today&apos;s daily seal ceremony as soon as these essentials are checked. Protects your streak from unmitigated burnout.
            </span>
          </label>
        </div>

        {/* Section 5: Strip Sleep Phase & Debrief Markers */}
        <div className="p-3.5 rounded-2xl bg-[#FEF3C7]/60 border border-[#D97706]/30 flex items-start gap-3">
          <input
            id="chk-strip-sleep-markers"
            type="checkbox"
            checked={stripSleepMarkers}
            onChange={(e) => {
              retroAudio.playBlip();
              setStripSleepMarkers(e.target.checked);
            }}
            className="w-4 h-4 rounded accent-[#B45309] mt-0.5 cursor-pointer shrink-0"
          />
          <label htmlFor="chk-strip-sleep-markers" className="flex flex-col cursor-pointer">
            <span className="font-cabinet font-bold text-xs text-[#92400E]">
              Cut Off Caffeine &amp; Meal Inputs When Exhausted (Recommended)
            </span>
            <span className="font-sans text-[11px] text-[#92400E]/85 leading-relaxed">
              When exhausted, eliminate detailed meal logging (breakfast, lunch, dinner protein) and caffeine cutoff questions from the bedtime debrief. Keep only essential sleep timing so you can rest without friction.
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t-2 border-[#1A3629]/15">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs font-mono font-bold text-[#4A5D4E] hover:text-[#1A3629] hover:underline cursor-pointer"
          >
            Reset to Defaults
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border-2 border-[#1A3629]/20 bg-[#FAF8F5] text-xs font-cabinet font-bold text-[#1A3629] hover:bg-[#EAE3D2] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] text-xs font-cabinet font-bold shadow-[2px_2px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              Save Slump Routine
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
