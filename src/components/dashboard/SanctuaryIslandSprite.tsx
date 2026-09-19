'use client';

import React from 'react';

export type IslandLifecycleState = 'active' | 'embers' | 'mist' | 'dormant';

export interface SanctuaryIslandSpriteProps {
  tier?: number; // 1 to 8
  lifecycleState?: IslandLifecycleState;
  hasKintsugiSeams?: boolean;
  size?: number;
  className?: string;
}

export function SanctuaryIslandSprite({
  tier = 1,
  lifecycleState = 'active',
  hasKintsugiSeams = false,
  size = 380,
  className = '',
}: SanctuaryIslandSpriteProps) {
  const isDormant = lifecycleState === 'dormant';
  const isMist = lifecycleState === 'mist' || isDormant;
  const isEmbers = lifecycleState === 'embers' || isMist;

  // Dynamic Palettes based on Lifecycle State
  const grass = isDormant
    ? { top: '#94A3B8', mid: '#64748B', dark: '#475569', edge: '#334155' }
    : isMist
    ? { top: '#86A789', mid: '#5B8266', dark: '#3E5C46', edge: '#2B4232' }
    : { top: '#4ADE80', mid: '#22C55E', dark: '#15803D', edge: '#166534' };

  const stone = isDormant
    ? { light: '#64748B', mid: '#475569', dark: '#334155', deep: '#1E293B' }
    : { light: '#857E74', mid: '#615A52', dark: '#423D37', deep: '#26221E' };

  const wood = isDormant
    ? { light: '#94A3B8', mid: '#64748B', dark: '#475569' }
    : { light: '#D97706', mid: '#B45309', dark: '#78350F' };

  const water = isDormant
    ? { light: '#E2E8F0', mid: '#94A3B8', flow: '#64748B' }
    : { light: '#BAE6FD', mid: '#38BDF8', flow: '#0284C7' };

  const gold = {
    light: '#FFFBEB',
    core: '#FCD34D',
    edge: '#D97706',
  };

  return (
    <svg
      viewBox="0 0 96 96"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      className={`select-none ${className}`}
      style={{ imageRendering: 'pixelated' }}
      aria-hidden="true"
    >
      <defs>
        {/* Ambient Mist Gradient */}
        <linearGradient id="mistHaze" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="30%" stopColor="#FAF8F5" stopOpacity="0.45" />
          <stop offset="70%" stopColor="#FAF8F5" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ========================================================================= */}
      {/* 1. FLOATING BEDROCK CONE (THE SANCTUARY FOUNDATION)                      */}
      {/* ========================================================================= */}

      {/* Top Rock Shelf (Under Turf) */}
      <rect x="14" y="52" width="68" height="6" fill={stone.dark} />
      <rect x="16" y="52" width="22" height="6" fill={stone.mid} />
      <rect x="16" y="52" width="6" height="4" fill={stone.light} />
      <rect x="62" y="52" width="20" height="6" fill={stone.deep} />

      {/* Upper Strata Step (y: 58-66) */}
      <rect x="18" y="58" width="60" height="8" fill={stone.dark} />
      <rect x="20" y="58" width="18" height="8" fill={stone.mid} />
      <rect x="20" y="58" width="6" height="4" fill={stone.light} />
      <rect x="58" y="58" width="20" height="8" fill={stone.deep} />

      {/* Mid Inverted Cone Step (y: 66-74) */}
      <rect x="24" y="66" width="48" height="8" fill={stone.dark} />
      <rect x="26" y="66" width="14" height="8" fill={stone.mid} />
      <rect x="26" y="66" width="4" height="4" fill={stone.light} />
      <rect x="52" y="66" width="20" height="8" fill={stone.deep} />

      {/* Lower Inverted Cone Step (y: 74-82) */}
      <rect x="32" y="74" width="32" height="8" fill={stone.dark} />
      <rect x="34" y="74" width="10" height="8" fill={stone.mid} />
      <rect x="50" y="74" width="14" height="8" fill={stone.deep} />

      {/* Bottom Keel Tip (y: 82-88) */}
      <rect x="40" y="82" width="16" height="6" fill={stone.deep} />
      <rect x="42" y="82" width="6" height="4" fill={stone.dark} />
      <rect x="45" y="88" width="6" height="3" fill={stone.deep} />

      {/* Hanging Vines / Roots dipping into the sky */}
      <rect x="22" y="64" width="2" height="10" fill={grass.edge} />
      <rect x="22" y="74" width="1" height="4" fill={grass.dark} />
      <rect x="36" y="72" width="2" height="8" fill={grass.edge} />
      <rect x="68" y="62" width="2" height="8" fill={grass.edge} />

      {/* Detached Ambient Floating Stones Below Island */}
      <rect x="28" y="88" width="3" height="3" fill={stone.mid} />
      <rect x="29" y="89" width="1" height="1" fill={stone.light} />
      <rect x="64" y="84" width="4" height="3" fill={stone.deep} />
      <rect x="65" y="85" width="2" height="1" fill={stone.dark} />

      {/* ========================================================================= */}
      {/* 2. KINTSUGI GOLDEN FRACTURE SEAMS (RESILIENCE BATTLE SCARS)               */}
      {/* ========================================================================= */}
      {hasKintsugiSeams && (
        <g>
          {/* Main Cliff Gold Fracture Line */}
          <rect x="34" y="52" width="2" height="8" fill={gold.core} />
          <rect x="35" y="53" width="1" height="6" fill={gold.light} />
          <rect x="36" y="60" width="3" height="2" fill={gold.core} />
          <rect x="38" y="62" width="2" height="8" fill={gold.core} />
          <rect x="39" y="63" width="1" height="6" fill={gold.light} />
          <rect x="40" y="70" width="4" height="2" fill={gold.core} />
          <rect x="43" y="72" width="2" height="6" fill={gold.core} />
          <rect x="44" y="73" width="1" height="4" fill={gold.light} />
          {/* Subtle Branch Gold Splinter */}
          <rect x="30" y="58" width="4" height="2" fill={gold.core} />
          <rect x="31" y="58" width="2" height="1" fill={gold.light} />
          <rect x="52" y="72" width="3" height="2" fill={gold.core} />
          <rect x="53" y="72" width="1" height="1" fill={gold.light} />
        </g>
      )}

      {/* ========================================================================= */}
      {/* 3. SURFACE BIOME & GRASS TURF SHELF                                      */}
      {/* ========================================================================= */}

      {/* Loam Soil Under-Rim */}
      <rect x="10" y="48" width="76" height="4" fill={stone.dark} />
      <rect x="12" y="48" width="24" height="4" fill={stone.mid} />

      {/* Vibrant Grass Shelf */}
      <rect x="8" y="44" width="80" height="4" fill={grass.mid} />
      <rect x="10" y="42" width="76" height="2" fill={grass.top} />
      <rect x="8" y="46" width="36" height="2" fill={grass.top} />
      <rect x="54" y="46" width="34" height="2" fill={grass.dark} />

      {/* Front Grass Drops/Blades */}
      <rect x="14" y="48" width="2" height="2" fill={grass.dark} />
      <rect x="22" y="48" width="3" height="2" fill={grass.dark} />
      <rect x="38" y="48" width="2" height="2" fill={grass.dark} />
      <rect x="48" y="48" width="3" height="2" fill={grass.edge} />
      <rect x="62" y="48" width="2" height="2" fill={grass.edge} />
      <rect x="74" y="48" width="3" height="2" fill={grass.edge} />

      {/* ========================================================================= */}
      {/* 4. TIER-SPECIFIC ARCHITECTURE & SETTLEMENT LAYERS                         */}
      {/* ========================================================================= */}

      {/* ------------------------------------------------------------------------- */}
      {/* TIER 1: The Awakening Rock (Cairn Monolith & Firepit)                     */}
      {/* ------------------------------------------------------------------------- */}
      {tier === 1 && (
        <g>
          {/* Ancient Standing Monolith / Cairn (x: 44 to 52, y: 24 to 42) */}
          <rect x="44" y="24" width="8" height="18" fill={stone.mid} />
          <rect x="44" y="24" width="2" height="18" fill={stone.light} />
          <rect x="50" y="24" width="2" height="18" fill={stone.dark} />
          <rect x="46" y="22" width="4" height="2" fill={stone.light} />

          {/* Ancient Monolith Carved Glyph Rune */}
          <rect x="47" y="28" width="2" height="4" fill={isDormant ? stone.deep : gold.core} />
          <rect x="46" y="30" width="4" height="1" fill={isDormant ? stone.deep : gold.light} />

          {/* Left Companion Boulder */}
          <rect x="32" y="36" width="6" height="6" fill={stone.mid} />
          <rect x="32" y="36" width="2" height="4" fill={stone.light} />
          <rect x="36" y="38" width="2" height="4" fill={stone.deep} />

          {/* Wild Alpine Pine Shrub (Right) */}
          <rect x="64" y="32" width="8" height="10" fill={grass.dark} />
          <rect x="66" y="28" width="4" height="4" fill={grass.mid} />
          <rect x="67" y="26" width="2" height="2" fill={grass.top} />
          <rect x="67" y="42" width="2" height="2" fill={wood.dark} />

          {/* Campfire Hearth */}
          <rect x="22" y="40" width="6" height="2" fill={stone.deep} />
          {isEmbers ? (
            <rect x="24" y="39" width="2" height="1" fill="#475569" />
          ) : (
            <g>
              <rect x="24" y="38" width="2" height="2" fill="#F59E0B" />
              <rect x="24" y="37" width="1" height="1" fill="#FEF08A" />
              <rect x="25" y="36" width="1" height="1" fill="#EF4444" />
            </g>
          )}
        </g>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* TIER 2: The Timber Shanty (Lean-to Shelter, Campfire, Woodpile)            */}
      {/* ------------------------------------------------------------------------- */}
      {tier === 2 && (
        <g>
          {/* Shanty Timber Posts */}
          <rect x="36" y="26" width="3" height="16" fill={wood.dark} />
          <rect x="54" y="30" width="3" height="12" fill={wood.dark} />
          {/* Thatch Slanted Roof */}
          <rect x="32" y="24" width="28" height="4" fill={wood.light} />
          <rect x="34" y="22" width="22" height="2" fill={wood.light} />
          <rect x="32" y="26" width="28" height="2" fill={wood.mid} />

          {/* Shanty Wall Planks */}
          <rect x="38" y="28" width="14" height="14" fill={wood.mid} />
          <rect x="42" y="34" width="6" height="8" fill={stone.deep} />

          {/* Stacked Timber Logs */}
          <rect x="20" y="38" width="8" height="4" fill={wood.mid} />
          <rect x="22" y="36" width="4" height="2" fill={wood.light} />

          {/* Campfire with Hearth Stones */}
          <rect x="62" y="40" width="8" height="2" fill={stone.deep} />
          {!isEmbers && (
            <g>
              <rect x="65" y="37" width="2" height="3" fill="#F59E0B" />
              <rect x="65" y="36" width="1" height="1" fill="#FEF08A" />
              <rect x="66" y="38" width="1" height="1" fill="#EF4444" />
            </g>
          )}
        </g>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* TIER 3: The Woodcutter Cabin (Sturdy Timber Log Cabin, Hearth Chimney)    */}
      {/* ------------------------------------------------------------------------- */}
      {tier === 3 && (
        <g>
          {/* Stone Chimney */}
          <rect x="34" y="16" width="5" height="16" fill={stone.dark} />
          <rect x="34" y="16" width="2" height="16" fill={stone.mid} />
          {!isEmbers && (
            <g>
              <rect x="35" y="12" width="3" height="3" fill="#E2E8F0" opacity="0.8" />
              <rect x="33" y="8" width="4" height="3" fill="#CBD5E1" opacity="0.6" />
              <rect x="36" y="4" width="3" height="3" fill="#94A3B8" opacity="0.4" />
            </g>
          )}

          {/* Cabin Walls */}
          <rect x="38" y="26" width="26" height="16" fill={wood.mid} />
          <rect x="38" y="26" width="3" height="16" fill={wood.light} />
          <rect x="61" y="26" width="3" height="16" fill={wood.dark} />

          {/* Gabled Plank Roof */}
          <polygon points="34,26 51,14 68,26" fill={wood.dark} />
          <polygon points="36,25 51,15 66,25" fill={wood.light} />

          {/* Door & Window */}
          <rect x="48" y="32" width="6" height="10" fill={stone.deep} />
          <rect x="40" y="30" width="4" height="4" fill={isDormant ? stone.deep : '#FEF08A'} />

          {/* Left Conifer Tree */}
          <rect x="20" y="26" width="10" height="16" fill={grass.dark} />
          <rect x="22" y="20" width="6" height="6" fill={grass.mid} />
          <rect x="24" y="16" width="2" height="4" fill={grass.top} />
          <rect x="24" y="40" width="2" height="2" fill={wood.dark} />
        </g>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* TIER 4: The Hearthside Cottage (Masonry Stone, Clay Roof, Flowerbed)       */}
      {/* ------------------------------------------------------------------------- */}
      {tier === 4 && (
        <g>
          {/* Stone Chimney */}
          <rect x="58" y="12" width="6" height="20" fill={stone.mid} />
          <rect x="58" y="12" width="2" height="20" fill={stone.light} />
          {!isEmbers && (
            <g>
              <rect x="59" y="8" width="4" height="3" fill="#E2E8F0" opacity="0.8" />
              <rect x="58" y="4" width="4" height="3" fill="#CBD5E1" opacity="0.5" />
            </g>
          )}

          {/* Main Stone Cottage Body */}
          <rect x="32" y="24" width="32" height="18" fill={stone.mid} />
          <rect x="32" y="24" width="3" height="18" fill={stone.light} />
          <rect x="61" y="24" width="3" height="18" fill={stone.dark} />

          {/* Clay Red Tile Roof */}
          <polygon points="28,24 48,10 68,24" fill="#B91C1C" />
          <polygon points="30,23 48,12 66,23" fill="#DC2626" />
          <rect x="46" y="10" width="4" height="2" fill="#FCA5A5" />

          {/* Wooden Door & Warm Glowing Windows */}
          <rect x="44" y="30" width="8" height="12" fill={wood.dark} />
          <rect x="35" y="28" width="5" height="5" fill={isDormant ? stone.deep : '#FEF08A'} />
          <rect x="56" y="28" width="5" height="5" fill={isDormant ? stone.deep : '#FEF08A'} />

          {/* Front Flower Garden Box */}
          <rect x="18" y="40" width="10" height="3" fill={wood.dark} />
          <rect x="19" y="38" width="2" height="2" fill="#EC4899" />
          <rect x="23" y="38" width="2" height="2" fill="#FACC15" />
          <rect x="26" y="38" width="2" height="2" fill="#38BDF8" />
        </g>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* TIER 5: The Watermill Homestead (Waterwheel & Spilling Cascade)          */}
      {/* ------------------------------------------------------------------------- */}
      {tier === 5 && (
        <g>
          {/* Main Mill House */}
          <rect x="28" y="20" width="30" height="22" fill={stone.mid} />
          <rect x="28" y="20" width="3" height="22" fill={stone.light} />
          {/* Pitched Roof */}
          <polygon points="24,20 43,8 62,20" fill="#78350F" />
          <polygon points="26,19 43,10 60,19" fill="#B45309" />

          {/* Rotating Waterwheel Structure (Right Side: x: 58 to 70, y: 28 to 46) */}
          <rect x="60" y="28" width="10" height="16" fill={wood.dark} />
          <rect x="62" y="30" width="6" height="12" fill={stone.deep} />
          {/* Wheel Spokes */}
          <rect x="64" y="28" width="2" height="16" fill={wood.light} />
          <rect x="60" y="35" width="10" height="2" fill={wood.light} />

          {/* Spilling Mountain Waterfall into the Void */}
          <rect x="62" y="44" width="6" height="4" fill={water.light} />
          <rect x="63" y="48" width="4" height="28" fill={water.mid} />
          <rect x="64" y="48" width="2" height="28" fill={water.light} />
          <rect x="63" y="76" width="4" height="8" fill={water.flow} opacity="0.7" />

          {/* Mill Doors & Windows */}
          <rect x="38" y="28" width="8" height="14" fill={wood.dark} />
          <rect x="31" y="24" width="4" height="4" fill={isDormant ? stone.deep : '#FEF08A'} />
        </g>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* TIER 6+: The Windmill Grove & Sky Citadel (Windmill Tower, Wheat Fields)   */}
      {/* ------------------------------------------------------------------------- */}
      {tier >= 6 && (
        <g>
          {/* Stone Windmill Tower (x: 44 to 58, y: 16 to 42) */}
          <polygon points="46,16 56,16 58,42 44,42" fill={stone.mid} />
          <rect x="46" y="16" width="2" height="26" fill={stone.light} />
          <polygon points="44,16 51,8 58,16" fill="#1E293B" />

          {/* Windmill 4-Blade Sails */}
          <rect x="50" y="4" width="2" height="10" fill="#F8FAFC" />
          <rect x="50" y="18" width="2" height="10" fill="#F8FAFC" />
          <rect x="42" y="15" width="8" height="2" fill="#F8FAFC" />
          <rect x="54" y="15" width="8" height="2" fill="#F8FAFC" />
          <rect x="50" y="15" width="2" height="2" fill="#0F172A" />

          {/* Tower Arched Door */}
          <rect x="49" y="34" width="4" height="8" fill={wood.dark} />

          {/* Left Wheat Field Patches */}
          <rect x="20" y="38" width="18" height="4" fill="#F59E0B" />
          <rect x="22" y="36" width="2" height="2" fill="#FEF08A" />
          <rect x="26" y="36" width="2" height="2" fill="#FEF08A" />
          <rect x="30" y="36" width="2" height="2" fill="#FEF08A" />
          <rect x="34" y="36" width="2" height="2" fill="#FEF08A" />

          {/* Right Stone Flagpole */}
          <rect x="68" y="24" width="2" height="18" fill={stone.light} />
          <rect x="70" y="24" width="6" height="4" fill="#2563EB" />
        </g>
      )}

      {/* ========================================================================= */}
      {/* 5. 48-HOUR LIFECYCLE MIST & ATMOSPHERE OVERLAY                            */}
      {/* ========================================================================= */}
      {isMist && (
        <g pointerEvents="none">
          <rect x="6" y="42" width="84" height="6" fill="url(#mistHaze)" />
          <rect x="12" y="56" width="72" height="5" fill="url(#mistHaze)" opacity="0.8" />
          <rect x="20" y="70" width="56" height="4" fill="url(#mistHaze)" opacity="0.6" />
        </g>
      )}
    </svg>
  );
}
