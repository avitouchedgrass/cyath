'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useHabitStore, CUSTOM_HABITS_LIBRARY } from '@/store/useHabitStore';
import { supabase } from '@/lib/supabase';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { xpParticleEmitter } from '@/lib/particleEmitter';
import { PixelSpark } from '@/components/common/PixelSpark';
import { PixelPushpin } from '@/components/dashboard/PixelPushpin';
import {
  PixelCheck,
  PixelArrowRight,
  PixelArrowLeft,
  PixelSun,
  PixelMoon,
  PixelClock,
  PixelLightning,
} from '@/components/common/PixelIcons';

type Archetype = 'iron' | 'focus' | 'circadian';

const ARCHETYPES: { id: Archetype; title: string; subtitle: string; tag: string }[] = [
  {
    id: 'iron',
    title: 'The Whey Station',
    subtitle: 'Heavy lifting, calibrated macro munching & preserving the holy protein floor.',
    tag: '2.0g/kg Metabolic Floor',
  },
  {
    id: 'focus',
    title: 'Ctrl+Alt+Defeat',
    subtitle: 'Tab overload rehab, dopamine firewall & relentless deep focus flow.',
    tag: 'Flow State & Focus',
  },
  {
    id: 'circadian',
    title: 'The Pillow Fighter',
    subtitle: 'Catching rays, dodging blue light & championing 8 hours of slow-wave slumber.',
    tag: 'Sleep Architecture',
  },
];

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditing = searchParams.get('edit') === 'true';

  const {
    userProfile,
    updateUserProfile,
    userSession,
    gainXp,
    setCustomHabitSlot,
  } = useHabitStore();

  const [step, setStep] = useState(1);
  const [operatorName, setOperatorName] = useState(userProfile?.fullName || '');
  const [archetype, setArchetype] = useState<Archetype>('iron');
  const [wakeTime, setWakeTime] = useState(userProfile?.wakeTime || '07:00');
  const [bedTime, setBedTime] = useState(userProfile?.bedTime || '23:00');
  const [isImperial, setIsImperial] = useState(false);
  const [weightKg, setWeightKg] = useState(userProfile?.weightKg || 72);
  const [weightLbs, setWeightLbs] = useState(158);
  const [targetProtein, setTargetProtein] = useState<number>(userProfile?.targetProteinGrams || 100);
  const [selectedCustomHabit, setSelectedCustomHabit] = useState<string>('creatine');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // GUARD: If user already completed onboarding and is not explicitly in edit mode, route directly to dashboard
  useEffect(() => {
    if (!isEditing) {
      if (userProfile?.onboardingCompleted) {
        router.replace('/dashboard');
        return;
      }
      if (userSession?.id && !userSession.id.startsWith('guest_')) {
        const checkRemoteStatus = async () => {
          try {
            const { data } = await supabase
              .from('user_profiles')
              .select('onboarding_completed')
              .eq('user_id', userSession.id)
              .maybeSingle();

            if (data?.onboarding_completed) {
              router.replace('/dashboard');
            }
          } catch {}
        };
        checkRemoteStatus();
      }
    }
  }, [isEditing, userProfile, userSession, router]);

  const handleWeightLbsChange = (lbs: number) => {
    setWeightLbs(lbs);
    const kg = Math.round(lbs / 2.20462);
    setWeightKg(kg);
    if (!userProfile?.targetProteinGrams) {
      setTargetProtein(Math.max(80, Math.round(kg * 1.8)));
    }
  };

  const handleWeightKgChange = (kg: number) => {
    setWeightKg(kg);
    setWeightLbs(Math.round(kg * 2.20462));
    if (!userProfile?.targetProteinGrams) {
      setTargetProtein(Math.max(80, Math.round(kg * 1.8)));
    }
  };

  // Caffeine cutoff computation (10-12 hours prior to bedtime)
  const caffeineCutoffText = useMemo(() => {
    const [bedH, bedM] = bedTime.split(':').map(Number);
    let cutoffH = (bedH || 23) - 10;
    if (cutoffH < 0) cutoffH += 24;
    const period = cutoffH >= 12 ? 'PM' : 'AM';
    const displayH = cutoffH % 12 || 12;
    const displayM = String(bedM || 0).padStart(2, '0');
    return `${displayH}:${displayM} ${period}`;
  }, [bedTime]);

  const handleComplete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    retroAudio.playTierUpgrade();
    haptics.heavy();

    if (typeof window !== 'undefined') {
      xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 28);
    }

    const profileData = {
      fullName: operatorName.trim() || 'Sanctuary Explorer',
      age: userProfile?.age || 26,
      sex: userProfile?.sex || 'other' as const,
      heightCm: userProfile?.heightCm || 178,
      weightKg,
      wakeTime,
      bedTime,
      targetProteinGrams: targetProtein,
      customHabitSlot: selectedCustomHabit,
      primaryGoal: archetype === 'iron' ? 'muscle' as const : archetype === 'circadian' ? 'sleep' as const : 'focus' as const,
      archetype,
      selectedIslandSuite: archetype,
      allergies: userProfile?.allergies || [],
      dietaryRestrictions: userProfile?.dietaryRestrictions || ['Whole Food Baseline'],
      onboardingCompleted: true,
    };

    const isFirstTime = !userProfile?.onboardingCompleted;
    updateUserProfile(profileData);
    if (selectedCustomHabit) {
      setCustomHabitSlot(selectedCustomHabit);
    }

    if (isFirstTime) {
      gainXp(50, 'Sanctuary Founder Welcome Bonus');
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const activeUserId = session?.user?.id || userSession?.id;
      if (activeUserId && !activeUserId.startsWith('guest_')) {
        await supabase
          .from('user_profiles')
          .upsert(
            {
              user_id: activeUserId,
              full_name: profileData.fullName,
              weight_kg: profileData.weightKg,
              target_protein_grams: profileData.targetProteinGrams,
              wake_time: profileData.wakeTime,
              bed_time: profileData.bedTime,
              primary_goal: profileData.primaryGoal,
              onboarding_completed: true,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          );
      }
    } catch {}

    if (!isEditing) {
      try {
        sessionStorage.setItem('pending_cyath_walkthrough', 'true');
      } catch {}
      router.replace('/dashboard');
    } else {
      router.replace('/profile');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F0EA] text-[#1A3629] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-[#1A3629] selection:text-[#FFFDF9]">
      
      {/* Ambient Pixel Dust Backing */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#1A3629_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="w-full max-w-xl bg-[#FFFDF9] border-2 border-[#1A3629] rounded-3xl p-6 sm:p-9 shadow-[6px_6px_0px_#1A3629] flex flex-col gap-6 relative z-10 animate-in fade-in zoom-in-98 duration-200">
        
        {/* Progress Header */}
        <div className="flex items-center justify-between border-b border-[#1A3629]/15 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1A3629]" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#4A5D4E]">
              {isEditing ? 'Recalibration Protocol' : 'Initiation Protocol'} · Step {step} of 4
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {isEditing && (
              <button
                type="button"
                onClick={() => router.push('/profile')}
                className="font-cabinet font-semibold text-xs text-[#4A5D4E] hover:text-[#1A3629] transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}

            {/* Step Pill Indicators */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === step
                      ? 'w-6 bg-[#1A3629]'
                      : i < step
                      ? 'w-2 bg-[#1A3629]/60'
                      : 'w-2 bg-[#1A3629]/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ================= STEP 1: SANCTUARY & IDENTITY ================= */}
        {step === 1 && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-150">
            <div className="flex flex-col items-center text-center">
              <div className="w-28 h-28 relative mb-2">
                <Image
                  src={archetype === 'iron' ? '/islands/iron_1.webp' : archetype === 'focus' ? '/islands/worker_1.webp' : '/islands/r1.webp'}
                  alt="Awakened Sanctuary Rock"
                  fill
                  priority
                  className="object-contain drop-shadow-md select-none transition-all duration-300"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <h1 className="font-cabinet font-extrabold text-2xl sm:text-3xl text-[#1A3629] tracking-tight">
                Your Sanctuary Awaits
              </h1>
              <p className="font-sans text-xs sm:text-sm text-[#4A5D4E] mt-1 max-w-sm">
                A calm, zero-friction 16-bit ecosystem designed to build foundational biology through effortless checkboxes.
              </p>
            </div>

            {/* Operator Call-Sign Input */}
            <div className="flex flex-col gap-2">
              <label htmlFor="operator-name" className="font-cabinet font-bold text-xs uppercase tracking-wider text-[#1A3629] flex items-center justify-between">
                <span>Explorer Call-Sign</span>
                <span className="font-mono text-[10px] text-[#4A5D4E] font-normal">Identifies your daily receipts</span>
              </label>
              <input
                id="operator-name"
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                placeholder="e.g. Avi, Atlas, Rowan"
                maxLength={24}
                className="w-full px-4 py-3 rounded-2xl border border-[#1A3629]/20 bg-[#FAF8F5] text-sm font-cabinet font-bold text-[#1A3629] focus:outline-none focus:border-[#1A3629] focus:ring-1 focus:ring-[#1A3629]"
                autoFocus
              />
            </div>

            {/* Focus Archetype Selector */}
            <div className="flex flex-col gap-2 pt-1">
              <span className="font-cabinet font-bold text-xs uppercase tracking-wider text-[#1A3629]">
                Choose Primary Discipline
              </span>
              <div className="grid grid-cols-1 gap-2.5">
                {ARCHETYPES.map((arch) => (
                  <button
                    key={arch.id}
                    type="button"
                    onClick={() => {
                      retroAudio.playBlip();
                      setArchetype(arch.id);
                    }}
                    className={`p-3 rounded-2xl border transition-all text-left flex items-start justify-between cursor-pointer ${
                      archetype === arch.id
                        ? 'border-2 border-[#1A3629] bg-[#FAF6EE] shadow-2xs'
                        : 'border-[#1A3629]/15 bg-[#FFFDF9] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-cabinet font-bold text-sm text-[#1A3629]">
                          {arch.title}
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-[#1A3629]/10 text-[#1A3629] px-2 py-0.5 rounded-full">
                          {arch.tag}
                        </span>
                      </div>
                      <p className="text-xs text-[#4A5D4E] mt-0.5 font-sans">
                        {arch.subtitle}
                      </p>
                    </div>
                    {archetype === arch.id && (
                      <span className="w-5 h-5 rounded-full bg-[#1A3629] text-[#FFFDF9] flex items-center justify-center shrink-0 mt-0.5">
                        <PixelCheck size={12} color="#FFFDF9" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                retroAudio.playInspectConfirm();
                haptics.tap();
                setStep(2);
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-sm hover:bg-[#2C4A3B] transition-all cursor-pointer shadow-[3px_3px_0px_#2C5E43] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-2 mt-2"
            >
              <span>Next: Circadian Cadence</span>
              <PixelArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ================= STEP 2: CIRCADIAN CADENCE & LIGHT WINDOW ================= */}
        {step === 2 && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-150">
            <div>
              <h2 className="font-cabinet font-extrabold text-2xl text-[#1A3629] tracking-tight">
                Circadian Light &amp; Sleep Windows
              </h2>
              <p className="font-sans text-xs sm:text-sm text-[#4A5D4E] mt-1">
                Grounded in neurobiology. Sunlight timing anchors your cortisol awakening response, while caffeine timing protects slow-wave sleep.
              </p>
            </div>

            {/* Wake & Bed Time Selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#1A3629]/15">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#4A5D4E] flex items-center gap-1.5">
                  <PixelSun size={14} color="#D97706" />
                  <span>Wake Time</span>
                </span>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full bg-[#FFFDF9] border border-[#1A3629]/20 rounded-xl px-2.5 py-1.5 font-mono text-sm font-bold text-[#1A3629] focus:outline-none focus:border-[#1A3629]"
                />
              </div>

              <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#1A3629]/15">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#4A5D4E] flex items-center gap-1.5">
                  <PixelMoon size={14} color="#4F46E5" />
                  <span>Target Bedtime</span>
                </span>
                <input
                  type="time"
                  value={bedTime}
                  onChange={(e) => setBedTime(e.target.value)}
                  className="w-full bg-[#FFFDF9] border border-[#1A3629]/20 rounded-xl px-2.5 py-1.5 font-mono text-sm font-bold text-[#1A3629] focus:outline-none focus:border-[#1A3629]"
                />
              </div>
            </div>

            {/* Live Circadian Windows Card */}
            <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#1A3629]/20 flex flex-col gap-3">
              <span className="font-cabinet font-bold text-xs uppercase tracking-wider text-[#1A3629] flex items-center gap-1.5">
                <PixelClock size={14} className="text-[#1A3629]" />
                <span>Your Automatically Calculated Daily Windows</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#FFFDF9] border border-[#1A3629]/10">
                  <span className="font-mono text-[10px] font-bold text-amber-700 block">
                    MORNING SUNLIGHT
                  </span>
                  <span className="font-cabinet font-bold text-sm text-[#1A3629]">
                    Within 60m of {wakeTime}
                  </span>
                  <p className="text-[11px] text-[#4A5D4E] mt-0.5">
                    10 mins viewing outside light to set circadian clock.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FFFDF9] border border-[#1A3629]/10">
                  <span className="font-mono text-[10px] font-bold text-indigo-700 block">
                    CAFFEINE CUTOFF
                  </span>
                  <span className="font-cabinet font-bold text-sm text-[#1A3629]">
                    Strictly before {caffeineCutoffText}
                  </span>
                  <p className="text-[11px] text-[#4A5D4E] mt-0.5">
                    Clears adenosine receptors for uninterrupted sleep.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => {
                  retroAudio.playBlip();
                  setStep(1);
                }}
                className="py-3.5 px-4 rounded-2xl border border-[#1A3629]/20 bg-[#FAF8F5] text-[#1A3629] font-cabinet font-bold text-sm hover:bg-[#1A3629]/5 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <PixelArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  retroAudio.playInspectConfirm();
                  haptics.tap();
                  setStep(3);
                }}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-sm hover:bg-[#2C4A3B] transition-all cursor-pointer shadow-[3px_3px_0px_#2C5E43] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-2"
              >
                <span>Next: Metabolic Auto-Rebalancing</span>
                <PixelArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: METABOLIC PROTEIN & AUTO-REBALANCING ================= */}
        {step === 3 && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-150">
            <div>
              <h2 className="font-cabinet font-extrabold text-2xl text-[#1A3629] tracking-tight">
                Metabolic Floor &amp; Auto-Rebalancing
              </h2>
              <p className="font-sans text-xs sm:text-sm text-[#4A5D4E] mt-1">
                Zero calorie obsession. Cyath distributes your protein baseline and automatically rebalances dinner if your earlier meals fall short.
              </p>
            </div>

            {/* Weight & Target Input */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#1A3629]/15 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-cabinet font-bold text-xs uppercase tracking-wider text-[#1A3629]">
                  Body Weight &amp; Daily Protein Floor
                </span>
                <div className="inline-flex rounded-lg border border-[#1A3629]/20 p-0.5 bg-[#FFFDF9]">
                  <button
                    type="button"
                    onClick={() => setIsImperial(false)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                      !isImperial ? 'bg-[#1A3629] text-[#FFFDF9]' : 'text-[#1A3629]/70'
                    }`}
                  >
                    KG
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsImperial(true)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                      isImperial ? 'bg-[#1A3629] text-[#FFFDF9]' : 'text-[#1A3629]/70'
                    }`}
                  >
                    LBS
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] text-[#4A5D4E] uppercase">Bodyweight</span>
                  {!isImperial ? (
                    <input
                      type="number"
                      min={40}
                      max={200}
                      value={weightKg}
                      onChange={(e) => handleWeightKgChange(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#FFFDF9] border border-[#1A3629]/20 font-mono text-base font-bold text-[#1A3629] text-center focus:outline-none focus:border-[#1A3629]"
                    />
                  ) : (
                    <input
                      type="number"
                      min={88}
                      max={440}
                      value={weightLbs}
                      onChange={(e) => handleWeightLbsChange(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#FFFDF9] border border-[#1A3629]/20 font-mono text-base font-bold text-[#1A3629] text-center focus:outline-none focus:border-[#1A3629]"
                    />
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] text-[#4A5D4E] uppercase">Daily Target (Grams)</span>
                  <input
                    type="number"
                    min={40}
                    max={300}
                    value={targetProtein}
                    onChange={(e) => setTargetProtein(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#FFFDF9] border border-[#1A3629]/20 font-mono text-base font-bold text-[#1A3629] text-center focus:outline-none focus:border-[#1A3629]"
                  />
                </div>
              </div>
            </div>

            {/* LIVE DYNAMIC REBALANCER DEMONSTRATION */}
            <div className="p-4 rounded-2xl bg-[#E6F4EA] border border-[#10B981]/30 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="font-cabinet font-bold text-xs uppercase tracking-wider text-[#065F46] flex items-center gap-1.5">
                  <PixelLightning size={14} color="#059669" />
                  <span>How Dynamic Rebalancing Works for You</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-[#065F46] bg-[#FFFDF9] px-2 py-0.5 rounded-full border border-[#10B981]/20">
                  Target: {targetProtein}g
                </span>
              </div>

              <p className="text-xs font-sans text-[#1A3629] leading-relaxed">
                If your Breakfast and Lunch each fall short of target by 10g, Cyath does not shame you or demand food weighing.
                It seamlessly <strong>adds +20g to your Dinner target</strong>, surfacing a smart whole-food adjustment so your daily metabolic floor stays 100% intact.
              </p>

              {/* Visual distribution preview */}
              <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-center">
                <div className="p-2 rounded-xl bg-[#FFFDF9] border border-[#10B981]/20">
                  <span className="text-[10px] text-[#4A5D4E] block">Breakfast</span>
                  <span className="font-bold text-xs text-[#1A3629]">
                    ~{Math.round(targetProtein * 0.3)}g
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-[#FFFDF9] border border-[#10B981]/20">
                  <span className="text-[10px] text-[#4A5D4E] block">Lunch</span>
                  <span className="font-bold text-xs text-[#1A3629]">
                    ~{Math.round(targetProtein * 0.35)}g
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-[#FFFDF9] border-2 border-[#059669]">
                  <span className="text-[10px] text-[#059669] font-bold block">Dinner + Rollover</span>
                  <span className="font-bold text-xs text-[#065F46]">
                    Auto-Adjusted
                  </span>
                </div>
              </div>
            </div>

            {/* Optional 4th Custom Habit */}
            <div className="flex flex-col gap-2">
              <span className="font-cabinet font-bold text-xs uppercase tracking-wider text-[#1A3629]">
                Choose 4th Habit Slot
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CUSTOM_HABITS_LIBRARY.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      retroAudio.playBlip();
                      setSelectedCustomHabit(item.id);
                    }}
                    className={`p-2 rounded-xl border text-xs font-cabinet font-bold transition-all cursor-pointer text-left ${
                      selectedCustomHabit === item.id
                        ? 'border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] shadow-2xs'
                        : 'border-[#1A3629]/15 bg-[#FAF8F5] text-[#1A3629] hover:bg-[#FAF6EE]'
                    }`}
                  >
                    <span>{item.shortLabel}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => {
                  retroAudio.playBlip();
                  setStep(2);
                }}
                className="py-3.5 px-4 rounded-2xl border border-[#1A3629]/20 bg-[#FAF8F5] text-[#1A3629] font-cabinet font-bold text-sm hover:bg-[#1A3629]/5 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <PixelArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  retroAudio.playInspectConfirm();
                  haptics.tap();
                  setStep(4);
                }}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-sm hover:bg-[#2C4A3B] transition-all cursor-pointer shadow-[3px_3px_0px_#2C5E43] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-2"
              >
                <span>Next: The Daily Seal Ceremony</span>
                <PixelArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: THE SEAL CEREMONY & FIRST BRASS PUSHPIN ================= */}
        {step === 4 && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-150">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-2">
                <PixelPushpin size={36} className="filter drop-shadow-md animate-bounce" />
              </div>
              <h2 className="font-cabinet font-extrabold text-2xl sm:text-3xl text-[#1A3629] tracking-tight">
                Effortless Evening Sealing
              </h2>
              <p className="font-sans text-xs sm:text-sm text-[#4A5D4E] mt-1 max-w-sm">
                No active frantic logging throughout the day. At night, answer simple yes/no checks, pin your thermal receipt, and rest.
              </p>
            </div>

            {/* Archival Corkboard Receipt Mockup */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border-2 border-dashed border-[#1A3629]/30 relative flex flex-col gap-3 font-mono">
              <div className="flex items-center justify-between border-b border-[#1A3629]/15 pb-2">
                <span className="text-[10px] font-bold text-[#1A3629] uppercase tracking-wider flex items-center gap-1.5">
                  <PixelPushpin size={14} />
                  <span>DAILY ARCHIVAL THERMAL RECEIPT</span>
                </span>
                <span className="text-[10px] font-bold text-[#059669]">
                  100% SYNCS TO CLOUD
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-[#2C4A3B]">
                <div className="flex justify-between items-center">
                  <span>Sunlight (10m outside)</span>
                  <span className="font-bold text-[#059669] flex items-center gap-1">
                    <PixelCheck size={11} color="#059669" />
                    <span>COMPLETED</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Protein Target ({targetProtein}g floor)</span>
                  <span className="font-bold text-[#059669] flex items-center gap-1">
                    <PixelCheck size={11} color="#059669" />
                    <span>REBALANCED</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Caffeine cutoff ({caffeineCutoffText})</span>
                  <span className="font-bold text-[#059669] flex items-center gap-1">
                    <PixelCheck size={11} color="#059669" />
                    <span>LOCKED</span>
                  </span>
                </div>
              </div>

              <div className="border-t border-dashed border-[#1A3629]/20 pt-2 flex items-center justify-between text-[11px] font-bold text-[#1A3629]">
                <span>Status: Ready to be Pinned</span>
                <span className="text-amber-700 flex items-center gap-1">
                  <PixelSpark size={12} />
                  <span>+50 XP CEREMONY</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => {
                  retroAudio.playBlip();
                  setStep(3);
                }}
                className="py-3.5 px-4 rounded-2xl border border-[#1A3629]/20 bg-[#FAF8F5] text-[#1A3629] font-cabinet font-bold text-sm hover:bg-[#1A3629]/5 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <PixelArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleComplete}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-sm hover:bg-[#2C4A3B] transition-all cursor-pointer shadow-[3px_3px_0px_#2C5E43] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <PixelPushpin size={16} />
                <span>{isSubmitting ? 'Entering Sanctuary...' : 'Seal Initiation & Enter Sanctuary (+50 XP)'}</span>
                <PixelSpark size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4F0EA] flex items-center justify-center text-[#1A3629] font-mono text-xs">Loading Initiation Protocol...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
