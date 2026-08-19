'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { useHabitStore, HabitItem } from '@/store/useHabitStore';
import {
  Sun,
  Brain,
  Moon,
  Zap,
  Check,
  Plus,
  ArrowLeft,
  ChevronRight,
  Info,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ProtocolBlueprint {
  id: string;
  name: string;
  shortSummary: string;
  category: 'Morning' | 'Focus' | 'Sleep' | 'Movement';
  icon: 'sun' | 'brain' | 'moon' | 'zap';
  iconColor: string;
  timeframe: string;
  habits: { title: string; hint: string }[];
  standardHabits: HabitItem[];
  whyItWorks: string;
  deepScience: string[];
}

const CURATED_PROTOCOLS: ProtocolBlueprint[] = [
  {
    id: 'morning-activation',
    name: 'Morning Light & Energy',
    shortSummary: 'Sets your internal clock and clears morning grogginess in 15 minutes.',
    category: 'Morning',
    icon: 'sun',
    iconColor: 'text-amber-300',
    timeframe: 'First 30m of your day',
    habits: [
      { title: '15m outdoor morning sunlight', hint: 'No sunglasses' },
      { title: '500ml water + pinch of sea salt', hint: 'Immediate hydration' },
      { title: '60s cold rinse or face splash', hint: 'Awakening reflex' },
    ],
    standardHabits: [
      { id: 'sunlight', title: 'Morning Sunlight Exposure (15m)', category: 'morning', targetDaysPerWeek: 7 },
      { id: 'hydration_morning', title: '500ml Water + Electrolytes', category: 'nutrition', targetDaysPerWeek: 7 },
      { id: 'cold_rinse', title: 'Cold Shower or Face Splash', category: 'recovery', targetDaysPerWeek: 6 },
    ],
    whyItWorks: 'Early natural light triggers retinal cells to set your 16-hour sleep-wake timer and boost daytime alertness.',
    deepScience: [
      'Morning photon exposure stimulates melanopsin retinal ganglion cells, synchronizing the suprachiasmatic nucleus (SCN).',
      'Hydration with sodium supports cellular osmolarity and eliminates morning brain fog caused by mild overnight dehydration.',
      'Cold thermal stimulation triggers mild epinephrine release, elevating baseline heart rate and mental clarity.',
    ],
  },
  {
    id: 'cognitive-flow',
    name: 'Deep Focus Sprint',
    shortSummary: 'Protects your attention for high-leverage creative and deep work.',
    category: 'Focus',
    icon: 'brain',
    iconColor: 'text-sky-300',
    timeframe: 'Morning to Early Afternoon',
    habits: [
      { title: 'Zero phone input first 30 mins', hint: 'Avoid reactive mode' },
      { title: 'High-protein breakfast (35g+)', hint: 'Steady dopamine' },
      { title: '90-min uninterrupted work block', hint: 'Single-tasking only' },
    ],
    standardHabits: [
      { id: 'zero_phone', title: 'Zero Phone First 30 Mins', category: 'mindset', targetDaysPerWeek: 7 },
      { id: 'protein_breakfast', title: 'High-Protein Breakfast (35g+)', category: 'nutrition', targetDaysPerWeek: 7 },
      { id: 'deep_sprint', title: '90-Min Focus Sprint', category: 'mindset', targetDaysPerWeek: 5 },
    ],
    whyItWorks: 'Eliminating notifications and stabilizing blood sugar preserves executive function and keeps dopamine baseline high.',
    deepScience: [
      'Preventing context switching protects prefrontal cortex working memory from cognitive fragmentation.',
      'Sustained amino acid availability provides precursor tyrosine for continuous dopamine and norepinephrine synthesis.',
      '90-minute ultradian cycles align naturally with human brain wave rhythms for peak focus.',
    ],
  },
  {
    id: 'deep-rem-sleep',
    name: 'Restful Sleep Architecture',
    shortSummary: 'Calms your nervous system for deeper slow-wave and REM sleep.',
    category: 'Sleep',
    icon: 'moon',
    iconColor: 'text-indigo-300',
    timeframe: '60 mins before bed',
    habits: [
      { title: 'Screens off 60 mins before bed', hint: 'Digital sunset' },
      { title: 'Cool room temperature (~67°F)', hint: 'Thermal trigger' },
      { title: 'Magnesium glycinate or herbal tea', hint: 'Nervous down-regulation' },
    ],
    standardHabits: [
      { id: 'digital_sunset', title: 'Digital Sunset (Screens Off 60m Prior)', category: 'recovery', targetDaysPerWeek: 7 },
      { id: 'ambient_temp', title: 'Cool Dark Bedroom (67°F)', category: 'recovery', targetDaysPerWeek: 7 },
      { id: 'magnesium_glycine', title: 'Magnesium / Evening Herbal Tea', category: 'recovery', targetDaysPerWeek: 6 },
    ],
    whyItWorks: 'Cutting blue light allows natural melatonin release, while a cool room signals your body to enter deep Stage 4 sleep.',
    deepScience: [
      'Removing 460nm blue light wavelengths allows uninhibited pineal gland melatonin secretion.',
      'A 1–2°F drop in core body temperature is biologically required to transition into restorative delta sleep.',
      'Magnesium acts as an agonist for calming GABA receptors, easing somatic muscle tension.',
    ],
  },
  {
    id: 'anabolic-glycogen',
    name: 'Strength & Muscle Fuel',
    shortSummary: 'Supplies essential protein and fluids to maximize recovery and energy.',
    category: 'Movement',
    icon: 'zap',
    iconColor: 'text-emerald-300',
    timeframe: 'Daily Fueling & Training',
    habits: [
      { title: '130g+ daily whole-food protein', hint: 'Muscle synthesis' },
      { title: '30-45 mins resistance or cardio', hint: 'Physical stimulus' },
      { title: '2.5L to 3.0L water intake', hint: 'Hydration standard' },
    ],
    standardHabits: [
      { id: 'protein_target', title: 'Hit Daily Protein Target (130g+)', category: 'nutrition', targetDaysPerWeek: 7 },
      { id: 'zone2_resistance', title: '30-45 Min Resistance or Cardio', category: 'movement', targetDaysPerWeek: 5 },
      { id: 'hydration_3l', title: 'Hit 2.5L+ Hydration Target', category: 'nutrition', targetDaysPerWeek: 7 },
    ],
    whyItWorks: 'Consistent amino acid intake combined with regular movement maintains lean muscle mass and steady metabolic rate.',
    deepScience: [
      'Evenly distributed leucine doses (3g+) trigger mTOR pathways for continuous muscle repair.',
      'Adequate cellular hydration optimizes intracellular pressure, preventing workout fatigue and cramps.',
      'Resistance training improves insulin sensitivity and glucose uptake into skeletal muscle.',
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
    activeProtocolIds,
    activateProtocol,
    userSession,
    setPendingAction,
  } = useHabitStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggleProtocol = (protocol: ProtocolBlueprint) => {
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
    <div className="min-h-screen bg-[#080808] text-neutral-100 selection:bg-white selection:text-black flex flex-col">
      {/* Background Radial Glow */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(circle at 50% 8%, rgba(255, 255, 255, 0.025) 0%, transparent 55%)
          `,
        }}
      />

      <HeaderNav />

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-6 lg:px-8 pt-36 sm:pt-40 pb-24">
        
        {/* Navigation Strip */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-mono px-3.5 py-1.5 rounded-full border border-white/10 bg-white text-black font-semibold hover:bg-neutral-200 transition-all shadow-sm"
          >
            <span>Daily Checklist</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Clear, Human Hero */}
        <div className="max-w-2xl mb-8">
          <h1 className="font-serif font-normal text-3xl sm:text-4xl text-white tracking-tight">
            Daily Protocols
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base mt-2 font-sans leading-relaxed">
            Curated daily routines calibrated for focus, sleep, and physical energy. One tap adds them to your daily checklist.
          </p>
        </div>

        {/* Segmented Filter Bar */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/10 mb-8 overflow-x-auto scrollbar-none w-fit">
          {(['All', 'Morning', 'Focus', 'Sleep', 'Movement'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === cat
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Distilled Protocol Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProtocols.map((protocol) => {
            const isActive = mounted && activeProtocolIds.includes(protocol.id);

            return (
              <div
                key={protocol.id}
                className={`backdrop-blur-xl rounded-3xl p-6 sm:p-7 border transition-all duration-200 flex flex-col justify-between shadow-xl ${
                  isActive
                    ? 'bg-white/[0.04] border-white/25 ring-1 ring-white/20'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.03]'
                }`}
              >
                <div>
                  {/* Card Header: Icon + Title + Category Pill */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white flex-shrink-0">
                        {protocol.icon === 'sun' && <Sun className={`w-5 h-5 ${protocol.iconColor}`} />}
                        {protocol.icon === 'brain' && <Brain className={`w-5 h-5 ${protocol.iconColor}`} />}
                        {protocol.icon === 'moon' && <Moon className={`w-5 h-5 ${protocol.iconColor}`} />}
                        {protocol.icon === 'zap' && <Zap className={`w-5 h-5 ${protocol.iconColor}`} />}
                      </div>

                      <div>
                        <h2 className="font-serif font-normal text-xl text-white tracking-tight leading-snug">
                          {protocol.name}
                        </h2>
                        <span className="text-[11px] font-mono text-neutral-500">
                          {protocol.timeframe}
                        </span>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase text-neutral-300">
                      {protocol.category}
                    </span>
                  </div>

                  {/* 1-Line Benefit */}
                  <p className="text-xs text-neutral-300 font-sans mb-5 leading-relaxed">
                    {protocol.shortSummary}
                  </p>

                  {/* Clean, Flat Habit Checklist (Zero Card-in-Card Nesting) */}
                  <div className="space-y-2 mb-6">
                    {protocol.habits.map((h, idx) => (
                      <div key={idx} className="flex items-baseline gap-2.5 text-xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-white/40 flex-shrink-0 mt-1.5" />
                        <div className="flex items-baseline gap-2 flex-1">
                          <span className="text-neutral-200 font-sans">{h.title}</span>
                          <span className="text-neutral-400/80 font-mono text-[10px] tracking-tight">({h.hint})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer: Details Link + High-Contrast CTA */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedProtocolForModal(protocol)}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Why it works</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleProtocol(protocol)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-transparent text-emerald-500 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/40'
                        : 'bg-white text-black hover:bg-neutral-200 shadow-sm'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Routine</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </main>

      {/* Progressive Disclosure Modal: Science & Details */}
      {selectedProtocolForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedProtocolForModal(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          <div className="relative z-10 w-full max-w-lg rounded-3xl bg-[#0e131b] border border-white/15 p-6 sm:p-8 shadow-2xl flex flex-col gap-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                  {selectedProtocolForModal.category} Protocol
                </span>
                <h2 className="font-serif font-normal text-2xl text-white tracking-tight mt-0.5">
                  {selectedProtocolForModal.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProtocolForModal(null)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Core Biological Mechanism */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <span className="text-xs font-mono text-white font-medium block mb-1">
                The Science in Plain English:
              </span>
              <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                {selectedProtocolForModal.whyItWorks}
              </p>
            </div>

            {/* Detailed Bullet Points */}
            <div className="space-y-2.5">
              <span className="text-xs font-mono uppercase text-neutral-400 block">
                Biological Mechanisms:
              </span>
              {selectedProtocolForModal.deepScience.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-300 font-sans leading-relaxed">
                  <Sparkles className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0 mt-0.5" />
                  <span>{point}</span>
                </div>
              ))}
            </div>

            {/* Action inside Modal */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400">
                Target: {selectedProtocolForModal.timeframe}
              </span>
              <button
                type="button"
                onClick={() => {
                  handleToggleProtocol(selectedProtocolForModal);
                  setSelectedProtocolForModal(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all cursor-pointer shadow-md"
              >
                {activeProtocolIds.includes(selectedProtocolForModal.id)
                  ? 'Remove from Routines'
                  : 'Add to My Daily Routine'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="px-4 py-3 rounded-2xl bg-white text-black font-sans text-xs font-medium shadow-2xl flex items-center gap-2.5 border border-white/20">
            <Check className="w-4 h-4 text-black" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 px-6 text-center text-xs text-neutral-500 font-mono">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-medium text-white tracking-tight">Cyath</span>
            <span>— Pixel-Perfect Health</span>
          </div>
          <div>Built with Next.js, Supabase & Tailwind CSS</div>
        </div>
      </footer>
    </div>
  );
}
