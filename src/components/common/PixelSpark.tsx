'use client';

import React from 'react';

interface PixelSparkProps {
  size?: number;
  className?: string;
  color?: string;
}

export function PixelSpark({ size = 16, className = '', color = '#F4CF74' }: PixelSparkProps) {
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{
        width: size,
        height: size,
        imageRendering: 'pixelated',
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 16 16"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Core Pixel Star Cross */}
        <rect x="7" y="1" width="2" height="14" fill={color} />
        <rect x="1" y="7" width="14" height="2" fill={color} />
        
        {/* Inner step shoulders */}
        <rect x="5" y="4" width="6" height="8" fill={color} />
        <rect x="4" y="5" width="8" height="6" fill={color} />
        
        {/* Central brilliant core */}
        <rect x="6" y="6" width="4" height="4" fill="#FFFFFF" />
        <rect x="7" y="7" width="2" height="2" fill="#FFFBEB" />
        
        {/* Pixel shimmer tips */}
        <rect x="7" y="0" width="2" height="1" fill="#FFFFFF" opacity="0.8" />
        <rect x="7" y="15" width="2" height="1" fill={color} opacity="0.6" />
        <rect x="0" y="7" width="1" height="2" fill="#FFFFFF" opacity="0.8" />
        <rect x="15" y="7" width="1" height="2" fill={color} opacity="0.6" />
      </svg>
    </span>
  );
}
