import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PixelContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  aspectRatio?: 'square' | 'video' | 'portrait';
  withBorder?: boolean;
  withGlow?: boolean;
}

export function PixelContainer({
  src,
  alt,
  width = 160,
  height = 160,
  priority = false,
  aspectRatio = 'square',
  withBorder = false,
  withGlow = false,
  className,
  ...props
}: PixelContainerProps) {
  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'video'
      ? 'aspect-video'
      : 'aspect-[3/4]';

  return (
    <div
      className={cn(
        'relative flex items-center justify-center select-none overflow-hidden',
        aspectClass,
        withBorder && 'rounded-2xl border border-white/10 bg-white/[0.02]',
        className
      )}
      {...props}
    >
      {/* Optional atmospheric glow behind pixel asset */}
      {withGlow && (
        <div
          className="absolute inset-2 rounded-full pointer-events-none opacity-40 blur-xl transition-opacity duration-300 group-hover:opacity-75"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2) 0%, transparent 70%)',
          }}
        />
      )}

      {/* Crisp 16-bit Pixel Graphic */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className="w-full h-full object-contain pixel-art drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105"
        style={{
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
}
