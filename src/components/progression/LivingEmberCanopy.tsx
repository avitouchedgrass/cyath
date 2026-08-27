'use client';

import React, { useEffect, useRef } from 'react';
import { progressionEvents } from '@/lib/progression/events';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
  color: string;
  swaySpeed: number;
  swayOffset: number;
  type: 'ember' | 'spore';
}

interface LivingEmberCanopyProps {
  className?: string;
  intensity?: 'ambient' | 'high';
}

const EMBER_COLORS = ['#FBBF24', '#F59E0B', '#D97706', '#EF4444', '#FEF3C7'];
const SPORE_COLORS = ['#6EE7B7', '#A7F3D0', '#34D399', '#10B981'];

export function LivingEmberCanopy({ className = '', intensity = 'ambient' }: LivingEmberCanopyProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let isVisible = true;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const particles: Particle[] = [];
    const maxParticles = intensity === 'high' ? 85 : 48;

    const pointer = {
      x: -1000,
      y: -1000,
      radius: 130,
      active: false,
    };

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const spawnParticle = (overrideX?: number, overrideY?: number, isBurst = false): Particle => {
      const isSpore = Math.random() > 0.65 && !isBurst;
      const palette = isSpore ? SPORE_COLORS : EMBER_COLORS;
      const color = palette[Math.floor(Math.random() * palette.length)];

      const x = overrideX !== undefined ? overrideX : Math.random() * width;
      const y = overrideY !== undefined ? overrideY : height + Math.random() * 20;

      const speedFactor = isBurst ? 2.5 : 1;

      return {
        x,
        y,
        vx: (Math.random() - 0.5) * (isBurst ? 3 : 0.8),
        vy: isBurst ? -(Math.random() * 3 + 2) : -(Math.random() * 1.2 + 0.6) * speedFactor,
        size: isSpore ? Math.random() * 2.2 + 1.2 : Math.random() * 3.2 + 1.5,
        alpha: Math.random() * 0.7 + 0.3,
        maxLife: Math.random() * 140 + (isBurst ? 80 : 160),
        life: 0,
        color,
        swaySpeed: Math.random() * 0.03 + 0.015,
        swayOffset: Math.random() * Math.PI * 2,
        type: isSpore ? 'spore' : 'ember',
      };
    };

    // Seed initial particles
    for (let i = 0; i < maxParticles; i++) {
      const p = spawnParticle(Math.random() * width, Math.random() * height);
      p.life = Math.random() * p.maxLife;
      particles.push(p);
    }

    // Pointer events for physics scatter
    const onPointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    canvas.parentElement?.addEventListener('mousemove', onPointerMove);
    canvas.parentElement?.addEventListener('mouseleave', onPointerLeave);

    // Progression event flare trigger
    const unsubXp = progressionEvents.on('xp:gained', () => {
      const burstCount = 18;
      for (let i = 0; i < burstCount; i++) {
        particles.push(spawnParticle(width / 2 + (Math.random() - 0.5) * 120, height * 0.8, true));
      }
    });

    // Intersection observer to pause offscreen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    // Tab visibility listener
    const onVisibilityChange = () => {
      isVisible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    let lastTime = performance.now();

    const loop = (time: number) => {
      animId = requestAnimationFrame(loop);

      if (!isVisible || prefersReducedMotion) {
        lastTime = time;
        return;
      }

      const dt = Math.min((time - lastTime) / 16.67, 2);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Update and render particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += dt;

        if (p.life >= p.maxLife || p.y < -20 || p.x < -20 || p.x > width + 20) {
          particles.splice(i, 1);
          if (particles.length < maxParticles) {
            particles.push(spawnParticle());
          }
          continue;
        }

        // Horizontal sway
        p.x += (Math.sin(time * p.swaySpeed + p.swayOffset) * 0.7 + p.vx) * dt;
        p.y += p.vy * dt;

        // Pointer proximity scatter
        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < pointer.radius && dist > 0) {
            const force = (1 - dist / pointer.radius) * 2.8;
            p.x += (dx / dist) * force * dt;
            p.y += (dy / dist) * force * dt;
          }
        }

        // Opacity fade in and fade out
        const lifeRatio = p.life / p.maxLife;
        const currentAlpha = lifeRatio < 0.2
          ? (lifeRatio / 0.2) * p.alpha
          : (1 - lifeRatio) * p.alpha;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, currentAlpha));
        ctx.fillStyle = p.color;

        // Pixel-crisp rounded rectangle rendering for retro aesthetics
        if (p.type === 'ember') {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
        }

        ctx.fillRect(Math.round(p.x), Math.round(p.y), Math.round(p.size), Math.round(p.size));
        ctx.restore();
      }
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      canvas.parentElement?.removeEventListener('mousemove', onPointerMove);
      canvas.parentElement?.removeEventListener('mouseleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      observer.disconnect();
      unsubXp();
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 w-full h-full z-0 ${className}`}
    />
  );
}
