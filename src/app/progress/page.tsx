'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { useHabitStore } from '@/store/useHabitStore';
import { calculateLevel } from '@/lib/progression/engine';
import { TITLE_RANKS, STREAK_MILESTONES, xpToReachLevel, STREAK_FREEZE } from '@/lib/progression/config';
import { QuestPanel } from '@/components/progression/QuestPanel';
import { LivingEmberCanopy } from '@/components/progression/LivingEmberCanopy';
import { retroAudio } from '@/lib/retroAudio';

function getRankCrestImage(minLevel: number): string {
  if (minLevel >= 35) return '/assets/progression/crest_starwarden.jpg';
  if (minLevel >= 10) return '/assets/progression/crest_emberwarden.jpg';
  return '/assets/progression/crest_wanderer.jpg';
}

export default function ProgressPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedRankIndex, setSelectedRankIndex] = useState<number | null>(null);
  const [activityFilter, setActivityFilter] = useState<'all' | 'habit' | 'quest' | 'streak'>('all');

  const { totalXp, streakCount, streakFreezeStock, xpHistory } = useHabitStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const progress = useMemo(() => calculateLevel(totalXp), [totalXp]);
  const orderedRanks = useMemo(() => [...TITLE_RANKS].reverse(), []);

  const currentRankIndex = useMemo(() => {
    const idx = orderedRanks.findIndex((r) => r.name === progress.title);
    return idx >= 0 ? idx : 0;
  }, [orderedRanks, progress.title]);

  const activeInspectedRank = selectedRankIndex !== null ? orderedRanks[selectedRankIndex] : orderedRanks[currentRankIndex];

  const filteredHistory = useMemo(() => {
    if (activityFilter === 'all') return xpHistory;
    if (activityFilter === 'habit') return xpHistory.filter((h) => h.reason.toLowerCase().includes('habit'));
    if (activityFilter === 'quest') return xpHistory.filter((h) => h.reason.toLowerCase().includes('quest'));
    if (activityFilter === 'streak') return xpHistory.filter((h) => h.reason.toLowerCase().includes('streak'));
    return xpHistory;
  }, [xpHistory, activityFilter]);

  if (!mounted) {
    return (
      <div className="min-h-[100dvh] bg-[#F4F0EA] flex items-center justify-center font-mono text-xs text-[#1A3629]">
        Calibrating progression telemetry...
      </div>
    );
  }

  const activeCrest = getRankCrestImage(progress.level);
  const inspectedCrest = getRankCrestImage(activeInspectedRank.minLevel);

  return (
    <div className="min-h-[100dvh] bg-[#F4F0EA] text-[#1A3629] flex flex-col selection:bg-[#1A3629] selection:text-[#FFFDF9]">
      <HeaderNav />

      {/* Decorative ambient background blur orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[720px] h-[480px] bg-gradient-to-b from-[#FEF3C7]/40 via-[#F5E6C8]/20 to-transparent blur-3xl opacity-60" />
      </div>

      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-6 lg:px-12 pt-32 pb-36 flex flex-col gap-20 sm:gap-24">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex items-center justify-between border-b-2 border-[#1A3629]/15 pb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-cabinet font-bold px-5 py-2.5 rounded-full border-2 bg-[#1A3629] border-[#1A3629] text-[#FFFDF9] shadow-[3px_3px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
          >
            <span>← Return to Daily Planner</span>
          </Link>

          <div className="flex items-center gap-4 font-mono text-xs text-[#4A5D4E]">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#1A3629]/20 bg-[#FFFDF9]">
              <img
                src="/assets/progression/relic_flame_brazier.jpg"
                alt="Cadence"
                className="w-4 h-4 rounded-sm object-cover [image-rendering:pixelated]"
              />
              <span className="font-bold text-[#1A3629]">{streakCount} Days Cadence</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#1A3629]/20 bg-[#FFFDF9]">
              <img
                src="/assets/progression/relic_freeze_rune.jpg"
                alt="Freeze Shields"
                className="w-4 h-4 rounded-sm object-cover [image-rendering:pixelated]"
              />
              <span className="font-bold text-[#2563EB]">{streakFreezeStock}/{STREAK_FREEZE.maxStock} Shields</span>
            </div>
          </div>
        </div>

        {/* Section 1: Hero Command Center (Dimensional & Alive) */}
        <section className="relative border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[8px_8px_0px_#1A3629] rounded-3xl p-8 sm:p-12 lg:p-14 overflow-hidden">
          {/* 16-Bit Living Ember Canopy Physics */}
          <LivingEmberCanopy intensity="high" className="opacity-75" />

          {/* Ambient Glow Aura */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-[#D97706]/15 via-[#F59E0B]/5 to-transparent blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10 lg:gap-14">
            {/* Left: Floating Crest + Rank Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
              {/* Floating Animated Heraldic Crest */}
              <div className="relative group shrink-0">
                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl border-3 border-[#1A3629] shadow-[6px_6px_0px_#1A3629] overflow-hidden bg-[#1A3629] p-1.5 transition-all duration-700 animate-[floatSlow_6s_ease-in-out_infinite] hover:scale-105">
                  <img
                    src={activeCrest}
                    alt={progress.title}
                    className="w-full h-full object-cover rounded-2xl [image-rendering:pixelated]"
                  />
                </div>

                {/* Level Overlay Pill */}
                <div className="absolute -bottom-3 -right-3 px-3 py-1 rounded-full border-2 border-[#1A3629] bg-[#FEF3C7] text-[#92400E] font-mono text-xs font-bold shadow-[3px_3px_0px_#1A3629] flex items-center gap-1.5 animate-[countPop_0.3s_ease-out]">
                  <span className="w-2 h-2 rounded-full bg-[#D97706] animate-ping" />
                  <span>LVL {progress.level}</span>
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full border-2 border-[#1A3629] bg-[#FAF6EE] text-[#1A3629] font-mono text-[10px] font-bold uppercase tracking-wider shadow-[2px_2px_0px_#1A3629]">
                    Tier {currentRankIndex + 1} of {orderedRanks.length}
                  </span>
                  {progress.isMaxLevel && (
                    <span className="px-3 py-1 rounded-full bg-[#10B981] text-[#FFFDF9] font-mono text-[10px] font-bold uppercase tracking-wider">
                      Apex Mastery
                    </span>
                  )}
                </div>

                <h1 className="font-fraunces font-black text-3xl sm:text-4xl lg:text-5xl text-[#1A3629] tracking-tight leading-none pt-1">
                  {progress.title}
                </h1>

                <p className="font-sans text-sm text-[#4A5D4E] mt-1 max-w-md leading-relaxed">
                  {progress.isMaxLevel
                    ? 'You have ascended to the absolute zenith of Emberwild discipline.'
                    : `Active discipline rank established. Keep hitting your nutrition and habit targets to advance.`}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <div className="px-4 py-1.5 rounded-xl border-2 border-[#1A3629] bg-[#FAF6EE] font-mono text-xs font-bold text-[#1A3629] shadow-[2px_2px_0px_#1A3629]">
                    {progress.totalXp.toLocaleString()} Cumulative XP
                  </div>
                  <div className="px-4 py-1.5 rounded-xl border-2 border-[#1A3629] bg-[#FFFDF9] font-mono text-xs font-bold text-[#D97706] shadow-[2px_2px_0px_#1A3629] flex items-center gap-1.5">
                    <img
                      src="/assets/progression/relic_flame_brazier.jpg"
                      alt="Cadence"
                      className="w-4 h-4 rounded-sm object-cover [image-rendering:pixelated]"
                    />
                    <span>{streakCount} Days Ignited</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Progress Telemetry Meter */}
            <div className="flex-1 max-w-md lg:border-l-2 lg:border-[#1A3629]/15 lg:pl-10 flex flex-col gap-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#4A5D4E] font-medium">Progress to next tier</span>
                <span className="font-bold text-[#1A3629]">
                  {progress.isMaxLevel ? 'Apex Cleared' : `${progress.currentLevelXp.toLocaleString()} / ${progress.xpForNextLevel.toLocaleString()} XP`}
                </span>
              </div>

              {/* Animated Glowing Progress Track */}
              <div className="relative w-full h-5 bg-[#EAE3D2] rounded-full border-2 border-[#1A3629] p-0.5 overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
                <div
                  className="h-full bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#FBBF24] rounded-full transition-all duration-700 ease-out relative"
                  style={{ width: `${progress.progressPercent}%` }}
                >
                  {/* Subtle animated shimmer highlight */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[emberShimmer_2s_infinite]" />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-[#4A5D4E]">
                <span className="font-bold text-[#1A3629]">{progress.progressPercent}% of current tier</span>
                <span>{progress.nextTitle ? `Upcoming: ${progress.nextTitle}` : 'Apex Master'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Active Quests & Challenges */}
        <section className="flex flex-col gap-6">
          <QuestPanel />
        </section>

        {/* Section 3: Rank Ascendancy Ladder */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b-2 border-[#1A3629]/15 pb-4">
            <div>
              <h2 className="font-fraunces font-black text-2xl sm:text-3xl text-[#1A3629] tracking-tight">
                Emberwild Rank Ascendancy
              </h2>
              <p className="font-sans text-xs text-[#4A5D4E] mt-1">
                Select any rank to inspect requirements, standing, and heraldic lore.
              </p>
            </div>

            <div className="font-mono text-xs font-bold text-[#D97706]">
              {currentRankIndex + 1} of {orderedRanks.length} Ranks Unlocked
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Interactive Tier Roster */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {orderedRanks.map((rank, idx) => {
                const isUnlocked = progress.level >= rank.minLevel;
                const isCurrent = progress.title === rank.name;
                const isInspected = activeInspectedRank.name === rank.name;
                const reqXp = xpToReachLevel(rank.minLevel);
                const rankThumb = getRankCrestImage(rank.minLevel);

                return (
                  <button
                    key={rank.name}
                    type="button"
                    onClick={() => {
                      retroAudio.playBlip();
                      setSelectedRankIndex(idx);
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left flex items-center justify-between gap-3.5 cursor-pointer ${
                      isInspected
                        ? 'border-[#1A3629] bg-[#FFFDF9] shadow-[5px_5px_0px_#1A3629] -translate-y-1'
                        : isUnlocked
                        ? 'border-[#1A3629]/40 bg-[#FFFDF9]/80 hover:bg-[#FFFDF9] hover:border-[#1A3629] hover:shadow-[3px_3px_0px_#1A3629]'
                        : 'border-[#1A3629]/20 bg-[#F4EDE0]/40 opacity-60 hover:opacity-90'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-xl border-2 border-[#1A3629] overflow-hidden bg-[#1A3629] shrink-0 shadow-[2px_2px_0px_#1A3629]">
                        <img
                          src={rankThumb}
                          alt={rank.name}
                          className={`w-full h-full object-cover [image-rendering:pixelated] ${!isUnlocked ? 'grayscale contrast-125 opacity-70' : ''}`}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-[#4A5D4E]">
                            LVL {rank.minLevel}+
                          </span>
                          {isCurrent && (
                            <span className="px-2 py-0.2 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#D97706]/40 font-mono text-[9px] font-bold uppercase">
                              Current
                            </span>
                          )}
                        </div>
                        <h3 className="font-fraunces font-bold text-base text-[#1A3629] truncate">
                          {rank.name}
                        </h3>
                      </div>
                    </div>

                    <span className="font-mono text-xs text-[#4A5D4E] font-medium shrink-0">
                      {reqXp.toLocaleString()} XP
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right: Floating Inspected Dossier Card */}
            <div className="border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[6px_6px_0px_#1A3629] rounded-3xl p-7 sm:p-8 flex flex-col justify-between self-start sticky top-28 transition-all">
              <div>
                <div className="flex items-center justify-between gap-2 mb-6 pb-3 border-b-2 border-[#1A3629]/10">
                  <span className="font-mono text-xs font-bold text-[#D97706] uppercase tracking-wider">
                    Rank Dossier
                  </span>
                  <span className="font-mono text-xs text-[#4A5D4E]">
                    Requirement: Level {activeInspectedRank.minLevel}
                  </span>
                </div>

                <div className="w-24 h-24 rounded-2xl border-3 border-[#1A3629] bg-[#1A3629] shadow-[4px_4px_0px_#1A3629] overflow-hidden mb-5 animate-[countPop_0.3s_ease-out]">
                  <img
                    src={inspectedCrest}
                    alt={activeInspectedRank.name}
                    className="w-full h-full object-cover [image-rendering:pixelated]"
                  />
                </div>

                <h3 className="font-fraunces font-black text-2xl sm:text-3xl text-[#1A3629] mb-2">
                  {activeInspectedRank.name}
                </h3>

                <p className="font-sans text-xs sm:text-sm text-[#4A5D4E] leading-relaxed mb-6">
                  {progress.level >= activeInspectedRank.minLevel
                    ? 'Discipline verified. This title rank is permanently secured to your account record.'
                    : `Achieve Level ${activeInspectedRank.minLevel} and ${xpToReachLevel(activeInspectedRank.minLevel).toLocaleString()} cumulative XP to etch this heraldic mark.`}
                </p>
              </div>

              <div className="pt-4 border-t-2 border-[#1A3629]/15 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#4A5D4E]">Threshold Target</span>
                  <span className="font-bold text-[#1A3629]">
                    {xpToReachLevel(activeInspectedRank.minLevel).toLocaleString()} XP
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#4A5D4E]">Unlock Status</span>
                  <span className={`font-bold ${progress.level >= activeInspectedRank.minLevel ? 'text-[#10B981]' : 'text-[#D97706]'}`}>
                    {progress.level >= activeInspectedRank.minLevel ? 'Secured ✓' : 'In Progress'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Streak Crucible */}
        <section className="relative border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[8px_8px_0px_#1A3629] rounded-3xl p-8 sm:p-10 overflow-hidden flex flex-col gap-8">
          {/* 16-Bit Living Ember Canopy Physics */}
          <LivingEmberCanopy intensity="ambient" className="opacity-60" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b-2 border-[#1A3629]/15 pb-4">
            <div>
              <h2 className="font-fraunces font-black text-2xl sm:text-3xl text-[#1A3629] tracking-tight">
                The Streak Crucible
              </h2>
              <p className="font-sans text-xs text-[#4A5D4E] mt-1">
                Maintain continuous ritual momentum to ignite higher brazier flames.
              </p>
            </div>

            <div className="font-mono text-xs font-bold text-[#1A3629]">
              Cadence Flame: {streakCount} Days Active
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {STREAK_MILESTONES.map((milestone) => {
              const achieved = streakCount >= milestone.days;

              return (
                <div
                  key={milestone.days}
                  onMouseEnter={() => {
                    if (achieved) retroAudio.playBlip();
                  }}
                  className={`p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-between min-h-[175px] text-center cursor-default ${
                    achieved
                      ? 'bg-[#FFFDF9] border-[#1A3629] shadow-[4px_4px_0px_#1A3629] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#1A3629]'
                      : 'bg-[#F4EDE0]/50 border-[#1A3629]/20 opacity-60'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl border-2 border-[#1A3629] overflow-hidden p-0.5 bg-[#1A3629] shadow-[2px_2px_0px_#1A3629] ${achieved ? 'animate-[flamePulse_2.5s_infinite]' : 'grayscale opacity-50'}`}>
                    <img
                      src="/assets/progression/relic_flame_brazier.jpg"
                      alt={milestone.name}
                      className="w-full h-full object-cover [image-rendering:pixelated]"
                    />
                  </div>

                  <div className="my-2">
                    <span className="font-pixel text-base font-bold text-[#1A3629] block">
                      {milestone.days} Days
                    </span>
                    <span className="font-fraunces text-xs font-bold text-[#4A5D4E] block mt-0.5">
                      {milestone.name}
                    </span>
                  </div>

                  <span
                    className={`font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-lg border ${
                      achieved
                        ? 'bg-[#FEF3C7] text-[#92400E] border-[#D97706]/40 shadow-[1px_1px_0px_#D97706]'
                        : 'bg-[#EAE3D2] text-[#8C9B90] border-transparent'
                    }`}
                  >
                    +{milestone.xp} XP
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 5: Progression Ledger */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#1A3629]/15 pb-4">
            <div>
              <h2 className="font-fraunces font-black text-2xl sm:text-3xl text-[#1A3629] tracking-tight">
                Progression Audit Ledger
              </h2>
              <p className="font-sans text-xs text-[#4A5D4E] mt-1">
                Chronological record of earned XP awards and unlocked milestones.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 p-1 bg-[#EAE3D2] rounded-xl border border-[#1A3629]/20">
              {(['all', 'habit', 'quest', 'streak'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => {
                    retroAudio.playBlip();
                    setActivityFilter(filter);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold capitalize transition-all cursor-pointer ${
                    activityFilter === filter
                      ? 'bg-[#1A3629] text-[#FFFDF9] shadow-[1px_1px_0px_#1A3629]'
                      : 'text-[#4A5D4E] hover:text-[#1A3629]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#FFFDF9] border-3 border-[#1A3629] rounded-2xl shadow-[6px_6px_0px_#1A3629] divide-y-2 divide-[#1A3629]/10 overflow-hidden">
            {filteredHistory.length === 0 ? (
              <div className="p-10 text-center font-mono text-xs text-[#4A5D4E]">
                No progression events logged in this category.
              </div>
            ) : (
              filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-[#FAF6EE] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-10 h-10 rounded-xl bg-[#FAF6EE] border-2 border-[#1A3629]/20 flex items-center justify-center font-pixel text-xs font-bold text-[#D97706] shadow-[1px_1px_0px_#1A3629] shrink-0">
                      +{item.amount}
                    </span>
                    <div>
                      <span className="font-sans text-xs sm:text-sm font-bold text-[#1A3629] block">
                        {item.reason}
                      </span>
                      <span className="font-mono text-[10px] text-[#4A5D4E]">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-bold text-[#1A3629] px-3 py-1 rounded-lg bg-[#FAF6EE] border border-[#1A3629]/20">
                    +{item.amount} XP
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
