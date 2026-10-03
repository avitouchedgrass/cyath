'use client';

import React from 'react';

interface PixelPushpinProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export function PixelPushpin({ size = 32, className = '', animate = true }: PixelPushpinProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${
        animate ? 'animate-in zoom-in-50 spin-in-12 duration-300' : ''
      } ${className}`}
      style={{
        width: size,
        height: size,
        imageRendering: 'pixelated',
      }}
      aria-label="Pixel brass pushpin"
      role="img"
    >
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[2px_3px_0px_rgba(26,54,41,0.35)]"
      >
        {/* Shadow under the pin head */}
        <ellipse cx="12" cy="20" rx="3.5" ry="1.5" fill="#1A3629" opacity="0.3" />
        
        {/* Steel needle tip entering cork */}
        <rect x="11.25" y="14" width="1.5" height="6" fill="#88929A" />
        <rect x="11.75" y="15" width="0.5" height="4" fill="#E2E8F0" />
        
        {/* Brass pushpin base disc */}
        <rect x="8" y="12" width="8" height="2" fill="#8C5E1E" />
        <rect x="9" y="12" width="6" height="1" fill="#D9A84E" />

        {/* Pin stem / neck */}
        <rect x="10" y="8" width="4" height="4" fill="#B8862D" />
        <rect x="10.5" y="8" width="1" height="4" fill="#F4CF74" />

        {/* Pin head cap (stepped pixel top) */}
        <rect x="7" y="4" width="10" height="4" fill="#9E6B20" />
        <rect x="8" y="3" width="8" height="1" fill="#C99738" />
        <rect x="9" y="2" width="6" height="1" fill="#D9A84E" />

        {/* Specular pixel highlight glare on head */}
        <rect x="8" y="4" width="2" height="2" fill="#FFF2B2" />
        <rect x="9" y="3" width="1" height="1" fill="#FFFFFF" />
      </svg>
    </div>
  );
}
