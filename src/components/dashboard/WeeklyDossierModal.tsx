'use client';

import React, { useMemo } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { calculateWeeklyReclamation } from '@/lib/weeklyReclamationEngine';
import { retroAudio } from '@/lib/retroAudio';
import { xpParticleEmitter } from '@/lib/particleEmitter';

interface WeeklyDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WeeklyDossierModal({ isOpen, onClose }: WeeklyDossierModalProps) {
  const {
    currentDate,
    logsByDate,
    deskRitualsByDate,
    dailyProtocolsAcceptedByDate,
    gainXp,
  } = useHabitStore();

  const report = useMemo(() => {
    return calculateWeeklyReclamation({
      currentDate,
      logsByDate,
      deskRitualsByDate,
      protocolsAcceptedByDate: dailyProtocolsAcceptedByDate,
      lookbackDays: 7,
    });
  }, [currentDate, logsByDate, deskRitualsByDate, dailyProtocolsAcceptedByDate]);

  if (!isOpen) return null;

  const handleClaim = () => {
    retroAudio.playTierUpgrade();
    xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 15);
    gainXp(100, 'Weekly Energy Dossier Reviewed');
    onClose();
  };

  const getGradeBadge = (grade: string) => {
    if (grade.startsWith('A')) {
      return 'bg-[#ECFDF5] text-[#065F46] border-[#065F46]/30';
    }
    if (grade.startsWith('B')) {
      return 'bg-[#FEF3C7] text-[#92400E] border-[#92400E]/30';
    }
    return 'bg-[#F1F5F9] text-[#475569] border-[#475569]/30';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A3629]/50 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-2xl bg-[#FFFDF9] border-2 border-[#1A3629] rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_#1A3629] max-h-[90vh] overflow-y-auto flex flex-col gap-6"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b-2 border-[#1A3629]/15">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#1A3629]/70">
                7-DAY RECLAMATION DOSSIER
              </span>
            </div>
            <h2 className="font-fraunces font-black text-2xl sm:text-3xl text-[#1A3629] mt-1.5 tracking-tight">
              Weekly Energy Audit &amp; Impact
            </h2>
            <p className="font-cabinet text-xs sm:text-sm font-medium text-[#2C4A3B] mt-0.5">
              Correlating daily circadian protocols against recorded afternoon energy dips.
            </p>
          </div>

          <div
            className={`px-3 py-1.5 rounded-xl border-2 font-mono font-black text-base ${getGradeBadge(
              report.consistencyGrade
            )} shrink-0 shadow-[2px_2px_0px_#1A3629]`}
          >
            Grade {report.consistencyGrade}
          </div>
        </div>

        {/* Core Metric Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-2xl border border-[#1A3629]/20 bg-[#F4EFE6] flex flex-col">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1A3629]/60">
              Focus Hours Reclaimed
            </span>
            <span className="font-fraunces font-black text-2xl sm:text-3xl text-[#1A3629] mt-1 tabular-nums">
              +{report.focusHoursReclaimed}h
            </span>
            <span className="font-cabinet text-xs text-[#2C4A3B] mt-0.5">
              High-clarity cognitive output
            </span>
          </div>

          <div className="p-4 rounded-2xl border border-[#1A3629]/20 bg-[#F4EFE6] flex flex-col">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1A3629]/60">
              2 PM Slump Reduction
            </span>
            <span className="font-fraunces font-black text-2xl sm:text-3xl text-[#065F46] mt-1 tabular-nums">
              -{report.slumpReductionPercent}%
            </span>
            <span className="font-cabinet text-xs text-[#2C4A3B] mt-0.5">
              Avg {report.averageCompliantSlump}/10 vs {report.averageBaselineSlump}/10 baseline
            </span>
          </div>

          <div className="p-4 rounded-2xl border border-[#1A3629]/20 bg-[#F4EFE6] flex flex-col">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1A3629]/60">
              Directives Locked
            </span>
            <span className="font-fraunces font-black text-2xl sm:text-3xl text-[#1A3629] mt-1 tabular-nums">
              {report.protocolsCommittedCount} / 7
            </span>
            <span className="font-cabinet text-xs text-[#2C4A3B] mt-0.5">
              Days protocol executed
            </span>
          </div>
        </div>

        {/* 7-Day Micro-Timeline Breakdown */}
        <div className="p-4 rounded-2xl border border-[#1A3629]/20 bg-[#FAF8F5] flex flex-col gap-2.5">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1A3629]/60">
            Day-by-Day Protocol Log
          </span>
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {report.dailyBreakdown.map((d) => (
              <div
                key={d.date}
                className={`p-2 rounded-xl border flex flex-col items-center justify-between gap-1 text-xs transition-colors ${
                  d.protocolCommitted
                    ? 'border-[#065F46]/30 bg-[#ECFDF5]'
                    : 'border-[#1A3629]/15 bg-[#FFFDF9]'
                }`}
              >
                <span className="font-mono text-[10px] font-bold text-[#1A3629]/70">
                  {d.dayName}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    d.protocolCommitted ? 'bg-[#065F46]' : 'bg-[#1A3629]/25'
                  }`}
                />
                <span className="font-mono text-[10px] font-bold text-[#1A3629]">
                  {d.slumpScore !== undefined ? `${d.slumpScore}/10` : '-'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Insights */}
        <div className="space-y-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1A3629]/60">
            Observed Biological Correlations
          </span>
          <div className="space-y-2">
            {report.insights.map((insight, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-[#1A3629]/15 bg-[#FFFDF9] text-xs font-cabinet font-medium text-[#2C4A3B] flex items-start gap-2.5"
              >
                <span className="text-[#065F46] font-bold mt-0.5">✓</span>
                <span className="leading-relaxed">{insight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next 7-Day Recommended Progression */}
        <div className="p-4 rounded-2xl border-2 border-[#1A3629] bg-[#EAE3D2] flex flex-col gap-1">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1A3629]">
            NEXT 7-DAY PROGRESSION DIRECTIVE
          </span>
          <p className="font-cabinet text-xs font-bold text-[#1A3629] leading-relaxed">
            {report.nextWeekAction}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1A3629]/15">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#1A3629]/30 bg-[#FFFDF9] font-mono text-xs font-bold text-[#1A3629] hover:bg-[#FAF8F5] cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleClaim}
            className="px-6 py-2.5 rounded-xl border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] font-mono text-xs font-bold shadow-[2px_2px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
          >
            Seal Weekly Dossier (+100 XP) →
          </button>
        </div>
      </div>
    </div>
  );
}
