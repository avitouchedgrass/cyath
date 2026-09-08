'use client';

import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SiteFooter } from '@/components/landing/SiteFooter';
import { ProtocolBlueprint, CURATED_PROTOCOLS } from '@/lib/protocols';

export default function ProtocolsPage() {
  const router = useRouter();
  const { activeProtocolIds, activateProtocol, userSession, setPendingAction } = useHabitStore();
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Morning' | 'Focus' | 'Sleep' | 'Movement'>('All');
  const [selectedProtocolForModal, setSelectedProtocolForModal] = useState<ProtocolBlueprint | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredProtocols = CURATED_PROTOCOLS.filter((p) => {
    if (selectedFilter === 'All') return true;
    return p.category === selectedFilter;
  });

  const handleToggleProtocol = (protocol: ProtocolBlueprint) => {
    retroAudio.playInspectConfirm();

    if (!userSession) {
      setPendingAction({
        type: 'ACTIVATE_PROTOCOL',
        payload: { protocolId: protocol.id },
        returnUrl: '/protocols',
      });
      router.push('/login?redirect=/protocols');
      return;
    }

    const isAlreadyActive = activeProtocolIds.includes(protocol.id);
    activateProtocol(protocol.id, protocol.standardHabits);

    setToastMessage(
      isAlreadyActive
        ? `Removed ${protocol.name} from your planner.`
        : `Added ${protocol.name} to your Daily Planner!`
    );

    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="min-h-screen bg-[#F4F0EA] text-[#1A3629] transition-colors duration-300 flex flex-col selection:bg-[#1A3629] selection:text-[#FFFDF9]">
      {/* Navigation Header */}
      <HeaderNav />

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-12 pt-28 pb-20">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-4">
          <Breadcrumbs items={[{ label: 'Guided Routines' }]} />
        </div>

        {/* Header Title Section */}
        <div className="mb-8 border-b-2 border-[#1A3629]/15 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-fraunces font-black text-3xl sm:text-4xl tracking-tight text-[#1A3629]">
              Circadian Health Protocols &amp; Guided Routines
            </h1>
            <p className="text-sm sm:text-base font-cabinet font-medium mt-1 leading-relaxed text-[#2C4A3B]">
              Science-backed daily habit routines for morning energy, deep focus, and better sleep.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1 rounded-xl border-2 border-[#1A3629]/20 bg-[#FFFDF9] text-[11px] font-mono font-bold text-[#1A3629]">
              {activeProtocolIds.length} of {CURATED_PROTOCOLS.length} Active
            </span>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1 scrollbar-none">
          <div className="inline-flex items-center gap-1.5 p-1 rounded-xl border-2 bg-[#FFFDF9] border-[#1A3629]/25 shadow-[2px_2px_0px_#1A3629]">
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
                      ? 'bg-[#1A3629] text-[#FFFDF9] shadow-[1px_1px_0px_#3A6B52]'
                      : 'text-[#2C4A3B] hover:text-[#1A3629]'
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
                className="border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[5px_5px_0px_#1A3629] rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5"
              >
                <div>
                  {/* Top Row: Icon Badge & Category Tag */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl border-2 bg-[#F4F0EA] border-[#1A3629] text-[#1A3629] flex items-center justify-center shadow-xs">
                        {getIcon()}
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-md border text-[10px] font-mono font-bold uppercase tracking-wider ${protocol.themeColor.badgeBg} ${protocol.themeColor.badgeText} ${protocol.themeColor.border}`}>
                        {protocol.category} Routine
                      </span>
                    </div>

                    {isActivated ? (
                      <span className="px-2.5 py-1 rounded-full border-2 bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] text-[10px] font-mono font-bold uppercase flex items-center gap-1 shadow-xs">
                        <Check className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-[#4A5D4E]">
                        {protocol.timeframe}
                      </span>
                    )}
                  </div>

                  {/* Title & Short Summary */}
                  <h3 className="font-fraunces font-black text-2xl tracking-tight leading-snug mb-1.5 text-[#1A3629]">
                    {protocol.name}
                  </h3>
                  <p className="text-xs sm:text-sm font-cabinet font-medium leading-relaxed mb-5 text-[#2C4A3B]">
                    {protocol.shortSummary}
                  </p>

                  {/* Daily Habits Checklist Preview */}
                  <div className="space-y-2 mb-6">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#4A5D4E] block mb-1">
                      Daily Habits:
                    </span>
                    {protocol.habits.map((habit, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-[#1A3629]/20 bg-[#FAF6EE] text-xs font-cabinet font-bold"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-[#3A6B52] font-black">●</span>
                          <span>{habit.title}</span>
                        </div>
                        <span className="text-[10px] font-mono font-normal text-[#4A5D4E]">
                          {habit.hint}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions Row */}
                <div className="pt-4 border-t-2 border-[#1A3629]/15 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      retroAudio.playBlip();
                      setSelectedProtocolForModal(protocol);
                    }}
                    className="text-xs font-mono font-bold hover:underline flex items-center gap-1 cursor-pointer text-[#1A3629]"
                  >
                    <span>Why it Works</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleProtocol(protocol)}
                    className={`px-4 py-2.5 rounded-xl border-2 text-xs font-cabinet font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isActivated
                        ? 'bg-[#E8DECF] text-[#1A3629] border-[#1A3629]'
                        : 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-[3px_3px_0px_#3A6B52] hover:-translate-y-0.5'
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
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl border-3 border-[#1A3629] bg-[#FFFDF9] text-[#1A3629] shadow-[4px_4px_0px_#1A3629] flex items-center gap-2 font-cabinet font-bold text-xs">
          <Sparkles className="w-4 h-4 text-[#10B981]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Blueprint Detail Modal */}
      {selectedProtocolForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedProtocolForModal(null)}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          <div className="relative z-10 w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl border-4 border-[#1A3629] bg-[#FFFDF9] p-6 sm:p-8 shadow-2xl flex flex-col gap-6 scrollbar-none">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedProtocolForModal(null)}
              className="absolute right-6 top-6 rounded-full p-2 border-2 border-[#1A3629] bg-[#F4F0EA] text-[#1A3629] transition-all cursor-pointer hover:bg-[#E8DECF]"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className={`px-2.5 py-0.5 rounded-md border text-[10px] font-mono font-bold uppercase tracking-wider inline-block mb-2 ${selectedProtocolForModal.themeColor.badgeBg} ${selectedProtocolForModal.themeColor.badgeText} ${selectedProtocolForModal.themeColor.border}`}>
                {selectedProtocolForModal.category} Routine
              </span>
              <h2 className="font-fraunces font-black text-2xl sm:text-3xl tracking-tight text-[#1A3629]">
                {selectedProtocolForModal.name}
              </h2>
            </div>

            {/* Why It Works Section */}
            <div className="p-4 rounded-xl border-2 border-[#1A3629]/20 bg-[#F4F0EA]">
              <h4 className="font-cabinet font-bold text-xs uppercase tracking-wider mb-1 text-[#4A5D4E]">
                The Science in Plain English
              </h4>
              <p className="text-xs sm:text-sm font-cabinet font-medium leading-relaxed text-[#1A3629]">
                {selectedProtocolForModal.whyItWorks}
              </p>
            </div>

            {/* Key Takeaways */}
            <div className="space-y-2.5">
              <h4 className="font-cabinet font-bold text-xs uppercase tracking-wider text-[#4A5D4E]">
                Key Routine Principles
              </h4>
              {selectedProtocolForModal.simpleHighlights.map((hl, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs font-cabinet font-medium leading-relaxed">
                  <span className="font-mono text-xs font-bold shrink-0 mt-0.5 text-[#3A6B52]">+</span>
                  <span>{hl}</span>
                </div>
              ))}
            </div>

            {/* Modal Bottom CTA */}
            <div className="pt-4 border-t-2 border-[#1A3629]/15">
              <button
                type="button"
                onClick={() => {
                  handleToggleProtocol(selectedProtocolForModal);
                  setSelectedProtocolForModal(null);
                }}
                className={`w-full py-3.5 px-6 rounded-xl border-3 font-cabinet font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeProtocolIds.includes(selectedProtocolForModal.id)
                    ? 'bg-[#E8DECF] text-[#1A3629] border-[#1A3629]'
                    : 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-[3px_3px_0px_#3A6B52] hover:-translate-y-0.5'
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
                    <span>Add Habits to Daily Planner</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
      <SiteFooter />
    </div>
  );
}
