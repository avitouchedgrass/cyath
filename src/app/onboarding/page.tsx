'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useHabitStore } from '@/store/useHabitStore';
import { supabase } from '@/lib/supabase';
import { retroAudio } from '@/lib/retroAudio';
import { xpParticleEmitter } from '@/lib/particleEmitter';
import { calculateEnergyAudit, EnergyAuditAnswers } from '@/lib/energyAuditEngine';
import { TrajectorySimulator } from '@/components/onboarding/TrajectorySimulator';
import { ChevronDown, Check } from 'lucide-react';

const SEX_OPTIONS: { id: 'male' | 'female' | 'other' | 'prefer_not_to_say'; label: string }[] = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'other', label: 'Other / Non-Binary' },
  { id: 'prefer_not_to_say', label: 'Prefer not to say' },
];

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditing = searchParams.get('edit') === 'true';

  const {
    userProfile,
    updateUserProfile,
    userSession,
    acceptDailyProtocol,
    currentDate,
    gainXp,
  } = useHabitStore();

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  useEffect(() => {
    if (isEditing && (!userSession || userSession.id.startsWith('guest_'))) {
      router.push('/login?redirect=/onboarding?edit=true');
    }
  }, [isEditing, userSession, router]);

  // Step 1: Baseline Demographics & Biometrics
  const [fullName, setFullName] = useState(userProfile?.fullName || '');
  const [age, setAge] = useState<number | ''>(userProfile?.age || 26);
  const [sex, setSex] = useState<'male' | 'female' | 'other' | 'prefer_not_to_say'>(
    userProfile?.sex || 'other'
  );
  const [isSexDropdownOpen, setIsSexDropdownOpen] = useState(false);
  const sexDropdownRef = useRef<HTMLDivElement>(null);

  const [isImperial, setIsImperial] = useState(false);
  const [heightCm, setHeightCm] = useState(userProfile?.heightCm || 178);
  const [weightKg, setWeightKg] = useState(userProfile?.weightKg || 74);
  const [heightFeet, setHeightFeet] = useState(5);
  const [heightInches, setHeightInches] = useState(10);
  const [weightLbs, setWeightLbs] = useState(163);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sexDropdownRef.current && !sexDropdownRef.current.contains(event.target as Node)) {
        setIsSexDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update imperial conversions
  useEffect(() => {
    const totalInches = heightCm / 2.54;
    setHeightFeet(Math.floor(totalInches / 12));
    setHeightInches(Math.round(totalInches % 12));
    setWeightLbs(Math.round(weightKg * 2.20462));
  }, [heightCm, weightKg]);

  const handleHeightImperialChange = (feet: number, inches: number) => {
    setHeightFeet(feet);
    setHeightInches(inches);
    const cm = Math.round((feet * 12 + inches) * 2.54);
    setHeightCm(cm);
  };

  const handleWeightLbsChange = (lbs: number) => {
    setWeightLbs(lbs);
    const kg = Math.round(lbs / 2.20462);
    setWeightKg(kg);
  };

  const parsedAge = typeof age === 'number' ? age : 0;
  const isAgeValid = age !== '' && parsedAge >= 10 && parsedAge <= 120;
  const estimatedProteinTarget = Math.round(weightKg * 2.0);
  const estimatedHydrationTarget = (weightKg * 0.04).toFixed(1);

  // Step 2: 60-Second Energy Leak Diagnostic Questions
  const [auditAnswers, setAuditAnswers] = useState<EnergyAuditAnswers>({
    caffeineTiming: 'immediate',
    middayFuel: 'high_carb',
    afternoonSlump: 'severe',
    screenCutoff: 'within_30m',
  });

  // Calculate audit results reactively
  const auditResult = useMemo(() => calculateEnergyAudit(auditAnswers), [auditAnswers]);

  const nextStep = () => {
    if (step === 1 && !isAgeValid) return;
    retroAudio.playInspectConfirm();
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    retroAudio.playBlip();
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    retroAudio.playTierUpgrade();
    xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 20);

    const profileData = {
      fullName: fullName.trim() || 'Cyath Explorer',
      age: typeof age === 'number' ? age : 26,
      sex,
      heightCm,
      weightKg,
      primaryGoal: 'focus' as const,
      allergies: userProfile?.allergies || [],
      dietaryRestrictions: userProfile?.dietaryRestrictions || ['High-Protein Omnivore'],
      onboardingCompleted: true,
      energyAudit: {
        hoursLostPerDay: auditResult.hoursLostPerDay,
        daysLostPerYear: auditResult.daysLostPerYear,
        enduranceDeficitPercent: auditResult.enduranceDeficitPercent,
        primaryLeverTitle: auditResult.primaryLever.title,
        protocolId: auditResult.primaryLever.protocolId,
      },
    };

    const isFirstTimeOnboarding = !userProfile?.onboardingCompleted;
    updateUserProfile(profileData);
    acceptDailyProtocol(currentDate);

    if (isFirstTimeOnboarding) {
      gainXp(25, 'Welcome Explorer Bonus');
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const activeUserId = session?.user?.id || userSession?.id;
      if (activeUserId && !activeUserId.startsWith('guest_')) {
        await supabase
          .from('user_profiles')
          .upsert(
            {
              user_id: activeUserId,
              full_name: profileData.fullName,
              age: profileData.age,
              sex: profileData.sex,
              height_cm: profileData.heightCm,
              weight_kg: profileData.weightKg,
              primary_goal: profileData.primaryGoal,
              allergies: profileData.allergies,
              dietary_restrictions: profileData.dietaryRestrictions,
              onboarding_completed: true,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          );
      }
    } catch (err) {
      console.warn('Direct onboarding Supabase sync fallback:', err);
    }

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F4F0EA] text-[#1A3629] flex flex-col items-center justify-center px-4 sm:px-6 py-10 relative overflow-hidden selection:bg-[#1A3629] selection:text-[#FFFDF9]">
      {/* Subtle Archival Drafting Grid Pattern (Softly masked) */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-35 mix-blend-multiply"
        style={{
          backgroundImage: 'radial-gradient(#1A3629 0.75px, transparent 0.75px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse at 50% 50%, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 40%, transparent 80%)'
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-2xl mx-auto">
        {/* Top Header & Progress */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-full border border-[#1A3629]/15 bg-[#1A3629] text-[#FFFDF9] shadow-2xs hover:bg-[#234535] active:scale-95 transition-all cursor-pointer"
          >
            <span>← Home</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-[#1A3629]/70 tracking-wider">
              STEP {step} OF {totalSteps}
            </span>
            <div className="w-24 h-2 rounded-full bg-[#E8DECF] overflow-hidden">
              <div
                className="h-full bg-[#1A3629] transition-all duration-300 rounded-full"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main Card Container */}
        <div className="rounded-3xl p-6 sm:p-9 border border-[#1A3629]/15 bg-[#FFFDF9] shadow-[0_20px_50px_rgba(26,54,41,0.08)] transition-all">
          {/* ========================================================================= */}
          {/* STEP 1: Baseline Demographics & Biometrics                                */}
          {/* ========================================================================= */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#1A3629]/60">
                  STEP 1 · YOUR DETAILS
                </span>
                <h1 className="font-cabinet font-extrabold text-2xl sm:text-3xl tracking-tight text-[#1A3629] mt-1">
                  Set Your Daily Baseline
                </h1>
                <p className="text-xs sm:text-sm mt-1 font-cabinet font-medium text-[#2C4A3B]">
                  Calculate your daily protein and water targets based on your body weight.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase font-bold mb-1.5 text-[#1A3629]">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Vance"
                    className="w-full px-4 py-3 rounded-xl border border-[#1A3629]/20 bg-[#F4F0EA] text-[#1A3629] placeholder-[#1A3629]/40 focus:border-[#1A3629] shadow-2xs text-sm font-cabinet font-bold focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Age */}
                  <div>
                    <label className="block text-xs font-mono uppercase font-bold mb-1.5 text-[#1A3629]">
                      Age (Years)
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 28"
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-mono font-bold focus:outline-none bg-[#F4F0EA] ${!isAgeValid && age !== ''
                          ? 'border-red-500 text-red-700'
                          : 'border-[#1A3629]/20 text-[#1A3629] focus:border-[#1A3629] shadow-2xs'
                        }`}
                    />
                    {!isAgeValid && age !== '' && (
                      <span className="text-[11px] font-mono text-red-600 mt-1 block font-bold">
                        {parsedAge > 120 ? 'Maximum age is 120.' : 'Please enter age between 10 and 120.'}
                      </span>
                    )}
                  </div>

                  {/* Biological Sex / Gender */}
                  <div className="relative" ref={sexDropdownRef}>
                    <label className="block text-xs font-mono uppercase font-bold mb-1.5 text-[#1A3629]">
                      Biological Sex
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsSexDropdownOpen(!isSexDropdownOpen)}
                      className="w-full px-4 py-3 rounded-xl border border-[#1A3629]/20 bg-[#F4F0EA] text-[#1A3629] shadow-2xs text-sm font-cabinet font-bold flex items-center justify-between cursor-pointer"
                    >
                      <span>{SEX_OPTIONS.find((o) => o.id === sex)?.label || 'Select'}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${isSexDropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {isSexDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-[#1A3629]/15 bg-[#FFFDF9] p-1.5 shadow-[0_10px_30px_rgba(26,54,41,0.12)] z-30 font-mono text-xs">
                        {SEX_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              retroAudio.playBlip();
                              setSex(opt.id);
                              setIsSexDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 rounded-lg flex items-center justify-between cursor-pointer ${sex === opt.id
                                ? 'bg-[#1A3629] text-[#FFFDF9] font-bold'
                                : 'text-[#1A3629] hover:bg-black/5'
                              }`}
                          >
                            <span>{opt.label}</span>
                            {sex === opt.id && <Check className="w-3.5 h-3.5" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Height & Weight with Unit Switcher */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-mono uppercase font-bold text-[#1A3629]">
                      Height &amp; Body Weight
                    </label>
                    <div className="flex items-center gap-1 p-0.5 rounded-full border border-[#1A3629]/15 bg-[#F4F0EA] text-[11px] font-mono font-bold">
                      <button
                        type="button"
                        onClick={() => setIsImperial(false)}
                        className={`px-2.5 py-0.5 rounded-full cursor-pointer transition-colors ${!isImperial ? 'bg-[#1A3629] text-[#FFFDF9]' : 'opacity-60 text-[#1A3629]'
                          }`}
                      >
                        Metric
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsImperial(true)}
                        className={`px-2.5 py-0.5 rounded-full cursor-pointer transition-colors ${isImperial ? 'bg-[#1A3629] text-[#FFFDF9]' : 'opacity-60 text-[#1A3629]'
                          }`}
                      >
                        Imperial
                      </button>
                    </div>
                  </div>

                  {isImperial ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="3"
                          max="7"
                          value={heightFeet}
                          onChange={(e) => handleHeightImperialChange(Number(e.target.value), heightInches)}
                          className="w-full px-3 py-3 rounded-xl border border-[#1A3629]/20 bg-[#F4F0EA] text-[#1A3629] text-sm font-mono font-bold text-center focus:border-[#1A3629] shadow-2xs"
                        />
                        <span className="text-xs font-mono font-bold text-[#1A3629]">ft</span>
                        <input
                          type="number"
                          min="0"
                          max="11"
                          value={heightInches}
                          onChange={(e) => handleHeightImperialChange(heightFeet, Number(e.target.value))}
                          className="w-full px-3 py-3 rounded-xl border border-[#1A3629]/20 bg-[#F4F0EA] text-[#1A3629] text-sm font-mono font-bold text-center focus:border-[#1A3629] shadow-2xs"
                        />
                        <span className="text-xs font-mono font-bold text-[#1A3629]">in</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="70"
                          max="400"
                          value={weightLbs}
                          onChange={(e) => handleWeightLbsChange(Number(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl border border-[#1A3629]/20 bg-[#F4F0EA] text-[#1A3629] text-sm font-mono font-bold focus:border-[#1A3629] shadow-2xs"
                        />
                        <span className="text-xs font-mono font-bold text-[#1A3629]">lbs</span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="100"
                          max="250"
                          value={heightCm}
                          onChange={(e) => setHeightCm(Number(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl border border-[#1A3629]/20 bg-[#F4F0EA] text-[#1A3629] text-sm font-mono font-bold focus:border-[#1A3629] shadow-2xs"
                        />
                        <span className="text-xs font-mono font-bold text-[#1A3629]">cm</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="35"
                          max="200"
                          value={weightKg}
                          onChange={(e) => setWeightKg(Number(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl border border-[#1A3629]/20 bg-[#F4F0EA] text-[#1A3629] text-sm font-mono font-bold focus:border-[#1A3629] shadow-2xs"
                        />
                        <span className="text-xs font-mono font-bold text-[#1A3629]">kg</span>
                      </div>
                    </div>
                  )}

                  {/* Daily Target Output Card */}
                  <div className="mt-4 p-4 rounded-2xl border border-[#1A3629]/15 bg-[#FAF8F5] flex items-center justify-between">
                    <div>
                      <div className="font-mono text-xs font-bold uppercase text-[#1A3629]">
                        Daily Targets
                      </div>
                      <div className="text-[11px] font-cabinet font-medium text-[#2C4A3B]">
                        Estimated from your body weight
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-sm font-black text-[#1A3629]">~{estimatedProteinTarget}g Protein</div>
                      <div className="text-[11px] font-bold text-[#2C4A3B]">~{estimatedHydrationTarget}L Water</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: Daily Routine Questions                                           */}
          {/* ========================================================================= */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#1A3629]/60">
                  STEP 2 · DAILY ROUTINE
                </span>
                <h1 className="font-cabinet font-extrabold text-2xl sm:text-3xl tracking-tight text-[#1A3629] mt-1">
                  Your Current Daily Habits
                </h1>
                <p className="text-xs sm:text-sm mt-1 font-cabinet font-medium text-[#2C4A3B]">
                  Four daily habits that most strongly affect your focus and afternoon energy.
                </p>
              </div>

              <div className="space-y-5">
                {/* 1. Caffeine Timing */}
                <div>
                  <label className="block text-xs font-mono uppercase font-bold mb-2 text-[#1A3629]">
                    1. Morning Caffeine Timing
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        retroAudio.playBlip();
                        setAuditAnswers((prev) => ({ ...prev, caffeineTiming: 'immediate' }));
                      }}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                        auditAnswers.caffeineTiming === 'immediate'
                          ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-xs'
                          : 'bg-[#FFFDF9] text-[#1A3629] border-[#1A3629]/15 hover:border-[#1A3629]/40 hover:bg-[#FAF8F5] shadow-2xs'
                      }`}
                    >
                      <div className="font-cabinet font-bold text-sm">Within 30 min of waking</div>
                      <div className="text-[11px] opacity-75 mt-0.5">
                        Can trigger an afternoon energy dip
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        retroAudio.playBlip();
                        setAuditAnswers((prev) => ({ ...prev, caffeineTiming: 'delayed' }));
                      }}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                        auditAnswers.caffeineTiming === 'delayed'
                          ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-xs'
                          : 'bg-[#FFFDF9] text-[#1A3629] border-[#1A3629]/15 hover:border-[#1A3629]/40 hover:bg-[#FAF8F5] shadow-2xs'
                      }`}
                    >
                      <div className="font-cabinet font-bold text-sm">Delayed 90+ minutes</div>
                      <div className="text-[11px] opacity-75 mt-0.5">
                        Allows natural morning energy to build; steady all day
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. Midday Nutrition */}
                <div>
                  <label className="block text-xs font-mono uppercase font-bold mb-2 text-[#1A3629]">
                    2. Typical Midday Meal / Lunch
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        retroAudio.playBlip();
                        setAuditAnswers((prev) => ({ ...prev, middayFuel: 'high_carb' }));
                      }}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                        auditAnswers.middayFuel === 'high_carb'
                          ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-xs'
                          : 'bg-[#FFFDF9] text-[#1A3629] border-[#1A3629]/15 hover:border-[#1A3629]/40 hover:bg-[#FAF8F5] shadow-2xs'
                      }`}
                    >
                      <div className="font-cabinet font-bold text-sm">Heavy Carbs or Takeout</div>
                      <div className="text-[10px] opacity-75 mt-0.5">Quick spike and afternoon dip</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        retroAudio.playBlip();
                        setAuditAnswers((prev) => ({ ...prev, middayFuel: 'high_protein' }));
                      }}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                        auditAnswers.middayFuel === 'high_protein'
                          ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-xs'
                          : 'bg-[#FFFDF9] text-[#1A3629] border-[#1A3629]/15 hover:border-[#1A3629]/40 hover:bg-[#FAF8F5] shadow-2xs'
                      }`}
                    >
                      <div className="font-cabinet font-bold text-sm">High-Protein &amp; Balanced</div>
                      <div className="text-[10px] opacity-75 mt-0.5">Steady, long-lasting focus</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        retroAudio.playBlip();
                        setAuditAnswers((prev) => ({ ...prev, middayFuel: 'skip_fast' }));
                      }}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                        auditAnswers.middayFuel === 'skip_fast'
                          ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-xs'
                          : 'bg-[#FFFDF9] text-[#1A3629] border-[#1A3629]/15 hover:border-[#1A3629]/40 hover:bg-[#FAF8F5] shadow-2xs'
                      }`}
                    >
                      <div className="font-cabinet font-bold text-sm">Skip Lunch / Coffee Only</div>
                      <div className="text-[10px] opacity-75 mt-0.5">Late afternoon fog</div>
                    </button>
                  </div>
                </div>

                {/* 3. Afternoon Slump */}
                <div>
                  <label className="block text-xs font-mono uppercase font-bold mb-2 text-[#1A3629]">
                    3. Afternoon Slump (2:00 - 4:00 PM)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        retroAudio.playBlip();
                        setAuditAnswers((prev) => ({ ...prev, afternoonSlump: 'severe' }));
                      }}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                        auditAnswers.afternoonSlump === 'severe'
                          ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-xs'
                          : 'bg-[#FFFDF9] text-[#1A3629] border-[#1A3629]/15 hover:border-[#1A3629]/40 hover:bg-[#FAF8F5] shadow-2xs'
                      }`}
                    >
                      <div className="font-cabinet font-bold text-sm">Heavy Slump (2h+)</div>
                      <div className="text-[10px] opacity-75 mt-0.5">Sluggish, hard to focus</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        retroAudio.playBlip();
                        setAuditAnswers((prev) => ({ ...prev, afternoonSlump: 'moderate' }));
                      }}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                        auditAnswers.afternoonSlump === 'moderate'
                          ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-xs'
                          : 'bg-[#FFFDF9] text-[#1A3629] border-[#1A3629]/15 hover:border-[#1A3629]/40 hover:bg-[#FAF8F5] shadow-2xs'
                      }`}
                    >
                      <div className="font-cabinet font-bold text-sm">Mild Dip</div>
                      <div className="text-[10px] opacity-75 mt-0.5">Need caffeine or a push</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        retroAudio.playBlip();
                        setAuditAnswers((prev) => ({ ...prev, afternoonSlump: 'none' }));
                      }}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                        auditAnswers.afternoonSlump === 'none'
                          ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-xs'
                          : 'bg-[#FFFDF9] text-[#1A3629] border-[#1A3629]/15 hover:border-[#1A3629]/40 hover:bg-[#FAF8F5] shadow-2xs'
                      }`}
                    >
                      <div className="font-cabinet font-bold text-sm">Minimal Dip</div>
                      <div className="text-[10px] opacity-75 mt-0.5">Steady energy all afternoon</div>
                    </button>
                  </div>
                </div>

                {/* 4. Evening Screen Exposure */}
                <div>
                  <label className="block text-xs font-mono uppercase font-bold mb-2 text-[#1A3629]">
                    4. Screen Time Before Bed
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        retroAudio.playBlip();
                        setAuditAnswers((prev) => ({ ...prev, screenCutoff: 'within_30m' }));
                      }}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                        auditAnswers.screenCutoff === 'within_30m'
                          ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-xs'
                          : 'bg-[#FFFDF9] text-[#1A3629] border-[#1A3629]/15 hover:border-[#1A3629]/40 hover:bg-[#FAF8F5] shadow-2xs'
                      }`}
                    >
                      <div className="font-cabinet font-bold text-sm">Screens in Bed</div>
                      <div className="text-[10px] opacity-75 mt-0.5">Delays deep sleep</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        retroAudio.playBlip();
                        setAuditAnswers((prev) => ({ ...prev, screenCutoff: 'filtered' }));
                      }}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                        auditAnswers.screenCutoff === 'filtered'
                          ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-xs'
                          : 'bg-[#FFFDF9] text-[#1A3629] border-[#1A3629]/15 hover:border-[#1A3629]/40 hover:bg-[#FAF8F5] shadow-2xs'
                      }`}
                    >
                      <div className="font-cabinet font-bold text-sm">Night Mode / Filter</div>
                      <div className="text-[10px] opacity-75 mt-0.5">Moderate screen filter</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        retroAudio.playBlip();
                        setAuditAnswers((prev) => ({ ...prev, screenCutoff: 'dark_60m' }));
                      }}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                        auditAnswers.screenCutoff === 'dark_60m'
                          ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-xs'
                          : 'bg-[#FFFDF9] text-[#1A3629] border-[#1A3629]/15 hover:border-[#1A3629]/40 hover:bg-[#FAF8F5] shadow-2xs'
                      }`}
                    >
                      <div className="font-cabinet font-bold text-sm">Screen-Free 1 Hour+</div>
                      <div className="text-[10px] opacity-75 mt-0.5">Restorative, deep sleep</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: Energy Assessment & Projection                                    */}
          {/* ========================================================================= */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#1A3629]/60">
                  STEP 3 · ENERGY AUDIT
                </span>
                <h1 className="font-cabinet font-extrabold text-2xl sm:text-3xl tracking-tight text-[#1A3629] mt-1">
                  Your Energy Assessment
                </h1>
                <p className="text-xs sm:text-sm mt-1 font-cabinet font-medium text-[#2C4A3B]">
                  Based on your caffeine timing, lunch choices, and evening screen habits.
                </p>
              </div>

              {/* Clean Highlight Stat Panel */}
              <div className="p-5 rounded-2xl border border-[#1A3629]/10 bg-[#FFFDF9] shadow-[0_2px_12px_rgba(26,54,41,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="font-mono text-xs uppercase tracking-wider font-bold text-[#991B1B] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#991B1B]" />
                    ESTIMATED DAILY ENERGY DRAIN
                  </div>
                  <div className="font-cabinet font-black text-3xl sm:text-4xl text-[#1A3629] mt-1">
                    ~{auditResult.hoursLostPerDay} Hours / Day
                  </div>
                  <div className="text-xs font-cabinet font-medium text-[#2C4A3B] mt-1">
                    Lost to afternoon fatigue, sluggish focus, and delayed sleep.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-[#1A3629]/10 bg-[#F4F0EA] text-right font-mono shrink-0">
                  <div className="text-[10px] uppercase text-[#1A3629]/60 font-bold">Afternoon Dip</div>
                  <div className="text-xl font-bold text-[#991B1B]">-{auditResult.enduranceDeficitPercent}%</div>
                  <div className="text-[10px] text-[#2C4A3B]">below morning focus</div>
                </div>
              </div>

              {/* Interactive SVG Trajectory Simulator */}
              <TrajectorySimulator
                points={auditResult.trajectoryPoints}
                hoursLostPerDay={auditResult.hoursLostPerDay}
                daysLostPerYear={auditResult.daysLostPerYear}
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: 7-Day Habit Plan                                                  */}
          {/* ========================================================================= */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#1A3629]/60">
                  STEP 4 · YOUR 7-DAY PLAN
                </span>
                <h1 className="font-cabinet font-extrabold text-2xl sm:text-3xl tracking-tight text-[#1A3629] mt-1">
                  Your 7-Day Habit Plan
                </h1>
                <p className="text-xs sm:text-sm mt-1 font-cabinet font-medium text-[#2C4A3B]">
                  Start with one daily habit that will make the biggest immediate difference to your energy.
                </p>
              </div>

              <div className="space-y-3.5">
                {/* 1. Primary Protocol Lever */}
                <div className="p-5 rounded-2xl border border-[#1A3629]/10 bg-[#FFFDF9] shadow-[0_2px_12px_rgba(26,54,41,0.03)]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#1A3629] text-[#FFFDF9] font-bold">
                      CORE HABIT FOR THIS WEEK
                    </span>
                    <span className="font-mono text-xs font-bold text-[#1A3629]">
                      ~{auditResult.primaryLever.expectedGainHours}h daily energy regained
                    </span>
                  </div>
                  <div className="font-cabinet font-bold text-lg text-[#1A3629] mt-1">
                    {auditResult.primaryLever.title}
                  </div>
                  <p className="text-xs font-cabinet text-[#2C4A3B] mt-1 leading-relaxed">
                    {auditResult.primaryLever.mechanism}
                  </p>
                </div>

                {/* 2. Fuel Quotas & Desk Rituals */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl border border-[#1A3629]/10 bg-[#FFFDF9] shadow-2xs">
                    <div className="font-mono text-[10px] uppercase font-bold text-[#1A3629]/60">
                      DAILY TARGETS
                    </div>
                    <div className="font-cabinet font-bold text-sm text-[#1A3629] mt-0.5">
                      ~{estimatedProteinTarget}g Protein &middot; {estimatedHydrationTarget}L Water
                    </div>
                    <div className="text-[11px] text-[#2C4A3B] mt-0.5">
                      Steady energy without crashes
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-[#1A3629]/10 bg-[#FFFDF9] shadow-2xs">
                    <div className="font-mono text-[10px] uppercase font-bold text-[#1A3629]/60">
                      DAILY CHECK-INS
                    </div>
                    <div className="font-cabinet font-bold text-sm text-[#1A3629] mt-0.5">
                      Morning &amp; Evening Check-In
                    </div>
                    <div className="text-[11px] text-[#2C4A3B] mt-0.5">
                      Quick 15-second daily check-ins
                    </div>
                  </div>
                </div>

                {/* 3. Setup XP Bonus */}
                <div className="p-4 rounded-2xl border border-[#C9A84C]/30 bg-[#FFFDF9] flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-base font-bold text-[#C9A84C]">◈</span>
                    <div>
                      <div className="font-cabinet font-bold text-sm text-[#1A3629]">
                        Welcome Setup Bonus
                      </div>
                      <div className="text-[11px] font-mono text-[#2C4A3B]">
                        Added to your profile on completion
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-black px-2.5 py-1 rounded-full bg-[#1A3629] text-[#FFFDF9]">
                    +25 XP
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 mt-8 border-t border-[#1A3629]/10">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-5 py-2.5 rounded-full border border-[#1A3629]/20 bg-[#FFFDF9] text-[#1A3629] font-cabinet font-bold text-xs hover:bg-[#F4F0EA] transition-all cursor-pointer shadow-2xs"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={nextStep}
              disabled={step === 1 && !isAgeValid}
              className={`px-6 py-3 rounded-full border border-transparent font-cabinet font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                step === 1 && !isAgeValid
                  ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
                  : 'bg-[#1A3629] text-[#FFFDF9] hover:bg-[#2C4A3B] shadow-xs active:scale-[0.99]'
              }`}
            >
              <span>
                {step === totalSteps
                  ? isEditing
                    ? 'Save Changes'
                    : 'Complete Setup & Start (+100 XP) →'
                  : step === 1
                    ? 'Continue to Energy Audit →'
                    : step === 2
                      ? 'View Your Energy Assessment →'
                      : 'View Your 7-Day Plan →'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F0EA] flex items-center justify-center text-xs font-mono text-[#1A3629]">
          Loading setup...
        </div>
      }
    >
      <OnboardingContent />
    </React.Suspense>
  );
}
