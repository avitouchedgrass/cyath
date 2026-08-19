'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { useHabitStore, HabitItem } from '@/store/useHabitStore';
import {
  Sparkles,
  Zap,
  Moon,
  Flame,
  Check,
  Plus,
  ArrowLeft,
  ShieldCheck,
  Clock,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface ProtocolBlueprint {
  id: string;
  name: string;
  tagline: string;
  category: 'Morning' | 'Cognitive' | 'Sleep' | 'Physical';
  iconName: 'zap' | 'sparkles' | 'moon' | 'flame';
  difficulty: 'Essential' | 'Advanced' | 'Peak';
  adherenceRate: number;
  timeframe: string;
  habits: HabitItem[];
  principles: string[];
  scienceNote: string;
}

const CURATED_PROTOCOLS: ProtocolBlueprint[] = [
  {
    id: 'morning-activation',
    name: 'Morning Sunlight & Dopamine Activation',
    tagline: 'Lock circadian rhythm and trigger natural cortisol awakening spike',
    category: 'Morning',
    iconName: 'zap',
    difficulty: 'Essential',
    adherenceRate: 92,
    timeframe: 'First 30 mins after waking',
    habits: [
      { id: 'sunlight', title: 'Morning Sunlight Exposure (10–15m)', category: 'morning', targetDaysPerWeek: 7 },
      { id: 'hydration_morning', title: '500ml Filtered Water + Pinch of Sea Salt', category: 'nutrition', targetDaysPerWeek: 7 },
      { id: 'cold_rinse', title: 'Cold Shower or Face Rinse (60s)', category: 'recovery', targetDaysPerWeek: 6 },
    ],
    principles: [
      'Early optical photons trigger melanopsin retinal ganglion cells to set the 16-hour melatonin countdown clock.',
      'Front-loading electrolytes prevents intracellular morning dehydration and grogginess.',
    ],
    scienceNote: 'Correlates with a +2.4 pt average increase in subjective morning alertness across 14-day logs.',
  },
  {
    id: 'cognitive-flow',
    name: 'Deep Cognitive Flow Architecture',
    tagline: 'Preserve dopamine receptors for prolonged alpha-wave output',
    category: 'Cognitive',
    iconName: 'sparkles',
    difficulty: 'Advanced',
    adherenceRate: 84,
    timeframe: '9:00 AM – 1:00 PM',
    habits: [
      { id: 'zero_phone', title: 'Zero Smartphone / Social Input First 30 Mins', category: 'mindset', targetDaysPerWeek: 7 },
      { id: 'protein_breakfast', title: '35g+ High-Bioavailability Protein Fuel', category: 'nutrition', targetDaysPerWeek: 7 },
      { id: 'deep_sprint', title: '90-Min Uninterrupted Focus Sprint', category: 'mindset', targetDaysPerWeek: 5 },
    ],
    principles: [
      'Eliminating reactive notifications preserves prefrontal cortex working memory bandwidth.',
      'Sustained amino-acid plasma levels avoid mid-morning glycemic crashes.',
    ],
    scienceNote: 'Correlates with an 88% probability of reaching state 9+ focus ratings.',
  },
  {
    id: 'deep-rem-sleep',
    name: 'Deep REM Sleep Architecture',
    tagline: 'Maximize slow-wave delta cycles and neural memory consolidation',
    category: 'Sleep',
    iconName: 'moon',
    difficulty: 'Essential',
    adherenceRate: 89,
    timeframe: '60 mins prior to sleep',
    habits: [
      { id: 'digital_sunset', title: 'Digital Sunset (Screens Off 60m Prior)', category: 'recovery', targetDaysPerWeek: 7 },
      { id: 'ambient_temp', title: '67°F Ambient Room Temp & Dark Environment', category: 'recovery', targetDaysPerWeek: 7 },
      { id: 'magnesium_glycine', title: 'Magnesium Glycinate / Herbal Evening Tea', category: 'recovery', targetDaysPerWeek: 6 },
    ],
    principles: [
      'Removing 460nm blue wavelengths allows endogenic melatonin synthesis to reach peak biological curve.',
      'Core body temperature drop of 1–2°F is mathematically required to initiate deep Stage 4 NREM sleep.',
    ],
    scienceNote: 'Users executing Digital Sunset record 42 more minutes of self-reported restful sleep per night.',
  },
  {
    id: 'anabolic-glycogen',
    name: 'Anabolic & Glycogen Synthesis',
    tagline: 'Optimize muscle protein synthesis and post-training muscular reload',
    category: 'Physical',
    iconName: 'flame',
    difficulty: 'Peak',
    adherenceRate: 78,
    timeframe: 'Daily Nutrition & Training',
    habits: [
      { id: 'protein_target', title: '130g+ Daily Whole-Food Protein Target', category: 'nutrition', targetDaysPerWeek: 7 },
      { id: 'zone2_resistance', title: 'Heavy Compound Lift or Zone 2 Aerobics', category: 'movement', targetDaysPerWeek: 5 },
      { id: 'hydration_3l', title: '3.0L Hydration with Optimal Trace Minerals', category: 'nutrition', targetDaysPerWeek: 7 },
    ],
    principles: [
      'Evenly spaced 35g–45g leucine boluses maintain positive nitrogen balance for tissue repair.',
      'Cellular hydration drives muscle intracellular water pressure and nutrient partitioning.',
    ],
    scienceNote: 'High-protein compliance correlates directly with higher physical vigor ratings (+34%).',
  },
];

export default function ProtocolsPage() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Morning' | 'Cognitive' | 'Sleep' | 'Physical'>('All');
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<HabitItem['category']>('mindset');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const {
    activeProtocolIds,
    activateProtocol,
    addCustomHabit,
    userSession,
    setPendingAction,
  } = useHabitStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggleProtocol = (protocol: ProtocolBlueprint) => {
    // Auth Gateway Check: If user is not signed in, save intent and redirect to login
    if (!userSession) {
      setPendingAction({
        type: 'ACTIVATE_PROTOCOL',
        payload: { protocolId: protocol.id, habitsToAdd: protocol.habits },
        returnUrl: '/protocols',
      });
      router.push('/login?redirect=/protocols');
      return;
    }

    const isCurrentlyActive = activeProtocolIds.includes(protocol.id);
    activateProtocol(protocol.id, protocol.habits);

    setToastMessage(
      isCurrentlyActive
        ? `Deactivated ${protocol.name}`
        : `Activated ${protocol.name}! Added standard habits to your daily checklist.`
    );
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateCustomHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;

    if (!userSession) {
      setPendingAction({
        type: 'TOGGLE_HABIT',
        payload: { habitId: `custom_${Date.now()}` },
        returnUrl: '/protocols',
      });
      router.push('/login?redirect=/protocols');
      return;
    }

    addCustomHabit(newHabitTitle.trim(), newHabitCategory);
    setNewHabitTitle('');
    setShowCustomModal(false);
    setToastMessage(`Custom habit standard created!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredProtocols = CURATED_PROTOCOLS.filter(
    (p) => selectedFilter === 'All' || p.category === selectedFilter
  );

  return (
    <div className="min-h-screen bg-[#080808] text-neutral-100 selection:bg-white selection:text-black flex flex-col">
      {/* Subtle Ambient Radial Highlight */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(circle at 50% 10%, rgba(255, 255, 255, 0.02) 0%, transparent 60%)
          `,
        }}
      />

      <HeaderNav />

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 lg:px-12 pt-28 sm:pt-32 pb-24">
        
        {/* Navigation & Header Strip */}
        <div className="flex items-center justify-between mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowCustomModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-xs font-mono text-neutral-300 hover:text-white transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Custom Standard</span>
            </button>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-mono px-4 py-1.5 rounded-full border border-white/10 bg-white text-black font-semibold hover:bg-neutral-200 transition-all shadow-sm"
            >
              <span>View Daily Console</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Hero Header */}
        <div className="max-w-3xl mb-12">
          <h1 className="font-serif font-normal text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            Protocol Blueprints
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base mt-3 leading-relaxed font-sans max-w-2xl">
            Curated behavioral architectures designed from human biology. Activate proven stacks to structure your daily standards and unlock high-signal momentum.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/10 mb-8 overflow-x-auto scrollbar-none w-fit">
          {(['All', 'Morning', 'Cognitive', 'Sleep', 'Physical'] as const).map((cat) => (
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

        {/* Protocols Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {filteredProtocols.map((protocol) => {
            const isActive = mounted && activeProtocolIds.includes(protocol.id);

            return (
              <div
                key={protocol.id}
                className={`backdrop-blur-xl rounded-3xl p-6 sm:p-8 border transition-all duration-300 flex flex-col justify-between shadow-xl relative overflow-hidden ${
                  isActive
                    ? 'bg-white/[0.04] border-white/30 ring-1 ring-white/20'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.03]'
                }`}
              >
                <div>
                  {/* Top Badges & Telemetry */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono uppercase text-neutral-300">
                        {protocol.category}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400">
                        {protocol.difficulty} Standard
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-300">
                      <TrendingUp className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{protocol.adherenceRate}% Global Adherence</span>
                    </div>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start gap-4 mb-3">
                    <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white flex-shrink-0 mt-1">
                      {protocol.iconName === 'zap' && <Zap className="h-5 w-5" />}
                      {protocol.iconName === 'sparkles' && <Sparkles className="h-5 w-5" />}
                      {protocol.iconName === 'moon' && <Moon className="h-5 w-5" />}
                      {protocol.iconName === 'flame' && <Flame className="h-5 w-5" />}
                    </div>

                    <div>
                      <h2 className="font-serif font-normal text-xl sm:text-2xl text-white tracking-tight leading-snug">
                        {protocol.name}
                      </h2>
                      <p className="text-neutral-400 text-xs font-sans mt-1 leading-relaxed">
                        {protocol.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Timing Pill */}
                  <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400 mb-6 bg-white/[0.02] px-3 py-1.5 rounded-xl border border-white/5 w-fit">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Target Execution: {protocol.timeframe}</span>
                  </div>

                  {/* Component Habits Standard List */}
                  <div className="space-y-2.5 mb-6">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block">
                      Enforced Habit Standards ({protocol.habits.length}):
                    </span>
                    {protocol.habits.map((habit, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs font-sans text-neutral-200"
                      >
                        <ShieldCheck className="w-4 h-4 text-white flex-shrink-0" />
                        <span className="flex-1">{habit.title}</span>
                        <span className="text-[10px] font-mono text-neutral-500 uppercase">{habit.category}</span>
                      </div>
                    ))}
                  </div>

                  {/* Science Note */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs font-sans text-neutral-400 mb-6 leading-relaxed">
                    <strong className="text-white font-mono font-medium">Biological Driver: </strong>
                    {protocol.scienceNote}
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                  <div className="text-xs font-mono text-neutral-400">
                    Status: <span className={isActive ? 'text-emerald-400 font-semibold' : 'text-neutral-500'}>{isActive ? 'Active on Dashboard' : 'Inactive'}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleProtocol(protocol)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white/10 text-white border border-white/20 hover:bg-white/15'
                        : 'bg-white text-black hover:bg-neutral-200 shadow-md'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Active Stack</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Activate Protocol</span>
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
          <div className="px-4 py-3 rounded-2xl bg-white text-black font-sans text-xs font-medium shadow-2xl flex items-center gap-2.5 border border-white/20">
            <Check className="w-4 h-4 text-black" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Create Custom Standard Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setShowCustomModal(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          <div className="relative z-10 w-full max-w-md rounded-3xl bg-[#080808] border border-white/15 p-6 sm:p-8 shadow-2xl flex flex-col gap-6">
            <div>
              <h2 className="font-serif font-normal text-2xl text-white tracking-tight">
                Create Custom Standard
              </h2>
              <p className="text-neutral-400 text-xs mt-1 font-sans">
                Define a high-signal routine item to track in your daily protocol.
              </p>
            </div>

            <form onSubmit={handleCreateCustomHabit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-neutral-300 mb-1.5 uppercase">
                  Habit Title / Protocol Rule
                </label>
                <input
                  type="text"
                  required
                  value={newHabitTitle}
                  onChange={(e) => setNewHabitTitle(e.target.value)}
                  placeholder="e.g. 20-Min Zone 2 Ruck with 20lb pack"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-white/30 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 mb-1.5 uppercase">
                  Category Tag
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['morning', 'nutrition', 'movement', 'recovery', 'mindset'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewHabitCategory(cat)}
                      className={`p-2 rounded-xl text-xs font-mono capitalize transition-all cursor-pointer ${
                        newHabitCategory === cat
                          ? 'bg-white text-black font-semibold'
                          : 'bg-white/5 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-neutral-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all cursor-pointer"
                >
                  Add Standard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 px-6 text-center text-xs text-neutral-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
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
