'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { DebriefQuestion, loadDebriefQuestions, saveDebriefQuestions } from '@/lib/debriefQuestions';
import { PixelPushpin } from '@/components/dashboard/PixelPushpin';
import { PixelSpark } from '@/components/common/PixelSpark';
import { calculateProteinRebalance } from '@/lib/metabolicRebalancer';
import { CustomQuestionManager } from '@/components/debrief/CustomQuestionManager';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { calculateBiometricXp } from '@/lib/biometricXp';
import { downloadReceiptPng, shareReceiptImage, ReceiptExportData } from '@/lib/exporters/receiptCanvasExport';
import { getIslandTier } from '@/lib/progression/config';
import { calculateLevel } from '@/lib/progression/engine';
import {
  PixelSun,
  PixelCloud,
  PixelPin,
  PixelX,
  PixelCheck,
  PixelChevronLeft,
  PixelArrowRight,
  PixelMoon,
  PixelFlame,
  PixelClock,
  PixelUpload,
  PixelCopy,
  PixelTrophy,
  PixelEgg,
  PixelSteak,
  PixelFish,
  PixelStopwatch,
  PixelHourglass,
  PixelSparkles,
} from '@/components/common/PixelIcons';
import { parseInstantMeal } from '@/lib/instantMacroEngine';

interface DebriefMealEstimatorProps {
  mealLabel: 'Breakfast' | 'Lunch' | 'Dinner';
  targetGrams: number;
  currentFuel: string;
  onApplyEstimate: (mealName: string, protein: number, calories: number, hitTarget: boolean) => void;
}

function DebriefMealEstimator({
  mealLabel,
  targetGrams,
  currentFuel,
  onApplyEstimate,
}: DebriefMealEstimatorProps) {
  const [query, setQuery] = useState(currentFuel || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{ mealName: string; protein: number; calories: number } | null>(null);
  const { logMealToDay, currentDate } = useHabitStore();

  const handleEstimate = async () => {
    const text = query.trim();
    if (!text || isAnalyzing) return;
    setIsAnalyzing(true);
    haptics.tap();

    const instant = parseInstantMeal(text);
    if (instant && !instant.isNotFood && instant.protein > 0) {
      retroAudio.playInspectConfirm();
      haptics.success();
      const res = {
        mealName: instant.mealName || text,
        protein: instant.protein,
        calories: instant.calories,
      };
      setResult(res);
      logMealToDay(
        {
          name: res.mealName,
          protein: res.protein,
          calories: res.calories,
          ingredients: instant.ingredients,
          suggestedSprite: instant.suggestedSprite || '/assets/food/generic-plate.png',
          mealSlot: mealLabel.toLowerCase() as any,
        },
        currentDate
      );
      onApplyEstimate(res.mealName, res.protein, res.calories, res.protein >= targetGrams);
      setIsAnalyzing(false);
      return;
    }

    try {
      const res = await fetch('/api/ai/parse-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const data = await res.json();
        const protein = Number(data.protein) || 25;
        const calories = Number(data.calories) || 350;
        const parsedName = data.mealName || text;
        const output = { mealName: parsedName, protein, calories };
        setResult(output);
        retroAudio.playInspectConfirm();
        haptics.success();
        logMealToDay(
          {
            name: parsedName,
            protein,
            calories,
            ingredients: data.ingredients || [{ item: text, amount: '1 portion' }],
            suggestedSprite: data.suggestedSprite || '/assets/food/generic-plate.png',
            mealSlot: mealLabel.toLowerCase() as any,
          },
          currentDate
        );
        onApplyEstimate(parsedName, protein, calories, protein >= targetGrams);
      } else {
        throw new Error('AI parse fallback');
      }
    } catch {
      const fallbackProtein = 26;
      const fallbackCalories = 360;
      setResult({ mealName: text, protein: fallbackProtein, calories: fallbackCalories });
      retroAudio.playInspectConfirm();
      haptics.success();
      logMealToDay(
        {
          name: text,
          protein: fallbackProtein,
          calories: fallbackCalories,
          ingredients: [{ item: text, amount: '1 portion' }],
          suggestedSprite: '/assets/food/generic-plate.png',
          mealSlot: mealLabel.toLowerCase() as any,
        },
        currentDate
      );
      onApplyEstimate(text, fallbackProtein, fallbackCalories, fallbackProtein >= targetGrams);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#1A3629]/15 shadow-2xs flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="font-cabinet font-extrabold text-xs text-[#1A3629] flex items-center gap-1.5">
          <PixelSparkles size={14} color="#B8862D" />
          <span>Not sure how much protein your meal had?</span>
        </span>
        <span className="font-mono text-[10px] text-[#4A5D4E]">
          Target: {targetGrams}g+
        </span>
      </div>
      <p className="font-sans text-[11px] text-[#4A5D4E] leading-tight">
        Type what you ate in plain English. The natural AI macro engine estimates grams and auto-selects your target button.
      </p>
      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleEstimate();
            }
          }}
          placeholder={
            mealLabel === 'Breakfast'
              ? 'e.g. 3 eggs scrambled, 2 slices toast, glass of milk...'
              : mealLabel === 'Lunch'
              ? 'e.g. Grilled chicken breast, cup of white rice, broccoli...'
              : 'e.g. 200g salmon fillet, sweet potato, green salad...'
          }
          className="flex-1 px-3 py-2 rounded-xl border border-[#1A3629]/25 bg-[#FAF8F5] text-xs font-cabinet font-bold text-[#1A3629] focus:outline-none focus:border-[#1A3629]"
        />
        <button
          type="button"
          onClick={handleEstimate}
          disabled={isAnalyzing || !query.trim()}
          className="px-3.5 py-2 rounded-xl bg-[#1A3629] hover:bg-[#2C4A3B] text-[#FFFDF9] font-cabinet font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 shrink-0 flex items-center gap-1 shadow-2xs"
        >
          <span>{isAnalyzing ? 'Estimating...' : 'Calculate'}</span>
        </button>
      </div>
      {result && (
        <div className="p-2 rounded-xl bg-[#1A3629]/5 border border-[#1A3629]/15 flex items-center justify-between text-xs animate-in fade-in">
          <span className="font-mono font-bold text-[#1A3629]">
            Calculated: ~{result.protein}g Protein ({result.calories} kcal)
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              result.protein >= targetGrams ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}
          >
            {result.protein >= targetGrams ? 'Target Hit!' : 'Light / Below Target'}
          </span>
        </div>
      )}
    </div>
  );
}

interface DailyDebriefRightDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLedger: () => void;
  onRequireAuth?: () => void;
}

const SAWTOOTH_CLIP =
  'polygon(0% 0%, 100% 0%, 100% calc(100% - 6px), 95% 100%, 90% calc(100% - 6px), 85% 100%, 80% calc(100% - 6px), 75% 100%, 70% calc(100% - 6px), 65% 100%, 60% calc(100% - 6px), 55% 100%, 50% calc(100% - 6px), 45% 100%, 40% calc(100% - 6px), 35% 100%, 30% calc(100% - 6px), 25% 100%, 20% calc(100% - 6px), 15% 100%, 10% calc(100% - 6px), 5% 100%, 0% calc(100% - 6px))';

export function DailyDebriefRightDrawer({
  isOpen,
  onClose,
  onOpenLedger,
  onRequireAuth,
}: DailyDebriefRightDrawerProps) {
  const {
    currentDate,
    totalXp,
    getDailyLog,
    userProfile,
    userSession,
    isLedgerSealedByDate,
    isLedgerPartiallySealedByDate,
    dailyDebriefLog,
    sealDailyLedger,
    amendDebriefMeals,
    gainXp,
    commitDebriefTelemetry,
    logMealToDay,
    pendingTrophyUnlock,
    dismissPendingTrophy,
  } = useHabitStore();

  const isAuthenticated = !!userSession && !userSession.id.startsWith('guest_');

  const [questions, setQuestions] = useState<DebriefQuestion[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [hasPinnedReceipt, setHasPinnedReceipt] = useState(false);

  // Form responses state
  const [sleepTime, setSleepTime] = useState(userProfile?.bedTime || '23:30');
  const [wakeTime, setWakeTime] = useState(userProfile?.wakeTime || '07:30');
  const [morningRestedRating, setMorningRestedRating] = useState<number>(8);
  const [wakeConsistencyAnchor, setWakeConsistencyAnchor] = useState<boolean>(true);
  const [sunlightDone, setSunlightDone] = useState<boolean | null>(null);
  const [sunlightMinutes, setSunlightMinutes] = useState<number>(15);
  const [breakfastDone, setBreakfastDone] = useState<boolean | 'not_yet' | null>(null);
  const [breakfastFuel, setBreakfastFuel] = useState<string>('');
  const [lunchDone, setLunchDone] = useState<boolean | 'not_yet' | null>(null);
  const [lunchFuel, setLunchFuel] = useState<string>('');
  const [dinnerDone, setDinnerDone] = useState<boolean | 'not_yet' | null>(null);
  const [dinnerFuel, setDinnerFuel] = useState<string>('');
  const [caffeineDone, setCaffeineDone] = useState<boolean | null>(null);
  const [caffeineTime, setCaffeineTime] = useState<string>('Before 12:00 PM');
  const [customAnswers, setCustomAnswers] = useState<Record<string, boolean>>({});
  const [isSealingInProgress, setIsSealingInProgress] = useState(false);
  const [sealingStepIdx, setSealingStepIdx] = useState(-1);
  const [isAmendingMeals, setIsAmendingMeals] = useState(false);
  const [amendLunchFuel, setAmendLunchFuel] = useState('');
  const [amendLunchDone, setAmendLunchDone] = useState<boolean | null>(null);
  const [amendDinnerFuel, setAmendDinnerFuel] = useState('');
  const [amendDinnerDone, setAmendDinnerDone] = useState<boolean | null>(null);

  useEffect(() => {
    setQuestions(loadDebriefQuestions());
  }, []);

  const currentLog = getDailyLog(currentDate);

  // Sync state dynamically when drawer is open or meals update
  useEffect(() => {
    if (!isOpen) return;
    const debrief = (dailyDebriefLog && dailyDebriefLog[currentDate]) || {};
    const meals = currentLog?.loggedMeals || [];

    if (debrief.breakfastFuel) {
      setBreakfastFuel(String(debrief.breakfastFuel));
      setBreakfastDone(true);
    } else {
      const bMeal = meals.find((m) => (m.mealSlot || '').toLowerCase() === 'breakfast' || (m.name || '').toLowerCase().includes('breakfast'));
      if (bMeal) {
        setBreakfastFuel(bMeal.name);
        setBreakfastDone((bMeal.protein || 0) >= 30);
      }
    }

    if (debrief.lunchFuel) {
      setLunchFuel(String(debrief.lunchFuel));
      setLunchDone(true);
    } else {
      const lMeal = meals.find((m) => (m.mealSlot || '').toLowerCase() === 'lunch' || (m.name || '').toLowerCase().includes('lunch'));
      if (lMeal) {
        setLunchFuel(lMeal.name);
        setLunchDone((lMeal.protein || 0) >= 40);
      }
    }

    if (debrief.dinnerFuel) {
      setDinnerFuel(String(debrief.dinnerFuel));
      setDinnerDone(true);
    } else {
      const dMeal = meals.find((m) => (m.mealSlot || '').toLowerCase() === 'dinner' || (m.name || '').toLowerCase().includes('dinner'));
      if (dMeal) {
        setDinnerFuel(dMeal.name);
        setDinnerDone((dMeal.protein || 0) >= 35);
      }
    }
  }, [isOpen, currentDate, currentLog?.loggedMeals, dailyDebriefLog]);

  useEffect(() => {
    const handleCloseDrawers = () => {
      onClose();
    };
    window.addEventListener('cyath-close-drawers', handleCloseDrawers);
    return () => window.removeEventListener('cyath-close-drawers', handleCloseDrawers);
  }, [onClose]);

  const enabledQuestions = useMemo(() => {
    return questions.filter((q) => q.enabled);
  }, [questions]);

  const isTodaySealed = !!isLedgerSealedByDate[currentDate];

  // Calculate hours slept
  const calculatedSleepDuration = useMemo(() => {
    try {
      const [sh, sm] = sleepTime.split(':').map(Number);
      const [wh, wm] = wakeTime.split(':').map(Number);
      let sleepMinutes = (wh * 60 + wm) - (sh * 60 + sm);
      if (sleepMinutes < 0) sleepMinutes += 24 * 60;
      return Number((sleepMinutes / 60).toFixed(1));
    } catch {
      return 8.0;
    }
  }, [sleepTime, wakeTime]);

  const biometricXp = useMemo(() => {
    const customCount = Object.values(customAnswers).filter(Boolean).length;
    return calculateBiometricXp({
      sleepDurationHours: calculatedSleepDuration,
      sunlightSecured: sunlightDone,
      sunlightMinutes,
      breakfastDone,
      lunchDone,
      dinnerDone,
      caffeineRespected: caffeineDone,
      customHabitsCompletedCount: customCount,
      morningRestedRating,
      wakeConsistencyAnchor,
    });
  }, [calculatedSleepDuration, sunlightDone, sunlightMinutes, breakfastDone, lunchDone, dinnerDone, caffeineDone, customAnswers, morningRestedRating, wakeConsistencyAnchor]);

  const handleUpdateQuestions = (updated: DebriefQuestion[]) => {
    setQuestions(updated);
    saveDebriefQuestions(updated);
  };

  const currentQ = enabledQuestions[activeStepIndex];

  const canProceed = useMemo(() => {
    if (!currentQ) return true;
    if (currentQ.id === 'sleep_wake') {
      return !!sleepTime && !!wakeTime;
    }
    if (currentQ.id === 'sunlight') {
      return sunlightDone !== null;
    }
    if (currentQ.id === 'breakfast_protein') {
      return breakfastDone !== null || breakfastFuel.trim().length > 0;
    }
    if (currentQ.id === 'lunch_protein') {
      return lunchDone !== null || lunchFuel.trim().length > 0;
    }
    if (currentQ.id === 'dinner_protein') {
      return dinnerDone !== null || dinnerFuel.trim().length > 0;
    }
    if (currentQ.id === 'caffeine_cutoff') {
      return caffeineDone !== null;
    }
    return customAnswers[currentQ.id] !== undefined;
  }, [currentQ, sleepTime, wakeTime, sunlightDone, breakfastDone, breakfastFuel, lunchDone, lunchFuel, dinnerDone, dinnerFuel, caffeineDone, customAnswers]);

  const handleNext = () => {
    if (!canProceed) return;
    retroAudio.playInspectConfirm();
    haptics.tap();
    if (activeStepIndex < enabledQuestions.length) {
      setActiveStepIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    retroAudio.playBlip();
    haptics.tap();
    if (activeStepIndex > 0) {
      setActiveStepIndex((prev) => prev - 1);
    }
  };

  const isPendingMeals = lunchDone === 'not_yet' || dinnerDone === 'not_yet';
  const isPartiallySealed =
    !!isLedgerPartiallySealedByDate?.[currentDate] ||
    (isTodaySealed && (lunchDone === 'not_yet' || dinnerDone === 'not_yet'));

  const handleSaveDraft = () => {
    let totalEstimatedProtein = 0;
    if (breakfastDone === true) totalEstimatedProtein += 38;
    if (lunchDone === true) totalEstimatedProtein += 45;
    if (dinnerDone === true) totalEstimatedProtein += 40;

    commitDebriefTelemetry(currentDate, {
      sleepHours: calculatedSleepDuration,
      sunlightDone: !!sunlightDone,
      proteinGrams: totalEstimatedProtein > 0 ? totalEstimatedProtein : undefined,
      caffeineCutoffRespected: !!caffeineDone,
      caffeineStatus: caffeineDone ? 'before_cutoff' : 'after_cutoff',
      debriefData: {
        sleepTime,
        wakeTime,
        morningRestedRating,
        wakeConsistencyAnchor,
        sunlightMinutes,
        breakfastFuel,
        lunchFuel,
        dinnerFuel,
        caffeineTime,
        customAnswers,
        isDraft: true,
      },
    });
    retroAudio.playInspectConfirm();
    haptics.success();
    onClose();
  };

  const handleFinishAndSeal = async (forcePartial?: boolean) => {
    if (isSealingInProgress) return;
    const shouldBePartial = forcePartial !== undefined ? forcePartial : isPendingMeals;
    if (isTodaySealed || isLedgerSealedByDate[currentDate]) {
      setHasPinnedReceipt(true);
      return;
    }
    setIsSealingInProgress(true);

    let totalEstimatedProtein = 0;
    if (breakfastDone === true) totalEstimatedProtein += 38;
    if (lunchDone === true) totalEstimatedProtein += 45;
    if (dinnerDone === true) totalEstimatedProtein += 40;

    commitDebriefTelemetry(currentDate, {
      sleepHours: calculatedSleepDuration,
      sunlightDone: !!sunlightDone,
      proteinGrams: totalEstimatedProtein > 0 ? totalEstimatedProtein : undefined,
      caffeineCutoffRespected: !!caffeineDone,
      caffeineStatus: caffeineDone ? 'before_cutoff' : 'after_cutoff',
      debriefData: {
        sleepTime,
        wakeTime,
        morningRestedRating,
        wakeConsistencyAnchor,
        sunlightMinutes,
        breakfastFuel,
        lunchFuel,
        dinnerFuel,
        caffeineTime,
        customAnswers,
        isPartialSeal: shouldBePartial,
      },
    });

    const stepItems: Array<{ amount: number; reason: string; suite: 'circadian' | 'iron' | 'focus' }> = [
      { amount: biometricXp.sleepXp, reason: `Sleep (${calculatedSleepDuration}h · ${biometricXp.sleepEfficacyLabel})`, suite: 'circadian' },
      ...(biometricXp.morningRestedXp > 0 ? [{ amount: biometricXp.morningRestedXp, reason: `Morning Rested Score (${morningRestedRating}/10)`, suite: 'circadian' as const }] : []),
      ...(biometricXp.wakeConsistencyXp > 0 ? [{ amount: biometricXp.wakeConsistencyXp, reason: 'Wake Time On Schedule', suite: 'circadian' as const }] : []),
      ...(sunlightDone ? [{ amount: biometricXp.sunlightXp, reason: `Morning Sunlight (${sunlightMinutes}m)`, suite: 'circadian' as const }] : []),
      ...(breakfastDone === true ? [{ amount: biometricXp.breakfastXp, reason: 'High-Protein Breakfast (30g+)', suite: 'iron' as const }] : []),
      ...(breakfastDone === 'not_yet' ? [{ amount: biometricXp.breakfastXp, reason: 'Breakfast Fasting Window Logged', suite: 'iron' as const }] : []),
      ...(lunchDone === true ? [{ amount: biometricXp.lunchXp, reason: 'High-Protein Lunch (40g+)', suite: 'iron' as const }] : []),
      ...(lunchDone === 'not_yet' ? [{ amount: biometricXp.lunchXp, reason: 'Lunch Pending', suite: 'iron' as const }] : []),
      ...(dinnerDone === true ? [{ amount: biometricXp.dinnerXp, reason: 'High-Protein Dinner (35g+)', suite: 'iron' as const }] : []),
      ...(dinnerDone === 'not_yet' ? [{ amount: biometricXp.dinnerXp, reason: 'Dinner Pending', suite: 'iron' as const }] : []),
      ...(caffeineDone ? [{ amount: biometricXp.caffeineXp, reason: `Caffeine Cutoff Kept (${caffeineTime})`, suite: 'focus' as const }] : []),
      ...(biometricXp.customHabitsXp > 0 ? [{ amount: biometricXp.customHabitsXp, reason: 'Custom Habits Completed', suite: 'focus' as const }] : []),
      { amount: biometricXp.baseSealXp, reason: shouldBePartial ? 'Daily Log Saved (Pending Meals)' : 'Daily Log Saved', suite: (userProfile?.selectedIslandSuite || userProfile?.archetype || 'circadian') as any },
    ];

    for (let i = 0; i < stepItems.length; i++) {
      setSealingStepIdx(i);
      retroAudio.playBlip();
      haptics.tap();
      gainXp(stepItems[i].amount, stepItems[i].reason, 'ledger_seal', stepItems[i].suite);
      await new Promise((resolve) => setTimeout(resolve, 320));
    }

    sealDailyLedger(currentDate, 0, [], shouldBePartial);
    retroAudio.playTierUpgrade();
    haptics.heavy();
    setHasPinnedReceipt(true);
    setIsSealingInProgress(false);
  };

  const handleAmendMeals = async () => {
    setIsSealingInProgress(true);
    const updates: {
      lunch?: { name: string; protein: number; calories: number; hitTarget: boolean };
      dinner?: { name: string; protein: number; calories: number; hitTarget: boolean };
    } = {};

    if (amendLunchFuel.trim().length > 0) {
      const isTarget = amendLunchDone ?? true;
      updates.lunch = {
        name: amendLunchFuel.trim(),
        protein: isTarget ? 40 : 20,
        calories: 450,
        hitTarget: isTarget,
      };
      setLunchFuel(amendLunchFuel.trim());
      setLunchDone(isTarget);
    }

    if (amendDinnerFuel.trim().length > 0) {
      const isTarget = amendDinnerDone ?? true;
      updates.dinner = {
        name: amendDinnerFuel.trim(),
        protein: isTarget ? 35 : 20,
        calories: 500,
        hitTarget: isTarget,
      };
      setDinnerFuel(amendDinnerFuel.trim());
      setDinnerDone(isTarget);
    }

    if (Object.keys(updates).length > 0) {
      await amendDebriefMeals(currentDate, updates);
      setHasPinnedReceipt(true);
    }
    setIsAmendingMeals(false);
    setIsSealingInProgress(false);
  };

  const [copiedShare, setCopiedShare] = useState(false);

  const userTargetProtein = userProfile?.targetProteinGrams || (userProfile?.weightKg ? Math.round(userProfile.weightKg * 1.6) : 100);
  const bProteinEst = breakfastDone === true ? 30 : (breakfastDone === false ? 10 : 0);
  const lProteinEst = lunchDone === true ? 40 : (lunchDone === false ? 15 : 0);
  const dProteinEst = dinnerDone === true ? 35 : (dinnerDone === false ? 15 : 0);

  const proteinRebalance = useMemo(() => {
    return calculateProteinRebalance({
      dailyTarget: userTargetProtein,
      breakfastProtein: bProteinEst,
      lunchProtein: lProteinEst,
      dinnerProtein: dProteinEst,
    });
  }, [userTargetProtein, bProteinEst, lProteinEst, dProteinEst]);

  const progress = calculateLevel(totalXp);
  const currentIsland = getIslandTier(progress.level, userProfile?.selectedIslandSuite || userProfile?.archetype);

  const getExportData = (): ReceiptExportData => {
    return {
      date: currentDate,
      level: progress.level,
      islandName: currentIsland.name,
      islandImageUrl: currentIsland.pngImage || currentIsland.image,
      sleepDuration: calculatedSleepDuration,
      sunlightDone,
      breakfastDone,
      breakfastFuel,
      lunchDone,
      lunchFuel,
      dinnerDone,
      dinnerFuel,
      dinnerXp: biometricXp.dinnerXp,
      caffeineDone,
      caffeineTime,
      customHabitsCompletedCount: Object.values(customAnswers).filter(Boolean).length,
      sleepXp: biometricXp.sleepXp,
      sunlightXp: biometricXp.sunlightXp,
      breakfastXp: biometricXp.breakfastXp,
      lunchXp: biometricXp.lunchXp,
      caffeineXp: biometricXp.caffeineXp,
      customHabitsXp: biometricXp.customHabitsXp,
      baseSealXp: biometricXp.baseSealXp,
      totalXp: biometricXp.totalXp,
    };
  };

  const handleDownloadReceiptCard = async () => {
    retroAudio.playInspectConfirm();
    haptics.tap();
    useHabitStore.getState().unlockTrophy('thermal_receipt');
    await downloadReceiptPng(getExportData(), `cyath-receipt-${currentDate}.png`);
  };

  const handleShareReceipt = async () => {
    retroAudio.playInspectConfirm();
    haptics.tap();
    useHabitStore.getState().unlockTrophy('thermal_receipt');
    const res = await shareReceiptImage(getExportData());
    if (res.method === 'native') return;

    const shareText = `Cyath Daily Summary · ${currentDate}\n` +
      `• Sleep: ${calculatedSleepDuration}h (+${biometricXp.sleepXp} XP)\n` +
      `• Morning Sunlight: ${sunlightDone ? 'Done' : 'Missed'} (+${biometricXp.sunlightXp} XP)\n` +
      `• Breakfast: ${breakfastFuel ? breakfastFuel : (breakfastDone === true ? 'Hit (30g+)' : breakfastDone === 'not_yet' ? 'Haven\'t Eaten Yet' : 'Skipped / Light')} (+${biometricXp.breakfastXp} XP)\n` +
      `• Lunch: ${lunchFuel ? lunchFuel : (lunchDone === true ? 'Hit (40g+)' : lunchDone === 'not_yet' ? 'Haven\'t Eaten Yet' : 'Skipped / Light')} (+${biometricXp.lunchXp} XP)\n` +
      `• Dinner: ${dinnerFuel ? dinnerFuel : (dinnerDone === true ? 'Hit (35g+)' : dinnerDone === 'not_yet' ? 'Haven\'t Eaten Yet' : 'Skipped / Light')} (+${biometricXp.dinnerXp} XP)\n` +
      `• Caffeine Cutoff: ${caffeineDone ? caffeineTime : 'Past Cutoff'} (+${biometricXp.caffeineXp} XP)\n` +
      `• Total Earned: +${biometricXp.totalXp} XP\n` +
      `Status: Logged & Saved\n` +
      `Track your daily habits at cyath.space`;

    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {}
  };

  const isFinalStep = activeStepIndex === enabledQuestions.length;

  return (
    <>
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 pointer-events-none ${
          isOpen ? 'bg-black/40 backdrop-blur-xs pointer-events-auto' : 'bg-transparent'
        }`}
        onClick={onClose}
      />

      <aside
        id="tour-seal-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Daily Check-in"
        className={`fixed top-0 right-0 bottom-0 z-50 w-full sm:max-w-xl md:max-w-2xl bg-[#F4F0EA] border-l-2 border-[#1A3629] shadow-[-16px_0_40px_rgba(26,54,41,0.2)] transition-transform duration-300 ease-out flex flex-col justify-between overflow-hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Top Header Bar */}
        <div className="w-full flex items-center justify-between px-6 py-5 border-b border-[#1A3629]/15 bg-[#FFFDF9]/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="flex flex-col">
              <span className="font-cabinet font-extrabold text-sm text-[#1A3629] tracking-tight uppercase">
                Daily Check-in
              </span>
              <span className="font-mono text-[10px] text-[#4A5D4E]">
                {currentDate} · Today&apos;s Review
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCustomizeOpen(true)}
              className="p-2 rounded-xl border border-[#1A3629]/20 bg-[#FAF8F5] text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9] transition-colors cursor-pointer"
              title="Customize Daily Questions"
              aria-label="Customize Daily Questions"
            >
              <PixelClock size={14} color="currentColor" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border border-[#1A3629]/20 bg-[#FAF8F5] text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9] transition-colors cursor-pointer"
              aria-label="Close debrief drawer"
            >
              <PixelX size={14} color="currentColor" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col justify-center max-w-xl mx-auto w-full">
          {/* ============================================================== */}
          {/* CASE A: ALREADY COMPLETED TODAY                                */}
          {/* ============================================================== */}
          {isTodaySealed && !hasPinnedReceipt ? (
            <div className="flex flex-col items-center text-center gap-6 animate-in fade-in duration-200">
              <div className="relative">
                <PixelPushpin size={42} animate={false} />
              </div>

              <div className="flex flex-col gap-1.5">
                <h2 className="font-cabinet font-extrabold text-2xl sm:text-3xl text-[#1A3629] tracking-tight">
                  Today&apos;s Log is Saved
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#4A5D4E] max-w-sm">
                  You have already completed today&apos;s check-in. Your daily summary is saved. Rest well tonight.
                </p>
              </div>

              {/* Pinned Receipt Preview */}
              <div
                className="w-full max-w-sm bg-[#FFFDF9] border border-[#1A3629]/20 p-6 shadow-[4px_6px_20px_rgba(26,54,41,0.08)] relative"
                style={{ clipPath: SAWTOOTH_CLIP }}
              >
                <div className="absolute top-2 left-1/2 -translate-x-1/2">
                  <PixelPushpin size={28} animate={false} />
                </div>

                <div className="flex flex-col gap-3 font-mono text-xs text-[#1A3629] pt-4">
                  <div className="border-b border-dashed border-[#1A3629]/20 pb-2 text-center">
                    <span className="font-bold uppercase tracking-wider text-[11px]">
                      Cyath Daily Summary
                    </span>
                    <span className="block text-[10px] text-[#4A5D4E]">{currentDate}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#4A5D4E]">Sleep</span>
                    <span className="font-bold">{currentLog?.sleepHours ? `${currentLog.sleepHours}h` : `${calculatedSleepDuration}h`}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#4A5D4E]">Morning Sunlight</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      {(currentLog?.habitsCompleted?.sunlight || sunlightDone) && <PixelCheck size={11} color="#047857" />}
                      <span>{currentLog?.habitsCompleted?.sunlight || sunlightDone ? 'Done' : 'Recorded'}</span>
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#4A5D4E]">Protein Target</span>
                    <span className="font-bold text-emerald-700">
                      {currentLog?.totalProteinLogged ? `${currentLog.totalProteinLogged}g Logged` : `${userTargetProtein}g Target`}
                    </span>
                  </div>

                  {breakfastFuel && (
                    <div className="flex justify-between">
                      <span className="text-[#4A5D4E]">Breakfast</span>
                      <span className="font-bold text-right truncate max-w-[180px]" title={breakfastFuel}>{breakfastFuel}</span>
                    </div>
                  )}

                  {lunchFuel && (
                    <div className="flex justify-between">
                      <span className="text-[#4A5D4E]">Lunch</span>
                      <span className="font-bold text-right truncate max-w-[180px]" title={lunchFuel}>{lunchFuel}</span>
                    </div>
                  )}

                  <div className="border-t border-dashed border-[#1A3629]/20 pt-2 flex justify-between font-bold">
                    <span>Status</span>
                    <span className={isPartiallySealed ? 'text-amber-700 uppercase flex items-center gap-1 text-[11px]' : 'text-emerald-700 uppercase flex items-center gap-1 text-[11px]'}>
                      {isPartiallySealed ? (
                        <>
                          <PixelHourglass size={12} color="#B45309" />
                          <span>Partial · Pending Meals</span>
                        </>
                      ) : (
                        <>
                          <PixelCheck size={12} color="#047857" />
                          <span>Completed</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amend Debrief Banner if lunch or dinner was pending */}
              {isPartiallySealed && (
                <div className="w-full max-w-sm p-4 rounded-2xl bg-[#FFF9E6] border-2 border-[#B8862D] text-[#5C4312] flex flex-col gap-2.5 shadow-[2px_2px_0px_#B8862D] text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-cabinet font-extrabold text-xs">
                      <PixelHourglass size={14} color="#B8862D" />
                      <span>Pending Meals on Daily Record</span>
                    </div>
                    <span className="font-mono text-[9px] bg-[#B8862D]/20 text-[#8A6520] px-2 py-0.5 rounded font-black uppercase">
                      Update
                    </span>
                  </div>
                  <p className="font-sans text-[11px] text-[#5C4312]/90">
                    You checked in earlier before eating lunch or dinner. Eaten your meal now? Update your entry and claim up to <strong>+50 XP</strong>!
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      retroAudio.playInspectConfirm();
                      haptics.tap();
                      setIsAmendingMeals(true);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#B8862D] text-[#FFFDF9] font-cabinet font-extrabold text-xs hover:bg-[#A37424] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <PixelSparkles size={14} color="#FFFDF9" />
                    <span>Ate Lunch or Dinner? Add Them Now (+XP) →</span>
                  </button>
                </div>
              )}

              {/* Inline Amend Meals Panel */}
              {isAmendingMeals && (
                <div className="w-full max-w-sm p-4 rounded-2xl bg-[#FFFDF9] border-2 border-[#1A3629] shadow-[4px_4px_0px_#1A3629] flex flex-col gap-3.5 text-left animate-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-[#1A3629]/15 pb-2">
                    <span className="font-cabinet font-extrabold text-xs text-[#1A3629] flex items-center gap-1.5">
                      <PixelSparkles size={14} color="#B8862D" />
                      <span>Log Remaining Meals for {currentDate}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAmendingMeals(false)}
                      className="p-1 rounded-lg hover:bg-black/5 text-[#1A3629] cursor-pointer"
                    >
                      <PixelX size={13} color="currentColor" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="font-mono text-[10px] font-bold text-[#4A5D4E] uppercase">
                      Lunch
                    </span>
                    <DebriefMealEstimator
                      mealLabel="Lunch"
                      targetGrams={40}
                      currentFuel={amendLunchFuel || lunchFuel}
                      onApplyEstimate={(name, protein, calories, hitTarget) => {
                        setAmendLunchFuel(name);
                        setAmendLunchDone(hitTarget);
                        setLunchFuel(name);
                        setLunchDone(hitTarget);
                      }}
                    />
                    <input
                      type="text"
                      value={amendLunchFuel}
                      onChange={(e) => setAmendLunchFuel(e.target.value)}
                      placeholder="e.g. Chicken breast bowl, salmon, tuna poke..."
                      className="w-full px-3 py-2 rounded-xl border border-[#1A3629]/25 bg-[#FAF8F5] text-xs font-cabinet font-bold text-[#1A3629] focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="font-mono text-[10px] font-bold text-[#4A5D4E] uppercase">
                      Dinner
                    </span>
                    <DebriefMealEstimator
                      mealLabel="Dinner"
                      targetGrams={35}
                      currentFuel={amendDinnerFuel || dinnerFuel}
                      onApplyEstimate={(name, protein, calories, hitTarget) => {
                        setAmendDinnerFuel(name);
                        setAmendDinnerDone(hitTarget);
                        setDinnerFuel(name);
                        setDinnerDone(hitTarget);
                      }}
                    />
                    <input
                      type="text"
                      value={amendDinnerFuel}
                      onChange={(e) => setAmendDinnerFuel(e.target.value)}
                      placeholder="e.g. Grilled salmon, steak, dal & roti..."
                      className="w-full px-3 py-2 rounded-xl border border-[#1A3629]/25 bg-[#FAF8F5] text-xs font-cabinet font-bold text-[#1A3629] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#1A3629]/15">
                    <button
                      type="button"
                      onClick={() => setIsAmendingMeals(false)}
                      className="w-1/3 py-2.5 rounded-xl border border-[#1A3629]/20 font-cabinet font-bold text-xs text-[#1A3629] hover:bg-[#FAF8F5] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAmendMeals}
                      disabled={isSealingInProgress || (!amendLunchFuel.trim() && !amendDinnerFuel.trim())}
                      className="w-2/3 py-2.5 rounded-xl bg-[#1A3629] text-[#FFFDF9] font-cabinet font-extrabold text-xs hover:bg-[#2C4A3B] transition-colors cursor-pointer shadow-[2px_2px_0px_#2C5E43] disabled:opacity-50"
                    >
                      <span>{isSealingInProgress ? 'Saving...' : 'Save &amp; Claim XP'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5 w-full max-w-sm mt-2">
                {!isAuthenticated && (
                  <div className="w-full p-3 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 flex items-center justify-between gap-2 shadow-2xs">
                    <div className="flex flex-col text-left">
                      <span className="font-cabinet font-bold text-xs">Guest Record Saved Locally</span>
                      <span className="font-mono text-[10px] text-amber-800">Sync with cloud to protect your streak</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        retroAudio.playInspectConfirm();
                        haptics.tap();
                        if (onRequireAuth) onRequireAuth();
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs hover:bg-[#2C4A3B] transition-colors cursor-pointer shrink-0"
                    >
                      Sync Cloud
                    </button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
                  <button
                    type="button"
                    onClick={handleDownloadReceiptCard}
                    className="w-full sm:w-1/2 py-3.5 px-3 rounded-2xl border-2 border-[#1A3629] bg-[#FAF8F5] text-[#1A3629] font-cabinet font-extrabold text-xs hover:bg-[#FAF6EE] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#1A3629]"
                  >
                    <PixelUpload size={14} color="#1A3629" />
                    <span>Download PNG</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareReceipt}
                    className="w-full sm:w-1/2 py-3.5 px-3 rounded-2xl border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] font-cabinet font-extrabold text-xs hover:bg-[#2C4A3B] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#2C5E43]"
                  >
                    <PixelCopy size={14} color="#FFFDF9" />
                    <span>{copiedShare ? 'Copied Link!' : 'Share Card'}</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
                  <button
                    type="button"
                    onClick={() => setIsCustomizeOpen(true)}
                    className="w-full sm:w-1/2 py-3 px-3 rounded-2xl border border-[#1A3629]/20 bg-[#FFFDF9] text-[#1A3629] font-cabinet font-bold text-xs hover:bg-[#FAF8F5] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <PixelClock size={14} color="#1A3629" />
                    <span>Customize</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenLedger();
                    }}
                    className="w-full sm:w-1/2 py-3 px-3 rounded-2xl bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs hover:bg-[#2C4A3B] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#2C5E43]"
                  >
                    <span>View Ledger →</span>
                  </button>
                </div>
              </div>
            </div>
          ) : hasPinnedReceipt ? (
            /* ============================================================== */
            /* CASE B: JUST PINNED RECEIPT (VICTORY MOMENT)                   */
            /* ============================================================== */
            <div className="flex flex-col items-center text-center gap-6 animate-in zoom-in-95 duration-250">
              <div className="relative">
                <PixelPushpin size={48} animate={true} />
              </div>

              <div className="flex flex-col gap-1">
                <h2 className="font-cabinet font-extrabold text-2xl sm:text-3xl text-[#1A3629] tracking-tight">
                  Day Saved &amp; Logged!
                </h2>
                <p className="font-sans text-xs text-[#4A5D4E]">
                  Your daily review has been saved to your log book.
                </p>
              </div>

              {/* Stamped Receipt */}
              <div
                className="w-full max-w-sm bg-[#FFFDF9] border-2 border-[#1A3629] p-6 shadow-[6px_8px_0px_#1A3629] relative animate-in slide-in-from-bottom-4 duration-300"
                style={{ clipPath: SAWTOOTH_CLIP }}
              >
                <div className="absolute top-2 left-1/2 -translate-x-1/2">
                  <PixelPushpin size={30} animate={true} />
                </div>

                <div className="flex flex-col gap-3 font-mono text-xs text-[#1A3629] pt-4">
                  <div className="border-b border-dashed border-[#1A3629]/20 pb-2 text-center">
                    <span className="font-bold uppercase tracking-wider text-xs">
                      Official Sanctuary Receipt
                    </span>
                    <span className="block text-[10px] text-[#4A5D4E]">{currentDate}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#4A5D4E]">Circadian Sleep</span>
                    <span className="font-bold flex items-center gap-1.5">
                      <span>{calculatedSleepDuration}h</span>
                      <span className="text-[#B8862D] font-mono text-[10px]">+{biometricXp.sleepXp} XP</span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#4A5D4E]">Morning Light</span>
                    <span className="font-bold flex items-center gap-1.5">
                      <span className={sunlightDone ? 'text-emerald-700 flex items-center gap-1' : 'text-[#4A5D4E]'}>
                        {sunlightDone && <PixelCheck size={11} color="#047857" />}
                        <span>{sunlightDone ? 'Anchored' : 'Skipped'}</span>
                      </span>
                      <span className="text-[#B8862D] font-mono text-[10px]">+{biometricXp.sunlightXp} XP</span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#4A5D4E]">Breakfast Fuel</span>
                    <span className="font-bold flex items-center gap-1.5 text-right">
                      <span className="truncate max-w-[140px]" title={breakfastFuel || undefined}>
                        {breakfastFuel ? breakfastFuel : (breakfastDone === true ? 'Hit (30g+)' : breakfastDone === 'not_yet' ? 'Haven\'t Eaten Yet' : 'Light / Skip')}
                      </span>
                      <span className="text-[#B8862D] font-mono text-[10px] shrink-0">+{biometricXp.breakfastXp} XP</span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#4A5D4E]">Lunch Fuel</span>
                    <span className="font-bold flex items-center gap-1.5 text-right">
                      <span className="truncate max-w-[140px]" title={lunchFuel || undefined}>
                        {lunchFuel ? lunchFuel : (lunchDone === true ? 'Hit (40g+)' : lunchDone === 'not_yet' ? 'Haven\'t Eaten Yet' : 'Light / Skip')}
                      </span>
                      <span className="text-[#B8862D] font-mono text-[10px] shrink-0">+{biometricXp.lunchXp} XP</span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#4A5D4E]">Dinner Fuel</span>
                    <span className="font-bold flex items-center gap-1.5 text-right">
                      <span className="truncate max-w-[140px]" title={dinnerFuel || undefined}>
                        {dinnerFuel ? dinnerFuel : (dinnerDone === true ? 'Hit (35g+)' : dinnerDone === 'not_yet' ? 'Haven\'t Eaten Yet' : 'Light / Skip')}
                      </span>
                      <span className="text-[#B8862D] font-mono text-[10px] shrink-0">+{biometricXp.dinnerXp} XP</span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#4A5D4E]">Caffeine Air-Lock</span>
                    <span className="font-bold flex items-center gap-1.5">
                      <span className={caffeineDone ? 'text-emerald-700 flex items-center gap-1' : 'text-[#4A5D4E]'}>
                        {caffeineDone && <PixelCheck size={11} color="#047857" />}
                        <span>{caffeineDone ? 'Respected' : 'Past cutoff'}</span>
                      </span>
                      <span className="text-[#B8862D] font-mono text-[10px]">+{biometricXp.caffeineXp} XP</span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#4A5D4E]">Daily Wrap &amp; Seal</span>
                    <span className="font-bold flex items-center gap-1.5">
                      <span className="text-emerald-700 flex items-center gap-1">
                        <PixelPin size={11} color="#047857" />
                        <span>Anchored</span>
                      </span>
                      <span className="text-[#B8862D] font-mono text-[10px]">+{biometricXp.baseSealXp} XP</span>
                    </span>
                  </div>

                  <div className="border-t border-dashed border-[#1A3629]/20 pt-2 flex justify-between font-bold text-sm">
                    <span>Total Earned</span>
                    <span className="text-[#B8862D]">+{biometricXp.totalXp} XP</span>
                  </div>
                </div>
              </div>

              {/* Amend Debrief Banner if lunch or dinner was pending */}
              {isPartiallySealed && (
                <div className="w-full max-w-sm p-4 rounded-2xl bg-[#FFF9E6] border-2 border-[#B8862D] text-[#5C4312] flex flex-col gap-2.5 shadow-[2px_2px_0px_#B8862D] text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-cabinet font-extrabold text-xs">
                      <PixelHourglass size={14} color="#B8862D" />
                      <span>Pending Meals on Daily Record</span>
                    </div>
                    <span className="font-mono text-[9px] bg-[#B8862D]/20 text-[#8A6520] px-2 py-0.5 rounded font-black uppercase">
                      Amendable
                    </span>
                  </div>
                  <p className="font-sans text-[11px] text-[#5C4312]/90">
                    You sealed early with lunch or dinner uneaten. Eaten your meal now? Update your entry and claim up to <strong>+50 XP</strong>!
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      retroAudio.playInspectConfirm();
                      haptics.tap();
                      setIsAmendingMeals(true);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#B8862D] text-[#FFFDF9] font-cabinet font-extrabold text-xs hover:bg-[#A37424] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <PixelSparkles size={14} color="#FFFDF9" />
                    <span>Ate Lunch / Dinner? Amend Debrief (+XP) →</span>
                  </button>
                </div>
              )}

              {/* Inline Amend Meals Panel */}
              {isAmendingMeals && (
                <div className="w-full max-w-sm p-4 rounded-2xl bg-[#FFFDF9] border-2 border-[#1A3629] shadow-[4px_4px_0px_#1A3629] flex flex-col gap-3.5 text-left animate-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-[#1A3629]/15 pb-2">
                    <span className="font-cabinet font-extrabold text-xs text-[#1A3629] flex items-center gap-1.5">
                      <PixelSparkles size={14} color="#B8862D" />
                      <span>Log Remaining Meals for {currentDate}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAmendingMeals(false)}
                      className="p-1 rounded-lg hover:bg-black/5 text-[#1A3629] cursor-pointer"
                    >
                      <PixelX size={13} color="currentColor" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="font-mono text-[10px] font-bold text-[#4A5D4E] uppercase">
                      Midday Lunch Fuel
                    </span>
                    <DebriefMealEstimator
                      mealLabel="Lunch"
                      targetGrams={40}
                      currentFuel={amendLunchFuel || lunchFuel}
                      onApplyEstimate={(name, protein, calories, hitTarget) => {
                        setAmendLunchFuel(name);
                        setAmendLunchDone(hitTarget);
                      }}
                    />
                    <input
                      type="text"
                      value={amendLunchFuel}
                      onChange={(e) => setAmendLunchFuel(e.target.value)}
                      placeholder="e.g. Chicken breast bowl, salmon, tuna poke..."
                      className="w-full px-3 py-2 rounded-xl border border-[#1A3629]/25 bg-[#FAF8F5] text-xs font-cabinet font-bold text-[#1A3629] focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="font-mono text-[10px] font-bold text-[#4A5D4E] uppercase">
                      Nightcap Dinner Fuel
                    </span>
                    <DebriefMealEstimator
                      mealLabel="Dinner"
                      targetGrams={35}
                      currentFuel={amendDinnerFuel || dinnerFuel}
                      onApplyEstimate={(name, protein, calories, hitTarget) => {
                        setAmendDinnerFuel(name);
                        setAmendDinnerDone(hitTarget);
                      }}
                    />
                    <input
                      type="text"
                      value={amendDinnerFuel}
                      onChange={(e) => setAmendDinnerFuel(e.target.value)}
                      placeholder="e.g. Grilled salmon, steak, dal & roti..."
                      className="w-full px-3 py-2 rounded-xl border border-[#1A3629]/25 bg-[#FAF8F5] text-xs font-cabinet font-bold text-[#1A3629] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#1A3629]/15">
                    <button
                      type="button"
                      onClick={() => setIsAmendingMeals(false)}
                      className="w-1/3 py-2.5 rounded-xl border border-[#1A3629]/20 font-cabinet font-bold text-xs text-[#1A3629] hover:bg-[#FAF8F5] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAmendMeals}
                      disabled={isSealingInProgress || (!amendLunchFuel.trim() && !amendDinnerFuel.trim())}
                      className="w-2/3 py-2.5 rounded-xl bg-[#1A3629] text-[#FFFDF9] font-cabinet font-extrabold text-xs hover:bg-[#2C4A3B] transition-colors cursor-pointer shadow-[2px_2px_0px_#2C5E43] disabled:opacity-50"
                    >
                      <span>{isSealingInProgress ? 'Saving...' : 'Save &amp; Claim XP'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Unlocked Trophy Alert if earned during sealing */}
              {pendingTrophyUnlock && (
                <div
                  onClick={() => {
                    onClose();
                    dismissPendingTrophy();
                    const el = document.getElementById('specimen-reliquary');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full max-w-sm p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 font-cabinet text-xs font-bold flex items-center justify-between gap-2 shadow-[2px_2px_0px_#B45309] cursor-pointer hover:bg-amber-100 transition-colors animate-pulse"
                >
                  <div className="flex items-center gap-2">
                    <PixelTrophy size={16} color="#B45309" />
                    <span>Trophy Unlocked: {pendingTrophyUnlock.title}!</span>
                  </div>
                  <span className="font-mono text-[10px] text-amber-800 underline shrink-0">View Trophy &rarr;</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5 w-full max-w-sm mt-2">
                {!isAuthenticated && (
                  <div className="w-full p-3 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 flex items-center justify-between gap-2 shadow-2xs">
                    <div className="flex flex-col text-left">
                      <span className="font-cabinet font-bold text-xs">Guest Record Saved Locally</span>
                      <span className="font-mono text-[10px] text-amber-800">Sync with cloud to protect your streak</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        retroAudio.playInspectConfirm();
                        haptics.tap();
                        if (onRequireAuth) onRequireAuth();
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs hover:bg-[#2C4A3B] transition-colors cursor-pointer shrink-0"
                    >
                      Sync Cloud
                    </button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
                  <button
                    type="button"
                    onClick={handleDownloadReceiptCard}
                    className="w-full sm:w-1/2 py-3.5 px-3 rounded-2xl border-2 border-[#1A3629] bg-[#FAF8F5] text-[#1A3629] font-cabinet font-extrabold text-xs hover:bg-[#FAF6EE] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#1A3629]"
                  >
                    <PixelUpload size={14} color="#1A3629" />
                    <span>Download PNG</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareReceipt}
                    className="w-full sm:w-1/2 py-3.5 px-3 rounded-2xl border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] font-cabinet font-extrabold text-xs hover:bg-[#2C4A3B] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#2C5E43]"
                  >
                    <PixelCopy size={14} color="#FFFDF9" />
                    <span>{copiedShare ? 'Copied Link!' : 'Share Card'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenLedger();
                  }}
                  className="w-full py-3 px-4 rounded-2xl border border-[#1A3629]/20 bg-[#FFFDF9] text-[#1A3629] font-cabinet font-bold text-xs hover:bg-[#FAF8F5] transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>Inspect in 30-Day Ledger →</span>
                </button>
              </div>
            </div>
          ) : (
            /* ============================================================== */
            /* CASE C: ACTIVE TURN-BY-TURN QUESTION DECK                      */
            /* ============================================================== */
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              {/* Progress Indicator */}
              <div className="flex items-center justify-between border-b border-[#1A3629]/10 pb-3">
                <span className="font-mono text-xs font-bold text-[#4A5D4E] uppercase tracking-wider">
                  Checkpoint {activeStepIndex + 1} of {enabledQuestions.length}
                </span>
                <span className="font-mono text-xs font-bold text-[#1A3629]">
                  +{currentQ?.xpReward || 35} XP
                </span>
              </div>

              {/* CARD 1: SLEEP & WAKE */}
              {currentQ?.id === 'sleep_wake' && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] font-bold text-[#B8862D] uppercase tracking-wider flex items-center gap-1.5">
                      <PixelMoon size={14} color="#B8862D" />
                      <span>Sleep</span>
                    </span>
                    <h3 className="font-cabinet font-extrabold text-2xl text-[#1A3629] tracking-tight">
                      What time did you sleep &amp; wake up?
                    </h3>
                    <p className="font-sans text-xs text-[#4A5D4E]">
                      {currentQ.scientificContext}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#FFFDF9] border border-[#1A3629]/15">
                    <div className="flex flex-col gap-1.5">
                      <span className="font-mono text-[10px] font-bold text-[#4A5D4E] uppercase">
                        Slept Yesterday
                      </span>
                      <input
                        type="time"
                        value={sleepTime}
                        onChange={(e) => setSleepTime(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#1A3629]/20 rounded-xl px-3 py-2 font-mono text-sm font-bold text-[#1A3629] focus:outline-none focus:border-[#1A3629]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="font-mono text-[10px] font-bold text-[#4A5D4E] uppercase">
                        Woke Up Today
                      </span>
                      <input
                        type="time"
                        value={wakeTime}
                        onChange={(e) => setWakeTime(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#1A3629]/20 rounded-xl px-3 py-2 font-mono text-sm font-bold text-[#1A3629] focus:outline-none focus:border-[#1A3629]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#1A3629]/5 border border-[#1A3629]/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#4A5D4E] font-medium">Calculated Sleep Duration:</span>
                      <span className="font-mono text-xs font-bold text-[#1A3629]">
                        {calculatedSleepDuration} Hours Slept
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1.5 border-t border-[#1A3629]/10">
                      <span className="font-cabinet font-bold text-xs text-[#1A3629]">
                        {biometricXp.sleepEfficacyLabel}
                      </span>
                      <span className="font-mono text-xs font-black text-[#B8862D]">
                        +{biometricXp.sleepXp} XP
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1 text-[9px] font-mono text-center pt-1">
                      <span className={`py-1 rounded ${calculatedSleepDuration < 5.5 ? 'bg-amber-200 text-amber-900 font-bold' : 'bg-black/5 text-[#4A5D4E]'}`}>
                        &lt;5.5h (0-8 XP)
                      </span>
                      <span className={`py-1 rounded ${calculatedSleepDuration >= 5.5 && calculatedSleepDuration < 6.5 ? 'bg-amber-200 text-amber-900 font-bold' : 'bg-black/5 text-[#4A5D4E]'}`}>
                        5.5-6.4h (18 XP)
                      </span>
                      <span className={`py-1 rounded ${calculatedSleepDuration >= 6.5 && calculatedSleepDuration < 7.3 ? 'bg-emerald-200 text-emerald-900 font-bold' : 'bg-black/5 text-[#4A5D4E]'}`}>
                        6.5-7.2h (32 XP)
                      </span>
                      <span className={`py-1 rounded ${calculatedSleepDuration >= 7.3 && calculatedSleepDuration <= 8.5 ? 'bg-emerald-300 text-emerald-950 font-black ring-1 ring-emerald-700' : 'bg-black/5 text-[#4A5D4E]'}`}>
                        7.3-8.5h (45 XP Max)
                      </span>
                      <span className={`py-1 rounded ${calculatedSleepDuration > 8.5 ? 'bg-emerald-200 text-emerald-900 font-bold' : 'bg-black/5 text-[#4A5D4E]'}`}>
                        &gt;8.5h (20-35 XP)
                      </span>
                    </div>

                    {/* Additional Circadian Rested & Consistency Touchpoints */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-[#1A3629]/15">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-[#4A5D4E] uppercase">
                          Morning Energy Level
                        </span>
                        <span className="font-mono text-[10px] text-[#B8862D] font-bold">
                          +{biometricXp.morningRestedXp} XP
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { rating: 4, label: 'Tired (4/10)', xp: 6 },
                          { rating: 7, label: 'Alert (7/10)', xp: 12 },
                          { rating: 9, label: 'Energized (9/10)', xp: 20 },
                        ].map((btn) => (
                          <button
                            key={btn.rating}
                            type="button"
                            onClick={() => setMorningRestedRating(btn.rating)}
                            className={`py-2 px-1.5 rounded-xl border text-[11px] font-cabinet font-bold transition-all cursor-pointer text-center ${
                              morningRestedRating === btn.rating
                                ? 'border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] shadow-xs'
                                : 'border-[#1A3629]/20 bg-[#FAF8F5] text-[#1A3629] hover:bg-[#FAF6EE]'
                            }`}
                          >
                            <span>{btn.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#1A3629]/15">
                      <div className="flex flex-col text-left">
                        <span className="font-cabinet font-bold text-xs text-[#1A3629]">
                          Consistent Wake Time
                        </span>
                        <span className="font-mono text-[10px] text-[#4A5D4E]">
                          Woke within ±30m of usual schedule
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setWakeConsistencyAnchor(!wakeConsistencyAnchor)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          wakeConsistencyAnchor
                            ? 'border-emerald-700 bg-emerald-100 text-emerald-950 font-black'
                            : 'border-[#1A3629]/20 bg-[#FAF8F5] text-[#4A5D4E]'
                        }`}
                      >
                        <PixelCheck size={12} color={wakeConsistencyAnchor ? '#047857' : '#4A5D4E'} />
                        <span>{wakeConsistencyAnchor ? 'On Time (+20 XP)' : 'Off Schedule (+0 XP)'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD 2: MORNING SUNLIGHT */}
              {currentQ?.id === 'sunlight' && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] font-bold text-[#B8862D] uppercase tracking-wider flex items-center gap-1.5">
                      <PixelSun size={14} color="#B8862D" />
                      <span>Morning Sunlight</span>
                    </span>
                    <h3 className="font-cabinet font-extrabold text-2xl text-[#1A3629] tracking-tight">
                      Did you get 10m of morning sunlight?
                    </h3>
                    <p className="font-sans text-xs text-[#4A5D4E]">
                      {currentQ.scientificContext}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setSunlightDone(true)}
                      className={`p-5 rounded-2xl border-2 font-cabinet font-extrabold text-sm transition-all cursor-pointer flex flex-col items-center gap-2 ${
                        sunlightDone === true
                          ? 'border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] shadow-[3px_3px_0px_#2C5E43]'
                          : 'border-[#1A3629]/20 bg-[#FFFDF9] text-[#1A3629] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <PixelSun size={24} color={sunlightDone === true ? '#FEF08A' : '#F59E0B'} />
                      <span>Yes, Caught Sunlight</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSunlightDone(false)}
                      className={`p-5 rounded-2xl border-2 font-cabinet font-extrabold text-sm transition-all cursor-pointer flex flex-col items-center gap-2 ${
                        sunlightDone === false
                          ? 'border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] shadow-[3px_3px_0px_#2C5E43]'
                          : 'border-[#1A3629]/20 bg-[#FFFDF9] text-[#1A3629] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <PixelCloud size={24} color={sunlightDone === false ? '#FFFDF9' : '#64748B'} />
                      <span>Stayed Indoors</span>
                    </button>
                  </div>

                  {sunlightDone === true && (
                    <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#FFFDF9] border border-[#1A3629]/15">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-[#4A5D4E] font-bold">
                          Sunlight Exposure Duration:
                        </span>
                        <span className="font-mono text-xs font-bold text-[#B8862D]">
                          +{biometricXp.sunlightXp} XP ({biometricXp.sunlightEfficacyLabel})
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { minutes: 20, label: '20m+ (Peak Lux)' },
                          { minutes: 15, label: '10–19m (Optimal)' },
                          { minutes: 5, label: '5–9m (Priming)' },
                        ].map((opt) => (
                          <button
                            key={opt.minutes}
                            type="button"
                            onClick={() => setSunlightMinutes(opt.minutes)}
                            className={`px-2 py-1.5 rounded-lg border text-[11px] font-cabinet font-bold cursor-pointer transition-all ${
                              sunlightMinutes === opt.minutes
                                ? 'border-[#1A3629] bg-[#1A3629] text-[#FFFDF9]'
                                : 'border-[#1A3629]/15 bg-[#FAF8F5] text-[#1A3629] hover:bg-[#FAF6EE]'
                            }`}
                          >
                            <span>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CARD 3: BREAKFAST PROTEIN */}
              {currentQ?.id === 'breakfast_protein' && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] font-bold text-[#B8862D] uppercase tracking-wider flex items-center gap-1.5">
                      <PixelFlame size={14} color="#EA580C" />
                      <span>Breakfast</span>
                    </span>
                    <h3 className="font-cabinet font-extrabold text-2xl text-[#1A3629] tracking-tight">
                      Did you hit your breakfast protein target (30g+)?
                    </h3>
                    <p className="font-sans text-xs text-[#4A5D4E]">
                      {currentQ.scientificContext}
                    </p>
                  </div>

                  {/* Step 1: Select High Protein, Light/Skipped, or Haven't Eaten Yet */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setBreakfastDone(true);
                        if (!breakfastFuel || ['Fasted / Coffee only', 'Light snack / Fruit', 'Pastry / Croissant', 'Skipped breakfast', 'Cereal & Milk', 'Haven\'t eaten yet', 'Fasting / Not eaten yet'].includes(breakfastFuel)) {
                          setBreakfastFuel('Cast-Iron Eggs & Greens');
                        }
                      }}
                      className={`p-3 rounded-2xl border-2 font-cabinet font-extrabold text-xs transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 ${
                        breakfastDone === true
                          ? 'border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] shadow-[2px_2px_0px_#2C5E43]'
                          : 'border-[#1A3629]/20 bg-[#FFFDF9] text-[#1A3629] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <PixelCheck size={16} color={breakfastDone === true ? '#FFFDF9' : '#1A3629'} />
                      <span>Hit Target (30g+)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setBreakfastDone(false);
                        if (!breakfastFuel || ['Cast-Iron Eggs & Greens', 'Avocado Omelet & Toast', 'Greek Yogurt Bowl', 'Protein Oats & Peanut Butter', 'Tofu Scramble', 'Protein Shake'].includes(breakfastFuel)) {
                          setBreakfastFuel('Skipped breakfast');
                        }
                      }}
                      className={`p-3 rounded-2xl border-2 font-cabinet font-extrabold text-xs transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 ${
                        breakfastDone === false
                          ? 'border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] shadow-[2px_2px_0px_#2C5E43]'
                          : 'border-[#1A3629]/20 bg-[#FFFDF9] text-[#1A3629] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <PixelX size={16} color={breakfastDone === false ? '#FFFDF9' : '#1A3629'} />
                      <span>Light / Skipped</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setBreakfastDone('not_yet');
                        setBreakfastFuel('Fasting / Not eaten yet');
                      }}
                      className={`p-3 rounded-2xl border-2 font-cabinet font-extrabold text-xs transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 ${
                        breakfastDone === 'not_yet'
                          ? 'border-[#B8862D] bg-[#B8862D] text-[#FFFDF9] shadow-[2px_2px_0px_#8A6520]'
                          : 'border-[#1A3629]/20 bg-[#FFFDF9] text-[#1A3629] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <PixelHourglass size={16} color={breakfastDone === 'not_yet' ? '#FFFDF9' : '#B8862D'} />
                      <span>Did Not Eat Yet</span>
                    </button>
                  </div>

                  {/* Natural AI Macro Estimator */}
                  <DebriefMealEstimator
                    mealLabel="Breakfast"
                    targetGrams={30}
                    currentFuel={breakfastFuel}
                    onApplyEstimate={(mealName, protein, calories, hitTarget) => {
                      setBreakfastFuel(mealName);
                      setBreakfastDone(hitTarget);
                    }}
                  />

                  {/* Step 2: What did you eat typing bar + quick selector chips below */}
                  <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#1A3629]/15 flex flex-col gap-3">
                    <label htmlFor="breakfast-fuel-input" className="font-mono text-[10px] font-bold text-[#4A5D4E] uppercase">
                      What did you eat?
                    </label>
                    <input
                      id="breakfast-fuel-input"
                      type="text"
                      value={breakfastFuel}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBreakfastFuel(val);
                        if (breakfastDone === null && val.trim().length > 0) {
                          setBreakfastDone(true);
                        }
                      }}
                      placeholder={breakfastDone === false ? "e.g. Coffee only, or butter croissant..." : breakfastDone === 'not_yet' ? "e.g. Fasting window or eating later..." : "e.g. 3 eggs, sourdough toast, black coffee..."}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#1A3629]/25 bg-[#FAF8F5] text-xs font-cabinet font-bold text-[#1A3629] focus:outline-none focus:border-[#1A3629]"
                    />

                    {/* Quick Selectors below the typing bar */}
                    <div className="flex flex-col gap-1.5 mt-1">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-[#4A5D4E]/80">
                        Quick Selectors (tap to insert):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(breakfastDone === null || breakfastDone === 'not_yet'
                          ? ['Cast-Iron Eggs & Greens', 'Greek Yogurt Bowl', 'Protein Shake', 'Fasting / Not eaten yet', 'Light snack / Fruit', 'Skipped breakfast']
                          : breakfastDone === true
                          ? ['Cast-Iron Eggs & Greens', 'Avocado Omelet & Toast', 'Greek Yogurt Bowl', 'Protein Oats & Peanut Butter', 'Tofu Scramble', 'Protein Shake']
                          : ['Fasted / Coffee only', 'Light snack / Fruit', 'Croissant / Pastry', 'Skipped breakfast', 'Cereal & Milk']
                        ).map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => {
                              setBreakfastFuel(chip);
                              if (chip === 'Fasting / Not eaten yet') {
                                setBreakfastDone('not_yet');
                              } else {
                                const isHighProtein = ['Cast-Iron Eggs & Greens', 'Avocado Omelet & Toast', 'Greek Yogurt Bowl', 'Protein Oats & Peanut Butter', 'Tofu Scramble', 'Protein Shake'].includes(chip);
                                setBreakfastDone(isHighProtein);
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg border text-[11px] font-cabinet font-bold transition-all cursor-pointer ${
                              breakfastFuel === chip
                                ? 'border-[#1A3629] bg-[#1A3629] text-[#FFFDF9]'
                                : 'border-[#1A3629]/15 bg-[#FAF8F5] text-[#1A3629] hover:bg-[#FAF6EE]'
                            }`}
                          >
                            <span>{chip}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD 4: LUNCH PROTEIN */}
              {currentQ?.id === 'lunch_protein' && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] font-bold text-[#B8862D] uppercase tracking-wider flex items-center gap-1.5">
                      <PixelFlame size={14} color="#EA580C" />
                      <span>Lunch</span>
                    </span>
                    <h3 className="font-cabinet font-extrabold text-2xl text-[#1A3629] tracking-tight">
                      Did you have a high-protein lunch (40g+)?
                    </h3>
                    <p className="font-sans text-xs text-[#4A5D4E]">
                      {currentQ.scientificContext}
                    </p>
                  </div>

                  {/* Step 1: Select High Protein, Light/Fast Food, or Haven't Eaten Yet */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLunchDone(true);
                        if (!lunchFuel || ['McDonald\'s / Fast Food', 'Takeout / Fast food', 'Light salad', 'Sandwich / Wrap', 'Skipped lunch', 'Haven\'t eaten lunch yet', 'Fasting / Not eaten yet'].includes(lunchFuel)) {
                          setLunchFuel('Herb Grilled Chicken & Rice');
                        }
                      }}
                      className={`p-3 rounded-2xl border-2 font-cabinet font-extrabold text-xs transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 ${
                        lunchDone === true
                          ? 'border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] shadow-[2px_2px_0px_#2C5E43]'
                          : 'border-[#1A3629]/20 bg-[#FFFDF9] text-[#1A3629] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <PixelCheck size={16} color={lunchDone === true ? '#FFFDF9' : '#1A3629'} />
                      <span>Hit Target (40g+)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setLunchDone(false);
                        if (!lunchFuel || ['Herb Grilled Chicken & Rice', 'Turkey & Sweet Potato', 'Salmon & Veggies', 'Steak & Quinoa Bowl'].includes(lunchFuel)) {
                          setLunchFuel('McDonald\'s / Fast Food');
                        }
                      }}
                      className={`p-3 rounded-2xl border-2 font-cabinet font-extrabold text-xs transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 ${
                        lunchDone === false
                          ? 'border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] shadow-[2px_2px_0px_#2C5E43]'
                          : 'border-[#1A3629]/20 bg-[#FFFDF9] text-[#1A3629] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <PixelX size={16} color={lunchDone === false ? '#FFFDF9' : '#1A3629'} />
                      <span>Light / Skipped</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setLunchDone('not_yet');
                        setLunchFuel('Haven\'t eaten lunch yet');
                      }}
                      className={`p-3 rounded-2xl border-2 font-cabinet font-extrabold text-xs transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 ${
                        lunchDone === 'not_yet'
                          ? 'border-[#B8862D] bg-[#B8862D] text-[#FFFDF9] shadow-[2px_2px_0px_#8A6520]'
                          : 'border-[#1A3629]/20 bg-[#FFFDF9] text-[#1A3629] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <PixelHourglass size={16} color={lunchDone === 'not_yet' ? '#FFFDF9' : '#B8862D'} />
                      <span>Did Not Eat Yet</span>
                    </button>
                  </div>

                  {/* Natural AI Macro Estimator */}
                  <DebriefMealEstimator
                    mealLabel="Lunch"
                    targetGrams={40}
                    currentFuel={lunchFuel}
                    onApplyEstimate={(mealName, protein, calories, hitTarget) => {
                      setLunchFuel(mealName);
                      setLunchDone(hitTarget);
                    }}
                  />

                  {/* Step 2: What did you eat typing bar + quick selector chips below */}
                  <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#1A3629]/15 flex flex-col gap-3">
                    <label htmlFor="lunch-fuel-input" className="font-mono text-[10px] font-bold text-[#4A5D4E] uppercase">
                      What did you eat?
                    </label>
                    <input
                      id="lunch-fuel-input"
                      type="text"
                      value={lunchFuel}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLunchFuel(val);
                        if (lunchDone === null && val.trim().length > 0) {
                          setLunchDone(true);
                        }
                      }}
                      placeholder={lunchDone === false ? "e.g. McDonald's burger and fries, or sandwich..." : lunchDone === 'not_yet' ? "e.g. Haven't eaten lunch yet..." : "e.g. Herb chicken breast with steamed rice and greens..."}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#1A3629]/25 bg-[#FAF8F5] text-xs font-cabinet font-bold text-[#1A3629] focus:outline-none focus:border-[#1A3629]"
                    />

                    {/* Quick Selectors below the typing bar */}
                    <div className="flex flex-col gap-1.5 mt-1">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-[#4A5D4E]/80">
                        Quick Selectors (tap to insert):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(lunchDone === null || lunchDone === 'not_yet'
                          ? ['Herb Grilled Chicken & Rice', 'Turkey & Sweet Potato', 'Salmon & Veggies', 'McDonald\'s / Fast Food', 'Haven\'t eaten lunch yet', 'Skipped lunch']
                          : lunchDone === true
                          ? ['Herb Grilled Chicken & Rice', 'Turkey & Sweet Potato', 'Salmon & Veggies', 'Ancient Grains & Tofu', 'Steak & Quinoa Bowl', 'Chipotle Chicken Bowl']
                          : ['McDonald\'s / Fast Food', 'Sandwich / Wrap', 'Salad without protein', 'Skipped lunch', 'Instant noodles']
                        ).map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => {
                              setLunchFuel(chip);
                              if (chip === 'Haven\'t eaten lunch yet') {
                                setLunchDone('not_yet');
                              } else {
                                const isHighProtein = ['Herb Grilled Chicken & Rice', 'Turkey & Sweet Potato', 'Salmon & Veggies', 'Ancient Grains & Tofu', 'Steak & Quinoa Bowl', 'Chipotle Chicken Bowl'].includes(chip);
                                setLunchDone(isHighProtein);
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg border text-[11px] font-cabinet font-bold transition-all cursor-pointer ${
                              lunchFuel === chip
                                ? 'border-[#1A3629] bg-[#1A3629] text-[#FFFDF9]'
                                : 'border-[#1A3629]/15 bg-[#FAF8F5] text-[#1A3629] hover:bg-[#FAF6EE]'
                            }`}
                          >
                            <span>{chip}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Metabolic Protein Dynamic Rebalancing Advisor */}
                    <div className="mt-2 p-3.5 rounded-xl bg-[#1A3629]/5 border border-[#1A3629]/15 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[9px] font-bold text-[#B8862D] uppercase tracking-wider flex items-center gap-1.5">
                          <PixelSpark size={12} color="#B8862D" />
                          <span>Metabolic Rebalancing Advisor</span>
                        </span>
                        <span className="font-mono text-[10px] font-bold text-[#1A3629]">
                          Floor: {userTargetProtein}g Daily
                        </span>
                      </div>
                      <p className="font-sans text-xs text-[#1A3629] font-medium leading-relaxed">
                        {proteinRebalance.advice}
                      </p>
                      <div className="flex flex-col gap-1 mt-0.5">
                        <span className="font-mono text-[9px] font-bold uppercase text-[#4A5D4E]">
                          Suggested Dinner Target: <strong className="text-[#1A3629]">{proteinRebalance.adjustedDinnerTarget}g Protein</strong>
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {proteinRebalance.recommendedMeals.slice(0, 3).map((m) => (
                            <span key={m} className="px-2 py-0.5 rounded-md bg-[#FFFDF9] border border-[#1A3629]/15 text-[10px] font-cabinet font-bold text-[#1A3629]">
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD: DINNER PROTEIN */}
              {currentQ?.id === 'dinner_protein' && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] font-bold text-[#EA580C] uppercase tracking-wider flex items-center gap-1.5">
                      <PixelFlame size={14} color="#EA580C" />
                      <span>Dinner</span>
                    </span>
                    <h3 className="font-cabinet font-extrabold text-2xl text-[#1A3629] tracking-tight">
                      Did you have a high-protein dinner (35g+)?
                    </h3>
                    <p className="font-sans text-xs text-[#4A5D4E]">
                      {currentQ.scientificContext || 'Evening protein stimulates nocturnal muscle protein synthesis (MPS) and stabilizes overnight glucose levels.'}
                    </p>
                  </div>

                  {/* Step 1: Select High Protein, Light/Skipped, or Haven't Eaten Yet */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDinnerDone(true);
                        if (!dinnerFuel || ['Skipped dinner', 'Fast food / Takeout', 'Light salad', 'Haven\'t eaten dinner yet', 'Fasting / Not eaten yet'].includes(dinnerFuel)) {
                          setDinnerFuel('Grilled Salmon & Greens');
                        }
                      }}
                      className={`p-3 rounded-2xl border-2 font-cabinet font-extrabold text-xs transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 ${
                        dinnerDone === true
                          ? 'border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] shadow-[2px_2px_0px_#2C5E43]'
                          : 'border-[#1A3629]/20 bg-[#FFFDF9] text-[#1A3629] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <PixelCheck size={16} color={dinnerDone === true ? '#FFFDF9' : '#1A3629'} />
                      <span>Hit Target (35g+)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDinnerDone(false);
                        if (!dinnerFuel || ['Grilled Salmon & Greens', 'Roast Chicken Breast', 'Grass-Fed Ribeye', 'Steak & Sweet Potato', 'Lentil Stew & Quinoa'].includes(dinnerFuel)) {
                          setDinnerFuel('Skipped dinner');
                        }
                      }}
                      className={`p-3 rounded-2xl border-2 font-cabinet font-extrabold text-xs transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 ${
                        dinnerDone === false
                          ? 'border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] shadow-[2px_2px_0px_#2C5E43]'
                          : 'border-[#1A3629]/20 bg-[#FFFDF9] text-[#1A3629] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <PixelX size={16} color={dinnerDone === false ? '#FFFDF9' : '#1A3629'} />
                      <span>Light / Skipped</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDinnerDone('not_yet');
                        setDinnerFuel('Haven\'t eaten dinner yet');
                      }}
                      className={`p-3 rounded-2xl border-2 font-cabinet font-extrabold text-xs transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 ${
                        dinnerDone === 'not_yet'
                          ? 'border-[#B8862D] bg-[#B8862D] text-[#FFFDF9] shadow-[2px_2px_0px_#8A6520]'
                          : 'border-[#1A3629]/20 bg-[#FFFDF9] text-[#1A3629] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <PixelHourglass size={16} color={dinnerDone === 'not_yet' ? '#FFFDF9' : '#B8862D'} />
                      <span>Did Not Eat Yet</span>
                    </button>
                  </div>

                  {/* Natural AI Macro Estimator */}
                  <DebriefMealEstimator
                    mealLabel="Dinner"
                    targetGrams={35}
                    currentFuel={dinnerFuel}
                    onApplyEstimate={(mealName, protein, calories, hitTarget) => {
                      setDinnerFuel(mealName);
                      setDinnerDone(hitTarget);
                    }}
                  />

                  {/* Step 2: What did you eat typing bar + quick selector chips below */}
                  <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#1A3629]/15 flex flex-col gap-3">
                    <label htmlFor="dinner-fuel-input" className="font-mono text-[10px] font-bold text-[#4A5D4E] uppercase">
                      What did you eat?
                    </label>
                    <input
                      id="dinner-fuel-input"
                      type="text"
                      value={dinnerFuel}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDinnerFuel(val);
                        if (dinnerDone === null && val.trim().length > 0) {
                          setDinnerDone(true);
                        }
                      }}
                      placeholder={dinnerDone === false ? "e.g. Soup or light salad, or skipped..." : dinnerDone === 'not_yet' ? "e.g. Haven't had dinner yet, planning chicken..." : "e.g. Grilled salmon fillet with sweet potato and broccoli..."}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#1A3629]/25 bg-[#FAF8F5] text-xs font-cabinet font-bold text-[#1A3629] focus:outline-none focus:border-[#1A3629]"
                    />

                    {/* Quick Selectors below the typing bar */}
                    <div className="flex flex-col gap-1.5 mt-1">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-[#4A5D4E]/80">
                        Quick Selectors (tap to insert):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(dinnerDone === null || dinnerDone === 'not_yet'
                          ? ['Grilled Salmon & Greens', 'Roast Chicken Breast', 'Grass-Fed Ribeye', 'Steak & Sweet Potato', 'Haven\'t eaten dinner yet', 'Skipped dinner']
                          : dinnerDone === true
                          ? ['Grilled Salmon & Greens', 'Roast Chicken Breast', 'Grass-Fed Ribeye', 'Steak & Sweet Potato', 'Lentil Stew & Quinoa', 'Tuna Poke Bowl']
                          : ['Light salad / Soup', 'Skipped dinner', 'Fast food / Takeout', 'Bread & Cheese']
                        ).map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => {
                              setDinnerFuel(chip);
                              if (chip === 'Haven\'t eaten dinner yet') {
                                setDinnerDone('not_yet');
                              } else {
                                const isHighProtein = ['Grilled Salmon & Greens', 'Roast Chicken Breast', 'Grass-Fed Ribeye', 'Steak & Sweet Potato', 'Lentil Stew & Quinoa', 'Tuna Poke Bowl'].includes(chip);
                                setDinnerDone(isHighProtein);
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg border text-[11px] font-cabinet font-bold transition-all cursor-pointer ${
                              dinnerFuel === chip
                                ? 'border-[#1A3629] bg-[#1A3629] text-[#FFFDF9]'
                                : 'border-[#1A3629]/15 bg-[#FAF8F5] text-[#1A3629] hover:bg-[#FAF6EE]'
                            }`}
                          >
                            <span>{chip}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD 5: CAFFEINE CUTOFF */}
              {currentQ?.id === 'caffeine_cutoff' && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] font-bold text-[#B8862D] uppercase tracking-wider flex items-center gap-1.5">
                      <PixelClock size={14} color="#B8862D" />
                      <span>Caffeine Cutoff</span>
                    </span>
                    <h3 className="font-cabinet font-extrabold text-2xl text-[#1A3629] tracking-tight">
                      Did you cut off caffeine 10–12 hours before bed?
                    </h3>
                    <p className="font-sans text-xs text-[#4A5D4E]">
                      {currentQ.scientificContext}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCaffeineDone(true)}
                      className={`p-4 rounded-2xl border-2 font-cabinet font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        caffeineDone === true
                          ? 'border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] shadow-[3px_3px_0px_#2C5E43]'
                          : 'border-[#1A3629]/20 bg-[#FFFDF9] text-[#1A3629] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <span>Yes, Cut Off on Time</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCaffeineDone(false)}
                      className={`p-4 rounded-2xl border-2 font-cabinet font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        caffeineDone === false
                          ? 'border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] shadow-[3px_3px_0px_#2C5E43]'
                          : 'border-[#1A3629]/20 bg-[#FFFDF9] text-[#1A3629] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <span>Drank Late Caffeine</span>
                    </button>
                  </div>

                  {caffeineDone === true && (
                    <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#1A3629]/15 flex flex-col gap-2 animate-in fade-in duration-150">
                      <span className="font-mono text-[10px] font-bold text-[#4A5D4E] uppercase">
                        When was your last cup?
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {currentQ.chipsYes?.map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => setCaffeineTime(chip)}
                            className={`p-2.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer text-left ${
                              caffeineTime === chip
                                ? 'border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9]'
                                : 'border-[#1A3629]/15 bg-[#FAF8F5] text-[#1A3629]'
                            }`}
                          >
                            <span>{chip}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CARD 6+: CUSTOM USER QUESTIONS */}
              {currentQ && !['sleep_wake', 'sunlight', 'breakfast_protein', 'lunch_protein', 'dinner_protein', 'caffeine_cutoff'].includes(currentQ.id) && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] font-bold text-[#B8862D] uppercase tracking-wider flex items-center gap-1.5">
                      <PixelSpark size={14} color="#B8862D" />
                      <span>Custom Habit</span>
                    </span>
                    <h3 className="font-cabinet font-extrabold text-2xl text-[#1A3629] tracking-tight">
                      {currentQ.prompt}
                    </h3>
                    <p className="font-sans text-xs text-[#4A5D4E]">
                      {currentQ.scientificContext}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setCustomAnswers((prev) => ({ ...prev, [currentQ.id]: true }))}
                      className={`p-5 rounded-2xl border-2 font-cabinet font-extrabold text-sm transition-all cursor-pointer flex flex-col items-center gap-2 ${
                        customAnswers[currentQ.id] === true
                          ? 'border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] shadow-[3px_3px_0px_#2C5E43]'
                          : 'border-[#1A3629]/20 bg-[#FFFDF9] text-[#1A3629] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <PixelCheck size={18} color={customAnswers[currentQ.id] === true ? '#FFFDF9' : '#1A3629'} />
                      <span>Yes, Completed</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCustomAnswers((prev) => ({ ...prev, [currentQ.id]: false }))}
                      className={`p-5 rounded-2xl border-2 font-cabinet font-extrabold text-sm transition-all cursor-pointer flex flex-col items-center gap-2 ${
                        customAnswers[currentQ.id] === false
                          ? 'border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] shadow-[3px_3px_0px_#2C5E43]'
                          : 'border-[#1A3629]/20 bg-[#FFFDF9] text-[#1A3629] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <PixelX size={18} color={customAnswers[currentQ.id] === false ? '#FFFDF9' : '#1A3629'} />
                      <span>Skipped Today</span>
                    </button>
                  </div>
                </div>
              )}

              {/* CARD: FINAL SEAL STEP */}
              {isFinalStep && (
                <div className="flex flex-col items-center text-center gap-5">
                  <div className="w-14 h-14 rounded-full bg-[#1A3629] text-[#FFFDF9] flex items-center justify-center shadow-[3px_3px_0px_#2C5E43]">
                    <PixelPushpin size={32} animate={false} />
                  </div>

                  <div className="flex flex-col gap-1">
                    <h3 className="font-cabinet font-extrabold text-2xl text-[#1A3629] tracking-tight">
                      Ready to Save Today&apos;s Log?
                    </h3>
                    <p className="font-sans text-xs text-[#4A5D4E] max-w-sm">
                      Your daily log is ready. Save today&apos;s summary and claim your XP.
                    </p>
                  </div>

                  {/* Live Biometric XP Tally Card with itemized sequential suites */}
                  <div className="w-full max-w-sm p-4 rounded-2xl bg-[#FFFDF9] border border-[#1A3629]/15 flex flex-col gap-2 font-mono text-xs text-left shadow-xs">
                    <div className="flex items-center justify-between font-bold text-[11px] text-[#1A3629]">
                      <span className="uppercase tracking-wider">Today&apos;s XP Breakdown</span>
                      <span className="text-[#B8862D]">+{biometricXp.totalXp} XP Total</span>
                    </div>
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-dashed border-[#1A3629]/15 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[#4A5D4E] flex items-center gap-1.5">
                          <PixelMoon size={13} color="#6366F1" />
                          <span>Sleep ({calculatedSleepDuration}h)</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-800 font-mono font-bold">Circadian</span>
                        </span>
                        <span className="font-bold text-[#1A3629]">+{biometricXp.sleepXp} XP</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#4A5D4E] flex items-center gap-1.5">
                          <PixelSun size={13} color="#F59E0B" />
                          <span>Morning Light</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-800 font-mono font-bold">Circadian</span>
                        </span>
                        <span className={`font-bold ${sunlightDone ? 'text-[#1A3629]' : 'text-neutral-400'}`}>
                          +{sunlightDone ? biometricXp.sunlightXp : 0} XP
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#4A5D4E] flex items-center gap-1.5">
                          <PixelEgg size={13} />
                          <span>Breakfast Protein</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-800 font-mono font-bold">Iron</span>
                        </span>
                        <span className={`font-bold ${breakfastDone === true ? 'text-[#1A3629]' : 'text-neutral-400'}`}>
                          +{breakfastDone === true ? biometricXp.breakfastXp : 0} XP
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#4A5D4E] flex items-center gap-1.5">
                          <PixelSteak size={13} color="#DC2626" />
                          <span>Lunch Protein</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-800 font-mono font-bold">Iron</span>
                        </span>
                        <span className={`font-bold ${lunchDone === true ? 'text-[#1A3629]' : 'text-neutral-400'}`}>
                          +{lunchDone === true ? biometricXp.lunchXp : 0} XP
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#4A5D4E] flex items-center gap-1.5">
                          <PixelFish size={13} color="#0284C7" />
                          <span>Dinner Protein</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-800 font-mono font-bold">Iron</span>
                        </span>
                        <span className={`font-bold ${dinnerDone === true ? 'text-[#1A3629]' : 'text-neutral-400'}`}>
                          +{dinnerDone === true ? biometricXp.dinnerXp : 0} XP
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#4A5D4E] flex items-center gap-1.5">
                          <PixelStopwatch size={13} color="#D97706" />
                          <span>Caffeine Cutoff</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-800 font-mono font-bold">Deep Worker</span>
                        </span>
                        <span className={`font-bold ${caffeineDone ? 'text-[#1A3629]' : 'text-neutral-400'}`}>
                          +{caffeineDone ? biometricXp.caffeineXp : 0} XP
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#4A5D4E] flex items-center gap-1.5">
                          <PixelPin size={13} color="#EF4444" />
                          <span>Daily Check-in</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-800 font-mono font-bold">Active Island</span>
                        </span>
                        <span className="font-bold text-[#1A3629]">+{biometricXp.baseSealXp} XP</span>
                      </div>
                    </div>
                  </div>

                  {isSealingInProgress && (
                    <div className="w-full max-w-sm p-3.5 rounded-2xl bg-[#1A3629] text-[#FFFDF9] flex items-center justify-center gap-2.5 font-mono text-xs font-bold animate-pulse shadow-md">
                      <PixelSparkles size={14} color="#FDE047" className="animate-spin" />
                      <span>SAVING CHECKPOINT {sealingStepIdx + 1}: AWARDING XP...</span>
                    </div>
                  )}

                  {isPendingMeals ? (
                    <div className="flex flex-col gap-2.5 w-full max-w-sm">
                      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 font-cabinet text-xs flex flex-col gap-1 text-left">
                        <span className="font-extrabold flex items-center gap-1.5">
                          <PixelHourglass size={14} color="#B45309" />
                          <span>Lunch or Dinner Pending</span>
                        </span>
                        <span className="text-[11px] font-sans text-amber-900">
                          Save for now to collect today&apos;s XP, and update when you&apos;ve had dinner — or save your draft and finish later tonight!
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleFinishAndSeal(true)}
                        disabled={isSealingInProgress}
                        className="w-full py-3.5 px-4 rounded-2xl bg-[#1A3629] text-[#FFFDF9] font-cabinet font-extrabold text-sm hover:bg-[#2C4A3B] transition-all cursor-pointer shadow-[3px_3px_0px_#2C5E43] flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <span>{isSealingInProgress ? 'Saving...' : `Save for Now (+${biometricXp.totalXp} XP)`}</span>
                        <PixelPushpin size={18} animate={false} />
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveDraft}
                        disabled={isSealingInProgress}
                        className="w-full py-3 px-4 rounded-2xl border-2 border-[#1A3629]/20 bg-[#FAF8F5] text-[#1A3629] font-cabinet font-bold text-xs hover:bg-[#FAF6EE] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>Save Progress &amp; Finish Later</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleFinishAndSeal(false)}
                      disabled={isSealingInProgress}
                      className="w-full max-w-sm py-4 px-6 rounded-2xl bg-[#1A3629] text-[#FFFDF9] font-cabinet font-extrabold text-sm hover:bg-[#2C4A3B] transition-all cursor-pointer shadow-[4px_4px_0px_#2C5E43] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-2 mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>{isSealingInProgress ? 'Saving Today\'s XP...' : `Save Today & Claim XP (+${biometricXp.totalXp} XP)`}</span>
                      <PixelPushpin size={18} animate={false} />
                    </button>
                  )}
                </div>
              )}

              {/* Navigation Back & Next Strip */}
              {!isFinalStep && (
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#1A3629]/10">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={activeStepIndex === 0}
                    className="px-4 py-2.5 rounded-xl border border-[#1A3629]/20 bg-[#FAF8F5] text-[#1A3629] font-cabinet font-bold text-xs hover:bg-[#1A3629]/5 transition-colors disabled:opacity-30 cursor-pointer flex items-center gap-1.5"
                  >
                    <PixelChevronLeft size={14} color="#1A3629" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canProceed}
                    className="px-5 py-2.5 rounded-xl bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs hover:bg-[#2C4A3B] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 shadow-[2px_2px_0px_#2C5E43]"
                    title={!canProceed ? "Please complete this step to proceed" : undefined}
                  >
                    <span>Next</span>
                    <PixelArrowRight size={14} color="#FFFDF9" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Drawer Footer */}
        <div className="w-full px-6 py-4 border-t border-[#1A3629]/10 bg-[#FFFDF9]/60 backdrop-blur-md flex items-center justify-between font-mono text-[11px] text-[#4A5D4E]">
          <span>Cyath Protocol Engine</span>
          <span className="font-bold text-[#1A3629]">Press ESC or tap background to close</span>
        </div>
      </aside>

      {/* Custom Questions Manager Modal */}
      <CustomQuestionManager
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        questions={questions}
        onUpdateQuestions={handleUpdateQuestions}
      />
    </>
  );
}
