import React from 'react';
import Image from 'next/image';

export function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <Image
        src="/assets/cyath-logo-trans-white.svg"
        alt="Cyath Logo"
        width={44}
        height={44}
        className="w-full h-full object-contain pixel-art drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]"
        priority
      />
    </div>
  );
}
