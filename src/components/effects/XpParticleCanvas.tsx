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
      retroAudio.playBlip();
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

        // Burst phase: gravity + radial dispersion
        if (p.age < p.burstDuration) {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.22; // subtle gravity
          p.vx *= 0.94; // air resistance
          p.vy *= 0.94;
        } else {
          // Flight phase: accelerated homing pull toward target badge
          const dx = target.x - p.x;
          const dy = target.y - p.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 24) {
            // Particle hit the target!
            if (!hasImpacted) {
              triggerBadgeImpact();
              hasImpacted = true;
            }
            continue; // Remove particle on impact
          }

          // Homing acceleration with spring-like curve
          const speed = Math.min(22, Math.max(8, dist * 0.09));
          const angle = Math.atan2(dy, dx);
          
          p.vx = p.vx * 0.75 + Math.cos(angle) * speed * 0.25;
          p.vy = p.vy * 0.75 + Math.sin(angle) * speed * 0.25;

          p.x += p.vx;
          p.y += p.vy;
        }

        // Draw pixel-art particle
        ctx.fillStyle = p.color;
        const half = Math.floor(p.size / 2);

        if (p.isStar) {
          // Draw crisp 8-bit cross star (+)
          ctx.fillRect(Math.floor(p.x) - half, Math.floor(p.y), p.size, 2);
          ctx.fillRect(Math.floor(p.x), Math.floor(p.y) - half, 2, p.size);
        } else {
          // Draw crisp pixel square
          ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
        }

        // Keep particle if it hasn't expired or hit target
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

    const handleEmission = ({ x, y, amount = 12 }: { x: number; y: number; amount?: number }) => {
      // Check reduced motion preference
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        triggerBadgeImpact();
        return;
      }

      const count = Math.min(20, Math.max(8, amount));
      const newParticles: Particle[] = [];

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
        const speed = 4 + Math.random() * 7;
        const size = Math.random() > 0.4 ? 4 : 6;
        const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];

        newParticles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2.5, // slight upward kick
          size,
          color,
          age: 0,
          maxAge: 90, // ~1.5s max flight window
          burstDuration: 12 + Math.floor(Math.random() * 8), // ~250ms explosion
          isStar: Math.random() > 0.5,
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
