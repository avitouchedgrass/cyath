'use client';

import React from 'react';
import { EXCLUSIVE_DECORATIONS, IslandDecoration } from '@/lib/constants/xpMatrix';

interface IslandDecorationProps {
  unlockedIds?: string[];
  className?: string;
  variant?: 'diorama' | 'tray';
}

/**
 * Pixel-precise SVG sprites for Island Decorations adhering to
 * Warm Editorial Neobrutalism and image-rendering: pixelated.
 */
export function DecorationSprite({
  id,
  size = 48,
  className = '',
}: {
  id: string;
  size?: number;
  className?: string;
}) {
  switch (id) {
    case 'vanguard_lantern':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          className={`select-none drop-shadow-[0_2px_8px_rgba(217,119,6,0.35)] ${className}`}
          style={{ imageRendering: 'pixelated' }}
          role="img"
          aria-label="Vanguard Lantern"
        >
          {/* Iron chain / hook */}
          <rect x="15" y="2" width="2" height="4" fill="#1A3629" />
          <rect x="13" y="6" width="6" height="2" fill="#1A3629" />
          {/* Brass Cap */}
          <rect x="11" y="8" width="10" height="2" fill="#B45309" />
          <rect x="9" y="10" width="14" height="2" fill="#D97706" />
          {/* Glass Chamber */}
          <rect x="10" y="12" width="12" height="10" fill="#FEF3C7" fillOpacity="0.85" />
          <rect x="10" y="12" width="2" height="10" fill="#1A3629" />
          <rect x="20" y="12" width="2" height="10" fill="#1A3629" />
          {/* Glowing Flame Core */}
          <rect x="14" y="15" width="4" height="5" fill="#F59E0B" />
          <rect x="15" y="16" width="2" height="3" fill="#FFFBEB" />
          {/* Brass Base */}
          <rect x="9" y="22" width="14" height="3" fill="#D97706" />
          <rect x="11" y="25" width="10" height="2" fill="#92400E" />
          <rect x="13" y="27" width="6" height="2" fill="#1A3629" />
        </svg>
      );

    case 'sprouting_moss':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          className={`select-none drop-shadow-[0_2px_6px_rgba(16,185,129,0.25)] ${className}`}
          style={{ imageRendering: 'pixelated' }}
          role="img"
          aria-label="Sprouting Velvet Moss"
        >
          {/* Stone Shelf */}
          <rect x="4" y="22" width="24" height="6" rx="2" fill="#334155" />
          <rect x="6" y="20" width="20" height="2" fill="#475569" />
          {/* Rich Velvet Moss Clusters */}
          <rect x="6" y="16" width="6" height="4" rx="1" fill="#047857" />
          <rect x="10" y="14" width="8" height="6" rx="1" fill="#10B981" />
          <rect x="16" y="15" width="7" height="5" rx="1" fill="#059669" />
          <rect x="12" y="12" width="4" height="3" fill="#34D399" />
          {/* Sprouting Spores */}
          <rect x="9" y="10" width="2" height="4" fill="#059669" />
          <rect x="8" y="9" width="4" height="2" fill="#6EE7B7" />
          <rect x="19" y="11" width="2" height="4" fill="#047857" />
          <rect x="18" y="10" width="4" height="2" fill="#A7F3D0" />
        </svg>
      );

    case 'clear_pool':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          className={`select-none drop-shadow-[0_2px_8px_rgba(2,132,199,0.3)] ${className}`}
          style={{ imageRendering: 'pixelated' }}
          role="img"
          aria-label="Clear Spring Basin"
        >
          {/* Basin Rim */}
          <ellipse cx="16" cy="19" rx="13" ry="7" fill="#334155" />
          <ellipse cx="16" cy="18" rx="12" ry="6" fill="#475569" />
          {/* Crystalline Water Surface */}
          <ellipse cx="16" cy="17" rx="10" ry="5" fill="#0284C7" />
          <ellipse cx="16" cy="16.5" rx="8" ry="3.5" fill="#38BDF8" />
          {/* Shimmer / Ripple Highlights */}
          <path d="M12 16 Q14 15 16 16 T20 16" stroke="#E0F2FE" strokeWidth="1" fill="none" />
          <rect x="13" y="15" width="2" height="1" fill="#FFFFFF" />
          <rect x="18" y="16" width="3" height="1" fill="#BAE6FD" />
        </svg>
      );

    case 'dossier_consecutive_badge':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          className={`select-none drop-shadow-[0_2px_8px_rgba(180,83,9,0.3)] ${className}`}
          style={{ imageRendering: 'pixelated' }}
          role="img"
          aria-label="Archival Astrolabe"
        >
          {/* Outer Astrolabe Ring */}
          <circle cx="16" cy="16" r="12" stroke="#B45309" strokeWidth="2" fill="none" />
          <circle cx="16" cy="16" r="9" stroke="#78350F" strokeWidth="1" strokeDasharray="2 2" fill="none" />
          {/* Top Suspension Loop */}
          <circle cx="16" cy="3" r="2.5" stroke="#B45309" strokeWidth="1.5" fill="none" />
          {/* Coordinate Crosshairs */}
          <line x1="16" y1="5" x2="16" y2="27" stroke="#92400E" strokeWidth="1.5" />
          <line x1="5" y1="16" x2="27" y2="16" stroke="#92400E" strokeWidth="1.5" />
          {/* Center Relic Core */}
          <circle cx="16" cy="16" r="3.5" fill="#D97706" />
          <circle cx="16" cy="16" r="1.5" fill="#FEF3C7" />
          {/* Corner Degree Ticks */}
          <rect x="7" y="7" width="2" height="2" fill="#F59E0B" />
          <rect x="23" y="7" width="2" height="2" fill="#F59E0B" />
          <rect x="7" y="23" width="2" height="2" fill="#F59E0B" />
          <rect x="23" y="23" width="2" height="2" fill="#F59E0B" />
        </svg>
      );

    default:
      return null;
  }
}

/**
 * Diorama Overlay that renders unlocked decorations in scenic positions
 * around the floating island container.
 */
export function IslandDioramaOverlay({
  unlockedIds = [],
}: {
  unlockedIds?: string[];
}) {
  if (!unlockedIds || unlockedIds.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {/* 1. Vanguard Lantern (Lower Right Cliff) */}
      {unlockedIds.includes('vanguard_lantern') && (
        <div
          className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 md:bottom-12 md:right-12 animate-[float_4s_ease-in-out_infinite] pointer-events-auto cursor-help group"
          title="Vanguard Lantern: Pioneer Guild Anchor"
        >
          <div className="relative">
            <DecorationSprite id="vanguard_lantern" size={40} />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-[#D97706]/20 blur-[2px] rounded-full" />
            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded bg-[#1A3629] text-[#FFFDF9] font-mono text-[9px] pointer-events-none shadow-sm">
              Vanguard Lantern
            </div>
          </div>
        </div>
      )}

      {/* 2. Sprouting Velvet Moss (Bottom Left Base) */}
      {unlockedIds.includes('sprouting_moss') && (
        <div
          className="absolute bottom-3 left-4 sm:bottom-6 sm:left-8 md:bottom-10 md:left-12 pointer-events-auto cursor-help group"
          title="Sprouting Velvet Moss: Habit Foundation Anchor"
        >
          <div className="relative">
            <DecorationSprite id="sprouting_moss" size={38} />
            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded bg-[#1A3629] text-[#FFFDF9] font-mono text-[9px] pointer-events-none shadow-sm">
              Velvet Moss
            </div>
          </div>
        </div>
      )}

      {/* 3. Clear Spring Basin (Left Plateau) */}
      {unlockedIds.includes('clear_pool') && (
        <div
          className="absolute top-1/3 left-2 sm:left-4 md:left-8 pointer-events-auto cursor-help group animate-[float_6s_ease-in-out_infinite_1s]"
          title="Clear Spring Basin: Hydration Anchor"
        >
          <div className="relative">
            <DecorationSprite id="clear_pool" size={36} />
            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded bg-[#1A3629] text-[#FFFDF9] font-mono text-[9px] pointer-events-none shadow-sm">
              Clear Spring Basin
            </div>
          </div>
        </div>
      )}

      {/* 4. Archival Astrolabe (Top Right Sky) */}
      {unlockedIds.includes('dossier_consecutive_badge') && (
        <div
          className="absolute top-3 right-4 sm:top-6 sm:right-8 md:top-8 md:right-10 pointer-events-auto cursor-help group animate-[float_5s_ease-in-out_infinite_0.5s]"
          title="Archival Astrolabe: Consecutive Dossier Review"
        >
          <div className="relative">
            <DecorationSprite id="dossier_consecutive_badge" size={38} />
            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded bg-[#1A3629] text-[#FFFDF9] font-mono text-[9px] pointer-events-none shadow-sm">
              Archival Astrolabe
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Editorial Accessory Tray displaying all possible sanctuary decorations
 * with unlocked/locked states and lore.
 */
export function IslandDecorationsTray({
  unlockedIds = [],
}: {
  unlockedIds?: string[];
}) {
  const decorations = Object.values(EXCLUSIVE_DECORATIONS);

  return (
    <div className="w-full flex flex-col gap-2 mt-3 pt-3 border-t border-[#1A3629]/10">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1A3629]/60">
          Sanctuary Relics & Artifacts ({unlockedIds.length}/{decorations.length})
        </span>
        <span className="font-mono text-[10px] text-[#4A5D4E]">
          Ecosystem Artifacts
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {decorations.map((deco) => {
          const isUnlocked = unlockedIds.includes(deco.id);
          return (
            <div
              key={deco.id}
              className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all ${
                isUnlocked
                  ? 'bg-[#FFFDF9] border-[#1A3629]/15 shadow-2xs'
                  : 'bg-[#FAF6EE]/50 border-dashed border-[#1A3629]/10 opacity-50'
              }`}
            >
              <div className="shrink-0">
                <DecorationSprite id={deco.id} size={28} className={!isUnlocked ? 'grayscale opacity-40' : ''} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-cabinet font-bold text-xs text-[#1A3629] truncate">
                  {deco.name}
                </span>
                <span className="font-mono text-[9px] text-[#4A5D4E] uppercase truncate">
                  {isUnlocked ? 'Active' : 'Locked'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
