'use client';

import React from 'react';

export interface PixelWaxSealProps {
  isForged?: boolean;
  size?: number;
  className?: string;
}

export function PixelWaxSeal({
  isForged = false,
  size = 28,
  className = '',
}: PixelWaxSealProps) {
  // Palettes: Imperial Crimson vs Forged Slate-Iron
  const c = isForged
    ? {
        deepShadow: '#090D16',
        shadow: '#1E293B',
        mid: '#334155',
        highlight: '#64748B',
        light: '#94A3B8',
        emblem: '#F59E0B',
        emblemLight: '#FEF3C7',
      }
    : {
        deepShadow: '#2D0606',
        shadow: '#7F1D1D',
        mid: '#991B1B',
        highlight: '#DC2626',
        light: '#F87171',
        emblem: '#FFFDF9',
        emblemLight: '#FFFFFF',
      };

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`select-none shrink-0 ${className}`}
      style={{ imageRendering: 'pixelated' }}
      shapeRendering="crispEdges"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Pixelated Drop Shadow */}
      <rect x="8" y="22" width="8" height="2" fill={c.deepShadow} opacity="0.6" />
      <rect x="5" y="20" width="14" height="2" fill={c.deepShadow} opacity="0.6" />

      {/* Outer Molten Pixel Wax Pool (24x24 pixel grid) */}
      {/* Row 1 */}
      <rect x="8" y="1" width="8" height="1" fill={c.highlight} />
      {/* Row 2 */}
      <rect x="5" y="2" width="3" height="1" fill={c.highlight} />
      <rect x="8" y="2" width="8" height="1" fill={c.light} />
      <rect x="16" y="2" width="3" height="1" fill={c.mid} />
      {/* Row 3 */}
      <rect x="3" y="3" width="2" height="1" fill={c.highlight} />
      <rect x="5" y="3" width="3" height="1" fill={c.light} />
      <rect x="8" y="3" width="8" height="1" fill={c.highlight} />
      <rect x="16" y="3" width="3" height="1" fill={c.mid} />
      <rect x="19" y="3" width="2" height="1" fill={c.shadow} />
      {/* Row 4 */}
      <rect x="2" y="4" width="2" height="1" fill={c.highlight} />
      <rect x="4" y="4" width="3" height="1" fill={c.light} />
      <rect x="7" y="4" width="10" height="1" fill={c.mid} />
      <rect x="17" y="4" width="3" height="1" fill={c.shadow} />
      <rect x="20" y="4" width="2" height="1" fill={c.deepShadow} />

      {/* Body Rows (y: 5 to 18) */}
      <rect x="1" y="5" width="2" height="14" fill={c.highlight} />
      <rect x="3" y="5" width="2" height="14" fill={c.light} />
      <rect x="5" y="5" width="14" height="14" fill={c.mid} />
      <rect x="19" y="5" width="2" height="14" fill={c.shadow} />
      <rect x="21" y="5" width="2" height="14" fill={c.deepShadow} />

      {/* Bottom Taper Rows */}
      {/* Row 19 */}
      <rect x="2" y="19" width="2" height="1" fill={c.highlight} />
      <rect x="4" y="19" width="3" height="1" fill={c.mid} />
      <rect x="7" y="19" width="10" height="1" fill={c.shadow} />
      <rect x="17" y="19" width="3" height="1" fill={c.deepShadow} />
      <rect x="20" y="19" width="2" height="1" fill={c.deepShadow} />
      {/* Row 20 */}
      <rect x="3" y="20" width="2" height="1" fill={c.mid} />
      <rect x="5" y="20" width="3" height="1" fill={c.shadow} />
      <rect x="8" y="20" width="8" height="1" fill={c.deepShadow} />
      <rect x="16" y="20" width="3" height="1" fill={c.deepShadow} />
      <rect x="19" y="20" width="2" height="1" fill={c.deepShadow} />
      {/* Row 21 */}
      <rect x="5" y="21" width="3" height="1" fill={c.shadow} />
      <rect x="8" y="21" width="8" height="1" fill={c.deepShadow} />
      <rect x="16" y="21" width="3" height="1" fill={c.deepShadow} />
      {/* Row 22 */}
      <rect x="8" y="22" width="8" height="1" fill={c.deepShadow} />

      {/* Inner Depressed Stamp Well (Circular Pixel Well from x:6 to 17, y:6 to 17) */}
      <rect x="8" y="6" width="8" height="1" fill={c.deepShadow} />
      <rect x="7" y="7" width="10" height="1" fill={c.deepShadow} />
      <rect x="6" y="8" width="12" height="8" fill={c.shadow} />
      <rect x="7" y="16" width="10" height="1" fill={c.mid} />
      <rect x="8" y="17" width="8" height="1" fill={c.mid} />

      {/* EMBOSSED SIGNET */}
      {isForged ? (
        /* Kintsugi Gold Fracture Seam */
        <g id="pixel-kintsugi-seam">
          <rect x="7" y="11" width="3" height="2" fill={c.emblem} />
          <rect x="10" y="9" width="2" height="3" fill={c.emblemLight} />
          <rect x="12" y="12" width="2" height="3" fill={c.emblem} />
          <rect x="14" y="10" width="3" height="2" fill={c.emblemLight} />
          {/* Iron Rivet Core */}
          <rect x="11" y="11" width="2" height="2" fill="#0F172A" />
        </g>
      ) : (
        /* Crisp 16-Bit Guild Heraldic Star */
        <g id="pixel-guild-star">
          {/* Vertical & Horizontal Cross */}
          <rect x="11" y="8" width="2" height="8" fill={c.emblem} />
          <rect x="8" y="11" width="8" height="2" fill={c.emblem} />
          {/* Diagonal Ray Pips */}
          <rect x="9" y="9" width="2" height="2" fill={c.emblem} />
          <rect x="13" y="9" width="2" height="2" fill={c.emblem} />
          <rect x="9" y="13" width="2" height="2" fill={c.emblem} />
          <rect x="13" y="13" width="2" height="2" fill={c.emblem} />
          {/* Diamond Center Specular Sparkle */}
          <rect x="11" y="11" width="2" height="2" fill={c.emblemLight} />
        </g>
      )}
    </svg>
  );
}
