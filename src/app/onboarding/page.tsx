'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useHabitStore } from '@/store/useHabitStore';
import { Logo } from '@/components/ui/Logo';
import { retroAudio } from '@/lib/retroAudio';
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
    title: 'Daily Energy & Focus',
    description: 'Clear head, no 3 PM crashes, steady productivity',
    icon: Zap,
  },
  {
    id: 'muscle' as const,
    title: 'Strength & Muscle',
    description: 'Hit whole-food protein targets & recover fast',
    icon: Dumbbell,
  },
  {
    id: 'sleep' as const,
    title: 'Restful Deep Sleep',
    description: 'Fall asleep naturally & wake up refreshed',
    icon: Moon,
  },
  {
    id: 'longevity' as const,
    title: 'Daily Well-Being',
    description: 'Consistent hydration, movement & healthy habits',
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

  // Form State
  const [fullName, setFullName] = useState(userProfile?.fullName || '');
  const [age, setAge] = useState<number | string>(userProfile?.age || 26);
  const [sex, setSex] = useState<'male' | 'female' | 'other' | 'prefer_not_to_say'>(userProfile?.sex || 'male');
  const [isSexDropdownOpen, setIsSexDropdownOpen] = useState(false);
  const sexDropdownRef = useRef<HTMLDivElement>(null);
  
  // Biometrics
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
    retroAudio.playBlip();
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

  const parsedAge = Number(age);
  const isAgeValid = typeof parsedAge === 'number' && !isNaN(parsedAge) && parsedAge >= 10 && parsedAge <= 120 && age !== '';

  const estimatedProteinTarget = Math.round(weightKg * 1.8);
  const estimatedHydrationTarget = (Math.round((weightKg * 0.035) * 10) / 10).toFixed(1);

  const handleFinish = () => {
    retroAudio.playInspectConfirm();
    if (isEditing && (!userSession || userSession.id.startsWith('guest_'))) {
      router.push('/login?redirect=/onboarding?edit=true');
      return;
    }

    updateUserProfile({
      fullName: fullName.trim() || 'Explorer',
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
    retroAudio.playBlip();
    if (step === 1 && !isAgeValid) return;

    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const prevStep = () => {
    retroAudio.playBlip();
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#111914] text-[#F4F0EA] flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      
      <div className="relative z-10 w-full max-w-xl mx-auto">
        
        {/* Top Header Monogram & Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Logo className="w-9 h-9" />
            <div>
              <div className="text-xs font-mono font-bold text-[#F4F0EA]">Personal Setup</div>
              <div className="text-[10px] font-mono text-[#D9A036]">
                Step {step} of {totalSteps}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-28 h-2.5 rounded-full bg-[#1A261E] border border-[#F4F0EA]/30 overflow-hidden">
            <div
              className="h-full bg-[#D9A036] transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Dynamic Step Container */}
        <div className="bg-[#1A261E] border-4 border-[#F4F0EA] rounded-3xl p-6 sm:p-9 shadow-[8px_8px_0px_#D9A036]">
          
          {/* STEP 1: Personal Demographics */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D9A036]">
                  Welcome to Cyath
                </span>
                <h1 className="font-fraunces font-black text-2xl sm:text-3xl text-[#F4F0EA] tracking-tight mt-1">
                  What should we call you?
                </h1>
                <p className="text-[#C2CDBF] text-xs sm:text-sm mt-1 font-cabinet font-medium">
                  We&apos;ll calibrate your daily protein and hydration targets based on your setup.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-[#F4F0EA] mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-4 py-3 rounded-xl bg-[#111914] border-2 border-[#F4F0EA] text-[#F4F0EA] placeholder-[#C2CDBF]/50 text-sm font-cabinet font-bold focus:outline-none shadow-[2px_2px_0px_#D9A036]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Age Input */}
                  <div>
                    <label className="block text-xs font-mono uppercase font-bold text-[#F4F0EA] mb-1.5">
                      Age (Years)
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 26"
                      className={`w-full px-4 py-3 rounded-xl bg-[#111914] border-2 text-[#F4F0EA] text-sm font-mono font-bold focus:outline-none shadow-[2px_2px_0px_#D9A036] ${
                        !isAgeValid && age !== '' ? 'border-red-400' : 'border-[#F4F0EA]'
                      }`}
                    />
                    {!isAgeValid && age !== '' && (
                      <span className="text-[11px] font-mono text-red-400 mt-1 block font-bold">
                        {parsedAge > 120 ? 'Maximum age is 120.' : 'Please enter age between 10 and 120.'}
                      </span>
                    )}
                  </div>

                  {/* Gender Selector */}
                  <div className="relative" ref={sexDropdownRef}>
                    <label className="block text-xs font-mono uppercase font-bold text-[#F4F0EA] mb-1.5">
                      Biological Sex / Gender
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsSexDropdownOpen(!isSexDropdownOpen)}
                      className="w-full px-4 py-3 rounded-xl bg-[#111914] border-2 border-[#F4F0EA] text-[#F4F0EA] text-sm font-cabinet font-bold flex items-center justify-between cursor-pointer shadow-[2px_2px_0px_#D9A036]"
                    >
                      <span>{SEX_OPTIONS.find((o) => o.id === sex)?.label || 'Select'}</span>
                      <ChevronDown className={`w-4 h-4 text-[#F4F0EA] transition-transform ${isSexDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isSexDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-2 rounded-xl bg-[#111914] border-2 border-[#F4F0EA] p-1 shadow-2xl z-30 font-mono text-xs">
                        {SEX_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              retroAudio.playBlip();
                              setSex(opt.id);
                              setIsSexDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 rounded-lg flex items-center justify-between cursor-pointer ${
                              sex === opt.id ? 'bg-[#F4F0EA] text-[#111914] font-bold' : 'text-[#C2CDBF] hover:bg-[#1A261E]'
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
              </div>
            </div>
          )}

          {/* STEP 2: Physical Biometrics */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D9A036]">
                    Targets Setup
                  </span>
                  <h1 className="font-fraunces font-black text-2xl sm:text-3xl text-[#F4F0EA] tracking-tight mt-1">
                    Your Height &amp; Weight
                  </h1>
                </div>

                {/* Unit Switcher */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-[#111914] border-2 border-[#F4F0EA] text-xs font-mono font-bold">
                  <button
                    type="button"
                    onClick={() => setIsImperial(false)}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                      !isImperial ? 'bg-[#F4F0EA] text-[#111914]' : 'text-[#C2CDBF]'
                    }`}
                  >
                    Metric
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsImperial(true)}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                      isImperial ? 'bg-[#F4F0EA] text-[#111914]' : 'text-[#C2CDBF]'
                    }`}
                  >
                    Imperial
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {isImperial ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase font-bold text-[#F4F0EA] mb-1.5">
                        Height (Feet &amp; Inches)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="3"
                          max="7"
                          value={heightFeet}
                          onChange={(e) => handleHeightImperialChange(Number(e.target.value), heightInches)}
                          className="w-full px-3 py-3 rounded-xl bg-[#111914] border-2 border-[#F4F0EA] text-[#F4F0EA] text-sm font-mono font-bold text-center"
                        />
                        <span className="text-xs font-mono font-bold">ft</span>
                        <input
                          type="number"
                          min="0"
                          max="11"
                          value={heightInches}
                          onChange={(e) => handleHeightImperialChange(heightFeet, Number(e.target.value))}
                          className="w-full px-3 py-3 rounded-xl bg-[#111914] border-2 border-[#F4F0EA] text-[#F4F0EA] text-sm font-mono font-bold text-center"
                        />
                        <span className="text-xs font-mono font-bold">in</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase font-bold text-[#F4F0EA] mb-1.5">
                        Weight (Lbs)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="70"
                          max="400"
                          value={weightLbs}
                          onChange={(e) => handleWeightLbsChange(Number(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl bg-[#111914] border-2 border-[#F4F0EA] text-[#F4F0EA] text-sm font-mono font-bold"
                        />
                        <span className="text-xs font-mono font-bold">lbs</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase font-bold text-[#F4F0EA] mb-1.5">
                        Height (cm)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="100"
                          max="250"
                          value={heightCm}
                          onChange={(e) => setHeightCm(Number(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl bg-[#111914] border-2 border-[#F4F0EA] text-[#F4F0EA] text-sm font-mono font-bold"
                        />
                        <span className="text-xs font-mono font-bold">cm</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase font-bold text-[#F4F0EA] mb-1.5">
                        Weight (kg)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="35"
                          max="200"
                          value={weightKg}
                          onChange={(e) => setWeightKg(Number(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl bg-[#111914] border-2 border-[#F4F0EA] text-[#F4F0EA] text-sm font-mono font-bold"
                        />
                        <span className="text-xs font-mono font-bold">kg</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Target Preview */}
                <div className="p-4 rounded-2xl bg-[#111914] border-2 border-[#F4F0EA] flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3">
                    <Scale className="w-5 h-5 text-[#D9A036]" />
                    <div>
                      <div className="text-xs font-mono font-bold text-[#F4F0EA]">Suggested Targets</div>
                      <div className="text-[11px] text-[#C2CDBF] font-cabinet font-medium">
                        Based on your weight &amp; goals
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-black text-[#D9A036] block tabular-nums">~{estimatedProteinTarget}g Protein</span>
                    <span className="text-[10px] font-mono font-bold text-[#F4F0EA] tabular-nums">~{estimatedHydrationTarget}L Water</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 3: Primary Goal */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D9A036]">
                  Primary Priority
                </span>
                <h1 className="font-fraunces font-black text-2xl sm:text-3xl text-[#F4F0EA] tracking-tight mt-1">
                  What is your main goal?
                </h1>
                <p className="text-[#C2CDBF] text-xs sm:text-sm mt-1 font-cabinet font-medium">
                  We&apos;ll customize your daily checklist to match your top priority.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GOAL_OPTIONS.map((g) => {
                  const isSelected = primaryGoal === g.id;
                  const Icon = g.icon;

                  return (
                    <div
                      key={g.id}
                      onClick={() => {
                        retroAudio.playBlip();
                        setPrimaryGoal(g.id);
                      }}
                      className={`p-4 rounded-2xl border-3 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#111914] border-[#F4F0EA] shadow-[4px_4px_0px_#D9A036]'
                          : 'bg-[#111914]/60 border-[#F4F0EA]/30 hover:border-[#F4F0EA]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-[#1A261E] border-2 border-[#F4F0EA] flex items-center justify-center text-[#F4F0EA]">
                          <Icon className="w-4 h-4" />
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#D9A036] stroke-[3]" />}
                      </div>

                      <div>
                        <h3 className="font-cabinet font-bold text-sm text-[#F4F0EA]">
                          {g.title}
                        </h3>
                        <p className="text-[11px] text-[#C2CDBF] font-cabinet font-medium mt-0.5 leading-relaxed">
                          {g.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Dietary Lifestyle & Allergies */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D9A036]">
                  Food Preferences
                </span>
                <h1 className="font-fraunces font-black text-2xl sm:text-3xl text-[#F4F0EA] tracking-tight mt-1">
                  Any dietary preferences?
                </h1>
                <p className="text-[#C2CDBF] text-xs sm:text-sm mt-1 font-cabinet font-medium">
                  We&apos;ll auto-filter whole-food recipes to match your lifestyle.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-bold text-[#F4F0EA] mb-2">
                  Dietary Style
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {DIETARY_STYLES.map((diet) => {
                    const isSelected = selectedDiet === diet;
                    return (
                      <button
                        key={diet}
                        type="button"
                        onClick={() => {
                          retroAudio.playBlip();
                          setSelectedDiet(diet);
                        }}
                        className={`p-3 rounded-xl border-2 text-left text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#F4F0EA] text-[#111914] border-[#F4F0EA] shadow-[3px_3px_0px_#D9A036]'
                            : 'bg-[#111914] border-[#F4F0EA]/30 text-[#C2CDBF] hover:border-[#F4F0EA]'
                        }`}
                      >
                        <span>{diet}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-bold text-[#F4F0EA] mb-2">
                  Allergies or Restrictions
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALLERGY_OPTIONS.map((allergy) => {
                    const isSelected = selectedAllergies.includes(allergy);
                    return (
                      <button
                        key={allergy}
                        type="button"
                        onClick={() => toggleAllergy(allergy)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border-2 ${
                          isSelected
                            ? 'bg-[#F4F0EA] text-[#111914] border-[#F4F0EA] shadow-[2px_2px_0px_#D9A036]'
                            : 'bg-[#111914] border-[#F4F0EA]/30 text-[#C2CDBF] hover:border-[#F4F0EA]'
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
          <div className="flex items-center justify-between pt-6 mt-6 border-t-2 border-[#F4F0EA]/20">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#C2CDBF] hover:text-[#F4F0EA] transition-colors cursor-pointer"
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
              className="px-6 py-3 rounded-xl bg-[#F4F0EA] text-[#111914] font-cabinet font-bold text-xs border-2 border-[#F4F0EA] shadow-[3px_3px_0px_#D9A036] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>
                {step === totalSteps
                  ? (isEditing ? 'Save Changes' : 'Complete Setup & Launch Dashboard')
                  : step === 1
                  ? 'Continue to Biometrics'
                  : step === 2
                  ? 'Continue to Goals'
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
        <div className="min-h-screen bg-[#111914] flex items-center justify-center text-xs font-mono text-[#F4F0EA]">
          Loading setup...
        </div>
      }
    >
      <OnboardingContent />
    </React.Suspense>
  );
}
