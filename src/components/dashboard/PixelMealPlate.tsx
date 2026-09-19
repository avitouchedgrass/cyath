'use client';

import React, { useMemo } from 'react';

interface PixelMealPlateProps {
  mealName: string;
  size?: number;
  className?: string;
}

export function PixelMealPlate({
  mealName,
  size = 40,
  className = '',
}: PixelMealPlateProps) {
  const normalized = (mealName || '').toLowerCase();

  const mealProfile = useMemo(() => {
    // 1. Vessel Type
    let vessel: 'skillet' | 'bowl' | 'plate' = 'plate';
    if (
      normalized.includes('skillet') ||
      normalized.includes('scramble') ||
      normalized.includes('stir-fry') ||
      normalized.includes('sear')
    ) {
      vessel = 'skillet';
    } else if (
      normalized.includes('bowl') ||
      normalized.includes('yogurt') ||
      normalized.includes('oat') ||
      normalized.includes('soup') ||
      normalized.includes('smoothie')
    ) {
      vessel = 'bowl';
    }

    // 2. Primary Protein
    let protein: 'egg' | 'steak' | 'salmon' | 'chicken' | 'dairy' | 'plant' | 'generic' = 'generic';
    if (normalized.includes('egg') || normalized.includes('omelet')) {
      protein = 'egg';
    } else if (
      normalized.includes('steak') ||
      normalized.includes('beef') ||
      normalized.includes('burger')
    ) {
      protein = 'steak';
    } else if (
      normalized.includes('salmon') ||
      normalized.includes('fish') ||
      normalized.includes('tuna') ||
      normalized.includes('seafood')
    ) {
      protein = 'salmon';
    } else if (
      normalized.includes('chicken') ||
      normalized.includes('turkey') ||
      normalized.includes('poultry')
    ) {
      protein = 'chicken';
    } else if (
      normalized.includes('yogurt') ||
      normalized.includes('cheese') ||
      normalized.includes('cottage')
    ) {
      protein = 'dairy';
    } else if (
      normalized.includes('tofu') ||
      normalized.includes('salad') ||
      normalized.includes('bean')
    ) {
      protein = 'plant';
    }

    // 3. Side & Garnish
    const hasGreens =
      normalized.includes('veg') ||
      normalized.includes('spinach') ||
      normalized.includes('salad') ||
      normalized.includes('herb') ||
      normalized.includes('broccoli') ||
      normalized.includes('green');

    const hasToastOrCarb =
      normalized.includes('sourdough') ||
      normalized.includes('toast') ||
      normalized.includes('bread') ||
      normalized.includes('rice') ||
      normalized.includes('potato');

    return { vessel, protein, hasGreens, hasToastOrCarb };
  }, [normalized]);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      title={mealName}
    >
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        shapeRendering="crispEdges"
        className="w-full h-full select-none"
      >
        {/* VESSEL: Cast Iron Skillet */}
        {mealProfile.vessel === 'skillet' && (
          <g id="skillet-vessel">
            {/* Skillet Handle */}
            <rect x="2" y="14" width="6" height="4" fill="#1E293B" />
            <rect x="3" y="15" width="4" height="2" fill="#334155" />
            {/* Outer Rim */}
            <rect x="7" y="5" width="18" height="22" rx="4" fill="#0F172A" />
            {/* Pan Basin */}
            <rect x="8" y="6" width="16" height="20" rx="3" fill="#1E293B" />
            <rect x="9" y="7" width="14" height="18" rx="2" fill="#334155" />
          </g>
        )}

        {/* VESSEL: Ceramic Deep Bowl */}
        {mealProfile.vessel === 'bowl' && (
          <g id="bowl-vessel">
            {/* Shadow */}
            <rect x="7" y="25" width="18" height="2" fill="#CBD5E1" opacity="0.6" />
            {/* Bowl Rim */}
            <rect x="6" y="7" width="20" height="17" rx="5" fill="#E2E8F0" />
            <rect x="7" y="8" width="18" height="15" rx="4" fill="#F8FAFC" />
            {/* Ceramic Accent Line */}
            <rect x="8" y="10" width="16" height="1" fill="#94A3B8" opacity="0.4" />
          </g>
        )}

        {/* VESSEL: Artisan Stoneware Plate (Default) */}
        {mealProfile.vessel === 'plate' && (
          <g id="plate-vessel">
            {/* Under-shadow */}
            <rect x="6" y="25" width="20" height="2" fill="#D1D5DB" opacity="0.5" />
            {/* Ceramic Plate Outer Lip */}
            <rect x="5" y="6" width="22" height="20" rx="6" fill="#E5E7EB" />
            {/* Plate Base Surface */}
            <rect x="7" y="8" width="18" height="16" rx="4" fill="#FDFBF7" />
            {/* Inner Glaze Shadow */}
            <rect x="8" y="9" width="16" height="1" fill="#D1D5DB" opacity="0.4" />
          </g>
        )}

        {/* CARB / BASE LAYER */}
        {mealProfile.hasToastOrCarb && (
          <g id="carb-side">
            {/* Golden toasted crust */}
            <rect x="9" y="11" width="5" height="7" rx="1" fill="#B45309" />
            <rect x="10" y="12" width="3" height="5" fill="#FDE68A" />
          </g>
        )}

        {/* PROTEIN CONTENT */}
        {mealProfile.protein === 'egg' && (
          <g id="egg-food">
            {/* Egg White */}
            <rect x="11" y="10" width="11" height="10" rx="3" fill="#FFFFFF" />
            <rect x="13" y="9" width="7" height="12" rx="2" fill="#F8FAFC" />
            {/* Golden Runny Yolk */}
            <rect x="14" y="12" width="5" height="5" rx="1" fill="#F59E0B" />
            <rect x="15" y="13" width="3" height="3" fill="#FBBF24" />
            <rect x="16" y="13" width="1" height="1" fill="#FFFBEB" />
          </g>
        )}

        {mealProfile.protein === 'steak' && (
          <g id="steak-food">
            {/* Browned Seared Cut */}
            <rect x="11" y="10" width="12" height="9" rx="2" fill="#581C15" />
            <rect x="12" y="11" width="10" height="7" fill="#78350F" />
            {/* Grill Hatching */}
            <rect x="13" y="11" width="1" height="7" fill="#3B120B" />
            <rect x="16" y="11" width="1" height="7" fill="#3B120B" />
            <rect x="19" y="11" width="1" height="7" fill="#3B120B" />
            <rect x="14" y="13" width="4" height="2" fill="#92400E" />
          </g>
        )}

        {mealProfile.protein === 'salmon' && (
          <g id="salmon-food">
            {/* Salmon Fillet */}
            <rect x="11" y="10" width="11" height="9" rx="2" fill="#EA580C" />
            <rect x="12" y="11" width="9" height="7" fill="#FB923C" />
            {/* White Fat Flake Strata */}
            <rect x="13" y="11" width="1" height="6" fill="#FFF7ED" opacity="0.8" />
            <rect x="16" y="12" width="1" height="5" fill="#FFF7ED" opacity="0.8" />
            <rect x="18" y="11" width="1" height="6" fill="#FFF7ED" opacity="0.8" />
            {/* Crispy Skin Edge */}
            <rect x="11" y="10" width="1" height="9" fill="#7C2D12" />
          </g>
        )}

        {mealProfile.protein === 'chicken' && (
          <g id="chicken-food">
            {/* Roasted Cutlet */}
            <rect x="11" y="10" width="11" height="9" rx="2" fill="#D97706" />
            <rect x="12" y="11" width="9" height="7" fill="#F59E0B" />
            {/* Roasted edges */}
            <rect x="13" y="12" width="5" height="4" fill="#FBBF24" />
            <rect x="18" y="13" width="2" height="3" fill="#B45309" />
          </g>
        )}

        {mealProfile.protein === 'dairy' && (
          <g id="dairy-food">
            {/* Greek Yogurt / Cottage Base */}
            <rect x="10" y="10" width="12" height="9" rx="3" fill="#FFFFFF" />
            <rect x="11" y="11" width="10" height="7" fill="#F8FAFC" />
            {/* Honey Swirl / Berry Droplets */}
            <rect x="13" y="12" width="4" height="2" fill="#F59E0B" />
            <rect x="17" y="11" width="2" height="2" fill="#BE123C" />
            <rect x="14" y="15" width="2" height="2" fill="#7C3AED" />
          </g>
        )}

        {mealProfile.protein === 'plant' && (
          <g id="plant-food">
            {/* Tofu Cubes */}
            <rect x="11" y="11" width="4" height="4" fill="#FEF3C7" />
            <rect x="11" y="11" width="4" height="1" fill="#D97706" opacity="0.4" />
            <rect x="17" y="11" width="4" height="4" fill="#FEF3C7" />
            <rect x="14" y="15" width="4" height="4" fill="#FEF3C7" />
          </g>
        )}

        {mealProfile.protein === 'generic' && (
          <g id="generic-protein">
            {/* Hearty Nourishment Slab */}
            <rect x="11" y="10" width="11" height="9" rx="2" fill="#92400E" />
            <rect x="12" y="11" width="9" height="7" fill="#D97706" />
            <rect x="13" y="13" width="6" height="3" fill="#F59E0B" />
          </g>
        )}

        {/* GREENS & HERBS SIDE */}
        {(mealProfile.hasGreens || mealProfile.protein === 'plant') && (
          <g id="fresh-greens">
            <rect x="8" y="18" width="5" height="4" rx="1" fill="#15803D" />
            <rect x="9" y="19" width="3" height="2" fill="#22C55E" />
            <rect x="20" y="11" width="3" height="3" rx="1" fill="#16A34A" />
          </g>
        )}

        {/* STEAM WISPS (Subtle ambient rising warmth) */}
        <g id="steam-wisps" opacity="0.45">
          <rect x="13" y="2" width="1" height="2" fill="#94A3B8" />
          <rect x="17" y="3" width="1" height="2" fill="#94A3B8" />
        </g>
      </svg>
    </div>
  );
}
