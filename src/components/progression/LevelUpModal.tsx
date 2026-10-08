'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Image from 'next/image';
import { progressionEvents, ProgressionEvents } from '@/lib/progression/events';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { useHabitStore } from '@/store/useHabitStore';
import { getIslandTier, IslandSuiteId, getSuiteTiers } from '@/lib/progression/config';
import {
  PixelSparkles,
  PixelGift,
  PixelCopy,
  PixelCheck,
  PixelShare,
  PixelX,
  PixelArrowRight,
} from '@/components/common/PixelIcons';

type IslandEvolutionEvent = ProgressionEvents['island:evolve'];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
  isStar?: boolean;
  sway?: number;
}

const GOLD_PALETTE = ['#FDE047', '#FBBF24', '#F59E0B', '#D97706', '#FEF3C7', '#FFFFFF'];
const EMERALD_PALETTE = ['#6EE7B7', '#34D399', '#10B981', '#059669', '#A7F3D0'];

function EvolutionCanvasVfx({
  phase,
  containerRef,
}: {
  phase: 'charging' | 'morphing' | 'touchdown' | 'revealed';
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const lastPhaseRef = useRef(phase);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = 1;
    let width = 0;
    let height = 0;

    const resize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    // Burst helpers
    const spawnSupernovaBurst = (cx: number, cy: number) => {
      const burstCount = 65;
      for (let i = 0; i < burstCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 9;
        const palette = Math.random() > 0.25 ? GOLD_PALETTE : EMERALD_PALETTE;
        particlesRef.current.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() > 0.7 ? 4 : 2.5,
          alpha: 1,
          decay: 0.012 + Math.random() * 0.015,
          color: palette[Math.floor(Math.random() * palette.length)],
          isStar: Math.random() > 0.6,
        });
      }
    };

    const spawnGroundImpact = (cx: number, groundY: number) => {
      const count = 38;
      for (let i = 0; i < count; i++) {
        const spreadX = (Math.random() - 0.5) * 220;
        const vx = (Math.random() - 0.5) * 7.5;
        const vy = -(1 + Math.random() * 4);
        particlesRef.current.push({
          x: cx + spreadX,
          y: groundY + (Math.random() - 0.5) * 12,
          vx,
          vy,
          size: 2 + Math.random() * 2.5,
          alpha: 0.95,
          decay: 0.02 + Math.random() * 0.02,
          color: GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)],
        });
      }
    };

    // Phase trigger checks
    if (phase === 'morphing' && lastPhaseRef.current !== 'morphing') {
      spawnSupernovaBurst(width / 2, height * 0.44);
    } else if (phase === 'touchdown' && lastPhaseRef.current !== 'touchdown') {
      spawnGroundImpact(width / 2, height * 0.64);
    }
    lastPhaseRef.current = phase;

    let frameCount = 0;
    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height * 0.44;

      // Inward suction during charging
      if (phase === 'charging' && frameCount % 2 === 0) {
        for (let i = 0; i < 3; i++) {
          const spawnAngle = Math.random() * Math.PI * 2;
          const spawnRadius = 150 + Math.random() * 110;
          const px = cx + Math.cos(spawnAngle) * spawnRadius;
          const py = cy + Math.sin(spawnAngle) * spawnRadius;
          const dx = cx - px;
          const dy = cy - py;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const speed = 4 + Math.random() * 3.5;

          particlesRef.current.push({
            x: px,
            y: py,
            vx: (dx / dist) * speed,
            vy: (dy / dist) * speed,
            size: 2 + Math.random() * 2,
            alpha: 0.85,
            decay: 0.025,
            color: GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)],
            isStar: Math.random() > 0.7,
          });
        }
      }

      // Gentle floating embers during revealed
      if (phase === 'revealed' && frameCount % 6 === 0) {
        particlesRef.current.push({
          x: cx + (Math.random() - 0.5) * 260,
          y: cy + 120 + Math.random() * 40,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -(0.8 + Math.random() * 1.2),
          size: 2 + Math.random() * 2,
          alpha: 0.7,
          decay: 0.008,
          color: GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)],
          sway: Math.random() * 10,
        });
      }

      // Update & draw particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;

        // Friction for outward bursts
        if (phase !== 'charging') {
          p.vx *= 0.96;
          p.vy *= 0.96;
        }

        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);

        if (p.isStar) {
          // Pixelated 4-pointed cross star (✦)
          const s = Math.round(p.size);
          ctx.fillRect(Math.round(p.x - s / 2), Math.round(p.y - s * 1.5), s, s * 3);
          ctx.fillRect(Math.round(p.x - s * 1.5), Math.round(p.y - s / 2), s * 3, s);
        } else {
          // Sharp pixel square
          const s = Math.round(p.size);
          ctx.fillRect(Math.round(p.x), Math.round(p.y), s, s);
        }
      }

      ctx.globalAlpha = 1;
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [phase, containerRef]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-15 w-full h-full"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}

export function LevelUpModal() {
  const [evolutionData, setEvolutionData] = useState<IslandEvolutionEvent | null>(null);
  const [levelUpData, setLevelUpData] = useState<ProgressionEvents['level:up'] | null>(null);
  const [phase, setPhase] = useState<'charging' | 'morphing' | 'touchdown' | 'revealed'>('charging');
  const [isTremoring, setIsTremoring] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  const { userProfile } = useHabitStore();
  const activeSuite = (userProfile?.selectedIslandSuite || userProfile?.archetype || 'circadian') as IslandSuiteId;

  // Master Ceremony Sequencer
  const runEvolutionSequence = useCallback(() => {
    // Phase 1: Ingestion & Charge (0ms - 1100ms)
    setPhase('charging');
    setIsTremoring(false);
    setIsShaking(false);
    retroAudio.playEvolutionCharge();
    haptics.tap();

    // Subtle micro-tremor as energy builds up
    const tremorTimer = setTimeout(() => {
      setIsTremoring(true);
    }, 700);

    // Phase 2: Supernova Metamorphosis Flash (1100ms - 2000ms)
    const t1 = setTimeout(() => {
      setIsTremoring(false);
      setPhase('morphing');
      haptics.heavy();
      retroAudio.playEvolutionSupernova();
      retroAudio.playTierUpgrade();
    }, 1100);

    // Phase 3: Seismic Bedrock Slam (2000ms - 2700ms)
    const t2 = setTimeout(() => {
      setPhase('touchdown');
      setIsShaking(true);
      haptics.heavy();
      retroAudio.playSeismicTouchdown();

      // Shake lasts 450ms
      setTimeout(() => setIsShaking(false), 450);
    }, 2000);

    // Phase 4: Archival Proclamation Reveal (2700ms+)
    const t3 = setTimeout(() => {
      setPhase('revealed');
      haptics.tap();
    }, 2700);

    return () => {
      clearTimeout(tremorTimer);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Listen to both island:evolve and level:up events
  useEffect(() => {
    const unsubEvolve = progressionEvents.on('island:evolve', (data) => {
      setEvolutionData(data);
    });

    const unsubLevel = progressionEvents.on('level:up', (data) => {
      setLevelUpData(data);
      setEvolutionData((prev) => {
        if (prev) return prev;
        const oldTierData = getIslandTier(data.oldLevel, activeSuite);
        const newTierData = getIslandTier(data.newLevel, activeSuite);
        return {
          oldTier: oldTierData.tier,
          newTier: newTierData.tier,
          level: data.newLevel,
          suite: activeSuite,
          oldIsland: { name: oldTierData.name, image: oldTierData.image, pngImage: oldTierData.pngImage },
          newIsland: { name: newTierData.name, image: newTierData.image, pngImage: newTierData.pngImage, description: newTierData.description },
        };
      });
    });

    // Expose debug trigger for developer/testing convenience
    if (typeof window !== 'undefined') {
      (window as any).cyathTriggerEvolution = (targetTier?: number) => {
        const t = targetTier || 2;
        const tiers = getSuiteTiers(activeSuite);
        const prevTier = tiers[Math.max(0, t - 2)] || tiers[0];
        const nextTier = tiers[Math.min(tiers.length - 1, t - 1)] || tiers[1];

        progressionEvents.emit('island:evolve', {
          oldTier: prevTier.tier,
          newTier: nextTier.tier,
          level: nextTier.minLevel,
          suite: activeSuite,
          oldIsland: { name: prevTier.name, image: prevTier.image, pngImage: prevTier.pngImage },
          newIsland: { name: nextTier.name, image: nextTier.image, pngImage: nextTier.pngImage, description: nextTier.description },
        });
      };
    }

    return () => {
      unsubEvolve();
      unsubLevel();
    };
  }, [activeSuite]);

  // Run sequence when evolutionData is set
  useEffect(() => {
    if (!evolutionData) return;
    return runEvolutionSequence();
  }, [evolutionData, runEvolutionSequence]);

  const isTierUpgrade = useMemo(() => {
    if (!evolutionData) return false;
    return evolutionData.newTier > evolutionData.oldTier;
  }, [evolutionData]);

  if (!evolutionData && !levelUpData) return null;

  const oldIsland = evolutionData?.oldIsland;
  const newIsland = evolutionData?.newIsland;

  const oldTier = evolutionData?.oldTier ?? 1;
  const newTier = evolutionData?.newTier ?? 1;
  const currentLevel = evolutionData?.level ?? levelUpData?.newLevel ?? 1;
  const islandName = newIsland?.name ?? 'Sanctuary Island';
  const islandDesc = newIsland?.description ?? 'Your sanctuary has expanded to harness deeper biological rhythm.';

  const userReferralCode = userProfile?.referralCode || 'CYATH-JOIN';
  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/auth?ref=${userReferralCode}`
    : `https://cyath.space/auth?ref=${userReferralCode}`;

  const handleClose = () => {
    retroAudio.playInspectConfirm();
    setEvolutionData(null);
    setLevelUpData(null);
  };

  const handleReplay = () => {
    runEvolutionSequence();
  };

  const handleWitnessInSanctuary = () => {
    retroAudio.playInspectConfirm();
    haptics.heavy();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cyath-close-drawers'));
    }

    setEvolutionData(null);
    setLevelUpData(null);

    const el = document.getElementById('tour-sanctuary-stage');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCopyInviteLink = async () => {
    retroAudio.playInspectConfirm();
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {}
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sanctuary Island Metamorphosis Ceremony"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-3 sm:p-6 select-none overflow-hidden"
    >
      {/* 
        CRUCIAL: Pure Atmospheric Deep Midnight Backdrop at z-[100].
        Completely eclipses drawers and guarantees the evolving island is rendered
        at 100% full, razor-sharp fidelity.
      */}
      <div
        className="absolute inset-0 bg-[#07110C]/95 backdrop-blur-md animate-in fade-in duration-300 pointer-events-auto"
        onClick={phase === 'revealed' ? handleClose : undefined}
      />

      {/* Runic Neobrutalist Corner Brackets */}
      <div className="pointer-events-none absolute inset-3 sm:inset-6 border border-[#B8862D]/20 rounded-3xl z-10">
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-400/60" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-400/60" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-400/60" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-400/60" />
      </div>

      {/* Rotating 12-Beam Celestial Sunburst / God Rays */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10 overflow-hidden">
        <svg
          viewBox="0 0 500 500"
          className={`w-[600px] h-[600px] sm:w-[750px] sm:h-[750px] animate-god-rays transition-all duration-700 ${
            phase === 'charging'
              ? 'opacity-40 scale-100'
              : phase === 'morphing'
              ? 'opacity-90 scale-125'
              : 'opacity-30 scale-95'
          }`}
        >
          <defs>
            <radialGradient id="sunburstGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FDE047" stopOpacity="0.85" />
              <stop offset="35%" stopColor="#F59E0B" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#10B981" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#07110C" stopOpacity="0" />
            </radialGradient>
          </defs>
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x1 = 250 + Math.cos(angle - 0.14) * 250;
            const y1 = 250 + Math.sin(angle - 0.14) * 250;
            const x2 = 250 + Math.cos(angle + 0.14) * 250;
            const y2 = 250 + Math.sin(angle + 0.14) * 250;
            return (
              <polygon
                key={i}
                points={`250,250 ${x1},${y1} ${x2},${y2}`}
                fill="url(#sunburstGrad)"
                opacity={i % 2 === 0 ? 0.75 : 0.4}
              />
            );
          })}
        </svg>
      </div>

      {/* Radial Atmospheric Aurora Glow */}
      <div
        className={`pointer-events-none absolute w-[550px] h-[550px] rounded-full transition-all duration-1000 z-10 ${
          phase === 'charging'
            ? 'bg-amber-400/20 blur-3xl scale-95'
            : phase === 'morphing'
            ? 'bg-amber-300/40 blur-2xl scale-135'
            : 'bg-emerald-500/25 blur-3xl scale-105'
        }`}
      />

      {/* Supernova Celestial Flash Overlay during Metamorphosis */}
      {phase === 'morphing' && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-radial from-amber-100/60 via-amber-300/30 to-transparent animate-out fade-out duration-700 z-30" />
      )}

      {/* Main Interactive Stage */}
      <div
        ref={modalContainerRef}
        className={`relative z-20 flex flex-col items-center justify-center w-full max-w-xl text-center transition-transform ${
          isShaking ? 'animate-screen-shake' : ''
        }`}
      >
        {/* Dedicated Canvas Particle VFX */}
        <EvolutionCanvasVfx phase={phase} containerRef={modalContainerRef} />

        {/* Top Header Archival Badge */}
        <div className="flex flex-col items-center gap-1.5 mb-2 z-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#12281E] border border-amber-400/50 text-amber-300 font-mono text-xs font-bold shadow-[0_4px_16px_rgba(251,191,36,0.18)]">
            <PixelSparkles size={14} color="#FBBF24" />
            <span>
              {isTierUpgrade ? `✦ BIOME METAMORPHOSIS · TIER ${newTier} ✦` : `✦ SANCTUARY PROGRESSION · LEVEL ${currentLevel} ✦`}
            </span>
          </div>

          <span className="font-mono text-[10px] sm:text-[11px] text-amber-200/80 tracking-widest uppercase">
            {evolutionData?.suite === 'iron'
              ? 'Iron Anchor Forge'
              : evolutionData?.suite === 'focus'
              ? 'Deep Worker Citadel'
              : 'Circadian Sanctuary'}
          </span>
        </div>

        {/* Central Metamorphosis Island Theater */}
        <div
          ref={stageRef}
          className="relative flex flex-col items-center justify-center my-2 w-full"
        >
          {/* Ground Concentric Shockwave Rings on Touchdown */}
          {phase === 'touchdown' && (
            <div className="absolute top-[78%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
              <div className="w-80 h-28 rounded-[50%] border-2 border-amber-300/85 animate-shockwave-expand" />
              <div className="w-96 h-32 rounded-[50%] border border-emerald-400/70 animate-shockwave-expand [animation-delay:90ms]" />
            </div>
          )}

          {/* Stepped Pixel Island Container */}
          <div
            className={`relative w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] flex items-center justify-center transition-all duration-700 ${
              phase === 'charging'
                ? '-translate-y-10 scale-105'
                : phase === 'morphing'
                ? 'scale-115'
                : phase === 'touchdown'
                ? 'animate-seismic-slam'
                : 'translate-y-0 scale-100 animate-island-float'
            } ${isTremoring ? 'animate-evolution-tremor' : ''}`}
          >
            {/* Old Island Sprite (dissolves during morphing) */}
            {oldIsland && (
              <div
                className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                  phase === 'charging'
                    ? 'opacity-100 scale-100 filter drop-shadow-[0_20px_45px_rgba(251,191,36,0.6)] brightness-110'
                    : 'opacity-0 scale-125 filter brightness-200 blur-xs pointer-events-none'
                }`}
              >
                <Image
                  src={oldIsland.pngImage || oldIsland.image}
                  alt={oldIsland.name}
                  fill
                  priority
                  sizes="(max-width: 640px) 300px, 380px"
                  className="object-contain select-none"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            )}

            {/* New Island Sprite (blooms and slams down during morphing & touchdown) */}
            {newIsland && (
              <div
                className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${
                  phase === 'charging'
                    ? 'opacity-0 scale-90'
                    : phase === 'morphing'
                    ? 'opacity-100 scale-110 filter drop-shadow-[0_25px_60px_rgba(251,191,36,0.8)] brightness-135'
                    : phase === 'touchdown'
                    ? 'opacity-100 scale-100 filter drop-shadow-[0_25px_50px_rgba(16,185,129,0.45)]'
                    : 'opacity-100 scale-100 filter drop-shadow-[0_20px_40px_rgba(16,185,129,0.3)]'
                }`}
              >
                <Image
                  src={newIsland.pngImage || newIsland.image}
                  alt={newIsland.name}
                  fill
                  priority
                  sizes="(max-width: 640px) 300px, 380px"
                  className="object-contain select-none"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            )}
          </div>

          {/* Stepped Pixel Ground Shadow */}
          <div className="flex flex-col items-center justify-center -mt-6 pointer-events-none z-0">
            <div
              className={`h-3.5 rounded-full bg-black/60 transition-all duration-700 ${
                phase === 'charging'
                  ? 'w-[180px] opacity-35 scale-90'
                  : phase === 'morphing'
                  ? 'w-[260px] opacity-60 scale-105'
                  : 'w-[290px] opacity-80 scale-100'
              }`}
            />
            <div
              className={`h-2 rounded-full bg-black/80 -mt-2 transition-all duration-700 ${
                phase === 'charging'
                  ? 'w-[110px] opacity-25'
                  : phase === 'morphing'
                  ? 'w-[170px] opacity-50'
                  : 'w-[200px] opacity-70'
              }`}
            />
          </div>
        </div>

        {/* Revealed Archival Proclamation & Perks */}
        <div
          className={`flex flex-col items-center gap-3 w-full max-w-md transition-all duration-500 z-20 ${
            phase === 'revealed' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
          }`}
        >
          {/* Progression Visual Comparison Ribbon */}
          {isTierUpgrade && oldIsland && newIsland && (
            <div className="flex items-center justify-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 opacity-70">
                  <Image
                    src={oldIsland.pngImage || oldIsland.image}
                    alt={oldIsland.name}
                    fill
                    sizes="32px"
                    className="object-contain"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                <span className="font-mono text-[11px] text-[#A7C0B2]">Tier {oldTier}</span>
              </div>

              <div className="flex items-center text-amber-400 font-mono text-xs">
                <PixelArrowRight size={14} color="#FBBF24" />
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-10 h-10 ring-2 ring-amber-400/50 rounded-xl p-0.5 bg-amber-400/10">
                  <Image
                    src={newIsland.pngImage || newIsland.image}
                    alt={newIsland.name}
                    fill
                    sizes="40px"
                    className="object-contain"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                <span className="font-mono text-xs font-bold text-amber-300">Tier {newTier}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center gap-1">
            <h2 className="font-cabinet font-extrabold text-2xl sm:text-3xl text-[#FFFDF9] tracking-tight">
              {islandName}
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#A7C0B2] max-w-sm leading-relaxed">
              {islandDesc}
            </p>
          </div>

          {levelUpData?.unlockedTitle && (
            <div className="px-3 py-1 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 font-mono text-xs font-bold">
              Rank Title: {levelUpData.unlockedTitle}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full mt-1">
            <button
              type="button"
              onClick={handleWitnessInSanctuary}
              className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-[#FFFDF9] font-cabinet font-extrabold text-sm shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Witness in Sanctuary</span>
              <PixelArrowRight size={14} color="#FFFDF9" />
            </button>

            <button
              type="button"
              onClick={handleReplay}
              title="Replay evolution ceremony"
              className="w-full sm:w-auto py-3.5 px-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 font-cabinet font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <PixelSparkles size={14} color="#FBBF24" />
              <span>Replay</span>
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto py-3.5 px-4 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/15 text-[#FFFDF9] font-cabinet font-bold text-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>

          {/* Strategic Referral Link */}
          <div className="w-full p-3 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-between gap-3 text-left">
            <div className="flex flex-col">
              <span className="font-cabinet font-bold text-xs text-[#FFFDF9] flex items-center gap-1.5">
                <PixelGift size={12} color="#10B981" />
                <span>Invite an Explorer</span>
              </span>
              <span className="font-mono text-[10px] text-[#A7C0B2]">
                Earn +250 XP for every friend who joins
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopyInviteLink}
                className="px-3 py-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-[#FFFDF9] font-mono text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                {copiedLink ? <PixelCheck size={12} color="#10B981" /> : <PixelCopy size={12} />}
                <span>{copiedLink ? 'Copied' : 'Share'}</span>
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(`I just leveled up my sanctuary island to ${islandName} on Cyath! Join me: ${inviteUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => retroAudio.playInspectConfirm()}
                className="p-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-[#FFFDF9] transition-colors cursor-pointer"
                title="Share to WhatsApp"
              >
                <PixelShare size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Close Button Top Right */}
      <button
        type="button"
        onClick={handleClose}
        className="absolute top-6 right-6 z-30 p-2.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-[#FFFDF9] transition-colors cursor-pointer"
        aria-label="Close island evolution screen"
      >
        <PixelX size={16} color="currentColor" />
      </button>
    </div>
  );
}
