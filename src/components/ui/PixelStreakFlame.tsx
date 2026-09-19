'use client';

import React from 'react';

interface PixelStreakFlameProps {
  isForged?: boolean;
  size?: number;
  className?: string;
}

export function PixelStreakFlame({
  isForged = false,
  size = 20,
  className = '',
}: PixelStreakFlameProps) {
  if (isForged) {
    // Kintsugi Forged Flame: Cobalt, Royal Azure & Gold Core
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 select-none ${className}`}
        style={{ imageRendering: 'pixelated' }}
        aria-hidden="true"
      >
        {/* Outer Ember Spire */}
        <rect x="7" y="1" width="2" height="2" fill="#2563EB" />
        <rect x="6" y="3" width="3" height="2" fill="#1D4ED8" />
        <rect x="9" y="3" width="1" height="2" fill="#3B82F6" />

        {/* Mid Body Silhouette */}
        <rect x="5" y="5" width="5" height="3" fill="#1E40AF" />
        <rect x="4" y="8" width="8" height="4" fill="#1D4ED8" />
        <rect x="5" y="12" width="6" height="2" fill="#1E3A8A" />
        <rect x="6" y="14" width="4" height="1" fill="#172554" />

        {/* Azure Mid Glow */}
        <rect x="6" y="6" width="3" height="4" fill="#38BDF8" />
        <rect x="5" y="9" width="5" height="3" fill="#60A5FA" />
        <rect x="6" y="11" width="4" height="2" fill="#3B82F6" />

        {/* Kintsugi Golden Vein Core */}
        <rect x="7" y="8" width="2" height="4" fill="#F59E0B" />
        <rect x="7" y="9" width="1" height="2" fill="#FEF08A" />
        <rect x="8" y="10" width="1" height="2" fill="#FDE047" />

        {/* Accent Spark */}
        <rect x="11" y="5" width="1" height="1" fill="#60A5FA" />
        <rect x="3" y="7" width="1" height="1" fill="#38BDF8" />
      </svg>
    );
  }

  // Classic Living Streak Flame: Deep Red, Radiant Tangerine & Pure Sun Yellow Core
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated' }}
      aria-hidden="true"
    >
      {/* Outer Tip & Sparks */}
      <rect x="7" y="1" width="2" height="2" fill="#EA580C" />
      <rect x="6" y="3" width="4" height="2" fill="#DC2626" />
      <rect x="10" y="4" width="1" height="2" fill="#F97316" />

      {/* Main Flame Body */}
      <rect x="5" y="5" width="6" height="3" fill="#EA580C" />
      <rect x="4" y="8" width="8" height="4" fill="#DC2626" />
      <rect x="5" y="12" width="6" height="2" fill="#B91C1C" />
      <rect x="6" y="14" width="4" height="1" fill="#991B1B" />

      {/* Vibrant Tangerine / Amber Mid Layer */}
      <rect x="6" y="5" width="3" height="3" fill="#F97316" />
      <rect x="5" y="8" width="6" height="4" fill="#F59E0B" />
      <rect x="6" y="11" width="4" height="2" fill="#EA580C" />

      {/* Radiant Sun Yellow Core */}
      <rect x="7" y="8" width="2" height="3" fill="#FDE047" />
      <rect x="7" y="9" width="1" height="2" fill="#FEF08A" />
      <rect x="8" y="10" width="1" height="1" fill="#FFFFFF" />

      {/* Ambient Rising Embers */}
      <rect x="3" y="6" width="1" height="1" fill="#F97316" />
      <rect x="11" y="7" width="1" height="1" fill="#FBBF24" />
      <rect x="8" y="0" width="1" height="1" fill="#FDE047" />
    </svg>
  );
}
