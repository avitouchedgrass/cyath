'use client';

import React from 'react';

export type TrophyTier = 'Bronze' | 'Silver' | 'Gold' | 'Celestial' | 'Shame' | 'Locked';

export interface TrophyRelicSpriteProps {
  trophyId: string;
  tier?: TrophyTier;
  isUnlocked?: boolean;
  size?: number; // size in px, defaults to 80
  className?: string;
}

// Color palettes for each tier (Highlights, Midtones, Shadows, Accents)
const TIER_PALETTES: Record<TrophyTier, {
  highlight: string;
  midPrimary: string;
  midSecondary: string;
  shadow: string;
  deepShadow: string;
  rim: string;
  glow: string;
}> = {
  Gold: {
    highlight: '#FFF7ED',
    midPrimary: '#F59E0B',
    midSecondary: '#D97706',
    shadow: '#B45309',
    deepShadow: '#78350F',
    rim: '#FDE68A',
    glow: 'rgba(245, 158, 11, 0.4)',
  },
  Silver: {
    highlight: '#F8FAFC',
    midPrimary: '#CBD5E1',
    midSecondary: '#94A3B8',
    shadow: '#64748B',
    deepShadow: '#334155',
    rim: '#E2E8F0',
    glow: 'rgba(148, 163, 184, 0.35)',
  },
  Bronze: {
    highlight: '#FFEDD5',
    midPrimary: '#EA580C',
    midSecondary: '#C2410C',
    shadow: '#9A3412',
    deepShadow: '#431407',
    rim: '#FDBA74',
    glow: 'rgba(234, 88, 12, 0.35)',
  },
  Celestial: {
    highlight: '#F5F3FF',
    midPrimary: '#A855F7',
    midSecondary: '#7E22CE',
    shadow: '#581C87',
    deepShadow: '#2E1065',
    rim: '#C084FC',
    glow: 'rgba(168, 85, 247, 0.45)',
  },
  Shame: {
    highlight: '#FEE2E2',
    midPrimary: '#EF4444',
    midSecondary: '#B91C1C',
    shadow: '#7F1D1D',
    deepShadow: '#450A0A',
    rim: '#FCA5A5',
    glow: 'rgba(239, 68, 68, 0.35)',
  },
  Locked: {
    highlight: '#94A3B8',
    midPrimary: '#64748B',
    midSecondary: '#475569',
    shadow: '#334155',
    deepShadow: '#0F172A',
    rim: '#475569',
    glow: 'rgba(100, 116, 139, 0.15)',
  },
};

export function TrophyRelicSprite({
  trophyId,
  tier = 'Gold',
  isUnlocked = true,
  size = 80,
  className = '',
}: TrophyRelicSpriteProps) {
  // If not unlocked, use the Locked Stone Gray palette and the Padlock emblem
  const activeTier: TrophyTier = isUnlocked ? tier : 'Locked';
  const palette = TIER_PALETTES[activeTier] || TIER_PALETTES.Gold;

  return (
    <svg
      viewBox="0 0 64 64"
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
        {/* Ambient Under-Plinth Glow */}
        <filter id={`glow-${trophyId}-${activeTier}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={palette.glow} />
        </filter>
      </defs>

      <g filter={isUnlocked ? `url(#glow-${trophyId}-${activeTier})` : undefined}>
        {/* ========================================================================= */}
        {/* 1. PEDESTAL PLINTH BASE (IDENTICAL ACROSS ALL 20 TROPHIES)                */}
        {/* ========================================================================= */}
        
        {/* Plinth Bottom Foot (x: 16 to 48, y: 56 to 60) */}
        <rect x="16" y="58" width="32" height="4" fill={palette.deepShadow} />
        <rect x="18" y="56" width="28" height="2" fill={palette.shadow} />
        <rect x="18" y="56" width="4" height="2" fill={palette.highlight} />

        {/* Plinth Middle Step (x: 20 to 44, y: 52 to 56) */}
        <rect x="20" y="54" width="24" height="2" fill={palette.shadow} />
        <rect x="22" y="52" width="20" height="2" fill={palette.midSecondary} />
        <rect x="22" y="52" width="3" height="2" fill={palette.highlight} />

        {/* Plinth Top Collar (x: 24 to 40, y: 48 to 52) */}
        <rect x="24" y="50" width="16" height="2" fill={palette.midPrimary} />
        <rect x="26" y="48" width="12" height="2" fill={palette.rim} />
        <rect x="26" y="48" width="2" height="2" fill={palette.highlight} />

        {/* Plinth Central Inscription Plate */}
        <rect x="28" y="54" width="8" height="2" fill={palette.deepShadow} />
        <rect x="30" y="54" width="4" height="1" fill={palette.highlight} />

        {/* ========================================================================= */}
        {/* 2. CHALICE STEM & CUP BOWL (IDENTICAL ACROSS ALL 20 TROPHIES)             */}
        {/* ========================================================================= */}

        {/* Stem Column (y: 42 to 48) */}
        <rect x="29" y="44" width="6" height="4" fill={palette.midSecondary} />
        <rect x="30" y="44" width="2" height="4" fill={palette.highlight} />
        <rect x="33" y="44" width="2" height="4" fill={palette.deepShadow} />

        {/* Stem Node Ring (y: 42 to 44) */}
        <rect x="27" y="42" width="10" height="2" fill={palette.midPrimary} />
        <rect x="28" y="42" width="2" height="2" fill={palette.highlight} />

        {/* Chalice Lower Bowl (y: 34 to 42) */}
        <rect x="24" y="38" width="16" height="4" fill={palette.midPrimary} />
        <rect x="22" y="34" width="20" height="4" fill={palette.midPrimary} />
        <rect x="22" y="34" width="4" height="8" fill={palette.highlight} />
        <rect x="38" y="34" width="4" height="8" fill={palette.deepShadow} />

        {/* Chalice Main Cup Body (y: 18 to 34) */}
        <rect x="18" y="24" width="28" height="10" fill={palette.midPrimary} />
        <rect x="16" y="18" width="32" height="6" fill={palette.midSecondary} />

        {/* Cup Left Specular Highlight */}
        <rect x="18" y="18" width="4" height="16" fill={palette.highlight} />
        <rect x="22" y="18" width="2" height="16" fill={palette.rim} />

        {/* Cup Right Shadow Edge */}
        <rect x="42" y="18" width="4" height="16" fill={palette.shadow} />
        <rect x="44" y="18" width="4" height="16" fill={palette.deepShadow} />

        {/* Cup Top Ornamental Rim (y: 14 to 18) */}
        <rect x="14" y="16" width="36" height="2" fill={palette.rim} />
        <rect x="16" y="14" width="32" height="2" fill={palette.highlight} />
        <rect x="44" y="14" width="4" height="4" fill={palette.deepShadow} />

        {/* ========================================================================= */}
        {/* 3. TWIN WINGED HANDLES (IDENTICAL ACROSS ALL 20 TROPHIES)                 */}
        {/* ========================================================================= */}

        {/* Left Wing Handle */}
        <rect x="10" y="18" width="4" height="2" fill={palette.rim} />
        <rect x="8" y="20" width="4" height="4" fill={palette.highlight} />
        <rect x="6" y="24" width="4" height="6" fill={palette.midPrimary} />
        <rect x="8" y="30" width="4" height="4" fill={palette.shadow} />
        <rect x="12" y="32" width="6" height="2" fill={palette.deepShadow} />
        {/* Left Handle Cutout */}
        <rect x="10" y="22" width="2" height="8" fill="none" />

        {/* Right Wing Handle */}
        <rect x="50" y="18" width="4" height="2" fill={palette.rim} />
        <rect x="52" y="20" width="4" height="4" fill={palette.midPrimary} />
        <rect x="54" y="24" width="4" height="6" fill={palette.midSecondary} />
        <rect x="52" y="30" width="4" height="4" fill={palette.shadow} />
        <rect x="46" y="32" width="6" height="2" fill={palette.deepShadow} />
        {/* Right Handle Cutout */}
        <rect x="52" y="22" width="2" height="8" fill="none" />

        {/* ========================================================================= */}
        {/* 4. THE CENTER AMULET / GOBLET EMBLEM (CHANGES PER TROPHY)                 */}
        {/* ========================================================================= */}

        {/* Center Medallion Backing Disc (x: 23 to 41, y: 20 to 32) */}
        <rect x="24" y="20" width="16" height="12" fill={palette.deepShadow} />
        <rect x="25" y="21" width="14" height="10" fill={palette.shadow} />

        {/* Distinct Emblem Inside Center Medallion */}
        {renderTrophyAmulet(isUnlocked ? trophyId : 'locked', palette)}
      </g>
    </svg>
  );
}

// Renders the specific thematic pixel amulet crest
function renderTrophyAmulet(
  id: string,
  palette: typeof TIER_PALETTES.Gold
) {
  // If locked, render uniform iron padlock
  if (id === 'locked') {
    return (
      <g>
        {/* Padlock Shackle */}
        <rect x="29" y="21" width="6" height="2" fill="#E2E8F0" />
        <rect x="28" y="23" width="2" height="3" fill="#E2E8F0" />
        <rect x="34" y="23" width="2" height="3" fill="#E2E8F0" />
        {/* Padlock Body */}
        <rect x="27" y="25" width="10" height="6" fill="#475569" />
        <rect x="28" y="26" width="8" height="4" fill="#64748B" />
        {/* Keyhole */}
        <rect x="31" y="27" width="2" height="2" fill="#0F172A" />
        <rect x="31" y="29" width="2" height="1" fill="#0F172A" />
      </g>
    );
  }

  switch (id) {
    // 1. Solar Vanguard: 8-Ray Sun Disk
    case 'solar_vanguard':
    case 'first_light':
      return (
        <g>
          {/* Sun Core */}
          <rect x="29" y="23" width="6" height="6" fill="#FEF08A" />
          <rect x="30" y="24" width="4" height="4" fill="#FACC15" />
          <rect x="31" y="25" width="2" height="2" fill="#FFFFFF" />
          {/* Cardinal Rays */}
          <rect x="31" y="21" width="2" height="2" fill="#F59E0B" />
          <rect x="31" y="29" width="2" height="2" fill="#F59E0B" />
          <rect x="27" y="25" width="2" height="2" fill="#F59E0B" />
          <rect x="35" y="25" width="2" height="2" fill="#F59E0B" />
        </g>
      );

    // 2. Iron Protein Anchor & Protein Streak: Anvil / Forged Weight
    case 'iron_anchor':
    case 'protein_streak':
      return (
        <g>
          {/* Anvil Horn & Top Plate */}
          <rect x="27" y="23" width="10" height="2" fill="#94A3B8" />
          <rect x="28" y="23" width="3" height="1" fill="#F8FAFC" />
          {/* Anvil Waist */}
          <rect x="30" y="25" width="4" height="2" fill="#64748B" />
          {/* Anvil Base */}
          <rect x="28" y="27" width="8" height="3" fill="#475569" />
          <rect x="29" y="28" width="6" height="1" fill="#334155" />
        </g>
      );

    // 3. Hydration Alchemist & Cellular Surge: Water Flask / Purity Droplet
    case 'hydration_alchemist':
    case 'cellular_surge':
      return (
        <g>
          {/* Flask Stopper */}
          <rect x="30" y="21" width="4" height="2" fill="#FDE68A" />
          {/* Flask Neck */}
          <rect x="31" y="23" width="2" height="1" fill="#93C5FD" />
          {/* Flask Droplet Body */}
          <rect x="28" y="24" width="8" height="6" fill="#38BDF8" />
          <rect x="29" y="25" width="6" height="4" fill="#0284C7" />
          {/* Specular Droplet Highlight */}
          <rect x="29" y="25" width="2" height="2" fill="#E0F2FE" />
        </g>
      );

    // 4. Desk Goblin: Slumped Low Battery
    case 'desk_goblin':
      return (
        <g>
          {/* Battery Shell */}
          <rect x="27" y="24" width="10" height="5" fill="#DC2626" />
          <rect x="28" y="25" width="8" height="3" fill="#7F1D1D" />
          {/* Terminal Nub */}
          <rect x="37" y="25" width="1" height="3" fill="#DC2626" />
          {/* Low Battery Red Level */}
          <rect x="29" y="25" width="2" height="3" fill="#EF4444" />
        </g>
      );

    // 5. Midnight Gambler: Crescent Moon & Coffee Bean
    case 'midnight_gambler':
      return (
        <g>
          {/* Crescent Moon */}
          <rect x="28" y="23" width="6" height="6" fill="#FCD34D" />
          <rect x="30" y="24" width="4" height="4" fill={palette.deepShadow} />
          {/* Coffee Steam */}
          <rect x="33" y="22" width="2" height="2" fill="#FDE68A" />
          <rect x="34" y="26" width="3" height="4" fill="#92400E" />
        </g>
      );

    // 6. Forged Re-entry: Phoenix Flame
    case 'forged_reentry':
      return (
        <g>
          {/* Outer Flame */}
          <rect x="29" y="22" width="6" height="8" fill="#3B82F6" />
          <rect x="30" y="23" width="4" height="6" fill="#60A5FA" />
          {/* Core White Flame */}
          <rect x="31" y="25" width="2" height="3" fill="#EFF6FF" />
          <rect x="31" y="21" width="2" height="2" fill="#2563EB" />
        </g>
      );

    // 7. 7-Day Monolith: Roman VII Tablet
    case 'streak_7d':
      return (
        <g>
          {/* Roman VII Symbol */}
          {/* V */}
          <rect x="27" y="24" width="2" height="4" fill="#F8FAFC" />
          <rect x="29" y="27" width="2" height="2" fill="#F8FAFC" />
          <rect x="31" y="24" width="2" height="4" fill="#F8FAFC" />
          {/* I */}
          <rect x="34" y="24" width="1" height="5" fill="#F8FAFC" />
          {/* I */}
          <rect x="36" y="24" width="1" height="5" fill="#F8FAFC" />
        </g>
      );

    // 8. 30-Day Solstice: Celestial Star Crown
    case 'streak_30d':
    case 'grand_sanctuary':
      return (
        <g>
          {/* Star Crown Central Spire */}
          <rect x="31" y="21" width="2" height="4" fill="#E9D5FF" />
          {/* Left / Right Spires */}
          <rect x="28" y="23" width="2" height="3" fill="#C084FC" />
          <rect x="34" y="23" width="2" height="3" fill="#C084FC" />
          {/* Crown Diadem Base */}
          <rect x="27" y="26" width="10" height="3" fill="#A855F7" />
          {/* Jewel Inset */}
          <rect x="31" y="27" width="2" height="1" fill="#FFFFFF" />
        </g>
      );

    // 9. Clean Plate: Golden Plate & Utensils
    case 'clean_plate':
      return (
        <g>
          {/* Round Plate */}
          <rect x="28" y="23" width="8" height="6" fill="#FEF08A" />
          <rect x="29" y="24" width="6" height="4" fill="#F59E0B" />
          <rect x="30" y="25" width="4" height="2" fill="#FFFFFF" />
        </g>
      );

    // 10. Zero Slump: Peak Lightning Bolt
    case 'zero_slump':
      return (
        <g>
          {/* Lightning Bolt */}
          <rect x="32" y="21" width="3" height="3" fill="#FACC15" />
          <rect x="30" y="23" width="4" height="2" fill="#FACC15" />
          <rect x="29" y="25" width="4" height="2" fill="#FEF08A" />
          <rect x="31" y="26" width="3" height="4" fill="#F59E0B" />
        </g>
      );

    // 11. Evening Seal Master: Wax Seal Stamp Coin
    case 'evening_seal_master':
      return (
        <g>
          {/* Wax Seal Circle */}
          <rect x="28" y="23" width="8" height="6" fill="#D97706" />
          <rect x="29" y="24" width="6" height="4" fill="#F59E0B" />
          {/* Shield Emblem inside Seal */}
          <rect x="31" y="25" width="2" height="2" fill="#FEF3C7" />
        </g>
      );

    // 12. Thermal Receipt: Perforated Receipt Scroll
    case 'thermal_receipt':
      return (
        <g>
          {/* Receipt Slip */}
          <rect x="29" y="22" width="6" height="8" fill="#FFFDF9" />
          {/* Monospace Text Lines */}
          <rect x="30" y="24" width="4" height="1" fill="#1A3629" />
          <rect x="30" y="26" width="3" height="1" fill="#1A3629" />
          <rect x="30" y="28" width="4" height="1" fill="#1A3629" />
        </g>
      );

    // 13. Caffeine Gatekeeper: Hourglass & Cutoff
    case 'caffeine_gate':
      return (
        <g>
          {/* Hourglass Upper Bulb */}
          <rect x="29" y="22" width="6" height="2" fill="#D97706" />
          <rect x="30" y="24" width="4" height="2" fill="#FDE68A" />
          {/* Hourglass Neck */}
          <rect x="31" y="25" width="2" height="1" fill="#92400E" />
          {/* Lower Bulb */}
          <rect x="30" y="26" width="4" height="2" fill="#D97706" />
          <rect x="29" y="28" width="6" height="2" fill="#B45309" />
        </g>
      );

    // 14. Circadian Master: Sun-Moon Cadence
    case 'circadian_master':
      return (
        <g>
          {/* Left Sun Half */}
          <rect x="28" y="23" width="4" height="6" fill="#FBBF24" />
          {/* Right Moon Half */}
          <rect x="32" y="23" width="4" height="6" fill="#818CF8" />
          <rect x="33" y="24" width="2" height="4" fill="#C7D2FE" />
        </g>
      );

    // 15. Perfect Week / 7-Star Constellation
    case 'perfect_week':
      return (
        <g>
          {/* 7 Star Dots */}
          <rect x="28" y="23" width="2" height="2" fill="#FEF08A" />
          <rect x="31" y="22" width="2" height="2" fill="#FFFFFF" />
          <rect x="34" y="23" width="2" height="2" fill="#FEF08A" />
          <rect x="29" y="26" width="2" height="2" fill="#FEF08A" />
          <rect x="33" y="26" width="2" height="2" fill="#FEF08A" />
          <rect x="31" y="28" width="2" height="2" fill="#FFFFFF" />
        </g>
      );

    // Default Fallback: Classical Crest Emblem
    default:
      return (
        <g>
          <rect x="29" y="24" width="6" height="5" fill={palette.highlight} />
          <rect x="30" y="25" width="4" height="3" fill={palette.rim} />
          <rect x="31" y="26" width="2" height="1" fill={palette.deepShadow} />
        </g>
      );
  }
}
