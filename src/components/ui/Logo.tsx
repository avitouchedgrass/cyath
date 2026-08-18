import React from 'react';

export function Logo({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center text-white ${className}`}>
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full pixel-art"
      >
        {/* Outer Circular C Arc */}
        <path 
          d="M 50 12 
             C 29 12 12 29 12 50 
             C 12 71 29 88 50 88 
             C 65 88 77 80 84 68 
             L 78 64 
             C 72 74 62 81 50 81 
             C 33 81 19 67 19 50 
             C 19 33 33 19 50 19 
             C 62 19 72 26 78 36 
             L 84 32 
             C 77 20 65 12 50 12 Z" 
          fill="currentColor" 
        />
        {/* Digital Matrix Pixel Blocks (Top-Right Dissolve) */}
        <rect x="52" y="14" width="4" height="4" fill="currentColor" />
        <rect x="58" y="14" width="4" height="4" fill="currentColor" />
        <rect x="64" y="14" width="4" height="4" fill="currentColor" />
        <rect x="70" y="14" width="4" height="4" fill="currentColor" />
        <rect x="58" y="20" width="4" height="4" fill="currentColor" />
        <rect x="64" y="20" width="4" height="4" fill="currentColor" />
        <rect x="70" y="20" width="4" height="4" fill="currentColor" />
        <rect x="76" y="20" width="4" height="4" fill="currentColor" />
        <rect x="64" y="26" width="4" height="4" fill="currentColor" />
        <rect x="70" y="26" width="4" height="4" fill="currentColor" />
        <rect x="76" y="26" width="4" height="4" fill="currentColor" />
        <rect x="82" y="26" width="4" height="4" fill="currentColor" />
        <rect x="74" y="32" width="4" height="4" fill="currentColor" />
        <rect x="80" y="32" width="4" height="4" fill="currentColor" />
        <rect x="78" y="38" width="4" height="4" fill="currentColor" />

        {/* Stepped Pixel Wave Crests (Bottom-Right Inward) */}
        <path 
          d="M 40 78 
             C 50 78 60 72 68 62 
             C 74 54 80 52 84 52 
             L 84 55 
             C 79 55 73 58 66 66 
             C 58 76 48 81 38 81 Z" 
          fill="currentColor" 
        />
        <path 
          d="M 44 72 
             C 52 72 60 66 66 56 
             C 71 48 76 46 80 48 
             L 80 51 
             C 75 49 69 52 64 60 
             C 57 70 49 75 42 75 Z" 
          fill="currentColor" 
        />
        {/* Wave Curl Spiral */}
        <path 
          d="M 60 54 
             C 60 48 64 44 68 44 
             C 71 44 73 46 73 49 
             C 73 45 70 42 66 42 
             C 60 42 56 47 56 54 
             C 56 62 50 67 42 69 
             L 42 72 
             C 52 70 59 63 60 54 Z" 
          fill="currentColor" 
        />
        <rect x="42" y="67" width="3" height="3" fill="currentColor" />
        <rect x="47" y="64" width="3" height="3" fill="currentColor" />
        <rect x="52" y="59" width="3" height="3" fill="currentColor" />
        <rect x="57" y="53" width="3" height="3" fill="currentColor" />
        <rect x="62" y="47" width="3" height="3" fill="currentColor" />
        <rect x="67" y="43" width="3" height="3" fill="currentColor" />
        <rect x="73" y="51" width="3" height="3" fill="currentColor" />
        <rect x="77" y="57" width="3" height="3" fill="currentColor" />
        <rect x="81" y="63" width="3" height="3" fill="currentColor" />
      </svg>
    </div>
  );
}
