'use client';

import React, { useState } from 'react';
import { Recipe, calculateRecipeNutrition } from '@/lib/recipes';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface RecipeNutritionDetailProps {
  recipe: Recipe;
  portionMultiplier?: number;
  compact?: boolean;
}

export function RecipeNutritionDetail({
  recipe,
  portionMultiplier = 1.0,
  compact = false,
}: RecipeNutritionDetailProps) {
  const nutrition = calculateRecipeNutrition(recipe, portionMultiplier);
  const { macros, micros } = nutrition;
  const [showMicros, setShowMicros] = useState(false);

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* 1. Macronutrient Caloric Split */}
      <div className="flex flex-col gap-2.5 p-3 rounded-2xl border border-[#1A3629]/12 bg-[#FAF8F5]">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#1A3629]">
            Macronutrient Split
          </span>
          <span className="font-mono text-[11px] font-bold text-[#1A3629]">
            {nutrition.calories} kcal ({portionMultiplier}x)
          </span>
        </div>

        {/* Proportional Segmented Macro Bar */}
        <div className="w-full h-2 rounded-full bg-[#EAE3D2] overflow-hidden flex border border-[#1A3629]/15">
          <div
            className="h-full bg-[#065F46] transition-all duration-300"
            style={{ width: `${macros.proteinCalPct}%` }}
            title={`Protein: ${macros.proteinCalPct}%`}
          />
          <div
            className="h-full bg-[#D97706] transition-all duration-300"
            style={{ width: `${macros.carbsCalPct}%` }}
            title={`Carbs: ${macros.carbsCalPct}%`}
          />
          <div
            className="h-full bg-[#E11D48] transition-all duration-300"
            style={{ width: `${macros.fatsCalPct}%` }}
            title={`Fats: ${macros.fatsCalPct}%`}
          />
        </div>

        {/* Macro Metric Cards */}
        <div className="grid grid-cols-3 gap-2 mt-0.5">
          <div className="p-2 rounded-xl bg-[#FFFDF9] border border-[#065F46]/20 flex flex-col">
            <span className="text-[10px] font-mono font-bold uppercase text-[#065F46]">
              Protein
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-cabinet font-extrabold text-sm sm:text-base text-[#1A3629] leading-tight">
                {nutrition.protein}g
              </span>
              <span className="font-mono text-[9px] text-[#4A5D4E]">
                ({macros.proteinCalPct}%)
              </span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-[#FFFDF9] border border-[#D97706]/20 flex flex-col">
            <span className="text-[10px] font-mono font-bold uppercase text-[#D97706]">
              Carbs
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-cabinet font-extrabold text-sm sm:text-base text-[#1A3629] leading-tight">
                {nutrition.carbs}g
              </span>
              <span className="font-mono text-[9px] text-[#4A5D4E]">
                ({macros.carbsCalPct}%)
              </span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-[#FFFDF9] border border-[#E11D48]/20 flex flex-col">
            <span className="text-[10px] font-mono font-bold uppercase text-[#E11D48]">
              Fats
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-cabinet font-extrabold text-sm sm:text-base text-[#1A3629] leading-tight">
                {nutrition.fats}g
              </span>
              <span className="font-mono text-[9px] text-[#4A5D4E]">
                ({macros.fatsCalPct}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Optional Collapsible Micronutrient Density */}
      {!compact && (
        <div className="rounded-2xl border border-[#1A3629]/12 bg-[#FAF8F5] overflow-hidden">
          <button
            type="button"
            onClick={() => setShowMicros(!showMicros)}
            className="w-full flex items-center justify-between p-3 text-xs font-mono font-bold text-[#1A3629] hover:bg-[#FAF6EE] transition-colors cursor-pointer"
          >
            <span className="uppercase tracking-wider text-[11px]">
              Micronutrients &amp; Minerals
            </span>
            <div className="flex items-center gap-1 text-[11px] text-[#4A5D4E]">
              <span>{showMicros ? 'Hide' : 'Inspect (% DV)'}</span>
              {showMicros ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>

          {showMicros && (
            <div className="p-3.5 pt-0 border-t border-[#1A3629]/8 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-2.5 animate-in fade-in duration-200">
              {/* Dietary Fiber */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#1A3629]">Dietary Fiber</span>
                  <span className="font-bold text-[#1A3629]">{micros.fiberG}g ({micros.fiberDvPct}%)</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#EAE3D2] overflow-hidden">
                  <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${Math.min(100, micros.fiberDvPct)}%` }} />
                </div>
              </div>

              {/* Potassium */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#1A3629]">Potassium</span>
                  <span className="font-bold text-[#1A3629]">{micros.potassiumMg}mg ({micros.potassiumDvPct}%)</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#EAE3D2] overflow-hidden">
                  <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${Math.min(100, micros.potassiumDvPct)}%` }} />
                </div>
              </div>

              {/* Magnesium */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#1A3629]">Magnesium</span>
                  <span className="font-bold text-[#1A3629]">{micros.magnesiumMg}mg ({micros.magnesiumDvPct}%)</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#EAE3D2] overflow-hidden">
                  <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${Math.min(100, micros.magnesiumDvPct)}%` }} />
                </div>
              </div>

              {/* Iron */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#1A3629]">Iron</span>
                  <span className="font-bold text-[#1A3629]">{micros.ironMg}mg ({micros.ironDvPct}%)</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#EAE3D2] overflow-hidden">
                  <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${Math.min(100, micros.ironDvPct)}%` }} />
                </div>
              </div>

              {/* Zinc */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#1A3629]">Zinc</span>
                  <span className="font-bold text-[#1A3629]">{micros.zincMg}mg ({micros.zincDvPct}%)</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#EAE3D2] overflow-hidden">
                  <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${Math.min(100, micros.zincDvPct)}%` }} />
                </div>
              </div>

              {/* Calcium */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#1A3629]">Calcium</span>
                  <span className="font-bold text-[#1A3629]">{micros.calciumMg}mg ({micros.calciumDvPct}%)</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#EAE3D2] overflow-hidden">
                  <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${Math.min(100, micros.calciumDvPct)}%` }} />
                </div>
              </div>

              {/* Vitamin B12 */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#1A3629]">Vitamin B12</span>
                  <span className="font-bold text-[#1A3629]">{micros.vitaminB12Mcg}mcg ({micros.vitaminB12DvPct}%)</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#EAE3D2] overflow-hidden">
                  <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${Math.min(100, micros.vitaminB12DvPct)}%` }} />
                </div>
              </div>

              {/* Omega-3 or Vitamin D */}
              {micros.omega3Mg > 0 ? (
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#1A3629]">Omega-3</span>
                    <span className="font-bold text-[#1A3629]">{micros.omega3Mg}mg ({micros.omega3DvPct}%)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#EAE3D2] overflow-hidden">
                    <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${Math.min(100, micros.omega3DvPct)}%` }} />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#1A3629]">Vitamin D</span>
                    <span className="font-bold text-[#1A3629]">{micros.vitaminD_IU}IU ({micros.vitaminDDvPct}%)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#EAE3D2] overflow-hidden">
                    <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${Math.min(100, micros.vitaminDDvPct)}%` }} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
