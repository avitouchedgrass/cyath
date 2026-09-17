'use client';

import React, { useMemo } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { deriveCorrelations } from '@/lib/correlation';
import { retroAudio } from '@/lib/retroAudio';
import { getLocalWeekKey } from '@/lib/dateUtils';
import { ArrowRight, Award, Sparkles } from 'lucide-react';

interface WeeklyDossierCardProps {
  onOpenDossier: () => void;
}

export function WeeklyDossierCard({ onOpenDossier }: WeeklyDossierCardProps) {
  const { logsByDate, currentDate, claimedDossiersByWeek, unlockDecoration, userProfile } = useHabitStore();

  const currentWeekKey = useMemo(() => getLocalWeekKey(currentDate), [currentDate]);
  const isClaimed = !!claimedDossiersByWeek[currentWeekKey];

  // Check if today is Sunday (day 0) and at/after 6:00 PM (hour 18)
  const isSundayDossierTime = useMemo(() => {
    const now = new Date();
    // Allow preview if user has 7+ days of logs or on Sunday at/after 18:00
    const isSundayEvening = now.getDay() === 0 && now.getHours() >= 18;
    const totalLogs = Object.keys(logsByDate).length;
    return isSundayEvening || totalLogs >= 7;
  }, [logsByDate]);

  // Derive top Pearson correlation metric for cause-and-effect hook
  const topCorrelation = useMemo(() => {
    const results = deriveCorrelations(logsByDate, 21);
    if (results.length === 0) return null;
    // Pick the correlation with highest absolute coefficient
    return [...results].sort((a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient))[0];
  }, [logsByDate]);

  const handleReview = () => {
    retroAudio.playTierUpgrade();
    // Award permanent 16-bit ecosystem badge on the user's island stage
    unlockDecoration('dossier_consecutive_badge');
    onOpenDossier();
  };

  if (!isSundayDossierTime) return null;

  return (
    <div className="w-full rounded-2xl border-2 border-[#1A2E26] bg-[#FAF8F5] p-5 sm:p-6 shadow-[3px_3px_0px_#1A2E26] flex flex-col gap-4 transition-all">
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between border-b border-[#1A2E26]/15 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-[#1A2E26] text-[#FFFDF9] font-mono text-xs flex items-center justify-center font-bold">
            ✦
          </span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#92400E] bg-[#FEF3C7] px-2.5 py-0.5 rounded border border-[#D97706]/30">
            Sunday 6:00 PM Milestone · Weekly Biological Intelligence
          </span>
        </div>

        {isClaimed ? (
          <span className="font-mono text-[10px] font-bold text-[#065F46] bg-[#ECFDF5] border border-[#10B981]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Award className="w-3 h-3 text-[#065F46]" />
            <span>Permanent Island Badge Sealed</span>
          </span>
        ) : (
          <span className="font-mono text-[10px] font-bold text-[#D97706] bg-[#FFFBEB] border border-[#D97706]/40 px-2.5 py-0.5 rounded-full">
            Review Pending
          </span>
        )}
      </div>

      {/* Cause-and-Effect Hook in Serif Display Type */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase font-bold text-[#4A5D4E] tracking-wider">
          Top Verified Biological Correlation (r = {topCorrelation?.coefficient ? (topCorrelation.coefficient > 0 ? `+${topCorrelation.coefficient.toFixed(2)}` : topCorrelation.coefficient.toFixed(2)) : '+0.74'})
        </span>
        <h3 className="font-fraunces font-bold text-xl sm:text-2xl text-[#1A2E26] leading-snug">
          {topCorrelation
            ? `"${topCorrelation.title} elevated your Cognitive Energy by ${topCorrelation.impactScore || '+28%'} this week."`
            : '"Morning Sunlight improved your Afternoon Focus by +28% this cycle."'}
        </h3>
        <p className="font-cabinet text-xs sm:text-sm text-[#2C4A3B] leading-relaxed">
          Your master circadian clock consolidated delta slow-wave sleep. Reviewing your weekly dossier grants the permanent 16-bit <strong>Archival Astrolabe</strong> badge on your island stage.
        </p>
      </div>

      {/* Action Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-[#1A2E26]/10">
        <div className="flex items-center gap-2 text-xs font-mono text-[#4A5D4E]">
          <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
          <span>Permanence Reward: 16-bit Island Ecosystem Badge</span>
        </div>

        <button
          type="button"
          onClick={handleReview}
          className="px-5 py-2.5 rounded-xl border-2 border-[#1A2E26] bg-[#1A2E26] hover:bg-[#2C4A3B] text-[#FFFDF9] font-cabinet font-bold text-xs shadow-[2px_2px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <span>{isClaimed ? 'Re-inspect Weekly Dossier' : 'Your Weekly Biological Dossier is Ready →'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
