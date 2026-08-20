'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { useHabitStore, HabitItem } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import {
  Sun,
  Brain,
  Moon,
  Zap,
  Check,
  Plus,
  ArrowLeft,
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react';

interface ProtocolBlueprint {
  id: string;
  name: string;
  shortSummary: string;
  category: 'Morning' | 'Focus' | 'Sleep' | 'Movement';
  icon: 'sun' | 'brain' | 'moon' | 'zap';
  timeframe: string;
  habits: { title: string; hint: string }[];
  standardHabits: HabitItem[];
  whyItWorks: string;
  simpleHighlights: string[];
}

const CURATED_PROTOCOLS: ProtocolBlueprint[] = [
  {
    id: 'morning-activation',
    name: 'Morning Sunlight & Energy',
    shortSummary: 'Clears morning grogginess and naturally resets your internal clock in 15 minutes.',
    category: 'Morning',
    icon: 'sun',
    timeframe: 'First 30m of your day',
    habits: [
      { title: '15m outdoor morning sunlight', hint: 'Natural light exposure' },
      { title: '500ml water + pinch of sea salt', hint: 'Morning rehydration' },
      { title: 'Cold splash or quick rinse', hint: 'Natural wakeup reflex' },
    ],
    standardHabits: [
      { id: 'sunlight', title: 'Morning Sunlight Exposure (15m)', category: 'morning', targetDaysPerWeek: 7 },
      { id: 'hydration_morning', title: '500ml Water + Electrolytes', category: 'nutrition', targetDaysPerWeek: 7 },
      { id: 'cold_rinse', title: 'Cold Shower or Face Splash', category: 'recovery', targetDaysPerWeek: 6 },
    ],
    whyItWorks: 'Early natural sunlight resets your body clock for the day and sets a natural timer for great sleep 16 hours later.',
    simpleHighlights: [
      'Morning light resets your internal rhythm and stops grogginess faster than coffee.',
      'A tall glass of salted water eliminates overnight dehydration.',
      'Cool water triggers a natural alertness surge without jittery stimulants.',
    ],
  },
  {
    id: 'cognitive-flow',
    name: 'Deep Focus Sprint',
    shortSummary: 'Protects your attention for high-priority creative and deep focus work.',
    category: 'Focus',
    icon: 'brain',
    timeframe: 'Morning to Early Afternoon',
    habits: [
      { title: 'Zero phone input first 30 mins', hint: 'Start in flow' },
      { title: 'High-protein breakfast (35g+)', hint: 'Steady blood sugar' },
      { title: '90-min single-task work block', hint: 'Zero distractions' },
    ],
    standardHabits: [
      { id: 'zero_phone', title: 'Zero Phone First 30 Mins', category: 'mindset', targetDaysPerWeek: 7 },
      { id: 'protein_breakfast', title: 'High-Protein Breakfast (35g+)', category: 'nutrition', targetDaysPerWeek: 7 },
      { id: 'deep_sprint', title: '90-Min Focus Sprint', category: 'mindset', targetDaysPerWeek: 5 },
    ],
    whyItWorks: 'Avoiding phone notifications early protects your attention, while clean morning protein keeps your energy level for hours.',
    simpleHighlights: [
      'Zero phone notifications in the morning stops reactive stress.',
      'Clean protein prevents the classic 11:00 AM energy crash.',
      '90-minute blocks match your brain’s natural high-focus cycles.',
    ],
  },
  {
    id: 'deep-rem-sleep',
    name: 'Restful Sleep Wind-Down',
    shortSummary: 'Calms your nervous system for deeper, uninterrupted, and refreshing sleep.',
    category: 'Sleep',
    icon: 'moon',
    timeframe: '60 mins before bed',
    habits: [
      { title: 'Screens off 60 mins before bed', hint: 'Digital sunset' },
      { title: 'Cool bedroom temperature (~67°F)', hint: 'Deep sleep trigger' },
      { title: 'Magnesium or herbal chamomile tea', hint: 'Calming wind-down' },
    ],
    standardHabits: [
      { id: 'digital_sunset', title: 'Digital Sunset (Screens Off 60m Prior)', category: 'recovery', targetDaysPerWeek: 7 },
      { id: 'ambient_temp', title: 'Cool Dark Bedroom (67°F)', category: 'recovery', targetDaysPerWeek: 7 },
      { id: 'magnesium_glycine', title: 'Magnesium / Evening Herbal Tea', category: 'recovery', targetDaysPerWeek: 6 },
    ],
    whyItWorks: 'Dimming blue light lets your brain release natural melatonin, while a cool room lets your body temperature drop for deep sleep.',
    simpleHighlights: [
      'Dimming screens 1 hour before bed helps you fall asleep 2x faster.',
      'A cool bedroom signals your body to enter deep physical repair mode.',
      'Warm herbal tea eases physical tension from the day.',
    ],
  },
  {
    id: 'anabolic-glycogen',
    name: 'Strength & Muscle Fuel',
    shortSummary: 'Daily whole-food protein and hydration to keep you strong, active, and energized.',
    category: 'Movement',
    icon: 'zap',
    timeframe: 'Daily Fueling & Training',
    habits: [
      { title: '130g+ daily whole-food protein', hint: 'Muscle fuel' },
      { title: '30-45 mins resistance or brisk walk', hint: 'Daily movement' },
      { title: '2.5L+ clean water intake', hint: 'Hydration baseline' },
    ],
    standardHabits: [
      { id: 'protein_target', title: 'Hit Daily Protein Target (130g+)', category: 'nutrition', targetDaysPerWeek: 7 },
      { id: 'zone2_resistance', title: '30-45 Min Resistance or Cardio', category: 'movement', targetDaysPerWeek: 5 },
      { id: 'hydration_3l', title: 'Hit 2.5L+ Hydration Target', category: 'nutrition', targetDaysPerWeek: 7 },
    ],
    whyItWorks: 'Getting enough protein and moving every day keeps your muscles strong, metabolism high, and joints feeling great.',
    simpleHighlights: [
      'Hitting your protein goal supports muscle repair and all-day fullness.',
      'Daily movement improves insulin sensitivity and lifts your mood.',
      'Proper hydration keeps cramps and mid-afternoon headaches away.',
    ],
  },
];

export default function ProtocolsPage() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Morning' | 'Focus' | 'Sleep' | 'Movement'>('All');
  const [selectedProtocolForModal, setSelectedProtocolForModal] = useState<ProtocolBlueprint | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const {
    themeMode,
    toggleThemeMode,
    activeProtocolIds,
    activateProtocol,
    userSession,
    setPendingAction,
  } = useHabitStore();

  const isLight = themeMode === 'light';

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggleProtocol = (protocol: ProtocolBlueprint) => {
    retroAudio.playInspectConfirm();

    if (!userSession) {
      setPendingAction({
        type: 'ACTIVATE_PROTOCOL',
        payload: { protocolId: protocol.id, habitsToAdd: protocol.standardHabits },
        returnUrl: '/protocols',
      });
      router.push('/login?redirect=/protocols');
      return;
    }

    const isCurrentlyActive = activeProtocolIds.includes(protocol.id);
    activateProtocol(protocol.id, protocol.standardHabits);

    setToastMessage(
      isCurrentlyActive
        ? `Removed ${protocol.name} from daily routines`
        : `Added ${protocol.name} to your daily routines!`
    );
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredProtocols = CURATED_PROTOCOLS.filter(
    (p) => selectedFilter === 'All' || p.category === selectedFilter
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col ${
      isLight ? 'bg-[#F4F0EA] text-[#1B2A24]' : 'bg-[#131916] text-[#F4F0EA]'
    }`}>
      {/* Navigation Header */}
      <HeaderNav 
        themeMode={themeMode} 
        onToggleTheme={toggleThemeMode} 
      />

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-6 lg:px-8 pt-28 pb-24">
        
        {/* Header Breadcrumbs & Title */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 mb-3">
            <Link
              href="/"
              className={`inline-flex items-center gap-1 text-xs font-mono font-bold px-3 py-1 rounded-full border-2 transition-all ${
                isLight 
                  ? 'bg-[#FFFDF9] border-[#1A3629] text-[#1A3629] shadow-[2px_2px_0px_#1A3629] hover:-translate-y-0.5' 
                  : 'bg-[#1A261E] border-[#F4F0EA] text-[#F4F0EA] shadow-[2px_2px_0px_#D9A036] hover:-translate-y-0.5'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <span className={`px-3 py-1 rounded-full border-2 text-[10px] font-mono font-bold uppercase tracking-widest ${
              isLight ? 'bg-[#FFFDF9] border-[#1A3629] text-[#1A3629]' : 'bg-[#1A261E] border-[#F4F0EA] text-[#D9A036]'
            }`}>
              Daily Blueprints
            </span>
          </div>

          <h1 className={`font-fraunces font-black text-3xl sm:text-5xl tracking-tight ${
            isLight ? 'text-[#1A3629]' : 'text-[#F4F0EA]'
          }`}>
            Daily Routine Blueprints
          </h1>
          <p className={`text-base sm:text-lg font-cabinet font-medium mt-3 max-w-2xl leading-relaxed ${
            isLight ? 'text-[#2C4A3B]' : 'text-[#C2CDBF]'
          }`}>
            Proven daily habits you can import directly into your planner. No overwhelming multi-hour routines—just simple, high-impact check-ins.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider opacity-80 shrink-0">
            Filter:
          </span>
          <div className={`inline-flex items-center gap-1.5 p-1 rounded-xl border-2 ${
            isLight ? 'bg-[#FFFDF9] border-[#1A3629]/30' : 'bg-[#1A261E] border-[#F4F0EA]/30'
          }`}>
            {(['All', 'Morning', 'Focus', 'Sleep', 'Movement'] as const).map((filter) => {
              const isSelected = selectedFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => {
                    retroAudio.playBlip();
                    setSelectedFilter(filter);
                  }}
                  className={`px-3.5 py-1 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? isLight
                        ? 'bg-[#1A3629] text-[#FFFDF9] shadow-[2px_2px_0px_#3A6B52]'
                        : 'bg-[#F4F0EA] text-[#111914] shadow-[2px_2px_0px_#D9A036]'
                      : isLight
                        ? 'text-[#2C4A3B] hover:text-[#1A3629]'
                        : 'text-[#C2CDBF] hover:text-[#F4F0EA]'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>

        {/* Blueprint Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {filteredProtocols.map((protocol) => {
            const isActivated = mounted && activeProtocolIds.includes(protocol.id);

            const getIcon = () => {
              switch (protocol.icon) {
                case 'sun': return <Sun className="w-5 h-5 stroke-[2.5]" />;
                case 'brain': return <Brain className="w-5 h-5 stroke-[2.5]" />;
                case 'moon': return <Moon className="w-5 h-5 stroke-[2.5]" />;
                case 'zap': return <Zap className="w-5 h-5 stroke-[2.5]" />;
              }
            };

            return (
              <div
                key={protocol.id}
                className={`border-3 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
                  isLight
                    ? 'bg-[#FFFDF9] border-[#1A3629] shadow-[6px_6px_0px_#1A3629]'
                    : 'bg-[#1A261E] border-[#F4F0EA] shadow-[6px_6px_0px_#D9A036]'
                }`}
              >
                <div>
                  {/* Top Row: Icon & Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center ${
                      isLight ? 'bg-[#F4F0EA] border-[#1A3629] text-[#1A3629]' : 'bg-[#111914] border-[#F4F0EA] text-[#F4F0EA]'
                    }`}>
                      {getIcon()}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full border-2 text-[10px] font-mono font-bold uppercase tracking-wider ${
                        isLight ? 'bg-[#F4F0EA] border-[#1A3629]' : 'bg-[#111914] border-[#F4F0EA]'
                      }`}>
                        {protocol.category}
                      </span>
                      {isActivated && (
                        <span className={`px-2.5 py-0.5 rounded-full border-2 text-[10px] font-mono font-bold uppercase flex items-center gap-1 ${
                          isLight ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629]' : 'bg-[#D9A036] text-[#111914] border-[#F4F0EA]'
                        }`}>
                          <Check className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Short Summary */}
                  <h3 className={`font-fraunces font-black text-2xl tracking-tight leading-snug mb-2 ${
                    isLight ? 'text-[#1A3629]' : 'text-[#F4F0EA]'
                  }`}>
                    {protocol.name}
                  </h3>
                  <p className={`text-xs sm:text-sm font-cabinet font-medium leading-relaxed mb-6 ${
                    isLight ? 'text-[#2C4A3B]' : 'text-[#C2CDBF]'
                  }`}>
                    {protocol.shortSummary}
                  </p>

                  {/* Daily Habits Checklist Preview */}
                  <div className="space-y-2.5 mb-6">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-70 block mb-1">
                      Daily Checklist ({protocol.timeframe}):
                    </span>
                    {protocol.habits.map((habit, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between p-3 rounded-xl border-2 text-xs font-cabinet font-bold ${
                          isLight ? 'bg-[#F4F0EA] border-[#1A3629]/20' : 'bg-[#111914] border-[#F4F0EA]/20'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-xs ${isLight ? 'text-[#3A6B52]' : 'text-[#D9A036]'}`}>•</span>
                          <span>{habit.title}</span>
                        </div>
                        <span className="text-[10px] font-mono font-normal opacity-70">
                          {habit.hint}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions Row */}
                <div className={`pt-4 border-t-2 flex items-center justify-between gap-3 ${
                  isLight ? 'border-[#1A3629]/15' : 'border-[#F4F0EA]/15'
                }`}>
                  <button
                    type="button"
                    onClick={() => {
                      retroAudio.playBlip();
                      setSelectedProtocolForModal(protocol);
                    }}
                    className={`text-xs font-mono font-bold hover:underline flex items-center gap-1 cursor-pointer ${
                      isLight ? 'text-[#1A3629]' : 'text-[#F4F0EA]'
                    }`}
                  >
                    <span>Read Why It Works</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleProtocol(protocol)}
                    className={`px-4 py-2.5 rounded-xl border-2 text-xs font-cabinet font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isActivated
                        ? isLight
                          ? 'bg-[#E8DECF] text-[#1A3629] border-[#1A3629]'
                          : 'bg-[#111914] text-[#F4F0EA] border-[#F4F0EA]'
                        : isLight
                          ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-[3px_3px_0px_#3A6B52] hover:-translate-y-0.5'
                          : 'bg-[#F4F0EA] text-[#111914] border-[#F4F0EA] shadow-[3px_3px_0px_#D9A036] hover:-translate-y-0.5'
                    }`}
                  >
                    {isActivated ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Remove Routine</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Add to Planner</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className={`px-5 py-3.5 rounded-xl border-3 font-cabinet font-bold text-xs shadow-2xl flex items-center gap-3 ${
            isLight ? 'bg-[#FFFDF9] border-[#1A3629] text-[#1A3629]' : 'bg-[#F4F0EA] border-[#111914] text-[#111914]'
          }`}>
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Blueprint Detail Modal */}
      {selectedProtocolForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedProtocolForModal(null)}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          <div className={`relative z-10 w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl border-4 p-6 sm:p-8 shadow-2xl flex flex-col gap-6 scrollbar-none ${
            isLight ? 'bg-[#FFFDF9] border-[#1A3629]' : 'bg-[#1A261E] border-[#F4F0EA]'
          }`}>
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedProtocolForModal(null)}
              className={`absolute right-6 top-6 rounded-full p-2 border-2 transition-all cursor-pointer ${
                isLight ? 'bg-[#F4F0EA] border-[#1A3629] text-[#1A3629]' : 'bg-[#111914] border-[#F4F0EA] text-[#F4F0EA]'
              }`}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className={`px-2.5 py-0.5 rounded-md border-2 text-[10px] font-mono font-bold uppercase tracking-wider inline-block mb-2 ${
                isLight ? 'bg-[#F4F0EA] border-[#1A3629]' : 'bg-[#111914] border-[#F4F0EA]'
              }`}>
                {selectedProtocolForModal.category} Blueprint
              </span>
              <h2 className={`font-fraunces font-black text-2xl sm:text-3xl tracking-tight ${
                isLight ? 'text-[#1A3629]' : 'text-[#F4F0EA]'
              }`}>
                {selectedProtocolForModal.name}
              </h2>
            </div>

            {/* Why It Works Section */}
            <div className={`p-4 rounded-xl border-2 ${
              isLight ? 'bg-[#F4F0EA] border-[#1A3629]/20' : 'bg-[#111914] border-[#F4F0EA]/20'
            }`}>
              <h4 className="font-cabinet font-bold text-xs uppercase tracking-wider mb-1 opacity-75">
                The Science in Plain English
              </h4>
              <p className="text-xs sm:text-sm font-cabinet font-medium leading-relaxed">
                {selectedProtocolForModal.whyItWorks}
              </p>
            </div>

            {/* Key Takeaways */}
            <div className="space-y-2.5">
              <h4 className="font-cabinet font-bold text-xs uppercase tracking-wider opacity-75">
                Key Takeaways
              </h4>
              {selectedProtocolForModal.simpleHighlights.map((hl, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs font-cabinet font-medium leading-relaxed">
                  <span className={`font-mono text-xs font-bold shrink-0 mt-0.5 ${
                    isLight ? 'text-[#3A6B52]' : 'text-[#D9A036]'
                  }`}>+</span>
                  <span>{hl}</span>
                </div>
              ))}
            </div>

            {/* Modal Bottom CTA */}
            <div className="pt-4 border-t-2 border-current/15">
              <button
                type="button"
                onClick={() => {
                  handleToggleProtocol(selectedProtocolForModal);
                  setSelectedProtocolForModal(null);
                }}
                className={`w-full py-4 px-6 rounded-xl border-3 font-cabinet font-bold text-sm transition-all shadow-[4px_4px_0px_#1A3629] flex items-center justify-center gap-2 cursor-pointer ${
                  activeProtocolIds.includes(selectedProtocolForModal.id)
                    ? isLight
                      ? 'bg-[#E8DECF] text-[#1A3629] border-[#1A3629]'
                      : 'bg-[#111914] text-[#F4F0EA] border-[#F4F0EA]'
                    : isLight
                      ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-[4px_4px_0px_#3A6B52] hover:-translate-y-0.5'
                      : 'bg-[#F4F0EA] text-[#111914] border-[#F4F0EA] shadow-[4px_4px_0px_#D9A036] hover:-translate-y-0.5'
                }`}
              >
                {activeProtocolIds.includes(selectedProtocolForModal.id) ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Remove from Daily Planner</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Add All Habits to My Daily Planner</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
