'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useHabitStore, CUSTOM_HABITS_LIBRARY } from '@/store/useHabitStore';
import { supabase } from '@/lib/supabase';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { xpParticleEmitter } from '@/lib/particleEmitter';
import { ArrowRight, ArrowLeft, Check, Sparkles, Clock, Compass, Shield } from 'lucide-react';

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditing = searchParams.get('edit') === 'true';

  const {
    userProfile,
    updateUserProfile,
    userSession,
    currentDate,
    gainXp,
    setCustomHabitSlot,
  } = useHabitStore();

  const [step, setStep] = useState(1);
  const [operatorName, setOperatorName] = useState(userProfile?.fullName || '');
  const [wakeTime, setWakeTime] = useState(userProfile?.wakeTime || '07:30');
  const [bedTime, setBedTime] = useState(userProfile?.bedTime || '23:30');
  const [isImperial, setIsImperial] = useState(false);
  const [weightKg, setWeightKg] = useState(userProfile?.weightKg || 74);
  const [weightLbs, setWeightLbs] = useState(163);
  const [selectedCustomHabit, setSelectedCustomHabit] = useState<string>('creatine');

  useEffect(() => {
    if (isEditing && (!userSession || userSession.id.startsWith('guest_'))) {
      router.push('/login?redirect=/onboarding?edit=true');
    }
  }, [isEditing, userSession, router]);

  const handleWeightLbsChange = (lbs: number) => {
    setWeightLbs(lbs);
    setWeightKg(Math.round(lbs / 2.20462));
  };

  const handleWeightKgChange = (kg: number) => {
    setWeightKg(kg);
    setWeightLbs(Math.round(kg * 2.20462));
  };

  const estimatedProtein = Math.round(weightKg * 2.0);

  const handleComplete = async () => {
    retroAudio.playTierUpgrade();
    haptics.heavy();
    if (typeof window !== 'undefined') {
      xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 24);
    }

    const profileData = {
      fullName: operatorName.trim() || 'Cyath Explorer',
      age: userProfile?.age || 26,
      sex: userProfile?.sex || 'other' as const,
      heightCm: userProfile?.heightCm || 178,
      weightKg,
      wakeTime,
      bedTime,
      customHabitSlot: selectedCustomHabit,
      primaryGoal: 'focus' as const,
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
              onboarding_completed: true,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          );
      }
    } catch {}

    router.replace('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F4F0EA] text-[#1A3629] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="w-full max-w-xl bg-[#FFFDF9] border-2 border-[#1A3629] rounded-3xl p-6 sm:p-10 shadow-[6px_6px_0px_#1A3629] flex flex-col gap-6 relative z-10 animate-in fade-in duration-200">
        
        {/* Progress header */}
        <div className="flex items-center justify-between border-b border-[#1A3629]/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1A3629]" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#4A5D4E]">
              Sanctuary Initiation · Step {step} of 2
            </span>
          </div>
          <span className="font-mono text-xs font-bold text-[#1A3629]">
            {step === 1 ? '50%' : '100%'}
          </span>
        </div>

        {/* STEP 1: Island & Identity */}
        {step === 1 && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-150">
            <div className="flex flex-col items-center text-center">
              <div className="w-36 h-36 relative mb-3">
                <Image
                  src="/islands/r1.webp"
                  alt="The Awakening Rock"
                  fill
                  priority
                  className="object-contain drop-shadow-md select-none"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <h1 className="font-cabinet font-extrabold text-2xl sm:text-3xl text-[#1A3629] tracking-tight">
                Your Floating Sanctuary Awaits
              </h1>
              <p className="font-sans text-xs sm:text-sm text-[#4A5D4E] mt-1 max-w-sm">
                A personal 16-bit ecosystem that responds to your daily sunlight, hydration, and nutrition.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="operator-name" className="font-cabinet font-bold text-xs uppercase tracking-wider text-[#1A3629]">
                Operator Name or Call-Sign
              </label>
              <input
                id="operator-name"
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                placeholder="e.g. Atlas, Maya, Sol"
                maxLength={24}
                className="w-full px-4 py-3 rounded-2xl border border-[#1A3629]/20 bg-[#FAF8F5] text-sm font-cabinet font-bold text-[#1A3629] focus:outline-none focus:border-[#1A3629] focus:ring-1 focus:ring-[#1A3629]"
                autoFocus
              />
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
              <span>Next: Set Cadence &amp; Floor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Sleep Schedule & Protein Target */}
        {step === 2 && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-150">
            <div>
              <h2 className="font-cabinet font-extrabold text-2xl text-[#1A3629] tracking-tight">
                Calibrate Daily Cadence
              </h2>
              <p className="font-sans text-xs sm:text-sm text-[#4A5D4E] mt-1">
                Your circadian light window, caffeine cutoff, and evening seal dynamically align to these times.
              </p>
            </div>

            {/* Wake & Sleep times */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#1A3629]/15">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#4A5D4E] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#1A3629]" />
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
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#4A5D4E] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#1A3629]" />
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

            {/* Weight & Protein Target */}
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

              <div className="flex items-center gap-4">
                {!isImperial ? (
                  <input
                    type="number"
                    min={40}
                    max={200}
                    value={weightKg}
                    onChange={(e) => handleWeightKgChange(Number(e.target.value))}
                    className="w-24 px-3 py-2 rounded-xl bg-[#FFFDF9] border border-[#1A3629]/20 font-mono text-base font-bold text-[#1A3629] text-center focus:outline-none focus:border-[#1A3629]"
                  />
                ) : (
                  <input
                    type="number"
                    min={88}
                    max={440}
                    value={weightLbs}
                    onChange={(e) => handleWeightLbsChange(Number(e.target.value))}
                    className="w-24 px-3 py-2 rounded-xl bg-[#FFFDF9] border border-[#1A3629]/20 font-mono text-base font-bold text-[#1A3629] text-center focus:outline-none focus:border-[#1A3629]"
                  />
                )}

                <div className="flex flex-col">
                  <span className="font-mono text-xs font-bold text-[#1A3629]">
                    {estimatedProtein}g Whole-Food Target
                  </span>
                  <span className="text-[11px] text-[#4A5D4E] font-sans">
                    2.0g per kg baseline for muscle preservation and satiety
                  </span>
                </div>
              </div>
            </div>

            {/* Optional 4th Custom Habit */}
            <div className="flex flex-col gap-2">
              <span className="font-cabinet font-bold text-xs uppercase tracking-wider text-[#1A3629]">
                Choose 4th Power Lever (Optional)
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

            {/* Navigation buttons */}
            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => {
                  retroAudio.playBlip();
                  setStep(1);
                }}
                className="py-3.5 px-4 rounded-2xl border border-[#1A3629]/20 bg-[#FAF8F5] text-[#1A3629] font-cabinet font-bold text-sm hover:bg-[#1A3629]/5 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleComplete}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-sm hover:bg-[#2C4A3B] transition-all cursor-pointer shadow-[3px_3px_0px_#2C5E43] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-2"
              >
                <span>Enter Sanctuary (+50 XP)</span>
                <Sparkles className="w-4 h-4" />
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
    <Suspense fallback={<div className="min-h-screen bg-[#F4F0EA] flex items-center justify-center text-[#1A3629] font-mono text-xs">Loading Initiation...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
