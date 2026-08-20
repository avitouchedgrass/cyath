'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Heart,
  Scale,
  ChevronDown,
} from 'lucide-react';

const GOAL_OPTIONS = [
  {
    id: 'focus' as const,
    title: 'Cognitive Focus',
    description: 'Deep work, dopamine balance & mental clarity',
    icon: Zap,
  },
  {
    id: 'muscle' as const,
    title: 'Muscle & Strength',
    description: 'Lean muscle synthesis & recovery timing',
    icon: Dumbbell,
  },
  {
    id: 'sleep' as const,
    title: 'Circadian Sleep',
    description: 'Deep delta sleep, melatonin & morning energy',
    icon: Moon,
  },
  {
    id: 'longevity' as const,
    title: 'Metabolic Health',
    description: 'Cellular hydration & glycemic stability',
    icon: Heart,
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

  const { userProfile, updateUserProfile, userSession } = useHabitStore();

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  useEffect(() => {
    if (isEditing && (!userSession || userSession.id.startsWith('guest_'))) {
      router.push('/login?redirect=/onboarding?edit=true');
    }
  }, [isEditing, userSession, router]);

  // Form State initialized from store or defaults
  const [fullName, setFullName] = useState(userProfile?.fullName || '');
  const [age, setAge] = useState<number | string>(userProfile?.age || 26);
  const [sex, setSex] = useState<'male' | 'female' | 'other' | 'prefer_not_to_say'>(userProfile?.sex || 'male');
  const [isSexDropdownOpen, setIsSexDropdownOpen] = useState(false);
  const sexDropdownRef = useRef<HTMLDivElement>(null);
  
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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sexDropdownRef.current && !sexDropdownRef.current.contains(e.target as Node)) {
        setIsSexDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Age validation: Max 120, Min 10
  const parsedAge = Number(age);
  const isAgeValid = typeof parsedAge === 'number' && !isNaN(parsedAge) && parsedAge >= 10 && parsedAge <= 120 && age !== '';

  // Calculated Calibrated Targets
  const estimatedProteinTarget = Math.round(weightKg * 1.8);
  const estimatedHydrationTarget = (Math.round((weightKg * 0.035) * 10) / 10).toFixed(1);

  const handleFinish = () => {
    if (isEditing && (!userSession || userSession.id.startsWith('guest_'))) {
      router.push('/login?redirect=/onboarding?edit=true');
      return;
    }

    updateUserProfile({
      fullName: fullName.trim() || 'Cyath Explorer',
      age: isAgeValid ? parsedAge : 26,
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
    if (step === 1 && !isAgeValid) {
      return;
    }

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
            radial-gradient(circle at 50% 15%, rgba(255, 255, 255, 0.025) 0%, transparent 60%)
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
              <div className="text-[10px] font-mono text-slate-500">
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
        <div className="backdrop-blur-xl bg-white/[0.025] border border-white/10 rounded-2xl p-6 sm:p-9 shadow-2xl">
          
          {/* STEP 1: Personal Demographics */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                  Identity Calibration
                </span>
                <h1 className="font-cabinet font-bold text-2xl sm:text-3xl text-white tracking-tight mt-0.5">
                  Personal Identity
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm mt-1 font-sans">
                  We&apos;ll customize your daily protocol targets and baseline recommendations.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Full Name or Preferred Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-white/40 font-sans transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Age Input with Strict Max 120 & Validation Feedback */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                      Age (Years)
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 26"
                      className={`w-full px-4 py-3 rounded-xl bg-white/[0.02] border text-white text-sm focus:outline-none font-mono transition-all ${
                        !isAgeValid && age !== ''
                          ? 'border-red-500/50 focus:border-red-500'
                          : 'border-white/10 focus:border-white/40'
                      }`}
                    />
                    {!isAgeValid && age !== '' && (
                      <span className="text-[11px] font-mono text-red-400 mt-1 block">
                        {parsedAge > 120
                          ? 'Maximum age is 120.'
                          : parsedAge < 10
                          ? 'Minimum age is 10.'
                          : 'Please enter a valid age between 10 and 120.'}
                      </span>
                    )}
                  </div>

                  {/* Custom Glassmorphic Select Dropdown */}
                  <div className="relative" ref={sexDropdownRef}>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                      Biological Sex / Gender
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsSexDropdownOpen(!isSexDropdownOpen)}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white text-sm font-sans flex items-center justify-between hover:border-white/20 transition-all cursor-pointer"
                      aria-haspopup="listbox"
                      aria-expanded={isSexDropdownOpen}
                    >
                      <span>{SEX_OPTIONS.find((o) => o.id === sex)?.label || 'Select'}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isSexDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Glassmorphic Dropdown Menu */}
                    {isSexDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-2 rounded-xl backdrop-blur-2xl bg-[#121212]/95 border border-white/15 p-1 shadow-2xl z-30 font-sans animate-in fade-in zoom-in-95 duration-150">
                        {SEX_OPTIONS.map((opt) => {
                          const isSelected = sex === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setSex(opt.id);
                                setIsSexDropdownOpen(false);
                              }}
                              className={`w-full px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-all cursor-pointer text-left ${
                                isSelected
                                  ? 'bg-white/10 text-white font-semibold'
                                  : 'text-slate-300 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              <span>{opt.label}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
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
                  <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                    Physiological Data
                  </span>
                  <h1 className="font-cabinet font-bold text-2xl sm:text-3xl text-white tracking-tight mt-0.5">
                    Physical Biometrics
                  </h1>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1 font-sans">
                    Used to calculate whole-food amino acid targets and fluid baselines.
                  </p>
                </div>

                {/* Metric / Imperial Unit Switcher */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setIsImperial(false)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      !isImperial ? 'bg-white text-black font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Metric (cm/kg)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsImperial(true)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      isImperial ? 'bg-white text-black font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
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
                      <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                        Height (Feet &amp; Inches)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="3"
                          max="7"
                          value={heightFeet}
                          onChange={(e) => handleHeightImperialChange(Number(e.target.value), heightInches)}
                          className="w-full px-3 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white text-sm font-mono text-center focus:outline-none focus:border-white/40"
                          placeholder="ft"
                        />
                        <span className="text-xs font-mono text-slate-500">ft</span>
                        <input
                          type="number"
                          min="0"
                          max="11"
                          value={heightInches}
                          onChange={(e) => handleHeightImperialChange(heightFeet, Number(e.target.value))}
                          className="w-full px-3 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white text-sm font-mono text-center focus:outline-none focus:border-white/40"
                          placeholder="in"
                        />
                        <span className="text-xs font-mono text-slate-500">in</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                        Weight (Pounds)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="70"
                          max="400"
                          value={weightLbs}
                          onChange={(e) => handleWeightLbsChange(Number(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-white/40"
                        />
                        <span className="text-xs font-mono text-slate-500">lbs</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                        Height (Centimeters)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="100"
                          max="250"
                          value={heightCm}
                          onChange={(e) => setHeightCm(Number(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-white/40"
                        />
                        <span className="text-xs font-mono text-slate-500">cm</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                        Weight (Kilograms)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="35"
                          max="200"
                          value={weightKg}
                          onChange={(e) => setWeightKg(Number(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-white/40"
                        />
                        <span className="text-xs font-mono text-slate-500">kg</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Calibrated Target Preview Pill */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3">
                    <Scale className="w-5 h-5 text-white" />
                    <div>
                      <div className="text-xs font-mono text-slate-300">Calibrated Daily Baseline</div>
                      <div className="text-[11px] text-slate-500 font-sans">
                        Estimated optimal daily fueling targets
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-white block tabular-nums">~{estimatedProteinTarget}g Protein</span>
                    <span className="text-[10px] font-mono text-slate-300 tabular-nums">~{estimatedHydrationTarget}L Water</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 3: Primary Behavioral Goal (Simplified & Crisp) */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                  Optimization Priority
                </span>
                <h1 className="font-cabinet font-bold text-2xl sm:text-3xl text-white tracking-tight mt-0.5">
                  Primary Focus Target
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm mt-1 font-sans">
                  Select your core health driver. Cyath will calibrate your daily routine checklist accordingly.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GOAL_OPTIONS.map((g) => {
                  const isSelected = primaryGoal === g.id;
                  const Icon = g.icon;

                  return (
                    <div
                      key={g.id}
                      onClick={() => setPrimaryGoal(g.id)}
                      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-white/[0.06] border-white/30 shadow-lg ring-1 ring-white/20'
                          : 'bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>

                      <div>
                        <h3 className="font-cabinet font-semibold text-sm text-white tracking-tight">
                          {g.title}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-sans mt-0.5 leading-relaxed">
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
                <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                  Nutritional Parameters
                </span>
                <h1 className="font-cabinet font-bold text-2xl sm:text-3xl text-white tracking-tight mt-0.5">
                  Dietary Boundaries &amp; Allergies
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm mt-1 font-sans">
                  Filter whole-food recipe suggestions to match your dietary lifestyle.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
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
                            ? 'bg-white text-black font-semibold shadow-md'
                            : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <span>{diet}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
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
                            : 'bg-white/[0.03] border border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {allergy}
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
                className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
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
              disabled={step === 1 && !isAgeValid}
              className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-slate-200 active:scale-95 transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
