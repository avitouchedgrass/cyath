'use client';

import React, { useMemo, useEffect } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { calculateWeeklyReclamation } from '@/lib/weeklyReclamationEngine';
import { retroAudio } from '@/lib/retroAudio';
import { getLocalWeekKey } from '@/lib/dateUtils';
import { exportClinicalDossierSummary } from '@/lib/exporters/dossierPdfExport';
import { X, Check, Printer } from 'lucide-react';

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
    claimedDossiersByWeek,
    claimWeeklyDossier,
    userProfile,
    weightHistory,
  } = useHabitStore();


  const currentWeekKey = useMemo(() => getLocalWeekKey(currentDate), [currentDate]);
  const isAlreadyClaimed = !!claimedDossiersByWeek[currentWeekKey];

  const report = useMemo(() => {
    return calculateWeeklyReclamation({
      currentDate,
      logsByDate,
      deskRitualsByDate,
      protocolsAcceptedByDate: dailyProtocolsAcceptedByDate,
      lookbackDays: 7,
    });
  }, [currentDate, logsByDate, deskRitualsByDate, dailyProtocolsAcceptedByDate]);

  const modalRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleClaim = () => {
    if (isAlreadyClaimed) {
      onClose();
      return;
    }
    retroAudio.playTierUpgrade();
    claimWeeklyDossier(currentWeekKey);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dossier-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A3629]/30 backdrop-blur-xs animate-in fade-in"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="w-full max-w-2xl bg-[#FFFDF9] border border-[#1A3629]/15 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(26,54,41,0.14)] max-h-[90vh] overflow-y-auto flex flex-col gap-6 outline-none"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#1A3629]/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1A3629]" />
              <span className="font-mono text-xs font-semibold text-[#4A5D4E]">
                7-Day Consistency Review
              </span>
            </div>
            <h2 id="dossier-modal-title" className="font-cabinet font-extrabold text-2xl sm:text-3xl text-[#1A3629] mt-1 tracking-tight">
              Weekly Review &amp; Energy Impact
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#4A5D4E] mt-0.5">
              Correlating daily foundational habits against recorded afternoon energy dips.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#1A3629]/15 bg-[#FAF8F5] text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9] transition-colors flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Core Metric Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-2xl border border-[#1A3629]/10 bg-[#FAF8F5] flex flex-col">
            <span className="font-mono text-[11px] font-bold text-[#4A5D4E]">
              Focus Hours Reclaimed
            </span>
            <span className="font-cabinet font-extrabold text-2xl sm:text-3xl text-[#1A3629] mt-1 tabular-nums">
              +{report.focusHoursReclaimed}h
            </span>
            <span className="font-sans text-[11px] text-[#4A5D4E] mt-0.5">
              High-clarity cognitive output
            </span>
          </div>

          <div className="p-4 rounded-2xl border border-[#1A3629]/10 bg-[#FAF8F5] flex flex-col">
            <span className="font-mono text-[11px] font-bold text-[#4A5D4E]">
              2 PM Slump Reduction
            </span>
            <span className="font-cabinet font-extrabold text-2xl sm:text-3xl text-[#1A3629] mt-1 tabular-nums">
              -{report.slumpReductionPercent}%
            </span>
            <span className="font-sans text-[11px] text-[#4A5D4E] mt-0.5">
              Avg {report.averageCompliantSlump}/10 vs {report.averageBaselineSlump}/10 baseline
            </span>
          </div>

          <div className="p-4 rounded-2xl border border-[#1A3629]/10 bg-[#FAF8F5] flex flex-col">
            <span className="font-mono text-[11px] font-bold text-[#4A5D4E]">
              Habit Days Completed
            </span>
            <span className="font-cabinet font-extrabold text-2xl sm:text-3xl text-[#1A3629] mt-1 tabular-nums">
              {report.protocolsCommittedCount} / 7
            </span>
            <span className="font-sans text-[11px] text-[#4A5D4E] mt-0.5">
              Days foundational levers logged
            </span>
          </div>
        </div>

        {/* 7-Day Micro-Timeline Breakdown */}
        <div className="p-4 rounded-2xl border border-[#1A3629]/10 bg-[#FAF8F5] flex flex-col gap-2.5">
          <span className="font-mono text-[11px] font-bold text-[#4A5D4E]">
            Day-by-Day Habit Execution
          </span>
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {report.dailyBreakdown.map((d) => (
              <div
                key={d.date}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-between gap-1 text-xs transition-colors ${
                  d.protocolCommitted
                    ? 'border-[#1A3629]/20 bg-[#FFFDF9]'
                    : 'border-[#1A3629]/8 bg-[#FAF8F5]'
                }`}
              >
                <span className="font-mono text-[10px] font-semibold text-[#1A3629]/70">
                  {d.dayName}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    d.protocolCommitted ? 'bg-[#1A3629]' : 'bg-[#1A3629]/20'
                  }`}
                />
                <span className="font-mono text-[10px] font-semibold text-[#1A3629]">
                  {d.slumpScore !== undefined ? `${d.slumpScore}/10` : '-'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Insights */}
        <div className="space-y-2">
          <span className="font-mono text-[11px] font-bold text-[#4A5D4E]">
            Observed Energy Insights
          </span>
          <div className="space-y-2">
            {report.insights.map((insight, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-[#1A3629]/10 bg-[#FAF8F5] text-xs font-sans font-medium text-[#1A3629] flex items-start gap-2.5"
              >
                <Check className="w-3.5 h-3.5 text-[#1A3629] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{insight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next 7-Day Progression */}
        <div className="p-4 rounded-2xl border border-[#1A3629]/15 bg-[#FAF8F5] flex flex-col gap-1">
          <span className="font-mono text-[11px] font-bold text-[#4A5D4E]">
            Suggested Focus for Next Week
          </span>
          <p className="font-cabinet text-xs font-semibold text-[#1A3629] leading-relaxed">
            {report.nextWeekAction}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1A3629]/10 gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-[#1A3629]/15 bg-[#FAF8F5] font-cabinet text-xs font-bold text-[#1A3629] hover:bg-[#F5F1EA] cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => {
                retroAudio.playInspectConfirm();
                exportClinicalDossierSummary({
                  userProfile,
                  weightHistory: weightHistory || [],
                  logsByDate,
                  currentDate,
                });
              }}
              className="px-3.5 py-2 rounded-full border border-[#1A3629]/20 bg-[#FFFDF9] hover:bg-[#FAF6EE] text-[#1A3629] font-cabinet text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#1A3629]" />
              <span>Export Summary</span>
            </button>
          </div>

          {isAlreadyClaimed ? (
            <div className="px-5 py-2 rounded-full border border-[#1A3629]/15 bg-[#FAF8F5] text-[#1A3629] font-cabinet text-xs font-bold flex items-center gap-1.5">
              <span>✓</span>
              <span>Weekly Review Sealed (+100 XP Claimed)</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleClaim}
              className="px-6 py-2.5 rounded-full bg-[#1A3629] hover:bg-[#2C4A3B] text-[#FFFDF9] font-cabinet text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              Seal Weekly Review (+100 XP) →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
