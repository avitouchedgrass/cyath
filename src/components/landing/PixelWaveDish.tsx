'use client';

import React, { useRef, useEffect, useState } from 'react';

interface PixelWaveDishProps {
  currentIndex: number;
  prevIndex?: number | null;
  isScanning: boolean;
  scanDirection: 'horizontal' | 'vertical';
  scanProgress: number;
  dishImages: string[];
  className?: string;
}

export function PixelWaveDish({
  currentIndex,
  prevIndex,
  isScanning,
  scanDirection,
  scanProgress,
  dishImages,
  className = ""
}: PixelWaveDishProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<{ [key: string]: HTMLImageElement }>({});
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const animRef = useRef<number | null>(null);
  const waveTimeRef = useRef<number>(0);

  // Preload all dish images
  useEffect(() => {
    let loadedCount = 0;
    dishImages.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        imagesRef.current[src] = img;
        loadedCount++;
        if (loadedCount === dishImages.length) {
          setImagesLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === dishImages.length) {
          setImagesLoaded(true);
        }
      };
    });
  }, [dishImages]);

  // High-performance 60fps canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      waveTimeRef.current += delta;

      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = rect.width;
      const height = rect.height;

      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = false; // Preserves sharp pixel art
      ctx.clearRect(0, 0, width, height);

      const currentSrc = dishImages[currentIndex];
      const currentImg = imagesRef.current[currentSrc];
      const prevSrc = prevIndex !== null && prevIndex !== undefined ? dishImages[prevIndex] : null;
      const prevImg = prevSrc ? imagesRef.current[prevSrc] : null;

      // Draw stationary plate with inner subtle food shimmer
      const drawDish = (img: HTMLImageElement | undefined) => {
        if (!img) return;

        // Draw outer ceramic plate & food directly onto canvas
        ctx.drawImage(img, 0, 0, width, height);
      };

      if (isScanning && prevImg && currentImg) {
        // 1. Draw previous dish as base
        drawDish(prevImg);

        // 2. Clip and draw current dish based on scan direction
        ctx.save();
        ctx.beginPath();
        if (scanDirection === 'horizontal') {
          // Left to right invisible wipe
          const clipWidth = width * Math.max(0, Math.min(1, scanProgress));
          ctx.rect(0, 0, clipWidth, height);
        } else {
          // Top to bottom invisible wipe
          const clipHeight = height * Math.max(0, Math.min(1, scanProgress));
          ctx.rect(0, 0, width, clipHeight);
        }
        ctx.clip();

        // Draw new incoming dish in clipped region
        drawDish(currentImg);
        ctx.restore();
      } else if (currentImg) {
        // Idle state: Draw active dish
        drawDish(currentImg);
      }

      ctx.restore();
      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [currentIndex, prevIndex, isScanning, scanDirection, scanProgress, dishImages, imagesLoaded]);

  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
      {/* SVG Micro-Wave Filter (Ripples inner food pixels organically without moving the plate) */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="pixel-wave-subtle" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.04 0.04" 
              numOctaves="1" 
              result="noise"
            >
              <animate 
                attributeName="baseFrequency" 
                dur="12s" 
                values="0.035 0.035;0.045 0.045;0.035 0.035" 
                repeatCount="indefinite" 
              />
            </feTurbulence>
            <feDisplacementMap 
              in="SourceGraphic" 
              in2="noise" 
              scale="3.5" 
              xChannelSelector="R" 
              yChannelSelector="G" 
            />
          </filter>
        </defs>
      </svg>

      {/* Crisp 60fps Hardware-Accelerated 2D Canvas with Pixel-Wave Filter */}
      <canvas
        ref={canvasRef}
        className="w-full h-full pixel-art select-none"
        style={{
          filter: 'url(#pixel-wave-subtle)',
          imageRendering: 'pixelated'
        }}
      />
    </div>
  );
}
