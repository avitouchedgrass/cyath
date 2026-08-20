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
  const [age, setAge] = useState<number | ''>(userProfile?.age || 26);
  const [sex, setSex] = useState<'male' | 'female' | 'other' | 'prefer_not_to_say'>(userProfile?.sex || 'other');
  const [isSexDropdownOpen, setIsSexDropdownOpen] = useState(false);
  const sexDropdownRef = useRef<HTMLDivElement>(null);

  const [isImperial, setIsImperial] = useState(false);
  const [heightCm, setHeightCm] = useState(userProfile?.heightCm || 178);
  const [weightKg, setWeightKg] = useState(userProfile?.weightKg || 74);

  // Imperial conversions
  const [heightFeet, setHeightFeet] = useState(5);
  const [heightInches, setHeightInches] = useState(10);
  const [weightLbs, setWeightLbs] = useState(163);

  const [primaryGoal, setPrimaryGoal] = useState<'focus' | 'muscle' | 'sleep' | 'longevity' | 'fat_loss'>(
    userProfile?.primaryGoal || 'focus'
  );
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(userProfile?.allergies || []);
  const [selectedDiet, setSelectedDiet] = useState<string>(
    userProfile?.dietaryRestrictions?.[0] || 'High-Protein Omnivore'
  );

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

  // Update imperial states when cm/kg changes
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

  const parsedAge = typeof age === 'number' ? age : 0;
  const isAgeValid = age !== '' && parsedAge >= 10 && parsedAge <= 120;

  const estimatedProteinTarget = Math.round(weightKg * 2.0);
  const estimatedHydrationTarget = (weightKg * 0.04).toFixed(1);

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

  const handleComplete = () => {
    updateUserProfile({
      fullName: fullName.trim() || 'Cyath Explorer',
      age: typeof age === 'number' ? age : 26,
      sex,
      heightCm,
      weightKg,
      primaryGoal,
      allergies: selectedAllergies,
      dietaryRestrictions: [selectedDiet],
      onboardingCompleted: true,
    });

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F4F0EA] text-[#1A3629] transition-colors duration-300 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      
      <div className="relative z-10 w-full max-w-xl mx-auto">
        
        {/* Top Header Monogram & Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="filter brightness-0 [filter:invert(18%)_sepia(22%)_saturate(1478%)_hue-rotate(97deg)_brightness(96%)_contrast(92%)]">
              <Logo className="w-9 h-9" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-[#1A3629]">Personal Setup</div>
              <div className="text-[10px] font-mono text-[#1A3629]">
                Step {step} of {totalSteps}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Progress Bar */}
            <div className="w-28 h-2.5 rounded-full border border-[#1A3629]/30 bg-[#E8DECF] overflow-hidden">
              <div
                className="h-full bg-[#1A3629] transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Dynamic Step Container */}
        <div className="rounded-3xl p-6 sm:p-9 border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[6px_6px_0px_#1A3629] transition-all">
          
          {/* STEP 1: Personal Demographics */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#1A3629]">
                  Welcome to Cyath
                </span>
                <h1 className="font-fraunces font-black text-2xl sm:text-3xl tracking-tight mt-1 text-[#1A3629]">
                  What should we call you?
                </h1>
                <p className="text-xs sm:text-sm mt-1 font-cabinet font-medium text-[#2C4A3B]">
                  We&apos;ll calibrate your daily protein and hydration targets based on your setup.
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
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-4 py-3 rounded-xl border-2 bg-[#F4F0EA] border-[#1A3629] text-[#1A3629] placeholder-[#1A3629]/40 shadow-[2px_2px_0px_#1A3629] text-sm font-cabinet font-bold focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Age Input */}
                  <div>
                    <label className="block text-xs font-mono uppercase font-bold mb-1.5 text-[#1A3629]">
                      Age (Years)
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 26"
                      className={`w-full px-4 py-3 rounded-xl border-2 text-sm font-mono font-bold focus:outline-none bg-[#F4F0EA] ${
                        !isAgeValid && age !== ''
                          ? 'border-red-500 text-red-700'
                          : 'border-[#1A3629] text-[#1A3629] shadow-[2px_2px_0px_#1A3629]'
                      }`}
                    />
                    {!isAgeValid && age !== '' && (
                      <span className="text-[11px] font-mono text-red-600 mt-1 block font-bold">
                        {parsedAge > 120 ? 'Maximum age is 120.' : 'Please enter age between 10 and 120.'}
                      </span>
                    )}
                  </div>

                  {/* Gender Selector */}
                  <div className="relative" ref={sexDropdownRef}>
                    <label className="block text-xs font-mono uppercase font-bold mb-1.5 text-[#1A3629]">
                      Biological Sex / Gender
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsSexDropdownOpen(!isSexDropdownOpen)}
                      className="w-full px-4 py-3 rounded-xl border-2 bg-[#F4F0EA] border-[#1A3629] text-[#1A3629] shadow-[2px_2px_0px_#1A3629] text-sm font-cabinet font-bold flex items-center justify-between cursor-pointer"
                    >
                      <span>{SEX_OPTIONS.find((o) => o.id === sex)?.label || 'Select'}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isSexDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isSexDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-2 rounded-xl border-2 bg-[#FFFDF9] border-[#1A3629] p-1 shadow-2xl z-30 font-mono text-xs">
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
                              sex === opt.id
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
              </div>
            </div>
          )}

          {/* STEP 2: Physical Biometrics */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#1A3629]">
                    Targets Setup
                  </span>
                  <h1 className="font-fraunces font-black text-2xl sm:text-3xl tracking-tight mt-1 text-[#1A3629]">
                    Your Height &amp; Weight
                  </h1>
                </div>

                {/* Unit Switcher */}
                <div className="flex items-center gap-1 p-1 rounded-xl border border-[#1A3629]/30 bg-[#F4F0EA] text-xs font-mono font-bold">
                  <button
                    type="button"
                    onClick={() => setIsImperial(false)}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                      !isImperial
                        ? 'bg-[#1A3629] text-[#FFFDF9]'
                        : 'opacity-60 text-[#1A3629]'
                    }`}
                  >
                    Metric
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsImperial(true)}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                      isImperial
                        ? 'bg-[#1A3629] text-[#FFFDF9]'
                        : 'opacity-60 text-[#1A3629]'
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
                      <label className="block text-xs font-mono uppercase font-bold mb-1.5 text-[#1A3629]">
                        Height (Feet &amp; Inches)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="3"
                          max="7"
                          value={heightFeet}
                          onChange={(e) => handleHeightImperialChange(Number(e.target.value), heightInches)}
                          className="w-full px-3 py-3 rounded-xl border-2 bg-[#F4F0EA] border-[#1A3629] text-[#1A3629] text-sm font-mono font-bold text-center"
                        />
                        <span className="text-xs font-mono font-bold text-[#1A3629]">ft</span>
                        <input
                          type="number"
                          min="0"
                          max="11"
                          value={heightInches}
                          onChange={(e) => handleHeightImperialChange(heightFeet, Number(e.target.value))}
                          className="w-full px-3 py-3 rounded-xl border-2 bg-[#F4F0EA] border-[#1A3629] text-[#1A3629] text-sm font-mono font-bold text-center"
                        />
                        <span className="text-xs font-mono font-bold text-[#1A3629]">in</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase font-bold mb-1.5 text-[#1A3629]">
                        Weight (Lbs)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="70"
                          max="400"
                          value={weightLbs}
                          onChange={(e) => handleWeightLbsChange(Number(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl border-2 bg-[#F4F0EA] border-[#1A3629] text-[#1A3629] text-sm font-mono font-bold"
                        />
                        <span className="text-xs font-mono font-bold text-[#1A3629]">lbs</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase font-bold mb-1.5 text-[#1A3629]">
                        Height (cm)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="100"
                          max="250"
                          value={heightCm}
                          onChange={(e) => setHeightCm(Number(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl border-2 bg-[#F4F0EA] border-[#1A3629] text-[#1A3629] text-sm font-mono font-bold"
                        />
                        <span className="text-xs font-mono font-bold text-[#1A3629]">cm</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase font-bold mb-1.5 text-[#1A3629]">
                        Weight (kg)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="35"
                          max="200"
                          value={weightKg}
                          onChange={(e) => setWeightKg(Number(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl border-2 bg-[#F4F0EA] border-[#1A3629] text-[#1A3629] text-sm font-mono font-bold"
                        />
                        <span className="text-xs font-mono font-bold text-[#1A3629]">kg</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Target Preview */}
                <div className="p-4 rounded-2xl border-2 border-[#1A3629] bg-[#F4F0EA] flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3">
                    <Scale className="w-5 h-5 text-[#1A3629]" />
                    <div>
                      <div className="text-xs font-mono font-bold text-[#1A3629]">Suggested Targets</div>
                      <div className="text-[11px] font-cabinet font-medium text-[#2C4A3B]">
                        Based on your weight &amp; goals
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-black text-[#1A3629] block tabular-nums">~{estimatedProteinTarget}g Protein</span>
                    <span className="text-[10px] font-mono font-bold tabular-nums opacity-90 text-[#2C4A3B]">~{estimatedHydrationTarget}L Water</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 3: Primary Goal */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#1A3629]">
                  Primary Priority
                </span>
                <h1 className="font-fraunces font-black text-2xl sm:text-3xl tracking-tight mt-1 text-[#1A3629]">
                  What is your main goal?
                </h1>
                <p className="text-xs sm:text-sm mt-1 font-cabinet font-medium text-[#2C4A3B]">
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
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#F4F0EA] border-[#1A3629] shadow-[3px_3px_0px_#1A3629]'
                          : 'bg-[#FFFDF9] border-[#1A3629]/20 hover:border-[#1A3629]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl border-2 border-[#1A3629] bg-[#FFFDF9] text-[#1A3629] flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#1A3629] stroke-[3]" />}
                      </div>

                      <div>
                        <h3 className="font-cabinet font-bold text-sm text-[#1A3629]">
                          {g.title}
                        </h3>
                        <p className="text-[11px] font-cabinet font-medium mt-0.5 leading-relaxed text-[#2C4A3B]">
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
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#1A3629]">
                  Food Preferences
                </span>
                <h1 className="font-fraunces font-black text-2xl sm:text-3xl tracking-tight mt-1 text-[#1A3629]">
                  Any dietary preferences?
                </h1>
                <p className="text-xs sm:text-sm mt-1 font-cabinet font-medium text-[#2C4A3B]">
                  We&apos;ll auto-filter whole-food recipes to match your lifestyle.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-bold mb-2 text-[#1A3629]">
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
                            ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-[3px_3px_0px_#3A6B52]'
                            : 'bg-[#F4F0EA] border-[#1A3629]/30 text-[#1A3629] hover:border-[#1A3629]'
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
                <label className="block text-xs font-mono uppercase font-bold mb-2 text-[#1A3629]">
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
                            ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-[2px_2px_0px_#3A6B52]'
                            : 'bg-[#F4F0EA] border-[#1A3629]/30 text-[#1A3629] hover:border-[#1A3629]'
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
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-[#1A3629]/15">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#1A3629] opacity-75 hover:opacity-100 transition-opacity cursor-pointer"
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
              className="px-6 py-3 rounded-xl font-cabinet font-bold text-xs border-2 bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-[3px_3px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
        <div className="min-h-screen bg-[#F4F0EA] flex items-center justify-center text-xs font-mono text-[#1A3629]">
          Loading setup...
        </div>
      }
    >
      <OnboardingContent />
    </React.Suspense>
  );
}
