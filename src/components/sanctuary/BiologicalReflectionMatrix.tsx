'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { xpParticleEmitter } from '@/lib/particleEmitter';
import { calculateSanctuaryMatrix, PillarTelemetry } from '@/lib/sanctuaryMatrixEngine';
import { EveningWrapModal } from '@/components/dashboard/EveningWrapModal';

export function BiologicalReflectionMatrix() {
  const router = useRouter();
  const [isEveningOpen, setIsEveningOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const {
    currentDate,
    getDailyLog,
    userProfile,
    dailyProtocolsAcceptedByDate,
    habits,
    deskRitualsByDate,
    setProtein,
    acceptDailyProtocol,
  } = useHabitStore();

  const currentLog = getDailyLog(currentDate);
  const protocolAccepted = !!dailyProtocolsAcceptedByDate[currentDate];
  const sunlightDone = !!currentLog.habitsCompleted['sunlight'];
  const deskRitual = deskRitualsByDate[currentDate];

  const targetProtein = userProfile?.weightKg ? Math.round(userProfile.weightKg * 2.0) : 140;
  const targetHydration = userProfile?.weightKg ? Number((userProfile.weightKg * 0.04).toFixed(1)) : 2.5;

  const matrix = calculateSanctuaryMatrix({
    sleepHours: currentLog.sleepHours || 7.5,
    restedRating: deskRitual?.morningRestedRating,
    energyLevel: currentLog.energyLevel,
    totalProteinLogged: currentLog.totalProteinLogged,
    targetProtein,
    hydrationLiters: currentLog.hydrationLiters,
    targetHydration,
    protocolAccepted,
    sunlightDone,
    caffeineCutoffRespected: deskRitual?.eveningWrapCompleted,
    slumpScore: deskRitual?.afternoonSlumpScore,
  });

  const handleAction = (pillar: PillarTelemetry) => {
    const { actionType, payload } = pillar.prescriptiveAction;
    retroAudio.playInspectConfirm();

    switch (actionType) {
      case 'LOG_PROTEIN': {
        const amt = payload?.amount || 25;
        const newTotal = currentLog.totalProteinLogged + amt;
        setProtein(newTotal, currentDate);
        xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 8);
        setActionNotice(`Added +${amt}g protein to daily ledger.`);
        setTimeout(() => setActionNotice(null), 2500);
        break;
      }
      case 'ACCEPT_PROTOCOL': {
        acceptDailyProtocol(currentDate);
        xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 8);
        setActionNotice('Daily protocol directive locked (+50 XP).');
        setTimeout(() => setActionNotice(null), 2500);
        break;
      }
      case 'OPEN_EVENING_WRAP': {
        setIsEveningOpen(true);
        break;
      }
      case 'NAV_DASHBOARD': {
        router.push('/dashboard');
        break;
      }
      default:
        break;
    }
  };

  const getBadgeStyle = (color: 'emerald' | 'amber' | 'rust') => {
    if (color === 'emerald') {
      return 'bg-[#ECFDF5] text-[#065F46] border-[#065F46]/30';
    }
    if (color === 'amber') {
      return 'bg-[#FEF3C7] text-[#92400E] border-[#92400E]/30';
    }
    return 'bg-[#FEE2E2] text-[#991B1B] border-[#991B1B]/30';
  };

  return (
    <div className="w-full rounded-3xl border-2 border-[#1A3629] bg-[#FFFDF9] shadow-[6px_6px_0px_#1A3629] overflow-hidden flex flex-col mt-2">
      {/* Master Observatory Header */}
      <div className="p-6 sm:p-7 bg-[#FFFDF9] flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-[#1A3629]">
        <div className="max-w-xl">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-[#1A3629]/70">
              LIVE SANCTUARY STATUS · OBSERVATORY
            </span>
          </div>
          <h2 className="font-cabinet font-extrabold text-2xl sm:text-3xl text-[#1A3629] mt-2 tracking-tight">
            Ecosystem Vitality · Level {matrix.ecosystemVitalityLevel} / 10
          </h2>
          <p className="font-cabinet text-xs sm:text-sm font-medium text-[#2C4A3B] mt-1 leading-relaxed">
            {matrix.vitalitySummary}
          </p>
        </div>

        {/* Integrated Biome Vitality Dial */}
        <div className="flex items-center gap-4 bg-[#FAF8F5] p-3.5 sm:p-4 rounded-2xl border-2 border-[#1A3629] shrink-0 shadow-[2px_2px_0px_#1A3629]">
          <div className="relative w-14 h-14 rounded-full border-2 border-[#1A3629] bg-[#1A3629] flex flex-col items-center justify-center text-[#FFFDF9] shadow-[1px_1px_0px_#C9A84C]">
            <span className="font-cabinet font-extrabold text-xl leading-none">
              {matrix.ecosystemVitalityLevel}
            </span>
            <span className="font-mono text-[8px] tracking-widest text-[#C9A84C] uppercase mt-0.5">
              / 10
            </span>
          </div>
          <div className="flex flex-col pr-1">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#4A5D4E]">
              Ecosystem Harmony
            </span>
            <span className="font-cabinet font-bold text-lg text-[#1A3629] tabular-nums leading-tight">
              {matrix.ecosystemVitalityLevel * 10}% Biome Health
            </span>
            <span className="font-mono text-[10px] text-[#1A3629]/70">
              Liebig Bottleneck Protected
            </span>
          </div>
        </div>
      </div>

      {/* Action Notice Alert if Triggered */}
      {actionNotice && (
        <div className="w-full px-6 py-2.5 bg-[#EAE2D0] border-b-2 border-[#1A3629] font-mono text-xs font-bold text-[#1A3629] flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1A3629] animate-pulse" />
            {actionNotice}
          </span>
          <span className="text-[10px] opacity-70">SANCTUARY UPDATED</span>
        </div>
      )}

      {/* 3 Biological Pillars Grid as Seamless Architectural Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x-2 divide-[#1A3629]/15 bg-[#FFFDF9]">
        {/* ========================================================================= */}
        {/* PILLAR 1: THE HEARTH (Sleep & Neuro-Restoration)                          */}
        {/* ========================================================================= */}
        <div className="p-6 sm:p-7 flex flex-col justify-between gap-6 hover:bg-[#FAF8F5]/60 transition-colors">
          <div className="flex flex-col">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#1A3629] text-[#FFFDF9] font-mono text-xs font-bold flex items-center justify-center shadow-[1px_1px_0px_#C9A84C]">
                  ◈
                </span>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#1A3629]">
                  THE HEARTH
                </span>
              </div>
              <span
                className={`font-mono text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${getBadgeStyle(
                  matrix.hearth.statusColor
                )}`}
              >
                {matrix.hearth.statusTier}
              </span>
            </div>

            {/* Metrics */}
            <div className="font-cabinet font-bold text-xl sm:text-2xl text-[#1A3629] tracking-tight">
              {matrix.hearth.primaryMetric}
            </div>
            <div className="font-mono text-xs text-[#4A5D4E] mt-0.5">
              {matrix.hearth.secondaryMetric}
            </div>

            {/* Score Bar */}
            <div className="w-full bg-[#EAE3D2] h-2 rounded-full overflow-hidden border border-[#1A3629]/15 my-4">
              <div
                className="h-full bg-[#1A3629] transition-all duration-500 rounded-full"
                style={{ width: `${matrix.hearth.score}%` }}
              />
            </div>

            {/* Physiological Mechanism */}
            <p className="font-cabinet text-xs text-[#2C4A3B] leading-relaxed">
              {matrix.hearth.clinicalMechanism}
            </p>
          </div>

          {/* Prescriptive Action */}
          <div>
            {matrix.hearth.prescriptiveAction.actionType !== 'NONE' ? (
              <button
                type="button"
                onClick={() => handleAction(matrix.hearth)}
                className="w-full py-2.5 px-3 rounded-xl border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] font-mono text-xs font-bold shadow-[2px_2px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer text-center"
              >
                {matrix.hearth.prescriptiveAction.label} &rarr;
              </button>
            ) : (
              <div className="w-full py-2.5 px-3 rounded-xl border border-[#065F46]/25 bg-[#ECFDF5]/70 text-[#065F46] font-mono text-xs font-bold text-center flex items-center justify-center gap-1.5">
                <span>✓</span>
                <span>Deep Recovery Synced</span>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PILLAR 2: THE CANOPY (Cellular Synthesis & Hydration)                     */}
        {/* ========================================================================= */}
        <div className="p-6 sm:p-7 flex flex-col justify-between gap-6 hover:bg-[#FAF8F5]/60 transition-colors">
          <div className="flex flex-col">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#1A3629] text-[#FFFDF9] font-mono text-xs font-bold flex items-center justify-center shadow-[1px_1px_0px_#C9A84C]">
                  +
                </span>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#1A3629]">
                  THE CANOPY
                </span>
              </div>
              <span
                className={`font-mono text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${getBadgeStyle(
                  matrix.canopy.statusColor
                )}`}
              >
                {matrix.canopy.statusTier}
              </span>
            </div>

            {/* Metrics */}
            <div className="font-cabinet font-bold text-xl sm:text-2xl text-[#1A3629] tracking-tight">
              {matrix.canopy.primaryMetric}
            </div>
            <div className="font-mono text-xs text-[#4A5D4E] mt-0.5">
              {matrix.canopy.secondaryMetric}
            </div>

            {/* Score Bar */}
            <div className="w-full bg-[#EAE3D2] h-2 rounded-full overflow-hidden border border-[#1A3629]/15 my-4">
              <div
                className="h-full bg-[#1A3629] transition-all duration-500 rounded-full"
                style={{ width: `${matrix.canopy.score}%` }}
              />
            </div>

            {/* Physiological Mechanism */}
            <p className="font-cabinet text-xs text-[#2C4A3B] leading-relaxed">
              {matrix.canopy.clinicalMechanism}
            </p>
          </div>

          {/* Prescriptive Action */}
          <div>
            {matrix.canopy.prescriptiveAction.actionType !== 'NONE' ? (
              <button
                type="button"
                onClick={() => handleAction(matrix.canopy)}
                className="w-full py-2.5 px-3 rounded-xl border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] font-mono text-xs font-bold shadow-[2px_2px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer text-center"
              >
                {matrix.canopy.prescriptiveAction.label} &rarr;
              </button>
            ) : (
              <div className="w-full py-2.5 px-3 rounded-xl border border-[#065F46]/25 bg-[#ECFDF5]/70 text-[#065F46] font-mono text-xs font-bold text-center flex items-center justify-center gap-1.5">
                <span>✓</span>
                <span>Amino Acid Quota Met</span>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PILLAR 3: THE ATMOSPHERE (Circadian & Focus Alignment)                    */}
        {/* ========================================================================= */}
        <div className="p-6 sm:p-7 flex flex-col justify-between gap-6 hover:bg-[#FAF8F5]/60 transition-colors">
          <div className="flex flex-col">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#1A3629] text-[#FFFDF9] font-mono text-xs font-bold flex items-center justify-center shadow-[1px_1px_0px_#C9A84C]">
                  ◈
                </span>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#1A3629]">
                  ATMOSPHERE
                </span>
              </div>
              <span
                className={`font-mono text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${getBadgeStyle(
                  matrix.atmosphere.statusColor
                )}`}
              >
                {matrix.atmosphere.statusTier}
              </span>
            </div>

            {/* Metrics */}
            <div className="font-cabinet font-bold text-xl sm:text-2xl text-[#1A3629] tracking-tight">
              {matrix.atmosphere.primaryMetric}
            </div>
            <div className="font-mono text-xs text-[#4A5D4E] mt-0.5">
              {matrix.atmosphere.secondaryMetric}
            </div>

            {/* Score Bar */}
            <div className="w-full bg-[#EAE3D2] h-2 rounded-full overflow-hidden border border-[#1A3629]/15 my-4">
              <div
                className="h-full bg-[#1A3629] transition-all duration-500 rounded-full"
                style={{ width: `${matrix.atmosphere.score}%` }}
              />
            </div>

            {/* Physiological Mechanism */}
            <p className="font-cabinet text-xs text-[#2C4A3B] leading-relaxed">
              {matrix.atmosphere.clinicalMechanism}
            </p>
          </div>

          {/* Prescriptive Action */}
          <div>
            {matrix.atmosphere.prescriptiveAction.actionType !== 'NONE' ? (
              <button
                type="button"
                onClick={() => handleAction(matrix.atmosphere)}
                className="w-full py-2.5 px-3 rounded-xl border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] font-mono text-xs font-bold shadow-[2px_2px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer text-center"
              >
                {matrix.atmosphere.prescriptiveAction.label} &rarr;
              </button>
            ) : (
              <div className="w-full py-2.5 px-3 rounded-xl border border-[#065F46]/25 bg-[#ECFDF5]/70 text-[#065F46] font-mono text-xs font-bold text-center flex items-center justify-center gap-1.5">
                <span>✓</span>
                <span>Circadian Clock Locked</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <EveningWrapModal
        isOpen={isEveningOpen}
        onClose={() => setIsEveningOpen(false)}
      />
    </div>
  );
}
