'use client';

import React, { useRef, useEffect } from 'react';

interface PixelSteamProps {
  active?: boolean;
  className?: string;
  intensity?: number;
}

interface SteamParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  maxLife: number;
  life: number;
  seed: number;
}

export function PixelSteam({ active = true, className = "", intensity = 1.0 }: PixelSteamProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);
  const particlesRef = useRef<SteamParticle[]>([]);
  const lastSpawnRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Observe visibility in viewport to completely freeze execution when offscreen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (!entry.isIntersecting && animRef.current) {
          cancelAnimationFrame(animRef.current);
          animRef.current = null;
        } else if (entry.isIntersecting && active && !animRef.current) {
          animRef.current = requestAnimationFrame(render);
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(canvas);

    if (!active) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      observer.disconnect();
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      observer.disconnect();
      return;
    }

    let lastTime = performance.now();

    const spawnParticle = (w: number, h: number) => {
      // Spawn near the food plate center/top surface
      const centerX = w * 0.5 + (Math.random() - 0.5) * (w * 0.35);
      const startY = h * 0.62 + (Math.random() - 0.5) * (h * 0.15);

      particlesRef.current.push({
        x: centerX,
        y: startY,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.8 - Math.random() * 0.7,
        size: Math.random() > 0.6 ? 6 : 4, // 16-bit chunky pixel blocks
        opacity: 0.45 + Math.random() * 0.25,
        maxLife: 70 + Math.random() * 40,
        life: 0,
        seed: Math.random() * 100,
      });
    };

    const render = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = rect.width;
      const height = rect.height;

      if (width <= 0 || height <= 0) {
        animRef.current = requestAnimationFrame(render);
        return;
      }

      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, width, height);

      // Spawn rate modulated by intensity
      if (now - lastSpawnRef.current > (160 / intensity) && particlesRef.current.length < 24) {
        spawnParticle(width, height);
        lastSpawnRef.current = now;
      }

      // Update and draw particles
      ctx.fillStyle = '#FFFDF9';
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life += 1;
        p.x += p.vx + Math.sin(p.life * 0.08 + p.seed) * 0.35;
        p.y += p.vy;

        const progress = p.life / p.maxLife;
        // Fade in rapidly, then gently dissipate
        let alpha = p.opacity;
        if (progress < 0.2) {
          alpha = (progress / 0.2) * p.opacity;
        } else if (progress > 0.6) {
          alpha = ((1 - progress) / 0.4) * p.opacity;
        }

        if (progress >= 1.0 || p.y < height * 0.1) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        // Render pixelated steam block with crisp retro outline
        const px = Math.floor(p.x / 2) * 2;
        const py = Math.floor(p.y / 2) * 2;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        // Outer dark pixel boundary for 16-bit contrast
        ctx.fillStyle = 'rgba(26, 54, 41, 0.25)';
        ctx.fillRect(px - 1, py - 1, p.size + 2, p.size + 2);
        // Inner white pixel smoke core
        ctx.fillStyle = 'rgba(255, 253, 249, 0.85)';
        ctx.fillRect(px, py, p.size, p.size);
        ctx.restore();
      }

      ctx.restore();
      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      observer.disconnect();
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [active, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 z-20 w-full h-full [image-rendering:pixelated] ${className}`}
    />
  );
}
