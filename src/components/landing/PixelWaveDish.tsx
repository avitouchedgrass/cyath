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
        if (src.includes('.webp')) {
          const fallbackPng = src.replace('.webp', '.png');
          const pngImg = new Image();
          pngImg.src = fallbackPng;
          pngImg.onload = () => {
            imagesRef.current[src] = pngImg;
            loadedCount++;
            if (loadedCount === dishImages.length) setImagesLoaded(true);
          };
          pngImg.onerror = () => {
            loadedCount++;
            if (loadedCount === dishImages.length) setImagesLoaded(true);
          };
          return;
        }
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

      // Draw stationary plate scaled to 84% and shifted upward so it never intersects with bottom inspect badge
      const drawDish = (img: HTMLImageElement | undefined) => {
        if (!img) return;
        const scale = 0.84;
        const dw = width * scale;
        const dh = height * scale;
        const dx = (width - dw) / 2;
        const dy = (height - dh) / 2 - 22;
        ctx.drawImage(img, dx, dy, dw, dh);
      };

      if (isScanning && prevImg && currentImg) {
        const p = Math.max(0, Math.min(1, scanProgress));

        if (scanDirection === 'horizontal') {
          const splitX = width * p;

          // 1. Draw Incoming Current Dish in Scanned Region [0 ... splitX]
          if (splitX > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, splitX, height);
            ctx.clip();
            drawDish(currentImg);
            ctx.restore();
          }

          // 2. Draw Outgoing Previous Dish in Unscanned Region [splitX ... width]
          if (splitX < width) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(splitX, 0, width - splitX, height);
            ctx.clip();
            drawDish(prevImg);
            ctx.restore();
          }

          // 3. Draw Laser Edge Scan Line along wipe boundary
          if (splitX > 2 && splitX < width - 2) {
            ctx.save();
            ctx.fillStyle = '#1A3629';
            ctx.fillRect(splitX - 1.5, 0, 3, height);
            ctx.restore();
          }
        } else {
          const splitY = height * p;

          // 1. Draw Incoming Current Dish in Scanned Region [0 ... splitY]
          if (splitY > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, width, splitY);
            ctx.clip();
            drawDish(currentImg);
            ctx.restore();
          }

          // 2. Draw Outgoing Previous Dish in Unscanned Region [splitY ... height]
          if (splitY < height) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, splitY, width, height - splitY);
            ctx.clip();
            drawDish(prevImg);
            ctx.restore();
          }

          // 3. Draw Laser Edge Scan Line along wipe boundary
          if (splitY > 2 && splitY < height - 2) {
            ctx.save();
            ctx.fillStyle = '#1A3629';
            ctx.fillRect(0, splitY - 1.5, width, 3);
            ctx.restore();
          }
        }

        ctx.restore();
        // Continue animation loop while scanning transition is active
        animRef.current = requestAnimationFrame(render);
      } else if (currentImg) {
        // Idle state: Draw active dish once without continuous RAF loops
        drawDish(currentImg);
        ctx.restore();
        animRef.current = null;
      } else {
        ctx.restore();
        animRef.current = null;
      }
    };

    render(performance.now());

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
