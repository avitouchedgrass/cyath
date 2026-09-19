'use client';

import React from 'react';

export function CorkboardBackdropSvg() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl sm:rounded-3xl overflow-hidden"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
    >
      <defs>
        {/* Subtle Cork Fiber Noise Texture */}
        <filter id="cork-pixel-texture" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
          <feColorMatrix
            type="matrix"
            values="
              0 0 0 0 0.58
              0 0 0 0 0.50
              0 0 0 0 0.40
              0 0 0 0.14 0"
          />
          <feBlend mode="multiply" in="SourceGraphic" />
        </filter>

        {/* 16-Bit Pixel Stamped Corner Plate Palette */}
        <pattern id="pixel-cork-weave" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="#C5B5A0" />
          <rect x="0" y="0" width="4" height="4" fill="#BCA992" opacity="0.4" />
          <rect x="4" y="4" width="4" height="4" fill="#AF9B83" opacity="0.3" />
        </pattern>
      </defs>

      {/* Base Cork Weave Texture */}
      <rect width="100%" height="100%" fill="url(#pixel-cork-weave)" />
      <rect width="100%" height="100%" filter="url(#cork-pixel-texture)" fill="#B5A48F" opacity="0.8" />

      {/* Guild Dispatch Board Matrix Grid Lines (Subtle dotted guides) */}
      <g stroke="#3D2E24" strokeWidth="1" strokeDasharray="2 6" opacity="0.16">
        <line x1="16.66%" y1="0" x2="16.66%" y2="100%" />
        <line x1="33.33%" y1="0" x2="33.33%" y2="100%" />
        <line x1="50%" y1="0" x2="50%" y2="100%" />
        <line x1="66.66%" y1="0" x2="66.66%" y2="100%" />
        <line x1="83.33%" y1="0" x2="83.33%" y2="100%" />

        <line x1="0" y1="20%" x2="100%" y2="20%" />
        <line x1="0" y1="40%" x2="100%" y2="40%" />
        <line x1="0" y1="60%" x2="100%" y2="60%" />
        <line x1="0" y1="80%" x2="100%" y2="80%" />
      </g>

      {/* Stepped Pixel Inner Border */}
      <rect
        x="8"
        y="8"
        width="calc(100% - 16px)"
        height="calc(100% - 16px)"
        fill="none"
        stroke="#453224"
        strokeWidth="2"
        strokeDasharray="8 4"
        opacity="0.3"
      />

      {/* 4 Pixelated Brass Bracket Plates with Iron Rivets */}
      {/* Top Left */}
      <g transform="translate(6, 6)">
        <rect x="0" y="0" width="36" height="4" fill="#F59E0B" />
        <rect x="0" y="4" width="30" height="4" fill="#D97706" />
        <rect x="0" y="8" width="24" height="4" fill="#B45309" />
        <rect x="0" y="12" width="18" height="4" fill="#92400E" />
        <rect x="0" y="16" width="14" height="4" fill="#78350F" />
        <rect x="0" y="20" width="10" height="4" fill="#78350F" />
        <rect x="0" y="24" width="6" height="6" fill="#451A03" />
        {/* Brass Rivet */}
        <rect x="6" y="6" width="4" height="4" fill="#241A13" />
        <rect x="7" y="7" width="2" height="2" fill="#FDE68A" />
      </g>

      {/* Top Right */}
      <g transform="translate(-6, 6)" className="translate-x-full">
        <rect x="-36" y="0" width="36" height="4" fill="#F59E0B" />
        <rect x="-30" y="4" width="30" height="4" fill="#D97706" />
        <rect x="-24" y="8" width="24" height="4" fill="#B45309" />
        <rect x="-18" y="12" width="18" height="4" fill="#92400E" />
        <rect x="-14" y="16" width="14" height="4" fill="#78350F" />
        <rect x="-10" y="20" width="10" height="4" fill="#78350F" />
        <rect x="-6" y="24" width="6" height="6" fill="#451A03" />
        {/* Brass Rivet */}
        <rect x="-10" y="6" width="4" height="4" fill="#241A13" />
        <rect x="-9" y="7" width="2" height="2" fill="#FDE68A" />
      </g>

      {/* Bottom Left */}
      <g transform="translate(6, -6)" className="translate-y-full">
        <rect x="0" y="-4" width="36" height="4" fill="#F59E0B" />
        <rect x="0" y="-8" width="30" height="4" fill="#D97706" />
        <rect x="0" y="-12" width="24" height="4" fill="#B45309" />
        <rect x="0" y="-16" width="18" height="4" fill="#92400E" />
        <rect x="0" y="-20" width="14" height="4" fill="#78350F" />
        <rect x="0" y="-24" width="10" height="4" fill="#78350F" />
        <rect x="0" y="-30" width="6" height="6" fill="#451A03" />
        {/* Brass Rivet */}
        <rect x="6" y="-10" width="4" height="4" fill="#241A13" />
        <rect x="7" y="-9" width="2" height="2" fill="#FDE68A" />
      </g>

      {/* Bottom Right */}
      <g transform="translate(-6, -6)" className="translate-x-full translate-y-full">
        <rect x="-36" y="-4" width="36" height="4" fill="#F59E0B" />
        <rect x="-30" y="-8" width="30" height="4" fill="#D97706" />
        <rect x="-24" y="-12" width="24" height="4" fill="#B45309" />
        <rect x="-18" y="-16" width="18" height="4" fill="#92400E" />
        <rect x="-14" y="-20" width="14" height="4" fill="#78350F" />
        <rect x="-10" y="-24" width="10" height="4" fill="#78350F" />
        <rect x="-6" y="-30" width="6" height="6" fill="#451A03" />
        {/* Brass Rivet */}
        <rect x="-10" y="-10" width="4" height="4" fill="#241A13" />
        <rect x="-9" y="-9" width="2" height="2" fill="#FDE68A" />
      </g>
    </svg>
  );
}
