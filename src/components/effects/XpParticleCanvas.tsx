'use client';

import React, { useEffect, useRef } from 'react';
import { xpParticleEmitter } from '@/lib/particleEmitter';
import { retroAudio } from '@/lib/retroAudio';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  age: number;
  maxAge: number;
  isStar: boolean;
  burstDuration: number;
}

const PARTICLE_COLORS = [
  '#F59E0B', // Golden Amber
  '#FDE047', // Radiant Gold Spark
  '#10B981', // Emerald Health
  '#34D399', // Bright Mint
  '#FFFDF9', // Pure Parchment Light
];

export function XpParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle canvas resize to cover the viewport
    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const getTargetPosition = () => {
      const targetElem =
        document.getElementById('xp-hud-badge-target') ||
        document.getElementById('xp-hud-target');

      if (targetElem) {
        const rect = targetElem.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      }

      // Default fallback: top right header area
      return { x: window.innerWidth - 80, y: 40 };
    };

    const triggerBadgeImpact = () => {
      const targetElem =
        document.getElementById('xp-hud-badge-target') ||
        document.getElementById('xp-hud-target');

      if (targetElem) {
        targetElem.classList.remove('animate-count-pop');
        // Force reflow
        void targetElem.offsetWidth;
        targetElem.classList.add('animate-count-pop');
      }
      retroAudio.playXpAbsorb();
    };

    const render = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const target = getTargetPosition();
      let hasImpacted = false;

      const remainingParticles: Particle[] = [];

      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];
        p.age++;

        // Burst phase: subtle dispersion
        if (p.age < p.burstDuration) {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15; // gentle gravity
          p.vx *= 0.92; // air resistance
          p.vy *= 0.92;
        } else {
          // Flight phase: smooth homing pull toward target badge
          const dx = target.x - p.x;
          const dy = target.y - p.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 20) {
            // Particle arrived at target
            if (!hasImpacted) {
              triggerBadgeImpact();
              hasImpacted = true;
            }
            continue; // Absorb particle
          }

          // Smooth curved acceleration
          const speed = Math.min(18, Math.max(6, dist * 0.08));
          const angle = Math.atan2(dy, dx);

          p.vx = p.vx * 0.8 + Math.cos(angle) * speed * 0.2;
          p.vy = p.vy * 0.8 + Math.sin(angle) * speed * 0.2;

          p.x += p.vx;
          p.y += p.vy;
        }

        // Draw refined micro particle
        ctx.fillStyle = p.color;
        const half = Math.floor(p.size / 2);

        if (p.isStar) {
          // Delicate cross spark (+)
          ctx.fillRect(Math.floor(p.x) - half, Math.floor(p.y), p.size, 1);
          ctx.fillRect(Math.floor(p.x), Math.floor(p.y) - half, 1, p.size);
        } else {
          // Crisp micro pixel
          ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
        }

        // Keep particle if not expired
        if (p.age < p.maxAge) {
          remainingParticles.push(p);
        }
      }

      particlesRef.current = remainingParticles;

      // Continue animation loop only if particles exist
      if (particlesRef.current.length > 0) {
        animationFrameRef.current = requestAnimationFrame(render);
      } else {
        animationFrameRef.current = null;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    const handleEmission = ({ x, y, amount = 4 }: { x: number; y: number; amount?: number }) => {
      // Check reduced motion preference
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        triggerBadgeImpact();
        return;
      }

      // Keep particles minimal and subtle (4-5 micro particles max)
      const count = Math.min(5, Math.max(3, Math.floor((amount || 4) * 0.4)));
      const newParticles: Particle[] = [];

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
        const speed = 2.5 + Math.random() * 3.5;
        const size = Math.random() > 0.5 ? 2 : 3;
        const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];

        newParticles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          size,
          color,
          age: 0,
          maxAge: 70, // ~1s max flight window
          burstDuration: 8 + Math.floor(Math.random() * 6), // ~180ms subtle explosion
          isStar: Math.random() > 0.4,
        });
      }

      particlesRef.current.push(...newParticles);

      // Start loop if not already running
      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(render);
      }
    };

    const unsubscribe = xpParticleEmitter.subscribe(handleEmission);

    return () => {
      unsubscribe();
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999] pixel-art"
      aria-hidden="true"
    />
  );
}
