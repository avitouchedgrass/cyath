'use client';

import React from 'react';
import { Recipe, calculateRecipeNutrition } from '@/lib/recipes';

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

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 1. Macronutrient Split Header & Bar */}
      <div className="flex flex-col gap-2 p-3.5 rounded-2xl border border-[#1A3629]/12 bg-[#FAF8F5]">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#1A3629]">
            Macronutrient Caloric Split
          </span>
          <span className="font-mono text-[11px] font-semibold text-[#4A5D4E]">
            {nutrition.calories} kcal ({portionMultiplier}x)
          </span>
        </div>

        {/* Proportional Segmented Macro Bar */}
        <div className="w-full h-3 rounded-full bg-[#EAE3D2] overflow-hidden flex border border-[#1A3629]/15">
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
        <div className="grid grid-cols-3 gap-2 mt-1">
          <div className="p-2 rounded-xl bg-[#FFFDF9] border border-[#065F46]/20 flex flex-col">
            <span className="text-[10px] font-mono font-bold uppercase text-[#065F46]">
              Protein
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-cabinet font-extrabold text-base text-[#1A3629] leading-tight">
                {nutrition.protein}g
              </span>
              <span className="font-mono text-[10px] text-[#4A5D4E]">
                ({macros.proteinCalPct}%)
              </span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-[#FFFDF9] border border-[#D97706]/20 flex flex-col">
            <span className="text-[10px] font-mono font-bold uppercase text-[#D97706]">
              Carbs
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-cabinet font-extrabold text-base text-[#1A3629] leading-tight">
                {nutrition.carbs}g
              </span>
              <span className="font-mono text-[10px] text-[#4A5D4E]">
                ({macros.carbsCalPct}%)
              </span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-[#FFFDF9] border border-[#E11D48]/20 flex flex-col">
            <span className="text-[10px] font-mono font-bold uppercase text-[#E11D48]">
              Fats
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-cabinet font-extrabold text-base text-[#1A3629] leading-tight">
                {nutrition.fats}g
              </span>
              <span className="font-mono text-[10px] text-[#4A5D4E]">
                ({macros.fatsCalPct}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Micronutrient Density & Electrolytes */}
      {!compact && (
        <div className="flex flex-col gap-2 p-3.5 rounded-2xl border border-[#1A3629]/12 bg-[#FAF8F5]">
          <div className="flex items-center justify-between pb-1 border-b border-[#1A3629]/8">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#1A3629]">
              Micronutrient &amp; Mineral Density
            </span>
            <span className="font-mono text-[10px] text-[#4A5D4E]">
              % Daily Value (DV)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 pt-1">
            {/* Dietary Fiber */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#1A3629] font-medium">Dietary Fiber</span>
                <span className="font-bold text-[#1A3629]">{micros.fiberG}g ({micros.fiberDvPct}%)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#EAE3D2] overflow-hidden">
                <div
                  className="h-full bg-[#10B981] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, micros.fiberDvPct)}%` }}
                />
              </div>
            </div>

            {/* Potassium */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#1A3629] font-medium">Potassium</span>
                <span className="font-bold text-[#1A3629]">{micros.potassiumMg}mg ({micros.potassiumDvPct}%)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#EAE3D2] overflow-hidden">
                <div
                  className="h-full bg-[#10B981] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, micros.potassiumDvPct)}%` }}
                />
              </div>
            </div>

            {/* Magnesium */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#1A3629] font-medium">Magnesium</span>
                <span className="font-bold text-[#1A3629]">{micros.magnesiumMg}mg ({micros.magnesiumDvPct}%)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#EAE3D2] overflow-hidden">
                <div
                  className="h-full bg-[#10B981] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, micros.magnesiumDvPct)}%` }}
                />
              </div>
            </div>

            {/* Iron */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#1A3629] font-medium">Iron</span>
                <span className="font-bold text-[#1A3629]">{micros.ironMg}mg ({micros.ironDvPct}%)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#EAE3D2] overflow-hidden">
                <div
                  className="h-full bg-[#10B981] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, micros.ironDvPct)}%` }}
                />
              </div>
            </div>

            {/* Zinc */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#1A3629] font-medium">Zinc</span>
                <span className="font-bold text-[#1A3629]">{micros.zincMg}mg ({micros.zincDvPct}%)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#EAE3D2] overflow-hidden">
                <div
                  className="h-full bg-[#10B981] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, micros.zincDvPct)}%` }}
                />
              </div>
            </div>

            {/* Calcium */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#1A3629] font-medium">Calcium</span>
                <span className="font-bold text-[#1A3629]">{micros.calciumMg}mg ({micros.calciumDvPct}%)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#EAE3D2] overflow-hidden">
                <div
                  className="h-full bg-[#10B981] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, micros.calciumDvPct)}%` }}
                />
              </div>
            </div>

            {/* Vitamin B12 */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#1A3629] font-medium">Vitamin B12</span>
                <span className="font-bold text-[#1A3629]">{micros.vitaminB12Mcg}mcg ({micros.vitaminB12DvPct}%)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#EAE3D2] overflow-hidden">
                <div
                  className="h-full bg-[#10B981] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, micros.vitaminB12DvPct)}%` }}
                />
              </div>
            </div>

            {/* Omega-3 or Vitamin D */}
            {micros.omega3Mg > 0 ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#1A3629] font-medium">Omega-3 (EPA/DHA)</span>
                  <span className="font-bold text-[#1A3629]">{micros.omega3Mg}mg ({micros.omega3DvPct}%)</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#EAE3D2] overflow-hidden">
                  <div
                    className="h-full bg-[#10B981] rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, micros.omega3DvPct)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#1A3629] font-medium">Vitamin D</span>
                  <span className="font-bold text-[#1A3629]">{micros.vitaminD_IU}IU ({micros.vitaminDDvPct}%)</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#EAE3D2] overflow-hidden">
                  <div
                    className="h-full bg-[#10B981] rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, micros.vitaminDDvPct)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
