'use client';

import React from 'react';

interface PixelIconProps {
  size?: number;
  className?: string;
  color?: string;
}

/**
 * 16x16 Handcrafted Pixel Flame
 */
export function PixelFlame({ size = 16, className = '', color = '#EA580C' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      {/* Outer flame boundary */}
      <rect x="7" y="1" width="2" height="2" fill={color} />
      <rect x="6" y="3" width="4" height="2" fill={color} />
      <rect x="5" y="5" width="6" height="2" fill={color} />
      <rect x="4" y="7" width="8" height="3" fill={color} />
      <rect x="3" y="10" width="10" height="3" fill={color} />
      <rect x="4" y="13" width="8" height="2" fill={color} />
      <rect x="6" y="15" width="4" height="1" fill={color} />
      {/* Inner bright ember core */}
      <rect x="7" y="7" width="2" height="4" fill="#FDE047" />
      <rect x="6" y="9" width="4" height="3" fill="#FDE047" />
      <rect x="7" y="12" width="2" height="2" fill="#FEF08A" />
      {/* Floating pixel spark */}
      <rect x="10" y="2" width="1" height="2" fill={color} opacity="0.8" />
    </svg>
  );
}

/**
 * 16x16 Pixel Clock / Timer
 */
export function PixelClock({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      {/* Outer clock ring */}
      <rect x="5" y="1" width="6" height="1" fill={color} />
      <rect x="3" y="2" width="2" height="1" fill={color} />
      <rect x="11" y="2" width="2" height="1" fill={color} />
      <rect x="2" y="3" width="1" height="2" fill={color} />
      <rect x="13" y="3" width="1" height="2" fill={color} />
      <rect x="1" y="5" width="1" height="6" fill={color} />
      <rect x="14" y="5" width="1" height="6" fill={color} />
      <rect x="2" y="11" width="1" height="2" fill={color} />
      <rect x="13" y="11" width="1" height="2" fill={color} />
      <rect x="3" y="13" width="2" height="1" fill={color} />
      <rect x="11" y="13" width="2" height="1" fill={color} />
      <rect x="5" y="14" width="6" height="1" fill={color} />
      {/* Clock Hands */}
      <rect x="7" y="4" width="2" height="5" fill={color} />
      <rect x="8" y="7" width="4" height="2" fill={color} />
    </svg>
  );
}

/**
 * 16x16 Pixel Chef Hat
 */
export function PixelChefHat({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      {/* Puffy clouds */}
      <rect x="6" y="1" width="4" height="2" fill={color} />
      <rect x="3" y="2" width="4" height="3" fill={color} />
      <rect x="9" y="2" width="4" height="3" fill={color} />
      <rect x="1" y="5" width="5" height="4" fill={color} />
      <rect x="10" y="5" width="5" height="4" fill={color} />
      <rect x="4" y="4" width="8" height="5" fill={color} />
      {/* Lower pleats */}
      <rect x="3" y="9" width="10" height="2" fill={color} />
      {/* Band */}
      <rect x="3" y="12" width="10" height="3" fill={color} />
      <rect x="4" y="13" width="8" height="1" fill="#FFFDF9" opacity="0.6" />
    </svg>
  );
}

/**
 * 16x16 Pixel Checkmark
 */
export function PixelCheck({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="12" y="3" width="2" height="2" fill={color} />
      <rect x="10" y="5" width="2" height="2" fill={color} />
      <rect x="8" y="7" width="2" height="2" fill={color} />
      <rect x="6" y="9" width="2" height="2" fill={color} />
      <rect x="4" y="7" width="2" height="2" fill={color} />
      <rect x="2" y="5" width="2" height="2" fill={color} />
    </svg>
  );
}

/**
 * 16x16 Pixel Close / X
 */
export function PixelX({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="2" height="2" fill={color} />
      <rect x="12" y="2" width="2" height="2" fill={color} />
      <rect x="4" y="4" width="2" height="2" fill={color} />
      <rect x="10" y="4" width="2" height="2" fill={color} />
      <rect x="6" y="6" width="4" height="4" fill={color} />
      <rect x="4" y="10" width="2" height="2" fill={color} />
      <rect x="10" y="10" width="2" height="2" fill={color} />
      <rect x="2" y="12" width="2" height="2" fill={color} />
      <rect x="12" y="12" width="2" height="2" fill={color} />
    </svg>
  );
}

/**
 * 16x16 Pixel Search / Magnifying Glass
 */
export function PixelSearch({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      {/* Ring */}
      <rect x="4" y="1" width="5" height="1" fill={color} />
      <rect x="2" y="2" width="2" height="2" fill={color} />
      <rect x="9" y="2" width="2" height="2" fill={color} />
      <rect x="1" y="4" width="1" height="5" fill={color} />
      <rect x="11" y="4" width="1" height="5" fill={color} />
      <rect x="2" y="9" width="2" height="2" fill={color} />
      <rect x="9" y="9" width="2" height="2" fill={color} />
      <rect x="4" y="11" width="5" height="1" fill={color} />
      {/* Handle */}
      <rect x="10" y="10" width="2" height="2" fill={color} />
      <rect x="12" y="12" width="2" height="2" fill={color} />
      <rect x="14" y="14" width="2" height="2" fill={color} />
    </svg>
  );
}

/**
 * 16x16 Pixel Camera
 */
export function PixelCamera({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      {/* Top flash prism */}
      <rect x="5" y="2" width="4" height="2" fill={color} />
      <rect x="11" y="3" width="2" height="1" fill={color} />
      {/* Body */}
      <rect x="1" y="4" width="14" height="10" fill={color} />
      {/* Lens cutout */}
      <rect x="5" y="6" width="6" height="6" fill="#FFFDF9" />
      <rect x="6" y="7" width="4" height="4" fill={color} />
      {/* Glint */}
      <rect x="7" y="8" width="1" height="1" fill="#FFFDF9" />
    </svg>
  );
}

/**
 * 16x16 Pixel Warning / Alert
 */
export function PixelAlert({ size = 16, className = '', color = '#D97706' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      {/* Triangle */}
      <rect x="7" y="1" width="2" height="2" fill={color} />
      <rect x="6" y="3" width="4" height="2" fill={color} />
      <rect x="5" y="5" width="6" height="2" fill={color} />
      <rect x="4" y="7" width="8" height="2" fill={color} />
      <rect x="3" y="9" width="10" height="2" fill={color} />
      <rect x="2" y="11" width="12" height="2" fill={color} />
      <rect x="1" y="13" width="14" height="2" fill={color} />
      {/* Exclamation point inside */}
      <rect x="7" y="5" width="2" height="4" fill="#FFFDF9" />
      <rect x="7" y="11" width="2" height="2" fill="#FFFDF9" />
    </svg>
  );
}

/**
 * 16x16 Pixel Sparkles
 */
export function PixelSparkles({ size = 16, className = '', color = '#EAB308' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      {/* Big sparkle */}
      <rect x="5" y="1" width="2" height="8" fill={color} />
      <rect x="2" y="4" width="8" height="2" fill={color} />
      <rect x="4" y="3" width="4" height="4" fill="#FEF08A" />
      <rect x="5" y="4" width="2" height="2" fill="#FFFFFF" />
      {/* Mini sparkle */}
      <rect x="12" y="9" width="1" height="5" fill={color} />
      <rect x="10" y="11" width="5" height="1" fill={color} />
      <rect x="11" y="10" width="3" height="3" fill="#FEF08A" />
    </svg>
  );
}

/**
 * 16x16 Pixel Lightning / Zap
 */
export function PixelLightning({ size = 16, className = '', color = '#F59E0B' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="8" y="1" width="3" height="2" fill={color} />
      <rect x="7" y="3" width="3" height="2" fill={color} />
      <rect x="6" y="5" width="3" height="2" fill={color} />
      <rect x="4" y="7" width="8" height="2" fill={color} />
      <rect x="7" y="9" width="3" height="2" fill={color} />
      <rect x="6" y="11" width="3" height="2" fill={color} />
      <rect x="5" y="13" width="2" height="2" fill={color} />
    </svg>
  );
}

/**
 * 16x16 Pixel Trophy
 */
export function PixelTrophy({ size = 16, className = '', color = '#EAB308' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      {/* Cup bowl */}
      <rect x="3" y="1" width="10" height="2" fill={color} />
      <rect x="4" y="3" width="8" height="4" fill={color} />
      <rect x="5" y="7" width="6" height="2" fill={color} />
      <rect x="6" y="9" width="4" height="2" fill={color} />
      {/* Handles */}
      <rect x="1" y="2" width="2" height="3" fill={color} />
      <rect x="13" y="2" width="2" height="3" fill={color} />
      {/* Stem & base */}
      <rect x="7" y="11" width="2" height="2" fill={color} />
      <rect x="4" y="13" width="8" height="2" fill={color} />
      {/* Gold shine */}
      <rect x="5" y="3" width="2" height="3" fill="#FEF08A" />
    </svg>
  );
}

/**
 * 16x16 Pixel Target / Goal
 */
export function PixelTarget({ size = 16, className = '', color = '#10B981' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      {/* Outer ring */}
      <rect x="5" y="1" width="6" height="2" fill={color} />
      <rect x="1" y="5" width="2" height="6" fill={color} />
      <rect x="13" y="5" width="2" height="6" fill={color} />
      <rect x="5" y="13" width="6" height="2" fill={color} />
      <rect x="3" y="3" width="2" height="2" fill={color} />
      <rect x="11" y="3" width="2" height="2" fill={color} />
      <rect x="3" y="11" width="2" height="2" fill={color} />
      <rect x="11" y="11" width="2" height="2" fill={color} />
      {/* Bullseye */}
      <rect x="6" y="6" width="4" height="4" fill={color} />
      <rect x="7" y="7" width="2" height="2" fill="#FFFDF9" />
    </svg>
  );
}

/**
 * 16x16 Pixel Utensils (Fork & Knife)
 */
export function PixelUtensils({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      {/* Fork */}
      <rect x="3" y="1" width="1" height="5" fill={color} />
      <rect x="5" y="1" width="1" height="5" fill={color} />
      <rect x="3" y="5" width="3" height="2" fill={color} />
      <rect x="4" y="7" width="1" height="8" fill={color} />
      {/* Knife */}
      <rect x="10" y="1" width="2" height="7" fill={color} />
      <rect x="11" y="2" width="2" height="4" fill={color} />
      <rect x="11" y="8" width="1" height="7" fill={color} />
    </svg>
  );
}

/**
 * 16x16 Pixel Compass / Sanctuary Navigation
 */
export function PixelCompass({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="5" y="1" width="6" height="2" fill={color} />
      <rect x="1" y="5" width="2" height="6" fill={color} />
      <rect x="13" y="5" width="2" height="6" fill={color} />
      <rect x="5" y="13" width="6" height="2" fill={color} />
      <rect x="3" y="3" width="2" height="2" fill={color} />
      <rect x="11" y="3" width="2" height="2" fill={color} />
      <rect x="3" y="11" width="2" height="2" fill={color} />
      <rect x="11" y="11" width="2" height="2" fill={color} />
      {/* Needle pointing NE/SW */}
      <rect x="9" y="4" width="2" height="3" fill="#EF4444" />
      <rect x="7" y="7" width="2" height="2" fill={color} />
      <rect x="5" y="9" width="2" height="3" fill={color} opacity="0.6" />
    </svg>
  );
}

/**
 * 16x16 Pixel Book / Playbook
 */
export function PixelBook({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="12" height="11" fill={color} />
      <rect x="7" y="2" width="2" height="12" fill="#FAF8F5" />
      <rect x="3" y="4" width="3" height="1" fill="#FAF8F5" />
      <rect x="3" y="6" width="3" height="1" fill="#FAF8F5" />
      <rect x="3" y="8" width="3" height="1" fill="#FAF8F5" />
      <rect x="10" y="4" width="3" height="1" fill="#FAF8F5" />
      <rect x="10" y="6" width="3" height="1" fill="#FAF8F5" />
      <rect x="10" y="8" width="3" height="1" fill="#FAF8F5" />
    </svg>
  );
}

/**
 * 16x16 Pixel User Profile
 */
export function PixelUser({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      {/* Head */}
      <rect x="6" y="2" width="4" height="4" fill={color} />
      <rect x="5" y="3" width="6" height="3" fill={color} />
      {/* Shoulders / Body */}
      <rect x="6" y="7" width="4" height="2" fill={color} />
      <rect x="4" y="9" width="8" height="2" fill={color} />
      <rect x="2" y="11" width="12" height="4" fill={color} />
    </svg>
  );
}

/**
 * 16x16 Spinning Pixel Loader
 */
export function PixelSpinner({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 animate-spin ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="7" y="1" width="2" height="2" fill={color} opacity="1.0" />
      <rect x="11" y="3" width="2" height="2" fill={color} opacity="0.8" />
      <rect x="13" y="7" width="2" height="2" fill={color} opacity="0.6" />
      <rect x="11" y="11" width="2" height="2" fill={color} opacity="0.4" />
      <rect x="7" y="13" width="2" height="2" fill={color} opacity="0.2" />
      <rect x="3" y="11" width="2" height="2" fill={color} opacity="0.1" />
    </svg>
  );
}

/**
 * 16x16 Pixel Arrow Right (->)
 */
export function PixelArrowRight({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="2" y="7" width="10" height="2" fill={color} />
      <rect x="10" y="5" width="2" height="2" fill={color} />
      <rect x="12" y="7" width="2" height="2" fill={color} />
      <rect x="10" y="9" width="2" height="2" fill={color} />
    </svg>
  );
}

/**
 * 16x16 Pixel Chevron Down
 */
export function PixelChevronDown({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="3" y="6" width="2" height="2" fill={color} />
      <rect x="5" y="8" width="2" height="2" fill={color} />
      <rect x="7" y="10" width="2" height="2" fill={color} />
      <rect x="9" y="8" width="2" height="2" fill={color} />
      <rect x="11" y="6" width="2" height="2" fill={color} />
    </svg>
  );
}

/**
 * 16x16 Pixel Upload
 */
export function PixelUpload({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="7" y="1" width="2" height="2" fill={color} />
      <rect x="5" y="3" width="2" height="2" fill={color} />
      <rect x="9" y="3" width="2" height="2" fill={color} />
      <rect x="3" y="5" width="2" height="2" fill={color} />
      <rect x="11" y="5" width="2" height="2" fill={color} />
      <rect x="7" y="3" width="2" height="7" fill={color} />
      <rect x="2" y="12" width="12" height="2" fill={color} />
      <rect x="2" y="10" width="2" height="2" fill={color} />
      <rect x="12" y="10" width="2" height="2" fill={color} />
    </svg>
  );
}

/**
 * 16x16 Pixel Copy / Duplicate
 */
export function PixelCopy({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      {/* Back document */}
      <rect x="5" y="1" width="8" height="2" fill={color} />
      <rect x="12" y="3" width="2" height="8" fill={color} />
      {/* Front document */}
      <rect x="2" y="5" width="8" height="2" fill={color} />
      <rect x="2" y="7" width="2" height="8" fill={color} />
      <rect x="2" y="13" width="8" height="2" fill={color} />
      <rect x="8" y="7" width="2" height="8" fill={color} />
      {/* Text lines */}
      <rect x="4" y="8" width="4" height="1" fill={color} opacity="0.6" />
      <rect x="4" y="10" width="4" height="1" fill={color} opacity="0.6" />
    </svg>
  );
}

/**
 * 16x16 Pixel Refresh / Retry
 */
export function PixelRefresh({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="5" y="2" width="6" height="2" fill={color} />
      <rect x="11" y="4" width="2" height="4" fill={color} />
      <rect x="13" y="2" width="2" height="4" fill={color} />
      <rect x="5" y="12" width="6" height="2" fill={color} />
      <rect x="3" y="8" width="2" height="4" fill={color} />
      <rect x="1" y="10" width="2" height="4" fill={color} />
    </svg>
  );
}

/**
 * 16x16 Pixel Bot / AI Coach
 */
export function PixelBot({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="7" y="1" width="2" height="2" fill={color} />
      <rect x="7" y="3" width="2" height="1" fill={color} />
      <rect x="2" y="4" width="12" height="9" fill={color} />
      <rect x="1" y="6" width="1" height="4" fill={color} />
      <rect x="14" y="6" width="1" height="4" fill={color} />
      {/* Eyes */}
      <rect x="4" y="7" width="2" height="2" fill="#10B981" />
      <rect x="10" y="7" width="2" height="2" fill="#10B981" />
      {/* Mouth grid */}
      <rect x="5" y="11" width="6" height="1" fill="#FFFDF9" />
    </svg>
  );
}

/**
 * 16x16 Pixel Home
 */
export function PixelHome({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="7" y="2" width="2" height="2" fill={color} />
      <rect x="5" y="4" width="2" height="2" fill={color} />
      <rect x="9" y="4" width="2" height="2" fill={color} />
      <rect x="3" y="6" width="2" height="2" fill={color} />
      <rect x="11" y="6" width="2" height="2" fill={color} />
      <rect x="11" y="3" width="2" height="3" fill={color} />
      <rect x="1" y="8" width="14" height="2" fill={color} />
      <rect x="3" y="10" width="10" height="5" fill={color} />
      <rect x="7" y="11" width="2" height="4" fill="#FAF8F5" />
    </svg>
  );
}

/**
 * 16x16 Pixel Chevron Right
 */
export function PixelChevronRight({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="6" y="3" width="2" height="2" fill={color} />
      <rect x="8" y="5" width="2" height="2" fill={color} />
      <rect x="10" y="7" width="2" height="2" fill={color} />
      <rect x="8" y="9" width="2" height="2" fill={color} />
      <rect x="6" y="11" width="2" height="2" fill={color} />
    </svg>
  );
}

/**
 * 16x16 Pixel Chevron Left
 */
export function PixelChevronLeft({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="10" y="3" width="2" height="2" fill={color} />
      <rect x="8" y="5" width="2" height="2" fill={color} />
      <rect x="6" y="7" width="2" height="2" fill={color} />
      <rect x="8" y="9" width="2" height="2" fill={color} />
      <rect x="10" y="11" width="2" height="2" fill={color} />
    </svg>
  );
}

/**
 * 16x16 Pixel Menu (Hamburger)
 */
export function PixelMenu({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="2" y="3" width="12" height="2" fill={color} />
      <rect x="2" y="7" width="12" height="2" fill={color} />
      <rect x="2" y="11" width="12" height="2" fill={color} />
    </svg>
  );
}

/**
 * 16x16 Pixel Gift Box
 */
export function PixelGift({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="5" y="1" width="6" height="2" fill="#F59E0B" />
      <rect x="2" y="3" width="12" height="3" fill={color} />
      <rect x="3" y="6" width="10" height="9" fill={color} />
      <rect x="7" y="3" width="2" height="12" fill="#FDE047" />
      <rect x="3" y="9" width="10" height="2" fill="#FDE047" />
    </svg>
  );
}

/**
 * 16x16 Pixel Send / Paper Plane
 */
export function PixelSend({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="13" y="2" width="2" height="2" fill={color} />
      <rect x="9" y="4" width="4" height="2" fill={color} />
      <rect x="5" y="6" width="4" height="2" fill={color} />
      <rect x="1" y="8" width="4" height="2" fill={color} />
      <rect x="1" y="10" width="14" height="2" fill={color} />
      <rect x="4" y="12" width="4" height="2" fill={color} />
      <rect x="7" y="7" width="2" height="3" fill="#FFFDF9" />
    </svg>
  );
}

/**
 * 16x16 Pixel Key
 */
export function PixelKey({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="2" y="3" width="6" height="6" fill={color} />
      <rect x="4" y="5" width="2" height="2" fill="#FAF8F5" />
      <rect x="8" y="5" width="7" height="2" fill={color} />
      <rect x="12" y="7" width="1" height="3" fill={color} />
      <rect x="14" y="7" width="1" height="2" fill={color} />
    </svg>
  );
}

/**
 * 16x16 Pixel Plus (+)
 */
export function PixelPlus({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="2" y="7" width="12" height="2" fill={color} />
      <rect x="7" y="2" width="2" height="12" fill={color} />
    </svg>
  );
}

/**
 * 16x16 Pixel Sun
 */
export function PixelSun({ size = 16, className = '', color = '#F59E0B' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="5" y="5" width="6" height="6" fill={color} />
      <rect x="7" y="1" width="2" height="2" fill={color} />
      <rect x="7" y="13" width="2" height="2" fill={color} />
      <rect x="1" y="7" width="2" height="2" fill={color} />
      <rect x="13" y="7" width="2" height="2" fill={color} />
      <rect x="3" y="3" width="2" height="2" fill={color} />
      <rect x="11" y="3" width="2" height="2" fill={color} />
      <rect x="3" y="11" width="2" height="2" fill={color} />
      <rect x="11" y="11" width="2" height="2" fill={color} />
      <rect x="7" y="7" width="2" height="2" fill="#FEF08A" />
    </svg>
  );
}

/**
 * 16x16 Pixel Moon
 */
export function PixelMoon({ size = 16, className = '', color = '#6366F1' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="6" y="2" width="5" height="2" fill={color} />
      <rect x="10" y="4" width="2" height="2" fill={color} />
      <rect x="11" y="6" width="2" height="4" fill={color} />
      <rect x="10" y="10" width="2" height="2" fill={color} />
      <rect x="6" y="12" width="5" height="2" fill={color} />
      <rect x="4" y="4" width="3" height="8" fill={color} />
      <rect x="2" y="6" width="2" height="4" fill={color} />
    </svg>
  );
}

/**
 * 16x16 Pixel Scroll / Ancient Ledger Receipt
 */
export function PixelScroll({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="10" height="10" fill={color} />
      <rect x="2" y="1" width="11" height="2" fill={color} />
      <rect x="3" y="13" width="11" height="2" fill={color} />
      <rect x="5" y="5" width="6" height="1" fill="#FAF8F5" />
      <rect x="5" y="7" width="6" height="1" fill="#FAF8F5" />
      <rect x="5" y="9" width="4" height="1" fill="#FAF8F5" />
    </svg>
  );
}

/**
 * 16x16 Pixel Pin / Pushpin
 */
export function PixelPin({ size = 16, className = '', color = '#EF4444' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="5" y="1" width="6" height="4" fill={color} />
      <rect x="6" y="5" width="4" height="3" fill={color} />
      <rect x="4" y="8" width="8" height="2" fill={color} />
      <rect x="7" y="10" width="2" height="5" fill="#64748B" />
    </svg>
  );
}

/**
 * 16x16 Pixel Arrow Up Right (↗)
 */
export function PixelArrowUpRight({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="3" y="11" width="2" height="2" fill={color} />
      <rect x="5" y="9" width="2" height="2" fill={color} />
      <rect x="7" y="7" width="2" height="2" fill={color} />
      <rect x="9" y="5" width="2" height="2" fill={color} />
      <rect x="8" y="3" width="6" height="2" fill={color} />
      <rect x="12" y="5" width="2" height="5" fill={color} />
    </svg>
  );
}

/**
 * 16x16 Pixel Cloud
 */
export function PixelCloud({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="6" y="3" width="5" height="2" fill={color} />
      <rect x="4" y="5" width="9" height="2" fill={color} />
      <rect x="2" y="7" width="12" height="4" fill={color} />
      <rect x="3" y="11" width="10" height="2" fill={color} />
    </svg>
  );
}

/**
 * 16x16 Pixel Arrow Left (<-)
 */
export function PixelArrowLeft({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="4" y="7" width="10" height="2" fill={color} />
      <rect x="4" y="5" width="2" height="2" fill={color} />
      <rect x="2" y="7" width="2" height="2" fill={color} />
      <rect x="4" y="9" width="2" height="2" fill={color} />
    </svg>
  );
}

/**
 * 16x16 Pixel Droplet (Water)
 */
export function PixelDroplet({ size = 16, className = '', color = '#38BDF8' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="7" y="2" width="2" height="2" fill={color} />
      <rect x="6" y="4" width="4" height="2" fill={color} />
      <rect x="5" y="6" width="6" height="2" fill={color} />
      <rect x="4" y="8" width="8" height="4" fill={color} />
      <rect x="5" y="12" width="6" height="2" fill={color} />
      <rect x="7" y="14" width="2" height="1" fill={color} />
      {/* Glint */}
      <rect x="6" y="8" width="2" height="2" fill="#FFFFFF" opacity="0.8" />
    </svg>
  );
}

/**
 * 16x16 Pixel Volume (High)
 */
export function PixelVolume({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      {/* Speaker Horn */}
      <rect x="2" y="6" width="3" height="4" fill={color} />
      <rect x="5" y="5" width="2" height="6" fill={color} />
      <rect x="7" y="3" width="2" height="10" fill={color} />
      {/* Sound Waves */}
      <rect x="11" y="5" width="1" height="6" fill={color} />
      <rect x="13" y="3" width="1" height="10" fill={color} />
    </svg>
  );
}

/**
 * 16x16 Pixel Volume (Mute / Off)
 */
export function PixelVolumeMute({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="2" y="6" width="3" height="4" fill={color} />
      <rect x="5" y="5" width="2" height="6" fill={color} />
      <rect x="7" y="3" width="2" height="10" fill={color} />
      {/* X Cross */}
      <rect x="11" y="6" width="2" height="2" fill="#EF4444" />
      <rect x="14" y="6" width="2" height="2" fill="#EF4444" />
      <rect x="12" y="7" width="3" height="2" fill="#EF4444" />
      <rect x="11" y="9" width="2" height="2" fill="#EF4444" />
      <rect x="14" y="9" width="2" height="2" fill="#EF4444" />
    </svg>
  );
}

/**
 * 16x16 Pixel Battery (Full)
 */
export function PixelBatteryFull({ size = 16, className = '', color = '#10B981' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      {/* Outer Shell */}
      <rect x="1" y="4" width="12" height="8" fill="currentColor" opacity="0.3" />
      <rect x="1" y="4" width="12" height="1" fill="currentColor" />
      <rect x="1" y="11" width="12" height="1" fill="currentColor" />
      <rect x="1" y="4" width="1" height="8" fill="currentColor" />
      <rect x="12" y="4" width="1" height="8" fill="currentColor" />
      {/* Nub */}
      <rect x="13" y="6" width="2" height="4" fill="currentColor" />
      {/* Charged Bars */}
      <rect x="3" y="6" width="2" height="4" fill={color} />
      <rect x="6" y="6" width="2" height="4" fill={color} />
      <rect x="9" y="6" width="2" height="4" fill={color} />
    </svg>
  );
}

/**
 * 16x16 Pixel Battery (Medium)
 */
export function PixelBatteryMedium({ size = 16, className = '', color = '#F59E0B' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="1" y="4" width="12" height="8" fill="currentColor" opacity="0.3" />
      <rect x="1" y="4" width="12" height="1" fill="currentColor" />
      <rect x="1" y="11" width="12" height="1" fill="currentColor" />
      <rect x="1" y="4" width="1" height="8" fill="currentColor" />
      <rect x="12" y="4" width="1" height="8" fill="currentColor" />
      <rect x="13" y="6" width="2" height="4" fill="currentColor" />
      <rect x="3" y="6" width="2" height="4" fill={color} />
      <rect x="6" y="6" width="2" height="4" fill={color} />
    </svg>
  );
}

/**
 * 16x16 Pixel Battery (Low)
 */
export function PixelBatteryLow({ size = 16, className = '', color = '#EF4444' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="1" y="4" width="12" height="8" fill="currentColor" opacity="0.3" />
      <rect x="1" y="4" width="12" height="1" fill="currentColor" />
      <rect x="1" y="11" width="12" height="1" fill="currentColor" />
      <rect x="1" y="4" width="1" height="8" fill="currentColor" />
      <rect x="12" y="4" width="1" height="8" fill="currentColor" />
      <rect x="13" y="6" width="2" height="4" fill="currentColor" />
      <rect x="3" y="6" width="2" height="4" fill={color} />
    </svg>
  );
}

/**
 * 16x16 Pixel Lock
 */
export function PixelLock({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      {/* Shackle */}
      <rect x="5" y="2" width="6" height="2" fill={color} />
      <rect x="4" y="4" width="2" height="4" fill={color} />
      <rect x="10" y="4" width="2" height="4" fill={color} />
      {/* Body */}
      <rect x="3" y="7" width="10" height="8" fill={color} />
      {/* Keyhole */}
      <rect x="7" y="9" width="2" height="2" fill="#FAF8F5" />
      <rect x="7.5" y="11" width="1" height="2" fill="#FAF8F5" />
    </svg>
  );
}

/**
 * 16x16 Pixel Shield
 */
export function PixelShield({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="12" height="2" fill={color} />
      <rect x="2" y="4" width="12" height="4" fill={color} />
      <rect x="3" y="8" width="10" height="3" fill={color} />
      <rect x="4" y="11" width="8" height="2" fill={color} />
      <rect x="6" y="13" width="4" height="1" fill={color} />
      <rect x="7" y="14" width="2" height="1" fill={color} />
    </svg>
  );
}

/**
 * 16x16 Pixel Shield Check
 */
export function PixelShieldCheck({ size = 16, className = '', color = '#10B981' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="12" height="2" fill={color} />
      <rect x="2" y="4" width="12" height="4" fill={color} />
      <rect x="3" y="8" width="10" height="3" fill={color} />
      <rect x="4" y="11" width="8" height="2" fill={color} />
      <rect x="6" y="13" width="4" height="1" fill={color} />
      <rect x="7" y="14" width="2" height="1" fill={color} />
      {/* Checkmark */}
      <rect x="10" y="5" width="2" height="2" fill="#FAF8F5" />
      <rect x="8" y="7" width="2" height="2" fill="#FAF8F5" />
      <rect x="6" y="9" width="2" height="2" fill="#FAF8F5" />
      <rect x="4" y="7" width="2" height="2" fill="#FAF8F5" />
    </svg>
  );
}

/**
 * 16x16 Pixel Shield Alert
 */
export function PixelShieldAlert({ size = 16, className = '', color = '#EF4444' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="12" height="2" fill={color} />
      <rect x="2" y="4" width="12" height="4" fill={color} />
      <rect x="3" y="8" width="10" height="3" fill={color} />
      <rect x="4" y="11" width="8" height="2" fill={color} />
      <rect x="6" y="13" width="4" height="1" fill={color} />
      <rect x="7" y="14" width="2" height="1" fill={color} />
      {/* Exclamation */}
      <rect x="7" y="5" width="2" height="4" fill="#FAF8F5" />
      <rect x="7" y="10" width="2" height="2" fill="#FAF8F5" />
    </svg>
  );
}

/**
 * 16x16 Pixel Printer (Thermal Receipt)
 */
export function PixelPrinter({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      {/* Paper Top */}
      <rect x="4" y="1" width="8" height="5" fill={color} opacity="0.6" />
      {/* Body */}
      <rect x="2" y="5" width="12" height="6" fill={color} />
      <rect x="4" y="7" width="8" height="2" fill="#1A120D" />
      {/* Bottom Tray / Ejected Sheet */}
      <rect x="4" y="10" width="8" height="5" fill={color} opacity="0.8" />
      <rect x="5" y="12" width="6" height="1" fill="#1A120D" />
    </svg>
  );
}

/**
 * 16x16 Pixel Trash Can
 */
export function PixelTrash({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      {/* Lid handle */}
      <rect x="6" y="1" width="4" height="2" fill={color} />
      {/* Lid rim */}
      <rect x="2" y="3" width="12" height="2" fill={color} />
      {/* Can body */}
      <rect x="3" y="5" width="10" height="9" fill={color} />
      <rect x="4" y="14" width="8" height="1" fill={color} />
      {/* Vertical slats */}
      <rect x="5" y="6" width="1" height="7" fill="#FAF8F5" opacity="0.5" />
      <rect x="7" y="6" width="2" height="7" fill="#FAF8F5" opacity="0.5" />
      <rect x="10" y="6" width="1" height="7" fill="#FAF8F5" opacity="0.5" />
    </svg>
  );
}

/**
 * 16x16 Pixel LogOut
 */
export function PixelLogOut({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      {/* Door frame */}
      <rect x="2" y="2" width="6" height="2" fill={color} />
      <rect x="2" y="2" width="2" height="12" fill={color} />
      <rect x="2" y="12" width="6" height="2" fill={color} />
      {/* Arrow leaving */}
      <rect x="7" y="7" width="7" height="2" fill={color} />
      <rect x="11" y="5" width="2" height="2" fill={color} />
      <rect x="13" y="7" width="2" height="2" fill={color} />
      <rect x="11" y="9" width="2" height="2" fill={color} />
    </svg>
  );
}

/**
 * 16x16 Pixel Calendar
 */
export function PixelCalendar({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      {/* Top rings */}
      <rect x="4" y="1" width="2" height="3" fill={color} />
      <rect x="10" y="1" width="2" height="3" fill={color} />
      {/* Header bar */}
      <rect x="2" y="3" width="12" height="3" fill={color} />
      {/* Body */}
      <rect x="2" y="6" width="12" height="8" fill={color} opacity="0.3" />
      <rect x="2" y="6" width="1" height="8" fill={color} />
      <rect x="13" y="6" width="1" height="8" fill={color} />
      <rect x="2" y="14" width="12" height="1" fill={color} />
      {/* Date grid dots */}
      <rect x="4" y="8" width="2" height="2" fill={color} />
      <rect x="7" y="8" width="2" height="2" fill={color} />
      <rect x="10" y="8" width="2" height="2" fill={color} />
      <rect x="4" y="11" width="2" height="2" fill={color} />
      <rect x="7" y="11" width="2" height="2" fill={color} />
      <rect x="10" y="11" width="2" height="2" fill={color} />
    </svg>
  );
}

/**
 * 16x16 Pixel Mail / Envelope
 */
export function PixelMail({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="1" y="3" width="14" height="10" fill={color} />
      {/* Flap fold */}
      <rect x="2" y="4" width="12" height="1" fill="#FAF8F5" opacity="0.6" />
      <rect x="3" y="5" width="10" height="1" fill="#FAF8F5" opacity="0.6" />
      <rect x="5" y="6" width="6" height="1" fill="#FAF8F5" opacity="0.6" />
      <rect x="7" y="7" width="2" height="1" fill="#FAF8F5" opacity="0.6" />
    </svg>
  );
}

/**
 * 16x16 Pixel Scale (Balance)
 */
export function PixelScale({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      {/* Center column */}
      <rect x="7" y="1" width="2" height="13" fill={color} />
      <rect x="4" y="14" width="8" height="2" fill={color} />
      {/* Top Crossbar */}
      <rect x="2" y="3" width="12" height="2" fill={color} />
      {/* Left Pan */}
      <rect x="1" y="5" width="1" height="4" fill={color} />
      <rect x="5" y="5" width="1" height="4" fill={color} />
      <rect x="1" y="9" width="5" height="2" fill={color} />
      {/* Right Pan */}
      <rect x="10" y="5" width="1" height="4" fill={color} />
      <rect x="14" y="5" width="1" height="4" fill={color} />
      <rect x="10" y="9" width="5" height="2" fill={color} />
    </svg>
  );
}

/**
 * 16x16 Pixel Activity / EKG
 */
export function PixelActivity({ size = 16, className = '', color = '#10B981' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="1" y="8" width="4" height="2" fill={color} />
      <rect x="5" y="4" width="2" height="6" fill={color} />
      <rect x="7" y="2" width="2" height="12" fill={color} />
      <rect x="9" y="8" width="2" height="6" fill={color} />
      <rect x="11" y="6" width="2" height="4" fill={color} />
      <rect x="13" y="8" width="2" height="2" fill={color} />
    </svg>
  );
}

/**
 * 16x16 Pixel Maximize (Expand)
 */
export function PixelMaximize({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      {/* Top Left */}
      <rect x="2" y="2" width="5" height="2" fill={color} />
      <rect x="2" y="2" width="2" height="5" fill={color} />
      {/* Top Right */}
      <rect x="9" y="2" width="5" height="2" fill={color} />
      <rect x="12" y="2" width="2" height="5" fill={color} />
      {/* Bottom Left */}
      <rect x="2" y="12" width="5" height="2" fill={color} />
      <rect x="2" y="9" width="2" height="5" fill={color} />
      {/* Bottom Right */}
      <rect x="9" y="12" width="5" height="2" fill={color} />
      <rect x="12" y="9" width="2" height="5" fill={color} />
    </svg>
  );
}

/**
 * 16x16 Pixel Minimize (Contract)
 */
export function PixelMinimize({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      {/* Top Left pointing in */}
      <rect x="5" y="2" width="2" height="5" fill={color} />
      <rect x="2" y="5" width="5" height="2" fill={color} />
      {/* Top Right pointing in */}
      <rect x="9" y="2" width="2" height="5" fill={color} />
      <rect x="9" y="5" width="5" height="2" fill={color} />
      {/* Bottom Left pointing in */}
      <rect x="2" y="9" width="5" height="2" fill={color} />
      <rect x="5" y="9" width="2" height="5" fill={color} />
      {/* Bottom Right pointing in */}
      <rect x="9" y="9" width="5" height="2" fill={color} />
      <rect x="9" y="9" width="2" height="5" fill={color} />
    </svg>
  );
}

/**
 * 16x16 Pixel Share
 */
export function PixelShare({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      {/* Nodes */}
      <rect x="11" y="2" width="3" height="3" fill={color} />
      <rect x="2" y="7" width="3" height="3" fill={color} />
      <rect x="11" y="11" width="3" height="3" fill={color} />
      {/* Connecting lines */}
      <rect x="5" y="6" width="3" height="2" fill={color} opacity="0.7" />
      <rect x="8" y="4" width="3" height="2" fill={color} opacity="0.7" />
      <rect x="5" y="9" width="3" height="2" fill={color} opacity="0.7" />
      <rect x="8" y="11" width="3" height="2" fill={color} opacity="0.7" />
    </svg>
  );
}

/**
 * 16x16 Pixel Download
 */
export function PixelDownload({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="7" y="1" width="2" height="7" fill={color} />
      <rect x="5" y="6" width="2" height="2" fill={color} />
      <rect x="9" y="6" width="2" height="2" fill={color} />
      <rect x="7" y="8" width="2" height="2" fill={color} />
      {/* Tray */}
      <rect x="2" y="11" width="2" height="3" fill={color} />
      <rect x="12" y="11" width="2" height="3" fill={color} />
      <rect x="2" y="13" width="12" height="2" fill={color} />
    </svg>
  );
}

/**
 * 16x16 Pixel File / Document Text
 */
export function PixelFileText({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="3" y="1" width="7" height="2" fill={color} />
      <rect x="3" y="3" width="10" height="12" fill={color} />
      <rect x="10" y="1" width="3" height="3" fill="#FFFDF9" opacity="0.4" />
      {/* Horizontal Text Lines */}
      <rect x="5" y="6" width="6" height="1" fill="#FAF8F5" />
      <rect x="5" y="8" width="6" height="1" fill="#FAF8F5" />
      <rect x="5" y="10" width="4" height="1" fill="#FAF8F5" />
    </svg>
  );
}

/**
 * 16x16 Pixel External Link
 */
export function PixelExternalLink({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <rect x="2" y="5" width="2" height="9" fill={color} />
      <rect x="2" y="12" width="9" height="2" fill={color} />
      <rect x="9" y="8" width="2" height="6" fill={color} />
      <rect x="2" y="5" width="5" height="2" fill={color} />
      {/* Arrow up-right */}
      <rect x="8" y="2" width="6" height="2" fill={color} />
      <rect x="12" y="2" width="2" height="6" fill={color} />
      <rect x="7" y="7" width="2" height="2" fill={color} />
      <rect x="9" y="5" width="2" height="2" fill={color} />
      <rect x="5" y="9" width="2" height="2" fill={color} />
    </svg>
  );
}

/**
 * 16x16 Handcrafted Pixel Anchor (Iron Suite / Foundation)
 */
export function PixelAnchor({ size = 16, className = '', color = '#EA580C' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      {/* Top ring */}
      <rect x="7" y="1" width="2" height="1" fill={color} />
      <rect x="6" y="2" width="1" height="2" fill={color} />
      <rect x="9" y="2" width="1" height="2" fill={color} />
      <rect x="7" y="3" width="2" height="1" fill={color} />
      {/* Stock crossbar */}
      <rect x="4" y="5" width="8" height="1" fill={color} />
      <rect x="3" y="5" width="1" height="2" fill={color} />
      <rect x="12" y="5" width="1" height="2" fill={color} />
      {/* Vertical shank */}
      <rect x="7" y="4" width="2" height="9" fill={color} />
      {/* Curved arms & flukes */}
      <rect x="3" y="8" width="1" height="3" fill={color} />
      <rect x="2" y="9" width="1" height="1" fill={color} />
      <rect x="4" y="11" width="1" height="2" fill={color} />
      <rect x="5" y="12" width="2" height="2" fill={color} />
      <rect x="7" y="13" width="2" height="2" fill={color} />
      <rect x="9" y="12" width="2" height="2" fill={color} />
      <rect x="11" y="11" width="1" height="2" fill={color} />
      <rect x="12" y="8" width="1" height="3" fill={color} />
      <rect x="13" y="9" width="1" height="1" fill={color} />
    </svg>
  );
}

/**
 * 16x16 Handcrafted Pixel Egg / Breakfast Protein Skillet
 */
export function PixelEgg({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      {/* Pan / plate rim */}
      <rect x="4" y="2" width="8" height="1" fill={color} opacity="0.3" />
      <rect x="2" y="3" width="12" height="1" fill={color} opacity="0.4" />
      <rect x="1" y="4" width="14" height="8" fill={color} opacity="0.2" />
      <rect x="2" y="12" width="12" height="1" fill={color} opacity="0.4" />
      <rect x="4" y="13" width="8" height="1" fill={color} opacity="0.3" />
      {/* Egg white */}
      <rect x="4" y="4" width="8" height="1" fill="#FFFDF9" />
      <rect x="3" y="5" width="10" height="6" fill="#FFFDF9" />
      <rect x="4" y="11" width="8" height="1" fill="#FFFDF9" />
      {/* Golden yolk */}
      <rect x="6" y="6" width="4" height="4" fill="#F59E0B" />
      <rect x="7" y="5" width="2" height="1" fill="#F59E0B" />
      <rect x="7" y="10" width="2" height="1" fill="#F59E0B" />
      <rect x="5" y="7" width="1" height="2" fill="#F59E0B" />
      <rect x="10" y="7" width="1" height="2" fill="#F59E0B" />
      {/* Glint */}
      <rect x="7" y="6" width="1" height="1" fill="#FEF08A" />
    </svg>
  );
}

/**
 * 16x16 Handcrafted Pixel Steak / Meat Protein Anchor
 */
export function PixelSteak({ size = 16, className = '', color = '#DC2626' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      {/* Seared steak outer crust */}
      <rect x="4" y="2" width="7" height="1" fill="#78350F" />
      <rect x="2" y="3" width="11" height="1" fill="#78350F" />
      <rect x="1" y="4" width="13" height="7" fill="#78350F" />
      <rect x="2" y="11" width="12" height="1" fill="#78350F" />
      <rect x="3" y="12" width="9" height="1" fill="#78350F" />
      <rect x="5" y="13" width="5" height="1" fill="#78350F" />
      {/* Tender center */}
      <rect x="4" y="4" width="8" height="1" fill={color} />
      <rect x="3" y="5" width="10" height="5" fill={color} />
      <rect x="4" y="10" width="8" height="1" fill={color} />
      {/* Marbling / bone highlight */}
      <rect x="5" y="5" width="2" height="2" fill="#FEF3C7" />
      <rect x="6" y="7" width="1" height="3" fill="#FEF3C7" />
      <rect x="8" y="6" width="3" height="1" fill="#FEF3C7" />
      <rect x="9" y="8" width="2" height="1" fill="#FEF3C7" />
    </svg>
  );
}

/**
 * 16x16 Handcrafted Pixel Fish / Dinner Protein
 */
export function PixelFish({ size = 16, className = '', color = '#0284C7' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      {/* Dorsal fin */}
      <rect x="6" y="3" width="3" height="2" fill={color} opacity="0.8" />
      {/* Main Fish Body */}
      <rect x="1" y="7" width="1" height="2" fill={color} />
      <rect x="2" y="6" width="2" height="4" fill={color} />
      <rect x="4" y="5" width="6" height="6" fill={color} />
      <rect x="10" y="6" width="2" height="4" fill={color} />
      {/* Tail fin */}
      <rect x="12" y="5" width="1" height="6" fill={color} />
      <rect x="13" y="4" width="1" height="8" fill={color} />
      <rect x="14" y="3" width="1" height="2" fill={color} />
      <rect x="14" y="11" width="1" height="2" fill={color} />
      {/* Eye */}
      <rect x="3" y="7" width="1" height="1" fill="#FFFDF9" />
      {/* Gill / fin streak */}
      <rect x="6" y="7" width="1" height="2" fill="#38BDF8" />
      <rect x="8" y="8" width="1" height="2" fill="#38BDF8" />
    </svg>
  );
}

/**
 * 16x16 Handcrafted Pixel Stopwatch / Caffeine Air-Lock
 */
export function PixelStopwatch({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      {/* Top crown button */}
      <rect x="7" y="1" width="2" height="1" fill={color} />
      <rect x="6" y="2" width="4" height="1" fill={color} />
      {/* Angled top right lap button */}
      <rect x="12" y="2" width="2" height="2" fill={color} />
      {/* Circular casing */}
      <rect x="5" y="3" width="6" height="1" fill={color} />
      <rect x="3" y="4" width="10" height="1" fill={color} />
      <rect x="2" y="5" width="12" height="6" fill={color} />
      <rect x="3" y="11" width="10" height="1" fill={color} />
      <rect x="5" y="12" width="6" height="1" fill={color} />
      {/* Inner face */}
      <rect x="4" y="5" width="8" height="6" fill="#FFFDF9" />
      {/* Dial hand */}
      <rect x="7" y="5" width="2" height="4" fill="#D97706" />
      <rect x="8" y="7" width="3" height="2" fill="#D97706" />
    </svg>
  );
}

/**
 * 16x16 Handcrafted Pixel Hourglass (Pending / Not Yet / Fasting)
 */
export function PixelHourglass({ size = 16, className = '', color = '#D97706' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      {/* Wooden top and bottom plates */}
      <rect x="3" y="1" width="10" height="2" fill={color} />
      <rect x="3" y="13" width="10" height="2" fill={color} />
      {/* Glass frame */}
      <rect x="4" y="3" width="8" height="1" fill={color} opacity="0.4" />
      <rect x="5" y="4" width="6" height="2" fill={color} opacity="0.4" />
      <rect x="6" y="6" width="4" height="1" fill={color} opacity="0.5" />
      <rect x="7" y="7" width="2" height="2" fill={color} />
      <rect x="6" y="9" width="4" height="1" fill={color} opacity="0.5" />
      <rect x="5" y="10" width="6" height="2" fill={color} opacity="0.4" />
      <rect x="4" y="12" width="8" height="1" fill={color} opacity="0.4" />
      {/* Sand particles */}
      <rect x="6" y="4" width="4" height="2" fill="#F59E0B" />
      <rect x="7" y="6" width="2" height="4" fill="#FDE047" />
      <rect x="6" y="11" width="4" height="1" fill="#F59E0B" />
      <rect x="5" y="12" width="6" height="1" fill="#F59E0B" />
    </svg>
  );
}

/**
 * 16x16 Handcrafted Pixel Gear (Settings / Cadence Calibration)
 */
export function PixelGear({ size = 16, className = '', color = 'currentColor' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      {/* North / South teeth */}
      <rect x="7" y="1" width="2" height="2" fill={color} />
      <rect x="7" y="13" width="2" height="2" fill={color} />
      {/* West / East teeth */}
      <rect x="1" y="7" width="2" height="2" fill={color} />
      <rect x="13" y="7" width="2" height="2" fill={color} />
      {/* Corner diagonal teeth */}
      <rect x="3" y="3" width="2" height="2" fill={color} />
      <rect x="11" y="3" width="2" height="2" fill={color} />
      <rect x="3" y="11" width="2" height="2" fill={color} />
      <rect x="11" y="11" width="2" height="2" fill={color} />
      {/* Outer ring */}
      <rect x="5" y="3" width="6" height="10" fill={color} />
      <rect x="3" y="5" width="10" height="6" fill={color} />
      {/* Center axle hole */}
      <rect x="6" y="6" width="4" height="4" fill="#FFFDF9" />
    </svg>
  );
}



