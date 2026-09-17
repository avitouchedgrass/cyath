'use client';

import React, { useState } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { xpParticleEmitter } from '@/lib/particleEmitter';

export type QuickPlateType = 'balanced_whole_food' | 'high_protein_sprint' | 'suboptimal_friction';

interface QuickPlateOption {
  type: QuickPlateType;
  label: string;
  badge: string;
  proteinGrams: number;
  wholeFoodScore: number;
  description: string;
  microIntervention?: {
    title: string;
    advice: string;
    waterAmountLiters: number;
  };
}

const QUICK_PLATES: QuickPlateOption[] = [
  {
    type: 'balanced_whole_food',
    label: 'Balanced Whole Food Plate',
    badge: 'GOLD STANDARD · 100 PTS',
    proteinGrams: 35,
    wholeFoodScore: 100,
    description: 'Clean bioavailable protein floor, fiber-dense complex carbohydrates, and essential fats.',
  },
  {
    type: 'high_protein_sprint',
    label: 'High Protein Sprint',
    badge: 'ANABOLIC DENSE · 90 PTS',
    proteinGrams: 52,
    wholeFoodScore: 90,
    description: 'Targeted high-protein anchor prioritizing rapid muscle protein synthesis and leucine satiety.',
  },
  {
    type: 'suboptimal_friction',
    label: 'Sub-Optimal / Friction Meal',
    badge: 'RECOVERY MITIGATION · 40 PTS',
    proteinGrams: 18,
    wholeFoodScore: 40,
    description: 'High-glycemic, processed, or low-protein intake. Triggers an active digestive countermeasure.',
    microIntervention: {
      title: 'Digestive & Glycemic Countermeasure',
      advice: 'Blunt the reactive insulin spike: Drink 500ml water and complete a gentle 10-minute post-prandial stroll.',
      waterAmountLiters: 0.5,
    },
  },
];

interface QuickPlateFallbackProps {
  onLogged?: (summary: string) => void;
}

export function QuickPlateFallback({ onLogged }: QuickPlateFallbackProps) {
  const { currentDate, logMealToDay, setHydration, getDailyLog } = useHabitStore();
  const [activeIntervention, setActiveIntervention] = useState<QuickPlateOption['microIntervention'] | null>(null);
  const [lastLoggedType, setLastLoggedType] = useState<QuickPlateType | null>(null);

  const handleSelectPlate = (plate: QuickPlateOption, e: React.MouseEvent) => {
    retroAudio.playInspectConfirm();
    if (typeof window !== 'undefined') {
      xpParticleEmitter.emit(e.clientX, e.clientY, 8);
    }

    logMealToDay({
      name: plate.label,
      protein: plate.proteinGrams,
      calories: plate.proteinGrams * 4 + (plate.type === 'suboptimal_friction' ? 450 : 250),
      isVegetarian: false,
      ingredients: [{ item: `${plate.label} (Whole Food Index: ${plate.wholeFoodScore})`, amount: '1 plate' }],
      suggestedSprite: '/assets/food/generic-plate.webp',
    }, currentDate);

    setLastLoggedType(plate.type);

    if (plate.microIntervention) {
      setActiveIntervention(plate.microIntervention);
    } else {
      setActiveIntervention(null);
    }

    const summaryMsg = `Logged ${plate.label} (+${plate.proteinGrams}g Protein · Score: ${plate.wholeFoodScore})`;
    if (onLogged) onLogged(summaryMsg);
  };

  const handleApplyIntervention = (intervention: NonNullable<QuickPlateOption['microIntervention']>) => {
    retroAudio.playTierUpgrade();
    const currentLog = getDailyLog(currentDate);
    const newHydration = Number(((currentLog.hydrationLiters || 0) + intervention.waterAmountLiters).toFixed(1));
    setHydration(newHydration, currentDate);
    setActiveIntervention(null);
    if (onLogged) {
      onLogged(`Countermeasure applied: +${intervention.waterAmountLiters}L Hydration logged to blunt glycemic spike.`);
    }
  };

  return (
    <div className="w-full flex flex-col gap-3 p-4 sm:p-5 rounded-2xl border border-[#1A2E26]/15 bg-[#FDFBF7] shadow-[2px_2px_0px_rgba(26,46,38,0.08)]">
      <div className="flex items-center justify-between border-b border-[#1A2E26]/10 pb-2.5">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#1A2E26]/70 block">
            Low-Friction Quick Plate Fallback
          </span>
          <h4 className="font-cabinet font-bold text-sm text-[#1A2E26]">
            1-Tap Nutritional Ledger
          </h4>
        </div>
        <span className="font-mono text-[10px] text-[#4A5D4E] bg-[#FAF6EE] px-2 py-0.5 rounded border border-[#1A2E26]/10">
          Zero-Friction Macro Floor
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {QUICK_PLATES.map((plate) => {
          const isSelected = lastLoggedType === plate.type;
          return (
            <button
              key={plate.type}
              type="button"
              onClick={(e) => handleSelectPlate(plate, e)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 shadow-[2px_2px_0px_rgba(26,46,38,0.06)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none ${
                plate.type === 'balanced_whole_food'
                  ? 'border-[#1A2E26]/20 bg-[#FFFDF9] hover:border-[#1A2E26]'
                  : plate.type === 'high_protein_sprint'
                  ? 'border-[#065F46]/30 bg-[#F0FDF4] hover:border-[#065F46]'
                  : 'border-[#D97706]/30 bg-[#FFFBEB] hover:border-[#D97706]'
              }`}
            >
              <div className="flex flex-col gap-1">
                <span className={`font-mono text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded self-start ${
                  plate.type === 'balanced_whole_food'
                    ? 'bg-[#1A2E26]/10 text-[#1A2E26]'
                    : plate.type === 'high_protein_sprint'
                    ? 'bg-[#065F46]/15 text-[#065F46]'
                    : 'bg-[#D97706]/15 text-[#92400E]'
                }`}>
                  {plate.badge}
                </span>
                <span className="font-cabinet font-bold text-xs text-[#1A2E26] leading-snug">
                  {plate.label}
                </span>
                <p className="text-[11px] font-sans text-[#4A5D4E] leading-relaxed">
                  {plate.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#1A2E26]/10 font-mono text-[11px] font-bold">
                <span className="text-[#1A2E26]">+{plate.proteinGrams}g Protein</span>
                <span className="text-[#065F46] font-cabinet">
                  {isSelected ? '✓ Logged' : '1-Tap Log →'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {activeIntervention && (
        <div className="mt-2 p-3.5 rounded-xl border border-[#D97706]/40 bg-[#FEF3C7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#92400E]">
              {activeIntervention.title}
            </span>
            <p className="font-sans text-xs text-[#78350F] leading-snug">
              {activeIntervention.advice}
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleApplyIntervention(activeIntervention)}
            className="px-3 py-1.5 rounded-lg border border-[#92400E] bg-[#92400E] hover:bg-[#78350F] text-[#FFFDF9] font-cabinet font-bold text-xs transition-all cursor-pointer shrink-0"
          >
            Apply +500ml Water Countermeasure
          </button>
        </div>
      )}
    </div>
  );
}
