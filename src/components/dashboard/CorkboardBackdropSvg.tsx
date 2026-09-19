'use client';

import React from 'react';

export function CorkboardBackdropSvg() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none rounded-3xl overflow-hidden"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <defs>
        {/* Subtle Cork & Parchment Fiber Noise Texture */}
        <filter id="cork-texture" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />
          <feColorMatrix
            type="matrix"
            values="
              0 0 0 0 0.58
              0 0 0 0 0.50
              0 0 0 0 0.40
              0 0 0 0.12 0"
          />
          <feBlend mode="multiply" in="SourceGraphic" />
        </filter>

        {/* Brass corner bracket gradient */}
        <linearGradient id="brass-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="35%" stopColor="#D97706" />
          <stop offset="70%" stopColor="#92400E" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        <linearGradient id="wood-bezel" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#453327" />
          <stop offset="50%" stopColor="#2B1F17" />
          <stop offset="100%" stopColor="#1E140E" />
        </linearGradient>
      </defs>

      {/* Base Canvas */}
      <rect width="100%" height="100%" fill="#C5B7A3" />
      <rect width="100%" height="100%" filter="url(#cork-texture)" fill="#B5A48F" opacity="0.85" />

      {/* Archival Ledger Grid Matrix Lines */}
      <g stroke="#3D2E24" strokeWidth="0.75" strokeDasharray="4 6" opacity="0.18">
        <line x1="16%" y1="0" x2="16%" y2="100%" />
        <line x1="33%" y1="0" x2="33%" y2="100%" />
        <line x1="50%" y1="0" x2="50%" y2="100%" />
        <line x1="67%" y1="0" x2="67%" y2="100%" />
        <line x1="84%" y1="0" x2="84%" y2="100%" />

        <line x1="0" y1="20%" x2="100%" y2="20%" />
        <line x1="0" y1="40%" x2="100%" y2="40%" />
        <line x1="0" y1="60%" x2="100%" y2="60%" />
        <line x1="0" y1="80%" x2="100%" y2="80%" />
      </g>

      {/* Inner Inset Stitch Border */}
      <rect
        x="12"
        y="12"
        width="calc(100% - 24px)"
        height="calc(100% - 24px)"
        rx="18"
        fill="none"
        stroke="#5C4838"
        strokeWidth="1.5"
        strokeDasharray="6 4"
        opacity="0.35"
      />

      {/* 4 Stamped Brass Corner Brackets */}
      {/* Top Left */}
      <g transform="translate(10, 10)">
        <polygon points="0,0 28,0 0,28" fill="url(#brass-grad)" />
        <circle cx="8" cy="8" r="2" fill="#451A03" />
      </g>

      {/* Top Right */}
      <g transform="translate(-10, 10)" className="translate-x-full">
        <polygon points="0,0 -28,0 0,28" fill="url(#brass-grad)" />
        <circle cx="-8" cy="8" r="2" fill="#451A03" />
      </g>

      {/* Bottom Left */}
      <g transform="translate(10, -10)" className="translate-y-full">
        <polygon points="0,0 28,0 0,-28" fill="url(#brass-grad)" />
        <circle cx="8" cy="-8" r="2" fill="#451A03" />
      </g>

      {/* Bottom Right */}
      <g transform="translate(-10, -10)" className="translate-x-full translate-y-full">
        <polygon points="0,0 -28,0 0,-28" fill="url(#brass-grad)" />
        <circle cx="-8" cy="-8" r="2" fill="#451A03" />
      </g>
    </svg>
  );
}
