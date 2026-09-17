'use client';

import React from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { xpParticleEmitter } from '@/lib/particleEmitter';

export type QuickPlateType = 'balanced_whole_food' | 'high_protein_sprint' | 'suboptimal_friction';

interface QuickPlateOption {
  type: QuickPlateType;
  label: string;
  badge: string;
  proteinGrams: number;
  calories: number;
}

const QUICK_PLATES: QuickPlateOption[] = [
  {
    type: 'balanced_whole_food',
    label: 'Balanced Plate',
    badge: '35g Protein',
    proteinGrams: 35,
    calories: 520,
  },
  {
    type: 'high_protein_sprint',
    label: 'High Protein Anchor',
    badge: '50g Protein',
    proteinGrams: 50,
    calories: 460,
  },
  {
    type: 'suboptimal_friction',
    label: 'Light Quick Fuel',
    badge: '20g Protein',
    proteinGrams: 20,
    calories: 320,
  },
];

interface QuickPlateFallbackProps {
  onLogged?: (summary: string) => void;
}

export function QuickPlateFallback({ onLogged }: QuickPlateFallbackProps) {
  const { currentDate, logMealToDay } = useHabitStore();

  const handleSelectPlate = (plate: QuickPlateOption, e: React.MouseEvent) => {
    retroAudio.playInspectConfirm();
    if (typeof window !== 'undefined') {
      xpParticleEmitter.emit(e.clientX, e.clientY, 8);
    }

    logMealToDay(
      {
        name: plate.label,
        protein: plate.proteinGrams,
        calories: plate.calories,
        isVegetarian: false,
        ingredients: [{ item: plate.label, amount: '1 serving' }],
        suggestedSprite: '/assets/food/generic-plate.webp',
      },
      currentDate
    );

    const summaryMsg = `Logged ${plate.label} (+${plate.proteinGrams}g Protein · ${plate.calories} kcal)`;
    if (onLogged) onLogged(summaryMsg);
  };

  return (
    <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border border-[#1A2E26]/12 bg-[#FDFBF7]">
      <div className="flex flex-col">
        <span className="font-cabinet font-bold text-xs text-[#1A2E26]">
          1-Tap Quick Meal Log
        </span>
        <span className="text-[11px] text-[#4A5D4E] font-sans">
          Fast estimation when you cannot log exact ingredients
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
        {QUICK_PLATES.map((plate) => (
          <button
            key={plate.type}
            type="button"
            onClick={(e) => handleSelectPlate(plate, e)}
            className="flex-1 sm:flex-none inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border border-[#1A2E26]/15 bg-[#FFFDF9] hover:bg-[#1A2E26] hover:text-[#FFFDF9] text-[#1A2E26] font-cabinet font-bold text-xs transition-all cursor-pointer shadow-2xs group active:scale-98"
          >
            <span>{plate.label}</span>
            <span className="font-mono text-[10px] opacity-70 group-hover:opacity-90">
              +{plate.proteinGrams}g
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
