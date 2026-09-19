'use client';

import React from 'react';

export interface WaxSealSvgProps {
  isForged?: boolean;
  size?: number;
  className?: string;
}

export function WaxSealSvg({
  isForged = false,
  size = 48,
  className = '',
}: WaxSealSvgProps) {
  const sealId = isForged ? 'forged-wax' : 'guild-wax';

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`select-none transition-transform duration-300 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="geometricPrecision"
    >
      <defs>
        {/* Deep drop shadow under molten pool */}
        <filter id={`${sealId}-drop`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#1A0D08" floodOpacity="0.45" />
        </filter>

        {/* Specular bevel lighting for wax depth */}
        <radialGradient id={`${sealId}-radial`} cx="38%" cy="32%" r="65%">
          {isForged ? (
            <>
              <stop offset="0%" stopColor="#64748B" />
              <stop offset="45%" stopColor="#334155" />
              <stop offset="85%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="30%" stopColor="#DC2626" />
              <stop offset="65%" stopColor="#991B1B" />
              <stop offset="90%" stopColor="#7F1D1D" />
              <stop offset="100%" stopColor="#450A0A" />
            </>
          )}
        </radialGradient>

        <linearGradient id={`${sealId}-rim-light`} x1="20%" y1="10%" x2="80%" y2="90%">
          <stop offset="0%" stopColor={isForged ? '#94A3B8' : '#FCA5A5'} stopOpacity="0.9" />
          <stop offset="50%" stopColor={isForged ? '#475569' : '#B91C1C'} stopOpacity="0.2" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
        </linearGradient>

        {/* Gold Glow for Forged Kintsugi */}
        <filter id={`${sealId}-gold-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#F59E0B" floodOpacity="0.8" />
        </filter>
      </defs>

      {/* 1. Outer Organic Molten Wax Spill Pool */}
      <path
        d="M 50 3
           C 64 2, 74 8, 83 17
           C 92 26, 98 37, 97 50
           C 96 64, 91 75, 82 84
           C 72 93, 62 97, 49 97
           C 36 97, 25 92, 16 83
           C 7 74, 2 63, 3 49
           C 4 35, 11 24, 20 15
           C 29 6, 38 4, 50 3 Z"
        fill={`url(#${sealId}-radial)`}
        filter={`url(#${sealId}-drop)`}
      />

      {/* Irregular molten edge drips & ripples */}
      <path
        d="M 22 18 C 30 11, 40 8, 52 7 C 65 6, 76 11, 84 20 C 91 28, 94 40, 93 52 C 92 63, 87 73, 79 81 C 70 89, 58 93, 47 92 C 34 91, 23 86, 16 77 C 9 68, 7 56, 8 45 C 9 34, 15 24, 22 18 Z"
        fill="none"
        stroke={`url(#${sealId}-rim-light)`}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* 2. Concentric Beveled Circular Stamp Well */}
      <circle cx="50" cy="50" r="32" fill={isForged ? '#1E293B' : '#7F1D1D'} />
      <circle
        cx="50"
        cy="50"
        r="31"
        fill="none"
        stroke={isForged ? '#334155' : '#991B1B'}
        strokeWidth="2"
      />
      <circle
        cx="50"
        cy="50"
        r="28"
        fill="none"
        stroke={isForged ? '#475569' : '#B91C1C'}
        strokeWidth="1.2"
        strokeDasharray="2 1.5"
      />

      {/* 3. Embossed Guild Insignia */}
      {isForged ? (
        /* Forged Kintsugi Iron Signet */
        <g id="forged-insignia">
          {/* Iron Anvil / Rivet Core */}
          <rect x="38" y="38" width="24" height="24" rx="4" fill="#0F172A" />
          <rect x="40" y="40" width="20" height="20" rx="3" fill="#334155" />
          {/* Molten Gold Kintsugi Fracture Seam across the seal */}
          <path
            d="M 26 50 L 39 45 L 52 54 L 63 42 L 74 48"
            stroke="#F59E0B"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            filter={`url(#${sealId}-gold-glow)`}
          />
          <path
            d="M 26 50 L 39 45 L 52 54 L 63 42 L 74 48"
            stroke="#FFFBEB"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="50" cy="50" r="3" fill="#F59E0B" />
        </g>
      ) : (
        /* Imperial Guild Heraldic Compass Star Signet */
        <g id="guild-star-insignia">
          {/* Subtle inner deboss shadow */}
          <polygon
            points="50,22 55,42 75,42 59,54 65,74 50,62 35,74 41,54 25,42 45,42"
            fill="#450A0A"
            opacity="0.6"
            transform="translate(0, 1.5)"
          />
          {/* Gold / White-hot Embossed Heraldic Star */}
          <polygon
            points="50,22 55,42 75,42 59,54 65,74 50,62 35,74 41,54 25,42 45,42"
            fill="#FFFDF9"
          />
          {/* Center Facet Highlights */}
          <polygon
            points="50,22 50,50 55,42"
            fill="#FEE2E2"
          />
          <polygon
            points="75,42 50,50 59,54"
            fill="#FCA5A5"
          />
          <polygon
            points="65,74 50,50 50,62"
            fill="#F87171"
          />
          <polygon
            points="35,74 50,50 41,54"
            fill="#FCA5A5"
          />
          <polygon
            points="25,42 50,50 45,42"
            fill="#FEE2E2"
          />
          {/* Core Seal Diamond Eye */}
          <circle cx="50" cy="50" r="3.5" fill="#B91C1C" />
          <circle cx="50" cy="50" r="1.5" fill="#FFFDF9" />
        </g>
      )}

      {/* 4. Top-Left Organic Specular Gloss Arc */}
      <path
        d="M 32 16 C 42 12, 56 12, 68 17"
        stroke="#FFFDF9"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}
