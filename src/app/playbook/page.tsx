'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CURATED_PROTOCOLS, ProtocolBlueprint } from '@/lib/protocols';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { Plus, Check, Clock, Zap, Activity, Flame } from 'lucide-react';

const PROTOCOL_CATEGORIES = ['All', 'Morning', 'Focus', 'Sleep', 'Movement'] as const;

function PlaybookContent() {
  const [protocolFilter, setProtocolFilter] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const {
    activeProtocolIds,
    activateProtocol,
    gainXp,
  } = useHabitStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filtered protocols
  const filteredProtocols = useMemo(() => {
    if (protocolFilter === 'All') return CURATED_PROTOCOLS;
    return CURATED_PROTOCOLS.filter((p) => p.category === protocolFilter);
  }, [protocolFilter]);

  const handleToggleProtocol = (protocol: ProtocolBlueprint, e?: React.MouseEvent) => {
    retroAudio.playInspectConfirm();
    haptics.tap();

    const isAlreadyActive = activeProtocolIds.includes(protocol.id);
    activateProtocol(protocol.id, protocol.standardHabits);

    if (!isAlreadyActive) {
      gainXp(50, 'Activated Focus Protocol', 'protocol');
    }

    setToastMessage(
      isAlreadyActive
        ? `Removed ${protocol.name} from Daily Cockpit.`
        : `Added ${protocol.name} to Daily Cockpit (+50 XP)!`
    );

    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F4F0EA] text-[#1A3629] flex flex-col selection:bg-[#1A3629] selection:text-[#FFFDF9]">
      <HeaderNav />

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24 flex flex-col gap-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ label: 'Playbook' }]} />

        {/* Master Playbook Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A3629]/10 pb-4">
          <div>
            <h1 className="font-cabinet font-extrabold text-3xl md:text-4xl tracking-tight text-[#1A3629]">
              Focus &amp; Circadian Playbook
            </h1>
            <p className="font-sans text-xs sm:text-sm text-[#4A5D4E] mt-0.5">
              Behavioral protocols, cognitive cadence, and restorative routines for deep work stamina.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFFDF9] border border-[#1A3629]/15 shadow-2xs font-mono text-xs font-bold text-[#1A3629]">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>{activeProtocolIds.length} Active in Cockpit</span>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#1A3629] text-[#FFFDF9] px-4 py-2.5 rounded-full border border-[#1A3629]/15 shadow-2xs font-cabinet text-xs font-bold animate-in fade-in flex items-center gap-2">
            <span>✓</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* PROTOCOLS SECTION */}
        <div className="flex flex-col gap-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none">
            {PROTOCOL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  retroAudio.playBlip();
                  setProtocolFilter(cat);
                }}
                className={`px-4 py-2 rounded-full font-cabinet font-bold text-xs transition-all cursor-pointer shrink-0 ${
                  protocolFilter === cat
                    ? 'bg-[#1A3629] text-[#FFFDF9] shadow-xs'
                    : 'bg-[#FFFDF9] text-[#1A3629] border border-[#1A3629]/15 hover:bg-[#FAF8F5]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredProtocols.length === 0 ? (
            <div className="rounded-3xl border border-[#1A3629]/10 bg-[#FFFDF9] p-8 text-center flex flex-col items-center justify-center gap-3">
              <Activity className="w-8 h-8 text-[#1A3629]/30" />
              <h3 className="font-cabinet font-bold text-base text-[#1A3629]">
                No protocols found in this category
              </h3>
              <button
                type="button"
                onClick={() => setProtocolFilter('All')}
                className="px-4 py-2 rounded-full bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs hover:bg-[#2C4A3B] transition-colors cursor-pointer"
              >
                Show All Protocols
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-7">
              {filteredProtocols.map((proto, idx) => {
                const isActive = activeProtocolIds.includes(proto.id);
                const disciplineSeals: Record<string, { kanji: string; romaji: string; code: string }> = {
                  Morning: { kanji: '朝', romaji: 'DAWN CADENCE', code: '01' },
                  Focus: { kanji: '集', romaji: 'DEEP SPRINT', code: '02' },
                  Sleep: { kanji: '眠', romaji: 'RESTORATION', code: '03' },
                  Movement: { kanji: '動', romaji: 'POSTURE RESET', code: '04' },
                };
                const seal = disciplineSeals[proto.category] || { kanji: '規', romaji: 'PROTOCOL', code: `0${idx + 1}` };

                return (
                  <article
                    key={proto.id}
                    className={`rounded-3xl border-2 p-6 sm:p-7 transition-all flex flex-col justify-between gap-6 relative overflow-hidden ${
                      isActive
                        ? 'border-[#1A3629] bg-[#FAF7F0] shadow-[0_12px_36px_rgba(26,54,41,0.08)] ring-1 ring-[#1A3629]/20'
                        : 'border-[#1A3629]/15 bg-[#FFFDF9] hover:border-[#1A3629]/35 hover:shadow-[0_10px_30px_rgba(26,54,41,0.05)]'
                    }`}
                  >
                    {/* Top Architectural Header */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        {/* Woodblock Discipline Seal */}
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#C2410C]/10 border border-[#C2410C]/30 text-[#C2410C] flex items-center justify-center font-bold text-sm select-none shrink-0 shadow-2xs">
                            <span>{seal.kanji}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-mono text-[10px] font-bold tracking-widest text-[#1A3629] uppercase">
                              DOC № {seal.code} · {proto.category}
                            </span>
                            <span className="font-mono text-[9px] text-[#4A5D4E] tracking-wider uppercase">
                              {seal.romaji}
                            </span>
                          </div>
                        </div>

                        {/* Gold Wax Mint Badge */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A3629] border border-amber-400/40 text-amber-200 font-mono text-[10px] font-bold shadow-xs">
                          <span className="text-amber-400">✦</span>
                          <span>+50 XP MINT</span>
                        </div>
                      </div>

                      {/* Title & Short Summary */}
                      <div className="flex flex-col gap-1.5 pt-1">
                        <h2 className="font-cabinet font-extrabold text-2xl text-[#1A3629] tracking-tight leading-snug">
                          {proto.name}
                        </h2>
                        <p className="font-sans text-xs sm:text-[13px] text-[#2C4A3B] leading-relaxed">
                          {proto.shortSummary}
                        </p>
                      </div>

                      {/* Biological Mechanism Callout */}
                      <div className="p-3 rounded-2xl bg-[#F4EDE0]/60 border-l-4 border-[#1A3629] text-xs font-sans text-[#1A3629] leading-relaxed">
                        <span className="font-bold">Mechanism: </span>
                        <span>{proto.whyItWorks}</span>
                      </div>

                      {/* Anchor Window & Cadence */}
                      <div className="flex items-center gap-3 font-mono text-xs text-[#4A5D4E] bg-[#FFFDF9]/60 px-3 py-2 rounded-xl border border-[#1A3629]/10">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#1A3629]" />
                          <span className="font-bold text-[#1A3629]">{proto.timeframe}</span>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-600" />
                          <span>Calibrated Anchor</span>
                        </span>
                      </div>

                      {/* Protocol Anchors */}
                      <div className="flex flex-col gap-2 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="font-cabinet font-bold text-xs text-[#1A3629] uppercase tracking-wider">
                            Protocol Anchors ({proto.habits.length})
                          </span>
                          <span className="font-mono text-[10px] text-[#4A5D4E]">
                            Sequential Order
                          </span>
                        </div>

                        <div className="flex flex-col gap-2">
                          {proto.habits.map((h, stepIdx) => (
                            <div
                              key={stepIdx}
                              className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#1A3629]/10 text-xs font-mono transition-colors hover:bg-[#F4F0EA]"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="w-5 h-5 rounded-full bg-[#1A3629] text-[#FFFDF9] flex items-center justify-center text-[10px] font-bold shrink-0 shadow-2xs">
                                  {stepIdx + 1}
                                </span>
                                <span className="font-bold text-[#1A3629]">{h.title}</span>
                              </div>
                              <span className="text-[10px] font-sans font-medium text-[#4A5D4E] bg-[#FFFDF9] px-2 py-0.5 rounded-md border border-[#1A3629]/10 shrink-0">
                                {h.hint}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-[#1A3629]/15 flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5 font-mono text-xs text-[#4A5D4E]">
                        <Activity className="w-3.5 h-3.5 text-[#1A3629]" />
                        <span>{proto.habits.length} Actions · Steady Focus</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleToggleProtocol(proto, e)}
                        className={`px-5 py-2.5 rounded-2xl font-cabinet font-bold text-xs transition-all cursor-pointer flex items-center gap-2 shadow-xs select-none ${
                          isActive
                            ? 'bg-[#1A3629] text-[#FFFDF9] hover:bg-[#2C4A3B]'
                            : 'bg-[#FFFDF9] border-2 border-[#1A3629] text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9]'
                        }`}
                      >
                        {isActive ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-amber-400" />
                            <span>Inscribed in Cockpit</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Inscribe into Cockpit</span>
                          </>
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function PlaybookPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F0EA] flex items-center justify-center font-mono text-xs text-[#1A3629]">
          Loading Playbook...
        </div>
      }
    >
      <PlaybookContent />
    </Suspense>
  );
}
