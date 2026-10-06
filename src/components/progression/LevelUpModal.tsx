'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { progressionEvents, ProgressionEvents } from '@/lib/progression/events';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { useHabitStore } from '@/store/useHabitStore';
import { getIslandTier, IslandSuiteId } from '@/lib/progression/config';
import { xpParticleEmitter } from '@/lib/particleEmitter';
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

export function LevelUpModal() {
  const [evolutionData, setEvolutionData] = useState<IslandEvolutionEvent | null>(null);
  const [levelUpData, setLevelUpData] = useState<ProgressionEvents['level:up'] | null>(null);
  const [phase, setPhase] = useState<'charging' | 'morphing' | 'touchdown' | 'revealed'>('charging');
  const [copiedLink, setCopiedLink] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const { userProfile, totalXp } = useHabitStore();

  const activeSuite = (userProfile?.selectedIslandSuite || userProfile?.archetype || 'circadian') as IslandSuiteId;

  // Listen to both island:evolve and level:up events
  useEffect(() => {
    const unsubEvolve = progressionEvents.on('island:evolve', (data) => {
      setEvolutionData(data);
      setPhase('charging');
    });

    const unsubLevel = progressionEvents.on('level:up', (data) => {
      setLevelUpData(data);
      // Fallback evolution data if not emitted concurrently
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
      setPhase('charging');
    });

    return () => {
      unsubEvolve();
      unsubLevel();
    };
  }, [activeSuite]);

  // Cinematic 4-Phase Evolution Choreography
  useEffect(() => {
    if (!evolutionData) return;

    // Phase 1: Charging (0ms - 1000ms)
    setPhase('charging');
    haptics.tap();

    const t1 = setTimeout(() => {
      // Phase 2: Morphing Flash & Particle Burst (1000ms - 1900ms)
      setPhase('morphing');
      haptics.heavy();
      retroAudio.playTierUpgrade();

      if (stageRef.current) {
        const rect = stageRef.current.getBoundingClientRect();
        xpParticleEmitter.emit(rect.left + rect.width / 2, rect.top + rect.height / 2, 28);
      }
    }, 1000);

    const t2 = setTimeout(() => {
      // Phase 3: Touchdown & Shockwave (1900ms - 2600ms)
      setPhase('touchdown');
      haptics.tap();
    }, 1900);

    const t3 = setTimeout(() => {
      // Phase 4: Full Reveal (2600ms+)
      setPhase('revealed');
    }, 2600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [evolutionData]);

  const isTierUpgrade = useMemo(() => {
    if (!evolutionData) return false;
    return evolutionData.newTier > evolutionData.oldTier;
  }, [evolutionData]);

  if (!evolutionData && !levelUpData) return null;

  const activeIsland = phase === 'charging' && isTierUpgrade
    ? evolutionData?.oldIsland
    : evolutionData?.newIsland;

  const newTier = evolutionData?.newTier ?? 1;
  const currentLevel = evolutionData?.level ?? levelUpData?.newLevel ?? 1;
  const islandName = evolutionData?.newIsland.name ?? 'Sanctuary Island';
  const islandDesc = evolutionData?.newIsland.description ?? 'Your sanctuary has expanded to harness deeper biological rhythm.';

  const userReferralCode = userProfile?.referralCode || 'CYATH-JOIN';
  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/auth?ref=${userReferralCode}`
    : `https://cyath.space/auth?ref=${userReferralCode}`;

  const handleClose = () => {
    retroAudio.playInspectConfirm();
    setEvolutionData(null);
    setLevelUpData(null);
  };

  const handleWitnessInSanctuary = () => {
    retroAudio.playInspectConfirm();
    haptics.heavy();

    // Close any open drawers so the island is revealed in full glory
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cyath-close-drawers'));
    }

    setEvolutionData(null);
    setLevelUpData(null);

    // Smooth scroll up to sanctuary stage
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
      aria-label="Island Progression Ceremony"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 select-none overflow-hidden"
    >
      {/* 
        CRUCIAL: Pure Dark Atmospheric Stage Backdrop at z-[100].
        This completely eclipses any open drawers (z-50) and bypasses their backdrop blur,
        guaranteeing the evolving island is rendered at 100% full, razor-sharp fidelity.
      */}
      <div
        className="absolute inset-0 bg-[#0B1510]/92 backdrop-blur-md animate-in fade-in duration-300 pointer-events-auto"
        onClick={phase === 'revealed' ? handleClose : undefined}
      />

      {/* Radiant Celestial Aurora Glow behind island */}
      <div
        className={`pointer-events-none absolute w-[600px] h-[600px] rounded-full transition-all duration-1000 ${
          phase === 'charging'
            ? 'bg-amber-400/15 blur-3xl scale-95'
            : phase === 'morphing'
            ? 'bg-amber-300/35 blur-2xl scale-125'
            : 'bg-emerald-500/20 blur-3xl scale-110'
        }`}
      />

      {/* Cosmic Whiteout Flash at the Moment of Morphing */}
      {phase === 'morphing' && (
        <div className="pointer-events-none absolute inset-0 bg-white/30 animate-out fade-out duration-700 z-30" />
      )}

      {/* Main Evolution Visual Theater */}
      <div className="relative z-20 flex flex-col items-center justify-center w-full max-w-xl text-center">
        
        {/* Top Header Badge */}
        <div className="flex flex-col items-center gap-1.5 mb-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A3629] border border-amber-400/40 text-amber-300 font-mono text-xs font-bold shadow-lg animate-in zoom-in-90 duration-200">
            <PixelSparkles size={14} color="#FBBF24" />
            <span>
              {isTierUpgrade ? `✦ BIOME EVOLUTION · TIER ${newTier} ✦` : `✦ SANCTUARY PROGRESSION · LEVEL ${currentLevel} ✦`}
            </span>
          </div>

          <span className="font-mono text-[11px] text-amber-200/70 tracking-widest uppercase">
            {evolutionData?.suite === 'iron' ? 'Iron Anchor Forge' : evolutionData?.suite === 'focus' ? 'Deep Worker Citadel' : 'Circadian Sanctuary'}
          </span>
        </div>

        {/* The Monumental Evolving Living Island */}
        <div
          ref={stageRef}
          className="relative flex flex-col items-center justify-center my-3 w-full"
        >
          {/* Pulsing Energy Shockwave Rings */}
          {(phase === 'charging' || phase === 'morphing') && (
            <div className="absolute w-[360px] h-[360px] rounded-full border border-amber-300/40 animate-ping pointer-events-none" />
          )}

          {/* Stepped Pixel Island Container */}
          <div
            className={`relative w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] flex items-center justify-center transition-all duration-700 ${
              phase === 'charging'
                ? '-translate-y-8 scale-105 filter drop-shadow-[0_20px_40px_rgba(251,191,36,0.35)]'
                : phase === 'morphing'
                ? 'scale-115 filter brightness-125 drop-shadow-[0_25px_50px_rgba(251,191,36,0.5)]'
                : 'translate-y-0 scale-100 filter drop-shadow-[0_20px_40px_rgba(16,185,129,0.25)]'
            }`}
          >
            {activeIsland && (
              <Image
                src={activeIsland.pngImage || activeIsland.image}
                alt={activeIsland.name}
                fill
                priority
                sizes="(max-width: 640px) 320px, 400px"
                className="object-contain select-none transition-all duration-500"
                style={{ imageRendering: 'pixelated' }}
              />
            )}
          </div>

          {/* Stepped Pixel Ground Shadow */}
          <div className="flex flex-col items-center justify-center -mt-6 pointer-events-none">
            <div
              className={`h-3 rounded-full bg-black/40 transition-all duration-700 ${
                phase === 'charging' ? 'w-[200px] opacity-40' : 'w-[280px] opacity-75'
              }`}
            />
            <div
              className={`h-2 rounded-full bg-black/60 -mt-2 transition-all duration-700 ${
                phase === 'charging' ? 'w-[120px] opacity-30' : 'w-[180px] opacity-60'
              }`}
            />
          </div>
        </div>

        {/* Revealed Island Title & Narrative Perks */}
        <div
          className={`flex flex-col items-center gap-3 w-full max-w-md transition-all duration-500 ${
            phase === 'revealed' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
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

          {/* Action Buttons: Witness Island in Sanctuary (closes drawers) or Continue */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full mt-2">
            <button
              type="button"
              onClick={handleWitnessInSanctuary}
              className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-[#FFFDF9] font-cabinet font-extrabold text-sm shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Witness Sanctuary Island</span>
              <PixelArrowRight size={14} color="#FFFDF9" />
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto py-3.5 px-5 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/15 text-[#FFFDF9] font-cabinet font-bold text-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>

          {/* Strategic Referral Link */}
          <div className="w-full p-3 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-between gap-3 text-left mt-1">
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
