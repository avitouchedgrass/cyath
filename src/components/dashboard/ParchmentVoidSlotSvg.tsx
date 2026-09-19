'use client';

import React from 'react';

export interface ParchmentVoidSlotSvgProps {
  isToday?: boolean;
  size?: number;
  className?: string;
}

export function ParchmentVoidSlotSvg({
  isToday = false,
  size = 48,
  className = '',
}: ParchmentVoidSlotSvgProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`select-none transition-all duration-200 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="geometricPrecision"
    >
      <defs>
        {/* Recessed deboss shadow inside parchment well */}
        <radialGradient id="void-well-radial" cx="50%" cy="45%" r="50%">
          <stop offset="60%" stopColor="#8C7A6B" stopOpacity="0.25" />
          <stop offset="85%" stopColor="#5E4E42" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#3D2E24" stopOpacity="0.55" />
        </radialGradient>

        <linearGradient id="paper-lip-light" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#FAF6EE" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#3D2E24" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* 1. Recessed Indented Circular Well */}
      <circle
        cx="50"
        cy="50"
        r="44"
        fill="url(#void-well-radial)"
        stroke="url(#paper-lip-light)"
        strokeWidth="2"
      />

      {/* 2. Inner Stamped Well Border */}
      <circle
        cx="50"
        cy="50"
        r="38"
        fill="none"
        stroke={isToday ? '#B91C1C' : '#735F50'}
        strokeWidth="1.5"
        strokeDasharray={isToday ? '4 3' : '2 3'}
        opacity={isToday ? 0.9 : 0.45}
      />

      {/* 3. Parchment Compass Rosette & Archival Stitch Markings */}
      {isToday ? (
        <g id="today-stamp-target">
          <circle cx="50" cy="50" r="28" fill="none" stroke="#B91C1C" strokeWidth="1" opacity="0.3" />
          {/* Subtle Target Crosshair */}
          <line x1="50" y1="26" x2="50" y2="74" stroke="#B91C1C" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
          <line x1="26" y1="50" x2="74" y2="50" stroke="#B91C1C" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
          <circle cx="50" cy="50" r="5" fill="none" stroke="#B91C1C" strokeWidth="1.5" opacity="0.7" />
          <circle cx="50" cy="50" r="2" fill="#B91C1C" opacity="0.8" />
        </g>
      ) : (
        <g id="archival-empty-well" opacity="0.35">
          {/* Elegant 4-point Cartographic Compass Rosette */}
          <polygon points="50,30 52,48 70,50 52,52 50,70 48,52 30,50 48,48" fill="#5E4E42" />
          <circle cx="50" cy="50" r="4" fill="#B8A994" stroke="#5E4E42" strokeWidth="1" />
          {/* Corner tick marks */}
          <circle cx="34" cy="34" r="1" fill="#5E4E42" />
          <circle cx="66" cy="34" r="1" fill="#5E4E42" />
          <circle cx="34" cy="66" r="1" fill="#5E4E42" />
          <circle cx="66" cy="66" r="1" fill="#5E4E42" />
        </g>
      )}
    </svg>
  );
}
