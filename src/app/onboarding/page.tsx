'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useHabitStore } from '@/store/useHabitStore';
import { Logo } from '@/components/ui/Logo';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Zap,
  Dumbbell,
  Moon,
  Sparkles,
  Heart,
  ShieldAlert,
  Sliders,
  Scale,
  User,
  Utensils,
} from 'lucide-react';

const GOAL_OPTIONS = [
  {
    id: 'focus' as const,
    title: 'Peak Cognitive Focus',
    description: 'Eliminate brain fog, stabilize dopamine, and lock into deep work sessions.',
    icon: Zap,
    recommendedProtocols: ['deep-focus-sprint'],
  },
  {
    id: 'muscle' as const,
    title: 'Muscle Fuel & Strength',
    description: 'Optimize whole-food amino acid intake, protein timing, and recovery.',
    icon: Dumbbell,
    recommendedProtocols: ['strength-muscle-fuel'],
  },
  {
    id: 'sleep' as const,
    title: 'Circadian Sleep & Energy',
    description: 'Calibrate light exposure, lower cortisol, and achieve restorative REM sleep.',
    icon: Moon,
    recommendedProtocols: ['morning-activation', 'deep-rem-sleep'],
  },
  {
    id: 'longevity' as const,
    title: 'Metabolic Health & Longevity',
    description: 'Maintain glycemic stability, cellular hydration, and sustained daily vigor.',
    icon: Heart,
    recommendedProtocols: ['morning-activation'],
  },
];

const ALLERGY_OPTIONS = [
  'Gluten',
  'Dairy',
  'Peanuts',
  'Tree Nuts',
  'Shellfish',
  'Eggs',
  'Soy',
  'None / No Restrictions',
];

const DIETARY_STYLES = [
  'High-Protein Omnivore',
  'Pescatarian',
  'Vegetarian',
  'Vegan / Plant-Based',
  'Low-Carb / Keto',
];

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditing = searchParams.get('edit') === 'true';

  const { userProfile, updateUserProfile, userSession } = useHabitStore();

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Form State initialized from store or defaults
  const [fullName, setFullName] = useState(userProfile?.fullName || '');
  const [age, setAge] = useState(userProfile?.age || 26);
  const [sex, setSex] = useState<'male' | 'female' | 'other' | 'prefer_not_to_say'>(userProfile?.sex || 'male');
  
  // Unit toggle for biometrics
  const [isImperial, setIsImperial] = useState(false);
  const [heightCm, setHeightCm] = useState(userProfile?.heightCm || 178);
  const [weightKg, setWeightKg] = useState(userProfile?.weightKg || 74);

  // Imperial helper fields
  const [heightFeet, setHeightFeet] = useState(5);
  const [heightInches, setHeightInches] = useState(10);
  const [weightLbs, setWeightLbs] = useState(163);

  const [primaryGoal, setPrimaryGoal] = useState<'focus' | 'muscle' | 'sleep' | 'longevity' | 'fat_loss'>(
    userProfile?.primaryGoal || 'focus'
  );
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(userProfile?.allergies || []);
  const [selectedDiet, setSelectedDiet] = useState<string>(userProfile?.dietaryRestrictions?.[0] || 'High-Protein Omnivore');

  // Sync imperial to metric
  const handleHeightImperialChange = (feet: number, inches: number) => {
    setHeightFeet(feet);
    setHeightInches(inches);
    const totalInches = feet * 12 + inches;
    setHeightCm(Math.round(totalInches * 2.54));
  };

  const handleWeightLbsChange = (lbs: number) => {
    setWeightLbs(lbs);
    setWeightKg(Math.round(lbs * 0.453592));
  };

  const toggleAllergy = (allergy: string) => {
    if (allergy === 'None / No Restrictions') {
      setSelectedAllergies(['None / No Restrictions']);
      return;
    }

    setSelectedAllergies((prev) => {
      const filtered = prev.filter((a) => a !== 'None / No Restrictions');
      if (filtered.includes(allergy)) {
        return filtered.filter((a) => a !== allergy);
      } else {
        return [...filtered, allergy];
      }
    });
  };

  // Calculated Calibrated Targets
  const estimatedProteinTarget = Math.round(weightKg * 1.8);
  const estimatedHydrationTarget = (Math.round((weightKg * 0.035) * 10) / 10).toFixed(1);

  const handleFinish = () => {
    updateUserProfile({
      fullName: fullName.trim() || 'Cyath Explorer',
      age,
      sex,
      heightCm,
      weightKg,
      primaryGoal,
      allergies: selectedAllergies,
      dietaryRestrictions: [selectedDiet],
      onboardingCompleted: true,
    });

    if (isEditing) {
      router.push('/profile');
    } else {
      router.push('/dashboard');
    }
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-neutral-100 selection:bg-white selection:text-black flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background Radial Glow */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(circle at 50% 15%, rgba(255, 255, 255, 0.03) 0%, transparent 60%)
          `,
        }}
      />

      <div className="relative z-10 w-full max-w-xl mx-auto">
        
        {/* Top Header Monogram & Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Logo className="w-9 h-9" />
            <div>
              <div className="text-xs font-mono font-medium text-white">Personal Profile Setup</div>
              <div className="text-[10px] font-mono text-neutral-500">
                Step {step} of {totalSteps}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Dynamic Step Container */}
        <div className="backdrop-blur-2xl bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-9 shadow-2xl">
          
          {/* STEP 1: Personal Demographics */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif font-normal text-2xl sm:text-3xl text-white tracking-tight">
                  Personal Identity
                </h1>
                <p className="text-neutral-400 text-xs sm:text-sm mt-1 font-sans">
                  We&apos;ll customize your daily protocol targets and baseline recommendations.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                    Full Name or Preferred Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-white/40 font-sans transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                      Age (Years)
                    </label>
                    <input
                      type="number"
                      min="14"
                      max="100"
                      value={age}
                      onChange={(e) => setAge(Math.max(14, Number(e.target.value)))}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white text-sm focus:outline-none focus:border-white/40 font-mono transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                      Biological Sex / Gender
                    </label>
                    <select
                      value={sex}
                      onChange={(e) => setSex(e.target.value as any)}
                      className="w-full px-3 py-3 rounded-xl bg-[#111111] border border-white/10 text-white text-sm focus:outline-none focus:border-white/40 font-mono transition-all cursor-pointer"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other / Non-Binary</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Physical Biometrics */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-serif font-normal text-2xl sm:text-3xl text-white tracking-tight">
                    Physical Biometrics
                  </h1>
                  <p className="text-neutral-400 text-xs sm:text-sm mt-1 font-sans">
                    Used to calculate whole-food amino acid targets and fluid baselines.
                  </p>
                </div>

                {/* Metric / Imperial Unit Switcher */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setIsImperial(false)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      !isImperial ? 'bg-white text-black font-semibold shadow-sm' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Metric (cm/kg)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsImperial(true)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      isImperial ? 'bg-white text-black font-semibold shadow-sm' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Imperial (ft/lbs)
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {isImperial ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                        Height (Feet &amp; Inches)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="3"
                          max="7"
                          value={heightFeet}
                          onChange={(e) => handleHeightImperialChange(Number(e.target.value), heightInches)}
                          className="w-full px-3 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white text-sm font-mono text-center"
                          placeholder="ft"
                        />
                        <span className="text-xs font-mono text-neutral-500">ft</span>
                        <input
                          type="number"
                          min="0"
                          max="11"
                          value={heightInches}
                          onChange={(e) => handleHeightImperialChange(heightFeet, Number(e.target.value))}
                          className="w-full px-3 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white text-sm font-mono text-center"
                          placeholder="in"
                        />
                        <span className="text-xs font-mono text-neutral-500">in</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                        Weight (Pounds)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="70"
                          max="400"
                          value={weightLbs}
                          onChange={(e) => handleWeightLbsChange(Number(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white text-sm font-mono"
                        />
                        <span className="text-xs font-mono text-neutral-500">lbs</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                        Height (Centimeters)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="100"
                          max="250"
                          value={heightCm}
                          onChange={(e) => setHeightCm(Number(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white text-sm font-mono"
                        />
                        <span className="text-xs font-mono text-neutral-500">cm</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                        Weight (Kilograms)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="35"
                          max="200"
                          value={weightKg}
                          onChange={(e) => setWeightKg(Number(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white text-sm font-mono"
                        />
                        <span className="text-xs font-mono text-neutral-500">kg</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Calibrated Target Preview Pill */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3">
                    <Scale className="w-5 h-5 text-white" />
                    <div>
                      <div className="text-xs font-mono text-neutral-300">Calibrated Daily Baseline</div>
                      <div className="text-[11px] text-neutral-500 font-sans">
                        Estimated optimal daily fueling targets
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-white block">~{estimatedProteinTarget}g Protein</span>
                    <span className="text-[10px] font-mono text-emerald-400">~{estimatedHydrationTarget}L Water</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 3: Primary Behavioral Goal */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif font-normal text-2xl sm:text-3xl text-white tracking-tight">
                  Primary Focus Target
                </h1>
                <p className="text-neutral-400 text-xs sm:text-sm mt-1 font-sans">
                  Select your core health driver. Cyath will calibrate your daily routine checklist accordingly.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {GOAL_OPTIONS.map((g) => {
                  const isSelected = primaryGoal === g.id;
                  const Icon = g.icon;

                  return (
                    <div
                      key={g.id}
                      onClick={() => setPrimaryGoal(g.id)}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-4 ${
                        isSelected
                          ? 'bg-white/[0.06] border-white/30 shadow-lg ring-1 ring-white/20'
                          : 'bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-serif font-normal text-base text-white tracking-tight">
                            {g.title}
                          </h3>
                          {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <p className="text-xs text-neutral-400 font-sans mt-1">
                          {g.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Dietary Allergies & Preferences */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif font-normal text-2xl sm:text-3xl text-white tracking-tight">
                  Dietary Boundaries &amp; Allergies
                </h1>
                <p className="text-neutral-400 text-xs sm:text-sm mt-1 font-sans">
                  Filter whole-food recipe suggestions to match your dietary constraints.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">
                  Known Allergies &amp; Sensitivities
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALLERGY_OPTIONS.map((allergy) => {
                    const isSelected = selectedAllergies.includes(allergy);
                    return (
                      <button
                        key={allergy}
                        type="button"
                        onClick={() => toggleAllergy(allergy)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white text-black font-semibold shadow-sm'
                            : 'bg-white/[0.03] border border-white/10 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {allergy}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">
                  Dietary Lifestyle
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {DIETARY_STYLES.map((diet) => {
                    const isSelected = selectedDiet === diet;
                    return (
                      <button
                        key={diet}
                        type="button"
                        onClick={() => setSelectedDiet(diet)}
                        className={`p-3 rounded-xl border text-left text-xs font-mono transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-white/10 border-white/30 text-white font-medium'
                            : 'bg-white/[0.02] border-white/5 text-neutral-400 hover:text-white hover:border-white/15'
                        }`}
                      >
                        <span>{diet}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/10">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={nextStep}
              className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 active:scale-95 transition-all shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <span>
                {step === totalSteps
                  ? (isEditing ? 'Save Changes' : 'Complete Setup & Launch Dashboard')
                  : step === 1
                  ? 'Continue to Biometrics'
                  : step === 2
                  ? 'Continue to Health Goals'
                  : 'Continue to Nutrition'}
              </span>
              <ArrowRight className="w-4 h-4" />
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
        <div className="min-h-screen bg-[#080808] flex items-center justify-center text-xs font-mono text-neutral-500">
          Loading calibration...
        </div>
      }
    >
      <OnboardingContent />
    </React.Suspense>
  );
}
