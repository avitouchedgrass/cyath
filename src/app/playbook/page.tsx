'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CURATED_PROTOCOLS, ProtocolBlueprint } from '@/lib/protocols';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { Plus, Check, Clock, Zap, Bot, Activity, Flame } from 'lucide-react';

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProtocols.map((proto) => {
                const isActive = activeProtocolIds.includes(proto.id);

                return (
                  <div
                    key={proto.id}
                    className={`rounded-3xl border p-6 transition-all flex flex-col justify-between gap-5 shadow-[0_2px_12px_rgba(26,54,41,0.03)] ${
                      isActive
                        ? 'border-[#1A3629] bg-[#FAF8F5]'
                        : 'border-[#1A3629]/10 bg-[#FFFDF9] hover:border-[#1A3629]/25'
                    }`}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-md border border-[#1A3629]/30 bg-[#FAF6EE] text-[10px] font-mono font-bold uppercase tracking-wider text-[#1A3629]">
                          {proto.category} Protocol
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md border border-[#10B981]/40 bg-[#ECFDF5] text-[10px] font-mono font-bold text-[#065F46]">
                          +50 XP ON COMPLETION
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <h3 className="font-cabinet font-extrabold text-xl text-[#1A3629] tracking-tight">
                          {proto.name}
                        </h3>
                        <p className="font-sans text-xs text-[#4A5D4E] leading-relaxed">
                          {proto.shortSummary}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 font-mono text-xs text-[#4A5D4E]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{proto.timeframe}</span>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-600" />
                          <span>Calibrated Anchor</span>
                        </span>
                      </div>

                      {/* Habits Included in Protocol */}
                      <div className="flex flex-col gap-2 pt-2 border-t border-[#1A3629]/10">
                        <span className="font-cabinet font-bold text-xs text-[#1A3629]">
                          Protocol Anchors ({proto.habits.length}):
                        </span>
                        <div className="flex flex-col gap-1.5">
                          {proto.habits.map((h, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF8F5] border border-[#1A3629]/8 text-xs font-mono text-[#1A3629]"
                            >
                              <span className="w-4 h-4 rounded-full bg-[#1A3629]/10 flex items-center justify-center text-[10px] font-bold text-[#1A3629]">
                                {idx + 1}
                              </span>
                              <span className="font-bold">{h.title}</span>
                              <span className="text-[10px] text-[#4A5D4E] ml-auto">({h.hint})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#1A3629]/15 flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#1A3629]/70">
                        {proto.habits.length} Actions · Steady Focus
                      </span>

                      <button
                        type="button"
                        onClick={(e) => handleToggleProtocol(proto, e)}
                        className={`px-4 py-2 rounded-full font-cabinet font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                          isActive
                            ? 'bg-[#1A3629] text-[#FFFDF9]'
                            : 'bg-[#FAF8F5] border border-[#1A3629]/15 text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9]'
                        }`}
                      >
                        {isActive ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Active in Cockpit</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Cockpit</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Floating AI Assistant Action */}
        <div className="fixed bottom-6 right-6 z-40">
          <button
            type="button"
            onClick={() => {
              retroAudio.playInspectConfirm();
              window.dispatchEvent(new CustomEvent('open-ai-coach'));
            }}
            className="px-4 py-2.5 rounded-full border border-[#1A3629]/15 bg-[#1A3629] hover:bg-[#2C4A3B] text-[#FFFDF9] font-cabinet font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center gap-2 select-none"
          >
            <Bot className="w-4 h-4 text-[#C9A84C]" />
            <span>Ask Sanctuary Guide AI</span>
          </button>
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
